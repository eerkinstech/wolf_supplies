'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import toast from 'react-hot-toast';
import RichTextEditor from '../../RichTextEditor/RichTextEditor';
import axios from 'axios';

// In dev use relative paths so Vite proxy forwards `/api` to the backend.
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper: axios request, retry against explicit backend if dev server returns HTML
const FALLBACK_API = 'http://localhost:8000';
async function axiosJsonWithFallback(method, url, config = {}) {
    const doReq = async (u) => {
        try {
            const resp = await axios({ method, url: u, ...config });
            return resp;
        } catch (err) {
            if (err.response) return err.response;
            throw err;
        }
    };

    let resp = await doReq(url);
    const ct = (resp && resp.headers && resp.headers['content-type']) || '';
    const dataIsJson = ct.includes('application/json') || typeof resp.data === 'object';
    if (dataIsJson) return resp;

    // Retry against explicit backend host (avoid dev server index.html)
    try {
        const parsed = new URL(url, window.location.origin);
        const fallbackUrl = `${FALLBACK_API}${parsed.pathname}${parsed.search}`;
        console.warn('Initial request returned non-JSON; retrying against', fallbackUrl);
        const fb = await doReq(fallbackUrl);
        const ct2 = (fb && fb.headers && fb.headers['content-type']) || '';
        const fbIsJson = ct2.includes('application/json') || typeof fb.data === 'object';
        if (fbIsJson) return fb;
        // otherwise return original response
    } catch (e) {
        // ignore
    }

    return resp;
}

const CreatePage = ({ params }) => {
    const id = params?.id;
    const navigate = useNavigate();
    const location = useLocation();
    const isEditing = !!id;

    // Initialize formData as empty - will be updated by useEffect
    const [formData, setFormData] = useState({
        title: '',
        content: '',
    });

    // Sync formData when navigation state data changes
    useEffect(() => {
        console.log('[CreatePage] Navigation update detected, checking for pageData');
        const pageData = location.state?.pageData;
        console.log('[CreatePage] pageData from location.state:', pageData);
        
        if (pageData) {
            console.log('[CreatePage] ✅ Found pageData, updating formData:', pageData);
            setFormData({
                title: pageData.title || '',
                content: pageData.content || '',
            });
            setOriginalData({
                title: pageData.title || '',
                content: pageData.content || '',
            });
            setFetchLoading(false); // Hide loading spinner
        }
    }, [location.state, isEditing]);

    // Log when formData changes
    useEffect(() => {
        console.log('[CreatePage] formData changed:', {
            title: formData.title,
            contentLength: formData.content?.length,
            content: formData.content?.substring(0, 100)
        });
    }, [formData]);

    const [originalData, setOriginalData] = useState(null);
    const [pages, setPages] = useState([]);
    const [pagesLoading, setPagesLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEditing);

    // Fetch all pages
    useEffect(() => {
        const fetchAllPages = async () => {
            try {
                setPagesLoading(true);
                const token = localStorage.getItem('token');
                const url = `${API}/api/pages/`;
                console.debug('CreatePage.fetchAllPages -> API:', API, 'URL:', url);
                const response = await axiosJsonWithFallback('get', url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response || (response.status && response.status >= 400)) {
                    throw new Error('Failed to fetch pages');
                }

                const contentType = (response.headers && response.headers['content-type']) || '';
                if (contentType.includes('application/json') || typeof response.data === 'object') {
                    const data = response.data;
                    setPages(Array.isArray(data.pages) ? data.pages : data || []);
                } else {
                    console.error('Expected JSON from /api/pages but got:', response.data);
                    throw new Error('Invalid JSON response from server');
                }
            } catch (error) {
                console.error('Error fetching pages:', error);
                toast.error('Failed to load pages list');
            } finally {
                setPagesLoading(false);
            }
        };

        fetchAllPages();
    }, []);

    // Load selected page
    const loadPage = async (pageId) => {
        try {
            setFetchLoading(true);
            const token = localStorage.getItem('token');
            const url = `${API}/api/pages/admin/id/${pageId}`;
            console.log('[CreatePage] Loading page to edit:', { pageId, url });
            const response = await axiosJsonWithFallback('get', url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('[CreatePage] Load page response:', response);

            if (!response || (response.status && response.status >= 400)) {
                throw new Error('Failed to fetch page');
            }

            const ct = (response.headers && response.headers['content-type']) || '';
            if (ct.includes('application/json') || typeof response.data === 'object') {
                const responseData = response.data;
                console.log('[CreatePage] Page loaded, navigating to edit:', responseData);

                // Extract the actual page object (response.data = {success: true, page: {...}})
                const actualPageData = responseData.page || responseData;
                console.log('[CreatePage] Extracted page data:', actualPageData);

                // Pass the page data through navigation state to avoid refetching
                navigate(`/admin/edit-page/${pageId}`, {
                    state: { pageData: actualPageData }
                });
            } else {
                const txt = await response.text();
                console.error('Expected JSON for page by id but got:', txt);
                throw new Error('Invalid JSON response when fetching page');
            }
        } catch (error) {
            toast.error('Failed to load page data');
            console.error('Error fetching page:', error);
        } finally {
            setFetchLoading(false);
        }
    };

    // Delete page
    const deletePage = async (pageId, pageTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${pageTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API}/api/pages/${pageId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response || (response.status && response.status >= 400)) {
                throw new Error('Failed to delete page');
            }

            toast.success('Page deleted successfully');
            // Refresh pages list
            const updatedPages = pages.filter(p => p._id !== pageId);
            setPages(updatedPages);
        } catch (error) {
            toast.error('Failed to delete page');
            console.error('Error deleting page:', error);
        }
    };

    // Fetch page data if editing
    useEffect(() => {
        if (!isEditing) {
            console.log('[CreatePage] Not in edit mode, skipping fetch');
            return;
        }

        console.log('[CreatePage] Edit mode detected, id:', id);
        console.log('[CreatePage] location.state:', location.state);

        const loadPageData = async () => {
            try {
                setFetchLoading(true);

                // If page data was already passed via navigation state, skip API call
                // (already handled by the useEffect above)
                const pageData = location.state?.pageData;

                if (pageData) {
                    console.log('[CreatePage] ✅ Page data from navigation state already loaded');
                    setFetchLoading(false);
                    return;
                }

                // If no navigation state, fetch from API (for direct URL access or page reload)
                console.log('[CreatePage] ❌ No navigation state found, fetching from API for id:', id);
                const token = localStorage.getItem('token');
                const url = `${API}/api/pages/admin/id/${id}`;
                console.log('[CreatePage] Fetching from URL:', url);

                const response = await axiosJsonWithFallback('get', url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log('[CreatePage] Raw API response:', response);

                if (!response || (response.status && response.status >= 400)) {
                    throw new Error(`Failed to fetch page: ${response?.status}`);
                }

                // Extract data - handle different response formats
                let data = response.data;

                // Handle wrapped response (with success flag)
                if (data && data.page) {
                    console.log('[CreatePage] Found data wrapped as data.page, unwrapping');
                    data = data.page;
                } else if (data && data.data) {
                    console.log('[CreatePage] Found data wrapped as data.data, unwrapping');
                    data = data.data;
                }

                console.log('[CreatePage] Final extracted data:', data);

                if (!data || !data.title) {
                    throw new Error('Invalid page data: missing title');
                }

                console.log('[CreatePage] ✅ Setting formData and originalData from API');
                setFormData({
                    title: data.title || '',
                    content: data.content || '',
                });
                setOriginalData({
                    title: data.title || '',
                    content: data.content || '',
                });

                console.log('[CreatePage] ✅ Data set from API');

            } catch (error) {
                console.error('[CreatePage] Error loading page:', error);
                toast.error('Failed to load page data');
                navigate('/admin/pages-seo');
            } finally {
                setFetchLoading(false);
            }
        };

        loadPageData();
    }, [id, isEditing, navigate, location.state, API]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleContentChange = (htmlContent) => {
        console.log('[CreatePage] handleContentChange called with:', htmlContent?.substring(0, 100));
        setFormData(prev => ({
            ...prev,
            content: htmlContent,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Page title is required');
            return;
        }

        if (!formData.content.trim()) {
            toast.error('Page content is required');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Generate slug from title
            const slug = formData.title
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]/g, '');

            const endpoint = isEditing ? `${API}/api/pages/${id}` : `${API}/api/pages/`;
            const method = isEditing ? 'PUT' : 'POST';

            const payload = {
                title: formData.title,
                slug: slug,
                description: formData.title,
                content: formData.content,
                metaTitle: formData.title,
                metaDescription: formData.title,
                metaKeywords: formData.title.toLowerCase(),
                isPublished: true,
            };

            let response;
            if (isEditing) {
                response = await axios.put(endpoint, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else {
                response = await axios.post(endpoint, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
            }

            if (!response || (response.status && response.status >= 400)) {
                const msg = (response && response.data && response.data.message) || `Failed to ${isEditing ? 'update' : 'create'} page`;
                throw new Error(msg);
            }

            const result = response.data;
            toast.success(`Page ${isEditing ? 'updated' : 'created'} successfully!`);

            if (!isEditing) {
                // Reset form only for create mode
                setFormData({
                    title: '',
                    content: '',
                });
            } else {
                // Navigate back to pages after editing
                navigate('/admin/pages-seo');
            }

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {fetchLoading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[var(--color-desert-200)] border-t-[var(--color-desert-600)] mx-auto mb-6"></div>
                        <p className="text-gray-600 text-lg font-medium">Loading page data...</p>
                    </div>
                </div>
            ) : (
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-desert-200)' }}>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-desert-600)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900">
                                    {isEditing ? '✏️ Edit Page' : '📝 Create New Page'}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {isEditing ? 'Update your page content and settings' : 'Build a new page for your website'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Existing Pages */}
                        {!isEditing && (
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                    <div className="p-5 text-white" style={{ background: 'linear-gradient(to right, var(--color-desert-600), var(--color-desert-500))' }}>
                                        <h2 className="text-lg font-bold flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
                                            </svg>
                                            Your Pages
                                        </h2>
                                        <p className="text-sm text-opacity-90 mt-1">
                                            {pages.length} page{pages.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>

                                    {/* Pages List */}
                                    <div className="p-4">
                                        {pagesLoading ? (
                                            <div className="text-center py-8">
                                                <div className="inline-block animate-spin mb-3">
                                                    <div className="w-8 h-8 border-3 border-opacity-20 rounded-full" style={{ borderColor: 'var(--color-desert-600)', borderTopColor: 'var(--color-desert-600)' }}></div>
                                                </div>
                                                <p className="text-gray-600 text-sm">Loading pages...</p>
                                            </div>
                                        ) : pages.length > 0 ? (
                                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                                {pages.map((page) => (
                                                    <div
                                                        key={page._id}
                                                        className="group p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300"
                                                        style={{ borderColor: 'var(--color-border-light)' }}
                                                    >
                                                        <div className="mb-3">
                                                            <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-opacity-70 transition" style={{ color: 'var(--color-text-primary)' }}>
                                                                {page.title}
                                                            </h3>
                                                            <p className="text-xs text-gray-600 mt-1 truncate">
                                                                <span className="inline-block bg-gray-200 px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-border-light)' }}>
                                                                    {page.slug}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => loadPage(page._id)}
                                                                className="flex-1 px-3 py-2 text-white text-xs font-medium rounded-md transition-all transform hover:scale-105 flex items-center justify-center gap-1"
                                                                style={{ backgroundColor: 'var(--color-desert-600)' }}
                                                                title="Edit page"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>

                                                            </button>
                                                            <button
                                                                onClick={() => deletePage(page._id, page.title)}
                                                                className="flex-1 px-3 py-2 text-white text-xs font-medium rounded-md transition-all transform hover:scale-105 flex items-center justify-center gap-1"
                                                                style={{ backgroundColor: 'var(--color-error)' }}
                                                                title="Delete page"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>

                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="text-4xl mb-2">📭</div>
                                                <p className="text-gray-600 text-sm font-medium">No pages yet</p>
                                                <p className="text-gray-600 text-xs mt-1">Create your first page below</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Right Column - Form */}
                        <div className={isEditing ? 'lg:col-span-3' : 'lg:col-span-2'}>
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                {/* Form Header */}
                                <div className="p-6 text-white" style={{ background: 'linear-gradient(to right, var(--color-desert-600), var(--color-desert-500))' }}>
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        {isEditing ? 'Edit Page Details' : 'Page Details'}
                                    </h2>
                                    {isEditing && originalData && (
                                        <p className="text-opacity-90 mt-1">Last updated • Editing: <span className="font-semibold">{originalData.title}</span></p>
                                    )}
                                </div>

                                {/* Form Body */}
                                <div className="p-8">
                                    {/* Original Page Data Display - Only show when editing */}
                                    {isEditing && originalData && (
                                        <div className="rounded-lg p-5 mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-desert-300)', borderWidth: '2px' }}>
                                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-desert-600)' }}>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M2 9.5A6.5 6.5 0 0116.64 3.5a7 7 0 11-9.186 10.356 2.5 2.5 0 11-2.12 2.12A7.001 7.001 0 0114.35 2c2.539 0 4.747 1.924 5.224 4.425.783.042 1.52.216 2.206.514A9.001 9.001 0 002 9.5z" clipRule="evenodd" />
                                                </svg>
                                                Original Content
                                            </h3>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-desert-600)' }}>Title</p>
                                                    <p className="text-sm bg-white px-3 py-2 rounded border" style={{ color: 'var(--color-text-primary)', borderColor: 'var(--color-desert-300)' }}>
                                                        {originalData.title || 'No title set'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-desert-600)' }}>Content Preview</p>
                                                    <div className="text-sm bg-white px-3 py-2 rounded border max-h-20 overflow-hidden" style={{ color: 'var(--color-text-primary)', borderColor: 'var(--color-desert-300)' }}>
                                                        {originalData.content ? (
                                                            <div dangerouslySetInnerHTML={{ __html: originalData.content.replace(/<[^>]*>/g, '').substring(0, 100) }} />
                                                        ) : (
                                                            <span className="italic" style={{ color: 'var(--color-text-muted)' }}>No content set</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Page Title */}
                                        <div>
                                            <label className="block text-sm font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                                                <span className="px-2 py-1 rounded text-xs font-bold text-white" style={{ backgroundColor: 'var(--color-desert-600)' }}>1</span>
                                                Page Title
                                                <span style={{ color: 'var(--color-error)' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                placeholder="E.g., Contact Us, FAQ, Shipping Info"
                                                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition text-gray-900 placeholder-gray-400 focus:ring-2"
                                                style={{
                                                    borderColor: 'var(--color-border-light)',
                                                    '--tw-ring-color': 'var(--color-desert-300)'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = 'var(--color-desert-600)'}
                                                onBlur={(e) => e.target.style.borderColor = 'var(--color-border-light)'}
                                            />
                                            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--color-text-light)' }}>
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                                </svg>
                                                Used for meta tags and slug generation
                                            </p>
                                        </div>

                                        {/* Page Content */}
                                        <div>
                                            <label className="block text-sm font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                                                <span className="px-2 py-1 rounded text-xs font-bold text-white" style={{ backgroundColor: 'var(--color-desert-600)' }}>2</span>
                                                Page Content
                                                <span style={{ color: 'var(--color-error)' }}>*</span>
                                            </label>
                                            <div className="border-2 rounded-lg overflow-hidden transition" style={{ borderColor: 'var(--color-border-light)' }}>
                                                <RichTextEditor
                                                    key={`editor-${isEditing ? id : 'create'}`}
                                                    value={formData.content}
                                                    onChange={handleContentChange}
                                                />
                                            </div>
                                            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--color-text-light)' }}>
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5z" />
                                                </svg>
                                                Format your content with the rich text editor
                                            </p>
                                        </div>

                                        {/* Form Actions */}
                                        <div className="flex gap-3 pt-6 border-t-2" style={{ borderColor: 'var(--color-border-light)' }}>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 px-6 py-3 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                                style={{ background: `linear-gradient(to right, var(--color-desert-600), var(--color-desert-500))` }}
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                </svg>
                                                {loading
                                                    ? (isEditing ? 'Updating...' : 'Creating...')
                                                    : (isEditing ? 'Update Page' : 'Create Page')
                                                }
                                            </button>
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => deletePage(id, formData.title)}
                                                        className="flex-1 px-6 py-3 text-white font-bold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                                                        style={{ backgroundColor: 'var(--color-error)' }}
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate('/admin/pages-seo')}
                                                        className="flex-1 px-6 py-3 text-gray-900 font-bold rounded-lg transition-all"
                                                        style={{ backgroundColor: 'var(--color-border-light)' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ title: '', content: '' })}
                                                    className="flex-1 px-6 py-3 text-gray-900 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                                                    style={{ backgroundColor: 'var(--color-border-light)' }}
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePage;
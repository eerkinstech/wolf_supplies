'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

const PagesSEO = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pages'); // 'pages' or 'policies'

    // Pages state
    const [pages, setPages] = useState([]);
    const [showPageForm, setShowPageForm] = useState(false);
    const [editingPage, setEditingPage] = useState(null);
    const [pageSearchQuery, setPageSearchQuery] = useState('');
    const [pageFormData, setPageFormData] = useState({
        title: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
    });

    // Policies state
    const [policies, setPolicies] = useState([]);
    const [showPolicyForm, setShowPolicyForm] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [policySearchQuery, setPolicySearchQuery] = useState('');
    const [policyFormData, setPolicyFormData] = useState({
        title: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
    });

    const [loading, setLoading] = useState(false);

    // Fetch data on tab change
    useEffect(() => {
        if (activeTab === 'pages') {
            fetchPages();
        } else {
            fetchPolicies();
        }
    }, [activeTab]);

    // ===== PAGES FUNCTIONS =====
    const fetchPages = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/api/pages/`, {
                credentials: 'include',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch pages');
            }

            const data = await response.json();
            setPages(data.pages || data || []);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePageInputChange = (e) => {
        const { name, value } = e.target;
        setPageFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePageSubmit = async (e) => {
        e.preventDefault();

        if (!editingPage) {
            toast.error('Please select a page to edit');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/api/pages/${editingPage._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    metaTitle: pageFormData.metaTitle,
                    metaDescription: pageFormData.metaDescription,
                    metaKeywords: pageFormData.metaKeywords,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update page');
            }

            toast.success('Page SEO metadata updated successfully');
            fetchPages();
            resetPageForm();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditPage = (page) => {
        setEditingPage(page);
        setPageFormData({
            title: page.title,
            metaTitle: page.metaTitle || '',
            metaDescription: page.metaDescription || '',
            metaKeywords: page.metaKeywords || '',
        });
        setShowPageForm(true);
    };

    const resetPageForm = () => {
        setPageFormData({
            title: '',
            metaTitle: '',
            metaDescription: '',
            metaKeywords: '',
        });
        setEditingPage(null);
        setShowPageForm(false);
    };

    const filteredPages = pages.filter(page =>
        page.title.toLowerCase().includes(pageSearchQuery.toLowerCase())
    );

    // ===== POLICIES FUNCTIONS =====
    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            console.log('[PolicySEO] Fetching policies from:', `${API}/api/policies`);
            
            const response = await fetch(`${API}/api/policies`, {
                credentials: 'include',
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('[PolicySEO] Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch policies (${response.status})`);
            }

            const data = await response.json();
            console.log('[PolicySEO] Policies data:', data);
            
            // Handle different response formats
            const policiesArray = data.policies || data.data || data || [];
            console.log('[PolicySEO] Setting policies:', policiesArray.length, 'policies');
            
            setPolicies(Array.isArray(policiesArray) ? policiesArray : []);
        } catch (error) {
            console.error('[PolicySEO] Error fetching policies:', error);
            toast.error('Failed to load policies: ' + error.message);
            setPolicies([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePolicyInputChange = (e) => {
        const { name, value } = e.target;
        setPolicyFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePolicySubmit = async (e) => {
        e.preventDefault();

        if (!editingPolicy) {
            toast.error('Please select a policy to edit');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/api/policies/${editingPolicy._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    metaTitle: policyFormData.metaTitle,
                    metaDescription: policyFormData.metaDescription,
                    metaKeywords: policyFormData.metaKeywords,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update policy');
            }

            toast.success('Policy SEO metadata updated successfully');
            fetchPolicies();
            resetPolicyForm();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditPolicy = (policy) => {
        setEditingPolicy(policy);
        setPolicyFormData({
            title: policy.title,
            metaTitle: policy.metaTitle || '',
            metaDescription: policy.metaDescription || '',
            metaKeywords: policy.metaKeywords || '',
        });
        setShowPolicyForm(true);
    };

    const resetPolicyForm = () => {
        setPolicyFormData({
            title: '',
            metaTitle: '',
            metaDescription: '',
            metaKeywords: '',
        });
        setEditingPolicy(null);
        setShowPolicyForm(false);
    };

    const filteredPolicies = policies.filter(policy =>
        policy.title.toLowerCase().includes(policySearchQuery.toLowerCase())
    );

    return (
        <div className="p-6">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('pages')}
                    className={`px-6 py-3 font-semibold transition border-b-2 ${activeTab === 'pages'
                        ? 'text-gray-900 border-gray-900'
                        : 'text-gray-600 border-transparent hover:text-gray-900'
                        }`}
                >
                    <i className="fas fa-file-alt mr-2"></i>Pages
                </button>
                <button
                    onClick={() => setActiveTab('policies')}
                    className={`px-6 py-3 font-semibold transition border-b-2 ${activeTab === 'policies'
                        ? 'text-gray-900 border-gray-900'
                        : 'text-gray-600 border-transparent hover:text-gray-900'
                        }`}
                >
                    <i className="fas fa-file-contract mr-2"></i>Policies
                </button>
            </div>

            {/* PAGES TAB */}
            {activeTab === 'pages' && (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Pages - SEO Metadata</h1>
                    </div>

                    {/* Edit Form */}
                    {showPageForm && (
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Edit SEO Metadata - {pageFormData.title}
                            </h2>

                            <form onSubmit={handlePageSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Meta Title <span className="text-red-500">*</span>
                                    </label>
                                 
                                    <input
                                        type="text"
                                        name="metaTitle"
                                        value={pageFormData.metaTitle}
                                        onChange={handlePageInputChange}
                                        placeholder="Enter meta title (50-60 characters)"
                                        maxLength={60}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{pageFormData.metaTitle.length}/60</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Meta Description <span className="text-red-500">*</span>
                                    </label>
                                 
                                    <textarea
                                        name="metaDescription"
                                        value={pageFormData.metaDescription}
                                        onChange={handlePageInputChange}
                                        placeholder="Enter meta description (150-160 characters)"
                                        maxLength={160}
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{pageFormData.metaDescription.length}/160</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Meta Keywords
                                    </label>
                                  
                                    <input
                                        type="text"
                                        name="metaKeywords"
                                        value={pageFormData.metaKeywords}
                                        onChange={handlePageInputChange}
                                        placeholder="Enter meta keywords (comma separated)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Update Metadata'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetPageForm}
                                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-semibold transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Search Bar */}
                    {!showPageForm && (
                        <div className="mb-6 relative w-full md:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <i className="fas fa-search text-sm"></i>
                            </div>
                            <input
                                type="text"
                                placeholder="Search pages..."
                                value={pageSearchQuery}
                                onChange={(e) => setPageSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition"
                            />
                            {pageSearchQuery && (
                                <button
                                    onClick={() => setPageSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <i className="fas fa-times text-sm"></i>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Pages Table */}
                    {!showPageForm && (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Meta Title</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredPages.length > 0 ? (
                                        filteredPages.map(page => (
                                            <tr key={page._id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-semibold text-gray-900">
                                                    {page.title}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">
                                                    {page.metaTitle || <span className="text-yellow-600">Not set</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {page.isPublished ? (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-green-100 text-green-800 font-medium">
                                                            Published
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-gray-100 text-gray-800 font-medium">
                                                            Draft
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleEditPage(page)}
                                                        className="text-blue-600 hover:text-blue-800 transition mr-3"
                                                        title="Edit SEO metadata"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/admin/edit-page/${page._id}`)}
                                                        className="text-green-600 hover:text-green-800 transition"
                                                        title="Edit page content"
                                                    >
                                                        <i className="fas fa-pen"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-600">
                                                {pageSearchQuery ? 'No pages found matching your search' : 'No pages available'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* POLICIES TAB */}
            {activeTab === 'policies' && (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Policies - SEO Metadata</h1>
                    </div>

                    {/* Edit Form */}
                    {showPolicyForm && (
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Edit SEO Metadata - {policyFormData.title}
                            </h2>

                            <form onSubmit={handlePolicySubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Meta Title <span className="text-red-500">*</span>
                                    </label>
                               
                                    <input
                                        type="text"
                                        name="metaTitle"
                                        value={policyFormData.metaTitle}
                                        onChange={handlePolicyInputChange}
                                        placeholder="Enter meta title (50-60 characters)"
                                        maxLength={60}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{policyFormData.metaTitle.length}/60</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Meta Description <span className="text-red-500">*</span>
                                    </label>
                                
                                    <textarea
                                        name="metaDescription"
                                        value={policyFormData.metaDescription}
                                        onChange={handlePolicyInputChange}
                                        placeholder="Enter meta description (150-160 characters)"
                                        maxLength={160}
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{policyFormData.metaDescription.length}/160</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Meta Keywords
                                    </label>
                                 
                                    <input
                                        type="text"
                                        name="metaKeywords"
                                        value={policyFormData.metaKeywords}
                                        onChange={handlePolicyInputChange}
                                        placeholder="Enter meta keywords (comma separated)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Update Metadata'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetPolicyForm}
                                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-semibold transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Search Bar */}
                    {!showPolicyForm && (
                        <div className="mb-6 relative w-full md:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <i className="fas fa-search text-sm"></i>
                            </div>
                            <input
                                type="text"
                                placeholder="Search policies..."
                                value={policySearchQuery}
                                onChange={(e) => setPolicySearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition"
                            />
                            {policySearchQuery && (
                                <button
                                    onClick={() => setPolicySearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <i className="fas fa-times text-sm"></i>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Policies Table */}
                    {!showPolicyForm && (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Meta Title</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredPolicies.length > 0 ? (
                                        filteredPolicies.map(policy => (
                                            <tr key={policy._id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-semibold text-gray-900">
                                                    {policy.title}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">
                                                    {policy.metaTitle || <span className="text-yellow-600">Not set</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {policy.isPublished ? (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-green-100 text-green-800 font-medium">
                                                            Published
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-gray-100 text-gray-800 font-medium">
                                                            Draft
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleEditPolicy(policy)}
                                                        className="text-blue-600 hover:text-blue-800 transition"
                                                        title="Edit SEO metadata"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-600">
                                                {policySearchQuery ? 'No policies found matching your search' : 'No policies available'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PagesSEO;

'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

const URLRedirectManagement = () => {
    const token = localStorage.getItem('token');
    const [redirects, setRedirects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [selectedRedirects, setSelectedRedirects] = useState([]);

    // Form modal
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        fromUrl: '',
        toUrl: '',
        isActive: true
    });

    useEffect(() => {
        console.log("[URLRedirectManagement] Component mounted");
        console.log("[URLRedirectManagement] API URL:", API);
        console.log("[URLRedirectManagement] Token:", token ? "EXISTS" : "MISSING");

        // Test API connectivity first
        axios.get(`${API}/api/admin/redirects/test`)
            .then(res => {
                console.log("[URLRedirectManagement] API Test Passed:", res.data);
            })
            .catch(err => {
                console.error("[URLRedirectManagement] API Test Failed:", err.message);
            });

        fetchRedirects();
        fetchStats();
    }, []);

    // Debug hook: Log whenever redirects state changes
    useEffect(() => {
        console.log("[URLRedirectManagement] STATE CHANGE - redirects:", redirects);
        console.log("[URLRedirectManagement] STATE CHANGE - redirects length:", redirects.length);
        console.log("[URLRedirectManagement] STATE CHANGE - loading:", loading);
    }, [redirects, loading]);

    const fetchRedirects = async () => {
        try {
            setLoading(true);

            // Build the URL - use the public endpoint which doesn't need auth
            let url = `${API}/api/admin/redirects-list`;

            // Add query parameters
            const params = new URLSearchParams();
            if (filterActive !== 'all') {
                params.append('is_active', filterActive === 'active');
            }
            if (searchTerm) {
                params.append('search', searchTerm);
            }

            if (params.toString()) {
                url += '?' + params.toString();
            }

            console.log("[URLRedirectManagement] Fetching from:", url);
            console.log("[URLRedirectManagement] API base URL:", API);

            const response = await axios.get(url);

            console.log("[URLRedirectManagement] Response status:", response.status);
            console.log("[URLRedirectManagement] Response data type:", typeof response.data);
            console.log("[URLRedirectManagement] Response data:", response.data);

            // Ensure we have an array
            let data = response.data;
            if (!Array.isArray(data)) {
                console.warn("[URLRedirectManagement] Response is not an array, trying to extract data");
                data = data.redirects || data.data || [];
            }

            console.log("[URLRedirectManagement] Final data length:", data.length);
            console.log("[URLRedirectManagement] Setting state with redirects");

            setRedirects(data);

        } catch (error) {
            console.error("[URLRedirectManagement] ERROR FETCHING REDIRECTS");
            console.error("[URLRedirectManagement] Error message:", error.message);
            console.error("[URLRedirectManagement] Error config (URL):", error.config?.url);
            console.error("[URLRedirectManagement] Error status:", error.response?.status);
            console.error("[URLRedirectManagement] Error data:", error.response?.data);
            console.error("[URLRedirectManagement] Full error:", JSON.stringify(error, null, 2));

            toast.error('Failed to fetch redirects: ' + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            console.log("[URLRedirectManagement] Fetching stats...");
            const response = await axios.get(`${API}/api/admin/redirects/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("[URLRedirectManagement] Stats response:", response.data);
            setStats(response.data);
        } catch (error) {
            console.error('[URLRedirectManagement] Failed to fetch stats:', error);
        }
    };

    const handleOpenModal = (redirect = null) => {
        if (redirect) {
            setEditingId(redirect._id);
            setFormData({
                fromUrl: redirect.fromUrl,
                toUrl: redirect.toUrl,
                isActive: redirect.isActive
            });
        } else {
            setEditingId(null);
            setFormData({
                fromUrl: '',
                toUrl: '',
                isActive: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({
            fromUrl: '',
            toUrl: '',
            isActive: true
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value;

        // Normalize URLs - convert full URLs to just the path
        if ((name === 'fromUrl' || name === 'toUrl') && typeof newValue === 'string') {
            try {
                // If it looks like a full URL, extract just the path
                if (newValue.includes('://')) {
                    const url = new URL(newValue);
                    newValue = url.pathname.startsWith('/') ? url.pathname : '/' + url.pathname;
                }
                // Ensure it starts with /
                if (newValue && !newValue.startsWith('/')) {
                    newValue = '/' + newValue;
                }
            } catch (err) {
                // If not a valid URL, keep as-is and let validation handle it
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        if (!formData.fromUrl.trim() || !formData.toUrl.trim()) {
            toast.error('Both URLs are required');
            return;
        }

        try {
            if (editingId) {
                await axios.put(
                    `${API}/api/admin/redirects/${editingId}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Redirect updated successfully');
            } else {
                await axios.post(
                    `${API}/api/admin/redirects`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Redirect created successfully');
            }

            handleCloseModal();
            fetchRedirects();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save redirect');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this redirect?')) {
            return;
        }

        try {
            await axios.delete(
                `${API}/api/admin/redirects/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Redirect deleted successfully');
            fetchRedirects();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete redirect');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await axios.patch(
                `${API}/api/admin/redirects/${id}/toggle`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchRedirects();
            fetchStats();
            toast.success('Status updated');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRedirects.length === 0) {
            toast.error('No redirects selected');
            return;
        }

        if (!window.confirm(`Delete ${selectedRedirects.length} redirect(s)?`)) {
            return;
        }

        try {
            await axios.post(
                `${API}/api/admin/redirects/bulk-delete`,
                { ids: selectedRedirects },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Redirects deleted successfully');
            setSelectedRedirects([]);
            fetchRedirects();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete redirects');
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRedirects(redirects.map(r => r._id));
        } else {
            setSelectedRedirects([]);
        }
    };

    const handleSelectRedirect = (id) => {
        setSelectedRedirects(prev => {
            if (prev.includes(id)) {
                return prev.filter(rid => rid !== id);
            } else {
                return [...prev, id];
            }
        });
    };



    const sortedRedirects = [...redirects].sort((a, b) => {
        if (sortBy === 'createdAt') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'fromUrl') {
            return a.fromUrl.localeCompare(b.fromUrl);
        }
        return 0;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">URL Redirects</h1>
                <p className="text-gray-600">Site-wide redirection management for all broken or moved URLs</p>
            </div>

            {/* Information Box */}
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">📌 How to Use</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use this for <strong>any broken or moved URL</strong> on your site - products, categories, policies, pages, etc.</li>
                    <li>• <strong>From URL:</strong> The old/broken path (e.g., <code className="bg-blue-100 px-2 py-1 rounded">/product/old-name</code>, <code className="bg-blue-100 px-2 py-1 rounded">/category/old-category</code>, <code className="bg-blue-100 px-2 py-1 rounded">/policies/old-policy</code>)</li>
                    <li>• <strong>To URL:</strong> The new destination path (e.g., <code className="bg-blue-100 px-2 py-1 rounded">/product/new-name</code>, <code className="bg-blue-100 px-2 py-1 rounded">/products</code>, <code className="bg-blue-100 px-2 py-1 rounded">/home</code>)</li>
                    <li>• When users (or search engines) visit the old URL, they're automatically redirected to the new one</li>
                    <li>• Keep redirects <strong>Active</strong> to enable them, toggle to <strong>Inactive</strong> to disable without deleting</li>
                </ul>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-sm text-gray-600">Total</div>
                        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-sm text-gray-600">Active</div>
                        <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-600">Inactive</div>
                        <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="mb-6 flex gap-4 flex-wrap items-center justify-between">
                <div className="flex gap-4 flex-wrap flex-1">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search URLs..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            // Debounce search
                            const timer = setTimeout(fetchRedirects, 300);
                            return () => clearTimeout(timer);
                        }}
                        className="px-4 py-2 border rounded-lg flex-1 min-w-[200px]"
                    />

                    {/* Filter */}
                    <select
                        value={filterActive}
                        onChange={(e) => setFilterActive(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                    >
                        <option value="createdAt">Newest First</option>
                        <option value="fromUrl">From URL (A-Z)</option>
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {selectedRedirects.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Delete {selectedRedirects.length}
                        </button>
                    )}
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        + Add Redirect
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && <div className="text-center py-8">Loading...</div>}

            {/* Table */}
            {!loading && (
                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-2 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedRedirects.length === redirects.length && redirects.length > 0}
                                        onChange={handleSelectAll}
                                        className="cursor-pointer"
                                    />
                                </th>
                                <th className="px-2 py-3 text-left font-semibold">From URL</th>
                                <th className="px-2 py-3 text-left font-semibold">To URL</th>
                                <th className="px-2 py-3 text-left font-semibold">Status</th>
                                <th className="px-2 py-3 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                if (sortedRedirects.length === 0) {
                                    return (
                                        <tr key="empty-state">
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                No redirects found. {searchTerm && 'Try adjusting your search.'}
                                            </td>
                                        </tr>
                                    );
                                }
                                return sortedRedirects.map((redirect, index) => (
                                    <tr key={redirect._id ?? index} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-2 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedRedirects.includes(redirect._id)}
                                                onChange={() => handleSelectRedirect(redirect._id)}
                                                className="cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-2 py-3 font-mono text-[10px] text-blue-600">{redirect.fromUrl}</td>
                                        <td className="px-2 py-3 font-mono text-[10px] text-green-600">{redirect.toUrl}</td>
                                        <td className="px-2 py-3">
                                            <button
                                                onClick={() => handleToggleStatus(redirect._id)}
                                                className={`px-1 py-3 rounded-full text-[10px] font-semibold cursor-pointer ${redirect.isActive
                                                    ? ' text-green-800'
                                                    : ' text-gray-800'
                                                    }`}
                                            >
                                                {redirect.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-1 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenModal(redirect)}
                                                className="px-1 py-3 text-[10px]  text-blue-700 rounded hover:bg-blue-200 inline-flex items-center gap-1"
                                            >
                                                <i className="fas fa-edit"></i>

                                            </button>
                                            <button
                                                onClick={() => handleDelete(redirect._id)}
                                                className="px-1 py-3 text-[10px]  text-red-700 rounded hover:bg-red-200 inline-flex items-center gap-1"
                                            >
                                                <i className="fas fa-trash"></i>

                                            </button>
                                        </td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-full w-full mx-4">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold">
                                {editingId ? 'Edit Redirect' : 'Create New Redirect'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* From URL */}
                            <div>
                                <label className="block text-sm font-semibold mb-1">
                                    From URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fromUrl"
                                    value={formData.fromUrl}
                                    onChange={handleInputChange}
                                    placeholder="/product/old-product-name"
                                    className="w-full px-1 py-2 border rounded-lg"
                                />
                                <p className="text-[10px] text-gray-500 mt-1">The broken URL path to redirect from</p>
                            </div>

                            {/* To URL */}
                            <div>
                                <label className="block text-sm font-semibold mb-1">
                                    To URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="toUrl"
                                    value={formData.toUrl}
                                    onChange={handleInputChange}
                                    placeholder="/product/new-product-name"
                                    className="w-full px-1 py-2 border rounded-lg"
                                />
                                <p className="text-[10px] text-gray-500 mt-1">The destination URL path</p>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="cursor-pointer"
                                />
                                <label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">
                                    Active
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingId ? 'Update' : 'Create'} Redirect
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default URLRedirectManagement;

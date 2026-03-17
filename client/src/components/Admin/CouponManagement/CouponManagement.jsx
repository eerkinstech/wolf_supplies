'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

const CouponManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [products, setProducts] = useState([]);
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        productId: '',
        maxUses: '',
        validFrom: '',
        validUntil: '',
        isActive: true,
        minimumOrderValue: 0
    });

    // Fetch coupons
    const fetchCoupons = async () => {
        setLoading(true);
        try {
            console.log('[CouponManagement] Fetching coupons from:', `${API}/api/coupons/list`);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/api/coupons/list`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('[CouponManagement] Coupon API Response Status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('[CouponManagement] Error response:', errorText.substring(0, 300));
                throw new Error(`Failed to fetch coupons: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                console.error('[CouponManagement] API returned HTML instead of JSON');
                throw new Error('API server error - received HTML instead of JSON');
            }

            const data = await response.json();
            console.log('[CouponManagement] Coupons received:', Array.isArray(data) ? data.length : 0, 'items');
            // Handle both array and { data: [...] } response formats
            const couponsList = Array.isArray(data) ? data : (data.data || data.coupons || []);
            // Normalize all coupons from backend
            const normalizedCoupons = couponsList.map(normalizeCoupon);
            setCoupons(normalizedCoupons);
        } catch (error) {
            console.error('[CouponManagement] Fetch error:', error);
            toast.error(error.message || 'Failed to load coupons');
            setCoupons([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch products for dropdown
    const fetchProducts = async () => {
        try {
            console.log('[CouponManagement] Fetching products...');
            const response = await fetch(`${API}/api/products`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error('API returned HTML instead of JSON for products');
            }
            
            const data = await response.json();
            console.log('[CouponManagement] Products loaded:', data.length || 0, 'items');
            // Handle both direct array and { data: [...] } response formats
            const productsList = Array.isArray(data) ? data : (data.data || data.products || []);
            setProducts(productsList);
        } catch (error) {
            console.error('[CouponManagement] Products fetch error:', error);
            toast.error(error.message || 'Failed to load products');
            setProducts([]); // Set empty array on error
        }
    };

    useEffect(() => {
        fetchCoupons();
        fetchProducts();
    }, []);

    // Helper function to normalize coupon data from backend (convert snake_case to camelCase)
    const normalizeCoupon = (coupon) => {
        return {
            ...coupon,
            discountType: coupon.discountType || coupon.discount_type,
            discountValue: coupon.discountValue || coupon.discount_value || 0,
            maxUses: coupon.maxUses || coupon.max_uses,
            currentUses: coupon.currentUses || coupon.current_uses || 0,
            validFrom: coupon.validFrom || coupon.valid_from,
            validUntil: coupon.validUntil || coupon.valid_until || coupon.expiry_date,
            isActive: coupon.isActive !== undefined ? coupon.isActive : coupon.active,
            minimumOrderValue: coupon.minimumOrderValue || coupon.min_purchase || 0,
            productId: coupon.productId || coupon.product_id
        };
    };

    const filteredCoupons = coupons.map(normalizeCoupon).filter(coupon =>
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (coupon.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Helper function to check if coupon is expired by usage
    const isExpiredByUsage = (coupon) => {
        return coupon.maxUses && coupon.currentUses >= coupon.maxUses;
    };

    // Helper function to check if coupon is date expired
    const isExpiredByDate = (coupon) => {
        if (!coupon.validUntil) return false;
        return new Date(coupon.validUntil) < new Date();
    };

    // Helper function to get status badge
    const getStatusBadge = (coupon) => {
        if (!coupon.isActive) {
            return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">Inactive</span>;
        }
        if (isExpiredByDate(coupon)) {
            return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><i className="fas fa-exclamation-triangle"></i> Expired</span>;
        }
        if (isExpiredByUsage(coupon)) {
            return <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><i className="fas fa-exclamation-triangle"></i> Limit Reached</span>;
        }
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Active</span>;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            // Validate
            if (!formData.code.trim()) {
                toast.error('Coupon code is required');
                return;
            }
            if (formData.discountType === 'percentage' && (formData.discountValue < 0 || formData.discountValue > 100)) {
                toast.error('Percentage must be between 0 and 100');
                return;
            }

            const url = editingCoupon
                ? `${API}/api/coupons/${editingCoupon._id}`
                : `${API}/api/coupons`;

            const method = editingCoupon ? 'PUT' : 'POST';
            
            console.log(`[CouponManagement] ${method} request to: ${url}`);
            console.log(`[CouponManagement] Form data:`, formData);

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    discountValue: parseFloat(formData.discountValue),
                    minimumOrderValue: formData.minimumOrderValue ? parseFloat(formData.minimumOrderValue) : 0,
                    maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
                    productId: formData.productId || null
                })
            });

            console.log(`[CouponManagement] Response status: ${response.status}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[CouponManagement] Error response: ${errorText}`);
                try {
                    const error = JSON.parse(errorText);
                    throw new Error(error.error || error.message || `HTTP ${response.status}`);
                } catch (e) {
                    throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
                }
            }

            const result = await response.json();
            console.log(`[CouponManagement] Success response:`, result);
            
            toast.success(editingCoupon ? 'Coupon updated successfully' : 'Coupon created successfully');
            fetchCoupons();
            resetForm();
            setShowModal(false);
        } catch (error) {
            console.error(`[CouponManagement] Submit error:`, error);
            toast.error(error.message || 'Failed to save coupon');
        }
    };

    const handleEdit = (coupon) => {
        const normalized = normalizeCoupon(coupon);
        setEditingCoupon(normalized);
        setFormData({
            code: normalized.code,
            description: normalized.description || '',
            discountType: normalized.discountType,
            discountValue: normalized.discountValue,
            productId: normalized.productId?._id || normalized.productId || '',
            maxUses: normalized.maxUses || '',
            validFrom: normalized.validFrom ? new Date(normalized.validFrom).toISOString().split('T')[0] : '',
            validUntil: normalized.validUntil ? new Date(normalized.validUntil).toISOString().split('T')[0] : '',
            isActive: normalized.isActive,
            minimumOrderValue: normalized.minimumOrderValue || 0
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/api/coupons/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete coupon');
            toast.success('Coupon deleted successfully');
            fetchCoupons();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discountType: 'percentage',
            discountValue: 0,
            productId: '',
            maxUses: '',
            validFrom: '',
            validUntil: '',
            isActive: true,
            minimumOrderValue: 0
        });
        setProductSearchQuery('');
        setShowProductDropdown(false);
        setEditingCoupon(null);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => fetchCoupons()}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                        title="Refresh coupon list"
                    >
                        <i className="fas fa-sync"></i> Refresh
                    </button>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-black text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                        <i className="fas fa-plus"></i> Create Coupon
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <i className="fas fa-search text-sm"></i>
                </div>
                <input
                    type="text"
                    placeholder="Search coupons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        <i className="fas fa-times text-sm"></i>
                    </button>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <i className="fas fa-spinner animate-spin text-4xl text-gray-700"></i>
                </div>
            )}

            {/* Coupons Table */}
            {!loading && (
                <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Code</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Discount</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Description</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Product</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Usage</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Valid Until</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Status</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredCoupons.length > 0 ? (
                                filteredCoupons.map(coupon => (
                                    <tr key={coupon._id} className="hover:bg-gray-50 transition">
                                        <td className="px-3 py-3 font-mono font-bold text-sm text-gray-900 whitespace-nowrap">{coupon.code}</td>
                                        <td className="px-3 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                                            {coupon.discountType === 'percentage' ? `${coupon.discountValue || 0}%` : `£${(coupon.discountValue || 0).toFixed(2)}`}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-700 max-w-xs truncate">
                                            {coupon.description || '-'}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-700 max-w-xs truncate">
                                            {coupon.productId?.name ? (
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium whitespace-nowrap" title={coupon.productId.name}>
                                                    {coupon.productId.name.length > 15 ? coupon.productId.name.substring(0, 15) + '...' : coupon.productId.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 text-xs italic">All</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-900">
                                            {coupon.maxUses ? (
                                                <div className="flex items-center gap-1 whitespace-nowrap">
                                                    <span className="font-semibold text-xs">{coupon.currentUses || 0}/{coupon.maxUses}</span>
                                                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                        <div
                                                            className={`h-1.5 rounded-full transition-all ${isExpiredByUsage(coupon) ? 'bg-red-500' : 'bg-green-500'}`}
                                                            style={{ width: `${Math.min(((coupon.currentUses || 0) / coupon.maxUses) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-xs italic">Unlimited</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">
                                            {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : 'No limit'}
                                        </td>
                                        <td className="px-3 py-3 text-sm">
                                            {getStatusBadge(coupon)}
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleEdit(coupon)}
                                                    className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 hover:bg-blue-200 transition rounded-md"
                                                    title="Edit coupon"
                                                >
                                                    <i className="fas fa-edit" style={{ fontSize: '14px' }}></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon._id)}
                                                    className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 hover:bg-red-200 transition rounded-md"
                                                    title="Delete coupon"
                                                >
                                                    <i className="fas fa-trash" style={{ fontSize: '14px' }}></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-600">
                                        No coupons found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setShowProductDropdown(false)}>
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Coupon Code */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Coupon Code *
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    placeholder="e.g., SUMMER20"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                                    disabled={editingCoupon} // Don't allow code changes
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Summer Sale Discount"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                                />
                            </div>

                            {/* Discount Type and Value */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Discount Type *
                                    </label>
                                    <select
                                        name="discountType"
                                        value={formData.discountType}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Price (£)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Discount Value *
                                    </label>
                                    <input
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleInputChange}
                                        placeholder={formData.discountType === 'percentage' ? '0-100' : '0.00'}
                                        min="0"
                                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Product Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Apply to Product (Optional - Leave empty for all products)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search and select product..."
                                        value={
                                            formData.productId
                                                ? products.find(p => p._id === formData.productId)?.name || ''
                                                : productSearchQuery
                                        }
                                        onChange={(e) => {
                                            setProductSearchQuery(e.target.value);
                                            setShowProductDropdown(true);
                                        }}
                                        onFocus={() => {
                                            setShowProductDropdown(true);
                                            if (formData.productId) {
                                                setProductSearchQuery('');
                                            }
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                                    />
                                    {formData.productId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, productId: '' });
                                                setProductSearchQuery('');
                                            }}
                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                        >
                                            ×
                                        </button>
                                    )}

                                    {/* Dropdown */}
                                    {showProductDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                                            <div className="sticky top-0 bg-gray-50 border-b px-4 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="Search products..."
                                                    value={productSearchQuery}
                                                    onChange={(e) => setProductSearchQuery(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none text-sm"
                                                    autoFocus
                                                />
                                            </div>
                                            <div>
                                                <div
                                                    onClick={() => {
                                                        setFormData({ ...formData, productId: '' });
                                                        setProductSearchQuery('');
                                                        setShowProductDropdown(false);
                                                    }}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-600"
                                                >
                                                    All Products
                                                </div>
                                                {Array.isArray(products) && products
                                                    .filter(product =>
                                                        product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
                                                    )
                                                    .map(product => (
                                                        <div
                                                            key={product._id}
                                                            onClick={() => {
                                                                setFormData({ ...formData, productId: product._id });
                                                                setProductSearchQuery('');
                                                                setShowProductDropdown(false);
                                                            }}
                                                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-900 border-b last:border-b-0"
                                                        >
                                                            {product.name}
                                                        </div>
                                                    ))}
                                                {Array.isArray(products) && products.filter(product =>
                                                    product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
                                                ).length === 0 && (
                                                        <div className="px-4 py-3 text-center text-sm text-gray-500">
                                                            No products found
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Validity Period */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Valid From
                                    </label>
                                    <input
                                        type="date"
                                        name="validFrom"
                                        value={formData.validFrom}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Valid Until
                                    </label>
                                    <input
                                        type="date"
                                        name="validUntil"
                                        value={formData.validUntil}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Maximum Uses and Minimum Order Value */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Max Uses (Leave empty for unlimited)
                                    </label>
                                    <input
                                        type="number"
                                        name="maxUses"
                                        value={formData.maxUses}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 100"
                                        min="1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Minimum Order Value (£)
                                    </label>
                                    <input
                                        type="number"
                                        name="minimumOrderValue"
                                        value={formData.minimumOrderValue}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 rounded border-gray-300"
                                />
                                <label htmlFor="isActive" className="ml-3 text-sm font-semibold text-gray-900">
                                    Active
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-4 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gray-800 hover:bg-black text-white rounded-lg font-semibold transition"
                                >
                                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponManagement;

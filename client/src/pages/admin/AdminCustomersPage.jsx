'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';
import { checkApiHealth, logDiagnostics, formatDiagnosticsError } from '../../utils/apiHealthCheck';

const AdminCustomersPage = () => {
    const API = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'orderCount', order: 'desc' });

    // Fetch all orders and extract unique customers
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);

                // Debug: Log API URL and token status
                console.log('API URL:', API);
                console.log('Token exists:', !!token);

                // Validate API URL
                if (!API) {
                    throw new Error('API_URL environment variable is not set');
                }

                if (!token) {
                    throw new Error('User token not found. Please log in again.');
                }

                // Fetch orders
                const ordersRes = await fetch(`${API}/api/orders`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                // Check if response is HTML (indicates error page)
                const contentType = ordersRes.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                    console.error('Server returned HTML instead of JSON');
                    const htmlText = await ordersRes.text();
                    console.error('HTML Response:', htmlText.substring(0, 200));
                    throw new Error(`Server error: ${ordersRes.status} - Check network tab for details`);
                }

                if (!ordersRes.ok) {
                    const errorText = await ordersRes.text();
                    try {
                        const errorData = JSON.parse(errorText);
                        throw new Error(`Failed to fetch orders: ${errorData.detail || ordersRes.statusText}`);
                    } catch {
                        throw new Error(`Failed to fetch orders: ${ordersRes.status} ${ordersRes.statusText}`);
                    }
                }

                const allOrders = await ordersRes.json();

                // Fetch newsletter subscriptions
                console.log('[AdminCustomersPage] Fetching newsletters from:', `${API}/api/newsletter/list`);
                
                let allNewsletters = [];
                try {
                    const newsletterRes = await fetch(`${API}/api/newsletter/list`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    console.log('[AdminCustomersPage] Newsletter API Response Status:', newsletterRes.status);
                    console.log('[AdminCustomersPage] Newsletter API Response Headers:', {
                        contentType: newsletterRes.headers.get('content-type'),
                        contentLength: newsletterRes.headers.get('content-length'),
                    });

                    if (!newsletterRes.ok) {
                        const errorText = await newsletterRes.text();
                        console.warn(`[AdminCustomersPage] Newsletter API error (${newsletterRes.status}):`, errorText.substring(0, 300));
                    } else {
                        try {
                            const newsletterData = await newsletterRes.json();
                            console.log('[AdminCustomersPage] Newsletter data received:', newsletterData);
                            
                            // Handle different response formats
                            if (Array.isArray(newsletterData)) {
                                allNewsletters = newsletterData;
                                console.log('[AdminCustomersPage] Newsletter data is array:', allNewsletters.length, 'items');
                            } else if (newsletterData?.data && Array.isArray(newsletterData.data)) {
                                allNewsletters = newsletterData.data;
                                console.log('[AdminCustomersPage] Newsletter data found in .data:', allNewsletters.length, 'items');
                            } else if (newsletterData?.newsletters && Array.isArray(newsletterData.newsletters)) {
                                allNewsletters = newsletterData.newsletters;
                                console.log('[AdminCustomersPage] Newsletter data found in .newsletters:', allNewsletters.length, 'items');
                            } else if (newsletterData && typeof newsletterData === 'object') {
                                // Try to extract from object
                                const keys = Object.keys(newsletterData);
                                console.log('[AdminCustomersPage] Newsletter response keys:', keys);
                                allNewsletters = [];
                            }
                            
                            // Log sample newsletter data to debug structure
                            if (allNewsletters.length > 0) {
                                console.log('[AdminCustomersPage] Sample newsletter item:', allNewsletters[0]);
                                console.log('[AdminCustomersPage] Newsletter item keys:', Object.keys(allNewsletters[0]));
                            }
                        } catch (parseError) {
                            console.warn('[AdminCustomersPage] Failed to parse newsletter JSON:', parseError);
                            allNewsletters = [];
                        }
                    }
                } catch (fetchError) {
                    console.warn('[AdminCustomersPage] Newsletter API fetch error:', fetchError.message);
                    allNewsletters = [];
                }

                // Group orders by customer email + name + phone (composite key)
                const customerMap = new Map();

                allOrders.forEach((order) => {
                    const email = order.contactDetails?.email || order.customer?.email || order.customerEmail || 'Unknown';
                    const firstName = order.contactDetails?.firstName || order.customer?.name?.split(' ')[0] || '';
                    const lastName = order.contactDetails?.lastName || order.customer?.name?.split(' ')[1] || '';
                    const name = `${firstName} ${lastName}`.trim() || 'N/A';
                    const phone = order.contactDetails?.phone || order.customer?.phone || order.shippingAddress?.phone || 'N/A';
                    const address = order.shippingAddress || {};

                    // Create composite key: email + name + phone
                    // This ensures same customer only if all three match
                    const compositeKey = `${email}|${name}|${phone}`;

                    if (!customerMap.has(compositeKey)) {
                        customerMap.set(compositeKey, {
                            email,
                            name,
                            phone,
                            address,
                            orders: [],
                            totalSpent: 0,
                            orderCount: 0,
                            createdAt: order.createdAt,
                            isNewsletterSubscribed: false,
                        });
                    }

                    const customer = customerMap.get(compositeKey);
                    customer.orders.push(order);
                    customer.orderCount = customer.orders.length;
                    customer.totalSpent += order.totalPrice || 0;
                    // Update createdAt to earliest order
                    if (new Date(order.createdAt) < new Date(customer.createdAt)) {
                        customer.createdAt = order.createdAt;
                    }
                });

                // Add newsletter subscribers to the map
                // Newsletter is tracked by EMAIL ONLY - so all customers with same email get marked as subscribed
                const newsletterEmails = new Set();
                allNewsletters.forEach((newsletter) => {
                    // Handle both direct email field and nested email
                    const email = newsletter.email || newsletter?.user?.email || newsletter?.customerEmail;
                    if (email) {
                        // Normalize email to lowercase for consistent matching
                        newsletterEmails.add(email.toLowerCase().trim());
                        console.log('[AdminCustomersPage] Added newsletter email:', email.toLowerCase().trim());
                    }
                });

                console.log('[AdminCustomersPage] Total newsletter emails:', newsletterEmails.size);

                // Mark all customers with newsletter email as subscribed
                let subscribedCount = 0;
                customerMap.forEach((customer) => {
                    const customerEmailLower = customer.email.toLowerCase().trim();
                    if (newsletterEmails.has(customerEmailLower)) {
                        customer.isNewsletterSubscribed = true;
                        subscribedCount++;
                        console.log('[AdminCustomersPage] ✓ Marked subscribed:', customerEmailLower);
                    } else {
                        console.log('[AdminCustomersPage] ✗ Not subscribed:', customerEmailLower);
                    }
                });

                console.log('[AdminCustomersPage] Total subscribed customers:', subscribedCount, 'out of', customerMap.size);

                // Convert map to array
                const customerList = Array.from(customerMap.values()).sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );

                setCustomers(customerList);
            } catch (error) {
                console.error('Error fetching customers:', error);

                // Run diagnostics to help identify the issue
                const diagnostics = await checkApiHealth(API, token);
                logDiagnostics(diagnostics);

                // Provide specific error messages
                if (error.message.includes('API_URL')) {
                    toast.error('API configuration error. Contact support.');
                } else if (error.message.includes('token')) {
                    toast.error('Authentication failed. Please log in again.');
                } else if (error.message.includes('Server error')) {
                    toast.error('Server connection failed. Check browser console for diagnostics.');
                } else {
                    // Use diagnostic information for better error messages
                    const errorMsg = formatDiagnosticsError(diagnostics) || error.message || 'Failed to load customers';
                    toast.error(errorMsg);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [API, token]);

    // Filter customers based on search term
    const filteredCustomers = customers.filter((customer) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            customer.email.toLowerCase().includes(searchLower) ||
            customer.name.toLowerCase().includes(searchLower) ||
            customer.phone.toLowerCase().includes(searchLower)
        );
    });

    // Sort customers
    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
        const key = sortConfig.key;
        const order = sortConfig.order === 'asc' ? 1 : -1;

        if (typeof a[key] === 'string') {
            return a[key].localeCompare(b[key]) * order;
        }
        return (a[key] - b[key]) * order;
    });

    const handleSort = (key) => {
        setSortConfig({
            key,
            order: sortConfig.key === key && sortConfig.order === 'asc' ? 'desc' : 'asc',
        });
    };

    const openCustomerModal = (customer) => {
        setSelectedCustomer(customer);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCustomer(null);
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <i className="fas fa-sort text-gray-400 text-xs ml-1"></i>;
        return (
            <i
                className={`fas fa-sort-${sortConfig.order === 'asc' ? 'up' : 'down'} text-blue-600 text-xs ml-1`}
            ></i>
        );
    };

    if (loading) {
        return (
            <AdminLayout activeTab="customers">
                <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                    <i className="fas fa-spinner text-4xl animate-spin text-blue-600 mb-4"></i>
                    <p className="text-gray-600 text-center">
                        Loading customers...
                        <br />
                        <small className="text-gray-400 mt-2 block">
                            💡 If this doesn't complete, check the browser console for diagnostics
                        </small>
                    </p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activeTab="customers">
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900">Customers</h1>
                        <p className="text-gray-600 mt-2">Manage and view customer information</p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search customers by email, name, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm font-semibold">Total Customers</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{customers.length}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm font-semibold">Total Revenue</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                £{customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm font-semibold">Newsletter Subscribers</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">
                                {customers.filter(c => c.isNewsletterSubscribed).length}
                            </p>
                        </div>
                    </div>

                    {/* Customers Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {sortedCustomers.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-600 text-lg">No customers found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left">
                                                <button
                                                    onClick={() => handleSort('name')}
                                                    className="flex items-center font-semibold text-gray-900 hover:text-blue-600 transition"
                                                >
                                                    Name <SortIcon column="name" />
                                                </button>
                                            </th>
                                            <th className="px-6 py-4 text-left">
                                                <button
                                                    onClick={() => handleSort('email')}
                                                    className="flex items-center font-semibold text-gray-900 hover:text-blue-600 transition"
                                                >
                                                    Email <SortIcon column="email" />
                                                </button>
                                            </th>
                                            <th className="px-6 py-4 text-left">
                                                <button
                                                    onClick={() => handleSort('phone')}
                                                    className="flex items-center font-semibold text-gray-900 hover:text-blue-600 transition"
                                                >
                                                    Phone <SortIcon column="phone" />
                                                </button>
                                            </th>
                                            <th className="px-6 py-4 text-left">
                                                <button
                                                    onClick={() => handleSort('orderCount')}
                                                    className="flex items-center font-semibold text-gray-900 hover:text-blue-600 transition"
                                                >
                                                    Orders <SortIcon column="orderCount" />
                                                </button>
                                            </th>
                                            <th className="px-6 py-4 text-left">
                                                <button
                                                    onClick={() => handleSort('totalSpent')}
                                                    className="flex items-center font-semibold text-gray-900 hover:text-blue-600 transition"
                                                >
                                                    Total Spent <SortIcon column="totalSpent" />
                                                </button>
                                            </th>

                                            <th className="px-6 py-4 text-left font-semibold text-gray-900">Newsletter</th>
                                            <th className="px-6 py-4 text-left font-semibold text-gray-900">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {sortedCustomers.map((customer, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-gray-50 transition cursor-pointer"
                                                onClick={() => openCustomerModal(customer)}
                                            >
                                                <td className="px-6 py-4 text-gray-900 font-medium">{customer.name}</td>
                                                <td className="px-6 py-4 text-gray-600">{customer.email}</td>
                                                <td className="px-6 py-4 text-gray-600">{customer.phone}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                                        {customer.orderCount}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-green-600">
                                                    £{customer.totalSpent.toFixed(2)}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${customer.isNewsletterSubscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {customer.isNewsletterSubscribed ? 'Subscribed' : 'Not Subscribed'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openCustomerModal(customer);
                                                        }}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                                                    >

                                                        <i className="fa-solid fa-file"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Customer Details Modal */}
                {showModal && selectedCustomer && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        onClick={closeModal}
                    >
                        <div
                            className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between sticky top-0 z-10">
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
                                    <p className="text-blue-100 mt-1">{selectedCustomer.email}</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-white hover:bg-blue-800 rounded-full p-2 transition"
                                >
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </div>

                            {/* Modal Content - Two Column Layout */}
                            <div className="grid grid-cols-3 gap-6 p-8">
                                {/* Left Column - Main Content */}
                                <div className="col-span-2 space-y-8">
                                    {/* Stats */}
                                    {selectedCustomer.orderCount > 0 && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                                <p className="text-gray-600 text-sm font-semibold">Total Orders</p>
                                                <p className="text-3xl font-bold text-blue-600 mt-2">{selectedCustomer.orderCount}</p>
                                            </div>
                                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                                <p className="text-gray-600 text-sm font-semibold">Total Spent</p>
                                                <p className="text-3xl font-bold text-green-600 mt-2">
                                                    £{selectedCustomer.totalSpent.toFixed(2)}
                                                </p>
                                            </div>

                                        </div>
                                    )}
                                    {/* Recent Orders */}
                                    {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">Order History</h3>
                                            <div className="space-y-3">
                                                {selectedCustomer.orders.slice(0, 3).map((order, idx) => (
                                                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <p className="font-bold text-lg text-gray-900">{order.orderId || `Order #${order.orderNumber}`}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric',
                                                                    })} at {new Date(order.createdAt).toLocaleTimeString('en-GB', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span
                                                                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'delivered'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : order.status === 'shipped'
                                                                            ? 'bg-blue-100 text-blue-800'
                                                                            : order.status === 'cancelled'
                                                                                ? 'bg-red-100 text-red-800'
                                                                                : 'bg-yellow-100 text-yellow-800'
                                                                        }`}
                                                                >
                                                                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                                                </span>
                                                                <p className="font-bold text-lg text-gray-900 mt-2">£{order.totalPrice?.toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                        {order.orderItems && order.orderItems.length > 0 && (
                                                            <div className="pt-3 border-t space-y-3">
                                                                {order.orderItems.map((item, itemIdx) => (
                                                                    <div key={itemIdx} className="flex gap-4">
                                                                        {/* Product Image */}
                                                                        <div className="flex-shrink-0">
                                                                            {item.image ? (
                                                                                <img
                                                                                    src={item.image}
                                                                                    alt={item.name}
                                                                                    className="w-20 h-20 object-cover rounded border border-gray-200"
                                                                                />
                                                                            ) : (
                                                                                <div className="w-20 h-20 bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
                                                                                    <i className="fas fa-image text-gray-400"></i>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Product Details */}
                                                                        <div className="flex-1">
                                                                            <p className="font-semibold text-gray-900 text-sm leading-tight mb-2">
                                                                                {item.name}
                                                                            </p>

                                                                            {/* Variants - Display from selectedVariants, selectedSize, selectedColor */}
                                                                            <div className="mb-2 text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block">
                                                                                {item.selectedVariants && typeof item.selectedVariants === 'object' && Object.keys(item.selectedVariants).length > 0 ? (
                                                                                    Object.entries(item.selectedVariants).map(([key, value], idx) => (
                                                                                        <span key={key} className="inline mr-2">
                                                                                            <span className="font-semibold">{key}:</span> <span>{value}</span>
                                                                                            {idx < Object.entries(item.selectedVariants).length - 1 && <span className="mx-1">•</span>}
                                                                                        </span>
                                                                                    ))
                                                                                ) : (
                                                                                    <>
                                                                                        {item.selectedSize && (
                                                                                            <span className="inline mr-2">
                                                                                                <span className="font-semibold">Size:</span> <span>{item.selectedSize}</span>
                                                                                            </span>
                                                                                        )}
                                                                                        {item.selectedColor && (
                                                                                            <span className="inline mr-2">
                                                                                                <span className="font-semibold">Color:</span> <span>{item.selectedColor}</span>
                                                                                            </span>
                                                                                        )}
                                                                                        {!item.selectedSize && !item.selectedColor && !item.selectedVariants && (
                                                                                            <span className="text-gray-500">No variants</span>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </div>

                                                                            {/* SKU if available */}
                                                                            {item.sku && (
                                                                                <p className="text-xs text-gray-500 mb-2">SKU: {item.sku}</p>
                                                                            )}

                                                                            {/* Quantity and Price Row */}
                                                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                                                                <div>
                                                                                    <span className="text-xs text-gray-600">Qty: </span>
                                                                                    <span className="text-sm font-bold text-gray-900">{item.qty || item.quantity || 1}</span>
                                                                                </div>
                                                                                <span className="text-sm font-bold text-gray-900">
                                                                                    £{((item.price || 0) * (item.qty || item.quantity || 1)).toFixed(2)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {selectedCustomer.orders.length > 3 && (
                                                    <p className="text-center text-gray-600 text-sm mt-3 font-semibold">
                                                        +{selectedCustomer.orders.length - 3} more orders
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {!selectedCustomer.orders || selectedCustomer.orders.length === 0 && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                                            <i className="fas fa-envelope text-3xl text-blue-600 mb-3"></i>
                                            <p className="text-gray-900 font-semibold mb-2">Newsletter Subscriber</p>
                                            <p className="text-gray-600 text-sm">This customer is subscribed to the newsletter but hasn't placed any orders yet.</p>
                                        </div>
                                    )}


                                </div>

                                {/* Right Column - Customer Details */}
                                <div className="col-span-1 space-y-6">
                                    {/* Contact Information Card */}
                                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                        <h4 className="text-sm font-bold text-gray-900 mb-4">Contact Information</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1 font-semibold">Email</p>
                                                <p className="text-sm text-blue-600 font-medium break-all">
                                                    {selectedCustomer.email}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1 font-semibold">Phone</p>
                                                <p className="text-sm text-gray-900 font-medium">{selectedCustomer.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1 font-semibold">Full Name</p>
                                                <p className="text-sm text-gray-900 font-medium">{selectedCustomer.name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping and Billing Address Cards */}
                                    {selectedCustomer.address && Object.keys(selectedCustomer.address).length > 0 && (
                                        <div className="space-y-4">
                                            {/* Shipping Address Card */}
                                            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                                <h4 className="text-sm font-bold text-gray-900 mb-4">Shipping Address</h4>
                                                <div className="space-y-1 text-sm text-gray-900">
                                                    <p className="font-semibold">{selectedCustomer.address.firstName} {selectedCustomer.address.lastName}</p>
                                                    <p>{selectedCustomer.address.address}</p>
                                                    {selectedCustomer.address.apartment && <p>{selectedCustomer.address.apartment}</p>}
                                                    <p>
                                                        {selectedCustomer.address.city}, {selectedCustomer.address.state}{' '}
                                                        {selectedCustomer.address.postalCode}
                                                    </p>
                                                    <p>{selectedCustomer.address.country}</p>
                                                </div>
                                            </div>

                                            {/* Billing Address Card */}
                                            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                                <h4 className="text-sm font-bold text-gray-900 mb-4">Billing Address</h4>
                                                <div className="space-y-1 text-sm text-gray-900">
                                                    <p className="font-semibold">{selectedCustomer.address.firstName} {selectedCustomer.address.lastName}</p>
                                                    <p>{selectedCustomer.address.address}</p>
                                                    {selectedCustomer.address.apartment && <p>{selectedCustomer.address.apartment}</p>}
                                                    <p>
                                                        {selectedCustomer.address.city}, {selectedCustomer.address.state}{' '}
                                                        {selectedCustomer.address.postalCode}
                                                    </p>
                                                    <p>{selectedCustomer.address.country}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Member Since Card */}
                                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                        <h4 className="text-sm font-bold text-gray-900 mb-4">Account Information</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1 font-semibold">Member Since</p>
                                                <p className="text-sm text-gray-900 font-medium">
                                                    {new Date(selectedCustomer.createdAt).toLocaleDateString('en-GB', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                            <div className="pt-3 border-t">
                                                <p className="text-xs text-gray-600 mb-2 font-semibold">Newsletter Status</p>
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${selectedCustomer.isNewsletterSubscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {selectedCustomer.isNewsletterSubscribed ? '✓ Subscribed' : '✗ Not Subscribed'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="border-t bg-gray-50 p-6 flex justify-end gap-3">
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminCustomersPage;
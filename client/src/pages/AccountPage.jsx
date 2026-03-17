'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders } from '../redux/slices/orderSlice';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AccountPageContent = () => {
    const dispatch = useDispatch();
    const { user, token } = useAuth();
    const { orders, loading, error } = useSelector((state) => state.order);

    useEffect(() => {
        // Only fetch user orders if authenticated
        if (token) {
            dispatch(fetchUserOrders());
        }
    }, [dispatch, token]);

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-[var(--color-text-primary)]">My Account</h1>
                <p className="text-[var(--color-text-light)] mb-8">View your orders</p>

                {!token && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
                        <p className="text-blue-700 font-semibold mb-3">Guest Mode</p>
                        <p className="text-blue-600 mb-4">You're browsing as a guest. You can view your order details by entering the order ID from your confirmation email.</p>
                        <Link to="/order-lookup" className="inline-block text-blue-700 font-bold hover:underline">Find your order →</Link>
                    </div>
                )}

                <section className="mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-[var(--color-text-primary)] border-b-2 border-[var(--color-accent-primary)] pb-3">Order History</h2>
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent-primary)] mb-4"></div>
                                <p className="text-[var(--color-text-light)]">Loading orders...</p>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                            <p className="text-red-700 font-semibold">{error}</p>
                        </div>
                    )}
                    {!loading && orders && orders.length === 0 && (
                        <div className="bg-[var(--color-bg-section)] border-l-4 border-[var(--color-accent-primary)] p-6 rounded-lg">
                            <p className="text-[var(--color-text-primary)] font-semibold mb-3">You have not placed any orders yet.</p>
                            <Link to="/products" className="inline-block text-[var(--color-accent-primary)] font-bold hover:underline">Start shopping →</Link>
                        </div>
                    )}

                    {!loading && orders && orders.length > 0 && (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order._id} className="bg-white border border-[var(--color-border-light)] rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-xs sm:text-sm text-[var(--color-text-light)] font-mono">Order ID: <span className="font-bold text-[var(--color-text-primary)]">{order.orderId || order._id}</span></p>
                                        <p className="font-bold text-base sm:text-lg text-[var(--color-text-primary)] mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        <p className="text-sm text-[var(--color-text-light)] mt-1">Items: <span className="font-semibold">{order.orderItems ? order.orderItems.length : 0}</span></p>
                                        {/* show variant details inline */}
                                        {order.orderItems && order.orderItems.length > 0 && (
                                            <div className="mt-3 space-y-2 text-xs sm:text-sm text-[var(--color-text-light)]">
                                                {order.orderItems.map((it, idx) => {
                                                    const parts = [];
                                                    if (it.selectedSize) parts.push(`Size: ${it.selectedSize}`);
                                                    if (it.selectedColor) parts.push(`Color: ${it.selectedColor}`);
                                                    if (it.selectedVariants && typeof it.selectedVariants === 'object') {
                                                        Object.entries(it.selectedVariants).forEach(([k, v]) => { if (v) parts.push(`${k}: ${v}`); });
                                                    }
                                                    if (it.variantId) parts.push(`VariantId: ${it.variantId}`);
                                                    return (
                                                        <div key={it._id || idx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 bg-[var(--color-bg-section)] p-2 rounded">
                                                            <div className="font-semibold text-[var(--color-text-primary)]">{it.name}</div>
                                                            <div className="text-xs text-[var(--color-text-light)]">{parts.join(' / ')}</div>
                                                            <div className="text-xs font-semibold text-[var(--color-accent-primary)]">x{it.qty || it.quantity || 1}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <div className="md:text-right">
                                        <p className="text-xl md:text-2xl font-bold text-[var(--color-accent-primary)]">{order.totalPrice ? `£${order.totalPrice.toFixed(2)}` : ''}</p>
                                        <div className="mt-3 flex flex-wrap gap-2 md:justify-end">
                                            {order.isPaid && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800`}>
                                                    ✓ Paid
                                                </span>
                                            )}
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-[var(--color-bg-section)] text-[var(--color-text-light)]'}`}>
                                                {order.status === 'completed' ? '✓ Fulfilled' : '○ Unfulfilled'}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.isDelivered ? 'bg-green-100 text-green-800' : (order.status === 'shipped' ? 'bg-orange-100 text-orange-800' : 'bg-[var(--color-bg-section)] text-[var(--color-text-light)]')}`}>
                                                {order.isDelivered ? '✓ Delivered' : (order.status === 'shipped' ? '📦 Shipped' : '⏳ Processing')}
                                            </span>
                                        </div>
                                        <div className="mt-4">
                                            <Link to={`/order/${order._id}`} className="inline-block text-sm font-bold text-[var(--color-accent-primary)] hover:text-[var(--color-accent-light)] transition duration-300">View Details →</Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
};

export default AccountPageContent;

'use client';

import React, { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const OrderLookupPage = () => {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API}/api/orders/${orderId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Order not found');
      }

      // Order found, navigate to order detail page
      navigate(`/order/${orderId}`);
    } catch (err) {
      toast.error(err.message || 'Order not found. Please check the order ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Find Your Order | Wolf Supplies</title>
        <meta name="description" content="Track your Wolf Supplies order. Enter your order ID from your confirmation email to view delivery details and status." />
        <meta name="keywords" content="order tracking, order lookup, order status, delivery" />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://wolfsupplies.co.uk/order-lookup" />
        <meta property="og:title" content="Find Your Order | Wolf Supplies" />
        <meta property="og:description" content="Track your order status and delivery details." />
        <meta property="og:url" content="https://wolfsupplies.co.uk/order-lookup" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Find Your Order | Wolf Supplies" />
        <meta name="twitter:description" content="Track your order status." />
      </Helmet>
      <div className="min-h-screen bg-[var(--color-bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-[var(--color-text-primary)]">Find Your Order</h1>
          <p className="text-lg text-[var(--color-text-light)]">
            Enter your order ID from your confirmation email to view order details
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="orderId" className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                Order ID
              </label>
              <div className="flex gap-3 flex-col md:flex-row">
                <input
                  id="orderId"
                  type="text"
                  placeholder="e.g., ORD-123456789-abc123 or just the ID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="flex-1 px-4 py-3 border border-[var(--color-border-light)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-lg font-bold text-white transition duration-300 flex items-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-accent-primary)' }}
                >
                  <i className="fas fa-search"></i>
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
              <p className="text-xs text-[var(--color-text-light)] mt-2">
                You can find your order ID in the confirmation email sent after checkout
              </p>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-[var(--color-border-light)]">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">How to find your Order ID:</h2>
            <ol className="space-y-3 text-sm text-[var(--color-text-light)]">
              <li className="flex gap-3">
                <span className="font-bold text-[var(--color-accent-primary)] flex-shrink-0">1.</span>
                <span>Check your email for the order confirmation message</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[var(--color-accent-primary)] flex-shrink-0">2.</span>
                <span>Look for "Order ID" or "Order Number" in the email</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[var(--color-accent-primary)] flex-shrink-0">3.</span>
                <span>Copy the ID and paste it above to view your order details</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default OrderLookupPage;

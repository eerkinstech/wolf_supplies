'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from "react-router-dom";
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const API = import.meta.env.VITE_API_URL || '';

// Helper to get absolute image URL - handles strings and objects
const getImgSrc = (img) => {
  if (!img) return '';

  // Handle string URLs
  if (typeof img === 'string') {
    if (!img.trim()) return '';
    return img.startsWith('http') ? img : `${API}${img}`;
  }

  // Handle image objects (from Cloudinary or similar)
  if (typeof img === 'object') {
    const url = img.url || img.secure_url || img.public_url || img.path || img.src || '';
    if (!url) return '';
    if (typeof url === 'string') {
      return url.startsWith('http') ? url : `${API}${url}`;
    }
  }

  return '';
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { token, user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API}/api/orders/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to load order');
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token, searchParams]);

  const downloadPDF = () => {
    if (!order) return;

    const orderId = order.orderId || `ORD-${new Date(order.createdAt).toISOString().slice(0, 10).replace(/-/g, '')}-${order._id?.slice(-6)}`;
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Get CSS variable values from document root
    const root = document.documentElement;
    const colorBgPrimary = getComputedStyle(root).getPropertyValue('--color-bg-primary')?.trim() || '#ffffff';
    const colorBgSection = getComputedStyle(root).getPropertyValue('--color-bg-section')?.trim() || '#f5f5f5';
    const colorAccentPrimary = getComputedStyle(root).getPropertyValue('--color-accent-primary')?.trim() || '#a5632a';
    const colorTextPrimary = getComputedStyle(root).getPropertyValue('--color-text-primary')?.trim() || '#333333';
    const colorTextLight = getComputedStyle(root).getPropertyValue('--color-text-light')?.trim() || '#666666';
    const colorBorderLight = getComputedStyle(root).getPropertyValue('--color-border-light')?.trim() || '#dddddd';

    // Create HTML content for PDF with dynamic CSS variables
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background-color: ${colorBgSection};
            color: ${colorTextPrimary};
            line-height: 1.6;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: ${colorBgPrimary};
            padding: 40px 30px;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid ${colorAccentPrimary};
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 32px;
            color: ${colorTextPrimary};
            margin-bottom: 10px;
            font-weight: 700;
          }
          .order-info {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
            font-size: 13px;
            color: ${colorTextLight};
            margin-top: 10px;
          }
          .order-info-item {
            font-family: 'Courier New', monospace;
          }
          .order-info-label {
            font-weight: 600;
            color: ${colorTextPrimary};
          }
          .important-banner {
            background-color: ${colorBgSection};
            border: 2px solid ${colorAccentPrimary};
            border-left: 5px solid ${colorAccentPrimary};
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 4px;
          }
          .important-banner h3 {
            font-size: 14px;
            color: ${colorAccentPrimary};
            margin-bottom: 8px;
            font-weight: 700;
          }
          .important-banner p {
            font-size: 13px;
            color: ${colorTextPrimary};
            margin: 5px 0;
            font-weight: 500;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: ${colorTextPrimary};
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid ${colorAccentPrimary};
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .info-card {
            background-color: ${colorBgSection};
            border: 1px solid ${colorBorderLight};
            padding: 15px;
            border-radius: 4px;
          }
          .info-card-title {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
            font-size: 14px;
            font-weight: 700;
            color: ${colorTextPrimary};
          }
          .info-card-icon {
            display: inline-block;
            width: 24px;
            height: 24px;
            background-color: ${colorAccentPrimary};
            color: white;
            border-radius: 3px;
            text-align: center;
            line-height: 24px;
            font-size: 12px;
            font-weight: bold;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 13px;
          }
          .items-table thead {
            background-color: ${colorBgSection};
            border-bottom: 2px solid ${colorAccentPrimary};
          }
          .items-table th {
            padding: 12px 10px;
            text-align: left;
            font-weight: 700;
            color: ${colorTextPrimary};
          }
          .items-table td {
            padding: 12px 10px;
            border-bottom: 1px solid ${colorBorderLight};
          }
          .items-table tr:last-child td {
            border-bottom: none;
          }
          .totals-section {
            background-color: ${colorBgSection};
            border: 1px solid ${colorBorderLight};
            padding: 20px;
            border-radius: 4px;
            margin-top: 20px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 13px;
            border-bottom: 1px solid ${colorBorderLight};
          }
          .total-row:last-child {
            border-bottom: none;
          }
          .total-row.grand-total {
            background-color: ${colorAccentPrimary};
            color: white;
            padding: 15px;
            margin: 0 -20px -20px -20px;
            padding-left: 20px;
            padding-right: 20px;
            border-radius: 0 0 4px 4px;
            font-weight: 700;
            font-size: 14px;
          }
          .status-section {
            margin-top: 20px;
          }
          .badges {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 10px;
          }
          .badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            display: inline-block;
          }
          .badge.paid {
            background-color: #d4edda;
            color: #155724;
          }
          .badge.processing {
            background-color: #e2e3e5;
            color: #383d41;
          }
          .badge.completed {
            background-color: #d1ecf1;
            color: #0c5460;
          }
          .badge.shipped {
            background-color: #fff3cd;
            color: #856404;
          }
          .badge.delivered {
            background-color: #d4edda;
            color: #155724;
          }
          .grid-4 {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
          .contact-field {
            background-color: ${colorBgSection};
            border: 1px solid ${colorBorderLight};
            padding: 10px;
            border-radius: 4px;
          }
          .contact-field-label {
            font-size: 11px;
            font-weight: 600;
            color: ${colorTextLight};
            margin-bottom: 4px;
            text-transform: uppercase;
          }
          .contact-field-value {
            font-size: 13px;
            color: ${colorTextPrimary};
            font-weight: 500;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid ${colorBorderLight};
            text-align: center;
            font-size: 11px;
            color: ${colorTextLight};
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>Order Confirmation</h1>
            <div class="order-info">
              <div class="order-info-item"><span class="order-info-label">Order ID:</span> ${orderId}</div>
              <div class="order-info-item"><span class="order-info-label">Date:</span> ${orderDate}</div>
            </div>
          </div>

          <!-- Important Banner -->
          <div class="important-banner">
            <h3>📌 Keep This For Your Records</h3>
            <p><strong>Order ID: ${orderId}</strong></p>
            <p>Use this ID to track and look up your order status anytime at our website.</p>
          </div>

          <!-- Contact Details Section -->
          <div class="section">
            <h2 class="section-title">Contact Details</h2>
            <div class="grid-4">
              <div class="contact-field">
                <div class="contact-field-label">First Name</div>
                <div class="contact-field-value">${order.contactDetails?.firstName || order.user?.name?.split(' ')[0] || 'N/A'}</div>
              </div>
              <div class="contact-field">
                <div class="contact-field-label">Last Name</div>
                <div class="contact-field-value">${order.contactDetails?.lastName || order.user?.name?.split(' ')[1] || 'N/A'}</div>
              </div>
              <div class="contact-field">
                <div class="contact-field-label">Email</div>
                <div class="contact-field-value">${order.contactDetails?.email || order.user?.email || 'N/A'}</div>
              </div>
              <div class="contact-field">
                <div class="contact-field-label">Phone</div>
                <div class="contact-field-value">${order.contactDetails?.phone || 'N/A'}</div>
              </div>
            </div>
          </div>

          <!-- Addresses Section -->
          <div class="section">
            <h2 class="section-title">Delivery Information</h2>
            <div class="grid-2">
              <div class="info-card">
                <div class="info-card-title">
                  <span class="info-card-icon">📦</span>
                  Shipping Address
                </div>
                ${order.shippingAddress ? `
                  <p style="font-size: 13px; color: ${colorTextPrimary}; margin-bottom: 8px;">
                    <strong>${order.shippingAddress.address}</strong><br/>
                    ${order.shippingAddress.apartment || ''}<br/>
                    ${order.shippingAddress.city}, ${order.shippingAddress.stateRegion} ${order.shippingAddress.postalCode}<br/>
                    ${order.shippingAddress.country}
                  </p>
                ` : `<p style="color: ${colorTextLight}; font-size: 13px;">No shipping address provided</p>`}
              </div>
              <div class="info-card">
                <div class="info-card-title">
                  <span class="info-card-icon">💳</span>
                  Billing Address
                </div>
                ${order.billingAddress ? `
                  <p style="font-size: 13px; color: ${colorTextPrimary}; margin-bottom: 8px;">
                    <strong>${order.billingAddress.address}</strong><br/>
                    ${order.billingAddress.apartment || ''}<br/>
                    ${order.billingAddress.city}, ${order.billingAddress.stateRegion} ${order.billingAddress.postalCode}<br/>
                    ${order.billingAddress.country}
                  </p>
                ` : `<p style="color: ${colorTextLight}; font-size: 13px;">Same as shipping address</p>`}
              </div>
            </div>
          </div>

          <!-- Order Items Section -->
          <div class="section">
            <h2 class="section-title">Order Items</h2>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Variants</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems?.map(item => {
      const variants = [];
      if (item.selectedSize) variants.push(`Size: ${item.selectedSize}`);
      if (item.selectedColor) variants.push(`Color: ${item.selectedColor}`);
      if (item.selectedVariants && typeof item.selectedVariants === 'object') {
        Object.entries(item.selectedVariants).forEach(([k, v]) => {
          if (v) variants.push(`${k}: ${v}`);
        });
      }
      if (item.sku) variants.push(`SKU: ${item.sku}`);

      const variantText = variants.length > 0 ? variants.join(', ') : 'None';

      return `
                    <tr>
                      <td><strong>${item.name}</strong></td>
                      <td style="font-size: 12px; color: ${colorTextLight};">${variantText}</td>
                      <td style="text-align: center;">${item.qty || item.quantity || 1}</td>
                      <td style="text-align: right;">£${(item.price || 0).toFixed(2)}</td>
                      <td style="text-align: right;"><strong>£${((item.price || 0) * (item.qty || item.quantity || 1)).toFixed(2)}</strong></td>
                    </tr>
                  `;
    }).join('') || ''}
              </tbody>
            </table>
          </div>

          <!-- Order Summary Section -->
          <div class="section">
            <h2 class="section-title">Order Summary</h2>
            <div class="totals-section">
              <div class="total-row">
                <span>Items Total:</span>
                <span>£${(order.itemsPrice || 0).toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Shipping Cost:</span>
                <span>£${(order.shippingPrice || 0).toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Tax:</span>
                <span>£${(order.taxPrice || 0).toFixed(2)}</span>
              </div>
              ${order.discountAmount > 0 && order.couponCode ? `
              <div class="total-row" style="color: #10b981; font-weight: bold;">
                <span>Discount (${order.couponCode}):</span>
                <span>-£${(order.discountAmount || 0).toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="total-row grand-total">
                <span>Grand Total:</span>
                <span>£${(order.totalPrice || order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <!-- Status Section -->
          <div class="section status-section">
            <h2 class="section-title">Order Status</h2>
            <div class="badges">
              ${order.fulfillmentStatus === 'fulfilled' ? '<div class="badge completed">✅ Fulfilled</div>' : '<div class="badge processing">⏳ Unfulfilled</div>'}
              ${order.deliveryStatus === 'refunded' ? '<div class="badge refunded" style="background-color: #dc2626; color: white;">⚠️ Refunded</div>' : (order.deliveryStatus === 'delivered' ? '<div class="badge delivered">✓ Delivered</div>' : (order.deliveryStatus === 'shipped' ? '<div class="badge shipped">📦 Shipped</div>' : '<div class="badge processing">⏳ No Status</div>'))}
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p><strong>Thank you for your order!</strong></p>
            <p>This is an automated confirmation document. Please keep it for your records.</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a blob and download
    const element = document.createElement('a');
    const file = new Blob([htmlContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `Order_${orderId}_${new Date().getTime()}.pdf`;
    document.body.appendChild(element);

    // Use html2pdf if available, otherwise use simple download
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => {
      const opt = {
        margin: 10,
        filename: `Order_${orderId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      };

      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      html2pdf().set(opt).from(element).save();
    };
    document.head.appendChild(script);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent-primary)] mb-4"></div>
        <p className="text-[var(--color-text-light)]">Loading order…</p>
      </div>
    </div>
  );
  if (!order) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="text-center">
        <p className="text-[var(--color-text-primary)] font-semibold mb-4">Order not found.</p>
        <Link to="/order-lookup" className="text-[var(--color-accent-primary)] font-bold hover:underline">Back to Order Lookup →</Link>
      </div>
    </div>
  );

  const totals = {
    items: order.itemsPrice ?? (order.orderItems?.reduce((s, it) => s + it.price * it.qty, 0) ?? 0),
    shipping: order.shippingPrice ?? 0,
    tax: order.taxPrice ?? 0,
    total: order.totalPrice ?? order.totalAmount ?? 0,
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-[var(--color-text-primary)]">Order Details</h1>
            <p className="text-sm sm:text-base font-mono text-[var(--color-accent-primary)]">
              <span>Order ID: </span>
              {order.orderId || `ORD-${new Date(order.createdAt).toISOString().slice(0, 10).replace(/-/g, '')}-${order._id?.slice(-6)}`}
            </p>
            <p className="text-xs sm:text-sm text-[var(--color-text-light)] mt-1">
              {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={downloadPDF}
              className="px-6 py-2.5 rounded-lg font-semibold text-white hover:opacity-90 transition duration-300 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--color-accent-primary)' }}
            >
              <i className="fas fa-download"></i> Download PDF
            </button>
            <Link to="/order-lookup" className="px-6 py-2.5 rounded-lg font-semibold text-white hover:opacity-90 transition duration-300 text-center" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
              ← Back to Order Lookup
            </Link>
          </div>
        </div>

        {/* Important Banner - Keep Order ID */}
        <div className="mb-8 p-4 sm:p-6 rounded-lg border-l-4" style={{
          backgroundColor: 'var(--color-bg-section, #f5f5f5)',
          borderLeftColor: 'var(--color-accent-primary)'
        }}>
          <p className="text-sm sm:text-base font-semibold text-[var(--color-text-primary)]">
            📌 Keep your Order ID saved kindly for future reference and tracking.
          </p>
        </div>

        {/* Customer Information Section */}
        <div className="mb-8 p-4 sm:p-6 rounded-lg border-2" style={{
          backgroundColor: 'var(--color-bg-section, #e5e5e5)',
          borderColor: 'var(--color-border-light, #e5e5e5)'
        }}>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-[var(--color-text-primary)]">Contact Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <p className="text-xs sm:text-sm mb-1 font-semibold text-[var(--color-text-light)]">First Name</p>
              <p className="text-sm sm:text-base text-[var(--color-text-primary)]">{order.contactDetails?.firstName || order.user?.name?.split(' ')[0] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm mb-1 font-semibold text-[var(--color-text-light)]">Last Name</p>
              <p className="text-sm sm:text-base text-[var(--color-text-primary)]">{order.contactDetails?.lastName || order.user?.name?.split(' ')[1] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm mb-1 font-semibold text-[var(--color-text-light)]">Email</p>
              <p className="text-sm sm:text-base text-[var(--color-text-primary)]">
                {order.contactDetails?.email || order.user?.email || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm mb-1 font-semibold text-[var(--color-text-light)]">Phone</p>
              <p className="text-sm sm:text-base text-[var(--color-text-primary)]">
                {order.contactDetails?.phone || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping & Billing Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Shipping Address */}
          <div className="p-4 sm:p-6 rounded-lg border-2" style={{
            backgroundColor: 'var(--color-bg-section, #e5e5e5)',
            borderColor: 'var(--color-border-light, #e5e5e5)'
          }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }}>
                <i className="fas fa-truck" style={{ color: 'white', fontSize: '18px' }}></i>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">Shipping Address</h3>
            </div>
            {order.shippingAddress ? (
              <div className="space-y-2 text-sm sm:text-base text-[var(--color-text-primary)]">
                <p className="font-semibold">{order.shippingAddress.address}</p>
                {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
                <p>{order.shippingAddress.city}{order.shippingAddress.stateRegion ? `, ${order.shippingAddress.stateRegion}` : ''} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            ) : (
              <p className="text-[var(--color-text-light)]">No shipping address provided</p>
            )}
          </div>

          {/* Billing Address */}
          <div className="p-4 sm:p-6 rounded-lg border-2" style={{
            backgroundColor: 'var(--color-bg-section, #e5e5e5)',
            borderColor: 'var(--color-border-light, #e5e5e5)'
          }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }}>
                <i className="fas fa-credit-card" style={{ color: 'white', fontSize: '18px' }}></i>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">Billing Address</h3>
            </div>
            {order.billingAddress ? (
              <div className="space-y-2 text-sm sm:text-base text-[var(--color-text-primary)]">
                <p className="font-semibold">{order.billingAddress.address}</p>
                {order.billingAddress.apartment && <p>{order.billingAddress.apartment}</p>}
                <p>{order.billingAddress.city}{order.billingAddress.stateRegion ? `, ${order.billingAddress.stateRegion}` : ''} {order.billingAddress.postalCode}</p>
                <p>{order.billingAddress.country}</p>
              </div>
            ) : (
              <p className="text-[var(--color-text-light)]">Same as shipping address</p>
            )}
          </div>
        </div>

        {/* Order Items Section */}
        <div className="mb-8 p-4 sm:p-6 rounded-lg border-2" style={{
          backgroundColor: 'white',
          borderColor: 'var(--color-border-light, #e5e5e5)'
        }}>
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text-primary)]">Order Items</h2>
          <div className="space-y-4">
            {order.orderItems && order.orderItems.map((item) => {
              const parts = [];
              if (item.selectedSize) parts.push(`Size: ${item.selectedSize}`);
              if (item.selectedColor) parts.push(`Color: ${item.selectedColor}`);
              if (item.selectedVariants && typeof item.selectedVariants === 'object') {
                Object.entries(item.selectedVariants).forEach(([k, v]) => {
                  if (v) parts.push(`${k}: ${v}`);
                });
              }
              if (item.variantId) parts.push(`VariantId: ${item.variantId}`);
              if (item.sku) parts.push(`SKU: ${item.sku}`);

              return (
                <div key={item._id || item.product} className="flex gap-3 sm:gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border-light, #e5e5e5)' }}>
                  <img
                    src={getImgSrc(item.image)}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base text-[var(--color-text-primary)]">{item.name}</h3>
                    {parts.length > 0 && <p className="text-xs sm:text-sm mt-1 text-[var(--color-text-light)]">{parts.join(' / ')}</p>}
                    <p className="text-xs sm:text-sm mt-1 text-[var(--color-text-secondary)]">Qty: {item.qty} × £{Number(item.price).toFixed(2)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-base sm:text-lg text-[var(--color-accent-primary)]">
                      £{(item.qty * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary & Payment Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Summary */}
          <div className="md:col-span-2 p-4 sm:p-6 rounded-lg border-2" style={{
            backgroundColor: 'white',
            borderColor: 'var(--color-border-light, #e5e5e5)'
          }}>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-[var(--color-text-primary)]">Order Summary</h3>
            <div className="space-y-3 text-sm sm:text-base">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Items Subtotal:</span>
                <span className="font-bold text-[var(--color-text-primary)]">£{totals.items.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Shipping:</span>
                <span className="font-bold text-[var(--color-text-primary)]">£{totals.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Tax:</span>
                <span className="font-bold text-[var(--color-text-primary)]">£{totals.tax.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && order.couponCode && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Discount ({order.couponCode}):</span>
                  <span className="font-bold text-green-600">-£{Number(order.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between" style={{ borderColor: 'var(--color-border-light, #e5e5e5)' }}>
                <span className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">Grand Total:</span>
                <span className="text-base sm:text-lg font-bold text-[var(--color-accent-primary)]">£{totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Fulfillment & Delivery Status */}
          <div className="p-4 sm:p-6 rounded-lg border-2" style={{
            backgroundColor: 'white',
            borderColor: 'var(--color-border-light, #e5e5e5)'
          }}>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-[var(--color-text-primary)]">Status</h3>
            <div className="space-y-3">
              <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
                <p className="text-xs sm:text-sm mb-1 font-semibold text-[var(--color-text-light)]">Fulfillment</p>
                <p className="font-bold text-sm sm:text-base text-[var(--color-text-primary)]">
                  {order.fulfillmentStatus === 'fulfilled' ? '✅ Fulfilled' : '⏳ Unfulfilled'}
                </p>
              </div>
              <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
                <p className="text-xs sm:text-sm mb-1 font-semibold text-[var(--color-text-light)]">Delivery Status</p>
                <p className="font-bold text-sm sm:text-base text-[var(--color-text-primary)]">
                  {order.deliveryStatus === 'refunded' ? '⚠️ Refunded' : (order.deliveryStatus === 'delivered' ? '✓ Delivered' : (order.deliveryStatus === 'shipped' ? '📦 Shipped' : '⏳ No Status'))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;

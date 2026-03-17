'use client';

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';


const PoliciesReturnsPage = () => {

  return (
    <>
      {/* Meta Tags */}
      <Helmet>
        <title>Returns &amp; Refunds Policy | Wolf Supplies</title>
        <meta name="description" content="Wolf Supplies offers a 31-day return and refund policy. Free return shipping on all UK orders. Learn how to start a return." />
        <meta name="keywords" content="Wolf Supplies returns, refund policy, 31 day return, free return shipping, UK returns" />
        <meta name="robots" content="index, follow" />
        {/* Canonical URL */}
        <link rel="canonical" href="https://wolfsupplies.co.uk/policies/returns" />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Returns &amp; Refunds Policy | Wolf Supplies" />
        <meta property="og:description" content="Wolf Supplies offers a 31-day return and refund policy. Free return shipping on all UK orders. Learn how to start a return." />
        <meta property="og:image" content="https://wolfsupplies.co.uk/default-image.jpg" />
        <meta property="og:url" content="https://wolfsupplies.co.uk/policies/returns" />
        <meta property="og:type" content="website" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Returns &amp; Refunds Policy | Wolf Supplies" />
        <meta name="twitter:description" content="Wolf Supplies offers a 31-day return and refund policy. Free return shipping on all UK orders. Learn how to start a return." />
      </Helmet>

      <div className="min-h-screen bg-[var(--color-bg-section)]">
        {/* Header Section */}
        <div className="bg-[var(--color-accent-primary)] text-white py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-2 mb-4 hover:text-gray-100 w-fit">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <i className="fas fa-undo-alt text-4xl"></i>
              <h1 className="text-4xl md:text-5xl font-bold">Return & Refunds Policy</h1>
            </div>
            <p className="text-gray-100 text-lg">31 Days Return & Refund - UK</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Overview */}
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <i className="fas fa-clock text-[var(--color-accent-primary)] text-2xl" style={{ display: 'block' }}></i>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">31 Days Return & Refund Window</h2>
            </div>
            <p className="text-[var(--color-text-light)] mb-4 leading-relaxed">
              At Wolf Supplies, we want you to be completely satisfied with your purchase. If you're not happy with your item, you can return it within <span className="font-bold text-[var(--color-accent-primary)]">31 days</span> of delivery for a full refund. This forms our <strong>31 Days Return & Refund</strong> policy.
            </p>
            <div className="bg-[var(--color-bg-section)] border-l-4 border-orange-500 p-4 rounded mb-4">
              <p className="text-[var(--color-text-light)]">
                <strong>Important:</strong> We do not accept exchanges. All returns result in a full refund to your original payment method.
              </p>
            </div>
            <div className="bg-[var(--color-bg-section)] border-l-4 border-[var(--color-accent-primary)] p-4 rounded mb-4">
              <p className="text-[var(--color-text-light)] mb-2">
                <strong>Consumer Rights:</strong> This policy complies with UK Consumer Rights Act 2015 and provides protection for all purchases.
              </p>
            </div>
            <div className="bg-[var(--color-bg-section)] border-l-4 border-[var(--color-accent-primary)] p-4 rounded text-sm">
              <p className="text-[var(--color-text-light)]"><strong>Wolf Supplies| Company Number: <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-primary)] hover:underline">16070029</a></strong></p>
              <p className="text-[var(--color-text-light)]">Unit 4 Atlas Estates, Colebrook Road, Birmingham, West Midlands, B11 2NT, United Kingdom</p>
            </div>
          </div>

          {/* Return Eligibility */}
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">What Can Be Returned?</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Eligible */}
              <div>
                <h3 className="text-xl font-bold text-[var(--color-accent-primary)] mb-4">✅ Eligible for Return</h3>
                <ul className="space-y-3 text-[var(--color-text-light)]">
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent-primary)] font-bold">✓</span>
                    <span>Unused items in original packaging</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent-primary)] font-bold">✓</span>
                    <span>Defective or damaged products</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent-primary)] font-bold">✓</span>
                    <span>Wrong item sent</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent-primary)] font-bold">✓</span>
                    <span>Item not as described</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-accent-primary)] font-bold">✓</span>
                    <span>Faulty items</span>
                  </li>
                </ul>
              </div>

              {/* Non-Eligible */}
              <div>
                <h3 className="text-xl font-bold text-red-600 mb-4">❌ Not Eligible for Return</h3>
                <ul className="space-y-3 text-[var(--color-text-light)]">
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Items used or worn</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Damage caused by misuse</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Missing original packaging</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Items returned after 31 days</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* How to Start a Return */}
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">How to Start a Return</h2>
            <p className="text-[var(--color-text-light)] mb-6 leading-relaxed">
              Starting a return is easy! You have multiple ways to contact us:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Methods */}
              <div className="space-y-4">
                <div className="bg-[var(--color-bg-section)] p-4 rounded border-l-4 border-[var(--color-accent-primary)]">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-comments" style={{ color: 'var(--color-accent-primary)', fontSize: '20px', display: 'block' }}></i>
                    <h3 className="font-bold text-[var(--color-text-primary)]">Chat Bubble</h3>
                  </div>
                  <p className="text-[var(--color-text-light)] text-sm">Use the chat bubble on our website to instantly message our support team during business hours.</p>
                </div>
                <div className="bg-[var(--color-bg-section)] p-4 rounded border-l-4 border-[var(--color-accent-primary)]">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-envelope" style={{ color: 'var(--color-accent-primary)', fontSize: '20px', display: 'block' }}></i>
                    <h3 className="font-bold text-[var(--color-text-primary)]">Email</h3>
                  </div>
                  <p className="text-[var(--color-text-light)] text-sm"><a href="mailto:sales@wolfsupplies.co.uk" className="text-[var(--color-accent-primary)] hover:underline font-semibold">sales@wolfsupplies.co.uk</a> - We'll respond within 24 hours</p>
                </div>
                <div className="bg-[var(--color-bg-section)] p-4 rounded border-l-4 border-[var(--color-accent-primary)]">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-phone" style={{ color: 'var(--color-accent-primary)', fontSize: '20px', display: 'block' }}></i>
                    <h3 className="font-bold text-[var(--color-text-primary)]">Phone</h3>
                  </div>
                  <p className="text-[var(--color-text-light)] text-sm"><a href="tel:+447398998101" className="text-[var(--color-accent-primary)] hover:underline font-semibold">+44 7398 998101</a> - Mon-Fri, 9 AM - 6 PM GMT</p>
                </div>
              </div>
              <div className="bg-[var(--color-bg-section)] p-4 rounded border-l-4 border-blue-500">
                <h3 className="font-bold text-[var(--color-text-primary)] mb-3">📋 What to Include</h3>
                <ul className="space-y-2 text-[var(--color-text-light)] text-sm">
                  <li>✓ Your order number</li>
                  <li>✓ Reason for return</li>
                  <li>✓ Item description</li>
                  <li>✓ Photos (if applicable)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Return Shipping */}
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Return Shipping</h2>
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded mb-6">
              <p className="text-green-900 font-bold text-lg">✓ FREE Return Shipping</p>
              <p className="text-green-800 mt-2">All returns are shipped FREE of charge. We'll provide a prepaid return label with your return authorization.</p>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-[var(--color-text-primary)] mb-2">Return Process Steps:</h3>
                <ol className="list-decimal list-inside text-[var(--color-text-light)] space-y-2">
                  <li>Contact us to request a return</li>
                  <li>Receive return authorization and prepaid shipping label</li>
                  <li>Pack the item securely in original packaging</li>
                  <li>Use the provided label to ship at no cost</li>
                  <li>We'll inspect and process your refund</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Refund Details */}
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-md p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <i className="fas fa-money-bill-wave" style={{ color: 'var(--color-accent-primary)', fontSize: '24px' }}></i>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Refund Details</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-[var(--color-text-primary)] mb-2">🔄 Refund Timeline</h3>
                <p className="text-[var(--color-text-light)] mb-3">
                  Once we receive and inspect your returned item:
                </p>
                <ul className="list-disc list-inside text-[var(--color-text-light)] space-y-2">
                  <li>Inspection: 3-5 business days</li>
                  <li>Refund Approval: 1-2 business days</li>
                  <li>Refund Processing: 5-10 business days to your original payment method</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-[var(--color-text-primary)] mb-2">💳 What Gets Refunded</h3>
                <ul className="list-disc list-inside text-[var(--color-text-light)] space-y-2">
                  <li>Full product price</li>

                </ul>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-[var(--color-bg-section)] rounded-lg border-2 border-[var(--color-border-light)] p-8">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Need Help With a Return?</h2>
            <p className="text-[var(--color-text-light)] mb-4">
              Our support team is ready to assist you:
            </p>
            <div className="space-y-2 text-[var(--color-text-light)]">
              <p><i className="fas fa-envelope inline mr-2" style={{ color: 'var(--color-accent-primary)' }}></i> Email: <a href="mailto:sales@wolfsupplies.co.uk" className="text-[var(--color-accent-primary)] hover:underline">sales@wolfsupplies.co.uk</a></p>
              <p><i className="fas fa-phone inline mr-2" style={{ color: 'var(--color-accent-primary)' }}></i> Phone: <a href="tel:+447398998101" className="text-[var(--color-accent-primary)] hover:underline">+44 7398 998101</a></p>
              <p>⏰ Hours: Monday - Friday, 9 AM - 6 PM GMT</p>
            </div>
          </div>

          {/* Last Updated */}
          <p className="text-center text-[var(--color-text-light)] text-sm mt-8">
            Last updated: January 19, 2026 | Wolf Supplies
          </p>
        </div>
      </div>
    </>
  );
};

export default PoliciesReturnsPage;

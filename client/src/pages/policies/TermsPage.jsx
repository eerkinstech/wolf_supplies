'use client';

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';


const PoliciesTermsPage = () => {

  return (
    <>
      <Helmet>
        <title>Terms of Service | Wolf Supplies</title>
        <meta name="description" content="Read Wolf Supplies' Terms of Service. Understand your rights and obligations when shopping with us under UK consumer law." />
        <meta name="keywords" content="Wolf Supplies terms of service, terms and conditions, legal agreement, UK consumer rights" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://wolfsupplies.co.uk/policies/terms" />
        <meta property="og:title" content="Terms of Service | Wolf Supplies" />
        <meta property="og:description" content="Read Wolf Supplies' Terms of Service. Understand your rights and obligations when shopping with us under UK consumer law." />
        <meta property="og:image" content="https://wolfsupplies.co.uk/default-image.jpg" />
        <meta property="og:url" content="https://wolfsupplies.co.uk/policies/terms" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Terms of Service | Wolf Supplies" />
        <meta name="twitter:description" content="Read Wolf Supplies' Terms of Service. Understand your rights and obligations when shopping with us under UK consumer law." />
      </Helmet>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)' }}>
      {/* Header Section */}
      <div className="text-white py-12 md:py-16" style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 w-fit transition duration-300">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <i className="fas fa-file-contract text-4xl"></i>
            <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-white text-lg">Legal Agreement Between Wolf Suppliesand Users</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Acceptance */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary, #000000)' }}>Acceptance of Terms</h2>
          <p className="leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            By accessing and using this website (wolfsupplies.co.uk), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
          <div className="p-4 rounded mb-4" style={{ backgroundColor: 'rgba(165, 99, 42, 0.1)', borderLeft: '4px solid var(--color-accent-primary, #a5632a)' }}>
            <p className="mb-2" style={{ color: 'var(--color-text-primary, #000000)' }}>
              These Terms of Service constitute a binding legal agreement between Wolf Suppliesand you, the user.
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
              <strong>Company Number:</strong> <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>16070029</a> | <strong>Address:</strong> Unit 4 Atlas Estates, Colebrook Road, Birmingham, West Midlands, B11 2NT, United Kingdom
            </p>
          </div>
        </div>

        {/* Guest Checkout */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>Guest Checkout & Personal Information</h2>

          <div className="space-y-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <p>
              <strong>No Account Required:</strong> You do not need to create a user account to shop on our website. We offer guest checkout for all customers, allowing you to purchase without registration.
            </p>
            <p>
              <strong>Personal Information:</strong> During checkout, you will be asked to provide:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Name, email address, and phone number</li>
              <li>Billing and delivery address</li>
              <li>Payment card information (processed securely by Stripe; we do not store or process full payment card details)</li>
            </ul>
            <p>
              <strong>Age Requirement:</strong> You must be at least 18 years old to make a purchase on our website.
            </p>
            <p>
              <strong>Guest ID System:</strong> Your shopping cart, order history, and saved items are stored using a secure guest identifier on your device. You do not need to remember passwords or maintain an account.
            </p>
          </div>
        </div>

        {/* Orders & Purchases */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>Orders & Purchases</h2>

          <div className="space-y-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <p>
              <strong>Order Confirmation:</strong> Placement of an order represents an offer to purchase. We reserve the right to accept or reject any order in accordance with our policies.
            </p>
            <p>
              <strong>Payment:</strong> Payment must be received and verified before items are dispatched. We accept all major credit cards, debit cards, and secure payment methods.
            </p>
            <p>
              <strong>Price Accuracy:</strong> We aim to keep prices accurate. In the rare event of a pricing error, we may cancel your order and refund your payment in full.
            </p>
            <p>
              <strong>Right of Withdrawal:</strong> Under UK Consumer Rights Act 2015, you have 14 calendar days to cancel your order from the date of delivery for a full refund. For returns on unwanted items (not defective), we accept returns within 31 days of delivery for a full refund.
            </p>
            <p>
              <strong>Stock Availability:</strong> Products are subject to availability. If an item becomes unavailable, we will notify you immediately and offer a full refund or alternative product.
            </p>
          </div>
        </div>

        {/* Limitation of Liability */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>Limitation of Liability</h2>

          <div className="space-y-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <p className="p-4 rounded" style={{ backgroundColor: 'rgba(165, 99, 42, 0.1)', borderLeft: '4px solid var(--color-accent-primary, #a5632a)' }}>
              <strong>Important:</strong> Nothing in these Terms of Service limits or excludes any liability that cannot legally be limited or excluded under UK law, including (but not limited to) liability for death, personal injury, fraud, or breach of statutory consumer rights under the Consumer Rights Act 2015.
            </p>
            <p>
              <strong>No Warranties:</strong> The materials on Wolf Suppliesare provided on an 'as is' basis, except where statutory warranties apply. This does not affect your statutory consumer rights.
            </p>
            <p>
              <strong>Maximum Liability:</strong> Where permitted by law, Wolf Supplies's total liability shall not exceed the amount paid for the specific product or service in question. This limitation does not apply to claims under the Consumer Rights Act 2015 or other statutory consumer protections.
            </p>
          </div>
        </div>

        {/* Dispute Resolution */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>Dispute Resolution</h2>

          <div className="space-y-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <p>
              <strong>Governing Law:</strong> These Terms shall be governed by the laws of England and Wales and UK Consumer Rights Act 2015.
            </p>
            <p>
              <strong>Jurisdiction:</strong> You agree to submit to the exclusive jurisdiction of the courts of England and Wales for any disputes.
            </p>
            <p>
              <strong>Alternative Dispute Resolution:</strong> In the event of a dispute, we encourage you to contact our customer service team first. If you're not satisfied, you may use the UK Alternative Dispute Resolution procedure or refer the matter to your local Trading Standards office.
            </p>
          </div>
        </div>

        {/* Consumer Rights & Protections */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>Consumer Rights & Protections</h2>

          <div className="space-y-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <p>
              As a UK-based consumer, you are protected under the <strong>Consumer Rights Act 2015</strong> and related UK laws. These rights include:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Right to Quality:</strong> All products must be of satisfactory quality and fit for purpose</li>
              <li><strong>Right to Information:</strong> Clear pricing, accurate product descriptions, and transparent shipping information</li>
              <li><strong>Right to a Cooling-Off Period:</strong> 14 days to cancel purchases (with some exceptions)</li>
              <li><strong>Right to Remedies:</strong> Repair, replacement, or refund for defective products</li>
              <li><strong>Right to Safe Products:</strong> All products meet UK safety standards</li>
            </ul>
            <p className="mt-4">
              These consumer rights are in addition to our Return & Refund Policy and cannot be waived by our Terms.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-lg border-2 p-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)', borderColor: 'var(--color-border-light, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary, #000000)' }}>Questions About Our Terms?</h2>
          <p className="mb-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            For questions regarding these Terms of Service, please contact:
          </p>
          <div className="space-y-2" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <p><i className="fas fa-envelope inline mr-2" style={{ color: 'var(--color-accent-primary, #a5632a)' }} /> Email: <a href="mailto:sales@wolfsupplies.co.uk" className="hover:underline" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>sales@wolfsupplies.co.uk</a></p>
            <p><i className="fas fa-phone inline mr-2" style={{ color: 'var(--color-accent-primary, #a5632a)' }} /> Phone: <a href="tel:+447398998101" className="hover:underline" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>+44 7398 998101</a></p>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-center text-sm mt-8" style={{ color: 'var(--color-text-primary, #000000)' }}>
          Last updated: January 31, 2026 | Wolf Supplies
        </p>
      </div>
    </div>
    </>
  );
};

export default PoliciesTermsPage;

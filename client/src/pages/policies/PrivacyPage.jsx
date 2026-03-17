'use client';

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';


const PoliciesPrivacyPage = () => {

  return (
    <>
      <Helmet>
        <title>Privacy Policy | Wolf Supplies</title>
        <meta name="description" content="Read Wolf Supplies' Privacy Policy. Learn how we collect, use, and protect your personal data in compliance with UK GDPR." />
        <meta name="keywords" content="Wolf Supplies privacy policy, data protection, GDPR, personal data, UK privacy" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://wolfsupplies.co.uk/policies/privacy" />
        <meta property="og:title" content="Privacy Policy | Wolf Supplies" />
        <meta property="og:description" content="Read Wolf Supplies' Privacy Policy. Learn how we collect, use, and protect your personal data in compliance with UK GDPR." />
        <meta property="og:image" content="https://wolfsupplies.co.uk/default-image.jpg" />
        <meta property="og:url" content="https://wolfsupplies.co.uk/policies/privacy" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Privacy Policy | Wolf Supplies" />
        <meta name="twitter:description" content="Read Wolf Supplies' Privacy Policy. Learn how we collect, use, and protect your personal data in compliance with UK GDPR." />
      </Helmet>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)' }}>
      {/* Header Section */}
      <div className="text-white py-12 md:py-16" style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 w-fit transition duration-300">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <i className="fas fa-lock text-4xl"></i>
            <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-white text-lg">Your Data Protection & Privacy Rights - GDPR Compliant</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <p className="mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            Wolf Supplies("we", "our", or "us") operates the wolfsupplies.co.uk website. This Privacy Policy explains what personal information we collect, how we use it, and your rights under UK data protection law.
          </p>
          <p className="mb-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <strong>Company Details:</strong> Wolf Supplies| Company Number: <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>16070029</a> | Unit 4 Atlas Estates, Colebrook Road, Birmingham, West Midlands, B11 2NT, United Kingdom
          </p>
          <p style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <strong>Last Updated:</strong> January 31, 2026 | <strong>Effective Date:</strong> Immediately
          </p>
        </div>

        {/* Information We Collect */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>Information We Collect</h2>

          <div className="space-y-6">
            <div className="pl-6" style={{ borderLeft: '4px solid var(--color-accent-primary, #a5632a)' }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary, #000000)' }}>Personal Information</h3>
              <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
                <li>Full name and contact information</li>
                <li>Email address and phone number</li>
                <li>Delivery and billing address</li>
                <li>Order history and purchase preferences</li>
              </ul>
            </div>

            <div className="pl-6" style={{ borderLeft: '4px solid var(--color-accent-primary, #a5632a)' }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary, #000000)' }}>Shopping Information</h3>
              <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
                <li>Shopping cart contents and saved items</li>
                <li>Wishlist items</li>
                <li>Order history and tracking information</li>
                <li>Customer reviews and ratings</li>
              </ul>
            </div>

            <div className="pl-6" style={{ borderLeft: '4px solid var(--color-accent-primary, #a5632a)' }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary, #000000)' }}>Technical Information</h3>
              <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
                <li>Device information and browser type</li>
                <li>IP address for site security purposes</li>
                <li>Website usage analytics (only collected with your consent via cookie settings)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Guest ID System */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>How We Store Your Shopping Experience</h2>

          <div className="space-y-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <p>
              We do not require you to create a user account or password to shop with us. Instead, we use a secure guest identification system:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Guest ID:</strong> When you first visit our website, a unique identifier is assigned and stored on your device using essential cookies required for site functionality.</li>
              <li><strong>Shopping Cart & Wishlist:</strong> Your cart contents, saved items, and wishlist are linked to this guest identifier and stored on our servers</li>
              <li><strong>Order Retrieval:</strong> After placing an order using your email and billing information, you can retrieve past orders using your Order ID</li>
              <li><strong>Data Security:</strong> Your guest ID and associated shopping data are protected using the same security measures as all other customer information</li>
              <li><strong>Privacy:</strong> You remain anonymous until you choose to provide personal information for checkout or contact us</li>
            </ul>
          </div>
        </div>

        {/* Data Security */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>Data Security & Protection</h2>

          <div className="space-y-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <p>
              We implement security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li><strong>Encryption:</strong> Data transmitted to and from our website uses encryption (HTTPS)</li>
              <li><strong>Guest ID System:</strong> Your shopping cart, wishlist, and order history are stored securely using a unique guest identifier assigned to your device</li>
              <li><strong>Access Control:</strong> Access to personal data is restricted to authorized personnel only</li>
              <li><strong>Third-Party Security:</strong> Payment processing partners comply with industry security standards</li>
              <li><strong>Data Retention:</strong> Personal data is retained for the duration of your business relationship with us and for as long as required by law (typically 6 years for tax and legal compliance purposes)</li>
            </ul>
            <p className="font-semibold">
              <strong>Data Breach:</strong> If a data breach occurs, we will notify affected individuals as required by applicable UK data protection law.
            </p>
          </div>
        </div>

        {/* Your Rights */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>Your Data Rights (UK GDPR)</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {[
              { title: 'Right to Access', desc: 'Request a copy of your personal data we hold' },
              { title: 'Right to Rectification', desc: 'Correct inaccurate or incomplete information' },
              { title: 'Right to Erasure', desc: 'Request deletion of your data ("right to be forgotten")' },
              { title: 'Right to Portability', desc: 'Export your data to another provider' },
              { title: 'Right to Restrict', desc: 'Limit how we process your data' },
              { title: 'Right to Object', desc: 'Opt-out of certain data processing activities' }
            ].map((right, idx) => (
              <div key={idx} className="pl-4" style={{ borderLeft: '4px solid var(--color-accent-primary, #a5632a)' }}>
                <h4 className="font-bold mb-1" style={{ color: 'var(--color-text-primary, #000000)' }}>{right.title}</h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>{right.desc}</p>
              </div>
            ))}
          </div>

          <p style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            To exercise any of these rights, please contact us at <a href="mailto:sales@wolfsupplies.co.uk" className="hover:underline" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>sales@wolfsupplies.co.uk</a> with proof of identity. We will respond within 30 days.
          </p>
        </div>

        {/* Cookies & Tracking */}
        <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary, #000000)' }}>Cookies & Website Tracking</h2>

          <div className="space-y-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <p>
              Our website uses cookies to enhance your browsing experience. Cookies are small text files stored on your device that help us remember your preferences and understand how you use our site.
            </p>
            <div>
              <h3 className="font-bold mb-2">Types of Cookies We Use:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li><strong>Essential Cookies:</strong> Required for basic site functionality (shopping cart, guest identification). These cannot be disabled.</li>
                <li><strong>Preference Cookies:</strong> Remember your choices (language, theme) for improved user experience.</li>
                <li><strong>Analytics Cookies:</strong> Collect anonymous data about site usage to help us improve our services. These require your consent.</li>
              </ul>
            </div>
            <p>
              <strong>Your Cookie Choices:</strong> When you first visit our website, a cookie banner will appear asking for your consent to non-essential cookies. You can:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Accept all cookies by clicking "Accept"</li>
              <li>Decline non-essential cookies by clicking "Decline"</li>
              <li>Customize your preferences by clicking "Preferences"</li>
              <li>Change your cookie settings at any time through your browser settings</li>
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-lg border-2 p-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)', borderColor: 'var(--color-border-light, #e5e5e5)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary, #000000)' }}>Privacy Questions?</h2>
          <p className="mb-4" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            Contact our Data Protection Officer:
          </p>
          <div className="space-y-2" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
            <p><i className="fas fa-envelope inline mr-2" style={{ color: 'var(--color-accent-primary, #a5632a)' }}></i> Email: <a href="mailto:sales@wolfsupplies.co.uk" className="hover:underline" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>sales@wolfsupplies.co.uk</a></p>
            <p><i className="fas fa-phone inline mr-2" style={{ color: 'var(--color-accent-primary, #a5632a)' }}></i> Phone: <a href="tel:+447398998101" className="hover:underline" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>+44 7398 998101</a></p>
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

export default PoliciesPrivacyPage;

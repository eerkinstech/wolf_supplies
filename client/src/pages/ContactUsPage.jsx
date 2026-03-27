'use client';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const API = import.meta.env.VITE_API_URL || '';

const ContactUsPage = () => {


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`${API}/api/forms/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to send message');
        return;
      }

      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Wolf Supplies | UK Customer Support</title>
        <meta name="description" content="Contact Wolf Supplies for customer support. Phone, email, or visit us in Birmingham. Monday-Friday, 9 AM - 6 PM GMT." />
        <meta name="keywords" content="contact us, customer support, help, phone, email" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://wolfsupplies.co.uk/contact" />
        <meta property="og:title" content="Contact Wolf Supplies | UK Customer Support" />
        <meta property="og:description" content="Get in touch with our customer support team via phone, email, or our contact form." />
        <meta property="og:image" content="https://wolfsupplies.co.uk/og-image.jpg" />
        <meta property="og:url" content="https://wolfsupplies.co.uk/contact" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact Wolf Supplies | UK Customer Support" />
        <meta name="twitter:description" content="Contact us for support. Phone: +44 7398 998101, Email: sales@wolfsupplies.co.uk" />
      </Helmet>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)' }}>
      {/* Header Section */}
      <div className="text-white py-12 md:py-16" style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }} >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 mb-6 hover:opacity-80 w-fit transition duration-300">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-white">We're Here to Help - Get in Touch</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition duration-300" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)', borderColor: 'var(--color-border-light, #e5e5e5)' }}  >
            <i className="fas fa-phone mx-auto" style={{ fontSize: '48px', color: 'var(--color-accent-primary, #a5632a)', display: 'block', marginBottom: '16px' }}></i>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary, #000000)' }}>Call Us</h3>
            <p className="mb-2" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>
              <a href="tel:+447398998101" className="hover:opacity-75 transition duration-300" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>
                +44 7398 998101
              </a>
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>Monday - Friday, 9 AM - 6 PM GMT</p>
          </div>

          <div className="rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition duration-300" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)', borderColor: 'var(--color-border-light, #e5e5e5)' }}  >
            <i className="fas fa-envelope mx-auto" style={{ fontSize: '48px', color: 'var(--color-accent-primary, #a5632a)', display: 'block', marginBottom: '16px' }}></i>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary, #000000)' }}>Email Us</h3>
            <p className="mb-2" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>
              <a href="mailto:sales@wolfsupplies.co.uk" className="hover:opacity-75 transition duration-300" style={{ color: 'var(--color-accent-primary, #a5632a)' }}>
                sales@wolfsupplies.co.uk
              </a>
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>We'll respond within 24 hours</p>
          </div>

          <div className="rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition duration-300" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)', borderColor: 'var(--color-border-light, #e5e5e5)' }}  >
            <i className="fas fa-map-marker-alt mx-auto" style={{ fontSize: '48px', color: 'var(--color-accent-primary, #a5632a)', display: 'block', marginBottom: '16px' }}></i>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary, #000000)' }}>Visit Us</h3>
            <p className="mb-2 font-semibold" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>Unit 4 Atlas Estates</p>
            <p className="mb-2" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>Colebrook Road, Birmingham</p>
            <p className="mb-2" style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>West Midlands, B11 2NT</p>
            <p className="text-sm" style={{ color: 'var(--color-text-light, #6B6B6B)' }}>United Kingdom</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3" style={{ color: 'var(--color-text-primary, #000000)' }}>
              <i className="fas fa-paper-plane" style={{ color: 'var(--color-accent-primary, #a5632a)' }}></i>
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary, #000000)' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition duration-300"
                  style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary, #a5632a)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-light, #e5e5e5)'}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary, #000000)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition duration-300"
                  style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary, #a5632a)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-light, #e5e5e5)'}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary, #000000)' }}>
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition duration-300"
                  style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary, #a5632a)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-light, #e5e5e5)'}
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary, #000000)' }}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition duration-300 resize-none"
                  style={{ borderColor: 'var(--color-border-light, #e5e5e5)', backgroundColor: 'white', color: 'var(--color-text-primary, #000000)' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary, #a5632a)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border-light, #e5e5e5)'}
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                className="w-full text-white font-bold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2 shadow-lg hover:opacity-90"
                style={{ backgroundColor: 'var(--color-accent-primary, #a5632a)' }}
              >
                <i className="fas fa-paper-plane"></i> Send Message
              </button>
            </form>
          </div>

          {/* FAQ & Support Info */}
          <div className="space-y-8">
            {/* Support Hours */}
            <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)' }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--color-text-primary, #000000)' }}>
                <i className="fas fa-clock" style={{ color: 'var(--color-accent-primary, #a5632a)' }}></i>
                Support Hours
              </h2>
              <div className="space-y-4">
                <div className="pl-4 p-3 rounded" style={{ borderLeft: '4px solid var(--color-accent-primary, #a5632a)', backgroundColor: 'rgba(165, 99, 42, 0.1)' }}>
                  <p className="font-bold" style={{ color: 'var(--color-text-primary, #000000)' }}>Monday - Friday</p>
                  <p style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>9:00 AM - 6:00 PM GMT</p>
                </div>
                <div className="pl-4 p-3 rounded" style={{ borderLeft: '4px solid var(--color-accent-primary, #a5632a)', backgroundColor: 'rgba(165, 99, 42, 0.1)' }}>
                  <p className="font-bold" style={{ color: 'var(--color-text-primary, #000000)' }}>Saturday - Sunday</p>
                  <p style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>Closed</p>
                </div>
                <div className="pl-4 p-3 rounded" style={{ borderLeft: '4px solid var(--color-accent-primary, #a5632a)', backgroundColor: 'rgba(165, 99, 42, 0.1)' }}>
                  <p className="font-bold" style={{ color: 'var(--color-text-primary, #000000)' }}>Bank Holidays</p>
                  <p style={{ color: 'var(--color-text-secondary, #3a3a3a)' }}>Closed</p>
                </div>
              </div>
            </div>

            {/* Quick Support */}
            <div className="rounded-lg shadow-lg p-8 border-2" style={{ backgroundColor: 'var(--color-bg-section, #e5e5e5)', borderColor: 'var(--color-border-light, #e5e5e5)' }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--color-text-primary, #000000)' }}>
                <i className="fas fa-headset" style={{ color: 'var(--color-accent-primary, #a5632a)' }}></i>
                Quick Support
              </h2>
              <div className="space-y-3">
                <Link
                  to="/policies/shipping"
                  className="block p-3 rounded hover:opacity-80 transition duration-300 font-semibold flex items-center gap-2"
                  style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)', color: 'var(--color-accent-primary, #a5632a)' }}
                >
                  <i className="fas fa-box"></i> Shipping Policy
                </Link>
                <Link
                  to="/policies/returns"
                  className="block p-3 rounded hover:opacity-80 transition duration-300 font-semibold flex items-center gap-2"
                  style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)', color: 'var(--color-accent-primary, #a5632a)' }}
                >
                  <i className="fas fa-undo"></i> Return & Refunds
                </Link>
                <Link
                  to="/policies/privacy"
                  className="block p-3 rounded hover:opacity-80 transition duration-300 font-semibold flex items-center gap-2"
                  style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)', color: 'var(--color-accent-primary, #a5632a)' }}
                >
                  <i className="fas fa-lock"></i> Privacy Policy
                </Link>
                <Link
                  to="/policies/faq"
                  className="block p-3 rounded hover:opacity-80 transition duration-300 font-semibold flex items-center gap-2"
                  style={{ backgroundColor: 'var(--color-bg-primary, #ffffff)', color: 'var(--color-accent-primary, #a5632a)' }}
                >
                  <i className="fas fa-question-circle"></i> FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information Section - Google Merchant Center Compliance */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8 border border-blue-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">About Wolf Supplies</h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Business Details */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-xl text-gray-900 mb-4">Company Information</h3>
              <ul className="text-gray-700 space-y-3 text-sm">
                <li><strong>Business Name:</strong> Wolf Supplies Limited</li>
                <li><strong>Company Number:</strong> <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-primary)] hover:underline">16070029</a> (UK Companies House)</li>
                <li><strong>Trading Address:</strong> Unit 4 Atlas Estates, Colebrook Road, Birmingham, West Midlands, B11 2NT, United Kingdom</li>
                <li><strong>Website:</strong> <a href="https://wolfsupplies.co.uk" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-primary)] hover:underline">wolfsupplies.co.uk</a></li>
                <li><strong>Email:</strong> <a href="mailto:sales@wolfsupplies.co.uk" className="text-[var(--color-accent-primary)] hover:underline">sales@wolfsupplies.co.uk</a></li>
                <li><strong>Phone:</strong> <a href="tel:+447398998101" className="text-[var(--color-accent-primary)] hover:underline">+44 7398 998101</a></li>
              </ul>
            </div>

            {/* Compliance & Trust */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-xl text-gray-900 mb-4">Compliance & Trust</h3>
              <ul className="text-gray-700 space-y-3 text-sm">
                <li>✓ <strong>UK GDPR Compliant:</strong> Full data protection compliance</li>
                <li>✓ <strong>Consumer Rights Act 2015:</strong> 31-day money-back guarantee</li>
                <li>✓ <strong>SSL/TLS Encrypted:</strong> Secure communications</li>
                <li>✓ <strong>PCI DSS Level 1:</strong> Payment card industry compliant</li>
                <li>✓ <strong>Verified Merchant:</strong> Listed with Companies House</li>
                <li>✓ <strong>Free UK Shipping:</strong> All orders, no minimum</li>
              </ul>
            </div>
          </div>

          {/* Policies Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-xl text-gray-900 mb-6">Our Policies</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                to="/policies/shipping"
                className="p-4 border-2 border-[var(--color-accent-primary)] rounded-lg hover:bg-blue-50 transition text-center"
              >
                <div className="font-bold text-[var(--color-accent-primary)] mb-2">📦 Shipping Policy</div>
                <p className="text-sm text-gray-600">2-4 business day delivery, free UK shipping</p>
              </Link>
              <Link
                to="/policies/returns"
                className="p-4 border-2 border-green-600 rounded-lg hover:bg-green-50 transition text-center"
              >
                <div className="font-bold text-green-600 mb-2">🔄 Returns & Refunds</div>
                <p className="text-sm text-gray-600">31-day returns, full refund guarantee</p>
              </Link>
              <Link
                to="/payment-options"
                className="p-4 border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition text-center"
              >
                <div className="font-bold text-purple-600 mb-2">💳 Payment Options</div>
                <p className="text-sm text-gray-600">Secure checkout, multiple payment methods</p>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <Link
                to="/policies/privacy"
                className="p-4 border-2 border-red-600 rounded-lg hover:bg-red-50 transition text-center"
              >
                <div className="font-bold text-red-600 mb-2">🔒 Privacy Policy</div>
                <p className="text-sm text-gray-600">GDPR compliant, data protection assured</p>
              </Link>
              <Link
                to="/policies/terms"
                className="p-4 border-2 border-orange-600 rounded-lg hover:bg-orange-50 transition text-center"
              >
                <div className="font-bold text-orange-600 mb-2">📋 Terms of Service</div>
                <p className="text-sm text-gray-600">Legal terms and conditions</p>
              </Link>
              <Link
                to="/policies/faq"
                className="p-4 border-2 border-cyan-600 rounded-lg hover:bg-cyan-50 transition text-center"
              >
                <div className="font-bold text-cyan-600 mb-2">❓ FAQ</div>
                <p className="text-sm text-gray-600">Answers to common questions</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default ContactUsPage;

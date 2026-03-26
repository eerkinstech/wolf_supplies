'use client';

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Helmet } from 'react-helmet-async';

// Warehouse images available in public folder
const warehouseImages = [
  '/warehouse images (1).webp',
  '/warehouse images (2).webp',
  '/warehouse images (3).webp',
  '/warehouse images (4).webp',
  '/warehouse images (5).webp',
];

const AboutUsPage = () => {
  return (
    <>
      <Helmet>
        <title>About Wolf Supplies | Our Story & Mission</title>
        <meta name="description" content="Learn about Wolf Supplies - our mission to provide quality products, trusted service, and exceptional value to customers worldwide." />
        <meta name="keywords" content="about us, company, story, mission, quality, trusted service" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://wolfsupplies.co.uk/about" />
        <meta property="og:title" content="About Wolf Supplies | Our Story & Mission" />
        <meta property="og:description" content="Learn about Wolf Supplies - UK-based retailer providing quality products, trusted service, and 31-day returns." />
        <meta property="og:image" content="https://wolfsupplies.co.uk/og-image.jpg" />
        <meta property="og:url" content="https://wolfsupplies.co.uk/about" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="About Wolf Supplies | Our Story & Mission" />
        <meta name="twitter:description" content="Learn about our company, mission, and commitment to quality service." />
      </Helmet>
      <div className="min-h-screen bg-(--color-bg-section)">
        {/* Header Section */}
        <div className="bg-(--color-accent-primary) text-white py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-2 mb-6 hover:text-gray-100 w-fit">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">About Wolf Supplies</h1>
            <p className="text-xl text-gray-100">Your Trusted Online Shopping Destination</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Our Story */}
          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-(--color-text-primary) mb-6">Our Story</h2>
                <p className="text-(--color-text-light) text-lg leading-relaxed mb-4">
                  Wolf Supplies a UK-based online retailer registered with Companies House (Company Number: 16070029) operating from Birmingham. We operate in accordance with UK consumer protection laws and data protection regulations.              </p>
                <p className="text-(--color-text-light) text-lg leading-relaxed mb-4">
                  We offer customers across the United Kingdom a selection of products at competitive prices with transparent policies, secure payment processing, and customer support. We offer a 31-day returns policy and free UK shipping.
                </p>
                <p className="text-(--color-text-light) text-lg leading-relaxed">
                  We are committed to transparency and compliance with applicable UK law. Support is available Monday-Friday, 9 AM - 6 PM GMT.
                </p>
              </div>
              <div className="bg-(--color-bg-section) rounded-lg p-8 border-2 border-(--color-border-light)">
                <div className="text-center">
                  <img src="/Wolf Supplies LTD.png" alt="Wolf Supplies Logo" className="h-auto w-auto mx-auto mb-4" />
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Wolf Supplies</strong></p>
                    <p>Company Number: <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:underline">16070029</a></p>
                    <p>Registered in United Kingdom</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-(--color-text-primary) mb-12 text-center">Our Mission & Vision</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-(--color-bg-primary) rounded-lg shadow-lg p-8 border-l-4 border-(--color-accent-primary)">
                <h3 className="text-2xl font-bold text-(--color-text-primary) mb-4 flex items-center gap-3">
                  <i className="fas fa-check" style={{ color: 'var(--color-accent-primary)', fontSize: '24px' }}></i>
                  Our Mission
                </h3>
                <p className="text-(--color-text-light) leading-relaxed">
                  To provide customers with a seamless, trustworthy, and enjoyable shopping experience by offering a curated selection of quality products, competitive pricing, and exceptional customer service across the United Kingdom.
                </p>
              </div>
              <div className="bg-(--color-bg-primary) rounded-lg shadow-lg p-8 border-l-4 border-(--color-accent-primary)">
                <h3 className="text-2xl font-bold text-(--color-text-primary) mb-4 flex items-center gap-3">
                  <i className="fas fa-trophy" style={{ color: 'var(--color-accent-primary)', fontSize: '24px' }}></i>
                  Our Vision
                </h3>
                <p className="text-(--color-text-light) leading-relaxed">
                  To serve UK customers with a reliable online marketplace, offering competitive pricing, transparent practices, and responsive customer service.
                </p>
              </div>
            </div>
          </section>

          {/* Core Values */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: 'fas fa-users',
                  title: 'Responsive Service',
                  desc: 'We respond to customer inquiries during business hours (Monday-Friday, 9 AM - 6 PM GMT).'
                },
                {
                  icon: 'fas fa-check',
                  title: 'Quality & Integrity',
                  desc: 'We maintain the highest standards of quality products and honest business practices.'
                },
                {
                  icon: 'fas fa-leaf',
                  title: 'Sustainability',
                  desc: 'We are committed to environmentally responsible practices and ethical sourcing.'
                }
              ].map((value, idx) => {
                return (
                  <div key={idx} className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition duration-300">
                    <i className={`${value.icon} text-4xl text-gray-400 mx-auto mb-4`} style={{ display: 'block' }}></i>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-700">{value.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* By The Numbers */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">By The Numbers</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { number: 'Free', label: 'UK Shipping', icon: 'fas fa-star' },
                { number: '31', label: 'Day Returns', icon: 'fas fa-users' },
                { number: '2-4', label: 'Day Delivery', icon: 'fas fa-globe-europe' },
                { number: 'Secure', label: 'Payments', icon: 'fas fa-check' }
              ].map((stat, idx) => {
                return (
                  <div key={idx} className="bg-white rounded-lg p-6 text-center border-2 border-gray-200">
                    <i className={`${stat.icon} text-3xl text-gray-400 mx-auto mb-3`} style={{ display: 'block' }}></i>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                    <p className="text-gray-700 font-semibold">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Why Choose Wolf Supplies?</h2>
            <div className="bg-white rounded-lg shadow-lg p-12">
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  '✓ Selection of Products',
                  '✓ Competitive Pricing',
                  '✓ Free UK Delivery (2-4 Business Days)',
                  '✓ 31-Day Returns Policy',
                  '✓ Customer Support (Mon-Fri 9 AM - 6 PM GMT)',
                  '✓ Secure Payment Processing',
                  '✓ UK GDPR Compliant',
                  '✓ Transparent Return Process'
                ].map((feature, idx) => (
                  <p key={idx} className="text-lg text-gray-700 font-semibold flex items-center gap-3">
                    <span className="text-gray-400 text-2xl">✓</span>
                    {feature.replace('✓ ', '')}
                  </p>
                ))}
              </div>
            </div>
          </section>

          {/* Warehouse & Facilities */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Our Warehouse & Facilities</h2>
            <p className="text-center text-gray-600 text-lg mb-12">
              Based in Birmingham, United Kingdom - Our fulfillment facility serving UK customers
            </p>
            <div className="bg-white rounded-lg p-6 mb-8 border-l-4 border-gray-400">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Location</h3>
              <p className="text-gray-700 mb-2"><strong>Unit 4 Atlas Estates</strong></p>
              <p className="text-gray-700 mb-2">Colebrook Road</p>
              <p className="text-gray-700 mb-4">Birmingham, West Midlands, B11 2NT</p>
              <p className="text-gray-600 text-sm">United Kingdom</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Large feature image */}
              <div className="group rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 lg:col-span-2 lg:row-span-2">
                <div className="relative overflow-hidden h-64 md:h-80 lg:h-full">
                  {warehouseImages[0] ? (
                    <img src={warehouseImages[0]} alt="Main Warehouse" className="object-cover w-full h-full" />
                  ) : (
                    <div className="h-full w-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <div className="text-6xl">🏭</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition duration-300"></div>
                </div>
              </div>

              {/* Remaining tiles (no captions) */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="group rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition duration-300">
                  <div className="relative overflow-hidden h-40 md:h-48">
                    {warehouseImages[i] ? (
                      <img src={warehouseImages[i]} alt={`Warehouse ${i + 1}`} className="object-cover w-full h-full" />
                    ) : (
                      <div className={`h-full w-full flex items-center justify-center ${i === 1 ? 'bg-gray-700' : i === 2 ? 'bg-purple-600' : i === 3 ? 'bg-gray-700' : 'bg-red-600'}`}>
                        <div className="text-5xl">{i === 1 ? '📦' : i === 2 ? '✅' : i === 3 ? '📮' : '🚚'}</div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition duration-300"></div>
                  </div>
                </div>
              ))}
            </div>


          </section>

          {/* Team */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Team</h2>
            <div className="bg-linear-to-r from-gray-50 to-grey-100 rounded-lg p-12 border-2 border-gray-200 text-center">
              <p className="text-xl text-gray-700 mb-4">
                Our dedicated team of professionals is committed to bringing you the best online shopping experience.
              </p>
              <p className="text-lg text-gray-600">
                From product curation to customer service, logistics to technology, Our team supports day-to-day operations including product handling, order fulfillment, and customer service.
              </p>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-gray-900 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Have Questions About Wolf Supplies?</h2>
            <p className="text-lg text-gray-100 mb-8">
              Get in touch with our team. We'd love to hear from you!
            </p>
            <Link
              to="/contact"
              className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition duration-300 shadow-lg"
            >
              Contact Us
            </Link>
          </section>
        </div>
      </div>
    </>
  );
};

export default AboutUsPage;

'use client';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import '@fortawesome/fontawesome-free/css/brands.min.css';

const PaymentOptionsPage = () => {

    const [expandedFaq, setExpandedFaq] = useState(null);

    const paymentMethods = [
        {
            id: 1,
            name: 'Credit & Debit Cards',
            icon: 'fas fa-wallet',
            description: 'Visa, Mastercard, and Discover',
            features: [
                'Instant processing',
                'Secure encryption',
                'No additional charges',
                'UK orders only'
            ],
            cards: ['Visa', 'Mastercard', 'Discover'],
            details: 'All major credit and debit cards are accepted through secure payment processing.'
        },
        {
            id: 2,
            name: 'Apple Pay',
            icon: 'fa-brands fa-apple-pay',
            description: 'Quick payment for Apple devices',
            features: [
                'One-touch checkout',
                'Biometric authentication',
                'Works on supported devices',
                'Encrypted transactions'
            ],
            details: 'Use your saved payment methods for quick and secure purchases on compatible Apple devices.'
        },
        {
            id: 3,
            name: 'Google Pay',
            icon: 'fa-brands fa-google-pay',
            description: 'Fast checkout for Android',
            features: [
                'Quick payment process',
                'Biometric security',
                'Android compatible',
                'Transaction encryption'
            ],
            details: 'Pay securely using your Android device or Chrome browser with Google Pay.'
        }
    ];

    const securityPoints = [
        {
            title: 'SSL Encryption',
            description: 'Industry-standard 256-bit encryption protects all transactions',
            icon: 'fas fa-lock'
        },
        {
            title: 'PCI Compliance',
            description: 'Adherence to Payment Card Industry Data Security Standards',
            icon: 'fas fa-certificate'
        },
        {
            title: 'Fraud Detection',
            description: 'Advanced systems monitor and protect each transaction',
            icon: 'fas fa-shield-alt'
        },
        {
            title: 'Data Privacy',
            description: 'GDPR compliant data handling and storage',
            icon: 'fas fa-user-shield'
        }
    ];

    const faqs = [
        {
            question: 'Are payments secure?',
            answer: 'Yes. All transactions use SSL encryption and meet PCI DSS standards. Your payment information is encrypted and never stored on our servers.'
        },
        {
            question: 'Which method is fastest?',
            answer: 'Apple Pay and Google Pay offer the quickest checkout when available. Credit and debit cards are also processed instantly.'
        },
        {
            question: 'What is your return policy?',
            answer: 'We offer a 31-day return window from the date of purchase. Items must be in resalable condition. Contact our support team to initiate returns.'
        },
        {
            question: 'Do you process international orders?',
            answer: 'Currently, we only ship to addresses within the United Kingdom. We accept orders from UK customers with valid UK postal addresses.'
        },
        {
            question: 'How long do payments take to process?',
            answer: 'Most payments are processed instantly. Credit card processing may take 1-2 business days depending on your bank.'
        },
        {
            question: 'How is my data protected?',
            answer: 'We comply with GDPR regulations and use encryption for all sensitive data. Your information is used solely for order processing.'
        }
    ];

    return (
        <>
            <Helmet>
                <title>Secure Payment Methods | Wolf Supplies</title>
                <meta name="description" content="Choose your preferred payment method at Wolf Supplies. Secure credit card, Apple Pay, and Google Pay options with PCI compliance and SSL encryption." />
                <meta name="keywords" content="payment methods, credit card, Apple Pay, Google Pay, secure payment" />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://wolfsupplies.co.uk/payment-options" />
                <meta property="og:title" content="Secure Payment Methods | Wolf Supplies" />
                <meta property="og:description" content="Choose your preferred payment method. Multiple secure options including credit card, Apple Pay, and Google Pay." />
                <meta property="og:image" content="https://wolfsupplies.co.uk/og-image.jpg" />
                <meta property="og:url" content="https://wolfsupplies.co.uk/payment-options" />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="Secure Payment Methods | Wolf Supplies" />
                <meta name="twitter:description" content="Pay securely with credit card, Apple Pay, or Google Pay. PCI compliant and SSL encrypted." />
            </Helmet>
            <div className="min-h-screen bg-[var(--color-bg-primary)]">
            {/* Header Section */}
            <div className="bg-[var(--color-bg-section)] border-b border-[var(--color-border-light)]">
                <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] mb-6">Payment Methods</h1>
                    <p className="text-lg text-[var(--color-text-light)] max-w-3xl mx-auto">
                        We provide multiple secure payment options to suit your preference. All transactions are protected with industry-standard security measures.
                    </p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-16">
                {/* Payment Methods Section */}
                <section className="mb-20">
                    <h2 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2 text-center">Choose Your Payment Method</h2>
                    <div className="h-1 w-24 bg-[var(--color-accent-primary)] mx-auto mb-12"></div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {paymentMethods.map((method) => (
                            <div
                                key={method.id}
                                className="bg-white border border-[var(--color-border-light)] rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                            >
                                {/* Card Header */}
                                <div className="bg-[var(--color-bg-section)] p-8 text-center border-b border-[var(--color-border-light)]">
                                    <i className={`${method.icon} text-5xl mb-3 text-[var(--color-accent-primary)] block`}></i>
                                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">{method.name}</h3>
                                    <p className="text-[var(--color-text-light)]">{method.description}</p>
                                </div>

                                {/* Card Content */}
                                <div className="p-6 space-y-6">
                                    {/* Features */}
                                    <div>
                                        <h4 className="font-bold text-lg text-[var(--color-text-primary)] mb-4">Key Features</h4>
                                        <ul className="space-y-2">
                                            {method.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-3 text-[var(--color-text-light)]">
                                                    <span className="text-[var(--color-accent-primary)] font-bold">•</span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Details */}
                                    <div className="bg-[var(--color-bg-section)] p-4 rounded-lg border border-[var(--color-border-light)]">
                                        <p className="text-sm text-[var(--color-text-primary)]">{method.details}</p>
                                    </div>

                                    {/* Card Types */}
                                    {method.cards && (
                                        <div>
                                            <h4 className="font-bold text-[var(--color-text-primary)] mb-3 text-sm">Accepted Cards</h4>
                                            <div className="flex gap-2 flex-wrap">
                                                {method.cards.map((card, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-[var(--color-bg-section)] text-[var(--color-text-primary)] text-sm rounded font-medium border border-[var(--color-border-light)]">
                                                        {card}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Security Section */}
                <section className="mb-20">
                    <h2 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2 text-center">Security & Protection</h2>
                    <div className="h-1 w-24 bg-[var(--color-accent-primary)] mx-auto mb-12"></div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {securityPoints.map((point, idx) => (
                            <div key={idx} className="bg-white border border-[var(--color-border-light)] rounded-lg p-6 text-center hover:border-[var(--color-accent-primary)] transition-colors">
                                <i className={`${point.icon} text-4xl mb-4 text-[var(--color-accent-primary)] block`}></i>
                                <h3 className="font-bold text-[var(--color-text-primary)] mb-2">{point.title}</h3>
                                <p className="text-sm text-[var(--color-text-light)]">{point.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Trust Indicators */}
                <section className="mb-20">
                    <h2 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2 text-center">Why Customers Trust Us</h2>
                    <div className="h-1 w-24 bg-[var(--color-accent-primary)] mx-auto mb-12"></div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white border border-[var(--color-border-light)] rounded-lg p-8 text-center">
                            <i className="fas fa-building text-5xl mb-4 text-[var(--color-accent-primary)]"></i>
                            <h3 className="font-bold text-xl text-[var(--color-text-primary)] mb-3">Registered Business</h3>
                            <p className="text-[var(--color-text-light)] text-sm">UK company registration verified and active</p>
                        </div>
                        <div className="bg-white border border-[var(--color-border-light)] rounded-lg p-8 text-center">
                            <i className="fas fa-file-alt text-5xl mb-4 text-[var(--color-accent-primary)]"></i>
                            <h3 className="font-bold text-xl text-[var(--color-text-primary)] mb-3">Clear Policies</h3>
                            <p className="text-[var(--color-text-light)] text-sm">Transparent shipping, returns, and terms available</p>
                        </div>
                        <div className="bg-white border border-[var(--color-border-light)] rounded-lg p-8 text-center">
                            <i className="fas fa-headset text-5xl mb-4 text-[var(--color-accent-primary)]"></i>
                            <h3 className="font-bold text-xl text-[var(--color-text-primary)] mb-3">Customer Support</h3>
                            <p className="text-[var(--color-text-light)] text-sm">Available for questions and assistance</p>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="mb-20">
                    <h2 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2 text-center">Common Questions</h2>
                    <div className="h-1 w-24 bg-[var(--color-accent-primary)] mx-auto mb-12"></div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="bg-white border border-[var(--color-border-light)] rounded-lg overflow-hidden hover:border-[var(--color-accent-primary)] transition-colors"
                            >
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                    className="w-full p-6 text-left hover:bg-[var(--color-bg-section)] transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-[var(--color-text-primary)]">{faq.question}</h3>
                                        <span className="text-[var(--color-accent-primary)] text-xl font-bold ml-4 flex-shrink-0">
                                            {expandedFaq === idx ? '−' : '+'}
                                        </span>
                                    </div>
                                </button>
                                {expandedFaq === idx && (
                                    <div className="px-6 pb-6 border-t border-[var(--color-border-light)] bg-[var(--color-bg-section)] bg-opacity-30">
                                        <p className="text-[var(--color-text-light)]">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Business Information */}
                <section className="mb-16">
                    <div className="bg-[var(--color-bg-section)] border border-[var(--color-border-light)] rounded-lg p-8">
                        <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-8 text-center">Business Information</h2>

                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Company Details */}
                            <div>
                                <h3 className="font-bold text-xl text-[var(--color-text-primary)] mb-6">Wolf Supplies</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-[var(--color-text-light)]">Company Registration</p>
                                        <p className="font-semibold text-[var(--color-text-primary)]">
                                            <a href="https://find-and-update.company-information.service.gov.uk/company/16070029" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-primary)] hover:underline">
                                                UK Company #16070029
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--color-text-light)]">Address</p>
                                        <p className="font-semibold text-[var(--color-text-primary)]">Unit 4 Atlas Estates, Colebrook Road, Birmingham, West Midlands, B11 2NT, United Kingdom</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--color-text-light)]">Email</p>
                                        <p className="font-semibold text-[var(--color-text-primary)]">
                                            <a href="mailto:sales@wolfsupplies.co.uk" className="text-[var(--color-accent-primary)] hover:underline">
                                                sales@wolfsupplies.co.uk
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--color-text-light)]">Phone</p>
                                        <p className="font-semibold text-[var(--color-text-primary)]">
                                            <a href="tel:+447398998101" className="text-[var(--color-accent-primary)] hover:underline">
                                                +44 7398 998101
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Policies */}
                            <div>
                                <h3 className="font-bold text-xl text-[var(--color-text-primary)] mb-6">Our Policies</h3>
                                <div className="space-y-3">
                                    <Link to="/policies/shipping" className="block p-4 bg-white rounded border border-[var(--color-border-light)] hover:border-[var(--color-accent-primary)] transition-colors group">
                                        <p className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)]">Shipping Policy</p>
                                        <p className="text-sm text-[var(--color-text-light)]">Delivery times and shipping information</p>
                                    </Link>
                                    <Link to="/policies/returns" className="block p-4 bg-white rounded border border-[var(--color-border-light)] hover:border-[var(--color-accent-primary)] transition-colors group">
                                        <p className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)]">Returns & Refunds</p>
                                        <p className="text-sm text-[var(--color-text-light)]">Return windows and refund process</p>
                                    </Link>
                                    <Link to="/policies/terms" className="block p-4 bg-white rounded border border-[var(--color-border-light)] hover:border-[var(--color-accent-primary)] transition-colors group">
                                        <p className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)]">Terms of Service</p>
                                        <p className="text-sm text-[var(--color-text-light)]">Legal terms and conditions</p>
                                    </Link>
                                    <Link to="/policies/privacy" className="block p-4 bg-white rounded border border-[var(--color-border-light)] hover:border-[var(--color-accent-primary)] transition-colors group">
                                        <p className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)]">Privacy Policy</p>
                                        <p className="text-sm text-[var(--color-text-light)]">Data protection and privacy practices</p>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center bg-[var(--color-bg-section)] border border-[var(--color-border-light)] rounded-lg p-12">
                    <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">Ready to Shop?</h2>
                    <p className="text-[var(--color-text-light)] mb-8 text-lg">Browse our products and select your preferred payment method at checkout.</p>
                    <Link
                        to="/products"
                        className="inline-block px-8 py-3 bg-[var(--color-accent-primary)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Shop Now
                    </Link>
                </section>
            </div>
            </div>
        </>
    );
};

export default PaymentOptionsPage;

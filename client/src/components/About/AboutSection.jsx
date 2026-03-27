'use client';

import React from 'react';
import { Link } from 'react-router-dom';

const AboutSection = () => {
    return (
        <section className="pt-4 px-4 md:px-8 bg-white">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                        Premium Stairnosing, Rubber Matting & Tarpaulins
                    </h2>
                    <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>Wolf Supplies</span> (Company Number: 16070029) is a UK-based online retailer specializing in high-quality stairnosing, rubber matting, and tarpaulins
                        with free UK shipping, 31-day returns, and customer support available Monday-Friday, 9 AM - 6 PM GMT.
                    </p>
                </div>

                {/* Wide Range Section */}
                <div className="mb-12">
                    <h3 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                        Products We Offer
                    </h3>
                    <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                        We specialize in three core product categories: premium stairnosing solutions, durable rubber matting, and high-quality tarpaulins. All products are sourced from established suppliers and designed for both residential and commercial applications.
                    </p>

                    {/* Product Categories */}
                    <div className="space-y-6">
                        {/* Category 1 */}
                        <div>
                            <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                Stairnosing
                            </h4>
                            <ul className="list-disc list-inside space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Safety Stairnosing</span> - Anti-slip stair edge protection for enhanced safety</li>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Decorative Stairnosing</span> - Stylish staircase edging for residential and commercial spaces</li>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Durable Materials</span> - High-quality construction built to last</li>
                            </ul>
                        </div>

                        {/* Category 2 */}
                        <div>
                            <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                Rubber Matting
                            </h4>
                            <ul className="list-disc list-inside space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Industrial Mats</span> - Heavy-duty rubber matting for commercial environments</li>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Playground Matting</span> - Safety mats for recreational areas</li>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Anti-Fatigue Mats</span> - Comfort solutions for workplaces and facilities</li>
                            </ul>
                        </div>

                        {/* Category 3 */}
                        <div>
                            <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                Tarpaulins
                            </h4>
                            <ul className="list-disc list-inside space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Waterproof Covers</span> - Premium tarpaulins for weather protection</li>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Heavy-Duty Options</span> - Reinforced tarpaulins for demanding applications</li>
                                <li><span style={{ color: 'var(----color-text-primary)', fontWeight: 'bold' }}>Various Sizes</span> - Wide range of sizes to suit any project</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Why Choose Us Section */}
                <div className="mb-12 p-8 rounded-lg" style={{ backgroundColor: 'var(--color-desert-200)' }}>
                    <h3 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-accent-secondary)' }}>
                        How We Serve Customers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--color-accent-secondary)' }}>Selection of Products</h4>
                                <p style={{ color: 'var(--color-text-secondary)' }}>We offer a range of products for home and commercial use</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--color-accent-secondary)' }}>Competitive Pricing</h4>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Products offered at competitive prices</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--color-accent-secondary)' }}>Free UK Shipping</h4>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Free shipping on all UK orders, 2-4 business days delivery</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--color-accent-secondary)' }}>31-Day Returns</h4>
                                <p style={{ color: 'var(--color-text-secondary)' }}>31-day returns policy for items returned in good condition</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--color-accent-secondary)' }}>Secure Payment Processing</h4>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Payments processed through Stripe. We do not store full card details</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>✓</span>
                            <div>
                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--color-accent-secondary)' }}>Customer Support</h4>
                                <p style={{ color: 'var(--color-text-secondary)' }}>Support available Monday-Friday, 9 AM - 6 PM GMT</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* One Stop Source Section */}
                <div className="mb-12">
                    <h3 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                        Your Single Source for Quality Products
                    </h3>
                    <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>Wolf Supplies</span> provides premium stairnosing, rubber matting, and tarpaulins for residential and commercial applications. We deliver competitive pricing, secure payment processing through Stripe, free UK shipping, and exceptional customer support.
                    </p>
                </div>

                {/* Get Started Section */}
                <div className="p-8 rounded-lg" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
                    <h3 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-bg-primary)' }}>
                        Explore Our Premium Products
                    </h3>
                    <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--color-bg-primary)' }}>
                        Browse our extensive selection of stairnosing, rubber matting, and tarpaulins. All orders ship free to UK addresses within 2-4 business days. Payments are processed securely through Stripe, and we offer a 31-day returns policy for complete peace of mind.
                    </p>
                    <Link 
                        to="/products"
                        className="inline-block px-8 py-3 text-lg font-bold rounded-lg transition-all hover:opacity-90"
                        style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
                    >
                        View Products
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;

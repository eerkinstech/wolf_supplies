'use client';

import React from 'react';
import { Link } from 'react-router-dom';

const FeaturesSection = () => {
    const features = [
        {
            id: 1,
            title: 'Return & Refund',
            subtitle: '31 Days Return & Refund',
            icon: 'fas fa-undo',
            color: 'text-[var(--color-accent-primary)]',
            link: '/policies/returns',
        },
        {
            id: 2,
            title: 'Free Shipping',
            subtitle: '2 - 4 business Days',
            icon: 'fas fa-truck',
            color: 'text-[var(--color-accent-primary)]',
            link: '/policies/shipping',
        },
        {
            id: 3,
            title: 'Secure Payment',
            subtitle: 'We Ensure Secure Payment',
            icon: 'fas fa-lock',
            color: 'text-[var(--color-accent-primary)]',
            link: '/payment-options',
        },
        {
            id: 4,
            title: 'Customer Support',
            subtitle: 'Mon - Fri 9:00 AM To 6:00 PM',
            icon: 'fas fa-headphones',
            color: 'text-[var(--color-accent-primary)]',
            link: '/contact',
        },
    ];

    return (
        <section className="py-16 px-4 bg-[var(--color-bg-primary)]">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {features.map((feature) => {
                        return (
                            <Link
                                key={feature.id}
                                to={feature.link}
                                className="no-underline"
                            >
                                <div
                                    className="flex flex-row items-center gap-4 hover:scale-105 transition-transform duration-300 p-4 border border-gray-100 rounded-lg cursor-pointer h-full"
                                >
                                    <div className="flex-shrink-0">
                                        {/* Icon */}
                                        <i className={`${feature.icon} ${feature.color} text-3xl`}></i>
                                    </div>
                                    <div className="flex-1 pt-1">
                                        {/* Title */}
                                        <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1">
                                            {feature.title}
                                        </h3>

                                        {/* Subtitle */}
                                        <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
                                            {feature.subtitle}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;

'use client';

import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound404Page = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-2xl w-full text-center">
                {/* 404 Icon/Number */}
                <div className="mb-8">
                    <h1 className="text-9xl sm:text-[150px] font-bold mb-4" style={{ color: 'var(--color-accent-primary)' }}>
                        404
                    </h1>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Page Not Found
                    </h2>

                    <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                        Oops! The page you're looking for doesn't exist or has been moved.
                        Let's get you back on track.
                    </p>

                    {/* Message Icon */}
                    <div className="text-6xl mb-8">
                        🔍
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 text-white font-semibold rounded-lg transition duration-300 transform hover:scale-105 shadow-md" style={{ color: 'var(--color-accent-primary)' }}
                        >
                            <i className="fas fa-home mr-2"></i>Back to Home
                        </button>

                        <button
                            onClick={() => navigate('/products')}
                            className="px-8 py-3   font-semibold rounded-lg transition duration-300 transform hover:scale-105 shadow-md"
                            style={{ color: 'var(--color-accent-primary)' }}
                        >
                            <i className="fas fa-shopping-bag mr-2"></i>Browse Products
                        </button>

                        <button
                            onClick={() => navigate('/categories')}
                            className="px-8 py-3  font-semibold rounded-lg transition duration-300 transform hover:scale-105 shadow-md"
                            style={{ color: 'var(--color-accent-primary)' }}
                        >
                            <i className="fas fa-list mr-2"></i>View Categories
                        </button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <p className="text-gray-600 mb-4">Still need help?</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/contact')}
                                className="  font-semibold transition duration-300"
                                style={{ color: 'var(--color-accent-primary)' }}
                            >
                                <i className="fas fa-envelope mr-2"></i>Contact Us
                            </button>

                            <span className="text-gray-400 hidden sm:inline">•</span>

                            <a
                                href="mailto:sales@wolfsupplies.co.uk"
                                className="  font-semibold transition duration-300"
                                style={{ color: 'var(--color-accent-primary)' }}
                            >
                                <i className="fas fa-phone mr-2"></i>sales@wolfsupplies.co.uk
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default NotFound404Page;

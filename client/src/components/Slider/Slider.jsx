'use client';

import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../utils/envHelper';
/**
 * Professional Hero Slider Component
 * Design: Text on left, image on right
 * Supports image uploads and database storage
 */

// SVG Placeholder image generator (for error fallback)
const generatePlaceholder = (text) => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='500'%3E%3Crect fill='%23f0f9ff' width='600' height='500'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%23666' text-anchor='middle' dominant-baseline='middle' font-family='Arial'%3E${encodeURIComponent(text)}%3C/text%3E%3C/svg%3E`;
};

// Animation styles
const animationStyles = `
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-60px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(60px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    .slider-content-left {
        animation: slideInLeft 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    
    .slider-content-right {
        animation: slideInRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    
    .slider-content-bg {
        animation: fadeInScale 0.8s ease-out forwards;
    }
`;

const Slider = ({ slides = null }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);
    const apiUrl = getApiUrl();

    // Default slides pointing to server uploads
    const defaultSlides = [
        {
            id: 1,
            title: 'Daily Grocery Order and Get Express Delivery',
            description: 'Fresh products delivered to your doorstep in 30 minutes',
            image: '/uploads/placeholder.png',
            backgroundColor: 'from-gray-100 to-gray-200',
            buttonText: 'Explore Shop',
            buttonLink: '/products'
        },
        {
            id: 2,
            title: 'New Arrivals This Week',
            description: 'Discover the latest products just added to our collection',
            image: '/uploads/placeholder.png',
            backgroundColor: 'from-gray-100 to-gray-200',
            buttonText: 'View All',
            buttonLink: '/products'
        },
        {
            id: 3,
            title: 'Limited Time Special Offer',
            description: 'Get amazing discounts on your favorite items',
            image: '/uploads/placeholder.png',
            backgroundColor: 'from-gray-100 to-gray-200',
            buttonText: 'Shop Sale',
            buttonLink: '/products'
        }
    ];

    const sliderSlides = slides && slides.length > 0 ? slides : defaultSlides;

    // Autoplay effect
    useEffect(() => {
        if (!autoPlay) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % sliderSlides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [autoPlay, sliderSlides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % sliderSlides.length);
        setAutoPlay(false);
        setTimeout(() => setAutoPlay(true), 10000);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + sliderSlides.length) % sliderSlides.length);
        setAutoPlay(false);
        setTimeout(() => setAutoPlay(true), 10000);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
        setAutoPlay(false);
        setTimeout(() => setAutoPlay(true), 10000);
    };

    const slide = sliderSlides[currentSlide] || sliderSlides[0];

    return (
        <>
            <style>{animationStyles}</style>
            <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl">
                {/* Slider Container */}
                <div className={`relative min-h-96 md:min-h-[500px] bg-gradient-to-r ${slide.backgroundColor || 'from-gray-100 to-gray-200'} transition-all duration-1000`}>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 h-full items-center px-6 md:px-12 py-12 md:py-16 transition-all duration-1000 slider-content-bg" key={`grid-${currentSlide}`}>

                        {/* Left Content */}
                        <div className="space-y-4 md:space-y-6 order-2 md:order-1 slider-content-left" key={`left-${currentSlide}`}>
                            <div>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4 transition-all duration-1000">
                                    {slide.title}
                                </h2>
                                <p className="text-base md:text-lg text-gray-700 mb-8 leading-relaxed transition-all duration-1000">
                                    {slide.description}
                                </p>
                            </div>

                            {/* CTA Button */}
                            {slide.buttonText && (
                                <div>
                                    <a
                                        href={slide.buttonLink || '#'}
                                        className="inline-flex items-center gap-3 px-8 py-3 bg-gray-800 hover:bg-black text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg"
                                    >
                                        <span>{slide.buttonText}</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-4-4m0 8l4-4" />
                                        </svg>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Right Image */}
                        <div className="relative flex justify-center items-center order-1 md:order-2 slider-content-right" key={`right-${currentSlide}`}>
                            <div className="relative w-full max-w-sm">
                                {/* Image Container */}
                                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-1000">
                                    <img
                                        src={
                                            slide.image?.startsWith('http')
                                                ? slide.image
                                                : `${apiUrl}${slide.image}`
                                        }
                                        alt={slide.title}
                                        className="w-full h-80 md:h-96 object-cover bg-gray-200"
                                        onError={(e) => {
                                            e.target.src = generatePlaceholder('Image Not Found');
                                        }}
                                    />
                                </div>

                                {/* Decorative Circle Background */}
                                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gray-200 rounded-full opacity-40 blur-2xl"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Arrows - Left */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110 duration-200"
                    aria-label="Previous slide"
                >
                    <i className="fas fa-chevron-left" style={{ fontSize: '24px' }}></i>
                </button>

                {/* Navigation Arrows - Right */}
                <button
                    onClick={nextSlide}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110 duration-200"
                    aria-label="Next slide"
                >
                    <i className="fas fa-chevron-right" style={{ fontSize: '24px' }}></i>
                </button>

                {/* Dot Navigation */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                    {sliderSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'bg-black w-8'
                                : 'bg-gray-300 w-2 hover:bg-black'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default Slider;

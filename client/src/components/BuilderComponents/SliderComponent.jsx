'use client';

import React, { useState, useEffect } from 'react';
const SliderComponent = ({ content = {} }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);

    const slides = Array.isArray(content?.slides)
        ? content.slides
        : Array.isArray(content?.items)
            ? content.items
            : [];

    // Keep currentSlide in bounds if slides change
    useEffect(() => {
        if (slides.length === 0) {
            setCurrentSlide(0);
            return;
        }
        setCurrentSlide((idx) => Math.max(0, Math.min(idx, slides.length - 1)));
    }, [slides.length]);

    useEffect(() => {
        if (!autoPlay) return;
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [autoPlay, slides.length]);

    const nextSlide = () => {
        if (slides.length === 0) return;
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setAutoPlay(false);
    };

    const prevSlide = () => {
        if (slides.length === 0) return;
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setAutoPlay(false);
    };

    const goToSlide = (index) => {
        if (slides.length === 0) return;
        setCurrentSlide(index);
        setAutoPlay(false);
    };

    const handleScrollDown = () => {
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    };

    return (
        <div className="relative w-full overflow-hidden">
            {/* Slider Container */}
            <div className="relative h-72 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] w-full">
                {slides.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200">
                        <div className="text-center text-gray-600">
                            <i className="fas fa-image text-4xl mb-3 opacity-60"></i>
                            <p className="font-semibold">No slides configured</p>
                        </div>
                    </div>
                ) : null}
                {slides.map((slide, index) => (
                    <div
                        key={slide.id || slide._id || index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'
                        }`}
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200">
                            {slide.image && (
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            <div className="absolute inset-0 bg-black/40"></div>
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
                            <div className="max-w-2xl">
                                {slide.title ? (
                                    <h2 className="text-3xl md:text-5xl font-bold mb-4">{slide.title}</h2>
                                ) : null}
                                {slide.description ? (
                                    <p className="text-lg md:text-2xl mb-8">{slide.description}</p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Navigation Buttons */}
                {slides.length > 1 ? (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full transition"
                            aria-label="Previous slide"
                        >
                            <i className="fas fa-chevron-left" style={{ fontSize: '24px' }}></i>
                        </button>

                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full transition"
                            aria-label="Next slide"
                        >
                            <i className="fas fa-chevron-right" style={{ fontSize: '24px' }}></i>
                        </button>
                    </>
                ) : null}

                {/* Dots */}
                {slides.length > 1 ? (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`h-3 rounded-full transition ${
                                    index === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-3 hover:bg-white/75'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                ) : null}
            </div>

            {/* Scroll Down Indicator */}
            {slides.length > 0 ? (
                <button
                    onClick={handleScrollDown}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white"
                >
                    <i className="fas fa-arrow-down" style={{ fontSize: '24px' }}></i>
                </button>
            ) : null}
        </div>
    );
};

export default SliderComponent;

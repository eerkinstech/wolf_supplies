'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../../redux/slices/categorySlice';
import CategoryCard from '../CategoryCard/CategoryCard';


const FeaturedCategories = ({
    categoryNames = [],
    limit = 8,
    title = 'Featured Categories',
    showAllIfEmpty = true,
    layout = 'grid', // 'grid' or 'carousel'
    columns = 5,
    spacing = 'md',
    imageBorderRadius = 'md',
    titleFontSize = 'lg',
    descFontSize = 'sm',
    editorContent,
    editorStyle
}) => {
    // Allow editor overrides
    if (editorContent) {
        title = editorContent.title || title;
        categoryNames = Array.isArray(editorContent.categoryNames) && editorContent.categoryNames.length > 0 ? editorContent.categoryNames : categoryNames;
        limit = editorContent.limit || limit;
        layout = editorContent.layout || layout;
        columns = editorContent.columns || columns;
        spacing = editorContent.spacing || spacing;
        imageBorderRadius = editorContent.imageBorderRadius || imageBorderRadius;
        titleFontSize = editorContent.titleFontSize || titleFontSize;
        descFontSize = editorContent.descFontSize || descFontSize;
    }
    const dispatch = useDispatch();
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [screenSize, setScreenSize] = useState('lg');
    const { categories, loading } = useSelector((state) => state.category);

    // Determine items per slide based on screen size (responsive)
    const getItemsPerSlide = () => {
        if (screenSize === 'sm') return 2; // Mobile: 2 columns
        if (screenSize === 'md') return 4; // Tablet: 4 columns
        return 6; // Desktop: 6 columns
    };

    const ITEMS_PER_SLIDE = getItemsPerSlide();

    // Determine if carousel should show (when items exceed visible columns)
    const shouldShowCarousel = filteredCategories.length > ITEMS_PER_SLIDE;

    // Map spacing values to Tailwind classes
    const getSpacingClass = (spacingValue) => {
        const spacingMap = {
            'sm': 'gap-2',
            'md': 'gap-4',
            'lg': 'gap-6',
            'xl': 'gap-8'
        };
        return spacingMap[spacingValue] || 'gap-4';
    };

    // Map border radius values
    const getBorderRadiusClass = (radiusValue) => {
        const radiusMap = {
            'none': 'rounded-none',
            'sm': 'rounded-sm',
            'md': 'rounded-md',
            'lg': 'rounded-lg',
            'full': 'rounded-full'
        };
        return radiusMap[radiusValue] || 'rounded-md';
    };

    // Map font sizes
    const getFontSizeClass = (sizeValue) => {
        const sizeMap = {
            'xs': 'text-xs',
            'sm': 'text-sm',
            'base': 'text-base',
            'lg': 'text-lg',
            'xl': 'text-xl',
            '2xl': 'text-2xl'
        };
        return sizeMap[sizeValue] || 'text-base';
    };

    // Get grid columns class - responsive (2 mobile, 4 tablet, 6 desktop)
    const getColumnsClass = () => {
        return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6';
    };

    // Monitor screen size
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setScreenSize('sm');
            } else if (width < 1024) {
                setScreenSize('md');
            } else {
                setScreenSize('lg');
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Recursively flatten all categories from all hierarchy levels
        const flattenCategories = (cats) => {
            let result = [];
            if (!cats || !Array.isArray(cats)) return result;

            for (const cat of cats) {
                result.push(cat);
                // Recursively add subcategories at all levels
                if (cat.subcategories && Array.isArray(cat.subcategories)) {
                    result = result.concat(flattenCategories(cat.subcategories));
                }
            }
            return result;
        };

        // Filter categories by names and apply limit only for carousel mode
        if (categories && categories.length > 0) {
            let filtered = flattenCategories(categories);

            // Filter by category names if provided
            if (categoryNames && categoryNames.length > 0) {
                filtered = filtered.filter((category) =>
                    categoryNames.some(
                        (name) =>
                            category.name.toLowerCase() === name.toLowerCase() ||
                            category.slug.toLowerCase() === name.toLowerCase()
                    )
                );
            } else if (showAllIfEmpty) {
                // Show all categories if no specific names provided and showAllIfEmpty is true
                filtered = flattenCategories(categories);
            }

            // Only update state if filtered categories actually changed
            setFilteredCategories((prev) => {
                // Check if arrays are different before updating
                if (prev.length !== filtered.length) return filtered;
                if (prev.length === 0) return filtered;
                // Quick check if it's the same data
                const prevIds = prev.map(c => c.id || c._id).join(',');
                const filteredIds = filtered.map(c => c.id || c._id).join(',');
                return prevIds === filteredIds ? prev : filtered;
            });
        }
    }, [categories, categoryNames, showAllIfEmpty]);

    // Carousel navigation - slides by 1 item
    const handlePrevious = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) =>
            Math.min(prev + 1, Math.max(0, filteredCategories.length - ITEMS_PER_SLIDE))
        );
    };

    if (loading && categories.length === 0) {
        return (
            <section className="bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">{title}</h2>
                        <div className="h-1 w-20 bg-gray-900 rounded-full"></div>
                    </div>
                    {layout === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10">
                            {[...Array(limit)].map((_, index) => (
                                <div key={index} className="flex flex-col items-center gap-6 py-8">
                                    <div className="w-48 h-48 bg-gradient-to-br from-gray-200 to-black-300 rounded-full animate-pulse"></div>
                                    <div className="w-32 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-gray-200 to-black-300 rounded-full h-48 w-48 animate-pulse"></div>
                    )}
                </div>
            </section>
        );
    }

    if (filteredCategories.length === 0) {
        return (
            <section className="bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">{categoryNames.length > 0 ? title : 'Featured Categories'}</h2>
                        <div className="h-1 w-20 bg-gray-900 rounded-full"></div>
                    </div>
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-600 text-xl font-medium">
                            {categoryNames.length > 0
                                ? `No categories found matching: ${categoryNames.join(', ')}`
                                : 'No categories available'}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white pb-10">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">{title}</h2>
                    <div className="h-1 w-20 bg-gray-900 rounded-full"></div>
                </div>

                {!shouldShowCarousel ? (
                    // Grid Layout - Show all categories that fit on screen
                    <div className={`grid ${getColumnsClass()} gap-1 sm:gap-2 md:gap-4 lg:gap-8`}>
                        {filteredCategories.map((category) => (
                            <div key={category.id || category._id} className="transform hover:scale-105 transition duration-300">
                                <CategoryCard category={category} />
                            </div>
                        ))}
                    </div>
                ) : (
                    // Carousel Layout - Show when items exceed visible columns
                    <div className="relative py-6">
                        {/* Left Chevron - Overlay - Only show when carousel is active */}
                        {shouldShowCarousel && (
                            <button
                                onClick={handlePrevious}
                                disabled={currentIndex === 0}
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition duration-300 shadow-xl hover:shadow-2xl hover:scale-110 z-20"
                                aria-label="Previous categories"
                            >
                                <i className="fas fa-chevron-left text-lg"></i>
                            </button>
                        )}

                        {/* Grid Container - Full Width */}
                        <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{
                                    transform: `translateX(-${currentIndex * (100 / filteredCategories.length)}%)`,
                                    width: `${(filteredCategories.length / ITEMS_PER_SLIDE) * 100}%`,
                                }}
                            >
                                {filteredCategories.map((category) => (
                                    <div key={category.id || category._id} className="0 flex-shrink-0 px-2 md:px-3" style={{ width: `${100 / filteredCategories.length}%` }}>
                                        <CategoryCard category={category} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Chevron - Overlay - Only show when carousel is active */}
                        {shouldShowCarousel && (
                            <button
                                onClick={handleNext}
                                disabled={currentIndex >= filteredCategories.length - ITEMS_PER_SLIDE}
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition duration-300 shadow-xl hover:shadow-2xl hover:scale-110 z-20"
                                aria-label="Next categories"
                            >
                                <i className="fas fa-chevron-right text-lg"></i>
                            </button>
                        )}

                        {/* Carousel Indicators - Only show when carousel is active */}
                        {shouldShowCarousel && (
                        <div className="flex justify-center items-center gap-3 mt-10">
                            {Array.from({ length: Math.ceil(filteredCategories.length / ITEMS_PER_SLIDE) }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx * ITEMS_PER_SLIDE)}
                                    className={`h-3 rounded-full transition-all duration-300 cursor-pointer ${Math.floor(currentIndex / ITEMS_PER_SLIDE) === idx ? 'bg-black w-10 shadow-lg' : 'bg-gray-300 w-3 hover:bg-black'
                                        }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>                        )}                    </div>
                )}

 
            </div>
        </section>
    );
};

export default React.memo(FeaturedCategories);

import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard';
import { cachedJsonFetch } from '../../../utils/apiCache';
import { getApiUrl } from '../../../utils/envHelper';

const FeaturedProducts = ({
    category = '',
    selectedProductIds = [],
    limit = 8,
    title = 'Featured Products',
    layout = 'grid', // 'grid' or 'carousel'
    columns = 5,
    spacing = 'md',
    imageBorderRadius = 'md',
    titleFontSize = 'lg',
    descFontSize = 'sm',
    editorContent,
    editorStyle
}) => {
    // allow editor overrides
    if (editorContent) {
        title = editorContent.title || title;
        category = editorContent.category || category;
        selectedProductIds = editorContent.selectedProductIds || selectedProductIds;
        limit = editorContent.limit || limit;
        layout = editorContent.layout || layout;
        columns = editorContent.columns || columns;
        spacing = editorContent.spacing || spacing;
        imageBorderRadius = editorContent.imageBorderRadius || imageBorderRadius;
        titleFontSize = editorContent.titleFontSize || titleFontSize;
        descFontSize = editorContent.descFontSize || descFontSize;
    }
    const navigate = useNavigate();
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [screenSize, setScreenSize] = useState('lg');
    const [localProducts, setLocalProducts] = useState([]);
    const [loading, setLoading] = useState(true); // Local loading state
    const normalizedSelectedProductIds = useMemo(
        () => (Array.isArray(selectedProductIds) ? selectedProductIds.map((id) => String(id)) : []),
        [selectedProductIds]
    );
    const hasProductSource = normalizedSelectedProductIds.length > 0 || Boolean(category && category.trim());
    const normalizedProducts = useMemo(() => {
        return Array.isArray(localProducts) ? localProducts : (localProducts && localProducts.products) || [];
    }, [localProducts]);

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

    // Get grid columns class - responsive (2 mobile, 4 tablet, 5+ desktop)
    const getColumnsClass = (col) => {
        const colMap = {
            2: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-2',
            3: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-3',
            4: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4',
            5: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5',
            6: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
        };
        return colMap[col] || 'grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5';
    };

    // Determine items per slide based on screen size (responsive)
    const getItemsPerSlide = () => {
        if (screenSize === 'sm') return 2; // Mobile: 2 columns
        if (screenSize === 'md') return 4; // Tablet: 4 columns
        return 5; // Desktop: 5 columns
    };

    const ITEMS_PER_SLIDE = getItemsPerSlide();

    // Determine if carousel should show (smart grid-to-carousel transition)
    // Only use carousel logic if layout is not explicitly set to 'grid' in admin
    const shouldShowCarousel = layout !== 'grid' && filteredProducts.length > ITEMS_PER_SLIDE;

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
        const fetchAndCache = async () => {
            if (!hasProductSource) {
                setLocalProducts([]);
                setFilteredProducts([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const baseUrl = getApiUrl();
                const params = new URLSearchParams();
                const requestedLimit = Math.max(Number(limit) || 0, normalizedSelectedProductIds.length || 0, 1);

                if (normalizedSelectedProductIds.length > 0) {
                    params.set('ids', normalizedSelectedProductIds.join(','));
                    params.set('limit', String(requestedLimit));
                } else if (category && category.trim()) {
                    params.set('category', category.trim());
                    params.set('limit', String(requestedLimit));
                }

                const data = await cachedJsonFetch(`${baseUrl}/api/products?${params.toString()}`);
                const products = Array.isArray(data) ? data : (data?.products || []);

                if (normalizedSelectedProductIds.length > 0) {
                    const productMap = new Map(products.map((product) => [String(product._id || product.id), product]));
                    setLocalProducts(
                        normalizedSelectedProductIds
                            .map((id) => productMap.get(id))
                            .filter(Boolean)
                    );
                } else {
                    setLocalProducts(products);
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
                setLocalProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAndCache();
    }, [category, limit, normalizedSelectedProductIds, hasProductSource]);

    useEffect(() => {
        if (normalizedProducts && normalizedProducts.length > 0) {
            let filtered = normalizedProducts;

            if (normalizedSelectedProductIds.length > 0) {
                const selectedIdSet = new Set(normalizedSelectedProductIds);
                const productMap = new Map(
                    normalizedProducts.map((product) => [String(product._id || product.id), product])
                );

                filtered = normalizedSelectedProductIds
                    .map((id) => productMap.get(id))
                    .filter(Boolean);

                if (filtered.length === 0) {
                    filtered = normalizedProducts.filter((product) =>
                        selectedIdSet.has(String(product._id || product.id))
                    );
                }
            } else if (category && category.trim()) {
                const acceptedValues = new Set([category.trim().toLowerCase()]);

                filtered = filtered.filter((product) => {
                    if (Array.isArray(product.categories)) {
                        return product.categories.some((cat) => {
                            if (typeof cat === 'string') {
                                return acceptedValues.has(cat.trim().toLowerCase());
                            }

                            if (cat && typeof cat === 'object') {
                                const productCategoryValues = [cat._id, cat.id, cat.name, cat.slug]
                                    .filter(Boolean)
                                    .map((value) => String(value).trim().toLowerCase());
                                return productCategoryValues.some((value) => acceptedValues.has(value));
                            }

                            return false;
                        });
                    }

                    if (product.category) {
                        return acceptedValues.has(String(product.category).trim().toLowerCase());
                    }

                    return false;
                });
            }

            // Only update state if filtered products actually changed
            setFilteredProducts((prev) => {
                // Check if arrays are different before updating
                if (prev.length !== filtered.length) return filtered;
                if (prev.length === 0) return filtered;
                // Quick check if it's the same data
                const prevIds = prev.map(p => p._id).join(',');
                const filteredIds = filtered.map(p => p._id).join(',');
                return prevIds === filteredIds ? prev : filtered;
            });
        } else {
            setFilteredProducts([]);
        }
    }, [normalizedProducts, category, normalizedSelectedProductIds]);

    useEffect(() => {
        setCurrentIndex(0);
    }, [filteredProducts.length, ITEMS_PER_SLIDE]);

    if (!hasProductSource) {
        return null;
    }

    // Carousel navigation - slides by 1 item
    const handlePrevious = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) =>
            Math.min(prev + 1, Math.max(0, filteredProducts.length - ITEMS_PER_SLIDE))
        );
    };

    if (loading && localProducts.length === 0) {
        return (
            <section className="py-4 px-4 bg-[var(--color-bg-primary)]">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 flex items-center justify-between">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[var(--color-text-primary)] mb-4">{title}</h2>
                        {category && (
                            <button
                                onClick={() => navigate(`/products?category=${category}`)}
                                className="px-8 py-3 bg-[var(--color-accent-primary)] rounded-lg text-white font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-[var(--color-accent-light)] transition duration-300"
                            >
                                Shop All
                            </button>
                        )}
                    </div>
                    {layout === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8">
                            {[...Array(limit)].map((_, index) => (
                                <div key={index} className="bg-gradient-to-br from-gray-200 to-black-300 rounded-3xl h-96 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-gray-200 to-black-300 rounded-3xl h-96 animate-pulse"></div>
                    )}
                </div>
            </section>
        );
    }

    if (filteredProducts.length === 0) {
        return (
            <section className="bg-[var(--color-bg-primary)]">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 flex items-center justify-between">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[var(--color-text-primary)] mb-4">{title}</h2>
                        {category && (
                            <button
                                onClick={() => navigate(`/products?category=${category}`)}
                                className="px-8 py-3 bg-[var(--color-accent-primary)] text-white rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-[var(--color-accent-light)] transition duration-300"
                            >
                                Shop All
                            </button>
                        )}
                    </div>
                    <div className="text-center py-20 bg-[var(--color-bg-primary)] rounded-2xl border-2 border-dashed border-[var(--color-border-light)]">
                        <p className="text-[var(--color-text-light)] text-base sm:text-lg md:text-xl font-medium">
                            {category ? `No products found in ${category}` : 'No products available'}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-[var(--color-bg-primary)]">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[var(--color-text-primary)] mb-4">{title}</h2>
                    </div>
                    <button
                        onClick={() => navigate(category ? `/products?category=${category}` : '/products')}
                        className="px-8 py-3 bg-[var(--color-accent-primary)] text-white font-bold rounded-lg text-xs sm:text-sm uppercase tracking-wider hover:bg-gray-900 transition duration-300"
                    >
                        Shop All
                    </button>
                </div>

                {!shouldShowCarousel ? (
                    // Grid Layout - Show all products that fit on screen
                    <div className={`grid ${getColumnsClass(columns)} gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8`}>
                        {filteredProducts.slice(0, limit).map((product) => (
                            <div key={product._id} className="w-full transform hover:scale-105 transition duration-300">
                                <ProductCard product={product} />
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
                                aria-label="Previous products"
                            >
                                <i className="fas fa-chevron-left text-lg"></i>
                            </button>
                        )}

                        {/* Grid Container - Full Width */}
                        <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{
                                    transform: `translateX(-${currentIndex * (100 / Math.min(filteredProducts.length, limit))}%)`,
                                    width: `${(Math.min(filteredProducts.length, limit) / ITEMS_PER_SLIDE) * 100}%`,
                                }}
                            >
                                {filteredProducts.slice(0, limit).map((product) => (
                                    <div key={product._id} className="transform hover:scale-105 my-4 transition duration-300 flex-shrink-0 px-2 md:px-3" style={{ width: `${100 / Math.min(filteredProducts.length, limit)}%` }}>
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Chevron - Overlay - Only show when carousel is active */}
                        {shouldShowCarousel && (
                            <button
                                onClick={handleNext}
                                disabled={currentIndex >= Math.min(filteredProducts.length, limit) - ITEMS_PER_SLIDE}
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-full transition duration-300 shadow-xl hover:shadow-2xl hover:scale-110 z-20"
                                aria-label="Next products"
                            >
                                <i className="fas fa-chevron-right text-lg"></i>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedProducts;

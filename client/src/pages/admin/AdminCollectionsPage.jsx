'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout.jsx';
import { getApiUrl } from '../../utils/envHelper';

const AdminCollectionsPage = () => {
    const API_URL = getApiUrl();

    const [collectionsLoading, setCollectionsLoading] = useState(true);

    const [allCategories, setAllCategories] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'products'
    const [productSearchTerms, setProductSearchTerms] = useState({ 0: '', 1: '', 2: '' }); // Search term per section

    // Featured Categories State
    const [featuredCategoryNames, setFeaturedCategoryNames] = useState([]);
    const [featuredCategoryLayout, setFeaturedCategoryLayout] = useState('grid'); // 'grid' or 'carousel'
    const [featuredCategoryColumns, setFeaturedCategoryColumns] = useState(5); // 2-6 columns

    // Featured Products State (3 sections)
    const [featuredProductsSections, setFeaturedProductsSections] = useState([
        { title: 'Featured Products 1', category: '', limit: 4, layout: 'grid', selectedProductIds: [] },
        { title: 'Featured Products 2', category: '', limit: 4, layout: 'grid', selectedProductIds: [] },
        { title: 'Featured Products 3', category: '', limit: 4, layout: 'grid', selectedProductIds: [] },
    ]);

    const defaultSections = [
        { title: 'Featured Products 1', category: '', limit: 4, layout: 'grid', selectedProductIds: [] },
        { title: 'Featured Products 2', category: '', limit: 4, layout: 'grid', selectedProductIds: [] },
        { title: 'Featured Products 3', category: '', limit: 4, layout: 'grid', selectedProductIds: [] },
    ];

    const normalizeValue = (value) => String(value || '').trim().toLowerCase();

    const getCategoryTokens = (category) => {
        if (!category) return [];

        if (typeof category === 'string') {
            return [normalizeValue(category)].filter(Boolean);
        }

        if (typeof category === 'object') {
            return [
                normalizeValue(category._id),
                normalizeValue(category.id),
                normalizeValue(category.name),
                normalizeValue(category.slug),
            ].filter(Boolean);
        }

        return [];
    };

    const getCategoryOptionValue = (category) =>
        String(category?._id || category?.id || category?.slug || category?.name || '');

    const getCategoryLabel = (categoryValue) => {
        if (!categoryValue) return 'All Products';

        const normalizedSelected = normalizeValue(categoryValue);
        const matchedCategory = allCategories.find((category) =>
            getCategoryTokens(category).includes(normalizedSelected)
        );

        return matchedCategory?.name || categoryValue;
    };

    const normalizeProductSectionCategory = (categoryValue, categoriesList) => {
        const normalizedSelected = normalizeValue(categoryValue);
        if (!normalizedSelected) return '';

        const matchedCategory = categoriesList.find((category) =>
            getCategoryTokens(category).includes(normalizedSelected)
        );

        return matchedCategory ? getCategoryOptionValue(matchedCategory) : categoryValue;
    };

    useEffect(() => {
        const flattenCategories = (cats) => {
            let result = [];
            if (!cats || !Array.isArray(cats)) return result;

            for (const cat of cats) {
                result.push(cat);
                if (cat.subcategories && Array.isArray(cat.subcategories)) {
                    result = result.concat(flattenCategories(cat.subcategories));
                }
            }
            return result;
        };

        const loadFeaturedCollections = async () => {
            try {
                setCollectionsLoading(true);
                const noStoreOptions = {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache',
                    },
                };

                const [settingsResponse, categoriesResponse, productsResponse] = await Promise.all([
                    fetch(`${API_URL}/api/settings/featured-collections`, noStoreOptions),
                    fetch(`${API_URL}/api/categories`, noStoreOptions),
                    fetch(`${API_URL}/api/products?limit=10000`, noStoreOptions),
                ]);

                const [settingsData, categoriesData, productsData] = await Promise.all([
                    settingsResponse.json(),
                    categoriesResponse.json(),
                    productsResponse.json(),
                ]);

                const categoriesList = Array.isArray(categoriesData)
                    ? categoriesData
                    : Array.isArray(categoriesData?.categories)
                        ? categoriesData.categories
                        : [];
                const productsList = Array.isArray(productsData)
                    ? productsData
                    : Array.isArray(productsData?.products)
                        ? productsData.products
                        : [];

                setAllCategories(flattenCategories(categoriesList));
                setAllProducts(productsList);

                const data = settingsData;
                if (data.featuredCategories) {
                    setFeaturedCategoryNames(data.featuredCategories.categoryNames || []);
                    setFeaturedCategoryLayout(data.featuredCategories.layout || 'grid');
                    setFeaturedCategoryColumns(data.featuredCategories.columns || 5);
                }
                const savedSections = Array.isArray(data.featuredProducts) ? data.featuredProducts : [];
                const normalizedSections = defaultSections.map((defaultSection, index) => {
                    const savedSection = savedSections[index] || {};
                    return {
                        ...defaultSection,
                        ...savedSection,
                        title: savedSection.title ?? defaultSection.title,
                        category: normalizeProductSectionCategory(savedSection.category ?? defaultSection.category, flattenCategories(categoriesList)),
                        limit: Number(savedSection.limit ?? defaultSection.limit),
                        layout: savedSection.layout ?? defaultSection.layout,
                        selectedProductIds: Array.isArray(savedSection.selectedProductIds) ? savedSection.selectedProductIds : [],
                    };
                });
                setFeaturedProductsSections(normalizedSections);
            } catch (e) {
                console.error('Error loading featured collections:', e);
            } finally {
                setCollectionsLoading(false);
            }
        };
        loadFeaturedCollections();
    }, [API_URL]);

    // Save Featured Categories to Database
    const handleSaveFeaturedCategories = async () => {
        if (featuredCategoryNames.length === 0) {
            toast.error('Select at least one category');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/settings/featured-collections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    featuredCategories: {
                        categoryNames: featuredCategoryNames,
                        layout: featuredCategoryLayout,
                        columns: featuredCategoryColumns,
                    },
                }),
            });
            if (!response.ok) throw new Error('Failed to save');
            toast.success('✅ Featured categories saved to database!');
        } catch (error) {
            toast.error('❌ Failed to save featured categories');
        }
    };

    // Save Featured Products to Database
    const handleSaveFeaturedProducts = async () => {
        const allValid = featuredProductsSections.every((section) => {
            // Category is optional (if empty, show all products)
            // But limit is required
            if (!section.limit || section.limit < 1) {
                return false;
            }
            return true;
        });

        if (!allValid) {
            toast.error('Fill all sections with limit (min 1). Category is optional - leave blank to show all products');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/settings/featured-collections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    featuredProducts: featuredProductsSections.map(section => ({
                        title: section.title,
                        category: section.category,
                        limit: section.limit,
                        layout: section.layout,
                        selectedProductIds: section.selectedProductIds || []
                    })),
                }),
            });
            if (!response.ok) throw new Error('Failed to save');
            toast.success('✅ Featured products saved to database!');
        } catch (error) {
            console.error('Save error:', error);
            toast.error('❌ Failed to save featured products');
        }
    };

    // Toggle category selection
    const toggleCategorySelect = (categoryName) => {
        setFeaturedCategoryNames((prev) =>
            prev.includes(categoryName)
                ? prev.filter((n) => n !== categoryName)
                : [...prev, categoryName]
        );
    };

    // Update section
    const updateSection = (index, field, value) => {
        const updated = [...featuredProductsSections];
        updated[index] = { ...updated[index], [field]: value };
        setFeaturedProductsSections(updated);
    };

    // Toggle product selection
    const toggleProductSelection = (sectionIndex, productId) => {
        const updated = [...featuredProductsSections];
        const currentIds = updated[sectionIndex].selectedProductIds || [];

        if (currentIds.includes(productId)) {
            updated[sectionIndex].selectedProductIds = currentIds.filter(id => id !== productId);
        } else {
            updated[sectionIndex].selectedProductIds = [...currentIds, productId];
        }

        setFeaturedProductsSections(updated);
    };

    const getSelectedCategoryTokens = (selectedCategory) => {
        const normalizedSelected = normalizeValue(selectedCategory);
        const matchedCategory = allCategories.find((category) =>
            getCategoryTokens(category).includes(normalizedSelected)
        );

        return new Set([
            normalizedSelected,
            ...getCategoryTokens(matchedCategory),
        ].filter(Boolean));
    };

    // Get filtered products for selector (by category and search)
    const getFilteredProductsForSection = (sectionIndex) => {
        let filtered = [...allProducts];

        const section = featuredProductsSections[sectionIndex];

        // Filter by section's category if set
        if (section.category) {
            const selectedCategoryTokens = getSelectedCategoryTokens(section.category);

            filtered = filtered.filter((p) => {
                const productCategories = Array.isArray(p.categories)
                    ? p.categories
                    : (p.category ? [p.category] : []);

                return productCategories.some((category) => {
                    const productCategoryTokens = getCategoryTokens(category);
                    return productCategoryTokens.some((token) => selectedCategoryTokens.has(token));
                });
            });
        }

        // Filter by search term for this specific section
        const searchTerm = productSearchTerms[sectionIndex] || '';
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    };

    // Get selected products for a section
    const getSelectedProductsForSection = (sectionIndex) => {
        const selectedIds = featuredProductsSections[sectionIndex]?.selectedProductIds || [];
        return allProducts.filter(p => selectedIds.includes(p._id || p.id));
    };

    return (
        <AdminLayout activeTab="collections">
            <main className="py-8 px-6 min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Featured Collections</h1>
                            <p style={{ color: 'var(--color-text-light)' }}>Manage which products and categories appear as featured on your storefront</p>
                        </div>
                        <Link to="/admin" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px', color: 'var(--color-accent-primary)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-section)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-primary)'}>
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>

                {collectionsLoading ? (
                    <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
                        <p style={{ color: 'var(--color-text-light)' }}>Loading saved collections...</p>
                    </div>
                ) : (
                    <>
                        {/* Tab Navigation */}
                        <div className="rounded-t-xl sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderBottomWidth: '1px' }}>
                            <div className="flex">
                                <button
                                    onClick={() => setActiveTab('categories')}
                                    className={`flex-1 px-8 py-4 font-semibold text-center transition border-b-3`}
                                    style={{
                                        borderColor: activeTab === 'categories' ? 'var(--color-accent-primary)' : 'transparent',
                                        color: activeTab === 'categories' ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                                        backgroundColor: activeTab === 'categories' ? 'var(--color-bg-section)' : 'var(--color-bg-primary)'
                                    }}
                                >
                                    📂 Featured Categories
                                </button>
                                <div style={{ width: '1px', backgroundColor: 'var(--color-border-light)' }}></div>
                                <button
                                    onClick={() => setActiveTab('products')}
                                    className={`flex-1 px-8 py-4 font-semibold text-center transition border-b-3`}
                                    style={{
                                        borderColor: activeTab === 'products' ? 'var(--color-accent-primary)' : 'transparent',
                                        color: activeTab === 'products' ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                                        backgroundColor: activeTab === 'products' ? 'var(--color-bg-section)' : 'var(--color-bg-primary)'
                                    }}
                                >
                                    🛍️ Featured Products (3 Sections)
                                </button>
                            </div>
                        </div>

                        {/* Featured Categories Tab */}
                        {activeTab === 'categories' && (
                            <div className="rounded-b-xl" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px', borderTopWidth: '0px' }}>
                                <div className="p-4">
                                    {/* Settings Panel */}
                                    <div className="max-w-full space-y-6">
                                        {/* Category Selection */}
                                        <div className="border rounded-lg p-6" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-section)' }}>
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                                                <span className="text-xl">📂</span> Select Categories
                                            </h3>
                                            <div className="border rounded-lg max-h-80 overflow-y-auto" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-primary)' }}>
                                                {allCategories.length > 0 ? (
                                                    allCategories.map((c) => (
                                                        <label key={c._id || c.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 cursor-pointer transition" style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)' }} onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = 'var(--color-bg-section)'} onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'var(--color-bg-primary)'}>
                                                            <input
                                                                type="checkbox"
                                                                checked={featuredCategoryNames.includes(c.name)}
                                                                onChange={() => toggleCategorySelect(c.name)}
                                                                className="w-5 h-5"
                                                                style={{ accentColor: 'var(--color-accent-primary)' }}
                                                            />
                                                            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{c.name}</span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <p className="px-4 py-6 text-center" style={{ color: 'var(--color-text-primary)' }}>No categories available</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Layout Selection */}
                                        <div className="border rounded-lg p-6" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-section)' }}>
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                                                <span className="text-xl">📐</span> Display Layout
                                            </h3>
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition" style={{ borderColor: featuredCategoryLayout === 'grid' ? 'var(--color-accent-primary)' : 'var(--color-border-light)' }} onMouseEnter={(e) => { if (featuredCategoryLayout !== 'grid') e.target.style.borderColor = 'var(--color-accent-light)'; }} onMouseLeave={(e) => { if (featuredCategoryLayout !== 'grid') e.target.style.borderColor = 'var(--color-border-light)'; }}>
                                                    <input
                                                        type="radio"
                                                        value="grid"
                                                        checked={featuredCategoryLayout === 'grid'}
                                                        onChange={(e) => setFeaturedCategoryLayout(e.target.value)}
                                                        className="w-5 h-5"
                                                        style={{ accentColor: 'var(--color-accent-primary)' }}
                                                    />
                                                    <div>
                                                        <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Grid View</div>
                                                        <div className="text-xs" style={{ color: 'var(--color-text-light)' }}>Display all selected categories in grid</div>
                                                    </div>
                                                </label>
                                                <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition" style={{ borderColor: featuredCategoryLayout === 'carousel' ? 'var(--color-accent-primary)' : 'var(--color-border-light)' }} onMouseEnter={(e) => { if (featuredCategoryLayout !== 'carousel') e.target.style.borderColor = 'var(--color-accent-light)'; }} onMouseLeave={(e) => { if (featuredCategoryLayout !== 'carousel') e.target.style.borderColor = 'var(--color-border-light)'; }}>
                                                    <input
                                                        type="radio"
                                                        value="carousel"
                                                        checked={featuredCategoryLayout === 'carousel'}
                                                        onChange={(e) => setFeaturedCategoryLayout(e.target.value)}
                                                        className="w-5 h-5"
                                                        style={{ accentColor: 'var(--color-accent-primary)' }}
                                                    />
                                                    <div>
                                                        <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Carousel</div>
                                                        <div className="text-xs" style={{ color: 'var(--color-text-light)' }}>5 items visible at once, slide through all selected</div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Columns Selection */}
                                        <div className="border rounded-lg p-6" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-section)' }}>
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                                                <span className="text-xl">🔲</span> Number of Columns
                                            </h3>
                                            <p className="text-xs mb-4" style={{ color: 'var(--color-text-light)' }}>
                                                Applies to both Grid and Carousel layouts
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="2"
                                                    max="6"
                                                    value={featuredCategoryColumns}
                                                    onChange={(e) => setFeaturedCategoryColumns(Number(e.target.value))}
                                                    className="flex-1 cursor-pointer"
                                                    style={{ accentColor: 'var(--color-accent-primary)' }}
                                                />
                                                <span className="text-2xl font-bold min-w-12 text-center px-4 py-2 rounded-lg border" style={{ color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)' }}>
                                                    {featuredCategoryColumns}
                                                </span>
                                            </div>
                                            <p className="text-sm mt-3" style={{ color: 'var(--color-text-light)' }}>
                                                {featuredCategoryColumns === 2 && '📱 2 columns - Mobile friendly, larger items'}
                                                {featuredCategoryColumns === 3 && '📱 3 columns - Tablet friendly'}
                                                {featuredCategoryColumns === 4 && '🖥️ 4 columns - Desktop view'}
                                                {featuredCategoryColumns === 5 && '🖥️ 5 columns - Standard desktop, many items'}
                                                {featuredCategoryColumns === 6 && '🖥️ 6 columns - Wide layout, compact items'}
                                            </p>
                                        </div>

                                        {/* Items Summary */}
                                        <div className="border rounded-lg p-5" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-section)' }}>
                                            <h4 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                                                <span>📋</span> Selected Items
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {featuredCategoryNames.length > 0 ? (
                                                    featuredCategoryNames.map((name) => (
                                                        <span key={name} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--color-accent-primary)', color: 'white' }}>
                                                            {name}
                                                            <button
                                                                onClick={() => toggleCategorySelect(name)}
                                                                className="hover:text-gray-900"
                                                            >
                                                                ✕
                                                            </button>
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-700 text-sm">No categories selected yet</span>
                                                )}
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-gray-300">
                                                <p className="text-sm text-gray-900">
                                                    <strong>{featuredCategoryNames.length} categories selected</strong>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Save Button */}
                                        <button
                                            onClick={handleSaveFeaturedCategories}
                                            className="w-full bg-black hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition shadow-lg"
                                        >
                                            💾 Save Configuration
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Featured Products Tab */}
                        {activeTab === 'products' && (
                            <div className="bg-white rounded-b-xl">
                                <div className="space-y-10 p-8">
                                    {/* 3 Sections */}
                                    {featuredProductsSections.map((section, idx) => (
                                        <div key={idx} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-400 transition">
                                            {/* Section Header */}
                                            <div className="bg-gray-50 border-b border-gray-200 px-8 py-5">
                                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-800 text-white rounded-full font-bold text-sm">
                                                        {idx + 1}
                                                    </span>
                                                    {section.title || `Section ${idx + 1}`}
                                                </h3>
                                            </div>

                                            {/* Section Content */}
                                            <div className="p-4">
                                                {/* Settings Panel */}
                                                <div className="max-w-full space-y-6">
                                                    {/* Title Input */}
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                            <span className="text-lg">📝</span> Section Title
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={section.title}
                                                            onChange={(e) => updateSection(idx, 'title', e.target.value)}
                                                            className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:outline-none font-medium transition"
                                                            placeholder="e.g., Latest Electronics"
                                                        />
                                                    </div>

                                                    {/* Category Selection */}
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                            <span className="text-lg">📂</span> Category (Optional)
                                                        </label>
                                                        <p className="text-xs text-gray-600 mb-3 italic">Leave blank to show all products from all categories</p>
                                                        <select
                                                            value={section.category}
                                                            onChange={(e) => updateSection(idx, 'category', e.target.value)}
                                                            className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:outline-none font-medium transition bg-white cursor-pointer"
                                                        >
                                                            <option value="">-- All Products --</option>
                                                            {allCategories.map((c) => (
                                                                <option key={c._id || c.id} value={getCategoryOptionValue(c)}>
                                                                    {c.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Items Count */}
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                            <span className="text-lg">🔢</span> Items to Display
                                                        </label>
                                                        <div className="flex items-center gap-4">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="50"
                                                                value={section.limit}
                                                                onChange={(e) => updateSection(idx, 'limit', Number(e.target.value))}
                                                                className="flex-1 border-2 border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:outline-none font-bold transition"
                                                            />
                                                            <span className="text-lg font-semibold text-gray-700">items</span>
                                                        </div>
                                                    </div>

                                                    {/* Layout Selection */}
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                            <span className="text-lg">📐</span> Display Layout
                                                        </label>
                                                        <div className="space-y-3">
                                                            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-400 transition" style={{ borderColor: section.layout === 'grid' ? 'var(--color-text-muted)' : 'var(--color-border)' }}>
                                                                <input
                                                                    type="radio"
                                                                    value="grid"
                                                                    checked={section.layout === 'grid'}
                                                                    onChange={(e) => updateSection(idx, 'layout', e.target.value)}
                                                                    className="w-5 h-5 accent-gray-400"
                                                                />
                                                                <div>
                                                                    <div className="font-semibold text-gray-900">Grid</div>
                                                                    <div className="text-xs text-gray-600">5 columns, all items</div>
                                                                </div>
                                                            </label>
                                                            <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-400 transition" style={{ borderColor: section.layout === 'carousel' ? 'var(--color-text-muted)' : 'var(--color-border)' }}>
                                                                <input
                                                                    type="radio"
                                                                    value="carousel"
                                                                    checked={section.layout === 'carousel'}
                                                                    onChange={(e) => updateSection(idx, 'layout', e.target.value)}
                                                                    className="w-5 h-5 accent-gray-400"
                                                                />
                                                                <div>
                                                                    <div className="font-semibold text-gray-900">Carousel</div>
                                                                    <div className="text-xs text-gray-600">5 visible, slide through</div>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* Manual Product Selection - Inline */}
                                                    <div className="border-2 rounded-lg p-5" style={{ borderColor: 'var(--color-accent-primary)', backgroundColor: 'rgba(var(--color-accent-primary-rgb), 0.05)' }}>
                                                        <h4 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-accent-primary)' }}>
                                                            <span>🎯</span> Select Products from Category
                                                        </h4>
                                                        <p className="text-sm mb-4" style={{ color: 'var(--color-text-primary)' }}>
                                                            {section.category ? (
                                                                <>Select products from <strong>{getCategoryLabel(section.category)}</strong></>
                                                            ) : (
                                                                <>Browse all products or select a category above to narrow the list</>
                                                            )}
                                                        </p>

                                                        {true && (
                                                            <>
                                                                {/* Search Bar */}
                                                                <div className="mb-4">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="🔍 Search products by name or SKU..."
                                                                        value={productSearchTerms[idx] || ''}
                                                                        onChange={(e) => setProductSearchTerms({ ...productSearchTerms, [idx]: e.target.value })}
                                                                        className="w-full border-2 px-4 py-2 rounded-lg focus:outline-none text-sm transition"
                                                                        style={{
                                                                            borderColor: 'var(--color-border-light)'
                                                                        }}
                                                                        onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary)'}
                                                                        onBlur={(e) => e.target.style.borderColor = 'var(--color-border-light)'}
                                                                    />
                                                                </div>

                                                                {/* Product Grid */}
                                                                <div className="space-y-2 max-h-80 overflow-y-auto border rounded-lg p-3" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'white' }}>
                                                                    {getFilteredProductsForSection(idx).length > 0 ? (
                                                                        getFilteredProductsForSection(idx).map((product) => {
                                                                            const isSelected = (featuredProductsSections[idx]?.selectedProductIds || []).includes(product._id || product.id);
                                                                            return (
                                                                                <label
                                                                                    key={product._id || product.id}
                                                                                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition hover:border-gray-300"
                                                                                    style={{
                                                                                        borderColor: isSelected ? 'var(--color-accent-primary)' : 'var(--color-border-light)',
                                                                                        backgroundColor: isSelected ? 'rgba(var(--color-accent-primary-rgb), 0.08)' : 'transparent'
                                                                                    }}
                                                                                >
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={isSelected}
                                                                                        onChange={() => toggleProductSelection(idx, product._id || product.id)}
                                                                                        className="w-4 h-4"
                                                                                        style={{ accentColor: 'var(--color-accent-primary)' }}
                                                                                    />
                                                                                    <div className="flex-1">
                                                                                        <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                                                                            {product.name}
                                                                                        </p>
                                                                                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-light)' }}>
                                                                                            <span>GBP {Number(product.price || 0).toFixed(2)}</span>
                                                                                            {product.stock > 0 ? (
                                                                                                <span style={{
                                                                                                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                                                                                    color: '#16a34a',
                                                                                                    padding: '1px 5px',
                                                                                                    borderRadius: '3px',
                                                                                                    fontWeight: '600'
                                                                                                }}>
                                                                                                    In Stock
                                                                                                </span>
                                                                                            ) : (
                                                                                                <span style={{
                                                                                                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                                                                                    color: '#dc2626',
                                                                                                    padding: '1px 5px',
                                                                                                    borderRadius: '3px',
                                                                                                    fontWeight: '600'
                                                                                                }}>
                                                                                                    Out of Stock
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </label>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <p className="text-center text-gray-500 py-6">No products found in this category</p>
                                                                    )}
                                                                </div>

                                                                {/* Selected Count */}
                                                                {getSelectedProductsForSection(idx).length > 0 && (
                                                                    <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(var(--color-accent-primary-rgb), 0.1)', borderLeft: '4px solid var(--color-accent-primary)' }}>
                                                                        <p className="text-sm font-semibold" style={{ color: 'var(--color-accent-primary)' }}>
                                                                            {getSelectedProductsForSection(idx).length} product{getSelectedProductsForSection(idx).length !== 1 ? 's' : ''} selected
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Configuration Summary */}
                                                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-5">
                                                        <h4 className="font-bold text-purple-900 mb-3 text-sm">⚙️ Configuration</h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-purple-800">Title:</span>
                                                                <span className="font-semibold text-purple-900">{section.title || 'Untitled'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-purple-800">Category:</span>
                                                                <span className="font-semibold text-purple-900">{getCategoryLabel(section.category)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-purple-800">Count:</span>
                                                                <span className="font-semibold text-purple-900">{section.limit} items</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-purple-800">Manual Selection:</span>
                                                                <span className="font-semibold text-purple-900">{(section.selectedProductIds || []).length} products</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-purple-800">Layout:</span>
                                                                <span className="font-semibold text-purple-900 uppercase">{section.layout}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Save All Button */}
                                    <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-8">
                                        <button
                                            onClick={handleSaveFeaturedProducts}
                                            className="w-full bg-black hover:bg-gray-700 text-white font-bold py-4 rounded-lg transition shadow-lg text-lg flex items-center justify-center gap-3"
                                        >
                                            <span></span> Save All Featured Products Configurations
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </AdminLayout>
    );
};

export default AdminCollectionsPage;

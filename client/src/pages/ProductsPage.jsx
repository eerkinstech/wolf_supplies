'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from "react-router-dom";
import { fetchProducts, setFilter } from '../redux/slices/productSlice';
import ProductCard from '../components/Products/ProductCard/ProductCard';
import ProductFilter from '../components/Products/ProductFilter/ProductFilter';


import { Helmet } from 'react-helmet-async';

const getProductPriceRange = (product) => {
  const basePrice = Number(product?.price || 0);
  const variantPrices = Array.isArray(product?.variantCombinations)
    ? product.variantCombinations
        .map((variant) => Number(variant?.price || 0))
        .filter((price) => price > 0)
    : [];

  if (variantPrices.length === 0) {
    return { min: basePrice, max: basePrice };
  }

  return {
    min: Math.min(...variantPrices),
    max: Math.max(...variantPrices),
  };
};

const getMatchingVariantPrices = (product, priceFilter) => {
  if (!Array.isArray(product?.variantCombinations)) return [];

  return product.variantCombinations
    .map((variant) => Number(variant?.price || 0))
    .filter(
      (price) =>
        price > 0 &&
        price >= Number(priceFilter?.min || 0) &&
        price <= Number(priceFilter?.max || 0)
    );
};

const getListingPrice = (product, priceFilter) => {
  const matchingVariantPrices = getMatchingVariantPrices(product, priceFilter);
  if (matchingVariantPrices.length > 0) {
    return Math.min(...matchingVariantPrices);
  }

  return getProductPriceRange(product).min;
};

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { products, loading, filters } = useSelector((state) => state.product);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasRequestedProducts, setHasRequestedProducts] = useState(false);



  // Extract search query from URL params
  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchQuery(q);

    // Update the search filter in Redux
    if (q) {
      dispatch(setFilter({ ...filters, search: q }));
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    setHasRequestedProducts(true);
    dispatch(fetchProducts());
  }, [dispatch]);

  // Calculate the maximum price from all products (for filter display)
  const maxPriceFromProducts = useMemo(() => {
    const productList = Array.isArray(products) ? products : (products && products.products) || [];
    if (!productList || productList.length === 0) return 100;

    let maxPrice = 0;
    productList.forEach((p) => {
      const { max } = getProductPriceRange(p);
      maxPrice = Math.max(maxPrice, max);
    });

    return maxPrice || 100;
  }, [products]);

  // Separate and organize products: exact matches first, then partial matches, then others
  useEffect(() => {
    // Ensure `products` is an array. Some API responses return an object
    // like { products: [...] } — guard against that to avoid `.filter` errors.
    let result = Array.isArray(products) ? products : (products && products.products) || [];
    const searchTerm = filters.search?.toLowerCase() || '';

    // Filter out draft products - only show active/published products
    result = result.filter(p => !p.isDraft);

    // Categorize products
    let exactMatches = [];
    let partialMatches = [];
    let otherProducts = [];

    result.forEach((p) => {
      const productName = p.name.toLowerCase();
      const productCategory = Array.isArray(p.categories)
        ? p.categories.map(c => (c.name || c).toLowerCase()).join(' ')
        : (p.category || '').toLowerCase();

      // Check if product matches search
      const searchMatches = searchTerm && (
        productName.includes(searchTerm) ||
        productCategory.includes(searchTerm)
      );

      // Categorize search results
      if (searchMatches) {
        if (productName.startsWith(searchTerm)) {
          exactMatches.push(p);
        } else {
          partialMatches.push(p);
        }
      } else {
        otherProducts.push(p);
      }
    });

    // Start with search results (exact + partial), then other products
    let organizingResult = [...exactMatches, ...partialMatches, ...otherProducts];

    // Apply category filter
    if (filters.category) {
      organizingResult = organizingResult.filter((p) => {
        if (Array.isArray(p.categories)) {
          return p.categories.some(c => c._id === filters.category || c.name === filters.category);
        }
        return p.category === filters.category;
      });
    }

    // Apply stock filter (check both variant and non-variant products)
    if (filters.availability && filters.availability.length > 0) {
      organizingResult = organizingResult.filter((p) => {
        // Check if product has variants
        const hasVariants = p.variants && p.variants.length > 0;
        let isInStock;

        if (hasVariants) {
          // For variant products, check if any variant combination has stock
          const hasStock = p.variantCombinations && p.variantCombinations.some(vc => vc.stock > 0);
          isInStock = hasStock;
        } else {
          // For non-variant products, check basic stock
          isInStock = p.stock > 0;
        }

        // Check if the product's stock status matches the selected filters
        if (filters.availability.includes('in_stock') && isInStock) return true;
        if (filters.availability.includes('out_of_stock') && !isInStock) return true;
        return false;
      });
    }

    // Apply price filter
    // For products with variants: check lowest variant price (ignore blank base price)
    // For products without variants: check base price
    organizingResult = organizingResult.filter((p) => {
      const matchingVariantPrices = getMatchingVariantPrices(p, filters.price);
      if (Array.isArray(p?.variantCombinations) && p.variantCombinations.length > 0) {
        return matchingVariantPrices.length > 0;
      }

      const basePrice = Number(p.price || 0);
      return basePrice >= filters.price.min && basePrice <= filters.price.max;
    });

    if (filters.sort === 'name_asc') {
      organizingResult.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === 'name_desc') {
      organizingResult.sort((a, b) => b.name.localeCompare(a.name));
    } else if (filters.sort === 'price_high_to_low') {
      organizingResult.sort((a, b) => getProductPriceRange(b).max - getProductPriceRange(a).max);
    } else if (filters.sort === 'price_low_to_high') {
      organizingResult.sort((a, b) => getProductPriceRange(a).min - getProductPriceRange(b).min);
    }

    setFilteredProducts(
      organizingResult.map((product) => ({
        ...product,
        listingPrice: getListingPrice(product, filters.price),
      }))
    );
  }, [products, filters]);

  const hasSearchResults = searchQuery && filteredProducts.length > 0;
  const isLoadingProducts = loading || !hasRequestedProducts;
  const exactMatchCount = useMemo(() => {
    if (!searchQuery) return 0;
    return filteredProducts.filter(p =>
      p.name.toLowerCase().startsWith(searchQuery.toLowerCase())
    ).length;
  }, [filteredProducts, searchQuery]);

  return (
    <>
      <Helmet>
        <title>Shop All Products | Wolf Supplies</title>
        <meta name="description" content="Browse all Wolf Supplies products. Wide selection of quality items with fast UK delivery and 31-day returns. Filter by category, price, and more." />
        <meta name="keywords" content="shop, products, online shopping, Wolf Supplies, quality items" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://wolfsupplies.co.uk/products" />
        <meta property="og:title" content="Shop All Products | Wolf Supplies" />
        <meta property="og:description" content="Browse our complete product selection. Filter by category and price. Fast UK delivery and 31-day returns." />
        <meta property="og:image" content="https://wolfsupplies.co.uk/og-image.jpg" />
        <meta property="og:url" content="https://wolfsupplies.co.uk/products" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Shop All Products | Wolf Supplies" />
        <meta name="twitter:description" content="Browse quality products with fast delivery and easy returns." />
      </Helmet>
      <div className="min-h-screen bg-[var(--color-bg-primary)] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] mb-4">Our Products</h1>
            {searchQuery ? (
              <div className="space-y-2">
                <p className="text-xl text-[var(--color-text-light)]">
                  Search results for: <span className="font-bold text-[var(--color-text-primary)]">"{searchQuery}"</span>
                </p>
                {hasSearchResults && (
                  <p className="text-sm text-green-600 font-semibold">
                    ✓ Found {filteredProducts.length} matching product{filteredProducts.length !== 1 ? 's' : ''} (Showing best matches first)
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xl text-[var(--color-text-light)]">Browse our amazing collection of products</p>
            )}
          </div>

          <div className="grid lg:grid-cols-6 gap-10">
            {/* Sidebar */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <ProductFilter
                  filters={filters}
                  maxPrice={maxPriceFromProducts}
                  onFilterChange={(newFilters) => dispatch(setFilter(newFilters))}
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-4 space-y-8">
              {isLoadingProducts ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-center">
                    <i className="fas fa-spinner animate-spin" style={{ fontSize: '64px', color: 'var(--color-text-light)', display: 'block', marginBottom: '16px' }}></i>
                    <p className="text-xl text-[var(--color-text-light)]">Loading products...</p>
                  </div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div>
                
                  {/* Products Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 bg-gradient-to-br from-[var(--color-bg-section)] to-[var(--color-bg-section)] rounded-2xl shadow-lg border border-[var(--color-border-light)]">
                  <div className="text-6xl mb-6">🔍</div>
                  <p className="text-2xl text-[var(--color-text-light)] font-semibold mb-2">No products found</p>
                  {searchQuery ? (
                    <div>
                      <p className="text-[var(--color-text-light)] text-lg mb-4">
                        We couldn't find any products matching "<span className="font-bold">{searchQuery}</span>"
                      </p>
                      <button
                        onClick={() => {
                          dispatch(setFilter({ ...filters, search: '' }));
                          setSearchQuery('');
                        }}
                        className="inline-block px-6 py-2 bg-[var(--color-accent-primary)] text-white font-bold rounded-lg hover:bg-[var(--color-accent-light)] transition duration-300"
                      >
                        View All Products
                      </button>
                    </div>
                  ) : (
                    <p className="text-[var(--color-text-light)] text-lg">Try adjusting your filters</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;

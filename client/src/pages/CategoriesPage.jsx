'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, setSearchQuery, clearSearchQuery } from '../redux/slices/categorySlice';
import CategoryCard from '../components/Categories/CategoryCard/CategoryCard';
import CategoryFilter from '../components/Categories/CategoryFilter/CategoryFilter';


import { Helmet } from 'react-helmet-async';

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const { categories, loading, error, searchQuery } = useSelector((state) => state.category);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [hasRequestedCategories, setHasRequestedCategories] = useState(false);



  useEffect(() => {
    setHasRequestedCategories(true);
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    // Flatten all categories including nested subcategories
    const flattenCategories = (items) => {
      let flattened = [];
      items.forEach((item) => {
        flattened.push(item);
        // If item has subcategories array, flatten them too
        if (item.subcategories && Array.isArray(item.subcategories) && item.subcategories.length > 0) {
          flattened = flattened.concat(flattenCategories(item.subcategories));
        }
      });
      return flattened;
    };

    let result = flattenCategories(categories);

    if (searchQuery) {
      // If searching, filter the flattened list
      result = result.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCategories(result);
  }, [categories, searchQuery]);

  const handleSearchChange = (value) => {
    dispatch(setSearchQuery(value));
  };

  const handleClearSearch = () => {
    dispatch(clearSearchQuery());
  };

  const isLoadingCategories = loading || !hasRequestedCategories;

  return (
    <>
      <Helmet>
        <title>Product Categories | Shop by Category | Wolf Supplies</title>
        <meta name="description" content="Browse all product categories at Wolf Supplies. Find the products you need organized by category with easy filtering and search." />
        <meta name="keywords" content="product categories, shop, browse, find products" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://wolfsupplies.co.uk/categories" />
        <meta property="og:title" content="Product Categories | Shop by Category | Wolf Supplies" />
        <meta property="og:description" content="Browse all product categories and find exactly what you're looking for." />
        <meta property="og:image" content="https://wolfsupplies.co.uk/og-image.jpg" />
        <meta property="og:url" content="https://wolfsupplies.co.uk/categories" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Product Categories | Wolf Supplies" />
        <meta name="twitter:description" content="Shop by category - find products organized by type." />
      </Helmet>
      <div className="min-h-screen bg-[var(--color-bg-primary)] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] mb-4">
              Shop by Category
            </h1>
            <p className="text-xl text-[var(--color-text-light)] max-w-2xl">
              Explore our wide range of products organized by category. Find exactly what you're looking for.
            </p>
          </div>

          {/* Search Filter */}
          <CategoryFilter
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
          />

          {/* Content */}
          {isLoadingCategories ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-center flex-col flex justify-center items-center">
                <i className="fas fa-spinner text-center animate-spin" style={{ fontSize: '64px', color: 'var(--color-text-light)', display: 'block', marginBottom: '16px' }}></i>
                <p className="text-xl text-[var(--color-text-light)]">Loading categories...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-24 bg-[var(--color-bg-primary)] rounded-2xl shadow-lg">
              <div className="text-6xl mb-6">⚠️</div>
              <p className="text-2xl text-red-600 font-semibold mb-2">Error Loading Categories</p>
              <p className="text-[var(--color-text-primary)] text-lg">{error}</p>
            </div>
          ) : filteredCategories.length > 0 ? (
            <div>
              <p className="text-[var(--color-text-light)] mb-8 text-lg">
                Showing <span className="font-bold text-[var(--color-accent-primary)]">{filteredCategories.length}</span> categor{filteredCategories.length === 1 ? 'y' : 'ies'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {filteredCategories.map((category) => (
                  <CategoryCard key={category._id} category={category} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-24 bg-[var(--color-bg-primary)] rounded-2xl shadow-lg">
              <div className="text-6xl mb-6">🔍</div>
              <p className="text-2xl text-[var(--color-text-light)] font-semibold mb-2">No categories found</p>
              <p className="text-[var(--color-text-primary)] text-lg">Try adjusting your search query</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoriesPage;

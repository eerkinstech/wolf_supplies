'use client';

import React, { useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategoryBySlug } from '../redux/slices/categorySlice';
import useURLRedirect from '../hooks/useURLRedirect';
import { fetchProducts, setFilter } from '../redux/slices/productSlice';
import ProductCard from '../components/Products/ProductCard/ProductCard';
import ProductFilter from '../components/Products/ProductFilter/ProductFilter';
import CategoryCard from '../components/Categories/CategoryCard/CategoryCard';


import { Helmet } from 'react-helmet-async';

const CategoryDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { categories, selectedCategory, loading, error } = useSelector((state) => state.category);
  const { products, filters } = useSelector((state) => state.product);

  const [filteredProducts, setFilteredProducts] = React.useState([]);
  const [subcategories, setSubcategories] = React.useState([]);



  // Check for URL redirects if category not found
  useURLRedirect(!selectedCategory && !loading);

  useEffect(() => {
    // Reset filter state and fetch category and products on mount/slug change
    setFilteredProducts([]);
    setSubcategories([]);
    dispatch(fetchCategoryBySlug(slug));
    dispatch(fetchProducts());
    window.scrollTo(0, 0);
  }, [slug, dispatch]);

  // Get subcategories for current category
  useEffect(() => {
    if (selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0) {
      // The backend now populates subcategories directly, so use them as-is
      const subs = Array.isArray(selectedCategory.subcategories)
        ? selectedCategory.subcategories
        : categories.filter(c => selectedCategory.subcategories.includes(c._id));
      setSubcategories(subs);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(setFilter({ category: selectedCategory.name }));
    }
  }, [selectedCategory, dispatch]);

  // Calculate the maximum price from all products (for filter display)
  const maxPriceFromProducts = useMemo(() => {
    if (!products || products.length === 0) return 100;
    
    let maxPrice = 0;
    products.forEach((p) => {
      // Check base price
      if (p.price > maxPrice) {
        maxPrice = p.price;
      }
      // Check variant prices
      if (p.variantCombinations && p.variantCombinations.length > 0) {
        p.variantCombinations.forEach((vc) => {
          const vcPrice = vc.price || p.price;
          if (vcPrice > maxPrice) {
            maxPrice = vcPrice;
          }
        });
      }
    });
    
    return maxPrice || 100;
  }, [products]);

  useEffect(() => {
    let result = products;

    // Filter by categories array (support for multiple categories)
    if (selectedCategory) {
      result = result.filter((p) => {
        // Check if product has categories array (new format)
        if (Array.isArray(p.categories)) {
          return p.categories.some(c => {
            // Support category objects with _id
            if (typeof c === 'object' && c._id) {
              return c._id === selectedCategory._id;
            }
            // Support category ID strings
            if (typeof c === 'string') {
              return c === selectedCategory._id || c === selectedCategory.name;
            }
            return false;
          });
        }
        // Fallback: support legacy single category field
        return p.category === selectedCategory._id || p.category === selectedCategory.name;
      });
    }

    // Apply search filter
    if (filters.search) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply stock filter (check both variant and non-variant products)
    if (filters.availability && filters.availability.length > 0) {
      result = result.filter((p) => {
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
    result = result.filter((p) => {
      const hasVariants = p.variants && p.variants.length > 0;

      if (hasVariants && p.variantCombinations && p.variantCombinations.length > 0) {
        // For variant products: get the lowest available price from variants
        let lowestVariantPrice = null;
        for (const vc of p.variantCombinations) {
          if (vc.price && vc.price > 0) {
            if (lowestVariantPrice === null || vc.price < lowestVariantPrice) {
              lowestVariantPrice = vc.price;
            }
          }
        }

        // Use variant price if available, otherwise use base price
        const priceToCheck = lowestVariantPrice !== null ? lowestVariantPrice : p.price;
        return priceToCheck >= filters.price.min && priceToCheck <= filters.price.max;
      }

      // For non-variant products, check base price
      return p.price >= filters.price.min && p.price <= filters.price.max;
    });

    setFilteredProducts(result);
  }, [products, filters, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-black-100 py-16 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="text-center">
          <i className="fas fa-spinner animate-spin" style={{ fontSize: '64px', color: '#9ca3af', display: 'block', marginBottom: '16px' }}></i>
          <p className="text-xl text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-black-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/categories')}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 font-semibold mb-8 transition duration-300"
          >
            <i className="fas fa-arrow-left"></i> Back to Categories
          </button>
          <div className="text-center py-24 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-6">⚠️</div>
            <p className="text-2xl text-red-600 font-semibold mb-2">Category Not Found</p>
            <p className="text-gray-900 text-lg">The category you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{selectedCategory?.name || 'Category'} | Wolf Supplies</title>
        <meta name="description" content={selectedCategory?.description || `Browse ${selectedCategory?.name} at Wolf Supplies. Find quality products with fast UK delivery and 31-day returns.`} />
        <meta name="keywords" content={`${selectedCategory?.name}, shop, products, Wolf Supplies`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://wolfsupplies.co.uk/category/${slug}`} />
        <meta property="og:title" content={`${selectedCategory?.name} | Wolf Supplies`} />
        <meta property="og:description" content={selectedCategory?.description || `Browse ${selectedCategory?.name} at Wolf Supplies.`} />
        <meta property="og:image" content={selectedCategory?.image || 'https://wolfsupplies.co.uk/og-image.jpg'} />
        <meta property="og:url" content={`https://wolfsupplies.co.uk/category/${slug}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${selectedCategory?.name} | Wolf Supplies`} />
        <meta name="twitter:description" content={selectedCategory?.description || `Shop ${selectedCategory?.name} at Wolf Supplies.`} />
      </Helmet>
      <div className="min-h-screen bg-white">
      {/* Category Banner */}
      <div className="relative h-80 md:h-96 overflow-hidden bg-gradient-to-br from-gray-700 to-grey-700">
        {selectedCategory.image && (
          <img
            src={selectedCategory.image}
            alt={selectedCategory.name}
            className="w-full h-full object-cover opacity-80"
          />
        )}
        <div className={`absolute inset-0 bg-gradient-to-br ${selectedCategory.color || 'from-gray-700/70 to-grey-700/70'}`}></div>

        <div className="absolute inset-0 flex flex-col justify-center">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="text-white">
              <div className="text-6xl md:text-7xl mb-6">{selectedCategory.icon}</div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{selectedCategory.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/categories')}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 font-semibold transition duration-300 transform hover:-translate-x-1"
          >
            <i className="fas fa-arrow-left"></i> Back to Categories
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* CASE 1: If subcategories exist - Show ONLY subcategories */}
          {subcategories.length > 0 ? (
            <div className="mb-16">
              <div className="mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                  {selectedCategory.parent ? 'Sub-Subcategories' : 'Subcategories'}
                </h2>
                <p className="text-gray-600 text-lg">Browse all {selectedCategory.parent ? 'sub-subcategories' : 'subcategories'} under <span className="font-semibold text-gray-400">{selectedCategory.name}</span></p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {subcategories.map((subcat) => (
                  <CategoryCard key={subcat._id} category={subcat} />
                ))}
              </div>
            </div>
          ) : // CASE 2: No subcategories - Show products if they exist
            filteredProducts.length > 0 ? (
              <div>
                <div className="mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                    {selectedCategory.level === 'main'
                      ? `All ${selectedCategory.name} Products`
                      : `${selectedCategory.name} Products`}
                  </h2>
                  <p className="text-gray-600 text-lg">Showing <span className="font-semibold text-gray-400">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="grid lg:grid-cols-6 gap-10">
                  {/* Sidebar */}
                  <div className="lg:col-span-2">
                    <div className="sticky top-32">
                      <ProductFilter
                        filters={filters}
                        maxPrice={maxPriceFromProducts}
                        onFilterChange={(newFilters) => dispatch(setFilter(newFilters))}
                      />
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="lg:col-span-4">
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // CASE 3: No subcategories AND no products - Show Nothing Found
              <div className="text-center py-24 bg-white rounded-2xl shadow-lg">
                <div className="text-6xl mb-6">📭</div>
                <p className="text-2xl text-gray-600 font-semibold mb-2">Nothing Found</p>
                <p className="text-gray-900 text-lg mb-8">This category has no subcategories or products yet</p>
                <button
                  onClick={() => navigate('/categories')}
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 font-semibold transition duration-300"
                >
                  <i className="fas fa-arrow-left"></i> Back to Categories
                </button>
              </div>
            )}
        </div>
      </div>

      {/* Category Description Section */}
      <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700 text-lg leading-relaxed">{selectedCategory.description}</p>
          </div>
        </div>
      </div>

      {/* Related Categories Section */}
      {selectedCategory.level === 'main' && (
        <div className="bg-white py-16 px-4 sm:px-6 lg:px-8 mt-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Explore More Categories</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories
                .filter((cat) => cat.level === 'main' && cat._id !== selectedCategory._id)
                .slice(0, 4)
                .map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => navigate(`/category/${cat.slug}`)}
                    className={`bg-gradient-to-br ${cat.color} rounded-xl p-6 text-white text-center hover:shadow-lg transition duration-300 transform hover:scale-105`}
                  >
                    <div className="text-4xl mb-2">{cat.icon}</div>
                    <p className="font-bold text-lg">{cat.name}</p>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default CategoryDetailPage;

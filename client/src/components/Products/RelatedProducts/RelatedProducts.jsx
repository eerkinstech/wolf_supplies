'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from "react-router-dom";
import ProductCard from '../ProductCard/ProductCard';

const API = import.meta.env.VITE_API_URL || '';

const getCategoryValue = (category) => {
  if (!category) return '';
  if (typeof category === 'string') return category;
  return category.slug || category.name || category._id || category.id || '';
};

const getProductCategories = (product) => {
  const categories = [];
  if (product?.category) categories.push(product.category);
  if (Array.isArray(product?.categories)) categories.push(...product.categories);
  return categories.map(getCategoryValue).filter(Boolean);
};

const RelatedProducts = ({ currentProductId, currentCategory, currentProduct, limit = 5 }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  const categoryCandidates = useMemo(() => {
    const values = [
      currentCategory,
      ...getProductCategories(currentProduct),
    ]
      .map(getCategoryValue)
      .filter(Boolean);

    return [...new Set(values)];
  }, [currentCategory, currentProduct]);

  const primaryCategory = categoryCandidates[0] || '';

  useEffect(() => {
    let cancelled = false;

    const fetchRelatedProducts = async () => {
      if (categoryCandidates.length === 0) {
        setProducts([]);
        return;
      }

      try {
        for (const category of categoryCandidates) {
          const params = new URLSearchParams({
            category,
            limit: String(limit + 1),
          });
          const response = await fetch(`${API}/api/products?${params.toString()}`);
          if (!response.ok) continue;

          const data = await response.json();
          const nextProducts = Array.isArray(data) ? data : data?.products || [];

          if (nextProducts.length > 0) {
            if (!cancelled) setProducts(nextProducts);
            return;
          }
        }

        if (!cancelled) setProducts([]);
      } catch {
        if (!cancelled) setProducts([]);
      }
    };

    fetchRelatedProducts();

    return () => {
      cancelled = true;
    };
  }, [categoryCandidates, limit]);

  const relatedProducts = useMemo(() => {
    const normalizedCategories = new Set(categoryCandidates.map((category) => category.toLowerCase()));

    return (Array.isArray(products) ? products : [])
      .filter((product) => {
        if (String(product._id || product.id) === String(currentProductId)) return false;
        if (product.isDraft) return false;

        return getProductCategories(product).some((category) =>
          normalizedCategories.has(String(category).toLowerCase())
        );
      })
      .slice(0, limit);
  }, [products, categoryCandidates, currentProductId, limit]);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-20 py-12 bg-white rounded-3xl p-8 md:p-12">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: 'var(--color-accent-primary)' }}></div>
          <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>More Products</h2>
        </div>
        <h3 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Related Products
        </h3>
        <p className="text-xl" style={{ color: 'var(--color-text-light)' }}>
          You might also like these {primaryCategory} items
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {relatedProducts.map((product) => (
          <div key={product._id} className="h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={() => navigate(`/products?category=${encodeURIComponent(primaryCategory)}`)}
          className="inline-flex items-center gap-3 text-white px-10 py-4 rounded-xl font-bold text-lg transition duration-300 transform hover:scale-105 shadow-lg"
          style={{
            backgroundColor: 'var(--color-accent-primary)',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-accent-light)')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-accent-primary)')}
        >
          View All {primaryCategory} Products
          <i className="fas fa-chevron-right text-sm"></i>
        </button>
      </div>
    </div>
  );
};

export default RelatedProducts;

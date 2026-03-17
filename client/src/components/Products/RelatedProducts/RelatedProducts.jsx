'use client';

import React, { useMemo } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';
import ProductCard from '../ProductCard/ProductCard';


const RelatedProducts = ({ currentProductId, currentCategory }) => {
  const navigate = useNavigate();
  const { products } = useSelector((state) => state.product);
  const limit = 5; // Number of related products to display

  // Filter related products from same category, excluding current product
  const relatedProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          product.category === currentCategory &&
          product._id !== currentProductId
      )
      .slice(0, limit);
  }, [products, currentCategory, currentProductId, limit]);

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
          You might also like these {currentCategory} items
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
          onClick={() => navigate(`/products?category=${currentCategory}`)}
          className="inline-flex items-center gap-3 text-white px-10 py-4 rounded-xl font-bold text-lg transition duration-300 transform hover:scale-105 shadow-lg"
          style={{
            backgroundColor: 'var(--color-accent-primary)',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-accent-light)')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-accent-primary)')}
        >
          View All {currentCategory} Products
          <i className="fas fa-chevron-right text-sm"></i>
        </button>
      </div>
    </div>
  );
};

export default RelatedProducts;

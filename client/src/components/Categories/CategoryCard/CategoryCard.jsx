'use client';

import React from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';
const getImgSrc = (img) => {
  if (!img) return '';
  if (typeof img !== 'string') return '';
  return img.startsWith('http') ? img : `${API}${img}`;
};

const CategoryCard = ({ category }) => {
  const imageSrc = category?.image || '';
  const categoryIdent = category?.slug || category?._id;

  return (
    <Link
      to={`/category/${categoryIdent}`}
      aria-label={`View category ${category?.name}`}
      className="block"
    >
      <div className="group text-center">
        {/* Circle Icon Container */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4 rounded-full overflow-hidden shadow-md hover:shadow-lg transition duration-300 bg-white border-2 border-gray-300 flex items-center justify-center">
          {imageSrc ? (
            <img
              src={getImgSrc(imageSrc)}
              alt={category?.name || 'Category image'}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="text-6xl md:text-7xl">{category?.icon}</div>
          )}
          {/* Soft overlay */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition duration-300"></div>
        </div>

        {/* Category Name */}
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 group-hover:text-gray-600 transition duration-300">
          {category?.name}
        </h3>

        {/* Product Count */}
        {/* <p className="text-sm md:text-base text-gray-600 font-semibold">
          {category?.productCount ?? 0}+ Products
        </p> */}
      </div>
    </Link>
  );
};

export default CategoryCard;

'use client';

import React from 'react';
import { Link } from 'react-router-dom';


const API = import.meta.env.VITE_API_URL || '';
const getImgSrc = (img) => {
  if (!img) return '';
  if (typeof img !== 'string') return '';
  return img.startsWith('http') ? img : `${API}${img}`;
};

const CategoryList = ({ categories, isSubcategory = false }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${isSubcategory ? 'border-l-4 border-gray-800' : ''}`}>
      <div className={`${isSubcategory ? 'bg-indigo-50' : 'bg-gradient-to-r from-indigo-600 to-indigo-700'} px-6 py-4`}>
        <h3 className={`font-bold text-lg ${isSubcategory ? 'text-indigo-700' : 'text-white'}`}>
          {isSubcategory ? 'Subcategories' : 'Categories'}
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {categories.length > 0 ? (
          categories.map((category) => (
            <Link
              key={category._id}
              to={`/category/${category.slug || category._id}`}
              className="block px-6 py-4 hover:bg-indigo-50 transition duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {category.image ? (
                    <img src={getImgSrc(category.image)} alt={category.name} className="w-10 h-10 object-cover rounded-full" />
                  ) : (
                    <span className="text-2xl">{category.icon}</span>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 group-hover:text-gray-700 transition duration-300">
                      {category.name}
                    </p>
                    <p className="text-xs text-gray-900">{category.description}</p>
                  </div>
                </div>
                <i className="fas fa-chevron-right text-gray-400 group-hover:text-gray-700 transition duration-300 transform group-hover:translate-x-1"></i>
              </div>
            </Link>
          ))
        ) : (
          <div className="px-6 py-8 text-center text-gray-900">
            No categories available
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;

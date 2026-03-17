'use client';

import React, { useState } from 'react';


const ProductFilter = ({ filters, onFilterChange, maxPrice = 100 }) => {
  const [availabilityOpen, setAvailabilityOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  const handleAvailabilityChange = (status) => {
    const newAvailability = filters.availability || [];
    if (newAvailability.includes(status)) {
      onFilterChange({
        availability: newAvailability.filter((s) => s !== status),
      });
    } else {
      onFilterChange({
        availability: [...newAvailability, status],
      });
    }
  };

  const handlePriceChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    const currentPrice = filters.price || { min: 0, max: maxPrice };
    onFilterChange({
      price: {
        ...currentPrice,
        [field]: numValue,
      },
    });
  };

  const currentPrice = filters.price || { min: 0, max: maxPrice };
  const availability = filters.availability || [];

  // Use the actual maxPrice from products, but keep the filter value if user set a custom max
  const displayMaxPrice = currentPrice.max === 10000 || currentPrice.max === 0 ? maxPrice : currentPrice.max;

  return (
    <div className="bg-white rounded-lg p-6 space-y-0">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">FILTERS</h2>

      {/* Availability Filter */}
      <div className="border-b border-gray-300">
        <button
          onClick={() => setAvailabilityOpen(!availabilityOpen)}
          className="w-full flex items-center justify-between py-4 hover:bg-gray-50 transition"
        >
          <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
          {availabilityOpen ? <i className="fas fa-chevron-up text-gray-600"></i> : <i className="fas fa-chevron-down text-gray-600"></i>}
        </button>

        {availabilityOpen && (
          <div className="pb-4 space-y-3">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={availability.includes('in_stock')}
                onChange={() => handleAvailabilityChange('in_stock')}
                className="w-5 h-5 rounded border-2 border-gray-400 cursor-pointer transition"
              />
              <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition">In stock</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={availability.includes('out_of_stock')}
                onChange={() => handleAvailabilityChange('out_of_stock')}
                className="w-5 h-5 rounded border-2 border-gray-400 cursor-pointer transition"
              />
              <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition">Out of stock</span>
            </label>
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="border-b border-gray-300">
        <button
          onClick={() => setPriceOpen(!priceOpen)}
          className="w-full flex items-center justify-between py-4 hover:bg-gray-50 transition"
        >
          <h3 className="text-lg font-semibold text-gray-900">Price</h3>
          {priceOpen ? <i className="fas fa-chevron-up text-gray-600"></i> : <i className="fas fa-chevron-down text-gray-600"></i>}
        </button>

        {priceOpen && (
          <div className="pb-4 space-y-4">
            {/* Price Range Inputs */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded px-3 py-2">
                <span className="text-gray-600 font-semibold">£</span>
                <input
                  type="number"
                  value={currentPrice.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  placeholder="0"
                  className="bg-gray-100 w-20 outline-none text-gray-900 font-semibold text-center"
                />
              </div>
              <span className="text-gray-600 font-semibold">to</span>
              <div className="flex items-center bg-gray-100 rounded px-3 py-2">
                <span className="text-gray-600 font-semibold">£</span>
                <input
                  type="number"
                  value={displayMaxPrice}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  max={maxPrice}
                  className="bg-gray-100 w-20 outline-none text-gray-900 font-semibold text-center"
                />
              </div>
            </div>

            {/* Max Price Info */}
            <p className="text-sm text-gray-600">The highest price is £{maxPrice.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilter;

import React from 'react';


const CategoryFilter = ({ searchQuery, onSearchChange, onClearSearch }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div className="relative">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"></i>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-800 transition duration-300 text-gray-700 font-medium"
            />
          </div>
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="bg-black hover:bg-gray-900 text-white p-3 rounded-lg transition duration-300 transform hover:scale-105"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;

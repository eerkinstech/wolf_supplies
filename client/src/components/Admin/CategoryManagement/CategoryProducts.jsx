'use client';

import React, { useState } from 'react';


const CategoryProducts = ({ categoryId, categoryName, categoryImage, productCount, onClose, onEditProduct }) => {
  // Mock products data - in a real app, fetch from API based on categoryId
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Samsung Galaxy S24',
      sku: 'SAM-S24-BLK',
      price: 799.99,
      comparePrice: 999.99,
      stock: 45,
      image: null,
      rating: 4.5,
      reviews: 128,
      categoryId: 1,
      status: 'active',
      description: 'Latest flagship smartphone with advanced features',
    },
    {
      id: 2,
      name: 'iPhone 15 Pro',
      sku: 'APP-IP15-SLV',
      price: 1099.99,
      comparePrice: 1199.99,
      stock: 32,
      image: null,
      rating: 4.8,
      reviews: 256,
      categoryId: 1,
      status: 'active',
      description: 'Premium Apple smartphone',
    },
    {
      id: 3,
      name: 'Google Pixel 8',
      sku: 'GOO-PIX8-BLU',
      price: 699.99,
      comparePrice: 899.99,
      stock: 28,
      image: null,
      rating: 4.3,
      reviews: 89,
      categoryId: 1,
      status: 'active',
      description: 'Google flagship with AI features',
    },
    {
      id: 4,
      name: 'OnePlus 12',
      sku: 'ONE-12-GRN',
      price: 649.99,
      comparePrice: 799.99,
      stock: 15,
      image: null,
      rating: 4.2,
      reviews: 67,
      categoryId: 1,
      status: 'low_stock',
      description: 'Fast and smooth performance',
    },
  ].filter(p => p.categoryId === categoryId));

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Filter products based on search
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'stock':
        return b.stock - a.stock;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
      alert('Product deleted successfully');
    }
  };

  const getStockStatus = (stock) => {
    if (stock > 50) return { label: 'In Stock', color: 'bg-gray-100 text-gray-800' };
    if (stock > 0) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
  };

  const getStatusBadge = (status) => {
    if (status === 'active') return 'bg-gray-100 text-gray-800';
    if (status === 'low_stock') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 transition duration-300 p-2 hover:bg-gray-200 rounded-lg"
              title="Back"
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </button>

            <div className="flex items-center gap-3">
              {categoryImage ? (
                <img src={categoryImage} alt={categoryName} className="w-12 h-12 object-cover rounded-lg border-2 border-indigo-300" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {categoryName.charAt(0)}
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-gray-900">{categoryName}</h2>
                <p className="text-sm text-gray-600">{sortedProducts.length} of {productCount} products</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-900 hover:text-gray-700 transition duration-300 p-2 hover:bg-gray-200 rounded-lg"
            title="Close"
          >
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-b border-gray-200 bg-gray-50">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition duration-300"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition duration-300"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
            <option value="rating">Sort by Rating</option>
          </select>

          {/* Results */}
          <div className="text-sm text-gray-600 font-semibold">
            Showing <span className="text-gray-700">{sortedProducts.length}</span> products
          </div>
        </div>

        {/* Products List */}
        <div className="overflow-y-auto flex-1 p-6">
          {sortedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <i className="fas fa-box text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-900 text-lg">
                {searchTerm ? 'No products found matching your search' : 'No products in this category'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-gray-300 hover:border-indigo-400 hover:shadow-lg transition duration-300 overflow-hidden"
                  >
                    <div className="flex gap-4 p-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-black-300 rounded-lg flex items-center justify-center text-gray-900">
                            <i className="fas fa-image text-2xl"></i>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                            <p className="text-xs text-gray-900 mt-1">SKU: <span className="font-mono">{product.sku}</span></p>
                            <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(product.status)}`}>
                            {product.status === 'active' ? 'Active' : 'Low Stock'}
                          </span>
                        </div>

                        {/* Rating */}
                        {product.rating && (
                          <div className="flex items-center gap-2 mt-3">
                            <i className="fas fa-star text-yellow-400"></i>
                            <span className="font-semibold text-gray-900">{product.rating}</span>
                            <span className="text-sm text-gray-600">({product.numReviews || product.reviews?.length || product.reviews} reviews)</span>
                          </div>
                        )}

                        {/* Stats Row */}
                        <div className="flex items-center gap-6 mt-4">
                          {/* Price */}
                          <div>
                            <p className="text-xs text-gray-600 uppercase font-semibold">Price</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-lg font-bold text-gray-700">£{product.price.toFixed(2)}</span>
                              {product.comparePrice && (
                                <span className="text-sm text-gray-900 line-through">£{product.comparePrice.toFixed(2)}</span>
                              )}
                            </div>
                          </div>

                          {/* Stock */}
                          <div>
                            <p className="text-xs text-gray-600 uppercase font-semibold">Stock</p>
                            <div className="mt-1">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${stockStatus.color}`}>
                                {product.stock} units
                              </span>
                            </div>
                          </div>

                          {/* Save */}
                          <div>
                            <p className="text-xs text-gray-600 uppercase font-semibold">Savings</p>
                            {product.comparePrice ? (
                              <p className="text-lg font-bold text-gray-400 mt-1">
                                £{(product.comparePrice - product.price).toFixed(2)}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-900 mt-1">—</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 justify-center">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="bg-gray-800 hover:bg-black text-white p-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => onEditProduct && onEditProduct(product)}
                          className="bg-gray-800 hover:bg-black text-white p-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                          title="Edit Product"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                          title="Delete Product"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
          >
            Close
          </button>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <h3 className="text-xl font-bold text-gray-900">Product Details</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-900 hover:text-gray-700 transition duration-300 p-1 hover:bg-gray-200 rounded-lg"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Product Name</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{selectedProduct.name}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">SKU</p>
                <p className="text-sm font-mono text-gray-700 mt-1">{selectedProduct.sku}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Description</p>
                <p className="text-sm text-gray-700 mt-1">{selectedProduct.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Price</p>
                  <p className="text-lg font-bold text-gray-700 mt-1">£{selectedProduct.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Stock</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{selectedProduct.stock}</p>
                </div>
              </div>

              {selectedProduct.comparePrice && (
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Compare Price</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">£{selectedProduct.comparePrice.toFixed(2)}</p>
                </div>
              )}

              {selectedProduct.rating && (
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Rating</p>
                  <div className="flex items-center gap-2 mt-1">
                    <i className="fas fa-star text-yellow-400"></i>
                    <span className="text-lg font-bold text-gray-900">{selectedProduct.rating}</span>
                    <span className="text-sm text-gray-600">({selectedProduct.numReviews || selectedProduct.reviews?.length || selectedProduct.reviews} reviews)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2.5 border border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryProducts;

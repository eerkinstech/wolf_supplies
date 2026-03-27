'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../../redux/slices/productSlice';

const API = import.meta.env.VITE_API_URL || '';

const Inventory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products = [], loading } = useSelector((state) => state.product);
    const [localProducts, setLocalProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [failedImages, setFailedImages] = useState(new Set());
    const [updatingFields, setUpdatingFields] = useState(new Set());
    const [editingVariants, setEditingVariants] = useState({}); // Store edits: {productId: {variantIndex: {price, stock}}}
    const [baseStockEdits, setBaseStockEdits] = useState({}); // Store base stock edits

    // Sync products from Redux
    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    useEffect(() => {
        setLocalProducts(products || []);
    }, [products]);

    const visibleProducts = (localProducts || []).filter(p => {
        const matchesSearch = searchQuery.trim() === '' ||
            (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    // Helper to toggle variant expansion
    const toggleVariantExpand = (productId) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(productId)) {
            newExpanded.delete(productId);
        } else {
            newExpanded.add(productId);
        }
        setExpandedRows(newExpanded);
    };

    // Helper to check if product has variants
    const hasVariants = (product) => {
        return product.variantCombinations && product.variantCombinations.length > 0;
    };

    // Helper to get total variant stock
    const getTotalVariantStock = (product) => {
        if (!product.variantCombinations || product.variantCombinations.length === 0) {
            return product.stock || 0;
        }
        return product.variantCombinations.reduce((sum, v) => sum + (v.stock || 0), 0);
    };

    // Helper to get lowest variant price or regular price
    const getLowestPrice = (product) => {
        if (!product.variantCombinations || product.variantCombinations.length === 0) {
            return product.price || 0;
        }
        const variantPrices = product.variantCombinations.map(v => v.price || product.price);
        return Math.min(...variantPrices);
    };

    // Helper to format variant values display
    const formatVariantValues = (variantValues) => {
        if (!variantValues) return '';
        return Object.entries(variantValues)
            .map(([key, value]) => `${key}: ${value}`)
            .join(' | ');
    };

    // Handle variant stock update
    const handleVariantStockUpdate = async (productId, variantIndex, newStock) => {
        const fieldKey = `${productId}-stock-${variantIndex}`;

        try {
            setUpdatingFields(prev => new Set([...prev, fieldKey]));
            const token = localStorage.getItem('token');
            const product = products.find(p => p._id === productId);
            if (!product) {
                toast.error('Product not found');
                return;
            }

            // Create a proper copy of variants with the update
            const updatedVariants = product.variantCombinations.map((v, idx) =>
                idx === variantIndex
                    ? { ...v, stock: parseInt(newStock) || 0 }
                    : v
            );

            const response = await fetch(`${API}/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ variantCombinations: updatedVariants }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update stock');
            }

            const updatedProduct = await response.json();
            console.log('[Inventory] Stock update response:', updatedProduct);
            
            // Update local state with the response instead of full refetch
            setLocalProducts(prev => prev.map(p => p._id === productId ? updatedProduct : p));
            
            toast.success('Stock updated successfully');
            // Clear editing state
            setEditingVariants(prev => {
                const newState = { ...prev };
                if (newState[productId]) {
                    if (newState[productId][variantIndex]) {
                        delete newState[productId][variantIndex].stock;
                    }
                }
                return newState;
            });
        } catch (error) {
            console.error('[Inventory] Stock update error:', error);
            toast.error(error.message || 'Failed to update stock');
        } finally {
            setUpdatingFields(prev => {
                const newSet = new Set(prev);
                newSet.delete(fieldKey);
                return newSet;
            });
        }
    };

    // Handle variant price update
    const handleVariantPriceUpdate = async (productId, variantIndex, newPrice) => {
        const fieldKey = `${productId}-price-${variantIndex}`;

        try {
            setUpdatingFields(prev => new Set([...prev, fieldKey]));
            const token = localStorage.getItem('token');
            const product = products.find(p => p._id === productId);
            if (!product) {
                toast.error('Product not found');
                return;
            }

            // Create a proper copy of variants with the update
            const updatedVariants = product.variantCombinations.map((v, idx) =>
                idx === variantIndex
                    ? { ...v, price: parseFloat(newPrice) || 0 }
                    : v
            );

            const response = await fetch(`${API}/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ variantCombinations: updatedVariants }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update price');
            }

            const updatedProduct = await response.json();
            console.log('[Inventory] Price update response:', updatedProduct);
            
            // Update local state with the response instead of full refetch
            setLocalProducts(prev => prev.map(p => p._id === productId ? updatedProduct : p));
            
            toast.success('Price updated successfully');
            // Clear editing state
            setEditingVariants(prev => {
                const newState = { ...prev };
                if (newState[productId]) {
                    if (newState[productId][variantIndex]) {
                        delete newState[productId][variantIndex].price;
                    }
                }
                return newState;
            });
        } catch (error) {
            console.error('[Inventory] Price update error:', error);
            toast.error(error.message || 'Failed to update price');
        } finally {
            setUpdatingFields(prev => {
                const newSet = new Set(prev);
                newSet.delete(fieldKey);
                return newSet;
            });
        }
    };

    // Handle product base stock update
    const handleProductStockUpdate = async (productId, newStock) => {
        const fieldKey = `${productId}-base-stock`;

        try {
            setUpdatingFields(prev => new Set([...prev, fieldKey]));
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ stock: parseInt(newStock) || 0 }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update stock');
            }

            const updatedProduct = await response.json();
            console.log('[Inventory] Product stock update response:', updatedProduct);
            
            // Update local state with the response instead of full refetch
            setLocalProducts(prev => prev.map(p => p._id === productId ? updatedProduct : p));
            
            toast.success('Stock updated successfully');
            // Clear editing state
            setBaseStockEdits(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });
        } catch (error) {
            console.error('[Inventory] Product stock update error:', error);
            toast.error(error.message || 'Failed to update stock');
        } finally {
            setUpdatingFields(prev => {
                const newSet = new Set(prev);
                newSet.delete(fieldKey);
                return newSet;
            });
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className='grid grid-cols-2'>
                <div className="">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Inventory Management</h1>
                    <p className="text-gray-600">Manage product stock and variant pricing</p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <i className="fas fa-search text-sm"></i>
                        </div>
                        <input
                            type="text"
                            placeholder="Search products by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                                aria-label="Clear search"
                            >
                                <i className="fas fa-times text-sm"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <i className="fas fa-spinner animate-spin text-4xl text-gray-700"></i>
                </div>
            )}

            {/* Inventory Table */}
            {!loading && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-10"></th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product Name</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">SKU</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Price</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Stock</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Variants</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {visibleProducts && visibleProducts.length > 0 ? (
                                visibleProducts.map((product) => {
                                    const rawImg = product.images && product.images.length > 0 ? product.images[0] : (product.image || '');
                                    const imgSrc = rawImg ? (rawImg.startsWith('http') ? rawImg : `${API}${rawImg}`) : null;
                                    const isExpanded = expandedRows.has(product._id);

                                    return (
                                        <React.Fragment key={product._id}>
                                            {/* Main Product Row */}
                                            <tr className="hover:bg-gray-50 transition duration-300">
                                                <td className="px-6 py-4 text-center">
                                                    {hasVariants(product) && (
                                                        <button
                                                            onClick={() => toggleVariantExpand(product._id)}
                                                            className="text-gray-600 hover:text-gray-900 transition"
                                                            title={isExpanded ? 'Collapse variants' : 'Expand variants'}
                                                        >
                                                            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                                                    <div className="flex items-center">
                                                        {imgSrc && !failedImages.has(product._id) ? (
                                                            <img
                                                                src={imgSrc}
                                                                alt={product.name}
                                                                loading="lazy"
                                                                className="w-10 h-10 rounded-md object-cover mr-3"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    setFailedImages(prev => new Set([...prev, product._id]));
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 bg-gray-200 rounded-md mr-3 flex items-center justify-center text-xs text-gray-600 font-semibold">
                                                                No Image
                                                            </div>
                                                        )}
                                                        <span>{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {product.sku || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm text-gray-900 font-semibold">
                                                    {hasVariants(product) ? (
                                                        <div>
                                                            <div>From £{getLowestPrice(product).toFixed(2)}</div>
                                                        </div>
                                                    ) : (
                                                        `£${product.price?.toFixed(2) || '0.00'}`
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {hasVariants(product) ? (
                                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTotalVariantStock(product) > 0
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {getTotalVariantStock(product)}
                                                            </span>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                {(() => {
                                                                    const fieldKey = `${product._id}-base-stock`;
                                                                    const isSaving = updatingFields.has(fieldKey);
                                                                    const displayValue = baseStockEdits[product._id] !== undefined ? baseStockEdits[product._id] : (product.stock || 0);
                                                                    const hasChanged = displayValue !== (product.stock || 0);

                                                                    return (
                                                                        <>
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                value={displayValue}
                                                                                disabled={isSaving}
                                                                                onChange={(e) => {
                                                                                    setBaseStockEdits(prev => ({
                                                                                        ...prev,
                                                                                        [product._id]: e.target.value
                                                                                    }));
                                                                                }}
                                                                                className={`w-20 px-2 py-1 border rounded text-sm text-center outline-none transition ${isSaving
                                                                                    ? 'bg-blue-50 border-blue-300 cursor-not-allowed'
                                                                                    : hasChanged
                                                                                        ? 'border-orange-400 bg-orange-50 hover:border-orange-500 focus:ring-2 focus:ring-orange-400 focus:border-transparent'
                                                                                        : 'border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-gray-800 focus:border-transparent'
                                                                                    }`}
                                                                            />
                                                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${(parseInt(displayValue) || 0) > 0
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : 'bg-red-100 text-red-800'
                                                                                }`}>
                                                                                {displayValue}
                                                                            </span>
                                                                            {isSaving && <i className="fas fa-spinner animate-spin text-xs text-[var(--color-accent-primary)]"></i>}
                                                                            {hasChanged && !isSaving && (
                                                                                <button
                                                                                    onClick={() => handleProductStockUpdate(product._id, displayValue)}
                                                                                    className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition"
                                                                                    title="Save stock"
                                                                                >
                                                                                    <i className="fas fa-check"></i>
                                                                                </button>
                                                                            )}
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm font-semibold">
                                                    {hasVariants(product) ? (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                                                            {product.variantCombinations.length} variants
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center space-x-3">
                                                    <button
                                                        onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                                        className="text-gray-700 hover:text-gray-900 transition"
                                                        title="Edit product"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Variant Rows - Expandable */}
                                            {isExpanded && hasVariants(product) && (
                                                <>
                                                    <tr className="bg-blue-50 border-b">
                                                        <td className="px-6 py-3"></td>
                                                        <td colSpan="6" className="px-6 py-3">
                                                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                                <table className="w-full text-sm">
                                                                    <thead className="bg-gray-100 border-b">
                                                                        <tr>
                                                                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Variant Details</th>
                                                                            <th className="px-4 py-2 text-left font-semibold text-gray-700">SKU</th>
                                                                            <th className="px-4 py-2 text-center font-semibold text-gray-700">Price</th>
                                                                            <th className="px-4 py-2 text-center font-semibold text-gray-700">Stock</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y">
                                                                        {product.variantCombinations.map((variant, index) => {
                                                                            const priceFieldKey = `${product._id}-price-${index}`;
                                                                            const stockFieldKey = `${product._id}-stock-${index}`;
                                                                            const isSavingPrice = updatingFields.has(priceFieldKey);
                                                                            const isSavingStock = updatingFields.has(stockFieldKey);
                                                                            const variantEdits = editingVariants[product._id]?.[index] || {};
                                                                            const displayPrice = variantEdits.price !== undefined ? variantEdits.price : variant.price || 0;
                                                                            const displayStock = variantEdits.stock !== undefined ? variantEdits.stock : variant.stock || 0;

                                                                            return (
                                                                                <tr key={`${product._id}-variant-${index}`} className="hover:bg-gray-50 transition">
                                                                                    <td className="px-4 py-3 text-gray-900">
                                                                                        {formatVariantValues(variant.variantValues)}
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-gray-900">
                                                                                        {variant.sku || '-'}
                                                                                    </td>
                                                                                    <td className="px-4 py-3">
                                                                                        <div className="flex items-center justify-center gap-2">
                                                                                            <span className="text-gray-600">£</span>
                                                                                            <input
                                                                                                type="number"
                                                                                                step="0.01"
                                                                                                min="0"
                                                                                                value={displayPrice}
                                                                                                disabled={isSavingPrice}
                                                                                                onChange={(e) => {
                                                                                                    setEditingVariants(prev => {
                                                                                                        const newState = JSON.parse(JSON.stringify(prev));
                                                                                                        if (!newState[product._id]) newState[product._id] = {};
                                                                                                        if (!newState[product._id][index]) newState[product._id][index] = {};
                                                                                                        newState[product._id][index].price = e.target.value;
                                                                                                        return newState;
                                                                                                    });
                                                                                                }}
                                                                                                onBlur={(e) => {
                                                                                                    const value = e.target.value;
                                                                                                    if (value !== '' && value !== String(variant.price || 0)) {
                                                                                                        handleVariantPriceUpdate(product._id, index, value);
                                                                                                    }
                                                                                                }}
                                                                                                className={`w-24 px-2 py-1 border rounded text-sm text-right outline-none transition ${isSavingPrice
                                                                                                    ? 'bg-blue-50 border-blue-300 cursor-not-allowed'
                                                                                                    : (displayPrice !== (variant.price || 0))
                                                                                                        ? 'border-orange-400 bg-orange-50 hover:border-orange-500 focus:ring-2 focus:ring-orange-400 focus:border-transparent'
                                                                                                        : 'border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-gray-800 focus:border-transparent'
                                                                                                    }`}
                                                                                            />
                                                                                            {isSavingPrice && <i className="fas fa-spinner animate-spin text-xs text-[var(--color-accent-primary)]"></i>}
                                                                                            {(displayPrice !== (variant.price || 0)) && !isSavingPrice && (
                                                                                                <button
                                                                                                    onClick={() => handleVariantPriceUpdate(product._id, index, displayPrice)}
                                                                                                    className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition"
                                                                                                    title="Save price"
                                                                                                >
                                                                                                    <i className="fas fa-check"></i>
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="px-4 py-3">
                                                                                        <div className="flex items-center justify-center gap-2">
                                                                                            <input
                                                                                                type="number"
                                                                                                min="0"
                                                                                                value={displayStock}
                                                                                                disabled={isSavingStock}
                                                                                                onChange={(e) => {
                                                                                                    setEditingVariants(prev => {
                                                                                                        const newState = JSON.parse(JSON.stringify(prev));
                                                                                                        if (!newState[product._id]) newState[product._id] = {};
                                                                                                        if (!newState[product._id][index]) newState[product._id][index] = {};
                                                                                                        newState[product._id][index].stock = e.target.value;
                                                                                                        return newState;
                                                                                                    });
                                                                                                }}
                                                                                                onBlur={(e) => {
                                                                                                    const value = e.target.value;
                                                                                                    if (value !== '' && value !== String(variant.stock || 0)) {
                                                                                                        handleVariantStockUpdate(product._id, index, value);
                                                                                                    }
                                                                                                }}
                                                                                                className={`w-20 px-2 py-1 border rounded text-sm text-center outline-none transition ${isSavingStock
                                                                                                    ? 'bg-blue-50 border-blue-300 cursor-not-allowed'
                                                                                                    : (displayStock !== (variant.stock || 0))
                                                                                                        ? 'border-orange-400 bg-orange-50 hover:border-orange-500 focus:ring-2 focus:ring-orange-400 focus:border-transparent'
                                                                                                        : 'border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-gray-800 focus:border-transparent'
                                                                                                    }`}
                                                                                            />
                                                                                            {isSavingStock && <i className="fas fa-spinner animate-spin text-xs text-[var(--color-accent-primary)]"></i>}
                                                                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${(parseInt(displayStock) || 0) > 0
                                                                                                ? 'bg-green-100 text-green-800'
                                                                                                : 'bg-red-100 text-red-800'
                                                                                                }`}>
                                                                                                {displayStock}
                                                                                            </span>
                                                                                            {(displayStock !== (variant.stock || 0)) && !isSavingStock && (
                                                                                                <button
                                                                                                    onClick={() => handleVariantStockUpdate(product._id, index, displayStock)}
                                                                                                    className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition"
                                                                                                    title="Save stock"
                                                                                                >
                                                                                                    <i className="fas fa-check"></i>
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-600">
                                        No products found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Inventory;

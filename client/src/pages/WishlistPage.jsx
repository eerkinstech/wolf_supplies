'use client';

// Backup of existing WishlistPage.jsx

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { removeFromWishlist, addToWishlist, fetchWishlist, addItemToServer, removeItemFromServer, clearWishlistServer } from '../redux/slices/wishlistSlice';
import { addToCart, syncCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';
import ProductCard from '../components/Products/ProductCard/ProductCard';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const [sortBy, setSortBy] = useState('newest');
  const API = import.meta.env.VITE_API_URL || '';

  const getImgSrc = (img) => {
    if (!img) return '';
    if (typeof img !== 'string') return '';
    return img.startsWith('http') ? img : `${API}${img}`;
  };

  const generateSlug = (str) => {
    return String(str || '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  };

  // Get SEO-friendly slug from item
  const getProductSlug = (item) => {
    if (!item) return '';
    // Try to get slug from various properties
    if (item.slug) return item.slug;
    if (item.product && item.product.slug) return item.product.slug;
    if (item.snapshot && item.snapshot.slug) return item.snapshot.slug;
    // Fallback: generate slug from name
    if (item.name) return generateSlug(item.name);
    return '';
  };

  const cartItemsState = useSelector((state) => state.cart.items);

  const toCartItem = (wishItem) => {
    if (!wishItem) return null;
    // prefer explicit product id from populated product or snapshot
    const rawProductId = (wishItem.product && (wishItem.product._id || wishItem.product)) || wishItem.productId || wishItem.snapshot?.productId || wishItem._id || '';
    const variantId = wishItem.variantId || (wishItem.snapshot && wishItem.snapshot.variantId) || '';
    // normalize product id: if _id contains composite like '<prod>|variant:..' split
    const candidate = typeof rawProductId === 'string' && rawProductId.includes('|') ? rawProductId.split('|')[0] : rawProductId;
    const isObjectId = typeof candidate === 'string' && /^[0-9a-fA-F]{24}$/.test(candidate);
    const productId = isObjectId ? candidate : '';
    const selectedVariants = wishItem.selectedVariants || wishItem.snapshot?.selectedVariants || {};
    if (wishItem.selectedSize) selectedVariants.Size = wishItem.selectedSize;
    if (wishItem.selectedColor) selectedVariants.Color = wishItem.selectedColor;

    const id = variantId ? `${productId || 'unknown'}|variant:${variantId}` : `${productId || 'unknown'}`;

    return {
      _id: id,
      product: productId || undefined,
      name: wishItem.name || (wishItem.product && wishItem.product.name) || '',
      price: Number(wishItem.price ?? wishItem.snapshot?.price ?? (wishItem.product && wishItem.product.price) ?? 0),
      image: wishItem.image || wishItem.snapshot?.image || (wishItem.product && ((wishItem.product.image) || (wishItem.product.images && wishItem.product.images[0]))) || '',
      quantity: 1,
      selectedVariants: selectedVariants || {},
    };
  };

  const computeIsAvailable = (item) => {
    if (!item) return true;
    if (item.__isSnapshot) {
      const prod = item.product || null;
      // If snapshot includes explicit variantId, use it
      if (prod && prod.variantCombinations && item.variantId) {
        const vc = prod.variantCombinations.find((v) => String(v._id || v.id) === String(item.variantId));
        if (vc) return Number(vc.stock || 0) > 0;
      }
      // If snapshot has selectedVariants/selectedSize/selectedColor, attempt to match variant by values
      if (prod && prod.variantCombinations) {
        const merged = { ...(item.selectedVariants || {}) };
        if (item.selectedSize) merged['Size'] = item.selectedSize;
        if (item.selectedColor) merged['Color'] = item.selectedColor;
        for (const vc of prod.variantCombinations) {
          const raw = vc.variantValues || {};
          const normalized = raw instanceof Map ? Object.fromEntries(raw) : raw;
          const keys = Object.keys(normalized);
          let matches = true;
          for (const k of keys) {
            const want = normalized[k];
            const got = merged[k];
            if (want === undefined) continue;
            if (got === undefined || String(got) !== String(want)) { matches = false; break; }
          }
          if (matches) return Number(vc.stock || 0) > 0;
        }
      }
      if (item.inStock !== undefined) return !!item.inStock;
      if (item.stock !== undefined) return Number(item.stock) > 0;
      return true;
    }
    if (item.variantCombinations && item.variantCombinations.length > 0) {
      if (item.stock !== undefined) return Number(item.stock) > 0;
      if (item.inStock !== undefined) return !!item.inStock;
      return true;
    }
    if (item.inStock !== undefined) return !!item.inStock;
    if (item.stock !== undefined) return Number(item.stock) > 0;
    return true;
  };

  // Sort items based on selected criteria
  const getSortedItems = () => {
    let sorted = [...wishlistItems];

    if (sortBy === 'priceLow') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceHigh') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
  };

  const handleRemoveFromWishlist = (itemOrId) => {
    // itemOrId can be string id or the item object
    if (typeof itemOrId === 'string') {
      dispatch(removeItemFromServer(itemOrId)).then(() => {
        toast.success('Removed from wishlist');
      }).catch((err) => {
        toast.error('Failed to remove from wishlist');
      });
    } else if (itemOrId && typeof itemOrId === 'object') {
      // For snapshot items, productId is stored in _id field
      // For regular product items, get from product._id or _id
      let productId = null;
      if (itemOrId.__isSnapshot) {
        // Snapshot item: prefer the explicit productId normalized from the API
        productId = itemOrId.productId || itemOrId._id;
      } else {
        // Regular product item
        productId = itemOrId.productId || itemOrId._id || (itemOrId.product && (itemOrId.product._id || itemOrId.product));
      }

      const variantId = itemOrId.variantId || (itemOrId.snapshot && itemOrId.snapshot.variantId) || null;
      dispatch(removeItemFromServer({
        productId,
        variantId,
        snapshotKey: itemOrId.snapshotKey || null,
        selectedVariants: itemOrId.selectedVariants || {},
        selectedSize: itemOrId.selectedSize || null,
        selectedColor: itemOrId.selectedColor || null,
      })).then(() => {
        toast.success('Removed from wishlist');
      }).catch((err) => {
        toast.error('Failed to remove from wishlist');
      });
    }
  };

  const handleAddToCart = (item) => {
    const isAvailable = computeIsAvailable(item);
    if (!isAvailable) {
      toast.error('This item is out of stock and cannot be added to cart');
      return;
    }
    const cartItem = toCartItem(item);
    if (!cartItem) return;
    dispatch(addToCart(cartItem));
    // Persist updated cart to server for both authenticated AND guest users
    const newCart = [...(cartItemsState || []), cartItem];
    dispatch(syncCart(newCart));
    toast.success('Added to cart');
  };

  const handleMoveAllToCart = () => {
    const availableItems = [];
    const skipped = [];
    for (const item of wishlistItems) {
      const isAvailable = computeIsAvailable(item);
      if (isAvailable) availableItems.push(item);
      else skipped.push(item);
    }

    if (availableItems.length === 0) {
      toast.error('No available items to move to cart');
      return;
    }

    // add available wishlist items to cart (convert to proper cart shape)
    const cartItemsToAdd = [];
    availableItems.forEach((item) => {
      const cartItem = toCartItem(item);
      if (cartItem) {
        cartItemsToAdd.push(cartItem);
        dispatch(addToCart(cartItem));
      }
    });

    // After moving to cart, remove from wishlist and sync to server
    // Persist cart to server for both authenticated AND guest users
    const newCart = [...(cartItemsState || []), ...cartItemsToAdd];
    dispatch(syncCart(newCart));

    // Remove moved items from wishlist by calling removeItemFromServer for each
    availableItems.forEach((item) => {
      const productId = item.productId || item._id || (item.product && (item.product._id || item.product));
      const variantId = item.variantId || null;
      dispatch(removeItemFromServer({
        productId,
        variantId,
        snapshotKey: item.snapshotKey || null,
        selectedVariants: item.selectedVariants || {},
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
      }));
    });

    toast.success(`Moved ${availableItems.length} item(s) to cart${skipped.length ? ` — ${skipped.length} out-of-stock skipped` : ''}`);
  };

  const handleClearWishlist = () => {
    if (wishlistItems.length > 0) {
      const confirmClear = window.confirm(
        'Are you sure you want to clear your entire wishlist?'
      );
      if (confirmClear) {
        dispatch(clearWishlistServer()).then(() => {
          toast.success('Wishlist cleared');
        }).catch((err) => {
          toast.error('Failed to clear wishlist');
        });
      }
    }
  };

  // Load server wishlist when authenticated (ensures freshest data)
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchWishlist());
    }
  }, [dispatch]);

  // Log current wishlist items for debugging
  React.useEffect(() => {
    wishlistItems.forEach((item, idx) => {
    });
  }, [wishlistItems]);

  const sortedItems = getSortedItems();

  return (
    <>
      <Helmet>
        <title>My Wishlist | Wolf Supplies</title>
        <meta name="description" content="View and manage your saved wishlist items at Wolf Supplies. Keep track of products you want to buy." />
        <meta name="keywords" content="wishlist, saved items, favorites, shopping" />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://wolfsupplies.co.uk/wishlist" />
        <meta property="og:title" content="My Wishlist | Wolf Supplies" />
        <meta property="og:description" content="View your saved wishlist items and favorite products." />
        <meta property="og:url" content="https://wolfsupplies.co.uk/wishlist" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="My Wishlist | Wolf Supplies" />
        <meta name="twitter:description" content="View your saved favorite items." />
      </Helmet>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        {/* Header Section */}
        <div className="text-white py-12 md:py-16" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-2 mb-6 hover:opacity-80 w-fit">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
            <div className="flex items-center gap-3">
              <i className="fas fa-heart" style={{ fontSize: '32px' }}></i>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold">My Wishlist</h1>
                <p className="text-xl mt-2">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {wishlistItems.length === 0 ? (
            // Empty State
            <div className="text-center py-16">
              <div className="inline-block">
                <div className="text-8xl mb-6 opacity-50">💔</div>
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Your Wishlist is Empty</h2>
              <p className="text-lg mb-8" style={{ color: 'var(--color-text-light)' }}>
                Start adding products to your wishlist and save them for later!
              </p>
              <Link
                to="/products"
                className="inline-block text-white px-8 py-3 rounded-lg font-bold transition duration-300"
                style={{
                  backgroundColor: 'var(--color-accent-primary)',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-accent-light)')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-accent-primary)')}
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Products Grid */}
              <div className="lg:col-span-3">
                {/* Sort Controls */}
                <div className="rounded-lg shadow-md p-6 mb-8" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          borderColor: 'var(--color-border-light)',
                          borderWidth: '1px',
                          color: 'var(--color-text-primary)',
                        }}
                        onFocus={(e) => (e.target.style.outline = 'none', e.target.style.ringColor = 'var(--color-accent-primary)')}
                      >
                        <option value="newest">Newest</option>
                        <option value="priceLow">Price: Low to High</option>
                        <option value="priceHigh">Price: High to Low</option>
                        <option value="name">Name: A to Z</option>
                      </select>
                    </div>
                    <button
                      onClick={handleClearWishlist}
                      className="font-semibold flex items-center gap-2 transition duration-300"
                      style={{ color: 'var(--color-accent-primary)' }}
                      onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                      onMouseLeave={(e) => (e.target.style.opacity = '1')}
                    >
                      <i className="fas fa-trash"></i> Clear All
                    </button>
                  </div>
                </div>

                {/* Wishlist Items Grid - using ProductCard for consistent product display */}
                <div className="space-y-6">
                  {sortedItems.map((item) => {
                    const available = computeIsAvailable(item);
                    return (
                      <div key={(item.productId || item._id) + (item.variantId ? `-${item.variantId}` : '')} className="relative rounded-lg shadow-md hover:shadow-xl transition duration-300 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
                        {/* If this is a variant snapshot (server or local), render a compact snapshot card */}
                        {item.__isSnapshot ? (
                          <div className="flex items-stretch md:items-start">
                            <div className="w-36 shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-section)' }}>
                              <img
                                src={getImgSrc(item.image) || 'https://via.placeholder.com/300'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/300'; }}
                              />
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <Link to={`/product/${getProductSlug(item)}`} className="hover:underline">
                                    <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{item.name}</h3>
                                  </Link>
                                  <div className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{Object.entries(item.selectedVariants || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>£{(item.price || 0).toFixed(2)}</div>
                                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Variant</div>
                                </div>
                              </div>

                              <div className="mt-4 flex gap-3">
                                {(!computeIsAvailable(item)) && (
                                  <div className="absolute top-3 left-3 text-white px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: 'var(--color-accent-primary)' }}>Out of stock</div>
                                )}
                                {computeIsAvailable(item) ? (
                                  <button
                                    onClick={() => handleAddToCart(item)}
                                    className="py-2 px-4 rounded-lg font-semibold transition duration-300 flex items-center gap-2 text-white"
                                    style={{ backgroundColor: 'var(--color-accent-primary)' }}
                                    onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-accent-light)')}
                                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-accent-primary)')}
                                  >
                                    <i className="fas fa-shopping-cart"></i> Add to Cart
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="py-2 px-4 rounded-lg font-semibold transition duration-300 flex items-center gap-2 text-white cursor-not-allowed"
                                    style={{ backgroundColor: 'var(--color-text-light)', opacity: '0.6' }}
                                  >
                                    Sold Out
                                  </button>
                                )}

                                <button
                                  onClick={() => handleRemoveFromWishlist(item)}
                                  className="py-2 px-4 rounded-lg font-semibold transition duration-300 flex items-center gap-2"
                                  style={{
                                    backgroundColor: 'var(--color-bg-section)',
                                    color: 'var(--color-accent-primary)',
                                    borderColor: 'var(--color-border-light)',
                                    borderWidth: '1px'
                                  }}
                                  onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-border-light)')}
                                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-bg-section)')}
                                >
                                  <i className="fas fa-trash"></i> Remove
                                </button>

                                <Link to={`/product/${getProductSlug(item)}`} className="ml-auto inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2" style={{
                                  borderColor: 'var(--color-border-light)',
                                  borderWidth: '1px',
                                  color: 'var(--color-text-primary)',
                                }}
                                  onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-bg-section)')}
                                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                >
                                  View Product
                                </Link>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <ProductCard product={item} />
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveFromWishlist(item); }}
                              className="absolute top-3 right-3 z-50 p-2 rounded-full shadow transition duration-300"
                              style={{
                                backgroundColor: 'white',
                                color: 'var(--color-accent-primary)',
                              }}
                              onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-bg-section)')}
                              onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                              aria-label={`Remove ${item.name} from wishlist`}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        )}

                        {/* If item is not available, show Sold Out on the action button instead of hiding content */}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Summary */}
              <div className="lg:col-span-1">
                <aside className="rounded-lg shadow-lg p-6 sticky top-24" style={{ backgroundColor: 'var(--color-bg-section)', borderColor: 'var(--color-border-light)', borderWidth: '1px' }}>
                  <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Wishlist Summary</h2>

                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Items</p>
                      <p className="text-3xl font-extrabold" style={{ color: 'var(--color-accent-primary)' }}>{wishlistItems.length}</p>
                    </div>
                    <div className="col-span-1 text-right">
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>&nbsp;</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>&nbsp;</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <button
                      onClick={handleMoveAllToCart}
                      disabled={wishlistItems.filter(computeIsAvailable).length === 0}
                      className="w-full text-white py-3 px-4 rounded-lg font-bold transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ backgroundColor: 'var(--color-accent-primary)' }}
                      onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = 'var(--color-accent-light)')}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-accent-primary)')}
                    >
                      <i className="fas fa-shopping-cart"></i> Move All to Cart
                    </button>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <Link to="/products" className="flex-1 inline-flex items-center bg-white justify-center gap-2 rounded-lg px-3 py-2" style={{
                      borderColor: 'var(--color-border-light)',
                      borderWidth: '1px',
                      color: 'var(--color-text-primary)',
                    }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-bg-secondary)')}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                    >
                      Continue Shopping
                    </Link>

                  </div>

                </aside>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WishlistPage;

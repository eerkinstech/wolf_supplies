'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchProductById, fetchProductBySlug } from '../redux/slices/productSlice';
import useMetaTags from '../hooks/useMetaTags';
import useURLRedirect from '../hooks/useURLRedirect';
import { addToCart, syncCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist, addItemToServer, removeItemFromServer } from '../redux/slices/wishlistSlice';
import toast from 'react-hot-toast';
import RelatedProducts from '../components/Products/RelatedProducts/RelatedProducts';
import Reviews from '../components/Products/Reviews/Reviews';
import { useAuth } from '../context/AuthContext';
import './ProductDetailPage.css';
import { Link } from 'react-router-dom';

const ProductDetailPage = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading } = useSelector((state) => state.product);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  // Track the last variant/product the user saved locally (for optimistic UI)
  const [savedVariantId, setSavedVariantId] = useState(null);
  const [savedProductFlag, setSavedProductFlag] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  // Gallery & review state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);
  const THUMB_VISIBLE = 7;
  const thumbContainerRef = useRef(null);
  const [showThumbLeftShadow, setShowThumbLeftShadow] = useState(false);
  const [showThumbRightShadow, setShowThumbRightShadow] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const [zoomMousePos, setZoomMousePos] = useState({ x: 0, y: 0 });
  const zoomImageRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const [requireReviewApproval, setRequireReviewApproval] = useState(true);
  const { token, user } = useAuth();
  const cartItems = useSelector((state) => state.cart.items);
  const productTrustHighlights = [
    {
      icon: 'fas fa-shield-alt',
      title: 'Built for Daily Use',
      description: 'Selected for dependable performance in homes, gardens, sites, and demanding everyday environments.',
    },
    {
      icon: 'fas fa-award',
      title: 'Reliable Quality',
      description: 'Strong materials and practical construction help deliver a finish you can count on over time.',
    },
    {
      icon: 'fas fa-truck',
      title: 'Fast UK Dispatch',
      description: 'Quick shipping across the United Kingdom means less waiting and faster progress on your job.',
    },
    {
      icon: 'fas fa-tools',
      title: 'Practical Design',
      description: 'Built with real-world use in mind, combining straightforward fitting with dependable day-to-day function.',
    },
    {
      icon: 'fas fa-pound-sign',
      title: 'Value That Lasts',
      description: 'A strong balance of durability, finish, and price helps you get more from every purchase.',
    },
    {
      icon: 'fas fa-headset',
      title: 'Support You Can Reach',
      description: 'Backed by responsive service from a UK-based store focused on straightforward ordering and support.',
    },
  ];

  const API = import.meta.env.VITE_API_URL || '';

  const normalizeImageValue = (img) => {
    if (!img) return '';

    if (typeof img === 'string') {
      return img.trim();
    }

    if (typeof img === 'object') {
      return (
        img.url ||
        img.secure_url ||
        img.secureUrl ||
        img.public_url ||
        img.publicUrl ||
        img.serverUrl ||
        img.path ||
        img.src ||
        img.image ||
        ''
      );
    }

    return '';
  };

  const getImageKey = (img) => {
    const normalized = normalizeImageValue(img);
    if (!normalized) return '';

    try {
      const base = API || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      const parsed = new URL(normalized, base);
      return `${parsed.pathname}${parsed.search}`;
    } catch {
      return normalized.replace(/^https?:\/\/[^/]+/i, '');
    }
  };

  const dedupeImages = (images) => {
    const seen = new Set();
    return images.filter((img) => {
      const key = getImageKey(img);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const buildOrderedProductImages = (productData) => {
    const mainImage = normalizeImageValue(productData?.image);
    const galleryImages = Array.isArray(productData?.images)
      ? productData.images
      : productData?.images
        ? [productData.images]
        : [];

    return dedupeImages([
      mainImage,
      ...galleryImages.map(normalizeImageValue).filter(Boolean),
    ].filter(Boolean));
  };

  // Helper to get absolute image URL - handles strings and objects
  const getImgSrc = (img) => {
    const normalized = normalizeImageValue(img);
    if (!normalized) return '';
    return normalized.startsWith('http') ? normalized : `${API}${normalized}`;
  };

  // Set up meta tags for SEO
  useMetaTags({
    title: product?.metaTitle || product?.name || 'Product',
    description: product?.metaDescription || product?.description || 'Browse our product selection',
    keywords: product?.metaKeywords || '',
    image: product?.images?.[0] || '',
    url: typeof window !== 'undefined' ? window.location.href : '',
  });

  // Check for URL redirects if product not found
  useURLRedirect(!product && !loading);

  // Inject JSON-LD structured data for Google Merchant Center
  useEffect(() => {
    if (!product) return;

    const jsonLdSchema = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      description: product.description?.replace(/<[^>]*>/g, '') || product.name,
      image: product.images?.filter(img => img) || [],
      sku: product.variantCombinations?.[0]?.sku || `WOLF-${product._id}`,
      brand: {
        '@type': 'Brand',
        name: product.categories?.[0]?.name || 'Wolf Supplies'
      },
      offers: {
        '@type': 'Offer',
        url: typeof window !== 'undefined' ? window.location.href : '',
        priceCurrency: 'GBP',
        price: product.price?.toString(),
        availability: (product.inStock || product.stock > 0)
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition'
      },
      ...(product.rating > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating?.toString(),
          reviewCount: product.numReviews?.toString() || '0'
        }
      })
    };

    // Create or update script tag for JSON-LD
    let scriptTag = document.querySelector('script[type="application/ld+json"][data-product-schema]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.setAttribute('data-product-schema', 'true');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLdSchema);

    // Cleanup function to remove the script tag when component unmounts
    return () => {
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [product]);

  // Fetch review approval settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API}/api/settings`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        setRequireReviewApproval(data.requireReviewApproval !== false);
      } catch (error) {
      }
    };
    fetchSettings();
  }, [API]);

  useEffect(() => {
    // Reset quantity and selections when slug/id changes
    setQuantity(1);
    setSelectedSize(null);
    setSelectedColor(null);
    setSelectedVariants({});
    setCurrentImageIndex(0);
    setIsInWishlist(false);
    setSavedVariantId(null);
    setSavedProductFlag(false);

    const ident = slug || id;
    if (ident) {
      if (slug) dispatch(fetchProductBySlug(slug));
      else dispatch(fetchProductById(id));
    }
  }, [id, slug, dispatch]);

  useEffect(() => {
    if (!product) return;
    // compute the currently matched variant id based on current selections
    let currentVariantId = null;
    if (product.variantCombinations && product.variantCombinations.length > 0) {
      const merged = { ...(selectedVariants || {}) };
      if (selectedSize) merged['Size'] = selectedSize;
      if (selectedColor) merged['Color'] = selectedColor;

      for (const vc of product.variantCombinations) {
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
        if (matches) {
          currentVariantId = vc._id || vc.id || null;
          break;
        }
      }
    }

    // Build a plain object of current selection to compare against snapshot fields
    const currentSelection = {
      variantId: currentVariantId || null,
      selectedSize: selectedSize || null,
      selectedColor: selectedColor || null,
      selectedVariants: selectedVariants || {},
    };

    // Helper: does snapshot match current selection?
    const snapshotMatchesCurrent = (snap) => {
      if (!snap) return false;
      // Prefer exact variantId match if available
      if (snap.variantId && currentSelection.variantId) {
        if (String(snap.variantId) === String(currentSelection.variantId)) return true;
      }
      // Otherwise compare selected options (sizes/colors/variant map)
      const sSize = snap.selectedSize || null;
      const sColor = snap.selectedColor || null;
      const sVariants = snap.selectedVariants || {};
      if (sSize && currentSelection.selectedSize && String(sSize) === String(currentSelection.selectedSize) &&
        sColor && currentSelection.selectedColor && String(sColor) === String(currentSelection.selectedColor)) {
        return true;
      }
      // compare variant maps shallowly
      const aKeys = Object.keys(sVariants || {}).sort();
      const bKeys = Object.keys(currentSelection.selectedVariants || {}).sort();
      if (aKeys.length && aKeys.length === bKeys.length) {
        for (let i = 0; i < aKeys.length; i++) {
          const k = aKeys[i];
          if (String(sVariants[k]) !== String(currentSelection.selectedVariants[k])) return false;
        }
        return true;
      }
      return false;
    };

    // Check server/local wishlist for product-level save (snapshotless) or snapshot matching current selection
    let matched = false;
    for (const item of wishlistItems) {
      const prodId = item.productId || (item.product && (item.product._id || item.product)) || item._id || item.product;
      if (String(prodId) !== String(product._id)) continue;

      const isSnapshot = item.__isSnapshot || item.snapshot !== undefined || !!item.variantId;
      if (!isSnapshot) {
        // product-level save should only count as 'Saved' when the product has no variants
        if (!product.variantCombinations || product.variantCombinations.length === 0) {
          matched = true;
          break;
        }
        // otherwise ignore snapshotless product-level saves for varianted products
      }

      // item is a snapshot: check snapshot contents
      const snap = item.snapshot ? item.snapshot : item;
      const snapVariantId = item.variantId || snap.variantId || null;
      const snapObj = { ...snap, variantId: snapVariantId };
      if (snapshotMatchesCurrent(snapObj)) { matched = true; break; }
    }

    // optimistic checks: if user just saved this exact variant/product
    if (!matched) {
      if (currentSelection.variantId) {
        if (savedVariantId && String(savedVariantId) === String(currentSelection.variantId)) matched = true;
      } else if (savedProductFlag) matched = true;
    }

    setIsInWishlist(!!matched);

    // Clear optimistic saved markers if the current selection no longer matches them
    // For products with variants, ignore product-level saved flag
    if (product.variantCombinations && product.variantCombinations.length > 0) {
      if (savedProductFlag) setSavedProductFlag(false);
    }
    if (savedVariantId && currentSelection.variantId && String(savedVariantId) !== String(currentSelection.variantId)) {
      setSavedVariantId(null);
    }
  }, [product, wishlistItems, selectedVariants, selectedSize, selectedColor]);

  // Auto-select first variant option when product loads (ONLY for products with variants)
  useEffect(() => {
    // Check if product actually has variants defined
    const isVariantProduct = product && product.variants && product.variants.length > 0;

    if (isVariantProduct && product.variantCombinations && product.variantCombinations.length > 0 && Object.keys(selectedVariants).length === 0) {
      // Extract variant options
      const options = {};
      for (const vc of product.variantCombinations) {
        const variantValues = vc.variantValues || {};
        for (const [key, value] of Object.entries(variantValues)) {
          if (!options[key]) {
            options[key] = new Set();
          }
          options[key].add(String(value));
        }
      }

      // Auto-select first value for each variant
      const autoSelected = {};
      for (const [key, set] of Object.entries(options)) {
        const sortedValues = Array.from(set).sort();
        autoSelected[key] = sortedValues[0];
      }

      if (Object.keys(autoSelected).length > 0) {
        setSelectedVariants(autoSelected);
      }
    }
  }, [product]);

  // Reset main image whenever selected options or gallery length change
  useEffect(() => {
    setCurrentImageIndex(0);
    setThumbStart(0);
  }, [selectedVariants, selectedSize, selectedColor]);

  // Helper: Get display images based on variant selection
  const getDisplayImages = () => {
    // Find matching combination using same logic as findMatchingCombination
    if (!product) return [];
    const merged = { ...(selectedVariants || {}) };
    if (selectedSize) merged['Size'] = selectedSize;
    if (selectedColor) merged['Color'] = selectedColor;

    let matched = null;
    for (const vc of product.variantCombinations || []) {
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
      if (matches) { matched = vc; break; }
    }

    const normalizedProductImages = buildOrderedProductImages(product);

    // If matched variant has custom image, include it first then product images (normalized)
    if (matched && matched.image) {
      const variantImg = normalizeImageValue(matched.image);
      if (variantImg) {
        return dedupeImages([...normalizedProductImages, variantImg]);
      }
    }

    // No matched variant image — return normalized product images (fallback)
    // Ensure we always have at least the main product image
    if (normalizedProductImages.length === 0 && product.image) {
      return dedupeImages([normalizeImageValue(product.image)]);
    }
    return dedupeImages(normalizedProductImages);
  };

  // Helper to render star icons for fractional ratings
  const renderStars = (rating = 0, sizeClass = 'text-lg') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<i key={i} className={`fas fa-star ${sizeClass} text-yellow-400`}></i>);
      } else if (rating >= i - 0.5) {
        stars.push(<i key={i} className={`fas fa-star-half ${sizeClass} text-yellow-400`}></i>);
      } else {
        stars.push(<i key={i} className={`far fa-star ${sizeClass} text-yellow-400`}></i>);
      }
    }
    return stars;
  };

  const displayImages = getDisplayImages();
  const currentDisplayImage = displayImages && displayImages.length > 0 ? displayImages[currentImageIndex] : (product?.image || '🛍️');

  // Keep thumbnail window in sync with current image
  useEffect(() => {
    if (!displayImages || displayImages.length === 0) {
      setThumbStart(0);
      return;
    }
    // keep thumbStart in bounds (used for legacy fallbacks)
    setThumbStart((s) => Math.max(0, Math.min(Math.max(0, displayImages.length - THUMB_VISIBLE), s)));
  }, [currentImageIndex, displayImages]);

  // center active thumbnail in scrollable container when index changes
  useEffect(() => {
    const el = thumbContainerRef.current;
    if (!el) return;
    const child = el.querySelectorAll('button')[currentImageIndex];
    if (child) {
      // Manually scroll the container without using scrollIntoView (avoids main page scroll)
      const isHorizontal = el.offsetHeight < 150; // Mobile: horizontal scroll
      if (isHorizontal) {
        // Horizontal scroll (mobile)
        const thumbWidth = child.offsetWidth;
        const containerWidth = el.offsetWidth;
        const childLeft = child.offsetLeft;
        const targetScroll = childLeft - (containerWidth - thumbWidth) / 2;
        el.scrollLeft = targetScroll;
      } else {
        // Vertical scroll (desktop)
        const thumbHeight = child.offsetHeight;
        const containerHeight = el.offsetHeight;
        const childTop = child.offsetTop;
        const targetScroll = childTop - (containerHeight - thumbHeight) / 2;
        el.scrollTop = targetScroll;
      }
    }
    // update shadows
    const updateShadows = () => {
      if (!el) return;
      setShowThumbLeftShadow(el.scrollLeft > 8);
      setShowThumbRightShadow(el.scrollWidth - el.clientWidth - el.scrollLeft > 8);
    };
    updateShadows();
  }, [currentImageIndex, displayImages]);

  // attach scroll handler to update overlays
  useEffect(() => {
    const el = thumbContainerRef.current;
    if (!el) return;
    const handler = () => {
      setShowThumbLeftShadow(el.scrollLeft > 8);
      setShowThumbRightShadow(el.scrollWidth - el.clientWidth - el.scrollLeft > 8);
    };
    el.addEventListener('scroll', handler);
    // initial
    handler();
    return () => el.removeEventListener('scroll', handler);
  }, [displayImages]);

  const handleAddToCart = async () => {
    if (product) {
      // Prevent adding when item (or selected variant) is unavailable
      if (!isAvailable) {
        toast.error('This item is out of stock');
        return;
      }
      // Check if variations are required
      if (product.specifications?.sizes && !selectedSize) {
        toast.error('Please select a size');
        return;
      }
      if (product.specifications?.colors && !selectedColor) {
        toast.error('Please select a color');
        return;
      }

      // Check for other variants
      if (product.variants && Object.keys(product.variants).length > 0) {
        for (const [variantKey, variantData] of Object.entries(product.variants)) {
          if (variantData.required && !selectedVariants[variantKey]) {
            toast.error(`Please select ${variantKey}`);
            return;
          }
        }
      }

      // Normalize image to a simple string (prefer variant image)
      const rawImage = displayImages && displayImages.length > 0 ? displayImages[0] : (product.image || (product.images && product.images[0]) || '');
      let normalizedImage = '';
      if (typeof rawImage === 'string') normalizedImage = rawImage;
      else if (rawImage && typeof rawImage === 'object') normalizedImage = rawImage.url || rawImage.src || rawImage.path || '';

      // Get variant image from the matching combination (this is the actual variant image)
      let variantImageUrl = null;
      if (matchingCombination && matchingCombination.image) {
        variantImageUrl = getImgSrc(matchingCombination.image);
      }

      // Create a deterministic cart key so different variant selections create distinct items
      const makeCartKey = (prodId, size, color, variants) => {
        const parts = [prodId || ''];
        parts.push(`size:${size || ''}`);
        parts.push(`color:${color || ''}`);
        if (variants && typeof variants === 'object') {
          const keys = Object.keys(variants).sort();
          const varParts = keys.map(k => `${k}:${variants[k]}`);
          parts.push(`vars:${varParts.join(',')}`);
        } else {
          parts.push('vars:');
        }
        return parts.join('|');
      };

      const cartKey = makeCartKey(product._id, selectedSize, selectedColor, selectedVariants);

      const cartItem = {
        // _id used client-side as unique identifier for this cart row (includes variant info)
        _id: cartKey,
        product: product._id,
        name: product.name,
        image: normalizedImage,
        variantImage: variantImageUrl || normalizedImage,
        price: Number(matchingCombination?.price ?? product.price ?? 0),
        category: product.category,
        discount: product.discount,
        quantity,
        selectedSize,
        selectedColor,
        // Only include selectedVariants if product actually has variants
        selectedVariants: (product.variants && product.variants.length > 0) ? selectedVariants : {},
        variant: (product.variants && product.variants.length > 0) ? Object.values(selectedVariants).join(' - ') || null : null,
        sku: matchingCombination?.sku || product.sku || null,
        colorCode: selectedVariants?.['Color'] ? '#cccccc' : null,
      };
      dispatch(addToCart(cartItem));
      // Persist cart to backend for both authenticated AND guest users via thunk
      // Treat items as identical only when product id AND variant selections match
      const isSameCartItem = (a, b) => {
        if (!a || !b) return false;
        if ((a.product || '') !== (b.product || '')) return false;
        if ((a.selectedSize || '') !== (b.selectedSize || '')) return false;
        if ((a.selectedColor || '') !== (b.selectedColor || '')) return false;
        const va = a.selectedVariants || {};
        const vb = b.selectedVariants || {};
        const ka = Object.keys(va).sort();
        const kb = Object.keys(vb).sort();
        if (ka.length !== kb.length) return false;
        for (let i = 0; i < ka.length; i++) {
          const k = ka[i];
          if (k !== kb[i]) return false;
          if (String(va[k]) !== String(vb[k])) return false;
        }
        return true;
      };

      const existing = cartItems.find((i) => isSameCartItem(i, cartItem));
      let newItems = [];
      if (existing) {
        newItems = cartItems.map((i) => isSameCartItem(i, cartItem) ? { ...i, quantity: (i.quantity || 0) + (cartItem.quantity || 1) } : i);
      } else {
        newItems = [...cartItems, cartItem];
      }
      try {
        const resultAction = await dispatch(syncCart(newItems));
        // resultAction.payload contains normalized returned items when fulfilled
      } catch (err) {
        toast.error('Failed to save cart to server');
      }

      const variantText = Object.entries(selectedVariants)
        .map(([key, val]) => `${key}: ${val}`)
        .join(', ');

      toast.success(`${quantity} item(s) added to cart! ${variantText}`);
    }
  };

  const handleWishlist = () => {
    if (product) {
      const token = localStorage.getItem('token');
      // Build a variant snapshot object so variant-specific wishlist entries are stored
      const currentVariant = matchingCombination || null;
      const variantId = currentVariant?._id || currentVariant?.id || null;

      const rawImage = displayImages && displayImages.length > 0 ? displayImages[0] : (product.image || (product.images && product.images[0]) || '');
      let normalizedImage = '';
      if (typeof rawImage === 'string') normalizedImage = rawImage;
      else if (rawImage && typeof rawImage === 'object') normalizedImage = rawImage.url || rawImage.src || rawImage.path || '';

      const snapshot = {
        productId: product._id,
        name: product.name,
        price: Number(matchingCombination?.price ?? product.price ?? 0),
        image: normalizedImage,
        selectedVariants: selectedVariants || {},
        selectedSize: selectedSize || null,
        selectedColor: selectedColor || null,
        variantId: variantId || null,
      };

      if (isInWishlist) {
        // optimistic UI: mark removed immediately
        setIsInWishlist(false);
        // clear saved marker
        setSavedVariantId(null);
        setSavedProductFlag(false);
        // remove specific variant if available, otherwise remove all product entries
        // Works for both authenticated AND guest users
        dispatch(removeItemFromServer({ productId: product._id, variantId, snapshot }));
      } else {
        // optimistic UI: mark saved immediately
        setIsInWishlist(true);
        // remember which variant/product was saved so the button remains 'Saved' until selection changes
        if (variantId) {
          setSavedVariantId(variantId);
          setSavedProductFlag(false);
        } else {
          setSavedVariantId(null);
          setSavedProductFlag(true);
        }
        // Add to wishlist - works for both authenticated AND guest users
        dispatch(addItemToServer({ productId: product._id, snapshot }));
      }
      toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!');
    }
  };

  const handleShare = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.name,
        text: `Check out this amazing product: ${product.name}`,
        url: window.location.href,
      });
    } else {
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[var(--color-bg-section)]">
        <i className="fas fa-spinner text-6xl text-[var(--color-text-light)] animate-spin"></i>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--color-bg-section)]">
        <p className="text-3xl text-[var(--color-text-light)] mb-6">Product not found</p>
        <button onClick={() => navigate('/products')} className="bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white px-8 py-3 rounded-lg font-bold transition duration-300">
          Browse Products
        </button>
      </div>
    );
  }

  // Helper to find matching variant combination given selected options
  const findMatchingCombination = () => {
    if (!product || !product.variantCombinations || product.variantCombinations.length === 0) return null;

    const merged = { ...(selectedVariants || {}) };
    if (selectedSize) merged['Size'] = selectedSize;
    if (selectedColor) merged['Color'] = selectedColor;

    for (const vc of product.variantCombinations) {
      // variantValues may be a Map or plain object
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
      if (matches) return vc;
    }
    return null;
  };

  const matchingCombination = findMatchingCombination();
  let availableStock = null;
  if (matchingCombination) {
    availableStock = Number(matchingCombination.stock || 0);
  } else if (product.variantCombinations && product.variantCombinations.length > 0) {
    availableStock = null; // unknown until options selected
  } else {
    availableStock = Number(product.stock || 0);
  }

  const isAvailable = (() => {
    if (availableStock !== null) return availableStock > 0;
    return !!product.inStock;
  })();

  // Helper: Extract unique variant option names and their available values from variantCombinations
  const getVariantOptions = () => {
    if (!product.variantCombinations || product.variantCombinations.length === 0) return {};

    const options = {};
    for (const vc of product.variantCombinations) {
      const variantValues = vc.variantValues || {};
      for (const [key, value] of Object.entries(variantValues)) {
        if (!options[key]) {
          options[key] = new Set();
        }
        options[key].add(String(value));
      }
    }

    // Convert Sets to sorted arrays
    const result = {};
    for (const [key, set] of Object.entries(options)) {
      result[key] = Array.from(set).sort();
    }
    return result;
  };

  const variantOptions = getVariantOptions();

  // Helper: Check if benefits has actual content (not just HTML tags)
  const hasBenefitsContent = () => {
    if (!product.benefits) return false;
    if (typeof product.benefits === 'string') {
      // Remove HTML tags and check if there's actual text content
      const textContent = product.benefits.replace(/<[^>]*>/g, '').trim();
      return textContent.length > 0;
    }
    if (Array.isArray(product.benefits)) {
      return product.benefits.some(item => {
        if (!item) return false;
        const textContent = String(item).replace(/<[^>]*>/g, '').trim();
        return textContent.length > 0;
      });
    }
    return false;
  };

  // Submit review (no authentication required - guest reviews allowed)
  const submitReview = async (reviewData) => {
    const prodId = product?._id || id || slug;
    if (!prodId) throw new Error('Product identifier missing');

    const res = await fetch(`${API}/api/products/${prodId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    const data = await res.json();
    
    if (!res.ok) {
      const errorMsg = data?.detail || data?.message || 'Failed to submit review';
      const err = new Error(errorMsg);
      err.status = res.status;
      throw err;
    }

    toast.success('Review submitted successfully');

    // Refresh product details
    if (product && product._id) dispatch(fetchProductById(product._id));
    else dispatch(fetchProductById(prodId));
  };

  return (
    <>
      {/* Meta Tags and Structured Data */}
      <Helmet>
        <title>{product?.metaTitle || `${product?.name || 'Product'} | Wolf Supplies`}</title>
        <meta name="description" content={product?.metaDescription || product?.description?.replace(/<[^>]*>/g, '').substring(0, 160) || 'Browse our product selection'} />
        {product?.metaKeywords && <meta name="keywords" content={product.metaKeywords} />}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

        {/* Canonical URL */}
        <link rel="canonical" href={`https://wolfsupplies.co.uk/product/${product?.slug}`} />

        {/* Open Graph Meta Tags for Social Sharing */}
        <meta property="og:title" content={product?.name || 'Product'} />
        <meta property="og:description" content={product?.description?.replace(/<[^>]*>/g, '').substring(0, 160) || 'Browse our quality products'} />
        <meta property="og:image" content={product?.images?.[0]?.startsWith('http') ? product.images[0] : product?.images?.[0] ? `https://wolfsupplies.co.uk${product.images[0]}` : 'https://wolfsupplies.co.uk/default-product-image.jpg'} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={`https://wolfsupplies.co.uk/product/${product?.slug}`} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Wolf Supplies" />
        {product?.price && (
          <>
            <meta property="og:price:amount" content={product.price.toFixed(2)} />
            <meta property="og:price:currency" content="GBP" />
            <meta property="product:availability" content={(product.inStock || product.stock > 0) ? 'in stock' : 'out of stock'} />
          </>
        )}

        {/* Twitter Card - Enhanced */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product?.name || 'Product'} />
        <meta name="twitter:description" content={product?.description?.replace(/<[^>]*>/g, '').substring(0, 160)} />
        <meta name="twitter:image" content={product?.images?.[0]?.startsWith('http') ? product.images[0] : product?.images?.[0] ? `https://wolfsupplies.co.uk${product.images[0]}` : 'https://wolfsupplies.co.uk/default-product-image.jpg'} />

        {/* Structured Data */}
        <meta name="product:category" content={product?.categories?.[0]?.name || 'Products'} />
        <meta name="product:sku" content={product?.sku || product?.variantCombinations?.[0]?.sku || `WOLF-${product?._id}`} />

        {/* JSON-LD Structured Data for Product */}
        {product && (
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              '@id': `https://wolfsupplies.co.uk/product/${product.slug}`,
              name: product.name,
              description: product.description?.replace(/<[^>]*>/g, '') || product.name,
              image: product.images?.filter(img => img)?.map(img =>
                img?.startsWith('http') ? img : `https://wolfsupplies.co.uk${img}`
              ) || ['https://wolfsupplies.co.uk/default-product-image.jpg'],
              sku: product.sku || product.variantCombinations?.[0]?.sku || `WOLF-${product._id}`,
              mpn: product.sku || product.variantCombinations?.[0]?.sku || `WOLF-${product._id}`,
              gtin: product.sku || product.variantCombinations?.[0]?.sku,
              productID: product._id,
              brand: {
                '@type': 'Brand',
                name: 'Wolf Supplies'
              },
              offers: {
                '@type': 'Offer',
                '@id': `https://wolfsupplies.co.uk/product/${product.slug}#offer`,
                url: `https://wolfsupplies.co.uk/product/${product.slug}`,
                priceCurrency: 'GBP',
                price: (product.price || 0).toFixed(2),
                priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                availability: (product.inStock || product.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                inventoryLevel: {
                  '@type': 'QuantitativeValue',
                  value: product.stock || 0
                },
                seller: {
                  '@type': 'Organization',
                  name: 'Wolf Supplies',
                  url: 'https://wolfsupplies.co.uk'
                },
                shippingDetails: {
                  '@type': 'OfferShippingDetails',
                  shippingRate: {
                    '@type': 'PriceSpecification',
                    priceCurrency: 'GBP',
                    price: '0.00',
                    eligibleQuantity: {
                      '@type': 'QuantitativeValue',
                      minValue: 1
                    }
                  },
                  shippingLabel: 'Free Shipping',
                  deliveryTime: {
                    '@type': 'ShippingDeliveryTime',
                    handlingTime: {
                      '@type': 'QuantitativeValue',
                      minValue: 1,
                      maxValue: 2,
                      unitCode: 'DAY'
                    },
                    transitTime: {
                      '@type': 'QuantitativeValue',
                      minValue: 2,
                      maxValue: 4,
                      unitCode: 'DAY'
                    }
                  }
                },
                hasMerchantReturnPolicy: {
                  '@type': 'MerchantReturnPolicy',
                  returnsAccepted: true,
                  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                  merchantReturnDays: 31,
                  returnMethod: ['http://purl.org/goodrelations/v1#DeliveryModeOwnFleet', 'http://purl.org/goodrelations/v1#UPSGround'],
                  returnFees: 'https://schema.org/FreeReturn',
                  returnShippingFeesAmount: {
                    '@type': 'PriceSpecification',
                    priceCurrency: 'GBP',
                    price: '0.00'
                  }
                }
              },
              ...(product.rating > 0 && {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: (product.rating || 0).toFixed(1),
                  reviewCount: product.numReviews || 0,
                  bestRating: '5',
                  worstRating: '1'
                }
              }),
              review: product.reviews && product.reviews.length > 0 ? product.reviews.slice(0, 10).map(review => ({
                '@type': 'Review',
                author: {
                  '@type': 'Person',
                  name: review.reviewer || 'Anonymous'
                },
                datePublished: review.dateCreated || new Date().toISOString(),
                description: review.comment,
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: review.rating || 5
                }
              })) : undefined,
              isPartOf: {
                '@type': 'CollectionPage',
                name: product.categories?.[0]?.name || 'Products'
              }
            })}
          </script>
        )}
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="bg-[var(--color-bg-primary)] border-b border-[var(--color-border-light)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-[var(--color-text-light)]">
              <button onClick={() => navigate('/')} className="hover:text-[var(--color-accent-primary)] transition">Home</button>
              <span>/</span>
              <button onClick={() => navigate('/products')} className="hover:text-[var(--color-accent-primary)] transition">Products</button>
              <span>/</span>
              <span className="text-[var(--color-accent-primary)] font-semibold">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="max-w-full mx-auto px-2 sm:px-2 lg:px-2 py-8">
          {/* Main Product Section */}
          <div className="grid lg:grid-cols-2 gap-5 mb-16">
            {/* Product Images */}
            <div className="space-y-4">
              <div className=" rounded-2xl  overflow-hidden p-2 sticky" style={{ top: 'var(--pdp-sticky-offset, 0px)' }}>
                {/* Gallery Container - Responsive: Vertical on Mobile, Horizontal on Desktop */}
                <div className="flex flex-col lg:flex-row gap-3 w-full">
                  {/* Left Side: Thumbnail Gallery - Horizontal on Mobile, Vertical on Desktop */}
                  {displayImages.length > 1 && (
                    <div className="w-full lg:flex-shrink-0 lg:w-auto">
                      {/* Thumbnails Container - Responsive */}
                      <div
                        ref={thumbContainerRef}
                        className="flex lg:flex-col gap-2 lg:gap-3 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden px-1 rounded-lg hide-scrollbar"
                        style={{
                          height: 'auto',
                          minHeight: 'auto',
                          scrollBehavior: 'smooth',
                          maxWidth: '400px',
                          maxHeight: '500px',
                          lg: { maxHeight: '500px', maxWidth: 'none', minWidth: '120px', minHeight: '400px' }
                        }}
                      >
                        {displayImages && displayImages.length > 0 ? (
                          displayImages.map((img, idx) => {
                            return (
                              <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-3 transition-all duration-300 hover:scale-105 ${currentImageIndex === idx
                                  ? 'border-[var(--color-accent-primary)] shadow-lg'
                                  : 'border-[var(--color-border-light)] hover:border-[var(--color-accent-primary)] shadow-sm'
                                  }`}
                              >
                                <img
                                  key={`thumb-${idx}`}
                                  src={getImgSrc(img)}
                                  alt={`Thumbnail ${idx + 1}`}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.target.style.opacity = '0';
                                  }}
                                />
                              </button>
                            );
                          })
                        ) : (
                          <div className="w-20 h-20 bg-[var(--color-bg-section)] rounded-lg flex items-center justify-center text-[var(--color-text-light)]">
                            <span className="text-xs text-center">No Images</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Right Side: Main Image */}
                  <div className="flex-1 flex flex-col w-full">
                    {/* Main Image Container - Responsive: Mobile: max 400px, Desktop: max 600px */}
                    <div
                      className="relative rounded-xl overflow-hidden group cursor-zoom-in flex items-center justify-center mx-auto lg:mx-0"
                      style={{
                        aspectRatio: '1/1',
                        width: '100%',
                        maxWidth: '100%',
                        height: 'auto',
                      }}
                      onClick={() => { setZoomImageIndex(currentImageIndex); setShowZoomModal(true); }}
                    >
                      {displayImages && displayImages.length > 0 ? (
                        <img
                          key={currentImageIndex}
                          src={getImgSrc(currentDisplayImage)}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
                          onError={(e) => {
                            e.target.style.opacity = '0';
                          }}
                        />
                      ) : (
                        <div className="text-[var(--color-text-light)] text-center">
                          <p className="text-lg font-semibold">No Images Available</p>
                        </div>
                      )}

                      {/* Navigation Arrows */}
                      {displayImages && displayImages.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex((idx) => {
                                const newIdx = (idx - 1 + displayImages.length) % displayImages.length;
                                setThumbStart((s) => Math.max(0, Math.min(Math.max(0, displayImages.length - THUMB_VISIBLE), s - 1)));
                                return newIdx;
                              });
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-[var(--color-accent-primary)] bg-opacity-70 hover:bg-opacity-100 text-white p-3 rounded-full transition-all z-10 shadow-lg flex items-center justify-center"
                            aria-label="Previous image"
                          >
                            <i className="fas fa-arrow-left text-lg"></i>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex((idx) => {
                                const newIdx = (idx + 1) % displayImages.length;
                                setThumbStart((s) => Math.min(Math.max(0, displayImages.length - THUMB_VISIBLE), s + 1));
                                return newIdx;
                              });
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-[var(--color-accent-primary)] bg-opacity-70 hover:bg-opacity-100 text-white p-3 rounded-full transition-all z-10 shadow-lg flex items-center justify-center"
                            aria-label="Next image"
                          >
                            <i className="fas fa-arrow-right text-lg"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              {/* Header */}
              <div className='m-0'>
                {/* SKU Display - Show only if it exists */}
                {(matchingCombination?.sku || product.sku) && (
                  <div className="text-sm text-[var(--color-text-light)] mb-3 font-semibold">
                    SKU: {matchingCombination?.sku || product.sku}
                  </div>
                )}
                {/* <div className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-semibold mb-4">
                {product.category}
              </div> */}
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)] leading-tight">{product.name}</h1>

                {/* Rating */}
                {(product.numReviews || product.reviews?.length || 0) > 0 && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {renderStars(product.rating || 0, 'text-lg')}
                      </div>
                      <span className="text-lg font-bold text-[var(--color-text-primary)]">{(product.rating || 0).toFixed(1)}</span>
                    </div>
                    <span className="text-[var(--color-text-light)]">({product.numReviews || product.reviews?.length || 0} verified reviews)</span>
                  </div>
                )}
              </div>

              {/* Price Section */}
              <div className="bg-white p-4">
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-2xl font-bold text-[var(--color-accent-primary)]">£{matchingCombination?.price || product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-3xl text-[var(--color-text-light)] line-through">£{product.originalPrice}</span>
                    </>
                  )}
                </div>
                <p className="text-[var(--color-text-light)] font-semibold">✓ Great Price • Free Shipping In UK Everywhere</p>
                <p className="text-[var(--color-text-light)] text-sm mt-2">VAT 0 - We don't claim VAT</p>
              </div>

              {/* Stock Status (variant-aware) */}
              <div className="p-4 bg-[var(--color-bg-section)] border-l-4 border-[var(--color-accent-primary)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`text-2xl ${isAvailable ? 'text-green-400' : 'text-red-600'}`}>
                    {isAvailable ? '✓' : '✗'}
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${isAvailable ? 'text-[var(--color-text-primary)]' : 'text-red-600'}`}>
                      {isAvailable ? 'In Stock - Ships Today!' : 'Out of Stock'}
                    </p>
                    <p className="text-[var(--color-text-light)] text-sm">{isAvailable ? 'Available for immediate dispatch' : 'This item is currently unavailable'}</p>
                  </div>
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-6">
                {/* Size Variations */}
                {product.specifications?.sizes && (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                      Size {selectedSize && <span className="text-[var(--color-text-light)]">- {selectedSize}</span>}
                    </label>
                    <select
                      value={selectedSize || ''}
                      onChange={(e) => setSelectedSize(e.target.value || null)}
                      className="w-full px-4 py-3 border-2 border-[var(--color-border-light)] rounded-lg font-semibold text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] cursor-pointer hover:border-[var(--color-accent-primary)] transition focus:outline-none focus:border-[var(--color-accent-primary)]"
                    >
                      {/* <option value="">Choose a size...</option> */}
                      {product.specifications.sizes.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Color Variations */}
                {product.specifications?.colors && (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                      Color {selectedColor && <span className="text-[var(--color-text-light)]">- {selectedColor}</span>}
                    </label>
                    <select
                      value={selectedColor || ''}
                      onChange={(e) => setSelectedColor(e.target.value || null)}
                      className="w-full px-4 py-3 border-2 border-[var(--color-border-light)] rounded-lg font-semibold text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] cursor-pointer hover:border-[var(--color-accent-primary)] transition focus:outline-none focus:border-[var(--color-accent-primary)]"
                    >
                      {/* <option value="">Choose a color...</option> */}
                      {product.specifications.colors.map((color) => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Variants from variantCombinations */}
                {Object.keys(variantOptions).length > 0 && Object.entries(variantOptions).map(([variantName, variantValues]) => (
                  <div key={variantName} className="space-y-2">
                    <label className="block text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wide">
                      {variantName} {selectedVariants[variantName] && <span className="text-[var(--color-text-light)]">- {selectedVariants[variantName]}</span>}
                    </label>
                    <select
                      value={selectedVariants[variantName] || ''}
                      onChange={(e) => setSelectedVariants({ ...selectedVariants, [variantName]: e.target.value || null })}
                      className="w-full px-4 py-3 border-2 border-[var(--color-border-light)] rounded-lg font-semibold text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] cursor-pointer hover:border-[var(--color-accent-primary)] transition focus:outline-none focus:border-[var(--color-accent-primary)]"
                    >

                      {variantValues.map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </div>
                ))}

                {/* Quantity Selector and Add to Cart */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-[var(--color-border-light)] rounded-lg overflow-hidden bg-[var(--color-bg-primary)]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-6 py-3 hover:bg-[var(--color-bg-section)] font-bold text-lg text-[var(--color-text-primary)] transition"
                    >
                      −
                    </button>
                    <span className="px-8 py-3 border-l-2 border-r-2 border-[var(--color-border-light)] font-bold text-xl text-[var(--color-text-primary)]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-6 py-3 hover:bg-[var(--color-bg-section)] font-bold text-lg text-[var(--color-text-primary)] transition"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button (disabled when out of stock) */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    className={`flex-1 px-8 py-4 rounded-lg font-bold transition duration-300 flex items-center justify-center gap-3 text-lg shadow-lg ${isAvailable ? 'bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white' : 'bg-[var(--color-border-light)] text-[var(--color-text-light)] cursor-not-allowed'}`}
                  >
                    <i className="fas fa-shopping-cart"></i> {isAvailable ? 'Add to Cart' : 'Sold Out'}
                  </button>
                </div>

                {/* Buy Now Button */}
                <button
                  onClick={() => {
                    if (isAvailable) {
                      handleAddToCart();
                      navigate('/checkout');
                    }
                  }}
                  disabled={!isAvailable}
                  className={`w-full px-8 py-4 rounded-lg font-bold transition duration-300 flex items-center justify-center gap-3 text-lg shadow-lg ${isAvailable ? 'bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white' : 'bg-[var(--color-border-light)] text-[var(--color-text-light)] cursor-not-allowed'}`}
                >
                  <i className="fas fa-check"></i> {isAvailable ? 'Buy Now' : 'Sold Out'}
                </button>

                {/* Selected Options Summary */}
                {((selectedSize && product.specifications?.sizes) ||
                  (selectedColor && product.specifications?.colors) ||
                  (Object.values(selectedVariants).some(v => v) && Object.keys(variantOptions).length > 0)) && (
                    <div className="bg-[var(--color-bg-section)] p-6 rounded-lg border-2 border-[var(--color-accent-primary)]">
                      <h4 className="font-bold text-lg text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                        <span className="bg-[var(--color-accent-primary)] text-white px-3 py-1 rounded-full text-sm">✓</span>
                        Your Selection Summary
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedSize && (
                          <div className="bg-[var(--color-bg-primary)] p-3 rounded-lg">
                            <p className="text-xs text-[var(--color-text-light)] font-semibold uppercase">Size</p>
                            <p className="text-lg font-bold text-[var(--color-accent-primary)]">{selectedSize}</p>
                          </div>
                        )}
                        {selectedColor && (
                          <div className="bg-[var(--color-bg-primary)] p-3 rounded-lg">
                            <p className="text-xs text-[var(--color-text-light)] font-semibold uppercase">Color</p>
                            <p className="text-lg font-bold text-[var(--color-accent-primary)]">{selectedColor}</p>
                          </div>
                        )}
                        {Object.entries(selectedVariants).filter(([_, val]) => val).map(([key, val]) => (
                          <div key={key} className="bg-[var(--color-bg-primary)] p-3 rounded-lg">
                            <p className="text-xs text-[var(--color-text-light)] font-semibold uppercase">{key}</p>
                            <p className="text-lg font-bold text-[var(--color-accent-primary)]">{val}</p>
                          </div>
                        ))}
                        <div className="bg-[var(--color-bg-primary)] p-3 rounded-lg">
                          <p className="text-xs text-[var(--color-text-light)] font-semibold uppercase">Quantity</p>
                          <p className="text-lg font-bold text-[var(--color-accent-primary)]">x{quantity}</p>
                        </div>
                        <div className="bg-[var(--color-bg-primary)] p-3 rounded-lg col-span-2">
                          <p className="text-xs text-[var(--color-text-light)] font-semibold uppercase">Total Price</p>
                          <p className="text-2xl font-bold text-[var(--color-accent-primary)]">£{((matchingCombination?.price || product.price) * quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleWishlist}
                    className={`py-3 px-4 rounded-lg font-bold transition duration-300 flex items-center justify-center gap-2 ${isInWishlist
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white'
                      }`}
                  >
                    <i className="fas fa-heart"></i> {isInWishlist ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="py-3 px-4 rounded-lg font-bold bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-light)] transition duration-300 flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-share"></i> Share
                  </button>
                </div>
              </div>

              {/* Shipping, Returns & Payment Info */}
              <div className="grid grid-cols-1 gap-0 bg-[var(--color-bg-primary)] border border-[var(--color-border-light)] rounded-lg overflow-hidden">
                {/* Shipping Info */}
                <div className="flex gap-4 items-center p-6 border-b border-[var(--color-border-light)]">
                  <div className="text-3xl text-[var(--color-accent-primary)] flex-shrink-0"><i className="fas fa-truck"></i></div>
                  <div>
                    <p className="font-bold text-[var(--color-text-primary)] text-sm leading-tight">Free Shipping: 2-4 Business Days</p>
                    <p className="text-[var(--color-text-light)] text-xs mt-1">Ships within the United Kingdom only. <Link to="/policies/shipping" className="text-[var(--color-accent-primary)] hover:underline font-semibold">See details →</Link></p>
                  </div>
                </div>

                {/* Returns Info */}
                <div className="flex gap-4 items-center p-6 border-b border-[var(--color-border-light)]">
                  <div className="text-3xl text-[var(--color-accent-primary)] flex-shrink-0"><i className="fas fa-box"></i></div>
                  <div>
                    <p className="font-bold text-[var(--color-text-primary)] text-sm leading-tight">31 Days Return & Refunds Policy</p>
                    <p className="text-[var(--color-text-light)] text-xs mt-1">Full refund within 31 days of purchase.
                      <Link to="/policies/returns" className="text-[var(--color-accent-primary)] hover:underline font-semibold"> See details →</Link></p>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="flex gap-4 items-center p-6">
                  <div className="text-3xl text-[var(--color-accent-primary)] flex-shrink-0"><i className="fas fa-lock"></i></div>
                  <div className="flex-1">
                    <div className="">
                      <img
                        src="/Strip Logos.png"
                        alt="Payment methods"
                        className="h-8 object-contain"
                      />
                    </div>
                    <p className="text-[var(--color-text-light)] text-xs leading-relaxed">All payments are processed securely in £ (£).</p>
                  </div>
                </div>
              </div>

              {/* Key Benefits (dynamic when available) - Only show if content exists */}
              {hasBenefitsContent() && (
                <div className="bg-[var(--color-bg-section)] p-6 rounded-xl border-l-4 border-[var(--color-accent-primary)]">
                  <h3 className="font-bold text-lg text-[var(--color-text-primary)] mb-4">{product.benefitsHeading || 'Why Buy This Product?'}</h3>
                  {typeof product.benefits === 'string' ? (
                    <div
                      className="prose prose-sm max-w-none text-[var(--color-text-light)]"
                      dangerouslySetInnerHTML={{ __html: product.benefits }}
                    />
                  ) : Array.isArray(product.benefits) ? (
                    <ul className="space-y-2 text-[var(--color-text-light)]">
                      {product.benefits.map((b, i) =>
                        b && String(b).trim() ? (
                          <li key={i} className="flex items-center gap-3"><i className="fas fa-check text-[var(--color-accent-primary)]"></i> {b}</li>
                        ) : null
                      )}
                    </ul>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Description & Reviews Tabs */}
          <div className="bg-[var(--color-bg-primary)] p-6 rounded-2xl shadow-lg mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('description');
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'description' ? 'bg-[var(--color-accent-primary)] text-white' : 'bg-[var(--color-bg-section)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-light)]'}`}
                >
                  Product Description
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('reviews');
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'reviews' ? 'bg-[var(--color-accent-primary)] text-white' : 'bg-[var(--color-bg-section)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-light)]'}`}
                >
                  Reviews ({product.numReviews || product.reviews?.length || 0})
                </button>
              </div>
            </div>

            {activeTab === 'description' ? (
              <div >
                <div
                  className="prose prose-sm max-w-none text-[var(--color-text-light)] leading-relaxed mb-8"
                  dangerouslySetInnerHTML={{ __html: product.description || '' }}
                />
              </div>
            ) : (
              <div className="p-0">
                {/* Reviews Component */}
                <Reviews
                  product={product}
                  token={token}
                  user={user}
                  onSubmitReview={submitReview}
                  requireReviewApproval={requireReviewApproval}
                  API={API}
                />
              </div>
            )}
          </div>

          <section
            className="mb-16 rounded-[32px] px-6 py-12 md:px-10 lg:px-14 shadow-lg border"
            style={{
              background: 'linear-gradient(180deg, #fffaf5 0%, var(--color-bg-primary) 100%)',
              borderColor: 'rgba(165, 99, 42, 0.18)',
            }}
          >
            <div className="mx-auto max-w-4xl text-center">
              <p
                className="text-sm font-bold uppercase tracking-[0.28em]"
                style={{ color: 'var(--color-accent-primary)' }}
              >
                Why Customers Choose Wolf Supplies
              </p>
              <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-[var(--color-text-primary)]">
                Quality Materials. Practical Value. Trusted UK Delivery.
              </h2>
              <p className="mt-5 text-base md:text-lg leading-8 text-[var(--color-text-light)]">
                We focus on straightforward products that look right, perform reliably, and arrive ready for the job.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {productTrustHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[22px] border p-8 shadow-[0_18px_40px_rgba(36,24,16,0.08)] transition-transform duration-300 hover:-translate-y-1"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)',
                  }}
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
                    style={{
                      backgroundColor: 'rgba(165, 99, 42, 0.12)',
                      color: 'var(--color-accent-primary)',
                    }}
                  >
                    <i className={`${item.icon} text-2xl`}></i>
                  </div>
                  <h3 className="mt-6 text-2xl font-black tracking-tight text-[var(--color-text-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base font-medium leading-7 text-[var(--color-text-light)]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Products Component */}
          {product && (
            <RelatedProducts
              currentProductId={product._id}
              currentCategory={product.category}
              limit={5}
            />
          )}

          {/* Zoom Modal with Mouse-Based Magnification */}
          {showZoomModal && displayImages.length > 0 && (
            <div
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
              onClick={() => setShowZoomModal(false)}
            >
              <div
                className="relative w-full max-w-5xl flex items-center justify-center gap-6"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Left Side: Main Image with Mouse Tracking */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div
                    ref={zoomImageRef}
                    className="relative bg-white rounded-lg overflow-hidden shadow-2xl cursor-crosshair"
                    onMouseMove={(e) => {
                      if (!zoomImageRef.current) return;
                      const rect = zoomImageRef.current.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      setZoomMousePos({ x, y });
                    }}
                    onMouseLeave={() => setZoomMousePos({ x: 0, y: 0 })}
                    style={{ maxWidth: '500px', maxHeight: '500px' }}
                  >
                    <img
                      key={`zoom-main-${zoomImageIndex}`}
                      src={getImgSrc(displayImages[zoomImageIndex])}
                      alt={`${product.name} zoom`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.opacity = '0';
                      }}
                    />

                    {/* Magnifying Glass Lens Circle */}
                    <div
                      className="absolute w-20 h-20 border-4 border-yellow-400 rounded-full pointer-events-none shadow-lg"
                      style={{
                        left: `${zoomMousePos.x - 40}px`,
                        top: `${zoomMousePos.y - 40}px`,
                        opacity: zoomMousePos.x > 0 || zoomMousePos.y > 0 ? 1 : 0,
                        transition: 'opacity 0.2s'
                      }}
                    />
                  </div>
                  {displayImages.length > 1 && (
                    <div className="flex gap-3 m-5 justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
                        }}
                        className="bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-section)] text-[var(--color-text-primary)] rounded-full p-3 shadow-lg transition"
                        aria-label="Previous image"
                      >
                        <i className="fas fa-arrow-left" style={{ fontSize: '18px' }}></i>
                      </button>
                      <div className="bg-[var(--color-accent-primary)] bg-opacity-60 text-white px-4 py-2 rounded-full flex items-center justify-center min-w-20">
                        <span className="font-semibold">{zoomImageIndex + 1} / {displayImages.length}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomImageIndex((prev) => (prev + 1) % displayImages.length);
                        }}
                        className="bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-section)] text-[var(--color-text-primary)] rounded-full p-3 shadow-lg transition"
                        aria-label="Next image"
                      >
                        <i className="fas fa-arrow-right" style={{ fontSize: '18px' }}></i>
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Side: Magnified View */}
                <div className="flex-1 flex flex-col justify-center items-center gap-4">
                  <div
                    className="relative bg-[var(--color-bg-primary)] rounded-lg overflow-hidden shadow-2xl border-4 border-[var(--color-border-light)]"
                    style={{ width: '300px', height: '300px' }}
                  >
                    <img
                      key={`zoom-magnified-${zoomImageIndex}`}
                      src={getImgSrc(displayImages[zoomImageIndex])}
                      alt={`${product.name} magnified`}
                      className="absolute w-full h-full object-contain"
                      style={{
                        transform: 'scale(2.5)',
                        transformOrigin: `${(zoomMousePos.x / (zoomImageRef.current?.offsetWidth || 1)) * 100}% ${(zoomMousePos.y / (zoomImageRef.current?.offsetHeight || 1)) * 100}%`,
                        transition: 'transform 0.1s ease-out'
                      }}
                      onError={(e) => {
                        e.target.style.opacity = '0';
                      }}
                    />

                    {/* Instruction text when not hovering */}
                    {(zoomMousePos.x === 0 && zoomMousePos.y === 0) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-section)] bg-opacity-50">
                        <p className="text-[var(--color-text-light)] text-center font-semibold">Move mouse over image to zoom</p>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}

                </div>

                {/* Close button */}
                <button
                  onClick={() => setShowZoomModal(false)}
                  className="absolute top-4 right-4 bg-[var(--color-bg-primary)] bg-opacity-80 hover:bg-opacity-100 text-[var(--color-text-primary)] rounded-full p-3 shadow-lg transition"
                  aria-label="Close zoom"
                >
                  <span className="text-xl font-bold">✕</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;

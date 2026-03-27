'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, syncCart } from '../../../redux/slices/cartSlice';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  if (product.isDraft) return null;

  const hasVariants =
    product.variantCombinations && product.variantCombinations.length > 0;
  const variantPrices = hasVariants
    ? product.variantCombinations
        .map((variant) => Number(variant?.price || 0))
        .filter((price) => price > 0)
    : [];
  const displayPrice = hasVariants
    ? Number(
        product.listingPrice ??
        (variantPrices.length > 0 ? Math.min(...variantPrices) : product.price || 0)
      )
    : Number(product.price || 0);

  const allImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const getImgSrc = (img) => {
    if (!img || typeof img !== 'string') return '';
    return img.startsWith('http') ? img : `${API}${img}`;
  };

  const handlePrevImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const { token } = useAuth();
  const cartItems = useSelector((state) => state.cart.items);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // prevent outer Link click

    const rawImage = allImages?.[0] || '';
    let normalizedImage = '';

    if (typeof rawImage === 'string') normalizedImage = rawImage;
    else if (rawImage && typeof rawImage === 'object')
      normalizedImage =
        rawImage.url ||
        rawImage.src ||
        rawImage.path ||
        rawImage.secure_url ||
        rawImage.secureUrl ||
        rawImage.public_url ||
        rawImage.publicUrl ||
        '';

    const cartItem = {
      _id: product._id,
      product: product._id,
      name: product.name,
      image: normalizedImage,
      price: Number(product.price || 0),
      category: product.category,
      discount: product.discount,
      quantity: 1,
      selectedVariants: {},
    };

    dispatch(addToCart(cartItem));

    const existing = cartItems.find((i) => i._id === cartItem._id);
    const newItems = existing
      ? cartItems.map((i) =>
        i._id === cartItem._id
          ? { ...i, quantity: (i.quantity || 0) + 1 }
          : i
      )
      : [...cartItems, cartItem];

    try {
      await dispatch(syncCart(newItems));
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to save cart to server');
    }
  };

  const productUrl = product.slug || product._id;

  // Variant products are in stock if any variant still has stock.
  let isInStock = false;

  if (hasVariants) {
    isInStock = product.variantCombinations.some(
      (variant) => Number(variant?.stock || 0) > 0
    );
  } else {
    const availableStock = Number(product.stock || 0);
    isInStock = Boolean(product.inStock) || availableStock > 0;
  }


  const handleSelectOptions = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${productUrl}`);
  };
  const renderStars = (rating = 0, sizeClass = 'text-lg') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<i key={i} className={`fas fa-star ${sizeClass} text-yellow-400`}></i>);
      } else if (rating >= i - 0.5) {
        stars.push(<i key={i} className={`fas fa-star-half-alt ${sizeClass} text-yellow-400`}></i>);
      } else {
        stars.push(<i key={i} className={`far fa-star ${sizeClass} text-yellow-400`}></i>);
      }
    }
    return stars;
  };
  return (
    <Link to={`/product/${productUrl}`}>
      <div className="md:hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col p-2 sm:p-4 rounded-lg bg-white shadow-md md:shadow-none">

        {/* Image */}
        <div className="relative w-full h-48 bg-[var(--color-bg-section)] rounded-lg overflow-hidden mb-4 flex items-center justify-center border border-[var(--color-border-light)]">
          <img
            src={getImgSrc(allImages[currentImageIndex])}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => (e.target.style.display = 'none')}
          />
          
          {/* Sold Out Badge - Corner Badge */}
          {!isInStock && (
            <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full font-bold text-xs">
              Sold Out
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col flex-grow">
          <h3 className="font-bold text-black mb-2 line-clamp-2 text-sm group-hover:text-[var(--color-accent-primary)] transition duration-300">
            {product.name}
          </h3>

          {/* Rating — show only if reviews exist */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                {renderStars(product.rating || 0, 'text-sm')}
              </div>

              <span className="text-xs text-[var(--color-text-light)]">
                {(product.rating || 0).toFixed(1)} ({product.numReviews})
              </span>
            </div>
          )}



          {/* Price */}
          <div className="mb-4 flex items-baseline gap-2">
            {hasVariants ? (
              <>
                <span className="text-xs text-[var(--color-text-light)]">
                  From
                </span>
                <span className="text-lg font-bold text-[var(--color-accent-primary)]">
                  £
                  {displayPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-[var(--color-accent-primary)]">
                £  {product.price?.toFixed(2) || '0.00'}
              </span>
            )}
          </div>

         

          {/* Button — NO inner Link anymore */}
          {hasVariants ? (
            <button
              onClick={handleSelectOptions}
              disabled={!isInStock}
              className={`w-full py-2 rounded font-bold text-sm transition-all duration-300 mt-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transform md:translate-y-2 md:group-hover:translate-y-0 shadow-md ${
                isInStock
                  ? 'bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white cursor-pointer'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
            >
              {isInStock ? 'Select Options' : 'Out of Stock'}
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!isInStock}
              className={`w-full py-2 rounded font-bold text-sm transition-all duration-300 mt-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transform md:translate-y-2 md:group-hover:translate-y-0 shadow-md ${
                isInStock
                  ? 'bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white cursor-pointer'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
            >
              {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

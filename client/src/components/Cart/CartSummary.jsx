'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CartSummary = ({
  totalPrice = 0,
  totalQuantity = 0,
  onCheckout,
  onClearCart,
  shippingCost = 0,
  taxCost = 0,
  finalTotal = 0,
  appliedCoupon,
  discountAmount = 0,
  onApplyCoupon,
  onRemoveCoupon
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    await onApplyCoupon(couponCode);
    setIsApplying(false);
  };
  return (
    <div className="rounded-2xl shadow-lg border p-8 sticky top-24 space-y-8" style={{ backgroundColor: 'var(--color-bg-section)', borderColor: 'var(--color-border-light)' }}>
      <h2 className="text-3xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
        <i className="fas fa-box" style={{ color: 'var(--color-accent-primary)' }}></i> Order Summary
      </h2>

      {/* Shipping Info - always free */}
      <div className="border-l-4 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-accent-primary)' }}>
        <div className="flex items-center gap-3 mb-2">
          <i className="fas fa-truck text-xl" style={{ color: 'var(--color-accent-primary)' }}></i>
          <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Free Shipping</p>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Shipping is free for all orders</p>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-4 pb-8" style={{ borderBottomColor: 'var(--color-border-light)' }}>
        <div className="flex justify-between text-base" style={{ borderColor: 'var(--color-border-light)' }}>
          <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>£{(totalPrice || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base">
          <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Shipping</span>
          <span className="font-semibold" style={{ color: (shippingCost || 0) === 0 ? 'var(--color-text-light)' : 'var(--color-text-primary)' }}>
            {(shippingCost || 0) === 0 ? 'FREE' : `£${(shippingCost || 0).toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-base items-center">
          <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>VAT</span>
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded" style={{ backgroundColor: 'var(--color-accent-primary)', color: 'white' }}>0%</span>
        </div>
        
        {/* Discount Row */}
        {(discountAmount || 0) > 0 && (
          <div className="flex justify-between text-base items-center pt-2" style={{ borderTopColor: 'var(--color-border-light)', borderTopWidth: '1px' }}>
            <span className="font-medium flex items-center gap-2" style={{ color: 'var(--color-accent-primary)' }}>
              <i className="fas fa-tag text-sm"></i> Discount
            </span>
            <span className="font-semibold" style={{ color: 'var(--color-accent-primary)' }}>-£{(discountAmount || 0).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Coupon Code Section */}
      {!appliedCoupon ? (
        <div className="space-y-3 pb-6" style={{ borderBottomColor: 'var(--color-border-light)', borderBottomWidth: '1px' }}>
          <label className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Apply Coupon Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border-light)',
                color: 'var(--color-text-primary)'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleApply()}
            />
            <button
              onClick={handleApply}
              disabled={isApplying || !couponCode.trim()}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition duration-300 text-white disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-accent-primary)' }}
              onMouseEnter={(e) => !isApplying && (e.target.style.backgroundColor = 'var(--color-accent-light)')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-accent-primary)')}
            >
              {isApplying ? 'Applying...' : 'Apply'}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-accent-primary)', borderWidth: '2px' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-accent-primary)' }}>✓ Coupon Applied</p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{appliedCoupon.code}</p>
          </div>
          <button
            onClick={onRemoveCoupon}
            className="p-2 rounded-lg transition duration-300"
            style={{ color: 'var(--color-accent-primary)' }}
            onMouseEnter={(e) => e.target.style.opacity = '0.7'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Total */}
      <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Total Items</span>
          <span className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{totalQuantity}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Total Amount</span>
          <span className="text-2xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>£{(finalTotal || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-4 pt-4">
        <button
          onClick={onCheckout}
          className="w-full text-white py-4 rounded-xl font-bold transition duration-300 text-lg transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--color-accent-primary)',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-accent-light)')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-accent-primary)')}
        >
          <i className="fas fa-check"></i> Proceed to Checkout
        </button>

        <button
          onClick={onClearCart}
          className="w-full py-4 rounded-xl font-bold transition duration-300 text-lg"
          style={{
            borderColor: 'var(--color-accent-primary)',
            color: 'var(--color-accent-primary)',
            borderWidth: '2px',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-bg-section)')
          }
          onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
        >
          Clear Cart
        </button>
      </div>

      {/* Trust Badges */}
      {/* <div className="bg-gray-50 p-4 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <i className="fas fa-check text-gray-400"></i>
          <span>Secure checkout</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <i className="fas fa-truck text-gray-400"></i>
          <span>Fast 2-4 day shipping</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <i className="fas fa-check text-gray-400"></i>
          <span>30-day returns</span>
        </div>
      </div> */}
    </div>
  );
};

export default CartSummary;

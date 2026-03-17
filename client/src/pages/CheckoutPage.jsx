'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { clearCart } from '../redux/slices/cartSlice';
import getStripe from '../utils/stripeClient';
import { useRef } from 'react';
import { Helmet } from 'react-helmet-async';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const { items, totalPrice, totalQuantity } = useSelector((state) => state.cart);

  // Get coupon info - Note: In Next.js, use URL params or context instead of location.state
  const appliedCoupon = null;
  const discountAmount = 0;

  // Helper function to check if country is UK
  const isUK = (countryValue) => {
    if (!countryValue) return false;
    const normalized = countryValue.trim().toLowerCase();
    return normalized === 'united kingdom' || normalized === 'uk' || normalized === 'gb';
  };

  // UK postal code validation (basic format check)
  const isValidUKPostalCode = (postcode) => {
    if (!postcode) return false;
    // UK postcodes: flexible regex to handle all formats
    // Examples: SW1A 1AA, B33 8TH, M1 1AE, NW1 6XE, etc
    // Allow space or no space
    const ukPostcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?[A-Z]?\d[A-Z]{2}$/i;
    return ukPostcodeRegex.test(postcode.trim());
  };

  const shippingCost = 0; // Free shipping
  const finalTotal = Math.max(0, (totalPrice || 0) - (discountAmount || 0));

  const API = import.meta.env.VITE_API_URL || '';
  const getImgSrc = (img) => {
    if (!img) return 'https://via.placeholder.com/150';
    if (Array.isArray(img)) {
      const first = img.find((x) => !!x);
      return getImgSrc(first);
    }
    if (typeof img === 'object') {
      const url = img.url || img.secure_url || img.path || img.src || img.public_id || img.location;
      if (!url) return 'https://via.placeholder.com/150';
      return typeof url === 'string' ? (url.startsWith('http') ? url : `${API}${url}`) : 'https://via.placeholder.com/150';
    }
    if (typeof img === 'string') return img.startsWith('http') ? img : `${API}${img}`;
    return 'https://via.placeholder.com/150';
  };

  const renderVariantSummary = (item) => {
    if (!item) return null;
    const parts = [];
    if (item.selectedSize) parts.push(`Size: ${item.selectedSize}`);
    if (item.selectedColor) parts.push(`Color: ${item.selectedColor}`);
    if (item.selectedVariants && typeof item.selectedVariants === 'object') {
      Object.entries(item.selectedVariants).forEach(([k, v]) => {
        if (v) parts.push(`${k}: ${v}`);
      });
    }
    if (parts.length === 0) return null;
    return <div className="text-sm text-gray-900">{parts.join(' / ')}</div>;
  };

  const formatCardNumber = (value) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  // Checkout form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United Kingdom');

  // Card details (we won't persist CVV)
  const [nameOnCard, setNameOnCard] = useState('');

  // Billing address toggle + fields
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingAddress, setBillingAddress] = useState('');
  const [billingApartment, setBillingApartment] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingStateRegion, setBillingStateRegion] = useState('');
  const [billingPostalCode, setBillingPostalCode] = useState('');
  const [billingCountry, setBillingCountry] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  const [saveDetails, setSaveDetails] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [walletAvailable, setWalletAvailable] = useState(false);
  const stripeRef = useRef(null);
  const elementsRef = useRef(null);
  const cardRef = useRef(null);
  const cardMountedRef = useRef(false);
  const paymentRequestButtonRef = useRef(null);

  // Load saved details from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('checkoutSavedInfo') || 'null');
      if (saved) {
        setFirstName(saved.firstName || '');
        setLastName(saved.lastName || '');
        setEmail(saved.email || '');
        setPhone(saved.phone || '');
        setAddress(saved.address || '');
        setApartment(saved.apartment || '');
        setCity(saved.city || '');
        setStateRegion(saved.stateRegion || '');
        setPostalCode(saved.postalCode || '');
        // Only set country if it's UK
        if (saved.country && isUK(saved.country)) {
          setCountry(saved.country);
        } else {
          setCountry('United Kingdom');
        }
        setSaveDetails(true);
      }
    } catch (err) {
    }
  }, []);

  // Initialize Stripe Card Element
  useEffect(() => {
    const setupStripe = async () => {
      try {
        const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        if (!pk) {
          console.error('Stripe publishable key not found');
          return;
        }
        const stripe = await getStripe();
        if (!stripe) {
          console.error('Failed to initialize Stripe');
          return;
        }
        stripeRef.current = stripe;
        const elements = stripeRef.current.elements();
        elementsRef.current = elements;

        if (!cardMountedRef.current) {
          // Use Card Element for better compatibility
          const cardElement = elements.create('card', {
            hidePostalCode: true,
            style: {
              base: {
                fontSize: '16px',
                color: '#000000',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                '::placeholder': {
                  color: '#999999',
                },
              },
              invalid: {
                color: '#EF4444',
                iconColor: '#EF4444',
              },
            },
          });
          const mountElement = document.getElementById('card-element');
          if (mountElement) {
            cardElement.mount('#card-element');
            cardRef.current = cardElement;
            cardMountedRef.current = true;
            console.log('Card Element mounted successfully');

            // Display validation errors
            cardElement.on('change', (e) => {
              const display = document.getElementById('card-errors');
              if (display) {
                display.textContent = e.error ? e.error.message : '';
                display.style.display = e.error ? 'block' : 'none';
              }
            });
          } else {
            console.error('Card element container not found');
          }
        }
      } catch (err) {
        console.error('Stripe setup error:', err);
      }
    };
    setupStripe();
    return () => {
      try {
        if (cardRef.current) cardRef.current.unmount();
      } catch (e) { }
    };
  }, []);

  // Initialize Payment Request API for Google Pay and Apple Pay
  useEffect(() => {
    const initPaymentRequest = async () => {
      if (!stripeRef.current || items.length === 0) return;

      try {
        const paymentRequest = stripeRef.current.paymentRequest({
          country: 'GB',
          currency: 'gbp',
          total: {
            label: 'Total',
            amount: Math.round(finalTotal * 100),
          },
          displayItems: items.map((item) => ({
            label: item.name,
            amount: Math.round(item.price * item.quantity * 100),
          })),
          requestPayerName: true,
          requestPayerEmail: true,
          requestPayerPhone: true,
          requestShipping: true,
          shippingOptions: [
            {
              id: 'free',
              label: 'Free Shipping',
              detail: '2-4 business days',
              amount: 0,
            },
          ],
        });

        // Check if Payment Request is available
        const canMakePayment = await paymentRequest.canMakePayment();
        if (canMakePayment) {
          setPaymentRequest(paymentRequest);
          setWalletAvailable(true);

          // Handle payment method selection
          paymentRequest.on('paymentmethod', async (event) => {
            try {
              setLoading(true);

              // Auto-fill form with wallet data
              if (event.payerName) {
                const nameParts = event.payerName.split(' ');
                setFirstName(nameParts[0] || '');
                setLastName(nameParts.slice(1).join(' ') || '');
              }
              if (event.payerEmail) setEmail(event.payerEmail);
              if (event.payerPhone) setPhone(event.payerPhone);

              if (event.shippingAddress) {
                setAddress(event.shippingAddress.addressLine[0] || '');
                setCity(event.shippingAddress.city || '');
                setStateRegion(event.shippingAddress.region || '');
                setPostalCode(event.shippingAddress.postalCode || '');
                setCountry(event.shippingAddress.country || '');

                // Check if address is in UK
                const countryCode = event.shippingAddress.country || '';
                if (!isUK(countryCode)) {
                  event.complete('fail');
                  toast.error('We currently only deliver to addresses within the United Kingdom');
                  setLoading(false);
                  return;
                }
              }

              // Create order payload
              const payload = {
                orderItems: items.map((i) => ({
                  name: i.name,
                  price: i.price,
                  qty: i.quantity,
                  product: i.product || i._id,
                  image: i.image,
                  variantImage: i.variantImage || null,
                  selectedVariants: i.selectedVariants || null,
                  selectedSize: i.selectedSize || null,
                  selectedColor: i.selectedColor || null,
                  colorCode: i.colorCode || null,
                  variant: i.variant || null,
                  sku: i.sku || null,
                  variantId: i.variantId || i.snapshot?.variantId || null,
                })),
                shippingAddress: {
                  firstName: event.payerName?.split(' ')[0] || firstName,
                  lastName: event.payerName?.split(' ').slice(1).join(' ') || lastName,
                  email: event.payerEmail || email,
                  phone: event.payerPhone || phone,
                  address: event.shippingAddress?.addressLine[0] || address,
                  apartment: '',
                  city: event.shippingAddress?.city || city,
                  state: event.shippingAddress?.region || stateRegion,
                  postalCode: event.shippingAddress?.postalCode || postalCode,
                  country: event.shippingAddress?.country || country,
                },
                paymentMethod: 'digital_wallet',
                itemsPrice: totalPrice,
                taxPrice: 0,
                shippingPrice: 0,
                totalAmount: Number(finalTotal.toFixed(2)),
                couponCode: appliedCoupon?.code || null,
                discountAmount: discountAmount || 0,
              };

              const token = localStorage.getItem('token');
              const res = await fetch(`${API}/api/payments/create-payment-intent`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: 'include',
                body: JSON.stringify(payload),
              });

              const data = await res.json();
              if (!res.ok) {
                event.complete('fail');
                throw new Error(data.error || data.message || 'Failed to create payment intent');
              }

              const clientSecret = data.clientSecret;
              const stripe = stripeRef.current;

              const confirmResult = await stripe.confirmCardPayment(clientSecret, {
                payment_method: event.paymentMethod.id,
              });

              if (confirmResult.error) {
                event.complete('fail');
                throw new Error(confirmResult.error.message || 'Payment confirmation failed');
              }

              if (confirmResult.paymentIntent?.status === 'succeeded') {
                event.complete('success');
                const orderId = data.orderId;
                dispatch(clearCart());
                setShowThankYou(true);
                setTimeout(() => {
                  toast.success('Payment successful');
                  navigate(`/order/${orderId}`);
                }, 1800);
              } else {
                event.complete('fail');
                throw new Error('Payment not completed');
              }
            } catch (err) {
              event.complete('fail');
              toast.error(err.message || 'Payment failed');
              setLoading(false);
            }
          });
        }
      } catch (err) {
        console.error('Payment Request initialization error:', err);
      }
    };

    if (stripeRef.current) {
      initPaymentRequest();
    }
  }, [items, finalTotal, appliedCoupon, discountAmount, dispatch, navigate]);

  // Mount Payment Request Button
  useEffect(() => {
    if (!paymentRequest || !walletAvailable || !elementsRef.current) return;

    try {
      const prButton = elementsRef.current.create('paymentRequestButton', {
        paymentRequest: paymentRequest,
      });

      const container = document.getElementById('payment-request-button');
      if (container && container.children.length === 0) {
        prButton.mount(container);
        paymentRequestButtonRef.current = prButton;
      }
    } catch (err) {
      console.error('Payment Request Button mount error:', err);
    }
  }, [paymentRequest, walletAvailable]);

  // Ensure Stripe Elements are initialized
  const ensureStripeReady = async () => {
    if (stripeRef.current && cardRef.current) return true;
    const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!pk) return false;
    try {
      const stripe = await getStripe();
      if (!stripe) return false;
      stripeRef.current = stripe;

      if (!cardRef.current) {
        const elements = stripeRef.current.elements();
        elementsRef.current = elements;
        const cardElement = elements.create('card', {
          hidePostalCode: true,
          style: {
            base: {
              fontSize: '16px',
              color: '#000000',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              '::placeholder': {
                color: '#999999',
              },
            },
            invalid: {
              color: '#EF4444',
              iconColor: '#EF4444',
            },
          },
        });
        const mountElement = document.getElementById('card-element');
        if (mountElement) {
          cardElement.mount('#card-element');
          cardRef.current = cardElement;
          cardMountedRef.current = true;
          cardElement.on('change', (e) => {
            const display = document.getElementById('card-errors');
            if (display) {
              display.textContent = e.error ? e.error.message : '';
              display.style.display = e.error ? 'block' : 'none';
            }
          });
        }
      }
      return true;
    } catch (err) {
      console.error('Stripe ready error:', err);
      return false;
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !address || !city || !postalCode || !stateRegion) {
      toast.error('Please complete all required fields');
      return;
    }

    // Debug logging
    console.log('Country value:', country);
    console.log('isUK result:', isUK(country));
    console.log('Postal code:', postalCode);
    console.log('Postal code valid:', isValidUKPostalCode(postalCode));

    // UK only validation
    if (!isUK(country)) {
      toast.error(`We currently only deliver to addresses within the United Kingdom (You selected: ${country})`);
      return;
    }

    // UK postal code format validation
    if (!isValidUKPostalCode(postalCode)) {
      toast.error('Please enter a valid UK postal code (e.g., SW1A 1AA or B33 8TH)');
      return;
    }

    const shippingAddress = {
      firstName,
      lastName,
      email,
      phone,
      address,
      apartment,
      city,
      state: stateRegion,
      postalCode,
      country,
    };

    const orderData = {
      orderItems: items.map((i) => ({ product: i._id, qty: i.quantity, price: i.price, name: i.name, image: i.image })),
      shippingAddress,
      paymentMethod,
      // minimal paymentDetails: only store name on card when needed (we use Elements)
      paymentDetails: { nameOnCard },
      itemsPrice: totalPrice,
      taxPrice: 0,
      shippingPrice: Number(shippingCost.toFixed(2)),
      totalAmount: Number(finalTotal.toFixed(2)),
      couponCode: appliedCoupon?.code || null,
      discountAmount: discountAmount || 0,
    };

    try {
      setLoading(true);

      // Save non-card details to localStorage if requested
      if (saveDetails) {
        const toSave = { firstName, lastName, email, phone, address, apartment, city, stateRegion, postalCode, country: 'United Kingdom' };
        localStorage.setItem('checkoutSavedInfo', JSON.stringify(toSave));
      } else {
        localStorage.removeItem('checkoutSavedInfo');
      }

      // Build payload for server which will create an Order and a Stripe Checkout session
      const payload = {
        orderItems: items.map((i) => ({
          name: i.name,
          price: i.price,
          qty: i.quantity,
          product: i.product || i._id,
          image: i.image,
          variantImage: i.variantImage || null,
          // variant snapshot fields (if present)
          selectedVariants: i.selectedVariants || null,
          selectedSize: i.selectedSize || null,
          selectedColor: i.selectedColor || null,
          colorCode: i.colorCode || null,
          variant: i.variant || null,
          sku: i.sku || null,
          variantId: i.variantId || i.snapshot?.variantId || null,
        })),
        shippingAddress: {
          address,
          apartment,
          city,
          stateRegion,
          postalCode,
          country,
          firstName,
          lastName,
          email,
          phone,
        },
        billingAddress: billingOpen ? {
          address: billingAddress,
          apartment: billingApartment,
          city: billingCity,
          stateRegion: billingStateRegion,
          postalCode: billingPostalCode,
          country: billingCountry,
        } : null,
        paymentMethod,
        itemsPrice: totalPrice,
        taxPrice: 0,
        shippingPrice: Number(shippingCost.toFixed(2)),
        totalAmount: Number(finalTotal.toFixed(2)),
        couponCode: appliedCoupon?.code || null,
        discountAmount: discountAmount || 0,
      };

      // Try to ensure Stripe Elements are ready; if not available, fall back to hosted Stripe Checkout
      const stripeReady = await ensureStripeReady();
      if (!stripeReady) {
        // fallback: create hosted Checkout session
        const token = localStorage.getItem('token');
        const resSession = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include', // Send httpOnly cookies
          body: JSON.stringify(payload),
        });
        const sessionData = await resSession.json();
        if (!resSession.ok) throw new Error(sessionData.error || sessionData.message || 'Failed to create checkout session');
        if (sessionData && sessionData.url) {
          window.location.href = sessionData.url;
          return;
        }
        throw new Error('No checkout URL from server');
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include', // Send httpOnly cookies
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || data.message || 'Failed to create payment intent';
        throw new Error(msg);
      }

      const clientSecret = data.clientSecret;
      if (!clientSecret) throw new Error('Missing clientSecret from payment API');

      const stripe = stripeRef.current;
      const cardElement = cardRef.current;
      if (!stripe || !cardElement) throw new Error('Stripe Card Element not initialized');

      // Use confirmCardPayment for Card Element
      const confirmResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${firstName} ${lastName}`.trim() || undefined,
            email: email || undefined,
            phone: phone || undefined,
            address: {
              line1: address || undefined,
              city: city || undefined,
              state: stateRegion || undefined,
              postal_code: postalCode || undefined,
              country: country === 'United Kingdom' ? 'GB' : country.toUpperCase().slice(0, 2),
            },
          },
        },
      });

      if (confirmResult.error) {
        throw new Error(confirmResult.error.message || 'Payment confirmation failed');
      }

      // For Card Element, confirmCardPayment returns paymentIntent
      if (confirmResult.paymentIntent) {
        if (confirmResult.paymentIntent.status === 'succeeded') {
          // Payment succeeded; clear cart, show thank you, then navigate to order page
          const orderId = data.orderId;
          dispatch(clearCart());
          // show a friendly message before redirect
          setShowThankYou(true);
          setTimeout(() => {
            toast.success('Payment successful');
            navigate(`/order/${orderId}`);
          }, 1800);
        } else if (confirmResult.paymentIntent.status === 'requires_action') {
          // Additional authentication required (3D Secure, etc.)
          throw new Error('Payment requires additional authentication. Please complete the verification.');
        } else {
          throw new Error('Payment not completed. Status: ' + confirmResult.paymentIntent.status);
        }
      } else {
        throw new Error('No payment intent returned');
      }
    } catch (err) {
      toast.error(err.message || 'Error creating Stripe session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Secure Checkout | Wolf Supplies</title>
        <meta name="description" content="Complete your purchase securely at Wolf Supplies. Fast checkout with credit card, Apple Pay, or Google Pay. Fast UK delivery." />
        <meta name="keywords" content="checkout, payment, order, secure, Wolf Supplies" />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://wolfsupplies.co.uk/checkout" />
        <meta property="og:title" content="Secure Checkout | Wolf Supplies" />
        <meta property="og:description" content="Complete your purchase securely with multiple payment options." />
        <meta property="og:url" content="https://wolfsupplies.co.uk/checkout" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Secure Checkout | Wolf Supplies" />
        <meta name="twitter:description" content="Complete your purchase securely." />
      </Helmet>
      <div className="min-h-screen bg-[var(--color-bg-section)] py-12 px-4 sm:px-6 lg:px-8">
        {showThankYou && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-[var(--color-bg-primary)] rounded-lg p-6 shadow-lg max-w-md w-full text-center">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Thank you!</h2>
              <p className="text-[var(--color-text-light)] mb-4">Your order has been placed successfully.</p>
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-[var(--color-bg-primary)] rounded-2xl shadow p-8 space-y-6">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Contact </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="border border-[var(--color-border-light)] p-3 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]" />
                <input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="border border-[var(--color-border-light)] p-3 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]" />
                <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-[var(--color-border-light)] p-3 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] md:col-span-2" />
                <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="border border-[var(--color-border-light)] p-3 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] md:col-span-2" />
              </div>

              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Address (street)" value={address} onChange={(e) => setAddress(e.target.value)} className="border border-[var(--color-border-light)] p-3 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] md:col-span-2" />
                <input placeholder="Apt, suite (optional)" value={apartment} onChange={(e) => setApartment(e.target.value)} className="border border-[var(--color-border-light)] p-3 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]" />
                <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="border border-[var(--color-border-light)] p-3 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]" />
                <input placeholder="State / Region" value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} className="border border-[var(--color-border-light)] p-3 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]" />
                <input type="text" placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value.toUpperCase())} className="border border-[var(--color-border-light)] p-3 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]" />
                <p className="text-xs text-[var(--color-text-light)] mt-1">Example: SW1A 1AA or B33 8TH</p>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="border border-[var(--color-border-light)] p-3 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
                  <option value="United Kingdom">United Kingdom</option>
                </select>
              </div>
              <div className="mt-2 p-3 bg-[var(--color-bg-section)] rounded border border-[var(--color-border-light)]">
                <p className="text-sm text-[var(--color-text-light)]">
                  <span className="font-semibold text-[var(--color-accent-primary)]">ℹ️ UK Orders Only:</span> We currently only deliver to addresses within the United Kingdom.
                </p>
              </div>

              <div className="mt-3">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={billingOpen} onChange={(e) => setBillingOpen(e.target.checked)} />
                  <span className="text-sm text-[var(--color-text-light)]">Add separate billing address</span>
                </label>
              </div>
              {billingOpen && (
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <input placeholder="Billing address (street)" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} className="border border-[var(--color-border-light)] p-3 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]" />
                  <input placeholder="Apt, suite (optional)" value={billingApartment} onChange={(e) => setBillingApartment(e.target.value)} className="border border-[var(--color-border-light)] p-3 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input placeholder="City" value={billingCity} onChange={(e) => setBillingCity(e.target.value)} className="border border-[var(--color-border-light)] p-3 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]" />
                    <input placeholder="State / Region" value={billingStateRegion} onChange={(e) => setBillingStateRegion(e.target.value)} className="border border-[var(--color-border-light)] p-3 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]" />
                    <input type="text" placeholder="Postal Code" value={billingPostalCode} onChange={(e) => setBillingPostalCode(e.target.value.toUpperCase())} className="border border-[var(--color-border-light)] p-3 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]" />
                    <input placeholder="Country" value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} className="border border-[var(--color-border-light)] p-3 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]" />
                  </div>
                </div>
              )}
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Payment</h2>
              <div className="space-y-4">
                {walletAvailable && (
                  <div className="p-4 border-2 border-[var(--color-border-light)] rounded-lg bg-[var(--color-bg-section)]">
                    <p className="text-sm text-[var(--color-text-light)] mb-3">Express Checkout</p>
                    <div id="payment-request-button"></div>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-[var(--color-border-light)]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[var(--color-bg-primary)] text-[var(--color-text-light)]">Or pay with card</span>
                  </div>
                </div>

                <div className="">
                  <input placeholder="Name on card" value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)} className="border border-[var(--color-border-light)] p-3 w-full rounded bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]" />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-[var(--color-text-light)] mb-2">Card details</label>
                  <div id="card-element" className="border-2 border-[var(--color-border-light)] p-4 rounded-lg bg-[var(--color-bg-primary)] min-h-12 focus-within:border-[var(--color-accent-primary)] focus-within:ring-2 focus-within:ring-[var(--color-accent-primary)] focus-within:ring-opacity-30 transition-all duration-200"></div>
                  <div id="card-errors" role="alert" className="text-red-500 text-sm mt-2 font-medium"></div>
                </div>
                <div className="flex items-center gap-3">
                  <input id="saveDetails" type="checkbox" checked={saveDetails} onChange={(e) => setSaveDetails(e.target.checked)} />
                  <label htmlFor="saveDetails" className="text-sm text-[var(--color-text-light)]">Save my details for future purchases</label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-[var(--color-bg-primary)] rounded-2xl shadow p-6 space-y-6 sticky top-24">
              <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Order Summary</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((i) => (
                  <div key={i._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={getImgSrc(i.image)} alt={i.name} className="w-12 h-12 object-cover rounded" />
                      <div>
                        <div className="font-medium">{i.name}</div>
                        {renderVariantSummary(i)}
                        <div className="text-sm text-gray-900 mt-1">Qty: {i.quantity}</div>
                      </div>
                    </div>
                    <div className="font-semibold">£{(i.price * i.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm text-gray-600"><span>Items</span><span>£{totalPrice.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-gray-600"><span>Shipping</span><span>£0.00</span></div>
                <div className="flex justify-between text-sm text-gray-600"><span>VAT</span><span>£0.00</span></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-semibold">
                    <span>Discount {appliedCoupon?.code ? `(${appliedCoupon.code})` : ''}</span>
                    <span>-£{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-[var(--color-text-primary)]"><span>Total</span><span>£{finalTotal.toFixed(2)}</span></div>
              </div>

              <button onClick={handlePlaceOrder} disabled={loading} className="w-full bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-light)] text-white py-3 rounded-lg font-bold shadow transition duration-300">
                {loading ? 'Placing Order…' : `Place Order — £${finalTotal.toFixed(2)}`}
              </button>

              <p className="text-xs text-[var(--color-text-light)]">We do not store your CVV. Saved details are stored locally in your browser.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;

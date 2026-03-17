const Cart = require('../models/Cart');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const EventLog = require('../models/EventLog');

// In-memory cache to prevent duplicate cart updates within 1 second
const cartUpdateCache = new Map();
const CACHE_TTL = 1000; // 1 second

// GET /api/cart - get cart by guestId (or user if authenticated)
const getCart = asyncHandler(async (req, res) => {

  try {
    const guestId = req.guestId;
    const userId = req.user?._id;

    // Try to find cart by user ID first (if authenticated), then by guestId
    let cart = null;
    if (userId) {

      cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price image');
    } else if (guestId) {

      cart = await Cart.findOne({ guestId }).populate('items.product', 'name price image');

    }

    // Build response with guestId so client can sync localStorage
    const cartData = cart ? {
      _id: cart._id,
      user: cart.user || undefined,
      guestId: cart.guestId,
      items: cart.items,
      updatedAt: cart.updatedAt
    } : { items: [] };

    res.json({
      ...cartData,
      _guestId: guestId
    });
  } catch (err) {
    console.error('[Cart Controller] Error fetching cart:', err.message, err.stack);
    throw err;
  }
});

// POST /api/cart - update/create cart for guestId or user
const updateCart = asyncHandler(async (req, res) => {

  const guestId = req.guestId;
  const userId = req.user?._id;
  const { items } = req.body;

  if (!Array.isArray(items)) {
    res.status(400);
    throw new Error('Cart items must be an array');
  }

  // Check cache to prevent duplicate updates in quick succession
  const cacheKey = userId ? `user-${userId}` : `guest-${guestId}`;
  const cachedContent = cartUpdateCache.get(cacheKey);
  const currentContent = JSON.stringify(items);

  if (cachedContent === currentContent) {
    return res.json({
      message: 'Cart already up to date',
      items,
      skipped: true
    });
  }

  // Update cache and set expiry
  cartUpdateCache.set(cacheKey, currentContent);
  setTimeout(() => cartUpdateCache.delete(cacheKey), CACHE_TTL);

  // Load or create cart
  let cart = null;
  if (userId) {
    cart = await Cart.findOne({ user: userId });
    if (!cart) {

      cart = new Cart({ user: userId, items: [] });
    }
  } else if (guestId) {
    cart = await Cart.findOne({ guestId });
    if (!cart) {
      cart = new Cart({ guestId, items: [] });
    } else {
    }
  } else {

    res.status(400);
    throw new Error('No user identification available');
  }

  // Replace cart items entirely with incoming items (client is source of truth for full cart)
  const serverItems = [];
  for (const incoming of items) {
    if (!incoming) {

      continue;
    }

    let productId = incoming.product;
    if (productId && typeof productId === 'string' && mongoose.Types.ObjectId.isValid(productId)) {
      productId = new mongoose.Types.ObjectId(productId);
    } else {
      productId = productId || undefined;
    }

    serverItems.push({
      product: productId || incoming.product,
      name: incoming.name || '',
      quantity: Math.max(1, parseInt(incoming.quantity) || 1),
      price: Number(incoming.price || 0),
      selectedVariants: incoming.selectedVariants || {},
      image: incoming.image || '',
    });
  }

  cart.items = serverItems;
  cart.updatedAt = new Date();
  try {
    const saved = await cart.save();
    await saved.populate('items.product', 'name price image');

    const response = {
      _id: saved._id,
      user: saved.user || undefined,
      guestId: saved.guestId,
      items: saved.items,
      updatedAt: saved.updatedAt,
      _guestId: guestId
    };

    res.json(response);
  } catch (err) {
    console.error('[Cart Controller] Error saving cart:', err.message);
    throw err;
  }
});

// DELETE /api/cart - clear cart (by guestId or user)
const clearCart = asyncHandler(async (req, res) => {
  const guestId = req.guestId;
  const userId = req.user?._id;

  let query = {};
  if (userId) {
    query = { user: userId };
  } else {
    query = { guestId };
  }

  const cart = await Cart.findOneAndUpdate(query, { items: [] }, { new: true });
  res.json(cart || { items: [] });
});

module.exports = {
  getCart,
  updateCart,
  clearCart
};


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Use environment variable or fallback to current origin for API
const API = import.meta.env.VITE_API_URL || window.location.origin;

const buildCartItemId = (itemLike) => {
  if (!itemLike) return '';

  const productId =
    itemLike.product ||
    (typeof itemLike._id === 'string' ? itemLike._id.split('|')[0] : '') ||
    '';

  const parts = [productId];
  parts.push(`size:${itemLike.selectedSize || ''}`);
  parts.push(`color:${itemLike.selectedColor || ''}`);

  const variants = itemLike.selectedVariants && typeof itemLike.selectedVariants === 'object'
    ? itemLike.selectedVariants
    : {};
  const variantParts = Object.keys(variants)
    .sort()
    .map((key) => `${key}:${variants[key]}`);
  parts.push(`vars:${variantParts.join(',')}`);

  return parts.join('|');
};

const normalizeCartItem = (it) => {
  const product = it.product || null;
  const productId = (product && (product._id || product.id)) || it.product || '';
  const normalized = {
    product: productId,
    name: it.name || (product && product.name) || '',
    price: Number(it.price ?? (product && product.price) ?? 0),
    image: it.image || (product && (product.image || (product.images && product.images[0]))) || '',
    variantImage: it.variantImage || null,
    quantity: it.quantity || 1,
    selectedVariants: it.selectedVariants || {},
    selectedSize: it.selectedSize || null,
    selectedColor: it.selectedColor || null,
    variant: it.variant || null,
    sku: it.sku || null,
    colorCode: it.colorCode || null,
  };

  return {
    _id: buildCartItemId({ ...normalized, _id: it._id || productId }),
    ...normalized,
  };
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, thunkAPI) => {
  const token = localStorage.getItem('token');
  try {
    // Fetch from server with or without token (server handles both via guestId or userId)
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const url = `${API}/api/cart`;
    const res = await axios.get(url, { headers });
    const data = res.data;
    const items = (data.items || []).map(normalizeCartItem);
    // Store in localStorage as fallback
    localStorage.setItem('cart_fallback', JSON.stringify(items));
    return items;
  } catch (err) {
    console.error('Error fetching cart from server:', err.message);
    // Try to restore from localStorage fallback
    try {
      const fallback = localStorage.getItem('cart_fallback');
      if (fallback) {
        console.log('📦 Restoring cart from localStorage fallback');
        return JSON.parse(fallback);
      }
    } catch (parseErr) {
      console.error('Error parsing fallback cart:', parseErr);
    }
    return [];
  }
});

export const syncCart = createAsyncThunk('cart/syncCart', async (items, thunkAPI) => {
  const token = localStorage.getItem('token');

  try {
    const extractProductId = (it) => {
      if (!it) return undefined;
      if (it.product) return it.product;
      if (typeof it._id === 'string') {
        const candidate = it._id.includes('|') ? it._id.split('|')[0] : it._id;
        return candidate;
      }
      return undefined;
    };

    // Deduplicate items: combine items with same product + variants
    const deduped = {};
    for (const it of (items || [])) {
      const productId = extractProductId(it);
      const variantKey = JSON.stringify({
        product: productId,
        size: it.selectedSize || '',
        color: it.selectedColor || '',
        variants: it.selectedVariants || {}
      });

      if (deduped[variantKey]) {
        deduped[variantKey].quantity += it.quantity || 1;
      } else {
        deduped[variantKey] = {
          product: productId || undefined,
          name: it.name,
          quantity: it.quantity || 1,
          price: it.price,
          selectedVariants: it.selectedVariants || {},
          selectedSize: it.selectedSize || null,
          selectedColor: it.selectedColor || null,
          image: it.image || '',
          variantImage: it.variantImage || null,
          variant: it.variant || null,
          sku: it.sku || null,
          colorCode: it.colorCode || null,
        };
      }
    }

    const serverItems = Object.values(deduped);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const payload = { items: serverItems };
    const url = `${API}/api/cart`;

    const res = await axios.post(url, payload, { headers });
    const data = res.data;

    // Normalize returned items to client shape
    const returned = (data.items || []).map(normalizeCartItem);
    // Store in localStorage as fallback
    localStorage.setItem('cart_fallback', JSON.stringify(returned));
    return returned;
  } catch (err) {
    console.error('❌ Error syncing cart to server:', err.message);
    // Update localStorage with current items on error
    localStorage.setItem('cart_fallback', JSON.stringify(items));
    return items;
  }
});

export const clearServerCart = createAsyncThunk('cart/clearServerCart', async (_, thunkAPI) => {
  const token = localStorage.getItem('token');

  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const url = `${API}/api/cart`;
    const res = await axios.delete(url, {
      headers
    });
    const data = res.data;
    return data.items || [];
  } catch (err) {
    return [];
  }
});

// Add item to cart on server immediately (similar to wishlist's addItemToServer)
export const addItemToServer = createAsyncThunk('cart/addItemToServer', async (payload, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Get current cart from Redux state to send full cart
    return payload; // Payload should contain the new item to add
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// Remove item from cart on server immediately (similar to wishlist's removeItemFromServer)
export const removeItemFromServer = createAsyncThunk('cart/removeItemFromServer', async (itemId, { rejectWithValue, getState }) => {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Get current cart state
    const state = getState();
    const currentItems = state.cart?.items || [];

    // Filter out the item being removed
    const updatedItems = currentItems.filter(item => item._id !== itemId);

    // Send updated cart to server
    const payload = { items: updatedItems };
    const url = `${API}/api/cart`;
    const res = await axios.post(url, payload, { headers });
    const data = res.data;

    // Normalize returned items
    const returned = (data.items || []).map(normalizeCartItem);
    return returned;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// New thunk to validate cart items - check if products still exist in database
export const validateCartItems = createAsyncThunk('cart/validateCartItems', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const cartItems = state.cart?.items || [];

    if (cartItems.length === 0) {
      return [];
    }

    // Extract unique product IDs from cart
    const productIds = [...new Set(cartItems.map(item => item.product || item._id).filter(Boolean))];

    if (productIds.length === 0) {
      return [];
    }

    // Check which products still exist in database
    const response = await axios.post(`${API}/api/products/validate`, { productIds });
    const responseData = response.data || {};
    const validList = Array.isArray(responseData.validProducts)
      ? responseData.validProducts
      : Array.isArray(responseData.valid)
        ? responseData.valid
        : Array.isArray(responseData)
          ? responseData
          : [];
    const validProductIds = new Set(validList);

    // Filter cart items - keep only those with valid products
    const validItems = cartItems.filter(item => {
      const productId = item.product || item._id;
      return validProductIds.has(productId);
    });

    // If items were removed, notify via localStorage
    if (validItems.length < cartItems.length) {
      const removedCount = cartItems.length - validItems.length;
      localStorage.setItem('cart_validation_removed', JSON.stringify({
        count: removedCount,
        timestamp: new Date().toISOString()
      }));
    }

    return validItems;
  } catch (err) {
    console.error('Error validating cart items:', err);
    // If validation fails, return current items (don't break the app)
    return getState().cart?.items || [];
  }
});

const initialState = {
  items: [],
  totalPrice: 0,
  totalQuantity: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : [];
      state.items = items.map((i) => ({ ...i, quantity: i.quantity || 1 }));
      state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
      state.totalPrice = state.items.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0);
      // Persist to localStorage
      localStorage.setItem('cart_fallback', JSON.stringify(state.items));
    },
    addToCart: (state, action) => {
      const item = action.payload;

      // Helper to check if two items are the same (same product + same variants)
      const isSameItem = (a, b) => {
        if (!a || !b) return false;
        if ((a.product || a._id) !== (b.product || b._id)) return false;
        if ((a.selectedSize || '') !== (b.selectedSize || '')) return false;
        if ((a.selectedColor || '') !== (b.selectedColor || '')) return false;
        const va = a.selectedVariants || {};
        const vb = b.selectedVariants || {};
        const ka = Object.keys(va).sort();
        const kb = Object.keys(vb).sort();
        if (ka.length !== kb.length) return false;
        for (let i = 0; i < ka.length; i++) {
          if (ka[i] !== kb[i] || String(va[ka[i]]) !== String(vb[kb[i]])) return false;
        }
        return true;
      };

      const existingItem = state.items.find((i) => isSameItem(i, item));

      if (existingItem) {
        existingItem.quantity += item.quantity || 1;
      } else {
        state.items.push({ ...item, quantity: item.quantity || 1 });
      }

      state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
      state.totalPrice = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      // Persist to localStorage
      localStorage.setItem('cart_fallback', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
      state.totalPrice = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      // Persist to localStorage
      localStorage.setItem('cart_fallback', JSON.stringify(state.items));
    },
    updateCartItem: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i._id === id);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i._id !== id);
        } else {
          item.quantity = quantity;
        }
      }

      state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
      state.totalPrice = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      // Persist to localStorage
      localStorage.setItem('cart_fallback', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
      state.totalQuantity = 0;
      // Clear from localStorage
      localStorage.removeItem('cart_fallback');
    },
    setCartFromLocalStorage: (state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : [];
      state.items = items.map((i) => ({ ...i, quantity: i.quantity || 1 }));
      state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
      state.totalPrice = state.items.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        const items = Array.isArray(action.payload) ? action.payload : [];
        state.items = items.map((i) => ({ ...i, quantity: i.quantity || 1 }));
        state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
        state.totalPrice = state.items.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0);
        // Persist to localStorage
        localStorage.setItem('cart_fallback', JSON.stringify(state.items));
      })
      .addCase(syncCart.fulfilled, (state, action) => {
        const items = Array.isArray(action.payload) ? action.payload : [];
        state.items = items.map((i) => ({ ...i, quantity: i.quantity || 1 }));
        state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
        state.totalPrice = state.items.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0);
        // Persist to localStorage
        localStorage.setItem('cart_fallback', JSON.stringify(state.items));
      })
      .addCase(removeItemFromServer.fulfilled, (state, action) => {
        const items = Array.isArray(action.payload) ? action.payload : [];
        state.items = items.map((i) => ({ ...i, quantity: i.quantity || 1 }));
        state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
        state.totalPrice = state.items.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0);
        // Persist to localStorage
        localStorage.setItem('cart_fallback', JSON.stringify(state.items));
      })
      .addCase(clearServerCart.fulfilled, (state, action) => {
        state.items = [];
        state.totalPrice = 0;
        state.totalQuantity = 0;
      })
      .addCase(validateCartItems.fulfilled, (state, action) => {
        const items = Array.isArray(action.payload) ? action.payload : [];
        state.items = items.map((i) => ({ ...i, quantity: i.quantity || 1 }));
        state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
        state.totalPrice = state.items.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0);
        // Persist to localStorage
        localStorage.setItem('cart_fallback', JSON.stringify(state.items));
      });
  },
});

export const { setCart, addToCart, removeFromCart, updateCartItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

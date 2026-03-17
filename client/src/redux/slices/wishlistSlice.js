// Backup of client wishlist slice

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

const initialState = {
  items: [],
  totalItems: 0,
  loading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');

    // Fetch from server with or without token (server handles both via guestId or userId)
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${API}/api/wishlist`, {
      headers,
    });
    const data = res.data;
// normalize items: prefer snapshot if present, otherwise product
    const items = (data.items || []).map((it) => {
      if (it.snapshot) {
        // ensure snapshot has product id and keep populated product for availability checks
        const pid = (it.product && it.product._id) || it.snapshot._id || null;
return { ...it.snapshot, _id: pid || it.snapshot._id, __isSnapshot: true, product: it.product || null };
      }
      if (it.product) {
return { ...it.product, __isSnapshot: false };
      }
      return it;
    });
return items;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addItemToServer = createAsyncThunk('wishlist/addItemToServer', async (payload, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');

    // Sync to server for both authenticated AND guest users
    let body = {};
    if (typeof payload === 'string') body.productId = payload;
    else body = payload || {};

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.post(`${API}/api/wishlist`, body, { headers });
const data = res.data;
    // normalize return items like fetchWishlist
    const items = (data.items || []).map((it) => {
      if (it.snapshot) {
        const pid = (it.product && it.product._id) || it.snapshot._id || null;
return { ...it.snapshot, _id: pid || it.snapshot._id, __isSnapshot: true, product: it.product || null };
      }
      if (it.product) {
return { ...it.product, __isSnapshot: false };
      }
      return it;
    });
    return items;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const removeItemFromServer = createAsyncThunk('wishlist/removeItemFromServer', async (payload, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');

    // Sync to server for both authenticated AND guest users
    let productId = null;
    let variantId = null;
    if (typeof payload === 'string') productId = payload;
    else if (payload && typeof payload === 'object') {
      productId = payload.productId;
      variantId = payload.variantId;
    }

    if (!productId) throw new Error('productId is required to remove wishlist item');
let url = variantId ? `${API}/api/wishlist/${productId}?variantId=${encodeURIComponent(variantId)}` : `${API}/api/wishlist/${productId}`;
const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.delete(url, { headers });
const data = res.data;
    // normalize items similar to fetchWishlist / addItemToServer
    const items = (data.items || []).map((it) => {
if (it.snapshot) {
        // Get product ID from the product object reference
        const pid = (it.product && it.product._id) || it.snapshot._id || null;
return { 
          ...it.snapshot, 
          _id: pid || it.snapshot._id, 
          __isSnapshot: true, 
          product: it.product || null 
        };
      }
      if (it.product) {
return { ...it.product, __isSnapshot: false };
      }
      return it;
    });
return items;
  } catch (err) {
return rejectWithValue(err.message);
  }
});

export const clearWishlistServer = createAsyncThunk('wishlist/clearWishlistServer', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');

    // Clear server wishlist for both authenticated AND guest users
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.delete(`${API}/api/wishlist`, { headers });
    return [];
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      let item = action.payload;
      if (!item) return;
      // If payload is { productId, snapshot }
      if (item.snapshot) {
        const pid = item.productId || item._id || (item.product && item.product._id) || null;
        const existing = state.items.find((i) => i._id === pid && i.__isSnapshot && i.variantId && item.snapshot.variantId && String(i.variantId) === String(item.snapshot.variantId));
        if (!existing) {
          const entry = { ...item.snapshot, _id: pid || item.snapshot._id, __isSnapshot: true };
          // keep variantId as top-level for easier checks
          if (item.snapshot.variantId) entry.variantId = item.snapshot.variantId;
          state.items.push(entry);
          state.totalItems = state.items.length;
        }
        return;
      }

      // If payload is a plain product object, store as product-like entry
      if (item.product) item = item.product;
      if (typeof item === 'string') {
        const existing = state.items.find((i) => i._id === item);
        if (!existing) {
          state.items.push({ _id: item });
          state.totalItems = state.items.length;
        }
        return;
      }

      const existingItem = state.items.find((i) => i._id === item._id && !i.__isSnapshot);
      if (!existingItem) {
        state.items.push({ ...item, __isSnapshot: false });
        state.totalItems = state.items.length;
      }
    },
    removeFromWishlist: (state, action) => {
      const payload = action.payload;
      // Support removing by id string or by { productId, variantId }
      if (!payload) return;
      if (typeof payload === 'string') {
        state.items = state.items.filter((item) => item._id !== payload);
      } else if (typeof payload === 'object' && payload.productId) {
        const { productId, variantId } = payload;
        if (variantId) {
          // remove only matching snapshot entries
          state.items = state.items.filter((item) => {
            const isSnapshot = item.__isSnapshot || !!item.variantId || !!item.snapshot;
            if (!isSnapshot) return true; // keep non-snapshot items
            const pid = item.productId || (item.product && (item.product._id || item.product)) || item._id;
            const itemVariant = item.variantId || (item.snapshot && item.snapshot.variantId) || null;
            return !(String(pid) === String(productId) && String(itemVariant) === String(variantId));
          });
        } else {
          // remove all entries for this product
          state.items = state.items.filter((item) => {
            const pid = item.productId || (item.product && (item.product._id || item.product)) || item._id;
            return String(pid) !== String(productId);
          });
        }
      }
      state.totalItems = state.items.length;
    },
    clearWishlist: (state) => {
      state.items = [];
      state.totalItems = 0;
    },
    setWishlist: (state, action) => {
      state.items = action.payload || [];
      state.totalItems = state.items.length;
    },
    isInWishlist: (state, action) => {
      return state.items.some((i) => i._id === action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.totalItems = state.items.length;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addItemToServer.fulfilled, (state, action) => {
        state.items = action.payload;
        state.totalItems = state.items.length;
        state.loading = false;
      })
      .addCase(addItemToServer.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(removeItemFromServer.fulfilled, (state, action) => {
        state.items = action.payload;
        state.totalItems = state.items.length;
        state.loading = false;
      })
      .addCase(removeItemFromServer.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(clearWishlistServer.fulfilled, (state) => {
        state.items = [];
        state.totalItems = 0;
        state.loading = false;
      })
      .addCase(clearWishlistServer.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist, setWishlist, isInWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

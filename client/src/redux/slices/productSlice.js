import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

const initialState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  // Simple client-side cache flag so we don't refetch products
  hasLoaded: false,
  filters: {
    category: '',
    price: { min: 0, max: 10000 },
    search: '',
    sort: '',
  },
};

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (options = {}, { getState, rejectWithValue }) => {
    try {
      const { limit = 10000, category = '', search = '', force = false } = options;
      const state = getState();
      const existing = state.product;

      // If we've already loaded products once this session, reuse them (unless searching/filtering by specific category)
      // When fetching for specific category, always fetch to ensure we get the right products
      if (!force && !category && !search && existing?.hasLoaded && Array.isArray(existing.products) && existing.products.length > 0 && existing.products.length >= limit) {
        return existing.products;
      }

      // Build query params
      const params = new URLSearchParams();
      params.append('limit', limit);
      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const response = await axios.get(`${API}/api/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchProductById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API}/api/products/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'product/fetchProductBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      try {
        const response = await axios.get(`${API}/api/products/slug/${encodeURIComponent(slug)}`);
        return response.data;
      } catch (error) {
        if (error.response?.status === 404) {
          const response = await axios.get(`${API}/api/products/${encodeURIComponent(slug)}`);
          return response.data;
        }
        throw error;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    hydrateProduct: (state, action) => {
      state.product = action.payload;
      state.error = null;
    },
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        price: { min: 0, max: 10000 },
        search: '',
        sort: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.hasLoaded = true;
        // API returns either an array or an object { products, page, pages }
        state.products = action.payload.products || action.payload || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      builder
      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.product = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { hydrateProduct, setFilter, clearFilters } = productSlice.actions;
export default productSlice.reducer;

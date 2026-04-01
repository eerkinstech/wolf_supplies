import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

const initialState = {
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,
  // Cache flag to avoid refetching categories on every mount
  hasLoaded: false,
  searchQuery: '',
  mainCategories: [],
};

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (options = {}, { getState, rejectWithValue }) => {
    try {
      const { force = false } = options;
      const state = getState();
      const existing = state.category;

      // If categories are already loaded once, reuse them instead of hitting the API again
      if (!force && existing?.hasLoaded && Array.isArray(existing.categories) && existing.categories.length > 0) {
        return existing.categories;
      }

      const response = await axios.get(`${API}/api/categories`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchCategoryBySlug = createAsyncThunk(
  'category/fetchCategoryBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      if (!slug) {
        return rejectWithValue('Missing category identifier');
      }

      const ident = String(slug);
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(ident);

      const url = isObjectId
        ? `${API}/api/categories/${ident}`
        : `${API}/api/categories/slug/${encodeURIComponent(ident)}`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearchQuery: (state) => {
      state.searchQuery = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.hasLoaded = true;
        // Normalize payload: API may return an array or an object { categories: [...] }
        if (Array.isArray(action.payload)) {
          state.categories = action.payload;
        } else if (action.payload && Array.isArray(action.payload.categories)) {
          state.categories = action.payload.categories;
        } else {
          state.categories = [];
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategoryBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategoryBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchQuery, clearSearchQuery } = categorySlice.actions;
export default categorySlice.reducer;

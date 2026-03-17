import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Always use the backend directly at localhost:5000
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('[orderSlice] API base:', API, 'DEV mode:', import.meta.env.DEV);

const initialState = {
  orders: [],
  order: null,
  loading: false,
  error: null,
  // Cache flag so we don't refetch all orders on every dashboard visit
  hasLoaded: false,
};

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const existing = state.order;

      // If we've already loaded orders once, reuse them instead of hitting the API again
      if (existing?.hasLoaded && Array.isArray(existing.orders) && existing.orders.length > 0) {
        console.log('[fetchOrders] Using cached orders:', existing.orders);
        return existing.orders;
      }

      const token = localStorage.getItem('token');
      console.log('[fetchOrders] Token from localStorage:', token ? 'exists' : 'MISSING');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const url = `${API}/api/orders`;
      console.log('[fetchOrders] Fetching from API:', url);
      console.log('[fetchOrders] Full URL:', url, 'Config:', config);

      const response = await axios.get(url, config);
      console.log('[fetchOrders] Response status:', response.status);
      console.log('[fetchOrders] API response:', response.data);
      console.log('[fetchOrders] Response is array?', Array.isArray(response.data));
      console.log('[fetchOrders] Response type:', typeof response.data);
      console.log('[fetchOrders] Response length:', response.data?.length);
      return response.data;
    } catch (error) {
      console.error('[fetchOrders] FETCH FAILED - Status:', error.response?.status);
      console.error('[fetchOrders] FETCH FAILED - Error message:', error.message);
      console.error('[fetchOrders] FETCH FAILED - Response:', error.response?.data);
      console.error('[fetchOrders] FETCH FAILED - Full error:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'order/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(`${API}/api/orders/user/my-orders`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };
      const response = await axios.post(`${API}/api/orders`, orderData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.hasLoaded = true;
        console.log('[Redux] fetchOrders.fulfilled - received payload:', action.payload);
        console.log('[Redux] fetchOrders.fulfilled - is array?', Array.isArray(action.payload));
        state.orders = Array.isArray(action.payload) ? action.payload : [];
        console.log('[Redux] fetchOrders.fulfilled - orders set to:', state.orders);
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('[Redux] fetchOrders.rejected - error:', action.payload);
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.orders.push(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
import orderReducer from './slices/orderSlice';
import wishlistReducer from './slices/wishlistSlice';
import categoryReducer from './slices/categorySlice';

export const store = configureStore({
  reducer: {
    product: productReducer,
    cart: cartReducer,
    auth: authReducer,
    order: orderReducer,
    wishlist: wishlistReducer,
    category: categoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    process.env.NODE_ENV === 'production'
      ? getDefaultMiddleware()
      : getDefaultMiddleware({
          // In development mode, increase warning threshold for serialization checks
          // This is because loading large product/category data takes time
          // Note: This middleware is completely disabled in production builds
          serializableStateInvariantMiddleware: {
            warnAfter: 128, // Increase from default 32ms to 128ms
            ignoredActions: ['persist/PERSIST'], // Ignore persist actions if using redux-persist
          },
          immutableStateInvariantMiddleware: {
            warnAfter: 128,
          },
        }),
});

export default store;

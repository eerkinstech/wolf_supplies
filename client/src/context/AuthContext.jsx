import React, { createContext, useState, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setCart, clearCart as clearCartAction, fetchCart } from '../redux/slices/cartSlice';
import { fetchWishlist } from '../redux/slices/wishlistSlice';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

const API = import.meta.env.VITE_API_URL || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartFetchedRef] = useState({ current: false }); // Prevent duplicate fetch
  const dispatch = useDispatch();

  // Verify token on app mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (storedToken) {
          const response = await axios.get(`${API}/api/users/profile`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const data = response.data;
          setUser(data);
          setToken(storedToken);
          setIsAdmin(data.role === 'admin' || data.isAdmin === true);
          console.log('[AuthContext] Profile fetched:', data);
          console.log('[AuthContext] isAdmin:', data.role === 'admin' || data.isAdmin === true);
          // Fetch cart and wishlist from server on login
          if (!cartFetchedRef.current) {
            cartFetchedRef.current = true;
            dispatch(fetchCart());
            dispatch(fetchWishlist());
          }
        }
      } catch (error) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        setToken(null);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [dispatch, cartFetchedRef]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/api/users/login`, { email, password });
      const data = response.data;
      console.log('[AuthContext] Login response:', data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
      }
      setToken(data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
      }
      // Always fetch profile after login to update context
      try {
        const profileResp = await axios.get(`${API}/api/users/profile`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        const profile = profileResp.data;
        console.log('[AuthContext] Profile response after login:', profile);
        setUser(profile);
        setIsAdmin(profile.role === 'admin' || profile.isAdmin === true);
      } catch (e) {
        console.error('[AuthContext] Profile fetch error:', e);
        setUser(data.user || data);
        setIsAdmin(
          (data.user?.role === 'admin' || data.role === 'admin') ||
          (data.user?.isAdmin === true || data.isAdmin === true)
        );
      }
      // Force refresh cart and wishlist after login
      cartFetchedRef.current = false;
      dispatch(fetchCart());
      dispatch(fetchWishlist());
      toast.success('Login successful!');
      // Redirect and reload for admin
      if ((data.user?.role === 'admin' || data.role === 'admin') || (data.user?.isAdmin === true || data.isAdmin === true)) {
        window.location.href = '/admin/dashboard';
        setTimeout(() => window.location.reload(), 500);
      }
      return { success: true, user: data.user || data };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    toast.error('User registration is disabled. Only admin login is available.');
    return { success: false, error: 'Registration is not available' };
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setToken(null);
    setUser(null);
    setIsAdmin(false);
    // clear client cart on logout
    dispatch(clearCartAction());
    toast.success('Logged out successfully!');
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API}/api/users/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setUser(data);
      toast.success('Profile updated successfully!');
      return { success: true, user: data };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
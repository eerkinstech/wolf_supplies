'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from "react-router-dom";

import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      const userData = result.user;
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 sm:p-12 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-full">
              <div className="text-4xl">🔐</div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-lg text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Admin Login Link */}
          <div className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded-lg flex items-center gap-3">
            <i className="fas fa-user-shield text-xl text-purple-600 flex-shrink-0"></i>
            <div>
              <p className="text-sm text-purple-900 font-bold">Admin Access?</p>
              <p className="text-xs text-purple-700">
                <Link to="/admin/login" className="font-bold hover:underline">
                  Go to Admin Login →
                </Link>
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900">Email Address</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 text-lg"></i>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition text-lg"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900">Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 text-lg"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition text-lg"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 text-lg"
                >
                  {showPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-bold transition duration-300 disabled:opacity-50 text-lg mt-8 transform hover:scale-105 shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-600 font-semibold">OR</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center space-y-4">
            <p className="text-gray-600 text-lg">
              Don't have an account?{' '}
              <Link to="/register" className="text-gray-700 hover:text-indigo-700 font-bold">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="bg-gray-100 border-l-4 border-gray-600 p-4 rounded-lg space-y-3">
            <p className="text-sm text-gray-900 font-bold">
              👤 User Demo Credentials:
            </p>
            <>
              <p className="text-xs text-gray-800 font-mono">Email: john@example.com</p>
              <p className="text-xs text-gray-800 font-mono">Password: User@123</p>
            </>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

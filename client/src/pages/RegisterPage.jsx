'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

import toast from 'react-hot-toast';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await register(formData.name, formData.email, formData.password);
      if (res.success) {
        toast.success('Registration successful!');
        navigate('/');
      } else {
        throw new Error(res.error || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-10 sm:p-12 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-full">
              <div className="text-4xl">✨</div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Create Account</h1>
            <p className="text-lg text-gray-600">Join us today and start shopping</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900">Full Name</label>
              <div className="relative">
                <i className="fas fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 text-lg"></i>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition text-lg"
                  placeholder="John Doe"
                />
              </div>
            </div>

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

            {/* Confirm Password */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900">Confirm Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 text-lg"></i>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition text-lg"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 text-lg"
                >
                  {showConfirmPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-100 border-l-4 border-gray-600 p-4 rounded-lg space-y-2">
              <p className="text-xs font-bold text-gray-900">Password Requirements:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-800">
                  <i className={`fas fa-check ${formData.password.length >= 6 ? 'text-gray-400' : 'text-gray-400'}`}></i>
                  At least 6 characters
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-bold transition duration-300 disabled:opacity-50 text-lg transform hover:scale-105 shadow-lg mt-6"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
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

          {/* Login Link */}
          <div className="text-center space-y-4">
            <p className="text-gray-600 text-lg">
              Already have an account?{' '}
              <Link to="/login" className="text-gray-700 hover:text-indigo-700 font-bold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

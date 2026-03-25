// Main App entry for React Vite

import React, { useEffect, useState, Suspense } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { Routes, Route, useLocation } from 'react-router-dom';
import store from './redux/store';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Layout from './components/Layout/Layout';
import ChatButton from './components/ChatButton/ChatButton';
import ScrollToTop from './components/ScrollToTop';

// Lazy load pages for better performance
const Homepage = React.lazy(() => import('./pages/HomePage'))
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage'))
const CategoriesPage = React.lazy(() => import('./pages/CategoriesPage'))
const CategoryDetailPage = React.lazy(() => import('./pages/CategoryDetailPage'))
const CartPage = React.lazy(() => import('./pages/CartPage'))
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'))
const WishlistPage = React.lazy(() => import('./pages/WishlistPage'))
const AdminLoginPage = React.lazy(() => import('./pages/AdminLoginPage'))
const AboutUsPage = React.lazy(() => import('./pages/AboutUsPage'))
const ContactUsPage = React.lazy(() => import('./pages/ContactUsPage'))
const OrderDetailPage = React.lazy(() => import('./pages/OrderDetailPage'))
const OrderLookupPage = React.lazy(() => import('./pages/OrderLookupPage'))
const PoliciesShippingPage = React.lazy(() => import('./pages/policies/ShippingPage'))
const PoliciesReturnsPage = React.lazy(() => import('./pages/policies/ReturnsPage'))
const PoliciesPrivacyPage = React.lazy(() => import('./pages/policies/PrivacyPage'))
const PoliciesTermsPage = React.lazy(() => import('./pages/policies/TermsPage'))
const PoliciesFAQPage = React.lazy(() => import('./pages/policies/FAQPage'))
const DynamicPage = React.lazy(() => import('./pages/DynamicPage'))
const SitemapPage = React.lazy(() => import('./pages/SitemapPage'))
// Lazy load admin pages (only loaded when needed)
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminProductsPage = React.lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminAddProductPage = React.lazy(() => import('./pages/admin/AdminAddProductPage'))
const AdminReviewsPage = React.lazy(() => import('./pages/admin/AdminReviewsPage'))
const AdminCollectionsPage = React.lazy(() => import('./pages/admin/AdminCollectionsPage'))
const AdminCategoriesPage = React.lazy(() => import('./pages/admin/AdminCategoriesPage'))
const AdminMediaLibraryPage = React.lazy(() => import('./pages/admin/AdminMediaLibraryPage'))
const AdminInventoryPage = React.lazy(() => import('./pages/admin/AdminInventoryPage'))
const AdminRolesPage = React.lazy(() => import('./pages/admin/AdminRolesPage'))
const AdminPagesSEOPage = React.lazy(() => import('./pages/admin/AdminPagesSEOPage'))
const AdminCreatePagePage = React.lazy(() => import('./pages/admin/AdminCreatePagePage'))
const AdminEditPagePage = React.lazy(() => import('./pages/admin/AdminEditPagePage'))
const AdminOrdersPage = React.lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminCustomersPage = React.lazy(() => import('./pages/admin/AdminCustomersPage'))
const AdminAnalyticsPage = React.lazy(() => import('./pages/admin/AdminAnalyticsPage'))
const AdminMenuPage = React.lazy(() => import('./pages/admin/AdminMenuPage'))
const AdminChatPage = React.lazy(() => import('./pages/admin/AdminChatPage'))
const AdminCouponsPage = React.lazy(() => import('./pages/admin/AdminCouponsPage'))
const AdminURLRedirectPage = React.lazy(() => import('./pages/admin/AdminURLRedirectPage'))
const AdminSlidersPage = React.lazy(() => import('./pages/admin/AdminSlidersPage'))
const PaymentOptionsPage = React.lazy(() => import('./pages/PaymentOptionsPage'))
const NotFound404Page = React.lazy(() => import('./pages/NotFound404Page'))

// Route Protection Components
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import AdminRoute from './components/AdminRoute/AdminRoute'

import { Toaster } from 'react-hot-toast'

// Loading fallback component for lazy-loaded routes
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current mx-auto mb-4" style={{ borderColor: 'var(--color-accent-primary)' }}></div>
      <p style={{ color: 'var(--color-text-primary)' }}>Loading...</p>
    </div>
  </div>
)


const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isSitemapRoute = location.pathname === '/sitemap';

  return (
    <Provider store={store}>
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<LoadingFallback />}>
          {/* Only show Header/Footer if not on admin route or sitemap route */}
          {!isAdminRoute && !isSitemapRoute && <Header />}
          <Routes>
            {/* Home Page uses Layout */}
            <Route path="/" element={<Layout><Homepage /></Layout>} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/category/:slug" element={<CategoryDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            {/* Policy Routes */}
            <Route path="/policies/shipping" element={<PoliciesShippingPage />} />
            <Route path="/policies/returns" element={<PoliciesReturnsPage />} />
            <Route path="/policies/privacy" element={<PoliciesPrivacyPage />} />
            <Route path="/policies/terms" element={<PoliciesTermsPage />} />
            <Route path="/policies/faq" element={<PoliciesFAQPage />} />
            <Route path="/payment-options" element={<PaymentOptionsPage />} />
            <Route path="/order-lookup" element={<OrderLookupPage />} />
            <Route path="/order/:id" element={<OrderDetailPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            <Route path="/:slug" element={<DynamicPage />} />
            {/* Admin Routes - Protected with Admin Access Check, no Header/Footer */}
            <Route path="/admin" element={<AdminRoute requiredPermission="dashboard"><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute requiredPermission="dashboard"><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute requiredPermission="products"><AdminProductsPage /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute requiredPermission="categories"><AdminCategoriesPage /></AdminRoute>} />
            <Route path="/admin/collections" element={<AdminRoute requiredPermission="collections"><AdminCollectionsPage /></AdminRoute>} />
            <Route path="/admin/media" element={<AdminRoute requiredPermission="media"><AdminMediaLibraryPage /></AdminRoute>} />
            <Route path="/admin/inventory" element={<AdminRoute requiredPermission="inventory"><AdminInventoryPage /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute requiredPermission="orders"><AdminOrdersPage /></AdminRoute>} />
            <Route path="/admin/customers" element={<AdminRoute requiredPermission="customers"><AdminCustomersPage /></AdminRoute>} />
            <Route path="/admin/reviews" element={<AdminRoute requiredPermission="reviews"><AdminReviewsPage /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute requiredPermission="analytics"><AdminAnalyticsPage /></AdminRoute>} />
            <Route path="/admin/menu" element={<AdminRoute requiredPermission="menu"><AdminMenuPage /></AdminRoute>} />
            <Route path="/admin/sliders" element={<AdminRoute requiredPermission="sliders"><AdminSlidersPage /></AdminRoute>} />
            <Route path="/admin/chat" element={<AdminRoute requiredPermission="chat"><AdminChatPage /></AdminRoute>} />
            <Route path="/admin/coupons" element={<AdminRoute requiredPermission="coupons"><AdminCouponsPage /></AdminRoute>} />
            <Route path="/admin/redirects" element={<AdminRoute requiredPermission="redirects"><AdminURLRedirectPage /></AdminRoute>} />
            <Route path="/admin/roles" element={<AdminRoute requiredPermission="roles"><AdminRolesPage /></AdminRoute>} />
            <Route path="/admin/pages-seo" element={<AdminRoute requiredPermission="pages-seo"><AdminPagesSEOPage /></AdminRoute>} />
            <Route path="/admin/create-page" element={<AdminRoute requiredPermission="pages-seo"><AdminCreatePagePage /></AdminRoute>} />
            <Route path="/admin/edit-page/:id" element={<AdminRoute requiredPermission="pages-seo"><AdminEditPagePage /></AdminRoute>} />
            <Route path="/admin/products/add" element={<AdminRoute requiredPermission="products"><AdminAddProductPage /></AdminRoute>} />
            <Route path="/admin/products/edit/:id" element={<AdminRoute requiredPermission="products"><AdminAddProductPage /></AdminRoute>} />
            {/* 404 Catch-all route - must be last */}
            <Route path="*" element={<NotFound404Page />} />
          </Routes>
          {!isAdminRoute && !isSitemapRoute && <Footer />}
          {/* Only show ChatButton on storefront routes */}
          {!isAdminRoute && !isSitemapRoute && <ChatButton />}
          <Toaster position="top-right" />
        </Suspense>
      </AuthProvider>
    </Provider>
  );
};

export default App;

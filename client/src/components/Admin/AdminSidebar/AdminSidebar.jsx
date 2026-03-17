'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../../../context/AuthContext';

const AdminSidebar = ({ activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const { logout, user, loading } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState({
    products: false,
    media: false,
    sales: false,
    engagement: false,
    settings: false,
  });

  const menuGroups = [
    {
      groupId: 'main',
      groupLabel: 'MAIN',
      collapsible: false,
      items: [
        { icon: 'fas fa-home', label: 'Dashboard', id: 'dashboard', path: '/admin/dashboard', permissionId: 'dashboard' }
      ]
    },
    {
      groupId: 'products',
      groupLabel: 'PRODUCTS & INVENTORY',
      collapsible: true,
      items: [
        { icon: 'fas fa-box', label: 'Products', id: 'products', path: '/admin/products', permissionId: 'products' },
        { icon: 'fas fa-warehouse', label: 'Inventory', id: 'inventory', path: '/admin/inventory', permissionId: 'inventory' },
        { icon: 'fas fa-tags', label: 'Categories', id: 'categories', path: '/admin/categories', permissionId: 'categories' },
        { icon: 'fas fa-layer-group', label: 'Collections', id: 'collections', path: '/admin/collections', permissionId: 'collections' },
      ]
    },
    {
      groupId: 'media',
      groupLabel: 'MEDIA & CONTENT',
      collapsible: true,
      items: [
        { icon: 'fas fa-image', label: 'Media Library', id: 'media', path: '/admin/media', permissionId: 'media' },
        { icon: 'fas fa-list', label: 'Menu', id: 'menu', path: '/admin/menu', permissionId: 'menu' },
        { icon: 'fas fa-images', label: 'Sliders', id: 'sliders', path: '/admin/sliders', permissionId: 'sliders' },
        { icon: 'fas fa-plus-circle', label: 'Create Page', id: 'create-page', path: '/admin/create-page', permissionId: 'create-page' },
      ]
    },
    {
      groupId: 'sales',
      groupLabel: 'SALES & ORDERS',
      collapsible: true,
      items: [
        { icon: 'fas fa-clipboard-list', label: 'Orders', id: 'orders', path: '/admin/orders', permissionId: 'orders' },
        { icon: 'fas fa-users', label: 'Customers', id: 'customers', path: '/admin/customers', permissionId: 'customers' },
        { icon: 'fas fa-ticket-alt', label: 'Coupons', id: 'coupons', path: '/admin/coupons', permissionId: 'coupons' },
      ]
    },
    {
      groupId: 'engagement',
      groupLabel: 'ENGAGEMENT & SUPPORT',
      collapsible: true,
      items: [
        { icon: 'fas fa-comments', label: 'Reviews', id: 'reviews', path: '/admin/reviews', permissionId: 'reviews' },
        { icon: 'fas fa-headset', label: 'Chat', id: 'chat', path: '/admin/chat', permissionId: 'chat' },
      ]
    },
    {
      groupId: 'settings',
      groupLabel: 'SETTINGS',
      collapsible: true,
      items: [
        { icon: 'fas fa-chart-line', label: 'Analytics', id: 'analytics', path: '/admin/analytics', permissionId: 'analytics' },
        { icon: 'fas fa-link', label: 'URL Redirects', id: 'redirects', path: '/admin/redirects', permissionId: 'redirects' },
        { icon: 'fas fa-file-alt', label: 'Pages & Policies SEO', id: 'pages-seo', path: '/admin/pages-seo', permissionId: 'pages-seo' },
        { icon: 'fas fa-lock', label: 'Roles & Permissions', id: 'roles', path: '/admin/roles', permissionId: 'roles' },
      ]
    },
  ];

  // Helper function to check if user has permission to access a page
  const hasPermission = (permissionId) => {
    // While auth is loading, show everything (prevent blank sidebar flash)
    if (loading || !user) return true;

    // If user has a custom role, use its permissions (even if role is 'admin')
    if (user?.customRole?.permissions) {
      const hasPerm = user.customRole.permissions.includes(permissionId);
      return hasPerm;
    }

    // Admins without a custom role get full access
    if (user?.role === 'admin') return true;

    // Staff/custom roles without explicit permissions: deny
    return false;
  };

  // Get first accessible item from all menu groups
  const getFirstAccessibleItem = () => {
    console.log('🔍 Looking for first accessible item...');
    for (const group of menuGroups) {
      for (const item of group.items) {
        const permId = item.permissionId || item.id;
        if (hasPermission(permId)) {
          console.log(`✅ Found first accessible item: "${item.label}" (${permId})`);
          return item;
        }
      }
    }
    console.log('❌ No accessible items found');
    return null;
  };

  // Redirect to first accessible page if trying to access dashboard without permission
  React.useEffect(() => {
    console.log('🚀 Sidebar redirect effect triggered. Current path:', pathname);
    const dashboardHasAccess = hasPermission('dashboard');
    console.log('Dashboard access:', dashboardHasAccess ? 'YES' : 'NO');

    if (!dashboardHasAccess && (pathname === '/admin' || pathname === '/admin/dashboard')) {
      console.log('⚠️ User trying to access dashboard without permission. Redirecting...');
      const firstAccessible = getFirstAccessibleItem();
      if (firstAccessible) {
        console.log(`↪️ Redirecting to: ${firstAccessible.path}`);
        router.replace(firstAccessible.path);
      } else {
        console.log('❌ No accessible page found to redirect to');
      }
    }
  }, [user?.customRole?.permissions, pathname]);

  // Disable automatic scroll restoration on page navigation
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Scroll to top when location changes
    window.scrollTo(0, 0);
  }, [pathname]);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Determine active tab from current route
  const getCurrentActiveTab = () => {
    const path = pathname;
    if (path.includes('/admin/products')) return 'products';
    if (path.includes('/admin/inventory')) return 'inventory';
    if (path.includes('/admin/categories')) return 'categories';
    if (path.includes('/admin/collections')) return 'collections';
    if (path.includes('/admin/media')) return 'media';
    if (path.includes('/admin/menu')) return 'menu';
    if (path.includes('/admin/create-page')) return 'create-page';
    if (path.includes('/admin/orders')) return 'orders';
    if (path.includes('/admin/customers')) return 'customers';
    if (path.includes('/admin/coupons')) return 'coupons';
    if (path.includes('/admin/reviews')) return 'reviews';
    if (path.includes('/admin/chat')) return 'chat';
    if (path.includes('/admin/analytics')) return 'analytics';
    if (path.includes('/admin/redirects')) return 'redirects';
    if (path.includes('/admin/pages-seo')) return 'pages-seo';
    if (path.includes('/admin/roles')) return 'roles';
    if (path.includes('/admin/dashboard') || path === '/admin') return 'dashboard';
    return 'dashboard';
  };

  const currentActiveTab = activeTab || getCurrentActiveTab();

  return (
    <div className="w-64 text-white h-screen flex flex-col fixed left-0 top-0 z-40" style={{ backgroundColor: 'var(--color-accent-primary)' }}>
      {/* Header */}
      <div className="p-4 border-b border-opacity-30" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}>
        <Link to="/admin" className="flex px-2 justify-left items-center gap-3">
          <i className="fas fa-user-tie text-2xl"></i>
          <div>
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <p className="text-xs opacity-75">Management System</p>
          </div>
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuGroups.map((group) => {
          // Filter items based on user permissions
          const accessibleItems = group.items.filter(item => {
            const permId = item.permissionId || item.id;
            return hasPermission(permId);
          });

          // Don't render group if no items are accessible
          if (accessibleItems.length === 0) {
            return null;
          }

          return (
            <div key={group.groupId} className="mb-2">
              {/* Group Header */}
              {group.collapsible ? (
                <button
                  onClick={() => toggleGroup(group.groupId)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold tracking-wide transition duration-300"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  onMouseEnter={(e) => e.target.style.color = 'rgba(255, 255, 255, 1)'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}
                >
                  <span>{group.groupLabel}</span>
                  <i className={`fas fa-chevron-${expandedGroups[group.groupId] ? 'down' : 'right'} text-xs`}></i>
                </button>
              ) : (
                <div className="px-4 py-2 text-xs font-bold tracking-wide" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {group.groupLabel}
                </div>
              )}

              {/* Group Items */}
              {expandedGroups[group.groupId] !== false && (
                <div className="space-y-1 mt-1">
                  {accessibleItems.map((item) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition duration-200 text-sm font-medium ${currentActiveTab === item.id
                        ? 'text-white shadow-lg'
                        : 'text-white opacity-70 hover:opacity-100'
                        }`}
                      style={
                        currentActiveTab === item.id
                          ? {
                            backgroundColor: 'var(--color-accent-light)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                          }
                          : {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)'
                          }
                      }
                    >
                      <i className={`${item.icon} text-sm w-4 text-center`}></i>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-opacity-30" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white font-semibold transition duration-300"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.85)',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 1)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.85)'}
        >
          <i className="fas fa-sign-out-alt text-base"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

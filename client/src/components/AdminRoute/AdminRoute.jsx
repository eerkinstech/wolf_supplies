import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children, requiredPermission = null }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Debug logs (must be after destructuring)
  useEffect(() => {
    console.log('[AdminRoute] isAdmin:', isAdmin);
    console.log('[AdminRoute] user:', user);
  }, [isAdmin, user]);

  // List of all available admin pages with their permission IDs
  const allAdminPages = [
    { path: '/admin/dashboard', permissionId: 'dashboard' },
    { path: '/admin/products', permissionId: 'products' },
    { path: '/admin/inventory', permissionId: 'inventory' },
    { path: '/admin/categories', permissionId: 'categories' },
    { path: '/admin/collections', permissionId: 'collections' },
    { path: '/admin/media', permissionId: 'media' },
    { path: '/admin/menu', permissionId: 'menu' },
    { path: '/admin/create-page', permissionId: 'create-page' },
    { path: '/admin/orders', permissionId: 'orders' },
    { path: '/admin/customers', permissionId: 'customers' },
    { path: '/admin/coupons', permissionId: 'coupons' },
    { path: '/admin/reviews', permissionId: 'reviews' },
    { path: '/admin/chat', permissionId: 'chat' },
    { path: '/admin/analytics', permissionId: 'analytics' },
    { path: '/admin/redirects', permissionId: 'redirects' },
    { path: '/admin/pages-seo', permissionId: 'pages-seo' },
    { path: '/admin/roles', permissionId: 'roles' },
  ];

  // Helper function to check if user has specific permission
  const hasPermission = (permissionId) => {
    if (!permissionId) return true; // No specific permission required

    // Always allow admins
    if (user?.role === 'admin' || user?.isAdmin === true) {
      return true;
    }

    // If user has a custom role, use its permissions
    if (user?.customRole?.permissions) {
      // Permissions can be strings or objects, normalize them
      const permissionIds = user.customRole.permissions.map(p => 
        typeof p === 'string' ? p : p.id || p.name || p._id
      );
      return permissionIds.includes(permissionId);
    }

    return false;
  };

  // Get first accessible page for the employee
  const getFirstAccessiblePage = () => {
    console.log('🔍 Finding first accessible page for employee...');
    for (const page of allAdminPages) {
      if (hasPermission(page.permissionId)) {
        console.log(`✅ Found accessible page: "${page.path}"`);
        return page.path;
      }
    }
    console.log('❌ No accessible pages found');
    return null;
  };

  // Check access and redirect if necessary
  useEffect(() => {
    if (loading) return;

    // Not authenticated - redirect to admin login
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    // Check if user is authorized (admin OR has customRole)
    const isAuthorized = isAdmin || (user?.customRole);
    
    if (!isAuthorized) {
      setHasAccess(false);
      setIsCheckingAccess(false);
      return;
    }

    // Check specific permission if required
    if (requiredPermission && !hasPermission(requiredPermission)) {
      console.log(`⚠️ User lacks permission for: ${requiredPermission}. Redirecting to first accessible page...`);
      const firstAccessible = getFirstAccessiblePage();

      if (firstAccessible) {
        console.log(`↪️ Redirecting to: ${firstAccessible}`);
        navigate(firstAccessible);
        return;
      }

      setHasAccess(false);
      setIsCheckingAccess(false);
      return;
    }

    // All checks passed
    setHasAccess(true);
    setIsCheckingAccess(false);
  }, [loading, isAuthenticated, isAdmin, user, requiredPermission, navigate]);

  if (loading || isCheckingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner animate-spin text-4xl text-gray-700 block mx-auto mb-4"></i>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to admin login (handled by useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated but not authorized - show access denied
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-black">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl">
          <i className="fas fa-lock text-5xl text-black block mx-auto mb-4"></i>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to access this page. Only administrators and authorized employees can access this area.
          </p>
          <a href="/" className="inline-block px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // Check specific permission if required (handled by useEffect)
  if (!hasAccess) {
    // If no accessible pages found, show error
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-black">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl">
          <i className="fas fa-ban text-5xl text-red-600 block mx-auto mb-4"></i>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">No Access</h1>
          <p className="text-gray-600 mb-6">
            Your role does not have access to any admin pages. Contact an administrator.
          </p>
          <a href="/" className="inline-block px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;

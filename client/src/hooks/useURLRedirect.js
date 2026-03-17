import { useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

/**
 * Hook to handle URL redirects when a page/resource is not found
 * Works site-wide for any URL pattern - products, categories, pages, policies, etc.
 * 
 * When a 404 occurs (product, category, or other page not found), this hook:
 * 1. Gets the current URL path from the browser location
 * 2. Checks if there's an active redirect configured for that URL
 * 3. If found, redirects the user to the new URL where they see the new content
 * 
 * Usage: useURLRedirect(resourceNotFound)
 * Example: useURLRedirect(!product && !loading) - triggers when product not found
 */
export const useURLRedirect = (resourceNotFound = false) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only check for redirects if resource is not found
    if (!resourceNotFound) return;

    const checkAndRedirect = async () => {
      try {
        // Get the current path
        const currentPath = location.pathname;
        console.log('🔍 Checking redirect for path:', currentPath);

        // Check if there's a redirect for this URL
        const response = await axios.get(`${API}/api/resolve-redirect`, {
          params: { from_url: currentPath }
        });

        console.log('📦 Redirect response for:', currentPath, response.data);

        if (response.data.found) {
          // Redirect to the new URL - user will see the new page's content
          const newUrl = response.data.redirect.to;
          console.log(`✅ Redirect found! Old URL: ${currentPath} → New URL: ${newUrl}`);
          console.log('🔄 User will now see the content of the new URL...');
          navigate(newUrl, { replace: true });
        } else {
          console.log('❌ No redirect found for this URL:', currentPath);
        }
      } catch (error) {
        console.error('Error checking redirects:', error.message);
        // Silently fail - don't interrupt user experience
      }
    };

    // Add a small delay to ensure content has tried to load first
    const timeoutId = setTimeout(checkAndRedirect, 300);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname, resourceNotFound, navigate]);
};

export default useURLRedirect;

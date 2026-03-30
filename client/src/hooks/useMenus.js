import { useEffect, useState, useRef } from 'react';
import { cachedJsonFetch } from '@/utils/apiCache';
import { getApiUrl } from '@/utils/envHelper';

// Shared menu data cache across the app
const menusCacheRef = { 
  data: null, 
  promise: null,
  loaded: false 
};

export const useMenus = () => {
  const [menus, setMenus] = useState({
    browseMenu: [],
    footerMenu: [],
    policiesMenu: [],
    topBarMenu: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    let mounted = true;
    isMountedRef.current = mounted;

    const loadMenus = async () => {
      try {
        // If data is already loaded, use it immediately
        if (menusCacheRef.loaded && menusCacheRef.data) {
          if (mounted) {
            setMenus(menusCacheRef.data);
            setLoading(false);
          }
          return;
        }

        // If fetch is in progress, wait for it
        if (menusCacheRef.promise) {
          const data = await menusCacheRef.promise;
          if (mounted) {
            setMenus(data);
            setLoading(false);
          }
          return;
        }

        // Start new fetch
        menusCacheRef.promise = (async () => {
          const API = getApiUrl();
          const url = API ? `${API}/api/settings/menus` : '/api/settings/menus';
          const response = await cachedJsonFetch(url);
          
          const parsedData = {
            browseMenu: response.browseMenu || [],
            footerMenu: response.footerMenu || [],
            policiesMenu: response.policiesMenu || [],
            topBarMenu: response.topBarMenu || []
          };
          
          menusCacheRef.data = parsedData;
          menusCacheRef.loaded = true;
          return parsedData;
        })();

        const data = await menusCacheRef.promise;
        if (mounted) {
          setMenus(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || 'Failed to load menus');
          setLoading(false);
        }
        // Reset promise on error so next component can retry
        menusCacheRef.promise = null;
      }
    };

    // Synchronously set initial state from cache if available
    if (menusCacheRef.loaded && menusCacheRef.data) {
      setMenus(menusCacheRef.data);
      setLoading(false);
    } else {
      loadMenus();
    }

    // Cleanup
    return () => {
      mounted = false;
      isMountedRef.current = false;
    };
  }, []); // Empty dependency - effect runs once on mount

  return { ...menus, loading, error };
};

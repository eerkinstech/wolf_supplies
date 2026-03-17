import { saveGuestId, getGuestId } from './guestIdManager';

/**
 * Enhanced fetch wrapper that:
 * 1. Ensures credentials (httpOnly cookies) are sent with every request
 * 2. Automaticallyadds X-Guest-ID header from localStorage
 * 3. Captures X-Guest-ID from server responses and saves to localStorage
 */
export const createEnhancedFetch = () => {
  const originalFetch = window.fetch.bind(window);

  return function fetch(url, options = {}) {
    const guestId = getGuestId();

    // Retrieve auth token from localStorage (adjust key if needed)
    const token = localStorage.getItem('token');

    // Ensure credentials are always included (for httpOnly cookie)
    const enhancedOptions = {
      ...options,
      credentials: 'include', // CRITICAL: sends httpOnly cookies with every request
      headers: {
        ...options.headers,
        // Add X-Guest-ID from localStorage as fallback
        ...(guestId && { 'X-Guest-ID': guestId }),
        // Add Authorization header if token exists
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

 
    return originalFetch(url, enhancedOptions)
      .then(response => {
        // Capture X-Guest-ID header from response
        const responseGuestId = response.headers.get('X-Guest-ID');

        if (responseGuestId) {
          saveGuestId(responseGuestId);
        }
        return response;
      })
      .catch(err => {
        throw err;
      });
  };
};

/**
 * Install the enhanced fetch globally
 */
export const installEnhancedFetch = () => {
  if (window.__fetchWrapped) {
    return;
  }
  window.fetch = createEnhancedFetch();
  window.__fetchWrapped = true;
};

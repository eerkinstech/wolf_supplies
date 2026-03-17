/**
 * API Health Check Utility
 * Helps diagnose API connection and authentication issues
 */

export const checkApiHealth = async (apiUrl, token) => {
  const diagnostics = {
    apiUrl,
    hasToken: !!token,
    serverRunning: false,
    authValid: false,
    ordersEndpoint: false,
    newsletterEndpoint: false,
    errors: [],
  };

  // 1. Check if API URL is configured
  if (!apiUrl) {
    diagnostics.errors.push('API_URL is not configured. Check VITE_API_URL environment variable.');
    return diagnostics;
  }

  // 2. Check if token exists
  if (!token) {
    diagnostics.errors.push('No authentication token found. User must be logged in.');
    return diagnostics;
  }

  try {
    // 3. Test basic API connectivity
    const rootRes = await fetch(`${apiUrl}/api`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (rootRes.ok) {
      diagnostics.serverRunning = true;
    } else {
      diagnostics.errors.push(`Server responded with status ${rootRes.status}`);
    }
  } catch (err) {
    diagnostics.errors.push(`Server connection failed: ${err.message}. Make sure the server is running at ${apiUrl}`);
    return diagnostics;
  }

  // 4. Test authentication with orders endpoint
  try {
    const ordersRes = await fetch(`${apiUrl}/api/orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const contentType = ordersRes.headers.get('content-type');

    // Check for HTML response (error page)
    if (contentType && contentType.includes('text/html')) {
      diagnostics.errors.push('Orders endpoint returned HTML error page. Check server startup logs.');
    } else if (ordersRes.ok) {
      diagnostics.ordersEndpoint = true;
      diagnostics.authValid = true;
    } else if (ordersRes.status === 401) {
      diagnostics.errors.push('Authentication failed (401). Token may be invalid or expired. Please log in again.');
    } else if (ordersRes.status === 403) {
      diagnostics.errors.push('Not authorized (403). User may not have admin privileges.');
    } else if (ordersRes.status === 404) {
      diagnostics.errors.push('Orders endpoint not found (404). Server routes may not be registered.');
    } else {
      diagnostics.errors.push(`Orders endpoint returned status ${ordersRes.status}`);
    }
  } catch (err) {
    diagnostics.errors.push(`Orders endpoint error: ${err.message}`);
  }

  // 5. Test newsletter endpoint (optional)
  try {
    const nlRes = await fetch(`${apiUrl}/api/newsletter`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const contentType = nlRes.headers.get('content-type');
    if (contentType && contentType.includes('application/json') && nlRes.ok) {
      diagnostics.newsletterEndpoint = true;
    }
  } catch (err) {
    // Newsletter is optional, don't add to errors
  }

  return diagnostics;
};

/**
 * Format diagnostics for user-friendly error message
 */
export const formatDiagnosticsError = (diagnostics) => {
  if (diagnostics.errors.length === 0) {
    return 'API connection issue detected. Please try again.';
  }

  return diagnostics.errors[0]; // Return the first (most critical) error
};

/**
 * Log diagnostics to console for debugging
 */
export const logDiagnostics = (diagnostics) => {
  console.group('🔍 API Diagnostics');
  console.log('API URL:', diagnostics.apiUrl);
  console.log('Has Token:', diagnostics.hasToken);
  console.log('Server Running:', diagnostics.serverRunning);
  console.log('Auth Valid:', diagnostics.authValid);
  console.log('Orders Endpoint:', diagnostics.ordersEndpoint);
  console.log('Newsletter Endpoint:', diagnostics.newsletterEndpoint);
  if (diagnostics.errors.length > 0) {
    console.error('Errors:', diagnostics.errors);
  }
  console.groupEnd();
};

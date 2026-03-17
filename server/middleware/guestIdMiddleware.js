const { parse, serialize } = require('cookie');
const crypto = require('crypto');

/**
 * Generate v4 UUID synchronously using built-in crypto
 * Replaces uuid package to avoid ESM compatibility issues
 */
const uuidv4 = () => crypto.randomUUID();

/**
 * Validate guestId format (UUID v4)
 */
const validateGuestId = (guestId) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(guestId);
};

// Build cookie options that work for both development and production
const buildCookieOptions = () => {
  const options = {
    httpOnly: true,
    path: '/',
    maxAge: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
    options.sameSite = 'Lax';
    // Add domain for production to ensure cookie persists
    if (process.env.COOKIE_DOMAIN) {
      options.domain = process.env.COOKIE_DOMAIN; // e.g., .wolfsupplies.co.uk
    }
  } else {
    options.secure = false;
    options.sameSite = 'Lax';
  }

  return options;
};

const GUEST_ID_COOKIE = 'guestId';
const GUEST_ID_COOKIE_OPTIONS = buildCookieOptions();

/**
 * Guest ID Middleware - Synchronous
 * Generates and manages guest identifiers for cart/wishlist persistence
 */
const guestIdMiddleware = (req, res, next) => {
  try {
    const cookies = parse(req.headers.cookie || '');
    let guestId = cookies[GUEST_ID_COOKIE];
    let isNewGuestId = false;

    // If no cookie, check for X-Guest-ID header (sent by client from localStorage)
    if (!guestId) {
      const headerGuestId = req.headers['x-guest-id'];

      if (headerGuestId && validateGuestId(headerGuestId)) {
        guestId = headerGuestId;
      }
    }

    // Create new guestId if still not found
    if (!guestId) {
      guestId = uuidv4();
      isNewGuestId = true;
    }

    // ALWAYS set cookie on response to ensure it persists
    // This is critical for cart persistence
    try {
      const cookieString = serialize(GUEST_ID_COOKIE, guestId, GUEST_ID_COOKIE_OPTIONS);
      res.setHeader('Set-Cookie', cookieString);
    } catch (cookieErr) {
      console.warn('[Guest ID] Warning setting cookie:', cookieErr.message);
      // Continue anyway - guestId is still available via header
    }

    // Attach guestId to request object for use in controllers - THIS IS CRITICAL
    req.guestId = guestId;

    // Set response header - wrap in try-catch
    try {
      res.setHeader('X-Guest-ID', guestId);
    } catch (headerErr) {
      console.warn('[Guest ID] Warning setting X-Guest-ID header:', headerErr.message);
    }

    next();
  } catch (error) {
    console.error('[Guest ID Middleware] Critical Error:', error.message, error.stack);
    // IMPORTANT: Don't send error response - let middleware continue
    // This ensures guestId is still available even if something fails
    next();
  }
};

/**
 * Deprecated: Kept for backward compatibility
 * initializeMiddleware is now synchronous and returns the middleware directly
 */
const initializeMiddleware = async () => {
  return guestIdMiddleware;
};

/**
 * Get guestId from request (either cookie or header)
 * Used in controllers
 */
const getGuestId = (req) => {
  return req.guestId;
};

/**
 * Extract guestId from query or body for API calls
 * Fallback to request guestId if not provided
 */
const extractGuestId = (req) => {
  const providedGuestId = req.query.guestId || req.body?.guestId;

  if (providedGuestId) {
    if (providedGuestId !== req.guestId) {
      // Security: use the cookie guestId (server of truth)
      console.warn('[Guest ID] Provided ID differs from cookie, using cookie value');
    }
  }

  return req.guestId;
};

module.exports = { guestIdMiddleware, initializeMiddleware, getGuestId, validateGuestId, extractGuestId };

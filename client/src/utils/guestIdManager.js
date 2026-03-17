/**
 * Guest ID Manager - Handles persistent guest identity
 * Stores guestId from server cookie in localStorage as backup
 */

const GUEST_ID_KEY = 'guestId';

/**
 * Get the guestId from localStorage
 * (The actual persistent ID comes from the httpOnly cookie set by the server)
 */
export const getGuestId = () => {
  try {
    const guestId = localStorage.getItem(GUEST_ID_KEY);
    return guestId;
  } catch (err) {
    console.warn('[Guest ID] localStorage access failed:', err.message);
    return null;
  }
};

/**
 * Save the guestId to localStorage
 * Called after server responds with X-Guest-ID header
 */
export const saveGuestId = (guestId) => {
  if (!guestId) return;
  try {
    localStorage.setItem(GUEST_ID_KEY, guestId);
  } catch (err) {
    console.warn('[Guest ID] Failed to save:', err.message);
  }
};

/**
 * Clear the guestId from localStorage
 * (Note: httpOnly cookie will still exist on server until expiry or cleared)
 */
export const clearGuestId = () => {
  try {
    localStorage.removeItem(GUEST_ID_KEY);
  } catch (err) {
    console.warn('[Guest ID] Failed to clear:', err.message);
  }
};

/**
 * Restore guestId - called on app init
 * Checks localStorage and ensures it's in sync with server cookie
 */
export const restoreGuestId = () => {
  try {
    const guestId = getGuestId();
    return guestId;
  } catch (err) {
    console.error('[Guest ID] Failed to restore:', err.message);
    return null;
  }
};

/**
 * (Deprecated) Get or create - now handled by server middleware
 */
export const getOrCreateGuestId = () => {
  return getGuestId();
};

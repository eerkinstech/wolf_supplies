import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { syncCart } from '../redux/slices/cartSlice';

/**
 * Hook that syncs cart to backend with proper debouncing
 * Prevents infinite loops with 1000ms minimum interval between syncs
 */
export const useCartSync = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart?.items || []);

  const lastSyncedContentRef = useRef('');
  const lastSyncTimeRef = useRef(0);
  const syncTimeoutRef = useRef(null);
  const skipNextSyncRef = useRef(true); // Skip initial sync after fetch

  useEffect(() => {
    // Skip the very first sync to avoid syncing immediately after fetchCart
    if (skipNextSyncRef.current &&
      lastSyncedContentRef.current === '' &&
      cartItems.length > 0) {
      skipNextSyncRef.current = false;
      lastSyncedContentRef.current = JSON.stringify(cartItems);
      lastSyncTimeRef.current = Date.now();
      return;
    }

    const currentContent = JSON.stringify(cartItems);
    const contentChanged = currentContent !== lastSyncedContentRef.current;
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncTimeRef.current;

    // Only sync if: content changed AND at least 1000ms since last sync
    if (!contentChanged) return;

    if (timeSinceLastSync < 1000) {
      // Too soon - schedule for later
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

      syncTimeoutRef.current = setTimeout(() => {
        lastSyncedContentRef.current = JSON.stringify(cartItems);
        lastSyncTimeRef.current = Date.now();
        dispatch(syncCart(cartItems));
      }, 1000 - timeSinceLastSync);

      return;
    }

    // Enough time passed - sync now
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    lastSyncedContentRef.current = currentContent;
    lastSyncTimeRef.current = now;
    dispatch(syncCart(cartItems));

  }, [cartItems, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);
};

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Hook that tracks wishlist changes
 * Note: Actual syncing is handled by addItemToServer, removeItemFromServer thunks
 * This hook is primarily for monitoring and logging purposes
 */
export const useWishlistSync = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const previousItemsRef = useRef(wishlistItems);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Skip the initial load (items should be loaded from fetchWishlist)
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      previousItemsRef.current = wishlistItems;return;
    }

    // Check if wishlist items have changed after initial load
    const itemsChanged = JSON.stringify(previousItemsRef.current) !== JSON.stringify(wishlistItems);

    if (itemsChanged) {previousItemsRef.current = wishlistItems;
    }
  }, [wishlistItems, dispatch]);
};

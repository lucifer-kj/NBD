"use client";

import { useEffect, useState } from 'react';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuth } from '@/components/providers/session-provider';


export function useWishlist() {
  const { user, isAuthenticated } = useAuth();
  const { items, toggleItem, setItems, isInWishlist } = useWishlistStore();
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync with server on mount or when user changes
  useEffect(() => {
    if (isAuthenticated && user?.wishlist?.value) {
      try {
        const serverItems = JSON.parse(user.wishlist.value);
        if (Array.isArray(serverItems)) {
          // Merge local and server items, prioritizing server items for logged in users
          setItems(serverItems);
        }
      } catch (e) {
        console.error('Failed to parse wishlist from server:', e);
      }
    }
  }, [isAuthenticated, user, setItems]);

  const toggleWishlist = async (productId: string) => {
    // Optimistically update local state
    toggleItem(productId);

    if (isAuthenticated && user?.id) {
      setIsSyncing(true);
      try {
        // Calculate the new items array for the server
        
        // If toggleItem already ran, it's already in sync locally.
        // Let's just send the current state of the store.
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            customerId: user.id, 
            variantIds: useWishlistStore.getState().items 
          })
        });

        if (!res.ok) {
          throw new Error('Failed to sync wishlist with server');
        }
      } catch (error) {
        console.error('Wishlist sync error:', error);
      } finally {
        setIsSyncing(false);
      }
    } else if (!isAuthenticated) {
      // Saved locally in Zustand store
    }
  };

  return {
    items,
    toggleWishlist,
    isInWishlist,
    isSyncing
  };
}

"use client";

import { useEffect, useState } from 'react';
import { useWishlistStore } from '@/store/wishlist-store';

export function useWishlist() {
  const { items, toggleItem, setItems, isInWishlist } = useWishlistStore();
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync with server on mount
  useEffect(() => {
    async function syncWishlist() {
      try {
        const res = await fetch('/api/wishlist');
        if (res.ok) {
          const data = await res.json();
          if (data && data.items && Array.isArray(data.items)) {
            setItems(data.items);
          }
        }
      } catch (e) {
        console.error('Failed to parse wishlist from server:', e);
      }
    }
    syncWishlist();
  }, [setItems]);

  const toggleWishlist = async (productId: string) => {
    // Optimistically update local state
    toggleItem(productId);

    setIsSyncing(true);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
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
  };

  return {
    items,
    toggleWishlist,
    isInWishlist,
    isSyncing
  };
}

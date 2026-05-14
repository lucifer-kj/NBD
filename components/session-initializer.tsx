'use client';

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cart-store';
import { initCartSync, onCartSync, destroyCartSync } from '@/lib/cart-sync';

/** Minimum interval between visibility-triggered revalidations (30s) */
const REVALIDATE_COOLDOWN_MS = 30_000;

export function SessionInitializer() {
  const initCart = useCartStore((state) => state.initCart);
  const lastSyncRef = useRef<number>(0);

  useEffect(() => {
    // 1. Hydrate cart from Shopify on mount
    initCart();

    // 2. Initialize cross-tab sync
    initCartSync();

    // 3. Listen for cart changes from other tabs
    const unsubSync = onCartSync((message) => {
      if (message.type === 'CART_CLEARED') {
        useCartStore.getState().clearCart();
      } else {
        // Another tab mutated the cart — rehydrate from Shopify
        initCart();
      }
      lastSyncRef.current = Date.now();
    });

    // 4. Revalidate cart when tab regains focus (debounced)
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;

      const now = Date.now();
      if (now - lastSyncRef.current < REVALIDATE_COOLDOWN_MS) return;

      lastSyncRef.current = now;
      initCart();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubSync();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      destroyCartSync();
    };
  }, [initCart]);

  return null;
}

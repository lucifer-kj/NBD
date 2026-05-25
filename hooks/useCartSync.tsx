"use client";
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart-store';
import { updateCartBuyerIdentityAction } from '@/lib/shopify/actions';

export function useCartSync() {
  const sessionContext = useSession();
  const session = sessionContext?.data;
  const cartId = useCartStore((s) => s.cartId);

  useEffect(() => {
    if (!cartId) return;
    
    // Call the server action to update the cart buyer identity safely on the server side
    try {
      updateCartBuyerIdentityAction(cartId);
    } catch (e) {
      // Keep silent — cart sync is best-effort
      console.error('useCartSync update error:', e);
    }
  }, [session, cartId]);
}

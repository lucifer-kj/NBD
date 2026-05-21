"use client";
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart-store';
import { updateCartBuyerIdentity } from '@/lib/shopify';

export function useCartSync() {
  const sessionContext = useSession();
  const session = sessionContext?.data;
  const cartId = useCartStore((s) => s.cartId);

  useEffect(() => {
    if (!cartId) return;
    const token = (session as any)?.shopifyToken ?? null;
    // If authenticated, update the cart buyer identity in Shopify
    try {
      if (token) {
        updateCartBuyerIdentity(cartId, { customerAccessToken: token });
      } else {
        // Disassociate buyer email/token by setting empty buyer identity
        updateCartBuyerIdentity(cartId, {});
      }
    } catch (e) {
      // Keep silent — cart sync is best-effort
      console.error('useCartSync update error:', e);
    }
  }, [session, cartId]);
}

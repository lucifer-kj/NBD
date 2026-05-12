'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';

export function SessionInitializer() {
  const initCart = useCartStore((state) => state.initCart);

  useEffect(() => {
    initCart();
  }, [initCart]);

  return null;
}

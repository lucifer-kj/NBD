"use client";
import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { initCartSync, onCartSync } from "@/lib/cart-sync";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const { initCart } = useCartStore();

  useEffect(() => {
    // Initialize cart state
    initCart();

    // Initialize cross-tab sync
    initCartSync();

    // Listen for cross-tab sync events
    const unsubscribe = onCartSync((message) => {
      if (message.type === "CART_CLEARED") {
        useCartStore.getState().clearCart();
      } else if (message.type === "CART_UPDATED") {
        initCart();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [initCart]);

  return (
    <>
      {children}
    </>
  );
}

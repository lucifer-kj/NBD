"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { useAuth } from "@/components/providers/session-provider";

export default function CheckoutPage() {
  const { cart, isLoading: isCartLoading } = useCartStore();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (isCartLoading || isAuthLoading) return;

    if (!isAuthenticated) {
      // Typically we'd redirect to login or allow guest checkout
      // For now, let's just let Shopify handle it if they click checkout
    }

    if (cart?.checkoutUrl) {
      window.location.href = cart.checkoutUrl;
    }
  }, [cart, isAuthenticated, isCartLoading, isAuthLoading]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center animate-pulse">
        <h1 className="text-2xl font-bold text-[var(--islamic-green)] mb-2 font-playfair">
          Secure Checkout
        </h1>
        <p className="text-gray-600">Redirecting to Shopify for secure payment...</p>
      </div>
    </div>
  );
}

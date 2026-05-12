"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";

function SuccessContent() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    // In a Shopify headless flow, we typically reach this page after 
    // a successful checkout redirect. We should clear the local cart.
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6 text-[var(--islamic-green)]" aria-hidden>
          ✓
        </div>
        <h1 className="text-3xl font-bold text-[var(--islamic-green)] mb-4 font-playfair">
          Order Placed!
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Thank you for shopping with Naaz Book Depot. Your order is being processed and you will receive an email confirmation shortly.
        </p>
        <div className="flex flex-col gap-3">
          <Link 
            href="/account" 
            className="inline-block bg-[var(--islamic-green)] text-white font-semibold px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all shadow-md"
          >
            View My Orders
          </Link>
          <Link 
            href="/" 
            className="text-gray-500 hover:text-[var(--islamic-green)] transition-colors text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-gray-600 animate-pulse">
          Loading confirmation...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

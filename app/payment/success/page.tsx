"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";

import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const clearCart = useCartStore((s) => s.clearCart);
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || searchParams.get("id");

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
        <p className="text-gray-600 mb-4 leading-relaxed">
          Thank you for shopping with Naaz Book Depot. Your order is being processed and you will receive an email confirmation shortly.
        </p>
        {orderId && (
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-500 mb-1">Order Reference</p>
            <p className="font-mono font-bold text-gray-900">#{orderId}</p>
          </div>
        )}
        <div className="flex flex-col gap-3 mt-4">
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

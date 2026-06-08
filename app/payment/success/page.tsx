"use client";

import { useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";

import { useSearchParams } from "next/navigation";
import { trackPurchase } from "@/lib/analytics";

function SuccessContent() {
  const { cart, clearCart } = useCartStore();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || searchParams.get("id");
  const hasTracked = useRef(false);

  useEffect(() => {
    // If we have an order, a cart to read from, and haven't tracked yet
    if (orderId && cart && !hasTracked.current) {
      trackPurchase({
        transaction_id: orderId,
        value: parseFloat(cart.cost.totalAmount.amount),
        currency: cart.cost.totalAmount.currencyCode,
        items: cart.lines.map(line => ({
          item_id: line.merchandise.product.id,
          item_name: line.merchandise.product.title,
          price: parseFloat(line.cost.totalAmount.amount) / line.quantity,
          quantity: line.quantity
        }))
      });
      
      hasTracked.current = true;
      // Clear the cart *after* tracking the purchase
      clearCart();
    } else if (!orderId || !cart) {
      // If there's no orderId or the cart is already empty/null, ensure cart is cleared
      if (cart) {
        clearCart();
      }
    }
  }, [orderId, clearCart, cart]);

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

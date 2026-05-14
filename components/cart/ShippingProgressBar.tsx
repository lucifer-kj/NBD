"use client";

import { useCartStore } from "@/store/cart-store";
import { Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 999;

export default function ShippingProgressBar() {
  const { cart } = useCartStore();
  
  if (!cart) return null;

  const subtotal = Number(cart.cost.subtotalAmount.amount);
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const isFreeShipping = remaining <= 0;

  return (
    <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-full ${isFreeShipping ? 'bg-[var(--islamic-green)] text-white' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}>
          <Truck className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">
            {isFreeShipping ? (
              <span className="text-[var(--islamic-green)]">You&apos;ve unlocked free shipping!</span>
            ) : (
              <span className="text-gray-500 italic">You&apos;re only {formatPrice(remaining.toString(), 'INR')} away from free shipping</span>
            )}
          </p>
        </div>
      </div>
      
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[var(--islamic-green)] transition-all duration-500 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          {progress > 0 && progress < 100 && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}

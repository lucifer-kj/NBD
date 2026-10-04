"use client";

import { useCartStore } from "@/store/cart-store";
import { Truck, Zap, ShieldCheck } from "lucide-react";

export default function ShippingProgressBar() {
  const { cart } = useCartStore();
  
  if (!cart) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/40 rounded-xl p-3.5 border border-emerald-100/80 shadow-xs">
      {/* Top Banner: Savings Highlight */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="p-1.5 rounded-lg bg-[var(--islamic-green)] text-white shadow-xs shrink-0">
          <Zap className="w-3.5 h-3.5 fill-current" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-gray-900">
              Save up to ₹40 with Prepaid
            </span>
            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
              UPI / Card
            </span>
          </div>
          <p className="text-[11px] text-gray-500 leading-tight">
            Pay online to avoid additional COD courier collection fees.
          </p>
        </div>
      </div>

      {/* SLA Breakdown Grid */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-100/60 text-[11px]">
        <div className="bg-white/90 rounded-lg p-2 border border-gray-150/70 flex flex-col">
          <div className="flex items-center gap-1 text-[var(--islamic-green-dark)] font-semibold">
            <Truck className="w-3 h-3 text-[var(--islamic-green)] shrink-0" />
            <span>West Bengal</span>
          </div>
          <span className="text-[10px] text-gray-500 mt-0.5">
            <strong>1–2 Days</strong> • ₹40 prepaid
          </span>
        </div>

        <div className="bg-white/90 rounded-lg p-2 border border-gray-150/70 flex flex-col">
          <div className="flex items-center gap-1 text-[var(--islamic-green-dark)] font-semibold">
            <ShieldCheck className="w-3 h-3 text-[var(--islamic-gold)] shrink-0" />
            <span>Rest of India</span>
          </div>
          <span className="text-[10px] text-gray-500 mt-0.5">
            <strong>3–5 Days</strong> • ₹70 prepaid
          </span>
        </div>
      </div>
    </div>
  );
}


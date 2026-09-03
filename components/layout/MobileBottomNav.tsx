"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, LayoutGrid, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import MobileCategoriesSheet from "./MobileCategoriesSheet";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const cleanPath = pathname ? pathname.toLowerCase().replace(/\/$/, "") : "";

  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const openCartDrawer = useCartStore((state) => state.openCartDrawer);
  const cart = useCartStore((state) => state.cart);
  const cartCount = cart?.lines?.reduce((acc, line) => acc + line.quantity, 0) || 0;

  const isHome = cleanPath === "";
  const isSearch = cleanPath.startsWith("/search");
  const isShop = cleanPath.startsWith("/products") || cleanPath.startsWith("/books") || cleanPath.startsWith("/collections");

  return (
    <>
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[var(--islamic-green-dark)]/95 backdrop-blur-xl border-t border-[var(--islamic-gold)]/25 shadow-[0_-8px_24px_rgba(0,0,0,0.25)] select-none"
      >
        <div className="flex h-16 items-center justify-around px-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {/* 1. Home Tab */}
          <Link
            href="/"
            aria-label="Home"
            className="flex-1 flex justify-center items-center h-full min-h-[48px] active:scale-95 transition-transform duration-100"
          >
            <div className={`flex flex-col items-center justify-center py-1 transition-all duration-200 ${
              isHome ? "text-[var(--islamic-gold)]" : "text-white/60 hover:text-white"
            }`}>
              <div className="relative">
                <Home size={22} className={`transition-transform duration-200 ${isHome ? "scale-110" : ""}`} />
                {isHome && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--islamic-gold)] rounded-full shadow-[0_0_6px_var(--islamic-gold)]" />
                )}
              </div>
              <span className="text-[10px] font-sans font-medium mt-1 tracking-wide">
                Home
              </span>
            </div>
          </Link>

          {/* 2. Search Tab */}
          <Link
            href="/search"
            aria-label="Search"
            className="flex-1 flex justify-center items-center h-full min-h-[48px] active:scale-95 transition-transform duration-100"
          >
            <div className={`flex flex-col items-center justify-center py-1 transition-all duration-200 ${
              isSearch ? "text-[var(--islamic-gold)]" : "text-white/60 hover:text-white"
            }`}>
              <div className="relative">
                <Search size={22} className={`transition-transform duration-200 ${isSearch ? "scale-110" : ""}`} />
                {isSearch && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--islamic-gold)] rounded-full shadow-[0_0_6px_var(--islamic-gold)]" />
                )}
              </div>
              <span className="text-[10px] font-sans font-medium mt-1 tracking-wide">
                Search
              </span>
            </div>
          </Link>

          {/* 3. Categories Tab (Opens Slide-up Sheet) */}
          <button
            type="button"
            onClick={() => setIsCategoriesOpen(true)}
            aria-label="Categories"
            className="flex-1 flex justify-center items-center h-full min-h-[48px] active:scale-95 transition-transform duration-100 cursor-pointer"
          >
            <div className={`flex flex-col items-center justify-center py-1 transition-all duration-200 ${
              isShop || isCategoriesOpen ? "text-[var(--islamic-gold)]" : "text-white/60 hover:text-white"
            }`}>
              <div className="relative">
                <LayoutGrid size={22} className={`transition-transform duration-200 ${isShop || isCategoriesOpen ? "scale-110" : ""}`} />
                {(isShop || isCategoriesOpen) && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--islamic-gold)] rounded-full shadow-[0_0_6px_var(--islamic-gold)]" />
                )}
              </div>
              <span className="text-[10px] font-sans font-medium mt-1 tracking-wide">
                Categories
              </span>
            </div>
          </button>

          {/* 4. Cart Tab (Triggers Cart Drawer Directly) */}
          <button
            type="button"
            onClick={openCartDrawer}
            aria-label={`Shopping Cart with ${cartCount} items`}
            className="flex-1 flex justify-center items-center h-full min-h-[48px] active:scale-95 transition-transform duration-100 cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center py-1 text-white/60 hover:text-white transition-all duration-200">
              <div className="relative">
                <ShoppingCart size={22} className="transition-transform duration-200" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-3 bg-[var(--islamic-gold)] text-[var(--islamic-green-dark)] text-[10px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-[var(--islamic-green-dark)] shadow-sm animate-in zoom-in-50">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-sans font-medium mt-1 tracking-wide">
                Cart
              </span>
            </div>
          </button>
        </div>
      </nav>

      {/* Slide-up Categories Drawer */}
      <MobileCategoriesSheet 
        isOpen={isCategoriesOpen} 
        onClose={() => setIsCategoriesOpen(false)} 
      />
    </>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Search, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cart, openCartDrawer } = useCartStore();

  const lines = cart?.lines || [];
  const itemCount = lines.reduce((acc, line) => acc + line.quantity, 0);

  const cleanPath = pathname ? pathname.toLowerCase().replace(/\/$/, "") : "";

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      isActive: cleanPath === "",
    },
    {
      name: "Shop",
      href: "/products",
      icon: BookOpen,
      isActive: cleanPath.startsWith("/products") || cleanPath.startsWith("/books"),
    },
    {
      name: "Search",
      href: "/search",
      icon: Search,
      isActive: cleanPath.startsWith("/search"),
    },
    {
      name: "Cart",
      href: "#",
      icon: ShoppingCart,
      isActive: false,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        openCartDrawer();
      },
      badge: itemCount > 0 ? itemCount : null,
    },
    {
      name: "Account",
      href: "/account",
      icon: User,
      isActive: cleanPath.startsWith("/account") || cleanPath.startsWith("/login") || cleanPath.startsWith("/signup"),
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[var(--islamic-green-dark)] border-t border-[var(--islamic-gold)]/20 shadow-[0_-8px_24px_rgba(0,0,0,0.15)] select-none">
      <div className="flex h-14 items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const activeClass = item.isActive
            ? "text-[var(--islamic-gold)] scale-105"
            : "text-white/60 hover:text-white";

          const content = (
            <div className={`flex flex-col items-center justify-center py-1 transition-all duration-300 ${activeClass}`}>
              <div className="relative">
                <Icon size={20} className="transition-transform duration-200" />
                {item.badge !== null && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#c19a4e] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-[var(--islamic-green-dark)] shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-sans font-medium mt-0.5 tracking-wide">
                {item.name}
              </span>
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="flex-1 focus:outline-none flex justify-center items-center h-full active:scale-95 transition-transform duration-100"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={index}
              href={item.href}
              className="flex-1 flex justify-center items-center h-full active:scale-95 transition-transform duration-100"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

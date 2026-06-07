"use client";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { initCartSync, onCartSync } from "@/lib/cart-sync";
import { useCartSync } from '@/hooks/useCartSync';
import { pageview } from "@/lib/analytics";

function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      pageview(url);
    }
  }, [pathname, searchParams]);

  return null;
}

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

  // Sync cart with Shopify when session changes
  useCartSync();

  return (
    <>
      <Suspense fallback={null}>
        <RouteChangeTracker />
      </Suspense>
      {children}
    </>
  );
}

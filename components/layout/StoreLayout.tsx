"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./footer";
import WhatsAppButton from "../ui/whatsapp-button";
import CookieConsent from "./cookie-consent";
import MobileBottomNav from "./MobileBottomNav";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Normalize pathname to handle trailing slashes and case sensitivity robustly
  const cleanPath = pathname ? pathname.toLowerCase().replace(/\/$/, "") : "";
  const isAuthPage = cleanPath === "/login" || cleanPath === "/signup";
  const isProductDetailPage = cleanPath.includes("/products/") || cleanPath.includes("/books/") || cleanPath.includes("/atar/");

  React.useEffect(() => {
    console.log("[StoreLayout] Rendered path:", pathname, "Normalized:", cleanPath, "isAuthPage:", isAuthPage, "isProductDetailPage:", isProductDetailPage);
  }, [pathname, cleanPath, isAuthPage, isProductDetailPage]);

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isProductDetailPage ? "pb-24 lg:pb-0" : "pb-14 md:pb-0"}`}>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <CookieConsent />
      {!isProductDetailPage && <MobileBottomNav />}
    </div>
  );
}

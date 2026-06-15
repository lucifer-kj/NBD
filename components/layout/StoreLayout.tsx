"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./footer";
import WhatsAppButton from "../ui/whatsapp-button";
import CookieConsent from "./cookie-consent";
import MobileBottomNav from "./MobileBottomNav";
import DonationModal from "./DonationModal";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Normalize pathname to handle trailing slashes and case sensitivity robustly
  const cleanPath = pathname ? pathname.toLowerCase().replace(/\/$/, "") : "";
  const isAuthPage = cleanPath === "/login" || cleanPath === "/signup";
  const isProductDetailPage = cleanPath.includes("/products/") || cleanPath.includes("/books/") || cleanPath.includes("/atar/");

  React.useEffect(() => {
    // Logging removed to clean up console
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-[var(--islamic-beige)] focus:text-[var(--islamic-green-dark)] focus:px-4 focus:py-2.5 focus:rounded-xl focus:border-2 focus:border-[var(--islamic-gold)] focus:font-bold focus:shadow-xl focus:outline-none"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <CookieConsent />
      <DonationModal />
      {!isProductDetailPage && <MobileBottomNav />}
    </div>
  );
}

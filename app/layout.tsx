import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/footer";
import ClientRoot from "@/components/providers/client-root";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import AnimatedLayoutClient from "@/components/providers/animated-layout-client";
import RoutePrefetcher from "@/components/providers/route-prefetch";

import { ToastProvider } from "@/components/ui/toast"
import { GoogleOAuthWrapper } from "@/components/providers/google-oauth-wrapper";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import { SessionInitializer } from "@/components/session-initializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Optimize font loading
});

export const metadata: Metadata = {
  title: "Naaz Book Depot - Authentic Islamic Books & Publishing",
  description: "A pioneering publishing company since 1967, specializing in authentic Islamic literature and the Qur'an in multiple languages, serving the global Muslim community.",
  // Improve SEO and sharing
  openGraph: {
    type: "website",
    title: "Naaz Book Depot - Authentic Islamic Books & Publishing",
    description: "A pioneering publishing company since 1967, specializing in authentic Islamic literature and the Qur'an in multiple languages, serving the global Muslim community.",
    siteName: "Naaz Book Depot",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to important domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload critical assets */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>

          <AuthProvider>
            <GoogleOAuthWrapper>
              <ClientRoot>
                <SessionInitializer />
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <ErrorBoundary>
                      <AnimatedLayoutClient>{children}</AnimatedLayoutClient>
                    </ErrorBoundary>
                  </main>
                  <Footer />
                  <WhatsAppButton />
                  <RoutePrefetcher />
                </div>
              </ClientRoot>
            </GoogleOAuthWrapper>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
} 
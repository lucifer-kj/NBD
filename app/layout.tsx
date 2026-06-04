import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreLayout from "@/components/layout/StoreLayout";
import ClientRoot from "@/components/providers/client-root";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import AnimatedLayoutClient from "@/components/providers/animated-layout-client";
import RoutePrefetcher from "@/components/providers/route-prefetch";
import GoogleOneTap from "@/components/providers/google-onetap";

import { ToastProvider } from "@/components/ui/toast"
import GDPRScriptProvider from "@/components/providers/gdpr-script-provider";

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

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL;
if (!SITE_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL is required and must be set in environment variables.');
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Naaz Book Depot | Authentic Islamic Books & Quran — Since 1967",
  description: "Buy authentic Islamic books, Quran editions in Arabic, Urdu & English, and Qur'an stands. India's trusted Islamic publisher since 1967. Based in Kolkata.",
  // Improve SEO and sharing
  openGraph: {
    type: "website",
    title: "Naaz Book Depot | Authentic Islamic Books & Quran — Since 1967",
    description: "India's trusted Islamic publisher since 1967. Buy authentic Quran editions, Islamic books, and stands. Based in Kolkata, serving Muslims worldwide.",
    siteName: "Naaz Book Depot",
    url: SITE_URL,
    locale: "en_IN",
    images: [
      {
        url: "/Images/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "Naaz Book Depot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Naaz Book Depot | Authentic Islamic Books & Quran",
    description: "India's trusted Islamic publisher since 1967. Buy authentic Quran editions, Islamic books, and stands.",
    images: ["/Images/og-image.jpeg"],
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
        {/* Yandex Webmaster Verification */}
        <meta name="yandex-verification" content="1ef3d4fdf8182b6d" />
        {/* Preconnect to important domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Naaz Book Depot",
              "alternateName": "Naaz Group",
              "url": SITE_URL,
              "logo": `${SITE_URL}/logo.png`,
              "description": "India's trusted Islamic book publisher and retailer since 1967. Specialising in authentic Quran editions, Islamic literature, and stands.",
              "foundingDate": "1967",
              "founder": {
                "@type": "Person",
                "name": "Mohammad Irfan"
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "1, Ismail Madani Lane",
                "addressLocality": "Kolkata",
                "addressRegion": "West Bengal",
                "addressCountry": "IN"
              },
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+91-91634-31395",
                  "contactType": "customer service",
                  "availableLanguage": ["English", "Urdu", "Bengali", "Hindi"]
                }
              ],
              "sameAs": [
                "https://wa.me/919163431395"
              ]
            })
          }}
        />

        {/* BookStore / LocalBusiness Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["BookStore", "LocalBusiness"],
              "name": "Naaz Book Depot",
              "image": `${SITE_URL}/Images/About.jpg`,
              "url": SITE_URL,
              "telephone": "+91-033-2235-0051",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "1, Ismail Madani Lane",
                "addressLocality": "Kolkata",
                "addressRegion": "West Bengal",
                "postalCode": "700073",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 22.5726,
                "longitude": 88.3639
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                "opens": "09:00",
                "closes": "20:00"
              },
              "priceRange": "₹₹",
              "currenciesAccepted": "INR",
              "paymentAccepted": "Cash, UPI, Bank Transfer",
              "hasMap": "https://maps.google.com/?q=1+Ismail+Madani+Lane+Kolkata"
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <ToastProvider>
          <AuthProvider>
            <GoogleOneTap />
            <ClientRoot>
              <GDPRScriptProvider>
                <StoreLayout>
                  <ErrorBoundary>
                    <AnimatedLayoutClient>{children}</AnimatedLayoutClient>
                  </ErrorBoundary>
                  <RoutePrefetcher />
                </StoreLayout>
              </GDPRScriptProvider>
            </ClientRoot>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
} 
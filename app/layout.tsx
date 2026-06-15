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
import Script from "next/script";

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
  description: "Buy authentic Quran copies, stands, and classical Islamic literature online. India's trusted publisher since 1967. Shipped nationwide from Kolkata.",
  // Improve SEO and sharing
  openGraph: {
    type: "website",
    title: "Naaz Book Depot | Authentic Islamic Books & Quran — Since 1967",
    description: "Shop authentic Quran editions, stands, and Islamic literature from India's trusted publisher since 1967. Fast shipping nationwide from Kolkata.",
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
  viewportFit: "cover",
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
        {/* Google Merchant Center Verification */}
        <meta name="google-site-verification" content="A3Xrrf1bFgQ3RJtLLLTKthEbZweKlVzE8NNbzhO4ymQ" />
        {/* Preconnect to important domains for faster loading */}
        <link rel="preconnect" href="https://cdn.shopify.com" />

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
                "https://wa.me/919163431395",
                "https://www.facebook.com/people/Naaz-Book-Depot-Kolkata/61590875242073/",
                "https://www.instagram.com/naazbookkolkata/",
                "https://www.threads.net/@naazbookkolkata",
                "https://x.com/nbd_kolkata",
                "https://medium.com/@nbddigi",
                "https://in.pinterest.com/nbddigi/"
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
              "@id": "https://www.naazbook.in/#localbusiness",
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
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID || '2094017181497177'}');
            `,
          }}
        />
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID || '2094017181497177'}&ev=PageView&noscript=1`}
            alt="Meta Pixel"
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
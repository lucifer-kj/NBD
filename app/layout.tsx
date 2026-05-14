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
  title: "Naaz Book Depot | Authentic Islamic Books, Quran & Attar — Since 1967",
  description: "Buy authentic Islamic books, Quran editions in Arabic, Urdu & English, premium Attar and Qur'an stands. India's trusted Islamic publisher since 1967. Based in Kolkata.",
  // Improve SEO and sharing
  openGraph: {
    type: "website",
    title: "Naaz Book Depot | Authentic Islamic Books & Quran — Since 1967",
    description: "India's trusted Islamic publisher since 1967. Buy authentic Quran editions, Islamic books, and premium Attar. Based in Kolkata, serving Muslims worldwide.",
    siteName: "Naaz Book Depot",
    url: "https://www.naazbook.in",
    locale: "en_IN",
    images: [
      {
        url: "https://www.naazbook.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Naaz Book Depot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Naaz Book Depot | Authentic Islamic Books & Quran",
    description: "India's trusted Islamic publisher since 1967. Buy authentic Quran editions, Islamic books, and premium Attar.",
    images: ["https://www.naazbook.in/og-image.jpg"],
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
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Naaz Book Depot",
              "alternateName": "Naaz Group",
              "url": "https://www.naazbook.in",
              "logo": "https://www.naazbook.in/logo.png",
              "description": "India's trusted Islamic book publisher and retailer since 1967. Specialising in authentic Quran editions, Islamic literature, and premium Attar.",
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
              "image": "https://www.naazbook.in/Images/About.jpg",
              "url": "https://www.naazbook.in",
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
                "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
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

        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What types of Islamic books does Naaz Book Depot sell?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Naaz Book Depot stocks a wide range of Islamic books including Quran editions in Arabic, Urdu, English and Bengali, Hadith collections, Tafsir volumes, Fiqh books, Islamic history, children's Islamic books, and more. We also stock premium Attar and handcrafted Rehals (Quran stands)."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does Naaz Book Depot deliver Islamic books across India?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, Naaz Book Depot ships Islamic books and products across India. You can place an order online through our website or contact us via WhatsApp at +91 91634 31395."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How long has Naaz Book Depot been in business?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Naaz Book Depot was established in 1967 in Kolkata, West Bengal. We have been serving the Muslim community for over 57 years."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Are the Quran copies sold by Naaz Book Depot authentic?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. All Quran editions sold by Naaz Book Depot are sourced from verified, authentic publishers. We have curated our collection over decades to ensure scholarly authenticity and print quality."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is the Attar sold by Naaz Book Depot alcohol-free?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. All Attar (Itr) sold at Naaz Book Depot is 100% alcohol-free, natural, and suitable for use before prayer."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Where is Naaz Book Depot located?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Naaz Book Depot is located at 1, Ismail Madani Lane, Kolkata, West Bengal, India. You can also reach us by phone at 033-2235-0051 or on WhatsApp."
                  }
                }
              ]
            })
          }}
        />
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
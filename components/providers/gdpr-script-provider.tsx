"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";

export default function GDPRScriptProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<{ essential: boolean; analytics: boolean } | null>(null);

  useEffect(() => {
    // 1. Initial check on mount
    const stored = localStorage.getItem("naazbook-cookie-consent");
    if (stored) {
      try {
        setConsent(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing stored cookie consent:", e);
      }
    }

    // 2. Listen for custom event updates (e.g. when user clicks Accept/Reject)
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setConsent(customEvent.detail);
      }
    };

    window.addEventListener("naazbook-cookie-consent-updated", handleUpdate);
    return () => {
      window.removeEventListener("naazbook-cookie-consent-updated", handleUpdate);
    };
  }, []);

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const isAnalyticsAllowed = consent?.analytics === true;

  return (
    <>
      {children}
      
      {/* Conditionally inject GTM and GA4 only if analytics is explicitly allowed by the customer */}
      {isAnalyticsAllowed && (
        <>
          {gtmId && (
            <Script
              id="gtm-script"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${gtmId}');
                `,
              }}
            />
          )}

          {gaId && (
            <>
              <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              />
              <Script
                id="ga4-script"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${gaId}', {
                      page_path: window.location.pathname,
                    });
                  `,
                }}
              />
            </>
          )}

          {/* Vercel Analytics */}
          <Analytics />
        </>
      )}
    </>
  );
}

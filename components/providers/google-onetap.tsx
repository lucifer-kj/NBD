/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import Script from "next/script";

import { usePathname } from "next/navigation";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export default function GoogleOneTap() {
  const pathname = usePathname();
  const { status } = useSession();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const promptAttempted = useRef(false);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    if (isAuthPage) {
      return;
    }

    const initializeAndPrompt = () => {
      if (!window.google || status !== "unauthenticated" || promptAttempted.current) {
        return;
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        // console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined in environment variables.");
        return;
      }

      const isLocalhost = typeof window !== "undefined" && 
        (window.location.hostname === "localhost" || 
         window.location.hostname === "127.0.0.1" || 
         window.location.hostname.startsWith("192.168."));

      try {
        promptAttempted.current = true;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            // console.debug("Google One Tap (FedCM) credential received.");
            const result = await signIn("google-onetap", {
              credential: response.credential,
              redirect: false,
            });
            if (result?.error) {
              // console.debug("NextAuth Google One Tap sign-in error:", result.error);
              promptAttempted.current = false; // Reset to allow retry
            } else {
              // console.debug("NextAuth Google One Tap sign-in succeeded.");
              window.location.href = "/account";
            }
          },
          fedcm_support: !isLocalhost, // Enforce browser-native FedCM flow on production only
          cancel_on_tap_outside: false,
        });

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            promptAttempted.current = false;
          } else if (notification.isSkippedMoment()) {
            promptAttempted.current = false;
          } else if (notification.isDismissedMoment()) {
            // Ignored
          }
        });
      } catch (e) {
        // console.debug("Error initializing Google One Tap:", e);
        promptAttempted.current = false;
      }
    };

    if (scriptLoaded && status === "unauthenticated") {
      initializeAndPrompt();
    }
    return () => {
      if (window.google) {
        try {
          window.google.accounts.id.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [scriptLoaded, status, isAuthPage]);

  if (isAuthPage) {
    return null;
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={() => setScriptLoaded(true)}
        onError={() => {}}
        strategy="afterInteractive"
      />
    </>
  );
}

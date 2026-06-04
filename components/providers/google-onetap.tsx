"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import Script from "next/script";

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
  const { data: session, status } = useSession();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const promptAttempted = useRef(false);

  useEffect(() => {
    const initializeAndPrompt = () => {
      if (!window.google || status !== "unauthenticated" || promptAttempted.current) {
        return;
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined in environment variables.");
        return;
      }

      try {
        promptAttempted.current = true;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            console.info("Google One Tap (FedCM) credential received.");
            const result = await signIn("google-onetap", {
              credential: response.credential,
              redirect: false,
            });
            if (result?.error) {
              console.error("NextAuth Google One Tap sign-in error:", result.error);
              promptAttempted.current = false; // Reset to allow retry
            } else {
              console.info("NextAuth Google One Tap sign-in succeeded.");
              window.location.href = "/account";
            }
          },
          fedcm_support: true, // Enforce browser-native FedCM flow
          cancel_on_tap_outside: false,
        });

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.warn("One Tap prompt was not displayed:", notification.getNotDisplayedReason());
            promptAttempted.current = false;
          } else if (notification.isSkippedMoment()) {
            console.warn("One Tap prompt skipped moment:", notification.getSkippedReason());
            promptAttempted.current = false;
          } else if (notification.isDismissedMoment()) {
            console.info("One Tap prompt dismissed by user:", notification.getDismissedReason());
          }
        });
      } catch (e) {
        console.error("Error initializing Google One Tap:", e);
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
        } catch (e) {
          // ignore
        }
      }
    };
  }, [scriptLoaded, status]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={() => setScriptLoaded(true)}
        onError={() => console.error("Failed to load Google Identity Services client script")}
        strategy="afterInteractive"
      />
      <div id="g_id_onload" style={{ display: "none" }} />
    </>
  );
}

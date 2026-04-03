"use client";

import { useGoogleOneTapLogin } from "@react-oauth/google";
import { useAuth } from "@/components/providers/session-provider";

/**
 * Must render only inside GoogleOAuthProvider when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set.
 */
export function GoogleOneTapPrompt() {
  const { isAuthenticated, loginWithGoogle } = useAuth();

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      const c = credentialResponse.credential;
      if (!c) return;
      try {
        await loginWithGoogle(c);
      } catch {
        /* modal / toast can show later */
      }
    },
    disabled: isAuthenticated,
    cancel_on_tap_outside: true,
  });

  return null;
}

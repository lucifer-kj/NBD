"use client";

import { useGoogleOneTapLogin } from "@react-oauth/google";
import { useAuth } from "@/components/providers/session-provider";
import { useMounted } from "@/hooks/use-mounted";

/**
 * Renders the Google One Tap login prompt if the user is not authenticated.
 * This component should only be rendered inside GoogleOAuthProvider.
 */
export function GoogleOneTapPrompt() {
  const { loginWithGoogle, isAuthenticated } = useAuth();
  const mounted = useMounted();

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
      }
    },
    onError: () => {
      console.error("Google One Tap login failed");
    },
    disabled: !mounted || isAuthenticated,
  });

  return null;
}

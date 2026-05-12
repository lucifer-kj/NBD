"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleOneTapPrompt } from "@/components/providers/google-one-tap-prompt";

export function GoogleOAuthWrapper({ children }: { children: React.ReactNode }) {
  const cid = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!cid) return <>{children}</>;
  return (
    <GoogleOAuthProvider clientId={cid}>
      <GoogleOneTapPrompt />
      {children}
    </GoogleOAuthProvider>
  );
}

'use client';

import { useEffect } from 'react';
import { trackLogin } from '@/lib/analytics';

export default function LoginTracker() {
  useEffect(() => {
    // Safe guard to only track successful login transition once per session
    const hasTracked = sessionStorage.getItem('login_tracked');
    if (!hasTracked) {
      trackLogin('shopify');
      sessionStorage.setItem('login_tracked', 'true');
    }
  }, []);

  return null;
}

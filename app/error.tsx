'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8 p-12 rounded-[40px] bg-white border border-red-50 shadow-[0_32px_64px_-16px_rgba(220,38,38,0.1)]">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 animate-pulse">
            <AlertTriangle size={40} />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-headings font-bold text-[var(--islamic-green)]">Something went wrong</h1>
          <p className="text-gray-500">
            We&apos;re sorry, but something went wrong while loading this page. Our team has been notified.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={reset}
            className="flex-1 bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-dark)] text-white h-12 rounded-xl font-bold gap-2"
          >
            <RefreshCw size={18} />
            Try again
          </Button>
          <Button 
            asChild
            variant="outline"
            className="flex-1 border-2 border-gray-100 h-12 rounded-xl font-bold gap-2 hover:bg-gray-50"
          >
            <Link href="/">
              <Home size={18} />
              Go home
            </Link>
          </Button>
        </div>

        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
          Error Digest: {error.digest || 'Internal System Fault'}
        </p>
      </div>
    </div>
  );
}

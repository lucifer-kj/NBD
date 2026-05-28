'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RetryButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRetry = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <Button 
      onClick={handleRetry}
      disabled={isRefreshing}
      className="bg-[var(--islamic-green)] hover:bg-[var(--islamic-green)]/90 text-white gap-2 font-bold px-6 rounded-xl transition-all shadow-md shadow-[var(--islamic-green)]/10"
    >
      <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
      {isRefreshing ? 'Connecting...' : 'Retry Connection'}
    </Button>
  );
}

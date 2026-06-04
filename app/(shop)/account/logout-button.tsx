'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();

    // signOut() already handles server-side cookie deletion.
    // For client cache, router.refresh() is cleaner than window.location.href
    await signOut({ redirect: false });
    
    router.refresh(); // Invalidates RSC cache without full page reload
    router.push('/login');
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-3 p-2 rounded-xl text-red-100 hover:bg-white/10 transition-colors w-full text-left outline-none"
    >
      <LogOut size={18} /> Sign Out
    </button>
  );
}

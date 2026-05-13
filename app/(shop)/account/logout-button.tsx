'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/components/providers/session-provider';

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button 
      onClick={() => {
        logout();
        window.location.href = '/';
      }} 
      className="flex items-center gap-3 p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors w-full text-left"
    >
      <LogOut size={18} /> Sign Out
    </button>
  );
}

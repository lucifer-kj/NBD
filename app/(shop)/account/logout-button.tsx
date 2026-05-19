'use client';

import { LogOut } from 'lucide-react';
import Link from 'next/link';

export default function LogoutButton() {
  return (
    <Link 
      href="/api/auth/logout"
      className="flex items-center gap-3 p-2 rounded-xl text-red-100 hover:bg-white/10 transition-colors w-full text-left"
    >
      <LogOut size={18} /> Sign Out
    </Link>
  );
}

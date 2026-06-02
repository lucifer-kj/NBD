"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ChevronDown, Search, User, Menu, X } from 'lucide-react';
import CartDrawer from '@/components/cart-drawer';
import PredictiveSearch from '@/components/search/predictive-search';
import { useMounted } from '@/hooks/use-mounted';
import { useToast } from '@/components/ui/toast';

type ProductCategory = { name: string; path: string; available: boolean };

// Products Dropdown Client Component
export function ProductsDropdown({ productCategories }: { productCategories: ProductCategory[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={buttonRef}
        className="flex items-center text-white/90 hover:text-[var(--islamic-gold)] transition-colors font-semibold text-base py-2"
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="products-dropdown-menu"
      >
        Products
        <ChevronDown size={16} className={`ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          id="products-dropdown-menu"
          role="menu"
          className="absolute top-full left-0 mt-1 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="font-semibold text-[var(--islamic-green)]">Browse Products</h3>
          </div>
          {productCategories.map((category, index) => (
            <Link 
              key={index} 
              href={category.path} 
              className={`flex items-center justify-between px-4 py-3 transition-colors ${
                category.available 
                  ? 'hover:bg-[#F8F6F3] text-gray-700 hover:text-[var(--islamic-green)]' 
                  : 'text-gray-400 cursor-not-allowed cursor-not-allowed pointer-events-none'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span>{category.name}</span>
              {!category.available && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Soon
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Search Box Client Component
export function SearchBox() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="hidden md:flex items-center">
      {isExpanded ? (
        <div className="w-[400px] transition-all duration-300">
           <PredictiveSearch />
        </div>
      ) : (
        <button 
          onClick={() => setIsExpanded(true)} 
          className="text-white/90 hover:text-[var(--islamic-gold)] transition-colors p-2"
          aria-label="Open search box"
          aria-expanded={isExpanded}
        >
          <Search size={24} />
        </button>
      )}
    </div>
  );
}

// User Actions Client Component
export function UserActions() {
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const mounted = useMounted();

  useEffect(() => {
    try {
      const toastPayload = window.sessionStorage.getItem('naazbook-auth-toast');
      if (!toastPayload) return;
      const parsed = JSON.parse(toastPayload) as { message?: string; type?: 'success' | 'error' | 'info' };
      if (parsed?.message) {
        showToast(parsed.message, parsed.type);
      }
      window.sessionStorage.removeItem('naazbook-auth-toast');
    } catch {
      window.sessionStorage.removeItem('naazbook-auth-toast');
    }
  }, [showToast]);

  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const displayName = session?.user?.name || (session?.user?.email ? session.user.email.split('@')[0] : '');

  const initials = useMemo(() => {
    if (!displayName) return 'U';
    const parts = displayName.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    if (parts[0].includes('.')) {
      const dotParts = parts[0].split('.');
      return `${dotParts[0].charAt(0)}${dotParts[1]?.charAt(0) || ''}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }, [displayName]);

  const firstName = useMemo(() => {
    if (!displayName) return '';
    const part = displayName.split(' ')[0];
    if (part.includes('.')) {
      const subPart = part.split('.')[0];
      return subPart.charAt(0).toUpperCase() + subPart.slice(1);
    }
    return part.charAt(0).toUpperCase() + part.slice(1);
  }, [displayName]);

  // Hydration Shield: Always render static placeholder user icon during SSR and initial client hydration
  if (!mounted) {
    return (
      <Link
        href="/login"
        aria-label="Account login"
        className="flex items-center gap-2 p-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--islamic-gold)]"
      >
        <User size={24} className="text-white/90 hover:text-[var(--islamic-gold)]" />
      </Link>
    );
  }

  return (
    <Link
      href={isAuthenticated ? "/account" : "/login"}
      aria-label={isAuthenticated ? `Go to account page for ${displayName}` : "Account login"}
      className="flex items-center gap-2 p-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--islamic-gold)]"
    >
      {isAuthenticated ? (
        <>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white font-semibold uppercase tracking-[0.02em] border border-white/20">
            {initials}
          </span>
          <span className="hidden md:inline text-white/90 text-sm font-medium truncate max-w-[120px]">
            {firstName}
          </span>
        </>
      ) : (
        <User size={24} className="text-white/90 hover:text-[var(--islamic-gold)]" />
      )}
    </Link>
  );
}

export function AnimatedCartIcon() {
  return <CartDrawer />;
}

// Mobile Menu Client
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const mounted = useMounted();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      window.location.href = `/products?search=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="lg:hidden text-white/90 hover:text-[var(--islamic-gold)] p-2"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mounted && isOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-4 mt-[72px] animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-y-auto pb-32">
          <form onSubmit={handleSearch} className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2 mb-6">
            <Search className="text-gray-400 mr-2" size={18} />
            <input 
              type="text" 
              placeholder="Search Islamic books..." 
              className="flex-1 outline-none text-sm text-black" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
          <div className="flex flex-col space-y-4">
            <Link href="/" className="text-[var(--islamic-green)] hover:text-[var(--islamic-gold)] transition-colors font-bold text-xl border-b border-gray-50 pb-2" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/books" className="text-[var(--islamic-green)] hover:text-[var(--islamic-gold)] transition-colors font-bold text-xl border-b border-gray-50 pb-2" onClick={() => setIsOpen(false)}>Islamic Books</Link>
            <Link href="/atar" className="text-[var(--islamic-green)] hover:text-[var(--islamic-gold)] transition-colors font-bold text-xl border-b border-gray-50 pb-2" onClick={() => setIsOpen(false)}>Premium Atars</Link>
            <Link href="/products" className="text-[var(--islamic-green)] hover:text-[var(--islamic-gold)] transition-colors font-bold text-xl border-b border-gray-50 pb-2" onClick={() => setIsOpen(false)}>All Products</Link>
            <Link href="/blog" className="text-[var(--islamic-green)] hover:text-[var(--islamic-gold)] transition-colors font-bold text-xl border-b border-gray-50 pb-2" onClick={() => setIsOpen(false)}>Spiritual Insights</Link>
            <Link href="/about" className="text-[var(--islamic-green)] hover:text-[var(--islamic-gold)] transition-colors font-bold text-xl border-b border-gray-50 pb-2" onClick={() => setIsOpen(false)}>About Our Journey</Link>
            <Link href="/contact" className="text-[var(--islamic-green)] hover:text-[var(--islamic-gold)] transition-colors font-bold text-xl border-b border-gray-50 pb-2" onClick={() => setIsOpen(false)}>FAQs & Support</Link>
          </div>
        </div>
      )}
    </>
  );
}

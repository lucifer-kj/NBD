"use client"

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, User, LogOut, Menu, X, Heart } from 'lucide-react';
import { useAuth } from '../providers/session-provider';
import CartDrawer from '@/components/cart-drawer';
import PredictiveSearch from '@/components/search/predictive-search';
import { useMounted } from '@/hooks/use-mounted';

type ProductCategory = { name: string; path: string; available: boolean };

// Products Dropdown Client Component
export function ProductsDropdown({ productCategories }: { productCategories: ProductCategory[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
    <div className="relative">
      <button
        ref={buttonRef}
        className="flex items-center text-white/90 hover:text-[var(--islamic-gold)] transition-colors font-semibold text-base"
        type="button"
        onClick={() => setIsOpen((v) => !v)}
      >
        Products
        <ChevronDown size={16} className={`ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-4 z-50 animate-slide-down"
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
        >
          <Search size={24} />
        </button>
      )}
    </div>
  );
}

// User Actions Client Component
export function UserActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated, logout, login, register } = useAuth();
  const mounted = useMounted();

  const handleSignOut = () => {
    logout();
    setIsOpen(false);
  };

  const handleAuth = async () => {
    try {
      setAuthError("");
      setIsSubmitting(true);
      
      let result;
      if (authMode === 'login') {
        result = await login(email, password);
      } else {
        result = await register({ firstName, lastName, email, password });
      }

      if (result.success) {
        setShowLoginModal(false);
        // Reset fields
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
      } else {
        setAuthError(result.error || (authMode === 'login' ? "Invalid credentials" : "Registration failed"));
      }
    } catch {
      setAuthError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-white/90 hover:text-[var(--islamic-gold)] transition-colors flex items-center space-x-1 p-2"
        >
          <User size={24} />
          {mounted && isAuthenticated && user && (
            <span className="hidden md:inline text-sm font-semibold">
              {user.firstName}
            </span>
          )}
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {mounted && isAuthenticated && user ? (
              <>
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
                <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                  My Account
                </Link>
                <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                  My Orders
                </Link>
                <Link href="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Heart size={14} className="text-red-500" /> My Wishlist
                </Link>
                <hr className="my-1" />
                <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { setShowLoginModal(true); setAuthMode('login'); setIsOpen(false); }} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setShowLoginModal(true); setAuthMode('register'); setIsOpen(false); }} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full relative shadow-2xl">
            <button 
              onClick={() => setShowLoginModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-[var(--islamic-green)] mb-2">
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {authMode === 'login' 
                ? 'Welcome back to Naaz Book Depot.' 
                : 'Join our community of seekers.'}
            </p>
            <div className="space-y-4">
              {authMode === 'register' && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-1/2 border border-gray-300 p-2 rounded text-black outline-none focus:border-[var(--islamic-gold)]"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-1/2 border border-gray-300 p-2 rounded text-black outline-none focus:border-[var(--islamic-gold)]"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              )}
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 p-2 rounded text-black outline-none focus:border-[var(--islamic-gold)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full border border-gray-300 p-2 rounded text-black outline-none focus:border-[var(--islamic-gold)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {authError && <p className="text-xs text-red-600 font-medium">{authError}</p>}
              
                <button 
                disabled={isSubmitting}
                className="w-full bg-[var(--islamic-gold)] hover:bg-[var(--islamic-gold-dark)] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                onClick={handleAuth}
              >
                {isSubmitting ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
              </button>

              <div className="text-center pt-2">
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-sm text-gray-600 hover:text-[var(--islamic-green)] underline underline-offset-4"
                >
                  {authMode === 'login' ? "Don't have an account? Register" : "Already have an account? Sign In"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white/90 hover:text-[var(--islamic-gold)] p-2">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mounted && isOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-4 mt-[72px] animate-slide-up">
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

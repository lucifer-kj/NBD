"use client"

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, User, LogOut, Menu, X, ShoppingCart } from 'lucide-react';
import { useAuth } from '../providers/session-provider';

// Products Dropdown Client Component
export function ProductsDropdown({ productCategories }: { productCategories: any[] }) {
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
        className="flex items-center text-[var(--islamic-green)] hover:text-[#C7A536] transition-colors font-medium"
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
        <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2 w-80 transition-all duration-300">
          <Search className="text-gray-400 mr-2" size={18} />
          <input 
            type="text" 
            placeholder="Search for Islamic books, knowledge..." 
            className="flex-1 outline-none text-sm text-black" 
            autoFocus 
            onBlur={() => setIsExpanded(false)} 
          />
        </div>
      ) : (
        <button 
          onClick={() => setIsExpanded(true)} 
          className="text-[var(--islamic-green)] hover:text-[#C7A536] transition-colors p-2"
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
  const { user, isAuthenticated, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-[var(--islamic-green)] hover:text-[#C7A536] transition-colors flex items-center space-x-1 p-2"
        >
          <User size={24} />
          {isAuthenticated && user && (
            <span className="hidden md:inline text-sm font-medium">
              {user.name ? user.name.split(' ')[0] : ''}
            </span>
          )}
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {isAuthenticated && user ? (
              <>
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
                <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                  My Account
                </Link>
                <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                  My Orders
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
                  onClick={() => { setShowLoginModal(true); setIsOpen(false); }} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-[var(--islamic-green)] mb-4">Sign In</h2>
            <p className="text-sm text-gray-500 mb-6">Connect with the Django Backend here via BFF pattern.</p>
            <div className="space-y-4">
              <input type="email" placeholder="Email" className="w-full border border-gray-300 p-2 rounded" />
              <input type="password" placeholder="Password" className="w-full border border-gray-300 p-2 rounded" />
              <button 
                className="w-full bg-[#C7A536] text-white font-bold py-2 rounded"
                onClick={() => {
                   // Mock login execution linking to /api/auth/login BFF
                   fetch('/api/auth/login', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ email: 'test@naaz.com', password: 'password123' })
                   }).then(() => setShowLoginModal(false));
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Animated Cart Icon Stub 
export function AnimatedCartIcon() {
  return (
    <Link href="/cart" className="relative p-2 text-[var(--islamic-green)] hover:text-[#C7A536] transition-colors">
      <ShoppingCart size={24} />
    </Link>
  );
}

// Mobile Menu Client
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-[var(--islamic-green)] p-2">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-4 mt-[72px]">
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2 mb-4">
            <Search className="text-gray-400 mr-2" size={18} />
            <input type="text" placeholder="Search Islamic books..." className="flex-1 outline-none text-sm text-black" />
          </div>
          <div className="flex flex-col space-y-3">
            <Link href="/" className="text-[var(--islamic-green)] hover:text-[#C7A536] transition-colors font-medium py-2" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/books" className="text-[var(--islamic-green)] hover:text-[#C7A536] transition-colors font-medium py-2" onClick={() => setIsOpen(false)}>Products</Link>
            <Link href="/about" className="text-[var(--islamic-green)] hover:text-[#C7A536] transition-colors font-medium py-2" onClick={() => setIsOpen(false)}>About</Link>
            <Link href="/contact" className="text-[var(--islamic-green)] hover:text-[#C7A536] transition-colors font-medium py-2" onClick={() => setIsOpen(false)}>Contact</Link>
          </div>
        </div>
      )}
    </>
  );
}

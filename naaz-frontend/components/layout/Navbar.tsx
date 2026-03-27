"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, Menu, X, LogOut, ChevronDown } from "lucide-react";
// Assumes AuthContext, LoginModal, MobileDrawer, AnimatedCartIcon are stubbed or implemented
// import { useAuth } from '@/lib/context/AuthContext';
// import LoginModal from '@/components/auth/LoginModal';
// import AnimatedCartIcon from '@/components/ui/AnimatedCartIcon';
// import { MobileDrawer } from '@/components/ui/mobile-drawer';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const productsDropdownRef = useRef<HTMLDivElement>(null);
  const productsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isProductsDropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        productsDropdownRef.current &&
        !productsDropdownRef.current.contains(event.target as Node) &&
        productsButtonRef.current &&
        !productsButtonRef.current.contains(event.target as Node)
      ) {
        setIsProductsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProductsDropdownOpen]);

  // Stubbing Auth
  const isAuthenticated = false;
  const user = { name: "Test User", email: "test@example.com" };
  const handleSignOut = () => setIsUserDropdownOpen(false);

  const productCategories = [
    { name: "Islamic Books", path: "/products", available: true },
    { name: "Quran & Tafseer", path: "/products?category=quran", available: true },
    { name: "Hadith Collections", path: "/products?category=hadith", available: true },
    { name: "Perfumes", path: "/perfumes", available: false },
    { name: "Essentials", path: "/essentials", available: false },
  ];

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="bg-naaz-cream py-4 px-4">
          <div className="container mx-auto flex items-center justify-between">
            <Link href="/" className="flex flex-row gap-3 items-center">
              <div className="w-10 h-10 relative">
                {/* Fallback image component */}
              </div>
              <div className="flex flex-col items-start">
                <h1 className="text-2xl md:text-3xl font-playfair font-bold text-naaz-green">
                  Naaz Book Depot
                </h1>
                <p className="hidden md:block text-xs md:text-sm text-naaz-green/80 font-arabic">
                  Publishing the Light of Knowledge
                </p>
              </div>
            </Link>

            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium">
                Home
              </Link>

              <div className="relative">
                <button
                  ref={productsButtonRef}
                  className="flex items-center text-naaz-green hover:text-naaz-gold transition-colors font-medium"
                  type="button"
                  onClick={() => setIsProductsDropdownOpen((v) => !v)}
                >
                  Products
                  <ChevronDown
                    size={16}
                    className={`ml-1 transition-transform ${isProductsDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isProductsDropdownOpen && (
                  <div
                    ref={productsDropdownRef}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-4 z-50 animate-slide-down"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-semibold text-naaz-green">Browse Products</h3>
                    </div>
                    {productCategories.map((category, index) => (
                      <Link
                        key={index}
                        href={category.path}
                        className={`flex items-center justify-between px-4 py-3 transition-colors ${
                          category.available
                            ? "hover:bg-naaz-cream/50 text-gray-700 hover:text-naaz-green"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => setIsProductsDropdownOpen(false)}
                        tabIndex={category.available ? 0 : -1}
                        aria-disabled={!category.available}
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

              <Link href="/about" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium">
                About
              </Link>
              <Link href="/contact" className="text-naaz-green hover:text-naaz-gold transition-colors font-medium">
                Contact
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center">
                {isSearchExpanded ? (
                  <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2 w-80 transition-all duration-300">
                    <Search className="text-gray-400 mr-2" size={18} />
                    <input
                      type="text"
                      placeholder="Search for Islamic books, knowledge..."
                      className="flex-1 outline-none text-sm"
                      autoFocus
                      onBlur={() => setIsSearchExpanded(false)}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchExpanded(true)}
                    className="text-naaz-green hover:text-naaz-gold transition-colors p-2"
                  >
                    <Search size={24} />
                  </button>
                )}
              </div>

              <Link href="/cart">
                <span className="text-naaz-green hover:text-naaz-gold">Cart</span>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="text-naaz-green hover:text-naaz-gold transition-colors flex items-center space-x-1"
                >
                  <User size={24} />
                </button>
              </div>

              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-naaz-green">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;

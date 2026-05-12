"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Search, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../providers/session-provider';
import { 
  ProductsDropdown, 
  SearchBox, 
  UserActions, 
  AnimatedCartIcon, 
  MobileMenu 
} from '../ui/header-clients';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const productCategories = [
    { name: 'Islamic Books', path: '/books', available: true },
    { name: 'Atar', path: '/atar', available: true },
    { name: 'All Products', path: '/products', available: true },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-md py-2" 
          : "bg-white py-4"
      } border-b border-[var(--islamic-beige)]`}
    >
      <nav className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex flex-row gap-3 items-center group">
            <div className="relative overflow-hidden rounded-sm transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/Images/Naaz Book Depot Logo.svg"
                alt="Naaz Book Depot Logo"
                width={48}
                height={48}
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
                priority
              />
            </div>
            <div className="flex flex-col items-start">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-headings font-bold text-[var(--islamic-green)] tracking-tight leading-tight">
                Naaz Book Depot
              </h1>
              <p className="text-[10px] md:text-xs text-[var(--islamic-green)]/70 font-medium italic">
                Publishing the Light of Knowledge
              </p>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-10">
            <Link 
              href="/" 
              className="text-[var(--islamic-green)] hover:text-[var(--islamic-gold)] transition-colors duration-300 font-semibold text-sm tracking-widest uppercase relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[var(--islamic-gold)] after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
            >
              Home
            </Link>
            
            <ProductsDropdown productCategories={productCategories} />

            <Link 
              href="/about" 
              className="text-[var(--islamic-green)] hover:text-[var(--islamic-gold)] transition-colors duration-300 font-semibold text-sm tracking-widest uppercase relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[var(--islamic-gold)] after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-[var(--islamic-green)] hover:text-[var(--islamic-gold)] transition-colors duration-300 font-semibold text-sm tracking-widest uppercase relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[var(--islamic-gold)] after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
            >
              Contact
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 md:space-x-5">
            <SearchBox />
            <AnimatedCartIcon />
            <UserActions />
            <div className="lg:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ProductsDropdown,
  SearchBox,
  UserActions,
  AnimatedCartIcon,
  MobileMenu
} from '../ui/header-clients';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

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
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-[var(--islamic-green-dark)]/95 backdrop-blur-md shadow-lg py-2"
        : "bg-[var(--islamic-green-dark)] py-3"
        } border-b border-white/10`}
    >
      <nav className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex flex-row gap-2.5 items-center group hover:no-underline">
            <div className="relative transition-transform duration-500 group-hover:scale-105 flex-shrink-0">
              <Image
                src="/Images/logo.png"
                alt="Naaz Book Depot Logo"
                width={64}
                height={64}
                className="w-14 h-14 md:w-16 md:h-16 object-contain"
                priority
              />
            </div>
            <div className="flex flex-col items-start">
              <h1
                className="text-lg md:text-2xl lg:text-3xl font-headings font-bold tracking-tight leading-tight"
                style={{ background: 'linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                <span className="md:hidden">Naaz<br />Book<br />Depot</span>
                <span className="hidden md:inline">Naaz Book Depot</span>
              </h1>
              <p className="hidden md:block text-[10px] md:text-xs text-[var(--islamic-gold)]/80 font-medium italic">
                Publishing the Light of Knowledge
              </p>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-10">
            <Link
              href="/"
              className="text-white/90 hover:text-[var(--islamic-gold)] transition-colors duration-300 font-semibold text-base relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[var(--islamic-gold)] after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
            >
              Home
            </Link>

            <ProductsDropdown productCategories={productCategories} />

            <Link
              href="/blog"
              className="text-white/90 hover:text-[var(--islamic-gold)] transition-colors duration-300 font-semibold text-base relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[var(--islamic-gold)] after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
            >
              Insights
            </Link>
            <Link
              href="/about"
              className="text-white/90 hover:text-[var(--islamic-gold)] transition-colors duration-300 font-semibold text-base relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[var(--islamic-gold)] after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-white/90 hover:text-[var(--islamic-gold)] transition-colors duration-300 font-semibold text-base relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[var(--islamic-gold)] after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
            >
              FAQs
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

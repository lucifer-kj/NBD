"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
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



  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-[var(--islamic-green-dark)]/95 backdrop-blur-md shadow-md h-14 md:h-16"
        : "bg-[var(--islamic-green-dark)] h-16 md:h-20"
        } border-b border-white/10 flex items-center`}
    >
      <nav className="container mx-auto px-4 md:px-6 w-full">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex flex-row gap-2.5 items-center group hover:no-underline">
            <div className="relative transition-transform duration-500 group-hover:scale-105 flex-shrink-0">
              <Image
                src="/Images/logo.png"
                alt="Naaz Book Depot Logo"
                width={56}
                height={56}
                className={`transition-all duration-300 ${isScrolled ? "w-8 h-8 md:w-10 md:h-10" : "w-10 h-10 md:w-12 md:h-12"} object-contain`}
                priority
              />
            </div>
            <div className="flex flex-col items-start justify-center">
              <h1
                className={`font-headings font-bold tracking-wide transition-all duration-300 ${
                  isScrolled ? "text-base md:text-xl lg:text-2xl" : "text-lg md:text-2xl lg:text-3xl"
                }`}
                style={{ background: 'linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Naaz Book Depot
              </h1>
              <p className={`hidden md:block text-[9px] md:text-xs text-[var(--islamic-gold)]/80 font-medium italic transition-all duration-300 ${isScrolled ? "opacity-0 h-0 overflow-hidden" : "opacity-100 mt-0.5"}`}>
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

            <Link
              href="/products"
              className="text-white/90 hover:text-[var(--islamic-gold)] transition-colors duration-300 font-semibold text-base relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[var(--islamic-gold)] after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
            >
              Products
            </Link>

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

          {/* Action Buttons - Desktop & Tablet */}
          <div className="hidden md:flex items-center space-x-2 md:space-x-5">
            <SearchBox />
            <AnimatedCartIcon />
            <UserActions />
            <div className="lg:hidden">
              <MobileMenu />
            </div>
          </div>

          {/* Action Buttons - Mobile Hamburger Only */}
          <div className="md:hidden flex items-center">
            <MobileMenu />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

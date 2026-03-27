import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ProductsDropdown, 
  SearchBox, 
  UserActions, 
  AnimatedCartIcon, 
  MobileMenu 
} from '../ui/header-clients';

// Define layout using Tailwind CSS variables from globals.css
export async function Header() {
  let productCategories = [
    { name: 'Islamic Books', path: '/products', available: true },
    { name: 'Quran & Tafseer', path: '/products?category=quran', available: true },
    { name: 'Hadith Collections', path: '/products?category=hadith', available: true },
    { name: 'Perfumes', path: '/perfumes', available: false },
    { name: 'Essentials', path: '/essentials', available: false }
  ];

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${backendUrl}/api/catalog/categories/`, {
      cache: 'force-cache',
      next: { tags: ['categories'] }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
         productCategories = data.map((cat: any) => ({
           name: cat.name,
           path: `/categories/${cat.slug || cat.id}`,
           available: true
         }));
      }
    }
  } catch (err) {
    console.log('Django API offline, using fallback categories context.');
  }

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="bg-[#F8F6F3] py-4 px-4">
          <div className="container mx-auto flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-start flex-row gap-3 items-center">
              {/* Note: Replacing standard img with Next.js Image component */}
              <Image
                src="/Images/Naaz Book Depot Logo.svg"
                alt="Naaz Book Depot Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
                priority
              />
              <div className="flex flex-col items-start">
                <h1 className="text-2xl md:text-3xl font-headings font-bold text-[var(--islamic-green)]">
                  Naaz Book Depot
                </h1>
                <p className="hidden md:block text-xs md:text-sm text-[var(--islamic-green)]/80 font-arabic">
                  Publishing the Light of Knowledge
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-[var(--islamic-green)] hover:text-[#C7A536] transition-colors font-medium">
                Home
              </Link>
              
              <ProductsDropdown productCategories={productCategories} />

              <Link href="/about" className="text-[var(--islamic-green)] hover:text-[#C7A536] transition-colors font-medium">
                About
              </Link>
              <Link href="/contact" className="text-[var(--islamic-green)] hover:text-[#C7A536] transition-colors font-medium">
                Contact
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <SearchBox />
              <AnimatedCartIcon />
              <UserActions />
              <MobileMenu />
            </div>
          </div>
        </nav>
      </header>

      {/* Top Contact Banner */}
      <div className="w-full bg-[var(--islamic-green)] text-white text-xs md:text-sm font-medium text-center px-4 py-2">
        <span>
          📞 033 22350051 &nbsp;|&nbsp; 📞 033 22350960 &nbsp;|&nbsp; 📱 +91 91634 31395 &nbsp;|&nbsp; ✉️ naazgroupofficial@gmail.com &nbsp;|&nbsp; 📍 Visit us in Kolkata, West Bengal
        </span>
      </div>
    </>
  );
}
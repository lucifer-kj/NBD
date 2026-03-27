"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import NewsletterSection from "@/components/newsletter-section";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { TypewriterText } from "@/components/ui/typewriter-text";

const LEGACY_IMAGE = "/Images/About.jpg";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header and contact bar handled in layout/header.tsx */}

      {/* Hero Section from naaz-react */}
      <section className="relative h-[76vh] overflow-hidden">
        {/* Background with parallax effect via Next.js Image */}
        <div className="absolute inset-0 bg-[var(--islamic-green)] transform scale-110 transition-transform duration-1000 z-0">
          <Image
            src="/lovable-uploads/background.png"
            alt="Hero Background"
            fill
            priority
            className="object-cover object-center fixed"
          />
        </div>
        
        {/* Semi-transparent overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--islamic-green)]/80 via-[var(--islamic-green)]/60 to-[var(--islamic-green)]/80 z-0"></div>

        {/* Enhanced Glassmorphism Quranic Verse Overlay */}
        <div className="hidden lg:block absolute top-8 right-8 max-w-[350px] p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] text-right transform hover:scale-105 transition-all duration-500 z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
          <div className="relative z-10">
            <p className="font-arabic text-white text-xl leading-relaxed mb-4 drop-shadow-lg">
              اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
              <br />
              خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ
              <br />
              اقْرَأْ وَرَبُّكَ الْأَكْرَمُ
              <br />
              الَّذِي عَلَّمَ بِالْقَلَمِ
              <br />
              عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ
            </p>
            <p className="text-white/90 text-sm italic leading-relaxed">
              "Read in the name of your Lord who created—
              Created man from a clot.
              Read, and your Lord is the Most Generous—
              Who taught by the pen—
              Taught man that which he knew not."
              <span className="block mt-2 text-white/70 text-xs font-semibold">
                (Surah Al-'Alaq, 96:1–5)
              </span>
            </p>
          </div>
        </div>

        {/* Content - Restored left alignment */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl text-left">
            <h1 className="text-4xl md:text-6xl font-headings font-bold text-white mb-6 animate-fade-in transform translate-x-0 opacity-100 transition-all duration-1000 drop-shadow-2xl text-left">
              Naaz Book Depot
            </h1>
            
            {/* Typewriter effect extracted to client component */}
            <div className="mb-8 text-left">
              <p className="text-xl md:text-2xl text-white/95 font-sans italic min-h-[2.5rem] text-left">
                "<TypewriterText fullText="Publishing the Light of Knowledge since 1967" />"
              </p>
            </div>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl text-left font-light">
              A pioneering publishing company since 1967, specializing in authentic Islamic literature 
              and the Qur'an in multiple languages, serving the global Muslim community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in justify-start">
              <Link href="/about" className="group bg-[#C7A536] text-[var(--islamic-green)] px-8 py-4 rounded-xl font-bold hover:bg-[#b89a2e] transition-all duration-300 text-center transform hover:scale-105 hover:shadow-2xl">
                <span className="flex items-center justify-center gap-2">
                  Discover Our Legacy
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="/books" className="group border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-[var(--islamic-green)] transition-all duration-300 text-center transform hover:scale-105">
                <span className="flex items-center justify-center gap-2">
                  Explore Books
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Islamic Books Section */}
      <section className="bg-[#F8F6F3] py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-headings font-bold text-[var(--islamic-green)] text-center mb-4">Shop by Category</h2>
          <div className="flex justify-center mb-6">
            <div className="h-1 w-20 bg-[var(--islamic-gold)] rounded" />
          </div>
          <p className="text-lg text-center text-[var(--charcoal)]/70 mb-12 max-w-2xl mx-auto">
            Explore our curated categories for all your needs
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Books Category */}
            <Link href="/categories/books" className="group bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transition hover:shadow-xl m-2 focus:outline-none focus:ring-2 focus:ring-[var(--islamic-gold)]">
              <div className="w-full flex justify-center mb-8">
                <Image src="/Images/Books.jpeg" alt="Books" width={180} height={180} className="rounded-lg object-contain shadow group-hover:scale-105 transition" style={{ width: '100%', height: 'auto' }} />
              </div>
              <h3 className="text-lg font-headings font-bold mb-1 text-[var(--islamic-green)]">Books</h3>
              <div className="text-[var(--charcoal)]/70 mb-2 text-sm">Authentic Islamic literature and Qur&apos;an in multiple languages</div>
            </Link>
            {/* Perfumes Category */}
            <Link href="/categories/perfumes" className="group bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transition hover:shadow-xl m-2 focus:outline-none focus:ring-2 focus:ring-[var(--islamic-gold)]">
              <div className="w-full flex justify-center mb-8">
                <Image src="/Images/ittars.jpeg" alt="Perfumes" width={180} height={180} className="rounded-lg object-contain shadow group-hover:scale-105 transition" style={{ width: '100%', height: 'auto' }} />
              </div>
              <h3 className="text-lg font-headings font-bold mb-1 text-[var(--islamic-green)]">Perfumes</h3>
              <div className="text-[var(--charcoal)]/70 mb-2 text-sm">Premium attar and fragrances for every occasion</div>
            </Link>
            {/* Rehal Category */}
            <Link href="/categories/rehal" className="group bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transition hover:shadow-xl m-2 focus:outline-none focus:ring-2 focus:ring-[var(--islamic-gold)]">
              <div className="w-full flex justify-center mb-8">
                <Image src="/Images/Rehals.jpeg" alt="Rehal (Quran Stand)" width={180} height={180} className="rounded-lg object-contain shadow group-hover:scale-105 transition" style={{ width: '100%', height: 'auto' }} />
              </div>
              <h3 className="text-lg font-headings font-bold mb-1 text-[var(--islamic-green)]">Rehal (Quran Stand)</h3>
              <div className="text-[var(--charcoal)]/70 mb-2 text-sm">Beautifully crafted stands for the Holy Qur&apos;an</div>
            </Link>
          </div>
        </div>
      </section>

      {/* About/Legacy Section */}
      <section className="bg-[#F8F6F3] py-20">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center justify-center max-w-5xl mx-auto">
          {/* Left: Text Content */}
          <div>
            <h2 className="text-4xl font-headings font-bold text-[var(--islamic-green)] mb-4">A Legacy of Knowledge<br />Since 1967</h2>
            <div className="h-1 w-20 bg-[var(--islamic-gold)] rounded mb-6" />
            <p className="text-lg text-[var(--charcoal)]/90 mb-6 max-w-xl">
              Founded in the heart of Kolkata, Naaz Book Depot has been a beacon of Islamic knowledge for over five decades. Our journey began with a simple mission: to make authentic Islamic literature accessible to every seeker of knowledge.
            </p>
            <p className="text-lg text-[var(--charcoal)]/90 mb-8 max-w-xl">
              Today, we continue this tradition by expanding our offerings while maintaining our commitment to authenticity and quality in Islamic education.
            </p>
            <Link href="/about">
              <Button className="bg-[var(--islamic-gold)] text-[var(--islamic-green)] font-bold px-5 py-2 text-base shadow-md hover:bg-[var(--islamic-gold-dark)]">
                Learn More About Us
              </Button>
            </Link>
          </div>
          {/* Right: Image and Caption */}
          <div className="flex flex-col items-center"> 
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-lg lg:mb-4 sm:mx-5">
              <Image
                src={LEGACY_IMAGE}
                alt="Naaz Book Depot Founder"
                width={380}
                height={260}
                className="object-cover w-full h-full"
                priority
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <div className="text-center text-[var(--islamic-green)] font-medium text-lg">Mohammad Irfan</div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  );
} 
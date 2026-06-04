"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Shield, Truck, Users } from 'lucide-react';

const HeroSection = () => {
  const [typewriterText, setTypewriterText] = useState('');
  const [typewriterIndex, setTypewriterIndex] = useState(0);

  const fullTypewriterText = "Publishing the Light of Knowledge since 1967";

  // Typewriter effect
  useEffect(() => {
    if (typewriterIndex < fullTypewriterText.length) {
      const timer = setTimeout(() => {
        setTypewriterText(prev => prev + fullTypewriterText[typewriterIndex]);
        setTypewriterIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [typewriterIndex]);

  return (
    <section className="relative h-[80vh] overflow-hidden flex items-center">
      {/* Background with CSS scroll-driven parallax effect */}
      <div
        className="absolute inset-0 z-0 hero-scroll-parallax"
        style={{
          backgroundImage: "url('/Images/Image+Background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Semi-transparent overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--islamic-green-dark)]/90 via-[var(--islamic-green)]/70 to-[var(--islamic-green-dark)]/90 z-[1]"></div>

      {/* Enhanced Glassmorphism Quranic Verse Overlay */}
      <div className="hidden lg:block absolute top-10 right-10 max-w-[320px] p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl text-right transform hover:scale-105 transition-all duration-700 z-10">
        <div className="relative z-10">
          <p className="font-arabic text-white text-l leading-loose mb-4 drop-shadow-lg">
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
          <div className="h-[1px] w-16 bg-[var(--islamic-gold)] ml-auto mb-4 opacity-50"></div>
          <p className="text-white/80 text-xs italic leading-relaxed font-light">
            &ldquo;Read in the name of your Lord who created&mdash;
            Created man from a clot.
            Read, and your Lord is the Most Generous&mdash;
            Who taught by the pen&mdash;
            Taught man that which he knew not.&rdquo;
            <span className="block mt-3 text-[var(--islamic-gold)] text-[10px] font-bold tracking-widest uppercase">
              Surah Al-&apos;Alaq, 96:1&ndash;5
            </span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 flex items-center">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 rounded-full bg-[var(--islamic-gold)]/10 border border-[var(--islamic-gold)]/20 text-[var(--islamic-gold)] text-[10px] font-bold tracking-widest uppercase mb-4 animate-fade-in">
            Established 1967
          </div>

          <h1 className="text-4xl md:text-6xl font-headings font-bold text-white mb-4 leading-tight drop-shadow-2xl">
            Naaz <span className="text-[var(--islamic-gold)]">Book</span> Depot
          </h1>

          {/* Typewriter effect */}
          <div className="mb-6">
            <p className="text-lg md:text-2xl text-white/90 font-headings italic min-h-[2rem] tracking-wide">
              &ldquo;{typewriterText}&rdquo;
              <span className="animate-pulse ml-1 text-[var(--islamic-gold)]">|</span>
            </p>
          </div>

          <p className="text-base md:text-lg text-white/80 mb-6 leading-relaxed max-w-xl font-light">
            Buy authentic Quran copies, Islamic literature, scholarly texts, and Quran stands — curated and published from Kolkata for Muslims across India and worldwide.
          </p>

          {/* Trust Signals Row */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-white/90 text-xs transition-colors duration-300 hover:bg-white/10">
              <Shield size={14} className="text-[var(--islamic-gold)]" />
              <span>Est. 1967</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-white/90 text-xs transition-colors duration-300 hover:bg-white/10">
              <Truck size={14} className="text-[var(--islamic-gold)]" />
              <span>Shipped India-Wide</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-white/90 text-xs transition-colors duration-300 hover:bg-white/10">
              <Users size={14} className="text-[var(--islamic-gold)]" />
              <span>10,000+ Ummah Served</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/books"
              className="group bg-[var(--islamic-gold)] text-[var(--islamic-green-dark)] px-8 py-3.5 rounded-xl font-bold hover:bg-[var(--islamic-gold-dark)] transition-all duration-300 text-center shadow-lg hover:shadow-[var(--islamic-gold)]/20 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
            >
              Browse Islamic Books
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/products?search=rehal"
              className="group border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-white hover:text-[var(--islamic-green-dark)] transition-all duration-300 text-center flex items-center justify-center gap-2 backdrop-blur-sm text-sm w-full sm:w-auto"
            >
              Shop Quran Stands
              <BookOpen size={18} className="group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

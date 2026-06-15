"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Heart, Shield, Truck, Users } from 'lucide-react';
import { useDonationStore } from "@/store/donation-store";

const HeroSection = () => {
  const openDonation = useDonationStore((state) => state.open);
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
    <section className="relative h-[85vh] overflow-hidden flex items-center">
      {/* Premium glow and shimmer CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212, 168, 83, 0.4); }
          50% { box-shadow: 0 0 16px 4px rgba(212, 168, 83, 0.2); }
        }
        .premium-donation-btn {
          position: relative;
          overflow: hidden;
        }
        .premium-donation-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          transition: left 0.75s ease-in-out;
        }
        .premium-donation-btn:hover::before {
          left: 100%;
        }
        .premium-donation-btn:hover {
          animation: pulseGlow 2s infinite;
        }
      `}} />

      {/* Background with CSS scroll-driven parallax effect */}
      <div className="absolute inset-0 z-0 hero-scroll-parallax">
        <Image
          src="/Images/Image+Background.jpg"
          alt="Naaz Book Depot Hero Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Semi-transparent overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--islamic-green-dark)]/90 via-[var(--islamic-green)]/70 to-[var(--islamic-green-dark)]/90 z-[1]"></div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full flex flex-row items-center justify-between gap-12">
        {/* Left Column: Hero Text */}
        <div className="max-w-2xl lg:max-w-[650px] w-full">
          <div className="inline-block px-3 py-1 rounded-full bg-[var(--islamic-gold)]/10 border border-[var(--islamic-gold)]/20 text-[var(--islamic-gold)] text-[10px] font-bold tracking-widest uppercase mb-4 animate-fade-in">
            Established 1967
          </div>

          <h1 className="text-4xl md:text-6xl font-headings font-bold text-white mb-4 leading-tight drop-shadow-2xl">
            Naaz <span className="text-[var(--islamic-gold)]">Book</span> Depot
          </h1>

          {/* Typewriter effect */}
          <div className="mb-6">
            <p className="text-lg md:text-2xl text-white/90 font-headings italic min-h-[3.5rem] sm:min-h-[2rem] tracking-wide">
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

        {/* Right Column: Quranic Verse Card & Razorpay Donation Widget */}
        <div className="hidden lg:flex flex-col items-center gap-5 max-w-[300px] shrink-0 w-full">
          {/* Enhanced Glassmorphism Quranic Verse Overlay */}
          <div className="w-full p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl text-right transform hover:scale-[1.01] transition-all duration-500">
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
            <p className="text-white/80 text-xs italic leading-relaxed font-light text-left">
              &ldquo;Read in the name of your Lord who created&mdash;
              Created man from a clot.
              Read, and your Lord is the Most Generous&mdash;
              Who taught by the pen&mdash;
              Taught man that which he knew not.&rdquo;
              <span className="block mt-3 text-[var(--islamic-gold)] text-[10px] font-bold tracking-widest uppercase text-right">
                Surah Al-&apos;Alaq, 96:1&ndash;5
              </span>
            </p>
          </div>

          {/* Premium Desktop Donation Redirect Button */}
          <div className="relative group w-full">
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 w-52 p-2 bg-[var(--islamic-green-dark)] border border-[var(--islamic-gold)]/40 text-[9px] text-white/90 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-50 text-center leading-normal">
              Your donations support printing classical Islamic books and translation efforts.
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--islamic-green-dark)]"></div>
            </div>

            <button
              onClick={openDonation}
              className="premium-donation-btn flex items-center justify-between w-full p-4 rounded-xl bg-[#0D2E21] border border-[var(--islamic-gold)]/35 hover:border-[var(--islamic-gold)] hover:bg-[#133F2E] text-white hover:shadow-[0_8px_24px_rgba(212,168,83,0.15)] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[var(--islamic-gold)] group-hover:scale-110 transition-transform">
                  <Heart size={14} fill="currentColor" className="text-[var(--islamic-gold)]" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold tracking-wide">Sadqa-e-Jariyah</div>
                  <div className="text-[9px] text-white/50 font-light">Support our spiritual mission</div>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded border border-white/10">
                <svg fill="#528FF0" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="9" height="9">
                  <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z" />
                </svg>
                <span className="text-[9px] text-white font-bold tracking-tight ml-1">Razorpay</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

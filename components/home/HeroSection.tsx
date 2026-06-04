"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Shield, Truck, Users } from 'lucide-react';

const HeroSection = () => {
  const [typewriterText, setTypewriterText] = useState('');
  const [typewriterIndex, setTypewriterIndex] = useState(0);

  // Donation form state
  const [amount, setAmount] = useState<number>(250);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    setPaymentStatus('loading');

    // Load Razorpay Checkout SDK
    const loadScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const isLoaded = await loadScript();
    if (!isLoaded) {
      setPaymentStatus('error');
      alert('Failed to load Razorpay SDK. Please check your internet connection.');
      return;
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder';

    interface RazorpaySuccessResponse {
      razorpay_payment_id: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    }

    interface RazorpayFailedResponse {
      error: {
        code?: string;
        description?: string;
        source?: string;
        step?: string;
        reason?: string;
        metadata?: unknown;
      };
    }

    const options = {
      key: keyId,
      amount: amount * 100, // in paise
      currency: 'INR',
      name: 'Naaz Book Depot',
      description: 'Support Our Spiritual Mission',
      image: '/favicon.ico',
      prefill: {
        name: name,
        email: email,
      },
      handler: function (response: RazorpaySuccessResponse) {
        setPaymentStatus('success');
        console.log('Payment successful:', response);
      },
      theme: {
        color: '#1F4E3D', // Islamic Green-Dark
      },
      modal: {
        ondismiss: function () {
          setPaymentStatus('idle');
        }
      }
    };

    try {
      const rzpConstructor = (window as unknown as { 
        Razorpay: new (opts: unknown) => { 
          open: () => void; 
          on: (event: string, callback: (res: RazorpayFailedResponse) => void) => void 
        } 
      }).Razorpay;
      
      const rzp = new rzpConstructor(options);
      rzp.on('payment.failed', function (response: RazorpayFailedResponse) {
        console.error('Payment failed:', response.error);
        setPaymentStatus('error');
      });
      rzp.open();
    } catch (err) {
      console.error('Error opening Razorpay checkout:', err);
      // Fallback behavior if key is a placeholder
      if (keyId === 'rzp_test_placeholder') {
        setTimeout(() => {
          setPaymentStatus('success');
        }, 1500);
      } else {
        setPaymentStatus('error');
      }
    }
  };

  return (
    <section className="relative h-[85vh] overflow-hidden flex items-center">
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

        {/* Right Column: Quranic Verse Card & Razorpay Donation Widget */}
        <div className="hidden lg:flex flex-col items-center gap-5 max-w-[300px] shrink-0">
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

          {/* Interactive Expandable Razorpay Donation Card */}
          <div 
            onClick={() => !isExpanded && setIsExpanded(true)}
            className={`w-full rounded-2xl border transition-all duration-500 ${
              isExpanded 
                ? 'bg-[var(--islamic-green-dark)] border-[var(--islamic-gold)]/40 scale-100 p-4' 
                : 'bg-[var(--islamic-green-dark)] border-white/10 hover:border-[var(--islamic-gold)]/40 hover:bg-[#153D2C] hover:scale-[1.02] cursor-pointer p-4 hover:shadow-[0_8px_24px_rgba(212,168,83,0.12)]'
            }`}
          >
            {paymentStatus === 'success' ? (
              <div className="flex flex-col items-center justify-center py-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h4 className="font-headings font-bold text-white text-xs">JazakAllah Khair</h4>
                <p className="text-[10px] text-white/70 max-w-[220px] leading-normal font-light">
                  Your contribution of <span className="font-bold text-[var(--islamic-gold)]">₹{amount}</span> was initiated. May Allah bless you for supporting our mission.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPaymentStatus('idle');
                    setIsExpanded(false);
                    setName('');
                    setEmail('');
                  }}
                  className="mt-2 px-3 py-1 rounded-lg border border-white/15 hover:bg-white/5 text-[9px] font-semibold text-white/80 transition-all"
                >
                  Close
                </button>
              </div>
            ) : !isExpanded ? (
              /* Collapsed State Layout */
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-xs tracking-wide">Sadqa-e-Jariyah</span>
                </div>
                {/* Embedded Razorpay Logo */}
                <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                  <span className="text-[8px] text-white/50 font-medium">via</span>
                  <svg fill="#528FF0" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="10" height="10">
                    <title>Razorpay</title>
                    <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z"/>
                  </svg>
                  <span className="text-[9px] text-white font-bold tracking-tight ml-1">Razorpay</span>
                </div>
              </div>
            ) : (
              /* Expanded Form State Layout */
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs tracking-wide">Sadqa-e-Jariyah</span>
                    {/* Tooltip Icon & Popup */}
                    <div className="group/tooltip relative flex items-center">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 hover:text-white cursor-help">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[var(--islamic-green-dark)] border border-white/15 text-[9px] text-white/90 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-300 z-50 text-center leading-normal">
                        Your donations support printing classical Islamic books and translation efforts.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--islamic-green-dark)]"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                    <svg fill="#528FF0" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="10" height="10">
                      <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.65 24h4.391l6.395-24zM14.26 10.098L3.389 17.166 1.564 24h9.008l3.688-13.902Z"/>
                    </svg>
                    <span className="text-[9px] text-white font-bold tracking-tight ml-1">Razorpay</span>
                  </div>
                </div>

                <form onSubmit={handleDonate} className="space-y-2.5" onClick={(e) => e.stopPropagation()}>
                  {/* Quick Select Buttons */}
                  <div>
                    <label className="block text-[9px] text-white/50 mb-1 font-medium">Select Amount</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[100, 250, 500, 1000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmount(val)}
                          className={`py-0.5 rounded text-[10px] font-bold transition-all border ${
                            amount === val
                              ? 'bg-[var(--islamic-gold)] text-[var(--islamic-green-dark)] border-[var(--islamic-gold)]'
                              : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                          }`}
                        >
                          ₹{val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-1.5">
                    {/* Custom Amount */}
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40 text-[10px]">₹</span>
                      <input
                        type="number"
                        value={amount || ''}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        placeholder="Custom Amount"
                        min="1"
                        required
                        className="w-full pl-5 pr-2 py-1 rounded-md bg-white/5 border border-white/10 text-white text-[10px] placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[var(--islamic-gold)] focus:bg-white/10 transition-all"
                      />
                    </div>
                    {/* Name */}
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      required
                      className="w-full px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white text-[10px] placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[var(--islamic-gold)] focus:bg-white/10 transition-all"
                    />
                    {/* Email */}
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your Email"
                      required
                      className="w-full px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white text-[10px] placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[var(--islamic-gold)] focus:bg-white/10 transition-all"
                    />
                  </div>

                  {/* Submit & Close CTA bar */}
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(false);
                        setPaymentStatus('idle');
                      }}
                      className="px-2.5 py-1 rounded-md border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-[10px] font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={paymentStatus === 'loading'}
                      className="flex-1 flex items-center justify-center gap-1 py-1 rounded-md bg-[#133F2E] border border-[var(--islamic-gold)]/30 hover:border-[var(--islamic-gold)] hover:bg-[#1a543e] text-[var(--islamic-gold)] hover:text-white text-[10px] font-bold shadow-md transition-all duration-300 disabled:opacity-50"
                    >
                      {paymentStatus === 'loading' ? 'Opening...' : 'Sadqa-e-Jariyah'}
                      <ArrowRight size={10} />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

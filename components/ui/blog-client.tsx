'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Share2, Link2, List, X, ShoppingCart, BookOpen, ShieldCheck, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, cn } from '@/lib/utils';
import { ReshapedProduct } from '@/types/shopify';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setProgress(currentProgress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[4px] z-50 bg-gray-100">
      <div 
        className="h-full bg-gradient-to-r from-[var(--islamic-gold)] to-[var(--islamic-green)] transition-all duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function TableOfContents({ headings }: { headings: HeadingItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id));
      const scrollPosition = window.scrollY + 200;

      // Find the current heading that is active
      let currentActiveId = '';
      for (let i = 0; i < headingElements.length; i++) {
        const el = headingElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          currentActiveId = headings[i].id;
        }
      }
      
      // Default to first heading if none are scrolled past yet
      if (!currentActiveId && headings.length > 0) {
        currentActiveId = headings[0].id;
      }

      setActiveId(currentActiveId);
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger once on mount
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Desktop TOC (Sticky Sidebar) */}
      <nav className="hidden lg:block sticky top-24 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm max-h-[calc(100vh-120px)] overflow-y-auto">
        <h3 className="font-headings font-bold text-lg text-[var(--islamic-green)] flex items-center gap-2 mb-4">
          <List size={18} className="text-[var(--islamic-gold)]" />
          Table of Contents
        </h3>
        <ul className="space-y-3 text-sm">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            return (
              <li 
                key={heading.id}
                style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                className="transition-all duration-200"
              >
                <a 
                  href={`#${heading.id}`}
                  className={`block py-1 hover:text-[var(--islamic-gold)] transition-colors border-l-2 pl-3 ${
                    isActive 
                      ? 'border-[var(--islamic-gold)] font-semibold text-[var(--islamic-green)] bg-amber-50/50 rounded-r-lg' 
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile Floating TOC Button & Modal */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Table of contents"
          className="p-4 bg-[var(--islamic-green)] text-white rounded-full shadow-lg hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green)] transition-all flex items-center justify-center"
        >
          {isOpen ? <X size={20} /> : <List size={20} />}
        </button>

        {isOpen && (
          <div className="absolute bottom-16 right-0 w-72 max-h-96 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-y-auto p-6 animate-in slide-in-from-bottom-5 duration-200">
            <h3 className="font-headings font-bold text-base text-[var(--islamic-green)] flex items-center gap-2 mb-3">
              <List size={16} className="text-[var(--islamic-gold)]" />
              Table of Contents
            </h3>
            <ul className="space-y-3 text-sm">
              {headings.map((heading) => {
                const isActive = activeId === heading.id;
                return (
                  <li 
                    key={heading.id}
                    style={{ paddingLeft: `${(heading.level - 1) * 8}px` }}
                  >
                    <a 
                      href={`#${heading.id}`}
                      onClick={() => setIsOpen(false)}
                      className={`block py-1 hover:text-[var(--islamic-gold)] transition-colors border-l-2 pl-2 ${
                        isActive 
                          ? 'border-[var(--islamic-gold)] font-semibold text-[var(--islamic-green)] bg-amber-50/30 rounded-r' 
                          : 'border-transparent text-gray-500'
                      }`}
                    >
                      {heading.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

export function ShareButton({ title, excerpt }: { title: string; excerpt: string }) {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: `${title} | Naaz Book Depot`,
      text: excerpt,
      url: shareUrl,
    };

    if (typeof window !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setShowOptions(!showOptions);
        }
      }
    } else {
      setShowOptions(!showOptions);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} | Naaz Book Depot`)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareToWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${shareUrl}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative flex items-center gap-2">
      <button 
        onClick={handleShare}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--islamic-green)] to-[#1E4620] rounded-full shadow-sm hover:shadow-md transition-all text-white border border-transparent hover:from-[var(--islamic-gold)] hover:to-[#B58A3D] hover:text-[var(--islamic-green)] font-semibold text-xs tracking-wider uppercase"
      >
        <Share2 size={14} />
        <span>Share</span>
      </button>

      {/* Slide-out options */}
      <div className={`flex items-center gap-2 transition-all duration-300 ${showOptions ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-2 w-0 overflow-hidden pointer-events-none'}`}>
        {/* Twitter Button */}
        <button
          onClick={shareToTwitter}
          aria-label="Share on Twitter"
          className="p-2 bg-white rounded-full border border-gray-100 shadow-sm text-gray-600 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/5 transition-all duration-200"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </button>

        {/* WhatsApp Button */}
        <button
          onClick={shareToWhatsApp}
          aria-label="Share on WhatsApp"
          className="p-2 bg-white rounded-full border border-gray-100 shadow-sm text-gray-600 hover:text-[#25D366] hover:border-[#25D366]/30 hover:bg-[#25D366]/5 transition-all duration-200"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.59 1.972 14.113 1.94 12.012 1.94c-5.437 0-9.863 4.373-9.867 9.8.001 2.014.528 3.982 1.528 5.724L2.684 21.4l4.283-1.124-.32-.122z"/>
          </svg>
        </button>

        {/* Copy Link Button */}
        <button
          onClick={copyToClipboard}
          aria-label="Copy link to clipboard"
          className="p-2 bg-white rounded-full border border-gray-100 shadow-sm text-gray-600 hover:text-[var(--islamic-gold)] hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-200"
        >
          <Link2 size={16} />
        </button>
      </div>

      {copied && (
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap animate-bounce flex items-center gap-1 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--islamic-gold)] animate-ping" />
          Link copied to clipboard!
        </span>
      )}
    </div>
  );
}

export function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('[Newsletter client error]:', err);
      setStatus('error');
    }
  };

  return (
    <div className="bg-[#1B3A2D] p-8 rounded-sm text-center relative overflow-hidden group border border-[#C9972A]/10">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9972A]/5 rounded-full blur-xl pointer-events-none transition-transform group-hover:scale-125 duration-500" />
      
      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#C9972A]/10 text-[#C9972A] mb-4">
        🕌
      </span>
      <h4 className="font-headings text-2xl font-black text-[#FAF6EE] mb-2">Naaz Newsletter</h4>
      <p className="font-sans text-xs text-[#FAF6EE]/60 mb-6 leading-relaxed uppercase tracking-widest">
        Subscribe to receive monthly authenticated scholarly reviews and exclusive releases.
      </p>

      {status === 'success' ? (
        <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded-lg p-4 text-center animate-in fade-in zoom-in-95 duration-200">
          <p className="text-sm font-semibold">JazakAllah Khair! ✨</p>
          <p className="text-xs mt-1 text-emerald-400/80">Successfully subscribed to our newsletter.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === 'error' && (
            <p className="text-red-400 text-xs font-semibold animate-pulse text-left">
              Subscription failed. Please check your email.
            </p>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="w-full bg-[#FAF6EE] border-none px-4 py-3 text-sm font-sans placeholder:text-[#1B3A2D]/40 focus:ring-2 focus:ring-[#C9972A] outline-none text-[#1B3A2D] rounded-sm transition-all"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-4 bg-[#C9972A] text-[#1B3A2D] font-sans text-xs font-black tracking-[0.2em] hover:bg-[#D4A843] transition-colors uppercase cursor-pointer rounded-sm disabled:opacity-50"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  );
}

export function InlineProductCard({ product }: { product: ReshapedProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useCartStore((s) => s.openCartDrawer);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const price = product.priceRange?.minVariantPrice;
  const imageUrl = product.images?.[0]?.url || '/Images/Books.jpeg';
  const inStock = product.availableForSale;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || loading) return;

    setLoading(true);
    const variantId = product.variants?.[0]?.id;
    if (variantId) {
      await addItem(variantId, 1);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        openCartDrawer();
      }, 1000);
    }
    setLoading(false);
  };

  return (
    <div className="my-8 p-6 md:p-8 bg-gradient-to-br from-amber-50/20 to-orange-50/10 border border-amber-100/50 rounded-3xl shadow-sm hover:border-[var(--islamic-gold)]/40 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--islamic-gold)]/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
      
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Cover Image */}
        <Link 
          href={`/products/${product.handle}`}
          className="relative w-28 h-40 rounded-2xl overflow-hidden shadow-md border border-gray-100/80 flex-shrink-0 bg-white group-hover:shadow-lg transition-shadow duration-300 block"
        >
          <Image 
            src={imageUrl} 
            alt={product.title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Details */}
        <div className="flex-1 flex flex-col justify-between h-full space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-amber-100/70 text-[var(--islamic-green)] text-[10px] px-2.5 py-0.5 rounded-full font-sans uppercase font-bold tracking-wider flex items-center gap-1 border border-amber-200/40">
                <ShieldCheck size={12} className="text-[var(--islamic-gold)]" />
                Verified Scholarly Edition
              </span>
              {!inStock && (
                <span className="bg-rose-50 text-rose-700 text-[10px] px-2.5 py-0.5 rounded-full font-sans uppercase font-bold tracking-wider">
                  Out of Stock
                </span>
              )}
            </div>

            <h4 className="font-headings font-bold text-lg md:text-xl text-[var(--islamic-green)] hover:text-[var(--islamic-gold)] transition-colors line-clamp-2 leading-snug">
              <Link href={`/products/${product.handle}`}>
                {product.title}
              </Link>
            </h4>
            
            <p className="text-xs uppercase font-semibold text-[var(--islamic-gold)] tracking-wider mt-1.5 font-sans">
              {product.vendor || 'Naaz Editions'}
            </p>

            {product.description && (
              <p className="text-gray-500 text-xs md:text-sm mt-3 line-clamp-2 leading-relaxed font-sans">
                {product.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-amber-100/30">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-sans">Price</span>
              <span className="font-sans font-extrabold text-lg text-gray-900">
                {price ? formatPrice(price.amount, price.currencyCode) : 'Price unavailable'}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!inStock || loading}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-transparent shadow-sm ${
                added 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : inStock 
                    ? 'bg-[var(--islamic-green)] text-white hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green)]' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : added ? (
                'Added to Cart! ✓'
              ) : (
                <>
                  <ShoppingCart size={14} />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InlineProductBadge({ product }: { product: ReshapedProduct }) {
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const openCartDrawer = useCartStore((s) => s.openCartDrawer);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const price = product.priceRange?.minVariantPrice;
  const imageUrl = product.images?.[0]?.url || '/Images/Books.jpeg';
  const inStock = product.availableForSale;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    };

    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopover]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || loading) return;

    setLoading(true);
    const variantId = product.variants?.[0]?.id;
    if (variantId) {
      await addItem(variantId, 1);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        setShowPopover(false);
        openCartDrawer();
      }, 800);
    }
    setLoading(false);
  };

  return (
    <span className="relative inline-block align-middle mx-1">
      <span
        ref={triggerRef}
        onClick={() => setShowPopover(!showPopover)}
        onMouseEnter={() => setShowPopover(true)}
        className="inline-flex items-center gap-1.5 bg-amber-50/60 hover:bg-amber-100/80 text-[var(--islamic-green)] border border-[var(--islamic-gold)]/40 hover:border-[var(--islamic-gold)] px-2.5 py-0.5 rounded-xl text-xs font-bold cursor-pointer select-none transition-all shadow-sm font-sans"
      >
        <BookOpen size={11} className="text-[var(--islamic-gold)]" />
        <span>{product.title}</span>
        <span className="text-[9px] font-sans font-semibold text-gray-500">
          ({price ? formatPrice(price.amount, price.currencyCode) : ''})
        </span>
      </span>

      <AnimatePresence>
        {showPopover && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onMouseLeave={() => setShowPopover(false)}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl p-4 flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150"
            style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.05))' }}
          >
            {/* Popover Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-white border-r border-b border-gray-100 rotate-45 pointer-events-none" />

            <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50">
              <Image 
                src={imageUrl} 
                alt={product.title} 
                fill 
                className="object-cover"
              />
            </div>
            
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <h5 className="font-headings font-bold text-xs text-[var(--islamic-green)] line-clamp-2 leading-snug">
                  {product.title}
                </h5>
                <span className="text-[9px] uppercase font-bold text-[var(--islamic-gold)] tracking-wider mt-0.5 block font-sans">
                  {product.vendor || 'Naaz Editions'}
                </span>
                <span className="font-sans font-bold text-xs text-gray-900 mt-1 block">
                  {price ? formatPrice(price.amount, price.currencyCode) : ''}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Link
                  href={`/products/${product.handle}`}
                  className="px-2 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-wider rounded-xl font-sans"
                >
                  View
                </Link>
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || loading}
                  className={`flex-1 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 border border-transparent ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : inStock
                        ? 'bg-[var(--islamic-green)] text-white hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green)]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : added ? (
                    'Added!'
                  ) : (
                    <>
                      <ShoppingCart size={10} />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

interface FaqItem {
  question: string;
  answer: string;
}

export function BlogFaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col">
      {faqs.map((item, idx) => {
        const isOpen = openFaq === idx;
        return (
          <div
            key={idx}
            className={cn(
              "border-b border-[#C9972A]/20 transition-all duration-300",
              isOpen && "bg-[#FAF6EE] border-l-4 border-l-[#C9972A]"
            )}
          >
            <button
              onClick={() => setOpenFaq(isOpen ? null : idx)}
              className="w-full py-6 px-4 flex items-center justify-between text-left group cursor-pointer"
            >
              <span
                className={cn(
                  "font-body text-xl md:text-2xl font-medium transition-colors",
                  isOpen ? "text-[#1B3A2D]" : "text-[#1B3A2D]/80 group-hover:text-[#C9972A]"
                )}
              >
                {item.question}
              </span>
              {isOpen ? (
                <Minus className="w-6 h-6 text-[#C9972A] shrink-0" />
              ) : (
                <Plus className="w-6 h-6 text-[#C9972A] shrink-0" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pb-8 px-4 font-body text-lg leading-relaxed text-[#1B3A2D]/70 max-w-[700px]">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function MobileReaderBar({ headings }: { headings: HeadingItem[]; title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (headings.length === 0) return;

    // Observe headings to track the currently active section
    const observers: IntersectionObserver[] = [];
    
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setActiveId(heading.id);
            }
          },
          {
            threshold: 0.2,
            rootMargin: '-10% 0px -60% 0px',
          }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    // Track reading progress
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = Math.min((window.scrollY / totalScroll) * 100, 100);
        setProgress(Math.round(currentProgress));
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // initial call

    return () => {
      observers.forEach((obs) => obs.disconnect());
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headings]);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth',
      });
      setIsOpen(false);
    }
  };

  if (headings.length === 0) return null;

  const activeHeading = headings.find(h => h.id === activeId);
  const activeLabel = activeHeading ? activeHeading.text : 'Introduction';

  // SVG Circular progress dimensions
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      {/* Floating Reader Bar at the bottom for premium Mobile UX */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-[60] animate-in slide-in-from-bottom-10 duration-500">
        <div className="bg-[#1B3A2D]/95 backdrop-blur-md text-[#FAF6EE] rounded-2xl border border-[#C9972A]/30 py-3 px-5 flex items-center justify-between shadow-2xl">
          {/* Left: Section Indicator & TOC Trigger */}
          <button 
            onClick={() => setIsOpen(true)}
            className="flex-1 flex items-center gap-3 text-left min-w-0 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#C9972A]/20 flex items-center justify-center border border-[#C9972A]/30 text-[#C9972A]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-sans font-black text-[#C9972A] tracking-wider uppercase">
                ACTIVE SECTION
              </span>
              <span className="text-sm font-semibold truncate pr-4 text-[#FAF6EE]/90 font-serif leading-tight">
                {activeLabel}
              </span>
            </div>
          </button>

          {/* Right: Circular Progress Button & Menu Indicator */}
          <div className="flex items-center gap-4 border-l border-[#C9972A]/20 pl-4 shrink-0">
            <button
              onClick={() => setIsOpen(true)}
              className="relative w-10 h-10 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              <svg className="w-10 h-10 transform -rotate-90 absolute">
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  className="stroke-[#C9972A]/10 fill-none"
                  strokeWidth="3"
                />
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  className="stroke-[#C9972A] fill-none transition-all duration-300"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <List className="w-4.5 h-4.5 text-[#C9972A]" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-Up Bottom Drawer Sheet for Table of Contents */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-[70] backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 max-h-[85vh] bg-[#163020] border-t-2 border-[#C9972A] rounded-t-[32px] p-6 z-[80] overflow-y-auto flex flex-col"
            >
              <div className="w-12 h-1.5 bg-[#C9972A]/30 rounded-full mx-auto mb-6 shrink-0" />

              <div className="flex items-center justify-between mb-8 border-b border-[#C9972A]/10 pb-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#C9972A]/10 flex items-center justify-center text-[#C9972A]">
                    <List className="w-4 h-4" />
                  </div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl font-black text-[#C9972A] tracking-tight">
                    Table of Contents
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#FAF6EE]/80 hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                <ul className="flex flex-col gap-5">
                  {headings.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => handleScrollTo(item.id)}
                          className={cn(
                            'w-full text-left font-serif text-base font-medium transition-all duration-300 py-1 pl-4 border-l-2',
                            isActive
                              ? 'text-[#C9972A] border-[#C9972A] font-bold bg-[#C9972A]/5 translate-x-1'
                              : 'text-[#FAF6EE]/70 border-[#C9972A]/10 hover:text-[#FAF6EE] hover:border-[#FAF6EE]/30'
                          )}
                          style={{ marginLeft: `${(item.level - 1) * 8}px` }}
                        >
                          {item.text}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-[#C9972A]/10 text-center shrink-0">
                <p className="text-[10px] font-sans font-black text-[#FAF6EE]/40 uppercase tracking-widest">
                  Naaz Book Depot Editorial • {progress}% Read Completed
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}



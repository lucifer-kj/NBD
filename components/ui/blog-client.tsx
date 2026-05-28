'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Share2, Link2, List, X, ShoppingCart, Star, BookOpen, Info, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
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
    <div className="bg-gradient-to-br from-white to-amber-50/40 border border-[var(--islamic-gold)]/30 shadow-sm rounded-3xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--islamic-gold)]/10 rounded-full blur-xl pointer-events-none transition-transform group-hover:scale-125 duration-500" />
      
      <h3 className="font-headings font-bold text-lg text-[var(--islamic-green)] flex items-center gap-2 mb-2">
        <span>🕌</span> Naaz Newsletter
      </h3>
      <p className="text-gray-600 text-xs leading-relaxed mb-4">
        Subscribe to receive monthly authenticated scholarly reviews, classic Islamic literature releases, and exclusive spiritual insights.
      </p>

      {status === 'success' ? (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl p-4 text-center animate-in fade-in zoom-in-95 duration-200">
          <p className="text-sm font-semibold">JazakAllah Khair! ✨</p>
          <p className="text-xs mt-1 text-emerald-600">You have successfully subscribed to our newsletter.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {status === 'error' && (
            <p className="text-red-600 text-xs font-semibold animate-pulse">
              Subscription failed. Please check your email and try again.
            </p>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="w-full px-4 py-2.5 rounded-2xl bg-white border border-gray-100 focus:border-[var(--islamic-gold)] focus:ring-1 focus:ring-[var(--islamic-gold)] text-sm text-gray-800 placeholder-gray-400 outline-none transition-all"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-2.5 rounded-2xl bg-[var(--islamic-green)] text-white font-semibold text-xs tracking-wider uppercase hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green)] transition-all flex items-center justify-center gap-2 border border-transparent disabled:opacity-50"
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

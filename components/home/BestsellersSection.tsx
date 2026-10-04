"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion.config";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ShoppingCart, Star, Shield, Truck, Award, CheckCircle2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { trackAddToCart } from "@/lib/analytics";
import { ReshapedProduct } from "@/types/shopify";

interface BestsellersSectionProps {
  products?: ReshapedProduct[];
}

// Curated metadata for the 3 flagship Quran editions (100% English titles & handles)
const BESTSELLER_METADATA = [
  {
    handle: "quran-sharif-kanzul-iman-nurul-irfan-bengali-hardcover",
    badge: "Top Selling Translation",
    badgeColor: "bg-emerald-800 text-amber-200 border-amber-300/30",
    scholarSubtitle: "Imam Ahmad Raza Khan • Tafseer Nurul Irfan",
    marketplacePrice: 899,
    savingsText: "Save ₹200 vs Amazon",
    features: [
      "Color-coded Tajweed rules",
      "Line-by-line Bengali pronunciation",
      "Nurul Irfan Tafseer on every page",
      "Premium green gold-foil hardcover"
    ],
    fallbackImage: "/products/quran/pdf1_page_1.jpg",
    price: 699,
    compareAtPrice: 899
  },
  {
    handle: "al-quran-al-kareem-16-line-indo-pak-qr-code-hardcover",
    badge: "Best for Memorization (Hifz)",
    badgeColor: "bg-blue-900 text-blue-100 border-blue-300/30",
    scholarSubtitle: "16-Line Indo-Pak Naskh • Audio QR Code",
    marketplacePrice: 799,
    savingsText: "Save ₹200 vs Flipkart",
    features: [
      "16-line standard Hafizi layout",
      "Audio QR code beside each Surah",
      "Bold crystal-clear Indo-Pak script",
      "Luxury geometric gold hardcover"
    ],
    fallbackImage: "/products/quran/pdf2_page_1.jpg",
    price: 599,
    compareAtPrice: 799
  },
  {
    handle: "quran-sharif-bengali-shan-e-nuzul-fazlur-rahman-munshi-hardcover",
    badge: "Comprehensive Commentary",
    badgeColor: "bg-neutral-900 text-amber-300 border-amber-400/30",
    scholarSubtitle: "Maulana Fazlur Rahman Munshi • Ed. Abdul Mannan",
    marketplacePrice: 899,
    savingsText: "Save ₹199 vs Amazon",
    features: [
      "Arabic Makhraj & pronunciation guide",
      "Synchronized tri-column layout",
      "Detailed Shan-e-Nuzul & footnotes",
      "Deluxe black & gold foil hardcover"
    ],
    fallbackImage: "/products/quran/pdf3_page_1.jpg",
    price: 700,
    compareAtPrice: 899
  }
];

export default function BestsellersSection({ products = [] }: BestsellersSectionProps) {
  const reduced = useReducedMotion();
  const [ref, inView] = useScrollReveal();
  const addToCart = useCartStore((state) => state.addItem);
  const [cartLoadingHandle, setCartLoadingHandle] = useState<string | null>(null);

  const handleAddToCart = async (handle: string, variantId?: string, priceAmount: number = 699, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!variantId) {
      // If variantId is not provided, redirect to PDP
      window.location.href = `/books/${handle}`;
      return;
    }

    setCartLoadingHandle(handle);
    try {
      await addToCart(variantId, 1);
      trackAddToCart({
        item_id: variantId,
        item_name: handle,
        price: priceAmount,
        currency: "INR",
        quantity: 1
      });
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setCartLoadingHandle(null);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#FCFAF7] via-[#F7F3EB] to-[#FCFAF7] border-y border-[#e9e3d9]/70 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[var(--islamic-gold)]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={reduced ? undefined : staggerContainer}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--islamic-green)]/10 border border-[var(--islamic-green)]/20 text-[var(--islamic-green-dark)] text-xs font-bold uppercase tracking-widest mb-3">
            <Award size={14} className="text-[var(--islamic-gold)]" />
            <span>Direct from Kolkata Publisher • Established 1967</span>
          </motion.div>

          <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-headings font-bold text-[var(--islamic-green)] tracking-wide mb-4">
            Most Popular Publications
          </motion.h2>

          <motion.div variants={fadeInUp} className="w-20 h-1 bg-gradient-to-r from-[var(--islamic-gold-dark)] via-[var(--islamic-gold)] to-[var(--islamic-gold-dark)] mx-auto mb-5 rounded-full" />

          <motion.p variants={fadeInUp} className="text-sm md:text-base text-gray-600 font-light leading-relaxed">
            Our highest-selling authentic Quran Sharif editions — printed with pure typography, thread-sewn hardcovers, and delivered at <strong className="text-[var(--islamic-green)] font-semibold">20%+ lower prices</strong> than Amazon and Flipkart.
          </motion.p>
        </motion.div>

        {/* 3 Featured Products Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {BESTSELLER_METADATA.map((item, idx) => {
            // Find live product from Shopify if available
            const liveProduct = products.find(p => p.handle === item.handle);
            const title = liveProduct?.title || (
              idx === 0 
                ? "Quran Sharif with Bengali Pronunciation and Translation - Kanzul Iman and Nurul Irfan (Hardcover)"
                : idx === 1
                ? "Al-Quran Al-Kareem 16-Line Indo-Pak Script with QR Code (Hardcover Deluxe)"
                : "Quran Sharif with Bengali Pronunciation, Translation and Shan-e-Nuzul - Maulana Fazlur Rahman Munshi (Hardcover)"
            );
            const imageUrl = liveProduct?.featuredImage?.url || item.fallbackImage;
            const price = liveProduct ? parseFloat(liveProduct.priceRange.minVariantPrice.amount) : item.price;
            const compareAt = liveProduct?.variants[0]?.compareAtPrice ? parseFloat(liveProduct.variants[0].compareAtPrice.amount) : item.compareAtPrice;
            const discountPct = Math.round(((compareAt - price) / compareAt) * 100);
            const variantId = liveProduct?.variants[0]?.id;
            const productHref = `/books/${item.handle}`;

            return (
              <motion.div
                key={item.handle}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                variants={reduced ? undefined : fadeInUp}
                className="flex flex-col h-full"
              >
                <div className="flex flex-col h-full bg-white rounded-3xl border border-[#e2d8c8] hover:border-[var(--islamic-gold)] shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(193,154,78,0.15)] transition-all duration-300 overflow-hidden group">
                  
                  {/* Card Header Tag */}
                  <div className="p-4 pb-0 flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border shadow-xs ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                      In Stock
                    </span>
                  </div>

                  {/* Book Image Showcase */}
                  <Link href={productHref} className="relative aspect-[4/5] mx-4 my-3 bg-[#FAF8F5] rounded-2xl overflow-hidden border border-[#efe7dc] flex items-center justify-center p-3 group/img">
                    <Image
                      src={imageUrl}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 90vw, 360px"
                      className="object-contain p-2 transition-transform duration-700 group-hover/img:scale-105"
                      priority={idx === 0}
                    />
                    
                    {/* Top Savings Pill Badge */}
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md">
                      SAVE {discountPct}%
                    </div>

                    {/* Quick View Tag on Hover */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/95 text-[var(--islamic-green)] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-lg border border-gray-100">
                        View Sample Pages
                      </span>
                    </div>
                  </Link>

                  {/* Content Area */}
                  <div className="p-5 pt-1 flex flex-col flex-1">
                    <div className="text-[11px] font-medium text-[var(--islamic-gold-text)] mb-1">
                      {item.scholarSubtitle}
                    </div>

                    <Link href={productHref} className="hover:text-[var(--islamic-gold)] transition-colors mb-3">
                      <h3 className="font-headings font-bold text-base md:text-lg text-gray-900 leading-snug line-clamp-2">
                        {title}
                      </h3>
                    </Link>

                    {/* Verified Customer Star Rating */}
                    <div className="flex items-center gap-1.5 mb-3.5">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={13} className="fill-current" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-gray-700">4.9</span>
                      <span className="text-xs text-gray-400 font-light">• 100% Authentic Print</span>
                    </div>

                    {/* Key Feature Checkmarks */}
                    <ul className="space-y-1.5 mb-5 text-xs text-gray-600 border-t border-gray-100 pt-3">
                      {item.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Price & Marketplace Comparison Box */}
                    <div className="mt-auto bg-[#F9F7F2] p-3.5 rounded-2xl border border-[#ece4d6] mb-4">
                      <div className="flex items-baseline justify-between mb-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-[var(--islamic-green)]">
                            {formatPrice(price)}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(compareAt)}
                          </span>
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          {item.savingsText}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-light">
                        Includes GST • Eligible for prepaid shipping discount from ₹40
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={productHref}
                        className="py-2.5 px-3 rounded-xl border border-[var(--islamic-green)]/30 hover:border-[var(--islamic-green)] text-[var(--islamic-green)] font-bold text-xs flex items-center justify-center gap-1 transition-all duration-200 hover:bg-[var(--islamic-green)]/5"
                      >
                        Details <ArrowRight size={13} />
                      </Link>

                      <button
                        onClick={(e) => handleAddToCart(item.handle, variantId, price, e)}
                        disabled={cartLoadingHandle === item.handle}
                        className="py-2.5 px-3 rounded-xl bg-[var(--islamic-gold)] text-[var(--islamic-green-dark)] hover:bg-[var(--islamic-gold-dark)] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
                      >
                        {cartLoadingHandle === item.handle ? (
                          <span className="w-4 h-4 border-2 border-[var(--islamic-green-dark)] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart size={14} /> Add to Cart
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Publisher Trust Bar */}
        <div className="bg-white rounded-2xl border border-[#e8dfd1] p-5 md:p-6 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex items-center gap-3 pt-2 md:pt-0">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[var(--islamic-gold)] shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Original Publisher</p>
                <p className="text-[11px] text-gray-500 font-light">Zero risk of reprint errors</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Fast Regional Delivery</p>
                <p className="text-[11px] text-gray-500 font-light">1-2 days in West Bengal</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700 shrink-0">
                <Award size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Dignified Packaging</p>
                <p className="text-[11px] text-gray-500 font-light">Safe multi-layer parceling</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 md:pt-0 md:pl-6">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-700 shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Prepaid & COD Ready</p>
                <p className="text-[11px] text-gray-500 font-light">Save up to ₹40 on prepaid</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

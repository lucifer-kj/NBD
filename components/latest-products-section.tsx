"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ReshapedProduct } from "@/types/shopify";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion.config";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/utils";
import { getProductUrl } from "@/lib/url-helper";
import { trackAddToCart } from "@/lib/analytics";

interface LatestProductsSectionProps {
  products: ReshapedProduct[];
  loading?: boolean;
  onViewAll?: () => void;
}

const skeletonArray = Array.from({ length: 6 });

export default function LatestProductsSection({ products, loading = false }: LatestProductsSectionProps) {
  const reduced = useReducedMotion();
  const [ref, inView] = useScrollReveal();
  
  // Cart & Wishlist hooks
  const addToCart = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleWishlist, isSyncing } = useWishlist();
  const [cartLoadingId, setCartLoadingId] = useState<string | null>(null);

  const handleAddToCart = async (product: ReshapedProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const firstVariantId = product.variants[0]?.id;
    if (!firstVariantId) return;

    setCartLoadingId(product.id);
    await addToCart(firstVariantId, 1);
    
    trackAddToCart({
      item_id: firstVariantId,
      item_name: product.title,
      price: parseFloat(product.priceRange.minVariantPrice.amount),
      currency: "INR",
      quantity: 1
    });
    setCartLoadingId(null);
  };

  const handleWishlistToggle = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  // If loading or we don't have enough products, show standard skeleton.
  // We want to slice products: 
  // index 0 -> Deal of the Week (Featured)
  // index 1-6 -> 6 smaller products for the grid
  const featuredProduct = products[0];
  const gridProducts = products.slice(1, 7);

  const featuredRatingMeta = featuredProduct?.metafields?.find(m => m && m.namespace === 'reviews' && m.key === 'rating');
  const featuredRatingValue = featuredRatingMeta ? parseFloat(JSON.parse(featuredRatingMeta.value).value) : null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={reduced ? undefined : staggerContainer}
          className="text-center mb-12"
        >
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-headings font-bold text-[var(--islamic-green)] tracking-wide mb-3">
            Trending Products
          </motion.h2>
          <motion.div variants={fadeInUp} className="w-16 h-0.5 bg-[#c19a4e] mx-auto" />
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-pulse">
            <div className="lg:col-span-2 h-[450px] bg-gray-100 rounded-3xl" />
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {skeletonArray.map((_, i) => (
                <div key={i} className="h-[200px] bg-gray-100 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* LEFT COLUMN: Deal of the Week (Featured) */}
            {featuredProduct && (
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                variants={reduced ? undefined : fadeInUp}
                className="lg:col-span-2 flex flex-col"
              >
                <div className="relative flex flex-col justify-between p-6 md:p-8 bg-gradient-to-br from-[#0c2e1f] via-[#051d13] to-[#0c2e1f] border border-[#c19a4e]/20 rounded-3xl shadow-xl h-full group overflow-hidden pt-12 md:pt-14">
                  {/* Featured Pick Ribbon */}
                  <div className="absolute top-0 left-0 bg-[var(--islamic-gold)] text-[var(--islamic-green-dark)] text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-br-2xl shadow-md z-20 transition-all duration-300 hover:brightness-110">
                    Featured Pick
                  </div>

                  {/* Subtle Islamic pattern overlay */}
                  <div className="islamic-pattern opacity-5 absolute inset-0 z-0 mix-blend-overlay pointer-events-none"></div>

                  {/* Badges */}
                  <div className="relative z-10 flex justify-between items-center w-full mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#c19a4e] bg-[#c19a4e]/10 border border-[#c19a4e]/30 px-3 py-1 rounded-full">
                      Deal of the Week
                    </span>
                    <span className="bg-[#c19a4e] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      Best Seller
                    </span>
                  </div>

                  {/* Product Image Link */}
                  <Link href={getProductUrl(featuredProduct)} className="relative aspect-square sm:aspect-[4/3] w-full my-6 overflow-hidden rounded-2xl shadow-inner border border-[#e9e3d9]/40 bg-white flex items-center justify-center group/img">
                    <Image
                      src={featuredProduct.featuredImage?.url || "/Images/Logo.png"}
                      alt={featuredProduct.title}
                      fill
                      sizes="(max-width: 1024px) 90vw, 400px"
                      className="object-contain p-4 transition-transform duration-1000 group-hover/img:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors" />
                    
                    {/* View Badge */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300">
                      <span className="bg-white/95 text-[var(--islamic-green)] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-white/20">
                        <Eye size={14} /> View Details
                      </span>
                    </div>
                  </Link>

                  {/* Details & Cart Button */}
                  <div className="relative z-10 mt-auto pt-4 border-t border-white/10 flex flex-col">
                    <Link href={getProductUrl(featuredProduct)} className="hover:text-[#c19a4e] transition-colors mb-2">
                      <h3 className="font-headings font-bold text-xl md:text-2xl text-white line-clamp-2 leading-tight">
                        {featuredProduct.title}
                      </h3>
                    </Link>

                    {/* Generic Rating & Stock Status */}
                    <div className="flex items-center justify-between mb-4">
                      {featuredRatingValue !== null && featuredRatingValue > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-[#c19a4e]">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={
                                  i < Math.floor(featuredRatingValue)
                                    ? "fill-current"
                                    : "text-gray-600"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                            {featuredRatingValue.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                          Authentic Edition
                        </span>
                      )}
                      {featuredProduct.availableForSale ? (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          In Stock
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider">Special Price</span>
                        <span className="text-2xl md:text-3xl font-black text-white">
                          {formatPrice(parseFloat(featuredProduct.priceRange.minVariantPrice.amount))}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(featuredProduct, e)}
                        disabled={!featuredProduct.availableForSale || cartLoadingId === featuredProduct.id}
                        className="btn-primary touch-target py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-white font-bold bg-[#c19a4e] hover:bg-[#a9823e] border-none shadow-lg shadow-[#c19a4e]/20 transition-all duration-300"
                      >
                        {cartLoadingId === featuredProduct.id ? (
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart size={16} /> Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* RIGHT COLUMN: Grid of 6 smaller products in a 2-column mobile layout */}
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {gridProducts.map((product) => {
                const productUrl = getProductUrl(product);
                const isItemInWishlist = isInWishlist(product.id);

                const ratingMeta = product.metafields?.find(m => m && m.namespace === 'reviews' && m.key === 'rating');
                const ratingValue = ratingMeta ? parseFloat(JSON.parse(ratingMeta.value).value) : null;

                return (
                  <motion.div
                    key={product.id}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-40px" }}
                    variants={reduced ? undefined : fadeInUp}
                    className="flex flex-col h-full"
                  >
                    <div className="flex flex-col bg-white border border-[#e9e3d9] rounded-2xl p-4 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all duration-300 relative group h-full justify-between">
                      
                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => handleWishlistToggle(product.id, e)}
                        disabled={isSyncing}
                        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white border border-[#e9e3d9] flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all text-[var(--islamic-green)]"
                        aria-label={isItemInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart size={14} className={isItemInWishlist ? "fill-red-500 text-red-500" : "text-gray-400"} />
                      </button>

                      {/* Image Block */}
                      <Link href={productUrl} className="relative aspect-square w-full bg-white border border-[#e9e3d9]/40 rounded-xl overflow-hidden mb-3.5 flex items-center justify-center group-hover:opacity-95 transition-opacity">
                        <Image
                          src={product.featuredImage?.url || "/Images/Logo.png"}
                          alt={product.title}
                          fill
                          sizes="(max-width: 640px) 150px, 200px"
                          className="object-contain p-3 transition-transform duration-700 group-hover:scale-105"
                        />
                      </Link>

                      {/* Text & Price Info */}
                      <div className="flex flex-col flex-1">
                        <Link href={productUrl} className="hover:text-[#c19a4e] transition-colors mb-1">
                          <h4 className="font-sans font-bold text-gray-800 text-[14px] line-clamp-2 leading-tight">
                            {product.title}
                          </h4>
                        </Link>

                        {/* Stars & Stock */}
                        <div className="flex items-center justify-between mb-3 gap-1">
                          {ratingValue !== null && ratingValue > 0 ? (
                            <div className="flex items-center gap-1 min-w-0">
                              <div className="flex text-[#c19a4e] shrink-0">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={10}
                                    className={
                                      i < Math.floor(ratingValue)
                                        ? "fill-current shrink-0"
                                        : "text-gray-300 shrink-0"
                                    }
                                  />
                                ))}
                              </div>
                              <span className="text-[9px] font-bold text-gray-500 uppercase truncate">
                                {ratingValue.toFixed(1)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[9px] font-bold text-gray-400 uppercase truncate">
                              Authentic
                            </span>
                          )}
                          {product.availableForSale ? (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 shrink-0">
                              In Stock
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100 shrink-0">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {/* Price & Action Row */}
                        <div className="flex flex-col mt-auto pt-1.5 border-t border-[#e9e3d9]/30">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-medium">Price</span>
                            <span className="font-black text-[14px] md:text-[15px] text-[var(--islamic-green)]">
                              {formatPrice(parseFloat(product.priceRange.minVariantPrice.amount))}
                            </span>
                          </div>

                          {/* Add to Cart Button - always visible on mobile, hover-revealed on desktop */}
                          <div className="mt-2.5 md:mt-0 md:h-0 md:opacity-0 md:group-hover:h-8 md:group-hover:opacity-100 md:group-hover:mt-3 transition-all duration-300 overflow-hidden">
                            <button
                              onClick={(e) => handleAddToCart(product, e)}
                              disabled={!product.availableForSale || cartLoadingId === product.id}
                              className="w-full py-1.5 rounded-lg bg-[var(--islamic-gold)] text-[var(--islamic-green-dark)] hover:bg-[var(--islamic-gold-dark)] hover:text-white font-bold text-[11px] md:text-xs flex items-center justify-center gap-1 md:gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                            >
                              {cartLoadingId === product.id ? (
                                <span className="w-3.5 h-3.5 border-2 border-[var(--islamic-green-dark)] border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <ShoppingCart size={11} />
                                  <span>Add to Cart</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
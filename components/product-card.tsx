"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { motion } from "framer-motion";
import { useState } from "react";
import { Star } from "lucide-react";
import { fadeInUp } from "@/lib/motion.config";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/utils";
import { ReshapedProduct } from "@/types/shopify";
import { trackAddToCart } from "@/lib/analytics";
import { getProductUrl } from "@/lib/url-helper";

interface ProductCardProps {
  product: ReshapedProduct;
  showWishlist?: boolean;
}

export default function ProductCard({
  product,
  showWishlist = true,
}: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const [cartLoading, setCartLoading] = useState(false);
  const reduced = useReducedMotion();
  const [ref, inView] = useScrollReveal();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCartLoading(true);
    // Use the first variant ID for simplicity in the card
    const firstVariantId = product.variants[0]?.id;
    if (firstVariantId) {
      await addToCart(firstVariantId, 1);
      
      // Fire GA4 add_to_cart event
      trackAddToCart({
        item_id: firstVariantId,
        item_name: product.title,
        price: parseFloat(product.priceRange.minVariantPrice.amount),
        currency: "INR",
        quantity: 1
      });
    }
    setCartLoading(false);
  };

  const { isInWishlist, toggleWishlist, isSyncing } = useWishlist();
  const isItemInWishlist = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const imageAlt = product.title ? `${product.title} product image` : "Product image";

  // Stock status
  const inStock = product.availableForSale;
  const productUrl = getProductUrl(product);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={reduced ? undefined : fadeInUp}
      whileHover={reduced ? undefined : { scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="h-full"
    >
      <Card className="group bg-white/80 backdrop-blur-md rounded-2xl border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_20px_48px_0_rgba(212,168,83,0.15)] transition-all duration-500 relative overflow-hidden flex flex-col h-full">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--islamic-gold)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Wishlist Button */}
        {showWishlist && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={isItemInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md hover:bg-white focus:ring-2 focus:ring-[var(--islamic-gold)] w-10 h-10 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 group/heart"
            onClick={handleWishlistToggle}
            disabled={isSyncing}
          >
            <Heart className={`w-5 h-5 transition-colors duration-300 ${isItemInWishlist ? "fill-red-500 text-red-500" : "text-[var(--islamic-green)] group-hover/heart:text-red-400"}`} />
          </Button>
        )}

        {/* Image Section */}
        <Link href={productUrl} className="block relative aspect-[4/3] overflow-hidden rounded-t-2xl">
          <Image
            src={product.featuredImage?.url || "/Images/Logo.png"}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 40vw, 300px"
            style={{ viewTransitionName: `product-image-${product.id}` } as React.CSSProperties}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority={false}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
          
          {/* Quick View Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <span className="bg-white/95 backdrop-blur-sm text-[var(--islamic-green)] px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl border border-white/20">
              View Product
            </span>
          </div>
        </Link>
 
        <CardContent className="flex flex-col flex-1 p-3 sm:p-5 md:p-6 bg-white/50 relative z-10">
          <div className="mb-auto">
            <Link href={productUrl} className="block mb-2 group-hover:text-[var(--islamic-gold)] transition-colors duration-300">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--charcoal)] line-clamp-2 leading-snug">
                {product.title}
              </h3>
            </Link>
            
            {/* Rating & Stock Status */}
            <div className="flex flex-wrap items-center justify-between mb-3 gap-1.5">
              <div className="flex items-center gap-1 min-w-0">
                <div className="flex shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className="fill-[var(--islamic-gold)] text-[var(--islamic-gold)]"
                    />
                  ))}
                </div>
                <span className="text-[9px] font-bold text-[var(--charcoal)]/50 tracking-tighter uppercase truncate">Authentic</span>
              </div>
              {inStock ? (
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 shrink-0">
                  In Stock
                </span>
              ) : (
                <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100 shrink-0">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col mt-4 pt-3 border-t border-[#e9e3d9]/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-medium">Price</span>
              <span className="text-lg md:text-xl font-black text-[var(--islamic-green)]">
                {formatPrice(parseFloat(product.priceRange.minVariantPrice.amount))}
              </span>
            </div>
            
            {/* Add to Cart Button - always visible on mobile, hover-revealed on desktop */}
            <div className="mt-3 md:mt-0 md:h-0 md:opacity-0 md:group-hover:h-10 md:group-hover:opacity-100 md:group-hover:mt-3 transition-all duration-300 overflow-hidden">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || cartLoading}
                className="w-full py-2 px-4 rounded-xl bg-[var(--islamic-gold)] text-[var(--islamic-green-dark)] hover:bg-[var(--islamic-gold-dark)] hover:text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
              >
                {cartLoading ? (
                  <span className="w-4 h-4 border-2 border-[var(--islamic-green-dark)] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart size={13} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 
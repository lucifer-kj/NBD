"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { motion } from "framer-motion";
import { useState } from "react";
import { Star } from "lucide-react";
import { fadeInUp } from "@/lib/motion.config";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useScrollReveal } from "@/lib/useScrollReveal";

import { ReshapedProduct } from "@/types/shopify";

interface ProductCardProps {
  product: ReshapedProduct;
  showWishlist?: boolean;
  onWishlistToggle?: (productId: string) => void;
  isInWishlist?: boolean;
  wishlistLoading?: boolean;
}

export default function ProductCard({
  product,
  showWishlist = true,
  onWishlistToggle,
  isInWishlist = false,
  wishlistLoading = false,
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
    }
    setCartLoading(false);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(product.id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  // Accessibility: alt text fallback
  const imageAlt = product.title ? `${product.title} product image` : "Product image";

  // Stock status
  const inStock = product.availableForSale;

  // Rating stars
  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} fill={i <= Math.round(rating) ? "#facc15" : "none"} aria-hidden="true" />
        ))}
      </div>
    );
  };

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
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md hover:bg-white focus:ring-2 focus:ring-[var(--islamic-gold)] w-10 h-10 rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
          >
            <Heart className={`w-5 h-5 ${isInWishlist ? "fill-red-500 text-red-500" : "text-[var(--islamic-green)]"}`} />
          </Button>
        )}

        {/* Image Section */}
        <Link href={`/products/${product.handle}`} className="block relative aspect-[4/3] overflow-hidden rounded-t-2xl">
          <Image
            src={product.featuredImage?.url || "/Images/Riyadh as-Salihin.jpg"}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 40vw, 300px"
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

        <CardContent className="flex flex-col flex-1 p-5 md:p-6 bg-white/50 relative z-10">
          <div className="mb-auto">
            <Link href={`/products/${product.handle}`} className="block mb-2 group-hover:text-[var(--islamic-gold)] transition-colors duration-300">
              <h3 className="text-base md:text-lg font-bold text-[var(--charcoal)] line-clamp-2 leading-snug">
                {product.title}
              </h3>
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center text-[var(--islamic-gold)]">
                {renderStars(4.8)}
              </div>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[var(--islamic-green)]/60">
                {inStock ? "Authentic Stock" : "Temporarily Out"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Current Price</span>
              <span className="text-lg md:text-xl font-black text-[var(--islamic-green)]">
                {formatPrice(parseFloat(product.priceRange.minVariantPrice.amount))}
              </span>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={!inStock || cartLoading}
              className={`p-3 md:p-4 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center ${
                inStock 
                  ? "bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-dark)] text-white hover:shadow-[0_12px_24px_0_rgba(45,90,76,0.3)]" 
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {cartLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </motion.button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 
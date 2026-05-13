"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Minus, 
  Plus, 
  Star, 
  Check, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw 
} from 'lucide-react';
import { ReshapedProduct } from '@/types/shopify';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fadeInUp, staggerContainer } from '@/lib/motion.config';
import StarRating from '@/components/star-rating';

interface ProductDetailsClientProps {
  product: ReshapedProduct;
  initialWishlisted?: boolean;
}

export default function ProductDetailsClient({ product, initialWishlisted = false }: ProductDetailsClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const { addItem, isLoading } = useCartStore();

  const handleAddToCart = async () => {
    const variantId = product.variants[0]?.id;
    if (variantId) {
      await addItem(variantId, quantity);
    }
  };

  const images = product.images.length > 0 
    ? product.images 
    : [{ url: product.featuredImage?.url || '/Images/p1.jpg', altText: product.title }];

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
    }).format(parseFloat(amount));
  };

  // Extract metafields
  const ratingMeta = product.metafields?.find(m => m.namespace === 'reviews' && m.key === 'rating');
  const ratingValue = ratingMeta ? JSON.parse(ratingMeta.value).value : 4.8; // Fallback
  const careInstructions = product.metafields?.find(m => m.namespace === 'custom' && m.key === 'care_instructions')?.value;
  const techSpecs = product.metafields?.find(m => m.namespace === 'custom' && m.key === 'technical_specs')?.value;

  const handleWishlistToggle = async () => {
    // Optimistic UI
    setIsWishlisted(!isWishlisted);
    
    try {
      // Fetch user from /api/auth/me
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      
      if (!meData.user) {
        alert("Please login to use wishlist");
        setIsWishlisted(false);
        return;
      }

      const customerId = meData.user.id;
      const currentWishlist = meData.user.wishlist ? JSON.parse(meData.user.wishlist.value) : [];
      const variantId = product.variants[0]?.id;
      
      let newWishlist;
      if (isWishlisted) {
        newWishlist = currentWishlist.filter((id: string) => id !== variantId);
      } else {
        newWishlist = [...currentWishlist, variantId];
      }

      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, variantIds: newWishlist })
      });
    } catch (error) {
      console.error('Wishlist error:', error);
      setIsWishlisted(!isWishlisted); // Revert on failure
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left Column: Image Gallery */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-100 border border-gray-200">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <Image
                src={images[selectedImage].url}
                alt={images[selectedImage].altText || product.title}
                fill
                className="object-contain p-4 md:p-8"
                priority
              />
            </motion.div>
          </AnimatePresence>
          
          {product.availableForSale === false && (
            <div className="absolute top-4 left-4">
              <Badge variant="destructive" className="px-3 py-1">Out of Stock</Badge>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                  selectedImage === idx ? 'border-[var(--islamic-gold)]' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText || ""}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Right Column: Product Info */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col"
      >
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span>Home</span>
          <ChevronRight size={14} />
          <span>Products</span>
          <ChevronRight size={14} />
          <span className="text-[var(--islamic-green)] font-medium truncate">{product.title}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-headings font-bold text-[var(--islamic-green)] mb-2">
          {product.title}
        </h1>
        
        {/* Rating */}
        <div className="flex items-center gap-4 mb-6">
          <StarRating rating={ratingValue} size="md" />
          <span className="text-sm text-gray-500">({ratingValue} • Judge.me Certified)</span>
        </div>

        {/* Price */}
        <div className="mb-8">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[var(--islamic-green)]">
              {formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
            </span>
            {parseFloat(product.variants[0]?.compareAtPrice?.amount || "0") > parseFloat(product.priceRange.minVariantPrice.amount) && (
              <span className="text-xl text-gray-400 line-through">
                {formatPrice(product.variants[0].compareAtPrice!.amount, product.variants[0].compareAtPrice!.currencyCode)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
        </div>

        {/* Metafields Info */}
        {(careInstructions || techSpecs) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {careInstructions && (
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Care Instructions</p>
                <p className="text-sm text-amber-900/80">{careInstructions}</p>
              </div>
            )}
            {techSpecs && (
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Technical Specs</p>
                <p className="text-sm text-blue-900/80">{techSpecs}</p>
              </div>
            )}
          </div>
        )}

        {/* Short Description */}
        <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
          <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
        </div>

        {/* Actions */}
        <div className="space-y-6 pt-6 border-t">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center border-2 border-gray-100 rounded-xl bg-gray-50">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="p-3 hover:text-[var(--islamic-gold)] transition-colors"
                disabled={quantity <= 1}
              >
                <Minus size={18} />
              </button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="p-3 hover:text-[var(--islamic-gold)] transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>

            <Button 
              onClick={handleAddToCart}
              disabled={!product.availableForSale || isLoading}
              className="flex-1 bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-dark)] text-white h-14 rounded-xl text-lg font-bold gap-2 shadow-lg shadow-[var(--islamic-green)]/20"
            >
              <ShoppingCart size={20} />
              {isLoading ? "Adding..." : "Add to Cart"}
            </Button>

            <button 
              onClick={handleWishlistToggle}
              className={`p-4 rounded-xl border-2 transition-all ${
                isWishlisted 
                  ? 'bg-red-50 border-red-100 text-red-500' 
                  : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <Truck size={20} className="text-[var(--islamic-gold)]" />
              <div className="text-xs">
                <p className="font-bold text-gray-800">Free Delivery</p>
                <p className="text-gray-500">Orders above ₹999</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <ShieldCheck size={20} className="text-[var(--islamic-gold)]" />
              <div className="text-xs">
                <p className="font-bold text-gray-800">Secure Payment</p>
                <p className="text-gray-500">100% Protected</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

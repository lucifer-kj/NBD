"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Heart, 
  Minus, 
  Plus, 
  ChevronRight, 
  ShieldCheck, 
  Truck,
  ArrowRight
} from 'lucide-react';
import { ReshapedProduct } from '@/types/shopify';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StarRating from '@/components/star-rating';
import { useWishlist } from '@/hooks/use-wishlist';

interface ProductDetailsClientProps {
  product: ReshapedProduct;
  initialWishlisted?: boolean;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // Initialize selected options with the first variant's options
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    product.variants[0]?.selectedOptions.reduce((acc, opt) => ({
      ...acc,
      [opt.name]: opt.value
    }), {}) || {}
  );

  const { addItem, isLoading } = useCartStore();
  const { isInWishlist, toggleWishlist, isSyncing } = useWishlist();
  const isItemInWishlist = isInWishlist(product.id);

  // Find the selected variant based on selected options
  const selectedVariant = product.variants.find(variant => 
    variant.selectedOptions.every(opt => selectedOptions[opt.name] === opt.value)
  ) || product.variants[0];

  const handleAddToCart = async () => {
    if (selectedVariant?.id) {
      await addItem(selectedVariant.id, quantity);
    }
  };

  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [name]: value
    }));

    // Optionally update image if the variant has one
    const matchingVariant = product.variants.find(v => 
      v.selectedOptions.every(opt => 
        opt.name === name ? opt.value === value : selectedOptions[opt.name] === opt.value
      )
    );
    
    if (matchingVariant?.image) {
      const imgIdx = images.findIndex(img => img.url === matchingVariant.image?.url);
      if (imgIdx !== -1) setSelectedImage(imgIdx);
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

  const handleWishlistToggle = () => {
    toggleWishlist(product.id);
  };

  // Extract metafields
  const ratingMeta = product.metafields?.find(m => m && m.namespace === 'reviews' && m.key === 'rating');
  const ratingValue = ratingMeta ? JSON.parse(ratingMeta.value).value : 4.8; // Fallback
  const careInstructions = product.metafields?.find(m => m && m.namespace === 'custom' && m.key === 'care_instructions')?.value;
  const techSpecs = product.metafields?.find(m => m && m.namespace === 'custom' && m.key === 'technical_specs')?.value;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-28 lg:pb-0">
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
              {formatPrice(selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount, selectedVariant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode)}
            </span>
            {parseFloat(selectedVariant?.compareAtPrice?.amount || "0") > parseFloat(selectedVariant?.price.amount || "0") && (
              <span className="text-xl text-gray-400 line-through">
                {formatPrice(selectedVariant!.compareAtPrice!.amount, selectedVariant!.compareAtPrice!.currencyCode)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
        </div>

        {/* Variant Options */}
        {product.options.length > 0 && product.options[0].name !== 'Title' && (
          <div className="space-y-6 mb-8">
            {product.options.map((option) => (
              <div key={option.id} className="space-y-3">
                <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">{option.name}</p>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const isActive = selectedOptions[option.name] === value;
                    return (
                      <button
                        key={value}
                        onClick={() => handleOptionChange(option.name, value)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          isActive 
                            ? 'border-[var(--islamic-green)] bg-[var(--islamic-green)] text-white' 
                            : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

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
              <ShoppingCart size={20} className="shrink-0" />
              {isLoading ? "Adding..." : "Add to Cart"}
            </Button>

            <Button 
              onClick={async () => {
                if (selectedVariant?.id) {
                  await addItem(selectedVariant.id, quantity);
                  window.location.href = '/cart';
                }
              }}
              disabled={!selectedVariant?.availableForSale || isLoading}
              variant="outline"
              className="flex-1 border-2 border-[var(--islamic-green)] text-[var(--islamic-green)] h-14 rounded-xl text-lg font-bold hover:bg-[var(--islamic-green)] hover:text-white transition-all duration-300 gap-2"
            >
              {isLoading ? "Processing..." : "Buy Now"}
              {!isLoading && <ArrowRight size={20} className="shrink-0" />}
            </Button>

            <button 
              onClick={handleWishlistToggle}
              disabled={isSyncing}
              className={`p-4 rounded-xl border-2 transition-all ${
                isItemInWishlist 
                  ? 'bg-red-50 border-red-100 text-red-500' 
                  : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart size={24} fill={isItemInWishlist ? "currentColor" : "none"} />
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

      {/* Sticky Mobile Add to Cart */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-4 max-w-xl mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[var(--islamic-green)] truncate">{product.title}</p>
            <p className="text-sm font-black text-gray-900">
              {formatPrice(selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount, selectedVariant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode)}
            </p>
          </div>
          <Button 
            onClick={handleAddToCart}
            disabled={!product.availableForSale || isLoading}
            className="bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-dark)] text-white h-12 px-6 rounded-xl text-sm font-bold gap-2 shadow-lg shadow-[var(--islamic-green)]/20"
          >
            <ShoppingCart size={18} />
            {isLoading ? "..." : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}

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
  ChevronLeft,
  Share2,
  Truck,
  ArrowRight,
  Maximize2,
  X as CloseIcon,
  Award,
  BookOpen,
  Package
} from 'lucide-react';
import { ReshapedProduct } from '@/types/shopify';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StarRating from '@/components/star-rating';
import { useWishlist } from '@/hooks/use-wishlist';
import { trackViewItem, trackAddToCart } from '@/lib/analytics';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/toast';

interface ProductDetailsClientProps {
  product: ReshapedProduct;
  initialWishlisted?: boolean;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  // Initialize selected options with the first variant's options
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    product.variants[0]?.selectedOptions.reduce((acc, opt) => ({
      ...acc,
      [opt.name]: opt.value
    }), {}) || {}
  );

  const { addItem, isLoading, openCartDrawer } = useCartStore();
  const { isInWishlist, toggleWishlist, isSyncing } = useWishlist();
  const { showToast } = useToast();
  const isItemInWishlist = isInWishlist(product.id);

  // Find the selected variant based on selected options
  const selectedVariant = product.variants.find(variant => 
    variant.selectedOptions.every(opt => selectedOptions[opt.name] === opt.value)
  ) || product.variants[0];

  useEffect(() => {
    trackViewItem({
      item_id: product.id,
      item_name: product.title,
      price: parseFloat(selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount),
      currency: selectedVariant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode,
    });
  }, [product, selectedVariant]);

  const handleAddToCart = async () => {
    if (selectedVariant?.id) {
      trackAddToCart({
        item_id: product.id,
        item_name: product.title,
        price: parseFloat(selectedVariant.price.amount),
        currency: selectedVariant.price.currencyCode,
        quantity: quantity
      });
      await addItem(selectedVariant.id, quantity);
      showToast(`${product.title} added to cart!`, "success");
      openCartDrawer();
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
    showToast(isItemInWishlist ? "Removed from wishlist" : "Added to wishlist", "info");
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} at Naaz Book Depot`,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing product:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Product link copied to clipboard!", "success");
      } catch (e) {
        console.error('Copy to clipboard failed:', e);
        showToast("Failed to copy link.", "error");
      }
    }
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
        className="space-y-4 lg:sticky lg:top-32 h-fit"
      >
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-100 border border-gray-200">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full cursor-zoom-in select-none touch-pan-y"
              onClick={() => setIsLightboxOpen(true)}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => {
                if (info.offset.x < -50) {
                  setSelectedImage((prev) => (prev + 1) % images.length);
                } else if (info.offset.x > 50) {
                  setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
                }
              }}
            >
              <Image
                src={images[selectedImage].url}
                alt={images[selectedImage].altText || product.title}
                fill
                style={{ viewTransitionName: `product-image-${product.id}` } as React.CSSProperties}
                className="object-contain p-4 md:p-8"
                priority
              />
              <div className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={18} />
              </div>
            </motion.div>
          </AnimatePresence>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white border border-gray-100 rounded-full text-gray-700 shadow-md md:hidden z-10 active:scale-90 transition-transform"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev + 1) % images.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white border border-gray-100 rounded-full text-gray-700 shadow-md md:hidden z-10 active:scale-90 transition-transform"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
          
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
        {/* Mobile Go Back Button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.href = '/products';
                }
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-all duration-300"
          >
            <ChevronLeft size={14} />
            <span>Back</span>
          </button>
        </div>

        {/* Breadcrumbs */}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span>Home</span>
          <ChevronRight size={14} />
          <span>Products</span>
          <ChevronRight size={14} />
          <span className="text-[var(--islamic-green)] font-medium truncate">{product.title}</span>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-headings font-bold text-[var(--islamic-green)] leading-tight mb-2">
          {product.title}
        </h1>
        
        {/* Rating */}
        <div className="flex items-center gap-4 mb-4">
          <StarRating rating={ratingValue} size="md" />
          <span className="text-sm text-gray-500">({ratingValue} • Judge.me Certified)</span>
        </div>

        {/* Naaz Authenticity Stamp */}
        <div className="mb-6 flex items-center gap-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-amber-50/40 to-emerald-50/30 border border-emerald-100 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 flex-shrink-0">
            <Award size={18} className="text-[var(--islamic-gold)]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--islamic-gold)]">Naaz Authenticity Stamp</p>
            <p className="text-[10px] sm:text-xs font-bold text-emerald-950 leading-snug">Established 1967 • 59+ Years of Trusted Islamic Publishing Legacy</p>
          </div>
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
                        className={`px-4 py-2.5 max-md:py-3 rounded-lg border-2 text-sm font-medium transition-all ${
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

        {/* Short Description with Read More */}
        <div className="relative mb-8">
          <div 
            className={`prose prose-sm text-gray-600 max-w-none transition-all duration-500 overflow-hidden ${
              isDescriptionExpanded ? 'max-h-[2000px]' : 'max-h-32'
            }`}
          >
            <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          </div>
          
          {!isDescriptionExpanded && (
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
          
          <button 
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="mt-2 text-sm font-bold text-[var(--islamic-gold)] hover:text-[var(--islamic-green)] transition-colors flex items-center gap-1"
          >
            {isDescriptionExpanded ? (
              <>Show Less <Plus size={14} className="rotate-45" /></>
            ) : (
              <>Read More <Plus size={14} /></>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-6 pt-6 border-t">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center border-2 border-gray-100 rounded-xl bg-gray-50">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="p-3.5 max-md:p-4 hover:text-[var(--islamic-gold)] transition-colors"
                disabled={quantity <= 1}
              >
                <Minus size={18} />
              </button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="p-3.5 max-md:p-4 hover:text-[var(--islamic-gold)] transition-colors"
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
                  openCartDrawer();
                }
              }}
              disabled={!selectedVariant?.availableForSale || isLoading}
              variant="outline"
              className="flex-1 border-2 border-[var(--islamic-green)] text-[var(--islamic-green)] h-14 rounded-xl text-lg font-bold hover:bg-[var(--islamic-green)] hover:text-white transition-all duration-300 gap-2"
            >
              {isLoading ? "Processing..." : "Buy Now"}
              {!isLoading && <ArrowRight size={20} className="shrink-0" />}
            </Button>
          </div>

          {/* Wishlist & Share Actions */}
          <div className="flex items-center justify-end gap-3">
            <button 
              onClick={handleWishlistToggle}
              disabled={isSyncing}
              className={`p-3 rounded-xl border-2 transition-all ${
                isItemInWishlist 
                  ? 'bg-red-50 border-red-100 text-red-500' 
                  : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
              aria-label={isItemInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={20} fill={isItemInWishlist ? "currentColor" : "none"} />
            </button>

            <button 
              onClick={handleShare}
              className="p-3 rounded-xl border-2 transition-all bg-gray-50 border-gray-100 text-gray-400 hover:text-[var(--islamic-gold)] hover:bg-[var(--islamic-beige)]"
              aria-label="Share product"
            >
              <Share2 size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 100% Original Prints */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gradient-to-br from-emerald-50/20 via-white to-amber-50/10 border border-emerald-100/50 hover:border-amber-200/60 hover:shadow-sm transition-all duration-300 group">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <Award size={18} className="text-[var(--islamic-gold)]" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-emerald-950 font-headings mb-0.5">100% Original Prints</p>
                <p className="text-gray-500 leading-relaxed font-sans">Direct from authorized publishers since 1967</p>
              </div>
            </div>

            {/* Scholarly Verified Editions */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gradient-to-br from-emerald-50/20 via-white to-amber-50/10 border border-emerald-100/50 hover:border-amber-200/60 hover:shadow-sm transition-all duration-300 group">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <BookOpen size={18} className="text-[var(--islamic-green)]" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-emerald-950 font-headings mb-0.5">Scholarly Verified Editions</p>
                <p className="text-gray-500 leading-relaxed font-sans">Verified exegeses & translations for maximum accuracy</p>
              </div>
            </div>

            {/* Respectful Protective Packaging */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gradient-to-br from-emerald-50/20 via-white to-amber-50/10 border border-emerald-100/50 hover:border-amber-200/60 hover:shadow-sm transition-all duration-300 group">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <Package size={18} className="text-[var(--islamic-gold)]" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-emerald-950 font-headings mb-0.5">Respectful Protective Packaging</p>
                <p className="text-gray-500 leading-relaxed font-sans">Heavy-duty protection to ensure sacred & literature pages arrive pristine</p>
              </div>
            </div>

            {/* Fast Pan-India Shipping */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-gradient-to-br from-emerald-50/20 via-white to-amber-50/10 border border-emerald-100/50 hover:border-amber-200/60 hover:shadow-sm transition-all duration-300 group">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <Truck size={18} className="text-[var(--islamic-green)]" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-emerald-950 font-headings mb-0.5">Fast Pan-India Shipping</p>
                <p className="text-gray-500 leading-relaxed font-sans">Fully tracked premium logistics partners</p>
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

      {/* Image Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-12"
          >
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
            >
              <CloseIcon size={28} />
            </button>
            
            <div className="relative w-full h-full max-w-5xl">
              <Image
                src={images[selectedImage].url}
                alt={images[selectedImage].altText || product.title}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Lightbox Thumbnails */}
            {images.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 overflow-x-auto p-2 bg-white/5 rounded-2xl backdrop-blur-md">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-[var(--islamic-gold)]' : 'border-transparent opacity-40 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

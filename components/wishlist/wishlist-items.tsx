"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { useRouter } from 'next/navigation';

interface WishlistItemProps {
  product: any;
  customerId: string;
  allWishlistIds: string[];
}

export default function WishlistItems({ products, customerId, allWishlistIds }: { products: any[], customerId: string, allWishlistIds: string[] }) {
  const [wishlistIds, setWishlistIds] = useState(allWishlistIds);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { addItem } = useCartStore();
  const router = useRouter();

  const handleRemove = async (productId: string) => {
    setIsLoading(productId);
    try {
      const newIds = wishlistIds.filter(id => id !== productId);
      
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, variantIds: newIds })
      });

      if (res.ok) {
        setWishlistIds(newIds);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleAddToCart = async (variantId: string) => {
    setIsLoading(variantId);
    try {
      await addItem(variantId, 1);
    } finally {
      setIsLoading(null);
    }
  };

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
    }).format(parseFloat(amount));
  };

  const filteredProducts = products.filter(p => wishlistIds.includes(p.variants[0]?.id));

  if (filteredProducts.length === 0) {
    return (
      <div className="bg-gray-50 rounded-3xl p-20 text-center border border-dashed border-gray-200">
        <Heart size={48} className="mx-auto text-gray-300 mb-6" />
        <p className="text-gray-500 italic mb-8">Your wishlist is currently empty.</p>
        <Button asChild className="bg-[var(--islamic-green)] text-white px-8 h-12 rounded-xl shadow-lg shadow-[var(--islamic-green)]/20">
          <Link href="/products">Explore Our Catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {filteredProducts.map((product) => (
        <div key={product.id} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
          <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
            <Image
              src={product.featuredImage?.url || '/Images/p1.jpg'}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <button 
              onClick={() => handleRemove(product.variants[0]?.id)}
              disabled={isLoading === product.variants[0]?.id}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"
            >
              {isLoading === product.variants[0]?.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
            <Link href={`/products/${product.handle}`} className="font-bold text-lg text-gray-900 group-hover:text-[var(--islamic-green)] transition-colors line-clamp-2 mb-2">
              {product.title}
            </Link>
            
            <p className="font-bold text-[var(--islamic-green)] mb-6">
              {formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
            </p>

            <div className="mt-auto flex flex-col gap-3">
              <Button 
                onClick={() => handleAddToCart(product.variants[0]?.id)}
                disabled={isLoading === product.variants[0]?.id}
                className="w-full bg-[var(--islamic-green)] text-white gap-2 rounded-xl h-12 shadow-md shadow-[var(--islamic-green)]/10"
              >
                {isLoading === product.variants[0]?.id ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                Add to Cart
              </Button>
              <Button variant="outline" asChild className="w-full rounded-xl border-gray-100 hover:bg-gray-50">
                <Link href={`/products/${product.handle}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

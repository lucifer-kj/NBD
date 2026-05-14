"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { useWishlist } from '@/hooks/use-wishlist';
import { formatPrice } from '@/lib/utils';
import { ReshapedProduct } from '@/types/shopify';

interface WishlistItemsProps {
  products: ReshapedProduct[];
  customerId?: string | null;
  allWishlistIds?: string[];
}

export default function WishlistItems({ products: initialProducts }: WishlistItemsProps) {
  const [products, setProducts] = useState<ReshapedProduct[]>(initialProducts);
  const [isFetching, setIsFetching] = useState(false);
  const { items, toggleWishlist, isSyncing } = useWishlist();
  const { addItem } = useCartStore();
  const [loadingItem, setLoadingItem] = useState<string | null>(null);

  // If initialProducts is empty but we have items in store, fetch them (Guest mode)
  useEffect(() => {
    async function fetchGuestProducts() {
      if (initialProducts.length === 0 && items.length > 0) {
        setIsFetching(true);
        try {
          const res = await fetch(`/api/products?ids=${items.join(',')}`);
          const data = await res.json();
          if (data.products) {
            setProducts(data.products);
          }
        } catch (error) {
          console.error('Failed to fetch wishlist products:', error);
        } finally {
          setIsFetching(false);
        }
      } else if (items.length === 0) {
        setProducts([]);
      } else if (initialProducts.length > 0) {
        // Sync local products with store items (e.g. after removal)
        setProducts(initialProducts.filter(p => items.includes(p.id)));
      }
    }
    fetchGuestProducts();
  }, [items, initialProducts]);

  const handleRemove = async (productId: string) => {
    setLoadingItem(productId);
    await toggleWishlist(productId);
    setLoadingItem(null);
  };

  const handleAddToCart = async (variantId: string) => {
    setLoadingItem(variantId);
    try {
      await addItem(variantId, 1);
    } finally {
      setLoadingItem(null);
    }
  };


  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-[var(--islamic-green)] mb-4" size={48} />
        <p className="text-gray-500 italic">Fetching your saved treasures...</p>
      </div>
    );
  }

  if (products.length === 0) {
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
      {products.map((product) => {
        if (!product) return null;
        
        const price = product.priceRange?.minVariantPrice;
        const mainVariant = product.variants?.[0];
        const isUnavailable = !mainVariant || !product.title;

        return (
          <div key={product.id} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
            <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
              <Image
                src={product.featuredImage?.url || '/Images/p1.jpg'}
                alt={product.title || "Product Image"}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <button 
                onClick={() => handleRemove(product.id)}
                disabled={loadingItem === product.id || isSyncing}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg text-red-500 hover:bg-red-500 hover:text-white transition-all z-10"
              >
                {loadingItem === product.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              </button>
              {isUnavailable && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                  <span className="bg-white/90 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Currently Unavailable
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <Link href={isUnavailable ? "#" : `/products/${product.handle}`} className={`font-bold text-lg text-gray-900 ${!isUnavailable && "group-hover:text-[var(--islamic-green)]"} transition-colors line-clamp-2 mb-2`}>
                {product.title || "Unknown Product"}
              </Link>
              
              <p className="font-bold text-[var(--islamic-green)] mb-6">
                {price ? formatPrice(price.amount, price.currencyCode) : "Price Unavailable"}
              </p>

              <div className="mt-auto flex flex-col gap-3">
                <Button 
                  onClick={() => mainVariant && handleAddToCart(mainVariant.id)}
                  disabled={isUnavailable || loadingItem === mainVariant?.id}
                  className="w-full bg-[var(--islamic-green)] text-white gap-2 rounded-xl h-12 shadow-md shadow-[var(--islamic-green)]/10"
                >
                  {loadingItem === mainVariant?.id ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                  Add to Cart
                </Button>
                {!isUnavailable && (
                  <Button variant="outline" asChild className="w-full rounded-xl border-gray-100 hover:bg-gray-50">
                    <Link href={`/products/${product.handle}`}>
                      View Details
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

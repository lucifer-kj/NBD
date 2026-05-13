import { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getCustomerDetails, getProductsByIds } from '@/lib/shopify';
import { Heart, ChevronLeft, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WishlistItems from '@/components/wishlist/wishlist-items';

export const metadata: Metadata = {
  title: 'My Wishlist | Naaz Book Depot',
  description: 'Your saved spiritual treasures.',
};

export default async function WishlistPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('customerAccessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }

  const customer = await getCustomerDetails(accessToken);

  if (!customer) {
    redirect('/');
  }

  const wishlistIds = customer.wishlist ? JSON.parse(customer.wishlist.value) : [];
  const products = wishlistIds.length > 0 ? await getProductsByIds(wishlistIds) : [];

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
    }).format(parseFloat(amount));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--islamic-green)] mb-8 transition-colors">
        <ChevronLeft size={16} /> Back to Account
      </Link>

      <header className="mb-12">
        <h1 className="text-4xl font-headings font-bold text-[var(--islamic-green)] flex items-center gap-4">
          <Heart className="text-red-500 fill-red-500" size={32} /> My Wishlist
        </h1>
        <p className="text-gray-500 mt-2">Items you've saved for your spiritual collection.</p>
      </header>

      <WishlistItems 
        products={products} 
        customerId={customer.id} 
        allWishlistIds={wishlistIds} 
      />
    </div>
  );
}

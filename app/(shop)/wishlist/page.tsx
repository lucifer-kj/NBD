import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCustomerDetails, getProductsByIds } from '@/lib/shopify';
import { Heart, ChevronLeft } from 'lucide-react';
import WishlistItems from '@/components/wishlist/wishlist-items';
import { getSession } from '@/lib/session';

export const metadata: Metadata = {
  title: 'My Wishlist | Naaz Book Depot',
  description: 'Your saved spiritual treasures.',
};

export default async function WishlistPage() {
  const session = await getSession();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    redirect('/api/auth/login');
  }

  const customer = accessToken ? await getCustomerDetails(accessToken) : null;
  const wishlistIds = customer?.wishlist ? JSON.parse(customer.wishlist.value) : [];
  const products = wishlistIds.length > 0 ? await getProductsByIds(wishlistIds) : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      <Link href="/account" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--islamic-green)] mb-8 transition-colors">
        <ChevronLeft size={16} /> Back to Account
      </Link>

      <header className="mb-12">
        <h1 className="text-4xl font-headings font-bold text-[var(--islamic-green)] flex items-center gap-4">
          <Heart className="text-red-500 fill-red-500" size={32} /> My Wishlist
        </h1>
        <p className="text-gray-500 mt-2">Items you&apos;ve saved for your spiritual collection.</p>
      </header>

      <WishlistItems 
        products={products} 
      />
    </div>
  );
}

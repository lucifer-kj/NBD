import React, { Suspense } from 'react';
import { getProducts } from '@/lib/shopify';
import { ReshapedProduct } from '@/types/shopify';
import { Metadata } from 'next';
import BooksClient from '@/components/shop/BooksClient';

export const metadata: Metadata = {
  title: 'Authentic Islamic Books & Quran Editions | Naaz Book Depot Store',
  description: 'Buy authentic Islamic books online in India. Wide selection of Quran, Hadith, Tafsir, and Islamic literature from India\'s trusted publishing house since 1967.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/books`,
  },
};

export const revalidate = 3600;

export default async function BooksPage() {
  let books: ReshapedProduct[] = [];
  try {
    // Fetch products with "Books" tag or from a "Books" collection
    // For now, we'll fetch all and filter, or just fetch with a query
    books = await getProducts({ 
      query: 'tag:"Islamic Books" OR tag:Books',
      first: 50 
    });
  } catch (error) {
    console.error("Error fetching books from Shopify:", error);
  }
  
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center text-gray-500 animate-pulse">Loading books...</div>}>
      <BooksClient initialBooks={books} />
    </Suspense>
  );
}

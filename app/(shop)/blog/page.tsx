import React from 'react';
import Link from 'next/link';
import { getBlogPosts } from '@/lib/blog';
import { BlogGrid } from '@/components/ui/blog-grid';

export const metadata = {
  title: 'Islamic Insights & Spiritual Articles | Naaz Book Depot Blog',
  description: 'Read articles on Islamic spirituality, Quranic guidance, book reviews, and Muslim lifestyle — curated by the team at Naaz Book Depot since 1967.',
};

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = getBlogPosts();

  if (!posts || posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-headings font-bold text-[var(--islamic-green)]">Our Blog</h1>
        <p className="mt-4 text-gray-600">No blog posts found at the moment. Please check back later.</p>
        <Link href="/" className="mt-8 inline-block bg-[var(--islamic-gold)] text-[var(--islamic-green)] px-6 py-3 rounded-full font-bold">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFCFB] min-h-screen pb-20">
      {/* Hero Section with Islamic pattern */}
      <section className="bg-[var(--islamic-green)] py-20 text-white relative overflow-hidden">
        <div className="islamic-pattern opacity-10 absolute inset-0 pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-headings font-bold mb-4">Islamic Insights</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Spiritual articles, Quranic guidance, and historical book reviews compiled since 1967.
          </p>
        </div>
      </section>

      {/* Interactive Articles Grid */}
      <div className="container mx-auto px-4 relative z-20">
        <BlogGrid posts={posts} />
      </div>
    </div>
  );
}


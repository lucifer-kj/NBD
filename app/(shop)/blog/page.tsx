import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogArticles } from '@/lib/shopify';
import { Calendar, User, ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Blog | Naaz Book Depot',
  description: 'Latest spiritual insights, book reviews, and updates from Naaz Book Depot.',
};

export default async function BlogPage() {
  // Assuming 'news' is the default blog handle. Adjust if needed.
  const blog = await getBlogArticles('news', 12);

  if (!blog) {
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
      {/* Hero Section */}
      <section className="bg-[var(--islamic-green)] py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-headings font-bold mb-4">Spiritual Insights</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Explore articles on Islamic spirituality, history, and wisdom curated for the modern seeker.
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="container mx-auto px-4 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blog.articles.map((article: any) => (
            <article 
              key={article.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100 flex flex-col"
            >
              {/* Featured Image */}
              <Link href={`/blog/news/${article.handle}`} className="relative h-64 block overflow-hidden group">
                <Image 
                  src={article.image?.url || '/Images/Books.jpeg'} 
                  alt={article.image?.altText || article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-[var(--islamic-gold)] text-[var(--islamic-green)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Spirituality
                </div>
              </Link>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {article.authorV2.name}
                  </span>
                </div>

                <h2 className="text-xl font-headings font-bold text-[var(--islamic-green)] mb-3 line-clamp-2 hover:text-[var(--islamic-gold)] transition-colors">
                  <Link href={`/blog/news/${article.handle}`}>
                    {article.title}
                  </Link>
                </h2>

                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                  {article.excerpt || article.content.substring(0, 150) + '...'}
                </p>

                <Link 
                  href={`/blog/news/${article.handle}`} 
                  className="flex items-center gap-1 text-[var(--islamic-gold)] font-bold text-sm group"
                >
                  Read More
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

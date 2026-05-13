import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ChevronRight } from 'lucide-react';
import { getBlogArticles } from '@/lib/shopify';

export default async function BlogSection() {
  const blog = await getBlogArticles('news', 3);

  if (!blog || blog.articles.length === 0) return null;

  return (
    <section className="py-24 bg-[#FDFCFB]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold text-[var(--islamic-gold)] uppercase tracking-[0.2em] mb-3">Spiritual Insights</h2>
            <h3 className="text-3xl md:text-4xl font-headings font-bold text-[var(--islamic-green)]">
              Latest from Our Blog
            </h3>
            <p className="text-gray-600 mt-4 text-lg">
              Dive deep into the wisdom of the ages with articles curated by our team of scholars and researchers.
            </p>
          </div>
          <Link 
            href="/blog" 
            className="group flex items-center gap-2 text-[var(--islamic-green)] font-bold hover:text-[var(--islamic-gold)] transition-colors whitespace-nowrap"
          >
            Explore All Insights
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blog.articles.map((article: any) => (
            <Link 
              key={article.id} 
              href={`/blog/news/${article.handle}`}
              className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image 
                  src={article.image?.url || '/Images/Books.jpeg'} 
                  alt={article.image?.altText || article.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 font-medium uppercase tracking-wider">
                  <Calendar size={14} className="text-[var(--islamic-gold)]" />
                  {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                
                <h4 className="text-xl font-headings font-bold text-[var(--islamic-green)] mb-4 line-clamp-2 group-hover:text-[var(--islamic-gold)] transition-colors">
                  {article.title}
                </h4>
                
                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                  {article.excerpt || article.content.substring(0, 120) + '...'}
                </p>
                
                <span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--islamic-green)] group-hover:gap-2 transition-all">
                  Read Article
                  <ChevronRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

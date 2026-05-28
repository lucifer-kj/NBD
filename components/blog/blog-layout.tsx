import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { ScrollProgressBar, ShareButton } from '@/components/ui/blog-client';
import { BlogPost } from '@/lib/blog';
import { ReshapedProduct } from '@/types/shopify';
import { MarkdownRenderer } from './markdown-renderer';
import { BlogSidebar } from './blog-sidebar';

interface BlogLayoutProps {
  post: BlogPost;
  recentPosts: BlogPost[];
  headings: { id: string; text: string; level: number }[];
  productMap: Map<string, ReshapedProduct>;
  recommendedProductsList: ReshapedProduct[];
  wordCount: number;
  readingTime: number;
  graphSchema: Record<string, unknown>;
}

export function BlogLayout({
  post,
  recentPosts,
  headings,
  productMap,
  recommendedProductsList,
  wordCount,
  readingTime,
  graphSchema,
}: BlogLayoutProps) {
  return (
    <article className="bg-[#FDFCFB] min-h-screen pb-20 relative font-sans">
      <ScrollProgressBar />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
      />
      
      {/* Header / Hero */}
      <header className="relative h-[40vh] md:h-[60vh] w-full bg-black">
        <Image 
          src={post.image || '/Images/Books.jpeg'} 
          alt={post.title}
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--islamic-green)] to-transparent opacity-95" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-headings font-bold text-white max-w-4xl leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 mt-8 text-white/90">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[var(--islamic-gold)] flex items-center justify-center text-[var(--islamic-green)] font-bold">
                  {post.author.charAt(0)}
                </div>
                <span className="font-medium">{post.author}</span>
              </div>
              
              <div className="flex items-center gap-6 border-l border-white/20 pl-6">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={18} className="text-[var(--islamic-gold)]" />
                  {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={18} className="text-[var(--islamic-gold)]" />
                  <span>{readingTime} min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout Grid */}
      <div className="container mx-auto px-4 mt-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Article Body Column */}
          <main className="col-span-1 lg:col-span-8">
            <div className="bg-white rounded-3xl p-6 md:p-12 border border-gray-100 shadow-sm">
              {/* Reading Stats Bar for premium UX */}
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-8 border-b border-gray-100 pb-6">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={14} className="text-[var(--islamic-gold)]" />
                  {wordCount} words
                </span>
                <span>•</span>
                <span>Published in <span className="text-[var(--islamic-green)] font-semibold">Spirituality</span></span>
              </div>

              {/* TL;DR Container for GEO (Generative Engine Optimization) */}
              {post.tldr && (
                <div className="mb-8 p-6 bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-3xl border border-amber-100/60 shadow-sm relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--islamic-gold)] opacity-5 rounded-full blur-2xl pointer-events-none" />
                  <h3 className="text-xs font-bold text-[var(--islamic-green)] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--islamic-gold)]" />
                    TL;DR / Key Takeaways
                  </h3>
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed italic">
                    &ldquo;{post.tldr}&rdquo;
                  </p>
                </div>
              )}

              {/* Parsed Blog Markdown Content */}
              <div className="prose prose-lg prose-stone max-w-3xl prose-headings:font-headings prose-headings:text-[var(--islamic-green)] leading-relaxed">
                <MarkdownRenderer content={post.content} productMap={productMap} />
              </div>

              {/* Dynamic FAQ / Q&A Section for GEO & Crawlability */}
              {post.faqs && post.faqs.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <h3 className="text-xl font-headings font-bold text-[var(--islamic-green)] mb-6 flex items-center gap-2">
                    <span className="text-[var(--islamic-gold)]">💬</span> Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    {post.faqs.map((faq, index) => (
                      <div key={index} className="bg-amber-50/20 border border-amber-100/40 rounded-2xl p-5 hover:bg-amber-50/30 transition-all">
                        <h4 className="font-headings font-bold text-gray-800 text-sm md:text-base mb-2">
                          Q: {faq.question}
                        </h4>
                        <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Footer / Sharing Bar */}
              <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex gap-2 flex-wrap">
                  {post.tags?.map((tag: string) => (
                    <span key={tag} className="bg-gray-100 text-gray-600 px-3.5 py-1 rounded-full text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <ShareButton title={post.title} excerpt={post.excerpt} />
              </div>
            </div>

            {/* Recommended Books Section */}
            {recommendedProductsList.length > 0 && (
              <div className="mt-8 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-headings font-bold text-[var(--islamic-green)] mb-1 flex items-center gap-2">
                  <span>📖</span> Recommended Books & Literature
                </h3>
                <p className="text-xs text-gray-500 mb-6 font-sans">
                  Authenticated editions discussed in this article, curated directly from our bookstore collection.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {recommendedProductsList.map((product) => {
                    const price = product.priceRange?.minVariantPrice;
                    const imageUrl = product.images?.[0]?.url || '/Images/Books.jpeg';
                    const formattedPriceStr = price 
                      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: price.currencyCode }).format(parseFloat(price.amount))
                      : 'Price unavailable';

                    return (
                      <div 
                        key={product.handle} 
                        className="flex gap-4 p-4 rounded-2xl bg-amber-50/10 border border-amber-100/30 hover:border-[var(--islamic-gold)]/45 transition-all group hover:bg-amber-50/20"
                      >
                        <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                          <Image 
                            src={imageUrl} 
                            alt={product.title} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex flex-col justify-between py-1">
                          <div>
                            <h4 className="font-headings font-bold text-sm text-[var(--islamic-green)] line-clamp-2 leading-snug">
                              {product.title}
                            </h4>
                            <p className="text-[10px] uppercase font-semibold text-[var(--islamic-gold)] tracking-wider mt-1.5 font-sans">
                              {product.vendor || 'Naaz Editions'}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-4">
                            <span className="font-sans font-bold text-sm text-gray-900 font-numeric">
                              {formattedPriceStr}
                            </span>
                            <Link 
                              href={`/products/${product.handle}`}
                              className="px-3.5 py-1.5 rounded-xl bg-[var(--islamic-green)] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green)] transition-all flex items-center justify-center font-sans border border-transparent shadow-sm"
                            >
                              View Book
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Author Box with enriched styling & glass-card pattern */}
            <div className="mt-8 p-8 bg-white/70 backdrop-blur-md rounded-3xl border border-gray-100/85 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left glass-card hover:border-[var(--islamic-gold)]/30 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-[var(--islamic-green)] hover:bg-[var(--islamic-gold)] transition-colors flex items-center justify-center text-white hover:text-[var(--islamic-green)] text-2xl font-bold flex-shrink-0 shadow-inner">
                {post.author.charAt(0)}
              </div>
              <div>
                <h4 className="font-headings font-bold text-[var(--islamic-green)] flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  Written by {post.author}
                  <span className="bg-amber-100 text-[var(--islamic-green)] text-[10px] px-2.5 py-0.5 rounded-full font-sans uppercase font-bold tracking-wider">
                    Verified Editorial since 1967
                  </span>
                </h4>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                  Contributing editor and scholar at Naaz Book Depot. Committed to compiling, reviewing, and sharing authenticated Islamic literature and historical perspectives since 1967.
                </p>
              </div>
            </div>
          </main>

          {/* Sticky Table of Contents Sidebar Column */}
          <BlogSidebar recentPosts={recentPosts} headings={headings} />
          
        </div>
      </div>
    </article>
  );
}

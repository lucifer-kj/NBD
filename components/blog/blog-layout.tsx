import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BookOpen, 
  Bookmark, 
  History,
  MessageCircle
} from 'lucide-react';
import { Playfair_Display, Lora } from 'next/font/google';
import { ScrollProgressBar, ShareButton, BlogFaqAccordion, MobileReaderBar } from '@/components/ui/blog-client';
import { BlogToc } from './blog-toc';
import { BlogSidebar } from './blog-sidebar';
import { MarkdownRenderer } from './markdown-renderer';
import { BlogPost } from '@/lib/blog';
import { ReshapedProduct } from '@/types/shopify';
import { formatPrice } from '@/lib/utils';
import { getProductUrl } from '@/lib/url-helper';

// Load isolated Google Fonts to completely match the mock UI/UX style without leaking into other pages
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap',
  variable: '--font-playfair',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-lora',
});

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
  // Ensure the Frequently Asked Questions item is dynamically added to the Table of Contents if FAQs exist
  const allHeadings = [...headings];
  if (post.faqs && post.faqs.length > 0 && !allHeadings.some(h => h.id === 'faq')) {
    allHeadings.push({ 
      id: 'faq', 
      text: 'Frequently Asked Questions', 
      level: 2 
    });
  }

  return (
    <article className={`${playfair.variable} ${lora.variable} bg-[#FAF6EE] text-[#1B3A2D] font-[family-name:var(--font-lora)] selection:bg-[#C9972A] selection:text-white min-h-screen relative`}>
      <ScrollProgressBar />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
      />
      
      {/* 1. Dynamic Hero Redesign in Deep Forest Green (#163020) */}
      <header className="relative w-full bg-[#163020] pt-20 pb-16 px-6 overflow-hidden border-b border-[#C9972A]/10">
        {/* Decorative Texture Overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstripe-dark.png')]" />
        
        <div className="max-w-[1440px] mx-auto relative z-10 flex flex-col items-center text-center">
          <Link 
            href="/blog" 
            className="flex items-center gap-2 text-[#C9972A] font-sans text-sm font-semibold mb-8 hover:opacity-80 transition-opacity self-start md:self-center cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Insights</span>
          </Link>
          
          <div className="bg-[#C9972A] text-[#163020] px-4 py-1 rounded-full font-sans text-xs font-bold uppercase tracking-widest mb-6">
            {post.tags?.[0] || 'Spirituality'}
          </div>
          
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl lg:text-[64px] font-black text-[#FAF6EE] max-w-[900px] leading-[1.1] mb-10 tracking-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1B3A2D] border border-[#C9972A] flex items-center justify-center text-[#C9972A] font-black font-[family-name:var(--font-playfair)] text-xl">
                {post.author.charAt(0)}
              </div>
              <span className="font-sans font-medium text-[#FAF6EE]/90">{post.author}</span>
            </div>
            <div className="flex items-center gap-2 text-[#FAF6EE]/60 text-sm font-sans">
              <History className="w-4 h-4" />
              <span>
                {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#FAF6EE]/60 text-sm font-sans">
              <BookOpen className="w-4 h-4" />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
        
        <div className="mt-16 w-full border-t border-[#FAF6EE]/10 pt-6">
          <div className="max-w-[1440px] mx-auto px-6 flex justify-between items-center text-[#FAF6EE]/40 text-[10px] font-sans font-bold uppercase tracking-[0.2em]">
            <span>{wordCount} words</span>
            <span>Published in {post.tags?.[0] || 'Spirituality'}</span>
          </div>
        </div>
      </header>

      {/* 2. Key Takeaways Banner in Antique Gold (#C9972A) */}
      {post.tldr && (
        <div className="w-full bg-[#C9972A] py-8 px-6 border-b border-[#FAF6EE]/10">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center gap-6">
            <div className="bg-[#FAF6EE] p-3 rounded-xl shadow-sm">
              <Bookmark className="w-6 h-6 text-[#C9972A]" />
            </div>
            <div>
              <span className="block font-sans text-xs font-black text-[#1B3A2D]/60 tracking-[0.2em] mb-1 uppercase">
                TL;DR / KEY TAKEAWAYS
              </span>
              <p className="font-[family-name:var(--font-lora)] italic text-[#FAF6EE] text-xl md:text-2xl font-medium leading-relaxed">
                &ldquo;{post.tldr}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Premium Grid Layout */}
      <main className="max-w-[1440px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_720px_280px] justify-center gap-10 relative">
          
          {/* Left Column Sidebar - Scroll-Tracked Table of Contents */}
          <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-none pr-1">
            <BlogToc headings={allHeadings} title={post.title} />
          </aside>

          {/* Center Column - Prose Copy via MarkdownRenderer */}
          <article className="w-full">
            <section className="mb-20">
              <MarkdownRenderer content={post.content} productMap={productMap} />
            </section>

            {/* Dynamic FAQ Accordion for SEO Crawlability & Structured Data Schema */}
            {post.faqs && post.faqs.length > 0 && (
              <section id="faq" className="mt-20 pt-20 border-t border-[#C9972A]/20 scroll-mt-24">
                <div className="flex items-center gap-3 mb-12">
                  <MessageCircle className="w-8 h-8 text-[#C9972A]" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-black text-[#C9972A]">
                    Frequently Asked Questions
                  </h2>
                </div>
                <BlogFaqAccordion faqs={post.faqs} />
              </section>
            )}

            {/* Article Footer & Tags */}
            <div className="mt-16 pt-8 border-t border-[#C9972A]/10 flex flex-wrap items-center justify-between gap-6">
              <div className="flex gap-2 flex-wrap">
                {post.tags?.map((tag: string) => (
                  <span 
                    key={tag} 
                    className="px-4 py-2 border border-[#1B3A2D] text-[#C9972A] font-sans text-xs font-bold rounded-full transition-all hover:bg-[#C9972A] hover:text-[#FAF6EE] hover:border-[#C9972A]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <ShareButton title={post.title} excerpt={post.excerpt || ''} />
              </div>
            </div>
          </article>

          {/* Right Column Sidebar - Heritage Seal, Newsletter Subscription */}
          <BlogSidebar recentPosts={recentPosts} />
          
        </div>
      </main>

      {/* 4. Bottom Recommended Books / Products Grid in Pale Dark Cream (#F2EBD9) */}
      {recommendedProductsList.length > 0 && (
        <section className="w-full bg-[#F2EBD9] py-24 border-t border-[#C9972A]/10">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-16">
              <div className="w-12 h-12 bg-[#1B3A2D] flex items-center justify-center text-[#C9972A] mb-6 rounded-sm shadow-inner">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="font-[family-name:var(--font-playfair)] text-4xl font-black text-[#1B3A2D] mb-4">
                Recommended Books & Literature
              </h2>
              <p className="font-[family-name:var(--font-lora)] text-[#1B3A2D]/60 max-w-[600px] leading-relaxed text-lg">
                Authenticated editions discussed in this article, curated directly from our bookstore collection in Kolkata.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recommendedProductsList.map((product) => {
                const price = product.priceRange?.minVariantPrice;
                const imageUrl = product.images?.[0]?.url || '/Images/Books.jpeg';
                const formattedPriceStr = price 
                  ? formatPrice(price.amount, price.currencyCode)
                  : '₹0.00';

                return (
                  <div 
                    key={product.handle} 
                    className="group bg-white border border-[#C9972A]/10 p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-[#C9972A]/10 hover:-translate-y-1 rounded-sm flex flex-col justify-between"
                  >
                    <div>
                      <Link 
                        href={getProductUrl(product)}
                        className="relative w-full aspect-[3/4] mb-4 flex items-center justify-center bg-gray-50 overflow-hidden shadow-sm border border-[#C9972A]/5 group-hover:shadow-md transition-shadow duration-300 block"
                      >
                        <Image 
                          src={imageUrl} 
                          alt={product.title} 
                          fill 
                          className="object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                      </Link>
                      <div className="mb-4">
                        <span className="text-[10px] font-sans font-black text-[#C9972A] tracking-[0.2em] uppercase">
                          {product.vendor || 'NAAZ EDITIONS'}
                        </span>
                        <h4 className="font-[family-name:var(--font-lora)] font-semibold text-[#1B3A2D] text-lg leading-snug h-12 overflow-hidden mb-2 group-hover:text-[#C9972A] transition-colors">
                          <Link href={getProductUrl(product)}>{product.title}</Link>
                        </h4>
                        <p className="font-[family-name:var(--font-lora)] font-bold text-[#1B3A2D] text-xl">{formattedPriceStr}</p>
                      </div>
                    </div>
                    <Link 
                      href={getProductUrl(product)}
                      className="w-full py-3 bg-[#1B3A2D] text-[#FAF6EE] font-sans text-xs font-bold tracking-widest transition-all hover:bg-[#C9972A] hover:text-[#1B3A2D] text-center uppercase cursor-pointer"
                    >
                      VIEW BOOK
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. Author Bio Strip with Custom Circular Initial */}
      <section className="w-full bg-[#FAF6EE] border-t border-[#C9972A]/10 py-20">
        <div className="max-w-[800px] mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 rounded-full bg-[#1B3A2D] border-4 border-[#C9972A]/20 flex items-center justify-center text-[#C9972A] font-[family-name:var(--font-playfair)] text-5xl font-black shrink-0 shadow-xl shadow-[#1B3A2D]/10 select-none">
            {post.author.charAt(0)}
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
              <h5 className="font-[family-name:var(--font-playfair)] text-2xl font-black text-[#1B3A2D]">
                Written by {post.author}
              </h5>
              <div className="bg-[#C9972A]/10 text-[#C9972A] px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border border-[#C9972A]/20 select-none">
                VERIFIED EDITORIAL SINCE 1967
              </div>
            </div>
            <p className="font-[family-name:var(--font-lora)] text-[#1B3A2D]/60 text-lg leading-relaxed">
              Contributing editor and scholar at Naaz Book Depot. Committed to compiling, reviewing, and sharing authenticated Islamic literature and historical perspectives since 1967. Our mission is to preserve the integrity of sacred texts for the next generation.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Mobile Reader Bar for Premium mobile experience */}
      <MobileReaderBar headings={allHeadings} title={post.title} />
    </article>
  );
}

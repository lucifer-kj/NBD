import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/blog';
import { Calendar, ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { ScrollProgressBar, TableOfContents, ShareButton, NewsletterBox } from '@/components/ui/blog-client';
import { getProduct } from '@/lib/shopify';
import { formatPrice } from '@/lib/utils';
import { ReshapedProduct } from '@/types/shopify';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  
  if (!post) return { title: 'Post Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.naazbook.in';

  return {
    title: `${post.title} | Naaz Book Depot`,
    description: post.excerpt,
    alternates: {
      canonical: `${siteUrl}/blog/${post.slug}`,
    },
    openGraph: {
      images: post.image ? [post.image] : [],
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.lastModified,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Fetch all posts for the "Recent Articles" widget
  const allPosts = getBlogPosts();
  const recentPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  // Fetch recommended products from Shopify storefront
  let recommendedProductsList: ReshapedProduct[] = [];
  if (post.recommendedProducts && post.recommendedProducts.length > 0) {
    try {
      const fetched = await Promise.all(
        post.recommendedProducts.map(handle => getProduct(handle))
      );
      recommendedProductsList = fetched.filter(Boolean) as ReshapedProduct[];
    } catch (err) {
      console.error('Error loading blog post products:', err);
    }
  }

  // Calculate article stats
  const wordCount = post.content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  // Generate Table of Contents items
  const headingLines = post.content.split('\n').filter(line => line.startsWith('#') || line.startsWith('##') || line.startsWith('###'));
  const headings = headingLines.map(line => {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim().replace(/\*\*|\[|\]\(.+?\)/g, ''); // strip markdown bold/links
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return { id, text, level };
    }
    return null;
  }).filter(Boolean) as { id: string; text: string; level: number }[];

  interface SchemaItem {
    "@type": string;
    "@id": string;
    about?: unknown[];
    [key: string]: unknown;
  }

  // Graph Schema.org implementation (combining Breadcrumb + Article for search crawler optimization)
  const graphSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `https://www.naazbook.in/blog/${post.slug}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.naazbook.in"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": "https://www.naazbook.in/blog"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": post.title,
            "item": `https://www.naazbook.in/blog/${post.slug}`
          }
        ]
      },
      {
        "@type": "BlogPosting",
        "@id": `https://www.naazbook.in/blog/${post.slug}#article`,
        "isPartOf": {
          "@type": "WebPage",
          "@id": `https://www.naazbook.in/blog/${post.slug}`
        },
        "headline": post.title,
        "description": post.excerpt,
        "image": post.image ? `https://www.naazbook.in${post.image}` : "https://www.naazbook.in/Images/Books.jpeg",
        "datePublished": post.publishedAt,
        "dateModified": post.lastModified,
        "author": {
          "@type": "Person",
          "name": post.author
        },
        "publisher": {
          "@type": "Organization",
          "name": "Naaz Book Depot",
          "url": "https://www.naazbook.in",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.naazbook.in/Images/Logo.png"
          }
        },
        "mainEntityOfPage": `https://www.naazbook.in/blog/${post.slug}`,
        "wordCount": wordCount,
        "timeRequired": `PT${readingTime}M`
      }
    ]
  } as {
    "@context": string;
    "@graph": SchemaItem[];
  };

  // Link product recommendations to Article schema mentions
  if (recommendedProductsList.length > 0) {
    const articleEntity = graphSchema["@graph"].find((item) => item["@type"] === "BlogPosting");
    if (articleEntity) {
      articleEntity.about = recommendedProductsList.map((prod) => ({
        "@type": "Product",
        "name": prod.title,
        "url": `https://www.naazbook.in/products/${prod.handle}`,
        "image": prod.images?.[0]?.url || "https://www.naazbook.in/Images/Books.jpeg",
        "description": prod.description
      }));
    }
  }

  // Pushing dynamic FAQ Page schema for advanced search listing snippets
  if (post.faqs && post.faqs.length > 0) {
    graphSchema["@graph"].push({
      "@type": "FAQPage",
      "@id": `https://www.naazbook.in/blog/${post.slug}#faq`,
      "mainEntity": post.faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }

  return (
    <article className="bg-[#FDFCFB] min-h-screen pb-20 relative">
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
              <div className="prose prose-lg prose-stone max-w-none prose-headings:font-headings prose-headings:text-[var(--islamic-green)]">
                <MarkdownRenderer content={post.content} />
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
                            <span className="font-sans font-bold text-sm text-gray-900">
                              {price ? formatPrice(price.amount, price.currencyCode) : 'Price unavailable'}
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
          <aside className="col-span-1 lg:col-span-4 space-y-8">
            <div className="space-y-8">
              {/* Recent Articles Widget */}
              {recentPosts.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-[var(--islamic-gold)]/25 transition-all duration-300">
                  <h3 className="font-headings font-bold text-lg text-[var(--islamic-green)] flex items-center gap-2 mb-4">
                    <span>📚</span> Recent Articles
                  </h3>
                  <div className="space-y-4">
                    {recentPosts.map((recent) => (
                      <Link 
                        key={recent.slug} 
                        href={`/blog/${recent.slug}`} 
                        className="group flex gap-4 items-center hover:opacity-95 transition-opacity"
                      >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                          <Image 
                            src={recent.image || '/Images/Books.jpeg'} 
                            alt={recent.title} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-sans text-gray-400 block mb-1">
                            {new Date(recent.publishedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <h4 className="font-headings font-bold text-sm text-[var(--islamic-green)] group-hover:text-[var(--islamic-gold)] transition-colors line-clamp-2 leading-snug">
                            {recent.title}
                          </h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter Box */}
              <NewsletterBox />

              {/* Table of Contents */}
              <TableOfContents headings={headings} />
            </div>
          </aside>
          
        </div>
      </div>
    </article>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  const blocks = content.split(/\r?\n\r?\n/);

  return (
    <div className="space-y-6 text-gray-700 leading-relaxed">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Helper to compute a stable element ID for TOC anchoring
        const makeHeadingId = (text: string) => {
          return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        };

        // 1. Heading 1
        if (trimmed.startsWith('# ')) {
          const headingText = trimmed.substring(2);
          return (
            <h1 
              id={makeHeadingId(headingText)} 
              key={index} 
              className="text-3xl md:text-4xl font-headings font-bold text-[var(--islamic-green)] mt-8 mb-4 scroll-mt-24"
            >
              {parseInline(headingText)}
            </h1>
          );
        }

        // 2. Heading 2
        if (trimmed.startsWith('## ')) {
          const headingText = trimmed.substring(3);
          return (
            <h2 
              id={makeHeadingId(headingText)} 
              key={index} 
              className="text-2xl md:text-3xl font-headings font-bold text-[var(--islamic-green)] mt-8 mb-4 border-b border-gray-100 pb-2 scroll-mt-24"
            >
              {parseInline(headingText)}
            </h2>
          );
        }

        // 3. Heading 3
        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.substring(4);
          return (
            <h3 
              id={makeHeadingId(headingText)} 
              key={index} 
              className="text-xl md:text-2xl font-headings font-bold text-[var(--islamic-green)] mt-6 mb-3 scroll-mt-24"
            >
              {parseInline(headingText)}
            </h3>
          );
        }

        // 4. Blockquote & Alert Callouts
        if (trimmed.startsWith('>')) {
          const lines = trimmed.split('\n').map(line => line.replace(/^>\s?/, '').trim());
          const fullText = lines.join('\n');
          const alertMatch = fullText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*([\s\S]*)$/i);
          
          if (alertMatch) {
            const type = alertMatch[1].toUpperCase();
            const contentText = alertMatch[2].trim();
            
            let alertStyle = '';
            let emoji = '';
            let title = '';
            
            switch (type) {
              case 'NOTE':
                alertStyle = 'border-blue-200 bg-blue-50/30 text-blue-800';
                emoji = 'ℹ️';
                title = 'Note';
                break;
              case 'TIP':
                alertStyle = 'border-emerald-200 bg-emerald-50/30 text-emerald-800';
                emoji = '💡';
                title = 'Tip';
                break;
              case 'IMPORTANT':
                alertStyle = 'border-indigo-200 bg-indigo-50/30 text-indigo-800';
                emoji = '📌';
                title = 'Important';
                break;
              case 'WARNING':
                alertStyle = 'border-amber-200 bg-amber-50/30 text-amber-800';
                emoji = '⚠️';
                title = 'Warning';
                break;
              case 'CAUTION':
                alertStyle = 'border-rose-200 bg-rose-50/30 text-rose-800';
                emoji = '🚨';
                title = 'Caution';
                break;
            }
            
            return (
              <div 
                key={index} 
                className={`border-l-4 p-5 my-6 rounded-r-2xl backdrop-blur-sm shadow-sm border-t border-b border-r ${alertStyle}`}
              >
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-2 font-sans">
                  <span>{emoji}</span>
                  <span>{title}</span>
                </div>
                <div className="text-sm md:text-base leading-relaxed text-gray-700 font-sans">
                  {parseInline(contentText)}
                </div>
              </div>
            );
          }

          // Fallback to standard styled blockquote
          return (
            <blockquote key={index} className="border-l-4 border-[var(--islamic-gold)] bg-amber-50/10 px-6 py-4 my-6 rounded-r-2xl italic text-gray-600 shadow-sm border-t border-b border-r border-amber-100/30">
              {parseInline(lines.join(' '))}
            </blockquote>
          );
        }

        // 5. Table Support
        if (trimmed.startsWith('|')) {
          const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length >= 2) {
            // Check if second line is a header separator (contains only |, -, :, and spaces)
            const isSeparator = /^\|?[\s-:\\|]+$/.test(lines[1]);
            if (isSeparator) {
              const headers = lines[0]
                .split('|')
                .map(h => h.trim())
                .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
              
              const rows = lines.slice(2).map(line => {
                return line
                  .split('|')
                  .map(cell => cell.trim())
                  .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
              });

              return (
                <div key={index} className="my-8 overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                  <table className="w-full text-left border-collapse text-sm md:text-base">
                    <thead>
                      <tr className="bg-amber-50/50 border-b border-gray-100">
                        {headers.map((header, hIdx) => (
                          <th key={hIdx} className="px-6 py-4 font-bold text-[var(--islamic-green)] font-headings">
                            {parseInline(header)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-gray-50/50 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-6 py-4 text-gray-600 leading-relaxed">
                              {parseInline(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
          }
        }

        // 6. Inline/Block Image parser
        if (trimmed.startsWith('![') && trimmed.endsWith(')')) {
          const match = trimmed.match(/^!\[([\s\S]*?)\]\(([\s\S]+?)\)$/);
          if (match) {
            const alt = match[1] || 'Naaz Book Depot Article Illustration';
            const url = match[2];
            return (
              <figure key={index} className="my-8 flex flex-col items-center gap-3">
                <div className="relative w-full aspect-[16/9] max-h-[500px] rounded-3xl overflow-hidden shadow-md border border-gray-100">
                  <Image 
                    src={url}
                    alt={alt}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  />
                </div>
                {alt && (
                  <figcaption className="text-xs md:text-sm text-gray-500 font-sans italic">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          }
        }

        // 7. Unordered List
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split(/\n[-*]\s/).map(item => item.replace(/^[-*]\s/, '').trim());
          return (
            <ul key={index} className="list-disc pl-6 space-y-2 my-4">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>{parseInline(item)}</li>
              ))}
            </ul>
          );
        }

        // 8. Ordered List
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split(/\n\d+\.\s/).map(item => item.replace(/^\d+\.\s/, '').trim());
          return (
            <ol key={index} className="list-decimal pl-6 space-y-2 my-4">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>{parseInline(item)}</li>
              ))}
            </ol>
          );
        }

        // 9. Regular paragraph
        return (
          <p key={index} className="text-base md:text-lg">
            {parseInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function parseInline(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining) {
    const imgMatch = remaining.match(/^([\s\S]*?)!\[([\s\S]*?)\]\(([\s\S]+?)\)([\s\S]*)$/);
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([\s\S]+?)\*\*([\s\S]*)$/);
    const linkMatch = remaining.match(/^([\s\S]*?)\[([\s\S]+?)\]\(([\s\S]+?)\)([\s\S]*)$/);

    // Find the match that occurs earliest in the string
    let firstMatch: 'img' | 'bold' | 'link' | null = null;
    let firstIdx = remaining.length;

    if (imgMatch && imgMatch[1].length < firstIdx) {
      firstIdx = imgMatch[1].length;
      firstMatch = 'img';
    }
    if (boldMatch && boldMatch[1].length < firstIdx) {
      firstIdx = boldMatch[1].length;
      firstMatch = 'bold';
    }
    if (linkMatch && linkMatch[1].length < firstIdx) {
      firstIdx = linkMatch[1].length;
      firstMatch = 'link';
    }

    if (firstMatch === 'img' && imgMatch) {
      if (imgMatch[1]) {
        tokens.push(<span key={keyIdx++}>{imgMatch[1]}</span>);
      }
      tokens.push(
        <span key={keyIdx++} className="inline-block relative align-middle max-w-full my-1 rounded-lg overflow-hidden border border-gray-100 shadow-sm aspect-video h-32">
          <Image 
            src={imgMatch[3]} 
            alt={imgMatch[2]} 
            fill
            className="object-cover"
          />
        </span>
      );
      remaining = imgMatch[4];
    } else if (firstMatch === 'bold' && boldMatch) {
      if (boldMatch[1]) {
        tokens.push(<span key={keyIdx++}>{boldMatch[1]}</span>);
      }
      tokens.push(<strong key={keyIdx++} className="font-bold text-[var(--islamic-green)]">{boldMatch[2]}</strong>);
      remaining = boldMatch[3];
    } else if (firstMatch === 'link' && linkMatch) {
      if (linkMatch[1]) {
        tokens.push(<span key={keyIdx++}>{linkMatch[1]}</span>);
      }
      tokens.push(
        <a key={keyIdx++} href={linkMatch[3]} className="text-[var(--islamic-gold)] hover:underline font-semibold">
          {linkMatch[2]}
        </a>
      );
      remaining = linkMatch[4];
    } else {
      tokens.push(<span key={keyIdx++}>{remaining}</span>);
      break;
    }
  }

  return tokens;
}

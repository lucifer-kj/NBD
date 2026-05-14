import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticle, getBlogArticles } from '@/lib/shopify';
import { Calendar, ArrowLeft, Share2 } from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{
    blogHandle: string;
    articleHandle: string;
  }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const blog = await getBlogArticles('news', 10);
  if (!blog) return [];
  return blog.articles.map((article: any) => ({
    blogHandle: 'news',
    articleHandle: article.handle,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { blogHandle, articleHandle } = await params;
  const article = await getArticle(blogHandle, articleHandle);
  
  if (!article) return { title: 'Article Not Found' };

  return {
    title: `${article.seo.title || article.title} | Naaz Book Depot`,
    description: article.seo.description || article.excerpt,
    openGraph: {
      images: article.image ? [article.image.url] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { blogHandle, articleHandle } = await params;
  const article = await getArticle(blogHandle, articleHandle);

  if (!article) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
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
        "name": "Insights",
        "item": "https://www.naazbook.in/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `https://www.naazbook.in/blog/${blogHandle}/${articleHandle}`
      }
    ]
  };

  return (
    <article className="bg-[#FDFCFB] min-h-screen pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header / Hero */}
      <header className="relative h-[40vh] md:h-[60vh] w-full bg-black">
        <Image 
          src={article.image?.url || '/Images/Books.jpeg'} 
          alt={article.image?.altText || article.title}
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--islamic-green)] to-transparent opacity-90" />
        
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
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 mt-8 text-white/90">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[var(--islamic-gold)] flex items-center justify-center text-[var(--islamic-green)] font-bold">
                  {article.authorV2.name.charAt(0)}
                </div>
                <span className="font-medium">{article.authorV2.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={18} className="text-[var(--islamic-gold)]" />
                {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content Section */}
      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-3xl mx-auto">
          {/* Main Content */}
          <div 
            className="prose prose-lg prose-stone max-w-none 
              prose-headings:font-headings prose-headings:text-[var(--islamic-green)]
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-strong:text-[var(--islamic-green)]
              prose-a:text-[var(--islamic-gold)] prose-a:font-bold hover:prose-a:underline
              prose-img:rounded-2xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          {/* Footer / Sharing */}
          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex gap-2">
              {article.tags?.map((tag: string) => (
                <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Share</span>
              <div className="flex gap-3">
                <button className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow text-blue-600 border border-gray-50">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Related / Author Box (Optional) */}
          <div className="mt-12 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm flex gap-6 items-center">
             <div className="w-20 h-20 rounded-full bg-[var(--islamic-green)] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {article.authorV2.name.charAt(0)}
             </div>
             <div>
                <h4 className="font-headings font-bold text-[var(--islamic-green)]">About {article.authorV2.name}</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Contributing writer and scholar at Naaz Book Depot, dedicated to sharing Islamic knowledge and wisdom.
                </p>
             </div>
          </div>
        </div>
      </div>
    </article>
  );
}

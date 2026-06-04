import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ChevronRight } from 'lucide-react';
import { getBlogPosts } from '@/lib/blog';

export default async function BlogSection() {
  const actualPosts = getBlogPosts();
  
  // Display only actual posts, completely removing temporary mock blog fallbacks
  const displayPosts = [...actualPosts];

  if (displayPosts.length === 0) return null;

  const featuredPost = displayPosts[0];
  const listPosts = displayPosts.slice(1, 4);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold text-[var(--islamic-gold)] uppercase tracking-[0.2em] mb-3">Islamic Insights</h2>
            <h3 className="text-3xl md:text-4xl font-headings font-bold text-[var(--islamic-green)] tracking-wide">
              Spiritual Articles & Guidance
            </h3>
          </div>
          <Link 
            href="/blog" 
            className="group flex items-center gap-2 text-[var(--islamic-green)] font-bold hover:text-[var(--islamic-gold)] transition-colors whitespace-nowrap"
          >
            Explore All Insights
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Split Layout: Left side featured post, right side vertical list of posts */}
        <div className={`grid grid-cols-1 ${listPosts.length > 0 ? 'lg:grid-cols-5' : 'lg:grid-cols-1 max-w-4xl mx-auto'} gap-8 items-stretch`}>
          {/* LEFT: Featured Post (3/5 Columns, or full-width if no list posts) */}
          <div className={`${listPosts.length > 0 ? 'lg:col-span-3' : 'lg:col-span-1'} h-full`}>
            <Link 
              href={`/blog/${featuredPost.slug}`}
              className="group flex flex-col h-full bg-[#FCFAF7] border border-[#e9e3d9] rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-50 border-b border-[#e9e3d9]/40">
                <Image 
                  src={featuredPost.image || '/Images/Books.jpeg'} 
                  alt={featuredPost.title}
                  fill
                  sizes="(max-width: 1024px) 90vw, 800px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                
                {/* Must Read Badge */}
                <span className="absolute top-4 left-4 bg-[#c19a4e] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg tracking-widest uppercase z-10 shadow-sm">
                  Must Read
                </span>
              </div>
              
              <div className="p-6 md:p-8 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">
                    <Calendar size={13} className="text-[var(--islamic-gold)]" />
                    {new Date(featuredPost.publishedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                    <span className="text-gray-300">•</span>
                    <span>By {featuredPost.author}</span>
                  </div>
                  
                  <h4 className="text-xl md:text-2xl font-headings font-bold text-[var(--islamic-green)] mb-3 line-clamp-2 group-hover:text-[var(--islamic-gold)] transition-colors">
                    {featuredPost.title}
                  </h4>
                  
                  <p className="text-gray-600 text-sm md:text-[15px] line-clamp-3 mb-6 leading-relaxed font-sans font-light">
                    {featuredPost.excerpt}
                  </p>
                </div>
                
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--islamic-green)] group-hover:gap-2 transition-all">
                  Read Article
                  <ChevronRight size={16} />
                </span>
              </div>
            </Link>
          </div>

          {/* RIGHT: Stack of list posts (2/5 Columns, rendered only if list posts exist) */}
          {listPosts.length > 0 && (
            <div className="lg:col-span-2 flex flex-col gap-6 justify-between h-full">
              {listPosts.map((post) => (
                <Link 
                  key={post.slug} 
                  href={`/blog/${post.slug}`}
                  className="group flex gap-4 p-4 bg-white border border-[#e9e3d9] rounded-2xl hover:shadow-md transition-all duration-300 flex-1 items-center"
                >
                  {/* Horizontal thumbnail image on the left with 16:9 aspect ratio */}
                  <div className="relative w-24 aspect-[16/9] sm:w-28 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                    <Image 
                      src={post.image || '/Images/Books.jpeg'} 
                      alt={post.title}
                      fill
                      sizes="120px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  
                  {/* Details on the right */}
                  <div className="flex flex-col flex-grow justify-between min-h-[90px]">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1 block">
                        {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <h4 className="font-headings font-bold text-sm sm:text-base text-gray-800 line-clamp-2 leading-snug group-hover:text-[var(--islamic-gold)] transition-colors mb-2">
                        {post.title}
                      </h4>
                    </div>
                    
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--islamic-green)] group-hover:text-[var(--islamic-gold)] transition-colors">
                      Read Article <ChevronRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

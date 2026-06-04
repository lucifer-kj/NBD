import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ChevronRight } from 'lucide-react';
import { getBlogPosts, BlogPost } from '@/lib/blog';

export default async function BlogSection() {
  const actualPosts = getBlogPosts();
  
  // High quality default fallback posts to ensure 4 items are always populated to match the visual mock layout
  const defaultPosts: BlogPost[] = [
    {
      slug: "complete-guide-islamic-books-india",
      title: "The Complete Guide to Authentic Islamic Books & Classical Texts",
      excerpt: "Explore the rich history, categorization, and validation of classical Islamic reference books in India. Learn what to look for when building your spiritual library.",
      publishedAt: new Date().toISOString(),
      author: "Shaykh Faraz",
      image: "/Images/About.jpg",
      content: "",
      lastModified: new Date().toISOString()
    },
    {
      slug: "significance-daily-quran-recitation",
      title: "The Spiritual Impact of Daily Quran Recitation & Reflection",
      excerpt: "A deep dive into the spiritual benefits of daily Quranic reading and reflection, drawing from authentic scholarly guidance and historical insights.",
      publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      author: "Mufti Irfan",
      image: "/Images/Books.jpeg",
      content: "",
      lastModified: new Date().toISOString()
    },
    {
      slug: "hadith-compilation-beginners-guide",
      title: "Understanding Hadith Compilation: A Complete Beginner's Guide",
      excerpt: "Learn how authentic traditions of the Prophet (PBUH) were compiled, categorized, and preserved by classical scholars over centuries.",
      publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      author: "Moulana Saad",
      image: "/Images/Sahih Al-Bukhari.jpg",
      content: "",
      lastModified: new Date().toISOString()
    },
    {
      slug: "how-to-choose-perfect-quran-stand-rehal",
      title: "How to Choose the Perfect Quran Stand (Rehal) for Daily Reading",
      excerpt: "A practical guide to selecting a Rehal stand based on ergonomic height, high-quality wood, craftsmanship, and daily usage patterns.",
      publishedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      author: "Naaz Editorial",
      image: "/Images/Rehals.jpeg",
      content: "",
      lastModified: new Date().toISOString()
    }
  ];

  // Merge so actual posts take precedence
  const displayPosts = [...actualPosts];
  for (const defPost of defaultPosts) {
    if (displayPosts.length >= 4) break;
    if (!displayPosts.some(p => p.slug === defPost.slug)) {
      displayPosts.push(defPost);
    }
  }

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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          {/* LEFT: Featured Post (3/5 Columns) */}
          <div className="lg:col-span-3 h-full">
            <Link 
              href={`/blog/${featuredPost.slug}`}
              className="group flex flex-col h-full bg-[#FCFAF7] border border-[#e9e3d9] rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-50 border-b border-[#e9e3d9]/40">
                <Image 
                  src={featuredPost.image || '/Images/Books.jpeg'} 
                  alt={featuredPost.title}
                  fill
                  sizes="(max-width: 1024px) 90vw, 600px"
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

          {/* RIGHT: Stack of 3 list posts (2/5 Columns) */}
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
        </div>
      </div>
    </section>
  );
}

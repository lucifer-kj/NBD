'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ChevronRight, Search, Tag, BookOpen, Sparkles, Clock } from 'lucide-react';
import { BlogPost } from '@/lib/blog';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';

interface BlogGridProps {
  posts: BlogPost[];
}

export function BlogGrid({ posts }: BlogGridProps) {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-20 text-center text-gray-500">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-100 rounded-full max-w-4xl mx-auto -mt-10"></div>
          <div className="h-64 bg-gray-100 rounded-3xl max-w-6xl mx-auto mt-12"></div>
        </div>
      </div>
    }>
      <BlogGridContent posts={posts} />
    </Suspense>
  );
}

function BlogGridContent({ posts }: BlogGridProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlTag = searchParams ? searchParams.get('tag') : null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Sync selectedTag with URL param if it changes
  useEffect(() => {
    if (urlTag) {
      setSelectedTag(urlTag.toLowerCase());
    } else {
      setSelectedTag(null);
    }
  }, [urlTag]);

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    if (tag) {
      router.push(`/blog?tag=${encodeURIComponent(tag.toLowerCase())}`, { scroll: false });
    } else {
      router.push('/blog', { scroll: false });
    }
  };

  // 1. Extract all unique tags across all posts
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    posts.forEach(post => {
      post.tags?.forEach(tag => tagsSet.add(tag.toLowerCase()));
    });
    return Array.from(tagsSet);
  }, [posts]);

  // 2. Filter posts based on search query and selected tag
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTag = 
        !selectedTag || 
        post.tags?.some(tag => tag.toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

  // 3. The latest post is treated as the "Featured Post" (only when no filters are active)
  const featuredPost = useMemo(() => {
    if (searchQuery || selectedTag || posts.length === 0) return null;
    return posts[0];
  }, [posts, searchQuery, selectedTag]);

  // 4. Remaining posts to show in the grid
  const gridPosts = useMemo(() => {
    if (featuredPost) {
      return filteredPosts.filter(post => post.slug !== featuredPost.slug);
    }
    return filteredPosts;
  }, [filteredPosts, featuredPost]);

  return (
    <div className="space-y-12">
      {/* Search & Dynamic Filter Controls */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6 max-w-4xl mx-auto -mt-10 relative z-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search articles on Quran, Hadith, history, and spirituality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--islamic-gold)] focus:bg-white transition-all text-gray-800"
          />
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Filter by Topic</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTagSelect(null)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedTag === null
                    ? 'bg-[var(--islamic-green)] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Topics
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedTag === tag
                      ? 'bg-[var(--islamic-gold)] text-[var(--islamic-green)] shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Tag size={12} />
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Featured Post Card (High-End Asymmetrical Magazine Layout) */}
      {featuredPost && (
        <section className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0 relative group">
            {/* Background Pattern overlay for premium touch */}
            <div className="islamic-pattern opacity-10 absolute inset-0 pointer-events-none" />
            
            {/* Featured Badge */}
            <div className="absolute top-6 left-6 z-10 bg-[var(--islamic-gold)] text-[var(--islamic-green)] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Sparkles size={12} />
              Featured Article
            </div>

            {/* Featured Image */}
            <div className="lg:col-span-7 relative h-72 md:h-[450px] overflow-hidden">
              <Image
                src={featuredPost.image || '/Images/Books.jpeg'}
                alt={featuredPost.title}
                fill
                priority
                className="object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
            </div>

            {/* Featured Content */}
            <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-center relative z-10">
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-[var(--islamic-gold)]" />
                  {new Date(featuredPost.publishedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <User size={14} className="text-[var(--islamic-gold)]" />
                  {featuredPost.author}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-headings font-bold text-[var(--islamic-green)] leading-tight mb-4 group-hover:text-[var(--islamic-gold)] transition-colors">
                <Link href={`/blog/${featuredPost.slug}`}>
                  {featuredPost.title}
                </Link>
              </h2>

              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 line-clamp-4">
                {featuredPost.excerpt || (featuredPost.content.length > 200 ? featuredPost.content.substring(0, 200) + '...' : featuredPost.content)}
              </p>

              <div className="mt-auto">
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-2 bg-[var(--islamic-green)] text-white hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green)] px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 group-hover:shadow-md"
                >
                  Read Featured Article
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid of Remaining Posts */}
      <section className="max-w-6xl mx-auto px-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-[var(--islamic-gold)] mb-4">
              <BookOpen size={24} />
            </div>
            <h3 className="text-xl font-headings font-bold text-[var(--islamic-green)] mb-2">No Articles Found</h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              We couldn&apos;t find any articles matching your search query or selected topic. Try clearing your filters or exploring another search query.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag(null);
              }}
              className="mt-6 inline-block bg-[var(--islamic-gold)] text-[var(--islamic-green)] px-6 py-2.5 rounded-full font-bold text-sm shadow-sm hover:bg-[var(--islamic-green)] hover:text-white transition-all"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gridPosts.map((post: BlogPost) => {
              const wordCount = post.content ? post.content.split(/\s+/).filter(Boolean).length : 0;
              const readingTime = Math.ceil(wordCount / 200) || 1;

              return (
                <article
                  key={post.slug}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:translate-y-[-4px] transition-all duration-300 border border-gray-100 flex flex-col group"
                >
                  {/* Featured Image */}
                  <Link href={`/blog/${post.slug}`} className="relative h-56 block overflow-hidden">
                    <Image
                      src={post.image || '/Images/Books.jpeg'}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    {post.tags && post.tags.length > 0 && (
                      <div className="absolute top-4 left-4 bg-[var(--islamic-gold)] text-[var(--islamic-green)] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        {post.tags[0]}
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-[var(--islamic-gold)]" />
                        {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={12} className="text-[var(--islamic-gold)]" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-[var(--islamic-gold)]" />
                        {readingTime} min read
                      </span>
                    </div>

                    <h3 className="text-lg font-headings font-bold text-[var(--islamic-green)] mb-3 line-clamp-2 hover:text-[var(--islamic-gold)] transition-colors leading-snug">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                      {post.excerpt || (post.content.length > 120 ? post.content.substring(0, 120) + '...' : post.content)}
                    </p>

                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex items-center gap-1 text-[var(--islamic-gold)] font-bold text-xs group/link hover:text-[var(--islamic-green)] transition-colors"
                      >
                        Read Article
                        <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

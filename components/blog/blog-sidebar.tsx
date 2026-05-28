import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TableOfContents, NewsletterBox } from '@/components/ui/blog-client';
import { BlogPost } from '@/lib/blog';

interface BlogSidebarProps {
  recentPosts: BlogPost[];
  headings: { id: string; text: string; level: number }[];
}

export function BlogSidebar({ recentPosts, headings }: BlogSidebarProps) {
  return (
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

        {/* Kolkata Heritage since 1967 E-E-A-T Seal */}
        <div className="bg-gradient-to-br from-amber-50/30 to-orange-50/15 border border-[var(--islamic-gold)]/40 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--islamic-gold)]/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--islamic-gold)]/10 flex items-center justify-center text-[var(--islamic-gold)] font-bold text-lg border border-[var(--islamic-gold)]/30">
              📜
            </div>
            <div>
              <h3 className="font-headings font-bold text-sm text-[var(--islamic-green)]">Kolkata Heritage since 1967</h3>
              <span className="text-[9px] uppercase font-bold text-gray-400 font-sans tracking-wider block">Verified Bookstore & Publisher</span>
            </div>
          </div>
          <p className="text-gray-600 text-xs leading-relaxed font-sans mb-3">
            Established by Mohammad Irfan in 1967 at Ismail Madani Lane, Kolkata, Naaz Book Depot has served scholars, madrasas, and families across India with verified, authentic Islamic literature for over 57 years.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-[var(--islamic-green)] font-bold font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--islamic-gold)]" />
            <span>Direct Sourcing</span>
            <span className="text-gray-300">•</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--islamic-gold)]" />
            <span>Unaltered Classical Prints</span>
          </div>
        </div>

        {/* Newsletter Box */}
        <NewsletterBox />

        {/* Table of Contents */}
        <TableOfContents headings={headings} />
      </div>
    </aside>
  );
}

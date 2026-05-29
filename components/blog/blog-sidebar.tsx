import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutGrid } from 'lucide-react';
import { NewsletterBox } from '@/components/ui/blog-client';
import { BlogPost } from '@/lib/blog';

interface BlogSidebarProps {
  recentPosts: BlogPost[];
}

export function BlogSidebar({ recentPosts }: BlogSidebarProps) {
  return (
    <aside className="hidden lg:block col-span-1 sticky bottom-10 self-end">
      <div className="flex flex-col gap-8">
        
        {/* Card 1: Heritage */}
        <div className="bg-[#FAF6EE] border border-[#C9972A]/30 p-6 rounded-sm relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-2 opacity-20">
            <LayoutGrid className="w-4 h-4 text-[#C9972A]" />
          </div>
          <div className="bg-[#C9972A] text-[#FAF6EE] text-[8px] font-black tracking-[0.2em] px-2.5 py-1 inline-block mb-4 uppercase rounded-sm">
            VERIFIED BOOKSTORE & PUBLISHER
          </div>
          <h4 className="font-headings text-lg font-black text-[#1B3A2D] mb-3">
            Kolkata Heritage since 1967
          </h4>
          <p className="font-sans text-sm text-[#1B3A2D]/70 leading-relaxed mb-6">
            Established by Mohammad Irfan in 1967 at Ismail Madani Lane, Kolkata, Naaz Book Depot has served scholars, madrasas, and families across India with verified, authentic spiritual literature for over 57 years.
          </p>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-[#C9972A] bg-white px-2.5 py-1 rounded-sm border border-[#C9972A]/10">
              <div className="w-1 h-1 bg-[#C9972A] rounded-full" />
              Direct Sourcing
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-[#C9972A] bg-white px-2.5 py-1 rounded-sm border border-[#C9972A]/10">
              <div className="w-1 h-1 bg-[#C9972A] rounded-full" />
              Unaltered Classical Prints
            </div>
          </div>
        </div>

        {/* Card 2: Newsletter Box */}
        <NewsletterBox />

        {/* Card 3: Recent Articles Widget */}
        {recentPosts.length > 0 && (
          <div className="bg-[#FAF6EE] border border-[#C9972A]/20 p-6 rounded-sm shadow-sm hover:border-[#C9972A]/40 transition-all duration-300">
            <h3 className="font-headings font-bold text-base text-[#1B3A2D] flex items-center gap-2 mb-4">
              <span>📚</span> Recent Articles
            </h3>
            <div className="space-y-4">
              {recentPosts.map((recent) => (
                <Link 
                  key={recent.slug} 
                  href={`/blog/${recent.slug}`} 
                  className="group flex gap-4 items-center hover:opacity-95 transition-opacity"
                >
                  <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-white border border-[#C9972A]/10">
                    <Image 
                      src={recent.image || '/Images/Books.jpeg'} 
                      alt={recent.title} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-sans text-gray-400 block mb-0.5">
                      {new Date(recent.publishedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <h4 className="font-headings font-bold text-xs text-[#1B3A2D] group-hover:text-[#C9972A] transition-colors line-clamp-2 leading-snug">
                      {recent.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}

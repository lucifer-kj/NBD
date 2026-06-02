'use client';

import React, { useState, useEffect } from 'react';
import { 
  Twitter, 
  Facebook, 
  MessageCircle, 
  Link2, 
  ChevronDown, 
  ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface BlogTocProps {
  headings: HeadingItem[];
  title: string;
}

interface TocSection {
  id: string;
  text: string;
  level: number;
  subItems: HeadingItem[];
}

export function BlogToc({ headings, title }: BlogTocProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Group headings hierarchically (Level 3 items are categorized under their nearest preceding Level 1/2 parent)
  const sections = React.useMemo(() => {
    const secs: TocSection[] = [];
    let currentSection: TocSection | null = null;

    headings.forEach((h) => {
      if (h.level === 1 || h.level === 2) {
        currentSection = {
          id: h.id,
          text: h.text,
          level: h.level,
          subItems: [],
        };
        secs.push(currentSection);
      } else if (h.level === 3) {
        if (currentSection) {
          currentSection.subItems.push(h);
        } else {
          secs.push({
            id: h.id,
            text: h.text,
            level: h.level,
            subItems: [],
          });
        }
      }
    });
    return secs;
  }, [headings]);

  useEffect(() => {
    if (headings.length === 0) return;

    // Observe each heading element on the page
    const observers: IntersectionObserver[] = [];
    
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setActiveId(heading.id);
            }
          },
          {
            threshold: 0.2,
            rootMargin: '-10% 0px -60% 0px', // Adjusted tracking boundaries for fast responsiveness
          }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [headings]);

  // Automatically expand sections when scrolling through their active headings
  useEffect(() => {
    const activeSec = sections.find(
      (sec) => sec.id === activeId || sec.subItems.some((sub) => sub.id === activeId)
    );
    if (activeSec) {
      setExpandedSections((prev) => ({
        ...prev,
        [activeSec.id]: true,
      }));
    }
  }, [activeId, sections]);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth',
      });
    }
  };

  const toggleSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    if (typeof window === 'undefined') return;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} | Naaz Book Depot`)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    if (typeof window === 'undefined') return;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    if (typeof window === 'undefined') return;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${window.location.href}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (headings.length === 0) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="border-l-4 border-[#C9972A] pl-4 mb-6 shrink-0">
        <h3 className="font-headings text-base font-black uppercase tracking-widest text-[#1B3A2D]">
          Table of Contents
        </h3>
      </div>

      {/* Expanded Categorized Dropdown Index List */}
      <div className="flex-1 pr-1">
        <ul className="flex flex-col gap-3">
          {sections.map((section) => {
            const isSecActive = activeId === section.id || section.subItems.some((sub) => sub.id === activeId);
            const isExpanded = expandedSections[section.id] ?? isSecActive;

            return (
              <li key={section.id} className="border-b border-[#C9972A]/10 pb-2">
                <div 
                  onClick={() => handleScrollTo(section.id)}
                  className={cn(
                    "flex items-start justify-between gap-2 text-left transition-all duration-300 hover:text-[#C9972A] cursor-pointer group py-1",
                    isSecActive ? "text-[#C9972A] font-bold" : "text-[#1B3A2D]/85"
                  )}
                >
                  <span className="font-serif text-sm leading-snug">
                    {section.text}
                  </span>
                  
                  {section.subItems.length > 0 && (
                    <button
                      onClick={(e) => toggleSection(section.id, e)}
                      className="p-0.5 rounded-sm hover:bg-[#C9972A]/10 text-[#C9972A] shrink-0 cursor-pointer transition-colors"
                      aria-label="Toggle section"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Indented Dropdown Subheadings (Level 3 items) */}
                {section.subItems.length > 0 && isExpanded && (
                  <ul className="pl-3 mt-2 border-l border-[#C9972A]/30 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    {section.subItems.map((sub) => {
                      const isSubActive = activeId === sub.id;
                      return (
                        <li key={sub.id}>
                          <button
                            onClick={() => handleScrollTo(sub.id)}
                            className={cn(
                              "text-left font-sans text-xs transition-all duration-300 hover:text-[#C9972A] cursor-pointer block w-full py-0.5 leading-tight",
                              isSubActive 
                                ? "text-[#C9972A] font-bold translate-x-1" 
                                : "text-[#1B3A2D]/60 hover:translate-x-0.5"
                            )}
                          >
                            {sub.text}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Share Section at the bottom of the TOC column */}
      <div className="mt-8 pt-6 border-t border-[#C9972A]/15 shrink-0 relative">
        <span className="block font-sans text-[9px] font-black text-[#1B3A2D]/40 tracking-widest mb-3 uppercase">
          SHARE THIS ARTICLE
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleShareTwitter}
            aria-label="Share on Twitter"
            className="w-9 h-9 rounded-sm bg-[#1B3A2D] flex items-center justify-center text-[#FAF6EE] hover:bg-[#C9972A] hover:text-[#1B3A2D] transition-colors cursor-pointer"
          >
            <Twitter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleShareFacebook}
            aria-label="Share on Facebook"
            className="w-9 h-9 rounded-sm bg-[#1B3A2D] flex items-center justify-center text-[#FAF6EE] hover:bg-[#C9972A] hover:text-[#1B3A2D] transition-colors cursor-pointer"
          >
            <Facebook className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleShareWhatsApp}
            aria-label="Share on WhatsApp"
            className="w-9 h-9 rounded-sm bg-[#1B3A2D] flex items-center justify-center text-[#FAF6EE] hover:bg-[#C9972A] hover:text-[#1B3A2D] transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopyLink}
            aria-label="Copy link"
            className="w-9 h-9 rounded-sm bg-[#1B3A2D] flex items-center justify-center text-[#FAF6EE] hover:bg-[#C9972A] hover:text-[#1B3A2D] transition-colors cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
        </div>
        {copied && (
          <span className="absolute -top-6 left-0 bg-[#1B3A2D] text-[#FAF6EE] text-[9px] font-bold px-2 py-0.5 rounded shadow animate-bounce">
            Link copied!
          </span>
        )}
      </div>
    </div>
  );
}

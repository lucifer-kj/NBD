"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { staggerContainerSlow, fadeInUp } from "@/lib/motion.config"
import { useScrollReveal } from "@/lib/useScrollReveal"
import { useReducedMotion } from "@/lib/useReducedMotion"

// SVG Line Art Icons matching the Islamic bookstore theme
const QuranIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c19a4e] category-svg">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <circle cx="12" cy="11" r="3" />
    <path d="M12 9v4M10 11h4" />
  </svg>
)

const LiteratureIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c19a4e] category-svg">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v15H6.5A2.5 2.5 0 0 0 4 19.5v-15" />
    <path d="M4 12.5A2.5 2.5 0 0 1 6.5 10H20" />
  </svg>
)

const StandIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c19a4e] category-svg">
    <path d="M3 17L21 7" />
    <path d="M21 17L13.5 12.8M10.5 11.2L3 7" />
    <path d="M6 6.5l6 3.5 6-3.5" />
    <path d="M5 17.5h14" opacity="0.4" />
  </svg>
)

const GiftIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c19a4e] category-svg">
    <rect x="3" y="8" width="18" height="13" rx="2" />
    <path d="M12 8v13M3 13h18M12 8C12 5 10 3 8 3S5 5 5 8h7z M12 8C12 5 14 3 16 3S19 5 19 8h-7z" />
  </svg>
)

const KidsIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c19a4e] category-svg">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M12 7v1.5M10.5 9h3" />
    <path d="M10 13 q 2 1.5, 4 0" />
    <circle cx="10" cy="11.5" r="0.75" fill="currentColor" />
    <circle cx="14" cy="11.5" r="0.75" fill="currentColor" />
  </svg>
)

const TasbihIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c19a4e] category-svg">
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <circle cx="12" cy="7" r="1.5" fill="currentColor" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
    <circle cx="17" cy="12" r="1.5" fill="currentColor" />
    <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    <circle cx="12" cy="17" r="1.5" fill="currentColor" />
    <circle cx="8" cy="16" r="1.5" fill="currentColor" />
    <circle cx="7" cy="12" r="1.5" fill="currentColor" />
    <path d="M12 17v4.5M10.5 21.5h3" />
    <path d="M12 21.5v1.5" />
  </svg>
)

const categories = [
  {
    name: "Holy Qur'an",
    href: "/books?category=quran",
    icon: QuranIcon,
    description: "Read and recite with authentic Tajweed editions, word-for-word translations, and high-quality prints.",
    isLarge: true,
    colSpan: "col-span-2 md:col-span-2",
  },
  {
    name: "Scholarly Literature",
    href: "/books",
    icon: LiteratureIcon,
    description: "Hadith collections, Fiqh manuals, and Islamic history.",
    isLarge: false,
    colSpan: "col-span-1 md:col-span-1",
  },
  {
    name: "Qur'an Stands",
    href: "/products?search=rehal",
    icon: StandIcon,
    description: "Handcrafted wooden rehals and stands.",
    isLarge: false,
    colSpan: "col-span-1 md:col-span-1",
  },
  {
    name: "Gift Sets",
    href: "/products?search=gift",
    icon: GiftIcon,
    description: "Premium curated gift packages.",
    isLarge: false,
    colSpan: "col-span-1 md:col-span-1",
  },
  {
    name: "Children's Books",
    href: "/books?search=kids",
    icon: KidsIcon,
    description: "Nurture young hearts with beautifully illustrated stories of the Prophets and educational books.",
    isLarge: true,
    colSpan: "col-span-1 md:col-span-2",
  },
  {
    name: "Accessories",
    href: "/products?search=accessory",
    icon: TasbihIcon,
    description: "Premium tasbihs, prayer mats, and Islamic lifestyle accessories.",
    isLarge: false,
    colSpan: "col-span-2 md:col-span-1",
  },
]

export default function BentoGrid() {
  const reduced = useReducedMotion()
  const [ref, inView] = useScrollReveal()

  return (
    <section className="py-16 md:py-24 bg-[#FCFAF7] border-y border-[#e9e3d9]/60 relative overflow-hidden">
      {/* Embedded CSS Style Block for high-end micro-interactions */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Premium corners animation */
        .corner-decor {
          position: absolute;
          width: 10px;
          height: 10px;
          border: 1.5px solid transparent;
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
          z-index: 20;
        }
        .corner-tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }
        .corner-tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }
        .corner-bl { bottom: 8px; left: 8px; border-right: none; border-top: none; }
        .corner-br { bottom: 8px; right: 8px; border-left: none; border-top: none; }

        .bento-card:hover .corner-decor {
          border-color: #c19a4e;
          opacity: 0.9;
        }
        .bento-card:hover .corner-tl { transform: translate(3px, 3px); }
        .bento-card:hover .corner-tr { transform: translate(-3px, 3px); }
        .bento-card:hover .corner-bl { transform: translate(3px, -3px); }
        .bento-card:hover .corner-br { transform: translate(-3px, -3px); }

        /* Sweep shimmer animation */
        .bento-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 35%, rgba(255, 255, 255, 0.45) 50%, transparent 65%);
          transform: translateX(-105%);
          transition: transform 0.75s ease-in-out;
          pointer-events: none;
          z-index: 10;
        }
        .bento-card:hover::after {
          transform: translateX(105%);
        }

        /* SVG Line Art Draw effect */
        .bento-card:hover svg.category-svg path,
        .bento-card:hover svg.category-svg rect,
        .bento-card:hover svg.category-svg circle {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawStroke 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes drawStroke {
          to {
            stroke-dashoffset: 0;
          }
        }

        /* Float container animation */
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .bento-card:hover .category-icon-container {
          animation: floatIcon 3s ease-in-out infinite;
          border-color: rgba(193, 154, 78, 0.4);
          background-color: #FFFDF9;
        }
      ` }} />

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={reduced ? undefined : staggerContainerSlow}
          className="text-center mb-12"
        >
          <motion.h2 
            variants={fadeInUp} 
            className="text-3xl md:text-4xl font-headings font-bold text-[var(--islamic-green)] tracking-wide mb-3"
          >
            Categories
          </motion.h2>
          <motion.div variants={fadeInUp} className="w-16 h-0.5 bg-[#c19a4e] mx-auto mb-4" />
        </motion.div>

        {/* Elegant asymmetric Bento Grid layout */}
        <motion.div 
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={reduced ? undefined : staggerContainerSlow}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`${category.colSpan} h-full`}
              >
                <Link 
                  href={category.href} 
                  className={`group bento-card relative flex ${
                    category.isLarge 
                      ? "flex-col sm:flex-row sm:items-center justify-between text-left p-5 md:p-7" 
                      : "flex-col items-center text-center p-5 md:p-6"
                  } bg-[#FAF7F0] border border-[#e9e3d9] rounded-2xl hover:shadow-[0_12px_36px_rgba(193,154,78,0.12)] hover:border-[#c19a4e]/40 transition-all duration-500 h-full overflow-hidden`}
                >
                  {/* Decorative Corner Borders */}
                  <div className="corner-decor corner-tl" />
                  <div className="corner-decor corner-tr" />
                  <div className="corner-decor corner-bl" />
                  <div className="corner-decor corner-br" />

                  {category.isLarge ? (
                    <>
                      <div className="space-y-2 max-w-full sm:max-w-[65%] md:max-w-[70%] z-10">
                        <h3 className="font-headings font-bold text-gray-800 text-sm md:text-lg group-hover:text-[#c19a4e] transition-colors leading-tight">
                          {category.name}
                        </h3>
                        <p className="hidden sm:block text-[11px] text-gray-500 font-light leading-relaxed">
                          {category.description}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[10px] md:text-xs text-[#c19a4e] font-semibold mt-1 group-hover:underline">
                          Explore Collection 
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform duration-300 ml-1">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </span>
                      </div>
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white border border-[#e9e3d9] flex items-center justify-center shadow-sm shrink-0 category-icon-container relative z-10 transition-all duration-300 self-end sm:self-auto mt-2 sm:mt-0">
                        <div className="scale-90 md:scale-105">
                          <Icon />
                        </div>
                        {/* Backdrop glow */}
                        <span className="absolute inset-0 rounded-2xl bg-[#c19a4e]/5 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md scale-75 group-hover:scale-125" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white border border-[#e9e3d9] flex items-center justify-center shadow-sm shrink-0 category-icon-container relative z-10 transition-all duration-300">
                        <div className="scale-85 md:scale-100">
                          <Icon />
                        </div>
                        {/* Backdrop glow */}
                        <span className="absolute inset-0 rounded-2xl bg-[#c19a4e]/5 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md scale-75 group-hover:scale-125" />
                      </div>
                      <div className="space-y-1.5 mt-3 md:mt-4 flex flex-col items-center z-10">
                        <h3 className="font-headings font-bold text-gray-800 text-xs md:text-sm group-hover:text-[#c19a4e] transition-colors leading-tight">
                          {category.name}
                        </h3>
                        <p className="hidden lg:block text-[10px] text-gray-400 font-light leading-normal max-w-[150px]">
                          {category.description}
                        </p>
                      </div>
                    </>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { staggerContainerSlow, fadeInUp } from "@/lib/motion.config"
import { useScrollReveal } from "@/lib/useScrollReveal"
import { useReducedMotion } from "@/lib/useReducedMotion"

// SVG Line Art Icons matching the Islamic bookstore theme
const QuranIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c19a4e]">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <circle cx="12" cy="11" r="3" />
    <path d="M12 9v4M10 11h4" />
  </svg>
)

const LiteratureIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c19a4e]">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v15H6.5A2.5 2.5 0 0 0 4 19.5v-15" />
    <path d="M4 12.5A2.5 2.5 0 0 1 6.5 10H20" />
  </svg>
)

const StandIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c19a4e]">
    <path d="M3 17L21 7" />
    <path d="M21 17L13.5 12.8M10.5 11.2L3 7" />
    <path d="M6 6.5l6 3.5 6-3.5" />
    <path d="M5 17.5h14" opacity="0.4" />
  </svg>
)

const GiftIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c19a4e]">
    <rect x="3" y="8" width="18" height="13" rx="2" />
    <path d="M12 8v13M3 13h18M12 8C12 5 10 3 8 3S5 5 5 8h7z M12 8C12 5 14 3 16 3S19 5 19 8h-7z" />
  </svg>
)

const KidsIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c19a4e]">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M12 7v1.5M10.5 9h3" />
    <path d="M10 13s.5 1 2 1 2-1" />
    <circle cx="10" cy="11.5" r="0.75" fill="currentColor" />
    <circle cx="14" cy="11.5" r="0.75" fill="currentColor" />
  </svg>
)

const TasbihIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c19a4e]">
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
  },
  {
    name: "Scholarly Literature",
    href: "/books",
    icon: LiteratureIcon,
  },
  {
    name: "Qur'an Stands",
    href: "/products?search=rehal",
    icon: StandIcon,
  },
  {
    name: "Gift Sets",
    href: "/products?search=gift",
    icon: GiftIcon,
  },
  {
    name: "Children's Books",
    href: "/books?search=kids",
    icon: KidsIcon,
  },
  {
    name: "Accessories",
    href: "/products?search=accessory",
    icon: TasbihIcon,
  },
]

export default function BentoGrid() {
  const reduced = useReducedMotion()
  const [ref, inView] = useScrollReveal()

  return (
    <section className="py-16 md:py-24 bg-[#FCFAF7] border-y border-[#e9e3d9]/60">
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

        {/* Elegant categories list matching the reference image layout */}
        <motion.div 
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={reduced ? undefined : staggerContainerSlow}
          className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-8"
        >
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="h-full"
              >
                <Link 
                  href={category.href} 
                  className="group flex flex-col items-center text-center p-3 md:p-6 bg-[#FAF7F0] border border-[#e9e3d9] rounded-2xl hover:shadow-[0_8px_24px_rgba(193,154,78,0.15)] hover:border-[#c19a4e]/50 transition-all duration-300 h-full"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white border border-[#e9e3d9] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm shrink-0">
                    <div className="scale-75 md:scale-100">
                      <Icon />
                    </div>
                  </div>
                  <h3 className="font-headings font-bold text-gray-800 text-[10px] sm:text-xs md:text-base mt-2 md:mt-5 group-hover:text-[#c19a4e] transition-colors leading-tight">
                    {category.name}
                  </h3>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

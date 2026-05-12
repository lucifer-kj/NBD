"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { fadeInUp, staggerContainerSlow } from "@/lib/motion.config"
import { useScrollReveal } from "@/lib/useScrollReveal"
import { useReducedMotion } from "@/lib/useReducedMotion"

export default function BentoGrid() {
  const reduced = useReducedMotion()
  const [ref, inView] = useScrollReveal()

  return (
    <section className="section-padding bg-[var(--islamic-beige)]">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={reduced ? undefined : staggerContainerSlow}
          className="text-center mb-12 md:mb-16"
        >
          <motion.h2 variants={fadeInUp} className="text-section-fluid font-headings font-bold text-[var(--islamic-green)] mb-3">
            Premium Collections
          </motion.h2>
          <motion.div variants={fadeInUp} className="gold-divider mx-auto mb-4" />
          <motion.p variants={fadeInUp} className="text-subtitle text-[var(--charcoal)]/70 max-w-xl mx-auto uppercase tracking-widest text-xs font-semibold">
            Curated Islamic Excellence
          </motion.p>
        </motion.div>

        {/* Gapless Bento Grid Architecture */}
        <motion.div 
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={reduced ? undefined : staggerContainerSlow}
          className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 auto-rows-[280px] md:auto-rows-[320px] gap-4 md:gap-6"
        >
          {/* Feature Item 1: Books (Large) */}
          <motion.div 
            variants={fadeInUp} 
            className="md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-2 relative group overflow-hidden rounded-3xl shadow-lg"
          >
            <Link href="/books" className="absolute inset-0 z-10" />
            <Image
              src="/Images/Books.jpeg"
              alt="Islamic Books Collection"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
              <h3 className="text-2xl md:text-4xl font-headings font-bold text-white mb-2">Islamic Literature</h3>
              <p className="text-white/80 text-sm md:text-base max-w-xs mb-4">Authentic Qur&apos;an and scholarly works in multiple languages.</p>
              <span className="text-[var(--islamic-gold)] flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                Explore Collection <ArrowRight size={16} />
              </span>
            </div>
          </motion.div>

          {/* Item 2: Perfumes (Vertical) */}
          <motion.div 
            variants={fadeInUp} 
            className="md:col-span-2 md:row-span-1 lg:col-span-3 lg:row-span-1 relative group overflow-hidden rounded-3xl shadow-lg"
          >
            <Link href="/atar" className="absolute inset-0 z-10" />
            <Image
              src="/Images/ittars.jpeg"
              alt="Premium Attar Fragrances"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
              <h3 className="text-xl md:text-2xl font-headings font-bold text-white mb-1">Premium Attar</h3>
              <span className="text-[var(--islamic-gold)] text-xs font-bold uppercase tracking-widest">Discover Fragrances</span>
            </div>
          </motion.div>

          {/* Item 3: Rehal (Small) */}
          <motion.div 
            variants={fadeInUp} 
            className="md:col-span-2 md:row-span-1 lg:col-span-3 lg:row-span-1 relative group overflow-hidden rounded-3xl shadow-lg"
          >
            <Link href="/categories/rehal" className="absolute inset-0 z-10" />
            <Image
              src="/Images/Rehals.jpeg"
              alt="Handcrafted Quran Stands"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
              <h3 className="text-xl md:text-2xl font-headings font-bold text-white mb-1">Qur&apos;an Stands</h3>
              <span className="text-[var(--islamic-gold)] text-xs font-bold uppercase tracking-widest">Shop Artisanal Rehals</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

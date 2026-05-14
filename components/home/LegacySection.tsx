"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { fadeInLeft, fadeInRight, staggerContainerSlow } from "@/lib/motion.config"
import { useScrollReveal } from "@/lib/useScrollReveal"
import { useReducedMotion } from "@/lib/useReducedMotion"

export default function LegacySection() {
  const reduced = useReducedMotion()
  const [ref, inView] = useScrollReveal()

  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={reduced ? undefined : staggerContainerSlow}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center max-w-6xl mx-auto"
        >
          {/* Left: Text Content */}
          <motion.div variants={fadeInLeft}>
            <h2 className="text-section-fluid font-headings font-bold text-[var(--islamic-green)] mb-3">
              A Legacy of Knowledge
              <br />
              <span className="text-[var(--islamic-gold)] italic font-light">Serving the Ummah Since 1967</span>
            </h2>
            <div className="gold-divider mb-8" />
            <p className="text-base md:text-xl text-[var(--charcoal)]/85 mb-6 leading-relaxed font-light">
              What began as a small bookshop on Ismail Madani Lane, Kolkata, has grown into one of India&apos;s most respected Islamic publishing and retail houses. For over 57 years, Naaz Book Depot has supplied authentic Qur&apos;an copies, Islamic books, and scholarly texts to masjids, madrasas, libraries, and individual Muslim households across India and abroad.
            </p>
            <p className="text-base md:text-lg text-[var(--charcoal)]/70 mb-10 leading-relaxed max-w-xl italic">
              &ldquo;Knowledge is the legacy we carry. Every book that leaves our shelf carries the light of the Qur&apos;an into a new home.&rdquo;
            </p>
            <Link
              href="/about"
              className="btn-primary inline-flex items-center gap-3 group touch-target shadow-xl"
            >
              Learn Our Story
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </motion.div>

          {/* Right: Image with Frame Overlay */}
          <motion.div variants={fadeInRight} className="relative flex justify-center">
            <div className="relative w-full max-w-md aspect-[3/4] md:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl group">
              <Image
                src="/Images/About.jpg"
                alt="Naaz Book Depot Founder"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <span className="text-white text-xl font-headings tracking-widest uppercase">Mohammad Irfan</span>
                <p className="text-white/60 text-xs mt-1">Founder & Visionary</p>
              </div>
            </div>
            {/* Decorative gold element */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-[var(--islamic-gold)]/40 rounded-br-3xl pointer-events-none" />
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-[var(--islamic-gold)]/40 rounded-tl-3xl pointer-events-none" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

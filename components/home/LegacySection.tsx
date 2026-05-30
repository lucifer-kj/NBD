"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck, Award, BookOpen, Compass } from "lucide-react"
import { fadeInLeft, fadeInRight, staggerContainerSlow } from "@/lib/motion.config"
import { useScrollReveal } from "@/lib/useScrollReveal"
import { useReducedMotion } from "@/lib/useReducedMotion"

export default function LegacySection() {
  const reduced = useReducedMotion()
  const [ref, inView] = useScrollReveal()

  return (
    <section className="section-padding bg-gradient-to-b from-white via-emerald-50/10 to-white relative overflow-hidden py-24 md:py-32">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={reduced ? undefined : staggerContainerSlow}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center max-w-6xl mx-auto"
        >
          {/* Left: Text Content & Editorial Pillars (7 cols) */}
          <motion.div variants={fadeInLeft} className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50/80 border border-amber-100/60 text-xs font-semibold text-[var(--islamic-gold)]">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--islamic-gold)]"></span>
              Kolkata Roots • Established 1967
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-headings font-bold text-[var(--islamic-green)] tracking-tight leading-tight">
              A Multi-Generational Legacy of
              <span className="block text-[var(--islamic-gold)] italic font-light mt-1">Sacred Literature & Publishing Trust</span>
            </h2>

            <div className="gold-divider w-24 h-1 bg-[var(--islamic-gold)] mb-6" />

            <div className="prose prose-emerald text-base md:text-lg text-[var(--charcoal)]/85 leading-relaxed font-sans space-y-4">
              <p>
                What began as a humble bookstore on Ismail Madani Lane, Kolkata, has blossomed into one of India’s most respected, multi-generational Islamic publishing legacy houses. For over <strong>59 years</strong>, Naaz Book Depot has served as an authoritative knowledge ecosystem for the global Ummah.
              </p>
              <p>
                Our core commitment has always been unwavering: supplying fully authentic, scholarly verified copies of the Holy Qur&apos;an, verified translations, exegeses, and classic literature. We bridge the rich heritage of classical Islamic research with contemporary printing excellence.
              </p>
            </div>

            {/* Editorial Trust Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-emerald-100/60">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[var(--islamic-green)] flex-shrink-0">
                  <Award size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-950 font-headings">Original Print Guarantee</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Direct, certified print acquisitions straight from licensed publishers.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[var(--islamic-gold)] flex-shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-950 font-headings">Scholarly Verification</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">We source editions with meticulous cross-referencing and exegesis.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[var(--islamic-green)] flex-shrink-0">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-950 font-headings">Kolkata Foundations</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Deep historic roots dating back to 1967, preserving classic Islamic publishing.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[var(--islamic-gold)] flex-shrink-0">
                  <Compass size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-950 font-headings">Global Distribution</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Supplying libraries, Masjids, Madrasas, and homes nationwide.</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/about"
                className="btn-primary inline-flex items-center gap-3 group touch-target shadow-xl shadow-[var(--islamic-green)]/10"
              >
                Explore Our Historic Journey
                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </div>
          </motion.div>

          {/* Right: Image with Frame Overlay (5 cols) */}
          <motion.div variants={fadeInRight} className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-sm md:max-w-md aspect-[3/4] md:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl group border-4 border-amber-50/50">
              <Image
                src="/Images/About.jpg"
                alt="Naaz Book Depot Legacy and Heritage"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center text-white">
                <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1">Established 1967</p>
                <span className="text-white text-lg font-headings font-bold block">Mohammad Irfan</span>
                <p className="text-white/80 text-xs mt-0.5 font-light">Founder & Visual Custodian</p>
              </div>
            </div>
            {/* Decorative gold element */}
            <div className="absolute -bottom-4 -right-4 w-28 h-28 border-b-4 border-r-4 border-[var(--islamic-gold)]/30 rounded-br-[2.5rem] pointer-events-none" />
            <div className="absolute -top-4 -left-4 w-28 h-28 border-t-4 border-l-4 border-[var(--islamic-gold)]/30 rounded-tl-[2.5rem] pointer-events-none" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

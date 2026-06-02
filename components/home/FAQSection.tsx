"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, HelpCircle } from "lucide-react"
import { fadeInUp, staggerContainer } from "@/lib/motion.config"
import { useScrollReveal } from "@/lib/useScrollReveal"
import { useReducedMotion } from "@/lib/useReducedMotion"

const faqs = [
  {
    question: "What types of Islamic books does Naaz Book Depot sell?",
    answer: "Naaz Book Depot stocks a wide range of Islamic books including Quran editions in Arabic, Urdu, English and Bengali, Hadith collections, Tafsir volumes, Fiqh books, Islamic history, children's Islamic books, and more. We also stock premium Attar and handcrafted Rehals (Quran stands)."
  },
  {
    question: "Does Naaz Book Depot deliver Islamic books across India?",
    answer: "Yes, Naaz Book Depot ships Islamic books and products across India. You can place an order online through our website or contact us via WhatsApp at +91 91634 31395."
  },
  {
    question: "How long has Naaz Book Depot been in business?",
    answer: "Naaz Book Depot was established in 1967 in Kolkata, West Bengal. We have been serving the Muslim community for over 57 years with authentic literature and premium quality items."
  },
  {
    question: "Are the Quran copies sold by Naaz Book Depot authentic?",
    answer: "Yes. All Quran editions sold by Naaz Book Depot are sourced from verified, authentic publishers. We have curated our collection over decades to ensure scholarly authenticity and high print quality."
  },
  {
    question: "Is the Attar sold by Naaz Book Depot alcohol-free?",
    answer: "Yes. All Attar (Itr) sold at Naaz Book Depot is 100% alcohol-free, natural, and suitable for use before prayer, following the Sunnah tradition."
  },
  {
    question: "Where is Naaz Book Depot located?",
    answer: "Naaz Book Depot is located at 1, Ismail Madani Lane, Kolkata, West Bengal, India. You can also reach us by phone at 033-2235-0051 or via our WhatsApp support for any queries."
  }
]

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const reduced = useReducedMotion()
  const [ref, inView] = useScrollReveal()
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="section-padding bg-[var(--islamic-beige)]/30 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd)
        }}
      />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={reduced ? undefined : staggerContainer}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--islamic-gold)]/10 border border-[var(--islamic-gold)]/20 text-[var(--islamic-gold)] text-[10px] font-bold tracking-widest uppercase mb-4">
            <HelpCircle size={12} />
            Common Questions
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-section-fluid font-headings font-bold text-[var(--islamic-green)] mb-3">
            Frequently Asked Questions
          </motion.h2>
          <motion.div variants={fadeInUp} className="gold-divider mx-auto mb-4" />
          <motion.p variants={fadeInUp} className="text-subtitle text-[var(--charcoal)]/70 max-w-xl mx-auto uppercase tracking-widest text-xs font-semibold">
            Everything you need to know about our products and services
          </motion.p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeInUp}
              className={`rounded-2xl border transition-all duration-300 ${
                activeIndex === index 
                  ? "bg-white border-[var(--islamic-gold)]/30 shadow-xl" 
                  : "bg-white/50 border-white/40 hover:bg-white hover:border-[var(--islamic-gold)]/20"
              }`}
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
              >
                <span className={`font-headings font-bold text-base md:text-lg transition-colors duration-300 ${
                  activeIndex === index ? "text-[var(--islamic-green)]" : "text-[var(--charcoal)]"
                }`}>
                  {faq.question}
                </span>
                <ChevronDown 
                  size={20} 
                  className={`text-[var(--islamic-gold)] transition-transform duration-500 ${
                    activeIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-[var(--charcoal)]/75 leading-relaxed text-sm md:text-base font-light">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--islamic-gold)]/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-[var(--islamic-green)]/5 blur-[120px] pointer-events-none rounded-full" />
    </section>
  )
}

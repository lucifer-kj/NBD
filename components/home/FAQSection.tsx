"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Plus, HelpCircle } from "lucide-react"
import { fadeInUp, staggerContainer } from "@/lib/motion.config"
import { useScrollReveal } from "@/lib/useScrollReveal"
import { useReducedMotion } from "@/lib/useReducedMotion"

const faqs = [
  {
    question: "What types of Islamic books does Naaz Book Depot sell?",
    answer: "Naaz Book Depot stocks a wide range of Islamic books including Quran editions in Arabic, Urdu, English and Bengali, Hadith collections, Tafsir volumes, Fiqh books, Islamic history, children's Islamic books, and more. We also stock handcrafted Rehals (Quran stands)."
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
    answer: "Yes. All Quran copies sold by Naaz Book Depot are sourced from verified, authentic publishers. We have curated our collection over decades to ensure scholarly authenticity and high print quality."
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

  // Balance FAQs into 2 columns
  const col1Faqs = faqs.filter((_, i) => i % 2 === 0);
  const col2Faqs = faqs.filter((_, i) => i % 2 !== 0);

  return (
    <section className="py-16 md:py-24 bg-[#FCFAF7] border-y border-[#e9e3d9]/60 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd)
        }}
      />
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={reduced ? undefined : staggerContainer}
          className="text-center mb-12"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--islamic-gold)]/10 border border-[var(--islamic-gold)]/20 text-[var(--islamic-gold)] text-[10px] font-bold tracking-widest uppercase mb-3">
            <HelpCircle size={12} />
            Common Questions
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-headings font-bold text-[var(--islamic-green)] tracking-wide mb-3">
            Frequently Asked Questions
          </motion.h2>
          <motion.div variants={fadeInUp} className="w-16 h-0.5 bg-[#c19a4e] mx-auto" />
        </motion.div>

        {/* 2-Column FAQ Layout matching the reference image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Column 1 */}
          <div className="space-y-4">
            {col1Faqs.map((faq) => {
              // Find the original index of the FAQ
              const originalIndex = faqs.findIndex(f => f.question === faq.question);
              const isOpen = activeIndex === originalIndex;

              return (
                <motion.div
                  key={originalIndex}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-45px" }}
                  variants={fadeInUp}
                  className={`rounded-2xl border transition-all duration-300 ${
                    isOpen 
                      ? "bg-white border-[#c19a4e]/40 shadow-md" 
                      : "bg-[#FAF7F0] border-[#e9e3d9] hover:bg-white hover:border-[#c19a4e]/20"
                  }`}
                >
                  <button
                    onClick={() => setActiveIndex(isOpen ? null : originalIndex)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 outline-none"
                  >
                    <span className={`font-headings font-bold text-base transition-colors duration-300 ${
                      isOpen ? "text-[var(--islamic-green)]" : "text-gray-800"
                    }`}>
                      {faq.question}
                    </span>
                    <div 
                      className={`w-7 h-7 rounded-full border border-[#e9e3d9] flex items-center justify-center text-[#c19a4e] shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-45 bg-[#c19a4e]/10 border-[#c19a4e]/30" : ""
                      }`}
                    >
                      <Plus size={14} />
                    </div>
                  </button>
                  
                  <div className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}>
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 text-gray-600 leading-relaxed text-sm md:text-[15px] font-sans border-t border-gray-50 pt-4">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            {col2Faqs.map((faq) => {
              const originalIndex = faqs.findIndex(f => f.question === faq.question);
              const isOpen = activeIndex === originalIndex;

              return (
                <motion.div
                  key={originalIndex}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-45px" }}
                  variants={fadeInUp}
                  className={`rounded-2xl border transition-all duration-300 ${
                    isOpen 
                      ? "bg-white border-[#c19a4e]/40 shadow-md" 
                      : "bg-[#FAF7F0] border-[#e9e3d9] hover:bg-white hover:border-[#c19a4e]/20"
                  }`}
                >
                  <button
                    onClick={() => setActiveIndex(isOpen ? null : originalIndex)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 outline-none"
                  >
                    <span className={`font-headings font-bold text-base transition-colors duration-300 ${
                      isOpen ? "text-[var(--islamic-green)]" : "text-gray-800"
                    }`}>
                      {faq.question}
                    </span>
                    <div 
                      className={`w-7 h-7 rounded-full border border-[#e9e3d9] flex items-center justify-center text-[#c19a4e] shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-45 bg-[#c19a4e]/10 border-[#c19a4e]/30" : ""
                      }`}
                    >
                      <Plus size={14} />
                    </div>
                  </button>
                  
                  <div className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}>
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 text-gray-600 leading-relaxed text-sm md:text-[15px] font-sans border-t border-gray-50 pt-4">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

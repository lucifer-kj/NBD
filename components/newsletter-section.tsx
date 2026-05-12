"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion.config";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Send } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    // Simulate async subscription
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setEmail("");
    }, 1200);
  };

  const reduced = useReducedMotion();
  const [ref, inView] = useScrollReveal();

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={reduced ? undefined : staggerContainer}
      className="section-padding bg-[var(--islamic-green)] relative overflow-hidden"
    >
      {/* Subtle geometric pattern accent */}
      <span className="islamic-pattern absolute inset-0 opacity-15 pointer-events-none z-0" aria-hidden="true" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            variants={fadeInUp}
            className="text-section-fluid font-headings font-bold text-white mb-2"
          >
            Stay Updated,{" "}
            <span className="text-[var(--islamic-gold)] italic font-light">
              Stay Enlightened
            </span>
          </motion.h2>
          <motion.div variants={fadeInUp} className="gold-divider mx-auto mb-4" />
          <motion.p
            variants={fadeInUp}
            className="text-white/75 mb-8 text-subtitle max-w-md mx-auto"
          >
            Be the first to know about new books, offers, and knowledge updates.
          </motion.p>

          <motion.div variants={fadeInUp}>
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[var(--islamic-gold)] font-semibold py-4 text-lg"
                role="status"
                aria-live="polite"
              >
                ✓ Thank you for subscribing!
              </motion.div>
            ) : (
              <form
                className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
                onSubmit={handleSubmit}
                aria-label="Newsletter signup form"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`rounded-xl px-5 py-3.5 text-[var(--islamic-green)] bg-white/95 border-2 focus:outline-none focus:ring-2 focus:ring-[var(--islamic-gold)] flex-1 transition-all duration-200 text-sm touch-target ${
                    error ? "border-red-400" : "border-transparent"
                  }`}
                  aria-invalid={!!error}
                  aria-describedby={error ? "newsletter-error" : undefined}
                  autoComplete="email"
                  required
                />
                <motion.button
                  type="submit"
                  className="btn-primary touch-target inline-flex items-center justify-center gap-2 px-6 py-3.5 min-w-[140px]"
                  whileTap={{ scale: 0.97 }}
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <motion.span
                      className="inline-block w-5 h-5 border-2 border-[var(--islamic-green)] border-t-transparent rounded-full animate-spin"
                      aria-label="Loading"
                    />
                  ) : (
                    <Send size={16} />
                  )}
                  {loading ? "Subscribing..." : "Subscribe"}
                </motion.button>
              </form>
            )}
            {error && !success && (
              <motion.div
                id="newsletter-error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-300 font-medium mt-3 text-sm"
                role="alert"
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
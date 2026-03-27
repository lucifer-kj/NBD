"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion.config";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useReducedMotion } from "@/lib/useReducedMotion";

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
      variants={reduced ? undefined : fadeInUp}
      className="w-full rounded-2xl bg-[var(--islamic-beige)] text-[var(--islamic-green)] shadow-lg p-6 sm:p-8 mb-12 mt-0 max-w-3xl lg:max-w-5xl mx-auto flex flex-col items-center border-2 border-[var(--islamic-gold)] relative overflow-hidden"
    >
      {/* Subtle geometric pattern accent */}
      <span className="islamic-pattern absolute inset-0 opacity-30 pointer-events-none z-0" aria-hidden="true" />
      <div className="flex-1 w-full min-w-0 z-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[var(--islamic-green)]">Stay Updated,<span className="font-light text-[var(--islamic-gold)] italic"> Stay Enlightened</span></h2>
        <p className="text-[var(--islamic-green)]/80 mb-4 max-w-md lg:max-w-xl">Be the first to know about new books, offers, and knowledge updates.</p>
        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-600 font-semibold py-2"
            role="status"
            aria-live="polite"
          >
            Thank you for subscribing!
          </motion.div>
        ) : (
          <form className="flex flex-col sm:flex-row gap-3 max-w-md lg:max-w-xl" onSubmit={handleSubmit} aria-label="Newsletter signup form">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your Email"
              className={`rounded-full px-5 py-2 text-[var(--islamic-green)] bg-white border-2 focus:outline-none focus:ring-2 focus:ring-[var(--islamic-gold)] flex-1 transition-all duration-200 ${error ? 'border-red-500' : 'border-[var(--islamic-gold)]'}`}
              aria-invalid={!!error}
              aria-describedby={error ? 'newsletter-error' : undefined}
              autoComplete="email"
              required
            />
            <motion.button
              type="submit"
              className="bg-[var(--islamic-gold)] text-[var(--islamic-green)] rounded-full px-6 py-2 font-semibold shadow hover:bg-[var(--islamic-gold-dark)] focus:bg-[var(--islamic-gold-dark)] transition-all flex items-center justify-center min-w-[120px]"
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <motion.span
                  className="inline-block w-5 h-5 border-2 border-[var(--islamic-green)] border-t-transparent rounded-full animate-spin mr-2"
                  aria-label="Loading"
                />
              ) : null}
              {loading ? "Subscribing..." : "Subscribe"}
            </motion.button>
          </form>
        )}
        {error && !success && (
          <motion.div
            id="newsletter-error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 font-medium mt-2"
            role="alert"
          >
            {error}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
} 
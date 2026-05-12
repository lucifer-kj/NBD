import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[var(--islamic-gold)] text-[var(--islamic-green-dark)] pt-16 pb-8 relative overflow-hidden">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          {/* Brand & About */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-headings font-bold mb-4 text-[var(--islamic-green-dark)] tracking-wide">
              Naaz Book Depot
            </h3>
            <p className="text-[var(--islamic-green-dark)]/80 leading-relaxed mb-6 max-w-sm text-sm font-medium">
              Publishing the Light of Knowledge since 1967. Specialized in authentic Islamic literature, Qur&apos;an, and premium fragrances serving the global Muslim community.
            </p>
            {/* Social / WhatsApp quick link */}
            <a
              href="https://wa.me/919163431395"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[var(--islamic-green-dark)] hover:text-white transition-colors duration-300 font-semibold"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.128.555 4.195 1.611 6.012L.152 23.473l5.568-1.462a11.97 11.97 0 0 0 6.311 1.782h.005c6.645 0 12.031-5.385 12.031-12.031S18.676 0 12.031 0zm0 21.789h-.004a9.98 9.98 0 0 1-5.083-1.385l-.364-.216-3.784.992.993-3.689-.236-.376A9.957 9.957 0 0 1 2.038 12.03c0-5.514 4.485-10 10-10 5.513 0 10 4.486 10 10s-4.487 10-10 10zm5.485-7.487c-.301-.151-1.78-.88-2.056-.98-.275-.1-.476-.151-.676.151-.201.301-.776.98-.951 1.18-.176.2-.352.226-.653.075-2.046-1.025-3.32-2.185-4.225-3.69-.151-.252.072-.257.369-.854.075-.151.038-.276-.038-.426-.075-.151-.676-1.626-.926-2.226-.24-.582-.486-.503-.676-.513-.175-.008-.376-.008-.576-.008a1.096 1.096 0 0 0-.796.376c-.275.301-1.051 1.026-1.051 2.502s1.076 2.895 1.226 3.096c.151.2 2.115 3.226 5.127 4.526 2.053.886 2.87.822 3.966.69 1.25-.15 2.868-1.171 3.268-2.302.401-1.131.401-2.102.276-2.302-.126-.2-.476-.301-.776-.451z"/>
              </svg>
              Chat with us on WhatsApp
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-[var(--islamic-green-dark)]">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-[var(--islamic-green-dark)]/80 hover:text-white transition-colors duration-300 text-sm font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/books" className="text-[var(--islamic-green-dark)]/80 hover:text-white transition-colors duration-300 text-sm font-medium">
                  Islamic Books
                </Link>
              </li>
              <li>
                <Link href="/atar" className="text-[var(--islamic-green-dark)]/80 hover:text-white transition-colors duration-300 text-sm font-medium">
                  Premium Atar
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[var(--islamic-green-dark)]/80 hover:text-white transition-colors duration-300 text-sm font-medium">
                  Our Legacy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[var(--islamic-green-dark)]/80 hover:text-white transition-colors duration-300 text-sm font-medium">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-[var(--islamic-green-dark)]">Contact Us</h4>
            <ul className="space-y-3 text-[var(--islamic-green-dark)]/80 text-sm font-medium">
              <li className="flex items-start gap-2">
                <span className="text-white mt-0.5">📞</span>
                <span>033 22350051 / 033 22350960</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white mt-0.5">📱</span>
                <span>+91 91634 31395</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white mt-0.5">✉️</span>
                <a href="mailto:naazgroupofficial@gmail.com" className="hover:text-white transition-colors">
                  naazgroupofficial@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white mt-0.5">📍</span>
                <span>Kolkata, West Bengal, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-[var(--islamic-green-dark)]/20 text-[var(--islamic-green-dark)]/70 text-xs tracking-wide font-medium">
          <p>© {new Date().getFullYear()} Naaz Book Depot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[var(--islamic-green-dark)] text-white/90 pt-16 pb-8 relative overflow-hidden">
      {/* Gold gradient accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(to right, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%)' }} />

      <div className="container mx-auto px-4 md:px-6">
        {/* Desktop/Tablet Grid Footer */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand & About */}
          <div className="col-span-2 lg:col-span-1">
            <h3
              className="text-2xl font-headings font-bold mb-4 tracking-wide"
              style={{ background: 'linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Naaz Book Depot
            </h3>
            <p className="text-white/70 leading-relaxed mb-6 max-w-sm text-sm font-medium">
              Naaz Book Depot — Publishing the Light of Knowledge since 1967. India&apos;s trusted source for authentic Islamic books and Quran editions. Based in Kolkata, serving Muslims worldwide.
            </p>
            {/* Social / WhatsApp quick link */}
            <a
              href="https://wa.me/919163431395"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[var(--islamic-gold)] hover:text-white transition-colors duration-300 font-semibold group"
            >
              <MessageCircle size={18} className="group-hover:scale-110 transition-transform duration-300" />
              Chat with us on WhatsApp
            </a>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 border-t border-white/10 pt-6 lg:border-t-0 lg:pt-0">
            <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-[var(--islamic-gold)]">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-white/70 hover:text-[var(--islamic-gold)] transition-colors duration-300 text-sm font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/books" className="text-white/70 hover:text-[var(--islamic-gold)] transition-colors duration-300 text-sm font-medium">
                  Islamic Books
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/70 hover:text-[var(--islamic-gold)] transition-colors duration-300 text-sm font-medium">
                  Our Legacy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-[var(--islamic-gold)] transition-colors duration-300 text-sm font-medium">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Policies */}
          <div className="col-span-1 border-t border-white/10 pt-6 lg:border-t-0 lg:pt-0">
            <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-[var(--islamic-gold)]">Store Policies</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/policies/privacy-policy" className="text-white/70 hover:text-[var(--islamic-gold)] transition-colors duration-300 text-sm font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms-of-service" className="text-white/70 hover:text-[var(--islamic-gold)] transition-colors duration-300 text-sm font-medium">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/policies/refund-policy" className="text-white/70 hover:text-[var(--islamic-gold)] transition-colors duration-300 text-sm font-medium">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping-policy" className="text-white/70 hover:text-[var(--islamic-gold)] transition-colors duration-300 text-sm font-medium">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 lg:col-span-1 border-t border-white/10 pt-6 lg:border-t-0 lg:pt-0">
            <h4 className="text-sm font-bold uppercase tracking-wider mb-5 text-[var(--islamic-gold)]">Contact Us</h4>
            <ul className="space-y-3 text-white/70 text-sm font-medium">
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-[var(--islamic-gold)] shrink-0 mt-0.5" />
                <span>033 22350051 / 033 22350960</span>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle size={16} className="text-[var(--islamic-gold)] shrink-0 mt-0.5" />
                <span>+91 91634 31395</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-[var(--islamic-gold)] shrink-0 mt-0.5" />
                <a href="mailto:naazgroupofficial@gmail.com" className="hover:text-[var(--islamic-gold)] transition-colors">
                  naazgroupofficial@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[var(--islamic-gold)] shrink-0 mt-0.5" />
                <span>Kolkata, West Bengal, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile Compact Footer */}
        <div className="md:hidden flex flex-col items-center text-center space-y-5 mb-8">
          <div>
            <h3
              className="text-xl font-headings font-bold mb-2 tracking-wide"
              style={{ background: 'linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Naaz Book Depot
            </h3>
            <a
              href="https://wa.me/919163431395"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--islamic-gold)] hover:text-white transition-colors duration-300 font-semibold group"
            >
              <MessageCircle size={14} className="group-hover:scale-110 transition-transform duration-300" />
              Chat on WhatsApp: +91 91634 31395
            </a>
          </div>

          {/* Compact Links */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2.5 text-[11px] text-white/60">
            <Link href="/" className="hover:text-[var(--islamic-gold)] transition-colors">Home</Link>
            <Link href="/books" className="hover:text-[var(--islamic-gold)] transition-colors">Books</Link>
            <Link href="/about" className="hover:text-[var(--islamic-gold)] transition-colors">Legacy</Link>
            <Link href="/contact" className="hover:text-[var(--islamic-gold)] transition-colors">FAQs</Link>
            <Link href="/policies/privacy-policy" className="hover:text-[var(--islamic-gold)] transition-colors">Privacy</Link>
            <Link href="/policies/terms-of-service" className="hover:text-[var(--islamic-gold)] transition-colors">Terms</Link>
          </div>

          {/* Quick Contact Info */}
          <div className="text-[10px] text-white/50 space-y-1">
            <p>Support: 033 22350051 | naazgroupofficial@gmail.com</p>
            <p>Kolkata, West Bengal, India</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-white/10 text-white/50 text-xs tracking-wide font-medium">
          <p>© {new Date().getFullYear()} Naaz Book Depot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
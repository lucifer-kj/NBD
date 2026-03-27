import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[var(--islamic-green)] text-white pt-16 pb-8 border-t-[var(--islamic-gold)] border-t-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand & About */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-headings font-bold mb-4 text-[var(--islamic-gold)]">Naaz Book Depot</h3>
            <p className="text-white/80 leading-relaxed mb-6 max-w-sm font-light">
              Publishing the Light of Knowledge since 1967. Specialized in authentic Islamic literature, Qur'an, and premium fragrances serving the global Muslim community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-white/80 hover:text-[var(--islamic-gold)] transition-colors">Home</Link></li>
              <li><Link href="/books" className="text-white/80 hover:text-[var(--islamic-gold)] transition-colors">Islamic Books</Link></li>
              <li><Link href="/atar" className="text-white/80 hover:text-[var(--islamic-gold)] transition-colors">Premium Atar</Link></li>
              <li><Link href="/about" className="text-white/80 hover:text-[var(--islamic-gold)] transition-colors">Our Legacy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">Contact Us</h4>
            <ul className="space-y-3 text-white/80">
              <li>123 Knowledge Avenue</li>
              <li>Islamic Heritage District</li>
              <li>contact@naazbookdepot.com</li>
              <li>+91 98765 43210</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-white/10 text-white/60 text-sm">
          <p>© {new Date().getFullYear()} Naaz Book Depot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
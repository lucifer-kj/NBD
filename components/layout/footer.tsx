import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle, Facebook, Instagram } from 'lucide-react';

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
              href="https://wa.me/919051085118"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp (opens in a new tab)"
              className="inline-flex items-center gap-2 text-sm text-[var(--islamic-gold)] hover:text-white transition-colors duration-300 font-semibold group"
            >
              <MessageCircle size={18} className="group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
              Chat with us on WhatsApp
            </a>
            {/* Social Media Links */}
            <div className="flex flex-wrap items-center gap-2 mt-5">
              <a
                href="https://www.facebook.com/people/Naaz-Book-Depot-Kolkata/61590875242073/"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on Facebook (opens in a new tab)"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] hover:-translate-y-0.5 transition-all duration-300 text-white/80"
              >
                <Facebook size={16} aria-hidden="true" />
              </a>
              <a
                href="https://www.instagram.com/naazbookkolkata/"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on Instagram (opens in a new tab)"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] hover:-translate-y-0.5 transition-all duration-300 text-white/80"
              >
                <Instagram size={16} aria-hidden="true" />
              </a>
              <a
                href="https://www.threads.net/@naazbookkolkata"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on Threads (opens in a new tab)"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] hover:-translate-y-0.5 transition-all duration-300 text-white/80"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 192 192" aria-hidden="true">
                  <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
                </svg>
              </a>
              <a
                href="https://x.com/nbd_kolkata"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on X (opens in a new tab)"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] hover:-translate-y-0.5 transition-all duration-300 text-white/80"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://medium.com/@nbddigi"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on Medium (opens in a new tab)"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] hover:-translate-y-0.5 transition-all duration-300 text-white/80"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                </svg>
              </a>
              <a
                href="https://in.pinterest.com/nbddigi/"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on Pinterest (opens in a new tab)"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] hover:-translate-y-0.5 transition-all duration-300 text-white/80"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.4 7.62 11.18-.1-.95-.18-2.4.04-3.43.2-.87 1.29-5.46 1.29-5.46s-.33-.66-.33-1.63c0-1.53.88-2.67 2-2.67.94 0 1.4.7 1.4 1.55 0 .94-.6 2.35-.91 3.66-.26 1.09.55 1.98 1.62 1.98 1.95 0 3.44-2.05 3.44-5 0-2.62-1.88-4.45-4.57-4.45-3.11 0-4.94 2.33-4.94 4.75 0 .94.36 1.95.81 2.5.09.11.1.2.07.3-.08.33-.26 1.06-.3 1.2-.05.2-.18.25-.41.14-1.52-.7-2.47-2.92-2.47-4.7 0-3.83 2.78-7.34 8.01-7.34 4.21 0 7.48 3 7.48 7 0 4.18-2.63 7.55-6.28 7.55-1.23 0-2.38-.64-2.77-1.4l-.76 2.9c-.27 1.05-1.01 2.36-1.51 3.17C8.78 23.77 10.33 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
                </svg>
              </a>
            </div>
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
                <Phone size={16} className="text-[var(--islamic-gold)] shrink-0 mt-0.5" aria-hidden="true" />
                <span>033 22350051 / 033 22350960</span>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle size={16} className="text-[var(--islamic-gold)] shrink-0 mt-0.5" aria-hidden="true" />
                <span>+91 90510 85118</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-[var(--islamic-gold)] shrink-0 mt-0.5" aria-hidden="true" />
                <a href="mailto:naazgroupofficial@gmail.com" className="hover:text-[var(--islamic-gold)] transition-colors">
                  naazgroupofficial@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[var(--islamic-gold)] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Kolkata, West Bengal, India</span>
              </li>
            </ul>
            {/* Payment Indicators */}
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
              href="https://wa.me/919051085118"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp (opens in a new tab)"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--islamic-gold)] hover:text-white transition-colors duration-300 font-semibold group"
            >
              <MessageCircle size={14} className="group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
              Chat on WhatsApp: +91 90510 85118
            </a>
            {/* Social Media Links (Mobile) */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <a
                href="https://www.facebook.com/people/Naaz-Book-Depot-Kolkata/61590875242073/"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on Facebook"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] transition-all duration-300 text-white/80"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://www.instagram.com/naazbookkolkata/"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on Instagram"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] transition-all duration-300 text-white/80"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://www.threads.net/@naazbookkolkata"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on Threads"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] transition-all duration-300 text-white/80"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 192 192">
                  <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
                </svg>
              </a>
              <a
                href="https://x.com/nbd_kolkata"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on X"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] transition-all duration-300 text-white/80"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://medium.com/@nbddigi"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on Medium"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] transition-all duration-300 text-white/80"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                </svg>
              </a>
              <a
                href="https://in.pinterest.com/nbddigi/"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on Pinterest"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] transition-all duration-300 text-white/80"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.4 7.62 11.18-.1-.95-.18-2.4.04-3.43.2-.87 1.29-5.46 1.29-5.46s-.33-.66-.33-1.63c0-1.53.88-2.67 2-2.67.94 0 1.4.7 1.4 1.55 0 .94-.6 2.35-.91 3.66-.26 1.09.55 1.98 1.62 1.98 1.95 0 3.44-2.05 3.44-5 0-2.62-1.88-4.45-4.57-4.45-3.11 0-4.94 2.33-4.94 4.75 0 .94.36 1.95.81 2.5.09.11.1.2.07.3-.08.33-.26 1.06-.3 1.2-.05.2-.18.25-.41.14-1.52-.7-2.47-2.92-2.47-4.7 0-3.83 2.78-7.34 8.01-7.34 4.21 0 7.48 3 7.48 7 0 4.18-2.63 7.55-6.28 7.55-1.23 0-2.38-.64-2.77-1.4l-.76 2.9c-.27 1.05-1.01 2.36-1.51 3.17C8.78 23.77 10.33 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Compact Links */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2.5 text-[11px] text-white/60">
            <Link href="/" className="hover:text-[var(--islamic-gold)] transition-colors">Home</Link>
            <Link href="/books" className="hover:text-[var(--islamic-gold)] transition-colors">Books</Link>
            <Link href="/about" className="hover:text-[var(--islamic-gold)] transition-colors">Legacy</Link>
            <Link href="/contact" className="hover:text-[var(--islamic-gold)] transition-colors">FAQs</Link>
            <Link href="/policies/privacy-policy" className="hover:text-[var(--islamic-gold)] transition-colors">Privacy</Link>
            <Link href="/policies/terms-of-service" className="hover:text-[var(--islamic-gold)] transition-colors">Terms</Link>
            <Link href="/policies/refund-policy" className="hover:text-[var(--islamic-gold)] transition-colors">Refunds</Link>
            <Link href="/policies/shipping-policy" className="hover:text-[var(--islamic-gold)] transition-colors">Shipping</Link>
          </div>

          {/* Quick Contact Info */}
          <div className="text-[10px] text-white/50 space-y-1">
            <p>Support: 033 22350051 | naazgroupofficial@gmail.com</p>
            <p>Kolkata, West Bengal, India</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-white/10 text-white/50 text-xs tracking-wide font-medium flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="order-2 md:order-1">© {new Date().getFullYear()} Naaz Book Depot. All rights reserved.</p>
          
          {/* Trust and Payment Badges */}
          <div className="order-1 md:order-2 flex flex-col items-center md:items-end gap-2.5">
            <div className="flex items-center gap-2 text-white">
              {/* Visa Logo */}
              <div className="bg-white px-1.5 py-0.5 rounded shadow-sm flex items-center justify-center h-6 w-9" title="Visa">
                <svg fill="#1434CB" role="img" viewBox="0 0 24 24" className="w-full h-full object-contain" aria-label="Visa">
                  <path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"/>
                </svg>
              </div>
              {/* Mastercard Logo */}
              <div className="bg-white px-1.5 py-0.5 rounded shadow-sm flex items-center justify-center h-6 w-9" title="Mastercard">
                <svg viewBox="0 0 116.5 72" className="w-full h-full object-contain" aria-label="Mastercard">
                  <rect x="42.5" y="7.7" fill="#FF5F00" width="31.5" height="56.6"/>
                  <path fill="#EB001B" d="M44.5,36c0-11,5.1-21.5,13.7-28.3C42.6-4.6,20-1.9,7.7,13.8C-4.6,29.4-1.9,52,13.8,64.3 c13.1,10.3,31.4,10.3,44.5,0C49.6,57.5,44.5,47,44.5,36z"/>
                  <path fill="#F79E1B" d="M116.5,36c0,19.9-16.1,36-36,36c-8.1,0-15.9-2.7-22.2-7.7c15.6-12.3,18.3-34.9,6-50.6c-1.8-2.2-3.8-4.3-6-6 c15.6-12.3,38.3-9.6,50.5,6.1C113.8,20.1,116.5,27.9,116.5,36z"/>
                </svg>
              </div>
              {/* UPI Logo */}
              <div className="bg-white px-1.5 py-0.5 rounded shadow-sm flex items-center justify-center h-6 w-9" title="UPI">
                <svg viewBox="0 0 333334 199007" className="w-full h-full object-contain" aria-label="UPI">
                  <path d="M44732 130924h1856l-1738 7215c-265 1061-206 1885 147 2415 354 530 1001 795 1973 795 942 0 1737-265 2356-795 618-531 1031-1355 1296-2415l1737-7215h1885l-1767 7392c-383 1590-1060 2798-2061 3593-972 795-2268 1208-3858 1208s-2680-383-3269-1179c-589-795-707-2002-324-3592l1767-7421zm223507 11868l2826-11868h6449l-383 1649h-4564l-706 2974h4564l-413 1679h-4564l-913 3827h4565l-412 1738h-6449zm-177-8982c-413-470-913-824-1443-1031-531-235-1119-353-1797-353-1266 0-2385 412-3386 1237s-1649 1915-1973 3239c-295 1267-177 2327 413 3181 559 824 1442 1237 2620 1237 677 0 1355-118 2031-383 678-235 1356-619 2062-1119l-530 2179c-589 382-1207 648-1856 825-648 176-1296 265-2002 265-883 0-1679-148-2356-443-678-294-1236-736-1679-1324-441-560-706-1237-824-2002-117-766-88-1590 148-2474 206-883 559-1680 1031-2445 471-766 1089-1443 1796-2002 706-589 1472-1030 2297-1325 824-294 1648-441 2503-441 677 0 1295 88 1885 294 559 207 1089 500 1560 913l-500 1972zm-18317 4300h3209l-530-2710c-29-176-59-383-59-589-30-235-30-471-30-736-118 265-235 500-383 736-118 235-235 442-353 619l-1855 2680zm4093 4682l-589-3062h-4594l-2062 3062h-1972l8539-12338 2650 12338h-1972zm-15548 0l2827-11868h6449l-383 1649h-4565l-706 2945h4563l-412 1679h-4564l-1325 5565h-1885v30zm-5566-6832h353c1001 0 1679-118 2062-354 382-236 648-648 795-1267 146-648 88-1119-207-1384-293-265-913-413-1855-413h-354l-795 3417zm-471 1502l-1267 5300h-1767l2828-11867h2621c766 0 1354 59 1737 148 411 89 736 265 971 500 295 295 471 648 559 1119 89 443 59 943-59 1502-235 943-619 1709-1207 2238-589 530-1326 854-2209 972l2680 5387h-2121l-2562-5300h-206zm-11632 5330l2828-11868h6478l-382 1649h-4565l-706 2974h4564l-411 1679h-4565l-912 3827h4564l-413 1738h-6479zm-2031-10248l-2444 10218h-1884l2444-10218h-3063l383-1649h8010l-382 1649h-3063zm-19170 10248l2945-12338 5595 7244c148 206 294 413 441 648c147 235 294 501 471 794l1973-8216h1737l-2944 12310-5713-7392c-147-206-294-412-442-619-147-235-265-442-353-707l-1973 8245h-1737v30" fill="#3a3734" />
                  <path d="M233961 120588h-12927l17963-64873h12927l-17963 64873zm-107424-4064c-707 2562-3063 4358-5713 4358H54185c-1826 0-3180-619-4064-1855-883-1238-1089-2769-559-4594l16255-58541h12928l-14518 52298h51710l14517-52298h12928l-16844 60632zm100710-58777c-883-1237-2268-1855-4152-1855h-71027l-3504 12721h64608l-3769 13576h-51680v-30h-12927l-10719 38724h12927l7185-25973h58100c1826 0 3534-619 5124-1855 1590-1237 2651-2768 3151-4594l7185-25972c559-1943 383-3504-501-4741z" fill="#716d6a" />
                  <path fill="#0e8635" d="M274245 55833l16344 32510-34365 32510 4087-14747 18794-17763-8941-17785z" />
                  <path fill="#e97208" d="M262762 55833l16343 32510-34395 32510z" />
                </svg>
              </div>
              {/* RuPay Logo */}
              <div className="bg-white px-1.5 py-0.5 rounded shadow-sm flex items-center justify-center h-6 w-9" title="RuPay">
                <svg viewBox="0 0 333334 199007" className="w-full h-full object-contain" aria-label="RuPay">
                  <path d="M214088 83928h13199v20970l11418-20970h12113l-24422 42395s-2267 3556-5079 5437c-2310 1547-5151 1477-6019 1540-4824-42-10643-55-10643-55l2807-10106 4542-8s2079-212 2882-1237c765-977 1156-1954 1156-3387 0-2148-1954-34580-1954-34580zM76939 88116c-1837 4256-7533 3772-7533 3772l-6632-31 2421-9013s5933 22 8843 22c3115 0 4088 2502 2902 5249zm15073-6142c1129-8943-6741-11201-15250-11201H54402l-13199 48105h14208l4436-16333 7970 65s3289-191 3354 2898c69 3295-2442 9345-2280 13370h14596l-32-1281s-1213-322-1078-2026c56-709 839-2953 1864-5979 618-1334 1550-4499 1464-7076-107-3217-2126-4710-5037-5754 9074-2128 11342-14787 11343-14787zm3224 1954h12959l-5337 20533s-1331 4579 2952 4932c3384 280 5902-3758 6727-6493 1084-3592 5296-18973 5296-18973h13351l-10159 34950h-11657l1432-4993s-5947 7252-14783 6382c-7854-771-8531-6468-7170-13575 668-3489 6389-22763 6389-22763zm66557 4298c-1849 5158-6944 4550-6944 4550l-6956 2 2746-10220s4403 23 7311 23c3560 0 4852 2828 3843 5644zm14609-4776c1130-8944-5687-12678-14197-12678h-22359l-13198 48105h14208l3995-14831 11320 69s17530 742 20232-20665zm11945 28307c-2220 563-4912 869-5446-1148-1466-5527 11474-7145 11474-7145 88 5036-4325 7859-6029 8293zm19575-10116c1707-5814 3865-11319 2128-14370-2660-4670-7468-5080-14502-5080-7771 0-17365 1476-20492 11810h12937s1179-3892 6035-3647c4298 217 4063 3174 2479 4809-2778 2865-10450 1276-18947 4224-7424 2576-10022 12338-8409 16234 1563 3778 4474 4259 8401 4645 6307 620 11143-2897 13394-4961 0 2292 60 3572 60 3572h13614l-33-1281s-1213-322-1078-2026c98-1248 2450-7252 4412-13929z" fill="#382a8d"/>
                  <path fill="#1d8546" d="M267751 75852l-15239 53011 28524-26506z"/>
                  <path fill="#ec6b00" d="M257982 75852l-15239 53011 28525-26506z"/>
                  <path d="M286355 66228c-2896 0-5254 2357-5254 5254 0 2896 2357 5253 5254 5253 2896 0 5253-2357 5253-5253 0-2898-2357-5254-5253-5254zm-81 7409v-4095h817l968 2899c90 270 154 472 197 606 46-149 118-368 218-657l980-2848h728v4095h-522v-3428l-1190 3428h-488l-1185-3486v3486h-523zm-2721 0v-3611h-1348v-483h3245v483h-1354v3611h-543zm2802 3618c-3185 0-5774-2590-5774-5774s2590-5775 5774-5775c3183 0 5774 2591 5774 5775 0 3183-2591 5774-5774 5774z" fill="#382a8d"/>
                </svg>
              </div>
            </div>
            <p className="text-[10px] text-white/60 flex items-center gap-1">
              <span>🔒</span> 100% Secure Checkout | SSL Encrypted & PCI-DSS Compliant Payments
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
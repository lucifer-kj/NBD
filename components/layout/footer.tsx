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
              href="https://wa.me/919163431395"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[var(--islamic-gold)] hover:text-white transition-colors duration-300 font-semibold group"
            >
              <MessageCircle size={18} className="group-hover:scale-110 transition-transform duration-300" />
              Chat with us on WhatsApp
            </a>
            {/* Social Media Links */}
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <a
                href="https://www.facebook.com/people/Naaz-Book-Depot-Kolkata/61590875242073/"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on Facebook"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] hover:-translate-y-0.5 transition-all duration-300 text-white/80"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.instagram.com/naazbookkolkata/"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on Instagram"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] hover:-translate-y-0.5 transition-all duration-300 text-white/80"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.threads.net/@naazbookkolkata"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on Threads"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] hover:-translate-y-0.5 transition-all duration-300 text-white/80"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 192 192">
                  <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
                </svg>
              </a>
              <a
                href="https://x.com/nbd_kolkata"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on X"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] hover:-translate-y-0.5 transition-all duration-300 text-white/80"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://medium.com/@nbddigi"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on Medium"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] hover:-translate-y-0.5 transition-all duration-300 text-white/80"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                </svg>
              </a>
              <a
                href="https://in.pinterest.com/nbddigi/"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Visit Naaz Book Depot on Pinterest"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green-dark)] hover:border-[var(--islamic-gold)] hover:-translate-y-0.5 transition-all duration-300 text-white/80"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
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
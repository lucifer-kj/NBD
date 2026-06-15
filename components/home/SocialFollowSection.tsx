import React from 'react';
import { Facebook, Instagram } from 'lucide-react';

export default function SocialFollowSection() {
  const socials = [
    {
      name: "Instagram",
      handle: "@naazbookkolkata",
      url: "https://www.instagram.com/naazbookkolkata/",
      desc: "Daily Qur'an verses, Islamic reminders, and new book announcements.",
      color: "hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white",
      icon: <Instagram size={28} />,
      btnText: "Follow on Instagram"
    },
    {
      name: "Facebook",
      handle: "Naaz Book Depot",
      url: "https://www.facebook.com/people/Naaz-Book-Depot-Kolkata/61590875242073/",
      desc: "Connect with our community, view legacy galleries, and check store events.",
      color: "hover:bg-[#1877F2] hover:text-white",
      icon: <Facebook size={28} />,
      btnText: "Like Our Page"
    },
    {
      name: "Threads",
      handle: "@naazbookkolkata",
      url: "https://www.threads.net/@naazbookkolkata",
      desc: "Thoughtful discussions, short reflections, and customer Q&As.",
      color: "hover:bg-black hover:text-white",
      icon: (
        <svg className="w-7 h-7 fill-current" viewBox="0 0 192 192">
          <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
        </svg>
      ),
      btnText: "Join the Thread"
    },
    {
      name: "Pinterest",
      handle: "@nbddigi",
      url: "https://in.pinterest.com/nbddigi/",
      desc: "Islamic art & design, bookmarks, Qur'an reading plans, and quotes.",
      color: "hover:bg-[#E60023] hover:text-white",
      icon: (
        <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.4 7.62 11.18-.1-.95-.18-2.4.04-3.43.2-.87 1.29-5.46 1.29-5.46s-.33-.66-.33-1.63c0-1.53.88-2.67 2-2.67.94 0 1.4.7 1.4 1.55 0 .94-.6 2.35-.91 3.66-.26 1.09.55 1.98 1.62 1.98 1.95 0 3.44-2.05 3.44-5 0-2.62-1.88-4.45-4.57-4.45-3.11 0-4.94 2.33-4.94 4.75 0 .94.36 1.95.81 2.5.09.11.1.2.07.3-.08.33-.26 1.06-.3 1.2-.05.2-.18.25-.41.14-1.52-.7-2.47-2.92-2.47-4.7 0-3.83 2.78-7.34 8.01-7.34 4.21 0 7.48 3 7.48 7 0 4.18-2.63 7.55-6.28 7.55-1.23 0-2.38-.64-2.77-1.4l-.76 2.9c-.27 1.05-1.01 2.36-1.51 3.17C8.78 23.77 10.33 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
        </svg>
      ),
      btnText: "Pin with Us"
    }
  ];

  return (
    <section className="py-20 bg-[#FCFAF7] border-t border-b border-[#e9e3d9]/40 relative overflow-hidden">
      <div className="islamic-pattern opacity-[0.03] absolute inset-0 pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--islamic-gold)] bg-[#0D2E21]/5 px-3.5 py-1.5 rounded-full border border-[var(--islamic-gold)]/10">
            Social Community
          </span>
          <h2 className="text-3xl md:text-5xl font-headings font-bold text-[var(--islamic-green-dark)] mt-4 mb-4">
            Connect With Our Ummah
          </h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Follow us on your favorite platforms for daily inspirations, Qur’anic verses, new publications, and updates straight from our Kolkata depot.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer me"
              className={`flex flex-col h-full bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 text-gray-800 hover:border-transparent ${social.color} group`}
            >
              <div className="w-14 h-14 rounded-2xl bg-[var(--islamic-beige)] border border-[var(--islamic-gold)]/10 flex items-center justify-center text-[var(--islamic-green)] group-hover:bg-white/20 group-hover:text-white transition-all duration-300 mb-6">
                {social.icon}
              </div>
              <h3 className="text-xl font-headings font-bold mb-1 group-hover:text-white transition-colors">
                {social.name}
              </h3>
              <span className="text-xs text-[var(--islamic-gold)] font-semibold mb-4 group-hover:text-white/80 transition-colors">
                {social.handle}
              </span>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1 group-hover:text-white/70 transition-colors">
                {social.desc}
              </p>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[var(--islamic-green)] group-hover:text-white transition-colors">
                <span>{social.btnText}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

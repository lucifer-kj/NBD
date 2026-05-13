"use client";

import React from 'react';
import { Phone, Mail } from 'lucide-react';

const ContactInfoStrip = () => {
  const contactInfo = [
    { icon: <Phone size={14} />, text: '+91 90510 85118' },
    { icon: <Phone size={14} />, text: '91634 31395' },
    { icon: <Phone size={14} />, text: '033 2235 0051' },
    { icon: <Phone size={14} />, text: '033 2235 0960' },
    { icon: <Mail size={14} />, text: 'naazgroupofficial@gmail.com' },
    { icon: <Mail size={14} />, text: '1, Ismail Madani Lane, Kolkata' }
  ];

  // Duplicate for seamless looping
  const loopedInfo = [...contactInfo, ...contactInfo];

  return (
    <div className="text-[var(--islamic-green-dark)] py-3 px-4 overflow-hidden relative z-10" style={{ background: 'linear-gradient(to right, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%)' }}>
      <div className="container mx-auto">
        {/* Desktop: normal flex, Mobile: horizontal scroll + animation */}
        <div className="hidden md:flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {contactInfo.map((info, index) => {
            const isEmail = info.text.includes('@');
            const isPhone = !isEmail && /[\d\s+-]+/.test(info.text) && !info.text.includes('Lane');
            const href = isEmail ? `mailto:${info.text}` : isPhone ? `tel:${info.text.replace(/\s+/g, '')}` : null;

            return (
              <div key={index} className="flex items-center">
                {href ? (
                  <a href={href} className="flex items-center gap-2 whitespace-nowrap hover:opacity-80 transition-opacity">
                    <span className="text-[var(--islamic-green-dark)]">{info.icon}</span>
                    <span className={`text-sm font-semibold ${(isEmail || isPhone) ? 'text-[var(--islamic-green-dark)]' : ''}`}>{info.text}</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-[var(--islamic-green-dark)]">{info.icon}</span>
                    <span className={`text-sm font-semibold ${(isEmail || isPhone) ? 'text-[var(--islamic-green-dark)]' : ''}`}>{info.text}</span>
                  </div>
                )}
                {index !== contactInfo.length - 1 && (
                  <span className="mx-2 text-[var(--islamic-green-dark)]/30 font-bold">|</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="md:hidden relative w-full overflow-x-hidden">
          <div
            className="flex items-center gap-6 animate-contact-marquee whitespace-nowrap"
            style={{ animationDuration: '18s', animationDelay: '1s' }}
          >
            {loopedInfo.map((info, index) => {
              const isEmail = info.text.includes('@');
              const isPhone = !isEmail && /[\d\s+-]+/.test(info.text) && !info.text.includes('Lane');
              const href = isEmail ? `mailto:${info.text}` : isPhone ? `tel:${info.text.replace(/\s+/g, '')}` : null;

              return (
                <div key={index} className="flex items-center">
                  {href ? (
                    <a href={href} className="flex items-center gap-2 whitespace-nowrap">
                      <span className="text-[var(--islamic-green-dark)]">{info.icon}</span>
                      <span className={`text-sm font-semibold ${(isEmail || isPhone) ? 'text-[var(--islamic-green-dark)]' : ''}`}>{info.text}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className="text-[var(--islamic-green-dark)]">{info.icon}</span>
                      <span className={`text-sm font-semibold ${(isEmail || isPhone) ? 'text-[var(--islamic-green-dark)]' : ''}`}>{info.text}</span>
                    </div>
                  )}
                  {index !== loopedInfo.length - 1 && (
                    <span className="mx-2 text-[var(--islamic-green-dark)]/30 font-bold">|</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Animation styles */}
      <style jsx>{`
        @keyframes contact-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-contact-marquee {
          animation-name: contact-marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

export default ContactInfoStrip;

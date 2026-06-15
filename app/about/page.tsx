import { Heart, Book, Users, CheckCircle } from "lucide-react";
import Image from "next/image";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Us | Naaz Book Depot Kolkata",
  description: "Learn about Naaz Book Depot, India's trusted publisher of authentic Islamic books, Qurans, and stands since 1967. Led by MD Irfan with 60+ years of dedication.",
  alternates: {
    canonical: "/about",
  },
}

export default function AboutPage() {
  return (
    <div className="bg-[#F6F1E7] min-h-screen w-full pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[260px] flex flex-col items-center justify-center bg-[var(--islamic-green)] overflow-hidden text-center px-4 pt-8 pb-10">
        <span className="absolute inset-0 bg-gradient-to-br from-[var(--islamic-green)]/90 via-[var(--islamic-green-light)]/80 to-[var(--islamic-gold)]/40 z-0" aria-hidden="true" />
        <Image
          src="/Images/Image+Background.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center w-full h-full absolute inset-0 z-0 opacity-30"
        />
        <div className="relative z-10 w-full flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-headings font-bold text-white mb-2 drop-shadow-lg">About Naaz Book Depot</h1>
          <div className="text-lg md:text-2xl text-white/90 mb-1 font-arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
          <div className="text-sm md:text-lg text-white/80 mb-2">&quot;Jazakum Allahu Khayran&quot; - May Allah reward you with goodness</div>
        </div>
      </section>

      {/* Main 2-column layout for desktop */}
      <section className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left column: Legacy and Mission/Values */}
        <div className="space-y-10">
          {/* Legacy Section */}
          <div>
            <h2 className="text-5xl font-headings font-bold text-[var(--islamic-green)] text-center lg:text-left mb-1 mt-2">A Legendary<br />Legacy Since 1967</h2>
            <div className="h-1 w-20 bg-[var(--islamic-gold-text)] rounded my-4 mx-auto lg:mx-0" />
            <p className="text-base md:text-lg text-[var(--charcoal)]/90 mb-3 text-center lg:text-left max-w-md">Founded in the heart of Kolkata in 1967, Naaz Book Depot has served as a beacon of Islamic knowledge for over five decades. What started as a humble mission has evolved into a legendary legacy in the Islamic publishing community.</p>
            <p className="text-base md:text-lg text-[var(--charcoal)]/90 mb-3 text-center lg:text-left max-w-md">At the core of this mission stands <span className="font-bold">MD Irfan</span>, the esteemed Director of Naaz Book Depot. With over 60 years of experience in Islamic publishing, he has personally overseen the publication of <span className="font-bold">more than 2,000 Islamic titles</span>, including Qur’ans, Tafsir, Duas, Ruqyas, and other essential texts.</p>
            <p className="text-base md:text-lg text-[var(--charcoal)]/90 mb-6 text-center lg:text-left max-w-md">Known throughout India for his unwavering commitment to Islamic knowledge, <span className="font-bold">MD Irfan</span> has transformed Naaz Book Depot into a vital source of authentic Islamic literature, serving the Ummah with dedication and Islamic principles for over 60 years.</p>
          </div>
          {/* Mission & Values Section */}
          <div className="bg-[#F6F1E7] w-full px-0 py-0 flex flex-col items-center lg:items-start">
            <h2 className="text-xl md:text-2xl font-headings font-bold text-[var(--islamic-green)] text-center lg:text-left mb-6">Our Mission & Values</h2>
            <div className="space-y-7 w-full max-w-md">
              <div className="flex items-start gap-3">
                <Heart className="w-6 h-6 text-[var(--islamic-gold-text)] mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-[var(--islamic-green)] text-base mb-1">Authentic Islamic Knowledge</div>
                  <div className="text-sm md:text-base text-[var(--charcoal)]/90">We are committed to publishing only authentic Islamic literature, verified by qualified scholars and rooted in traditional Islamic teachings.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Book className="w-6 h-6 text-[var(--islamic-gold-text)] mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-[var(--islamic-green)] text-base mb-1">Educational Excellence</div>
                  <div className="text-sm md:text-base text-[var(--charcoal)]/90">Making Islamic education accessible through quality publications in multiple languages - Arabic, Urdu, Bengali, and English.</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-6 h-6 text-[var(--islamic-gold-text)] mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-[var(--islamic-green)] text-base mb-1">Serving the Ummah</div>
                  <div className="text-sm md:text-base text-[var(--charcoal)]/90">Selflessly serving the Muslim community with integrity, dedication, and Islamic principles for over 60 years.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right column: Image card and Testimonials */}
        <div className="space-y-10 flex flex-col items-center">
          {/* Image Card */}
          <div className="bg-[#F6F1E7] rounded-2xl shadow-lg p-6 flex flex-col items-center w-full max-w-lg mx-auto mb-6 lg:max-w-full lg:p-10">
            <div className="w-full rounded-xl overflow-hidden mb-3">
              <Image
                src="/Images/About.jpg"
                alt="MD Irfan"
                width={600}
                height={400}
                className="object-cover w-full h-72 md:h-96"
                priority
              />
            </div>
            <div className="text-center">
              <div className="font-bold text-[var(--islamic-green)] text-lg md:text-xl">MD Irfan</div>
              <div className="text-[var(--islamic-gold-text)] text-base md:text-lg font-semibold">Director, Naaz Book Depot</div>
              <div className="text-xs md:text-sm text-[var(--charcoal)]/80">A lifelong contributor to Qur’anic knowledge</div>
            </div>
          </div>
          {/* Testimonials Card */}
          <div className="w-full flex flex-col items-center px-0 py-0">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto">
              <h3 className="text-lg md:text-xl font-headings font-semibold text-[var(--islamic-green)] text-center mb-5">Testimonials About Our Work</h3>
              <div className="space-y-5 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-14 bg-[var(--islamic-gold-text)] rounded mr-2 mt-1" />
                  <span className="italic text-[var(--charcoal)]/90 text-sm md:text-base">“Your dedication to publishing authentic Islamic literature is a source of immense benefit to the Ummah.”</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-14 bg-[var(--islamic-gold-text)] rounded mr-2 mt-1" />
                  <span className="italic text-[var(--charcoal)]/90 text-sm md:text-base">“May Allah bless your efforts in spreading knowledge and making Islamic teachings accessible to all.”</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-14 bg-[var(--islamic-gold-text)] rounded mr-2 mt-1" />
                  <span className="italic text-[var(--charcoal)]/90 text-sm md:text-base">“Your work in publishing Qur’ans and Islamic books is a true form of Sadaqah Jariyah (continuous charity), benefiting generations to come.”</span>
                </div>
              </div>
              {/* Highlight Card */}
              <div className="bg-[#F6F1E7] rounded-lg flex items-center gap-3 px-4 py-3 mt-2">
                <CheckCircle className="w-6 h-6 text-[var(--islamic-green)] flex-shrink-0" />
                <div>
                  <div className="font-bold text-[var(--islamic-green)] text-base">Over 2,000 Islamic Books Published</div>
                  <div className="text-xs text-[var(--charcoal)]/80">Including Qur’ans, Tafsir, Hadith, Duas, and educational materials.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps / Bookstore Location Section */}
      <section className="container mx-auto px-4 py-12 border-t border-[#e9e3d9]/40 mt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[var(--islamic-gold-text)] bg-[#0D2E21]/5 mb-6 px-3 py-1.5 rounded-full border border-[var(--islamic-gold-text)]/20">
              Visit Our Bookstore
            </span>
            <h2 className="text-3xl md:text-4xl font-headings font-bold text-[var(--islamic-green)]">
              Our Kolkata Depot
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Step into a sanctuary of Islamic literature. Located in the historic book districts of Kolkata, Naaz Book Depot welcomes you to browse our vast physical catalog of over 2,000 titles.
            </p>
            <div className="space-y-2 pt-2 text-sm text-[var(--charcoal)]/80 font-medium">
              <p className="flex items-center justify-center lg:justify-start gap-2.5">
                <span className="font-bold text-[var(--islamic-green)]">Address:</span> 1, Ismail Madani Lane, Kolkata, West Bengal, 700073
              </p>
              <p className="flex items-center justify-center lg:justify-start gap-2.5">
                <span className="font-bold text-[var(--islamic-green)]">Phone:</span> 033 22350051 / +91 90510 85118
              </p>
              <p className="flex items-center justify-center lg:justify-start gap-2.5">
                <span className="font-bold text-[var(--islamic-green)]">Hours:</span> Monday – Saturday: 9:00 AM – 8:00 PM
              </p>
            </div>
            <div className="pt-4 flex justify-center lg:justify-start">
              <a
                href="https://maps.app.goo.gl/KyfnubwL4x5korfD7"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open in Google Maps (opens in a new tab)"
                className="inline-flex items-center gap-2 bg-[var(--islamic-green)] text-white hover:bg-[var(--islamic-gold)] hover:text-[var(--islamic-green)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--islamic-green)] focus-visible:ring-offset-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
          <div className="lg:col-span-7 rounded-2xl overflow-hidden shadow-lg border border-[#e9e3d9]/40 bg-white p-2.5 w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.055910032411!2d88.35425927405956!3d22.577012132810985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0277b1e9cd2689%3A0x9917b3cc5955014d!2sNaaz%20Book%20Depot!5e0!3m2!1sen!2sin!4v1781560248075!5m2!1sen!2sin"
              width="100%"
              height="380"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              allow="geolocation; accelerometer; gyroscope; magnetometer"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full rounded-xl"
              title="Naaz Book Depot Location Map"
            />
          </div>
        </div>
      </section>
    </div>
  );
} 
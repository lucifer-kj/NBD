import React from 'react';
import { 
  HelpCircle, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  CreditCard
} from 'lucide-react';

export const metadata = {
  title: 'Contact Us & Frequently Asked Questions (FAQ) | Naaz Book Depot',
  description: 'Find answers to common questions about ordering Islamic books, Qur\'an, stands, shipping, returns, and more at Naaz Book Depot.',
  alternates: {
    canonical: '/contact',
  },
};

const faqs = [
  {
    category: "Orders & Shipping",
    icon: <Truck className="text-[var(--islamic-gold-text)]" size={24} />,
    items: [
      {
        question: "How long does shipping take within India?",
        answer: "We typically process orders within 24-48 hours. Shipping usually takes 3-7 business days depending on your location. Metropolitan cities like Delhi, Mumbai, and Bangalore often receive deliveries within 3-4 days."
      },
      {
        question: "Do you offer international shipping?",
        answer: "Yes, Naaz Book Depot ships worldwide. International shipping rates and delivery times vary by country. Please contact us on WhatsApp for a custom shipping quote for international orders."
      },
      {
        question: "How can I track my order?",
        answer: "Once your order is shipped, you will receive a tracking number via email and SMS. You can also track your order status in the 'Account' section of our website."
      }
    ]
  },
  {
    category: "Product Authenticity",
    icon: <ShieldCheck className="text-[var(--islamic-gold-text)]" size={24} />,
    items: [
      {
        question: "Are the books and Qur'ans authentic?",
        answer: "Absolutely. Naaz Book Depot has been a trusted publisher since 1967. We specialize in authentic Islamic literature and Qur'ans that undergo rigorous proofreading and quality checks."
      },
    ]
  },
  {
    category: "Payments & Security",
    icon: <CreditCard className="text-[var(--islamic-gold-text)]" size={24} />,
    items: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit/debit cards, UPI, Net Banking, and popular mobile wallets through our secure payment gateway."
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes, all transactions are processed through encrypted, PCI-DSS compliant payment gateways. We do not store your card details on our servers."
      }
    ]
  },
  {
    category: "Returns & Exchanges",
    icon: <RotateCcw className="text-[var(--islamic-gold-text)]" size={24} />,
    items: [
      {
        question: "What is your return policy?",
        answer: "We offer a 7-day return policy for books and stands in their original, unused condition."
      },
      {
        question: "How do I initiate an exchange?",
        answer: "If you received a damaged or incorrect item, please contact us within 48 hours of delivery with photos of the product. We will arrange a replacement at no extra cost."
      }
    ]
  }
];

export default function FAQPage() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.naazbook.in';
  const baseSiteUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;

  const faqList = faqs.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    }))
  );

  const contactSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${baseSiteUrl}/contact#webpage`,
        "url": `${baseSiteUrl}/contact`,
        "name": "Contact Us & Frequently Asked Questions (FAQ) | Naaz Book Depot",
        "description": "Find answers to common questions about ordering Islamic books, Qur'an, Atar, shipping, returns, and more at Naaz Book Depot.",
        "isPartOf": {
          "@type": "WebSite",
          "@id": `${baseSiteUrl}/#website`,
          "url": baseSiteUrl,
          "name": "Naaz Book Depot"
        },
        "publisher": {
          "@id": "https://www.naazbook.in/#localbusiness"
        }
      },
      {
        "@type": "FAQPage",
        "@id": `${baseSiteUrl}/contact#faq`,
        "mainEntity": faqList
      }
    ]
  };

  return (
    <div className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      {/* Hero Header */}
      <div className="bg-[var(--islamic-green-dark)] py-20 px-4 text-center relative overflow-hidden">
        <div className="islamic-pattern opacity-10" />
        <div className="relative z-10 container mx-auto">
          <h1 className="text-4xl md:text-6xl font-headings font-bold text-white mb-6">
            Frequently Asked <span className="text-[var(--islamic-gold)]">Questions</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Everything you need to know about our products, shipping, and services. 
            Can&apos;t find the answer? Contact us on WhatsApp.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {faqs.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-[var(--islamic-beige)] border border-[var(--islamic-gold)]/20 shadow-sm">
                  {group.icon}
                </div>
                <h2 className="text-2xl md:text-3xl font-headings font-bold text-[var(--islamic-green)]">
                  {group.category}
                </h2>
              </div>

              <div className="space-y-4">
                {group.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx}
                    className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg md:text-xl font-bold text-[var(--islamic-green)] mb-3 flex items-start gap-3">
                      <HelpCircle className="text-[var(--islamic-gold-text)] shrink-0 mt-1" size={20} />
                      {item.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed pl-8">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Bookstore Location Map */}
          <div className="mb-16 bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-headings font-bold text-[var(--islamic-green)] mb-3 flex items-center gap-3">
              Visit Our Physical Store
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
              Come browse our collections in person at our Kolkata bookstore. Use the interactive map below to find directions.
            </p>
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-inner w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.055910032411!2d88.35425927405956!3d22.577012132810985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0277b1e9cd2689%3A0x9917b3cc5955014d!2sNaaz%20Book%20Depot!5e0!3m2!1sen!2sin!4v1781560248075!5m2!1sen!2sin"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                allow="geolocation; accelerometer; gyroscope; magnetometer"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
                title="Naaz Book Depot Google Maps Embed"
              />
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-500 font-medium">
              <p>📍 <strong>Address:</strong> 1, Ismail Madani Lane, Kolkata, West Bengal, 700073</p>
              <p>📞 <strong>Phone:</strong> 033 22350051 / +91 90510 85118</p>
              <p>⏰ <strong>Hours:</strong> Mon – Sat: 9:00 AM – 8:00 PM</p>
            </div>
          </div>

          {/* Still have questions? */}
          <div className="mt-20 p-10 rounded-3xl bg-[var(--islamic-beige)] border-2 border-dashed border-[var(--islamic-gold)]/30 text-center">
            <h2 className="text-2xl font-headings font-bold text-[var(--islamic-green-dark)] mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Our support team is available from 10:00 AM to 7:00 PM IST to help you with any queries.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="https://wa.me/919051085118" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp (opens in a new tab)"
                className="bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#128C7E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 transition-all flex items-center justify-center gap-2"
              >
                Chat on WhatsApp
              </a>
              <a 
                href="mailto:naazgroupofficial@gmail.com" 
                className="bg-[var(--islamic-green)] text-white px-8 py-4 rounded-xl font-bold hover:bg-[var(--islamic-green-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--islamic-green)] focus-visible:ring-offset-2 transition-all flex items-center justify-center gap-2"
              >
                Email Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

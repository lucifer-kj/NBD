import React from 'react';
import { 
  HelpCircle, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  CreditCard
} from 'lucide-react';

export const metadata = {
  title: 'Frequently Asked Questions (FAQ) | Naaz Book Depot',
  description: 'Find answers to common questions about ordering Islamic books, Qur\'an, Atar, shipping, returns, and more at Naaz Book Depot.',
};

const faqs = [
  {
    category: "Orders & Shipping",
    icon: <Truck className="text-[var(--islamic-gold)]" size={24} />,
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
    icon: <ShieldCheck className="text-[var(--islamic-gold)]" size={24} />,
    items: [
      {
        question: "Are the books and Qur'ans authentic?",
        answer: "Absolutely. Naaz Book Depot has been a trusted publisher since 1967. We specialize in authentic Islamic literature and Qur'ans that undergo rigorous proofreading and quality checks."
      },
      {
        question: "What makes your Atar unique?",
        answer: "Our premium fragrances and Atars are sourced from the finest ingredients, ensuring long-lasting and pure scents that are alcohol-free and suitable for all occasions."
      }
    ]
  },
  {
    category: "Payments & Security",
    icon: <CreditCard className="text-[var(--islamic-gold)]" size={24} />,
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
    icon: <RotateCcw className="text-[var(--islamic-gold)]" size={24} />,
    items: [
      {
        question: "What is your return policy?",
        answer: "We offer a 7-day return policy for books and products in their original, unused condition. Fragrances and Atars are non-returnable once the seal is broken due to hygiene reasons."
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
        "name": "Contact & FAQ | Naaz Book Depot",
        "description": "Find answers to common questions about ordering Islamic books, Qur'an, Atar, shipping, returns, and more at Naaz Book Depot.",
        "isPartOf": {
          "@type": "WebSite",
          "@id": `${baseSiteUrl}/#website`,
          "url": baseSiteUrl,
          "name": "Naaz Book Depot"
        }
      },
      {
        "@type": "FAQPage",
        "@id": `${baseSiteUrl}/contact#faq`,
        "mainEntity": faqList
      },
      {
        "@type": "LocalBusiness",
        "@id": `${baseSiteUrl}/#localbusiness`,
        "name": "Naaz Book Depot",
        "image": `${baseSiteUrl}/Images/Logo.png`,
        "telephone": "+919051085118",
        "email": "naazgroupofficial@gmail.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Kolkata",
          "addressLocality": "Kolkata",
          "addressRegion": "West Bengal",
          "postalCode": "700001",
          "addressCountry": "IN"
        },
        "url": baseSiteUrl
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
                      <HelpCircle className="text-[var(--islamic-gold)] shrink-0 mt-1" size={20} />
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
                className="bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2"
              >
                Chat on WhatsApp
              </a>
              <a 
                href="mailto:naazgroupofficial@gmail.com" 
                className="bg-[var(--islamic-green)] text-white px-8 py-4 rounded-xl font-bold hover:bg-[var(--islamic-green-dark)] transition-all flex items-center justify-center gap-2"
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

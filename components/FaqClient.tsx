"use client";

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, BookOpen, Truck, Landmark, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'general' | 'authenticity' | 'wholesale' | 'returns';
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'ship-1',
    category: 'general',
    question: 'How long does shipping take within India?',
    answer: 'Standard shipping usually takes 3 to 7 business days, depending on your location. Metro cities like Kolkata, Mumbai, Delhi, and Bangalore usually receive packages within 3 to 4 business days. Express shipping is also available at checkout for faster delivery.'
  },
  {
    id: 'ship-2',
    category: 'general',
    question: 'How can I track my order?',
    answer: 'Once your order is processed and shipped, you will receive an email and SMS notification containing your unique tracking number and courier partner link. You can use this link to check the real-time status of your delivery.'
  },
  {
    id: 'ship-3',
    category: 'general',
    question: 'Do you ship books internationally?',
    answer: 'Currently, our online checkout is set up primarily for domestic orders within India. However, we frequently ship bulk orders and specific editions internationally. Please contact us via our contact form or support email (support@naazbook.in) with your requirements and shipping address for a custom international shipping quote.'
  },
  {
    id: 'auth-1',
    category: 'authenticity',
    question: 'Are all your publications authentic and scholar-verified?',
    answer: 'Absolutely. Authenticity is the cornerstone of our legacy since 1967. Every Quran edition, Hadith translation, Tafseer commentary, and Islamic literature title we print is thoroughly proofread and reviewed by qualified Islamic scholars (Ulama) to ensure zero errors in translation and Arabic script.'
  },
  {
    id: 'auth-2',
    category: 'authenticity',
    question: 'In what languages do you publish Islamic books?',
    answer: 'To make Islamic knowledge universally accessible, we publish and distribute books in multiple languages including Arabic, Urdu, Bengali, Hindi, and English. We offer diverse translations for Quran and essential compilations like Riyadh-us-Saliheen and Hisnul Muslim.'
  },
  {
    id: 'bulk-1',
    category: 'wholesale',
    question: 'Do you offer special pricing for bulk orders or Madrasas?',
    answer: 'Yes! We support Islamic libraries, Madrasas, Masjids, and study circles by offering wholesale discounts on bulk purchases. If you wish to purchase books in large quantities (above 20 copies per title), please get in touch with our sales team via our wholesale inquiry channel or contact page.'
  },
  {
    id: 'bulk-2',
    category: 'wholesale',
    question: 'Can we place a custom print or distribution order?',
    answer: 'Yes, with over 60 years of expertise and state-of-the-art printing facilities under Director MD Irfan, we handle custom printing and publishing requests for Islamic manuscripts, Madrasa course textbooks, and institutional books. Minimum order quantities apply for custom print runs.'
  },
  {
    id: 'pay-1',
    category: 'returns',
    question: 'What payment options do you support?',
    answer: 'We accept a wide array of payment methods including UPI (Google Pay, PhonePe, Paytm), Net Banking, major Credit & Debit Cards (Visa, Mastercard, RuPay), and popular digital wallets. All transactions are handled securely through our encrypted payment gateway.'
  },
  {
    id: 'pay-2',
    category: 'returns',
    question: 'What is your return and exchange policy?',
    answer: 'We take immense pride in the quality of our books. However, if you receive a copy with printing errors, missing pages, or shipping damage, we will happily provide a replacement or full refund. Please reach out to us within 7 days of receiving your package with a photo of the defect.'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All FAQs', icon: BookOpen },
  { id: 'general', label: 'Shipping & Orders', icon: Truck },
  { id: 'authenticity', label: 'Authenticity & Proofs', icon: ShieldCheck },
  { id: 'wholesale', label: 'Bulk Orders & Madrasas', icon: Landmark },
  { id: 'returns', label: 'Payments & Returns', icon: Landmark }
];

export default function FaqClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'ship-1': true, // Keep first item open by default
    'auth-1': true
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch = searchQuery === '' || 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      {/* Dynamic Header Hero */}
      <section className="relative bg-gradient-to-br from-[#0F3823] via-[#0A2618] to-[#05140C] text-white py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,#E4B869_0%,transparent_50%)]" />
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[var(--islamic-gold)] opacity-5 blur-3xl" />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-[var(--islamic-gold)] uppercase tracking-widest text-xs md:text-sm font-semibold mb-3 inline-block">
            Support Center
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-headings font-extrabold mb-4 bg-gradient-to-r from-white via-gray-100 to-[var(--islamic-gold)] bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <div className="h-[2px] w-20 bg-[var(--islamic-gold)] mb-6 mx-auto rounded" />
          <p className="text-gray-300 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Find answers to common questions about shipping, wholesale orders, book authenticity standards, and customer care.
          </p>

          {/* Interactive Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[var(--islamic-gold)] transition-colors" />
            </div>
            <input
              type="text"
              id="faq-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions, keywords, policies..."
              className="block w-full pl-12 pr-4 py-4 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--islamic-gold)] focus:border-transparent transition-all shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Main FAQ Interface */}
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
          
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-2 sticky top-24">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
              FAQ Categories
            </h3>
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-4 lg:pb-0 scrollbar-none">
              {CATEGORIES.map(category => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    id={`faq-cat-${category.id}`}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap lg:w-full border ${
                      isActive 
                        ? 'bg-[#0F3823] text-white border-[#0F3823] shadow-md shadow-[#0F3823]/10 transform translate-x-1' 
                        : 'bg-white text-gray-700 hover:text-gray-900 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--islamic-gold)]' : 'text-gray-400'}`} />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accordion list */}
          <div className="lg:col-span-3 space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = !!openItems[faq.id];
                return (
                  <div 
                    key={faq.id} 
                    className="bg-white rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-300/60"
                  >
                    <button
                      id={`faq-btn-${faq.id}`}
                      onClick={() => toggleItem(faq.id)}
                      className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    >
                      <span className="font-headings font-bold text-gray-800 text-base md:text-lg pr-4 transition-colors duration-200 group-hover:text-[#0F3823]">
                        {faq.question}
                      </span>
                      <span className={`flex-shrink-0 p-1.5 rounded-full transition-transform duration-300 bg-gray-50 text-gray-500 ${
                        isOpen ? 'transform rotate-180 bg-[#0F3823]/5 text-[#0F3823]' : ''
                      }`}>
                        <ChevronDown className="w-5 h-5" />
                      </span>
                    </button>
                    
                    {/* Collapsible Answer */}
                    <div 
                      className={`transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-96 opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="p-6 text-gray-600 font-light leading-relaxed text-sm md:text-base bg-gray-50/40">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 max-w-xl mx-auto px-6">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-headings font-semibold text-gray-800 mb-1">No Results Found</h3>
                <p className="text-gray-500 text-sm mb-6">We couldn&apos;t find any answers matching &quot;{searchQuery}&quot;. Please try search options with different keywords.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#0F3823] text-white hover:bg-[#0A2618] font-medium text-sm transition-colors shadow-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Direct support inquiry card */}
            <div className="bg-gradient-to-br from-[#F6F1E7] to-[#ECE5D8] rounded-3xl p-8 border border-gray-200/50 shadow-sm mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-xl font-headings font-bold text-[#0F3823] mb-1">
                  Still have unanswered questions?
                </h4>
                <p className="text-gray-600 text-sm font-light max-w-xl">
                  If you cannot find the answer to your specific query, our experienced publishing team is here to assist you selflessly.
                </p>
              </div>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0F3823] hover:bg-[#0A2618] text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-[#0F3823]/10 whitespace-nowrap"
              >
                <Mail className="w-4 h-4 text-[var(--islamic-gold)]" />
                Get in Touch
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}

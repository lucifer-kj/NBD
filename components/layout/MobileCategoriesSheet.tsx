"use client";

import React from "react";
import Link from "next/link";
import { Drawer } from "vaul";
import { X, Book, BookOpen, Gift, Sparkles, HeartHandshake, Baby, ChevronRight } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface MobileCategoriesSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  {
    name: "Holy Qur'an",
    href: "/books?category=quran",
    description: "Tajweed editions, translations & premium prints",
    icon: Book,
    badge: "Most Popular",
    iconBg: "bg-amber-100 text-amber-800",
  },
  {
    name: "Scholarly Literature",
    href: "/books",
    description: "Hadith collections, Fiqh manuals & Islamic history",
    icon: BookOpen,
    badge: "Authentic",
    iconBg: "bg-emerald-100 text-emerald-800",
  },
  {
    name: "Qur'an Stands (Rehal)",
    href: "/products?search=rehal",
    description: "Handcrafted wooden and carved folding rehals",
    icon: HeartHandshake,
    badge: "Handcrafted",
    iconBg: "bg-amber-100 text-amber-900",
  },
  {
    name: "Gift Sets",
    href: "/products?search=gift",
    description: "Curated Islamic gift packages for loved ones",
    icon: Gift,
    badge: "Curated",
    iconBg: "bg-teal-100 text-teal-800",
  },
  {
    name: "Children's Islamic Books",
    href: "/books?search=kids",
    description: "Prophet stories, moral tales & Dua books for kids",
    icon: Baby,
    badge: "Family",
    iconBg: "bg-blue-100 text-blue-800",
  },
  {
    name: "Islamic Accessories",
    href: "/products?search=accessory",
    description: "Tasbihs, prayer mats & daily Islamic essentials",
    icon: Sparkles,
    badge: "Essentials",
    iconBg: "bg-purple-100 text-purple-800",
  },
];

export default function MobileCategoriesSheet({ isOpen, onClose }: MobileCategoriesSheetProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[1000] md:hidden transition-opacity duration-300"
          onClick={onClose} 
        />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-3xl z-[1010] md:hidden flex flex-col outline-none shadow-2xl border-t border-gray-100">
          <Drawer.Title asChild>
            <VisuallyHidden>Explore Islamic Categories</VisuallyHidden>
          </Drawer.Title>
          <Drawer.Description asChild>
            <VisuallyHidden>Browse categories of authentic Islamic books and products</VisuallyHidden>
          </Drawer.Description>

          {/* Grab Handle */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2 shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-lg font-headings font-bold text-[var(--islamic-green)]">
                Explore Categories
              </h2>
              <p className="text-xs text-gray-500 font-medium">Curated Islamic Literature & Essentials</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close categories"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Category List */}
          <div className="overflow-y-auto p-4 space-y-2.5 pb-[calc(2rem+env(safe-area-inset-bottom))]">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  href={cat.href}
                  onClick={onClose}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF9F6] border border-gray-150 hover:border-[var(--islamic-gold)] active:scale-[0.98] transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-xl ${cat.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-headings font-bold text-sm text-gray-900 group-hover:text-[var(--islamic-green)] transition-colors truncate">
                          {cat.name}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--islamic-gold)]/15 text-[var(--islamic-gold-text)] shrink-0">
                          {cat.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5 font-light">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-[var(--islamic-gold)] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </Link>
              );
            })}

            {/* Direct Link to All Products */}
            <div className="pt-2">
              <Link
                href="/products"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-[var(--islamic-green)] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all min-h-[44px]"
              >
                Browse All 100+ Catalog Products
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

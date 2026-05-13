"use client";

import { motion } from "framer-motion";
import { Phone } from "lucide-react";

export default function WhatsAppButton() {
  const whatsappNumber = "919051085118"; // From previous context
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl flex items-center justify-center group"
      aria-label="Contact us on WhatsApp"
    >
      <div className="absolute -inset-2 bg-[#25D366]/20 rounded-full animate-ping group-hover:hidden" />
      <Phone size={24} fill="currentColor" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 font-bold text-sm">
        Chat with us
      </span>
    </motion.a>
  );
}

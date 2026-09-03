"use client";

import React, { useState } from "react";
import { MessageCircle, Mail, Bug } from "lucide-react";
import BugReportModal from "./BugReportModal";

export default function ContactSupportActions() {
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <a
          href="https://wa.me/919051085118"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp (opens in a new tab)"
          className="bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#128C7E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 transition-all flex items-center justify-center gap-2 min-h-[44px]"
        >
          <MessageCircle size={20} />
          Chat on WhatsApp
        </a>
        <a
          href="mailto:support@naazbook.in?cc=naazgroupofficial@gmail.com"
          className="bg-[var(--islamic-green)] text-white px-8 py-4 rounded-xl font-bold hover:bg-[var(--islamic-green-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--islamic-green)] focus-visible:ring-offset-2 transition-all flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Mail size={20} />
          Email Support
        </a>
        <button
          type="button"
          onClick={() => setIsBugModalOpen(true)}
          className="bg-white border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl font-bold hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-all flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
        >
          <Bug size={20} />
          Report a Bug
        </button>
      </div>

      <BugReportModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />
    </>
  );
}

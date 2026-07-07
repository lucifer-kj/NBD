"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useDonationStore } from "@/store/donation-store";

export default function SadaqahTrigger() {
  const openDonation = useDonationStore((state) => state.open);

  return (
    <button
      onClick={openDonation}
      onMouseEnter={openDonation}
      className="mt-4 w-full py-3 bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-dark)] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
    >
      <Heart size={14} className="animate-pulse heart-pulse" fill="currentColor" />
      Contribute to Sadaqah Jariyah
    </button>
  );
}

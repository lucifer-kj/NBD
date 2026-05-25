"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Info, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
  });

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem("naazbook-cookie-consent");
    if (!consent) {
      // Small timeout for elegant slide-in effect
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    } else {
      // Dispatch event for already accepted consent (so scripts load immediately)
      try {
        const parsed = JSON.parse(consent);
        window.dispatchEvent(
          new CustomEvent("naazbook-cookie-consent-updated", { detail: parsed })
        );
      } catch (e) {
        console.error("Error reading stored cookie consent:", e);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const consentData = { essential: true, analytics: true };
    localStorage.setItem("naazbook-cookie-consent", JSON.stringify(consentData));
    window.dispatchEvent(
      new CustomEvent("naazbook-cookie-consent-updated", { detail: consentData })
    );
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const consentData = { essential: true, analytics: false };
    localStorage.setItem("naazbook-cookie-consent", JSON.stringify(consentData));
    window.dispatchEvent(
      new CustomEvent("naazbook-cookie-consent-updated", { detail: consentData })
    );
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("naazbook-cookie-consent", JSON.stringify(preferences));
    window.dispatchEvent(
      new CustomEvent("naazbook-cookie-consent-updated", { detail: preferences })
    );
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom-10 duration-500">
      <div className="glass-card bg-white/90 backdrop-blur-xl border border-gray-100 p-6 shadow-2xl rounded-3xl relative overflow-hidden">
        {/* Glow Bar highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--islamic-green)] to-[var(--islamic-gold)]"></div>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--islamic-green)]/10 flex items-center justify-center text-[var(--islamic-green)] shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-headings font-bold text-gray-900 text-lg">
              Cookie & Privacy Consent
            </h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              We value your privacy. We use strictly necessary cookies for secure account authentication and cart management. Analytics cookies are only set with your explicit permission in compliance with GDPR.
            </p>
          </div>
        </div>

        {showPreferences ? (
          <div className="space-y-4 my-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">strictly Necessary</p>
                <p className="text-xs text-gray-500">Required for sign-in, account settings, and checkout.</p>
              </div>
              <div className="w-9 h-5 rounded-full bg-[var(--islamic-green)] flex items-center justify-end px-1 cursor-not-allowed opacity-80">
                <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
                  <Check size={10} className="text-[var(--islamic-green)]" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Analytics & Performance</p>
                <p className="text-xs text-gray-500">Helps us refine our catalog, book selections, and customer service.</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPreferences((p) => ({ ...p, analytics: !p.analytics }))
                }
                className={`w-9 h-5 rounded-full transition-colors flex items-center px-1 ${
                  preferences.analytics ? "bg-[var(--islamic-gold)] justify-end" : "bg-gray-300 justify-start"
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white" />
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 mt-4">
          {showPreferences ? (
            <Button
              onClick={handleSavePreferences}
              className="w-full bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-light)] text-white font-bold rounded-xl py-3 text-xs shadow-md shadow-[var(--islamic-green)]/10"
            >
              Save Cookie Preferences
            </Button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleRejectAll}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold text-xs text-gray-600 transition-colors"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-light)] font-bold text-xs text-white transition-colors shadow-md shadow-[var(--islamic-green)]/10"
              >
                Accept All Cookies
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-2 px-1">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-[var(--islamic-gold-dark)] transition-colors"
            >
              <Info size={12} /> {showPreferences ? "Back to consent options" : "Manage granular cookie preferences"} <ChevronRight size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

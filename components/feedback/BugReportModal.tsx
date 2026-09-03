"use client";

import React, { useState, useEffect } from "react";
import { Bug, X, Send, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "Checkout / Payment Issue",
  "Visual / Display Glitch",
  "Incorrect Book Info",
  "Login / Account Problem",
  "Slow Loading / Performance",
  "Other Feedback",
];

export default function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    // Construct mailto link with formatted diagnostic context
    const subject = encodeURIComponent(`[Bug Report] ${category} - Naaz Book Depot`);
    const body = encodeURIComponent(
      `Issue Category: ${category}\n` +
      `Reported From URL: ${currentUrl}\n` +
      `User Email: ${email || "Not provided"}\n` +
      `Device / User Agent: ${typeof navigator !== "undefined" ? navigator.userAgent : "N/A"}\n\n` +
      `Description:\n${description}`
    );

    // Open mail client in background
    window.open(`mailto:support@naazbook.in?cc=naazgroupofficial@gmail.com&subject=${subject}&body=${body}`, "_blank");

    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setDescription("");
    setEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 p-6 flex flex-col max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bug-report-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Bug size={20} />
            </div>
            <div>
              <h3 id="bug-report-title" className="font-headings font-bold text-lg text-gray-900">
                Report an Issue
              </h3>
              <p className="text-xs text-gray-500">Help us keep Naaz Book Depot seamless</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-[var(--islamic-green)] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} />
            </div>
            <h4 className="text-xl font-bold text-gray-900 font-headings">Report Prepared!</h4>
            <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
              JazakAllah Khair! Your bug report has been pre-formatted and opened in your email client to notify our engineering team.
            </p>
            <Button
              onClick={handleResetAndClose}
              className="mt-4 bg-[var(--islamic-green)] text-white hover:bg-[var(--islamic-green-dark)] font-bold rounded-xl h-11 px-8"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Issue Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 focus:bg-white focus:border-[var(--islamic-gold)] outline-none min-h-[44px]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                What happened? <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue, what you clicked, or what was expected..."
                className="w-full p-4 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:border-[var(--islamic-gold)] outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Your Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="In case our support team needs to follow up with you"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:border-[var(--islamic-gold)] outline-none min-h-[44px]"
              />
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
              <span>
                Current URL (<strong>{currentUrl || "Auto-detected"}</strong>) will be attached to help us locate and resolve the glitch faster.
              </span>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={!description.trim()}
                className="flex-1 bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-dark)] text-white font-bold rounded-xl h-11 min-h-[44px] gap-2 shadow-sm"
              >
                <Send size={15} />
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

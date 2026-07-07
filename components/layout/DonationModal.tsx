"use client";

import React, { useState, useEffect } from "react";
import { X, Heart, ShieldCheck, CheckCircle2, IndianRupee, Loader2, AlertCircle } from "lucide-react";
import { useDonationStore } from "@/store/donation-store";

const PRESET_AMOUNTS = [100, 250, 500, 1000, 5000];

export default function DonationModal() {
  const { isOpen, close } = useDonationStore();
  const [amount, setAmount] = useState<string>("500");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    id: string;
    amount: number;
  } | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount("500");
      setName("");
      setEmail("");
      setPhone("");
      setError(null);
      setIsSubmitting(false);
      setPaymentSuccess(false);
      setPaymentDetails(null);
    }
  }, [isOpen]);

  // Load Razorpay script dynamically
  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      setError("Please enter a valid donation amount.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Create Razorpay order on backend
      const response = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: donationAmount,
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create donation session.");
      }

      const orderData = await response.json();

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay payment gateway script. Check your internet connection.");
      }

      // 3. Open Razorpay Checkout Dialog
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Naaz Book Depot",
        description: "Sadqa-e-Jariyah - Spiritual Mission & Publishing Support",
        image: "/logo.png",
        order_id: orderData.orderId,
        prefill: {
          name: name.trim(),
          email: email.trim(),
          contact: phone.trim(),
        },
        theme: {
          color: "#2D5A4C",
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          },
        },
        handler: function (response: { razorpay_payment_id: string }) {
          setPaymentDetails({
            id: response.razorpay_payment_id,
            amount: donationAmount,
          });
          setPaymentSuccess(true);
          setIsSubmitting(false);
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (resp: { error: { description: string } }) {
        setError(resp.error.description || "Payment failed. Please try again.");
        setIsSubmitting(false);
      });
      
      rzp.open();
    } catch (err: unknown) {
      console.error("[Donation Form Error]", err);
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(errMsg);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Decorative Gold Header Ribbon */}
        <div className="h-1.5 bg-gradient-to-r from-[var(--islamic-green)] to-[var(--islamic-gold)]"></div>

        {/* Close Button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close donation modal"
        >
          <X size={20} />
        </button>

        {paymentSuccess ? (
          /* SUCCESS STATE PANEL */
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[var(--islamic-green)]/10 text-[var(--islamic-green)] flex items-center justify-center mb-6">
              <CheckCircle2 size={36} className="animate-bounce" />
            </div>
            
            <h2 className="font-headings font-bold text-2xl md:text-3xl text-[var(--islamic-green-dark)] mb-2">
              JazakAllah Khair!
            </h2>
            <p className="text-gray-500 text-sm max-w-sm mb-6 leading-relaxed">
              May Allah reward you abundantly for your generous contribution. Your support directly aids the publication and preservation of classical Islamic knowledge.
            </p>

            <div className="w-full bg-[var(--islamic-beige)] rounded-2xl p-5 border border-[var(--islamic-gold)]/15 text-left space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Donation Purpose:</span>
                <span className="text-gray-800 font-bold text-right">Sadqa-e-Jariyah</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Amount Received:</span>
                <span className="text-[var(--islamic-green)] font-extrabold flex items-center gap-0.5 text-right">
                  <IndianRupee size={14} className="inline mt-0.5" />
                  {paymentDetails?.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Transaction Reference:</span>
                <span className="text-gray-600 font-mono select-all text-right">{paymentDetails?.id}</span>
              </div>
            </div>

            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={() => {
                const text = `I just supported the printing and distribution of classical Islamic books at Naaz Book Depot (Est. 1967) as a form of Sadqa-e-Jariyah. Support the mission at: https://www.naazbook.in`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
              }}
              className="w-full mb-3 py-3.5 border border-[#25D366] hover:bg-[#25D366]/5 text-[#25D366] font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.66.986 3.296 1.48 4.905 1.481 5.482 0 9.938-4.406 9.94-9.813.001-2.614-1.013-5.074-2.86-6.92C16.828 2.057 14.368 1.04 11.758 1.04c-5.485 0-9.94 4.407-9.944 9.816-.001 1.745.483 3.447 1.398 4.91l-.995 3.637 3.84-.963zm10.985-7.466c-.083-.139-.308-.223-.646-.392-.339-.17-2.005-.99-2.316-1.102-.31-.113-.536-.17-.76.17-.225.339-.873 1.102-1.07 1.328-.198.226-.395.254-.733.085-.339-.17-1.429-.526-2.721-1.68-1.005-.897-1.683-2.005-1.88-2.34-.197-.34-.021-.523.148-.692.153-.152.339-.395.508-.593.169-.197.225-.338.338-.564.113-.226.056-.423-.028-.592-.085-.17-.76-1.832-1.041-2.51-.274-.66-.554-.57-.76-.58-.21-.01-.452-.01-.692-.01-.24 0-.63.09-1.05.546-.423.457-1.61 1.571-1.61 3.829 0 2.257 1.638 4.436 1.863 4.746.225.31 3.224 4.922 7.81 6.903 1.092.472 1.944.754 2.61.964 1.1.35 2.1.3 2.893.18.884-.132 2.721-1.11 3.102-2.128.38-1.017.38-1.89.266-2.073zm0 0"/>
              </svg>
              Share the Blessing on WhatsApp
            </button>

            <button
              onClick={close}
              className="w-full py-4 bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-dark)] text-white font-bold rounded-xl transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--islamic-green)] focus-visible:ring-offset-2 text-sm cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        ) : (
          /* FORM STATE PANEL */
          <form onSubmit={handleDonate} className="p-6 md:p-8">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--islamic-green)]/10 text-[var(--islamic-green)] flex items-center justify-center shrink-0">
                <Heart size={22} fill="currentColor" className="text-[var(--islamic-green)] heart-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h2 className="font-headings font-bold text-xl md:text-2xl text-[var(--islamic-green-dark)]">
                    Sadqa-e-Jariyah
                  </h2>
                  <span className="text-[9px] font-bold text-[#8F6826] bg-[var(--islamic-gold)]/10 border border-[var(--islamic-gold)]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Est. 1967
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-normal mt-0.5">
                  Support authentic Qur&apos;anic printing & translation distribution.
                </p>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-2.5 p-4 mb-5 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-xs leading-relaxed">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                Select Donation Amount (INR)
              </label>
              
              {/* Preset Grids */}
              <div className="grid grid-cols-5 gap-2 mb-3.5">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className={`py-2 px-1 text-xs md:text-sm font-extrabold rounded-lg border transition-all cursor-pointer ${
                      amount === val.toString()
                        ? "bg-[var(--islamic-green)] text-white border-[var(--islamic-green)] shadow-sm font-extrabold"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <IndianRupee size={16} />
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="Enter custom amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:bg-white focus:border-[var(--islamic-green)] text-gray-800 transition-colors text-sm"
                />
              </div>

              {/* Dynamic Impact Info Box */}
              {amount && (
                <div className="mt-3.5 p-3 rounded-xl bg-[var(--islamic-beige)] border border-[var(--islamic-gold)]/25 text-[11px] text-gray-600 flex items-start gap-2.5 animate-in fade-in duration-200">
                  <Heart size={14} className="text-[#8F6826] mt-0.5 shrink-0 animate-pulse heart-pulse" fill="currentColor" />
                  <span className="font-medium leading-relaxed">
                    {(() => {
                      const amt = parseFloat(amount);
                      if (isNaN(amt) || amt <= 0) return "Please enter a valid amount.";
                      if (amt === 100) return "Sponsors the printing and distribution of free translation guides.";
                      if (amt === 250) return "Prints and distributes 1 copy of the Holy Quran to Hifz students.";
                      if (amt === 500) return "Prints and distributes 2 copies of the Holy Quran to Hifz students.";
                      if (amt === 1000) return "Prints and distributes 4 copies of the Holy Quran or classic Hadith primers.";
                      if (amt === 5000) return "Sponsors a complete multi-volume set of Tafsir Ibn Kathir for a library.";
                      if (amt >= 250) {
                        const copies = Math.floor(amt / 250);
                        return `Prints and distributes approximately ${copies} copy${copies > 1 ? 'ies' : ''} of the Holy Quran to Hifz students.`;
                      }
                      return "Supports the general printing and publication of authentic Islamic books.";
                    })()}
                  </span>
                </div>
              )}
            </div>

            {/* Donor Information */}
            <div className="space-y-4 mb-8">
              <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Donor Details (Optional)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[var(--islamic-green)] text-gray-800 transition-colors text-sm font-medium"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[var(--islamic-green)] text-gray-800 transition-colors text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="WhatsApp / Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[var(--islamic-green)] text-gray-800 transition-colors text-sm font-medium"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-dark)] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--islamic-green)] focus-visible:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Connecting to Razorpay...
                </>
              ) : (
                <>
                  <Heart size={18} fill="currentColor" />
                  Complete Donation
                </>
              )}
            </button>

            {/* Trust and SSL indicators */}
            <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              <ShieldCheck size={14} className="text-gray-400 shrink-0" />
              <span>Secure Encrypted Payment via Razorpay</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

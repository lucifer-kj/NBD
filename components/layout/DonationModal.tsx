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
        handler: function (response: any) {
          setPaymentDetails({
            id: response.razorpay_payment_id,
            amount: donationAmount,
          });
          setPaymentSuccess(true);
          setIsSubmitting(false);
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        setError(resp.error.description || "Payment failed. Please try again.");
        setIsSubmitting(false);
      });
      
      rzp.open();
    } catch (err: any) {
      console.error("[Donation Form Error]", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
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

            <div className="w-full bg-[var(--islamic-beige)] rounded-2xl p-5 border border-[var(--islamic-gold)]/15 text-left space-y-3 mb-8">
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

            <button
              onClick={close}
              className="w-full py-4 bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-dark)] text-white font-bold rounded-xl transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--islamic-green)] focus-visible:ring-offset-2"
            >
              Continue Browsing
            </button>
          </div>
        ) : (
          /* FORM STATE PANEL */
          <form onSubmit={handleDonate} className="p-6 md:p-8">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--islamic-green)]/10 text-[var(--islamic-green)] flex items-center justify-center shrink-0">
                <Heart size={22} fill="currentColor" />
              </div>
              <div>
                <h2 className="font-headings font-bold text-xl md:text-2xl text-[var(--islamic-green-dark)]">
                  Sadqa-e-Jariyah
                </h2>
                <p className="text-xs text-gray-500 leading-normal">
                  Support Islamic publishing and Qur&apos;anic printing efforts.
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
                    className={`py-2 px-1 text-xs md:text-sm font-extrabold rounded-lg border transition-all ${
                      amount === val.toString()
                        ? "bg-[var(--islamic-green)] text-white border-[var(--islamic-green)] shadow-sm"
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

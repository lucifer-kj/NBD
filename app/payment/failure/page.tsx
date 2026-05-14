"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentFailurePage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-gray-50/50">
      <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-sm border border-red-100">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4 font-playfair">
          Payment Failed
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          We couldn&apos;t process your payment. Don&apos;t worry, your cart is safe and no money was deducted.
        </p>
        <div className="flex flex-col gap-3">
          <Button asChild className="w-full bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-dark)] text-white font-bold py-6 rounded-xl shadow-md text-lg">
            <Link href="/cart">Return to Cart & Try Again</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full text-gray-500 hover:text-gray-900">
            <Link href="/contact">Need Help?</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

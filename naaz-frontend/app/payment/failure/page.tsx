"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function FailureContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("error") || searchParams.get("payment_status");

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment not completed</h1>
      <p className="text-gray-600 mb-2 max-w-md">
        The payment was cancelled or declined. No charge has been completed.
      </p>
      {reason && <p className="text-sm text-gray-500 mb-8">Reference: {reason}</p>}
      <div className="flex gap-4 flex-wrap justify-center">
        <Link href="/cart" className="bg-[#C7A536] text-white font-semibold px-6 py-3 rounded-lg">
          Return to cart
        </Link>
        <Link href="/checkout" className="border border-[var(--islamic-green)] text-[var(--islamic-green)] font-semibold px-6 py-3 rounded-lg">
          Try checkout again
        </Link>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center">Loading…</div>}>
      <FailureContent />
    </Suspense>
  );
}

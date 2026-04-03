"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyPayment } from "@/lib/api-client";
import { useCartStore } from "@/store/cart-store";

function SuccessContent() {
  const searchParams = useSearchParams();
  const clearCart = useCartStore((s) => s.clearCart);
  const [status, setStatus] = useState<"loading" | "paid" | "pending" | "error">("loading");
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    const pr = searchParams.get("payment_request_id") || searchParams.get("payment_request");
    const ps = (searchParams.get("payment_status") || "").toLowerCase();

    if (!pr && ps !== "cod") {
      setStatus("error");
      return;
    }

    const run = async () => {
      try {
        if (ps === "cod" && searchParams.get("order_id")) {
          setOrderId(Number(searchParams.get("order_id")));
          clearCart();
          setStatus("paid"); // Using 'paid' template for successful COD
          return;
        }

        const v = await verifyPayment(pr!);
        setOrderId(v.order_id);
        if (v.status === "PAID" || ps === "credit") {
          clearCart();
          setStatus("paid");
        } else {
          setStatus("pending");
        }
      } catch {
        setStatus("error");
      }
    };
    run();
  }, [searchParams, clearCart]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
      {status === "loading" && (
        <div className="text-center">
          <div className="animate-pulse text-lg text-gray-600">Confirming payment…</div>
        </div>
      )}
      {status === "paid" && (
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4" aria-hidden>
            ✓
          </div>
          <h1 className="text-2xl font-bold text-[var(--islamic-green)] mb-2">Payment successful</h1>
          <p className="text-gray-600 mb-6">
            Thank you. Your order{orderId ? ` #${orderId}` : ""} is confirmed. You will receive updates by email when it ships.
          </p>
          <Link href="/account" className="inline-block bg-[#C7A536] text-white font-semibold px-6 py-3 rounded-lg">
            View orders
          </Link>
        </div>
      )}
      {status === "pending" && (
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold text-amber-800 mb-2">Payment pending</h1>
          <p className="text-gray-600 mb-6">
            We could not confirm payment yet. If money was debited, your order will update shortly. Check{" "}
            <Link href="/account" className="text-[#C7A536] underline">
              My orders
            </Link>
            .
          </p>
        </div>
      )}
      {status === "error" && (
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold text-red-700 mb-2">Could not verify payment</h1>
          <p className="text-gray-600 mb-6">Sign in and open My orders, or contact support with your payment reference.</p>
          <Link href="/account" className="text-[#C7A536] underline">
            Account
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-gray-600">Loading…</div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

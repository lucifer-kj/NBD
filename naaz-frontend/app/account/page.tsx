"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listOrders, type OrderSummary } from "@/lib/api-client";
import { useAuth } from "@/components/providers/session-provider";

const statusLabel: Record<string, string> = {
  CREATED: "Created",
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function AccountPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    listOrders()
      .then(setOrders)
      .catch(() => setErr("Could not load orders."))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <h1 className="text-xl font-bold text-[var(--islamic-green)] mb-2">Account</h1>
        <p className="text-gray-600 mb-6">Sign in to see your orders.</p>
        <p className="text-sm text-gray-500">Use Sign in in the header.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-[var(--islamic-green)] mb-6">My orders</h1>
      {loading && <p className="text-gray-600">Loading…</p>}
      {err && <p className="text-red-600 text-sm mb-4">{err}</p>}
      {!loading && orders.length === 0 && !err && (
        <p className="text-gray-600">No orders yet. Browse our books and attars to get started.</p>
      )}
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={o.id}>
            <Link
              href={`/account/orders/${o.id}`}
              className="block border border-gray-200 rounded-lg p-4 hover:border-[#C7A536] transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="font-semibold text-gray-900">Order #{o.id}</span>
                  <p className="text-sm text-gray-500">
                    {new Date(o.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[var(--islamic-green)]">
                    ₹{Number(o.final_amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">{statusLabel[o.status] || o.status}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{o.item_count} item(s)</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

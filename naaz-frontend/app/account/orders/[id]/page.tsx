"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getOrder, type OrderDetail } from "@/lib/api-client";
import { useAuth } from "@/components/providers/session-provider";

export default function OrderDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !Number.isFinite(id)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr("");
    getOrder(id)
      .then(setOrder)
      .catch(() => setErr("Order not found."))
      .finally(() => setLoading(false));
  }, [isAuthenticated, id]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <p className="text-gray-600">Sign in to view this order.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center text-gray-600">
        Loading order…
      </div>
    );
  }

  if (err || !order) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4">
        <p className="text-red-600">{err || "Order not found."}</p>
        <Link href="/account" className="text-[#C7A536] underline mt-4 inline-block">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Link href="/account" className="text-sm text-[#C7A536] mb-4 inline-block">
        ← All orders
      </Link>
      <h1 className="text-2xl font-bold text-[var(--islamic-green)] mb-2">Order #{order.id}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Placed{" "}
        {new Date(order.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
      </p>
      <div className="grid gap-2 mb-8">
        <div className="flex justify-between text-sm">
          <span>Status</span>
          <span className="font-medium">{order.status.replace(/_/g, " ")}</span>
        </div>
        {order.tracking_number && (
          <div className="flex justify-between text-sm">
            <span>Tracking</span>
            <span className="font-mono">{order.tracking_number}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold border-t pt-4 mt-2">
          <span>Total</span>
          <span>₹{Number(order.final_amount).toFixed(2)}</span>
        </div>
      </div>
      <h2 className="font-semibold mb-3">Items</h2>
      <ul className="divide-y border rounded-lg">
        {order.items.map((line) => (
          <li key={line.id} className="p-4 flex justify-between gap-4 text-sm">
            <div>
              <p className="font-medium">{line.product_name}</p>
              <p className="text-gray-500">
                {line.quantity} × ₹{Number(line.price_at_purchase).toFixed(2)}
              </p>
            </div>
            <span className="font-medium">₹{Number(line.line_total).toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

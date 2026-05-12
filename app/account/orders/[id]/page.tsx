"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/providers/session-provider";

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, isAuthenticated, isLoading } = useAuth();

  const order = useMemo(() => {
    if (!user?.orders) return null;
    return user.orders.edges.find(edge => edge.node.id.endsWith(id))?.node;
  }, [user, id]);

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center text-gray-600">
        Loading order…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <p className="text-gray-600">Sign in to view this order.</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4">
        <p className="text-red-600">Order not found.</p>
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
      <h1 className="text-2xl font-bold text-[var(--islamic-green)] mb-2">Order #{order.orderNumber}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Placed{" "}
        {new Date(order.processedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
      </p>
      <div className="grid gap-2 mb-8">
        <div className="flex justify-between text-sm">
          <span>Status</span>
          <span className="font-medium capitalize">{order.financialStatus.toLowerCase().replace(/_/g, " ")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Fulfillment</span>
          <span className="font-medium capitalize">{order.fulfillmentStatus.toLowerCase().replace(/_/g, " ")}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-4 mt-2">
          <span>Total</span>
          <span>{order.currentTotalPrice.currencyCode} {Number(order.currentTotalPrice.amount).toFixed(2)}</span>
        </div>
      </div>
      <h2 className="font-semibold mb-3">Items</h2>
      <ul className="divide-y border rounded-lg">
        {order.lineItems.edges.map((edge, index) => {
          const line = edge.node;
          return (
            <li key={index} className="p-4 flex justify-between gap-4 text-sm">
              <div>
                <p className="font-medium">{line.title}</p>
                <p className="text-gray-500">
                  Qty: {line.quantity}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

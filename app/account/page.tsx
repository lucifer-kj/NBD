"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/session-provider";
import { Order } from "@/types/shopify";

export default function AccountPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 text-center">
        <p className="text-gray-600">Loading your account...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <h1 className="text-xl font-bold text-[var(--islamic-green)] mb-2">Account</h1>
        <p className="text-gray-600 mb-6">Sign in to see your orders.</p>
        <p className="text-sm text-gray-500">Use Sign in in the header.</p>
      </div>
    );
  }

  const orders: Order[] = user.orders?.edges.map((edge) => edge.node) || [];

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--islamic-green)]">My Account</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user.firstName}!</p>
      </div>

      <h2 className="text-xl font-bold text-[var(--islamic-green)] mb-6">My orders</h2>
      
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet. Browse our books and attars to get started.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const itemCount = o.lineItems.edges.reduce((total, edge) => total + edge.node.quantity, 0);

            return (
              <li key={o.id}>
                <Link
                  href={`/account/orders/${o.id.split('/').pop()}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-[#C7A536] transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="font-semibold text-gray-900">Order #{o.orderNumber}</span>
                      <p className="text-sm text-gray-500">
                        {new Date(o.processedAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--islamic-green)]">
                        {o.currentTotalPrice.currencyCode} {o.currentTotalPrice.amount}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        {o.fulfillmentStatus.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{itemCount} item(s)</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

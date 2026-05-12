"use client";

import { ShoppingBag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

interface EmptyStateProps {
  type: "cart" | "search" | "orders";
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}

export function EmptyState({
  type,
  title,
  description,
  actionHref = "/products",
  actionLabel = "Start Shopping",
}: EmptyStateProps) {
  const config = {
    cart: {
      icon: ShoppingBag,
      title: title || "Your cart is empty",
      description: description || "Looks like you haven't added any books to your collection yet.",
    },
    search: {
      icon: Search,
      title: title || "No results found",
      description: description || "Try adjusting your filters or search terms to find what you're looking for.",
    },
    orders: {
      icon: ShoppingBag,
      title: title || "No orders yet",
      description: description || "Once you place an order, it will appear here.",
    },
  }[type];

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-[var(--charcoal)] mb-2">{config.title}</h3>
      <p className="text-gray-500 max-w-sm mb-8">{config.description}</p>
      <Link href={actionHref}>
        <Button className="bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-dark)] text-white px-8 py-6 h-auto text-lg transition-all duration-300 shadow-md hover:shadow-xl">
          {actionLabel}
        </Button>
      </Link>
    </motion.div>
  );
}

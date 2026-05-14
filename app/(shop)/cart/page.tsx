"use client";

import { useCartStore } from "@/store/cart-store";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import DiscountCodeInput from "@/components/cart/DiscountCodeInput";
import ShippingProgressBar from "@/components/cart/ShippingProgressBar";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { 
    cart, 
    removeItem, 
    updateItem, 
    clearCart, 
    isLoading,
    validateCart,
    unavailableItems,
    discountError,
    clearDiscountError
  } = useCartStore();

  const handleCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { valid } = await validateCart();
    if (valid && cart?.checkoutUrl) {
      window.location.href = cart.checkoutUrl;
    }
  };

  const lines = cart?.lines || [];
  const subtotal = cart?.cost.totalAmount || { amount: "0", currencyCode: "INR" };

  const isCheckoutDisabled = lines.length === 0 || isLoading || unavailableItems.length > 0;

  if (isLoading && !cart) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="animate-pulse text-gray-500">Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-bold mb-10 text-[var(--islamic-green)] font-playfair">Your Shopping Cart</h1>
      
      {lines.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="text-6xl mb-6 opacity-20">🛒</div>
          <p className="text-gray-500 mb-8 text-lg">Your cart is currently empty.</p>
          <Link href="/shop">
            <Button className="bg-[var(--islamic-green)] text-white rounded-full px-10 py-6 text-lg font-semibold shadow-xl hover:scale-105 transition-all">
              Discover Our Collection
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <ShippingProgressBar />
            {discountError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                <span className="font-medium">{discountError}</span>
                <button onClick={clearDiscountError} className="p-1 hover:bg-red-100 rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {lines.map((line) => {
              const isUnavailable = unavailableItems.some(item => item.id === line.id);
              return (
              <div 
                key={line.id} 
                className={`flex gap-6 items-center bg-white rounded-2xl shadow-sm p-5 border transition-all group ${
                  isUnavailable ? 'border-red-200 bg-red-50/30' : 'border-gray-100 hover:shadow-md'
                }`}
              >
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image 
                    src={line.merchandise.product.featuredImage?.url || "/placeholder.jpg"} 
                    alt={line.merchandise.product.title} 
                    fill
                    className="rounded-xl object-cover border border-gray-50"
                  />
                  {isUnavailable && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl">
                      <span className="text-xs font-black text-red-600 uppercase tracking-tighter">Sold Out</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-[var(--islamic-green)] transition-colors">
                    {line.merchandise.product.title}
                  </h3>
                  {isUnavailable ? (
                    <p className="text-red-500 font-bold text-sm mb-3 uppercase tracking-wide">
                      Currently Unavailable
                    </p>
                  ) : (
                    <p className="text-[var(--islamic-gold)] font-bold mb-3">
                      {line.merchandise.price.currencyCode} {Number(line.merchandise.price.amount).toFixed(2)}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 p-1">
                      <button 
                        onClick={() => updateItem(line.id, line.merchandise.id, line.quantity - 1)}
                        className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center transition-all disabled:opacity-30"
                        disabled={line.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-sm">{line.quantity}</span>
                      <button 
                        onClick={() => updateItem(line.id, line.merchandise.id, line.quantity + 1)}
                        className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center transition-all"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(line.id)}
                      className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors ml-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="font-bold text-gray-900">
                    {line.cost.totalAmount.currencyCode} {Number(line.cost.totalAmount.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            )})}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Order Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {subtotal.currencyCode} {Number(subtotal.amount).toFixed(2)}
                  </span>
                </div>
                {cart?.discountCodes?.some(d => d.applicable) && (
                  <div className="flex justify-between text-[var(--islamic-green)] font-medium">
                    <span>Discount applied</span>
                    <span>- {subtotal.currencyCode} {formatPrice(
                      Number(cart.cost.subtotalAmount.amount) - Number(subtotal.amount)
                    ).replace(/[^\d.-]/g, '')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-[var(--islamic-green)] font-medium">Calculated at Checkout</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-[var(--islamic-green)]">
                    {subtotal.currencyCode} {Number(subtotal.amount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <DiscountCodeInput />
              </div>

              {unavailableItems.length > 0 && (
                <p className="text-xs text-red-600 text-center mb-4 font-bold bg-red-50 p-2 rounded-lg border border-red-100">
                  ⚠️ Some items in your cart are out of stock. Please remove them to checkout.
                </p>
              )}
              <Button 
                onClick={handleCheckout}
                disabled={isCheckoutDisabled}
                className="w-full bg-[var(--islamic-green)] hover:bg-opacity-90 text-white text-lg font-bold py-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all mb-4"
              >
                {isLoading ? "Processing..." : "Proceed to Checkout"}
              </Button>
              <button 
                onClick={clearCart}
                className="w-full py-2 text-gray-400 hover:text-red-500 transition-colors text-sm font-medium"
              >
                Clear entire cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

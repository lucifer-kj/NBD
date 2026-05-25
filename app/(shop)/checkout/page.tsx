"use client";

import { useEffect, useState, useRef } from "react";
import { useCartStore } from "@/store/cart-store";
import { updateCartBuyerIdentityAction, getSessionAction } from "@/lib/shopify/actions";
import { associateCustomerWithCheckout } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { trackBeginCheckout } from "@/lib/analytics";

export default function CheckoutPage() {
  const { cart, isLoading: isCartLoading, validateCart } = useCartStore();
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (isCartLoading || !cart || hasStarted.current) return;
    
    hasStarted.current = true;
    let isMounted = true;

    const prepareAndRedirect = async () => {
      try {
        if (!cart.checkoutUrl) {
          throw new Error("No checkout URL found for this cart.");
        }

        // Track beginning of checkout
        trackBeginCheckout(cart.lines.map(line => ({
          item_id: line.merchandise.product.id,
          item_name: line.merchandise.product.title,
          price: parseFloat(line.cost.totalAmount.amount) / line.quantity,
          quantity: line.quantity
        })));

        // Final Inventory Validation before redirect
        const { valid, unavailableLines } = await validateCart();
        if (!valid) {
          const itemNames = unavailableLines.map(l => l.merchandise.product.title).join(", ");
          throw new Error(`The following items are no longer available: ${itemNames}. Please update your cart.`);
        }

        // Sync buyer identity if logged in to pre-fill address
        await updateCartBuyerIdentityAction(cart.id);

        // Associate the checkout with the authenticated customer (if logged in)
        // This pre-fills customer details and removes the "Sign In" prompt on Shopify checkout
        try {
          const session = await getSessionAction();
          if (session?.accessToken) {
            // Extract checkout ID from the checkoutUrl or use cart ID as fallback
            const checkoutId = cart.id;
            const associationResult = await associateCustomerWithCheckout(
              checkoutId,
              session.accessToken
            );
            if (!associationResult.success) {
              console.warn('Checkout customer association failed (best effort):', associationResult.errors);
            }
          }
        } catch (associationError) {
          console.warn('Checkout customer association error (best effort):', associationError);
          // Continue redirect even if association fails — it is best-effort
        }

        if (isMounted) {
          window.location.href = cart.checkoutUrl;
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error("Checkout redirection failed:", err);
          setError(err instanceof Error ? err.message : "Failed to initialize checkout. Please try again.");
        }
      }
    };

    prepareAndRedirect();

    return () => {
      isMounted = false;
    };
  }, [cart, isCartLoading, validateCart]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md bg-red-50 p-8 rounded-2xl border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Checkout Initialization Failed
          </h1>
          <p className="text-sm text-red-600 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="#" onClick={(e) => { e.preventDefault(); useCartStore.getState().openCartDrawer(); }}>Return to Cart</Link>
              </Button>
              <Button 
                onClick={() => {
                  setError(null);
                }}
                className="bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-dark)] text-white rounded-xl"
              >
                Try Again
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tip: <Link href="/account" className="text-[var(--islamic-green)] underline">Login</Link> to your account for faster checkout and pre-filled address.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If redirected from login, and we are still loading or preparing, show status
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center animate-pulse flex flex-col items-center">
        <Loader2 className="w-10 h-10 text-[var(--islamic-green)] animate-spin mb-6" />
        <h1 className="text-2xl font-bold text-[var(--islamic-green)] mb-2 font-playfair">
          Secure Checkout
        </h1>
        <p className="text-gray-600">
          Preparing your checkout...
        </p>
        <p className="text-gray-400 text-sm mt-2">Redirecting to Shopify for secure payment...</p>
      </div>
    </div>
  );
}

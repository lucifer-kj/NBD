"use client"

import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import { Drawer } from "vaul"
import Image from "next/image"
import Link from "next/link"
import { X, ShoppingCart, Trash2, Minus, Plus } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { AnimatePresence, motion } from "framer-motion";
import { cartSlideIn } from "@/lib/motion.config";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { EmptyState } from "@/components/ui/empty-state";
import { useMounted } from "@/hooks/use-mounted";
import { formatPrice } from "@/lib/utils";
import DiscountCodeInput from "./cart/DiscountCodeInput";
import ShippingProgressBar from "./cart/ShippingProgressBar";

export default function CartDrawer() {
  const { 
    cart, 
    isCartDrawerOpen, 
    closeCartDrawer, 
    openCartDrawer, 
    removeItem, 
    updateItem, 
    clearCart, 
    isLoading,
    validateCart,
    unavailableItems,
    discountError,
    clearDiscountError
  } = useCartStore()
  const reduced = useReducedMotion();
  const mounted = useMounted();

  const lines = cart?.lines || []
  const count = lines.reduce((acc, line) => acc + line.quantity, 0)
  const totalAmount = cart?.cost?.totalAmount?.amount || "0.00"


  const handleCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { valid } = await validateCart();
    if (valid && cart?.checkoutUrl) {
      window.location.href = cart.checkoutUrl;
    }
  };

  const isCheckoutDisabled = lines.length === 0 || isLoading || unavailableItems.length > 0;

  return (
    <Drawer.Root open={isCartDrawerOpen} onOpenChange={(open) => !open && closeCartDrawer()}>
      <Drawer.Trigger asChild>
        <button 
          className="relative p-2 text-white/90 hover:text-[var(--islamic-gold)] transition-colors group"
          onClick={openCartDrawer}
          aria-label="Open cart"
        >
          <ShoppingCart size={24} className="transition-transform group-hover:scale-110" />
          {mounted && count > 0 && (
            <span
              className="absolute top-0 right-0 min-w-[1.125rem] h-[1.125rem] rounded-full bg-[var(--islamic-gold)] text-[var(--islamic-green-dark)] text-[10px] leading-none flex items-center justify-center font-bold px-0.5 border border-white/20"
            >
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" onClick={closeCartDrawer} />
        <AnimatePresence>
          {isCartDrawerOpen && (
            <motion.aside
              key="cart-drawer"
              initial="hidden"
              animate="show"
              exit="exit"
              variants={reduced ? undefined : cartSlideIn}
              className="fixed top-0 right-0 w-full sm:max-w-md h-full bg-white shadow-2xl z-50 flex flex-col"
            >
              <Drawer.Title asChild>
                <VisuallyHidden>Cart</VisuallyHidden>
              </Drawer.Title>
              
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" /> 
                  Cart ({count})
                </h2>
                <Button variant="ghost" size="icon" onClick={closeCartDrawer}>
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
                {lines.length > 0 && (
                  <div className="mb-4">
                    <ShippingProgressBar />
                  </div>
                )}
                {discountError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex justify-between items-center animate-in fade-in slide-in-from-top-1">
                    <span>{discountError}</span>
                    <button onClick={clearDiscountError} className="p-1 hover:bg-red-100 rounded-full transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {isLoading && lines.length === 0 ? (
                   <div className="text-center text-gray-500 py-16">
                     <p>Loading cart...</p>
                   </div>
                ) : lines.length === 0 ? (
                  <EmptyState 
                    type="cart" 
                    actionLabel="Shop Latest Collection"
                  />
                ) : (
                  <div className="space-y-4">
                    {lines.map(line => {
                      const isUnavailable = unavailableItems.some(item => item.id === line.id);
                      return (
                      <div 
                        key={line.id} 
                        className={`flex gap-3 md:gap-4 items-start bg-white rounded-lg shadow-sm p-3 md:p-4 border transition-colors ${
                          isUnavailable ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <Image 
                            src={line.merchandise.product.featuredImage?.url || "/Images/p1.jpg"} 
                            alt={line.merchandise.product.title} 
                            width={60} 
                            height={60} 
                            className="rounded-md object-cover border" 
                          />
                          {isUnavailable && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-md">
                              <span className="text-[10px] font-bold text-red-600 uppercase">OOS</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm md:text-base mb-1 line-clamp-2">
                            <Link href={`/products/${line.merchandise.product.handle}`} className="hover:text-[var(--primary)]" onClick={closeCartDrawer}>
                              {line.merchandise.product.title}
                            </Link>
                          </div>
                          {line.merchandise.title !== 'Default Title' && (
                            <div className="text-xs text-gray-500 mb-1">
                              {line.merchandise.title}
                            </div>
                          )}
                          {isUnavailable ? (
                            <div className="text-red-600 font-bold text-xs mb-2">
                              Currently Unavailable
                            </div>
                          ) : (
                            <div className="text-[var(--islamic-green)] font-bold mb-2 text-sm md:text-base">
                              {formatPrice(line.cost.totalAmount.amount)}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => updateItem(line.id, line.merchandise.id, line.quantity - 1)} 
                              disabled={line.quantity <= 1 || isLoading}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="px-2 font-medium text-sm md:text-base min-w-[2rem] text-center">
                              {line.quantity}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => updateItem(line.id, line.merchandise.id, line.quantity + 1)} 
                              disabled={isLoading}
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeItem(line.id)}
                          disabled={isLoading}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    )})}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 md:p-6 border-t bg-white">
                <div className="mb-6">
                  <DiscountCodeInput />
                </div>

                <div className="rounded-lg border bg-gray-50 p-3 md:p-4 mb-4">
                  <div className="flex items-center justify-between text-sm md:text-base font-semibold mb-2">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                  {cart?.discountCodes?.some(d => d.applicable) && (
                    <div className="flex items-center justify-between text-sm text-[var(--islamic-green)] font-medium mb-2">
                      <span>Discount applied</span>
                      <span>- {formatPrice(
                        Number(cart.cost.subtotalAmount.amount) - Number(totalAmount)
                      )}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex items-center justify-between text-base md:text-lg font-bold mt-3 md:mt-4">
                    <span>Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {unavailableItems.length > 0 && (
                    <p className="text-xs text-red-600 text-center mb-2 font-medium">
                      Please remove out-of-stock items to proceed
                    </p>
                  )}
                  <Button 
                    onClick={handleCheckout}
                    disabled={isCheckoutDisabled} 
                    className="w-full bg-[var(--islamic-green)] hover:bg-[var(--islamic-green)]/90 text-white text-sm md:text-base font-semibold py-3 rounded-md shadow-md transition-all duration-300 hover:shadow-lg"
                  >
                    {isLoading ? "Validating..." : "Checkout on Shopify"}
                  </Button>
                  {lines.length > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={clearCart} 
                      disabled={isLoading}
                      className="w-full text-sm md:text-base"
                    >
                      Clear Cart
                    </Button>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </Drawer.Portal>
    </Drawer.Root>
  )
} 
 
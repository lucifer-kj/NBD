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
import { trackBeginCheckout } from "@/lib/analytics";
import { getProductUrl } from "@/lib/url-helper";
import { useState, useEffect } from "react";
import { getCartFillersAction } from "@/lib/shopify/actions";
import { ReshapedProduct } from "@/types/shopify";

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
    clearDiscountError,
    addItem
  } = useCartStore()
  const reduced = useReducedMotion();
  const mounted = useMounted();

  const lines = cart?.lines || []
  const count = lines.reduce((acc, line) => acc + line.quantity, 0)
  const totalAmount = cart?.cost?.totalAmount?.amount || "0.00"

  // Cart Fillers state
  const [fillers, setFillers] = useState<ReshapedProduct[]>([]);
  const [addingVariantId, setAddingVariantId] = useState<string | null>(null);

  const subtotal = cart ? Number(cart.cost.subtotalAmount.amount) : 0;
  const gap = 999 - subtotal;

  useEffect(() => {
    let active = true;
    if (gap > 0 && subtotal > 0) {
      getCartFillersAction(gap)
        .then((products) => {
          if (active) {
            setFillers(products.slice(0, 3));
          }
        })
        .catch((err) => {
          console.error("Failed to load cart fillers:", err);
        });
    } else {
      setFillers([]);
    }
    return () => {
      active = false;
    };
  }, [gap, subtotal]);

  const handleAddFiller = async (variantId: string) => {
    setAddingVariantId(variantId);
    try {
      await addItem(variantId, 1);
    } catch (err) {
      console.error("Failed to add filler:", err);
    } finally {
      setAddingVariantId(null);
    }
  };

  const handleCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { valid } = await validateCart();
    if (valid && cart?.checkoutUrl) {
      // Fire GA4 begin_checkout event
      const checkoutItems = lines.map(line => ({
        item_id: line.merchandise.id,
        item_name: line.merchandise.product.title,
        price: parseFloat(line.cost.totalAmount.amount),
        quantity: line.quantity,
      }));
      trackBeginCheckout(checkoutItems);
      
      window.location.href = cart.checkoutUrl;
    }
  };

  const isCheckoutDisabled = lines.length === 0 || isLoading || unavailableItems.length > 0;

  return (
    <Drawer.Root open={isCartDrawerOpen} onOpenChange={(open) => !open && closeCartDrawer()} direction="right">
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
        <Drawer.Overlay className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[1000] transition-opacity duration-300" onClick={closeCartDrawer} />
        <Drawer.Content className="fixed top-0 bottom-0 right-0 w-[calc(100%-48px)] sm:max-w-md md:max-w-3xl bg-white shadow-2xl z-[1010] flex flex-col border-l border-gray-100 outline-none">
          <Drawer.Title asChild>
            <VisuallyHidden>Cart</VisuallyHidden>
          </Drawer.Title>
          <Drawer.Description className="sr-only">Shopping Cart contents</Drawer.Description>
              
              {/* Header */}
              <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2.5 text-[var(--islamic-green-dark)]">
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-[var(--islamic-gold)]" /> 
                  Cart ({count})
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={closeCartDrawer}
                  className="rounded-full hover:bg-gray-100 p-2 animate-in fade-in duration-200"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6 text-gray-500 hover:text-black transition-colors" />
                </Button>
              </div>

              {/* Split Column Layout */}
              <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden bg-[#FAF9F6]">
                {/* Left Column: Products List (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 md:border-r md:border-gray-200 flex flex-col">
                  {lines.length > 0 && (
                    <div className="mb-4 animate-in fade-in duration-300">
                      <ShippingProgressBar />
                    </div>
                  )}
                  {discountError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex justify-between items-center animate-in fade-in slide-in-from-top-1">
                      <span>{discountError}</span>
                      <button onClick={clearDiscountError} className="p-1 hover:bg-red-100 rounded-full transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {isLoading && lines.length === 0 ? (
                    <div className="text-center text-gray-500 py-16 flex-1 flex flex-col justify-center items-center">
                      <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-[var(--islamic-green)] rounded-full mb-2" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                      <p>Loading cart...</p>
                    </div>
                  ) : lines.length === 0 ? (
                    <div className="flex-1 flex flex-col justify-center py-8">
                      <EmptyState 
                        type="cart" 
                        actionLabel="Shop Latest Collection"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lines.map(line => {
                        const isUnavailable = unavailableItems.some(item => item.id === line.id);
                        return (
                          <div 
                            key={line.id} 
                            className={`flex gap-3 md:gap-4 items-start bg-white rounded-xl shadow-sm p-3.5 border transition-all duration-200 hover:border-gray-300 group ${
                              isUnavailable ? 'border-red-200 bg-red-50/20' : 'border-gray-150'
                            }`}
                          >
                            <div className="relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20">
                              <Image 
                                src={line.merchandise.product.featuredImage?.url || "/Images/p1.jpg"} 
                                alt={line.merchandise.product.title} 
                                width={80}
                                height={80}
                                className="w-full h-full rounded-lg object-cover border border-gray-100 shadow-sm" 
                              />
                              {isUnavailable && (
                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg">
                                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">OOS</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm md:text-base mb-1 line-clamp-2 leading-snug">
                                <Link 
                                  href={getProductUrl(line.merchandise.product)} 
                                  className="hover:text-[var(--islamic-green)] transition-colors" 
                                  onClick={closeCartDrawer}
                                >
                                  {line.merchandise.product.title}
                                </Link>
                              </div>
                              {line.merchandise.title !== 'Default Title' && (
                                <div className="text-xs text-gray-500 mb-1 font-medium">
                                  {line.merchandise.title}
                                </div>
                              )}
                              {isUnavailable ? (
                                <div className="text-red-600 font-bold text-xs mb-2">
                                  Currently Unavailable
                                </div>
                              ) : (
                                <div className="text-[var(--islamic-green)] font-bold mb-2.5 text-sm md:text-base">
                                  {formatPrice(line.cost.totalAmount.amount)}
                                </div>
                              )}
                              
                              <div className="flex items-center bg-gray-50 rounded-lg border border-gray-250 p-0.5 w-fit">
                                <button 
                                  onClick={() => updateItem(line.id, line.merchandise.id, line.quantity - 1)} 
                                  disabled={line.quantity <= 1 || isLoading}
                                  className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-500 hover:text-black transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5 md:w-3 md:h-3" />
                                </button>
                                <span className="px-2 font-semibold text-xs md:text-sm min-w-[2.25rem] md:min-w-[1.75rem] text-center text-gray-800">
                                  {line.quantity}
                                </span>
                                <button 
                                  onClick={() => updateItem(line.id, line.merchandise.id, line.quantity + 1)} 
                                  disabled={isLoading}
                                  className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-500 hover:text-black transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3.5 h-3.5 md:w-3 md:h-3" />
                                </button>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeItem(line.id)}
                              disabled={isLoading}
                              className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all self-start -mr-2 cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )})}
                    </div>
                  )}

                  {/* Cart Fillers Suggestions */}
                  {gap > 0 && subtotal > 0 && fillers.length > 0 && (
                    <div className="mt-6 border-t border-dashed border-gray-250 pt-6 animate-in fade-in duration-500">
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-3.5 bg-[var(--islamic-green)] rounded-full"></span>
                        Complete your order for Free Shipping!
                      </h3>
                      <div className="space-y-3">
                        {fillers.map((product) => {
                          const variant = product.variants.find(v => v.availableForSale) || product.variants[0];
                          if (!variant) return null;
                          
                          const isAdding = addingVariantId === variant.id;
                          
                          return (
                            <div key={product.id} className="flex items-center justify-between bg-white border border-gray-150 rounded-xl p-3 shadow-xs hover:border-gray-300 transition-all duration-200 group">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative w-12 h-12 flex-shrink-0">
                                  <Image
                                    src={product.featuredImage?.url || "/Images/p1.jpg"}
                                    alt={product.title}
                                    width={48}
                                    height={48}
                                    className="w-full h-full rounded-lg object-cover border border-gray-100 shadow-sm"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-semibold text-gray-800 truncate leading-snug group-hover:text-[var(--islamic-green)] transition-colors">
                                    {product.title}
                                  </h4>
                                  <p className="text-xs font-bold text-[var(--islamic-green)] mt-0.5">
                                    {formatPrice(variant.price.amount)}
                                  </p>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleAddFiller(variant.id)}
                                disabled={isAdding || isLoading}
                                className="flex items-center justify-center gap-1 bg-gray-50 hover:bg-[var(--islamic-green)] text-gray-700 hover:text-white border border-gray-200 hover:border-[var(--islamic-green)] font-bold text-xs px-3 py-1.5 rounded-lg transition-all duration-205 disabled:opacity-50 cursor-pointer"
                              >
                                {isAdding ? (
                                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    Add
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Checkout Summary & Coupon Section */}
                <div className="w-full md:w-[340px] flex-shrink-0 bg-white p-5 md:p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Promo Code Input */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-semibold">
                        Promo Code
                      </h4>
                      <DiscountCodeInput />
                    </div>

                    {/* Pricing Summary Card */}
                    <div className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-4 mb-5 shadow-sm">
                      <div className="flex items-center justify-between text-sm md:text-base font-semibold mb-2 text-gray-700">
                        <span>Subtotal</span>
                        <span>{formatPrice(totalAmount)}</span>
                      </div>
                      {cart?.discountCodes?.some(d => d.applicable) && (
                        <div className="flex items-center justify-between text-sm text-[var(--islamic-green)] font-semibold mb-2">
                          <span>Discount applied</span>
                          <span>- {formatPrice(
                            Number(cart.cost.subtotalAmount.amount) - Number(totalAmount)
                          )}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 border-b border-dashed pb-3 mb-3 border-gray-200">
                        <span>Shipping</span>
                        <span>Calculated at checkout</span>
                      </div>
                      <div className="flex items-center justify-between text-base md:text-lg font-bold text-[var(--islamic-green-dark)]">
                        <span>Total</span>
                        <span>{formatPrice(totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    {unavailableItems.length > 0 && (
                      <p className="text-xs text-red-600 text-center mb-2 font-semibold animate-pulse">
                        Please remove out-of-stock items to proceed
                      </p>
                    )}
                    <Button 
                      onClick={handleCheckout}
                      disabled={isCheckoutDisabled} 
                      className="w-full bg-[var(--islamic-green)] hover:bg-[var(--islamic-green)]/90 text-white text-sm md:text-base font-bold py-3.5 rounded-xl shadow-md transition-all duration-205 hover:shadow-lg active:scale-[0.98] cursor-pointer"
                    >
                      {isLoading ? "Validating..." : "Checkout on Shopify"}
                    </Button>
                    {lines.length > 0 && (
                      <button 
                        onClick={clearCart} 
                        disabled={isLoading}
                        className="w-full text-sm md:text-base font-semibold text-gray-500 hover:text-red-500 border border-gray-200 hover:bg-red-50/30 py-2.5 rounded-xl transition-all duration-205 active:scale-[0.98] cursor-pointer"
                      >
                        Clear Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

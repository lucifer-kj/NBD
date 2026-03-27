"use client"

import { useState, useEffect } from "react"
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

export default function CartDrawer() {
  const [open, setOpen] = useState(false)
  const { items, removeItem, updateQuantity, clearCart, getTotal, getCount } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const reduced = useReducedMotion();

  useEffect(() => { setMounted(true) }, [])

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
          {mounted && getCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {getCount()}
            </span>
          )}
        </Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <AnimatePresence>
          {open && (
            <motion.aside
              key="cart-drawer"
              initial="hidden"
              animate="show"
              exit="exit"
              variants={reduced ? undefined : cartSlideIn}
              className="fixed top-0 right-0 w-full sm:max-w-md h-full bg-white shadow-2xl z-50"
            >
              <Drawer.Title asChild>
                <VisuallyHidden>Cart</VisuallyHidden>
              </Drawer.Title>
              
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" /> 
                  Cart ({getCount()})
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
                {items.length === 0 ? (
                  <div className="text-center text-gray-500 py-16">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Your cart is empty</p>
                    <p className="text-sm text-gray-400">Add some products to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-3 md:gap-4 items-start bg-white rounded-lg shadow-sm p-3 md:p-4 border">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          width={60} 
                          height={60} 
                          className="rounded-md object-cover border flex-shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm md:text-base mb-1 line-clamp-2">
                            <Link href={`/products/${item.slug}`} className="hover:text-[var(--primary)]">
                              {item.name}
                            </Link>
                          </div>
                          <div className="text-[var(--primary)] font-bold mb-2 text-sm md:text-base">
                            ₹{item.price}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="px-2 font-medium text-sm md:text-base min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                              disabled={item.quantity >= item.stock}
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeItem(item.id)}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 md:p-6 border-t bg-white">
                <div className="rounded-lg border bg-gray-50 p-3 md:p-4 mb-4">
                  <div className="flex items-center justify-between text-sm md:text-base font-semibold mb-2">
                    <span>Subtotal</span>
                    <span>₹{getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex items-center justify-between text-base md:text-lg font-bold mt-3 md:mt-4">
                    <span>Total</span>
                    <span>₹{getTotal().toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    asChild 
                    disabled={items.length === 0} 
                    className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-sm md:text-base font-semibold py-3 rounded-md shadow-md"
                  >
                    <Link href="/checkout" onClick={() => setOpen(false)}>
                      Go to Checkout
                    </Link>
                  </Button>
                  {items.length > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={clearCart} 
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
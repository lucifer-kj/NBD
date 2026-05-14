"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag, Tag, Loader2, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import Link from 'next/link';

const CartDrawer = () => {
  const { 
    cart, 
    isCartDrawerOpen: isOpen, 
    closeCartDrawer: onClose, 
    updateItem, 
    removeItem, 
    isLoading,
    applyDiscount,
    removeDiscount
  } = useCartStore();

  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const cartItems = cart?.lines || [];
  const totalAmount = cart?.cost.totalAmount.amount || 0;
  const currencyCode = cart?.cost.totalAmount.currencyCode || 'INR';

  const handleApplyDiscount = async () => {
    if (!discountCode) return;
    setIsApplyingDiscount(true);
    setDiscountError('');
    try {
      await applyDiscount(discountCode);
      setDiscountCode('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to apply discount';
      setDiscountError(message);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white z-[101] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#F8F6F3]">
          <h2 className="text-xl font-headings font-bold text-[var(--islamic-green)] flex items-center gap-2">
            <ShoppingBag size={20} />
            Your Cart
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-[var(--islamic-gold)] rounded-full hover:bg-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
              <ShoppingBag size={48} className="opacity-20" />
              <p>Your cart is empty</p>
              <button 
                onClick={onClose}
                className="text-[var(--islamic-green)] font-bold underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm group">
                  <div className="w-20 h-24 relative bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    <Image 
                      src={item.merchandise.product.featuredImage?.url || '/Images/Books.jpeg'} 
                      alt={item.merchandise.product.title} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-headings font-bold text-[var(--islamic-green)] text-sm line-clamp-2">
                          {item.merchandise.product.title}
                        </h3>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {item.merchandise.title !== 'Default Title' && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.merchandise.title}</p>
                      )}
                      <p className="text-sm font-bold mt-1 text-[var(--islamic-gold)]">
                        {currencyCode === 'INR' ? '₹' : currencyCode} {item.merchandise.price.amount}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button 
                          disabled={isLoading}
                          onClick={() => updateItem(item.id, item.merchandise.id, item.quantity - 1)}
                          className="p-1.5 text-gray-400 hover:text-[var(--islamic-green)] hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-8 text-center">{item.quantity}</span>
                        <button 
                          disabled={isLoading}
                          onClick={() => updateItem(item.id, item.merchandise.id, item.quantity + 1)}
                          className="p-1.5 text-gray-400 hover:text-[var(--islamic-green)] hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Discount Section */}
          {cartItems.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-[var(--islamic-green)] mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <Tag size={12} />
                Promo Code
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--islamic-gold)]"
                />
                <button
                  onClick={handleApplyDiscount}
                  disabled={isApplyingDiscount || !discountCode}
                  className="bg-[var(--islamic-green)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {isApplyingDiscount ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                </button>
              </div>
              {discountError && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">{discountError}</p>
              )}

              {/* Applied Discounts */}
              <div className="mt-3 space-y-2">
                {cart?.discountCodes?.map((d) => (
                  <div key={d.code} className={`flex justify-between items-center p-2 rounded-lg text-sm ${d.applicable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <div className="flex items-center gap-2">
                      <Tag size={14} />
                      <span className="font-bold">{d.code}</span>
                      {!d.applicable && <span className="text-[10px] uppercase">(Expired/Invalid)</span>}
                    </div>
                    <button 
                      onClick={() => removeDiscount()}
                      className="text-current opacity-60 hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-white space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-gray-500 text-sm">
                <span>Subtotal</span>
                <span>{currencyCode === 'INR' ? '₹' : currencyCode} {cart?.cost.subtotalAmount.amount}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-[var(--islamic-green)] pt-1">
                <span>Estimated Total</span>
                <span>{currencyCode === 'INR' ? '₹' : currencyCode} {totalAmount}</span>
              </div>
            </div>
            
            <Link 
              href={cart?.checkoutUrl || '#'}
              className="block w-full bg-[var(--islamic-gold)] text-[var(--islamic-green)] font-bold py-4 px-4 rounded-xl hover:bg-[#b89a2e] transition-all shadow-lg text-center active:scale-[0.98]"
            >
              Secure Checkout
            </Link>
            
            <p className="text-[10px] text-center text-gray-400">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;

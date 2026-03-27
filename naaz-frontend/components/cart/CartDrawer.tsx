"use client";

import React from 'react';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  // Dummy data for now until Zustand is connected
  const cartItems: CartItem[] = [];
  const totalAmount = 0;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
              <ShoppingBag size={48} className="opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-20 h-24 relative bg-gray-50 rounded-lg overflow-hidden">
                    <Image src={item.imageUrl || '/Images/Books.jpeg'} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-headings font-bold text-[var(--islamic-green)] line-clamp-1">{item.name}</h3>
                      <p className="text-sm font-bold mt-1">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="p-1 text-gray-400 hover:text-[var(--islamic-green)] border border-gray-200 rounded">
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button className="p-1 text-gray-400 hover:text-[var(--islamic-green)] border border-gray-200 rounded">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex justify-between items-center mb-4 text-lg font-bold">
              <span className="text-[var(--islamic-green)]">Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>
            <button className="w-full bg-[var(--islamic-gold)] text-[var(--islamic-green)] font-bold py-3 px-4 rounded-xl hover:bg-[#b89a2e] transition-colors shadow-md">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;

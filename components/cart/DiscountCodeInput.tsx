"use client";

import React, { useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Tag, Loader2 } from 'lucide-react';

export default function DiscountCodeInput() {
  const [code, setCode] = useState('');
  const { cart, applyDiscount, removeDiscount, isLoading, discountError, clearDiscountError } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const discountCodes = cart?.discountCodes || [];
  const activeDiscount = discountCodes.find(d => d.applicable);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || isLoading) return;

    setIsSubmitting(true);
    try {
      await applyDiscount(code.trim());
      setCode('');
    } catch (error) {
      // Error is handled in the store and surfaced via discountError
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (isLoading) return;
    await removeDiscount();
  };

  if (activeDiscount) {
    return (
      <div className="flex items-center justify-between p-3 bg-[var(--islamic-green)]/5 border border-[var(--islamic-green)]/20 rounded-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[var(--islamic-green)]" />
          <span className="font-bold text-[var(--islamic-green)] text-sm uppercase tracking-wider">
            {activeDiscount.code}
          </span>
          <span className="text-[10px] bg-[var(--islamic-green)] text-white px-1.5 py-0.5 rounded font-bold uppercase">
            Applied
          </span>
        </div>
        <button 
          onClick={handleRemove}
          disabled={isLoading}
          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors rounded-full"
          aria-label="Remove discount"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Discount code" 
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (discountError) clearDiscountError();
            }}
            className="pl-9 h-11 border-gray-200 focus:border-[var(--islamic-gold)] rounded-xl text-sm"
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          disabled={!code.trim() || isLoading}
          className="h-11 px-6 bg-[var(--islamic-green)] hover:bg-[var(--islamic-green-dark)] text-white font-bold rounded-xl shadow-sm transition-all active:scale-95"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
        </Button>
      </form>
      
      {discountError && (
        <p className="text-[11px] text-red-500 font-medium pl-1 animate-in slide-in-from-top-1">
          {discountError}
        </p>
      )}
    </div>
  );
}

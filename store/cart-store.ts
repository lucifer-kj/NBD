import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReshapedCart, CartLine } from '../types/shopify';
import { 
  createCartAction, 
  addToCartAction, 
  removeFromCartAction, 
  updateCartAction, 
  getCartAction,
  updateCartDiscountAction
} from '../lib/shopify/actions';
import { cartMutex } from '../lib/cart-mutex';
import { broadcastCartUpdate } from '../lib/cart-sync';

interface CartState {
  cart: ReshapedCart | null;
  cartId: string | null;
  isCartDrawerOpen: boolean;
  isLoading: boolean;
  /** Lines where merchandise.availableForSale is false */
  unavailableItems: CartLine[];
  /** User-facing discount error message, null when no error */
  discountError: string | null;

  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateItem: (lineId: string, merchandiseId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  initCart: () => Promise<void>;
  applyDiscount: (code: string) => Promise<void>;
  removeDiscount: () => Promise<void>;
  /** Revalidate cart against Shopify and flag unavailable items */
  validateCart: () => Promise<{ valid: boolean; unavailableLines: CartLine[] }>;
  clearDiscountError: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      cartId: null,
      isCartDrawerOpen: false,
      isLoading: false,
      unavailableItems: [],
      discountError: null,

      openCartDrawer: () => set({ isCartDrawerOpen: true }),
      closeCartDrawer: () => set({ isCartDrawerOpen: false }),
      clearDiscountError: () => set({ discountError: null }),

      addItem: async (merchandiseId: string, quantity = 1) => {
        // Mutex prevents duplicate concurrent add-to-cart calls
        await cartMutex.runExclusive(async () => {
          set({ isLoading: true });
          try {
            let cartId = get().cartId;
            
            const performAdd = async (id: string) => {
              const result = await addToCartAction(id, [{ merchandiseId, quantity }]);
              
              // Handle userErrors (e.g., Out of Stock)
              if (result.userErrors && result.userErrors.length > 0) {
                const error = result.userErrors[0];
                if (error.code === 'PRODUCT_VARIANT_OUT_OF_STOCK') {
                  throw new Error('This item is currently out of stock.');
                }
                throw new Error(error.message || 'Could not add item to cart.');
              }

              // Check if discount codes are still applicable
              const hasInvalidDiscount = result.cart.discountCodes?.some((d: { applicable: boolean }) => !d.applicable);
              if (hasInvalidDiscount) {
                set({ discountError: 'A discount code is no longer applicable after this change.' });
              }

              set({ cart: result.cart, isCartDrawerOpen: true });
            };

            try {
              if (!cartId) {
                const newCart = await createCartAction();
                cartId = newCart.id;
                set({ cartId });
              }
              await performAdd(cartId);
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              // Recovery flow for expired/deleted carts
              if (errorMessage.includes('Cart not found') || errorMessage.includes('id is invalid')) {
                const newCart = await createCartAction();
                set({ cartId: newCart.id, cart: newCart });
                await performAdd(newCart.id);
              } else {
                throw error;
              }
            }

            broadcastCartUpdate(get().cartId);
          } catch (error: unknown) {
            console.error('Error adding item to cart:', error);
          } finally {
            set({ isLoading: false });
          }
        });
      },

      removeItem: async (lineId: string) => {
        const cartId = get().cartId;
        if (!cartId) return;

        await cartMutex.runExclusive(async () => {
          set({ isLoading: true });
          try {
            const result = await removeFromCartAction(cartId, [lineId]);
            set({ cart: result.cart });
            broadcastCartUpdate(cartId);
          } catch (error) {
            console.error('Error removing item from cart:', error);
          } finally {
            set({ isLoading: false });
          }
        });
      },

      updateItem: async (lineId: string, merchandiseId: string, quantity: number) => {
        const cartId = get().cartId;
        if (!cartId) return;

        await cartMutex.runExclusive(async () => {
          set({ isLoading: true });
          try {
            if (quantity === 0) {
              const result = await removeFromCartAction(cartId, [lineId]);
              set({ cart: result.cart });
              broadcastCartUpdate(cartId);
              return;
            }

            const result = await updateCartAction(cartId, [{ id: lineId, merchandiseId, quantity }]);
            
            if (result.userErrors && result.userErrors.length > 0) {
              throw new Error(result.userErrors[0].message);
            }
            
            set({ cart: result.cart });
            broadcastCartUpdate(cartId);
          } catch (error) {
            console.error('Error updating cart item:', error);
          } finally {
            set({ isLoading: false });
          }
        });
      },

      clearCart: () => {
        set({ cart: null, cartId: null, unavailableItems: [], discountError: null });
        broadcastCartUpdate(null, 'CART_CLEARED');
      },

      initCart: async () => {
        const cartId = get().cartId;
        if (cartId) {
          try {
            const reshapedCart = await getCartAction(cartId);
            if (reshapedCart) {
              // Flag unavailable items
              const unavailable = reshapedCart.lines.filter(
                (line) => line.merchandise.availableForSale === false
              );

              // Check discount code validity on hydration
              const invalidDiscount = reshapedCart.discountCodes?.find(
                (d: { applicable: boolean; code: string }) => !d.applicable
              );
              
              set({ 
                cart: reshapedCart,
                unavailableItems: unavailable,
                discountError: invalidDiscount 
                  ? `Discount code "${invalidDiscount.code}" is no longer valid.`
                  : null,
              });
            } else {
              set({ cart: null, cartId: null, unavailableItems: [], discountError: null });
            }
          } catch (error) {
            console.error('Error hydrating cart:', error);
            set({ cart: null, cartId: null, unavailableItems: [], discountError: null });
          }
        }
      },

      validateCart: async () => {
        const cartId = get().cartId;
        if (!cartId) return { valid: true, unavailableLines: [] };

        try {
          const freshCart = await getCartAction(cartId);
          if (!freshCart) {
            set({ cart: null, cartId: null, unavailableItems: [] });
            return { valid: false, unavailableLines: [] };
          }

          const unavailable = freshCart.lines.filter(
            (line) => line.merchandise.availableForSale === false
          );

          set({ cart: freshCart, unavailableItems: unavailable });

          return {
            valid: unavailable.length === 0,
            unavailableLines: unavailable,
          };
        } catch (error) {
          console.error('Error validating cart:', error);
          return { valid: false, unavailableLines: [] };
        }
      },
      
      applyDiscount: async (code: string) => {
        const cartId = get().cartId;
        if (!cartId) return;

        await cartMutex.runExclusive(async () => {
          set({ isLoading: true, discountError: null });
          try {
            const result = await updateCartDiscountAction(cartId, [code]);
            
            // Check if it was applied
            const isApplied = result.cart.discountCodes?.some(
              (d: { code: string; applicable: boolean }) => 
                d.code.toUpperCase() === code.toUpperCase() && d.applicable
            );
            if (!isApplied) {
              set({ discountError: 'This discount code is invalid or not applicable.' });
              throw new Error('This discount code is invalid or not applicable.');
            }

            set({ cart: result.cart });
            broadcastCartUpdate(cartId);
          } catch (error: unknown) {
            console.error('Error applying discount:', error);
            throw error;
          } finally {
            set({ isLoading: false });
          }
        });
      },

      removeDiscount: async () => {
        const cartId = get().cartId;
        if (!cartId) return;

        await cartMutex.runExclusive(async () => {
          set({ isLoading: true, discountError: null });
          try {
            const result = await updateCartDiscountAction(cartId, []);
            set({ cart: result.cart });
            broadcastCartUpdate(cartId);
          } catch (error) {
            console.error('Error removing discount:', error);
          } finally {
            set({ isLoading: false });
          }
        });
      }
    }),
    {
      name: 'naaz-shopify-cart',
      partialize: (state) => ({ cartId: state.cartId }), // Only persist the cartId
    }
  )
);
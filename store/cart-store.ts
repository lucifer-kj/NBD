import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReshapedCart } from '../types/shopify';
import { 
  createCartAction, 
  addToCartAction, 
  removeFromCartAction, 
  updateCartAction, 
  getCartAction,
  updateCartDiscountAction
} from '../lib/shopify/actions';

interface CartState {
  cart: ReshapedCart | null;
  cartId: string | null;
  isCartDrawerOpen: boolean;
  isLoading: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateItem: (lineId: string, merchandiseId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  initCart: () => Promise<void>;
  applyDiscount: (code: string) => Promise<void>;
  removeDiscount: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      cartId: null,
      isCartDrawerOpen: false,
      isLoading: false,

      openCartDrawer: () => set({ isCartDrawerOpen: true }),
      closeCartDrawer: () => set({ isCartDrawerOpen: false }),

      addItem: async (merchandiseId: string, quantity = 1) => {
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
            const hasInvalidDiscount = result.cart.discountCodes?.some(d => !d.applicable);
            if (hasInvalidDiscount) {
              console.warn('One or more discount codes are no longer applicable.');
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
          } catch (error: any) {
            // Recovery flow for expired/deleted carts
            if (error.message?.includes('Cart not found') || error.message?.includes('id is invalid')) {
              const newCart = await createCartAction();
              set({ cartId: newCart.id, cart: newCart });
              await performAdd(newCart.id);
            } else {
              throw error;
            }
          }
        } catch (error: any) {
          console.error('Error adding item to cart:', error);
          // Here you could set an error state to be consumed by components
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (lineId: string) => {
        const cartId = get().cartId;
        if (!cartId) return;

        set({ isLoading: true });
        try {
          const result = await removeFromCartAction(cartId, [lineId]);
          set({ cart: result.cart });
        } catch (error) {
          console.error('Error removing item from cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateItem: async (lineId: string, merchandiseId: string, quantity: number) => {
        const cartId = get().cartId;
        if (!cartId) return;

        set({ isLoading: true });
        try {
          if (quantity === 0) {
            const result = await removeFromCartAction(cartId, [lineId]);
            set({ cart: result.cart });
            return;
          }

          const result = await updateCartAction(cartId, [{ id: lineId, merchandiseId, quantity }]);
          
          if (result.userErrors && result.userErrors.length > 0) {
            throw new Error(result.userErrors[0].message);
          }
          
          set({ cart: result.cart });
        } catch (error) {
          console.error('Error updating cart item:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => {
        set({ cart: null, cartId: null });
      },

      initCart: async () => {
        const cartId = get().cartId;
        if (cartId) {
          try {
            const reshapedCart = await getCartAction(cartId);
            if (reshapedCart) {
               // Check discount code validity on hydration
               const hasInvalidDiscount = reshapedCart.discountCodes?.some(d => !d.applicable);
               if (hasInvalidDiscount) {
                 console.warn('Stale discount codes detected in cart.');
               }
               set({ cart: reshapedCart });
            } else {
              set({ cart: null, cartId: null });
            }
          } catch (error) {
            console.error('Error hydrating cart:', error);
            set({ cart: null, cartId: null });
          }
        }
      },
      
      applyDiscount: async (code: string) => {
        const cartId = get().cartId;
        if (!cartId) return;

        set({ isLoading: true });
        try {
          const result = await updateCartDiscountAction(cartId, [code]);
          
          // Check if it was applied
          const isApplied = result.cart.discountCodes?.some(d => d.code.toUpperCase() === code.toUpperCase() && d.applicable);
          if (!isApplied) {
             throw new Error('This discount code is invalid or not applicable.');
          }

          set({ cart: result.cart });
        } catch (error: any) {
          console.error('Error applying discount:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      removeDiscount: async () => {
        const cartId = get().cartId;
        if (!cartId) return;

        set({ isLoading: true });
        try {
          const result = await updateCartDiscountAction(cartId, []);
          set({ cart: result.cart });
        } catch (error) {
          console.error('Error removing discount:', error);
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'naaz-shopify-cart',
      partialize: (state) => ({ cartId: state.cartId }), // Only persist the cartId
    }
  )
);
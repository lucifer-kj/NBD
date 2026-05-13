import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReshapedCart } from '../types/shopify';
import { 
  createCartAction, 
  addToCartAction, 
  removeFromCartAction, 
  updateCartAction, 
  getCartAction 
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
          let cart: ReshapedCart;

          if (!cartId) {
            cart = await createCartAction();
            cartId = cart.id;
            set({ cartId });
          }

          const updatedCart = await addToCartAction(cartId, [{ merchandiseId, quantity }]);
          set({ cart: updatedCart, isCartDrawerOpen: true });
        } catch (error) {
          console.error('Error adding item to cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (lineId: string) => {
        const cartId = get().cartId;
        if (!cartId) return;

        set({ isLoading: true });
        try {
          const updatedCart = await removeFromCartAction(cartId, [lineId]);
          set({ cart: updatedCart });
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
            const updatedCart = await removeFromCartAction(cartId, [lineId]);
            set({ cart: updatedCart });
            return;
          }

          const updatedCart = await updateCartAction(cartId, [{ id: lineId, merchandiseId, quantity }]);
          set({ cart: updatedCart });
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
               set({ cart: reshapedCart });
            } else {
              set({ cart: null, cartId: null });
            }
          } catch (error) {
            console.error('Error hydrating cart:', error);
            set({ cart: null, cartId: null });
          }
        }
      }
    }),
    {
      name: 'naaz-shopify-cart',
      partialize: (state) => ({ cartId: state.cartId }), // Only persist the cartId
    }
  )
);
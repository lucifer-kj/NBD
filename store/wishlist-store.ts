import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistState {
  items: string[];
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
  setItems: (ids: string[]) => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (id) => set((state) => ({ 
        items: state.items.includes(id) ? state.items : [...state.items, id] 
      })),
      removeItem: (id) => set((state) => ({ 
        items: state.items.filter((itemId) => itemId !== id) 
      })),
      toggleItem: (id) => {
        const { items } = get();
        if (items.includes(id)) {
          get().removeItem(id);
        } else {
          get().addItem(id);
        }
      },
      setItems: (ids) => set({ items: ids }),
      isInWishlist: (id) => get().items.includes(id),
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

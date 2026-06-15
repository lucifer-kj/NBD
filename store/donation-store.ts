import { create } from 'zustand';

interface DonationState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useDonationStore = create<DonationState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

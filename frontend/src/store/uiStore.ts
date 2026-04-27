import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  compactMode: boolean;
  setCompactMode: (compact: boolean) => void;
  toggleCompactMode: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      compactMode: false,
      setCompactMode: (compact) => set({ compactMode: compact }),
      toggleCompactMode: () => set((state) => ({ compactMode: !state.compactMode })),
    }),
    {
      name: 'petrosafe-ui-storage',
    }
  )
);

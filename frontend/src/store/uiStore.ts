import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  compactMode: boolean;
  themeMode: 'light' | 'dark';
  setCompactMode: (compact: boolean) => void;
  toggleCompactMode: () => void;
  toggleThemeMode: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      compactMode: false,
      themeMode: 'dark', // default to dark
      setCompactMode: (compact) => set({ compactMode: compact }),
      toggleCompactMode: () => set((state) => ({ compactMode: !state.compactMode })),
      toggleThemeMode: () => set((state) => ({ themeMode: state.themeMode === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'petrosafe-ui-storage',
    }
  )
);

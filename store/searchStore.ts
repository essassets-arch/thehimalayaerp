import { create } from 'zustand';

export const useSearchStore = create((set) => ({
  globalSearch: '',
  setGlobalSearch: (globalSearch: string) => set({ globalSearch })
}));

import { create } from 'zustand';

export const useBadgeStore = create((set) => ({
  badges: {},
  setBadge: (key: string, count: number, priority: string = 'low') => set((state: any) => ({
    badges: { ...state.badges, [key]: { count, priority } }
  }))
}));

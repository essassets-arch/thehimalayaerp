import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = string | null;

interface AuthState {
  user: any;
  role: UserRole;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (role: UserRole, user: any, accessToken: string) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      accessToken: null,
      login: (role, user, accessToken) => set({ role, user, accessToken, isAuthenticated: true }),
      setAccessToken: (token) => set({ accessToken: token, isAuthenticated: !!token }),
      logout: () => set({ role: null, user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        // We DO NOT persist accessToken or isAuthenticated (since auth requires the token in memory)
      }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'Sales' | 'Plant Head' | 'Production' | 'Store' | 'QC' | 'Dispatch' | 'Finance' | 'Finance Executive' | 'HR' | 'Admin' | 'Super Admin' | null;

interface AuthState {
  user: any;
  role: UserRole;
  isAuthenticated: boolean;
  login: (role: UserRole, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      login: (role, user) => set({ role, user, isAuthenticated: true }),
      logout: () => set({ role: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

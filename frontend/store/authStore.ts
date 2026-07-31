import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

type UserRole = string | null;

type AuthUser = {
  role?: string;
  [key: string]: unknown;
};

interface AuthState {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (role: UserRole, user: AuthUser, accessToken: string) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    const value = window.localStorage.getItem(name);
    if (!value?.trim()) {
      if (value !== null) window.localStorage.removeItem(name);
      return null;
    }

    try {
      JSON.parse(value);
      return value;
    } catch {
      console.warn(`[authStore] Removed invalid persisted state from "${name}".`);
      window.localStorage.removeItem(name);
      return null;
    }
  },
  setItem: (name, value) => window.localStorage.setItem(name, value),
  removeItem: (name) => window.localStorage.removeItem(name),
};

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
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

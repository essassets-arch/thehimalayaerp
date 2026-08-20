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
      login: (role, user, accessToken) => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('token', accessToken);
          sessionStorage.setItem('himalaya_token', accessToken);
          sessionStorage.setItem('erpUser', JSON.stringify(user));
          localStorage.setItem('token', accessToken);
          localStorage.setItem('himalaya_token', accessToken);
        }
        set({ role, user, accessToken, isAuthenticated: true });
      },
      setAccessToken: (token) => {
        if (typeof window !== 'undefined') {
          if (token) {
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('himalaya_token', token);
            localStorage.setItem('token', token);
            localStorage.setItem('himalaya_token', token);
          } else {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('himalaya_token');
            localStorage.removeItem('token');
            localStorage.removeItem('himalaya_token');
          }
        }
        set({ accessToken: token, isAuthenticated: !!token });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          try {
            // Deactivate FCM token on logout
            try {
              const { deactivateFCMToken } = require('@/shared/firebase/messaging');
              deactivateFCMToken().catch((e: any) => console.warn('[authStore] Failed to deactivate FCM token:', e));
            } catch (err) {
              console.warn('[authStore] Could not load FCM messaging module for deactivation:', err);
            }

            sessionStorage.clear();
            localStorage.removeItem('token');
            localStorage.removeItem('himalaya_token');
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('sales-store');
            localStorage.removeItem('supersales-store');
            localStorage.removeItem('sales-dashboard-cache');
            localStorage.removeItem('current-sales-user');
            localStorage.removeItem('himalaya-erp-store');
            document.cookie.split(';').forEach((c) => {
              const name = c.split('=')[0].trim();
              if (name) {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
              }
            });
            window.dispatchEvent(new CustomEvent('auth:logout'));
          } catch (e) {
            console.warn('[authStore] Error clearing storage on logout', e);
          }
        }
        set({ role: null, user: null, accessToken: null, isAuthenticated: false });
      },
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

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

function getInitialAuthState(): { user: AuthUser | null; role: UserRole; isAuthenticated: boolean; accessToken: string | null } {
  if (typeof window === 'undefined') {
    return { user: null, role: null, isAuthenticated: false, accessToken: null };
  }
  try {
    const rawAuth = window.localStorage.getItem('auth-storage');
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth);
      const state = parsed?.state;
      if (state?.accessToken && !state.accessToken.startsWith('demo-token-')) {
        return {
          user: state.user || null,
          role: state.role || null,
          isAuthenticated: true,
          accessToken: state.accessToken,
        };
      }
    }

    // Secondary check: token + erpUser
    const fallbackToken = window.localStorage.getItem('token') || window.localStorage.getItem('himalaya_token');
    const rawUser = window.localStorage.getItem('erpUser') || window.sessionStorage.getItem('erpUser');
    if (fallbackToken && !fallbackToken.startsWith('demo-token-')) {
      const parsedUser = rawUser ? JSON.parse(rawUser) : null;
      return {
        user: parsedUser,
        role: parsedUser?.role || null,
        isAuthenticated: true,
        accessToken: fallbackToken,
      };
    }
  } catch {}
  return { user: null, role: null, isAuthenticated: false, accessToken: null };
}

const initialState = getInitialAuthState();

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: initialState.user,
      role: initialState.role,
      isAuthenticated: initialState.isAuthenticated,
      accessToken: initialState.accessToken,
      login: (role, user, accessToken) => {
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('token', accessToken);
            sessionStorage.setItem('himalaya_token', accessToken);
            sessionStorage.setItem('erpUser', JSON.stringify(user));
            localStorage.setItem('token', accessToken);
            localStorage.setItem('himalaya_token', accessToken);
            localStorage.setItem('erpUser', JSON.stringify(user));

            // Sync cookies for server/middleware/proxy route accessibility
            const maxAge = 7 * 24 * 60 * 60; // 7 days
            document.cookie = `accessToken=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
            document.cookie = `token=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
            document.cookie = `himalaya_token=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
            if (role) {
              const roleStr = typeof role === 'object' ? (role as any)?.code || (role as any)?.role || '' : String(role);
              document.cookie = `role=${encodeURIComponent(roleStr)}; path=/; max-age=${maxAge}; SameSite=Lax`;
            }
          } catch (e) {
            console.warn('[authStore] Error saving session to storage/cookies', e);
          }
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
            const maxAge = 7 * 24 * 60 * 60;
            document.cookie = `accessToken=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
            document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
            document.cookie = `himalaya_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
          } else {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('himalaya_token');
            localStorage.removeItem('token');
            localStorage.removeItem('himalaya_token');
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax';
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax';
            document.cookie = 'himalaya_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax';
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
            localStorage.removeItem('erpUser');
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('sales-store');
            localStorage.removeItem('supersales-store');
            localStorage.removeItem('sales-dashboard-cache');
            localStorage.removeItem('current-sales-user');
            localStorage.removeItem('himalaya-erp-store');
            localStorage.removeItem('companyId');
            localStorage.removeItem('workspaceId');

            // Expire all auth-related cookies across both root path and auth paths
            const cookieNames = ['accessToken', 'token', 'himalaya_token', 'refreshToken', 'role', 'erpUser'];
            cookieNames.forEach((name) => {
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/auth/refresh;SameSite=Lax`;
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};SameSite=Lax`;
            });
            document.cookie.split(';').forEach((c) => {
              const name = c.split('=')[0].trim();
              if (name) {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};SameSite=Lax`;
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

'use client';

/**
 * AuthGuard
 * ─────────────────────────────────────────────────────────
 * Wraps all dashboard routes. On mount:
 *  1. If an accessToken is in memory → allow render.
 *  2. If no accessToken but user was previously logged in (persisted) →
 *     attempt silent refresh via /api/backend/auth/refresh.
 *  3. If refresh fails → redirect to /login.
 *
 * Also enforces basic role-based route access.
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/** 
 * Maps route prefixes → roles that are allowed.
 * Empty array means any authenticated user can access.
 */
const ROUTE_ROLE_MAP: Record<string, string[]> = {
  'super-admin':    ['Super Admin'],
  'admin':          ['Admin', 'Super Admin'],
  'sales':          ['Sales', 'Sales Admin', 'Super Admin'],
  'plant-head':     ['Plant Head', 'Super Admin'],
  'production':     ['Production', 'Plant Head', 'Super Admin'],
  'store':          ['Store', 'Plant Head', 'Super Admin'],
  'qc':             ['QC', 'Plant Head', 'Super Admin'],
  'dispatch':       ['Dispatch', 'Super Admin'],
  'finance-executive': ['Finance Executive', 'Finance', 'Super Admin'],
  'finance':        ['Finance', 'Finance Executive', 'Super Admin'],
  'hr':             ['HR', 'Super Admin'],
};

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, user, role, setAccessToken, logout } = useAuthStore();
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    let cancelled = false;

    async function check() {
      // Case 1: Token in memory — validate role access
      if (accessToken) {
        if (!cancelled) setStatus('allowed');
        return;
      }

      // Case 2: User was persisted but no token (e.g., page refresh) — try silent refresh
      if (user) {
        try {
          const res = await fetch('/api/backend/auth/refresh', { method: 'POST' });
          if (res.ok) {
            const json = await res.json();
            const newToken = json.data?.accessToken;
            if (newToken) {
              setAccessToken(newToken);
              if (!cancelled) setStatus('allowed');
              return;
            }
          }
        } catch {
          // Network error — fall through to redirect
        }
      }

      // Case 3: No token, no refresh → send to login
      logout();
      router.replace('/login');
      if (!cancelled) setStatus('denied');
    }

    check();
    return () => { cancelled = true; };
    // Re-check when accessToken changes (e.g., after logout)
  }, [accessToken]);

  // Role-based access control check (once allowed)
  useEffect(() => {
    if (status !== 'allowed' || !pathname) return;

    const pathSegment = pathname.split('/').filter(Boolean)[0];
    const allowedRoles = ROUTE_ROLE_MAP[pathSegment];

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = role || user?.role;
      if (userRole && !allowedRoles.includes(userRole)) {
        // Redirect to their default dashboard
        const defaultPath = getDefaultPath(userRole);
        router.replace(defaultPath);
      }
    }
  }, [status, pathname, role, user]);

  if (status === 'checking') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0D1B2A',
        color: '#94A3B8',
        fontFamily: "'Outfit', sans-serif",
        fontSize: '14px',
        gap: '12px',
        flexDirection: 'column',
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: '3px solid rgba(59,174,235,0.2)',
          borderTopColor: '#3BAEEB',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Authenticating…
      </div>
    );
  }

  if (status === 'denied') return null;

  return <>{children}</>;
}

function getDefaultPath(role: string): string {
  const map: Record<string, string> = {
    'Sales': '/sales/dashboard',
    'Sales Admin': '/sales/dashboard',
    'Plant Head': '/plant-head/dashboard',
    'Production': '/production/dashboard',
    'Store': '/store/dashboard',
    'QC': '/qc/dashboard',
    'Dispatch': '/dispatch/dashboard',
    'Finance': '/finance/dashboard',
    'Finance Executive': '/finance-executive/dashboard',
    'HR': '/hr/dashboard',
    'Admin': '/admin/dashboard',
    'Super Admin': '/super-admin/dashboard',
  };
  return map[role] || '/sales/dashboard';
}

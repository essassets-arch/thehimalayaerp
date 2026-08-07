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
  'super-admin':    ['Super Admin', 'SUPER_ADMIN'],
  'admin':          ['Admin', 'Super Admin', 'ADMIN', 'SUPER_ADMIN'],
  'sales':          ['Sales', 'Sales Admin', 'Sales Executive', 'Sales Manager', 'Super Admin', 'SALES', 'SALES_EXECUTIVE', 'SALES_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  'plant-head':     ['Plant Head', 'Super Admin', 'PLANT_HEAD', 'ADMIN', 'SUPER_ADMIN'],
  'production':     ['Production', 'Production Planner', 'Production Operator', 'Plant Head', 'Super Admin', 'PRODUCTION', 'PRODUCTION_PLANNER', 'PRODUCTION_OPERATOR', 'ADMIN', 'SUPER_ADMIN'],
  'store':          ['Store', 'Store Manager', 'Plant Head', 'Super Admin', 'STORE', 'STORE_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  'qc':             ['QC', 'Plant Head', 'Super Admin', 'QC_INSPECTOR', 'ADMIN', 'SUPER_ADMIN'],
  'dispatch':       ['Dispatch', 'Super Admin', 'Plant Head', 'Production Manager', 'Production Planner', 'Production Operator', 'Production', 'QC', 'Dispatch Executive', 'DISPATCH_EXECUTIVE', 'ADMIN', 'SUPER_ADMIN'],
  'finance-executive': ['Finance Executive', 'FINANCE_EXECUTIVE', 'Finance Manager', 'Finance Lead', 'FINANCE_MANAGER', 'FINANCE_LEAD', 'Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN'],
  'finance':        ['Finance', 'Finance Manager', 'Finance Lead', 'FINANCE', 'FINANCE_MANAGER', 'FINANCE_LEAD', 'Super Admin', 'Admin', 'SUPER_ADMIN', 'ADMIN'],
  'hr':             ['HR', 'Super Admin', 'ADMIN', 'SUPER_ADMIN'],
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
      // Purge any stale/demo tokens
      if (accessToken?.startsWith('demo-token-')) {
        logout();
        router.replace('/login');
        if (!cancelled) setStatus('denied');
        return;
      }

      // Case 1: Token in memory & not a demo token — allow render
      if (accessToken && !accessToken.startsWith('demo-token-')) {
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
            if (newToken && !newToken.startsWith('demo-token-')) {
              setAccessToken(newToken);
              if (!cancelled) setStatus('allowed');
              return;
            }
          }
        } catch {
          // Network error — fall through to redirect
        }
      }

      // Case 3: No valid JWT token, no refresh → force redirect to login
      logout();
      if (!cancelled) setStatus('denied');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      } else {
        router.replace('/login');
      }
    }

    check();
    return () => { cancelled = true; };
  }, [accessToken, user]);

  // Listen to global 401 unauthorized event from API interceptors
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      setStatus('denied');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      } else {
        router.replace('/login');
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout, router]);

function getUserRoleName(rawRole: any): string {
  if (!rawRole) return '';
  if (typeof rawRole === 'string') return rawRole;
  if (typeof rawRole === 'object') {
    if (rawRole.name) return String(rawRole.name);
    if (rawRole.code) {
      const codeMap: Record<string, string> = {
        SUPER_ADMIN: 'Super Admin',
        ADMIN: 'Admin',
        SALES_EXECUTIVE: 'Sales Executive',
        SALES_MANAGER: 'Sales Manager',
        PLANT_HEAD: 'Plant Head',
        PRODUCTION_PLANNER: 'Production Planner',
        PRODUCTION_OPERATOR: 'Production Operator',
        QC_INSPECTOR: 'QC Inspector',
        DISPATCH_EXECUTIVE: 'Dispatch Executive',
        FINANCE_EXECUTIVE: 'Finance Executive',
        FINANCE_MANAGER: 'Finance Manager',
        STORE_MANAGER: 'Store Manager',
        HR: 'HR',
      };
      if (codeMap[rawRole.code]) return codeMap[rawRole.code];
    }
  }
  return String(rawRole);
}

  // Role-based access control check (once allowed)
  useEffect(() => {
    if (status !== 'allowed' || !pathname) return;

    const pathSegment = pathname.split('/').filter(Boolean)[0];
    const allowedRoles = ROUTE_ROLE_MAP[pathSegment];

    if (allowedRoles && allowedRoles.length > 0) {
      const activeRoleName = getUserRoleName(role || user?.role);
      
      // Super Admin and Admin bypass route checks
      if (activeRoleName === 'Super Admin' || activeRoleName === 'Admin') {
        return;
      }

      if (!activeRoleName || !allowedRoles.includes(activeRoleName)) {
        // Block render & redirect to role default path
        const defaultPath = getDefaultPath(activeRoleName);
        if (typeof window !== 'undefined') {
          import('sonner').then(({ toast }) => {
            toast.error('Access Denied: You do not have permission to view this module.');
          });
        }
        router.replace(defaultPath);
      }
    }
  }, [status, pathname, role, user, router]);

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
    'Sales Executive': '/sales/dashboard',
    'Sales Manager': '/sales/dashboard',
    'Plant Head': '/plant-head/dashboard',
    'Production': '/production/dashboard',
    'Production Planner': '/production/dashboard',
    'Production Operator': '/production/dashboard',
    'Store': '/store/dashboard',
    'Store Manager': '/store/dashboard',
    'QC': '/qc/dashboard',
    'QC Inspector': '/qc/dashboard',
    'Dispatch': '/dispatch/dashboard',
    'Dispatch Executive': '/dispatch/dashboard',
    'Finance': '/finance/dashboard',
    'Finance Executive': '/finance-executive/dashboard',
    'Finance Manager': '/finance/dashboard',
    'HR': '/hr/dashboard',
    'Admin': '/admin/dashboard',
    'Super Admin': '/super-admin/dashboard',
  };
  return map[role] || '/sales/dashboard';
}

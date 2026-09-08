'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

function getDefaultPath(role: string): string {
  const map: Record<string, string> = {
    'Sales': '/sales/dashboard',
    'Sales Admin': '/sales/dashboard',
    'Sales Executive': '/sales/dashboard',
    'Sales Manager': '/sales/dashboard',
    'SuperSales': '/supersales/dashboard',
    'SuperSales 1': '/supersales/dashboard',
    'SuperSales 2': '/supersales/dashboard',
    'SUPER_SALES': '/supersales/dashboard',
    'Plant Head': '/plant-head/dashboard',
    'Production': '/production/dashboard',
    'Production Planner': '/production/dashboard',
    'Production Operator': '/production/dashboard',
    'Store': '/store/dashboard',
    'Store Manager': '/store/dashboard',
    'QC': '/qc/dashboard',
    'QC Inspector': '/qc/dashboard',
    'Dispatch': '/dispatch/dashboard',
    'Dispatch 1': '/dispatch/dashboard',
    'Dispatch Executive': '/dispatch/dashboard',
    'DISPATCH_EXECUTIVE': '/dispatch/dashboard',
    'Dispatch 2': '/dispatch-2/dashboard',
    'DISPATCH_2': '/dispatch-2/dashboard',
    'Finance': '/finance/dashboard',
    'Finance Executive': '/finance-executive/dashboard',
    'Finance Manager': '/finance/dashboard',
    'HR': '/hr/dashboard',
    'Back Office': '/back-office/daily-report',
    'BACK_OFFICE': '/back-office/daily-report',
    'Admin': '/super-admin/dashboard',
    'Super Admin': '/super-admin/dashboard',
    'SUPER_ADMIN': '/super-admin/dashboard',
  };
  return map[role] || '/sales/dashboard';
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, role, accessToken } = useAuthStore();

  useEffect(() => {
    const effectiveToken =
      accessToken ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('token') ||
          localStorage.getItem('himalaya_token') ||
          sessionStorage.getItem('token')
        : null);

    const effectiveUser =
      user ||
      (typeof window !== 'undefined'
        ? (() => {
            try {
              const raw =
                localStorage.getItem('erpUser') ||
                sessionStorage.getItem('erpUser');
              return raw ? JSON.parse(raw) : null;
            } catch {
              return null;
            }
          })()
        : null);

    if (
      effectiveToken &&
      !effectiveToken.startsWith('demo-token-') &&
      (isAuthenticated || effectiveUser)
    ) {
      const targetRole = (effectiveUser?.role || role || '') as string;
      router.replace(getDefaultPath(targetRole));
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, accessToken, user, role, router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#EFF6FF',
        fontFamily: "'Outfit', sans-serif",
        gap: '12px',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid #3B82F6',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ color: '#1E293B', fontWeight: 600, fontSize: '14px' }}>
        Loading Himalaya Cloud…
      </span>
    </div>
  );
}

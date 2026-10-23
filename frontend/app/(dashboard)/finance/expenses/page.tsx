'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import AccessDenied from '@/components/AccessDenied';
import FinanceExpensesWorkspace from '../../../../modules/finance/pages/FinanceExpensesWorkspace';

export default function FinanceExpensesPage() {
  const user = useAuthStore((s: any) => s.user);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        Loading Finance Expense Workspace...
      </div>
    );
  }

  // Access check: Finance Manager, Super Admin, Admin, and authorized Finance roles
  const rawRole = typeof user?.role === 'object' ? user?.role?.code || user?.role?.name : user?.role;
  const normalizedRole = String(rawRole || '').toUpperCase();

  const isAuthorized =
    normalizedRole.includes('SUPER_ADMIN') ||
    normalizedRole.includes('ADMIN') ||
    normalizedRole.includes('FINANCE');

  if (!isAuthorized) {
    return (
      <AccessDenied
        requiredRole="Finance Manager"
        message="Access to the Finance Expense module is restricted to authorized Finance Department members and Super Admin."
      />
    );
  }

  return <FinanceExpensesWorkspace />;
}

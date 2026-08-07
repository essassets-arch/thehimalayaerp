'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import FinancePortal from '../../../../modules/finance/pages/FinancePortal';
import AccessDenied from '@/components/AccessDenied';

const RESTRICTED_FOR_EXECUTIVE = [
  'salary',
  'salary-disbursement',
  'salary-history',
  'salary-verification',
  'po-requests',
  'pending-requests',
  'create-po',
  'all-pos',
  'verify-close',
  'vendors',
  'expenses',
  'settings',
  'ledger',
  'reports',
  'accounts'
];

export default function Page() {
  const user = useAuthStore((s: any) => s.user);
  const params = useParams();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const rawRole = typeof user?.role === 'object' ? user?.role?.code || user?.role?.name : user?.role;
  const isExec = rawRole === 'Finance Executive' || rawRole === 'FINANCE_EXECUTIVE';

  if (isMounted && isExec) {
    return (
      <AccessDenied 
        requiredRole="Finance Manager" 
        message="Access Denied: The /finance workspace and Finance Sales are reserved exclusively for the Finance Manager (sahad.accounts@himalayaerp.com). Finance Executives should use the /finance-executive portal." 
      />
    );
  }

  return <FinancePortal />;
}

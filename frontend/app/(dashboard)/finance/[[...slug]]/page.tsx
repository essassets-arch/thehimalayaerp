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

  const subPath = (params?.slug as string[])?.[0] || 'dashboard';
  const isRestricted = isMounted && user?.role === 'Finance Executive' && RESTRICTED_FOR_EXECUTIVE.includes(subPath);

  if (isRestricted) {
    return (
      <AccessDenied 
        requiredRole="Finance" 
        message="Access Denied: As a Finance Executive, you are not authorized to view restricted Finance settings, payroll, ledger, expenses, or procurement operations." 
      />
    );
  }

  return <FinancePortal />;
}

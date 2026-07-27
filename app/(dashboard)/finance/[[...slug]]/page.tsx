'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import FinancePortal from '../../../../modules/finance/pages/FinancePortal';
import AccessDenied from '@/components/AccessDenied';

export default function Page() {
  const user = useAuthStore((s: any) => s.user);
  const params = useParams();
  const subPath = params?.slug?.[0] || 'dashboard';

  // Restricted subpaths for Finance Executive
  const restrictedForFinanceExecutive = [
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

  if (user?.role === 'Finance Executive' && restrictedForFinanceExecutive.includes(subPath)) {
    return (
      <AccessDenied 
        requiredRole="Finance" 
        message="Access Denied: As a Finance Executive, you are not authorized to view restricted Finance settings, payroll, ledger, expenses, or procurement operations." 
      />
    );
  }

  return <FinancePortal />;
}

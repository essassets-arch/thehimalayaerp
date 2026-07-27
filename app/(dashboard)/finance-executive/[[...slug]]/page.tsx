'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import FinanceExecutivePortal from '../../../../modules/finance-executive/FinanceExecutivePortal';
import AccessDenied from '@/components/AccessDenied';

export default function Page() {
  const user = useAuthStore((s: any) => s.user);

  // Allow Finance Executive, Finance, and Super Admin roles
  const allowedRoles = ['Finance Executive', 'Finance', 'Super Admin'];

  if (user && !allowedRoles.includes(user.role)) {
    return (
      <AccessDenied 
        requiredRole="Finance Executive" 
        message="Access Denied: You do not have permissions to access the Finance Executive Payment Collection Module." 
      />
    );
  }

  return <FinanceExecutivePortal />;
}

'use client';

import React from 'react';
import ExpenseManagementView from '../../../../shared/components/ExpenseManagementView';

export default function SuperAdminExpenseManagementPage() {
  return <ExpenseManagementView roleMode="SUPER_ADMIN" />;
}

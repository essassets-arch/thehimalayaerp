'use client';

import SalesPortal from '../../../../modules/sales/pages/SalesPortal';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function SalesReportsPage() {
  return (
    <ErrorBoundary
      title="Sales Reports"
      message="Unable to load the sales reporting dashboard. Please retry to load your data."
    >
      <SalesPortal overrideBasePath="/sales" mode="STANDARD_SALES" overrideView="reports" />
    </ErrorBoundary>
  );
}


'use client';

import SalesPortal from '../../../../modules/sales/pages/SalesPortal';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function SalesCustomersPage() {
  return (
    <ErrorBoundary
      title="Customer Directory"
      message="Unable to load customer directory. Please retry."
    >
      <SalesPortal overrideBasePath="/sales" mode="STANDARD_SALES" overrideView="customers" />
    </ErrorBoundary>
  );
}


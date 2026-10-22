'use client';

import SalesPortal from '../../../../modules/sales/pages/SalesPortal';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function SuperSalesCustomersPage() {
  return (
    <ErrorBoundary
      title="Customer Directory"
      message="Unable to load customer directory. Please retry."
    >
      <SalesPortal overrideBasePath="/supersales" mode="SUPER_SALES" overrideView="customers" />
    </ErrorBoundary>
  );
}

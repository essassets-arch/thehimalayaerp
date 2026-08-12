'use client';

import SalesPortal from '../../../../modules/sales/pages/SalesPortal';

export default function SuperSalesPaymentHistoryPage() {
  return <SalesPortal overrideBasePath="/supersales" mode="SUPER_SALES" overrideView="payment-history" />;
}

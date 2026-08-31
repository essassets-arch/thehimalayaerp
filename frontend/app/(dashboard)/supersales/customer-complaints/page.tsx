'use client';

import SalesPortal from '../../../../modules/sales/pages/SalesPortal';

export default function SuperSalesCustomerComplaintsPage() {
  return <SalesPortal overrideBasePath="/supersales" mode="SUPER_SALES" overrideView="customer-complaints" />;
}

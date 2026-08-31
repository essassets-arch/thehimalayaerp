'use client';

import SalesPortal from '../../../../modules/sales/pages/SalesPortal';

export default function SalesCustomerComplaintsPage() {
  return <SalesPortal overrideBasePath="/sales" mode="STANDARD_SALES" overrideView="customer-complaints" />;
}

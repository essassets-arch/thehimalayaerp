'use client';

import SalesPortal from '../../../../modules/sales/pages/SalesPortal';

export default function SalesReportsPage() {
  return <SalesPortal overrideBasePath="/sales" mode="STANDARD_SALES" overrideView="reports" />;
}

'use client';

import SalesPortal from '../../../../modules/sales/pages/SalesPortal';

export default function SalesLeadsPage() {
  return <SalesPortal overrideBasePath="/sales" mode="STANDARD_SALES" overrideView="leads" />;
}

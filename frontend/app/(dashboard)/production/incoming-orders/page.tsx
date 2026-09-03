'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import ProductionPortal from '../../../../modules/production/pages/ProductionPortal';

export default function IncomingOrdersPage() {
  return <ProductionPortal />;
}

'use client';

import DispatchPortal from '@/modules/dispatch/pages/DispatchPortal';

export default function Dispatch2OrdersPage() {
  return <DispatchPortal view="orders" overrideBasePath="/dispatch-2" mode="DISPATCH_2" />;
}

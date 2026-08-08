'use client';

import DispatchPortal from '@/modules/dispatch/pages/DispatchPortal';

export default function Dispatch2DashboardPage() {
  return <DispatchPortal view="dashboard" overrideBasePath="/dispatch-2" mode="DISPATCH_2" />;
}

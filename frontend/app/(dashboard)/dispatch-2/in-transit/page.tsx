'use client';

import DispatchPortal from '@/modules/dispatch/pages/DispatchPortal';

export default function Dispatch2InTransitPage() {
  return <DispatchPortal view="in-transit" overrideBasePath="/dispatch-2" mode="DISPATCH_2" />;
}

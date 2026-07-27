'use client';

import { useEffect } from 'react';
import { useERPStore } from '@/store/erpStore';
import { useBadgeStore } from '@/store/badgeStore';
import { useMaterialRequestStore } from '@/store/materialRequestStore';

export default function StoreBadgeUpdater() {
  const rawInventory = useERPStore((state: any) => state.state.rawInventory || []);
  const materialRequests = useMaterialRequestStore((state: any) => state.materialRequests);
  const setBadge = useBadgeStore((state: any) => state.setBadge);

  useEffect(() => {
    if (!rawInventory || !materialRequests) return;

    // Low Stock Alerts
    const lowStockCount = rawInventory.filter((p: any) => p.stock <= p.reorderLevel).length;
    setBadge('store_low_stock_alerts', lowStockCount, 'high');

    // Material Requests Pending Issuance
    const pendingRequestsCount = materialRequests.filter((r: any) => r.status === 'Approved' || r.status === 'Partially Issued').length;
    setBadge('store_material_requests', pendingRequestsCount, 'low');

  }, [rawInventory, materialRequests, setBadge]);

  return null;
}

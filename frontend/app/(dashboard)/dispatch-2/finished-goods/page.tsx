'use client';

import React from 'react';
import FinishedGoodsStockView from '@/components/FinishedGoodsStockView';

export default function Dispatch2FinishedGoodsPage() {
  return (
    <FinishedGoodsStockView
      readOnly={true}
      role="dispatch"
      title="DISPATCH 2 INVENTORY MASTER — Finished Goods"
      subtitle="Real-time finished goods stock registry synchronized with dispatch and production masters"
    />
  );
}

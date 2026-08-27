'use client';

import React from 'react';
import FinishedGoodsStockView from '@/components/FinishedGoodsStockView';

export default function SuperAdminFinishedGoodsPage() {
  return (
    <FinishedGoodsStockView
      readOnly={false}
      role="super-admin"
      title="SUPER ADMIN INVENTORY MASTER — Finished Goods"
      subtitle="Complete unified real-time finished goods stock ledger, production in, dispatch out, and audit transaction logs"
    />
  );
}

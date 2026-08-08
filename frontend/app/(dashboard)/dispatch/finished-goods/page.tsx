'use client';

import React from 'react';
import FinishedGoodsStockView from '@/components/FinishedGoodsStockView';

export default function FinishedGoodsDispatchPage() {
  return <FinishedGoodsStockView readOnly={true} role="dispatch" />;
}

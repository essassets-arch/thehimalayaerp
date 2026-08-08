'use client';

import React from 'react';
import FinishedGoodsStockView from '@/components/FinishedGoodsStockView';

export default function FinishedGoodsPlantHeadPage() {
  return <FinishedGoodsStockView readOnly={true} role="plant-head" />;
}

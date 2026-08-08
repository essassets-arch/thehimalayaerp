"use client";

import React from "react";
import FinishedGoodsStockView from "@/components/FinishedGoodsStockView";

export default function ProductionAllStockPage() {
  return <FinishedGoodsStockView readOnly={false} role="production" />;
}

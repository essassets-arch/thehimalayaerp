"use client";

import React from "react";
import FinishedGoodsStockView from "@/components/FinishedGoodsStockView";

export default function PlantHeadAllStockPage() {
  return (
    <FinishedGoodsStockView
      readOnly={true}
      role="plant-head"
      title="Plant Head Inventory — Finished Goods — All Stock"
      subtitle="Read-only view of finished goods inventory, production in, dispatch out, and stock balances"
    />
  );
}

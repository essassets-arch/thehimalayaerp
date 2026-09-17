"use client";

import React from "react";
import FinishedGoodsStockView from "@/components/FinishedGoodsStockView";

export default function SuperAdminAllStockPage() {
  return (
    <FinishedGoodsStockView
      readOnly={false}
      role="super-admin"
      title="Super Admin Inventory — Finished Goods — All Stock"
      subtitle="Full management view of finished goods inventory, production in, dispatch out, and live stock adjustments"
    />
  );
}

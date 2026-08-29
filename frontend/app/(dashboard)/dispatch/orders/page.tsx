"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import {
  Truck,
  FileText,
  User,
  MapPin,
  Package,
} from "lucide-react";

import { backendFetch } from "@/lib/backendFetch";
import {
  DispatchPageShell,
  DispatchPageHeader,
  DispatchNavigationTabs,
  DispatchToolbar,
  DispatchTableCard,
  SalesOrderNumberBadge,
  DispatchTypeBadge,
  DispatchQuantityBadge,
  DispatchActionButton,
  DispatchLoadingState,
  DispatchEmptyState,
  DispatchErrorState,
} from "../components";

interface Customer {
  id: string;
  companyName: string;
  billingAddress?: ShippingAddress | string | null;
  shippingAddress?: ShippingAddress | string | null;
}

interface ShippingAddress {
  addressLine1?: string;
  addressLine2?: string;
  line1?: string;
  line2?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  pinCode?: string;
  zipCode?: string;
  postalCode?: string;
  country?: string;
}

interface SalesOrder {
  id: string;
  orderNumber: string;
  requestedDeliveryDate?: string;
  shippingAddress?: ShippingAddress | string | null;
  customer?: Customer;
}

interface SalesOrderItem {
  id: string;
  productNameSnapshot: string;
}

interface ProductionPlan {
  id: string;
  salesOrder?: SalesOrder;
}

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  status: string;
  quantity: string | number;
  sentToDispatchAt: string | null;
  productionPlan?: ProductionPlan;
  salesOrderItem?: SalesOrderItem;
  qcInspections?: QCInspection[];
}

interface QCInspection {
  id: string;
  status: string;
  approvedQuantity: string | number | null;
  approvedAt: string | null;
  createdAt: string;
}

function formatAddressValue(value?: ShippingAddress | string | null): string {
  if (!value) return "";
  if (typeof value === "string") {
    try {
      return formatAddressValue(JSON.parse(value) as ShippingAddress);
    } catch {
      return value.trim();
    }
  }

  const parts = [
    value.line1 || value.addressLine1 || value.street,
    value.line2 || value.addressLine2,
    value.city,
    value.state,
    value.postalCode || value.pincode || value.pinCode || value.zipCode,
    value.country,
  ].filter((part): part is string => Boolean(part));

  return parts.join(", ");
}

function formatAddress(salesOrder?: SalesOrder, customer?: Customer): string {
  return (
    formatAddressValue(salesOrder?.shippingAddress) ||
    formatAddressValue(customer?.shippingAddress) ||
    formatAddressValue(customer?.billingAddress) ||
    "N/A"
  );
}

function isTradingProduct(item: any, productsMap?: Map<string, any>): boolean {
  if (!item) return false;
  let type = (item.productType || item.product?.productType || "").toUpperCase();
  let cat = (item.category || item.product?.category || item.brand || "").toUpperCase();
  const name = (item.productNameSnapshot || item.productName || item.name || "").toLowerCase();
  
  if ((!type || !cat) && productsMap && item.productId) {
    const dbProd = productsMap.get(item.productId);
    if (dbProd) {
      if (!type) type = (dbProd.productType || "").toUpperCase();
      if (!cat) cat = (dbProd.category || dbProd.brand || "").toUpperCase();
    }
  }

  if (type === "TRADING") return true;
  if (type === "MANUFACTURING") return false;
  if (["RCC PIPE", "FRC COVER"].includes(cat)) return true;
  return false;
}

interface UnifiedPendingDispatchItem {
  id: string;
  itemType: "WORK_ORDER" | "TRADING_SALES_ORDER";
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  productName: string;
  approvedQuantity: number | string;
  workOrderId?: string;
  salesOrderId?: string;
  salesOrderItemId?: string;
  workOrderNumber?: string;
  productId?: string;
  dispatchCategory?: string;
}

export default function DispatchOrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isDispatch2 = pathname?.startsWith("/dispatch-2");
  const basePath = isDispatch2 ? "/dispatch-2" : "/dispatch";
  const userDispatchCat = isDispatch2 ? "D2" : "D1";

  const [search, setSearch] = useState("");

  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["products-list-orders-page"],
    queryFn: async () => {
      const res = await backendFetch<any>("/api/backend/products?limit=1000").catch(() => []);
      return Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    },
  });

  const productsMap = useMemo(() => {
    const map = new Map<string, any>();
    products.forEach((p) => {
      if (p.id) map.set(p.id, p);
      if (p.sku) map.set(p.sku, p);
    });
    return map;
  }, [products]);

  const {
    data: pendingItems = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery<UnifiedPendingDispatchItem[]>({
    queryKey: ["pending-dispatch-unified-items"],
    queryFn: async () => {
      const extractArray = (res: any): any[] => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.items)) return res.items;
        return [];
      };

      const [workOrdersPayload, salesOrdersPayload, finishedGoodsPayload, queuePayload] = await Promise.allSettled([
        backendFetch<any>("/api/backend/production/work-orders?status=READY_FOR_DISPATCH"),
        backendFetch<any>("/api/backend/sales/orders?status=READY_FOR_DISPATCH"),
        backendFetch<any>("/api/backend/production/finished-goods"),
        backendFetch<any>("/api/backend/logistics/dispatches/queue"),
      ]);

      const workOrders: WorkOrder[] =
        workOrdersPayload.status === "fulfilled" ? extractArray(workOrdersPayload.value) : [];

      const rawSalesOrders =
        salesOrdersPayload.status === "fulfilled" ? extractArray(salesOrdersPayload.value) : [];

      const rawFinishedGoods =
        finishedGoodsPayload.status === "fulfilled" ? extractArray(finishedGoodsPayload.value) : [];

      const rawQueue =
        queuePayload.status === "fulfilled" ? extractArray(queuePayload.value) : [];

      const unifiedDirectDispatches: UnifiedPendingDispatchItem[] = [];
      rawQueue.forEach((qOrder: any) => {
        const items = Array.isArray(qOrder.items) ? qOrder.items : [];
        items.forEach((qItem: any) => {
          const qty = qItem.approvedQuantity ?? qItem.dispatchableQuantity ?? qItem.reservedQuantity ?? 1;
          unifiedDirectDispatches.push({
            id: `alloc-${qItem.allocationId || qItem.id || Math.random()}`,
            itemType: "TRADING_SALES_ORDER",
            orderNumber: qOrder.orderNo || qOrder.orderId || "SO-DIRECT",
            customerName: qOrder.customerName || "N/A",
            deliveryAddress: qOrder.deliveryAddress || "Factory Staging Area",
            productName: qItem.productName || "Direct Dispatch Item",
            approvedQuantity: typeof qty === "number" ? `${qty} ${qItem.unit || "PCS"}` : String(qty),
            salesOrderId: qOrder.salesOrderId,
            salesOrderItemId: qItem.salesOrderItemId,
            productId: qItem.productId,
            dispatchCategory: qItem.dispatchCategory || qItem.dispatch_category || qItem.product?.dispatchCategory || qItem.product?.dispatch_category || productsMap.get(qItem.productId || '')?.dispatchCategory || productsMap.get(qItem.productId || '')?.dispatch_category || "D1",
          });
        });
      });

      const unifiedFinishedGoods: UnifiedPendingDispatchItem[] = rawFinishedGoods
        .filter((fg) => {
          const s = String(fg.status || "").toUpperCase();
          const jobNoStr = String(fg.jobNo || fg.workOrderId || fg.id || "");
          const isWoStock = jobNoStr.startsWith("WO-STOCK-") || jobNoStr.includes("WO-STOCK-");
          const qtyVal = fg.availableQuantity ?? fg.quantity ?? 0;
          const qty = typeof qtyVal === "number" ? qtyVal : parseFloat(String(qtyVal)) || 0;

          if (isWoStock || qty <= 0) return false;
          return ["AVAILABLE", "READY_FOR_DISPATCH", "QC_APPROVED", "PASSED", "STAGED", "IN_STAGING"].includes(s);
        })
        .map((fg) => {
          const wo = fg.workOrder;
          const salesOrder = wo?.productionPlan?.salesOrder;
          const customer = salesOrder?.customer;
          const address = formatAddress(salesOrder, customer);
          const qty = fg.availableQuantity ?? fg.quantity ?? 1;
          return {
            id: `fg-${fg.id || fg.workOrderId}`,
            itemType: "WORK_ORDER",
            orderNumber: fg.jobNo || salesOrder?.orderNumber || "WO-FG",
            customerName: fg.customerName || customer?.companyName || "Factory Stock Staging",
            deliveryAddress: address !== "N/A" ? address : "Factory Staging Area",
            productName: fg.productName || "Finished Product",
            approvedQuantity: `${qty} ${fg.unit || "Pcs"}`,
            workOrderId: fg.workOrderId || fg.id,
            salesOrderId: salesOrder?.id,
            workOrderNumber: fg.jobNo,
            productId: fg.productId || wo?.salesOrderItem?.productId || fg.workOrder?.salesOrderItem?.productId,
            dispatchCategory: fg.dispatchCategory || fg.dispatch_category || fg.product?.dispatchCategory || fg.product?.dispatch_category || wo?.salesOrderItem?.product?.dispatchCategory || wo?.salesOrderItem?.product?.dispatch_category || productsMap.get(fg.productId || '')?.dispatchCategory || productsMap.get(fg.productId || '')?.dispatch_category || "D1",
          };
        });

      const unifiedWorkOrders: UnifiedPendingDispatchItem[] = workOrders
        .filter((wo) => {
          const woNo = String(wo.workOrderNumber || wo.id || "");
          const soNo = String(wo.productionPlan?.salesOrder?.orderNumber || "");
          if (woNo.startsWith("WO-STOCK-") || woNo.includes("WO-STOCK-") || woNo.includes("TEST") || soNo.includes("SO-TEST-")) return false;
          const prodStatus = String((wo as any).productionStatus || wo.status || "").toUpperCase();
          if (prodStatus === "DISPATCHED" || prodStatus === "COMPLETED" || prodStatus === "DELIVERED") return false;
          const item = wo.salesOrderItem;
          const alreadyDispatched = item?.dispatchItems?.reduce((sum: number, d: any) => sum + Number(d.quantity || 0), 0) || 0;
          const remaining = Math.max(0, Number(item?.orderedQuantity || wo.quantity || 0) - alreadyDispatched);
          return remaining > 0;
        })
        .map((wo) => {
          const salesOrder = wo.productionPlan?.salesOrder;
          const customer = salesOrder?.customer;
          const address = formatAddress(salesOrder, customer);
          const qcInspection = wo.qcInspections?.[0];
          const item = wo.salesOrderItem;
          const alreadyDispatched = item?.dispatchItems?.reduce((sum: number, d: any) => sum + Number(d.quantity || 0), 0) || 0;
          const remaining = Math.max(0, Number(item?.orderedQuantity || wo.quantity || 0) - alreadyDispatched);
          return {
            id: `wo-${wo.id}`,
            itemType: "WORK_ORDER",
            orderNumber: salesOrder?.orderNumber || wo.workOrderNumber || "N/A",
            customerName: customer?.companyName || "N/A",
            deliveryAddress: address,
            productName: wo.salesOrderItem?.productNameSnapshot || "Manufacturing Product",
            approvedQuantity: remaining || qcInspection?.approvedQuantity || wo.quantity || 1,
            workOrderId: wo.id,
            salesOrderId: salesOrder?.id,
            workOrderNumber: wo.workOrderNumber,
            productId: wo.salesOrderItem?.productId,
            dispatchCategory: wo.salesOrderItem?.product?.dispatchCategory || wo.salesOrderItem?.product?.dispatch_category || productsMap.get(wo.salesOrderItem?.productId || '')?.dispatchCategory || productsMap.get(wo.salesOrderItem?.productId || '')?.dispatch_category || "D1",
          };
        });

      const unifiedSalesOrders: UnifiedPendingDispatchItem[] = [];
      rawSalesOrders.forEach((so: any) => {
        const orderNo = String(so.orderNumber || so.orderId || "");
        if (orderNo.includes("SO-TEST-")) return;

        const status = String(so.status || so.dispatchStatus || "").toUpperCase();
        if (status === "IN_TRANSIT" || status === "COMPLETED" || status === "DELIVERED") return;

        const items = Array.isArray(so.items) ? so.items : Array.isArray(so.orderItems) ? so.orderItems : [];
        if (items.length > 0) {
          items.forEach((item: any, idx: number) => {
            const hasFgReservation = Array.isArray(item.allocations) && item.allocations.some(
              (a: any) => a.allocationType === "FINISHED_GOODS_RESERVATION" && Number(a.reservedQuantity || 0) > 0
            );

            if (!isTradingProduct(item, productsMap) && !hasFgReservation) {
              return;
            }

            const alreadyDispatched = Array.isArray(item.dispatchItems)
              ? item.dispatchItems.reduce((sum: number, d: any) => sum + Number(d.quantity || 0), 0)
              : 0;
            const remaining = Math.max(0, Number(item.orderedQuantity || item.quantity || 1) - alreadyDispatched);
            if (remaining <= 0) return;

            unifiedSalesOrders.push({
              id: `so-${so.id}-${idx}`,
              itemType: "TRADING_SALES_ORDER",
              orderNumber: so.orderNumber || so.orderId || so.orderNo || "N/A",
              customerName: so.customerName || so.customer?.companyName || "N/A",
              deliveryAddress: formatAddress(so, so.customer),
              productName: item.productNameSnapshot || item.productName || item.name || "Trading Product",
              approvedQuantity: remaining,
              salesOrderId: so.id,
              salesOrderItemId: item.id,
              productId: item.productId,
              dispatchCategory: item.product?.dispatchCategory || item.product?.dispatch_category || productsMap.get(item.productId || '')?.dispatchCategory || productsMap.get(item.productId || '')?.dispatch_category || "D1",
            });
          });
        }
      });

      const combined = [...unifiedWorkOrders];
      unifiedFinishedGoods.forEach((fg) => {
        if (!combined.some((c) => c.workOrderId === fg.workOrderId || c.id === fg.id)) {
          combined.push(fg);
        }
      });
      unifiedDirectDispatches.forEach((dd) => {
        if (!combined.some((c) => (c.salesOrderId === dd.salesOrderId && c.salesOrderItemId === dd.salesOrderItemId) || c.id === dd.id)) {
          combined.push(dd);
        }
      });
      unifiedSalesOrders.forEach((so) => {
        if (!combined.some((c) => (c.salesOrderId === so.salesOrderId && c.salesOrderItemId === so.salesOrderItemId) || c.id === so.id)) {
          combined.push(so);
        }
      });

      return combined;
    },
  });

  const filteredPendingItems = useMemo(() => {
    return pendingItems.filter((item) => {
      // Category filter (D1 vs D2)
      const productCat = item.dispatchCategory || "D1";
      const c1 = String(productCat).trim().toUpperCase();
      const c2 = String(userDispatchCat).trim().toUpperCase();

      let matchCategory = false;
      if (c1 === c2) matchCategory = true;
      else if ((c1 === "D1" || c1 === "DISPATCH 1" || c1 === "DISPATCH_1") && (c2 === "D1" || c2 === "DISPATCH 1")) matchCategory = true;
      else if ((c1 === "D2" || c1 === "DISPATCH 2" || c1 === "DISPATCH_2") && (c2 === "D2" || c2 === "DISPATCH 2")) matchCategory = true;

      if (!matchCategory) return false;

      // Search query filter
      if (!search.trim()) return true;
      const lower = search.toLowerCase();
      return (
        item.orderNumber.toLowerCase().includes(lower) ||
        item.customerName.toLowerCase().includes(lower) ||
        item.productName.toLowerCase().includes(lower) ||
        item.deliveryAddress.toLowerCase().includes(lower)
      );
    });
  }, [pendingItems, userDispatchCat, productsMap, search]);

  const handleCreateDispatch = (item: UnifiedPendingDispatchItem) => {
    if (item.itemType === "WORK_ORDER" && item.workOrderId) {
      router.push(`${basePath}/create-dispatch?workOrderId=${item.workOrderId}`);
    } else if (item.salesOrderId) {
      router.push(`${basePath}/create-dispatch?salesOrderId=${item.salesOrderId}`);
    }
  };

  const handleExportCsv = () => {
    if (!filteredPendingItems.length) return;
    const exportRows = filteredPendingItems.map((item) => ({
      "Order Number": item.orderNumber,
      Customer: item.customerName,
      "Delivery Address": item.deliveryAddress,
      Product: item.productName,
      Type: item.itemType,
      Quantity: item.approvedQuantity,
    }));
    const headers = Object.keys(exportRows[0]);
    const csvContent = [
      headers.join(","),
      ...exportRows.map((row) =>
        headers.map((h) => `"${String((row as any)[h] ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pending_dispatches_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <DispatchPageShell>
      {/* Navigation Tabs */}
      <DispatchNavigationTabs />

      {/* Page Header */}
      <DispatchPageHeader
        title="Pending Dispatches"
        description="Create dispatch gate passes for manufacturing work orders and trading sales orders ready to be shipped."
        eyebrow="Queue Management"
        icon={Truck}
        stats={[
          { label: "Awaiting Dispatch", value: filteredPendingItems.length, icon: Package, color: "bg-indigo-50 text-indigo-600" },
        ]}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Toolbar / Search Filter */}
      <DispatchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search order number, customer, product or delivery address..."
        onExportCsv={filteredPendingItems.length > 0 ? handleExportCsv : undefined}
        title="Pending Queue"
        subtitle={`Showing ${filteredPendingItems.length} order${filteredPendingItems.length !== 1 ? "s" : ""} ready for dispatch`}
      />


      {/* Loading State */}
      {isLoading && <DispatchLoadingState count={6} />}

      {/* Error State */}
      {error && !isLoading && <DispatchErrorState onRetry={() => refetch()} />}

      {/* Empty State */}
      {!isLoading && !error && filteredPendingItems.length === 0 && (
        <DispatchEmptyState
          title={search ? "No Matching Dispatches Found" : "No Pending Dispatches"}
          description={
            search
              ? `No pending orders match "${search}". Try clearing your search filter.`
              : "No orders are currently awaiting dispatch. Once manufacturing QC passes or trading orders are submitted, they will appear here automatically."
          }
          onRetry={() => refetch()}
        />
      )}

      {/* Table & Mobile Cards */}
      {!isLoading && !error && filteredPendingItems.length > 0 && (
        <>
          {/* Desktop Table View (≥ 768px) */}
          <div className="hidden md:block">
            <DispatchTableCard minTableWidth={1200}>
              <table className="w-full text-sm text-left border-collapse no-mobile-stack">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th
                      style={{ paddingLeft: "24px", paddingRight: "16px", height: "38px", verticalAlign: "middle" }}
                      className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap min-w-[200px]"
                    >
                      Sales Order
                    </th>
                    <th style={{ height: "38px", verticalAlign: "middle" }} className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 px-5 whitespace-nowrap min-w-[220px]">
                      Customer
                    </th>
                    <th style={{ height: "38px", verticalAlign: "middle" }} className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 px-5 whitespace-nowrap min-w-[260px]">
                      Delivery Address
                    </th>
                    <th style={{ height: "38px", verticalAlign: "middle" }} className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 px-5 whitespace-nowrap min-w-[280px]">
                      Product
                    </th>
                    <th style={{ height: "38px", verticalAlign: "middle" }} className="text-center text-xs font-bold uppercase tracking-wider text-slate-500 px-4 whitespace-nowrap min-w-[120px]">
                      Type
                    </th>
                    <th style={{ height: "38px", verticalAlign: "middle" }} className="text-center text-xs font-bold uppercase tracking-wider text-slate-500 px-4 whitespace-nowrap min-w-[110px]">
                      Qty
                    </th>
                    <th
                      style={{ paddingLeft: "16px", paddingRight: "24px", height: "38px", verticalAlign: "middle" }}
                      className="text-right text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap min-w-[180px]"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredPendingItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      {/* Sales Order Number */}
                      <td
                        style={{ paddingLeft: "24px", paddingRight: "16px", height: "52px", verticalAlign: "middle" }}
                        className="whitespace-nowrap"
                      >
                        <SalesOrderNumberBadge orderNumber={item.orderNumber} />
                      </td>

                      {/* Customer */}
                      <td style={{ height: "52px", verticalAlign: "middle" }} className="px-5 whitespace-nowrap">
                        <span
                          className="font-semibold text-slate-900 text-sm tracking-tight block max-w-[220px] truncate"
                          title={item.customerName}
                        >
                          {item.customerName}
                        </span>
                      </td>

                      {/* Delivery Address */}
                      <td style={{ height: "52px", verticalAlign: "middle" }} className="px-5">
                        <span
                          className="text-sm text-slate-600 leading-relaxed block max-w-[300px] truncate"
                          title={item.deliveryAddress}
                        >
                          {item.deliveryAddress}
                        </span>
                      </td>

                      {/* Product */}
                      <td style={{ height: "52px", verticalAlign: "middle" }} className="px-5">
                        <span
                          className="text-slate-900 font-semibold text-sm leading-snug block max-w-[320px] truncate"
                          title={item.productName}
                        >
                          {item.productName}
                        </span>
                      </td>

                      {/* Type */}
                      <td style={{ height: "52px", verticalAlign: "middle" }} className="px-4 whitespace-nowrap text-center">
                        <DispatchTypeBadge type={item.itemType === "TRADING_SALES_ORDER" ? "TRADING" : "MFG"} />
                      </td>

                      {/* Quantity */}
                      <td style={{ height: "52px", verticalAlign: "middle" }} className="px-4 whitespace-nowrap text-center">
                        <DispatchQuantityBadge quantity={item.approvedQuantity} />
                      </td>

                      {/* Action Button */}
                      <td
                        style={{ paddingLeft: "16px", paddingRight: "24px", height: "52px", verticalAlign: "middle" }}
                        className="whitespace-nowrap text-right"
                      >
                        <DispatchActionButton
                          label="Create Dispatch"
                          icon={FileText}
                          onClick={() => handleCreateDispatch(item)}
                          variant="primary"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DispatchTableCard>
          </div>

          {/* Mobile Cards View (< 768px) */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 dispatch-mobile-card-grid">
            {filteredPendingItems.map((item) => (
              <div key={item.id} className="dsp-card">
                {/* Card Header */}
                <div className="dsp-card-head">
                  <div className="dsp-card-head-row">
                    <SalesOrderNumberBadge orderNumber={item.orderNumber} />
                    <DispatchTypeBadge type={item.itemType === "TRADING_SALES_ORDER" ? "TRADING" : "MFG"} />
                  </div>
                </div>

                {/* Card Body */}
                <div className="dsp-card-body">
                  {/* Customer */}
                  <div className="dsp-card-row">
                    <div className="dsp-card-icon">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="dsp-card-info">
                      <p className="dsp-card-label">Customer</p>
                      <p className="dsp-card-value truncate max-w-[240px]">{item.customerName}</p>
                    </div>
                  </div>

                  {/* Product */}
                  <div className="dsp-card-row">
                    <div className="dsp-card-icon">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="dsp-card-info">
                      <p className="dsp-card-label">Product</p>
                      <p className="dsp-card-value leading-snug">{item.productName}</p>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="dsp-card-row">
                    <div className="dsp-card-icon">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="dsp-card-info">
                      <p className="dsp-card-label">Delivery Address</p>
                      <p className="dsp-card-value dsp-card-addr leading-relaxed">{item.deliveryAddress}</p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    <span className="dsp-card-label">Approved Qty</span>
                    <DispatchQuantityBadge quantity={item.approvedQuantity} />
                  </div>
                </div>

                {/* Card Footer: Full width action button */}
                <div className="dsp-card-foot">
                  <button
                    type="button"
                    onClick={() => handleCreateDispatch(item)}
                    className="dsp-confirm-btn"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Create Dispatch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </DispatchPageShell>
  );
}

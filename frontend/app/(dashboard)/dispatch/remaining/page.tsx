"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import {
  Layers,
  Truck,
  ArrowRight,
  User,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Building2,
  MapPin,
  RefreshCw,
} from "lucide-react";

import { backendFetch } from "@/lib/backendFetch";
import {
  DispatchPageShell,
  DispatchPageHeader,
  DispatchNavigationTabs,
  DispatchToolbar,
  DispatchTableCard,
  DispatchLoadingState,
  DispatchEmptyState,
  DispatchErrorState,
  DispatchActionButton,
  SalesOrderNumberBadge,
} from "../components";
import styles from "./remaining.module.css";

interface Customer {
  id?: string;
  name?: string;
  companyName?: string;
  shippingAddress?: any;
  billingAddress?: any;
}

interface SalesOrder {
  id: string;
  orderNumber: string;
  customer?: Customer;
  shippingAddress?: any;
  items?: any[];
}

export interface RemainingDispatchItem {
  id: string;
  itemType: "WORK_ORDER" | "TRADING_SALES_ORDER";
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  productName: string;
  productSku?: string;
  orderedQuantity: number;
  dispatchedQuantity: number;
  remainingQuantity: number;
  unit?: string;
  workOrderId?: string;
  salesOrderId?: string;
  salesOrderItemId?: string;
  productId?: string;
  dispatchCategory?: string;
  workOrderNumber?: string;
}

function normalizeKey(str?: string | null): string {
  if (!str) return "";
  return str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function formatAddressValue(value?: any): string {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined" || trimmed === "N/A" || trimmed === "Factory Staging Area" || trimmed === "Customer Designated Delivery Site") return "";
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        return formatAddressValue(parsed);
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  if (typeof value === "object") {
    if (value.formattedAddress && typeof value.formattedAddress === "string") return value.formattedAddress.trim();
    if (value.fullAddress && typeof value.fullAddress === "string") return value.fullAddress.trim();
    if (value.address && typeof value.address === "string") return value.address.trim();

    const streetParts = [
      value.plotNo || value.plotNumber || value.doorNo,
      value.building || value.buildingName || value.premises,
      value.line1 || value.addressLine1 || value.street || value.street1 || value.streetAddress,
      value.line2 || value.addressLine2 || value.street2 || value.landmark || value.area,
      value.line3 || value.addressLine3 || value.locality || value.sector,
    ].filter((p): p is string => Boolean(p && String(p).trim()));

    const city = value.city || value.town || value.district || value.taluka;
    const state = value.state || value.province || value.region;
    const pin = value.postalCode || value.pincode || value.pinCode || value.zipCode || value.zip;
    const country = value.country || value.nation;

    const parts = [
      streetParts.join(", "),
      city,
      state,
      pin,
      country,
    ].filter((p): p is string => Boolean(p && String(p).trim()));

    return parts.join(", ");
  }

  return "";
}

function formatAddress(salesOrder?: any, customer?: any, workOrder?: any): string {
  const candidates = [
    // 1. Explicit shipping/delivery address on Sales Order (added by sales)
    salesOrder?.shippingAddress,
    salesOrder?.deliveryAddress,
    salesOrder?.siteAddress,
    salesOrder?.deliveryLocation,
    salesOrder?.destination,
    salesOrder?.billingAddress,

    // 2. Customer shipping address
    customer?.shippingAddress,
    customer?.siteAddress,
    customer?.deliveryAddress,
    customer?.deliveryLocation,

    // 3. Customer billing / registered / office address (added by sales/master)
    customer?.billingAddress,
    customer?.address,
    customer?.officeAddress,
    customer?.registeredAddress,
    customer?.factoryAddress,

    // 4. Source Quotation addresses (added by salesperson during quote)
    salesOrder?.sourceQuotation?.shippingAddress,
    salesOrder?.sourceQuotation?.customerAddress,
    salesOrder?.sourceQuotation?.deliveryAddress,
    salesOrder?.sourceQuotation?.siteAddress,
    salesOrder?.sourceQuotation?.billingAddress,
    salesOrder?.sourceQuotation?.deliveryLocation,
    salesOrder?.quotation?.shippingAddress,
    salesOrder?.quotation?.customerAddress,
    salesOrder?.quotation?.deliveryAddress,
    salesOrder?.quotation?.billingAddress,

    // 5. Lead addresses (added by salesperson during lead creation)
    salesOrder?.sourceQuotation?.lead?.shippingAddress,
    salesOrder?.sourceQuotation?.lead?.billingAddress,
    salesOrder?.sourceQuotation?.lead?.address,
    salesOrder?.sourceQuotation?.lead?.siteAddress,
    salesOrder?.sourceQuotation?.lead?.deliveryAddress,
    salesOrder?.quotation?.lead?.shippingAddress,
    salesOrder?.quotation?.lead?.billingAddress,
    salesOrder?.quotation?.lead?.address,
    salesOrder?.lead?.shippingAddress,
    salesOrder?.lead?.billingAddress,
    salesOrder?.lead?.address,
    customer?.lead?.shippingAddress,
    customer?.lead?.billingAddress,
    customer?.lead?.address,

    // 6. Direct work order customer or plan info
    workOrder?.deliveryAddress,
    workOrder?.customer?.shippingAddress,
    workOrder?.customer?.billingAddress,
    workOrder?.customer?.address,

    // 7. City / State / Pincode components if present
    customer ? { city: customer.city, state: customer.state, pincode: customer.pincode, country: customer.country } : null,
    salesOrder?.sourceQuotation?.lead ? { city: salesOrder.sourceQuotation.lead.city, state: salesOrder.sourceQuotation.lead.state, pincode: salesOrder.sourceQuotation.lead.pincode, country: salesOrder.sourceQuotation.lead.country } : null,
  ];

  for (const c of candidates) {
    const formatted = formatAddressValue(c);
    if (formatted && formatted.length > 2 && formatted !== "N/A" && formatted !== "Factory Staging Area") {
      return formatted;
    }
  }

  return "—";
}

export default function RemainingDispatchPage() {
  const router = useRouter();
  const pathname = usePathname();

  const isDispatch2 = pathname?.includes("/dispatch-2") ?? false;
  const basePath = isDispatch2 ? "/dispatch-2" : "/dispatch";
  const userDispatchCat = isDispatch2 ? "D2" : "D1";

  const [search, setSearch] = useState("");
  const [copiedOrder, setCopiedOrder] = useState<string | null>(null);

  // Query 0: Products Master Map
  const { data: productsMap = new Map<string, any>() } = useQuery<Map<string, any>>({
    queryKey: ["products-master-map"],
    queryFn: async () => {
      try {
        const res = await backendFetch<any>("/api/backend/products");
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        const map = new Map<string, any>();
        list.forEach((p: any) => {
          if (p.id) map.set(p.id, p);
        });
        return map;
      } catch {
        return new Map();
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Query 1: Fetch all data to compute remaining quantities accurately
  const {
    data: allRemainingItems = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery<RemainingDispatchItem[]>({
    queryKey: ["remaining-dispatch-items"],
    queryFn: async () => {
      const extractArray = (res: any): any[] => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.data)) return res.data.data;
        if (Array.isArray(res?.data?.items)) return res.data.items;
        if (Array.isArray(res?.items)) return res.items;
        return [];
      };

      const [
        workOrdersPayload,
        readyForDispatchPayload,
        salesOrdersPayload,
        activeDispatchesPayload,
      ] = await Promise.allSettled([
        backendFetch<any>("/api/backend/production/work-orders"),
        backendFetch<any>("/api/backend/production/ready-for-dispatch"),
        backendFetch<any>("/api/backend/sales/orders"),
        backendFetch<any>("/api/backend/logistics/dispatches"),
      ]);

      const workOrders: any[] =
        workOrdersPayload.status === "fulfilled" ? extractArray(workOrdersPayload.value) : [];
      const readyJobs: any[] =
        readyForDispatchPayload.status === "fulfilled" ? extractArray(readyForDispatchPayload.value) : [];
      const rawSalesOrders: any[] =
        salesOrdersPayload.status === "fulfilled" ? extractArray(salesOrdersPayload.value) : [];
      const rawActiveDispatches: any[] =
        activeDispatchesPayload.status === "fulfilled" ? extractArray(activeDispatchesPayload.value) : [];

      // 1. Calculate dispatched quantities per salesOrderItemId, workOrderId, and (salesOrderId+productId)
      const dispatchedBySalesOrderItem = new Map<string, number>();
      const dispatchedByWorkOrder = new Map<string, number>();
      const dispatchedBySalesOrderProduct = new Map<string, number>();

      rawActiveDispatches.forEach((d: any) => {
        const st = String(d.status || "").toUpperCase();
        if (["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "SHIPPED"].includes(st)) {
          if (Array.isArray(d.items)) {
            d.items.forEach((it: any) => {
              const q = Number(it.quantity || 0);
              if (it.salesOrderItemId) {
                const k = String(it.salesOrderItemId).toLowerCase();
                dispatchedBySalesOrderItem.set(k, (dispatchedBySalesOrderItem.get(k) || 0) + q);
              }
              if (it.workOrderId) {
                const k = String(it.workOrderId).toLowerCase();
                dispatchedByWorkOrder.set(k, (dispatchedByWorkOrder.get(k) || 0) + q);
              }
              if (d.salesOrderId && it.productId) {
                const k = `${String(d.salesOrderId).toLowerCase()}_${String(it.productId).toLowerCase()}`;
                dispatchedBySalesOrderProduct.set(k, (dispatchedBySalesOrderProduct.get(k) || 0) + q);
              }
            });
          }
        }
      });

      const remainingResults: RemainingDispatchItem[] = [];
      const processedIds = new Set<string>();

      // 2. Process Work Orders
      const allJobs = [...workOrders, ...readyJobs];
      allJobs.forEach((wo) => {
        if (!wo || !wo.id) return;
        const key = `wo-${wo.id}`;
        if (processedIds.has(key)) return;
        processedIds.add(key);

        const salesOrder = wo.productionPlan?.salesOrder || wo.salesOrder;
        const customer = salesOrder?.customer || wo.customer;
        const address = formatAddress(salesOrder, customer);
        const item = wo.salesOrderItem;

        const totalOrdered = Number(item?.orderedQuantity || wo.quantity || 0);
        if (totalOrdered <= 0) return;

        const fromDispatchItems =
          item?.dispatchItems?.reduce((sum: number, d: any) => sum + Number(d.quantity || 0), 0) || 0;
        const fromActiveDispatches =
          (wo.id ? dispatchedByWorkOrder.get(String(wo.id).toLowerCase()) : 0) ||
          (wo.salesOrderItemId ? dispatchedBySalesOrderItem.get(String(wo.salesOrderItemId).toLowerCase()) : 0) ||
          0;
        const alreadyDispatched = Math.max(fromDispatchItems, fromActiveDispatches);
        const remaining = Math.max(0, totalOrdered - alreadyDispatched);

        // Include partially dispatched items (ordered > alreadyDispatched > 0)
        // Also if remaining > 0 and alreadyDispatched > 0
        if (alreadyDispatched > 0 && remaining > 0) {
          const soNumber =
            salesOrder?.orderNumber ||
            wo.salesOrderNumber ||
            wo.workOrderNumber ||
            "SO-REMAINING";
          const prodName =
            item?.productNameSnapshot ||
            item?.product?.name ||
            wo.productName ||
            wo.product ||
            "Finished Manufacturing Product";

          remainingResults.push({
            id: key,
            itemType: "WORK_ORDER",
            orderNumber: soNumber,
            customerName: customer?.companyName || customer?.name || "Client",
            deliveryAddress: address || "—",
            productName: prodName,
            productSku: item?.product?.sku || wo.productCode,
            orderedQuantity: totalOrdered,
            dispatchedQuantity: alreadyDispatched,
            remainingQuantity: remaining,
            unit: item?.unit || wo.unit || "Pcs",
            workOrderId: wo.id,
            salesOrderId: salesOrder?.id,
            salesOrderItemId: item?.id,
            productId: item?.productId || wo.productId,
            workOrderNumber: wo.workOrderNumber,
            dispatchCategory:
              item?.product?.dispatchCategory ||
              productsMap.get(item?.productId || "")?.dispatchCategory ||
              "D1",
          });
        }
      });

      // 3. Process Sales Orders
      rawSalesOrders.forEach((so) => {
        if (!so || !so.id) return;
        const items = Array.isArray(so.items) ? so.items : Array.isArray(so.orderItems) ? so.orderItems : [];
        items.forEach((item: any, idx: number) => {
          const key = `so-${so.id}-${item.id || idx}`;
          if (processedIds.has(key)) return;
          processedIds.add(key);

          const totalOrdered = Number(item.orderedQuantity || item.quantity || 0);
          if (totalOrdered <= 0) return;

          const fromDispatchItems = Array.isArray(item.dispatchItems)
            ? item.dispatchItems.reduce((sum: number, d: any) => sum + Number(d.quantity || 0), 0)
            : 0;
          const fromActiveDispatches =
            (item.id ? dispatchedBySalesOrderItem.get(String(item.id).toLowerCase()) : 0) ||
            (so.id && item.productId
              ? dispatchedBySalesOrderProduct.get(`${String(so.id).toLowerCase()}_${String(item.productId).toLowerCase()}`)
              : 0) ||
            0;
          const alreadyDispatched = Math.max(fromDispatchItems, fromActiveDispatches);
          const remaining = Math.max(0, totalOrdered - alreadyDispatched);

          if (alreadyDispatched > 0 && remaining > 0) {
            remainingResults.push({
              id: key,
              itemType: "TRADING_SALES_ORDER",
              orderNumber: so.orderNumber || so.orderId || "SO-REMAINING",
              customerName: so.customerName || so.customer?.companyName || "Client",
              deliveryAddress: formatAddress(so, so.customer),
              productName: item.productNameSnapshot || item.productName || item.name || "Trading Product",
              productSku: item.product?.sku || item.sku,
              orderedQuantity: totalOrdered,
              dispatchedQuantity: alreadyDispatched,
              remainingQuantity: remaining,
              unit: item.unit || "Pcs",
              salesOrderId: so.id,
              salesOrderItemId: item.id,
              productId: item.productId,
              dispatchCategory:
                item.product?.dispatchCategory ||
                productsMap.get(item.productId || "")?.dispatchCategory ||
                "D1",
            });
          }
        });
      });

      return remainingResults;
    },
    refetchInterval: 15000,
  });

  // Filter by category and search term
  const filteredRemainingItems = useMemo(() => {
    return allRemainingItems.filter((item) => {
      // Category Filter
      const cat = String(item.dispatchCategory || "D1").toUpperCase();
      let matchCategory = false;
      if (userDispatchCat === cat) matchCategory = true;
      else if ((cat === "D1" || cat === "DISPATCH 1") && userDispatchCat === "D1") matchCategory = true;
      else if ((cat === "D2" || cat === "DISPATCH 2") && userDispatchCat === "D2") matchCategory = true;
      else if (!isDispatch2) matchCategory = true;

      if (!matchCategory) return false;

      // Search Filter
      if (!search.trim()) return true;
      const lower = search.toLowerCase();
      return (
        item.orderNumber.toLowerCase().includes(lower) ||
        item.customerName.toLowerCase().includes(lower) ||
        item.productName.toLowerCase().includes(lower) ||
        item.deliveryAddress.toLowerCase().includes(lower) ||
        (item.workOrderNumber && item.workOrderNumber.toLowerCase().includes(lower))
      );
    });
  }, [allRemainingItems, userDispatchCat, isDispatch2, search]);

  // KPI Calculations
  const totalRemainingOrdersCount = filteredRemainingItems.length;
  const totalRemainingUnits = useMemo(() => {
    return filteredRemainingItems.reduce((sum, it) => sum + it.remainingQuantity, 0);
  }, [filteredRemainingItems]);
  const totalDispatchedUnits = useMemo(() => {
    return filteredRemainingItems.reduce((sum, it) => sum + it.dispatchedQuantity, 0);
  }, [filteredRemainingItems]);
  const totalOrderedUnits = useMemo(() => {
    return filteredRemainingItems.reduce((sum, it) => sum + it.orderedQuantity, 0);
  }, [filteredRemainingItems]);

  const overallProgressPct = useMemo(() => {
    if (totalOrderedUnits === 0) return 0;
    return Math.round((totalDispatchedUnits / totalOrderedUnits) * 100);
  }, [totalOrderedUnits, totalDispatchedUnits]);

  // Action: Create Dispatch for remaining quantities
  const handleCreateDispatch = (item: RemainingDispatchItem) => {
    const params = new URLSearchParams();
    if (item.salesOrderId && !item.salesOrderId.includes("/")) {
      params.set("salesOrderId", item.salesOrderId);
    } else if (item.orderNumber) {
      params.set("salesOrderId", item.orderNumber);
    }
    if (item.orderNumber) {
      params.set("orderNumber", item.orderNumber);
    }
    if (item.workOrderId && !item.workOrderId.includes("/") && item.workOrderId !== item.orderNumber) {
      params.set("workOrderId", item.workOrderId);
    }
    if (item.salesOrderItemId && !item.salesOrderItemId.includes("/")) {
      params.set("salesOrderItemId", item.salesOrderItemId);
    }
    if (item.deliveryAddress && item.deliveryAddress !== "—" && item.deliveryAddress !== "N/A" && item.deliveryAddress !== "Factory Staging Area") {
      params.set("deliveryAddress", item.deliveryAddress);
    }
    router.push(`${basePath}/create-dispatch?${params.toString()}`);
  };

  const handleExportCsv = () => {
    if (!filteredRemainingItems.length) return;
    const exportRows = filteredRemainingItems.map((item) => ({
      "Order Number": item.orderNumber,
      "Customer": item.customerName,
      "Delivery Address": item.deliveryAddress,
      "Product Item": item.productName,
      "SKU": item.productSku || "—",
      "Ordered Quantity": `${item.orderedQuantity} ${item.unit || "Pcs"}`,
      "Already Dispatched": `${item.dispatchedQuantity} ${item.unit || "Pcs"}`,
      "Remaining to Dispatch": `${item.remainingQuantity} ${item.unit || "Pcs"}`,
      "Fulfillment %": `${Math.round((item.dispatchedQuantity / item.orderedQuantity) * 100)}%`,
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
    link.download = `remaining_dispatches_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const copyToClipboard = (text: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedOrder(text);
    setTimeout(() => setCopiedOrder(null), 2000);
  };

  return (
    <DispatchPageShell>
      {/* Hero Page Header */}
      <DispatchPageHeader
        title="Remaining Dispatch Queue"
        description="Orders that have been partially dispatched and have remaining quantities awaiting subsequent gate pass creation and shipment."
        eyebrow="Partial Fulfillment Tracking"
        icon={Layers}
        stats={[
          {
            label: "Partial Orders",
            value: totalRemainingOrdersCount,
            icon: Layers,
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "Remaining Units",
            value: totalRemainingUnits,
            icon: Clock,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Dispatched Units",
            value: totalDispatchedUnits,
            icon: CheckCircle2,
            color: "bg-emerald-50 text-emerald-600",
          },
        ]}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconBox} ${styles.kpiIconAmber}`}>
            <Layers size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiVal}>{totalRemainingOrdersCount}</span>
            <span className={styles.kpiLabel}>Partially Dispatched Orders</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconBox} ${styles.kpiIconBlue}`}>
            <Clock size={22} />
          </div>
          <div className={styles.kpiInfo}>
            <span className={styles.kpiVal}>{totalRemainingUnits}</span>
            <span className={styles.kpiLabel}>Remaining Units to Ship</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconBox} ${styles.kpiIconGreen}`}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.kpiInfo} style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className={styles.kpiVal}>{overallProgressPct}%</span>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700 }}>
                {totalDispatchedUnits} / {totalOrderedUnits} Units
              </span>
            </div>
            <span className={styles.kpiLabel}>Overall Partial Fulfillment</span>
            <div className={styles.progressBarBg}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${Math.min(100, Math.max(0, overallProgressPct))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar & Search */}
      <DispatchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search order number, customer, product or delivery address..."
        onExportCsv={filteredRemainingItems.length > 0 ? handleExportCsv : undefined}
        title="Partially Dispatched Orders"
        subtitle={`Showing ${filteredRemainingItems.length} order${filteredRemainingItems.length !== 1 ? "s" : ""} with remaining quantity`}
      />

      {/* Loading State */}
      {isLoading && <DispatchLoadingState count={5} />}

      {/* Error State */}
      {error && !isLoading && <DispatchErrorState onRetry={() => refetch()} />}

      {/* Empty State */}
      {!isLoading && !error && filteredRemainingItems.length === 0 && (
        <DispatchEmptyState
          title={search ? "No Matching Partial Orders" : "No Remaining Quantities"}
          description={
            search
              ? `No partially dispatched orders match "${search}". Try clearing your search.`
              : "All active orders are either completely fresh or 100% fulfilled. When an order is partially dispatched (e.g. 50 out of 100 units), the remaining units will appear here automatically."
          }
          onRetry={() => refetch()}
        />
      )}

      {/* Desktop Table (≥ 768px) */}
      {!isLoading && !error && filteredRemainingItems.length > 0 && (
        <>
          <div className="hidden md:block">
            <DispatchTableCard minTableWidth={1200}>
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="dsp-th" style={{ width: 170 }}>Order Number</th>
                    <th className="dsp-th" style={{ width: 220 }}>Customer & Destination</th>
                    <th className="dsp-th" style={{ width: 220 }}>Product Item</th>
                    <th className="dsp-th text-center" style={{ width: 110 }}>Ordered</th>
                    <th className="dsp-th text-center" style={{ width: 120 }}>Dispatched</th>
                    <th className="dsp-th text-center" style={{ width: 140 }}>Remaining</th>
                    <th className="dsp-th" style={{ width: 160 }}>Fulfillment Progress</th>
                    <th className="dsp-th text-right" style={{ width: 160 }}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredRemainingItems.map((item) => {
                    const pct = Math.round((item.dispatchedQuantity / item.orderedQuantity) * 100);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Order Number */}
                        <td className="dsp-td">
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <SalesOrderNumberBadge orderNumber={item.orderNumber} />
                            <button
                              type="button"
                              onClick={() => copyToClipboard(item.orderNumber)}
                              title="Copy Order #"
                              style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                color: "#94a3b8",
                                padding: 2,
                              }}
                            >
                              {copiedOrder === item.orderNumber ? (
                                <Check size={13} color="#16a34a" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                          {item.workOrderNumber && (
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#64748b",
                                fontFamily: "monospace",
                                display: "block",
                                marginTop: 3,
                              }}
                            >
                              Job: #{item.workOrderNumber}
                            </span>
                          )}
                        </td>

                        {/* Customer & Address */}
                        <td className="dsp-td">
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <span
                              style={{
                                fontWeight: 700,
                                color: "#0f172a",
                                fontSize: "13px",
                                display: "block",
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={item.customerName}
                            >
                              {item.customerName}
                            </span>
                            <span
                              style={{
                                fontSize: "11.5px",
                                color: "#64748b",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={item.deliveryAddress}
                            >
                              <MapPin size={11} style={{ flexShrink: 0, color: "#94a3b8" }} />
                              {item.deliveryAddress}
                            </span>
                          </div>
                        </td>

                        {/* Product Item */}
                        <td className="dsp-td">
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span
                              style={{
                                fontWeight: 700,
                                color: "#1e293b",
                                fontSize: "13px",
                                display: "block",
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={item.productName}
                            >
                              {item.productName}
                            </span>
                            {item.productSku && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#64748b",
                                  fontFamily: "monospace",
                                  background: "#f1f5f9",
                                  padding: "1px 5px",
                                  borderRadius: 4,
                                  width: "fit-content",
                                }}
                              >
                                SKU: {item.productSku}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Ordered Quantity */}
                        <td className="dsp-td text-center">
                          <span style={{ fontWeight: 700, color: "#334155", fontSize: "13px" }}>
                            {item.orderedQuantity} {item.unit || "Pcs"}
                          </span>
                        </td>

                        {/* Already Dispatched */}
                        <td className="dsp-td text-center">
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "3px 8px",
                              borderRadius: 6,
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              color: "#166534",
                              fontSize: "12px",
                              fontWeight: 700,
                            }}
                          >
                            <CheckCircle2 size={12} />
                            {item.dispatchedQuantity} {item.unit || "Pcs"}
                          </span>
                        </td>

                        {/* Remaining to Dispatch */}
                        <td className="dsp-td text-center">
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "4px 10px",
                              borderRadius: 8,
                              background: "#fffbeb",
                              border: "1px solid #fde68a",
                              color: "#b45309",
                              fontSize: "13px",
                              fontWeight: 800,
                            }}
                          >
                            <Clock size={13} />
                            {item.remainingQuantity} {item.unit || "Pcs"}
                          </span>
                        </td>

                        {/* Fulfillment Progress */}
                        <td className="dsp-td">
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700 }}>
                              <span style={{ color: "#2563eb" }}>{pct}% complete</span>
                              <span style={{ color: "#64748b" }}>
                                {item.dispatchedQuantity}/{item.orderedQuantity}
                              </span>
                            </div>
                            <div className={styles.progressBarBg}>
                              <div
                                className={styles.progressBarFill}
                                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Action: Create Dispatch */}
                        <td className="dsp-td text-right">
                          <DispatchActionButton
                            label="Create Dispatch"
                            icon={ArrowRight}
                            onClick={() => handleCreateDispatch(item)}
                            variant="primary"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </DispatchTableCard>
          </div>

          {/* Mobile Card Grid (< 768px) */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 dispatch-mobile-card-grid">
            {filteredRemainingItems.map((item) => {
              const pct = Math.round((item.dispatchedQuantity / item.orderedQuantity) * 100);

              return (
                <div key={item.id} className={styles.remainingCard}>
                  {/* Head */}
                  <div className={styles.cardHead}>
                    <SalesOrderNumberBadge orderNumber={item.orderNumber} />
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        color: "#b45309",
                        fontSize: "11.5px",
                        fontWeight: 800,
                      }}
                    >
                      {item.remainingQuantity} {item.unit || "Pcs"} Left
                    </span>
                  </div>

                  {/* Body */}
                  <div className={styles.cardBody}>
                    <div className={styles.cardRow}>
                      <span className={styles.cardKey}>Customer</span>
                      <span className={styles.cardVal}>{item.customerName}</span>
                    </div>

                    <div className={styles.cardRow}>
                      <span className={styles.cardKey}>Product</span>
                      <span className={styles.cardVal}>{item.productName}</span>
                    </div>

                    <div className={styles.cardRow}>
                      <span className={styles.cardKey}>Ordered Qty</span>
                      <span className={styles.cardVal}>{item.orderedQuantity} {item.unit || "Pcs"}</span>
                    </div>

                    <div className={styles.cardRow}>
                      <span className={styles.cardKey}>Dispatched</span>
                      <span className={styles.cardVal} style={{ color: "#16a34a" }}>
                        {item.dispatchedQuantity} {item.unit || "Pcs"}
                      </span>
                    </div>

                    <div className={styles.cardRow}>
                      <span className={styles.cardKey}>Remaining</span>
                      <span className={styles.cardVal} style={{ color: "#b45309", fontWeight: 800 }}>
                        {item.remainingQuantity} {item.unit || "Pcs"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, marginBottom: 4 }}>
                        <span style={{ color: "#2563eb" }}>{pct}% complete</span>
                        <span style={{ color: "#64748b" }}>{item.dispatchedQuantity}/{item.orderedQuantity}</span>
                      </div>
                      <div className={styles.progressBarBg}>
                        <div
                          className={styles.progressBarFill}
                          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Foot */}
                  <div className={styles.cardFoot}>
                    <button
                      type="button"
                      onClick={() => handleCreateDispatch(item)}
                      className="dsp-confirm-btn"
                    >
                      <Truck size={15} />
                      <span>Create Dispatch ({item.remainingQuantity} {item.unit || "Pcs"})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </DispatchPageShell>
  );
}

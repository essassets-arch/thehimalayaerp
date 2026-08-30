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
  History,
  CheckCircle2,
  Image as ImageIcon,
  ExternalLink,
  X,
  Phone,
  Calendar,
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
  DispatchStatusBadge,
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

interface HistoryDispatch {
  id: string;
  dispatchNo: string;
  status: string;
  receivedBy: string | null;
  receiverPhone: string | null;
  deliveredAt: string | null;
  dispatchedAt: string | null;
  driverName: string | null;
  vehicleNumber: string | null;
  podUrl: string | null;
  salesOrder: {
    orderNumber: string;
    customer: {
      companyName: string;
    };
  };
}

function normalizeKey(str?: string | null): string {
  if (!str) return "";
  return String(str).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
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

  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [search, setSearch] = useState("");
  const [selectedPodImage, setSelectedPodImage] = useState<string | null>(null);

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

  // Query 1: Pending Queue items
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

      const [workOrdersPayload, salesOrdersPayload, finishedGoodsPayload, queuePayload, activeDispatchesPayload] = await Promise.allSettled([
        backendFetch<any>("/api/backend/production/work-orders?status=READY_FOR_DISPATCH"),
        backendFetch<any>("/api/backend/sales/orders?status=READY_FOR_DISPATCH"),
        backendFetch<any>("/api/backend/production/finished-goods"),
        backendFetch<any>("/api/backend/logistics/dispatches/queue"),
        backendFetch<any>("/api/backend/logistics/dispatches"),
      ]);

      const workOrders: WorkOrder[] =
        workOrdersPayload.status === "fulfilled" ? extractArray(workOrdersPayload.value) : [];

      const rawSalesOrders =
        salesOrdersPayload.status === "fulfilled" ? extractArray(salesOrdersPayload.value) : [];

      const rawFinishedGoods =
        finishedGoodsPayload.status === "fulfilled" ? extractArray(finishedGoodsPayload.value) : [];

      const rawQueue =
        queuePayload.status === "fulfilled" ? extractArray(queuePayload.value) : [];

      const rawActiveDispatches =
        activeDispatchesPayload.status === "fulfilled" ? extractArray(activeDispatchesPayload.value) : [];

      // Collect all active/delivered order identifiers to exclude from pending
      const dispatchedOrderIds = new Set<string>();
      const dispatchedOrderNumbers = new Set<string>();
      const dispatchedWorkOrderIds = new Set<string>();
      const dispatchedItemIds = new Set<string>();

      rawActiveDispatches.forEach((d: any) => {
        const st = String(d.status || "").toUpperCase();
        if (["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "DISPATCHED", "SHIPPED", "COMPLETED"].includes(st)) {
          if (d.salesOrderId) {
            dispatchedOrderIds.add(String(d.salesOrderId).toLowerCase());
            dispatchedOrderIds.add(normalizeKey(d.salesOrderId));
          }
          if (d.salesOrder?.id) {
            dispatchedOrderIds.add(String(d.salesOrder.id).toLowerCase());
            dispatchedOrderIds.add(normalizeKey(d.salesOrder.id));
          }
          if (d.salesOrder?.orderNumber) {
            dispatchedOrderNumbers.add(normalizeKey(d.salesOrder.orderNumber));
          }
          if (d.dispatchNo) {
            dispatchedOrderNumbers.add(normalizeKey(d.dispatchNo));
          }
          if (Array.isArray(d.items)) {
            d.items.forEach((it: any) => {
              if (it.salesOrderItemId) dispatchedItemIds.add(String(it.salesOrderItemId).toLowerCase());
              if (it.workOrderId) dispatchedWorkOrderIds.add(String(it.workOrderId).toLowerCase());
              if (it.salesOrderItem?.id) dispatchedItemIds.add(String(it.salesOrderItem.id).toLowerCase());
            });
          }
        }
      });

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
          const qtyVal = fg.availableQuantity ?? fg.quantity ?? 0;
          const qty = typeof qtyVal === "number" ? qtyVal : parseFloat(String(qtyVal)) || 0;

          if (qty <= 0) return false;
          return ["AVAILABLE", "READY_FOR_DISPATCH", "QC_APPROVED", "PASSED", "STAGED", "IN_STAGING", "PENDING_HANDOFF"].includes(s);
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

      const isSamePendingItem = (a: UnifiedPendingDispatchItem, b: UnifiedPendingDispatchItem): boolean => {
        if (!a || !b) return false;
        if (a.id === b.id) return true;
        if (a.workOrderId && b.workOrderId && a.workOrderId === b.workOrderId) return true;
        if (a.salesOrderItemId && b.salesOrderItemId && a.salesOrderItemId === b.salesOrderItemId) return true;
        if (a.salesOrderId && b.salesOrderId && a.salesOrderId === b.salesOrderId) {
          if (a.productId && b.productId && a.productId === b.productId) return true;
          const pA = String(a.productName || '').trim().toLowerCase();
          const pB = String(b.productName || '').trim().toLowerCase();
          if (pA && pB && pA === pB) return true;
        }
        const oA = normalizeKey(a.orderNumber);
        const oB = normalizeKey(b.orderNumber);
        if (oA && oB && oA === oB) {
          if (a.productId && b.productId && a.productId === b.productId) return true;
          const pA = String(a.productName || '').trim().toLowerCase();
          const pB = String(b.productName || '').trim().toLowerCase();
          if (pA && pB && pA === pB) return true;
        }
        return false;
      };

      const mergePendingItem = (existing: UnifiedPendingDispatchItem, incoming: UnifiedPendingDispatchItem): UnifiedPendingDispatchItem => {
        const hasSpecificAddress = (addr?: string) =>
          addr && addr !== 'N/A' && addr !== 'Factory Staging Area' && addr.trim().length > 5;

        const deliveryAddress = hasSpecificAddress(incoming.deliveryAddress)
          ? incoming.deliveryAddress
          : hasSpecificAddress(existing.deliveryAddress)
          ? existing.deliveryAddress
          : incoming.deliveryAddress || existing.deliveryAddress;

        const customerName = (incoming.customerName && incoming.customerName !== 'N/A' && incoming.customerName !== 'Factory Stock Staging')
          ? incoming.customerName
          : existing.customerName;

        return {
          ...existing,
          ...incoming,
          deliveryAddress,
          customerName,
          salesOrderId: incoming.salesOrderId || existing.salesOrderId,
          salesOrderItemId: incoming.salesOrderItemId || existing.salesOrderItemId,
          workOrderId: incoming.workOrderId || existing.workOrderId,
          workOrderNumber: incoming.workOrderNumber || existing.workOrderNumber,
          productId: incoming.productId || existing.productId,
          productName: incoming.productName || existing.productName,
          dispatchCategory: incoming.dispatchCategory || existing.dispatchCategory || 'D1',
          approvedQuantity: incoming.approvedQuantity || existing.approvedQuantity,
        };
      };

      const combined: UnifiedPendingDispatchItem[] = [];
      const addOrMerge = (item: UnifiedPendingDispatchItem) => {
        const existingIdx = combined.findIndex((c) => isSamePendingItem(c, item));
        if (existingIdx >= 0) {
          combined[existingIdx] = mergePendingItem(combined[existingIdx], item);
        } else {
          combined.push(item);
        }
      };

      unifiedWorkOrders.forEach(addOrMerge);
      unifiedFinishedGoods.forEach(addOrMerge);
      unifiedDirectDispatches.forEach(addOrMerge);
      unifiedSalesOrders.forEach(addOrMerge);

      const isAlreadyDispatched = (item: UnifiedPendingDispatchItem): boolean => {
        if (item.salesOrderId) {
          const sId = String(item.salesOrderId).toLowerCase();
          if (dispatchedOrderIds.has(sId) || dispatchedOrderIds.has(normalizeKey(item.salesOrderId))) return true;
        }
        if (item.workOrderId && dispatchedWorkOrderIds.has(String(item.workOrderId).toLowerCase())) return true;
        if (item.salesOrderItemId && dispatchedItemIds.has(String(item.salesOrderItemId).toLowerCase())) return true;
        
        const normNo = normalizeKey(item.orderNumber);
        if (normNo && dispatchedOrderNumbers.has(normNo)) return true;

        return false;
      };

      return combined.filter((item) => !isAlreadyDispatched(item));
    },
    refetchInterval: 30000,
  });

  // Query 2: History dispatches for inline history tab
  const { data: historyDispatches = [], isLoading: isHistoryLoading, refetch: refetchHistory } = useQuery<HistoryDispatch[]>({
    queryKey: ["delivery-history-dispatches"],
    queryFn: async () => {
      const payload = await backendFetch<any>("/api/backend/logistics/dispatches?status=DELIVERED");
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
    refetchInterval: 30000,
  });

  const filteredPendingItems = useMemo(() => {
    return pendingItems.filter((item) => {
      const productCat = item.dispatchCategory || "D1";
      const c1 = String(productCat).trim().toUpperCase();
      const c2 = String(userDispatchCat).trim().toUpperCase();

      let matchCategory = false;
      if (c1 === c2) matchCategory = true;
      else if ((c1 === "D1" || c1 === "DISPATCH 1" || c1 === "DISPATCH_1") && (c2 === "D1" || c2 === "DISPATCH 1")) matchCategory = true;
      else if ((c1 === "D2" || c1 === "DISPATCH 2" || c1 === "DISPATCH_2") && (c2 === "D2" || c2 === "DISPATCH 2")) matchCategory = true;

      if (!matchCategory) return false;

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

  const filteredHistoryItems = useMemo(() => {
    const targetCat = isDispatch2 ? "D2" : "D1";
    const categoryFiltered = historyDispatches.filter((d) => {
      if (String(d.status || "").toUpperCase() !== "DELIVERED") return false;
      const cat = String((d as any).dispatchCategory || (d as any).dispatch_category || "D1").toUpperCase();
      if (targetCat === "D1") return cat === "D1" || cat === "DISPATCH 1" || cat === "DISPATCH_1";
      if (targetCat === "D2") return cat === "D2" || cat === "DISPATCH 2" || cat === "DISPATCH_2";
      return true;
    });

    const sorted = [...categoryFiltered].sort((a, b) => {
      const tA = new Date(a.deliveredAt || (a as any).createdAt || 0).getTime();
      const tB = new Date(b.deliveredAt || (b as any).createdAt || 0).getTime();
      return tB - tA;
    });

    if (!search.trim()) return sorted;
    const lower = search.toLowerCase();
    return sorted.filter(
      (d) =>
        d.dispatchNo?.toLowerCase().includes(lower) ||
        d.salesOrder?.orderNumber?.toLowerCase().includes(lower) ||
        d.salesOrder?.customer?.companyName?.toLowerCase().includes(lower) ||
        d.receivedBy?.toLowerCase().includes(lower) ||
        d.receiverPhone?.toLowerCase().includes(lower) ||
        d.driverName?.toLowerCase().includes(lower)
    );
  }, [historyDispatches, search, isDispatch2]);

  const handleCreateDispatch = (item: UnifiedPendingDispatchItem) => {
    const params = new URLSearchParams();
    if (item.salesOrderId && !item.salesOrderId.includes("/")) {
      params.set("salesOrderId", item.salesOrderId);
    }
    if (item.workOrderId && !item.workOrderId.includes("/") && item.workOrderId !== item.orderNumber) {
      params.set("workOrderId", item.workOrderId);
    }
    if (item.salesOrderItemId && !item.salesOrderItemId.includes("/")) {
      params.set("salesOrderItemId", item.salesOrderItemId);
    }
    router.push(`${basePath}/create-dispatch?${params.toString()}`);
  };

  const handleExportCsv = () => {
    if (activeTab === "pending") {
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
    } else {
      if (!filteredHistoryItems.length) return;
      const exportRows = filteredHistoryItems.map((d) => ({
        "Dispatch Number": (d.dispatchNo || "").replace(/\s+/g, ""),
        "Sales Order": d.salesOrder?.orderNumber || "—",
        Customer: d.salesOrder?.customer?.companyName || "—",
        "Received By": d.receivedBy || "—",
        "Receiver Mobile": d.receiverPhone || "—",
        Driver: d.driverName || "—",
        "Delivered Timestamp": d.deliveredAt ? new Date(d.deliveredAt).toLocaleString("en-IN") : "—",
        Status: d.status,
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
      link.download = `dispatch_history_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    }
  };

  const formatCleanNo = (num?: string | null) => {
    if (!num) return "—";
    return num.replace(/\s*-\s*/g, "-").replace(/\s+/g, "");
  };

  return (
    <DispatchPageShell>
      {/* Navigation Tabs */}
      <DispatchNavigationTabs />

      {/* Page Header */}
      <DispatchPageHeader
        title={activeTab === "pending" ? "Pending Dispatches" : "Dispatch History & POD"}
        description={
          activeTab === "pending"
            ? "Create dispatch gate passes for manufacturing work orders and trading sales orders ready to be shipped."
            : "Review all completed and delivered shipments with verified receiver details and POD image proofs."
        }
        eyebrow="Queue Management"
        icon={activeTab === "pending" ? Truck : History}
        stats={[
          {
            label: "Awaiting Dispatch",
            value: filteredPendingItems.length,
            icon: Package,
            color: "bg-indigo-50 text-indigo-600",
          },
          {
            label: "Delivered History",
            value: filteredHistoryItems.length,
            icon: CheckCircle2,
            color: "bg-emerald-50 text-emerald-600",
          },
        ]}
        onRefresh={() => {
          refetch();
          refetchHistory();
        }}
        isRefreshing={isRefetching || isHistoryLoading}
      />

      {/* Sub-Tab Switcher */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 18px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s ease",
            background: activeTab === "pending" ? "#2563eb" : "#ffffff",
            color: activeTab === "pending" ? "#ffffff" : "#64748b",
            border: activeTab === "pending" ? "1px solid #2563eb" : "1px solid #e2e8f0",
            boxShadow: activeTab === "pending" ? "0 1px 2px rgba(37,99,235,0.2)" : "none",
          }}
        >
          <Package size={15} />
          <span>Pending Queue</span>
          <span
            style={{
              padding: "1px 7px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              background: activeTab === "pending" ? "rgba(255,255,255,0.25)" : "#f1f5f9",
              color: activeTab === "pending" ? "#ffffff" : "#475569",
            }}
          >
            {filteredPendingItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 18px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s ease",
            background: activeTab === "history" ? "#2563eb" : "#ffffff",
            color: activeTab === "history" ? "#ffffff" : "#64748b",
            border: activeTab === "history" ? "1px solid #2563eb" : "1px solid #e2e8f0",
            boxShadow: activeTab === "history" ? "0 1px 2px rgba(37,99,235,0.2)" : "none",
          }}
        >
          <History size={15} />
          <span>Dispatch History</span>
          <span
            style={{
              padding: "1px 7px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              background: activeTab === "history" ? "rgba(255,255,255,0.25)" : "#f1f5f9",
              color: activeTab === "history" ? "#ffffff" : "#475569",
            }}
          >
            {filteredHistoryItems.length}
          </span>
        </button>
      </div>

      {/* Toolbar / Search Filter */}
      <DispatchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          activeTab === "pending"
            ? "Search order number, customer, product or delivery address..."
            : "Search dispatch number, order number, customer, driver or receiver..."
        }
        onExportCsv={
          (activeTab === "pending" ? filteredPendingItems.length : filteredHistoryItems.length) > 0
            ? handleExportCsv
            : undefined
        }
        title={activeTab === "pending" ? "Pending Queue" : "Completed History"}
        subtitle={
          activeTab === "pending"
            ? `Showing ${filteredPendingItems.length} order${filteredPendingItems.length !== 1 ? "s" : ""} ready for dispatch`
            : `Showing ${filteredHistoryItems.length} completed delivery record${filteredHistoryItems.length !== 1 ? "s" : ""}`
        }
      />

      {/* ── TAB 1: PENDING QUEUE ── */}
      {activeTab === "pending" && (
        <>
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
              {/* Desktop Table View */}
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

              {/* Mobile Cards View */}
              <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 dispatch-mobile-card-grid">
                {filteredPendingItems.map((item) => (
                  <div key={item.id} className="dsp-card">
                    <div className="dsp-card-head">
                      <div className="dsp-card-head-row">
                        <SalesOrderNumberBadge orderNumber={item.orderNumber} />
                        <DispatchTypeBadge type={item.itemType === "TRADING_SALES_ORDER" ? "TRADING" : "MFG"} />
                      </div>
                    </div>

                    <div className="dsp-card-body">
                      <div className="dsp-card-row">
                        <div className="dsp-card-icon">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="dsp-card-info">
                          <p className="dsp-card-label">Customer</p>
                          <p className="dsp-card-value truncate max-w-[240px]">{item.customerName}</p>
                        </div>
                      </div>

                      <div className="dsp-card-row">
                        <div className="dsp-card-icon">
                          <Package className="w-4 h-4" />
                        </div>
                        <div className="dsp-card-info">
                          <p className="dsp-card-label">Product</p>
                          <p className="dsp-card-value truncate max-w-[240px]">{item.productName}</p>
                        </div>
                      </div>

                      <div className="dsp-card-row">
                        <div className="dsp-card-icon">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="dsp-card-info">
                          <p className="dsp-card-label">Delivery Address</p>
                          <p className="dsp-card-value truncate max-w-[240px]">{item.deliveryAddress}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                          <p className="dsp-card-label">Approved Qty</p>
                          <p className="text-sm font-bold text-slate-800">{item.approvedQuantity}</p>
                        </div>
                        <DispatchActionButton
                          label="Create Dispatch"
                          icon={FileText}
                          onClick={() => handleCreateDispatch(item)}
                          variant="primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ── TAB 2: DISPATCH HISTORY ── */}
      {activeTab === "history" && (
        <>
          {/* Loading State */}
          {isHistoryLoading && <DispatchLoadingState count={5} />}

          {/* Empty State */}
          {!isHistoryLoading && filteredHistoryItems.length === 0 && (
            <DispatchEmptyState
              title={search ? "No Matching History Found" : "No Completed Deliveries"}
              description={
                search
                  ? `No delivered shipments match "${search}". Try clearing your search filter.`
                  : "No completed delivery records yet. Confirmed deliveries will appear here."
              }
              onRetry={() => refetchHistory()}
            />
          )}

          {/* History Table */}
          {!isHistoryLoading && filteredHistoryItems.length > 0 && (
            <DispatchTableCard minTableWidth={1120}>
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="dsp-th" style={{ width: 150 }}>Dispatch No.</th>
                    <th className="dsp-th" style={{ width: 155 }}>Sales Order</th>
                    <th className="dsp-th" style={{ width: 180 }}>Customer</th>
                    <th className="dsp-th" style={{ width: 220 }}>Receiver Details</th>
                    <th className="dsp-th" style={{ width: 180 }}>Driver / Vehicle</th>
                    <th className="dsp-th" style={{ width: 170 }}>Delivered At</th>
                    <th className="dsp-th text-center" style={{ width: 110 }}>POD Proof</th>
                    <th className="dsp-th text-center" style={{ width: 130 }}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredHistoryItems.map((dispatchItem) => {
                    const cleanDispNo = formatCleanNo(dispatchItem.dispatchNo);
                    const cleanSoNo = formatCleanNo(dispatchItem.salesOrder?.orderNumber);

                    return (
                      <tr
                        key={dispatchItem.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Dispatch Number */}
                        <td className="dsp-td">
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "4px 8px",
                              borderRadius: 8,
                              background: "#eff6ff",
                              border: "1px solid #bfdbfe",
                              color: "#1d4ed8",
                              fontWeight: 700,
                              fontFamily: "monospace",
                              fontSize: 12,
                            }}
                          >
                            <Truck style={{ width: 14, height: 14, color: "#3b82f6" }} />
                            #{cleanDispNo}
                          </span>
                        </td>

                        {/* Sales Order */}
                        <td className="dsp-td">
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "3px 8px",
                              borderRadius: 6,
                              background: "#f1f5f9",
                              border: "1px solid #e2e8f0",
                              color: "#0f172a",
                              fontWeight: 700,
                              fontFamily: "monospace",
                              fontSize: 12,
                            }}
                          >
                            #{cleanSoNo}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="dsp-td">
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: "50%",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                color: "#475569",
                                fontWeight: 800,
                                fontSize: 11,
                                display: "grid",
                                placeItems: "center",
                                textTransform: "uppercase",
                                flexShrink: 0,
                              }}
                            >
                              {(dispatchItem.salesOrder?.customer?.companyName || "C")[0]}
                            </div>
                            <span
                              style={{
                                fontWeight: 700,
                                color: "#0f172a",
                                fontSize: 13,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "block",
                                maxWidth: 150,
                              }}
                              title={dispatchItem.salesOrder?.customer?.companyName || "—"}
                            >
                              {dispatchItem.salesOrder?.customer?.companyName || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Receiver Details */}
                        <td className="dsp-td">
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <User style={{ width: 13, height: 13, color: "#64748b" }} />
                              <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>
                                {dispatchItem.receivedBy || "—"}
                              </span>
                            </div>
                            {dispatchItem.receiverPhone && (
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <Phone style={{ width: 12, height: 12, color: "#16a34a" }} />
                                <a
                                  href={`tel:${dispatchItem.receiverPhone}`}
                                  style={{
                                    color: "#16a34a",
                                    fontSize: 11,
                                    fontFamily: "monospace",
                                    fontWeight: 700,
                                    textDecoration: "none",
                                  }}
                                >
                                  +91 {dispatchItem.receiverPhone}
                                </a>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Driver / Vehicle */}
                        <td className="dsp-td">
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{ fontWeight: 600, color: "#334155", fontSize: 13 }}>
                              {dispatchItem.driverName || "—"}
                            </span>
                            {dispatchItem.vehicleNumber && (
                              <span
                                style={{
                                  display: "inline-block",
                                  width: "max-content",
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  background: "#f1f5f9",
                                  border: "1px solid #cbd5e1",
                                  color: "#475569",
                                  fontFamily: "monospace",
                                  fontSize: 11,
                                  fontWeight: 700,
                                }}
                              >
                                {dispatchItem.vehicleNumber}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Delivered At */}
                        <td className="dsp-td">
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Calendar style={{ width: 13, height: 13, color: "#64748b" }} />
                            <span style={{ color: "#334155", fontSize: 12, fontWeight: 600 }}>
                              {dispatchItem.deliveredAt
                                ? new Date(dispatchItem.deliveredAt).toLocaleString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "—"}
                            </span>
                          </div>
                        </td>

                        {/* POD Image */}
                        <td className="dsp-td text-center">
                          {dispatchItem.podUrl ? (
                            <button
                              type="button"
                              onClick={() => setSelectedPodImage(dispatchItem.podUrl)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "4px 8px",
                                borderRadius: 6,
                                background: "#f0fdf4",
                                border: "1px solid #bbf7d0",
                                color: "#166534",
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              <ImageIcon style={{ width: 12, height: 12 }} />
                              <span>View POD</span>
                            </button>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: 11, fontStyle: "italic" }}>
                              No image
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="dsp-td text-center">
                          <DispatchStatusBadge status={dispatchItem.status || "DELIVERED"} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </DispatchTableCard>
          )}
        </>
      )}

      {/* POD Image Lightbox Modal */}
      {selectedPodImage && (
        <div
          role="presentation"
          onClick={() => setSelectedPodImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            role="dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "20px",
              maxWidth: "600px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                Proof of Delivery (POD)
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <a
                  href={selectedPodImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#2563eb",
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink style={{ width: 14, height: 14 }} />
                  Open Full Size
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedPodImage(null)}
                  style={{
                    border: "none",
                    background: "#f1f5f9",
                    borderRadius: "8px",
                    padding: "6px",
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <X style={{ width: 16, height: 16, color: "#64748b" }} />
                </button>
              </div>
            </div>

            <div
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                background: "#000",
                maxHeight: "70vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPodImage}
                alt="Proof of Delivery"
                style={{ width: "100%", maxHeight: "68vh", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      )}
    </DispatchPageShell>
  );
}

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
  Search,
  RefreshCw,
  Download,
  Boxes,
  Factory,
  ArrowRight,
  ShieldCheck,
  Copy,
  Layers,
  Clock,
} from "lucide-react";

import { backendFetch } from "@/lib/backendFetch";
import { useAuth } from "@/shared/context/AuthContext";
import styles from "./dispatch-orders.module.css";

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
  product?: {
    name?: string;
    sku?: string;
    dispatchCategory?: string;
    dispatch_category?: string;
  };
}

interface ProductionPlan {
  id: string;
  salesOrder?: SalesOrder;
}

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  status: string;
  productionStatus?: string;
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

export interface UnifiedPendingDispatchItem {
  id: string;
  itemType: "WORK_ORDER" | "TRADING_SALES_ORDER";
  orderNumber: string;
  customerName: string;
  projectName?: string;
  deliveryAddress: string;
  productName: string;
  productSku?: string;
  orderedQuantity?: number;
  dispatchedQuantity?: number;
  remainingQuantity?: number;
  isPartiallyDispatched?: boolean;
  approvedQuantity: string | number;
  salesOrderId?: string;
  salesOrderItemId?: string;
  workOrderId?: string;
  workOrderNumber?: string;
  productId?: string;
  dispatchCategory?: string;
}

interface PendingOrderGroup {
  orderKey: string;
  orderNumber: string;
  customerName: string;
  projectName?: string;
  deliveryAddress: string;
  salesOrderId?: string;
  totalQty: number;
  totalOrderedQty?: number;
  totalDispatchedQty?: number;
  isPartiallyDispatched?: boolean;
  items: UnifiedPendingDispatchItem[];
}

function normalizeKey(str?: string | null): string {
  if (!str) return "";
  return String(str).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function isValidCustomerName(name?: any): boolean {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower === "n/a" ||
    lower === "na" ||
    lower === "null" ||
    lower === "undefined" ||
    lower === "factory stock staging" ||
    lower === "factory staging area" ||
    lower === "consignee client" ||
    lower === "customer designated delivery site" ||
    lower === "direct dispatch item" ||
    lower === "unknown" ||
    lower === "unknown customer" ||
    lower === "none" ||
    lower === "finished product" ||
    trimmed === "—" ||
    trimmed === "-" ||
    trimmed === "--"
  ) {
    return false;
  }
  return true;
}

function resolveCustomerName(entity?: any, ...fallbackEntities: any[]): string {
  const allEntities = [entity, ...fallbackEntities].filter(Boolean);

  for (const obj of allEntities) {
    if (!obj) continue;

    if (typeof obj === "string") {
      if (isValidCustomerName(obj)) return obj.trim();
      continue;
    }

    if (typeof obj !== "object") continue;

    const directCandidates = [
      // 1. Direct customer relation
      obj.customer?.companyName,
      obj.customer?.name,
      obj.customer?.partyName,
      obj.customer?.buyerName,
      obj.customer?.clientName,
      obj.customer?.gstName,

      // 2. Direct name properties
      obj.customerName,
      obj.customerNameSnapshot,
      obj.clientName,
      obj.companyName,
      obj.partyName,
      obj.buyerName,

      // 3. Lead attached to quotation
      obj.quotation?.lead?.companyName,
      obj.quotation?.lead?.projectName,
      obj.quotation?.lead?.name,
      obj.quotation?.lead?.customerName,
      obj.quotation?.lead?.gstName,
      obj.quotation?.customerName,
      obj.quotation?.customer?.companyName,
      obj.quotation?.customer?.name,

      // 4. Lead attached to sourceQuotation
      obj.sourceQuotation?.lead?.companyName,
      obj.sourceQuotation?.lead?.projectName,
      obj.sourceQuotation?.lead?.name,
      obj.sourceQuotation?.lead?.customerName,
      obj.sourceQuotation?.lead?.gstName,
      obj.sourceQuotation?.customerName,
      obj.sourceQuotation?.customer?.companyName,
      obj.sourceQuotation?.customer?.name,

      // 5. Direct lead relation
      obj.lead?.companyName,
      obj.lead?.projectName,
      obj.lead?.name,
      obj.lead?.customerName,
      obj.lead?.gstName,

      // 6. Nested productionPlan -> salesOrder (Work Orders)
      obj.productionPlan?.salesOrder?.customer?.companyName,
      obj.productionPlan?.salesOrder?.customer?.name,
      obj.productionPlan?.salesOrder?.customerName,
      obj.productionPlan?.salesOrder?.customerNameSnapshot,
      obj.productionPlan?.salesOrder?.quotation?.lead?.companyName,
      obj.productionPlan?.salesOrder?.quotation?.lead?.projectName,
      obj.productionPlan?.salesOrder?.quotation?.customerName,
      obj.productionPlan?.salesOrder?.sourceQuotation?.lead?.companyName,
      obj.productionPlan?.salesOrder?.sourceQuotation?.lead?.projectName,
      obj.productionPlan?.salesOrder?.sourceQuotation?.customerName,
      obj.productionPlan?.salesOrder?.lead?.companyName,
      obj.productionPlan?.salesOrder?.lead?.projectName,

      // 7. Direct nested salesOrder (Work Orders / Finished Goods / Dispatches)
      obj.salesOrder?.customer?.companyName,
      obj.salesOrder?.customer?.name,
      obj.salesOrder?.customerName,
      obj.salesOrder?.customerNameSnapshot,
      obj.salesOrder?.quotation?.lead?.companyName,
      obj.salesOrder?.quotation?.lead?.projectName,
      obj.salesOrder?.quotation?.customerName,
      obj.salesOrder?.sourceQuotation?.lead?.companyName,
      obj.salesOrder?.sourceQuotation?.lead?.projectName,
      obj.salesOrder?.sourceQuotation?.customerName,
      obj.salesOrder?.lead?.companyName,
      obj.salesOrder?.lead?.projectName,

      // 8. Nested workOrder (Finished Goods)
      obj.workOrder?.productionPlan?.salesOrder?.customer?.companyName,
      obj.workOrder?.productionPlan?.salesOrder?.customerName,
      obj.workOrder?.productionPlan?.salesOrder?.quotation?.lead?.companyName,
      obj.workOrder?.productionPlan?.salesOrder?.sourceQuotation?.lead?.companyName,
      obj.workOrder?.customer?.companyName,
      obj.workOrder?.customerName,
      obj.workOrder?.companyName,

      // 9. Project fallback
      obj.projectName,
      obj.siteName,
    ];

    for (const cand of directCandidates) {
      if (isValidCustomerName(cand)) {
        return String(cand).trim();
      }
    }
  }

  return "Consignee Client";
}

function resolveProjectName(entity?: any, ...fallbackEntities: any[]): string {
  const allEntities = [entity, ...fallbackEntities].filter(Boolean);
  for (const obj of allEntities) {
    if (!obj || typeof obj !== "object") continue;
    const candidates = [
      obj.projectName,
      obj.siteName,
      obj.lead?.projectName,
      obj.quotation?.lead?.projectName,
      obj.sourceQuotation?.lead?.projectName,
      obj.productionPlan?.salesOrder?.quotation?.lead?.projectName,
      obj.productionPlan?.salesOrder?.sourceQuotation?.lead?.projectName,
      obj.productionPlan?.salesOrder?.projectName,
      obj.salesOrder?.quotation?.lead?.projectName,
      obj.salesOrder?.sourceQuotation?.lead?.projectName,
      obj.salesOrder?.projectName,
      obj.workOrder?.productionPlan?.salesOrder?.quotation?.lead?.projectName,
    ];
    for (const cand of candidates) {
      if (cand && typeof cand === "string" && cand.trim().length > 1 && cand.trim() !== "N/A") {
        return cand.trim();
      }
    }
  }
  return "";
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

function formatAddress(salesOrder?: any, customer?: any, workOrder?: any, fallbackSo?: any): string {
  const candidates = [
    // 1. Explicit shipping/delivery address on Sales Order (added by sales)
    salesOrder?.shippingAddress,
    salesOrder?.deliveryAddress,
    salesOrder?.siteAddress,
    salesOrder?.deliveryLocation,
    salesOrder?.destination,
    salesOrder?.billingAddress,

    // 2. Fallback SO if available
    fallbackSo?.shippingAddress,
    fallbackSo?.deliveryAddress,
    fallbackSo?.siteAddress,
    fallbackSo?.billingAddress,

    // 3. Customer shipping address
    customer?.shippingAddress,
    customer?.siteAddress,
    customer?.deliveryAddress,
    customer?.deliveryLocation,

    // 4. Customer billing / registered / office address (added by sales/master)
    customer?.billingAddress,
    customer?.address,
    customer?.officeAddress,
    customer?.registeredAddress,
    customer?.factoryAddress,

    // 5. Source Quotation addresses (added by salesperson during quote)
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

    // 6. Lead addresses (added by salesperson during lead creation)
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

    // 7. Direct work order customer or plan info
    workOrder?.deliveryAddress,
    workOrder?.customer?.shippingAddress,
    workOrder?.customer?.billingAddress,
    workOrder?.customer?.address,

    // 8. City / State / Pincode components if present
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

function isTradingProduct(item: any, productsMap: Map<string, any>): boolean {
  if (!item) return false;
  const pType = String(item.productType || item.product_type || item.product?.productType || item.product?.product_type || "").toUpperCase();
  if (pType === "TRADING") return true;
  if (pType === "MANUFACTURING") return false;
  if (item.isTrading === true || item.product?.isTrading === true) return true;
  
  const cat = String(item.category || item.product_family || item.product?.category || item.product?.product_family || "").toLowerCase();
  if (cat.includes("trading") || cat.includes("rcc pipe") || cat.includes("frc cover") || cat.includes("coverblock") || cat.includes("others")) return true;
  if (cat.includes("frp covers") || cat.includes("frp gratings") || cat.includes("manufacturing")) return false;

  const name = String(item.productNameSnapshot || item.productName || item.product_name || item.name || item.product?.name || "").toUpperCase();
  if (
    name.startsWith("FRCCP") ||
    name.startsWith("FRCT") ||
    name.startsWith("FRCSQRC") ||
    name.startsWith("FRC") ||
    name.startsWith("RCC") ||
    name.startsWith("BTCB") ||
    name.startsWith("WCB") ||
    name.startsWith("PCB") ||
    name.startsWith("HTCB") ||
    name.startsWith("DTCB") ||
    name.startsWith("MCB") ||
    name.includes("FRC COVER") ||
    name.includes("RCC PIPE") ||
    name.includes("COVERBLOCK") ||
    name.includes("COVER BLOCK")
  ) return true;

  const sku = String(item.sku || item.productSku || item.product_sku || item.productCode || item.productCodeSnapshot || item.product?.sku || "").toUpperCase();
  if (
    sku.startsWith("FRCCP") ||
    sku.startsWith("FRCT") ||
    sku.startsWith("FRCSQRC") ||
    sku.startsWith("FRC") ||
    sku.startsWith("RCC") ||
    sku.startsWith("BTCB") ||
    sku.startsWith("WCB") ||
    sku.startsWith("PCB") ||
    sku.startsWith("HTCB") ||
    sku.startsWith("DTCB") ||
    sku.startsWith("MCB") ||
    sku.includes("COVERBLOCK") ||
    sku.includes("COVER BLOCK")
  ) return true;

  const dCat = String(item.dispatchCategory || item.dispatch_category || item.product?.dispatchCategory || item.product?.dispatch_category || "").toUpperCase();
  if (dCat === "D2" || dCat === "DISPATCH 2" || dCat === "DISPATCH_2" || dCat.includes("CAT 2") || dCat.includes("CATEGORY 2")) return true;

  if (item.productId && productsMap.has(item.productId)) {
    const p = productsMap.get(item.productId);
    const pType2 = String(p.productType || p.product_type || "").toUpperCase();
    if (pType2 === "TRADING" || p.isTrading === true) return true;
    if (pType2 === "MANUFACTURING") return false;
    const dCat2 = String(p.dispatchCategory || p.dispatch_category || "").toUpperCase();
    if (dCat2 === "D2" || dCat2.includes("2")) return true;
    const cat2 = String(p.product_family || p.category || "").toLowerCase();
    if (cat2.includes("trading") || cat2.includes("rcc pipe") || cat2.includes("frc cover") || cat2.includes("coverblock") || cat2.includes("others")) return true;
    if (cat2.includes("frp covers") || cat2.includes("frp gratings") || cat2.includes("manufacturing")) return false;
    const pName = String(p.name || "").toUpperCase();
    if (
      pName.startsWith("FRCCP") ||
      pName.startsWith("FRCT") ||
      pName.startsWith("FRCSQRC") ||
      pName.startsWith("FRC") ||
      pName.startsWith("RCC") ||
      pName.startsWith("BTCB") ||
      pName.startsWith("WCB") ||
      pName.startsWith("PCB") ||
      pName.startsWith("HTCB") ||
      pName.startsWith("DTCB") ||
      pName.startsWith("MCB") ||
      pName.includes("FRC COVER") ||
      pName.includes("RCC PIPE") ||
      pName.includes("COVERBLOCK") ||
      pName.includes("COVER BLOCK")
    ) return true;
    const pSku = String(p.sku || "").toUpperCase();
    if (
      pSku.startsWith("FRCCP") ||
      pSku.startsWith("FRCT") ||
      pSku.startsWith("FRCSQRC") ||
      pSku.startsWith("FRC") ||
      pSku.startsWith("RCC") ||
      pSku.startsWith("BTCB") ||
      pSku.startsWith("WCB") ||
      pSku.startsWith("PCB") ||
      pSku.startsWith("HTCB") ||
      pSku.startsWith("DTCB") ||
      pSku.startsWith("MCB") ||
      pSku.includes("COVERBLOCK") ||
      pSku.includes("COVER BLOCK")
    ) return true;
  }
  return false;
}

export default function DispatchOrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const isDispatch2User = 
    user?.email?.toLowerCase() === "sahad.dispatch@himalayaerp.com" ||
    String(user?.role || "").toLowerCase().includes("dispatch 2") ||
    String(user?.role || "").toLowerCase().includes("cat 2") ||
    user?.role === "DISPATCH_2" ||
    pathname?.includes("/dispatch-2");

  const isDispatch1User =
    user?.email?.toLowerCase() === "ravikant.t@himalayaerp.com" ||
    String(user?.role || "").toLowerCase().includes("dispatch 1") ||
    String(user?.role || "").toLowerCase().includes("cat 1") ||
    user?.role === "DISPATCH_1";

  const isSuperAdmin =
    user?.role === "Super Admin" ||
    user?.role === "SUPER_ADMIN" ||
    user?.role === "Admin" ||
    user?.role === "Plant Head" ||
    String(user?.role || "").toLowerCase().includes("admin");

  const isDispatch2 = pathname?.includes("/dispatch-2") || isDispatch2User;
  const basePath = isDispatch2 ? "/dispatch-2" : "/dispatch";
  const currentCategory = isDispatch2 ? "D2" : "D1";

  const [activeTab, setActiveTab] = useState<"pending" | "remaining" | "history">("pending");
  const [search, setSearch] = useState("");
  const [selectedPodImage, setSelectedPodImage] = useState<string | null>(null);
  const [copiedOrder, setCopiedOrder] = useState<string | null>(null);

  // Query 0: Products Map for Category lookups
  const { data: productsMap = new Map<string, any>() } = useQuery<Map<string, any>>({
    queryKey: ["products-master-map"],
    queryFn: async () => {
      try {
        const res = await backendFetch<any>("/api/backend/products?limit=5000");
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        const map = new Map<string, any>();
        list.forEach((p: any) => {
          if (p.id) map.set(p.id, p);
          if (p.sku) map.set(p.sku, p);
        });
        return map;
      } catch {
        return new Map();
      }
    },
    staleTime: 5 * 60 * 1000,
  });

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
        if (Array.isArray(res?.data?.data)) return res.data.data;
        if (Array.isArray(res?.data?.items)) return res.data.items;
        if (Array.isArray(res?.items)) return res.items;
        return [];
      };

      const [
        workOrdersPayload,
        readyForDispatchPayload,
        historyDispatchesPayload,
        salesOrdersPayload,
        finishedGoodsPayload,
        queuePayload,
        activeDispatchesPayload,
      ] = await Promise.allSettled([
        backendFetch<any>(
          "/api/backend/production/work-orders?status=READY_FOR_DISPATCH,SENT_TO_DISPATCH,DISPATCHED"
        ),
        backendFetch<any>("/api/backend/production/ready-for-dispatch"),
        backendFetch<any>("/api/backend/production/ready-for-dispatch-history"),
        backendFetch<any>("/api/backend/sales/orders?limit=1000"),
        backendFetch<any>("/api/backend/production/finished-goods"),
        backendFetch<any>("/api/backend/logistics/dispatches/queue"),
        backendFetch<any>("/api/backend/logistics/dispatches"),
      ]);

      const workOrders: any[] =
        workOrdersPayload.status === "fulfilled" ? extractArray(workOrdersPayload.value) : [];
      const readyJobs: any[] =
        readyForDispatchPayload.status === "fulfilled" ? extractArray(readyForDispatchPayload.value) : [];
      const historyJobs: any[] =
        historyDispatchesPayload.status === "fulfilled" ? extractArray(historyDispatchesPayload.value) : [];

      const allProductionJobs = [...workOrders, ...readyJobs, ...historyJobs];

      let rawSalesOrders =
        salesOrdersPayload.status === "fulfilled" ? extractArray(salesOrdersPayload.value) : [];

      // Merge local store sales orders if available
      if (typeof window !== "undefined") {
        try {
          const localStoreStr = localStorage.getItem("himalaya_erp_store");
          if (localStoreStr) {
            const parsed = JSON.parse(localStoreStr);
            const localOrders = parsed?.state?.salesOrders || parsed?.salesOrders || [];
            if (Array.isArray(localOrders) && localOrders.length > 0) {
              const existingIds = new Set(rawSalesOrders.map((o: any) => o.id || o.orderNumber));
              localOrders.forEach((lo: any) => {
                if (lo && !existingIds.has(lo.id) && !existingIds.has(lo.orderNumber) && !existingIds.has(lo.orderNo)) {
                  rawSalesOrders.push(lo);
                }
              });
            }
          }
        } catch (e) {
          // ignore parsing error
        }
      }

      const rawFinishedGoods =
        finishedGoodsPayload.status === "fulfilled" ? extractArray(finishedGoodsPayload.value) : [];

      const rawQueue =
        queuePayload.status === "fulfilled" ? extractArray(queuePayload.value) : [];

      const rawActiveDispatches =
        activeDispatchesPayload.status === "fulfilled" ? extractArray(activeDispatchesPayload.value) : [];

      // Calculate dispatched quantities per salesOrderItemId, workOrderId, and (salesOrderId+productId)
      const dispatchedBySalesOrderItem = new Map<string, number>();
      const dispatchedByWorkOrder = new Map<string, number>();
      const dispatchedBySalesOrderProduct = new Map<string, number>();
      const ordersWithPriorDispatches = new Set<string>();

      const isDispatchedStatus = (st: any) => {
        const s = String(st || "").toUpperCase();
        return (
          ["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "SHIPPED", "DISPATCHED", "PENDING_DISPATCH", "PENDING", "COMPLETED"].includes(s) ||
          (!["CANCELLED", "REJECTED", "DRAFT"].includes(s) && s.length > 0)
        );
      };

      rawActiveDispatches.forEach((d: any) => {
        if (isDispatchedStatus(d.status)) {
          if (d.salesOrderId) {
            ordersWithPriorDispatches.add(String(d.salesOrderId).toLowerCase());
            ordersWithPriorDispatches.add(normalizeKey(d.salesOrderId));
          }
          if (d.salesOrder?.orderNumber) {
            ordersWithPriorDispatches.add(String(d.salesOrder.orderNumber).toLowerCase());
            ordersWithPriorDispatches.add(normalizeKey(d.salesOrder.orderNumber));
          }
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
              const pId = it.productId || it.salesOrderItem?.productId;
              if (d.salesOrderId && pId) {
                const k = `${String(d.salesOrderId).toLowerCase()}_${String(pId).toLowerCase()}`;
                dispatchedBySalesOrderProduct.set(k, (dispatchedBySalesOrderProduct.get(k) || 0) + q);
              }
              if (d.salesOrder?.orderNumber && pId) {
                const k2 = `${normalizeKey(d.salesOrder.orderNumber)}_${String(pId).toLowerCase()}`;
                dispatchedBySalesOrderProduct.set(k2, (dispatchedBySalesOrderProduct.get(k2) || 0) + q);
              }
            });
          }
        }
      });

      if (typeof window !== "undefined") {
        try {
          const rawFullMeta = localStorage.getItem("himalaya_dispatches_full_metadata");
          if (rawFullMeta) {
            const metaMap = JSON.parse(rawFullMeta);
            Object.keys(metaMap).forEach((k) => {
              ordersWithPriorDispatches.add(k.toLowerCase());
              ordersWithPriorDispatches.add(normalizeKey(k));
              const entry = metaMap[k];
              if (entry?.orderNumber) {
                ordersWithPriorDispatches.add(entry.orderNumber.toLowerCase());
                ordersWithPriorDispatches.add(normalizeKey(entry.orderNumber));
              }
              if (entry?.orderId) {
                ordersWithPriorDispatches.add(entry.orderId.toLowerCase());
                ordersWithPriorDispatches.add(normalizeKey(entry.orderId));
              }
            });
          }

          const rawTracker = localStorage.getItem("himalaya_dispatched_items_tracker");
          if (rawTracker) {
            const tracker = JSON.parse(rawTracker);
            Object.entries(tracker).forEach(([k, v]) => {
              const q = Number(v || 0);
              if (q > 0) {
                const lowerK = k.toLowerCase();
                dispatchedBySalesOrderItem.set(lowerK, Math.max(dispatchedBySalesOrderItem.get(lowerK) || 0, q));
                dispatchedByWorkOrder.set(lowerK, Math.max(dispatchedByWorkOrder.get(lowerK) || 0, q));
                dispatchedBySalesOrderProduct.set(lowerK, Math.max(dispatchedBySalesOrderProduct.get(lowerK) || 0, q));
              }
            });
          }
        } catch {}
      }

      // Build index map of sales orders for deep metadata lookup
      const salesOrdersMap = new Map<string, any>();
      rawSalesOrders.forEach((so: any) => {
        if (!so) return;
        if (so.id) salesOrdersMap.set(String(so.id).toLowerCase(), so);
        if (so.orderNumber) {
          salesOrdersMap.set(String(so.orderNumber).toLowerCase(), so);
          salesOrdersMap.set(normalizeKey(so.orderNumber), so);
        }
        if (so.orderId) {
          salesOrdersMap.set(String(so.orderId).toLowerCase(), so);
          salesOrdersMap.set(normalizeKey(so.orderId), so);
        }
        if (so.orderNo) {
          salesOrdersMap.set(String(so.orderNo).toLowerCase(), so);
          salesOrdersMap.set(normalizeKey(so.orderNo), so);
        }

        if (Array.isArray(so.dispatches) && so.dispatches.length > 0) {
          so.dispatches.forEach((d: any) => {
            if (isDispatchedStatus(d.status)) {
              if (so.id) {
                ordersWithPriorDispatches.add(String(so.id).toLowerCase());
                ordersWithPriorDispatches.add(normalizeKey(so.id));
              }
              if (so.orderNumber) {
                ordersWithPriorDispatches.add(String(so.orderNumber).toLowerCase());
                ordersWithPriorDispatches.add(normalizeKey(so.orderNumber));
              }
              if (Array.isArray(d.items)) {
                d.items.forEach((it: any) => {
                  const q = Number(it.quantity || 0);
                  if (it.salesOrderItemId) {
                    const k = String(it.salesOrderItemId).toLowerCase();
                    dispatchedBySalesOrderItem.set(k, (dispatchedBySalesOrderItem.get(k) || 0) + q);
                  }
                  const pId = it.productId || it.salesOrderItem?.productId;
                  if (so.id && pId) {
                    const k = `${String(so.id).toLowerCase()}_${String(pId).toLowerCase()}`;
                    dispatchedBySalesOrderProduct.set(k, (dispatchedBySalesOrderProduct.get(k) || 0) + q);
                  }
                  if (so.orderNumber && pId) {
                    const k2 = `${normalizeKey(so.orderNumber)}_${String(pId).toLowerCase()}`;
                    dispatchedBySalesOrderProduct.set(k2, (dispatchedBySalesOrderProduct.get(k2) || 0) + q);
                  }
                });
              }
            }
          });
        }
      });

      const unifiedDirectDispatches: UnifiedPendingDispatchItem[] = [];
      rawQueue.forEach((qOrder: any) => {
        const soKey = (qOrder.salesOrderId || qOrder.orderNo || qOrder.orderId || "").toLowerCase();
        const matchedSo = salesOrdersMap.get(soKey) || salesOrdersMap.get(normalizeKey(qOrder.orderNo || qOrder.orderId));
        const customerName = resolveCustomerName(qOrder, matchedSo, qOrder.customer);
        const projectName = resolveProjectName(qOrder, matchedSo, qOrder.customer);
        const deliveryAddress = formatAddress(qOrder, qOrder.customer, matchedSo) || "—";
        const items = Array.isArray(qOrder.items) ? qOrder.items : [];
        const soKeyNorm = normalizeKey(qOrder.orderNo || qOrder.orderId);
        const orderHasPriorDispatches = ordersWithPriorDispatches.has(soKeyNorm) || (qOrder.salesOrderId && ordersWithPriorDispatches.has(String(qOrder.salesOrderId).toLowerCase()));

        items.forEach((qItem: any) => {
          const qty = Number(qItem.approvedQuantity ?? qItem.dispatchableQuantity ?? qItem.reservedQuantity ?? 1);
          unifiedDirectDispatches.push({
            id: `alloc-${qItem.allocationId || qItem.id || Math.random()}`,
            itemType: "TRADING_SALES_ORDER",
            orderNumber: qOrder.orderNo || qOrder.orderId || "SO-DIRECT",
            customerName,
            projectName,
            deliveryAddress,
            productName: qItem.productName || "Direct Dispatch Item",
            approvedQuantity: qty,
            orderedQuantity: qty,
            dispatchedQuantity: 0,
            remainingQuantity: qty,
            isPartiallyDispatched: Boolean(orderHasPriorDispatches),
            salesOrderId: qOrder.salesOrderId || matchedSo?.id,
            salesOrderItemId: qItem.salesOrderItemId,
            productId: qItem.productId,
            dispatchCategory: (isTradingProduct(qItem, productsMap) ? "D2" : null) ||
              qItem.dispatchCategory ||
              qItem.dispatch_category ||
              qItem.product?.dispatchCategory ||
              qItem.product?.dispatch_category ||
              productsMap.get(qItem.productId || "")?.dispatchCategory ||
              productsMap.get(qItem.productId || "")?.dispatch_category ||
              (isTradingProduct(qItem, productsMap) ? "D2" : "D1"),
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
          const soFromWo = wo?.productionPlan?.salesOrder || wo?.salesOrder || fg.salesOrder;
          const soLookupKey = (soFromWo?.id || fg.salesOrderId || fg.jobNo || "").toLowerCase();
          const matchedSo = salesOrdersMap.get(soLookupKey) || salesOrdersMap.get(normalizeKey(fg.jobNo));
          const salesOrder = soFromWo || matchedSo;
          const customer = salesOrder?.customer || fg.customer || wo?.customer;
          const address = formatAddress(salesOrder, customer, fg, matchedSo);
          const customerName = resolveCustomerName(salesOrder, matchedSo, fg, customer, wo);
          const projectName = resolveProjectName(salesOrder, matchedSo, fg, customer, wo);
          const qtyVal = fg.availableQuantity ?? fg.quantity ?? 1;
          const qty = typeof qtyVal === "number" ? qtyVal : parseFloat(String(qtyVal)) || 1;
          const soKeyNorm = normalizeKey(fg.jobNo || salesOrder?.orderNumber);
          const orderHasPriorDispatches = ordersWithPriorDispatches.has(soKeyNorm) || (salesOrder?.id && ordersWithPriorDispatches.has(String(salesOrder.id).toLowerCase()));

          return {
            id: `fg-${fg.id || fg.workOrderId}`,
            itemType: "WORK_ORDER",
            orderNumber: fg.jobNo || salesOrder?.orderNumber || "WO-FG",
            customerName,
            projectName,
            deliveryAddress: address || "—",
            productName: fg.productName || "Finished Product",
            approvedQuantity: qty,
            orderedQuantity: qty,
            dispatchedQuantity: 0,
            remainingQuantity: qty,
            isPartiallyDispatched: Boolean(orderHasPriorDispatches),
            workOrderId: fg.workOrderId || fg.id,
            salesOrderId: salesOrder?.id || matchedSo?.id,
            workOrderNumber: fg.jobNo,
            productId: fg.productId || wo?.salesOrderItem?.productId || fg.workOrder?.salesOrderItem?.productId,
            dispatchCategory:
              (isTradingProduct(fg.product || fg, productsMap) ? "D2" : null) ||
              fg.dispatchCategory ||
              fg.dispatch_category ||
              fg.product?.dispatchCategory ||
              fg.product?.dispatch_category ||
              wo?.salesOrderItem?.product?.dispatchCategory ||
              wo?.salesOrderItem?.product?.dispatch_category ||
              productsMap.get(fg.productId || "")?.dispatchCategory ||
              productsMap.get(fg.productId || "")?.dispatch_category ||
              "D1",
          };
        });

      const unifiedWorkOrders: UnifiedPendingDispatchItem[] = allProductionJobs
        .filter((wo) => {
          if (!wo || !wo.id) return false;
          const prodStatus = String(wo.productionStatus || wo.status || "").toUpperCase();
          if (prodStatus === "DELIVERED" || prodStatus === "SHIPPED") return false;
          return true;
        })
        .map((wo) => {
          const soFromWo = wo.productionPlan?.salesOrder || wo.salesOrder;
          const soLookupKey = (soFromWo?.id || wo.salesOrderId || wo.salesOrderNumber || wo.workOrderNumber || "").toLowerCase();
          const matchedSo = salesOrdersMap.get(soLookupKey) || salesOrdersMap.get(normalizeKey(wo.salesOrderNumber)) || salesOrdersMap.get(normalizeKey(wo.workOrderNumber));
          const salesOrder = soFromWo || matchedSo;
          const customer = salesOrder?.customer || wo.customer;
          const address = formatAddress(salesOrder, customer, wo, matchedSo);
          const item = wo.salesOrderItem;

          const totalOrdered = Number(item?.orderedQuantity || wo.quantity || 1);
          const fromDispatchItems = item?.dispatchItems?.reduce((sum: number, d: any) => sum + Number(d.quantity || 0), 0) || 0;
          const fromActiveDispatches =
            (wo.id ? dispatchedByWorkOrder.get(String(wo.id).toLowerCase()) : 0) ||
            (wo.salesOrderItemId ? dispatchedBySalesOrderItem.get(String(wo.salesOrderItemId).toLowerCase()) : 0) ||
            0;
          const alreadyDispatched = Math.max(fromDispatchItems, fromActiveDispatches);
          const remaining = Math.max(0, totalOrdered - alreadyDispatched);

          const numPart = (wo.workOrderNumber || wo.id || "").replace(/\D/g, "").slice(-5);
          const soNumber =
            salesOrder?.orderNumber ||
            wo.salesOrderNumber ||
            (numPart ? `SO-2026-${numPart.padStart(5, "0")}` : wo.workOrderNumber || "SO-DISPATCH");
          const prodName =
            wo.salesOrderItem?.productNameSnapshot ||
            wo.salesOrderItem?.product?.name ||
            wo.productName ||
            wo.product ||
            "Finished Manufacturing Product";

          const customerName = resolveCustomerName(salesOrder, matchedSo, customer, wo);
          const projectName = resolveProjectName(salesOrder, matchedSo, customer, wo);

          const soKeyNorm = normalizeKey(soNumber);
          const soIdLower = String(salesOrder?.id || matchedSo?.id || wo.salesOrderId || "").toLowerCase();
          const orderHasPriorDispatches = ordersWithPriorDispatches.has(soKeyNorm) || (soIdLower ? ordersWithPriorDispatches.has(soIdLower) : false);
          const isPartiallyDispatched = (alreadyDispatched > 0 && remaining > 0) || (orderHasPriorDispatches && remaining > 0);

          return {
            id: `wo-${wo.id}`,
            itemType: "WORK_ORDER",
            orderNumber: soNumber,
            customerName,
            projectName,
            deliveryAddress: address || "—",
            productName: prodName,
            productSku: wo.salesOrderItem?.product?.sku || wo.productCode,
            approvedQuantity: remaining > 0 ? remaining : totalOrdered,
            orderedQuantity: totalOrdered,
            dispatchedQuantity: alreadyDispatched,
            remainingQuantity: remaining,
            isPartiallyDispatched,
            workOrderId: wo.id,
            salesOrderId: salesOrder?.id || matchedSo?.id,
            workOrderNumber: wo.workOrderNumber,
            productId: wo.salesOrderItem?.productId || wo.productId,
            dispatchCategory: isTradingProduct(wo.salesOrderItem || wo, productsMap)
              ? "D2"
              : (wo.salesOrderItem?.product?.dispatchCategory ||
                 wo.salesOrderItem?.product?.dispatch_category ||
                 productsMap.get(wo.salesOrderItem?.productId || "")?.dispatchCategory ||
                 productsMap.get(wo.salesOrderItem?.productId || "")?.dispatch_category ||
                 "D1"),
          };
        });

      const unifiedSalesOrders: UnifiedPendingDispatchItem[] = [];
      rawSalesOrders.forEach((so: any) => {
        const orderNo = String(so.orderNumber || so.orderId || so.orderNo || "");
        if (orderNo.includes("SO-TEST-")) return;

        const customerName = resolveCustomerName(so, so.customer);
        const projectName = resolveProjectName(so, so.customer);
        const address = formatAddress(so, so.customer);

        const items = Array.isArray(so.items) ? so.items : Array.isArray(so.orderItems) ? so.orderItems : [];
        if (items.length > 0) {
          items.forEach((item: any, idx: number) => {
            const totalOrdered = Number(item.orderedQuantity || item.quantity || 1);
            const fromDispatchItems = Array.isArray(item.dispatchItems)
              ? item.dispatchItems.reduce((sum: number, d: any) => sum + Number(d.quantity || 0), 0)
              : 0;
            const fromActiveDispatches =
              (item.id ? dispatchedBySalesOrderItem.get(String(item.id).toLowerCase()) : 0) ||
              (so.id && item.productId
                ? dispatchedBySalesOrderProduct.get(`${String(so.id).toLowerCase()}_${String(item.productId).toLowerCase()}`)
                : 0) ||
              (orderNo && item.productId
                ? dispatchedBySalesOrderProduct.get(`${normalizeKey(orderNo)}_${String(item.productId).toLowerCase()}`)
                : 0) ||
              0;
            const alreadyDispatched = Math.max(fromDispatchItems, fromActiveDispatches);
            const remaining = Math.max(0, totalOrdered - alreadyDispatched);

            const soKeyNorm = normalizeKey(orderNo);
            const soIdLower = String(so.id || "").toLowerCase();
            const orderHasPriorDispatches = ordersWithPriorDispatches.has(soKeyNorm) || (soIdLower ? ordersWithPriorDispatches.has(soIdLower) : false);
            const isPartiallyDispatched = (alreadyDispatched > 0 && remaining > 0) || (orderHasPriorDispatches && remaining > 0);

            if (remaining <= 0 && alreadyDispatched > 0) return;

            unifiedSalesOrders.push({
              id: `so-${so.id}-${idx}`,
              itemType: isTradingProduct(item, productsMap) ? "TRADING_SALES_ORDER" : "WORK_ORDER",
              orderNumber: orderNo || "N/A",
              customerName,
              projectName,
              deliveryAddress: address,
              productName: item.productNameSnapshot || item.productName || item.name || "Product Cargo",
              productSku: item.product?.sku || item.sku,
              approvedQuantity: remaining > 0 ? remaining : totalOrdered,
              orderedQuantity: totalOrdered,
              dispatchedQuantity: alreadyDispatched,
              remainingQuantity: remaining,
              isPartiallyDispatched,
              salesOrderId: so.id,
              salesOrderItemId: item.id,
              productId: item.productId,
              dispatchCategory: isTradingProduct(item, productsMap)
                ? "D2"
                : (item.product?.dispatchCategory ||
                   item.product?.dispatch_category ||
                   productsMap.get(item.productId || "")?.dispatchCategory ||
                   productsMap.get(item.productId || "")?.dispatch_category ||
                   "D1"),
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
          const pA = String(a.productName || "").trim().toLowerCase();
          const pB = String(b.productName || "").trim().toLowerCase();
          if (pA && pB && pA === pB) return true;
        }
        const oA = normalizeKey(a.orderNumber);
        const oB = normalizeKey(b.orderNumber);
        if (oA && oB && oA === oB) {
          if (a.productId && b.productId && a.productId === b.productId) return true;
          const pA = String(a.productName || "").trim().toLowerCase();
          const pB = String(b.productName || "").trim().toLowerCase();
          if (pA && pB && pA === pB) return true;
        }
        return false;
      };

      const mergePendingItem = (existing: UnifiedPendingDispatchItem, incoming: UnifiedPendingDispatchItem): UnifiedPendingDispatchItem => {
        const hasSpecificAddress = (addr?: string) =>
          addr && addr !== "N/A" && addr !== "Factory Staging Area" && addr !== "—" && addr.trim().length > 3;

        const deliveryAddress = hasSpecificAddress(incoming.deliveryAddress)
          ? incoming.deliveryAddress
          : hasSpecificAddress(existing.deliveryAddress)
          ? existing.deliveryAddress
          : incoming.deliveryAddress || existing.deliveryAddress;

        const customerName = isValidCustomerName(incoming.customerName)
          ? incoming.customerName
          : isValidCustomerName(existing.customerName)
          ? existing.customerName
          : incoming.customerName || existing.customerName || "Consignee Client";

        const projectName = (incoming.projectName && incoming.projectName.trim().length > 1)
          ? incoming.projectName
          : existing.projectName || "";

        const resolvedCategory = (
          isTradingProduct(incoming, productsMap) ||
          isTradingProduct(existing, productsMap) ||
          incoming.dispatchCategory === 'D2' ||
          existing.dispatchCategory === 'D2'
        ) ? 'D2' : (incoming.dispatchCategory || existing.dispatchCategory || 'D1');

        return {
          ...existing,
          ...incoming,
          deliveryAddress,
          customerName,
          projectName,
          salesOrderId: incoming.salesOrderId || existing.salesOrderId,
          salesOrderItemId: incoming.salesOrderItemId || existing.salesOrderItemId,
          workOrderId: incoming.workOrderId || existing.workOrderId,
          workOrderNumber: incoming.workOrderNumber || existing.workOrderNumber,
          productId: incoming.productId || existing.productId,
          productName: incoming.productName || existing.productName,
          productSku: incoming.productSku || existing.productSku,
          dispatchCategory: resolvedCategory,
          approvedQuantity: incoming.approvedQuantity || existing.approvedQuantity,
          orderedQuantity: incoming.orderedQuantity || existing.orderedQuantity,
          dispatchedQuantity: incoming.dispatchedQuantity || existing.dispatchedQuantity,
          remainingQuantity: incoming.remainingQuantity || existing.remainingQuantity,
          isPartiallyDispatched: incoming.isPartiallyDispatched || existing.isPartiallyDispatched,
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

      return combined.filter((item) => {
        const rem = Number(item.remainingQuantity ?? item.approvedQuantity ?? 1);
        return rem > 0;
      });
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

  // Strict Filter for Pending items based on current portal (D1 vs D2)
  const filteredPendingItems = useMemo(() => {
    return pendingItems.filter((item) => {
      const productCat = String(item.dispatchCategory || (isTradingProduct(item, productsMap) ? "D2" : "D1")).trim().toUpperCase();

      let matchCategory = false;
      if (currentCategory === "D2") {
        matchCategory = productCat === "D2" || productCat === "DISPATCH 2" || productCat === "DISPATCH_2" || productCat === "CATEGORY 2" || productCat === "CAT 2";
      } else {
        matchCategory = productCat === "D1" || productCat === "DISPATCH 1" || productCat === "DISPATCH_1" || productCat === "CATEGORY 1" || productCat === "CAT 1";
      }

      if (!matchCategory) return false;

      if (!search.trim()) return true;
      const lower = search.toLowerCase();
      return (
        item.orderNumber.toLowerCase().includes(lower) ||
        item.customerName.toLowerCase().includes(lower) ||
        (item.projectName && item.projectName.toLowerCase().includes(lower)) ||
        item.productName.toLowerCase().includes(lower) ||
        item.deliveryAddress.toLowerCase().includes(lower) ||
        (item.workOrderNumber && item.workOrderNumber.toLowerCase().includes(lower))
      );
    });
  }, [pendingItems, currentCategory, productsMap, search]);

  // Group pending items order-wise
  const groupedPendingOrders = useMemo(() => {
    const map = new Map<string, PendingOrderGroup>();

    filteredPendingItems.forEach((item) => {
      const key = item.orderNumber || item.salesOrderId || "SO-UNASSIGNED";
      const existing = map.get(key);

      const qtyNum =
        typeof item.approvedQuantity === "number"
          ? item.approvedQuantity
          : parseFloat(String(item.approvedQuantity)) || 1;
      const orderedNum = item.orderedQuantity ?? qtyNum;
      const dispatchedNum = item.dispatchedQuantity ?? 0;

      if (existing) {
        existing.totalQty += qtyNum;
        existing.totalOrderedQty = (existing.totalOrderedQty || 0) + orderedNum;
        existing.totalDispatchedQty = (existing.totalDispatchedQty || 0) + dispatchedNum;
        if (item.isPartiallyDispatched || existing.totalDispatchedQty > 0) {
          existing.isPartiallyDispatched = true;
        }
        if (!existing.salesOrderId && item.salesOrderId) existing.salesOrderId = item.salesOrderId;
        if (!isValidCustomerName(existing.customerName) && isValidCustomerName(item.customerName)) {
          existing.customerName = item.customerName;
        }
        if (!existing.projectName && item.projectName) {
          existing.projectName = item.projectName;
        }
        if ((!existing.deliveryAddress || existing.deliveryAddress === "—" || existing.deliveryAddress === "N/A") && item.deliveryAddress && item.deliveryAddress !== "—" && item.deliveryAddress !== "N/A") {
          existing.deliveryAddress = item.deliveryAddress;
        }
        existing.items.push(item);
      } else {
        map.set(key, {
          orderKey: key,
          orderNumber: item.orderNumber,
          customerName: item.customerName,
          projectName: item.projectName,
          deliveryAddress: item.deliveryAddress,
          salesOrderId: item.salesOrderId,
          totalQty: qtyNum,
          totalOrderedQty: orderedNum,
          totalDispatchedQty: dispatchedNum,
          isPartiallyDispatched: Boolean(item.isPartiallyDispatched || dispatchedNum > 0),
          items: [item],
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const numA = parseInt((a.orderNumber || "").replace(/\D/g, "")) || 0;
      const numB = parseInt((b.orderNumber || "").replace(/\D/g, "")) || 0;
      if (numA && numB && numA !== numB) return numB - numA;
      return (b.orderNumber || "").localeCompare(a.orderNumber || "");
    });
  }, [filteredPendingItems]);

  // Remaining Items (Partially Dispatched)
  const groupedRemainingOrders = useMemo(() => {
    return groupedPendingOrders.filter(
      (group) =>
        (group.isPartiallyDispatched ||
          (group.totalDispatchedQty !== undefined && group.totalDispatchedQty > 0) ||
          group.items.some((i) => i.isPartiallyDispatched || (i.dispatchedQuantity && i.dispatchedQuantity > 0))) &&
        group.totalQty > 0
    );
  }, [groupedPendingOrders]);

  const filteredRemainingItems = useMemo(() => {
    const remainingOrderKeys = new Set(groupedRemainingOrders.map((g) => g.orderKey));
    return filteredPendingItems.filter((item) => {
      if (item.isPartiallyDispatched) return true;
      if ((item.dispatchedQuantity ?? 0) > 0 && (item.remainingQuantity ?? 0) > 0) return true;
      const key = item.orderNumber || item.salesOrderId || "SO-UNASSIGNED";
      return remainingOrderKeys.has(key);
    });
  }, [filteredPendingItems, groupedRemainingOrders]);

  // Filter history items
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
      (d) => {
        const cust = resolveCustomerName(d.salesOrder, d);
        return (
          d.dispatchNo?.toLowerCase().includes(lower) ||
          d.salesOrder?.orderNumber?.toLowerCase().includes(lower) ||
          cust.toLowerCase().includes(lower) ||
          d.receivedBy?.toLowerCase().includes(lower) ||
          d.receiverPhone?.toLowerCase().includes(lower) ||
          d.driverName?.toLowerCase().includes(lower) ||
          d.vehicleNumber?.toLowerCase().includes(lower)
        );
      }
    );
  }, [historyDispatches, search, isDispatch2]);

  // KPI Computations
  const totalPendingOrdersCount = groupedPendingOrders.length;
  const totalPendingUnits = useMemo(() => {
    return filteredPendingItems.reduce((sum, it) => {
      const n = typeof it.approvedQuantity === "number" ? it.approvedQuantity : parseFloat(String(it.approvedQuantity)) || 1;
      return sum + n;
    }, 0);
  }, [filteredPendingItems]);

  const totalRemainingOrdersCount = groupedRemainingOrders.length;
  const totalRemainingUnits = useMemo(() => {
    return filteredRemainingItems.reduce((sum, it) => sum + (it.remainingQuantity || 0), 0);
  }, [filteredRemainingItems]);

  const totalMfgItemsCount = useMemo(() => {
    return filteredPendingItems.filter((i) => i.itemType === "WORK_ORDER").length;
  }, [filteredPendingItems]);

  const totalTradingItemsCount = useMemo(() => {
    return filteredPendingItems.filter((i) => i.itemType === "TRADING_SALES_ORDER").length;
  }, [filteredPendingItems]);

  const handleCreateOrderDispatch = (group: PendingOrderGroup) => {
    const params = new URLSearchParams();
    if (group.salesOrderId && !group.salesOrderId.includes("/")) {
      params.set("salesOrderId", group.salesOrderId);
    } else if (group.orderNumber) {
      params.set("salesOrderId", group.orderNumber);
    }
    if (group.orderNumber) {
      params.set("orderNumber", group.orderNumber);
    }
    const woIds = group.items
      .map((it) => it.workOrderId)
      .filter((id): id is string => Boolean(id && !id.includes("/")));
    if (woIds.length > 0) {
      params.set("workOrderIds", woIds.join(","));
    }
    if (group.deliveryAddress && group.deliveryAddress !== "—" && group.deliveryAddress !== "N/A" && group.deliveryAddress !== "Factory Staging Area") {
      params.set("deliveryAddress", group.deliveryAddress);
    }
    router.push(`${basePath}/create-dispatch?${params.toString()}`);
  };

  const handleExportCsv = () => {
    if (activeTab === "pending" || activeTab === "remaining") {
      const targetItems = activeTab === "remaining" ? filteredRemainingItems : filteredPendingItems;
      if (!targetItems.length) return;
      const exportRows = targetItems.map((item) => ({
        "Order Number": item.orderNumber,
        "Customer": item.customerName,
        "Project": item.projectName || "—",
        "Delivery Address": item.deliveryAddress,
        "Product Item": item.productName,
        "SKU": item.productSku || "—",
        "Work Order #": item.workOrderNumber || "—",
        "Fulfillment Type": item.itemType === "WORK_ORDER" ? "Manufacturing" : "Trading",
        "Ordered Quantity": item.orderedQuantity ?? item.approvedQuantity,
        "Already Dispatched": item.dispatchedQuantity ?? 0,
        "Remaining Quantity": item.remainingQuantity ?? item.approvedQuantity,
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
      link.download = `${activeTab}_dispatches_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    } else {
      if (!filteredHistoryItems.length) return;
      const exportRows = filteredHistoryItems.map((d) => ({
        "Dispatch Gate Pass": (d.dispatchNo || "").replace(/\s+/g, ""),
        "Sales Order": d.salesOrder?.orderNumber || "—",
        "Customer": resolveCustomerName(d.salesOrder, d),
        "Received By": d.receivedBy || "—",
        "Receiver Mobile": d.receiverPhone || "—",
        "Driver": d.driverName || "—",
        "Vehicle Number": d.vehicleNumber || "—",
        "Delivered Timestamp": d.deliveredAt ? new Date(d.deliveredAt).toLocaleString("en-IN") : "—",
        "Status": d.status,
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrder(text);
    setTimeout(() => setCopiedOrder(null), 2000);
  };

  const formatCleanNo = (num?: string | null) => {
    if (!num) return "—";
    return num.replace(/\s*-\s*/g, "-").replace(/\s+/g, "");
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* ─── DEDICATED ISOLATED PORTAL HEADER ─── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          background: '#FFFFFF',
          padding: '14px 20px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: isDispatch2 ? '#ECFDF5' : '#EEF2FF',
              color: isDispatch2 ? '#059669' : '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '15px'
            }}>
              {isDispatch2 ? 'SD' : 'RA'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                  {isDispatch2
                    ? 'Dispatch 2 Fulfillment Queue — Trading Products (Cat 2)'
                    : 'Dispatch 1 Fulfillment Queue — Manufacturing (Cat 1)'}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: isDispatch2 ? '#D1FAE5' : '#E0E7FF',
                  color: isDispatch2 ? '#065F46' : '#3730A3'
                }}>
                  {isDispatch2 ? '🛍️ Direct Trading Queue' : '🏭 QC Passed Work Orders'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                {isDispatch2 ? (
                  <span>Incharge: <strong>Sahad Dispatch</strong> (sahad.dispatch@himalayaerp.com) · Direct Sales Order ➔ Dispatch 2</span>
                ) : (
                  <span>Incharge: <strong>Ravikant T</strong> (ravikant.t@himalayaerp.com) · Plant Head ➔ Work Orders ➔ QC Inspection ➔ Dispatch 1</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── MAIN WORKSPACE CARD ─── */}
        <div className={styles.mainCard} style={{ marginTop: 0 }}>
          
          {/* Controls Bar: Tabs & Search Filter */}
          <div className={styles.controlBar}>
            
            {/* Tab Switcher Wrapper (Horizontally scrollable) */}
            <div className={styles.tabSwitcherWrapper}>
              <div className={styles.tabSwitcher}>
                <button
                  type="button"
                  onClick={() => setActiveTab("pending")}
                  className={`${styles.tabBtn} ${activeTab === "pending" ? styles.tabBtnActive : ""}`}
                >
                  <Package size={15} />
                  <span>Pending Queue</span>
                  <span className={`${styles.tabBadge} ${activeTab === "pending" ? styles.tabBadgeActive : ""}`}>
                    {totalPendingOrdersCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("remaining")}
                  className={`${styles.tabBtn} ${activeTab === "remaining" ? styles.tabBtnActive : ""}`}
                >
                  <Layers size={15} />
                  <span>Remaining Queue</span>
                  <span className={`${styles.tabBadge} ${activeTab === "remaining" ? styles.tabBadgeActive : ""}`}>
                    {totalRemainingOrdersCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className={`${styles.tabBtn} ${activeTab === "history" ? styles.tabBtnActive : ""}`}
                >
                  <History size={15} />
                  <span>Dispatch History & POD</span>
                  <span className={`${styles.tabBadge} ${activeTab === "history" ? styles.tabBadgeActive : ""}`}>
                    {filteredHistoryItems.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className={styles.filterToolbar}>
              <div className={styles.searchBox}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    activeTab === "pending"
                      ? "Search order #, customer, product or delivery address..."
                      : activeTab === "remaining"
                      ? "Search partially dispatched order #, customer or product..."
                      : "Search dispatch #, sales order, customer, driver or receiver..."
                  }
                  className={styles.searchInput}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className={styles.searchClear}
                    title="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className={styles.toolbarActions}>
                <button
                  type="button"
                  onClick={() => {
                    refetch();
                    refetchHistory();
                  }}
                  className={styles.btnActionLight}
                  title="Refresh dispatch data"
                >
                  <RefreshCw size={14} className={isRefetching || isHistoryLoading ? "animate-spin" : ""} />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className={styles.btnActionPrimary}
                  title="Export current view to CSV"
                >
                  <Download size={14} />
                  <span>Export Manifest</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─── 3. TAB 1: PENDING QUEUE (ORDER-WISE PRESENTATION) ─── */}
          {activeTab === "pending" && (
            <div className={styles.queueBody}>
              
              {/* Loading Skeleton */}
              {isLoading && (
                <div className={styles.loadingSkeleton}>
                  <div className={styles.skeletonRow} />
                  <div className={styles.skeletonRow} />
                  <div className={styles.skeletonRow} />
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconBox} style={{ color: "#ef4444", background: "#fef2f2" }}>
                    <ShieldCheck size={28} />
                  </div>
                  <h3 className={styles.emptyTitle}>Unable to Load Dispatch Orders</h3>
                  <p className={styles.emptyDesc}>
                    An error occurred while fetching staging records from the backend. Please check your network or try refreshing.
                  </p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className={styles.btnActionPrimary}
                    style={{ marginTop: 16 }}
                  >
                    Retry Loading
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && groupedPendingOrders.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconBox}>
                    <Package size={28} />
                  </div>
                  <h3 className={styles.emptyTitle}>
                    {search ? "No Matching Orders Found" : "No Orders Awaiting Dispatch"}
                  </h3>
                  <p className={styles.emptyDesc}>
                    {search
                      ? `No pending dispatches match "${search}". Try clearing your search query.`
                      : "All manufacturing work orders and trading items are up to date. Once new finished goods or orders pass QC, they will appear here automatically."}
                  </p>
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className={styles.chipBtn}
                      style={{ marginTop: 14 }}
                    >
                      Clear Search Filter
                    </button>
                  )}
                </div>
              )}

              {/* Grouped Sales Order Cards */}
              {!isLoading && !error && groupedPendingOrders.map((group) => {
                const cleanOrderNo = formatCleanNo(group.orderNumber);
                const isCopied = copiedOrder === group.orderNumber;

                return (
                  <div key={group.orderKey} className={styles.orderCard}>
                    
                    {/* Sales Order Card Header */}
                    <div className={styles.orderCardHeader}>
                      <div className={styles.orderHeaderLeft}>
                        
                        {/* Order Number Badge */}
                        <div
                          className={styles.orderNumberBadge}
                          onClick={() => copyToClipboard(group.orderNumber)}
                          style={{ cursor: "pointer" }}
                          title="Click to copy Sales Order #"
                        >
                          <FileText size={13} color="#93c5fd" />
                          <span>{cleanOrderNo}</span>
                          {isCopied ? (
                            <CheckCircle2 size={12} color="#4ade80" />
                          ) : (
                            <Copy size={11} color="#94a3b8" />
                          )}
                        </div>

                        {/* Customer Information */}
                        <div className={styles.customerInfo}>
                          <div className={styles.customerAvatar} style={isDispatch2 ? { background: "linear-gradient(135deg, #059669 0%, #047857 100%)" } : undefined}>
                            {(group.customerName || "C")[0].toUpperCase()}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                            <span className={styles.customerName}>
                              {group.customerName}
                            </span>
                            {group.projectName && group.projectName !== group.customerName && (
                              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                                Project: {group.projectName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Destination Address */}
                        <div className={styles.destinationBadge} title={group.deliveryAddress}>
                          <MapPin size={13} color="#2563eb" style={{ flexShrink: 0 }} />
                          <span>{group.deliveryAddress}</span>
                        </div>
                      </div>

                      {/* Header Right: Summary & Order Count & Order Dispatch Action */}
                      <div className={styles.orderHeaderRight}>
                        <span className={styles.itemCountBadge}>
                          {group.items.length} {group.items.length === 1 ? "Product" : "Products"} • {group.totalQty} Units Ready
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCreateOrderDispatch(group)}
                          className={styles.btnCreateDispatchHeader}
                          title={`Create Dispatch for Order #${cleanOrderNo} (${group.totalQty} Units Ready)`}
                        >
                          <Truck size={14} />
                          <span>Create Dispatch</span>
                        </button>
                      </div>
                    </div>

                    {/* Desktop Products Table */}
                    <div className={styles.itemsTableWrapper}>
                      <table className={styles.itemsTable}>
                        <thead>
                          <tr>
                            <th style={{ width: 170 }}>Work Order / Source</th>
                            <th>Product Description</th>
                            <th style={{ width: 150, textAlign: "center" }}>Fulfillment Type</th>
                            <th style={{ width: 120, textAlign: "center" }}>Ready Qty</th>
                            <th style={{ width: 150, textAlign: "center" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map((item) => (
                            <tr key={item.id}>
                              
                              {/* Work Order / Source */}
                              <td>
                                {item.workOrderNumber ? (
                                  <span className={styles.badgeWo}>
                                    WO: {item.workOrderNumber}
                                  </span>
                                ) : (
                                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                                    Sales Allocation
                                  </span>
                                )}
                              </td>

                              {/* Product Description */}
                              <td>
                                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                  <span style={{ fontWeight: 700, color: "#0f172a" }}>
                                    {item.productName}
                                  </span>
                                  {item.productSku && (
                                    <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                                      SKU: {item.productSku}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Fulfillment Type */}
                              <td style={{ textAlign: "center" }}>
                                {item.itemType === "WORK_ORDER" ? (
                                  <span className={styles.badgeMfg}>
                                    <Factory size={12} /> MANUFACTURING
                                  </span>
                                ) : (
                                  <span className={styles.badgeTrading}>
                                    <Boxes size={12} /> TRADING
                                  </span>
                                )}
                              </td>

                              {/* Ready Qty */}
                              <td style={{ textAlign: "center" }}>
                                <span className={styles.badgeQty}>
                                  {item.approvedQuantity}{" "}
                                  <span style={{ fontSize: "10px", color: "#059669" }}>UNITS</span>
                                </span>
                              </td>

                              {/* Status */}
                              <td style={{ textAlign: "center" }}>
                                <span className={styles.badgeReady}>
                                  <CheckCircle2 size={12} color="#16a34a" />
                                  Ready to Dispatch
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Product Card List (< 768px) */}
                    <div className={styles.mobileList}>
                      {group.items.map((item) => (
                        <div key={item.id} className={styles.mobileItemCard}>
                          <div className={styles.mobileItemTop}>
                            <div>
                              <div className={styles.mobileItemName}>{item.productName}</div>
                              {item.productSku && (
                                <div className={styles.mobileItemSku}>SKU: {item.productSku}</div>
                              )}
                              {item.workOrderNumber && (
                                <span className={styles.badgeWo} style={{ marginTop: 4 }}>
                                  WO: {item.workOrderNumber}
                                </span>
                              )}
                            </div>

                            <span className={styles.badgeQty}>
                              {item.approvedQuantity} <span style={{ fontSize: "10px" }}>UNITS</span>
                            </span>
                          </div>

                          <div className={styles.mobileItemFooter}>
                            <div>
                              {item.itemType === "WORK_ORDER" ? (
                                <span className={styles.badgeMfg} style={{ fontSize: "10.5px" }}>
                                  <Factory size={11} /> MANUFACTURING
                                </span>
                              ) : (
                                <span className={styles.badgeTrading} style={{ fontSize: "10.5px" }}>
                                  <Boxes size={11} /> TRADING
                                </span>
                              )}
                            </div>

                            <span className={styles.badgeReady} style={{ fontSize: "11px", padding: "2px 6px" }}>
                              <CheckCircle2 size={11} color="#16a34a" /> Ready
                            </span>
                          </div>
                        </div>
                      ))}

                      <div className={styles.mobileOrderFooter}>
                        <button
                          type="button"
                          onClick={() => handleCreateOrderDispatch(group)}
                          className={styles.btnCreateDispatchHeader}
                          style={{ width: "100%", justifyContent: "center", padding: "10px 16px" }}
                        >
                          <Truck size={15} />
                          <span>Create Dispatch ({group.totalQty} Units)</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* ─── 4. TAB 2: REMAINING QUEUE (PARTIALLY DISPATCHED ORDERS) ─── */}
          {activeTab === "remaining" && (
            <div className={styles.queueBody}>
              {/* Loading Skeleton */}
              {isLoading && (
                <div className={styles.loadingSkeleton}>
                  <div className={styles.skeletonRow} />
                  <div className={styles.skeletonRow} />
                  <div className={styles.skeletonRow} />
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconBox} style={{ color: "#ef4444", background: "#fef2f2" }}>
                    <ShieldCheck size={28} />
                  </div>
                  <h3 className={styles.emptyTitle}>Unable to Load Remaining Orders</h3>
                  <p className={styles.emptyDesc}>
                    An error occurred while fetching partially dispatched records. Please check your network or try refreshing.
                  </p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className={styles.btnActionPrimary}
                    style={{ marginTop: 16 }}
                  >
                    Retry Loading
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && groupedRemainingOrders.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconBox} style={{ background: "#fffbeb", color: "#d97706" }}>
                    <Layers size={28} />
                  </div>
                  <h3 className={styles.emptyTitle}>
                    {search ? "No Matching Partial Orders" : "No Remaining Quantities"}
                  </h3>
                  <p className={styles.emptyDesc}>
                    {search
                      ? `No partially dispatched orders match "${search}". Try clearing your search query.`
                      : "All orders in the pipeline are currently either 100% fulfilled or completely fresh in the Pending Queue. When an order is partially dispatched (e.g. 50 out of 100 units), the remaining units will appear here automatically."}
                  </p>
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className={styles.chipBtn}
                      style={{ marginTop: 14 }}
                    >
                      Clear Search Filter
                    </button>
                  )}
                </div>
              )}

              {/* Grouped Remaining Order Cards */}
              {!isLoading && !error && groupedRemainingOrders.map((group) => {
                const cleanOrderNo = formatCleanNo(group.orderNumber);
                const isCopied = copiedOrder === group.orderNumber;
                const totalOrd = group.totalOrderedQty || group.totalQty;
                const totalDisp = group.totalDispatchedQty || 0;
                const pct = totalOrd > 0 ? Math.round((totalDisp / totalOrd) * 100) : 0;

                return (
                  <div key={group.orderKey} className={styles.orderCard} style={{ borderColor: "#fde68a" }}>
                    {/* Order Header */}
                    <div className={styles.orderCardHeader} style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
                      <div className={styles.orderHeaderLeft}>
                        <div
                          className={styles.orderNumberBadge}
                          onClick={() => copyToClipboard(group.orderNumber)}
                          style={{ cursor: "pointer", background: "rgba(245, 158, 11, 0.2)", borderColor: "rgba(251, 191, 36, 0.4)", color: "#fde68a" }}
                          title="Click to copy Sales Order #"
                        >
                          <FileText size={13} color="#fde68a" />
                          <span>{cleanOrderNo}</span>
                          {isCopied ? (
                            <CheckCircle2 size={12} color="#4ade80" />
                          ) : (
                            <Copy size={11} color="#94a3b8" />
                          )}
                        </div>

                        <div className={styles.customerInfo}>
                          <div className={styles.customerAvatar} style={{ background: "#fef3c7", color: "#92400e" }}>
                            {(group.customerName || "C")[0].toUpperCase()}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                            <span className={styles.customerName}>
                              {group.customerName}
                            </span>
                            {group.projectName && group.projectName !== group.customerName && (
                              <span style={{ fontSize: "11px", color: "#b45309", fontWeight: 600 }}>
                                Project: {group.projectName}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={styles.destinationBadge} title={group.deliveryAddress}>
                          <MapPin size={13} color="#f59e0b" style={{ flexShrink: 0 }} />
                          <span>{group.deliveryAddress}</span>
                        </div>
                      </div>

                      <div className={styles.orderHeaderRight}>
                        <span className={styles.remainingSummaryBadge}>
                          <Layers size={13} />
                          {group.totalQty} Remaining ({pct}% Dispatched)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCreateOrderDispatch(group)}
                          className={styles.btnCreateDispatchRemaining}
                          title={`Dispatch all remaining items for Order #${cleanOrderNo}`}
                        >
                          <Truck size={14} />
                          <span>Dispatch Remaining</span>
                        </button>
                      </div>
                    </div>

                    {/* Desktop Table */}
                    <div className={styles.itemsTableWrapper}>
                      <table className={styles.itemsTable}>
                        <thead>
                          <tr>
                            <th style={{ width: 170 }}>Work Order / Source</th>
                            <th>Product Description</th>
                            <th style={{ width: 110, textAlign: "center" }}>Ordered</th>
                            <th style={{ width: 120, textAlign: "center" }}>Dispatched</th>
                            <th style={{ width: 130, textAlign: "center" }}>Remaining</th>
                            <th style={{ width: 150 }}>Progress</th>
                            <th style={{ width: 150, textAlign: "center" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map((item) => {
                            const ord = item.orderedQuantity ?? Number(item.approvedQuantity);
                            const disp = item.dispatchedQuantity ?? 0;
                            const rem = item.remainingQuantity ?? Number(item.approvedQuantity);
                            const itemPct = ord > 0 ? Math.round((disp / ord) * 100) : 0;

                            return (
                              <tr key={item.id}>
                                <td>
                                  {item.workOrderNumber ? (
                                    <span className={styles.badgeWo}>WO: {item.workOrderNumber}</span>
                                  ) : (
                                    <span style={{ fontSize: "12px", color: "#64748b" }}>Sales Allocation</span>
                                  )}
                                </td>

                                <td>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{item.productName}</span>
                                    {item.productSku && (
                                      <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                                        SKU: {item.productSku}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td style={{ textAlign: "center", fontWeight: 700, color: "#334155" }}>
                                  {ord} Units
                                </td>

                                <td style={{ textAlign: "center" }}>
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
                                    <CheckCircle2 size={12} /> {disp} Units
                                  </span>
                                </td>

                                <td style={{ textAlign: "center" }}>
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      padding: "3px 8px",
                                      borderRadius: 6,
                                      background: "#fffbeb",
                                      border: "1px solid #fde68a",
                                      color: "#b45309",
                                      fontSize: "12px",
                                      fontWeight: 800,
                                    }}
                                  >
                                    {rem} Units
                                  </span>
                                </td>

                                <td>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700 }}>
                                      <span style={{ color: "#2563eb" }}>{itemPct}%</span>
                                      <span style={{ color: "#64748b" }}>{disp}/{ord}</span>
                                    </div>
                                    <div style={{ width: "100%", height: 5, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
                                      <div style={{ width: `${Math.min(100, Math.max(0, itemPct))}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #10b981)", borderRadius: 999 }} />
                                    </div>
                                  </div>
                                </td>

                                <td style={{ textAlign: "center" }}>
                                  <span className={styles.badgeRemainingStatus}>
                                    <Clock size={12} color="#d97706" />
                                    Pending Shipment
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile List (< 768px) */}
                    <div className={styles.mobileList}>
                      {group.items.map((item) => {
                        const ord = item.orderedQuantity ?? Number(item.approvedQuantity);
                        const disp = item.dispatchedQuantity ?? 0;
                        const rem = item.remainingQuantity ?? Number(item.approvedQuantity);
                        const itemPct = ord > 0 ? Math.round((disp / ord) * 100) : 0;

                        return (
                          <div key={item.id} className={styles.mobileItemCard}>
                            <div className={styles.mobileItemTop}>
                              <div>
                                <div className={styles.mobileItemName}>{item.productName}</div>
                                {item.productSku && <div className={styles.mobileItemSku}>SKU: {item.productSku}</div>}
                                <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "11px", color: "#64748b" }}>Ordered: <b>{ord}</b></span>
                                  <span style={{ fontSize: "11px", color: "#16a34a" }}>Dispatched: <b>{disp}</b></span>
                                </div>
                              </div>
                              <span
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: 6,
                                  background: "#fffbeb",
                                  border: "1px solid #fde68a",
                                  color: "#b45309",
                                  fontSize: "12px",
                                  fontWeight: 800,
                                }}
                              >
                                {rem} Left
                              </span>
                            </div>

                            <div style={{ marginTop: 6, marginBottom: 8 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, marginBottom: 2 }}>
                                <span style={{ color: "#2563eb" }}>{itemPct}% dispatched</span>
                                <span style={{ color: "#64748b" }}>{disp}/{ord}</span>
                              </div>
                              <div style={{ width: "100%", height: 4, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
                                <div style={{ width: `${Math.min(100, Math.max(0, itemPct))}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #10b981)", borderRadius: 999 }} />
                              </div>
                            </div>

                            <div className={styles.mobileItemFooter}>
                              <span className={styles.badgeRemainingStatus} style={{ fontSize: "11px", padding: "2px 6px" }}>
                                <Clock size={11} color="#d97706" /> Pending
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      <div className={styles.mobileOrderFooter}>
                        <button
                          type="button"
                          onClick={() => handleCreateOrderDispatch(group)}
                          className={styles.btnCreateDispatchRemaining}
                          style={{ width: "100%", justifyContent: "center", padding: "10px 16px" }}
                        >
                          <Truck size={15} />
                          <span>Dispatch Remaining ({group.totalQty} Units)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── 5. TAB 3: DISPATCH HISTORY & POD PROOFS ─── */}
          {activeTab === "history" && (
            <div className={styles.historyTableWrapper}>
              
              {/* Loading Skeleton */}
              {isHistoryLoading && (
                <div className={styles.loadingSkeleton}>
                  <div className={styles.skeletonRow} />
                  <div className={styles.skeletonRow} />
                  <div className={styles.skeletonRow} />
                </div>
              )}

              {/* Empty State */}
              {!isHistoryLoading && filteredHistoryItems.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconBox}>
                    <History size={28} />
                  </div>
                  <h3 className={styles.emptyTitle}>
                    {search ? "No Matching Deliveries Found" : "No Completed Dispatches Yet"}
                  </h3>
                  <p className={styles.emptyDesc}>
                    {search
                      ? `No delivered records match "${search}". Try clearing your search filter.`
                      : "Delivered shipments with confirmed receiver signatures and POD images will appear here automatically."}
                  </p>
                </div>
              )}

              {/* History Table */}
              {!isHistoryLoading && filteredHistoryItems.length > 0 && (
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th style={{ width: 170 }}>Dispatch Gate Pass</th>
                      <th style={{ width: 160 }}>Sales Order</th>
                      <th style={{ width: 200 }}>Customer</th>
                      <th style={{ width: 220 }}>Receiver Details</th>
                      <th style={{ width: 200 }}>Driver / Vehicle</th>
                      <th style={{ width: 170 }}>Delivered At</th>
                      <th style={{ width: 130, textAlign: "center" }}>POD Proof</th>
                      <th style={{ width: 140, textAlign: "center" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistoryItems.map((dispatchItem) => {
                      const cleanDispNo = formatCleanNo(dispatchItem.dispatchNo);
                      const cleanSoNo = formatCleanNo(dispatchItem.salesOrder?.orderNumber);

                      return (
                        <tr key={dispatchItem.id}>
                          
                          {/* Dispatch Number */}
                          <td>
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
                          <td>
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
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
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
                                {(resolveCustomerName(dispatchItem.salesOrder, dispatchItem) || "C")[0]}
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
                                  maxWidth: 160,
                                }}
                                title={resolveCustomerName(dispatchItem.salesOrder, dispatchItem)}
                              >
                                {resolveCustomerName(dispatchItem.salesOrder, dispatchItem)}
                              </span>
                            </div>
                          </td>

                          {/* Receiver Details */}
                          <td>
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
                          <td>
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
                          <td>
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
                          <td style={{ textAlign: "center" }}>
                            {dispatchItem.podUrl ? (
                              <button
                                type="button"
                                onClick={() => setSelectedPodImage(dispatchItem.podUrl)}
                                className={styles.btnViewPod}
                              >
                                <ImageIcon size={13} />
                                <span>View POD</span>
                              </button>
                            ) : (
                              <span style={{ color: "#94a3b8", fontSize: 11, fontStyle: "italic" }}>
                                No image
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td style={{ textAlign: "center" }}>
                            <span className={styles.badgeDelivered}>
                              <CheckCircle2 size={12} /> DELIVERED
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ─── 5. POD IMAGE LIGHTBOX MODAL ─── */}
      {selectedPodImage && (
        <div
          role="presentation"
          onClick={() => setSelectedPodImage(null)}
          className={styles.modalBackdrop}
        >
          <div
            role="dialog"
            onClick={(e) => e.stopPropagation()}
            className={styles.modalContent}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Proof of Delivery (POD) Proof</h3>
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
                  <ExternalLink size={13} />
                  <span>Open Full Resolution</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedPodImage(null)}
                  className={styles.modalCloseBtn}
                  title="Close Preview"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className={styles.modalImageArea}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPodImage}
                alt="Proof of Delivery receipt"
                className={styles.modalImage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

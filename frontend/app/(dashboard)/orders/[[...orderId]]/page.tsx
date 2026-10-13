"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Calendar,
  Clock,
  Hash,
  Truck,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Layers,
  Phone,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  Building2,
  RefreshCw,
  X,
  CreditCard,
  Check,
  Download,
  Eye,
  Factory,
  CheckCircle2,
  Clock3,
  BadgeCheck,
  Send,
  Sparkles,
} from "lucide-react";
import { backendFetch } from "@/lib/backendFetch";
import { apiClient } from "@/lib/apiClient";
import { getBackendAssetUrl } from "@/lib/assetUrl";
import StatusBadge from "@/shared/components/StatusBadge";
import { getOrderStatusLabel, isDeliveredOrder } from "@/shared/utils/orderStatusResolver";

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  CONFIRMED:          { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  ORDER_CONFIRMED:    { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  APPROVED:           { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  SENT_TO_PLANT:      { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  SENT_TO_PLANT_HEAD: { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  PLANT_APPROVED:     { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  READY_FOR_PRODUCTION:{ bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  IN_PRODUCTION:      { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  PRODUCTION_STARTED: { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  QC_PENDING:         { bg: "#fefce8", color: "#a16207", border: "#fef08a" },
  QC_APPROVED:        { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  READY_FOR_DISPATCH: { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
  DISPATCH_CREATED:   { bg: "#fef9c3", color: "#854d0e", border: "#fde68a" },
  DISPATCHED:         { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  IN_TRANSIT:         { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  PARTIALLY_DELIVERED:{ bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  "PARTIALLY DELIVERED":{ bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  OUT_FOR_DELIVERY:   { bg: "#fefce8", color: "#a16207", border: "#fef08a" },
  DELIVERED:          { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  COMPLETED:          { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  CANCELLED:          { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  DRAFT:              { bg: "#f8fafc", color: "#475569", border: "#cbd5e1" },
  DEFAULT:            { bg: "#F5FAFE", color: "#475569", border: "#DCE5F0" },
};

function StatusPill({ status }: { status: string }) {
  return <StatusBadge status={status} />;
}

function WorkOrderStatusPill({ status }: { status: string }) {
  const norm = String(status || "").toUpperCase();
  if (norm === "DISPATCHED") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "3px 9px",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 750,
          background: "rgba(34, 197, 94, 0.12)",
          color: "#166534",
          border: "1px solid rgba(34, 197, 94, 0.25)",
        }}
      >
        Dispatched
      </span>
    );
  }
  if (norm === "COMPLETED") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "3px 9px",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 750,
          background: "rgba(34, 197, 94, 0.12)",
          color: "#166534",
          border: "1px solid rgba(34, 197, 94, 0.25)",
        }}
      >
        Completed
      </span>
    );
  }
  return <StatusBadge status={status} />;
}

function InfoCard({ icon: Icon, label, value, highlight = false, subtext }: any) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "13px 15px",
        background: highlight ? "rgba(37,99,235,0.03)" : "#f8fafc",
        border: `1px solid ${highlight ? "rgba(37,99,235,0.22)" : "#e2e8f0"}`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "#64748b",
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        <Icon size={13} style={{ color: highlight ? "#0284c7" : "#64748b" }} />
        {label}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0f172a", lineHeight: 1.35, wordBreak: "break-word" }}>
        {value || "—"}
      </div>
      {subtext && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{subtext}</div>}
    </div>
  );
}


function formatAddressValue(value: any): string {
  if (!value) return "";
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return formatAddressValue(parsed);
    } catch {
      return value.trim();
    }
  }
  const parts = [
    value.line1 || value.addressLine1 || value.street || value.address,
    value.line2 || value.addressLine2,
    value.city,
    value.state,
    value.postalCode || value.pincode || value.pinCode || value.zipCode,
    value.country,
  ].filter(Boolean);
  return parts.join(", ");
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Extract order identifier (handles multi-segment slug like HCPPL/2627/0199)
  const rawOrderId = useMemo(() => {
    const p = params?.orderId;
    if (Array.isArray(p)) return p.join("/");
    return p ? String(p) : "";
  }, [params?.orderId]);

  const decodedOrderId = useMemo(() => {
    try {
      return decodeURIComponent(rawOrderId).trim();
    } catch {
      return rawOrderId.trim();
    }
  }, [rawOrderId]);

  const [order, setOrder] = useState<any>(null);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPodImage, setSelectedPodImage] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    if (!decodedOrderId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);
      setErrorMsg(null);

      // Clean representations of the order ID for matching
      const targetVariants = [
        decodedOrderId,
        decodedOrderId.replace(/\//g, "-"),
        decodedOrderId.replace(/-/g, "/"),
        decodedOrderId.replace(/[^A-Za-z0-9]/g, ""),
      ].filter(Boolean);

      let foundOrder: any = null;

      // 1. Try dedicated lookup endpoint via apiClient & backendFetch
      for (const variant of targetVariants) {
        if (foundOrder && (foundOrder.id || foundOrder.orderNumber)) break;
        try {
          const res: any = await apiClient.get(`/sales/orders/lookup/by-number?orderNumber=${encodeURIComponent(variant)}`);
          const extracted = res?.data?.data || res?.data || res;
          if (extracted && (extracted.id || extracted.orderNumber)) {
            foundOrder = extracted;
            break;
          }
        } catch {
          // Continue
        }
        if (!foundOrder) {
          try {
            const res: any = await backendFetch(`/sales/orders/lookup/by-number?orderNumber=${encodeURIComponent(variant)}`);
            const extracted = res?.data?.data || res?.data || res;
            if (extracted && (extracted.id || extracted.orderNumber)) {
              foundOrder = extracted;
              break;
            }
          } catch {
            // Continue
          }
        }
      }

      // 2. Direct ID / Slug endpoint
      if (!foundOrder || (!foundOrder.id && !foundOrder.orderNumber)) {
        for (const variant of targetVariants) {
          if (foundOrder && (foundOrder.id || foundOrder.orderNumber)) break;
          try {
            const res: any = await apiClient.get(`/sales/orders/${encodeURIComponent(variant)}`);
            const extracted = res?.data?.data || res?.data || res;
            if (extracted && (extracted.id || extracted.orderNumber)) {
              foundOrder = extracted;
              break;
            }
          } catch {
            // Continue
          }
          if (!foundOrder) {
            try {
              const res: any = await backendFetch(`/sales/orders/${encodeURIComponent(variant)}`);
              const extracted = res?.data?.data || res?.data || res;
              if (extracted && (extracted.id || extracted.orderNumber)) {
                foundOrder = extracted;
                break;
              }
            } catch {
              // Continue
            }
          }
        }
      }

      // 3. Fallback to list search
      if (!foundOrder || (!foundOrder.id && !foundOrder.orderNumber)) {
        try {
          const listRes: any =
            (await apiClient.get("/sales/orders?limit=300").catch(() => null)) ||
            (await backendFetch("/sales/orders?limit=300").catch(() => null));
          const list = Array.isArray(listRes?.data?.data)
            ? listRes.data.data
            : Array.isArray(listRes?.data)
              ? listRes.data
              : Array.isArray(listRes)
                ? listRes
                : [];
          const cleanSearch = decodedOrderId.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
          foundOrder = list.find((o: any) => {
            const no = String(o.orderNumber || o.orderNo || o.id || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
            return no === cleanSearch || o.id === decodedOrderId || String(o.orderNumber) === decodedOrderId;
          });
        } catch {
          // Ignore
        }
      }

      if (foundOrder && (foundOrder.id || foundOrder.orderNumber)) {
        setOrder(foundOrder);

        // If arrived via UUID or generic id, cleanly update browser address bar to human-readable orderNumber
        if (
          foundOrder.orderNumber &&
          decodedOrderId !== foundOrder.orderNumber &&
          typeof window !== "undefined"
        ) {
          window.history.replaceState(null, "", `/orders/${foundOrder.orderNumber}`);
        }

        const cleanTargetNo = String(foundOrder.orderNumber || decodedOrderId).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        const cleanTargetId = String(foundOrder.id || "").trim();
        const targetCustomerName = String(foundOrder.customer?.companyName || foundOrder.customer?.name || foundOrder.customerName || "").trim().toLowerCase();

        const matchesTargetOrder = (sId?: any, sNo?: any, itemCustomer?: any) => {
          // 1. Strict primary foreign key match
          if (sId && cleanTargetId && String(sId).trim() === cleanTargetId) return true;
          if (!sNo) return false;

          const cleanNo = String(sNo).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
          if (!cleanNo) return false;

          // 2. Strict exact normalized match
          if (cleanNo === cleanTargetNo) {
            if (targetCustomerName && itemCustomer) {
              const custStr = String(itemCustomer).trim().toLowerCase();
              if (custStr && custStr !== targetCustomerName && !custStr.includes(targetCustomerName) && !targetCustomerName.includes(custStr)) {
                return false;
              }
            }
            return true;
          }

          // 3. Strict match with standard separators (e.g. HCPPL/2627/0400 vs HCPPL-2627-0400)
          const normTarget = String(foundOrder.orderNumber || decodedOrderId).trim().toUpperCase();
          const normNo = String(sNo).trim().toUpperCase();
          if (normTarget === normNo || normTarget.replace(/\//g, "-") === normNo.replace(/\//g, "-")) {
            return true;
          }

          return false;
        };

        // Fetch related active/past dispatches for this sales order
        try {
          const dispRes: any =
            (await apiClient.get(`/logistics/dispatches?salesOrderId=${encodeURIComponent(foundOrder.id)}&limit=200`).catch(() => null)) ||
            (await apiClient.get("/logistics/dispatches?limit=200").catch(() => null)) ||
            (await backendFetch("/logistics/dispatches?limit=200").catch(() => null));
          const allDispatches = Array.isArray(dispRes?.data?.data)
            ? dispRes.data.data
            : Array.isArray(dispRes?.data)
              ? dispRes.data
              : Array.isArray(dispRes)
                ? dispRes
                : [];
          const matched = allDispatches.filter((d: any) =>
            matchesTargetOrder(
              d.salesOrderId || d.salesOrder?.id,
              d.salesOrder?.orderNumber || d.salesOrderNo,
              d.customerName || d.receiverName || d.receiver?.name || d.salesOrder?.customer?.companyName
            )
          );

          const dbDispatches = Array.isArray(foundOrder.dispatches) ? foundOrder.dispatches : [];
          const combinedDispatches = [...dbDispatches];
          for (const d of matched) {
            if (!combinedDispatches.some((exist: any) => exist.id === d.id || (d.dispatchNumber && exist.dispatchNumber === d.dispatchNumber))) {
              combinedDispatches.push(d);
            }
          }
          setDispatches(combinedDispatches);
        } catch {
          setDispatches(foundOrder.dispatches || []);
        }

        // Fetch related work orders
        try {
          const woRes: any =
            (await apiClient.get(`/production/work-orders?salesOrderId=${encodeURIComponent(foundOrder.id)}&limit=200`).catch(() => null)) ||
            (await apiClient.get("/production/work-orders?limit=200").catch(() => null)) ||
            (await backendFetch("/production/work-orders?limit=200").catch(() => null));
          const allWos = Array.isArray(woRes?.data?.data)
            ? woRes.data.data
            : Array.isArray(woRes?.data)
              ? woRes.data
              : Array.isArray(woRes)
                ? woRes
                : [];
          const matchedWos = allWos.filter((w: any) =>
            matchesTargetOrder(
              w.productionPlan?.salesOrderId || w.salesOrderId,
              w.productionPlan?.salesOrder?.orderNumber || w.salesOrderNumber
            )
          );

          const dbWorkOrders = foundOrder.productionPlans?.flatMap((p: any) => p.workOrders || []) || foundOrder.workOrders || [];
          const combinedWos = [...dbWorkOrders];
          for (const w of matchedWos) {
            if (!combinedWos.some((exist: any) => exist.id === w.id || (w.workOrderNumber && exist.workOrderNumber === w.workOrderNumber))) {
              combinedWos.push(w);
            }
          }
          setWorkOrders(combinedWos);
        } catch {
          const dbWorkOrders = foundOrder.productionPlans?.flatMap((p: any) => p.workOrders || []) || foundOrder.workOrders || [];
          setWorkOrders(dbWorkOrders);
        }
      } else {
        setOrder(null);
        setErrorMsg(`Sales Order #${decodedOrderId} not found.`);
      }
    } catch (err: any) {
      console.error("Failed to load order details:", err);
      setErrorMsg(err.message || "Failed to load order details");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [decodedOrderId]);

  useEffect(() => {
    if (!decodedOrderId) {
      router.replace("/sales/orders");
      return;
    }
    fetchOrderDetails();
  }, [decodedOrderId, fetchOrderDetails, router]);

  // Derive authoritative unified order status combining order, dispatches, and work orders
  const effectiveOrderForStatus = useMemo(() => {
    if (!order) return null;
    const effectiveDispatches = dispatches.length > 0 ? dispatches : (order.dispatches || []);
    const effectiveWorkOrders = workOrders.length > 0 ? workOrders : (order.workOrders || order.productionPlans?.[0]?.workOrders || []);

    let calculatedDispatchStatus = order.dispatchStatus;
    if (effectiveDispatches.length > 0) {
      const completedStatuses = new Set(["DELIVERED", "POD_RECEIVED", "DISPATCH_CLOSED"]);
      const activeTransitStatuses = new Set(["DISPATCHED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"]);
      if (effectiveDispatches.every((d: any) => completedStatuses.has(String(d.status).toUpperCase()))) {
        calculatedDispatchStatus = "DELIVERED";
      } else if (effectiveDispatches.some((d: any) => activeTransitStatuses.has(String(d.status).toUpperCase()))) {
        calculatedDispatchStatus = "IN_TRANSIT";
      } else {
        calculatedDispatchStatus = effectiveDispatches[0]?.status || calculatedDispatchStatus;
      }
    }

    return {
      ...order,
      dispatches: effectiveDispatches,
      workOrders: effectiveWorkOrders,
      dispatchStatus: calculatedDispatchStatus,
    };
  }, [order, dispatches, workOrders]);

  const accurateStatusLabel = useMemo(() => {
    if (!effectiveOrderForStatus) return "Confirmed";
    return getOrderStatusLabel(effectiveOrderForStatus);
  }, [effectiveOrderForStatus]);

  // Classify dispatches into completed / in-transit sets
  const deliveredDispatches = useMemo(() => {
    const completedStatuses = new Set(["DELIVERED", "POD_RECEIVED", "DISPATCH_CLOSED"]);
    return (dispatches || []).filter((d: any) => completedStatuses.has(String(d.status || "").toUpperCase()));
  }, [dispatches]);

  const inTransitDispatches = useMemo(() => {
    const transitStatuses = new Set(["DISPATCHED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"]);
    return (dispatches || []).filter((d: any) => transitStatuses.has(String(d.status || "").toUpperCase()));
  }, [dispatches]);

  const isPartiallyDelivered = useMemo(() => {
    return deliveredDispatches.length > 0 && inTransitDispatches.length > 0;
  }, [deliveredDispatches, inTransitDispatches]);

  const isFullyDelivered = useMemo(() => {
    return dispatches.length > 0 && deliveredDispatches.length === dispatches.length;
  }, [dispatches, deliveredDispatches]);

  const currentStageIdx = useMemo(() => {
    switch (accurateStatusLabel) {
      case "Delivered":
      case "Closed":
        return 7;
      case "Partially Delivered":
      case "In Transit":
        return 6;
      case "Ready for Dispatch":
      case "Sent to Dispatch":
        return 5;
      case "QC Approved":
        return 4;
      case "QC Inspection":
        return 3;
      case "In Production":
        return 2;
      case "Production Planned":
      case "Accepted by Plant Head":
      case "Sent to Plant Head":
        return 1;
      case "Confirmed":
      default:
        return 0;
    }
  }, [accurateStatusLabel]);

  // Dynamically compute authentic stages and timeline descriptions for the lifecycle stepper
  const dynamicStages = useMemo(() => {
    const fmt = (d: any) => {
      if (!d) return "";
      try {
        const parsed = new Date(d);
        if (isNaN(parsed.getTime())) return String(d);
        return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      } catch {
        return String(d);
      }
    };

    const orderDateStr = fmt(order?.orderDate || order?.createdAt);
    const woCount = workOrders.length;
    const completedWoCount = workOrders.filter((w: any) =>
      ["COMPLETED", "DISPATCHED"].includes(String(w.status || "").toUpperCase())
    ).length;
    const woDate = workOrders[0]?.completedAt || workOrders[0]?.startedAt || workOrders[0]?.createdAt;
    const woDateStr = fmt(woDate);

    const inv = (dispatches || []).find((d: any) => d?.invoiceNumber)?.invoiceNumber || order?.invoiceNumber || order?.invoiceNo;
    const driver = inTransitDispatches[0]?.driverName || dispatches[0]?.driverName;
    const vehicle = inTransitDispatches[0]?.vehicleNumber || dispatches[0]?.vehicleNumber;

    const delCount = deliveredDispatches.length;
    const totalDisp = dispatches.length;
    const delDateStr = fmt(deliveredDispatches[0]?.deliveredAt);
    const targetDateStr = fmt(order?.targetDate || order?.requestedDeliveryDate || order?.expectedDeliveryDate);

    // 1. Confirmed
    const confirmedSubtitle = orderDateStr ? `Verified ${orderDateStr}` : "Order Verified";

    // 2. Plant Planned
    const plantSubtitle = woCount > 0 ? `${woCount} WO${woCount > 1 ? "s" : ""} Scheduled` : "Accepted & Scheduled";

    // 3. Production
    let prodSubtitle = "Work Orders Active";
    if (woCount > 0 && completedWoCount === woCount) {
      prodSubtitle = `All ${woCount} Finished${woDateStr ? ` (${woDateStr})` : ""}`;
    } else if (completedWoCount > 0) {
      prodSubtitle = `${completedWoCount}/${woCount} Completed`;
    } else if (woCount > 0) {
      prodSubtitle = `${woCount} In Production`;
    }

    // 4. QC Inspect
    const qcInspectSubtitle = (completedWoCount === woCount && woCount > 0) || totalDisp > 0
      ? "Audit Completed"
      : "Quality Audit";

    // 5. QC Passed
    const qcPassedSubtitle = (completedWoCount === woCount && woCount > 0) || totalDisp > 0
      ? "All Verified Ready"
      : "Pending Release";

    // 6. Ready Dispatch
    const readyDispatchSubtitle = inv
      ? `Inv #${inv} Ready`
      : totalDisp > 0
        ? `${totalDisp} Run${totalDisp > 1 ? "s" : ""} Staged`
        : "Staged for Transit";

    // 7. In Transit
    let inTransitSubtitle = "On Route with Driver";
    if (inTransitDispatches.length > 0) {
      inTransitSubtitle = `${inTransitDispatches.length} Run${inTransitDispatches.length > 1 ? "s" : ""} on Route${vehicle ? ` (${vehicle})` : ""}`;
    } else if (totalDisp > 0 && isFullyDelivered) {
      inTransitSubtitle = "Transit Completed";
    }

    // 8. Delivered
    let deliveredSubtitle = "POD Verified & Closed";
    if (isFullyDelivered) {
      deliveredSubtitle = `All ${totalDisp} Delivered${delDateStr ? ` (${delDateStr})` : ""}`;
    } else if (delCount > 0) {
      deliveredSubtitle = `${delCount}/${totalDisp} Delivered (POD Verified)`;
    } else if (targetDateStr) {
      deliveredSubtitle = `Est: ${targetDateStr}`;
    }

    return [
      {
        key: "ORDER_CONFIRMED",
        label: "Confirmed",
        desc: confirmedSubtitle,
        date: orderDateStr,
        icon: FileText,
      },
      {
        key: "PLANT_APPROVED",
        label: "Plant Planned",
        desc: plantSubtitle,
        date: woDateStr || orderDateStr,
        icon: Factory,
      },
      {
        key: "PRODUCTION_STARTED",
        label: "Production",
        desc: prodSubtitle,
        date: woDateStr,
        icon: Layers,
      },
      {
        key: "QC_PENDING",
        label: "QC Inspect",
        desc: qcInspectSubtitle,
        date: woDateStr,
        icon: AlertCircle,
      },
      {
        key: "QC_APPROVED",
        label: "QC Passed",
        desc: qcPassedSubtitle,
        date: woDateStr,
        icon: BadgeCheck,
      },
      {
        key: "READY_FOR_DISPATCH",
        label: "Ready Dispatch",
        desc: readyDispatchSubtitle,
        date: fmt(dispatches[0]?.dispatchedAt) || woDateStr,
        icon: Package,
      },
      {
        key: "IN_TRANSIT",
        label: "In Transit",
        desc: inTransitSubtitle,
        date: fmt(inTransitDispatches[0]?.dispatchedAt || dispatches[0]?.dispatchedAt),
        icon: Truck,
        driver: driver,
        vehicle: vehicle,
      },
      {
        key: "DELIVERED",
        label: "Delivered",
        desc: deliveredSubtitle,
        date: delDateStr,
        icon: CheckCircle2,
        isPartial: isPartiallyDelivered,
        partialCount: delCount,
        totalCount: totalDisp,
      },
    ];
  }, [
    order,
    workOrders,
    dispatches,
    inTransitDispatches,
    deliveredDispatches,
    isPartiallyDelivered,
    isFullyDelivered,
  ]);

  if (isLoading) {
    return (
      <div style={{ padding: 60, textAlign: "center", minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#0284c7", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
        <div style={{ fontSize: 16, fontWeight: 800, color: "#002e5d", marginBottom: 6 }}>Loading Order Details</div>
        <div style={{ fontSize: 13, color: "#64748b" }}>Fetching live record for #{decodedOrderId}...</div>
      </div>
    );
  }

  if (!order || errorMsg) {
    return (
      <div style={{ padding: 48, textAlign: "center", maxWidth: 520, margin: "40px auto", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, boxShadow: "0 4px 14px rgba(0,0,0,0.05)" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
          <AlertCircle size={28} color="#dc2626" />
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#002e5d", marginBottom: 8 }}>Order Not Found</div>
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
          Could not locate any Sales Order matching <strong>#{decodedOrderId}</strong>. It may have been entered under a different identifier or is awaiting synchronization.
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={() => router.push("/sales/orders")}
            style={{ background: "#0284c7", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const customer = order.customer;
  const customerName = customer?.companyName || customer?.name || order.customerName || "—";
  const customerCode = customer?.customerCode || customer?.code || order.customerCode || "";
  
  const deliveryAddr =
    formatAddressValue(order.shippingAddress) ||
    formatAddressValue(customer?.shippingAddress) ||
    formatAddressValue(order.deliveryAddress) ||
    formatAddressValue(dispatches.find((d: any) => d.deliveryAddress || d.shippingAddress)?.deliveryAddress || dispatches.find((d: any) => d.deliveryAddress || d.shippingAddress)?.shippingAddress) ||
    formatAddressValue(order.quotation?.siteAddress) ||
    formatAddressValue(order.sourceQuotation?.siteAddress) ||
    formatAddressValue(order.quotation?.lead?.siteAddress) ||
    formatAddressValue(order.lead?.siteAddress) ||
    formatAddressValue(customer?.address) ||
    formatAddressValue(customer?.billingAddress) ||
    "Factory Staging Area / Site Delivery";

  const billingAddr =
    formatAddressValue(order.billingAddress) ||
    formatAddressValue(customer?.billingAddress) ||
    deliveryAddr;

  const totalAmount = Number(order.totalAmount || order.grandTotal || 0);
  const subtotalAmount = Number(order.subtotal || order.taxableAmount || (totalAmount > 0 ? Math.round(totalAmount / 1.18) : 0));
  const taxAmount = Number(order.taxAmount || (totalAmount - subtotalAmount > 0 ? (totalAmount - subtotalAmount) : 0));
  const paidAmount = Number(order.verifiedPaidAmount || order.paidAmount || 0);
  const balanceAmount = Math.max(0, totalAmount - paidAmount);
  const paymentStatusLabel = order.paymentStatus
    ? String(order.paymentStatus).replace(/_/g, " ")
    : (paidAmount >= totalAmount && totalAmount > 0 ? "Fully Paid" : (paidAmount > 0 ? "Partially Paid" : "Payment Pending"));
  
  const items = Array.isArray(order.items) ? order.items : [];

  const fmtDate = (d: any) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const resolvePodUrl = (url: string) => {
    if (!url) return "";
    return getBackendAssetUrl(url);
  };

  const quotationNo = order.quotationNumber || order.quotationNo || order.quotation?.quotationNumber || "—";
  const leadNo = order.leadNumber || order.leadNo || order.quotation?.lead?.leadNumber || "—";
  const invoiceNo = (dispatches || []).find((d: any) => d?.invoiceNumber)?.invoiceNumber || order.invoiceNumber || order.invoiceNo || "—";

  return (
    <div style={{ padding: "16px 20px 40px", maxWidth: 1240, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* ── Top Header Navigation Bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#ffffff",
              border: "1.5px solid #e2e8f0",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
              color: "#002e5d",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              transition: "background 0.2s",
            }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#002e5d", letterSpacing: "-0.02em", fontFamily: "monospace" }}>
                #{order.orderNumber || order.id}
              </h1>
              <StatusBadge status={accurateStatusLabel} />
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
              Customer: <strong style={{ color: "#002e5d" }}>{customerName}</strong>
              {customerCode && <span style={{ marginLeft: 6, fontFamily: "monospace", color: "#64748b", fontSize: 11 }}>({customerCode})</span>}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {quotationNo !== "—" && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#15803d" }}>
              QT Ref: <span style={{ fontFamily: "monospace" }}>{quotationNo}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => fetchOrderDetails()}
            disabled={isRefreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#ffffff",
              border: "1.5px solid #e2e8f0",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 12.5,
              fontWeight: 700,
              color: "#002e5d",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Live Order Progression Stepper ── */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px 22px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#002e5d", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={15} color="#0284c7" /> Live Order Progression Lifecycle
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b" }}>
              Current Stage:
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: isPartiallyDelivered ? "#eff6ff" : (currentStageIdx === 7 ? "#f0fdf4" : "#eff6ff"),
                color: isPartiallyDelivered ? "#1d4ed8" : (currentStageIdx === 7 ? "#15803d" : "#0284c7"),
                border: `1px solid ${isPartiallyDelivered ? "#bfdbfe" : (currentStageIdx === 7 ? "#bbf7d0" : "#bfdbfe")}`,
                borderRadius: 6,
                padding: "3px 9px",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {isPartiallyDelivered ? (
                <>
                  <Truck size={13} />
                  <span>In Transit ({deliveredDispatches.length}/{dispatches.length} Delivered)</span>
                </>
              ) : (
                <span>{accurateStatusLabel}</span>
              )}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", overflowX: "auto", paddingBottom: 10 }}>
          {dynamicStages.map((stage: any, idx: number) => {
            const isDone = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            const isPartial = Boolean(stage.isPartial);
            const Icon = stage.icon;

            const circleBg = isCurrent
              ? "#0284c7"
              : isDone
                ? "#dcfce7"
                : isPartial
                  ? "#f0fdf4"
                  : "#f8fafc";

            const circleBorder = isCurrent
              ? "#0369a1"
              : isDone
                ? "#86efac"
                : isPartial
                  ? "#16a34a"
                  : "#cbd5e1";

            const iconColor = isCurrent
              ? "#ffffff"
              : isDone
                ? "#16a34a"
                : isPartial
                  ? "#16a34a"
                  : "#94a3b8";

            return (
              <React.Fragment key={stage.key}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, minWidth: 96, maxWidth: 115 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: circleBg,
                      border: `2px ${isPartial ? "dashed" : "solid"} ${circleBorder}`,
                      boxShadow: isCurrent ? "0 0 0 4px rgba(2,132,199,0.2)" : "none",
                      transition: "all 0.3s ease",
                      position: "relative",
                    }}
                  >
                    <Icon size={17} color={iconColor} />
                    {isDone && !isCurrent && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: -2,
                          right: -2,
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: "#16a34a",
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: 900,
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: isCurrent ? 850 : isDone || isPartial ? 750 : 600,
                      color: isCurrent ? "#0284c7" : isDone || isPartial ? "#0f172a" : "#94a3b8",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {stage.label}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: isCurrent ? "#0369a1" : isDone || isPartial ? "#475569" : "#94a3b8",
                      fontWeight: isCurrent || isPartial ? 700 : 500,
                      textAlign: "center",
                      lineHeight: 1.25,
                      wordBreak: "break-word",
                    }}
                  >
                    {stage.desc}
                  </span>
                  {isPartial && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        background: "#dcfce7",
                        color: "#166534",
                        border: "1px solid #86efac",
                        borderRadius: 4,
                        padding: "1px 5px",
                        marginTop: 1,
                      }}
                    >
                      {stage.partialCount}/{stage.totalCount} Delivered
                    </span>
                  )}
                </div>
                {idx < dynamicStages.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 3,
                      background:
                        idx < currentStageIdx
                          ? "#22c55e"
                          : idx === 6 && isPartiallyDelivered
                            ? "linear-gradient(to right, #0284c7, #22c55e)"
                            : "#e2e8f0",
                      minWidth: 16,
                      marginTop: 18,
                      borderRadius: 2,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Dynamic Live Shipment & Production Telemetry Banner ── */}
        {(inTransitDispatches.length > 0 || deliveredDispatches.length > 0 || workOrders.length > 0) && (
          <div
            style={{
              marginTop: 14,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 9,
            }}
          >
            {/* Active In-Transit Telemetry */}
            {inTransitDispatches.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#002e5d" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0284c7", boxShadow: "0 0 0 3px rgba(2,132,199,0.25)" }} />
                  <span>
                    <strong>{inTransitDispatches.length} Dispatch Run{inTransitDispatches.length > 1 ? "s" : ""} Active In Transit</strong>
                    {inTransitDispatches[0]?.driverName && (
                      <span> &bull; Driver: <strong>{inTransitDispatches[0].driverName}</strong></span>
                    )}
                    {inTransitDispatches[0]?.vehicleNumber && (
                      <span> &bull; Vehicle: <strong style={{ fontFamily: "monospace" }}>{inTransitDispatches[0].vehicleNumber}</strong></span>
                    )}
                  </span>
                </div>
                <span style={{ fontSize: 11.5, color: "#64748b" }}>
                  Dispatched: {inTransitDispatches[0]?.dispatchedAt ? new Date(inTransitDispatches[0].dispatchedAt).toLocaleString("en-IN") : "En Route"}
                </span>
              </div>
            )}

            {/* Delivered Run Telemetry & One-Click POD */}
            {deliveredDispatches.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                  paddingTop: inTransitDispatches.length > 0 ? 8 : 0,
                  borderTop: inTransitDispatches.length > 0 ? "1px dashed #e2e8f0" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#166534" }}>
                  <CheckCircle2 size={15} color="#16a34a" />
                  <span>
                    <strong>{deliveredDispatches.length} Run{deliveredDispatches.length > 1 ? "s" : ""} Delivered &amp; Verified</strong>
                    {deliveredDispatches[0]?.deliveredAt && (
                      <span> on {new Date(deliveredDispatches[0].deliveredAt).toLocaleString("en-IN")}</span>
                    )}
                    {deliveredDispatches[0]?.receivedBy && (
                      <span> &bull; Receiver: <strong>{deliveredDispatches[0].receivedBy}</strong></span>
                    )}
                  </span>
                </div>
                {deliveredDispatches[0]?.podUrl && (
                  <button
                    type="button"
                    onClick={() => setSelectedPodImage(resolvePodUrl(deliveredDispatches[0].podUrl))}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "4px 10px",
                      background: "#ffffff",
                      border: "1px solid #86efac",
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 750,
                      color: "#166534",
                      cursor: "pointer",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    }}
                  >
                    <ImageIcon size={13} />
                    <span>View Verified POD</span>
                  </button>
                )}
              </div>
            )}

            {/* Shop Floor Production Telemetry */}
            {workOrders.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                  paddingTop: (inTransitDispatches.length > 0 || deliveredDispatches.length > 0) ? 8 : 0,
                  borderTop: (inTransitDispatches.length > 0 || deliveredDispatches.length > 0) ? "1px dashed #e2e8f0" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#475569" }}>
                  <Factory size={14} color="#0284c7" />
                  <span>
                    Shop Floor: <strong>{workOrders.filter((w: any) => ['COMPLETED', 'DISPATCHED'].includes(String(w.status || '').toUpperCase())).length}/{workOrders.length} Work Orders Dispatched/Completed</strong>
                    {workOrders[0]?.completedAt && (
                      <span> &bull; Finished: <strong>{new Date(workOrders[0].completedAt).toLocaleDateString("en-IN")}</strong></span>
                    )}
                  </span>
                </div>
                <span style={{ fontSize: 11, background: "#ecfdf5", color: "#166534", border: "1px solid #bbf7d0", padding: "2px 7px", borderRadius: 4, fontWeight: 700 }}>
                  100% Quality Cleared
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Key Overview Cards Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18, marginBottom: 20 }}>
        {/* Customer & Commercial Details */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#002e5d", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Building2 size={16} color="#0284c7" /> Customer &amp; Billing Information
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <InfoCard icon={User} label="Customer Name" value={customerName} highlight subtext={customerCode ? `Code: ${customerCode}` : undefined} />
            <InfoCard icon={Hash} label="Sales Order No" value={order.orderNumber || order.id} />
            <InfoCard icon={DollarSign} label="Grand Total" value={totalAmount ? `₹${totalAmount.toLocaleString("en-IN")}` : "—"} highlight subtext={`Base: ₹${subtotalAmount.toLocaleString("en-IN")}`} />
            <InfoCard icon={Calendar} label="Order Date" value={fmtDate(order.orderDate || order.createdAt)} />
            <InfoCard icon={Calendar} label="Target Delivery" value={fmtDate(order.targetDate || order.requestedDeliveryDate || order.expectedDeliveryDate)} highlight />
            <InfoCard icon={CreditCard} label="Payment Status" value={paymentStatusLabel} highlight={paymentStatusLabel === "Fully Paid"} subtext={paidAmount > 0 ? `Paid: ₹${paidAmount.toLocaleString("en-IN")}` : `Balance: ₹${balanceAmount.toLocaleString("en-IN")}`} />
            <InfoCard icon={FileText} label="GST Number" value={customer?.taxId || customer?.gstin || customer?.gstNumber || customer?.gst || order.gstNumber || order.gstin || order.quotation?.gstin || order.sourceQuotation?.gstin || "—"} />
          </div>
        </div>

        {/* Delivery & Logistics Site */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#002e5d", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={16} color="#0284c7" /> Delivery Destination &amp; Logistics
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ gridColumn: "span 2" }}>
              <InfoCard icon={MapPin} label="Delivery Site Address" value={deliveryAddr} />
            </div>
            <InfoCard
              icon={Layers}
              label="Order Status"
              value={accurateStatusLabel}
              highlight
              subtext={isPartiallyDelivered ? `${inTransitDispatches.length} on Route • ${deliveredDispatches.length} Delivered` : undefined}
            />
            <InfoCard
              icon={Truck}
              label="Dispatches Count"
              value={`${dispatches.length} Dispatch Run(s)`}
              highlight
              subtext={dispatches.length > 0 ? (isPartiallyDelivered ? `${inTransitDispatches.length} In Transit, ${deliveredDispatches.length} Delivered` : (isFullyDelivered ? "All Delivered" : "Active Dispatches")) : undefined}
            />
            <InfoCard
              icon={ShieldCheck}
              label="Work Orders"
              value={`${workOrders.length} ${workOrders.length > 0 && workOrders.every((w: any) => ['COMPLETED', 'DISPATCHED'].includes(String(w.status || '').toUpperCase())) ? "Dispatched" : "Active"}`}
              subtext={workOrders.length > 0 ? `${workOrders.filter((w: any) => ['COMPLETED', 'DISPATCHED'].includes(String(w.status || '').toUpperCase())).length}/${workOrders.length} Completed` : undefined}
            />
            <InfoCard
              icon={Phone}
              label="Contact Phone"
              value={customer?.phone || customer?.mobile || customer?.contactNumber || customer?.contactPersonPhone || order.customerPhone || order.quotation?.siteInchargeMobile || order.sourceQuotation?.siteInchargeMobile || order.quotation?.lead?.phone || order.lead?.phone || dispatches.find((d: any) => d.receiverPhone)?.receiverPhone || "—"}
            />
          </div>
        </div>
      </div>

      {/* ── Order Remarks Card ── */}
      {(order.remarks || order.acceptanceRemarks || order.plantHeadRemarks) && (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px 20px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ fontWeight: 800, fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={15} color="#0284c7" /> Order &amp; Plant Head Remarks
          </div>
          <div style={{ fontSize: 13.5, color: "#002e5d", fontWeight: 600, fontStyle: "italic", lineHeight: 1.5, background: "#f8fafc", padding: "12px 16px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            &ldquo;{order.remarks || order.acceptanceRemarks || order.plantHeadRemarks}&rdquo;
          </div>
        </div>
      )}

      {/* ── Ordered Items Table & Mobile List ── */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px 20px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#002e5d", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Package size={16} color="#0284c7" /> Line Items ({items.length})
          </div>
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
            Total Value: <strong style={{ color: "#16a34a" }}>₹{totalAmount.toLocaleString("en-IN")}</strong>
          </span>
        </div>

        {/* Desktop Table View (>= 768px) */}
        <div className="hidden md:block" style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#002e5d", color: "#ffffff" }}>
                <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700 }}>#</th>
                <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700 }}>Product Name</th>
                <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700, textAlign: "center" }}>Ordered Qty</th>
                <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700, textAlign: "right" }}>Unit Price</th>
                <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700, textAlign: "right" }}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                    No line items recorded for this order.
                  </td>
                </tr>
              ) : (
                items.map((item: any, i: number) => {
                  const pName = item.productName || item.productNameSnapshot || item.product?.name || item.name || "Standard Product";
                  const pSku = item.productCode || item.productCodeSnapshot || item.product?.sku || "";
                  const qty = Number(item.orderedQuantity ?? item.quantity ?? 1);
                  const unit = item.unit || "SET";
                  const price = Number(item.unitPrice || 0);
                  const itemTotal = Number(item.lineTotal || (item.taxableAmount ? (Number(item.taxableAmount) + Number(item.taxAmount || 0)) : (qty * price)) || 0);

                  const rawSpecs = item.specifications || item.productDetails || item.description || null;
                  let specsText = "";
                  if (typeof rawSpecs === "string") {
                    specsText = rawSpecs.trim();
                  } else if (rawSpecs && typeof rawSpecs === "object") {
                    specsText = String(rawSpecs.description || rawSpecs.productDetails || rawSpecs.specifications || "").trim();
                  }
                  const size = item.size || (typeof rawSpecs === "object" && rawSpecs?.size ? String(rawSpecs.size).trim() : null);
                  const capacity = item.capacity || (typeof rawSpecs === "object" && rawSpecs?.capacity ? String(rawSpecs.capacity).trim() : null);
                  const sizeCap = [size, capacity].filter(Boolean).join(" ");

                  return (
                    <tr key={item.id || i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700 }}>{i + 1}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 750, color: "#002e5d" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span>{pName}</span>
                          {sizeCap && (
                            <span style={{ fontSize: 11, fontWeight: 750, padding: "2px 7px", borderRadius: 6, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
                              {sizeCap}
                            </span>
                          )}
                        </div>
                        {specsText && <div style={{ fontSize: 11.5, color: "#475569", fontWeight: 500, marginTop: 3 }}>{specsText}</div>}
                        {pSku && <span style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b" }}>SKU: {pSku}</span>}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 800, color: "#0f172a" }}>
                        {qty} {unit}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", color: "#475569", fontWeight: 700 }}>
                        {price ? `₹${price.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 850, color: "#16a34a" }}>
                        {itemTotal ? `₹${itemTotal.toLocaleString("en-IN")}` : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {items.length > 0 && (
              <tfoot>
                <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
                  <td colSpan={3} style={{ padding: "10px 14px", fontWeight: 700, color: "#475569" }}>
                    Subtotal (Base Value):
                  </td>
                  <td colSpan={2} style={{ padding: "10px 14px", textAlign: "right", fontWeight: 800, color: "#002e5d" }}>
                    ₹{subtotalAmount.toLocaleString("en-IN")}
                  </td>
                </tr>
                {taxAmount > 0 && (
                  <tr style={{ background: "#f8fafc" }}>
                    <td colSpan={3} style={{ padding: "8px 14px", fontWeight: 600, color: "#64748b" }}>
                      Applicable Taxes (18% GST):
                    </td>
                    <td colSpan={2} style={{ padding: "8px 14px", textAlign: "right", fontWeight: 700, color: "#64748b" }}>
                      +₹{taxAmount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
                <tr style={{ background: "#f0fdf4", borderTop: "1px solid #bbf7d0" }}>
                  <td colSpan={3} style={{ padding: "12px 14px", fontWeight: 850, color: "#15803d", fontSize: 14 }}>
                    Grand Total:
                  </td>
                  <td colSpan={2} style={{ padding: "12px 14px", textAlign: "right", fontWeight: 900, color: "#15803d", fontSize: 16 }}>
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Mobile List View (< 768px) */}
        <div className="block md:hidden" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#64748b", background: "#f8fafc", borderRadius: 8 }}>
              No line items recorded for this order.
            </div>
          ) : (
            items.map((item: any, i: number) => {
              const pName = item.productName || item.productNameSnapshot || item.product?.name || item.name || "Standard Product";
              const pSku = item.productCode || item.productCodeSnapshot || item.product?.sku || "";
              const qty = Number(item.orderedQuantity ?? item.quantity ?? 1);
              const unit = item.unit || "SET";
              const price = Number(item.unitPrice || 0);
              const itemTotal = Number(item.lineTotal || (item.taxableAmount ? (Number(item.taxableAmount) + Number(item.taxAmount || 0)) : (qty * price)) || 0);

              const rawSpecs = item.specifications || item.productDetails || item.description || null;
              let specsText = "";
              if (typeof rawSpecs === "string") {
                specsText = rawSpecs.trim();
              } else if (rawSpecs && typeof rawSpecs === "object") {
                specsText = String(rawSpecs.description || rawSpecs.productDetails || rawSpecs.specifications || "").trim();
              }
              const size = item.size || (typeof rawSpecs === "object" && rawSpecs?.size ? String(rawSpecs.size).trim() : null);
              const capacity = item.capacity || (typeof rawSpecs === "object" && rawSpecs?.capacity ? String(rawSpecs.capacity).trim() : null);
              const sizeCap = [size, capacity].filter(Boolean).join(" ");

              return (
                <div
                  key={item.id || i}
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 10,
                    padding: "13px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#002e5d",
                        color: "#ffffff",
                        fontSize: 11,
                        fontWeight: 800,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      {i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: "#002e5d", fontSize: 13.5, lineHeight: 1.35 }}>
                        {pName}
                      </div>
                      {sizeCap && (
                        <div style={{ marginTop: 3 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 750, padding: "2px 6px", borderRadius: 4, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
                            {sizeCap}
                          </span>
                        </div>
                      )}
                      {specsText && (
                        <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{specsText}</div>
                      )}
                      {pSku && (
                        <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", marginTop: 2 }}>
                          SKU: <strong style={{ color: "#0284c7" }}>{pSku}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 6,
                      padding: "10px 12px",
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 750, color: "#64748b", textTransform: "uppercase" }}>Ordered Qty</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                        {qty} {unit}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 750, color: "#64748b", textTransform: "uppercase" }}>Unit Price</div>
                      <div style={{ fontSize: 12.5, fontWeight: 750, color: "#475569", marginTop: 2 }}>
                        {price ? `₹${price.toLocaleString("en-IN")}` : "—"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 750, color: "#64748b", textTransform: "uppercase" }}>Total Amount</div>
                      <div style={{ fontSize: 13, fontWeight: 850, color: "#16a34a", marginTop: 2 }}>
                        {itemTotal ? `₹${itemTotal.toLocaleString("en-IN")}` : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Mobile Financial Breakdown Card */}
          {items.length > 0 && (
            <div
              style={{
                background: "#f8fafc",
                border: "1.5px solid #cbd5e1",
                borderRadius: 10,
                padding: "12px 14px",
                marginTop: 4,
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#475569" }}>
                <span>Subtotal (Base Value):</span>
                <strong style={{ color: "#002e5d" }}>₹{subtotalAmount.toLocaleString("en-IN")}</strong>
              </div>
              {taxAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}>
                  <span>Applicable Taxes (18% GST):</span>
                  <strong style={{ color: "#64748b" }}>+₹{taxAmount.toLocaleString("en-IN")}</strong>
                </div>
              )}
              <div style={{ height: 1, background: "#cbd5e1", margin: "2px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5, fontWeight: 900, color: "#15803d" }}>
                <span>Grand Total:</span>
                <span>₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Production & Work Orders Execution Card ── */}
      {workOrders.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px 20px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#002e5d", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Factory size={16} color="#0284c7" /> Production &amp; Work Orders ({workOrders.length})
          </div>

          {/* Desktop Table (>= 768px) */}
          <div className="hidden md:block" style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#002e5d", color: "#ffffff" }}>
                  <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700 }}>Work Order #</th>
                  <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700, textAlign: "center" }}>Planned Qty</th>
                  <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700, textAlign: "center" }}>Completed Qty</th>
                  <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700, textAlign: "right" }}>Timeline</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((wo: any, idx: number) => (
                  <tr key={wo.id || idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 800, fontFamily: "monospace", color: "#0284c7" }}>
                      {wo.workOrderNumber || wo.woNumber || `WO-${idx + 1}`}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <WorkOrderStatusPill status={wo.productionStatus || wo.status || "IN_PRODUCTION"} />
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, color: "#0f172a" }}>
                      {wo.plannedQuantity || wo.quantity || "—"}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 800, color: "#16a34a" }}>
                      {wo.completedQuantity ?? wo.producedQuantity ?? (['COMPLETED', 'DISPATCHED'].includes(String(wo.status || '').toUpperCase()) ? (wo.plannedQuantity || wo.quantity) : "—")}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", color: "#64748b", fontSize: 12 }}>
                      {wo.completedAt ? new Date(wo.completedAt).toLocaleDateString("en-IN") : (wo.startedAt ? new Date(wo.startedAt).toLocaleDateString("en-IN") : (wo.startDate ? new Date(wo.startDate).toLocaleDateString("en-IN") : (wo.createdAt ? new Date(wo.createdAt).toLocaleDateString("en-IN") : "—")))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (< 768px) */}
          <div className="block md:hidden" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {workOrders.map((wo: any, idx: number) => (
              <div
                key={wo.id || idx}
                style={{
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "13px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 800, fontFamily: "monospace", fontSize: 13.5, color: "#0284c7" }}>
                    {wo.workOrderNumber || wo.woNumber || `WO-${idx + 1}`}
                  </div>
                  <WorkOrderStatusPill status={wo.productionStatus || wo.status || "IN_PRODUCTION"} />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 6,
                    padding: "10px 12px",
                    background: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 750, color: "#64748b", textTransform: "uppercase" }}>Planned Qty</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                      {wo.plannedQuantity || wo.quantity || "—"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 750, color: "#64748b", textTransform: "uppercase" }}>Completed Qty</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#16a34a", marginTop: 2 }}>
                      {wo.completedQuantity ?? wo.producedQuantity ?? (['COMPLETED', 'DISPATCHED'].includes(String(wo.status || '').toUpperCase()) ? (wo.plannedQuantity || wo.quantity) : "—")}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 750, color: "#64748b", textTransform: "uppercase" }}>Timeline</div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: "#64748b", marginTop: 2 }}>
                      {wo.completedAt ? new Date(wo.completedAt).toLocaleDateString("en-IN") : (wo.startedAt ? new Date(wo.startedAt).toLocaleDateString("en-IN") : (wo.startDate ? new Date(wo.startDate).toLocaleDateString("en-IN") : (wo.createdAt ? new Date(wo.createdAt).toLocaleDateString("en-IN") : "—")))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Dispatch History & Delivery Proof Section ── */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px 20px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#002e5d", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Truck size={16} color="#0284c7" /> Dispatch Runs &amp; Proof of Delivery ({dispatches.length})
          </div>
          {invoiceNo !== "—" && (
            <div style={{ fontSize: 12, color: "#002e5d", fontWeight: 700, background: "#f1f5f9", padding: "4px 10px", borderRadius: 6 }}>
              Invoice: <strong style={{ fontFamily: "monospace", color: "#0284c7" }}>{invoiceNo}</strong>
            </div>
          )}
        </div>

        {dispatches.length > 0 ? (
          <>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block" style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#002e5d", color: "#ffffff" }}>
                    <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700 }}>Dispatch No</th>
                    <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700 }}>Invoice Ref</th>
                    <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700 }}>Driver / Vehicle</th>
                    <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700 }}>Receiver Info</th>
                    <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700 }}>Dispatched At</th>
                    <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700 }}>Delivered At</th>
                    <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700, textAlign: "center" }}>POD Proof</th>
                    <th style={{ padding: "10px 14px", fontSize: 11.5, fontWeight: 700, textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatches.map((disp: any) => (
                    <tr key={disp.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#0284c7", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "3px 8px", borderRadius: 6 }}>
                          #{disp.dispatchNo || disp.dispatchNumber || disp.id?.slice(0, 8)}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: "monospace", fontWeight: 700, color: "#002e5d" }}>
                        {disp.invoiceNumber || invoiceNo}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 750, color: "#002e5d" }}>{disp.driverName || "Driver Assigned"}</div>
                        {disp.vehicleNumber && (
                          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b" }}>Vehicle: {disp.vehicleNumber}</div>
                        )}
                        {disp.driverPhone && (
                          <div style={{ fontSize: 11, color: "#0284c7" }}>📞 {disp.driverPhone}</div>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 750, color: "#002e5d" }}>{disp.receivedBy || customerName}</div>
                        {disp.receiverPhone && (
                          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#16a34a", fontWeight: 700 }}>+91 {disp.receiverPhone}</div>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#475569", fontSize: 12 }}>
                        {disp.dispatchedAt ? new Date(disp.dispatchedAt).toLocaleString("en-IN") : "—"}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#475569", fontSize: 12 }}>
                        {disp.deliveredAt ? new Date(disp.deliveredAt).toLocaleString("en-IN") : "—"}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        {disp.podUrl ? (
                          <button
                            type="button"
                            onClick={() => setSelectedPodImage(resolvePodUrl(disp.podUrl))}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "5px 10px",
                              borderRadius: 6,
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              color: "#166534",
                              fontSize: 11,
                              fontWeight: 750,
                              cursor: "pointer",
                            }}
                          >
                            <ImageIcon size={13} />
                            <span>View POD</span>
                          </button>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: 11, fontStyle: "italic" }}>No POD Uploaded</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <StatusPill status={disp.status || "DISPATCHED"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (< 768px) */}
            <div className="block md:hidden" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {dispatches.map((disp: any) => {
                const dispNo = disp.dispatchNo || disp.dispatchNumber || disp.id?.slice(0, 8);
                const invNo = disp.invoiceNumber || invoiceNo;
                const driverName = disp.driverName || "Driver Assigned";
                const vehicleNo = disp.vehicleNumber || "";
                const driverPhone = disp.driverPhone || "";
                const receiverName = disp.receivedBy || customerName;
                const receiverPhone = disp.receiverPhone || "";
                const dispAt = disp.dispatchedAt ? new Date(disp.dispatchedAt).toLocaleString("en-IN") : "—";
                const delAt = disp.deliveredAt ? new Date(disp.deliveredAt).toLocaleString("en-IN") : "—";

                return (
                  <div
                    key={disp.id}
                    style={{
                      background: "#f8fafc",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 12,
                      padding: "14px 15px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {/* Header with dispatch no, invoice, and status */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#0284c7", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "3px 7px", borderRadius: 6, fontSize: 11.5 }}>
                          #{dispNo}
                        </span>
                        {invNo && invNo !== "—" && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", background: "#ffffff", padding: "3px 7px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                            Inv: <strong style={{ color: "#002e5d" }}>{invNo}</strong>
                          </span>
                        )}
                      </div>
                      <StatusPill status={disp.status || "DISPATCHED"} />
                    </div>

                    {/* Driver & Receiver 2-Column Info */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div style={{ background: "#ffffff", padding: "9px 10px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: 10, fontWeight: 750, color: "#64748b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                          <Truck size={11} color="#0284c7" /> Driver / Vehicle
                        </div>
                        <div style={{ fontWeight: 800, color: "#002e5d", fontSize: 12.5, marginTop: 3 }}>{driverName}</div>
                        {vehicleNo && (
                          <div style={{ fontSize: 10.5, fontFamily: "monospace", color: "#64748b", marginTop: 1 }}>
                            {vehicleNo}
                          </div>
                        )}
                        {driverPhone && (
                          <a href={`tel:${driverPhone}`} style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: "#0284c7", fontWeight: 700, textDecoration: "none", marginTop: 2 }}>
                            <Phone size={10} /> {driverPhone}
                          </a>
                        )}
                      </div>

                      <div style={{ background: "#ffffff", padding: "9px 10px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: 10, fontWeight: 750, color: "#64748b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                          <User size={11} color="#16a34a" /> Receiver Info
                        </div>
                        <div style={{ fontWeight: 800, color: "#002e5d", fontSize: 12.5, marginTop: 3 }}>{receiverName}</div>
                        {receiverPhone && (
                          <a href={`tel:${receiverPhone}`} style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: "#16a34a", fontWeight: 700, textDecoration: "none", marginTop: 2, fontFamily: "monospace" }}>
                            <Phone size={10} /> +91 {receiverPhone}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11, color: "#64748b", background: "#ffffff", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div>
                        <span style={{ fontWeight: 700, color: "#475569" }}>Dispatched: </span>
                        <span>{dispAt}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, color: "#475569" }}>Delivered: </span>
                        <span>{delAt}</span>
                      </div>
                    </div>

                    {/* POD Button */}
                    {disp.podUrl ? (
                      <button
                        type="button"
                        onClick={() => setSelectedPodImage(resolvePodUrl(disp.podUrl))}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: 8,
                          background: "#f0fdf4",
                          border: "1.5px solid #86efac",
                          color: "#166534",
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        <ImageIcon size={14} />
                        <span>View Proof of Delivery (POD)</span>
                      </button>
                    ) : (
                      <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 11, fontStyle: "italic", padding: "2px 0" }}>
                        No POD document uploaded for this run
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: "28px 20px", background: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
            <Truck size={32} color="#94a3b8" style={{ margin: "0 auto 8px auto", display: "block" }} />
            <div style={{ fontWeight: 800, color: "#334155", fontSize: 14 }}>No dispatch records generated for this order yet.</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, maxWidth: 440, margin: "4px auto 0 auto" }}>
              Once the order reaches <strong>READY_FOR_DISPATCH</strong> and the logistics team creates a consignment run with driver, vehicle, and invoice, full transit updates will display here.
            </div>
          </div>
        )}
      </div>

      {/* ── POD Image Lightbox Modal ── */}
      {selectedPodImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(4px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setSelectedPodImage(null)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: 720,
              width: "100%",
              background: "#fff",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#002e5d" }}>Proof of Delivery (POD) Document</div>
              <button
                type="button"
                onClick={() => setSelectedPodImage(null)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 28, height: 28, display: "grid", placeItems: "center", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: 16, textAlign: "center", maxHeight: "75vh", overflow: "auto", background: "#f8fafc", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {selectedPodImage.toLowerCase().includes(".pdf") ? (
                <iframe
                  src={selectedPodImage}
                  style={{ width: "100%", height: "65vh", border: "none", borderRadius: 8 }}
                  title="Proof of Delivery Document"
                />
              ) : (
                <img
                  src={selectedPodImage}
                  alt="Proof of Delivery"
                  style={{ maxWidth: "100%", maxHeight: "65vh", objectFit: "contain", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff" }}
                  onError={(e: any) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = "none";
                    const fallback = document.getElementById("order-pod-fallback-view");
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              )}
              <div id="order-pod-fallback-view" style={{ display: "none", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 10, color: "#64748b" }}>
                <FileText size={36} color="#0284c7" />
                <div style={{ fontWeight: 800, color: "#002e5d", fontSize: 14 }}>Proof of Delivery Document</div>
                <div style={{ fontSize: 12, maxWidth: 360, lineHeight: 1.4 }}>
                  This document cannot be rendered inline directly. Please download or open in a new tab to inspect.
                </div>
              </div>
            </div>
            <div style={{ padding: "12px 20px", background: "#ffffff", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>
                Verified Handover Document
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={selectedPodImage}
                  download="proof-of-delivery"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f1f5f9", color: "#002e5d", textDecoration: "none", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 750, border: "1px solid #cbd5e1" }}
                >
                  <Download size={13} /> Download
                </a>
                <a
                  href={selectedPodImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#0284c7", color: "#fff", textDecoration: "none", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 750 }}
                >
                  <ExternalLink size={13} /> Open in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

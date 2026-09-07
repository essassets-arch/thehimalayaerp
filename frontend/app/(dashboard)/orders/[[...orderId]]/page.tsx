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
  OUT_FOR_DELIVERY:   { bg: "#fefce8", color: "#a16207", border: "#fef08a" },
  DELIVERED:          { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  COMPLETED:          { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  CANCELLED:          { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  DRAFT:              { bg: "#f8fafc", color: "#475569", border: "#cbd5e1" },
  DEFAULT:            { bg: "#F5FAFE", color: "#475569", border: "#DCE5F0" },
};

function StatusPill({ status }: { status: string }) {
  const key = (status || "").toUpperCase().replace(/[\s-]+/g, "_");
  const s = statusColors[key] || statusColors.DEFAULT;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 750,
        background: s.bg,
        color: s.color,
        border: `1.5px solid ${s.border}`,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
      {status || "PENDING"}
    </span>
  );
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

const stages = [
  { key: "ORDER_CONFIRMED",    label: "Confirmed",       desc: "Order Verified",          icon: FileText },
  { key: "PLANT_APPROVED",     label: "Plant Planned",   desc: "Accepted & Scheduled",    icon: Factory },
  { key: "PRODUCTION_STARTED", label: "Production",      desc: "Work Orders Active",      icon: Layers },
  { key: "QC_PENDING",         label: "QC Inspect",      desc: "Quality Audit",           icon: AlertCircle },
  { key: "QC_APPROVED",        label: "QC Passed",       desc: "Verified Ready",          icon: BadgeCheck },
  { key: "READY_FOR_DISPATCH", label: "Ready Dispatch",  desc: "Staged for Transit",      icon: Package },
  { key: "IN_TRANSIT",         label: "In Transit",      desc: "On Route with Driver",    icon: Truck },
  { key: "DELIVERED",          label: "Delivered",       desc: "POD Verified & Closed",   icon: CheckCircle2 },
];

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

      // 1. Try dedicated lookup endpoint via apiClient & backendFetch
      let foundOrder: any = null;
      try {
        const res = await apiClient.get(`/sales/orders/lookup/by-number?orderNumber=${encodeURIComponent(decodedOrderId)}`);
        foundOrder = res?.data?.data || res?.data || res;
      } catch {
        // Fallback
      }

      // 2. Direct ID / Slug endpoint
      if (!foundOrder || !foundOrder.id) {
        try {
          const res = await apiClient.get(`/sales/orders/${encodeURIComponent(decodedOrderId)}`);
          foundOrder = res?.data?.data || res?.data || res;
        } catch {
          // Fallback
        }
      }

      // 3. Fallback to list search
      if (!foundOrder || !foundOrder.id) {
        try {
          const res = await apiClient.get("/sales/orders?limit=300");
          const list = Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res?.data)
              ? res.data
              : Array.isArray(res)
                ? res
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

      if (foundOrder && foundOrder.id) {
        setOrder(foundOrder);

        // Fetch related active/past dispatches for this sales order
        try {
          const dispRes = await apiClient.get("/logistics/dispatches?limit=200").catch(() => null);
          const allDispatches = Array.isArray(dispRes?.data?.data)
            ? dispRes.data.data
            : Array.isArray(dispRes?.data)
              ? dispRes.data
              : Array.isArray(dispRes)
                ? dispRes
                : [];
          const matched = allDispatches.filter((d: any) => {
            const sId = d.salesOrderId || d.salesOrder?.id;
            const sNo = d.salesOrder?.orderNumber || d.salesOrderNo;
            return (
              (sId && String(sId) === String(foundOrder.id)) ||
              (sNo && String(sNo).trim().toUpperCase() === String(foundOrder.orderNumber || decodedOrderId).trim().toUpperCase())
            );
          });
          setDispatches(matched.length > 0 ? matched : (foundOrder.dispatches || []));
        } catch {
          setDispatches(foundOrder.dispatches || []);
        }

        // Fetch related work orders
        try {
          const woRes = await apiClient.get("/production/work-orders?limit=200").catch(() => null);
          const allWos = Array.isArray(woRes?.data?.data)
            ? woRes.data.data
            : Array.isArray(woRes?.data)
              ? woRes.data
              : Array.isArray(woRes)
                ? woRes
                : [];
          const matchedWos = allWos.filter((w: any) => {
            const sId = w.productionPlan?.salesOrderId || w.salesOrderId;
            const sNo = w.productionPlan?.salesOrder?.orderNumber || w.salesOrderNumber;
            return (
              (sId && String(sId) === String(foundOrder.id)) ||
              (sNo && String(sNo).trim().toUpperCase() === String(foundOrder.orderNumber || decodedOrderId).trim().toUpperCase())
            );
          });
          setWorkOrders(matchedWos.length > 0 ? matchedWos : (foundOrder.workOrders || foundOrder.productionPlans?.[0]?.workOrders || []));
        } catch {
          setWorkOrders(foundOrder.workOrders || foundOrder.productionPlans?.[0]?.workOrders || []);
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
    formatAddressValue(customer?.billingAddress) ||
    order.deliveryAddress ||
    "Factory Staging Area / Site Delivery";

  const billingAddr =
    formatAddressValue(order.billingAddress) ||
    formatAddressValue(customer?.billingAddress) ||
    deliveryAddr;

  const workflowStatus = order.dispatchStatus || order.status || "ORDER_CONFIRMED";
  const totalAmount = Number(order.totalAmount || order.grandTotal || 0);
  const subtotalAmount = Number(order.subtotal || order.taxableAmount || (totalAmount > 0 ? Math.round(totalAmount / 1.18) : 0));
  const taxAmount = Number(order.taxAmount || (totalAmount - subtotalAmount > 0 ? (totalAmount - subtotalAmount) : 0));
  
  const items = Array.isArray(order.items) ? order.items : [];

  const fmtDate = (d: any) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const currentStageIdx = (() => {
    const norm = String(workflowStatus).toUpperCase().replace(/[\s-]+/g, "_");
    if (norm === "DELIVERED" || norm === "POD_RECEIVED" || norm === "COMPLETED") return 7;
    if (norm === "OUT_FOR_DELIVERY") return 6;
    if (norm === "IN_TRANSIT" || norm === "DISPATCHED") return 6;
    if (norm === "READY_FOR_DISPATCH" || norm === "DISPATCH_CREATED") return 5;
    if (norm === "QC_APPROVED" || norm === "QC_PASSED") return 4;
    if (norm === "QC_PENDING") return 3;
    if (norm === "IN_PRODUCTION" || norm === "PRODUCTION_STARTED" || norm === "STARTED") return 2;
    if (norm === "PLANT_APPROVED" || norm === "READY_FOR_PRODUCTION" || norm === "SENT_TO_PLANT_HEAD" || norm === "SENT_TO_PLANT") return 1;
    return 0;
  })();

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
              <StatusPill status={workflowStatus} />
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#002e5d", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={15} color="#0284c7" /> Live Order Progression Lifecycle
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b" }}>
            Current Stage: <strong style={{ color: "#0284c7" }}>{stages[currentStageIdx]?.label || workflowStatus}</strong>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", overflowX: "auto", paddingBottom: 8 }}>
          {stages.map((stage, idx) => {
            const isDone = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            const Icon = stage.icon;
            return (
              <React.Fragment key={stage.key}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 84 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: isCurrent ? "#0284c7" : isDone ? "#dcfce7" : "#f8fafc",
                      border: `2px solid ${isCurrent ? "#0369a1" : isDone ? "#86efac" : "#cbd5e1"}`,
                      boxShadow: isCurrent ? "0 0 0 4px rgba(2,132,199,0.2)" : "none",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Icon size={16} color={isCurrent ? "#ffffff" : isDone ? "#16a34a" : "#94a3b8"} />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: isCurrent ? 850 : isDone ? 750 : 600,
                      color: isCurrent ? "#0284c7" : isDone ? "#0f172a" : "#94a3b8",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {stage.label}
                  </span>
                  <span style={{ fontSize: 9.5, color: "#94a3b8", textAlign: "center", whiteSpace: "nowrap" }}>
                    {stage.desc}
                  </span>
                </div>
                {idx < stages.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 3,
                      background: idx < currentStageIdx ? "#22c55e" : "#e2e8f0",
                      minWidth: 16,
                      marginBottom: 32,
                      borderRadius: 2,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
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
            <InfoCard icon={FileText} label="GST Number" value={customer?.taxId || customer?.gstin || order.gstNumber || "—"} />
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
            <InfoCard icon={Layers} label="Order Status" value={workflowStatus} />
            <InfoCard icon={Truck} label="Dispatches Count" value={`${dispatches.length} Dispatch Run(s)`} highlight />
            <InfoCard icon={ShieldCheck} label="Work Orders" value={`${workOrders.length} Active`} />
            <InfoCard icon={Phone} label="Contact Phone" value={customer?.phone || customer?.mobile || "—"} />
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

      {/* ── Ordered Items Table ── */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#002e5d", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Package size={16} color="#0284c7" /> Line Items ({items.length})
          </div>
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
            Total Value: <strong style={{ color: "#16a34a" }}>₹{totalAmount.toLocaleString("en-IN")}</strong>
          </span>
        </div>

        <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 8 }}>
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
                  const taxable = Number(item.taxableAmount || (qty * price) || 0);

                  return (
                    <tr key={item.id || i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 700 }}>{i + 1}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 750, color: "#002e5d" }}>
                        <div>{pName}</div>
                        {pSku && <span style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b" }}>SKU: {pSku}</span>}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 800, color: "#0f172a" }}>
                        {qty} {unit}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", color: "#475569", fontWeight: 700 }}>
                        {price ? `₹${price.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 850, color: "#16a34a" }}>
                        {taxable ? `₹${taxable.toLocaleString("en-IN")}` : "—"}
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
      </div>

      {/* ── Production & Work Orders Execution Card ── */}
      {workOrders.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#002e5d", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Factory size={16} color="#0284c7" /> Production &amp; Work Orders ({workOrders.length})
          </div>
          <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 8 }}>
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
                      <StatusPill status={wo.status || "IN_PRODUCTION"} />
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, color: "#0f172a" }}>
                      {wo.plannedQuantity || wo.quantity || "—"}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 800, color: "#16a34a" }}>
                      {wo.completedQuantity ?? wo.producedQuantity ?? "—"}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", color: "#64748b", fontSize: 12 }}>
                      {wo.startDate ? new Date(wo.startDate).toLocaleDateString("en-IN") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Dispatch History & Delivery Proof Section ── */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#002e5d", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
          <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 8 }}>
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

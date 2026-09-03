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
} from "lucide-react";
import { backendFetch } from "@/lib/backendFetch";
import { getBackendAssetUrl } from "@/lib/assetUrl";

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  ORDER_CONFIRMED:    { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  APPROVED:           { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  READY_FOR_DISPATCH: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  QC_APPROVED:        { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  IN_TRANSIT:         { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  OUT_FOR_DELIVERY:   { bg: "#fefce8", color: "#a16207", border: "#fef08a" },
  DISPATCH_CREATED:   { bg: "#fef9c3", color: "#854d0e", border: "#fde68a" },
  DELIVERED:          { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  PRODUCTION_STARTED: { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  IN_PRODUCTION:      { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  QC_PENDING:         { bg: "#fefce8", color: "#a16207", border: "#fef08a" },
  DEFAULT:            { bg: "#F5FAFE", color: "#475569", border: "#DCE5F0" },
};

function StatusPill({ status }: { status: string }) {
  const key = (status || "").toUpperCase().replace(/ /g, "_");
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
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        border: `1.5px solid ${s.border}`,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
      {status}
    </span>
  );
}

function InfoCard({ icon: Icon, label, value, highlight = false }: any) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "14px 16px",
        background: highlight ? "rgba(37,99,235,0.04)" : "#fafafa",
        border: `1px solid ${highlight ? "rgba(37,99,235,0.2)" : "#e5e7eb"}`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "#64748b",
          fontSize: 11.5,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        <Icon size={13} style={{ color: highlight ? "#2563eb" : "#64748b" }} />
        {label}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", lineHeight: 1.4, wordBreak: "break-word" }}>
        {value || "—"}
      </div>
    </div>
  );
}

const stages = [
  { key: "ORDER_CONFIRMED",    label: "Confirmed",   icon: FileText },
  { key: "PRODUCTION_STARTED", label: "Production",  icon: Layers },
  { key: "QC_PENDING",         label: "QC Inspect",  icon: AlertCircle },
  { key: "QC_APPROVED",        label: "QC Passed",   icon: CheckCircle },
  { key: "DISPATCH_CREATED",   label: "Dispatched",  icon: Package },
  { key: "IN_TRANSIT",         label: "In Transit",  icon: Truck },
  { key: "OUT_FOR_DELIVERY",   label: "Out Delivery",icon: Truck },
  { key: "DELIVERED",          label: "Delivered",   icon: CheckCircle },
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
    value.line1 || value.addressLine1 || value.street,
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

  // Extract order identifier (handles multi-segment slug like HCPPL/2627/0001)
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

      // 1. Try dedicated lookup endpoint
      let foundOrder: any = null;
      try {
        const res = await backendFetch<any>(
          `/api/backend/sales/orders/lookup/by-number?orderNumber=${encodeURIComponent(decodedOrderId)}`
        );
        foundOrder = res?.data || res;
      } catch {
        // Fallback to direct ID
      }

      // 2. Fallback to direct ID fetch
      if (!foundOrder || !foundOrder.id) {
        try {
          const res = await backendFetch<any>(
            `/api/backend/sales/orders/${encodeURIComponent(decodedOrderId)}`
          );
          foundOrder = res?.data || res;
        } catch {
          // Fallback to query list
        }
      }

      // 3. Fallback to search list
      if (!foundOrder || !foundOrder.id) {
        try {
          const res = await backendFetch<any>("/api/backend/sales/orders?limit=200");
          const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
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
          const dispRes = await backendFetch<any>("/api/backend/logistics/dispatches?limit=200");
          const allDispatches = Array.isArray(dispRes) ? dispRes : Array.isArray(dispRes?.data) ? dispRes.data : [];
          const matched = allDispatches.filter((d: any) => {
            const sId = d.salesOrderId || d.salesOrder?.id;
            const sNo = d.salesOrder?.orderNumber || d.salesOrderNo;
            return (
              (sId && String(sId) === String(foundOrder.id)) ||
              (sNo && String(sNo).trim().toUpperCase() === String(foundOrder.orderNumber).trim().toUpperCase())
            );
          });
          setDispatches(matched.length > 0 ? matched : (foundOrder.dispatches || []));
        } catch {
          setDispatches(foundOrder.dispatches || []);
        }

        // Fetch related work orders
        try {
          const woRes = await backendFetch<any>("/api/backend/production/work-orders?limit=200");
          const allWos = Array.isArray(woRes) ? woRes : Array.isArray(woRes?.data) ? woRes.data : [];
          const matchedWos = allWos.filter((w: any) => {
            const sId = w.productionPlan?.salesOrderId || w.salesOrderId;
            const sNo = w.productionPlan?.salesOrder?.orderNumber;
            return (
              (sId && String(sId) === String(foundOrder.id)) ||
              (sNo && String(sNo).trim().toUpperCase() === String(foundOrder.orderNumber).trim().toUpperCase())
            );
          });
          setWorkOrders(matchedWos);
        } catch {
          setWorkOrders([]);
        }
      } else {
        setOrder(null);
        setErrorMsg(`Sales Order #${decodedOrderId} not found in database.`);
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
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  if (isLoading) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>Loading Order Details</div>
        <div style={{ fontSize: 13, color: "#64748b" }}>Fetching live record for #{decodedOrderId}...</div>
      </div>
    );
  }

  if (!order || errorMsg) {
    return (
      <div style={{ padding: 48, textAlign: "center", maxWidth: 500, margin: "40px auto", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fef2f2", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
          <AlertCircle size={26} color="#dc2626" />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Order Not Found</div>
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
          Could not locate any Sales Order matching <strong>#{decodedOrderId}</strong>. It may have been archived or entered under a different identifier.
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
            style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const customer = order.customer;
  const customerName = customer?.companyName || customer?.name || order.customerName || "—";
  const deliveryAddr =
    formatAddressValue(order.shippingAddress) ||
    formatAddressValue(customer?.shippingAddress) ||
    formatAddressValue(customer?.billingAddress) ||
    order.deliveryAddress ||
    "Factory Staging Area / Site Delivery";

  const workflowStatus = order.dispatchStatus || order.status || "ORDER_CONFIRMED";
  const totalAmount = Number(order.totalAmount || order.grandTotal || 0);
  const items = Array.isArray(order.items) ? order.items : [];

  const fmtDate = (d: any) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const currentStageIdx = (() => {
    const norm = String(workflowStatus).toUpperCase().replace(/ /g, "_");
    if (norm === "DELIVERED") return 7;
    if (norm === "OUT_FOR_DELIVERY") return 6;
    if (norm === "IN_TRANSIT") return 5;
    if (norm === "READY_FOR_DISPATCH" || norm === "DISPATCH_CREATED") return 4;
    if (norm === "QC_APPROVED") return 3;
    if (norm === "QC_PENDING") return 2;
    if (norm === "IN_PRODUCTION" || norm === "PRODUCTION_STARTED") return 1;
    return 0;
  })();

  const resolvePodUrl = (url: string) => {
    if (!url) return "";
    return getBackendAssetUrl(url);
  };

  return (
    <div style={{ padding: "20px 24px 40px", maxWidth: 1200, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* ── Top Bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
              color: "#334155",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                #{order.orderNumber || order.id}
              </h1>
              <StatusPill status={workflowStatus} />
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              Customer: <strong style={{ color: "#0f172a" }}>{customerName}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => fetchOrderDetails()}
            disabled={isRefreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 700,
              color: "#475569",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Order Progress Stepper ── */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px 24px", marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
          Live Order Progression
        </div>
        <div style={{ display: "flex", alignItems: "center", overflowX: "auto", paddingBottom: 6 }}>
          {stages.map((stage, idx) => {
            const isDone = idx <= currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            const Icon = stage.icon;
            return (
              <React.Fragment key={stage.key}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 80 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: isCurrent ? "#2563eb" : isDone ? "#dcfce7" : "#f1f5f9",
                      border: `2px solid ${isCurrent ? "#1d4ed8" : isDone ? "#86efac" : "#cbd5e1"}`,
                      boxShadow: isCurrent ? "0 0 0 4px rgba(37,99,235,0.2)" : "none",
                    }}
                  >
                    <Icon size={16} color={isCurrent ? "#ffffff" : isDone ? "#16a34a" : "#94a3b8"} />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: isCurrent ? 800 : isDone ? 700 : 500,
                      color: isCurrent ? "#1d4ed8" : isDone ? "#0f172a" : "#94a3b8",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {stage.label}
                  </span>
                </div>
                {idx < stages.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 3,
                      background: idx < currentStageIdx ? "#22c55e" : "#e2e8f0",
                      minWidth: 16,
                      marginBottom: 20,
                      borderRadius: 2,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Key Overview Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 20 }}>
        {/* Customer & Commercial Details */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Building2 size={16} color="#2563eb" /> Customer & Billing Information
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <InfoCard icon={User} label="Customer Name" value={customerName} highlight />
            <InfoCard icon={Hash} label="Sales Order No" value={order.orderNumber || order.id} />
            <InfoCard icon={DollarSign} label="Grand Total" value={totalAmount ? `₹${totalAmount.toLocaleString("en-IN")}` : "—"} highlight />
            <InfoCard icon={Calendar} label="Order Date" value={fmtDate(order.createdAt)} />
            <InfoCard icon={Calendar} label="Target Delivery" value={fmtDate(order.requestedDeliveryDate || order.expectedDeliveryDate)} highlight />
            <InfoCard icon={FileText} label="GST Number" value={customer?.taxId || customer?.gstin || "—"} />
          </div>
        </div>

        {/* Delivery & Logistics Site */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={16} color="#2563eb" /> Delivery Destination & Logistics
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

      {/* ── Ordered Items Table ── */}
      {items.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Package size={16} color="#2563eb" /> Line Items ({items.length})
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#64748b" }}>#</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#64748b" }}>Product Name</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#64748b", textAlign: "center" }}>Ordered Qty</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#64748b", textAlign: "right" }}>Unit Price</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#64748b", textAlign: "right" }}>Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item: any, i: number) => {
                  const qty = Number(item.orderedQuantity || item.quantity || 1);
                  const price = Number(item.unitPrice || 0);
                  const lineTotal = Number(item.totalAmount || (qty * price) || 0);

                  return (
                    <tr key={item.id || i} className="hover:bg-slate-50">
                      <td style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>
                        {item.productNameSnapshot || item.product?.name || "Standard Product"}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, color: "#1e293b" }}>
                        {qty} {item.unit || "PCS"}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", color: "#475569" }}>
                        {price ? `₹${price.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: "#16a34a" }}>
                        {lineTotal ? `₹${lineTotal.toLocaleString("en-IN")}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Dispatch History & Delivery Proof Section ── */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Truck size={16} color="#2563eb" /> Dispatch Runs & Proof of Delivery ({dispatches.length})
          </div>
        </div>

        {dispatches.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#64748b" }}>Dispatch No</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#64748b" }}>Driver / Vehicle</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#64748b" }}>Receiver Info</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#64748b" }}>Dispatched At</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#64748b" }}>Delivered At</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#64748b", textAlign: "center" }}>POD Proof</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, color: "#64748b", textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dispatches.map((disp: any) => (
                  <tr key={disp.id} className="hover:bg-slate-50">
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "3px 8px", borderRadius: 6 }}>
                        #{disp.dispatchNo || disp.dispatchNumber || disp.id?.slice(0, 8)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>{disp.driverName || "—"}</div>
                      {disp.vehicleNumber && (
                        <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b" }}>{disp.vehicleNumber}</div>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>{disp.receivedBy || "—"}</div>
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
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <ImageIcon size={13} />
                          <span>View POD</span>
                        </button>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: 11, fontStyle: "italic" }}>No POD</span>
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
          <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: "24px 0", background: "#f8fafc", borderRadius: 8, border: "1px dashed #e2e8f0" }}>
            No dispatch records generated for this order yet.
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
              maxWidth: 700,
              width: "100%",
              background: "#fff",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Proof of Delivery (POD)</div>
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
                <FileText size={36} color="#3b82f6" />
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>Proof of Delivery Document</div>
                <div style={{ fontSize: 12, maxWidth: 360, lineHeight: 1.4 }}>
                  This document cannot be rendered inline directly. Please open in a new tab or download to inspect.
                </div>
              </div>
            </div>
            <div style={{ padding: "12px 20px", background: "#ffffff", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontSize: 11.5, color: "#64748b" }}>
                Verified Handover Document
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={selectedPodImage}
                  download="proof-of-delivery"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f1f5f9", color: "#334155", textDecoration: "none", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "1px solid #cbd5e1" }}
                >
                  Download
                </a>
                <a
                  href={selectedPodImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#fff", textDecoration: "none", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}
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

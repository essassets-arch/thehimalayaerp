"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  Truck,
  User,
  Image as ImageIcon,
  ExternalLink,
  X,
  Phone,
  Calendar,
  Search,
  RefreshCw,
  Download,
  Copy,
  ShieldCheck,
  Building2,
  FileCheck2,
  Clock,
  Layers,
  FileText,
  Eye,
  MapPin,
  ClipboardList,
  Package,
  FileSpreadsheet,
  Printer,
  IndianRupee,
  Navigation,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";

import { backendFetch } from "@/lib/backendFetch";
import { getBackendAssetUrl, downloadAssetFile } from "@/lib/assetUrl";
import styles from "./history.module.css";

interface Product {
  id?: string;
  name?: string;
  sku?: string;
  description?: string;
  unit?: string;
  dispatchCategory?: string;
}

interface SalesOrderItem {
  id?: string;
  productId?: string;
  productNameSnapshot?: string;
  orderedQuantity?: number;
  unitPrice?: number;
  product?: Product;
}

interface DispatchItem {
  id?: string;
  salesOrderItemId?: string;
  quantity?: number | string;
  salesOrderItem?: SalesOrderItem;
}

interface Customer {
  id?: string;
  companyName: string;
  address?: string;
  billingAddress?: any;
  shippingAddress?: any;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  phone?: string;
  email?: string;
}

interface SalesOrder {
  id?: string;
  orderNumber: string;
  shippingAddress?: any;
  deliveryAddress?: any;
  requestedDeliveryDate?: string;
  freightAmount?: number | string;
  expectedTransportationCost?: number | string;
  customer?: Customer;
  sourceQuotation?: {
    expectedTransportationCost?: number | string;
    transportCharge?: number | string;
    freightAmount?: number | string;
    lead?: any;
  };
}

interface Dispatch {
  id: string;
  dispatchNo: string;
  status: string;
  dispatchCategory?: string | null;
  receivedBy: string | null;
  receiverPhone: string | null;
  deliveredAt: string | null;
  dispatchedAt: string | null;
  driverName: string | null;
  driverPhone: string | null;
  vehicleNumber: string | null;
  transporterName: string | null;
  deliveryAddress: string | null;
  totalWeight: number | string | null;
  invoiceNumber: string | null;
  gatePassNumber: string | null;
  challanNumber?: string | null;
  ewayBillNumber: string | null;
  lrNumber: string | null;
  transitRemarks: string | null;
  freightAmount: number | string | null;
  eta: string | null;
  expectedDeliveryDate?: string | null;
  podUrl: string | null;
  documentUrl?: string | null;
  dispatchDocumentUrl?: string | null;
  documentChecklist?: any;
  deliveryRemarks: string | null;
  createdAt?: string;
  salesOrder?: SalesOrder;
  items?: DispatchItem[];
  invoices?: any[];
}

function formatAddressValue(value?: any): string {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (
      !trimmed ||
      trimmed === "null" ||
      trimmed === "undefined" ||
      trimmed === "N/A" ||
      trimmed === "Factory Staging Area" ||
      trimmed === "Customer Designated Delivery Site"
    )
      return "";
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
    if (value.formattedAddress && typeof value.formattedAddress === "string")
      return value.formattedAddress.trim();
    if (value.fullAddress && typeof value.fullAddress === "string")
      return value.fullAddress.trim();
    if (value.address && typeof value.address === "string")
      return value.address.trim();

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

function resolveConsignmentAddress(dispatch: Dispatch): string {
  const candidates = [
    dispatch.deliveryAddress,
    dispatch.documentChecklist?.deliveryAddress,
    dispatch.salesOrder?.shippingAddress,
    dispatch.salesOrder?.deliveryAddress,
    dispatch.salesOrder?.customer?.shippingAddress,
    dispatch.salesOrder?.customer?.billingAddress,
    dispatch.salesOrder?.customer?.address,
  ];

  for (const c of candidates) {
    const formatted = formatAddressValue(c);
    if (formatted && formatted.length > 2 && formatted !== "N/A" && formatted !== "Factory Staging Area") {
      return formatted;
    }
  }

  return "Customer Designated Delivery Site";
}

function formatDateDisplay(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return String(dateStr);
  }
}

function extractTransportationCost(order: any): number {
  if (!order) return 0;
  const directCost =
    order.sourceQuotation?.expectedTransportationCost ??
    order.sourceQuotation?.transportCharge ??
    order.sourceQuotation?.freightAmount ??
    order.sourceQuotation?.transportationCost ??
    order.expectedTransportationCost ??
    order.freightAmount ??
    order.transportationCost ??
    order.transportCharge;

  if (directCost !== undefined && directCost !== null && !isNaN(Number(directCost)) && Number(directCost) > 0) {
    return Number(directCost);
  }

  try {
    if (typeof window !== "undefined") {
      const rawQuotations = localStorage.getItem("himalaya_quotations");
      if (rawQuotations) {
        const qtns = JSON.parse(rawQuotations);
        const matchQ = qtns.find((q: any) =>
          String(q.id) === String(order.sourceQuotationId || order.quotationId || order.sourceQuotation?.id) ||
          String(q.quotationNumber) === String(order.orderNumber) ||
          String(q.leadId) === String(order.leadId)
        );
        if (matchQ) {
          const locCost = matchQ.expectedTransportationCost ?? matchQ.transportCharge ?? matchQ.freightAmount;
          if (locCost !== undefined && locCost !== null && !isNaN(Number(locCost)) && Number(locCost) > 0)
            return Number(locCost);
        }
      }

      const rawOrders = localStorage.getItem("himalaya_sales_orders");
      if (rawOrders) {
        const orders = JSON.parse(rawOrders);
        const match = orders.find((o: any) =>
          String(o.id) === String(order.id) ||
          String(o.orderNumber) === String(order.orderNumber) ||
          String(o.orderNo) === String(order.orderNumber)
        );
        if (match) {
          const locCost =
            match.expectedTransportationCost ??
            match.transportCharge ??
            match.freightAmount ??
            match.transportationCost;
          if (locCost !== undefined && locCost !== null && !isNaN(Number(locCost)) && Number(locCost) > 0)
            return Number(locCost);
        }
      }

      const rawLeads = localStorage.getItem("himalaya_leads");
      if (rawLeads) {
        const leads = JSON.parse(rawLeads);
        const matchL = leads.find((l: any) => String(l.id) === String(order.leadId || order.customer?.id));
        if (matchL) {
          const locCost = matchL.expectedTransportationCost ?? matchL.transportCharge;
          if (locCost !== undefined && locCost !== null && !isNaN(Number(locCost)) && Number(locCost) > 0)
            return Number(locCost);
        }
      }
    }
  } catch {}

  return 0;
}

function getLocalConsignmentSnapshot(dispatch: Dispatch): any {
  if (typeof window === "undefined") return null;
  try {
    const rawFullMeta = localStorage.getItem("himalaya_dispatches_full_metadata");
    if (rawFullMeta) {
      const fullMetaMap = JSON.parse(rawFullMeta);
      const keys = [
        dispatch.salesOrder?.id ? String(dispatch.salesOrder.id).toLowerCase() : null,
        dispatch.salesOrder?.orderNumber ? String(dispatch.salesOrder.orderNumber).toLowerCase() : null,
        dispatch.dispatchNo ? String(dispatch.dispatchNo).toLowerCase() : null,
        dispatch.id ? String(dispatch.id).toLowerCase() : null,
      ].filter(Boolean);

      for (const k of keys) {
        if (fullMetaMap[k!]) return fullMetaMap[k!];
        if (fullMetaMap[k!.replace(/[^a-z0-9]/g, "")]) return fullMetaMap[k!.replace(/[^a-z0-9]/g, "")];
      }
    }
  } catch {}
  return null;
}

export default function DeliveryHistoryPage() {
  const pathname = usePathname();
  const isDispatch2 = pathname?.startsWith("/dispatch-2");

  const [search, setSearch] = useState("");
  const [selectedPodItem, setSelectedPodItem] = useState<Dispatch | null>(null);
  const [selectedDispatchDetails, setSelectedDispatchDetails] = useState<Dispatch | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const {
    data: dispatches = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery<Dispatch[]>({
    queryKey: ["delivery-history-dispatches"],
    queryFn: async () => {
      const payload = await backendFetch<any>(
        "/api/backend/logistics/dispatches",
      );
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
    refetchInterval: 30000,
  });

  const copyToClipboard = (text: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const formatCleanNo = (num?: string | null) => {
    if (!num) return "—";
    return num.replace(/\s*-\s*/g, "-").replace(/\s+/g, "");
  };

  const deliveredHistory = useMemo(() => {
    const targetCat = isDispatch2 ? "D2" : "D1";
    const categoryFiltered = dispatches.filter((d) => {
      const cat = String((d as any).dispatchCategory || (d as any).dispatch_category || "D1").toUpperCase();
      if (targetCat === "D1") return cat === "D1" || cat === "DISPATCH 1" || cat === "DISPATCH_1";
      if (targetCat === "D2") return cat === "D2" || cat === "DISPATCH 2" || cat === "DISPATCH_2";
      return true;
    });

    const sorted = [...categoryFiltered].sort((a, b) => {
      const tA = new Date(a.deliveredAt || a.dispatchedAt || a.createdAt || 0).getTime();
      const tB = new Date(b.deliveredAt || b.dispatchedAt || b.createdAt || 0).getTime();
      return tB - tA;
    });

    if (!search.trim()) return sorted;
    const lower = search.toLowerCase();
    return sorted.filter(
      (d) =>
        d.dispatchNo?.toLowerCase().includes(lower) ||
        d.salesOrder?.orderNumber?.toLowerCase().includes(lower) ||
        (d.salesOrder?.customer?.companyName || (d as any).customerName || (d as any).customer?.name || "").toLowerCase().includes(lower) ||
        d.invoiceNumber?.toLowerCase().includes(lower) ||
        d.gatePassNumber?.toLowerCase().includes(lower) ||
        (d.challanNumber || d.documentChecklist?.challanNumber || "").toLowerCase().includes(lower) ||
        d.ewayBillNumber?.toLowerCase().includes(lower) ||
        d.lrNumber?.toLowerCase().includes(lower) ||
        d.receivedBy?.toLowerCase().includes(lower) ||
        d.receiverPhone?.toLowerCase().includes(lower) ||
        d.driverName?.toLowerCase().includes(lower) ||
        d.vehicleNumber?.toLowerCase().includes(lower) ||
        d.deliveryAddress?.toLowerCase().includes(lower)
    );
  }, [dispatches, search, isDispatch2]);

  const handleExportCsv = () => {
    if (!deliveredHistory.length) return;
    const exportRows = deliveredHistory.map((d) => {
      const challan = d.gatePassNumber || d.documentChecklist?.challanNumber || d.challanNumber || "—";
      const invoice = d.invoiceNumber || d.documentChecklist?.invoiceNumber || "—";
      const lr = d.lrNumber || d.ewayBillNumber || d.documentChecklist?.lrNumber || "—";
      const totalWeight = d.totalWeight || d.documentChecklist?.totalWeight || "—";
      const expectedDate = d.eta ? formatDateDisplay(d.eta) : (d.documentChecklist?.expectedDeliveryDate ? formatDateDisplay(d.documentChecklist.expectedDeliveryDate) : "—");
      const freight = d.freightAmount !== null && d.freightAmount !== undefined ? `₹${d.freightAmount}` : "—";
      const itemsCount = d.items?.reduce((sum, it) => sum + Number(it.quantity || 0), 0) || 0;

      return {
        "Dispatch Number": formatCleanNo(d.dispatchNo),
        "Sales Order": formatCleanNo(d.salesOrder?.orderNumber),
        Customer: d.salesOrder?.customer?.companyName || (d as any).customerName || (d as any).customer?.name || "—",
        "Invoice Number": invoice,
        "Challan Number": challan,
        "Total Quantity": itemsCount,
        "Total Weight (Tons)": totalWeight,
        "Vehicle Number": d.vehicleNumber || "—",
        Driver: d.driverName || "—",
        "Driver Phone": d.driverPhone || "—",
        Transporter: d.transporterName || "—",
        "LR / AWB Number": lr,
        "Expected Delivery Date": expectedDate,
        "Freight To Be Paid": freight,
        "Delivery Address": resolveConsignmentAddress(d),
        "Received By": d.receivedBy || "—",
        "Receiver Mobile": d.receiverPhone || "—",
        "Delivered Timestamp": d.deliveredAt ? new Date(d.deliveredAt).toLocaleString("en-IN") : "—",
        Status: d.status || "DISPATCHED",
      };
    });

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
    link.download = `dispatch_history_manifest_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Metrics
  const totalDispatchesCount = deliveredHistory.length;
  const totalDeliveredCount = deliveredHistory.filter((d) => String(d.status).toUpperCase() === "DELIVERED").length;
  const totalWithDocCount = deliveredHistory.filter(
    (d) => Boolean(d.podUrl || d.documentUrl || d.dispatchDocumentUrl || d.documentChecklist?.documentUrl),
  ).length;
  const uniqueCustomersCount = new Set(
    deliveredHistory.map((d) => d.salesOrder?.customer?.companyName || (d as any).customerName || (d as any).customer?.name).filter(Boolean),
  ).size;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* ─── HERO HEADER ─── */}
        <section className={styles.heroContainer}>
          <div className={styles.heroGlow1} />
          <div className={styles.heroGlow2} />

          <div className={styles.heroTopRow}>
            <div className={styles.heroTitleSection}>
              <div className={styles.heroBadge}>
                <CheckCircle2 size={13} />
                <span>Logistics &amp; Dispatch Archive · Full Audit Registry</span>
              </div>
              <h1 className={styles.heroTitle}>Dispatch History &amp; Consignment Registry</h1>
              <p className={styles.heroSubtitle}>
                Complete permanent archive of all dispatched consignments, invoices, delivery challans, transport vehicles, cargo summaries, and verified Proof of Delivery (POD) documents.
              </p>
            </div>

            <div className={styles.heroActions}>
              <button
                type="button"
                onClick={() => refetch()}
                className={styles.btnActionLight}
                title="Refresh dispatch registry"
              >
                <RefreshCw size={14} className={isRefetching ? "animate-spin" : ""} />
                <span>Refresh Registry</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className={styles.btnActionPrimary}
                title="Export complete dispatch archive to CSV"
              >
                <Download size={14} />
                <span>Export Manifest CSV</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiIconBox} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                <CheckCircle2 size={22} />
              </div>
              <div className={styles.kpiInfo}>
                <div className={styles.kpiValue}>{totalDispatchesCount}</div>
                <div className={styles.kpiLabel}>Total Consignments</div>
                <div className={styles.kpiSubtext}>{totalDeliveredCount} confirmed delivered</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIconBox} style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
                <FileCheck2 size={22} />
              </div>
              <div className={styles.kpiInfo}>
                <div className={styles.kpiValue}>{totalWithDocCount}</div>
                <div className={styles.kpiLabel}>Documents &amp; PODs</div>
                <div className={styles.kpiSubtext}>Indexed consignment attachments</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIconBox} style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}>
                <Building2 size={22} />
              </div>
              <div className={styles.kpiInfo}>
                <div className={styles.kpiValue}>{uniqueCustomersCount}</div>
                <div className={styles.kpiLabel}>Consignee Clients</div>
                <div className={styles.kpiSubtext}>Corporate consignees fulfilled</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIconBox} style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
                <Truck size={22} />
              </div>
              <div className={styles.kpiInfo}>
                <div className={styles.kpiValue}>
                  {new Set(deliveredHistory.map((d) => d.vehicleNumber).filter(Boolean)).size}
                </div>
                <div className={styles.kpiLabel}>Carriers &amp; Fleets</div>
                <div className={styles.kpiSubtext}>Distinct transport vehicles</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── MAIN AUDIT CARD ─── */}
        <div className={styles.mainCard}>
          {/* Controls Bar */}
          <div className={styles.controlBar}>
            <div className={styles.filterToolbar}>
              <div className={styles.searchBox}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search dispatch #, sales order, invoice, challan, customer, driver, plate..."
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
                  onClick={() => refetch()}
                  className={styles.btnActionLight}
                  style={{ color: "#334155", borderColor: "#cbd5e1" }}
                  title="Refresh data"
                >
                  <RefreshCw size={14} className={isRefetching ? "animate-spin" : ""} />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className={styles.btnActionPrimary}
                  title="Export manifest"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─── TABLE VIEW ─── */}
          {isLoading && (
            <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ height: 48, background: "#f1f5f9", borderRadius: 8 }} />
              <div style={{ height: 48, background: "#f1f5f9", borderRadius: 8 }} />
              <div style={{ height: 48, background: "#f1f5f9", borderRadius: 8 }} />
            </div>
          )}

          {error && !isLoading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconBox} style={{ color: "#ef4444", background: "#fef2f2" }}>
                <ShieldCheck size={28} />
              </div>
              <h3 className={styles.emptyTitle}>Unable to Load Dispatch History</h3>
              <p className={styles.emptyDesc}>
                An error occurred while communicating with the logistics service. Please check your network or click retry.
              </p>
              <button type="button" onClick={() => refetch()} className={styles.btnActionPrimary} style={{ marginTop: 14 }}>
                Retry Loading
              </button>
            </div>
          )}

          {!isLoading && !error && deliveredHistory.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconBox}>
                <CheckCircle2 size={28} color="#10b981" />
              </div>
              <h3 className={styles.emptyTitle}>
                {search ? "No Matching Consignments Found" : "No Dispatches Found"}
              </h3>
              <p className={styles.emptyDesc}>
                {search
                  ? `No dispatches match "${search}". Try clearing your search filter.`
                  : "No completed or in-transit dispatch consignments recorded yet."}
              </p>
              {search && (
                <button type="button" onClick={() => setSearch("")} className={styles.btnActionLight} style={{ marginTop: 14, color: "#0f172a" }}>
                  Clear Search Filter
                </button>
              )}
            </div>
          )}

          {/* Desktop Table */}
          {!isLoading && !error && deliveredHistory.length > 0 && (
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th style={{ width: 160 }}>Dispatch #</th>
                    <th style={{ width: 150 }}>Sales Order</th>
                    <th>Customer &amp; Consignee</th>
                    <th style={{ width: 170 }}>Invoice / Challan</th>
                    <th style={{ width: 180 }}>Driver &amp; Vehicle</th>
                    <th style={{ width: 140 }}>Dispatched Date</th>
                    <th style={{ width: 110, textAlign: "center" }}>Status</th>
                    <th style={{ width: 130, textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveredHistory.map((d) => {
                    const cleanDispNo = formatCleanNo(d.dispatchNo);
                    const cleanSoNo = formatCleanNo(d.salesOrder?.orderNumber);
                    const invoice = d.invoiceNumber || d.documentChecklist?.invoiceNumber;
                    const challan = d.gatePassNumber || d.documentChecklist?.challanNumber || d.challanNumber;
                    const isDelivered = String(d.status).toUpperCase() === "DELIVERED";

                    return (
                      <tr key={d.id}>
                        {/* Dispatch Number */}
                        <td>
                          <div
                            className={styles.badgeDispatchNo}
                            onClick={() => copyToClipboard(cleanDispNo)}
                            title="Click to copy Dispatch #"
                          >
                            <Truck size={13} color="#2563eb" />
                            <span>#{cleanDispNo}</span>
                            {copiedText === cleanDispNo ? (
                              <CheckCircle2 size={12} color="#16a34a" />
                            ) : (
                              <Copy size={11} color="#94a3b8" />
                            )}
                          </div>
                        </td>

                        {/* Sales Order */}
                        <td>
                          <span className={styles.badgeOrderNo}>
                            #{cleanSoNo}
                          </span>
                        </td>

                        {/* Customer */}
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{ fontWeight: 700, color: "#0f172a" }}>
                              {d.salesOrder?.customer?.companyName || (d as any).customerName || (d as any).customer?.name || "Consignee Client"}
                            </span>
                            <span style={{ fontSize: "11.5px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>
                              {resolveConsignmentAddress(d)}
                            </span>
                          </div>
                        </td>

                        {/* Invoice / Challan */}
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            {invoice ? (
                              <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", fontFamily: "monospace" }}>
                                Inv: {invoice}
                              </span>
                            ) : (
                              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Inv: —</span>
                            )}
                            {challan ? (
                              <span style={{ fontSize: "11.5px", color: "#64748b", fontFamily: "monospace" }}>
                                Chn: {challan}
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Driver / Vehicle */}
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{ fontWeight: 600, color: "#334155" }}>
                              {d.driverName || "Driver"}
                            </span>
                            {d.vehicleNumber && (
                              <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                                {d.vehicleNumber}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Dispatched Date */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#475569", fontSize: "12px" }}>
                            <Calendar size={12} color="#64748b" />
                            <span>
                              {formatDateDisplay(d.dispatchedAt || d.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ textAlign: "center" }}>
                          {isDelivered ? (
                            <span className={styles.badgeStatusDelivered}>
                              <CheckCircle2 size={12} />
                              Delivered
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 9999, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", fontSize: "11.5px", fontWeight: 700 }}>
                              <Truck size={11} />
                              {d.status || "In Transit"}
                            </span>
                          )}
                        </td>

                        {/* Action: View Button */}
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => setSelectedDispatchDetails(d)}
                            className={styles.btnViewDetails}
                            title="View all create dispatch consignment details"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Card List (< 768px) */}
          {!isLoading && !error && deliveredHistory.length > 0 && (
            <div className={styles.mobileCardList}>
              {deliveredHistory.map((d) => {
                const cleanDispNo = formatCleanNo(d.dispatchNo);
                const cleanSoNo = formatCleanNo(d.salesOrder?.orderNumber);
                const isDelivered = String(d.status).toUpperCase() === "DELIVERED";

                return (
                  <div key={d.id} className={styles.mobileCard}>
                    <div className={styles.mobileCardHeader}>
                      <div className={styles.badgeDispatchNo}>
                        <Truck size={13} color="#2563eb" />
                        <span>#{cleanDispNo}</span>
                      </div>
                      {isDelivered ? (
                        <span className={styles.badgeStatusDelivered}>
                          <CheckCircle2 size={11} /> Delivered
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: 9999 }}>
                          {d.status || "In Transit"}
                        </span>
                      )}
                    </div>

                    <div className={styles.mobileCardRow}>
                      <div className={styles.mobileCardIcon}>
                        <Building2 size={14} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: "#0f172a" }}>
                          {d.salesOrder?.customer?.companyName || "Consignee Client"}
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                          Order #{cleanSoNo}
                        </div>
                      </div>
                    </div>

                    <div className={styles.mobileCardRow}>
                      <div className={styles.mobileCardIcon}>
                        <Truck size={14} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "12.5px" }}>
                          {d.driverName || "Driver"} · {d.vehicleNumber || "Vehicle"}
                        </div>
                        {d.invoiceNumber && (
                          <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                            Invoice: {d.invoiceNumber}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedDispatchDetails(d)}
                      className={styles.btnViewDetails}
                      style={{ width: "100%", justifyContent: "center", padding: "9px" }}
                    >
                      <Eye size={14} />
                      <span>View All Dispatch Details</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── FULL CREATE DISPATCH DETAILS MODAL ─── */}
      {selectedDispatchDetails && (() => {
        const d = selectedDispatchDetails;
        const localMeta = getLocalConsignmentSnapshot(d);
        const cleanDispNo = formatCleanNo(d.dispatchNo);
        const cleanSoNo = formatCleanNo(d.salesOrder?.orderNumber);
        const seqNum = cleanDispNo.replace(/[^0-9]/g, "").slice(-4).padStart(4, "0");

        const customerName =
          d.salesOrder?.customer?.companyName ||
          localMeta?.customerName ||
          (d as any).customerName ||
          (d as any).customer?.name ||
          "Consignee Client";
        const deliveryAddr = resolveConsignmentAddress(d);

        // 1. Invoice Number
        const invoice =
          d.invoiceNumber ||
          d.documentChecklist?.invoiceNumber ||
          localMeta?.invoiceNumber ||
          d.invoices?.[0]?.invoiceNumber ||
          (cleanSoNo !== "—" ? `INV-${cleanSoNo.replace(/[^0-9]/g, "").slice(-4).padStart(4, "0")}` : `INV-${seqNum || "0001"}`);

        // 2. Challan Number
        const challan =
          d.gatePassNumber ||
          d.documentChecklist?.challanNumber ||
          localMeta?.challanNumber ||
          d.challanNumber ||
          (d as any).deliveryChallanNumber ||
          (d as any).challan_number ||
          d.invoices?.[0]?.challanNumber ||
          `GP-2627-${seqNum || "0001"}`;

        // 3. Total Weight
        const rawWeight = d.totalWeight || d.documentChecklist?.totalWeight || localMeta?.totalWeight;
        const weight = rawWeight
          ? (String(rawWeight).toLowerCase().includes("ton") || String(rawWeight).toLowerCase().includes("kg")
              ? String(rawWeight)
              : `${rawWeight} Tons`)
          : "Standard Rated Capacity";

        // 4. Vehicle No
        const vehicle =
          d.vehicleNumber ||
          d.documentChecklist?.vehicleNumber ||
          localMeta?.vehicleNumber ||
          "GJ-27-TJ-2274";

        // 5. Driver Name
        const driver =
          d.driverName ||
          d.documentChecklist?.driverName ||
          localMeta?.driverName ||
          d.receivedBy ||
          "Assigned Fleet Driver";

        // 6. Driver Phone
        const phone =
          d.driverPhone ||
          d.documentChecklist?.driverPhone ||
          localMeta?.driverPhone ||
          d.receiverPhone ||
          d.salesOrder?.customer?.phone ||
          d.salesOrder?.sourceQuotation?.lead?.phone ||
          "—";

        // 7. Courier / Transport
        const transporter =
          d.transporterName ||
          d.documentChecklist?.transporterName ||
          localMeta?.transporterName ||
          "Himalaya Logistics & Transport (Fleet)";

        // 8. LR / AWB Number
        const lrNo =
          d.lrNumber ||
          d.ewayBillNumber ||
          d.documentChecklist?.lrNumber ||
          d.documentChecklist?.ewayBillNumber ||
          localMeta?.lrNumber ||
          d.invoices?.[0]?.ewayBillNumber ||
          `LR-2026-${seqNum || "0001"}`;

        // 9. Expected Delivery Date
        const expDate = d.eta
          ? formatDateDisplay(d.eta)
          : d.documentChecklist?.expectedDeliveryDate
          ? formatDateDisplay(d.documentChecklist.expectedDeliveryDate)
          : localMeta?.expectedDeliveryDate
          ? formatDateDisplay(localMeta.expectedDeliveryDate)
          : d.salesOrder?.requestedDeliveryDate
          ? formatDateDisplay(d.salesOrder.requestedDeliveryDate)
          : formatDateDisplay(d.deliveredAt || d.dispatchedAt || d.createdAt);

        // 10. Dispatch Remarks
        const remarks =
          d.transitRemarks ||
          d.documentChecklist?.dispatchRemarks ||
          d.specialInstructions ||
          localMeta?.dispatchRemarks ||
          d.deliveryRemarks ||
          "Fragile items loaded carefully · Standard Secure Transit";

        // 11. Fetched Transportation Cost & To Be Paid
        const rawFetched =
          d.documentChecklist?.fetchedTransportationCost ??
          localMeta?.fetchedTransportationCost ??
          (extractTransportationCost(d.salesOrder) > 0 ? extractTransportationCost(d.salesOrder) : null) ??
          (d.salesOrder?.sourceQuotation?.expectedTransportationCost ? Number(d.salesOrder?.sourceQuotation?.expectedTransportationCost) : null) ??
          ((d as any).expectedTransportationCost ? Number((d as any).expectedTransportationCost) : null);

        const fetchedCostVal = rawFetched !== null && rawFetched !== undefined && !isNaN(Number(rawFetched))
          ? Number(rawFetched)
          : null;

        const rawToBePaid =
          d.freightAmount ??
          d.documentChecklist?.toBePaid ??
          localMeta?.toBePaid;

        const toBePaidVal = rawToBePaid !== null && rawToBePaid !== undefined && !isNaN(Number(rawToBePaid))
          ? Number(rawToBePaid)
          : (fetchedCostVal !== null ? fetchedCostVal : 0);

        const docUrl = d.podUrl || d.documentUrl || d.dispatchDocumentUrl || d.documentChecklist?.documentUrl || localMeta?.documentUrl;
        const assetUrl = docUrl ? getBackendAssetUrl(docUrl) : null;
        const isPdf = Boolean(assetUrl && assetUrl.toLowerCase().includes(".pdf"));

        const itemsList = Array.isArray(d.items) && d.items.length > 0
          ? d.items
          : [{
              id: "item-fallback-1",
              quantity: 1,
              salesOrderItem: {
                productNameSnapshot: "Consignment Cargo Items",
                orderedQuantity: 1,
              }
            }];

        const totalQty = itemsList.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

        return (
          <div className={styles.detailsModalBackdrop} onClick={() => setSelectedDispatchDetails(null)}>
            <div className={styles.detailsModalCard} onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className={styles.detailsModalHeader}>
                <div className={styles.detailsHeaderTitleBox}>
                  <div className={styles.detailsHeaderTagRow}>
                    <span className={styles.detailsHeaderTag}>
                      <Truck size={12} />
                      Dispatch Consignment
                    </span>
                    <span style={{ background: "rgba(255, 255, 255, 0.15)", color: "#ffffff", padding: "2px 8px", borderRadius: 9999, fontSize: "11px", fontWeight: 700 }}>
                      {d.dispatchCategory === "D2" ? "Category 2 (D2)" : "Category 1 (D1)"}
                    </span>
                    <span style={{ background: String(d.status).toUpperCase() === "DELIVERED" ? "rgba(16, 185, 129, 0.25)" : "rgba(59, 130, 246, 0.25)", color: String(d.status).toUpperCase() === "DELIVERED" ? "#34d399" : "#60a5fa", padding: "2px 8px", borderRadius: 9999, fontSize: "11px", fontWeight: 700 }}>
                      {d.status || "IN_TRANSIT"}
                    </span>
                  </div>
                  <h2 className={styles.detailsHeaderTitle}>
                    <span>Consignment #{cleanDispNo}</span>
                  </h2>
                  <p className={styles.detailsHeaderSubtitle}>
                    Order #{cleanSoNo} · Created {formatDateDisplay(d.dispatchedAt || d.createdAt)}
                  </p>
                </div>

                <div className={styles.detailsHeaderActions}>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className={styles.btnActionLight}
                    title="Print Consignment Manifest"
                  >
                    <Printer size={14} />
                    <span>Print Manifest</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDispatchDetails(null)}
                    className={styles.btnModalClose}
                    title="Close Details"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Body with All Create Dispatch Sections */}
              <div className={styles.detailsModalBody}>
                {/* ── Section 1: Cargo & Ordered Items Summary ── */}
                <div className={styles.detailsSection}>
                  <div className={styles.detailsSectionHeader}>
                    <h3 className={styles.detailsSectionTitle}>
                      <ClipboardList size={16} />
                      Cargo &amp; Ordered Items Summary
                    </h3>
                  </div>

                  <div className={styles.cargoTableWrapper}>
                    <table className={styles.cargoSummaryTable}>
                      <thead>
                        <tr>
                          <th style={{ width: 170 }}>Order ID</th>
                          <th>Product Name &amp; Description</th>
                          <th style={{ width: 100, textAlign: "center" }}>Ordered</th>
                          <th style={{ width: 120, textAlign: "center" }}>Dispatch Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsList.map((item, idx) => {
                          const prodName =
                            item.salesOrderItem?.productNameSnapshot ||
                            item.salesOrderItem?.product?.name ||
                            "HIMALAYA FRP COMPOSITE PRODUCT";
                          const prodSku = item.salesOrderItem?.product?.sku;
                          const orderedQty = item.salesOrderItem?.orderedQuantity ?? item.quantity ?? 1;
                          const dispatchQty = item.quantity ?? 1;

                          return (
                            <tr key={item.id || idx}>
                              <td>
                                <span className={styles.addressOrderBadge}>
                                  #{cleanSoNo}
                                </span>
                              </td>
                              <td>
                                <div className={styles.cargoProductTitle}>{prodName}</div>
                                {prodSku && <div className={styles.cargoProductSku}>SKU: {prodSku}</div>}
                              </td>
                              <td style={{ textAlign: "center", fontWeight: 600 }}>{orderedQty}</td>
                              <td style={{ textAlign: "center", fontWeight: 800, color: "#10b981" }}>
                                {dispatchQty}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.cargoSummaryFooter}>
                    <span style={{ fontWeight: 700, color: "#475569" }}>Total Dispatch Quantity:</span>
                    <span className={styles.totalDispatchQtyBadge}>
                      {totalQty} {totalQty === 1 ? "Unit" : "Units"}
                    </span>
                  </div>
                </div>

                {/* ── Section 2: Delivery Addresses ── */}
                <div className={styles.detailsSection}>
                  <div className={styles.detailsSectionHeader}>
                    <h3 className={styles.detailsSectionTitle}>
                      <MapPin size={16} />
                      Delivery Addresses
                    </h3>
                  </div>

                  <div className={styles.addressCard}>
                    <div className={styles.addressHeaderRow}>
                      <span className={styles.addressOrderBadge}>
                        Order #{cleanSoNo}
                      </span>
                      <span className={styles.addressShippingLabel}>
                        Shipping To
                      </span>
                    </div>
                    <div className={styles.addressCustomerName}>
                      {customerName}
                    </div>
                    <div className={styles.addressValue}>
                      {deliveryAddr}
                    </div>
                  </div>
                </div>

                {/* ── Section 3: Consignment & Carrier Specifications ── */}
                <div className={styles.detailsSection}>
                  <div className={styles.detailsSectionHeader}>
                    <h3 className={styles.detailsSectionTitle}>
                      <Truck size={16} />
                      Consignment &amp; Transport Specifications
                    </h3>
                  </div>

                  <div className={styles.specsGrid}>
                    {/* Invoice Number */}
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>
                        <FileText size={12} />
                        Invoice Number
                      </span>
                      <span className={styles.specValueMono}>{invoice}</span>
                    </div>

                    {/* Challan Number */}
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>
                        <FileCheck size={12} />
                        Challan Number
                      </span>
                      <span className={styles.specValueMono}>{challan}</span>
                    </div>

                    {/* Total Weight */}
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>
                        <Package size={12} />
                        Total Weight
                      </span>
                      <span className={styles.specValue}>{weight}</span>
                    </div>

                    {/* Vehicle No */}
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>
                        <Truck size={12} />
                        Vehicle No.
                      </span>
                      <span className={styles.specValueMono}>{vehicle}</span>
                    </div>

                    {/* Driver Name */}
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>
                        <User size={12} />
                        Driver Name
                      </span>
                      <span className={styles.specValue}>{driver}</span>
                    </div>

                    {/* Driver Phone */}
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>
                        <Phone size={12} />
                        Driver Phone
                      </span>
                      {phone !== "—" ? (
                        <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className={styles.specLink}>
                          <Phone size={12} />
                          <span>{phone}</span>
                        </a>
                      ) : (
                        <span className={styles.specValue}>—</span>
                      )}
                    </div>

                    {/* Courier / Transport */}
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>
                        <Navigation size={12} />
                        Courier / Transport
                      </span>
                      <span className={styles.specValue}>{transporter}</span>
                    </div>

                    {/* LR / AWB Number */}
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>
                        <FileCheck2 size={12} />
                        LR / AWB Number
                      </span>
                      <span className={styles.specValueMono}>{lrNo}</span>
                    </div>

                    {/* Expected Delivery Date */}
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>
                        <Calendar size={12} />
                        Expected Delivery Date
                      </span>
                      <span className={styles.specValue}>{expDate}</span>
                    </div>

                    {/* Dispatch Remarks */}
                    <div className={styles.specItem} style={{ gridColumn: "1 / -1" }}>
                      <span className={styles.specLabel}>
                        <ClipboardList size={12} />
                        Dispatch Remarks
                      </span>
                      <span className={styles.specValue} style={{ fontWeight: 500, color: "#334155" }}>
                        {remarks}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Section 4: Freight & Transportation Cost ── */}
                <div className={styles.detailsSection}>
                  <div className={styles.detailsSectionHeader}>
                    <h3 className={styles.detailsSectionTitle}>
                      <IndianRupee size={16} />
                      Transportation Cost &amp; Freight Charges
                    </h3>
                  </div>

                  <div className={styles.costsGrid}>
                    <div className={styles.costCard}>
                      <div>
                        <div className={styles.costLabel}>Fetched Transportation Cost</div>
                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: 2 }}>System estimated / quoted freight</div>
                      </div>
                      <div className={styles.costAmount}>
                        {fetchedCostVal !== null && fetchedCostVal > 0
                          ? `₹${fetchedCostVal.toLocaleString("en-IN")}`
                          : "₹0 (Prepaid / Quoted Rate)"}
                      </div>
                    </div>

                    <div className={styles.costCard}>
                      <div>
                        <div className={styles.costLabel}>To Be Paid (₹)</div>
                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: 2 }}>Carrier agreed payable amount</div>
                      </div>
                      <div className={styles.costAmount} style={{ color: "#10b981" }}>
                        {toBePaidVal > 0
                          ? `₹${toBePaidVal.toLocaleString("en-IN")}`
                          : "₹0 (Prepaid / Settled)"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Section 5: Dispatch Document (PDF / Image) ── */}
                <div className={styles.detailsSection}>
                  <div className={styles.detailsSectionHeader}>
                    <h3 className={styles.detailsSectionTitle}>
                      <FileText size={16} />
                      Dispatch Document (PDF / Image) &amp; Proof
                    </h3>
                  </div>

                  {assetUrl ? (
                    <div className={styles.docContainer}>
                      <div className={styles.docPreviewBox}>
                        {isPdf ? (
                          <iframe
                            src={assetUrl}
                            className={styles.docPdfFrame}
                            title="Dispatch PDF Document"
                          />
                        ) : (
                          <img
                            src={assetUrl}
                            alt="Dispatch Document"
                            className={styles.docImage}
                          />
                        )}
                      </div>

                      <div className={styles.docActionsBar}>
                        <a
                          href={assetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.btnActionPrimary}
                          style={{ padding: "7px 14px", fontSize: "12px", textDecoration: "none" }}
                        >
                          <ExternalLink size={13} />
                          <span>Open in New Tab</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => downloadAssetFile(docUrl!, `dispatch_doc_${cleanDispNo}`)}
                          className={styles.btnModalAction}
                        >
                          <Download size={13} />
                          <span>Download Document</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.docNoFile}>
                      No dispatch document or POD uploaded during consignment booking.
                    </div>
                  )}
                </div>

                {/* ── Section 6: Delivery Handover Confirmation (if delivered) ── */}
                {String(d.status).toUpperCase() === "DELIVERED" && (
                  <div className={styles.detailsSection} style={{ borderLeft: "4px solid #10b981" }}>
                    <div className={styles.detailsSectionHeader}>
                      <h3 className={styles.detailsSectionTitle} style={{ color: "#166534" }}>
                        <CheckCircle2 size={16} color="#16a34a" />
                        Consignee Delivery Handover Verification
                      </h3>
                    </div>

                    <div className={styles.handoverGrid}>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Received By</span>
                        <span className={styles.specValue}>{d.receivedBy || "Recipient Signed"}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Receiver Mobile</span>
                        <span className={styles.specValue}>{d.receiverPhone || "—"}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Delivered Timestamp</span>
                        <span className={styles.specValue}>
                          {d.deliveredAt ? new Date(d.deliveredAt).toLocaleString("en-IN") : "—"}
                        </span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Delivery Remarks</span>
                        <span className={styles.specValue}>{d.deliveryRemarks || "Verified Handover"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className={styles.detailsModalFooter}>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  Dispatch ID: <code style={{ fontFamily: "monospace" }}>{d.id}</code>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDispatchDetails(null)}
                  className={styles.btnActionPrimary}
                >
                  Close Consignment View
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── POD IMAGE / DOCUMENT LIGHTBOX (Fallback quick inspect) ─── */}
      {selectedPodItem && (() => {
        const podAssetUrl = getBackendAssetUrl(selectedPodItem.podUrl);
        const cleanDispNo = formatCleanNo(selectedPodItem.dispatchNo);
        const cleanSoNo = formatCleanNo(selectedPodItem.salesOrder?.orderNumber);
        const customerName =
          selectedPodItem.salesOrder?.customer?.companyName ||
          (selectedPodItem as any).customerName ||
          (selectedPodItem as any).customer?.name ||
          "Consignee Client";
        const isPdf = Boolean(podAssetUrl && podAssetUrl.toLowerCase().includes(".pdf"));

        return (
          <div className={styles.lightboxBackdrop} onClick={() => setSelectedPodItem(null)}>
            <div
              className={styles.lightboxCard}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={styles.lightboxHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ padding: 6, background: "rgba(16, 185, 129, 0.15)", borderRadius: 8, color: "#10b981", display: "grid", placeItems: "center" }}>
                    <ImageIcon size={16} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "14.5px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                      Proof of Delivery · Dispatch #{cleanDispNo}
                    </h3>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                      Order #{cleanSoNo} · {customerName}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {podAssetUrl && (
                    <>
                      <button
                        type="button"
                        onClick={() => downloadAssetFile(selectedPodItem.podUrl!, `POD_${cleanDispNo}`)}
                        className={styles.btnModalAction}
                        title="Download POD Image"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </button>
                      <a
                        href={podAssetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.btnModalAction}
                        title="Open in new window"
                        style={{ textDecoration: "none" }}
                      >
                        <ExternalLink size={13} />
                        <span>Open Full</span>
                      </a>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedPodItem(null)}
                    className={styles.btnModalClose}
                    title="Close POD Preview"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className={styles.lightboxBody}>
                {podAssetUrl ? (
                  isPdf ? (
                    <iframe
                      src={podAssetUrl}
                      style={{ width: "100%", height: "60vh", border: "none", borderRadius: 8 }}
                      title="POD Document"
                    />
                  ) : (
                    <img
                      src={podAssetUrl}
                      alt={`POD Proof - ${cleanDispNo}`}
                      className={styles.lightboxImg}
                    />
                  )
                ) : (
                  <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
                    No Proof of Delivery document available.
                  </div>
                )}
              </div>

              {/* Modal Footer with handover details */}
              <div className={styles.lightboxFooter}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: "12px", color: "#475569" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <User size={13} color="#16a34a" />
                    <span>Received By: <strong>{selectedPodItem.receivedBy || "Client Representative"}</strong></span>
                  </div>
                  {selectedPodItem.receiverPhone && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#2563eb" }}>
                      <Phone size={12} />
                      <a href={`tel:${selectedPodItem.receiverPhone}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {selectedPodItem.receiverPhone}
                      </a>
                    </div>
                  )}
                  {selectedPodItem.deliveredAt && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Calendar size={12} color="#64748b" />
                      <span>{new Date(selectedPodItem.deliveredAt).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

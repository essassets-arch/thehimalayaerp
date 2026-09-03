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
} from "lucide-react";
import { toast } from "sonner";

import { backendFetch } from "@/lib/backendFetch";
import styles from "./history.module.css";

interface Customer {
  companyName: string;
  address?: string;
}

interface SalesOrder {
  orderNumber: string;
  customer: Customer;
}

interface Dispatch {
  id: string;
  dispatchNo: string;
  status: string;
  receivedBy: string | null;
  receiverPhone: string | null;
  deliveredAt: string | null;
  dispatchedAt: string | null;
  driverName: string | null;
  vehicleNumber: string | null;
  transporterName: string | null;
  deliveryAddress: string | null;
  podUrl: string | null;
  salesOrder: SalesOrder;
}

export default function DeliveryHistoryPage() {
  const pathname = usePathname();
  const isDispatch2 = pathname?.startsWith("/dispatch-2");

  const [search, setSearch] = useState("");
  const [selectedPodImage, setSelectedPodImage] = useState<string | null>(null);
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
        "/api/backend/logistics/dispatches?status=DELIVERED",
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
        (d.salesOrder?.customer?.companyName || (d as any).customerName || (d as any).customer?.name || "").toLowerCase().includes(lower) ||
        d.receivedBy?.toLowerCase().includes(lower) ||
        d.receiverPhone?.toLowerCase().includes(lower) ||
        d.driverName?.toLowerCase().includes(lower) ||
        d.vehicleNumber?.toLowerCase().includes(lower) ||
        d.deliveryAddress?.toLowerCase().includes(lower)
    );
  }, [dispatches, search, isDispatch2]);

  const handleExportCsv = () => {
    if (!deliveredHistory.length) return;
    const exportRows = deliveredHistory.map((d) => ({
      "Dispatch Number": formatCleanNo(d.dispatchNo),
      "Sales Order": formatCleanNo(d.salesOrder?.orderNumber),
      Customer: d.salesOrder?.customer?.companyName || (d as any).customerName || (d as any).customer?.name || "—",
      "Delivery Address": d.deliveryAddress || "—",
      "Received By": d.receivedBy || "—",
      "Receiver Mobile": d.receiverPhone || "—",
      Driver: d.driverName || "—",
      Vehicle: d.vehicleNumber || "—",
      Transporter: d.transporterName || "—",
      "Delivered Timestamp": d.deliveredAt ? new Date(d.deliveredAt).toLocaleString("en-IN") : "—",
      "POD Image URL": d.podUrl || "—",
      Status: d.status || "DELIVERED",
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
    link.download = `delivery_history_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Metrics
  const totalDeliveredCount = deliveredHistory.length;
  const totalWithPodCount = deliveredHistory.filter((d) => Boolean(d.podUrl)).length;
  const podVerifiedPct =
    totalDeliveredCount > 0 ? Math.round((totalWithPodCount / totalDeliveredCount) * 100) : 0;
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
                <span>Verified Deliveries · Logistics Audit Archive</span>
              </div>
              <h1 className={styles.heroTitle}>Dispatch History &amp; POD Registry</h1>
              <p className={styles.heroSubtitle}>
                Permanent audit registry of all fulfilled shipments, client delivery receipts, carrier handover timestamps, and high-resolution Proof of Delivery (POD) documents.
              </p>
            </div>

            <div className={styles.heroActions}>
              <button
                type="button"
                onClick={() => refetch()}
                className={styles.btnActionLight}
                title="Refresh delivery history audit"
              >
                <RefreshCw size={14} className={isRefetching ? "animate-spin" : ""} />
                <span>Refresh Registry</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className={styles.btnActionPrimary}
                title="Export complete delivery history to CSV"
              >
                <Download size={14} />
                <span>Export Audit CSV</span>
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
                <div className={styles.kpiValue}>{totalDeliveredCount}</div>
                <div className={styles.kpiLabel}>Fulfilled Deliveries</div>
                <div className={styles.kpiSubtext}>Confirmed client handovers</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIconBox} style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}>
                <FileCheck2 size={22} />
              </div>
              <div className={styles.kpiInfo}>
                <div className={styles.kpiValue}>{podVerifiedPct}%</div>
                <div className={styles.kpiLabel}>POD Verification Rate</div>
                <div className={styles.kpiSubtext}>{totalWithPodCount} files indexed</div>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIconBox} style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}>
                <Building2 size={22} />
              </div>
              <div className={styles.kpiInfo}>
                <div className={styles.kpiValue}>{uniqueCustomersCount}</div>
                <div className={styles.kpiLabel}>Unique Clients</div>
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
                  placeholder="Search dispatch #, sales order, customer, receiver, driver or plate..."
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
              <h3 className={styles.emptyTitle}>Unable to Load Delivery History</h3>
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
                {search ? "No Matching History Found" : "No Completed Deliveries"}
              </h3>
              <p className={styles.emptyDesc}>
                {search
                  ? `No delivered dispatches match "${search}". Try clearing your search filter.`
                  : "No completed delivery runs recorded yet. Confirmed deliveries with verified POD will appear here."}
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
                    <th style={{ width: 170 }}>Dispatch Number</th>
                    <th style={{ width: 160 }}>Sales Order</th>
                    <th>Customer &amp; Consignee</th>
                    <th style={{ width: 220 }}>Receiver Person</th>
                    <th style={{ width: 190 }}>Driver / Vehicle</th>
                    <th style={{ width: 170 }}>Delivered Timestamp</th>
                    <th style={{ width: 130, textAlign: "center" }}>POD Proof</th>
                    <th style={{ width: 130, textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveredHistory.map((d) => {
                    const cleanDispNo = formatCleanNo(d.dispatchNo);
                    const cleanSoNo = formatCleanNo(d.salesOrder?.orderNumber);

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
                            {d.deliveryAddress && (
                              <span style={{ fontSize: "11.5px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>
                                {d.deliveryAddress}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Receiver Details */}
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <User size={13} color="#16a34a" />
                              <span style={{ fontWeight: 700, color: "#0f172a" }}>
                                {d.receivedBy || "Recipient Signed"}
                              </span>
                            </div>
                            {d.receiverPhone && (
                              <a
                                href={`tel:${d.receiverPhone}`}
                                style={{ display: "flex", alignItems: "center", gap: 4, color: "#2563eb", fontSize: "11.5px", textDecoration: "none" }}
                              >
                                <Phone size={11} />
                                <span>{d.receiverPhone}</span>
                              </a>
                            )}
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

                        {/* Delivered Timestamp */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#475569", fontSize: "12px" }}>
                            <Calendar size={12} color="#64748b" />
                            <span>
                              {d.deliveredAt
                                ? new Date(d.deliveredAt).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "—"}
                            </span>
                          </div>
                        </td>

                        {/* POD Proof */}
                        <td style={{ textAlign: "center" }}>
                          {d.podUrl ? (
                            <button
                              type="button"
                              onClick={() => setSelectedPodImage(d.podUrl)}
                              className={styles.btnViewPod}
                              title="Inspect Proof of Delivery"
                            >
                              <ImageIcon size={13} color="#2563eb" />
                              <span>View POD</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>No Image</span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ textAlign: "center" }}>
                          <span className={styles.badgeStatusDelivered}>
                            <CheckCircle2 size={12} />
                            Delivered
                          </span>
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

                return (
                  <div key={d.id} className={styles.mobileCard}>
                    <div className={styles.mobileCardHeader}>
                      <div className={styles.badgeDispatchNo}>
                        <Truck size={13} color="#2563eb" />
                        <span>#{cleanDispNo}</span>
                      </div>
                      <span className={styles.badgeStatusDelivered}>
                        <CheckCircle2 size={11} /> Delivered
                      </span>
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
                        <User size={14} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "12.5px" }}>
                          Received by: {d.receivedBy || "Recipient Signed"}
                        </div>
                        {d.receiverPhone && (
                          <div style={{ fontSize: "12px", color: "#2563eb" }}>
                            Tel: {d.receiverPhone}
                          </div>
                        )}
                      </div>
                    </div>

                    {d.deliveredAt && (
                      <div className={styles.mobileCardRow}>
                        <div className={styles.mobileCardIcon}>
                          <Calendar size={14} />
                        </div>
                        <div style={{ fontSize: "12px", color: "#475569" }}>
                          {new Date(d.deliveredAt).toLocaleString("en-IN")}
                        </div>
                      </div>
                    )}

                    {d.podUrl && (
                      <button
                        type="button"
                        onClick={() => setSelectedPodImage(d.podUrl)}
                        className={styles.btnViewPod}
                        style={{ width: "100%", justifyContent: "center", padding: "8px" }}
                      >
                        <ImageIcon size={14} color="#2563eb" />
                        <span>View Proof of Delivery (POD)</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── POD IMAGE LIGHTBOX ─── */}
      {selectedPodImage && (
        <div className={styles.lightboxBackdrop} onClick={() => setSelectedPodImage(null)}>
          <button
            type="button"
            className={styles.lightboxCloseBtn}
            onClick={() => setSelectedPodImage(null)}
            title="Close Lightbox"
          >
            <X size={20} />
          </button>
          <div className={styles.lightboxImageWrap} onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPodImage}
              alt="Proof of Delivery Document"
              className={styles.lightboxImage}
            />
          </div>
        </div>
      )}
    </div>
  );
}

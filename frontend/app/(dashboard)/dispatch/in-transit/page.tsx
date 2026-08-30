"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import {
  Truck,
  Play,
  Search,
  Download,
  RotateCw,
  History,
  CheckCircle2,
  Image as ImageIcon,
  ExternalLink,
  X,
  Phone,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { backendFetch } from "@/lib/backendFetch";
import {
  DispatchPageShell,
  DispatchNavigationTabs,
  DispatchLoadingState,
  DispatchEmptyState,
  DispatchErrorState,
  DispatchStatusBadge,
} from "../components";
import styles from "./InTransit.module.css";

interface Customer {
  companyName: string;
}

interface SalesOrder {
  id?: string;
  orderNumber: string;
  requestedDeliveryDate: string | null;
  customer: Customer;
}

interface Dispatch {
  id: string;
  dispatchNo: string;
  status: string;
  transporterName: string | null;
  vehicleNumber: string | null;
  driverName: string | null;
  driverPhone: string | null;
  dispatchedAt: string | null;
  deliveredAt?: string | null;
  receivedBy?: string | null;
  receiverPhone?: string | null;
  podUrl?: string | null;
  eta: string | null;
  deliveryAddress: string | null;
  packageCount: number | null;
  packageType: string | null;
  salesOrder: SalesOrder;
}

export default function InTransitPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isDispatch2 = pathname?.startsWith("/dispatch-2");
  const basePath = isDispatch2 ? "/dispatch-2" : "/dispatch";

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"transit" | "history">("transit");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedPodImage, setSelectedPodImage] = useState<string | null>(null);

  const getExpectedDelivery = (dispatchItem: Dispatch) =>
    dispatchItem.eta || dispatchItem.salesOrder?.requestedDeliveryDate || null;

  // Query 1: Active In-Transit Dispatches
  const {
    data: dispatches = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery<Dispatch[]>({
    queryKey: ["in-transit-dispatches"],
    queryFn: async () => {
      const payload = await backendFetch<Dispatch[]>(
        "/api/backend/logistics/dispatches?status=IN_TRANSIT",
      );
      return Array.isArray(payload) ? payload : [];
    },
    refetchInterval: 30000,
  });

  // Query 2: Delivered History Dispatches
  const {
    data: historyDispatches = [],
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
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

  // Group & deduplicate by Sales Order: keep only the latest active dispatch per Sales Order
  const dedupedDispatches = React.useMemo(() => {
    const orderMap = new Map<string, Dispatch>();
    const sorted = [...dispatches].sort((a, b) => {
      const tA = new Date(a.dispatchedAt || (a as any).createdAt || 0).getTime();
      const tB = new Date(b.dispatchedAt || (b as any).createdAt || 0).getTime();
      if (tB !== tA) return tB - tA;
      return String(b.dispatchNo || "").localeCompare(String(a.dispatchNo || ""));
    });

    for (const d of sorted) {
      const soKey = d.salesOrder?.id || d.salesOrder?.orderNumber || d.id;
      if (!orderMap.has(soKey)) {
        orderMap.set(soKey, d);
      }
    }
    return Array.from(orderMap.values());
  }, [dispatches]);

  const filteredDispatches = React.useMemo(() => {
    const targetCat = isDispatch2 ? "D2" : "D1";
    const categoryFiltered = dedupedDispatches.filter((d) => {
      const cat = String((d as any).dispatchCategory || (d as any).dispatch_category || "D1").toUpperCase();
      if (targetCat === "D1") return cat === "D1" || cat === "DISPATCH 1" || cat === "DISPATCH_1";
      if (targetCat === "D2") return cat === "D2" || cat === "DISPATCH 2" || cat === "DISPATCH_2";
      return true;
    });

    if (!search.trim()) return categoryFiltered;
    const lower = search.toLowerCase();
    return categoryFiltered.filter(
      (d) =>
        d.dispatchNo?.toLowerCase().includes(lower) ||
        d.salesOrder?.orderNumber?.toLowerCase().includes(lower) ||
        d.salesOrder?.customer?.companyName?.toLowerCase().includes(lower) ||
        d.driverName?.toLowerCase().includes(lower) ||
        d.vehicleNumber?.toLowerCase().includes(lower)
    );
  }, [dedupedDispatches, search, isDispatch2]);

  const filteredHistoryDispatches = React.useMemo(() => {
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

  const handleStartDelivery = async (dispatchId: string) => {
    setLoadingId(dispatchId);
    try {
      await backendFetch(
        `/api/backend/logistics/dispatches/${dispatchId}/start-delivery`,
        {
          method: "POST",
        },
      );
      toast.success("Delivery run started — redirecting to delivery board");
      queryClient.invalidateQueries({ queryKey: ["in-transit-dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["delivery-run-dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["delivery-history-dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["pending-dispatch-unified-items"] });
      router.push(`${basePath}/delivery`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start delivery",
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleExportCsv = () => {
    if (activeTab === "transit") {
      if (!filteredDispatches.length) return;
      const exportRows = filteredDispatches.map((d) => ({
        "Dispatch No": (d.dispatchNo || "").replace(/\s+/g, ""),
        "Sales Order": d.salesOrder?.orderNumber || "—",
        Customer: d.salesOrder?.customer?.companyName || "—",
        "Driver Name": d.driverName || "—",
        "Vehicle Number": d.vehicleNumber || "—",
        "Dispatched At": d.dispatchedAt ? new Date(d.dispatchedAt).toLocaleString() : "—",
        ETA: d.eta ? new Date(d.eta).toLocaleDateString() : "—",
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
      link.download = `in_transit_dispatches_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    } else {
      if (!filteredHistoryDispatches.length) return;
      const exportRows = filteredHistoryDispatches.map((d) => ({
        "Dispatch No": (d.dispatchNo || "").replace(/\s+/g, ""),
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

      <div className={styles.inTransitPage}>
        {/* ---------- HERO ---------- */}
        <section className={styles.inTransitHero}>
          <div className={styles.inTransitHeroContent}>
            <div className={styles.inTransitHeroLabel}>Logistics Operations</div>
            <h1 className={styles.inTransitHeroTitle}>
              {activeTab === "transit" ? "Active Transit Shipments" : "Dispatch History & POD"}
            </h1>
            <p className={styles.inTransitHeroDescription}>
              {activeTab === "transit"
                ? "Monitor active shipments currently on the road. Click Start Delivery when vehicle arrives at destination area to hand off to final-mile delivery team."
                : "Review all completed and delivered shipments with verified receiver details and POD image proofs."}
            </p>
          </div>

          <div className={styles.inTransitHeroActions}>
            <div className={styles.inTransitKpi}>
              <div className={styles.inTransitKpiIcon}>
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className={styles.inTransitKpiValue}>
                  {activeTab === "transit" ? filteredDispatches.length : filteredHistoryDispatches.length}
                </div>
                <div className={styles.inTransitKpiLabel}>
                  {activeTab === "transit" ? "Active In-Transit" : "Total Delivered"}
                </div>
              </div>
            </div>

            <button
              type="button"
              className={styles.inTransitRefresh}
              onClick={() => {
                refetch();
                refetchHistory();
              }}
              disabled={isRefetching || isHistoryLoading}
            >
              <RotateCw className={`w-4 h-4 ${isRefetching || isHistoryLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </section>

        {/* ---------- SUB-TAB SWITCHER ---------- */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
          <button
            type="button"
            onClick={() => setActiveTab("transit")}
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
              background: activeTab === "transit" ? "#2563eb" : "#ffffff",
              color: activeTab === "transit" ? "#ffffff" : "#64748b",
              border: activeTab === "transit" ? "1px solid #2563eb" : "1px solid #d8e1ef",
              boxShadow: activeTab === "transit" ? "0 1px 2px rgba(37,99,235,0.2)" : "none",
            }}
          >
            <Truck size={15} />
            <span>In-Transit Queue</span>
            <span
              style={{
                padding: "1px 7px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                background: activeTab === "transit" ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                color: activeTab === "transit" ? "#ffffff" : "#475569",
              }}
            >
              {filteredDispatches.length}
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
              border: activeTab === "history" ? "1px solid #2563eb" : "1px solid #d8e1ef",
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
              {filteredHistoryDispatches.length}
            </span>
          </button>
        </div>

        {/* ---------- QUEUE HEADER & TOOLBAR ---------- */}
        <section className={styles.transitQueueCard}>
          <div className={styles.transitQueueHeader}>
            <h2 className={styles.transitQueueTitle}>
              {activeTab === "transit" ? "Transit Queue" : "Completed Deliveries"}
            </h2>
            <p className={styles.transitQueueMeta}>
              {activeTab === "transit"
                ? `Auto-refreshes every 30s · Showing ${filteredDispatches.length} active shipment${filteredDispatches.length !== 1 ? "s" : ""}`
                : `Showing ${filteredHistoryDispatches.length} completed delivery record${filteredHistoryDispatches.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className={styles.transitQueueToolbar}>
            <div className={styles.transitSearch}>
              <Search className={styles.transitSearchIcon} />
              <input
                type="text"
                placeholder={
                  activeTab === "transit"
                    ? "Search dispatch no, sales order, customer, driver or vehicle..."
                    : "Search dispatch no, order, customer, driver or receiver..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              type="button"
              className={styles.transitExport}
              onClick={handleExportCsv}
              disabled={(activeTab === "transit" ? filteredDispatches.length : filteredHistoryDispatches.length) === 0}
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </section>

        {/* ---------- TAB 1: IN TRANSIT ---------- */}
        {activeTab === "transit" && (
          <>
            {isLoading && <DispatchLoadingState count={5} />}

            {error && !isLoading && <DispatchErrorState onRetry={() => refetch()} />}

            {!isLoading && !error && filteredDispatches.length === 0 && (
              <DispatchEmptyState
                title={search ? "No Matching Transit Shipments" : "No Active Transit Shipments"}
                description={
                  search
                    ? `No active transit shipments match "${search}". Try clearing your search.`
                    : "No shipments are currently in transit. Create a dispatch gate pass from the Pending Queue to start transit runs."
                }
                onRetry={() => refetch()}
              />
            )}

            {!isLoading && !error && filteredDispatches.length > 0 && (
              <section className={styles.transitTableCard}>
                <div className={styles.transitTableScroll}>
                  <table className={styles.transitTable}>
                    <thead>
                      <tr>
                        <th>Dispatch No.</th>
                        <th>Sales Order</th>
                        <th>Customer</th>
                        <th>Driver / Vehicle</th>
                        <th>Dispatched At</th>
                        <th>Expected Delivery</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDispatches.map((dispatchItem) => {
                        const expectedDate = getExpectedDelivery(dispatchItem);
                        const isOverdue = expectedDate && new Date(expectedDate) < new Date();
                        const cleanDispNo = formatCleanNo(dispatchItem.dispatchNo);
                        const cleanSoNo = formatCleanNo(dispatchItem.salesOrder?.orderNumber);

                        return (
                          <tr key={dispatchItem.id}>
                            {/* Dispatch No */}
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
                                    maxWidth: 140,
                                  }}
                                  title={dispatchItem.salesOrder?.customer?.companyName || "—"}
                                >
                                  {dispatchItem.salesOrder?.customer?.companyName || "—"}
                                </span>
                              </div>
                            </td>

                            {/* Driver / Vehicle */}
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>
                                  {dispatchItem.driverName || "—"}
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  {dispatchItem.vehicleNumber && (
                                    <span
                                      style={{
                                        padding: "2px 6px",
                                        borderRadius: 4,
                                        background: "#eff6ff",
                                        border: "1px solid #bfdbfe",
                                        color: "#2563eb",
                                        fontFamily: "monospace",
                                        fontSize: 11,
                                        fontWeight: 700,
                                      }}
                                    >
                                      {dispatchItem.vehicleNumber}
                                    </span>
                                  )}
                                  {dispatchItem.driverPhone && (
                                    <a
                                      href={`tel:${dispatchItem.driverPhone}`}
                                      style={{ color: "#64748b", fontSize: 11, fontFamily: "monospace", textDecoration: "none" }}
                                    >
                                      · {dispatchItem.driverPhone}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Dispatched At */}
                            <td>
                              <span style={{ color: "#475569", fontSize: 12, fontWeight: 600 }}>
                                {dispatchItem.dispatchedAt
                                  ? new Date(dispatchItem.dispatchedAt).toLocaleString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "—"}
                              </span>
                            </td>

                            {/* Expected Delivery */}
                            <td>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "3px 8px",
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: isOverdue ? "#fef2f2" : "#f0fdf4",
                                  color: isOverdue ? "#b91c1c" : "#166534",
                                  border: isOverdue ? "1px solid #fecaca" : "1px solid #bbf7d0",
                                }}
                              >
                                {expectedDate
                                  ? new Date(expectedDate).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </span>
                            </td>

                            {/* Status */}
                            <td>
                              <span className={styles.transitStatus}>
                                <span className={styles.transitStatusDot} />
                                IN TRANSIT
                              </span>
                            </td>

                            {/* Actions */}
                            <td>
                              <button
                                type="button"
                                onClick={() => handleStartDelivery(dispatchItem.id)}
                                disabled={loadingId === dispatchItem.id}
                                className={styles.transitStartDelivery}
                              >
                                <Play style={{ width: 13, height: 13, fill: "currentColor" }} className={loadingId === dispatchItem.id ? "animate-spin" : ""} />
                                <span>Start Delivery</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}

        {/* ---------- TAB 2: DISPATCH HISTORY ---------- */}
        {activeTab === "history" && (
          <>
            {isHistoryLoading && <DispatchLoadingState count={5} />}

            {!isHistoryLoading && filteredHistoryDispatches.length === 0 && (
              <DispatchEmptyState
                title={search ? "No Matching History Found" : "No Completed Deliveries"}
                description={
                  search
                    ? `No delivered shipments match "${search}". Try clearing your search.`
                    : "No completed delivery runs recorded yet. Confirmed deliveries will appear here."
                }
                onRetry={() => refetchHistory()}
              />
            )}

            {!isHistoryLoading && filteredHistoryDispatches.length > 0 && (
              <section className={styles.transitTableCard}>
                <div className={styles.transitTableScroll}>
                  <table className={styles.transitTable}>
                    <thead>
                      <tr>
                        <th>Dispatch No.</th>
                        <th>Sales Order</th>
                        <th>Customer</th>
                        <th>Receiver Details</th>
                        <th>Driver / Vehicle</th>
                        <th>Delivered At</th>
                        <th style={{ textAlign: "center" }}>POD Proof</th>
                        <th style={{ textAlign: "center" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistoryDispatches.map((dispatchItem) => {
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
                                  onClick={() => setSelectedPodImage(dispatchItem.podUrl || null)}
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
                            <td style={{ textAlign: "center" }}>
                              <DispatchStatusBadge status={dispatchItem.status || "DELIVERED"} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>

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

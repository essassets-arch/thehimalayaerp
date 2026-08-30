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
} from "lucide-react";
import { toast } from "sonner";

import { backendFetch } from "@/lib/backendFetch";
import {
  DispatchPageShell,
  DispatchNavigationTabs,
  DispatchLoadingState,
  DispatchEmptyState,
  DispatchErrorState,
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
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const getExpectedDelivery = (dispatchItem: Dispatch) =>
    dispatchItem.eta || dispatchItem.salesOrder?.requestedDeliveryDate || null;

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
            <h1 className={styles.inTransitHeroTitle}>Active Transit Shipments</h1>
            <p className={styles.inTransitHeroDescription}>
              Monitor active shipments currently on the road. Click Start Delivery when vehicle arrives at destination area to hand off to final-mile delivery team.
            </p>
          </div>

          <div className={styles.inTransitHeroActions}>
            <div className={styles.inTransitKpi}>
              <div className={styles.inTransitKpiIcon}>
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className={styles.inTransitKpiValue}>{filteredDispatches.length}</div>
                <div className={styles.inTransitKpiLabel}>Active In-Transit</div>
              </div>
            </div>

            <button
              type="button"
              className={styles.inTransitRefresh}
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RotateCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </section>

        {/* ---------- QUEUE HEADER & TOOLBAR ---------- */}
        <section className={styles.transitQueueCard}>
          <div className={styles.transitQueueHeader}>
            <h2 className={styles.transitQueueTitle}>Transit Queue</h2>
            <p className={styles.transitQueueMeta}>
              Auto-refreshes every 30s · Showing {filteredDispatches.length} active shipment{filteredDispatches.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className={styles.transitQueueToolbar}>
            <div className={styles.transitSearch}>
              <Search className={styles.transitSearchIcon} />
              <input
                type="text"
                placeholder="Search dispatch no, sales order, customer, driver or vehicle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              type="button"
              className={styles.transitExport}
              onClick={handleExportCsv}
              disabled={filteredDispatches.length === 0}
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </section>

        {/* ---------- LOADING / ERROR / EMPTY STATES ---------- */}
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

        {/* ---------- TABLE CARD ---------- */}
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
      </div>
    </DispatchPageShell>
  );
}

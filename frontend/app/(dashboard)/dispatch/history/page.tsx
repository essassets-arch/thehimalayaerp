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
} from "lucide-react";

import { backendFetch } from "@/lib/backendFetch";
import {
  DispatchPageShell,
  DispatchPageHeader,
  DispatchNavigationTabs,
  DispatchToolbar,
  DispatchTableCard,
  DispatchStatusBadge,
  DispatchLoadingState,
  DispatchEmptyState,
  DispatchErrorState,
} from "../components";

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
  podUrl: string | null;
  salesOrder: SalesOrder;
}

export default function DeliveryHistoryPage() {
  const pathname = usePathname();
  const isDispatch2 = pathname?.startsWith("/dispatch-2");

  const [search, setSearch] = useState("");
  const [selectedPodImage, setSelectedPodImage] = useState<string | null>(null);

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
        d.salesOrder?.customer?.companyName?.toLowerCase().includes(lower) ||
        d.receivedBy?.toLowerCase().includes(lower) ||
        d.receiverPhone?.toLowerCase().includes(lower) ||
        d.driverName?.toLowerCase().includes(lower) ||
        d.vehicleNumber?.toLowerCase().includes(lower)
    );
  }, [dispatches, search, isDispatch2]);

  const formatCleanNo = (num?: string | null) => {
    if (!num) return "—";
    return num.replace(/\s*-\s*/g, "-").replace(/\s+/g, "");
  };

  const handleExportCsv = () => {
    if (!deliveredHistory.length) return;
    const exportRows = deliveredHistory.map((d) => ({
      "Dispatch Number": formatCleanNo(d.dispatchNo),
      "Sales Order": formatCleanNo(d.salesOrder?.orderNumber),
      Customer: d.salesOrder?.customer?.companyName || "—",
      "Received By": d.receivedBy || "—",
      "Receiver Mobile": d.receiverPhone || "—",
      Driver: d.driverName || "—",
      Vehicle: d.vehicleNumber || "—",
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
    link.download = `delivery_history_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <DispatchPageShell>
      {/* Navigation Tabs */}
      <DispatchNavigationTabs />

      {/* Page Header */}
      <DispatchPageHeader
        title="Delivery History & POD"
        description="View completed shipments that have been successfully delivered with verified proof of delivery (POD) and receiver details."
        eyebrow="Completed Logistics"
        icon={CheckCircle2}
        stats={[
          {
            label: "Total Delivered",
            value: deliveredHistory.length,
            icon: CheckCircle2,
            color: "bg-emerald-50 text-emerald-600",
          },
        ]}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Toolbar / Search Filter */}
      <DispatchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search dispatch number, order number, customer, receiver, or driver..."
        onExportCsv={deliveredHistory.length > 0 ? handleExportCsv : undefined}
        title="Completed Deliveries"
        subtitle={`Showing ${deliveredHistory.length} completed delivery record${deliveredHistory.length !== 1 ? "s" : ""}`}
      />

      {/* Loading State */}
      {isLoading && <DispatchLoadingState count={5} />}

      {/* Error State */}
      {error && !isLoading && <DispatchErrorState onRetry={() => refetch()} />}

      {/* Empty State */}
      {!isLoading && !error && deliveredHistory.length === 0 && (
        <DispatchEmptyState
          title={search ? "No Matching History Found" : "No Completed Deliveries"}
          description={
            search
              ? `No completed deliveries match "${search}". Try clearing your search filter.`
              : "No completed delivery runs recorded yet. Confirmed deliveries will appear here automatically."
          }
          onRetry={() => refetch()}
        />
      )}

      {/* Table Card */}
      {!isLoading && !error && deliveredHistory.length > 0 && (
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
              {deliveredHistory.map((dispatchItem) => {
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

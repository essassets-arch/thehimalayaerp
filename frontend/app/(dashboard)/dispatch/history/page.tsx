"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, User } from "lucide-react";

import { backendFetch } from "@/lib/backendFetch";
import {
  DispatchPageShell,
  DispatchPageHeader,
  DispatchNavigationTabs,
  DispatchToolbar,
  DispatchTableCard,
  SalesOrderNumberBadge,
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
  deliveredAt: string | null;
  salesOrder: SalesOrder;
}

export default function DeliveryHistoryPage() {
  const [search, setSearch] = useState("");

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
  });

  const deliveredHistory = useMemo(() => {
    const list = dispatches.filter(
      (d) => String(d.status || "").toUpperCase() === "DELIVERED"
    );
    if (!search.trim()) return list;
    const lower = search.toLowerCase();
    return list.filter(
      (d) =>
        d.dispatchNo?.toLowerCase().includes(lower) ||
        d.salesOrder?.orderNumber?.toLowerCase().includes(lower) ||
        d.salesOrder?.customer?.companyName?.toLowerCase().includes(lower) ||
        d.receivedBy?.toLowerCase().includes(lower)
    );
  }, [dispatches, search]);

  const handleExportCsv = () => {
    if (!deliveredHistory.length) return;
    const exportRows = deliveredHistory.map((d) => ({
      "Dispatch Number": d.dispatchNo,
      "Sales Order": d.salesOrder?.orderNumber || "—",
      Customer: d.salesOrder?.customer?.companyName || "—",
      "Received By": d.receivedBy || "—",
      "Delivered Timestamp": d.deliveredAt ? new Date(d.deliveredAt).toLocaleString() : "—",
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
        title="Delivery History"
        description="View completed shipments that have been successfully delivered to customers with full POD proofs."
        eyebrow="Completed Logistics"
        icon={CheckCircle2}
        stats={[
          { label: "Total Delivered", value: deliveredHistory.length, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
        ]}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Toolbar / Search Filter */}
      <DispatchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search dispatch number, order number, customer or receiver..."
        onExportCsv={deliveredHistory.length > 0 ? handleExportCsv : undefined}
        title="Completed Log"
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
              : "No completed delivery runs recorded yet. Confirmed deliveries will appear here."
          }
          onRetry={() => refetch()}
        />
      )}

      {/* Table & Mobile Cards */}
      {!isLoading && !error && deliveredHistory.length > 0 && (
        <>
          {/* Desktop Table View (≥ 768px) */}
          <div className="hidden md:block">
            <DispatchTableCard minTableWidth={1000}>
              <table className="w-full text-sm text-left border-collapse no-mobile-stack">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="dsp-th">
                      Dispatch Number
                    </th>
                    <th className="dsp-th">
                      Sales Order
                    </th>
                    <th className="dsp-th">
                      Customer
                    </th>
                    <th className="dsp-th">
                      Received By
                    </th>
                    <th className="dsp-th">
                      Delivery Timestamp
                    </th>
                    <th className="dsp-th text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {deliveredHistory.map((dispatchItem) => (
                    <tr
                      key={dispatchItem.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      {/* Dispatch Number */}
                      <td className="dsp-td">
                        <SalesOrderNumberBadge orderNumber={dispatchItem.dispatchNo} />
                      </td>

                      {/* Sales Order */}
                      <td className="dsp-td">
                        <span className="font-semibold text-slate-900 text-sm">
                          #{dispatchItem.salesOrder?.orderNumber || "N/A"}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="dsp-td">
                        <span
                          className="font-semibold text-slate-900 text-sm tracking-tight block max-w-[220px] truncate"
                          title={dispatchItem.salesOrder?.customer?.companyName || "N/A"}
                        >
                          {dispatchItem.salesOrder?.customer?.companyName || "N/A"}
                        </span>
                      </td>

                      {/* Received By */}
                      <td className="dsp-td">
                        <span className="text-slate-800 font-medium text-sm">
                          {dispatchItem.receivedBy || "N/A"}
                        </span>
                      </td>

                      {/* Delivery Timestamp */}
                      <td className="dsp-td">
                        <span className="text-slate-700 text-sm font-medium">
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
                      </td>

                      {/* Status */}
                      <td className="dsp-td text-center">
                        <DispatchStatusBadge status={dispatchItem.status || "DELIVERED"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DispatchTableCard>
          </div>

          {/* Mobile Cards View (< 768px) */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 dispatch-mobile-card-grid">
            {deliveredHistory.map((dispatchItem) => (
              <div key={dispatchItem.id} className="dsp-card">
                {/* Card Header */}
                <div className="dsp-card-head">
                  <div className="dsp-card-head-row">
                    <SalesOrderNumberBadge orderNumber={dispatchItem.dispatchNo} />
                    <DispatchStatusBadge status={dispatchItem.status || "DELIVERED"} />
                  </div>
                  {dispatchItem.salesOrder?.orderNumber && (
                    <span className="dsp-card-so">
                      Sales Order: #{dispatchItem.salesOrder.orderNumber}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="dsp-card-body">
                  {/* Customer */}
                  <div className="dsp-card-row">
                    <div className="dsp-card-icon">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="dsp-card-info">
                      <p className="dsp-card-label">Customer</p>
                      <p className="dsp-card-value truncate max-w-[240px]">
                        {dispatchItem.salesOrder?.customer?.companyName || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Received By */}
                  <div className="flex flex-col pt-2 border-t border-slate-100">
                    <span className="dsp-card-label">Received By</span>
                    <span className="text-sm font-semibold text-slate-800 mt-0.5">{dispatchItem.receivedBy || "N/A"}</span>
                  </div>

                  {/* Delivered At */}
                  <div className="flex flex-col pt-1">
                    <span className="dsp-card-label">Delivered Timestamp</span>
                    <span className="text-sm font-semibold text-slate-600 mt-0.5">
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
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </DispatchPageShell>
  );
}

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
            <DispatchTableCard minTableWidth={960}>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200">
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap min-w-[160px]">
                      Dispatch Number
                    </th>
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap min-w-[140px]">
                      Sales Order
                    </th>
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap min-w-[180px]">
                      Customer
                    </th>
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap min-w-[140px]">
                      Received By
                    </th>
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap min-w-[180px]">
                      Delivery Timestamp
                    </th>
                    <th className="text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap min-w-[140px]">
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
                      <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                        <SalesOrderNumberBadge orderNumber={dispatchItem.dispatchNo} />
                      </td>

                      {/* Sales Order */}
                      <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                        <span className="font-semibold text-slate-900 text-xs">
                          #{dispatchItem.salesOrder?.orderNumber || "N/A"}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                        <span
                          className="font-semibold text-slate-900 text-xs tracking-tight block max-w-[200px] truncate"
                          title={dispatchItem.salesOrder?.customer?.companyName || "N/A"}
                        >
                          {dispatchItem.salesOrder?.customer?.companyName || "N/A"}
                        </span>
                      </td>

                      {/* Received By */}
                      <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                        <span className="text-slate-800 font-medium text-xs">
                          {dispatchItem.receivedBy || "N/A"}
                        </span>
                      </td>

                      {/* Delivery Timestamp */}
                      <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                        <span className="text-slate-600 text-xs font-medium">
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
                      <td className="px-4 py-3.5 whitespace-nowrap text-center align-middle">
                        <DispatchStatusBadge status={dispatchItem.status || "DELIVERED"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DispatchTableCard>
          </div>

          {/* Mobile Cards View (< 768px) */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {deliveredHistory.map((dispatchItem) => (
              <div
                key={dispatchItem.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <SalesOrderNumberBadge orderNumber={dispatchItem.dispatchNo} />
                    <span className="text-xs font-semibold text-slate-600">
                      #{dispatchItem.salesOrder?.orderNumber || "N/A"}
                    </span>
                  </div>
                  <DispatchStatusBadge status={dispatchItem.status || "DELIVERED"} />
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Customer */}
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-400 shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Customer</p>
                      <p className="text-xs font-semibold text-slate-900 m-0 truncate">
                        {dispatchItem.salesOrder?.customer?.companyName || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Received By */}
                  <div className="flex flex-col pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Received By</span>
                    <span className="text-xs font-medium text-slate-800">{dispatchItem.receivedBy || "N/A"}</span>
                  </div>

                  {/* Delivered At */}
                  <div className="flex flex-col pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivered Timestamp</span>
                    <span className="text-xs font-medium text-slate-600">
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

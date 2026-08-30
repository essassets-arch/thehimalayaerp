"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import {
  Truck,
  Navigation,
  Play,
  User,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

import { backendFetch } from "@/lib/backendFetch";
import {
  DispatchPageShell,
  DispatchPageHeader,
  DispatchNavigationTabs,
  DispatchToolbar,
  DispatchTableCard,
  SalesOrderNumberBadge,
  DispatchStatusBadge,
  DispatchActionButton,
  DispatchLoadingState,
  DispatchEmptyState,
  DispatchErrorState,
} from "../components";

interface Customer {
  companyName: string;
}

interface SalesOrder {
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

      {/* Page Header */}
      <DispatchPageHeader
        title="Active Transit Shipments"
        description="Monitor active shipments currently on the road. Click Start Delivery when vehicle arrives at destination area to hand off to final-mile delivery team."
        eyebrow="Logistics Operations"
        icon={Navigation}
        stats={[
          { label: "Active In-Transit", value: filteredDispatches.length, icon: Truck, color: "bg-sky-50 text-sky-600" },
        ]}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Toolbar / Search Filter */}
      <DispatchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search dispatch no, sales order, customer, driver or vehicle..."
        onExportCsv={filteredDispatches.length > 0 ? handleExportCsv : undefined}
        title="Transit Queue"
        subtitle={`Auto-refreshes every 30s · Showing ${filteredDispatches.length} active shipment${filteredDispatches.length !== 1 ? "s" : ""}`}
      />

      {/* Loading State */}
      {isLoading && <DispatchLoadingState count={5} />}

      {/* Error State */}
      {error && !isLoading && <DispatchErrorState onRetry={() => refetch()} />}

      {/* Empty State */}
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

      {/* Table & Mobile Cards */}
      {!isLoading && !error && filteredDispatches.length > 0 && (
        <>
          {/* Desktop Table View (≥ 768px) */}
          <div className="hidden md:block">
            <DispatchTableCard minTableWidth={1150}>
              <table className="w-full text-sm text-left border-collapse no-mobile-stack">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 px-6 py-4 whitespace-nowrap min-w-[180px]">
                      Dispatch No.
                    </th>
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 px-5 py-4 whitespace-nowrap min-w-[160px]">
                      Sales Order
                    </th>
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 px-5 py-4 whitespace-nowrap min-w-[200px]">
                      Customer
                    </th>
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 px-5 py-4 whitespace-nowrap min-w-[220px]">
                      Driver / Vehicle
                    </th>
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 px-5 py-4 whitespace-nowrap min-w-[180px]">
                      Dispatched At
                    </th>
                    <th className="text-left text-xs font-bold uppercase tracking-wider text-slate-500 px-5 py-4 whitespace-nowrap min-w-[170px]">
                      Expected Delivery
                    </th>
                    <th className="text-center text-xs font-bold uppercase tracking-wider text-slate-500 px-4 py-4 whitespace-nowrap min-w-[140px]">
                      Status
                    </th>
                    <th className="text-right text-xs font-bold uppercase tracking-wider text-slate-500 px-6 py-4 whitespace-nowrap min-w-[170px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredDispatches.map((dispatchItem) => {
                    const expectedDate = getExpectedDelivery(dispatchItem);
                    const isOverdue = expectedDate && new Date(expectedDate) < new Date();
                    const cleanDispNo = formatCleanNo(dispatchItem.dispatchNo);
                    const cleanSoNo = formatCleanNo(dispatchItem.salesOrder?.orderNumber);

                    return (
                      <tr
                        key={dispatchItem.id}
                        className="hover:bg-slate-50/90 transition-colors group"
                      >
                        {/* Dispatch No */}
                        <td className="px-6 py-4 whitespace-nowrap align-middle">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50/80 border border-indigo-200 text-indigo-700 font-bold text-xs tracking-tight shadow-2xs font-mono">
                            <Truck className="w-3.5 h-3.5 text-indigo-500" />
                            #{cleanDispNo}
                          </span>
                        </td>

                        {/* Sales Order */}
                        <td className="px-5 py-4 whitespace-nowrap align-middle">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs font-mono">
                            #{cleanSoNo}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4 whitespace-nowrap align-middle">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center uppercase">
                              {(dispatchItem.salesOrder?.customer?.companyName || "C")[0]}
                            </div>
                            <span
                              className="font-bold text-slate-900 text-sm tracking-tight block max-w-[200px] truncate"
                              title={dispatchItem.salesOrder?.customer?.companyName || "—"}
                            >
                              {dispatchItem.salesOrder?.customer?.companyName || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Driver / Vehicle */}
                        <td className="px-5 py-4 whitespace-nowrap align-middle">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-900 font-bold text-sm">
                              {dispatchItem.driverName || "—"}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {dispatchItem.vehicleNumber && (
                                <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-bold">
                                  {dispatchItem.vehicleNumber}
                                </span>
                              )}
                              {dispatchItem.driverPhone && (
                                <a
                                  href={`tel:${dispatchItem.driverPhone}`}
                                  className="text-slate-500 hover:text-blue-600 text-xs font-mono transition-colors"
                                >
                                  · {dispatchItem.driverPhone}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Dispatched At */}
                        <td className="px-5 py-4 whitespace-nowrap align-middle">
                          <span className="text-slate-700 text-xs font-semibold">
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
                        <td className="px-5 py-4 whitespace-nowrap align-middle">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                              isOverdue
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
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
                        <td className="px-4 py-4 whitespace-nowrap text-center align-middle">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                            IN TRANSIT
                          </span>
                        </td>

                        {/* Action Button */}
                        <td className="px-6 py-4 whitespace-nowrap text-right align-middle">
                          <button
                            type="button"
                            onClick={() => handleStartDelivery(dispatchItem.id)}
                            disabled={loadingId === dispatchItem.id}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Play className={`w-3.5 h-3.5 fill-current ${loadingId === dispatchItem.id ? "animate-spin" : ""}`} />
                            <span>Start Delivery</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </DispatchTableCard>
          </div>

          {/* Mobile Cards View (< 768px) */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 dispatch-mobile-card-grid">
            {filteredDispatches.map((dispatchItem) => {
              const expectedDate = getExpectedDelivery(dispatchItem);
              const isOverdue = expectedDate && new Date(expectedDate) < new Date();
              const cleanDispNo = formatCleanNo(dispatchItem.dispatchNo);
              const cleanSoNo = formatCleanNo(dispatchItem.salesOrder?.orderNumber);

              return (
                <div key={dispatchItem.id} className="dsp-card bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs font-mono">
                      #{cleanDispNo}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                      IN TRANSIT
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="space-y-2.5 text-xs">
                    {cleanSoNo && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Sales Order</span>
                        <span className="font-bold text-slate-800 font-mono">#{cleanSoNo}</span>
                      </div>
                    )}

                    {/* Customer */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Customer</span>
                      <span className="font-bold text-slate-900 truncate max-w-[180px]">
                        {dispatchItem.salesOrder?.customer?.companyName || "—"}
                      </span>
                    </div>

                    {/* Driver & Vehicle */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Driver / Vehicle</span>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 m-0">{dispatchItem.driverName || "—"}</p>
                        {dispatchItem.vehicleNumber && (
                          <p className="text-2xs font-mono font-bold text-blue-600 m-0">{dispatchItem.vehicleNumber}</p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {dispatchItem.deliveryAddress && (
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-slate-500 font-medium mb-0.5">Delivery Address</p>
                        <p className="text-slate-700 font-normal leading-relaxed">{dispatchItem.deliveryAddress}</p>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div>
                        <p className="text-slate-500 font-medium m-0">Dispatched</p>
                        <p className="font-bold text-slate-800 m-0 mt-0.5">
                          {dispatchItem.dispatchedAt
                            ? new Date(dispatchItem.dispatchedAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                              })
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium m-0">Expected Delivery</p>
                        <p className={`font-bold m-0 mt-0.5 ${isOverdue ? "text-red-600" : "text-slate-800"}`}>
                          {expectedDate
                            ? new Date(expectedDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleStartDelivery(dispatchItem.id)}
                      disabled={loadingId === dispatchItem.id}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Play className={`w-3.5 h-3.5 fill-current ${loadingId === dispatchItem.id ? "animate-spin" : ""}`} />
                      <span>Start Delivery</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </DispatchPageShell>
  );
}

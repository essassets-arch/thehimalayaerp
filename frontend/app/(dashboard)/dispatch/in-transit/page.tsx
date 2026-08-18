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

  const filteredDispatches = React.useMemo(() => {
    if (!search.trim()) return dispatches;
    const lower = search.toLowerCase();
    return dispatches.filter(
      (d) =>
        d.dispatchNo?.toLowerCase().includes(lower) ||
        d.salesOrder?.orderNumber?.toLowerCase().includes(lower) ||
        d.salesOrder?.customer?.companyName?.toLowerCase().includes(lower) ||
        d.driverName?.toLowerCase().includes(lower) ||
        d.vehicleNumber?.toLowerCase().includes(lower)
    );
  }, [dispatches, search]);

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
          { label: "Active In-Transit", value: dispatches.length, icon: Truck, color: "bg-sky-50 text-sky-600" },
        ]}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Toolbar / Search Filter */}
      <DispatchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search dispatch no, sales order, customer, driver or vehicle..."
        title="Transit Queue"
        subtitle={`Auto-refreshes every 30s · Showing ${filteredDispatches.length} shipment${filteredDispatches.length !== 1 ? "s" : ""}`}
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
            <DispatchTableCard minTableWidth={1100}>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200">
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap min-w-[160px]">
                      Dispatch No.
                    </th>
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap min-w-[140px]">
                      Sales Order
                    </th>
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap min-w-[180px]">
                      Customer
                    </th>
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap min-w-[180px]">
                      Driver / Vehicle
                    </th>
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap min-w-[160px]">
                      Dispatched At
                    </th>
                    <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap min-w-[150px]">
                      Expected Delivery
                    </th>
                    <th className="text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap min-w-[140px]">
                      Status
                    </th>
                    <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap min-w-[160px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredDispatches.map((dispatchItem) => {
                    const expectedDate = getExpectedDelivery(dispatchItem);
                    const isOverdue = expectedDate && new Date(expectedDate) < new Date();
                    return (
                      <tr
                        key={dispatchItem.id}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        {/* Dispatch No */}
                        <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                          <SalesOrderNumberBadge orderNumber={dispatchItem.dispatchNo} />
                        </td>

                        {/* Sales Order */}
                        <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                          <span className="font-semibold text-slate-900 text-xs">
                            #{dispatchItem.salesOrder?.orderNumber}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                          <span
                            className="font-semibold text-slate-900 text-xs tracking-tight block max-w-[200px] truncate"
                            title={dispatchItem.salesOrder?.customer?.companyName || "—"}
                          >
                            {dispatchItem.salesOrder?.customer?.companyName || "—"}
                          </span>
                        </td>

                        {/* Driver / Vehicle */}
                        <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                          <div className="flex flex-col">
                            <span className="text-slate-900 font-semibold text-xs">
                              {dispatchItem.driverName || "—"}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {dispatchItem.vehicleNumber && (
                                <span className="text-indigo-600 font-mono text-[11px] font-bold">
                                  {dispatchItem.vehicleNumber}
                                </span>
                              )}
                              {dispatchItem.driverPhone && (
                                <span className="text-slate-400 text-[11px] font-mono">
                                  · {dispatchItem.driverPhone}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Dispatched At */}
                        <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                          <span className="text-slate-600 text-xs font-medium">
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
                        <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                          <span
                            className={`text-xs font-semibold ${
                              isOverdue ? "text-red-600" : "text-slate-700"
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
                        <td className="px-4 py-3.5 whitespace-nowrap text-center align-middle">
                          <DispatchStatusBadge status={dispatchItem.status} />
                        </td>

                        {/* Action Button */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-right align-middle">
                          <DispatchActionButton
                            label="Start Delivery"
                            icon={Play}
                            onClick={() => handleStartDelivery(dispatchItem.id)}
                            loading={loadingId === dispatchItem.id}
                            variant="primary"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </DispatchTableCard>
          </div>

          {/* Mobile Cards View (< 768px) */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredDispatches.map((dispatchItem) => {
              const expectedDate = getExpectedDelivery(dispatchItem);
              const isOverdue = expectedDate && new Date(expectedDate) < new Date();
              return (
                <div
                  key={dispatchItem.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <SalesOrderNumberBadge orderNumber={dispatchItem.dispatchNo} />
                      <span className="text-xs font-semibold text-slate-600">
                        #{dispatchItem.salesOrder?.orderNumber}
                      </span>
                    </div>
                    <DispatchStatusBadge status={dispatchItem.status} />
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
                          {dispatchItem.salesOrder?.customer?.companyName || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {dispatchItem.deliveryAddress && (
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-400 shrink-0 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Delivery Address</p>
                          <p className="text-xs text-slate-600 m-0 leading-relaxed">{dispatchItem.deliveryAddress}</p>
                        </div>
                      </div>
                    )}

                    {/* Driver & Vehicle */}
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-400 shrink-0 mt-0.5">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Driver / Vehicle</p>
                        <p className="text-xs font-medium text-slate-800 m-0">
                          {dispatchItem.driverName || "—"} {dispatchItem.driverPhone ? `· ${dispatchItem.driverPhone}` : ""}
                        </p>
                        {dispatchItem.vehicleNumber && (
                          <p className="text-xs font-bold text-indigo-600 font-mono m-0 mt-0.5">
                            {dispatchItem.vehicleNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Dispatched</p>
                        <p className="text-xs font-medium text-slate-700 m-0">
                          {dispatchItem.dispatchedAt
                            ? new Date(dispatchItem.dispatchedAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                              })
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Expected Delivery</p>
                        <p className={`text-xs font-semibold m-0 ${isOverdue ? "text-red-600" : "text-slate-700"}`}>
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
                  <div className="p-3 bg-slate-50/50 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleStartDelivery(dispatchItem.id)}
                      disabled={loadingId === dispatchItem.id}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Play className={`w-4 h-4 ${loadingId === dispatchItem.id ? "animate-spin" : ""}`} />
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

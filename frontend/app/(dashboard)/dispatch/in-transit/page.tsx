"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import {
  Truck,
  Navigation,
  Play,
  Clock,
  User,
  Calendar,
  MapPin,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/erp/common/StatusBadge";
import { backendFetch } from "@/lib/backendFetch";
import { Button } from "@/components/ui/button";
import { DispatchNavigationTabs } from "../components/DispatchNavigationTabs";
import responsive from "../dispatch-responsive.module.css";
import pageStyles from "../orders/orders.module.css";

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

  const getExpectedDelivery = (dispatch: Dispatch) =>
    dispatch.eta || dispatch.salesOrder?.requestedDeliveryDate || null;

  const {
    data: dispatches = [],
    isLoading,
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
    refetchInterval: 30000, // auto-refresh every 30s
  });

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
    <div className={responsive.flushPage}>
      <div className={responsive.content}>
        {/* Navigation Tabs */}
        <DispatchNavigationTabs activeTab="in-transit" counts={{ inTransit: dispatches.length }} />

        {/* ── Page Header ── */}
        <div className={pageStyles.header}>
          <div className={pageStyles.headerMain}>
            {/* Background watermark */}
            <div className={pageStyles.watermark}>
              <Truck size={160} />
            </div>

            <div className={pageStyles.headerLayout}>
              {/* Left: Title + description */}
              <div className={pageStyles.headerCopy}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={pageStyles.eyebrow}>
                    <Navigation className="h-3 w-3" />
                    Logistics
                  </span>
                </div>
                <h1 className={pageStyles.title}>Active Shipments</h1>
                <p className={pageStyles.description}>
                  Monitor shipments currently in transit. Click{" "}
                  <span className="font-semibold text-indigo-600">
                    Start Delivery
                  </span>{" "}
                  when the vehicle reaches the destination area to hand off to
                  the final-mile delivery team.
                </p>
              </div>

              {/* Right: Stats */}
              <div className={pageStyles.summary}>
                <div className={pageStyles.summaryCount}>
                  <strong>{dispatches.length}</strong>
                  <span>In Transit</span>
                </div>
                <div className={pageStyles.divider} />
                <button
                  onClick={() => refetch()}
                  className={pageStyles.refresh}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Status strip */}
          <div className={pageStyles.headerFooter}>
            <p>
              Auto-refreshes every 30 seconds &nbsp;·&nbsp; Showing{" "}
              {dispatches.length} active shipment
              {dispatches.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* ── Loading / Error States ── */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-center py-20 gap-3 text-sm text-gray-500">
            <Clock className="animate-spin h-5 w-5 text-indigo-500" />
            Loading active transit shipments...
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-red-700">
              Failed to load transit data
            </p>
            <p className="text-xs text-red-500">
              Please check connectivity or permissions.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-3 text-red-600 border-red-200"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* ── Empty State ── */}
        {!isLoading && !error && dispatches.length === 0 && (
          <div className={pageStyles.stateCard}>
            <div className={pageStyles.stateContent}>
              <div className={pageStyles.stateIcon}>
                <Truck className="h-8 w-8" />
              </div>
              <h3>No Active Shipments</h3>
              <p>
                No shipments are currently in transit. Create a dispatch from
                the Pending Dispatch queue to get started.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`${basePath}/orders`)}
              >
                Go to Pending Queue
              </Button>
            </div>
          </div>
        )}

        {/* ── Desktop Table View ── */}
        {!isLoading && !error && dispatches.length > 0 && (
          <>
            {/* Desktop: Scrollable Table */}
            <div className={pageStyles.desktopTable}>
              <div className={pageStyles.tableScroll}>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200">
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap">
                        Dispatch No.
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap">
                        Sales Order
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap">
                        Customer
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap">
                        Driver / Vehicle
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap">
                        Dispatched At
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap">
                        Expected Delivery
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap">
                        Status
                      </th>
                      <th className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {dispatches.map((dispatch) => (
                      <tr
                        key={dispatch.id}
                        className="hover:bg-indigo-50/20 transition-colors group"
                      >
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-semibold text-indigo-700 text-xs tracking-tight bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200/60 inline-flex items-center shrink-0">
                            {dispatch.dispatchNo}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-semibold text-slate-900 text-xs">
                            #{dispatch.salesOrder?.orderNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className="font-medium text-slate-800 text-xs block max-w-[180px] truncate"
                            title={dispatch.salesOrder?.customer?.companyName}
                          >
                            {dispatch.salesOrder?.customer?.companyName}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-slate-800 font-semibold text-xs">
                              {dispatch.driverName || "—"}
                            </span>
                            {dispatch.driverPhone && (
                              <span className="text-slate-500 text-[11px] font-mono">
                                {dispatch.driverPhone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-slate-600 text-xs font-medium">
                            {dispatch.dispatchedAt
                              ? new Date(dispatch.dispatchedAt).toLocaleString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`text-xs font-mono font-semibold ${
                              getExpectedDelivery(dispatch) &&
                              new Date(getExpectedDelivery(dispatch)!) < new Date()
                                ? "text-red-600"
                                : "text-slate-700"
                            }`}
                          >
                            {getExpectedDelivery(dispatch)
                              ? new Date(getExpectedDelivery(dispatch)!).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusBadge status={dispatch.status} />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          <Button
                            size="sm"
                            onClick={() => handleStartDelivery(dispatch.id)}
                            disabled={loadingId === dispatch.id}
                            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ml-auto"
                          >
                            {loadingId === dispatch.id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                            Start Delivery
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile: Card View */}
            <div className={pageStyles.mobileCards}>
              {dispatches.map((dispatch) => (
                <div
                  key={dispatch.id}
                  className={pageStyles.shipmentCard}
                >
                  {/* Card Header */}
                  <div className={pageStyles.shipmentCardHeader}>
                    <div className={pageStyles.shipmentIdentity}>
                      <span className="font-bold text-indigo-600 font-mono text-xs tracking-wide">
                        {dispatch.dispatchNo}
                      </span>
                      <span className="text-gray-400 mx-1.5">·</span>
                      <span className="text-xs font-semibold text-gray-600">
                        #{dispatch.salesOrder?.orderNumber}
                      </span>
                    </div>
                    <StatusBadge status={dispatch.status} />
                  </div>

                  {/* Card Body */}
                  <div className={pageStyles.shipmentCardBody}>
                    {/* Customer */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Customer
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {dispatch.salesOrder?.customer?.companyName}
                        </p>
                      </div>
                    </div>

                    {/* Delivery address */}
                    {dispatch.deliveryAddress && (
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Delivery To
                          </p>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {dispatch.deliveryAddress}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Driver + Vehicle */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Truck className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Driver / Vehicle
                        </p>
                        {dispatch.driverName && (
                          <p className="text-sm text-gray-700 font-medium">
                            {dispatch.driverName} ·{" "}
                            {dispatch.driverPhone || "No phone"}
                          </p>
                        )}
                        {dispatch.vehicleNumber && (
                          <p className="text-[11px] font-mono text-indigo-600 mt-0.5">
                            {dispatch.vehicleNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className={pageStyles.dateGrid}>
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Dispatched
                          </p>
                          <p className="text-xs font-medium text-gray-700">
                            {dispatch.dispatchedAt
                              ? new Date(
                                  dispatch.dispatchedAt,
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                })
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            getExpectedDelivery(dispatch) &&
                            new Date(getExpectedDelivery(dispatch)!) < new Date()
                              ? "bg-red-50"
                              : "bg-gray-100"
                          }`}
                        >
                          <Clock
                            className={`h-3.5 w-3.5 ${
                              getExpectedDelivery(dispatch) &&
                              new Date(getExpectedDelivery(dispatch)!) < new Date()
                                ? "text-red-400"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Expected Delivery
                          </p>
                          <p
                            className={`text-xs font-semibold font-mono ${
                              getExpectedDelivery(dispatch) &&
                              new Date(getExpectedDelivery(dispatch)!) < new Date()
                                ? "text-red-500"
                                : "text-gray-700"
                            }`}
                          >
                            {getExpectedDelivery(dispatch)
                              ? new Date(getExpectedDelivery(dispatch)!).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                  },
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Action */}
                  <div className={pageStyles.shipmentCardFooter}>
                    <Button
                      size="sm"
                      onClick={() => handleStartDelivery(dispatch.id)}
                      disabled={loadingId === dispatch.id}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 text-xs font-semibold w-full justify-center"
                    >
                      {loadingId === dispatch.id ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                      Start Delivery
                      <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

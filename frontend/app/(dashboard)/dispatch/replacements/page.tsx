"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  RefreshCw,
  Truck,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  Package,
  ArrowRight,
  Filter,
  Play,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/erp/common/StatusBadge";
import { backendFetch } from "@/lib/backendFetch";
import { Button } from "@/components/ui/button";
import { DispatchNavigationTabs } from "../components/DispatchNavigationTabs";
import responsive from "../dispatch-responsive.module.css";
import pageStyles from "../orders/orders.module.css";

interface ReplacementItem {
  id: string;
  replacementNo?: string;
  orderNumber?: string;
  customerName?: string;
  deliveryAddress?: string;
  productName?: string;
  quantity?: number | string;
  status: string;
  reason?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  driverName?: string;
  vehicleNumber?: string;
  salesOrder?: {
    orderNumber?: string;
    customer?: { companyName?: string };
  };
}

export default function DispatchReplacementsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const isDispatch2 = pathname?.startsWith("/dispatch-2");
  const basePath = isDispatch2 ? "/dispatch-2" : "/dispatch";

  const rawStatus = searchParams?.get("status") || "all";
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Normalize status parameter: 'in-transit' -> 'IN_TRANSIT', 'delivered' -> 'DELIVERED', 'all' -> 'ALL'
  const activeStatusFilter = useMemo(() => {
    const s = rawStatus.toLowerCase().replace(/-/g, "_");
    if (s === "in_transit") return "IN_TRANSIT";
    if (s === "delivered") return "DELIVERED";
    if (s === "pending" || s === "requested" || s === "approved") return "PENDING";
    return "ALL";
  }, [rawStatus]);

  const {
    data: replacements = [],
    isLoading,
    error,
    refetch,
  } = useQuery<ReplacementItem[]>({
    queryKey: ["dispatch-replacements-list"],
    queryFn: async () => {
      const res = await backendFetch<any>("/api/backend/logistics/dispatches/replacements")
        .catch(() => backendFetch<any>("/api/backend/replacements"))
        .catch(() => []);
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      return list;
    },
    refetchInterval: 30000,
  });

  const filteredReplacements = useMemo(() => {
    return replacements.filter((item) => {
      const s = String(item.status || "").toUpperCase();
      if (activeStatusFilter === "IN_TRANSIT") {
        return s === "IN_TRANSIT" || s === "OUT_FOR_DELIVERY" || s === "DISPATCHED";
      }
      if (activeStatusFilter === "DELIVERED") {
        return s === "DELIVERED" || s === "COMPLETED";
      }
      if (activeStatusFilter === "PENDING") {
        return s === "REQUESTED" || s === "APPROVED" || s === "PENDING" || s === "READY_FOR_DISPATCH";
      }
      return true; // 'ALL'
    });
  }, [replacements, activeStatusFilter]);

  const handleFilterClick = (statusKey: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (statusKey === "all") {
      params.delete("status");
    } else {
      params.set("status", statusKey);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAction = async (item: ReplacementItem, actionType: "transit" | "deliver") => {
    setLoadingId(item.id);
    try {
      if (actionType === "transit") {
        await backendFetch(`/api/backend/replacements/${item.id}/in-transit`, { method: "PATCH" })
          .catch(() => backendFetch(`/api/backend/logistics/dispatches/${item.id}/start-delivery`, { method: "POST" }));
        toast.success(`Replacement ${item.replacementNo || item.id} marked as In Transit`);
      } else {
        await backendFetch(`/api/backend/replacements/${item.id}/deliver`, { method: "PATCH", body: { deliveredAt: new Date().toISOString() } })
          .catch(() => backendFetch(`/api/backend/logistics/dispatches/${item.id}/confirm-delivery`, { method: "POST", body: { receiverName: "Customer Received", receiverPhone: "N/A" } }));
        toast.success(`Replacement ${item.replacementNo || item.id} marked as Delivered`);
      }
      queryClient.invalidateQueries({ queryKey: ["dispatch-replacements-list"] });
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : "Failed to update replacement status");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className={responsive.flushPage}>
      <div className={responsive.content}>
        {/* Navigation Tabs */}
        <DispatchNavigationTabs activeTab="replacements" />

        {/* Header Card */}
        <div className={pageStyles.header}>
          <div className={pageStyles.headerMain}>
            <div className={pageStyles.watermark}>
              <RotateCcw size={160} />
            </div>

            <div className={pageStyles.headerLayout}>
              <div className={pageStyles.headerCopy}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={pageStyles.eyebrow}>
                    <RefreshCw className="h-3 w-3" />
                    Logistics & After-Sales
                  </span>
                </div>
                <h1 className={pageStyles.title}>Replacement Dispatches</h1>
                <p className={pageStyles.description}>
                  Manage replacement order dispatches, monitor in-transit shipments, and confirm final deliveries.
                </p>
              </div>

              <div className={pageStyles.summary}>
                <div className={pageStyles.summaryCount}>
                  <strong>{filteredReplacements.length}</strong>
                  <span>{activeStatusFilter.replace("_", " ")}</span>
                </div>
                <div className={pageStyles.divider} />
                <button onClick={() => refetch()} className={pageStyles.refresh}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className={pageStyles.headerFooter}>
            <p>
              Auto-refreshes every 30 seconds &nbsp;·&nbsp; Showing {filteredReplacements.length} replacement
              {filteredReplacements.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center gap-2 mt-4 mb-2 overflow-x-auto scrollbar-thin">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="h-3.5 w-3.5" /> Filter Status:
          </span>
          <button
            onClick={() => handleFilterClick("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              rawStatus === "all" || !searchParams?.get("status")
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Replacements
          </button>
          <button
            onClick={() => handleFilterClick("in-transit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              rawStatus === "in-transit"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            In Transit
          </button>
          <button
            onClick={() => handleFilterClick("delivered")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              rawStatus === "delivered"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Delivered
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className={pageStyles.loadingCard}>
            <div className={pageStyles.loadingSpinner}>
              <Clock className="animate-spin h-6 w-6 text-indigo-600" />
            </div>
            <div className={pageStyles.loadingText}>
              <h4>Loading Replacement Orders</h4>
              <p>Fetching logistics replacement shipments...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className={pageStyles.stateCard}>
            <div className={pageStyles.stateContent}>
              <h3>Failed to Load Replacements</h3>
              <p>Please check your network connection or role permissions.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2 text-indigo-600 border-indigo-200"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredReplacements.length === 0 && (
          <div className={pageStyles.stateCard}>
            <div className={pageStyles.stateContent}>
              <div className={pageStyles.stateIcon}>
                <Package className="h-7 w-7 text-indigo-600" />
              </div>
              <h3>No Replacements Found</h3>
              <p>
                No replacement shipments match the current status filter ({activeStatusFilter.replace("_", " ")}).
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterClick("all")}
                className="mt-2 text-indigo-600 border-indigo-200"
              >
                View All Replacements
              </Button>
            </div>
          </div>
        )}

        {/* Desktop Table View */}
        {!isLoading && !error && filteredReplacements.length > 0 && (
          <>
            <div className={pageStyles.desktopTable}>
              <div className={pageStyles.tableScroll}>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200">
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap">
                        Replacement ID
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap">
                        Sales Order
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap">
                        Customer
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap">
                        Product / Reason
                      </th>
                      <th className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-3.5 whitespace-nowrap">
                        Qty
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
                    {filteredReplacements.map((item) => {
                      const s = String(item.status || "").toUpperCase();
                      const isDelivered = s === "DELIVERED" || s === "COMPLETED";
                      const isInTransit = s === "IN_TRANSIT" || s === "OUT_FOR_DELIVERY";

                      return (
                        <tr key={item.id} className="hover:bg-indigo-50/20 transition-colors">
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-semibold text-indigo-700 text-xs tracking-tight bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200/60 inline-flex items-center shrink-0">
                              {item.replacementNo || item.id}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-semibold text-slate-900 text-xs">
                              #{item.orderNumber || item.salesOrder?.orderNumber || "REP-SO"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className="font-medium text-slate-800 text-xs block max-w-[180px] truncate"
                              title={item.customerName || item.salesOrder?.customer?.companyName}
                            >
                              {item.customerName || item.salesOrder?.customer?.companyName || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col">
                              <span
                                className="text-slate-800 font-semibold text-xs block max-w-[220px] truncate"
                                title={item.productName}
                              >
                                {item.productName || "Replacement Cargo"}
                              </span>
                              {item.reason && (
                                <span className="text-slate-500 text-[11px] block max-w-[220px] truncate">
                                  {item.reason}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3.5 whitespace-nowrap text-center">
                            <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 font-semibold text-xs px-2.5 py-1 rounded-md border border-emerald-200/60">
                              {item.quantity ?? 1}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-right">
                            {isDelivered ? (
                              <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Delivered
                              </span>
                            ) : isInTransit ? (
                              <Button
                                size="sm"
                                onClick={() => handleAction(item, "deliver")}
                                disabled={loadingId === item.id}
                                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-md border-0 transition-colors cursor-pointer shrink-0 ml-auto"
                              >
                                {loadingId === item.id ? (
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                Confirm Delivery
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleAction(item, "transit")}
                                disabled={loadingId === item.id}
                                className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-md border-0 transition-colors cursor-pointer shrink-0 ml-auto"
                              >
                                {loadingId === item.id ? (
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Play className="h-3.5 w-3.5" />
                                )}
                                Start Transit
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className={pageStyles.mobileCards}>
              {filteredReplacements.map((item) => {
                const s = String(item.status || "").toUpperCase();
                const isDelivered = s === "DELIVERED" || s === "COMPLETED";
                const isInTransit = s === "IN_TRANSIT" || s === "OUT_FOR_DELIVERY";

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <span className="font-semibold text-indigo-700 text-xs">
                        {item.replacementNo || item.id}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="px-4 py-3.5 space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <User className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase">Customer</p>
                          <p className="text-xs font-semibold text-slate-800">
                            {item.customerName || item.salesOrder?.customer?.companyName || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <Package className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase">Product</p>
                          <p className="text-xs text-slate-700">{item.productName || "Replacement Product"}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="inline-flex items-center bg-emerald-50 text-emerald-700 font-semibold text-xs px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                          Qty: {item.quantity ?? 1}
                        </span>

                        {isDelivered ? (
                          <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Delivered
                          </span>
                        ) : isInTransit ? (
                          <Button
                            size="sm"
                            onClick={() => handleAction(item, "deliver")}
                            disabled={loadingId === item.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-md border-0"
                          >
                            Confirm Delivery
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAction(item, "transit")}
                            disabled={loadingId === item.id}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-md border-0"
                          >
                            Start Transit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

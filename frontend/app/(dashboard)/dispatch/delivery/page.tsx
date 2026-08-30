"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import {
  Truck,
  CheckSquare,
  Upload,
  ArrowRight,
  User,
  MapPin,
  X,
  Package,
  History,
  CheckCircle2,
  Image as ImageIcon,
  ExternalLink,
  Phone,
  Calendar,
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

/* ── Types ───────────────────────────────────────────────────────────── */
interface Customer {
  companyName: string;
  address?: string;
}

interface SalesOrder {
  orderNumber: string;
  customer: Customer;
}

interface SalesOrderItem {
  productId: string;
  productNameSnapshot: string;
  unit?: string;
}

interface DispatchItem {
  id: string;
  quantity: number | string;
  salesOrderItem: SalesOrderItem;
}

interface Dispatch {
  id: string;
  dispatchNo: string;
  status: string;
  version: number;
  deliveryAddress: string | null;
  transporterName: string | null;
  vehicleNumber: string | null;
  driverName: string | null;
  driverPhone: string | null;
  dispatchedAt: string | null;
  eta: string | null;
  invoiceNumber: string | null;
  ewayBillNumber: string | null;
  deliveredAt: string | null;
  receivedBy: string | null;
  receiverPhone: string | null;
  deliveryRemarks: string | null;
  podUrl: string | null;
  salesOrder: SalesOrder;
  items: DispatchItem[];
}

export default function DeliveryRunPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const isDispatch2 = pathname?.startsWith("/dispatch-2");
  const basePath = isDispatch2 ? "/dispatch-2" : "/dispatch";

  const [activeTab, setActiveTab] = useState<"delivery" | "history">("delivery");
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const [selectedPodImage, setSelectedPodImage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverMobile, setReceiverMobile] = useState("");
  const [deliveryImage, setDeliveryImage] = useState<File | null>(null);
  const [deliveryImagePreview, setDeliveryImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Image preview */
  useEffect(() => {
    if (!deliveryImage) { setDeliveryImagePreview(""); return; }
    const url = URL.createObjectURL(deliveryImage);
    setDeliveryImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [deliveryImage]);

  /* Escape key + body scroll lock */
  useEffect(() => {
    if (!selectedDispatch && !selectedPodImage) return;
    const prev = document.body.style.overflow;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        setSelectedDispatch(null);
        setSelectedPodImage(null);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [selectedDispatch, selectedPodImage, isSubmitting]);

  /* Query 1: Active Out for Delivery Dispatches */
  const { data: dispatches = [], isLoading, isRefetching, error, refetch } =
    useQuery<Dispatch[]>({
      queryKey: ["delivery-run-dispatches"],
      queryFn: async () => {
        const payload = await backendFetch<Dispatch[]>(
          "/api/backend/logistics/dispatches?status=OUT_FOR_DELIVERY"
        );
        return Array.isArray(payload) ? payload : [];
      },
      refetchInterval: 30000,
    });

  /* Query 2: Delivered History Dispatches */
  const {
    data: historyDispatches = [],
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useQuery<Dispatch[]>({
    queryKey: ["delivery-history-dispatches"],
    queryFn: async () => {
      const payload = await backendFetch<any>(
        "/api/backend/logistics/dispatches?status=DELIVERED"
      );
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
    refetchInterval: 30000,
  });

  const activeDeliveryQueue = useMemo(() => {
    const targetCat = isDispatch2 ? "D2" : "D1";
    const filtered = dispatches.filter((d) => {
      if (d.status !== "OUT_FOR_DELIVERY") return false;
      const cat = String((d as any).dispatchCategory || (d as any).dispatch_category || "D1").toUpperCase();
      if (targetCat === "D1") return cat === "D1" || cat === "DISPATCH 1" || cat === "DISPATCH_1";
      if (targetCat === "D2") return cat === "D2" || cat === "DISPATCH 2" || cat === "DISPATCH_2";
      return true;
    });
    if (!search.trim()) return filtered;
    const lower = search.toLowerCase();
    return filtered.filter(
      (d) =>
        d.dispatchNo?.toLowerCase().includes(lower) ||
        d.salesOrder?.orderNumber?.toLowerCase().includes(lower) ||
        d.salesOrder?.customer?.companyName?.toLowerCase().includes(lower) ||
        d.driverName?.toLowerCase().includes(lower)
    );
  }, [dispatches, search, isDispatch2]);

  const filteredHistoryDispatches = useMemo(() => {
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

  const isMobileValid = /^[6-9]\d{9}$/.test(receiverMobile);
  const mobileValidationMessage = useMemo(() => {
    if (!receiverMobile) return null;
    if (receiverMobile.length < 10) {
      return `${10 - receiverMobile.length} more digit${10 - receiverMobile.length > 1 ? "s" : ""} required`;
    }
    if (!/^[6-9]/.test(receiverMobile)) {
      return "Must start with 6, 7, 8, or 9";
    }
    return "✓ Valid 10-digit mobile";
  }, [receiverMobile]);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setReceiverMobile(digits);
  };

  /* Handlers */
  const openModal = (item: Dispatch) => {
    setSelectedDispatch(item);
    setReceiverName("");
    setReceiverMobile("");
    setDeliveryImage(null);
  };

  const handleConfirmDelivery = async () => {
    if (!selectedDispatch) return;
    if (!receiverName.trim()) { toast.error("Receiver Name is mandatory"); return; }
    
    const cleanMobile = receiverMobile.replace(/\D/g, "");
    if (!cleanMobile) {
      toast.error("Receiver Mobile is mandatory");
      return;
    }
    if (cleanMobile.length !== 10) {
      toast.error(`Receiver Mobile must be exactly 10 digits (currently ${cleanMobile.length})`);
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      toast.error("Receiver Mobile must be a valid 10-digit number starting with 6, 7, 8, or 9");
      return;
    }

    if (!deliveryImage) { toast.error("Delivery POD image is mandatory"); return; }

    setIsSubmitting(true);
    try {
      const uploadBody = new FormData();
      uploadBody.append("file", deliveryImage);
      uploadBody.append("category", "pod");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadBody });
      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok || !uploadResult.url) {
        throw new Error(uploadResult.message || "Failed to upload delivery proof image");
      }

      await backendFetch(
        `/api/backend/logistics/dispatches/${selectedDispatch.id}/confirm-delivery`,
        {
          method: "POST",
          body: {
            receiverName: receiverName.trim(),
            receiverPhone: cleanMobile,
            podImageUrl: uploadResult.url,
            version: selectedDispatch.version || 1,
          },
        }
      );

      toast.success(`Shipment ${selectedDispatch.dispatchNo} marked as Delivered`);
      setSelectedDispatch(null);
      queryClient.invalidateQueries({ queryKey: ["delivery-run-dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["delivery-history-dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["in-transit-dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["pending-dispatch-unified-items"] });
      setActiveTab("history");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to confirm delivery");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    if (activeTab === "delivery") {
      if (!activeDeliveryQueue.length) return;
      const rows = activeDeliveryQueue.map((d) => ({
        "Dispatch Number": (d.dispatchNo || "").replace(/\s+/g, ""),
        "Sales Order": d.salesOrder?.orderNumber || "—",
        Customer: d.salesOrder?.customer?.companyName || "—",
        "Delivery Address": d.deliveryAddress || "—",
        Driver: d.driverName || "—",
        Status: d.status,
      }));
      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(","),
        ...rows.map((r) =>
          headers.map((h) => `"${String((r as any)[h] ?? "").replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
      a.download = `out_for_delivery_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
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
      const csv = [
        headers.join(","),
        ...exportRows.map((r) =>
          headers.map((h) => `"${String((r as any)[h] ?? "").replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
      a.download = `dispatch_history_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    }
  };

  const formatCleanNo = (num?: string | null) => {
    if (!num) return "—";
    return num.replace(/\s*-\s*/g, "-").replace(/\s+/g, "");
  };

  return (
    <DispatchPageShell>
      <DispatchNavigationTabs />

      {/* ── Page Header ── */}
      <DispatchPageHeader
        title={activeTab === "delivery" ? "Out for Delivery (Final Mile)" : "Dispatch History & POD"}
        description={
          activeTab === "delivery"
            ? "Record final handover details. Select a dispatch, upload proof of delivery (POD), capture receiver details and mark as Delivered."
            : "Review all completed and delivered shipments with verified receiver details and POD image proofs."
        }
        eyebrow="Final Mile Operations"
        icon={activeTab === "delivery" ? Truck : History}
        stats={[
          {
            label: "Out for Delivery",
            value: activeDeliveryQueue.length,
            icon: Truck,
            color: "bg-indigo-50 text-indigo-600",
          },
          {
            label: "Delivered History",
            value: filteredHistoryDispatches.length,
            icon: CheckCircle2,
            color: "bg-emerald-50 text-emerald-600",
          },
        ]}
        onRefresh={() => {
          refetch();
          refetchHistory();
        }}
        isRefreshing={isRefetching || isHistoryLoading}
      />

      {/* ── Sub-Tab Switcher ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setActiveTab("delivery")}
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
            background: activeTab === "delivery" ? "#2563eb" : "#ffffff",
            color: activeTab === "delivery" ? "#ffffff" : "#64748b",
            border: activeTab === "delivery" ? "1px solid #2563eb" : "1px solid #e2e8f0",
            boxShadow: activeTab === "delivery" ? "0 1px 2px rgba(37,99,235,0.2)" : "none",
          }}
        >
          <Truck size={15} />
          <span>Out for Delivery</span>
          <span
            style={{
              padding: "1px 7px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              background: activeTab === "delivery" ? "rgba(255,255,255,0.25)" : "#f1f5f9",
              color: activeTab === "delivery" ? "#ffffff" : "#475569",
            }}
          >
            {activeDeliveryQueue.length}
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
            border: activeTab === "history" ? "1px solid #2563eb" : "1px solid #e2e8f0",
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

      {/* ── Toolbar ── */}
      <DispatchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          activeTab === "delivery"
            ? "Search dispatch number, customer or driver..."
            : "Search dispatch no, order, customer, driver or receiver..."
        }
        onExportCsv={
          (activeTab === "delivery" ? activeDeliveryQueue.length : filteredHistoryDispatches.length) > 0
            ? handleExportCsv
            : undefined
        }
        title={activeTab === "delivery" ? "Delivery Run Queue" : "Completed Deliveries"}
        subtitle={
          activeTab === "delivery"
            ? `Showing ${activeDeliveryQueue.length} shipment${activeDeliveryQueue.length !== 1 ? "s" : ""} out for delivery`
            : `Showing ${filteredHistoryDispatches.length} completed delivery record${filteredHistoryDispatches.length !== 1 ? "s" : ""}`
        }
      />

      {/* ── TAB 1: OUT FOR DELIVERY ── */}
      {activeTab === "delivery" && (
        <>
          {isLoading && <DispatchLoadingState count={5} />}
          {error && !isLoading && <DispatchErrorState onRetry={() => refetch()} />}
          {!isLoading && !error && activeDeliveryQueue.length === 0 && (
            <DispatchEmptyState
              title={search ? "No Matching Active Deliveries" : "No Active Delivery Runs"}
              description={
                search
                  ? `No delivery runs match "${search}". Clear your search to see all.`
                  : "No shipments are currently out for delivery. Start a delivery run from the In-Transit list."
              }
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !error && activeDeliveryQueue.length > 0 && (
            <>
              {/* Desktop table (≥ 768px) */}
              <div className="hidden md:block">
                <DispatchTableCard minTableWidth={1100}>
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="dsp-th min-w-[180px]">Dispatch Number</th>
                        <th className="dsp-th min-w-[160px]">Sales Order</th>
                        <th className="dsp-th min-w-[200px]">Customer</th>
                        <th className="dsp-th min-w-[160px]">Driver</th>
                        <th className="dsp-th text-center min-w-[150px]">Status</th>
                        <th className="dsp-th text-right min-w-[170px]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {activeDeliveryQueue.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="dsp-td">
                            <SalesOrderNumberBadge orderNumber={item.dispatchNo} />
                          </td>
                          <td className="dsp-td">
                            <span className="font-semibold text-slate-900">
                              #{item.salesOrder?.orderNumber}
                            </span>
                          </td>
                          <td className="dsp-td">
                            <span
                              className="font-semibold text-slate-900 block max-w-[220px] truncate"
                              title={item.salesOrder?.customer?.companyName || "—"}
                            >
                              {item.salesOrder?.customer?.companyName || "—"}
                            </span>
                          </td>
                          <td className="dsp-td">
                            <span className="text-slate-800 font-medium">
                              {item.driverName || "—"}
                            </span>
                          </td>
                          <td className="dsp-td text-center">
                            <DispatchStatusBadge status={item.status} />
                          </td>
                          <td className="dsp-td text-right">
                            <DispatchActionButton
                              label="Confirm Delivery"
                              icon={ArrowRight}
                              onClick={() => openModal(item)}
                              variant="primary"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </DispatchTableCard>
              </div>

              {/* Mobile cards (< 768px) */}
              <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 dispatch-mobile-card-grid">
                {activeDeliveryQueue.map((item) => (
                  <div key={item.id} className="dsp-card">
                    {/* Card Header */}
                    <div className="dsp-card-head">
                      <div className="dsp-card-head-row">
                        <SalesOrderNumberBadge orderNumber={item.dispatchNo} />
                        <DispatchStatusBadge status={item.status} />
                      </div>
                      {item.salesOrder?.orderNumber && (
                        <span className="dsp-card-so">
                          Sales Order: #{item.salesOrder.orderNumber}
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="dsp-card-body">
                      {/* Customer */}
                      <div className="dsp-card-row">
                        <div className="dsp-card-icon">
                          <User size={15} />
                        </div>
                        <div className="dsp-card-info">
                          <p className="dsp-card-label">Customer</p>
                          <p className="dsp-card-value">
                            {item.salesOrder?.customer?.companyName || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Driver */}
                      <div className="dsp-card-row">
                        <div className="dsp-card-icon">
                          <Truck size={15} />
                        </div>
                        <div className="dsp-card-info">
                          <p className="dsp-card-label">Driver</p>
                          <p className="dsp-card-value">
                            {item.driverName || "—"}
                            {item.driverPhone && (
                              <span className="dsp-card-phone"> · {item.driverPhone}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      {item.deliveryAddress && (
                        <div className="dsp-card-row">
                          <div className="dsp-card-icon">
                            <MapPin size={15} />
                          </div>
                          <div className="dsp-card-info">
                            <p className="dsp-card-label">Delivery Address</p>
                            <p className="dsp-card-value dsp-card-addr">{item.deliveryAddress}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="dsp-card-foot">
                      <button
                        type="button"
                        onClick={() => openModal(item)}
                        className="dsp-confirm-btn"
                      >
                        <CheckSquare size={15} />
                        <span>Confirm Delivery</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ── TAB 2: DISPATCH HISTORY ── */}
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
                  {filteredHistoryDispatches.map((dispatchItem) => {
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
        </>
      )}

      {/* ── Delivery Confirmation Modal ── */}
      {selectedDispatch && (
        <div
          className="dsp-modal-overlay"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setSelectedDispatch(null);
          }}
        >
          <div
            className="dsp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dsp-modal-title"
          >
            {/* Modal Header */}
            <div className="dsp-modal-head">
              <div>
                <h3 id="dsp-modal-title" className="dsp-modal-title">
                  Delivery Confirmation
                </h3>
                <p className="dsp-modal-dispatch-no">{selectedDispatch.dispatchNo}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDispatch(null)}
                disabled={isSubmitting}
                aria-label="Close modal"
                className="dsp-modal-close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="dsp-modal-body">
              {/* Summary */}
              <div className="dsp-summary">
                <div className="dsp-summary-row">
                  <span className="dsp-summary-key">Sales Order</span>
                  <span className="dsp-summary-val">#{selectedDispatch.salesOrder?.orderNumber}</span>
                </div>
                <div className="dsp-summary-row">
                  <span className="dsp-summary-key">Customer</span>
                  <span className="dsp-summary-val">{selectedDispatch.salesOrder?.customer?.companyName}</span>
                </div>
                {selectedDispatch.deliveryAddress && (
                  <div className="dsp-summary-row">
                    <span className="dsp-summary-key">Address</span>
                    <span className="dsp-summary-val dsp-summary-addr">{selectedDispatch.deliveryAddress}</span>
                  </div>
                )}
                {selectedDispatch.driverName && (
                  <div className="dsp-summary-row">
                    <span className="dsp-summary-key">Driver</span>
                    <span className="dsp-summary-val">{selectedDispatch.driverName}</span>
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="dsp-form-grid">
                <div className="dsp-field">
                  <label htmlFor="dsp-receiver-name" className="dsp-label">
                    Receiver Name <span className="dsp-required">*</span>
                  </label>
                  <input
                    id="dsp-receiver-name"
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Who received the package?"
                    className="dsp-input"
                    autoComplete="off"
                  />
                </div>

                <div className="dsp-field">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label htmlFor="dsp-receiver-mobile" className="dsp-label">
                      Receiver Mobile <span className="dsp-required">*</span>
                    </label>
                    {receiverMobile && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: isMobileValid ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {mobileValidationMessage}
                      </span>
                    )}
                  </div>
                  <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        color: "#64748b",
                        fontSize: 13,
                        fontWeight: 700,
                        pointerEvents: "none",
                        fontFamily: "monospace",
                      }}
                    >
                      +91
                    </span>
                    <input
                      id="dsp-receiver-mobile"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={receiverMobile}
                      onChange={handleMobileChange}
                      placeholder="9876543210"
                      className="dsp-input"
                      style={{
                        paddingLeft: 46,
                        fontFamily: "monospace",
                        letterSpacing: "0.05em",
                        fontWeight: 600,
                        borderColor: receiverMobile ? (isMobileValid ? "#86efac" : "#fca5a5") : undefined,
                      }}
                      autoComplete="off"
                    />
                  </div>
                  <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                    Enter exactly 10-digit Indian mobile number (e.g. 9876543210)
                  </span>
                </div>
              </div>

              {/* POD Upload */}
              <div className="dsp-field">
                <label className="dsp-label">
                  Delivery Image (POD) <span className="dsp-required">*</span>
                </label>
                <label className="dsp-pod-zone">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="dsp-pod-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && file.size > 5 * 1024 * 1024) {
                        toast.error("Image must be 5 MB or smaller");
                        return;
                      }
                      setDeliveryImage(file);
                    }}
                  />
                  {deliveryImagePreview ? (
                    <div className="dsp-pod-preview">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={deliveryImagePreview} alt="POD Preview" className="dsp-pod-img" />
                      <span className="dsp-pod-replace">Click to replace image</span>
                    </div>
                  ) : (
                    <div className="dsp-pod-placeholder">
                      <Upload size={28} />
                      <span className="dsp-pod-title">Upload delivery proof image</span>
                      <span className="dsp-pod-hint">JPG, PNG or WebP · max 5 MB</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="dsp-modal-foot">
              <button
                type="button"
                onClick={() => setSelectedDispatch(null)}
                disabled={isSubmitting}
                className="dsp-btn-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!receiverName.trim() || !isMobileValid || !deliveryImage || isSubmitting}
                onClick={handleConfirmDelivery}
                className="dsp-btn-confirm"
                style={{ opacity: !receiverName.trim() || !isMobileValid || !deliveryImage ? 0.6 : 1 }}
              >
                <CheckSquare size={15} />
                <span>{isSubmitting ? "Confirming…" : "Confirm Delivery"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── POD Image Lightbox Modal ── */}
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

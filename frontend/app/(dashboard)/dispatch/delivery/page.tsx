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

/* ── Types ──────────────────────────────────────────────────────────────── */
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

/* ── Component ──────────────────────────────────────────────────────────── */
export default function DeliveryRunPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const isDispatch2 = pathname?.startsWith("/dispatch-2");
  const basePath = isDispatch2 ? "/dispatch-2" : "/dispatch";

  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
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
    if (!selectedDispatch) return;
    const prev = document.body.style.overflow;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) setSelectedDispatch(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [selectedDispatch, isSubmitting]);

  /* Data */
  const { data: dispatches = [], isLoading, isRefetching, error, refetch } =
    useQuery<Dispatch[]>({
      queryKey: ["delivery-run-dispatches"],
      queryFn: async () => {
        const payload = await backendFetch<Dispatch[]>(
          "/api/backend/logistics/dispatches?status=OUT_FOR_DELIVERY"
        );
        return Array.isArray(payload) ? payload : [];
      },
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
    if (!receiverMobile.trim()) { toast.error("Receiver Mobile is mandatory"); return; }
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
            receiverPhone: receiverMobile.trim(),
            podImageUrl: uploadResult.url,
            version: selectedDispatch.version || 1,
          },
        }
      );

      toast.success(`Shipment ${selectedDispatch.dispatchNo} marked as Delivered`);
      setSelectedDispatch(null);
      queryClient.invalidateQueries({ queryKey: ["delivery-run-dispatches"] });
      router.push(`${basePath}/history`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to confirm delivery");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    if (!activeDeliveryQueue.length) return;
    const rows = activeDeliveryQueue.map((d) => ({
      "Dispatch Number": d.dispatchNo,
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
  };

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <DispatchPageShell>
      <DispatchNavigationTabs />

      {/* ── Page Header ── */}
      <DispatchPageHeader
        title="Out for Delivery (Final Mile)"
        description="Record final handover details. Select a dispatch, upload proof of delivery (POD), capture receiver details and mark as Delivered."
        eyebrow="Final Mile Operations"
        icon={Truck}
        stats={[
          {
            label: "Out for Delivery",
            value: activeDeliveryQueue.length,
            icon: Truck,
            color: "bg-indigo-50 text-indigo-600",
          },
        ]}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* ── Toolbar ── */}
      <DispatchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search dispatch number, customer or driver..."
        onExportCsv={activeDeliveryQueue.length > 0 ? handleExportCsv : undefined}
        title="Delivery Run Queue"
        subtitle={`Showing ${activeDeliveryQueue.length} shipment${activeDeliveryQueue.length !== 1 ? "s" : ""} out for delivery`}
      />

      {/* ── States ── */}
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

      {/* ── Table + Cards ── */}
      {!isLoading && !error && activeDeliveryQueue.length > 0 && (
        <>
          {/* Desktop table (≥ 768px) */}
          <div className="hidden md:block">
            <DispatchTableCard minTableWidth={1100}>
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="dlv-th min-w-[180px]">Dispatch Number</th>
                    <th className="dlv-th min-w-[160px]">Sales Order</th>
                    <th className="dlv-th min-w-[200px]">Customer</th>
                    <th className="dlv-th min-w-[160px]">Driver</th>
                    <th className="dlv-th text-center min-w-[150px]">Status</th>
                    <th className="dlv-th text-right min-w-[170px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {activeDeliveryQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="dlv-td">
                        <SalesOrderNumberBadge orderNumber={item.dispatchNo} />
                      </td>
                      <td className="dlv-td">
                        <span className="font-semibold text-slate-900">
                          #{item.salesOrder?.orderNumber}
                        </span>
                      </td>
                      <td className="dlv-td">
                        <span
                          className="font-semibold text-slate-900 block max-w-[220px] truncate"
                          title={item.salesOrder?.customer?.companyName || "—"}
                        >
                          {item.salesOrder?.customer?.companyName || "—"}
                        </span>
                      </td>
                      <td className="dlv-td">
                        <span className="text-slate-800 font-medium">
                          {item.driverName || "—"}
                        </span>
                      </td>
                      <td className="dlv-td text-center">
                        <DispatchStatusBadge status={item.status} />
                      </td>
                      <td className="dlv-td text-right">
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
          <div className="md:hidden dispatch-mobile-card-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
            {activeDeliveryQueue.map((item) => (
              <div key={item.id} className="dlv-card">
                {/* Card Header */}
                <div className="dlv-card-head">
                  <div className="dlv-card-head-row">
                    <SalesOrderNumberBadge orderNumber={item.dispatchNo} />
                    <DispatchStatusBadge status={item.status} />
                  </div>
                  {item.salesOrder?.orderNumber && (
                    <span className="dlv-card-so">
                      Sales Order: #{item.salesOrder.orderNumber}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="dlv-card-body">
                  {/* Customer */}
                  <div className="dlv-card-row">
                    <div className="dlv-card-icon">
                      <User size={15} />
                    </div>
                    <div className="dlv-card-info">
                      <p className="dlv-card-label">Customer</p>
                      <p className="dlv-card-value">
                        {item.salesOrder?.customer?.companyName || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Driver */}
                  <div className="dlv-card-row">
                    <div className="dlv-card-icon">
                      <Truck size={15} />
                    </div>
                    <div className="dlv-card-info">
                      <p className="dlv-card-label">Driver</p>
                      <p className="dlv-card-value">
                        {item.driverName || "—"}
                        {item.driverPhone && (
                          <span className="dlv-card-phone"> · {item.driverPhone}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {item.deliveryAddress && (
                    <div className="dlv-card-row">
                      <div className="dlv-card-icon">
                        <MapPin size={15} />
                      </div>
                      <div className="dlv-card-info">
                        <p className="dlv-card-label">Delivery Address</p>
                        <p className="dlv-card-value dlv-card-addr">{item.deliveryAddress}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="dlv-card-foot">
                  <button
                    type="button"
                    onClick={() => openModal(item)}
                    className="dlv-confirm-btn"
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

      {/* ── Delivery Confirmation Modal ── */}
      {selectedDispatch && (
        <div
          className="dlv-modal-overlay"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setSelectedDispatch(null);
          }}
        >
          <div
            className="dlv-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dlv-modal-title"
          >
            {/* Modal Header */}
            <div className="dlv-modal-head">
              <div>
                <h3 id="dlv-modal-title" className="dlv-modal-title">
                  Delivery Confirmation
                </h3>
                <p className="dlv-modal-dispatch-no">{selectedDispatch.dispatchNo}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDispatch(null)}
                disabled={isSubmitting}
                aria-label="Close modal"
                className="dlv-modal-close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="dlv-modal-body">
              {/* Summary */}
              <div className="dlv-summary">
                <div className="dlv-summary-row">
                  <span className="dlv-summary-key">Sales Order</span>
                  <span className="dlv-summary-val">#{selectedDispatch.salesOrder?.orderNumber}</span>
                </div>
                <div className="dlv-summary-row">
                  <span className="dlv-summary-key">Customer</span>
                  <span className="dlv-summary-val">{selectedDispatch.salesOrder?.customer?.companyName}</span>
                </div>
                {selectedDispatch.deliveryAddress && (
                  <div className="dlv-summary-row">
                    <span className="dlv-summary-key">Address</span>
                    <span className="dlv-summary-val dlv-summary-addr">{selectedDispatch.deliveryAddress}</span>
                  </div>
                )}
                {selectedDispatch.driverName && (
                  <div className="dlv-summary-row">
                    <span className="dlv-summary-key">Driver</span>
                    <span className="dlv-summary-val">{selectedDispatch.driverName}</span>
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="dlv-form-grid">
                <div className="dlv-field">
                  <label htmlFor="dlv-receiver-name" className="dlv-label">
                    Receiver Name <span className="dlv-required">*</span>
                  </label>
                  <input
                    id="dlv-receiver-name"
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Who received the package?"
                    className="dlv-input"
                    autoComplete="off"
                  />
                </div>

                <div className="dlv-field">
                  <label htmlFor="dlv-receiver-mobile" className="dlv-label">
                    Receiver Mobile <span className="dlv-required">*</span>
                  </label>
                  <input
                    id="dlv-receiver-mobile"
                    type="tel"
                    value={receiverMobile}
                    onChange={(e) => setReceiverMobile(e.target.value)}
                    placeholder="+91-9999999999"
                    className="dlv-input"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* POD Upload */}
              <div className="dlv-field">
                <label className="dlv-label">
                  Delivery Image (POD) <span className="dlv-required">*</span>
                </label>
                <label className="dlv-pod-zone">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="dlv-pod-input"
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
                    <div className="dlv-pod-preview">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={deliveryImagePreview} alt="POD Preview" className="dlv-pod-img" />
                      <span className="dlv-pod-replace">Click to replace image</span>
                    </div>
                  ) : (
                    <div className="dlv-pod-placeholder">
                      <Upload size={28} />
                      <span className="dlv-pod-title">Upload delivery proof image</span>
                      <span className="dlv-pod-hint">JPG, PNG or WebP · max 5 MB</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="dlv-modal-foot">
              <button
                type="button"
                onClick={() => setSelectedDispatch(null)}
                disabled={isSubmitting}
                className="dlv-btn-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!receiverName || !receiverMobile || !deliveryImage || isSubmitting}
                onClick={handleConfirmDelivery}
                className="dlv-btn-confirm"
              >
                <CheckSquare size={15} />
                <span>{isSubmitting ? "Confirming…" : "Confirm Delivery"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DispatchPageShell>
  );
}

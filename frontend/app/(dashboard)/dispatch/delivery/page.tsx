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

/* â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
      "Sales Order": d.salesOrder?.orderNumber || "â€”",
      Customer: d.salesOrder?.customer?.companyName || "â€”",
      "Delivery Address": d.deliveryAddress || "â€”",
      Driver: d.driverName || "â€”",
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

  /* â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  return (
    <DispatchPageShell>
      <DispatchNavigationTabs />

      {/* â”€â”€ Page Header â”€â”€ */}
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
      >
        <button
          type="button"
          onClick={() => router.push(`${basePath}/history`)}
          className="dispatch-export-btn"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
        >
          <History size={14} />
          <span>History</span>
        </button>
      </DispatchToolbar>

      {/* â”€â”€ States â”€â”€ */}
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

      {/* â”€â”€ Table + Cards â”€â”€ */}
      {!isLoading && !error && activeDeliveryQueue.length > 0 && (
        <>
          {/* Desktop table (â‰¥ 768px) */}
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
                          title={item.salesOrder?.customer?.companyName || "â€”"}
                        >
                          {item.salesOrder?.customer?.companyName || "â€”"}
                        </span>
                      </td>
                      <td className="dsp-td">
                        <span className="text-slate-800 font-medium">
                          {item.driverName || "â€”"}
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
                        {item.salesOrder?.customer?.companyName || "â€”"}
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
                        {item.driverName || "â€”"}
                        {item.driverPhone && (
                          <span className="dsp-card-phone"> Â· {item.driverPhone}</span>
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

      {/* â”€â”€ Delivery Confirmation Modal â”€â”€ */}
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
    </DispatchPageShell>
  );
}


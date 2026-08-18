"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

import { backendFetch } from "@/lib/backendFetch";
import { Button } from "@/components/ui/button";
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

  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const [search, setSearch] = useState("");

  // Delivery confirmation form state
  const [receiverName, setReceiverName] = useState("");
  const [receiverMobile, setReceiverMobile] = useState("");
  const [deliveryImage, setDeliveryImage] = useState<File | null>(null);
  const [deliveryImagePreview, setDeliveryImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!deliveryImage) {
      setDeliveryImagePreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(deliveryImage);
    setDeliveryImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [deliveryImage]);

  useEffect(() => {
    if (!selectedDispatch) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        setSelectedDispatch(null);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedDispatch, isSubmitting]);

  const {
    data: dispatches = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery<Dispatch[]>({
    queryKey: ["delivery-run-dispatches"],
    queryFn: async () => {
      const payload = await backendFetch<Dispatch[]>(
        "/api/backend/logistics/dispatches?status=OUT_FOR_DELIVERY",
      );
      return Array.isArray(payload) ? payload : [];
    },
  });

  const activeDeliveryQueue = useMemo(() => {
    const list = dispatches.filter((d) => d.status === "OUT_FOR_DELIVERY");
    if (!search.trim()) return list;
    const lower = search.toLowerCase();
    return list.filter(
      (d) =>
        d.dispatchNo?.toLowerCase().includes(lower) ||
        d.salesOrder?.orderNumber?.toLowerCase().includes(lower) ||
        d.salesOrder?.customer?.companyName?.toLowerCase().includes(lower) ||
        d.driverName?.toLowerCase().includes(lower)
    );
  }, [dispatches, search]);

  const handleSelectDispatch = (dispatchItem: Dispatch) => {
    setSelectedDispatch(dispatchItem);
    setReceiverName("");
    setReceiverMobile("");
    setDeliveryImage(null);
  };

  const handleConfirmDelivery = async () => {
    if (!selectedDispatch) return;
    if (!receiverName.trim()) {
      toast.error("Receiver Name is mandatory");
      return;
    }
    if (!receiverMobile.trim()) {
      toast.error("Receiver Mobile is mandatory");
      return;
    }
    if (!deliveryImage) {
      toast.error("Delivery POD image is mandatory");
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadBody = new FormData();
      uploadBody.append("file", deliveryImage);
      uploadBody.append("category", "pod");
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadBody,
      });
      const uploadResult = await uploadResponse.json();
      if (!uploadResponse.ok || !uploadResult.url) {
        throw new Error(uploadResult.message || "Failed to upload delivery proof image");
      }

      const payload = {
        receiverName: receiverName.trim(),
        receiverPhone: receiverMobile.trim(),
        podImageUrl: uploadResult.url,
        version: selectedDispatch.version || 1,
      };

      await backendFetch(
        `/api/backend/logistics/dispatches/${selectedDispatch.id}/confirm-delivery`,
        {
          method: "POST",
          body: payload,
        },
      );

      toast.success(`Shipment ${selectedDispatch.dispatchNo} marked as Delivered`);
      setSelectedDispatch(null);
      queryClient.invalidateQueries({ queryKey: ["delivery-run-dispatches"] });
      router.push(`${basePath}/history`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to confirm delivery",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DispatchPageShell>
      {/* Navigation Tabs */}
      <DispatchNavigationTabs />

      {/* Page Header */}
      <DispatchPageHeader
        title="Out for Delivery (Final Mile)"
        description="Record final handover details from customers. Select an out-for-delivery dispatch, upload proof of delivery (POD), capture receiver details, and mark dispatches as Delivered."
        eyebrow="Final Mile Operations"
        icon={Truck}
        stats={[
          { label: "Out for Delivery", value: activeDeliveryQueue.length, icon: Truck, color: "bg-indigo-50 text-indigo-600" },
        ]}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      {/* Toolbar / Search Filter */}
      <DispatchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search dispatch number, customer or driver..."
        title="Delivery Run Queue"
        subtitle={`Showing ${activeDeliveryQueue.length} shipment${activeDeliveryQueue.length !== 1 ? "s" : ""} out for delivery`}
      />

      {/* Loading State */}
      {isLoading && <DispatchLoadingState count={5} />}

      {/* Error State */}
      {error && !isLoading && <DispatchErrorState onRetry={() => refetch()} />}

      {/* Empty State */}
      {!isLoading && !error && activeDeliveryQueue.length === 0 && (
        <DispatchEmptyState
          title={search ? "No Matching Active Deliveries" : "No Active Delivery Runs"}
          description={
            search
              ? `No active delivery runs match "${search}". Try clearing your search filter.`
              : "No shipments are currently out for delivery. Start a delivery run from the In-Transit shipments list."
          }
          onRetry={() => refetch()}
        />
      )}

      {/* Table & Mobile Cards */}
      {!isLoading && !error && activeDeliveryQueue.length > 0 && (
        <>
          {/* Desktop Table View (≥ 768px) */}
          <div className="hidden md:block">
            <DispatchTableCard minTableWidth={1100}>
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
                      Driver
                    </th>
                    <th className="text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap min-w-[140px]">
                      Status
                    </th>
                    <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-4 py-3.5 whitespace-nowrap min-w-[160px]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {activeDeliveryQueue.map((dispatchItem) => (
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

                      {/* Driver */}
                      <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                        <span className="text-slate-800 font-medium text-xs">
                          {dispatchItem.driverName || "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center align-middle">
                        <DispatchStatusBadge status={dispatchItem.status} />
                      </td>

                      {/* Action Button */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right align-middle">
                        <DispatchActionButton
                          label="Confirm Delivery"
                          icon={ArrowRight}
                          onClick={() => handleSelectDispatch(dispatchItem)}
                          variant="primary"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DispatchTableCard>
          </div>

          {/* Mobile Cards View (< 768px) */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {activeDeliveryQueue.map((dispatchItem) => (
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

                  {/* Driver */}
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-400 shrink-0 mt-0.5">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Driver</p>
                      <p className="text-xs font-medium text-slate-800 m-0">
                        {dispatchItem.driverName || "—"} {dispatchItem.driverPhone ? `· ${dispatchItem.driverPhone}` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-3 bg-slate-50/50 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleSelectDispatch(dispatchItem)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>Confirm Delivery</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {selectedDispatch && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) {
              setSelectedDispatch(null);
            }
          }}
        >
          <div
            className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/80">
              <div>
                <h3 className="text-base font-bold text-slate-900 m-0">Delivery Confirmation</h3>
                <p className="text-xs text-slate-500 font-mono m-0 mt-0.5">
                  Dispatch: {selectedDispatch.dispatchNo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDispatch(null)}
                disabled={isSubmitting}
                aria-label="Close modal"
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Dispatch Summary Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sales Order:</span>
                  <span className="font-semibold text-slate-900">#{selectedDispatch.salesOrder?.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold text-slate-900">{selectedDispatch.salesOrder?.customer?.companyName}</span>
                </div>
                {selectedDispatch.deliveryAddress && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Address:</span>
                    <span className="font-medium text-slate-800 max-w-[260px] text-right truncate">{selectedDispatch.deliveryAddress}</span>
                  </div>
                )}
                {selectedDispatch.driverName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Driver:</span>
                    <span className="font-medium text-slate-800">{selectedDispatch.driverName}</span>
                  </div>
                )}
              </div>

              {/* Form Input Fields */}
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="receiver-name" className="text-xs font-bold text-slate-700">
                      Receiver Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="receiver-name"
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="Who received the package?"
                      className="h-10 px-3 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="receiver-mobile" className="text-xs font-bold text-slate-700">
                      Receiver Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="receiver-mobile"
                      type="tel"
                      value={receiverMobile}
                      onChange={(e) => setReceiverMobile(e.target.value)}
                      placeholder="+91-9999999999"
                      className="h-10 px-3 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Delivery Image (POD) <span className="text-red-500">*</span>
                  </label>
                  <label className="relative flex flex-col items-center justify-center min-h-[140px] p-4 border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors text-center">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
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
                      <div className="space-y-2 flex flex-col items-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={deliveryImagePreview} alt="POD Preview" className="max-h-36 rounded-lg object-contain" />
                        <span className="text-[11px] text-slate-400 font-medium">Click to replace image</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 flex flex-col items-center text-indigo-600">
                        <Upload className="w-7 h-7" />
                        <span className="text-xs font-bold text-slate-800">Upload delivery proof image</span>
                        <span className="text-[11px] text-slate-400">JPG, PNG or WebP · maximum 5 MB</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50/80">
              <Button
                variant="outline"
                onClick={() => setSelectedDispatch(null)}
                disabled={isSubmitting}
                className="text-xs font-semibold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                disabled={!receiverName || !receiverMobile || !deliveryImage || isSubmitting}
                onClick={handleConfirmDelivery}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <CheckSquare className="w-4 h-4" />
                <span>{isSubmitting ? "Confirming..." : "Confirm Delivery"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </DispatchPageShell>
  );
}

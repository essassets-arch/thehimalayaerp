"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Truck,
  CheckCircle2,
  CheckSquare,
  Clock,
  Upload,
  ArrowRight,
  LayoutGrid,
  X,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { DataTable } from "@/components/erp/data-table/DataTable";
import { StatusBadge } from "@/components/erp/common/StatusBadge";
import { backendFetch } from "@/lib/backendFetch";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import responsive from "../dispatch-responsive.module.css";
import pageStyles from "../orders/orders.module.css";
import styles from "./delivery.module.css";

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

  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(
    null,
  );

  // Delivery confirmation states
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

  // Fetch all dispatches
  const { data: dispatches = [], isLoading } = useQuery<Dispatch[]>({
    queryKey: ["delivery-run-dispatches"],
    queryFn: async () => {
      const payload = await backendFetch<Dispatch[]>(
        "/api/backend/logistics/dispatches?status=OUT_FOR_DELIVERY",
      );
      return Array.isArray(payload) ? payload : [];
    },
  });

  // Filter queues
  const activeDeliveryQueue = dispatches.filter(
    (d) => d.status === "OUT_FOR_DELIVERY",
  );

  // Handle row selection
  const handleSelectDispatch = (dispatch: Dispatch) => {
    setSelectedDispatch(dispatch);
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
      toast.error("Delivery image is mandatory");
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
        throw new Error(uploadResult.message || "Failed to upload delivery image");
      }

      const payload = {
        receiverName: receiverName,
        receiverPhone: receiverMobile,
        podImageUrl: uploadResult.url,
        version: selectedDispatch.version || 1, // Assume version is returned by GET
      };

      await backendFetch(
        `/api/backend/logistics/dispatches/${selectedDispatch.id}/confirm-delivery`,
        {
          method: "POST",
          body: payload,
        },
      );

      toast.success(
        `Shipment ${selectedDispatch.dispatchNo} marked as Delivered`,
      );
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

  const activeColumns: ColumnDef<Dispatch>[] = [
    {
      accessorKey: "dispatchNo",
      header: "Dispatch Number",
      size: 160,
      cell: ({ row }) => (
        <span className="font-semibold text-blue-600 whitespace-nowrap">
          {row.original.dispatchNo}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      size: 180,
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 whitespace-nowrap">{row.original.salesOrder?.customer?.companyName || "—"}</span>
      ),
    },
    {
      accessorKey: "driverName",
      header: "Driver",
      size: 140,
      cell: ({ row }) => <span className="whitespace-nowrap">{row.original.driverName || "-"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 140,
      cell: ({ row }) => (
        <div className="whitespace-nowrap inline-flex items-center">
          <StatusBadge status={row.original.status} />
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right whitespace-nowrap">Action</div>,
      size: 170,
      cell: ({ row }) => (
        <div className="flex justify-end whitespace-nowrap">
          <Button
            variant="default"
            size="sm"
            onClick={() => handleSelectDispatch(row.original)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0"
          >
            Confirm Delivery
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={responsive.flushPage}>
      <div className={`${responsive.content} ${styles.pageFlow}`}>
        {/* Header */}
        <div className={pageStyles.header}>
        <div className={pageStyles.watermark}>
          <Truck size={140} />
        </div>
        <div className={pageStyles.headerMain}>
          <div className={pageStyles.headerLayout}>
            <div className={pageStyles.headerCopy}>
              <span className={pageStyles.eyebrow}>
                <LayoutGrid size={13} />
                Logistics
              </span>
              <h1 className={pageStyles.title}>
                Out for Delivery (Final Mile)
              </h1>
              <p className={pageStyles.description}>
                Record final handover details from customers. Select an
                out-for-delivery dispatch, upload POD, capture receiver details,
                and mark dispatches as Delivered.
              </p>
            </div>
            <div className={pageStyles.summary}>
              <Clock className="text-indigo-500 h-7 w-7" />
              <div className={pageStyles.summaryCount}>
                <strong>{activeDeliveryQueue.length}</strong>
                <span>Active Delivery Runs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active delivery queue */}
      <div className={styles.workspace} role="tabpanel">
          <div className={styles.queueColumn}>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Out for Delivery Queue</h2>
              {isLoading ? (
                <div className="flex justify-center py-8 text-sm text-gray-500">
                  Loading delivery run data...
                </div>
              ) : (
                <DataTable
                  columns={activeColumns}
                  data={activeDeliveryQueue}
                  className={styles.tableFrame}
                  emptyMessage="No shipments are currently out for delivery."
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedDispatch && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSubmitting) {
              setSelectedDispatch(null);
            }
          }}
        >
          <section
            className={styles.confirmationModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delivery-confirmation-title"
          >
            <div className={styles.confirmationCard}>
              <div className={styles.confirmationHeader}>
                <div>
                  <h2
                    id="delivery-confirmation-title"
                    className="text-base font-bold text-gray-900"
                  >
                  Delivery Confirmation
                  </h2>
                  <span className="text-xs text-gray-500 font-medium font-mono">
                    Dispatch: {selectedDispatch.dispatchNo}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setSelectedDispatch(null)}
                  disabled={isSubmitting}
                  aria-label="Close delivery confirmation"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Show Details */}
              <div className={styles.dispatchDetails}>
                <div>
                  Sales Order:{" "}
                  <span className="font-bold text-gray-900">
                    #{selectedDispatch.salesOrder?.orderNumber}
                  </span>
                </div>
                <div>
                  Customer:{" "}
                  <span className="font-bold text-gray-900">
                    {selectedDispatch.salesOrder?.customer?.companyName}
                  </span>
                </div>
                <div>
                  Address:{" "}
                  <span className="font-bold text-gray-900">
                    {selectedDispatch.deliveryAddress || "N/A"}
                  </span>
                </div>
                <div>
                  Driver:{" "}
                  <span className="font-bold text-gray-900">
                    {selectedDispatch.driverName || "N/A"}
                  </span>
                </div>
                <div>
                  Products:{" "}
                  <span className="font-bold text-gray-900">
                    {selectedDispatch.items
                      ?.map((i) => i.salesOrderItem.productNameSnapshot)
                      .join(", ")}
                  </span>
                </div>
                <div>
                  Quantity:{" "}
                  <span className="font-bold text-blue-700 font-mono">
                    {selectedDispatch.items?.reduce(
                      (sum, item) => sum + Number(item.quantity),
                      0,
                    )}
                  </span>
                </div>
                <div>
                  Invoice / E-way:{" "}
                  <span className="font-mono text-gray-900">
                    {selectedDispatch.invoiceNumber || "-"} /{" "}
                    {selectedDispatch.ewayBillNumber || "-"}
                  </span>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className={styles.formFields}>
                <div className={styles.receiverGrid}>
                  <div className={styles.formField}>
                    <label htmlFor="receiver-name">Receiver Name *</label>
                    <input
                      id="receiver-name"
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="Who received the package?"
                      autoComplete="name"
                    />
                  </div>
                  <div className={styles.formField}>
                    <label htmlFor="receiver-mobile">Receiver Mobile *</label>
                    <input
                      id="receiver-mobile"
                      type="tel"
                      value={receiverMobile}
                      onChange={(e) => setReceiverMobile(e.target.value)}
                      placeholder="+91-9999999999"
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </div>
                </div>
                <div className={styles.formField}>
                  <label>
                    Delivery Image *
                  </label>
                  <label className={styles.imageUploader}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        if (file && file.size > 5 * 1024 * 1024) {
                          toast.error("Image must be 5 MB or smaller");
                          event.target.value = "";
                          return;
                        }
                        setDeliveryImage(file);
                      }}
                    />
                    {deliveryImagePreview ? (
                      <div className={styles.imagePreview}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={deliveryImagePreview} alt="Delivery proof preview" />
                        <span>Click to replace image</span>
                      </div>
                    ) : (
                      <div className={styles.imagePrompt}>
                        <Upload className="h-7 w-7" />
                        <strong>Upload delivery image</strong>
                        <span>JPG, PNG or WebP · maximum 5 MB</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className={styles.formActions}>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDispatch(null)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  disabled={
                    !receiverName ||
                    !receiverMobile ||
                    !deliveryImage ||
                    isSubmitting
                  }
                  onClick={handleConfirmDelivery}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2"
                >
                  <CheckSquare className="h-4.5 w-4.5" />
                  Confirm Delivery
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

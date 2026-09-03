"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import {
  Truck,
  Upload,
  ArrowRight,
  User,
  MapPin,
  X,
  History,
  CheckCircle2,
  Image as ImageIcon,
  ExternalLink,
  Phone,
  Calendar,
  Search,
  RefreshCw,
  Download,
  Copy,
  ShieldCheck,
  Building2,
  FileCheck2,
  Clock,
  Eye,
  FileText,
  Package,
  Printer,
  Hash,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

import { backendFetch } from "@/lib/backendFetch";
import { getBackendAssetUrl } from "@/lib/assetUrl";
import styles from "./delivery.module.css";

/* ── Types ───────────────────────────────────────────────────────────── */
interface Customer {
  companyName: string;
  address?: string;
  phone?: string;
  contactPhone?: string;
  email?: string;
  taxId?: string;
  gstin?: string;
}

interface SalesOrder {
  id?: string;
  orderNumber: string;
  customer: Customer;
  totalAmount?: number | string;
  items?: any[];
  shippingAddress?: any;
}

interface SalesOrderItem {
  productId?: string;
  productNameSnapshot?: string;
  productCodeSnapshot?: string;
  unit?: string;
  unitPrice?: number | string;
  orderedQuantity?: number | string;
}

interface DispatchItem {
  id: string;
  quantity: number | string;
  loadedQuantity?: number | string;
  deliveredQuantity?: number | string;
  salesOrderItem?: SalesOrderItem;
}

interface Dispatch {
  id: string;
  dispatchNo: string;
  status: string;
  version: number;
  deliveryAddress: string | null;
  transporterName: string | null;
  vehicleNumber: string | null;
  vehicleType: string | null;
  driverName: string | null;
  driverPhone: string | null;
  driverLicence: string | null;
  lrNumber: string | null;
  dispatchedAt: string | null;
  eta: string | null;
  invoiceNumber: string | null;
  ewayBillNumber: string | null;
  gatePassNumber: string | null;
  deliveredAt: string | null;
  receivedBy: string | null;
  receiverPhone: string | null;
  receiverDesignation: string | null;
  deliveryRemarks: string | null;
  specialInstructions: string | null;
  packageCount: number | null;
  packageType: string | null;
  totalWeight: number | string | null;
  podUrl: string | null;
  salesOrder: SalesOrder;
  items: DispatchItem[];
}

function normalizeDispatchCategory(cat?: string | null): 'D1' | 'D2' | null {
  if (!cat) return null;
  const s = String(cat).trim().toUpperCase();
  if (['D1', 'DISPATCH 1', 'DISPATCH_1', 'CATEGORY 1', 'CATEGORY_1', 'CAT 1', 'CAT_1', '1'].includes(s)) {
    return 'D1';
  }
  if (['D2', 'DISPATCH 2', 'DISPATCH_2', 'CATEGORY 2', 'CATEGORY_2', 'CAT 2', 'CAT_2', '2'].includes(s)) {
    return 'D2';
  }
  return null;
}

export default function DeliveryRunPage() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const isDispatch2 = pathname?.startsWith("/dispatch-2");

  const [activeTab, setActiveTab] = useState<"delivery" | "history">("delivery");
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const [viewingHistoryItem, setViewingHistoryItem] = useState<Dispatch | null>(null);
  const [selectedPodImage, setSelectedPodImage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Modal Form State
  const [receiverName, setReceiverName] = useState("");
  const [receiverMobile, setReceiverMobile] = useState("");
  const [deliveryRemarks, setDeliveryRemarks] = useState("");
  const [deliveryImage, setDeliveryImage] = useState<File | null>(null);
  const [deliveryImagePreview, setDeliveryImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Dispatches out for delivery
  const {
    data: dispatches = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery<Dispatch[]>({
    queryKey: ["delivery-run-dispatches"],
    queryFn: async () => {
      const payload = await backendFetch<any>(
        "/api/backend/logistics/dispatches?status=IN_TRANSIT,OUT_FOR_DELIVERY",
      );
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.data?.data)) return payload.data.data;
      return [];
    },
    refetchInterval: 15000,
  });

  // 2. Fetch Delivered History Dispatches
  const {
    data: historyDispatches = [],
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useQuery<Dispatch[]>({
    queryKey: ["delivery-run-history"],
    queryFn: async () => {
      const payload = await backendFetch<any>(
        "/api/backend/logistics/dispatches?status=DELIVERED",
      );
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.data?.data)) return payload.data.data;
      return [];
    },
    refetchInterval: 30000,
  });

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (deliveryImagePreview && deliveryImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(deliveryImagePreview);
      }
    };
  }, [deliveryImagePreview]);

  const copyToClipboard = (text: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const formatCleanNo = (num?: string | null) => {
    if (!num) return "—";
    return num.replace(/\s*-\s*/g, "-").replace(/\s+/g, "");
  };

  // Filter Active Queue
  const activeDeliveryQueue = useMemo(() => {
    const targetCat = isDispatch2 ? "D2" : "D1";
    const categoryFiltered = dispatches.filter((d) => {
      const rawCat = (d as any).dispatchCategory || (d as any).dispatch_category;
      if (!rawCat) return true;
      const norm = normalizeDispatchCategory(rawCat);
      if (!norm) return true;
      return norm === targetCat;
    });

    if (!search.trim()) return categoryFiltered;
    const lower = search.toLowerCase();
    return categoryFiltered.filter(
      (d) =>
        d.dispatchNo?.toLowerCase().includes(lower) ||
        d.salesOrder?.orderNumber?.toLowerCase().includes(lower) ||
        d.salesOrder?.customer?.companyName?.toLowerCase().includes(lower) ||
        d.driverName?.toLowerCase().includes(lower) ||
        d.driverPhone?.toLowerCase().includes(lower) ||
        d.vehicleNumber?.toLowerCase().includes(lower) ||
        d.deliveryAddress?.toLowerCase().includes(lower)
    );
  }, [dispatches, search, isDispatch2]);

  // Filter History Dispatches
  const filteredHistoryDispatches = useMemo(() => {
    const targetCat = isDispatch2 ? "D2" : "D1";
    const categoryFiltered = historyDispatches.filter((d) => {
      if (String(d.status || "").toUpperCase() !== "DELIVERED") return false;
      const rawCat = (d as any).dispatchCategory || (d as any).dispatch_category;
      if (!rawCat) return true;
      const norm = normalizeDispatchCategory(rawCat);
      if (!norm) return true;
      return norm === targetCat;
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
        d.driverName?.toLowerCase().includes(lower) ||
        d.vehicleNumber?.toLowerCase().includes(lower)
    );
  }, [historyDispatches, search, isDispatch2]);

  // Modal Handlers
  const openModal = (dispatchItem: Dispatch) => {
    setSelectedDispatch(dispatchItem);
    setReceiverName("");
    setReceiverMobile("");
    setDeliveryRemarks("");
    setDeliveryImage(null);
    setDeliveryImagePreview("");
  };

  const closeModal = () => {
    setSelectedDispatch(null);
    setReceiverName("");
    setReceiverMobile("");
    setDeliveryRemarks("");
    setDeliveryImage(null);
    if (deliveryImagePreview && deliveryImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(deliveryImagePreview);
    }
    setDeliveryImagePreview("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) {
      toast.error("Please upload a valid image file (JPG, PNG, WebP) or PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size cannot exceed 5 MB.");
      return;
    }

    setDeliveryImage(file);
    if (file.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file);
      setDeliveryImagePreview(objectUrl);
    } else {
      setDeliveryImagePreview("");
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeliveryImage(null);
    if (deliveryImagePreview && deliveryImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(deliveryImagePreview);
    }
    setDeliveryImagePreview("");
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispatch) return;

    const trimmedName = receiverName.trim();
    const trimmedMobile = receiverMobile.trim();

    if (!trimmedName) {
      toast.error("Receiver Name is required.");
      return;
    }
    if (!trimmedMobile) {
      toast.error("Receiver Mobile Phone is required.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(trimmedMobile)) {
      toast.error("Please enter a valid 10-digit Indian mobile number (starts with 6-9).");
      return;
    }
    if (!deliveryImage) {
      toast.error("Proof of Delivery (POD) image or document is mandatory.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("receivedBy", trimmedName);
      formData.append("receiverPhone", trimmedMobile);
      if (deliveryRemarks.trim()) {
        formData.append("deliveryRemarks", deliveryRemarks.trim());
      }
      formData.append("pod", deliveryImage);
      if (selectedDispatch.version !== undefined) {
        formData.append("version", String(selectedDispatch.version));
      }

      const res = await backendFetch<any>(
        `/api/backend/logistics/dispatches/${selectedDispatch.id}/deliver`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (res && res.error) {
        throw new Error(res.error || "Failed to confirm delivery");
      }

      await Swal.fire({
        icon: "success",
        title: "Delivery Handover Recorded",
        text: `Dispatch #${formatCleanNo(selectedDispatch.dispatchNo)} has been marked as DELIVERED with verified POD.`,
        confirmButtonColor: "#16a34a",
        confirmButtonText: "Done",
      });

      closeModal();
      queryClient.invalidateQueries({ queryKey: ["delivery-run-dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["delivery-run-history"] });
      queryClient.invalidateQueries({ queryKey: ["dispatches-in-transit"] });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Handover Submission Failed",
        text: err?.message || "An unexpected error occurred while confirming delivery.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    const isDelivery = activeTab === "delivery";
    const items = isDelivery ? activeDeliveryQueue : filteredHistoryDispatches;
    if (!items.length) return;

    const rows = items.map((d) => ({
      "Dispatch #": formatCleanNo(d.dispatchNo),
      "Sales Order #": formatCleanNo(d.salesOrder?.orderNumber),
      Customer: d.salesOrder?.customer?.companyName || "—",
      "Delivery Address": d.deliveryAddress || "—",
      Driver: d.driverName || "—",
      "Driver Phone": d.driverPhone || "—",
      "Vehicle Number": d.vehicleNumber || "—",
      Transporter: d.transporterName || "—",
      "Received By": d.receivedBy || "—",
      "Receiver Mobile": d.receiverPhone || "—",
      "Delivered Timestamp": d.deliveredAt ? new Date(d.deliveredAt).toLocaleString("en-IN") : "—",
      "POD Image URL": d.podUrl || "—",
      Status: d.status,
    }));

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => `"${String((r as any)[h] ?? "").replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download = `${isDelivery ? "active_deliveries" : "delivery_history"}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Metrics
  const totalWithPod = filteredHistoryDispatches.filter((d) => Boolean(d.podUrl)).length;
  const podPercentage =
    filteredHistoryDispatches.length > 0
      ? Math.round((totalWithPod / filteredHistoryDispatches.length) * 100)
      : 0;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* ─── HERO HEADER ─── */}
        <section className={styles.heroContainer}>
          <div className={styles.heroGlow1} />
          <div className={styles.heroGlow2} />

          <div className={styles.heroTopRow}>
            <div className={styles.heroTitleSection}>
              <div className={styles.heroBadge}>
                <ShieldCheck size={13} />
                <span>Final Mile Handover · Delivery Confirmation</span>
              </div>
              <h1 className={styles.heroTitle}>Out for Delivery &amp; Handover Registry</h1>
              <p className={styles.heroSubtitle}>
                Execute client delivery handovers, capture recipient signatures &amp; phone contacts, and upload verified Proof of Delivery (POD) image records.
              </p>
            </div>

            <div className={styles.heroActions}>
              <button
                type="button"
                onClick={() => {
                  refetch();
                  refetchHistory();
                }}
                className={styles.btnActionLight}
                title="Refresh delivery live feed"
              >
                <RefreshCw size={14} className={isRefetching || isHistoryLoading ? "animate-spin" : ""} />
                <span>Refresh Feed</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className={styles.btnActionPrimary}
                title="Export current view as CSV manifest"
              >
                <Download size={14} />
                <span>Export Manifest</span>
              </button>
            </div>
          </div>
        </section>

        {/* ─── MAIN WORKSPACE CARD ─── */}
        <div className={styles.mainCard}>
          {/* Controls Bar: Tabs & Search Filter */}
          <div className={styles.controlBar}>
            {/* Horizontally Scrollable Tab Switcher */}
            <div className={styles.tabSwitcherWrapper}>
              <div className={styles.tabSwitcher}>
                <button
                  type="button"
                  onClick={() => setActiveTab("delivery")}
                  className={`${styles.tabBtn} ${activeTab === "delivery" ? styles.tabBtnActive : ""}`}
                >
                  <Truck size={15} />
                  <span>Out for Delivery</span>
                  <span className={`${styles.tabBadge} ${activeTab === "delivery" ? styles.tabBadgeActive : ""}`}>
                    {activeDeliveryQueue.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className={`${styles.tabBtn} ${activeTab === "history" ? styles.tabBtnActive : ""}`}
                >
                  <History size={15} />
                  <span>Dispatch History &amp; POD</span>
                  <span className={`${styles.tabBadge} ${activeTab === "history" ? styles.tabBadgeActive : ""}`}>
                    {filteredHistoryDispatches.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className={styles.filterToolbar}>
              <div className={styles.searchBox}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    activeTab === "delivery"
                      ? "Search dispatch #, sales order, customer, driver or address..."
                      : "Search dispatch #, sales order, customer, receiver or vehicle..."
                  }
                  className={styles.searchInput}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className={styles.searchClear}
                    title="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className={styles.toolbarActions}>
                <button
                  type="button"
                  onClick={() => {
                    refetch();
                    refetchHistory();
                  }}
                  className={styles.btnActionLight}
                  style={{ color: "#334155", borderColor: "#cbd5e1" }}
                  title="Refresh dispatch data"
                >
                  <RefreshCw size={14} className={isRefetching || isHistoryLoading ? "animate-spin" : ""} />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className={styles.btnActionPrimary}
                  title="Export current view to CSV"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─── TAB 1: ACTIVE DELIVERY QUEUE ─── */}
          {activeTab === "delivery" && (
            <>
              {isLoading && (
                <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ height: 48, background: "#f1f5f9", borderRadius: 8 }} />
                  <div style={{ height: 48, background: "#f1f5f9", borderRadius: 8 }} />
                  <div style={{ height: 48, background: "#f1f5f9", borderRadius: 8 }} />
                </div>
              )}

              {error && !isLoading && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconBox} style={{ color: "#ef4444", background: "#fef2f2" }}>
                    <ShieldCheck size={28} />
                  </div>
                  <h3 className={styles.emptyTitle}>Unable to Load Deliveries</h3>
                  <p className={styles.emptyDesc}>
                    An error occurred while fetching the active delivery queue. Please verify your connection or click retry.
                  </p>
                  <button type="button" onClick={() => refetch()} className={styles.btnActionPrimary} style={{ marginTop: 14 }}>
                    Retry Loading
                  </button>
                </div>
              )}

              {!isLoading && !error && activeDeliveryQueue.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconBox}>
                    <Truck size={28} />
                  </div>
                  <h3 className={styles.emptyTitle}>
                    {search ? "No Matching Deliveries" : "No Active Delivery Runs"}
                  </h3>
                  <p className={styles.emptyDesc}>
                    {search
                      ? `No shipments match "${search}". Try clearing your search query.`
                      : "There are currently no shipments marked out for delivery. Shipments can be released from In-Transit."}
                  </p>
                  {search && (
                    <button type="button" onClick={() => setSearch("")} className={styles.btnActionLight} style={{ marginTop: 14, color: "#0f172a" }}>
                      Clear Search Filter
                    </button>
                  )}
                </div>
              )}

              {/* Desktop Table View */}
              {!isLoading && !error && activeDeliveryQueue.length > 0 && (
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th style={{ width: 170 }}>Dispatch Number</th>
                        <th style={{ width: 160 }}>Sales Order</th>
                        <th>Customer &amp; Destination</th>
                        <th style={{ width: 220 }}>Driver &amp; Carrier</th>
                        <th style={{ width: 150, textAlign: "center" }}>Status</th>
                        <th style={{ width: 180, textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeDeliveryQueue.map((item) => {
                        const cleanDispNo = formatCleanNo(item.dispatchNo);
                        const cleanSoNo = formatCleanNo(item.salesOrder?.orderNumber);

                        return (
                          <tr key={item.id}>
                            {/* Dispatch Number */}
                            <td>
                              <div
                                className={styles.badgeDispatchNo}
                                onClick={() => copyToClipboard(cleanDispNo)}
                                title="Click to copy Dispatch #"
                              >
                                <Truck size={13} color="#2563eb" />
                                <span>#{cleanDispNo}</span>
                                {copiedText === cleanDispNo ? (
                                  <CheckCircle2 size={12} color="#16a34a" />
                                ) : (
                                  <Copy size={11} color="#94a3b8" />
                                )}
                              </div>
                            </td>

                            {/* Sales Order */}
                            <td>
                              <span className={styles.badgeOrderNo}>
                                #{cleanSoNo}
                              </span>
                            </td>

                            {/* Customer & Destination */}
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "13.5px" }}>
                                  {item.salesOrder?.customer?.companyName || "Consignee Client"}
                                </span>
                                {item.deliveryAddress && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: "12px" }} title={item.deliveryAddress}>
                                    <MapPin size={12} color="#f59e0b" style={{ flexShrink: 0 }} />
                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }}>
                                      {item.deliveryAddress}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Driver & Carrier */}
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <User size={13} color="#64748b" />
                                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{item.driverName || "Driver Assigned"}</span>
                                </div>
                                {item.driverPhone && (
                                  <a
                                    href={`tel:${item.driverPhone}`}
                                    style={{ display: "flex", alignItems: "center", gap: 5, color: "#2563eb", fontSize: "12px", textDecoration: "none" }}
                                  >
                                    <Phone size={11} />
                                    <span>{item.driverPhone}</span>
                                  </a>
                                )}
                                {item.vehicleNumber && (
                                  <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                                    Plate: {item.vehicleNumber}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Status */}
                            <td style={{ textAlign: "center" }}>
                              <span className={styles.badgeStatusTransit}>
                                <Clock size={12} />
                                Out for Delivery
                              </span>
                            </td>

                            {/* Confirm Delivery Action */}
                            <td style={{ textAlign: "right" }}>
                              <button
                                type="button"
                                onClick={() => openModal(item)}
                                className={styles.btnConfirmDelivery}
                              >
                                <CheckCircle2 size={14} />
                                <span>Confirm Delivery</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Mobile Card List (< 768px) */}
              {!isLoading && !error && activeDeliveryQueue.length > 0 && (
                <div className={styles.mobileCardList}>
                  {activeDeliveryQueue.map((item) => {
                    const cleanDispNo = formatCleanNo(item.dispatchNo);
                    const cleanSoNo = formatCleanNo(item.salesOrder?.orderNumber);

                    return (
                      <div key={item.id} className={styles.mobileCard}>
                        <div className={styles.mobileCardHeader}>
                          <div className={styles.badgeDispatchNo}>
                            <Truck size={13} color="#2563eb" />
                            <span>#{cleanDispNo}</span>
                          </div>
                          <span className={styles.badgeStatusTransit}>Out for Delivery</span>
                        </div>

                        <div className={styles.mobileCardRow}>
                          <div className={styles.mobileCardIcon}>
                            <Building2 size={14} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: "#0f172a" }}>
                              {item.salesOrder?.customer?.companyName || "Consignee Client"}
                            </div>
                            <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                              Order #{cleanSoNo}
                            </div>
                          </div>
                        </div>

                        {item.deliveryAddress && (
                          <div className={styles.mobileCardRow}>
                            <div className={styles.mobileCardIcon}>
                              <MapPin size={14} color="#f59e0b" />
                            </div>
                            <div style={{ fontSize: "12px", color: "#475569" }}>
                              {item.deliveryAddress}
                            </div>
                          </div>
                        )}

                        <div className={styles.mobileCardRow}>
                          <div className={styles.mobileCardIcon}>
                            <User size={14} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "12.5px" }}>
                              {item.driverName || "Driver Assigned"}
                            </div>
                            {item.driverPhone && (
                              <div style={{ fontSize: "12px", color: "#2563eb" }}>
                                {item.driverPhone} · {item.vehicleNumber || "Fleet"}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openModal(item)}
                          className={styles.btnConfirmDelivery}
                          style={{ width: "100%", justifyContent: "center", padding: "10px" }}
                        >
                          <CheckCircle2 size={15} />
                          <span>Confirm Delivery Handover</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ─── TAB 2: DISPATCH HISTORY & POD ─── */}
          {activeTab === "history" && (
            <>
              {isHistoryLoading && (
                <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ height: 48, background: "#f1f5f9", borderRadius: 8 }} />
                  <div style={{ height: 48, background: "#f1f5f9", borderRadius: 8 }} />
                </div>
              )}

              {!isHistoryLoading && filteredHistoryDispatches.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconBox} style={{ background: "#f0fdf4", color: "#16a34a" }}>
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className={styles.emptyTitle}>
                    {search ? "No Matching Completed Records" : "No Delivered Records"}
                  </h3>
                  <p className={styles.emptyDesc}>
                    {search
                      ? `No delivered dispatches match "${search}". Try clearing your search query.`
                      : "Delivered shipments with verified proof of delivery (POD) will appear here."}
                  </p>
                </div>
              )}

              {!isHistoryLoading && filteredHistoryDispatches.length > 0 && (
                <>
                  {/* Desktop Table View */}
                  <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th style={{ width: 140 }}>Dispatch No.</th>
                          <th style={{ width: 130 }}>Sales Order</th>
                          <th style={{ minWidth: 160 }}>Customer & Site</th>
                          <th style={{ width: 150 }}>Products & Qty</th>
                          <th style={{ width: 160 }}>Transporter & LR</th>
                          <th style={{ width: 170 }}>Driver & Mobile</th>
                          <th style={{ width: 170 }}>Receiver Handover</th>
                          <th style={{ width: 160, textAlign: "center" }}>Actions & POD</th>
                          <th style={{ width: 110, textAlign: "center" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistoryDispatches.map((item) => {
                          const cleanDispNo = formatCleanNo(item.dispatchNo);
                          const cleanSoNo = formatCleanNo(item.salesOrder?.orderNumber);
                          const totalQty = (item.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0);
                          const primaryUnit = item.items?.[0]?.salesOrderItem?.unit || "PCS";
                          const lrDisplay = item.lrNumber || item.ewayBillNumber || item.invoiceNumber || null;

                          return (
                            <tr key={item.id}>
                              <td>
                                <div
                                  className={styles.badgeDispatchNo}
                                  onClick={() => copyToClipboard(cleanDispNo)}
                                  title="Click to copy Dispatch #"
                                >
                                  <Truck size={13} color="#2563eb" />
                                  <span>#{cleanDispNo}</span>
                                </div>
                              </td>

                              <td>
                                <span 
                                  className={styles.badgeOrderNo}
                                  onClick={() => window.open(`/orders/${cleanSoNo}`, '_blank')}
                                  style={{ cursor: "pointer" }}
                                  title="View Sales Order"
                                >
                                  #{cleanSoNo}
                                </span>
                              </td>

                              <td>
                                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                  <span style={{ fontWeight: 700, color: "#0f172a" }}>
                                    {item.salesOrder?.customer?.companyName || "Consignee Client"}
                                  </span>
                                  {item.deliveryAddress && (
                                    <span style={{ fontSize: "11px", color: "#64748b", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.deliveryAddress}>
                                      📍 {item.deliveryAddress}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td>
                                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                  <span style={{ fontWeight: 800, color: "#1e293b", fontSize: "12.5px" }}>
                                    {totalQty ? `${totalQty.toLocaleString()} ${primaryUnit}` : `${(item.items || []).length} Item(s)`}
                                  </span>
                                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                                    {(item.items || []).length} SKU line item(s)
                                  </span>
                                </div>
                              </td>

                              <td>
                                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                  <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "12px" }}>
                                    {item.transporterName || "In-House Transport"}
                                  </span>
                                  {lrDisplay ? (
                                    <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "1px 5px", borderRadius: 4, width: "max-content", fontWeight: 700 }}>
                                      LR: #{lrDisplay}
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>No LR Stored</span>
                                  )}
                                </div>
                              </td>

                              <td>
                                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                  <span style={{ fontWeight: 700, color: "#334155" }}>{item.driverName || "Driver Assigned"}</span>
                                  {item.driverPhone && (
                                    <a 
                                      href={`tel:${item.driverPhone}`} 
                                      style={{ fontSize: "11.5px", color: "#2563eb", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}
                                      title="Call Driver"
                                    >
                                      <Phone size={11} /> {item.driverPhone}
                                    </a>
                                  )}
                                  {item.vehicleNumber && (
                                    <span style={{ fontSize: "10.5px", color: "#64748b", fontFamily: "monospace" }}>
                                      {item.vehicleNumber}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td>
                                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <User size={13} color="#16a34a" />
                                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{item.receivedBy || "Recipient Signed"}</span>
                                  </div>
                                  {item.receiverPhone && (
                                    <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                                      Tel: {item.receiverPhone}
                                    </span>
                                  )}
                                  <span style={{ fontSize: "10.5px", color: "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}>
                                    <Clock size={10} />
                                    {item.deliveredAt ? new Date(item.deliveredAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                                  </span>
                                </div>
                              </td>

                              <td style={{ textAlign: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                  <button
                                    type="button"
                                    onClick={() => setViewingHistoryItem(item)}
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      padding: "5px 10px",
                                      borderRadius: 6,
                                      background: "#f8fafc",
                                      border: "1px solid #cbd5e1",
                                      color: "#334155",
                                      fontSize: 11.5,
                                      fontWeight: 700,
                                      cursor: "pointer",
                                    }}
                                    title="View Complete Dispatch Information"
                                  >
                                    <Eye size={13} color="#2563eb" />
                                    <span>View</span>
                                  </button>

                                  {item.podUrl ? (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedPodImage(item.podUrl)}
                                      className={styles.btnViewPod}
                                      style={{ padding: "5px 9px", fontSize: 11.5 }}
                                      title="View Proof of Delivery (POD)"
                                    >
                                      <ImageIcon size={13} color="#16a34a" />
                                      <span>POD</span>
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>No POD</span>
                                  )}
                                </div>
                              </td>

                              <td style={{ textAlign: "center" }}>
                                <span className={styles.badgeStatusDelivered}>
                                  <CheckCircle2 size={12} />
                                  Delivered
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards for History */}
                  <div className={styles.mobileCardList}>
                    {filteredHistoryDispatches.map((item) => {
                      const cleanDispNo = formatCleanNo(item.dispatchNo);
                      const cleanSoNo = formatCleanNo(item.salesOrder?.orderNumber);
                      const totalQty = (item.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0);
                      const primaryUnit = item.items?.[0]?.salesOrderItem?.unit || "PCS";
                      const lrDisplay = item.lrNumber || item.ewayBillNumber || item.invoiceNumber || null;

                      return (
                        <div key={item.id} className={styles.deliveryCard}>
                          <div className={styles.cardHeader}>
                            <div className={styles.cardHeaderLeft}>
                              <div className={styles.badgeDispatchNo}>
                                <Truck size={13} color="#2563eb" />
                                <span>#{cleanDispNo}</span>
                              </div>
                              <span className={styles.badgeOrderNo}>
                                #{cleanSoNo}
                              </span>
                            </div>
                            <span className={styles.badgeStatusDelivered}>
                              <CheckCircle2 size={12} /> Delivered
                            </span>
                          </div>

                          <div className={styles.cardCompany}>
                            {item.salesOrder?.customer?.companyName || "Consignee Client"}
                          </div>

                          {item.deliveryAddress && (
                            <div className={styles.cardAddress}>
                              <MapPin size={14} className={styles.cardAddressIcon} />
                              <span className={styles.cardAddressText}>{item.deliveryAddress}</span>
                            </div>
                          )}

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #f1f5f9", fontSize: "12px", margin: "8px 0" }}>
                            <div>
                              <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Products</span>
                              <strong style={{ color: "#0f172a" }}>{totalQty ? `${totalQty} ${primaryUnit}` : `${(item.items || []).length} Items`}</strong>
                            </div>
                            <div>
                              <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>LR Number</span>
                              <strong style={{ color: "#2563eb", fontFamily: "monospace" }}>{lrDisplay ? `#${lrDisplay}` : "Direct"}</strong>
                            </div>
                            <div>
                              <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Driver</span>
                              <span style={{ color: "#334155", fontWeight: 700 }}>{item.driverName || "Driver"}</span>
                            </div>
                            <div>
                              <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>Driver Phone</span>
                              <span style={{ color: "#2563eb", fontWeight: 700 }}>{item.driverPhone ? `+91 ${item.driverPhone}` : "—"}</span>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                            <button
                              type="button"
                              onClick={() => setViewingHistoryItem(item)}
                              style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                padding: "8px 12px",
                                borderRadius: 8,
                                background: "#eff6ff",
                                border: "1px solid #bfdbfe",
                                color: "#1d4ed8",
                                fontSize: 12.5,
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              <Eye size={14} /> View All Info
                            </button>
                            {item.podUrl && (
                              <button
                                type="button"
                                onClick={() => setSelectedPodImage(item.podUrl)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 6,
                                  padding: "8px 14px",
                                  borderRadius: 8,
                                  background: "#f0fdf4",
                                  border: "1px solid #bbf7d0",
                                  color: "#166534",
                                  fontSize: 12.5,
                                  fontWeight: 700,
                                  cursor: "pointer"
                                }}
                              >
                                <ImageIcon size={14} /> POD
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── CONFIRM DELIVERY MODAL ─── */}
      {selectedDispatch && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <div className={styles.modalIconBox}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className={styles.modalTitle}>Confirm Delivery Handover</h3>
                  <p className={styles.modalSubtitle}>
                    Dispatch #{formatCleanNo(selectedDispatch.dispatchNo)}
                  </p>
                </div>
              </div>
              <button type="button" onClick={closeModal} className={styles.modalCloseBtn}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmDelivery}>
              <div className={styles.modalBody}>
                {/* Order Summary Box */}
                <div className={styles.modalOrderSummary}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                    <span style={{ color: "#64748b" }}>Consignee:</span>
                    <span style={{ fontWeight: 800, color: "#0f172a" }}>
                      {selectedDispatch.salesOrder?.customer?.companyName || "Client Consignee"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                    <span style={{ color: "#64748b" }}>Sales Order:</span>
                    <span style={{ fontWeight: 700, fontFamily: "monospace", color: "#2563eb" }}>
                      #{formatCleanNo(selectedDispatch.salesOrder?.orderNumber)}
                    </span>
                  </div>
                  {selectedDispatch.deliveryAddress && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", borderTop: "1px dashed #e2e8f0", paddingTop: 6 }}>
                      <span style={{ color: "#64748b" }}>Destination:</span>
                      <span style={{ fontWeight: 500, color: "#334155", maxWidth: "65%", textAlign: "right" }}>
                        {selectedDispatch.deliveryAddress}
                      </span>
                    </div>
                  )}
                </div>

                {/* Receiver Name */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Receiver Person Name<span className={styles.formLabelRequired}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="e.g. Anand Sharma (Site Manager)"
                    className={styles.formInput}
                  />
                </div>

                {/* Receiver Phone */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Receiver Mobile Number<span className={styles.formLabelRequired}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={receiverMobile}
                    onChange={(e) => setReceiverMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="e.g. 9876543210 (10-digit mobile)"
                    className={styles.formInput}
                  />
                </div>

                {/* Delivery Remarks */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Handover Remarks / Notes</label>
                  <textarea
                    value={deliveryRemarks}
                    onChange={(e) => setDeliveryRemarks(e.target.value)}
                    placeholder="e.g. Received in good condition with signed gate pass."
                    className={styles.formTextarea}
                  />
                </div>

                {/* POD Upload */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Proof of Delivery (POD) Image / Doc<span className={styles.formLabelRequired}>*</span>
                  </label>
                  {!deliveryImagePreview ? (
                    <label className={styles.fileDropzone}>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                      />
                      <Upload size={24} color="#3b82f6" />
                      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "13px" }}>
                        Upload or Drag Signed POD Document
                      </span>
                      <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                        JPG, PNG, WebP or PDF (Max 5 MB)
                      </span>
                    </label>
                  ) : (
                    <div className={styles.previewImageWrap}>
                      <img
                        src={deliveryImagePreview}
                        alt="POD Preview"
                        className={styles.previewImage}
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className={styles.btnRemoveImage}
                        title="Remove Image"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={closeModal} className={styles.btnModalCancel}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.btnModalSubmit}
                >
                  <CheckCircle2 size={15} />
                  <span>{isSubmitting ? "Submitting..." : "Mark as Delivered"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── FULL DISPATCH & DELIVERY DETAILS MODAL ─── */}
      {viewingHistoryItem && (() => {
        const cleanDispNo = formatCleanNo(viewingHistoryItem.dispatchNo);
        const cleanSoNo = formatCleanNo(viewingHistoryItem.salesOrder?.orderNumber);
        const totalQty = (viewingHistoryItem.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0);
        const primaryUnit = viewingHistoryItem.items?.[0]?.salesOrderItem?.unit || "PCS";
        const lrNumberVal = viewingHistoryItem.lrNumber || viewingHistoryItem.ewayBillNumber || viewingHistoryItem.invoiceNumber || "—";
        const podAsset = viewingHistoryItem.podUrl ? getBackendAssetUrl(viewingHistoryItem.podUrl) : null;

        return (
          <div 
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9990,
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
            onClick={() => setViewingHistoryItem(null)}
          >
            <div 
              style={{
                position: "relative",
                maxWidth: 920,
                width: "100%",
                maxHeight: "92vh",
                background: "#ffffff",
                borderRadius: 18,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                border: "1px solid #e2e8f0"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ padding: "18px 24px", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(37,99,235,0.2)", border: "1px solid rgba(59,130,246,0.4)", display: "grid", placeItems: "center", color: "#60a5fa" }}>
                    <Truck size={22} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#ffffff" }}>
                        Dispatch #{cleanDispNo}
                      </h3>
                      <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", color: "#34d399", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={12} /> DELIVERED
                      </span>
                    </div>
                    <p style={{ margin: "3px 0 0 0", fontSize: 12, color: "#94a3b8" }}>
                      Sales Order: <strong style={{ color: "#60a5fa", cursor: "pointer" }} onClick={() => window.open(`/orders/${cleanSoNo}`, '_blank')}>#{cleanSoNo}</strong> • Delivered on {viewingHistoryItem.deliveredAt ? new Date(viewingHistoryItem.deliveredAt).toLocaleString("en-IN") : "—"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingHistoryItem(null)}
                  style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "grid", placeItems: "center", color: "#cbd5e1", cursor: "pointer", transition: "all 0.15s" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body: Scrollable Details */}
              <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20, background: "#f8fafc" }}>
                
                {/* 2-Column Info Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                  
                  {/* Card 1: Consignee & Site */}
                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                      <Building2 size={14} color="#2563eb" /> Customer & Delivery Destination
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div>
                        <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>Customer / Consignee:</span>
                        <strong style={{ fontSize: 14, color: "#0f172a" }}>
                          {viewingHistoryItem.salesOrder?.customer?.companyName || "Consignee Client"}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>Destination Site Address:</span>
                        <span style={{ fontSize: 12.5, color: "#334155", lineHeight: 1.4 }}>
                          📍 {viewingHistoryItem.deliveryAddress || viewingHistoryItem.salesOrder?.customer?.address || "Factory Staging Area / Site Delivery"}
                        </span>
                      </div>
                      {viewingHistoryItem.specialInstructions && (
                        <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: 6, fontSize: 11.5, color: "#475569" }}>
                          <strong>Notes:</strong> {viewingHistoryItem.specialInstructions}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Driver, Vehicle & LR Logistics */}
                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                      <Truck size={14} color="#2563eb" /> Transporter, Driver & LR Details
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>Carrier / Transporter</span>
                        <strong style={{ fontSize: 12.5, color: "#0f172a" }}>
                          {viewingHistoryItem.transporterName || "In-House Fleet"}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>LR / Consignment No.</span>
                        <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 800, color: "#2563eb", background: "#eff6ff", padding: "2px 6px", borderRadius: 4, display: "inline-block" }}>
                          #{lrNumberVal}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>Driver Name</span>
                        <strong style={{ fontSize: 12.5, color: "#334155" }}>
                          {viewingHistoryItem.driverName || "Driver Assigned"}
                        </strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>Driver Mobile Phone</span>
                        {viewingHistoryItem.driverPhone ? (
                          <a 
                            href={`tel:${viewingHistoryItem.driverPhone}`}
                            style={{ fontSize: 12.5, fontWeight: 800, color: "#2563eb", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                          >
                            <Phone size={12} /> {viewingHistoryItem.driverPhone}
                          </a>
                        ) : (
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
                        )}
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>Vehicle Number</span>
                        <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>
                          {viewingHistoryItem.vehicleNumber || "—"}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>E-Way Bill / Gate Pass</span>
                        <span style={{ fontSize: 11.5, color: "#475569" }}>
                          {viewingHistoryItem.ewayBillNumber ? `E-Way: ${viewingHistoryItem.ewayBillNumber}` : viewingHistoryItem.gatePassNumber ? `GP: ${viewingHistoryItem.gatePassNumber}` : "Standard"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Receiver & Handover Confirmation */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                    <CheckCircle2 size={14} color="#16a34a" /> Delivery Handover & Recipient Verification
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, background: "#f0fdf4", padding: "12px 16px", borderRadius: 8, border: "1px solid #dcfce7" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#166534", display: "block", fontWeight: 600 }}>Received By Person</span>
                      <strong style={{ fontSize: 13.5, color: "#0f172a" }}>
                        {viewingHistoryItem.receivedBy || "Authorized Representative"}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#166534", display: "block", fontWeight: 600 }}>Receiver Mobile Phone</span>
                      <strong style={{ fontSize: 13, color: "#15803d" }}>
                        {viewingHistoryItem.receiverPhone ? `+91 ${viewingHistoryItem.receiverPhone}` : "—"}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#166534", display: "block", fontWeight: 600 }}>Delivered Timestamp</span>
                      <strong style={{ fontSize: 12.5, color: "#0f172a" }}>
                        {viewingHistoryItem.deliveredAt ? new Date(viewingHistoryItem.deliveredAt).toLocaleString("en-IN") : "—"}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#166534", display: "block", fontWeight: 600 }}>Handover Remarks</span>
                      <span style={{ fontSize: 12, color: "#334155" }}>
                        {viewingHistoryItem.deliveryRemarks || "Completed without exceptions."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Dispatched Line Items Table */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
                      <Package size={14} color="#2563eb" /> Dispatched Products & Quantities ({(viewingHistoryItem.items || []).length})
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#1e293b", background: "#f1f5f9", padding: "3px 10px", borderRadius: 6 }}>
                      Total Units: {totalQty.toLocaleString()} {primaryUnit}
                    </span>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, textAlign: "left" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                          <th style={{ padding: "8px 12px" }}>#</th>
                          <th style={{ padding: "8px 12px" }}>Product Name & Details</th>
                          <th style={{ padding: "8px 12px", textAlign: "center" }}>Dispatched / Delivered Qty</th>
                          <th style={{ padding: "8px 12px", textAlign: "center" }}>Unit</th>
                        </tr>
                      </thead>
                      <tbody style={{ borderBottom: "1px solid #e2e8f0" }}>
                        {(viewingHistoryItem.items || []).map((it, idx) => {
                          const pName = it.salesOrderItem?.productNameSnapshot || "Standard Product";
                          const pCode = it.salesOrderItem?.productCodeSnapshot || "—";
                          const itQty = Number(it.quantity || it.deliveredQuantity || 0);
                          const itUnit = it.salesOrderItem?.unit || "PCS";

                          return (
                            <tr key={it.id || idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                              <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{idx + 1}</td>
                              <td style={{ padding: "10px 12px" }}>
                                <div style={{ fontWeight: 700, color: "#0f172a" }}>{pName}</div>
                                {pCode && pCode !== "—" && (
                                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b" }}>SKU: {pCode}</div>
                                )}
                              </td>
                              <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 800, color: "#16a34a" }}>
                                {itQty.toLocaleString()}
                              </td>
                              <td style={{ padding: "10px 12px", textAlign: "center", color: "#475569", fontWeight: 600 }}>
                                {itUnit}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Card 5: Proof of Delivery (POD) Document Preview */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
                      <ImageIcon size={14} color="#2563eb" /> Verified Proof of Delivery (POD)
                    </div>
                    {podAsset && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <a
                          href={podAsset}
                          download={`POD_${cleanDispNo}`}
                          style={{ fontSize: 11.5, fontWeight: 700, color: "#334155", background: "#f1f5f9", padding: "5px 10px", borderRadius: 6, textDecoration: "none", border: "1px solid #cbd5e1", display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          <Download size={12} /> Download POD
                        </a>
                        <a
                          href={podAsset}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 11.5, fontWeight: 700, color: "#ffffff", background: "#2563eb", padding: "5px 12px", borderRadius: 6, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          <ExternalLink size={12} /> Open in New Tab
                        </a>
                      </div>
                    )}
                  </div>

                  {podAsset ? (
                    <div style={{ background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", padding: 12, textAlign: "center", maxHeight: 320, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {podAsset.toLowerCase().includes(".pdf") ? (
                        <iframe
                          src={podAsset}
                          style={{ width: "100%", height: 280, border: "none", borderRadius: 6 }}
                          title="POD PDF Document"
                        />
                      ) : (
                        <img
                          src={podAsset}
                          alt="Proof of Delivery Document"
                          style={{ maxWidth: "100%", maxHeight: 280, objectFit: "contain", borderRadius: 6, cursor: "zoom-in" }}
                          onClick={() => setSelectedPodImage(viewingHistoryItem.podUrl)}
                          onError={(e: any) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.style.display = "none";
                            const fb = document.getElementById("detail-pod-fallback");
                            if (fb) fb.style.display = "flex";
                          }}
                        />
                      )}
                      <div id="detail-pod-fallback" style={{ display: "none", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 8, color: "#64748b" }}>
                        <FileText size={32} color="#3b82f6" />
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>Signed Handover Document</div>
                        <div style={{ fontSize: 12 }}>Click 'Open in New Tab' above to view the high-resolution file.</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: 24, textAlign: "center", background: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1", color: "#64748b", fontSize: 12.5 }}>
                      No digital POD uploaded for this legacy record.
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer */}
              <div style={{ padding: "14px 24px", background: "#ffffff", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1px solid #cbd5e1", padding: "8px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, color: "#334155", cursor: "pointer" }}
                >
                  <Printer size={14} /> Print Receipt
                </button>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => window.open(`/orders/${cleanSoNo}`, '_blank')}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#eff6ff", border: "1px solid #bfdbfe", padding: "8px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, color: "#1d4ed8", cursor: "pointer" }}
                  >
                    View Sales Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingHistoryItem(null)}
                    style={{ background: "#0f172a", color: "#ffffff", border: "none", padding: "8px 18px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── POD IMAGE / DOCUMENT LIGHTBOX ─── */}
      {selectedPodImage && (() => {
        const podAssetUrl = getBackendAssetUrl(selectedPodImage);

        return (
          <div className={styles.lightboxBackdrop} onClick={() => setSelectedPodImage(null)}>
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setSelectedPodImage(null)}
              title="Close Lightbox"
            >
              <X size={20} />
            </button>
            <div className={styles.lightboxImageWrap} onClick={(e) => e.stopPropagation()}>
              <div style={{ background: "#ffffff", borderRadius: 16, overflow: "hidden", maxWidth: 800, width: "100%", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ImageIcon size={18} color="#2563eb" />
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Proof of Delivery (POD) Document</span>
                  </div>
                  <button type="button" onClick={() => setSelectedPodImage(null)} style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 28, height: 28, display: "grid", placeItems: "center", cursor: "pointer" }}>
                    <X size={15} />
                  </button>
                </div>
                <div style={{ padding: 16, textAlign: "center", background: "#f8fafc", maxHeight: "70vh", overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {podAssetUrl.toLowerCase().includes(".pdf") ? (
                    <iframe
                      src={podAssetUrl}
                      style={{ width: "100%", height: "65vh", border: "none", borderRadius: 8 }}
                      title="POD PDF Document"
                    />
                  ) : (
                    <img
                      src={podAssetUrl}
                      alt="Proof of Delivery Document"
                      style={{ maxWidth: "100%", maxHeight: "65vh", objectFit: "contain", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff" }}
                      onError={(e: any) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = "none";
                        const fb = document.getElementById("pod-img-fallback-box");
                        if (fb) fb.style.display = "flex";
                      }}
                    />
                  )}
                  <div id="pod-img-fallback-box" style={{ display: "none", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 10, color: "#64748b" }}>
                    <FileText size={36} color="#3b82f6" />
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>POD Document Preview</div>
                    <div style={{ fontSize: 12 }}>Click below to open the file in a new tab.</div>
                  </div>
                </div>
                <div style={{ padding: "14px 20px", background: "#ffffff", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Official Consignee Handover Receipt</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <a
                      href={podAssetUrl}
                      download="Proof_of_Delivery"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f1f5f9", color: "#334155", textDecoration: "none", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "1px solid #cbd5e1" }}
                    >
                      <Download size={13} /> Download
                    </a>
                    <a
                      href={podAssetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#2563eb", color: "#fff", textDecoration: "none", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}
                    >
                      <ExternalLink size={13} /> Open in New Tab
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

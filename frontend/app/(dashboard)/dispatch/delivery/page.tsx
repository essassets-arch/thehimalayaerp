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
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

import { backendFetch } from "@/lib/backendFetch";
import styles from "./delivery.module.css";

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
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th style={{ width: 160 }}>Dispatch No.</th>
                        <th style={{ width: 150 }}>Sales Order</th>
                        <th>Customer</th>
                        <th style={{ width: 220 }}>Receiver Details</th>
                        <th style={{ width: 190 }}>Driver / Vehicle</th>
                        <th style={{ width: 170 }}>Delivered Timestamp</th>
                        <th style={{ width: 130, textAlign: "center" }}>POD Proof</th>
                        <th style={{ width: 130, textAlign: "center" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistoryDispatches.map((item) => {
                        const cleanDispNo = formatCleanNo(item.dispatchNo);
                        const cleanSoNo = formatCleanNo(item.salesOrder?.orderNumber);

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
                              <span className={styles.badgeOrderNo}>
                                #{cleanSoNo}
                              </span>
                            </td>

                            <td>
                              <div style={{ fontWeight: 700, color: "#0f172a" }}>
                                {item.salesOrder?.customer?.companyName || "Consignee Client"}
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
                              </div>
                            </td>

                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={{ fontWeight: 600, color: "#334155" }}>{item.driverName || "Driver"}</span>
                                {item.vehicleNumber && (
                                  <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                                    {item.vehicleNumber}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#475569", fontSize: "12px" }}>
                                <Calendar size={12} color="#64748b" />
                                <span>
                                  {item.deliveredAt ? new Date(item.deliveredAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                                </span>
                              </div>
                            </td>

                            <td style={{ textAlign: "center" }}>
                              {item.podUrl ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedPodImage(item.podUrl)}
                                  className={styles.btnViewPod}
                                  title="View Proof of Delivery"
                                >
                                  <ImageIcon size={13} color="#2563eb" />
                                  <span>View POD</span>
                                </button>
                              ) : (
                                <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>No Image</span>
                              )}
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

      {/* ─── POD IMAGE LIGHTBOX ─── */}
      {selectedPodImage && (
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
            <img
              src={selectedPodImage}
              alt="Proof of Delivery Document"
              className={styles.lightboxImage}
            />
          </div>
        </div>
      )}
    </div>
  );
}

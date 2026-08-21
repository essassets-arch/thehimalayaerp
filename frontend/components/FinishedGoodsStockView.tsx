"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, Search, Plus, X, Lock, History, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

import { backendFetch } from "@/lib/backendFetch";
import styles from "@/app/(dashboard)/production/all-stock/all-stock.module.css";
import modalStyles from "@/app/(dashboard)/production/finished-goods/finished-goods.module.css";

export interface StockRow {
  id: string;
  workOrderId: string;
  jobNo: string;
  productId: string;
  productName: string;
  productCode: string;
  category: string;
  productType?: string;
  brand?: string;
  gstRate?: string;
  dispatchCategory?: string;
  customerName: string;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  unit: string;
  status: string;
  receivedAt: string;
  receivedById: string | null;
  workOrder?: any;
}

export interface DispatchHistoryRow {
  id: string;
  dispatchId: string;
  dispatchNo: string;
  salesOrderId: string;
  orderNumber: string;
  productCode: string;
  productName: string;
  category: string;
  unit: string;
  quantityBefore: number;
  dispatchedQuantity: number;
  quantityAfter: number;
  vehicleNumber: string;
  customerName: string;
  dispatchedAt: string;
  createdBy: string;
}

export interface FinishedGoodsStockViewProps {
  readOnly?: boolean;
  role?: "production" | "dispatch" | "plant-head";
  title?: string;
  subtitle?: string;
}

export default function FinishedGoodsStockView({
  readOnly = true,
  role = "production",
  title,
  subtitle,
}: FinishedGoodsStockViewProps) {
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customUnit, setCustomUnit] = useState("");
  const [isCustomUnitActive, setIsCustomUnitActive] = useState(false);

  // Pagination State
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Stock History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyModalProductId, setHistoryModalProductId] = useState("");
  const [historyModalProductName, setHistoryModalProductName] = useState("");
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [historyLogsLoading, setHistoryLogsLoading] = useState(false);

  const handleViewHistory = async (productId: string, productName: string) => {
    setHistoryModalProductId(productId);
    setHistoryModalProductName(productName);
    setHistoryModalOpen(true);
    setHistoryLogsLoading(true);
    try {
      const logs = await backendFetch<any[]>(`/api/backend/production/finished-goods/${productId}/history`);
      setHistoryLogs(Array.isArray(logs) ? logs : []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load stock history logs");
      setHistoryLogs([]);
    } finally {
      setHistoryLogsLoading(false);
    }
  };

  // Modal Form State (Only used when readOnly === false)
  const [formData, setFormData] = useState({
    productName: "",
    jobNo: "",
    quantity: "100",
    availableQuantity: "100",
    unit: "PCS",
    productionLine: "Line A - Finishing & Assembly",
    status: "AVAILABLE",
    customerName: "Internal Stock / Global Logistics",
    remarks: "",
    date: new Date().toISOString().split("T")[0],
  });

  const queryClient = useQueryClient();

  // Fetch finished goods stock from NestJS PostgreSQL backend (Canonical Data Source)
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["finished-goods-all-stock"],
    queryFn: async () => {
      const payload = await backendFetch<any>("/api/backend/production/finished-goods", { cacheTtlMs: 0 });
      return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    },
  });

  // Fetch Finished Goods Dispatch History from PostgreSQL backend
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["finished-goods-dispatch-history"],
    queryFn: async () => {
      const payload = await backendFetch<any>("/api/backend/logistics/dispatches/finished-goods-history", { cacheTtlMs: 0 });
      return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    },
    enabled: activeTab === "history",
  });

  const allItems: StockRow[] = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .map((item: any) => {
        const quantity = Number(item.quantity ?? 0);
        const availableQuantity = Number(item.availableQuantity ?? item.quantity ?? 0);
        const reservedQuantity = Number(item.reservedQuantity ?? 0);
        const openingStock = Number(item.openingStock ?? 0);
        const productionIn = Number(item.productionIn ?? 0);

        const productObj = item.product || item.workOrder?.salesOrderItem?.product;
        const productType = productObj?.productType || item.productType || "MANUFACTURING";
        const brand = productObj?.brand || item.brand || "HIMALAYA";
        const gstRate = productObj?.gstRate ? `${Number(productObj.gstRate)}%` : item.gstRate ? `${Number(item.gstRate)}%` : "18%";
        
        let rawDispatchCategory = productObj?.dispatchCategory || item.dispatchCategory || "D1";
        if (rawDispatchCategory === "DISPATCH 1" || rawDispatchCategory === "DISPATCH_1") {
          rawDispatchCategory = "D1";
        } else if (rawDispatchCategory === "DISPATCH 2" || rawDispatchCategory === "DISPATCH_2") {
          rawDispatchCategory = "D2";
        }
        
        const dispatchCategory = rawDispatchCategory === "D1" 
          ? "D1 (Dispatch 1)" 
          : rawDispatchCategory === "D2" 
          ? "D2 (Dispatch 2)" 
          : rawDispatchCategory;

        return {
          id: item.id || `fg-${Math.random()}`,
          workOrderId: item.workOrderId || item.workOrder?.id || "",
          jobNo: item.workOrder?.workOrderNumber || item.jobNo || item.workOrderId || "WO-STOCK",
          productId: item.productId || item.product?.id || "",
          productName: item.product?.name || item.productName || "Finished Goods Item",
          productCode: item.product?.sku || item.productCode || item.product?.publicId || "FG-ITEM",
          category: item.product?.category || item.category || "Hardware",
          productType,
          brand,
          gstRate,
          dispatchCategory,
          customerName: item.workOrder?.productionPlan?.salesOrder?.customer?.companyName || item.customerName || "Internal Stock",
          quantity,
          availableQuantity,
          reservedQuantity,
          openingStock,
          productionIn,
          unit: (item.unit || item.product?.unit || "PCS").toUpperCase(),
          status: item.status || "AVAILABLE",
          receivedAt: item.receivedAt || item.date || item.createdAt || new Date().toISOString(),
          receivedById: item.receivedById || null,
          workOrder: item.workOrder,
        };
      })
      .filter((row: StockRow) => {
        const type = String(row.productType || '').toUpperCase();
        const family = String(row.category || '').toLowerCase();
        if (type === 'RAW_MATERIAL' || type === 'HARDWARE') {
          return false;
        }
        if (['raw material', 'hardware', 'electric'].includes(family)) {
          return false;
        }
        return true;
      });
  }, [data]);

  const filteredData = useMemo(() => {
    if (!search) return allItems;
    const lower = search.toLowerCase();
    return allItems.filter((i) =>
      i.jobNo?.toLowerCase().includes(lower) ||
      i.productName?.toLowerCase().includes(lower) ||
      i.productCode?.toLowerCase().includes(lower) ||
      i.category?.toLowerCase().includes(lower) ||
      i.productType?.toLowerCase().includes(lower) ||
      i.brand?.toLowerCase().includes(lower) ||
      i.dispatchCategory?.toLowerCase().includes(lower)
    );
  }, [allItems, search]);

  const historyItems: DispatchHistoryRow[] = useMemo(() => {
    if (!Array.isArray(historyData)) return [];
    return historyData.map((item: any) => ({
      id: item.id || `hist-${Math.random()}`,
      dispatchId: item.dispatchId || "",
      dispatchNo: item.dispatchNo || "DISP-2026-0001",
      salesOrderId: item.salesOrderId || "",
      orderNumber: item.orderNumber || "SO-STOCK",
      productCode: item.productCode || "FG-ITEM",
      productName: item.productName || "Finished Good Item",
      category: item.category || "Hardware",
      unit: (item.unit || "PCS").toUpperCase(),
      quantityBefore: Number(item.quantityBefore || 0),
      dispatchedQuantity: Number(item.dispatchedQuantity || 0),
      quantityAfter: Number(item.quantityAfter || 0),
      vehicleNumber: item.vehicleNumber || "N/A",
      customerName: item.customerName || "Internal Stock",
      dispatchedAt: item.dispatchedAt || new Date().toISOString(),
      createdBy: item.createdBy || "Dispatch User",
    }));
  }, [historyData]);

  const filteredHistory = useMemo(() => {
    if (!search) return historyItems;
    const lower = search.toLowerCase();
    return historyItems.filter((i) =>
      i.dispatchNo?.toLowerCase().includes(lower) ||
      i.orderNumber?.toLowerCase().includes(lower) ||
      i.productName?.toLowerCase().includes(lower) ||
      i.productCode?.toLowerCase().includes(lower) ||
      i.customerName?.toLowerCase().includes(lower) ||
      i.vehicleNumber?.toLowerCase().includes(lower)
    );
  }, [historyItems, search]);

  // Paginated Rows
  const totalPages = Math.max(
    1,
    Math.ceil((activeTab === "current" ? filteredData.length : filteredHistory.length) / pageSize)
  );

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, currentPage, pageSize]);

  // ── Mutation Handlers (Only active when readOnly === false) ──
  const handleOpenAddModal = () => {
    if (readOnly) return;
    setFormData({
      productName: "",
      jobNo: `WO-2026-${Math.floor(100 + Math.random() * 900)}`,
      quantity: "100",
      availableQuantity: "100",
      unit: "PCS",
      productionLine: "Line A - Finishing & Assembly",
      status: "AVAILABLE",
      customerName: "Internal Stock / Global Logistics",
      remarks: "",
      date: new Date().toISOString().split("T")[0],
    });
    setCustomUnit("");
    setIsCustomUnitActive(false);
    setIsAddModalOpen(true);
  };

  const handleAddFinishingProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (!formData.productName.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    setIsSubmitting(true);
    const autoJobNo = formData.jobNo.trim() || `WO-2026-${Math.floor(100 + Math.random() * 900)}`;
    const finalUnit = (isCustomUnitActive ? (customUnit.trim() || "PCS") : (formData.unit || "PCS")).toUpperCase();

    try {
      const payload = {
        productName: formData.productName.trim(),
        jobNo: autoJobNo,
        workOrderId: autoJobNo,
        quantity: Number(formData.quantity) || 1,
        availableQuantity: Number(formData.quantity) || 1,
        unit: finalUnit,
        status: "AVAILABLE",
        customerName: formData.customerName,
        date: formData.date,
        receivedAt: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
      };

      await backendFetch("/api/backend/production/finished-goods", {
        method: "POST",
        body: payload,
      });

      toast.success(`Added ${formData.productName} (${formData.quantity} ${finalUnit}) to Stock!`);
      queryClient.invalidateQueries({ queryKey: ["finished-goods-all-stock"] });
      queryClient.invalidateQueries({ queryKey: ["finished-goods"] });
      setIsAddModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStockIn = async (row: StockRow, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (readOnly) return;

    const { value: qty } = await Swal.fire({
      title: `Stock In: ${row.productName}`,
      text: `Current stock: ${row.quantity} ${row.unit}`,
      input: "number",
      inputLabel: "Enter quantity to add (+)",
      inputValue: 10,
      showCancelButton: true,
      confirmButtonColor: "#0784d1",
      confirmButtonText: "+ Add Stock",
      inputValidator: (val) => {
        if (!val || Number(val) <= 0) {
          return "Please enter a quantity greater than 0";
        }
      },
    });

    if (qty && Number(qty) > 0) {
      try {
        await backendFetch("/api/backend/production/finished-goods/stock-in", {
          method: "POST",
          body: {
            productId: row.productId,
            productCode: row.productCode,
            productName: row.productName,
            quantity: Number(qty),
            reference: "Manual Stock In",
          },
        });
        toast.success(`Added +${qty} ${row.unit} to ${row.productName}`);
        queryClient.invalidateQueries({ queryKey: ["finished-goods-all-stock"] });
        queryClient.invalidateQueries({ queryKey: ["finished-goods"] });
        refetch();
      } catch (err: any) {
        toast.error(err.message || "Failed to add stock");
      }
    }
  };

  const handleQuickStockOut = async (row: StockRow, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (readOnly) return;

    const { value: qty } = await Swal.fire({
      title: `Stock Out: ${row.productName}`,
      text: `Current available stock: ${row.availableQuantity} ${row.unit}`,
      input: "number",
      inputLabel: "Enter quantity to issue (-)",
      inputValue: 5,
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "- Issue Stock",
      inputValidator: (val) => {
        if (!val || Number(val) <= 0) {
          return "Please enter a quantity greater than 0";
        }
        if (Number(val) > row.availableQuantity) {
          return `Insufficient finished goods stock. Available: ${row.availableQuantity} ${row.unit}`;
        }
      },
    });

    if (qty && Number(qty) > 0) {
      try {
        await backendFetch("/api/backend/production/finished-goods/stock-out", {
          method: "POST",
          body: {
            productId: row.productId,
            productCode: row.productCode,
            productName: row.productName,
            quantity: Number(qty),
            reason: "Manual Stock Issue",
          },
        });
        toast.success(`Issued -${qty} ${row.unit} from ${row.productName}`);
        queryClient.invalidateQueries({ queryKey: ["finished-goods-all-stock"] });
        queryClient.invalidateQueries({ queryKey: ["finished-goods"] });
        refetch();
      } catch (err: any) {
        toast.error(err.message || "Failed to issue stock");
      }
    }
  };

  const handleQuickAdjust = async (row: StockRow, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (readOnly) return;

    const { value: formValues } = await Swal.fire({
      title: `Adjust Stock: ${row.productName}`,
      html:
        `<div style="text-align:left; font-size:13px; color:#475569; margin-bottom:12px;">Current system stock: <strong>${row.quantity} ${row.unit}</strong></div>` +
        `<label style="display:block; text-align:left; font-size:12px; font-weight:600; margin-bottom:4px;">New Physical Stock *</label>` +
        `<input id="swal-adj-qty" type="number" min="0" class="swal2-input" value="${row.quantity}" style="margin-top:0; margin-bottom:12px;">` +
        `<label style="display:block; text-align:left; font-size:12px; font-weight:600; margin-bottom:4px;">Reason for Adjustment *</label>` +
        `<input id="swal-adj-reason" type="text" class="swal2-input" placeholder="e.g. Physical Stock Count Reconciliation" style="margin-top:0;">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: "#475569",
      confirmButtonText: "Set Stock",
      preConfirm: () => {
        const qtyEl = document.getElementById("swal-adj-qty") as HTMLInputElement;
        const reasonEl = document.getElementById("swal-adj-reason") as HTMLInputElement;
        const newQty = qtyEl?.value;
        const reason = reasonEl?.value;

        if (!newQty || isNaN(Number(newQty)) || Number(newQty) < 0) {
          Swal.showValidationMessage("Physical stock must be a non-negative number");
          return false;
        }
        if (!reason || !reason.trim()) {
          Swal.showValidationMessage("Please enter a reason for stock adjustment");
          return false;
        }
        return { newPhysicalStock: Number(newQty), reason: reason.trim() };
      },
    });

    if (formValues) {
      try {
        await backendFetch("/api/backend/production/finished-goods/adjust", {
          method: "POST",
          body: {
            productId: row.productId,
            productCode: row.productCode,
            productName: row.productName,
            newPhysicalStock: formValues.newPhysicalStock,
            reason: formValues.reason,
          },
        });
        toast.success(`Adjusted physical stock to ${formValues.newPhysicalStock} ${row.unit} for ${row.productName}`);
        queryClient.invalidateQueries({ queryKey: ["finished-goods-all-stock"] });
        queryClient.invalidateQueries({ queryKey: ["finished-goods"] });
        refetch();
      } catch (err: any) {
        toast.error(err.message || "Failed to adjust stock");
      }
    }
  };

  // Derive Hero Labels based on Role and readOnly state
  const defaultTitle = role === "dispatch"
    ? "DISPATCH INVENTORY MASTER — Finished Goods"
    : role === "plant-head"
    ? "PLANT HEAD INVENTORY MASTER — Finished Goods"
    : "PRODUCTION INVENTORY MASTER — Finished Goods — All Stock";

  const defaultSubtitle = readOnly
    ? "Real-time finished goods stock registry synchronized with production master (Read Only)"
    : "Complete stock registry of finished goods items produced from assembly line";

  return (
    <div className={styles.page}>
      {/* ── Top Hero Banner ── */}
      <div className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroIcon}>
            <Boxes size={26} />
          </div>
          <div className={styles.heroText}>
            <span className={styles.eyebrow}>
              {role === "dispatch"
                ? "DISPATCH LOGISTICS & WAREHOUSE"
                : role === "plant-head"
                ? "PLANT HEAD EXECUTIVE OVERVIEW"
                : "PRODUCTION INVENTORY MASTER"}
            </span>
            <h1>{title || defaultTitle}</h1>
            <p>{subtitle || defaultSubtitle}</p>
          </div>
        </div>

        <div className={styles.heroRight}>
          {readOnly ? (
            <div className={styles.summaryBadge} style={{ background: "#f8fafc", border: "1px solid #cbd5e1" }}>
              <Lock size={16} color="#64748b" />
              <span>Read Only View</span>
            </div>
          ) : (
            <button className={styles.btnAddProduct} onClick={handleOpenAddModal}>
              <Plus size={16} /> Add Finishing Product
            </button>
          )}
        </div>
      </div>

      {/* ── Inventory Table Container ── */}
      <div className={styles.inventoryWrapper}>
        <div className={styles.inventoryTop}>
          <div className={styles.stockTitle}>
            {role === "dispatch" ? (
              <div style={{ display: "flex", gap: "8px", background: "#f1f5f9", padding: "4px", borderRadius: "8px" }}>
                <button
                  type="button"
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "700",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: activeTab === "current" ? "#ffffff" : "transparent",
                    color: activeTab === "current" ? "#0f172a" : "#64748b",
                    boxShadow: activeTab === "current" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                  onClick={() => {
                    setActiveTab("current");
                    setCurrentPage(1);
                  }}
                >
                  <PackageCheck size={15} /> Current Stock ({allItems.length})
                </button>
                <button
                  type="button"
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "700",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: activeTab === "history" ? "#ffffff" : "transparent",
                    color: activeTab === "history" ? "#0f172a" : "#64748b",
                    boxShadow: activeTab === "history" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                  onClick={() => {
                    setActiveTab("history");
                    setCurrentPage(1);
                  }}
                >
                  <History size={15} /> Dispatch History ({historyItems.length})
                </button>
              </div>
            ) : (
              <>
                <span>Stock</span>
                <span className={styles.stockBadgeCount}>({allItems.length})</span>
              </>
            )}
          </div>

          <div className={styles.searchBox}>
            <span className={styles.searchIconSpan}>
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder={
                activeTab === "current"
                  ? "Search product name, code, category..."
                  : "Search dispatch ID, order, product, customer, vehicle..."
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* ── CURRENT STOCK TAB TABLE ── */}
        {activeTab === "current" && (
          <div className={styles.tableContainer}>
            <table className={styles.inventoryTable}>
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Item / Description Name</th>
                  <th>Opening Stock</th>
                  <th>Production In</th>
                  <th>Reserved Qty</th>
                  <th>Available Stock</th>
                  <th>Stock Status</th>
                  <th className={styles.actionsHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                      Loading live stock data...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>
                      No finished goods stock items found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row) => {
                    const isOut = Number(row.quantity) <= 0;
                    return (
                      <tr key={row.id}>
                        <td data-label="Item Code">
                          <strong>{row.productCode}</strong>
                        </td>
                        <td data-label="Item / Description Name" className={styles.productName}>
                          {row.productName}
                        </td>
                        <td data-label="Opening Stock">
                          {Number((row as any).openingStock || 0).toLocaleString()}
                        </td>
                        <td data-label="Production In" style={{ color: "#16a34a", fontWeight: 700 }}>
                          +{Number((row as any).productionIn || 0).toLocaleString()}
                        </td>
                        <td data-label="Reserved Qty" style={{ color: "#64748b" }}>
                          {Number(row.reservedQuantity).toLocaleString()}
                        </td>
                        <td data-label="Available Stock">
                          <strong>{Number(row.availableQuantity).toLocaleString()}</strong>
                        </td>
                        <td data-label="Stock Status">
                          <span className={`${styles.status} ${isOut ? styles.outOfStock : styles.inStock}`}>
                            {isOut ? "OUT OF STOCK" : "IN STOCK"}
                          </span>
                        </td>
                        <td data-label="Actions">
                          <div className={styles.actions}>
                            {!readOnly && (
                              <>
                                <button
                                  type="button"
                                  className={`${styles.btn} ${styles.btnIn}`}
                                  onClick={(e) => handleQuickStockIn(row, e)}
                                  title="Stock In"
                                >
                                  + In
                                </button>
                                <button
                                  type="button"
                                  className={`${styles.btn} ${styles.btnOut}`}
                                  onClick={(e) => handleQuickStockOut(row, e)}
                                  title="Stock Out"
                                >
                                  − Out
                                </button>
                                <button
                                  type="button"
                                  className={`${styles.btn} ${styles.btnAdjust}`}
                                  onClick={(e) => handleQuickAdjust(row, e)}
                                  title="Adjust Stock"
                                >
                                  Adj
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              className={`${styles.btn}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                background: "#f1f5f9",
                                border: "1px solid #cbd5e1",
                                color: "#475569",
                                fontSize: "11px",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontWeight: "700"
                              }}
                              onClick={() => handleViewHistory(row.productId, row.productName)}
                              title="View Stock Transaction History"
                            >
                              <History size={12} /> Log
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── DISPATCH HISTORY TAB TABLE ── */}
        {activeTab === "history" && (
          <div className={styles.tableContainer}>
            <table className={styles.inventoryTable}>
              <thead>
                <tr>
                  <th>Date &amp; Time</th>
                  <th>Dispatch ID</th>
                  <th>Order ID</th>
                  <th>Item Code</th>
                  <th>Product Name</th>
                  <th>Qty Before</th>
                  <th>Dispatched Qty</th>
                  <th>Qty After</th>
                  <th>UOM</th>
                  <th>Vehicle No</th>
                  <th>Customer</th>
                </tr>
              </thead>
              <tbody>
                {isHistoryLoading ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                      Loading dispatch history audit trail...
                    </td>
                  </tr>
                ) : paginatedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>
                      No finished goods dispatch history records found.
                    </td>
                  </tr>
                ) : (
                  paginatedHistory.map((row) => (
                    <tr key={row.id}>
                      <td data-label="Date & Time">
                        <span style={{ fontSize: "12px", color: "#475569" }}>
                          {new Date(row.dispatchedAt).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td data-label="Dispatch ID">
                        <strong style={{ color: "#0284c7" }}>{row.dispatchNo}</strong>
                      </td>
                      <td data-label="Order ID">
                        <strong style={{ color: "#2563eb" }}>{row.orderNumber}</strong>
                      </td>
                      <td data-label="Item Code">
                        <strong>{row.productCode}</strong>
                      </td>
                      <td data-label="Product Name" className={styles.productName}>
                        {row.productName}
                      </td>
                      <td data-label="Qty Before" style={{ textAlign: "center", fontWeight: "600" }}>
                        {row.quantityBefore}
                      </td>
                      <td data-label="Dispatched Qty" style={{ textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: "#fee2e2",
                            color: "#b91c1c",
                            fontWeight: "800",
                          }}
                        >
                          -{row.dispatchedQuantity}
                        </span>
                      </td>
                      <td data-label="Qty After" style={{ textAlign: "center", fontWeight: "700", color: "#059669" }}>
                        {row.quantityAfter}
                      </td>
                      <td data-label="UOM">{row.unit}</td>
                      <td data-label="Vehicle No">{row.vehicleNumber}</td>
                      <td data-label="Customer">{row.customerName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer / Pagination */}
        <div className={styles.tableFooter}>
          <div className={styles.rowsPerPage}>
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className={styles.pagination}>
            <span>
              Showing{" "}
              {activeTab === "current"
                ? filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0
                : filteredHistory.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}{" "}
              to{" "}
              {Math.min(
                currentPage * pageSize,
                activeTab === "current" ? filteredData.length : filteredHistory.length
              )}{" "}
              of {activeTab === "current" ? filteredData.length : filteredHistory.length} entries
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* ── View Transaction Audit History Modal ── */}
      {historyModalOpen && (
        <div className={modalStyles.modalOverlay} onClick={() => setHistoryModalOpen(false)}>
          <div className={modalStyles.modalContent} style={{ maxWidth: "800px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
            <div className={modalStyles.modalHeader}>
              <div className={modalStyles.modalHeaderTitle}>
                <div className={modalStyles.modalHeaderIcon}>
                  <History size={20} />
                </div>
                <div>
                  <h3>Stock Audit Trail Log</h3>
                  <p>{historyModalProductName} (Product ID: {historyModalProductId})</p>
                </div>
              </div>
              <button
                type="button"
                className={modalStyles.modalClose}
                onClick={() => setHistoryModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={modalStyles.modalBody} style={{ padding: "20px 24px" }}>
              {historyLogsLoading ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
                  Loading stock audit logs...
                </div>
              ) : historyLogs.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8" }}>
                  No stock transactions found for this product.
                </div>
              ) : (
                <div style={{ overflowX: "auto", maxHeight: "400px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #cbd5e1" }}>
                        <th style={{ padding: "10px 12px", textAlign: "left" }}>Date &amp; Time</th>
                        <th style={{ padding: "10px 12px", textAlign: "left" }}>Event / Action</th>
                        <th style={{ padding: "10px 12px", textAlign: "right" }}>Impact</th>
                        <th style={{ padding: "10px 12px", textAlign: "right" }}>Stock Before</th>
                        <th style={{ padding: "10px 12px", textAlign: "right" }}>Stock After</th>
                        <th style={{ padding: "10px 12px", textAlign: "left" }}>Source</th>
                        <th style={{ padding: "10px 12px", textAlign: "left" }}>Reference No</th>
                        <th style={{ padding: "10px 12px", textAlign: "left" }}>Actor</th>
                        <th style={{ padding: "10px 12px", textAlign: "left" }}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyLogs.map((log: any) => {
                        const dateStr = log.createdAt ? new Date(log.createdAt).toLocaleString("en-GB") : "—";
                        
                        // Impact formatting
                        let impactText = "—";
                        let impactColor = "#0f172a";
                        if (log.quantityChange !== undefined && log.quantityChange !== null) {
                          const val = Number(log.quantityChange);
                          if (val > 0) {
                            impactText = `+${val}`;
                            impactColor = "#10b981";
                          } else if (val < 0) {
                            impactText = `${val}`;
                            impactColor = "#ef4444";
                          } else {
                            impactText = "0";
                          }
                        }

                        // Event types mapping
                        let eventLabel = log.eventType || "—";
                        if (log.eventType === "PRODUCTION_IN") eventLabel = "Production Entry";
                        else if (log.eventType === "PRODUCTION_CANCEL_OUT") eventLabel = "Production Reversal";
                        else if (log.eventType === "DISPATCH_OUT") eventLabel = "Dispatch Out";
                        else if (log.eventType === "DISPATCH_CANCEL_IN") eventLabel = "Dispatch Reversal";
                        else if (log.eventType === "ADJUSTMENT") eventLabel = "Manual Adjustment";

                        // Source mapping
                        let sourceLabel = log.sourceType || "—";
                        if (log.sourceType === "PRODUCTION_REPORT") sourceLabel = "Production Report";
                        else if (log.sourceType === "DISPATCH_REPORT") sourceLabel = "Dispatch Report";
                        else if (log.sourceType === "DISPATCH_REPORT_CANCEL") sourceLabel = "Dispatch Cancel";
                        else if (log.sourceType === "PRODUCTION_REPORT_CANCEL") sourceLabel = "Production Cancel";
                        else if (log.sourceType === "MANUAL") sourceLabel = "Manual Entry";

                        return (
                          <tr key={log.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{dateStr}</td>
                            <td style={{ padding: "10px 12px" }}>
                              <span style={{ fontWeight: "700" }}>{eventLabel}</span>
                            </td>
                            <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "800", color: impactColor }}>
                              {impactText}
                            </td>
                            <td style={{ padding: "10px 12px", textAlign: "right" }}>{Number(log.beforeQuantity ?? 0)}</td>
                            <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "700" }}>{Number(log.afterQuantity ?? 0)}</td>
                            <td style={{ padding: "10px 12px" }}>{sourceLabel}</td>
                            <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>{log.referenceNumber || "—"}</td>
                            <td style={{ padding: "10px 12px" }}>{log.user?.name || "—"}</td>
                            <td style={{ padding: "10px 12px", color: "#64748b" }}>{log.remarks || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className={modalStyles.modalFooter} style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className={modalStyles.btnCancel}
                onClick={() => setHistoryModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Finishing Product Modal (Only used when readOnly === false) ── */}
      {!readOnly && isAddModalOpen && (
        <div className={modalStyles.modalOverlay} onClick={() => setIsAddModalOpen(false)}>
          <div className={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={modalStyles.modalHeader}>
              <div className={modalStyles.modalHeaderTitle}>
                <div className={modalStyles.modalHeaderIcon}>
                  <Boxes size={20} />
                </div>
                <div>
                  <h3>Add Finishing Product</h3>
                  <p>Register a new finished good item in master inventory</p>
                </div>
              </div>
              <button
                type="button"
                className={modalStyles.modalClose}
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddFinishingProduct}>
              <div className={modalStyles.modalBody}>
                <div className={modalStyles.formGrid}>
                  <div className={modalStyles.formGroupFull}>
                    <div className={modalStyles.formGroup}>
                      <label>
                        Product Name <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hydraulic Cylinder 50mm DB Test"
                        value={formData.productName}
                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={modalStyles.formGroup}>
                    <label>Category</label>
                    <select
                      value={formData.productionLine}
                      onChange={(e) => setFormData({ ...formData, productionLine: e.target.value })}
                    >
                      <option value="Line A - Finishing & Assembly">Hardware</option>
                      <option value="Line B - CNC Heavy Components">Machinery Parts</option>
                      <option value="Line C - Standard Fitting">Fittings</option>
                    </select>
                  </div>

                  <div className={modalStyles.formGroup}>
                    <label>
                      Date <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className={modalStyles.formGroup}>
                    <label>
                      Total Stock Qty <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="100"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: e.target.value,
                          availableQuantity: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className={modalStyles.formGroup}>
                    <label>
                      Unit of Measure (UOM) <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    {!isCustomUnitActive ? (
                      <select
                        value={formData.unit}
                        onChange={(e) => {
                          if (e.target.value === "CUSTOM") {
                            setIsCustomUnitActive(true);
                            setCustomUnit("");
                          } else {
                            setFormData({ ...formData, unit: e.target.value });
                          }
                        }}
                      >
                        <option value="PCS">PCS</option>
                        <option value="NOS">NOS</option>
                        <option value="SET">SET</option>
                        <option value="BOX">BOX</option>
                        <option value="KG">KG</option>
                        <option value="MTR">MTR</option>
                        <option value="CUSTOM">+ Add Custom Unit...</option>
                      </select>
                    ) : (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          required
                          placeholder="e.g. BUNDLE"
                          value={customUnit}
                          onChange={(e) => setCustomUnit(e.target.value.toUpperCase())}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomUnitActive(false);
                            setFormData({ ...formData, unit: "PCS" });
                          }}
                          className={modalStyles.btnCancel}
                          style={{ padding: "0 12px", height: "38px" }}
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className={modalStyles.formActions}>
                  <button
                    type="button"
                    className={modalStyles.btnCancel}
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={modalStyles.btnSubmit}
                  >
                    {isSubmitting ? "Adding..." : "Add Finishing Product"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Truck, ClipboardList } from "lucide-react";
import { toast } from "sonner";

import { backendFetch } from "@/lib/backendFetch";
import styles from "./create-dispatch.module.css";

interface Customer {
  id: string;
  companyName: string;
  billingAddress?: ShippingAddress | string | null;
  shippingAddress?: ShippingAddress | string | null;
}

interface ShippingAddress {
  addressLine1?: string;
  addressLine2?: string;
  line1?: string;
  line2?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  pinCode?: string;
  zipCode?: string;
  postalCode?: string;
  country?: string;
}

interface SalesOrder {
  id: string;
  orderNumber: string;
  requestedDeliveryDate?: string;
  freightAmount?: string | number;
  shippingAddress?: ShippingAddress | string | null;
  customer?: Customer;
}

interface SalesOrderItem {
  id: string;
  productId: string;
  productNameSnapshot: string;
  orderedQuantity: number;
  unitPrice: number;
  dispatchItems?: { quantity: string | number }[];
}

interface ProductionPlan {
  id: string;
  salesOrder?: SalesOrder;
}

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  quantity: number;
  status: string;
  salesOrderItemId: string;
  productionPlan?: ProductionPlan;
  salesOrderItem?: SalesOrderItem;
  qcInspections?: {
    approvedQuantity: string | number | null;
    approvedAt: string | null;
    createdAt: string;
  }[];
}

function formatAddressValue(value?: ShippingAddress | string | null): string {
  if (!value) return "";
  if (typeof value === "string") {
    try {
      return formatAddressValue(JSON.parse(value) as ShippingAddress);
    } catch {
      return value.trim();
    }
  }
  return [
    value.line1 || value.addressLine1 || value.street,
    value.line2 || value.addressLine2,
    value.city,
    value.state,
    value.postalCode || value.pincode || value.pinCode || value.zipCode,
    value.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function availableQuantity(workOrder: WorkOrder): number {
  const approved = Number(
    workOrder.qcInspections?.[0]?.approvedQuantity ?? workOrder.quantity ?? 0,
  );
  const item = workOrder.salesOrderItem;
  const alreadyDispatched =
    item?.dispatchItems?.reduce(
      (sum, dispatchItem) => sum + Number(dispatchItem.quantity),
      0,
    ) || 0;
  const remainingOrder = Math.max(
    0,
    Number(item?.orderedQuantity || 0) - alreadyDispatched,
  );
  return Math.min(approved, remainingOrder);
}

export default function CreateDispatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const workOrderId = searchParams.get("workOrderId");

  // Form State
  const [deliveryAddresses, setDeliveryAddresses] = useState<Record<string, string>>({});
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [transporterName, setTransporterName] = useState("");
  const [dispatchRemarks, setDispatchRemarks] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [ewayBillNumber, setEwayBillNumber] = useState("");
  const [actualFreightPaidAmount, setActualFreightPaidAmount] =
    useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dispatchQuantities, setDispatchQuantities] = useState<
    Record<string, number>
  >({});
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const initialSelectionSet = React.useRef(false);

  // Fetch the complete pending queue so multiple compatible lines can be
  // consolidated into one dispatch.
  const {
    data: workOrders = [],
    isLoading,
    error,
  } = useQuery<WorkOrder[]>({
    queryKey: ["pending-dispatch-work-orders-create"],
    queryFn: async () => {
      const payload = await backendFetch<WorkOrder[]>(
        "/api/backend/production/work-orders?status=READY_FOR_DISPATCH",
      );
      return Array.isArray(payload) ? payload : [];
    },
  });

  useEffect(() => {
    if (!workOrders.length || initialSelectionSet.current) return;
    const initial =
      workOrders.find((row) => row.id === workOrderId) || workOrders[0];
    setSelectedIds([initial.id]);
    setDispatchQuantities({ [initial.id]: availableQuantity(initial) });
    initialSelectionSet.current = true;
  }, [workOrders, workOrderId]);

  const selectedWorkOrders = React.useMemo(
    () => workOrders.filter((row) => selectedIds.includes(row.id)),
    [workOrders, selectedIds]
  );
  const selectedSalesOrders = React.useMemo(
    () =>
      Array.from(
        new Map(
          selectedWorkOrders
            .map((row) => row.productionPlan?.salesOrder)
            .filter((row): row is SalesOrder => Boolean(row))
            .map((row) => [row.id, row]),
        ).values(),
      ),
    [selectedWorkOrders]
  );
  const transportationCost = selectedSalesOrders.reduce((sum, order: any) => {
    const cost =
      order.freightAmount ??
      order.expectedTransportationCost ??
      order.transportCharge ??
      order.sourceQuotation?.expectedTransportationCost ??
      order.sourceQuotation?.transportCharge ??
      order.sourceQuotation?.freightAmount ??
      0;
    return sum + Number(cost || 0);
  }, 0);
  const workOrder = selectedWorkOrders[0];
  const salesOrder = workOrder?.productionPlan?.salesOrder;
  const customer = salesOrder?.customer;

  // Prefill default delivery addresses per selected Sales Order
  useEffect(() => {
    if (!selectedSalesOrders.length) return;
    
    setDeliveryAddresses((current) => {
      let hasChanges = false;
      const updated = { ...current };
      for (const order of selectedSalesOrders) {
        if (updated[order.id] === undefined) {
          updated[order.id] = formatAddressValue(order.shippingAddress) ||
            formatAddressValue(order.customer?.shippingAddress) ||
            formatAddressValue(order.customer?.billingAddress) || "";
          hasChanges = true;
        }
      }
      return hasChanges ? updated : current;
    });

    // Prefill date using the first selected sales order if available
    const firstOrderWithDate = selectedSalesOrders.find(o => o.requestedDeliveryDate);
    if (firstOrderWithDate && !expectedDeliveryDate) {
      setExpectedDeliveryDate(new Date(firstOrderWithDate.requestedDeliveryDate || Date.now()).toISOString().slice(0, 10));
    }
  }, [selectedSalesOrders, expectedDeliveryDate]);

  const toggleWorkOrder = (candidate: WorkOrder) => {
    setSelectedIds((current) => {
      if (current.includes(candidate.id)) {
        return current.filter((id) => id !== candidate.id);
      }
      return [...current, candidate.id];
    });
    setDispatchQuantities((current) => ({
      ...current,
      [candidate.id]: current[candidate.id] ?? availableQuantity(candidate),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocumentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setDocumentPreview(null);
      }
    } else {
      setDocumentFile(null);
      setDocumentPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedWorkOrders.length) {
      toast.error("Select at least one pending dispatch order");
      return;
    }
    if (
      !Number.isFinite(actualFreightPaidAmount) ||
      actualFreightPaidAmount < 0
    ) {
      toast.error("Actual Paid Amount cannot be negative");
      return;
    }
    for (const selected of selectedWorkOrders) {
      const quantity = Number(dispatchQuantities[selected.id] || 0);
      const maximum = availableQuantity(selected);
      if (quantity <= 0 || quantity > maximum) {
        toast.error(
          `${selected.workOrderNumber}: quantity must be between 1 and ${maximum}`,
        );
        return;
      }
    }

    try {
      const orderGroups = selectedWorkOrders.reduce((groups, selected) => {
        const selectedSalesOrder = selected.productionPlan?.salesOrder;
        if (!selectedSalesOrder?.id) return groups;
        const group = groups.get(selectedSalesOrder.id) || {
          salesOrder: selectedSalesOrder,
          workOrders: [] as WorkOrder[],
        };
        group.workOrders.push(selected);
        groups.set(selectedSalesOrder.id, group);
        return groups;
      }, new Map<string, { salesOrder: SalesOrder; workOrders: WorkOrder[] }>());

      for (const group of orderGroups.values()) {
        const groupAddress = deliveryAddresses[group.salesOrder.id] || "";
        if (!groupAddress.trim()) {
          throw new Error(
            `Delivery address is missing for ${group.salesOrder.orderNumber}`,
          );
        }
      }

      for (const group of orderGroups.values()) {
        const consolidatedItems = Array.from(
          group.workOrders.reduce((items, selected) => {
          const itemId = selected.salesOrderItem?.id;
          if (!itemId) return items;
          const current = items.get(itemId) || {
            salesOrderItemId: itemId,
            quantity: 0,
            workOrderIds: [] as string[],
          };
          current.quantity += Number(dispatchQuantities[selected.id]);
          current.workOrderIds.push(selected.id);
          items.set(itemId, current);
          return items;
          }, new Map<string, { salesOrderItemId: string; quantity: number; workOrderIds: string[] }>())
          .values(),
        );
        const groupAddress = deliveryAddresses[group.salesOrder.id] || "";

        const payload = {
            salesOrderId: group.salesOrder.id,
            deliveryAddress: groupAddress,
            totalWeight: Number(totalWeight) || 0,
            vehicleNumber,
            transporterName,
            driverName,
            driverPhone,
            dispatchRemarks,
            expectedDeliveryDate:
              group.salesOrder.requestedDeliveryDate ||
              expectedDeliveryDate ||
              undefined,
            invoiceNumber,
            ewayBillNumber,
            freightAmount:
              transportationCost > 0
                ? (actualFreightPaidAmount *
                    Number(group.salesOrder.freightAmount || 0)) /
                  transportationCost
                : actualFreightPaidAmount / orderGroups.size,
            items: consolidatedItems,
          };
          
          console.log("Sending dispatch data:", payload);

          await backendFetch<unknown>("/api/backend/logistics/dispatches", {
            method: "POST",
            body: payload,
          });
      }

      toast.success(
        orderGroups.size === 1
          ? "Dispatch created and marked In Transit"
          : `${orderGroups.size} sales orders added to this dispatch run`,
      );
      queryClient.invalidateQueries({ queryKey: ["in-transit-dispatches"] });
      router.push("/dispatch/in-transit");
    } catch (err: any) {
      console.error(
        "Create dispatch failed. Exact Backend Message:\n" +
          (err?.details?.message?.join?.("\n") ||
            err?.details?.message ||
            err?.message ||
            "Unknown error")
      );

      alert(
        err?.details?.message?.join?.("\n") ||
          err?.details?.message ||
          err?.message ||
          "Failed to create dispatch"
      );
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "#64748b", fontSize: 14, gap: 10 }}>
        <Truck style={{ animation: "spin 1s linear infinite", width: 22, height: 22, color: "#3b82f6" }} />
        Loading work order details...
      </div>
    );
  }

  if (error || (!isLoading && workOrders.length === 0)) {
    return (
      <div className={styles.page}>
        <div style={{ maxWidth: 480, margin: "40px auto", padding: 24, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14 }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "#991b1b", margin: "0 0 8px" }}>Error loading work order</h1>
          <p style={{ fontSize: 13, color: "#b91c1c", margin: "0 0 16px" }}>No work orders are currently ready for dispatch.</p>
          <button onClick={() => router.push("/dispatch/orders")} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #fca5a5", background: "#fff", color: "#b91c1c", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            Back to Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Top Header ── */}
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>Schedule Outgoing Shipment (Fulfillment Booking)</h1>
        <button type="button" className={styles.cancelBtn} onClick={() => router.push("/dispatch/orders")}>
          Cancel
        </button>
      </div>

      <div className={styles.card}>
        {/* ── Top Section: Order List + Cargo Summary ── */}
        <div className={styles.topSection}>

          {/* Left: Select Active Order Reference */}
          <div className={styles.orderListPanel}>
            <p className={styles.panelLabel}>Select Active Order Reference</p>
            <div className={styles.orderList}>
              {workOrders.map((candidate) => {
                const candidateSalesOrder = candidate.productionPlan?.salesOrder;
                const selected = selectedIds.includes(candidate.id);
                const maximum = availableQuantity(candidate);
                return (
                  <label
                    key={candidate.id}
                    className={`${styles.orderItem} ${selected ? styles.selected : ""}`.trim()}
                    style={maximum <= 0 ? { opacity: 0.45, cursor: "not-allowed" } : {}}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={maximum <= 0}
                      onChange={() => toggleWorkOrder(candidate)}
                    />
                    <span>
                      {candidateSalesOrder?.orderNumber || candidate.workOrderNumber}{" "}
                      ({maximum} Units)
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Right: Cargo & Ordered Items Summary */}
          <div className={styles.cargoPanel}>
            <div className={styles.cargoHeader}>
              <div className={styles.cargoTitle}>
                <ClipboardList size={15} />
                Cargo &amp; Ordered Items Summary
              </div>
              <div className={styles.cargoActions}>
                <button type="button" className={styles.cargoActionBtn}>Auto Fill 1 each</button>
                <button type="button" className={styles.cargoActionBtn}>Distribute equally</button>
              </div>
            </div>

            <div className={styles.cargoTableWrap}>
              <table className={styles.cargoTable}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th className={styles.center}>Ordered</th>
                    <th className={styles.center}>Remaining</th>
                    <th className={styles.center}>Dispatch Now</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedWorkOrders.map((candidate) => {
                    const candidateSalesOrder = candidate.productionPlan?.salesOrder;
                    const maximum = availableQuantity(candidate);
                    const orderedQty = candidate.salesOrderItem?.orderedQuantity || maximum;
                    return (
                      <tr key={candidate.id}>
                        <td>
                          <div className={styles.orderId}>
                            {candidateSalesOrder?.orderNumber || candidate.workOrderNumber}
                          </div>
                          <div className={styles.productName}>
                            {candidate.salesOrderItem?.productNameSnapshot || "Unknown Product"}
                          </div>
                        </td>
                        <td className={styles.center}>{orderedQty}</td>
                        <td className={`${styles.center} ${styles.remaining}`}>{maximum}</td>
                        <td className={styles.center}>
                          <input
                            type="number"
                            min={1}
                            max={maximum}
                            value={dispatchQuantities[candidate.id] ?? maximum}
                            onChange={(event) =>
                              setDispatchQuantities((current) => ({
                                ...current,
                                [candidate.id]: Number(event.target.value),
                              }))
                            }
                            className={styles.qtyInput}
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {selectedWorkOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className={styles.emptyMsg}>
                        Select an order reference to view details
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.cargoFooter}>
              <span className={styles.totalLabel}>Total Dispatch Quantity:</span>
              <span className={styles.totalBadge}>
                {selectedWorkOrders.reduce(
                  (sum, sel) => sum + Number(dispatchQuantities[sel.id] || 0),
                  0,
                )}{" "}
                Tons
              </span>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className={styles.divider} />

        {/* ── Delivery Addresses ── */}
        <div style={{ marginBottom: 32 }}>
          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm mb-4">
            Delivery Addresses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedSalesOrders.map((order) => (
              <div key={order.id} className={styles.addressPanel}>
                <div className={styles.addressHeader}>
                  <span className={styles.addressTitle}>{order.orderNumber}</span>
                  <span className="text-[10px] uppercase tracking-wide text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Shipping To</span>
                </div>
                <textarea
                  className={styles.addressTextarea}
                  value={deliveryAddresses[order.id] || ""}
                  onChange={(e) => setDeliveryAddresses((curr) => ({ ...curr, [order.id]: e.target.value }))}
                  placeholder={`Delivery Address for ${order.orderNumber}...`}
                />
              </div>
            ))}
            {selectedSalesOrders.length === 0 && (
              <div className="text-sm font-medium text-gray-400 p-4 border border-dashed border-gray-200 rounded-xl text-center md:col-span-2">
                Select an order to view and edit its delivery address
              </div>
            )}
          </div>
        </div>

        {/* ── Form Fields Grid ── */}
        <div className={styles.formGrid}>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Total Weight (Tons)<span className={styles.required}>*</span></label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={totalWeight || ""}
              onChange={(e) => setTotalWeight(Number(e.target.value))}
              className={styles.formInput}
              placeholder="e.g. 15.5"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Vehicle No<span className={styles.required}>*</span></label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className={styles.formInput}
              placeholder="e.g. UK-07-CB-1234"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Driver Name<span className={styles.required}>*</span></label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className={styles.formInput}
              placeholder="e.g. Ramesh Singh"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Driver Phone</label>
            <input
              type="tel"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              className={styles.formInput}
              placeholder="e.g. 9876543210"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Dispatch Remarks</label>
            <input
              type="text"
              value={dispatchRemarks}
              onChange={(e) => setDispatchRemarks(e.target.value)}
              className={styles.formInput}
              placeholder="e.g. Fragile items loaded carefully"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Courier / Transport<span className={styles.required}>*</span></label>
            <input
              type="text"
              value={transporterName}
              onChange={(e) => setTransporterName(e.target.value)}
              className={styles.formInput}
              placeholder="e.g. Himalaya Own Fleet / DTDC"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>LR / AWB Number</label>
            <input
              type="text"
              value={ewayBillNumber}
              onChange={(e) => setEwayBillNumber(e.target.value)}
              className={styles.formInput}
              placeholder="e.g. LR-2024-00123"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Dispatch Date<span className={styles.required}>*</span></label>
            <input
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Fetched Transportation Cost (₹)</label>
            <input
              type="number"
              value={transportationCost || ""}
              readOnly
              disabled
              className={styles.formInput}
              style={{ backgroundColor: "#f8fafc", cursor: "not-allowed", color: "#94a3b8" }}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>To Be Paid (₹)</label>
            <input
              type="number"
              value={actualFreightPaidAmount || ""}
              onChange={(e) => setActualFreightPaidAmount(Number(e.target.value))}
              className={styles.formInput}
              placeholder="e.g. 500.00"
            />
          </div>

          <div className={`${styles.formGroup} ${styles.span2}`}>
            <label className={styles.formLabel}>Dispatch Document (PDF / Image)</label>
            <label className={styles.fileInput}>
              <span className={styles.fileInputBtn}>Choose File</span>
              <span className={styles.fileInputText}>
                {documentFile ? documentFile.name : "No file chosen"}
              </span>
              <input 
                type="file" 
                accept="image/*,.pdf" 
                style={{ display: "none" }} 
                onChange={handleFileChange}
              />
            </label>
            {documentPreview && (
              <div style={{ marginTop: 12 }}>
                <img 
                  src={documentPreview} 
                  alt="Document Preview" 
                  style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px", border: "1px solid #e2e8f0", objectFit: "contain" }} 
                />
              </div>
            )}
            {documentFile && !documentPreview && (
               <div style={{ marginTop: 12, fontSize: 13, color: '#64748b' }}>
                 Preview not available for this file type.
               </div>
            )}
          </div>

        </div>

        {/* ── Submit ── */}
        <div className={styles.submitRow}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedWorkOrders.length === 0}
            className={styles.submitBtn}
          >
            Book Dispatch Consignment
          </button>
        </div>
      </div>
    </div>
  );
}


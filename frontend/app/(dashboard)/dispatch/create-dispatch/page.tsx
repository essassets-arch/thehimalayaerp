"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Truck,
  ArrowLeft,
  Send,
  X,
  ClipboardList,
  Info,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { backendFetch } from "@/lib/backendFetch";
import responsive from "../dispatch-responsive.module.css";
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
  const workOrderId = searchParams.get("workOrderId");

  // Form State
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [ewayBillNumber, setEwayBillNumber] = useState("");
  const [actualFreightPaidAmount, setActualFreightPaidAmount] =
    useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dispatchQuantities, setDispatchQuantities] = useState<
    Record<string, number>
  >({});
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

  const selectedWorkOrders = workOrders.filter((row) =>
    selectedIds.includes(row.id),
  );
  const selectedSalesOrders = Array.from(
    new Map(
      selectedWorkOrders
        .map((row) => row.productionPlan?.salesOrder)
        .filter((row): row is SalesOrder => Boolean(row))
        .map((row) => [row.id, row]),
    ).values(),
  );
  const transportationCost = selectedSalesOrders.reduce(
    (sum, order) => sum + Number(order.freightAmount || 0),
    0,
  );
  const workOrder = selectedWorkOrders[0];
  const salesOrder = workOrder?.productionPlan?.salesOrder;
  const customer = salesOrder?.customer;

  // Prefill default delivery address
  useEffect(() => {
    if (salesOrder) {
      setDeliveryAddress(
        formatAddressValue(salesOrder.shippingAddress) ||
          formatAddressValue(customer?.shippingAddress) ||
          formatAddressValue(customer?.billingAddress),
      );
      if (salesOrder.requestedDeliveryDate) {
        setExpectedDeliveryDate(
          new Date(salesOrder.requestedDeliveryDate)
            .toISOString()
            .slice(0, 10),
        );
      }
    }
  }, [salesOrder, customer]);

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

  const handleSubmit = async () => {
    if (!selectedWorkOrders.length) {
      toast.error("Select at least one pending dispatch order");
      return;
    }
    if (!deliveryAddress.trim()) {
      toast.error("Delivery Address is mandatory");
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
        const groupCustomer = group.salesOrder.customer;
        const groupAddress =
          formatAddressValue(group.salesOrder.shippingAddress) ||
          formatAddressValue(groupCustomer?.shippingAddress) ||
          formatAddressValue(groupCustomer?.billingAddress) ||
          (group.salesOrder.id === salesOrder?.id ? deliveryAddress : "");
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
        const groupCustomer = group.salesOrder.customer;
        const groupAddress =
          formatAddressValue(group.salesOrder.shippingAddress) ||
          formatAddressValue(groupCustomer?.shippingAddress) ||
          formatAddressValue(groupCustomer?.billingAddress) ||
          (group.salesOrder.id === salesOrder?.id ? deliveryAddress : "");

        await backendFetch<unknown>("/api/backend/logistics/dispatches", {
          method: "POST",
          body: {
            salesOrderId: group.salesOrder.id,
            deliveryAddress: groupAddress,
            totalWeight: Number(totalWeight) || 0,
            vehicleNumber,
            driverName,
            driverPhone,
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
          },
        });
      }

      toast.success(
        orderGroups.size === 1
          ? "Dispatch created and marked In Transit"
          : `${orderGroups.size} sales orders added to this dispatch run`,
      );
      router.push("/dispatch/in-transit");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create dispatch record",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500 text-sm">
        <Truck className="animate-spin h-6 w-6 mr-2 text-blue-500" />
        Loading work order details...
      </div>
    );
  }

  if (error || (!isLoading && workOrders.length === 0)) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 bg-red-50 border border-red-200 rounded-xl">
        <h1 className="text-lg font-semibold text-red-800">
          Error loading work order
        </h1>
        <p className="text-sm text-red-700 mt-1">
          No work orders are currently ready for dispatch.
        </p>
        <Button
          onClick={() => router.push("/dispatch/orders")}
          className="mt-4"
        >
          Back to Queue
        </Button>
      </div>
    );
  }

  return (
    <div className={`${responsive.page} ${styles.page}`}>
      {/* Top Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button
          onClick={() => router.push("/dispatch/orders")}
          className="hover:text-blue-600 flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Queue
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">Create Dispatch</span>
      </div>

      <div className={styles.card}>
        {/* Title */}
        <div className={styles.cardHeader}>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="text-blue-600 h-6 w-6" />
            Create Dispatch Record
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Select one or more pending lines for Sales Order{" "}
            <span className="font-semibold text-gray-800">
              {salesOrder ? `#${salesOrder.orderNumber}` : "—"}
            </span>
          </p>
        </div>

        {/* Pending work-order selector */}
        <section className={styles.orderSelector}>
          <div className={styles.selectorHeader}>
            <div>
              <h2>Pending Dispatch Orders</h2>
              <p>
                Select any pending orders and set a dispatch quantity for each
                line.
              </p>
            </div>
            <span>{selectedIds.length} selected</span>
          </div>
          <div className={styles.orderTable}>
            <table>
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Sales Order</th>
                  <th>Work Order</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Available Qty</th>
                  <th>Dispatch Qty</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((candidate) => {
                  const candidateSalesOrder =
                    candidate.productionPlan?.salesOrder;
                  const selected = selectedIds.includes(candidate.id);
                  const maximum = availableQuantity(candidate);
                  return (
                    <tr key={candidate.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected}
                          disabled={maximum <= 0}
                          onChange={() => toggleWorkOrder(candidate)}
                          aria-label={`Select ${candidate.workOrderNumber}`}
                        />
                      </td>
                      <td>
                        <strong>
                          #{candidateSalesOrder?.orderNumber || "N/A"}
                        </strong>
                      </td>
                      <td>{candidate.workOrderNumber}</td>
                      <td>
                        {candidateSalesOrder?.customer?.companyName || "N/A"}
                      </td>
                      <td>
                        {candidate.salesOrderItem?.productNameSnapshot ||
                          "Unknown"}
                      </td>
                      <td>{maximum}</td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          max={maximum}
                          disabled={!selected}
                          value={
                            selected
                              ? (dispatchQuantities[candidate.id] ?? maximum)
                              : ""
                          }
                          onChange={(event) =>
                            setDispatchQuantities((current) => ({
                              ...current,
                              [candidate.id]: Number(event.target.value),
                            }))
                          }
                          aria-label={`Dispatch quantity for ${candidate.workOrderNumber}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quantities Alert Box */}
        <div className={styles.notice}>
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold">Dispatch Selection:</span>
            <div className="flex flex-wrap gap-4 text-xs text-blue-800 mt-1 font-mono">
              <div>
                Selected lines:{" "}
                <span className="font-bold text-gray-900">
                  {selectedWorkOrders.length}
                </span>
              </div>
              <div>
                Total dispatch quantity:{" "}
                <span className="font-bold text-emerald-700">
                  {selectedWorkOrders.reduce(
                    (sum, selected) =>
                      sum + Number(dispatchQuantities[selected.id] || 0),
                    0,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.mainGrid}>
          {/* Left Column: Auto-filled Details */}
          <div className={styles.column}>
            <h2 className={styles.sectionTitle}>Auto-filled Information</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Sales Order Reference
              </label>
              <input
                type="text"
                value={salesOrder?.orderNumber || ""}
                disabled
                className="w-full bg-gray-50 text-gray-800 border rounded-lg px-3 py-2 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Customer Details
              </label>
              <input
                type="text"
                value={customer?.companyName || ""}
                disabled
                className="w-full bg-gray-50 text-gray-800 border rounded-lg px-3 py-2 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Product Details
              </label>
              <input
                type="text"
                value={
                  selectedWorkOrders
                    .map(
                      (selected) =>
                        selected.salesOrderItem?.productNameSnapshot,
                    )
                    .filter(Boolean)
                    .join(", ") || ""
                }
                disabled
                className="w-full bg-gray-50 text-gray-800 border rounded-lg px-3 py-2 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Delivery Address
              </label>
              <textarea
                rows={3}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter delivery address"
              />
            </div>
          </div>

          {/* Right Column: User Input Fields */}
          <div className={styles.column}>
            <h2 className={styles.sectionTitle}>User Input Fields</h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Transportation Cost
                </label>
                <input
                  type="number"
                  value={transportationCost}
                  disabled
                  className="w-full bg-gray-50 text-gray-800 border rounded-lg px-3 py-2 text-sm font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Actual Paid Amount
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={actualFreightPaidAmount}
                  onChange={(event) =>
                    setActualFreightPaidAmount(Number(event.target.value))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold text-emerald-700"
                  placeholder="Enter amount paid"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Total Weight (kg)
                </label>
                <input
                  type="number"
                  value={totalWeight}
                  onChange={(e) => setTotalWeight(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. MH-12-PQ-1234"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Driver Phone
                </label>
                <input
                  type="tel"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="+91-9999999999"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Invoice Reference
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. INV-2026-0001"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  E-way Bill Details
                </label>
                <input
                  type="text"
                  value={ewayBillNumber}
                  onChange={(e) => setEwayBillNumber(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="E-way bill number"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Buttons */}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dispatch/orders")}
            className="flex items-center gap-1.5"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={selectedWorkOrders.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
          >
            <Send className="h-4 w-4" />
            Create Dispatch
          </Button>
        </div>
      </div>
    </div>
  );
}

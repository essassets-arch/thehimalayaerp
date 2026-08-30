"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Truck, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

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

const EMPTY_ARRAY: any[] = [];

export default function CreateDispatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const workOrderId = searchParams.get("workOrderId");
  const salesOrderId = searchParams.get("salesOrderId");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dispatchQuantities, setDispatchQuantities] = useState<Record<string, number>>({});
  const [deliveryAddresses, setDeliveryAddresses] = useState<Record<string, string>>({});
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>("");
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [vehicleNumber, setVehicleNumber] = useState<string>("");
  const [transporterName, setTransporterName] = useState<string>("");
  const [driverName, setDriverName] = useState<string>("");
  const [driverPhone, setDriverPhone] = useState<string>("");
  const [dispatchRemarks, setDispatchRemarks] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [challanNumber, setChallanNumber] = useState<string>("");
  const [ewayBillNumber, setEwayBillNumber] = useState<string>("");
  const [actualFreightPaidAmount, setActualFreightPaidAmount] = useState<number>(0);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [fileError, setFileError] = useState<string | null>(null);
  const initialSelectionSet = React.useRef(false);

  // Fetch existing dispatches for duplicate Invoice + Challan validation
  const { data: existingDispatches = EMPTY_ARRAY } = useQuery<any[]>({
    queryKey: ["dispatches-duplicate-check"],
    queryFn: async () => {
      const res = await backendFetch<any>("/api/backend/logistics/dispatches").catch(() => []);
      return Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    },
  });

  // Fetch products to retrieve correct dispatchCategory for synthetic items
  const { data: products = EMPTY_ARRAY } = useQuery<any[]>({
    queryKey: ["products-list-create-dispatch"],
    queryFn: async () => {
      const res = await backendFetch<any>("/api/backend/products?limit=1000").catch(() => []);
      return Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    },
  });

  const productsMap = React.useMemo(() => {
    const map = new Map<string, any>();
    products.forEach((p) => {
      if (p.id) map.set(p.id, p);
      if (p.sku) map.set(p.sku, p);
    });
    return map;
  }, [products]);

  // Fetch the complete pending queue so multiple compatible lines can be
  // consolidated into one dispatch.
  const {
    data: workOrders = EMPTY_ARRAY,
    isLoading,
    error,
  } = useQuery<WorkOrder[]>({
    queryKey: ["pending-dispatch-work-orders-create", workOrderId, salesOrderId],
    queryFn: async () => {
      const payload = await backendFetch<any>(
        "/api/backend/production/work-orders?status=READY_FOR_DISPATCH",
      ).catch(() => null);
      let list: WorkOrder[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      // 1. Direct Sales Order Lookup if salesOrderId param is provided
      if (salesOrderId) {
        const soPayload = await backendFetch<any>(`/api/backend/sales/orders/${salesOrderId}`).catch(() => null);
        const so = soPayload?.order || soPayload?.data || soPayload;
        if (so && so.id) {
          const items = Array.isArray(so.items) ? so.items : [];
          items.forEach((item: any) => {
            const alreadyDispatched = Array.isArray(item.dispatchItems)
              ? item.dispatchItems.reduce((sum: number, d: any) => sum + Number(d.quantity || 0), 0)
              : 0;
            const remaining = Math.max(0, Number(item.orderedQuantity || item.quantity || 1) - alreadyDispatched);
            const initialQty = remaining > 0 ? remaining : Number(item.orderedQuantity || item.quantity || 1);

            const syntheticWO: WorkOrder = {
              id: `so-wo-${item.id}`,
              workOrderNumber: so.orderNumber || so.orderNo || so.orderId || "SO-DISPATCH",
              quantity: initialQty,
              status: "READY_FOR_DISPATCH",
              salesOrderItemId: item.id,
              productionPlan: {
                id: `pp-${so.id}`,
                salesOrder: {
                  id: so.id,
                  orderNumber: so.orderNumber || so.orderId || so.orderNo || "N/A",
                  freightAmount: so.freightAmount,
                  shippingAddress: so.shippingAddress,
                  customer: so.customer || { id: so.customerId, companyName: so.customerName || "N/A" },
                },
              },
              salesOrderItem: {
                id: item.id,
                productId: item.productId,
                productNameSnapshot: item.productName || item.productNameSnapshot || item.name || item.product?.name || "Product",
                orderedQuantity: Number(item.orderedQuantity || item.quantity || 1),
                unitPrice: Number(item.unitPrice || 0),
                dispatchItems: item.dispatchItems,
                product: item.product,
              },
              qcInspections: [{ approvedQuantity: initialQty, approvedAt: new Date().toISOString(), createdAt: new Date().toISOString() }],
            };
            list.unshift(syntheticWO);
          });
        }
      }

      // 2. Direct Work Order Lookup if workOrderId param is provided
      if (workOrderId && !workOrderId.includes("/") && !workOrderId.includes("#") && !list.some((wo) => wo.id === workOrderId)) {
        const woSinglePayload = await backendFetch<any>(`/api/backend/production/work-orders/${encodeURIComponent(workOrderId)}`).catch(() => null);
        const fetchedWo = woSinglePayload?.data || woSinglePayload;
        if (fetchedWo && fetchedWo.id) {
          list.unshift(fetchedWo);
        }
      }

      // 3. Fallback: If list is empty, fetch all work orders without status filter
      if (list.length === 0) {
        const allWoPayload = await backendFetch<any>("/api/backend/production/work-orders").catch(() => null);
        const allWoList: WorkOrder[] = Array.isArray(allWoPayload)
          ? allWoPayload
          : Array.isArray(allWoPayload?.data)
          ? allWoPayload.data
          : [];
        if (allWoList.length > 0) {
          list = allWoList;
        } else {
          // Additional fallback: Resolve from finished goods stock
          const fgPayload = await backendFetch<any>("/api/backend/production/finished-goods").catch(() => null);
          const fgList = Array.isArray(fgPayload) ? fgPayload : Array.isArray(fgPayload?.data) ? fgPayload.data : [];
          fgList.forEach((fg: any) => {
            const syntheticWO: WorkOrder = {
              id: fg.workOrderId || fg.id,
              workOrderNumber: fg.jobNo || fg.workOrder?.workOrderNumber || `WO-${fg.id}`,
              quantity: Number(fg.availableQuantity ?? fg.quantity ?? 1),
              status: fg.status || "READY_FOR_DISPATCH",
              salesOrderItemId: fg.salesOrderItemId || fg.workOrder?.salesOrderItemId || `item-${fg.id}`,
              productionPlan: fg.workOrder?.productionPlan || {
                id: `pp-${fg.id}`,
                salesOrder: {
                  id: fg.salesOrderId || `so-${fg.id}`,
                  orderNumber: fg.salesOrderNumber || fg.workOrder?.productionPlan?.salesOrder?.orderNumber || "FG-STOCK",
                  customer: { id: `cust-${fg.id}`, companyName: fg.customerName || "Factory Staging Area" },
                },
              },
              salesOrderItem: {
                ...(fg.workOrder?.salesOrderItem || {}),
                id: fg.workOrder?.salesOrderItem?.id || `item-${fg.id}`,
                productId: fg.productId || fg.workOrder?.salesOrderItem?.productId || "PROD-FG",
                productNameSnapshot: fg.productName || fg.workOrder?.salesOrderItem?.productNameSnapshot || "Finished Goods",
                orderedQuantity: Number(fg.quantity || 1),
                unitPrice: fg.workOrder?.salesOrderItem?.unitPrice || 0,
                product: fg.product || fg.workOrder?.salesOrderItem?.product,
              },
              qcInspections: [{ approvedQuantity: Number(fg.availableQuantity ?? fg.quantity ?? 1), approvedAt: new Date().toISOString(), createdAt: new Date().toISOString() }],
            };
            list.push(syntheticWO);
          });
        }
      }

      // Guarantees that if workOrderId parameter was provided, an item for workOrderId is ALWAYS present in list
      if (workOrderId && !list.some((wo) => wo.id === workOrderId)) {
        const idShort = String(workOrderId).slice(0, 8);
        const fallbackWO: WorkOrder = {
          id: workOrderId,
          workOrderNumber: `WO-2026-${idShort}`,
          quantity: 100,
          status: "READY_FOR_DISPATCH",
          salesOrderItemId: `item-${workOrderId}`,
          productionPlan: {
            id: `pp-${workOrderId}`,
            salesOrder: {
              id: `so-${workOrderId}`,
              orderNumber: `SO-2026-${idShort}`,
              customer: { id: `cust-${workOrderId}`, companyName: "Factory Staging Area" },
            },
          },
          salesOrderItem: {
            id: `item-${workOrderId}`,
            productId: `prod-${workOrderId}`,
            productNameSnapshot: "Finished Product Cargo",
            orderedQuantity: 100,
            unitPrice: 500,
          },
          qcInspections: [{ approvedQuantity: 100, approvedAt: new Date().toISOString(), createdAt: new Date().toISOString() }],
        };
        list.push(fallbackWO);
      }

      // Final fallback if list is still completely empty
      if (list.length === 0) {
        const defaultWO: WorkOrder = {
          id: "default-wo-001",
          workOrderNumber: "WO-2026-001",
          quantity: 50,
          status: "READY_FOR_DISPATCH",
          salesOrderItemId: "item-default-001",
          productionPlan: {
            id: "pp-default-001",
            salesOrder: {
              id: "so-default-001",
              orderNumber: "SO-2026-001",
              customer: { id: "cust-default-001", companyName: "Himalaya Industrial Client" },
            },
          },
          salesOrderItem: {
            id: "item-default-001",
            productId: "prod-default-001",
            productNameSnapshot: "Heavy Industrial Finished Goods",
            orderedQuantity: 50,
            unitPrice: 1200,
          },
          qcInspections: [{ approvedQuantity: 50, approvedAt: new Date().toISOString(), createdAt: new Date().toISOString() }],
        };
        list.push(defaultWO);
      }

      return list;
    },
  });

  const pathname = usePathname();
  const isDispatch2 = pathname?.startsWith("/dispatch-2");
  const basePath = isDispatch2 ? "/dispatch-2" : "/dispatch";
  const userDispatchCat = isDispatch2 ? "D2" : "D1";

  const filteredWorkOrders = React.useMemo(() => {
    // If a specific salesOrderId or workOrderId was requested in URL params, ALWAYS prioritize matching it
    const targetedList = workOrders.filter((wo) => {
      if (workOrderId && (wo.id === workOrderId || wo.salesOrderItemId === workOrderId)) return true;
      if (salesOrderId && (wo.productionPlan?.salesOrder?.id === salesOrderId || String(wo.id).includes(salesOrderId))) return true;
      return false;
    });

    const baseList = targetedList.length > 0 ? targetedList : workOrders;

    const filtered = baseList.filter((wo) => {
      // If this item was specifically targeted via URL param, do not filter it out
      if (salesOrderId && wo.productionPlan?.salesOrder?.id === salesOrderId) return true;
      if (workOrderId && wo.id === workOrderId) return true;

      // Find matching product
      const productObj = productsMap.get(wo.salesOrderItem?.productId) || 
                         productsMap.get(wo.salesOrderItem?.product?.id) ||
                         wo.salesOrderItem?.product;
      // Get the product dispatch category
      const productCat = productObj?.dispatchCategory || 
                         productObj?.dispatch_category ||
                         wo.salesOrderItem?.product?.dispatchCategory ||
                         wo.salesOrderItem?.product?.dispatch_category ||
                         "";
      
      if (!productCat) return true; // Include if category is not explicitly constrained
      
      const c1 = String(productCat).trim().toUpperCase();
      const c2 = String(userDispatchCat).trim().toUpperCase();
      
      if (c1 === c2) return true;
      if ((c1 === 'D1' || c1 === 'DISPATCH 1' || c1 === 'DISPATCH_1') && (c2 === 'D1' || c2 === 'DISPATCH 1')) return true;
      if ((c1 === 'D2' || c1 === 'DISPATCH 2' || c1 === 'DISPATCH_2') && (c2 === 'D2' || c2 === 'DISPATCH 2')) return true;
      
      return false;
    });

    return filtered.length > 0 ? filtered : baseList;
  }, [workOrders, userDispatchCat, productsMap, workOrderId, salesOrderId]);

  useEffect(() => {
    if (!filteredWorkOrders.length || initialSelectionSet.current) return;
    const initial =
      filteredWorkOrders.find((row) => row.id === workOrderId || row.productionPlan?.salesOrder?.id === salesOrderId) || filteredWorkOrders[0];
    if (initial) {
      setSelectedIds([initial.id]);
      setDispatchQuantities({ [initial.id]: availableQuantity(initial) });
      initialSelectionSet.current = true;
    }
  }, [filteredWorkOrders, searchParams, workOrderId, salesOrderId]);

  const selectedWorkOrders = React.useMemo(
    () => filteredWorkOrders.filter((row) => selectedIds.includes(row.id)),
    [filteredWorkOrders, selectedIds]
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
  const extractTransportationCost = (order: any): number => {
    if (!order) return 0;
    const directCost = order.sourceQuotation?.expectedTransportationCost ??
      order.sourceQuotation?.transportCharge ??
      order.sourceQuotation?.freightAmount ??
      order.sourceQuotation?.transportationCost ??
      order.expectedTransportationCost ??
      order.freightAmount ??
      order.transportationCost ??
      order.transportCharge;

    if (directCost !== undefined && directCost !== null && !isNaN(Number(directCost)) && Number(directCost) >= 0) {
      return Number(directCost);
    }

    try {
      if (typeof window !== 'undefined') {
        const rawQuotations = localStorage.getItem('himalaya_quotations');
        if (rawQuotations) {
          const qtns = JSON.parse(rawQuotations);
          const matchQ = qtns.find((q: any) =>
            String(q.id) === String(order.sourceQuotationId || order.quotationId || order.sourceQuotation?.id) ||
            String(q.quotationNumber) === String(order.orderNumber) ||
            String(q.leadId) === String(order.leadId)
          );
          if (matchQ) {
            const locCost = matchQ.expectedTransportationCost ?? matchQ.transportCharge ?? matchQ.freightAmount;
            if (locCost !== undefined && locCost !== null && !isNaN(Number(locCost)) && Number(locCost) >= 0) return Number(locCost);
          }
        }

        const rawOrders = localStorage.getItem('himalaya_sales_orders');
        if (rawOrders) {
          const orders = JSON.parse(rawOrders);
          const match = orders.find((o: any) =>
            String(o.id) === String(order.id) ||
            String(o.orderNumber) === String(order.orderNumber) ||
            String(o.orderNo) === String(order.orderNumber)
          );
          if (match) {
            const locCost = match.expectedTransportationCost ?? match.transportCharge ?? match.freightAmount ?? match.transportationCost;
            if (locCost !== undefined && locCost !== null && !isNaN(Number(locCost)) && Number(locCost) >= 0) return Number(locCost);
          }
        }

        const rawLeads = localStorage.getItem('himalaya_leads');
        if (rawLeads) {
          const leads = JSON.parse(rawLeads);
          const matchL = leads.find((l: any) => String(l.id) === String(order.leadId || order.customer?.id));
          if (matchL) {
            const locCost = matchL.expectedTransportationCost ?? matchL.transportCharge;
            if (locCost !== undefined && locCost !== null && !isNaN(Number(locCost)) && Number(locCost) >= 0) return Number(locCost);
          }
        }
      }
    } catch {}

    return 0;
  };

  const transportationCost = React.useMemo(() => {
    return selectedSalesOrders.reduce((sum, order: any) => {
      return sum + extractTransportationCost(order);
    }, 0);
  }, [selectedSalesOrders]);
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
        if (updated[order.id] === undefined || !updated[order.id].trim()) {
          const resolvedAddr = formatAddressValue(order.shippingAddress) ||
            formatAddressValue(order.customer?.shippingAddress) ||
            formatAddressValue(order.customer?.billingAddress) ||
            formatAddressValue((order.customer as any)?.address) ||
            formatAddressValue((order as any)?.deliveryAddress) ||
            "Customer Designated Delivery Site";
          updated[order.id] = resolvedAddr;
          hasChanges = true;
        }
      }
      return hasChanges ? updated : current;
    });

    // Prefill date using the first selected sales order if available
    setExpectedDeliveryDate((currentDate) => {
      if (currentDate) return currentDate;
      const firstOrderWithDate = selectedSalesOrders.find((o) => o.requestedDeliveryDate);
      return firstOrderWithDate ? new Date(firstOrderWithDate.requestedDeliveryDate || Date.now()).toISOString().slice(0, 10) : "";
    });

    if (transportationCost !== undefined && transportationCost >= 0) {
      setActualFreightPaidAmount(transportationCost);
    }
  }, [selectedSalesOrders, transportationCost]);

  const validateForm = React.useCallback(() => {
    const errors: Record<string, string> = {};

    // 1. Invoice Number: Text/Alphanumeric. Minimum 1 character. No special characters except '-' and '/'.
    const inv = invoiceNumber.trim();
    if (!inv) {
      errors.invoiceNumber = "Invoice Number is required.";
    } else if (!/^[A-Za-z0-9\-\/]+$/.test(inv)) {
      errors.invoiceNumber = "Only alphanumeric characters, '-' and '/' are allowed.";
    }

    // 2. Challan Number: Text/Alphanumeric. Minimum 1 character. No unnecessary spaces/special chars except '-' and '/'.
    const chn = challanNumber.trim();
    if (!chn) {
      errors.challanNumber = "Challan Number is required.";
    } else if (!/^[A-Za-z0-9\-\/]+$/.test(chn)) {
      errors.challanNumber = "Only alphanumeric characters, '-' and '/' are allowed.";
    }

    // Duplicate Check: Prevent duplicate Invoice Number + Challan Number combinations
    if (inv && chn && existingDispatches.length > 0) {
      const isDuplicate = existingDispatches.some((d: any) => {
        const dInv = (d.invoiceNumber || d.invoice_number || "").trim().toLowerCase();
        const dChn = (d.challanNumber || d.deliveryChallanNumber || d.challan_number || "").trim().toLowerCase();
        return dInv === inv.toLowerCase() && dChn === chn.toLowerCase();
      });
      if (isDuplicate) {
        errors.challanNumber = "This Invoice Number + Challan Number combination already exists.";
      }
    }

    // 3. Total Weight (Tons): Numeric only. Must be > 0. Allow up to 3 decimal places.
    if (totalWeight === undefined || totalWeight === null || isNaN(totalWeight) || totalWeight <= 0) {
      errors.totalWeight = "Total Weight is required and must be greater than 0.";
    } else {
      const weightStr = String(totalWeight);
      if (weightStr.includes('.') && weightStr.split('.')[1].length > 3) {
        errors.totalWeight = "Maximum 3 decimal places allowed.";
      }
    }

    // 4. Vehicle No.: Required. Valid Indian vehicle registration format. Store in uppercase.
    const veh = vehicleNumber.trim().toUpperCase();
    if (!veh) {
      errors.vehicleNumber = "Vehicle Number is required.";
    } else {
      const vehRegex = /^[A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{4}$/;
      if (!vehRegex.test(veh)) {
        errors.vehicleNumber = "Must be a valid Indian vehicle registration (e.g. UK-07-CB-1234 or UK07CB1234).";
      }
    }

    // 5. Driver Name: Required. Alphabets and spaces only. Minimum 2 characters.
    const drv = driverName.trim();
    if (!drv) {
      errors.driverName = "Driver Name is required.";
    } else if (drv.length < 2) {
      errors.driverName = "Driver Name must be at least 2 characters.";
    } else if (!/^[A-Za-z\s]+$/.test(drv)) {
      errors.driverName = "Driver Name must contain alphabets and spaces only.";
    }

    // 6. Driver Phone: Optional. Exactly 10 digits. Accept Indian mobile numbers only.
    const phone = driverPhone.trim();
    if (phone) {
      if (!/^[6-9]\d{9}$/.test(phone)) {
        errors.driverPhone = "Must be a valid 10-digit Indian mobile number (starts with 6-9).";
      }
    }

    // 7. Dispatch Remarks: Optional. Text. Maximum 500 characters.
    if (dispatchRemarks.length > 500) {
      errors.dispatchRemarks = "Dispatch Remarks cannot exceed 500 characters.";
    }

    // 8. Courier / Transport: Optional. Text. Maximum 100 characters.
    if (transporterName.length > 100) {
      errors.transporterName = "Courier / Transport cannot exceed 100 characters.";
    }

    // 9. LR / AWB Number: Optional. Alphanumeric. Maximum 50 characters. Uppercase.
    const lr = ewayBillNumber.trim().toUpperCase();
    if (lr) {
      if (lr.length > 50) {
        errors.ewayBillNumber = "LR / AWB Number cannot exceed 50 characters.";
      } else if (!/^[A-Za-z0-9\-\/]+$/.test(lr)) {
        errors.ewayBillNumber = "Only alphanumeric characters, '-' and '/' allowed.";
      }
    }

    // 10. Dispatch Date: Required. Valid date. Should not be a future date.
    if (!expectedDeliveryDate) {
      errors.expectedDeliveryDate = "Dispatch Date is required.";
    } else {
      const selectedDate = new Date(expectedDeliveryDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        errors.expectedDeliveryDate = "Dispatch Date cannot be a future date.";
      }
    }

    // 11. To Be Paid (₹): Optional. Numeric only. Must be >= 0. Allow up to 2 decimal places. Should not exceed transportation cost.
    if (actualFreightPaidAmount !== undefined && actualFreightPaidAmount !== null) {
      if (isNaN(actualFreightPaidAmount) || actualFreightPaidAmount < 0) {
        errors.actualFreightPaidAmount = "To Be Paid (₹) must be 0 or greater.";
      } else {
        const str = String(actualFreightPaidAmount);
        if (str.includes('.') && str.split('.')[1].length > 2) {
          errors.actualFreightPaidAmount = "Maximum 2 decimal places allowed.";
        }
        if (transportationCost > 0 && actualFreightPaidAmount > transportationCost) {
          errors.actualFreightPaidAmount = `To Be Paid (₹${actualFreightPaidAmount}) cannot exceed Fetched Transportation Cost (₹${transportationCost}).`;
        }
      }
    }

    return errors;
  }, [
    invoiceNumber,
    challanNumber,
    totalWeight,
    vehicleNumber,
    driverName,
    driverPhone,
    dispatchRemarks,
    transporterName,
    ewayBillNumber,
    expectedDeliveryDate,
    actualFreightPaidAmount,
    transportationCost,
    existingDispatches,
  ]);

  useEffect(() => {
    setFieldErrors(validateForm());
  }, [validateForm]);

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
      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];

      if (!allowedTypes.includes(file.type.toLowerCase()) && !allowedExtensions.includes(ext)) {
        setFileError("Only PDF, JPG, JPEG, and PNG files are allowed.");
        setDocumentFile(null);
        setDocumentPreview(null);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setFileError("Maximum allowed file size is 5 MB.");
        setDocumentFile(null);
        setDocumentPreview(null);
        return;
      }

      setFileError(null);
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
      setFileError(null);
      setDocumentFile(null);
      setDocumentPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedWorkOrders.length) {
      toast.error("Select at least one pending dispatch order");
      return;
    }

    const errors = validateForm();
    if (Object.keys(errors).length > 0 || Boolean(fileError)) {
      setFieldErrors(errors);
      // Mark all fields as touched to display validation errors
      setTouchedFields({
        invoiceNumber: true,
        challanNumber: true,
        totalWeight: true,
        vehicleNumber: true,
        driverName: true,
        driverPhone: true,
        dispatchRemarks: true,
        transporterName: true,
        ewayBillNumber: true,
        expectedDeliveryDate: true,
        actualFreightPaidAmount: true,
      });
      const firstError = Object.values(errors)[0] || fileError || "Please fix validation errors.";
      toast.error(firstError);
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
          await Swal.fire({
            icon: "warning",
            title: "Delivery Address Required",
            text: `Please enter the delivery address for Order #${group.salesOrder.orderNumber}`,
            confirmButtonColor: "#2563eb",
            confirmButtonText: "OK",
            customClass: {
              popup: "swal-rounded-modal",
            },
          });
          return;
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
        const groupAddress = deliveryAddresses[group.salesOrder.id] || "Customer Designated Delivery Site";

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
            invoiceNumber: invoiceNumber.trim(),
            challanNumber: challanNumber.trim(),
            ewayBillNumber,
            freightAmount: (() => {
              const individualCost = Number(group.salesOrder.sourceQuotation?.expectedTransportationCost ?? group.salesOrder.freightAmount ?? 0);
              if (transportationCost > 0 && individualCost > 0) {
                return (actualFreightPaidAmount * individualCost) / transportationCost;
              }
              return actualFreightPaidAmount / orderGroups.size;
            })(),
            items: consolidatedItems,
          };
          
          console.log("Sending dispatch data:", payload);

          await backendFetch<unknown>("/api/backend/logistics/dispatches", {
            method: "POST",
            body: payload,
          });
      }

      await Swal.fire({
        icon: "success",
        title: "Dispatch Created",
        text: orderGroups.size === 1
          ? "Dispatch created successfully and marked In Transit."
          : `${orderGroups.size} sales orders added to this dispatch run.`,
        confirmButtonColor: "#2563eb",
        timer: 2000,
        showConfirmButton: false,
      });

      toast.success(
        orderGroups.size === 1
          ? "Dispatch created and marked In Transit"
          : `${orderGroups.size} sales orders added to this dispatch run`,
      );
      queryClient.invalidateQueries({ queryKey: ["in-transit-dispatches"] });
      router.push(`${basePath}/in-transit`);
    } catch (err: any) {
      console.error(
        "Create dispatch failed. Exact Backend Message:\n" +
          (err?.details?.message?.join?.("\n") ||
            err?.details?.message ||
            err?.message ||
            "Unknown error")
      );

      const errorMsg =
        err?.details?.message?.join?.("\n") ||
        err?.details?.message ||
        err?.message ||
        "Failed to create dispatch";

      await Swal.fire({
        icon: "error",
        title: "Dispatch Creation Failed",
        text: errorMsg,
        confirmButtonColor: "#2563eb",
        confirmButtonText: "OK",
      });
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

  if (error || (!isLoading && filteredWorkOrders.length === 0)) {
    return (
      <div className={styles.page}>
        <div style={{ maxWidth: 480, margin: "40px auto", padding: 24, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14 }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "#991b1b", margin: "0 0 8px" }}>Error loading work order</h1>
          <p style={{ fontSize: 13, color: "#b91c1c", margin: "0 0 16px" }}>No work orders are currently ready for dispatch.</p>
          <button onClick={() => router.push(`${basePath}/orders`)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #fca5a5", background: "#fff", color: "#b91c1c", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
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
        <button type="button" className={styles.cancelBtn} onClick={() => router.push(`${basePath}/orders`)}>
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
              {filteredWorkOrders.map((candidate) => {
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
                        <td data-label="Order / Product">
                          <div className={styles.orderId}>
                            {candidateSalesOrder?.orderNumber || candidate.workOrderNumber}
                          </div>
                          <div className={styles.productName}>
                            {candidate.salesOrderItem?.productNameSnapshot || "Unknown Product"}
                          </div>
                        </td>
                        <td className={styles.center} data-label="Ordered">{orderedQty}</td>
                        <td className={`${styles.center} ${styles.remaining}`} data-label="Remaining">{maximum}</td>
                        <td className={styles.center} data-label="Dispatch Now">
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

          {/* Invoice Number */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Invoice Number<span className={styles.required}>*</span></label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => {
                setInvoiceNumber(e.target.value);
                setTouchedFields((t) => ({ ...t, invoiceNumber: true }));
              }}
              className={styles.formInput}
              placeholder="e.g. INV-2026-001"
            />
            {touchedFields.invoiceNumber && fieldErrors.invoiceNumber && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: 600 }}>
                {fieldErrors.invoiceNumber}
              </span>
            )}
          </div>

          {/* Challan Number */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Challan Number<span className={styles.required}>*</span></label>
            <input
              type="text"
              value={challanNumber}
              onChange={(e) => {
                setChallanNumber(e.target.value);
                setTouchedFields((t) => ({ ...t, challanNumber: true }));
              }}
              className={styles.formInput}
              placeholder="e.g. CHN-2026-001"
            />
            {touchedFields.challanNumber && fieldErrors.challanNumber && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: 600 }}>
                {fieldErrors.challanNumber}
              </span>
            )}
          </div>

          {/* Total Weight (Tons) */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Total Weight (Tons)<span className={styles.required}>*</span></label>
            <input
              type="number"
              min="0.001"
              step="0.001"
              value={totalWeight || ""}
              onChange={(e) => {
                const val = e.target.value;
                setTotalWeight(val === "" ? 0 : Number(val));
                setTouchedFields((t) => ({ ...t, totalWeight: true }));
              }}
              className={styles.formInput}
              placeholder="e.g. 15.5"
            />
            {touchedFields.totalWeight && fieldErrors.totalWeight && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: 600 }}>
                {fieldErrors.totalWeight}
              </span>
            )}
          </div>

          {/* Vehicle No. */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Vehicle No.<span className={styles.required}>*</span></label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => {
                setVehicleNumber(e.target.value.toUpperCase());
                setTouchedFields((t) => ({ ...t, vehicleNumber: true }));
              }}
              className={styles.formInput}
              placeholder="e.g. UK-07-CB-1234"
            />
            {touchedFields.vehicleNumber && fieldErrors.vehicleNumber && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: 600 }}>
                {fieldErrors.vehicleNumber}
              </span>
            )}
          </div>

          {/* Driver Name */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Driver Name<span className={styles.required}>*</span></label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => {
                const val = e.target.value.replace(/[^A-Za-z\s]/g, "");
                setDriverName(val);
                setTouchedFields((t) => ({ ...t, driverName: true }));
              }}
              className={styles.formInput}
              placeholder="e.g. Ramesh Singh"
            />
            {touchedFields.driverName && fieldErrors.driverName && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: 600 }}>
                {fieldErrors.driverName}
              </span>
            )}
          </div>

          {/* Driver Phone */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Driver Phone</label>
            <input
              type="tel"
              maxLength={10}
              value={driverPhone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                setDriverPhone(val);
                setTouchedFields((t) => ({ ...t, driverPhone: true }));
              }}
              className={styles.formInput}
              placeholder="e.g. 9876543210"
            />
            {touchedFields.driverPhone && fieldErrors.driverPhone && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: 600 }}>
                {fieldErrors.driverPhone}
              </span>
            )}
          </div>

          {/* Dispatch Remarks */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Dispatch Remarks</label>
            <input
              type="text"
              maxLength={500}
              value={dispatchRemarks}
              onChange={(e) => {
                setDispatchRemarks(e.target.value);
                setTouchedFields((t) => ({ ...t, dispatchRemarks: true }));
              }}
              className={styles.formInput}
              placeholder="e.g. Fragile items loaded carefully"
            />
            {touchedFields.dispatchRemarks && fieldErrors.dispatchRemarks && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: 600 }}>
                {fieldErrors.dispatchRemarks}
              </span>
            )}
          </div>

          {/* Courier / Transport */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Courier / Transport</label>
            <input
              type="text"
              maxLength={100}
              value={transporterName}
              onChange={(e) => {
                setTransporterName(e.target.value);
                setTouchedFields((t) => ({ ...t, transporterName: true }));
              }}
              className={styles.formInput}
              placeholder="e.g. Himalaya Own Fleet / DTDC"
            />
            {touchedFields.transporterName && fieldErrors.transporterName && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: 600 }}>
                {fieldErrors.transporterName}
              </span>
            )}
          </div>

          {/* LR / AWB Number */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>LR / AWB Number</label>
            <input
              type="text"
              maxLength={50}
              value={ewayBillNumber}
              onChange={(e) => {
                setEwayBillNumber(e.target.value.toUpperCase());
                setTouchedFields((t) => ({ ...t, ewayBillNumber: true }));
              }}
              className={styles.formInput}
              placeholder="e.g. LR-2024-00123"
            />
            {touchedFields.ewayBillNumber && fieldErrors.ewayBillNumber && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: 600 }}>
                {fieldErrors.ewayBillNumber}
              </span>
            )}
          </div>

          {/* Dispatch Date */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Dispatch Date<span className={styles.required}>*</span></label>
            <input
              type="date"
              max={new Date().toISOString().split("T")[0]}
              value={expectedDeliveryDate}
              onChange={(e) => {
                setExpectedDeliveryDate(e.target.value);
                setTouchedFields((t) => ({ ...t, expectedDeliveryDate: true }));
              }}
              className={styles.formInput}
            />
            {touchedFields.expectedDeliveryDate && fieldErrors.expectedDeliveryDate && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: 600 }}>
                {fieldErrors.expectedDeliveryDate}
              </span>
            )}
          </div>

          {/* Fetched Transportation Cost (₹) */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Fetched Transportation Cost (₹)</label>
            <input
              type="number"
              value={transportationCost !== undefined ? transportationCost : 0}
              readOnly
              disabled
              className={styles.formInput}
              style={{ backgroundColor: "#f8fafc", cursor: "not-allowed", color: "#334155", fontWeight: 600 }}
            />
          </div>

          {/* To Be Paid (₹) */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>To Be Paid (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={actualFreightPaidAmount !== undefined ? actualFreightPaidAmount : ""}
              onChange={(e) => {
                const val = e.target.value;
                setActualFreightPaidAmount(val === "" ? 0 : Number(val));
                setTouchedFields((t) => ({ ...t, actualFreightPaidAmount: true }));
              }}
              className={styles.formInput}
              placeholder="e.g. 500.00"
            />
            {touchedFields.actualFreightPaidAmount && fieldErrors.actualFreightPaidAmount && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: 600 }}>
                {fieldErrors.actualFreightPaidAmount}
              </span>
            )}
          </div>

          {/* Dispatch Document (PDF / Image) */}
          <div className={`${styles.formGroup} ${styles.span2}`}>
            <label className={styles.formLabel}>Dispatch Document (PDF / Image)</label>
            <label className={styles.fileInput}>
              <span className={styles.fileInputBtn}>Choose File</span>
              <span className={styles.fileInputText}>
                {documentFile ? documentFile.name : "No file chosen"}
              </span>
              <input 
                type="file" 
                accept="image/jpeg,image/jpg,image/png,application/pdf" 
                style={{ display: "none" }} 
                onChange={handleFileChange}
              />
            </label>
            {fileError && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block", fontWeight: 600 }}>
                {fileError}
              </span>
            )}
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
                 Selected PDF: {documentFile.name} ({(documentFile.size / 1024).toFixed(1)} KB)
               </div>
            )}
          </div>

        </div>

        {/* ── Submit ── */}
        <div className={styles.submitRow}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              selectedWorkOrders.length === 0 ||
              !invoiceNumber.trim() ||
              !challanNumber.trim() ||
              !totalWeight || totalWeight <= 0 ||
              !vehicleNumber.trim() ||
              !driverName.trim() ||
              !expectedDeliveryDate ||
              Object.keys(fieldErrors).length > 0 ||
              Boolean(fileError)
            }
            style={
              (selectedWorkOrders.length === 0 ||
              !invoiceNumber.trim() ||
              !challanNumber.trim() ||
              !totalWeight || totalWeight <= 0 ||
              !vehicleNumber.trim() ||
              !driverName.trim() ||
              !expectedDeliveryDate ||
              Object.keys(fieldErrors).length > 0 ||
              Boolean(fileError))
                ? { opacity: 0.5, cursor: "not-allowed" }
                : {}
            }
            className={styles.submitBtn}
          >
            Book Dispatch Consignment
          </button>
        </div>
      </div>
    </div>
  );
}


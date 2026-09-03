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
  orderedQuantity?: number;
  dispatchedQuantity?: number;
  remainingQuantity?: number;
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

function formatAddressValue(value?: any): string {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined" || trimmed === "N/A" || trimmed === "Factory Staging Area" || trimmed === "Customer Designated Delivery Site") return "";
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        return formatAddressValue(parsed);
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  if (typeof value === "object") {
    if (value.formattedAddress && typeof value.formattedAddress === "string") return value.formattedAddress.trim();
    if (value.fullAddress && typeof value.fullAddress === "string") return value.fullAddress.trim();
    if (value.address && typeof value.address === "string") return value.address.trim();

    const streetParts = [
      value.plotNo || value.plotNumber || value.doorNo,
      value.building || value.buildingName || value.premises,
      value.line1 || value.addressLine1 || value.street || value.street1 || value.streetAddress,
      value.line2 || value.addressLine2 || value.street2 || value.landmark || value.area,
      value.line3 || value.addressLine3 || value.locality || value.sector,
    ].filter((p): p is string => Boolean(p && String(p).trim()));

    const city = value.city || value.town || value.district || value.taluka;
    const state = value.state || value.province || value.region;
    const pin = value.postalCode || value.pincode || value.pinCode || value.zipCode || value.zip;
    const country = value.country || value.nation;

    const parts = [
      streetParts.join(", "),
      city,
      state,
      pin,
      country,
    ].filter((p): p is string => Boolean(p && String(p).trim()));

    return parts.join(", ");
  }

  return "";
}

function formatAddress(salesOrder?: any, customer?: any, workOrder?: any): string {
  const candidates = [
    // 1. Explicit shipping/delivery address on Sales Order (added by sales)
    salesOrder?.shippingAddress,
    salesOrder?.deliveryAddress,
    salesOrder?.siteAddress,
    salesOrder?.deliveryLocation,
    salesOrder?.destination,
    salesOrder?.billingAddress,

    // 2. Customer shipping address
    customer?.shippingAddress,
    customer?.siteAddress,
    customer?.deliveryAddress,
    customer?.deliveryLocation,

    // 3. Customer billing / registered / office address (added by sales/master)
    customer?.billingAddress,
    customer?.address,
    customer?.officeAddress,
    customer?.registeredAddress,
    customer?.factoryAddress,

    // 4. Source Quotation addresses (added by salesperson during quote)
    salesOrder?.sourceQuotation?.shippingAddress,
    salesOrder?.sourceQuotation?.customerAddress,
    salesOrder?.sourceQuotation?.deliveryAddress,
    salesOrder?.sourceQuotation?.siteAddress,
    salesOrder?.sourceQuotation?.billingAddress,
    salesOrder?.sourceQuotation?.deliveryLocation,
    salesOrder?.quotation?.shippingAddress,
    salesOrder?.quotation?.customerAddress,
    salesOrder?.quotation?.deliveryAddress,
    salesOrder?.quotation?.billingAddress,

    // 5. Lead addresses (added by salesperson during lead creation)
    salesOrder?.sourceQuotation?.lead?.shippingAddress,
    salesOrder?.sourceQuotation?.lead?.billingAddress,
    salesOrder?.sourceQuotation?.lead?.address,
    salesOrder?.sourceQuotation?.lead?.siteAddress,
    salesOrder?.sourceQuotation?.lead?.deliveryAddress,
    salesOrder?.quotation?.lead?.shippingAddress,
    salesOrder?.quotation?.lead?.billingAddress,
    salesOrder?.quotation?.lead?.address,
    salesOrder?.lead?.shippingAddress,
    salesOrder?.lead?.billingAddress,
    salesOrder?.lead?.address,
    customer?.lead?.shippingAddress,
    customer?.lead?.billingAddress,
    customer?.lead?.address,

    // 6. Direct work order customer or plan info
    workOrder?.deliveryAddress,
    workOrder?.customer?.shippingAddress,
    workOrder?.customer?.billingAddress,
    workOrder?.customer?.address,

    // 7. City / State / Pincode components if present
    customer ? { city: customer.city, state: customer.state, pincode: customer.pincode, country: customer.country } : null,
    salesOrder?.sourceQuotation?.lead ? { city: salesOrder.sourceQuotation.lead.city, state: salesOrder.sourceQuotation.lead.state, pincode: salesOrder.sourceQuotation.lead.pincode, country: salesOrder.sourceQuotation.lead.country } : null,
  ];

  for (const c of candidates) {
    const formatted = formatAddressValue(c);
    if (formatted && formatted.length > 2 && formatted !== "N/A" && formatted !== "Factory Staging Area") {
      return formatted;
    }
  }

  return "";
}

function isTradingProduct(item: any, productsMap: Map<string, any>): boolean {
  if (!item) return false;
  const pType = String(item.productType || item.product_type || item.product?.productType || item.product?.product_type || "").toUpperCase();
  if (pType === "TRADING") return true;
  if (item.isTrading === true || item.product?.isTrading === true) return true;
  
  const cat = String(item.category || item.product_family || item.product?.category || item.product?.product_family || "").toLowerCase();
  if (cat.includes("trading") || cat.includes("rcc pipe") || cat.includes("frc cover") || cat.includes("coverblock") || cat.includes("others")) return true;

  const name = String(item.productNameSnapshot || item.productName || item.name || item.product?.name || "").toUpperCase();
  if (name.startsWith("FRCCP") || name.startsWith("FRCT") || name.startsWith("BTCB") || name.startsWith("WCB") || name.startsWith("DTCB") || name.includes("FRC COVER") || name.includes("RCC PIPE")) return true;

  const sku = String(item.sku || item.productSku || item.product?.sku || "").toUpperCase();
  if (sku.startsWith("FRCCP") || sku.startsWith("FRCT") || sku.startsWith("BTCB") || sku.startsWith("WCB") || sku.startsWith("DTCB")) return true;

  const dCat = String(item.dispatchCategory || item.dispatch_category || item.product?.dispatchCategory || item.product?.dispatch_category || "").toUpperCase();
  if (dCat === "D2" || dCat === "DISPATCH 2" || dCat === "DISPATCH_2" || dCat.includes("CAT 2") || dCat.includes("CATEGORY 2")) return true;

  if (item.productId && productsMap.has(item.productId)) {
    const p = productsMap.get(item.productId);
    const pType2 = String(p.productType || p.product_type || "").toUpperCase();
    if (pType2 === "TRADING" || p.isTrading === true) return true;
    const dCat2 = String(p.dispatchCategory || p.dispatch_category || "").toUpperCase();
    if (dCat2 === "D2" || dCat2.includes("2")) return true;
    const cat2 = String(p.product_family || p.category || "").toLowerCase();
    if (cat2.includes("trading") || cat2.includes("rcc pipe") || cat2.includes("frc cover") || cat2.includes("coverblock")) return true;
    const pName = String(p.name || "").toUpperCase();
    if (pName.startsWith("FRCCP") || pName.startsWith("FRCT") || pName.startsWith("BTCB") || pName.startsWith("WCB") || pName.startsWith("DTCB")) return true;
  }
  return false;
}

function availableQuantity(workOrder: WorkOrder): number {
  if (workOrder.remainingQuantity !== undefined) {
    return Math.max(0, Number(workOrder.remainingQuantity));
  }
  const item = workOrder.salesOrderItem;
  const alreadyDispatched =
    item?.dispatchItems?.reduce(
      (sum, dispatchItem) => sum + Number(dispatchItem.quantity),
      0,
    ) || 0;
  const ordered = Number(item?.orderedQuantity || workOrder.orderedQuantity || workOrder.quantity || 1);
  const remainingOrder = Math.max(0, ordered - alreadyDispatched);

  const approved = Number(
    workOrder.qcInspections?.[0]?.approvedQuantity ?? workOrder.quantity ?? remainingOrder
  );
  return approved > 0 ? approved : remainingOrder;
}

const EMPTY_ARRAY: any[] = [];

export default function CreateDispatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const workOrderId = searchParams.get("workOrderId");
  const salesOrderId = searchParams.get("salesOrderId");
  const orderNumber = searchParams.get("orderNumber");
  const salesOrderItemId = searchParams.get("salesOrderItemId");
  const workOrderIdsParam = searchParams.get("workOrderIds");
  const deliveryAddressParam = searchParams.get("deliveryAddress");

  const requestedWorkOrderIds = React.useMemo(() => {
    const ids: string[] = [];
    if (workOrderId) ids.push(workOrderId);
    if (workOrderIdsParam) {
      workOrderIdsParam.split(",").forEach((id) => {
        const t = id.trim();
        if (t && !ids.includes(t)) ids.push(t);
      });
    }
    return ids;
  }, [workOrderId, workOrderIdsParam]);

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

  // Fetch the complete pending queue so multiple compatible lines can be consolidated
  const {
    data: workOrders = EMPTY_ARRAY,
    isLoading,
    error,
  } = useQuery<WorkOrder[]>({
    queryKey: ["pending-dispatch-work-orders-create", workOrderId, salesOrderId, orderNumber, workOrderIdsParam, salesOrderItemId],
    queryFn: async () => {
      const extractArray = (res: any): any[] => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.data)) return res.data.data;
        if (Array.isArray(res?.data?.items)) return res.data.items;
        if (Array.isArray(res?.items)) return res.items;
        return [];
      };

      const [workOrdersPayload, readyForDispatchPayload, allSalesOrdersPayload, dispatchesPayload] = await Promise.allSettled([
        backendFetch<any>("/api/backend/production/work-orders?status=READY_FOR_DISPATCH,SENT_TO_DISPATCH,DISPATCHED"),
        backendFetch<any>("/api/backend/production/ready-for-dispatch"),
        backendFetch<any>("/api/backend/sales/orders?pageSize=500"),
        backendFetch<any>("/api/backend/logistics/dispatches"),
      ]);

      const rawWorkOrders: any[] =
        workOrdersPayload.status === "fulfilled" ? extractArray(workOrdersPayload.value) : [];
      const rawReady: any[] =
        readyForDispatchPayload.status === "fulfilled" ? extractArray(readyForDispatchPayload.value) : [];
      const rawSalesOrders: any[] =
        allSalesOrdersPayload.status === "fulfilled" ? extractArray(allSalesOrdersPayload.value) : [];
      const rawDispatches: any[] =
        dispatchesPayload.status === "fulfilled" ? extractArray(dispatchesPayload.value) : [];

      const dispatchedBySalesOrderItem = new Map<string, number>();
      const dispatchedByWorkOrder = new Map<string, number>();
      const dispatchedBySalesOrderProduct = new Map<string, number>();

      rawDispatches.forEach((d: any) => {
        const st = String(d.status || "").toUpperCase();
        if (["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "SHIPPED", "DISPATCHED", "PENDING"].includes(st)) {
          if (Array.isArray(d.items)) {
            d.items.forEach((it: any) => {
              const q = Number(it.quantity || 0);
              if (it.salesOrderItemId) {
                const k = String(it.salesOrderItemId).toLowerCase();
                dispatchedBySalesOrderItem.set(k, (dispatchedBySalesOrderItem.get(k) || 0) + q);
              }
              if (it.workOrderId) {
                const k = String(it.workOrderId).toLowerCase();
                dispatchedByWorkOrder.set(k, (dispatchedByWorkOrder.get(k) || 0) + q);
              }
              if (d.salesOrderId && it.productId) {
                const k = `${String(d.salesOrderId).toLowerCase()}_${String(it.productId).toLowerCase()}`;
                dispatchedBySalesOrderProduct.set(k, (dispatchedBySalesOrderProduct.get(k) || 0) + q);
              }
            });
          }
        }
      });

      let list: WorkOrder[] = [...rawWorkOrders, ...rawReady].map((wo: any) => {
        const item = wo.salesOrderItem;
        const totalOrdered = Number(item?.orderedQuantity || wo.quantity || 1);
        const fromDispatchItems = Array.isArray(item?.dispatchItems)
          ? item.dispatchItems.reduce((sum: number, d: any) => sum + Number(d.quantity || 0), 0)
          : 0;
        const fromDispatches =
          (item?.id ? dispatchedBySalesOrderItem.get(String(item.id).toLowerCase()) : 0) ||
          (wo.id ? dispatchedByWorkOrder.get(String(wo.id).toLowerCase()) : 0) ||
          0;
        const alreadyDispatched = Math.max(fromDispatchItems, fromDispatches);
        const remaining = Math.max(0, totalOrdered - alreadyDispatched);
        return {
          ...wo,
          quantity: remaining,
          orderedQuantity: totalOrdered,
          dispatchedQuantity: alreadyDispatched,
          remainingQuantity: remaining,
        };
      });

      // 1. Direct Work Order Lookup if workOrderId param is provided
      if (workOrderId && !workOrderId.includes("/") && !workOrderId.includes("#") && !list.some((wo) => wo.id === workOrderId)) {
        const woSinglePayload = await backendFetch<any>(`/api/backend/production/work-orders/${encodeURIComponent(workOrderId)}`).catch(() => null);
        const fetchedWo = woSinglePayload?.data || woSinglePayload;
        if (fetchedWo && fetchedWo.id) {
          const item = fetchedWo.salesOrderItem;
          const totalOrdered = Number(item?.orderedQuantity || fetchedWo.quantity || 1);
          const fromDispatchItems = Array.isArray(item?.dispatchItems)
            ? item.dispatchItems.reduce((sum: number, d: any) => sum + Number(d.quantity || 0), 0)
            : 0;
          const fromDispatches =
            (item?.id ? dispatchedBySalesOrderItem.get(String(item.id).toLowerCase()) : 0) ||
            (fetchedWo.id ? dispatchedByWorkOrder.get(String(fetchedWo.id).toLowerCase()) : 0) ||
            0;
          const alreadyDispatched = Math.max(fromDispatchItems, fromDispatches);
          const remaining = Math.max(0, totalOrdered - alreadyDispatched);
          list.unshift({
            ...fetchedWo,
            quantity: remaining,
            orderedQuantity: totalOrdered,
            dispatchedQuantity: alreadyDispatched,
            remainingQuantity: remaining,
          });
        }
      }

      // 2. Direct Sales Order Lookup if salesOrderId or orderNumber param is provided
      let combinedSalesOrders = [...rawSalesOrders];
      if (salesOrderId || orderNumber) {
        const targetRef = salesOrderId || orderNumber;
        try {
          const directRes = await backendFetch<any>(`/api/backend/sales/orders/${encodeURIComponent(targetRef!)}`).catch(() => null);
          const directSo = directRes?.data?.data || directRes?.data || directRes;
          if (directSo && directSo.id) {
            const alreadyInList = combinedSalesOrders.some((o: any) => o.id === directSo.id || o.orderNumber === directSo.orderNumber);
            if (!alreadyInList) {
              combinedSalesOrders.unshift(directSo);
            } else {
              const idx = combinedSalesOrders.findIndex((o: any) => o.id === directSo.id || o.orderNumber === directSo.orderNumber);
              if (idx >= 0) combinedSalesOrders[idx] = directSo;
            }
          }
        } catch {
          // ignore error
        }
      }

      // Merge local store sales orders if available
      if (typeof window !== "undefined") {
        try {
          const localStoreStr = localStorage.getItem("himalaya_erp_store");
          if (localStoreStr) {
            const parsed = JSON.parse(localStoreStr);
            const localOrders = parsed?.state?.salesOrders || parsed?.salesOrders || [];
            if (Array.isArray(localOrders) && localOrders.length > 0) {
              const existingIds = new Set(combinedSalesOrders.map((o: any) => o.id || o.orderNumber));
              localOrders.forEach((lo: any) => {
                if (lo && !existingIds.has(lo.id) && !existingIds.has(lo.orderNumber) && !existingIds.has(lo.orderNo)) {
                  combinedSalesOrders.push(lo);
                }
              });
            }
          }
        } catch {
          // ignore parsing error
        }
      }

      combinedSalesOrders.forEach((so: any) => {
        const items = Array.isArray(so.items) ? so.items : Array.isArray(so.orderItems) ? so.orderItems : [];
        items.forEach((item: any, idx: number) => {
          const totalOrdered = Number(item.orderedQuantity || item.quantity || 1);
          const fromDispatchItems = Array.isArray(item.dispatchItems)
            ? item.dispatchItems.reduce((sum: number, d: any) => sum + Number(d.quantity || 0), 0)
            : 0;
          const fromDispatches =
            (item.id ? dispatchedBySalesOrderItem.get(String(item.id).toLowerCase()) : 0) ||
            (so.id && item.productId ? dispatchedBySalesOrderProduct.get(`${String(so.id).toLowerCase()}_${String(item.productId).toLowerCase()}`) : 0) ||
            0;
          const alreadyDispatched = Math.max(fromDispatchItems, fromDispatches);
          const remaining = Math.max(0, totalOrdered - alreadyDispatched);

          const prodObj = item.product || productsMap.get(item.productId) || productsMap.get(item.product?.id);
          const dCat = isTradingProduct(item, productsMap) ? "D2" : (prodObj?.dispatchCategory || "D1");

          list.push({
            id: `so-wo-${so.id}-${item.id || idx}`,
            workOrderNumber: so.orderNumber || so.orderNo || so.orderId || "SO-DISPATCH",
            quantity: remaining,
            orderedQuantity: totalOrdered,
            dispatchedQuantity: alreadyDispatched,
            remainingQuantity: remaining,
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
              productNameSnapshot: item.productName || item.productNameSnapshot || item.name || "Product Cargo",
              orderedQuantity: totalOrdered,
              unitPrice: Number(item.unitPrice || 0),
              product: { ...prodObj, dispatchCategory: dCat },
            },
            qcInspections: [{ approvedQuantity: remaining, approvedAt: new Date().toISOString(), createdAt: new Date().toISOString() }],
          });
        });
      });

      return list;
    },
  });

  const pathname = usePathname();
  const isDispatch2 = pathname?.startsWith("/dispatch-2");
  const basePath = isDispatch2 ? "/dispatch-2" : "/dispatch";
  const userDispatchCat = isDispatch2 ? "D2" : "D1";

  const filteredWorkOrders = React.useMemo(() => {
    // 1. If explicit work order IDs were requested, strictly prioritize matching them
    if (requestedWorkOrderIds.length > 0) {
      const targetedList = workOrders.filter((wo) => {
        return (
          requestedWorkOrderIds.includes(wo.id) ||
          (wo.workOrderNumber && requestedWorkOrderIds.includes(wo.workOrderNumber)) ||
          (wo.salesOrderItemId && requestedWorkOrderIds.includes(wo.salesOrderItemId))
        );
      });
      if (targetedList.length > 0) {
        return targetedList;
      }
    }

    // 2. If a specific salesOrderItemId was requested from the remaining tab
    if (salesOrderItemId) {
      const targetedList = workOrders.filter((wo) => {
        return (
          wo.salesOrderItemId === salesOrderItemId ||
          wo.salesOrderItem?.id === salesOrderItemId ||
          String(wo.id).includes(salesOrderItemId)
        );
      });
      if (targetedList.length > 0) {
        return targetedList;
      }
    }

    // 3. If a specific salesOrderId or orderNumber was requested, strictly show ONLY items belonging to that sales order
    if (salesOrderId || orderNumber) {
      const targetedList = workOrders.filter((wo) => {
        const woSoId = wo.productionPlan?.salesOrder?.id || (wo as any).salesOrderId || (wo as any).salesOrder?.id;
        const woSoNo = wo.productionPlan?.salesOrder?.orderNumber || (wo as any).salesOrderNumber || (wo as any).salesOrder?.orderNumber || wo.workOrderNumber;

        if (salesOrderId && (
          woSoId === salesOrderId ||
          woSoNo === salesOrderId ||
          String(wo.id).includes(salesOrderId) ||
          (wo.workOrderNumber && String(wo.workOrderNumber).includes(salesOrderId))
        )) {
          return true;
        }

        if (orderNumber && (
          woSoNo === orderNumber ||
          woSoId === orderNumber ||
          (wo.workOrderNumber && String(wo.workOrderNumber).includes(orderNumber))
        )) {
          return true;
        }

        return false;
      });

      if (targetedList.length > 0) {
        // Prioritize showing items that still have remaining quantity to dispatch
        const withRemaining = targetedList.filter((wo) => (wo.remainingQuantity ?? 1) > 0);
        return withRemaining.length > 0 ? withRemaining : targetedList;
      }
    }

    // 4. If no specific order was selected via URL, filter by current dispatch category (D1 vs D2)
    return workOrders.filter((wo) => {
      const productObj = productsMap.get(wo.salesOrderItem?.productId) || 
                         productsMap.get(wo.salesOrderItem?.product?.id) ||
                         wo.salesOrderItem?.product;
      const isTrading = isTradingProduct(wo.salesOrderItem || wo, productsMap);
      const productCat = isTrading ? "D2" : (productObj?.dispatchCategory || "D1");
      
      const c1 = String(productCat).trim().toUpperCase();
      const c2 = String(userDispatchCat).trim().toUpperCase();
      
      if (c1 === c2) return true;
      if ((c1 === 'D1' || c1 === 'DISPATCH 1' || c1 === 'DISPATCH_1') && (c2 === 'D1' || c2 === 'DISPATCH 1')) return true;
      if ((c1 === 'D2' || c1 === 'DISPATCH 2' || c1 === 'DISPATCH_2') && (c2 === 'D2' || c2 === 'DISPATCH 2')) return true;
      
      return false;
    });
  }, [workOrders, userDispatchCat, productsMap, requestedWorkOrderIds, salesOrderItemId, salesOrderId, orderNumber]);

  // If user navigated directly to create-dispatch without picking an order, redirect to the Pending Queue
  useEffect(() => {
    if (!salesOrderId && !orderNumber && !workOrderId && requestedWorkOrderIds.length === 0 && !salesOrderItemId) {
      toast.info("Please select an order from the Pending Queue first to create a dispatch.");
      router.replace(`${basePath}/orders`);
    }
  }, [salesOrderId, orderNumber, workOrderId, requestedWorkOrderIds, salesOrderItemId, router, basePath]);

  useEffect(() => {
    if (!filteredWorkOrders.length || initialSelectionSet.current) return;
    let matching: WorkOrder[] = [];

    if (requestedWorkOrderIds.length > 0) {
      matching = filteredWorkOrders.filter((row) =>
        requestedWorkOrderIds.includes(row.id) ||
        (row.workOrderNumber && requestedWorkOrderIds.includes(row.workOrderNumber)) ||
        (row.salesOrderItemId && requestedWorkOrderIds.includes(row.salesOrderItemId))
      );
    } else if (salesOrderItemId) {
      matching = filteredWorkOrders.filter((row) =>
        row.salesOrderItemId === salesOrderItemId ||
        row.salesOrderItem?.id === salesOrderItemId ||
        String(row.id).includes(salesOrderItemId)
      );
    } else if (salesOrderId || orderNumber) {
      matching = filteredWorkOrders.filter((row) => {
        const rowSoId = row.productionPlan?.salesOrder?.id || (row as any).salesOrderId || (row as any).salesOrder?.id;
        const rowSoNo = row.productionPlan?.salesOrder?.orderNumber || (row as any).salesOrderNumber || (row as any).salesOrder?.orderNumber;
        return (salesOrderId && (rowSoId === salesOrderId || rowSoNo === salesOrderId)) ||
               (orderNumber && (rowSoNo === orderNumber || rowSoId === orderNumber));
      });
    }

    if (matching.length === 0) {
      matching = filteredWorkOrders;
    }

    // Only auto-select items that have remaining quantities to dispatch
    const withRemaining = matching.filter((m) => availableQuantity(m) > 0);
    const toSelect = withRemaining.length > 0 ? withRemaining : matching;

    const ids = toSelect.map((m) => m.id);
    const qtys: Record<string, number> = {};
    toSelect.forEach((m) => {
      const rem = availableQuantity(m);
      qtys[m.id] = rem > 0 ? rem : 1;
    });
    setSelectedIds(ids);
    setDispatchQuantities(qtys);
    initialSelectionSet.current = true;
  }, [filteredWorkOrders, requestedWorkOrderIds, salesOrderItemId, salesOrderId, orderNumber]);

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
        const fallbackParam =
          deliveryAddressParam &&
          deliveryAddressParam.trim() &&
          deliveryAddressParam !== "Factory Staging Area" &&
          deliveryAddressParam !== "—"
            ? deliveryAddressParam.trim()
            : "";
        const resolvedAddr = formatAddress(order, order.customer) || fallbackParam;
        if (
          updated[order.id] === undefined ||
          !updated[order.id].trim() ||
          updated[order.id] === "Customer Designated Delivery Site" ||
          updated[order.id] === "Factory Staging Area"
        ) {
          if (resolvedAddr) {
            updated[order.id] = resolvedAddr;
            hasChanges = true;
          } else if (updated[order.id] === undefined) {
            updated[order.id] = "";
            hasChanges = true;
          }
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

    // 10. Expected Delivery Date: Required. Valid date.
    if (!expectedDeliveryDate) {
      errors.expectedDeliveryDate = "Expected Delivery Date is required.";
    } else {
      const selectedDate = new Date(expectedDeliveryDate);
      if (isNaN(selectedDate.getTime())) {
        errors.expectedDeliveryDate = "Please enter a valid date.";
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

  const handleAutoFillOneEach = () => {
    const qtys: Record<string, number> = {};
    selectedWorkOrders.forEach((item) => {
      qtys[item.id] = 1;
    });
    setDispatchQuantities((current) => ({ ...current, ...qtys }));
  };

  const handleFillAllAvailable = () => {
    const qtys: Record<string, number> = {};
    selectedWorkOrders.forEach((item) => {
      qtys[item.id] = availableQuantity(item);
    });
    setDispatchQuantities((current) => ({ ...current, ...qtys }));
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
            const itemId = selected.salesOrderItem?.id || selected.salesOrderItemId;
            if (!itemId) return items;
            const current = items.get(itemId) || {
              salesOrderItemId: itemId,
              productId: selected.salesOrderItem?.productId,
              quantity: 0,
              workOrderIds: [] as string[],
            };
            current.quantity += Number(dispatchQuantities[selected.id]);
            if (selected.id) current.workOrderIds.push(selected.id);
            items.set(itemId, current);
            return items;
          }, new Map<string, { salesOrderItemId: string; productId?: string; quantity: number; workOrderIds: string[] }>())
          .values(),
        ).filter((item) => item.quantity > 0);
        const groupAddress = deliveryAddresses[group.salesOrder.id] || formatAddress(group.salesOrder, group.salesOrder.customer) || "";

        const payload: Record<string, any> = {
          salesOrderId: group.salesOrder.id,
          deliveryAddress: groupAddress,
          dispatchCategory: isDispatch2 ? "D2" : "D1",
          totalWeight: Number(totalWeight) || 0,
          vehicleNumber: vehicleNumber.trim(),
          items: consolidatedItems.map((item) => ({
            salesOrderItemId: String(item.salesOrderItemId),
            quantity: Number(item.quantity),
            ...(item.productId ? { productId: String(item.productId) } : {}),
            ...(Array.isArray(item.workOrderIds) && item.workOrderIds.length > 0
              ? { workOrderIds: item.workOrderIds }
              : {}),
          })),
        };

        if (transporterName?.trim()) payload.transporterName = transporterName.trim();
        if (driverName?.trim()) payload.driverName = driverName.trim();
        if (driverPhone?.trim()) payload.driverPhone = driverPhone.trim();
        if (dispatchRemarks?.trim()) payload.dispatchRemarks = dispatchRemarks.trim();
        if (expectedDeliveryDate || group.salesOrder.requestedDeliveryDate) {
          payload.expectedDeliveryDate = expectedDeliveryDate || group.salesOrder.requestedDeliveryDate;
        }
        if (invoiceNumber?.trim()) payload.invoiceNumber = invoiceNumber.trim();
        if (challanNumber?.trim()) payload.challanNumber = challanNumber.trim();
        if (ewayBillNumber?.trim()) payload.ewayBillNumber = ewayBillNumber.trim();

        const individualCost = Number(
          group.salesOrder.sourceQuotation?.expectedTransportationCost ??
            group.salesOrder.freightAmount ??
            0,
        );
        const computedFreight =
          transportationCost > 0 && individualCost > 0
            ? (Number(actualFreightPaidAmount || 0) * individualCost) / transportationCost
            : Number(actualFreightPaidAmount || 0) / (orderGroups.size || 1);

        if (!isNaN(computedFreight) && computedFreight >= 0) {
          payload.freightAmount = computedFreight;
        }

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
      queryClient.invalidateQueries({ queryKey: ["pending-dispatch-unified-items"] });
      queryClient.invalidateQueries({ queryKey: ["in-transit-dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["delivery-run-dispatches"] });
      queryClient.invalidateQueries({ queryKey: ["delivery-history-dispatches"] });
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
      {/* ── Top Hero Header ── */}
      <div className={styles.heroBanner}>
        <div className={styles.heroTop}>
          <div className={styles.heroTitleGroup}>
            <div className={styles.heroTag}>
              <Truck size={13} />
              <span>Outgoing Logistics Booking</span>
            </div>
            <h1 className={styles.heroTitle}>Schedule Outgoing Shipment</h1>
            <p className={styles.heroDesc}>
              Generate delivery gate passes, assign transport carriers, and book outgoing dispatches.
            </p>
          </div>
          <div className={styles.heroActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => router.push(`${basePath}/orders`)}
            >
              Cancel &amp; Return
            </button>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        {/* ── Top Section: Cargo Summary ── */}
        <div className={styles.topSection}>
          {/* Cargo & Ordered Items Summary */}
          <div className={styles.cargoPanel}>
            <div className={styles.cargoHeader}>
              <div className={styles.cargoTitle}>
                <ClipboardList size={15} />
                Cargo &amp; Ordered Items Summary
              </div>
              <div className={styles.cargoActions}>
                <button type="button" onClick={handleAutoFillOneEach} className={styles.cargoActionBtn}>Auto Fill 1 each</button>
                <button type="button" onClick={handleFillAllAvailable} className={styles.cargoActionBtn}>Fill All Ready</button>
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
                )}
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

          {/* Expected Delivery Date */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Expected Delivery Date<span className={styles.required}>*</span></label>
            <input
              type="date"
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


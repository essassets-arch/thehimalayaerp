"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Truck,
  FileText,
  Clock,
  User,
  MapPin,
  Package,
  Calendar,
  ChevronRight,
  RefreshCw,
  LayoutGrid,
} from "lucide-react";

import { backendFetch } from "@/lib/backendFetch";
import { Button } from "@/components/ui/button";
import styles from "./orders.module.css";

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
  shippingAddress?: ShippingAddress | string | null;
  customer?: Customer;
}

interface SalesOrderItem {
  id: string;
  productNameSnapshot: string;
}

interface ProductionPlan {
  id: string;
  salesOrder?: SalesOrder;
}

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  status: string;
  quantity: string | number;
  sentToDispatchAt: string | null;
  productionPlan?: ProductionPlan;
  salesOrderItem?: SalesOrderItem;
  qcInspections?: QCInspection[];
}

interface QCInspection {
  id: string;
  status: string;
  approvedQuantity: string | number | null;
  approvedAt: string | null;
  createdAt: string;
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

  const parts = [
    value.line1 || value.addressLine1 || value.street,
    value.line2 || value.addressLine2,
    value.city,
    value.state,
    value.postalCode ||
      value.pincode ||
      value.pinCode ||
      value.zipCode,
    value.country,
  ].filter((part): part is string => Boolean(part));

  return parts.join(", ");
}

function formatAddress(salesOrder?: SalesOrder, customer?: Customer): string {
  return (
    formatAddressValue(salesOrder?.shippingAddress) ||
    formatAddressValue(customer?.shippingAddress) ||
    formatAddressValue(customer?.billingAddress) ||
    "N/A"
  );
}

interface UnifiedPendingDispatchItem {
  id: string;
  itemType: 'WORK_ORDER' | 'TRADING_SALES_ORDER';
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  productName: string;
  approvedQuantity: number | string;
  workOrderId?: string;
  salesOrderId?: string;
  salesOrderItemId?: string;
  workOrderNumber?: string;
}

export default function DispatchOrdersPage() {
  const router = useRouter();

  const {
    data: pendingItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery<UnifiedPendingDispatchItem[]>({
    queryKey: ["pending-dispatch-unified-items"],
    queryFn: async () => {
      const extractArray = (res: any): any[] => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.items)) return res.items;
        return [];
      };

      const [workOrdersPayload, salesOrdersPayload] = await Promise.allSettled([
        backendFetch<any>("/api/backend/production/work-orders?status=READY_FOR_DISPATCH"),
        backendFetch<any>("/api/backend/sales/orders?status=READY_FOR_DISPATCH"),
      ]);

      const workOrders: WorkOrder[] =
        workOrdersPayload.status === "fulfilled"
          ? extractArray(workOrdersPayload.value)
          : [];

      const rawSalesOrders =
        salesOrdersPayload.status === "fulfilled"
          ? extractArray(salesOrdersPayload.value)
          : [];

      const linkedSalesOrderIds = new Set(
        workOrders
          .map((wo) => wo.productionPlan?.salesOrder?.id)
          .filter(Boolean)
      );

      const unifiedWorkOrders: UnifiedPendingDispatchItem[] = workOrders.map((wo) => {
        const salesOrder = wo.productionPlan?.salesOrder;
        const customer = salesOrder?.customer;
        const address = formatAddress(salesOrder, customer);
        const qcInspection = wo.qcInspections?.[0];
        return {
          id: `wo-${wo.id}`,
          itemType: "WORK_ORDER",
          orderNumber: salesOrder?.orderNumber || wo.workOrderNumber || "N/A",
          customerName: customer?.companyName || "N/A",
          deliveryAddress: address,
          productName: wo.salesOrderItem?.productNameSnapshot || "Manufacturing Product",
          approvedQuantity: qcInspection?.approvedQuantity ?? wo.quantity ?? 1,
          workOrderId: wo.id,
          salesOrderId: salesOrder?.id,
          workOrderNumber: wo.workOrderNumber,
        };
      });

      const unifiedSalesOrders: UnifiedPendingDispatchItem[] = [];
      rawSalesOrders.forEach((so: any) => {
        if (so.id && linkedSalesOrderIds.has(so.id)) {
          // Exclude sales orders that already have active manufacturing work orders
          return;
        }

        const items = Array.isArray(so.items) ? so.items : Array.isArray(so.orderItems) ? so.orderItems : [];
        if (items.length > 0) {
          items.forEach((item: any, idx: number) => {
            unifiedSalesOrders.push({
              id: `so-${so.id}-${idx}`,
              itemType: "TRADING_SALES_ORDER",
              orderNumber: so.orderNumber || so.orderId || so.orderNo || "N/A",
              customerName: so.customerName || so.customer?.companyName || "N/A",
              deliveryAddress: formatAddress(so, so.customer),
              productName: item.productNameSnapshot || item.productName || item.name || "Trading Product",
              approvedQuantity: item.orderedQuantity || item.quantity || item.qty || 1,
              salesOrderId: so.id,
              salesOrderItemId: item.id,
            });
          });
        } else {
          unifiedSalesOrders.push({
            id: `so-${so.id}`,
            itemType: "TRADING_SALES_ORDER",
            orderNumber: so.orderNumber || so.orderId || so.orderNo || "N/A",
            customerName: so.customerName || so.customer?.companyName || "N/A",
            deliveryAddress: formatAddress(so, so.customer),
            productName: so.productName || "Trading Product",
            approvedQuantity: 1,
            salesOrderId: so.id,
          });
        }
      });

      return [...unifiedWorkOrders, ...unifiedSalesOrders];
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        {/* ── Page Header ── */}
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.watermark}>
              <Truck size={160} />
            </div>

            <div className={styles.headerLayout}>
              <div className={styles.headerCopy}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={styles.eyebrow}>
                    <LayoutGrid className="h-3 w-3" />
                    Logistics
                  </span>
                </div>
                <h1 className={styles.title}>Pending Dispatches</h1>
                <p className={styles.description}>
                  Create dispatch records for manufacturing work orders and trading sales orders ready to be shipped.
                </p>
              </div>

              <div className={styles.summary}>
                <div className={styles.summaryCount}>
                  <strong>{pendingItems.length}</strong>
                  <span>Awaiting Dispatch</span>
                </div>
                <div className={styles.divider} />
                <button onClick={() => refetch()} className={styles.refresh}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className={styles.headerFooter}>
            <p>
              Showing {pendingItems.length} order
              {pendingItems.length !== 1 ? "s" : ""} ready for dispatch
              &nbsp;·&nbsp; Manufacturing & Trading orders
            </p>
          </div>
        </div>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-center py-20 gap-3 text-sm text-gray-500">
            <Clock className="animate-spin h-5 w-5 text-blue-500" />
            Loading pending dispatch list...
          </div>
        )}

        {/* ── Error ── */}
        {error && !isLoading && (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-red-700">
              Failed to load dispatch queue
            </p>
            <p className="text-xs text-red-500">
              Please verify connectivity or your user permissions.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-3 text-red-600 border-red-200"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* ── Empty ── */}
        {!isLoading && !error && pendingItems.length === 0 && (
          <div className={styles.stateCard}>
            <div className={styles.stateContent}>
              <div className={styles.stateIcon}>
                <Package className="h-8 w-8" />
              </div>
              <h3>No Pending Dispatches</h3>
              <p>
                No orders are currently ready for dispatch.
                Once manufacturing QC passes or trading orders are submitted, they will appear here.
              </p>
            </div>
          </div>
        )}

        {/* ── Desktop Table ── */}
        {!isLoading && !error && pendingItems.length > 0 && (
          <>
            <div className={styles.desktopTable}>
              <div className={styles.tableScroll}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3.5 whitespace-nowrap">
                        Sales Order
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3.5 whitespace-nowrap">
                        Customer
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3.5 whitespace-nowrap">
                        Delivery Address
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3.5 whitespace-nowrap">
                        Product
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3.5 whitespace-nowrap">
                        Type
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3.5 whitespace-nowrap">
                        Qty
                      </th>
                      <th className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 px-5 py-3.5 whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pendingItems.map((item) => {
                      const isTrading = item.itemType === 'TRADING_SALES_ORDER';
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-blue-50/20 transition-colors group"
                        >
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-bold text-blue-600 font-mono text-xs tracking-wide">
                              #{item.orderNumber}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-semibold text-gray-800">
                              {item.customerName}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className="text-xs text-gray-500 block max-w-[200px] truncate"
                              title={item.deliveryAddress}
                            >
                              {item.deliveryAddress}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-gray-700 font-medium">
                              {item.productName}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded ${isTrading ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'}`}>
                              {isTrading ? 'TRADING' : 'MFG'}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 font-bold font-mono text-xs px-2.5 py-0.5 rounded-lg border border-emerald-100">
                              {item.approvedQuantity}
                            </span>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            <Button
                              size="sm"
                              onClick={() => {
                                if (item.itemType === 'WORK_ORDER' && item.workOrderId) {
                                  router.push(`/dispatch/create-dispatch?workOrderId=${item.workOrderId}`);
                                } else if (item.salesOrderId) {
                                  router.push(`/dispatch/create-dispatch?salesOrderId=${item.salesOrderId}`);
                                }
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 text-xs font-semibold"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Create Dispatch
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Mobile & Tablet: Card View ── */}
            <div className={styles.mobileCards}>
              {pendingItems.map((item) => {
                const isTrading = item.itemType === 'TRADING_SALES_ORDER';
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-blue-50/40 border-b border-blue-100/60">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600 font-mono text-xs tracking-wide">
                          #{item.orderNumber}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isTrading ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'}`}>
                          {isTrading ? 'TRADING' : 'MFG'}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="px-4 py-4 space-y-3">
                      {/* Customer */}
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Customer
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {item.customerName}
                          </p>
                        </div>
                      </div>

                      {/* Product */}
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Package className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Product
                          </p>
                          <p className="text-sm font-medium text-gray-700">
                            {item.productName}
                          </p>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Delivery Address
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.deliveryAddress}
                          </p>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Qty
                          </p>
                          <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 font-bold font-mono text-xs px-2.5 py-0.5 rounded-lg border border-emerald-100 mt-0.5">
                            {item.approvedQuantity}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (item.itemType === 'WORK_ORDER' && item.workOrderId) {
                              router.push(`/dispatch/create-dispatch?workOrderId=${item.workOrderId}`);
                            } else if (item.salesOrderId) {
                              router.push(`/dispatch/create-dispatch?salesOrderId=${item.salesOrderId}`);
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Create Dispatch
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, LayoutGrid, Clock } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/erp/data-table/DataTable";
import { StatusBadge } from "@/components/erp/common/StatusBadge";
import { backendFetch } from "@/lib/backendFetch";
import responsive from "../dispatch-responsive.module.css";
import pageStyles from "../orders/orders.module.css";
import styles from "../delivery/delivery.module.css";

interface Customer {
  companyName: string;
  address?: string;
}

interface SalesOrder {
  orderNumber: string;
  customer: Customer;
}

interface Dispatch {
  id: string;
  dispatchNo: string;
  status: string;
  receivedBy: string | null;
  deliveredAt: string | null;
  salesOrder: SalesOrder;
}

export default function DeliveryHistoryPage() {
  const { data: dispatches = [], isLoading } = useQuery<Dispatch[]>({
    queryKey: ["delivery-history-dispatches"],
    queryFn: async () => {
      const payload = await backendFetch<any>(
        "/api/backend/logistics/dispatches?status=DELIVERED",
      );
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
  });

  const deliveredHistory = dispatches.filter(
    (d) => String(d.status || "").toUpperCase() === "DELIVERED",
  );

  const historyColumns: ColumnDef<Dispatch>[] = [
    {
      accessorKey: "dispatchNo",
      header: "Dispatch Number",
      cell: ({ row }) => (
        <span className="font-semibold text-gray-800 text-sm whitespace-nowrap">
          {row.original.dispatchNo}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {row.original.salesOrder?.customer?.companyName || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "receivedBy",
      header: "Received By",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {row.original.receivedBy || "N/A"}
        </span>
      ),
    },
    {
      id: "deliveredAt",
      header: "Delivery Timestamp",
      cell: ({ row }) => {
        const date = row.original.deliveredAt
          ? new Date(row.original.deliveredAt).toLocaleString()
          : "-";
        return (
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
            {date}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="inline-flex items-center whitespace-nowrap">
          <StatusBadge status={row.original.status || "DELIVERED"} />
        </div>
      ),
    },
  ];

  return (
    <div className={responsive.flushPage}>
      <div className={`${responsive.content} ${styles.pageFlow}`}>
        <div className={pageStyles.header}>
          <div className={pageStyles.watermark}>
            <CheckCircle2 size={140} />
          </div>
          <div className={pageStyles.headerMain}>
            <div className={pageStyles.headerLayout}>
              <div className={pageStyles.headerCopy}>
                <span className={pageStyles.eyebrow}>
                  <LayoutGrid size={13} />
                  Logistics
                </span>
                <h1 className={pageStyles.title}>Delivery History</h1>
                <p className={pageStyles.description}>
                  View all shipments that have been successfully delivered to customers.
                </p>
              </div>
              <div className={pageStyles.summary}>
                <CheckCircle2 className="text-emerald-500 h-7 w-7" />
                <div className={pageStyles.summaryCount}>
                  <strong>{deliveredHistory.length}</strong>
                  <span>Delivered Shipments</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.workspace}>
          <div className={styles.queueColumn}>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>
                <CheckCircle2 className="text-emerald-500 h-5 w-5 mr-2" style={{ display: 'inline' }} />
                Completed Shipments Log
              </h2>
              {isLoading ? (
                <div className="flex justify-center py-8 text-sm text-gray-500 gap-3">
                  <Clock className="animate-spin h-5 w-5 text-indigo-500" />
                  Loading delivery history...
                </div>
              ) : (
                <div className="w-full overflow-x-auto scrollbar-thin border border-slate-200 rounded-xl bg-white p-2">
                  <DataTable
                    columns={historyColumns}
                    data={deliveredHistory}
                    className={styles.tableFrame}
                    emptyMessage="No shipments have been recorded as delivered yet."
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      const payload = await backendFetch<Dispatch[]>(
        "/api/backend/logistics/dispatches?status=DELIVERED",
      );
      return Array.isArray(payload) ? payload : [];
    },
  });

  const deliveredHistory = dispatches.filter((d) => d.status === "DELIVERED");

  const historyColumns: ColumnDef<Dispatch>[] = [
    {
      accessorKey: "dispatchNo",
      header: "Dispatch Number",
      cell: ({ row }) => (
        <span className="font-semibold text-gray-700">
          {row.original.dispatchNo}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <span>{row.original.salesOrder?.customer?.companyName}</span>
      ),
    },
    {
      accessorKey: "receivedBy",
      header: "Received By",
      cell: ({ row }) => <span>{row.original.receivedBy || "-"}</span>,
    },
    {
      id: "deliveredAt",
      header: "Delivery Timestamp",
      cell: ({ row }) => {
        const date = row.original.deliveredAt
          ? new Date(row.original.deliveredAt).toLocaleString()
          : "-";
        return (
          <span className="text-xs text-gray-500 font-medium">{date}</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
              <h1 className={pageStyles.title}>
                Delivery History
              </h1>
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
              Delivery History
            </h2>
            {isLoading ? (
              <div className="flex justify-center py-8 text-sm text-gray-500 gap-3">
                <Clock className="animate-spin h-5 w-5 text-indigo-500" />
                Loading delivery history...
              </div>
            ) : (
              <DataTable
                columns={historyColumns}
                data={deliveredHistory}
                className={styles.tableFrame}
                emptyMessage="No shipments have been recorded as delivered yet."
              />
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/erp/data-table/DataTable";
import { StatusBadge } from "@/components/erp/common/StatusBadge";
import { backendFetch } from "@/lib/backendFetch";
import styles from "../work-orders/work-orders.module.css";
import { Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QCInspection {
  id: string;
  workOrderId: string;
  status: string;
  approvedQuantity: string | number | null;
  rejectedQuantity: string | number | null;
  approvedAt: string | null;
  inspectorId: string | null;
  remarks: string | null;
  workOrder: {
    id: string;
    workOrderNumber: string;
    duration: number | null;
    startedAt: string | null;
    completedAt: string | null;
    status: string;
    salesOrderItem: {
      productNameSnapshot: string;
    } | null;
  };
}

export default function FinishedGoodsPage() {
  const [search, setSearch] = useState("");

  const { data } = useQuery({
    queryKey: ["qc-approved"],
    queryFn: async () => {
      const payload = await backendFetch<QCInspection[]>(
        "/api/backend/qc/inspections",
      );
      return Array.isArray(payload)
        ? payload.filter(
            (insp) =>
              insp.status === "APPROVED" &&
              insp.workOrder?.status === "QC_APPROVED",
          )
        : [];
    },
  });

  const filteredData = React.useMemo(() => {
    const inspections = Array.isArray(data) ? data : [];
    if (!search) return inspections;
    const lower = search.toLowerCase();
    return inspections.filter((i: QCInspection) =>
      i.workOrder?.workOrderNumber.toLowerCase().includes(lower),
    );
  }, [data, search]);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSendToDispatch = async (row: QCInspection) => {
    try {
      const woId = row.workOrder?.id || row.workOrderId;
      if (!woId) throw new Error("Work Order ID missing");
      await backendFetch(
        `/api/backend/production/work-orders/${woId}/send-to-dispatch`,
        {
          method: "POST",
        },
      );
      toast.success("Sent to Dispatch");
      queryClient.invalidateQueries({ queryKey: ["qc-approved"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
      router.push("/dispatch/orders");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send to dispatch",
      );
    }
  };

  const columns: ColumnDef<QCInspection>[] = [
    {
      accessorKey: "workOrder.workOrderNumber",
      header: "WO Number",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          {row.original.workOrder?.workOrderNumber}
        </span>
      ),
    },
    {
      id: "product",
      header: "Product",
      cell: ({ row }) =>
        row.original.workOrder?.salesOrderItem?.productNameSnapshot || "-",
    },
    {
      accessorKey: "approvedQuantity",
      header: "Approved Qty",
    },
    {
      accessorKey: "rejectedQuantity",
      header: "Rejected Qty",
    },
    {
      id: "duration",
      header: "Production Duration",
      cell: ({ row }) => {
        const d = row.original.workOrder?.duration;
        if (d == null) return "-";
        return (
          <span className="font-mono text-xs">
            {Math.floor(d / 60)}h {d % 60}m
          </span>
        );
      },
    },
    {
      id: "timeline",
      header: "Production Timeline",
      cell: ({ row }) => {
        const start = row.original.workOrder?.startedAt
          ? new Date(row.original.workOrder.startedAt).toLocaleString()
          : "-";
        const end = row.original.workOrder?.completedAt
          ? new Date(row.original.workOrder.completedAt).toLocaleString()
          : "-";
        return (
          <div className="flex flex-col text-xs space-y-1">
            <span className="text-gray-500">Start: {start}</span>
            <span className="text-gray-900">End: {end}</span>
          </div>
        );
      },
    },
    {
      id: "qcApproved",
      header: "QC Details",
      cell: ({ row }) => {
        const at = row.original.approvedAt
          ? new Date(row.original.approvedAt).toLocaleString()
          : "-";
        const by = row.original.inspectorId
          ? `User ${row.original.inspectorId.slice(0, 8)}`
          : "-";
        return (
          <div className="flex flex-col text-xs space-y-1">
            <span className="text-gray-900">By: {by}</span>
            <span className="text-gray-500">At: {at}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "remarks",
      header: "QC Remarks",
      cell: ({ row }) => (
        <span
          className="text-xs text-gray-600 truncate max-w-[150px] inline-block"
          title={row.original.remarks || ""}
        >
          {row.original.remarks || "-"}
        </span>
      ),
    },
    {
      accessorKey: "workOrder.status",
      header: "WO Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.workOrder?.status || "UNKNOWN"} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          onClick={() => handleSendToDispatch(row.original)}
          className={styles.dispatchButton}
        >
          <Truck className="h-4 w-4 mr-2" />
          Send to Dispatch
        </Button>
      ),
    },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroIcon}>
          <Package size={24} />
        </div>
        <div>
          <span className={styles.eyebrow}>Inventory</span>
          <h1>Finished Goods</h1>
          <p>View final approved production goods ready for dispatch.</p>
        </div>
        <div className={styles.summary}>
          <strong>{filteredData.length}</strong>
          <span>Approved</span>
        </div>
      </header>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <h2>Finished Goods</h2>
            <p>Quality Control approved orders.</p>
          </div>
          <label className={styles.search}>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by work order..."
              aria-label="Search finished goods"
            />
            <div className="w-12 flex items-center justify-center">
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  Clear
                </button>
              )}
            </div>
          </label>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          serverSide={false}
          className={styles.table}
          emptyMessage={
            search
              ? "No goods match your search."
              : "No finished goods available."
          }
        />
      </section>
    </main>
  );
}

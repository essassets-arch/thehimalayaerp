"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Search, Truck } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DataTable } from "@/components/erp/data-table/DataTable";
import { StatusBadge } from "@/components/erp/common/StatusBadge";
import { backendFetch } from "@/lib/backendFetch";
import styles from "./finished-goods.module.css";

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
    salesOrderItem: { productNameSnapshot: string } | null;
  };
}

export default function FinishedGoodsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ready" | "history">("ready");
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["qc-all-approved"],
    queryFn: async () => {
      const payload = await backendFetch<QCInspection[]>("/api/backend/qc/inspections");
      return Array.isArray(payload)
        ? payload.filter((insp) => insp.status === "APPROVED")
        : [];
    },
  });

  const allItems = Array.isArray(data) ? data : [];

  // Ready = QC_APPROVED (not yet dispatched); History = already sent
  const readyItems = allItems.filter((i) => i.workOrder?.status === "QC_APPROVED");
  const historyItems = allItems.filter((i) => i.workOrder?.status !== "QC_APPROVED");

  const filteredData = React.useMemo(() => {
    const base = activeTab === "ready" ? readyItems : historyItems;
    if (!search) return base;
    const lower = search.toLowerCase();
    return base.filter((i) =>
      i.workOrder?.workOrderNumber.toLowerCase().includes(lower)
    );
  }, [data, search, activeTab]);

  const handleSendToDispatch = async (row: QCInspection) => {
    try {
      const woId = row.workOrder?.id || row.workOrderId;
      if (!woId) throw new Error("Work Order ID missing");
      await backendFetch(`/api/backend/production/work-orders/${woId}/send-to-dispatch`, {
        method: "POST",
      });
      toast.success("Sent to Dispatch");
      queryClient.invalidateQueries({ queryKey: ["qc-approved"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
      router.push("/dispatch/orders");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send to dispatch");
    }
  };

  const columns: ColumnDef<QCInspection>[] = [
    {
      id: "woNumber",
      header: "WO Number",
      size: 145,
      cell: ({ row }) => <strong>{row.original.workOrder?.workOrderNumber}</strong>,
    },
    {
      id: "product",
      header: "Product",
      size: 160,
      cell: ({ row }) => row.original.workOrder?.salesOrderItem?.productNameSnapshot || "—",
    },
    {
      accessorKey: "approvedQuantity",
      header: "Approved Qty",
      size: 110,
    },
    {
      accessorKey: "rejectedQuantity",
      header: "Rejected Qty",
      size: 110,
    },
    {
      id: "duration",
      header: "Production Duration",
      size: 145,
      cell: ({ row }) => {
        const d = row.original.workOrder?.duration;
        if (d == null) return "—";
        return (
          <span className={styles.durationChip}>
            {Math.floor(d / 60)}h {d % 60}m
          </span>
        );
      },
    },
    {
      id: "timeline",
      header: "Production Timeline",
      size: 180,
      cell: ({ row }) => {
        const start = row.original.workOrder?.startedAt
          ? new Date(row.original.workOrder.startedAt).toLocaleString()
          : "—";
        const end = row.original.workOrder?.completedAt
          ? new Date(row.original.workOrder.completedAt).toLocaleString()
          : "—";
        return (
          <div className={styles.cellStack}>
            <span className={styles.cellMuted}>Start: {start}</span>
            <span className={styles.cellMain}>End: {end}</span>
          </div>
        );
      },
    },
    {
      id: "qcDetails",
      header: "QC Details",
      size: 155,
      cell: ({ row }) => {
        const at = row.original.approvedAt
          ? new Date(row.original.approvedAt).toLocaleString()
          : "—";
        const by = row.original.inspectorId
          ? `User ${row.original.inspectorId.slice(0, 8)}`
          : "—";
        return (
          <div className={styles.cellStack}>
            <span className={styles.cellMain}>By: {by}</span>
            <span className={styles.cellMuted}>At: {at}</span>
          </div>
        );
      },
    },
    {
      id: "woStatus",
      header: "WO Status",
      size: 130,
      cell: ({ row }) => (
        <StatusBadge status={row.original.workOrder?.status || "UNKNOWN"} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      size: 165,
      cell: ({ row }) => (
        <button
          type="button"
          className={styles.btnDispatch}
          onClick={() => handleSendToDispatch(row.original)}
        >
          <Truck size={14} />
          Send to Dispatch
        </button>
      ),
    },
  ];

  const historyColumns = columns.filter((c) => c.id !== "actions");

  return (
    <main className={styles.page}>
      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroIcon}>
          <Package size={22} />
        </div>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Inventory</span>
          <h1>Finished Goods</h1>
          <p>View final approved production goods ready for dispatch.</p>
        </div>
        <div className={styles.summaryBadge}>
          <strong>{activeTab === "ready" ? readyItems.length : historyItems.length}</strong>
          <span>{activeTab === "ready" ? "Ready" : "Dispatched"}</span>
        </div>
      </header>

      {/* ── Panel ── */}
      <section className={styles.panel}>
        {/* Tabs */}
        <div className={styles.tabs} role="tablist" aria-label="Finished goods tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "ready"}
            className={activeTab === "ready" ? styles.activeTab : ""}
            onClick={() => { setActiveTab("ready"); setSearch(""); }}
          >
            Ready for Dispatch <span>{readyItems.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "history"}
            className={activeTab === "history" ? styles.activeTab : ""}
            onClick={() => { setActiveTab("history"); setSearch(""); }}
          >
            History <span>{historyItems.length}</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div>
            <h2>{activeTab === "ready" ? "Ready for Dispatch" : "Dispatch History"}</h2>
            <p>{activeTab === "ready" ? "Quality Control approved orders awaiting dispatch." : "Orders that have already been sent to dispatch."}</p>
          </div>
          <label className={styles.search}>
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by work order..."
              aria-label="Search finished goods"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                Clear
              </button>
            )}
          </label>
        </div>

        <div className={styles.tableScrollArea}>
          {isLoading ? (
            <div className={styles.loading}>Loading finished goods…</div>
          ) : (
            <DataTable
              columns={activeTab === "ready" ? columns : historyColumns}
              data={filteredData}
              serverSide={false}
              emptyMessage={
                search
                  ? "No goods match your search."
                  : activeTab === "ready"
                  ? "No finished goods awaiting dispatch."
                  : "No dispatch history yet."
              }
            />
          )}
        </div>
      </section>
    </main>
  );
}

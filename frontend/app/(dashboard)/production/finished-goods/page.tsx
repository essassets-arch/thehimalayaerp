"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Search, Truck } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DataTable } from "@/components/erp/data-table/DataTable";
import { StatusBadge } from "@/components/erp/common/StatusBadge";
import { backendFetch } from "@/lib/backendFetch";
import styles from "./finished-goods.module.css";

interface FinishedGoodsRow {
  id: string;
  workOrderId: string;
  jobNo: string;
  productName: string;
  productCode: string;
  customerName: string;
  quantity: number;
  availableQuantity: number;
  unit: string;
  status: string;
  receivedAt: string;
  receivedById: string | null;
  workOrder?: {
    id: string;
    workOrderNumber: string;
    productionStatus: string;
    duration: number | null;
    startedAt: string | null;
    completedAt: string | null;
    status: string;
  };
}

export default function FinishedGoodsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ready" | "history">("ready");
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["finished-goods"],
    queryFn: async () => {
      const payload = await backendFetch<any>("/api/backend/production/finished-goods");
      return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    },
  });

  const allItems = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const readyCount = useMemo(() => allItems.filter((i) => i.status === "AVAILABLE").length, [allItems]);
  const historyCount = useMemo(() => allItems.filter((i) => i.status !== "AVAILABLE").length, [allItems]);

  const filteredData = useMemo(() => {
    const readyItems = allItems.filter((i) => i.status === "AVAILABLE");
    const historyItems = allItems.filter((i) => i.status !== "AVAILABLE");
    const base = activeTab === "ready" ? readyItems : historyItems;
    if (!search) return base;
    const lower = search.toLowerCase();
    return base.filter((i) =>
      i.jobNo?.toLowerCase().includes(lower) || i.productName?.toLowerCase().includes(lower)
    );
  }, [allItems, search, activeTab]);

  const handleSendToDispatch = async (row: any) => {
    try {
      const woId = row.workOrder?.id || row.workOrderId;
      if (!woId) throw new Error("Work Order ID missing");
      await backendFetch(`/api/backend/production/work-orders/${woId}/send-to-dispatch`, {
        method: "POST",
      });
      toast.success("Sent to Dispatch");
      queryClient.invalidateQueries({ queryKey: ["finished-goods"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
      router.push("/dispatch/orders");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send to dispatch");
    }
  };

  const columns: ColumnDef<FinishedGoodsRow>[] = [
    {
      id: "woNumber",
      header: "WO Number",
      size: 145,
      cell: ({ row }) => <strong>{row.original.jobNo}</strong>,
    },
    {
      id: "product",
      header: "Product",
      size: 160,
      cell: ({ row }) => row.original.productName || "—",
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      size: 110,
    },
    {
      accessorKey: "availableQuantity",
      header: "Available Qty",
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
      header: "Received",
      size: 155,
      cell: ({ row }) => {
        const at = row.original.receivedAt
          ? new Date(row.original.receivedAt).toLocaleString()
          : "—";
        const by = row.original.receivedById
          ? `User ${row.original.receivedById.slice(0, 8)}`
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
      header: "FG Status",
      size: 130,
      cell: ({ row }) => (
        <StatusBadge status={row.original.status || "UNKNOWN"} />
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
          <strong>{activeTab === "ready" ? readyCount : historyCount}</strong>
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
            Ready for Dispatch <span>{readyCount}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "history"}
            className={activeTab === "history" ? styles.activeTab : ""}
            onClick={() => { setActiveTab("history"); setSearch(""); }}
          >
            History <span>{historyCount}</span>
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

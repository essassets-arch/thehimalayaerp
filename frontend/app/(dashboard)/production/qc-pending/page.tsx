"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Swal from "sweetalert2";

import { DataTable } from "@/components/erp/data-table/DataTable";
import { StatusBadge } from "@/components/erp/common/StatusBadge";
import { backendFetch } from "@/lib/backendFetch";
import styles from "./qc-pending.module.css";

interface QCInspection {
  id: string;
  status: string;
  workOrder: {
    workOrderNumber: string;
    quantity: number;
    duration: number | null;
    completedAt: string | null;
    salesOrderItem: { productNameSnapshot: string } | null;
  };
  workflowState: { name: string } | null;
}

function isApproved(inspection: QCInspection): boolean {
  return (
    inspection.status.toUpperCase() === "APPROVED" ||
    inspection.workflowState?.name.toUpperCase().includes("APPROV") === true
  );
}

export default function QCPendingPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["qc-pending"],
    queryFn: async () => {
      const payload = await backendFetch<QCInspection[]>("/api/backend/qc/inspections");
      return Array.isArray(payload) ? payload : [];
    },
  });

  const allData = Array.isArray(data) ? data : [];
  const pendingCount = allData.filter((i) => !isApproved(i)).length;
  const historyCount = allData.filter(isApproved).length;

  const filteredData = React.useMemo(() => {
    const tab = allData.filter((i) =>
      activeTab === "pending" ? !isApproved(i) : isApproved(i)
    );
    if (!search) return tab;
    const lower = search.toLowerCase();
    return tab.filter(
      (i) =>
        i.workOrder?.workOrderNumber.toLowerCase().includes(lower) ||
        i.workOrder?.salesOrderItem?.productNameSnapshot?.toLowerCase().includes(lower)
    );
  }, [activeTab, data, search]);

  const handleApprove = async (inspection: QCInspection) => {
    if (approvingId) return;
    const maxQty = Number(inspection.workOrder.quantity) || 0;

    const { value: formValues, isConfirmed } = await Swal.fire({
      title: "QC Inspection",
      html: `
        <div style="text-align:left;margin-top:10px">
          <label style="display:block;font-size:14px;font-weight:500;margin-bottom:5px">Approved Quantity (Max: ${maxQty})</label>
          <input type="number" id="swal-approved" class="swal2-input" style="width:100%;margin:0 0 15px;max-width:100%;box-sizing:border-box" value="${maxQty}">
          <label style="display:block;font-size:14px;font-weight:500;margin-bottom:5px">Rejected Quantity</label>
          <input type="number" id="swal-rejected" class="swal2-input" style="width:100%;margin:0 0 15px;max-width:100%;box-sizing:border-box" value="0">
          <label style="display:block;font-size:14px;font-weight:500;margin-bottom:5px">Remarks (Optional)</label>
          <textarea id="swal-remarks" class="swal2-textarea" style="width:100%;margin:0;box-sizing:border-box"></textarea>
        </div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Approve & Close",
      confirmButtonColor: "#059669",
      preConfirm: () => {
        const approved = (document.getElementById("swal-approved") as HTMLInputElement).value;
        const rejected = (document.getElementById("swal-rejected") as HTMLInputElement).value;
        const remarks = (document.getElementById("swal-remarks") as HTMLTextAreaElement).value;
        if (!approved || Number(approved) < 0) {
          Swal.showValidationMessage("Please enter a valid approved quantity");
          return false;
        }
        return { approvedQuantity: Number(approved), rejectedQuantity: Number(rejected) || 0, remarks };
      },
    });

    if (!isConfirmed || !formValues) return;
    setApprovingId(inspection.id);
    try {
      await backendFetch(`/api/backend/qc/inspections/${inspection.id}/approve`, {
        method: "POST",
        body: formValues,
      });
      await refetch();
      await Swal.fire({ icon: "success", title: "QC Approved", text: "The order has been sent to Finished Goods.", timer: 1600, showConfirmButton: false });
    } catch (err) {
      await Swal.fire({ icon: "error", title: "Unable to Approve", text: err instanceof Error ? err.message : "The inspection could not be approved." });
    } finally {
      setApprovingId(null);
    }
  };

  const pendingColumns: ColumnDef<QCInspection>[] = [
    {
      id: "woNumber",
      header: "WO Number",
      size: 160,
      cell: ({ row }) => <strong>{row.original.workOrder?.workOrderNumber}</strong>,
    },
    {
      id: "product",
      header: "Product",
      size: 180,
      cell: ({ row }) => row.original.workOrder?.salesOrderItem?.productNameSnapshot || "—",
    },
    {
      id: "qty",
      header: "Produced Qty",
      size: 110,
      cell: ({ row }) => row.original.workOrder?.quantity ?? "—",
    },
    {
      id: "duration",
      header: "Production Duration",
      size: 150,
      cell: ({ row }) => {
        const d = row.original.workOrder?.duration;
        if (d == null) return "—";
        return <span className={styles.durationChip}>{Math.floor(d / 60)}h {d % 60}m</span>;
      },
    },
    {
      id: "completedAt",
      header: "Production Completed Time",
      size: 185,
      cell: ({ row }) => {
        const d = row.original.workOrder?.completedAt;
        return d ? new Date(d).toLocaleString() : "—";
      },
    },
    {
      id: "status",
      header: "Status",
      size: 110,
      cell: ({ row }) => (
        <StatusBadge status={row.original.workflowState?.name || row.original.status || "UNKNOWN"} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      size: 170,
      cell: ({ row }) => (
        <button
          type="button"
          className={styles.btnApprove}
          onClick={() => handleApprove(row.original)}
          disabled={approvingId === row.original.id}
        >
          {approvingId === row.original.id ? "Approving…" : "Inspect & Approve"}
        </button>
      ),
    },
  ];

  const historyColumns = pendingColumns.filter((c) => c.id !== "actions");

  if (error) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>Error loading QC inspections: {(error as Error).message}</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroIcon}>
          <ClipboardCheck size={22} />
        </div>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Quality Control</span>
          <h1>QC Pending</h1>
          <p>Inspect and approve completed production orders.</p>
        </div>
        <div className={styles.summaryBadge}>
          <strong>{pendingCount}</strong>
          <span>Pending</span>
        </div>
      </header>

      {/* ── Panel ── */}
      <section className={styles.panel}>
        {/* Tabs */}
        <div className={styles.tabs} role="tablist" aria-label="QC inspections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "pending"}
            className={activeTab === "pending" ? styles.activeTab : ""}
            onClick={() => setActiveTab("pending")}
          >
            Pending <span>{pendingCount}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "history"}
            className={activeTab === "history" ? styles.activeTab : ""}
            onClick={() => setActiveTab("history")}
          >
            Approval History <span>{historyCount}</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div>
            <h2>{activeTab === "pending" ? "Pending Inspections" : "Approved Inspection History"}</h2>
            <p>{activeTab === "pending" ? "Orders waiting for quality control approval." : "All completed and approved quality inspections."}</p>
          </div>
          <label className={styles.search}>
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === "pending" ? "Search pending inspection..." : "Search approval history..."}
              aria-label="Search inspections"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} aria-label="Clear search">Clear</button>
            )}
          </label>
        </div>

        {/* Table */}
        <div className={styles.tableScrollArea}>
          {isLoading ? (
            <div className={styles.loading}>Loading pending QC…</div>
          ) : (
            <DataTable
              columns={activeTab === "pending" ? pendingColumns : historyColumns}
              data={filteredData}
              serverSide={false}
              emptyMessage={
                search
                  ? "No inspections match your search."
                  : activeTab === "pending"
                  ? "No orders pending QC."
                  : "No approved inspection history yet."
              }
            />
          )}
        </div>
      </section>
    </main>
  );
}

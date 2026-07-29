"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Swal from "sweetalert2";

import { DataTable } from "@/components/erp/data-table/DataTable";
import { StatusBadge } from "@/components/erp/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { backendFetch } from "@/lib/backendFetch";
import styles from "../work-orders/work-orders.module.css";
import qcStyles from "./qc-pending.module.css";

interface QCInspection {
  id: string;
  status: string;
  workOrder: {
    workOrderNumber: string;
    quantity: number;
    duration: number | null;
    completedAt: string | null;
    salesOrderItem: {
      productNameSnapshot: string;
    } | null;
  };
  workflowState: {
    name: string;
  } | null;
}

function isApprovedInspection(inspection: QCInspection): boolean {
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
      try {
        const payload = await backendFetch<QCInspection[]>(
          "/api/backend/qc/inspections",
        );
        return Array.isArray(payload) ? payload : [];
      } catch (err: unknown) {
        console.error("QC Pending Fetch Error:", err);
        throw err;
      }
    },
  });

  const filteredData = React.useMemo(() => {
    const inspections = Array.isArray(data) ? data : [];
    const tabInspections = inspections.filter((inspection) =>
      activeTab === "pending"
        ? !isApprovedInspection(inspection)
        : isApprovedInspection(inspection),
    );
    if (!search) return tabInspections;
    const lower = search.toLowerCase();
    return tabInspections.filter(
      (inspection: QCInspection) =>
        inspection.workOrder?.workOrderNumber.toLowerCase().includes(lower) ||
        inspection.workOrder?.salesOrderItem?.productNameSnapshot
          ?.toLowerCase()
          .includes(lower),
    );
  }, [activeTab, data, search]);

  const pendingCount = (Array.isArray(data) ? data : []).filter(
    (inspection) => !isApprovedInspection(inspection),
  ).length;
  const historyCount = (Array.isArray(data) ? data : []).filter(
    isApprovedInspection,
  ).length;

  if (error) {
    return (
      <div className="p-8 text-red-500">
        Error loading QC inspections: {error.message}
      </div>
    );
  }

  const handleApprove = async (inspection: QCInspection) => {
    if (approvingId) return;

    const maxQty = Number(inspection.workOrder.quantity) || 0;

    const { value: formValues, isConfirmed } = await Swal.fire({
      title: "QC Inspection",
      html: `
        <div style="text-align: left; margin-top: 10px;">
          <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 5px;">Approved Quantity (Max: ${maxQty})</label>
          <input type="number" id="swal-approved" class="swal2-input" style="width: 100%; margin: 0 0 15px 0; max-width: 100%; box-sizing: border-box;" value="${maxQty}">
          
          <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 5px;">Rejected Quantity</label>
          <input type="number" id="swal-rejected" class="swal2-input" style="width: 100%; margin: 0 0 15px 0; max-width: 100%; box-sizing: border-box;" value="0">
          
          <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 5px;">Remarks (Optional)</label>
          <textarea id="swal-remarks" class="swal2-textarea" style="width: 100%; margin: 0; box-sizing: border-box;"></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Approve & Close",
      confirmButtonColor: "#10b981",
      preConfirm: () => {
        const approved = (
          document.getElementById("swal-approved") as HTMLInputElement
        ).value;
        const rejected = (
          document.getElementById("swal-rejected") as HTMLInputElement
        ).value;
        const remarks = (
          document.getElementById("swal-remarks") as HTMLTextAreaElement
        ).value;

        if (!approved || Number(approved) < 0) {
          Swal.showValidationMessage("Please enter a valid approved quantity");
          return false;
        }
        return {
          approvedQuantity: Number(approved),
          rejectedQuantity: Number(rejected) || 0,
          remarks,
        };
      },
    });

    if (!isConfirmed || !formValues) return;

    setApprovingId(inspection.id);
    try {
      await backendFetch(
        `/api/backend/qc/inspections/${inspection.id}/approve`,
        {
          method: "POST",
          body: formValues,
        },
      );
      await refetch();
      await Swal.fire({
        icon: "success",
        title: "QC Approved",
        text: "The order has been sent to Finished Goods.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Unable to Approve",
        text:
          error instanceof Error
            ? error.message
            : "The inspection could not be approved.",
      });
    } finally {
      setApprovingId(null);
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
      accessorKey: "workOrder.quantity",
      header: "Produced Qty",
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
      id: "completedAt",
      header: "Production Completed Time",
      cell: ({ row }) => {
        const d = row.original.workOrder?.completedAt;
        return d ? new Date(d).toLocaleString() : "-";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={
            row.original.workflowState?.name || row.original.status || "UNKNOWN"
          }
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          type="button"
          onClick={() => handleApprove(row.original)}
          disabled={approvingId === row.original.id}
          className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
        >
          {approvingId === row.original.id ? "Approving…" : "Inspect & Approve"}
        </Button>
      ),
    },
  ];

  return (
    <main className={`${styles.page} ${qcStyles.page}`}>
      <header className={styles.hero}>
        <div className={styles.heroIcon}>
          <ClipboardCheck size={24} />
        </div>
        <div>
          <span className={styles.eyebrow}>Quality Control</span>
          <h1>QC Pending</h1>
          <p>Inspect and approve completed production orders.</p>
        </div>
        <div className={styles.summary}>
          <strong>{pendingCount}</strong>
          <span>Pending</span>
        </div>
      </header>

      <section className={styles.panel}>
        <div
          className={qcStyles.tabs}
          role="tablist"
          aria-label="QC inspections"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "pending"}
            className={activeTab === "pending" ? qcStyles.activeTab : ""}
            onClick={() => setActiveTab("pending")}
          >
            Pending <span>{pendingCount}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "history"}
            className={activeTab === "history" ? qcStyles.activeTab : ""}
            onClick={() => setActiveTab("history")}
          >
            Approval History <span>{historyCount}</span>
          </button>
        </div>

        <div className={styles.toolbar}>
          <div>
            <h2>
              {activeTab === "pending"
                ? "Pending Inspections"
                : "Approved Inspection History"}
            </h2>
            <p>
              {activeTab === "pending"
                ? "Orders waiting for quality control approval."
                : "All completed and approved quality inspections."}
            </p>
          </div>
          <label className={styles.search}>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                activeTab === "pending"
                  ? "Search pending inspection..."
                  : "Search approval history..."
              }
              aria-label="Search inspections"
            />
            <div className={qcStyles.clearSlot}>
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

        {isLoading ? (
          <div className={styles.loading}>Loading pending QC…</div>
        ) : (
          <DataTable
            columns={
              activeTab === "pending"
                ? columns
                : columns.filter((column) => column.id !== "actions")
            }
            data={filteredData}
            serverSide={false}
            className={`${styles.table} ${qcStyles.table}`}
            emptyMessage={
              search
                ? "No inspections match your search."
                : activeTab === "pending"
                  ? "No orders pending QC."
                  : "No approved inspection history yet."
            }
          />
        )}
      </section>
    </main>
  );
}

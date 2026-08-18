"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { backendFetch } from "@/lib/backendFetch";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Eye, Truck, Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/erp/data-table/DataTable";
import { StatusBadge } from "@/components/erp/common/StatusBadge";
import { Button } from "@/components/ui/button";
import styles from "../production/work-orders/work-orders.module.css";
import responsive from "./dispatch-responsive.module.css";

interface Dispatch {
  id: string;
  dispatchNo: string;
  salesOrder: {
    orderNumber: string;
    customer: { companyName: string };
  };
  createdAt: string;
  workflowState: {
    code: string;
  };
}

export default function DispatchListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { data, isLoading } = useQuery({
    queryKey: ["dispatch-list", search, pagination],
    queryFn: async () => {
      const payload = await backendFetch<Dispatch[]>(
        "/api/backend/logistics/dispatches",
      );
      return Array.isArray(payload) ? payload : [];
    },
  });

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter(
      (d: Dispatch) =>
        d.dispatchNo.toLowerCase().includes(lower) ||
        d.salesOrder?.orderNumber.toLowerCase().includes(lower) ||
        d.salesOrder?.customer?.companyName.toLowerCase().includes(lower),
    );
  }, [data, search]);

  const columns: ColumnDef<Dispatch>[] = [
    {
      accessorKey: "dispatchNo",
      header: "Dispatch No",
      cell: ({ row }) => (
        <span className="font-semibold text-indigo-700 text-xs tracking-tight bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200/60 inline-flex items-center shrink-0">
          {row.getValue("dispatchNo")}
        </span>
      ),
    },
    {
      accessorKey: "salesOrder.orderNumber",
      header: "Sales Order",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800 text-xs">
          #{row.original.salesOrder?.orderNumber}
        </span>
      ),
    },
    {
      accessorKey: "salesOrder.customer.companyName",
      header: "Customer",
      cell: ({ row }) => (
        <span className="text-slate-800 font-medium text-xs truncate max-w-[180px] block" title={row.original.salesOrder?.customer?.companyName || "—"}>
          {row.original.salesOrder?.customer?.companyName || "—"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <span className="text-slate-600 text-xs font-medium whitespace-nowrap">
          {format(new Date(row.getValue("createdAt")), "MMM dd, yyyy HH:mm")}
        </span>
      ),
    },
    {
      accessorKey: "workflowState.code",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.workflowState?.code || "UNKNOWN"} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 font-semibold text-xs"
          onClick={() => router.push(`/dispatch/${row.original.id}`)}
        >
          <Eye className="h-4 w-4" />
          <span>Manage</span>
        </Button>
      ),
    },
  ];

  return (
    <main className={`${styles.page} ${responsive.page}`}>
      <header className={styles.hero}>
        <div className={styles.heroIcon}>
          <Truck size={24} />
        </div>
        <div>
          <span className={styles.eyebrow}>Logistics</span>
          <h1>Dispatch Dashboard</h1>
          <p>Manage logistics, trucks, and deliveries.</p>
        </div>
        <div className={styles.summary}>
          <strong>{filteredData.length}</strong>
          <span>Dispatches</span>
        </div>
        <div className="ml-auto">
          <Button
            onClick={() => router.push("/dispatch/orders")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Dispatch
          </Button>
        </div>
      </header>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <h2>Dispatch Register</h2>
            <p>Active and past dispatch assignments.</p>
          </div>
          <label className={styles.search}>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search dispatch no or customer..."
              aria-label="Search dispatches"
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

        {isLoading ? (
          <div className={styles.loading}>Loading dispatches...</div>
        ) : (
          <div className="w-full overflow-x-auto scrollbar-thin rounded-xl border border-slate-200">
            <DataTable
              columns={columns}
              data={filteredData.slice(
                pagination.pageIndex * pagination.pageSize,
                (pagination.pageIndex + 1) * pagination.pageSize,
              )}
              pageCount={Math.ceil(filteredData.length / pagination.pageSize)}
              onPaginationChange={setPagination}
              serverSide={false}
              className={styles.table}
              emptyMessage={
                search
                  ? "No dispatches match your search."
                  : "No dispatches have been created yet."
              }
            />
          </div>
        )}
      </section>
    </main>
  );
}

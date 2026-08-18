"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Eye, Truck } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { backendFetch } from "@/lib/backendFetch";
import { DataTable } from "@/components/erp/data-table/DataTable";
import {
  DispatchPageShell,
  DispatchPageHeader,
  DispatchNavigationTabs,
  DispatchToolbar,
  DispatchTableCard,
  SalesOrderNumberBadge,
  DispatchStatusBadge,
  DispatchActionButton,
  DispatchLoadingState,
  DispatchEmptyState,
} from "./components";

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

  const { data = [], isLoading, isRefetching, refetch } = useQuery<Dispatch[]>({
    queryKey: ["dispatch-list", search, pagination],
    queryFn: async () => {
      const payload = await backendFetch<Dispatch[]>(
        "/api/backend/logistics/dispatches"
      );
      return Array.isArray(payload) ? payload : [];
    },
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const lower = search.toLowerCase();
    return data.filter(
      (d: Dispatch) =>
        d.dispatchNo?.toLowerCase().includes(lower) ||
        d.salesOrder?.orderNumber?.toLowerCase().includes(lower) ||
        d.salesOrder?.customer?.companyName?.toLowerCase().includes(lower)
    );
  }, [data, search]);

  const columns: ColumnDef<Dispatch>[] = [
    {
      accessorKey: "dispatchNo",
      header: "Dispatch No",
      cell: ({ row }) => (
        <SalesOrderNumberBadge orderNumber={row.getValue("dispatchNo")} />
      ),
    },
    {
      accessorKey: "salesOrder.orderNumber",
      header: "Sales Order",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800 text-xs">
          #{row.original.salesOrder?.orderNumber || "—"}
        </span>
      ),
    },
    {
      accessorKey: "salesOrder.customer.companyName",
      header: "Customer",
      cell: ({ row }) => (
        <span
          className="text-slate-800 font-semibold text-xs truncate max-w-[200px] block"
          title={row.original.salesOrder?.customer?.companyName || "—"}
        >
          {row.original.salesOrder?.customer?.companyName || "—"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <span className="text-slate-600 text-xs font-medium whitespace-nowrap">
          {row.getValue("createdAt")
            ? format(new Date(row.getValue("createdAt")), "MMM dd, yyyy HH:mm")
            : "—"}
        </span>
      ),
    },
    {
      accessorKey: "workflowState.code",
      header: "Status",
      cell: ({ row }) => (
        <DispatchStatusBadge status={row.original.workflowState?.code || "UNKNOWN"} />
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right whitespace-nowrap">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DispatchActionButton
            label="Manage"
            icon={Eye}
            variant="ghost"
            onClick={() => router.push(`/dispatch/${row.original.id}`)}
          />
        </div>
      ),
    },
  ];

  return (
    <DispatchPageShell>
      {/* Navigation Tabs */}
      <DispatchNavigationTabs />

      {/* Page Header */}
      <DispatchPageHeader
        title="Dispatch Dashboard"
        description="Overview of all logistics, truck allocations, active transit dispatches, and customer handovers."
        eyebrow="Logistics Overview"
        icon={Truck}
        stats={[
          { label: "Total Dispatches", value: filteredData.length, icon: Truck, color: "bg-indigo-50 text-indigo-600" },
        ]}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      >
        <button
          type="button"
          onClick={() => router.push("/dispatch/orders")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Dispatch</span>
        </button>
      </DispatchPageHeader>

      {/* Toolbar / Search Filter */}
      <DispatchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search dispatch no, order number or customer..."
        title="Dispatch Register"
        subtitle={`Active and past dispatch assignments (${filteredData.length} records)`}
      />

      {/* Loading State */}
      {isLoading && <DispatchLoadingState count={5} />}

      {/* Empty State */}
      {!isLoading && filteredData.length === 0 && (
        <DispatchEmptyState
          title={search ? "No Dispatches Match Search" : "No Dispatches Created"}
          description={
            search
              ? `No dispatches match "${search}". Try a different search term.`
              : "No dispatches have been created yet. Click Create Dispatch to get started."
          }
          onRetry={() => refetch()}
        />
      )}

      {/* Table Display */}
      {!isLoading && filteredData.length > 0 && (
        <DispatchTableCard minTableWidth={960}>
          <DataTable
            columns={columns}
            data={filteredData.slice(
              pagination.pageIndex * pagination.pageSize,
              (pagination.pageIndex + 1) * pagination.pageSize
            )}
            pageCount={Math.ceil(filteredData.length / pagination.pageSize)}
            onPaginationChange={setPagination}
            serverSide={false}
            emptyMessage={
              search
                ? "No dispatches match your search."
                : "No dispatches have been created yet."
            }
          />
        </DispatchTableCard>
      )}
    </DispatchPageShell>
  );
}

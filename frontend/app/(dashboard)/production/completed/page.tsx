'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck, Search } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/erp/data-table/DataTable';
import { StatusBadge } from '@/components/erp/common/StatusBadge';
import { backendFetch } from '@/lib/backendFetch';
import styles from './completed.module.css';

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  productionPlan: {
    salesOrder: { customer: { companyName: string } };
  };
  salesOrderItem: { productNameSnapshot: string } | null;
  quantity: number;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  completedById: string | null;
  workflowState: { name: string } | null;
}

export default function CompletedOrdersPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['work-orders-completed'],
    queryFn: async () => {
      const payload = await backendFetch<WorkOrder[]>('/api/backend/production/work-orders');
      return Array.isArray(payload)
        ? payload.filter((wo) => wo.completedAt != null)
        : [];
    },
  });

  const filteredData = React.useMemo(() => {
    const orders = Array.isArray(data) ? data : [];
    if (!search) return orders;
    const lower = search.toLowerCase();
    return orders.filter((w) => w.workOrderNumber.toLowerCase().includes(lower));
  }, [data, search]);

  const columns: ColumnDef<WorkOrder>[] = [
    {
      accessorKey: 'workOrderNumber',
      header: 'WO Number',
      size: 155,
      cell: ({ row }) => <strong>{row.getValue('workOrderNumber')}</strong>,
    },
    {
      id: 'product',
      header: 'Product',
      size: 175,
      cell: ({ row }) => row.original.salesOrderItem?.productNameSnapshot || '—',
    },
    {
      accessorKey: 'quantity',
      header: 'Produced Qty',
      size: 110,
    },
    {
      id: 'startedAt',
      header: 'Started At',
      size: 160,
      cell: ({ row }) =>
        row.original.startedAt
          ? new Date(row.original.startedAt).toLocaleString()
          : '—',
    },
    {
      id: 'completedAt',
      header: 'Completed At',
      size: 160,
      cell: ({ row }) =>
        row.original.completedAt
          ? new Date(row.original.completedAt).toLocaleString()
          : '—',
    },
    {
      id: 'duration',
      header: 'Total Duration',
      size: 120,
      cell: ({ row }) => {
        if (row.original.duration == null) return '—';
        const h = Math.floor(row.original.duration / 60);
        const m = row.original.duration % 60;
        return <span className={styles.durationChip}>{h}h {m}m</span>;
      },
    },
    {
      id: 'completedBy',
      header: 'Completed By',
      size: 140,
      cell: ({ row }) =>
        row.original.completedById
          ? 'User ' + row.original.completedById.slice(0, 8)
          : '—',
    },
    {
      accessorKey: 'status',
      header: 'Current Status',
      size: 140,
      cell: ({ row }) => (
        <StatusBadge status={row.original.workflowState?.name || row.original.status || 'UNKNOWN'} />
      ),
    },
  ];

  return (
    <main className={styles.page}>
      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroIcon}>
          <ClipboardCheck size={22} />
        </div>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Production History</span>
          <h1>Completed Orders</h1>
          <p>Review completed production orders and their time durations.</p>
        </div>
        <div className={styles.summaryBadge}>
          <strong>{filteredData.length}</strong>
          <span>Completed</span>
        </div>
      </header>

      {/* ── Panel ── */}
      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <h2>Completed</h2>
            <p>Orders that have finished production.</p>
          </div>
          <label className={styles.search}>
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search work order..."
              aria-label="Search completed orders"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                Clear
              </button>
            )}
          </label>
        </div>

        <div className={styles.tableScrollArea}>
          {isLoading ? (
            <div className={styles.loading}>Loading completed orders…</div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              serverSide={false}
              emptyMessage={search ? 'No work orders match your search.' : 'No completed work orders yet.'}
            />
          )}
        </div>
      </section>
    </main>
  );
}

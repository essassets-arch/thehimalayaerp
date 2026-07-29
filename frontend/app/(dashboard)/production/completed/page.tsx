'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck, Search } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/erp/data-table/DataTable';
import { StatusBadge } from '@/components/erp/common/StatusBadge';
import { backendFetch } from '@/lib/backendFetch';
import styles from '../work-orders/work-orders.module.css';

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  productionPlan: {
    salesOrder: {
      customer: { companyName: string }
    }
  };
  salesOrderItem: {
    productNameSnapshot: string;
  } | null;
  quantity: number;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  completedById: string | null;
  workflowState: {
    name: string;
  } | null;
}

export default function CompletedOrdersPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['work-orders-completed'],
    queryFn: async () => {
      const payload = await backendFetch<WorkOrder[]>('/api/backend/production/work-orders');
      return Array.isArray(payload)
        ? payload.filter((workOrder) => {
            const status = String(workOrder.workflowState?.name || workOrder.status || '').toUpperCase();
            // In the suggested flow, after COMPLETED it might go to QC_PENDING or CLOSED.
            // We can show anything that has a completedAt.
            return workOrder.completedAt != null;
          })
        : [];
    }
  });

  const filteredData = React.useMemo(() => {
    const workOrders = Array.isArray(data) ? data : [];
    if (!search) return workOrders;
    const lower = search.toLowerCase();
    return workOrders.filter((w: WorkOrder) =>
      w.workOrderNumber.toLowerCase().includes(lower)
    );
  }, [data, search]);

  const columns: ColumnDef<WorkOrder>[] = [
    {
      accessorKey: 'workOrderNumber',
      header: 'WO Number',
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.getValue('workOrderNumber')}</span>,
    },
    {
      id: 'product',
      header: 'Product',
      cell: ({ row }) => row.original.salesOrderItem?.productNameSnapshot || '-',
    },
    {
      accessorKey: 'quantity',
      header: 'Produced Qty',
    },
    {
      id: 'startedAt',
      header: 'Started At',
      cell: ({ row }) => row.original.startedAt ? new Date(row.original.startedAt).toLocaleString() : '-',
    },
    {
      id: 'completedAt',
      header: 'Completed At',
      cell: ({ row }) => row.original.completedAt ? new Date(row.original.completedAt).toLocaleString() : '-',
    },
    {
      id: 'duration',
      header: 'Total Duration',
      cell: ({ row }) => {
        if (row.original.duration == null) return '-';
        const hours = Math.floor(row.original.duration / 60);
        const mins = row.original.duration % 60;
        return <span className="font-mono text-xs">{hours}h {mins}m</span>;
      },
    },
    {
      id: 'completedBy',
      header: 'Completed By',
      cell: ({ row }) => row.original.completedById ? 'User ' + row.original.completedById.slice(0, 8) : '-',
    },
    {
      accessorKey: 'status',
      header: 'Current Status',
      cell: ({ row }) => <StatusBadge status={row.original.workflowState?.name || row.original.status || 'UNKNOWN'} />,
    },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroIcon}><ClipboardCheck size={24} /></div>
        <div>
          <span className={styles.eyebrow}>Production History</span>
          <h1>Completed Orders</h1>
          <p>Review completed production orders and their time durations.</p>
        </div>
        <div className={styles.summary}>
          <strong>{filteredData.length}</strong>
          <span>Completed</span>
        </div>
      </header>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <h2>Completed</h2>
            <p>Orders that have finished production.</p>
          </div>
          <label className={styles.search}>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search work order..."
              aria-label="Search work orders"
            />
            <div className="w-12 flex items-center justify-center">
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                  Clear
                </button>
              )}
            </div>
          </label>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading completed orders…</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredData}
            serverSide={false}
            className={styles.table}
            emptyMessage={search ? 'No work orders match your search.' : 'No completed work orders yet.'}
          />
        )}
      </section>
    </main>
  );
}

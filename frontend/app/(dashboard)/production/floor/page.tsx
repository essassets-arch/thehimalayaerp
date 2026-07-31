'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Factory, Search, Timer } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import Swal from 'sweetalert2';

import { DataTable } from '@/components/erp/data-table/DataTable';
import { StatusBadge } from '@/components/erp/common/StatusBadge';
import { backendFetch } from '@/lib/backendFetch';
import styles from './floor.module.css';

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  productionPlan: {
    salesOrder: {
      customer: { companyName: string };
    };
  };
  salesOrderItem: {
    productNameSnapshot: string;
  } | null;
  quantity: number;
  status: string;
  startedAt: string | null;
  workflowState: { name: string } | null;
}

function LiveDuration({ startedAt }: { startedAt: string }) {
  const [durationStr, setDurationStr] = useState('');

  useEffect(() => {
    if (!startedAt) { setDurationStr('-'); return; }
    const update = () => {
      const ms = Date.now() - new Date(startedAt).getTime();
      if (ms < 0) return setDurationStr('0s');
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setDurationStr(`${h}h ${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <span className={styles.durationChip}>
      <Timer size={12} />
      {durationStr}
    </span>
  );
}

export default function ProductionFloorPage() {
  const [search, setSearch] = useState('');
  const [completingId, setCompletingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['work-orders-floor'],
    queryFn: async () => {
      const payload = await backendFetch<WorkOrder[]>('/api/backend/production/work-orders');
      return Array.isArray(payload)
        ? payload.filter((wo) => {
            const s = String(wo.workflowState?.name || wo.status || '').toUpperCase();
            return s === 'STARTED' || s === 'IN_PROGRESS';
          })
        : [];
    },
  });

  const filteredData = React.useMemo(() => {
    const orders = Array.isArray(data) ? data : [];
    if (!search) return orders;
    const lower = search.toLowerCase();
    return orders.filter((w) => w.workOrderNumber.toLowerCase().includes(lower));
  }, [data, search]);

  const handleComplete = async (wo: WorkOrder) => {
    if (completingId) return;
    const confirmed = await Swal.fire({
      title: 'Complete Production Order?',
      text: `Mark ${wo.workOrderNumber} as fully produced and send to QC?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Complete Order',
      confirmButtonColor: '#059669',
    });
    if (!confirmed.isConfirmed) return;

    setCompletingId(wo.id);
    try {
      await backendFetch(`/api/backend/production/work-orders/${wo.id}/complete`, {
        method: 'POST',
        body: { remarks: 'Production completed from floor' },
      });
      await refetch();
      await Swal.fire({
        icon: 'success',
        title: 'Order Completed',
        text: `${wo.workOrderNumber} has been sent to QC.`,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Unable to Complete Order',
        text: err instanceof Error ? err.message : 'Work order could not be completed.',
      });
    } finally {
      setCompletingId(null);
    }
  };

  const columns: ColumnDef<WorkOrder>[] = [
    {
      accessorKey: 'workOrderNumber',
      header: 'WO Number',
      size: 160,
      cell: ({ row }) => <strong>{row.getValue('workOrderNumber')}</strong>,
    },
    {
      id: 'customer',
      header: 'Customer',
      size: 150,
      cell: ({ row }) => row.original.productionPlan?.salesOrder?.customer?.companyName || '—',
    },
    {
      id: 'product',
      header: 'Product',
      size: 160,
      cell: ({ row }) => row.original.salesOrderItem?.productNameSnapshot || '—',
    },
    {
      accessorKey: 'quantity',
      header: 'Plan Qty',
      size: 90,
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
      id: 'liveDuration',
      header: 'Live Duration',
      size: 130,
      cell: ({ row }) =>
        row.original.startedAt
          ? <LiveDuration startedAt={row.original.startedAt} />
          : '—',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      cell: ({ row }) => (
        <StatusBadge status={row.original.workflowState?.name || row.original.status || 'UNKNOWN'} />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 160,
      cell: ({ row }) => (
        <button
          type="button"
          className={styles.btnComplete}
          onClick={() => handleComplete(row.original)}
          disabled={completingId === row.original.id}
        >
          {completingId === row.original.id ? 'Completing…' : 'Complete Order'}
        </button>
      ),
    },
  ];

  return (
    <main className={styles.page}>
      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroIcon}>
          <Factory size={22} />
        </div>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Active production</span>
          <h1>Production Floor</h1>
          <p>Monitor live production durations and finalize work orders.</p>
        </div>
        <div className={styles.summaryBadge}>
          <span className={styles.liveDot} />
          <div>
            <strong>{filteredData.length}</strong>
            <span>In Progress</span>
          </div>
        </div>
      </header>

      {/* ── Panel ── */}
      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <h2>In Progress</h2>
            <p>Orders currently being produced on the floor.</p>
          </div>
          <label className={styles.search}>
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search work order..."
              aria-label="Search work orders"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                Clear
              </button>
            )}
          </label>
        </div>

        <div className={styles.tableArea}>
          {isLoading ? (
            <div className={styles.loading}>Loading active orders…</div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              serverSide={false}
              emptyMessage={search ? 'No work orders match your search.' : 'No active work orders on the floor.'}
            />
          )}
        </div>
      </section>
    </main>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Factory, Search } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import Swal from 'sweetalert2';

import { DataTable } from '@/components/erp/data-table/DataTable';
import { StatusBadge } from '@/components/erp/common/StatusBadge';
import { Button } from '@/components/ui/button';
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
  startedById: string | null;
  workflowState: {
    name: string;
  } | null;
}

function LiveDuration({ startedAt }: { startedAt: string }) {
  const [durationStr, setDurationStr] = useState('');

  useEffect(() => {
    if (!startedAt) {
      setDurationStr('-');
      return;
    }
    const update = () => {
      const ms = new Date().getTime() - new Date(startedAt).getTime();
      if (ms < 0) return setDurationStr('0s');
      const hours = Math.floor(ms / (1000 * 60 * 60));
      const mins = Math.floor((ms / (1000 * 60)) % 60);
      const secs = Math.floor((ms / 1000) % 60);
      setDurationStr(`${hours}h ${mins}m ${secs}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return <span className="font-mono text-xs">{durationStr}</span>;
}

export default function ProductionFloorPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [completingId, setCompletingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['work-orders-floor'],
    queryFn: async () => {
      const payload = await backendFetch<WorkOrder[]>('/api/backend/production/work-orders');
      return Array.isArray(payload)
        ? payload.filter((workOrder) => {
            const status = String(workOrder.workflowState?.name || workOrder.status || '').toUpperCase();
            return status === 'STARTED' || status === 'IN_PROGRESS';
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

  const handleCompleteWork = async (workOrder: WorkOrder) => {
    if (completingId) return;
    const confirmation = await Swal.fire({
      title: 'Complete Production Order?',
      text: `Are you sure ${workOrder.workOrderNumber} is fully produced and ready for QC?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Complete Order',
      confirmButtonColor: '#10b981',
    });
    if (!confirmation.isConfirmed) return;

    setCompletingId(workOrder.id);
    try {
      await backendFetch(`/api/backend/production/work-orders/${workOrder.id}/complete`, {
        method: 'POST',
        body: { remarks: 'Production completed from floor' },
      });
      await refetch();
      await Swal.fire({
        icon: 'success',
        title: 'Order Completed',
        text: `${workOrder.workOrderNumber} has been sent to QC.`,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Unable to Complete Order',
        text: error instanceof Error ? error.message : 'Work order could not be completed.',
      });
    } finally {
      setCompletingId(null);
    }
  };

  const columns: ColumnDef<WorkOrder>[] = [
    {
      accessorKey: 'workOrderNumber',
      header: 'WO Number',
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.getValue('workOrderNumber')}</span>,
    },
    {
      accessorKey: 'productionPlan.salesOrder.customer.companyName',
      header: 'Customer',
      cell: ({ row }) => row.original.productionPlan?.salesOrder?.customer?.companyName || '-',
    },
    {
      id: 'product',
      header: 'Product',
      cell: ({ row }) => row.original.salesOrderItem?.productNameSnapshot || '-',
    },
    {
      accessorKey: 'quantity',
      header: 'Plan Qty',
    },
    {
      id: 'startedAt',
      header: 'Started At',
      cell: ({ row }) => row.original.startedAt ? new Date(row.original.startedAt).toLocaleString() : '-',
    },
    {
      id: 'liveDuration',
      header: 'Live Duration',
      cell: ({ row }) => row.original.startedAt ? <LiveDuration startedAt={row.original.startedAt} /> : '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.workflowState?.name || row.original.status || 'UNKNOWN'} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          type="button"
          onClick={() => handleCompleteWork(row.original)}
          disabled={completingId === row.original.id}
          className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
        >
          {completingId === row.original.id ? 'Completing…' : 'Complete Order'}
        </Button>
      ),
    },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroIcon}><Factory size={24} /></div>
        <div>
          <span className={styles.eyebrow}>Active production</span>
          <h1>Production Floor</h1>
          <p>Monitor live production durations and finalize work orders.</p>
        </div>
        <div className={styles.summary}>
          <strong>{filteredData.length}</strong>
          <span>In Progress</span>
        </div>
      </header>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <h2>In Progress</h2>
            <p>Orders currently being produced.</p>
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
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                Clear
              </button>
            )}
          </label>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading active orders…</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredData}
            serverSide={false}
            className={styles.table}
            emptyMessage={search ? 'No work orders match your search.' : 'No active work orders on the floor.'}
          />
        )}
      </section>
    </main>
  );
}

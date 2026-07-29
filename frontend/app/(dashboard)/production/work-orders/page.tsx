'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ClipboardList, Eye, Search } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import Swal from 'sweetalert2';

import { DataTable } from '@/components/erp/data-table/DataTable';
import { StatusBadge } from '@/components/erp/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { backendFetch } from '@/lib/backendFetch';
import styles from './work-orders.module.css';

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  productionPlan: {
    planNumber: string;
    salesOrder: {
      orderNumber: string;
      customer: { companyName: string }
    }
  };
  quantity: number;
  createdAt: string;
  workflowState: {
    name: string;
  } | null;
  status: string; // fallback
}

export default function WorkOrderListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [startingId, setStartingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['work-orders-list'],
    queryFn: async () => {
      const payload = await backendFetch<WorkOrder[]>('/api/backend/production/work-orders');
      return Array.isArray(payload)
        ? payload.filter((workOrder) => {
            const status = String(workOrder.workflowState?.name || workOrder.status || '').toUpperCase();
            return !['CREATED', 'CANCELLED'].includes(status);
          })
        : [];
    }
  });

  const filteredData = React.useMemo(() => {
    const workOrders = Array.isArray(data) ? data : [];
    if (!search) return workOrders;
    const lower = search.toLowerCase();
    return workOrders.filter((w: WorkOrder) =>
      w.workOrderNumber.toLowerCase().includes(lower) || 
      w.productionPlan?.planNumber.toLowerCase().includes(lower)
    );
  }, [data, search]);

  const handleStartWork = async (workOrder: WorkOrder) => {
    if (startingId) return;
    const confirmation = await Swal.fire({
      title: 'Start Production Work?',
      text: `Start ${workOrder.workOrderNumber} on the production floor?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Start Work',
      confirmButtonColor: '#2563eb',
    });
    if (!confirmation.isConfirmed) return;

    setStartingId(workOrder.id);
    try {
      await backendFetch(`/api/backend/production/work-orders/${workOrder.id}/start`, {
        method: 'POST',
        body: { remarks: 'Production work started' },
      });
      await refetch();
      await Swal.fire({
        icon: 'success',
        title: 'Work Started',
        text: `${workOrder.workOrderNumber} is now active on the production floor.`,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Unable to Start Work',
        text: error instanceof Error ? error.message : 'Work order could not be started.',
      });
    } finally {
      setStartingId(null);
    }
  };

  const columns: ColumnDef<WorkOrder>[] = [
    {
      accessorKey: 'workOrderNumber',
      header: 'WO Number',
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.getValue('workOrderNumber')}</span>,
    },
    {
      accessorKey: 'productionPlan.planNumber',
      header: 'Production Plan',
    },
    {
      accessorKey: 'productionPlan.salesOrder.customer.companyName',
      header: 'Customer',
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.workflowState?.name || row.original.status || 'UNKNOWN'} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const status = String(row.original.workflowState?.name || row.original.status || '').toUpperCase();
        if (status === 'READY') {
          return (
            <Button
              type="button"
              onClick={() => handleStartWork(row.original)}
              disabled={startingId === row.original.id}
              className={styles.dispatchButton}
            >
              {startingId === row.original.id ? 'Starting…' : 'Start Work'}
            </Button>
          );
        }
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/production/work-orders/${row.original.id}`)}
            className="h-8 gap-1"
          >
            <Eye className="h-4 w-4 text-gray-500" />
            Terminal
          </Button>
        );
      },
    },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroIcon}><ClipboardList size={24} /></div>
        <div>
          <span className={styles.eyebrow}>Production control</span>
          <h1>Work Orders</h1>
          <p>Manage shop-floor execution, production quantities and batch activity.</p>
        </div>
        <div className={styles.summary}>
          <strong>{filteredData.length}</strong>
          <span>Visible orders</span>
        </div>
      </header>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <h2>Work-order register</h2>
            <p>Orders released by Plant Head and assigned to Production.</p>
          </div>
          <label className={styles.search}>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search work order or plan..."
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
          <div className={styles.loading}>Loading work orders…</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredData}
            serverSide={false}
            className={styles.table}
            emptyMessage={search ? 'No work orders match your search.' : 'No work orders have been released yet.'}
          />
        )}
      </section>
    </main>
  );
}

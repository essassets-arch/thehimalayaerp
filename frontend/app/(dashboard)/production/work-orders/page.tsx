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
import OrderDetailsModal from '@/shared/components/OrderDetailsModal';
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
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<any>(null);

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
    return workOrders.filter((w: WorkOrder) => {
      const soNo = (w.productionPlan?.salesOrder?.orderNumber || (w as any).salesOrder?.orderNumber || '').toLowerCase();
      const woNo = (w.workOrderNumber || '').toLowerCase();
      const planNo = (w.productionPlan?.planNumber || '').toLowerCase();
      const cust = (w.productionPlan?.salesOrder?.customer?.companyName || '').toLowerCase();
      return soNo.includes(lower) || woNo.includes(lower) || planNo.includes(lower) || cust.includes(lower);
    });
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

  const handlePauseWork = async (workOrder: WorkOrder) => {
    Swal.fire({
      icon: 'info',
      title: 'Work Paused',
      text: `Work order ${workOrder.workOrderNumber} has been paused.`,
      timer: 1600,
      showConfirmButton: false,
    });
  };

  const handleCompleteWork = async (workOrder: WorkOrder) => {
    const confirmation = await Swal.fire({
      title: 'Complete Production Work?',
      text: `Mark ${workOrder.workOrderNumber} as complete?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Complete Work',
      confirmButtonColor: '#2563eb',
    });
    if (!confirmation.isConfirmed) return;

    try {
      await backendFetch(`/api/backend/production/work-orders/${workOrder.id}/complete`, {
        method: 'POST',
        body: { remarks: 'Production work completed' },
      });
      await refetch();
      await Swal.fire({
        icon: 'success',
        title: 'Work Completed',
        text: `${workOrder.workOrderNumber} has been completed.`,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'Failed to complete work order.',
      });
    }
  };

  const columns: ColumnDef<WorkOrder>[] = [
    {
      id: 'salesOrderNumber',
      header: 'Sales Order Number',
      size: 180,
      cell: ({ row }) => {
        const wo = row.original;
        const rawSo = wo.productionPlan?.salesOrder?.orderNumber || (wo as any).salesOrder?.orderNumber;
        const numPart = wo.workOrderNumber ? wo.workOrderNumber.replace(/\D/g, '').slice(-5) : '00001';
        const soNo = rawSo || `SO-2026-${numPart.padStart(5, '0')}`;
        return <span className="font-bold text-blue-600 hover:underline">{soNo}</span>;
      },
    },
    {
      accessorKey: 'workOrderNumber',
      header: 'WO Number',
      size: 160,
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.getValue('workOrderNumber')}</span>,
    },
    {
      accessorKey: 'productionPlan.planNumber',
      header: 'Production Plan',
      size: 160,
      cell: ({ row }) => <span>{row.original.productionPlan?.planNumber || '—'}</span>,
    },
    {
      accessorKey: 'productionPlan.salesOrder.customer.companyName',
      header: 'Customer',
      size: 160,
      cell: ({ row }) => <span>{row.original.productionPlan?.salesOrder?.customer?.companyName || (row.original as any).customerName || 'N/A'}</span>,
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      size: 100,
    },
    {
      id: 'targetDate',
      header: 'Target Date',
      size: 140,
      cell: ({ row }) => {
        const wo = row.original;
        const rawDate =
          (wo as any).targetDate ||
          (wo as any).expectedDeliveryDate ||
          wo.productionPlan?.salesOrder?.requestedDeliveryDate ||
          (wo.productionPlan?.salesOrder as any)?.expectedDeliveryDate ||
          (wo.productionPlan?.salesOrder as any)?.deliveryDate ||
          (wo as any).requestedDeliveryDate;

        let displayDate = '';
        if (rawDate) {
          try {
            const parsed = new Date(rawDate);
            if (!isNaN(parsed.getTime())) {
              displayDate = parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            }
          } catch { }
        }
        if (!displayDate) {
          const created = wo.createdAt ? new Date(wo.createdAt) : new Date();
          created.setDate(created.getDate() + 7);
          displayDate = created.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        }

        return (
          <span style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>
            {displayDate}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 260,
      cell: ({ row }) => {
        const status = String(row.original.workflowState?.name || row.original.status || '').toUpperCase();

        const viewButton = (
          <button
            type="button"
            className={styles.btnTerminal}
            onClick={() => {
              const wo = row.original;
              const rawSo = wo.productionPlan?.salesOrder?.orderNumber || (wo as any).salesOrder?.orderNumber;
              const numPart = wo.workOrderNumber ? wo.workOrderNumber.replace(/\D/g, '').slice(-5) : '00001';
              const soNo = rawSo || `SO-2026-${numPart.padStart(5, '0')}`;

              const customerObj = wo.productionPlan?.salesOrder?.customer || (wo as any).salesOrder?.customer || (wo as any).customer;
              const customerName = customerObj?.companyName || customerObj?.name || (wo as any).customerName || 'Production Stock';
              const address = customerObj?.address || customerObj?.city || (wo as any).customerAddress || (wo as any).address || 'Andheri, Mumbai (Default Address)';
              const gst = customerObj?.gstin || customerObj?.gst || (wo as any).customerGst || (wo as any).gst || '27ABCDE4321G2Z8';

              const rawDate = wo.createdAt || (wo.productionPlan?.salesOrder as any)?.createdAt;
              const orderDate = rawDate
                ? new Date(rawDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

              let itemsList: Array<{ name: string; code: string; qty: number; rate?: number; gst?: number; total?: number }> = [];

              const soItems = wo.productionPlan?.salesOrder?.items || (wo as any).salesOrder?.items;
              if (Array.isArray(soItems) && soItems.length > 0) {
                itemsList = soItems.map((item: any) => {
                  const name = item.product?.name || item.productNameSnapshot || item.productName || item.name || 'Ordered Product';
                  const code = item.product?.sku || item.product?.publicId || item.product?.code || item.productCodeSnapshot || item.productCode || item.code || '-';
                  const qty = Number(item.quantity ?? wo.quantity ?? 1);
                  const rate = Number(item.unitPrice ?? item.price ?? item.rate ?? 0);
                  const gstVal = item.gst !== undefined ? item.gst : (item.tax !== undefined ? item.tax : 18);
                  const total = Number(item.totalAmount ?? item.total ?? (qty * rate * (1 + gstVal / 100)));
                  return { name, code, qty, rate, gst: gstVal, total };
                });
              }

              if (itemsList.length === 0 && (wo as any).salesOrderItem) {
                const soi = (wo as any).salesOrderItem;
                const name = soi.product?.name || soi.productNameSnapshot || soi.productName || 'Ordered Product';
                const code = soi.product?.sku || soi.product?.publicId || soi.product?.code || soi.productCodeSnapshot || soi.productCode || '-';
                const qty = Number(wo.quantity || soi.quantity || 1);
                const rate = Number(soi.unitPrice || soi.price || soi.rate || 0);
                itemsList.push({ name, code, qty, rate });
              }

              if (itemsList.length === 0) {
                const name = (wo as any).productName || (wo as any).product?.name || (wo.productionPlan?.planNumber ? `Work Order - ${wo.workOrderNumber}` : 'Production Item');
                const code = (wo as any).productCode || (wo as any).product?.sku || (wo as any).product?.publicId || wo.workOrderNumber || '-';
                const qty = Number(wo.quantity || 1);
                itemsList.push({ name, code, qty });
              }

              const mapped = {
                ref: soNo,
                orderNo: soNo,
                customerName,
                address,
                gst,
                orderDate,
                salesStatus: 'Confirmed',
                productionStatus: wo.workflowState?.name || wo.status || 'Pending',
                dispatchStatus: 'Pending',
                items: itemsList,
              };
              setSelectedOrderForModal(mapped);
            }}
          >
            <Eye size={15} />
            Terminal
          </button>
        );

        if (status === 'READY') {
          return (
            <div className={styles.actionButtons}>
              <button
                type="button"
                onClick={() => handleStartWork(row.original)}
                disabled={startingId === row.original.id}
                className={styles.btnStart}
              >
                {startingId === row.original.id ? 'Starting…' : 'Start Work'}
              </button>
              {viewButton}
            </div>
          );
        }

        if (status === 'IN_PROGRESS' || status === 'IN PRODUCTION') {
          return (
            <div className={styles.actionButtons}>
              <button
                type="button"
                onClick={() => handlePauseWork(row.original)}
                className={styles.btnPause}
              >
                Pause
              </button>
              <button
                type="button"
                onClick={() => handleCompleteWork(row.original)}
                className={styles.btnComplete}
              >
                Complete Work
              </button>
              {viewButton}
            </div>
          );
        }

        if (status === 'COMPLETED' || status === 'DONE') {
          return (
            <div className={styles.actionButtons}>
              <span className={styles.completedBadge}>✓ Completed</span>
              {viewButton}
            </div>
          );
        }

        return <div className={styles.actionButtons}>{viewButton}</div>;
      },
    },
  ];

  return (
    <main className={styles.workOrderPage}>
      <div className={styles.workOrderHeader}>
        <div>
          <h1>Work-order register</h1>
          <p>Orders released by Plant Head and assigned to Production.</p>
        </div>

        <div className={styles.searchBox}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search sales order, WO, plan..."
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.tableScrollArea}>
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[280px] text-slate-500 text-sm">Loading work orders...</div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              serverSide={false}
              emptyMessage={search ? 'No work orders match your search.' : 'No work orders have been released yet.'}
            />
          )}
        </div>
      </div>
      {selectedOrderForModal && (
        <OrderDetailsModal
          order={selectedOrderForModal}
          role="production"
          onClose={() => setSelectedOrderForModal(null)}
        />
      )}
    </main>
  );
}

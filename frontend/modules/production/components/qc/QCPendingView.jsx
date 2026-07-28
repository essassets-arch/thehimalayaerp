import React, { useMemo, useState } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useERP } from '../../../../shared/context/ERPContext';
import DataTable from '../../../../shared/components/DataTable';
import { ClipboardCheck } from 'lucide-react';
import QCInspectionModal from './QCInspectionModal';
import {
  getOrderId,
  normalizeItems,
  normalizeStatus,
  resolveBatchNumber,
  resolveProducedQuantity,
} from '../../../../store/domains/shared/workflowUtils';

export default function QCPendingView() {
  const { state } = useERP();
  const globalSearch = useSearchStore((store) => store.globalSearch);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const pendingOrders = useMemo(() => {
    const workOrders = state.production?.workOrders || state.workOrders || [];
    const entries = state.production?.productionEntries || state.productionEntries || [];
    const orders = state.sales?.orders || [];
    return workOrders
      .filter((workOrder) => ['PRODUCTION_COMPLETED', 'QC_PENDING', 'REINSPECTION_PENDING']
        .includes(normalizeStatus(workOrder.status || workOrder.workflowStatus)))
      .map((workOrder) => {
        const orderId = getOrderId(workOrder);
        const order = orders.find((candidate) => String(candidate.id || candidate.orderNo) === orderId) || {};
        const entry = entries.find((candidate) =>
          getOrderId(candidate) === orderId ||
          String(candidate.workOrderId || candidate.workOrderNo) === String(workOrder.id)
        ) || {};
        const items = normalizeItems(order).length ? normalizeItems(order) : normalizeItems(workOrder);
        const orderedQuantity = items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
        return {
          ...workOrder,
          workOrderId: workOrder.id,
          workOrderNo: workOrder.workOrderNo || workOrder.id,
          orderId,
          orderNo: order.orderNo || order.id || orderId,
          customerName: order.customerName ?? order.customer_name ?? workOrder.customerName ?? 'Unknown Customer',
          products: items.map((item) => item.productName || item.product_name || item.name).filter(Boolean).join(', ') || 'Unknown Product',
          items,
          totalQty: resolveProducedQuantity(workOrder, entry, order),
          batchNumberFinal: resolveBatchNumber(workOrder, entry, order),
          orderedQuantity,
          plannedQuantity: Number(workOrder.plannedQty ?? workOrder.quantity ?? orderedQuantity),
          productionCompletedAt: workOrder.completedAt ?? entry.completedAt,
          productionOperator: entry.operator ?? entry.operatorName ?? workOrder.operator,
          productionShift: entry.shift ?? workOrder.shift,
          productionRemarks: entry.remarks ?? workOrder.remarks,
        };
      });
  }, [state]);

  const columns = [
    { header: 'Order No', accessor: 'orderNo', render: (row) => <strong>{row.orderNo}</strong> },
    { header: 'Work Order', accessor: 'workOrderNo' },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Product', accessor: 'products' },
    { header: 'Produced Qty', accessor: 'totalQty', render: (row) => `${Number(row.totalQty ?? 0).toLocaleString()} units` },
    { header: 'Batch No', accessor: 'batchNumberFinal' },
    { header: 'Status', accessor: 'status', render: (row) => <strong style={{ color: '#b45309' }}>{normalizeStatus(row.status).replaceAll('_', ' ')}</strong> },
    {
      header: 'Action', accessor: 'id', render: (row) => (
        <button className="btn-small btn-primary-small" onClick={() => setSelectedOrder(row)}>
          <ClipboardCheck size={13} /> Inspect
        </button>
      ),
    },
  ];

  return (
    <div className="app-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 className="card-heading" style={{ margin: 0 }}>QC Inspection Queue</h2>
        <span style={{ padding: '5px 11px', borderRadius: 20, background: '#fffbeb', color: '#b45309', fontWeight: 800 }}>{pendingOrders.length} Pending</span>
      </div>
      <DataTable columns={columns} data={pendingOrders} searchQuery={globalSearch} emptyMessage="No production batches pending QC inspection." />
      {selectedOrder && <QCInspectionModal selectedOrder={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}

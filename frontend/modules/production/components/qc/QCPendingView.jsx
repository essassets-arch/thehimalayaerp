import React, { useMemo, useState, useEffect } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useERP } from '../../../../shared/context/ERPContext';
import DataTable from '../../../../shared/components/DataTable';
import PaginationControl from '../../../../shared/components/PaginationControl';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [globalSearch]);

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

  const filteredOrders = useMemo(() => {
    if (!globalSearch.trim()) return pendingOrders;
    const q = globalSearch.toLowerCase();
    return pendingOrders.filter((row) =>
      String(row.orderNo || '').toLowerCase().includes(q) ||
      String(row.workOrderNo || '').toLowerCase().includes(q) ||
      String(row.customerName || '').toLowerCase().includes(q) ||
      String(row.products || '').toLowerCase().includes(q) ||
      String(row.batchNumberFinal || '').toLowerCase().includes(q)
    );
  }, [pendingOrders, globalSearch]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

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
    <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 className="card-heading" style={{ margin: 0 }}>QC Inspection Queue</h2>
          <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
            Inspect finished goods batches and certify quality assurance for dispatch.
          </p>
        </div>
        <span style={{ padding: '5px 12px', borderRadius: 20, background: '#fffbeb', color: '#b45309', fontWeight: 800, fontSize: '12.5px', border: '1px solid #fef3c7' }}>
          {filteredOrders.length} Pending
        </span>
      </div>

      <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch', borderRadius: '8px' }}>
        <DataTable columns={columns} data={paginatedOrders} searchQuery="" emptyMessage="No production batches pending QC inspection." />
      </div>

      <PaginationControl
        currentPage={currentPage}
        totalPages={Math.ceil(filteredOrders.length / pageSize) || 1}
        totalItems={filteredOrders.length}
        pageSize={pageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
      />

      {selectedOrder && <QCInspectionModal selectedOrder={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import { useERPStore } from '@/store/erpStore';
import { Package, Truck, Archive, AlertCircle, RefreshCw } from 'lucide-react';

export default function FinishedGoodsView() {
  const navigate = useRouter();
  const rawFinishedGoods = useERPStore(s => s.production?.finishedGoods || s.state?.production?.finishedGoods) || [];
  const salesOrders = useERPStore(s => s.sales?.orders || s.state?.sales?.orders) || [];

  // Normalize Finished Goods list
  const finishedGoodsList = useMemo(() => {
    if (Array.isArray(rawFinishedGoods) && rawFinishedGoods.length > 0) {
      return rawFinishedGoods;
    }
    // Fallback normalization from Sales Orders if finishedGoods array empty
    return salesOrders.filter(o => o.qcStatus === 'APPROVED' || o.qcStatus === 'QC_APPROVED' || (o.qcApprovedQuantity && o.qcApprovedQuantity > 0)).map((order, idx) => ({
      id: order.id || `FG-${String(idx + 1).padStart(3, '0')}`,
      batchId: order.batchId || order.batchNo || 'BATCH-2026-003',
      orderId: order.orderNo || order.id,
      customerName: order.customerName || order.customer?.name || 'Customer',
      items: [
        {
          orderLineId: `LINE-${order.id}`,
          productId: order.items?.[0]?.productId || 'PROD-001',
          productName: order.products || order.productName || 'RCC Hume Pipe 600mm',
          producedQuantity: Number(order.producedQuantity || order.quantity || 150),
          qcApprovedQuantity: Number(order.qcApprovedQuantity || order.quantity || 150),
          qcRejectedQuantity: Number(order.qcRejectedQuantity || 0),
          reservedQuantity: Number(order.reservedQuantity || 0),
          dispatchedQuantity: Number(order.dispatchedQuantity || 0),
          unit: 'Pcs'
        }
      ],
      status: order.dispatchStatus === 'SENT_TO_DISPATCH' ? 'SENT_TO_DISPATCH' : 'READY_FOR_DISPATCH',
      createdAt: order.createdAt || new Date().toISOString(),
      updatedAt: order.updatedAt || new Date().toISOString()
    }));
  }, [rawFinishedGoods, salesOrders]);

  // Derived Summary Cards Metrics
  const totalFinished = finishedGoodsList.reduce(
    (sum, record) =>
      sum +
      (record.items || []).reduce(
        (itemSum, item) => itemSum + Number(item.producedQuantity || 0),
        0
      ),
    0
  );

  const readyForDispatch = finishedGoodsList.reduce(
    (sum, record) =>
      sum +
      (record.items || []).reduce(
        (itemSum, item) =>
          itemSum +
          Math.max(
            0,
            Number(item.qcApprovedQuantity || 0) -
            Number(item.reservedQuantity || 0) -
            Number(item.dispatchedQuantity || 0)
          ),
        0
      ),
    0
  );

  const reservedForOrders = finishedGoodsList.reduce(
    (sum, record) =>
      sum +
      (record.items || []).reduce(
        (itemSum, item) => itemSum + Number(item.reservedQuantity || 0),
        0
      ),
    0
  );

  const dispatchedQty = finishedGoodsList.reduce(
    (sum, record) =>
      sum +
      (record.items || []).reduce(
        (itemSum, item) => itemSum + Number(item.dispatchedQuantity || 0),
        0
      ),
    0
  );

  const rejectedQty = finishedGoodsList.reduce(
    (sum, record) =>
      sum +
      (record.items || []).reduce(
        (itemSum, item) => itemSum + Number(item.qcRejectedQuantity || 0),
        0
      ),
    0
  );

  const getRecordAvailableQty = (record) => {
    return (record.items || []).reduce(
      (sum, item) =>
        sum +
        Math.max(
          0,
          Number(item.qcApprovedQuantity || 0) -
          Number(item.reservedQuantity || 0) -
          Number(item.dispatchedQuantity || 0)
        ),
      0
    );
  };

  const handleSendToDispatch = async (record) => {
    const availableQuantity = getRecordAvailableQty(record);
    if (availableQuantity <= 0 || record.status === 'SENT_TO_DISPATCH') return;

    const result = await Swal.fire({
      title: 'Send to Dispatch?',
      text: `Send Batch ${record.batchId || record.id} (Order ${record.orderId}) to the Dispatch queue?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Send to Dispatch',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    });
    if (!result.isConfirmed) return;

    try {
      useERPStore.getState().sendFinishedGoodsToDispatch(record.id);
      await Swal.fire({
        icon: 'success',
        title: 'Sent to Dispatch',
        text: `Finished goods batch ${record.batchId} sent to Dispatch queue successfully.`,
        timer: 1500,
        showConfirmButton: false
      });
      navigate.push('/dispatch/orders');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Dispatch Failed', text: err.message });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total Finished', value: totalFinished, icon: Package, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Ready for Dispatch', value: readyForDispatch, icon: Truck, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Reserved for Orders', value: reservedForOrders, icon: Archive, color: '#6366f1', bg: '#e0e7ff' },
          { label: 'Dispatched Qty', value: dispatchedQty, icon: Truck, color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'Rejected Qty', value: rejectedQty, icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' }
        ].map((stat, i) => (
          <div key={i} className="app-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>{stat.label}</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{stat.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Finished Goods Inventory Table */}
      <div className="app-card">
        <div className="card-top-bar">
          <h2 className="card-heading">Finished Goods Inventory Queue</h2>
        </div>
        <DataTable
          columns={[
            { header: 'Finished Goods ID', accessor: 'id', render: (row) => <strong>{row.finishedGoodsId || row.id}</strong> },
            { header: 'Batch ID', accessor: 'batchId', render: (row) => <strong>{row.batchId || row.id}</strong> },
            { header: 'Order ID', accessor: 'orderId', render: (row) => <strong>{row.orderId || row.orderNo}</strong> },
            { header: 'Work Order', accessor: 'workOrderId', render: (row) => row.workOrderNo || row.workOrderId || '—' },
            { header: 'Customer', accessor: 'customerName', render: (row) => row.customerName },
            { header: 'Product Item', accessor: 'items', render: (row) => (row.items || []).map(i => i.productName).join(', ') || 'RCC Hume Pipe' },
            { header: 'Produced', accessor: 'items', render: (row) => <strong>{(row.items || []).reduce((s, i) => s + (i.producedQuantity || 0), 0)}</strong> },
            { header: 'QC Approved', accessor: 'items', render: (row) => <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{(row.items || []).reduce((s, i) => s + (i.qcApprovedQuantity || 0), 0)}</span> },
            { header: 'QC Rejected', accessor: 'items', render: (row) => <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{(row.items || []).reduce((s, i) => s + (i.qcRejectedQuantity || 0), 0)}</span> },
            { header: 'Available', accessor: 'id', render: (row) => <strong style={{ fontSize: '15px' }}>{getRecordAvailableQty(row)}</strong> },
            { header: 'Reserved', accessor: 'id', render: (row) => (row.items || []).reduce((s, i) => s + Number(i.reservedQuantity ?? 0), Number(row.reservedQty ?? 0)) },
            { header: 'Dispatched', accessor: 'id', render: (row) => (row.items || []).reduce((s, i) => s + Number(i.dispatchedQuantity ?? 0), Number(row.dispatchedQty ?? 0)) },
            { header: 'QC Approval Date', accessor: 'qcApprovedAt', render: (row) => row.qcApprovedAt ? new Date(row.qcApprovedAt).toLocaleDateString('en-IN') : '—' },
            { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
            { header: 'Actions', accessor: 'id', render: (row) => {
              const availableQuantity = getRecordAvailableQty(row);
              const canSendToDispatch = availableQuantity > 0 && row.status !== 'SENT_TO_DISPATCH';
              return canSendToDispatch ? (
                <button
                  type="button"
                  onClick={() => handleSendToDispatch(row)}
                  style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '7px', padding: '7px 12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Send to Dispatch
                </button>
              ) : (
                <span style={{ fontSize: '12px', color: '#5E6B82', fontWeight: 'bold' }}>
                  {row.status === 'SENT_TO_DISPATCH' ? 'Sent to Dispatch' : 'No Available Stock'}
                </span>
              );
            } }
          ]}
          data={finishedGoodsList}
          searchQuery=""
          searchField="orderId"
          emptyMessage="No finished goods records found."
        />
      </div>
    </div>
  );
}

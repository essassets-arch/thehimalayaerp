import React from 'react';
import DataTable from '../../shared/components/DataTable';
import StatusBadge from '../../shared/components/StatusBadge';
import Swal from 'sweetalert2';
import { useERPStore } from '@/store/erpStore';

export default function FinishedGoodsTable({ records = [], readOnly = false, showActions = false, onActionComplete }) {
  const getRecordAvailableQty = (record) => {
    // API format (WorkOrder)
    if (record.workOrderNumber) {
      return record.quantity || 0;
    }
    // Mock format
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
    if (readOnly || !showActions) return;
    
    const availableQuantity = getRecordAvailableQty(record);
    if (availableQuantity <= 0 || record.status === 'SENT_TO_DISPATCH') return;

    const result = await Swal.fire({
      title: 'Send to Dispatch?',
      text: `Send Batch ${record.batchId || record.id} (Order ${record.orderId || record.workOrderNumber}) to the Dispatch queue?`,
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
      // If we're using mock data store
      useERPStore.getState().sendFinishedGoodsToDispatch?.(record.id);
      await Swal.fire({
        icon: 'success',
        title: 'Sent to Dispatch',
        text: `Finished goods batch sent to Dispatch queue successfully.`,
        timer: 1500,
        showConfirmButton: false
      });
      if (onActionComplete) onActionComplete();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Dispatch Failed', text: err.message });
    }
  };

  const columns = [
    { header: 'Finished Goods No.', accessor: 'id', render: (row) => <strong>{row.finishedGoodsId || row.id || row.workOrderNumber}</strong> },
    { header: 'Batch ID', accessor: 'batchId', render: (row) => <strong>{row.batchId || row.id}</strong> },
    { header: 'Work Order', accessor: 'workOrderId', render: (row) => row.workOrderNumber || row.workOrderNo || row.workOrderId || '—' },
    { header: 'Customer', accessor: 'customerName', render: (row) => row.customerName || 'N/A' },
    { header: 'Product Item', accessor: 'items', render: (row) => {
        if (row.salesOrderItem?.product?.name) return row.salesOrderItem.product.name;
        return (row.items || []).map(i => i.productName).join(', ') || 'Unknown Product';
    } },
    { header: 'Produced Qty', accessor: 'items', render: (row) => {
        if (row.workOrderNumber) return <strong>{row.quantity || 0}</strong>;
        return <strong>{(row.items || []).reduce((s, i) => s + (i.producedQuantity || 0), 0)}</strong>;
    } },
    { header: 'Available', accessor: 'id', render: (row) => <strong style={{ fontSize: '15px' }}>{getRecordAvailableQty(row)}</strong> },
    { header: 'QC Approval Date', accessor: 'qcApprovedAt', render: (row) => (row.qcApprovedAt || row.updatedAt) ? new Date(row.qcApprovedAt || row.updatedAt).toLocaleDateString('en-IN') : '—' },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  if (!readOnly && showActions) {
    columns.push({
      header: 'Actions', accessor: 'id', render: (row) => {
        const availableQuantity = getRecordAvailableQty(row);
        const canSendToDispatch = availableQuantity > 0 && row.status !== 'SENT_TO_DISPATCH' && row.status !== 'DISPATCHED';
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
            {row.status === 'SENT_TO_DISPATCH' || row.status === 'DISPATCHED' ? 'Sent to Dispatch' : 'No Available Stock'}
          </span>
        );
      }
    });
  }

  return (
    <DataTable
      columns={columns}
      data={records}
      searchQuery=""
      searchField="orderId"
      emptyMessage="No finished goods records found."
    />
  );
}

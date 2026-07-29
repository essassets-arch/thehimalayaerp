'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Eye, Search, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { backendFetch } from '../../../lib/backendFetch';
import styles from './ReturnsView.module.css';

const PENDING_RETURN_STATUSES = ['REQUESTED', 'UNDER_REVIEW', 'RETURN_REQUESTED'];

export default function ReturnsView() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [viewRequest, setViewRequest] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      setRequests(await backendFetch('/api/backend/sales-returns'));
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Unable to load returns', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const allRows = useMemo(() => requests.map((request) => ({
    ...request,
    orderId: request.salesOrderId,
    customerName: request.salesOrder?.customer?.companyName || request.salesOrder?.customer?.name || 'Unknown customer',
  })), [requests]);

  const pendingCount = allRows.filter((request) => PENDING_RETURN_STATUSES.includes(request.status)).length;
  const historyCount = allRows.length - pendingCount;

  const rows = useMemo(() => allRows.filter((request) => {
    const isPending = PENDING_RETURN_STATUSES.includes(request.status);
    if (activeTab === 'pending' ? !isPending : isPending) return false;
    const query = search.trim().toLowerCase();
    return !query || [request.id, request.orderId, request.customerName]
      .some((value) => String(value || '').toLowerCase().includes(query));
  }), [allRows, activeTab, search]);

  const approve = async (request) => {
    const requested = request.items.reduce((sum, item) => sum + Number(item.requestedQuantity || 0), 0);
    const result = await Swal.fire({
      title: `Approve ${request.id}`,
      html: `
        <label style="display:block;text-align:left;margin-bottom:4px">Approved return quantity</label>
        <input id="return-approved-qty" type="number" min="1" max="${requested}" value="${requested}" class="swal2-input">
        <label style="display:block;text-align:left;margin:8px 0 4px">Approval remarks</label>
        <textarea id="return-remarks" class="swal2-textarea"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Approve',
      preConfirm: () => {
        const approvedQuantity = Number(document.getElementById('return-approved-qty')?.value);
        if (approvedQuantity <= 0 || approvedQuantity > requested) {
          Swal.showValidationMessage(`Quantity must be between 1 and ${requested}.`);
          return false;
        }
        return {
          approvedItems: request.items.map((item) => ({
            orderLineId: item.orderLineId,
            approvedQuantity: request.items.length === 1
              ? approvedQuantity
              : Math.min(item.requestedQuantity, approvedQuantity),
          })),
          remarks: document.getElementById('return-remarks')?.value || '',
        };
      },
    });
    if (result.isConfirmed) {
      await backendFetch(`/api/backend/sales-returns/${request.id}/approve`, {
        method: 'PATCH',
        body: {
          remarks: result.value.remarks,
          items: request.items.map((item) => ({
            id: item.id,
            approvedQuantity: request.items.length === 1
              ? result.value.approvedItems[0].approvedQuantity
              : item.requestedQuantity,
          })),
        },
      });
      await loadRequests();
    }
  };

  const reject = async (request) => {
    const result = await Swal.fire({
      title: `Reject ${request.id}`,
      input: 'textarea',
      inputLabel: 'Rejection reason',
      showCancelButton: true,
      inputValidator: (value) => value?.trim() ? undefined : 'A reason is required.',
    });
    if (result.isConfirmed) {
      await backendFetch(`/api/backend/sales-returns/${request.id}/reject`, {
        method: 'PATCH',
        body: { reason: result.value },
      });
      await loadRequests();
    }
  };

  return (
    <div className="app-card" style={{ flex: 1 }}>
      <div className="module-header-row">
        <div>
          <h2 className="module-title">Return Requests</h2>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Approve take-back quantities without changing payment or closure.</p>
        </div>
        <div className="search-box">
          <Search size={14} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search request, order, customer…" />
        </div>
      </div>
      <div className={styles.tabs} role="tablist" aria-label="Return request filters">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'pending'}
          className={`${styles.tabButton} ${activeTab === 'pending' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests <span>{pendingCount}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'history'}
          className={`${styles.tabButton} ${activeTab === 'history' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History <span>{historyCount}</span>
        </button>
      </div>
      <div className="crm-table-container">
        <table className="crm-table responsive-table flat-table">
          <thead><tr><th>Return ID</th><th>Order ID</th><th>Customer</th><th>Products / Qty</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 30 }}>Loading return requests…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 30 }}>No return requests found.</td></tr>
            ) : rows.map((request) => (
              <tr key={request.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 800 }}>{request.returnNumber}</td>
                <td style={{ fontFamily: 'monospace' }}>{request.orderId}</td>
                <td>{request.customerName}</td>
                <td>{request.items.map((item) => `${item.product?.name || item.productId || 'Item'} (${item.requestedQuantity})`).join(', ')}</td>
                <td>{request.items.map((item) => item.reason).filter(Boolean).join(', ') || request.remarks || '—'}</td>
                <td>{request.status.replaceAll('_', ' ')}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={`${styles.actionButton} ${styles.viewButton}`} onClick={() => setViewRequest(request)}><Eye size={14} /> View</button>
                    {PENDING_RETURN_STATUSES.includes(request.status) && (
                      <>
                      <button className={`${styles.actionButton} ${styles.approveButton}`} onClick={() => approve(request)}><CheckCircle size={14} /> Approve</button>
                      <button className={`${styles.actionButton} ${styles.rejectButton}`} onClick={() => reject(request)}><XCircle size={14} /> Reject</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {viewRequest && (
        <div className={styles.modalOverlay} onClick={() => setViewRequest(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="return-details-title" className={styles.modalPanel} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 id="return-details-title" className={styles.modalTitle}>Return Request Details</h2>
                <p className={styles.modalId}>{viewRequest.id}</p>
              </div>
              <button type="button" className={styles.closeIcon} aria-label="Close return details" onClick={() => setViewRequest(null)}>×</button>
            </div>
            <div className={styles.detailsGrid}>
              <ReturnDetail label="Original Order" value={viewRequest.orderId} />
              <ReturnDetail label="Customer" value={viewRequest.customerName} />
              <ReturnDetail label="Status" value={viewRequest.status?.replaceAll('_', ' ')} />
              <ReturnDetail label="Contact Person" value={viewRequest.contactPerson} />
              <ReturnDetail label="Pickup Address" value={viewRequest.pickupAddress} />
              <ReturnDetail label="Preferred Pickup Date" value={viewRequest.preferredPickupDate} />
              <ReturnDetail label="Refund Expected" value={viewRequest.refundExpected ? 'Yes' : 'No'} />
              <ReturnDetail label="Replacement Expected" value={viewRequest.replacementExpected ? 'Yes' : 'No'} />
              <ReturnDetail label="Description" value={viewRequest.customerRemarks} wide />
              <ReturnDetail label="Sales Remarks" value={viewRequest.internalRemarks} wide />
            </div>
            <ReturnItems items={viewRequest.items} />
            <ReturnEvidence files={viewRequest.items.flatMap((item) => item.evidence?.files || [])} />
            <div className={styles.modalFooter}>
              <button className={styles.closeButton} onClick={() => setViewRequest(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReturnDetail({ label, value, wide = false }) {
  return (
    <div style={{ gridColumn: wide ? '1 / -1' : undefined }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#5E6B82', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{value || '—'}</div>
    </div>
  );
}

function ReturnItems({ items = [] }) {
  return (
    <div style={{ padding: '0 20px 20px' }}>
      <h3>Return Products</h3>
      {items.map((item, index) => (
        <div key={item.id || item.salesOrderItemId || `${item.productId}-${index}`} style={{ padding: 12, marginTop: 8, border: '1px solid #DCE5F0', borderRadius: 10 }}>
          <strong>{item.product?.name || item.productName || item.productId || 'Item'}</strong>
          <div>Order line: {item.salesOrderItemId || item.orderLineId || '—'}</div>
          <div>Requested quantity: {item.requestedQuantity}</div>
          <div>Condition: {item.condition || '—'}</div>
          <div>Reason: {item.reason || '—'}</div>
        </div>
      ))}
    </div>
  );
}

function ReturnEvidence({ files = [] }) {
  const unique = files.filter((file, index, all) => all.findIndex((candidate) => (candidate.id || candidate.url) === (file.id || file.url)) === index);
  return (
    <div style={{ padding: '0 20px 20px' }}>
      <h3>Uploaded Evidence</h3>
      {unique.length === 0 ? <p style={{ color: '#5E6B82' }}>No images or documents uploaded.</p> : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {unique.map((file) => (
            <a key={file.id || file.url} href={file.url || file.localDataUrl} target="_blank" rel="noreferrer" style={{ width: 130 }}>
              {(file.mime || file.mimeType)?.startsWith('image/') && (file.url || file.localDataUrl) ? (
                <img src={file.url || file.localDataUrl} alt={file.name} style={{ width: 130, height: 92, objectFit: 'cover', borderRadius: 8, border: '1px solid #D6E2F0' }} />
              ) : <div style={{ padding: 18, border: '1px solid #D6E2F0', borderRadius: 8 }}>Document</div>}
              <div style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

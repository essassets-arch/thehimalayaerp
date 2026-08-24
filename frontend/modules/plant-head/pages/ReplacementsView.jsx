'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Eye, RefreshCw, Search, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { backendFetch } from '../../../lib/backendFetch';
import styles from './ReplacementsView.module.css';

const activeStatuses = ['REPLACEMENT_REQUESTED', 'REPLACEMENT_APPROVED'];
const PENDING_REPLACEMENT_STATUSES = ['REQUESTED', 'UNDER_REVIEW', 'REPLACEMENT_REQUESTED'];

export default function ReplacementsView() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [viewRequest, setViewRequest] = useState(null);

  const loadRequests = async ({ silent = false } = {}) => {
    setLoading(true);
    try {
      setRequests(await backendFetch('/api/backend/replacements'));
    } catch (error) {
      if (!silent) {
        Swal.fire({ icon: 'error', title: 'Unable to load replacements', text: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    const refresh = () => {
      if (document.visibilityState === 'visible') loadRequests({ silent: true });
    };
    window.addEventListener('focus', refresh);
    const interval = window.setInterval(refresh, 10000);
    return () => {
      window.removeEventListener('focus', refresh);
      window.clearInterval(interval);
    };
  }, []);

  const allRows = useMemo(() => requests.map((request) => ({
    ...request,
    orderId: request.salesOrderId,
    customerName: request.salesOrder?.customer?.companyName || request.salesOrder?.customer?.name || 'Unknown customer',
  })), [requests]);

  const pendingCount = allRows.filter((request) => PENDING_REPLACEMENT_STATUSES.includes(request.status)).length;
  const historyCount = allRows.length - pendingCount;

  const rows = useMemo(() => allRows.filter((request) => {
    const isPending = PENDING_REPLACEMENT_STATUSES.includes(request.status);
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
        <label style="display:block;text-align:left;margin-bottom:4px">Approved quantity</label>
        <input id="replacement-approved-qty" type="number" min="1" max="${requested}" value="${requested}" class="swal2-input">
        <label style="display:block;text-align:left;margin:8px 0 4px">Approval remarks</label>
        <textarea id="replacement-remarks" class="swal2-textarea"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Approve',
      preConfirm: () => {
        const approvedQuantity = Number(document.getElementById('replacement-approved-qty')?.value);
        if (approvedQuantity <= 0 || approvedQuantity > requested) {
          Swal.showValidationMessage(`Quantity must be between 1 and ${requested}.`);
          return false;
        }
        return {
          approvedQuantity,
          approvedItems: request.items.map((item) => ({
            orderLineId: item.orderLineId,
            approvedQuantity: request.items.length === 1
              ? approvedQuantity
              : Math.min(item.requestedQuantity, approvedQuantity),
          })),
          remarks: document.getElementById('replacement-remarks')?.value || '',
        };
      },
    });
    if (result.isConfirmed) {
      await backendFetch(`/api/backend/replacements/${request.id}/approve`, {
        method: 'PATCH',
        body: { remarks: result.value.remarks },
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
      await backendFetch(`/api/backend/replacements/${request.id}/reject`, {
        method: 'PATCH',
        body: { reason: result.value },
      });
      await loadRequests();
    }
  };

  return (
    <div className={`app-card ${styles.card}`}>
      <div className={`module-header-row ${styles.header}`}>
        <div>
          <h2 className="module-title">Replacement Requests</h2>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Canonical Sales requests linked to the original order.</p>
        </div>
        <button className={`btn-small btn-outline-small ${styles.refreshButton}`} onClick={loadRequests} disabled={loading}>
          <RefreshCw size={13} /> Refresh
        </button>
        <div className={`search-box ${styles.search}`}>
          <Search size={14} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search request, order, customer…" />
        </div>
      </div>
      <div className={styles.tabs} role="tablist" aria-label="Replacement request filters">
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
      <div className={`crm-table-container scroll-mode erp-table-responsive ${styles.tableContainer}`}>
        <table className={`crm-table flat-table ${styles.table}`} style={{ minWidth: '780px' }}>
          <thead><tr><th>Request ID</th><th>Order ID</th><th>Customer</th><th>Products / Qty</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 30 }}>Loading replacement requests…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 30 }}>No replacement requests found.</td></tr>
            ) : rows.map((request) => (
              <tr key={request.id}>
                <td data-label="Request ID" className={styles.requestId}>{request.requestNumber}</td>
                <td data-label="Order ID" className={styles.orderId}>{request.salesOrder?.orderNumber || request.orderId}</td>
                <td data-label="Customer">{request.customerName}</td>
                <td data-label="Products / Qty">{request.items.map((item) => `${item.product?.name || item.productId || 'Item'} (${item.requestedQuantity})`).join(', ')}</td>
                <td>{request.items.map((item) => item.reason).filter(Boolean).join(', ') || request.remarks || '—'}</td>
                <td data-label="Status"><span className={styles.status}>{request.status.replaceAll('_', ' ')}</span></td>
                <td data-label="Actions">
                  <div className={styles.actions}>
                    <button className={`${styles.actionButton} ${styles.viewButton}`} onClick={() => setViewRequest(request)}><Eye size={14} /> View</button>
                    {PENDING_REPLACEMENT_STATUSES.includes(request.status) && (
                      <>
                      <button className={`${styles.actionButton} ${styles.approveButton}`} onClick={() => approve(request)}><CheckCircle size={14} /> Approve</button>
                      <button className={`${styles.actionButton} ${styles.rejectButton}`} onClick={() => reject(request)}><XCircle size={14} /> Reject</button>
                      </>
                    )}
                    {request.status !== 'REPLACEMENT_REQUESTED' && activeStatuses.includes(request.status) && <span>Approved</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {viewRequest && (
        <div className={`erp-modal-overlay ${styles.modalOverlay}`} onClick={() => setViewRequest(null)}>
          <div role="dialog" aria-modal="true" aria-label="Replacement Request Details" className={`erp-modal-box ${styles.modal}`} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Replacement Request Details</h2>
                <p>{viewRequest.requestNumber || viewRequest.id}</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setViewRequest(null)}>×</button>
            </div>
            <div className={styles.detailGrid}>
              <Detail label="Original Order" value={viewRequest.salesOrder?.orderNumber || viewRequest.orderId} />
              <Detail label="Customer" value={viewRequest.customerName} />
              <Detail label="Status" value={viewRequest.status?.replaceAll('_', ' ')} />
              <Detail label="Pickup Required" value={viewRequest.pickupRequired ? 'Yes' : 'No'} />
              <Detail label="Replacement Address" value={viewRequest.replacementDeliveryAddress || viewRequest.replacementAddress} />
              <Detail label="Preferred Date" value={viewRequest.preferredReplacementDate || viewRequest.preferredDate} />
              <Detail label="Description" value={viewRequest.customerRemarks} wide />
              <Detail label="Sales Remarks" value={viewRequest.internalRemarks} wide />
            </div>
            <RequestItems items={viewRequest.items} />
            <Evidence files={viewRequest.evidence?.files || []} />
            <div className={styles.modalFooter}>
              <button className="btn-small btn-outline-small" onClick={() => setViewRequest(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, wide = false }) {
  return (
    <div style={{ gridColumn: wide ? '1 / -1' : undefined }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#5E6B82', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{value || '—'}</div>
    </div>
  );
}

function RequestItems({ items = [] }) {
  return (
    <div className={styles.modalSection}>
      <h3>Requested Products</h3>
      {items.map((item, index) => (
        <div key={item.id || item.salesOrderItemId || `${item.productId}-${index}`} className={styles.itemCard}>
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

function Evidence({ files = [] }) {
  const unique = files.filter((file, index, all) => all.findIndex((candidate) => (candidate.id || candidate.url) === (file.id || file.url)) === index);
  return (
    <div className={styles.modalSection}>
      <h3>Uploaded Evidence</h3>
      {unique.length === 0 ? <p style={{ color: '#5E6B82' }}>No images or documents uploaded.</p> : (
        <div className={styles.evidenceGrid}>
          {unique.map((file) => (
            <a key={file.id || file.url} href={file.url || file.localDataUrl} target="_blank" rel="noreferrer" className={styles.evidenceCard}>
              {(file.mime || file.mimeType)?.startsWith('image/') && (file.url || file.localDataUrl) ? (
                <img src={file.url || file.localDataUrl} alt={file.name} />
              ) : <div style={{ padding: 18, border: '1px solid #D6E2F0', borderRadius: 8 }}>Document</div>}
              <div className={styles.evidenceName}>{file.name}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

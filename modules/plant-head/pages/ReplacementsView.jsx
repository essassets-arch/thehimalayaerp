'use client';

import { useMemo, useState } from 'react';
import { CheckCircle, Eye, Search, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { useERPStore } from '../../../store/erpStore';

const activeStatuses = ['REPLACEMENT_REQUESTED', 'REPLACEMENT_APPROVED'];

export default function ReplacementsView() {
  const sales = useERPStore((store) => store.state?.sales);
  const requests = sales?.replacementRequests || [];
  const orders = sales?.orders || [];
  const approveReplacement = useERPStore((store) => store.salesActions?.approveReplacement);
  const rejectReplacement = useERPStore((store) => store.salesActions?.rejectReplacement);
  const [search, setSearch] = useState('');
  const [viewRequest, setViewRequest] = useState(null);

  const rows = useMemo(() => requests.map((request) => {
    const order = orders.find((candidate) => candidate.id === request.orderId);
    return { ...request, order, customerName: order?.customerName || 'Unknown customer' };
  }).filter((request) => {
    const query = search.trim().toLowerCase();
    return !query || [request.id, request.orderId, request.customerName]
      .some((value) => String(value || '').toLowerCase().includes(query));
  }), [orders, requests, search]);

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
    if (result.isConfirmed) approveReplacement(request.id, result.value, 'Plant Head');
  };

  const reject = async (request) => {
    const result = await Swal.fire({
      title: `Reject ${request.id}`,
      input: 'textarea',
      inputLabel: 'Rejection reason',
      showCancelButton: true,
      inputValidator: (value) => value?.trim() ? undefined : 'A reason is required.',
    });
    if (result.isConfirmed) rejectReplacement(request.id, result.value, 'Plant Head');
  };

  return (
    <div className="app-card" style={{ flex: 1 }}>
      <div className="module-header-row">
        <div>
          <h2 className="module-title">Replacement Requests</h2>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Canonical Sales requests linked to the original order.</p>
        </div>
        <div className="search-box">
          <Search size={14} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search request, order, customer…" />
        </div>
      </div>
      <div className="crm-table-container">
        <table className="crm-table responsive-table flat-table">
          <thead><tr><th>Request ID</th><th>Order ID</th><th>Customer</th><th>Products / Qty</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 30 }}>No replacement requests found.</td></tr>
            ) : rows.map((request) => (
              <tr key={request.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 800 }}>{request.id}</td>
                <td style={{ fontFamily: 'monospace' }}>{request.orderId}</td>
                <td>{request.customerName}</td>
                <td>{request.items.map((item) => `${item.productName || item.productId || 'Item'} (${item.requestedQuantity})`).join(', ')}</td>
                <td>{request.items.map((item) => item.reason).filter(Boolean).join(', ') || request.remarks || '—'}</td>
                <td>{request.status.replaceAll('_', ' ')}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="btn-small btn-outline-small" onClick={() => setViewRequest(request)}><Eye size={12} /> View</button>
                    {request.status === 'REPLACEMENT_REQUESTED' && (
                      <>
                      <button className="btn-small btn-outline-small" onClick={() => approve(request)}><CheckCircle size={12} /> Approve</button>
                      <button className="btn-small btn-outline-small" onClick={() => reject(request)}><XCircle size={12} /> Reject</button>
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
        <div className="modal-overlay active" style={{ zIndex: 10000 }} onClick={() => setViewRequest(null)}>
          <div role="dialog" aria-modal="true" aria-label="Replacement Request Details" className="modal-content" style={{ maxWidth: 760, width: '94%', maxHeight: '90vh', overflowY: 'auto' }} onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ margin: 0 }}>Replacement Request Details</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)' }}>{viewRequest.id}</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setViewRequest(null)}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, padding: 20 }}>
              <Detail label="Original Order" value={viewRequest.orderId} />
              <Detail label="Customer" value={viewRequest.customerName} />
              <Detail label="Status" value={viewRequest.status?.replaceAll('_', ' ')} />
              <Detail label="Pickup Required" value={viewRequest.pickupRequired ? 'Yes' : 'No'} />
              <Detail label="Replacement Address" value={viewRequest.replacementDeliveryAddress || viewRequest.replacementAddress} />
              <Detail label="Preferred Date" value={viewRequest.preferredReplacementDate || viewRequest.preferredDate} />
              <Detail label="Sales Remarks" value={viewRequest.remarks} wide />
            </div>
            <RequestItems items={viewRequest.items} />
            <Evidence files={[...(viewRequest.photos || []), ...(viewRequest.documents || [])]} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 20 }}>
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
    <div style={{ padding: '0 20px 20px' }}>
      <h3>Requested Products</h3>
      {items.map((item) => (
        <div key={item.orderLineId} style={{ padding: 12, marginTop: 8, border: '1px solid #DCE5F0', borderRadius: 10 }}>
          <strong>{item.productName || item.productId || 'Item'}</strong>
          <div>Order line: {item.orderLineId}</div>
          <div>Requested quantity: {item.requestedQuantity}</div>
          <div>Condition: {item.condition || '—'}</div>
          <div>Reason: {item.reason || '—'}</div>
        </div>
      ))}
    </div>
  );
}

function Evidence({ files = [] }) {
  const unique = files.filter((file, index, all) => all.findIndex((candidate) => candidate.id === file.id) === index);
  return (
    <div style={{ padding: '0 20px 20px' }}>
      <h3>Uploaded Evidence</h3>
      {unique.length === 0 ? <p style={{ color: '#5E6B82' }}>No images or documents uploaded.</p> : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {unique.map((file) => (
            <a key={file.id} href={file.localDataUrl} target="_blank" rel="noreferrer" style={{ width: 130 }}>
              {file.mimeType?.startsWith('image/') && file.localDataUrl ? (
                <img src={file.localDataUrl} alt={file.name} style={{ width: 130, height: 92, objectFit: 'cover', borderRadius: 8, border: '1px solid #D6E2F0' }} />
              ) : <div style={{ padding: 18, border: '1px solid #D6E2F0', borderRadius: 8 }}>Document</div>}
              <div style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

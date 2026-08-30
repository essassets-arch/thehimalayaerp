'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Eye, Search, Truck } from 'lucide-react';
import Swal from 'sweetalert2';
import { backendFetch } from '../../../lib/backendFetch';
import { useRouter, useSearchParams } from 'next/navigation';
import { normalizeStatus } from '../../../store/domains/shared/workflowUtils';
import { returnTabs } from '../../../store/domains/dispatch/dispatchSelectors';

const statusColors = {
  RETURN_APPROVED: ['#fffbeb', '#b45309'],
  RETURN_PICKUP_ASSIGNED: ['#eef2ff', '#4338ca'],
  RETURN_IN_TRANSIT: ['#eff6ff', '#1d4ed8'],
  RETURN_RECEIVED: ['#ecfdf5', '#047857'],
};

const STATUS_TAB_MAP = {
  pending: 'approved',
  'in-transit': 'in-transit',
  delivered: 'received',
};

export default function ReturnsPortal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatusTab = STATUS_TAB_MAP[searchParams?.get('status')];
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialStatusTab || searchParams?.get('tab') || 'all');
  const [search, setSearch] = useState(searchParams?.get('search') || '');
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

  useEffect(() => {
    const statusTab = STATUS_TAB_MAP[searchParams?.get('status')];
    setActiveTab(statusTab || searchParams?.get('tab') || 'all');
  }, [searchParams]);

  const statusMap = {
    REQUESTED: 'RETURN_REQUESTED',
    UNDER_REVIEW: 'RETURN_REQUESTED',
    APPROVED: 'RETURN_APPROVED',
    PICKUP_ASSIGNED: 'RETURN_PICKUP_ASSIGNED',
    IN_TRANSIT: 'RETURN_IN_TRANSIT',
    CLOSED: 'RETURN_RECEIVED',
    REJECTED: 'REJECTED',
  };
  const rows = useMemo(() => requests
    .map((request) => {
      const rawOrderNo = request.salesOrder?.orderNumber || request.salesOrder?.orderNo || request.orderNumber || request.orderNo;
      return {
        ...request,
        id: request.id,
        displayId: request.returnNumber,
        orderId: rawOrderNo || request.salesOrderId || '—',
        orderNumber: rawOrderNo || request.salesOrderId || '—',
        status: statusMap[request.status] || request.status,
        customerName: request.salesOrder?.customer?.companyName || request.salesOrder?.customer?.name || 'Unknown customer',
        deliveryAddress: request.salesOrder?.shippingAddress || '',
        ...request.dispatchDetails,
      };
    }), [requests]);

  const selectedTab = returnTabs.find(tab => tab.key === activeTab) || returnTabs[0];
  const filtered = rows.filter((request) => {
    if (!selectedTab.predicate(request)) return false;
    const query = search.trim().toLowerCase();
    return !query || [request.id, request.returnNumber, request.orderId, request.orderNumber, request.customerName]
      .some((value) => String(value || '').toLowerCase().includes(query));
  });

  const assignPickup = async (request) => {
    const today = new Date().toISOString().slice(0, 10);
    const result = await Swal.fire({
      title: `Assign Pickup — ${request.id}`,
      html: `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;text-align:left">
          <input id="ret-vehicle" class="swal2-input" style="margin:0;width:100%" placeholder="Vehicle number">
          <input id="ret-driver" class="swal2-input" style="margin:0;width:100%" placeholder="Driver name">
          <input id="ret-phone" class="swal2-input" style="margin:0;width:100%" placeholder="Driver phone">
          <input id="ret-transporter" class="swal2-input" style="margin:0;width:100%" placeholder="Transporter">
          <input id="ret-lr" class="swal2-input" style="margin:0;width:100%" placeholder="LR / AWB">
          <input id="ret-pickup" type="date" value="${today}" class="swal2-input" style="margin:0;width:100%">
          <input id="ret-arrival" type="date" class="swal2-input" style="margin:0;width:100%">
          <input id="ret-cost" type="number" min="0" class="swal2-input" style="margin:0;width:100%" placeholder="Transportation cost">
        </div>
        <textarea id="ret-pickup-remarks" class="swal2-textarea" placeholder="Pickup remarks"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Assign Pickup',
      preConfirm: () => {
        const vehicleNumber = document.getElementById('ret-vehicle')?.value.trim();
        const driverName = document.getElementById('ret-driver')?.value.trim();
        const driverPhone = document.getElementById('ret-phone')?.value.trim();
        if (!vehicleNumber || !driverName || !driverPhone) {
          Swal.showValidationMessage('Vehicle, driver and phone are required.');
          return false;
        }
        return {
          vehicleNumber,
          driverName,
          driverPhone,
          transporter: document.getElementById('ret-transporter')?.value.trim(),
          lrAwbNumber: document.getElementById('ret-lr')?.value.trim(),
          pickupDate: document.getElementById('ret-pickup')?.value,
          expectedFactoryArrival: document.getElementById('ret-arrival')?.value,
          transportationCost: Number(document.getElementById('ret-cost')?.value || 0),
          remarks: document.getElementById('ret-pickup-remarks')?.value.trim(),
        };
      },
    });
    if (result.isConfirmed) {
      await backendFetch(`/api/backend/sales-returns/${request.id}/dispatch`, { method: 'PATCH', body: result.value });
      await loadRequests();
    }
  };

  const beginTransit = async (request) => {
    const result = await Swal.fire({
      icon: 'question',
      title: `Start return transit for ${request.id}?`,
      showCancelButton: true,
      confirmButtonText: 'Start Transit',
    });
    if (result.isConfirmed) {
      await backendFetch(`/api/backend/sales-returns/${request.id}/in-transit`, { method: 'PATCH' });
      await loadRequests();
    }
  };

  const receiveReturn = async (request) => {
    const approved = request.items.reduce((sum, item) => sum + Number(item.approvedQuantity || 0), 0);
    const result = await Swal.fire({
      title: `Confirm Factory Receipt — ${request.id}`,
      html: `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;text-align:left">
          <input id="ret-received-date" type="date" value="${new Date().toISOString().slice(0, 10)}" class="swal2-input" style="margin:0;width:100%">
          <input id="ret-received-time" type="time" class="swal2-input" style="margin:0;width:100%">
          <input id="ret-received-by" class="swal2-input" style="margin:0;width:100%" placeholder="Received by">
          <input id="ret-received-qty" type="number" min="1" max="${approved}" value="${approved}" class="swal2-input" style="margin:0;width:100%">
          <select id="ret-condition" class="swal2-select" style="margin:0;width:100%">
            <option value="GOOD">Good</option><option value="DAMAGED">Damaged</option><option value="REWORKABLE">Reworkable</option>
          </select>
        </div>
        <label style="display:block;text-align:left;font-weight:800;margin-top:12px">Delivery proof image *</label>
        <input id="ret-proof" type="file" accept="image/jpeg,image/png,image/webp" style="display:block;width:100%;margin-top:6px">
        <textarea id="ret-inspection" class="swal2-textarea" placeholder="Inspection notes"></textarea>
        <textarea id="ret-receipt-remarks" class="swal2-textarea" placeholder="Receipt remarks"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm Receipt',
      preConfirm: () => {
        const receivedBy = document.getElementById('ret-received-by')?.value.trim();
        const receivedQuantity = Number(document.getElementById('ret-received-qty')?.value);
        if (!receivedBy || receivedQuantity <= 0 || receivedQuantity > approved) {
          Swal.showValidationMessage(`Receiver and quantity from 1 to ${approved} are required.`);
          return false;
        }
        const proofFile = document.getElementById('ret-proof')?.files?.[0];
        if (!proofFile) {
          Swal.showValidationMessage('Delivery proof image is required.');
          return false;
        }
        return {
          receivedDate: document.getElementById('ret-received-date')?.value,
          receivedTime: document.getElementById('ret-received-time')?.value,
          receivedBy,
          receivedQuantity,
          materialCondition: document.getElementById('ret-condition')?.value,
          inspectionNotes: document.getElementById('ret-inspection')?.value.trim(),
          remarks: document.getElementById('ret-receipt-remarks')?.value.trim(),
          proofFile,
        };
      },
    });
    if (result.isConfirmed) {
      const upload = new FormData();
      upload.append('file', result.value.proofFile);
      upload.append('category', 'pod');
      const response = await fetch('/api/upload', { method: 'POST', body: upload });
      if (!response.ok) throw new Error((await response.json()).message || 'Delivery proof upload failed');
      const uploaded = await response.json();
      await backendFetch(`/api/backend/sales-returns/${request.id}/deliver`, {
        method: 'PATCH',
        body: { ...result.value, proofFile: undefined, proofUrl: uploaded.url },
      });
      await loadRequests();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Return Pickup & History</h2>
        <p style={{ margin: '5px 0 0', color: '#5E6B82' }}>Coordinate reverse logistics and retain the complete factory-receipt history.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 12 }}>
        {returnTabs.filter(tab => !['all', 'history'].includes(tab.key)).map(tab => (
          <div key={tab.key} style={{ padding: 16, background: '#fff', border: '1px solid #DCE5F0', borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: '#5E6B82', fontWeight: 700 }}>{tab.label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, marginTop: 5 }}>{rows.filter(tab.predicate).length}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #DCE5F0', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 8, padding: 14, flexWrap: 'wrap', borderBottom: '1px solid #DCE5F0', background: '#F5FAFE' }}>
          {returnTabs.map(tab => (
            <button key={tab.key} onClick={() => {
              setActiveTab(tab.key);
              const query = new URLSearchParams(searchParams?.toString() || '');
              query.delete('status');
              query.set('tab', tab.key);
              router.replace(`/dispatch/returns?${query.toString()}`, { scroll: false });
            }} style={{
              padding: '8px 13px', borderRadius: 8, cursor: 'pointer', fontWeight: 800,
              border: activeTab === tab.key ? '1px solid #2563eb' : '1px solid #D6E2F0',
              color: activeTab === tab.key ? '#fff' : '#475569',
              background: activeTab === tab.key ? '#2563eb' : '#fff',
            }}>{tab.label} {rows.filter(tab.predicate).length}</button>
          ))}
          <div style={{ marginLeft: 'auto', position: 'relative', minWidth: 270 }}>
            <Search size={15} style={{ position: 'absolute', left: 11, top: 11, color: '#8893A7' }} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search return, order, customer…" style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1px solid #D6E2F0', borderRadius: 8 }} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="crm-table responsive-table">
            <thead><tr><th>Return ID</th><th>Order ID</th><th>Customer</th><th>Products / Qty</th><th>Pickup</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 34 }}>Loading return records…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 34, color: '#5E6B82' }}>No return records in this tab.</td></tr>
              ) : filtered.map((request) => {
                const colors = statusColors[request.status] || ['#f1f5f9', '#475569'];
                return (
                  <tr key={request.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 800 }}>{request.displayId}</td>
                    <td style={{ fontFamily: 'monospace' }}>{request.orderId}</td>
                    <td>{request.customerName}</td>
                    <td>{(Array.isArray(request.items) ? request.items : request.items ? [request.items] : []).map((item) => `${item.product?.name || item.productId || 'Item'} (${item.approvedQuantity || item.requestedQuantity})`).join(', ')}</td>
                    <td>{request.vehicleNumber || 'Not assigned'}</td>
                    <td><span style={{ padding: '5px 9px', borderRadius: 20, background: colors[0], color: colors[1], fontSize: 11, fontWeight: 900 }}>{request.status.replaceAll('_', ' ')}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="btn-small btn-outline-small" onClick={() => setViewRequest(request)}><Eye size={12} /> View</button>
                        {request.status === 'RETURN_APPROVED' && <button className="btn-small btn-outline-small" onClick={() => assignPickup(request)}><Truck size={12} /> Assign Pickup</button>}
                        {request.status === 'RETURN_PICKUP_ASSIGNED' && <button className="btn-small btn-outline-small" onClick={() => beginTransit(request)}><Clock size={12} /> Start Transit</button>}
                        {request.status === 'RETURN_IN_TRANSIT' && <button className="btn-small btn-outline-small" onClick={() => receiveReturn(request)}><CheckCircle2 size={12} /> Confirm Receipt</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {viewRequest && <ReturnHistoryDialog request={viewRequest} onClose={() => setViewRequest(null)} />}
    </div>
  );
}

function ReturnHistoryDialog({ request, onClose }) {
  const fields = [
    ['Return ID', request.id],
    ['Original Order', request.orderId],
    ['Customer', request.customerName],
    ['Status', request.status?.replaceAll('_', ' ')],
    ['Pickup Address', request.pickupAddress || request.deliveryAddress],
    ['Contact Person', request.contactPerson],
    ['Vehicle', request.vehicleNumber],
    ['Driver', request.driverName],
    ['Driver Phone', request.driverPhone],
    ['Transporter', request.transporter],
    ['LR / AWB', request.lrAwbNumber || request.lrNumber],
    ['Pickup Date', request.pickupDate],
    ['Expected Factory Arrival', request.expectedFactoryArrival],
    ['Transportation Cost', request.transportationCost ? `₹${Number(request.transportationCost).toLocaleString('en-IN')}` : '—'],
    ['Received Date / Time', [request.receivedDate || request.receivedAt, request.receivedTime].filter(Boolean).join(' ')],
    ['Received By', request.receivedBy],
    ['Material Condition', request.materialCondition],
    ['Inspection Notes', request.inspectionNotes],
    ['Remarks', request.remarks],
  ];
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 20, background: 'rgba(15, 23, 42, 0.62)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Return Logistics History"
        style={{
          position: 'relative', width: '94%', maxWidth: 820, maxHeight: '90vh', overflowY: 'auto',
          background: '#fff', color: '#24345C', borderRadius: 16, border: '1px solid #DCE5F0',
          boxShadow: '0 28px 80px rgba(15, 23, 42, 0.38)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #DCE5F0' }}>
          <h2 style={{ margin: 0 }}>Return Logistics History</h2>
          <button type="button" aria-label="Close return history" onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #D6E2F0', background: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, padding: 20 }}>
          {fields.map(([label, value]) => <div key={label}><div style={{ fontSize: 11, fontWeight: 900, color: '#5E6B82', textTransform: 'uppercase' }}>{label}</div><div style={{ marginTop: 4 }}>{value || '—'}</div></div>)}
        </div>
        <div style={{ padding: '0 20px 20px' }}>
          <h3>Products</h3>
          {(Array.isArray(request.items) ? request.items : []).map((item, index) => <div key={item.id || item.salesOrderItemId || item.orderLineId || `${item.productId || 'return-item'}-${index}`} style={{ padding: 12, marginTop: 8, border: '1px solid #DCE5F0', borderRadius: 9 }}>{item.productName || item.productId}: requested {item.requestedQuantity}, approved {item.approvedQuantity ?? '—'}, received {item.receivedQuantity ?? request.receivedQuantity ?? '—'} — {item.condition || 'Condition not recorded'}</div>)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 20 }}><button className="btn-small btn-outline-small" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

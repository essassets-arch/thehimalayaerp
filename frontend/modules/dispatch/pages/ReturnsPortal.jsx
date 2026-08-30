'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { CheckCircle2, Clock, Eye, Search, Truck, X, UploadCloud, Calendar, User, FileText, AlertCircle, ArrowRight, ShieldCheck, Image as ImageIcon, Trash2, PackageCheck, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { backendFetch } from '../../../lib/backendFetch';
import { useRouter, useSearchParams } from 'next/navigation';
import { returnTabs } from '../../../store/domains/dispatch/dispatchSelectors';

const statusColors = {
  RETURN_REQUESTED: ['#FEF3C7', '#D97706'],
  RETURN_APPROVED: ['#FEF3C7', '#B45309'],
  RETURN_PICKUP_ASSIGNED: ['#EEF2FF', '#4338CA'],
  RETURN_IN_TRANSIT: ['#EFF6FF', '#1D4ED8'],
  RETURN_RECEIVED: ['#ECFDF5', '#047857'],
  REJECTED: ['#FEE2E2', '#DC2626'],
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
  
  // Modals state
  const [viewRequest, setViewRequest] = useState(null);
  const [selectedReturnForReceipt, setSelectedReturnForReceipt] = useState(null);
  const [selectedReturnForPickup, setSelectedReturnForPickup] = useState(null);

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
        displayId: request.returnNumber || request.id,
        orderId: rawOrderNo || request.salesOrderId || '—',
        orderNumber: rawOrderNo || request.salesOrderId || '—',
        status: statusMap[request.status] || request.status,
        customerName: request.salesOrder?.customer?.companyName || request.salesOrder?.customer?.name || 'Unknown customer',
        deliveryAddress: request.salesOrder?.shippingAddress || request.pickupAddress || '',
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

  const beginTransit = async (request) => {
    const result = await Swal.fire({
      icon: 'question',
      title: `Start Return Transit?`,
      text: `Shipment for ${request.displayId} will be marked as in-transit to the factory.`,
      showCancelButton: true,
      confirmButtonText: 'Start Transit',
      confirmButtonColor: '#2563EB',
    });
    if (result.isConfirmed) {
      try {
        await backendFetch(`/api/backend/sales-returns/${request.id}/in-transit`, { method: 'PATCH' });
        Swal.fire({ icon: 'success', title: 'Transit Started', timer: 1500, showConfirmButton: false });
        await loadRequests();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Transit Error', text: err?.message || 'Failed to update transit status' });
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: 'var(--color-text-primary, #0F172A)' }}>
            Return Pickup & History
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary, #64748B)', fontSize: '13px' }}>
            Coordinate reverse logistics, track driver pickups, and confirm factory receipts with delivery proof.
          </p>
        </div>
        <button
          onClick={loadRequests}
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            background: '#FFFFFF',
            color: '#334155',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Clock size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {returnTabs.filter(tab => !['all', 'history'].includes(tab.key)).map(tab => {
          const count = rows.filter(tab.predicate).length;
          return (
            <div key={tab.key} style={{ padding: '16px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{tab.label}</div>
              <div style={{ fontSize: '26px', fontWeight: 900, marginTop: '6px', color: '#0F172A' }}>{count}</div>
            </div>
          );
        })}
      </div>

      {/* Table Container Card */}
      <div className="app-card" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', padding: 0 }}>
        {/* Navigation Tabs and Search */}
        <div style={{ display: 'flex', gap: '8px', padding: '14px 18px', flexWrap: 'wrap', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', alignItems: 'center' }}>
          {returnTabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  const query = new URLSearchParams(searchParams?.toString() || '');
                  query.delete('status');
                  query.set('tab', tab.key);
                  router.replace(`/dispatch/returns?${query.toString()}`, { scroll: false });
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  border: isActive ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                  color: isActive ? '#FFFFFF' : '#475569',
                  background: isActive ? '#2563EB' : '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 900,
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                  color: isActive ? '#FFFFFF' : '#475569'
                }}>
                  {rows.filter(tab.predicate).length}
                </span>
              </button>
            );
          })}
          
          <div style={{ marginLeft: 'auto', position: 'relative', minWidth: '240px', flex: '1 1 240px', maxWidth: '360px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search return, order, customer…"
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '13px',
                outline: 'none',
                background: '#FFFFFF'
              }}
            />
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="crm-table responsive-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#475569', fontWeight: 700 }}>
                <th style={{ padding: '12px 16px' }}>Return ID</th>
                <th style={{ padding: '12px 16px' }}>Order Ref</th>
                <th style={{ padding: '12px 16px' }}>Customer</th>
                <th style={{ padding: '12px 16px' }}>Products / Qty</th>
                <th style={{ padding: '12px 16px' }}>Pickup Vehicle</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Loading return records…</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>📦</div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#334155' }}>No return records found</strong>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>No reverse shipments match the selected tab filter.</span>
                  </td>
                </tr>
              ) : filtered.map((request) => {
                const colors = statusColors[request.status] || ['#F1F5F9', '#475569'];
                return (
                  <tr key={request.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 800, color: '#1E3A8A' }}>
                      {request.displayId}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#0F172A' }}>
                      {request.orderId}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F172A' }}>
                      {request.customerName}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {(Array.isArray(request.items) ? request.items : request.items ? [request.items] : []).map((item) => `${item.product?.name || item.productId || 'Item'} (${item.approvedQuantity || item.requestedQuantity})`).join(', ')}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569', fontSize: '12.5px' }}>
                      {request.vehicleNumber ? (
                        <div>
                          <strong style={{ color: '#0F172A' }}>{request.vehicleNumber}</strong>
                          {request.driverName && <div style={{ fontSize: '11px', color: '#64748B' }}>{request.driverName}</div>}
                        </div>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>Not assigned</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: colors[0],
                        color: colors[1],
                        fontSize: '11.5px',
                        fontWeight: 800,
                        display: 'inline-block'
                      }}>
                        {request.status.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                          className="btn-small btn-outline-small"
                          onClick={() => setViewRequest(request)}
                          style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={13} /> View
                        </button>
                        {request.status === 'RETURN_APPROVED' && (
                          <button
                            className="btn-small btn-outline-small"
                            onClick={() => setSelectedReturnForPickup(request)}
                            style={{ fontWeight: 700, color: '#2563EB', borderColor: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Truck size={13} /> Assign Pickup
                          </button>
                        )}
                        {request.status === 'RETURN_PICKUP_ASSIGNED' && (
                          <button
                            className="btn-small btn-outline-small"
                            onClick={() => beginTransit(request)}
                            style={{ fontWeight: 700, color: '#D97706', borderColor: '#D97706', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Clock size={13} /> Start Transit
                          </button>
                        )}
                        {request.status === 'RETURN_IN_TRANSIT' && (
                          <button
                            className="btn-small btn-outline-small"
                            onClick={() => setSelectedReturnForReceipt(request)}
                            style={{ fontWeight: 700, background: '#16A34A', color: '#FFFFFF', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <CheckCircle2 size={13} /> Confirm Receipt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern React Modal: Confirm Factory Receipt */}
      {selectedReturnForReceipt && (
        <ConfirmFactoryReceiptModal
          request={selectedReturnForReceipt}
          onClose={() => setSelectedReturnForReceipt(null)}
          onSuccess={() => {
            setSelectedReturnForReceipt(null);
            loadRequests();
          }}
        />
      )}

      {/* Modern React Modal: Assign Pickup */}
      {selectedReturnForPickup && (
        <AssignPickupModal
          request={selectedReturnForPickup}
          onClose={() => setSelectedReturnForPickup(null)}
          onSuccess={() => {
            setSelectedReturnForPickup(null);
            loadRequests();
          }}
        />
      )}

      {/* Return History Details Modal */}
      {viewRequest && (
        <ReturnHistoryDialog request={viewRequest} onClose={() => setViewRequest(null)} />
      )}
    </div>
  );
}

// ─── Modal 1: Confirm Factory Receipt with POD Image Upload & Validation ───
function ConfirmFactoryReceiptModal({ request, onClose, onSuccess }) {
  const approvedQty = (Array.isArray(request.items) ? request.items : []).reduce(
    (sum, item) => sum + Number(item.approvedQuantity || item.requestedQuantity || 0),
    0
  ) || 1;

  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10));
  const [receivedTime, setReceivedTime] = useState(new Date().toTimeString().slice(0, 5));
  const [receivedBy, setReceivedBy] = useState('');
  const [receivedQuantity, setReceivedQuantity] = useState(approvedQty);
  const [materialCondition, setMaterialCondition] = useState('GOOD');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [receiptRemarks, setReceiptRemarks] = useState('');
  
  const [proofFile, setProofFile] = useState(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setValidationError('Please select a valid image file (PNG, JPG, WebP).');
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setValidationError('File size must be 25MB or smaller.');
        return;
      }
      setProofFile(file);
      setProofPreviewUrl(URL.createObjectURL(file));
      setValidationError('');
    }
  };

  const handleRemoveFile = () => {
    setProofFile(null);
    if (proofPreviewUrl) {
      URL.revokeObjectURL(proofPreviewUrl);
      setProofPreviewUrl('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!receivedBy.trim()) {
      setValidationError('Receiver staff name is required.');
      return;
    }
    if (Number(receivedQuantity) <= 0 || Number(receivedQuantity) > approvedQty) {
      setValidationError(`Received quantity must be between 1 and ${approvedQty}.`);
      return;
    }
    if (!proofFile) {
      setValidationError('Delivery proof image (POD / Unloaded Material photo) is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload proof file to /api/upload
      const uploadData = new FormData();
      uploadData.append('file', proofFile);
      uploadData.append('category', 'pod');
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      if (!uploadRes.ok) {
        const errJson = await uploadRes.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to upload delivery proof image.');
      }

      const uploadResult = await uploadRes.json();
      const proofUrl = uploadResult.url || uploadResult.file_id;

      // 2. Complete return delivery on backend
      await backendFetch(`/api/backend/sales-returns/${request.id}/deliver`, {
        method: 'PATCH',
        body: {
          receivedDate,
          receivedTime,
          receivedBy: receivedBy.trim(),
          receivedQuantity: Number(receivedQuantity),
          materialCondition,
          inspectionNotes: inspectionNotes.trim(),
          remarks: receiptRemarks.trim(),
          proofUrl,
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Factory Receipt Confirmed',
        text: `Return ${request.displayId || request.returnNumber} marked as received and completed.`,
        timer: 2000,
        showConfirmButton: false,
      });

      onSuccess();
    } catch (err) {
      console.error('Error confirming factory receipt:', err);
      setValidationError(err?.message || 'Failed to confirm factory receipt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
    }}>
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '660px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E2E8F0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px',
          borderBottom: '1px solid #E2E8F0',
          background: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#047857'
            }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                Confirm Factory Receipt
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748B' }}>
                Reverse Logistics Batch Verification & Delivery Proof Upload
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: '#F1F5F9', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Context Information Card */}
        <div style={{ padding: '16px 24px', background: '#F0FDF4', borderBottom: '1px solid #DCFCE7' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', fontSize: '12.5px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Return No</span>
              <div style={{ fontWeight: 800, color: '#14532D', fontFamily: 'monospace' }}>{request.displayId || request.returnNumber}</div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Original Order</span>
              <div style={{ fontWeight: 800, color: '#14532D', fontFamily: 'monospace' }}>{request.orderId || request.orderNumber}</div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Customer</span>
              <div style={{ fontWeight: 800, color: '#14532D' }}>{request.customerName}</div>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Approved Qty</span>
              <div style={{ fontWeight: 900, color: '#16A34A' }}>{approvedQty} Units</div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Validation Alert */}
          {validationError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 14px',
              borderRadius: '8px',
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#B91C1C',
              fontSize: '13px',
              fontWeight: 600
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Row 1: Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Receipt Date *
              </label>
              <input
                type="date"
                required
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Receipt Time *
              </label>
              <input
                type="time"
                required
                value={receivedTime}
                onChange={(e) => setReceivedTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Row 2: Receiver Name & Quantity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Received By (Officer / Store Staff) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar (Store In-Charge)"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Received Qty * (Max: {approvedQty})
              </label>
              <input
                type="number"
                required
                min="1"
                max={approvedQty}
                value={receivedQuantity}
                onChange={(e) => setReceivedQuantity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                  fontWeight: 800
                }}
              />
            </div>
          </div>

          {/* Row 3: Material Condition */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Material Condition Verified *
            </label>
            <select
              value={materialCondition}
              onChange={(e) => setMaterialCondition(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
                fontWeight: 600,
                background: '#FFFFFF'
              }}
            >
              <option value="GOOD">Good Condition — Ready for Finished Goods Restock</option>
              <option value="REWORKABLE">Reworkable — Minor Touchup / Re-inspection Required</option>
              <option value="DAMAGED">Damaged — Defective / Scrap Disposition</option>
            </select>
          </div>

          {/* Row 4: Delivery Proof Upload Area */}
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              <span>Delivery Proof Image (POD / Material Photo) *</span>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>PNG, JPG, WebP (Max 25MB)</span>
            </label>

            {!proofPreviewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: '12px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: '#F8FAFC',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
              >
                <UploadCloud size={28} style={{ color: '#3B82F6', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                  Click to browse or drop delivery proof photo
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                  Upload signed take-back challan, driver POD, or unloaded material photo
                </div>
              </div>
            ) : (
              <div style={{
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '12px',
                background: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <img
                  src={proofPreviewUrl}
                  alt="Delivery Proof Preview"
                  style={{
                    width: '80px',
                    height: '65px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1'
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {proofFile?.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                    {proofFile ? `${(proofFile.size / 1024).toFixed(1)} KB` : ''} • Image Selected
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #FCA5A5',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={13} />
                  Remove
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Row 5: Inspection Notes & Remarks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Inspection Notes
              </label>
              <textarea
                rows={2}
                placeholder="Details of material check upon arrival..."
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12.5px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Receipt Remarks
              </label>
              <textarea
                rows={2}
                placeholder="Gate entry / holding bay remarks..."
                value={receiptRemarks}
                onChange={(e) => setReceiptRemarks(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12.5px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            borderTop: '1px solid #E2E8F0',
            paddingTop: '16px',
            marginTop: '4px'
          }}>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '9px 22px',
                borderRadius: '8px',
                border: 'none',
                background: '#16A34A',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                cursor: isSubmitting ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving Receipt & Proof...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  Confirm Receipt
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal 2: Assign Pickup Details Modal ───
function AssignPickupModal({ request, onClose, onSuccess }) {
  const today = new Date().toISOString().slice(0, 10);
  const [vehicleNumber, setVehicleNumber] = useState(request.vehicleNumber || '');
  const [driverName, setDriverName] = useState(request.driverName || '');
  const [driverPhone, setDriverPhone] = useState(request.driverPhone || '');
  const [transporter, setTransporter] = useState(request.transporter || 'Himalaya Logistics');
  const [lrAwbNumber, setLrAwbNumber] = useState(request.lrAwbNumber || request.lrNumber || '');
  const [pickupDate, setPickupDate] = useState(request.pickupDate || today);
  const [expectedFactoryArrival, setExpectedFactoryArrival] = useState(request.expectedFactoryArrival || today);
  const [transportationCost, setTransportationCost] = useState(request.transportationCost || '0');
  const [remarks, setRemarks] = useState(request.remarks || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!vehicleNumber.trim()) {
      setValidationError('Vehicle number is required.');
      return;
    }
    if (!driverName.trim()) {
      setValidationError('Driver name is required.');
      return;
    }
    if (!driverPhone.trim()) {
      setValidationError('Driver phone number is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await backendFetch(`/api/backend/sales-returns/${request.id}/dispatch`, {
        method: 'PATCH',
        body: {
          vehicleNumber: vehicleNumber.trim(),
          driverName: driverName.trim(),
          driverPhone: driverPhone.trim(),
          transporter: transporter.trim(),
          lrAwbNumber: lrAwbNumber.trim(),
          pickupDate,
          expectedFactoryArrival,
          transportationCost: Number(transportationCost || 0),
          remarks: remarks.trim(),
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Pickup Assigned',
        text: `Vehicle ${vehicleNumber} assigned for return pickup.`,
        timer: 1800,
        showConfirmButton: false,
      });

      onSuccess();
    } catch (err) {
      console.error('Error assigning pickup:', err);
      setValidationError(err?.message || 'Failed to assign pickup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
    }}>
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E2E8F0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px',
          borderBottom: '1px solid #E2E8F0',
          background: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB'
            }}>
              <Truck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                Assign Return Pickup Vehicle
              </h3>
              <span style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace', fontWeight: 700 }}>
                {request.displayId || request.returnNumber} • Order #{request.orderId || request.orderNumber}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: '#F1F5F9', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {validationError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#B91C1C',
              fontSize: '13px',
              fontWeight: 600
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{validationError}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Vehicle Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DL 01 AB 1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Transporter Carrier
              </label>
              <input
                type="text"
                placeholder="e.g. Himalaya Own Fleet"
                value={transporter}
                onChange={(e) => setTransporter(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Driver Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Suraj Sharma"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Driver Phone *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 9876543210"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                LR / AWB Number
              </label>
              <input
                type="text"
                placeholder="e.g. LR-90123"
                value={lrAwbNumber}
                onChange={(e) => setLrAwbNumber(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Pickup Date
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Expected Arrival
              </label>
              <input
                type="date"
                value={expectedFactoryArrival}
                onChange={(e) => setExpectedFactoryArrival(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Pickup Notes & Instructions
            </label>
            <textarea
              rows={2}
              placeholder="Instructions for reverse pickup driver..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: 700 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '9px 22px',
                borderRadius: '8px',
                border: 'none',
                background: '#2563EB',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Truck size={15} />}
              Assign Pickup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal 3: Complete Return History Dialog ───
function ReturnHistoryDialog({ request, onClose }) {
  const fields = [
    ['Return Number', request.displayId || request.returnNumber],
    ['Original Sales Order', request.orderId || request.orderNumber],
    ['Customer Name', request.customerName],
    ['Return Status', request.status?.replaceAll('_', ' ')],
    ['Pickup Address', request.pickupAddress || request.deliveryAddress],
    ['Contact Person', request.contactPerson],
    ['Vehicle Number', request.vehicleNumber],
    ['Driver Name', request.driverName],
    ['Driver Phone', request.driverPhone],
    ['Transporter Carrier', request.transporter],
    ['LR / AWB Number', request.lrAwbNumber || request.lrNumber],
    ['Pickup Date', request.pickupDate],
    ['Expected Factory Arrival', request.expectedFactoryArrival],
    ['Received Date & Time', [request.receivedDate || (request.receivedAt ? String(request.receivedAt).split('T')[0] : null), request.receivedTime].filter(Boolean).join(' at ')],
    ['Received By Staff', request.receivedBy],
    ['Material Condition', request.materialCondition],
    ['Inspection Notes', request.inspectionNotes],
    ['Receipt Remarks', request.remarks],
  ];

  const proofUrl = request.deliveryProof?.proofUrl || request.proofUrl || request.deliveryProofUrl;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Return Logistics History"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '760px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                Return Logistics & Factory Receipt History
              </h3>
              <span style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace', fontWeight: 700 }}>
                {request.displayId || request.returnNumber} • Order #{request.orderId || request.orderNumber}
              </span>
            </div>
          </div>
          <button type="button" aria-label="Close return history" onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
            <X size={16} />
          </button>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', padding: '20px 24px' }}>
          {fields.map(([label, value]) => (
            <div key={label} style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>{label}</div>
              <div style={{ marginTop: '4px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{value || '—'}</div>
            </div>
          ))}
        </div>

        {/* Products */}
        <div style={{ padding: '0 24px 20px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>Returned Products</h4>
          {(Array.isArray(request.items) ? request.items : []).map((item, index) => (
            <div key={item.id || `${item.productId}-${index}`} style={{ padding: '10px 14px', marginTop: '6px', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <strong style={{ color: '#0F172A', fontSize: '13px' }}>{item.product?.name || item.productName || item.productId}</strong>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>Condition: {item.condition || request.materialCondition || 'Checked'} • Reason: {item.reason || request.reason || '—'}</div>
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#2563EB' }}>
                Requested: {item.requestedQuantity} | Approved: {item.approvedQuantity ?? item.requestedQuantity} | Received: {item.receivedQuantity ?? request.receivedQuantity ?? '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Proof Photo */}
        {proofUrl && (
          <div style={{ padding: '0 24px 20px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>Delivery Proof Document (POD)</h4>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', background: '#F8FAFC', textAlign: 'center' }}>
              <img
                src={proofUrl}
                alt="Return Delivery Proof"
                style={{ maxHeight: '220px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain', margin: '0 auto', display: 'block' }}
              />
              <a
                href={proofUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '10px', fontSize: '12.5px', color: '#2563EB', fontWeight: 700 }}
              >
                View Full-Size Original Photo ↗
              </a>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 20px', borderRadius: '8px', background: '#0F172A', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

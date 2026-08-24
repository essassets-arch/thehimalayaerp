'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useApproveMaterialRequest, useMaterialRequests, useRejectMaterialRequest } from '../../hooks/useMaterialRequests';
import { CheckCircle, XCircle, Eye, ShieldCheck, CheckSquare, Clock } from 'lucide-react';

export default function PlantHeadMaterialApprovalView() {
  const { data: materialRequests = [] } = useMaterialRequests();
  const approveRequest = useApproveMaterialRequest();
  const rejectRequest = useRejectMaterialRequest();
  const submittedList = materialRequests.filter(request => request.status === 'PENDING_PLANT_HEAD_APPROVAL');
  const allList = materialRequests.filter(request => request.status !== 'PENDING_PLANT_HEAD_APPROVAL');

  const [activeTab, setActiveTab] = useState('Pending Approval');
  const [selectedReq, setSelectedReq] = useState(null);
  const [editingItems, setEditingItems] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const displayList = activeTab === 'Pending Approval' ? submittedList : allList;

  const handleOpenReview = (mr) => {
    setSelectedReq(mr);
    setEditingItems(mr.items.map(i => ({
      ...i,
      approvedQty: Number(i.approvedQty) > 0 ? Number(i.approvedQty) : Number(i.requestedQty)
    })));
  };

  const handleQtyChange = (index, val) => {
    setEditingItems(prev => prev.map((item, idx) => idx === index ? { ...item, approvedQty: val } : item));
  };

  const handleApprove = async (status) => {
    if (!selectedReq) return;
    if (status === 'Approved' && editingItems.some(i => !Number.isFinite(Number(i.approvedQty)) || Number(i.approvedQty) <= 0)) {
      await Swal.fire({
        icon: 'error',
        title: 'Approved Quantity Required',
        text: 'Please enter an approved quantity greater than 0 for all requested materials before approving.'
      });
      return;
    }
    const res = await Swal.fire({
      title: `${status} Request?`,
      text: status === 'Approved'
        ? `Approve material requisition ${selectedReq.requestNo}? Store will be authorized to issue materials.`
        : `Are you sure you want to REJECT ${selectedReq.requestNo}?`,
      icon: status === 'Approved' ? 'success' : 'warning',
      showCancelButton: true,
      confirmButtonColor: status === 'Approved' ? '#16a34a' : '#dc2626',
      confirmButtonText: `Yes, ${status}`
    });
    if (res.isConfirmed) {
      try {
        if (status === 'Approved') {
          await approveRequest.mutateAsync({ id: selectedReq.id, items: editingItems });
        } else {
          await rejectRequest.mutateAsync(selectedReq.id);
        }
        await Swal.fire(
          status === 'Approved' ? 'Plant Head Approved' : 'Rejected',
          status === 'Approved'
            ? `Material Request ${selectedReq.requestNo} approved and forwarded to Store.`
            : `Request ${selectedReq.requestNo} has been rejected.`,
          'success'
        );
        setSelectedReq(null);
      } catch (error) {
        await Swal.fire('Cannot approve request', error.message, 'error');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', padding: isMobile ? '8px 4px' : '8px', boxSizing: 'border-box' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', background: '#fff', padding: isMobile ? '16px' : '20px 24px', borderRadius: '16px', border: '1px solid #DCE5F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '800', margin: 0, color: '#24345C', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={24} style={{ color: '#16a34a', flexShrink: 0 }} />
            Material Approval Board (Plant Head)
          </h1>
          <p style={{ fontSize: '13px', color: '#5E6B82', margin: '4px 0 0 0', lineHeight: '1.4' }}>
            Step 3: Review raw material requisitions from production floor — Submitted → Approved / Rejected
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'column' : 'row' }}>
          {['Pending Approval', 'All History'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 18px', borderRadius: '10px', border: `1px solid ${activeTab === tab ? '#16a34a' : '#D6E2F0'}`, background: activeTab === tab ? '#16a34a' : '#fff', color: activeTab === tab ? '#fff' : '#334155', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              {tab === 'Pending Approval' ? <Clock size={16} /> : <CheckSquare size={16} />}
              {tab} ({tab === 'Pending Approval' ? submittedList.length : allList.length})
            </button>
          ))}
        </div>
      </div>

      {/* Table / Cards List */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #DCE5F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {!isMobile ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F5FAFE', borderBottom: '1px solid #DCE5F0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 20px' }}>Request No</th>
                  <th style={{ padding: '14px 20px' }}>Date</th>
                  <th style={{ padding: '14px 20px' }}>Work Order</th>
                  <th style={{ padding: '14px 20px' }}>Items</th>
                  <th style={{ padding: '14px 20px' }}>Priority</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayList.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#8893A7', fontSize: '14px' }}>
                    {activeTab === 'Pending Approval' ? 'No material requests awaiting approval.' : 'No material request history.'}
                  </td></tr>
                ) : (
                  displayList.map(mr => {
                    const isPending = mr.status === 'PENDING_PLANT_HEAD_APPROVAL';
                    return (
                      <tr key={mr.id} style={{ borderBottom: '1px solid #f1f5f9', background: isPending ? '#fff' : '#F5FAFE' }}>
                        <td style={{ padding: '16px 20px', fontWeight: '800', fontFamily: 'monospace', color: '#24345C' }}>{mr.requestNo}</td>
                        <td style={{ padding: '16px 20px', fontSize: '13px', color: '#5E6B82' }}>{mr.requestDate}</td>
                        <td style={{ padding: '16px 20px', fontWeight: '700', color: '#2563eb' }}>{mr.workOrderNo || '—'}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: '700' }}>{mr.items?.length || 0} items</div>
                          <div style={{ marginTop: '3px', fontSize: '12px', color: '#5E6B82' }}>
                            {mr.items?.map(item => item.material).filter(Boolean).join(', ') || 'No material specified'}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', background: mr.priority === 'Urgent' ? '#fff1f2' : mr.priority === 'High' ? '#fffbeb' : '#F5FAFE', color: mr.priority === 'Urgent' ? '#e11d48' : mr.priority === 'High' ? '#d97706' : '#475569' }}>
                            {mr.priority}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', background: isPending ? '#eff6ff' : mr.status === 'PLANT_HEAD_APPROVED' ? '#f0fdf4' : mr.status === 'PLANT_HEAD_REJECTED' ? '#fef2f2' : '#ecfdf5', color: isPending ? '#2563eb' : mr.status === 'PLANT_HEAD_APPROVED' ? '#16a34a' : mr.status === 'PLANT_HEAD_REJECTED' ? '#dc2626' : '#059669', border: `1px solid ${isPending ? '#bfdbfe' : mr.status === 'PLANT_HEAD_APPROVED' ? '#bbf7d0' : mr.status === 'PLANT_HEAD_REJECTED' ? '#fecaca' : '#a7f3d0'}` }}>
                            {mr.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <button onClick={() => handleOpenReview(mr)} style={{ padding: '8px 16px', borderRadius: '8px', border: isPending ? 'none' : '1px solid #D6E2F0', background: isPending ? '#16a34a' : '#fff', color: isPending ? '#fff' : '#334155', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {isPending ? <CheckCircle size={15} /> : <Eye size={15} />}
                            {isPending ? 'Review & Approve' : 'View Details'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {displayList.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center', color: '#8893A7', fontSize: '14px' }}>
                {activeTab === 'Pending Approval' ? 'No material requests awaiting approval.' : 'No material request history.'}
              </div>
            ) : (
              displayList.map(mr => {
                const isPending = mr.status === 'PENDING_PLANT_HEAD_APPROVAL';
                return (
                  <div key={mr.id} style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px', background: isPending ? '#fff' : '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '800', fontFamily: 'monospace', color: '#24345C', fontSize: '15px' }}>{mr.requestNo}</span>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', background: isPending ? '#eff6ff' : mr.status === 'PLANT_HEAD_APPROVED' ? '#f0fdf4' : mr.status === 'PLANT_HEAD_REJECTED' ? '#fef2f2' : '#ecfdf5', color: isPending ? '#2563eb' : mr.status === 'PLANT_HEAD_APPROVED' ? '#16a34a' : mr.status === 'PLANT_HEAD_REJECTED' ? '#dc2626' : '#059669', border: `1px solid ${isPending ? '#bfdbfe' : mr.status === 'PLANT_HEAD_APPROVED' ? '#bbf7d0' : mr.status === 'PLANT_HEAD_REJECTED' ? '#fecaca' : '#a7f3d0'}` }}>
                        {mr.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                      <div>
                        <span style={{ color: '#8893A7', fontWeight: 600, display: 'block' }}>REQUEST DATE</span>
                        <span style={{ color: '#24345C', fontWeight: 700 }}>{mr.requestDate}</span>
                      </div>
                      <div>
                        <span style={{ color: '#8893A7', fontWeight: 600, display: 'block' }}>WORK ORDER</span>
                        <span style={{ color: '#2563eb', fontWeight: 700 }}>{mr.workOrderNo || '—'}</span>
                      </div>
                      <div>
                        <span style={{ color: '#8893A7', fontWeight: 600, display: 'block' }}>PRIORITY</span>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', display: 'inline-block', background: mr.priority === 'Urgent' ? '#fff1f2' : mr.priority === 'High' ? '#fffbeb' : '#EEF2FF', color: mr.priority === 'Urgent' ? '#e11d48' : mr.priority === 'High' ? '#d97706' : '#475569' }}>
                          {mr.priority}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#8893A7', fontWeight: 600, display: 'block' }}>ITEMS COUNT</span>
                        <span style={{ color: '#24345C', fontWeight: 700 }}>{mr.items?.length || 0} items</span>
                      </div>
                    </div>

                    <div style={{ background: '#F5FAFE', padding: '10px', borderRadius: '8px', border: '1px solid #DCE5F0', fontSize: '12px' }}>
                      <span style={{ color: '#5E6B82', fontWeight: 700, display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Materials requested</span>
                      <span style={{ color: '#24345C', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                        {mr.items?.map(item => item.material).filter(Boolean).join(', ') || 'No material specified'}
                      </span>
                    </div>

                    <button onClick={() => handleOpenReview(mr)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: isPending ? 'none' : '1px solid #D6E2F0', background: isPending ? '#16a34a' : '#fff', color: isPending ? '#fff' : '#334155', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                      {isPending ? <CheckCircle size={15} /> : <Eye size={15} />}
                      {isPending ? 'Review & Approve Requisition' : 'View Details'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReq && (
        <div className="erp-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: isMobile ? '8px' : '24px', boxSizing: 'border-box' }}>
          <div className="erp-modal-box" style={{ background: '#fff', borderRadius: '20px', width: 'min(720px, calc(100vw - 24px))', maxWidth: '100%', maxHeight: '94vh', overflowY: 'auto', padding: isMobile ? '16px' : '28px', border: '1px solid #DCE5F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #DCE5F0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#16a34a' }}>Plant Head Approval Review</span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0 0 0', color: '#24345C' }}>{selectedReq.requestNo}</h2>
              </div>
              <button onClick={() => setSelectedReq(null)} style={{ background: '#F5FAFE', border: '1px solid #D6E2F0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>Close</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px', fontSize: '13px', background: '#F5FAFE', padding: '14px', borderRadius: '12px' }}>
              <div><strong>Work Order:</strong> {selectedReq.workOrderNo || '—'}</div>
              <div><strong>Priority:</strong> <span style={{ fontWeight: '800' }}>{selectedReq.priority}</span></div>
              {selectedReq.notes && (
                <div style={{ gridColumn: isMobile ? 'auto' : 'span 3', color: '#92400e', background: '#fffbeb', padding: '10px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <strong>Floor Notes:</strong> {selectedReq.notes}
                </div>
              )}
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#24345C', marginBottom: '12px' }}>
              Authorize Material Quantities {selectedReq.status === 'PENDING_PLANT_HEAD_APPROVAL' ? '(Adjust & Approve)' : '(Read Only)'}
            </h3>

            {!isMobile ? (
              <div className="erp-table-responsive" style={{ overflowX: 'auto', marginBottom: '24px' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                    <th style={{ padding: '10px 14px' }}>Material Item</th>
                    <th style={{ padding: '10px 14px', width: '120px' }}>Requested</th>
                    <th style={{ padding: '10px 14px', width: '150px' }}>Approved Qty</th>
                    <th style={{ padding: '10px 14px', width: '80px' }}>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {editingItems.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#24345C' }}>{item.material}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#5E6B82' }}>{item.requestedQty}</td>
                      <td style={{ padding: '12px 14px' }}>
                        {selectedReq.status === 'PENDING_PLANT_HEAD_APPROVAL' ? (
                          <input type="number" min="0.1" step="0.1" value={item.approvedQty} onChange={(e) => handleQtyChange(idx, e.target.value === '' ? '' : Number(e.target.value))} style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: `1px solid ${Number(item.approvedQty) > 0 ? '#16a34a' : '#dc2626'}`, fontWeight: '800', color: Number(item.approvedQty) > 0 ? '#16a34a' : '#dc2626', fontSize: '14px' }} />
                        ) : (
                          <span style={{ fontWeight: '800', color: '#16a34a' }}>{item.approvedQty}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#5E6B82' }}>{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {editingItems.map((item, idx) => (
                  <div key={idx} style={{ padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontWeight: '800', color: '#24345C', fontSize: '14px' }}>{item.material}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: '#5E6B82' }}>Requested Qty:</span>
                      <strong style={{ color: '#24345C' }}>{item.requestedQty} {item.unit}</strong>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Approved Qty ({item.unit})</label>
                      {selectedReq.status === 'PENDING_PLANT_HEAD_APPROVAL' ? (
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={item.approvedQty}
                          onChange={(e) => handleQtyChange(idx, e.target.value === '' ? '' : Number(e.target.value))}
                          style={{
                            width: '100%',
                            height: '38px',
                            padding: '0 12px',
                            borderRadius: '8px',
                            border: `2px solid ${Number(item.approvedQty) > 0 ? '#16a34a' : '#dc2626'}`,
                            fontWeight: '800',
                            color: Number(item.approvedQty) > 0 ? '#16a34a' : '#dc2626',
                            fontSize: '15px',
                            background: '#fff',
                            boxSizing: 'border-box'
                          }}
                        />
                      ) : (
                        <strong style={{ color: '#16a34a', fontSize: '15px' }}>{item.approvedQty} {item.unit}</strong>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedReq.status === 'PENDING_PLANT_HEAD_APPROVAL' ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                <button onClick={() => handleApprove('Rejected')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px 20px', borderRadius: '10px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                  <XCircle size={16} /> Reject Request
                </button>
                <button disabled={editingItems.some(i => !Number.isFinite(Number(i.approvedQty)) || Number(i.approvedQty) <= 0)} onClick={() => handleApprove('Approved')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px 24px', borderRadius: '10px', border: 'none', background: editingItems.every(i => Number(i.approvedQty) > 0) ? '#16a34a' : '#94a3b8', color: '#fff', fontWeight: '700', cursor: editingItems.every(i => Number(i.approvedQty) > 0) ? 'pointer' : 'not-allowed', fontSize: '13px' }}>
                  <CheckCircle size={16} /> Approve & Authorize Store Issue
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelectedReq(null)} style={{ width: isMobile ? '100%' : 'auto', padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#24345C', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
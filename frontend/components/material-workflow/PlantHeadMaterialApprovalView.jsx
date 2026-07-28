'use client';

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useShallow } from 'zustand/react/shallow';
import { useERPStore } from '../../store/erpStore';
import {
  approveMaterialRequest,
  rejectMaterialRequest,
  selectPlantHeadHistoryRequests,
  selectPlantHeadPendingRequests
} from '../../store/materialFlow';
import { CheckCircle, XCircle, Eye, ShieldCheck, CheckSquare, Clock } from 'lucide-react';

export default function PlantHeadMaterialApprovalView() {
  const submittedList = useERPStore(useShallow(s => selectPlantHeadPendingRequests(s.state)));
  const allList = useERPStore(useShallow(s => selectPlantHeadHistoryRequests(s.state)));

  const [activeTab, setActiveTab] = useState('Pending Approval');
  const [selectedReq, setSelectedReq] = useState(null);
  const [editingItems, setEditingItems] = useState([]);

  const displayList = activeTab === 'Pending Approval' ? submittedList : allList;

  const handleOpenReview = (mr) => {
    setSelectedReq(mr);
    setEditingItems(mr.items.map(i => ({
      ...i,
      approvedQty: i.approvedQty !== undefined && i.approvedQty !== null ? i.approvedQty : i.requestedQty
    })));
  };

  const handleQtyChange = (index, val) => {
    setEditingItems(prev => prev.map((item, idx) => idx === index ? { ...item, approvedQty: val } : item));
  };

  const handleApprove = (status) => {
    if (!selectedReq) return;
    if (status === 'Approved' && editingItems.some(i => i.approvedQty < 0)) {
      Swal.fire({ icon: 'error', title: 'Invalid Quantity', text: 'Approved quantity cannot be negative.' });
      return;
    }
    Swal.fire({
      title: `${status} Request?`,
      text: status === 'Approved'
        ? `Approve material requisition ${selectedReq.requestNo}? Store will be authorized to issue materials.`
        : `Are you sure you want to REJECT ${selectedReq.requestNo}?`,
      icon: status === 'Approved' ? 'success' : 'warning',
      showCancelButton: true,
      confirmButtonColor: status === 'Approved' ? '#16a34a' : '#dc2626',
      confirmButtonText: `Yes, ${status}`
    }).then(res => {
      if (res.isConfirmed) {
        if (status === 'Approved') {
          approveMaterialRequest(selectedReq.id, editingItems, 'Plant Head');
        } else {
          rejectMaterialRequest(selectedReq.id, 'Plant Head');
        }
        Swal.fire(status === 'Approved' ? 'Approved!' : 'Rejected', `Request ${selectedReq.requestNo} status updated to ${status}.`, 'success');
        setSelectedReq(null);
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', padding: '8px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #DCE5F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#24345C', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={24} style={{ color: '#16a34a' }} />
            Material Approval Board (Plant Head)
          </h1>
          <p style={{ fontSize: '13px', color: '#5E6B82', margin: '4px 0 0 0' }}>
            Step 3: Review raw material requisitions from production floor — Submitted → Approved / Rejected
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['Pending Approval', 'All History'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 18px', borderRadius: '10px', border: `1px solid ${activeTab === tab ? '#16a34a' : '#D6E2F0'}`, background: activeTab === tab ? '#16a34a' : '#fff', color: activeTab === tab ? '#fff' : '#334155', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {tab === 'Pending Approval' ? <Clock size={16} /> : <CheckSquare size={16} />}
              {tab} ({tab === 'Pending Approval' ? submittedList.length : allList.length})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #DCE5F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F5FAFE', borderBottom: '1px solid #DCE5F0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Request No</th>
                <th style={{ padding: '14px 20px' }}>Date</th>
                <th style={{ padding: '14px 20px' }}>Work Order</th>
                <th style={{ padding: '14px 20px' }}>Requester</th>
                <th style={{ padding: '14px 20px' }}>Items</th>
                <th style={{ padding: '14px 20px' }}>Priority</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayList.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#8893A7', fontSize: '14px' }}>
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
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#334155', fontWeight: '600' }}>{mr.requester || 'Production Team'}</td>
                      <td style={{ padding: '16px 20px', fontWeight: '700' }}>{mr.items?.length || 0} items</td>
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
      </div>

      {/* Review Modal */}
      {selectedReq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '720px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', padding: '28px', border: '1px solid #DCE5F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #DCE5F0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#16a34a' }}>Plant Head Approval Review</span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0 0 0', color: '#24345C', fontFamily: 'monospace' }}>{selectedReq.requestNo}</h2>
              </div>
              <button onClick={() => setSelectedReq(null)} style={{ background: '#F5FAFE', border: '1px solid #D6E2F0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: '700' }}>Close</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px', fontSize: '13px', background: '#F5FAFE', padding: '14px', borderRadius: '12px' }}>
              <div><strong>Requester:</strong> {selectedReq.requester}</div>
              <div><strong>Work Order:</strong> {selectedReq.workOrderNo || '—'}</div>
              <div><strong>Priority:</strong> <span style={{ fontWeight: '800' }}>{selectedReq.priority}</span></div>
              <div style={{ gridColumn: 'span 3' }}><strong>Warehouse:</strong> {selectedReq.warehouse}</div>
              {selectedReq.notes && (
                <div style={{ gridColumn: 'span 3', color: '#92400e', background: '#fffbeb', padding: '10px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <strong>Floor Notes:</strong> {selectedReq.notes}
                </div>
              )}
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#24345C', marginBottom: '12px' }}>
              Authorize Material Quantities {selectedReq.status === 'PENDING_PLANT_HEAD_APPROVAL' ? '(Adjust & Approve)' : '(Read Only)'}
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '24px' }}>
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
                        <input type="number" min="0" step="0.1" value={item.approvedQty} onChange={(e) => handleQtyChange(idx, Number(e.target.value))} style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #16a34a', fontWeight: '800', color: '#16a34a', fontSize: '14px' }} />
                      ) : (
                        <span style={{ fontWeight: '800', color: '#16a34a' }}>{item.approvedQty}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#5E6B82' }}>{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {selectedReq.status === 'PENDING_PLANT_HEAD_APPROVAL' ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => handleApprove('Rejected')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontWeight: '700', cursor: 'pointer' }}>
                  <XCircle size={16} /> Reject Request
                </button>
                <button onClick={() => handleApprove('Approved')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                  <CheckCircle size={16} /> Approve & Authorize Store Issue
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelectedReq(null)} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#24345C', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useMaterialRequests, useUpdateMaterialRequestStatus } from '../../hooks/useMaterialRequests';
import { RefreshCw, CheckCircle, Clock, Eye, CheckCheck } from 'lucide-react';

export default function StoreMaterialReturnVerificationView() {
  const { data: materialRequests = [] } = useMaterialRequests();
  const updateStatus = useUpdateMaterialRequestStatus();

  const [activeTab, setActiveTab] = useState('Awaiting Verification');
  const [selectedReq, setSelectedReq] = useState(null);
  const [editingItems, setEditingItems] = useState([]);

  const pendingReturnList = materialRequests.filter(mr => mr.status === 'RETURN_PENDING');
  const verifiedList = materialRequests.filter(mr => ['RETURNED', 'CLOSED'].includes(mr.status));

  const displayList = activeTab === 'Awaiting Verification' ? pendingReturnList : verifiedList;

  const handleOpenVerification = (mr) => {
    setSelectedReq(mr);
    setEditingItems(mr.items.map(i => ({
      ...i,
      returnedQty: i.returnedQty !== undefined ? i.returnedQty : 0
    })));
  };

  const handleQtyChange = (index, val) => {
    setEditingItems(prev => prev.map((item, idx) => idx === index ? { ...item, returnedQty: val } : item));
  };

  const handleAcceptSubmit = () => {
    if (!selectedReq) return;

    Swal.fire({
      title: 'Accept Material Return?',
      text: `Confirm receipt of returned raw materials from ${selectedReq.requestNo} back into store godown stock? Status will change to 'Returned'.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0369a1',
      confirmButtonText: 'Yes, Verify & Accept Return'
    }).then(async res => {
      if (res.isConfirmed) {
        await updateStatus.mutateAsync({ id: selectedReq.id, status: 'RETURNED', items: editingItems });
        Swal.fire('Return Verified!', `${selectedReq.requestNo} status updated to 'Returned' and stock reconciled.`, 'success');
        setSelectedReq(null);
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', padding: '8px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #DCE5F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#24345C', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCheck size={24} style={{ color: '#0369a1' }} />
            Return Verification Board (Store Team)
          </h1>
          <p style={{ fontSize: '13px', color: '#5E6B82', margin: '4px 0 0 0' }}>
            Step 8: Inspect and accept returned surplus materials back into store godown — Return Pending → Returned
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('Awaiting Verification')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: `1px solid ${activeTab === 'Awaiting Verification' ? '#0369a1' : '#D6E2F0'}`,
              background: activeTab === 'Awaiting Verification' ? '#0369a1' : '#fff',
              color: activeTab === 'Awaiting Verification' ? '#fff' : '#334155',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Clock size={16} /> Pending Store Acceptance ({pendingReturnList.length})
          </button>
          <button
            onClick={() => setActiveTab('Verified Returns History')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: `1px solid ${activeTab === 'Verified Returns History' ? '#24345C' : '#D6E2F0'}`,
              background: activeTab === 'Verified Returns History' ? '#24345C' : '#fff',
              color: activeTab === 'Verified Returns History' ? '#fff' : '#334155',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle size={16} /> Accepted History ({verifiedList.length})
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #DCE5F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F5FAFE', borderBottom: '1px solid #DCE5F0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Request No</th>
                <th style={{ padding: '14px 20px' }}>Date</th>
                <th style={{ padding: '14px 20px' }}>Work Order</th>
                <th style={{ padding: '14px 20px' }}>Requester</th>
                <th style={{ padding: '14px 20px' }}>Returned Items Summary</th>
                <th style={{ padding: '14px 20px' }}>Priority</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#8893A7', fontSize: '14px' }}>
                    {activeTab === 'Awaiting Verification' ? '✨ No pending material returns awaiting store acceptance.' : 'No verified return history.'}
                  </td>
                </tr>
              ) : (
                displayList.map(mr => {
                  const isPending = mr.status === 'Return Pending';
                  return (
                    <tr key={mr.id} style={{ borderBottom: '1px solid #f1f5f9', background: isPending ? '#fff' : '#F5FAFE' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '800', fontFamily: 'monospace', color: '#24345C' }}>{mr.requestNo}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#5E6B82' }}>{mr.requestDate}</td>
                      <td style={{ padding: '16px 20px', fontWeight: '700', color: '#2563eb' }}>{mr.workOrderNo || '—'}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#334155', fontWeight: '600' }}>{mr.requester || 'Production Floor'}</td>
                      <td style={{ padding: '16px 20px', fontWeight: '700' }}>
                        {mr.items?.filter(i => i.returnedQty > 0).map(i => `${i.material}: ${i.returnedQty} ${i.unit}`).join(', ') || 'See items'}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800',
                          background: mr.priority === 'Urgent' ? '#fff1f2' : mr.priority === 'High' ? '#fffbeb' : '#F5FAFE',
                          color: mr.priority === 'Urgent' ? '#e11d48' : mr.priority === 'High' ? '#d97706' : '#475569'
                        }}>
                          {mr.priority}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '800',
                          background: isPending ? '#fff1f2' : '#e0f2fe',
                          color: isPending ? '#e11d48' : '#0369a1',
                          border: `1px solid ${isPending ? '#fecdd3' : '#7dd3fc'}`
                        }}>
                          {mr.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenVerification(mr)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: isPending ? 'none' : '1px solid #D6E2F0',
                            background: isPending ? '#0369a1' : '#fff',
                            color: isPending ? '#fff' : '#334155',
                            fontWeight: '700',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: isPending ? '0 4px 10px rgba(3, 105, 161, 0.2)' : 'none'
                          }}
                        >
                          <Eye size={15} /> {isPending ? 'Verify & Accept' : 'View Return Note'}
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

      {/* Modal */}
      {selectedReq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '700px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', padding: '28px', border: '1px solid #DCE5F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #DCE5F0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#0369a1' }}>Store Return Verification Slip</span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0 0 0', color: '#24345C', fontFamily: 'monospace' }}>{selectedReq.requestNo}</h2>
              </div>
              <button onClick={() => setSelectedReq(null)} style={{ background: '#F5FAFE', border: '1px solid #D6E2F0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: '700' }}>Close</button>
            </div>

            {selectedReq.notes && (
              <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', color: '#9f1239' }}>
                <strong>Return Note from Floor:</strong> {selectedReq.notes}
              </div>
            )}

            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#24345C', marginBottom: '12px' }}>
              Verify Physical Quantity Accepted Back Into Store Godown
            </h3>

            <div style={{ overflowX: 'auto', marginBottom: '24px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', minWidth: '460px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                    <th style={{ padding: '10px 14px' }}>Material Item</th>
                    <th style={{ padding: '10px 14px', width: '110px' }}>Received</th>
                    <th style={{ padding: '10px 14px', width: '110px' }}>Consumed</th>
                    <th style={{ padding: '10px 14px', width: '150px' }}>Returned Qty</th>
                    <th style={{ padding: '10px 14px', width: '60px' }}>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {editingItems.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#24345C' }}>{item.material}</td>
                      <td style={{ padding: '12px 14px', color: '#0284c7' }}>{item.receivedQty}</td>
                      <td style={{ padding: '12px 14px', color: '#7c3aed' }}>{item.consumedQty}</td>
                      <td style={{ padding: '12px 14px' }}>
                        {selectedReq.status === 'Return Pending' ? (
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={item.returnedQty}
                            onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                            style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #0369a1', fontWeight: '800', color: '#0369a1', fontSize: '14px' }}
                          />
                        ) : (
                          <span style={{ fontWeight: '800', color: '#0369a1' }}>{item.returnedQty}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#5E6B82' }}>{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedReq.status === 'Return Pending' ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={handleAcceptSubmit}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#0369a1', color: '#fff', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(3, 105, 161, 0.25)' }}
                >
                  Confirm Godown Stock Acceptance
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelectedReq(null)} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#24345C', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

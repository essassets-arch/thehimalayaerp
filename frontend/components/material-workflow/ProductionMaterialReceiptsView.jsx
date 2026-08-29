'use client';

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useMaterialRequests, useUpdateMaterialRequestStatus } from '../../hooks/useMaterialRequests';
import { PackageCheck, CheckCircle, Clock, Eye } from 'lucide-react';

export default function ProductionMaterialReceiptsView() {
  const { data: materialRequests = [] } = useMaterialRequests();
  const updateStatus = useUpdateMaterialRequestStatus();

  const [activeTab, setActiveTab] = useState('Pending Receipt');
  const [selectedReq, setSelectedReq] = useState(null);
  const [editingItems, setEditingItems] = useState([]);

  const pendingList = materialRequests.filter(mr => ['ISSUED_TO_PRODUCTION', 'ISSUED'].includes(mr.status));
  const receivedList = materialRequests.filter(mr => ['RECEIVED', 'CONSUMING', 'RETURN_PENDING', 'RETURNED', 'CLOSED'].includes(mr.status));
  const displayList = activeTab === 'Pending Receipt' ? pendingList : receivedList;

  const handleOpenReceipt = (mr) => {
    setSelectedReq(mr);
    setEditingItems(mr.items.map(i => ({
      ...i,
      receivedQty: i.receivedQty !== undefined && i.receivedQty > 0 ? i.receivedQty : i.issuedQty
    })));
  };

  const handleQtyChange = (index, val) => {
    setEditingItems(prev => prev.map((item, idx) => idx === index ? { ...item, receivedQty: val } : item));
  };

  const handleReceiptConfirm = () => {
    if (!selectedReq) return;
    Swal.fire({
      title: 'Confirm Material Receipt?',
      text: `Confirm all issued materials for ${selectedReq.requestNo} arrived on production floor?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0284c7',
      confirmButtonText: 'Yes, Confirm Receipt'
    }).then(async res => {
      if (res.isConfirmed) {
        await updateStatus.mutateAsync({ id: selectedReq.id, status: 'RECEIVED', items: editingItems });
        Swal.fire('Confirmed!', `${selectedReq.requestNo} status updated to 'Received'.`, 'success');
        setSelectedReq(null);
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', padding: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #DCE5F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#24345C', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PackageCheck size={24} style={{ color: '#0284c7' }} />
            Material Receipt Confirmation (Production Floor)
          </h1>
          <p style={{ fontSize: '13px', color: '#5E6B82', margin: '4px 0 0 0' }}>
            Step 5: Verify and accept physical materials delivered by store — Issued → Received
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['Pending Receipt', 'Received History'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 18px', borderRadius: '10px', border: `1px solid ${activeTab === tab ? '#0284c7' : '#D6E2F0'}`, background: activeTab === tab ? '#0284c7' : '#fff', color: activeTab === tab ? '#fff' : '#334155', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {tab === 'Pending Receipt' ? <Clock size={16} /> : <CheckCircle size={16} />}
              {tab} ({tab === 'Pending Receipt' ? pendingList.length : receivedList.length})
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #DCE5F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F5FAFE', borderBottom: '1px solid #DCE5F0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Request No</th>
                <th style={{ padding: '14px 20px' }}>Date</th>
                <th style={{ padding: '14px 20px' }}>Sales Order</th>
                <th style={{ padding: '14px 20px' }}>Requester</th>
                <th style={{ padding: '14px 20px' }}>Issued Items</th>
                <th style={{ padding: '14px 20px' }}>Priority</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayList.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#8893A7', fontSize: '14px' }}>
                  {activeTab === 'Pending Receipt' ? '✨ No materials currently in transit awaiting floor confirmation.' : 'No received history.'}
                </td></tr>
              ) : (
                displayList.map(mr => {
                  const isPending = mr.status === 'Issued' || mr.status === 'Partially Issued';
                  return (
                    <tr key={mr.id} style={{ borderBottom: '1px solid #f1f5f9', background: isPending ? '#fff' : '#F5FAFE' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '800', fontFamily: 'monospace', color: '#24345C' }}>{mr.requestNo}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#5E6B82' }}>{mr.requestDate}</td>
                      <td style={{ padding: '16px 20px', fontWeight: '700', color: '#2563eb' }}>{mr.workOrderNo || '—'}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#334155', fontWeight: '600' }}>{mr.requester || 'Production Floor'}</td>
                      <td style={{ padding: '16px 20px', fontWeight: '700' }}>{mr.items?.map(i => `${i.material} (${i.issuedQty} ${i.unit})`).join(', ')}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', background: mr.priority === 'Urgent' ? '#fff1f2' : mr.priority === 'High' ? '#fffbeb' : '#F5FAFE', color: mr.priority === 'Urgent' ? '#e11d48' : mr.priority === 'High' ? '#d97706' : '#475569' }}>
                          {mr.priority}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', background: isPending ? '#ecfdf5' : '#f0f9ff', color: isPending ? '#059669' : '#0284c7', border: `1px solid ${isPending ? '#a7f3d0' : '#bae6fd'}` }}>
                          {mr.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button onClick={() => handleOpenReceipt(mr)} style={{ padding: '8px 16px', borderRadius: '8px', border: isPending ? 'none' : '1px solid #D6E2F0', background: isPending ? '#0284c7' : '#fff', color: isPending ? '#fff' : '#334155', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {isPending ? <PackageCheck size={15} /> : <Eye size={15} />}
                          {isPending ? 'Confirm Receipt' : 'View Details'}
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

      {selectedReq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '700px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', padding: '28px', border: '1px solid #DCE5F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #DCE5F0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#0284c7' }}>Floor Delivery Verification</span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0 0 0', color: '#24345C', fontFamily: 'monospace' }}>{selectedReq.requestNo}</h2>
              </div>
              <button onClick={() => setSelectedReq(null)} style={{ background: '#F5FAFE', border: '1px solid #D6E2F0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: '700' }}>Close</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '24px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                  <th style={{ padding: '10px 14px' }}>Material</th>
                  <th style={{ padding: '10px 14px', width: '120px' }}>Issued</th>
                  <th style={{ padding: '10px 14px', width: '150px' }}>Received Qty</th>
                  <th style={{ padding: '10px 14px', width: '70px' }}>Unit</th>
                </tr>
              </thead>
              <tbody>
                {editingItems.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#24345C' }}>{item.material}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '800', color: '#059669' }}>{item.issuedQty}</td>
                    <td style={{ padding: '12px 14px' }}>
                      {(selectedReq.status === 'Issued' || selectedReq.status === 'Partially Issued') ? (
                        <input type="number" min="0" max={item.issuedQty} step="0.1" value={item.receivedQty} onChange={(e) => handleQtyChange(idx, Number(e.target.value))} style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #0284c7', fontWeight: '800', color: '#0284c7', fontSize: '14px' }} />
                      ) : (
                        <span style={{ fontWeight: '800', color: '#0284c7' }}>{item.receivedQty}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#5E6B82' }}>{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(selectedReq.status === 'Issued' || selectedReq.status === 'Partially Issued') ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleReceiptConfirm} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                  <CheckCircle size={16} /> Confirm Receipt on Shop Floor
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

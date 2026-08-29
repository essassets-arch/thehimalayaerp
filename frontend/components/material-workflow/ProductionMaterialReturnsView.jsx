'use client';

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useMaterialRequests, useUpdateMaterialRequestStatus } from '../../hooks/useMaterialRequests';
import { RefreshCw, Clock, Eye, CheckCircle } from 'lucide-react';

export default function ProductionMaterialReturnsView() {
  const { data: materialRequests = [] } = useMaterialRequests();
  const updateStatus = useUpdateMaterialRequestStatus();

  const [activeTab, setActiveTab] = useState('Return Eligible');
  const [selectedReq, setSelectedReq] = useState(null);
  const [editingItems, setEditingItems] = useState([]);
  const [returnNotes, setReturnNotes] = useState('');

  const eligibleList = materialRequests.filter(mr => ['CONSUMING', 'RECEIVED'].includes(mr.status));
  const historyList = materialRequests.filter(mr => ['RETURN_PENDING', 'RETURNED', 'CLOSED'].includes(mr.status));

  const displayList = activeTab === 'Return Eligible' ? eligibleList : historyList;

  const handleOpenReturn = (mr) => {
    setSelectedReq(mr);
    setEditingItems(mr.items.map(i => ({
      ...i,
      returnedQty: i.returnedQty !== undefined && i.returnedQty > 0 ? i.returnedQty : Math.max(0, (i.receivedQty || 0) - (i.consumedQty || 0))
    })));
    setReturnNotes('');
  };

  const handleQtyChange = (index, val) => {
    setEditingItems(prev => prev.map((item, idx) => idx === index ? { ...item, returnedQty: val } : item));
  };

  const handleReturnSubmit = () => {
    if (!selectedReq) return;

    if (editingItems.every(i => i.returnedQty <= 0)) {
      Swal.fire({ icon: 'warning', title: 'No Return Quantity', text: 'Please enter at least one item with returned quantity greater than 0.' });
      return;
    }

    Swal.fire({
      title: 'Return Unused Materials?',
      text: `Initiate return slip for ${selectedReq.requestNo}? Store team will be notified to verify and accept return. Status will change to 'Return Pending'.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Yes, Submit Return'
    }).then(async res => {
      if (res.isConfirmed) {
        await updateStatus.mutateAsync({
          id: selectedReq.id,
          status: 'RETURN_PENDING',
          items: editingItems,
          metadata: { returnNotes },
        });
        Swal.fire('Return Initiated!', `${selectedReq.requestNo} status set to 'Return Pending'.`, 'success');
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
            <RefreshCw size={24} style={{ color: '#e11d48' }} />
            Return Unused Floor Materials (Production)
          </h1>
          <p style={{ fontSize: '13px', color: '#5E6B82', margin: '4px 0 0 0' }}>
            Step 7: Return surplus raw materials from shop floor back to store — Consuming → Return Pending
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('Return Eligible')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: `1px solid ${activeTab === 'Return Eligible' ? '#e11d48' : '#D6E2F0'}`,
              background: activeTab === 'Return Eligible' ? '#e11d48' : '#fff',
              color: activeTab === 'Return Eligible' ? '#fff' : '#334155',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Clock size={16} /> Eligible Batches ({eligibleList.length})
          </button>
          <button
            onClick={() => setActiveTab('Return History')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: `1px solid ${activeTab === 'Return History' ? '#24345C' : '#D6E2F0'}`,
              background: activeTab === 'Return History' ? '#24345C' : '#fff',
              color: activeTab === 'Return History' ? '#fff' : '#334155',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle size={16} /> Returns History ({historyList.length})
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
                <th style={{ padding: '14px 20px' }}>Sales Order</th>
                <th style={{ padding: '14px 20px' }}>Requester</th>
                <th style={{ padding: '14px 20px' }}>Material Balance Summary</th>
                <th style={{ padding: '14px 20px' }}>Priority</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#8893A7', fontSize: '14px' }}>
                    {activeTab === 'Return Eligible' ? '📦 No active/consuming batches with returnable excess materials.' : 'No return history.'}
                  </td>
                </tr>
              ) : (
                displayList.map(mr => {
                  const canReturn = mr.status === 'Consuming' || mr.status === 'Received';
                  return (
                    <tr key={mr.id} style={{ borderBottom: '1px solid #f1f5f9', background: canReturn ? '#fff' : '#F5FAFE' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '800', fontFamily: 'monospace', color: '#24345C' }}>{mr.requestNo}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#5E6B82' }}>{mr.requestDate}</td>
                      <td style={{ padding: '16px 20px', fontWeight: '700', color: '#2563eb' }}>{mr.workOrderNo || '—'}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#334155', fontWeight: '600' }}>{mr.requester || 'Production Floor'}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#24345C' }}>
                            {mr.items?.map(i => `${i.material} (Rcv: ${i.receivedQty}, Csm: ${i.consumedQty})`).join(' | ')}
                          </span>
                        </div>
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
                          background: canReturn ? '#fff1f2' : '#e0f2fe',
                          color: canReturn ? '#e11d48' : '#0369a1',
                          border: `1px solid ${canReturn ? '#fecdd3' : '#7dd3fc'}`
                        }}>
                          {mr.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenReturn(mr)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: canReturn ? 'none' : '1px solid #D6E2F0',
                            background: canReturn ? '#e11d48' : '#fff',
                            color: canReturn ? '#fff' : '#334155',
                            fontWeight: '700',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: canReturn ? '0 4px 10px rgba(225, 29, 72, 0.2)' : 'none'
                          }}
                        >
                          <RefreshCw size={15} /> {canReturn ? 'Return Material' : 'View Return Note'}
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
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#e11d48' }}>Floor Return Note Slip</span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0 0 0', color: '#24345C', fontFamily: 'monospace' }}>{selectedReq.requestNo}</h2>
              </div>
              <button onClick={() => setSelectedReq(null)} style={{ background: '#F5FAFE', border: '1px solid #D6E2F0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: '700' }}>Close</button>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#24345C', marginBottom: '12px' }}>
              Specify Unused / Leftover Quantities to Return to Store
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                  <th style={{ padding: '10px 14px' }}>Material Item</th>
                  <th style={{ padding: '10px 14px', width: '110px' }}>Received</th>
                  <th style={{ padding: '10px 14px', width: '110px' }}>Consumed</th>
                  <th style={{ padding: '10px 14px', width: '150px' }}>Return Qty</th>
                  <th style={{ padding: '10px 14px', width: '60px' }}>Unit</th>
                </tr>
              </thead>
              <tbody>
                {editingItems.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#24345C' }}>{item.material}</td>
                    <td style={{ padding: '12px 14px', color: '#0284c7', fontWeight: '700' }}>{item.receivedQty}</td>
                    <td style={{ padding: '12px 14px', color: '#7c3aed', fontWeight: '700' }}>{item.consumedQty}</td>
                    <td style={{ padding: '12px 14px' }}>
                      {(selectedReq.status === 'Consuming' || selectedReq.status === 'Received') ? (
                        <input
                          type="number"
                          min="0"
                          max={(item.receivedQty || 0) - (item.consumedQty || 0)}
                          step="0.1"
                          value={item.returnedQty}
                          onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                          style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #e11d48', fontWeight: '800', color: '#e11d48', fontSize: '14px' }}
                        />
                      ) : (
                        <span style={{ fontWeight: '800', color: '#e11d48' }}>{item.returnedQty}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#5E6B82' }}>{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(selectedReq.status === 'Consuming' || selectedReq.status === 'Received') ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#5E6B82', marginBottom: '6px' }}>Return Explanation / Condition Note</label>
                  <input
                    type="text"
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="e.g. Unused bags returned in sealed condition from line Alpha."
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #D6E2F0', fontSize: '13px' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    onClick={handleReturnSubmit}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#e11d48', color: '#fff', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)' }}
                  >
                    <RefreshCw size={16} /> Submit Return Note to Store
                  </button>
                </div>
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

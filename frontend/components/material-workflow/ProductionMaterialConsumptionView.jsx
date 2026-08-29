'use client';

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useMaterialRequests, useUpdateMaterialRequestStatus } from '../../hooks/useMaterialRequests';
import { Flame, Activity, Clock, Eye, Hammer } from 'lucide-react';

export default function ProductionMaterialConsumptionView() {
  const { data: materialRequests = [] } = useMaterialRequests();
  const updateStatus = useUpdateMaterialRequestStatus();

  const [activeTab, setActiveTab] = useState('Active Floor Batches');
  const [selectedReq, setSelectedReq] = useState(null);
  const [editingItems, setEditingItems] = useState([]);

  const activeList = materialRequests.filter(mr => ['RECEIVED', 'CONSUMING'].includes(mr.status));
  const historyList = materialRequests.filter(mr => ['RETURN_PENDING', 'RETURNED', 'CLOSED'].includes(mr.status));
  const displayList = activeTab === 'Active Floor Batches' ? activeList : historyList;

  const handleOpenConsumption = (mr) => {
    setSelectedReq(mr);
    setEditingItems(mr.items.map(i => ({
      ...i,
      consumedQty: i.consumedQty !== undefined && i.consumedQty > 0 ? i.consumedQty : 0
    })));
  };

  const handleQtyChange = (index, val) => {
    setEditingItems(prev => prev.map((item, idx) => idx === index ? { ...item, consumedQty: val } : item));
  };

  const handleLogSubmit = () => {
    if (!selectedReq) return;
    const totalConsumed = editingItems.reduce((acc, i) => acc + i.consumedQty, 0);
    Swal.fire({
      title: 'Log Material Consumption?',
      text: `Update consumed material usage for ${selectedReq.requestNo}? Status will be tracked as 'Consuming'.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      confirmButtonText: 'Yes, Log Consumption'
    }).then(async res => {
      if (res.isConfirmed) {
        await updateStatus.mutateAsync({ id: selectedReq.id, status: 'CONSUMING', items: editingItems });
        Swal.fire('Logged!', `${selectedReq.requestNo} consumption updated (${totalConsumed} total units).`, 'success');
        setSelectedReq(null);
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', padding: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #DCE5F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#24345C', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame size={24} style={{ color: '#7c3aed' }} />
            Material Consumption Log (Shop Floor)
          </h1>
          <p style={{ fontSize: '13px', color: '#5E6B82', margin: '4px 0 0 0' }}>
            Step 6: Track live utilization of raw materials during manufacturing — Received → Consuming
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['Active Floor Batches', 'Consumption History'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 18px', borderRadius: '10px', border: `1px solid ${activeTab === tab ? '#7c3aed' : '#D6E2F0'}`, background: activeTab === tab ? '#7c3aed' : '#fff', color: activeTab === tab ? '#fff' : '#334155', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {tab === 'Active Floor Batches' ? <Activity size={16} /> : <Clock size={16} />}
              {tab} ({tab === 'Active Floor Batches' ? activeList.length : historyList.length})
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
                <th style={{ padding: '14px 20px' }}>Floor Station</th>
                <th style={{ padding: '14px 20px' }}>Consumption Progress</th>
                <th style={{ padding: '14px 20px' }}>Priority</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayList.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#8893A7', fontSize: '14px' }}>
                  {activeTab === 'Active Floor Batches' ? '⚡ No active batches consuming raw materials.' : 'No consumption history.'}
                </td></tr>
              ) : (
                displayList.map(mr => {
                  const isActive = mr.status === 'Received' || mr.status === 'Consuming';
                  const totalRcv = mr.items?.reduce((acc, i) => acc + (i.receivedQty || 0), 0) || 1;
                  const totalCsm = mr.items?.reduce((acc, i) => acc + (i.consumedQty || 0), 0) || 0;
                  const pct = Math.min(100, Math.round((totalCsm / totalRcv) * 100));
                  return (
                    <tr key={mr.id} style={{ borderBottom: '1px solid #f1f5f9', background: isActive ? '#fff' : '#F5FAFE' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '800', fontFamily: 'monospace', color: '#24345C' }}>{mr.requestNo}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#5E6B82' }}>{mr.requestDate}</td>
                      <td style={{ padding: '16px 20px', fontWeight: '700', color: '#2563eb' }}>{mr.workOrderNo || '—'}</td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#334155', fontWeight: '600' }}>{mr.requester || 'Production Floor'}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700' }}>
                            <span>{totalCsm} / {totalRcv} Units Consumed</span>
                            <span style={{ color: '#7c3aed' }}>{pct}%</span>
                          </div>
                          <div style={{ width: '160px', height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#7c3aed', transition: 'width 0.3s' }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', background: mr.priority === 'Urgent' ? '#fff1f2' : mr.priority === 'High' ? '#fffbeb' : '#F5FAFE', color: mr.priority === 'Urgent' ? '#e11d48' : mr.priority === 'High' ? '#d97706' : '#475569' }}>
                          {mr.priority}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', background: isActive ? '#f5f3ff' : '#F5FAFE', color: isActive ? '#7c3aed' : '#475569', border: `1px solid ${isActive ? '#ddd6fe' : '#DCE5F0'}` }}>
                          {mr.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button onClick={() => handleOpenConsumption(mr)} style={{ padding: '8px 16px', borderRadius: '8px', border: isActive ? 'none' : '1px solid #D6E2F0', background: isActive ? '#7c3aed' : '#fff', color: isActive ? '#fff' : '#334155', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {isActive ? <Hammer size={15} /> : <Eye size={15} />}
                          {isActive ? 'Log Consumption' : 'View Log'}
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
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#7c3aed' }}>Shop Floor Consumption Logging</span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0 0 0', color: '#24345C', fontFamily: 'monospace' }}>{selectedReq.requestNo}</h2>
              </div>
              <button onClick={() => setSelectedReq(null)} style={{ background: '#F5FAFE', border: '1px solid #D6E2F0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: '700' }}>Close</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '24px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#475569', textTransform: 'uppercase', fontSize: '11px' }}>
                  <th style={{ padding: '10px 14px' }}>Material</th>
                  <th style={{ padding: '10px 14px', width: '120px' }}>Received</th>
                  <th style={{ padding: '10px 14px', width: '160px' }}>Consumed Qty</th>
                  <th style={{ padding: '10px 14px', width: '70px' }}>Unit</th>
                </tr>
              </thead>
              <tbody>
                {editingItems.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#24345C' }}>{item.material}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0284c7' }}>{item.receivedQty}</td>
                    <td style={{ padding: '12px 14px' }}>
                      {(selectedReq.status === 'Received' || selectedReq.status === 'Consuming') ? (
                        <input type="number" min="0" max={item.receivedQty} step="0.1" value={item.consumedQty} onChange={(e) => handleQtyChange(idx, Number(e.target.value))} style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #7c3aed', fontWeight: '800', color: '#7c3aed', fontSize: '14px' }} />
                      ) : (
                        <span style={{ fontWeight: '800', color: '#7c3aed' }}>{item.consumedQty}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#5E6B82' }}>{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(selectedReq.status === 'Received' || selectedReq.status === 'Consuming') ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleLogSubmit} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                  <Activity size={16} /> Save & Log Consumption
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

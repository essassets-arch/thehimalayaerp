'use client';

import React from 'react';
import Swal from 'sweetalert2';
import { useShallow } from 'zustand/react/shallow';
import { useAuth } from '../../shared/context/AuthContext';
import { useERPStore } from '../../store/erpStore';
import {
  issueCompleteOrderMaterials,
  selectMaterialRequests,
  selectStoreReleaseRequests,
} from '../../store/materialFlow';

const findStock = (inventory, item) =>
  inventory.find((entry) =>
    [entry.id, entry.materialId, entry.code].filter(Boolean).includes(item.materialId) ||
    String(entry.material || entry.name || '').toLowerCase() ===
      String(item.materialName || item.material || '').toLowerCase()
  );

export default function StoreReleasesView() {
  const { user } = useAuth();
  const approved = useERPStore(useShallow((store) => selectStoreReleaseRequests(store.state)));
  const allRequests = useERPStore(useShallow((store) => selectMaterialRequests(store.state)));
  const inventory = useERPStore((store) => store.state.rawInventory || []);
  const orderIds = [...new Set(approved.map((request) => request.orderId))];

  const issueOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Issue Complete Material?',
      text: `Issue every approved material for ${orderId} to Production?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Issue Complete Material',
      confirmButtonColor: '#059669',
    });
    if (!result.isConfirmed) return;
    try {
      const reference = issueCompleteOrderMaterials(orderId, user?.name || 'Store');
      await Swal.fire('Materials Issued', `Issue reference: ${reference}`, 'success');
    } catch (error) {
      await Swal.fire('Cannot issue this order yet', error.message, 'error');
    }
  };

  return <div style={{ padding: 16 }}>
    <h1 style={{ margin: '0 0 6px', fontSize: 24 }}>Store Releases</h1>
    <p style={{ margin: '0 0 20px', color: '#5E6B82' }}>Store-approved requests grouped order-wise for complete issue.</p>
    {orderIds.map((orderId) => {
      const orderRequests = allRequests.filter((request) => request.orderId === orderId);
      const visibleRequests = approved.filter((request) => request.orderId === orderId);
      const canIssueCompleteOrder = orderRequests.length > 0 && orderRequests.every((request) =>
        request.status === 'STORE_APPROVED' && request.items.every((item) => {
          const approvedQty = Number(item.approvedQty || 0);
          const issueQty = Number(item.issueQty || 0);
          return approvedQty > 0 && issueQty === approvedQty;
        })
      );
      return <section key={orderId} style={{ background: '#fff', border: '1px solid #DCE5F0', borderRadius: 12, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ padding: 16, background: '#F5FAFE', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <span><strong>Order ID:</strong> {orderId || '—'}</span>
          <span><strong>Department:</strong> {visibleRequests[0]?.department}</span>
          <span><strong>Request ID:</strong> {visibleRequests.map((request) => request.id).join(', ')}</span>
          <span><strong>Materials:</strong> {visibleRequests.reduce((sum, request) => sum + request.items.length, 0)}</span>
          <span><strong>Status:</strong> Ready to Issue</span>
        </div>
        <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ textAlign: 'left' }}>{['Material', 'Approved Qty', 'Available Stock', 'Issue Qty', 'Status'].map((label) => <th key={label} style={{ padding: 12, borderBottom: '1px solid #DCE5F0' }}>{label}</th>)}</tr></thead>
          <tbody>{visibleRequests.flatMap((request) => request.items.map((item) => {
            const available = Number(findStock(inventory, item)?.stock || 0);
            const ready = Number(item.issueQty || 0) === Number(item.approvedQty || 0);
            return <tr key={`${request.id}-${item.materialId}`}>
              <td style={{ padding: 12 }}>{item.materialName}</td>
              <td style={{ padding: 12 }}>{item.approvedQty} {item.unit}</td>
              <td style={{ padding: 12 }}>{available} {item.unit}</td>
              <td style={{ padding: 12 }}>{item.issueQty} {item.unit}</td>
              <td style={{ padding: 12, color: ready ? '#059669' : '#dc2626' }}>{ready ? 'Ready' : 'Incomplete'}</td>
            </tr>;
          }))}</tbody>
        </table></div>
        <div style={{ padding: 16, borderTop: '1px solid #DCE5F0' }}>
          {!canIssueCompleteOrder && <p style={{ margin: '0 0 10px', color: '#dc2626' }}><strong>Cannot issue this order yet.</strong><br />All requests must be Store approved with complete issue quantities.</p>}
          <button disabled={!canIssueCompleteOrder} onClick={() => issueOrder(orderId)} style={{ border: 0, borderRadius: 8, padding: '10px 16px', background: canIssueCompleteOrder ? '#059669' : '#D6E2F0', color: '#fff', fontWeight: 700, cursor: canIssueCompleteOrder ? 'pointer' : 'not-allowed' }}>Issue Complete Material</button>
        </div>
      </section>;
    })}
    {orderIds.length === 0 && <div style={{ padding: 32, textAlign: 'center', background: '#fff', borderRadius: 12, color: '#5E6B82' }}>No Store-approved orders ready to issue.</div>}
  </div>;
}

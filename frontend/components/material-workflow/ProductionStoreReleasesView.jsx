'use client';

import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useERPStore } from '../../store/erpStore';
import { selectProductionStoreReleases } from '../../store/materialFlow';

export default function ProductionStoreReleasesView() {
  const requests = useERPStore(useShallow((store) =>
    selectProductionStoreReleases(store.state)
  ));

  return <div style={{ padding: 16 }}>
    <h1 style={{ margin: '0 0 6px', fontSize: 24 }}>Production Store Releases</h1>
    <p style={{ margin: '0 0 20px', color: '#5E6B82' }}>Complete materials issued by Store to Production.</p>
    <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid #DCE5F0', borderRadius: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ textAlign: 'left', background: '#F5FAFE' }}>
          {['Issue Ref', 'Order ID', 'Req ID', 'Material', 'Approved Qty', 'Issued Qty', 'Issued By', 'Status'].map((label) => (
            <th key={label} style={{ padding: 12, borderBottom: '1px solid #DCE5F0' }}>{label}</th>
          ))}
        </tr></thead>
        <tbody>
          {requests.length === 0 ? <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#5E6B82' }}>No released materials received yet.</td></tr> :
            requests.flatMap((request) => request.items.map((item) => (
              <tr key={`${request.id}-${item.materialId}`}>
                <td style={{ padding: 12 }}>{request.issueReference}</td>
                <td style={{ padding: 12 }}>{request.orderId || '—'}</td>
                <td style={{ padding: 12 }}>{request.id}</td>
                <td style={{ padding: 12 }}>{item.materialName}</td>
                <td style={{ padding: 12 }}>{item.approvedQty} {item.unit}</td>
                <td style={{ padding: 12 }}>{item.issuedQty} {item.unit}</td>
                <td style={{ padding: 12 }}>{request.issuedBy}</td>
                <td style={{ padding: 12 }}>{request.status}</td>
              </tr>
            )))}
        </tbody>
      </table>
    </div>
  </div>;
}

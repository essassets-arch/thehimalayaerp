'use client';

import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../shared/context/AuthContext';
import { useMaterialRequests, useUpdateMaterialRequestStatus } from '../../hooks/useMaterialRequests';

export default function StoreMaterialIssueView() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Pending');
  const { data = [] } = useMaterialRequests();
  const updateStatus = useUpdateMaterialRequestStatus();
  const pending = data.filter(request => request.status === 'PLANT_HEAD_APPROVED');
  const history = data.filter(request => request.status !== 'PLANT_HEAD_APPROVED' && request.status !== 'SUBMITTED' && request.status !== 'DRAFT');
  const requests = tab === 'Pending' ? pending : history;
  const actor = user?.name || 'Store';

  const approve = async (request) => {
    try {
      await updateStatus.mutateAsync({
        id: request.id,
        status: 'STORE_APPROVED',
        items: request.items.map(item => ({ ...item, issuedQty: item.approvedQty })),
        metadata: { storeApprovedBy: actor },
      });
      await Swal.fire('Store Approved', 'Request moved to Store Releases. Inventory has not been deducted.', 'success');
    } catch (error) {
      await Swal.fire('Cannot approve', error.message, 'error');
    }
  };

  const reject = async (request) => {
    const result = await Swal.fire({
      title: 'Reject Material Request',
      input: 'textarea',
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Insufficient stock available in Store',
      inputValidator: (value) => !value?.trim() ? 'Rejection reason is required.' : undefined,
      showCancelButton: true,
      confirmButtonText: 'Reject',
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    await updateStatus.mutateAsync({
      id: request.id,
      status: 'STORE_REJECTED',
      metadata: { storeRejectedBy: actor, storeRejectionRemarks: result.value },
    });
    await Swal.fire('Rejected', 'Request moved to Store rejection history.', 'success');
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ margin: '0 0 6px', fontSize: 24 }}>Store Material Requests</h1>
      <p style={{ margin: '0 0 16px', color: '#5E6B82' }}>Plant Head approved requests ready for Store stock verification.</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {['Pending', 'History'].map((label) => (
          <button key={label} onClick={() => setTab(label)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #D6E2F0', background: tab === label ? '#0f766e' : '#fff', color: tab === label ? '#fff' : '#334155', fontWeight: 700, cursor: 'pointer' }}>
            {label === 'History' ? 'History (Approved & Rejected)' : label}
          </button>
        ))}
      </div>
      <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid #DCE5F0', borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#F5FAFE', textAlign: 'left' }}>
            {['Req ID', 'Material', 'Department', 'Approved Qty', 'Status', 'Action'].map((label) => (
              <th key={label} style={{ padding: 14, borderBottom: '1px solid #DCE5F0' }}>{label}</th>
            ))}
          </tr></thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#5E6B82' }}>
                {tab === 'Pending' ? 'No approved material requests available for release.' : 'No processed material requests in history.'}
              </td></tr>
            ) : requests.flatMap((request) => {
              return request.items.map((item, index) => (
                <tr key={`${request.id}-${item.materialId || index}`}>
                  <td style={{ padding: 14, borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>{request.id}</td>
                  <td style={{ padding: 14, borderBottom: '1px solid #f1f5f9' }}>{item.materialName}</td>
                  <td style={{ padding: 14, borderBottom: '1px solid #f1f5f9' }}>{request.department}</td>
                  <td style={{ padding: 14, borderBottom: '1px solid #f1f5f9' }}>{item.approvedQty} {item.unit}</td>
                  <td style={{ padding: 14, borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      background: request.status === 'STORE_REJECTED' ? '#fee2e2' : request.status === 'STORE_APPROVED' ? '#d1fae5' : '#e0f2fe',
                      color: request.status === 'STORE_REJECTED' ? '#991b1b' : request.status === 'STORE_APPROVED' ? '#065f46' : '#0369a1'
                    }}>
                      {request.status === 'STORE_REJECTED' ? 'REJECTED' : request.status === 'STORE_APPROVED' ? 'APPROVED' : request.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: 14, borderBottom: '1px solid #f1f5f9' }}>
                    {tab === 'Pending' && index === 0 && <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => approve(request)} style={{ border: 0, borderRadius: 8, padding: '8px 12px', fontWeight: 700, background: '#059669', color: '#fff', cursor: 'pointer' }}>Approve</button>
                      <button onClick={() => reject(request)} style={{ border: 0, borderRadius: 8, padding: '8px 12px', fontWeight: 700, background: '#dc2626', color: '#fff', cursor: 'pointer' }}>Reject</button>
                    </div>}
                    {tab !== 'Pending' && index === 0 && (
                      <span style={{ fontSize: 13, color: '#475569' }}>
                        {request.status === 'STORE_REJECTED'
                          ? (request.storeRejectionRemarks || request.metadata?.storeRejectionRemarks || 'Rejected by Store')
                          : (request.metadata?.storeApprovedBy ? `Approved by ${request.metadata.storeApprovedBy}` : 'Approved')}
                      </span>
                    )}
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

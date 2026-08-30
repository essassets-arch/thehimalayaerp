'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Pagination states
  const [page, setPage] = useState(1);
  const pageSize = 30;

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [tab]);

  const totalPages = Math.ceil(requests.length / pageSize);
  const paginatedRequests = requests.slice((page - 1) * pageSize, page * pageSize);

  const approve = async (request) => {
    try {
      await updateStatus.mutateAsync({
        id: request.id,
        status: 'STORE_APPROVED',
        items: request.items.map(item => ({ ...item, issuedQty: item.issuedQty || 0 })),
        metadata: { storeApprovedBy: actor },
      });
      const result = await Swal.fire({
        title: 'Store Approved!',
        text: `Material Request ${request.requestNo || request.publicId || request.id} approved and moved to Store Releases. Store user can now issue materials.`,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Go to Store Releases ➔',
        cancelButtonText: 'Stay on this page',
        confirmButtonColor: '#0f766e',
      });
      if (result.isConfirmed) {
        window.location.href = '/store/store-releases';
      }
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
    <div className="m-theme-container" style={{ padding: 16 }}>
      <h1 style={{ margin: '0 0 6px', fontSize: 24 }}>Store Material Requests</h1>
      <p style={{ margin: '0 0 16px', color: '#5E6B82' }}>Plant Head approved requests ready for Store stock verification.</p>
      <div className="low-stock-tab-bar" style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
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
            ) : paginatedRequests.flatMap((request) => {
              return request.items.map((item, index) => (
                <tr key={`${request.id}-${item.materialId || index}`}>
                  <td style={{ padding: 14, borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontFamily: 'monospace', color: '#24345C' }}>{request.requestNo || request.publicId || request.id}</td>
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
      <PaginationControl
        currentPage={page}
        totalPages={totalPages}
        totalItems={requests.length}
        pageSize={pageSize}
        onPageChange={setPage}
        themeColor="#0f766e"
      />
    </div>
  );
}

function PaginationControl({ currentPage, totalPages, totalItems, pageSize, onPageChange, themeColor = '#2F4375' }) {
  if (totalPages <= 1) return null;

  return (
    <div className="store-pagination-control store-pagination-wrap" style={{ padding: '16px 20px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
      <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
        Showing <span style={{ fontWeight: 700, color: '#0F172A' }}>{totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span style={{ fontWeight: 700, color: '#0F172A' }}>{Math.min(currentPage * pageSize, totalItems)}</span> of <span style={{ fontWeight: 700, color: '#0F172A' }}>{totalItems}</span> entries (Page {currentPage} of {totalPages})
      </div>

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button 
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: currentPage === 1 ? '#F1F5F9' : '#FFFFFF', border: '1px solid #CBD5E1', color: currentPage === 1 ? '#94A3B8' : '#334155', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600 }}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pNum = i + 1;
          if (totalPages > 5 && currentPage > 3) {
            pNum = currentPage - 2 + i;
            if (pNum > totalPages) pNum = totalPages - (4 - i);
          }
          return (
            <button
              type="button"
              key={pNum}
              onClick={() => onPageChange(pNum)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: currentPage === pNum ? 'none' : '1px solid #CBD5E1',
                background: currentPage === pNum ? themeColor : '#FFFFFF',
                color: currentPage === pNum ? '#FFFFFF' : '#334155'
              }}
            >
              {pNum}
            </button>
          );
        })}

        <button 
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: currentPage === totalPages ? '#F1F5F9' : '#FFFFFF', border: '1px solid #CBD5E1', color: currentPage === totalPages ? '#94A3B8' : '#334155', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600 }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

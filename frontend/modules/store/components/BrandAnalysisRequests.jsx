import React, { useState, useEffect } from 'react';
import { brandAnalysisService } from '../../../services/brandAnalysisService';
import BrandAnalysisCreateModal from '../../../components/erp/BrandAnalysisCreateModal';
import BrandAnalysisDetailModal from '../../../components/erp/BrandAnalysisDetailModal';
import { Plus, Search, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../../../shared/components/StatusBadge';
import Swal from 'sweetalert2';

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

export default function BrandAnalysisRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Active'); // Active vs History
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await brandAnalysisService.getStoreRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch brand analysis requests', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRefresh = () => {
    fetchRequests();
  };

  // Grouping active vs history
  // Active: Not COMPLETED and not REJECTED
  const isHistoryStatus = (status) => 
    status === 'FINANCE_ANALYSIS_COMPLETED' || 
    status === 'SUPER_ADMIN_REJECTED' || 
    status === 'FINANCE_REJECTED' ||
    status === 'COMPLETED';

  const filteredRequests = requests.filter(req => 
    activeTab === 'History' ? isHistoryStatus(req.status) : !isHistoryStatus(req.status)
  );

  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const paginatedRequests = filteredRequests.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="m-theme-container">
      <div className="m-theme-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="m-theme-title">Brand Analysis Requests</h2>
          <p className="m-theme-subtitle">Manage and submit analysis requests for vendor brands</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          style={{ padding: '8px 16px', background: 'var(--color-primary)', color: '#fff', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> Create Request
        </button>
      </div>

      <div className="m-theme-table-container" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
          {['Active', 'History'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', padding: '12px 4px', cursor: 'pointer',
                fontWeight: activeTab === tab ? '600' : '500',
                color: activeTab === tab ? 'var(--color-primary)' : '#6b7280',
                borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                fontSize: '15px'
              }}
            >
              {tab} Requests
            </button>
          ))}
        </div>

        <div className="store-table-scroll-wrapper">
          <table className="m-theme-table">
            <thead>
              <tr>
                <th>Request No</th>
                <th>Product Name</th>
                <th>Brand</th>
                <th>Requested By</th>
                <th>Required By</th>
                <th>Date Created</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading requests...</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No {activeTab.toLowerCase()} brand analysis requests found.</td></tr>
              ) : (
                paginatedRequests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: '700' }}>{req.requestNo}</td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: '600' }}>{req.productName}</td>
                    <td>{req.brandName}</td>
                    <td>{req.requestedBy?.name || 'Store'}</td>
                    <td>{req.requiredByDate ? new Date(req.requiredByDate).toLocaleDateString() : '-'}</td>
                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'center' }}>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedRequest(req)}
                        style={{ padding: '6px 12px', border: '1px solid #d1d5db', background: '#fff', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginationControl
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredRequests.length}
          pageSize={pageSize}
          onPageChange={setPage}
          themeColor="var(--color-primary)"
        />
      </div>

      {isCreateModalOpen && (
        <BrandAnalysisCreateModal 
          onClose={() => setIsCreateModalOpen(false)}
          onRefresh={handleRefresh}
        />
      )}

      {selectedRequest && (
        <BrandAnalysisDetailModal 
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { brandAnalysisService } from '../../../services/brandAnalysisService';
import BrandAnalysisCreateModal from '../../../components/erp/BrandAnalysisCreateModal';
import BrandAnalysisDetailModal from '../../../components/erp/BrandAnalysisDetailModal';
import { Plus, Search, FileText } from 'lucide-react';
import StatusBadge from '../../../shared/components/StatusBadge';
import Swal from 'sweetalert2';

export default function BrandAnalysisRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Active'); // Active vs History
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

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
              filteredRequests.map((req) => (
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

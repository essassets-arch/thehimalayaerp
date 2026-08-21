import React, { useState, useEffect } from 'react';
import { brandAnalysisService } from '../../../services/brandAnalysisService';
import { Eye, Search } from 'lucide-react';
import BrandAnalysisDetailModal from '../../../components/erp/BrandAnalysisDetailModal';
import StatusBadge from '../../../shared/components/StatusBadge';
import Swal from 'sweetalert2';

export default function FinanceBrandAnalysis() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Pending'); // Pending vs History

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await brandAnalysisService.getFinanceRequests();
      // Finance only sees requests that have passed Super Admin
      const financeVisible = data.filter(req => 
        req.status === 'SUPER_ADMIN_APPROVED' || 
        req.status === 'FINANCE_ANALYSIS_IN_PROGRESS' || 
        req.status === 'FINANCE_ANALYSIS_COMPLETED' || 
        req.status === 'FINANCE_REJECTED' ||
        req.status === 'COMPLETED'
      );
      setRequests(financeVisible);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to load brand analysis requests', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const isHistoryStatus = (status) => 
    status === 'FINANCE_ANALYSIS_COMPLETED' || 
    status === 'FINANCE_REJECTED' ||
    status === 'COMPLETED';

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'History') {
      if (!isHistoryStatus(req.status)) return false;
    } else {
      if (isHistoryStatus(req.status)) return false;
    }

    if (search) {
      const lower = search.toLowerCase();
      if (!req.productName?.toLowerCase().includes(lower) && 
          !req.brandName?.toLowerCase().includes(lower) &&
          !req.requestNo?.toLowerCase().includes(lower)) {
        return false;
      }
    }
    return true;
  });

  const pendingCount = requests.filter(r => !isHistoryStatus(r.status)).length;
  const historyCount = requests.filter(r => isHistoryStatus(r.status)).length;

  return (
    <div className="m-theme-container">
      <div className="m-theme-header" style={{ marginBottom: '24px' }}>
        <h2 className="m-theme-title">Brand Analysis Dashboard</h2>
        <p className="m-theme-subtitle">Review approved requests and provide commercial analysis</p>
      </div>

      <div className="brand-analysis-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fef3c7', padding: '16px 20px', borderRadius: '12px', border: '1px solid #fde68a' }}>
          <div style={{ fontSize: '13px', color: '#92400e', fontWeight: '600' }}>Pending Analysis</div>
          <div style={{ fontSize: '26px', color: '#b45309', fontWeight: 'bold', marginTop: '4px' }}>{pendingCount}</div>
        </div>
        <div style={{ background: '#d1fae5', padding: '16px 20px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
          <div style={{ fontSize: '13px', color: '#065f46', fontWeight: '600' }}>Completed Analysis</div>
          <div style={{ fontSize: '26px', color: '#047857', fontWeight: 'bold', marginTop: '4px' }}>{historyCount}</div>
        </div>
      </div>

      <div className="m-theme-table-container">
        <div className="brand-analysis-filter-bar" style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Pending', 'History'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none', border: 'none', padding: '8px 4px', cursor: 'pointer',
                  fontWeight: activeTab === tab ? '600' : '500',
                  color: activeTab === tab ? 'var(--color-primary)' : '#6b7280',
                  borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                  fontSize: '15px'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', width: '250px', flex: '1 1 auto', minWidth: '180px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 10px 8px 36px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none' }}
            />
          </div>
        </div>
        
        <table className="m-theme-table">
          <thead>
            <tr>
              <th>Request No</th>
              <th>Product Name</th>
              <th>Brand</th>
              <th>Quantity</th>
              <th>Date Approved</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : filteredRequests.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No requests found.</td></tr>
            ) : (
              filteredRequests.map((req) => (
                <tr key={req.id}>
                  <td style={{ fontWeight: '700' }}>{req.requestNo}</td>
                  <td style={{ color: 'var(--color-primary)', fontWeight: '600' }}>{req.productName}</td>
                  <td>{req.brandName}</td>
                  <td>{req.quantity} {req.quantityUnit}</td>
                  <td>{new Date(req.updatedAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <StatusBadge status={req.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedRequest(req)}
                      style={{ padding: '6px 12px', border: '1px solid #d1d5db', background: '#fff', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <BrandAnalysisDetailModal 
          request={selectedRequest} 
          onClose={() => setSelectedRequest(null)}
          onRefresh={fetchRequests}
        />
      )}
    </div>
  );
}

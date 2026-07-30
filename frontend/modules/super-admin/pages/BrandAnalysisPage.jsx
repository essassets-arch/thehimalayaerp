'use client';

import React, { useState, useEffect } from 'react';
import { brandAnalysisService } from '../../../services/brandAnalysisService';
import Swal from 'sweetalert2';
import { Search, Download, Eye } from 'lucide-react';
import BrandAnalysisDetailModal from '../../../components/erp/BrandAnalysisDetailModal';
import StatusBadge from '../../../shared/components/StatusBadge';

export default function BrandAnalysisPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await brandAnalysisService.getSuperAdminRequests();
      setRequests(data);
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

  const handleExport = () => {
    // Generate CSV
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Request Number,Product Name,Brand,Quantity,Status,Date\n"
      + requests.map(r => `${r.requestNo},${r.productName},${r.brandName},${r.quantity} ${r.quantityUnit},${r.status},${new Date(r.createdAt).toLocaleDateString()}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "brand_analysis_requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRequests = requests.filter(req => {
    if (statusFilter === 'PENDING') {
      if (req.status !== 'PENDING_SUPER_ADMIN_APPROVAL') return false;
    } else if (statusFilter === 'APPROVED') {
      if (req.status !== 'SUPER_ADMIN_APPROVED') return false;
    } else if (statusFilter === 'REJECTED') {
      if (req.status !== 'SUPER_ADMIN_REJECTED') return false;
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      if (!req.productName?.toLowerCase().includes(lowerSearch) &&
          !req.brandName?.toLowerCase().includes(lowerSearch) &&
          !req.requestNo?.toLowerCase().includes(lowerSearch)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="m-theme-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Brand Analysis Approvals</h1>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Super Admin oversight and approval queue for analysis requests.</p>
        </div>
        <button 
          onClick={handleExport}
          style={{ padding: '10px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {/* Filters */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Search product, brand, or request #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 40px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none' }}
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', background: '#fff' }}
          >
            <option value="ALL">All Requests</option>
            <option value="PENDING">Pending My Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f9fafb', fontSize: '13px', color: '#6b7280', textTransform: 'uppercase' }}>
              <tr>
                <th style={{ padding: '12px 24px', fontWeight: '600' }}>Request No</th>
                <th style={{ padding: '12px 24px', fontWeight: '600' }}>Product & Brand</th>
                <th style={{ padding: '12px 24px', fontWeight: '600' }}>Quantity</th>
                <th style={{ padding: '12px 24px', fontWeight: '600' }}>Date Created</th>
                <th style={{ padding: '12px 24px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '12px 24px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center' }}>Loading...</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No requests found.</td></tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #e5e7eb', fontSize: '14px', color: '#111827' }}>
                    <td style={{ padding: '16px 24px', fontWeight: '600' }}>{req.requestNo}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: '500', color: 'var(--color-primary)' }}>{req.productName}</div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>{req.brandName}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: '500' }}>{req.quantity} {req.quantityUnit}</div>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#6b7280' }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button onClick={() => setSelectedRequest(req)} title="Review Request" style={{ color: '#2563eb', background: '#dbeafe', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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

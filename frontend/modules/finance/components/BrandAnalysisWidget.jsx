import React, { useState, useEffect } from 'react';
import { brandAnalysisService } from '../../../lib/brand-analysis.service';

export default function BrandAnalysisWidget() {
  const [summary, setSummary] = useState({ pending: 0, reviewed: 0, completed: 0 });
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [sumRes, listRes] = await Promise.all([
          brandAnalysisService.getFinanceSummary(),
          brandAnalysisService.findAll({ limit: 5 })
        ]);
        setSummary(sumRes);
        setRequests(listRes?.data || []);
      } catch (err) {
        console.error('Failed to load finance summary', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    const displayMap = {
      'PENDING_SUPER_ADMIN_APPROVAL': 'Pending Super Admin Approval',
      'SUPER_ADMIN_APPROVED': 'Super Admin Approved',
      'SUPER_ADMIN_REJECTED': 'Super Admin Rejected',
      'FINANCE_ANALYSIS_IN_PROGRESS': 'Finance Analysis In Progress',
      'FINANCE_ANALYSIS_COMPLETED': 'Finance Analysis Completed',
      'FINANCE_REJECTED': 'Finance Rejected',
    };
    return displayMap[status] || status.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING_SUPER_ADMIN_APPROVAL':
        return { bg: '#FEF3C7', color: '#92400e', border: '1px solid #fde68a' };
      case 'SUPER_ADMIN_APPROVED':
        return { bg: '#D1FAE5', color: '#065f46', border: '1px solid #a7f3d0' };
      case 'SUPER_ADMIN_REJECTED':
      case 'FINANCE_REJECTED':
        return { bg: '#FEE2E2', color: '#991b1b', border: '1px solid #fecaca' };
      case 'FINANCE_ANALYSIS_IN_PROGRESS':
        return { bg: '#DBEAFE', color: '#1e40af', border: '1px solid #bfdbfe' };
      case 'FINANCE_ANALYSIS_COMPLETED':
        return { bg: '#D1FAE5', color: '#065f46', border: '1px solid #a7f3d0' };
      default:
        return { bg: '#F1F5F9', color: '#475569', border: '1px solid #e2e8f0' };
    }
  };

  const renderStatus = (status) => {
    const style = getStatusStyle(status);
    return (
      <span style={{
        backgroundColor: style.bg,
        color: style.color,
        border: style.border,
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 'bold',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        display: 'inline-block'
      }}>
        {formatStatus(status)}
      </span>
    );
  };

  if (isLoading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Brand Analysis...</div>;

  return (
    <div className="m-theme-card" style={{ marginBottom: '24px' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Brand Analysis Requests (Finance View)</h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Read-only notification ledger</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '20px' }}>
        <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', border: '1px solid #fde68a' }}>
          <div style={{ fontSize: '14px', color: '#92400e', fontWeight: '600' }}>Pending</div>
          <div style={{ fontSize: '24px', color: '#b45309', fontWeight: 'bold' }}>{summary.pending}</div>
        </div>
        <div style={{ background: '#dbeafe', padding: '16px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '14px', color: '#1e40af', fontWeight: '600' }}>Reviewed</div>
          <div style={{ fontSize: '24px', color: '#1d4ed8', fontWeight: 'bold' }}>{summary.reviewed}</div>
        </div>
        <div style={{ background: '#d1fae5', padding: '16px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
          <div style={{ fontSize: '14px', color: '#065f46', fontWeight: '600' }}>Completed</div>
          <div style={{ fontSize: '24px', color: '#047857', fontWeight: 'bold' }}>{summary.completed}</div>
        </div>
      </div>

      <div style={{ padding: '0 20px 20px 20px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#374151' }}>Latest Requests</h4>
        <table className="m-theme-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left', color: '#6b7280', fontSize: '13px' }}>
              <th style={{ padding: '12px' }}>Product</th>
              <th style={{ padding: '12px' }}>PO No</th>
              <th style={{ padding: '12px' }}>Invoice</th>
              <th style={{ padding: '12px' }}>Brand</th>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>No requests found.</td></tr>
            ) : (
              requests.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid #e5e7eb', fontSize: '14px' }}>
                  <td style={{ padding: '12px', fontWeight: '600', color: '#111827' }}>{req.productName}</td>
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>{req.poNumber}</td>
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>{req.invoiceNumber}</td>
                  <td style={{ padding: '12px' }}>{req.brandName}</td>
                  <td style={{ padding: '12px', color: '#6b7280' }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>{renderStatus(req.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

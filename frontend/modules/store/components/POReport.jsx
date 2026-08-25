import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/apiClient';
import { useToast } from '../../../shared/context/ToastContext';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

export default function POReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    fetchPOReport();
  }, []);

  const fetchPOReport = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/procurement/reports/po');
      setReportData(res.data || []);
    } catch (err) {
      console.error('Failed to fetch PO Report:', err);
      error('Failed to load Purchase Order Report from backend');
    } finally {
      setLoading(false);
    }
  };

  const totalPOs = reportData.length;
  const openPOs = reportData.filter(po => ['OPEN', 'PARTIALLY_RECEIVED', 'REPLACEMENT_PENDING', 'REPLACEMENT_UNDER_REVIEW'].includes(po.status)).length;
  const completedPOs = reportData.filter(po => ['COMPLETED', 'CLOSED'].includes(po.status)).length;
  const totalValue = reportData.reduce((sum, po) => sum + (Number(po.totalAmount) || 0), 0);
  const totalPendingDeliveries = reportData.reduce((sum, po) => sum + po.pendingQty, 0);
  const totalRejections = reportData.reduce((sum, po) => sum + po.rejectedQty, 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '40px' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full animation-fade-in porepr-container">
      <style>{`
        .porepr-container { padding: 20px; }
        .porepr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        @media (max-width: 768px) {
          .porepr-container { padding: 8px 4px !important; }
          .porepr-header { flex-direction: column; align-items: stretch; gap: 10px; }
          .porepr-header button { width: 100%; justify-content: center; }
          .porepr-kpi-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
        }
        @media (max-width: 480px) {
          .porepr-kpi-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          .porepr-kpi-grid .m-theme-kpi-card {
            padding: 12px 10px !important;
          }
          .porepr-kpi-grid .m-theme-kpi-value {
            font-size: 18px !important;
          }
        }
      `}</style>
      <div className="porepr-header">
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#101828', margin: 0 }}>Live Purchase Order Report</h3>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>Dynamic aggregation of PO statuses and quantities</p>
        </div>
        <button onClick={fetchPOReport} className="action-btn-secondary">
          Refresh Data
        </button>
      </div>

      <div className="m-theme-kpi-grid porepr-kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="m-theme-kpi-card" style={{ '--card-border-color': '#0ea5e9' }}>
          <span className="m-theme-kpi-label">Total Purchase Orders</span>
          <span className="m-theme-kpi-value">{totalPOs}</span>
        </div>
        <div className="m-theme-kpi-card" style={{ '--card-border-color': '#10b981' }}>
          <span className="m-theme-kpi-label">Completed / Closed</span>
          <span className="m-theme-kpi-value">{completedPOs}</span>
        </div>
        <div className="m-theme-kpi-card" style={{ '--card-border-color': '#f59e0b' }}>
          <span className="m-theme-kpi-label">Open / Pending</span>
          <span className="m-theme-kpi-value">{openPOs}</span>
        </div>
        <div className="m-theme-kpi-card" style={{ '--card-border-color': '#6366f1' }}>
          <span className="m-theme-kpi-label">Total Pending Items</span>
          <span className="m-theme-kpi-value">{(totalPendingDeliveries ?? 0).toLocaleString()} Units</span>
        </div>
        <div className="m-theme-kpi-card" style={{ '--card-border-color': '#ef4444' }}>
          <span className="m-theme-kpi-label">Total Rejections</span>
          <span className="m-theme-kpi-value">{(totalRejections ?? 0).toLocaleString()} Units</span>
        </div>
        <div className="m-theme-kpi-card" style={{ '--card-border-color': '#8b5cf6' }}>
          <span className="m-theme-kpi-label">Total Purchase Value</span>
          <span className="m-theme-kpi-value">₹{(totalValue ?? 0).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="store-table-scroll-wrapper">
        <DataTable
          className="porepr-table"
          columns={[
            { header: 'PO No', accessor: 'poNumber', render: r => <span style={{ fontWeight: 700, color: '#0369a1' }}>{r.poNumber || r.id}</span> },
            { header: 'Ordered At', accessor: 'orderedAt', render: r => r.orderedAt ? new Date(r.orderedAt).toLocaleDateString('en-GB') : '—' },
            { header: 'Vendor', accessor: 'supplierName', render: r => <span>{r.supplierName || r.vendorName || '—'}</span> },
            { header: 'Total Value', accessor: 'totalAmount', render: r => <span style={{ fontWeight: 700 }}>₹{Number(r.totalAmount || 0).toLocaleString('en-IN')}</span> },
            { header: 'Ordered', accessor: 'orderedQty', render: r => <span style={{ fontWeight: 600 }}>{r.orderedQty}</span> },
            { header: 'Received', accessor: 'receivedQty', render: r => <span style={{ color: '#16a34a' }}>{r.receivedQty}</span> },
            { header: 'Rejected', accessor: 'rejectedQty', render: r => <span style={{ color: '#dc2626' }}>{r.rejectedQty}</span> },
            { header: 'Replacement', accessor: 'replacementQty', render: r => <span style={{ color: '#d97706' }}>{r.replacementQty}</span> },
            { header: 'Pending', accessor: 'pendingQty', render: r => <span style={{ fontWeight: 800 }}>{r.pendingQty}</span> },
            { header: 'Status', accessor: 'status', render: r => <StatusBadge status={r.status} /> }
          ]}
          data={reportData}
          emptyMessage="No Purchase Orders found."
        />
      </div>
    </div>
  );
}

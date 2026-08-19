import React, { useState, useEffect, useCallback } from 'react';
import * as Lucide from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';
import { useAuthStore } from '@/store/authStore';
import { 
  exportSalesReportPDF, 
  exportFinanceReportPDF, 
  exportInventoryReportPDF, 
  exportAgingReportPDF 
} from '@/services/export.service';
import "../components/dashboard.css";

// Helper for Indian Currency Formatting
function formatCurrencyCompact(amount) {
  const val = Number(amount || 0);
  if (isNaN(val) || val === 0) return '₹0';
  const absVal = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (absVal >= 10000000) return `${sign}₹${(absVal / 10000000).toFixed(2)} Cr`;
  if (absVal >= 100000) return `${sign}₹${(absVal / 100000).toFixed(2)} L`;
  return `${sign}₹${absVal.toLocaleString('en-IN')}`;
}

function formatPercent(val) {
  const num = Number(val || 0);
  return `${num.toFixed(1)}%`;
}

const PRESET_OPTIONS = [
  { value: 'THIS_MONTH', label: 'This Month' },
  { value: 'TODAY', label: 'Today' },
  { value: 'YESTERDAY', label: 'Yesterday' },
  { value: 'THIS_WEEK', label: 'This Week' },
  { value: 'LAST_WEEK', label: 'Last Week' },
  { value: 'LAST_MONTH', label: 'Last Month' },
  { value: 'THIS_QUARTER', label: 'This Quarter' },
  { value: 'THIS_FINANCIAL_YEAR', label: 'This Financial Year' },
  { value: 'LAST_FINANCIAL_YEAR', label: 'Last Financial Year' },
  { value: 'CUSTOM', label: 'Custom Date Range' },
];

const DEPARTMENT_OPTIONS = [
  { value: '', label: 'All Departments' },
  { value: 'Sales & CRM', label: 'Sales & CRM' },
  { value: 'Production Floor', label: 'Production Floor' },
  { value: 'Plant Head', label: 'Plant Head Approvals' },
  { value: 'Store / Procurement', label: 'Store & Procurement' },
  { value: 'Quality Control', label: 'Quality Control (QC)' },
  { value: 'Dispatch & Logistics', label: 'Dispatch & Logistics' },
  { value: 'Finance & Accounts', label: 'Finance & Accounts' },
  { value: 'HR & Payroll', label: 'HR & Payroll' },
];

export default function BusinessReportsPage() {
  const [filters, setFilters] = useState({
    rangePreset: 'THIS_MONTH',
    startDate: '',
    endDate: '',
    branchId: '',
    department: '',
    customerId: '',
    vendorId: '',
    productId: '',
    status: '',
  });

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [exporting, setExporting] = useState(false);

  const buildReportParams = useCallback(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'All') params.set(key, value);
    });
    return params;
  }, [filters]);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = buildReportParams();
      const payload = await backendFetch(`/api/backend/super-admin/reports?${params}`, { cacheTtlMs: 0 });
      setReport(payload);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load centralized reports:', err);
      setError(err || new Error('Failed to load reports'));
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [buildReportParams]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const downloadCsv = async () => {
    try {
      setExporting(true);
      const params = buildReportParams();
      const token = useAuthStore.getState().accessToken;
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await fetch(`/api/backend/super-admin/reports/export/csv?${params}`, {
        headers,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to download CSV');

      const blob = await response.blob();
      const disposition = response.headers.get('content-disposition');
      const match = disposition?.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || `centralized-business-report.csv`;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export failed:', err);
      alert('Failed to export CSV report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDocumentExport = async (type) => {
    try {
      setExporting(true);
      if (type === 'sales') {
        await exportSalesReportPDF(filters);
      } else if (type === 'finance') {
        await exportFinanceReportPDF(filters);
      } else if (type === 'inventory') {
        await exportInventoryReportPDF(filters);
      } else if (type === 'aging') {
        await exportAgingReportPDF(filters);
      }
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      rangePreset: 'THIS_MONTH',
      startDate: '',
      endDate: '',
      branchId: '',
      department: '',
      customerId: '',
      vendorId: '',
      productId: '',
      status: '',
    });
  };

  const filterOptions = report?.filters || {};
  const period = report?.period || {};
  const isDeptMatch = (deptName) => {
    if (!filters.department || filters.department === '' || filters.department === 'All') return true;
    return deptName.toLowerCase().includes(filters.department.toLowerCase()) || filters.department.toLowerCase().includes(deptName.toLowerCase());
  };

  return (
    <div className="super-dashboard" style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Page Header */}
      <header className="dashboard-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="dashboard-header-left">
          <div className="dashboard-header-icon" style={{ background: '#3b82f6', color: '#fff', borderRadius: '12px', padding: '10px' }}>
            <Lucide.FileSpreadsheet size={28} />
          </div>
          <div className="dashboard-heading">
            <div className="dashboard-heading-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Centralized Business Reports</h1>
              <span className="dashboard-badge badge-info" style={{ background: '#dbeafe', color: '#1e40af', fontWeight: 600, padding: '4px 10px', borderRadius: '20px' }}>
                Real-Time 8-Department Telemetry
              </span>
            </div>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
              Live consolidated analytics across Sales · Production · Plant · Store · QC · Dispatch · Finance · HR
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {lastUpdated && (
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginRight: '8px' }}>
              Last Updated: <strong>{lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
            </span>
          )}

          <button
            onClick={loadReports}
            disabled={loading}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontWeight: 600, cursor: 'pointer' }}
          >
            <Lucide.RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
          </button>

          <button
            onClick={downloadCsv}
            disabled={loading || exporting}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}
          >
            <Lucide.Download size={16} /> {exporting ? 'Exporting...' : 'Download CSV'}
          </button>
        </div>
      </header>

      {/* Filter Control Bar */}
      <div 
        className="dashboard-card" 
        style={{ 
          padding: '16px 20px', 
          marginBottom: '24px', 
          background: '#ffffff', 
          borderRadius: '12px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0' 
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lucide.Filter size={18} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
              Executive Reports Comprehensive Filter
            </h3>
            {period.label && (
              <span style={{ fontSize: '12px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                Period: {period.label}
              </span>
            )}
          </div>
          <button 
            onClick={clearFilters}
            style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            Clear All Filters
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {/* Preset selector */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Date Range</label>
            <select
              value={filters.rangePreset}
              onChange={(e) => handleFilterChange('rangePreset', e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
            >
              {PRESET_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Custom Date Range inputs */}
          {filters.rangePreset === 'CUSTOM' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>From Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>To Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </>
          )}

          {/* Department Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Department Focus</label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
            >
              {DEPARTMENT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Branch</label>
            <select
              value={filters.branchId}
              onChange={(e) => handleFilterChange('branchId', e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
            >
              <option value="">All Branches</option>
              {(filterOptions.branches || []).map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Customer Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Customer</label>
            <select
              value={filters.customerId}
              onChange={(e) => handleFilterChange('customerId', e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
            >
              <option value="">All Customers</option>
              {(filterOptions.customers || []).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Vendor Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Vendor</label>
            <select
              value={filters.vendorId}
              onChange={(e) => handleFilterChange('vendorId', e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
            >
              <option value="">All Vendors</option>
              {(filterOptions.vendors || []).map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Product Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Product</label>
            <select
              value={filters.productId}
              onChange={(e) => handleFilterChange('productId', e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
            >
              <option value="">All Products</option>
              {(filterOptions.products || []).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
            <div key={idx} style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', minHeight: '200px' }}>
              <div style={{ width: '50%', height: '20px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '16px' }} />
              <div style={{ width: '80%', height: '14px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '10px' }} />
              <div style={{ width: '65%', height: '14px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '10px' }} />
              <div style={{ width: '90%', height: '14px', background: '#f1f5f9', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      )}

      {/* Error View */}
      {error && !loading && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecdd3', borderRadius: '12px', padding: '30px', textAlign: 'center', color: '#991b1b' }}>
          <Lucide.AlertTriangle size={36} style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Unable to load centralized reports</h3>
          <p style={{ margin: '6px 0 16px', fontSize: '13px', color: '#b91c1c' }}>{error.message || 'Please check your connection and try again.'}</p>
          <button onClick={loadReports} className="btn btn-primary" style={{ padding: '8px 18px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      )}

      {/* Main 8-Department Report Cards Grid */}
      {!loading && !error && report && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          
          {/* 1. Sales & CRM */}
          {isDeptMatch('Sales & CRM') && (
            <div className="dashboard-card" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lucide.TrendingUp size={18} /> Sales & CRM Performance
                </h3>
                <span style={{ fontSize: '11px', color: report.sales?.totalOrdersChangePercent >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                  {report.sales?.totalOrdersChangePercent >= 0 ? '↑' : '↓'} {Math.abs(report.sales?.totalOrdersChangePercent || 0)}% vs Prior
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Total Confirmed Orders</span>
                  <strong style={{ color: '#1e293b' }}>{report.sales?.totalOrders ?? 0} Orders</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Gross Revenue Collected</span>
                  <strong style={{ color: '#16a34a' }}>{formatCurrencyCompact(report.sales?.revenueCollected)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Leads in Funnel</span>
                  <strong style={{ color: '#1e293b' }}>{report.sales?.leadsInFunnel ?? 0} Leads</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Active Quotations</span>
                  <strong style={{ color: '#2563eb' }}>{report.sales?.activeQuotations ?? 0} Quotes</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Samples Pending</span>
                  <strong style={{ color: '#d97706' }}>{report.sales?.samplesPending ?? 0} Samples</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Orders Closed / Dispatched</span>
                  <strong style={{ color: '#9333ea' }}>{report.sales?.ordersClosedOrDispatched ?? 0} Orders</strong>
                </div>
              </div>
            </div>
          )}

          {/* 2. Production Floor */}
          {isDeptMatch('Production Floor') && (
            <div className="dashboard-card" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#d97706', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lucide.Factory size={18} /> Production Floor Telemetry
                </h3>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>Yield: {formatPercent(report.production?.shopFloorYield)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Work Orders Released</span>
                  <strong style={{ color: '#1e293b' }}>{report.production?.workOrdersReleased ?? 0} Batches</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Currently Running</span>
                  <strong style={{ color: '#2563eb' }}>{report.production?.currentlyRunning ?? 0} Active</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Batches Completed</span>
                  <strong style={{ color: '#16a34a' }}>{report.production?.batchesCompleted ?? 0} Completed</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>QC Failures / Rework</span>
                  <strong style={{ color: '#dc2626' }}>{report.production?.qcFailuresOrRework ?? 0} Batches</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Avg. Batch Delay</span>
                  <strong style={{ color: report.production?.avgBatchDelayDays > 0 ? '#dc2626' : '#16a34a' }}>{report.production?.avgBatchDelayDays ?? 0} Days</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Shop Floor Yield</span>
                  <strong style={{ color: '#16a34a' }}>{formatPercent(report.production?.shopFloorYield)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* 3. Plant Head Approvals */}
          {isDeptMatch('Plant Head') && (
            <div className="dashboard-card" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#4338ca', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lucide.ShieldCheck size={18} /> Plant Head Approvals
                </h3>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>Adherence: {formatPercent(report.plantHead?.scheduleAdherence)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Material Requests Pending</span>
                  <strong style={{ color: '#d97706' }}>{report.plantHead?.materialRequestsPending ?? 0} Pending</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Material Requests Approved</span>
                  <strong style={{ color: '#16a34a' }}>{report.plantHead?.materialRequestsApproved ?? 0} Approved</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>PO Approvals Pending</span>
                  <strong style={{ color: '#d97706' }}>{report.plantHead?.poApprovalsPending ?? 0} POs</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Total Clearances Issued</span>
                  <strong style={{ color: '#4338ca' }}>{report.plantHead?.totalClearancesIssued ?? 0} Issued</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Schedule Adherence</span>
                  <strong style={{ color: '#16a34a' }}>{formatPercent(report.plantHead?.scheduleAdherence)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Avg. Approval TAT</span>
                  <strong style={{ color: '#1e293b' }}>{report.plantHead?.avgApprovalTatDays ?? 0} Days</strong>
                </div>
              </div>
            </div>
          )}

          {/* 4. Store Inventory */}
          {isDeptMatch('Store / Procurement') && (
            <div className="dashboard-card" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lucide.Boxes size={18} /> Store Raw Inventory
                </h3>
                <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Reconciled with /store</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Total Raw Stock Items</span>
                  <strong style={{ color: '#1e293b' }}>{report.store?.totalRawStockItems ?? 0} Materials</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Raw Inventory Valuation</span>
                  <strong style={{ color: '#059669' }}>{formatCurrencyCompact(report.store?.rawInventoryValue)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Low Stock Alerts</span>
                  <strong style={{ color: report.store?.lowStockAlerts > 0 ? '#dc2626' : '#16a34a' }}>{report.store?.lowStockAlerts ?? 0} Items</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>PO Requests Raised</span>
                  <strong style={{ color: '#2563eb' }}>{report.store?.poRequestsRaised ?? 0} Requests</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Material Issuances</span>
                  <strong style={{ color: '#9333ea' }}>{report.store?.materialIssuances ?? 0} Outflows</strong>
                </div>
              </div>
            </div>
          )}

          {/* 5. Quality Control (QC) */}
          {isDeptMatch('Quality Control') && (
            <div className="dashboard-card" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lucide.FlaskConical size={18} /> Quality Control (QC)
                </h3>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>Pass Rate: {formatPercent(report.qc?.firstPassYield)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Total Samples Logged</span>
                  <strong style={{ color: '#1e293b' }}>{report.qc?.totalSamplesLogged ?? 0} Samples</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Approved / Passed</span>
                  <strong style={{ color: '#16a34a' }}>{report.qc?.approvedPassed ?? 0} Passed</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Rejected / Failed</span>
                  <strong style={{ color: '#dc2626' }}>{report.qc?.rejectedFailed ?? 0} Failed</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>First Pass Yield</span>
                  <strong style={{ color: '#16a34a' }}>{formatPercent(report.qc?.firstPassYield)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Defect Rate</span>
                  <strong style={{ color: report.qc?.defectRate > 5 ? '#dc2626' : '#16a34a' }}>{formatPercent(report.qc?.defectRate)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* 6. Dispatch & Logistics */}
          {isDeptMatch('Dispatch & Logistics') && (
            <div className="dashboard-card" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lucide.Truck size={18} /> Dispatch & Logistics
                </h3>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>On-Time: {formatPercent(report.dispatch?.onTimeDeliveryRate)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Shipments Dispatched</span>
                  <strong style={{ color: '#1e293b' }}>{report.dispatch?.shipmentsDispatched ?? 0} Shipments</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Currently In Transit</span>
                  <strong style={{ color: '#0284c7' }}>{report.dispatch?.currentlyInTransit ?? 0} Active</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Total Delivered Value</span>
                  <strong style={{ color: '#16a34a' }}>{formatCurrencyCompact(report.dispatch?.totalDeliveredValue)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Total Freight Cost</span>
                  <strong style={{ color: '#d97706' }}>{formatCurrencyCompact(report.dispatch?.totalFreightCost)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>On-Time Delivery Rate</span>
                  <strong style={{ color: '#16a34a' }}>{formatPercent(report.dispatch?.onTimeDeliveryRate)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>POD Confirmations</span>
                  <strong style={{ color: '#16a34a' }}>{report.dispatch?.podConfirmations ?? 0} Confirmed</strong>
                </div>
              </div>
            </div>
          )}

          {/* 7. Finance Receivables */}
          {isDeptMatch('Finance & Accounts') && (
            <div className="dashboard-card" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#4338ca', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lucide.Landmark size={18} /> Finance Receivables & Inflows
                </h3>
                <span style={{ fontSize: '11px', color: '#4338ca', fontWeight: 600 }}>Reconciled with /finance</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Revenue Collected</span>
                  <strong style={{ color: '#16a34a' }}>{formatCurrencyCompact(report.finance?.revenueCollected)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Outstanding Receivables</span>
                  <strong style={{ color: '#dc2626' }}>{formatCurrencyCompact(report.finance?.outstandingReceivables)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Advance Payments Held</span>
                  <strong style={{ color: '#2563eb' }}>{formatCurrencyCompact(report.finance?.advancePaymentsHeld)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Invoices Verified</span>
                  <strong style={{ color: '#16a34a' }}>{report.finance?.invoicesVerified ?? 0} Invoices</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Pending Verification</span>
                  <strong style={{ color: '#d97706' }}>{report.finance?.pendingVerification ?? 0} Pending</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Collection Efficiency</span>
                  <strong style={{ color: '#16a34a' }}>{formatPercent(report.finance?.collectionEfficiency)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* 8. HR Workforce Summary */}
          {isDeptMatch('HR & Payroll') && (
            <div className="dashboard-card" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lucide.Users size={18} /> HR Workforce Summary
                </h3>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>Users: {report.hr?.erpSystemUsers ?? 0}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Total Employees</span>
                  <strong style={{ color: '#1e293b' }}>{report.hr?.totalEmployees ?? 0} Staff</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Currently Active</span>
                  <strong style={{ color: '#16a34a' }}>{report.hr?.currentlyActive ?? 0} Active</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>On Leave</span>
                  <strong style={{ color: '#d97706' }}>{report.hr?.onLeave ?? 0} On Leave</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Active Departments</span>
                  <strong style={{ color: '#7c3aed' }}>{report.hr?.activeDepartments ?? 0} Depts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Monthly Payroll Outflow</span>
                  <strong style={{ color: '#1e293b' }}>{formatCurrencyCompact(report.hr?.monthlyPayrollOutflow)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>ERP System Users</span>
                  <strong style={{ color: '#2563eb' }}>{report.hr?.erpSystemUsers ?? 0} Accounts</strong>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Executive Document Export Center */}
      <div className="dashboard-card" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 750, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lucide.Printer size={18} color="#2563eb" /> Executive Document Export Center
        </h3>
        <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '13px' }}>
          Generate formatted PDF executive documentation using active company filters and live reporting metrics.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <button
            onClick={() => handleDocumentExport('sales')}
            disabled={exporting}
            style={{ padding: '12px 14px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
          >
            <Lucide.FileText size={16} /> Sales Performance PDF
          </button>

          <button
            onClick={() => handleDocumentExport('finance')}
            disabled={exporting}
            style={{ padding: '12px 14px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
          >
            <Lucide.Landmark size={16} /> Finance & Inflows PDF
          </button>



          <button
            onClick={() => handleDocumentExport('inventory')}
            disabled={exporting}
            style={{ padding: '12px 14px', borderRadius: '8px', background: '#faf5ff', border: '1px solid #e9d5ff', color: '#6b21a8', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
          >
            <Lucide.Boxes size={16} /> Stock Levels & Store PDF
          </button>
        </div>
      </div>
    </div>
  );
}

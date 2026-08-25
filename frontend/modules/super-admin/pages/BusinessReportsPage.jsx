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
    <div className="super-dashboard business-reports-wrapper">
      <style>{`
        .business-reports-wrapper {
          padding: 24px;
          max-width: 1600px;
          margin: 0 auto;
          box-sizing: border-box;
          width: 100%;
        }
        .business-reports-header {
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .business-reports-heading-title {
          font-size: 22px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }
        .business-reports-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .business-reports-filter-card {
          padding: 16px 20px;
          margin-bottom: 24px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          box-sizing: border-box;
          width: 100%;
        }
        .business-reports-filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }
        .business-reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
          width: 100%;
        }
        .business-reports-dept-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
        }
        .business-reports-dept-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 12px;
          gap: 8px;
        }
        .business-reports-metric-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .business-reports-metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          padding: 8px 10px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          gap: 8px;
        }
        .business-reports-metric-label {
          color: #64748b;
          font-size: 12.5px;
          font-weight: 600;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .business-reports-metric-value {
          font-weight: 750;
          font-size: 13px;
          flex-shrink: 0;
          text-align: right;
        }
        .business-reports-export-card {
          padding: 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-sizing: border-box;
          width: 100%;
        }
        .business-reports-export-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        @media (max-width: 768px) {
          .business-reports-wrapper {
            padding: 12px !important;
          }
          .business-reports-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
          }
          .business-reports-heading-title {
            font-size: 18px !important;
          }
          .business-reports-header-actions {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          .business-reports-header-actions .btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 10px 12px !important;
            font-size: 12.5px !important;
          }
          .business-reports-filter-card {
            padding: 12px 14px !important;
            margin-bottom: 16px !important;
          }
          .business-reports-filter-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .business-reports-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
            margin-bottom: 16px !important;
          }
          .business-reports-dept-card {
            padding: 14px 16px !important;
          }
          .business-reports-export-card {
            padding: 16px 14px !important;
          }
          .business-reports-export-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
        }

        @media (max-width: 480px) {
          .business-reports-wrapper {
            padding: 8px !important;
          }
          .business-reports-filter-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Page Header */}
      <header className="business-reports-header">
        <div className="dashboard-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="dashboard-header-icon" style={{ background: '#3b82f6', color: '#fff', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lucide.FileSpreadsheet size={26} />
          </div>
          <div className="dashboard-heading">
            <div className="dashboard-heading-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 className="business-reports-heading-title">Centralized Business Reports</h1>
              <span className="dashboard-badge badge-info" style={{ background: '#dbeafe', color: '#1e40af', fontWeight: 600, padding: '3px 8px', borderRadius: '16px', fontSize: '11px' }}>
                Real-Time 8-Dept Telemetry
              </span>
            </div>
            <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: '12px' }}>
              Live consolidated analytics across Sales · Production · Plant · Store · QC · Dispatch · Finance · HR
            </p>
          </div>
        </div>

        <div className="business-reports-header-actions">
          {lastUpdated && (
            <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500, width: '100%', display: 'block' }}>
              Last Updated: <strong>{lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
            </span>
          )}

          <button
            onClick={loadReports}
            disabled={loading}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
          >
            <Lucide.RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
          </button>

          <button
            onClick={downloadCsv}
            disabled={loading || exporting}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)', fontSize: '13px' }}
          >
            <Lucide.Download size={15} /> {exporting ? 'Exporting...' : 'Download CSV'}
          </button>
        </div>
      </header>

      {/* Filter Control Bar */}
      <div className="business-reports-filter-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Lucide.Filter size={18} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 750, color: '#1e293b' }}>
              Executive Reports Filter
            </h3>
            {period.label && (
              <span style={{ fontSize: '11.5px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                Period: {period.label}
              </span>
            )}
          </div>
          <button 
            onClick={clearFilters}
            style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', padding: '4px 8px' }}
          >
            Clear Filters
          </button>
        </div>

        <div className="business-reports-filter-grid">
          {/* Preset selector */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>Date Range</label>
            <select
              value={filters.rangePreset}
              onChange={(e) => handleFilterChange('rangePreset', e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', height: '38px' }}
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
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', height: '38px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px', textTransform: 'uppercase' }}>To Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', height: '38px' }}
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
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', height: '38px' }}
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
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', height: '38px' }}
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
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', height: '38px' }}
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
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', height: '38px' }}
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
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', height: '38px' }}
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
        <div className="business-reports-grid">
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
        <div style={{ background: '#fef2f2', border: '1px solid #fecdd3', borderRadius: '12px', padding: '30px', textAlign: 'center', color: '#991b1b', marginBottom: '24px' }}>
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
        <div className="business-reports-grid">
          
          {/* 1. Sales & CRM */}
          {isDeptMatch('Sales & CRM') && (
            <div className="business-reports-dept-card">
              <div className="business-reports-dept-header">
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lucide.TrendingUp size={18} /> Sales & CRM Performance
                </h3>
                <span style={{ fontSize: '11px', color: report.sales?.totalOrdersChangePercent >= 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                  {report.sales?.totalOrdersChangePercent >= 0 ? '↑' : '↓'} {Math.abs(report.sales?.totalOrdersChangePercent || 0)}% vs Prior
                </span>
              </div>
              <div className="business-reports-metric-list">
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Total Confirmed Orders</span>
                  <span className="business-reports-metric-value" style={{ color: '#1e293b' }}>{report.sales?.totalOrders ?? 0} Orders</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Gross Revenue Collected</span>
                  <span className="business-reports-metric-value" style={{ color: '#16a34a' }}>{formatCurrencyCompact(report.sales?.revenueCollected)}</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Leads in Funnel</span>
                  <span className="business-reports-metric-value" style={{ color: '#1e293b' }}>{report.sales?.leadsInFunnel ?? 0} Leads</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Active Quotations</span>
                  <span className="business-reports-metric-value" style={{ color: '#2563eb' }}>{report.sales?.activeQuotations ?? 0} Quotes</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Samples Pending</span>
                  <span className="business-reports-metric-value" style={{ color: '#d97706' }}>{report.sales?.samplesPending ?? 0} Samples</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Orders Closed / Dispatched</span>
                  <span className="business-reports-metric-value" style={{ color: '#9333ea' }}>{report.sales?.ordersClosedOrDispatched ?? 0} Orders</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Production Floor */}
          {isDeptMatch('Production Floor') && (
            <div className="business-reports-dept-card">
              <div className="business-reports-dept-header">
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#d97706', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lucide.Factory size={18} /> Production Floor Telemetry
                </h3>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>Yield: {formatPercent(report.production?.shopFloorYield)}</span>
              </div>
              <div className="business-reports-metric-list">
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Work Orders Released</span>
                  <span className="business-reports-metric-value" style={{ color: '#1e293b' }}>{report.production?.workOrdersReleased ?? 0} Batches</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Currently Running</span>
                  <span className="business-reports-metric-value" style={{ color: '#2563eb' }}>{report.production?.currentlyRunning ?? 0} Active</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Batches Completed</span>
                  <span className="business-reports-metric-value" style={{ color: '#16a34a' }}>{report.production?.batchesCompleted ?? 0} Completed</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">QC Failures / Rework</span>
                  <span className="business-reports-metric-value" style={{ color: '#dc2626' }}>{report.production?.qcFailuresOrRework ?? 0} Batches</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Avg. Batch Delay</span>
                  <span className="business-reports-metric-value" style={{ color: report.production?.avgBatchDelayDays > 0 ? '#dc2626' : '#16a34a' }}>{report.production?.avgBatchDelayDays ?? 0} Days</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Shop Floor Yield</span>
                  <span className="business-reports-metric-value" style={{ color: '#16a34a' }}>{formatPercent(report.production?.shopFloorYield)}</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Plant Head Approvals */}
          {isDeptMatch('Plant Head') && (
            <div className="business-reports-dept-card">
              <div className="business-reports-dept-header">
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#4338ca', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lucide.ShieldCheck size={18} /> Plant Head Approvals
                </h3>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>Adherence: {formatPercent(report.plantHead?.scheduleAdherence)}</span>
              </div>
              <div className="business-reports-metric-list">
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Material Requests Pending</span>
                  <span className="business-reports-metric-value" style={{ color: '#d97706' }}>{report.plantHead?.materialRequestsPending ?? 0} Pending</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Material Requests Approved</span>
                  <span className="business-reports-metric-value" style={{ color: '#16a34a' }}>{report.plantHead?.materialRequestsApproved ?? 0} Approved</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">PO Approvals Pending</span>
                  <span className="business-reports-metric-value" style={{ color: '#d97706' }}>{report.plantHead?.poApprovalsPending ?? 0} POs</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Total Clearances Issued</span>
                  <span className="business-reports-metric-value" style={{ color: '#4338ca' }}>{report.plantHead?.totalClearancesIssued ?? 0} Issued</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Schedule Adherence</span>
                  <span className="business-reports-metric-value" style={{ color: '#16a34a' }}>{formatPercent(report.plantHead?.scheduleAdherence)}</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Avg. Approval TAT</span>
                  <span className="business-reports-metric-value" style={{ color: '#1e293b' }}>{report.plantHead?.avgApprovalTatDays ?? 0} Days</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Store Inventory */}
          {isDeptMatch('Store / Procurement') && (
            <div className="business-reports-dept-card">
              <div className="business-reports-dept-header">
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lucide.Boxes size={18} /> Store Raw Inventory
                </h3>
                <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>Reconciled</span>
              </div>
              <div className="business-reports-metric-list">
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Total Raw Stock Items</span>
                  <span className="business-reports-metric-value" style={{ color: '#1e293b' }}>{report.store?.totalRawStockItems ?? 0} Materials</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Raw Inventory Valuation</span>
                  <span className="business-reports-metric-value" style={{ color: '#059669' }}>{formatCurrencyCompact(report.store?.rawInventoryValue)}</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Low Stock Alerts</span>
                  <span className="business-reports-metric-value" style={{ color: report.store?.lowStockAlerts > 0 ? '#dc2626' : '#16a34a' }}>{report.store?.lowStockAlerts ?? 0} Items</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">PO Requests Raised</span>
                  <span className="business-reports-metric-value" style={{ color: '#2563eb' }}>{report.store?.poRequestsRaised ?? 0} Requests</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Material Issuances</span>
                  <span className="business-reports-metric-value" style={{ color: '#9333ea' }}>{report.store?.materialIssuances ?? 0} Outflows</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. Quality Control (QC) */}
          {isDeptMatch('Quality Control') && (
            <div className="business-reports-dept-card">
              <div className="business-reports-dept-header">
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lucide.FlaskConical size={18} /> Quality Control (QC)
                </h3>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>Pass: {formatPercent(report.qc?.firstPassYield)}</span>
              </div>
              <div className="business-reports-metric-list">
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Total Samples Logged</span>
                  <span className="business-reports-metric-value" style={{ color: '#1e293b' }}>{report.qc?.totalSamplesLogged ?? 0} Samples</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Approved / Passed</span>
                  <span className="business-reports-metric-value" style={{ color: '#16a34a' }}>{report.qc?.approvedPassed ?? 0} Passed</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Rejected / Failed</span>
                  <span className="business-reports-metric-value" style={{ color: '#dc2626' }}>{report.qc?.rejectedFailed ?? 0} Failed</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">First Pass Yield</span>
                  <span className="business-reports-metric-value" style={{ color: '#16a34a' }}>{formatPercent(report.qc?.firstPassYield)}</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Defect Rate</span>
                  <span className="business-reports-metric-value" style={{ color: report.qc?.defectRate > 5 ? '#dc2626' : '#16a34a' }}>{formatPercent(report.qc?.defectRate)}</span>
                </div>
              </div>
            </div>
          )}

          {/* 6. Dispatch & Logistics */}
          {isDeptMatch('Dispatch & Logistics') && (
            <div className="business-reports-dept-card">
              <div className="business-reports-dept-header">
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lucide.Truck size={18} /> Dispatch & Logistics
                </h3>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>On-Time: {formatPercent(report.dispatch?.onTimeDeliveryRate)}</span>
              </div>
              <div className="business-reports-metric-list">
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Shipments Dispatched</span>
                  <span className="business-reports-metric-value" style={{ color: '#1e293b' }}>{report.dispatch?.shipmentsDispatched ?? 0} Shipments</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Currently In Transit</span>
                  <span className="business-reports-metric-value" style={{ color: '#0284c7' }}>{report.dispatch?.currentlyInTransit ?? 0} Active</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Total Delivered Value</span>
                  <span className="business-reports-metric-value" style={{ color: '#16a34a' }}>{formatCurrencyCompact(report.dispatch?.totalDeliveredValue)}</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Total Freight Cost</span>
                  <span className="business-reports-metric-value" style={{ color: '#d97706' }}>{formatCurrencyCompact(report.dispatch?.totalFreightCost)}</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">On-Time Delivery Rate</span>
                  <span className="business-reports-metric-value" style={{ color: '#16a34a' }}>{formatPercent(report.dispatch?.onTimeDeliveryRate)}</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">POD Confirmations</span>
                  <span className="business-reports-metric-value" style={{ color: '#16a34a' }}>{report.dispatch?.podConfirmations ?? 0} Confirmed</span>
                </div>
              </div>
            </div>
          )}

          {/* 7. Finance Receivables */}
          {isDeptMatch('Finance & Accounts') && (
            <div className="business-reports-dept-card">
              <div className="business-reports-dept-header">
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#4338ca', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lucide.Landmark size={18} /> Finance Receivables & Inflows
                </h3>
                <span style={{ fontSize: '11px', color: '#4338ca', fontWeight: 700 }}>Reconciled</span>
              </div>
              <div className="business-reports-metric-list">
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Revenue Collected</span>
                  <span className="business-reports-metric-value" style={{ color: '#16a34a' }}>{formatCurrencyCompact(report.finance?.revenueCollected)}</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Outstanding Receivables</span>
                  <span className="business-reports-metric-value" style={{ color: '#dc2626' }}>{formatCurrencyCompact(report.finance?.outstandingReceivables)}</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Advance Payments Held</span>
                  <span className="business-reports-metric-value" style={{ color: '#2563eb' }}>{formatCurrencyCompact(report.finance?.advancePaymentsHeld)}</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Invoices Verified</span>
                  <span className="business-reports-metric-value" style={{ color: '#16a34a' }}>{report.finance?.invoicesVerified ?? 0} Invoices</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Pending Verification</span>
                  <span className="business-reports-metric-value" style={{ color: '#d97706' }}>{report.finance?.pendingVerification ?? 0} Pending</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Collection Efficiency</span>
                  <span className="business-reports-metric-value" style={{ color: '#16a34a' }}>{formatPercent(report.finance?.collectionEfficiency)}</span>
                </div>
              </div>
            </div>
          )}

          {/* 8. HR Workforce Summary */}
          {isDeptMatch('HR & Payroll') && (
            <div className="business-reports-dept-card">
              <div className="business-reports-dept-header">
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lucide.Users size={18} /> HR Workforce Summary
                </h3>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>Users: {report.hr?.erpSystemUsers ?? 0}</span>
              </div>
              <div className="business-reports-metric-list">
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Total Employees</span>
                  <span className="business-reports-metric-value" style={{ color: '#1e293b' }}>{report.hr?.totalEmployees ?? 0} Staff</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Currently Active</span>
                  <span className="business-reports-metric-value" style={{ color: '#16a34a' }}>{report.hr?.currentlyActive ?? 0} Active</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">On Leave</span>
                  <span className="business-reports-metric-value" style={{ color: '#d97706' }}>{report.hr?.onLeave ?? 0} On Leave</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Active Departments</span>
                  <span className="business-reports-metric-value" style={{ color: '#7c3aed' }}>{report.hr?.activeDepartments ?? 0} Depts</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">Monthly Payroll Outflow</span>
                  <span className="business-reports-metric-value" style={{ color: '#1e293b' }}>{formatCurrencyCompact(report.hr?.monthlyPayrollOutflow)}</span>
                </div>
                <div className="business-reports-metric-row">
                  <span className="business-reports-metric-label">ERP System Users</span>
                  <span className="business-reports-metric-value" style={{ color: '#2563eb' }}>{report.hr?.erpSystemUsers ?? 0} Accounts</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Executive Document Export Center */}
      <div className="business-reports-export-card">
        <h3 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 750, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lucide.Printer size={18} color="#2563eb" /> Executive Document Export Center
        </h3>
        <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '12.5px' }}>
          Generate formatted PDF executive documentation using active company filters and live reporting metrics.
        </p>

        <div className="business-reports-export-grid">
          <button
            onClick={() => handleDocumentExport('sales')}
            disabled={exporting}
            style={{ padding: '12px 14px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
          >
            <Lucide.FileText size={16} /> Sales Performance PDF
          </button>

          <button
            onClick={() => handleDocumentExport('finance')}
            disabled={exporting}
            style={{ padding: '12px 14px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
          >
            <Lucide.Landmark size={16} /> Finance & Inflows PDF
          </button>

          <button
            onClick={() => handleDocumentExport('inventory')}
            disabled={exporting}
            style={{ padding: '12px 14px', borderRadius: '8px', background: '#faf5ff', border: '1px solid #e9d5ff', color: '#6b21a8', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
          >
            <Lucide.Boxes size={16} /> Stock Levels & Store PDF
          </button>
        </div>
      </div>
    </div>
  );
}

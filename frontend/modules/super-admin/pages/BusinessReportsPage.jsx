import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';
import BusinessReportRecords from '../components/BusinessReportRecords';
import "../components/dashboard.css";

function formatMetric(metric) {
  if (metric.value == null || !Number.isFinite(Number(metric.value))) return 'Not recorded';
  const value = Number(metric.value);
  if (metric.unit === 'INR') return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
  if (metric.unit === '%') return value.toFixed(1) + '%';
  return value.toLocaleString('en-IN') + ' ' + metric.unit;
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const PRESET_OPTIONS = [
  { value: 'ALL_TIME', label: 'All Time' },
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
    rangePreset: 'ALL_TIME',
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
  const [exportError, setExportError] = useState(null);
  const [availableFilters, setAvailableFilters] = useState({});
  const requestSequence = useRef(0);
  const [exporting, setExporting] = useState(false);

  const buildReportParams = useCallback(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (filters.rangePreset !== 'CUSTOM' && ['startDate', 'endDate'].includes(key)) return;
      if (value && value !== 'All') params.set(key, value);
    });
    return params;
  }, [filters]);

  const loadReports = useCallback(async () => {
    const request = ++requestSequence.current;
    setReport(null);
    setLastUpdated(null);
    setExportError(null);
    setLoading(true);
    setError(null);
    try {
      if (filters.rangePreset === 'CUSTOM' && (!filters.startDate || !filters.endDate || filters.startDate > filters.endDate)) {
        throw new Error('Choose a valid start and end date for the custom range.');
      }
      const params = buildReportParams();
      const payload = await backendFetch(`/api/backend/super-admin/reports?${params}`, { cacheTtlMs: 0 });
      if (!Array.isArray(payload?.sections) || !Array.isArray(payload?.registers) || !payload?.generatedAt || !payload?.csv || !payload?.period || !payload?.filters) throw new Error('The server returned an incomplete report.');
      if (request === requestSequence.current) {
        setReport(payload);
        setAvailableFilters(payload.filters);
        setLastUpdated(new Date(payload.generatedAt));
      }
    } catch (err) {
      console.error('Failed to load centralized reports:', err);
      if (request === requestSequence.current) setError(err || new Error('Failed to load reports'));
    } finally {
      if (request === requestSequence.current) setLoading(false);
    }
  }, [buildReportParams, filters.rangePreset, filters.startDate, filters.endDate]);

  useEffect(() => {
    loadReports();
    return () => { requestSequence.current += 1; };
  }, [loadReports]);

  const downloadCsv = () => {
    if (!report || loading) return;
    setExportError(null);
    try { saveBlob(new Blob([report.csv.content], { type: 'text/csv;charset=utf-8' }), report.csv.filename); }
    catch (error) { setExportError(error.message || 'Unable to download the CSV.'); }
  };

  const handleDocumentExport = async (type) => {
    const key = type === 'inventory' ? 'store' : type;
    const sections = report?.sections.filter(section => type === 'all' || section.key === key);
    if (!sections?.length || loading) return;
    setExporting(true); setExportError(null);
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
      const doc = new jsPDF();
      for (const [index, section] of sections.entries()) {
      if (index) doc.addPage();
      doc.setFontSize(16); doc.text(section.title, 14, 18);
      doc.setFontSize(9); doc.text('Period: ' + report.period.label, 14, 26);
      doc.text('Generated: ' + report.generatedAt, 14, 32);
      const labels = [['Branch', 'branchId', 'branches'], ['Customer', 'customerId', 'customers'], ['Vendor', 'vendorId', 'vendors'], ['Product', 'productId', 'products']];
      const selected = labels.map(([label, field, options]) => label + ': ' + (report.filters[options].find(option => option.id === report.appliedFilters[field])?.name || (report.appliedFilters[field] ? report.appliedFilters[field] : 'All'))).join(' | ');
      const filterLines = doc.splitTextToSize(selected, 180);
      doc.text(filterLines, 14, 39);
      const notes = doc.splitTextToSize(section.scope, 180);
      const noteY = 43 + filterLines.length * 4;
      doc.text(notes, 14, noteY);
      autoTable(doc, {
        startY: noteY + notes.length * 4 + 5,
        head: [['Metric', 'Value', 'Unit']],
        body: section.metrics.map(metric => [metric.label, metric.value == null ? 'Not recorded' : Number(metric.value).toLocaleString('en-IN', { maximumFractionDigits: 2 }), metric.value == null ? '' : metric.unit]),
        styles: { fontSize: 9, cellPadding: 3 }, headStyles: { fillColor: [37, 99, 235] },
      });
      }
      saveBlob(doc.output('blob'), key + '-report-' + report.period.startDate + '-to-' + report.period.endDate + '.pdf');
    } catch (error) {
      setExportError(error.message || 'Unable to generate the PDF report.');
    } finally { setExporting(false); }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, ...(field === 'rangePreset' && value !== 'CUSTOM' ? { startDate: '', endDate: '' } : {}) }));
  };

  const clearFilters = () => {
    setFilters({
      rangePreset: 'ALL_TIME',
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

  const filterOptions = availableFilters;
  const period = report?.period || {};
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
          white-space: normal;
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
                8-Department Database Report
              </span>
            </div>
            <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: '12px' }}>
              Consolidated records across Sales · Production · Plant · Store · QC · Dispatch · Finance · HR
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
            disabled={loading || exporting || !report}
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

      {exportError && <p role="alert" style={{ color: '#b91c1c' }}>{exportError}</p>}
      {!loading && !error && report && (
        <>
          <p style={{ color: '#64748b', fontSize: 13 }}>Commercial filters apply where records have those links. Vendor narrows procurement only; HR remains company-wide. Each card describes its date and filter scope. Missing measurements are shown as Not recorded.</p>
          <div className="business-reports-grid">
            {report.sections.map(section => (
              <section className="business-reports-dept-card" key={section.key} aria-label={section.title}>
                <div className="business-reports-dept-header">
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 750, color: '#2563eb' }}>{section.title}</h3>
                </div>
                <div className="business-reports-metric-list">
                  {section.metrics.map(metric => <div className="business-reports-metric-row" key={metric.key}>
                    <span className="business-reports-metric-label" title={metric.label}>{metric.label}</span>
                    <span className="business-reports-metric-value">{formatMetric(metric)}</span>
                  </div>)}
                </div>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: '#64748b' }}>{section.scope}</p>
              </section>
            ))}
          </div>
          <BusinessReportRecords key={buildReportParams().toString()} catalog={report.registers} params={buildReportParams().toString()} refreshKey={report.generatedAt} />
        </>
      )}

      {/* Executive Document Export Center */}
      <div className="business-reports-export-card">
        <h3 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 750, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lucide.Printer size={18} color="#2563eb" /> Executive Document Export Center
        </h3>
        <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '12.5px' }}>
          Export the displayed summaries with active filters, recorded values and scope notes. Use Detailed Module Reports above to export every matching record.
        </p>

        <div className="business-reports-export-grid">
          <button style={{ padding: '12px 14px', borderRadius: 8 }} disabled={exporting || loading || !report} onClick={() => handleDocumentExport('all')}>All Displayed Summaries PDF</button>
          {report?.sections.filter(section => !['sales', 'finance', 'store'].includes(section.key)).map(section => <button key={section.key} style={{ padding: '12px 14px', borderRadius: 8 }} disabled={exporting || loading} onClick={() => handleDocumentExport(section.key)}>{section.title} PDF</button>)}
          <button
            onClick={() => handleDocumentExport('sales')}
            disabled={exporting || loading || !report?.sections.some(section => section.key === 'sales')}
            style={{ padding: '12px 14px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
          >
            <Lucide.FileText size={16} /> Sales Performance PDF
          </button>

          <button
            onClick={() => handleDocumentExport('finance')}
            disabled={exporting || loading || !report?.sections.some(section => section.key === 'finance')}
            style={{ padding: '12px 14px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
          >
            <Lucide.Landmark size={16} /> Finance & Inflows PDF
          </button>

          <button
            onClick={() => handleDocumentExport('inventory')}
            disabled={exporting || loading || !report?.sections.some(section => section.key === 'store')}
            style={{ padding: '12px 14px', borderRadius: '8px', background: '#faf5ff', border: '1px solid #e9d5ff', color: '#6b21a8', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
          >
            <Lucide.Boxes size={16} /> Stock Levels & Store PDF
          </button>
        </div>
      </div>
    </div>
  );
}

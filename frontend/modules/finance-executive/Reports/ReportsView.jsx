import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';

export default function ReportsView() {
  const [reportType, setReportType] = useState('Collection'); // Collection, Outstanding, GST
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30); // Default to last 30 days
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (reportType === 'Collection') {
        endpoint = `/v1/finance-executive/reports/collections?startDate=${startDate}&endDate=${endDate}`;
      } else if (reportType === 'Outstanding') {
        endpoint = `/v1/finance-executive/reports/outstanding`;
      } else if (reportType === 'GST') {
        endpoint = `/v1/finance-executive/reports/gst?startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await apiClient.get(endpoint);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
      Swal.fire({
        icon: 'error',
        title: 'Report Generation Failed',
        text: err.message || 'An error occurred while fetching report data.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const handleExport = (format) => {
    if (data.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'There is no data available to export. Please adjust your filters.'
      });
      return;
    }

    Swal.fire({
      title: `Exporting as ${format}...`,
      html: 'Formatting columns and generating download stream.',
      timer: 1500,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      }
    }).then(() => {
      // Direct client-side CSV download for simplicity and high reliability
      let csvContent = "data:text/csv;charset=utf-8,";
      
      if (data.length > 0) {
        const headers = Object.keys(data[0]).join(",");
        csvContent += headers + "\r\n";
        
        data.forEach(row => {
          const rowData = Object.values(row).map(val => {
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
          }).join(",");
          csvContent += rowData + "\r\n";
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${reportType}_Report_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire({
        icon: 'success',
        title: 'Exported!',
        text: 'Report downloaded successfully.',
        timer: 1500,
        showConfirmButton: false
      });
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>Finance & Collections Reports</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '4px' }}>Generate custom collection sheets, outstanding balance registers, and GST collection reports.</p>
      </div>

      {/* Filter and Selection Card */}
      <div className="app-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Report Type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>Select Report Type</label>
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{
                padding: '8px 12px',
                background: '#ffffff',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                fontSize: '12px',
                color: 'var(--color-text-primary)'
              }}
            >
              <option value="Collection">Daily/Monthly Collections Register</option>
              <option value="Outstanding">Outstanding Receivable Aging Report</option>
              <option value="GST">GST Output Liability Register</option>
            </select>
          </div>

          {/* Date from (Only visible for date-range reports) */}
          {reportType !== 'Outstanding' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>From Date</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      background: '#ffffff',
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px',
                      fontSize: '12px',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}>
                    <Calendar size={14} />
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>To Date</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      background: '#ffffff',
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px',
                      fontSize: '12px',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}>
                    <Calendar size={14} />
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '12px' }}>
          <button 
            onClick={fetchReportData} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'var(--color-accent-teal)',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '700',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Generate Preview
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => handleExport('Excel')} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: 'var(--color-sidebar-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <FileSpreadsheet size={14} style={{ color: '#10b981' }} /> Export Excel
            </button>
            <button 
              onClick={() => handleExport('CSV')} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: 'var(--color-sidebar-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <Download size={14} style={{ color: 'var(--color-accent-teal)' }} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="app-card" style={{ padding: '20px' }}>
        <div className="card-top-bar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '16px' }}>
          <h2 className="card-heading" style={{ margin: 0 }}>Live Report Preview</h2>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-secondary)' }}>Showing matching rows based on active query parameters.</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
            <div className="animate-spin" style={{ width: '28px', height: '28px', border: '3px solid var(--color-accent-teal)', borderBottomColor: 'transparent', borderRadius: '50%' }}></div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Compiling report metrics...</p>
          </div>
        ) : (
          <div className="crm-table-container">
            {reportType === 'Collection' && (
              <table className="crm-table responsive-table">
                <thead>
                  <tr>
                    <th>Clearance Date</th>
                    <th>Invoice No</th>
                    <th>Order Ref</th>
                    <th>Customer</th>
                    <th>Payment Mode</th>
                    <th>Txn Ref (UTR)</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px' }}>No collections recorded in this period.</td>
                    </tr>
                  ) : (
                    data.map((r, idx) => (
                      <tr key={idx}>
                        <td data-label="Clearance Date">{new Date(r.date).toLocaleDateString()}</td>
                        <td data-label="Invoice No" style={{ fontWeight: 'bold' }}>{r.invoice_number}</td>
                        <td data-label="Order Ref" style={{ fontFamily: 'monospace' }}>{r.order_number}</td>
                        <td data-label="Customer" style={{ fontWeight: 'bold' }}>{r.customer_name}</td>
                        <td data-label="Payment Mode">{r.payment_mode}</td>
                        <td data-label="Txn Ref" style={{ fontFamily: 'monospace' }}>{r.utr_number || 'N/A'}</td>
                        <td data-label="Amount" style={{ textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(r.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {reportType === 'Outstanding' && (
              <table className="crm-table responsive-table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Customer</th>
                    <th>Invoice Date</th>
                    <th>Due Date</th>
                    <th style={{ textAlign: 'right' }}>Total Invoice</th>
                    <th style={{ textAlign: 'right' }}>Paid Amount</th>
                    <th style={{ textAlign: 'right' }}>Outstanding</th>
                    <th style={{ textAlign: 'center' }}>Overdue Days</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px' }}>No outstanding receivables. All invoices fully settled!</td>
                    </tr>
                  ) : (
                    data.map((r, idx) => (
                      <tr key={idx}>
                        <td data-label="Invoice No" style={{ fontWeight: 'bold' }}>{r.invoice_number}</td>
                        <td data-label="Customer" style={{ fontWeight: 'bold' }}>{r.customer_name}</td>
                        <td data-label="Invoice Date">{new Date(r.invoice_date).toLocaleDateString()}</td>
                        <td data-label="Due Date">{new Date(r.due_date).toLocaleDateString()}</td>
                        <td data-label="Total Invoice" style={{ textAlign: 'right' }}>{formatCurrency(r.total_amount)}</td>
                        <td data-label="Paid Amount" style={{ textAlign: 'right', color: '#10b981' }}>{formatCurrency(r.paid_amount)}</td>
                        <td data-label="Outstanding" style={{ textAlign: 'right', color: '#ef4444', fontWeight: 'bold' }}>{formatCurrency(r.outstanding)}</td>
                        <td data-label="Overdue Days" style={{ textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: r.days_overdue > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: r.days_overdue > 0 ? '#ef4444' : '#10b981'
                          }}>
                            {r.days_overdue > 0 ? `${r.days_overdue} Days` : 'Current'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {reportType === 'GST' && (
              <table className="crm-table responsive-table">
                <thead>
                  <tr>
                    <th>Invoice Date</th>
                    <th>Invoice No</th>
                    <th>Customer</th>
                    <th>GSTIN</th>
                    <th style={{ textAlign: 'right' }}>Taxable Value</th>
                    <th style={{ textAlign: 'right' }}>GST Collected (18%)</th>
                    <th style={{ textAlign: 'right' }}>Gross Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px' }}>No invoice records found in this period.</td>
                    </tr>
                  ) : (
                    data.map((r, idx) => (
                      <tr key={idx}>
                        <td data-label="Invoice Date">{new Date(r.invoice_date).toLocaleDateString()}</td>
                        <td data-label="Invoice No" style={{ fontWeight: 'bold' }}>{r.invoice_number}</td>
                        <td data-label="Customer" style={{ fontWeight: 'bold' }}>{r.customer_name}</td>
                        <td data-label="GSTIN" style={{ fontFamily: 'monospace' }}>{r.gstin || 'N/A'}</td>
                        <td data-label="Taxable Value" style={{ textAlign: 'right' }}>{formatCurrency(r.subtotal)}</td>
                        <td data-label="GST Collected" style={{ textAlign: 'right', color: 'var(--color-accent-teal)', fontWeight: 'bold' }}>{formatCurrency(r.gst_amount)}</td>
                        <td data-label="Gross Total" style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(r.total_amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

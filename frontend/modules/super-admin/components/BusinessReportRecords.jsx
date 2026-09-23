import React, { useEffect, useRef, useState } from 'react';
import { backendFetch } from '@/lib/backendFetch';

const filterLabels = { branchId: 'Branch', customerId: 'Customer', vendorId: 'Vendor', productId: 'Product' };
const control = { padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, background: '#fff', fontSize: 13 };
const display = (value, type) => {
  if (value == null) return 'Not recorded';
  if (type === 'Boolean') return value ? 'Yes' : 'No';
  if (type === 'DateTime') return new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  return String(value);
};
function download(content, filename, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function BusinessReportRecords({ catalog, params, refreshKey }) {
  const [selection, setSelection] = useState('orders');
  const dataset = catalog.some(r => r.key === selection) ? selection : catalog[0]?.key;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportError, setExportError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [retry, setRetry] = useState(0);
  const sequence = useRef(0);

  useEffect(() => {
    const request = ++sequence.current;
    setData(null); setLoading(true); setError(''); setExportError('');
    const query = new URLSearchParams(params);
    query.set('dataset', dataset); query.set('page', String(page)); query.set('pageSize', String(pageSize));
    backendFetch(`/api/backend/super-admin/reports/records?${query}`, { cacheTtlMs: 0 })
      .then(result => {
        if (!Array.isArray(result.rows) || !Array.isArray(result.columns) || !Number.isInteger(result.total)) throw new Error('The server returned an incomplete detailed report.');
        if (request === sequence.current) setData(result);
      })
      .catch(err => { if (request === sequence.current) setError(err.message || 'Unable to load report records.'); })
      .finally(() => { if (request === sequence.current) setLoading(false); });
    return () => { sequence.current += 1; };
  }, [params, refreshKey, dataset, page, pageSize, retry]);

  async function exportRecords(all) {
    setExporting(true); setExportError('');
    try {
      const query = new URLSearchParams(params);
      if (!all) query.set('dataset', dataset);
      const result = await backendFetch(`/api/backend/super-admin/reports/${all ? 'workbook' : 'records/export'}?${query}`, { cacheTtlMs: 0 });
      if (!all) { download(result.csv.content, result.csv.filename); return; }
      const XLSX = await import('xlsx');
      const workbook = XLSX.utils.book_new();
      const notes = [['Centralized Business Reports'], ['Generated (UTC)', result.generatedAt], ['Filters', params],
        ['Every worksheet contains all matching records, not only the visible page.'],
        ['Blank source values are marked Not recorded. Date values are exported as ISO timestamps.'],
        [], ['Department', 'Report', 'Records', 'Period', 'Scope', 'Filters Not Applicable']];
      for (const report of result.reports) {
        if (report.rows.length !== report.total) throw new Error(`Incomplete export for ${report.title}. Please retry.`);
        notes.push([report.department, report.title, report.total, report.period.label, report.scope, report.ignoredFilters.map(f => filterLabels[f]).join(', ')]);
        const rows = [report.columns.map(c => c.label), ...report.rows.map(row => report.columns.map(c => row[c.key] == null ? 'Not recorded' : row[c.key]))];
        // Numeric strings retain the exact decimal values supplied by the database.
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), report.key.slice(0, 31));
      }
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(notes), 'Report scope');
      download(XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }), 'centralized-business-reports.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } catch (err) { setExportError(err.message || 'Unable to export reports.'); }
    finally { setExporting(false); }
  }

  const metadata = catalog.find(r => r.key === dataset);
  const departments = [...new Set(catalog.map(r => r.department))];
  const pages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;
  return <section className="business-reports-export-card" aria-label="Detailed module reports">
    <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Detailed Module Reports</h2>
    <p style={{ color: '#64748b', fontSize: 13 }}>Browse {catalog.length} operational reports across the selected departments. All statuses are included. Exports include every matching record.</p>
    <p style={{ color: '#64748b', fontSize: 12 }}>Records must belong to this company. Legacy inventory and machine masters without company ownership are not included. Manual registers include attributable records only; each report explains its scope. Product filters on document reports include the entire matching document; use item reports for individual product quantities and amounts.</p>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <label>Report <select aria-label="Detailed report" value={dataset} onChange={event => { setSelection(event.target.value); setPage(1); }} style={{ ...control, maxWidth: '100%' }}>
        {departments.map(department => <optgroup key={department} label={department}>{catalog.filter(r => r.department === department).map(r => <option key={r.key} value={r.key}>{r.title}</option>)}</optgroup>)}
      </select></label>
      <label>Rows <select aria-label="Rows per page" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }} style={control}>{[25, 50, 100].map(size => <option key={size}>{size}</option>)}</select></label>
      <button style={control} disabled={exporting || loading || !data} onClick={() => exportRecords(false)}>Export Entire Report CSV</button>
      <button style={control} disabled={exporting} onClick={() => exportRecords(true)}>{exporting ? 'Preparing export…' : 'Export All Module Reports (Excel)'}</button>
    </div>
    <p style={{ color: '#475569', fontSize: 12 }}>{metadata?.scope}</p>
    {!!data?.ignoredFilters.length && <p role="status" style={{ color: '#92400e' }}>Not applicable to this report: {data.ignoredFilters.map(f => filterLabels[f]).join(', ')}. These filters have not been applied.</p>}
    {exportError && <p role="alert" style={{ color: '#b91c1c' }}>{exportError}</p>}
    {loading && <p role="status">Loading recorded data…</p>}
    {error && <p role="alert" style={{ color: '#b91c1c' }}>{error} <button style={control} onClick={() => setRetry(value => value + 1)}>Retry</button></p>}
    {!loading && data && <>
      <p style={{ fontSize: 13 }}><strong>{data.total.toLocaleString('en-IN')} matching records</strong> · {data.period.label} · Retrieved {new Date(data.generatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
      <div style={{ overflowX: 'auto', maxHeight: 560, border: '1px solid #e2e8f0', borderRadius: 8 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
          <caption style={{ textAlign: 'left', padding: 10, fontWeight: 700 }}>{data.title}</caption>
          <thead><tr>{data.columns.map(column => <th scope="col" key={column.key} style={{ padding: 10, textAlign: 'left', background: '#eff6ff', whiteSpace: 'nowrap', position: 'sticky', top: 0 }}>{column.label}</th>)}</tr></thead>
          <tbody>{data.rows.map(row => <tr key={row.id}>{data.columns.map(column => <td key={column.key} style={{ padding: 10, borderTop: '1px solid #e2e8f0', minWidth: 110, maxWidth: 360, overflowWrap: 'anywhere' }}>{display(row[column.key], column.type)}</td>)}</tr>)}</tbody>
        </table>
        {!data.rows.length && <p style={{ padding: 16 }}>No records match this report and its applicable filters.</p>}
      </div>
      <nav aria-label="Report pagination" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
        <button style={control} disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button>
        <span>Page {page} of {pages}</span>
        <button style={control} disabled={page >= pages} onClick={() => setPage(value => value + 1)}>Next</button>
      </nav>
    </>}
  </section>;
}

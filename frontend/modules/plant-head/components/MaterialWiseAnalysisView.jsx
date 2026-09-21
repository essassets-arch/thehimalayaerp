'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { backendFetch } from '@/lib/backendFetch';
import styles from './material-analytics.module.css';

const today = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
const number = value => value == null ? 'Not available' : Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const label = value => value.replaceAll('_', ' ').toLowerCase();
const csvCell = value => '"' + String(value ?? '').replace(/^[=+@\-]/, match => "'" + match).replaceAll('"', '""') + '"';
const dateParams = period => {
  const params = new URLSearchParams();
  if (period.mode === 'all') params.set('month', 'all');
  else if (period.mode === 'custom') {
    params.set('filter', 'Custom'); params.set('customStart', period.start); params.set('customEnd', period.end);
  } else params.set('month', period.month);
  return params;
};
const balanceFields = ['currentStock', 'openingStock', 'received', 'issued', 'adjustment', 'closingStock'];
const balanceLabels = ['Current stock', 'Period opening', 'Received', 'Issued', 'Adjustments', 'Period closing'];

export default function MaterialWiseAnalysisView() {
  const initial = { mode: 'monthly', month: today().slice(0, 7), start: today().slice(0, 7) + '-01', end: today() };
  const [draft, setDraft] = useState(initial);
  const [period, setPeriod] = useState(initial);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [unit, setUnit] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [history, setHistory] = useState(null);
  const [historyError, setHistoryError] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const historyRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setData(null); setSelected(null);
    backendFetch(`/api/backend/plant-head/analytics/material-wise?${dateParams(period)}`, { cacheTtlMs: 0 })
      .then(result => {
        if (!Array.isArray(result?.materials) || !Array.isArray(result?.totalsByUnit)) throw new Error('Invalid material report');
        if (active) { setData(result); setPage(1); }
      })
      .catch(() => { if (active) setError('Unable to load material analytics. No inventory data is being displayed.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [period, refresh]);

  useEffect(() => {
    if (!selected) return;
    let active = true;
    setHistory(null); setHistoryError(''); setHistoryLoading(true);
    const params = new URLSearchParams({ page: String(historyPage), pageSize: '20' });
    if (data?.period?.startDate && data?.period?.endDate) {
      params.set('startDate', new Date(new Date(data.period.startDate).getTime() + 330 * 60000).toISOString().slice(0, 10));
      params.set('endDate', new Date(new Date(data.period.endDate).getTime() - 1 + 330 * 60000).toISOString().slice(0, 10));
    }
    backendFetch(`/api/backend/plant-head/analytics/material-wise/${encodeURIComponent(selected.materialId)}/transactions?${params}`, { cacheTtlMs: 0 })
      .then(result => { if (!Array.isArray(result?.data)) throw new Error('Invalid history'); if (active) setHistory(result); })
      .catch(() => { if (active) setHistoryError('Unable to load movement history.'); })
      .finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [selected, historyPage, data, historyRefresh]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.materials || []).filter(row =>
      (!term || [row.materialName, row.materialSku, row.category].some(value => value.toLowerCase().includes(term))) &&
      (unit === 'ALL' || row.unit === unit) &&
      (status === 'ALL' || row.stockStatus === status || row.movement === status),
    ).sort((a, b) => a.materialName.localeCompare(b.materialName));
  }, [data, search, unit, status]);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const units = data?.totalsByUnit || [];
  const chartUnit = unit === 'ALL' ? units[0]?.unit : unit;
  const daily = (data?.dailyFlow || []).filter(row => row.unit === chartUnit);
  const maxDaily = Math.max(1, ...daily.map(row => Math.max(row.received, row.issued)));

  function apply(event) {
    event.preventDefault();
    if (draft.mode === 'custom' && draft.start > draft.end) { setError('Start date must be on or before end date.'); return; }
    setPeriod({ ...draft });
  }
  function exportCsv() {
    const columns = [['Material', 'materialName'], ['SKU', 'materialSku'], ['Category', 'category'], ['Unit', 'unit'], ...balanceLabels.map((name, index) => [name, balanceFields[index]]), ['Minimum stock', 'minimumStock'], ['Transactions', 'transactions'], ['Stock status', 'stockStatus']];
    const csv = [columns.map(([name]) => csvCell(name)).join(','), ...rows.map(row => columns.map(([, key]) => csvCell(row[key])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `materials-${period.mode === 'monthly' ? period.month : period.mode}.csv`; link.click(); URL.revokeObjectURL(url);
  }

  return <main className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>PLANT HEAD / STORE INVENTORY</p><h1>Material analytics</h1><p>Every material in Store raw inventory, including materials with no movement.</p></div>
      <div className={styles.actions}><button onClick={() => setRefresh(value => value + 1)} disabled={loading}>Refresh</button><button onClick={exportCsv} disabled={loading || !!error || !data}>Export {rows.length} materials</button><a href="/store/raw-inventory">Open Store inventory</a></div>
    </header>
    <form className={styles.filters} onSubmit={apply}>
      <label>Period<select value={draft.mode} onChange={e => setDraft({ ...draft, mode: e.target.value })}><option value="monthly">Month</option><option value="custom">Custom dates</option><option value="all">All time</option></select></label>
      {draft.mode === 'monthly' && <label>Month<input required type="month" value={draft.month} onChange={e => setDraft({ ...draft, month: e.target.value })} /></label>}
      {draft.mode === 'custom' && <><label>From<input required type="date" value={draft.start} onChange={e => setDraft({ ...draft, start: e.target.value })} /></label><label>Through<input required type="date" value={draft.end} onChange={e => setDraft({ ...draft, end: e.target.value })} /></label></>}
      <button type="submit" disabled={loading}>Apply period</button>
    </form>
    {loading && <p role="status" className={styles.notice}>Loading Store inventory and movement records...</p>}
    {error && <div role="alert" className={styles.error}>{error} <button onClick={() => setRefresh(value => value + 1)}>Retry</button></div>}
    {!loading && !error && data && <>
      <p className={styles.notice}><strong>{data.period.periodLabel}</strong> · Dates use Asia/Kolkata. Current stock is live; opening, movements and closing belong to the selected period. Receipts and issues come from the posted Store ledger, including quick stock movements. Store issues are not proof of production consumption.</p>
      <section className={styles.cards} aria-label="Inventory summary">
        {[
          ['All materials', data.kpis.totalMaterials], ['With period movement', data.kpis.materialsWithMovement], ['Low stock now', data.kpis.lowStockCount], ['Out of stock now', data.kpis.outOfStockCount], ['Period transactions', data.kpis.totalTransactions],
        ].map(([name, value]) => <article key={name}><span>{name}</span><strong>{number(value)}</strong></article>)}
      </section>
      {(data.dataQuality.unknownTransactions > 0 || data.kpis.unknownStockCount > 0) && <p role="status" className={styles.error}>Some ledger types are unrecognized. Affected stock balances are unavailable; inspect their movement history. Unknown balances: {data.kpis.unknownStockCount}.</p>}
      <section className={styles.panel}><h2>Inventory totals by unit</h2><p>KG, pieces, litres and other units are reported separately. These totals include the full catalog.</p>
        <div className={styles.tableWrap}><table><thead><tr>{['Unit', 'Materials', ...balanceLabels].map(name => <th scope="col" key={name}>{name}</th>)}</tr></thead><tbody>{units.map(row => <tr key={row.unit}><th scope="row">{row.unit}</th>{['materials', ...balanceFields].map(field => <td key={field}>{number(row[field])}</td>)}</tr>)}</tbody></table></div>
      </section>
      <section className={styles.panel}>
        <div className={styles.header}><div><h2>All Store materials</h2><p>{rows.length} matching of {data.kpis.totalMaterials} materials. No catalog or export limit.</p></div>
          <div className={styles.filters}><label>Search<input type="search" placeholder="Name, SKU or category" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></label>
            <label>Unit<select value={unit} onChange={e => { setUnit(e.target.value); setPage(1); }}><option value="ALL">All units</option>{units.map(row => <option key={row.unit}>{row.unit}</option>)}</select></label>
            <label>Status<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="ALL">All materials</option>{['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'UNKNOWN', 'ACTIVE', 'NO_MOVEMENT'].map(value => <option key={value} value={value}>{label(value)}</option>)}</select></label>
          </div>
        </div>
        <div className={styles.tableWrap}><table><thead><tr>{['Material / SKU', 'Unit', ...balanceLabels, 'Minimum', 'Status', 'History'].map(name => <th key={name} scope="col">{name}</th>)}</tr></thead>
          <tbody>{visible.map(row => <tr key={row.materialId}><th scope="row">{row.materialName}<small>{row.materialSku || 'SKU not recorded'} · {row.category}{!row.isActive && ' · Inactive'}</small></th><td>{row.unit}</td>{[...balanceFields, 'minimumStock'].map(field => <td key={field}>{number(row[field])}</td>)}<td><span className={styles.badge}>{label(row.stockStatus)}</span></td><td><button onClick={() => { setSelected(row); setHistoryPage(1); setTimeout(() => historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0); }}>View movements</button></td></tr>)}</tbody>
        </table></div>
        {rows.length === 0 && <p>No materials match these filters.</p>}
        <div className={styles.pagination}><label>Rows per page <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>{[25, 50, 100, 250].map(size => <option key={size}>{size}</option>)}</select></label><span>Page {currentPage} of {totalPages}</span><button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Previous</button><button disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</button></div>
      </section>
      <section className={styles.panel}><h2>Daily movements · {chartUnit || 'No recorded units'}</h2><p>Choose a unit above to compare receipts and issues. Green shows receipts; blue shows issues.</p>
        <div className={styles.chart}>{daily.map(row => <div key={row.date} className={styles.chartRow}><span>{row.date}</span><div><div className={styles.received} style={{ width: `${row.received / maxDaily * 100}%` }} /><div className={styles.issued} style={{ width: `${row.issued / maxDaily * 100}%` }} /></div><span>In {number(row.received)} / Out {number(row.issued)} {row.unit}</span></div>)}</div>{daily.length === 0 && <p>No movements recorded for this period and unit.</p>}
      </section>
      {selected && <section ref={historyRef} className={styles.panel} aria-label="Material movement history"><div className={styles.header}><div><h2>{selected.materialName}</h2><p>Movement history for {data.period.periodLabel} · {selected.unit}</p></div><button onClick={() => setSelected(null)}>Close history</button></div>
        {historyLoading && <p role="status">Loading movements...</p>}
        {historyError && <p role="alert">{historyError} <button onClick={() => setHistoryRefresh(value => value + 1)}>Retry history</button></p>}
        {!historyLoading && !historyError && history && <><div className={styles.tableWrap}><table><thead><tr>{['Date (India)', 'Type', 'Quantity', 'Reference type', 'Reference', 'Warehouse'].map(name => <th scope="col" key={name}>{name}</th>)}</tr></thead><tbody>{history.data.map(row => <tr key={row.id}><td>{row.date}</td><td>{row.type}</td><td>{number(row.quantity)} {row.unit}</td><td>{row.referenceType || 'Not recorded'}</td><td>{row.reference || 'Not recorded'}</td><td>{row.warehouse || 'Not recorded'}</td></tr>)}</tbody></table></div>{history.total === 0 && <p>No transactions in this period.</p>}<div className={styles.pagination}><span>{history.total} transactions · Page {historyPage} of {history.totalPages}</span><button disabled={historyPage <= 1} onClick={() => setHistoryPage(value => value - 1)}>Previous</button><button disabled={historyPage >= history.totalPages} onClick={() => setHistoryPage(value => value + 1)}>Next</button></div></>}
      </section>}
      <p className={styles.footnote}>Updated {new Date(data.generatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST. Missing values are shown as unavailable. Negative stock is retained for reconciliation.</p>
    </>}
  </main>;
}

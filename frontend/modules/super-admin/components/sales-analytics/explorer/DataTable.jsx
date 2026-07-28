import React, { useState, useCallback, useMemo } from 'react';
import { Search, Download, Printer, Copy, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Maximize2, RefreshCw } from 'lucide-react';
import { exportCSV, exportPDF, printReport, copyToClipboard } from '../../../utils/export.js';

const DENSITIES = { compact: '4px 8px', default: '10px 14px', comfortable: '16px 18px' };

const DataTable = ({ title, columns: rawColumns, data = [], onDrilldown, pageSize = 15 }) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [density, setDensity] = useState('default');
  const [fullscreen, setFullscreen] = useState(false);
  const [visibleCols, setVisibleCols] = useState(() => rawColumns.map(c => c.accessor));
  const [showColSelector, setShowColSelector] = useState(false);

  const columns = useMemo(() => rawColumns.filter(c => visibleCols.includes(c.accessor)), [rawColumns, visibleCols]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(q))
    );
  }, [data, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = useMemo(() => sorted.slice((page - 1) * pageSize, page * pageSize), [sorted, page, pageSize]);

  const handleSort = useCallback((key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  }, [sortKey]);

  const handleSearch = useCallback((e) => { setSearch(e.target.value); setPage(1); }, []);

  const toggleCol = useCallback((acc) => {
    setVisibleCols(prev => prev.includes(acc) ? prev.filter(c => c !== acc) : [...prev, acc]);
  }, []);

  const handleCopy = useCallback(() => {
    const text = sorted.map(row => rawColumns.map(c => row[c.accessor]).join('\t')).join('\n');
    copyToClipboard(text);
  }, [sorted, rawColumns]);

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ArrowUpDown size={11} style={{ opacity: 0.35 }} />;
    return sortDir === 'asc' ? <ArrowUp size={11} style={{ color: '#337a86' }} /> : <ArrowDown size={11} style={{ color: '#337a86' }} />;
  };

  const wrapStyle = fullscreen
    ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'var(--color-bg, #F5FAFE)', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column' }
    : {};

  const cellPad = DENSITIES[density];

  return (
    <div className="app-card" style={{ padding: 0, overflow: 'hidden', ...wrapStyle }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '12px', background: 'var(--color-card-bg, #fff)' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: '850', color: 'var(--color-text-primary)' }}>{title}</h3>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{filtered.length} records</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', borderRadius: '7px', padding: '7px 12px', border: '1px solid var(--color-border)' }}>
            <Search size={13} color="#5E6B82" />
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Search all columns..."
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '12.5px', width: '160px', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Density */}
          <select value={density} onChange={e => setDensity(e.target.value)}
            style={{ background: 'var(--color-card-bg, #fff)', border: '1px solid var(--color-border)', borderRadius: '7px', padding: '7px 10px', fontSize: '12px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            <option value="compact">Compact</option>
            <option value="default">Default</option>
            <option value="comfortable">Comfortable</option>
          </select>

          {/* Column Visibility */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowColSelector(s => !s)} title="Column visibility"
              style={{ background: '#f1f5f9', border: '1px solid var(--color-border)', borderRadius: '7px', padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              <Eye size={13} /> Columns
            </button>
            {showColSelector && (
              <div style={{ position: 'absolute', right: 0, top: '38px', background: 'var(--color-card-bg, #fff)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '12px', zIndex: 999, minWidth: '200px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: '300px', overflowY: 'auto' }}>
                {rawColumns.map(col => (
                  <label key={col.accessor} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={visibleCols.includes(col.accessor)} onChange={() => toggleCol(col.accessor)} />
                    {col.header}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV */}
          <button onClick={() => exportCSV(sorted, title.replace(/\s+/g, '_'))} title="Export CSV"
            style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '7px', padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            <Download size={12} /> CSV
          </button>

          {/* Export PDF / Print */}
          <button onClick={printReport} title="Print"
            style={{ background: '#24345C', color: '#fff', border: 'none', borderRadius: '7px', padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            <Printer size={12} /> Print
          </button>

          {/* Copy */}
          <button onClick={handleCopy} title="Copy"
            style={{ background: '#f1f5f9', border: '1px solid var(--color-border)', borderRadius: '7px', padding: '7px 10px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
            <Copy size={13} />
          </button>

          {/* Fullscreen */}
          <button onClick={() => setFullscreen(s => !s)} title="Fullscreen"
            style={{ background: '#f1f5f9', border: '1px solid var(--color-border)', borderRadius: '7px', padding: '7px 10px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
            <Maximize2 size={13} />
          </button>

          {/* Refresh */}
          <button onClick={() => { setSearch(''); setSortKey(null); setPage(1); }} title="Reset"
            style={{ background: '#f1f5f9', border: '1px solid var(--color-border)', borderRadius: '7px', padding: '7px 10px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: '#F5FAFE', borderBottom: '2px solid var(--color-border)' }}>
              {columns.map(col => (
                <th key={col.accessor}
                  onClick={() => handleSort(col.accessor)}
                  style={{ padding: cellPad, textAlign: 'left', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {col.header} <SortIcon col={col.accessor} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px', color: '#8893A7', fontStyle: 'italic', fontSize: '13px' }}>
                  No records found.
                </td>
              </tr>
            ) : paged.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)', background: idx % 2 === 0 ? 'transparent' : '#fafbfc', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : '#fafbfc'}>
                {columns.map(col => (
                  <td key={col.accessor} style={{ padding: cellPad, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {col.render ? col.render(row) : (row[col.accessor] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '8px', background: 'var(--color-card-bg, #fff)' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          Showing {Math.min((page - 1) * pageSize + 1, sorted.length)}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
        </span>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button onClick={() => setPage(1)} disabled={page === 1} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '4px 8px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}><ChevronsLeft size={13} /></button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '4px 8px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}><ChevronLeft size={13} /></button>
          <span style={{ fontSize: '12.5px', color: 'var(--color-text-primary)', padding: '4px 12px', fontWeight: '700' }}>Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '4px 8px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}><ChevronRight size={13} /></button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '4px 8px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}><ChevronsRight size={13} /></button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DataTable);

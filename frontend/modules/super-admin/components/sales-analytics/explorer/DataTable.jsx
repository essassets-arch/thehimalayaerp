import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Search, Download, Printer, Copy, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Maximize2, Minimize2, RefreshCw, Check } from 'lucide-react';
import { printReport, copyToClipboard } from '../../../utils/export.js';

const DENSITIES = { 
  compact: '6px 10px', 
  default: '12px 16px', 
  comfortable: '18px 20px' 
};

const DataTable = ({ title, columns: rawColumns, data = [], onDrilldown, pageSize = 10 }) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [density, setDensity] = useState('default');
  const [fullscreen, setFullscreen] = useState(false);
  const [visibleCols, setVisibleCols] = useState(() => rawColumns.map(c => c.accessor));
  const [showColSelector, setShowColSelector] = useState(false);
  const [copied, setCopied] = useState(false);

  const colSelectorRef = useRef(null);

  // Close column selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colSelectorRef.current && !colSelectorRef.current.contains(event.target)) {
        setShowColSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const columns = useMemo(() => rawColumns.filter(c => visibleCols.includes(c.accessor)), [rawColumns, visibleCols]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase().trim();
    return data.filter(row =>
      Object.values(row).some(v => String(v ?? '').toLowerCase().includes(q))
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

  const handleExportCSV = useCallback(() => {
    if (!sorted || !sorted.length) return;
    const activeCols = rawColumns.filter(c => visibleCols.includes(c.accessor));
    const headers = activeCols.map(c => `"${(c.header || c.accessor).replace(/"/g, '""')}"`).join(',');
    const rows = sorted.map(row => 
      activeCols.map(c => {
        const val = row[c.accessor] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [sorted, rawColumns, visibleCols, title]);

  const handleCopy = useCallback(() => {
    const activeCols = rawColumns.filter(c => visibleCols.includes(c.accessor));
    const headerLine = activeCols.map(c => c.header || c.accessor).join('\t');
    const textLines = sorted.map(row => activeCols.map(c => row[c.accessor] ?? '').join('\t'));
    const fullText = [headerLine, ...textLines].join('\n');
    copyToClipboard(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, [sorted, rawColumns, visibleCols]);

  const handleReset = useCallback(() => {
    setSearch('');
    setSortKey(null);
    setSortDir('asc');
    setPage(1);
    setVisibleCols(rawColumns.map(c => c.accessor));
  }, [rawColumns]);

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ArrowUpDown size={11} style={{ opacity: 0.35 }} />;
    return sortDir === 'asc' ? <ArrowUp size={11} style={{ color: '#4f46e5' }} /> : <ArrowDown size={11} style={{ color: '#4f46e5' }} />;
  };

  const wrapStyle = fullscreen
    ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: '#F5FAFE', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column' }
    : {};

  const cellPad = DENSITIES[density] || DENSITIES.default;

  return (
    <div style={{ padding: 0, overflow: 'hidden', ...wrapStyle }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #D6E2F0', flexWrap: 'wrap', gap: '12px', background: '#fff' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: '850', color: '#24345C' }}>{title}</h3>
          <span style={{ fontSize: '11px', color: '#5E6B82' }}>{filtered.length} records</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Search all columns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', borderRadius: '8px', padding: '6px 12px', border: '1px solid #D6E2F0' }}>
            <Search size={13} color="#5E6B82" />
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Search all columns..."
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '12.5px', width: '170px', color: '#24345C' }}
            />
          </div>

          {/* Density Selector */}
          <select 
            value={density} 
            onChange={e => setDensity(e.target.value)}
            style={{ background: '#fff', border: '1px solid #D6E2F0', borderRadius: '8px', padding: '7px 10px', fontSize: '12px', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
          >
            <option value="default">Default</option>
            <option value="compact">Compact</option>
            <option value="comfortable">Comfortable</option>
          </select>

          {/* Column Visibility Selector */}
          <div style={{ position: 'relative' }} ref={colSelectorRef}>
            <button 
              onClick={() => setShowColSelector(s => !s)} 
              title="Column visibility"
              style={{ background: '#f1f5f9', border: '1px solid #D6E2F0', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: '600' }}
            >
              <Eye size={13} /> Columns
            </button>
            {showColSelector && (
              <div style={{ position: 'absolute', right: 0, top: '40px', background: '#fff', border: '1px solid #D6E2F0', borderRadius: '10px', padding: '12px 14px', zIndex: 9999, minWidth: '220px', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', maxHeight: '320px', overflowY: 'auto' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>Toggle Visible Columns</div>
                {rawColumns.map(col => (
                  <label key={col.accessor} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', marginBottom: '8px', cursor: 'pointer', userSelect: 'none' }}>
                    <input 
                      type="checkbox" 
                      checked={visibleCols.includes(col.accessor)} 
                      onChange={() => toggleCol(col.accessor)} 
                      style={{ accentColor: '#4f46e5', cursor: 'pointer' }}
                    />
                    {col.header}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV */}
          <button 
            onClick={handleExportCSV} 
            title="Export CSV"
            style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold' }}
          >
            <Download size={13} /> CSV
          </button>

          {/* Export PDF / Print */}
          <button 
            onClick={printReport} 
            title="Print"
            style={{ background: '#24345C', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold' }}
          >
            <Printer size={13} /> Print
          </button>

          {/* Copy to Clipboard */}
          <button 
            onClick={handleCopy} 
            title="Copy table to clipboard"
            style={{ background: copied ? '#dcfce7' : '#f1f5f9', border: `1px solid ${copied ? '#16a34a' : '#D6E2F0'}`, borderRadius: '8px', padding: '7px 10px', cursor: 'pointer', color: copied ? '#16a34a' : '#475569', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
          </button>

          {/* Fullscreen */}
          <button 
            onClick={() => setFullscreen(s => !s)} 
            title="Toggle Fullscreen"
            style={{ background: '#f1f5f9', border: '1px solid #D6E2F0', borderRadius: '8px', padding: '7px 10px', cursor: 'pointer', color: '#475569' }}
          >
            {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          {/* Reset / Refresh */}
          <button 
            onClick={handleReset} 
            title="Reset Search and Filters"
            style={{ background: '#f1f5f9', border: '1px solid #D6E2F0', borderRadius: '8px', padding: '7px 10px', cursor: 'pointer', color: '#475569' }}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: '#F5FAFE', borderBottom: '2px solid #D6E2F0' }}>
              {columns.map(col => (
                <th 
                  key={col.accessor}
                  onClick={() => handleSort(col.accessor)}
                  style={{ padding: cellPad, textAlign: 'left', fontWeight: '800', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}
                >
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
                  No matching transaction records found.
                </td>
              </tr>
            ) : paged.map((row, idx) => (
              <tr 
                key={idx} 
                style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 0 ? '#fff' : '#FAFBFD', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F0F9FF'}
                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#FAFBFD'}
              >
                {columns.map(col => (
                  <td key={col.accessor} style={{ padding: cellPad, color: '#1E293B', whiteSpace: 'nowrap', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {col.render ? col.render(row) : (row[col.accessor] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderTop: '1px solid #D6E2F0', flexWrap: 'wrap', gap: '8px', background: '#fff' }}>
        <span style={{ fontSize: '12px', color: '#5E6B82' }}>
          Showing {sorted.length > 0 ? Math.min((page - 1) * pageSize + 1, sorted.length) : 0}–{Math.min(page * pageSize, sorted.length)} of {sorted.length} records
        </span>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button onClick={() => setPage(1)} disabled={page === 1} style={{ background: 'none', border: '1px solid #D6E2F0', borderRadius: '6px', padding: '4px 8px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}><ChevronsLeft size={13} /></button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: 'none', border: '1px solid #D6E2F0', borderRadius: '6px', padding: '4px 8px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}><ChevronLeft size={13} /></button>
          <span style={{ fontSize: '12.5px', color: '#24345C', padding: '4px 12px', fontWeight: '700' }}>Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ background: 'none', border: '1px solid #D6E2F0', borderRadius: '6px', padding: '4px 8px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}><ChevronRight size={13} /></button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={{ background: 'none', border: '1px solid #D6E2F0', borderRadius: '6px', padding: '4px 8px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}><ChevronsRight size={13} /></button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DataTable);

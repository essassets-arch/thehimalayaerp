'use client';
import React, { useState } from 'react';
import { useERPStore } from '../../../store/erpStore';

const STATUS_COLORS = {
  'PENDING_PLANT_HEAD_APPROVAL': { bg: '#FEF3C7', color: '#92400E', label: 'Pending Approval' },
  'PLANT_HEAD_APPROVED':         { bg: '#D1FAE5', color: '#065F46', label: 'Approved' },
  'PLANT_HEAD_CORRECTION_REQUIRED': { bg: '#FEF3C7', color: '#D97706', label: 'Correction Required' },
  'PLANT_HEAD_REJECTED':         { bg: '#FEE2E2', color: '#B91C1C', label: 'Rejected' },
  'INDENT_CANCELLED':            { bg: '#F1F5F9', color: '#64748B', label: 'Cancelled' },
  'DRAFT_PO_CREATED':            { bg: '#DBEAFE', color: '#1D4ED8', label: 'PO Draft Created' },
  'PROCUREMENT_IN_PROGRESS':     { bg: '#E0F2FE', color: '#0369A1', label: 'In Progress' },
  'PROCUREMENT_COMPLETED':       { bg: '#D1FAE5', color: '#047857', label: 'Completed' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#F1F5F9', color: '#475569', label: status };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
      fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

export default function IndentHistory({ hideHeader = false } = {}) {
  const purchaseIndents = useERPStore(s => s.state?.procurement?.materialIndents || []);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filters = ['All', 'Pending Approval', 'Approved', 'Correction Required', 'Rejected', 'Completed'];

  const statusMap = {
    'Pending Approval':     'PENDING_PLANT_HEAD_APPROVAL',
    'Approved':             'PLANT_HEAD_APPROVED',
    'Correction Required':  'PLANT_HEAD_CORRECTION_REQUIRED',
    'Rejected':             'PLANT_HEAD_REJECTED',
    'Completed':            'PROCUREMENT_COMPLETED',
  };

  const filtered = purchaseIndents.filter(ind => {
    const matchFilter = filter === 'All' || ind.status === statusMap[filter];
    const q = search.toLowerCase();
    const matchSearch = !q
      || (ind.id || '').toLowerCase().includes(q)
      || (ind.department || '').toLowerCase().includes(q)
      || (ind.items || []).some(i => (i.product?.name || i.materialId || i.materialName || '').toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  // Summary counts
  const counts = {
    total:     purchaseIndents.length,
    pending:   purchaseIndents.filter(i => i.status === 'PENDING_PLANT_HEAD_APPROVAL').length,
    approved:  purchaseIndents.filter(i => i.status === 'PLANT_HEAD_APPROVED').length,
    rejected:  purchaseIndents.filter(i => i.status === 'PLANT_HEAD_REJECTED').length,
    converted: purchaseIndents.filter(i => ['DRAFT_PO_CREATED', 'PROCUREMENT_IN_PROGRESS', 'PROCUREMENT_COMPLETED'].includes(i.status)).length,
  };

  const thStyle = {
    padding: '12px 16px', textAlign: 'left', fontSize: '11px',
    fontWeight: 800, color: '#5E6B82', textTransform: 'uppercase',
    letterSpacing: '0.5px', background: '#F5FAFE',
    borderBottom: '2px solid #E5ECF5', whiteSpace: 'nowrap',
  };
  const tdStyle = {
    padding: '13px 16px', fontSize: '13px', color: '#24345C',
    borderBottom: '1px solid #F0F5FA', verticalAlign: 'middle',
  };

  const kpiStyle = (accent) => ({
    background: '#fff', border: `1px solid ${accent}30`,
    borderLeft: `4px solid ${accent}`, borderRadius: '10px',
    padding: '14px 18px', flex: '1', minWidth: '110px',
  });

  return (
    <div>
      {/* Page Header */}
      {!hideHeader && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#24345C' }}>
            📂 Indent History
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#5E6B82' }}>
            View all material indent requests submitted to Plant Head for approval
          </p>
        </div>
      )}

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[
          { label: 'Total Indents',   value: counts.total,     accent: '#2F4375' },
          { label: 'Pending',         value: counts.pending,   accent: '#D97706' },
          { label: 'Approved',        value: counts.approved,  accent: '#059669' },
          { label: 'Rejected',        value: counts.rejected,  accent: '#DC2626' },
          { label: 'Converted to PO', value: counts.converted, accent: '#2563EB' },
        ].map(({ label, value, accent }) => (
          <div key={label} style={kpiStyle(accent)}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: accent }}>{value}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#5E6B82', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by indent ID, department, material..."
          style={{
            flex: '1', minWidth: '200px', padding: '8px 12px',
            border: '1px solid #DCE5F0', borderRadius: '8px',
            fontSize: '13px', outline: 'none', color: '#24345C',
          }}
        />
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 14px', borderRadius: '20px', border: '1px solid',
            borderColor: filter === f ? '#2F4375' : '#DCE5F0',
            background: filter === f ? '#2F4375' : '#fff',
            color: filter === f ? '#fff' : '#5E6B82',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Table or Empty */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '56px 24px',
          background: '#F9FBFE', borderRadius: '12px', border: '1px dashed #DCE5F0',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#24345C' }}>No indent requests found</p>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#5E6B82' }}>
            {search || filter !== 'All' ? 'Try clearing your filters.' : 'Use "Create Request" to raise your first material indent.'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #E5ECF5' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
            <thead>
              <tr>
                {['Indent ID', 'Department', 'Required By', 'Items', 'Submitted On', 'Status', 'Remarks', ''].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(ind => {
                const isExpanded = expandedId === ind.id;
                const items = ind.items || [];
                return (
                  <React.Fragment key={ind.id}>
                    <tr
                      style={{ transition: 'background 0.15s', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FBFE'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={tdStyle}>
                        <strong style={{ color: '#0369a1', fontFamily: 'monospace', fontSize: '12px' }}>
                          {ind.id?.slice(0, 16) || '—'}
                        </strong>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                          background: '#EFF6FF', color: '#1D4ED8', fontSize: '12px', fontWeight: 600,
                        }}>
                          {ind.department || '—'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {ind.requiredDate ? new Date(ind.requiredDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 700, color: '#2F4375' }}>{items.length}</span>
                        <span style={{ color: '#5E6B82', fontSize: '12px' }}> item{items.length !== 1 ? 's' : ''}</span>
                      </td>
                      <td style={tdStyle}>
                        {ind.createdAt ? new Date(ind.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td style={tdStyle}><StatusBadge status={ind.status} /></td>
                      <td style={{ ...tdStyle, maxWidth: '160px', color: '#5E6B82', fontSize: '12px' }}>
                        {ind.plantHeadRemarks || '—'}
                      </td>
                      <td style={tdStyle}>
                        {items.length > 0 && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : ind.id)}
                            style={{
                              border: '1px solid #DCE5F0', borderRadius: '6px',
                              background: '#fff', color: '#5E6B82', padding: '4px 10px',
                              fontSize: '12px', cursor: 'pointer', fontWeight: 600,
                            }}
                          >
                            {isExpanded ? '▲ Hide' : '▼ Items'}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} style={{ padding: '0 16px 16px 16px', background: '#F9FBFE' }}>
                          <div style={{
                            border: '1px solid #E5ECF5', borderRadius: '8px',
                            overflow: 'hidden', marginTop: '4px',
                          }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ background: '#EFF6FF' }}>
                                  {['#', 'Material Name/Code', 'Quantity', 'Unit', 'Reason'].map(h => (
                                    <th key={h} style={{ ...thStyle, background: 'transparent', padding: '8px 12px', fontSize: '10px' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {items.map((item, idx) => (
                                  <tr key={idx}>
                                    <td style={{ ...tdStyle, padding: '8px 12px', color: '#5E6B82' }}>{idx + 1}</td>
                                    <td style={{ ...tdStyle, padding: '8px 12px', fontWeight: 600 }}>{item.product?.name || item.materialName || item.materialId || '—'}</td>
                                    <td style={{ ...tdStyle, padding: '8px 12px' }}>{item.quantity || '—'}</td>
                                    <td style={{ ...tdStyle, padding: '8px 12px' }}>{item.unit || 'Nos'}</td>
                                    <td style={{ ...tdStyle, padding: '8px 12px', color: '#5E6B82' }}>{item.reason || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

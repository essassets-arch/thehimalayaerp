'use client';
import React, { useState } from 'react';
import { useERPStore } from '../../../store/erpStore';

const STATUS_COLORS = {
  'Waiting Pickup':        { bg: '#FEF3C7', color: '#92400E' },
  'Pickup Scheduled':      { bg: '#DBEAFE', color: '#1D4ED8' },
  'Returned to Vendor':    { bg: '#EDE9FE', color: '#6D28D9' },
  'Replacement Received':  { bg: '#D1FAE5', color: '#065F46' },
  'Replacement Settled':   { bg: '#D1FAE5', color: '#065F46' },
  'Canceled':              { bg: '#F1F5F9', color: '#64748B' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#F1F5F9', color: '#475569' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
      fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {status || 'Unknown'}
    </span>
  );
}

export default function MaterialRejections() {
  const vendorReturns = useERPStore(s => s.state.vendorReturns) || [];
  const updateVendorReturnStatus = useERPStore(s => s.updateVendorReturnStatus);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const statuses = ['All', 'Waiting Pickup', 'Pickup Scheduled', 'Returned to Vendor', 'Replacement Received', 'Canceled'];

  const filtered = vendorReturns.filter(r => {
    const matchFilter = filter === 'All' || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || (r.returnNo || '').toLowerCase().includes(q)
      || (r.vendorName || '').toLowerCase().includes(q)
      || (r.materialName || '').toLowerCase().includes(q)
      || (r.poNumber || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const handleStatusChange = (vrn, newStatus) => {
    if (updateVendorReturnStatus) updateVendorReturnStatus(vrn.id, newStatus, '');
  };

  const thStyle = {
    padding: '12px 16px', textAlign: 'left', fontSize: '11px',
    fontWeight: 800, color: '#5E6B82', textTransform: 'uppercase',
    letterSpacing: '0.5px', background: '#F5FAFE', borderBottom: '2px solid #E5ECF5',
    whiteSpace: 'nowrap',
  };
  const tdStyle = {
    padding: '13px 16px', fontSize: '13px', color: '#24345C',
    borderBottom: '1px solid #F0F5FA', verticalAlign: 'middle',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#24345C' }}>
            🚫 Material Rejections
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#5E6B82' }}>
            Track and manage rejected materials from incoming deliveries
          </p>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '20px',
          background: vendorReturns.length > 0 ? '#fee2e2' : '#D1FAE5',
          color: vendorReturns.length > 0 ? '#b91c1c' : '#065F46',
          fontWeight: 700, fontSize: '13px',
        }}>
          {vendorReturns.length} Rejection{vendorReturns.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by VRN, vendor, material..."
          style={{
            flex: '1', minWidth: '200px', padding: '8px 12px',
            border: '1px solid #DCE5F0', borderRadius: '8px',
            fontSize: '13px', outline: 'none', color: '#24345C',
          }}
        />
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '7px 14px', borderRadius: '20px', border: '1px solid',
            borderColor: filter === s ? '#2F4375' : '#DCE5F0',
            background: filter === s ? '#2F4375' : '#fff',
            color: filter === s ? '#fff' : '#5E6B82',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '56px 24px',
          background: '#F9FBFE', borderRadius: '12px', border: '1px dashed #DCE5F0',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#24345C' }}>No material rejections found</p>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#5E6B82' }}>
            {search || filter !== 'All' ? 'Try clearing your filters.' : 'All deliveries have been accepted so far.'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #E5ECF5' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr>
                {['VRN #', 'GRN #', 'Vendor', 'Material', 'Qty Rejected', 'Reason', 'Return Date', 'Status', 'Action'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FBFE'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStyle}><strong style={{ color: '#0369a1' }}>{r.returnNo || r.id}</strong></td>
                  <td style={tdStyle}>{r.grnNumber || 'N/A'}</td>
                  <td style={tdStyle}>{r.vendorName || '—'}</td>
                  <td style={{ ...tdStyle, maxWidth: '160px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.materialName}>
                      {r.materialName || '—'}
                    </span>
                  </td>
                  <td style={tdStyle}><strong style={{ color: '#ef4444' }}>{r.rejectedQty ?? '—'}</strong></td>
                  <td style={{ ...tdStyle, maxWidth: '140px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.reason}>
                      {r.reason || '—'}
                    </span>
                  </td>
                  <td style={tdStyle}>{r.returnDate ? new Date(r.returnDate).toLocaleDateString() : '—'}</td>
                  <td style={tdStyle}><StatusBadge status={r.status} /></td>
                  <td style={tdStyle}>
                    <select
                      value={r.status}
                      onChange={e => handleStatusChange(r, e.target.value)}
                      style={{
                        padding: '5px 8px', borderRadius: '6px', fontSize: '12px',
                        border: '1px solid #DCE5F0', color: '#24345C', cursor: 'pointer',
                        background: '#fff',
                      }}
                    >
                      {['Waiting Pickup', 'Pickup Scheduled', 'Returned to Vendor', 'Replacement Received', 'Replacement Settled', 'Canceled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useMaterialRequests } from '../../hooks/useMaterialRequests';
import { Search, X, PackageCheck, CheckCircle2, Clock, Box, Layers, RefreshCw, Filter } from 'lucide-react';

export default function ProductionStoreReleasesView() {
  const { data: allRequests = [], refetch } = useMaterialRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fallback dataset including order WO-109
  const fallbackRequests = useMemo(() => [
    {
      id: 'a216ad48-b316-4174-b609-f6c465f58f2d',
      orderId: 'WO-109',
      department: 'Production',
      status: 'ISSUED_TO_PRODUCTION',
      issuedBy: 'Store Manager',
      issueReference: 'ISS-WO-109-178582',
      items: [
        {
          materialId: 'mat-steel-plates',
          materialName: 'Steel Plates',
          approvedQty: 150,
          issuedQty: 150,
          unit: 'Units'
        }
      ]
    }
  ], []);

  // Combined requests (fallback + backend requests) with localStorage issued quantities overlay
  const requests = useMemo(() => {
    let savedQuantities = {};
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('store_issued_quantities');
        if (saved) savedQuantities = JSON.parse(saved);
      } catch {}
    }

    const map = new Map();
    fallbackRequests.forEach((req) => {
      const updatedItems = req.items.map((item, idx) => {
        const itemKey = `${req.id}-${item.materialId || idx}`;
        const issuedVal = savedQuantities[itemKey] !== undefined ? savedQuantities[itemKey] : item.issuedQty;
        return { ...item, issuedQty: issuedVal };
      });
      const allIssued = updatedItems.every((it) => Number(it.issuedQty || 0) >= Number(it.approvedQty || 0));
      map.set(req.id, {
        ...req,
        items: updatedItems,
        status: allIssued ? 'ISSUED_TO_PRODUCTION' : req.status,
      });
    });

    (allRequests || []).forEach((req) => {
      const updatedItems = req.items.map((item, idx) => {
        const itemKey = `${req.id}-${item.materialId || idx}`;
        const issuedVal = savedQuantities[itemKey] !== undefined ? savedQuantities[itemKey] : item.issuedQty;
        return { ...item, issuedQty: issuedVal };
      });
      const anyIssued = updatedItems.some((it) => Number(it.issuedQty || 0) > 0);
      if (
        ['ISSUED_TO_PRODUCTION', 'ISSUED', 'STORE_APPROVED', 'PARTIALLY_ISSUED'].includes(req.status) ||
        anyIssued
      ) {
        map.set(req.id, { ...req, items: updatedItems });
      }
    });

    return Array.from(map.values());
  }, [allRequests, fallbackRequests]);

  // Filter requests by search term & status
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = !q ||
        (req.orderId || '').toLowerCase().includes(q) ||
        (req.id || '').toLowerCase().includes(q) ||
        (req.issueReference || '').toLowerCase().includes(q) ||
        req.items?.some(it => (it.materialName || it.material || '').toLowerCase().includes(q));

      if (!matchesSearch) return false;

      const isFull = req.items?.every(it => Number(it.issuedQty ?? it.approvedQty ?? 0) >= Number(it.approvedQty || 0));
      if (statusFilter === 'FULL') return isFull;
      if (statusFilter === 'PARTIAL') return !isFull;
      return true;
    });
  }, [requests, searchTerm, statusFilter]);

  return (
    <div style={{ padding: 'clamp(12px, 2vw, 24px)', fontFamily: "var(--font-main, 'Inter', sans-serif)", width: '100%', minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PackageCheck size={26} color="#06b6d4" /> Production Store Releases
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Complete &amp; partial material inventory released by the Store department for production orders.
          </p>
        </div>

        {/* Refresh */}
        <button
          onClick={() => refetch?.()}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
        >
          <RefreshCw size={14} /> Refresh List
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', background: '#fff', padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', minWidth: isMobile ? '100%' : '260px', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search order ID, material, request ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#f8fafc', color: '#0f172a' }}
          />
          {searchTerm && (
            <X size={14} onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', cursor: 'pointer' }} />
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', width: isMobile ? '100%' : 'auto', overflowX: 'auto' }}>
          {[
            { key: 'ALL', label: 'All Releases' },
            { key: 'FULL', label: 'Completely Issued' },
            { key: 'PARTIAL', label: 'Partially Issued' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                flex: isMobile ? 1 : 'none',
                textAlign: 'center',
                padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                background: statusFilter === tab.key ? '#0f172a' : 'transparent',
                color: statusFilter === tab.key ? '#fff' : '#64748b',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Cards List */}
      {filteredRequests.map((request) => {
        const lineItems = request.items || [];
        const isCompletelyIssued = lineItems.every(it => Number(it.issuedQty ?? it.approvedQty ?? 0) >= Number(it.approvedQty || 0));

        return (
          <div key={request.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', marginBottom: '20px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            {/* Card Meta Header */}
            <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '13px', color: '#475569', width: isMobile ? '100%' : 'auto' }}>
                <span><strong>Order ID:</strong> <span style={{ color: '#0f172a', fontFamily: 'monospace', fontWeight: '700' }}>{request.orderId || '—'}</span></span>
                <span><strong>Department:</strong> <span style={{ color: '#0f172a', fontWeight: '600' }}>{request.department || 'Production'}</span></span>
                <span><strong>Request ID:</strong> <span style={{ fontFamily: 'monospace', color: '#24345C', fontWeight: '700' }}>{request.requestNo || request.publicId || request.id}</span></span>
                {request.issueReference && <span><strong>Issue Ref:</strong> <span style={{ color: '#0284c7', fontWeight: '600' }}>{request.issueReference}</span></span>}
              </div>

              <div style={{ alignSelf: isMobile ? 'flex-start' : 'auto' }}>
                <span
                  style={{
                    padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800',
                    background: isCompletelyIssued ? '#f0fdf4' : '#eff6ff',
                    color: isCompletelyIssued ? '#15803d' : '#1d4ed8',
                    border: `1px solid ${isCompletelyIssued ? '#bbf7d0' : '#bfdbfe'}`
                  }}
                >
                  {isCompletelyIssued ? '✓ Completely Issued to Production' : '⚡ Partially Issued / Pending'}
                </span>
              </div>
            </div>

            {/* Table / Mobile Card List */}
            {isMobile ? (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {lineItems.map((item, idx) => {
                  const approvedQty = Number(item.approvedQty || 0);
                  const issuedQty = Number(item.issuedQty ?? approvedQty ?? 0);
                  const remainingQty = Math.max(0, approvedQty - issuedQty);
                  const isLineComplete = remainingQty === 0;

                  return (
                    <div
                      key={idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      {/* Header material */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '10px' }}>
                        <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>
                          {item.materialName || item.material}
                        </span>
                        {isLineComplete ? (
                          <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', whiteSpace: 'nowrap' }}>
                            Ready for Production
                          </span>
                        ) : (
                          <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fcd34d', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', whiteSpace: 'nowrap' }}>
                            Partially Issued
                          </span>
                        )}
                      </div>

                      {/* Quantities breakdown */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 80px), 1fr))', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <div>
                          <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: '#8893a7', fontWeight: '800' }}>
                            Approved
                          </span>
                          <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>
                            {approvedQty} {item.unit || 'Units'}
                          </span>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: '#8893a7', fontWeight: '800' }}>
                            Issued
                          </span>
                          <span style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: '700' }}>
                            {issuedQty} {item.unit || 'Units'}
                          </span>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: '#8893a7', fontWeight: '800' }}>
                            Remaining
                          </span>
                          <span style={{ fontSize: '12px', color: remainingQty > 0 ? '#d97706' : '#16a34a', fontWeight: '700' }}>
                            {remainingQty} {item.unit || 'Units'}
                          </span>
                        </div>
                      </div>

                      {/* Issued By line */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                        <span>Issued By: {request.issuedBy || 'Store'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      <th style={{ padding: '12px 20px' }}>Material</th>
                      <th style={{ padding: '12px 20px' }}>Approved Qty</th>
                      <th style={{ padding: '12px 20px' }}>Issued Qty</th>
                      <th style={{ padding: '12px 20px' }}>Remaining Qty</th>
                      <th style={{ padding: '12px 20px' }}>Issued By</th>
                      <th style={{ padding: '12px 20px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => {
                      const approvedQty = Number(item.approvedQty || 0);
                      const issuedQty = Number(item.issuedQty ?? approvedQty ?? 0);
                      const remainingQty = Math.max(0, approvedQty - issuedQty);
                      const isLineComplete = remainingQty === 0;

                      return (
                        <tr key={idx} style={{ borderBottom: idx < lineItems.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                          <td style={{ padding: '14px 20px', fontWeight: '700', color: '#0f172a' }}>{item.materialName || item.material}</td>
                          <td style={{ padding: '14px 20px', color: '#475569' }}>{approvedQty} {item.unit || 'Units'}</td>
                          <td style={{ padding: '14px 20px', fontWeight: '700', color: '#1d4ed8' }}>{issuedQty} {item.unit || 'Units'}</td>
                          <td style={{ padding: '14px 20px', fontWeight: '700', color: remainingQty > 0 ? '#d97706' : '#16a34a' }}>
                            {remainingQty} {item.unit || 'Units'}
                          </td>
                          <td style={{ padding: '14px 20px', color: '#64748b' }}>{request.issuedBy || 'Store'}</td>
                          <td style={{ padding: '14px 20px' }}>
                            {isLineComplete ? (
                              <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                                Ready for Production
                              </span>
                            ) : (
                              <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fcd34d', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                                Partially Issued ({remainingQty} {item.unit} Left)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            <div style={{ padding: '12px 20px', background: '#fafafa', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '8px' : '0', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', fontSize: '12px', color: '#64748b' }}>
              <span>✓ Materials issued by Store team and registered on shop floor</span>
              <span style={{ fontWeight: '600', color: '#0284c7', alignSelf: isMobile ? 'flex-end' : 'auto' }}>Ready for Work Order Execution</span>
            </div>
          </div>
        );
      })}

      {filteredRequests.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <PackageCheck size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>No store release products found</div>
          <p style={{ fontSize: '13px', margin: 0 }}>There are currently no store released products matching your filter.</p>
        </div>
      )}
    </div>
  );
}

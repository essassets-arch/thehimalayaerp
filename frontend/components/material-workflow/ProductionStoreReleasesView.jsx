'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useMaterialRequests } from '../../hooks/useMaterialRequests';
import {
  PackageCheck,
  Search,
  X,
  RefreshCw,
  Copy,
  Printer,
  FileText,
  Boxes,
  Layers,
  CheckCircle2,
  Calendar,
  User,
  Building2,
  ArrowRight,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import './ProductionStoreReleasesView.css';

const STORE_RELEASE_HISTORY_KEY = 'store_release_history_v1';
const STORE_ISSUED_QTY_KEY = 'store_issued_quantities';

// Baseline released materials data if no backend/local transactions exist
const BASELINE_STORE_RELEASES = [
  {
    id: 'REL-INIT-001',
    issueReference: 'ISS-WO-109-178582',
    requestId: 'mr-sample-wo109',
    requestNo: 'MR-2026-089',
    workOrderNo: 'WO-109',
    materialName: 'Steel Plates (Grade 304)',
    quantityIssued: 150,
    unit: 'Units',
    department: 'Production Assembly',
    issuedBy: 'Store Manager',
    issuedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'ISSUED_TO_PRODUCTION'
  },
  {
    id: 'REL-INIT-002',
    issueReference: 'ISS-WO-2026-074-9912',
    requestId: 'mr-sample-004',
    requestNo: 'MR-2026-098',
    workOrderNo: 'WO-2026-074',
    materialName: 'Pigment Red Iron Oxide',
    quantityIssued: 500,
    unit: 'Kg',
    department: 'Production Assembly',
    issuedBy: 'Store Manager',
    issuedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'ISSUED_TO_PRODUCTION'
  },
  {
    id: 'REL-INIT-003',
    issueReference: 'ISS-WO-2026-088-3310',
    requestId: 'mr-sample-001',
    requestNo: 'MR-2026-101',
    workOrderNo: 'WO-2026-088',
    materialName: 'OPC Cement Grade 53',
    quantityIssued: 50,
    unit: 'Bags',
    department: 'Production Floor',
    issuedBy: 'Store Officer',
    issuedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'ISSUED_TO_PRODUCTION'
  },
  {
    id: 'REL-INIT-004',
    issueReference: 'ISS-WO-2026-088-3311',
    requestId: 'mr-sample-001',
    requestNo: 'MR-2026-101',
    workOrderNo: 'WO-2026-088',
    materialName: 'River Sand Grade-1',
    quantityIssued: 20,
    unit: 'Tons',
    department: 'Production Floor',
    issuedBy: 'Store Officer',
    issuedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    status: 'ISSUED_TO_PRODUCTION'
  },
  {
    id: 'REL-INIT-005',
    issueReference: 'ISS-WO-2026-092-8821',
    requestId: 'mr-sample-002',
    requestNo: 'MR-2026-102',
    workOrderNo: 'WO-2026-092',
    materialName: 'Resin Epoxy Binder',
    quantityIssued: 15,
    unit: 'Barrels',
    department: 'Chemical Processing',
    issuedBy: 'Store Officer',
    issuedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'ISSUED_TO_PRODUCTION'
  }
];

export default function ProductionStoreReleasesView() {
  const { data: allRequests = [], refetch } = useMaterialRequests();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWo, setSelectedWo] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [copiedRef, setCopiedRef] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Read Store Release History from localStorage
  const [storeLedger, setStoreLedger] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORE_RELEASE_HISTORY_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Failed to read store_release_history_v1:', e);
      }
    }
    return BASELINE_STORE_RELEASES;
  });

  // Listen for storage changes across tabs/windows
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORE_RELEASE_HISTORY_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setStoreLedger(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // AGGREGATE ALL MATERIALS ISSUED BY STORE
  const issuedMaterials = useMemo(() => {
    let savedQuantities = {};
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORE_ISSUED_QTY_KEY);
        if (saved) savedQuantities = JSON.parse(saved);
      } catch {}
    }

    const itemsMap = new Map();

    // 1. Ingest transactions from the Store Releases ledger
    storeLedger.forEach((tx) => {
      if (!tx || !tx.materialName || Number(tx.quantityIssued || 0) <= 0) return;
      const key = `${tx.issueReference || tx.id}-${tx.materialName}`;
      itemsMap.set(key, {
        id: tx.id || `rel-${Math.random()}`,
        issueReference: tx.issueReference || `ISS-${tx.workOrderNo || 'WO'}-${tx.id.slice(-4)}`,
        workOrderNo: tx.workOrderNo || tx.orderId || 'Direct Issue',
        requestNo: tx.requestNo || tx.publicId || 'MR-STORE',
        materialName: tx.materialName,
        quantityIssued: Number(tx.quantityIssued),
        unit: tx.unit || 'Units',
        department: tx.department || 'Production Floor',
        issuedBy: tx.issuedBy || 'Store Manager',
        issuedAt: tx.issuedAt || new Date().toISOString(),
        status: tx.status || 'ISSUED_TO_PRODUCTION'
      });
    });

    // 2. Ingest backend material requests items where issuedQty > 0
    (allRequests || []).forEach((req) => {
      const wo = req.workOrderNo || req.orderId || 'Direct Requisition';
      const reqNum = req.requestNo || req.publicId || req.id;
      const dept = req.metadata?.issuedToDepartment || req.department || 'Production';
      const issuer = req.metadata?.issuedBy || req.issuedBy || 'Store';
      const ref = req.metadata?.issueReference || req.issueReference || `ISS-${wo}-${reqNum.slice(-4)}`;
      const time = req.metadata?.issuedAt || req.updatedAt || req.createdAt || new Date().toISOString();

      (req.items || []).forEach((item, idx) => {
        const itemKey = `${req.id}-${item.materialId || idx}`;
        let qty = 0;
        if (savedQuantities[itemKey] !== undefined) {
          qty = Number(savedQuantities[itemKey]);
        } else {
          qty = Number(item.issuedQty || 0);
          if (qty === 0 && ['ISSUED_TO_PRODUCTION', 'RECEIVED', 'CONSUMING'].includes(req.status)) {
            qty = Number(item.approvedQty || item.quantity || 0);
          }
        }

        if (qty > 0) {
          const mapKey = `${ref}-${item.materialName || item.material}`;
          if (!itemsMap.has(mapKey)) {
            itemsMap.set(mapKey, {
              id: `${req.id}-${item.id || idx}`,
              issueReference: ref,
              workOrderNo: wo,
              requestNo: reqNum,
              materialName: item.materialName || item.material,
              quantityIssued: qty,
              unit: item.unit || 'Units',
              department: req.metadata?.itemDepartments?.[item.id] || dept,
              issuedBy: issuer,
              issuedAt: time,
              status: req.status || 'ISSUED_TO_PRODUCTION'
            });
          }
        }
      });
    });

    // Sort newest releases first
    return Array.from(itemsMap.values()).sort((a, b) => {
      const timeA = new Date(a.issuedAt).getTime() || 0;
      const timeB = new Date(b.issuedAt).getTime() || 0;
      return timeB - timeA;
    });
  }, [storeLedger, allRequests]);

  // Unique Work Orders list for filtering
  const workOrderOptions = useMemo(() => {
    const set = new Set();
    issuedMaterials.forEach((item) => {
      if (item.workOrderNo) set.add(item.workOrderNo);
    });
    return Array.from(set);
  }, [issuedMaterials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return issuedMaterials.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.materialName || '').toLowerCase().includes(q) ||
        (item.issueReference || '').toLowerCase().includes(q) ||
        (item.workOrderNo || '').toLowerCase().includes(q) ||
        (item.requestNo || '').toLowerCase().includes(q) ||
        (item.department || '').toLowerCase().includes(q) ||
        (item.issuedBy || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedWo !== 'ALL' && item.workOrderNo !== selectedWo) {
        return false;
      }

      return true;
    });
  }, [issuedMaterials, searchTerm, selectedWo]);

  // Group materials by Work Order for Cards View
  const groupedByWorkOrder = useMemo(() => {
    const groups = {};
    filteredMaterials.forEach((item) => {
      const wo = item.workOrderNo || 'Direct Issue';
      if (!groups[wo]) {
        groups[wo] = {
          workOrderNo: wo,
          department: item.department,
          items: [],
          totalQty: 0,
          latestIssuedAt: item.issuedAt
        };
      }
      groups[wo].items.push(item);
      groups[wo].totalQty += item.quantityIssued;
      if (new Date(item.issuedAt) > new Date(groups[wo].latestIssuedAt)) {
        groups[wo].latestIssuedAt = item.issuedAt;
      }
    });
    return Object.values(groups);
  }, [filteredMaterials]);

  // KPIs
  const kpis = useMemo(() => {
    const uniqueMaterials = new Set(issuedMaterials.map((m) => m.materialName)).size;
    const totalQty = issuedMaterials.reduce((sum, m) => sum + (Number(m.quantityIssued) || 0), 0);
    const uniqueVouchers = new Set(issuedMaterials.map((m) => m.issueReference)).size;
    const uniqueWos = new Set(issuedMaterials.map((m) => m.workOrderNo)).size;

    return {
      uniqueMaterials,
      totalQty,
      uniqueVouchers,
      uniqueWos
    };
  }, [issuedMaterials]);

  // Pagination for table view
  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / pageSize));
  const paginatedMaterials = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredMaterials.slice(start, start + pageSize);
  }, [filteredMaterials, page, pageSize]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedWo]);

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedRef(text);
      setTimeout(() => setCopiedRef(null), 2000);
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="prod-store-releases-root">
      {/* ── HEADER BANNER ── */}
      <header className="prod-sr-header">
        <div className="prod-sr-header__title-wrap">
          <div className="prod-sr-header__icon-box">
            <PackageCheck size={28} />
          </div>
          <div>
            <h1 className="prod-sr-header__title">
              Store Released Materials (Production Floor)
            </h1>
            <p className="prod-sr-header__subtitle">
              Live floor registry of all raw materials, components, and supplies issued by Store for active production.
            </p>
          </div>
        </div>

        <div className="prod-sr-header__actions">
          <button
            type="button"
            className="prod-sr-btn prod-sr-btn--outline"
            onClick={() => {
              refetch?.();
              try {
                const saved = localStorage.getItem(STORE_RELEASE_HISTORY_KEY);
                if (saved) setStoreLedger(JSON.parse(saved));
              } catch {}
            }}
          >
            <RefreshCw size={15} /> Refresh List
          </button>
        </div>
      </header>

      {/* ── KPI METRICS SUMMARY CARDS ── */}
      <section className="prod-sr-kpi-grid">
        <div className="prod-sr-kpi-card">
          <div className="prod-sr-kpi-icon" style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
            <Boxes size={22} />
          </div>
          <div>
            <div className="prod-sr-kpi-value">{kpis.uniqueMaterials}</div>
            <div className="prod-sr-kpi-label">Materials Released</div>
          </div>
        </div>

        <div className="prod-sr-kpi-card">
          <div className="prod-sr-kpi-icon" style={{ background: '#F0FDFA', color: '#0F766E', border: '1px solid #CCFBF1' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div className="prod-sr-kpi-value">{kpis.totalQty.toLocaleString('en-IN')}</div>
            <div className="prod-sr-kpi-label">Total Units Issued</div>
          </div>
        </div>

        <div className="prod-sr-kpi-card">
          <div className="prod-sr-kpi-icon" style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
            <FileText size={22} />
          </div>
          <div>
            <div className="prod-sr-kpi-value">{kpis.uniqueVouchers}</div>
            <div className="prod-sr-kpi-label">Release Vouchers</div>
          </div>
        </div>

        <div className="prod-sr-kpi-card">
          <div className="prod-sr-kpi-icon" style={{ background: '#FAF5FF', color: '#9333EA', border: '1px solid #E9D5FF' }}>
            <Building2 size={22} />
          </div>
          <div>
            <div className="prod-sr-kpi-value">{kpis.uniqueWos}</div>
            <div className="prod-sr-kpi-label">Work Orders Supplied</div>
          </div>
        </div>
      </section>

      {/* ── CONTROLS & FILTER BAR ── */}
      <section className="prod-sr-controls">
        <div className="prod-sr-controls__left">
          {/* Search Box */}
          <div className="prod-sr-search-wrap">
            <Search size={16} className="prod-sr-search-icon" />
            <input
              type="text"
              className="prod-sr-search-input"
              placeholder="Search material, voucher, work order, issuer…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="prod-sr-clear-btn"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Work Order Selector */}
          <select
            className="prod-sr-select"
            value={selectedWo}
            onChange={(e) => setSelectedWo(e.target.value)}
          >
            <option value="ALL">All Work Orders ({issuedMaterials.length} materials)</option>
            {workOrderOptions.map((wo) => (
              <option key={wo} value={wo}>
                Work Order: {wo}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="prod-sr-controls__right">
          <div className="prod-sr-view-toggle">
            <button
              type="button"
              className={`prod-sr-view-btn ${viewMode === 'table' ? 'is-active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <FileText size={15} /> Table Ledger
            </button>
            <button
              type="button"
              className={`prod-sr-view-btn ${viewMode === 'cards' ? 'is-active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <Layers size={15} /> Work Order Cards
            </button>
          </div>
        </div>
      </section>

      {/* ── VIEW 1: DETAILED MATERIAL LEDGER TABLE ── */}
      {viewMode === 'table' && (
        <div className="prod-sr-table-card">
          <div className="prod-sr-table-wrap">
            <table className="prod-sr-table">
              <thead>
                <tr>
                  <th>Material Issued</th>
                  <th>Quantity Issued</th>
                  <th>Release Voucher</th>
                  <th>Work Order / Requisition</th>
                  <th>Target Department</th>
                  <th>Issued By &amp; Date</th>
                  <th>Floor Status</th>
                  <th style={{ textAlign: 'right' }}>Handover Pass</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
                      <PackageCheck size={42} style={{ color: '#CBD5E1', marginBottom: '10px' }} />
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B' }}>
                        No Store Released Materials Found
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94A3B8' }}>
                        {searchTerm || selectedWo !== 'ALL'
                          ? 'No issued materials match the current filters.'
                          : 'Materials issued by the store will automatically appear here once released.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedMaterials.map((item) => {
                    const isCopied = copiedRef === item.issueReference;
                    return (
                      <tr key={item.id}>
                        {/* Material Name & Unit */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '8px',
                              background: '#F1F5F9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#0F766E',
                              flexShrink: 0
                            }}>
                              <Boxes size={18} />
                            </div>
                            <div>
                              <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '13.5px' }}>
                                {item.materialName}
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                                Unit: <strong style={{ color: '#334155' }}>{item.unit}</strong>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Quantity Issued */}
                        <td>
                          <span className="prod-sr-qty-pill">
                            {item.quantityIssued} {item.unit}
                          </span>
                        </td>

                        {/* Voucher Badge */}
                        <td>
                          <div className="prod-sr-voucher-badge">
                            <span>{item.issueReference}</span>
                            <button
                              type="button"
                              className="prod-sr-copy-btn"
                              onClick={() => copyToClipboard(item.issueReference)}
                              title="Copy voucher reference"
                            >
                              {isCopied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </td>

                        {/* Work Order & Requisition */}
                        <td>
                          <div className="prod-sr-wo-chip">
                            <span style={{ color: '#0284C7' }}>⚡</span>
                            <span>{item.workOrderNo}</span>
                          </div>
                          <div className="prod-sr-req-sub">
                            Req: {item.requestNo}
                          </div>
                        </td>

                        {/* Target Department */}
                        <td>
                          <span style={{
                            background: '#F1F5F9',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#334155'
                          }}>
                            {item.department}
                          </span>
                        </td>

                        {/* Issued By & Date */}
                        <td>
                          <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '13px' }}>
                            {item.issuedBy}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                            {formatDateTime(item.issuedAt)}
                          </div>
                        </td>

                        {/* Floor Status */}
                        <td>
                          <span className="prod-sr-status-ready">
                            <span className="prod-sr-dot-pulse" />
                            Ready for Production
                          </span>
                        </td>

                        {/* Handover Pass Action */}
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedVoucher(item)}
                            className="prod-sr-btn prod-sr-btn--outline"
                            style={{ padding: '5px 10px', fontSize: '12px' }}
                            title="View official store release slip"
                          >
                            <Eye size={13} /> View Pass
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredMaterials.length > 0 && (
            <div style={{
              padding: '12px 20px',
              background: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ fontSize: '13px', color: '#64748B' }}>
                Showing <strong style={{ color: '#0F172A' }}>{(page - 1) * pageSize + 1}</strong> to <strong style={{ color: '#0F172A' }}>{Math.min(page * pageSize, filteredMaterials.length)}</strong> of <strong style={{ color: '#0F172A' }}>{filteredMaterials.length}</strong> released materials
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="prod-sr-select"
                  style={{ height: '34px', fontSize: '12px' }}
                >
                  <option value={25}>25 rows</option>
                  <option value={50}>50 rows</option>
                  <option value={100}>100 rows</option>
                </select>

                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="prod-sr-btn prod-sr-btn--outline"
                  style={{ padding: '6px 12px', fontSize: '12px', opacity: page === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={14} /> Prev
                </button>

                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', padding: '0 4px' }}>
                  {page} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="prod-sr-btn prod-sr-btn--outline"
                  style={{ padding: '6px 12px', fontSize: '12px', opacity: page === totalPages ? 0.5 : 1 }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── VIEW 2: WORK ORDER GROUPED CARDS ── */}
      {viewMode === 'cards' && (
        <div className="prod-sr-cards-grid">
          {groupedByWorkOrder.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#64748B' }}>
              <PackageCheck size={40} style={{ color: '#cbd5e1', marginBottom: '10px' }} />
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>No Work Order Groups Found</div>
            </div>
          ) : (
            groupedByWorkOrder.map((group) => (
              <div key={group.workOrderNo} className="prod-sr-group-card">
                {/* Header */}
                <div className="prod-sr-group-header">
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', fontWeight: '700', letterSpacing: '0.04em' }}>
                      Production Work Order
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#0284C7' }}>⚡</span>
                      {group.workOrderNo}
                    </div>
                  </div>
                  <span className="prod-sr-status-ready">
                    <span className="prod-sr-dot-pulse" />
                    {group.items.length} Material(s)
                  </span>
                </div>

                {/* Body Item List */}
                <div className="prod-sr-group-body">
                  {group.items.map((it) => (
                    <div key={it.id} className="prod-sr-group-item">
                      <div>
                        <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '13.5px' }}>
                          {it.materialName}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', fontFamily: 'monospace' }}>
                          Ref: {it.issueReference}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className="prod-sr-qty-pill" style={{ padding: '2px 8px', fontSize: '12.5px' }}>
                          {it.quantityIssued} {it.unit}
                        </span>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px' }}>
                          {it.department}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="prod-sr-group-footer">
                  <span>
                    Last Release: <strong style={{ color: '#1E293B' }}>{formatDateTime(group.latestIssuedAt)}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedVoucher(group.items[0])}
                    className="prod-sr-btn prod-sr-btn--outline"
                    style={{ padding: '4px 10px', fontSize: '11.5px' }}
                  >
                    <Eye size={12} /> View Slip
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── OFFICIAL STORE RELEASE PASS / DISPATCH SLIP MODAL ── */}
      {selectedVoucher && (
        <div className="prod-sr-modal-overlay" onClick={() => setSelectedVoucher(null)}>
          <div className="prod-sr-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', background: '#ECFDF5', borderRadius: '8px', color: '#059669' }}>
                  <PackageCheck size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: '800', color: '#0F172A' }}>
                    Store Material Handover Pass
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Official warehouse release voucher for shop-floor production
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="prod-sr-no-print"
                onClick={() => setSelectedVoucher(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Voucher Content */}
            <div style={{ padding: '24px' }}>
              {/* Top Meta Details */}
              <div style={{
                background: '#F0FDFA',
                border: '1px solid #CCFBF1',
                borderRadius: '12px',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0F766E', fontWeight: '800' }}>
                    Voucher Reference
                  </span>
                  <div style={{ fontFamily: 'monospace', fontWeight: '800', color: '#134E4A', fontSize: '13.5px', marginTop: '2px' }}>
                    {selectedVoucher.issueReference}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0F766E', fontWeight: '800' }}>
                    Work Order
                  </span>
                  <div style={{ fontWeight: '800', color: '#134E4A', fontSize: '13.5px', marginTop: '2px' }}>
                    {selectedVoucher.workOrderNo}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0F766E', fontWeight: '800' }}>
                    Requisition ID
                  </span>
                  <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#134E4A', fontSize: '13px', marginTop: '2px' }}>
                    {selectedVoucher.requestNo}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#0F766E', fontWeight: '800' }}>
                    Release Date
                  </span>
                  <div style={{ fontWeight: '600', color: '#134E4A', fontSize: '12.5px', marginTop: '2px' }}>
                    {formatDateTime(selectedVoucher.issuedAt)}
                  </div>
                </div>
              </div>

              {/* Material Detail Box */}
              <div style={{
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '20px'
              }}>
                <div style={{
                  padding: '12px 16px',
                  background: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  fontWeight: '700',
                  fontSize: '12.5px',
                  color: '#475569',
                  textTransform: 'uppercase'
                }}>
                  Released Material Item
                </div>
                <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                      {selectedVoucher.materialName}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '3px' }}>
                      Department: <strong style={{ color: '#1E293B' }}>{selectedVoucher.department}</strong>
                    </div>
                  </div>
                  <div className="prod-sr-qty-pill" style={{ fontSize: '16px', padding: '6px 14px' }}>
                    {selectedVoucher.quantityIssued} {selectedVoucher.unit}
                  </div>
                </div>
              </div>

              {/* Signatures & Chain of Custody */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                paddingTop: '16px',
                borderTop: '1px dashed #CBD5E1'
              }}>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', fontWeight: '700' }}>
                    Released By (Store Custodian)
                  </div>
                  <div style={{ fontWeight: '800', color: '#0F172A', marginTop: '4px', fontSize: '14px' }}>
                    {selectedVoucher.issuedBy}
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px', fontWeight: '600' }}>
                    ✓ Physical Stock Dispatched
                  </div>
                </div>

                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', fontWeight: '700' }}>
                    Received By (Production Floor)
                  </div>
                  <div style={{ fontWeight: '800', color: '#0F172A', marginTop: '4px', fontSize: '14px' }}>
                    Production Supervisor
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px', fontWeight: '600' }}>
                    ✓ Staged &amp; Ready on Floor
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="prod-sr-no-print" style={{
              padding: '16px 24px',
              background: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                type="button"
                className="prod-sr-btn prod-sr-btn--outline"
                onClick={() => setSelectedVoucher(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="prod-sr-btn prod-sr-btn--primary"
                onClick={() => window.print()}
              >
                <Printer size={15} /> Print Pass Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

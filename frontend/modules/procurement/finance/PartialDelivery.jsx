import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useERPStore } from '../../../store/erpStore';
import { syncProcurementData } from '../../../store/procurementActions';
import { purchaseOrderService } from '../../../services/procurement/purchaseOrderService';
import {
  Layers,
  Search,
  RefreshCw,
  Eye,
  ExternalLink,
  CheckCircle2,
  Clock,
  Truck,
  Building2,
  Calendar,
  AlertTriangle,
  FileText,
  Boxes,
  ClipboardCheck,
  ChevronRight,
  ShieldCheck,
  Hash,
  Download,
  X,
  Printer,
  PackageCheck,
  SlidersHorizontal,
  LayoutGrid,
  List
} from 'lucide-react';
import Swal from 'sweetalert2';

const CSS = `
  .pd-container {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1E293B;
  }

  /* ── Header ── */
  .pd-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
    padding-bottom: 20px;
    border-bottom: 1px solid #E2E8F0;
    margin-bottom: 20px;
  }
  .pd-header-left h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: #0F172A;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pd-header-left p {
    margin: 4px 0 0;
    font-size: 14px;
    color: #64748B;
  }
  .pd-pulse-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    background: #FEF3C7;
    color: #B45309;
    border: 1px solid #FDE68A;
    border-radius: 50px;
    font-size: 12px;
    font-weight: 700;
  }
  .pd-pulse-dot {
    width: 7px;
    height: 7px;
    background: #F59E0B;
    border-radius: 50%;
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
    animation: pd-pulse 1.8s infinite;
  }
  @keyframes pd-pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
  }

  .pd-header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .pd-btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: #F8FAFC;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .pd-btn-secondary:hover {
    background: #F1F5F9;
    border-color: #94A3B8;
    color: #0F172A;
  }
  .pd-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #2563EB;
    border: 1px solid #1D4ED8;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #FFFFFF;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
    transition: all 0.15s ease;
  }
  .pd-btn-primary:hover {
    background: #1D4ED8;
  }

  /* ── KPI Metrics Cards ── */
  .pd-kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 14px;
    margin-bottom: 20px;
  }
  .pd-kpi-card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .pd-kpi-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0,0,0,0.04);
  }
  .pd-kpi-card.amber {
    background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
    border-color: #FDE68A;
  }
  .pd-kpi-card.emerald {
    background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
    border-color: #BBF7D0;
  }
  .pd-kpi-card.indigo {
    background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
    border-color: #C7D2FE;
  }
  .pd-kpi-label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #64748B;
  }
  .pd-kpi-card.amber .pd-kpi-label { color: #92400E; }
  .pd-kpi-card.emerald .pd-kpi-label { color: #166534; }
  .pd-kpi-card.indigo .pd-kpi-label { color: #3730A3; }
  .pd-kpi-val {
    font-size: 26px;
    font-weight: 800;
    color: #0F172A;
    line-height: 1.1;
  }
  .pd-kpi-card.amber .pd-kpi-val { color: #B45309; }
  .pd-kpi-card.emerald .pd-kpi-val { color: #15803D; }
  .pd-kpi-card.indigo .pd-kpi-val { color: #4338CA; }
  .pd-kpi-sub {
    font-size: 11.5px;
    color: #64748B;
    margin-top: 2px;
  }

  /* ── Dynamic Ledger Tree Summary ── */
  .pd-tree-summary {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }
  .pd-tree-left {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
  }
  .pd-tree-badge-root {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 800;
    color: #0F172A;
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    padding: 6px 14px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }
  .pd-tree-branches {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
    font-size: 13px;
  }
  .pd-branch-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 700;
  }
  .pd-branch-item.delivered {
    background: #DCFCE7;
    color: #166534;
    border: 1px solid #BBF7D0;
  }
  .pd-branch-item.partial {
    background: #FEF3C7;
    color: #92400E;
    border: 1px solid #FDE68A;
  }
  .pd-tree-desc {
    font-size: 12.5px;
    color: #64748B;
    font-style: italic;
  }

  /* ── Toolbar & Filters ── */
  .pd-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
  }
  .pd-filter-pills {
    display: flex;
    background: #F1F5F9;
    padding: 4px;
    border-radius: 10px;
    gap: 4px;
  }
  .pd-pill-btn {
    padding: 7px 14px;
    border: none;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    background: transparent;
    color: #64748B;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s;
  }
  .pd-pill-btn:hover {
    color: #0F172A;
  }
  .pd-pill-btn.active {
    background: #FFFFFF;
    color: #2563EB;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .pd-pill-count {
    padding: 1px 7px;
    border-radius: 50px;
    font-size: 11px;
    font-weight: 700;
  }
  .pd-pill-btn.active .pd-pill-count {
    background: #EFF6FF;
    color: #2563EB;
  }
  .pd-pill-btn:not(.active) .pd-pill-count {
    background: #E2E8F0;
    color: #64748B;
  }

  .pd-search-tools {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .pd-search-input-wrap {
    position: relative;
    width: 280px;
  }
  .pd-search-input {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 12px 8px 34px;
    font-size: 13px;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .pd-search-input:focus {
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  .pd-search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #94A3B8;
    pointer-events: none;
  }

  .pd-view-toggle {
    display: flex;
    background: #F1F5F9;
    border-radius: 8px;
    padding: 2px;
  }
  .pd-view-btn {
    border: none;
    background: transparent;
    padding: 6px 10px;
    border-radius: 6px;
    color: #64748B;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pd-view-btn.active {
    background: #FFFFFF;
    color: #0F172A;
    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  }

  /* ── Table View ── */
  .pd-table-wrap {
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    overflow-x: auto;
    background: #FFFFFF;
  }
  .pd-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    min-width: 1080px;
  }
  .pd-table thead th {
    background: #F8FAFC;
    padding: 12px 14px;
    font-size: 11.5px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 1px solid #E2E8F0;
    text-align: left;
    white-space: nowrap;
  }
  .pd-table thead th.text-right { text-align: right; }
  .pd-table thead th.text-center { text-align: center; }
  .pd-table tbody td {
    padding: 13px 14px;
    border-bottom: 1px solid #F1F5F9;
    color: #334155;
    vertical-align: middle;
  }
  .pd-table tbody tr:hover td {
    background: #F8FAFC;
  }

  .pd-material-name {
    font-weight: 700;
    color: #0F172A;
    display: block;
    font-size: 13.5px;
  }
  .pd-material-code {
    font-size: 11.5px;
    color: #64748B;
    font-family: 'JetBrains Mono', monospace;
  }
  .pd-po-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 700;
    color: #0284C7;
    background: #F0F9FF;
    border: 1px solid #BAE6FD;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
  }
  .pd-po-badge:hover {
    background: #E0F2FE;
  }
  .pd-indent-chip {
    font-size: 11px;
    color: #64748B;
    margin-top: 3px;
    display: block;
  }
  .pd-vendor-text {
    font-weight: 600;
    color: #1E293B;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .pd-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 50px;
    font-size: 11.5px;
    font-weight: 700;
    white-space: nowrap;
  }
  .pd-status-badge.partial {
    background: #FEF3C7;
    color: #B45309;
    border: 1px solid #FDE68A;
  }
  .pd-status-badge.delivered {
    background: #DCFCE7;
    color: #15803D;
    border: 1px solid #BBF7D0;
  }
  .pd-status-badge.not-received {
    background: #F1F5F9;
    color: #64748B;
    border: 1px solid #E2E8F0;
  }

  .pd-progress-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 110px;
  }
  .pd-progress-bar {
    flex: 1;
    height: 7px;
    background: #E2E8F0;
    border-radius: 4px;
    overflow: hidden;
  }
  .pd-progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
  }
  .pd-progress-fill.partial { background: #F59E0B; }
  .pd-progress-fill.delivered { background: #10B981; }

  .pd-actions-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    justify-content: flex-end;
  }
  .pd-btn-action {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid transparent;
  }
  .pd-btn-action.view-po {
    background: #F1F5F9;
    color: #334155;
    border-color: #CBD5E1;
  }
  .pd-btn-action.view-po:hover {
    background: #E2E8F0;
    color: #0F172A;
  }
  .pd-btn-action.view-audit {
    background: #EFF6FF;
    color: #2563EB;
    border-color: #BFDBFE;
  }
  .pd-btn-action.view-audit:hover {
    background: #DBEAFE;
    color: #1D4ED8;
  }

  /* ── Cards View ── */
  .pd-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 16px;
  }
  .pd-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 18px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .pd-card:hover {
    border-color: #CBD5E1;
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }
  .pd-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #F1F5F9;
    padding-bottom: 12px;
  }
  .pd-card-po-title {
    font-size: 16px;
    font-weight: 800;
    color: #0F172A;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pd-card-supplier {
    font-size: 13px;
    color: #475569;
    margin-top: 3px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
  }
  .pd-card-meta-strip {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    background: #F8FAFC;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 12px;
  }
  .pd-card-meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .pd-card-meta-lbl {
    font-size: 11px;
    color: #64748B;
    text-transform: uppercase;
    font-weight: 700;
  }
  .pd-card-meta-val {
    font-weight: 700;
    color: #1E293B;
  }
  .pd-card-items-box {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .pd-card-item-row {
    background: #FAFAFA;
    border: 1px solid #F1F5F9;
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .pd-card-item-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .pd-card-item-nums {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #475569;
  }
  .pd-card-actions {
    display: flex;
    gap: 8px;
    margin-top: auto;
    padding-top: 10px;
    border-top: 1px solid #F1F5F9;
  }

  /* ── Modal Overlays ── */
  .pd-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .pd-modal-box {
    background: #FFFFFF;
    border-radius: 16px;
    max-width: 780px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid #E2E8F0;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .pd-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 14px;
    border-bottom: 1px solid #E2E8F0;
  }
  .pd-modal-close {
    background: none;
    border: none;
    cursor: pointer;
    color: #64748B;
    padding: 4px;
    border-radius: 6px;
  }
  .pd-modal-close:hover {
    background: #F1F5F9;
    color: #0F172A;
  }

  /* ── Empty State ── */
  .pd-empty-state {
    text-align: center;
    padding: 60px 20px;
    background: #F8FAFC;
    border-radius: 12px;
    border: 1px dashed #CBD5E1;
  }
  .pd-empty-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 14px;
    color: #94A3B8;
  }
  .pd-empty-state h3 {
    font-size: 16px;
    font-weight: 700;
    color: #1E293B;
    margin: 0 0 6px;
  }
  .pd-empty-state p {
    font-size: 13.5px;
    color: #64748B;
    max-width: 480px;
    margin: 0 auto;
  }
`;

const formatDate = (val) => {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return String(val);
  }
};

const getDeliveryUrgency = (dateVal) => {
  if (!dateVal) return { text: 'No Due Date', color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0' };
  const target = new Date(dateVal);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `Overdue (${Math.abs(diffDays)}d)`, color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' };
  } else if (diffDays === 0) {
    return { text: 'Due Today', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' };
  } else if (diffDays === 1) {
    return { text: 'Due Tomorrow', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' };
  } else {
    return { text: `Due in ${diffDays}d`, color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' };
  }
};

const EMPTY_ARRAY = [];

export default function PartialDelivery({ onNavigateToAudit, onNavigateToPO }) {
  const erpStoreState = useERPStore(s => s.state);
  const purchaseOrders = erpStoreState?.procurement?.purchaseOrders ?? erpStoreState?.purchaseOrders ?? EMPTY_ARRAY;
  const goodsReceipts = erpStoreState?.procurement?.goodsReceiptNotes ?? erpStoreState?.goodsReceipts ?? EMPTY_ARRAY;
  const purchaseIndents = erpStoreState?.procurement?.materialIndents ?? erpStoreState?.purchaseIndents ?? EMPTY_ARRAY;
  const suppliers = erpStoreState?.procurement?.suppliers ?? erpStoreState?.suppliers ?? EMPTY_ARRAY;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'PARTIAL' | 'DELIVERED' | 'NOT_RECEIVED'
  const [viewLayout, setViewLayout] = useState('table'); // 'table' | 'cards'
  const [inspectingPO, setInspectingPO] = useState(null);
  const [inspectingGRN, setInspectingGRN] = useState(null);

  // Sync data on mount
  useEffect(() => {
    void syncProcurementData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await syncProcurementData();
      await purchaseOrderService.financeQueue({ limit: 100 });
    } catch (e) {
      console.warn('[PartialDelivery] Refresh warning:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Group GRNs by PO ID for fast cumulative lookup
  const grnsByPO = useMemo(() => {
    const map = new Map();
    goodsReceipts.forEach(grn => {
      // Exclude cancelled/rejected/voided GRNs
      if (['CANCELLED', 'REJECTED', 'RETURNED_TO_STORE', 'FINANCE_AUDIT_REJECTED', 'VOID', 'VOIDED'].includes(grn.status)) {
        return;
      }
      const poId = grn.purchaseOrderId || grn.poId || grn.purchaseOrder?.id;
      if (poId) {
        if (!map.has(poId)) map.set(poId, []);
        map.get(poId).push(grn);
      }
      if (grn.purchaseOrder?.poNumber) {
        if (!map.has(grn.purchaseOrder.poNumber)) map.set(grn.purchaseOrder.poNumber, []);
        map.get(grn.purchaseOrder.poNumber).push(grn);
      }
    });
    return map;
  }, [goodsReceipts]);

  // Master calculation of partial POs and material lines directly from the receiving ledger
  const { analyzedPOs, allMaterialLines, kpiSummary } = useMemo(() => {
    let totalMonitoredLines = 0;
    let fullyDeliveredLinesCount = 0;
    let partiallyDeliveredLinesCount = 0;
    let notReceivedLinesCount = 0;
    let totalPendingUnits = 0;

    const partialPOList = [];
    const materialLinesList = [];

    // Filter active POs (exclude terminal cancelled/drafts)
    const candidates = purchaseOrders.filter(po => {
      return !['DRAFT', 'CANCELLED', 'PLANT_HEAD_PURCHASE_REJECTED', 'SUPER_ADMIN_REJECTED'].includes(po.status);
    });

    candidates.forEach(po => {
      const poId = po.id;
      const poNum = po.poNumber || po.publicId || po.id;
      const poGrns = (grnsByPO.get(poId) || grnsByPO.get(poNum) || po.grns || []).filter(g =>
        !['CANCELLED', 'REJECTED', 'RETURNED_TO_STORE', 'FINANCE_AUDIT_REJECTED', 'VOID', 'VOIDED'].includes(g.status)
      );

      // Sort GRNs newest first
      const sortedGRNs = [...poGrns].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      const latestGRN = sortedGRNs[0] || null;

      const rawItems = po.items || [];
      if (rawItems.length === 0) return;

      let poOrderedUnits = 0;
      let poReceivedUnits = 0;
      let poRemainingUnits = 0;
      const computedPoLines = [];

      rawItems.forEach((item, idx) => {
        const orderedQty = Number(item.quantity || item.orderedQty || 0);
        if (orderedQty <= 0) return;

        // Sum cumulative received quantity across all valid accepted/verified GRNs
        let receivedQty = 0;
        let latestGRNQty = 0;

        sortedGRNs.forEach((grn, gIdx) => {
          (grn.items || []).forEach(gi => {
            const isMatch =
              (gi.purchaseOrderItemId && gi.purchaseOrderItemId === item.id) ||
              (gi.productId && (gi.productId === item.productId || gi.productId === item.materialId)) ||
              (gi.materialName && item.materialName && gi.materialName.toLowerCase() === item.materialName.toLowerCase());

            if (isMatch) {
              const qty = Number(gi.acceptedQuantity ?? gi.receivedQuantity ?? gi.deliveredQuantity ?? 0);
              receivedQty += qty;
              if (gIdx === 0) {
                latestGRNQty += qty;
              }
            }
          });
        });

        // Fallback to item.receivedQty / cumulativeDeliveredQty if GRNs array is empty
        if (receivedQty === 0 && (item.receivedQty || item.cumulativeDeliveredQty || item.receivedQuantity)) {
          receivedQty = Number(item.receivedQty || item.cumulativeDeliveredQty || item.receivedQuantity || 0);
        }

        const remainingQty = Math.max(0, orderedQty - receivedQty);
        const previouslyReceived = Math.max(0, receivedQty - latestGRNQty);
        const fulfillmentPct = orderedQty > 0 ? Math.min(100, Math.round((receivedQty / orderedQty) * 100)) : 0;

        let lineStatus = 'NOT_RECEIVED';
        if (receivedQty === 0) {
          lineStatus = 'NOT_RECEIVED';
        } else if (receivedQty > 0 && remainingQty > 0) {
          lineStatus = 'PARTIAL_DELIVERY';
        } else if (remainingQty === 0 && orderedQty > 0) {
          lineStatus = 'FULLY_DELIVERED';
        }

        const supplierName = po.supplier?.name || po.vendorName || po.snapshot?.vendorName || suppliers.find(s => s.id === po.supplierId)?.name || '—';
        const indentNumber = po.purchaseIndent?.publicId || po.purchaseIndent?.indentNo || po.indentNo || po.purchaseIndentId || '—';
        const materialName = item.product?.name || item.materialName || item.name || `Material #${idx + 1}`;
        const materialCode = item.product?.code || item.materialCode || `MAT-${String(idx + 1).padStart(3, '0')}`;
        const dueDate = po.expectedDeliveryDate || po.deliveryDate;
        const storeVerificationDate = latestGRN?.verifiedAt || latestGRN?.createdAt || null;
        const financeAuditStatus = latestGRN?.status || (receivedQty > 0 ? 'STORE_VERIFIED' : 'PENDING_DELIVERY');

        const lineObj = {
          lineId: `${poId}-${item.id || idx}`,
          poId,
          poNumber: poNum,
          indentNumber,
          supplierName,
          materialName,
          materialCode,
          unit: item.unit || item.product?.unit || 'Units',
          orderedQty,
          previouslyReceived,
          latestGRNQty,
          cumulativeReceived: receivedQty,
          remainingQty,
          fulfillmentPct,
          dueDate,
          latestGRN: latestGRN ? (latestGRN.grnNumber || latestGRN.id) : null,
          latestGRNObj: latestGRN,
          storeVerificationDate,
          financeAuditStatus,
          status: lineStatus,
          rawPO: po,
          rawItem: item
        };

        computedPoLines.push(lineObj);
        poOrderedUnits += orderedQty;
        poReceivedUnits += receivedQty;
        poRemainingUnits += remainingQty;
      });

      // A PO belongs on the Partial Delivery monitoring queue if:
      // 1. It has received some quantity (poReceivedUnits > 0 or has at least 1 valid GRN), AND
      // 2. The PO as a whole is not complete (poRemainingUnits > 0 or not terminal CLOSED)
      const isPartiallyDeliveredPO = poReceivedUnits > 0 && poRemainingUnits > 0 && po.status !== 'CLOSED' && po.status !== 'PO_CLOSED';

      if (isPartiallyDeliveredPO) {
        partialPOList.push({
          poId,
          poNumber: poNum,
          indentNumber: po.purchaseIndent?.publicId || po.purchaseIndent?.indentNo || po.indentNo || po.purchaseIndentId || '—',
          supplierName: po.supplier?.name || po.vendorName || po.snapshot?.vendorName || '—',
          orderedUnits: poOrderedUnits,
          receivedUnits: poReceivedUnits,
          remainingUnits: poRemainingUnits,
          overallFulfillmentPct: poOrderedUnits > 0 ? Math.round((poReceivedUnits / poOrderedUnits) * 100) : 0,
          dueDate: po.expectedDeliveryDate || po.deliveryDate,
          lines: computedPoLines,
          rawPO: po,
          latestGRN
        });

        // Add all lines of this partially delivered PO to the master lines view
        computedPoLines.forEach(l => {
          materialLinesList.push(l);
          totalMonitoredLines++;
          if (l.status === 'FULLY_DELIVERED') fullyDeliveredLinesCount++;
          else if (l.status === 'PARTIAL_DELIVERY') partiallyDeliveredLinesCount++;
          else notReceivedLinesCount++;
          totalPendingUnits += l.remainingQty;
        });
      }
    });

    return {
      analyzedPOs: partialPOList,
      allMaterialLines: materialLinesList,
      kpiSummary: {
        totalLines: totalMonitoredLines,
        deliveredLines: fullyDeliveredLinesCount,
        partialLines: partiallyDeliveredLinesCount,
        notReceivedLines: notReceivedLinesCount,
        partialPOsCount: partialPOList.length,
        totalPendingUnits
      }
    };
  }, [purchaseOrders, grnsByPO, suppliers]);

  // Filtering lines based on filterMode & search query
  const filteredMaterialLines = useMemo(() => {
    let list = allMaterialLines;
    if (filterMode === 'PARTIAL') {
      list = list.filter(l => l.status === 'PARTIAL_DELIVERY');
    } else if (filterMode === 'DELIVERED') {
      list = list.filter(l => l.status === 'FULLY_DELIVERED');
    } else if (filterMode === 'NOT_RECEIVED') {
      list = list.filter(l => l.status === 'NOT_RECEIVED');
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(l =>
      l.materialName.toLowerCase().includes(q) ||
      l.poNumber.toLowerCase().includes(q) ||
      l.supplierName.toLowerCase().includes(q) ||
      l.indentNumber.toLowerCase().includes(q) ||
      (l.latestGRN && l.latestGRN.toLowerCase().includes(q)) ||
      l.materialCode.toLowerCase().includes(q)
    );
  }, [allMaterialLines, filterMode, searchQuery]);

  // Filtering PO cards
  const filteredPOCards = useMemo(() => {
    if (!searchQuery.trim()) return analyzedPOs;
    const q = searchQuery.toLowerCase().trim();
    return analyzedPOs.filter(po =>
      po.poNumber.toLowerCase().includes(q) ||
      po.supplierName.toLowerCase().includes(q) ||
      po.indentNumber.toLowerCase().includes(q) ||
      po.lines.some(l => l.materialName.toLowerCase().includes(q) || l.materialCode.toLowerCase().includes(q))
    );
  }, [analyzedPOs, searchQuery]);

  // Action: Open PO detail modal
  const handleOpenPO = (po) => {
    setInspectingPO(po);
    if (onNavigateToPO) {
      try { onNavigateToPO(po); } catch (e) {}
    }
  };

  // Action: Navigate to Delivery Audit tab or open quick inspection
  const handleOpenDeliveryAudit = (grnObj, poObj) => {
    if (grnObj) {
      setInspectingGRN(grnObj);
    } else if (onNavigateToAudit) {
      onNavigateToAudit(poObj);
    }
  };

  return (
    <div className="pd-container">
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div className="pd-header">
        <div className="pd-header-left">
          <h2>
            <Layers size={24} color="#2563EB" />
            Partial Delivery
            <span className="pd-pulse-tag">
              <span className="pd-pulse-dot" />
              Live Inward Ledger
            </span>
          </h2>
          <p>
            Real-time tracking of partially received Purchase Orders and material lines calculated dynamically from the physical receiving ledger.
          </p>
        </div>

        <div className="pd-header-actions">
          <button
            onClick={handleRefresh}
            className="pd-btn-secondary"
            disabled={isRefreshing}
            title="Sync latest receiving data"
          >
            <RefreshCw size={14} className={isRefreshing ? 'fa-spin' : ''} />
            {isRefreshing ? 'Syncing...' : 'Refresh Ledger'}
          </button>
          {onNavigateToAudit && (
            <button
              onClick={() => onNavigateToAudit(null)}
              className="pd-btn-primary"
            >
              <ClipboardCheck size={14} />
              Open Delivery Audit
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="pd-kpi-grid">
        <div className="pd-kpi-card indigo">
          <span className="pd-kpi-label">Total Monitored Lines</span>
          <span className="pd-kpi-val">{kpiSummary.totalLines}</span>
          <span className="pd-kpi-sub">Across active partial POs</span>
        </div>
        <div className="pd-kpi-card amber">
          <span className="pd-kpi-label">Partially Delivered</span>
          <span className="pd-kpi-val">{kpiSummary.partialLines}</span>
          <span className="pd-kpi-sub">Remaining balance &gt; 0</span>
        </div>
        <div className="pd-kpi-card emerald">
          <span className="pd-kpi-label">Fully Delivered Lines</span>
          <span className="pd-kpi-val">{kpiSummary.deliveredLines}</span>
          <span className="pd-kpi-sub">100% fulfilled lines</span>
        </div>
        <div className="pd-kpi-card">
          <span className="pd-kpi-label">Partially Delivered POs</span>
          <span className="pd-kpi-val">{kpiSummary.partialPOsCount}</span>
          <span className="pd-kpi-sub">Open Purchase Orders</span>
        </div>
        <div className="pd-kpi-card">
          <span className="pd-kpi-label">Outstanding Units</span>
          <span className="pd-kpi-val">{kpiSummary.totalPendingUnits.toLocaleString()}</span>
          <span className="pd-kpi-sub">Pending physical inward</span>
        </div>
      </div>

      {/* ── Dynamic Ledger Tree Widget ── */}
      <div className="pd-tree-summary">
        <div className="pd-tree-left">
          <div className="pd-tree-badge-root">
            <Boxes size={16} color="#2563EB" />
            <span>{kpiSummary.totalLines} Total Lines</span>
          </div>

          <div className="pd-tree-branches">
            <span className="pd-branch-item delivered">
              ├── {kpiSummary.deliveredLines} Delivered (100%)
            </span>
            <span className="pd-branch-item partial">
              └── {kpiSummary.partialLines} Partial (Incomplete)
            </span>
          </div>
        </div>

        <div className="pd-tree-desc">
          Calculated from verified Store GRNs vs Ordered PO Quantities
        </div>
      </div>

      {/* ── Toolbar: Filters, Search & View Switcher ── */}
      <div className="pd-toolbar">
        <div className="pd-filter-pills">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`pd-pill-btn ${filterMode === 'ALL' ? 'active' : ''}`}
          >
            All Lines
            <span className="pd-pill-count">{kpiSummary.totalLines}</span>
          </button>
          <button
            onClick={() => setFilterMode('PARTIAL')}
            className={`pd-pill-btn ${filterMode === 'PARTIAL' ? 'active' : ''}`}
          >
            🟡 Partial Only
            <span className="pd-pill-count">{kpiSummary.partialLines}</span>
          </button>
          <button
            onClick={() => setFilterMode('DELIVERED')}
            className={`pd-pill-btn ${filterMode === 'DELIVERED' ? 'active' : ''}`}
          >
            🟢 Delivered
            <span className="pd-pill-count">{kpiSummary.deliveredLines}</span>
          </button>
          {kpiSummary.notReceivedLines > 0 && (
            <button
              onClick={() => setFilterMode('NOT_RECEIVED')}
              className={`pd-pill-btn ${filterMode === 'NOT_RECEIVED' ? 'active' : ''}`}
            >
              ⚪ Not Received
              <span className="pd-pill-count">{kpiSummary.notReceivedLines}</span>
            </button>
          )}
        </div>

        <div className="pd-search-tools">
          <div className="pd-search-input-wrap">
            <Search size={15} className="pd-search-icon" />
            <input
              type="text"
              placeholder="Search Material, PO, Supplier, GRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pd-search-input"
            />
          </div>

          <div className="pd-view-toggle">
            <button
              onClick={() => setViewLayout('table')}
              className={`pd-view-btn ${viewLayout === 'table' ? 'active' : ''}`}
              title="Material Lines Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewLayout('cards')}
              className={`pd-view-btn ${viewLayout === 'cards' ? 'active' : ''}`}
              title="PO Cards Grouped View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content View: Table or Cards ── */}
      {filteredMaterialLines.length === 0 ? (
        <div className="pd-empty-state">
          <PackageCheck className="pd-empty-icon" />
          <h3>No Partial Deliveries Found</h3>
          <p>
            {searchQuery
              ? `No material lines matched your search "${searchQuery}". Try adjusting your filters.`
              : 'All active Purchase Orders are either awaiting initial receiving or have been 100% fulfilled and closed.'}
          </p>
        </div>
      ) : viewLayout === 'table' ? (
        /* ── TABLE VIEW ── */
        <div className="pd-table-wrap">
          <table className="pd-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>PO Number</th>
                <th>Supplier</th>
                <th className="text-right">Ordered</th>
                <th className="text-right">Prev. Rec.</th>
                <th className="text-right">Latest GRN</th>
                <th className="text-right">Cumulative</th>
                <th className="text-right">Remaining</th>
                <th>Fulfillment</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Latest GRN / Store Date</th>
                <th>Finance Audit</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterialLines.map(line => {
                const urgency = getDeliveryUrgency(line.dueDate);
                return (
                  <tr key={line.lineId}>
                    <td>
                      <span className="pd-material-name">{line.materialName}</span>
                      <span className="pd-material-code">{line.materialCode}</span>
                    </td>
                    <td>
                      <span
                        className="pd-po-badge"
                        onClick={() => handleOpenPO(line.rawPO)}
                        title="Click to view full PO"
                      >
                        <FileText size={12} />
                        {line.poNumber}
                      </span>
                      <span className="pd-indent-chip">Indent: {line.indentNumber}</span>
                    </td>
                    <td>
                      <div className="pd-vendor-text">
                        <Building2 size={13} color="#64748B" />
                        {line.supplierName}
                      </div>
                    </td>
                    <td className="text-right font-bold" style={{ fontWeight: 700 }}>
                      {line.orderedQty} <span style={{ fontSize: 11, color: '#64748B' }}>{line.unit}</span>
                    </td>
                    <td className="text-right" style={{ color: '#64748B' }}>
                      {line.previouslyReceived}
                    </td>
                    <td className="text-right font-semibold" style={{ fontWeight: 600, color: '#0284C7' }}>
                      {line.latestGRNQty > 0 ? `+${line.latestGRNQty}` : '—'}
                    </td>
                    <td className="text-right" style={{ fontWeight: 800, color: '#16A34A' }}>
                      {line.cumulativeReceived}
                    </td>
                    <td className="text-right" style={{ fontWeight: 800, color: line.remainingQty > 0 ? '#D97706' : '#16A34A' }}>
                      {line.remainingQty}
                    </td>
                    <td>
                      <div className="pd-progress-wrap">
                        <div className="pd-progress-bar">
                          <div
                            className={`pd-progress-fill ${line.remainingQty === 0 ? 'delivered' : 'partial'}`}
                            style={{ width: `${line.fulfillmentPct}%` }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                          {line.fulfillmentPct}%
                        </span>
                      </div>
                    </td>
                    <td>
                      {line.status === 'FULLY_DELIVERED' ? (
                        <span className="pd-status-badge delivered">
                          <CheckCircle2 size={12} />
                          Delivered
                        </span>
                      ) : line.status === 'PARTIAL_DELIVERY' ? (
                        <span className="pd-status-badge partial">
                          <Clock size={12} />
                          Partial
                        </span>
                      ) : (
                        <span className="pd-status-badge not-received">
                          Not Received
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: 12, color: '#334155' }}>
                        {formatDate(line.dueDate)}
                      </div>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: urgency.bg,
                          color: urgency.color,
                          border: `1px solid ${urgency.border}`,
                          display: 'inline-block',
                          marginTop: 2
                        }}
                      >
                        {urgency.text}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>
                        {line.latestGRN || '—'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>
                        {line.storeVerificationDate ? formatDate(line.storeVerificationDate) : 'Pending Inward'}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: line.financeAuditStatus === 'FINANCE_AUDIT_APPROVED' ? '#DCFCE7' : '#FEF3C7',
                          color: line.financeAuditStatus === 'FINANCE_AUDIT_APPROVED' ? '#166534' : '#92400E',
                          border: `1px solid ${line.financeAuditStatus === 'FINANCE_AUDIT_APPROVED' ? '#BBF7D0' : '#FDE68A'}`
                        }}
                      >
                        {line.financeAuditStatus === 'FINANCE_AUDIT_APPROVED'
                          ? 'Approved'
                          : line.financeAuditStatus === 'PENDING_FINANCE_AUDIT'
                          ? 'Pending Audit'
                          : line.financeAuditStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="pd-actions-cell">
                        <button
                          onClick={() => handleOpenPO(line.rawPO)}
                          className="pd-btn-action view-po"
                          title="View PO Details"
                        >
                          <Eye size={12} />
                          View PO
                        </button>
                        <button
                          onClick={() => handleOpenDeliveryAudit(line.latestGRNObj, line.rawPO)}
                          className="pd-btn-action view-audit"
                          title="View Delivery Audit"
                        >
                          <ClipboardCheck size={12} />
                          Audit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── CARDS VIEW (Grouped by PO) ── */
        <div className="pd-cards-grid">
          {filteredPOCards.map(po => {
            const urgency = getDeliveryUrgency(po.dueDate);
            return (
              <div key={po.poId} className="pd-card">
                <div className="pd-card-header">
                  <div>
                    <div className="pd-card-po-title">
                      <FileText size={16} color="#0284C7" />
                      {po.poNumber}
                    </div>
                    <div className="pd-card-supplier">
                      <Building2 size={13} />
                      {po.supplierName}
                    </div>
                  </div>

                  <span className="pd-status-badge partial">
                    <Clock size={12} />
                    PARTIAL PO
                  </span>
                </div>

                <div className="pd-card-meta-strip">
                  <div className="pd-card-meta-item">
                    <span className="pd-card-meta-lbl">Indent Ref</span>
                    <span className="pd-card-meta-val">{po.indentNumber}</span>
                  </div>
                  <div className="pd-card-meta-item">
                    <span className="pd-card-meta-lbl">Target Due Date</span>
                    <span className="pd-card-meta-val">{formatDate(po.dueDate)}</span>
                  </div>
                  <div className="pd-card-meta-item">
                    <span className="pd-card-meta-lbl">PO Total Units</span>
                    <span className="pd-card-meta-val">{po.orderedUnits}</span>
                  </div>
                  <div className="pd-card-meta-item">
                    <span className="pd-card-meta-lbl">Received / Balance</span>
                    <span className="pd-card-meta-val" style={{ color: '#B45309' }}>
                      {po.receivedUnits} / {po.remainingUnits} rem
                    </span>
                  </div>
                </div>

                <div className="pd-progress-wrap" style={{ margin: '2px 0' }}>
                  <div className="pd-progress-bar" style={{ height: 8 }}>
                    <div
                      className="pd-progress-fill partial"
                      style={{ width: `${po.overallFulfillmentPct}%` }}
                    />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#1E293B' }}>
                    {po.overallFulfillmentPct}%
                  </span>
                </div>

                {/* Material breakdown inside PO Card */}
                <div className="pd-card-items-box">
                  {po.lines.map(line => (
                    <div key={line.lineId} className="pd-card-item-row">
                      <div className="pd-card-item-head">
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>
                          {line.materialName}
                        </span>
                        {line.status === 'FULLY_DELIVERED' ? (
                          <span className="pd-status-badge delivered" style={{ padding: '2px 6px', fontSize: 10 }}>
                            Delivered
                          </span>
                        ) : (
                          <span className="pd-status-badge partial" style={{ padding: '2px 6px', fontSize: 10 }}>
                            Partial
                          </span>
                        )}
                      </div>
                      <div className="pd-card-item-nums">
                        <span>Ordered: <strong>{line.orderedQty}</strong></span>
                        <span>Rec: <strong style={{ color: '#16A34A' }}>{line.cumulativeReceived}</strong></span>
                        <span>Rem: <strong style={{ color: '#D97706' }}>{line.remainingQty}</strong></span>
                        <span>({line.fulfillmentPct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pd-card-actions">
                  <button
                    onClick={() => handleOpenPO(po.rawPO)}
                    className="pd-btn-secondary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Eye size={13} />
                    View PO
                  </button>
                  <button
                    onClick={() => handleOpenDeliveryAudit(po.latestGRN, po.rawPO)}
                    className="pd-btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <ClipboardCheck size={13} />
                    Delivery Audit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Detail Modal for View PO (Fallback if parent doesn't handle modal) ── */}
      {inspectingPO && (
        <div className="pd-modal-overlay" onClick={() => setInspectingPO(null)}>
          <div className="pd-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText size={22} color="#0284C7" />
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                    Purchase Order Details: {inspectingPO.poNumber || inspectingPO.id}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748B' }}>
                    Supplier: {inspectingPO.supplier?.name || inspectingPO.vendorName || inspectingPO.snapshot?.vendorName || '—'}
                  </p>
                </div>
              </div>
              <button className="pd-modal-close" onClick={() => setInspectingPO(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, background: '#F8FAFC', padding: 14, borderRadius: 10 }}>
              <div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Status</span>
                <div style={{ fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{inspectingPO.status}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Indent Reference</span>
                <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{inspectingPO.purchaseIndent?.publicId || inspectingPO.purchaseIndent?.indentNo || inspectingPO.indentNo || '—'}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Order Date</span>
                <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{formatDate(inspectingPO.createdAt)}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Expected Delivery</span>
                <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{formatDate(inspectingPO.expectedDeliveryDate || inspectingPO.deliveryDate)}</div>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Ordered Materials Breakdown</h4>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <tr>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Ordered</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Unit Rate</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(inspectingPO.items || []).map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{it.product?.name || it.materialName || it.name || `Item #${idx + 1}`}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{it.quantity || it.orderedQty || 0}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{(it.unitPrice || it.rate || 0).toLocaleString()}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>₹{((it.quantity || 0) * (it.unitPrice || it.rate || 0)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button onClick={() => setInspectingPO(null)} className="pd-btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Audit Modal (Fallback) ── */}
      {inspectingGRN && (
        <div className="pd-modal-overlay" onClick={() => setInspectingGRN(null)}>
          <div className="pd-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ClipboardCheck size={22} color="#16A34A" />
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                    Latest GRN: {inspectingGRN.grnNumber || inspectingGRN.id}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748B' }}>
                    Status: {inspectingGRN.status} | Verified on {formatDate(inspectingGRN.createdAt)}
                  </p>
                </div>
              </div>
              <button className="pd-modal-close" onClick={() => setInspectingGRN(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#F8FAFC', padding: 14, borderRadius: 10, fontSize: 13 }}>
              <div><strong>Challan / Invoice No:</strong> {inspectingGRN.challanNumber || inspectingGRN.snapshot?.challanNumber || '—'}</div>
              <div><strong>Vehicle / Truck No:</strong> {inspectingGRN.vehicleNumber || inspectingGRN.snapshot?.vehicleNumber || '—'}</div>
            </div>

            <div style={{ marginTop: 8 }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Inward Received Quantities</h4>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <tr>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Accepted Qty</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Rejected Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(inspectingGRN.items || []).map((gi, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{gi.product?.name || gi.materialName || `Item #${idx + 1}`}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#16A34A' }}>{gi.acceptedQuantity || gi.receivedQuantity || 0}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#DC2626' }}>{gi.rejectedQuantity || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button onClick={() => setInspectingGRN(null)} className="pd-btn-secondary">
                Close
              </button>
              {onNavigateToAudit && (
                <button
                  onClick={() => {
                    setInspectingGRN(null);
                    onNavigateToAudit(inspectingGRN);
                  }}
                  className="pd-btn-primary"
                >
                  <ExternalLink size={14} />
                  Open in Full Delivery Audit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

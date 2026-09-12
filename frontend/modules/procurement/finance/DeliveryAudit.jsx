import React, { useState, useMemo, useEffect } from 'react';
import { useERPStore } from '../../../store/erpStore';
import { approveGoodsReceiptNote, rejectGRN, returnGRN, syncProcurementData } from '../../../store/procurementActions';
import { ProcurementStatusBadge } from '../components/ProcurementStatusBadge';
import DataTable from '../../../shared/components/DataTable';
import {
  FileCheck,
  ShieldCheck,
  CornerUpLeft,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Building2,
  Calendar,
  AlertTriangle,
  Search,
  Eye,
  ExternalLink,
  Layers,
  Check,
  X,
  User,
  Hash,
  Maximize2,
  DollarSign,
  PackageCheck,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import Swal from 'sweetalert2';

const CSS = `
  .da-container {
    background: #fff;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  /* ── Header ── */
  .da-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
    padding-bottom: 20px;
    border-bottom: 1px solid #E2E8F0;
    margin-bottom: 20px;
  }
  .da-header h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: #0F172A;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .da-header p {
    margin: 4px 0 0;
    font-size: 14px;
    color: #64748B;
  }

  /* ── Search and Tabs bar ── */
  .da-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
    margin-bottom: 22px;
  }
  .da-tabs {
    display: flex;
    background: #F1F5F9;
    padding: 4px;
    border-radius: 10px;
    gap: 4px;
  }
  .da-tab {
    padding: 8px 18px;
    border: none;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    background: transparent;
    color: #64748B;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .da-tab:hover {
    color: #0F172A;
  }
  .da-tab.active {
    background: #FFFFFF;
    color: #2563EB;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .da-tab-badge {
    padding: 2px 8px;
    border-radius: 50px;
    font-size: 11px;
    font-weight: 700;
  }
  .da-tab.active .da-tab-badge {
    background: #EFF6FF;
    color: #2563EB;
  }
  .da-tab:not(.active) .da-tab-badge {
    background: #E2E8F0;
    color: #64748B;
  }

  .da-search-wrap {
    position: relative;
    min-width: 260px;
    max-width: 380px;
    flex: 1;
  }
  .da-search-input {
    width: 100%;
    box-sizing: border-box;
    padding: 9px 12px 9px 36px;
    font-size: 13.5px;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .da-search-input:focus {
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
  }
  .da-search-icon {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: #94A3B8;
    pointer-events: none;
  }

  /* ── Pending Card List ── */
  .da-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .da-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding: 20px 24px;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    background: #FFFFFF;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  }
  .da-card:hover {
    border-color: #93C5FD;
    box-shadow: 0 6px 20px rgba(37,99,235,0.08);
    transform: translateY(-1px);
  }
  .da-card-main {
    flex: 1;
    min-width: 0;
  }
  .da-card-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .da-card-grn-num {
    font-size: 17px;
    font-weight: 700;
    color: #0F172A;
  }
  .da-badge-pending {
    background: #FEF3C7;
    color: #B45309;
    border: 1px solid #FCD34D;
    font-size: 11.5px;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: 50px;
  }
  .da-badge-replacement {
    background: #F3E8FF;
    color: #7C3AED;
    border: 1px solid #DDD6FE;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 50px;
  }
  .da-badge-partial {
    background: #EFF6FF;
    color: #1D4ED8;
    border: 1px solid #BFDBFE;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 50px;
  }
  .da-btn-approve-partial {
    background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
    color: #FFFFFF;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    transition: all 0.2s;
  }
  .da-btn-approve-partial:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
  }
  .da-btn-approve-partial:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  .da-card-meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 8px 16px;
    margin-top: 10px;
    font-size: 13px;
    color: #475467;
  }
  .da-card-meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .da-card-meta-item strong {
    color: #0F172A;
  }
  .da-card-meta-item svg {
    color: #64748B;
    flex-shrink: 0;
  }

  /* ── Card Attachments Mini Thumbnails ── */
  .da-card-docs-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
  }
  .da-mini-thumb {
    width: 44px;
    height: 44px;
    border-radius: 6px;
    object-fit: cover;
    border: 1px solid #CBD5E1;
    cursor: pointer;
    transition: transform 0.15s;
  }
  .da-mini-thumb:hover {
    transform: scale(1.08);
  }
  .da-mini-doc {
    width: 44px;
    height: 44px;
    border-radius: 6px;
    background: #F1F5F9;
    border: 1px solid #CBD5E1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748B;
    font-size: 11px;
    cursor: pointer;
  }

  .da-card-cta {
    flex-shrink: 0;
  }
  .da-audit-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    border: none;
    border-radius: 9px;
    background: #2563EB;
    color: #FFFFFF;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(37,99,235,0.25);
    transition: background 0.15s, transform 0.15s;
  }
  .da-audit-btn:hover {
    background: #1D4ED8;
    transform: translateY(-1px);
  }

  /* ── Detail View ── */
  .da-detail-view {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .da-detail-top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .da-back-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    font-size: 13.5px;
    font-weight: 600;
    color: #475467;
    cursor: pointer;
    padding: 6px 0;
    transition: color 0.15s;
  }
  .da-back-button:hover {
    color: #0F172A;
  }

  .da-detail-header-card {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 20px;
  }
  .da-detail-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
  }
  .da-detail-grn-title {
    font-size: 20px;
    font-weight: 800;
    color: #0F172A;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin: 0 0 6px;
  }
  .da-detail-header-sub {
    font-size: 14px;
    color: #64748B;
  }
  .da-detail-header-sub strong {
    color: #0F172A;
  }

  /* ── Logistics info strip ── */
  .da-logistics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #E2E8F0;
  }
  .da-logistics-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .da-logistics-label {
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #64748B;
  }
  .da-logistics-val {
    font-size: 14px;
    font-weight: 600;
    color: #0F172A;
  }

  /* ── Sections in Detail ── */
  .da-section-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 20px;
  }
  .da-section-heading {
    margin: 0 0 14px;
    font-size: 15px;
    font-weight: 700;
    color: #0F172A;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ── Items Table in Detail ── */
  .da-items-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
  }
  .da-items-table thead th {
    background: #F8FAFC;
    padding: 10px 12px;
    font-size: 12px;
    font-weight: 700;
    color: #475467;
    text-align: left;
    border-bottom: 1px solid #E2E8F0;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .da-items-table thead th:first-child { border-radius: 8px 0 0 0; }
  .da-items-table thead th:last-child { border-radius: 0 8px 0 0; }
  .da-items-table tbody td {
    padding: 12px;
    border-bottom: 1px solid #F1F5F9;
    color: #334155;
    vertical-align: middle;
  }
  .da-items-table tbody tr:hover td {
    background: #F8FAFC;
  }
  .da-items-table tfoot td {
    padding: 12px;
    background: #F8FAFC;
    font-weight: 700;
    color: #0F172A;
    border-top: 2px solid #E2E8F0;
  }

  .da-qty-accepted {
    color: #16A34A;
    font-weight: 700;
    background: #F0FDF4;
    padding: 3px 8px;
    border-radius: 6px;
    border: 1px solid #DCFCE7;
    display: inline-block;
  }
  .da-qty-rejected {
    color: #DC2626;
    font-weight: 700;
    background: #FEF2F2;
    padding: 3px 8px;
    border-radius: 6px;
    border: 1px solid #FEE2E2;
    display: inline-block;
  }

  /* ── Attached Photos & Documents ── */
  .da-attachments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 14px;
  }
  .da-attachment-item {
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    padding: 10px;
    background: #F8FAFC;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: all 0.15s;
  }
  .da-attachment-item:hover {
    border-color: #2563EB;
    background: #FFFFFF;
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }
  .da-attachment-preview-container {
    position: relative;
    width: 100%;
    height: 110px;
    border-radius: 6px;
    overflow: hidden;
    background: #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .da-attachment-preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s;
  }
  .da-attachment-preview-img:hover {
    transform: scale(1.05);
  }
  .da-attachment-meta {
    font-size: 12px;
    color: #475467;
  }
  .da-attachment-name {
    font-weight: 600;
    color: #0F172A;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .da-attachment-size {
    font-size: 11px;
    color: #94A3B8;
  }

  /* ── Audit Decision Box ── */
  .da-decision-card {
    background: #FAFAFA;
    border: 1.5px solid #CBD5E1;
    border-radius: 14px;
    padding: 20px;
  }
  .da-remarks-input {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 14px;
    font-size: 13.5px;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    font-family: inherit;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    background: #FFFFFF;
  }
  .da-remarks-input:focus {
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
  }

  .da-action-buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
    flex-wrap: wrap;
  }
  .da-btn-reject {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border: 1px solid #DC2626;
    border-radius: 8px;
    background: #FEF2F2;
    color: #DC2626;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.15s;
  }
  .da-btn-reject:hover {
    background: #FEE2E2;
  }
  .da-btn-return {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border: 1px solid #F59E0B;
    border-radius: 8px;
    background: #FFFBEB;
    color: #D97706;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
  .da-btn-return:hover {
    background: #FEF3C7;
  }
  .da-btn-approve {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 24px;
    border: none;
    border-radius: 8px;
    background: #16A34A;
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(22,163,74,0.3);
    transition: background 0.15s, transform 0.15s;
  }
  .da-btn-approve:hover {
    background: #15803D;
    transform: translateY(-1px);
  }
  .da-btn-approve:disabled,
  .da-btn-reject:disabled,
  .da-btn-return:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ── History Table ── */
  .da-history-wrap {
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    overflow: hidden;
    overflow-x: auto;
  }
  .da-history-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .da-history-table thead th {
    background: #F8FAFC;
    padding: 11px 14px;
    font-size: 12px;
    font-weight: 700;
    color: #475467;
    text-align: left;
    border-bottom: 1px solid #E2E8F0;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .da-history-table tbody td {
    padding: 12px 14px;
    border-bottom: 1px solid #F1F5F9;
    color: #334155;
    vertical-align: middle;
  }
  .da-history-table tbody tr:hover td {
    background: #F8FAFC;
  }

  .da-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 50px;
    font-size: 11.5px;
    font-weight: 700;
    white-space: nowrap;
  }
  .da-chip-approved {
    background: #DCFCE7;
    color: #15803D;
    border: 1px solid #BBF7D0;
  }
  .da-chip-rejected {
    background: #FEE2E2;
    color: #B91C1C;
    border: 1px solid #FECACA;
  }
  .da-chip-returned {
    background: #FEF3C7;
    color: #B45309;
    border: 1px solid #FDE68A;
  }
  .da-chip-other {
    background: #F1F5F9;
    color: #475467;
    border: 1px solid #E2E8F0;
  }

  /* ── Lightbox Modal ── */
  .da-lightbox-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15,23,42,0.85);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .da-lightbox-content {
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #FFFFFF;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }
  .da-lightbox-img {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
  }
  .da-lightbox-bar {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background: #F8FAFC;
    border-bottom: 1px solid #E2E8F0;
  }
  .da-lightbox-close {
    background: none;
    border: none;
    cursor: pointer;
    color: #64748B;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .da-lightbox-close:hover {
    color: #0F172A;
    background: #E2E8F0;
  }

  /* ── Empty State ── */
  .da-empty-box {
    text-align: center;
    padding: 48px 24px;
    color: #64748B;
  }
  .da-empty-box h4 {
    margin: 12px 0 4px;
    font-size: 16px;
    font-weight: 700;
    color: #0F172A;
  }
  .da-empty-box p {
    margin: 0;
    font-size: 13.5px;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .da-container {
      padding: 16px;
    }
    .da-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    .da-card-cta {
      width: 100%;
    }
    .da-audit-btn {
      width: 100%;
      justify-content: center;
    }
    .da-action-buttons {
      flex-direction: column;
      width: 100%;
    }
    .da-btn-approve, .da-btn-reject, .da-btn-return {
      width: 100%;
      justify-content: center;
    }
    .da-search-wrap {
      max-width: 100%;
      width: 100%;
    }
  }
`;

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const EMPTY_ARRAY = [];

export default function DeliveryAudit() {
  const erpStoreState = useERPStore(s => s.state);
  const goodsReceipts = erpStoreState?.procurement?.goodsReceiptNotes ?? erpStoreState?.goodsReceipts ?? EMPTY_ARRAY;
  const purchaseOrders = erpStoreState?.procurement?.purchaseOrders ?? erpStoreState?.purchaseOrders ?? EMPTY_ARRAY;
  const purchaseIndents = erpStoreState?.procurement?.materialIndents ?? erpStoreState?.purchaseIndents ?? EMPTY_ARRAY;
  const suppliers = erpStoreState?.procurement?.suppliers ?? erpStoreState?.suppliers ?? EMPTY_ARRAY;
  const rawInventory = erpStoreState?.rawInventory ?? EMPTY_ARRAY;

  // Sync fresh procurement records on mount
  useEffect(() => {
    void syncProcurementData();
  }, []);

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [selectedGRNId, setSelectedGRNId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [auditRemarks, setAuditRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  // Filter pending GRNs
  const pendingGRNs = useMemo(() => {
    return goodsReceipts.filter(g =>
      g.status === 'PENDING_FINANCE_AUDIT' || g.status === 'SUBMITTED_FOR_FINANCE_AUDIT'
    ).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [goodsReceipts]);

  // Filter history GRNs
  const historyGRNs = useMemo(() => {
    return goodsReceipts.filter(g =>
      !['PENDING_FINANCE_AUDIT', 'SUBMITTED_FOR_FINANCE_AUDIT'].includes(g.status)
    ).sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
  }, [goodsReceipts]);

  // Search filtering
  const filteredPendingGRNs = useMemo(() => {
    if (!searchQuery.trim()) return pendingGRNs;
    const q = searchQuery.toLowerCase().trim();
    return pendingGRNs.filter(g => {
      const po = purchaseOrders.find(p => p.id === g.purchaseOrderId || p.poNumber === g.purchaseOrderId);
      const supplierName = po?.supplier?.name || po?.supplierName || suppliers.find(s => s.id === po?.supplierId)?.name || '';
      const challan = g.snapshot?.challanNumber || g.challanNumber || '';
      const vehicle = g.snapshot?.vehicleNumber || g.vehicleNumber || '';
      return (
        (g.grnNumber && g.grnNumber.toLowerCase().includes(q)) ||
        (g.id && g.id.toLowerCase().includes(q)) ||
        (po?.poNumber && po.poNumber.toLowerCase().includes(q)) ||
        supplierName.toLowerCase().includes(q) ||
        challan.toLowerCase().includes(q) ||
        vehicle.toLowerCase().includes(q)
      );
    });
  }, [pendingGRNs, searchQuery, purchaseOrders, suppliers]);

  const filteredHistoryGRNs = useMemo(() => {
    if (!searchQuery.trim()) return historyGRNs;
    const q = searchQuery.toLowerCase().trim();
    return historyGRNs.filter(g => {
      const po = purchaseOrders.find(p => p.id === g.purchaseOrderId || p.poNumber === g.purchaseOrderId);
      const supplierName = po?.supplier?.name || po?.supplierName || suppliers.find(s => s.id === po?.supplierId)?.name || '';
      return (
        (g.grnNumber && g.grnNumber.toLowerCase().includes(q)) ||
        (g.id && g.id.toLowerCase().includes(q)) ||
        (po?.poNumber && po.poNumber.toLowerCase().includes(q)) ||
        supplierName.toLowerCase().includes(q)
      );
    });
  }, [historyGRNs, searchQuery, purchaseOrders, suppliers]);

  const selectedGRN = useMemo(() => {
    if (!selectedGRNId) return null;
    return goodsReceipts.find(g => g.id === selectedGRNId || g.grnNumber === selectedGRNId) || null;
  }, [goodsReceipts, selectedGRNId]);

  const associatedPO = useMemo(() => {
    if (!selectedGRN) return null;
    return purchaseOrders.find(p => p.id === selectedGRN.purchaseOrderId || p.poNumber === selectedGRN.purchaseOrderId) || null;
  }, [selectedGRN, purchaseOrders]);

  const associatedSupplier = useMemo(() => {
    if (!associatedPO) return null;
    return associatedPO.supplier || suppliers.find(s => s.id === associatedPO.supplierId) || { name: associatedPO.supplierName || '—' };
  }, [associatedPO, suppliers]);

  const associatedIndent = useMemo(() => {
    if (!associatedPO) return null;
    return (
      purchaseIndents.find(i =>
        (associatedPO.purchaseIndentId && (i.id === associatedPO.purchaseIndentId || i.indentNo === associatedPO.purchaseIndentId || i.publicId === associatedPO.purchaseIndentId)) ||
        (associatedPO.indentNo && (i.indentNo === associatedPO.indentNo || i.publicId === associatedPO.indentNo)) ||
        (associatedPO.indentNumber && (i.indentNumber === associatedPO.indentNumber || i.indentNo === associatedPO.indentNumber))
      ) ||
      associatedPO.purchaseIndent ||
      {
        indentNo: associatedPO.indentNo || associatedPO.purchaseIndent?.indentNo || associatedPO.purchaseIndent?.publicId || associatedPO.purchaseIndentId || associatedPO.indentNumber || '—'
      }
    );
  }, [associatedPO, purchaseIndents]);

  // Helper to match a GRN item row to its corresponding PO item
  const findPoItem = (row, index) => {
    if (!associatedPO?.items?.length) return null;
    // 1. Match by purchaseOrderItemId === poItem.id
    if (row?.purchaseOrderItemId) {
      const match = associatedPO.items.find(i => i.id === row.purchaseOrderItemId || i.purchaseOrderItemId === row.purchaseOrderItemId);
      if (match) return match;
    }
    // 2. Match by productId === poItem.productId
    if (row?.productId) {
      const match = associatedPO.items.find(i => i.productId === row.productId || i.id === row.productId);
      if (match) return match;
    }
    // 3. Match from snapshot selectedItems
    if (associatedPO?.snapshot?.selectedItems?.length) {
      if (row?.purchaseOrderItemId) {
        const snapMatch = associatedPO.snapshot.selectedItems.find(s => s.id === row.purchaseOrderItemId || s.indentItemId === row.purchaseOrderItemId);
        if (snapMatch) return snapMatch;
      }
      if (row?.productId) {
        const snapMatch = associatedPO.snapshot.selectedItems.find(s => s.productId === row.productId);
        if (snapMatch) return snapMatch;
      }
    }
    // 4. Match by index if counts align
    if (typeof index === 'number' && associatedPO.items[index]) {
      return associatedPO.items[index];
    }
    return null;
  };

  // All GRNs for the associated PO (all valid receipts, excluding cancelled/rejected)
  const allPOGRNs = useMemo(() => {
    if (!associatedPO) return [];
    return goodsReceipts.filter(g => {
      const match = (g.purchaseOrderId && (g.purchaseOrderId === associatedPO.id || g.purchaseOrderId === associatedPO.poNumber)) ||
                    (g.poId && (g.poId === associatedPO.id || g.poId === associatedPO.poNumber));
      if (!match) return false;
      return !['CANCELLED', 'REJECTED', 'RETURNED_TO_STORE', 'FINANCE_AUDIT_REJECTED', 'VOID', 'VOIDED'].includes(g.status);
    });
  }, [goodsReceipts, associatedPO]);

  // Prior GRNs on this PO (GRNs created before this GRN or already audit-approved, excluding current GRN)
  const priorPOGRNs = useMemo(() => {
    if (!selectedGRN || !allPOGRNs.length) return [];
    const currentCreatedAt = selectedGRN.createdAt ? new Date(selectedGRN.createdAt).getTime() : Infinity;
    return allPOGRNs.filter(g => {
      if (g.id === selectedGRN.id || g.grnNumber === selectedGRN.grnNumber) return false;
      const gCreatedAt = g.createdAt ? new Date(g.createdAt).getTime() : 0;
      return ['FINANCE_AUDIT_APPROVED', 'AUDITED', 'COMPLETED', 'ACCEPTED'].includes(g.status) || gCreatedAt < currentCreatedAt;
    });
  }, [selectedGRN, allPOGRNs]);

  // Comprehensive audit summary computing PO Qty, Previously Received, Delivered, Accepted, Cumulative, and Remaining
  const poAuditSummary = useMemo(() => {
    if (!associatedPO || !selectedGRN) return null;
    const poItems = associatedPO.items || [];

    let grandPOQty = 0;
    let grandPreviouslyReceived = 0;
    let grandCurrentDelivered = 0;
    let grandCurrentAccepted = 0;
    let grandCurrentRejected = 0;
    let grandCumulativeReceived = 0;
    let grandRemaining = 0;
    let grandAuditValue = 0;

    const auditedItems = (selectedGRN.items || []).map((row, idx) => {
      const poItem = findPoItem(row, idx);
      const poOrderedQty = Number(poItem?.quantity ?? poItem?.orderedQty ?? poItem?.orderedQuantity ?? 0);

      // Sum all previously accepted/verified quantities across prior GRNs
      let previouslyReceivedQty = 0;
      priorPOGRNs.forEach(priorGRN => {
        (priorGRN.items || []).forEach(gi => {
          const isMatch =
            (row.purchaseOrderItemId && (gi.purchaseOrderItemId === row.purchaseOrderItemId || gi.id === row.purchaseOrderItemId)) ||
            (row.productId && (gi.productId === row.productId || gi.materialId === row.productId)) ||
            (poItem?.id && (gi.purchaseOrderItemId === poItem.id || gi.id === poItem.id));
          if (isMatch) {
            previouslyReceivedQty += Number(gi.acceptedQuantity ?? gi.acceptedQty ?? gi.receivedQuantity ?? gi.deliveredQuantity ?? 0);
          }
        });
      });

      // Fallback: If prior GRNs list in store state was empty but PO item has cumulative received data
      const directPoReceived = Number(poItem?.cumulativeDeliveredQty ?? poItem?.receivedQuantity ?? 0);
      const currentAcceptedQty = Number(row.acceptedQuantity ?? row.acceptedQty ?? 0);
      if (previouslyReceivedQty === 0 && directPoReceived > 0 && selectedGRN.status === 'PENDING_FINANCE_AUDIT') {
        previouslyReceivedQty = Math.max(0, directPoReceived - currentAcceptedQty);
      }

      const currentDeliveredQty = Number(row.receivedQuantity ?? row.receivedQty ?? row.deliveredQuantity ?? 0);
      const currentRejectedQty = Number(row.rejectedQuantity ?? row.rejectedQty ?? 0);
      const cumulativeReceivedQty = previouslyReceivedQty + currentAcceptedQty;
      const remainingQty = poOrderedQty > 0 ? Math.max(0, poOrderedQty - cumulativeReceivedQty) : 0;
      const unitPrice = getProductUnitPrice(row, idx);
      const lineValue = currentAcceptedQty * unitPrice;

      grandPOQty += poOrderedQty;
      grandPreviouslyReceived += previouslyReceivedQty;
      grandCurrentDelivered += currentDeliveredQty;
      grandCurrentAccepted += currentAcceptedQty;
      grandCurrentRejected += currentRejectedQty;
      grandCumulativeReceived += cumulativeReceivedQty;
      grandRemaining += remainingQty;
      grandAuditValue += lineValue;

      return {
        ...row,
        poItem,
        poOrderedQty,
        previouslyReceivedQty,
        currentDeliveredQty,
        currentAcceptedQty,
        currentRejectedQty,
        cumulativeReceivedQty,
        remainingQty,
        unitPrice,
        lineValue,
        prodName: getProductName(row, idx),
        prodCode: getProductCode(row, idx),
        prodUnit: getProductUnit(row, idx),
      };
    });

    // PO-level fulfillment evaluation across all PO items
    let totalPOUnits = 0;
    let totalFulfilledUnitsAcrossPO = 0;
    poItems.forEach(pi => {
      const ord = Number(pi.quantity ?? pi.orderedQty ?? 0);
      totalPOUnits += ord;
      let rec = 0;
      [...priorPOGRNs, selectedGRN].forEach(g => {
        (g.items || []).forEach(gi => {
          if (
            (gi.purchaseOrderItemId && gi.purchaseOrderItemId === pi.id) ||
            (gi.productId && (gi.productId === pi.productId || gi.productId === pi.materialId))
          ) {
            rec += Number(gi.acceptedQuantity ?? gi.acceptedQty ?? 0);
          }
        });
      });
      totalFulfilledUnitsAcrossPO += Math.min(ord, rec);
    });

    if (grandPOQty === 0) {
      grandPOQty = grandCurrentAccepted;
      grandRemaining = 0;
    }

    const overallRemaining = totalPOUnits > 0 ? Math.max(0, totalPOUnits - totalFulfilledUnitsAcrossPO) : grandRemaining;
    const isFullyReceived = overallRemaining === 0;
    const effectiveTotalUnits = totalPOUnits > 0 ? totalPOUnits : grandPOQty;
    const effectiveFulfilled = totalFulfilledUnitsAcrossPO > 0 ? totalFulfilledUnitsAcrossPO : grandCumulativeReceived;
    const fulfillmentPct = effectiveTotalUnits > 0
      ? Math.min(100, Math.round((effectiveFulfilled / effectiveTotalUnits) * 100))
      : (overallRemaining === 0 ? 100 : 0);

    return {
      auditedItems,
      grandPOQty,
      grandPreviouslyReceived,
      grandCurrentDelivered,
      grandCurrentAccepted,
      grandCurrentRejected,
      grandCumulativeReceived,
      grandRemaining,
      grandAuditValue,
      totalPOUnits: effectiveTotalUnits,
      totalFulfilledUnits: effectiveFulfilled,
      overallRemaining,
      isFullyReceived,
      fulfillmentPct
    };
  }, [associatedPO, selectedGRN, priorPOGRNs]);

  const getProductName = (row, index) => {
    const poItem = findPoItem(row, index);
    const name = poItem?.product?.name || poItem?.productName || poItem?.materialName || poItem?.materialNameSnapshot;
    if (name) return name;
    const inv = rawInventory.find(item => item.id === row?.productId || item.materialId === row?.productId);
    if (inv?.name) return inv.name;
    return row?.materialName || row?.productName || (row?.productId ? `Material (${row.productId.substring(0, 8)})` : '—');
  };

  const getProductCode = (row, index) => {
    const poItem = findPoItem(row, index);
    const code = poItem?.product?.sku || poItem?.product?.code || poItem?.productSku || poItem?.materialCode || poItem?.materialCodeSnapshot;
    if (code) return code;
    const inv = rawInventory.find(item => item.id === row?.productId || item.materialId === row?.productId);
    if (inv?.sku || inv?.code) return inv.sku || inv.code;
    return row?.productId ? row.productId : '—';
  };

  const getProductUnit = (row, index) => {
    const poItem = findPoItem(row, index);
    const unit = poItem?.product?.unit || poItem?.product?.uom || poItem?.uom || poItem?.uomSnapshot || poItem?.unit;
    if (unit) return unit;
    const inv = rawInventory.find(item => item.id === row?.productId || item.materialId === row?.productId);
    if (inv?.unit || inv?.uom) return inv.unit || inv.uom;
    return 'Units';
  };

  const getProductUnitPrice = (row, index) => {
    const poItem = findPoItem(row, index);
    return Number(poItem?.unitPrice || poItem?.unitRate || poItem?.estimatedUnitRate || 0);
  };

  // Attachments extraction
  const getAttachments = (grn) => {
    if (!grn) return [];
    const list = grn.snapshot?.attachments || grn.attachments || [];
    if (Array.isArray(list)) return list;
    return [];
  };

  /* ──────────────── Actions ──────────────── */

  // 1. APPROVE / ACCEPT DELIVERY AUDIT (Conditionally Closes PO only when 100% fulfilled)
  const handleApprove = async () => {
    if (!selectedGRN) return;

    const poNumber = associatedPO?.poNumber || selectedGRN.purchaseOrderId;
    const grnNumber = selectedGRN.grnNumber || selectedGRN.id;
    const isFullyReceived = poAuditSummary?.isFullyReceived ?? false;
    const remainingUnits = poAuditSummary?.overallRemaining ?? 0;

    const result = await Swal.fire({
      title: isFullyReceived ? 'Approve & Close PO?' : 'Approve Partial Delivery Audit?',
      html: `
        <div style="text-align:left;font-size:13.5px;color:#334155;line-height:1.6;">
          <p style="margin:0 0 8px;">You are approving GRN <strong>${grnNumber}</strong> against PO <strong>${poNumber}</strong>.</p>
          <div style="background:${isFullyReceived ? '#F0FDF4' : '#EFF6FF'};border:1px solid ${isFullyReceived ? '#BBF7D0' : '#BFDBFE'};border-radius:8px;padding:12px;margin-bottom:8px;">
            <p style="margin:0;color:${isFullyReceived ? '#166534' : '#1E40AF'};font-weight:700;">
              ${isFullyReceived 
                ? '✓ 100% Order Fulfilled — All materials have been received.' 
                : `⚡ Partial Delivery — ${poAuditSummary?.grandCurrentAccepted || 0} units accepted (${remainingUnits} units remaining).`}
            </p>
            <p style="margin:4px 0 0;color:${isFullyReceived ? '#166534' : '#1E40AF'};">
              ${isFullyReceived
                ? `✓ Approving this final audit will officially mark delivery as verified and <strong>CLOSE</strong> Purchase Order <strong>${poNumber}</strong> and its Indent.`
                : `✓ Approving will record audit approval for this GRN. Purchase Order <strong>${poNumber}</strong> will remain <strong>OPEN / PARTIALLY DELIVERED</strong> for Store to receive the remaining ${remainingUnits} units.`}
            </p>
          </div>
        </div>
      `,
      icon: isFullyReceived ? 'question' : 'info',
      showCancelButton: true,
      confirmButtonText: isFullyReceived ? 'Yes, Accept & Close PO' : 'Yes, Approve Partial GRN (Keep PO Open)',
      cancelButtonText: 'Cancel',
      confirmButtonColor: isFullyReceived ? '#16A34A' : '#2563EB',
      cancelButtonColor: '#64748B',
    });

    if (!result.isConfirmed) return;

    try {
      setIsSubmitting(true);
      const remarks = auditRemarks.trim() || (isFullyReceived ? 'Approved by Finance Delivery Audit (Final Closure)' : 'Partial delivery approved by Finance Delivery Audit');
      await approveGoodsReceiptNote(selectedGRN.id, remarks, 'Finance Auditor');

      await Swal.fire({
        icon: 'success',
        title: isFullyReceived ? 'PO Officially Closed!' : 'Partial Audit Approved!',
        html: `
          <div style="text-align:left;font-size:13.5px;color:#334155;">
            <p>GRN <strong>${grnNumber}</strong> has been audited and approved.</p>
            ${isFullyReceived 
              ? `<p style="color:#16A34A;font-weight:700;margin:0;">✓ Purchase Order ${poNumber} & Indent have been officially closed.</p>`
              : `<p style="color:#2563EB;font-weight:700;margin:0;">⚡ Purchase Order ${poNumber} remains OPEN for Store to receive remaining ${remainingUnits} units.</p>`
            }
          </div>
        `,
        confirmButtonColor: '#2563EB',
      });

      setSelectedGRNId(null);
      setAuditRemarks('');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Approval Failed',
        text: err?.message || 'Could not approve GRN audit.',
        confirmButtonColor: '#2563EB',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. REJECT DELIVERY AUDIT (Mandatory reason, PO/Indent remain open)
  const handleReject = async () => {
    if (!selectedGRN) return;

    const poNumber = associatedPO?.poNumber || selectedGRN.purchaseOrderId;
    const grnNumber = selectedGRN.grnNumber || selectedGRN.id;

    const { value: reason } = await Swal.fire({
      title: 'Reject Delivery Audit',
      html: `
        <div style="text-align:left;font-size:13.5px;color:#334155;margin-bottom:8px;">
          <p style="margin:0 0 6px;">Rejecting GRN <strong>${grnNumber}</strong> against PO <strong>${poNumber}</strong>.</p>
          <p style="margin:0;color:#DC2626;font-size:12.5px;">The Purchase Order and Indent will remain <strong>OPEN</strong> for store correction.</p>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Rejection Reason (Mandatory)',
      inputPlaceholder: 'State why this delivery audit is rejected (e.g. invalid challan, rate mismatch, unverified damage)...',
      inputAttributes: {
        'aria-label': 'Type your rejection reason here',
        rows: '3'
      },
      showCancelButton: true,
      confirmButtonText: 'Reject Delivery',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#64748B',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'A rejection reason is required!';
        }
      }
    });

    if (!reason) return;

    try {
      setIsSubmitting(true);
      await rejectGRN(selectedGRN.id, reason.trim());

      await Swal.fire({
        icon: 'warning',
        title: 'Audit Rejected',
        html: `
          <div style="text-align:left;font-size:13.5px;color:#334155;">
            <p>GRN <strong>${grnNumber}</strong> has been rejected.</p>
            <p style="color:#D97706;margin:0;">PO <strong>${poNumber}</strong> remains open for correction.</p>
          </div>
        `,
        confirmButtonColor: '#2563EB',
      });

      setSelectedGRNId(null);
      setAuditRemarks('');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Rejection Failed',
        text: err?.message || 'Could not reject GRN audit.',
        confirmButtonColor: '#2563EB',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. RETURN FOR CORRECTION (Store fixes GRN)
  const handleReturn = async () => {
    if (!selectedGRN) return;

    if (!auditRemarks.trim()) {
      return Swal.fire({
        icon: 'error',
        title: 'Remarks Required',
        text: 'Please enter remarks in the Audit Remarks box explaining what Store needs to correct.',
        confirmButtonColor: '#2563EB',
      });
    }

    try {
      setIsSubmitting(true);
      await returnGRN(selectedGRN.id, auditRemarks.trim(), 'Finance Auditor');

      await Swal.fire({
        icon: 'info',
        title: 'Returned to Store',
        text: 'GRN has been returned to Store for correction.',
        confirmButtonColor: '#2563EB',
      });

      setSelectedGRNId(null);
      setAuditRemarks('');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Return Failed',
        text: err?.message || 'Could not return GRN.',
        confirmButtonColor: '#2563EB',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ──────────────── Render Detail View ──────────────── */
  if (selectedGRN) {
    const summary = poAuditSummary || {
      auditedItems: [],
      grandPOQty: 0,
      grandPreviouslyReceived: 0,
      grandCurrentDelivered: 0,
      grandCurrentAccepted: 0,
      grandCurrentRejected: 0,
      grandCumulativeReceived: 0,
      grandRemaining: 0,
      grandAuditValue: 0,
      totalPOUnits: 0,
      totalFulfilledUnits: 0,
      overallRemaining: 0,
      isFullyReceived: false,
      fulfillmentPct: 0
    };

    const attachments = getAttachments(selectedGRN);
    const challanNum = selectedGRN.snapshot?.deliveryChallanNumber || selectedGRN.snapshot?.challanNumber || selectedGRN.snapshot?.challanNo || selectedGRN.challanNumber || '—';
    const vehicleNum = selectedGRN.snapshot?.vehicleNumber || selectedGRN.snapshot?.vehicleNo || selectedGRN.snapshot?.truckNumber || selectedGRN.vehicleNumber || '—';
    const invoiceNum = selectedGRN.snapshot?.invoiceNumber || selectedGRN.snapshot?.vendorInvoiceNumber || selectedGRN.invoiceNumber || null;
    const storeRemarks = selectedGRN.snapshot?.remarks || selectedGRN.remarks || 'No remarks provided by store.';
    const poNumber = associatedPO?.poNumber || selectedGRN.purchaseOrderId;
    const indentNumber = associatedIndent?.indentNo || associatedIndent?.publicId || associatedIndent?.indentNumber || associatedPO?.purchaseIndent?.indentNo || associatedPO?.purchaseIndent?.publicId || associatedPO?.indentNo || associatedPO?.indentNumber || '—';
    const supplierName = associatedSupplier?.name || '—';

    return (
      <>
        <style>{CSS}</style>
        <div className="da-container">
          <div className="da-detail-view">
            {/* Top Navigation */}
            <div className="da-detail-top-nav">
              <button className="da-back-button" onClick={() => setSelectedGRNId(null)}>
                <CornerUpLeft size={16} /> Back to Audit List
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>Status:</span>
                <ProcurementStatusBadge status={selectedGRN.status} />
              </div>
            </div>

            {/* Header Card */}
            <div className="da-detail-header-card">
              <div className="da-detail-header-row">
                <div>
                  <h2 className="da-detail-grn-title">
                    <span>Audit GRN: {selectedGRN.grnNumber || selectedGRN.id}</span>
                    {selectedGRN.grnType === 'REPLACEMENT' && (
                      <span className="da-badge-replacement">REPLACEMENT MATERIAL</span>
                    )}
                    {!summary.isFullyReceived && (
                      <span className="da-badge-partial">PARTIAL INTAKE</span>
                    )}
                  </h2>
                  <div className="da-detail-header-sub">
                    Against PO: <strong>{poNumber}</strong> &bull; Indent: <strong>{indentNumber}</strong> &bull; Supplier: <strong>{supplierName}</strong>
                  </div>
                </div>

                {/* Header Metrics Summary Grid */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ background: '#FFFFFF', padding: '8px 14px', borderRadius: 10, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>PO Ordered Qty</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A' }}>{summary.grandPOQty.toLocaleString()}</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px 14px', borderRadius: 10, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Prior Received</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#2563EB' }}>{summary.grandPreviouslyReceived.toLocaleString()}</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px 14px', borderRadius: 10, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Accepted in this GRN</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#16A34A' }}>+{summary.grandCurrentAccepted.toLocaleString()}</div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px 14px', borderRadius: 10, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Remaining Balance</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: summary.overallRemaining === 0 ? '#16A34A' : '#D97706' }}>
                      {summary.overallRemaining.toLocaleString()}
                    </div>
                  </div>
                  {summary.grandAuditValue > 0 && (
                    <div style={{ background: '#FFFFFF', padding: '8px 14px', borderRadius: 10, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>This GRN Value</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A' }}>₹{summary.grandAuditValue.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Progress & PO Fulfillment Status Banner */}
              <div style={{
                marginTop: 16,
                padding: '14px 18px',
                borderRadius: 12,
                background: summary.isFullyReceived ? '#F0FDF4' : '#EFF6FF',
                border: `1.5px solid ${summary.isFullyReceived ? '#86EFAC' : '#BFDBFE'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {summary.isFullyReceived ? (
                      <CheckCircle2 size={20} color="#16A34A" />
                    ) : (
                      <Clock size={20} color="#2563EB" />
                    )}
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: summary.isFullyReceived ? '#166534' : '#1E40AF' }}>
                      {summary.isFullyReceived 
                        ? `✅ 100% ORDER FULFILLED (${summary.totalFulfilledUnits} / ${summary.totalPOUnits} Units) — Final Delivery Audit` 
                        : `⚡ PARTIAL DELIVERY AUDIT (${summary.totalFulfilledUnits} / ${summary.totalPOUnits} Units • ${summary.fulfillmentPct}%) — ${summary.overallRemaining} Units Pending Future Delivery`}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: summary.isFullyReceived ? '#166534' : '#1E40AF' }}>
                    PO Status After Audit: <strong>{summary.isFullyReceived ? 'CLOSED' : 'PARTIALLY DELIVERED (OPEN)'}</strong>
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{
                    width: `${summary.fulfillmentPct}%`,
                    height: '100%',
                    background: summary.isFullyReceived ? '#16A34A' : '#2563EB',
                    borderRadius: 10,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Logistics Grid */}
              <div className="da-logistics-grid">
                <div className="da-logistics-item">
                  <span className="da-logistics-label">Challan Number</span>
                  <span className="da-logistics-val">{challanNum}</span>
                </div>
                <div className="da-logistics-item">
                  <span className="da-logistics-label">Vehicle Number</span>
                  <span className="da-logistics-val">{vehicleNum}</span>
                </div>
                {invoiceNum && (
                  <div className="da-logistics-item">
                    <span className="da-logistics-label">Invoice Number</span>
                    <span className="da-logistics-val">{invoiceNum}</span>
                  </div>
                )}
                <div className="da-logistics-item">
                  <span className="da-logistics-label">Delivery Date / Time</span>
                  <span className="da-logistics-val">{formatDateTime(selectedGRN.receivedAt || selectedGRN.createdAt)}</span>
                </div>
                <div className="da-logistics-item">
                  <span className="da-logistics-label">Verified By Store</span>
                  <span className="da-logistics-val">{selectedGRN.createdByName || selectedGRN.receivedBy || 'Store Team'}</span>
                </div>
              </div>
            </div>

            {/* Received Materials Table */}
            <div className="da-section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                <h3 className="da-section-heading" style={{ margin: 0 }}>
                  <PackageCheck size={18} color="#2563EB" /> Received Items Verification & Cumulative Audit
                </h3>
                <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                  Calculated against PO {poNumber}
                </span>
              </div>

              {/* Prior GRNs Banner if multiple deliveries exist */}
              {priorPOGRNs.length > 0 && (
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  padding: '10px 14px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={16} color="#64748B" />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>
                      Prior Verified GRNs on PO {poNumber} ({priorPOGRNs.length}):
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {priorPOGRNs.map(pg => {
                      const acc = (pg.items || []).reduce((sum, gi) => sum + Number(gi.acceptedQuantity ?? gi.acceptedQty ?? 0), 0);
                      return (
                        <span key={pg.id} style={{
                          background: '#EFF6FF',
                          color: '#1D4ED8',
                          border: '1px solid #DBEAFE',
                          borderRadius: 6,
                          padding: '2px 8px',
                          fontSize: 11.5,
                          fontWeight: 700
                        }}>
                          {pg.grnNumber || pg.id}: {acc} units ({pg.status === 'FINANCE_AUDIT_APPROVED' ? 'Audited' : 'Verified'})
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table className="da-items-table">
                  <thead>
                    <tr>
                      <th style={{ minWidth: '170px' }}>Material</th>
                      <th style={{ textAlign: 'right', minWidth: '75px' }}>PO Qty</th>
                      <th style={{ textAlign: 'right', minWidth: '95px' }}>Previously Received</th>
                      <th style={{ textAlign: 'right', minWidth: '95px' }}>Delivered in this GRN</th>
                      <th style={{ textAlign: 'right', minWidth: '80px' }}>Accepted</th>
                      <th style={{ textAlign: 'right', minWidth: '100px' }}>Cumulative Received</th>
                      <th style={{ textAlign: 'center', minWidth: '110px' }}>Remaining</th>
                      <th style={{ textAlign: 'right', minWidth: '85px' }}>Unit Rate</th>
                      <th style={{ textAlign: 'right', minWidth: '95px' }}>This GRN Value</th>
                      <th style={{ minWidth: '120px' }}>Inspection Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.auditedItems.map((item, idx) => {
                      const isLineFulfilled = item.remainingQty === 0;

                      return (
                        <tr key={idx}>
                          <td>
                            <strong style={{ color: '#0F172A', display: 'block' }}>{item.prodName}</strong>
                            <span style={{ fontSize: 11, color: '#64748B' }}>Code: {item.prodCode} • {item.prodUnit}</span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#334155' }}>
                            {item.poOrderedQty.toLocaleString()} {item.prodUnit}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: item.previouslyReceivedQty > 0 ? '#2563EB' : '#94A3B8' }}>
                            {item.previouslyReceivedQty.toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#0F172A' }}>
                            {item.currentDeliveredQty.toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className="da-qty-accepted">+{item.currentAcceptedQty.toLocaleString()}</span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                            {item.cumulativeReceivedQty.toLocaleString()} / {item.poOrderedQty.toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {isLineFulfilled ? (
                              <span style={{
                                background: '#F0FDF4',
                                color: '#166534',
                                border: '1px solid #BBF7D0',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                ✓ Fulfilled (0)
                              </span>
                            ) : (
                              <span style={{
                                background: '#EFF6FF',
                                color: '#1D4ED8',
                                border: '1px solid #BFDBFE',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                ⚡ {item.remainingQty.toLocaleString()} {item.prodUnit}
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {item.unitPrice > 0 ? `₹${item.unitPrice.toLocaleString()}` : '—'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                            {item.lineValue > 0 ? `₹${item.lineValue.toLocaleString()}` : '—'}
                          </td>
                          <td style={{ fontSize: 12.5, color: '#64748B', fontStyle: item.inspectionRemarks ? 'normal' : 'italic' }}>
                            {item.inspectionRemarks || 'None'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#F8FAFC', fontWeight: 800 }}>
                      <td>Grand Totals</td>
                      <td style={{ textAlign: 'right', color: '#0F172A' }}>
                        {summary.grandPOQty.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', color: '#2563EB' }}>
                        {summary.grandPreviouslyReceived.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', color: '#0F172A' }}>
                        {summary.grandCurrentDelivered.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', color: '#16A34A' }}>
                        +{summary.grandCurrentAccepted.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', color: '#0F172A' }}>
                        {summary.grandCumulativeReceived.toLocaleString()} / {summary.grandPOQty.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {summary.grandRemaining === 0 ? (
                          <span style={{ color: '#166534', fontWeight: 800 }}>✓ All Fulfilled</span>
                        ) : (
                          <span style={{ color: '#1D4ED8', fontWeight: 800 }}>⚡ {summary.grandRemaining.toLocaleString()} Pending</span>
                        )}
                      </td>
                      <td></td>
                      <td style={{ textAlign: 'right', color: '#0F172A' }}>
                        {summary.grandAuditValue > 0 ? `₹${summary.grandAuditValue.toLocaleString()}` : '—'}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Attached Proofs & Documents */}
            <div className="da-section-card">
              <h3 className="da-section-heading">
                <FileText size={18} color="#2563EB" /> Supporting Proofs & Challan Documents
              </h3>
              {attachments.length > 0 ? (
                <div className="da-attachments-grid">
                  {attachments.map((doc, idx) => {
                    const isImg =
                      (doc.previewUrl && (doc.previewUrl.startsWith('data:image') || doc.previewUrl.startsWith('http'))) ||
                      (doc.url && (doc.url.startsWith('data:image') || doc.url.startsWith('http'))) ||
                      (typeof doc === 'string' && (doc.startsWith('data:image') || doc.startsWith('http')));
                    const src = doc.previewUrl || doc.url || (typeof doc === 'string' ? doc : '');
                    const name = doc.name || `Document ${idx + 1}`;
                    const size = doc.size || '';

                    return (
                      <div key={idx} className="da-attachment-item">
                        <div
                          className="da-attachment-preview-container"
                          onClick={() => isImg && src && setLightboxImg({ src, name })}
                          title={isImg ? 'Click to enlarge' : name}
                        >
                          {isImg && src ? (
                            <>
                              <img src={src} alt={name} className="da-attachment-preview-img" />
                              <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: 3, color: '#fff' }}>
                                <Maximize2 size={12} />
                              </div>
                            </>
                          ) : (
                            <FileText size={36} color="#64748B" />
                          )}
                        </div>
                        <div className="da-attachment-meta">
                          <div className="da-attachment-name" title={name}>{name}</div>
                          {size && <div className="da-attachment-size">{size}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: 8, padding: 16, textAlign: 'center', color: '#64748B', fontSize: 13.5 }}>
                  No physical documents or inspection photos were attached by Store.
                </div>
              )}
            </div>

            {/* Store Remarks */}
            <div className="da-section-card">
              <h3 className="da-section-heading">
                <ShieldCheck size={18} color="#2563EB" /> Store Remarks
              </h3>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 14, fontSize: 13.5, color: '#334155' }}>
                {storeRemarks}
              </div>
            </div>

            {/* Finance Decision & Actions */}
            {selectedGRN.status === 'PENDING_FINANCE_AUDIT' || selectedGRN.status === 'SUBMITTED_FOR_FINANCE_AUDIT' ? (
              <div className="da-decision-card">
                <h3 className="da-section-heading" style={{ color: '#0F172A', marginBottom: 10 }}>
                  Audit Decision & Remarks
                </h3>
                <textarea
                  className="da-remarks-input"
                  rows={3}
                  value={auditRemarks}
                  onChange={e => setAuditRemarks(e.target.value)}
                  placeholder="Enter audit approval remarks, invoice voucher numbers, or return comments..."
                />

                <div className="da-action-buttons">
                  <button
                    type="button"
                    className="da-btn-return"
                    onClick={handleReturn}
                    disabled={isSubmitting}
                    title="Return to Store for correction without rejecting permanently"
                  >
                    <RotateCcw size={15} /> Return for Correction
                  </button>

                  <button
                    type="button"
                    className="da-btn-reject"
                    onClick={handleReject}
                    disabled={isSubmitting}
                    title="Reject Delivery Audit (leaves PO open)"
                  >
                    <XCircle size={16} /> Reject Audit
                  </button>

                  <button
                    type="button"
                    className={summary.isFullyReceived ? "da-btn-approve" : "da-btn-approve-partial"}
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    title={summary.isFullyReceived ? "All materials received. Approve audit and close PO & Indent" : "Approve partial delivery. PO will remain OPEN for remaining balance"}
                  >
                    <CheckCircle2 size={17} /> 
                    {isSubmitting 
                      ? 'Approving...' 
                      : summary.isFullyReceived 
                        ? 'Accept & Close PO' 
                        : 'Approve Partial Delivery (PO Remains Open)'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircle2 size={24} color="#16A34A" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                    This delivery has been audited with status: {selectedGRN.status}
                  </div>
                  {selectedGRN.snapshot?.rejectionReason && (
                    <div style={{ fontSize: 13, color: '#DC2626', marginTop: 4 }}>
                      Rejection Reason: {selectedGRN.snapshot.rejectionReason}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lightbox Modal */}
        {lightboxImg && (
          <div className="da-lightbox-overlay" onClick={() => setLightboxImg(null)}>
            <div className="da-lightbox-content" onClick={e => e.stopPropagation()}>
              <div className="da-lightbox-bar">
                <strong style={{ fontSize: 13, color: '#0F172A' }}>{lightboxImg.name}</strong>
                <button className="da-lightbox-close" onClick={() => setLightboxImg(null)}>
                  <X size={18} />
                </button>
              </div>
              <img src={lightboxImg.src} alt={lightboxImg.name} className="da-lightbox-img" />
            </div>
          </div>
        )}
      </>
    );
  }

  /* ──────────────── Render List View ──────────────── */
  return (
    <>
      <style>{CSS}</style>
      <div className="da-container">
        {/* Page Header */}
        <div className="da-header">
          <div>
            <h2>
              <ShieldCheck size={24} color="#2563EB" /> Finance Delivery Audit
            </h2>
            <p>Audit and finalize Store Goods Receipt Notes (GRN) to close Purchase Orders & Indents</p>
          </div>
        </div>

        {/* Toolbar: Tabs and Search */}
        <div className="da-toolbar">
          <div className="da-tabs">
            <button
              className={`da-tab ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Audit
              <span className="da-tab-badge">{pendingGRNs.length}</span>
            </button>
            <button
              className={`da-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Audit History
              <span className="da-tab-badge">{historyGRNs.length}</span>
            </button>
          </div>

          <div className="da-search-wrap">
            <Search size={16} className="da-search-icon" />
            <input
              type="text"
              className="da-search-input"
              placeholder="Search by PO#, GRN#, Supplier, Challan..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tab 1: Pending Audits */}
        {activeTab === 'pending' && (
          <div className="da-list">
            {filteredPendingGRNs.map(grn => {
              const po = purchaseOrders.find(p => p.id === grn.purchaseOrderId || p.poNumber === grn.purchaseOrderId);
              const supplierName = po?.supplier?.name || po?.supplierName || suppliers.find(s => s.id === po?.supplierId)?.name || '—';
              const challanNum = grn.snapshot?.deliveryChallanNumber || grn.snapshot?.challanNumber || grn.snapshot?.challanNo || grn.challanNumber || '—';
              const vehicleNum = grn.snapshot?.vehicleNumber || grn.snapshot?.vehicleNo || grn.snapshot?.truckNumber || grn.vehicleNumber || '—';
              const attachments = getAttachments(grn);
              const items = grn.items || [];
              const totalAccepted = items.reduce((s, i) => s + Number(i.acceptedQuantity ?? i.acceptedQty ?? 0), 0);
              const totalRejected = items.reduce((s, i) => s + Number(i.rejectedQuantity ?? i.rejectedQty ?? 0), 0);

              const poTotalOrdered = (po?.items || []).reduce((s, pi) => s + Number(pi.quantity ?? pi.orderedQty ?? 0), 0);
              const isPartialGRN = poTotalOrdered > 0 && totalAccepted < poTotalOrdered;

              return (
                <div key={grn.id} className="da-card" onClick={() => setSelectedGRNId(grn.id)}>
                  <div className="da-card-main">
                    <div className="da-card-title-row">
                      <span className="da-card-grn-num">{grn.grnNumber || grn.id}</span>
                      <span className="da-badge-pending">PENDING FINANCE AUDIT</span>
                      {(grn.grnType === 'REPLACEMENT' || grn.snapshot?.isReplacement) && (
                        <span className="da-badge-replacement">REPLACEMENT</span>
                      )}
                      {isPartialGRN && (
                        <span className="da-badge-partial">
                          ⚡ PARTIAL ({totalAccepted}/{poTotalOrdered})
                        </span>
                      )}
                    </div>

                    <div className="da-card-meta-grid">
                      <div className="da-card-meta-item">
                        <FileText size={14} />
                        <span>PO: <strong>{po?.poNumber || grn.purchaseOrderId}</strong></span>
                      </div>
                      <div className="da-card-meta-item">
                        <Building2 size={14} />
                        <span>Supplier: <strong>{supplierName}</strong></span>
                      </div>
                      <div className="da-card-meta-item">
                        <Calendar size={14} />
                        <span>Received: <strong>{formatDate(grn.receivedAt || grn.createdAt)}</strong></span>
                      </div>
                      <div className="da-card-meta-item">
                        <Truck size={14} />
                        <span>Challan: <strong>{challanNum}</strong> {vehicleNum !== '—' && `(${vehicleNum})`}</span>
                      </div>
                    </div>

                    {/* Quantity summary */}
                    <div style={{ marginTop: 10, display: 'flex', gap: 12, fontSize: 13 }}>
                      <span style={{ color: '#16A34A', fontWeight: 700 }}>
                        ✓ {totalAccepted.toLocaleString()} Accepted
                      </span>
                      {totalRejected > 0 && (
                        <span style={{ color: '#DC2626', fontWeight: 700 }}>
                          ✗ {totalRejected.toLocaleString()} Rejected
                        </span>
                      )}
                      <span style={{ color: '#64748B' }}>
                        ({items.length} {items.length === 1 ? 'material' : 'materials'})
                      </span>
                    </div>

                    {/* Mini attachments preview */}
                    {attachments.length > 0 && (
                      <div className="da-card-docs-preview" onClick={e => e.stopPropagation()}>
                        {attachments.slice(0, 4).map((doc, idx) => {
                          const isImg =
                            (doc.previewUrl && (doc.previewUrl.startsWith('data:image') || doc.previewUrl.startsWith('http'))) ||
                            (doc.url && (doc.url.startsWith('data:image') || doc.url.startsWith('http'))) ||
                            (typeof doc === 'string' && (doc.startsWith('data:image') || doc.startsWith('http')));
                          const src = doc.previewUrl || doc.url || (typeof doc === 'string' ? doc : '');
                          const name = doc.name || `Document ${idx + 1}`;

                          return isImg && src ? (
                            <img
                              key={idx}
                              src={src}
                              alt={name}
                              className="da-mini-thumb"
                              title={name}
                              onClick={() => setLightboxImg({ src, name })}
                            />
                          ) : (
                            <div key={idx} className="da-mini-doc" title={name}>
                              <FileText size={18} />
                            </div>
                          );
                        })}
                        {attachments.length > 4 && (
                          <div className="da-mini-doc" style={{ fontWeight: 700 }}>
                            +{attachments.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="da-card-cta">
                    <button
                      type="button"
                      className="da-audit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGRNId(grn.id);
                      }}
                    >
                      Review & Audit
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredPendingGRNs.length === 0 && (
              <div className="da-empty-box">
                <FileCheck size={48} color="#CBD5E1" />
                <h4>No deliveries pending audit</h4>
                <p>
                  {searchQuery
                    ? 'No pending audits match your search query.'
                    : 'When the Store team verifies a delivery and generates a GRN, it will appear here for financial inspection.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Audit History */}
        {activeTab === 'history' && (
          <div>
            {filteredHistoryGRNs.length > 0 ? (
              <div className="da-history-wrap">
                <table className="da-history-table">
                  <thead>
                    <tr>
                      <th>GRN</th>
                      <th>PO Reference</th>
                      <th>Supplier</th>
                      <th>Audited Date</th>
                      <th>Accepted / Rejected</th>
                      <th>Audit Status</th>
                      <th>Remarks / Rejection Note</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistoryGRNs.map(grn => {
                      const po = purchaseOrders.find(p => p.id === grn.purchaseOrderId || p.poNumber === grn.purchaseOrderId);
                      const supplierName = po?.supplier?.name || po?.supplierName || suppliers.find(s => s.id === po?.supplierId)?.name || '—';
                      const isApproved = grn.status === 'FINANCE_AUDIT_APPROVED';
                      const isRejected = grn.status === 'FINANCE_AUDIT_REJECTED';
                      const isReturned = grn.status === 'RETURNED_TO_STORE';

                      const chipClass = isApproved
                        ? 'da-chip da-chip-approved'
                        : isRejected
                        ? 'da-chip da-chip-rejected'
                        : isReturned
                        ? 'da-chip da-chip-returned'
                        : 'da-chip da-chip-other';

                      const statusLabel = isApproved
                        ? 'AUDIT APPROVED'
                        : isRejected
                        ? 'AUDIT REJECTED'
                        : isReturned
                        ? 'RETURNED TO STORE'
                        : grn.status.replace(/_/g, ' ');

                      const items = grn.items || [];
                      const totalAccepted = items.reduce((s, i) => s + Number(i.acceptedQuantity ?? i.acceptedQty ?? 0), 0);
                      const totalRejected = items.reduce((s, i) => s + Number(i.rejectedQuantity ?? i.rejectedQty ?? 0), 0);

                      return (
                        <tr key={grn.id}>
                          <td>
                            <strong style={{ color: '#0F172A', display: 'block' }}>{grn.grnNumber || grn.id}</strong>
                            {grn.grnType === 'REPLACEMENT' && (
                              <span className="da-badge-replacement" style={{ fontSize: 10 }}>REPLACEMENT</span>
                            )}
                          </td>
                          <td>{po?.poNumber || grn.purchaseOrderId}</td>
                          <td>{supplierName}</td>
                          <td>{formatDate(grn.updatedAt || grn.createdAt)}</td>
                          <td>
                            <span style={{ color: '#16A34A', fontWeight: 700 }}>✓ {totalAccepted.toLocaleString()}</span>
                            {totalRejected > 0 && (
                              <span style={{ color: '#DC2626', fontWeight: 700, marginLeft: 6 }}>
                                ✗ {totalRejected.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td>
                            <span className={chipClass}>{statusLabel}</span>
                          </td>
                          <td style={{ fontSize: 12.5, color: '#475467', maxWidth: 220 }}>
                            {grn.snapshot?.rejectionReason ? (
                              <span style={{ color: '#DC2626', fontWeight: 600 }}>Reason: {grn.snapshot.rejectionReason}</span>
                            ) : (
                              grn.snapshot?.remarks || grn.remarks || '—'
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedGRNId(grn.id)}
                              style={{
                                background: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                color: '#2563EB',
                                padding: '5px 12px',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="da-empty-box">
                <FileCheck size={48} color="#CBD5E1" />
                <h4>No audit history found</h4>
                <p>{searchQuery ? 'No records match your search.' : 'Approved and rejected deliveries will appear here.'}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div className="da-lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <div className="da-lightbox-content" onClick={e => e.stopPropagation()}>
            <div className="da-lightbox-bar">
              <strong style={{ fontSize: 13, color: '#0F172A' }}>{lightboxImg.name}</strong>
              <button className="da-lightbox-close" onClick={() => setLightboxImg(null)}>
                <X size={18} />
              </button>
            </div>
            <img src={lightboxImg.src} alt={lightboxImg.name} className="da-lightbox-img" />
          </div>
        </div>
      )}
    </>
  );
}

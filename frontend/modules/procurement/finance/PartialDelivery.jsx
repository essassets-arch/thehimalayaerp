import React, { useState, useMemo, useEffect } from 'react';
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
  Building2,
  FileText,
  Boxes,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  X,
  PackageCheck,
  LayoutGrid,
  List,
  AlertCircle,
  ChevronsUpDown,
  Maximize2,
  Minimize2
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
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  .pd-kpi-card.rose {
    background: linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%);
    border-color: #FECDD3;
  }
  .pd-kpi-label {
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #64748B;
  }
  .pd-kpi-card.amber .pd-kpi-label { color: #92400E; }
  .pd-kpi-card.emerald .pd-kpi-label { color: #166534; }
  .pd-kpi-card.indigo .pd-kpi-label { color: #3730A3; }
  .pd-kpi-card.rose .pd-kpi-label { color: #9F1239; }
  .pd-kpi-val {
    font-size: 26px;
    font-weight: 800;
    color: #0F172A;
    line-height: 1.1;
  }
  .pd-kpi-card.amber .pd-kpi-val { color: #B45309; }
  .pd-kpi-card.emerald .pd-kpi-val { color: #15803D; }
  .pd-kpi-card.indigo .pd-kpi-val { color: #4338CA; }
  .pd-kpi-card.rose .pd-kpi-val { color: #BE123C; }
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
    padding: 14px 18px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
  }
  .pd-tree-left {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }
  .pd-tree-badge-root {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13.5px;
    font-weight: 800;
    color: #0F172A;
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    padding: 6px 12px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }
  .pd-tree-branches {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
    font-size: 12.5px;
  }
  .pd-branch-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 6px;
    font-weight: 700;
  }
  .pd-branch-item.completed {
    background: #DCFCE7;
    color: #166534;
    border: 1px solid #BBF7D0;
  }
  .pd-branch-item.partial {
    background: #FEF3C7;
    color: #92400E;
    border: 1px solid #FDE68A;
  }
  .pd-branch-item.remaining {
    background: #FFE4E6;
    color: #9F1239;
    border: 1px solid #FECDD3;
  }
  .pd-tree-desc {
    font-size: 12.5px;
    color: #64748B;
    font-weight: 500;
  }

  /* ── Toolbar ── */
  .pd-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 18px;
  }
  .pd-filter-pills {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .pd-pill-btn {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12.5px;
    font-weight: 600;
    background: #F1F5F9;
    color: #475569;
    border: 1px solid #E2E8F0;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .pd-pill-btn:hover {
    background: #E2E8F0;
    color: #0F172A;
  }
  .pd-pill-btn.active {
    background: #0F172A;
    color: #FFFFFF;
    border-color: #0F172A;
  }
  .pd-pill-count {
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 10px;
    background: rgba(0,0,0,0.08);
    font-weight: 700;
  }
  .pd-pill-btn.active .pd-pill-count {
    background: rgba(255,255,255,0.2);
    color: #FFFFFF;
  }

  .pd-search-tools {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .pd-search-input-wrap {
    position: relative;
    width: 320px;
    max-width: 100%;
  }
  .pd-search-input {
    width: 100%;
    padding: 8px 12px 8px 34px;
    border-radius: 8px;
    border: 1px solid #CBD5E1;
    font-size: 13px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    background: #FFFFFF;
  }
  .pd-search-input:focus {
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  }
  .pd-search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #94A3B8;
    pointer-events: none;
  }

  .pd-bulk-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 12px;
    background: #F8FAFC;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    transition: all 0.15s;
  }
  .pd-bulk-btn:hover {
    background: #F1F5F9;
    color: #0F172A;
  }

  .pd-view-toggle {
    display: flex;
    background: #F1F5F9;
    padding: 2px;
    border-radius: 8px;
    border: 1px solid #E2E8F0;
  }
  .pd-view-btn {
    padding: 6px 10px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: #64748B;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }
  .pd-view-btn.active {
    background: #FFFFFF;
    color: #0F172A;
    box-shadow: 0 1px 2px rgba(0,0,0,0.08);
  }

  /* ── PO-WISE ACCORDION LIST VIEW ── */
  .pd-po-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .pd-po-accordion {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }
  .pd-po-accordion:hover {
    border-color: #CBD5E1;
  }
  .pd-po-accordion.expanded {
    border-color: #93C5FD;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.06);
  }

  /* PO Header Row */
  .pd-po-row-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    background: #FAFCFF;
    cursor: pointer;
    user-select: none;
    gap: 14px;
    flex-wrap: wrap;
    border-bottom: 1px solid transparent;
    transition: background 0.15s;
  }
  .pd-po-accordion.expanded .pd-po-row-header {
    border-bottom-color: #E2E8F0;
    background: #F8FAFC;
  }
  .pd-po-row-header:hover {
    background: #F1F5F9;
  }

  .pd-po-identity {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    min-width: 260px;
  }
  .pd-chevron-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    color: #475569;
    transition: transform 0.2s ease, background 0.15s;
  }
  .pd-po-accordion.expanded .pd-chevron-btn {
    background: #EFF6FF;
    border-color: #BFDBFE;
    color: #2563EB;
  }
  .pd-po-num-box {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .pd-po-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 800;
    color: #1E40AF;
  }
  .pd-indent-chip {
    font-size: 11.5px;
    font-weight: 600;
    color: #64748B;
  }
  .pd-supplier-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
    color: #334155;
    background: #FFFFFF;
    padding: 3px 8px;
    border-radius: 6px;
    border: 1px solid #E2E8F0;
  }

  /* Material Status Chips in PO Header */
  .pd-mat-chips {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .pd-chip-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11.5px;
    font-weight: 700;
  }
  .pd-chip-pill.total {
    background: #F1F5F9;
    color: #334155;
    border: 1px solid #E2E8F0;
  }
  .pd-chip-pill.completed {
    background: #DCFCE7;
    color: #166534;
    border: 1px solid #BBF7D0;
  }
  .pd-chip-pill.partial {
    background: #FEF3C7;
    color: #92400E;
    border: 1px solid #FDE68A;
  }
  .pd-chip-pill.remaining {
    background: #FFE4E6;
    color: #9F1239;
    border: 1px solid #FECDD3;
  }

  /* Units Tally in PO Header */
  .pd-po-units-tally {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 170px;
  }
  .pd-units-text {
    font-size: 12px;
    color: #475569;
    display: flex;
    justify-content: space-between;
  }
  .pd-units-text strong {
    color: #0F172A;
  }
  .pd-progress-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pd-progress-bar {
    flex: 1;
    height: 6px;
    background: #E2E8F0;
    border-radius: 4px;
    overflow: hidden;
  }
  .pd-progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
  }
  .pd-progress-fill.partial {
    background: linear-gradient(90deg, #F59E0B 0%, #D97706 100%);
  }
  .pd-progress-fill.completed {
    background: linear-gradient(90deg, #10B981 0%, #059669 100%);
  }

  .pd-po-meta-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .pd-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 9px;
    border-radius: 6px;
    font-size: 11.5px;
    font-weight: 700;
  }
  .pd-status-badge.partial {
    background: #FEF3C7;
    color: #B45309;
    border: 1px solid #FDE68A;
  }
  .pd-status-badge.completed {
    background: #DCFCE7;
    color: #166534;
    border: 1px solid #BBF7D0;
  }
  .pd-status-badge.remaining {
    background: #FFE4E6;
    color: #BE123C;
    border: 1px solid #FECDD3;
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

  /* Expanded Material Breakdown Area */
  .pd-po-nested-area {
    background: #FFFFFF;
    padding: 16px 20px;
    border-top: 1px solid #E2E8F0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .pd-nested-title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: #475569;
    font-weight: 600;
  }
  .pd-nested-title-bar strong {
    color: #0F172A;
  }

  .pd-nested-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    overflow: hidden;
  }
  .pd-nested-table thead {
    background: #F8FAFC;
    border-bottom: 1px solid #CBD5E1;
  }
  .pd-nested-table th {
    padding: 9px 12px;
    text-align: left;
    font-weight: 700;
    color: #475569;
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .pd-nested-table td {
    padding: 10px 12px;
    border-bottom: 1px solid #F1F5F9;
    vertical-align: middle;
  }
  .pd-nested-table tbody tr:last-child td {
    border-bottom: none;
  }
  .pd-nested-table tbody tr:hover {
    background: #F8FAFC;
  }
  .pd-nested-table tbody tr.row-complete {
    background: #FAFCFA;
  }
  .pd-nested-table tbody tr.row-partial {
    background: #FFFDF9;
  }
  .pd-nested-table tbody tr.row-remaining {
    background: #FFFBFB;
  }

  .pd-mat-name {
    font-weight: 700;
    color: #0F172A;
    display: block;
  }
  .pd-mat-code {
    font-size: 11px;
    color: #64748B;
    font-family: monospace;
    display: block;
  }

  .pd-po-footer-summary {
    background: #F8FAFC;
    border: 1px dashed #CBD5E1;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 12.5px;
    color: #334155;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* ── CARDS VIEW ── */
  .pd-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
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
  const suppliers = erpStoreState?.procurement?.suppliers ?? erpStoreState?.suppliers ?? EMPTY_ARRAY;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'HAS_PARTIAL' | 'HAS_REMAINING'
  const [viewLayout, setViewLayout] = useState('accordion'); // 'accordion' | 'cards'
  const [expandedPOIds, setExpandedPOIds] = useState(new Set());
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

  // Master calculation of partial POs directly from physical receiving ledger
  const { analyzedPOs, kpiSummary } = useMemo(() => {
    let globalTotalLines = 0;
    let globalCompleteLines = 0;
    let globalPartialLines = 0;
    let globalRemainingLines = 0;
    let globalTotalPendingUnits = 0;
    let globalTotalOrderedUnits = 0;
    let globalTotalDeliveredUnits = 0;

    const partialPOList = [];

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
      let poDeliveredUnits = 0;
      let poRemainingUnits = 0;
      const computedPoLines = [];

      rawItems.forEach((item, idx) => {
        const orderedQty = Number(item.quantity || item.orderedQty || 0);
        if (orderedQty <= 0) return;

        // Sum cumulative received quantity across all valid accepted/verified GRNs
        let deliveredQty = 0;
        let latestGRNQty = 0;

        sortedGRNs.forEach((grn, gIdx) => {
          (grn.items || []).forEach(gi => {
            const isMatch =
              (gi.purchaseOrderItemId && gi.purchaseOrderItemId === item.id) ||
              (gi.productId && (gi.productId === item.productId || gi.productId === item.materialId)) ||
              (gi.materialName && item.materialName && gi.materialName.toLowerCase() === item.materialName.toLowerCase());

            if (isMatch) {
              const qty = Number(gi.acceptedQuantity ?? gi.receivedQuantity ?? gi.deliveredQuantity ?? 0);
              deliveredQty += qty;
              if (gIdx === 0) {
                latestGRNQty += qty;
              }
            }
          });
        });

        // Fallback to item.receivedQty / cumulativeDeliveredQty if GRNs array was empty
        if (deliveredQty === 0 && (item.receivedQty || item.cumulativeDeliveredQty || item.receivedQuantity)) {
          deliveredQty = Number(item.receivedQty || item.cumulativeDeliveredQty || item.receivedQuantity || 0);
        }

        const remainingQty = Math.max(0, orderedQty - deliveredQty);
        const previouslyDelivered = Math.max(0, deliveredQty - latestGRNQty);
        const fulfillmentPct = orderedQty > 0 ? Math.min(100, Math.round((deliveredQty / orderedQty) * 100)) : 0;

        // Exact Line Status Logic requested by user:
        // Delivered Qty >= Ordered Qty → Complete
        // 0 < Delivered Qty < Ordered Qty → Partial
        // Delivered Qty = 0 → Remaining
        let lineStatus = 'REMAINING';
        let lineStatusLabel = 'Remaining';
        let lineStatusIcon = '🔴';
        if (deliveredQty >= orderedQty) {
          lineStatus = 'COMPLETE';
          lineStatusLabel = 'Complete';
          lineStatusIcon = '✅';
        } else if (deliveredQty > 0 && deliveredQty < orderedQty) {
          lineStatus = 'PARTIAL';
          lineStatusLabel = 'Partial';
          lineStatusIcon = '🟠';
        } else {
          lineStatus = 'REMAINING';
          lineStatusLabel = 'Remaining';
          lineStatusIcon = '🔴';
        }

        const supplierName = po.supplier?.name || po.vendorName || po.snapshot?.vendorName || suppliers.find(s => s.id === po.supplierId)?.name || '—';
        const indentNumber = po.purchaseIndent?.publicId || po.purchaseIndent?.indentNo || po.indentNo || po.purchaseIndentId || '—';
        const materialName = item.product?.name || item.materialName || item.name || `Material #${idx + 1}`;
        const materialCode = item.product?.code || item.materialCode || `MAT-${String(idx + 1).padStart(3, '0')}`;
        const dueDate = po.expectedDeliveryDate || po.deliveryDate;
        const storeVerificationDate = latestGRN?.verifiedAt || latestGRN?.createdAt || null;
        const financeAuditStatus = latestGRN?.status || (deliveredQty > 0 ? 'STORE_VERIFIED' : 'PENDING_DELIVERY');

        const lineObj = {
          lineId: `${poId}-${item.id || idx}`,
          itemIndex: idx + 1,
          poId,
          poNumber: poNum,
          indentNumber,
          supplierName,
          materialName,
          materialCode,
          unit: item.unit || item.product?.unit || 'Units',
          orderedQty,
          previouslyDelivered,
          latestGRNQty,
          deliveredQty,
          remainingQty,
          fulfillmentPct,
          dueDate,
          latestGRN: latestGRN ? (latestGRN.grnNumber || latestGRN.id) : null,
          latestGRNObj: latestGRN,
          storeVerificationDate,
          financeAuditStatus,
          status: lineStatus,
          statusLabel: lineStatusLabel,
          statusIcon: lineStatusIcon,
          rawPO: po,
          rawItem: item
        };

        computedPoLines.push(lineObj);
        poOrderedUnits += orderedQty;
        poDeliveredUnits += deliveredQty;
        poRemainingUnits += remainingQty;
      });

      const totalMaterials = computedPoLines.length;
      const completedCount = computedPoLines.filter(l => l.status === 'COMPLETE').length;
      const partialCount = computedPoLines.filter(l => l.status === 'PARTIAL').length;
      const remainingCount = computedPoLines.filter(l => l.status === 'REMAINING').length;

      // Important logic requested by user:
      // PO is Complete only when all materials are complete.
      // PO is Partial Delivery when at least one material is delivered but one or more materials remain.
      const isPartiallyDeliveredPO =
        poDeliveredUnits > 0 &&
        poRemainingUnits > 0 &&
        po.status !== 'CLOSED' &&
        po.status !== 'PO_CLOSED';

      if (isPartiallyDeliveredPO) {
        const poObj = {
          poId,
          poNumber: poNum,
          indentNumber: po.purchaseIndent?.publicId || po.purchaseIndent?.indentNo || po.indentNo || po.purchaseIndentId || '—',
          supplierName: po.supplier?.name || po.vendorName || po.snapshot?.vendorName || suppliers.find(s => s.id === po.supplierId)?.name || '—',
          totalMaterials,
          completedCount,
          partialCount,
          remainingCount,
          totalOrdered: poOrderedUnits,
          totalDelivered: poDeliveredUnits,
          totalRemaining: poRemainingUnits,
          overallFulfillmentPct: poOrderedUnits > 0 ? Math.min(100, Math.round((poDeliveredUnits / poOrderedUnits) * 100)) : 0,
          overallStatus: 'Partial Delivery',
          dueDate: po.expectedDeliveryDate || po.deliveryDate,
          lines: computedPoLines,
          rawPO: po,
          latestGRN
        };

        partialPOList.push(poObj);

        // Global KPI tallies across qualified partial POs
        globalTotalLines += totalMaterials;
        globalCompleteLines += completedCount;
        globalPartialLines += partialCount;
        globalRemainingLines += remainingCount;
        globalTotalOrderedUnits += poOrderedUnits;
        globalTotalDeliveredUnits += poDeliveredUnits;
        globalTotalPendingUnits += poRemainingUnits;
      }
    });

    return {
      analyzedPOs: partialPOList,
      kpiSummary: {
        partialPOsCount: partialPOList.length,
        totalMaterials: globalTotalLines,
        completedMaterials: globalCompleteLines,
        partialMaterials: globalPartialLines,
        remainingMaterials: globalRemainingLines,
        totalOrderedUnits: globalTotalOrderedUnits,
        totalDeliveredUnits: globalTotalDeliveredUnits,
        totalPendingUnits: globalTotalPendingUnits
      }
    };
  }, [purchaseOrders, grnsByPO, suppliers]);

  // Automatically expand all POs initially so Finance immediately sees the material breakdowns
  useEffect(() => {
    if (analyzedPOs.length > 0 && expandedPOIds.size === 0) {
      setExpandedPOIds(new Set(analyzedPOs.map(po => po.poId)));
    }
  }, [analyzedPOs]);

  // Filtering POs by search query and mode
  const filteredPOs = useMemo(() => {
    let list = analyzedPOs;

    if (filterMode === 'HAS_PARTIAL') {
      list = list.filter(po => po.partialCount > 0);
    } else if (filterMode === 'HAS_REMAINING') {
      list = list.filter(po => po.remainingCount > 0);
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();

    return list.filter(po =>
      po.poNumber.toLowerCase().includes(q) ||
      po.supplierName.toLowerCase().includes(q) ||
      po.indentNumber.toLowerCase().includes(q) ||
      po.lines.some(l =>
        l.materialName.toLowerCase().includes(q) ||
        l.materialCode.toLowerCase().includes(q) ||
        (l.latestGRN && l.latestGRN.toLowerCase().includes(q))
      )
    );
  }, [analyzedPOs, filterMode, searchQuery]);

  // Accordion toggle handlers
  const togglePO = (poId) => {
    setExpandedPOIds(prev => {
      const next = new Set(prev);
      if (next.has(poId)) next.delete(poId);
      else next.add(poId);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedPOIds(new Set(filteredPOs.map(p => p.poId)));
  };

  const collapseAll = () => {
    setExpandedPOIds(new Set());
  };

  const isAllExpanded = filteredPOs.length > 0 && filteredPOs.every(p => expandedPOIds.has(p.poId));

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
              PO-Wise Ledger
            </span>
          </h2>
          <p>
            PO-wise monitoring queue of partially received Purchase Orders. Click any PO to expand its material-wise delivery status.
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
          <span className="pd-kpi-label">Partial Purchase Orders</span>
          <span className="pd-kpi-val">{kpiSummary.partialPOsCount}</span>
          <span className="pd-kpi-sub">Active open POs with partial inward</span>
        </div>
        <div className="pd-kpi-card">
          <span className="pd-kpi-label">Total Monitored Materials</span>
          <span className="pd-kpi-val">{kpiSummary.totalMaterials}</span>
          <span className="pd-kpi-sub">Across active partial POs</span>
        </div>
        <div className="pd-kpi-card emerald">
          <span className="pd-kpi-label">Completed Materials</span>
          <span className="pd-kpi-val">{kpiSummary.completedMaterials}</span>
          <span className="pd-kpi-sub">Delivered &ge; Ordered Qty</span>
        </div>
        <div className="pd-kpi-card amber">
          <span className="pd-kpi-label">Partially Delivered</span>
          <span className="pd-kpi-val">{kpiSummary.partialMaterials}</span>
          <span className="pd-kpi-sub">0 &lt; Delivered &lt; Ordered</span>
        </div>
        <div className="pd-kpi-card rose">
          <span className="pd-kpi-label">Remaining Materials</span>
          <span className="pd-kpi-val">{kpiSummary.remainingMaterials}</span>
          <span className="pd-kpi-sub">Delivered Qty = 0</span>
        </div>
        <div className="pd-kpi-card">
          <span className="pd-kpi-label">Outstanding Units</span>
          <span className="pd-kpi-val">{kpiSummary.totalPendingUnits.toLocaleString()}</span>
          <span className="pd-kpi-sub">Pending physical inward</span>
        </div>
      </div>

      {/* ── Dynamic Ledger Tree Widget (PO-wise hierarchy) ── */}
      <div className="pd-tree-summary">
        <div className="pd-tree-left">
          <div className="pd-tree-badge-root">
            <Boxes size={16} color="#2563EB" />
            <span>PO-wise Partial Delivery Ledger</span>
          </div>

          <div className="pd-tree-branches">
            <span className="pd-branch-item">
              ├── {kpiSummary.partialPOsCount} Open Partial POs ({kpiSummary.totalMaterials} Materials)
            </span>
            <span className="pd-branch-item completed">
              ├── {kpiSummary.completedMaterials} Complete
            </span>
            <span className="pd-branch-item partial">
              ├── {kpiSummary.partialMaterials} Partial
            </span>
            <span className="pd-branch-item remaining">
              └── {kpiSummary.remainingMaterials} Remaining
            </span>
          </div>
        </div>

        <div className="pd-tree-desc">
          Calculated from Store GRNs vs Ordered PO Quantities
        </div>
      </div>

      {/* ── Toolbar: Filters, Search, Bulk Actions & Layout Toggle ── */}
      <div className="pd-toolbar">
        <div className="pd-filter-pills">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`pd-pill-btn ${filterMode === 'ALL' ? 'active' : ''}`}
          >
            All Partial POs
            <span className="pd-pill-count">{kpiSummary.partialPOsCount}</span>
          </button>
          <button
            onClick={() => setFilterMode('HAS_PARTIAL')}
            className={`pd-pill-btn ${filterMode === 'HAS_PARTIAL' ? 'active' : ''}`}
          >
            🟠 Has Partial Lines
            <span className="pd-pill-count">
              {analyzedPOs.filter(p => p.partialCount > 0).length}
            </span>
          </button>
          <button
            onClick={() => setFilterMode('HAS_REMAINING')}
            className={`pd-pill-btn ${filterMode === 'HAS_REMAINING' ? 'active' : ''}`}
          >
            🔴 Has Remaining Lines
            <span className="pd-pill-count">
              {analyzedPOs.filter(p => p.remainingCount > 0).length}
            </span>
          </button>
        </div>

        <div className="pd-search-tools">
          <div className="pd-search-input-wrap">
            <Search size={15} className="pd-search-icon" />
            <input
              type="text"
              placeholder="Search PO Number, Material, Supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pd-search-input"
            />
          </div>

          {viewLayout === 'accordion' && (
            <button
              onClick={isAllExpanded ? collapseAll : expandAll}
              className="pd-bulk-btn"
              title={isAllExpanded ? 'Collapse all POs' : 'Expand all POs'}
            >
              <ChevronsUpDown size={14} />
              {isAllExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          )}

          <div className="pd-view-toggle">
            <button
              onClick={() => setViewLayout('accordion')}
              className={`pd-view-btn ${viewLayout === 'accordion' ? 'active' : ''}`}
              title="PO-wise Accordion View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewLayout('cards')}
              className={`pd-view-btn ${viewLayout === 'cards' ? 'active' : ''}`}
              title="PO Cards View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content: PO-wise Accordion or Cards ── */}
      {filteredPOs.length === 0 ? (
        <div className="pd-empty-state">
          <PackageCheck className="pd-empty-icon" />
          <h3>No Partial Purchase Orders Found</h3>
          <p>
            {searchQuery
              ? `No Purchase Orders matched your search "${searchQuery}". Try adjusting your filters.`
              : 'All active Purchase Orders are either awaiting initial receiving or have been 100% fulfilled and closed.'}
          </p>
        </div>
      ) : viewLayout === 'accordion' ? (
        /* ── PRIMARY VIEW: PO-WISE ACCORDION ── */
        <div className="pd-po-list">
          {filteredPOs.map(po => {
            const isExpanded = expandedPOIds.has(po.poId);
            const urgency = getDeliveryUrgency(po.dueDate);

            return (
              <div key={po.poId} className={`pd-po-accordion ${isExpanded ? 'expanded' : ''}`}>
                {/* PO Header Bar (Clicking anywhere toggles material expansion) */}
                <div className="pd-po-row-header" onClick={() => togglePO(po.poId)}>
                  {/* Left: Chevron & PO Identity */}
                  <div className="pd-po-identity">
                    <div className="pd-chevron-btn" title={isExpanded ? 'Collapse materials' : 'Expand materials'}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>

                    <div className="pd-po-num-box">
                      <div className="pd-po-badge">
                        <FileText size={15} color="#2563EB" />
                        <span>{po.poNumber}</span>
                      </div>
                      <span className="pd-indent-chip">Indent: {po.indentNumber}</span>
                    </div>

                    <div className="pd-supplier-chip" title="Supplier Name">
                      <Building2 size={13} color="#64748B" />
                      <span>{po.supplierName}</span>
                    </div>
                  </div>

                  {/* Middle: Material Counts Breakdown */}
                  <div className="pd-mat-chips">
                    <span className="pd-chip-pill total" title="Total Materials">
                      {po.totalMaterials} {po.totalMaterials === 1 ? 'Material' : 'Materials'}
                    </span>
                    {po.completedCount > 0 && (
                      <span className="pd-chip-pill completed" title="Materials with 100% Delivery">
                        ✅ {po.completedCount} Complete
                      </span>
                    )}
                    {po.partialCount > 0 && (
                      <span className="pd-chip-pill partial" title="Materials with partial quantity received">
                        🟠 {po.partialCount} Partial
                      </span>
                    )}
                    {po.remainingCount > 0 && (
                      <span className="pd-chip-pill remaining" title="Materials with 0 quantity received">
                        🔴 {po.remainingCount} Remaining
                      </span>
                    )}
                  </div>

                  {/* Units Tally & Progress */}
                  <div className="pd-po-units-tally">
                    <div className="pd-units-text">
                      <span>Delivered: <strong>{po.totalDelivered}</strong> / {po.totalOrdered}</span>
                      <span style={{ color: '#D97706', fontWeight: 700 }}>{po.totalRemaining} rem</span>
                    </div>
                    <div className="pd-progress-wrap">
                      <div className="pd-progress-bar">
                        <div
                          className="pd-progress-fill partial"
                          style={{ width: `${po.overallFulfillmentPct}%` }}
                        />
                      </div>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#334155' }}>
                        {po.overallFulfillmentPct}%
                      </span>
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="pd-po-meta-actions" onClick={(e) => e.stopPropagation()}>
                    <span className="pd-status-badge partial">
                      <Clock size={12} />
                      Partial Delivery
                    </span>

                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: urgency.bg,
                        color: urgency.color,
                        border: `1px solid ${urgency.border}`
                      }}
                      title="Target Due Date"
                    >
                      {urgency.text}
                    </span>

                    <button
                      onClick={() => handleOpenPO(po.rawPO)}
                      className="pd-btn-action view-po"
                      title="View full Purchase Order specifications"
                    >
                      <Eye size={12} />
                      View PO
                    </button>

                    <button
                      onClick={() => handleOpenDeliveryAudit(po.latestGRN, po.rawPO)}
                      className="pd-btn-action view-audit"
                      title="Open Delivery Audit for this PO"
                    >
                      <ClipboardCheck size={12} />
                      Audit
                    </button>
                  </div>
                </div>

                {/* Expanded Material-wise Delivery Status Breakdown */}
                {isExpanded && (
                  <div className="pd-po-nested-area">
                    <div className="pd-nested-title-bar">
                      <div>
                        <strong>Material Delivery Status Breakdown</strong> ({po.lines.length} {po.lines.length === 1 ? 'material' : 'materials'} for {po.poNumber})
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        Ordered: <strong>{po.totalOrdered}</strong> • Delivered: <strong style={{ color: '#16A34A' }}>{po.totalDelivered}</strong> • Remaining: <strong style={{ color: '#D97706' }}>{po.totalRemaining}</strong>
                      </div>
                    </div>

                    <table className="pd-nested-table">
                      <thead>
                        <tr>
                          <th style={{ width: 36 }}>#</th>
                          <th>Material</th>
                          <th className="text-right" style={{ textAlign: 'right' }}>PO Qty (Ordered)</th>
                          <th className="text-right" style={{ textAlign: 'right' }}>Delivered</th>
                          <th className="text-right" style={{ textAlign: 'right' }}>Remaining</th>
                          <th>Status</th>
                          <th>Fulfillment</th>
                          <th>Due Date</th>
                          <th>Latest Inward / GRN</th>
                          <th>Audit Status</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {po.lines.map((line) => {
                          const lineUrgency = getDeliveryUrgency(line.dueDate);
                          const rowClass =
                            line.status === 'COMPLETE'
                              ? 'row-complete'
                              : line.status === 'PARTIAL'
                              ? 'row-partial'
                              : 'row-remaining';

                          return (
                            <tr key={line.lineId} className={rowClass}>
                              <td style={{ color: '#64748B', fontWeight: 600 }}>{line.itemIndex}</td>
                              <td>
                                <span className="pd-mat-name">{line.materialName}</span>
                                <span className="pd-mat-code">{line.materialCode}</span>
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 700 }}>
                                {line.orderedQty} <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>{line.unit}</span>
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 800, color: '#16A34A' }}>
                                {line.deliveredQty}
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 800, color: line.remainingQty > 0 ? '#D97706' : '#16A34A' }}>
                                {line.remainingQty}
                              </td>
                              <td>
                                {line.status === 'COMPLETE' ? (
                                  <span className="pd-status-badge completed">
                                    <CheckCircle2 size={12} />
                                    Complete
                                  </span>
                                ) : line.status === 'PARTIAL' ? (
                                  <span className="pd-status-badge partial">
                                    <Clock size={12} />
                                    Partial
                                  </span>
                                ) : (
                                  <span className="pd-status-badge remaining">
                                    <AlertCircle size={12} />
                                    Remaining
                                  </span>
                                )}
                              </td>
                              <td>
                                <div className="pd-progress-wrap" style={{ minWidth: 100 }}>
                                  <div className="pd-progress-bar">
                                    <div
                                      className={`pd-progress-fill ${line.status === 'COMPLETE' ? 'completed' : 'partial'}`}
                                      style={{ width: `${line.fulfillmentPct}%` }}
                                    />
                                  </div>
                                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#334155' }}>
                                    {line.fulfillmentPct}%
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div style={{ fontSize: 12, color: '#334155' }}>{formatDate(line.dueDate)}</div>
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: '1px 5px',
                                    borderRadius: 4,
                                    background: lineUrgency.bg,
                                    color: lineUrgency.color,
                                    border: `1px solid ${lineUrgency.border}`,
                                    display: 'inline-block',
                                    marginTop: 2
                                  }}
                                >
                                  {lineUrgency.text}
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
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    padding: '2px 7px',
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
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => handleOpenDeliveryAudit(line.latestGRNObj, line.rawPO)}
                                    className="pd-btn-action view-audit"
                                    title="Audit latest inward delivery"
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

                    {/* PO Level Summary Footer */}
                    <div className="pd-po-footer-summary">
                      <div>
                        <strong>{po.poNumber} Summary:</strong> {po.totalMaterials} Materials ({po.completedCount} Complete, {po.partialCount} Partial, {po.remainingCount} Remaining)
                      </div>
                      <div>
                        Total: <strong>{po.totalOrdered} Ordered</strong> • <strong style={{ color: '#16A34A' }}>{po.totalDelivered} Delivered</strong> • <strong style={{ color: '#D97706' }}>{po.totalRemaining} Remaining</strong> ({po.overallFulfillmentPct}% Fulfilled)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ── ALTERNATIVE VIEW: ELEVATED PO CARDS ── */
        <div className="pd-cards-grid">
          {filteredPOs.map(po => {
            const isExpanded = expandedPOIds.has(po.poId);
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
                    <span className="pd-card-meta-lbl">Materials</span>
                    <span className="pd-card-meta-val">{po.totalMaterials} total ({po.completedCount} comp, {po.partialCount} part)</span>
                  </div>
                  <div className="pd-card-meta-item">
                    <span className="pd-card-meta-lbl">Units (Del / Rem)</span>
                    <span className="pd-card-meta-val" style={{ color: '#B45309' }}>
                      {po.totalDelivered} / {po.totalRemaining} rem
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
                        {line.status === 'COMPLETE' ? (
                          <span className="pd-status-badge completed" style={{ padding: '2px 6px', fontSize: 10 }}>
                            ✅ Complete
                          </span>
                        ) : line.status === 'PARTIAL' ? (
                          <span className="pd-status-badge partial" style={{ padding: '2px 6px', fontSize: 10 }}>
                            🟠 Partial
                          </span>
                        ) : (
                          <span className="pd-status-badge remaining" style={{ padding: '2px 6px', fontSize: 10 }}>
                            🔴 Remaining
                          </span>
                        )}
                      </div>
                      <div className="pd-card-item-nums">
                        <span>Ordered: <strong>{line.orderedQty}</strong></span>
                        <span>Delivered: <strong style={{ color: '#16A34A' }}>{line.deliveredQty}</strong></span>
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

      {/* ── Detail Modal for View PO ── */}
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

      {/* ── Quick Audit Modal ── */}
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

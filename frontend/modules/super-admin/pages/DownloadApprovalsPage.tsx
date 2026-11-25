'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import {
  ShieldCheck,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  FileSpreadsheet,
  FileText,
  User,
  AlertTriangle,
  History,
  Copy,
  Check,
  X,
  Lock,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  fetchAdminDownloadRequests,
  approveDownloadRequest,
  rejectDownloadRequest,
  SalesDownloadRequestRecord,
  SalesDownloadRequestStatus,
} from '../../../services/sales/downloadApprovalService';
import './DownloadApprovalsPage.css';

const STATUS_TABS: { id: string; label: string; countKey: keyof typeof INITIAL_COUNTS }[] = [
  { id: 'PENDING', label: 'Pending Review', countKey: 'pending' },
  { id: 'ALL', label: 'All Requests', countKey: 'total' },
  { id: 'APPROVED', label: 'Approved (24h)', countKey: 'approved' },
  { id: 'DOWNLOADED', label: 'Downloaded', countKey: 'downloaded' },
  { id: 'REJECTED', label: 'Rejected', countKey: 'rejected' },
  { id: 'EXPIRED', label: 'Expired', countKey: 'expired' },
];

const INITIAL_COUNTS = {
  pending: 0,
  approved: 0,
  rejected: 0,
  downloaded: 0,
  expired: 0,
  total: 0,
};

function escapeHtml(value: any): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatRelativeTime(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (diffSec < 45) return 'Just now';
  if (diffSec < 90) return '1 min ago';
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function getStatusBadge(status: SalesDownloadRequestStatus) {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Pending Approval',
        className: 'da-status-pending',
      };
    case 'APPROVED':
      return {
        label: 'Approved (Active)',
        className: 'da-status-approved',
      };
    case 'DOWNLOADED':
      return {
        label: 'Downloaded (Used)',
        className: 'da-status-downloaded',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        className: 'da-status-rejected',
      };
    case 'EXPIRED':
      return {
        label: 'Expired',
        className: 'da-status-expired',
      };
    default:
      return {
        label: status || 'Unknown',
        className: 'da-status-expired',
      };
  }
}

export default function DownloadApprovalsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [items, setItems] = useState<SalesDownloadRequestRecord[]>([]);
  const [counts, setCounts] = useState(INITIAL_COUNTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 280);
    return () => clearTimeout(t);
  }, [search]);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminDownloadRequests({
        status: statusFilter,
        search: debouncedSearch,
      });
      setItems(Array.isArray(res?.items) ? res.items : []);
      if (res?.counts) {
        setCounts(res.counts);
      }
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err?.message || 'Failed to load download approval requests.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleCopyRequestNo = (reqNo: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(reqNo).catch(() => {});
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleApprove = async (reqItem: SalesDownloadRequestRecord) => {
    const formattedRecords =
      typeof reqItem.recordCount === 'number' && reqItem.recordCount > 0
        ? reqItem.recordCount.toLocaleString('en-IN')
        : '0';

    const modal = await Swal.fire({
      icon: 'question',
      title: 'Approve Download Request?',
      customClass: {
        popup: 'da-swal-custom',
      },
      html: `
        <div style="text-align:left;font-size:13.5px;line-height:1.55;color:#334155;">
          <p style="margin:0 0 10px;">Grant <strong>1 single-use download</strong> (valid for 24 hours) to <strong>${escapeHtml(
            reqItem.requesterName || 'Sales User',
          )}</strong>?</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;font-size:12.5px;display:flex;flex-direction:column;gap:5px;">
            <div><strong style="color:#0f2742;">Request ID:</strong> <span style="font-family:monospace;font-weight:700;">${escapeHtml(
              reqItem.requestNo,
            )}</span></div>
            <div><strong style="color:#0f2742;">Dataset:</strong> ${escapeHtml(
              reqItem.resourceLabel || 'Sales Data',
            )}</div>
            <div><strong style="color:#0f2742;">Records:</strong> ${formattedRecords} (${escapeHtml(
        reqItem.format || 'CSV',
      )})</div>
            ${
              reqItem.reason
                ? `<div style="margin-top:4px;padding-top:4px;border-top:1px dashed #cbd5e1;"><strong style="color:#0f2742;">Requester Reason:</strong> <em>${escapeHtml(
                    reqItem.reason,
                  )}</em></div>`
                : ''
            }
          </div>
        </div>
      `,
      input: 'text',
      inputLabel: 'Approval remark (optional)',
      inputPlaceholder: 'e.g., Approved for monthly audit',
      showCancelButton: true,
      confirmButtonText: 'Accept & Unlock Download',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#64748b',
    });

    if (!modal.isConfirmed) return;

    setBusyId(reqItem.id);
    try {
      await approveDownloadRequest(
        reqItem.id,
        typeof modal.value === 'string' ? modal.value.trim() : undefined,
      );
      await Swal.fire({
        icon: 'success',
        title: 'Download Approved',
        text: `${reqItem.requesterName} has been notified and can download once within 24 hours.`,
        timer: 2400,
        showConfirmButton: false,
        customClass: { popup: 'da-swal-custom' },
      });
      await loadRequests();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Approval Failed',
        text: err?.message || 'Unable to approve download request.',
        customClass: { popup: 'da-swal-custom' },
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (reqItem: SalesDownloadRequestRecord) => {
    const modal = await Swal.fire({
      icon: 'warning',
      title: 'Reject Download Request?',
      customClass: {
        popup: 'da-swal-custom',
      },
      html: `
        <div style="text-align:left;font-size:13.5px;line-height:1.55;color:#334155;">
          <p style="margin:0 0 10px;">Block <strong>${escapeHtml(
            reqItem.requesterName || 'User',
          )}</strong> from downloading <strong>${escapeHtml(
        reqItem.resourceLabel || 'this dataset',
      )}</strong>?</p>
          <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;padding:10px 12px;font-size:12.5px;color:#9f1239;">
            Request ID: <strong style="font-family:monospace;">${escapeHtml(
              reqItem.requestNo,
            )}</strong>
          </div>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Reason for rejection',
      inputPlaceholder: 'e.g., Data export not permitted for this period...',
      showCancelButton: true,
      confirmButtonText: 'Reject Request',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
    });

    if (!modal.isConfirmed) return;

    setBusyId(reqItem.id);
    try {
      await rejectDownloadRequest(
        reqItem.id,
        typeof modal.value === 'string' && modal.value.trim()
          ? modal.value.trim()
          : 'Rejected by Admin',
      );
      await Swal.fire({
        icon: 'info',
        title: 'Request Rejected',
        text: `${reqItem.requesterName} has been notified and download remains blocked.`,
        timer: 2400,
        showConfirmButton: false,
        customClass: { popup: 'da-swal-custom' },
      });
      await loadRequests();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Rejection Failed',
        text: err?.message || 'Unable to reject download request.',
        customClass: { popup: 'da-swal-custom' },
      });
    } finally {
      setBusyId(null);
    }
  };

  const activeTabMeta = STATUS_TABS.find((t) => t.id === statusFilter) || STATUS_TABS[0];

  return (
    <div className="da-page-container">
      {/* ── Header Banner Card ── */}
      <div className="da-header-card">
        <div className="da-header-left">
          <div className="da-header-icon-box">
            <ShieldCheck className="w-6 h-6 text-sky-400" />
          </div>
          <div className="da-header-content">
            <div className="da-header-badges">
              <span className="da-badge-pill da-badge-pill-navy">
                <Lock className="w-3 h-3" /> Security Gate
              </span>
              <span className="da-badge-pill da-badge-pill-emerald">
                <Sparkles className="w-3 h-3" /> 24h Single-Use Token
              </span>
            </div>
            <h1 className="da-header-title">Sales Data Download Approvals</h1>
            <p className="da-header-desc">
              Review and govern bulk data exports (Leads CSV, Orders CSV, Customer Master &amp; Sales Reports). Approved requests grant a secure 1-time download window valid for 24 hours.
            </p>
          </div>
        </div>

        <div className="da-header-actions">
          {lastUpdated && (
            <span className="da-last-updated">
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={loadRequests}
            disabled={loading}
            className="da-btn-refresh"
            title="Refresh requests"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div className="da-kpi-grid">
        {[
          {
            key: 'PENDING',
            label: 'Pending Review',
            value: counts.pending,
            theme: 'da-kpi-amber',
            borderClass: 'da-kpi-card-amber',
            icon: Clock,
            hint: counts.pending > 0 ? 'Requires attention' : 'All clear',
            showPulse: counts.pending > 0,
          },
          {
            key: 'APPROVED',
            label: 'Approved (Active)',
            value: counts.approved,
            theme: 'da-kpi-emerald',
            borderClass: 'da-kpi-card-emerald',
            icon: CheckCircle2,
            hint: 'Valid for 24h',
            showPulse: false,
          },
          {
            key: 'DOWNLOADED',
            label: 'Downloaded',
            value: counts.downloaded,
            theme: 'da-kpi-sky',
            borderClass: 'da-kpi-card-sky',
            icon: Download,
            hint: 'Token consumed',
            showPulse: false,
          },
          {
            key: 'REJECTED',
            label: 'Rejected',
            value: counts.rejected,
            theme: 'da-kpi-rose',
            borderClass: 'da-kpi-card-rose',
            icon: XCircle,
            hint: 'Access blocked',
            showPulse: false,
          },
          {
            key: 'ALL',
            label: 'Total Requests',
            value: counts.total,
            theme: 'da-kpi-navy',
            borderClass: 'da-kpi-card-navy',
            icon: History,
            hint: 'All-time log',
            showPulse: false,
          },
        ].map((card) => {
          const Icon = card.icon;
          const active = statusFilter === card.key;
          return (
            <button
              key={card.key}
              onClick={() => setStatusFilter(card.key)}
              className={`da-kpi-card ${card.borderClass} ${card.theme} ${
                active ? 'is-active' : ''
              }`}
            >
              <div className="da-kpi-card-header">
                <span className="da-kpi-label">{card.label}</span>
                <div className="flex items-center gap-1.5">
                  {card.showPulse && <span className="da-pulse-dot" />}
                  <div className="da-kpi-icon-wrap">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="da-kpi-body">
                <span className="da-kpi-value">{card.value}</span>
                <span className="da-kpi-hint">{card.hint}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Main Card (Filter Toolbar, Search, Data Table & Mobile Cards) ── */}
      <div className="da-main-card">
        {/* Toolbar */}
        <div className="da-toolbar">
          <div className="da-tabs-wrap">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.id;
              const countVal = counts[tab.countKey] ?? 0;
              const isPendingTab = tab.id === 'PENDING';
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`da-tab-btn ${
                    isPendingTab ? 'da-tab-btn-pending' : ''
                  } ${active ? 'is-active' : ''}`}
                >
                  <span>{tab.label}</span>
                  <span className="da-tab-count">{countVal}</span>
                </button>
              );
            })}
          </div>

          <div className="da-search-box">
            <Search className="da-search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search request #, user, dataset, reason..."
              className="da-search-input"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="da-search-clear"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary Strip */}
        <div className="da-summary-bar">
          <div className="da-summary-meta">
            <span>Viewing:</span>
            <span className="da-summary-pill">
              {activeTabMeta.label} ({items.length})
            </span>
            {debouncedSearch && (
              <span className="text-slate-500 font-medium">
                matching &ldquo;<strong>{debouncedSearch}</strong>&rdquo;
              </span>
            )}
          </div>
          {statusFilter === 'PENDING' && counts.pending > 0 && (
            <span className="text-amber-700 font-semibold flex items-center gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              {counts.pending} request{counts.pending === 1 ? '' : 's'} waiting for your approval
            </span>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="da-error-banner">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadRequests}
              className="text-xs font-bold underline cursor-pointer hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Desktop Data Table (Screens >= 880px) ── */}
        <div className="da-table-container">
          <table className="da-table">
            <thead>
              <tr>
                <th>Request #</th>
                <th>Sales User</th>
                <th>Requested Dataset &amp; Reason</th>
                <th>Status &amp; Audit Trail</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
                    <div className="font-semibold text-slate-700">Loading download requests...</div>
                    <div className="text-xs text-slate-400 mt-1">Fetching latest records from server</div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="da-empty-state">
                      <div className="da-empty-icon-wrap">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <h3 className="da-empty-title">No download requests found</h3>
                      <p className="da-empty-desc">
                        {debouncedSearch
                          ? `No requests match "${debouncedSearch}". Try clearing your search query.`
                          : statusFilter === 'PENDING'
                          ? 'Great job! There are no pending download requests awaiting your approval right now.'
                          : `There are currently no requests in the "${activeTabMeta.label}" category.`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const badge = getStatusBadge(item.status);
                  const isBusy = busyId === item.id;
                  const isPdf = String(item.format || '').toUpperCase() === 'PDF';
                  const roleFormatted = (item.requesterRole || 'SALES').replace(/_/g, ' ');
                  const relativeTime = formatRelativeTime(item.createdAt);

                  return (
                    <tr key={item.id}>
                      {/* Request # */}
                      <td>
                        <div className="da-request-no">
                          <span>{item.requestNo}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyRequestNo(item.requestNo, item.id, e)}
                            className="da-copy-btn"
                            title="Copy Request #"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="da-date-hint">
                          {formatDateTime(item.createdAt)}
                          {relativeTime ? ` • ${relativeTime}` : ''}
                        </div>
                      </td>

                      {/* Sales User */}
                      <td>
                        <div className="da-user-wrap">
                          <div className="da-user-avatar">
                            {(item.requesterName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="da-user-name">{item.requesterName || 'Unnamed User'}</div>
                            <div className="da-user-email">{item.requesterEmail || '—'}</div>
                            <span className="da-role-badge">{roleFormatted}</span>
                          </div>
                        </div>
                      </td>

                      {/* Requested Dataset & Reason */}
                      <td className="max-w-md">
                        <div className="da-dataset-heading">
                          <span
                            className={`da-format-pill ${
                              isPdf ? 'da-format-pdf' : 'da-format-csv'
                            }`}
                          >
                            {isPdf ? (
                              <FileText className="w-3 h-3" />
                            ) : (
                              <FileSpreadsheet className="w-3 h-3" />
                            )}
                            {item.format || 'CSV'}
                          </span>
                          <span className="da-resource-title">
                            {item.resourceLabel || 'Export Dataset'}
                          </span>
                        </div>

                        <div className="da-dataset-meta">
                          <span>Module: <strong className="text-slate-700">{item.module || 'Sales'}</strong></span>
                          {typeof item.recordCount === 'number' && item.recordCount > 0 && (
                            <>
                              <span>•</span>
                              <span>
                                <strong className="text-slate-700">
                                  {item.recordCount.toLocaleString('en-IN')}
                                </strong>{' '}
                                records
                              </span>
                            </>
                          )}
                        </div>

                        {item.reason && (
                          <div className="da-reason-box">
                            <span className="da-reason-label">Reason:</span>
                            {item.reason}
                          </div>
                        )}
                      </td>

                      {/* Status & Audit Trail */}
                      <td>
                        <span className={`da-status-badge ${badge.className}`}>
                          <span className="da-status-dot" />
                          {badge.label}
                        </span>

                        <div className="da-audit-trail">
                          {item.reviewedByName && (
                            <div>
                              By <strong className="text-slate-700">{item.reviewedByName}</strong>
                              {item.reviewedAt ? ` • ${formatDateTime(item.reviewedAt)}` : ''}
                            </div>
                          )}
                          {item.status === 'APPROVED' && item.expiresAt && (
                            <div className="text-emerald-700 font-semibold">
                              Expires: {formatDateTime(item.expiresAt)}
                            </div>
                          )}
                          {item.status === 'DOWNLOADED' && item.downloadedAt && (
                            <div className="text-sky-700 font-semibold">
                              Downloaded: {formatDateTime(item.downloadedAt)}
                            </div>
                          )}
                          {item.reviewRemarks && (
                            <div className="da-audit-remarks">
                              &ldquo;{item.reviewRemarks}&rdquo;
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="text-right whitespace-nowrap">
                        {item.status === 'PENDING' ? (
                          <div className="da-actions-wrap">
                            <button
                              onClick={() => handleApprove(item)}
                              disabled={isBusy}
                              className="da-btn-accept"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(item)}
                              disabled={isBusy}
                              className="da-btn-reject"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="da-resolved-tag">
                            <Lock className="w-3.5 h-3.5 opacity-60" />
                            Resolved
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card List (Screens < 880px) ── */}
        <div className="da-mobile-card-list">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-600" />
              <div className="text-sm font-semibold text-slate-700">Loading requests...</div>
            </div>
          ) : items.length === 0 ? (
            <div className="da-empty-state">
              <div className="da-empty-icon-wrap">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="da-empty-title">No download requests</h3>
              <p className="da-empty-desc">
                {debouncedSearch
                  ? `No requests match "${debouncedSearch}".`
                  : 'No requests found in this category.'}
              </p>
            </div>
          ) : (
            items.map((item) => {
              const badge = getStatusBadge(item.status);
              const isBusy = busyId === item.id;
              const isPdf = String(item.format || '').toUpperCase() === 'PDF';
              const roleFormatted = (item.requesterRole || 'SALES').replace(/_/g, ' ');

              return (
                <div key={item.id} className="da-mobile-item-card">
                  {/* Card Header: Request # & Status */}
                  <div className="da-mobile-card-header">
                    <div className="da-request-no">
                      <span>{item.requestNo}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyRequestNo(item.requestNo, item.id, e)}
                        className="da-copy-btn"
                        title="Copy Request #"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <span className={`da-status-badge ${badge.className}`}>
                      <span className="da-status-dot" />
                      {badge.label}
                    </span>
                  </div>

                  {/* Requester User Row */}
                  <div className="da-mobile-user-row">
                    <div className="da-user-avatar">
                      {(item.requesterName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="da-user-name truncate">{item.requesterName || 'Sales User'}</div>
                      <div className="da-user-email truncate">{item.requesterEmail || '—'}</div>
                    </div>
                    <span className="da-role-badge">{roleFormatted}</span>
                  </div>

                  {/* Dataset Details */}
                  <div>
                    <div className="da-dataset-heading">
                      <span
                        className={`da-format-pill ${
                          isPdf ? 'da-format-pdf' : 'da-format-csv'
                        }`}
                      >
                        {isPdf ? (
                          <FileText className="w-3 h-3" />
                        ) : (
                          <FileSpreadsheet className="w-3 h-3" />
                        )}
                        {item.format || 'CSV'}
                      </span>
                      <span className="da-resource-title">{item.resourceLabel}</span>
                    </div>

                    <div className="da-dataset-meta">
                      <span>Module: <strong className="text-slate-700">{item.module}</strong></span>
                      {typeof item.recordCount === 'number' && item.recordCount > 0 && (
                        <>
                          <span>•</span>
                          <span>
                            <strong className="text-slate-700">
                              {item.recordCount.toLocaleString('en-IN')}
                            </strong>{' '}
                            records
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatDateTime(item.createdAt)}</span>
                    </div>

                    {item.reason && (
                      <div className="da-reason-box">
                        <span className="da-reason-label">Reason:</span>
                        {item.reason}
                      </div>
                    )}
                  </div>

                  {/* Audit Trail (if applicable) */}
                  {(item.reviewedByName || item.expiresAt || item.downloadedAt || item.reviewRemarks) && (
                    <div className="da-audit-trail pt-2 border-t border-slate-100">
                      {item.reviewedByName && (
                        <div>
                          By <strong className="text-slate-700">{item.reviewedByName}</strong>
                          {item.reviewedAt ? ` • ${formatDateTime(item.reviewedAt)}` : ''}
                        </div>
                      )}
                      {item.status === 'APPROVED' && item.expiresAt && (
                        <div className="text-emerald-700 font-semibold">
                          Expires: {formatDateTime(item.expiresAt)}
                        </div>
                      )}
                      {item.status === 'DOWNLOADED' && item.downloadedAt && (
                        <div className="text-sky-700 font-semibold">
                          Downloaded: {formatDateTime(item.downloadedAt)}
                        </div>
                      )}
                      {item.reviewRemarks && (
                        <div className="da-audit-remarks">
                          &ldquo;{item.reviewRemarks}&rdquo;
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile Actions */}
                  {item.status === 'PENDING' && (
                    <div className="da-mobile-actions">
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={isBusy}
                        className="da-btn-accept"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(item)}
                        disabled={isBusy}
                        className="da-btn-reject"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

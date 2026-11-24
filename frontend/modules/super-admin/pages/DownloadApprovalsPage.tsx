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
} from 'lucide-react';
import {
  fetchAdminDownloadRequests,
  approveDownloadRequest,
  rejectDownloadRequest,
  SalesDownloadRequestRecord,
  SalesDownloadRequestStatus,
} from '../../../services/sales/downloadApprovalService';

const STATUS_TABS: { id: string; label: string }[] = [
  { id: 'PENDING', label: 'Pending' },
  { id: 'ALL', label: 'All Requests' },
  { id: 'APPROVED', label: 'Approved (24h)' },
  { id: 'DOWNLOADED', label: 'Downloaded' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'EXPIRED', label: 'Expired' },
];

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

function getStatusBadge(status: SalesDownloadRequestStatus) {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Pending Approval',
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'APPROVED':
      return {
        label: 'Approved (Ready)',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'DOWNLOADED':
      return {
        label: 'Downloaded (Used)',
        bg: 'bg-sky-50 text-sky-800 border-sky-200',
        dot: 'bg-sky-500',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'EXPIRED':
      return {
        label: 'Expired',
        bg: 'bg-slate-100 text-slate-600 border-slate-200',
        dot: 'bg-slate-400',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export default function DownloadApprovalsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [items, setItems] = useState<SalesDownloadRequestRecord[]>([]);
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    downloaded: 0,
    expired: 0,
    total: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      setError(err?.message || 'Failed to load download approval requests.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (reqItem: SalesDownloadRequestRecord) => {
    const modal = await Swal.fire({
      icon: 'question',
      title: 'Accept Download Request?',
      html: `
        <div style="text-align:left;font-size:13.5px;line-height:1.55;color:#334155;">
          <p style="margin:0 0 8px;">Grant <strong>1 single-use download</strong> (valid for 24 hours) to <strong>${reqItem.requesterName}</strong>?</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;font-size:12.5px;">
            <div><strong>Request ID:</strong> ${reqItem.requestNo}</div>
            <div><strong>Dataset:</strong> ${reqItem.resourceLabel}</div>
            <div><strong>Records:</strong> ${reqItem.recordCount || 0} (${reqItem.format})</div>
            ${reqItem.reason ? `<div><strong>User Reason:</strong> ${reqItem.reason}</div>` : ''}
          </div>
        </div>
      `,
      input: 'text',
      inputLabel: 'Approval remark (optional)',
      inputPlaceholder: 'e.g., Approved for monthly review',
      showCancelButton: true,
      confirmButtonText: 'Accept & Unlock Download',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#059669',
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
      });
      await loadRequests();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Approval Failed',
        text: err?.message || 'Unable to approve download request.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (reqItem: SalesDownloadRequestRecord) => {
    const modal = await Swal.fire({
      icon: 'warning',
      title: 'Reject Download Request?',
      html: `
        <div style="text-align:left;font-size:13.5px;line-height:1.55;color:#334155;">
          <p style="margin:0 0 8px;">Block <strong>${reqItem.requesterName}</strong> from downloading <strong>${reqItem.resourceLabel}</strong>?</p>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Reason for rejection',
      inputPlaceholder: 'e.g., Data export not permitted for this period...',
      showCancelButton: true,
      confirmButtonText: 'Reject Request',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
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
      });
      await loadRequests();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Rejection Failed',
        text: err?.message || 'Unable to reject download request.',
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1440px] mx-auto space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-sky-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Sales Data Download Approvals
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Review and control bulk Sales exports (Leads CSV, Orders CSV, Sales Reports CSV &amp; PDF). Approved requests grant 1 single-use download valid for 24 hours.
            </p>
          </div>
        </div>
        <button
          onClick={loadRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          {
            key: 'PENDING',
            label: 'Pending Review',
            value: counts.pending,
            accent: 'border-amber-200 bg-amber-50/50 text-amber-800',
            icon: Clock,
          },
          {
            key: 'APPROVED',
            label: 'Approved (Active)',
            value: counts.approved,
            accent: 'border-emerald-200 bg-emerald-50/50 text-emerald-800',
            icon: CheckCircle2,
          },
          {
            key: 'DOWNLOADED',
            label: 'Downloaded',
            value: counts.downloaded,
            accent: 'border-sky-200 bg-sky-50/50 text-sky-800',
            icon: Download,
          },
          {
            key: 'REJECTED',
            label: 'Rejected',
            value: counts.rejected,
            accent: 'border-rose-200 bg-rose-50/50 text-rose-800',
            icon: XCircle,
          },
          {
            key: 'ALL',
            label: 'Total Requests',
            value: counts.total,
            accent: 'border-slate-200 bg-white text-slate-800',
            icon: History,
          },
        ].map((card) => {
          const Icon = card.icon;
          const active = statusFilter === card.key;
          return (
            <button
              key={card.key}
              onClick={() => setStatusFilter(card.key)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${card.accent} ${
                active ? 'ring-2 ring-sky-500 shadow-sm' : 'hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
                  {card.label}
                </span>
                <Icon className="w-4 h-4 opacity-80" />
              </div>
              <div className="text-2xl font-extrabold mt-2">{card.value}</div>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#002e5d] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                  {tab.id === 'PENDING' && counts.pending > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-amber-400 text-slate-900 font-bold">
                      {counts.pending}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search request #, user, dataset, reason..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-4">Sales User</th>
                <th className="py-3 px-4">Requested Data &amp; Reason</th>
                <th className="py-3 px-4">Status &amp; Audit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading download approval requests...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-slate-400">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <div className="font-semibold text-slate-600">
                      No download requests in this view
                    </div>
                    <div className="text-xs mt-1">
                      When Sales or SuperSales users attempt to export data, their requests will appear here.
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const badge = getStatusBadge(item.status);
                  const isBusy = busyId === item.id;
                  const isPdf = String(item.format || '').toUpperCase() === 'PDF';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="font-mono text-xs font-bold text-[#002e5d]">
                          {item.requestNo}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {formatDateTime(item.createdAt)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-3.5 h-3.5 text-slate-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 leading-tight">
                              {item.requesterName}
                            </div>
                            <div className="text-xs text-slate-500">{item.requesterEmail}</div>
                            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-md bg-slate-100 text-slate-600">
                              {item.requesterRole.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top max-w-md">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              isPdf
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {isPdf ? (
                              <FileText className="w-3 h-3" />
                            ) : (
                              <FileSpreadsheet className="w-3 h-3" />
                            )}
                            {item.format}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {item.resourceLabel}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Module: <span className="font-medium text-slate-700">{item.module}</span>
                          {item.recordCount > 0 && (
                            <>
                              {' • '}
                              <span className="font-semibold text-slate-700">
                                {item.recordCount} records
                              </span>
                            </>
                          )}
                        </div>
                        {item.reason && (
                          <div className="mt-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5">
                            <span className="font-semibold text-slate-700">Reason: </span>
                            {item.reason}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>

                        {item.reviewedByName && (
                          <div className="text-[11px] text-slate-500 mt-1.5">
                            By <span className="font-semibold text-slate-700">{item.reviewedByName}</span>
                            {item.reviewedAt ? ` • ${formatDateTime(item.reviewedAt)}` : ''}
                          </div>
                        )}
                        {item.status === 'APPROVED' && item.expiresAt && (
                          <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                            Expires: {formatDateTime(item.expiresAt)}
                          </div>
                        )}
                        {item.status === 'DOWNLOADED' && item.downloadedAt && (
                          <div className="text-[11px] text-sky-700 mt-0.5 font-medium">
                            Downloaded: {formatDateTime(item.downloadedAt)}
                          </div>
                        )}
                        {item.reviewRemarks && (
                          <div className="text-[11px] text-slate-600 mt-1 italic">
                            &ldquo;{item.reviewRemarks}&rdquo;
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        {item.status === 'PENDING' ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(item)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(item)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

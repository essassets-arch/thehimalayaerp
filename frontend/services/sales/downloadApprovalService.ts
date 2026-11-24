'use client';

import Swal from 'sweetalert2';
import { backendFetch } from '../../lib/backendFetch';
import { useAuthStore } from '../../store/authStore';

export type SalesDownloadRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'DOWNLOADED'
  | 'EXPIRED';

export interface SalesDownloadRequestRecord {
  id: string;
  requestNo: string;
  companyId: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterRole: string;
  module: string;
  exportType: string;
  format: string;
  resourceLabel: string;
  recordCount: number;
  filtersSnapshot?: Record<string, any> | null;
  reason?: string | null;
  status: SalesDownloadRequestStatus;
  reviewedById?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  reviewRemarks?: string | null;
  expiresAt?: string | null;
  downloadedAt?: string | null;
  downloadedFile?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveApprovalResponse {
  approved: boolean;
  request: SalesDownloadRequestRecord | null;
  pendingRequest: SalesDownloadRequestRecord | null;
  latestRejected: SalesDownloadRequestRecord | null;
}

export interface AdminDownloadRequestsResponse {
  items: SalesDownloadRequestRecord[];
  counts: {
    pending: number;
    approved: number;
    rejected: number;
    downloaded: number;
    expired: number;
    total: number;
  };
}

const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'SUPERADMIN', 'ADMIN']);
const SALES_ROLES = new Set([
  'SALES',
  'SALES_EXECUTIVE',
  'SUPER_SALES',
  'SUPERSALES',
  'SALES_MANAGER',
  'SALES_REP',
]);

function normalizeRole(rawRole: any): string {
  const value =
    typeof rawRole === 'string'
      ? rawRole
      : rawRole?.code || rawRole?.name || '';
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

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

/**
 * Returns true if the active user is a Sales / SuperSales role whose tabular
 * data downloads must be approved by Admin first.
 * Super Admin & Admin bypass the gate automatically.
 */
export function isSalesApprovalRequired(explicitUser?: any): boolean {
  const user = explicitUser || useAuthStore.getState()?.user;
  if (!user) return false;
  const roleCode = normalizeRole(user?.roleCode || user?.role);
  if (!roleCode) return false;
  if (ADMIN_ROLES.has(roleCode)) return false;
  return SALES_ROLES.has(roleCode) || roleCode.includes('SALES');
}

export async function fetchActiveDownloadApproval(
  moduleName: string,
  exportType?: string,
): Promise<ActiveApprovalResponse> {
  const params = new URLSearchParams({ module: moduleName });
  if (exportType) params.set('exportType', exportType);
  return backendFetch<ActiveApprovalResponse>(
    `/sales/download-requests/active-approval?${params.toString()}`,
    { method: 'GET' },
  );
}

export async function createDownloadRequest(payload: {
  module: string;
  exportType?: string;
  format?: string;
  resourceLabel: string;
  recordCount?: number;
  filtersSnapshot?: Record<string, any>;
  reason?: string;
}): Promise<{
  request: SalesDownloadRequestRecord;
  alreadyExists: boolean;
  message: string;
}> {
  return backendFetch('/sales/download-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function consumeDownloadApproval(
  requestId: string,
  filename?: string,
): Promise<{ consumed: boolean; requestId: string; downloadedAt: string }> {
  return backendFetch(
    `/sales/download-requests/${encodeURIComponent(requestId)}/consume`,
    {
      method: 'POST',
      body: JSON.stringify({ filename }),
    },
  );
}

export async function fetchMyDownloadRequests(): Promise<SalesDownloadRequestRecord[]> {
  return backendFetch<SalesDownloadRequestRecord[]>('/sales/download-requests/my', {
    method: 'GET',
  });
}

export async function fetchAdminDownloadRequests(params?: {
  status?: string;
  search?: string;
}): Promise<AdminDownloadRequestsResponse> {
  const qs = new URLSearchParams();
  if (params?.status && params.status !== 'ALL') qs.set('status', params.status);
  if (params?.search?.trim()) qs.set('search', params.search.trim());
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return backendFetch<AdminDownloadRequestsResponse>(
    `/sales/download-requests/admin${suffix}`,
    { method: 'GET' },
  );
}

export async function approveDownloadRequest(
  id: string,
  remarks?: string,
): Promise<SalesDownloadRequestRecord> {
  return backendFetch<SalesDownloadRequestRecord>(
    `/sales/download-requests/${encodeURIComponent(id)}/approve`,
    {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    },
  );
}

export async function rejectDownloadRequest(
  id: string,
  remarks?: string,
): Promise<SalesDownloadRequestRecord> {
  return backendFetch<SalesDownloadRequestRecord>(
    `/sales/download-requests/${encodeURIComponent(id)}/reject`,
    {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    },
  );
}

export interface SalesDownloadGateParams<T = any> {
  user?: any;
  module: 'LEADS_CSV' | 'ORDERS_CSV' | 'REPORTS_CSV' | 'REPORTS_PDF' | string;
  exportType?: string;
  format: 'CSV' | 'PDF' | string;
  resourceLabel: string;
  recordCount?: number;
  filtersSnapshot?: Record<string, any>;
  executeDownload: (downloadRequestId?: string) => Promise<T>;
}

export interface SalesDownloadGateResult<T = any> {
  executed: boolean;
  bypassed?: boolean;
  status?: 'DOWNLOADED' | 'PENDING' | 'REQUESTED' | 'CANCELLED';
  request?: SalesDownloadRequestRecord | null;
  result?: T;
}

/**
 * Gates any Sales tabular/bulk export behind Admin approval.
 * - Admin / Super Admin -> downloads immediately.
 * - Sales with an active APPROVED request -> consumes single-use approval and executes download.
 * - Sales with a PENDING request -> informs user and blocks download (with quick re-check button).
 * - Sales without approval -> prompts to send request to Admin and blocks download.
 */
export async function requestOrExecuteSalesDownload<T = any>(
  params: SalesDownloadGateParams<T>,
): Promise<SalesDownloadGateResult<T>> {
  const {
    user,
    module: moduleName,
    exportType = 'summary',
    format,
    resourceLabel,
    recordCount = 0,
    filtersSnapshot,
    executeDownload,
  } = params;

  if (!isSalesApprovalRequired(user)) {
    const result = await executeDownload(undefined);
    return { executed: true, bypassed: true, status: 'DOWNLOADED', result };
  }

  const approvalState = await fetchActiveDownloadApproval(moduleName, exportType);

  // 1. Admin has approved and the 24h single-use window is active -> consume & download once
  if (approvalState?.approved && approvalState.request) {
    const approvedReq = approvalState.request;
    await consumeDownloadApproval(approvedReq.id, resourceLabel);
    const result = await executeDownload(approvedReq.id);
    return {
      executed: true,
      bypassed: false,
      status: 'DOWNLOADED',
      request: approvedReq,
      result,
    };
  }

  // 2. Request is already pending Admin review -> strictly block download
  if (approvalState?.pendingRequest) {
    const pending = approvalState.pendingRequest;
    const modal = await Swal.fire({
      icon: 'info',
      title: 'Waiting for Admin Approval',
      html: `
        <div style="text-align:left;font-size:13.5px;line-height:1.55;color:#334155;">
          <p style="margin:0 0 10px;">Your download request is currently <strong>pending Admin approval</strong>. Download will unlock automatically once Admin accepts.</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;font-size:12.5px;">
            <div><strong>Request ID:</strong> ${escapeHtml(pending.requestNo)}</div>
            <div><strong>Dataset:</strong> ${escapeHtml(pending.resourceLabel)}</div>
            <div><strong>Submitted:</strong> ${escapeHtml(formatDateTime(pending.createdAt))}</div>
            ${pending.reason ? `<div><strong>Reason:</strong> ${escapeHtml(pending.reason)}</div>` : ''}
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Check Approval Status',
      cancelButtonText: 'Close',
      confirmButtonColor: '#0284c7',
    });

    if (modal.isConfirmed) {
      return requestOrExecuteSalesDownload(params);
    }

    return { executed: false, status: 'PENDING', request: pending };
  }

  // 3. No active approval -> prompt Sales user to submit a request to Admin
  const latestRejected = approvalState?.latestRejected;
  const rejectedNotice = latestRejected
    ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:9px 12px;margin-bottom:10px;color:#991b1b;font-size:12.5px;">
        <strong>Previous request (${escapeHtml(latestRejected.requestNo)}) was rejected</strong>
        ${latestRejected.reviewedByName ? `by ${escapeHtml(latestRejected.reviewedByName)}` : ''}.
        ${latestRejected.reviewRemarks ? `<div style="margin-top:3px;">Remark: "${escapeHtml(latestRejected.reviewRemarks)}"</div>` : ''}
      </div>
    `
    : '';

  const promptRes = await Swal.fire({
    icon: 'warning',
    title: 'Admin Approval Required',
    html: `
      <div style="text-align:left;font-size:13.5px;line-height:1.55;color:#334155;">
        ${rejectedNotice}
        <p style="margin:0 0 10px;">Sales data downloads require <strong>Admin approval</strong> before exporting. Once Admin accepts, you can download this file <strong>once within 24 hours</strong>.</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;font-size:12.5px;margin-bottom:4px;">
          <div><strong>Dataset:</strong> ${escapeHtml(resourceLabel)}</div>
          <div><strong>Format:</strong> ${escapeHtml(format)} ${recordCount > 0 ? `• <strong>${recordCount}</strong> records` : ''}</div>
        </div>
      </div>
    `,
    input: 'textarea',
    inputLabel: 'Reason for download (optional)',
    inputPlaceholder: 'e.g., Monthly sales review with management...',
    inputAttributes: {
      maxlength: '500',
      rows: '3',
    },
    showCancelButton: true,
    confirmButtonText: 'Send Request to Admin',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#0284c7',
  });

  if (!promptRes.isConfirmed) {
    return { executed: false, status: 'CANCELLED' };
  }

  const created = await createDownloadRequest({
    module: moduleName,
    exportType,
    format,
    resourceLabel,
    recordCount,
    filtersSnapshot,
    reason: typeof promptRes.value === 'string' ? promptRes.value.trim() : undefined,
  });

  await Swal.fire({
    icon: 'success',
    title: created.alreadyExists ? 'Request Already Pending' : 'Request Sent to Admin',
    html: `
      <div style="text-align:left;font-size:13.5px;line-height:1.55;color:#334155;">
        <p style="margin:0 0 8px;">${escapeHtml(created.message || 'Your download request has been sent to Admin.')}</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px 12px;font-size:12.5px;color:#166534;">
          <div><strong>Request ID:</strong> ${escapeHtml(created.request?.requestNo || '')}</div>
          <div><strong>Dataset:</strong> ${escapeHtml(created.request?.resourceLabel || resourceLabel)}</div>
          <div style="margin-top:4px;">Once Admin accepts, click <strong>Export</strong> again to download your file.</div>
        </div>
      </div>
    `,
    confirmButtonColor: '#0284c7',
  });

  return {
    executed: false,
    status: 'REQUESTED',
    request: created.request,
  };
}

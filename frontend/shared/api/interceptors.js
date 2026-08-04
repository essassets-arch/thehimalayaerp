/**
 * Request and Response Interceptors for Himalaya ERP.
 */

import { AuthenticationError, PermissionError, NotFoundError, ValidationError, ServerError, ConflictError } from './errors';

// Helper to get active user details
const getSession = () => {
  try {
    const storedUser = sessionStorage.getItem('erpUser');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

/**
 * Request Interceptor: Automatically binds session and tracking headers.
 */
export const requestInterceptor = (options = {}) => {
  let token = sessionStorage.getItem('token') || sessionStorage.getItem('himalaya_token') || localStorage.getItem('token') || localStorage.getItem('himalaya_token');
  if (!token && typeof window !== 'undefined') {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        token = parsed?.state?.accessToken || null;
      }
    } catch (_) {}
  }
  const user = getSession();

  const companyId = user?.company_id || sessionStorage.getItem('companyId') || '1';
  const workspaceId = user?.workspace_id || sessionStorage.getItem('workspaceId');

  // Strip our internal client keys — these must NOT be forwarded to fetch()'s RequestInit.
  // 'priority' clashes with the browser's FetchPriority enum (only 'high'|'low'|'auto' are valid).
  // 'cacheKey' and 'raw' are ERP-client-only concepts.
  // 'isFormData' is used here to skip Content-Type so the browser sets the multipart boundary.
  const { priority: _p, cacheKey: _ck, raw: _r, isFormData: _fd, ...fetchOptions } = options;

  const headers = {
    // Skip Content-Type for FormData — browser must set it with the multipart boundary
    ...(_fd ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(companyId ? { 'X-Company-Id': String(companyId) } : {}),
    ...(workspaceId ? { 'X-Workspace-Id': String(workspaceId) } : {}),
    'X-Correlation-Id': `corr-${Math.random().toString(36).slice(2, 11)}`,
    'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
    'X-App-Version': '1.0.0',
    // Caller headers last — but strip Content-Type for FormData to avoid clobbering the boundary
    ...(_fd ? (() => { const h = { ...fetchOptions.headers }; delete h['Content-Type']; delete h['content-type']; return h; })() : fetchOptions.headers)
  };

  return {
    ...fetchOptions,
    headers
  };
};

/**
 * Response Interceptor: Normalizes envelopes and maps status codes to custom ERP Errors.
 */
export const responseInterceptor = async (res, options = {}) => {
  if (res.ok) {
    const envelope = await res.json();
    if (envelope.success === false) {
      // Backend returned custom error envelope
      throw mapBackendError(envelope);
    }
    if (options.raw) {
      return envelope;
    }
    return envelope.data !== undefined ? envelope.data : envelope;
  }

  // Handle HTTP status errors
  const status = res.status;
  let errMsg = `HTTP Error ${status}`;
  let errDetails = [];

  try {
    const envelope = await res.json();
    errMsg = envelope.message || envelope.error || errMsg;
    errDetails = envelope.errors || [];
  } catch {
    // ignore parsing errors
  }

  if (status === 401) {
    // Triggers refresh token flow or clean redirect
    sessionStorage.removeItem('himalaya_token');
    sessionStorage.removeItem('token');
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new AuthenticationError(errMsg);
  }

  if (status === 403) {
    throw new PermissionError(errMsg);
  }

  if (status === 404) {
    throw new NotFoundError(errMsg);
  }

  if (status === 409) {
    throw new ConflictError(errMsg);
  }

  if (status === 422) {
    throw new ValidationError(errMsg, errDetails);
  }

  throw new ServerError(errMsg);
};

const mapBackendError = (envelope) => {
  const code = envelope.errorCode;
  const msg = envelope.message || envelope.error || 'Operation failed.';
  const details = envelope.errors || [];

  if (String(msg).toLowerCase().includes('not found')) {
    return new NotFoundError(msg);
  }

  switch (code) {
    case 'FORBIDDEN':
    case 'UNAUTHORIZED_ACCESS':
      return new PermissionError(msg);
    case 'NOT_FOUND':
      return new NotFoundError(msg);
    case 'CONFLICT':
      return new ConflictError(msg);
    case 'VALIDATION_FAILED':
      return new ValidationError(msg, details);
    default:
      return new ServerError(msg);
  }
};

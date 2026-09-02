/**
 * Universal Asset & File URL Resolver for Himalaya ERP.
 * 
 * Guarantees:
 * - Strips accidental 'localhost:3000' or 'localhost:4000' stored in DB so VPS/Production never fails.
 * - Resolves relative paths, raw file UUIDs, and categorical upload paths to the centralized Backend Files API.
 * - Seamlessly passes through external CDN/Cloudinary/S3/Firebase URLs and Base64 data URIs.
 */

export function getBackendAssetUrl(path?: string | null): string {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';

  // 1. Data URLs and Blobs (e.g. webcam capture preview)
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // 2. Strip accidental domain prefixes (localhost, 127.0.0.1, thehimalaya.cloud) when pointing to internal assets
  let cleaned = trimmed.replace(
    /^https?:\/\/(localhost|127\.0\.0\.1|thehimalaya\.cloud|www\.thehimalaya\.cloud)(:\d+)?/i,
    ''
  );

  // 3. External HTTPS / HTTP URLs (e.g. Cloudinary, AWS S3, Google Storage, Firebase)
  // Only keep as external if not pointing to localhost / thehimalaya.cloud
  if (
    cleaned.startsWith('https://') ||
    (cleaned.startsWith('http://') &&
      !cleaned.includes('localhost') &&
      !cleaned.includes('thehimalaya.cloud'))
  ) {
    return cleaned;
  }

  // 4. Clean leading slashes and API prefix duplicates
  cleaned = cleaned.replace(/^\/?(api\/(backend|v1)\/)?/i, '');

  let resolved = '';

  // 5. If it points to uploads directory
  if (cleaned.startsWith('uploads/')) {
    const subPath = cleaned.replace(/^uploads\//i, '');
    resolved = `/api/backend/files/serve/${subPath}`;
  }
  // 6. If it already points to files/serve
  else if (cleaned.startsWith('files/serve/')) {
    resolved = `/api/backend/${cleaned}`;
  }
  // 7. If it's a relative path starting with a category or filename
  else if (cleaned.includes('/')) {
    resolved = `/api/backend/files/serve/${cleaned}`;
  }
  // 8. Raw filename or UUID (e.g. 'f9a2e38c.jpg')
  else {
    resolved = `/api/backend/files/serve/${cleaned}`;
  }

  if (typeof window !== 'undefined') {
    const token = window.sessionStorage.getItem('token') || window.localStorage.getItem('token');
    if (token) {
      const separator = resolved.includes('?') ? '&' : '?';
      return `${resolved}${separator}token=${encodeURIComponent(token)}`;
    }
  }

  return resolved;
}

export function getFileDownloadUrl(path?: string | null, downloadName?: string): string {
  const url = getBackendAssetUrl(path);
  if (!url) return '';
  return downloadName ? `${url}?download=${encodeURIComponent(downloadName)}` : url;
}

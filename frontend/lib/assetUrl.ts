/**
 * Universal Asset & File URL Resolver for Himalaya ERP.
 * 
 * Guarantees:
 * - Strips accidental 'localhost:3000', 'localhost:4000', or domain prefixes stored in DB.
 * - Resolves relative paths, raw file UUIDs, and categorical upload paths to the Backend Files API.
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

  // 2. External HTTPS / HTTP URLs (e.g. Cloudinary, AWS S3, Google Storage, Firebase)
  if (
    trimmed.startsWith('https://') ||
    (trimmed.startsWith('http://') &&
      !trimmed.includes('localhost') &&
      !trimmed.includes('127.0.0.1') &&
      !trimmed.includes('thehimalaya.cloud'))
  ) {
    return trimmed;
  }

  // 3. Strip accidental domain prefixes
  let cleaned = trimmed.replace(
    /^https?:\/\/(localhost|127\.0\.0\.1|thehimalaya\.cloud|www\.thehimalaya\.cloud)(:\d+)?/i,
    ''
  );

  // 4. Strip duplicate /api/backend or /api/v1 prefixes
  cleaned = cleaned.replace(/^\/?(api\/(backend|v1)\/)?/i, '');

  // 5. Normalize uploads/ or files/serve/
  if (cleaned.startsWith('uploads/')) {
    cleaned = cleaned.replace(/^uploads\//i, '');
  } else if (cleaned.startsWith('files/serve/')) {
    cleaned = cleaned.replace(/^files\/serve\//i, '');
  }

  // 6. Clean leading slash
  cleaned = cleaned.replace(/^\//, '');

  if (!cleaned) return '';

  // If path is a nested employee upload like "<uuid>/<folder>/<file>", ensure "employees/" prefix
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//i.test(cleaned)) {
    cleaned = `employees/${cleaned}`;
  }

  return `/api/backend/files/serve/${cleaned}`;
}

export function getFileDownloadUrl(path?: string | null, downloadName?: string): string {
  const url = getBackendAssetUrl(path);
  if (!url) return '';
  return downloadName ? `${url}?download=${encodeURIComponent(downloadName)}` : url;
}

export async function downloadAssetFile(url: string, filename?: string) {
  if (!url) return;
  try {
    const token = typeof window !== 'undefined' ? (window.sessionStorage.getItem('token') || window.localStorage.getItem('token')) : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || url.split('/').pop()?.split('?')[0] || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }
}

/**
 * Centralized file upload service for Himalaya ERP.
 */

const BASE_URL = '/api';

export const uploadApi = {
  /**
   * Upload a file using multipart/form-data.
   * @param {File} file - The file object to upload
   * @param {string} category - Category (e.g. 'pod', 'challan', 'invoice', 'avatar')
   * @returns {Promise<{file_id: string, url: string, mime: string, size: number}>}
   */
  upload: async (file, category = 'attachments') => {
    const token = localStorage.getItem('token') || localStorage.getItem('himalaya_token');
    const companyId = localStorage.getItem('companyId') || '1';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const headers = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(companyId ? { 'X-Company-Id': String(companyId) } : {})
    };

    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!res.ok) {
      let errMsg = `Upload failed with status ${res.status}`;
      try {
        const errData = await res.json();
        errMsg = errData.error || errData.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    return await res.json();
  }
};

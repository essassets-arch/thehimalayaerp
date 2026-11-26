import { backendFetch } from '@/lib/backendFetch';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = '/super-admin/database-backups';

export const databaseBackupService = {
  /**
   * Retrieves high-level overview metrics & KPIs for the dashboard.
   */
  async getOverview() {
    return backendFetch(`${BASE_URL}/overview`);
  },

  /**
   * Retrieves the current backup scheduler and SMTP configuration.
   */
  async getSettings() {
    return backendFetch(`${BASE_URL}/settings`);
  },

  /**
   * Updates backup scheduler and SMTP configuration.
   */
  async updateSettings(data) {
    return backendFetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * Retrieves all registered recipient email addresses.
   */
  async getRecipients() {
    return backendFetch(`${BASE_URL}/recipients`);
  },

  /**
   * Adds a new recipient email address.
   */
  async createRecipient(data) {
    return backendFetch(`${BASE_URL}/recipients`, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Updates an existing recipient (e.g. toggling active status).
   */
  async updateRecipient(id, data) {
    return backendFetch(`${BASE_URL}/recipients/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * Removes a recipient email address.
   */
  async deleteRecipient(id) {
    return backendFetch(`${BASE_URL}/recipients/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Dispatches an instant test email to verify SMTP delivery.
   */
  async sendTestEmail(email) {
    return backendFetch(`${BASE_URL}/test-email`, {
      method: 'POST',
      body: { email },
    });
  },

  /**
   * Triggers an immediate manual PostgreSQL backup and encrypted email delivery.
   */
  async triggerManualBackup() {
    return backendFetch(`${BASE_URL}/run`, {
      method: 'POST',
    });
  },

  /**
   * Retrieves paginated historical backup executions.
   */
  async getHistory(page = 1, limit = 20, status = '') {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    return backendFetch(`${BASE_URL}/history?${params.toString()}`);
  },

  /**
   * Re-verifies an archive on disk.
   */
  async reVerifyBackup(id) {
    return backendFetch(`${BASE_URL}/history/${id}/verify`, {
      method: 'POST',
    });
  },

  /**
   * Downloads an encrypted backup archive via authenticated stream.
   */
  async downloadBackup(id, filename) {
    let token = useAuthStore.getState().accessToken;
    if (!token && typeof window !== 'undefined') {
      try {
        token =
          window.localStorage.getItem('token') ||
          window.localStorage.getItem('himalaya_token') ||
          window.sessionStorage.getItem('token');
      } catch {}
    }

    const res = await fetch(`/api/backend${BASE_URL}/download/${id}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to download backup archive');
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || `himalaya_erp_backup_${id}.sql.enc`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};

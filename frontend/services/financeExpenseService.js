import { backendFetch } from '../lib/backendFetch';

function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      q.append(key, String(val));
    }
  });
  const str = q.toString();
  return str ? `?${str}` : '';
}

export const financeExpenseService = {
  /**
   * List paginated expenses matching filter criteria
   */
  async getExpenses(params = {}) {
    const qs = buildQuery(params);
    return backendFetch(`/api/backend/finance/expenses${qs}`);
  },

  /**
   * Authoritative summary metrics: Total Expenses, This Month, Total Entries, Top Category
   */
  async getSummary(params = {}) {
    const qs = buildQuery(params);
    return backendFetch(`/api/backend/finance/expenses/summary${qs}`);
  },

  /**
   * Category-wise breakdown with percentage calculations and drill-down metrics
   */
  async getCategoryBreakdown(params = {}) {
    const qs = buildQuery(params);
    return backendFetch(`/api/backend/finance/expenses/category-breakdown${qs}`);
  },

  /**
   * Get single expense details by ID
   */
  async getExpenseById(id) {
    return backendFetch(`/api/backend/finance/expenses/${id}`);
  },

  /**
   * Create a new finance expense record
   */
  async createExpense(data) {
    return backendFetch('/api/backend/finance/expenses', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Update an existing expense record
   */
  async updateExpense(id, data) {
    return backendFetch(`/api/backend/finance/expenses/${id}`, {
      method: 'PATCH',
      body: data,
    });
  },

  /**
   * Full dataset export respecting active filters
   */
  async exportExpenses(params = {}) {
    const qs = buildQuery(params);
    return backendFetch(`/api/backend/finance/expenses/export${qs}`);
  },

  /**
   * Upload receipt attachment (JPG, PNG, WEBP, PDF)
   */
  async uploadReceipt(file) {
    const formData = new FormData();
    formData.append('file', file);
    return backendFetch('/api/backend/finance/expenses/upload-receipt', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Master Category Tree
   */
  async getCategories(params = {}) {
    const qs = buildQuery(params);
    return backendFetch(`/api/backend/finance/expense-categories${qs}`);
  },

  /**
   * Add a new expense category
   */
  async createCategory(data) {
    return backendFetch('/api/backend/finance/expense-categories', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Edit or toggle active state of a category
   */
  async updateCategory(id, data) {
    return backendFetch(`/api/backend/finance/expense-categories/${id}`, {
      method: 'PATCH',
      body: data,
    });
  },

  /**
   * Add header to a category
   */
  async createHeader(categoryId, data) {
    return backendFetch(`/api/backend/finance/expense-categories/${categoryId}/headers`, {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Edit or toggle active state of a header
   */
  async updateHeader(categoryId, headerId, data) {
    return backendFetch(
      `/api/backend/finance/expense-categories/${categoryId}/headers/${headerId}`,
      {
        method: 'PATCH',
        body: data,
      },
    );
  },
};

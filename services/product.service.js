/**
 * Product Service — Frontend API layer.
 * All mutations go to the backend; state is synced via ERPContext.syncData().
 */
import { apiClient } from '../lib/apiClient';
import { ERPSuccess, ERPError } from '../engine/utils/errors';

export const productService = {
  /**
   * Add a new product to the catalog
   */
  addProduct: async (productData) => {
    try {
      const result = await apiClient.post('/purchase/products', productData);
      return ERPSuccess(result);
    } catch (err) {
      return ERPError(err.message, 'API_ERROR');
    }
  },

  /**
   * Update an existing product's details
   */
  updateProduct: async (productId, productData) => {
    try {
      const result = await apiClient.put(`/purchase/products/${productId}`, productData);
      return ERPSuccess(result);
    } catch (err) {
      return ERPError(err.message, 'API_ERROR');
    }
  },

  /**
   * Delete a single product
   */
  deleteProduct: async (productId) => {
    try {
      const result = await apiClient.delete(`/purchase/products/${productId}`);
      return ERPSuccess(result);
    } catch (err) {
      return ERPError(err.message, 'API_ERROR');
    }
  },

  /**
   * Delete multiple products in bulk
   */
  deleteProducts: async (productIds) => {
    try {
      const result = await apiClient.post('/purchase/products/bulk-delete', { ids: productIds });
      return ERPSuccess(result);
    } catch (err) {
      return ERPError(err.message, 'API_ERROR');
    }
  }
};

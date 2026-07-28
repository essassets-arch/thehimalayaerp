import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../lib/apiClient';

export const useSalesAnalytics = (filters, activeTab) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    overview: null,
    revenue: null,
    orders: null,
    customers: null,
    products: null,
    executives: null,
    finance: null,
    forecast: null,
    live: null,
    explorer: null,
    // Dedicated Product/Category keys
    productsSummary: null,
    productsTrend: null,
    productsTop: null,
    productsSlow: null,
    categoriesSummary: null,
    categoriesTrend: null,
    productDetails: null
  });

  const loadTabData = useCallback(async (tabName) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key]);
      });
      
      const endpoint = `/reports/analytics/${tabName}`;
      const response = await apiClient.get(`${endpoint}?${queryParams.toString()}`);
      const resData = response?.data || response;
      
      let stateKey = tabName;
      if (tabName === 'products/summary') stateKey = 'productsSummary';
      else if (tabName === 'products/trend') stateKey = 'productsTrend';
      else if (tabName === 'products/top-selling') stateKey = 'productsTop';
      else if (tabName === 'products/slow-moving') stateKey = 'productsSlow';
      else if (tabName === 'categories/summary') stateKey = 'categoriesSummary';
      else if (tabName === 'categories/trend') stateKey = 'categoriesTrend';
      else if (tabName === 'data-explorer') stateKey = 'explorer';

      setData(prev => ({
        ...prev,
        [stateKey]: resData
      }));
    } catch (err) {
      console.error(`Failed to load ${tabName} data:`, err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadProductDetails = useCallback(async (productId) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/reports/analytics/products/${productId}`);
      const resData = response?.data || response;
      setData(prev => ({
        ...prev,
        productDetails: resData
      }));
    } catch (err) {
      console.error(`Failed to load product ${productId} details:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load appropriate data when tab or filters change
  useEffect(() => {
    if (activeTab === 'overview') {
      loadTabData('overview');
    } else if (activeTab === 'revenue_orders') {
      Promise.all([
        loadTabData('revenue'),
        loadTabData('orders'),
        loadTabData('products/summary'),
        loadTabData('products/trend'),
        loadTabData('products/top-selling'),
        loadTabData('products/slow-moving'),
        loadTabData('categories/summary'),
        loadTabData('categories/trend')
      ]);
    } else if (activeTab === 'crm') {
      Promise.all([loadTabData('customers'), loadTabData('overview')]);
    } else if (activeTab === 'finance') {
      Promise.all([loadTabData('finance'), loadTabData('forecast')]);
    } else if (activeTab === 'explorer') {
      loadTabData('data-explorer');
    }
  }, [activeTab, filters, loadTabData]);

  return {
    data,
    loading,
    loadProductDetails,
    refreshCurrent: () => loadTabData(activeTab)
  };
};

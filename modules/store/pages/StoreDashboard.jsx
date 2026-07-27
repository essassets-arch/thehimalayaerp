import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useToast } from '../../../shared/context/ToastContext';
import { apiClient } from '../../../lib/apiClient';
import { ProcurementForm } from '../components/ProcurementForm';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

export const StoreDashboard = () => {
  const { user } = useAuth();
  const { error } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInventory: 0,
    lowStockItems: [],
    pendingRequests: 0,
    materials: []
  });
  const [requests, setRequests] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch stock levels
      const stockResponse = await apiClient.get('/reports/inventory/stock-levels');
      const stockData = stockResponse.data || [];

      // Calculate total volume and count low stock
      const totalInventory = stockData.reduce((sum, item) => sum + (parseFloat(item.on_hand_balance) || 0), 0);
      const lowStockItems = stockData.filter(item =>
        item.stock_status === 'Critical' || item.stock_status === 'Low'
      );

      // 2. Fetch material requests
      const requestsResponse = await apiClient.get('/store/material-requests');
      const requestsData = requestsResponse.data || [];

      // 3. Fetch raw materials for dropdown (from products catalog)
      const materialsResponse = await apiClient.get('/purchase/products');
      const materialsData = (materialsResponse.data || []).filter(
        m => m.type === 'Raw Material'
      );

      setStats({
        totalInventory,
        lowStockItems: lowStockItems.slice(0, 10),
        pendingRequests: requestsData.filter(r => r.status === 'Submitted' || r.status === 'Approved').length,
        materials: materialsData
      });
      setRequests(requestsData);

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="m-theme-container">
      {/* Header */}
      <div className="m-theme-header">
        <div>
          <h2 className="m-theme-title">Store Dashboard</h2>
          <p className="m-theme-subtitle">
            Overview of inventory, alerts, and pending requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="m-theme-kpi-grid">
        <div className="m-theme-kpi-card" style={{ '--card-border-color': '#0f766e' }}>
          <span className="m-theme-kpi-label">Total Storage Inventory</span>
          <span className="m-theme-kpi-value">{stats.totalInventory.toLocaleString(undefined, { maximumFractionDigits: 2 })} Units</span>
          <span className="m-theme-kpi-subtitle" style={{ color: '#5E6B82' }}>Cumulative raw materials weight</span>
        </div>

        <div className="m-theme-kpi-card" style={{ '--card-border-color': '#ef4444' }}>
          <span className="m-theme-kpi-label">Low Stock Alerts</span>
          <span className="m-theme-kpi-value" style={{ color: stats.lowStockItems.length > 0 ? '#ef4444' : 'inherit' }}>
            {stats.lowStockItems.length} Items
          </span>
          <span className="m-theme-kpi-subtitle" style={{ color: '#ef4444' }}>Reorder threshold breached</span>
        </div>

        <div className="m-theme-kpi-card" style={{ '--card-border-color': '#f59e0b' }}>
          <span className="m-theme-kpi-label">Material Requests Pending</span>
          <span className="m-theme-kpi-value">{stats.pendingRequests} Requests</span>
          <span className="m-theme-kpi-subtitle" style={{ color: '#5E6B82' }}>Awaiting store clearance release</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start', marginBottom: '24px' }}>
        {/* Column 1: Low stock threshold warnings */}
        <div className="m-theme-table-container" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#24345C' }}>Low stock threshold warnings</h2>
          </div>
          
          {stats.lowStockItems.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8893A7', fontWeight: '600' }}>
              All raw materials stock levels are above reorder thresholds.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', margin: '0 -24px' }}>
              <table className="m-theme-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th style={{ textAlign: 'right' }}>Current Stock</th>
                    <th style={{ textAlign: 'right' }}>Min Threshold</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStockItems.map((item, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: '600', color: '#0f766e' }}>{item.product_name}</td>
                      <td style={{ textAlign: 'right', fontWeight: '800', color: '#ef4444' }}>
                        {item.on_hand_balance} {item.unit_of_measure}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '500', color: '#5E6B82' }}>
                        {item.min_stock_level} {item.unit_of_measure}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`m-theme-badge m-theme-badge-${item.stock_status === 'Critical' ? 'red' : 'yellow'}`}>
                          {item.stock_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Column 2: Create Purchase Request (Indent) Form */}
        <div className="m-theme-table-container" style={{ padding: '24px', background: 'white' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#24345C' }}>Create Procurement Request (Indent)</h2>
          </div>
          <ProcurementForm
            materials={stats.materials}
            onSuccess={fetchDashboardData}
          />
        </div>
      </div>

      {/* Recent Requests Table */}
      {requests.length > 0 && (
        <div className="m-theme-table-container" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#24345C' }}>Recent Material Requests Ledger</h2>
          </div>
          <div style={{ overflowX: 'auto', margin: '0 -24px' }}>
            <table className="m-theme-table">
              <thead>
                <tr>
                  <th>Request #</th>
                  <th>Requester</th>
                  <th style={{ textAlign: 'right' }}>Item Count</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 5).map((req, index) => {
                  let badgeColor = 'gray';
                  if (req.status === 'Approved' || req.status === 'Issued') badgeColor = 'green';
                  else if (req.status === 'Submitted' || req.status === 'Partially Issued') badgeColor = 'yellow';
                  else if (req.status === 'Rejected') badgeColor = 'red';
                  
                  return (
                    <tr key={index}>
                      <td style={{ fontWeight: '800', fontFamily: 'monospace' }}>{req.request_number}</td>
                      <td style={{ fontWeight: '600', color: '#24345C' }}>
                        {req.requester_name ? `${req.requester_name} ${req.requester_last_name || ''}` : 'System'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '800' }}>{req.item_count} items</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`m-theme-badge m-theme-badge-${badgeColor}`}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ color: '#5E6B82', fontSize: '12px', fontWeight: '500' }}>
                        {new Date(req.created_at || req.request_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

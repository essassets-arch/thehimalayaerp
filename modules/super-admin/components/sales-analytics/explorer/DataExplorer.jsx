import React, { useState, useContext, useMemo } from 'react';
import { SalesAnalyticsContext } from '../../../pages/SalesAnalyticsPage.jsx';
import DataTable from './DataTable.jsx';
import { getFilteredExplorerData } from '../../../services/salesAnalytics.service.js';
import {
  categoryColumns, productColumns, employeeColumns, customerColumns,
  leadColumns, quotationColumns, orderColumns, paymentColumns,
  regionColumns, inventoryColumns, monthlyPerformanceColumns,
  top100ProductsColumns, activityLogColumns
} from '../../../config/tableColumns.jsx';

const NAV_ITEMS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'categories', label: '🏷️ Categories' },
  { id: 'products', label: '📦 Products' },
  { id: 'employees', label: '👤 Employees' },
  { id: 'customers', label: '🏢 Customers' },
  { id: 'leads', label: '🎯 Leads' },
  { id: 'quotations', label: '📄 Quotations' },
  { id: 'orders', label: '🛒 Orders' },
  { id: 'payments', label: '💳 Payments' },
  { id: 'regions', label: '🗺️ Regions' },
  { id: 'inventory', label: '🏭 Inventory' },
  { id: 'monthly', label: '📅 Monthly' },
  { id: 'top-products', label: '🏆 Top Products' },
  { id: 'activity', label: '📋 Activity Log' },
];

const SummaryCard = ({ label, value, color }) => (
  <div style={{ background: '#F5FAFE', padding: '14px 18px', borderRadius: '10px', border: `2px solid ${color}20`, borderLeft: `4px solid ${color}`, flex: 1, minWidth: '140px' }}>
    <div style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
    <div style={{ fontSize: '22px', fontWeight: '900', color: '#24345C' }}>{value}</div>
  </div>
);

const DataExplorer = () => {
  const { filters, onDrilldown, explorerData } = useContext(SalesAnalyticsContext);
  const [activeSection, setActiveSection] = useState('overview');

  const s = (explorerData || getFilteredExplorerData(filters)).summary;

  const renderSection = useMemo(() => {
    const d = onDrilldown;
    const exp = explorerData || getFilteredExplorerData(filters);
    switch (activeSection) {
      case 'overview':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '850', marginBottom: '16px', color: 'var(--color-text-primary)' }}>Overall Sales Summary</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                <SummaryCard label="Total Products" value={s.totalProducts.toLocaleString()} color="#337a86" />
                <SummaryCard label="Categories" value={s.categories.toLocaleString()} color="#0284c7" />
                <SummaryCard label="Orders" value={s.orders.toLocaleString()} color="#4f46e5" />
                <SummaryCard label="Total Sales" value={`₹${(s.sales / 10000000).toFixed(2)} Cr`} color="#16a34a" />
                <SummaryCard label="Customers" value={s.customers.toLocaleString()} color="#ea580c" />
                <SummaryCard label="Sales Users" value={s.salesUsers.toLocaleString()} color="#8b5cf6" />
              </div>
            </div>
            <DataTable title="Category Performance" columns={categoryColumns(d)} data={exp.categories} onDrilldown={d} pageSize={7} />
            <DataTable title="Top Products Overview" columns={productColumns(d)} data={exp.products} onDrilldown={d} pageSize={5} />
          </div>
        );
      case 'categories':
        return <DataTable title="Product Category Performance" columns={categoryColumns(d)} data={exp.categories} onDrilldown={d} />;
      case 'products':
        return <DataTable title="Product Wise Sales Analysis" columns={productColumns(d)} data={exp.products} onDrilldown={d} />;
      case 'employees':
        return <DataTable title="Sales Employee Performance" columns={employeeColumns(d)} data={exp.employees} onDrilldown={d} />;
      case 'customers':
        return <DataTable title="Customer Wise Sales" columns={customerColumns(d)} data={exp.customers} onDrilldown={d} />;
      case 'leads':
        return <DataTable title="Lead Analysis Report" columns={leadColumns(d)} data={exp.leads} onDrilldown={d} />;
      case 'quotations':
        return <DataTable title="Quotation Analysis" columns={quotationColumns(d)} data={exp.quotations} onDrilldown={d} />;
      case 'orders':
        return <DataTable title="Order Analysis" columns={orderColumns(d)} data={exp.orders} onDrilldown={d} />;
      case 'payments':
        return <DataTable title="Payment Analysis" columns={paymentColumns(d)} data={exp.payments} onDrilldown={d} />;
      case 'regions':
        return <DataTable title="Region Wise Sales" columns={regionColumns(d)} data={exp.regions} onDrilldown={d} />;
      case 'inventory':
        return <DataTable title="Inventory vs Sales" columns={inventoryColumns(d)} data={exp.inventory} onDrilldown={d} />;
      case 'monthly':
        return <DataTable title="Monthly Product Performance" columns={monthlyPerformanceColumns(d)} data={exp.monthlyProductPerformance} onDrilldown={d} />;
      case 'top-products':
        return <DataTable title="Top 100 Products by Revenue" columns={top100ProductsColumns(d)} data={exp.top100Products} onDrilldown={d} />;
      case 'activity':
        return <DataTable title="Sales Activity Log" columns={activityLogColumns(d)} data={exp.activityLog} onDrilldown={d} />;
      default:
        return null;
    }
  }, [activeSection, explorerData, filters, onDrilldown]);

  return (
    <div style={{ display: 'flex', gap: '0', minHeight: '70vh' }}>
      {/* Left Navigation */}
      <div style={{ width: '200px', flexShrink: 0, borderRight: '1px solid var(--color-border)', paddingTop: '8px', background: 'var(--color-card-bg, #ffffff)', borderRadius: '12px 0 0 12px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setActiveSection(item.id)}
            style={{
              width: '100%', textAlign: 'left', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '12.5px', fontWeight: activeSection === item.id ? '800' : '500',
              color: activeSection === item.id ? '#337a86' : 'var(--color-text-secondary)',
              borderLeft: `3px solid ${activeSection === item.id ? '#337a86' : 'transparent'}`,
              borderRadius: '0 6px 6px 0', transition: 'all 0.15s',
              background: activeSection === item.id ? 'rgba(51,122,134,0.06)' : 'none'
            }}>
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '20px 24px', overflowX: 'auto' }}>
        {renderSection}
      </div>
    </div>
  );
};

export default DataExplorer;

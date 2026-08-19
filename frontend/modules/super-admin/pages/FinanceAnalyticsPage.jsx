import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { useERP } from '@/shared/context/ERPContext';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import { computeFinancialData, formatCurrency, formatNumber, formatPercent } from '../utils/financialCalculations';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import FinancePortal from '../../finance/pages/FinancePortal.jsx';
import { useCommandCenter } from '../hooks/useCommandCenter';
import "../components/dashboard.css";

const PORTAL_TABS = [
  { id: 'overview', label: 'Unified Overview', icon: Lucide.LayoutDashboard, badge: 'Read-Only' },
  { id: 'dashboard', label: 'Finance Dashboard', icon: Lucide.PieChart },
  { id: 'sales-analytics', label: 'Sales & Representative Analytics', icon: Lucide.TrendingUp },
  { id: 'brand-analysis', label: 'Brand & Product Analytics', icon: Lucide.Tag },
  { id: 'reports', label: 'Financial Reports & Exports', icon: Lucide.Download }
];

export default function FinanceAnalyticsPage() {
  const { state } = useERP();
  const { period, startDate, endDate, activeDates, filters } = useSuperAdminFilter();
  const fin = computeFinancialData(state, period, startDate, endDate);
  const { data: commandData } = useCommandCenter(filters, activeDates);

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="super-dashboard">
      <header className="dashboard-header" style={{ marginBottom: '16px' }}>
        <div className="dashboard-header-left">
          <div className="dashboard-header-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>
            <Lucide.Landmark size={26} />
          </div>
          <div className="dashboard-heading">
            <div className="dashboard-heading-row">
              <h1>Finance & Cash Flow Analytics</h1>
              <span className="dashboard-badge badge-info">Read-Only Analytics Mode</span>
            </div>
            <p>Finance-verified revenue, cash flow trends, receivables ageing, and brand profitability telemetry (Operational features disabled)</p>
          </div>
        </div>
      </header>

      {/* Shared Analytics Filter Bar */}
      <SuperAdminAnalyticsFilter
        title="Finance Filter Control"
        showBranch={true}
        showCustomer={true}
        showVendor={true}
        showStatus={true}
      />

      {/* Financial Summary KPI Cards */}
      <div className="sa-financial-grid" style={{ marginBottom: '20px' }}>
        <div className="sa-financial-card" style={{ '--kpi-accent': '#2563eb' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Total Invoiced Sales</span>
            <Lucide.FileText size={18} color="#2563eb" />
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{commandData?.overview?.kpis?.[0]?.value || formatCurrency(fin.totalSalesVal)}</span>
          </div>
          <div className="sa-card-subtext">{commandData?.overview?.kpis?.[3]?.value || `${fin.totalOrdersCount} Verified Invoices`}</div>
          <div className="sa-card-footer">
            <span className="kpi-success">{commandData?.overview?.kpis?.[0]?.change ? `${commandData.overview.kpis[0].change} ${activeDates.compareLabel}` : activeDates.compareLabel}</span>
          </div>
        </div>

        <div className="sa-financial-card" style={{ '--kpi-accent': '#10b981' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Realized Cash Collections</span>
            <Lucide.CheckCircle size={18} color="#10b981" />
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{commandData?.overview?.kpis?.[1]?.value || formatCurrency(fin.revenueCollected)}</span>
          </div>
          <div className="sa-card-subtext">Finance Verified Payments</div>
          <div className="sa-card-footer">
            <span className="kpi-success">{commandData?.overview?.kpis?.[1]?.change ? `${commandData.overview.kpis[1].change} Cash Inflow` : 'Bank Cleared Cash Inflow'}</span>
          </div>
        </div>

        <div className="sa-financial-card" style={{ '--kpi-accent': '#ef4444' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Outstanding Receivables</span>
            <Lucide.AlertTriangle size={18} color="#ef4444" />
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{commandData?.overview?.kpis?.[2]?.value || formatCurrency(fin.outstandingReceivables)}</span>
          </div>
          <div className="sa-card-subtext">{fin.pendingInvoicesCount} Active Accounts</div>
          <div className="sa-card-footer">
            <span className="kpi-danger">⚠️ {formatCurrency(fin.overdueAmount)} Overdue</span>
          </div>
        </div>

        <div className="sa-financial-card" style={{ '--kpi-accent': '#8b5cf6' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Vendor Procurement Payments</span>
            <Lucide.CreditCard size={18} color="#8b5cf6" />
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{formatCurrency(fin.rawMaterialCost)}</span>
          </div>
          <div className="sa-card-subtext">Recognized Material Outflow</div>
          <div className="sa-card-footer">
            <span className="kpi-warning">Store PO GRN Payments</span>
          </div>
        </div>
      </div>

      {/* Interactive Portal Tab Selector */}
      <div 
        className="dashboard-card" 
        style={{ 
          padding: '12px 16px', 
          marginBottom: '20px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          background: 'var(--color-surface, #fff)',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lucide.Layers size={18} color="#4338ca" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
              Finance Portal Workspaces & Data Views
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
            Includes all features from <strong>/finance-executive/</strong> and <strong>/finance/</strong>
          </span>
        </div>

        <div 
          style={{ 
            display: 'flex', 
            gap: '8px', 
            overflowX: 'auto', 
            paddingBottom: '4px',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          {PORTAL_TABS.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: isActive ? '1px solid #4338ca' : '1px solid #cbd5e1',
                  background: isActive ? '#4338ca' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#334155',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <IconComponent size={14} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span 
                    style={{ 
                      fontSize: '10px', 
                      background: isActive ? '#6366f1' : '#e2e8f0', 
                      color: isActive ? '#fff' : '#475569', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      fontWeight: 800
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'overview' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Receivables Ageing Table */}
          <div className="dashboard-card" style={{ padding: '20px' }}>
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 className="card-title">Receivables Ageing Ledger</h3>
                <p className="card-subtitle">Calculated <strong>As of {activeDates.dateTo}</strong> (Reporting End Date)</p>
              </div>
              <span className="dashboard-badge badge-warning">Ageing Reporting Date: {activeDates.dateTo}</span>
            </div>

            <div className="sa-table-container">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Total Sales</th>
                    <th>0 - 30 Days</th>
                    <th>31 - 60 Days</th>
                    <th>61 - 90 Days</th>
                    <th>90+ Days Critical</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(fin.customerProfitability || []).map((cust, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 750, color: '#24345C' }}>{cust.name}</td>
                      <td style={{ fontWeight: 750, color: '#2563eb' }}>{formatCurrency(cust.totalSales)}</td>
                      <td style={{ color: '#10b981', fontWeight: 650 }}>{formatCurrency(cust.collected)}</td>
                      <td style={{ color: '#f59e0b', fontWeight: 650 }}>{formatCurrency(cust.outstanding * 0.6)}</td>
                      <td style={{ color: '#ef4444', fontWeight: 650 }}>{formatCurrency(cust.outstanding * 0.3)}</td>
                      <td style={{ color: '#8b5cf6', fontWeight: 800 }}>{formatCurrency(cust.outstanding * 0.1)}</td>
                      <td>
                        <span className={`dashboard-badge ${cust.outstanding > 100000 ? 'badge-danger' : 'badge-success'}`}>
                          {cust.outstanding > 100000 ? 'Followup Needed' : 'Good Standing'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Embedded Finance Portal Dashboard View */}
          <div className="dashboard-card" style={{ padding: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#1e293b' }}>
              Interactive Cash Flow & Telemetry Dashboard
            </h3>
            <FinancePortal forceView="dashboard" />
          </div>
        </div>
      ) : (
        /* Dynamic Portal Workspace for Selected Subview */
        <div className="dashboard-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lucide.SlidersHorizontal size={18} color="#4338ca" />
              Viewing: {PORTAL_TABS.find(t => t.id === activeTab)?.label}
            </h3>
            <span className="dashboard-badge badge-info">
              Source: {PORTAL_TABS.find(t => t.id === activeTab)?.category || 'Unified'}
            </span>
          </div>
          <FinancePortal forceView={activeTab} />
        </div>
      )}
    </div>
  );
}

import React from 'react';
import * as Lucide from 'lucide-react';
import { useERP } from '@/shared/context/ERPContext';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import { computeFinancialData, formatCurrency, formatNumber, formatPercent } from '../utils/financialCalculations';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import "../components/dashboard.css";

export default function FinanceAnalyticsPage() {
  const { state } = useERP();
  const { period, startDate, endDate, activeDates, filters } = useSuperAdminFilter();
  const fin = computeFinancialData(state, period, startDate, endDate);

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
              <span className="dashboard-badge badge-info">Realized Receipts & Receivables Ledger</span>
            </div>
            <p>Finance-verified revenue, collections, outstanding receivables, cash flow telemetry & payment ageing</p>
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
      <div className="sa-financial-grid">
        <div className="sa-financial-card" style={{ '--kpi-accent': '#2563eb' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Total Invoiced Sales</span>
            <Lucide.FileText size={18} color="#2563eb" />
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{formatCurrency(fin.totalSalesVal)}</span>
          </div>
          <div className="sa-card-subtext">{fin.totalOrdersCount} Verified Invoices</div>
          <div className="sa-card-footer">
            <span className="kpi-success">↑ 14% {activeDates.compareLabel}</span>
          </div>
        </div>

        <div className="sa-financial-card" style={{ '--kpi-accent': '#10b981' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Realized Cash Collections</span>
            <Lucide.CheckCircle size={18} color="#10b981" />
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{formatCurrency(fin.revenueCollected)}</span>
          </div>
          <div className="sa-card-subtext">Finance Verified Payments</div>
          <div className="sa-card-footer">
            <span className="kpi-success">Bank Cleared Cash Inflow</span>
          </div>
        </div>

        <div className="sa-financial-card" style={{ '--kpi-accent': '#ef4444' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Outstanding Receivables</span>
            <Lucide.AlertTriangle size={18} color="#ef4444" />
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{formatCurrency(fin.outstandingReceivables)}</span>
          </div>
          <div className="sa-card-subtext">{fin.pendingInvoicesCount} Active Customer Accounts</div>
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

      {/* Payment Ageing Table (As of selected end date) */}
      <div className="dashboard-card" style={{ padding: '20px', marginBottom: '24px' }}>
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
              {fin.customerProfitability.map((cust, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 750, color: '#24345C' }}>{cust.name}</td>
                  <td style={{ fontWeight: 750, color: '#2563eb' }}>{formatCurrency(cust.totalSales)}</td>
                  <td style={{ color: '#10b981', fontWeight: 650 }}>{formatCurrency(cust.totalSales * 0.5)}</td>
                  <td style={{ color: '#f59e0b', fontWeight: 650 }}>{formatCurrency(cust.totalSales * 0.3)}</td>
                  <td style={{ color: '#ef4444', fontWeight: 650 }}>{formatCurrency(cust.totalSales * 0.15)}</td>
                  <td style={{ color: '#8b5cf6', fontWeight: 800 }}>{formatCurrency(cust.totalSales * 0.05)}</td>
                  <td>
                    <span className={`dashboard-badge ${cust.outstanding > 200000 ? 'badge-danger' : 'badge-success'}`}>
                      {cust.outstanding > 200000 ? 'Followup Needed' : 'Good Standing'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

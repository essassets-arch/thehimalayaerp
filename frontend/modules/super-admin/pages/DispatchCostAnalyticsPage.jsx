import React from 'react';
import * as Lucide from 'lucide-react';
import { useERP } from '@/shared/context/ERPContext';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import { computeFinancialData, formatCurrency, formatNumber, formatPercent } from '../utils/financialCalculations';
import "../components/dashboard.css";

export default function DispatchCostAnalyticsPage() {
  const { state } = useERP();
  const { period, startDate, endDate, activeDates, filters } = useSuperAdminFilter();
  const fin = computeFinancialData(state, period, startDate, endDate);
  const disp = fin.dispatchVarianceAnalytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
      {/* Page Header */}
      <div style={{
        background: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--border-color, #dfe6ee)',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 8px rgb(15 23 42 / 5%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#0f2742', color: '#3BAEEB', display: 'grid', placeItems: 'center' }}>
            <Lucide.Truck size={26} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#24345C' }}>Dispatch & Transportation Analytics</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#5E6B82' }}>
              Logistics expenditure, expected vs actual transportation variance, route & vehicle costs
            </p>
          </div>
        </div>
      </div>

      {/* Shared Super Admin Analytics Filter Bar */}
      <SuperAdminAnalyticsFilter
        title="Dispatch & Logistics Filter Control"
        showBranch={true}
        showCustomer={true}
        showProduct={true}
        showStatus={true}
      />

      {/* Logistics KPI Cards */}
      <div className="sa-cost-grid">
        <div className="sa-cost-card">
          <div className="sa-cost-card-header">
            <span className="sa-cost-title">This Month Transport Cost</span>
            <Lucide.Truck size={18} color="#f59e0b" />
          </div>
          <div className="sa-cost-amount">{formatCurrency(disp.thisMonthTransportCost)}</div>
          <div className="sa-cost-rows">
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Last Month</span>
              <strong>{formatCurrency(disp.lastMonthTransportCost)}</strong>
            </div>
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>MoM Change</span>
              <strong style={{ color: '#ef4444' }}>+{disp.costChangePercent}%</strong>
            </div>
          </div>
        </div>

        <div className="sa-cost-card">
          <div className="sa-cost-card-header">
            <span className="sa-cost-title">Dispatch Volume & Unit Cost</span>
            <Lucide.Package size={18} color="#2563eb" />
          </div>
          <div className="sa-cost-amount">{disp.totalDispatches} Dispatches</div>
          <div className="sa-cost-rows">
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Avg / Dispatch</span>
              <strong>₹{formatNumber(disp.avgTransportCost)}</strong>
            </div>
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Cost / Unit</span>
              <strong>₹{formatNumber(disp.costPerUnit)}</strong>
            </div>
          </div>
        </div>

        <div className="sa-cost-card" style={{ gridColumn: 'span 2' }}>
          <div className="sa-cost-card-header">
            <span className="sa-cost-title">Quotation Estimate vs Actual Transport Cost (Variance)</span>
            <span className="dashboard-badge badge-danger">₹{formatNumber(disp.varianceAmount)} Over Budget</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '8px' }}>
            <div style={{ background: '#F5FAFE', padding: '12px', borderRadius: '10px', border: '1px solid #DCE5F0' }}>
              <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: 700, display: 'block' }}>EXPECTED (QUOTATION)</span>
              <strong style={{ fontSize: '18px', color: '#2563eb' }}>{formatCurrency(disp.expectedTransportCost)}</strong>
            </div>
            <div style={{ background: '#F5FAFE', padding: '12px', borderRadius: '10px', border: '1px solid #DCE5F0' }}>
              <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: 700, display: 'block' }}>ACTUAL DISPATCH COST</span>
              <strong style={{ fontSize: '18px', color: '#ef4444' }}>{formatCurrency(disp.actualTransportCost)}</strong>
            </div>
            <div style={{ background: '#fff1f2', padding: '12px', borderRadius: '10px', border: '1px solid #fecdd3' }}>
              <span style={{ fontSize: '11px', color: '#be123c', fontWeight: 700, display: 'block' }}>VARIANCE</span>
              <strong style={{ fontSize: '18px', color: '#e11d48' }}>+₹{formatNumber(disp.varianceAmount)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Route & Transporter Cost Table */}
      <div style={{ background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #dfe6ee)', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 7px rgb(15 23 42 / 5%)' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '17px', fontWeight: 750, color: '#24345C' }}>Route-Wise Transportation Variance</h3>
        <div className="sa-table-container">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Route Destination</th>
                <th>Dispatches</th>
                <th>Expected Cost</th>
                <th>Actual Cost</th>
                <th>Variance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {disp.routeCostList.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, color: '#24345C' }}>{r.route}</td>
                  <td style={{ fontWeight: 650 }}>{r.dispatches}</td>
                  <td style={{ color: '#475569' }}>₹{formatNumber(r.expectedCost)}</td>
                  <td style={{ fontWeight: 750, color: '#24345C' }}>₹{formatNumber(r.actualCost)}</td>
                  <td style={{ fontWeight: 800, color: '#ef4444' }}>+₹{formatNumber(r.variance)}</td>
                  <td>
                    <span className="dashboard-badge badge-warning">Over Estimate</span>
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

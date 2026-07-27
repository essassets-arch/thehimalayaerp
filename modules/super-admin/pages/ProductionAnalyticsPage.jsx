import React from 'react';
import * as Lucide from 'lucide-react';
import { useERP } from '@/shared/context/ERPContext';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import { computeFinancialData, formatCurrency, formatNumber, formatPercent } from '../utils/financialCalculations';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import "../components/dashboard.css";

export default function ProductionAnalyticsPage() {
  const { state } = useERP();
  const { period, startDate, endDate, activeDates, filters } = useSuperAdminFilter();
  const fin = computeFinancialData(state, period, startDate, endDate);

  const shiftData = [
    { shift: 'Morning Shift (08:00 - 16:00)', produced: '2,850 Units', target: '3,000 Units', efficiency: '95.0%', cost: '₹3.40 L', rework: '12 Units' },
    { shift: 'Evening Shift (16:00 - 00:00)', produced: '2,420 Units', target: '2,600 Units', efficiency: '93.1%', cost: '₹2.90 L', rework: '18 Units' },
    { shift: 'Night Shift (00:00 - 08:00)', produced: '1,980 Units', target: '2,200 Units', efficiency: '90.0%', cost: '₹2.10 L', rework: '24 Units' }
  ];

  return (
    <div className="super-dashboard">
      <header className="dashboard-header" style={{ marginBottom: '16px' }}>
        <div className="dashboard-header-left">
          <div className="dashboard-header-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <Lucide.Cpu size={26} />
          </div>
          <div className="dashboard-heading">
            <div className="dashboard-heading-row">
              <h1>Production Floor & Plant Quota Telemetry</h1>
              <span className="dashboard-badge badge-success">Plant Operational Yield 92%</span>
            </div>
            <p>Plant quotas, shift-wise output, production unit costs, rework, scrap & delayed work orders</p>
          </div>
        </div>
      </header>

      {/* Shared Analytics Filter Bar */}
      <SuperAdminAnalyticsFilter
        title="Production Filter Control"
        showBranch={true}
        showShift={true}
        showProduct={true}
        showCategory={true}
        showStatus={true}
      />

      {/* Production KPIs */}
      <div className="sa-financial-grid">
        <div className="sa-financial-card" style={{ '--kpi-accent': '#10b981' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Actual Production Output</span>
            <Lucide.Factory size={18} color="#10b981" />
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">7,250</span>
            <span style={{ fontSize: '13px', color: '#5E6B82' }}>Units</span>
          </div>
          <div className="sa-card-subtext">Target: 7,800 Units (92.9% Quota)</div>
          <div className="sa-card-footer">
            <span className="kpi-success">↑ +4.2% {activeDates.compareLabel}</span>
          </div>
        </div>

        <div className="sa-financial-card" style={{ '--kpi-accent': '#2563eb' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Tracked Production Cost</span>
            <Lucide.IndianRupee size={18} color="#2563eb" />
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{formatCurrency(fin.productionCost)}</span>
          </div>
          <div className="sa-card-subtext">Material, Direct Labour & Power</div>
          <div className="sa-card-footer">
            <span className="kpi-warning">Cost per Unit: ₹1,158 / Unit</span>
          </div>
        </div>

        <div className="sa-financial-card" style={{ '--kpi-accent': '#ef4444' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Rework & Reproduction Cost</span>
            <Lucide.Wrench size={18} color="#ef4444" />
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{formatCurrency(fin.reworkCost)}</span>
          </div>
          <div className="sa-card-subtext">54 Reworked Batches</div>
          <div className="sa-card-footer">
            <span className="kpi-danger">QC Failed Reproductions</span>
          </div>
        </div>

        <div className="sa-financial-card" style={{ '--kpi-accent': '#ea580c' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Scrap & Wastage Loss</span>
            <Lucide.Trash2 size={18} color="#ea580c" />
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{formatCurrency(fin.scrapCost)}</span>
          </div>
          <div className="sa-card-subtext">350 Kg Scrap (2.4% Wastage Rate)</div>
          <div className="sa-card-footer">
            <span className="kpi-warning">Within 3% Standard Threshold</span>
          </div>
        </div>
      </div>

      {/* Shift-Wise Production Breakdown Table */}
      <div className="dashboard-card" style={{ padding: '20px' }}>
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div>
            <h3 className="card-title">Shift-Wise Production & Cost Performance</h3>
            <p className="card-subtitle">Operational shift output breakdown for period: <strong>{activeDates.label}</strong></p>
          </div>
        </div>

        <div className="sa-table-container">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Shift Name</th>
                <th>Target Quota</th>
                <th>Actual Produced</th>
                <th>Efficiency %</th>
                <th>Tracked Cost</th>
                <th>Rework Units</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shiftData.map((s, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 750, color: '#24345C' }}>{s.shift}</td>
                  <td style={{ fontWeight: 650, color: '#5E6B82' }}>{s.target}</td>
                  <td style={{ fontWeight: 750, color: '#10b981' }}>{s.produced}</td>
                  <td>
                    <span className="dashboard-badge badge-success">{s.efficiency}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>{s.cost}</td>
                  <td style={{ color: '#ef4444', fontWeight: 650 }}>{s.rework}</td>
                  <td>
                    <span className="dashboard-badge badge-info">Operational</span>
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

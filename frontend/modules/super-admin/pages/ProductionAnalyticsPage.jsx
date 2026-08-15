import React, { useCallback, useEffect, useState } from 'react';
import * as Lucide from 'lucide-react';
import { backendFetch } from '@/lib/backendFetch';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import { formatCurrency, formatNumber } from '../utils/financialCalculations';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import '../components/dashboard.css';

export default function ProductionAnalyticsPage() {
  const { activeDates, filters } = useSuperAdminFilter();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams({ from: activeDates.dateFrom, to: activeDates.dateTo });
      const map = { branch: 'branchId', product: 'productId', category: 'categoryId', status: 'status', shift: 'shiftId' };
      Object.entries(map).forEach(([key, value]) => filters[key] && filters[key] !== 'All' && params.set(value, filters[key]));
      setData(await backendFetch(`/api/backend/super-admin/analytics/production?${params}`, { cacheTtlMs: 0 }));
    } catch (e) { setError(e); }
  }, [activeDates.dateFrom, activeDates.dateTo, filters]);
  useEffect(() => { load(); }, [load]);
  if (error) return <div className="super-dashboard"><h2>Unable to load production analytics.</h2><button onClick={load}>Retry</button></div>;
  if (!data) return <div className="super-dashboard">Loading production analytics…</div>;
  const output = data.productionOutput;
  return <div className="super-dashboard">
    <header className="dashboard-header" style={{ marginBottom: 16 }}><div className="dashboard-header-left"><div className="dashboard-header-icon" style={{ background: '#dcfce7', color: '#15803d' }}><Lucide.Cpu size={26}/></div><div className="dashboard-heading"><div className="dashboard-heading-row"><h1>Production Floor & Plant Quota Telemetry</h1><span className="dashboard-badge badge-success">Plant Operational Yield {data.plantYield.percentage ?? 0}%</span></div><p>Plant quotas, shift-wise output, production unit costs, rework, scrap & delayed work orders</p></div></div></header>
    <SuperAdminAnalyticsFilter title="Production Filter Control" showBranch showShift showProduct showCategory showStatus filterOptions={data.filters}/>
    <div className="sa-financial-grid">
      <Card title="Actual Production Output" icon={<Lucide.Factory size={18}/>} value={formatNumber(output.actual)} sub={`Target: ${formatNumber(output.target)} (${output.quotaAchievement ?? 0}% Quota)`} footer={output.changePercent == null ? 'No previous production' : `${output.changePercent >= 0 ? '↑' : '↓'} ${Math.abs(output.changePercent)}% vs Previous Period`}/>
      <Card title="Tracked Production Cost" icon={<Lucide.IndianRupee size={18}/>} value={formatCurrency(data.productionCost.total)} sub="Material, Direct Labour & Power" footer={data.productionCost.costPerUnit == null ? 'Cost per Unit: Not available' : `Cost per Unit: ${formatCurrency(data.productionCost.costPerUnit)}`}/>
      <Card title="Rework & Reproduction Cost" icon={<Lucide.Wrench size={18}/>} value={formatCurrency(data.rework.cost)} sub={`${data.rework.batchCount} Reworked Batches`} footer={`${formatNumber(data.rework.quantity)} Rework Qty`}/>
      <Card title="Scrap & Wastage Loss" icon={<Lucide.Trash2 size={18}/>} value={formatCurrency(data.scrap.cost)} sub={`${formatNumber(data.scrap.quantity)} Scrap Qty`} footer={data.scrap.wastageRate == null ? 'Wastage rate unavailable' : `${data.scrap.wastageRate}% Wastage Rate`}/>
    </div>
    <div className="dashboard-card" style={{ padding: 20 }}><div className="card-header"><div><h3 className="card-title">Shift-Wise Production & Cost Performance</h3><p className="card-subtitle">{activeDates.label}</p></div></div><div className="sa-table-container"><table className="sa-table"><thead><tr><th>Shift Name</th><th>Target Quota</th><th>Actual Produced</th><th>Efficiency %</th><th>Tracked Cost</th><th>Rework Units</th></tr></thead><tbody>{data.shiftPerformance.length ? data.shiftPerformance.map((shift, index) => <tr key={`${shift.shiftName}-${index}`}><td>{shift.shiftName}</td><td>{formatNumber(shift.targetQuantity)}</td><td>{formatNumber(shift.actualProduced)}</td><td>{shift.efficiencyPercent ?? '—'}</td><td>{formatCurrency(shift.trackedCost)}</td><td>{formatNumber(shift.reworkQuantity)}</td></tr>) : <tr><td colSpan="6">No production activity found for the selected period and filters.</td></tr>}</tbody></table></div></div>
  </div>;
}
function Card({ title, icon, value, sub, footer }) { return <div className="sa-financial-card"><div className="sa-card-top"><span className="sa-card-label">{title}</span>{icon}</div><div className="sa-card-val-row"><span className="sa-card-val">{value}</span></div><div className="sa-card-subtext">{sub}</div><div className="sa-card-footer">{footer}</div></div>; }

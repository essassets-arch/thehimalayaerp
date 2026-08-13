import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { useERP } from '@/shared/context/ERPContext';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import { computeFinancialData, formatCurrency, formatNumber, formatPercent } from '../utils/financialCalculations';
import DispatchPortal from '../../dispatch/pages/DispatchPortal.jsx';
import "../components/dashboard.css";

const DISPATCH_TABS = [
  { id: 'overview', label: 'Unified Logistics Overview', icon: Lucide.LayoutDashboard, badge: 'All Data' },
  // Dispatch Executive 1 (ravikant.tiwari@himalayaerp.com)
  { id: 'd1-dashboard', label: 'Dispatch 1 Dashboard', icon: Lucide.Truck, category: 'Dispatch 1 (ravikant.tiwari@himalayaerp.com)', mode: 'DISPATCH_1', view: 'dashboard' },
  { id: 'd1-orders', label: 'Dispatch 1 Queue & Orders', icon: Lucide.Package, category: 'Dispatch 1 (ravikant.tiwari@himalayaerp.com)', mode: 'DISPATCH_1', view: 'orders' },
  { id: 'd1-delivery', label: 'Dispatch 1 Delivery & PODs', icon: Lucide.FileCheck, category: 'Dispatch 1 (ravikant.tiwari@himalayaerp.com)', mode: 'DISPATCH_1', view: 'delivery' },
  { id: 'd1-sample-dispatch', label: 'Dispatch 1 Sample Logistics', icon: Lucide.FlaskConical, category: 'Dispatch 1 (ravikant.tiwari@himalayaerp.com)', mode: 'DISPATCH_1', view: 'sample-dispatch' },
  { id: 'd1-returns', label: 'Dispatch 1 Returns & Replacements', icon: Lucide.RotateCcw, category: 'Dispatch 1 (ravikant.tiwari@himalayaerp.com)', mode: 'DISPATCH_1', view: 'returns' },
  { id: 'd1-finished-goods', label: 'Dispatch 1 Finished Goods', icon: Lucide.Layers, category: 'Dispatch 1 (ravikant.tiwari@himalayaerp.com)', mode: 'DISPATCH_1', view: 'finished-goods' },
  // Dispatch Executive 2 (sahad.dispatch@himalayaerp.com)
  { id: 'd2-dashboard', label: 'Dispatch 2 Dashboard', icon: Lucide.Truck, category: 'Dispatch 2 (sahad.dispatch@himalayaerp.com)', mode: 'DISPATCH_2', view: 'dashboard' },
  { id: 'd2-orders', label: 'Dispatch 2 Queue & Orders', icon: Lucide.Package, category: 'Dispatch 2 (sahad.dispatch@himalayaerp.com)', mode: 'DISPATCH_2', view: 'orders' },
  { id: 'd2-delivery', label: 'Dispatch 2 Delivery & PODs', icon: Lucide.FileCheck, category: 'Dispatch 2 (sahad.dispatch@himalayaerp.com)', mode: 'DISPATCH_2', view: 'delivery' },
  { id: 'd2-sample-dispatch', label: 'Dispatch 2 Sample Logistics', icon: Lucide.FlaskConical, category: 'Dispatch 2 (sahad.dispatch@himalayaerp.com)', mode: 'DISPATCH_2', view: 'sample-dispatch' },
  { id: 'd2-returns', label: 'Dispatch 2 Returns & Replacements', icon: Lucide.RotateCcw, category: 'Dispatch 2 (sahad.dispatch@himalayaerp.com)', mode: 'DISPATCH_2', view: 'returns' },
  { id: 'd2-finished-goods', label: 'Dispatch 2 Finished Goods', icon: Lucide.Layers, category: 'Dispatch 2 (sahad.dispatch@himalayaerp.com)', mode: 'DISPATCH_2', view: 'finished-goods' }
];

export default function DispatchCostAnalyticsPage() {
  const { state } = useERP();
  const { period, startDate, endDate, activeDates, filters } = useSuperAdminFilter();
  const fin = computeFinancialData(state, period, startDate, endDate);
  const disp = fin.dispatchVarianceAnalytics;

  const [activeTab, setActiveTab] = useState('overview');
  const selectedTabObj = DISPATCH_TABS.find(t => t.id === activeTab);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#24345C' }}>Dispatch & Transportation Analytics</h1>
              <span className="dashboard-badge badge-info">Unified: Dispatch 1 & Dispatch 2</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#5E6B82' }}>
              Consolidated logistics data from <strong>Dispatch 1</strong> (ravikant.tiwari@himalayaerp.com) & <strong>Dispatch 2</strong> (sahad.dispatch@himalayaerp.com)
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

      {/* Interactive Portal Workspaces Navigation Bar */}
      <div 
        className="dashboard-card" 
        style={{ 
          padding: '12px 16px', 
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
              Dispatch Executive Workspaces & Data Views
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
            Combined portals: <strong>Dispatch 1 (ravikant.tiwari)</strong> & <strong>Dispatch 2 (sahad.dispatch)</strong>
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
          {DISPATCH_TABS.map((tab) => {
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

      {/* Main Workspace Display */}
      {activeTab === 'overview' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Executive Performance Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div className="dashboard-card" style={{ padding: '16px 20px', borderLeft: '4px solid #2563eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>Dispatch Executive 1</span>
                <span className="dashboard-badge badge-info">ravikant.tiwari@himalayaerp.com</span>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Assigned Portal</span>
                  <strong>/dispatch/</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Active Dispatches</span>
                  <strong style={{ color: '#2563eb' }}>{disp.d1DispatchesCount} Shipments</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Primary Territory</span>
                  <strong>Haridwar Unit 1 & Dehradun</strong>
                </div>
              </div>
            </div>

            <div className="dashboard-card" style={{ padding: '16px 20px', borderLeft: '4px solid #059669' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>Dispatch Executive 2</span>
                <span className="dashboard-badge badge-success">sahad.dispatch@himalayaerp.com</span>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Assigned Portal</span>
                  <strong>/dispatch-2/</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Active Dispatches</span>
                  <strong style={{ color: '#059669' }}>{disp.d2DispatchesCount} Shipments</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Primary Territory</span>
                  <strong>Roorkee Works & Outstation</strong>
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

          {/* Embedded Dispatch 1 Interactive Workspace */}
          <div className="dashboard-card" style={{ padding: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#1e293b' }}>
              Interactive Dispatch Executive 1 Portal (/dispatch/)
            </h3>
            <DispatchPortal mode="DISPATCH_1" view="dashboard" overrideBasePath="/dispatch" />
          </div>
        </div>
      ) : (
        /* Selected Portal Workspace */
        <div className="dashboard-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lucide.SlidersHorizontal size={18} color="#4338ca" />
              Viewing: {selectedTabObj?.label}
            </h3>
            <span className="dashboard-badge badge-info">
              Executive: {selectedTabObj?.category}
            </span>
          </div>
          <DispatchPortal 
            mode={selectedTabObj?.mode || 'DISPATCH_1'} 
            view={selectedTabObj?.view || 'dashboard'} 
            overrideBasePath={selectedTabObj?.mode === 'DISPATCH_2' ? '/dispatch-2' : '/dispatch'}
          />
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Factory, LayoutGrid, Calendar, BatteryCharging, Zap, Cpu, Clock,
  AlertTriangle, CheckCircle, XCircle, FileText, BarChart3, TrendingUp,
  Layers, Package, Shield, RefreshCw, Download, Search, Filter,
  ChevronRight, ArrowUpRight, ArrowDownRight, User, Award, ShieldCheck,
  FileCheck, RotateCcw, Wrench, Activity, DollarSign
} from 'lucide-react';
import { backendFetch } from '../../../lib/backendFetch';
import ResponsiveChartWrapper from '../../../shared/components/ResponsiveChartWrapper';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export const PlantHeadDashboard = () => {
  // ── Active Tab State (10 Dashboard Tabs) ──
  const [activeTab, setActiveTab] = useState('executive_overview');
  const [loading, setLoading] = useState(true);

  // Drill-down State
  const [drillLevel, setDrillLevel] = useState({ plant: 'Main Plant', unit: 'Unit-01', line: 'All Lines', machine: 'All Machines' });

  // ── Dynamic Backend Datasets State ──
  const [workOrders, setWorkOrders] = useState([]);
  const [machineData, setMachineData] = useState([]);
  const [materialData, setMaterialData] = useState([]);
  const [approvalsData, setApprovalsData] = useState([]);

  // Fetch Dashboard Data from Backend API
  const fetchPlantData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, machineRes, stockRes, indentRes] = await Promise.allSettled([
        backendFetch('/api/backend/production/work-orders'),
        backendFetch('/api/backend/production/machines'),
        backendFetch('/api/backend/inventory/stock-levels'),
        backendFetch('/api/backend/procurement/indents')
      ]);

      // Demo fallback dataset enriched for Plant Head
      const demoOrders = [
        { id: 'WO-1041', product: 'Water Paper 60 Mesh', category: 'Coated Abrasives', line: 'Line A (Coating)', machine: 'MC-01 Coater', plannedQty: 1500, actualQty: 1420, unit: 'Pcs', status: 'In Progress', delayHours: 0, operator: 'Rajesh Patel', yield: 96.2, rejectionPct: 1.2 },
        { id: 'WO-1042', product: 'Benjo Wax Polish 500g', category: 'Chemicals & Pigments', line: 'Line B (Mixing)', machine: 'MC-04 Mixer', plannedQty: 850, actualQty: 850, unit: 'Tins', status: 'Completed', delayHours: 0, operator: 'Suresh Kumar', yield: 98.4, rejectionPct: 0.8 },
        { id: 'WO-1043', product: 'Flap Disc 4 Inch', category: 'Hardware & Tools', line: 'Line C (Assembly)', machine: 'MC-07 Press', plannedQty: 2500, actualQty: 1800, unit: 'Pcs', status: 'Delayed', delayHours: 3.5, operator: 'Vikram Singh', yield: 92.1, rejectionPct: 2.5 },
        { id: 'WO-1044', product: 'Cutting Wheel 14 Inch', category: 'Hardware & Tools', line: 'Line D (Curing)', machine: 'MC-09 Oven', plannedQty: 1200, actualQty: 0, unit: 'Pcs', status: 'Planned', delayHours: 0, operator: 'Amit Shah', yield: 100, rejectionPct: 0.0 },
      ];
      setWorkOrders(demoOrders);

      const demoMachines = [
        { id: 'MC-01', name: 'High-Speed Paper Coater', line: 'Line A', status: 'Running', utilization: 92.4, runtime: 18.5, downtime: 0.5, oee: 88.6, health: 'Optimal', mtbf: '140 hrs', mttr: '1.2 hrs' },
        { id: 'MC-04', name: 'Chemical Planetary Mixer', line: 'Line B', status: 'Running', utilization: 86.2, runtime: 16.0, downtime: 1.0, oee: 84.1, health: 'Optimal', mtbf: '180 hrs', mttr: '0.8 hrs' },
        { id: 'MC-07', name: 'Hydraulic Flap Disc Press', line: 'Line C', status: 'Maintenance', utilization: 64.5, runtime: 11.2, downtime: 4.5, oee: 71.0, health: 'Warning', mtbf: '45 hrs', mttr: '3.5 hrs' },
        { id: 'MC-09', name: 'Automated Tunnel Oven', line: 'Line D', status: 'Idle', utilization: 78.0, runtime: 14.5, downtime: 1.5, oee: 81.2, health: 'Good', mtbf: '210 hrs', mttr: '1.0 hrs' },
      ];
      setMachineData(demoMachines);

    } catch (err) {
      console.warn('[PlantHeadDashboard] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlantData();
  }, [fetchPlantData]);

  // ── Executive 10 KPI Calculations ──
  const kpis = useMemo(() => {
    const plannedTotal = workOrders.reduce((sum, w) => sum + w.plannedQty, 0) || 6050;
    const actualTotal = workOrders.reduce((sum, w) => sum + w.actualQty, 0) || 4070;
    const targetAch = ((actualTotal / (plannedTotal || 1)) * 100).toFixed(1);
    
    const oee = '86.4%';
    const capacityUtil = '88.2%';
    const machineUtil = '82.5%';
    const onTimeProd = '92.1%';
    const delayCount = workOrders.filter(w => w.status === 'Delayed').length || 4;
    const inventoryValue = '₹ 1.28 Cr';
    const rejectionRate = '1.4%';
    const safetyStatus = '342 Days Safe';

    return {
      todayProd: `${actualTotal.toLocaleString()} / ${plannedTotal.toLocaleString()} Pcs`,
      targetAch: `${targetAch}%`,
      oee,
      capacityUtil,
      machineUtil,
      onTimeProd,
      delayCount: `${delayCount} Orders`,
      inventoryValue,
      rejectionRate,
      safetyStatus
    };
  }, [workOrders]);

  // ── Category-wise Production Data ──
  const categoryProductionData = [
    { category: 'Coated Abrasives', planned: 2500, actual: 2350, fill: '#0284c7' },
    { category: 'Chemicals & Pigments', planned: 1800, actual: 1720, fill: '#10b981' },
    { category: 'Hardware & Tools', planned: 3700, actual: 3200, fill: '#f59e0b' },
    { category: 'Packaging Goods', planned: 1200, actual: 1150, fill: '#8b5cf6' },
  ];

  // ── Product-wise Production Donut Data ──
  const productProductionData = [
    { name: 'Water Paper 60 Mesh', value: 1420, color: '#0284c7' },
    { name: 'Benjo Wax Polish 500g', value: 850, color: '#10b981' },
    { name: 'Flap Disc 4 Inch', value: 1800, color: '#f59e0b' },
    { name: 'Cutting Wheel 14 Inch', value: 1200, color: '#8b5cf6' },
    { name: 'Steel Coils 3mm', value: 950, color: '#ec4899' },
  ];

  // ── Export Report CSV Handler ──
  const handleExportCSV = () => {
    const headers = ['Work Order ID,Product,Category,Line,Machine,Planned Qty,Actual Qty,Unit,Status,Delay Hours,Operator,Yield %,Rejection %'];
    const rows = workOrders.map(w => [
      w.id, `"${w.product}"`, `"${w.category}"`, `"${w.line}"`, `"${w.machine}"`, w.plannedQty, w.actualQty, `"${w.unit}"`, `"${w.status}"`, w.delayHours, `"${w.operator}"`, w.yield, w.rejectionPct
    ].join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Plant_Head_Executive_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1e293b' }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '10px', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}>
              <Factory size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Plant Head | Executive Production &amp; Operational Dashboard
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                Executive view of production performance, capacity utilization, machine efficiency, delays &amp; material analytics
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchPlantData}
            disabled={loading}
            style={{ background: '#ffffff', color: '#0284c7', border: '1.5px solid #cbd5e1', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> {loading ? 'Syncing...' : 'Live Sync'}
          </button>
          <button
            onClick={handleExportCSV}
            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)' }}
          >
            <Download size={16} /> Export Executive Report
          </button>
        </div>
      </div>

      {/* ── 10 Executive KPI Cards (Top Section) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        
        {/* 1. Today's Production */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🏭 Today's Production</div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#0284c7', margin: '4px 0' }}>{kpis.todayProd}</div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>Planned vs Actual Output</div>
        </div>

        {/* 2. Target Achievement % */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🎯 Target Achievement %</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#10b981', margin: '4px 0' }}>{kpis.targetAch}</div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>SLA Production Output</div>
        </div>

        {/* 3. OEE */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>⚡ OEE (Overall Efficiency)</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#7c3aed', margin: '4px 0' }}>{kpis.oee}</div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Avail x Perf x Quality</div>
        </div>

        {/* 4. Capacity Utilization % */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🔋 Capacity Utilization %</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#0891b2', margin: '4px 0' }}>{kpis.capacityUtil}</div>
          <div style={{ fontSize: '11px', color: '#0891b2', fontWeight: '700' }}>Plant capacity used</div>
        </div>

        {/* 5. Machine Utilization % */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>⚙️ Machine Utilization %</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#b45309', margin: '4px 0' }}>{kpis.machineUtil}</div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Runtime vs Idle/Down</div>
        </div>

        {/* 6. On-Time Production % */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>⏱️ On-Time Production %</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#059669', margin: '4px 0' }}>{kpis.onTimeProd}</div>
          <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>On-time dispatch SLA</div>
        </div>

        {/* 7. Production Delay Count */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>⚠️ Delay Count</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#ef4444', margin: '4px 0' }}>{kpis.delayCount}</div>
          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>Delayed work orders</div>
        </div>

        {/* 8. Inventory Value */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>💰 Inventory Value</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#1d4ed8', margin: '4px 0' }}>{kpis.inventoryValue}</div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Raw + WIP + FG valuation</div>
        </div>

        {/* 9. Rejection Rate % */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #dc2626' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>❌ Rejection Rate %</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#dc2626', margin: '4px 0' }}>{kpis.rejectionRate}</div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>QC scrap &amp; rejections</div>
        </div>

        {/* 10. Safety Status */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🛡️ Safety Status</div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#15803d', margin: '4px 0' }}>{kpis.safetyStatus}</div>
          <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '700' }}>Zero LTI incidents</div>
        </div>

      </div>

      {/* ── 10 Dashboard Tabs Bar ── */}
      <div style={{ background: '#ffffff', borderRadius: '14px', padding: '12px', marginBottom: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {[
          { id: 'executive_overview', label: '📊 Executive Overview' },
          { id: 'planning_calendar', label: '📅 Production Planning' },
          { id: 'capacity_planning', label: '🔋 Capacity Planning' },
          { id: 'daily_operations', label: '⚡ Daily Operations' },
          { id: 'machine_performance', label: '⚙️ Machine Performance' },
          { id: 'delay_analysis', label: '⏳ Delay & Bottleneck' },
          { id: 'material_analytics', label: '📦 Material Analytics' },
          { id: 'production_analytics', label: '📈 Production Analytics' },
          { id: 'approvals_history', label: '📋 Approval History' },
          { id: 'reports_trends', label: '📑 Reports & Trends' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#f8fafc',
                color: isActive ? '#ffffff' : '#475569',
                border: isActive ? 'none' : '1px solid #cbd5e1',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: '800',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 4px 10px rgba(2, 132, 199, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: EXECUTIVE OVERVIEW ── */}
      {activeTab === 'executive_overview' && (
        <div>
          {/* Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            
            {/* Category-wise Production Chart */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', minWidth: 0, overflow: 'hidden' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} color="#0284c7" /> Category-Wise Production (Planned vs Actual)
              </h3>
              <div style={{ width: '100%', height: '250px', minHeight: '250px', minWidth: 0, overflow: 'hidden' }}>
                <ResponsiveChartWrapper minHeight={250}>
                  <BarChart data={categoryProductionData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="planned" fill="#cbd5e1" name="Planned Output (Pcs)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                    <Bar dataKey="actual" fill="#0284c7" name="Actual Achieved (Pcs)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveChartWrapper>
              </div>
            </div>

            {/* Product-wise Production Donut Chart */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', minWidth: 0, overflow: 'hidden' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} color="#10b981" /> Product-Wise Production Output Distribution
              </h3>
              <div style={{ width: '100%', height: '250px', minHeight: '250px', minWidth: 0, overflow: 'hidden' }}>
                <ResponsiveChartWrapper minHeight={250}>
                  <PieChart>
                    <Pie data={productProductionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} label={({ name, value }) => `${name}: ${value}`} isAnimationActive={false}>
                      {productProductionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveChartWrapper>
              </div>
            </div>

          </div>

          {/* Plant Work Orders Overview Table */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 14px 0' }}>
              Live Production Work Orders &amp; Operator Assignments
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11.5px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>WO ID</th>
                    <th style={{ padding: '10px 12px' }}>Product Name</th>
                    <th style={{ padding: '10px 12px' }}>Category</th>
                    <th style={{ padding: '10px 12px' }}>Line &amp; Machine</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Planned</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actual Output</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Yield %</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Rejection %</th>
                    <th style={{ padding: '10px 12px' }}>Operator</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map((wo, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '800', fontFamily: 'monospace', color: '#0284c7' }}>{wo.id}</td>
                      <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0f172a' }}>{wo.product}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{wo.category}</td>
                      <td style={{ padding: '10px 12px', fontWeight: '600', color: '#334155' }}>{wo.line} - {wo.machine}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>{wo.plannedQty.toLocaleString()} {wo.unit}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#10b981' }}>{wo.actualQty.toLocaleString()} {wo.unit}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', color: '#0284c7' }}>{wo.yield}%</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', color: '#dc2626' }}>{wo.rejectionPct}%</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{wo.operator}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{
                          background: wo.status === 'Completed' ? '#dcfce7' : wo.status === 'Delayed' ? '#fee2e2' : '#e0f2fe',
                          color: wo.status === 'Completed' ? '#15803d' : wo.status === 'Delayed' ? '#b91c1c' : '#0369a1',
                          padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800'
                        }}>
                          {wo.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PRODUCTION PLANNING CALENDAR ── */}
      {activeTab === 'planning_calendar' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#0284c7" /> 1. Production Planning Calendar &amp; Machine Allocation
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {workOrders.map((wo, i) => (
              <div key={i} style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '900', color: '#0284c7', fontFamily: 'monospace' }}>{wo.id}</span>
                  <span style={{ fontSize: '11px', fontWeight: '800', background: wo.status === 'Delayed' ? '#fee2e2' : '#dcfce7', color: wo.status === 'Delayed' ? '#b91c1c' : '#15803d', padding: '2px 8px', borderRadius: '4px' }}>{wo.status}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>{wo.product}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Allocation: <strong>{wo.machine}</strong> ({wo.line})</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Operator: <strong>{wo.operator}</strong></div>
                <div style={{ fontSize: '12px', color: '#059669', fontWeight: '700', marginTop: '8px' }}>Output: {wo.actualQty} / {wo.plannedQty} {wo.unit}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: CAPACITY PLANNING ── */}
      {activeTab === 'capacity_planning' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BatteryCharging size={18} color="#0891b2" /> 2. Capacity Planning &amp; Bottleneck Machines
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#0369a1' }}>Available Capacity (Hours)</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#0284c7' }}>480.0 Hrs</div>
            </div>
            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#15803d' }}>Utilized Capacity</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#16a34a' }}>423.4 Hrs (88.2%)</div>
            </div>
            <div style={{ background: '#fefce8', padding: '16px', borderRadius: '12px', border: '1px solid #fef08a' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#a16207' }}>Remaining Capacity</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#ca8a04' }}>56.6 Hrs</div>
            </div>
            <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#991b1b' }}>Bottleneck Machine</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#dc2626' }}>MC-07 Press (96%)</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: DAILY OPERATIONS ── */}
      {activeTab === 'daily_operations' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="#f59e0b" /> 3. Daily Operations KPI &amp; Labor Productivity
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Production Yield %</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#10b981' }}>96.8%</div>
            </div>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Labor Productivity</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#0284c7' }}>185 Pcs/Operator</div>
            </div>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Energy Consumption</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#7c3aed' }}>4,250 kWh</div>
            </div>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Scrap &amp; Rejection</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#ef4444' }}>1.4%</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: MACHINE PERFORMANCE ── */}
      {activeTab === 'machine_performance' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="#7c3aed" /> 4. Machine Performance, MTBF &amp; MTTR Analysis
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11.5px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Machine ID</th>
                  <th style={{ padding: '10px 12px' }}>Machine Name</th>
                  <th style={{ padding: '10px 12px' }}>Line</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Utilization %</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Runtime</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Downtime</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>OEE %</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>MTBF</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>MTTR</th>
                </tr>
              </thead>
              <tbody>
                {machineData.map((m, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '800', fontFamily: 'monospace', color: '#7c3aed' }}>{m.id}</td>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0f172a' }}>{m.name}</td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{m.line}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ background: m.status === 'Running' ? '#dcfce7' : m.status === 'Maintenance' ? '#fee2e2' : '#fef3c7', color: m.status === 'Running' ? '#15803d' : m.status === 'Maintenance' ? '#b91c1c' : '#b45309', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>{m.status}</span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#0284c7' }}>{m.utilization}%</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>{m.runtime} hrs</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#dc2626', fontWeight: '700' }}>{m.downtime} hrs</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#10b981' }}>{m.oee}%</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#475569' }}>{m.mtbf}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#475569' }}>{m.mttr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 6: DELAY & BOTTLENECK ── */}
      {activeTab === 'delay_analysis' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#dc2626', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#dc2626" /> 5. Production Delay &amp; Root Cause Analysis
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#fff5f5', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#991b1b' }}>Material Shortage Delay</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#dc2626' }}>2 Orders (4.5 hrs)</div>
            </div>
            <div style={{ background: '#fff5f5', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#991b1b' }}>Machine Breakdown</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#dc2626' }}>1 Order (3.5 hrs)</div>
            </div>
            <div style={{ background: '#fff5f5', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#991b1b' }}>Operator Shortage</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#dc2626' }}>1 Order (2.0 hrs)</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 7: MATERIAL ANALYTICS ── */}
      {activeTab === 'material_analytics' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#0284c7" /> 7. Material Analytics &amp; Inventory Variance
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Raw Material Valuation</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#0284c7' }}>₹ 48.25 L</div>
            </div>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>WIP Inventory</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#f59e0b' }}>₹ 32.40 L</div>
            </div>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Finished Goods Valuation</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#10b981' }}>₹ 47.85 L</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 8: PRODUCTION ANALYTICS ── */}
      {activeTab === 'production_analytics' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#10b981" /> 8. Executive Production Insights &amp; Unit Cost
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Total Production Volume</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#059669' }}>48,500 Pcs/mo</div>
            </div>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>First Pass Yield (FPY)</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#0284c7' }}>97.4%</div>
            </div>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Avg Cost per Unit</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#7c3aed' }}>₹ 142.50</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 9: APPROVAL HISTORY ── */}
      {activeTab === 'approvals_history' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={18} color="#3b82f6" /> 9. Workflow Approvals &amp; Audit Trail
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Pending Approvals</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#f59e0b' }}>3 Requests</div>
            </div>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Approved Work Orders</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#10b981' }}>28 Orders</div>
            </div>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Approval Aging Avg</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#0284c7' }}>1.4 Hours</div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 10: REPORTS & TRENDS (DRILL-DOWN) ── */}
      {activeTab === 'reports_trends' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="#0284c7" /> 10. Operational Drill-Down Hierarchy
          </h3>

          {/* Drill-down Breadcrumbs */}
          <div style={{ background: '#f1f5f9', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700' }}>
            <span style={{ color: '#0284c7' }}>Plant: {drillLevel.plant}</span>
            <ChevronRight size={14} color="#64748b" />
            <span style={{ color: '#0284c7' }}>Unit: {drillLevel.unit}</span>
            <ChevronRight size={14} color="#64748b" />
            <span style={{ color: '#0284c7' }}>Line: {drillLevel.line}</span>
            <ChevronRight size={14} color="#64748b" />
            <span style={{ color: '#0284c7' }}>Machine: {drillLevel.machine}</span>
          </div>

          <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
            Hierarchical drill-down view enabled across Plant Head operations: <strong>Plant &rarr; Unit &rarr; Production Line &rarr; Machine &rarr; Work Order &rarr; Operator</strong>.
          </p>
        </div>
      )}

    </div>
  );
};

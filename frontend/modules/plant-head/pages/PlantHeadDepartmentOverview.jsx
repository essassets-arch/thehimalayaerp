'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building, Calendar, Download, RefreshCw, BarChart3, Wrench,
  ShieldCheck, PackageCheck, AlertTriangle, FileSpreadsheet, Users, Activity,
  Truck, ShieldAlert, CheckCircle, Clock
} from 'lucide-react';
import { backendFetch } from '../../../lib/backendFetch';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

// ── Responsive Container Box Helper ──
const ResponsiveChartBox = ({ children, height = 260 }) => {
  const containerRef = React.useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const w = rect.width || containerRef.current.clientWidth || 360;
        setDimensions({ width: Math.max(w, 280), height });
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [height]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: `${height}px`, minHeight: `${height}px`, position: 'relative', overflow: 'hidden' }}>
      {dimensions.width > 0 ? (
        React.isValidElement(children) ? (
          React.cloneElement(children, { width: dimensions.width, height })
        ) : (
          children
        )
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: `${height}px`, color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>
          Loading department chart...
        </div>
      )}
    </div>
  );
};

export const PlantHeadDepartmentOverview = () => {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [deptOverview, setDeptOverview] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDepartmentData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await backendFetch('/api/backend/plant-head/overview/departments');
      if (res) {
        setDeptOverview(res);
      }
    } catch (err) {
      console.warn('[PlantHeadDepartmentOverview] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartmentData();
  }, [fetchDepartmentData]);

  // Capacity Chart Data
  const capacityData = useMemo(() => {
    if (deptOverview?.capacityData && Array.isArray(deptOverview.capacityData)) {
      return deptOverview.capacityData;
    }
    return [
      { dept: 'Production', capacity: 480, utilized: 423, fill: '#0284c7' },
      { dept: 'Quality Control', capacity: 160, utilized: 148, fill: '#10b981' },
      { dept: 'Store & Warehouse', capacity: 200, utilized: 175, fill: '#f59e0b' },
      { dept: 'Dispatch & Logistics', capacity: 220, utilized: 200, fill: '#06b6d4' },
      { dept: 'Maintenance', capacity: 120, utilized: 95, fill: '#8b5cf6' },
      { dept: 'HR & Safety', capacity: 100, utilized: 95, fill: '#3b82f6' }
    ];
  }, [deptOverview]);

  // All Department List
  const deptList = useMemo(() => {
    if (deptOverview?.departmentList && Array.isArray(deptOverview.departmentList)) {
      return deptOverview.departmentList;
    }
    return [
      { name: 'Production & Planning', head: 'Ramesh Patel', staff: 42, activeOrders: deptOverview?.production?.runningOrders || 12, backlog: deptOverview?.production?.pendingOrders || 3, health: 'Optimal', capacityUtil: '88.2%' },
      { name: 'Quality Control (QC)', head: 'Sneha Verma', staff: 14, activeOrders: 8, backlog: 1, health: 'Optimal', capacityUtil: '92.5%' },
      { name: 'Store & Raw Inventory', head: 'Mahesh Kumar', staff: 18, activeOrders: deptOverview?.store?.materialPending || 15, backlog: deptOverview?.store?.lowStock || 4, health: 'Warning', capacityUtil: '87.5%' },
      { name: 'Dispatch & Outbound Logistics', head: 'Rajesh Sharma', staff: 12, activeOrders: deptOverview?.dispatch?.ready || 7, backlog: 0, health: 'Optimal', capacityUtil: '91.0%' },
      { name: 'Maintenance & Tooling', head: 'Amit Shah', staff: 10, activeOrders: 4, backlog: 1, health: 'Good', capacityUtil: '79.2%' },
      { name: 'HR & Safety Compliance', head: 'Pooja Gupta', staff: 8, activeOrders: 108, backlog: 0, health: 'Optimal', capacityUtil: '95.0%' }
    ];
  }, [deptOverview]);

  const handleExportCSV = () => {
    const lines = [
      'ALL-DEPARTMENT OVERVIEW REPORT',
      `Generated Date: ${new Date().toISOString().slice(0, 10)}`,
      '',
      'DEPARTMENT WORKLOAD & CAPACITY LEDGER',
      'Department,Head / Manager,Staff Count,Active Orders,Backlog Count,Capacity Util,Health Status',
      ...deptList.map(d => `"${d.name}","${d.head}",${d.staff},${d.activeOrders},${d.backlog},"${d.capacityUtil}","${d.health}"`)
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Department_Overview_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1e293b' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', padding: '10px', borderRadius: '12px', color: '#fff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}>
            <Building size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Department Overview</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>Unified real-time operational breakdown across Production, QC, Store, Logistics, Maintenance, and HR</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchDepartmentData} disabled={loading} style={{ background: '#ffffff', color: '#0284c7', border: '1.5px solid #cbd5e1', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> {loading ? 'Syncing...' : 'Refresh'}
          </button>
          <button onClick={handleExportCSV} style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)' }}>
            <FileSpreadsheet size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* 6-Department Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🏭 Production &amp; Planning</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#0284c7', margin: '4px 0' }}>{deptOverview?.production?.runningOrders || 12} Active Orders</div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>42 Operators Active</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🛡️ Quality Control (QC)</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#10b981', margin: '4px 0' }}>{deptOverview?.qc?.passRate || '98.6%'} Pass Rate</div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>14 QC Inspectors</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>📦 Store &amp; Raw Inventory</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#b45309', margin: '4px 0' }}>{deptOverview?.store?.materialPending || 15} Requisitions</div>
          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>{deptOverview?.store?.lowStock || 4} Low Stock Alerts</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🚚 Dispatch &amp; Logistics</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#0891b2', margin: '4px 0' }}>{deptOverview?.dispatch?.ready || 7} Ready for Dispatch</div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>{deptOverview?.dispatch?.activeFleet || '4/5 Active'} Fleet</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>⚙️ Maintenance &amp; Tooling</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#7c3aed', margin: '4px 0' }}>{deptOverview?.maintenance?.uptime || '94.2%'} Uptime</div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>1 Machine under PM</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>👥 HR &amp; Safety Compliance</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#2563eb', margin: '4px 0' }}>{deptOverview?.hr?.presentStaff || '108 / 114'} Present</div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>0 Safety Incidents</div>
        </div>
      </div>

      {/* Capacity Chart */}
      <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="#0284c7" /> Department Capacity Utilization (Available vs Utilized Hours)
        </h3>
        <div style={{ width: '100%', height: '260px', minHeight: '260px', position: 'relative' }}>
          {mounted && (
            <ResponsiveChartBox height={260}>
              <BarChart data={capacityData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', color: '#fff', border: 'none' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="capacity" fill="#cbd5e1" name="Available Capacity (Hrs)" radius={[6, 6, 0, 0]} isAnimationActive={true} />
                <Bar dataKey="utilized" fill="#10b981" name="Utilized Hours" radius={[6, 6, 0, 0]} isAnimationActive={true} />
              </BarChart>
            </ResponsiveChartBox>
          )}
        </div>
      </div>

      {/* Department Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 14px 0' }}>All-Department Workload &amp; Health Matrix</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11.5px', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 12px' }}>Department</th>
                <th style={{ padding: '10px 12px' }}>Manager / Head</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Staff Count</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Active Workload</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Backlog</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Capacity Util %</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Health Status</th>
              </tr>
            </thead>
            <tbody>
              {deptList.map((dept, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '800', color: '#0f172a' }}>{dept.name}</td>
                  <td style={{ padding: '10px 12px', color: '#475569' }}>{dept.head}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700' }}>{dept.staff}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#0284c7' }}>{dept.activeOrders}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: dept.backlog > 2 ? '#dc2626' : '#64748b' }}>{dept.backlog}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '800', color: '#10b981' }}>{dept.capacityUtil}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ background: dept.health === 'Optimal' ? '#dcfce7' : dept.health === 'Warning' ? '#fef3c7' : '#e0f2fe', color: dept.health === 'Optimal' ? '#15803d' : dept.health === 'Warning' ? '#b45309' : '#0369a1', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{dept.health}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

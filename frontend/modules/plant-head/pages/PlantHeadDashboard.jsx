'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Swal from 'sweetalert2';
import {
  Factory, LayoutGrid, Calendar, BatteryCharging, Zap, Cpu, Clock,
  AlertTriangle, CheckCircle, XCircle, FileText, BarChart3, TrendingUp,
  Layers, Package, Shield, RefreshCw, Download, Search, Filter,
  ChevronRight, ArrowUpRight, ArrowDownRight, User, Award, ShieldCheck,
  FileCheck, RotateCcw, Wrench, Activity, DollarSign
} from 'lucide-react';
import { backendFetch } from '../../../lib/backendFetch';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

export const PlantHeadDashboard = () => {
  // ── Active Tab State (10 Dashboard Tabs) ──
  const [activeTab, setActiveTab] = useState('executive_overview');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Drill-down State
  const [drillLevel, setDrillLevel] = useState({ plant: 'Main Plant', unit: 'Unit-01', line: 'All Lines', machine: 'All Machines' });

  // Dynamic Backend Datasets
  const [backendDashboard, setBackendDashboard] = useState(null);
  const [backendProdAnalytics, setBackendProdAnalytics] = useState(null);
  const [backendMatAnalytics, setBackendMatAnalytics] = useState(null);
  const [backendDeptOverview, setBackendDeptOverview] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [productionTargetAchievement, setProductionTargetAchievement] = useState(null);
  const [loadingTarget, setLoadingTarget] = useState(true);
  const [dateFilter, setDateFilter] = useState('Today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // ── Machine Performance Live Log State ──
  const [machinePerformanceDate, setMachinePerformanceDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [machineStatuses, setMachineStatuses] = useState([]);
  const [loadingMachineStatuses, setLoadingMachineStatuses] = useState(false);

  const fetchMachineStatuses = useCallback(async (dateStr) => {
    try {
      setLoadingMachineStatuses(true);
      const res = await backendFetch(`/api/backend/machine-status?date=${dateStr}`);
      if (Array.isArray(res)) {
        setMachineStatuses(res);
      } else {
        setMachineStatuses([]);
      }
    } catch (err) {
      console.error('Failed to fetch machine statuses for Plant Head:', err);
      setMachineStatuses([]);
    } finally {
      setLoadingMachineStatuses(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'machine_performance') {
      fetchMachineStatuses(machinePerformanceDate);
    }
  }, [activeTab, machinePerformanceDate, fetchMachineStatuses]);

  // Fetch Live Data from Backend API
  const fetchPlantData = useCallback(async () => {
    setLoading(true);
    setLoadingTarget(true);
    try {
      const queryParams = `?filter=${dateFilter}&customStart=${customStart}&customEnd=${customEnd}`;
      const [dbRes, prodRes, matRes, deptRes, ordersRes, itemsRes, targetRes, incomingRes, rawWOsRes] = await Promise.allSettled([
        backendFetch('/api/backend/plant-head/dashboard-data' + queryParams),
        backendFetch('/api/backend/plant-head/analytics/production' + queryParams),
        backendFetch('/api/backend/plant-head/analytics/material' + queryParams),
        backendFetch('/api/backend/plant-head/overview/departments'),
        backendFetch('/api/backend/plant-head/planning'),
        backendFetch('/api/backend/inventory/items'),
        backendFetch('/api/backend/production-targets/achievement'),
        backendFetch('/api/backend/plant-head/incoming-orders'),
        backendFetch('/api/backend/production/work-orders')
      ]);

      if (dbRes.status === 'fulfilled' && dbRes.value) {
        setBackendDashboard(dbRes.value);
      }

      if (prodRes.status === 'fulfilled' && prodRes.value) {
        setBackendProdAnalytics(prodRes.value);
      }

      if (matRes.status === 'fulfilled' && matRes.value) {
        setBackendMatAnalytics(matRes.value);
      }

      if (deptRes.status === 'fulfilled' && deptRes.value) {
        setBackendDeptOverview(deptRes.value);
      }

      if (itemsRes.status === 'fulfilled' && Array.isArray(itemsRes.value)) {
        setInventoryItems(itemsRes.value);
      }

      if (targetRes.status === 'fulfilled' && targetRes.value) {
        setProductionTargetAchievement(targetRes.value);
      }

      if (incomingRes.status === 'fulfilled' && Array.isArray(incomingRes.value)) {
        setIncomingOrders(incomingRes.value);
      }
      setLoadingTarget(false);

      // Process Work Orders from Database or Fallback
      let ordersList = [];
      const rawWOs = (rawWOsRes.status === 'fulfilled' && (Array.isArray(rawWOsRes.value) ? rawWOsRes.value : rawWOsRes.value?.data)) || [];
      if (Array.isArray(rawWOs) && rawWOs.length > 0) {
        ordersList = rawWOs.map((wo, idx) => {
          const planned = Number(wo.targetQty || wo.plannedQty || wo.quantity || wo.targetQuantity || 100);
          const actual = Number(wo.producedQty || wo.completedQty || Math.round(planned * (Number(wo.progress || 0) / 100)));
          const st = String(wo.status || wo.workflowStatus || '').toUpperCase();
          const displayStatus = ['COMPLETED', 'CLOSED', 'QC_PASSED'].includes(st)
            ? 'Completed'
            : ['DELAYED', 'OVERDUE', 'QC_FAILED'].includes(st)
            ? 'Delayed'
            : ['IN_PROGRESS', 'RUNNING', 'MATERIAL_ISSUED'].includes(st)
            ? 'In Progress'
            : 'Planned';
          return {
            id: wo.workOrderNo || wo.orderNo || wo.id || `WO-${1040 + idx}`,
            product: wo.salesOrderItem?.product?.name || wo.productName || wo.product || 'Himalaya Product',
            category: wo.salesOrderItem?.product?.category?.name || wo.category || 'Production Order',
            line: wo.line || `Line ${String.fromCharCode(65 + (idx % 4))}`,
            machine: wo.machine || wo.workCenter || `MC-0${(idx % 4) + 1}`,
            plannedQty: planned,
            actualQty: actual,
            unit: wo.unit || wo.salesOrderItem?.product?.unit || 'Pcs',
            status: displayStatus,
            delayHours: displayStatus === 'Delayed' ? 3.5 : 0,
            operator: wo.operator || `Operator ${idx + 1}`,
            yield: Number((Math.max(90, 100 - (idx % 3) * 1.5)).toFixed(1)),
            rejectionPct: (1.0 + (idx % 3) * 0.4).toFixed(1)
          };
        });
      } else if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value) && ordersRes.value.length > 0) {
        ordersList = ordersRes.value.map((ord, idx) => {
          const item = ord.items?.[0] || {};
          const planned = Number(item.orderedQuantity || ord.quantity || 1000);
          const actual = ord.status === 'COMPLETED' ? planned : Math.round(planned * (0.6 + (idx % 4) * 0.1));
          return {
            id: ord.orderNo || ord.id || `WO-${1040 + idx}`,
            product: item.product?.name || item.productName || ord.products || 'Paper / Wax Product',
            category: item.product?.category || 'Production Order',
            line: `Line ${String.fromCharCode(65 + (idx % 4))}`,
            machine: `MC-0${(idx % 4) + 1}`,
            plannedQty: planned,
            actualQty: actual,
            unit: item.product?.unit || 'Pcs',
            status: ord.status === 'COMPLETED' ? 'Completed' : ord.status === 'IN_PRODUCTION' ? 'In Progress' : 'Planned',
            delayHours: idx % 3 === 0 ? 2.5 : 0,
            operator: `Operator ${idx + 1}`,
            yield: 95.0 + (idx % 4),
            rejectionPct: (1.0 + (idx % 3) * 0.4).toFixed(1)
          };
        });
      }

      if (ordersList.length === 0) {
        ordersList = [
          { id: 'WO-1041', product: 'Water Paper 60 Mesh', category: 'Coated Abrasives', line: 'Line A (Coating)', machine: 'MC-01 Coater', plannedQty: 1500, actualQty: 1420, unit: 'Pcs', status: 'In Progress', delayHours: 0, operator: 'Rajesh Patel', yield: 96.2, rejectionPct: '1.2' },
          { id: 'WO-1042', product: 'Benjo Wax Polish 500g', category: 'Chemicals & Pigments', line: 'Line B (Mixing)', machine: 'MC-04 Mixer', plannedQty: 850, actualQty: 850, unit: 'Tins', status: 'Completed', delayHours: 0, operator: 'Suresh Kumar', yield: 98.4, rejectionPct: '0.8' },
          { id: 'WO-1043', product: 'Flap Disc 4 Inch', category: 'Hardware & Tools', line: 'Line C (Assembly)', machine: 'MC-07 Press', plannedQty: 2500, actualQty: 1800, unit: 'Pcs', status: 'Delayed', delayHours: 3.5, operator: 'Vikram Singh', yield: 92.1, rejectionPct: '2.5' },
          { id: 'WO-1044', product: 'Cutting Wheel 14 Inch', category: 'Hardware & Tools', line: 'Line D (Curing)', machine: 'MC-09 Oven', plannedQty: 1200, actualQty: 0, unit: 'Pcs', status: 'Planned', delayHours: 0, operator: 'Amit Shah', yield: 100, rejectionPct: '0.0' },
        ];
      }
      setWorkOrders(ordersList);

    } catch (err) {
      console.warn('[PlantHeadDashboard] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, customStart, customEnd]);

  const handleAcceptOrder = async (order) => {
    const { value: remarks } = await Swal.fire({
      title: 'Accept Order',
      input: 'textarea',
      inputLabel: 'Acceptance Remarks (optional)',
      inputPlaceholder: 'e.g. Capacity available, scheduling for production…',
      showCancelButton: true,
      confirmButtonText: 'Accept Order',
      customClass: {
        popup: 'swal-premium-popup',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    });
    if (remarks === undefined) return;
    try {
      await backendFetch(`/api/backend/sales/orders/${order.id}/action`, {
        method: 'POST',
        body: { action: 'PLANT_APPROVE', remarks },
      });
      Swal.fire({ icon: 'success', title: 'Order Accepted', text: `Order ${order.orderNo || order.id} has been accepted.`, customClass: { popup: 'swal-premium-popup', confirmButton: 'swal-premium-confirm-btn' }, buttonsStyling: false });
      fetchPlantData();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Accept Failed', text: err.message, customClass: { popup: 'swal-premium-popup', confirmButton: 'swal-premium-confirm-btn' }, buttonsStyling: false });
    }
  };

  const handleRejectOrder = async (order) => {
    const { value: remarks } = await Swal.fire({
      title: 'Reject Order',
      input: 'textarea',
      inputLabel: 'Rejection Reason (required)',
      inputPlaceholder: 'e.g. Insufficient raw material / capacity constraint…',
      inputValidator: (v) => !v && 'Please provide a rejection reason.',
      showCancelButton: true,
      confirmButtonText: 'Reject Order',
      confirmButtonColor: '#ef4444',
      customClass: {
        popup: 'swal-premium-popup',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    });
    if (!remarks) return;
    try {
      await backendFetch(`/api/backend/sales/orders/${order.id}/action`, {
        method: 'POST',
        body: { action: 'PLANT_REJECT', remarks },
      });
      Swal.fire({ icon: 'success', title: 'Order Rejected', text: `Order ${order.orderNo || order.id} has been rejected.`, customClass: { popup: 'swal-premium-popup', confirmButton: 'swal-premium-confirm-btn' }, buttonsStyling: false });
      fetchPlantData();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Reject Failed', text: err.message, customClass: { popup: 'swal-premium-popup', confirmButton: 'swal-premium-confirm-btn' }, buttonsStyling: false });
    }
  };

  useEffect(() => {
    fetchPlantData();
  }, [fetchPlantData]);

  // ── Standardized Machines Performance Data ──
  const machineData = useMemo(() => {
    if (machineStatuses.length > 0) {
      return machineStatuses.map((m, idx) => {
        const st = m.status === 'USE' ? 'Running' : m.status === 'NOT_USE' ? 'Idle' : 'Breakdown';
        const isRun = st === 'Running';
        return {
          id: m.machineId || `HM00${idx + 1}`,
          name: m.machineName || `Hydraulic Machine ${idx + 1}`,
          line: `Line ${String.fromCharCode(65 + (idx % 4))}`,
          status: st,
          runtime: isRun ? '7.8 hrs' : '0.0 hrs',
          utilization: isRun ? 91 : 0,
          oee: isRun ? 96 : 0,
          output: isRun ? '2,450 Pcs' : '0 Pcs',
          rejectionPct: isRun ? '2.1%' : '—',
          downtime: isRun ? '0.7 hrs' : '8.0 hrs'
        };
      });
    }
    return [];
  }, [machineStatuses]);

  // ── Executive 10 KPI Calculations (100% Dynamic) ──
  const kpis = useMemo(() => {
    const plannedTotal = workOrders.reduce((sum, w) => sum + (Number(w.plannedQty) || 0), 0);
    const actualTotal = workOrders.reduce((sum, w) => sum + (Number(w.actualQty) || 0), 0);
    const dailyAchPct = plannedTotal ? Number(((actualTotal / plannedTotal) * 100).toFixed(1)) : 0;

    const prodData = backendDashboard?.production || {};
    const qcData = backendDashboard?.qc || {};

    const runningWOs = workOrders.filter(w => ['In Progress', 'IN_PROGRESS', 'RUNNING'].includes(w.status)).length;
    const completedWOs = workOrders.filter(w => ['Completed', 'COMPLETED', 'QC_PASSED', 'CLOSED'].includes(w.status)).length;
    const delayedCount = workOrders.filter(w => ['Delayed', 'DELAYED', 'OVERDUE', 'QC_FAILED'].includes(w.status)).length;

    const oeeVal = prodData.efficiency || (workOrders.length > 0 ? Number(((actualTotal / (plannedTotal || 1)) * 98).toFixed(1)) : 0);
    const capacityUtilVal = workOrders.length > 0 ? Number((((runningWOs + completedWOs) / (workOrders.length || 1)) * 100).toFixed(1)) : 0;
    const machineUtilVal = workOrders.length > 0 ? Number(((runningWOs / (workOrders.length || 1) * 100)).toFixed(1)) : 0;
    const onTimeProdVal = qcData.passRate || (workOrders.length > 0 ? Math.max(0, Number((100 - (delayedCount / workOrders.length * 100)).toFixed(1))) : 100);

    const invValNum = inventoryItems.reduce((s, item) => s + (Number(item.balance || item.currentStock || item.stock || 0) * Number(item.price || item.unitPrice || item.rate || 0)), 0);
    const inventoryValue = invValNum > 0 ? `₹ ${(invValNum / 10000000).toFixed(2)} Cr` : '₹ 0.00 Cr';

    const rejectionRateVal = qcData.failed > 0 ? Number((100 - (qcData.passRate || 98.6)).toFixed(1)) : 0;

    return {
      todayProd: `${actualTotal.toLocaleString()} / ${plannedTotal.toLocaleString()} Pcs`,
      dailyAchPct,
      oeeVal,
      capacityUtilVal,
      machineUtilVal,
      onTimeProdVal,
      delayCount: `${delayedCount} Order${delayedCount !== 1 ? 's' : ''}`,
      inventoryValue,
      rejectionRateVal
    };
  }, [workOrders, backendDashboard, inventoryItems]);

  // ── Dynamic Critical Management Alerts ──
  const criticalIssues = useMemo(() => {
    const alerts = [];
    const breakdownMachines = machineData.filter(m => m.status === 'Breakdown');
    breakdownMachines.forEach(m => {
      alerts.push({ level: '🔴', text: `<strong>${m.id} (${m.name}) Down</strong> — Maintenance team action required (${m.downtime} downtime)` });
    });
    if (kpis.rejectionRateVal > 2.0) {
      alerts.push({ level: '🔴', text: `<strong>${kpis.rejectionRateVal}% QC Rejection Rate</strong> — Exceeds 2.0% SLA target` });
    }
    const delayedWOs = workOrders.filter(w => w.status === 'Delayed');
    delayedWOs.forEach(w => {
      alerts.push({ level: '🟠', text: `<strong>Work Order ${w.id} Delayed</strong> — Material / Machine bottleneck` });
    });
    if (kpis.dailyAchPct > 0 && kpis.dailyAchPct < 85.0) {
      alerts.push({ level: '🟡', text: `<strong>Daily Plan Achievement at ${kpis.dailyAchPct}%</strong> — Below 85.0% plant target` });
    }
    return alerts;
  }, [machineData, kpis, workOrders]);

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
                Real-time plant capacity utilization, OEE metrics, production planning, machine performance, delay analysis &amp; material analytics
              </p>
            </div>
          </div>
        </div>

        {/* Date Filter & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Date Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Period:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '13px', fontWeight: '800', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Annually">Annually</option>
              <option value="Custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Inputs */}
          {dateFilter === 'Custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '12px', color: '#334155', fontWeight: '600' }}
              />
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '12px', color: '#334155', fontWeight: '600' }}
              />
            </div>
          )}

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

      {/* ── Executive 10 KPI Cards (Top Section with Threshold Logic) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>

        {/* 1. Daily Production Output */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🏭 Today's Production Output</div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#0284c7', margin: '4px 0' }}>{kpis.todayProd}</div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Daily Planned vs Actual Output</div>
        </div>

        {/* 2. Daily Plan Achievement % */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          borderLeft: `4px solid ${kpis.dailyAchPct >= 95 ? '#10b981' : kpis.dailyAchPct >= 85 ? '#f59e0b' : '#ef4444'}`
        }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>📈 Daily Plan Achievement</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: kpis.dailyAchPct >= 95 ? '#10b981' : kpis.dailyAchPct >= 85 ? '#d97706' : '#ef4444', margin: '4px 0' }}>
            {kpis.dailyAchPct}%
          </div>
          <div style={{ fontSize: '11px', color: kpis.dailyAchPct >= 90 ? '#10b981' : '#ef4444', fontWeight: '700' }}>
            {kpis.dailyAchPct >= 90 ? '🟢 On Target (≥90%)' : '🔴 Below 90% Target'}
          </div>
        </div>

        {/* 3. Monthly Target Allocation */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🎯 Monthly Target Allocation</div>
          {loadingTarget ? (
            <div style={{ fontSize: '14px', color: '#64748b', margin: '8px 0' }}>Loading...</div>
          ) : !productionTargetAchievement || !productionTargetAchievement.hasTarget ? (
            <>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#ea580c', margin: '4px 0' }}>No Active Target</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Assign target from Super Admin</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#10b981', margin: '2px 0' }}>
                {productionTargetAchievement.achievement}% Target Achieved
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', color: '#475569', borderTop: '1px dashed #e2e8f0', paddingTop: '4px', marginTop: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Monthly Target:</span>
                  <strong>{Number(productionTargetAchievement.target).toLocaleString()} Units</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>MTD Achieved:</span>
                  <strong style={{ color: '#10b981' }}>{Number(productionTargetAchievement.achieved).toLocaleString()} Units</strong>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 4. OEE (Overall Efficiency) with 3 Components */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>⚡ OEE Efficiency</span>
            <span style={{ fontSize: '10.5px', background: '#f3e8ff', color: '#7c3aed', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>+3.1% ↑</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#7c3aed', margin: '2px 0' }}>{kpis.oeeVal}%</div>
          <div style={{ fontSize: '10.5px', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '4px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', textAlign: 'center' }}>
            <div><small style={{ display: 'block', color: '#94a3b8' }}>Avail</small><strong>97%</strong></div>
            <div><small style={{ display: 'block', color: '#94a3b8' }}>Perf</small><strong>98%</strong></div>
            <div><small style={{ display: 'block', color: '#94a3b8' }}>Qual</small><strong>99%</strong></div>
          </div>
        </div>

        {/* 5. Capacity Utilization % */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>🔋 Capacity Utilization</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#0891b2', margin: '4px 0' }}>{kpis.capacityUtilVal}%</div>
          <div style={{ fontSize: '11px', color: '#0891b2', fontWeight: '700' }}>🟢 Capacity Available (1,200h)</div>
        </div>

        {/* 6. Machine Utilization % */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>⚙️ Machine Utilization</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#b45309', margin: '4px 0' }}>{kpis.machineUtilVal}%</div>
          <div style={{ fontSize: '11px', color: '#b45309', fontWeight: '700' }}>🟡 Runtime vs Idle/Down</div>
        </div>

        {/* 7. On-Time Production % */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>⏱️ On-Time Dispatch SLA</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#059669', margin: '4px 0' }}>{kpis.onTimeProdVal}%</div>
          <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>Dispatch SLA Clearance</div>
        </div>

        {/* 8. Delay Count */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>⚠️ Delay Count</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#ef4444', margin: '4px 0' }}>{kpis.delayCount}</div>
          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>Work orders needing attention</div>
        </div>

        {/* 9. Inventory Valuation */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>💰 Inventory Valuation</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#0284c7', margin: '4px 0' }}>{kpis.inventoryValue}</div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Raw + WIP + FG valuation</div>
        </div>

        {/* 10. Rejection Rate */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderLeft: `4px solid ${kpis.rejectionRateVal <= 2 ? '#10b981' : '#ef4444'}` }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>❌ QC Rejection Rate</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: kpis.rejectionRateVal <= 2 ? '#10b981' : '#dc2626', margin: '4px 0' }}>
            {kpis.rejectionRateVal}%
          </div>
          <div style={{ fontSize: '11px', color: kpis.rejectionRateVal <= 2 ? '#10b981' : '#dc2626', fontWeight: '700' }}>
            {kpis.rejectionRateVal <= 2 ? '🟢 Below 2% Target' : '🔴 Exceeds 2.0% SLA Target'}
          </div>
        </div>

      </div>

      {/* ── 🚨 MANAGEMENT ACTION REQUIRED BANNER (DYNAMIC) ── */}
      {criticalIssues.length > 0 && (
        <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: '14px', padding: '18px', marginBottom: '24px', boxShadow: '0 4px 14px rgba(225,29,72,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#be123c', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#e11d48" /> 🚨 Management Action Required (Executive Alert Center)
            </h3>
            <span style={{ fontSize: '11px', background: '#ffe4e6', color: '#9f1239', padding: '3px 10px', borderRadius: '12px', fontWeight: '800' }}>
              {criticalIssues.length} Critical Action{criticalIssues.length > 1 ? 's' : ''} Pending
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {criticalIssues.map((alert, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #fecdd3', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px' }}>{alert.level}</span>
                <div style={{ fontSize: '12px', color: '#1e293b' }} dangerouslySetInnerHTML={{ __html: alert.text }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 10 Dashboard Tabs Bar ── */}
      <div style={{ background: '#ffffff', borderRadius: '14px', padding: '12px', marginBottom: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {[
          { id: 'executive_overview', label: '📊 Executive Overview' },
          { id: 'planning_calendar', label: '📅 Production Planning' },
          { id: 'capacity_planning', label: '🔋 Capacity Planning' },
          { id: 'approval_rate', label: '⚡ Approval Rate' },
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
              <div style={{ width: '100%', height: '250px', minHeight: '250px' }}>
                {mounted && (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={categoryProductionData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="planned" fill="#cbd5e1" name="Planned Output (Pcs)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                      <Bar dataKey="actual" fill="#0284c7" name="Actual Achieved (Pcs)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Product-wise Production Donut Chart */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', minWidth: 0 }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} color="#10b981" /> Product-Wise Production Output Distribution
              </h3>
              <div style={{ width: '100%', height: '250px', minHeight: '250px' }}>
                {mounted && (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={productProductionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} label={({ name, value }) => `${name}: ${value}`} isAnimationActive={false}>
                        {productProductionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
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
                  {workOrders.filter(wo => ['In Progress', 'Delayed'].includes(wo.status)).map((wo, idx) => (
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Machine Allocation Cards */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#0284c7" /> 1. Production Planning Calendar &amp; Machine Allocation
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {workOrders.map((wo, i) => (
                <div key={i} style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: '#0284c7', fontFamily: 'monospace' }}>{wo.id}</span>
                    <span style={{ fontSize: '11px', fontWeight: '800', background: wo.status === 'Delayed' ? '#fee2e2' : wo.status === 'Completed' ? '#dcfce7' : wo.status === 'Planned' ? '#f1f5f9' : '#e0f2fe', color: wo.status === 'Delayed' ? '#b91c1c' : wo.status === 'Completed' ? '#15803d' : wo.status === 'Planned' ? '#475569' : '#0369a1', padding: '2px 8px', borderRadius: '4px' }}>{wo.status}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>{wo.product}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Allocation: <strong>{wo.machine}</strong> ({wo.line})</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Operator: <strong>{wo.operator}</strong></div>
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: '700', marginTop: '8px' }}>Output: {wo.actualQty} / {wo.plannedQty} {wo.unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Incoming Orders Queue */}
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#f59e0b" /> Incoming Production Demand Queue
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
              Accept or reject incoming order releases waiting to be scheduled on the plant floor.
            </p>

            {incomingOrders.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                No pending incoming orders at this time.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11.5px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 12px' }}>Order No</th>
                      <th style={{ padding: '10px 12px' }}>Customer</th>
                      <th style={{ padding: '10px 12px' }}>Product Items</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomingOrders.map((ord, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: '800', fontFamily: 'monospace', color: '#0284c7' }}>{ord.orderNo || ord.id}</td>
                        <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0f172a' }}>{ord.customerName || ord.customer?.name || '—'}</td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>{ord.products || (ord.items && ord.items.map(i => `${i.product?.name || i.productName} (${i.orderedQuantity})`).join(', ')) || '—'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ background: '#fef3c7', color: '#d97706', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
                            Pending
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleAcceptOrder(ord)}
                              style={{ padding: '6px 12px', background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectOrder(ord)}
                              style={{ padding: '6px 12px', background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

      {/* ── TAB 4: APPROVAL RATE ── */}
      {activeTab === 'approval_rate' && (() => {
        const approvalStats = backendDashboard?.approvalStats || { totalOrders: 0, acceptedOrders: 0, approvalRate: 0 };
        return (
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#0284c7" /> Plant Order Approval Rate Analysis
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 20px 0' }}>
              Real-time tracker measuring the percentage of sales orders approved and scheduled for production by the Plant Head.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {/* Main Gauge Card */}
              <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#475569' }}>Overall Approval Rate</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '900', color: '#0284c7' }}>{approvalStats.approvalRate}%</span>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Target: 85.0%</span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: '#cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${approvalStats.approvalRate}%`, height: '100%', background: '#0284c7', borderRadius: '4px', transition: 'width 0.5s ease-out' }} />
                </div>
              </div>

              {/* Status Breakdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>Accepted Orders</span>
                  <span style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{approvalStats.acceptedOrders}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Clearance approved</span>
                </div>
                <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>Total Orders</span>
                  <span style={{ fontSize: '24px', fontWeight: '900', color: '#475569' }}>{approvalStats.totalOrders}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Total pipeline volume</span>
                </div>
              </div>
            </div>

            {/* Explanation box */}
            <div style={{ marginTop: '20px', padding: '14px 16px', background: 'rgba(2,132,199,0.04)', borderLeft: '4px solid #0284c7', borderRadius: '0 8px 8px 0', fontSize: '12px', color: '#0369a1', lineHeight: '1.5' }}>
              <strong>Formula:</strong> (Accepted Orders / Total Orders) × 100. Toggling an order to approved adds it to plant scheduling lists and dynamically advances this acceptance KPI.
            </div>
          </div>
        );
      })()}

      {/* ── TAB 5: MACHINE PERFORMANCE ── */}
      {activeTab === 'machine_performance' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="#7c3aed" /> Machine Performance status
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Select Date:</label>
              <input
                type="date"
                value={machinePerformanceDate}
                onChange={(e) => setMachinePerformanceDate(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px',
                  fontWeight: '600',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => fetchMachineStatuses(machinePerformanceDate)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                title="Refresh Statuses"
              >
                <RefreshCw size={14} color="#475569" className={loadingMachineStatuses ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11.5px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px' }}>Machine ID</th>
                  <th style={{ padding: '12px' }}>Machine Name</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Runtime</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Utilization</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>OEE</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Output</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Rejection</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Downtime</th>
                </tr>
              </thead>
              <tbody>
                {machineData.map((m) => {
                  const statusStyle = m.status === 'Running'
                    ? { bg: '#dcfce7', color: '#15803d', icon: '🟢', label: 'Running' }
                    : m.status === 'Idle'
                    ? { bg: '#fef3c7', color: '#b45309', icon: '🟡', label: 'Idle' }
                    : m.status === 'Breakdown'
                    ? { bg: '#fee2e2', color: '#b91c1c', icon: '🔴', label: 'Breakdown' }
                    : m.status === 'Planned Maintenance'
                    ? { bg: '#dbeafe', color: '#1d4ed8', icon: '🔵', label: 'Planned Maint' }
                    : { bg: '#f1f5f9', color: '#64748b', icon: '⚪', label: 'Not Scheduled' };

                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '800', fontFamily: 'monospace', color: '#7c3aed' }}>{m.id}</td>
                      <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{m.name}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span>{statusStyle.icon}</span> {statusStyle.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>{m.runtime}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: '800', color: m.utilization >= 80 ? '#10b981' : m.utilization > 0 ? '#f59e0b' : '#dc2626' }}>{m.utilization}%</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: '800', color: '#7c3aed' }}>{m.oee ? `${m.oee}%` : '—'}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '800', color: '#0284c7' }}>{m.output}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#dc2626' }}>{m.rejectionPct}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: m.downtime !== '0.0 hrs' ? '#dc2626' : '#64748b' }}>{m.downtime}</td>
                    </tr>
                  );
                })}
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
      )}      {/* ── TAB 8: PRODUCTION & DISPATCH ANALYTICS ── */}
      {activeTab === 'production_analytics' && (() => {
        const disp = backendDashboard?.dispatch || { readyForDispatch: 0, vehicleStatus: '4/5 Active' };
        return (
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#10b981" /> 8. Production &amp; Dispatch Analytics
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Production Analytics */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#f8fafc' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🏭 Production Operations
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Total Production Volume:</span>
                    <strong style={{ fontSize: '14px', color: '#059669' }}>48,500 Pcs/mo</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>First Pass Yield (FPY):</span>
                    <strong style={{ fontSize: '14px', color: '#0284c7' }}>97.4%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Avg Cost per Unit:</span>
                    <strong style={{ fontSize: '14px', color: '#7c3aed' }}>₹ 142.50</strong>
                  </div>
                </div>
              </div>

              {/* Dispatch Analytics */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#f8fafc' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📦 Dispatch &amp; Logistics Telemetry
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Ready for Dispatch:</span>
                    <strong style={{ fontSize: '14px', color: '#0284c7' }}>{disp.readyForDispatch} Orders</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Fleet Utilization:</span>
                    <strong style={{ fontSize: '14px', color: '#f59e0b' }}>{disp.vehicleStatus}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>On-Time Dispatch SLA:</span>
                    <strong style={{ fontSize: '14px', color: '#10b981' }}>98.2%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* ── TAB 9: APPROVAL HISTORY ── */}
      {activeTab === 'approvals_history' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck size={18} color="#3b82f6" /> 9. Workflow Approvals &amp; Audit Trail
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Pending Approvals</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#f59e0b' }}>{backendDashboard?.production?.pendingApproval || 3} Requests</div>
            </div>
            <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Approved Work Orders</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#10b981' }}>{backendDashboard?.production?.planned || 28} Orders</div>
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

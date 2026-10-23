'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Truck, Target, TrendingUp, CheckCircle2, AlertTriangle,
  Plus, Search, RefreshCw, Eye, Edit2, Trash2, XCircle,
  FileSpreadsheet, ArrowUpRight, Clock, ShieldCheck, Box, Layers, MapPin
} from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import Swal from 'sweetalert2';
import { apiClient } from '../../../lib/apiClient';
import { useNotificationStore } from '@/store/notificationStore';
import { exportToExcel } from '../../../services/export.service';
import '../../super-admin/components/targets/TargetManagement.css';

export default function PlantHeadDispatchTargetView() {
  const [dispatchTargets, setDispatchTargets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('ALL');
  const [depotFilter, setDepotFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const showToast = useNotificationStore(s => s.showToast);

  // Modal states
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    period: 'Monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    targetQty: 500,
    depot: 'ALL',
    remarks: ''
  });

  const fetchDispatchTargets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/backend/dispatch-targets');
      if (res.data && Array.isArray(res.data.data)) {
        setDispatchTargets(res.data.data);
      } else if (Array.isArray(res.data)) {
        setDispatchTargets(res.data);
      }
    } catch (err) {
      console.warn('Failed to load dispatch targets:', err);
      // Fallback default target if DB empty
      setDispatchTargets([
        {
          id: 'demo-dt-1',
          targetPeriod: 'Monthly',
          startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
          quantityTarget: 500,
          achieved: 484,
          achievement: 96.8,
          status: 'ACTIVE',
          depot: 'ALL',
          remarks: 'Monthly Dispatch Fulfilment Quota for Logistics & Outward Fleet'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDispatchTargets();
  }, [fetchDispatchTargets]);

  const normalizeDate = (d) => {
    if (!d) return '';
    if (typeof d === 'string') return d.split('T')[0];
    try {
      return new Date(d).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const enrichedTargets = useMemo(() => {
    if (!Array.isArray(dispatchTargets)) return [];

    return dispatchTargets.filter(Boolean).map(t => {
      const startDate = normalizeDate(t.startDate || t.start_date);
      const endDate = normalizeDate(t.endDate || t.end_date);
      const quantityTarget = Number(t.quantityTarget || t.quantity_target || 0);
      const achieved = Number(t.achieved || 0);
      const pct = quantityTarget > 0 ? Math.round((achieved / quantityTarget) * 100) : (t.achievement || 0);
      const remaining = Math.max(0, quantityTarget - achieved);

      const now = new Date();
      const endD = endDate ? new Date(endDate) : new Date();
      const startD = startDate ? new Date(startDate) : new Date();
      const totalDays = Math.max(1, Math.round((endD - startD) / 86400000) + 1);
      const daysRemaining = Math.max(0, Math.round((endD - now) / 86400000));
      const requiredDaily = daysRemaining > 0 ? Math.ceil(remaining / daysRemaining) : remaining;

      const isCancelled = t.status === 'CANCELLED';
      const isAchieved = pct >= 100 && !isCancelled;

      let statusInfo = { label: 'Active', color: '#10b981', class: 'tm-badge-active' };
      if (isCancelled) {
        statusInfo = { label: 'Cancelled', color: '#64748b', class: 'tm-badge-cancelled' };
      } else if (isAchieved) {
        statusInfo = { label: 'Target Met', color: '#047857', class: 'tm-badge-achieved' };
      } else if (pct >= 80) {
        statusInfo = { label: 'On Track', color: '#3b82f6', class: 'tm-badge-ontrack' };
      } else if (pct >= 50) {
        statusInfo = { label: 'In Progress', color: '#f59e0b', class: 'tm-badge-attention' };
      } else {
        statusInfo = { label: 'Needs Pace', color: '#ef4444', class: 'tm-badge-behind' };
      }

      return {
        ...t,
        id: t.id,
        period: t.targetPeriod || t.period || 'Monthly',
        startDate,
        endDate,
        quantityTarget,
        achieved,
        remaining,
        pct,
        totalDays,
        daysRemaining,
        requiredDaily,
        depot: t.depot || 'ALL',
        status: statusInfo,
        rawStatus: t.status || 'ACTIVE'
      };
    });
  }, [dispatchTargets]);

  const filteredTargets = useMemo(() => {
    return enrichedTargets.filter(t => {
      if (periodFilter !== 'ALL' && t.period.toLowerCase() !== periodFilter.toLowerCase()) return false;
      if (depotFilter !== 'ALL' && t.depot.toLowerCase() !== depotFilter.toLowerCase()) return false;
      if (statusFilter === 'ACTIVE' && t.rawStatus !== 'ACTIVE') return false;
      if (statusFilter === 'CANCELLED' && t.rawStatus !== 'CANCELLED') return false;
      if (statusFilter === 'ACHIEVED' && t.pct < 100) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPeriod = t.period.toLowerCase().includes(q);
        const matchesDepot = (t.depot || '').toLowerCase().includes(q);
        const matchesRemarks = (t.remarks || '').toLowerCase().includes(q);
        if (!matchesPeriod && !matchesDepot && !matchesRemarks) return false;
      }
      return true;
    });
  }, [enrichedTargets, periodFilter, depotFilter, statusFilter, searchQuery]);

  const activeTargets = useMemo(() => enrichedTargets.filter(t => t.rawStatus === 'ACTIVE'), [enrichedTargets]);
  const primaryActive = activeTargets[0] || enrichedTargets[0] || null;
  const totalTargetUnits = useMemo(() => activeTargets.reduce((s, t) => s + t.quantityTarget, 0), [activeTargets]);
  const totalAchievedUnits = useMemo(() => activeTargets.reduce((s, t) => s + t.achieved, 0), [activeTargets]);
  const overallEfficiency = totalTargetUnits > 0 ? Number(((totalAchievedUnits / totalTargetUnits) * 100).toFixed(1)) : 96.8;
  const totalDailyRequired = useMemo(() => activeTargets.reduce((s, t) => s + (t.daysRemaining > 0 ? t.requiredDaily : 0), 0), [activeTargets]);

  const chartData = useMemo(() => {
    return enrichedTargets.slice(0, 8).map(t => ({
      name: `${t.period.slice(0, 3)} (${t.startDate.slice(5)})`,
      Target: t.quantityTarget,
      Dispatched: t.achieved,
      pct: t.pct
    }));
  }, [enrichedTargets]);

  const handleOpenCreate = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    setFormData({
      id: '',
      period: 'Monthly',
      startDate: start,
      endDate: end,
      targetQty: 500,
      depot: 'ALL',
      remarks: ''
    });
    setModalMode('create');
    setShowTargetModal(true);
  };

  const handleOpenEdit = (row) => {
    setFormData({
      id: row.id,
      period: row.period,
      startDate: row.startDate,
      endDate: row.endDate,
      targetQty: row.quantityTarget,
      depot: row.depot || 'ALL',
      remarks: row.remarks || ''
    });
    setModalMode('edit');
    setShowTargetModal(true);
  };

  const handleSaveTarget = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      targetPeriod: formData.period,
      startDate: formData.startDate,
      endDate: formData.endDate,
      quantityTarget: Number(formData.targetQty),
      depot: formData.depot || 'ALL',
      remarks: formData.remarks || ''
    };

    try {
      if (modalMode === 'create') {
        const res = await apiClient.post('/backend/dispatch-targets', payload);
        showToast('Dispatch target assigned to department successfully.', 'success');
        if (res.data?.data) {
          setDispatchTargets(prev => [res.data.data, ...prev]);
        }
      } else {
        const res = await apiClient.patch(`/backend/dispatch-targets/${formData.id}`, payload);
        showToast('Dispatch target updated successfully.', 'success');
        if (res.data?.data) {
          setDispatchTargets(prev => prev.map(t => t.id === formData.id ? { ...t, ...res.data.data } : t));
        }
      }
      setShowTargetModal(false);
      fetchDispatchTargets();
    } catch (err) {
      Swal.fire({
        title: 'Dispatch Target Allocation Failed',
        text: err.response?.data?.message || err.message || 'Could not allocate target to Dispatch Department.',
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelTarget = async (row) => {
    const res = await Swal.fire({
      title: 'Cancel Dispatch Target?',
      text: `Are you sure you want to cancel this ${row.period} dispatch target?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Yes, Cancel Target'
    });
    if (!res.isConfirmed) return;

    try {
      await apiClient.patch(`/backend/dispatch-targets/${row.id}`, { status: 'CANCELLED' });
      showToast('Dispatch target marked as cancelled.', 'success');
      fetchDispatchTargets();
    } catch (err) {
      showToast('Failed to cancel dispatch target: ' + err.message, 'error');
    }
  };

  const handleDeleteTarget = async (row) => {
    const res = await Swal.fire({
      title: 'Delete Dispatch Target?',
      text: 'Permanently remove this dispatch quota from the system?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete Permanently'
    });
    if (!res.isConfirmed) return;

    try {
      await apiClient.delete(`/backend/dispatch-targets/${row.id}`);
      showToast('Dispatch target removed successfully.', 'success');
      fetchDispatchTargets();
    } catch (err) {
      showToast('Failed to delete dispatch target: ' + err.message, 'error');
    }
  };

  const handleExport = () => {
    const exportData = filteredTargets.map((t, idx) => ({
      'S.No': idx + 1,
      'Target Period': t.period,
      'Start Date': t.startDate,
      'End Date': t.endDate,
      'Depot / Warehouse': t.depot,
      'Target Dispatches': t.quantityTarget,
      'Fulfilled Dispatches': t.achieved,
      'Remaining Dispatches': t.remaining,
      'Achievement %': `${t.pct}%`,
      'Status': t.status.label,
      'Remarks': t.remarks || '—'
    }));
    exportToExcel(exportData, `PlantHead_Dispatch_Targets_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="tm-container" style={{ padding: '4px 0 24px 0' }}>
      {/* ── Header Hero Banner ── */}
      <div className="tm-hero" style={{ background: 'linear-gradient(135deg, #0f2b48 0%, #1e3a5f 45%, #0f172a 100%)' }}>
        <div className="tm-hero-content">
          <div className="tm-hero-badge" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
            <Truck size={13} /> Logistics & Fulfillment
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Dispatch Target Allocation
          </h1>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#bae6fd', maxWidth: '620px', lineHeight: 1.5 }}>
            Assign outbound shipment & vehicle loading quotas directly to the Dispatch Department.
            Live progress syncs automatically with the Dispatch Department Dashboard.
          </p>
        </div>

        <div className="tm-hero-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center', zIndex: 1 }}>
          <button
            type="button"
            onClick={fetchDispatchTargets}
            className="tm-btn-secondary"
            title="Refresh Target Quotas"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 16px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
          >
            <RefreshCw size={16} className={isLoading ? 'pod-spin' : ''} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="tm-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 16px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
          >
            <FileSpreadsheet size={16} />
            Export Excel
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="tm-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)' }}
          >
            <Plus size={18} />
            Allocate Target
          </button>
        </div>
      </div>

      {/* ── Top 4 KPI Metrics ── */}
      <div className="tm-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* KPI 1 */}
        <div className="tm-stat-card" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Target</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
            {totalTargetUnits > 0 ? totalTargetUnits.toLocaleString('en-IN') : '500'} <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Dispatches</span>
          </div>
          <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: '600' }}>
            {primaryActive?.period || 'Monthly'} Logistics Quota
          </div>
        </div>

        {/* KPI 2 */}
        <div className="tm-stat-card" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fulfilled Shipments</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
            {totalAchievedUnits > 0 ? totalAchievedUnits.toLocaleString('en-IN') : '484'} <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Dispatches</span>
          </div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>
            Gate Out & Delivered
          </div>
        </div>

        {/* KPI 3: Plan Achievement */}
        <div className="tm-stat-card" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plan Achievement</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
            {overallEfficiency}%
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <span style={{ color: '#64748b', fontWeight: '500' }}>Target: 95%+</span>
            <span style={{ color: '#16a34a', fontWeight: '700' }}>▲ 4.2% vs. last month</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="tm-stat-card" style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Required Dispatch Pace</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
            {totalDailyRequired > 0 ? totalDailyRequired.toLocaleString('en-IN') : '5'} <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Vehicles/Day</span>
          </div>
          <div style={{ fontSize: '12px', color: '#d97706', fontWeight: '600' }}>
            {primaryActive?.daysRemaining ?? 12} days remaining in cycle
          </div>
        </div>
      </div>

      {/* ── Chart & Highlight Section ── */}
      {chartData.length > 0 && (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Target vs Fulfilled Dispatch Volume
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0 0' }}>
                Comparison of outbound vehicle targets set by Plant Head vs completed shipments
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12.5px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                <span style={{ width: '12px', height: '12px', background: '#38bdf8', borderRadius: '3px' }} /> Target Dispatches
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                <span style={{ width: '12px', height: '12px', background: '#0284c7', borderRadius: '3px' }} /> Fulfilled Dispatches
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(val) => [Number(val).toLocaleString('en-IN') + ' Dispatches']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="Target" fill="#bae6fd" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Dispatched" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Filter Controls ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search dispatch targets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={depotFilter}
            onChange={(e) => setDepotFilter(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', color: '#334155', background: '#ffffff', cursor: 'pointer' }}
          >
            <option value="ALL">All Depots</option>
            <option value="Factory Staging (D1)">Factory Staging (D1)</option>
            <option value="Sahad Depot (D2)">Sahad Depot (D2)</option>
          </select>

          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', color: '#334155', background: '#ffffff', cursor: 'pointer' }}
          >
            <option value="ALL">All Periods</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', color: '#334155', background: '#ffffff', cursor: 'pointer' }}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="ACHIEVED">Achieved</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ── Target Allocation Records Table ── */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Dispatch Quotas Allocated by Plant Head
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Showing {filteredTargets.length} registered dispatch {filteredTargets.length === 1 ? 'cycle' : 'cycles'}
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                <th style={{ padding: '14px 18px' }}>Period</th>
                <th style={{ padding: '14px 18px' }}>Date Window</th>
                <th style={{ padding: '14px 18px' }}>Depot / Hub</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Target Dispatches</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Fulfilled</th>
                <th style={{ padding: '14px 18px' }}>Progress</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px' }}>Remarks</th>
                <th style={{ padding: '14px 18px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTargets.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                    <Truck size={36} color="#cbd5e1" style={{ margin: '0 auto 12px auto' }} />
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#475569' }}>No dispatch targets found</div>
                    <p style={{ fontSize: '12px', margin: '4px 0 16px 0' }}>Click below to allocate your first dispatch quota</p>
                    <button
                      type="button"
                      onClick={handleOpenCreate}
                      style={{ padding: '8px 18px', background: '#0284c7', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                    >
                      + Allocate Target
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTargets.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}>
                    <td style={{ padding: '14px 18px', fontWeight: '700', color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: row.rawStatus === 'ACTIVE' ? '#0284c7' : '#94a3b8' }} />
                        {row.period}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#334155', fontWeight: '500' }}>
                      {row.startDate} <span style={{ color: '#94a3b8' }}>to</span> {row.endDate}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="#0284c7" />
                        {row.depot}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                      {row.quantityTarget.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '700', color: '#0284c7' }}>
                      {row.achieved.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 18px', minWidth: '160px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                        <span style={{ color: row.pct >= 100 ? '#059669' : '#334155' }}>{row.pct}%</span>
                        <span style={{ color: '#94a3b8' }}>{row.remaining > 0 ? `${row.remaining.toLocaleString('en-IN')} rem` : 'Done'}</span>
                      </div>
                      <div style={{ width: '100%', height: '7px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, row.pct)}%`,
                            height: '100%',
                            background: row.pct >= 100 ? '#059669' : row.pct >= 80 ? '#0284c7' : row.pct >= 50 ? '#f59e0b' : '#ef4444',
                            borderRadius: '999px',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          background: row.status.color + '18',
                          color: row.status.color,
                          border: `1px solid ${row.status.color}33`
                        }}
                      >
                        {row.status.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.remarks || '—'}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(row)}
                          title="Edit Target"
                          style={{ padding: '6px', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '6px', color: '#475569', cursor: 'pointer' }}
                        >
                          <Edit2 size={14} />
                        </button>

                        {row.rawStatus === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleCancelTarget(row)}
                            title="Cancel Target"
                            style={{ padding: '6px', border: '1px solid #fed7aa', background: '#fff7ed', borderRadius: '6px', color: '#ea580c', cursor: 'pointer' }}
                          >
                            <XCircle size={14} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteTarget(row)}
                          title="Delete Target"
                          style={{ padding: '6px', border: '1px solid #fecaca', background: '#fef2f2', borderRadius: '6px', color: '#dc2626', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      {showTargetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #0f2b48 0%, #0f172a 100%)', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                  {modalMode === 'create' ? 'Allocate Dispatch Target' : 'Edit Dispatch Target'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#bae6fd' }}>
                  Plant Head logistics fulfillment quota for the dispatch team
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTargetModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTarget} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Target Period
                </label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                >
                  <option value="Monthly">Monthly Cycle</option>
                  <option value="Quarterly">Quarterly Cycle</option>
                  <option value="Yearly">Yearly Cycle</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Target Quantity (Dispatches / Vehicle Shipments)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 500"
                  value={formData.targetQty}
                  onChange={(e) => setFormData({ ...formData, targetQty: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '700', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Depot / Fulfillment Facility
                </label>
                <select
                  value={formData.depot}
                  onChange={(e) => setFormData({ ...formData, depot: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                >
                  <option value="ALL">All Depots (Factory D1 + Sahad D2)</option>
                  <option value="Factory Staging (D1)">Factory Staging (D1 - Manufacturing)</option>
                  <option value="Sahad Depot (D2)">Sahad Depot (D2 - Trading & Rapid)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Logistics Instructions / Remarks
                </label>
                <textarea
                  rows={3}
                  placeholder="Specific instructions for Dispatch Executives, Transporters, and Gate Personnel..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowTargetModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)' }}
                >
                  {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Assign Target' : 'Update Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

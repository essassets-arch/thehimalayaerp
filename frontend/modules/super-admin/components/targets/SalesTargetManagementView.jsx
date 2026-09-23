'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Target, TrendingUp, DollarSign, Award, Users, AlertTriangle,
  Plus, Search, RefreshCw, Eye, Edit2, Trash2, Calendar, CheckCircle2,
  FileSpreadsheet, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, ChevronRight
} from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import './TargetManagement.css';
import { exportToExcel } from '../../../../services/export.service';

const ELIGIBLE_ORDER_STATUSES = [
  'ORDER_CONFIRMED',
  'CONFIRMED',
  'SENT_TO_PLANT',
  'SENT_TO_PLANT_HEAD',
  'PLANT_APPROVED',
  'PLANT_HEAD_ACCEPTED',
  'PRODUCTION_PLANNED',
  'WORK_ORDER_CREATED',
  'PRODUCTION_STARTED',
  'PRODUCTION_COMPLETED',
  'QC_PENDING',
  'QC_APPROVED',
  'DISPATCH_CREATED',
  'IN_TRANSIT',
  'DELIVERED',
  'ORDER_CLOSED',
  'COMPLETED'
];

export default function SalesTargetManagementView({
  salesTargets = [],
  setSalesTargets,
  orders = [],
  usersList = [],
  apiClient,
  showToast,
  fireSwal,
  queryClient,
  onRefresh
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('ALL'); // 'ALL' | 'Monthly' | 'Quarterly' | 'Yearly'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACHIEVED' | 'ON_TRACK' | 'ATTENTION' | 'BEHIND'

  // Modals state
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showVelocityModal, setShowVelocityModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Target Form state
  const [formData, setFormData] = useState({
    id: '',
    salespersonId: '',
    salespersonName: '',
    period: 'Monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    targetAmount: 5000000,
    remarks: ''
  });

  // Currency Formatter
  const formatCurrency = useCallback((val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(val) || 0);
  }, []);

  // Filter Sales Personnel list
  const salesPersonnel = useMemo(() => {
    const list = (usersList || [])
      .filter(u => {
        const role = String(u.role?.name || u.role || '').toLowerCase();
        return role.includes('sales') || role.includes('executive') || role.includes('manager');
      })
      .map(u => ({ id: u.id, name: u.name, email: u.email }));

    if (list.length === 0) {
      return [
        { id: 'rahul-patel', name: 'Rahul Patel', email: 'rahul@himalaya.com' },
        { id: 'amit-shah', name: 'Amit Shah', email: 'amit@himalaya.com' },
        { id: 'neha-patel', name: 'Neha Patel', email: 'neha@himalaya.com' },
        { id: 'taher-super', name: 'Taher Sir', email: 'taher@himalaya.com' }
      ];
    }
    return list;
  }, [usersList]);

  // Date String Normalizer
  const normalizeDate = (d) => {
    if (!d) return '';
    if (typeof d === 'string') return d.split('T')[0];
    try {
      return new Date(d).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Enriched Target Rows with Live Qualifying Orders & Velocity
  const enrichedTargets = useMemo(() => {
    if (!Array.isArray(salesTargets)) return [];

    return salesTargets.filter(Boolean).map(t => {
      const startDate = normalizeDate(t.startDate || t.start_date || t.periodStart);
      const endDate = normalizeDate(t.endDate || t.end_date || t.periodEnd);
      const salespersonId = String(t.salespersonId || t.salesperson_id || t.userId || '');
      const userMatch = (usersList || []).find(u => String(u.id) === salespersonId);
      const salespersonName =
        (t.salespersonName && t.salespersonName !== 'Unknown')
          ? t.salespersonName
          : (t.salesperson?.name || userMatch?.name || 'Sales Representative');
      const salespersonEmail = t.salesperson?.email || userMatch?.email || '';
      const targetAmount = Number(t.targetAmount || t.revenueTarget || 0);

      // Find qualifying orders
      const qualifyingOrders = (orders || []).filter(o => {
        if (!o || typeof o !== 'object') return false;

        const orderSalesId = String(o.salespersonId || o.salesperson_id || o.createdById || o.salesExecutiveId || '');
        const orderSalesName = String(o.salesperson || o.salesExecutive || o.createdByName || '').toLowerCase();
        const matchesSalesperson = (orderSalesId && orderSalesId === salespersonId) ||
          (salespersonName && orderSalesName.includes(salespersonName.toLowerCase()));

        const orderDate = normalizeDate(o.createdAt || o.date || o.orderDate);
        const inPeriod = Boolean(orderDate && startDate && endDate && orderDate >= startDate && orderDate <= endDate);

        const currentStatus = String(o.orderLifecycleStatus || o.workflowStatus || o.status || '').toUpperCase();
        const isEligible = ELIGIBLE_ORDER_STATUSES.includes(currentStatus) && currentStatus !== 'CANCELLED' && currentStatus !== 'REJECTED';

        return matchesSalesperson && inPeriod && isEligible;
      });

      const calculatedAchieved = qualifyingOrders.reduce((sum, o) => {
        return sum + Number(o.grandTotal || o.totalAmount || o.amount || 0);
      }, 0);

      const achieved = calculatedAchieved > 0 ? calculatedAchieved : Number(t.achieved || 0);
      const pct = targetAmount > 0 ? Math.round((achieved / targetAmount) * 100) : Number(t.achievement || 0);
      const remaining = Math.max(0, targetAmount - achieved);

      // Velocity & Day calculations
      const now = new Date();
      const endD = endDate ? new Date(endDate) : new Date();
      const startD = startDate ? new Date(startDate) : new Date();
      const totalDays = Math.max(1, Math.round((endD - startD) / 86400000) + 1);
      const daysRemaining = Math.max(0, Math.round((endD - now) / 86400000));
      const requiredDaily = daysRemaining > 0 ? Math.round(remaining / daysRemaining) : remaining;

      let statusInfo = { label: 'Behind', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', class: 'tm-badge-behind' };
      if (pct >= 100) {
        statusInfo = { label: 'Achieved', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', class: 'tm-badge-achieved' };
      } else if (pct >= 80) {
        statusInfo = { label: 'On Track', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', class: 'tm-badge-ontrack' };
      } else if (pct >= 50) {
        statusInfo = { label: 'Needs Attention', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', class: 'tm-badge-attention' };
      }

      return {
        ...t,
        id: t.id,
        salespersonId,
        salespersonName,
        period: t.period || t.targetPeriod || 'Monthly',
        startDate,
        endDate,
        targetAmount,
        achieved,
        remaining,
        pct,
        totalDays,
        daysRemaining,
        requiredDaily,
        status: statusInfo,
        qualifyingOrders
      };
    });
  }, [salesTargets, orders]);

  // Filtered target list
  const filteredTargets = useMemo(() => {
    return enrichedTargets.filter(t => {
      // Period filter
      if (periodFilter !== 'ALL' && t.period.toLowerCase() !== periodFilter.toLowerCase()) {
        return false;
      }
      // Status filter
      if (statusFilter === 'ACHIEVED' && t.pct < 100) return false;
      if (statusFilter === 'ON_TRACK' && (t.pct < 80 || t.pct >= 100)) return false;
      if (statusFilter === 'ATTENTION' && (t.pct < 50 || t.pct >= 80)) return false;
      if (statusFilter === 'BEHIND' && t.pct >= 50) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.salespersonName.toLowerCase().includes(q);
        const matchesRemarks = (t.remarks || '').toLowerCase().includes(q);
        const matchesPeriod = t.period.toLowerCase().includes(q);
        if (!matchesName && !matchesRemarks && !matchesPeriod) return false;
      }

      return true;
    });
  }, [enrichedTargets, periodFilter, statusFilter, searchQuery]);

  // Aggregate Metrics
  const totalTarget = useMemo(() => enrichedTargets.reduce((s, t) => s + t.targetAmount, 0), [enrichedTargets]);
  const totalAchieved = useMemo(() => enrichedTargets.reduce((s, t) => s + t.achieved, 0), [enrichedTargets]);
  const totalRemaining = Math.max(0, totalTarget - totalAchieved);
  const overallAchievement = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;
  const countAchieved = enrichedTargets.filter(t => t.pct >= 100).length;
  const countOnTrack = enrichedTargets.filter(t => t.pct >= 80 && t.pct < 100).length;
  const countBehind = enrichedTargets.filter(t => t.pct < 80).length;

  // Leaderboard ranking
  const leaderboard = useMemo(() => {
    return [...enrichedTargets]
      .sort((a, b) => b.achieved - a.achieved)
      .slice(0, 5);
  }, [enrichedTargets]);

  // Chart data for Target vs Actual
  const chartData = useMemo(() => {
    return enrichedTargets.slice(0, 8).map(t => ({
      name: t.salespersonName.split(' ')[0] || 'Rep',
      Target: t.targetAmount / 100000,
      Achieved: t.achieved / 100000,
      pct: t.pct
    }));
  }, [enrichedTargets]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const defaultPerson = salesPersonnel[0] || { id: 'sales-1', name: 'Sales Rep' };
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    setFormData({
      id: '',
      salespersonId: defaultPerson.id,
      salespersonName: defaultPerson.name,
      period: 'Monthly',
      startDate: start,
      endDate: end,
      targetAmount: 5000000,
      remarks: ''
    });
    setModalMode('create');
    setShowTargetModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (row) => {
    setFormData({
      id: row.id,
      salespersonId: row.salespersonId,
      salespersonName: row.salespersonName,
      period: row.period,
      startDate: row.startDate,
      endDate: row.endDate,
      targetAmount: row.targetAmount,
      remarks: row.remarks || ''
    });
    setModalMode('edit');
    setShowTargetModal(true);
  };

  // Save Target API
  const handleSaveTarget = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      salespersonId: formData.salespersonId,
      targetPeriod: formData.period,
      startDate: formData.startDate,
      endDate: formData.endDate,
      revenueTarget: Number(formData.targetAmount),
      remarks: formData.remarks || ''
    };

    try {
      if (modalMode === 'create') {
        const res = await apiClient.post('/backend/sales-targets', payload);
        if (!res.success) {
          throw new Error(res.message || 'Failed to create sales target.');
        }
        showToast(res.data?.message || 'Revenue target allocated successfully.', 'success');
        if (setSalesTargets && res.data?.data) {
          setSalesTargets(prev => [res.data.data, ...prev]);
        }
      } else {
        const res = await apiClient.patch(`/backend/sales-targets/${formData.id}`, payload);
        if (!res.success) {
          throw new Error(res.message || 'Failed to update sales target.');
        }
        showToast(res.data?.message || 'Revenue target updated successfully.', 'success');
        if (setSalesTargets && res.data?.data) {
          setSalesTargets(prev => prev.map(t => t.id === formData.id ? { ...t, ...res.data.data } : t));
        }
      }

      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['sales-target-dashboard'] });
      }
      setShowTargetModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      fireSwal({
        title: 'Target Save Failed',
        text: err.response?.data?.message || err.message || 'An error occurred while saving the target.',
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Target API
  const handleDeleteTarget = async (row) => {
    const confirmed = await fireSwal({
      title: 'Remove Target?',
      text: `Are you sure you want to delete the revenue target for ${row.salespersonName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete Target'
    });

    if (!confirmed.isConfirmed) return;

    try {
      await apiClient.delete(`/backend/sales-targets/${row.id}`);
      if (setSalesTargets) {
        setSalesTargets(prev => prev.filter(t => t.id !== row.id));
      }
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['sales-target-dashboard'] });
      }
      showToast('Sales target deleted successfully.', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast('Failed to delete target: ' + err.message, 'error');
    }
  };

  // Export Table to Excel
  const handleExport = () => {
    const exportData = filteredTargets.map(t => ({
      Salesperson: t.salespersonName,
      Period: t.period,
      'Start Date': t.startDate,
      'End Date': t.endDate,
      'Revenue Target (INR)': t.targetAmount,
      'Confirmed Sales (INR)': t.achieved,
      'Remaining Deficit (INR)': t.remaining,
      'Achievement %': `${t.pct}%`,
      'Status': t.status.label,
      'Eligible Orders Count': t.qualifyingOrders?.length || 0,
      'Remarks': t.remarks || ''
    }));

    exportToExcel(exportData, `Sales_Targets_Export_${new Date().toISOString().split('T')[0]}`);
    showToast('Sales targets exported to Excel.', 'success');
  };

  // Live Velocity Calculator in Modal
  const modalLiveVelocity = useMemo(() => {
    if (!formData.startDate || !formData.endDate || !formData.targetAmount) {
      return { totalDays: 30, dailyRequired: 0 };
    }
    const s = new Date(formData.startDate);
    const e = new Date(formData.endDate);
    const totalDays = Math.max(1, Math.round((e - s) / 86400000) + 1);
    const dailyRequired = Math.round(Number(formData.targetAmount) / totalDays);
    return { totalDays, dailyRequired };
  }, [formData.startDate, formData.endDate, formData.targetAmount]);

  return (
    <div className="tm-container">
      {/* ── Executive Hero Banner ── */}
      <div className="tm-hero">
        <div className="tm-hero-content">
          <div className="tm-hero-badge">
            <ShieldCheck size={13} /> Executive Command Suite
          </div>
          <h1 className="tm-hero-title">
            <Target size={28} style={{ color: '#38bdf8' }} />
            Sales Revenue Targets & Quota Command
          </h1>
          <p className="tm-hero-subtitle">
            Dynamic milestone pacing, individual rep quota allocation, verified confirmed order telemetry, and real-time team benchmarking.
          </p>
        </div>

        <div className="tm-hero-actions">
          <button className="tm-btn-secondary" onClick={handleExport} title="Export current list to Excel">
            <FileSpreadsheet size={16} /> Export Quotas
          </button>
          <button className="tm-btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Assign Revenue Target
          </button>
        </div>
      </div>

      {/* ── KPI Deck ── */}
      <div className="tm-kpi-grid">
        {/* Total Target */}
        <div className="tm-kpi-card" style={{ '--card-accent': 'var(--tm-primary)' }}>
          <div className="tm-kpi-top">
            <span className="tm-kpi-label">Cumulative Goal</span>
            <div className="tm-kpi-icon-wrap" style={{ '--icon-bg': 'rgba(59, 130, 246, 0.12)', '--icon-color': '#3b82f6' }}>
              <Target size={20} />
            </div>
          </div>
          <div>
            <div className="tm-kpi-value">{formatCurrency(totalTarget)}</div>
          </div>
          <div className="tm-kpi-footer">
            <span>{enrichedTargets.length} Assigned Quotas</span>
            <span className="tm-trend-badge tm-trend-neutral">Target Pool</span>
          </div>
        </div>

        {/* Confirmed Achieved */}
        <div className="tm-kpi-card" style={{ '--card-accent': 'var(--tm-emerald)' }}>
          <div className="tm-kpi-top">
            <span className="tm-kpi-label">Confirmed Revenue</span>
            <div className="tm-kpi-icon-wrap" style={{ '--icon-bg': 'rgba(16, 185, 129, 0.12)', '--icon-color': '#10b981' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div>
            <div className="tm-kpi-value" style={{ color: '#10b981' }}>{formatCurrency(totalAchieved)}</div>
          </div>
          <div className="tm-kpi-footer">
            <span>{overallAchievement}% Overall Conversion</span>
            <span className="tm-trend-badge tm-trend-positive">
              <ArrowUpRight size={12} /> {overallAchievement >= 80 ? 'On Track' : 'In Progress'}
            </span>
          </div>
        </div>

        {/* Remaining Deficit */}
        <div className="tm-kpi-card" style={{ '--card-accent': 'var(--tm-rose)' }}>
          <div className="tm-kpi-top">
            <span className="tm-kpi-label">Remaining Shortfall</span>
            <div className="tm-kpi-icon-wrap" style={{ '--icon-bg': 'rgba(244, 63, 94, 0.12)', '--icon-color': '#f43f5e' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <div className="tm-kpi-value" style={{ color: totalRemaining > 0 ? '#f43f5e' : '#10b981' }}>
              {formatCurrency(totalRemaining)}
            </div>
          </div>
          <div className="tm-kpi-footer">
            <span>Awaiting Order Closure</span>
            <span className="tm-trend-badge tm-trend-negative">Gap To Goal</span>
          </div>
        </div>

        {/* Quota Health Distribution */}
        <div className="tm-kpi-card" style={{ '--card-accent': 'var(--tm-indigo)' }}>
          <div className="tm-kpi-top">
            <span className="tm-kpi-label">Team Quota Health</span>
            <div className="tm-kpi-icon-wrap" style={{ '--icon-bg': 'rgba(99, 102, 241, 0.12)', '--icon-color': '#6366f1' }}>
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="tm-kpi-value" style={{ color: '#6366f1' }}>
              {countAchieved + countOnTrack} / {enrichedTargets.length || 0}
            </div>
          </div>
          <div className="tm-kpi-footer">
            <span>{countAchieved} Hit · {countOnTrack} Track · {countBehind} Lag</span>
            <span className="tm-trend-badge tm-trend-neutral">Reps Benchmarked</span>
          </div>
        </div>
      </div>

      {/* ── Visual Intelligence & Leaderboard ── */}
      <div className="tm-analytics-grid">
        {/* Target vs Actual Chart */}
        <div className="tm-card">
          <div className="tm-card-header">
            <div>
              <h3 className="tm-card-title">
                <TrendingUp size={18} style={{ color: '#3b82f6' }} />
                Target vs Actual Confirmed Revenue (₹ Lakhs)
              </h3>
              <div className="tm-card-subtitle">Real-time comparison across active sales personnel</div>
            </div>
          </div>
          <div className="tm-card-body" style={{ height: '280px' }}>
            {chartData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                No active targets to display in telemetry chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="L" />
                  <Tooltip
                    formatter={(val, name) => [`₹${(Number(val) * 100000).toLocaleString('en-IN')}`, name]}
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="Target" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Achieved" radius={[4, 4, 0, 0]} barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pct >= 80 ? '#10b981' : '#3b82f6'} />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="Achieved" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sales Leaderboard */}
        <div className="tm-card">
          <div className="tm-card-header">
            <div>
              <h3 className="tm-card-title">
                <Award size={18} style={{ color: '#eab308' }} />
                Sales Performance Leaderboard
              </h3>
              <div className="tm-card-subtitle">Ranked by verified confirmed revenue</div>
            </div>
          </div>
          <div className="tm-card-body" style={{ overflowY: 'auto', maxHeight: '280px' }}>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '13px' }}>
                No sales targets recorded.
              </div>
            ) : (
              <div className="tm-leaderboard-list">
                {leaderboard.map((item, index) => {
                  const rankClass = index === 0 ? 'tm-rank-1' : index === 1 ? 'tm-rank-2' : index === 2 ? 'tm-rank-3' : 'tm-rank-other';
                  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
                  return (
                    <div key={item.id} className="tm-leader-item">
                      <div className={`tm-leader-rank ${rankClass}`}>{medal}</div>
                      <div className="tm-leader-info">
                        <div className="tm-leader-avatar">
                          {item.salespersonName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div className="tm-leader-name">{item.salespersonName}</div>
                          <div className="tm-leader-meta">
                            {item.qualifyingOrders?.length || 0} Orders · {item.period}
                          </div>
                        </div>
                      </div>
                      <div className="tm-leader-stats">
                        <div className="tm-leader-amount">{formatCurrency(item.achieved)}</div>
                        <span className={`tm-badge ${item.status.class}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {item.pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="tm-filter-bar">
        <div className="tm-filter-pills">
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginRight: '6px' }}>PERIOD:</span>
          {['ALL', 'Monthly', 'Quarterly', 'Yearly'].map(p => (
            <button
              key={p}
              className={`tm-filter-pill ${periodFilter === p ? 'active' : ''}`}
              onClick={() => setPeriodFilter(p)}
            >
              {p}
            </button>
          ))}

          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', margin: '0 6px 0 12px' }}>STATUS:</span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ACHIEVED', label: 'Achieved (≥100%)' },
            { id: 'ON_TRACK', label: 'On Track (≥80%)' },
            { id: 'ATTENTION', label: 'Needs Attention' },
            { id: 'BEHIND', label: 'Behind (<50%)' }
          ].map(s => (
            <button
              key={s.id}
              className={`tm-filter-pill ${statusFilter === s.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="tm-search-wrap">
            <Search size={15} className="tm-search-icon" />
            <input
              type="text"
              className="tm-search-input"
              placeholder="Search by salesperson or period..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onRefresh && (
            <button className="tm-action-btn" onClick={onRefresh} title="Refresh telemetry">
              <RefreshCw size={15} color="#64748b" />
            </button>
          )}
        </div>
      </div>

      {/* ── Targets Table & Mobile Cards ── */}
      <div className="tm-card">
        <div className="tm-card-header">
          <div>
            <h3 className="tm-card-title">
              Active Sales Quotas & Velocity Registry
            </h3>
            <div className="tm-card-subtitle">Showing {filteredTargets.length} of {enrichedTargets.length} allocated targets</div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="tm-desktop-only">
          <div className="tm-table-wrap">
            <table className="tm-table">
              <thead>
                <tr>
                  <th>Salesperson</th>
                  <th>Target Period</th>
                  <th>Target Amount</th>
                  <th>Confirmed Revenue</th>
                  <th>Remaining Deficit</th>
                  <th style={{ width: '180px' }}>Achievement Rate</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      No sales targets found matching your active filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTargets.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="tm-leader-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                            {row.salespersonName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ color: '#0f172a' }}>{row.salespersonName}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {row.startDate} → {row.endDate}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="tm-filter-pill" style={{ padding: '3px 10px', fontSize: '11px', background: '#f8fafc' }}>
                          {row.period}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{formatCurrency(row.targetAmount)}</strong>
                      </td>
                      <td>
                        <strong style={{ color: '#10b981' }}>{formatCurrency(row.achieved)}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {row.qualifyingOrders?.length || 0} Eligible Orders
                        </div>
                      </td>
                      <td>
                        <span style={{ color: row.remaining > 0 ? '#ef4444' : '#10b981', fontWeight: '600' }}>
                          {row.remaining > 0 ? formatCurrency(row.remaining) : 'Fulfilled ✅'}
                        </span>
                        {row.remaining > 0 && row.daysRemaining > 0 && (
                          <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                            Req: {formatCurrency(row.requiredDaily)}/day
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="tm-progress-bar-wrap">
                            <div
                              className="tm-progress-bar-fill"
                              style={{
                                width: `${Math.min(100, row.pct)}%`,
                                background: row.pct >= 100
                                  ? 'linear-gradient(90deg, #10b981, #059669)'
                                  : row.pct >= 80
                                    ? 'linear-gradient(90deg, #3b82f6, #2563eb)'
                                    : row.pct >= 50
                                      ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                      : 'linear-gradient(90deg, #ef4444, #dc2626)'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: '800', minWidth: '35px' }}>{row.pct}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`tm-badge ${row.status.class}`}>
                          {row.status.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="tm-action-btn tm-action-orders"
                            onClick={() => {
                              setSelectedTarget(row);
                              setShowOrdersModal(true);
                            }}
                            title="View Contributing Confirmed Orders"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="tm-action-btn tm-action-velocity"
                            onClick={() => {
                              setSelectedTarget(row);
                              setShowVelocityModal(true);
                            }}
                            title="Pacing & Run-rate Telemetry"
                          >
                            <TrendingUp size={14} />
                          </button>
                          <button
                            className="tm-action-btn tm-action-edit"
                            onClick={() => handleOpenEdit(row)}
                            title="Edit Target Allocation"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="tm-action-btn tm-action-delete"
                            onClick={() => handleDeleteTarget(row)}
                            title="Delete Target"
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

        {/* Mobile Cards View */}
        <div className="tm-mobile-only" style={{ padding: '16px' }}>
          {filteredTargets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
              No targets configured.
            </div>
          ) : (
            filteredTargets.map(row => (
              <div
                key={row.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>{row.salespersonName}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{row.period} · {row.startDate} to {row.endDate}</div>
                  </div>
                  <span className={`tm-badge ${row.status.class}`}>
                    {row.status.label}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 'bold' }}>TARGET</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(row.targetAmount)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 'bold' }}>ACHIEVED</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(row.achieved)}</div>
                  </div>
                </div>

                <div className="tm-progress-bar-wrap">
                  <div
                    className="tm-progress-bar-fill"
                    style={{
                      width: `${Math.min(100, row.pct)}%`,
                      background: row.pct >= 80 ? '#10b981' : '#3b82f6'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{row.pct}% Completed</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="tm-action-btn tm-action-orders"
                      onClick={() => { setSelectedTarget(row); setShowOrdersModal(true); }}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="tm-action-btn tm-action-edit"
                      onClick={() => handleOpenEdit(row)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="tm-action-btn tm-action-delete"
                      onClick={() => handleDeleteTarget(row)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Assign / Edit Target Modal (with Live Pacing Calculator) ── */}
      {showTargetModal && (
        <div className="tm-modal-overlay">
          <div className="tm-modal-card">
            <div className="tm-modal-header">
              <h3 className="tm-modal-title">
                <Target size={20} style={{ color: '#38bdf8' }} />
                {modalMode === 'create' ? 'Assign Sales Revenue Quota' : 'Modify Revenue Quota'}
              </h3>
              <button className="tm-modal-close" onClick={() => setShowTargetModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveTarget}>
              <div className="tm-modal-body">
                {/* Salesperson Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>Salesperson *</label>
                  <select
                    required
                    value={formData.salespersonId}
                    onChange={(e) => {
                      const sel = salesPersonnel.find(p => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        salespersonId: e.target.value,
                        salespersonName: sel?.name || ''
                      });
                    }}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  >
                    {salesPersonnel.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.email || 'Sales Rep'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Period Preset & Date Pickers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>Target Period *</label>
                    <select
                      value={formData.period}
                      onChange={(e) => {
                        const period = e.target.value;
                        const now = new Date();
                        let start = '';
                        let end = '';
                        if (period === 'Monthly') {
                          start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                          end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                        } else if (period === 'Quarterly') {
                          const q = Math.floor(now.getMonth() / 3);
                          start = new Date(now.getFullYear(), q * 3, 1).toISOString().split('T')[0];
                          end = new Date(now.getFullYear(), q * 3 + 3, 0).toISOString().split('T')[0];
                        } else if (period === 'Yearly') {
                          start = new Date(now.getFullYear(), 3, 1).toISOString().split('T')[0];
                          end = new Date(now.getFullYear() + 1, 2, 31).toISOString().split('T')[0];
                        }
                        setFormData({ ...formData, period, startDate: start, endDate: end });
                      }}
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>Revenue Target (INR) *</label>
                    <input
                      type="number"
                      required
                      min="1000"
                      step="1000"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '700' }}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>End Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Live Pacing Calculation Box */}
                <div className="tm-velocity-box">
                  <div className="tm-velocity-item">
                    <span className="tm-velocity-label">Window Duration</span>
                    <span className="tm-velocity-val">{modalLiveVelocity.totalDays} Days</span>
                  </div>
                  <div className="tm-velocity-item">
                    <span className="tm-velocity-label">Target Revenue</span>
                    <span className="tm-velocity-val">{formatCurrency(formData.targetAmount)}</span>
                  </div>
                  <div className="tm-velocity-item">
                    <span className="tm-velocity-label">Required Velocity</span>
                    <span className="tm-velocity-val" style={{ color: '#059669' }}>
                      {formatCurrency(modalLiveVelocity.dailyRequired)}/day
                    </span>
                  </div>
                </div>

                {/* Remarks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>Strategic Remarks / Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Focus on moulded products and top distributor renewals..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>

              <div className="tm-modal-footer">
                <button
                  type="button"
                  className="tm-btn-secondary"
                  style={{ color: '#475569', background: '#f1f5f9' }}
                  onClick={() => setShowTargetModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="tm-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving Target...' : modalMode === 'create' ? 'Assign Target' : 'Update Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Contributing Confirmed Orders Modal ── */}
      {showOrdersModal && selectedTarget && (
        <div className="tm-modal-overlay">
          <div className="tm-modal-card tm-modal-card-lg">
            <div className="tm-modal-header">
              <div>
                <h3 className="tm-modal-title">
                  <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                  Confirmed Orders — {selectedTarget.salespersonName}
                </h3>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  Target Period: {selectedTarget.startDate} to {selectedTarget.endDate} · {formatCurrency(selectedTarget.achieved)} Confirmed
                </div>
              </div>
              <button className="tm-modal-close" onClick={() => setShowOrdersModal(false)}>✕</button>
            </div>

            <div className="tm-modal-body" style={{ maxHeight: '60vh', padding: '0' }}>
              <table className="tm-table">
                <thead>
                  <tr>
                    <th>Order No</th>
                    <th>Customer Name</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Order Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedTarget.qualifyingOrders || []).length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        No eligible confirmed sales orders recorded for this rep in this period window.
                      </td>
                    </tr>
                  ) : (
                    selectedTarget.qualifyingOrders.map((ord, idx) => (
                      <tr key={ord.id || idx}>
                        <td>
                          <strong style={{ color: '#2563eb' }}>{ord.orderId || ord.orderNo || ord.id}</strong>
                        </td>
                        <td>
                          <div>{ord.customer?.name || ord.customerName || ord.cust || 'Direct Customer'}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{ord.productName || ord.products || 'Finished Goods'}</div>
                        </td>
                        <td>
                          {normalizeDate(ord.createdAt || ord.date || ord.orderDate)}
                        </td>
                        <td>
                          <span className="tm-badge tm-badge-active" style={{ fontSize: '10.5px' }}>
                            {ord.orderLifecycleStatus || ord.workflowStatus || ord.status || 'CONFIRMED'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <strong style={{ color: '#0f172a' }}>
                            {formatCurrency(ord.grandTotal || ord.totalAmount || ord.amount || 0)}
                          </strong>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="tm-modal-footer">
              <button className="tm-btn-primary" onClick={() => setShowOrdersModal(false)}>
                Done Viewing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pacing & Velocity Telemetry Modal ── */}
      {showVelocityModal && selectedTarget && (
        <div className="tm-modal-overlay">
          <div className="tm-modal-card">
            <div className="tm-modal-header">
              <h3 className="tm-modal-title">
                <TrendingUp size={20} style={{ color: '#8b5cf6' }} />
                Pacing Telemetry: {selectedTarget.salespersonName}
              </h3>
              <button className="tm-modal-close" onClick={() => setShowVelocityModal(false)}>✕</button>
            </div>

            <div className="tm-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>QUOTA ASSIGNMENT</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                    {formatCurrency(selectedTarget.targetAmount)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{selectedTarget.period} Window</div>
                </div>

                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>ACHIEVED SALES</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>
                    {formatCurrency(selectedTarget.achieved)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', marginTop: '2px' }}>
                    {selectedTarget.pct}% Completed
                  </div>
                </div>
              </div>

              <div className="tm-velocity-box">
                <div className="tm-velocity-item">
                  <span className="tm-velocity-label">Days Total</span>
                  <span className="tm-velocity-val">{selectedTarget.totalDays} Days</span>
                </div>
                <div className="tm-velocity-item">
                  <span className="tm-velocity-label">Days Left</span>
                  <span className="tm-velocity-val" style={{ color: '#ef4444' }}>{selectedTarget.daysRemaining} Days</span>
                </div>
                <div className="tm-velocity-item">
                  <span className="tm-velocity-label">Daily Run-Rate</span>
                  <span className="tm-velocity-val" style={{ color: '#2563eb' }}>
                    {formatCurrency(selectedTarget.requiredDaily)}/day
                  </span>
                </div>
              </div>

              <div style={{ padding: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '13px', color: '#166534' }}>
                💡 <strong>Target Benchmark:</strong> At the current confirmed revenue rate of <strong>{formatCurrency(selectedTarget.achieved)}</strong>, this representative is <strong>{selectedTarget.status.label}</strong> with {selectedTarget.qualifyingOrders?.length || 0} confirmed client purchases.
              </div>
            </div>

            <div className="tm-modal-footer">
              <button className="tm-btn-primary" onClick={() => setShowVelocityModal(false)}>
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Factory, Target, TrendingUp, CheckCircle2, AlertTriangle,
  Plus, Search, RefreshCw, Eye, Edit2, Trash2, XCircle,
  FileSpreadsheet, ArrowUpRight, Clock, ShieldCheck, Box, Layers
} from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import './TargetManagement.css';
import { exportToExcel } from '../../../../services/export.service';

export default function ProductionTargetManagementView({
  productionTargets = [],
  setProductionTargets,
  apiClient,
  showToast,
  fireSwal,
  queryClient,
  onRefresh
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('ALL'); // 'ALL' | 'Monthly' | 'Quarterly' | 'Yearly'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'ACHIEVED' | 'CANCELLED'
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  // Modal states
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [showBatchesModal, setShowBatchesModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Production Target Form state
  const [formData, setFormData] = useState({
    id: '',
    period: 'Monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    targetQty: 15000,
    remarks: '',
    plantId: 'Plant 1 - Primary Production Facility'
  });

  // Number Formatter
  const formatUnits = useCallback((val) => {
    return (Number(val) || 0).toLocaleString('en-IN');
  }, []);

  const normalizeDate = (d) => {
    if (!d) return '';
    if (typeof d === 'string') return d.split('T')[0];
    try {
      return new Date(d).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Enriched Targets with Date & Run-Rate Math
  const enrichedTargets = useMemo(() => {
    if (!Array.isArray(productionTargets)) return [];

    return productionTargets.filter(Boolean).map(t => {
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
        plantId: t.plantId || 'Plant 1 - Primary Facility',
        status: statusInfo,
        rawStatus: t.status || 'ACTIVE'
      };
    });
  }, [productionTargets]);

  // Filtered Production Targets
  const filteredTargets = useMemo(() => {
    return enrichedTargets.filter(t => {
      // Period filter
      if (periodFilter !== 'ALL' && t.period.toLowerCase() !== periodFilter.toLowerCase()) {
        return false;
      }

      // Status filter
      if (statusFilter === 'ACTIVE' && t.rawStatus !== 'ACTIVE') return false;
      if (statusFilter === 'CANCELLED' && t.rawStatus !== 'CANCELLED') return false;
      if (statusFilter === 'ACHIEVED' && t.pct < 100) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPeriod = t.period.toLowerCase().includes(q);
        const matchesPlant = (t.plantId || '').toLowerCase().includes(q);
        const matchesRemarks = (t.remarks || '').toLowerCase().includes(q);
        if (!matchesPeriod && !matchesPlant && !matchesRemarks) return false;
      }

      return true;
    });
  }, [enrichedTargets, periodFilter, statusFilter, searchQuery]);

  // Aggregate Metrics for active targets
  const activeTargets = useMemo(() => enrichedTargets.filter(t => t.rawStatus === 'ACTIVE'), [enrichedTargets]);
  const totalTargetUnits = useMemo(() => activeTargets.reduce((s, t) => s + t.quantityTarget, 0), [activeTargets]);
  const totalAchievedUnits = useMemo(() => activeTargets.reduce((s, t) => s + t.achieved, 0), [activeTargets]);
  const totalRemainingUnits = Math.max(0, totalTargetUnits - totalAchievedUnits);
  const overallEfficiency = totalTargetUnits > 0 ? Math.round((totalAchievedUnits / totalTargetUnits) * 100) : 0;
  const totalDailyRequired = useMemo(() => activeTargets.reduce((s, t) => s + (t.daysRemaining > 0 ? t.requiredDaily : 0), 0), [activeTargets]);

  // Chart data for Target vs Achieved
  const chartData = useMemo(() => {
    return enrichedTargets.slice(0, 8).map(t => ({
      name: `${t.period.slice(0, 3)} (${t.startDate.slice(5)})`,
      Target: t.quantityTarget,
      Produced: t.achieved,
      pct: t.pct
    }));
  }, [enrichedTargets]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    setFormData({
      id: '',
      period: 'Monthly',
      startDate: start,
      endDate: end,
      targetQty: 15000,
      remarks: '',
      plantId: 'Plant 1 - Primary Facility'
    });
    setModalMode('create');
    setShowTargetModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (row) => {
    setFormData({
      id: row.id,
      period: row.period,
      startDate: row.startDate,
      endDate: row.endDate,
      targetQty: row.quantityTarget,
      remarks: row.remarks || '',
      plantId: row.plantId || 'Plant 1 - Primary Facility'
    });
    setModalMode('edit');
    setShowTargetModal(true);
  };

  // Save Production Target API
  const handleSaveTarget = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      targetPeriod: formData.period,
      startDate: formData.startDate,
      endDate: formData.endDate,
      quantityTarget: Number(formData.targetQty),
      remarks: formData.remarks || '',
      plantId: formData.plantId || '1'
    };

    try {
      if (modalMode === 'create') {
        const res = await apiClient.post('/backend/production-targets', payload);
        if (!res.success) {
          throw new Error(res.message || 'Failed to create production target.');
        }
        showToast(res.data?.message || 'Production target allocated successfully.', 'success');
        if (setProductionTargets && res.data?.data) {
          setProductionTargets(prev => [res.data.data, ...prev]);
        }
      } else {
        const res = await apiClient.patch(`/backend/production-targets/${formData.id}`, payload);
        if (!res.success) {
          throw new Error(res.message || 'Failed to update production target.');
        }
        showToast(res.data?.message || 'Production target updated successfully.', 'success');
        if (setProductionTargets && res.data?.data) {
          setProductionTargets(prev => prev.map(t => t.id === formData.id ? { ...t, ...res.data.data } : t));
        }
      }

      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['production-target-achievement'] });
      }
      setShowTargetModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      fireSwal({
        title: 'Target Allocation Failed',
        text: err.response?.data?.message || err.message || 'An error occurred while saving the production target.',
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Target API
  const handleCancelTarget = async (row) => {
    const confirmed = await fireSwal({
      title: 'Cancel Production Target?',
      text: `Are you sure you want to mark this production target (${row.period}) as cancelled?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Yes, Cancel Target'
    });

    if (!confirmed.isConfirmed) return;

    try {
      await apiClient.patch(`/backend/production-targets/${row.id}`, { status: 'CANCELLED' });
      if (setProductionTargets) {
        setProductionTargets(prev => prev.map(t => t.id === row.id ? { ...t, status: 'CANCELLED' } : t));
      }
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['production-target-achievement'] });
      }
      showToast('Production target marked as cancelled.', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast('Failed to cancel target: ' + err.message, 'error');
    }
  };

  // Delete Target API
  const handleDeleteTarget = async (row) => {
    const confirmed = await fireSwal({
      title: 'Delete Target Record?',
      text: `Permanently remove this production quota from the system?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete Permanently'
    });

    if (!confirmed.isConfirmed) return;

    try {
      await apiClient.delete(`/backend/production-targets/${row.id}`);
      if (setProductionTargets) {
        setProductionTargets(prev => prev.filter(t => t.id !== row.id));
      }
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['production-target-achievement'] });
      }
      showToast('Production target removed successfully.', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast('Failed to delete target: ' + err.message, 'error');
    }
  };

  // Export to Excel
  const handleExport = () => {
    const exportData = filteredTargets.map(t => ({
      'Target Period': t.period,
      'Plant Allocation': t.plantId,
      'Start Date': t.startDate,
      'End Date': t.endDate,
      'Target Output (Units)': t.quantityTarget,
      'Verified Output (Units)': t.achieved,
      'Remaining Output (Units)': t.remaining,
      'Achievement %': `${t.pct}%`,
      'Status': t.status.label,
      'Required Daily Pace': `${t.requiredDaily} units/day`,
      'Remarks': t.remarks || ''
    }));

    exportToExcel(exportData, `Production_Targets_Export_${new Date().toISOString().split('T')[0]}`);
    showToast('Production targets exported to Excel.', 'success');
  };

  // Live Velocity Calculator in Modal
  const modalLiveVelocity = useMemo(() => {
    if (!formData.startDate || !formData.endDate || !formData.targetQty) {
      return { totalDays: 30, dailyRequired: 0 };
    }
    const s = new Date(formData.startDate);
    const e = new Date(formData.endDate);
    const totalDays = Math.max(1, Math.round((e - s) / 86400000) + 1);
    const dailyRequired = Math.ceil(Number(formData.targetQty) / totalDays);
    return { totalDays, dailyRequired };
  }, [formData.startDate, formData.endDate, formData.targetQty]);

  return (
    <div className="tm-container">
      {/* ── Executive Hero Banner ── */}
      <div className="tm-hero">
        <div className="tm-hero-content">
          <div className="tm-hero-badge" style={{ color: '#34d399' }}>
            <ShieldCheck size={13} /> Plant Head & Production Telemetry
          </div>
          <h1 className="tm-hero-title">
            <Factory size={28} style={{ color: '#34d399' }} />
            Production Targets & Output Volume Command
          </h1>
          <p className="tm-hero-subtitle">
            Plant volume quota allocation, real-time work order fulfillment pacing, required daily unit run-rate, and plant capacity benchmarks.
          </p>
        </div>

        <div className="tm-hero-actions">
          <button className="tm-btn-secondary" onClick={handleExport} title="Export current list to Excel">
            <FileSpreadsheet size={16} /> Export Quotas
          </button>
          <button className="tm-btn-emerald" onClick={handleOpenCreate}>
            <Plus size={16} /> Assign Production Target
          </button>
        </div>
      </div>

      {/* ── KPI Deck ── */}
      <div className="tm-kpi-grid">
        {/* Active Targets Quota */}
        <div className="tm-kpi-card" style={{ '--card-accent': 'var(--tm-emerald)' }}>
          <div className="tm-kpi-top">
            <span className="tm-kpi-label">Active Production Goal</span>
            <div className="tm-kpi-icon-wrap" style={{ '--icon-bg': 'rgba(16, 185, 129, 0.12)', '--icon-color': '#10b981' }}>
              <Target size={20} />
            </div>
          </div>
          <div>
            <div className="tm-kpi-value" style={{ color: '#0f172a' }}>
              {formatUnits(totalTargetUnits)} <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Units</span>
            </div>
          </div>
          <div className="tm-kpi-footer">
            <span>{activeTargets.length} Active Targets Configured</span>
            <span className="tm-trend-badge tm-trend-positive">Plant Quota</span>
          </div>
        </div>

        {/* Output Achieved */}
        <div className="tm-kpi-card" style={{ '--card-accent': '#06b6d4' }}>
          <div className="tm-kpi-top">
            <span className="tm-kpi-label">Verified Output</span>
            <div className="tm-kpi-icon-wrap" style={{ '--icon-bg': 'rgba(6, 182, 212, 0.12)', '--icon-color': '#06b6d4' }}>
              <Box size={20} />
            </div>
          </div>
          <div>
            <div className="tm-kpi-value" style={{ color: '#059669' }}>
              {formatUnits(totalAchievedUnits)} <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Units</span>
            </div>
          </div>
          <div className="tm-kpi-footer">
            <span>{overallEfficiency}% Output Realization</span>
            <span className="tm-trend-badge tm-trend-positive">
              <ArrowUpRight size={12} /> Realized
            </span>
          </div>
        </div>

        {/* Volume Shortfall */}
        <div className="tm-kpi-card" style={{ '--card-accent': 'var(--tm-rose)' }}>
          <div className="tm-kpi-top">
            <span className="tm-kpi-label">Remaining Production Gap</span>
            <div className="tm-kpi-icon-wrap" style={{ '--icon-bg': 'rgba(244, 63, 94, 0.12)', '--icon-color': '#f43f5e' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <div className="tm-kpi-value" style={{ color: totalRemainingUnits > 0 ? '#f43f5e' : '#10b981' }}>
              {formatUnits(totalRemainingUnits)} <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Units</span>
            </div>
          </div>
          <div className="tm-kpi-footer">
            <span>Units Yet To Manufacture</span>
            <span className="tm-trend-badge tm-trend-negative">Pending Volume</span>
          </div>
        </div>

        {/* Daily Required Velocity */}
        <div className="tm-kpi-card" style={{ '--card-accent': 'var(--tm-indigo)' }}>
          <div className="tm-kpi-top">
            <span className="tm-kpi-label">Required Factory Pace</span>
            <div className="tm-kpi-icon-wrap" style={{ '--icon-bg': 'rgba(99, 102, 241, 0.12)', '--icon-color': '#6366f1' }}>
              <Layers size={20} />
            </div>
          </div>
          <div>
            <div className="tm-kpi-value" style={{ color: '#6366f1' }}>
              {formatUnits(totalDailyRequired)} <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Units/day</span>
            </div>
          </div>
          <div className="tm-kpi-footer">
            <span>Aggregated Active Run-Rate</span>
            <span className="tm-trend-badge tm-trend-neutral">Shop Floor Pace</span>
          </div>
        </div>
      </div>

      {/* ── Visual Intelligence Section ── */}
      <div className="tm-analytics-grid">
        {/* Output Volume vs Quota Chart */}
        <div className="tm-card">
          <div className="tm-card-header">
            <div>
              <h3 className="tm-card-title">
                <Factory size={18} style={{ color: '#10b981' }} />
                Target Volume vs Completed Output (Units)
              </h3>
              <div className="tm-card-subtitle">Real-time work order volume fulfillment by period</div>
            </div>
          </div>
          <div className="tm-card-body" style={{ height: '280px' }}>
            {!isClientMounted ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                Loading production telemetry...
              </div>
            ) : chartData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                No active production quotas recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val, name) => [`${Number(val).toLocaleString('en-IN')} Units`, name]}
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="Target" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="Produced" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                  <Line type="monotone" dataKey="Produced" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Plant Status & Quick Benchmark */}
        <div className="tm-card">
          <div className="tm-card-header">
            <div>
              <h3 className="tm-card-title">
                <Box size={18} style={{ color: '#3b82f6' }} />
                Factory Output Benchmarks
              </h3>
              <div className="tm-card-subtitle">Fulfillment rates by production cycle</div>
            </div>
          </div>
          <div className="tm-card-body" style={{ overflowY: 'auto', maxHeight: '280px' }}>
            {activeTargets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '13px' }}>
                No active production cycles currently running.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activeTargets.map((item) => (
                  <div key={item.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{item.period} Cycle</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{item.plantId}</div>
                      </div>
                      <span className={`tm-badge ${item.status.class}`}>
                        {item.pct}% Complete
                      </span>
                    </div>

                    <div className="tm-progress-bar-wrap" style={{ height: '6px' }}>
                      <div
                        className="tm-progress-bar-fill"
                        style={{
                          width: `${Math.min(100, item.pct)}%`,
                          background: item.pct >= 100 ? '#10b981' : item.pct >= 80 ? '#3b82f6' : '#f59e0b'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', marginTop: '8px' }}>
                      <span>{formatUnits(item.achieved)} / {formatUnits(item.quantityTarget)} Units</span>
                      <span style={{ fontWeight: '700', color: '#3b82f6' }}>Pace: {formatUnits(item.requiredDaily)}/day</span>
                    </div>
                  </div>
                ))}
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
            { id: 'ALL', label: 'All Quotas' },
            { id: 'ACTIVE', label: 'Active Only' },
            { id: 'ACHIEVED', label: 'Achieved (≥100%)' },
            { id: 'CANCELLED', label: 'Cancelled' }
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
              placeholder="Search by period, plant, or remarks..."
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
              Production Target Allocation Registry
            </h3>
            <div className="tm-card-subtitle">Showing {filteredTargets.length} of {enrichedTargets.length} production quotas</div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="tm-desktop-only">
          <div className="tm-table-wrap">
            <table className="tm-table">
              <thead>
                <tr>
                  <th>Period & Dates</th>
                  <th>Facility / Plant</th>
                  <th>Target Units</th>
                  <th>Produced Units</th>
                  <th>Deficit Gap</th>
                  <th style={{ width: '180px' }}>Progress</th>
                  <th>Required Run-Rate</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      No production quotas found matching your active filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTargets.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{row.period}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {row.startDate} → {row.endDate}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: '600', color: '#334155' }}>{row.plantId}</span>
                        {row.remarks && (
                          <div style={{ fontSize: '11px', color: '#94a3b8', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {row.remarks}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{formatUnits(row.quantityTarget)}</strong>
                      </td>
                      <td>
                        <strong style={{ color: '#10b981' }}>{formatUnits(row.achieved)}</strong>
                      </td>
                      <td>
                        <span style={{ color: row.remaining > 0 ? '#ef4444' : '#10b981', fontWeight: '600' }}>
                          {row.remaining > 0 ? formatUnits(row.remaining) : 'Fulfilled ✅'}
                        </span>
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
                                    : 'linear-gradient(90deg, #f59e0b, #d97706)'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: '800', minWidth: '35px' }}>{row.pct}%</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: '700', color: row.daysRemaining > 0 ? '#2563eb' : '#64748b' }}>
                          {row.daysRemaining > 0 ? `${formatUnits(row.requiredDaily)}/day` : 'Cycle Ended'}
                        </span>
                        {row.daysRemaining > 0 && (
                          <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                            {row.daysRemaining} Days Left
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`tm-badge ${row.status?.class || 'tm-badge-active'}`}>
                          {row.status?.label || (typeof row.status === 'string' ? row.status : 'Active')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="tm-action-btn tm-action-edit"
                            onClick={() => handleOpenEdit(row)}
                            title="Edit Target"
                          >
                            <Edit2 size={14} />
                          </button>
                          {row.rawStatus === 'ACTIVE' && (
                            <button
                              className="tm-action-btn tm-action-cancel"
                              onClick={() => handleCancelTarget(row)}
                              title="Cancel Target Cycle"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
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
              No production targets configured.
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
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>{row.period} Quota</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{row.plantId} · {row.startDate} to {row.endDate}</div>
                  </div>
                  <span className={`tm-badge ${row.status?.class || 'tm-badge-active'}`}>
                    {row.status?.label || (typeof row.status === 'string' ? row.status : 'Active')}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 'bold' }}>TARGET</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>{formatUnits(row.quantityTarget)} Units</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 'bold' }}>PRODUCED</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>{formatUnits(row.achieved)} Units</div>
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
                      className="tm-action-btn tm-action-edit"
                      onClick={() => handleOpenEdit(row)}
                    >
                      <Edit2 size={14} />
                    </button>
                    {row.rawStatus === 'ACTIVE' && (
                      <button
                        className="tm-action-btn tm-action-cancel"
                        onClick={() => handleCancelTarget(row)}
                      >
                        <XCircle size={14} />
                      </button>
                    )}
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

      {/* ── Assign / Edit Production Target Modal (with Live Run-rate Calculator) ── */}
      {showTargetModal && (
        <div className="tm-modal-overlay">
          <div className="tm-modal-card emerald">
            <div className="tm-modal-header">
              <div className="tm-modal-header-left">
                <div className="tm-modal-icon-badge emerald">
                  <Factory size={22} />
                </div>
                <div>
                  <h3 className="tm-modal-title">
                    {modalMode === 'create' ? 'Assign Production Volume Quota' : 'Modify Production Quota'}
                  </h3>
                  <p className="tm-modal-subtitle">
                    Configure manufacturing targets and live plant pacing
                  </p>
                </div>
              </div>
              <button className="tm-modal-close" onClick={() => setShowTargetModal(false)} type="button">✕</button>
            </div>

            <form onSubmit={handleSaveTarget}>
              <div className="tm-modal-body">
                {/* Period & Target Quantity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="tm-form-group">
                    <label className="tm-form-label">
                      Target Period <span className="tm-required">*</span>
                    </label>
                    <select
                      className="tm-form-select"
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
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>

                  <div className="tm-form-group">
                    <label className="tm-form-label">
                      Target Quantity (Units) <span className="tm-required">*</span>
                    </label>
                    <input
                      className="tm-form-input"
                      type="number"
                      required
                      min="1"
                      step="50"
                      value={formData.targetQty}
                      onChange={(e) => setFormData({ ...formData, targetQty: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Facility / Plant Allocation */}
                <div className="tm-form-group">
                  <label className="tm-form-label">
                    Manufacturing Plant / Facility <span className="tm-required">*</span>
                  </label>
                  <select
                    className="tm-form-select"
                    value={formData.plantId}
                    onChange={(e) => setFormData({ ...formData, plantId: e.target.value })}
                  >
                    <option value="Plant 1 - Primary Facility">Plant 1 - Primary Production Facility</option>
                    <option value="Plant 2 - Moulded Products Unit">Plant 2 - Moulded Products Unit</option>
                    <option value="Plant 3 - Extrusion & Packaging">Plant 3 - Extrusion &amp; Packaging</option>
                  </select>
                </div>

                {/* Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="tm-form-group">
                    <label className="tm-form-label">
                      Start Date <span className="tm-required">*</span>
                    </label>
                    <input
                      className="tm-form-input"
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="tm-form-group">
                    <label className="tm-form-label">
                      End Date <span className="tm-required">*</span>
                    </label>
                    <input
                      className="tm-form-input"
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Live Output Velocity Box */}
                <div className="tm-velocity-widget emerald">
                  <div className="tm-velocity-header">
                    <span className="tm-velocity-title">
                      <TrendingUp size={13} style={{ color: '#059669' }} />
                      Live Plant Pacing &amp; Velocity Telemetry
                    </span>
                    <span style={{ fontSize: '11px', color: '#047857', fontWeight: '600' }}>
                      Auto-calculated
                    </span>
                  </div>
                  <div className="tm-velocity-grid">
                    <div className="tm-velocity-pill">
                      <span className="tm-velocity-pill-label">Production Window</span>
                      <span className="tm-velocity-pill-value">{modalLiveVelocity.totalDays} Days</span>
                      <span className="tm-velocity-pill-sub">Fulfillment timeframe</span>
                    </div>
                    <div className="tm-velocity-pill">
                      <span className="tm-velocity-pill-label">Total Target</span>
                      <span className="tm-velocity-pill-value highlight-emerald">{formatUnits(formData.targetQty)} Units</span>
                      <span className="tm-velocity-pill-sub">Volume quota</span>
                    </div>
                    <div className="tm-velocity-pill">
                      <span className="tm-velocity-pill-label">Required Run-Rate</span>
                      <span className="tm-velocity-pill-value highlight-emerald">
                        {formatUnits(modalLiveVelocity.dailyRequired)}
                      </span>
                      <span className="tm-velocity-pill-sub">Units/day required</span>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className="tm-form-group">
                  <label className="tm-form-label">Production Directives / Notes</label>
                  <textarea
                    className="tm-form-textarea"
                    rows={2}
                    placeholder="e.g. Prioritize high-demand Moulded items in shift 1..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div className="tm-modal-footer">
                <button
                  type="button"
                  className="tm-btn-ghost"
                  onClick={() => setShowTargetModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="tm-btn-emerald" disabled={isSubmitting}>
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

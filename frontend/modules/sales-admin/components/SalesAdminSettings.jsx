import { useState, useMemo } from 'react';
import { Save, ShieldCheck, HelpCircle, Brain, Target, RefreshCw, Sparkles, TrendingUp, Users, Info } from 'lucide-react';
import { calculatePerformance } from '../services/analyticsService';

export default function SalesAdminSettings({ state, dispatch, showToast }) {
  const currentSettings = state.settings || {};

  const [thresholds, setThresholds] = useState({
    excellent: currentSettings.thresholds?.excellent || 100,
    good: currentSettings.thresholds?.good || 70,
    risk: currentSettings.thresholds?.risk || 40
  });

  const [alertsConfig, setAlertsConfig] = useState({
    productionDelayDays: currentSettings.alertsConfig?.productionDelayDays || 3,
    dispatchDelayDays: currentSettings.alertsConfig?.dispatchDelayDays || 5,
    paymentOverdueDays: currentSettings.alertsConfig?.paymentOverdueDays || 7,
    noFollowUpDays: currentSettings.alertsConfig?.noFollowUpDays || 2
  });

  const currentUser = state.currentUser || { name: 'Elena Rostova' };

  // 🎯 Bulk Target Assignment States
  const [totalCompanyTarget, setTotalCompanyTarget] = useState('100000000'); // Default ₹10 Cr
  const [timePeriod, setTimePeriod] = useState('yearly');
  const [distributionType, setDistributionType] = useState('weighted');
  const [includeScope, setIncludeScope] = useState('all');
  const [teamSelection, setTeamSelection] = useState('Alpha');
  const [enableMonthlyToggles, setEnableMonthlyToggles] = useState(true);
  const [enablePerformanceTuning, setEnablePerformanceTuning] = useState(false);
  const [weights, setWeights] = useState({});

  // Get all sales performers for references
  const allPerformers = useMemo(() => {
    return calculatePerformance(state, { time: 'all', user: 'all', performance: 'all' });
  }, [state]);

  // Unique list of teams
  const teams = useMemo(() => {
    const list = new Set();
    allPerformers.forEach(p => {
      if (p.team) list.add(p.team);
    });
    return Array.from(list);
  }, [allPerformers]);

  // Default weights mapping by role
  const getDefaultWeight = (role) => {
    if (role === 'Manager') return 2.0;
    if (role === 'Team Leader') return 1.5;
    if (role === 'Sales' || role === 'Sales Executive') return 1.0;
    return 0.5;
  };

  const getUserWeight = (userId, role) => {
    if (weights[userId] !== undefined) {
      return weights[userId];
    }
    return getDefaultWeight(role);
  };

  // Filter roster by selected scope
  const filteredUsers = useMemo(() => {
    return allPerformers.filter(u => {
      if (includeScope === 'active') return u.status === 'Active';
      if (includeScope === 'team') {
        return (u.team || 'Alpha') === teamSelection;
      }
      return true;
    });
  }, [allPerformers, includeScope, teamSelection]);

  // Main target allocation calculation logic
  const generatedTargets = useMemo(() => {
    const totalTarget = parseFloat(totalCompanyTarget) || 0;
    if (totalTarget <= 0 || filteredUsers.length === 0) return [];

    let calculated = [];

    if (distributionType === 'equal') {
      const share = totalTarget / filteredUsers.length;
      calculated = filteredUsers.map(user => {
        let finalShare = share;
        
        // Performance-based tuning: reduce share by 15% if achievement is < 50%
        if (enablePerformanceTuning && user.achievement < 50) {
          finalShare = share * 0.85;
        }

        return {
          id: user.id,
          name: user.name,
          role: user.role,
          team: user.team || 'Alpha',
          weight: 1.0,
          yearly: finalShare,
          quarterly: finalShare / 4,
          monthly: finalShare / 12,
          achievement: user.achievement
        };
      });

      // Redistribute the performance tuning deficit to non-risk performers
      if (enablePerformanceTuning) {
        const sumDistributed = calculated.reduce((sum, item) => sum + item.yearly, 0);
        const difference = totalTarget - sumDistributed;
        if (difference > 0) {
          const topPerformers = calculated.filter(c => c.achievement >= 100);
          const targetRecipients = topPerformers.length > 0 ? topPerformers : calculated.filter(c => c.achievement >= 50);

          if (targetRecipients.length > 0) {
            const bonus = difference / targetRecipients.length;
            calculated = calculated.map(c => {
              if (targetRecipients.some(r => r.id === c.id)) {
                const newYearly = c.yearly + bonus;
                return {
                  ...c,
                  yearly: newYearly,
                  quarterly: newYearly / 4,
                  monthly: newYearly / 12
                };
              }
              return c;
            });
          }
        }
      }
    } else {
      // Weighted distribution
      let finalWeights = {};
      filteredUsers.forEach(u => {
        let w = getUserWeight(u.id, u.role);
        if (enablePerformanceTuning && u.achievement < 50) {
          w = w * 0.85; // 15% reduction
        }
        finalWeights[u.id] = w;
      });

      const totalWeight = Object.values(finalWeights).reduce((sum, w) => sum + w, 0) || 1;

      calculated = filteredUsers.map(user => {
        const userWeight = getUserWeight(user.id, user.role);
        const allocatedWeight = finalWeights[user.id];
        const yearly = (allocatedWeight / totalWeight) * totalTarget;

        return {
          id: user.id,
          name: user.name,
          role: user.role,
          team: user.team || 'Alpha',
          weight: userWeight,
          yearly,
          quarterly: yearly / 4,
          monthly: yearly / 12,
          achievement: user.achievement
        };
      });
    }

    return calculated;
  }, [totalCompanyTarget, filteredUsers, distributionType, enablePerformanceTuning, weights]);



  const maxTargetValue = useMemo(() => {
    if (generatedTargets.length === 0) return 0;
    return Math.max(...generatedTargets.map(t => t.yearly));
  }, [generatedTargets]);

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();

    // Validate inputs
    const excellent = parseFloat(thresholds.excellent);
    const good = parseFloat(thresholds.good);
    const risk = parseFloat(thresholds.risk);

    if (isNaN(excellent) || isNaN(good) || isNaN(risk) || excellent < good || good < risk) {
      alert('Thresholds must satisfy Excellent ≥ Good ≥ Risk.');
      return;
    }

    // Dispatch UPDATE_SETTINGS to state
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        thresholds: { excellent, good, risk },
        alertsConfig: {
          productionDelayDays: parseInt(alertsConfig.productionDelayDays),
          dispatchDelayDays: parseInt(alertsConfig.dispatchDelayDays),
          paymentOverdueDays: parseInt(alertsConfig.paymentOverdueDays),
          noFollowUpDays: parseInt(alertsConfig.noFollowUpDays)
        }
      }
    });

    // Log action
    dispatch({
      type: 'ADD_AUDIT_LOG',
      payload: {
        id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
        user: currentUser.name,
        action: 'Settings Changed',
        orderNo: '',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        remarks: 'Updated performance thresholds and alarm configurations'
      }
    });

    showToast('Sales Admin configurations saved successfully!');
  };

  const handleRebalance = () => {
    const currentTotal = filteredUsers.reduce((sum, u) => sum + (state.settings?.salesTargets?.[u.id] || 0), 0);
    if (currentTotal === 0) {
      setTotalCompanyTarget('60000000'); // default 6 Cr fallback
      showToast('Rebalanced with default 6 Cr company target');
    } else {
      setTotalCompanyTarget(currentTotal.toString());
      showToast(`Rebalanced existing total quota of ${formatCurrency(currentTotal)} across selected roster`);
    }
  };

  const handleApplyTargets = (e) => {
    e.preventDefault();
    if (generatedTargets.length === 0) return;

    const newTargets = { ...(state.settings?.salesTargets || {}) };
    generatedTargets.forEach(item => {
      // Always save target quota at the Yearly scale to maintain consistency with historical data baselines
      newTargets[item.id] = Math.round(item.yearly);
    });

    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        salesTargets: newTargets
      }
    });

    // Add Audit Log
    dispatch({
      type: 'ADD_AUDIT_LOG',
      payload: {
        id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
        user: currentUser.name,
        action: 'Bulk Targets Assigned',
        orderNo: '',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        remarks: `Distributed total company target of ${formatCurrency(parseFloat(totalCompanyTarget))} across ${generatedTargets.length} agents via ${distributionType} mode.`
      }
    });

    showToast(`Successfully distributed and applied targets for ${generatedTargets.length} users!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Threshold Color Control */}
        <div className="card-solid">
          <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={15} color="var(--color-primary)" /> Performance Threshold Limits (%)
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold', marginBottom: '2px' }}>🟢 Excellent Performance (≥ %)</label>
              <input 
                type="number" 
                value={thresholds.excellent}
                onChange={(e) => setThresholds(prev => ({ ...prev, excellent: e.target.value }))}
                required
                style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.15)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: '#d97706', fontWeight: 'bold', marginBottom: '2px' }}>🟡 Good / Stable Performance (≥ %)</label>
              <input 
                type="number" 
                value={thresholds.good}
                onChange={(e) => setThresholds(prev => ({ ...prev, good: e.target.value }))}
                required
                style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.15)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: '#c2410c', fontWeight: 'bold', marginBottom: '2px' }}>Underperforming Risk (≥ %)</label>
              <input 
                type="number" 
                value={thresholds.risk}
                onChange={(e) => setThresholds(prev => ({ ...prev, risk: e.target.value }))}
                required
                style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.15)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>
          
          <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '12px', display: 'block' }}>
            💡 Values below <strong>{thresholds.risk}%</strong> will automatically trigger a <strong>🔴 Critical Deficit</strong> warning badge.
          </span>
        </div>

        {/* Alarm Timings Control */}
        <div className="card-solid">
          <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle size={15} color="var(--color-primary)" /> Central Risk Alarm Delay Settings (Days)
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '2px' }}>Production Delay Halts (Days)</label>
              <input 
                type="number" 
                value={alertsConfig.productionDelayDays}
                onChange={(e) => setAlertsConfig(prev => ({ ...prev, productionDelayDays: e.target.value }))}
                required
                style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.15)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '2px' }}>Logistics Dispatch Delay (Days)</label>
              <input 
                type="number" 
                value={alertsConfig.dispatchDelayDays}
                onChange={(e) => setAlertsConfig(prev => ({ ...prev, dispatchDelayDays: e.target.value }))}
                required
                style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.15)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '2px' }}>Payment Past Overdue Limits (Days)</label>
              <input 
                type="number" 
                value={alertsConfig.paymentOverdueDays}
                onChange={(e) => setAlertsConfig(prev => ({ ...prev, paymentOverdueDays: e.target.value }))}
                required
                style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.15)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '2px' }}>Leads Without Action Limit (Days)</label>
              <input 
                type="number" 
                value={alertsConfig.noFollowUpDays}
                onChange={(e) => setAlertsConfig(prev => ({ ...prev, noFollowUpDays: e.target.value }))}
                required
                style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.15)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <button 
          type="submit" 
          style={{ 
            background: 'var(--color-primary)', 
            color: 'var(--text-primary)', 
            border: 'none', 
            padding: '14px 28px', 
            borderRadius: '10px', 
            fontWeight: 'bold', 
            fontSize: '14px',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(220, 242, 107, 0.2)'
          }}
        >
          <Save size={16} /> Save Configurations
        </button>
      </form>

      {/* 🎯 Bulk Target Assignment & Control Center */}
      <div className="card-solid" style={{ marginTop: '16px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Target size={15} color="var(--color-primary)" /> Bulk Target Assignment (Auto-Distribution)
        </h4>

        {/* Form Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Total Target Company Quota (₹)</label>
            <input 
              type="number" 
              value={totalCompanyTarget}
              onChange={(e) => setTotalCompanyTarget(e.target.value)}
              placeholder="e.g. 100000000 for 10 Cr"
              style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.15)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Target Period Mode</label>
            <select 
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.15)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
            >
              <option value="yearly">Yearly Target Mode</option>
              <option value="quarterly">Quarterly Target Mode</option>
              <option value="monthly">Monthly Target Mode</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Distribution Logic</label>
            <select 
              value={distributionType}
              onChange={(e) => setDistributionType(e.target.value)}
              style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.15)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
            >
              <option value="weighted">Intelligent Weighted Distribution</option>
              <option value="equal">Equal Share Distribution</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Roster Scope Inclusion</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                value={includeScope}
                onChange={(e) => setIncludeScope(e.target.value)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.15)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
              >
                <option value="all">All Sales Performers</option>
                <option value="active">Active Members Only</option>
                <option value="team">By Specific Sales Team</option>
              </select>
              {includeScope === 'team' && (
                <select 
                  value={teamSelection}
                  onChange={(e) => setTeamSelection(e.target.value)}
                  style={{ width: '100px', padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.15)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                >
                  {teams.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  {teams.length === 0 && <option value="Alpha">Alpha</option>}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Toggles Group */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '20px', padding: '14px', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '600' }}>
            <input 
              type="checkbox" 
              checked={enableMonthlyToggles}
              onChange={(e) => setEnableMonthlyToggles(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Auto-generate Monthly Targets preview split (1/12th)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '600' }}>
            <input 
              type="checkbox" 
              checked={enablePerformanceTuning}
              onChange={(e) => setEnablePerformanceTuning(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Performance-based Tuning (Reduce share by 15% if past quota achievement &lt; 50%)
          </label>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={14} color="var(--accent)" />
          <span>Note: Stored targets are always updated and saved in Yearly scale to synchronize correctly with the dashboard achievement progress and analytics.</span>
        </div>

        {/* Preview Summary and Table */}
        {generatedTargets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Animated summary metrics cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '10px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Roster Target Sum</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {formatCurrency(generatedTargets.reduce((sum, item) => sum + item.yearly, 0))}
                </div>
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '10px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Average Allocation</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {formatCurrency((parseFloat(totalCompanyTarget) || 0) / (generatedTargets.length || 1))}
                </div>
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '10px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Quota Recipient Count</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {generatedTargets.length} Sales Agents
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    <th style={{ padding: '12px 10px' }}>Salesperson</th>
                    <th style={{ padding: '12px 10px' }}>Scope Weight</th>
                    <th style={{ padding: '12px 10px' }}>Quota Share %</th>
                    <th style={{ padding: '12px 10px' }}>Yearly Target</th>
                    <th style={{ padding: '12px 10px' }}>Quarterly split</th>
                    {enableMonthlyToggles && <th style={{ padding: '12px 10px' }}>Monthly split</th>}
                  </tr>
                </thead>
                <tbody>
                  {generatedTargets.map(item => {
                    const sharePct = (item.yearly / (parseFloat(totalCompanyTarget) || 1)) * 100;
                    const isTop = item.yearly === maxTargetValue && maxTargetValue > 0;
                    const isCrusher = item.achievement >= 100;
                    
                    return (
                      <tr key={item.id} style={{ fontSize: '13px' }}>
                        <td style={{ padding: '12px 10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>{item.name}</strong>
                            {isTop && (
                              <span style={{ fontSize: '9px', fontWeight: 'bold', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', padding: '2px 5px', borderRadius: '4px' }}>
                                🔥 Top Quota
                              </span>
                            )}
                            {isCrusher && (
                              <span style={{ fontSize: '9px', fontWeight: 'bold', background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', padding: '2px 5px', borderRadius: '4px' }}>
                                🏆 Crusher
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>{item.role} • Team: {item.team}</span>
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          {distributionType === 'weighted' ? (
                            <input 
                              type="number" 
                              step="0.1"
                              min="0.1"
                              value={item.weight}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0.1;
                                setWeights(prev => ({
                                  ...prev,
                                  [item.id]: val
                                }));
                              }}
                              style={{ 
                                width: '70px', 
                                padding: '4px 8px', 
                                borderRadius: '6px', 
                                background: '#ffffff', 
                                border: '1px solid rgba(0,0,0,0.15)', 
                                color: 'var(--text-primary)', 
                                fontSize: '12px',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>1.0 (Fixed)</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{sharePct.toFixed(1)}%</span>
                            <div style={{ width: '60px', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${sharePct}%`, height: '100%', background: isTop ? '#ef4444' : 'var(--color-primary)', borderRadius: '3px' }}></div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 10px', color: 'var(--text-primary)', fontWeight: '600' }}>
                          {formatCurrency(item.yearly)}
                        </td>
                        <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                          {formatCurrency(item.quarterly)}
                        </td>
                        {enableMonthlyToggles && (
                          <td style={{ padding: '12px 10px', color: '#16a34a', fontWeight: 'bold' }}>
                            {formatCurrency(item.monthly)}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bulk actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button 
                type="button" 
                onClick={handleApplyTargets}
                style={{ 
                  background: 'var(--accent)', 
                  color: '#ffffff', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Target size={14} /> Apply & Save Targets
              </button>

              <button 
                type="button" 
                onClick={handleRebalance}
                style={{ 
                  background: '#ffffff', 
                  color: 'var(--text-primary)', 
                  border: '1px solid rgba(0, 0, 0, 0.12)', 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} /> Rebalance Existing Targets
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}

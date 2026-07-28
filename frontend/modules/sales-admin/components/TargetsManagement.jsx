import { useState, useMemo } from 'react';
import { Target, Save, Edit3, ShieldAlert, CheckCircle, Sparkles } from 'lucide-react';
import { getColor } from '../services/analyticsService';

export default function TargetsManagement({ state, dispatch, performers, showToast }) {
  const [editingId, setEditingId] = useState(null);
  const [targetInput, setTargetInput] = useState('');

  const currentUser = state.currentUser || { name: 'Elena Rostova' };

  // Aggregated Company View
  const companySummary = useMemo(() => {
    let totalTarget = 0;
    let totalRevenue = 0;
    
    performers.forEach(p => {
      totalTarget += p.target;
      totalRevenue += p.revenue;
    });

    const totalGap = Math.max(0, totalTarget - totalRevenue);
    const achievementPercent = totalTarget > 0 ? (totalRevenue / totalTarget) * 100 : 0;

    // Detect gap creators (gap represents > 0, and achievement < 40%)
    const gapCreators = performers.filter(p => p.gap > 0 && p.achievement < 40);

    return {
      totalTarget,
      totalRevenue,
      totalGap,
      achievementPercent,
      gapCreators
    };
  }, [performers]);

  const handleEditClick = (performer) => {
    setEditingId(performer.id);
    setTargetInput(performer.target.toString());
  };

  const handleSaveClick = (userId, userName) => {
    const numericTarget = parseFloat(targetInput);
    if (isNaN(numericTarget) || numericTarget < 0) {
      alert('Please enter a valid target amount.');
      return;
    }

    const currentTargets = { ...(state.settings?.salesTargets || {}) };
    currentTargets[userId] = numericTarget;

    // Dispatch update settings to Zustand store
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { salesTargets: currentTargets }
    });

    // Add Audit Log
    dispatch({
      type: 'ADD_AUDIT_LOG',
      payload: {
        id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
        user: currentUser.name,
        action: 'Target Assigned',
        orderNo: '',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        remarks: `Assigned target of ${formatCurrency(numericTarget)} to ${userName}`
      }
    });

    showToast(`Target updated for ${userName}!`);
    setEditingId(null);
  };

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Company View Banner */}
      <div className="card-solid" style={{ 
        background: 'linear-gradient(135deg, rgba(51, 122, 134, 0.05) 0%, rgba(51, 122, 134, 0.12) 100%)',
        color: 'var(--text-primary)',
        border: '1px solid rgba(51, 122, 134, 0.15)',
        borderRadius: '18px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={13} color="var(--accent)" /> Company View — Total Sales Target Achievement
            </h4>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '10px' }}>
              <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--accent)', letterSpacing: '-0.5px' }}>
                {formatCurrency(companySummary.totalRevenue)}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                achieved of {formatCurrency(companySummary.totalTarget)}
              </span>
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11.5px', color: '#dc2626', fontWeight: 'bold', display: 'block' }}>
              Remaining Gap: {formatCurrency(companySummary.totalGap)} ❌
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
              Total Achievement: <strong>{companySummary.achievementPercent.toFixed(1)}%</strong>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden', marginTop: '16px' }}>
          <div style={{ width: `${Math.min(100, companySummary.achievementPercent)}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.4s ease' }}></div>
        </div>
      </div>

      {/* Target Table */}
      <div className="card-solid">
        <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Target size={15} color="var(--color-primary)" /> Assign Targets Per Sales User
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                <th style={{ padding: '12px 10px' }}>Salesperson</th>
                <th style={{ padding: '12px 10px' }}>Allocated Target</th>
                <th style={{ padding: '12px 10px' }}>Achieved</th>
                <th style={{ padding: '12px 10px' }}>Gap</th>
                <th style={{ padding: '12px 10px' }}>Achievement %</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {performers.map(p => {
                const isEditing = editingId === p.id;
                const c = getColor(p.achievement);
                const colorHex = c === 'green' ? '#16a34a' : c === 'yellow' ? '#ca8a04' : c === 'orange' ? '#d97706' : '#dc2626';
                
                return (
                  <tr key={p.id} style={{ fontSize: '13px' }}>
                    <td style={{ padding: '14px 10px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{p.name}</strong>
                      <span style={{ fontSize: '10px', color: '#888', display: 'block' }}>{p.role} • Team: {p.team}</span>
                    </td>
                    <td style={{ padding: '14px 10px' }}>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={targetInput} 
                          onChange={(e) => setTargetInput(e.target.value)}
                          style={{ padding: '6px 10px', borderRadius: '6px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', width: '130px', fontSize: '12px', outline: 'none' }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(p.target)}</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 10px', color: '#16a34a', fontWeight: 'bold' }}>{formatCurrency(p.revenue)}</td>
                    <td style={{ padding: '14px 10px', color: p.gap > 0 ? '#dc2626' : '#16a34a', fontWeight: '600' }}>
                      {p.gap > 0 ? formatCurrency(p.gap) : 'Target Met'}
                    </td>
                    <td style={{ padding: '14px 10px', fontWeight: 'bold', color: colorHex }}>
                      {p.achievement.toFixed(1)}%
                    </td>
                    <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                      {isEditing ? (
                        <button 
                          onClick={() => handleSaveClick(p.id, p.name)}
                          className="action-btn"
                          style={{ background: 'var(--color-primary)', border: 'none', padding: '6px 12px', borderRadius: '6px', color: '#12161a', fontWeight: 'bold', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                        >
                          <Save size={12} /> Save
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleEditClick(p)}
                          style={{ background: 'transparent', border: 'none', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Insights */}
      <div className="card-solid">
        <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={16} color="var(--color-primary)" /> Target Gap & Deficit Warnings
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {companySummary.gapCreators.length > 0 ? (
            companySummary.gapCreators.map(perf => (
              <div key={perf.id} style={{ background: 'rgba(220, 38, 38, 0.04)', border: '1px solid rgba(220, 38, 38, 0.15)', padding: '12px', borderRadius: '10px', display: 'flex', gap: '10px', borderLeft: '4px solid #dc2626' }}>
                <ShieldAlert size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '12.5px', color: '#dc2626', display: 'block', marginBottom: '4px' }}>
                    Critical Gap Creator: {perf.name} (Deficit: {formatCurrency(perf.gap)})
                  </strong>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                    Sales representative has achievement rating of only <strong>{perf.achievement.toFixed(1)}%</strong> which is causing significant shortfall in overall corporate revenue run-rate.
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div style={{ background: 'rgba(22, 163, 74, 0.05)', border: '1px solid rgba(22, 163, 74, 0.1)', padding: '12px', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <CheckCircle size={16} color="#16a34a" />
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>All salespersons are pacing appropriately towards their target quotas.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

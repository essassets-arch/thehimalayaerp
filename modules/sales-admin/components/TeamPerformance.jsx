import { useState, useMemo } from 'react';
import { UserPlus, Award, Target, Sparkles, Trash2, ShieldAlert, Award as BadgeIcon, Eye, TrendingUp, Mail, Phone, Users, CheckCircle } from 'lucide-react';
import { getColor } from '../services/analyticsService';

export default function TeamPerformance({ state, dispatch, performers, showToast, filters }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedUserAnalytics, setSelectedUserAnalytics] = useState(null);
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('leads');
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'Sales Executive',
    team: 'Alpha',
    status: 'Active',
    phone: '',
    department: 'Sales'
  });

  const currentUser = state.currentUser || { name: 'Elena Rostova' };

  // Gamification: Find candidates for badges
  const badgesMap = useMemo(() => {
    const map = {};
    
    // 1. Target Crusher: achievement >= 100%
    performers.forEach(p => {
      if (p.achievement >= 100) {
        if (!map[p.id]) map[p.id] = [];
        map[p.id].push({ type: 'crusher', label: '🏆 Target Crusher', style: { color: '#4ade80', bg: 'rgba(74, 222, 128, 0.12)' } });
      }
    });

    // 2. Cash King: highest payment efficiency (among those with closed revenue)
    let maxPayEff = -1;
    let cashKingId = null;
    performers.forEach(p => {
      if (p.revenue > 0 && p.paymentEfficiency > maxPayEff) {
        maxPayEff = p.paymentEfficiency;
        cashKingId = p.id;
      }
    });
    if (cashKingId && maxPayEff >= 70) {
      if (!map[cashKingId]) map[cashKingId] = [];
      map[cashKingId].push({ type: 'cash_king', label: '💰 Cash King', style: { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)' } });
    }

    // 3. Top Closer: highest conversion rate
    let maxConv = -1;
    let topCloserId = null;
    performers.forEach(p => {
      if (p.conversionRate > maxConv) {
        maxConv = p.conversionRate;
        topCloserId = p.id;
      }
    });
    if (topCloserId && maxConv >= 30) {
      if (!map[topCloserId]) map[topCloserId] = [];
      map[topCloserId].push({ type: 'closer', label: '🔥 Top Closer', style: { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)' } });
    }

    // 4. Risky Seller: payment efficiency < 50%
    performers.forEach(p => {
      if (p.revenue > 0 && p.paymentEfficiency < 50) {
        if (!map[p.id]) map[p.id] = [];
        map[p.id].push({ type: 'risky', label: '⚠️ Risky Seller', style: { color: '#f87171', bg: 'rgba(248, 113, 113, 0.12)' } });
      }
    });

    return map;
  }, [performers]);

  const [roleFilter, setRoleFilter] = useState('All');
  const [editingTargetId, setEditingTargetId] = useState(null);
  const [targetValue, setTargetValue] = useState('');

  // Filter performers by role
  const filteredPerformers = useMemo(() => {
    return performers.filter(p => {
      if (roleFilter === 'All') return true;
      return p.role === roleFilter;
    });
  }, [performers, roleFilter]);

  // Executive summary counts
  const summary = useMemo(() => {
    const totalUsers = performers.length;
    const activeUsers = performers.filter(p => p.status === 'Active').length;
    const avgAchievement = performers.reduce((sum, p) => sum + p.achievement, 0) / (totalUsers || 1);
    return { totalUsers, activeUsers, avgAchievement };
  }, [performers]);

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert('Please fill in Name and Email address.');
      return;
    }

    const userId = 'USR-' + Math.floor(100 + Math.random() * 900);
    const newUser = {
      id: userId,
      name: form.name,
      email: form.email,
      role: form.role,
      team: form.team,
      status: form.status,
      phone: form.phone || '+91 98765 ' + Math.floor(10000 + Math.random() * 90000),
      department: 'Sales',
      permissions: ['VIEW_DASHBOARD', 'CREATE_LEAD']
    };

    // Dispatch to State Engine
    dispatch({ type: 'ADD_USER', payload: newUser });
    
    // Record log
    dispatch({
      type: 'ADD_AUDIT_LOG',
      payload: {
        id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
        user: currentUser.name,
        action: 'User Created',
        orderNo: '',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        remarks: `Registered sales user ${newUser.name} as ${newUser.role} (Status: ${newUser.status})`
      }
    });

    showToast(`Successfully created ${newUser.name} and initialized targets.`);
    setShowModal(false);
    setForm({
      name: '',
      email: '',
      role: 'Sales Executive',
      team: 'Alpha',
      status: 'Active',
      phone: '',
      department: 'Sales'
    });
  };

  const handleDeleteUser = (userId, userName) => {
    if (confirm(`Are you sure you want to delete sales user ${userName}?`)) {
      dispatch({ type: 'DELETE_USER', payload: userId });
      
      dispatch({
        type: 'ADD_AUDIT_LOG',
        payload: {
          id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
          user: currentUser.name,
          action: 'User Deleted',
          orderNo: '',
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          remarks: `Deleted sales user ${userName} (${userId}) from records`
        }
      });

      showToast(`Deleted user ${userName}`);
    }
  };

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getRankBadgeStyle = (rank) => {
    if (rank === 1) return { background: 'linear-gradient(135deg, #fef08a 0%, #eab308 100%)', color: '#854d0e', text: '🥇' };
    if (rank === 2) return { background: 'linear-gradient(135deg, #DCE5F0 0%, #8893A7 100%)', color: '#334155', text: '🥈' };
    if (rank === 3) return { background: 'linear-gradient(135deg, #fed7aa 0%, #c2410c 100%)', color: '#7c2d12', text: '🥉' };
    return { background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)', text: `#${rank}` };
  };
 
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Scoreboard Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card-solid" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Roster Size</span>
            <UserPlus size={15} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '8px', color: 'var(--text-primary)' }}>{summary.totalUsers} Members</h3>
          <span style={{ fontSize: '10px', color: '#888' }}>Registered sales executives</span>
        </div>
 
        <div className="card-solid" style={{ borderLeft: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Active Agents</span>
            <Sparkles size={15} color="#16a34a" />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '8px', color: '#16a34a' }}>{summary.activeUsers} Active</h3>
          <span style={{ fontSize: '10px', color: '#888' }}>Attempting targets clearing</span>
        </div>
 
        <div className="card-solid" style={{ borderLeft: '4px solid #38bdf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Avg Achievement</span>
            <Target size={15} color="#38bdf8" />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '8px', color: 'var(--text-primary)' }}>{Math.round(summary.avgAchievement)}%</h3>
          <span style={{ fontSize: '10px', color: '#888' }}>Roster mean quota closed</span>
        </div>
      </div>
      
      {/* Table & controls */}
      <div className="card-solid">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', textTransform: 'uppercase', margin: 0 }}>
              Sales Team Leaderboard & Performance Scoreboard
            </h4>
            <span style={{ fontSize: '10.5px', color: '#888' }}>
              Formula-based ranking and live achievement indicators
            </span>
          </div>
 
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                background: '#ffffff',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-strong)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Roles</option>
              <option value="Sales Executive">Sales Executive</option>
              <option value="Team Leader">Team Leader</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
        </div>
 
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                <th style={{ padding: '12px 10px' }}>Rank</th>
                <th style={{ padding: '12px 10px' }}>Salesperson</th>
                <th style={{ padding: '12px 10px' }}>Target</th>
                <th style={{ padding: '12px 10px' }}>Achieved</th>
                <th style={{ padding: '12px 10px' }}>Remaining Gap</th>
                <th style={{ padding: '12px 10px' }}>Payment %</th>
                <th style={{ padding: '12px 10px' }}>Conversion %</th>
                <th style={{ padding: '12px 10px' }}>Status</th>

                <th style={{ padding: '12px 10px' }}>Rank Score</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPerformers.map(p => {
                const c = getColor(p.achievement);
                const colorHex = c === 'green' ? '#16a34a' : c === 'yellow' ? '#ca8a04' : c === 'orange' ? '#d97706' : '#dc2626';
                const rStyle = getRankBadgeStyle(p.rank);
                const rankClass = p.rank === 1 ? 'rank-1' : p.rank === 2 ? 'rank-2' : p.rank === 3 ? 'rank-3' : '';
                
                return (
                  <tr key={p.id} style={{ fontSize: '13px', transition: 'background 0.2s' }} className={rankClass}>
                    {/* Rank */}
                    <td style={{ padding: '14px 10px' }}>
                      <span style={{ 
                        display: 'inline-flex',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: rStyle.background,
                        color: rStyle.color,
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '11px'
                      }}>
                        {rStyle.text}
                      </span>
                    </td>
                    {/* Name */}
                    <td style={{ padding: '14px 10px' }}>
                      <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{p.name}</strong>
                      <span style={{ fontSize: '10px', color: '#888' }}>
                        {p.role} • Team: {p.team || 'Alpha'} • {p.email}
                      </span>
                    </td>
                    {/* Target */}
                    <td style={{ padding: '14px 10px', whiteSpace: 'nowrap' }}>
                      {editingTargetId === p.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            value={targetValue}
                            onChange={(e) => setTargetValue(e.target.value)}
                            style={{ 
                              width: '90px', 
                              padding: '6px', 
                              fontSize: '11px', 
                              background: '#ffffff', 
                              border: '1px solid var(--border-strong)', 
                              color: 'var(--text-primary)', 
                              borderRadius: '6px',
                              outline: 'none'
                            }}
                          />
                          <button 
                            onClick={() => {
                              const val = parseFloat(targetValue);
                              if (!isNaN(val) && val >= 0) {
                                dispatch({
                                  type: 'UPDATE_SETTINGS',
                                  payload: {
                                    salesTargets: {
                                      ...(state.settings?.salesTargets || {}),
                                      [p.id]: val
                                    }
                                  }
                                });
                                
                                dispatch({
                                  type: 'ADD_AUDIT_LOG',
                                  payload: {
                                    id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
                                    user: currentUser.name,
                                    action: 'Target Adjusted',
                                    orderNo: '',
                                    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                                    remarks: `Reassigned sales target of ${formatCurrency(val)} to ${p.name}`
                                  }
                                });

                                showToast(`Assigned target of ${formatCurrency(val)} to ${p.name}`);
                              }
                              setEditingTargetId(null);
                            }}
                            style={{ 
                              background: 'var(--color-primary)', 
                              border: 'none', 
                              color: '#000', 
                              padding: '6px 10px', 
                              borderRadius: '6px', 
                              fontSize: '10.5px', 
                              fontWeight: 'bold', 
                              cursor: 'pointer' 
                            }}
                          >
                            Set
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(p.target)}</span>
                          <button 
                            onClick={() => {
                              setEditingTargetId(p.id);
                              setTargetValue(p.target.toString());
                            }}
                            style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '2px', fontSize: '11px' }}
                            title="Assign Target"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>
                    {/* Achieved */}
                    <td style={{ padding: '14px 10px', color: '#16a34a', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatCurrency(p.revenue)}</td>
                    {/* Gap */}
                    <td style={{ padding: '14px 10px', color: p.gap > 0 ? '#dc2626' : '#16a34a', fontWeight: '600', whiteSpace: 'nowrap' }}>
                      {p.gap > 0 ? formatCurrency(p.gap) : 'Target Reached'}
                    </td>
                    {/* Payment % */}
                    <td style={{ padding: '14px 10px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {p.paymentEfficiency.toFixed(0)}%
                    </td>
                    {/* Conversion % */}
                    <td style={{ padding: '14px 10px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {p.conversionRate.toFixed(0)}%
                    </td>
                    {/* Status Select */}
                    <td style={{ padding: '14px 10px' }}>
                      <select
                        value={p.status || 'Active'}
                        onChange={(e) => {
                          dispatch({
                            type: 'UPDATE_USER',
                            payload: { id: p.id, status: e.target.value }
                          });
                          
                          dispatch({
                            type: 'ADD_AUDIT_LOG',
                            payload: {
                              id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
                              user: currentUser.name,
                              action: 'User Status Updated',
                              orderNo: '',
                              date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                              remarks: `Switched roster status of ${p.name} to ${e.target.value}`
                            }
                          });

                          showToast(`Updated status for ${p.name} to ${e.target.value}`);
                        }}
                        style={{
                          background: p.status === 'Active' ? 'rgba(22, 163, 74, 0.08)' : p.status === 'Suspended' ? 'rgba(220, 38, 38, 0.08)' : 'rgba(75, 85, 99, 0.08)',
                          color: p.status === 'Active' ? '#16a34a' : p.status === 'Suspended' ? '#dc2626' : '#4b5563',
                          border: p.status === 'Active' ? '1px solid rgba(22, 163, 74, 0.2)' : p.status === 'Suspended' ? '1px solid rgba(220, 38, 38, 0.2)' : '1px solid rgba(75, 85, 99, 0.2)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </td>

                    {/* Rank Score */}
                    <td style={{ padding: '14px 10px' }}>
                      <strong style={{ color: colorHex, fontSize: '14px' }}>{p.rankScore}</strong>
                    </td>
                    {/* Action buttons */}
                    <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => setSelectedUserAnalytics(p)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '28px', height: '28px',
                            background: '#ffffff', border: '1px solid #d1d5db',
                            borderRadius: '6px', cursor: 'pointer',
                            color: '#374151', flexShrink: 0
                          }}
                          title="View Analytics"
                        >
                          <Eye size={13} />
                        </button>
                        {p.id !== 'USR-002' && p.id !== 'USR-006' && p.id !== 'EMP-001' && ( // Keep seeded users
                          <button 
                            onClick={() => handleDeleteUser(p.id, p.name)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: '28px', height: '28px',
                              background: '#ffffff', border: '1px solid #fca5a5',
                              borderRadius: '6px', cursor: 'pointer',
                              color: '#dc2626', flexShrink: 0
                            }}
                            title="Delete User"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
 
      {/* User Management Creation Modal */}
      {showModal && (
        <div className="modal-overlay active" onClick={() => setShowModal(false)} style={{ zIndex: 10000, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', inset: 0 }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '450px', background: 'var(--bg-elevated)', border: '1px solid var(--border-soft)', color: 'var(--text-primary)', borderRadius: '18px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)' }}>
            <div className="modal-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 className="modal-title-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: '800', margin: 0 }}>
                <Sparkles size={18} color="var(--accent)" /> Register New Sales User
              </h3>
              <button className="modal-close-btn" style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>
 
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email Address</label>
                <input 
                  type="email" 
                  placeholder="john.doe@himalaya.com"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>
 
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Role</label>
                  <select 
                    value={form.role}
                    onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                    style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Team Leader">Team Leader</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
 
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Team Section</label>
                  <select 
                    value={form.team}
                    onChange={(e) => setForm(prev => ({ ...prev, team: e.target.value }))}
                    style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Alpha">Alpha</option>
                    <option value="Beta">Beta</option>
                    <option value="Delta">Delta</option>
                  </select>
                </div>
              </div>
 
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Account Status</label>
                  <select 
                    value={form.status}
                    onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                    style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
 
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Telephone</label>
                  <input 
                    type="text" 
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    style={{ padding: '10px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
              </div>
 
              <div style={{ background: 'rgba(51, 122, 134, 0.05)', border: '1px dashed rgba(51, 122, 134, 0.2)', padding: '10px', borderRadius: '8px', fontSize: '11px', color: 'var(--accent)' }}>
                💡 <strong>Auto Target Mapping:</strong> When created, the target for this user will automatically be set to <strong>₹0</strong>. You can configure and allocate a sales target later in the Target Management panel.
              </div>
 
              <button 
                type="submit" 
                style={{ 
                  background: 'var(--color-primary)', 
                  color: '#12161a', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  fontWeight: 'bold', 
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  boxShadow: '0 4px 14px rgba(51, 122, 134, 0.15)'
                }}
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View User Analytics Details Modal */}
      {selectedUserAnalytics && (() => {
        const agentName = selectedUserAnalytics.name;
        const agentLeads = (state.sales?.leads || []).filter(l => l.salesperson === agentName);
        const agentLeadNames = agentLeads.map(l => l.companyName.toLowerCase());
        const agentQuotations = (state.sales?.quotations || []).filter(q => 
          agentLeadNames.includes(q.customerName.toLowerCase())
        );
        const agentOrders = (state.sales?.orders || []).filter(o => o.salesperson === agentName);
        const agentPayments = (state.payments || []).filter(p => {
          const matchingOrder = (state.sales?.orders || []).find(o => o.orderNo === p.orderNo);
          return matchingOrder && matchingOrder.salesperson === agentName;
        });

        return (
          <div className="modal-overlay active" onClick={() => setSelectedUserAnalytics(null)} style={{ zIndex: 10000, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', inset: 0 }}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '650px', background: 'var(--bg-elevated)', border: '1px solid var(--border-soft)', color: 'var(--text-primary)', borderRadius: '18px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)', maxHeight: '92vh', overflowY: 'auto' }}>
              <div className="modal-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3 className="modal-title-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: '800', margin: 0 }}>
                  <Award size={18} color="var(--accent)" /> Sales Agent Performance Profile
                </h3>
                <button className="modal-close-btn" style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' }} onClick={() => setSelectedUserAnalytics(null)}>✕</button>
              </div>

              {/* Profile Overview Card */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(0, 0, 0, 0.02)', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-soft)' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, #a78bfa 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#12161a', fontWeight: '800', fontSize: '18px'
                }}>
                  {selectedUserAnalytics.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>{selectedUserAnalytics.name}</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {selectedUserAnalytics.role} • <span style={{ fontWeight: '600' }}>Team {selectedUserAnalytics.team}</span>
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
                    background: selectedUserAnalytics.status === 'Active' ? '#dcfce7' : '#fee2e2',
                    color: selectedUserAnalytics.status === 'Active' ? '#15803d' : '#dc2626'
                  }}>
                    {selectedUserAnalytics.status}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Rank #{selectedUserAnalytics.rank}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>{selectedUserAnalytics.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>{selectedUserAnalytics.phone}</span>
                </div>
              </div>

              {/* Core Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(0, 0, 0, 0.01)', border: '1px solid var(--border-soft)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Sales Target</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>{formatCurrency(selectedUserAnalytics.target)}</div>
                </div>
                <div style={{ background: 'rgba(0, 0, 0, 0.01)', border: '1px solid var(--border-soft)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Revenue Achieved</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px', color: '#16a34a' }}>{formatCurrency(selectedUserAnalytics.revenue)}</div>
                </div>
                <div style={{ background: 'rgba(0, 0, 0, 0.01)', border: '1px solid var(--border-soft)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Remaining Target Gap</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px', color: selectedUserAnalytics.gap > 0 ? '#dc2626' : '#16a34a' }}>
                    {selectedUserAnalytics.gap > 0 ? formatCurrency(selectedUserAnalytics.gap) : 'Target Met 🎉'}
                  </div>
                </div>
                <div style={{ background: 'rgba(0, 0, 0, 0.01)', border: '1px solid var(--border-soft)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Rank Score</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px', color: 'var(--color-primary)' }}>{selectedUserAnalytics.rankScore} / 100</div>
                </div>
              </div>

              {/* Performance Achievement Progress */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                  <span>Target Achievement Quota</span>
                  <span style={{ color: selectedUserAnalytics.achievement >= 100 ? '#16a34a' : selectedUserAnalytics.achievement >= 50 ? '#ca8a04' : '#dc2626' }}>
                    {selectedUserAnalytics.achievement.toFixed(1)}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, selectedUserAnalytics.achievement)}%`,
                    height: '100%',
                    background: selectedUserAnalytics.achievement >= 100 ? '#16a34a' : selectedUserAnalytics.achievement >= 50 ? '#eab308' : '#dc2626',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>

              {/* Collection Efficiency Progress */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                  <span>Payment Collection Efficiency</span>
                  <span style={{ color: selectedUserAnalytics.paymentEfficiency >= 80 ? '#16a34a' : selectedUserAnalytics.paymentEfficiency >= 50 ? '#ca8a04' : '#dc2626' }}>
                    {selectedUserAnalytics.paymentEfficiency.toFixed(1)}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, selectedUserAnalytics.paymentEfficiency)}%`,
                    height: '100%',
                    background: selectedUserAnalytics.paymentEfficiency >= 80 ? '#16a34a' : selectedUserAnalytics.paymentEfficiency >= 50 ? '#eab308' : '#dc2626',
                    borderRadius: '4px'
                  }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <span>Payments Collected: {formatCurrency(selectedUserAnalytics.received)}</span>
                  <span>Collected Ratio</span>
                </div>
              </div>

              {/* Volume Analytics */}
              <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{selectedUserAnalytics.leadsCount}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', marginTop: '2px' }}>Leads Handled</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{selectedUserAnalytics.ordersCount}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', marginTop: '2px' }}>Orders Closed</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a' }}>{selectedUserAnalytics.conversionRate.toFixed(1)}%</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', marginTop: '2px' }}>Conversion Rate</div>
                </div>
              </div>

              {/* Associated Documents Tab Header */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-soft)', marginTop: '20px', marginBottom: '12px' }}>
                {[
                  { id: 'leads', label: 'Leads', count: agentLeads.length },
                  { id: 'quotations', label: 'Quotations', count: agentQuotations.length },
                  { id: 'orders', label: 'Orders', count: agentOrders.length },
                  { id: 'payments', label: 'Payments Due', count: agentPayments.filter(p => p.status !== 'Paid').length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAnalyticsTab(tab.id)}
                    style={{
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeAnalyticsTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                      color: activeAnalyticsTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: activeAnalyticsTab === tab.id ? '700' : '500',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      outline: 'none'
                    }}
                  >
                    {tab.label}
                    <span style={{
                      fontSize: '10.5px',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      background: activeAnalyticsTab === tab.id ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)',
                      color: activeAnalyticsTab === tab.id ? '#12161a' : 'var(--text-secondary)',
                      fontWeight: 'bold'
                    }}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tab Contents Area */}
              <div style={{ minHeight: '180px', maxHeight: '300px', overflowY: 'auto', background: 'rgba(0, 0, 0, 0.01)', border: '1px solid var(--border-soft)', borderRadius: '10px', padding: '12px' }}>
                {activeAnalyticsTab === 'leads' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {agentLeads.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>No active leads assigned.</div>
                    ) : (
                      agentLeads.map(l => (
                        <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#ffffff', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                          <div>
                            <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{l.companyName}</strong>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>Req: {l.requirements || 'N/A'}</span>
                          </div>
                          <span style={{
                            fontSize: '11px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px',
                            background: l.status === 'New' ? '#dbeafe' : l.status === 'Follow-up' ? '#fef9c3' : l.status === 'Converted' ? '#dcfce7' : '#fee2e2',
                            color: l.status === 'New' ? '#1d4ed8' : l.status === 'Follow-up' ? '#92400e' : l.status === 'Converted' ? '#15803d' : '#dc2626'
                          }}>
                            {l.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeAnalyticsTab === 'quotations' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {agentQuotations.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>No quotations generated.</div>
                    ) : (
                      agentQuotations.map(q => (
                        <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#ffffff', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                          <div>
                            <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{q.customerName}</strong>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>Items: {q.items || 'N/A'}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)', display: 'block' }}>{formatCurrency(q.totalAmount)}</span>
                            <span style={{
                              fontSize: '9.5px', fontWeight: '700', padding: '1px 4px', borderRadius: '3px',
                              background: q.status === 'Sent' ? '#e0f2fe' : '#f1f5f9',
                              color: q.status === 'Sent' ? '#0369a1' : '#475569'
                            }}>
                              {q.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeAnalyticsTab === 'orders' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {agentOrders.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>No closed orders.</div>
                    ) : (
                      agentOrders.map(o => (
                        <div key={o.orderNo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#ffffff', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                          <div>
                            <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{o.orderNo} • {o.customer?.name}</strong>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>{o.products}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#16a34a', display: 'block' }}>{formatCurrency(o.payment?.totalAmount || 0)}</span>
                            <span style={{
                              fontSize: '9.5px', fontWeight: '700', padding: '1px 4px', borderRadius: '3px',
                              background: '#dcfce7', color: '#15803d'
                            }}>
                              {o.overallStage || 'Confirmed'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeAnalyticsTab === 'payments' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {agentPayments.filter(p => p.status !== 'Paid').length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>No pending or outstanding payments.</div>
                    ) : (
                      agentPayments.filter(p => p.status !== 'Paid').map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#ffffff', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                          <div>
                            <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{p.invoiceNo} ({p.orderNo})</strong>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>Cust: {p.customerName}</span>
                            <span style={{ display: 'block', fontSize: '10px', color: '#dc2626' }}>Due: {p.dueDate}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#dc2626', display: 'block' }}>
                              {formatCurrency(p.totalAmount - p.paidAmount)}
                            </span>
                            <span style={{
                              fontSize: '9.5px', fontWeight: '700', padding: '1px 4px', borderRadius: '3px',
                              background: '#fee2e2', color: '#b91c1c'
                            }}>
                              {p.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <button
                onClick={() => setSelectedUserAnalytics(null)}
                style={{
                  width: '100%', background: 'var(--color-primary)', color: '#12161a',
                  border: 'none', padding: '10px', borderRadius: '8px',
                  fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
                  marginTop: '20px'
                }}
              >
                Close Profile
              </button>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

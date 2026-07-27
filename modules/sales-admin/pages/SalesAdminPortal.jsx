'use client';

import { useState, useMemo, useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { useSearchParams } from 'next/navigation';

import { useERP } from '../../../shared/context/ERPContext';
import { useAuth } from '../../../shared/context/AuthContext';
import { calculatePerformance } from '../services/analyticsService';

// Import sub-views
import DashboardControlTower from '../components/DashboardControlTower';
import TeamPerformance from '../components/TeamPerformance';
import LeadsIntelligence from '../components/LeadsIntelligence';
import OrderPipelineControl from '../components/OrderPipelineControl';
import PaymentsVisibility from '../components/PaymentsVisibility';
import TargetsManagement from '../components/TargetsManagement';
import AnalyticsPanel from '../components/AnalyticsPanel';
import AlertsCenter from '../components/AlertsCenter';
import SalesAdminSettings from '../components/SalesAdminSettings';
import UsersManagement from '../components/UsersManagement';

import { Filter, Calendar, Users, Target, ShieldAlert } from 'lucide-react';

export default function SalesAdminPortal() {
  const searchParams = useSearchParams(); const setSearchParams = (params) => { const url = new URL(window.location.href); Object.keys(params).forEach(k => { if(params[k]) url.searchParams.set(k, params[k]); else url.searchParams.delete(k); }); window.history.replaceState({}, '', url); };
  const activeView = searchParams.get('view') || 'dashboard';

  const { state, dispatch } = useERP();
  const { user } = useAuth();
  const showToast = useNotificationStore(s => s.showToast);

  const isExecutive = user?.role === 'Sales Executive';

  // Redirection: Block restricted views for Sales Executives
  useEffect(() => {
    const restrictedViews = ['settings', 'users', 'analytics', 'team', 'logs', 'alerts'];
    if (isExecutive && restrictedViews.includes(activeView)) {
      setSearchParams({ view: 'dashboard' });
    }
  }, [activeView, isExecutive, setSearchParams]);

  // Global filters state
  const [filters, setFilters] = useState({
    time: 'all',
    user: 'all',
    performance: 'all'
  });

  // Force user filter to own user ID if Sales Executive
  useEffect(() => {
    if (isExecutive) {
      const myUser = (state.users || []).find(u => u.name === user.name);
      if (myUser && filters.user !== myUser.id) {
        setFilters(prev => ({ ...prev, user: myUser.id }));
      }
    }
  }, [user, state.users, filters.user, isExecutive]);

  // Dynamic state filtering for Sales Executive role
  const filteredState = useMemo(() => {
    if (!isExecutive) return state;

    const name = user.name;
    const myLeads = (state.sales?.leads || []).filter(l => l.salesperson === name);
    const myLeadNames = myLeads.map(l => l.companyName.toLowerCase());

    return {
      ...state,
      leads: myLeads,
      orders: (state.sales?.orders || []).filter(o => o.salesperson === name),
      quotations: (state.sales?.quotations || []).filter(q => 
        myLeadNames.includes(q.customerName.toLowerCase())
      ),
      payments: (state.payments || []).filter(p => {
        const order = (state.sales?.orders || []).find(o => o.orderNo === p.orderNo);
        return order && order.salesperson === name;
      }),
      samples: (state.sales?.samples || []).filter(s => {
        const lead = (state.sales?.leads || []).find(l => l.id === s.leadId);
        return lead && lead.salesperson === name;
      })
    };
  }, [state, user, isExecutive]);

  const setActiveView = (view) => {
    setSearchParams({ view });
  };

  // Get filtered performance metrics
  const performers = useMemo(() => {
    return calculatePerformance(filteredState, filters);
  }, [filteredState, filters]);

  // Generate lists of sales users for the filter dropdown
  const salesUsers = useMemo(() => {
    return (state.users || []).filter(u => 
      u.role === 'Sales Admin' || 
      u.role === 'Sales Executive' ||
      u.role === 'Sales'
    );
  }, [state.users]);

  // Render correct sub-view component
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardControlTower 
            state={filteredState} 
            performers={performers} 
            filters={filters} 
            setFilters={setFilters} 
          />
        );
      case 'team':
        return (
          <TeamPerformance 
            state={filteredState} 
            dispatch={dispatch}
            performers={performers} 
            showToast={showToast} 
            filters={filters}
          />
        );
      case 'leads':
        return (
          <LeadsIntelligence 
            state={filteredState} 
            performers={performers} 
            filters={filters} 
          />
        );
      case 'orders':
        return (
          <OrderPipelineControl 
            state={filteredState} 
            filters={filters} 
          />
        );
      case 'payments':
        return (
          <PaymentsVisibility 
            state={filteredState} 
            performers={performers}
            filters={filters} 
          />
        );
      case 'targets':
        return (
          <TargetsManagement 
            state={filteredState} 
            dispatch={dispatch} 
            performers={performers} 
            showToast={showToast}
          />
        );
      case 'analytics':
        return (
          <AnalyticsPanel 
            state={filteredState} 
            performers={performers} 
            filters={filters} 
          />
        );
      case 'users':
        return (
          <UsersManagement 
            state={filteredState} 
            dispatch={dispatch} 
            showToast={showToast} 
          />
        );
      case 'alerts':
        return (
          <AlertsCenter 
            state={filteredState} 
            performers={performers}
            filters={filters} 
          />
        );
      case 'settings':
        return (
          <SalesAdminSettings 
            state={filteredState} 
            dispatch={dispatch} 
            showToast={showToast} 
          />
        );
      default:
        return (
          <DashboardControlTower 
            state={filteredState} 
            performers={performers} 
            filters={filters} 
            setFilters={setFilters} 
          />
        );
    }
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Sales Dashboard & Control Tower';
      case 'team': return 'Team Performance Scoreboard';
      case 'leads': return 'Leads & Conversion Intelligence';
      case 'orders': return 'Logistics & Production Pipeline';
      case 'payments': return 'Receivables & Collection Efficiency';
      case 'targets': return 'Corporate Target Assignment Board';
      case 'analytics': return 'Sales Trend Analytics';
      case 'users': return 'User Account Directory';
      case 'alerts': return 'Central Risk Alerts Control';
      case 'logs': return 'Roster Audit Logs & Activity Index';
      case 'settings': return 'System Settings & Thresholds';
      default: return 'Sales Admin Control Room';
    }
  };

  return (
    <div className="sales-admin-theme-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Global Filter Bar */}
      <div className="glass-card" style={{ 
        background: 'var(--bg-elevated)', 
        border: '1px solid var(--border-soft)',
        borderRadius: '16px',
        padding: '16px 24px',
        color: 'var(--text-primary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-premium)'
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px', margin: 0 }}>
            {getViewTitle()}
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            Sales Intelligence & Control Layer • Pure Read-Only Simulation
          </span>
        </div>

        {/* Filters Selectors Row - Hide for Sales Executive */}
        {!isExecutive && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Time Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-strong)' }}>
              <Calendar size={13} style={{ color: 'var(--color-primary)' }} />
              <select
                value={filters.time}
                onChange={(e) => setFilters(prev => ({ ...prev, time: e.target.value }))}
                style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
              >
                <option value="all">All Time</option>
                <option value="today">Today (June 15)</option>
                <option value="last7days">Last 7 Days</option>
                <option value="monthly">June 2026</option>
              </select>
            </div>

            {/* User Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-strong)' }}>
              <Users size={13} style={{ color: 'var(--color-primary)' }} />
              <select
                value={filters.user}
                onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
              >
                <option value="all">All Performers</option>
                {salesUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Performance Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-strong)' }}>
              <Target size={13} style={{ color: 'var(--color-primary)' }} />
              <select
                value={filters.performance}
                onChange={(e) => setFilters(prev => ({ ...prev, performance: e.target.value }))}
                style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
              >
                <option value="all">All Achievements</option>
                <option value="high">Excellent (≥ 100%)</option>
                <option value="stable">Stable (70–99%)</option>
                <option value="risk">Risk (40–69%)</option>
                <option value="critical">Critical (&lt; 40%)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Render Sub View */}
      <div style={{ width: '100%' }}>
        {renderView()}
      </div>
    </div>
  );
}

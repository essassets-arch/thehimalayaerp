'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/context/AuthContext';
import { useNotificationStore } from '@/store/notificationStore';
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  RefreshCw,
  Search,
  Trash2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Inbox,
  ArrowRight,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

function formatRelativeTime(dateStr?: string | null) {
  if (!dateStr) return 'Just now';
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return 'Recently';
  }
}

function getModuleBadge(moduleStr?: string | null, type?: string | null) {
  const m = (moduleStr || type || 'SYSTEM').toUpperCase().replace(/\s+/g, '_');
  
  if (m.includes('HR') || m.includes('EMPLOYEE') || m.includes('LEAVE') || m.includes('ATTENDANCE')) {
    return { label: '#HR', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
  }
  if (m.includes('SUPER_ADMIN') || m.includes('ADMIN')) {
    return { label: '#SUPER_ADMIN', bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
  }
  if (m.includes('SALES') || m.includes('LEAD') || m.includes('QUOTATION') || m.includes('ORDER')) {
    return { label: '#SALES', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
  }
  if (m.includes('PLANT') || m.includes('PLANT_HEAD')) {
    return { label: '#PLANT_HEAD', bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' };
  }
  if (m.includes('PRODUCTION') || m.includes('WORK_ORDER')) {
    return { label: '#PRODUCTION', bg: '#fff7ed', color: '#c2410c', border: '#ffedd5' };
  }
  if (m.includes('STORE') || m.includes('INVENTORY') || m.includes('STOCK')) {
    return { label: '#STORE', bg: '#ecfeff', color: '#0e7490', border: '#cffafe' };
  }
  if (m.includes('QC') || m.includes('QUALITY')) {
    return { label: '#QC', bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8' };
  }
  if (m.includes('FINANCE') || m.includes('PAYMENT') || m.includes('SALARY')) {
    return { label: '#FINANCE', bg: '#f0fdfa', color: '#0f766e', border: '#ccfbf1' };
  }
  if (m.includes('DISPATCH') || m.includes('LOGISTICS')) {
    return { label: '#DISPATCH', bg: '#f8fafc', color: '#334155', border: '#cbd5e1' };
  }

  return { label: `#${m}`, bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
}

function getPriorityMeta(priority?: string | null) {
  const p = (priority || 'MEDIUM').toUpperCase();
  if (p === 'CRITICAL' || p === 'URGENT') {
    return { label: 'CRITICAL', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', Icon: ShieldAlert };
  }
  if (p === 'HIGH') {
    return { label: 'HIGH', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', Icon: AlertTriangle };
  }
  if (p === 'LOW') {
    return { label: 'LOW', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', Icon: Info };
  }
  return { label: 'MEDIUM', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', Icon: Info };
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    totalCount,
    isLoading,
    isMarkingAllRead,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [filterTab, setFilterTab] = useState<'ALL' | 'UNREAD' | 'HIGH' | 'HR' | 'SALES' | 'PRODUCTION' | 'FINANCE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredList = useMemo(() => {
    return notifications.filter((n: any) => {
      // Tab filter
      if (filterTab === 'UNREAD' && (n.isRead || n.is_read)) return false;
      if (filterTab === 'HIGH' && n.priority !== 'HIGH' && n.priority !== 'CRITICAL') return false;
      
      const moduleBadge = getModuleBadge(n.module, n.type).label;
      if (filterTab === 'HR' && !moduleBadge.includes('HR')) return false;
      if (filterTab === 'SALES' && !moduleBadge.includes('SALES')) return false;
      if (filterTab === 'PRODUCTION' && !moduleBadge.includes('PRODUCTION') && !moduleBadge.includes('PLANT')) return false;
      if (filterTab === 'FINANCE' && !moduleBadge.includes('FINANCE')) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = n.title?.toLowerCase().includes(q);
        const msgMatch = n.message?.toLowerCase().includes(q);
        const modMatch = n.module?.toLowerCase().includes(q);
        if (!titleMatch && !msgMatch && !modMatch) return false;
      }

      return true;
    });
  }, [notifications, filterTab, searchQuery]);

  const handleNotificationClick = (item: any) => {
    if (item.id) markAsRead(item.id);

    if (item.route && typeof item.route === 'string' && item.route.startsWith('/')) {
      router.push(item.route);
      return;
    }

    // Role-based safe fallback
    const roleCode = (user?.role || '').toUpperCase();
    if (roleCode.includes('HR')) router.push('/hr/employees');
    else if (roleCode.includes('SUPER') || roleCode.includes('ADMIN')) router.push('/super-admin');
    else if (roleCode.includes('SALES')) router.push('/sales');
    else if (roleCode.includes('PLANT')) router.push('/plant-head');
    else if (roleCode.includes('PRODUCTION')) router.push('/production');
    else if (roleCode.includes('STORE')) router.push('/store');
    else if (roleCode.includes('QC')) router.push('/qc');
    else if (roleCode.includes('FINANCE')) router.push('/finance');
    else if (roleCode.includes('DISPATCH')) router.push('/dispatch');
    else router.push('/dashboard');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
            }}
          >
            <Bell size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
              Notifications &amp; System Alerts
            </h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              {unreadCount > 0 ? (
                <span>
                  You have <strong style={{ color: '#0284c7' }}>{unreadCount} unread</strong> notification{unreadCount === 1 ? '' : 's'}
                </span>
              ) : (
                'All caught up! No pending unread notifications.'
              )}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => fetchNotifications()}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              color: '#334155',
              fontSize: '13px',
              fontWeight: '700',
              cursor: isLoading ? 'wait' : 'pointer',
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => markAllAsRead()}
            disabled={isMarkingAllRead || unreadCount === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: unreadCount === 0 ? '#f1f5f9' : '#0284c7',
              border: 'none',
              color: unreadCount === 0 ? '#94a3b8' : '#ffffff',
              fontSize: '13px',
              fontWeight: '700',
              cursor: unreadCount === 0 || isMarkingAllRead ? 'not-allowed' : 'pointer',
              boxShadow: unreadCount > 0 ? '0 2px 8px rgba(2, 132, 199, 0.3)' : 'none',
            }}
          >
            <CheckCircle2 size={15} />
            {isMarkingAllRead ? 'Marking...' : 'Mark All as Read'}
          </button>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid #e2e8f0',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Alerts', count: totalCount },
              { id: 'UNREAD', label: 'Unread', count: unreadCount },
              { id: 'HIGH', label: 'High Priority', count: notifications.filter((n: any) => n.priority === 'HIGH' || n.priority === 'CRITICAL').length },
              { id: 'HR', label: '#HR', count: notifications.filter((n: any) => getModuleBadge(n.module, n.type).label.includes('HR')).length },
              { id: 'SALES', label: '#SALES', count: notifications.filter((n: any) => getModuleBadge(n.module, n.type).label.includes('SALES')).length },
              { id: 'PRODUCTION', label: '#PRODUCTION', count: notifications.filter((n: any) => getModuleBadge(n.module, n.type).label.includes('PRODUCTION') || getModuleBadge(n.module, n.type).label.includes('PLANT')).length },
              { id: 'FINANCE', label: '#FINANCE', count: notifications.filter((n: any) => getModuleBadge(n.module, n.type).label.includes('FINANCE')).length },
            ].map((tab) => {
              const active = filterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: active ? '800' : '600',
                    background: active ? '#0284c7' : '#f8fafc',
                    color: active ? '#ffffff' : '#475569',
                    border: active ? '1px solid #0284c7' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        background: active ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                        color: active ? '#ffffff' : '#334155',
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '12.5px',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredList.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px dashed #cbd5e1',
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#f0f9ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Inbox size={30} color="#0284c7" />
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              No Notifications Found
            </h3>
            <p style={{ margin: 0, fontSize: '13px', maxWidth: '340px' }}>
              {searchQuery
                ? `No alerts matching "${searchQuery}". Try clearing the search query.`
                : filterTab === 'UNREAD'
                ? 'All caught up! There are no unread notifications right now.'
                : 'No notification records present in this category.'}
            </p>
          </div>
        ) : (
          filteredList.map((n: any) => {
            const isRead = Boolean(n.isRead || n.is_read);
            const badge = getModuleBadge(n.module, n.type);
            const priority = getPriorityMeta(n.priority);
            const PriorityIcon = priority.Icon;

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  background: isRead ? '#ffffff' : '#f8fbff',
                  border: isRead ? '1.5px solid #e2e8f0' : '1.5px solid #93c5fd',
                  borderLeft: isRead ? '4px solid #cbd5e1' : '4px solid #0284c7',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isRead ? '0 1px 3px rgba(0,0,0,0.02)' : '0 4px 14px rgba(2, 132, 199, 0.08)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0284c7';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isRead ? '#e2e8f0' : '#93c5fd';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', gap: '14px', flex: 1, minWidth: 0 }}>
                  {/* Priority Icon Dot */}
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: priority.bg,
                      border: `1px solid ${priority.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <PriorityIcon size={18} color={priority.color} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Top Row Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {badge.label}
                      </span>

                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: '700',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          background: priority.bg,
                          color: priority.color,
                          border: `1px solid ${priority.border}`,
                        }}
                      >
                        {priority.label}
                      </span>

                      <span style={{ fontSize: '11.5px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {formatRelativeTime(n.createdAt || n.created_at)}
                      </span>

                      {!isRead && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: '800',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: '#0284c7',
                            color: '#ffffff',
                          }}
                        >
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '14.5px',
                        fontWeight: isRead ? '700' : '800',
                        color: isRead ? '#334155' : '#0f172a',
                        wordBreak: 'break-word',
                      }}
                    >
                      {n.title}
                    </h4>

                    {/* Message Body */}
                    <p
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        color: '#64748b',
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                      }}
                    >
                      {n.message}
                    </p>
                  </div>
                </div>

                {/* Right Action */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                  <button
                    type="button"
                    style={{
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      color: '#0284c7',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Open <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

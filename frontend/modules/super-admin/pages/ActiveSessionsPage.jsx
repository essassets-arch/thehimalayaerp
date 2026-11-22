'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  Terminal,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Search,
  Power,
  LogOut,
  Users,
  Activity,
  Wifi,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { backendFetch } from '../../../lib/backendFetch';
import { useToast } from '../../../shared/context/ToastContext';

function formatRelativeTime(iso) {
  if (!iso) return '—';
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 15) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatIstDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function DeviceIcon({ type }) {
  const norm = String(type || '').toUpperCase();
  if (norm === 'MOBILE') return <Smartphone size={16} color="#0284c7" />;
  if (norm === 'TABLET') return <Tablet size={16} color="#7c3aed" />;
  if (norm === 'API') return <Terminal size={16} color="#d97706" />;
  return <Monitor size={16} color="#2563eb" />;
}

function PresenceBadge({ status }) {
  if (status === 'ONLINE') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 10px',
          borderRadius: '999px',
          background: '#dcfce7',
          color: '#15803d',
          fontSize: '11px',
          fontWeight: 700,
          border: '1px solid #86efac',
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#16a34a',
            boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.25)',
          }}
        />
        LIVE ONLINE
      </span>
    );
  }
  if (status === 'ACTIVE') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 10px',
          borderRadius: '999px',
          background: '#dbeafe',
          color: '#1d4ed8',
          fontSize: '11px',
          fontWeight: 700,
          border: '1px solid #93c5fd',
        }}
      >
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2563eb' }} />
        ACTIVE
      </span>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '999px',
        background: '#fef3c7',
        color: '#b45309',
        fontSize: '11px',
        fontWeight: 700,
        border: '1px solid #fde68a',
      }}
    >
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#d97706' }} />
      IDLE SESSION
    </span>
  );
}

export default function ActiveSessionsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  const [summary, setSummary] = useState({
    totalActiveSessions: 0,
    uniqueLoggedInUsers: 0,
    liveOnlineNow: 0,
    revokedToday: 0,
    byRole: [],
  });
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [busyId, setBusyId] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const searchTimerRef = useRef(null);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  const fetchSessions = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setRefreshing(true);
      setError(null);
      try {
        const qs = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (debouncedSearch.trim()) qs.set('search', debouncedSearch.trim());
        if (roleFilter && roleFilter !== 'ALL') qs.set('role', roleFilter);

        const res = await backendFetch(`/super-admin/sessions/active?${qs.toString()}`, {
          cacheTtlMs: 0,
        });

        const payload = res?.summary ? res : res?.data || {};
        setSummary(
          payload.summary || {
            totalActiveSessions: 0,
            uniqueLoggedInUsers: 0,
            liveOnlineNow: 0,
            revokedToday: 0,
            byRole: [],
          },
        );
        setSessions(Array.isArray(payload.items) ? payload.items : []);
        setPagination(payload.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 });
        setLastUpdated(new Date());
      } catch (err) {
        setError(err?.message || 'Failed to load active sessions.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, limit, debouncedSearch, roleFilter],
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchSessions({ silent: true });
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchSessions]);

  const executeConfirmAction = async () => {
    if (!confirmModal) return;
    const action = confirmModal;
    setConfirmModal(null);
    setBusyId(action.busyKey);

    try {
      if (action.type === 'kill-session') {
        await backendFetch(`/super-admin/sessions/${action.sessionId}`, {
          method: 'DELETE',
          body: { reason: 'Session terminated by Super Admin from Active Sessions Command Center.' },
        });
        showToast?.(`Session terminated for ${action.userName}. They have been logged out immediately.`);
      } else if (action.type === 'kill-user') {
        const res = await backendFetch(`/super-admin/sessions/user/${action.userId}/revoke-all`, {
          method: 'POST',
          body: { reason: 'All devices logged out by Super Admin.' },
        });
        showToast?.(
          `Force-logged out ${action.userName} (${res?.revokedCount ?? 1} active session(s) terminated).`,
        );
      } else if (action.type === 'kill-all') {
        const res = await backendFetch('/super-admin/sessions/revoke-all-others', {
          method: 'POST',
          body: { reason: 'Emergency system-wide session reset by Super Admin.' },
        });
        showToast?.(
          `Emergency Logout complete: ${res?.revokedCount ?? 0} session(s) revoked instantly.`,
        );
      }
      await fetchSessions();
    } catch (err) {
      showToast?.(err?.message || 'Failed to terminate session.');
    } finally {
      setBusyId(null);
    }
  };

  const roleOptions = ['ALL', ...Array.from(new Set((summary.byRole || []).map((r) => r.role)))];

  return (
    <div style={{ padding: '20px 24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0f172a, #1e40af)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                Live Active Sessions &amp; Kill-Switch
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                Monitor every logged-in user in real time and terminate compromised or idle sessions instantaneously (&lt; 1s).
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#475569',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '7px 12px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (15s)
          </label>

          <button
            type="button"
            onClick={() => fetchSessions()}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '13px',
              fontWeight: 700,
              cursor: refreshing ? 'wait' : 'pointer',
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            type="button"
            disabled={busyId === 'ALL' || summary.totalActiveSessions <= 1}
            onClick={() =>
              setConfirmModal({
                type: 'kill-all',
                busyKey: 'ALL',
                title: 'Emergency Logout All Other Users?',
                description:
                  'This will immediately revoke ALL active sessions across every employee and force-redirect them to the Login page. Your own Super Admin session will stay active.',
                confirmLabel: 'Kill All Other Sessions',
              })
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #dc2626',
              background: '#dc2626',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: busyId === 'ALL' || summary.totalActiveSessions <= 1 ? 'not-allowed' : 'pointer',
              opacity: busyId === 'ALL' || summary.totalActiveSessions <= 1 ? 0.55 : 1,
            }}
          >
            <ShieldAlert size={15} />
            Kill All Other Sessions
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Logged-In Users</span>
            <Users size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
            {loading ? '—' : summary.uniqueLoggedInUsers}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Unique accounts with valid sessions</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Sessions</span>
            <Activity size={18} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
            {loading ? '—' : summary.totalActiveSessions}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Total devices / browsers signed in</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px 18px', border: '1px solid #bbf7d0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Live Online Now</span>
            <Wifi size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#15803d' }}>
            {loading ? '—' : summary.liveOnlineNow}
          </div>
          <div style={{ fontSize: '12px', color: '#166534', marginTop: '4px' }}>Heartbeat / API activity &lt; 90s ago</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px 18px', border: '1px solid #fecaca', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>Revoked Today (IST)</span>
            <Power size={18} color="#dc2626" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#b91c1c' }}>
            {loading ? '—' : summary.revokedToday}
          </div>
          <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '4px' }}>Logged out or killed since midnight</div>
        </div>
      </div>

      {/* Role Distribution Pills + Filter Bar */}
      <div
        style={{
          background: '#fff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '14px 16px',
          marginBottom: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 320px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '380px' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, email, role, IP, device..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 600,
              background: '#fff',
              color: '#0f172a',
            }}
          >
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {r === 'ALL' ? 'All Roles' : r}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} />
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-IN')}` : 'Syncing...'}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            {error}
          </span>
          <button
            type="button"
            onClick={() => fetchSessions()}
            style={{
              background: '#b91c1c',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Sessions Table */}
      <div
        style={{
          background: '#fff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '940px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Role &amp; Dept</th>
                <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Device / Browser</th>
                <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Client IP</th>
                <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Login &amp; Last Active</th>
                <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td colSpan={7} style={{ padding: '16px' }}>
                      <div style={{ height: '18px', background: '#f1f5f9', borderRadius: '6px', width: '100%' }} />
                    </td>
                  </tr>
                ))
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    No active sessions match your current filters.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr
                    key={s.sessionId}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: s.isCurrentSession ? '#f0f9ff' : '#ffffff',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{s.userName}</span>
                        {s.isCurrentSession && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 7px',
                              borderRadius: '999px',
                              background: '#0284c7',
                              color: '#fff',
                            }}
                          >
                            THIS DEVICE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {s.email} {s.employeeCode ? `• ${s.employeeCode}` : ''}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{s.role}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>{s.department}</div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <PresenceBadge status={s.presenceStatus} />
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                        <DeviceIcon type={s.deviceType} />
                        <span>{s.deviceLabel}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontFamily: 'monospace' }}>
                        SID: {String(s.sessionId).slice(0, 8)}…
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: '#334155',
                          background: '#f1f5f9',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {s.ipAddress || 'Unknown'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                        Active {formatRelativeTime(s.lastActiveAt)}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                        Login: {formatIstDateTime(s.loginAt)}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          disabled={s.isCurrentSession || busyId === s.sessionId}
                          onClick={() =>
                            setConfirmModal({
                              type: 'kill-session',
                              busyKey: s.sessionId,
                              sessionId: s.sessionId,
                              userName: s.userName,
                              title: `Terminate Session for ${s.userName}?`,
                              description: `This will immediately disconnect ${s.deviceLabel} (IP: ${s.ipAddress}) and redirect this device to the Login screen.`,
                              confirmLabel: 'Kill Session Now',
                            })
                          }
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 11px',
                            borderRadius: '7px',
                            border: '1px solid #fca5a5',
                            background: s.isCurrentSession ? '#f1f5f9' : '#fef2f2',
                            color: s.isCurrentSession ? '#94a3b8' : '#b91c1c',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: s.isCurrentSession ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <Power size={13} />
                          Kill Session
                        </button>

                        {!s.isCurrentSession && (
                          <button
                            type="button"
                            disabled={busyId === `user-${s.userId}`}
                            onClick={() =>
                              setConfirmModal({
                                type: 'kill-user',
                                busyKey: `user-${s.userId}`,
                                userId: s.userId,
                                userName: s.userName,
                                title: `Force Logout ${s.userName} on All Devices?`,
                                description: `Every active browser tab, phone, and API token belonging to ${s.email} will be permanently invalidated immediately.`,
                                confirmLabel: 'Logout All Devices',
                              })
                            }
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '6px 11px',
                              borderRadius: '7px',
                              border: '1px solid #dc2626',
                              background: '#dc2626',
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <LogOut size={13} />
                            Logout All
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            fontSize: '12.5px',
            color: '#475569',
          }}
        >
          <span>
            Showing <strong>{sessions.length}</strong> of <strong>{pagination.total}</strong> active session(s)
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '7px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                opacity: page <= 1 ? 0.5 : 1,
                fontWeight: 600,
              }}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span style={{ fontWeight: 700 }}>
              Page {pagination.page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '7px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                opacity: page >= pagination.totalPages ? 0.5 : 1,
                fontWeight: 600,
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div
          onClick={() => setConfirmModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 10050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '22px 24px',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#fef2f2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldAlert size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  {confirmModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '14px 0 20px', fontSize: '13.5px', lineHeight: 1.55, color: '#475569' }}>
              {confirmModal.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmAction}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Calendar, Bell, ArrowUpRight, X, AlertTriangle, CheckCircle2, Info, Zap } from 'lucide-react';
import { useAuth } from '../shared/context/AuthContext';
import { useNotifications } from '../shared/context/NotificationContext';

// Notification category icon/color map
const getPriorityMeta = (priority, read) => {
  if (priority === 'High' || priority === 'Critical')
    return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', Icon: AlertTriangle };
  if (priority === 'Medium')
    return { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', Icon: Zap };
  return { color: '#10b981', bg: 'rgba(16,185,129,0.08)', Icon: Info };
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  // Try to parse ISO or simple date strings
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
};

export default function HeroBanner({ 
  stats = [], 
  searchQuery = '',
  setSearchQuery,
  onActionClick,
  notifications: propNotifications,
  onNavigate,
  onAddLead,
  onCreateQuote,
  isDashboard: propIsDashboard,
}) {
  const { user } = useAuth();
  const { notifications, unreadCount, totalCount, markAllAsRead, isMarkingAllRead } = useNotifications();
  
  const searchInputRef = useRef(null);
  const navigate = useRouter();
  const location = { pathname: usePathname(), search: "" };
  // Treat root-level paths (e.g. "/", "/sales", "/admin") as dashboard — show full banner + stats
  const isDashboard = propIsDashboard ?? /^\/[^/]*$/.test(location.pathname);

  const handleViewAll = () => {
    setShowNotifications(false);
    navigate.push('/notifications');
  };
  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchDebounceRef = useRef(null);
  
  // Interactive Header Dropdown/Modal States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(12);
  const [notifFilter, setNotifFilter] = useState('All'); // 'All' | 'Unread' | 'High'
  const isMobile = useMediaQuery('(max-width: 768px)');


  // Live Search State
  const [searchResults, setSearchResults] = useState([]);
  const [searchGrouped, setSearchGrouped] = useState({});
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Keyboard shortcut CMD/Ctrl + K focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowCalendarModal(false);
        setShowSearchDropdown(false);
        setSearchResults([]);
        setSearchGrouped({});
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
        setSearchResults([]);
        setSearchGrouped({});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manage body class for mobile scroll locking
  useEffect(() => {
    if (showNotifications) {
      document.body.classList.add('notification-open');
    } else {
      document.body.classList.remove('notification-open');
    }
    return () => {
      document.body.classList.remove('notification-open');
    };
  }, [showNotifications]);


  const handleNotificationBellClick = () => {
    const willOpen = !showNotifications;
    setShowNotifications(willOpen);
    setShowCalendarModal(false);
    if (willOpen) {
      setNotifFilter('All'); // always reset to All tab on fresh open
    }
  };

  // Filtered notifications based on tab
  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === 'Unread') return !n.is_read;
    if (notifFilter === 'High') return n.priority === 'High' || n.priority === 'Critical';
    if (notifFilter === 'Read') return n.is_read;
    return true;
  });

  // Mock Calendar events for June 2026
  const calendarEvents = {
    5: { title: 'Order #ORD-0801 Booked', desc: 'Titan Industries (₹12.50 L)' },
    8: { title: 'Invoice INV-1002 Created', desc: 'Nexus Tech Ltd (₹4.00 L)' },
    10: { title: 'Quotation #QTN-201 Drafted', desc: 'Global Infra Corp' },
    11: { title: 'Concrete Cylinders Dispatch', desc: 'Apex Industries (₹2.80 L)' },
    12: { title: 'New Lead Registered', desc: 'Quantum Systems (John Doe)' }
  };

  const getCalendarDays = () => {
    const days = [];
    days.push(null);
    for (let i = 1; i <= 30; i++) {
      days.push(i);
    }
    return days;
  };

  const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // ── Live Global Search (Grouped) ────────────────────────────────────────────
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery?.(val);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (val.trim().length < 2) {
      setSearchResults([]);
      setSearchGrouped({});
      setShowSearchDropdown(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`/api/search?q=${encodeURIComponent(val.trim())}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.results || []);
          setSearchGrouped(data.grouped || {});
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.warn('[Search] API error:', err.message);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  // Use the route field from the backend — no frontend entity switching needed
  const handleSearchResultClick = (item) => {
    setShowSearchDropdown(false);
    setSearchResults([]);
    setSearchGrouped({});
    setSearchQuery?.('');
    if (item.route) navigate.push(item.route);
  };

  // Color palette per entity section header
  const ENTITY_PALETTE = {
    leads:              { color: '#a78bfa', label: 'LEADS' },
    orders:             { color: '#60a5fa', label: 'ORDERS' },
    customers:          { color: '#fbbf24', label: 'CUSTOMERS' },
    samples:            { color: '#34d399', label: 'SAMPLES' },
    invoices:           { color: '#6ee7b7', label: 'INVOICES' },
    'work-orders':      { color: '#f472b6', label: 'WORK ORDERS' },
    dispatches:         { color: '#fb923c', label: 'DISPATCHES' },
    'material-requests':{ color: '#a3e635', label: 'MATERIAL REQUESTS' },
    'purchase-orders':  { color: '#38bdf8', label: 'PURCHASE ORDERS' },
    products:           { color: '#c084fc', label: 'PRODUCTS' },
    vendors:            { color: '#facc15', label: 'VENDORS' },
    employees:          { color: '#8893A7', label: 'EMPLOYEES' },
  };

  return (
    <header className={`hero-banner ${!isDashboard ? 'compact' : ''}`}>
      {/* Top Integrated Header */}
      <div className="hero-top-row">
        <h1 className="brand-title" style={{ cursor: 'pointer' }} onClick={() => navigate.push('/')}>Himalaya</h1>
        
        {/* Live Search with Backend Results Dropdown */}
        <div className="hero-search" ref={searchContainerRef} style={{ position: 'relative' }}>
          <Search size={15} strokeWidth={1.75} style={{ color: searchLoading ? '#3BAEEB' : 'rgba(255, 255, 255, 0.8)', transition: 'color 0.2s' }} />
          <input 
            type="text" 
            placeholder="Search leads, orders, invoices... (⌘K)" 
            id="searchInput" 
            ref={searchInputRef}
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchResults.length > 0) setShowSearchDropdown(true);
            }}
            autoComplete="off"
          />

          {/* Grouped Categorized Search Results Dropdown */}
          {showSearchDropdown && (
            <div className="hero-search-dropdown" style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              minWidth: '420px',
              maxHeight: '520px',
              overflowY: 'auto',
              background: 'rgba(8, 16, 30, 0.98)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px',
              boxShadow: '0 28px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
              zIndex: 9999,
              animation: 'slideDown 0.18s ease',
            }}>

              {/* Loading State */}
              {searchLoading && (
                <div style={{ padding: '16px 18px', color: 'rgba(255,255,255,0.38)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '14px', height: '14px', border: '2px solid rgba(96,165,250,0.25)', borderTopColor: '#60a5fa', borderRadius: '50%', flexShrink: 0, animation: 'spin 0.7s linear infinite' }} />
                  Searching Himalaya ERP...
                </div>
              )}

              {/* Empty State */}
              {!searchLoading && searchResults.length === 0 && (
                <div style={{ padding: '24px 18px', textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: '13px' }}>No results for &ldquo;{searchQuery}&rdquo;</div>
                  <div style={{ color: 'rgba(255,255,255,0.12)', fontSize: '11px', marginTop: '4px' }}>Try a different keyword or identifier</div>
                </div>
              )}

              {/* Grouped Results — one section per entity type */}
              {!searchLoading && Object.entries(searchGrouped).map(([sectionKey, items]) => {
                const palette = ENTITY_PALETTE[sectionKey] || { color: '#8893A7', label: sectionKey.toUpperCase() };
                return (
                  <div key={sectionKey}>
                    {/* Section Header */}
                    <div style={{
                      padding: '8px 18px 4px',
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      color: palette.color,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderTop: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <span>{palette.label}</span>
                      <span style={{ fontWeight: 400, opacity: 0.55 }}>({items.length})</span>
                    </div>

                    {/* Section Items */}
                    {items.map((item, idx) => (
                      <div
                        key={`${item.entity}-${item.id}-${idx}`}
                        onClick={() => handleSearchResultClick(item)}
                        style={{
                          padding: '9px 18px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.045)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                        {item.status && (
                          <span style={{
                            flexShrink: 0,
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontSize: '10px',
                            fontWeight: 600,
                            background: `${palette.color}18`,
                            color: palette.color,
                            border: `1px solid ${palette.color}28`,
                            whiteSpace: 'nowrap',
                          }}>
                            {item.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Footer */}
              {!searchLoading && searchResults.length > 0 && (
                <div style={{ padding: '8px 18px', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} across {Object.keys(searchGrouped).length} categor{Object.keys(searchGrouped).length !== 1 ? 'ies' : 'y'}</span>
                  <span>Esc to close</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="hero-actions" style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            className="hero-action-btn" 
            title="Calendar" 
            onClick={() => {
              setShowCalendarModal(true);
              setShowNotifications(false);
            }}
          >
            <Calendar size={16} strokeWidth={2.2} />
          </button>
          
          {/* ── NOTIFICATION BELL BUTTON ── */}
          <button 
            className="hero-action-btn" 
            title="Notifications" 
            id="notificationBellBtn"
            onClick={handleNotificationBellClick}
            style={{ position: 'relative' }}
          >
            <Bell
              size={16}
              strokeWidth={2.2}
              style={{
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: showNotifications ? 'rotate(-20deg)' : 'rotate(0deg)',
              }}
            />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                minWidth: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#ef4444',
                border: '1.5px solid rgba(20,50,60,0.9)',
                color: '#fff',
                fontSize: '9px',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                lineHeight: 1,
                animation: 'notifPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 1px 4px rgba(239,68,68,0.6)',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* ── NOTIFICATION BACKDROP (Portaled on mobile, inline on desktop) ── */}
          {showNotifications && isMobile && createPortal(
            <div 
              className="notification-backdrop" 
              onClick={() => setShowNotifications(false)}
            />,
            document.body
          )}

          {/* ── PREMIUM NOTIFICATION DROPDOWN ── */}
          {showNotifications && (() => {
            const dropdownEl = (
              <div
                id="notificationDropdown"
                style={{
                  position: isMobile ? 'fixed' : 'absolute',
                  top: isMobile ? '76px' : 'calc(100% + 12px)',
                  right: isMobile ? '16px' : 0,
                  left: isMobile ? '16px' : 'auto',
                  bottom: isMobile ? '16px' : 'auto',
                  width: isMobile ? 'auto' : 'min(360px, calc(100vw - 24px))',
                  maxHeight: isMobile ? 'calc(100vh - 92px)' : 'none',
                  background: '#ffffff',
                  borderRadius: '20px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(226,232,240,0.8)',
                  zIndex: 10015,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  animation: isMobile ? 'none' : 'dropdownSlideIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '16px 18px 12px',
                  borderBottom: '1px solid rgba(226,232,240,0.6)',
                  background: 'linear-gradient(135deg, #F5FAFE 0%, #ffffff 100%)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #2F4375, #3BAEEB)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Bell size={14} color="#ffffff" />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#24345C' }}>
                          {user?.role} Alerts
                        </div>
                        <div style={{ fontSize: '10px', color: '#5E6B82', fontWeight: '600' }}>
                          {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={markAllAsRead}
                        disabled={isMarkingAllRead || unreadCount === 0}
                        style={{
                          background: unreadCount === 0 ? '#f1f5f9' : '#f0fdf4',
                          border: `1px solid ${unreadCount === 0 ? '#DCE5F0' : '#bbf7d0'}`,
                          color: unreadCount === 0 ? '#8893A7' : '#16a34a',
                          borderRadius: '8px',
                          padding: '4px 10px', fontSize: '10px', fontWeight: '700',
                          cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px',
                          opacity: isMarkingAllRead ? 0.7 : 1,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isMarkingAllRead ? (
                          <>
                            <span style={{ width: '10px', height: '10px', border: '2px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                            Marking...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={10} />
                            Mark all read
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowNotifications(false)}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: '#8893A7', padding: '4px', borderRadius: '6px',
                          display: 'flex', alignItems: 'center',
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
                    {[
                      { label: 'All', count: notifications.length },
                      { label: 'Unread', count: notifications.filter(n => !n.is_read).length },
                      { label: 'High', count: notifications.filter(n => n.priority === 'High' || n.priority === 'Critical').length },
                      { label: 'Read', count: notifications.filter(n => n.is_read).length },
                    ].map(tab => (
                      <button
                        key={tab.label}
                        onClick={() => setNotifFilter(tab.label)}
                        style={{
                          flex: 1, border: 'none', cursor: 'pointer',
                          borderRadius: '8px', padding: '5px 8px',
                          background: notifFilter === tab.label ? '#ffffff' : 'transparent',
                          color: notifFilter === tab.label ? '#24345C' : '#5E6B82',
                          fontWeight: notifFilter === tab.label ? '700' : '600',
                          fontSize: '11px',
                          boxShadow: notifFilter === tab.label ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                          transition: 'all 0.15s ease',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        }}
                      >
                        {tab.label}
                        {tab.count > 0 && (
                          <span style={{
                            fontSize: '9px', fontWeight: '800', minWidth: '16px', height: '16px',
                            borderRadius: '8px', padding: '0 4px',
                             background: notifFilter === tab.label
                              ? (tab.label === 'High' ? '#ef4444' : tab.label === 'Unread' ? '#3b82f6' : tab.label === 'Read' ? '#10b981' : '#334155')
                              : '#D6E2F0',
                            color: notifFilter === tab.label ? '#ffffff' : '#5E6B82',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            lineHeight: 1,
                          }}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notification List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px', minHeight: 0 }}>
                  {filteredNotifications.length === 0 ? (
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', padding: '32px 20px', gap: '10px',
                    }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <CheckCircle2 size={22} color="#8893A7" />
                      </div>
                      <span style={{ fontSize: '12px', color: '#8893A7', fontWeight: '600', textAlign: 'center' }}>
                        {notifFilter === 'Unread' ? 'All caught up! No unread alerts.' :
                         notifFilter === 'High' ? 'No high priority alerts.' :
                         notifFilter === 'Read' ? 'No read alerts yet.' :
                         'No notifications yet.'}
                      </span>
                    </div>
                  ) : (
                    filteredNotifications.slice(0, 8).map((n, idx) => {
                      const { color, bg, Icon } = getPriorityMeta(n.priority, n.is_read);
                      return (
                        <div
                          key={n.id || idx}
                          style={{
                            display: 'flex', gap: '10px', padding: '10px 10px',
                            borderRadius: '12px', cursor: 'default',
                            background: n.is_read ? 'transparent' : 'rgba(248,250,252,0.8)',
                            border: n.is_read ? '1px solid transparent' : '1px solid rgba(226,232,240,0.6)',
                            marginBottom: '4px',
                            transition: 'background 0.15s ease',
                            opacity: n.is_read ? 0.65 : 1,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#F5FAFE'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(248,250,252,0.8)'; }}
                        >
                          {/* Icon dot */}
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '9px',
                            background: bg, border: `1px solid ${color}25`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, marginTop: '1px',
                          }}>
                            <Icon size={14} color={color} strokeWidth={2.5} />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <span style={{
                                fontSize: '12.5px', fontWeight: '700', color: '#24345C',
                                lineHeight: 1.3, flex: 1,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>
                                {n.title}
                              </span>
                              <span style={{
                                fontSize: '9px', fontWeight: '700',
                                color: color, background: bg,
                                padding: '2px 6px', borderRadius: '6px',
                                border: `1px solid ${color}30`,
                                whiteSpace: 'nowrap', flexShrink: 0,
                              }}>
                                {n.priority || 'Normal'}
                              </span>
                            </div>
                            <p style={{
                              fontSize: '11px', color: '#5E6B82', margin: '4px 0 0 0',
                              lineHeight: 1.45, fontWeight: '500',
                              overflow: 'hidden', textOverflow: 'ellipsis',
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            }}>
                              {n.message}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', color: '#8893A7', fontWeight: '500' }}>
                                {n.department && <span style={{ marginRight: '6px', color: '#5E6B82', fontWeight: '600' }}>#{n.department}</span>}
                                {formatRelativeTime(n.created_at || n.date)}
                              </span>
                              {!n.is_read && (
                                <span style={{
                                  width: '6px', height: '6px', borderRadius: '50%',
                                  background: '#3b82f6', display: 'inline-block', flexShrink: 0,
                                }} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {totalCount > 0 && (
                  <div style={{
                    padding: '10px 16px',
                    borderTop: '1px solid rgba(226,232,240,0.6)',
                    background: '#fafbfc',
                  }}>
                    <button
                      onClick={handleViewAll}
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        cursor: 'pointer', color: '#2F4375', fontSize: '12px',
                        fontWeight: '700', padding: '6px',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                      }}
                    >
                      View all {totalCount} notifications
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            );

            return isMobile ? createPortal(dropdownEl, document.body) : dropdownEl;
          })()}
        </div>
      </div>

      {/* Calendar Modal Overlay */}
      {showCalendarModal && (
        <div className="calendar-modal-overlay" onClick={() => setShowCalendarModal(false)} style={{ zIndex: 10000 }}>
          <div className="calendar-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-header">
              <span className="calendar-title">Daily Agenda Calendar</span>
              <button 
                onClick={() => setShowCalendarModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="calendar-body">
              <div className="calendar-grid-section">
                <div className="calendar-month-nav">
                  <span>June 2026</span>
                </div>
                <div className="calendar-grid">
                  {weekdayLabels.map((w, idx) => (
                    <div key={idx} className="calendar-weekday">{w}</div>
                  ))}
                  {getCalendarDays().map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="calendar-day-empty"></div>;
                    }
                    const hasEvent = calendarEvents[day] !== undefined;
                    const isSelected = selectedCalendarDay === day;
                    return (
                      <div 
                        key={`day-${day}`}
                        className={`calendar-day ${hasEvent ? 'has-event' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedCalendarDay(day)}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="calendar-events-section">
                <span className="calendar-events-title">Agenda for June {selectedCalendarDay}, 2026</span>
                {calendarEvents[selectedCalendarDay] ? (
                  <div className="calendar-event-item">
                    <span className="calendar-event-title">{calendarEvents[selectedCalendarDay].title}</span>
                    <span className="calendar-event-desc">{calendarEvents[selectedCalendarDay].desc}</span>
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                    No events scheduled for this date.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Stat cards row */}
      {isDashboard && stats.length > 0 && (
        <div className="hero-bottom-row">
          <div className="hero-stats-group">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={stat.id}
                  className={`glass-stat-card ${stat.theme}`}
                  onClick={() => onActionClick?.(stat.action, stat.msg)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="glass-stat-label">
                    <div className="glass-stat-label-left">
                      <Icon size={14} strokeWidth={2.2} />
                      <span>{stat.title}</span>
                    </div>
                    <span 
                      className="glass-stat-more" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onActionClick?.('Stats More', `Configuring ${stat.title} metrics...`); 
                      }}
                    >
                      ···
                    </span>
                  </div>
                  <div className="glass-stat-main">
                    <div className="glass-stat-value-group">
                      <span className="glass-stat-value">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </span>
                      {stat.subtext && (
                        <span className="glass-stat-subtext">
                          {stat.subtext}
                        </span>
                      )}
                    </div>
                    <div className="glass-stat-arrow">
                      <ArrowUpRight size={12} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes notifPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes dropdownSlideIn {
          0% { opacity: 0; transform: translateY(-8px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </header>
  );
}

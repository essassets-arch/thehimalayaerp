'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Bell, 
  Search, 
  Trash2, 
  Check, 
  CheckCheck, 
  Inbox, 
  AlertTriangle, 
  Info, 
  Zap, 
  Clock, 
  ChevronRight,
  Loader2,
  Filter,
  X
} from 'lucide-react';
import { useNotifications } from '../../../shared/context/NotificationContext';

// Priority UI mapping
const getPriorityMeta = (priority) => {
  const p = priority?.toLowerCase();
  if (p === 'high' || p === 'critical') {
    return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', label: 'High' };
  }
  if (p === 'medium') {
    return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)', label: 'Medium' };
  }
  return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)', label: 'Low' };
};

// Department UI tag mapping
const getDepartmentColor = (dept) => {
  const d = dept?.toLowerCase() || 'system';
  if (d.includes('sales')) return { color: '#3b82f6', bg: '#eff6ff' };
  if (d.includes('production')) return { color: '#8b5cf6', bg: '#f5f3ff' };
  if (d.includes('qc')) return { color: '#ec4899', bg: '#fdf2f8' };
  if (d.includes('store')) return { color: '#10b981', bg: '#ecfdf5' };
  if (d.includes('dispatch')) return { color: '#fb923c', bg: '#fff7ed' };
  if (d.includes('finance')) return { color: '#06b6d4', bg: '#ecfeff' };
  if (d.includes('hr')) return { color: '#5E6B82', bg: '#F5FAFE' };
  return { color: '#14b8a6', bg: '#f0fdfa' };
};

export default function NotificationCenter() {
  const navigate = useRouter();
  const { 
    notifications: contextNotifications, 
    markAllAsRead: contextMarkAllAsRead, 
    markAsRead: contextMarkAsRead, 
    deleteNotification: contextDeleteNotification,
    fetchBackendNotifications
  } = useNotifications();

  // Local Page Filters State
  const [localNotifications, setLocalNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [globalUnread, setGlobalUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Filter Values
  const [status, setStatus] = useState('All'); // 'All' | 'Unread' | 'Read'
  const [priority, setPriority] = useState('All'); // 'All' | 'High' | 'Medium' | 'Low'
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Keep track of latest context notifications to auto-integrate real-time notifications
  const lastNotifIdRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch paginated lists from the backend
  const fetchNotifications = useCallback(async (pageNum, isLoadMore = false) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const params = new URLSearchParams({
        page: pageNum,
        limit: 15,
        status: status === 'All' ? '' : status,
        priority: priority === 'All' ? '' : priority,
        search: debouncedSearch
      });

      const response = await fetch(`/api/notifications?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (isLoadMore) {
            setLocalNotifications(prev => {
              const combined = [...prev, ...data.notifications];
              // De-duplicate just in case
              return Array.from(new Map(combined.map(item => [item.id, item])).values());
            });
          } else {
            setLocalNotifications(data.notifications);
          }
          setTotal(data.total || 0);
          setGlobalUnread(data.unread || 0);
          setHasMore(pageNum < (data.pages || 1));
        }
      }
    } catch (err) {
      console.error('[NotificationCenter] Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [status, priority, debouncedSearch]);

  // Fetch when filters change
  useEffect(() => {
    setPage(1);
    fetchNotifications(1, false);
  }, [status, priority, debouncedSearch, fetchNotifications]);

  // Real-time integration from Context notifications
  useEffect(() => {
    if (contextNotifications.length > 0) {
      const latest = contextNotifications[0];
      if (lastNotifIdRef.current && latest.id !== lastNotifIdRef.current) {
        // A new notification has arrived in real-time! Let's check filters
        const matchesStatus = status === 'All' || (status === 'Unread' && !latest.is_read);
        const matchesPriority = priority === 'All' || latest.priority === priority;
        const matchesSearch = !debouncedSearch || 
          latest.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
          latest.message?.toLowerCase().includes(debouncedSearch.toLowerCase());

        if (matchesStatus && matchesPriority && matchesSearch) {
          setLocalNotifications(prev => {
            if (prev.some(n => n.id === latest.id)) return prev;
            return [latest, ...prev];
          });
          setTotal(prev => prev + 1);
        }
        setGlobalUnread(prev => prev + 1);
      }
      lastNotifIdRef.current = latest.id;
    }
  }, [contextNotifications, status, priority, debouncedSearch]);

  // Load next page
  const handleLoadMore = () => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  // Mark single as read
  const handleMarkAsRead = async (id) => {
    // Update local state first (optimistic)
    setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setGlobalUnread(prev => Math.max(0, prev - 1));
    await contextMarkAsRead(id);
  };

  // Delete single
  const handleDelete = async (id) => {
    const target = localNotifications.find(n => n.id === id);
    const wasUnread = target && !target.is_read;

    // Update local state first (optimistic)
    setLocalNotifications(prev => prev.filter(n => n.id !== id));
    setTotal(prev => Math.max(0, prev - 1));
    if (wasUnread) {
      setGlobalUnread(prev => Math.max(0, prev - 1));
    }
    await contextDeleteNotification(id);
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    setIsActionLoading(true);
    // Update local list optimistically
    setLocalNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setGlobalUnread(0);
    await contextMarkAllAsRead();
    setIsActionLoading(false);
  };

  // Click on item navigates to record details
  const handleItemClick = (n) => {
    if (!n.is_read) {
      handleMarkAsRead(n.id);
    }
    // Navigate based on module routes mapping
    const MODULE_ROUTES = {
      lead: '/sales/leads',
      sample: '/sales/samples',
      quotation: '/sales/quotations',
      sales_order: '/sales/orders',
      work_order: '/production/work-orders',
      material_request: '/production/material-requests',
      purchase_order: '/store/purchase/orders',
      dispatch: '/dispatch/dashboard',
      invoice: '/finance/invoices',
      payment: '/finance/po-requests'
    };

    const targetRoute = MODULE_ROUTES[n.reference_type] || n.navigation_url;
    if (targetRoute) {
      // If there is reference ID query parameter, navigate to it
      if (n.reference_id && !targetRoute.includes('?id=')) {
        navigate.push(`${targetRoute}?id=${n.reference_id}`);
      } else {
        navigate.push(targetRoute);
      }
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px 16px',
      minHeight: 'calc(100vh - 80px)',
      background: 'linear-gradient(to bottom, #F5FAFE, #f1f5f9)',
      fontFamily: '"Outfit", "Inter", sans-serif'
    }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #24345C 100%)',
        padding: '24px 32px',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
        marginBottom: '24px',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Bell size={24} color="#3BAEEB" />
          </div>
          <div>
            <h1 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '800', margin: 0 }}>Notification Center</h1>
            <p style={{ color: '#8893A7', fontSize: '12px', margin: '4px 0 0 0', fontWeight: '500' }}>
              Manage all department alerts, priorities, and workflow statuses.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleMarkAllAsRead}
            disabled={isActionLoading || globalUnread === 0}
            style={{
              background: globalUnread === 0 ? 'rgba(255,255,255,0.03)' : '#10b981',
              border: `1px solid ${globalUnread === 0 ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
              color: globalUnread === 0 ? '#5E6B82' : '#ffffff',
              padding: '10px 20px',
              borderRadius: '14px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: globalUnread === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: globalUnread === 0 ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.3)'
            }}
          >
            {isActionLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCheck size={16} />
            )}
            Mark all read ({globalUnread})
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Filters Sidebar (Card style) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
          padding: '24px',
          position: 'sticky',
          top: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Filter size={16} color="#5E6B82" />
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>FILTERS</span>
          </div>

          {/* Search Box */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#8893A7', letterSpacing: '0.05em', marginBottom: '8px' }}>
              SEARCH CONTENT
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="#8893A7" style={{ position: 'absolute', left: '12px', top: '12.5px' }} />
              <input 
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '12px',
                  border: '1px solid #DCE5F0',
                  fontSize: '13px',
                  color: '#334155',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '11px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#8893A7'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Status Tabs */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#8893A7', letterSpacing: '0.05em', marginBottom: '8px' }}>
              READ STATUS
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {['All', 'Unread', 'Read'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatus(tab)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: status === tab ? '700' : '500',
                    border: 'none',
                    cursor: 'pointer',
                    background: status === tab ? '#eff6ff' : 'transparent',
                    color: status === tab ? '#1d4ed8' : '#5E6B82',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{tab}</span>
                  {status === tab && <Check size={14} color="#1d4ed8" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {/* Priority filter */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#8893A7', letterSpacing: '0.05em', marginBottom: '8px' }}>
              PRIORITY LEVEL
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {['All', 'High', 'Medium', 'Low'].map(prio => (
                <button
                  key={prio}
                  onClick={() => setPriority(prio)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: priority === prio ? '700' : '500',
                    border: 'none',
                    cursor: 'pointer',
                    background: priority === prio ? '#faf5ff' : 'transparent',
                    color: priority === prio ? '#7e22ce' : '#5E6B82',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{prio} Level</span>
                  {priority === prio && <Check size={14} color="#7e22ce" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isLoading && page === 1 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: '#5E6B82'
            }}>
              <Loader2 size={32} className="animate-spin" color="#3b82f6" />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Loading notifications...</span>
            </div>
          ) : localNotifications.length === 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              padding: '80px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Inbox size={28} color="#8893A7" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: 0 }}>No notifications found</h3>
                <p style={{ fontSize: '12px', color: '#8893A7', margin: '4px 0 0 0', fontWeight: '500' }}>
                  We couldn't find any notifications matching the current filters.
                </p>
              </div>
            </div>
          ) : (
            <>
              {localNotifications.map((n) => {
                const priorityMeta = getPriorityMeta(n.priority);
                const deptMeta = getDepartmentColor(n.department);
                
                return (
                  <div
                    key={n.id}
                    style={{
                      background: n.read ? '#ffffff' : 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(16px)',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: n.read ? 'rgba(226,232,240,0.8)' : 'rgba(191,219,254,0.4)',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.01)',
                      padding: '20px',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'flex-start',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.03)';
                      if (!n.is_read) {
                        e.currentTarget.style.borderColor = 'rgba(191,219,254,0.8)';
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.01)';
                      e.currentTarget.style.borderColor = n.is_read ? 'rgba(226,232,240,0.8)' : 'rgba(191,219,254,0.4)';
                    }}
                  >
                    {/* Unread indicator border left */}
                    {!n.is_read && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        background: '#3b82f6'
                      }} />
                    )}

                    {/* Icon circle */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: priorityMeta.bg,
                      border: `1px solid ${priorityMeta.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Bell size={18} color={priorityMeta.color} strokeWidth={2.5} />
                    </div>

                    {/* Info Area */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span 
                          onClick={() => handleItemClick(n)}
                          style={{
                            fontSize: '14.5px',
                            fontWeight: '700',
                            color: '#1f2937',
                            cursor: 'pointer',
                            lineHeight: 1.3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#1d4ed8'}
                          onMouseLeave={e => e.currentTarget.style.color = '#1f2937'}
                        >
                          {n.title}
                          {(n.navigation_url || n.reference_id) && (
                            <ChevronRight size={14} style={{ color: '#8893A7', flexShrink: 0 }} />
                          )}
                        </span>
                        
                        {/* Tags */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            color: priorityMeta.color,
                            background: priorityMeta.bg,
                            border: `1px solid ${priorityMeta.border}`,
                            padding: '2px 8px',
                            borderRadius: '20px'
                          }}>
                            {priorityMeta.label}
                          </span>
                          
                          {n.department && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: '700',
                              color: deptMeta.color,
                              background: deptMeta.bg,
                              padding: '2px 8px',
                              borderRadius: '20px'
                            }}>
                              #{n.department}
                            </span>
                          )}
                        </div>
                      </div>

                      <p style={{
                        fontSize: '13px',
                        color: '#4b5563',
                        margin: 0,
                        lineHeight: 1.5,
                        fontWeight: n.is_read ? '400' : '500'
                      }}>
                        {n.message}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: '#8893A7', fontSize: '11px', fontWeight: '500' }}>
                        <Clock size={11} />
                        <span>{n.date}</span>
                      </div>
                    </div>

                    {/* Actions Area */}
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '8px' }}>
                      {!n.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          title="Mark as Read"
                          style={{
                            background: '#F5FAFE',
                            border: '1px solid #DCE5F0',
                            color: '#10b981',
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#f0fdf4';
                            e.currentTarget.style.borderColor = '#bbf7d0';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = '#F5FAFE';
                            e.currentTarget.style.borderColor = '#DCE5F0';
                          }}
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(n.id)}
                        title="Delete"
                        style={{
                          background: '#F5FAFE',
                          border: '1px solid #DCE5F0',
                          color: '#ef4444',
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#fef2f2';
                          e.currentTarget.style.borderColor = '#fecaca';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#F5FAFE';
                          e.currentTarget.style.borderColor = '#DCE5F0';
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Load More Button */}
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    color: '#334155',
                    padding: '12px 24px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    margin: '12px auto 0 auto',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.01)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#F5FAFE';
                    e.currentTarget.style.borderColor = '#D6E2F0';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
                  }}
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : null}
                  Load More Notifications
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

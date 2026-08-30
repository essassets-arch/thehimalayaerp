import React, { useState, useEffect, useCallback } from 'react';
import { getTodayDateString } from '../utils/taskEngine';
import TaskCard from './tasks/TaskCard';
import { 
  ClipboardList, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search, 
  Grid, 
  Check, 
  X,
  Plus
} from 'lucide-react';
import Swal from 'sweetalert2';
import { remindersService } from '../modules/sales/services/reminders.service.js';

export default function DailyTaskView({ state, dispatch, navigate, showToast, module = 'Sales', completeReminder, updateReminder }) {
  const [targetDate, setTargetDate] = useState(() => getTodayDateString());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All'); // Today, Upcoming, Overdue, Completed, All
  
  // Modals state
  const [rescheduleTask, setRescheduleTask] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const [dailyData, setDailyData] = useState({ items: [], summary: { total: 0, pending: 0, completed: 0, overdue: 0, upcoming: 0 } });
  const [loading, setLoading] = useState(false);

  const fetchDailyTasks = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch reminders scoped by module (Finance vs Sales)
      const res = await remindersService.getDaily({ module });
      if (res.success && res.data) {
        setDailyData({
          items: res.data.items || [],
          summary: res.data.summary || { total: 0, pending: 0, completed: 0, overdue: 0, upcoming: 0 }
        });
      }
    } catch (err) {
      console.error('Error loading daily tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [module]);

  useEffect(() => {
    fetchDailyTasks();
  }, [fetchDailyTasks, state?.reminders]);

  const leads = state?.leads || [];
  const quotations = state?.quotations || [];
  const baseDateTime = new Date(targetDate + 'T00:00:00').getTime();

  const atRiskLeads = leads.filter(l => {
    if (!l.followUpDate) return false;
    const fup = new Date(l.followUpDate).getTime();
    return fup <= baseDateTime && l.status !== 'Converted' && l.status !== 'Lost';
  });

  const atRiskQuotes = quotations.filter(q => {
    if (!q.validTill) return false;
    const expiry = new Date(q.validTill).getTime();
    return expiry <= baseDateTime + (86400000 * 2) && q.status !== 'Approved' && q.status !== 'Closed';
  });

  // Helper to convert date object or ISO string to standard YYYY-MM-DD comparison key
  const toDateKey = (dateVal) => {
    if (!dateVal) return '';
    if (dateVal instanceof Date) return dateVal.toISOString().split('T')[0];
    if (typeof dateVal === 'string') return dateVal.split('T')[0];
    return '';
  };

  const selectedDateKey = toDateKey(targetDate);
  const now = new Date();

  // 1. Strict module isolation and tab filtering
  const sourceFilteredTasks = (dailyData.items || []).filter(task => {
    const sType = String(task.sourceType || task.moduleType || '').toUpperCase();

    if (module === 'Finance') {
      const isFinanceType = ['PAYMENT', 'PAYMENT_FOLLOWUP', 'SALESORDER', 'ORDER', 'INVOICE', 'FINANCE'].includes(sType);
      if (!isFinanceType) return false;

      if (activeTab === 'All') return true;
      if (activeTab === 'Payments') return ['PAYMENT', 'PAYMENT_FOLLOWUP', 'INVOICE'].includes(sType);
      if (activeTab === 'Orders') return ['ORDER', 'SALESORDER'].includes(sType);
      return true;
    } else if (module === 'Sales' || module === 'SuperSales') {
      if (activeTab === 'All') return true;
      if (activeTab === 'Leads') return sType === 'LEAD';
      if (activeTab === 'Quotations') return sType === 'QUOTATION';
      if (activeTab === 'Samples') return sType === 'SAMPLE' || sType === 'SAMPLEREQUEST';
      if (activeTab === 'Payments') return ['PAYMENT', 'PAYMENT_FOLLOWUP', 'INVOICE'].includes(sType);
      if (activeTab === 'Orders') return ['ORDER', 'SALESORDER'].includes(sType);
      return true;
    }

    if (activeTab === 'All') return true;
    if (activeTab === 'Leads') return sType === 'LEAD';
    if (activeTab === 'Quotations') return sType === 'QUOTATION';
    if (activeTab === 'Samples') return sType === 'SAMPLE' || sType === 'SAMPLEREQUEST';
    if (activeTab === 'Payments') return ['PAYMENT', 'PAYMENT_FOLLOWUP', 'INVOICE'].includes(sType);
    if (activeTab === 'Orders') return ['ORDER', 'SALESORDER'].includes(sType);
    return true;
  });

  // 2. Compute dynamic counters for metrics cards based on sourceFilteredTasks
  const pendingTasks = sourceFilteredTasks.filter(t => t.status === 'Pending');
  const todayTasks = pendingTasks.filter(t => toDateKey(t.reminderAt) === selectedDateKey);
  const overdueTasks = pendingTasks.filter(t => toDateKey(t.reminderAt) < selectedDateKey);
  const completedTasks = sourceFilteredTasks.filter(t => t.status === 'Completed');

  // 3. Filter displayed list by active status tab and search queries
  const filteredTasks = sourceFilteredTasks.filter(task => {
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      const matches = (task.customerName?.toLowerCase().includes(sq) || false) ||
                      (task.description?.toLowerCase().includes(sq) || false) ||
                      (task.title?.toLowerCase().includes(sq) || false);
      if (!matches) return false;
    }

    const taskDateKey = toDateKey(task.reminderAt);
    const isPending = task.status === 'Pending';

    switch (filterStatus) {
      case 'Today':
        return isPending && taskDateKey === selectedDateKey;
      case 'Upcoming':
        return isPending && taskDateKey > selectedDateKey;
      case 'Overdue':
        return isPending && taskDateKey < selectedDateKey;
      case 'Completed':
        return task.status === 'Completed';
      case 'All':
      default:
        return true;
    }
  });

  // 4. Map filtered list to expected TaskCard schema
  const mappedTasks = filteredTasks.map(item => {
    let type = module === 'Finance' ? 'Payment' : 'Lead';
    const sType = String(item.sourceType || item.moduleType || '').toUpperCase();
    if (sType === 'LEAD') type = 'Lead';
    else if (sType === 'SAMPLE' || sType === 'SAMPLEREQUEST') type = 'Sample';
    else if (sType === 'QUOTATION') type = 'Quotation';
    else if (sType === 'PAYMENT' || sType === 'PAYMENT_FOLLOWUP') type = 'Payment';
    else if (sType === 'SALESORDER' || sType === 'ORDER') type = 'Order';
    else if (sType === 'INVOICE') type = 'Payment';

    const itemDate = new Date(item.reminderAt);
    const isOverdue = item.status === 'Pending' && item.reminderAt && itemDate < now && toDateKey(item.reminderAt) !== toDateKey(now);

    return {
      id: `REM-${item.id}`,
      sourceId: item.id,
      clientName: item.customerName || 'N/A',
      type,
      status: isOverdue ? 'Overdue' : (item.status === 'Completed' ? 'Completed' : 'Pending'),
      followUpDate: item.reminderAt ? toDateKey(item.reminderAt) : targetDate,
      notes: `${item.title}: ${item.description || 'No notes'}`,
      amount: item.amount || 0,
      rawEntity: item
    };
  });

  // Action: Mark task completed
  const handleDone = (task) => {
    Swal.fire({
      title: 'Complete Task?',
      text: `Mark this task for "${task.clientName}" as resolved?`,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Yes, Complete',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        htmlContainer: 'swal-premium-text',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        executeCompleteAction(task.id, 'Task marked completed');
      }
    });
  };

  const executeCompleteAction = async (taskId, notes) => {
    const prefix = taskId.split('-')[0];
    const sourceId = taskId.replace(`${prefix}-`, '');

    if (prefix === 'REM') {
      if (completeReminder) {
        const res = await completeReminder(sourceId);
        if (res && res.success) {
          await fetchDailyTasks();
        }
      } else {
        const res = await remindersService.complete(sourceId);
        if (res && res.success) {
          await fetchDailyTasks();
          if (showToast) showToast('Task marked completed');
        }
      }
    }
  };

  // Action: Reschedule task
  const handleRescheduleClick = (task) => {
    setRescheduleTask(task);
    setRescheduleDate(task.followUpDate || targetDate);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTask) return;

    const taskId = rescheduleTask.id;
    const prefix = taskId.split('-')[0];
    const sourceId = taskId.replace(`${prefix}-`, '');

    if (prefix === 'REM') {
      if (updateReminder) {
        const res = await updateReminder(sourceId, { reminderDate: rescheduleDate });
        if (res && res.success) {
          await fetchDailyTasks();
          if (showToast) showToast(`Task rescheduled to ${rescheduleDate}`);
        }
      } else {
        const res = await remindersService.update(sourceId, { reminderDate: rescheduleDate });
        if (res && res.success) {
          await fetchDailyTasks();
          if (showToast) showToast(`Task rescheduled to ${rescheduleDate}`);
        }
      }
    }
    setRescheduleTask(null);
  };





  return (
    <div className="daily-task-viewport" style={{ paddingBottom: '40px' }}>
      
      {/* ── STYLE OVERRIDES FOR PREMIUM DASHBOARD AESTHETICS ── */}
      <style dangerouslySetInnerHTML={{__html: `
        .daily-task-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .daily-task-visuals-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .tasks-layout-row {
          display: grid;
          grid-template-columns: 2.2fr 1fr;
          gap: 24px;
        }
        .task-grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(340px, 100%), 1fr));
          gap: 16px;
        }
        .task-card {
          max-width: 480px;
          width: 100%;
        }
        .task-card-btn {
          width: auto !important;
          flex: 0 0 auto !important;
          min-width: 85px !important;
          padding: 5px 12px !important;
          height: 30px !important;
          font-size: 11px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        @media (max-width: 1024px) {
          .daily-task-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .daily-task-visuals-grid { grid-template-columns: 1fr; }
          .tasks-layout-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .daily-task-viewport {
            padding-left: 16px !important;
            padding-right: 16px !important;
            padding-top: 16px !important;
          }
          .daily-task-viewport .hero-banner.compact {
            margin: 0 0 16px 0 !important;
            width: 100% !important;
          }
          .daily-task-stats-grid {
            gap: 12px !important;
          }
          .daily-task-hero-top-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .daily-task-hero-top-row > div {
            width: 100% !important;
          }
        }
        @media (max-width: 480px) {
          .daily-task-stats-grid { 
            grid-template-columns: repeat(2, 1fr) !important; 
          }
          .stats-card {
            padding: 10px 14px !important;
          }
          .task-actions {
            flex-direction: column !important;
            gap: 6px !important;
          }
          .task-card-btn {
            width: 100% !important;
            flex: 1 1 auto !important;
            padding: 8px 12px !important;
            height: 36px !important;
            font-size: 12.5px !important;
          }
        }
        .filter-tab-bar {
          display: flex;
          gap: 8px;
          background: #f1f3f5;
          padding: 6px;
          border-radius: 12px;
          overflow-x: auto;
          margin-bottom: 16px;
        }
        .filter-tab-bar::-webkit-scrollbar { display: none; }
        .filter-tab-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid transparent;
          font-size: 12px;
          font-weight: 700;
          color: var(--color-text-secondary);
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .filter-tab-btn:hover {
          color: var(--color-text-primary);
          background: rgba(0, 0, 0, 0.04);
        }
        .filter-tab-btn.active {
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }
        .card-visual-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 0;
          min-height: 120px;
        }
        .heatmap-square {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        .heatmap-square:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .tooltip-custom {
          display: none;
          position: absolute;
          bottom: 34px;
          left: 50%;
          transform: translateX(-50%);
          background: #000000;
          color: #ffffff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 9px;
          white-space: nowrap;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .tooltip-custom::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 4px;
          border-style: solid;
          border-color: #000000 transparent transparent transparent;
        }
        .heatmap-square:hover .tooltip-custom {
          display: block;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}} />

      {/* ── HEADER BANNER ── */}
      <div className="daily-task-hero-banner hero-banner compact" style={{ minHeight: 'auto' }}>
        <div className="daily-task-hero-top-row">
          <div>
            <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-lime-brand)', letterSpacing: '1px' }}>
              {module === 'Finance' ? 'Finance Operations Hub' : 'Sales Operations Hub'}
            </span>
            <h1 className="brand-title" style={{ fontSize: '26px', marginTop: '4px' }}>
              {module === 'Finance' ? '💰 Finance Action Center' : '🎯 Daily Action Center'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '4px', fontWeight: '500' }}>
              {module === 'Finance'
                ? 'Payment collections, customer follow-ups, overdue invoices, and receipt confirmations.'
                : 'Data-driven follow-ups, confirmation checks, sample feedback, and outstanding receipts.'}
            </p>
          </div>
          
          {/* Target Date Picker */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(255,255,255,0.15)', 
            padding: '6px 12px', 
            borderRadius: '12px', 
            border: '1px solid rgba(255,255,255,0.2)',
            width: 'fit-content'
          }}>
            <Calendar size={14} style={{ color: '#fff' }} />
            <span style={{ color: '#fff', fontSize: '12.5px', fontWeight: '700' }}>Schedule Date:</span>
            <input 
              type="date" 
              value={targetDate} 
              onChange={(e) => {
                setTargetDate(e.target.value);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '12.5px',
                cursor: 'pointer',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* ── METRICS SUMMARY CARDS ── */}
      <div className="daily-task-stats-grid">
        <div className="app-card stats-card" style={{ padding: '16px 20px', borderRadius: '20px', background: '#ffffff', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Today's Tasks</span>
            <div style={{ background: 'rgba(51, 122, 134, 0.1)', color: 'var(--color-accent-teal)', padding: '6px', borderRadius: '50%' }}>
              <ClipboardList size={16} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text-primary)', letterSpacing: '-1px' }}>
              {todayTasks.length}
            </span>
          </div>
        </div>

        <div className="app-card stats-card" style={{ padding: '16px 20px', borderRadius: '20px', background: '#ffffff', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Pending Tasks</span>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', padding: '6px', borderRadius: '50%' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#dc2626', letterSpacing: '-1px' }}>
              {pendingTasks.length}
            </span>
          </div>
        </div>

        <div className="app-card stats-card" style={{ padding: '16px 20px', borderRadius: '20px', background: '#ffffff', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Overdue Action</span>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px', borderRadius: '50%' }}>
              <Clock size={16} className={overdueTasks.length > 0 ? 'animate-pulse' : ''} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#ef4444', letterSpacing: '-1px' }}>
              {overdueTasks.length}
            </span>
          </div>
        </div>

        <div className="app-card stats-card" style={{ padding: '16px 20px', borderRadius: '20px', background: '#ffffff', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Completed Tasks</span>
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#166534', padding: '6px', borderRadius: '50%' }}>
              <CheckCircle size={16} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#166534', letterSpacing: '-1px' }}>
              {completedTasks.length}
            </span>
          </div>
        </div>
      </div>



      {/* ── TASKS GRID LAYOUT SECTION ── */}
      <div className="tasks-layout-row">
        
        {/* Left Side: Tasks filter list */}
        <div style={{ minWidth: 0 }}>
          
           {/* Tabs header row */}
          <div className="filter-tab-bar">
            {[
              { id: 'All', label: 'All Tasks', bg: 'var(--color-accent-teal)', color: '#ffffff', border: '1px solid var(--color-accent-teal)' },
              { id: 'Payments', label: '💰 Payments & Follow-ups', bg: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
              { id: 'Orders', label: '🏭 Orders & Invoices', bg: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe' },
              { id: 'Leads', label: '📞 Leads', bg: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' },
              { id: 'Quotations', label: '📄 Quotations', bg: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' },
              { id: 'Samples', label: '🧪 Samples', bg: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' }
            ].filter(tab => {
              if (module === 'Finance') {
                return ['All', 'Payments', 'Orders'].includes(tab.id);
              }
              return true;
            }).map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`filter-tab-btn ${isActive ? 'active' : ''}`}
                  style={isActive ? { 
                    backgroundColor: tab.bg, 
                    color: tab.color, 
                    border: tab.border
                  } : {}}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Status filter bar */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { id: 'All', label: 'All Reminders' },
              { id: 'Today', label: 'Due Today' },
              { id: 'Upcoming', label: 'Upcoming' },
              { id: 'Overdue', label: 'Overdue' },
              { id: 'Completed', label: 'History' }
            ].map(f => {
              const isActive = filterStatus === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    border: '1px solid var(--color-border)',
                    background: isActive ? 'var(--color-text-primary)' : '#ffffff',
                    color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Search bar row */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input 
              type="text"
              className="form-input"
              placeholder="Search tasks by client or remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '40px',
                height: '42px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid var(--color-border)',
                fontSize: '13px'
              }}
            />
            <Search 
              size={16} 
              style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--color-text-muted)' 
              }} 
            />
          </div>

          {/* Tasks listing cards */}
          <div className="task-grid-container">
            {mappedTasks.length === 0 ? (
              <div 
                className="app-card"
                style={{ 
                  padding: '40px 20px', 
                  borderRadius: '20px', 
                  textAlign: 'center', 
                  color: 'var(--color-text-muted)',
                  background: '#ffffff',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ background: '#F5FAFE', color: 'var(--color-text-muted)', padding: '16px', borderRadius: '50%', display: 'inline-flex' }}>
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)' }}>All Tasks Cleared!</h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    No pending items match this filter for {targetDate}.
                  </p>
                </div>
              </div>
            ) : (
              mappedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDone={handleDone}
                  onReschedule={handleRescheduleClick}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Side: At Risk Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          {module === 'Finance' ? (
            <div className="app-card" style={{
              background: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: 'var(--shadow-premium)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
                <AlertCircle size={18} />
                <span style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overdue Collections</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {overdueTasks.slice(0, 6).map((task) => (
                  <div key={task.id} style={{
                    background: '#fff5f5', border: '1px solid #fee2e2',
                    borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px'
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#991b1b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.customerName || 'Customer'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#dc2626', display: 'block', marginTop: '2px' }}>
                        Overdue since {toDateKey(task.reminderAt)} • {task.title}
                      </span>
                    </div>
                    <button 
                      onClick={() => typeof navigate === 'function' ? navigate('/finance/payments') : navigate?.push?.('/finance/payments')}
                      style={{
                        background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px',
                        borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Follow-up
                    </button>
                  </div>
                ))}
                {overdueTasks.length === 0 && (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: '600' }}>
                    No overdue payment follow-ups.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="app-card" style={{
              background: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: 'var(--shadow-premium)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
                <AlertCircle size={18} />
                <span style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>At Risk Deals</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {atRiskLeads.map((lead) => (
                  <div key={lead.id} style={{
                    background: '#fff5f5', border: '1px solid #fee2e2',
                    borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px'
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#991b1b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.companyName}
                      </span>
                      <span style={{ fontSize: '11px', color: '#dc2626', display: 'block', marginTop: '2px' }}>
                        Followup overdue since {lead.followUpDate}
                      </span>
                    </div>
                    <button 
                      onClick={() => typeof navigate === 'function' ? navigate('/sales/leads') : navigate?.push?.('/sales/leads')}
                      style={{
                        background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px',
                        borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Contact
                    </button>
                  </div>
                ))}
                {atRiskQuotes.map((q) => (
                  <div key={q.id} style={{
                    background: '#fff5f5', border: '1px solid #fee2e2',
                    borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px'
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#991b1b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.customerName}
                      </span>
                      <span style={{ fontSize: '11px', color: '#dc2626', display: 'block', marginTop: '2px' }}>
                        Proposal expires on {q.validTill}
                      </span>
                    </div>
                    <button 
                      onClick={() => typeof navigate === 'function' ? navigate('/sales/quotations') : navigate?.push?.('/sales/quotations')}
                      style={{
                        background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px',
                        borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Renew
                    </button>
                  </div>
                ))}
                {atRiskLeads.length === 0 && atRiskQuotes.length === 0 && (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: '600' }}>
                    No immediate risks detected.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

{/* ── RESCHEDULE MODAL DIALOG ── */}
      {rescheduleTask && (
        <div className="modal-overlay active" onClick={() => setRescheduleTask(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '420px', borderRadius: '20px', padding: '24px' }}>
            <div className="modal-header-row" style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 className="modal-title-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '800' }}>
                <Calendar size={18} style={{ color: '#d97706' }} />
                <span>Reschedule Follow-up</span>
              </h3>
              <button className="modal-close-btn" onClick={() => setRescheduleTask(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{rescheduleTask.clientName}</p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Type: {rescheduleTask.type} | Current: {rescheduleTask.followUpDate}</p>
            </div>

            <form onSubmit={handleRescheduleSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12px' }}>Choose New Date *</label>
                <input 
                  type="date"
                  className="form-input"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  style={{ borderRadius: '10px' }}
                  required
                />
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn-small btn-outline-small" onClick={() => setRescheduleTask(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-small btn-primary-small" style={{ background: '#d97706', border: 'none', color: '#fff', fontWeight: '700' }}>
                  Save Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

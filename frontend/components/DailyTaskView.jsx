import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TaskCard from './tasks/TaskCard';
import { 
  ClipboardList, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search, 
  X,
  Plus,
  RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';
import { remindersService } from '../modules/sales/services/reminders.service.js';

export default function DailyTaskView({ 
  state, 
  dispatch, 
  navigate, 
  showToast, 
  module = 'Sales', 
  basePath,
  isSuperSalesPortal,
  completeReminder, 
  updateReminder,
  createReminder 
}) {
  // Timezone-safe local ISO date getter
  const getLocalDateKey = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayKey = getLocalDateKey();
  const [targetDate, setTargetDate] = useState(() => todayKey);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // All, Payments, Orders, Leads, Quotations, Samples
  const [filterStatus, setFilterStatus] = useState('Today'); // Default to Today
  
  // Modals state
  const [rescheduleTask, setRescheduleTask] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newReminderForm, setNewReminderForm] = useState({
    moduleType: 'Lead',
    customerName: '',
    title: '',
    description: '',
    reminderDate: todayKey,
    priority: 'Medium',
    amount: ''
  });

  // Local persistence cache for completed tasks so they immediately move to History and stay there
  const [completedTaskMap, setCompletedTaskMap] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`erp_completed_tasks_${module}`);
        return cached ? JSON.parse(cached) : {};
      }
    } catch (e) {}
    return {};
  });

  const [dailyData, setDailyData] = useState({ items: [], summary: { total: 0, pending: 0, completed: 0, overdue: 0, upcoming: 0 } });
  const [loading, setLoading] = useState(false);

  // Resolved base path for context-aware navigation (/supersales vs /sales vs /finance)
  const resolvedBasePath = basePath || (module === 'SuperSales' || isSuperSalesPortal ? '/supersales' : (module === 'Finance' ? '/finance' : '/sales'));

  const fetchDailyTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await remindersService.getDaily({ module: module === 'SuperSales' ? 'SuperSales' : module });
      if (res && res.success && res.data) {
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

  // Robust timezone-safe date key converter
  const toDateKey = (dateVal) => {
    if (!dateVal) return '';
    if (dateVal instanceof Date) {
      const y = dateVal.getFullYear();
      const m = String(dateVal.getMonth() + 1).padStart(2, '0');
      const d = String(dateVal.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    if (typeof dateVal === 'string') {
      if (dateVal.includes('T')) {
        const p = dateVal.split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(p)) return p;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) return dateVal;
      const parsed = new Date(dateVal);
      if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, '0');
        const d = String(parsed.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      return dateVal.split(' ')[0];
    }
    return '';
  };

  const selectedDateKey = toDateKey(targetDate) || todayKey;

  // ── 1. Unified Task Synthesis (Backend DB Reminders + Dynamic State Pipeline) ──
  const unifiedTasks = useMemo(() => {
    const tasks = [];
    const seenIds = new Set();
    const seenSourceMap = new Map(); // to deduplicate if both DB reminder and state item exist

    // A. Explicit Backend FollowUp / Reminders
    (dailyData.items || []).forEach(item => {
      const sType = String(item.sourceType || item.moduleType || 'Lead').toUpperCase();
      let type = 'Lead';
      if (sType === 'LEAD') type = 'Lead';
      else if (sType === 'SAMPLE' || sType === 'SAMPLEREQUEST') type = 'Sample';
      else if (sType === 'QUOTATION') type = 'Quotation';
      else if (['PAYMENT', 'PAYMENT_FOLLOWUP', 'INVOICE', 'FINANCE'].includes(sType)) type = 'Payment';
      else if (['SALESORDER', 'ORDER', 'PRODUCTION'].includes(sType)) type = 'Order';

      const taskDateKey = toDateKey(item.reminderAt || item.reminderDate || item.date) || todayKey;
      const id = `REM-${item.id}`;
      const sourceKey = `${type}-${item.sourceId || item.id}`;

      seenIds.add(id);
      if (item.sourceId) {
        seenSourceMap.set(sourceKey, id);
      }

      const isCompleted = item.status === 'Completed' || Boolean(completedTaskMap[id]) || Boolean(completedTaskMap[sourceKey]);
      const isOverdue = !isCompleted && taskDateKey < todayKey;

      tasks.push({
        id,
        sourceId: item.sourceId || item.id,
        clientName: item.customerName || 'Customer',
        type,
        status: isCompleted ? 'Completed' : (isOverdue ? 'Overdue' : 'Pending'),
        followUpDate: taskDateKey,
        notes: item.description ? `${item.title || 'Follow-up'}: ${item.description}` : (item.title || 'Follow-up required'),
        amount: Number(item.amount || 0),
        phone: item.phone || '',
        rawEntity: item,
        isExplicitReminder: true
      });
    });

    // B. State Explicit Reminders (if not already fetched from backend)
    const stateReminders = state?.reminders || [];
    stateReminders.forEach(r => {
      const id = `REM-${r.id}`;
      if (seenIds.has(id)) return;
      seenIds.add(id);

      const sType = String(r.moduleType || r.sourceType || 'Lead').toUpperCase();
      let type = 'Lead';
      if (sType === 'LEAD') type = 'Lead';
      else if (sType === 'SAMPLE' || sType === 'SAMPLEREQUEST') type = 'Sample';
      else if (sType === 'QUOTATION') type = 'Quotation';
      else if (['PAYMENT', 'PAYMENT_FOLLOWUP', 'INVOICE', 'FINANCE'].includes(sType)) type = 'Payment';
      else if (['SALESORDER', 'ORDER', 'PRODUCTION'].includes(sType)) type = 'Order';

      const taskDateKey = toDateKey(r.reminderDate || r.reminderAt || r.date) || todayKey;
      const sourceKey = `${type}-${r.moduleId || r.id}`;
      if (r.moduleId) seenSourceMap.set(sourceKey, id);

      const isCompleted = r.status === 'Completed' || Boolean(completedTaskMap[id]) || Boolean(completedTaskMap[sourceKey]);
      const isOverdue = !isCompleted && taskDateKey < todayKey;

      tasks.push({
        id,
        sourceId: r.moduleId || r.id,
        clientName: r.customerName || r.title || 'Customer Reminder',
        type,
        status: isCompleted ? 'Completed' : (isOverdue ? 'Overdue' : 'Pending'),
        followUpDate: taskDateKey,
        notes: r.remarks || r.notes || r.description || `Scheduled follow-up for ${type}`,
        amount: Number(r.amount || 0),
        phone: r.phone || '',
        rawEntity: r,
        isExplicitReminder: true
      });
    });

    // C. Dynamic Pipeline: Active Leads
    if (module !== 'Finance') {
      const leads = state?.leads || [];
      leads.forEach(l => {
        if (!l.id) return;
        if (l.status === 'Converted' || l.status === 'Lost') return;
        const sourceKey = `Lead-${l.id}`;
        if (seenSourceMap.has(sourceKey)) return;

        const fDate = l.followUpDate || l.nextReminder || l.nextActionAt;
        if (fDate) {
          const taskDateKey = toDateKey(fDate);
          const id = `LD-${l.id}`;
          const isCompleted = Boolean(completedTaskMap[id]) || Boolean(completedTaskMap[sourceKey]);
          const isOverdue = !isCompleted && taskDateKey < todayKey;
          tasks.push({
            id,
            sourceId: l.id,
            clientName: l.companyName || l.leadName || 'Lead Prospect',
            type: 'Lead',
            status: isCompleted ? 'Completed' : (isOverdue ? 'Overdue' : 'Pending'),
            followUpDate: taskDateKey,
            notes: l.notes || l.requirements || 'Follow up on lead requirement and next steps',
            amount: Number(l.budget || l.estimatedValue || 0),
            phone: l.phone || l.mobile || l.siteInchargeMobile || '',
            rawEntity: l
          });
        }
      });

      // D. Dynamic Pipeline: Active Samples
      const samples = state?.samples || [];
      samples.forEach(s => {
        if (!s.id) return;
        const sourceKey = `Sample-${s.id}`;
        if (seenSourceMap.has(sourceKey)) return;

        const sDate = s.followUpDate || s.dispatchDate || s.expectedFeedbackDate;
        if (sDate || s.status === 'Pending' || s.status === 'Dispatched' || s.status === 'In Review') {
          const taskDateKey = toDateKey(sDate) || todayKey;
          const id = `SMP-${s.id}`;
          const isCompleted = s.status === 'Approved' || Boolean(completedTaskMap[id]) || Boolean(completedTaskMap[sourceKey]);
          const isOverdue = !isCompleted && taskDateKey < todayKey && s.status !== 'Rejected';
          tasks.push({
            id,
            sourceId: s.id,
            clientName: s.leadName || s.customerName || 'Sample Request',
            type: 'Sample',
            status: isCompleted ? 'Completed' : (isOverdue ? 'Overdue' : 'Pending'),
            followUpDate: taskDateKey,
            notes: `Test Sample: ${s.product || s.sampleType || 'Product'} (Qty: ${s.quantity || 1}) - Feedback check`,
            amount: 0,
            phone: s.phone || '',
            rawEntity: s
          });
        }
      });

      // E. Dynamic Pipeline: Active Quotations
      const quotations = state?.quotations || [];
      quotations.forEach(q => {
        if (!q.id) return;
        if (q.status === 'Approved' || q.status === 'Closed' || q.status === 'Rejected') return;
        const sourceKey = `Quotation-${q.id}`;
        if (seenSourceMap.has(sourceKey)) return;

        const qDate = q.followUpDate || q.validTill;
        if (qDate) {
          const taskDateKey = toDateKey(qDate);
          const id = `QT-${q.id}`;
          const isCompleted = Boolean(completedTaskMap[id]) || Boolean(completedTaskMap[sourceKey]);
          const isOverdue = !isCompleted && taskDateKey < todayKey;
          tasks.push({
            id,
            sourceId: q.id,
            clientName: q.customerName || 'Quotation Prospect',
            type: 'Quotation',
            status: isCompleted ? 'Completed' : (isOverdue ? 'Overdue' : 'Pending'),
            followUpDate: taskDateKey,
            notes: `Quotation #${q.id || q.quotationNumber}: Follow-up on proposal valid till ${q.validTill || taskDateKey}`,
            amount: Number(q.totalAmount || q.grandTotal || 0),
            phone: q.phone || '',
            rawEntity: q
          });
        }
      });
    }

    // F. Dynamic Pipeline: Orders (Sales + Finance)
    const orders = state?.orders || [];
    orders.forEach(o => {
      const orderId = o.id || o.orderNo;
      if (!orderId) return;
      const sourceKey = `Order-${orderId}`;
      if (seenSourceMap.has(sourceKey)) return;

      const clientName = o.customer?.name || o.customerName || 'Order Client';
      if (o.status === 'Pending' || o.salesStatus === 'Pending' || o.status === 'PENDING_PLANT_HEAD' || o.status === 'Pending Confirmation') {
        const id = `ORD-${orderId}`;
        const isCompleted = Boolean(completedTaskMap[id]) || Boolean(completedTaskMap[sourceKey]);
        tasks.push({
          id,
          sourceId: orderId,
          clientName,
          type: 'Order',
          status: isCompleted ? 'Completed' : 'Pending',
          followUpDate: toDateKey(o.date) || todayKey,
          notes: `Verify Order confirmation and plant handover for ${o.products || o.orderNumber || 'Order'}`,
          amount: Number(o.payment?.totalAmount || o.totalValue || o.grandTotal || 0),
          phone: o.customer?.phone || o.phone || '',
          rawEntity: o
        });
      }
    });

    // G. Dynamic Pipeline: Payments (Sales + Finance)
    const payments = state?.payments || [];
    payments.forEach(p => {
      const pId = p.id || p.invoiceNo;
      if (!pId) return;
      const sourceKey = `Payment-${pId}`;
      if (seenSourceMap.has(sourceKey)) return;

      if (p.status === 'Outstanding' || p.status === 'Pending' || (p.totalAmount && p.paidAmount < p.totalAmount)) {
        const pDate = p.dueDate || p.nextFollowUpDate;
        const taskDateKey = toDateKey(pDate) || todayKey;
        const id = `PM-${pId}`;
        const isCompleted = Boolean(completedTaskMap[id]) || Boolean(completedTaskMap[sourceKey]);
        const isOverdue = !isCompleted && taskDateKey < todayKey;
        const remaining = (Number(p.totalAmount || 0) - Number(p.paidAmount || 0));
        tasks.push({
          id,
          sourceId: pId,
          clientName: p.customerName || 'Payment Follow-up',
          type: 'Payment',
          status: isCompleted ? 'Completed' : (isOverdue ? 'Overdue' : 'Pending'),
          followUpDate: taskDateKey,
          notes: `Outstanding Collection #${p.invoiceNo || pId}: Remaining ₹${remaining.toLocaleString('en-IN')}`,
          amount: remaining > 0 ? remaining : Number(p.totalAmount || 0),
          phone: p.phone || '',
          rawEntity: p
        });
      }
    });

    return tasks;
  }, [dailyData.items, state, module, todayKey, completedTaskMap]);

  // ── 2. Category Tab Filtering ──
  const categoryFilteredTasks = useMemo(() => {
    return unifiedTasks.filter(task => {
      const sType = String(task.type || '').toUpperCase();

      if (module === 'Finance') {
        const isFinanceType = ['PAYMENT', 'ORDER', 'PRODUCTION'].includes(sType);
        if (!isFinanceType) return false;

        if (activeTab === 'All') return true;
        if (activeTab === 'Payments') return sType === 'PAYMENT';
        if (activeTab === 'Orders') return ['ORDER', 'PRODUCTION'].includes(sType);
        return true;
      }

      // Sales / SuperSales
      if (activeTab === 'All') return true;
      if (activeTab === 'Payments') return sType === 'PAYMENT';
      if (activeTab === 'Orders') return ['ORDER', 'PRODUCTION'].includes(sType);
      if (activeTab === 'Leads') return sType === 'LEAD';
      if (activeTab === 'Quotations') return sType === 'QUOTATION';
      if (activeTab === 'Samples') return sType === 'SAMPLE';
      return true;
    });
  }, [unifiedTasks, activeTab, module]);

  // ── 3. Dynamic Counts for Metrics & Status Filter ──
  const pendingTasks = categoryFilteredTasks.filter(t => t.status !== 'Completed');
  const todayTasks = pendingTasks.filter(t => t.followUpDate === selectedDateKey);
  const overdueTasks = pendingTasks.filter(t => t.followUpDate < selectedDateKey);
  const upcomingTasks = pendingTasks.filter(t => t.followUpDate > selectedDateKey);
  const completedTasks = categoryFilteredTasks.filter(t => t.status === 'Completed');

  // Category counts for tab badges
  const categoryCounts = useMemo(() => {
    const counts = { All: 0, Payments: 0, Orders: 0, Leads: 0, Quotations: 0, Samples: 0 };
    unifiedTasks.filter(t => t.status !== 'Completed').forEach(t => {
      counts.All++;
      if (t.type === 'Payment') counts.Payments++;
      else if (t.type === 'Order' || t.type === 'Production') counts.Orders++;
      else if (t.type === 'Lead') counts.Leads++;
      else if (t.type === 'Quotation') counts.Quotations++;
      else if (t.type === 'Sample') counts.Samples++;
    });
    return counts;
  }, [unifiedTasks]);

  // ── 4. Final Displayed Tasks (Category + Status Filter + Search) ──
  const finalTasks = useMemo(() => {
    const list = categoryFilteredTasks.filter(task => {
      // Search filter
      if (searchQuery.trim()) {
        const sq = searchQuery.toLowerCase().trim();
        const matches = 
          (task.clientName && task.clientName.toLowerCase().includes(sq)) ||
          (task.notes && task.notes.toLowerCase().includes(sq)) ||
          (task.type && task.type.toLowerCase().includes(sq)) ||
          (task.phone && task.phone.includes(sq));
        if (!matches) return false;
      }

      // Status filter
      const isPending = task.status !== 'Completed';
      switch (filterStatus) {
        case 'Today':
          return isPending && task.followUpDate === selectedDateKey;
        case 'Upcoming':
          return isPending && task.followUpDate > selectedDateKey;
        case 'Overdue':
          return isPending && task.followUpDate < selectedDateKey;
        case 'Completed':
          return task.status === 'Completed';
        case 'All':
        default:
          return isPending;
      }
    });

    // Chronological sorting:
    return list.sort((a, b) => {
      if (filterStatus === 'Upcoming') {
        // Nearest upcoming date first (e.g. Sep 1 before Sep 5)
        return (a.followUpDate || '').localeCompare(b.followUpDate || '');
      }
      if (filterStatus === 'Overdue') {
        // Oldest overdue date first
        return (a.followUpDate || '').localeCompare(b.followUpDate || '');
      }
      if (filterStatus === 'Completed') {
        return (b.completedAt || b.followUpDate || '').localeCompare(a.completedAt || a.followUpDate || '');
      }
      // For Today or All Reminders:
      const aDate = a.followUpDate || '';
      const bDate = b.followUpDate || '';
      return aDate.localeCompare(bDate);
    });
  }, [categoryFilteredTasks, searchQuery, filterStatus, selectedDateKey]);

  // ── 5. At-Risk Deals & Overdue Pipeline ──
  const atRiskLeads = useMemo(() => {
    const leads = state?.leads || [];
    return leads.filter(l => {
      if (!l.followUpDate) return false;
      const fup = toDateKey(l.followUpDate);
      return fup <= selectedDateKey && l.status !== 'Converted' && l.status !== 'Lost';
    }).slice(0, 5);
  }, [state?.leads, selectedDateKey]);

  const atRiskQuotes = useMemo(() => {
    const quotations = state?.quotations || [];
    return quotations.filter(q => {
      if (!q.validTill) return false;
      const expiry = toDateKey(q.validTill);
      return expiry <= selectedDateKey && q.status !== 'Approved' && q.status !== 'Closed';
    }).slice(0, 5);
  }, [state?.quotations, selectedDateKey]);

  // ── 6. Task Actions (Done, Reschedule, Create) ──
  const handleDone = (task) => {
    Swal.fire({
      title: 'Complete Task?',
      text: `Mark this follow-up for "${task.clientName}" as completed and save to history?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Complete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        htmlContainer: 'swal-premium-text',
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        await executeCompleteAction(task);
      }
    });
  };

  const executeCompleteAction = async (task) => {
    const taskId = task.id;
    const prefix = taskId.split('-')[0];
    const sourceId = task.sourceId || taskId.replace(`${prefix}-`, '');
    const sourceKey = `${task.type}-${sourceId}`;

    // 1. Immediate optimistic UI update: store completed status in local cache & state
    const completedEntry = {
      ...task,
      status: 'Completed',
      completedAt: new Date().toISOString()
    };

    setCompletedTaskMap(prev => {
      const next = {
        ...prev,
        [taskId]: completedEntry,
        [sourceKey]: completedEntry
      };
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`erp_completed_tasks_${module}`, JSON.stringify(next));
        }
      } catch (e) {}
      return next;
    });

    setDailyData(prev => ({
      ...prev,
      items: prev.items.map(it => (String(it.id) === String(sourceId) || String(it.sourceId) === String(sourceId)) ? { ...it, status: 'Completed' } : it)
    }));

    // 2. Persist to backend database
    try {
      if (prefix === 'REM' && completeReminder) {
        await completeReminder(sourceId);
      } else if (prefix === 'REM') {
        await remindersService.complete(sourceId);
      } else {
        // Record completed follow-up entry in backend FollowUp table
        await remindersService.create({
          moduleType: task.type,
          moduleId: String(sourceId),
          customerName: task.clientName,
          title: task.notes || 'Follow-up completed',
          status: 'Completed',
          reminderDate: task.followUpDate || todayKey
        });
      }

      // Auto-refresh tasks list from backend
      await fetchDailyTasks();
      if (showToast) showToast('Task marked completed & stored in History!');
    } catch (err) {
      console.warn('Backend completion sync warning:', err);
      await fetchDailyTasks();
      if (showToast) showToast('Task completed & stored in History!');
    }
  };

  const handleRescheduleClick = (task) => {
    setRescheduleTask(task);
    setRescheduleDate(task.followUpDate || selectedDateKey);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTask) return;

    const task = rescheduleTask;
    const prefix = task.id.split('-')[0];
    const sourceId = task.sourceId || task.id.replace(`${prefix}-`, '');
    const sourceKey = `${task.type}-${sourceId}`;

    // Remove from completed map if it was there
    setCompletedTaskMap(prev => {
      const next = { ...prev };
      delete next[task.id];
      delete next[sourceKey];
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`erp_completed_tasks_${module}`, JSON.stringify(next));
        }
      } catch (e) {}
      return next;
    });

    // Optimistic UI update
    setDailyData(prev => ({
      ...prev,
      items: prev.items.map(it => (String(it.id) === String(sourceId) || String(it.sourceId) === String(sourceId)) ? { ...it, reminderAt: rescheduleDate, reminderDate: rescheduleDate, status: 'Pending' } : it)
    }));

    try {
      if (prefix === 'REM' && updateReminder) {
        await updateReminder(sourceId, { reminderDate: rescheduleDate, reminderAt: rescheduleDate, status: 'Pending' });
      } else if (prefix === 'REM') {
        await remindersService.update(sourceId, { reminderDate: rescheduleDate, reminderAt: rescheduleDate, status: 'Pending' });
      } else {
        await remindersService.create({
          moduleType: task.type,
          moduleId: String(sourceId),
          customerName: task.clientName,
          title: task.notes || 'Follow-up rescheduled',
          reminderDate: rescheduleDate,
          reminderAt: `${rescheduleDate}T10:00:00.000Z`,
          status: 'Pending'
        });
      }
      await fetchDailyTasks();
      if (showToast) showToast(`Task rescheduled to ${rescheduleDate}`);
    } catch (err) {
      console.warn('Reschedule sync warning:', err);
      await fetchDailyTasks();
      if (showToast) showToast(`Task rescheduled to ${rescheduleDate}`);
    } finally {
      setRescheduleTask(null);
    }
  };

  const handleCreateNewReminder = async (e) => {
    e.preventDefault();
    if (!newReminderForm.customerName || !newReminderForm.title) {
      if (showToast) showToast('Please enter customer name and task title');
      return;
    }

    try {
      const payload = {
        moduleType: newReminderForm.moduleType,
        moduleId: `MANUAL-${Date.now()}`,
        customerName: newReminderForm.customerName,
        title: newReminderForm.title,
        description: newReminderForm.description,
        reminderDate: newReminderForm.reminderDate || todayKey,
        reminderAt: `${newReminderForm.reminderDate || todayKey}T10:00:00.000Z`,
        priority: newReminderForm.priority,
        amount: Number(newReminderForm.amount) || 0,
        status: 'Pending'
      };

      if (createReminder) {
        await createReminder(payload);
      } else {
        await remindersService.create(payload);
      }

      await fetchDailyTasks();
      setIsAddModalOpen(false);
      setNewReminderForm({
        moduleType: 'Lead',
        customerName: '',
        title: '',
        description: '',
        reminderDate: todayKey,
        priority: 'Medium',
        amount: ''
      });
      if (showToast) showToast('New reminder created successfully!');
    } catch (err) {
      console.error('Error creating reminder:', err);
      if (showToast) showToast('Failed to create reminder');
    }
  };

  const safeNavigate = (path) => {
    if (typeof navigate === 'function') {
      navigate(path);
    } else if (navigate && typeof navigate.push === 'function') {
      navigate.push(path);
    }
  };

  return (
    <div className="daily-task-viewport" style={{ paddingBottom: '40px' }}>
      
      {/* ── STYLE OVERRIDES FOR PREMIUM RESPONSIVE DASHBOARD AESTHETICS ── */}
      <style dangerouslySetInnerHTML={{__html: `
        .daily-task-viewport {
          padding-bottom: 32px;
        }
        .daily-task-hero-banner {
          margin-bottom: 18px;
          border-radius: 18px;
          padding: 18px 24px;
        }
        .daily-task-hero-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .daily-task-hero-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .daily-task-date-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.18);
          padding: 6px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(8px);
        }
        .daily-task-date-box input[type="date"] {
          border: none;
          background: transparent;
          color: #ffffff;
          font-weight: 800;
          font-size: 12.5px;
          cursor: pointer;
          outline: none;
          color-scheme: dark;
        }
        .daily-task-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 18px;
        }
        .daily-task-stat-card {
          padding: 14px 18px;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid var(--color-border, #e2e8f0);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .daily-task-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .daily-task-stat-card-title {
          font-size: 11px;
          font-weight: 800;
          color: var(--color-text-secondary, #64748b);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .daily-task-stat-card-num {
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -0.5px;
          line-height: 1;
        }
        .tasks-layout-row {
          display: grid;
          grid-template-columns: 2.2fr 1fr;
          gap: 20px;
        }
        .task-grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
          gap: 14px;
        }
        .filter-tab-bar {
          display: flex;
          gap: 6px;
          background: #f1f5f9;
          padding: 5px;
          border-radius: 12px;
          overflow-x: auto;
          margin-bottom: 14px;
          align-items: center;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .filter-tab-bar::-webkit-scrollbar { display: none; }
        .filter-tab-btn {
          flex: 0 0 auto;
          padding: 7px 12px;
          border-radius: 9px;
          border: 1px solid transparent;
          font-size: 12px;
          font-weight: 700;
          color: var(--color-text-secondary, #64748b);
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .filter-tab-btn:hover {
          color: var(--color-text-primary, #0f172a);
          background: rgba(0, 0, 0, 0.04);
        }
        .filter-tab-btn.active {
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }
        .tab-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 1px 5px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 800;
          line-height: 1;
        }
        .status-pills-row {
          display: flex;
          gap: 6px;
          margin-bottom: 14px;
          align-items: center;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 2px;
        }
        .status-pills-row::-webkit-scrollbar { display: none; }
        .status-pill-btn {
          flex: 0 0 auto;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          border: 1px solid var(--color-border, #e2e8f0);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }
        .status-pill-btn:hover {
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }

        /* ── TABLET RESPONSIVENESS ── */
        @media (max-width: 1024px) {
          .daily-task-stats-grid { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 12px;
            margin-bottom: 16px;
          }
          .tasks-layout-row { 
            grid-template-columns: 1fr; 
            gap: 16px;
          }
        }

        /* ── MOBILE RESPONSIVENESS (<= 768px & iPhones) ── */
        @media (max-width: 768px) {
          .daily-task-viewport {
            padding: 0 0 24px 0 !important;
          }
          .daily-task-hero-banner {
            padding: 14px 16px !important;
            margin-bottom: 12px !important;
            border-radius: 14px !important;
          }
          .daily-task-hero-top-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .daily-task-hero-banner .brand-title {
            font-size: 20px !important;
            line-height: 1.25 !important;
            margin-top: 3px !important;
          }
          .daily-task-hero-banner p {
            font-size: 11.5px !important;
            line-height: 1.35 !important;
            margin-top: 3px !important;
          }
          .daily-task-hero-controls {
            width: 100% !important;
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .daily-task-date-box {
            flex: 1 1 auto !important;
            padding: 5px 10px !important;
            border-radius: 10px !important;
            font-size: 11.5px !important;
          }
          .daily-task-date-box input[type="date"] {
            font-size: 11.5px !important;
          }
          .daily-task-stats-grid { 
            grid-template-columns: repeat(2, 1fr) !important; 
            gap: 8px !important;
            margin-bottom: 12px !important;
          }
          .daily-task-stat-card {
            padding: 10px 12px !important;
            border-radius: 12px !important;
          }
          .daily-task-stat-card-title {
            font-size: 9.5px !important;
            letter-spacing: 0.3px !important;
          }
          .daily-task-stat-card-num {
            font-size: 20px !important;
            margin-top: 4px !important;
          }
          .filter-tab-bar {
            padding: 4px !important;
            border-radius: 10px !important;
            gap: 4px !important;
            margin-bottom: 10px !important;
          }
          .filter-tab-btn {
            padding: 5px 9px !important;
            font-size: 11px !important;
            border-radius: 7px !important;
          }
          .status-pills-row {
            gap: 5px !important;
            margin-bottom: 10px !important;
          }
          .status-pill-btn {
            padding: 4px 9px !important;
            font-size: 10.5px !important;
            border-radius: 14px !important;
          }
        }
      `}} />

      {/* ── HEADER HERO BANNER ── */}
      <div className="daily-task-hero-banner hero-banner compact" style={{ minHeight: 'auto' }}>
        <div className="daily-task-hero-top-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-lime-brand, #a3e635)', letterSpacing: '1px' }}>
                {module === 'Finance' ? 'Finance Operations Hub' : (module === 'SuperSales' ? 'SuperSales Strategic Hub' : 'Sales Operations Hub')}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', fontSize: '10px', padding: '1px 7px', borderRadius: '10px', fontWeight: '700' }}>
                Live Hub
              </span>
            </div>
            <h1 className="brand-title" style={{ fontSize: '24px', marginTop: '4px', color: '#ffffff', fontWeight: '900', letterSpacing: '-0.5px' }}>
              {module === 'Finance' ? '💰 Finance Action Center' : (module === 'SuperSales' ? '⚡ SuperSales Action Center' : '🎯 Daily Action Center')}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12.5px', marginTop: '3px', fontWeight: '500' }}>
              {module === 'Finance'
                ? 'Payment collections, customer follow-ups, overdue invoices, and receipt confirmations.'
                : 'Data-driven follow-ups, confirmation checks, sample feedback, and outstanding receipts.'}
            </p>
          </div>
          
          {/* Controls: Target Date Picker + Quick Add + Refresh */}
          <div className="daily-task-hero-controls">
            <div className="daily-task-date-box">
              <Calendar size={13} style={{ color: '#fff' }} />
              <span style={{ color: '#fff', fontSize: '11.5px', fontWeight: '700' }}>Schedule Date:</span>
              <input 
                type="date" 
                value={targetDate} 
                onChange={(e) => setTargetDate(e.target.value)}
              />
              {targetDate !== todayKey && (
                <button
                  onClick={() => setTargetDate(todayKey)}
                  style={{
                    background: '#ffffff',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '2px 6px',
                    fontSize: '9.5px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Today
                </button>
              )}
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="daily-task-add-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'var(--color-lime-brand, #a3e635)',
                color: '#0f172a',
                border: 'none',
                padding: '7px 12px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
              }}
            >
              <Plus size={14} strokeWidth={3} />
              <span>Add Reminder</span>
            </button>

            <button
              onClick={fetchDailyTasks}
              title="Refresh Tasks"
              className="daily-task-refresh-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.18)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '7px 10px',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* ── METRICS SUMMARY CARDS (4-Grid) ── */}
      <div className="daily-task-stats-grid">
        {/* Card 1: Today's Tasks */}
        <div 
          onClick={() => setFilterStatus('Today')}
          className="daily-task-stat-card" 
          style={filterStatus === 'Today' ? { 
            background: '#f0fdf4', 
            borderColor: '#22c55e',
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.12)'
          } : {}}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="daily-task-stat-card-title">Due Today</span>
            <div style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#16a34a', padding: '5px', borderRadius: '50%', display: 'flex' }}>
              <ClipboardList size={14} />
            </div>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="daily-task-stat-card-num" style={{ color: '#16a34a' }}>
              {todayTasks.length}
            </span>
            <span style={{ fontSize: '10.5px', color: 'var(--color-text-muted, #94a3b8)', fontWeight: '600' }}>
              on {targetDate === todayKey ? 'Today' : targetDate}
            </span>
          </div>
        </div>

        {/* Card 2: Pending Tasks */}
        <div 
          onClick={() => setFilterStatus('All')}
          className="daily-task-stat-card" 
          style={filterStatus === 'All' ? { 
            background: '#eff6ff', 
            borderColor: '#3b82f6',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.12)'
          } : {}}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="daily-task-stat-card-title">Pending Tasks</span>
            <div style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', padding: '5px', borderRadius: '50%', display: 'flex' }}>
              <TrendingUp size={14} />
            </div>
          </div>
          <div style={{ marginTop: '8px' }}>
            <span className="daily-task-stat-card-num" style={{ color: '#2563eb' }}>
              {pendingTasks.length}
            </span>
          </div>
        </div>

        {/* Card 3: Overdue Action */}
        <div 
          onClick={() => setFilterStatus('Overdue')}
          className="daily-task-stat-card" 
          style={filterStatus === 'Overdue' ? { 
            background: '#fef2f2', 
            borderColor: '#ef4444',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.12)'
          } : {}}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="daily-task-stat-card-title" style={{ color: '#dc2626' }}>Overdue Action</span>
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', padding: '5px', borderRadius: '50%', display: 'flex' }}>
              <Clock size={14} className={overdueTasks.length > 0 ? 'animate-pulse' : ''} />
            </div>
          </div>
          <div style={{ marginTop: '8px' }}>
            <span className="daily-task-stat-card-num" style={{ color: '#ef4444' }}>
              {overdueTasks.length}
            </span>
          </div>
        </div>

        {/* Card 4: Completed Tasks / History */}
        <div 
          onClick={() => setFilterStatus('Completed')}
          className="daily-task-stat-card" 
          style={filterStatus === 'Completed' ? { 
            background: '#f0fdf4', 
            borderColor: '#16a34a',
            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.12)'
          } : {}}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="daily-task-stat-card-title">Completed Tasks</span>
            <div style={{ background: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', padding: '5px', borderRadius: '50%', display: 'flex' }}>
              <CheckCircle size={14} />
            </div>
          </div>
          <div style={{ marginTop: '8px' }}>
            <span className="daily-task-stat-card-num" style={{ color: '#166534' }}>
              {completedTasks.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── TASKS GRID LAYOUT SECTION ── */}
      <div className="tasks-layout-row">
        
        {/* Left Side: Tasks filter list */}
        <div style={{ minWidth: 0 }}>
          
          {/* Top Category Tabs Row */}
          <div className="filter-tab-bar">
            {[
              { id: 'All', label: 'All Tasks', bg: 'var(--color-accent-teal, #1e293b)', color: '#ffffff', border: '1px solid var(--color-accent-teal, #1e293b)', badgeBg: 'rgba(255,255,255,0.25)', badgeColor: '#fff', count: categoryCounts.All },
              { id: 'Payments', label: '💰 Payments & Follow-ups', bg: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', badgeBg: '#fee2e2', badgeColor: '#b91c1c', count: categoryCounts.Payments },
              { id: 'Orders', label: '🏭 Orders & Invoices', bg: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe', badgeBg: '#c7d2fe', badgeColor: '#3730a3', count: categoryCounts.Orders },
              { id: 'Leads', label: '📞 Leads', bg: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', badgeBg: '#fef3c7', badgeColor: '#92400e', count: categoryCounts.Leads },
              { id: 'Quotations', label: '📄 Quotations', bg: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', badgeBg: '#dbeafe', badgeColor: '#1e3a8a', count: categoryCounts.Quotations },
              { id: 'Samples', label: '🧪 Samples', bg: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', badgeBg: '#bae6fd', badgeColor: '#0369a1', count: categoryCounts.Samples }
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
                  <span>{tab.label}</span>
                  <span 
                    className="tab-badge" 
                    style={{ 
                      backgroundColor: isActive ? tab.badgeBg : '#e2e8f0', 
                      color: isActive ? tab.badgeColor : '#475569' 
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Status Filter Pills Row */}
          <div className="status-pills-row">
            {[
              { id: 'Today', label: 'Due Today', count: todayTasks.length },
              { id: 'Upcoming', label: 'Upcoming', count: upcomingTasks.length },
              { id: 'Overdue', label: 'Overdue', count: overdueTasks.length },
              { id: 'All', label: 'All Reminders', count: pendingTasks.length },
              { id: 'Completed', label: 'History', count: completedTasks.length }
            ].map(f => {
              const isActive = filterStatus === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className="status-pill-btn"
                  style={{
                    background: isActive ? '#0f172a' : '#ffffff',
                    color: isActive ? '#ffffff' : 'var(--color-text-secondary, #64748b)',
                    borderColor: isActive ? '#0f172a' : 'var(--color-border, #e2e8f0)',
                    boxShadow: isActive ? '0 2px 6px rgba(15,23,42,0.12)' : 'none'
                  }}
                >
                  <span>{f.label}</span>
                  <span style={{ 
                    background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9', 
                    color: isActive ? '#ffffff' : '#64748b',
                    padding: '1px 5px',
                    borderRadius: '8px',
                    fontSize: '9.5px'
                  }}>
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar row */}
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <input 
              type="text"
              className="form-input"
              placeholder="Search tasks by customer, requirement, or remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '38px',
                height: '40px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid var(--color-border, #e2e8f0)',
                fontSize: '12.5px'
              }}
            />
            <Search 
              size={15} 
              style={{ 
                position: 'absolute', 
                left: '13px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--color-text-muted, #94a3b8)' 
              }} 
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>



          {/* Tasks listing cards */}
          <div className="task-grid-container">
            {finalTasks.length === 0 ? (
              <div 
                className="app-card"
                style={{ 
                  padding: '48px 24px', 
                  borderRadius: '20px', 
                  textAlign: 'center', 
                  color: 'var(--color-text-muted, #64748b)',
                  background: '#ffffff',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  gridColumn: '1 / -1'
                }}
              >
                <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '16px', borderRadius: '50%', display: 'inline-flex' }}>
                  <CheckCircle size={36} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary, #0f172a)' }}>
                    {filterStatus === 'Completed' ? 'No Completed History Found' : 'All Tasks Cleared!'}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary, #64748b)', marginTop: '4px' }}>
                    {filterStatus === 'Today' 
                      ? `No pending follow-ups scheduled for ${targetDate}.` 
                      : (filterStatus === 'Completed'
                          ? 'Tasks marked "Done" will automatically appear here in History.'
                          : `No tasks match the active filters (${activeTab} • ${filterStatus}).`)}
                  </p>
                </div>
                {filterStatus !== 'Completed' && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-small btn-primary-small"
                    style={{
                      background: 'var(--color-lime-brand, #a3e635)',
                      color: '#0f172a',
                      border: 'none',
                      fontWeight: '800',
                      padding: '8px 16px',
                      borderRadius: '10px'
                    }}
                  >
                    ➕ Add New Follow-up
                  </button>
                )}
              </div>
            ) : (
              finalTasks.map(task => (
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

        {/* Right Side: At Risk & Overdue Operations Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          {module === 'Finance' ? (
            <div className="app-card" style={{
              background: '#ffffff',
              border: '1px solid var(--color-border, #e2e8f0)',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: 'var(--shadow-premium, 0 4px 20px rgba(0,0,0,0.05))',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
                <AlertCircle size={18} />
                <span style={{ fontSize: '13.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overdue Collections</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {overdueTasks.slice(0, 6).map((task) => (
                  <div key={task.id} style={{
                    background: '#fff5f5', border: '1px solid #fee2e2',
                    borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px'
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#991b1b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.clientName}
                      </span>
                      <span style={{ fontSize: '11px', color: '#dc2626', display: 'block', marginTop: '2px' }}>
                        Overdue since {task.followUpDate} • {task.notes}
                      </span>
                    </div>
                    <button 
                      onClick={() => safeNavigate(`${resolvedBasePath}/payment-followup`)}
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
                  <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--color-text-muted, #94a3b8)', fontSize: '12px', fontWeight: '600' }}>
                    No overdue payment follow-ups.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="app-card" style={{
              background: '#ffffff',
              border: '1px solid var(--color-border, #e2e8f0)',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: 'var(--shadow-premium, 0 4px 20px rgba(0,0,0,0.05))',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
                <AlertCircle size={18} />
                <span style={{ fontSize: '13.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  At-Risk Action Deals
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {atRiskLeads.map((lead) => (
                  <div key={lead.id} style={{
                    background: '#fff5f5', border: '1px solid #fee2e2',
                    borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px'
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#991b1b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.companyName || lead.leadName || 'Lead'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#dc2626', display: 'block', marginTop: '2px' }}>
                        Follow-up due: {lead.followUpDate}
                      </span>
                    </div>
                    <button 
                      onClick={() => safeNavigate(`${resolvedBasePath}/leads`)}
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
                        {q.customerName || `Quotation #${q.id}`}
                      </span>
                      <span style={{ fontSize: '11px', color: '#dc2626', display: 'block', marginTop: '2px' }}>
                        Proposal expiry: {q.validTill}
                      </span>
                    </div>
                    <button 
                      onClick={() => safeNavigate(`${resolvedBasePath}/quotations`)}
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
                  <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--color-text-muted, #94a3b8)', fontSize: '12px', fontWeight: '600' }}>
                    No immediate risk deals detected.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Shortcuts Panel */}
          <div className="app-card" style={{
            background: '#ffffff',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '20px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-secondary, #64748b)', textTransform: 'uppercase' }}>
              Quick Navigation
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                onClick={() => safeNavigate(`${resolvedBasePath}/leads`)}
                className="btn-small btn-outline-small"
                style={{ justifyContent: 'center', fontSize: '11.5px', fontWeight: '700', padding: '8px' }}
              >
                📞 Leads Hub
              </button>
              <button 
                onClick={() => safeNavigate(`${resolvedBasePath}/quotations`)}
                className="btn-small btn-outline-small"
                style={{ justifyContent: 'center', fontSize: '11.5px', fontWeight: '700', padding: '8px' }}
              >
                📄 Quotations
              </button>
              <button 
                onClick={() => safeNavigate(`${resolvedBasePath}/orders`)}
                className="btn-small btn-outline-small"
                style={{ justifyContent: 'center', fontSize: '11.5px', fontWeight: '700', padding: '8px' }}
              >
                🏭 Orders Hub
              </button>
              <button 
                onClick={() => safeNavigate(`${resolvedBasePath}/payment-followup`)}
                className="btn-small btn-outline-small"
                style={{ justifyContent: 'center', fontSize: '11.5px', fontWeight: '700', padding: '8px' }}
              >
                💰 Collections
              </button>
            </div>
          </div>
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
              <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary, #0f172a)' }}>{rescheduleTask.clientName}</p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary, #64748b)', marginTop: '2px' }}>
                Type: {rescheduleTask.type} | Current Date: {rescheduleTask.followUpDate}
              </p>
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

      {/* ── CREATE NEW REMINDER MODAL ── */}
      {isAddModalOpen && (
        <div className="modal-overlay active" onClick={() => setIsAddModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '480px', borderRadius: '20px', padding: '24px' }}>
            <div className="modal-header-row" style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 className="modal-title-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '800' }}>
                <Plus size={18} style={{ color: 'var(--color-accent-teal, #0f172a)' }} />
                <span>Create New Task / Reminder</span>
              </h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewReminder}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12px' }}>Category *</label>
                  <select
                    className="form-input"
                    value={newReminderForm.moduleType}
                    onChange={(e) => setNewReminderForm(prev => ({ ...prev, moduleType: e.target.value }))}
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="Lead">Lead Follow-up</option>
                    <option value="Quotation">Quotation</option>
                    <option value="Sample">Sample Test</option>
                    <option value="Order">Order Status</option>
                    <option value="Payment">Payment Collection</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12px' }}>Action Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newReminderForm.reminderDate}
                    onChange={(e) => setNewReminderForm(prev => ({ ...prev, reminderDate: e.target.value }))}
                    style={{ borderRadius: '10px' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12px' }}>Customer / Company Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Apex Builders / Acme Corp"
                  value={newReminderForm.customerName}
                  onChange={(e) => setNewReminderForm(prev => ({ ...prev, customerName: e.target.value }))}
                  style={{ borderRadius: '10px' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12px' }}>Task Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Discussion on rate approval / sample dispatch check"
                  value={newReminderForm.title}
                  onChange={(e) => setNewReminderForm(prev => ({ ...prev, title: e.target.value }))}
                  style={{ borderRadius: '10px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12px' }}>Priority</label>
                  <select
                    className="form-input"
                    value={newReminderForm.priority}
                    onChange={(e) => setNewReminderForm(prev => ({ ...prev, priority: e.target.value }))}
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '12px' }}>Amount (₹ optional)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 50000"
                    value={newReminderForm.amount}
                    onChange={(e) => setNewReminderForm(prev => ({ ...prev, amount: e.target.value }))}
                    style={{ borderRadius: '10px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12px' }}>Notes / Remarks</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Add details, next discussion agenda, or contact notes..."
                  value={newReminderForm.description}
                  onChange={(e) => setNewReminderForm(prev => ({ ...prev, description: e.target.value }))}
                  style={{ borderRadius: '10px' }}
                />
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-small btn-outline-small" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-small btn-primary-small" style={{ background: 'var(--color-lime-brand, #a3e635)', color: '#0f172a', border: 'none', fontWeight: '800' }}>
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

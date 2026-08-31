import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { useMediaQuery } from '../hooks/useMediaQuery';
import {
  Target,
  Pin,
  Package,
  FlaskConical,
  AlertCircle,
  Clock,
  Calendar,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Activity,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  PhoneCall,
  FileCheck,
  Sparkles,
  AlertTriangle,
  Bell
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import DailyAgendaCalendar from './DailyAgendaCalendar';
import { formatReminderTime, getTodayPendingReminders } from '../shared/utils/reminderUtils.js';

const formatINR = (value) => {
  const num = Number(value || 0);
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


function ConversionGauge({ pct, trackColor, fillColor, label }) {
  const safePct = isNaN(pct) ? 0 : Math.min(100, Math.max(0, Number(pct)));
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (safePct / 100) * circ;
  const gap = circ - dash;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ position: 'relative', width: '96px', height: '96px' }}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="48" cy="48" r={r} fill="none" stroke={trackColor} strokeWidth="8" />
          <circle cx="48" cy="48" r={r} fill="none" stroke={fillColor} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={dash + ' ' + gap}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)'
        }}>{safePct.toFixed(1)}%</div>
      </div>
      <span style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}>
        {label}
      </span>
    </div>
  );
}

function ConversionGauges({ leadRate, quoteRate }) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid var(--color-border)',
      padding: '20px 24px', borderRadius: '12px', boxShadow: 'var(--shadow-premium)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '120px' }}>
        <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)' }}>Conversion Rates</span>
        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Overall Metrics</span>
      </div>
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
        <ConversionGauge pct={leadRate} trackColor="#e8f5e9" fillColor="#22c55e" label="Lead to Order" />
        <ConversionGauge pct={quoteRate} trackColor="#e0f2fe" fillColor="#0e7490" label="Quote to Order" />
      </div>
    </div>
  );
}

export default function DashboardView({ 
  state, 
  dispatch, 
  navigate, 
  onQuickAction,
  leads = [],
  quotations = [],
  orders = [],
  payments = [],
  samples = [],
  customers = []
}) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [timeFilter, setTimeFilter] = React.useState('This Month');
  const [customStartDate, setCustomStartDate] = React.useState('');
  const [customEndDate, setCustomEndDate] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('overview');
  const isMobile = useMediaQuery('(max-width: 768px)');

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchDashboard = async () => {
    const res = await apiClient.get('/backend/sales-targets/dashboard');
    return res.data;
  };

  const { data: targetData, isLoading: isLoadingTarget, isError } = useQuery({
    queryKey: ['sales-target-dashboard'],
    queryFn: fetchDashboard,
    staleTime: 60000,
  });

  const handleNav = (path) => {
    if (navigate) {
      if (typeof navigate === 'function') {
        navigate(path);
      } else if (typeof navigate.push === 'function') {
        navigate.push(path);
      }
    }
  };

  const reminders = Array.isArray(state?.reminders) ? state.reminders : [];

  const todayCrmReminders = getTodayPendingReminders(reminders);

  const resolveReminderLabel = (reminder) => {
    if (reminder.customerName) return reminder.customerName;
    if (reminder.moduleType === 'Lead') {
      const lead = leads.find((l) => String(l.id) === String(reminder.moduleId));
      return lead?.companyName || `Lead #${reminder.moduleId}`;
    }
    if (reminder.moduleType === 'Quotation') {
      const q = quotations.find((item) => String(item.id) === String(reminder.moduleId));
      return q?.customerName || `Quotation #${reminder.moduleId}`;
    }
    return reminder.title || 'Reminder';
  };

  // Helper to extract creation date from item (local timezone safe)
  const getCreatedAtDate = (item) => {
    if (!item) return null;
    let rawDate = 
      item?.createdAt || 
      item?.leadDate || 
      item?.quotationDate || 
      item?.orderDate || 
      item?.date || 
      item?.confirmedAt || 
      item?.approvedAt || 
      item?.created_at || 
      item?.updatedAt || 
      item?.followUpDate ||
      (Array.isArray(item?.timeline) && item.timeline[0]?.date) ||
      (item?._raw && (item?._raw?.created_at || item?._raw?.createdAt));
    if (!rawDate) return null;
    
    try {
      if (typeof rawDate === 'number') {
        return new Date(rawDate);
      }
      
      if (typeof rawDate === 'string') {
        const trimmed = rawDate.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          return new Date(trimmed + 'T00:00:00');
        }
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) return parsed;
      }
      
      if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
        return rawDate;
      }

      const parsed = new Date(rawDate);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch (err) {
      return null;
    }
  };

  // Helper to check if a specific timestamp falls inside the active timeframe filter
  const isTimeWithinFilter = (itemTime) => {
    if (!itemTime) return true;
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Start of week (Monday)
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday).getTime();
    
    // Start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    // Start of year
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

    switch (timeFilter) {
      case 'Today':
        return itemTime >= todayStart && itemTime <= todayStart + 86400000;
      case 'This Week':
        return itemTime >= startOfWeek && itemTime <= startOfWeek + (7 * 86400000);
      case 'This Month': {
        const start = startOfMonth;
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime() + 86400000;
        return itemTime >= start && itemTime <= end;
      }
      case 'This Year': {
        const start = startOfYear;
        const end = new Date(now.getFullYear(), 11, 31).getTime() + 86400000;
        return itemTime >= start && itemTime <= end;
      }
      case 'Custom':
        if (!customStartDate && !customEndDate) return true;
        const start = customStartDate ? new Date(customStartDate + 'T00:00:00').getTime() : 0;
        const end = customEndDate ? new Date(customEndDate + 'T23:59:59').getTime() : Infinity;
        return itemTime >= start && itemTime <= end;
      default:
        return true;
    }
  };

  // Date range filter helper
  const filterByDate = (item) => {
    const itemDate = getCreatedAtDate(item);
    if (!itemDate) return true;
    return isTimeWithinFilter(itemDate.getTime());
  };

  const effectivePayments = orders.map(o => {
    const total = Number(o.payment?.totalAmount || o.grandTotal || o.totalAmount || o.totalValue || o.total || 0);
    const payStatus = String(o.paymentStatus || '').trim().toLowerCase();
    
    let pStatus = 'Pending';
    let paid = Number(o.verifiedPaidAmount ?? o.payment?.paidAmount ?? o.amountPaid ?? o.paidAmount ?? 0);

    if (payStatus === 'fully paid' || payStatus === 'fully_paid' || payStatus === 'paid') {
      pStatus = 'Paid';
      if (paid === 0) paid = total;
    } else if (payStatus === 'partially paid' || payStatus === 'partially_paid' || paid > 0) {
      pStatus = 'Partial';
    }

    let verifiedStatus = 'Approved';
    if (payStatus.includes('pending verification') || payStatus.includes('verification_pending')) {
      verifiedStatus = 'Pending';
    }

    return {
      id: o.id || o.orderId || o.orderNumber,
      orderNo: o.orderId || o.orderNumber || o.id,
      customerName: o.customerName || o.customer?.companyName || o.customer?.name || '',
      totalAmount: total,
      paidAmount: paid,
      paymentAmount: paid, 
      status: pStatus,
      verified: verifiedStatus,
      createdAt: o.createdAt || o.date,
    };
  }).filter(p => p.totalAmount > 0 || p.paidAmount > 0);

  // Filtered lists based on selected timeframe
  const filteredLeads = leads.filter(filterByDate);
  const filteredQuotations = quotations.filter(filterByDate);
  const filteredOrders = orders.filter(filterByDate);
  const filteredPayments = effectivePayments.filter(filterByDate);
  const filteredSamples = samples.filter(filterByDate);

  // ──🔹 TOP ROW: Daily Focus metrics ──
  const newLeadsCount = filteredLeads.filter(l => l.status === 'New' || l.status === 'New Lead').length;
  
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayEnd = new Date().setHours(23, 59, 59, 999);
  const todayFollowUpsCount = leads.filter(l => {
    if (!l.followUpDate) return false;
    const d = getCreatedAtDate({ date: l.followUpDate })?.getTime();
    return d && d >= todayStart && d <= todayEnd && l.status !== 'Converted';
  }).length;
  
  const pendingFollowUpsCount = leads.filter(l => {
    if (!l.followUpDate) return false;
    const d = getCreatedAtDate({ date: l.followUpDate })?.getTime();
    return d && d > todayEnd && l.status === 'Follow-up' && isTimeWithinFilter(d);
  }).length;

  const isLeadConverted = (lead) => {
    const s = String(lead.status || lead.workflowState?.name || lead.workflowState?.code || '').toLowerCase();
    if (s.includes('convert') || s.includes('quot') || s.includes('order') || s.includes('won') || s.includes('deal') || s.includes('close') || s.includes('approv')) return true;
    if (Array.isArray(lead.quotations) && lead.quotations.length > 0) return true;
    
    const leadIdStr = String(lead.id || lead.leadId || '');
    const leadComp = (lead.companyName || lead.customerName || lead.name || '').trim().toLowerCase();

    // Check if any quotation or sample exists for this lead
    if (quotations.some(q => {
      if (q.leadId && String(q.leadId) === leadIdStr) return true;
      const qCust = (q.customerName || q.clientName || '').trim().toLowerCase();
      if (leadComp && qCust && (qCust.includes(leadComp) || leadComp.includes(qCust))) return true;
      return false;
    })) return true;

    // Check if any order exists for this lead
    if (orders.some(o => {
      if (o.leadId && String(o.leadId) === leadIdStr) return true;
      const oCust = (o.customerName || o.customer?.companyName || o.customer?.name || '').trim().toLowerCase();
      if (leadComp && oCust && (oCust.includes(leadComp) || leadComp.includes(oCust))) return true;
      return false;
    })) return true;

    return false;
  };

  const isQuoteConverted = (q) => {
    const s = String(q.status || q.workflowState?.name || q.workflowState?.code || '').toLowerCase();
    if (s.includes('approv') || s.includes('convert') || s.includes('order') || s.includes('won') || s.includes('accept')) return true;
    
    const qId = String(q.id || '');
    const qNo = String(q.quotationNumber || q.quoteNo || '').trim().toLowerCase();
    const cust = String(q.customerName || q.clientName || '').trim().toLowerCase();

    if (orders.some(o => {
      if (o.quotationId && String(o.quotationId) === qId) return true;
      if (o.quotationNumber && qNo && String(o.quotationNumber).toLowerCase() === qNo) return true;
      const oCust = (o.customerName || o.customer?.companyName || o.customer?.name || '').trim().toLowerCase();
      if (cust && oCust && (oCust.includes(cust) || cust.includes(oCust))) return true;
      return false;
    })) return true;

    return false;
  };

  const totalLeadsCount = filteredLeads.length;
  const convertedLeadsCount = filteredLeads.filter(isLeadConverted).length;
  const conversionRate = totalLeadsCount > 0 ? ((convertedLeadsCount / totalLeadsCount) * 100) : 0;
  
  const totalQuotesCount = filteredQuotations.length;
  const convertedQuotesCount = filteredQuotations.filter(isQuoteConverted).length;
  const quoteToOrderRate = totalQuotesCount > 0 ? ((convertedQuotesCount / totalQuotesCount) * 100) : 0;

  // ──🔹 SECOND ROW: Sales Pipeline metrics ──
  const pendingSamplesCount = filteredSamples.filter(s => s.status === 'Sent' || s.status === 'Pending').length;
  const pendingQuotesCount = filteredQuotations.filter(q => q.status === 'Draft' || q.status === 'Sent' || q.status === 'Pending').length;
  const approvedQuotesCount = filteredQuotations.filter(q => q.status === 'Approved').length;
  const activeOrdersCount = filteredOrders.filter(o => {
    const s = String(o.status || '').toLowerCase();
    return !['completed', 'qc passed', 'qc_passed', 'closed', 'cancelled', 'delivered', 'payment pending', 'payment_pending'].includes(s);
  }).length;

  // ──🔹 THIRD ROW: Order Progress metrics ──
  const ordersInProductionCount = filteredOrders.filter(o => {
    const s = String(o.status || '').toLowerCase();
    const dept = String(o.currentDepartment || '').toLowerCase();
    return s === 'production' || s === 'in production' || dept === 'production';
  }).length;

  const readyForDispatchCount = filteredOrders.filter(o => {
    const s = String(o.status || '').toLowerCase();
    const dsp = String(o.dispatchStatus || '').toLowerCase();
    return ['ready', 'ready for dispatch', 'qc passed', 'qc_passed'].includes(s) || dsp === 'ready';
  }).length;

  const deliveredOrdersCount = filteredOrders.filter(o => {
    const s = String(o.status || '').toLowerCase();
    const dsp = String(o.dispatchStatus || '').toLowerCase();
    return ['delivered', 'completed', 'closed'].includes(s) || dsp === 'delivered';
  }).length;

  const paymentPendingOrdersCount = filteredOrders.filter(o => {
    const s = String(o.status || '').toLowerCase();
    const dsp = String(o.dispatchStatus || '').toLowerCase();
    return ['payment pending', 'payment_pending'].includes(s) || dsp === 'payment pending' || dsp === 'payment_pending';
  }).length;

  // ──🔹 FOURTH ROW: Performance metrics ──
  const paymentVerificationCount = filteredPayments.filter(p => p.verified === 'Pending' || p.status === 'Pending').length;
  const mySalesTotal = filteredOrders
    .filter(o => !['cancelled', 'void', 'draft'].includes(String(o.status || '').toLowerCase()))
    .reduce((sum, o) => sum + Number(o.grand_total || o.total_amount || 0), 0);
  const salesTarget = targetData?.monthlyTarget || 0;
  const targetAchievement = targetData?.achievement ?? (salesTarget > 0 ? (mySalesTotal / salesTarget) * 100 : 0);
  const orderValue = (order) => Number(order.grandTotal || order.grand_total || order.totalValue || order.total_amount || order.invoiceAmount || 0);
  const orderQuantity = (order) => Number(order.quantity || order.totalQuantity || order.qty || (Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + Number(item.quantity || item.qty || 0), 0) : 0));
  const isConfirmedSalesOrder = (order) => {
    const status = String(order.workflowStatus || order.orderStatus || order.status || '').toUpperCase().replace(/\s+/g, '_');
    return !['', 'DRAFT', 'CANCELLED', 'VOID', 'REJECTED', 'PENDING'].includes(status) &&
      (status.includes('CONFIRM') || status.includes('APPROV') || ['PLANT_PENDING','PRODUCTION_PLANNED','IN_PRODUCTION','QC_PENDING','QC_PASSED','READY_FOR_DISPATCH','DISPATCHED','IN_TRANSIT','DELIVERED','COMPLETED','CLOSED','PAYMENT_PENDING'].includes(status));
  };
  const nowForSales = new Date();
  
  // Use targetData for KPIs, but keep the local monthly calculation for the historical 6-month chart
  const confirmedOrdersTotal = orders
    .filter(isConfirmedSalesOrder)
    .reduce((sum, order) => sum + orderValue(order), 0);
  const effectiveMonthlyTarget = salesTarget > 0 
    ? salesTarget 
    : (confirmedOrdersTotal > 0 ? Math.round((confirmedOrdersTotal / 3) * 1.15) : 500000);

  const monthlyTargetData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(nowForSales.getFullYear(), nowForSales.getMonth() - 5 + index, 1);
    const achieved = orders.filter(order => { 
      const orderDate = getCreatedAtDate({ ...order, createdAt: order.confirmedAt || order.approvedAt || order.orderDate || order.createdAt }); 
      return isConfirmedSalesOrder(order) && orderDate && orderDate.getFullYear() === date.getFullYear() && orderDate.getMonth() === date.getMonth(); 
    }).reduce((sum, order) => sum + orderValue(order), 0);
    return { month: date.toLocaleDateString('en-IN', { month: 'short' }), Target: effectiveMonthlyTarget, Achieved: achieved };
  });

  const deliveredOrdersForReturns = orders.filter(order => ['delivered','completed','closed'].includes(String(order.status || '').toLowerCase()) || String(order.dispatchStatus || order.deliveryStatus || '').toLowerCase().includes('deliver'));
  const returnOrders = orders.filter(order => order.activeReturnExists || order.returnStatus || Number(order.returnQty) > 0);
  const returnedQuantity = returnOrders.reduce((sum, order) => sum + Number(order.returnQty || order.returnedQuantity || 0), 0);
  const returnValue = returnOrders.reduce((sum, order) => { const qty = Number(order.returnQty || order.returnedQuantity || 0); const totalQty = orderQuantity(order); return sum + Number(order.returnValue || (totalQty > 0 ? (orderValue(order) / totalQty) * qty : 0)); }, 0);
  const returnRate = deliveredOrdersForReturns.length > 0 ? (returnOrders.length / deliveredOrdersForReturns.length) * 100 : 0;
  const monthlyReturnData = Array.from({ length: 6 }, (_, index) => { const date = new Date(nowForSales.getFullYear(), nowForSales.getMonth() - 5 + index, 1); const rows = returnOrders.filter(order => { const d = getCreatedAtDate({ ...order, createdAt: order.returnRequestedAt || order.updatedAt || order.createdAt }); return d && d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth(); }); return { month: date.toLocaleDateString('en-IN', { month: 'short' }), ReturnQuantity: rows.reduce((sum, order) => sum + Number(order.returnQty || order.returnedQuantity || 0), 0), ReturnValue: rows.reduce((sum, order) => { const qty = Number(order.returnQty || order.returnedQuantity || 0); const totalQty = orderQuantity(order); return sum + Number(order.returnValue || (totalQty > 0 ? (orderValue(order) / totalQty) * qty : 0)); }, 0) }; });
  const reasonCategories = ['Product Quality','Damaged During Transit','Wrong Product','Quantity Issue','Customer Rejection','Other'];
  const topReturnReasons = reasonCategories.map(reason => ({ reason, count: returnOrders.filter(order => { const text = String(order.returnReason || '').toLowerCase(); if (reason === 'Product Quality') return text.includes('quality') || text.includes('defect'); if (reason === 'Damaged During Transit') return text.includes('damage') || text.includes('transit'); if (reason === 'Wrong Product') return text.includes('wrong'); if (reason === 'Quantity Issue') return text.includes('quantity') || text.includes('short'); if (reason === 'Customer Rejection') return text.includes('reject'); return !['quality','defect','damage','transit','wrong','quantity','short','reject'].some(term => text.includes(term)); }).length })).sort((a,b) => b.count - a.count);
  const collectionAmount = filteredPayments
    .filter(p => p.verified === 'Approved' || p.verified === 'Yes' || p.status === 'Approved' || p.status === 'Verified')
    .reduce((sum, p) => sum + Number(p.paymentAmount || p.totalAmount || p.amount || 0), 0);

  // ──🔹 Dynamic & Accurate Payment Summary Metrics ──
  const totalPaymentAmount = filteredOrders.reduce((sum, o) => {
    return sum + Number(o.grandTotal ?? o.totalAmount ?? o.payment?.totalAmount ?? o.totalValue ?? 0);
  }, 0) || filteredPayments.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);

  const totalPaymentReceivedAmount = filteredOrders.reduce((sum, o) => {
    const paid = Number(o.verifiedPaidAmount ?? o.payment?.paidAmount ?? o.payment?.paid ?? 0);
    if (paid > 0) return sum + paid;
    const payStatus = String(o.paymentStatus || '').toLowerCase();
    if (payStatus === 'fully paid' || payStatus === 'fully_paid' || payStatus === 'paid') {
      return sum + Number(o.grandTotal ?? o.totalAmount ?? o.totalValue ?? 0);
    }
    return sum;
  }, 0) || filteredPayments.reduce((sum, p) => sum + Number(p.paidAmount || p.paymentAmount || 0), 0);

  const totalPaymentDueAmount = Math.max(0, totalPaymentAmount - totalPaymentReceivedAmount);

  const totalCustomersCount = new Set([
    ...filteredOrders.map(o => (o.customerName || o.customer?.companyName || o.customer?.name || o.clientName || '').trim()),
    ...filteredPayments.map(p => (p.customerName || '').trim()),
    ...filteredLeads.map(l => (l.companyName || l.customerName || '').trim())
  ].filter(Boolean)).size || (customers?.length || 0);

  // ──⚠️ ALERTS calculation ──
  const overdueFollowUps = leads.filter(l => l.followUpDate && new Date(l.followUpDate).getTime() < todayStart && l.status !== 'Converted');
  const expiredSamplesLimit = todayStart - (14 * 24 * 60 * 60 * 1000);
  const expiredSamples = filteredSamples.filter(s => (s.status === 'Sent' || s.status === 'Pending') && getCreatedAtDate(s)?.getTime() < expiredSamplesLimit);
  const expiredQuotes = filteredQuotations.filter(q => q.status !== 'Approved' && q.status !== 'Closed' && q.validTill && new Date(q.validTill).getTime() < todayStart);
  const overduePayments = filteredPayments.filter(p => (p.status === 'Pending' || p.verified === 'Pending') && getCreatedAtDate(p)?.getTime() < todayStart);

  // ──📊 QUICK SUMMARY calculation ──
  const qualifiedLeadsCount = filteredLeads.filter(l => !['Lost', 'Dead', 'Dropped'].includes(l.status)).length;
  const wonOrdersCount = filteredOrders.filter(o => !['cancelled', 'void', 'draft'].includes(String(o.status || '').toLowerCase())).length;
  const lostLeadsCount = filteredLeads.filter(l => ['Lost', 'Dead', 'Dropped'].includes(l.status)).length;
  const avgOrderValue = wonOrdersCount > 0 ? Math.round(mySalesTotal / wonOrdersCount) : 0;
  const activeCustomersCount = totalCustomersCount;

  // Sales trend line data fetching
  const [salesSummary, setSalesSummary] = React.useState([]);

  React.useEffect(() => {
    let active = true;
    const fetchSalesTrend = async () => {
      try {
        let dateFromStr = '';
        let dateToStr = '';
        const now = new Date();
        
        if (timeFilter === 'Today') {
          dateFromStr = now.toISOString().split('T')[0];
          dateToStr = now.toISOString().split('T')[0];
        } else if (timeFilter === 'This Week') {
          const currentDay = now.getDay();
          const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
          const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday);
          dateFromStr = monday.toISOString().split('T')[0];
          dateToStr = new Date().toISOString().split('T')[0];
        } else if (timeFilter === 'This Month') {
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          dateFromStr = firstDay.toISOString().split('T')[0];
          dateToStr = new Date().toISOString().split('T')[0];
        } else if (timeFilter === 'This Year') {
          const firstDay = new Date(now.getFullYear(), 0, 1);
          dateFromStr = firstDay.toISOString().split('T')[0];
          dateToStr = new Date().toISOString().split('T')[0];
        } else if (timeFilter === 'Custom') {
          dateFromStr = customStartDate || new Date(0).toISOString().split('T')[0];
          dateToStr = customEndDate || new Date().toISOString().split('T')[0];
        } else {
          const dFrom = new Date();
          dFrom.setMonth(dFrom.getMonth() - 6);
          dateFromStr = dFrom.toISOString().split('T')[0];
          dateToStr = new Date().toISOString().split('T')[0];
        }

        const res = await apiClient.get(`/reports/sales/summary?date_from=${dateFromStr}&date_to=${dateToStr}`);
        if (active) {
          setSalesSummary(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard sales summary:', err);
      }
    };
    fetchSalesTrend();
    return () => { active = false; };
  }, [timeFilter, customStartDate, customEndDate]);

  const getDynamicTrendData = () => {
    try {
      // Dynamic 6-month pipeline trend calculation
      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const data = [];
      const safeLeads = Array.isArray(leads) ? leads : [];
      const safeQuotes = Array.isArray(quotations) ? quotations : [];
      const safeOrders = Array.isArray(orders) ? orders : [];
      
      for (let i = 5; i >= 0; i--) {
        const targetMonthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mIdx = targetMonthDate.getMonth();
        const mYear = targetMonthDate.getFullYear();
        const start = new Date(mYear, mIdx, 1).getTime();
        const end = new Date(mYear, mIdx + 1, 0).getTime() + 86400000 - 1;
        const Leads = safeLeads.filter(l => { const t = getCreatedAtDate(l)?.getTime(); return t && t >= start && t <= end; }).length;
        const Quotations = safeQuotes.filter(q => { const t = getCreatedAtDate(q)?.getTime(); return t && t >= start && t <= end; }).length;
        const Conversions = safeOrders.filter(o => { const t = getCreatedAtDate(o)?.getTime(); return t && t >= start && t <= end; }).length;
        data.push({ name: months[mIdx], Leads, Quotations, Conversions });
      }
      return data;
    } catch (err) {
      console.error('Error calculating trend data:', err);
      return [];
    }
  };
  
  const trendData = getDynamicTrendData();

  return (
    <div className="sales-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ──🔹 HEADER BAR ── */}
      <div className="sales-info-bar" style={{
        background: '#ffffff', padding: '16px', borderRadius: '12px',
        border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)',
        display: 'flex', flexDirection: 'column', gap: '12px'
      }}>
        <div className="sales-info-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)' }}>
          <Activity size={20} className="pulse-icon" style={{ color: '#0ea5e9', flexShrink: 0 }} />
          <span style={{ fontWeight: '800', fontSize: '15px', letterSpacing: '-0.2px' }}>Sales Representative Dashboard</span>
        </div>
        <div className="sales-info-badges" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <div className="sales-badge sales-badge-role" style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '11px', fontWeight: '700', padding: '4px 10px',
            background: '#e0f2fe', border: '1px solid #bae6fd',
            borderRadius: '20px', color: '#0369a1', whiteSpace: 'nowrap'
          }}>
            <ShieldCheck size={14} />
            <span>Role: Sales Executive</span>
          </div>
          <div className="sales-badge sales-badge-active" style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '11px', fontWeight: '700', padding: '4px 10px',
            background: '#dcfce7', border: '1px solid #bbf7d0',
            borderRadius: '20px', color: '#15803d', whiteSpace: 'nowrap'
          }}>
            <span className="pulse-red-dot" style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }}></span>
            <span>Live Sync Mode</span>
          </div>
        </div>
      </div>

      {/* ──📅 TIMEFRAME FILTERS ── */}
      <div className="sales-dashboard-filters" style={{
        background: '#ffffff',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: '10px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-primary)', flexShrink: 0 }}>
          <Calendar size={16} style={{ color: '#0ea5e9' }} />
          <span style={{ fontSize: '12px', fontWeight: '800', whiteSpace: 'nowrap' }}>Filter:</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          flex: 1,
          width: '100%',
          minWidth: 0
        }}>
          {['Today', 'This Week', 'This Month', 'This Year', 'Custom'].map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                border: `1px solid ${timeFilter === f ? '#0ea5e9' : '#e2e8f0'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: timeFilter === f ? '#0ea5e9' : '#f8fafc',
                color: timeFilter === f ? '#ffffff' : '#475569',
                whiteSpace: 'nowrap',
                lineHeight: '1.4',
                boxShadow: timeFilter === f ? '0 2px 4px rgba(14,165,233,0.2)' : 'none'
              }}
            >
              {f}
            </button>
          ))}

          {timeFilter === 'Custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px', flexWrap: 'wrap' }}>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                style={{
                  border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '8px',
                  background: '#ffffff', color: '#0f172a', fontSize: '11px'
                }}
              />
              <span style={{ fontSize: '11px', color: '#64748b', flexShrink: 0 }}>to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                style={{
                  border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '8px',
                  background: '#ffffff', color: '#0f172a', fontSize: '11px'
                }}
              />
            </div>
          )}
        </div>
      </div>


      {/* ──🔹 SALES FLOW PIPELINE VISUALIZER ── */}
      <div className="sales-flow-pipeline">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={16} style={{ color: '#10b981' }} />
          <span style={{ fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-secondary)' }}>
            Final Sales Employee Dashboard Flow
          </span>
        </div>
        <div className="sales-flow-pipeline-steps">
          {[
            { label: 'Leads', val: filteredLeads.length, color: '#3b82f6', bg: '#eff6ff', path: '/sales/leads' },
            { label: 'Follow-ups', val: todayFollowUpsCount + pendingFollowUpsCount, color: '#8b5cf6', bg: '#f5f3ff', path: '/sales/leads' },
            { label: 'Samples', val: pendingSamplesCount, color: '#f59e0b', bg: '#fffbeb', path: '/sales/samples' },
            { label: 'Quotations', val: pendingQuotesCount + approvedQuotesCount, color: '#10b981', bg: '#ecfdf5', path: '/sales/quotations' },
            { label: 'Orders', val: activeOrdersCount, color: '#06b6d4', bg: '#ecfeff', path: '/sales/orders' },
            { label: 'Production', val: ordersInProductionCount, color: '#f43f5e', bg: '#fff1f2', path: '/sales/production-status' },
            { label: 'Dispatch', val: readyForDispatchCount, color: '#eab308', bg: '#fefce8', path: '/sales/orders' },
            { label: 'Delivered', val: deliveredOrdersCount, color: '#10b981', bg: '#ecfdf5', path: '/sales/orders' },
            { label: 'Payment', val: paymentPendingOrdersCount, color: '#ef4444', bg: '#fef2f2', path: '/sales/payment-followup' }
          ].map((step, idx, arr) => (
            <React.Fragment key={step.label}>
              <div 
                onClick={() => handleNav(step.path)}
                className="pipeline-step-card" 
                style={{
                  background: step.bg,
                  border: `1px solid ${step.color}22`
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: '900', color: step.color }}>{step.val}</span>
                <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{step.label}</span>
              </div>
              {idx < arr.length - 1 && (
                <ChevronRight size={14} className="pipeline-separator" style={{ color: '#D6E2F0', flexShrink: 0 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      {/* ── MOBILE TABS SWITCHER ── */}
      {isMobile && (
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '12px',
          padding: '4px',
          gap: '4px',
          marginBottom: '16px'
        }}>
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'calendar', label: '📅 Tasks & Calendar' },
            { id: 'alerts', label: '⚠️ Alerts & Stats' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                border: 'none',
                background: activeTab === tab.id ? '#ffffff' : 'transparent',
                color: activeTab === tab.id ? '#24345C' : '#5E6B82',
                fontWeight: '700',
                fontSize: '12px',
                padding: '8px 4px',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── RESPONSIVE GRID LAYOUT ── */}
      {!isMobile ? (
        <div className="sales-dashboard-grid-layout">
          
          {/* LEFT COLUMN: The Main Metric Rows & Chart */}
          <div className="sales-dashboard-main-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Payment Summary Cards */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', margin: 0, letterSpacing: '0.5px' }}>
                  Payment Summary
                </h3>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#0ea5e9', background: '#e0f2fe', padding: '3px 10px', borderRadius: '12px' }}>
                  {timeFilter} Filtered
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>

                {/* 1. Total Payment */}
                <div style={{
                  background: '#ffffff', border: '1px solid #e0e7ff',
                  borderLeft: '4px solid #6366f1',
                  padding: '16px 18px', borderRadius: '12px',
                  display: 'flex', flexDirection: 'column', gap: '6px',
                  boxShadow: '0 2px 6px rgba(99,102,241,0.08)'
                }}>
                  <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#4f46e5' }}>Total Payment</span>
                  <span style={{ fontSize: '22px', fontWeight: '900', color: '#3730a3' }}>
                    {formatINR(totalPaymentAmount)}
                  </span>
                </div>

                {/* 2. Total Payment Due */}
                <div style={{
                  background: '#ffffff', border: '1px solid #fee2e2',
                  borderLeft: '4px solid #ef4444',
                  padding: '16px 18px', borderRadius: '12px',
                  display: 'flex', flexDirection: 'column', gap: '6px',
                  boxShadow: '0 2px 6px rgba(239,68,68,0.08)'
                }}>
                  <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#ef4444' }}>Total Payment Due</span>
                  <span style={{ fontSize: '22px', fontWeight: '900', color: '#dc2626' }}>
                    {formatINR(totalPaymentDueAmount)}
                  </span>
                </div>

                {/* 3. Total Customers */}
                <div style={{
                  background: '#ffffff', border: '1px solid #dbeafe',
                  borderLeft: '4px solid #3b82f6',
                  padding: '16px 18px', borderRadius: '12px',
                  display: 'flex', flexDirection: 'column', gap: '6px',
                  boxShadow: '0 2px 6px rgba(59,130,246,0.08)'
                }}>
                  <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#2563eb' }}>Total Customers</span>
                  <span style={{ fontSize: '22px', fontWeight: '900', color: '#1d4ed8' }}>
                    {totalCustomersCount}
                  </span>
                </div>

                {/* 4. Payment Received */}
                <div style={{
                  background: '#ffffff', border: '1px solid #dcfce7',
                  borderLeft: '4px solid #22c55e',
                  padding: '16px 18px', borderRadius: '12px',
                  display: 'flex', flexDirection: 'column', gap: '6px',
                  boxShadow: '0 2px 6px rgba(34,197,94,0.08)'
                }}>
                  <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#16a34a' }}>Payment Received</span>
                  <span style={{ fontSize: '22px', fontWeight: '900', color: '#15803d' }}>
                    {formatINR(totalPaymentReceivedAmount)}
                  </span>
                </div>

              </div>
            </div>

            {/* 🔹 ROW 4: Performance */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '12px', letterSpacing: '0.5px' }}>
                Performance Metrics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                
                {/* Payment Verification */}
                <div onClick={() => handleNav('/sales/payment-followup')} style={{
                  cursor: 'pointer', background: '#ffffff', border: '1px solid var(--color-border)',
                  padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px',
                  boxShadow: 'var(--shadow-card)', transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)' }}>Verifications</span>
                    <div style={{ color: '#f59e0b', background: '#fffbeb', padding: '5px', borderRadius: '6px' }}>
                       <FileCheck size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--color-text-primary)' }}>{paymentVerificationCount}</div>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Pending with audit team</span>
                </div>

                {/* My Sales */}
                <div onClick={() => handleNav('/sales/reports')} style={{
                  cursor: 'pointer', background: '#ffffff', border: '1px solid var(--color-border)',
                  padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px',
                  boxShadow: 'var(--shadow-card)', transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)' }}>My Sales</span>
                    <div style={{ color: '#10b981', background: '#ecfdf5', padding: '5px', borderRadius: '6px' }}>
                      <DollarSign size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-text-primary)' }}>
                    ₹{mySalesTotal.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Won order value</span>
                </div>

                {/* Target Achievement (%) */}
                <div style={{
                  background: '#ffffff', border: '1px solid var(--color-border)',
                  padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)' }}>Target Achieved</span>
                    <div style={{ color: '#8b5cf6', background: '#f5f3ff', padding: '5px', borderRadius: '6px' }}>
                      <Target size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--color-text-primary)' }}>{(targetData?.achievement || 0).toFixed(1)}%</div>
                  
                  {/* Micro Progress Bar */}
                  <div style={{ height: '5px', background: '#DCE5F0', borderRadius: '3px', overflow: 'hidden', marginTop: 'auto' }}>
                    <div style={{ width: `${targetData?.progress || 0}%`, height: '100%', background: '#8b5cf6', borderRadius: '3px' }}></div>
                  </div>
                </div>

              </div>
            </div>

            {/* CONVERSION RATES GAUGES */}
            <ConversionGauges leadRate={conversionRate} quoteRate={quoteToOrderRate} />

            {/* ──📊 CONVERSION TREND CHART ── */}
            <div className="sales-pipeline-card" style={{
              margin: 0, background: '#ffffff', border: '1px solid var(--color-border)',
              padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--color-text-primary)',
              boxShadow: 'var(--shadow-premium)'
            }}>
              <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 className="card-heading" style={{ fontSize: '15px', fontWeight: '850', margin: 0, color: 'var(--color-text-primary)' }}>Sales Pipeline & Conversion Trend</h2>
                  <span className="glass-stat-subtext" style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '2px', fontWeight: '600' }}>
                    Multi-stage pipeline flow & conversion velocity over last 6 months
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '11.5px', fontWeight: '700', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0ea5e9' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0ea5e9', display: 'inline-block' }}></span> Leads
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#8b5cf6' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }}></span> Quotations
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span> Won Orders
                  </span>
                </div>
              </div>

              <div style={{ width: '100%', height: '260px', minHeight: '260px', marginTop: '6px', minWidth: 0, position: 'relative' }}>
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="colorQuotes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="colorConvs" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#5E6B82" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#5E6B82" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, 'auto']} />
                      <Tooltip
                        contentStyle={{ background: '#ffffff', border: '1px solid #D6E2F0', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                        itemStyle={{ color: 'var(--color-text-primary)' }}
                        labelStyle={{ fontWeight: 'bold', color: 'var(--color-text-secondary)' }}
                      />
                      <Area type="monotone" dataKey="Leads" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLeads)" isAnimationActive={false} />
                      <Area type="monotone" dataKey="Quotations" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorQuotes)" isAnimationActive={false} />
                      <Area type="monotone" dataKey="Conversions" name="Won Orders" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorConvs)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* ──📅 DAILY CALENDAR CARD (BELOW CONVERSION TREND) ── */}
            <div className="app-card" style={{
              padding: '16px', background: '#ffffff', border: '1px solid var(--color-border)',
              borderRadius: '12px', minHeight: '480px', display: 'flex', flexDirection: 'column',
              boxShadow: 'var(--shadow-premium)', marginTop: '20px'
            }}>
              <DailyAgendaCalendar 
                state={state} 
                leads={leads} 
                quotations={quotations} 
                orders={orders} 
                payments={payments} 
                samples={samples} 
                reminders={reminders || state?.reminders || []} 
              />
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar elements */}
          <div className="sales-dashboard-sidebar-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>


            {/* 📊 QUICK SUMMARY */}
            <div style={{
              background: '#ffffff', border: '1px solid var(--color-border)',
              padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px',
              boxShadow: 'var(--shadow-premium)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} style={{ color: '#0ea5e9' }} />
                <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                  Quick Summary
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Total Leads', val: totalLeadsCount, color: '#3b82f6' },
                  { label: 'Qualified Leads', val: qualifiedLeadsCount, color: '#8b5cf6' },
                  { label: 'Won Orders', val: wonOrdersCount, color: '#10b981' },
                  { label: 'Lost Leads', val: lostLeadsCount, color: '#f43f5e' },
                  { label: 'Conversion Rate', val: `${conversionRate.toFixed(1)}%`, color: '#06b6d4' },
                  { label: 'Revenue', val: `₹${mySalesTotal.toLocaleString('en-IN')}`, color: '#10b981', fullWidth: true },
                  { label: 'Avg Order Value', val: `₹${avgOrderValue.toLocaleString('en-IN')}`, color: '#f59e0b', fullWidth: true },
                  { label: 'Active Customers', val: activeCustomersCount, color: '#6366f1' }
                ].map((item) => (
                  <div key={item.label} style={{
                    gridColumn: item.fullWidth ? '1 / -1' : 'auto',
                    background: '#F5FAFE', padding: '10px', borderRadius: '8px',
                    display: 'flex', flexDirection: 'column', gap: '2px', border: '1px solid var(--color-border)'
                  }}>
                    <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: item.color }}>
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        
        /* ── MOBILE TABBED VIEWPORT WORKSPACE ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Compact 2x3 Metric Cards Grid */}
              <div className="mobile-2col-grid">
                
                {/* Total Payment */}
                <div className="mobile-2col-card" style={{
                  background: '#ffffff', border: '1px solid #e0e7ff', borderLeft: '4px solid #6366f1',
                  padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px',
                  boxShadow: '0 1px 4px rgba(99,102,241,0.06)'
                }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#4f46e5' }}>Total Payment</span>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: '#3730a3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formatINR(totalPaymentAmount)}
                  </span>
                </div>

                {/* Total Payment Due */}
                <div className="mobile-2col-card" style={{
                  background: '#ffffff', border: '1px solid #fee2e2', borderLeft: '4px solid #ef4444',
                  padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px',
                  boxShadow: '0 1px 4px rgba(239,68,68,0.06)'
                }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#ef4444' }}>Payment Due</span>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: '#dc2626', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formatINR(totalPaymentDueAmount)}
                  </span>
                </div>

                {/* Total Customers */}
                <div className="mobile-2col-card" style={{
                  background: '#ffffff', border: '1px solid #dbeafe', borderLeft: '4px solid #3b82f6',
                  padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px',
                  boxShadow: '0 1px 4px rgba(59,130,246,0.06)'
                }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#3b82f6' }}>Customers</span>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: '#1d4ed8' }}>
                    {totalCustomersCount}
                  </span>
                </div>

                {/* Payment Received */}
                <div className="mobile-2col-card" style={{
                  background: '#ffffff', border: '1px solid #dcfce7', borderLeft: '4px solid #22c55e',
                  padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px',
                  boxShadow: '0 1px 4px rgba(34,197,94,0.06)'
                }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#16a34a' }}>Payment Received</span>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: '#15803d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formatINR(totalPaymentReceivedAmount)}
                  </span>
                </div>

                {/* Verifications */}
                <div className="mobile-2col-card" onClick={() => handleNav('/sales/payment-followup')} style={{
                  cursor: 'pointer', background: '#ffffff', border: '1px solid var(--color-border)',
                  padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Verifications</span>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--color-text-primary)' }}>{paymentVerificationCount}</span>
                </div>

                {/* My Sales */}
                <div className="mobile-2col-card" onClick={() => handleNav('/sales/reports')} style={{
                  cursor: 'pointer', background: '#ffffff', border: '1px solid var(--color-border)',
                  padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>My Sales</span>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: '#10b981', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    ₹{mySalesTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Target Achieved */}
                <div className="mobile-2col-card" style={{
                  background: '#ffffff', border: '1px solid var(--color-border)',
                  padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Target Achieved</span>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: '#8b5cf6' }}>{(Number(targetAchievement) || 0).toFixed(1)}%</span>
                </div>

              </div>

              {/* Conversion Gauges (Compact Row) */}
              <div style={{
                background: '#ffffff', border: '1px solid var(--color-border)',
                padding: '14px', borderRadius: '12px', boxShadow: 'var(--shadow-premium)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '12px'
              }}>
                <ConversionGauge pct={conversionRate} trackColor="#e8f5e9" fillColor="#22c55e" label="Lead to Order" />
                <ConversionGauge pct={quoteToOrderRate} trackColor="#e0f2fe" fillColor="#0e7490" label="Quote to Order" />
              </div>

            </div>
          )}

            {/* TAB 2: TASKS & CALENDAR */}
            {activeTab === 'calendar' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="app-card" style={{
                  padding: '12px', background: '#ffffff', border: '1px solid var(--color-border)',
                  borderRadius: '12px', height: '480px', display: 'flex', flexDirection: 'column',
                  boxShadow: 'var(--shadow-premium)'
                }}>
                  <DailyAgendaCalendar 
                    state={state} 
                    leads={leads} 
                    quotations={quotations} 
                    orders={orders} 
                    payments={payments} 
                    samples={samples} 
                    reminders={reminders || state?.reminders || []} 
                  />
                </div>
              </div>
            )}

          {/* TAB 3: ALERTS & STATS */}
          {activeTab === 'alerts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Removed System Alerts per user request */}

              {/* Conversion Trend Chart (Compact) */}
              <div className="sales-pipeline-card" style={{
                margin: 0, background: '#ffffff', border: '1px solid var(--color-border)',
                padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--color-text-primary)',
                boxShadow: 'var(--shadow-premium)'
              }}>
                <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <h2 className="card-heading" style={{ fontSize: '13px', fontWeight: '850', margin: 0, color: 'var(--color-text-primary)' }}>Conversion Trend</h2>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '10px', fontWeight: '700' }}>
                    <span style={{ color: '#0ea5e9' }}>● Leads</span>
                    <span style={{ color: '#8b5cf6' }}>● Quotes</span>
                    <span style={{ color: '#10b981' }}>● Won</span>
                  </div>
                </div>
                <div style={{ width: '100%', height: '200px', minHeight: '200px', marginTop: '6px', minWidth: 0, position: 'relative' }}>
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                      <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorLeadsMobile" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="colorQuotesMobile" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="colorConvsMobile" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" stroke="#5E6B82" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#5E6B82" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, 'auto']} />
                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #D6E2F0' }} />
                        <Area type="monotone" dataKey="Leads" stroke="#0ea5e9" strokeWidth={1.8} fillOpacity={1} fill="url(#colorLeadsMobile)" isAnimationActive={false} />
                        <Area type="monotone" dataKey="Quotations" stroke="#8b5cf6" strokeWidth={1.8} fillOpacity={1} fill="url(#colorQuotesMobile)" isAnimationActive={false} />
                        <Area type="monotone" dataKey="Conversions" name="Won Orders" stroke="#10b981" strokeWidth={1.8} fillOpacity={1} fill="url(#colorConvsMobile)" isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Removed Quick Summary per user request */}

            </div>
          )}

        </div>
      )}

      {/* Sales performance and return intelligence */}
      <div className="sales-analytics-grid">
        <section className="app-card sales-analytics-card" style={{ padding: '20px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '14px', boxShadow: 'var(--shadow-premium)', minWidth: 0 }}>
          <div style={{ marginBottom: '18px' }}><h2 style={{ margin: 0, fontSize: '17px', fontWeight: 850, color: '#24345C' }}>Sales Target vs Achievement</h2><p style={{ margin: '4px 0 0', fontSize: '12px', color: '#5E6B82' }}>Current Active Target · confirmed and approved sales orders</p></div>
          
          {isLoadingTarget ? (
            <div style={{ padding: '30px', textAlign: 'center', background: '#F5FAFE', borderRadius: '9px', border: '1px dashed #DCE5F0', color: '#5E6B82' }}>
              <div className="spinner" style={{ margin: '0 auto 10px', width: '24px', height: '24px', border: '3px solid rgba(0,0,0,0.1)', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ margin: 0, fontWeight: 600 }}>Loading active sales target...</p>
            </div>
          ) : isError ? (
            <div style={{ padding: '30px', textAlign: 'center', background: '#fff1f2', borderRadius: '9px', border: '1px dashed #fecdd3', color: '#e11d48' }}>
              <AlertTriangle size={32} style={{ opacity: 0.5, margin: '0 auto 10px' }} />
              <p style={{ margin: 0, fontWeight: 600 }}>Failed to load target data.</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Please try refreshing the page.</p>
            </div>
          ) : targetData?.target ? (
            <>
              <div className="sales-target-kpis" style={{ marginBottom: '18px' }}>
                {[
                  ['Target Period', targetData.target.period || 'Monthly', '#24345C'],
                  ['Total Target', `₹${(targetData.monthlyTarget / 100000).toFixed(1)} L`, '#24345C'],
                  ['Achieved Sales', `₹${(targetData.achievedSales / 100000).toFixed(1)} L`, '#059669'],
                  ['Achievement', `${targetData.achievement.toFixed(1)}%`, '#7c3aed'],
                  ['Remaining', `₹${(targetData.remainingTarget / 100000).toFixed(1)} L`, '#ea580c'],
                  ['Days Remaining', targetData.daysRemaining, '#2563eb'],
                  ['Req. Daily Sales', `₹${Math.round(targetData.requiredDailySales).toLocaleString('en-IN')}`, '#dc2626']
                ].map(([label, value, color]) => (
                  <div className="sales-analytics-kpi" key={label} style={{ padding: '11px 12px', borderRadius: '9px', background: '#F5FAFE', border: '1px solid #DCE5F0', minWidth: 0 }}>
                    <div style={{ fontSize: '10px', fontWeight: 750, color: '#5E6B82', textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ marginTop: '4px', fontSize: '16px', fontWeight: 850, color, overflowWrap: 'anywhere' }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 750, color: '#475569', marginBottom: '7px' }}>
                  <span>Current progress</span>
                  <span>{targetData.achievement.toFixed(1)}%</span>
                </div>
                <div style={{ height: '10px', borderRadius: '999px', background: '#DCE5F0', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${targetData.progress}%`, borderRadius: '999px', background: 'linear-gradient(90deg, #84cc16, #16a34a)', transition: 'width .4s ease' }} />
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '24px 20px', textAlign: 'center', background: '#F5FAFE', borderRadius: '9px', border: '1px dashed #DCE5F0', color: '#5E6B82', marginBottom: '16px' }}>
              <Target size={28} style={{ opacity: 0.4, margin: '0 auto 8px', color: '#6366f1' }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: '#24345C' }}>No custom target set for current month</p>
              <p style={{ margin: '4px 0 0', fontSize: '11.5px' }}>Showing calculated baseline target vs achieved sales from orders below.</p>
            </div>
          )}
          
          <div className="sales-analytics-chart" style={{ width: '100%', height: '280px', minHeight: '280px', minWidth: 0, position: 'relative' }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <BarChart data={monthlyTargetData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={value => `${Math.round(value / 100000)}L`} />
                  <Tooltip 
                    formatter={value => `₹${Number(value).toLocaleString('en-IN')}`} 
                    contentStyle={{ background: '#fff', borderRadius: '8px', border: '1px solid #DCE5F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11.5px', paddingTop: '8px' }} />
                  <Bar dataKey="Target" fill="#cbd5e1" radius={[6, 6, 0, 0]} barSize={isMobile ? 12 : 20} isAnimationActive={false} />
                  <Bar dataKey="Achieved" fill="#16a34a" radius={[6, 6, 0, 0]} barSize={isMobile ? 12 : 20} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="app-card sales-analytics-card" style={{ padding: '20px', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '14px', boxShadow: 'var(--shadow-premium)', minWidth: 0 }}>
          <div style={{ marginBottom: '18px' }}><h2 style={{ margin: 0, fontSize: '17px', fontWeight: 850, color: '#24345C' }}>Sales Return Analysis</h2><p style={{ margin: '4px 0 0', fontSize: '12px', color: '#5E6B82' }}>Delivered orders and recorded customer return requests</p></div>
          
          {returnOrders.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', background: '#F5FAFE', borderRadius: '9px', border: '1px dashed #DCE5F0', color: '#5E6B82', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Package size={32} style={{ opacity: 0.4, marginBottom: '8px', color: '#3b82f6' }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: '#24345C' }}>Zero returns recorded</p>
              <p style={{ margin: '4px 0 0', fontSize: '11.5px', maxWidth: '320px' }}>Your delivered orders have 100% acceptance. Any RMA or return requests will display below.</p>
            </div>
          ) : (
            <div className="sales-return-kpis" style={{ marginBottom: '18px' }}>
              {[
                ['Delivered Orders', deliveredOrdersForReturns.length], ['Return Requests', returnOrders.length], ['Returned Quantity', returnedQuantity.toLocaleString('en-IN')], ['Return Value', `₹${Math.round(returnValue).toLocaleString('en-IN')}`], ['Return Rate', `${returnRate.toFixed(1)}%`]
              ].map(([label,value]) => <div className="sales-analytics-kpi" key={label} style={{ padding: '11px 12px', borderRadius: '9px', background: '#F5FAFE', border: '1px solid #DCE5F0' }}><div style={{ fontSize: '10px', fontWeight: 750, color: '#5E6B82', textTransform: 'uppercase' }}>{label}</div><div style={{ marginTop: '4px', fontSize: '16px', fontWeight: 850, color: '#24345C', overflowWrap: 'anywhere' }}>{value}</div></div>)}
            </div>
          )}

          <div className="sales-analytics-chart" style={{ width: '100%', height: '260px', minHeight: '260px', minWidth: 0, position: 'relative' }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
                <BarChart data={monthlyReturnData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="qty" stroke="#64748b" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis yAxisId="value" orientation="right" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={value => `${Math.round(value / 1000)}k`} />
                  <Tooltip 
                    formatter={(value, name) => name === 'ReturnValue' || name === 'Return Value' ? `₹${Number(value).toLocaleString('en-IN')}` : Number(value).toLocaleString('en-IN')} 
                    contentStyle={{ background: '#fff', borderRadius: '8px', border: '1px solid #DCE5F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11.5px', paddingTop: '8px' }} />
                  <Bar yAxisId="qty" dataKey="ReturnQuantity" name="Return Quantity" fill="#f97316" radius={[6, 6, 0, 0]} barSize={isMobile ? 10 : 16} isAnimationActive={false} />
                  <Bar yAxisId="value" dataKey="ReturnValue" name="Return Value" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={isMobile ? 10 : 16} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {returnOrders.length > 0 && (
            <div style={{ borderTop: '1px solid #DCE5F0', paddingTop: '14px', marginTop: '8px' }}><h3 style={{ fontSize: '12px', fontWeight: 800, margin: '0 0 10px', color: '#334155' }}>Top Return Reasons</h3><div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>{topReturnReasons.map(item => <span key={item.reason} style={{ padding: '5px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: item.count ? '#fff7ed' : '#F5FAFE', color: item.count ? '#c2410c' : '#8893A7', border: `1px solid ${item.count ? '#fed7aa' : '#DCE5F0'}` }}>{item.reason} · {item.count}</span>)}</div></div>
          )}
        </section>
      </div>

    </div>
  );
}

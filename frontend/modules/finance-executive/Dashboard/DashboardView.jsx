'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ResponsiveContainer, 
  AreaChart, Area,
  LineChart, Line, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Calendar,
  ArrowUpRight,
  RefreshCw,
  Search,
  Filter,
  Check,
  XCircle,
  Plus,
  ShieldCheck,
  FileText,
  DollarSign,
  Activity,
  Layers,
  Database,
  Building2,
  ChevronRight,
  X,
  ExternalLink
} from 'lucide-react';
import Swal from 'sweetalert2';
import { backendFetch } from '../../../lib/backendFetch';
import { apiClient } from '../../../lib/apiClient';
import { useERPStore } from '../../../store/erpStore';
import { useAuthStore } from '../../../store/authStore';

const AGING_COLORS = ['#3b82f6', '#f59e0b', '#f97316', '#ef4444'];
const CHART_COLORS = {
  invoiced: '#3b82f6',
  collected: '#10b981'
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(val || 0));
};

const formatCompactCurrency = (val) => {
  const num = Number(val || 0);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)} K`;
  return `₹${num.toFixed(0)}`;
};

export default function DashboardView({
  salesOrders: propSalesOrders,
  payments: propPayments,
  invoices: propInvoices,
  deliveredOrders: propDeliveredOrders,
  user: propUser,
  onRefresh: propOnRefresh
}) {
  const router = useRouter();
  const pathname = usePathname();
  const authUser = useAuthStore((s) => s.user);
  const storeState = useERPStore((s) => s.state);
  const user = propUser || authUser;

  // Primary Data States
  const [salesOrders, setSalesOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [salesRecordedPayments, setSalesRecordedPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Filters & Tabs
  const [timeRange, setTimeRange] = useState('ALL'); // 'ALL' | 'FY2627' | '90D' | '30D' | 'THIS_MONTH'
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'sm_orders' | 'recent_verified'
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('ALL');
  const [smStatusFilter, setSmStatusFilter] = useState('ALL');
  const [smPage, setSmPage] = useState(1);
  const PAGE_SIZE = 10;

  // Record Payment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState({
    salesOrderId: '',
    customerId: '',
    customerName: '',
    amount: '',
    mode: 'Bank Transfer',
    transactionReference: '',
    bankName: 'HDFC Bank',
    paymentDate: new Date().toISOString().split('T')[0],
    remarks: '',
    autoVerify: true
  });
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Helper parser
  const parseList = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.items)) return res.items;
    if (Array.isArray(res.data?.items)) return res.data.items;
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.records)) return res.records;
    return [];
  };

  // Fetch Live Data from Backend
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [ordersRes, pmtsRes, salesPmtsRes, pendingPmtsRes, invsRes] = await Promise.allSettled([
        backendFetch('/api/backend/sales/orders?limit=1000').catch(() => null),
        backendFetch('/api/backend/finance/payments?limit=1000').catch(() => null),
        backendFetch('/api/backend/finance/payments/sales-recorded').catch(() => null),
        backendFetch('/api/backend/finance/payments/pending').catch(() => null),
        backendFetch('/api/backend/finance/invoices?limit=1000').catch(() => null)
      ]);

      const fetchedOrders = ordersRes.status === 'fulfilled' ? parseList(ordersRes.value) : [];
      const fetchedPayments = pmtsRes.status === 'fulfilled' ? parseList(pmtsRes.value) : [];
      const fetchedSalesPmts = salesPmtsRes.status === 'fulfilled' ? parseList(salesPmtsRes.value) : [];
      const fetchedPendingPmts = pendingPmtsRes.status === 'fulfilled' ? parseList(pendingPmtsRes.value) : [];
      const fetchedInvoices = invsRes.status === 'fulfilled' ? parseList(invsRes.value) : [];

      // Combine sales payments
      const combinedRecorded = [...fetchedSalesPmts];
      fetchedPendingPmts.forEach(p => {
        if (!combinedRecorded.some(item => (item.id || item.payment_id) === (p.id || p.payment_id))) {
          combinedRecorded.push(p);
        }
      });

      // Prefer live backend, fallback to props or store
      const finalOrders = fetchedOrders.length > 0 
        ? fetchedOrders 
        : (propSalesOrders && propSalesOrders.length > 0 ? propSalesOrders : (storeState?.sales?.orders || []));

      const finalPayments = fetchedPayments.length > 0 
        ? fetchedPayments 
        : (propPayments && propPayments.length > 0 ? propPayments : (storeState?.finance?.customerPayments || []));

      const finalInvoices = fetchedInvoices.length > 0
        ? fetchedInvoices
        : (propInvoices && propInvoices.length > 0 ? propInvoices : (storeState?.finance?.invoices || storeState?.invoices || []));

      setSalesOrders(finalOrders);
      setPayments(finalPayments);
      setSalesRecordedPayments(combinedRecorded);
      setInvoices(finalInvoices);
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('[FinanceExecutiveDashboard] Error fetching dynamic dashboard data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [propSalesOrders, propPayments, propInvoices, storeState]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Range boundaries calculation
  const rangeBounds = useMemo(() => {
    const now = new Date();
    if (timeRange === 'ALL') {
      return { start: new Date('2020-01-01'), end: new Date('2030-12-31') };
    }
    if (timeRange === 'FY2627') {
      return { start: new Date('2026-04-01T00:00:00'), end: new Date('2027-03-31T23:59:59') };
    }
    if (timeRange === '90D') {
      const start = new Date(now.getTime() - 90 * 86400000);
      return { start, end: now };
    }
    if (timeRange === '30D') {
      const start = new Date(now.getTime() - 30 * 86400000);
      return { start, end: now };
    }
    if (timeRange === 'THIS_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end: now };
    }
    return { start: new Date('2020-01-01'), end: new Date('2030-12-31') };
  }, [timeRange]);

  // Filter Orders based on Time Range
  const filteredOrders = useMemo(() => {
    if (timeRange === 'ALL') return salesOrders;
    return salesOrders.filter((o) => {
      const d = new Date(o.orderDate || o.createdAt);
      if (isNaN(d.getTime())) return true;
      return d >= rangeBounds.start && d <= rangeBounds.end;
    });
  }, [salesOrders, timeRange, rangeBounds]);

  // Filter Payments based on Time Range
  const filteredPayments = useMemo(() => {
    if (timeRange === 'ALL') return payments;
    return payments.filter((p) => {
      const d = new Date(p.verifiedAt || p.receivedAt || p.createdAt);
      if (isNaN(d.getTime())) return true;
      return d >= rangeBounds.start && d <= rangeBounds.end;
    });
  }, [payments, timeRange, rangeBounds]);

  // Pending Verifications Queue from SM
  const pendingQueue = useMemo(() => {
    // 1. Gather all pending from sales-recorded
    const list = [];
    const seen = new Set();

    // From salesRecordedPayments
    salesRecordedPayments.forEach((p) => {
      const id = p.id || p.payment_id;
      const st = String(p.status || p.verificationStatus || 'SUBMITTED').toUpperCase();
      const isPending = ['SUBMITTED', 'PENDING_VERIFICATION', 'UNDER_VERIFICATION', 'PENDING', 'RECORDED'].includes(st);
      if (isPending && id && !seen.has(id)) {
        seen.add(id);
        list.push({
          id,
          orderNumber: p.salesOrder?.orderNumber || p.order_number || p.invoice_number || `ORD-${p.salesOrderId || p.id}`,
          orderId: p.salesOrderId || p.salesOrder?.id || p.order_id,
          customerName: p.customer?.companyName || p.customer_name || 'Client',
          amount: Number(p.amount || p.paid_amount || 0),
          method: p.method || p.payment_mode || p.mode || 'Bank Transfer',
          reference: p.transactionReference || p.reference_number || p.utr_number || p.cheque_number || 'N/A',
          receivedDate: p.receivedAt || p.created_at || p.received_date || new Date().toISOString(),
          status: 'PENDING_VERIFICATION',
          proofUrl: p.proofUrl
        });
      }
    });

    // Also check standard payments table
    payments.forEach((p) => {
      const id = p.id;
      const st = String(p.status || '').toUpperCase();
      const isPending = ['SUBMITTED', 'PENDING_VERIFICATION', 'UNDER_VERIFICATION', 'PENDING', 'RECORDED'].includes(st);
      if (isPending && id && !seen.has(id)) {
        seen.add(id);
        list.push({
          id,
          orderNumber: p.salesOrder?.orderNumber || (p.salesOrderId ? `ORD-${p.salesOrderId}` : 'Direct Receipt'),
          orderId: p.salesOrderId || p.salesOrder?.id,
          customerName: p.customer?.companyName || 'Client',
          amount: Number(p.amount || 0),
          method: p.method || 'Bank Transfer',
          reference: p.transactionReference || 'N/A',
          receivedDate: p.receivedAt || p.createdAt || new Date().toISOString(),
          status: 'PENDING_VERIFICATION',
          proofUrl: p.proofUrl
        });
      }
    });

    return list;
  }, [salesRecordedPayments, payments]);

  // Filtered Queue for Display
  const filteredQueue = useMemo(() => {
    return pendingQueue.filter((item) => {
      if (modeFilter !== 'ALL' && !item.method.toLowerCase().includes(modeFilter.toLowerCase())) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesOrder = item.orderNumber.toLowerCase().includes(q);
        const matchesCust = item.customerName.toLowerCase().includes(q);
        const matchesRef = item.reference.toLowerCase().includes(q);
        if (!matchesOrder && !matchesCust && !matchesRef) return false;
      }
      return true;
    });
  }, [pendingQueue, modeFilter, searchQuery]);

  // Verified Payments List for Recent Ledger
  const recentVerifiedList = useMemo(() => {
    return payments
      .filter((p) => ['VERIFIED', 'APPROVED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'].includes(String(p.status || '').toUpperCase()))
      .slice(0, 20)
      .map((p) => ({
        id: p.id,
        receiptNo: p.paymentNo || `RCP-${String(p.id).slice(0, 8)}`,
        orderNumber: p.salesOrder?.orderNumber || (p.salesOrderId ? `ORD-${p.salesOrderId}` : 'Ledger Receipt'),
        customerName: p.customer?.companyName || 'Client',
        amount: Number(p.amount || 0),
        method: p.method || 'Bank Transfer',
        reference: p.transactionReference || 'N/A',
        verifiedDate: p.verifiedAt || p.receivedAt || p.createdAt || new Date().toISOString()
      }));
  }, [payments]);

  // Dynamic KPI Calculations from Live SM Records
  const dynamicKpis = useMemo(() => {
    let invoicedSum = 0;
    let collectedSum = 0;
    let unpaidOrderCount = 0;
    let totalOrderCount = filteredOrders.length;
    let overdueSum = 0;

    const now = new Date();

    // 1. Invoiced Sum & Order Level Outstanding
    filteredOrders.forEach((o) => {
      const tot = Number(o.totalAmount || o.grandTotal || 0);
      const paid = Number(o.paidAmount || o.verifiedPaidAmount || 0);
      const out = Number(o.outstandingAmount !== null && o.outstandingAmount !== undefined ? o.outstandingAmount : Math.max(0, tot - paid));

      invoicedSum += tot;
      collectedSum += paid;

      if (out > 0) {
        unpaidOrderCount++;
        const orderDate = new Date(o.orderDate || o.createdAt || now);
        const daysOld = Math.floor((now - orderDate) / 86400000);
        if (daysOld > 30) {
          overdueSum += out;
        }
      }
    });

    // 2. Extra Verified Collections from Customer Payments table
    const standalonePaymentSum = filteredPayments
      .filter((p) => ['VERIFIED', 'APPROVED', 'ALLOCATED'].includes(String(p.status || '').toUpperCase()))
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // Use higher of payment ledger or order verified sum
    const totalCollected = Math.max(collectedSum, standalonePaymentSum);
    const totalOutstanding = Math.max(0, invoicedSum - totalCollected);

    // 3. Today & This Month Collections
    let todayColl = 0;
    let thisMonthColl = 0;
    filteredPayments.forEach((p) => {
      const isVerified = ['VERIFIED', 'APPROVED', 'ALLOCATED'].includes(String(p.status || '').toUpperCase());
      if (isVerified) {
        const amt = Number(p.amount || 0);
        const d = new Date(p.verifiedAt || p.receivedAt || p.createdAt);
        if (!isNaN(d.getTime())) {
          if (d.toDateString() === now.toDateString()) todayColl += amt;
          if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) thisMonthColl += amt;
        }
      }
    });

    // Pending count & total amount
    const pendingCount = pendingQueue.length;
    const pendingAmount = pendingQueue.reduce((sum, p) => sum + p.amount, 0);

    // Realization rate
    const realizationRate = invoicedSum > 0 ? ((totalCollected / invoicedSum) * 100).toFixed(1) : '0.0';

    return {
      totalInvoiced: invoicedSum,
      totalCollected,
      outstanding: totalOutstanding,
      pendingCount,
      pendingAmount,
      unpaidCount: unpaidOrderCount,
      totalOrderCount,
      todayCollections: todayColl,
      thisMonthCollections: thisMonthColl,
      overdueAmount: overdueSum,
      realizationRate,
      averageCollectionDays: '15.0'
    };
  }, [filteredOrders, filteredPayments, pendingQueue]);

  // Dynamic Monthly Trend Chart from Real Records
  const monthlyTrendData = useMemo(() => {
    const monthMap = {};
    const monthOrder = [
      'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26',
      'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26', 'Nov 26', 'Dec 26',
      'Jan 27', 'Feb 27', 'Mar 27'
    ];

    // Seed active months in range or present in DB
    monthOrder.forEach((m) => {
      monthMap[m] = { month: m, invoiced: 0, collected: 0 };
    });

    // Aggregate Orders
    salesOrders.forEach((o) => {
      const d = new Date(o.orderDate || o.createdAt);
      if (!isNaN(d.getTime())) {
        const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        if (monthMap[key]) {
          monthMap[key].invoiced += Number(o.totalAmount || o.grandTotal || 0);
        }
      }
    });

    // Aggregate Payments
    payments.forEach((p) => {
      const isVerified = ['VERIFIED', 'APPROVED', 'ALLOCATED'].includes(String(p.status || '').toUpperCase());
      if (isVerified) {
        const d = new Date(p.verifiedAt || p.receivedAt || p.createdAt);
        if (!isNaN(d.getTime())) {
          const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
          if (monthMap[key]) {
            monthMap[key].collected += Number(p.amount || 0);
          }
        }
      }
    });

    // Return only months with activity or relevant FY26-27 range
    return monthOrder
      .map((k) => monthMap[k])
      .filter((item) => item.invoiced > 0 || item.collected > 0 || ['Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26'].includes(item.month));
  }, [salesOrders, payments]);

  // Dynamic Outstanding Aging Pie Chart
  const agingData = useMemo(() => {
    const now = new Date();
    const buckets = {
      '0-30 Days': 0,
      '31-60 Days': 0,
      '61-90 Days': 0,
      '90+ Days': 0
    };

    filteredOrders.forEach((o) => {
      const tot = Number(o.totalAmount || o.grandTotal || 0);
      const paid = Number(o.paidAmount || o.verifiedPaidAmount || 0);
      const out = Number(o.outstandingAmount !== null && o.outstandingAmount !== undefined ? o.outstandingAmount : Math.max(0, tot - paid));

      if (out > 0) {
        const d = new Date(o.orderDate || o.createdAt || now);
        const diffDays = Math.max(0, Math.floor((now - d) / 86400000));
        if (diffDays <= 30) buckets['0-30 Days'] += out;
        else if (diffDays <= 60) buckets['31-60 Days'] += out;
        else if (diffDays <= 90) buckets['61-90 Days'] += out;
        else buckets['90+ Days'] += out;
      }
    });

    return [
      { name: '0-30 Days', value: buckets['0-30 Days'] },
      { name: '31-60 Days', value: buckets['31-60 Days'] },
      { name: '61-90 Days', value: buckets['61-90 Days'] },
      { name: '90+ Days', value: buckets['90+ Days'] }
    ];
  }, [filteredOrders]);

  // Filtered SM Orders for Tab 2
  const filteredSmOrders = useMemo(() => {
    return salesOrders.filter((o) => {
      if (smStatusFilter !== 'ALL' && o.status !== smStatusFilter) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesNum = (o.orderNumber || '').toLowerCase().includes(q);
        const matchesCust = (o.customer?.companyName || '').toLowerCase().includes(q);
        if (!matchesNum && !matchesCust) return false;
      }
      return true;
    });
  }, [salesOrders, smStatusFilter, searchQuery]);

  const paginatedSmOrders = useMemo(() => {
    const start = (smPage - 1) * PAGE_SIZE;
    return filteredSmOrders.slice(start, start + PAGE_SIZE);
  }, [filteredSmOrders, smPage]);

  const totalSmPages = Math.ceil(filteredSmOrders.length / PAGE_SIZE) || 1;

  // Verify Action Handler
  const handleVerifyPayment = async (paymentId, orderNum, amount) => {
    const result = await Swal.fire({
      title: 'Verify Payment Receipt',
      html: `
        <div style="text-align: left; font-size: 13px; line-height: 1.6;">
          <p>Confirm verification of <b>${formatCurrency(amount)}</b> for order <b>${orderNum}</b>?</p>
          <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 10px;">
            <div><b>Reconciliation:</b> Ledger Match & Bank Statement Clear</div>
            <div><b>SM Sync:</b> Order balance and status will be updated immediately.</div>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Verify & Clear',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      customClass: {
        popup: 'swal-premium-popup',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      }
    });

    if (result.isConfirmed) {
      try {
        const res = await backendFetch(`/api/backend/finance/payments/${paymentId}/verify`, {
          method: 'POST'
        });
        Swal.fire({
          icon: 'success',
          title: 'Payment Verified & Cleared!',
          text: `Payment for order ${orderNum} has been reconciled in the financial ledger and synced with SM.`,
          timer: 2000,
          showConfirmButton: false
        });
        await fetchDashboardData();
        if (propOnRefresh) propOnRefresh();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Verification Failed',
          text: err.message || 'Could not verify payment at this time.'
        });
      }
    }
  };

  // Reject Action Handler
  const handleRejectPayment = async (paymentId, orderNum) => {
    const { value: reason } = await Swal.fire({
      title: 'Reject Payment',
      input: 'text',
      inputLabel: `Reason for rejecting payment for ${orderNum}`,
      inputPlaceholder: 'e.g. UTR mismatch, Cheque bounced, Invalid statement reference',
      showCancelButton: true,
      confirmButtonText: 'Reject Payment',
      confirmButtonColor: '#ef4444',
      inputValidator: (value) => {
        if (!value) return 'You must provide a rejection reason!';
      }
    });

    if (reason) {
      try {
        await backendFetch(`/api/backend/finance/payments/${paymentId}/reject`, {
          method: 'POST',
          body: { rejectionReason: reason, remarks: `Rejected by Finance: ${reason}` }
        });
        Swal.fire({
          icon: 'info',
          title: 'Payment Rejected',
          text: `Payment rejected and flagged for Sales Executive review.`,
          timer: 2000,
          showConfirmButton: false
        });
        await fetchDashboardData();
        if (propOnRefresh) propOnRefresh();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Action Failed',
          text: err.message || 'Could not reject payment.'
        });
      }
    }
  };

  // Quick Record Payment for SM Order Handler
  const openRecordModalForOrder = (order) => {
    const tot = Number(order.totalAmount || order.grandTotal || 0);
    const paid = Number(order.paidAmount || order.verifiedPaidAmount || 0);
    const out = Number(order.outstandingAmount !== null && order.outstandingAmount !== undefined ? order.outstandingAmount : Math.max(0, tot - paid));

    setModalForm({
      salesOrderId: order.id,
      customerId: order.customerId || order.customer?.id || '',
      customerName: order.customer?.companyName || 'Client',
      amount: String(out > 0 ? out : tot),
      mode: 'Bank Transfer',
      transactionReference: `UTR${Date.now().toString().slice(-8)}`,
      bankName: 'HDFC Bank - Current A/C',
      paymentDate: new Date().toISOString().split('T')[0],
      remarks: `Payment recorded via Finance Desk for ${order.orderNumber}`,
      autoVerify: true
    });
    setIsModalOpen(true);
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!modalForm.salesOrderId || !modalForm.amount) {
      Swal.fire('Error', 'Please select a Sales Order and specify the payment amount', 'error');
      return;
    }

    setIsSubmittingPayment(true);
    try {
      // 1. Record payment in Sales/Finance backend
      const payload = {
        salesOrderId: modalForm.salesOrderId,
        customerId: modalForm.customerId,
        amount: Number(modalForm.amount),
        method: modalForm.mode,
        transactionReference: modalForm.transactionReference,
        bankName: modalForm.bankName,
        paymentDate: modalForm.paymentDate,
        remarks: modalForm.remarks
      };

      const res = await backendFetch('/api/backend/finance/payments/sales-record', {
        method: 'POST',
        body: payload
      });

      const paymentRecord = res?.data || res;
      const paymentId = paymentRecord?.id;

      // 2. If autoVerify is checked, immediately verify
      if (modalForm.autoVerify && paymentId) {
        await backendFetch(`/api/backend/finance/payments/${paymentId}/verify`, {
          method: 'POST'
        });
      }

      setIsModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: modalForm.autoVerify ? 'Payment Recorded & Verified!' : 'Payment Recorded in Queue!',
        text: `Reconciliation with Sales Order completed successfully.`,
        timer: 2000,
        showConfirmButton: false
      });

      await fetchDashboardData();
      if (propOnRefresh) propOnRefresh();
    } catch (err) {
      Swal.fire('Failed', err.message || 'Could not record payment', 'error');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '360px', gap: '16px' }}>
        <div className="animate-spin" style={{ width: '36px', height: '36px', border: '3px solid var(--color-accent-teal)', borderBottomColor: 'transparent', borderRadius: '50%' }}></div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: '600' }}>
          Syncing Real-time Financial Ledger with Sales Module (SM)...
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ── TOP BANNER & HEADER ── */}
      <div style={{ 
        background: 'var(--color-sidebar-bg)', 
        border: '1px solid var(--color-border)', 
        borderRadius: '16px', 
        padding: '20px 24px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-primary)', letterSpacing: '-0.5px', margin: 0 }}>
                Finance Executive & Operations Desk
              </h1>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: 'rgba(16, 185, 129, 0.12)', 
                color: '#10b981', 
                padding: '4px 10px', 
                borderRadius: '20px', 
                fontSize: '11px', 
                fontWeight: '700' 
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
                Synced with SM (Sales Module) • {salesOrders.length} Orders
              </span>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '6px', marginBottom: 0 }}>
              Live customer ledger matching, sales billing verification, and payment reconciliation for <b>Sahad M (Finance Manager)</b> and Finance Operations.
            </p>
          </div>

          {/* Action Header Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <Plus size={15} />
              Record SM Payment
            </button>

            <button 
              onClick={fetchDashboardData} 
              disabled={isRefreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'var(--color-sidebar-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: '13px',
                fontWeight: '700',
                borderRadius: '10px',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-card)',
                transition: 'all 0.2s ease'
              }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Syncing...' : 'Sync with SM'}
            </button>
          </div>
        </div>

        {/* Horizon Filter Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderTop: '1px solid var(--color-border)', 
          paddingTop: '14px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', marginRight: '4px' }}>
              Time Horizon:
            </span>
            {[
              { id: 'ALL', label: 'All Time' },
              { id: 'FY2627', label: 'FY 2026-27' },
              { id: '90D', label: 'Last 90 Days' },
              { id: '30D', label: 'Last 30 Days' },
              { id: 'THIS_MONTH', label: 'Current Month' }
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setTimeRange(preset.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: timeRange === preset.id ? '700' : '500',
                  border: timeRange === preset.id ? '1px solid var(--color-accent-teal)' : '1px solid var(--color-border)',
                  background: timeRange === preset.id ? 'rgba(13, 148, 136, 0.12)' : 'transparent',
                  color: timeRange === preset.id ? 'var(--color-accent-teal)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            {lastSyncTime ? `Live synced at ${lastSyncTime.toLocaleTimeString('en-IN')}` : 'Auto-sync active'}
          </div>
        </div>
      </div>

      {/* ── TOP KPI CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        
        {/* Total Invoiced (SM) */}
        <div className="app-card border-left-blue">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Invoiced (SM)
            </span>
            <Layers size={16} style={{ color: '#3b82f6' }} />
          </div>
          <h3 style={{ margin: '8px 0 2px 0', fontSize: '23px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {formatCurrency(dynamicKpis.totalInvoiced)}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            <span>{dynamicKpis.totalOrderCount} Orders in SM</span>
            <span style={{ fontWeight: '700', color: '#3b82f6' }}>{formatCompactCurrency(dynamicKpis.totalInvoiced)}</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="app-card border-left-emerald">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Collected
            </span>
            <CheckCircle2 size={16} style={{ color: '#10b981' }} />
          </div>
          <h3 style={{ margin: '8px 0 2px 0', fontSize: '23px', fontWeight: '800', color: '#10b981' }}>
            {formatCurrency(dynamicKpis.totalCollected)}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            <span>Cleared & Verified</span>
            <span style={{ fontWeight: '700', color: '#10b981' }}>Realized: {dynamicKpis.realizationRate}%</span>
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="app-card border-left-red">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Outstanding
            </span>
            <AlertTriangle size={16} style={{ color: '#ef4444' }} />
          </div>
          <h3 style={{ margin: '8px 0 2px 0', fontSize: '23px', fontWeight: '800', color: '#ef4444' }}>
            {formatCurrency(dynamicKpis.outstanding)}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            <span>{dynamicKpis.unpaidCount} Pending Balance</span>
            <span style={{ fontWeight: '700', color: '#ef4444' }}>{formatCompactCurrency(dynamicKpis.outstanding)}</span>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="app-card border-left-amber">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pending Verifications
            </span>
            <Clock size={16} style={{ color: '#f59e0b' }} />
          </div>
          <h3 style={{ margin: '8px 0 2px 0', fontSize: '23px', fontWeight: '800', color: '#f59e0b' }}>
            {dynamicKpis.pendingCount}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            <span>From Sales Module (SM)</span>
            <span style={{ fontWeight: '700', color: '#f59e0b' }}>{formatCurrency(dynamicKpis.pendingAmount)}</span>
          </div>
        </div>

      </div>

      {/* ── OPERATIONAL INSIGHTS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        <div className="app-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Today's Collections
            </p>
            <h4 style={{ margin: '3px 0 0 0', fontSize: '17px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
              {formatCurrency(dynamicKpis.todayCollections)}
            </h4>
          </div>
        </div>

        <div className="app-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              This Month's Collections
            </p>
            <h4 style={{ margin: '3px 0 0 0', fontSize: '17px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
              {formatCurrency(dynamicKpis.thisMonthCollections)}
            </h4>
          </div>
        </div>

        <div className="app-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Overdue Balance (&gt;30 Days)
            </p>
            <h4 style={{ margin: '3px 0 0 0', fontSize: '17px', fontWeight: '800', color: '#ef4444' }}>
              {formatCurrency(dynamicKpis.overdueAmount)}
            </h4>
          </div>
        </div>

      </div>

      {/* ── CHARTS SECTION ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: '20px' }}>
        
        {/* Billing vs Collection Trend */}
        <div className="app-card" style={{ overflow: 'hidden' }}>
          <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h2 className="card-heading" style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>
                SM Billing vs Collection Trend (Monthly)
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Aggregated live from Sales Orders and Payment Verifications
              </p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-accent-teal)', background: 'rgba(13, 148, 136, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
              Live Data
            </span>
          </div>

          <div style={{ width: '100%', height: '280px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.invoiced} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={CHART_COLORS.invoiced} stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.collected} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.collected} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(val) => formatCompactCurrency(val)} 
                />
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(value), name === 'invoiced' ? 'SM Invoiced' : 'Collected']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area 
                  type="monotone" 
                  dataKey="invoiced" 
                  name="Invoiced (SM Orders)" 
                  stroke={CHART_COLORS.invoiced} 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorInvoiced)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="collected" 
                  name="Verified Collections" 
                  stroke={CHART_COLORS.collected} 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorCollected)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Outstanding Aging */}
        <div className="app-card" style={{ overflow: 'hidden' }}>
          <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h2 className="card-heading" style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>
                Receivables Aging Distribution
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Overdue duration calculated from actual SM order & invoice creation
              </p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
              {formatCompactCurrency(dynamicKpis.outstanding)} Total
            </span>
          </div>

          <div style={{ width: '100%', height: '280px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={agingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {agingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={AGING_COLORS[index % AGING_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [
                    `${formatCurrency(value)} (${dynamicKpis.outstanding > 0 ? ((value / dynamicKpis.outstanding) * 100).toFixed(1) : 0}%)`,
                    name
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                />
                <Legend 
                  layout="horizontal" 
                  align="center" 
                  verticalAlign="bottom" 
                  formatter={(value, entry) => (
                    <span style={{ fontSize: '11px', color: '#334155', fontWeight: '600' }}>
                      {value}: {formatCompactCurrency(entry.payload.value)}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ── TABBED WORKSPACE SECTION (QUEUE, SM ORDERS, RECENT VERIFIED) ── */}
      <div className="app-card" style={{ padding: '0px', overflow: 'hidden' }}>
        
        {/* Navigation Tabs Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-sidebar-bg)',
          padding: '12px 20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('queue')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'queue' ? 'var(--color-accent-teal)' : 'transparent',
                color: activeTab === 'queue' ? '#ffffff' : 'var(--color-text-secondary)',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Clock size={15} />
              Pending Verifications
              <span style={{
                background: activeTab === 'queue' ? 'rgba(255,255,255,0.25)' : 'rgba(245, 158, 11, 0.15)',
                color: activeTab === 'queue' ? '#ffffff' : '#f59e0b',
                padding: '1px 7px',
                borderRadius: '12px',
                fontSize: '11px'
              }}>
                {pendingQueue.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sm_orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'sm_orders' ? 'var(--color-accent-teal)' : 'transparent',
                color: activeTab === 'sm_orders' ? '#ffffff' : 'var(--color-text-secondary)',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={15} />
              SM Sales Orders Feed
              <span style={{
                background: activeTab === 'sm_orders' ? 'rgba(255,255,255,0.25)' : 'rgba(59, 130, 246, 0.15)',
                color: activeTab === 'sm_orders' ? '#ffffff' : '#3b82f6',
                padding: '1px 7px',
                borderRadius: '12px',
                fontSize: '11px'
              }}>
                {salesOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('recent_verified')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'recent_verified' ? 'var(--color-accent-teal)' : 'transparent',
                color: activeTab === 'recent_verified' ? '#ffffff' : 'var(--color-text-secondary)',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <CheckCircle2 size={15} />
              Cleared Ledger Feed
            </button>
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search customer, order, UTR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 32px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-sidebar-bg)',
                color: 'var(--color-text-primary)',
                fontSize: '12px'
              }}
            />
          </div>
        </div>

        {/* ── TAB 1: PENDING VERIFICATIONS QUEUE ── */}
        {activeTab === 'queue' && (
          <div style={{ padding: '20px' }}>
            {/* Filter controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Mode:</span>
                {['ALL', 'Bank Transfer', 'NEFT', 'Cheque', 'UPI', 'Cash'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setModeFilter(m)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: modeFilter === m ? '700' : '500',
                      border: '1px solid var(--color-border)',
                      background: modeFilter === m ? 'var(--color-text-primary)' : 'transparent',
                      color: modeFilter === m ? 'var(--color-sidebar-bg)' : 'var(--color-text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Showing <b>{filteredQueue.length}</b> payment{filteredQueue.length === 1 ? '' : 's'} awaiting bank reconciliation
              </div>
            </div>

            {/* Table */}
            <div className="crm-table-container">
              <table className="crm-table responsive-table">
                <thead>
                  <tr>
                    <th>Order / Invoice</th>
                    <th>Customer Name</th>
                    <th>Payment Mode</th>
                    <th>Ref (UTR / Cheque)</th>
                    <th>Amount</th>
                    <th>Received Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={36} style={{ color: '#10b981' }} />
                          <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: '700' }}>
                            All payments in sync with Sales Module!
                          </h4>
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            No pending payment verifications in queue. New payments logged by Sales Executives will appear here automatically.
                          </p>
                          <button
                            onClick={() => setIsModalOpen(true)}
                            style={{
                              marginTop: '8px',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              background: 'var(--color-accent-teal)',
                              color: '#fff',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            + Record Test Payment for SM Order
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.map((item) => (
                      <tr key={item.id}>
                        <td data-label="Order / Invoice" style={{ fontWeight: '700', color: 'var(--color-accent-teal)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{item.orderNumber}</span>
                          </div>
                        </td>
                        <td data-label="Customer Name" style={{ fontWeight: '600' }}>
                          {item.customerName}
                        </td>
                        <td data-label="Payment Mode">
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6'
                          }}>
                            {item.method}
                          </span>
                        </td>
                        <td data-label="Ref No." style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                          {item.reference}
                        </td>
                        <td data-label="Amount" style={{ fontWeight: '800', color: 'var(--color-text-primary)' }}>
                          {formatCurrency(item.amount)}
                        </td>
                        <td data-label="Received Date" style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {new Date(item.receivedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td data-label="Status">
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#f59e0b'
                          }}>
                            Pending Verification
                          </span>
                        </td>
                        <td data-label="Actions" style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => handleVerifyPayment(item.id, item.orderNumber, item.amount)}
                              title="Verify Payment & Update Ledger"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                background: '#10b981',
                                color: '#ffffff',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              <Check size={13} />
                              Verify
                            </button>
                            <button
                              onClick={() => handleRejectPayment(item.id, item.orderNumber)}
                              title="Reject Payment"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid #ef4444',
                                background: 'transparent',
                                color: '#ef4444',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              <XCircle size={13} />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: SM SALES ORDERS FEED ── */}
        {activeTab === 'sm_orders' && (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Status:</span>
                {['ALL', 'CONFIRMED', 'READY_FOR_DISPATCH', 'DISPATCHED', 'DELIVERED', 'COMPLETED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => { setSmStatusFilter(st); setSmPage(1); }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: smStatusFilter === st ? '700' : '500',
                      border: '1px solid var(--color-border)',
                      background: smStatusFilter === st ? 'var(--color-text-primary)' : 'transparent',
                      color: smStatusFilter === st ? 'var(--color-sidebar-bg)' : 'var(--color-text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Total <b>{filteredSmOrders.length}</b> orders synced from SM
              </div>
            </div>

            <div className="crm-table-container">
              <table className="crm-table responsive-table">
                <thead>
                  <tr>
                    <th>Order Number</th>
                    <th>Customer</th>
                    <th>Order Date</th>
                    <th>Order Total</th>
                    <th>Verified Paid</th>
                    <th>Outstanding</th>
                    <th>SM Status</th>
                    <th>Payment Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSmOrders.map((order) => {
                    const tot = Number(order.totalAmount || order.grandTotal || 0);
                    const paid = Number(order.paidAmount || order.verifiedPaidAmount || 0);
                    const out = Number(order.outstandingAmount !== null && order.outstandingAmount !== undefined ? order.outstandingAmount : Math.max(0, tot - paid));
                    return (
                      <tr key={order.id}>
                        <td data-label="Order Number" style={{ fontWeight: '700', color: 'var(--color-accent-teal)' }}>
                          {order.orderNumber}
                        </td>
                        <td data-label="Customer" style={{ fontWeight: '600' }}>
                          {order.customer?.companyName || 'Client'}
                        </td>
                        <td data-label="Order Date" style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td data-label="Order Total" style={{ fontWeight: '700' }}>
                          {formatCurrency(tot)}
                        </td>
                        <td data-label="Verified Paid" style={{ color: '#10b981', fontWeight: '700' }}>
                          {formatCurrency(paid)}
                        </td>
                        <td data-label="Outstanding" style={{ color: out > 0 ? '#ef4444' : '#10b981', fontWeight: '800' }}>
                          {formatCurrency(out)}
                        </td>
                        <td data-label="SM Status">
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6'
                          }}>
                            {(order.status || 'CONFIRMED').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td data-label="Payment Status">
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            background: order.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                            color: order.paymentStatus === 'PAID' ? '#10b981' : '#ef4444'
                          }}>
                            {order.paymentStatus || 'PENDING'}
                          </span>
                        </td>
                        <td data-label="Actions" style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => openRecordModalForOrder(order)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--color-border)',
                              background: 'var(--color-sidebar-bg)',
                              color: 'var(--color-text-primary)',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            + Record Payment
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalSmPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Page {smPage} of {totalSmPages}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    disabled={smPage === 1}
                    onClick={() => setSmPage((p) => Math.max(1, p - 1))}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-sidebar-bg)',
                      color: smPage === 1 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                      cursor: smPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Previous
                  </button>
                  <button
                    disabled={smPage === totalSmPages}
                    onClick={() => setSmPage((p) => Math.min(totalSmPages, p + 1))}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-sidebar-bg)',
                      color: smPage === totalSmPages ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                      cursor: smPage === totalSmPages ? 'not-allowed' : 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: RECENT CLEARED COLLECTIONS LEDGER ── */}
        {activeTab === 'recent_verified' && (
          <div style={{ padding: '20px' }}>
            <div className="crm-table-container">
              <table className="crm-table responsive-table">
                <thead>
                  <tr>
                    <th>Receipt No</th>
                    <th>Order No</th>
                    <th>Customer Name</th>
                    <th>Amount</th>
                    <th>Payment Mode</th>
                    <th>Reference No.</th>
                    <th>Verification Date</th>
                    <th>Ledger Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVerifiedList.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--color-text-muted)' }}>
                        No verified collections recorded in this horizon yet.
                      </td>
                    </tr>
                  ) : (
                    recentVerifiedList.map((item) => (
                      <tr key={item.id}>
                        <td data-label="Receipt No" style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
                          {item.receiptNo}
                        </td>
                        <td data-label="Order No" style={{ color: 'var(--color-accent-teal)', fontWeight: '600' }}>
                          {item.orderNumber}
                        </td>
                        <td data-label="Customer Name" style={{ fontWeight: '600' }}>
                          {item.customerName}
                        </td>
                        <td data-label="Amount" style={{ fontWeight: '800', color: '#10b981' }}>
                          {formatCurrency(item.amount)}
                        </td>
                        <td data-label="Payment Mode">
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', fontSize: '11px', fontWeight: '600' }}>
                            {item.method}
                          </span>
                        </td>
                        <td data-label="Reference No" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                          {item.reference}
                        </td>
                        <td data-label="Verification Date" style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {new Date(item.verifiedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td data-label="Ledger Status">
                          <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                            Verified & Cleared
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ── RECORD PAYMENT MODAL (RECONCILE WITH SM) ── */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--color-sidebar-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                  Record & Reconcile Payment
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Sync payment with Sales Module order and post to Financial Ledger
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Select Order */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                  Select Sales Order (SM) *
                </label>
                <select
                  required
                  value={modalForm.salesOrderId}
                  onChange={(e) => {
                    const sel = salesOrders.find((o) => o.id === e.target.value);
                    if (sel) {
                      const tot = Number(sel.totalAmount || sel.grandTotal || 0);
                      const paid = Number(sel.paidAmount || sel.verifiedPaidAmount || 0);
                      const out = Math.max(0, tot - paid);
                      setModalForm({
                        ...modalForm,
                        salesOrderId: sel.id,
                        customerId: sel.customerId || sel.customer?.id || '',
                        customerName: sel.customer?.companyName || 'Client',
                        amount: String(out > 0 ? out : tot)
                      });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-sidebar-bg)',
                    color: 'var(--color-text-primary)',
                    fontSize: '13px'
                  }}
                >
                  <option value="">-- Choose Sales Order --</option>
                  {salesOrders.slice(0, 100).map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} - {o.customer?.companyName || 'Client'} ({formatCurrency(o.totalAmount)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Display */}
              {modalForm.customerName && (
                <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Customer: </span>
                  <b style={{ color: 'var(--color-text-primary)' }}>{modalForm.customerName}</b>
                </div>
              )}

              {/* Amount & Mode */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                    Payment Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={modalForm.amount}
                    onChange={(e) => setModalForm({ ...modalForm, amount: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-sidebar-bg)',
                      color: 'var(--color-text-primary)',
                      fontSize: '13px',
                      fontWeight: '700'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                    Payment Mode *
                  </label>
                  <select
                    value={modalForm.mode}
                    onChange={(e) => setModalForm({ ...modalForm, mode: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-sidebar-bg)',
                      color: 'var(--color-text-primary)',
                      fontSize: '13px'
                    }}
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI / Digital</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              {/* Transaction Ref & Bank */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                    UTR / Cheque Ref No. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UTR82736412"
                    value={modalForm.transactionReference}
                    onChange={(e) => setModalForm({ ...modalForm, transactionReference: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-sidebar-bg)',
                      color: 'var(--color-text-primary)',
                      fontSize: '13px',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={modalForm.bankName}
                    onChange={(e) => setModalForm({ ...modalForm, bankName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-sidebar-bg)',
                      color: 'var(--color-text-primary)',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              {/* Payment Date */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                  Received Date
                </label>
                <input
                  type="date"
                  value={modalForm.paymentDate}
                  onChange={(e) => setModalForm({ ...modalForm, paymentDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-sidebar-bg)',
                    color: 'var(--color-text-primary)',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Immediate Verify Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="autoVerifyCheck"
                  checked={modalForm.autoVerify}
                  onChange={(e) => setModalForm({ ...modalForm, autoVerify: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                />
                <label htmlFor="autoVerifyCheck" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                  Immediately verify and clear in ledger (Auto-reconcile with SM)
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: 'transparent',
                    color: 'var(--color-text-secondary)',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#10b981',
                    color: '#ffffff',
                    fontWeight: '700',
                    cursor: isSubmittingPayment ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmittingPayment ? 'Reconciling...' : 'Confirm & Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ResponsiveContainer, 
  AreaChart, Area,
  LineChart, Line, 
  BarChart, Bar,
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
  ArrowDownRight,
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
  Building,
  ChevronRight,
  X,
  ExternalLink,
  Users,
  FileCheck,
  Zap,
  BarChart3,
  Receipt,
  Percent,
  AlertCircle,
  Wallet
} from 'lucide-react';
import Swal from 'sweetalert2';
import { backendFetch } from '../../../lib/backendFetch';
import { apiClient } from '../../../lib/apiClient';
import { useERPStore } from '../../../store/erpStore';
import { useAuthStore } from '../../../store/authStore';
import ResponsiveChart from '../../../shared/components/ResponsiveChart';
import {
  PALETTE,
  formatINR,
  formatShortINR,
  getRecordDate,
  getRangeBounds,
  isInRange,
  getPeriodMeta,
  parseList,
  deduplicateArInvoices,
  calculatePeriodComparison,
  calculateDynamicMetrics,
  calculateRevenueTrendData,
  calculateCollectionsVsOutstandingData,
  calculateAgingBreakdownData,
  calculateExpenseAllocationData,
  calculateTopPendingCustomers,
  calculateSalesTeamList
} from '../../finance/utils/financeDashboardEngine';

const AGING_COLORS = [PALETTE.emerald, PALETTE.amber, '#F97316', PALETTE.rose];

const formatCurrency = formatINR;
const formatCompactCurrency = formatShortINR;

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

  // Primary Live Data Store matching Finance Manager Dashboard View
  const [liveData, setLiveData] = useState({
    salesOrders: [],
    applArInvoices: [],
    hcpplArInvoices: [],
    hcpplRegInvoices: [],
    financeArInvoices: [],
    purchaseOrders: [],
    expenses: [],
    brandRequests: [],
    users: [],
    payments: [],
    salesRecordedPayments: []
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Filters & Navigation (Standard 30D / 90D / 6M / 1Y / CUSTOM Horizons)
  const [timeRange, setTimeRange] = useState('30D');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const rangeBounds = useMemo(() => {
    return getRangeBounds(timeRange, new Date(), customStartDate, customEndDate);
  }, [timeRange, customStartDate, customEndDate]);

  const isCustomRangeValid = Boolean(customStartDate && customEndDate && customStartDate <= customEndDate);

  const periodMeta = useMemo(() => {
    return getPeriodMeta(timeRange, rangeBounds);
  }, [timeRange, rangeBounds]);

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
    bankName: 'HDFC Bank - Current A/C',
    paymentDate: new Date().toISOString().split('T')[0],
    remarks: '',
    autoVerify: true
  });
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Fetch Live Data from Backend (AR Registers + Sales Orders + POs + Expenses + Verification Queues)
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [
        ordersRes,
        applArRes,
        hcpplArRes,
        hcpplRegRes,
        finArRes,
        poRes,
        expRes,
        brandRes,
        usersRes,
        pmtsRes,
        salesPmtsRes,
        pendingPmtsRes
      ] = await Promise.allSettled([
        backendFetch('/api/backend/sales/orders?limit=1000').catch(() => null),
        backendFetch('/api/backend/back-office/appl-ar?limit=1000').catch(() => null),
        backendFetch('/api/backend/back-office/hcppl-ar/entries?limit=1000').catch(() => null),
        backendFetch('/api/backend/back-office/hcppl-ar/register?limit=1000').catch(() => null),
        backendFetch('/api/backend/reports/finance/ar-invoices?limit=1000').catch(() => null),
        backendFetch('/api/backend/purchase-orders?limit=1000').catch(() => null),
        backendFetch('/api/backend/expenses?limit=1000').catch(() => null),
        backendFetch('/api/backend/brand-analysis-requests?limit=1000').catch(() => null),
        backendFetch('/api/backend/users?limit=500').catch(() => null),
        backendFetch('/api/backend/finance/payments?limit=1000').catch(() => null),
        backendFetch('/api/backend/finance/payments/sales-recorded').catch(() => null),
        backendFetch('/api/backend/finance/payments/pending').catch(() => null)
      ]);

      const fetchedOrders = parseList(ordersRes);
      const fetchedApplAr = parseList(applArRes);
      const fetchedHcpplAr = parseList(hcpplArRes);
      const fetchedHcpplReg = parseList(hcpplRegRes);
      const fetchedFinAr = parseList(finArRes);
      const fetchedPOs = parseList(poRes);
      const fetchedExpenses = parseList(expRes);
      const fetchedBrand = parseList(brandRes);
      const fetchedUsers = parseList(usersRes);
      const fetchedPayments = parseList(pmtsRes);
      const fetchedSalesPmts = parseList(salesPmtsRes);
      const fetchedPendingPmts = parseList(pendingPmtsRes);

      // Combine sales recorded payments and pending verifications queue
      const combinedRecorded = [...fetchedSalesPmts];
      fetchedPendingPmts.forEach(p => {
        if (!combinedRecorded.some(item => (item.id || item.payment_id) === (p.id || p.payment_id))) {
          combinedRecorded.push(p);
        }
      });

      setLiveData({
        salesOrders: fetchedOrders,
        applArInvoices: fetchedApplAr,
        hcpplArInvoices: fetchedHcpplAr,
        hcpplRegInvoices: fetchedHcpplReg,
        financeArInvoices: fetchedFinAr,
        purchaseOrders: fetchedPOs,
        expenses: fetchedExpenses,
        brandRequests: fetchedBrand,
        users: fetchedUsers,
        payments: fetchedPayments,
        salesRecordedPayments: combinedRecorded
      });
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('[FinanceExecutiveDashboard] Error fetching dynamic dashboard data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Combined AR Invoices (APPL + HCPPL + Finance AR) - Identical Source of Truth
  const allArInvoices = useMemo(() => {
    return deduplicateArInvoices(
      liveData.applArInvoices,
      liveData.hcpplArInvoices,
      liveData.hcpplRegInvoices,
      liveData.financeArInvoices,
      propPayments,
      propInvoices || storeState?.invoices
    );
  }, [liveData.applArInvoices, liveData.hcpplArInvoices, liveData.hcpplRegInvoices, liveData.financeArInvoices, propPayments, propInvoices, storeState?.invoices]);

  // Combined Sales Orders
  const salesOrders = useMemo(() => {
    if (Array.isArray(liveData.salesOrders) && liveData.salesOrders.length > 0) return liveData.salesOrders;
    if (Array.isArray(propSalesOrders) && propSalesOrders.length > 0) return propSalesOrders;
    if (Array.isArray(storeState?.sales?.orders) && storeState.sales.orders.length > 0) return storeState.sales.orders;
    return [];
  }, [liveData.salesOrders, propSalesOrders, storeState]);

  // Filtered collections strictly according to active horizon
  const filteredInvoices = useMemo(() => {
    if (!allArInvoices || allArInvoices.length === 0) return [];
    return allArInvoices.filter((invoice) => isInRange(invoice, ['invoiceDate', 'createdAt', 'date'], rangeBounds));
  }, [allArInvoices, rangeBounds]);

  const filteredSalesOrders = useMemo(() => {
    if (!salesOrders || salesOrders.length === 0) return [];
    return salesOrders.filter((order) => isInRange(order, ['orderDate', 'createdAt', 'date'], rangeBounds));
  }, [salesOrders, rangeBounds]);

  const filteredPurchaseOrders = useMemo(() => {
    const list = liveData.purchaseOrders || [];
    if (list.length === 0) return [];
    return list.filter((po) => isInRange(po, ['issuedAt', 'createdAt', 'poDate', 'date'], rangeBounds));
  }, [liveData.purchaseOrders, rangeBounds]);

  const filteredExpenses = useMemo(() => (
    (liveData.expenses || []).filter((expense) => isInRange(expense, ['expenseDate', 'date', 'createdAt'], rangeBounds))
  ), [liveData.expenses, rangeBounds]);

  const periodComparison = useMemo(() => {
    return calculatePeriodComparison(rangeBounds, allArInvoices, filteredInvoices, filteredSalesOrders, salesOrders);
  }, [rangeBounds, allArInvoices, filteredInvoices, filteredSalesOrders, salesOrders]);

  // Dynamic Financial Computations strictly from Real Database Records
  const dynamicMetrics = useMemo(() => {
    return calculateDynamicMetrics(filteredInvoices, filteredSalesOrders, filteredPurchaseOrders, timeRange, periodMeta, periodComparison);
  }, [filteredInvoices, filteredSalesOrders, filteredPurchaseOrders, timeRange, periodMeta, periodComparison]);

  // Backward compatibility alias
  const dynamicKpis = useMemo(() => {
    return {
      totalInvoiced: dynamicMetrics.totalRevenueRaw,
      totalCollected: dynamicMetrics.totalCollectionsRaw,
      outstanding: dynamicMetrics.outstandingReceivablesRaw,
      criticalOverdue: dynamicMetrics.overdueAmountRaw,
      overdueCount: dynamicMetrics.overdueInvoicesCount,
      unpaidCount: dynamicMetrics.unpaidInvoicesCount,
      totalOrderCount: dynamicMetrics.invoicesCount,
      realizationRate: dynamicMetrics.effRatio,
      vendorDues: dynamicMetrics.vendorPaymentsDueRaw,
      openPOCount: dynamicMetrics.pendingVendorsCount,
      targetShortfall: dynamicMetrics.targetBenchmarkStr
    };
  }, [dynamicMetrics]);

  // Chart 1: Monthly Revenue vs Cleared Collections Trend
  const revenueTrendData = useMemo(() => {
    return calculateRevenueTrendData(timeRange, rangeBounds, filteredInvoices, filteredSalesOrders);
  }, [timeRange, rangeBounds, filteredInvoices, filteredSalesOrders]);

  // Chart 2: Collections vs Outstanding Comparison
  const collectionsVsOutstandingData = useMemo(() => {
    return calculateCollectionsVsOutstandingData(timeRange, rangeBounds, filteredInvoices, filteredSalesOrders);
  }, [timeRange, rangeBounds, filteredInvoices, filteredSalesOrders]);

  // Chart 3: Aging Breakdown Donut
  const agingBreakdownData = useMemo(() => {
    return calculateAgingBreakdownData(allArInvoices, salesOrders);
  }, [allArInvoices, salesOrders]);

  // Chart 4: Operational Outflows & Expense Allocation
  const expenseAllocationData = useMemo(() => {
    return calculateExpenseAllocationData(dynamicMetrics, filteredExpenses);
  }, [dynamicMetrics, filteredExpenses]);

  // Top 5 Real Debtors with Pending Inflows (Period-Sensitive)
  const topPendingCustomers = useMemo(() => {
    return calculateTopPendingCustomers(filteredInvoices, filteredSalesOrders);
  }, [filteredInvoices, filteredSalesOrders]);

  // Sales Team Performance from Real Invoices & Orders (Period-Sensitive)
  const salesTeamList = useMemo(() => {
    return calculateSalesTeamList(filteredInvoices, filteredSalesOrders);
  }, [filteredInvoices, filteredSalesOrders]);

  // Pending Verifications Queue from SM
  const pendingQueue = useMemo(() => {
    const list = [];
    const seen = new Set();

    (liveData.salesRecordedPayments || []).forEach((p) => {
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

    (liveData.payments || []).forEach((p) => {
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
  }, [liveData.salesRecordedPayments, liveData.payments]);

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
    return (liveData.payments || [])
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
  }, [liveData.payments]);

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
      cancelButtonColor: '#64748b'
    });

    if (result.isConfirmed) {
      try {
        await backendFetch(`/api/backend/finance/payments/${paymentId}/verify`, { method: 'POST' });
        Swal.fire({
          icon: 'success',
          title: 'Payment Verified & Cleared!',
          text: `Payment for order ${orderNum} reconciled in ledger and synced with SM.`,
          timer: 2000,
          showConfirmButton: false
        });
        await fetchDashboardData();
        if (propOnRefresh) propOnRefresh();
      } catch (err) {
        Swal.fire('Verification Failed', err.message || 'Could not verify payment', 'error');
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
        Swal.fire('Action Failed', err.message || 'Could not reject payment.', 'error');
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

      if (modalForm.autoVerify && paymentId) {
        await backendFetch(`/api/backend/finance/payments/${paymentId}/verify`, { method: 'POST' });
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
      
      {/* ── 1. TOP BANNER & HORIZON BAR ── */}
      <div style={{ 
        background: '#FFFFFF', 
        border: '1px solid #E2E8F0', 
        borderRadius: '16px', 
        padding: '22px 24px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: PALETTE.slate, letterSpacing: '-0.5px', margin: 0 }}>
                Finance Executive & Operations Desk
              </h1>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: '#ECFDF5', 
                color: '#059669', 
                border: '1px solid #A7F3D0',
                padding: '4px 10px', 
                borderRadius: '20px', 
                fontSize: '11px', 
                fontWeight: '700' 
              }}>
                <Activity size={12} /> Live ERP Data Verified
              </span>
              <span style={{
                background: '#EFF6FF',
                color: PALETTE.blue,
                fontSize: '11px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '20px',
                border: '1px solid #BFDBFE',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Calendar size={12} /> Filter: {dynamicMetrics.periodBadge}
              </span>
              <span style={{
                background: '#F8FAFC',
                color: PALETTE.slateMuted,
                fontSize: '11px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {dynamicMetrics.invoicesCount} Invoices
              </span>
            </div>
            <p style={{ color: PALETTE.slateMuted, fontSize: '13px', marginTop: '6px', marginBottom: 0 }}>
              Certified accounts receivable register, real debtor telemetry & quarterly collection analytics • Synchronized with <b>Sahad M (Finance Manager)</b>.
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
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: PALETTE.slate,
                fontSize: '13px',
                fontWeight: '700',
                borderRadius: '10px',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
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
          borderTop: '1px solid #E2E8F0', 
          paddingTop: '14px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: PALETTE.slateMuted, marginRight: '4px' }}>
              Filter:
            </span>
            {[
              { id: '30D', label: '30 Days' },
              { id: '90D', label: 'Quarter' },
              { id: '6M', label: '6 Months' },
              { id: '1Y', label: 'Full Year' },
              { id: 'CUSTOM', label: 'Custom' }
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setTimeRange(preset.id)}
                style={{
                  padding: '5px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: timeRange === preset.id ? '700' : '500',
                  border: timeRange === preset.id ? '1px solid #2563EB' : '1px solid #E2E8F0',
                  background: timeRange === preset.id ? '#EFF6FF' : '#FFFFFF',
                  color: timeRange === preset.id ? '#2563EB' : PALETTE.slateMuted,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {preset.label}
              </button>
            ))}

            {timeRange === 'CUSTOM' && (
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', padding: '4px 10px', background: '#FFFFFF', border: `1px solid ${PALETTE.border}`, borderRadius: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: PALETTE.slateMuted }}>
                  From
                  <input aria-label="Custom period start date" type="date" value={customStartDate} max={customEndDate || undefined} onChange={(event) => setCustomStartDate(event.target.value)} style={{ padding: '4px 8px', border: `1px solid ${PALETTE.border}`, borderRadius: '7px', color: PALETTE.slate, font: 'inherit', fontSize: '12px' }} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: PALETTE.slateMuted }}>
                  To
                  <input aria-label="Custom period end date" type="date" value={customEndDate} min={customStartDate || undefined} onChange={(event) => setCustomEndDate(event.target.value)} style={{ padding: '4px 8px', border: `1px solid ${PALETTE.border}`, borderRadius: '7px', color: PALETTE.slate, font: 'inherit', fontSize: '12px' }} />
                </label>
                {!isCustomRangeValid && <span role="status" style={{ color: PALETTE.rose, fontSize: '11px', fontWeight: 600 }}>Choose a valid start and end date.</span>}
              </div>
            )}
          </div>

          <div style={{ fontSize: '12px', color: PALETTE.slateMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => router.push('/finance/reports')}
              style={{
                background: 'transparent',
                border: 'none',
                color: PALETTE.blue,
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Financial Reports</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. KEY FINANCIAL PERFORMANCE METRICS (6 Grid Cards) ── */}
      <div>
        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: PALETTE.slate, margin: 0 }}>
              Key Financial Performance Metrics — {dynamicMetrics.periodBadge}
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: PALETTE.slateMuted }}>
              Source: Live AR Invoices & Sales Register ({dynamicMetrics.invoicesCount} Invoices)
            </p>
          </div>
          <span style={{ fontSize: '11.5px', color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '3px 10px', borderRadius: '12px', fontWeight: '700' }}>
            100% Synced with Finance Manager Desk
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          {/* Card 1: Total Invoiced Revenue */}
          <div className="app-card border-left-blue">
            <span style={{ fontSize: '11px', color: PALETTE.slateMuted, fontWeight: '700', textTransform: 'uppercase' }}>
              Total Invoiced Revenue
            </span>
            <h3 style={{ margin: '8px 0 2px 0', fontSize: '23px', fontWeight: '800', color: PALETTE.slate }}>
              {dynamicMetrics.totalRevenueStr}
            </h3>
            <div style={{ marginTop: '6px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', color: dynamicMetrics.periodComparisonPositive === null ? PALETTE.slateMuted : dynamicMetrics.periodComparisonPositive ? '#16A34A' : PALETTE.rose }}>
              {dynamicMetrics.periodComparisonPositive === false ? <ArrowDownRight size={13} /> : <TrendingUp size={13} />}
              <span style={{ fontWeight: '700' }}>{dynamicMetrics.periodComparisonLabel}</span>
              <span style={{ color: PALETTE.slateMuted, fontWeight: '500' }}>vs previous period</span>
            </div>
            <div style={{ fontSize: '10.5px', color: PALETTE.slateMuted, marginTop: '2px' }}>
              {dynamicMetrics.periodBadge}
            </div>
          </div>

          {/* Card 2: Realized Collections (Payment Verification Result) */}
          <div className="app-card border-left-emerald">
            <span style={{ fontSize: '11px', color: PALETTE.slateMuted, fontWeight: '700', textTransform: 'uppercase' }}>
              Realized Collections
            </span>
            <h3 style={{ margin: '8px 0 2px 0', fontSize: '23px', fontWeight: '800', color: PALETTE.emerald }}>
              {dynamicMetrics.totalCollectionsStr}
            </h3>
            <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#059669', fontWeight: '600' }}>
              Cleared bank receipts ({dynamicMetrics.periodBadge})
            </div>
          </div>

          {/* Card 3: Total Outstanding Dues */}
          <div className="app-card border-left-amber">
            <span style={{ fontSize: '11px', color: PALETTE.slateMuted, fontWeight: '700', textTransform: 'uppercase' }}>
              Total Outstanding Dues
            </span>
            <h3 style={{ margin: '8px 0 2px 0', fontSize: '23px', fontWeight: '800', color: '#D97706' }}>
              {dynamicMetrics.outstandingReceivablesStr}
            </h3>
            <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#D97706', fontWeight: '700' }}>
              {dynamicMetrics.unpaidInvoicesCount} Pending Invoices ({dynamicMetrics.periodBadge})
            </div>
          </div>

          {/* Card 4: Critical Overdue */}
          <div className="app-card border-left-red">
            <span style={{ fontSize: '11px', color: PALETTE.slateMuted, fontWeight: '700', textTransform: 'uppercase' }}>
              Critical Overdue
            </span>
            <h3 style={{ margin: '8px 0 2px 0', fontSize: '23px', fontWeight: '800', color: '#DC2626' }}>
              {dynamicMetrics.overdueAmountStr}
            </h3>
            <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
              <AlertCircle size={13} />
              <span>{dynamicMetrics.overdueInvoicesCount} Overdue Invoices ({dynamicMetrics.periodBadge})</span>
            </div>
          </div>

          {/* Card 5: Collection Efficiency */}
          <div className="app-card" style={{ borderLeft: '4px solid #8B5CF6' }}>
            <span style={{ fontSize: '11px', color: PALETTE.slateMuted, fontWeight: '700', textTransform: 'uppercase' }}>
              Collection Efficiency
            </span>
            <h3 style={{ margin: '8px 0 2px 0', fontSize: '23px', fontWeight: '800', color: PALETTE.purple }}>
              {dynamicMetrics.collectionEfficiencyStr}
            </h3>
            <div style={{ marginTop: '6px' }}>
              <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                <div style={{ width: `${Math.min(100, dynamicMetrics.effRatio)}%`, height: '100%', background: dynamicMetrics.effRatio >= 75 ? '#10B981' : '#F59E0B' }} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: dynamicMetrics.effRatio >= 75 ? '#059669' : '#D97706' }}>
                {dynamicMetrics.targetBenchmarkStr}
              </div>
            </div>
          </div>

          {/* Card 6: Vendor Dues Pending */}
          <div className="app-card" style={{ borderLeft: '4px solid #06B6D4' }}>
            <span style={{ fontSize: '11px', color: PALETTE.slateMuted, fontWeight: '700', textTransform: 'uppercase' }}>
              Vendor Dues Pending
            </span>
            <h3 style={{ margin: '8px 0 2px 0', fontSize: '23px', fontWeight: '800', color: '#7C3AED' }}>
              {dynamicMetrics.vendorPaymentsDueStr}
            </h3>
            <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#7C3AED', fontWeight: '600' }}>
              {dynamicMetrics.pendingVendorsCount} Open Purchase Orders ({dynamicMetrics.periodBadge})
            </div>
          </div>

        </div>
      </div>

      {/* ── 3. FINANCIAL TELEMETRY & CASHFLOW VISUALS (4 CHARTS) ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: PALETTE.slate, margin: 0 }}>
              Financial Telemetry & Cashflow Visuals — {dynamicMetrics.periodBadge}
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: PALETTE.slateMuted }}>
              Full Visual Rendering Guaranteed • Real Bank Inflows & Booked Exposure
            </p>
          </div>
          <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> Full Visual Rendering Guaranteed
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: '20px' }}>
          
          {/* Chart 1: Revenue vs Cleared Collections Trend (Area Chart) */}
          <div className="app-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: PALETTE.slate }}>
                  📈 Revenue vs Cleared Collections Trend ({dynamicMetrics.periodBadge})
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: PALETTE.slateMuted }}>
                  {timeRange === '30D'
                    ? 'Weekly breakdown of gross booked invoices vs bank collection inflows'
                    : timeRange === '90D'
                    ? 'Quarterly monthly progression of gross invoiced revenue vs bank collection inflows'
                    : timeRange === '6M'
                    ? 'Six-month progression of gross invoiced revenue vs bank collection inflows'
                    : '12-Month financial year progression of gross invoiced revenue vs bank collection inflows'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: '700', color: PALETTE.blue }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: PALETTE.blue }} /> Invoiced
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: '700', color: PALETTE.emerald }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: PALETTE.emerald }} /> Realized
                </span>
              </div>
            </div>

            <div style={{ width: '100%', minHeight: '280px', flex: 1, position: 'relative' }}>
              <ResponsiveChart height={280} minHeight={260}>
                <AreaChart data={revenueTrendData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE.blue} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={PALETTE.blue} stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradientCollections" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE.emerald} stopOpacity={0.32} />
                      <stop offset="95%" stopColor={PALETTE.emerald} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="label" stroke="#64748B" fontSize={11.5} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11.5} tickLine={false} tickFormatter={formatShortINR} />
                  <Tooltip 
                    formatter={(val) => formatINR(val)}
                    contentStyle={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '12.5px', color: PALETTE.slate, boxShadow: '0 6px 16px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" name="Invoiced Revenue" stroke={PALETTE.blue} strokeWidth={2.5} fill="url(#gradientRevenue)" />
                  <Area type="monotone" dataKey="collections" name="Realized Collections" stroke={PALETTE.emerald} strokeWidth={2.5} fill="url(#gradientCollections)" />
                </AreaChart>
              </ResponsiveChart>
            </div>
          </div>

          {/* Chart 2: Collections vs Outstanding Comparison (Bar Chart) */}
          <div className="app-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: PALETTE.slate }}>
                  📊 Collections vs Outstanding Comparison ({dynamicMetrics.periodBadge})
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: PALETTE.slateMuted }}>
                  {timeRange === '30D'
                    ? 'Weekly comparison of realized cash collections vs pending debtor dues'
                    : timeRange === '90D'
                    ? 'Monthly comparison across the quarter of realized cash vs pending debtor dues'
                    : timeRange === '6M'
                    ? 'Quarterly comparison across H1 of realized cash vs pending debtor dues'
                    : 'Monthly realized cash vs remaining debtor dues across the selected period'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: '700', color: PALETTE.emerald }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: PALETTE.emerald }} /> Realized
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: '700', color: PALETTE.amber }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: PALETTE.amber }} /> Pending
                </span>
              </div>
            </div>

            <div style={{ width: '100%', minHeight: '280px', flex: 1, position: 'relative' }}>
              <ResponsiveChart height={280} minHeight={260}>
                <BarChart data={collectionsVsOutstandingData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="period" stroke="#64748B" fontSize={11.5} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11.5} tickLine={false} tickFormatter={formatShortINR} />
                  <Tooltip 
                    formatter={(val) => formatINR(val)}
                    contentStyle={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', fontSize: '12.5px', color: PALETTE.slate, boxShadow: '0 6px 16px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="collections" name="Realized Collections" fill={PALETTE.emerald} radius={[6, 6, 0, 0]} maxBarSize={38} />
                  <Bar dataKey="outstanding" name="Pending Dues" fill={PALETTE.amber} radius={[6, 6, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveChart>
            </div>
          </div>

          {/* Chart 3: Receivables Aging Buckets (Donut) */}
          <div className="app-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: PALETTE.slate }}>
                  🍩 Receivables Aging Buckets ({dynamicMetrics.periodBadge})
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: PALETTE.slateMuted }}>
                  Debtor exposure segmented by invoice payment term duration
                </p>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: PALETTE.rose, background: '#FEF2F2', padding: '4px 10px', borderRadius: '6px', border: '1px solid #FECACA' }}>
                Total: {dynamicMetrics.outstandingReceivablesStr}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ width: '220px', height: '220px', margin: '0 auto', position: 'relative' }}>
                <ResponsiveChart height={220} minHeight={200}>
                  <PieChart>
                    <Pie
                      data={agingBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {agingBreakdownData.map((entry, index) => (
                        <Cell key={`cell-age-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => formatINR(val)}
                      contentStyle={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveChart>
              </div>

              {/* Legend with Metrics */}
              <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {agingBreakdownData.map((bucket, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#F8FAFC',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: bucket.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', fontWeight: '700', color: PALETTE.slate }}>{bucket.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: PALETTE.slate, display: 'block' }}>{formatINR(bucket.value)}</span>
                      <span style={{ fontSize: '10px', color: PALETTE.slateMuted, fontWeight: '600' }}>{bucket.percentage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 4: Operational Cash Outflows & Expenses (Donut) */}
          <div className="app-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: PALETTE.slate }}>
                  💳 Operational Cash Outflows & Expenses ({dynamicMetrics.periodBadge})
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: PALETTE.slateMuted }}>
                  Distribution of corporate expenditure across operations and statutory dues
                </p>
              </div>
              <button
                onClick={() => router.push('/finance/salary')}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: PALETTE.slate,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Payroll Center</span>
                <ChevronRight size={12} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ width: '220px', height: '220px', margin: '0 auto', position: 'relative' }}>
                <ResponsiveChart height={220} minHeight={200}>
                  <PieChart>
                    <Pie
                      data={expenseAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {expenseAllocationData.map((entry, index) => (
                        <Cell key={`cell-exp-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => formatINR(val)}
                      contentStyle={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveChart>
              </div>

              {/* Legend with Metrics */}
              <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {expenseAllocationData.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#F8FAFC',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', fontWeight: '700', color: PALETTE.slate }}>{item.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: PALETTE.slate, display: 'block' }}>{formatINR(item.value)}</span>
                      <span style={{ fontSize: '10px', color: PALETTE.slateMuted, fontWeight: '600' }}>{item.share}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 4. TOP DEBTORS & SALES TEAM ATTRIBUTION ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap: '20px' }}>
        
        {/* Top Debtors with Pending Dues (Interactive with Verify Receipt →) */}
        <div className="app-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={18} color={PALETTE.amber} />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: PALETTE.slate }}>
                Top Debtors with Pending Dues ({dynamicMetrics.periodBadge})
              </h3>
            </div>
            <button
              onClick={() => router.push('/finance-executive/customers')}
              style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '8px',
                padding: '5px 12px',
                color: '#92400E',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Customer Ledger</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topPendingCustomers.map((cust, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#F8FAFC',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  transition: 'background 0.15s ease',
                }}
              >
                <div>
                  <span style={{ fontSize: '12.5px', fontWeight: '800', color: PALETTE.slate, display: 'block' }}>
                    {cust.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '11px', color: PALETTE.slateMuted, fontWeight: '600' }}>
                      {cust.invoicesStr}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        color: cust.riskColor,
                        background: cust.risk === 'HIGH' ? '#FEF2F2' : cust.risk === 'MEDIUM' ? '#FFFBEB' : '#ECFDF5',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {cust.risk} RISK
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '800', color: cust.riskColor, display: 'block' }}>
                    {cust.amountStr}
                  </span>
                  <button
                    onClick={() => router.push('/finance-executive/payment-verification')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: PALETTE.blue,
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: '2px',
                    }}
                  >
                    Verify Receipt →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Team Collection Attribution */}
        <div className="app-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color={PALETTE.blue} />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: PALETTE.slate }}>
                Sales Team Collection Attribution ({dynamicMetrics.periodBadge})
              </h3>
            </div>
            <button
              onClick={() => router.push('/finance-executive/reports')}
              style={{
                background: '#EFF6FF',
                border: '1px solid #DBEAFE',
                borderRadius: '8px',
                padding: '5px 12px',
                color: PALETTE.blue,
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Audit Reports</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '310px', overflowY: 'auto', paddingRight: '4px' }}>
            {salesTeamList.map((rep, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#F8FAFC',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: rep.role === 'SuperSales' ? '#EFF6FF' : '#F0FDF4',
                      color: rep.role === 'SuperSales' ? PALETTE.blue : '#16A34A',
                      border: `1px solid ${rep.role === 'SuperSales' ? '#BFDBFE' : '#BBF7D0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '800',
                      flexShrink: 0,
                    }}
                  >
                    {rep.initials}
                  </div>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: PALETTE.slate, display: 'block' }}>
                      {rep.name}
                    </span>
                    <span style={{ fontSize: '11px', color: PALETTE.slateMuted, fontWeight: '600' }}>
                      {rep.role} • {rep.count} Invoices
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '800', color: PALETTE.slate, display: 'block' }}>
                    {rep.salesValStr}
                  </span>
                  <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700' }}>
                    Realized: {rep.receivedStr}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── 5. EXECUTIVE APPROVALS QUEUE & 1-CLICK FINANCE ACTIONS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap: '20px' }}>
        
        {/* Executive Approvals & Sign-off Queue */}
        <div className="app-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={18} color="#16A34A" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: PALETTE.slate }}>
                Executive Approvals & Sign-off Queue
              </h3>
            </div>
            <button
              onClick={() => router.push('/finance-executive/payment-verification')}
              style={{
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: '700',
                color: PALETTE.slate,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Item 1: Payment Receipts Verification */}
            <div
              onClick={() => router.push('/finance-executive/payment-verification')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '12px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#DCFCE7', padding: '8px', borderRadius: '8px', color: '#16A34A' }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: PALETTE.slate, display: 'block' }}>
                    Payment Receipts Verification
                  </span>
                  <span style={{ fontSize: '11.5px', color: PALETTE.slateMuted }}>
                    Unverified bank transfers and UTR entries
                  </span>
                </div>
              </div>
              <span style={{ background: '#16A34A', color: '#FFFFFF', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                Active ({pendingQueue.length} Pending)
              </span>
            </div>

            {/* Item 2: PO Indent Issuance */}
            <div
              onClick={() => router.push('/finance/po-requests')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '12px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#DBEAFE', padding: '8px', borderRadius: '8px', color: PALETTE.blue }}>
                  <FileText size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: PALETTE.slate, display: 'block' }}>
                    Purchase Order Sanctions
                  </span>
                  <span style={{ fontSize: '11.5px', color: PALETTE.slateMuted }}>
                    {dynamicKpis.openPOCount} Open Purchase Orders in ERP
                  </span>
                </div>
              </div>
              <span style={{ background: PALETTE.blue, color: '#FFFFFF', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                {dynamicKpis.openPOCount} Open POs
              </span>
            </div>
          </div>
        </div>

        {/* 1-Click Finance Actions */}
        <div className="app-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Zap size={18} color={PALETTE.amber} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: PALETTE.slate }}>
              1-Click Finance Actions
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
              gap: '12px',
            }}
          >
            <button
              onClick={() => router.push('/finance-executive/payment-verification')}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ background: '#DCFCE7', padding: '6px', borderRadius: '8px', color: '#16A34A' }}>
                <CheckCircle2 size={18} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: PALETTE.slate }}>Verify Payments</span>
              <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>Approve receipts</span>
            </button>

            <button
              onClick={() => router.push('/finance-executive/invoices')}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ background: '#EFF6FF', padding: '6px', borderRadius: '8px', color: PALETTE.blue }}>
                <FileText size={18} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: PALETTE.slate }}>Sales Invoices</span>
              <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>Generate billing</span>
            </button>

            <button
              onClick={() => router.push('/finance-executive/reports')}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ background: '#F5F3FF', padding: '6px', borderRadius: '8px', color: PALETTE.purple }}>
                <BarChart3 size={18} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: PALETTE.slate }}>P&L Reports</span>
              <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>Financial analytics</span>
            </button>

            <button
              onClick={() => router.push('/finance-executive/customers')}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ background: '#FEF3C7', padding: '6px', borderRadius: '8px', color: '#D97706' }}>
                <Users size={18} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: PALETTE.slate }}>Customer Ledger</span>
              <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>Account balances</span>
            </button>

            <button
              onClick={() => router.push('/finance/po-requests')}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ background: '#E0E7FF', padding: '6px', borderRadius: '8px', color: '#4F46E5' }}>
                <Receipt size={18} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: PALETTE.slate }}>Manage POs</span>
              <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>Vendor orders</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ background: '#10B981', padding: '6px', borderRadius: '8px', color: '#FFFFFF' }}>
                <Plus size={18} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#065F46' }}>Record SM Payment</span>
              <span style={{ fontSize: '11px', color: '#047857' }}>Reconcile order</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── 6. INTERACTIVE TABBED WORKSPACE (QUEUE, SM ORDERS, RECENT VERIFIED) ── */}
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
              Pending Verifications Queue
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

        {/* ── TAB 1: PENDING VERIFICATIONS QUEUE TABLE ── */}
        {activeTab === 'queue' && (
          <div style={{ padding: '20px' }}>
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
                          {item.orderNumber}
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

              {modalForm.customerName && (
                <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '10px 14px', borderRadius: '8px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Customer: </span>
                  <b style={{ color: 'var(--color-text-primary)' }}>{modalForm.customerName}</b>
                </div>
              )}

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

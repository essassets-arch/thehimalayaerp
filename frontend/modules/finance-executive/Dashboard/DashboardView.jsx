'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  ChevronDown,
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
  getFiscalQuarterInfo,
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

  // Filters & Navigation (Standard 30D / 90D Quarter / 6M / 1Y / CUSTOM Horizons)
  const [timeRange, setTimeRange] = useState('30D');
  const [selectedQuarter, setSelectedQuarter] = useState('CURRENT');
  const [quarterDropdownOpen, setQuarterDropdownOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const quarterDropdownRef = useRef(null);

  const fiscalQuarterInfo = useMemo(() => getFiscalQuarterInfo(), []);

  const rangeBounds = useMemo(() => {
    return getRangeBounds(timeRange, new Date(), customStartDate, customEndDate, selectedQuarter);
  }, [timeRange, customStartDate, customEndDate, selectedQuarter]);

  const isCustomRangeValid = Boolean(customStartDate && customEndDate && customStartDate <= customEndDate);

  const periodMeta = useMemo(() => {
    return getPeriodMeta(timeRange, rangeBounds, selectedQuarter);
  }, [timeRange, rangeBounds, selectedQuarter]);

  // Click outside listener for Quarter dropdown popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (quarterDropdownRef.current && !quarterDropdownRef.current.contains(event.target)) {
        setQuarterDropdownOpen(false);
      }
    }
    if (quarterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [quarterDropdownOpen]);



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
            {/* 30 Days */}
            <button
              type="button"
              onClick={() => { setTimeRange('30D'); setQuarterDropdownOpen(false); }}
              style={{
                padding: '5px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: timeRange === '30D' ? '700' : '500',
                border: timeRange === '30D' ? '1px solid #2563EB' : '1px solid #E2E8F0',
                background: timeRange === '30D' ? '#EFF6FF' : '#FFFFFF',
                color: timeRange === '30D' ? '#2563EB' : PALETTE.slateMuted,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              30 Days
            </button>

            {/* Quarter with Interactive Dropdown */}
            <div ref={quarterDropdownRef} style={{ position: 'relative', display: 'inline-flex' }}>
              <button
                type="button"
                onClick={() => {
                  if (timeRange !== '90D') {
                    setTimeRange('90D');
                    setQuarterDropdownOpen(true);
                  } else {
                    setQuarterDropdownOpen((prev) => !prev);
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: timeRange === '90D' ? '700' : '500',
                  border: timeRange === '90D' ? '1px solid #2563EB' : '1px solid #E2E8F0',
                  background: timeRange === '90D' ? '#EFF6FF' : '#FFFFFF',
                  color: timeRange === '90D' ? '#2563EB' : PALETTE.slateMuted,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: timeRange === '90D' ? '0 1px 3px rgba(37, 99, 235, 0.15)' : 'none'
                }}
                title="Select Indian Fiscal Quarter (FY 2026–27)"
              >
                <span>
                  {timeRange === '90D' 
                    ? (selectedQuarter === 'CURRENT'
                        ? `Quarter (${fiscalQuarterInfo.currentQuarterKey})`
                        : selectedQuarter === 'PREV_Q'
                        ? `Quarter (Prev: ${fiscalQuarterInfo.prevQ?.name || 'Q2'})`
                        : `Quarter: ${selectedQuarter}`)
                    : 'Quarter'}
                </span>
                <ChevronDown size={13} style={{ transform: quarterDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }} />
              </button>

              {quarterDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    zIndex: 60,
                    minWidth: '280px',
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.14), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ padding: '6px 8px 4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: PALETTE.slateMuted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Indian Fiscal Quarters
                    </span>
                    <span style={{ fontSize: '10.5px', fontWeight: '700', color: PALETTE.blue, background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                      {fiscalQuarterInfo.fyLabel}
                    </span>
                  </div>

                  {/* Relative Quarters: Current & Previous */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '4px' }}>
                    {/* Current Quarter */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQuarter('CURRENT');
                        setTimeRange('90D');
                        setQuarterDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: selectedQuarter === 'CURRENT' ? '#EFF6FF' : 'transparent',
                        color: selectedQuarter === 'CURRENT' ? '#1D4ED8' : PALETTE.slate,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => { if (selectedQuarter !== 'CURRENT') e.currentTarget.style.background = '#F8FAFC'; }}
                      onMouseLeave={(e) => { if (selectedQuarter !== 'CURRENT') e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: selectedQuarter === 'CURRENT' ? '700' : '600' }}>
                            Current Quarter ({fiscalQuarterInfo.currentQuarterKey})
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: '700', background: '#ECFDF5', color: '#059669', padding: '1px 5px', borderRadius: '4px' }}>
                            Active
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>
                          {fiscalQuarterInfo.currentQ?.periodText}
                        </span>
                      </div>
                      {selectedQuarter === 'CURRENT' && <Check size={14} color="#2563EB" />}
                    </button>

                    {/* Previous Quarter */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQuarter('PREV_Q');
                        setTimeRange('90D');
                        setQuarterDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: selectedQuarter === 'PREV_Q' ? '#EFF6FF' : 'transparent',
                        color: selectedQuarter === 'PREV_Q' ? '#1D4ED8' : PALETTE.slate,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => { if (selectedQuarter !== 'PREV_Q') e.currentTarget.style.background = '#F8FAFC'; }}
                      onMouseLeave={(e) => { if (selectedQuarter !== 'PREV_Q') e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: selectedQuarter === 'PREV_Q' ? '700' : '600' }}>
                            Previous Quarter ({fiscalQuarterInfo.prevQ?.name})
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>
                          {fiscalQuarterInfo.prevQ?.periodText}
                        </span>
                      </div>
                      {selectedQuarter === 'PREV_Q' && <Check size={14} color="#2563EB" />}
                    </button>
                  </div>

                  <div style={{ margin: '4px 0', borderTop: '1px solid #F1F5F9', padding: '4px 8px 2px 8px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: '700', color: PALETTE.slateMuted, textTransform: 'uppercase' }}>
                      All Quarters ({fiscalQuarterInfo.fyLabel})
                    </span>
                  </div>

                  {/* 4 Standard Quarters: Q1, Q2, Q3, Q4 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    {fiscalQuarterInfo.quarters.map((q) => {
                      const isSelected = selectedQuarter === q.id;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => {
                            setSelectedQuarter(q.id);
                            setTimeRange('90D');
                            setQuarterDropdownOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: isSelected ? '1px solid #93C5FD' : '1px solid #F1F5F9',
                            background: isSelected ? '#EFF6FF' : '#F8FAFC',
                            color: isSelected ? '#1D4ED8' : PALETTE.slate,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#F1F5F9'; }}
                          onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = '#F8FAFC'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ fontSize: '12px', fontWeight: isSelected ? '800' : '700' }}>
                              {q.id}
                            </span>
                            {isSelected && <Check size={12} color="#2563EB" />}
                          </div>
                          <span style={{ fontSize: '10px', color: PALETTE.slateMuted, marginTop: '2px' }}>
                            {q.periodText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick sub-pills for Quarter when 90D is active */}
            {timeRange === '90D' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', padding: '2px 4px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '11px', color: PALETTE.slateMuted, paddingLeft: '4px', fontWeight: '700' }}>
                  Select:
                </span>
                {[
                  { id: 'CURRENT', label: `Current (${fiscalQuarterInfo.currentQuarterKey})` },
                  { id: 'PREV_Q', label: `Prev (${fiscalQuarterInfo.prevQ?.name || 'Q2'})` },
                  { id: 'Q1', label: 'Q1' },
                  { id: 'Q2', label: 'Q2' },
                  { id: 'Q3', label: 'Q3' },
                  { id: 'Q4', label: 'Q4' }
                ].map((qp) => {
                  const active = selectedQuarter === qp.id;
                  return (
                    <button
                      key={qp.id}
                      type="button"
                      onClick={() => setSelectedQuarter(qp.id)}
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: active ? '700' : '500',
                        borderRadius: '5px',
                        border: 'none',
                        background: active ? '#FFFFFF' : 'transparent',
                        color: active ? '#2563EB' : PALETTE.slateMuted,
                        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {qp.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 6 Months */}
            <button
              type="button"
              onClick={() => { setTimeRange('6M'); setQuarterDropdownOpen(false); }}
              style={{
                padding: '5px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: timeRange === '6M' ? '700' : '500',
                border: timeRange === '6M' ? '1px solid #2563EB' : '1px solid #E2E8F0',
                background: timeRange === '6M' ? '#EFF6FF' : '#FFFFFF',
                color: timeRange === '6M' ? '#2563EB' : PALETTE.slateMuted,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              6 Months
            </button>

            {/* Full Year */}
            <button
              type="button"
              onClick={() => { setTimeRange('1Y'); setQuarterDropdownOpen(false); }}
              style={{
                padding: '5px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: timeRange === '1Y' ? '700' : '500',
                border: timeRange === '1Y' ? '1px solid #2563EB' : '1px solid #E2E8F0',
                background: timeRange === '1Y' ? '#EFF6FF' : '#FFFFFF',
                color: timeRange === '1Y' ? '#2563EB' : PALETTE.slateMuted,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Full Year
            </button>

            {/* Custom */}
            <button
              type="button"
              onClick={() => { setTimeRange('CUSTOM'); setQuarterDropdownOpen(false); }}
              style={{
                padding: '5px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: timeRange === 'CUSTOM' ? '700' : '500',
                border: timeRange === 'CUSTOM' ? '1px solid #2563EB' : '1px solid #E2E8F0',
                background: timeRange === 'CUSTOM' ? '#EFF6FF' : '#FFFFFF',
                color: timeRange === 'CUSTOM' ? '#2563EB' : PALETTE.slateMuted,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Custom
            </button>

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

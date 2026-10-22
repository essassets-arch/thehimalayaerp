'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, DollarSign, Wallet, ShieldAlert, ArrowUpRight, CheckCircle2,
  Clock, Users, FileText, AlertTriangle, ChevronRight, ChevronDown, Check, Zap, RefreshCw,
  BarChart3, CreditCard, Building, ArrowDownRight, Award, CheckSquare,
  AlertCircle, FileCheck, Layers, PieChart as PieChartIcon, Calendar,
  ArrowRight, Activity, Percent, ShieldCheck, Truck
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';
import { useERPStore } from '@/store/erpStore';
import { backendFetch } from '../../../lib/backendFetch';
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
} from '../utils/financeDashboardEngine';

function useSafeRouter() {
  try {
    return useRouter();
  } catch {
    return { push: (url) => { if (typeof window !== 'undefined') window.location.href = url; } };
  }
}

export default function FinanceManagerDashboardView({
  state: propState,
  payments: propPayments = [],
  expenses: propExpenses = [],
  purchaseOrders: propPOs = []
}) {
  const router = useSafeRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [timeRange, setTimeRange] = useState('30D'); // '30D' | '90D' | '6M' | '1Y'
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
  const [isRefreshing, setIsRefreshing] = useState(false);
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
  const [loadingLive, setLoadingLive] = useState(true);

  const storeState = useERPStore((s) => s.state);
  const state = storeState || propState || {};

  // Fetch all live backend data including AR registers, payments and purchase orders
  const fetchAllFinanceData = useCallback(async () => {
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

      const fetchedPmts = parseList(pmtsRes);
      const fetchedSalesPmts = parseList(salesPmtsRes);
      const fetchedPendingPmts = parseList(pendingPmtsRes);

      const combinedRecorded = [...fetchedSalesPmts];
      fetchedPendingPmts.forEach(p => {
        if (!combinedRecorded.some(item => (item.id || item.payment_id) === (p.id || p.payment_id))) {
          combinedRecorded.push(p);
        }
      });

      setLiveData({
        salesOrders: parseList(ordersRes),
        applArInvoices: parseList(applArRes),
        hcpplArInvoices: parseList(hcpplArRes),
        hcpplRegInvoices: parseList(hcpplRegRes),
        financeArInvoices: parseList(finArRes),
        purchaseOrders: parseList(poRes),
        expenses: parseList(expRes),
        brandRequests: parseList(brandRes),
        users: parseList(usersRes),
        payments: fetchedPmts,
        salesRecordedPayments: combinedRecorded
      });
    } catch (err) {
      console.error('[FinanceManagerDashboard] Data fetch error:', err);
    } finally {
      setLoadingLive(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchAllFinanceData();
  }, [fetchAllFinanceData]);

  // Combined AR Invoices (APPL + HCPPL + Finance AR)
  const allArInvoices = useMemo(() => {
    return deduplicateArInvoices(
      liveData.applArInvoices,
      liveData.hcpplArInvoices,
      liveData.hcpplRegInvoices,
      liveData.financeArInvoices,
      liveData.payments.length > 0 ? liveData.payments : propPayments,
      state.invoices
    );
  }, [liveData.applArInvoices, liveData.hcpplArInvoices, liveData.hcpplRegInvoices, liveData.financeArInvoices, liveData.payments, propPayments, state.invoices]);

  // Combined Sales Orders
  const salesOrders = useMemo(() => {
    if (Array.isArray(liveData.salesOrders) && liveData.salesOrders.length > 0) return liveData.salesOrders;
    if (Array.isArray(state.sales?.orders) && state.sales.orders.length > 0) return state.sales.orders;
    if (Array.isArray(state.orders) && state.orders.length > 0) return state.orders;
    return [];
  }, [liveData.salesOrders, state.sales?.orders, state.orders]);

  // Period label & human-readable badge
  const periodMeta = useMemo(() => {
    return getPeriodMeta(timeRange, rangeBounds, selectedQuarter);
  }, [timeRange, rangeBounds, selectedQuarter]);

  // ── Filtered AR Invoices according to Active Horizon ──
  const filteredInvoices = useMemo(() => {
    if (!allArInvoices || allArInvoices.length === 0) return [];
    const quarterFilter = timeRange === '90D'
      ? (selectedQuarter === 'CURRENT'
          ? fiscalQuarterInfo.currentQuarterKey
          : selectedQuarter === 'PREV_Q'
          ? (fiscalQuarterInfo.prevQ?.name || 'Q2')
          : selectedQuarter)
      : '';
    return allArInvoices.filter((invoice) => isInRange(invoice, ['invoiceDate', 'createdAt', 'date'], rangeBounds, quarterFilter));
  }, [allArInvoices, rangeBounds, timeRange, selectedQuarter, fiscalQuarterInfo]);

  // ── Filtered Sales Orders according to Active Horizon ──
  const filteredSalesOrders = useMemo(() => {
    if (!salesOrders || salesOrders.length === 0) return [];
    return salesOrders.filter((order) => isInRange(order, ['orderDate', 'createdAt', 'date'], rangeBounds));
  }, [salesOrders, rangeBounds]);

  // ── Filtered Purchase Orders according to Active Horizon ──
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

  // --- Dynamic Financial Computations strictly from Real Database Records ---
  const dynamicMetrics = useMemo(() => {
    return calculateDynamicMetrics(
      filteredInvoices,
      filteredSalesOrders,
      filteredPurchaseOrders,
      timeRange,
      periodMeta,
      periodComparison,
      allArInvoices,
      liveData.payments,
      rangeBounds
    );
  }, [filteredInvoices, filteredSalesOrders, filteredPurchaseOrders, timeRange, periodMeta, periodComparison, allArInvoices, liveData.payments, rangeBounds]);

  // ── 1. Chart Data: Monthly Revenue vs Cleared Collections Trend ──
  const revenueTrendData = useMemo(() => {
    return calculateRevenueTrendData(timeRange, rangeBounds, filteredInvoices, filteredSalesOrders);
  }, [timeRange, filteredInvoices, filteredSalesOrders, rangeBounds]);

  // 2. Chart Data: Collections vs Outstanding Comparison
  const collectionsVsOutstandingData = useMemo(() => {
    return calculateCollectionsVsOutstandingData(timeRange, rangeBounds, filteredInvoices, filteredSalesOrders);
  }, [timeRange, filteredInvoices, filteredSalesOrders, rangeBounds]);

  const agingBreakdownData = useMemo(() => {
    return calculateAgingBreakdownData(allArInvoices, salesOrders);
  }, [allArInvoices, salesOrders]);

  // ── 4. Chart Data: Operational Outflow & Expense Allocation ──
  const expenseAllocationData = useMemo(() => {
    return calculateExpenseAllocationData(dynamicMetrics, filteredExpenses);
  }, [dynamicMetrics, filteredExpenses]);

  // ── Top 5 Real Debtors with Pending Inflows (Period-Sensitive) ──
  const topPendingCustomers = useMemo(() => {
    return calculateTopPendingCustomers(filteredInvoices, filteredSalesOrders);
  }, [filteredInvoices, filteredSalesOrders]);

  // ── Sales Team Performance from Real Invoices & Orders (Period-Sensitive) ──
  const salesTeamList = useMemo(() => {
    return calculateSalesTeamList(filteredInvoices, filteredSalesOrders);
  }, [filteredInvoices, filteredSalesOrders]);

  return (
    <div
      className="finance-dashboard-container"
      style={{
        fontFamily: "var(--font-main), 'Plus Jakarta Sans', Inter, sans-serif",
        color: PALETTE.slate,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Executive Header Banner ── */}
      <div
        className="finance-dashboard-header"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.35)',
              flexShrink: 0,
            }}
          >
            <BarChart3 size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: '800',
                  color: PALETTE.slate,
                  letterSpacing: '-0.02em',
                }}
              >
                Finance Manager Dashboard
              </h1>
              <span
                style={{
                  background: '#ECFDF5',
                  color: '#059669',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  border: '1px solid #A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Activity size={12} /> Live ERP Data Verified
              </span>
              <span
                style={{
                  background: '#EFF6FF',
                  color: PALETTE.blue,
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  border: '1px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Calendar size={12} /> Filter: {dynamicMetrics.periodBadge}
              </span>
              <span
                style={{
                  background: '#F8FAFC',
                  color: PALETTE.slateMuted,
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {dynamicMetrics.invoicesCount} Invoices
              </span>
            </div>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '13px',
                color: PALETTE.slateMuted,
                fontWeight: '500',
              }}
            >
              Certified accounts receivable register, real debtor telemetry & quarterly collection analytics
            </p>
          </div>
        </div>

        {/* Header Actions & Time Horizon Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Segmented Time Filter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F1F5F9',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              gap: '2px',
              position: 'relative'
            }}
          >
            {/* 30 Days */}
            <button
              type="button"
              onClick={() => { setTimeRange('30D'); setQuarterDropdownOpen(false); }}
              style={{
                border: 'none',
                background: timeRange === '30D' ? '#FFFFFF' : 'transparent',
                color: timeRange === '30D' ? PALETTE.blue : PALETTE.slateMuted,
                fontWeight: timeRange === '30D' ? '800' : '600',
                fontSize: '12px',
                padding: '7px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: timeRange === '30D' ? '0 2px 8px rgba(37,99,235,0.15)' : 'none',
                transition: 'all 0.18s ease',
              }}
            >
              30 Days
            </button>

            {/* Quarter with Dropdown */}
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
                  border: 'none',
                  background: timeRange === '90D' ? '#FFFFFF' : 'transparent',
                  color: timeRange === '90D' ? PALETTE.blue : PALETTE.slateMuted,
                  fontWeight: timeRange === '90D' ? '800' : '600',
                  fontSize: '12px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: timeRange === '90D' ? '0 2px 8px rgba(37,99,235,0.15)' : 'none',
                  transition: 'all 0.18s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#E2E8F0', padding: '2px 4px', borderRadius: '7px' }}>
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
                        padding: '3px 7px',
                        fontSize: '11px',
                        fontWeight: active ? '700' : '500',
                        borderRadius: '5px',
                        border: 'none',
                        background: active ? '#FFFFFF' : 'transparent',
                        color: active ? PALETTE.blue : PALETTE.slateMuted,
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
                border: 'none',
                background: timeRange === '6M' ? '#FFFFFF' : 'transparent',
                color: timeRange === '6M' ? PALETTE.blue : PALETTE.slateMuted,
                fontWeight: timeRange === '6M' ? '800' : '600',
                fontSize: '12px',
                padding: '7px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: timeRange === '6M' ? '0 2px 8px rgba(37,99,235,0.15)' : 'none',
                transition: 'all 0.18s ease',
              }}
            >
              6 Months
            </button>

            {/* Full Year */}
            <button
              type="button"
              onClick={() => { setTimeRange('1Y'); setQuarterDropdownOpen(false); }}
              style={{
                border: 'none',
                background: timeRange === '1Y' ? '#FFFFFF' : 'transparent',
                color: timeRange === '1Y' ? PALETTE.blue : PALETTE.slateMuted,
                fontWeight: timeRange === '1Y' ? '800' : '600',
                fontSize: '12px',
                padding: '7px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: timeRange === '1Y' ? '0 2px 8px rgba(37,99,235,0.15)' : 'none',
                transition: 'all 0.18s ease',
              }}
            >
              Full Year
            </button>

            {/* Custom */}
            <button
              type="button"
              onClick={() => { setTimeRange('CUSTOM'); setQuarterDropdownOpen(false); }}
              style={{
                border: 'none',
                background: timeRange === 'CUSTOM' ? '#FFFFFF' : 'transparent',
                color: timeRange === 'CUSTOM' ? PALETTE.blue : PALETTE.slateMuted,
                fontWeight: timeRange === 'CUSTOM' ? '800' : '600',
                fontSize: '12px',
                padding: '7px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: timeRange === 'CUSTOM' ? '0 2px 8px rgba(37,99,235,0.15)' : 'none',
                transition: 'all 0.18s ease',
              }}
            >
              Custom
            </button>
          </div>

          {timeRange === 'CUSTOM' && (
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', padding: '8px 10px', background: '#FFFFFF', border: `1px solid ${PALETTE.border}`, borderRadius: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: PALETTE.slateMuted }}>
                From
                <input aria-label="Custom period start date" type="date" value={customStartDate} max={customEndDate || undefined} onChange={(event) => setCustomStartDate(event.target.value)} style={{ padding: '6px 8px', border: `1px solid ${PALETTE.border}`, borderRadius: '7px', color: PALETTE.slate, font: 'inherit' }} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: PALETTE.slateMuted }}>
                To
                <input aria-label="Custom period end date" type="date" value={customEndDate} min={customStartDate || undefined} onChange={(event) => setCustomEndDate(event.target.value)} style={{ padding: '6px 8px', border: `1px solid ${PALETTE.border}`, borderRadius: '7px', color: PALETTE.slate, font: 'inherit' }} />
              </label>
              {!isCustomRangeValid && <span role="status" style={{ width: '100%', color: PALETTE.rose, fontSize: '11px' }}>Choose a valid start and end date.</span>}
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchAllFinanceData}
            title="Refresh real financial data"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: PALETTE.slateMuted,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          {/* Direct Link to Reports */}
          <button
            onClick={() => router.push('/finance/reports')}
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 18px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              transition: 'transform 0.15s ease',
            }}
          >
            <span>Financial Reports</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* ── 📊 SECTION 1: HERO FINANCIAL KPI TIER (6 Accurate Cards) ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={18} color={PALETTE.blue} />
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: PALETTE.slate }}>
              Key Financial Performance Metrics — {dynamicMetrics.periodBadge}
            </h2>
          </div>
          <span style={{ fontSize: '12px', color: PALETTE.slateMuted, fontWeight: '600' }}>
            Source: Live AR Invoices & Sales Register ({dynamicMetrics.invoicesCount} Invoices)
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
            gap: '16px',
            width: '100%',
          }}
        >
          {/* Card 1: Total Gross Invoiced Revenue */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: `4px solid ${PALETTE.blue}`,
              borderRadius: '14px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: PALETTE.slateMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Invoiced Revenue
              </span>
              <div style={{ background: '#EFF6FF', padding: '6px', borderRadius: '8px', color: PALETTE.blue }}>
                <DollarSign size={16} />
              </div>
            </div>
            <div style={{ margin: '12px 0 6px 0' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: PALETTE.slate, lineHeight: 1.1 }}>
                {loadingLive && !dynamicMetrics.totalRevenueRaw ? 'Syncing...' : dynamicMetrics.totalRevenueStr}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: dynamicMetrics.periodComparisonPositive === null ? PALETTE.slateMuted : dynamicMetrics.periodComparisonPositive ? '#16A34A' : PALETTE.rose }}>
              {dynamicMetrics.periodComparisonPositive === false ? <ArrowDownRight size={14} /> : <TrendingUp size={14} />}
              <span>{dynamicMetrics.periodComparisonLabel}</span>
            </div>
          </div>

          {/* Card 2: Cleared Bank Collections */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: `4px solid ${PALETTE.emerald}`,
              borderRadius: '14px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: PALETTE.slateMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Realized Collections
              </span>
              <div style={{ background: '#ECFDF5', padding: '6px', borderRadius: '8px', color: PALETTE.emerald }}>
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div style={{ margin: '12px 0 6px 0' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#059669', lineHeight: 1.1 }}>
                {loadingLive && !dynamicMetrics.totalRevenueRaw ? 'Syncing...' : dynamicMetrics.totalCollectionsStr}
              </div>
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#059669' }}>
              Cleared bank receipts ({dynamicMetrics.periodLabel})
            </div>
          </div>

          {/* Card 3: Outstanding Receivables */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: `4px solid ${PALETTE.amber}`,
              borderRadius: '14px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: PALETTE.slateMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Outstanding Dues
              </span>
              <div style={{ background: '#FFFBEB', padding: '6px', borderRadius: '8px', color: PALETTE.amber }}>
                <Wallet size={16} />
              </div>
            </div>
            <div style={{ margin: '12px 0 6px 0' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#D97706', lineHeight: 1.1 }}>
                {loadingLive && !dynamicMetrics.totalRevenueRaw ? 'Syncing...' : dynamicMetrics.outstandingReceivablesStr}
              </div>
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#D97706' }}>
              {dynamicMetrics.unpaidInvoicesCount} Pending Invoices ({dynamicMetrics.periodLabel})
            </div>
          </div>

          {/* Card 4: Critical Overdue Inflows */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: `4px solid ${PALETTE.rose}`,
              borderRadius: '14px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: PALETTE.slateMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Critical Overdue
              </span>
              <div style={{ background: '#FEF2F2', padding: '6px', borderRadius: '8px', color: PALETTE.rose }}>
                <AlertTriangle size={16} />
              </div>
            </div>
            <div style={{ margin: '12px 0 6px 0' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#DC2626', lineHeight: 1.1 }}>
                {loadingLive && !dynamicMetrics.totalRevenueRaw ? 'Syncing...' : dynamicMetrics.overdueAmountStr}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#DC2626' }}>
              <AlertCircle size={13} />
              <span>{dynamicMetrics.overdueInvoicesCount} Overdue Invoices ({dynamicMetrics.periodLabel})</span>
            </div>
          </div>

          {/* Card 5: Collection Efficiency */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: `4px solid ${PALETTE.cyan}`,
              borderRadius: '14px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: PALETTE.slateMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Collection Efficiency
              </span>
              <div style={{ background: '#ECFEFF', padding: '6px', borderRadius: '8px', color: PALETTE.cyan }}>
                <Percent size={16} />
              </div>
            </div>
            <div style={{ margin: '12px 0 6px 0' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0891B2', lineHeight: 1.1 }}>
                {loadingLive && !dynamicMetrics.totalRevenueRaw ? '...' : dynamicMetrics.collectionEfficiencyStr}
              </div>
            </div>
            <div>
              <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                <div style={{ width: `${Math.min(100, dynamicMetrics.effRatio)}%`, height: '100%', background: dynamicMetrics.effRatio >= 75 ? '#10B981' : '#F59E0B' }} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: dynamicMetrics.effRatio >= 75 ? '#059669' : '#D97706' }}>
                {dynamicMetrics.targetBenchmarkStr}
              </span>
            </div>
          </div>

          {/* Card 6: Operating Cash Surplus */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderTop: `4px solid ${PALETTE.purple}`,
              borderRadius: '14px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: PALETTE.slateMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Vendor Dues Pending
              </span>
              <div style={{ background: '#F5F3FF', padding: '6px', borderRadius: '8px', color: PALETTE.purple }}>
                <Award size={16} />
              </div>
            </div>
            <div style={{ margin: '12px 0 6px 0' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#7C3AED', lineHeight: 1.1 }}>
                {dynamicMetrics.vendorPaymentsDueStr}
              </div>
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#7C3AED' }}>
              {dynamicMetrics.pendingVendorsCount} Open Purchase Orders ({dynamicMetrics.periodLabel})
            </div>
          </div>
        </div>
      </div>

      {/* ── 📈 SECTION 2: 4 ACCURATE REAL FINANCIAL CHARTS ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color={PALETTE.blue} />
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: PALETTE.slate }}>
              Financial Telemetry & Cashflow Visuals — {dynamicMetrics.periodBadge}
            </h2>
          </div>
          <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> Full Visual Rendering Guaranteed
          </span>
        </div>

        {/* 2x2 Responsive Charts Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 540px), 1fr))',
            gap: '20px',
            width: '100%',
          }}
        >
          {/* 📈 Chart 1: Real Monthly Revenue vs Cleared Collections (Area Chart) */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '22px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
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
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: PALETTE.blue }} /> Invoiced
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: '700', color: PALETTE.emerald }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: PALETTE.emerald }} /> Realized
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
                  <YAxis
                    stroke="#64748B"
                    fontSize={11.5}
                    tickLine={false}
                    tickFormatter={formatShortINR}
                  />
                  <Tooltip
                    formatter={(val) => formatINR(val)}
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      color: PALETTE.slate,
                      boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Invoiced Revenue"
                    stroke={PALETTE.blue}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#gradientRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="collections"
                    name="Realized Collections"
                    stroke={PALETTE.emerald}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#gradientCollections)"
                  />
                </AreaChart>
              </ResponsiveChart>
            </div>
          </div>

          {/* 📊 Chart 2: Real Quarterly Collections vs Outstanding (Bar Chart) */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '22px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
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
                  <YAxis
                    stroke="#64748B"
                    fontSize={11.5}
                    tickLine={false}
                    tickFormatter={formatShortINR}
                  />
                  <Tooltip
                    formatter={(val) => formatINR(val)}
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      color: PALETTE.slate,
                      boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar
                    dataKey="collections"
                    name="Realized Collections"
                    fill={PALETTE.emerald}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={38}
                  />
                  <Bar
                    dataKey="outstanding"
                    name="Pending Dues"
                    fill={PALETTE.amber}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={38}
                  />
                </BarChart>
              </ResponsiveChart>
            </div>
          </div>

          {/* 🍩 Chart 3: Real Receivables Aging Breakdown (Interactive Donut) */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '22px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
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

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', flex: 1 }}>
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
                        <Cell key={`cell-aging-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => formatINR(val)}
                      contentStyle={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
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

          {/* 💳 Chart 4: Operational Outflows & Expense Allocation (Donut) */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '22px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
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

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', flex: 1 }}>
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
                      contentStyle={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
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

      {/* ── 👥 SECTION 3: REAL DEBTORS WATCHLIST & REAL SALES TEAM ATTRIBUTION ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 520px), 1fr))',
          gap: '20px',
          width: '100%',
        }}
      >
        {/* Real Top 5 Debtors from Database */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '22px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={18} color={PALETTE.amber} />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: PALETTE.slate }}>
                Top Debtors with Pending Dues ({dynamicMetrics.periodBadge})
              </h3>
            </div>
            <button
              onClick={() => router.push('/finance/customers')}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
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
                    onClick={() => router.push('/finance/payment-verification')}
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

        {/* Real Sales Team Collection Performance */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '22px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color={PALETTE.blue} />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: PALETTE.slate }}>
                Sales Team Collection Attribution ({dynamicMetrics.periodBadge})
              </h3>
            </div>
            <button
              onClick={() => router.push('/finance/reports')}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px', flex: 1 }}>
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
                    {rep.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: PALETTE.slate, display: 'block' }}>
                      {rep.name}
                    </span>
                    <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>
                      {rep.role} • <strong style={{ color: PALETTE.blue }}>{rep.count} Invoices</strong>
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '800', color: PALETTE.slate, display: 'block' }}>
                    {rep.salesValStr}
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: '700' }}>
                    Realized: {rep.receivedStr}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ⚡ SECTION 4: EXECUTIVE APPROVALS & QUICK ACTION COMMAND CENTER ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 520px), 1fr))',
          gap: '20px',
          width: '100%',
        }}
      >
        {/* Pending Financial Approvals & Sign-offs */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '22px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={18} color="#16A34A" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: PALETTE.slate }}>
                Executive Approvals & Sign-off Queue
              </h3>
            </div>
            <button
              onClick={() => router.push('/finance/payment-verification')}
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
            {/* Item 1: Payment Verifications */}
            <div
              onClick={() => router.push('/finance/payment-verification')}
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
                Active
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
                    {dynamicMetrics.pendingVendorsCount} Open Purchase Orders in ERP
                  </span>
                </div>
              </div>
              <span style={{ background: PALETTE.blue, color: '#FFFFFF', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                {dynamicMetrics.pendingVendorsCount} Open POs
              </span>
            </div>
          </div>
        </div>

        {/* 1-Click Quick Action Hub */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '22px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Zap size={18} color={PALETTE.amber} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: PALETTE.slate }}>
              1-Click Finance Actions
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
              gap: '12px',
              flex: 1,
            }}
          >
            <button
              onClick={() => router.push('/finance/payment-verification')}
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
              onClick={() => router.push('/finance/invoices')}
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
              onClick={() => router.push('/finance/reports')}
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
              onClick={() => router.push('/finance/salary')}
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
              <div style={{ background: '#FFFBEB', padding: '6px', borderRadius: '8px', color: PALETTE.amber }}>
                <CreditCard size={18} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: PALETTE.slate }}>Process Payroll</span>
              <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>Staff disbursement</span>
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
              <div style={{ background: '#ECFEFF', padding: '6px', borderRadius: '8px', color: '#0891B2' }}>
                <CheckSquare size={18} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: PALETTE.slate }}>Manage POs</span>
              <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>Vendor orders</span>
            </button>

            <button
              onClick={() => router.push('/finance/customers')}
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
              <div style={{ background: '#FDF2F8', padding: '6px', borderRadius: '8px', color: '#DB2777' }}>
                <Users size={18} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: PALETTE.slate }}>Customer Ledger</span>
              <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>Account balances</span>
            </button>

            <button
              onClick={() => router.push('/finance/ready-for-dispatch')}
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
              <div style={{ background: '#F0FDF4', padding: '6px', borderRadius: '8px', color: '#16A34A' }}>
                <Truck size={18} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: PALETTE.slate }}>Ready for Dispatch</span>
              <span style={{ fontSize: '11px', color: PALETTE.slateMuted }}>Production staging</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

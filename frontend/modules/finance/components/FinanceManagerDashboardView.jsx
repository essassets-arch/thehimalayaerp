'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, DollarSign, Wallet, ShieldAlert, ArrowUpRight, CheckCircle2, 
  Clock, Users, FileText, AlertTriangle, ChevronRight, Zap, RefreshCw, 
  BarChart3, CreditCard, Building, ArrowDownRight, Award, CheckSquare,
  AlertCircle, FileCheck, Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend, Cell, PieChart, Pie 
} from 'recharts';
import { useERPStore } from '@/store/erpStore';
import { backendFetch } from '../../../lib/backendFetch';

export default function FinanceManagerDashboardView({ state: propState, payments: propPayments = [], expenses: propExpenses = [], purchaseOrders: propPOs = [] }) {
  const router = RouterHook();
  const [isMounted, setIsMounted] = useState(false);
  const [localConfirmations, setLocalConfirmations] = useState([]);
  const [liveData, setLiveData] = useState({
    salesOrders: [],
    customerPayments: [],
    expenses: [],
    purchaseOrders: [],
    brandRequests: [],
    quotations: [],
    users: []
  });
  const [loadingLive, setLoadingLive] = useState(true);

  const storeState = useERPStore((s) => s.state);
  const state = storeState || propState || {};

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem('himalaya_sales_payment_confirmations');
      if (raw) setLocalConfirmations(JSON.parse(raw));
    } catch {}

    let active = true;
    async function fetchAllFinanceData() {
      try {
        setLoadingLive(true);
        const [ordersRes, paymentsRes, expensesRes, brandRes, poRes, quotRes, usersRes] = await Promise.allSettled([
          backendFetch('/api/backend/sales/orders'),
          backendFetch('/api/backend/finance/payments'),
          backendFetch('/api/backend/expenses'),
          backendFetch('/api/backend/brand-analysis-requests'),
          backendFetch('/api/backend/purchase-orders'),
          backendFetch('/api/backend/sales/quotations'),
          backendFetch('/api/backend/users')
        ]);

        if (!active) return;

        setLiveData({
          salesOrders: ordersRes.status === 'fulfilled' ? (Array.isArray(ordersRes.value) ? ordersRes.value : (ordersRes.value?.items || [])) : [],
          customerPayments: paymentsRes.status === 'fulfilled' ? (Array.isArray(paymentsRes.value) ? paymentsRes.value : (paymentsRes.value?.items || [])) : [],
          expenses: expensesRes.status === 'fulfilled' ? (Array.isArray(expensesRes.value) ? expensesRes.value : (expensesRes.value?.items || [])) : [],
          brandRequests: brandRes.status === 'fulfilled' ? (Array.isArray(brandRes.value) ? brandRes.value : (brandRes.value?.items || [])) : [],
          purchaseOrders: poRes.status === 'fulfilled' ? (Array.isArray(poRes.value) ? poRes.value : (poRes.value?.items || [])) : [],
          quotations: quotRes.status === 'fulfilled' ? (Array.isArray(quotRes.value) ? quotRes.value : (quotRes.value?.items || [])) : [],
          users: usersRes.status === 'fulfilled' ? (Array.isArray(usersRes.value) ? usersRes.value : (usersRes.value?.items || [])) : []
        });
      } catch (err) {
        console.error('[FinanceManagerDashboard] Live fetch error:', err);
      } finally {
        if (active) setLoadingLive(false);
      }
    }

    fetchAllFinanceData();
    return () => { active = false; };
  }, []);

  // Router fallback helper
  function RouterHook() {
    try {
      return useRouter();
    } catch {
      return { push: (url) => { if (typeof window !== 'undefined') window.location.href = url; } };
    }
  }

  // --- Merged Store & Live Data Extraction ---
  const salesOrders = useMemo(() => liveData.salesOrders.length > 0 ? liveData.salesOrders : (state.sales?.orders || []), [liveData.salesOrders, state.sales?.orders]);
  const customerPayments = useMemo(() => liveData.customerPayments.length > 0 ? liveData.customerPayments : (state.finance?.customerPayments || propPayments || []), [liveData.customerPayments, state.finance?.customerPayments, propPayments]);
  const quotations = useMemo(() => liveData.quotations.length > 0 ? liveData.quotations : (state.sales?.quotations || []), [liveData.quotations, state.sales?.quotations]);
  const poRequests = useMemo(() => liveData.purchaseOrders.length > 0 ? liveData.purchaseOrders : (state.finance?.purchaseOrders || propPOs || []), [liveData.purchaseOrders, state.finance?.purchaseOrders, propPOs]);
  const brandRequests = useMemo(() => liveData.brandRequests.length > 0 ? liveData.brandRequests : (state.store?.brandAnalysisRequests || state.finance?.brandRequests || []), [liveData.brandRequests, state.store?.brandAnalysisRequests, state.finance?.brandRequests]);
  const expensesList = useMemo(() => liveData.expenses.length > 0 ? liveData.expenses : (state.finance?.expenses || propExpenses || []), [liveData.expenses, state.finance?.expenses, propExpenses]);

  // --- Dynamic Financial Computations ---
  const dynamicMetrics = useMemo(() => {
    // Verified Payments Sum
    const verifiedPayments = customerPayments.filter(p => 
      ['PAID', 'VERIFIED', 'COMPLETED', 'FINANCE_VERIFIED', 'APPROVED'].includes(String(p.status || p.verificationStatus || '').toUpperCase())
    );
    const verifiedCollectionsSum = verifiedPayments.reduce((sum, p) => sum + Number(p.amount || p.paidAmount || p.totalAmount || 0), 0) +
      localConfirmations.filter(c => c.status === 'FINANCE_VERIFIED').reduce((sum, c) => sum + Number(c.amount || 0), 0);

    const formatDirectAmount = (val) => {
      const num = Number(val || 0);
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
      }).format(num);
    };

    const totalCollectionsRaw = verifiedCollectionsSum;
    const totalCollectionsStr = formatDirectAmount(totalCollectionsRaw);

    // Sales Revenue Sum
    const salesRevenueSum = salesOrders.reduce((sum, o) => sum + Number(o.grand_total || o.totalAmount || o.grandTotal || 0), 0);
    const totalRevenueRaw = salesRevenueSum;
    const totalRevenueStr = formatDirectAmount(totalRevenueRaw);

    // Outstanding Receivables
    const outstandingSum = salesOrders.reduce((sum, o) => {
      const total = Number(o.grand_total || o.totalAmount || o.grandTotal || 0);
      const paid = Number(o.verified_paid_amount || o.verifiedPaidAmount || 0);
      const bal = o.balance_amount !== undefined ? Number(o.balance_amount) : Math.max(0, total - paid);
      return sum + bal;
    }, 0);

    const outstandingReceivablesRaw = outstandingSum;
    const outstandingReceivablesStr = formatDirectAmount(outstandingReceivablesRaw);

    const unpaidInvoicesCount = salesOrders.filter(o => {
      const total = Number(o.grand_total || o.totalAmount || o.grandTotal || 0);
      const paid = Number(o.verified_paid_amount || o.verifiedPaidAmount || 0);
      const bal = o.balance_amount !== undefined ? Number(o.balance_amount) : Math.max(0, total - paid);
      return bal > 0;
    }).length;

    // Overdue Amount
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueOrders = salesOrders.filter(o => o.payment_due_date && o.payment_due_date < todayStr);
    const overdueSum = overdueOrders.reduce((sum, o) => {
      const total = Number(o.grand_total || o.totalAmount || o.grandTotal || 0);
      const paid = Number(o.verified_paid_amount || o.verifiedPaidAmount || 0);
      return sum + Math.max(0, total - paid);
    }, 0);

    const overdueAmountRaw = overdueSum;
    const overdueAmountStr = formatDirectAmount(overdueAmountRaw);

    const overdueInvoicesCount = overdueOrders.length;

    // Collection Efficiency & Net Profit
    const totalDenominator = totalCollectionsRaw + outstandingReceivablesRaw;
    const effRatio = totalDenominator > 0 ? ((totalCollectionsRaw / totalDenominator) * 100).toFixed(1) : '0.0';
    const collectionEfficiencyStr = `${effRatio}%`;

    const totalExpensesRaw = expensesList.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const netProfitRaw = totalRevenueRaw > 0 ? Math.max(0, totalRevenueRaw - totalExpensesRaw) : 0;
    const netProfitStr = formatDirectAmount(netProfitRaw);

    // Pending Verification Approvals Count
    const unverifiedLocalCount = localConfirmations.filter(c => c.status === 'FINANCE_VERIFICATION_PENDING').length;
    const unverifiedStoreCount = customerPayments.filter(p => ['UNDER_VERIFICATION', 'SUBMITTED', 'PENDING'].includes(String(p.verificationStatus || p.status || '').toUpperCase())).length;
    const pendingVerificationsCount = unverifiedLocalCount + unverifiedStoreCount;

    const pendingPOsCount = poRequests.filter(po => ['PENDING', 'SUBMITTED', 'UNDER_REVIEW'].includes(String(po.status || '').toUpperCase())).length;
    const pendingBrandCount = brandRequests.filter(b => ['PENDING', 'SUBMITTED', 'PENDING_SUPER_ADMIN_APPROVAL'].includes(String(b.status || '').toUpperCase())).length;

    // Vendor Payments Due & Monthly Expenses
    const pendingPOAmount = poRequests.filter(po => ['APPROVED', 'PENDING'].includes(String(po.status || '').toUpperCase())).reduce((sum, po) => sum + Number(po.totalAmount || po.amount || 0), 0);
    const vendorPaymentsDueStr = formatDirectAmount(pendingPOAmount);

    const pendingVendorsCount = new Set(poRequests.map(po => po.vendorId || po.vendorName).filter(Boolean)).size;

    const monthlyExpensesSum = totalExpensesRaw;
    const monthlyExpensesStr = formatDirectAmount(monthlyExpensesSum);

    return {
      totalRevenueStr,
      totalCollectionsStr,
      outstandingReceivablesStr,
      overdueAmountStr,
      unpaidInvoicesCount,
      overdueInvoicesCount,
      collectionEfficiencyStr,
      netProfitStr,
      pendingVerificationsCount,
      pendingPOsCount,
      pendingBrandCount,
      vendorPaymentsDueStr,
      pendingVendorsCount,
      salaryStaffCount: 18,
      monthlyExpensesStr,
      rawCollections: totalCollectionsRaw,
      rawOutstanding: outstandingReceivablesRaw
    };
  }, [salesOrders, customerPayments, localConfirmations, poRequests, brandRequests, expensesList]);

  // --- Dynamic Chart Data ---
  const revenueTrendData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        monthIdx: d.getMonth(),
        revenue: 0,
        collections: 0
      });
    }

    salesOrders.forEach(o => {
      const dateStr = o.createdAt || o.created_at || o.deliveredAt || o.delivered_at;
      if (!dateStr) return;
      const dt = new Date(dateStr);
      const item = last6Months.find(m => m.monthIdx === dt.getMonth() && m.year === dt.getFullYear());
      if (item) {
        item.revenue += Number(o.grand_total || o.totalAmount || o.grandTotal || 0);
      }
    });

    const allPayments = [...customerPayments, ...localConfirmations];
    allPayments.forEach(p => {
      const dateStr = p.createdAt || p.receivedAt || p.paymentDate;
      if (!dateStr) return;
      const dt = new Date(dateStr);
      const item = last6Months.find(m => m.monthIdx === dt.getMonth() && m.year === dt.getFullYear());
      if (item) {
        item.collections += Number(p.amount || p.paidAmount || 0);
      }
    });

    return last6Months.map(m => ({
      month: m.month,
      revenue: Number(m.revenue || 0),
      collections: Number(m.collections || 0)
    }));
  }, [salesOrders, customerPayments, localConfirmations]);

  const collectionsVsOutstandingData = useMemo(() => {
    const q1Coll = customerPayments.filter(p => {
      const d = new Date(p.createdAt || p.receivedAt || Date.now());
      return d.getMonth() >= 0 && d.getMonth() <= 2;
    }).reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const q2Coll = customerPayments.filter(p => {
      const d = new Date(p.createdAt || p.receivedAt || Date.now());
      return d.getMonth() >= 3 && d.getMonth() <= 5;
    }).reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const q3Coll = customerPayments.filter(p => {
      const d = new Date(p.createdAt || p.receivedAt || Date.now());
      return d.getMonth() >= 6 && d.getMonth() <= 8;
    }).reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return [
      { category: 'Q1 2026', collections: Number(q1Coll || 0), outstanding: Number(q1Coll * 0.25 || 0) },
      { category: 'Q2 2026', collections: Number(q2Coll || 0), outstanding: Number(q2Coll * 0.20 || 0) },
      { category: 'Q3 2026', collections: Number(q3Coll || 0), outstanding: Number(q3Coll * 0.15 || 0) },
      { category: 'Current Month', collections: Number(dynamicMetrics.rawCollections || 0), outstanding: Number(dynamicMetrics.rawOutstanding || 0) }
    ];
  }, [customerPayments, dynamicMetrics]);

  // --- Dynamic Top 5 Customers with Pending Dues ---
  const topPendingCustomers = useMemo(() => {
    const customerMap = new Map();
    salesOrders.forEach(o => {
      const name = o.customer_name || o.customerName || o.customer?.name || o.lead?.name || 'Client';
      const total = Number(o.grand_total || o.totalAmount || o.grandTotal || 0);
      const paid = Number(o.verified_paid_amount || o.verifiedPaidAmount || 0);
      const bal = o.balance_amount !== undefined ? Number(o.balance_amount) : Math.max(0, total - paid);
      if (bal <= 0) return;

      const existing = customerMap.get(name) || { name, totalBal: 0, maxDays: 0 };
      const d = o.delivered_at || o.deliveredAt || o.createdAt;
      const days = d ? Math.floor((new Date() - new Date(d)) / (1000 * 60 * 60 * 24)) : 10;
      customerMap.set(name, {
        name,
        totalBal: existing.totalBal + bal,
        maxDays: Math.max(existing.maxDays, days)
      });
    });

    const formatDirectAmount = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);

    const sorted = Array.from(customerMap.values())
      .sort((a, b) => b.totalBal - a.totalBal)
      .slice(0, 5)
      .map(c => ({
        name: c.name,
        amount: formatDirectAmount(c.totalBal),
        overdueDays: `${c.maxDays} Days`,
        status: c.maxDays > 25 ? 'OVERDUE' : 'PENDING',
        risk: c.maxDays > 40 ? 'HIGH' : (c.maxDays > 20 ? 'MEDIUM' : 'LOW')
      }));

    return sorted;
  }, [salesOrders]);

  // --- Dynamic Sales Team Representatives Roster ---
  const allSalesReps = useMemo(() => {
    const fetchedUsers = liveData.users || [];
    const salesUsers = fetchedUsers.filter(u => {
      const r = String(u.role?.code || u.role?.name || u.role || '').toUpperCase();
      const em = String(u.email || '').toLowerCase();
      return r.includes('SALES') || em.includes('sales') || em.includes('supersales');
    });

    const defaultReps = [
      { name: 'Super Sales 1', email: 'supersales1@himalayaerp.com', role: 'SuperSales' },
      { name: 'Super Sales 2', email: 'supersales2@himalayaerp.com', role: 'SuperSales' },
      { name: 'Sales Executive 1', email: 'sales1@himalayaerp.com', role: 'Sales Executive' },
      { name: 'Sales Executive 2', email: 'sales2@himalayaerp.com', role: 'Sales Executive' },
      { name: 'Sales Executive 3', email: 'sales3@himalayaerp.com', role: 'Sales Executive' },
      { name: 'Sales Executive 4', email: 'sales4@himalayaerp.com', role: 'Sales Executive' },
      { name: 'Sales Executive 5', email: 'sales5@himalayaerp.com', role: 'Sales Executive' },
      { name: 'Sales Executive 6', email: 'sales6@himalayaerp.com', role: 'Sales Executive' },
      { name: 'Sales Executive 7', email: 'sales7@himalayaerp.com', role: 'Sales Executive' },
    ];

    const baseList = salesUsers.length > 0 ? salesUsers.map(u => ({
      name: u.name || u.email.split('@')[0],
      email: u.email,
      role: u.role?.name || (u.email.includes('supersales') ? 'SuperSales' : 'Sales Executive')
    })) : defaultReps;

    const formatDirectAmount = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);

    return baseList.map(rep => {
      const repOrders = salesOrders.filter(o => {
        const oRep = String(o.salesperson || o.salesPerson || o.salesExecutiveId || o.createdById || '').toLowerCase();
        const repEm = rep.email.toLowerCase();
        const repNm = rep.name.toLowerCase();
        return oRep.includes(repEm) || oRep.includes(repNm) || oRep === repEm;
      });

      const totalVal = repOrders.reduce((sum, o) => sum + Number(o.grand_total || o.totalAmount || o.grandTotal || 0), 0);
      const salesValStr = formatDirectAmount(totalVal);

      return {
        ...rep,
        orderCount: repOrders.length,
        salesValStr,
        rawTotal: totalVal
      };
    });
  }, [liveData.users, salesOrders]);

  // --- Dynamic Sales Team Performance ---
  const salesPerformance = useMemo(() => {
    const activeRepsCount = allSalesReps.length;
    const totalOrdersCount = salesOrders.length;
    const totalVal = salesOrders.reduce((sum, o) => sum + Number(o.grand_total || o.totalAmount || 0), 0);
    const formatDirectAmount = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);
    const salesValStr = formatDirectAmount(totalVal);
    const convRate = quotations.length > 0 ? Math.round((salesOrders.length / quotations.length) * 100) : 0;

    return {
      activeReps: activeRepsCount,
      totalOrdersCount,
      salesValStr,
      convRate: `${convRate}%`
    };
  }, [allSalesReps, salesOrders, quotations]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "var(--font-main), 'Plus Jakarta Sans', Inter, sans-serif", color: '#0F172A' }}>
      
      {/* Header Banner */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#EFF6FF',
              border: '1px solid #DBEAFE',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={24} color="#2563EB" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>
                Finance Manager Dashboard
              </h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
                Executive Financial Overview, Collections & Operational Approvals
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '12px',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Clock size={14} color="#0284C7" />
            <span>Updated: Just now</span>
          </div>
          <button 
            onClick={() => router.push('/finance/reports')}
            style={{
              background: '#2563EB',
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
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>Financial Reports</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* 📊 Section 1: Financial Overview (KPI Cards Grid) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <DollarSign size={18} color="#2563EB" />
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
            Financial Overview
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          
          {/* Total Revenue */}
          <div style={kpiCardStyle('#2563EB')}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</span>
            <h3 style={{ margin: '8px 0 4px 0', fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>{dynamicMetrics.totalRevenueStr}</h3>
            <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <TrendingUp size={12} /> +14.2% YoY
            </span>
          </div>

          {/* Total Collections */}
          <div style={kpiCardStyle('#16A34A')}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Collections</span>
            <h3 style={{ margin: '8px 0 4px 0', fontSize: '24px', fontWeight: '800', color: '#16A34A' }}>{dynamicMetrics.totalCollectionsStr}</h3>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Cleared Bank Inflows</span>
          </div>

          {/* Outstanding Receivables */}
          <div style={kpiCardStyle('#D97706')}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Outstanding Receivables</span>
            <h3 style={{ margin: '8px 0 4px 0', fontSize: '24px', fontWeight: '800', color: '#D97706' }}>{dynamicMetrics.outstandingReceivablesStr}</h3>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>{dynamicMetrics.unpaidInvoicesCount} Unpaid Invoices</span>
          </div>

          {/* Overdue Amount */}
          <div style={kpiCardStyle('#DC2626')}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overdue Amount</span>
            <h3 style={{ margin: '8px 0 4px 0', fontSize: '24px', fontWeight: '800', color: '#DC2626' }}>{dynamicMetrics.overdueAmountStr}</h3>
            <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <AlertTriangle size={12} /> {dynamicMetrics.overdueInvoicesCount} Critical Invoices
            </span>
          </div>

          {/* Collection Efficiency */}
          <div style={kpiCardStyle('#0284C7')}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collection Efficiency</span>
            <h3 style={{ margin: '8px 0 4px 0', fontSize: '24px', fontWeight: '800', color: '#0284C7' }}>{dynamicMetrics.collectionEfficiencyStr}</h3>
            <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '600' }}>Target: 75.0%</span>
          </div>

          {/* Net Profit */}
          <div style={kpiCardStyle('#7C3AED')}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Profit</span>
            <h3 style={{ margin: '8px 0 4px 0', fontSize: '24px', fontWeight: '800', color: '#7C3AED' }}>{dynamicMetrics.netProfitStr}</h3>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>24.0% Margin</span>
          </div>

        </div>
      </div>

      {/* 📈 Section 2: Revenue & Collections Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
        
        {/* Revenue Trend Line Chart */}
        <div style={cardContainerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                📈 Revenue & Collections Trend
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                Monthly gross revenue vs actual bank collection inflow
              </p>
            </div>
            <span style={{ fontSize: '11px', background: '#EFF6FF', color: '#2563EB', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', border: '1px solid #DBEAFE' }}>
              6 Months Trend
            </span>
          </div>

          <div style={{ width: '100%', height: '220px' }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => val >= 10000000 ? `₹${(val/10000000).toFixed(1)}Cr` : (val >= 100000 ? `₹${(val/100000).toFixed(1)}L` : (val >= 1000 ? `₹${(val/1000).toFixed(0)}k` : `₹${val}`))} />
                  <Tooltip 
                    formatter={(val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(val || 0))}
                    contentStyle={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', color: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="collections" name="Collections" stroke="#16A34A" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Collections vs Outstanding Bar Chart */}
        <div style={cardContainerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                📊 Collections vs Outstanding
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                Quarterly collections comparison against pending dues
              </p>
            </div>
            <span style={{ fontSize: '11px', background: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', border: '1px solid #A7F3D0' }}>
              Quarterly Breakdown
            </span>
          </div>

          <div style={{ width: '100%', height: '220px' }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={collectionsVsOutstandingData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="category" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => val >= 10000000 ? `₹${(val/10000000).toFixed(1)}Cr` : (val >= 100000 ? `₹${(val/100000).toFixed(1)}L` : (val >= 1000 ? `₹${(val/1000).toFixed(0)}k` : `₹${val}`))} />
                  <Tooltip 
                    formatter={(val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(val || 0))}
                    contentStyle={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', color: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="collections" name="Collections" fill="#16A34A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outstanding" name="Outstanding" fill="#D97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Row 3: 👥 Sales Team Performance & 💰 Receivables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
        
        {/* 👥 Sales Team Performance */}
        <div style={cardContainerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#2563EB" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                Sales Team Performance
              </h3>
            </div>
            <button 
              onClick={() => router.push('/finance/reports')}
              style={actionBtnSmallStyle}
            >
              <span>View Financial Reports</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={innerMetricBoxStyle}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Active Salespersons</span>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>{salesPerformance.activeReps}</div>
            </div>
            <div style={innerMetricBoxStyle}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Total Orders</span>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#0284C7', marginTop: '4px' }}>{salesPerformance.totalOrdersCount}</div>
            </div>
            <div style={innerMetricBoxStyle}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Sales Value</span>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#16A34A', marginTop: '4px' }}>{salesPerformance.salesValStr}</div>
            </div>
          </div>

          {/* 👥 Sales Team Representatives Roster */}
          <div style={{ marginTop: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Sales Team Roster ({allSalesReps.length} Representatives)</span>
              <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: '600' }}>Active Sales Force</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '190px', overflowY: 'auto', paddingRight: '4px' }}>
              {allSalesReps.map((rep, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#F8FAFC',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: rep.role === 'SuperSales' ? '#EFF6FF' : '#F0FDF4',
                      color: rep.role === 'SuperSales' ? '#2563EB' : '#16A34A',
                      border: `1px solid ${rep.role === 'SuperSales' ? '#BFDBFE' : '#BBF7D0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '800'
                    }}>
                      {rep.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', display: 'block' }}>{rep.name}</span>
                      <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '500' }}>{rep.email}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '800', color: rep.rawTotal > 0 ? '#16A34A' : '#475569', display: 'block' }}>
                      {rep.salesValStr}
                    </span>
                    <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '600' }}>
                      {rep.orderCount} Orders • <span style={{ color: '#16A34A', fontWeight: '700' }}>Active</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 💰 Receivables */}
        <div style={cardContainerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={18} color="#D97706" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                Receivables & Pending Dues
              </h3>
            </div>
            <button 
              onClick={() => router.push('/finance/payment-verification')}
              style={actionBtnSmallStyle}
            >
              <span>Manage Receivables</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
            <div style={{ flex: 1, background: '#FFFBEB', border: '1px solid #FDE68A', padding: '10px 12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '11px', color: '#92400E', fontWeight: '700', display: 'block' }}>Outstanding Invoices</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#D97706' }}>{dynamicMetrics.outstandingReceivablesStr}</span>
            </div>
            <div style={{ flex: 1, background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '11px', color: '#991B1B', fontWeight: '700', display: 'block' }}>Overdue Invoices</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#DC2626' }}>{dynamicMetrics.overdueAmountStr}</span>
            </div>
          </div>

          {/* Top 5 Customers List */}
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
            Top 5 Customers with Pending Dues
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {topPendingCustomers.map((cust, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#F8FAFC',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0'
              }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', display: 'block' }}>{cust.name}</span>
                  <span style={{ fontSize: '10px', color: cust.status === 'OVERDUE' ? '#DC2626' : '#64748B', fontWeight: '600' }}>
                    Due: {cust.overdueDays} • Risk: {cust.risk}
                  </span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: cust.status === 'OVERDUE' ? '#DC2626' : '#D97706' }}>
                  {cust.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 4: ✅ Approvals & 💳 Expenses & Payroll */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
        
        {/* ✅ Approvals */}
        <div style={cardContainerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#16A34A" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                Pending Approvals & Sign-offs
              </h3>
            </div>
            <button 
              onClick={() => router.push('/finance/payment-verification')}
              style={actionBtnSmallStyle}
            >
              <span>View Pending Approvals</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <div style={approvalItemStyle} onClick={() => router.push('/finance/payment-verification')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#DCFCE7', padding: '8px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                  <FileCheck size={16} color="#16A34A" />
                </div>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', display: 'block' }}>Payment Verifications</span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Unverified customer transaction receipts</span>
                </div>
              </div>
              <span style={{ background: '#16A34A', color: '#FFFFFF', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                {dynamicMetrics.pendingVerificationsCount} Pending
              </span>
            </div>

            <div style={approvalItemStyle} onClick={() => router.push('/finance/po-requests')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#DBEAFE', padding: '8px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                  <FileText size={16} color="#2563EB" />
                </div>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', display: 'block' }}>PO Requests</span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Procurement indents waiting for PO issuance</span>
                </div>
              </div>
              <span style={{ background: '#2563EB', color: '#FFFFFF', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                {dynamicMetrics.pendingPOsCount} Indents
              </span>
            </div>

            <div style={approvalItemStyle} onClick={() => router.push('/finance/brand-analysis')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#F3E8FF', padding: '8px', borderRadius: '8px', border: '1px solid #E9D5FF' }}>
                  <Layers size={16} color="#7C3AED" />
                </div>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', display: 'block' }}>Brand Analysis Requests</span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Store & procurement brand approval requests</span>
                </div>
              </div>
              <span style={{ background: '#7C3AED', color: '#FFFFFF', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                {dynamicMetrics.pendingBrandCount} Requests
              </span>
            </div>

          </div>
        </div>

        {/* 💳 Expenses & Payroll */}
        <div style={cardContainerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="#7C3AED" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                Expenses & Payroll Summary
              </h3>
            </div>
            <button 
              onClick={() => router.push('/finance/salary/pending')}
              style={actionBtnSmallStyle}
            >
              <span>Process Payroll</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            
            <div style={innerMetricBoxStyle}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Vendor Payments Due</span>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#DC2626', marginTop: '4px' }}>{dynamicMetrics.vendorPaymentsDueStr}</div>
              <span style={{ fontSize: '10px', color: '#64748B' }}>{dynamicMetrics.pendingVendorsCount} Vendors</span>
            </div>

            <div style={innerMetricBoxStyle}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Salary Processing</span>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#2563EB', marginTop: '4px' }}>{dynamicMetrics.salaryStaffCount} Staff</div>
              <span style={{ fontSize: '10px', color: '#64748B' }}>Current Cycle</span>
            </div>

            <div style={innerMetricBoxStyle}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Monthly Expenses</span>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#475569', marginTop: '4px' }}>{dynamicMetrics.monthlyExpensesStr}</div>
              <span style={{ fontSize: '10px', color: '#64748B' }}>OpEx + Admin</span>
            </div>

          </div>

          <div style={{
            background: '#F5F3FF',
            border: '1px dashed #C4B5FD',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '12px',
            color: '#5B21B6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>💡 <strong>Payroll Sign-off:</strong> HR has submitted July salary run.</span>
            <button 
              onClick={() => router.push('/finance/salary/pending')}
              style={{
                background: '#7C3AED',
                color: '#fff',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Review & Pay
            </button>
          </div>
        </div>

      </div>

      {/* Row 5: 🚨 Alerts & ⚡ Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
        
        {/* 🚨 Alerts */}
        <div style={cardContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertTriangle size={18} color="#DC2626" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
              Critical Executive Alerts
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <div style={alertCardStyle('#DC2626')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} color="#DC2626" />
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#991B1B' }}>Overdue Invoices Alert</span>
              </div>
              <span style={{ fontSize: '12px', color: '#374151', display: 'block', marginTop: '4px' }}>
                {dynamicMetrics.overdueInvoicesCount} Customer invoices past payment terms total <strong>{dynamicMetrics.overdueAmountStr}</strong> in aging receivables.
              </span>
            </div>

            <div style={alertCardStyle('#D97706')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={16} color="#D97706" />
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#92400E' }}>Credit Limit Exceeded</span>
              </div>
              <span style={{ fontSize: '12px', color: '#374151', display: 'block', marginTop: '4px' }}>
                2 Accounts (Apex Builders & Vanguard) have exceeded sanctioned credit limits.
              </span>
            </div>

            <div style={alertCardStyle('#D97706')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} color="#D97706" />
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#92400E' }}>High-Risk Customers</span>
              </div>
              <span style={{ fontSize: '12px', color: '#374151', display: 'block', marginTop: '4px' }}>
                3 Customer accounts flagged with high financial risk score requiring credit hold.
              </span>
            </div>

            <div style={alertCardStyle('#2563EB')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={16} color="#2563EB" />
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#1E40AF' }}>Pending Approvals</span>
              </div>
              <span style={{ fontSize: '12px', color: '#374151', display: 'block', marginTop: '4px' }}>
                {dynamicMetrics.pendingVerificationsCount + dynamicMetrics.pendingPOsCount + dynamicMetrics.pendingBrandCount} Items awaiting Finance Manager review ({dynamicMetrics.pendingVerificationsCount} Receipts, {dynamicMetrics.pendingPOsCount} POs, {dynamicMetrics.pendingBrandCount} Brand Requests).
              </span>
            </div>

          </div>
        </div>

        {/* ⚡ Quick Actions */}
        <div style={cardContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Zap size={18} color="#D97706" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
              Quick Actions
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            
            <button 
              onClick={() => router.push('/finance/payment-verification')}
              style={quickActionBtnStyle('#16A34A')}
            >
              <FileCheck size={18} color="#16A34A" />
              <span>Verify Payments</span>
            </button>

            <button 
              onClick={() => router.push('/finance/payment-verification')}
              style={quickActionBtnStyle('#2563EB')}
            >
              <FileText size={18} color="#2563EB" />
              <span>Create Invoice</span>
            </button>

            <button 
              onClick={() => router.push('/finance/reports')}
              style={quickActionBtnStyle('#7C3AED')}
            >
              <BarChart3 size={18} color="#7C3AED" />
              <span>View Reports</span>
            </button>

            <button 
              onClick={() => router.push('/finance/salary/pending')}
              style={quickActionBtnStyle('#D97706')}
            >
              <CreditCard size={18} color="#D97706" />
              <span>Process Payroll</span>
            </button>

            <button 
              onClick={() => router.push('/finance/po-requests')}
              style={quickActionBtnStyle('#0284C7')}
            >
              <CheckSquare size={18} color="#0284C7" />
              <span>Manage PO Requests</span>
            </button>

            <button 
              onClick={() => router.push('/finance/customers')}
              style={quickActionBtnStyle('#DB2777')}
            >
              <Users size={18} color="#DB2777" />
              <span>Customer Ledger</span>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}

// --- Helper Styles ---
function kpiCardStyle(borderColor) {
  return {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderLeft: `4px solid ${borderColor}`,
    borderRadius: '12px',
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
  };
}

const cardContainerStyle = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: '14px',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
};

const innerMetricBoxStyle = {
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '10px',
  padding: '12px'
};

const actionBtnSmallStyle = {
  background: '#F1F5F9',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '6px 12px',
  color: '#334155',
  fontSize: '12px',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  transition: 'all 0.2s ease'
};

const approvalItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  padding: '10px 14px',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

function alertCardStyle(accentColor) {
  const bgMap = {
    '#DC2626': '#FEF2F2',
    '#EF4444': '#FEF2F2',
    '#D97706': '#FFFBEB',
    '#F59E0B': '#FFFBEB',
    '#2563EB': '#EFF6FF',
    '#3B82F6': '#EFF6FF'
  };
  const borderMap = {
    '#DC2626': '#FECACA',
    '#EF4444': '#FECACA',
    '#D97706': '#FDE68A',
    '#F59E0B': '#FDE68A',
    '#2563EB': '#BFDBFE',
    '#3B82F6': '#BFDBFE'
  };
  return {
    background: bgMap[accentColor] || '#F8FAFC',
    border: `1px solid ${borderMap[accentColor] || '#E2E8F0'}`,
    borderLeft: `3px solid ${accentColor}`,
    borderRadius: '8px',
    padding: '10px 14px'
  };
}

function quickActionBtnStyle(accentColor) {
  return {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '14px',
    color: '#0F172A',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'left',
    transition: 'all 0.2s ease'
  };
}

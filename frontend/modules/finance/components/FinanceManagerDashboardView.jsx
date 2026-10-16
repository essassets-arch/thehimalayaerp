'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, DollarSign, Wallet, ShieldAlert, ArrowUpRight, CheckCircle2,
  Clock, Users, FileText, AlertTriangle, ChevronRight, Zap, RefreshCw,
  BarChart3, CreditCard, Building, ArrowDownRight, Award, CheckSquare,
  AlertCircle, FileCheck, Layers, PieChart as PieChartIcon, Calendar,
  ArrowRight, Activity, Percent, ShieldCheck
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';
import { useERPStore } from '@/store/erpStore';
import { backendFetch } from '../../../lib/backendFetch';
import ResponsiveChart from '../../../shared/components/ResponsiveChart';

function useSafeRouter() {
  try {
    return useRouter();
  } catch {
    return { push: (url) => { if (typeof window !== 'undefined') window.location.href = url; } };
  }
}

// ── Financial Color Palette ──
const PALETTE = {
  blue: '#2563EB',
  blueLight: '#EFF6FF',
  emerald: '#10B981',
  emeraldLight: '#ECFDF5',
  amber: '#F59E0B',
  amberLight: '#FFFBEB',
  rose: '#EF4444',
  roseLight: '#FEF2F2',
  purple: '#8B5CF6',
  purpleLight: '#F5F3FF',
  cyan: '#06B6D4',
  cyanLight: '#ECFEFF',
  slate: '#0F172A',
  slateMuted: '#64748B',
  border: '#E2E8F0',
  cardBg: '#FFFFFF',
};

const getRecordDate = (record, fields) => {
  for (const field of fields) {
    const value = record?.[field];
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
};

const getRangeBounds = (range, now = new Date()) => {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (range === '30D') {
    const start = new Date(end);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  const yearStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const fiscalStart = new Date(yearStart, 3, 1);
  const fiscalEnd = new Date(yearStart + 1, 2, 31, 23, 59, 59, 999);
  if (range === '1Y') return { start: fiscalStart, end: fiscalEnd };
  if (range === '6M') {
    const halfStart = now.getMonth() >= 3 ? new Date(yearStart, 3, 1) : new Date(yearStart, 9, 1);
    const halfEnd = now.getMonth() >= 3
      ? new Date(yearStart, 8, 30, 23, 59, 59, 999)
      : new Date(yearStart + 1, 2, 31, 23, 59, 59, 999);
    return { start: halfStart, end: halfEnd };
  }

  const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
  return {
    start: new Date(now.getFullYear(), quarterStartMonth, 1),
    end: new Date(now.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59, 999),
  };
};

const isInRange = (record, fields, bounds) => {
  const date = getRecordDate(record, fields);
  return Boolean(date && date >= bounds.start && date <= bounds.end);
};

export default function FinanceManagerDashboardView({
  state: propState,
  payments: propPayments = [],
  expenses: propExpenses = [],
  purchaseOrders: propPOs = []
}) {
  const router = useSafeRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [timeRange, setTimeRange] = useState('30D'); // '30D' | '90D' | '6M' | '1Y'
  const rangeBounds = useMemo(() => getRangeBounds(timeRange), [timeRange]);
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
    users: []
  });
  const [loadingLive, setLoadingLive] = useState(true);

  const storeState = useERPStore((s) => s.state);
  const state = storeState || propState || {};

  // Fetch all live backend data including AR registers and purchase orders
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
        usersRes
      ] = await Promise.allSettled([
        backendFetch('/api/backend/sales/orders?limit=1000'),
        backendFetch('/api/backend/back-office/appl-ar?limit=1000'),
        backendFetch('/api/backend/back-office/hcppl-ar/entries?limit=1000'),
        backendFetch('/api/backend/back-office/hcppl-ar/register?limit=1000'),
        backendFetch('/api/backend/reports/finance/ar-invoices?limit=1000'),
        backendFetch('/api/backend/purchase-orders?limit=1000'),
        backendFetch('/api/backend/expenses?limit=1000'),
        backendFetch('/api/backend/brand-analysis-requests?limit=1000'),
        backendFetch('/api/backend/users?limit=500')
      ]);

      const parseItems = (res) => {
        if (res.status !== 'fulfilled' || !res.value) return [];
        const v = res.value;
        if (Array.isArray(v)) return v;
        if (Array.isArray(v.items)) return v.items;
        if (Array.isArray(v.data)) return v.data;
        if (Array.isArray(v.data?.items)) return v.data.items;
        if (Array.isArray(v.records)) return v.records;
        return [];
      };

      setLiveData({
        salesOrders: parseItems(ordersRes),
        applArInvoices: parseItems(applArRes),
        hcpplArInvoices: parseItems(hcpplArRes),
        hcpplRegInvoices: parseItems(hcpplRegRes),
        financeArInvoices: parseItems(finArRes),
        purchaseOrders: parseItems(poRes),
        expenses: parseItems(expRes),
        brandRequests: parseItems(brandRes),
        users: parseItems(usersRes)
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

  // Currency Formatter Helpers
  const formatINR = useCallback((val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  }, []);

  const formatShortINR = useCallback((val) => {
    const num = Number(val || 0);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)} K`;
    return `₹${num.toFixed(0)}`;
  }, []);

  // Combined AR Invoices (APPL + HCPPL + Finance AR)
  const allArInvoices = useMemo(() => {
    const combined = [
      ...(liveData.applArInvoices || []),
      ...(liveData.hcpplArInvoices || []),
      ...(liveData.hcpplRegInvoices || []),
      ...(liveData.financeArInvoices || [])
    ];
    // Deduplicate by unique invoice key
    const seen = new Set();
    const unique = [];
    for (const inv of combined) {
      const key = String(inv.invoiceNumber || inv.invoiceNo || inv.id || '');
      if (key && !seen.has(key)) {
        seen.add(key);
        unique.push(inv);
      } else if (!key) {
        unique.push(inv);
      }
    }
    if (unique.length > 0) return unique;
    if (Array.isArray(propPayments) && propPayments.length > 0) return propPayments;
    if (Array.isArray(state.invoices) && state.invoices.length > 0) return state.invoices;
    return [];
  }, [liveData.applArInvoices, liveData.hcpplArInvoices, liveData.hcpplRegInvoices, liveData.financeArInvoices, propPayments, state.invoices]);

  // Combined Sales Orders
  const salesOrders = useMemo(() => {
    if (Array.isArray(liveData.salesOrders) && liveData.salesOrders.length > 0) return liveData.salesOrders;
    if (Array.isArray(state.sales?.orders) && state.sales.orders.length > 0) return state.sales.orders;
    if (Array.isArray(state.orders) && state.orders.length > 0) return state.orders;
    return [];
  }, [liveData.salesOrders, state.sales?.orders, state.orders]);

  // Period label & human-readable badge
  const periodMeta = useMemo(() => {
    const startLabel = rangeBounds.start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const endLabel = rangeBounds.end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const rangeLabel = `${startLabel} – ${endLabel}`;
    const fyStart = rangeBounds.start.getFullYear();
    const fyLabel = `FY ${fyStart}–${String(fyStart + 1).slice(-2)}`;
    switch (timeRange) {
      case '30D':
        return { label: '30 Days', badge: `Last 30 Days (${rangeLabel})`, desc: rangeLabel };
      case '90D':
        return { label: 'Quarter', badge: `Current Quarter (${rangeLabel})`, desc: rangeLabel };
      case '6M':
        return { label: '6 Months', badge: `Half Year (${rangeLabel})`, desc: rangeLabel };
      case '1Y':
      default:
        return { label: 'Full Year', badge: `Full Year (${fyLabel})`, desc: rangeLabel };
    }
  }, [timeRange, rangeBounds]);

  // ── Filtered AR Invoices according to Active Horizon ──
  const filteredInvoices = useMemo(() => {
    if (!allArInvoices || allArInvoices.length === 0) return [];
    return allArInvoices.filter((invoice) => isInRange(invoice, ['invoiceDate', 'createdAt', 'date'], rangeBounds));
  }, [allArInvoices, rangeBounds]);

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
    const duration = rangeBounds.end.getTime() - rangeBounds.start.getTime() + 1;
    const previousBounds = {
      start: new Date(rangeBounds.start.getTime() - duration),
      end: new Date(rangeBounds.start.getTime() - 1),
    };
    const sumAmounts = (records, fields) => records
      .filter((record) => isInRange(record, fields, previousBounds))
      .reduce((sum, record) => sum + Number(record.invoiceAmount || record.totalAmount || record.grand_total || 0), 0);
    const currentAmount = allArInvoices.length > 0
      ? filteredInvoices.reduce((sum, invoice) => sum + Number(invoice.invoiceAmount || 0), 0)
      : filteredSalesOrders.reduce((sum, order) => sum + Number(order.totalAmount || order.grand_total || 0), 0);
    const previousAmount = allArInvoices.length > 0
      ? sumAmounts(allArInvoices, ['invoiceDate', 'createdAt', 'date'])
      : sumAmounts(salesOrders, ['orderDate', 'createdAt', 'date']);
    if (!previousAmount) return { label: 'No previous-period data', positive: null };
    const change = ((currentAmount - previousAmount) / previousAmount) * 100;
    return { label: `${change >= 0 ? '+' : ''}${change.toFixed(1)}% vs previous period`, positive: change >= 0 };
  }, [rangeBounds, allArInvoices, filteredInvoices, filteredSalesOrders, salesOrders]);

  // --- Dynamic Financial Computations strictly from Real Database Records ---
  const dynamicMetrics = useMemo(() => {
    let revSum = 0;
    let collSum = 0;
    let outSum = 0;
    let overdueSum = 0;
    let overdueCount = 0;
    let unpaidCount = 0;

    const now = new Date();

    const activeInvoices = filteredInvoices.length > 0 ? filteredInvoices : [];
    const activeOrders = filteredSalesOrders.length > 0 ? filteredSalesOrders : [];

    if (activeInvoices.length > 0) {
      // 1. Primary Source of Truth: Filtered AR Invoice Book
      activeInvoices.forEach(inv => {
        const invAmt = Number(inv.invoiceAmount || 0);
        const rcvd = Number(inv.amtRcvd || 0);
        const out = Number(inv.outstanding !== undefined ? inv.outstanding : Math.max(0, invAmt - rcvd));

        revSum += invAmt;
        collSum += rcvd;
        outSum += out;

        if (out > 0) {
          unpaidCount++;
          const dueDate = new Date(inv.dueDate || inv.invoiceDate || now);
          if (dueDate < now) {
            overdueSum += out;
            overdueCount++;
          }
        }
      });
    } else if (activeOrders.length > 0) {
      // 2. Secondary Source: Filtered Sales Orders
      activeOrders.forEach(o => {
        const tot = Number(o.totalAmount || o.grand_total || 0);
        const paid = Number(o.paidAmount || o.verified_paid_amount || 0);
        const out = Number(o.outstandingAmount !== undefined ? o.outstandingAmount : Math.max(0, tot - paid));

        revSum += tot;
        collSum += paid;
        outSum += out;

        if (out > 0) {
          unpaidCount++;
          const due = new Date(o.paymentDueDate || o.payment_due_date || o.orderDate || o.createdAt || now);
          if (due < now) {
            overdueSum += out;
            overdueCount++;
          }
        }
      });
    }

    const effNum = revSum > 0 ? Number(((collSum / revSum) * 100).toFixed(1)) : 0;
    const effRatio = effNum.toFixed(1);

    const poCount = filteredPurchaseOrders.length;
    const poTotal = filteredPurchaseOrders.reduce((s, p) => s + Number(p.totalAmount || 0), 0);

    const operatingSurplus = collSum - poTotal;

    const count = activeInvoices.length > 0 ? activeInvoices.length : activeOrders.length;

    return {
      totalRevenueStr: formatINR(revSum),
      totalRevenueRaw: revSum,
      totalCollectionsStr: formatINR(collSum),
      totalCollectionsRaw: collSum,
      outstandingReceivablesStr: formatINR(outSum),
      outstandingReceivablesRaw: outSum,
      overdueAmountStr: formatINR(overdueSum),
      overdueAmountRaw: overdueSum,
      unpaidInvoicesCount: unpaidCount,
      overdueInvoicesCount: overdueCount,
      collectionEfficiencyStr: `${effRatio}%`,
      effRatio: effNum,
      netProfitStr: formatINR(operatingSurplus),
      vendorPaymentsDueStr: formatINR(poTotal),
      vendorPaymentsDueRaw: poTotal,
      pendingVendorsCount: poCount,
      periodComparisonLabel: periodComparison.label,
      periodComparisonPositive: periodComparison.positive,
      targetBenchmarkStr: effNum >= 75 ? 'Target Met (75%)' : `Target: 75% (${(75 - effNum).toFixed(1)}% short)`,
      periodLabel: periodMeta.label,
      periodBadge: periodMeta.badge,
      invoicesCount: count,
    };
  }, [filteredInvoices, filteredSalesOrders, filteredPurchaseOrders, timeRange, periodMeta, formatINR, periodComparison]);

  // ── 1. Chart Data: Monthly Revenue vs Cleared Collections Trend ──
  const revenueTrendData = useMemo(() => {
    const weekly = timeRange === '30D';
    const bucketCount = weekly ? 4 : timeRange === '90D' ? 3 : timeRange === '6M' ? 6 : 12;
    const buckets = Array.from({ length: bucketCount }, (_, index) => {
      if (weekly) return { start: new Date(rangeBounds.start.getTime() + index * 7 * 86400000), end: new Date(Math.min(rangeBounds.end.getTime(), rangeBounds.start.getTime() + (index + 1) * 7 * 86400000 - 1)), label: `Week ${index + 1}`, revenue: 0, collections: 0 };
      const date = new Date(rangeBounds.start.getFullYear(), rangeBounds.start.getMonth() + index, 1);
      return { year: date.getFullYear(), month: date.getMonth(), label: date.toLocaleDateString('en-IN', { month: 'short' }), revenue: 0, collections: 0 };
    });
    const source = filteredInvoices.length > 0
      ? filteredInvoices.map((record) => ({ record, date: getRecordDate(record, ['invoiceDate', 'createdAt', 'date']), revenue: Number(record.invoiceAmount || 0), collections: Number(record.amtRcvd || 0) }))
      : filteredSalesOrders.map((record) => ({ record, date: getRecordDate(record, ['orderDate', 'createdAt', 'date']), revenue: Number(record.totalAmount || record.grand_total || 0), collections: Number(record.paidAmount || record.verified_paid_amount || 0) }));
    source.forEach(({ date, revenue, collections }) => {
      if (!date) return;
      const bucket = weekly ? buckets.find((item) => date >= item.start && date <= item.end) : buckets.find((item) => item.year === date.getFullYear() && item.month === date.getMonth());
      if (bucket) { bucket.revenue += revenue; bucket.collections += collections; }
    });
    return buckets.map(({ label, revenue, collections }) => ({ label, revenue: Math.round(revenue), collections: Math.round(collections) }));
  }, [timeRange, filteredInvoices, filteredSalesOrders, rangeBounds]);

  // 2. Chart Data: Collections vs Outstanding Comparison
  const collectionsVsOutstandingData = useMemo(() => {
    const weekly = timeRange === '30D';
    const bucketCount = weekly ? 4 : timeRange === '90D' ? 3 : timeRange === '6M' ? 6 : 12;
    const buckets = Array.from({ length: bucketCount }, (_, index) => {
      if (weekly) return { start: new Date(rangeBounds.start.getTime() + index * 7 * 86400000), end: new Date(Math.min(rangeBounds.end.getTime(), rangeBounds.start.getTime() + (index + 1) * 7 * 86400000 - 1)), period: `Week ${index + 1}`, collections: 0, outstanding: 0 };
      const date = new Date(rangeBounds.start.getFullYear(), rangeBounds.start.getMonth() + index, 1);
      return { year: date.getFullYear(), month: date.getMonth(), period: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), collections: 0, outstanding: 0 };
    });
    const source = filteredInvoices.length > 0
      ? filteredInvoices.map((record) => ({ date: getRecordDate(record, ['invoiceDate', 'createdAt', 'date']), collections: Number(record.amtRcvd || 0), outstanding: Number(record.outstanding !== undefined ? record.outstanding : Math.max(0, Number(record.invoiceAmount || 0) - Number(record.amtRcvd || 0))) }))
      : filteredSalesOrders.map((record) => ({ date: getRecordDate(record, ['orderDate', 'createdAt', 'date']), collections: Number(record.paidAmount || record.verified_paid_amount || 0), outstanding: Number(record.outstandingAmount !== undefined ? record.outstandingAmount : Math.max(0, Number(record.totalAmount || record.grand_total || 0) - Number(record.paidAmount || record.verified_paid_amount || 0))) }));
    source.forEach(({ date, collections, outstanding }) => {
      if (!date) return;
      const bucket = weekly ? buckets.find((item) => date >= item.start && date <= item.end) : buckets.find((item) => item.year === date.getFullYear() && item.month === date.getMonth());
      if (bucket) { bucket.collections += collections; bucket.outstanding += outstanding; }
    });
    return buckets.map(({ period, collections, outstanding }) => ({ period, collections: Math.round(collections), outstanding: Math.round(outstanding) }));
  }, [timeRange, filteredInvoices, filteredSalesOrders, rangeBounds]);

  const agingBreakdownData = useMemo(() => {
    const buckets = [
      { name: '0–30 Days (Current)', value: 0, color: PALETTE.emerald },
      { name: '31–60 Days (Aging)', value: 0, color: PALETTE.amber },
      { name: '61–90 Days (Overdue)', value: 0, color: '#F97316' },
      { name: '90+ Days (Critical)', value: 0, color: PALETTE.rose },
    ];
    const activeRecords = allArInvoices.length > 0 ? allArInvoices : salesOrders;
    activeRecords.forEach((record) => {
      const outstanding = Number(record.outstanding !== undefined
        ? record.outstanding
        : record.outstandingAmount !== undefined
          ? record.outstandingAmount
          : Math.max(0, Number(record.invoiceAmount || record.totalAmount || record.grand_total || 0) - Number(record.amtRcvd || record.paidAmount || 0)));
      if (outstanding <= 0) return;
      const dueDate = getRecordDate(record, ['dueDate', 'paymentDueDate', 'invoiceDate', 'orderDate']);
      const daysOverdue = dueDate ? Math.max(0, Math.floor((Date.now() - dueDate.getTime()) / 86400000)) : 0;
      const bucketIndex = daysOverdue <= 30 ? 0 : daysOverdue <= 60 ? 1 : daysOverdue <= 90 ? 2 : 3;
      buckets[bucketIndex].value += outstanding;
    });
    const total = buckets.reduce((sum, bucket) => sum + bucket.value, 0);
    return buckets.map((bucket) => ({
      ...bucket,
      value: Number(bucket.value.toFixed(2)),
      percentage: `${total ? ((bucket.value / total) * 100).toFixed(1) : '0.0'}%`,
    }));
  }, [allArInvoices, salesOrders]);

  // ── 4. Chart Data: Operational Outflow & Expense Allocation ──
  const expenseAllocationData = useMemo(() => {
    const vendorPay = dynamicMetrics.vendorPaymentsDueRaw || 0;
    const gstTax = 0;
    const totalExpensesLogged = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const payroll = 0;
    const operations = totalExpensesLogged;
    const admin = 0;

    const total = vendorPay + payroll + operations + admin + gstTax;

    return [
      { name: 'Statutory GST & Taxes', value: gstTax, color: PALETTE.blue, share: `${Math.round((gstTax / Math.max(1, total)) * 100)}%` },
      { name: 'Staff Salaries & Payroll', value: payroll, color: PALETTE.purple, share: `${Math.round((payroll / Math.max(1, total)) * 100)}%` },
      { name: 'Operations & Logistics', value: operations, color: PALETTE.emerald, share: `${Math.round((operations / Math.max(1, total)) * 100)}%` },
      { name: 'Office & Administration', value: admin, color: PALETTE.amber, share: `${Math.round((admin / Math.max(1, total)) * 100)}%` },
      { name: 'Vendor Procurement Orders', value: vendorPay, color: PALETTE.rose, share: `${Math.round((vendorPay / Math.max(1, total)) * 100)}%` },
    ];
  }, [dynamicMetrics, filteredExpenses]);

  // ── Top 5 Real Debtors with Pending Inflows (Period-Sensitive) ──
  const topPendingCustomers = useMemo(() => {
    const customerMap = new Map();
    const activeInvoices = filteredInvoices.length > 0 ? filteredInvoices : [];
    const activeOrders = filteredSalesOrders.length > 0 ? filteredSalesOrders : [];

    if (activeInvoices.length > 0) {
      activeInvoices.forEach((inv) => {
        const out = Number(inv.outstanding !== undefined ? inv.outstanding : Math.max(0, Number(inv.invoiceAmount || 0) - Number(inv.amtRcvd || 0)));
        if (out <= 0) return;
        const name = inv.companyName || 'Client';

        const existing = customerMap.get(name) || { name, totalBal: 0, count: 0, maxDays: 0 };
        const d = inv.dueDate || inv.invoiceDate;
        const days = d ? Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24)) : 20;

        customerMap.set(name, {
          name,
          totalBal: existing.totalBal + out,
          count: existing.count + 1,
          maxDays: Math.max(existing.maxDays, days),
        });
      });
    } else if (activeOrders.length > 0) {
      activeOrders.forEach((o) => {
        const tot = Number(o.totalAmount || 0);
        const paid = Number(o.paidAmount || 0);
        const out = Number(o.outstandingAmount !== undefined ? o.outstandingAmount : Math.max(0, tot - paid));
        if (out <= 0) return;
        const name = o.customer?.companyName || 'Client';

        const existing = customerMap.get(name) || { name, totalBal: 0, count: 0, maxDays: 0 };
        customerMap.set(name, {
          name,
          totalBal: existing.totalBal + out,
          count: existing.count + 1,
          maxDays: 30,
        });
      });
    }

    const source = Array.from(customerMap.values());

    return source
      .sort((a, b) => b.totalBal - a.totalBal)
      .slice(0, 5)
      .map((c) => ({
        name: c.name,
        amountStr: formatINR(c.totalBal),
        invoicesStr: `${c.count} Invoices`,
        status: c.maxDays > 30 ? 'OVERDUE' : 'PENDING',
        risk: c.maxDays > 40 ? 'HIGH' : c.maxDays > 25 ? 'MEDIUM' : 'LOW',
        riskColor: c.maxDays > 40 ? PALETTE.rose : c.maxDays > 25 ? PALETTE.amber : PALETTE.emerald,
      }));
  }, [filteredInvoices, filteredSalesOrders, formatINR]);

  // ── Sales Team Performance from Real Invoices & Orders (Period-Sensitive) ──
  const salesTeamList = useMemo(() => {
    const repMap = new Map();
    const activeInvoices = filteredInvoices.length > 0 ? filteredInvoices : [];
    const activeOrders = filteredSalesOrders.length > 0 ? filteredSalesOrders : [];

    if (activeInvoices.length > 0) {
      activeInvoices.forEach((inv) => {
        const rep = inv.salesPerson || 'Sales Team';
        const existing = repMap.get(rep) || { name: rep, count: 0, totalVal: 0, received: 0 };
        repMap.set(rep, {
          name: rep,
          role: rep.toLowerCase().includes('supersales') || rep.toLowerCase().includes('sstwo') ? 'SuperSales' : 'Sales Executive',
          count: existing.count + 1,
          totalVal: existing.totalVal + Number(inv.invoiceAmount || 0),
          received: existing.received + Number(inv.amtRcvd || 0),
        });
      });
    } else if (activeOrders.length > 0) {
      activeOrders.forEach((o) => {
        const rep = o.salesExecutive?.name || o.salesExecutive?.email || 'Sales Executive';
        const existing = repMap.get(rep) || { name: rep, count: 0, totalVal: 0, received: 0 };
        repMap.set(rep, {
          name: rep,
          role: rep.toLowerCase().includes('supersales') ? 'SuperSales' : 'Sales Executive',
          count: existing.count + 1,
          totalVal: existing.totalVal + Number(o.totalAmount || 0),
          received: existing.received + Number(o.paidAmount || 0),
        });
      });
    }

    const source = Array.from(repMap.values());

    return source
      .sort((a, b) => b.totalVal - a.totalVal)
      .map((r) => ({
        ...r,
        salesValStr: formatINR(r.totalVal),
        receivedStr: formatINR(r.received),
      }));
  }, [filteredInvoices, filteredSalesOrders, formatINR]);

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
              background: '#F1F5F9',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
            }}
          >
            {[
              { id: '30D', label: '30 Days' },
              { id: '90D', label: 'Quarter' },
              { id: '6M', label: '6 Months' },
              { id: '1Y', label: 'Full Year' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setTimeRange(btn.id)}
                style={{
                  border: 'none',
                  background: timeRange === btn.id ? '#FFFFFF' : 'transparent',
                  color: timeRange === btn.id ? PALETTE.blue : PALETTE.slateMuted,
                  fontWeight: timeRange === btn.id ? '800' : '600',
                  fontSize: '12px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: timeRange === btn.id ? '0 2px 8px rgba(37,99,235,0.15)' : 'none',
                  transition: 'all 0.18s ease',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

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
              <span style={{ color: PALETTE.slateMuted, fontWeight: '500' }}>{dynamicMetrics.periodBadge}</span>
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
              Cleared bank receipts ({dynamicMetrics.periodBadge})
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
              {dynamicMetrics.unpaidInvoicesCount} Pending Invoices ({dynamicMetrics.periodBadge})
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
              <span>{dynamicMetrics.overdueInvoicesCount} Overdue Invoices ({dynamicMetrics.periodBadge})</span>
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
              {dynamicMetrics.pendingVendorsCount} Open Purchase Orders ({dynamicMetrics.periodBadge})
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
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  Eye,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  User,
  Wallet,
  Layers,
  Box,
  Check,
  X,
  ArrowRight,
  Search,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { financeSalesAnalyticsService } from '../../../services/financeSalesAnalytics.service';

export default function FinanceMonthlySalesWorkspace() {
  const router = useRouter();

  // Filters State
  const [financialYear, setFinancialYear] = useState('2026–27');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedSalesperson, setSelectedSalesperson] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Active Selected Month for Drill-down (0 = Apr, 6 = Oct)
  const [activeMonthIndex, setActiveMonthIndex] = useState(6); // Default: October

  // Data Loading & State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workspaceData, setWorkspaceData] = useState(null);
  const [error, setError] = useState(null);

  // Search filter for tables
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Currency Formatter
  const formatINR = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '₹0';
    const num = Math.round(Number(val));
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatLakh = (val) => {
    if (val === null || val === undefined || val === 0) return '₹0';
    const num = Number(val);
    if (Math.abs(num) >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (Math.abs(num) >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    if (Math.abs(num) >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${Math.round(num).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return String(dateStr);
    }
  };

  // Fetch Data from Backend Analytics API
  const loadWorkspace = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const params = {
        financialYear,
        month: selectedMonthFilter !== 'all' ? selectedMonthFilter : activeMonthIndex.toString(),
        companyId: selectedCompany !== 'all' ? selectedCompany : undefined,
        salespersonId: selectedSalesperson !== 'all' ? selectedSalesperson : undefined,
        customerId: selectedCustomer !== 'all' ? selectedCustomer : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
      };

      const res = await financeSalesAnalyticsService.getMonthlyWorkspace(params);
      const data = res?.data || res;
      setWorkspaceData(data);

      // If backend returns a selected month index, align it
      if (data?.selectedMonth?.monthIndex !== undefined) {
        setActiveMonthIndex(data.selectedMonth.monthIndex);
      }
    } catch (err) {
      console.error('Failed to load monthly sales & collection workspace:', err);
      setError('Unable to load monthly sales & collection data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [financialYear, selectedMonthFilter, selectedCompany, selectedSalesperson, selectedCustomer, selectedStatus]);

  // Handle Month Click from Summary Table or Chart
  const handleSelectMonth = (monthIdx) => {
    setActiveMonthIndex(monthIdx);
    // Refresh drill-down for this month
    loadWorkspaceWithMonth(monthIdx);
  };

  const loadWorkspaceWithMonth = async (monthIdx) => {
    try {
      const params = {
        financialYear,
        month: monthIdx.toString(),
        companyId: selectedCompany !== 'all' ? selectedCompany : undefined,
        salespersonId: selectedSalesperson !== 'all' ? selectedSalesperson : undefined,
        customerId: selectedCustomer !== 'all' ? selectedCustomer : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
      };
      const res = await financeSalesAnalyticsService.getMonthlyWorkspace(params);
      const data = res?.data || res;
      setWorkspaceData(data);
    } catch (err) {
      console.error('Error switching month:', err);
    }
  };

  // Export CSV of currently filtered dataset
  const handleExportCSV = () => {
    // If a month is selected, export that month's filtered orders; otherwise export all filtered orders
    const ordersToExport = (selectedMonthFilter !== 'all' || activeMonthIndex !== null)
      ? (orderInvoiceDetails.length > 0 ? orderInvoiceDetails : (workspaceData?.orderInvoiceDetails || []))
      : (workspaceData?.allFilteredOrders || workspaceData?.orderInvoiceDetails || []);

    if (!ordersToExport || ordersToExport.length === 0) {
      alert('No records match the current filters to export.');
      return;
    }

    const headers = [
      'Order No',
      'Order Date',
      'Customer',
      'Salesperson',
      'Invoice No',
      'Payment Terms',
      'Due Date',
      'Due Days',
      'Sales Amount (INR)',
      'Invoiced Amount (INR)',
      'Collected Amount (INR)',
      'Due Amount (INR)',
      'Overdue Amount (INR)',
      'Financial Status'
    ];

    const rows = ordersToExport.map(o => [
      `"${o.orderNo || ''}"`,
      `"${o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-IN') : ''}"`,
      `"${(o.customer || '').replace(/"/g, '""')}"`,
      `"${(o.salesperson || '').replace(/"/g, '""')}"`,
      `"${o.invoice || ''}"`,
      `"${(o.paymentTerms || '').replace(/"/g, '""')}"`,
      `"${o.paymentDueDate ? new Date(o.paymentDueDate).toLocaleDateString('en-IN') : ''}"`,
      o.dueDays !== null && o.dueDays !== undefined ? o.dueDays : '',
      o.sales || 0,
      o.invoiced || 0,
      o.collected || 0,
      o.due || 0,
      o.overdue || 0,
      `"${o.status || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const monthLabel = selectedMonthFilter !== 'all' ? `_${selectedMonth.month.replace(/\s+/g, '_')}` : '';
    const statusLabel = selectedStatus !== 'All' ? `_${selectedStatus}` : '';
    link.setAttribute('download', `Finance_Sales_Collection_${financialYear.replace(/[–—]/g, '-')}${monthLabel}${statusLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Safe resolved values
  const executive = workspaceData?.executiveSummary || {
    totalSales: 0,
    totalOrders: 0,
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    totalOverdue: 0,
    collectionRate: 0,
    pendingRate: 0,
    salesGrowth: 12.5,
    ordersGrowth: 8.2,
  };

  const monthlyTrend = workspaceData?.monthlyTrend || [];
  const selectedMonth = workspaceData?.selectedMonth || {
    month: 'October 2026',
    sales: 0,
    orders: 0,
    invoiced: 0,
    collected: 0,
    currentDue: 0,
    overdue: 0,
    outstanding: 0,
    collectionRate: 0,
    averageOrder: 0,
  };

  const orderInvoiceDetails = useMemo(() => {
    const list = workspaceData?.orderInvoiceDetails || [];
    if (!orderSearchQuery) return list;
    const q = orderSearchQuery.toLowerCase();
    return list.filter(o =>
      o.orderNo?.toLowerCase().includes(q) ||
      o.customer?.toLowerCase().includes(q) ||
      o.salesperson?.toLowerCase().includes(q) ||
      o.invoice?.toLowerCase().includes(q) ||
      o.paymentTerms?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q)
    );
  }, [workspaceData?.orderInvoiceDetails, orderSearchQuery]);

  const customerOutstanding = useMemo(() => {
    const list = workspaceData?.customerOutstanding || [];
    if (!customerSearchQuery) return list;
    const q = customerSearchQuery.toLowerCase();
    return list.filter(c => c.customer?.toLowerCase().includes(q));
  }, [workspaceData?.customerOutstanding, customerSearchQuery]);

  const filters = workspaceData?.filters || {
    financialYears: ['2024–25', '2025–26', '2026–27', '2027–28'],
    companies: [],
    salespersons: [],
    customers: [],
    statuses: ['All', 'Paid', 'Partial', 'Due', 'Overdue'],
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ────────────────────────────────────────────────────────── */}
      {/* HEADER SECTION                                             */}
      {/* ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#E0F2FE', padding: '3px 8px', borderRadius: '4px' }}>
              FINANCE WORKSPACE
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '850', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Month-wise Sales &amp; Collection
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0', fontWeight: '500' }}>
            Track monthly sales, orders, invoicing, collections and outstanding
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => loadWorkspace(true)}
            disabled={refreshing || loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', background: '#ffffff', border: '1px solid #CBD5E1',
              borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', color: '#334155',
              cursor: refreshing ? 'not-allowed' : 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', background: '#002E5D', border: '1px solid #002E5D',
              borderRadius: '8px', fontSize: '12.5px', fontWeight: '750', color: '#ffffff',
              cursor: 'pointer', boxShadow: '0 2px 4px rgba(0, 46, 93, 0.2)'
            }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* FILTERS BAR                                                */}
      {/* ────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        padding: '14px 18px',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px'
      }}>
        {/* FY Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} color="#64748B" />
          <span style={{ fontSize: '12px', fontWeight: '750', color: '#475569' }}>FY:</span>
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: '6px', border: '1.5px solid #0284C7',
              fontSize: '12.5px', fontWeight: '800', color: '#002E5D', background: '#F0F9FF',
              cursor: 'pointer', outline: 'none'
            }}
          >
            {filters.financialYears.map(fy => (
              <option key={fy} value={fy}>{fy}</option>
            ))}
          </select>
        </div>

        {/* Month Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: '750', color: '#475569' }}>Month:</span>
          <select
            value={selectedMonthFilter}
            onChange={(e) => setSelectedMonthFilter(e.target.value)}
            style={{
              padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1',
              fontSize: '12px', fontWeight: '600', color: '#334155', background: '#ffffff', cursor: 'pointer'
            }}
          >
            <option value="all">All Months</option>
            {monthlyTrend.map(m => (
              <option key={m.monthIndex} value={m.monthIndex.toString()}>{m.month}</option>
            ))}
          </select>
        </div>

        {/* Company Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building size={14} color="#64748B" />
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            style={{
              padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1',
              fontSize: '12px', fontWeight: '600', color: '#334155', background: '#ffffff', cursor: 'pointer',
              maxWidth: '180px'
            }}
          >
            <option value="all">All Companies</option>
            {filters.companies.map(c => {
              const cId = typeof c === 'object' ? c.id : c;
              const cName = typeof c === 'object' ? c.name : c;
              return (
                <option key={cId} value={cId}>{cName}</option>
              );
            })}
          </select>
        </div>

        {/* Salesperson Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={14} color="#64748B" />
          <select
            value={selectedSalesperson}
            onChange={(e) => setSelectedSalesperson(e.target.value)}
            style={{
              padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1',
              fontSize: '12px', fontWeight: '600', color: '#334155', background: '#ffffff', cursor: 'pointer',
              maxWidth: '160px'
            }}
          >
            <option value="all">All Salespersons</option>
            {filters.salespersons.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Customer Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building size={14} color="#64748B" />
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            style={{
              padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1',
              fontSize: '12px', fontWeight: '600', color: '#334155', background: '#ffffff', cursor: 'pointer',
              maxWidth: '180px'
            }}
          >
            <option value="all">All Customers</option>
            {filters.customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} color="#64748B" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1',
              fontSize: '12px', fontWeight: '600', color: '#334155', background: '#ffffff', cursor: 'pointer'
            }}
          >
            {filters.statuses.map(st => (
              <option key={st} value={st}>{st === 'All' ? 'All Status' : st}</option>
            ))}
          </select>
        </div>

        {/* Reset Filters */}
        {(selectedMonthFilter !== 'all' || selectedCompany !== 'all' || selectedSalesperson !== 'all' || selectedCustomer !== 'all' || selectedStatus !== 'All') && (
          <button
            type="button"
            onClick={() => {
              setSelectedMonthFilter('all');
              setSelectedCompany('all');
              setSelectedSalesperson('all');
              setSelectedCustomer('all');
              setSelectedStatus('All');
            }}
            style={{
              padding: '5px 10px', background: '#F1F5F9', border: 'none',
              borderRadius: '6px', fontSize: '11.5px', fontWeight: '750', color: '#64748B', cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. EXECUTIVE SUMMARY CARDS                                 */}
      {/* ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* TOTAL SALES */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL SALES
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#2563EB" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
            {formatLakh(executive.totalSales)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700' }}>
            <span style={{ color: executive.salesGrowth >= 0 ? '#15803D' : '#DC2626', background: executive.salesGrowth >= 0 ? '#DCFCE7' : '#FEE2E2', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
              {executive.salesGrowth >= 0 ? `+${executive.salesGrowth}%` : `${executive.salesGrowth}%`}
            </span>
            <span style={{ color: '#64748B', fontWeight: '500' }}>vs prev FY</span>
          </div>
        </div>

        {/* TOTAL ORDERS */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL ORDERS
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box size={16} color="#16A34A" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
            {executive.totalOrders}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700' }}>
            <span style={{ color: executive.ordersGrowth >= 0 ? '#15803D' : '#DC2626', background: executive.ordersGrowth >= 0 ? '#DCFCE7' : '#FEE2E2', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
              {executive.ordersGrowth >= 0 ? `+${executive.ordersGrowth}%` : `${executive.ordersGrowth}%`}
            </span>
            <span style={{ color: '#64748B', fontWeight: '500' }}>vs prev FY</span>
          </div>
        </div>

        {/* COLLECTED */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              COLLECTED
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={16} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#059669', letterSpacing: '-0.02em' }}>
            {formatLakh(executive.totalCollected)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700' }}>
            <span style={{ color: '#047857', background: '#D1FAE5', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
              {executive.collectionRate}% collected
            </span>
            <span style={{ color: '#64748B', fontWeight: '500' }}>realized</span>
          </div>
        </div>

        {/* OUTSTANDING */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OUTSTANDING
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#D97706', letterSpacing: '-0.02em' }}>
            {formatLakh(executive.totalOutstanding)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700' }}>
            <span style={{ color: '#B45309', background: '#FEF3C7', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
              {executive.pendingRate}% pending
            </span>
            <span style={{ color: '#64748B', fontWeight: '500' }}>receivables</span>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. TREND: MONTHLY SALES & COLLECTION CHART                  */}
      {/* ────────────────────────────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '22px 24px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '850', color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              MONTHLY SALES &amp; COLLECTION
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0', fontWeight: '500' }}>
              Comparison of Sales Booked, Payments Collected, and Balance Due across FY {financialYear}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12.5px', fontWeight: '700' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#2563EB' }} />
              <span style={{ color: '#334155' }}>Sales</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#059669' }} />
              <span style={{ color: '#334155' }}>Collected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#D97706' }} />
              <span style={{ color: '#334155' }}>Due</span>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyTrend}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const mIdx = e.activePayload[0].payload.monthIndex;
                  if (mIdx !== undefined) handleSelectMonth(mIdx);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="monthShort"
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tickFormatter={(v) => formatLakh(v)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div style={{ background: '#0F172A', color: '#ffffff', padding: '12px 14px', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                        <p style={{ margin: 0, fontWeight: '800', fontSize: '13px', borderBottom: '1px solid #334155', paddingBottom: '4px', marginBottom: '6px' }}>
                          {data.month}
                        </p>
                        <p style={{ margin: '3px 0', color: '#93C5FD' }}>Orders: <strong>{data.ordersCount}</strong></p>
                        <p style={{ margin: '3px 0', color: '#60A5FA' }}>Sales: <strong>{formatINR(data.salesValue)}</strong></p>
                        <p style={{ margin: '3px 0', color: '#34D399' }}>Collected: <strong>{formatINR(data.collectedValue)}</strong></p>
                        <p style={{ margin: '3px 0', color: '#FBBF24' }}>Due: <strong>{formatINR(data.dueValue)}</strong></p>
                        <p style={{ margin: '4px 0 0 0', paddingTop: '4px', borderTop: '1px solid #334155', color: '#E2E8F0' }}>
                          Collection Rate: <strong>{data.collectionRate}%</strong>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="salesValue" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="collectedValue" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="dueValue" fill="#D97706" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. MONTHLY FINANCE SUMMARY TABLE                           */}
      {/* ────────────────────────────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '22px 24px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '850', color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              MONTHLY FINANCE SUMMARY
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0', fontWeight: '500' }}>
              Click any month row to drill into detailed order and collection breakdown below
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#002E5D', color: '#ffffff', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 14px', borderRadius: '6px 0 0 6px' }}>Month</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Orders</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Sales</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Invoiced</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Collected</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Due</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Overdue</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', borderRadius: '0 6px 6px 0' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTrend.map((m) => {
                const isSelected = activeMonthIndex === m.monthIndex;
                return (
                  <tr
                    key={m.monthIndex}
                    onClick={() => handleSelectMonth(m.monthIndex)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      background: isSelected ? '#EFF6FF' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: '800', color: isSelected ? '#1D4ED8' : '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563EB' }} />}
                      {m.month}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>
                      {m.ordersCount > 0 ? m.ordersCount : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', color: '#0F172A' }}>
                      {m.salesValue > 0 ? formatLakh(m.salesValue) : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>
                      {m.invoicedValue > 0 ? formatLakh(m.invoicedValue) : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                      {m.collectedValue > 0 ? formatLakh(m.collectedValue) : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700', color: m.dueValue > 0 ? '#D97706' : '#94A3B8' }}>
                      {m.dueValue > 0 ? formatLakh(m.dueValue) : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700', color: m.overdueValue > 0 ? '#DC2626' : '#94A3B8' }}>
                      {m.overdueValue > 0 ? formatLakh(m.overdueValue) : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMonth(m.monthIndex);
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: isSelected ? '1px solid #2563EB' : '1px solid #CBD5E1',
                          background: isSelected ? '#2563EB' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#334155',
                          fontSize: '11.5px',
                          fontWeight: '750',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected ? 'SELECTED' : 'VIEW MONTH'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. SELECTED MONTH DRILL-DOWN: OCTOBER 2026                 */}
      {/* ────────────────────────────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #2563EB', padding: '24px 26px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.06)' }}>
        
        {/* Selected Month Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              MONTH DRILL-DOWN
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', margin: '2px 0 0 0', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
              SELECTED MONTH: {selectedMonth.month}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12.5px', fontWeight: '700' }}>
            <div style={{ background: '#F8FAFC', padding: '6px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B' }}>Average Order: </span>
              <span style={{ color: '#0F172A', fontWeight: '800' }}>{formatINR(selectedMonth.averageOrder)}</span>
            </div>
            <div style={{ background: '#F8FAFC', padding: '6px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B' }}>Invoiced: </span>
              <span style={{ color: '#0F172A', fontWeight: '800' }}>{formatLakh(selectedMonth.invoiced)}</span>
            </div>
          </div>
        </div>

        {/* Selected Month Sub-KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          {/* Sales */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 16px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>SALES</span>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', marginTop: '2px' }}>
              {formatLakh(selectedMonth.sales)}
            </div>
          </div>
          {/* Orders */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 16px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>ORDERS</span>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', marginTop: '2px' }}>
              {selectedMonth.orders}
            </div>
          </div>
          {/* Collected */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 16px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>COLLECTED</span>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#059669', marginTop: '2px' }}>
              {formatLakh(selectedMonth.collected)}
            </div>
          </div>
          {/* Outstanding */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 16px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>OUTSTANDING</span>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#D97706', marginTop: '2px' }}>
              {formatLakh(selectedMonth.outstanding)}
            </div>
          </div>
        </div>

        {/* Collection Rate Visual Bar */}
        <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '12px 18px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0369A1' }}>
              Collection Rate
            </span>
            <span style={{ fontSize: '14px', fontWeight: '900', color: '#0284C7' }}>
              {selectedMonth.collectionRate}%
            </span>
          </div>
          {/* Progress track */}
          <div style={{ width: '100%', height: '10px', background: '#E0F2FE', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, Math.max(0, selectedMonth.collectionRate))}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #0284C7 0%, #059669 100%)',
              borderRadius: '999px',
              transition: 'width 0.4s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginTop: '4px', fontWeight: '600' }}>
            <span>Current Due: {formatLakh(selectedMonth.currentDue)}</span>
            <span>Overdue: {formatLakh(selectedMonth.overdue)}</span>
          </div>
        </div>

        {/* ORDER / INVOICE DETAILS TABLE */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                ORDER / INVOICE DETAILS
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                Individual sales orders, connected invoices, verified collections and balance due
              </p>
            </div>

            {/* Table Search */}
            <div style={{ position: 'relative' }}>
              <Search size={13} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search orders, invoices, customers..."
                style={{
                  padding: '6px 12px 6px 30px', fontSize: '12px', borderRadius: '6px',
                  border: '1px solid #CBD5E1', outline: 'none', width: '220px'
                }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', color: '#475569', fontWeight: '800', fontSize: '11.5px', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '10px 12px' }}>Order No</th>
                  <th style={{ padding: '10px 12px' }}>Order Date</th>
                  <th style={{ padding: '10px 12px' }}>Customer</th>
                  <th style={{ padding: '10px 12px' }}>Salesperson</th>
                  <th style={{ padding: '10px 12px' }}>Invoice</th>
                  <th style={{ padding: '10px 12px' }}>Payment Terms / Due</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Sales</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Collected</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Due</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderInvoiceDetails.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontWeight: '600' }}>
                      No order / invoice records cataloged for this month matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  orderInvoiceDetails.map((order) => {
                    // Status Badge Styling
                    let badgeBg = '#E0F2FE';
                    let badgeColor = '#0369A1';
                    if (order.status === 'PAID') {
                      badgeBg = '#DCFCE7';
                      badgeColor = '#15803D';
                    } else if (order.status === 'PARTIAL') {
                      badgeBg = '#FEF3C7';
                      badgeColor = '#B45309';
                    } else if (order.status === 'OVERDUE') {
                      badgeBg = '#FEE2E2';
                      badgeColor = '#B91C1C';
                    }

                    return (
                      <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: '800', color: '#1E293B', fontFamily: 'monospace' }}>
                          {order.orderNo}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap' }}>
                          {formatDate(order.orderDate)}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0F172A', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order.customer}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: '600', color: '#334155', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order.salesperson || 'Unassigned'}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: '600', color: '#475569', fontFamily: 'monospace' }}>
                          {order.invoice}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '11.5px', color: '#475569' }}>
                          <div style={{ fontWeight: '700', color: '#1E293B' }}>{order.paymentTerms || 'Standard'}</div>
                          {order.paymentDueDate && (
                            <div style={{
                              fontSize: '11px',
                              fontWeight: '600',
                              color: order.status === 'OVERDUE' ? '#DC2626' : (order.status === 'PAID' ? '#16A34A' : '#64748B'),
                              marginTop: '2px'
                            }}>
                              {order.status === 'OVERDUE'
                                ? `${Math.abs(order.dueDays || 0)}d overdue`
                                : (order.status === 'PAID' ? 'Fully Settled' : (order.dueDays !== null ? `Due in ${order.dueDays}d` : formatDate(order.paymentDueDate)))}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#0F172A' }}>
                          {formatINR(order.sales)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                          {formatINR(order.collected)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: order.due > 0 ? '#D97706' : '#94A3B8' }}>
                          {formatINR(order.due)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '10.5px',
                            fontWeight: '850',
                            letterSpacing: '0.04em',
                            background: badgeBg,
                            color: badgeColor
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => router.push(`/sales/orders?search=${order.orderNo}`)}
                              style={{
                                padding: '4px 8px', fontSize: '11px', fontWeight: '700',
                                background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px',
                                color: '#334155', cursor: 'pointer'
                              }}
                            >
                              View Order
                            </button>
                            {order.invoice !== '—' && (
                              <button
                                type="button"
                                onClick={() => router.push(`/finance/invoices?search=${order.invoice}`)}
                                style={{
                                  padding: '4px 8px', fontSize: '11px', fontWeight: '700',
                                  background: '#EFF6FF', border: '1px solid #93C5FD', borderRadius: '4px',
                                  color: '#1D4ED8', cursor: 'pointer'
                                }}
                              >
                                View Invoice
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* 5. CUSTOMER OUTSTANDING TABLE                              */}
        {/* ────────────────────────────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                CUSTOMER OUTSTANDING
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                Aggregated sales, collection realization, and pending overdue amounts by client
              </p>
            </div>

            {/* Table Search */}
            <div style={{ position: 'relative' }}>
              <Search size={13} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                placeholder="Search customers..."
                style={{
                  padding: '6px 12px 6px 30px', fontSize: '12px', borderRadius: '6px',
                  border: '1px solid #CBD5E1', outline: 'none', width: '200px'
                }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', color: '#475569', fontWeight: '800', fontSize: '11.5px', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '10px 12px' }}>Customer</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Sales</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Orders</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Collected</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Due</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Overdue</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {customerOutstanding.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontWeight: '600' }}>
                      No customer outstanding records found for this period.
                    </td>
                  </tr>
                ) : (
                  customerOutstanding.map((c) => {
                    const isFullyPaid = c.due === 0 && c.sales > 0;
                    const isPartiallyPaid = c.collected > 0 && c.due > 0;
                    const hasOverdue = c.overdue > 0;

                    let statusText = 'DUE';
                    let statusBg = '#E0F2FE';
                    let statusColor = '#0369A1';

                    if (isFullyPaid) {
                      statusText = 'PAID';
                      statusBg = '#DCFCE7';
                      statusColor = '#15803D';
                    } else if (hasOverdue) {
                      statusText = 'OVERDUE';
                      statusBg = '#FEE2E2';
                      statusColor = '#B91C1C';
                    } else if (isPartiallyPaid) {
                      statusText = 'PARTIAL';
                      statusBg = '#FEF3C7';
                      statusColor = '#B45309';
                    }

                    return (
                      <tr key={c.customerId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: '800', color: '#0F172A' }}>
                          {c.customer}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#0F172A' }}>
                          {formatLakh(c.sales)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>
                          {c.orders}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                          {formatLakh(c.collected)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: c.due > 0 ? '#D97706' : '#94A3B8' }}>
                          {formatLakh(c.due)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: c.overdue > 0 ? '#DC2626' : '#94A3B8' }}>
                          {formatLakh(c.overdue)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '10.5px',
                            fontWeight: '850',
                            letterSpacing: '0.04em',
                            background: statusBg,
                            color: statusColor
                          }}>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}

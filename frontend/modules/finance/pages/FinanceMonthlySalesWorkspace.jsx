'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  FileText,
  AlertTriangle,
  Building,
  User,
  Wallet,
  Box,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { financeSalesAnalyticsService } from '../../../services/financeSalesAnalytics.service';

// 12 Indian Financial Months (Apr -> Mar)
const MONTH_NAMES = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March'
];

const getStartYearFromFY = (fyStr) => {
  const cleanFy = (fyStr || '2026–27').replace(/[–—]/g, '-');
  const match = cleanFy.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : 2026;
};

// Pure Currency & Date Formatters
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

export default function FinanceMonthlySalesWorkspace() {
  const router = useRouter();

  // 1. Period & Filter State
  const [financialYear, setFinancialYear] = useState('2026–27');
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' or '0'..'11'
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedSalesperson, setSelectedSalesperson] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // 2. View Tab State ('orders' | 'trends' | 'customers')
  const [activeTab, setActiveTab] = useState('orders');

  // 3. Search & Pagination State
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(25);

  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerPage, setCustomerPage] = useState(1);
  const [customerPageSize, setCustomerPageSize] = useState(25);

  // 4. Data Loading State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workspaceData, setWorkspaceData] = useState(null);
  const [error, setError] = useState(null);

  // Computed Financial Year & Months
  const startYear = useMemo(() => getStartYearFromFY(financialYear), [financialYear]);
  const endYear = startYear + 1;

  const monthsList = useMemo(() => {
    if (workspaceData?.filters?.months?.length === 12) {
      return workspaceData.filters.months.map(m => ({
        index: m.index,
        name: m.name,
        short: m.short
      }));
    }
    return MONTH_NAMES.map((mName, idx) => {
      const yr = idx <= 8 ? startYear : endYear;
      return {
        index: idx,
        name: `${mName} ${yr}`,
        short: mName.slice(0, 3)
      };
    });
  }, [workspaceData?.filters?.months, startYear, endYear]);

  // Current month metadata for display
  const currentMonthInfo = useMemo(() => {
    if (selectedMonth === 'all') {
      return {
        isAll: true,
        title: `All Months Overview (FY ${financialYear})`,
        badge: `Full Financial Year (12 Months)`,
        name: `All Months (FY ${financialYear})`
      };
    }
    const found = monthsList.find(m => m.index.toString() === selectedMonth);
    const mName = found ? found.name : `Month ${parseInt(selectedMonth, 10) + 1}`;
    return {
      isAll: false,
      title: `${mName} Breakdown`,
      badge: `Month ${parseInt(selectedMonth, 10) + 1} of 12 (FY ${financialYear})`,
      name: mName
    };
  }, [selectedMonth, monthsList, financialYear]);

  // Fetch Data from Backend Analytics API
  const loadWorkspace = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const params = {
        financialYear,
        month: selectedMonth,
        companyId: selectedCompany !== 'all' ? selectedCompany : undefined,
        salespersonId: selectedSalesperson !== 'all' ? selectedSalesperson : undefined,
        customerId: selectedCustomer !== 'all' ? selectedCustomer : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
      };

      const res = await financeSalesAnalyticsService.getMonthlyWorkspace(params);
      const data = res?.data || res;
      setWorkspaceData(data);
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
  }, [financialYear, selectedMonth, selectedCompany, selectedSalesperson, selectedCustomer, selectedStatus]);

  // Reset pagination when search or filters change
  useEffect(() => {
    setOrderPage(1);
  }, [orderSearchQuery, financialYear, selectedMonth, selectedCompany, selectedSalesperson, selectedCustomer, selectedStatus]);

  useEffect(() => {
    setCustomerPage(1);
  }, [customerSearchQuery, financialYear, selectedMonth, selectedCompany, selectedSalesperson]);

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
  const selectedMonthData = workspaceData?.selectedMonth || {
    month: selectedMonth === 'all' ? `All Months (FY ${financialYear})` : currentMonthInfo.name,
    sales: 0,
    orders: 0,
    invoiced: 0,
    collected: 0,
    currentDue: 0,
    overdue: 0,
    outstanding: 0,
    collectionRate: 0,
    averageOrder: 0,
    isAllMonths: selectedMonth === 'all',
  };

  // Active High-Level KPIs (Shows either Full FY or the Selected Month)
  const activeKpis = useMemo(() => {
    if (selectedMonth === 'all') {
      return {
        sales: executive.totalSales,
        orders: executive.totalOrders,
        invoiced: executive.totalInvoiced,
        collected: executive.totalCollected,
        outstanding: executive.totalOutstanding,
        currentDue: Math.max(0, executive.totalOutstanding - executive.totalOverdue),
        overdue: executive.totalOverdue,
        collectionRate: executive.collectionRate,
        averageOrder: executive.totalOrders > 0 ? Math.round(executive.totalSales / executive.totalOrders) : 0,
        label: `FY ${financialYear} (Full Year)`
      };
    }
    return {
      sales: selectedMonthData.sales,
      orders: selectedMonthData.orders,
      invoiced: selectedMonthData.invoiced,
      collected: selectedMonthData.collected,
      outstanding: selectedMonthData.outstanding,
      currentDue: selectedMonthData.currentDue,
      overdue: selectedMonthData.overdue,
      collectionRate: selectedMonthData.collectionRate,
      averageOrder: selectedMonthData.averageOrder,
      label: currentMonthInfo.name
    };
  }, [selectedMonth, executive, selectedMonthData, financialYear, currentMonthInfo]);

  // Filtered Orders
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

  // Aggregate Totals for Currently Filtered Orders
  const orderTotals = useMemo(() => {
    return orderInvoiceDetails.reduce((acc, o) => {
      acc.sales += (o.sales || 0);
      acc.invoiced += (o.invoiced || 0);
      acc.collected += (o.collected || 0);
      acc.due += (o.due || 0);
      acc.overdue += (o.overdue || 0);
      return acc;
    }, { sales: 0, invoiced: 0, collected: 0, due: 0, overdue: 0 });
  }, [orderInvoiceDetails]);

  // Paginated Orders with 'All' Support and Safe Bounds
  const isAllOrders = orderPageSize === 'all' || orderPageSize >= 10000;
  const totalOrderPages = isAllOrders ? 1 : Math.max(1, Math.ceil(orderInvoiceDetails.length / Number(orderPageSize)));
  const safeOrderPage = Math.min(Math.max(1, orderPage), totalOrderPages);

  const paginatedOrders = useMemo(() => {
    if (isAllOrders) return orderInvoiceDetails;
    const size = Number(orderPageSize);
    const start = (safeOrderPage - 1) * size;
    return orderInvoiceDetails.slice(start, start + size);
  }, [orderInvoiceDetails, safeOrderPage, orderPageSize, isAllOrders]);

  // Auto-clamp order page if list shrinks
  useEffect(() => {
    if (orderPage > totalOrderPages && totalOrderPages > 0) {
      setOrderPage(1);
    }
  }, [totalOrderPages, orderPage]);

  // Filtered Customers
  const customerOutstanding = useMemo(() => {
    const list = workspaceData?.customerOutstanding || [];
    if (!customerSearchQuery) return list;
    const q = customerSearchQuery.toLowerCase();
    return list.filter(c => c.customer?.toLowerCase().includes(q));
  }, [workspaceData?.customerOutstanding, customerSearchQuery]);

  // Paginated Customers with 'All' Support and Safe Bounds
  const isAllCustomers = customerPageSize === 'all' || customerPageSize >= 10000;
  const totalCustomerPages = isAllCustomers ? 1 : Math.max(1, Math.ceil(customerOutstanding.length / Number(customerPageSize)));
  const safeCustomerPage = Math.min(Math.max(1, customerPage), totalCustomerPages);

  const paginatedCustomers = useMemo(() => {
    if (isAllCustomers) return customerOutstanding;
    const size = Number(customerPageSize);
    const start = (safeCustomerPage - 1) * size;
    return customerOutstanding.slice(start, start + size);
  }, [customerOutstanding, safeCustomerPage, customerPageSize, isAllCustomers]);

  useEffect(() => {
    if (customerPage > totalCustomerPages && totalCustomerPages > 0) {
      setCustomerPage(1);
    }
  }, [totalCustomerPages, customerPage]);

  const filters = workspaceData?.filters || {
    financialYears: ['2024–25', '2025–26', '2026–27', '2027–28'],
    companies: [],
    salespersons: [],
    customers: [],
    statuses: ['All', 'Paid', 'Partial', 'Due', 'Overdue'],
  };

  // Export CSV
  const handleExportCSV = () => {
    const ordersToExport = (selectedMonth !== 'all')
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
    const monthLabel = selectedMonth !== 'all' ? `_${(currentMonthInfo.name || '').replace(/\s+/g, '_')}` : '_All_Months';
    const statusLabel = selectedStatus !== 'All' ? `_${selectedStatus}` : '';
    link.setAttribute('download', `Finance_Sales_Collection_${financialYear.replace(/[–—]/g, '-')}${monthLabel}${statusLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reusable Pagination Component
  const renderPagination = ({ currentPage, totalPages, totalCount, pageSize, setPageSize, setPage, itemName = 'items' }) => {
    const isAll = pageSize === 'all' || pageSize >= 10000;
    const safeCurrent = Math.min(Math.max(1, currentPage), totalPages);
    const numericPageSize = isAll ? (totalCount || 1) : Number(pageSize);
    const startItem = totalCount === 0 ? 0 : (isAll ? 1 : (safeCurrent - 1) * numericPageSize + 1);
    const endItem = isAll ? totalCount : Math.min(totalCount, safeCurrent * numericPageSize);

    const getPageNumbers = () => {
      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      if (safeCurrent <= 4) {
        return [1, 2, 3, 4, 5, '...', totalPages];
      }
      if (safeCurrent >= totalPages - 3) {
        return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      }
      return [1, '...', safeCurrent - 1, safeCurrent, safeCurrent + 1, '...', totalPages];
    };

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 18px',
        background: '#ffffff',
        borderTop: '1px solid #E2E8F0',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: '#64748B', flexWrap: 'wrap' }}>
          <span>
            Showing <strong style={{ color: '#0F172A' }}>{startItem}</strong> to <strong style={{ color: '#0F172A' }}>{endItem}</strong> of <strong style={{ color: '#0F172A' }}>{totalCount}</strong> {itemName}
            {!isAll && totalPages > 1 && (
              <span style={{ marginLeft: '6px', color: '#94A3B8' }}>
                (Page <strong style={{ color: '#0F172A' }}>{safeCurrent}</strong> of <strong style={{ color: '#0F172A' }}>{totalPages}</strong>)
              </span>
            )}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                setPageSize(val);
                setPage(1);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '12px',
                fontWeight: '700',
                color: '#334155',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              {[10, 25, 50, 100, 200].map(s => <option key={s} value={s}>{s}</option>)}
              <option value="all">All ({totalCount})</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            disabled={isAll || safeCurrent === 1}
            onClick={() => setPage(1)}
            style={{
              padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1',
              background: '#ffffff', color: (isAll || safeCurrent === 1) ? '#CBD5E1' : '#334155',
              cursor: (isAll || safeCurrent === 1) ? 'not-allowed' : 'pointer'
            }}
            title="First Page"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            type="button"
            disabled={isAll || safeCurrent === 1}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            style={{
              padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1',
              background: '#ffffff', color: (isAll || safeCurrent === 1) ? '#CBD5E1' : '#334155',
              fontSize: '12px', fontWeight: '750', cursor: (isAll || safeCurrent === 1) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '3px'
            }}
          >
            <ChevronLeft size={14} />
            <span>Prev</span>
          </button>

          {!isAll && getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: '#94A3B8', fontSize: '12px' }}>...</span>;
            }
            const isAct = p === safeCurrent;
            return (
              <button
                key={`page-${p}-${idx}`}
                type="button"
                onClick={() => setPage(p)}
                style={{
                  minWidth: '32px', height: '30px', padding: '0 6px', borderRadius: '6px',
                  border: isAct ? '1.5px solid #002E5D' : '1px solid #CBD5E1',
                  background: isAct ? '#002E5D' : '#ffffff',
                  color: isAct ? '#ffffff' : '#334155',
                  fontSize: '12px', fontWeight: isAct ? '800' : '600', cursor: 'pointer'
                }}
              >
                {p}
              </button>
            );
          })}

          <button
            type="button"
            disabled={isAll || safeCurrent === totalPages}
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            style={{
              padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1',
              background: '#ffffff', color: (isAll || safeCurrent === totalPages) ? '#CBD5E1' : '#334155',
              fontSize: '12px', fontWeight: '750', cursor: (isAll || safeCurrent === totalPages) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '3px'
            }}
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            disabled={isAll || safeCurrent === totalPages}
            onClick={() => setPage(totalPages)}
            style={{
              padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1',
              background: '#ffffff', color: (isAll || safeCurrent === totalPages) ? '#CBD5E1' : '#334155',
              cursor: (isAll || safeCurrent === totalPages) ? 'not-allowed' : 'pointer'
            }}
            title="Last Page"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      padding: '24px 32px',
      background: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER WITH PERIOD CONTROLS                          */}
      {/* ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        background: '#ffffff',
        padding: '18px 24px',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '850', color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#E0F2FE', padding: '3px 8px', borderRadius: '4px' }}>
              FINANCE
            </span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>
              {currentMonthInfo.badge}
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '850', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Month-wise Sales &amp; Collection
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0 0', fontWeight: '500' }}>
            Track monthly orders, invoicing, collections and outstanding receivables
          </p>
        </div>

        {/* Period Selectors & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* FY Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '6px 12px' }}>
            <Calendar size={14} color="#64748B" />
            <span style={{ fontSize: '12px', fontWeight: '750', color: '#475569' }}>FY:</span>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              style={{
                border: 'none', background: 'transparent', fontSize: '12.5px',
                fontWeight: '800', color: '#002E5D', outline: 'none', cursor: 'pointer'
              }}
            >
              {filters.financialYears.map(fy => (
                <option key={fy} value={fy}>{fy}</option>
              ))}
            </select>
          </div>

          {/* Month Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#EFF6FF', border: '1.5px solid #2563EB', borderRadius: '8px', padding: '6px 12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#1E40AF' }}>Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                border: 'none', background: 'transparent', fontSize: '12.5px',
                fontWeight: '800', color: '#002E5D', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="all">📅 All Months (Full FY {financialYear})</option>
              {monthsList.map(m => (
                <option key={m.index} value={m.index.toString()}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => loadWorkspace(true)}
            disabled={refreshing || loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', background: '#ffffff', border: '1px solid #CBD5E1',
              borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', color: '#334155',
              cursor: refreshing ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Export CSV Button */}
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
      {/* 2. 4 EXECUTIVE KPI CARDS (Full-Width Responsive Grid)       */}
      {/* ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {/* TOTAL SALES */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL SALES
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#2563EB" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
            {formatLakh(activeKpis.sales)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            <span>Orders: <strong style={{ color: '#0F172A' }}>{activeKpis.orders}</strong></span>
            <span>Avg Order: <strong style={{ color: '#0F172A' }}>{formatINR(activeKpis.averageOrder)}</strong></span>
          </div>
        </div>

        {/* INVOICED */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL INVOICED
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={16} color="#16A34A" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>
            {formatLakh(activeKpis.invoiced)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            <span>Billed vs Sales</span>
            <span style={{ color: '#16A34A', fontWeight: '750' }}>
              {activeKpis.sales > 0 ? Math.round((activeKpis.invoiced / activeKpis.sales) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* COLLECTED */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TOTAL COLLECTED
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={16} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#059669', letterSpacing: '-0.02em' }}>
            {formatLakh(activeKpis.collected)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            <span>Realization Rate</span>
            <span style={{ color: '#059669', background: '#D1FAE5', padding: '1px 6px', borderRadius: '4px', fontWeight: '800', fontSize: '11.5px' }}>
              {activeKpis.collectionRate}%
            </span>
          </div>
        </div>

        {/* OUTSTANDING DUE */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OUTSTANDING DUE
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#D97706', letterSpacing: '-0.02em' }}>
            {formatLakh(activeKpis.outstanding)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: '2px' }}>
            <span style={{ color: '#64748B' }}>Current: <strong style={{ color: '#D97706' }}>{formatLakh(activeKpis.currentDue)}</strong></span>
            <span style={{ color: '#DC2626', fontWeight: '750' }}>Overdue: {formatLakh(activeKpis.overdue)}</span>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. WORKSPACE NAVIGATION TABS                               */}
      {/* ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '2px solid #E2E8F0',
        paddingBottom: '0',
        marginTop: '4px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'orders' ? '3px solid #002E5D' : '3px solid transparent',
            color: activeTab === 'orders' ? '#002E5D' : '#64748B',
            fontSize: '14px',
            fontWeight: activeTab === 'orders' ? '850' : '650',
            cursor: 'pointer',
            marginBottom: '-2px',
            transition: 'all 0.15s ease'
          }}
        >
          <FileText size={16} color={activeTab === 'orders' ? '#002E5D' : '#64748B'} />
          <span>Orders &amp; Collections Ledger</span>
          <span style={{
            background: activeTab === 'orders' ? '#EFF6FF' : '#F1F5F9',
            color: activeTab === 'orders' ? '#1D4ED8' : '#64748B',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '800'
          }}>
            {orderInvoiceDetails.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trends')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'trends' ? '3px solid #002E5D' : '3px solid transparent',
            color: activeTab === 'trends' ? '#002E5D' : '#64748B',
            fontSize: '14px',
            fontWeight: activeTab === 'trends' ? '850' : '650',
            cursor: 'pointer',
            marginBottom: '-2px',
            transition: 'all 0.15s ease'
          }}
        >
          <BarChart3 size={16} color={activeTab === 'trends' ? '#002E5D' : '#64748B'} />
          <span>Monthly Trends &amp; Summary</span>
          <span style={{
            background: activeTab === 'trends' ? '#EFF6FF' : '#F1F5F9',
            color: activeTab === 'trends' ? '#1D4ED8' : '#64748B',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '800'
          }}>
            12 Months
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('customers')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'customers' ? '3px solid #002E5D' : '3px solid transparent',
            color: activeTab === 'customers' ? '#002E5D' : '#64748B',
            fontSize: '14px',
            fontWeight: activeTab === 'customers' ? '850' : '650',
            cursor: 'pointer',
            marginBottom: '-2px',
            transition: 'all 0.15s ease'
          }}
        >
          <Users size={16} color={activeTab === 'customers' ? '#002E5D' : '#64748B'} />
          <span>Customer Receivables</span>
          <span style={{
            background: activeTab === 'customers' ? '#EFF6FF' : '#F1F5F9',
            color: activeTab === 'customers' ? '#1D4ED8' : '#64748B',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '800'
          }}>
            {customerOutstanding.length}
          </span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 1: ORDERS & COLLECTIONS LEDGER (WITH PAGINATION)        */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          
          {/* Quick Month Selector Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 18px',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '850', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px', marginRight: '4px' }}>
              <Calendar size={14} color="#002E5D" />
              <span>Select Month:</span>
            </span>

            {/* All Months Button */}
            <button
              type="button"
              onClick={() => setSelectedMonth('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: selectedMonth === 'all' ? '1.5px solid #002E5D' : '1px solid #CBD5E1',
                background: selectedMonth === 'all' ? '#002E5D' : '#ffffff',
                color: selectedMonth === 'all' ? '#ffffff' : '#334155',
                fontSize: '12px',
                fontWeight: selectedMonth === 'all' ? '850' : '650',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>All Months</span>
              <span style={{
                fontSize: '11px',
                padding: '1px 7px',
                borderRadius: '10px',
                background: selectedMonth === 'all' ? '#0284C7' : '#F1F5F9',
                color: selectedMonth === 'all' ? '#ffffff' : '#64748B',
                fontWeight: '800'
              }}>
                {executive.totalOrders}
              </span>
            </button>

            {/* 12 Individual Month Buttons */}
            {monthsList.map((m) => {
              const isAct = selectedMonth === m.index.toString();
              const mTrend = monthlyTrend.find(t => t.monthIndex === m.index);
              const count = mTrend?.ordersCount || 0;

              return (
                <button
                  key={m.index}
                  type="button"
                  onClick={() => setSelectedMonth(m.index.toString())}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '7px',
                    border: isAct ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                    background: isAct ? '#2563EB' : '#ffffff',
                    color: isAct ? '#ffffff' : '#334155',
                    fontSize: '12px',
                    fontWeight: isAct ? '850' : '650',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                  title={m.name}
                >
                  <span>{m.short}</span>
                  {count > 0 && (
                    <span style={{
                      fontSize: '10.5px',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      background: isAct ? '#1D4ED8' : '#F1F5F9',
                      color: isAct ? '#ffffff' : '#64748B',
                      fontWeight: '800'
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filters & Search Toolbar */}
          <div style={{
            padding: '14px 20px',
            background: '#ffffff',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Search Box */}
            <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px', maxWidth: '380px' }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search by order #, customer, invoice, salesperson..."
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12.5px',
                  outline: 'none',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Month Filter Dropdown */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  padding: '6px 10px', borderRadius: '6px', border: '1.5px solid #2563EB',
                  fontSize: '12px', fontWeight: '750', color: '#1E40AF', background: '#EFF6FF', cursor: 'pointer',
                  maxWidth: '170px'
                }}
              >
                <option value="all">📅 All Months ({executive.totalOrders})</option>
                {monthsList.map(m => {
                  const mTrend = monthlyTrend.find(t => t.monthIndex === m.index);
                  const count = mTrend?.ordersCount || 0;
                  return (
                    <option key={m.index} value={m.index.toString()}>
                      {m.name} {count > 0 ? `(${count})` : ''}
                    </option>
                  );
                })}
              </select>

              {/* Company Filter */}
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                style={{
                  padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1',
                  fontSize: '12px', fontWeight: '600', color: '#334155', background: '#ffffff', cursor: 'pointer',
                  maxWidth: '150px'
                }}
              >
                <option value="all">All Companies</option>
                {filters.companies.map(c => {
                  const cId = typeof c === 'object' ? c.id : c;
                  const cName = typeof c === 'object' ? c.name : c;
                  return <option key={cId} value={cId}>{cName}</option>;
                })}
              </select>

              {/* Salesperson Filter */}
              <select
                value={selectedSalesperson}
                onChange={(e) => setSelectedSalesperson(e.target.value)}
                style={{
                  padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1',
                  fontSize: '12px', fontWeight: '600', color: '#334155', background: '#ffffff', cursor: 'pointer',
                  maxWidth: '150px'
                }}
              >
                <option value="all">All Salespersons</option>
                {filters.salespersons.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1',
                  fontSize: '12px', fontWeight: '600', color: '#334155', background: '#ffffff', cursor: 'pointer'
                }}
              >
                {filters.statuses.map(st => (
                  <option key={st} value={st}>{st === 'All' ? 'All Statuses' : st}</option>
                ))}
              </select>

              {/* Reset Filter Button */}
              {(orderSearchQuery || selectedMonth !== 'all' || selectedCompany !== 'all' || selectedSalesperson !== 'all' || selectedStatus !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderSearchQuery('');
                    setSelectedMonth('all');
                    setSelectedCompany('all');
                    setSelectedSalesperson('all');
                    setSelectedStatus('All');
                  }}
                  style={{
                    padding: '6px 10px', background: '#ffffff', border: '1px solid #CBD5E1',
                    borderRadius: '6px', fontSize: '11.5px', fontWeight: '750', color: '#64748B', cursor: 'pointer'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Orders Table */}
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#002E5D', color: '#ffffff', fontWeight: '800', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 14px' }}>Order No</th>
                  <th style={{ padding: '12px 14px' }}>Order Date</th>
                  <th style={{ padding: '12px 14px' }}>Customer</th>
                  <th style={{ padding: '12px 14px' }}>Salesperson</th>
                  <th style={{ padding: '12px 14px' }}>Invoice</th>
                  <th style={{ padding: '12px 14px' }}>Terms &amp; Due</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Sales Amt</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Collected</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Balance Due</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                      <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#002E5D' }} />
                      <span>Loading orders and collection records...</span>
                    </td>
                  </tr>
                ) : paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                      No orders match the current filter and search criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((o) => {
                    const isPaid = o.status === 'PAID';
                    const isOverdue = o.status === 'OVERDUE';
                    const isPartial = o.status === 'PARTIAL';

                    return (
                      <tr
                        key={o.id}
                        style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#002E5D' }}>
                          {o.orderNo}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#475569', whiteSpace: 'nowrap' }}>
                          <div>{formatDate(o.orderDate)}</div>
                          {o.orderDate && (
                            <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                              {new Date(o.orderDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0F172A', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {o.customer}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>
                          {o.salesperson}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#334155', fontWeight: '600' }}>
                          {o.invoice || '—'}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#475569', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
                          <div>{o.paymentTerms}</div>
                          {o.paymentDueDate && (
                            <div style={{ color: o.dueDays !== null && o.dueDays < 0 ? '#DC2626' : '#64748B', fontWeight: '600', marginTop: '2px' }}>
                              Due: {formatDate(o.paymentDueDate)} {o.dueDays !== null && (o.dueDays < 0 ? `(${Math.abs(o.dueDays)}d overdue)` : `(${o.dueDays}d left)`)}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '850', color: '#0F172A' }}>
                          {formatINR(o.sales)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                          {formatINR(o.collected)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', color: isOverdue ? '#DC2626' : (o.due > 0 ? '#D97706' : '#94A3B8') }}>
                          {formatINR(o.due)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '850',
                            textTransform: 'uppercase',
                            background: isPaid ? '#DCFCE7' : (isOverdue ? '#FEE2E2' : (isPartial ? '#FEF3C7' : '#F1F5F9')),
                            color: isPaid ? '#15803D' : (isOverdue ? '#DC2626' : (isPartial ? '#B45309' : '#475569'))
                          }}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Table Summary Footer */}
              {orderInvoiceDetails.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#F8FAFC', borderTop: '2px solid #CBD5E1', fontWeight: '850' }}>
                    <td colSpan={6} style={{ padding: '12px 14px', color: '#0F172A' }}>
                      TOTAL ({orderInvoiceDetails.length} {orderInvoiceDetails.length === 1 ? 'Order' : 'Orders'} Filtered)
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0F172A', fontWeight: '900' }}>
                      {formatINR(orderTotals.sales)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#059669', fontWeight: '900' }}>
                      {formatINR(orderTotals.collected)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: orderTotals.due > 0 ? '#D97706' : '#94A3B8', fontWeight: '900' }}>
                      {formatINR(orderTotals.due)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#DC2626', fontSize: '11px', fontWeight: '800' }}>
                      {orderTotals.overdue > 0 ? `Overdue: ${formatINR(orderTotals.overdue)}` : 'No Overdue'}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Proper Pagination Controls */}
          {renderPagination({
            currentPage: safeOrderPage,
            totalPages: totalOrderPages,
            totalCount: orderInvoiceDetails.length,
            pageSize: orderPageSize,
            setPageSize: setOrderPageSize,
            setPage: setOrderPage,
            itemName: 'orders'
          })}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 2: MONTHLY TRENDS & SUMMARY TABLE                       */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'trends' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Recharts Bar Chart Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                  MONTHLY SALES &amp; COLLECTION COMPARISON (FY {financialYear})
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Click on any month bar or row below to filter the workspace to that month
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
                      if (mIdx !== undefined) {
                        setSelectedMonth(mIdx.toString());
                        setActiveTab('orders');
                      }
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="monthShort" stroke="#64748B" fontSize={12} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} tickFormatter={(v) => formatLakh(v)} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{ background: '#0F172A', color: '#ffffff', padding: '10px 14px', borderRadius: '8px', fontSize: '12px' }}>
                            <p style={{ margin: 0, fontWeight: '800', borderBottom: '1px solid #334155', paddingBottom: '4px', marginBottom: '6px' }}>
                              {data.month}
                            </p>
                            <p style={{ margin: '2px 0', color: '#93C5FD' }}>Orders: <strong>{data.ordersCount}</strong></p>
                            <p style={{ margin: '2px 0', color: '#60A5FA' }}>Sales: <strong>{formatINR(data.salesValue)}</strong></p>
                            <p style={{ margin: '2px 0', color: '#34D399' }}>Collected: <strong>{formatINR(data.collectedValue)}</strong></p>
                            <p style={{ margin: '2px 0', color: '#FBBF24' }}>Due: <strong>{formatINR(data.dueValue)}</strong></p>
                            <p style={{ margin: '4px 0 0 0', paddingTop: '4px', borderTop: '1px solid #334155', color: '#E2E8F0' }}>
                              Realized: <strong>{data.collectionRate}%</strong>
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

          {/* Month-Wise Summary Table */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                  12-MONTH FINANCIAL PERFORMANCE TABLE
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Aggregated sales, invoicing, collections, and overdue receivables per financial month
                </p>
              </div>

              {selectedMonth !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedMonth('all')}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', border: '1px solid #2563EB',
                    background: '#EFF6FF', color: '#2563EB', fontSize: '12px', fontWeight: '750', cursor: 'pointer'
                  }}
                >
                  Clear Month Filter (View All)
                </button>
              )}
            </div>

            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#002E5D', color: '#ffffff', fontWeight: '800', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '12px 14px' }}>Financial Month</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Orders</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Sales</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Invoiced</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Collected</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Due</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Overdue</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Realized</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyTrend.map((m) => {
                    const isSelected = selectedMonth !== 'all' && parseInt(selectedMonth, 10) === m.monthIndex;
                    return (
                      <tr
                        key={m.monthIndex}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          background: isSelected ? '#EFF6FF' : 'transparent',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: isSelected ? '#1D4ED8' : '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }} />}
                          <span>{m.month}</span>
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
                          <span style={{
                            padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '800',
                            background: m.collectionRate >= 70 ? '#DCFCE7' : (m.collectionRate >= 40 ? '#FEF3C7' : '#F1F5F9'),
                            color: m.collectionRate >= 70 ? '#15803D' : (m.collectionRate >= 40 ? '#B45309' : '#64748B')
                          }}>
                            {m.collectionRate}%
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMonth(m.monthIndex.toString());
                              setActiveTab('orders');
                            }}
                            style={{
                              padding: '5px 11px',
                              borderRadius: '6px',
                              border: isSelected ? '1px solid #2563EB' : '1px solid #CBD5E1',
                              background: isSelected ? '#2563EB' : '#ffffff',
                              color: isSelected ? '#ffffff' : '#334155',
                              fontSize: '11.5px',
                              fontWeight: '750',
                              cursor: 'pointer'
                            }}
                          >
                            {isSelected ? 'Viewing Orders' : 'View Orders →'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Full Year Total Row */}
                  <tr style={{ background: '#F8FAFC', borderTop: '2px solid #CBD5E1', fontWeight: '850' }}>
                    <td style={{ padding: '12px 14px', color: '#0F172A' }}>
                      FULL YEAR TOTAL (12 MONTHS)
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#0F172A' }}>
                      {executive.totalOrders}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0F172A' }}>
                      {formatLakh(executive.totalSales)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#334155' }}>
                      {formatLakh(executive.totalInvoiced)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#059669' }}>
                      {formatLakh(executive.totalCollected)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#D97706' }}>
                      {formatLakh(executive.totalOutstanding)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#DC2626' }}>
                      {formatLakh(executive.totalOverdue)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#059669' }}>
                      {executive.collectionRate}%
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMonth('all');
                          setActiveTab('orders');
                        }}
                        style={{
                          padding: '5px 11px',
                          borderRadius: '6px',
                          border: selectedMonth === 'all' ? '1px solid #002E5D' : '1px solid #CBD5E1',
                          background: selectedMonth === 'all' ? '#002E5D' : '#ffffff',
                          color: selectedMonth === 'all' ? '#ffffff' : '#334155',
                          fontSize: '11.5px',
                          fontWeight: '750',
                          cursor: 'pointer'
                        }}
                      >
                        View All Orders →
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 3: CUSTOMER RECEIVABLES (WITH PAGINATION)               */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'customers' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          
          {/* Header & Search */}
          <div style={{
            padding: '14px 20px',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 280px', maxWidth: '400px' }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                placeholder="Search by customer name..."
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12.5px',
                  outline: 'none',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ fontSize: '12.5px', color: '#64748B' }}>
              Showing receivables for: <strong style={{ color: '#0F172A' }}>{currentMonthInfo.name}</strong>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#002E5D', color: '#ffffff', fontWeight: '800', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 14px' }}>Customer Name</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Orders</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Sales Total</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Collected</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Total Due</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Overdue</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                      <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#002E5D' }} />
                      <span>Loading customer receivables...</span>
                    </td>
                  </tr>
                ) : paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                      No customer records match your search criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((c, idx) => (
                    <tr
                      key={c.customerId || idx}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: '750', color: '#0F172A' }}>
                        {c.customer}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>
                        {c.orders}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', color: '#0F172A' }}>
                        {formatINR(c.sales)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                        {formatINR(c.collected)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '850', color: c.due > 0 ? '#D97706' : '#94A3B8' }}>
                        {formatINR(c.due)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '850', color: c.overdue > 0 ? '#DC2626' : '#94A3B8' }}>
                        {formatINR(c.overdue)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setOrderSearchQuery(c.customer);
                            setActiveTab('orders');
                          }}
                          style={{
                            padding: '4px 10px', borderRadius: '6px', border: '1px solid #CBD5E1',
                            background: '#ffffff', color: '#002E5D', fontSize: '11.5px', fontWeight: '750', cursor: 'pointer'
                          }}
                        >
                          Filter Orders
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Proper Pagination Controls */}
          {renderPagination({
            currentPage: safeCustomerPage,
            totalPages: totalCustomerPages,
            totalCount: customerOutstanding.length,
            pageSize: customerPageSize,
            setPageSize: setCustomerPageSize,
            setPage: setCustomerPage,
            itemName: 'customers'
          })}
        </div>
      )}

    </div>
  );
}

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  Calendar, 
  Percent, 
  ClipboardList, 
  CheckCircle, 
  AlertCircle, 
  UserCheck, 
  ArrowUpRight,
  Download,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { useERP } from '../shared/context/ERPContext';
import { apiClient } from '../lib/apiClient';
import { exportSalesReportPDF, exportToCSV } from '../services/export.service';

export default function ReportsView({ leads = [], orders = [], payments = [], customers = [], user }) {
  const { state } = useERP();
  const settings = state?.settings || {};

  const [activeTab, setActiveTab] = useState('overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Date filters
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  // Real reports data
  const [salesSummaryData, setSalesSummaryData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [customerPerformanceData, setCustomerPerformanceData] = useState([]);
  const [isReportsLoading, setIsReportsLoading] = useState(false);

  const fetchReports = async () => {
    setIsReportsLoading(true);
    try {
      const summaryRes = await apiClient.get(`/reports/sales/summary?date_from=${dateFrom}&date_to=${dateTo}`);
      const productsRes = await apiClient.get(`/reports/sales/top-products?date_from=${dateFrom}&date_to=${dateTo}&limit=10`);
      const customersRes = await apiClient.get(`/reports/sales/customer-performance?date_from=${dateFrom}&date_to=${dateTo}`);
      
      setSalesSummaryData(summaryRes.data || []);
      setTopProductsData(productsRes.data || []);
      setCustomerPerformanceData(customersRes.data || []);
    } catch (err) {
      console.error('Failed to fetch reports data', err);
    } finally {
      setIsReportsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateFrom, dateTo]);

  // Role detection
  const isSalesAdmin = user?.role === 'Sales Admin' || user?.role === 'Super Admin' || user?.role === 'Admin';
  const myName = user?.name || '';

  // Data Filtering based on Role and Date Range
  const isDateInRange = (dateStr) => {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    return d >= from && d <= to;
  };

  const roleFilteredLeads = isSalesAdmin ? leads : leads.filter(l => l.salesperson === myName);
  const myLeads = roleFilteredLeads.filter(l => isDateInRange(l.createdAt || l.date));

  const roleFilteredOrders = isSalesAdmin ? orders : orders.filter(o => o.salesperson === myName);
  const myOrders = roleFilteredOrders.filter(o => isDateInRange(o.createdAt || o.orderDate || o.date));

  const roleFilteredPayments = isSalesAdmin ? payments : payments.filter(p => roleFilteredOrders.some(o => o.orderNo === p.orderNo));
  const myPayments = roleFilteredPayments.filter(p => isDateInRange(p.date || p.createdAt));

  const myCustomers = isSalesAdmin 
    ? customers 
    : customers.filter(c => 
        roleFilteredOrders.some(o => o.customer?.id === c.id || o.customerName === c.name) || 
        roleFilteredLeads.some(l => l.companyName === c.name)
      );

  // Common calculations & formatting helpers
  const formatINR = (value) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return `₹${Math.round(value).toLocaleString('en-IN')}`;
  };

  const TODAY_STR = '2026-06-19';

  // Overall Statistics
  const totalLeads = myLeads.length;
  const convertedLeads = myLeads.filter(l => l.status === 'Converted').length;
  const conversionRate = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const totalOutstandingVal = myPayments
    .filter(p => p.status !== 'Paid')
    .reduce((sum, p) => sum + ((p.totalAmount || 0) - (p.paidAmount || 0)), 0);
  const totalPaidVal = myPayments
    .reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const paymentCollectionRate = (totalPaidVal + totalOutstandingVal) 
    ? Math.round((totalPaidVal / (totalPaidVal + totalOutstandingVal)) * 100) 
    : 0;

  const totalSalesVal = myOrders.reduce((sum, o) => sum + (o.payment?.totalAmount || o.totalValue || 0), 0);
  const displaySalesVal = salesSummaryData.length > 0 
    ? salesSummaryData.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0) 
    : totalSalesVal;

  // Targets logic
  // Map target to logged-in user if employee, or sum of all if admin
  const getAssignedTarget = () => {
    if (isSalesAdmin) {
      return Object.values(settings.salesTargets || {}).reduce((a, b) => a + b, 0) || 60000000;
    }
    return settings.salesTargets?.[user?.id] || 5000000;
  };

  const assignedTarget = getAssignedTarget();
  const targetPct = Math.min(100, Math.round((displaySalesVal / assignedTarget) * 100));
  const targetRemaining = Math.max(0, assignedTarget - displaySalesVal);

  // Tab configurations
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={15} /> },
    { id: 'leads', label: 'Leads', icon: <Users size={15} /> },
    { id: 'sales', label: 'Sales & Revenue', icon: <DollarSign size={15} /> },
    { id: 'followups', label: 'Follow-ups', icon: <Calendar size={15} /> },
    { id: 'target', label: 'Target Tracker', icon: <Target size={15} /> },
    { id: 'customers', label: 'Customers', icon: <UserCheck size={15} /> }
  ];

  if (isSalesAdmin) {
    tabs.push({ id: 'team', label: 'Team Performance', icon: <TrendingUp size={15} /> });
  }

  // Lead Status & Channel Breakdown
  const leadStatuses = ['New', 'Follow-up', 'Sample Stage', 'Quotation', 'Converted', 'Lost'];
  const leadStatusCounts = leadStatuses.reduce((acc, status) => {
    acc[status] = myLeads.filter(l => l.status === status).length;
    return acc;
  }, {});

  // Monthly Sales calculation
  const monthlySales = {};
  myOrders.forEach(o => {
    if (!o.date) return;
    const mStr = o.date.slice(0, 7); // YYYY-MM
    const amt = o.payment?.totalAmount || o.totalValue || 0;
    monthlySales[mStr] = (monthlySales[mStr] || 0) + amt;
  });

  const monthsList = Object.keys(monthlySales).sort().slice(-6); // last 6 months
  if (monthsList.length === 0) {
    monthsList.push('2026-06');
    monthlySales['2026-06'] = 0;
  }
  const maxMonthlySales = Math.max(...monthsList.map(m => monthlySales[m]), 1);

  const monthNames = {
    '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
    '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
  };

  const getMonthLabel = (mStr) => {
    const [yr, mn] = mStr.split('-');
    return `${monthNames[mn] || mn} '${yr.slice(-2)}`;
  };

  // Product Wise sales breakdown
  const productStats = {};
  myOrders.forEach(o => {
    if (Array.isArray(o.detailedItems)) {
      o.detailedItems.forEach(item => {
        const name = item.productName || item.name || 'Other Products';
        const qty = item.quantity || 0;
        const val = qty * (item.unitPrice || 0);
        if (!productStats[name]) productStats[name] = { qty: 0, revenue: 0 };
        productStats[name].qty += qty;
        productStats[name].revenue += val;
      });
    } else {
      const name = o.products || 'Other Products';
      const qty = o.quantity || o.totalQty || 1;
      const val = o.payment?.totalAmount || o.totalValue || 0;
      if (!productStats[name]) productStats[name] = { qty: 0, revenue: 0 };
      productStats[name].qty += qty;
      productStats[name].revenue += val;
    }
  });

  // Customer wise sales
  const customerStats = {};
  myOrders.forEach(o => {
    const name = o.customer?.name || o.customerName || 'Unknown Customer';
    const val = o.payment?.totalAmount || o.totalValue || 0;
    customerStats[name] = (customerStats[name] || 0) + val;
  });

  // Follow Ups calculations
  const followUpLeads = myLeads.filter(l => 
    ['New', 'Follow-up', 'Sample Stage', 'Quotation'].includes(l.status) && l.followUpDate
  );
  const overdueFollowUps = followUpLeads.filter(l => l.followUpDate < TODAY_STR);
  const upcomingFollowUps = followUpLeads.filter(l => l.followUpDate >= TODAY_STR);

  // Salespersons comparison data
  const salespeople = ['Alex Carter', 'Sarah Connor', 'Alex Rivera'];
  const teamStats = salespeople.map(name => {
    const repLeads = leads.filter(l => l.salesperson === name && isDateInRange(l.createdAt || l.date));
    const repOrders = orders.filter(o => o.salesperson === name && isDateInRange(o.createdAt || o.orderDate || o.date));
    const repRevenue = repOrders.reduce((sum, o) => sum + (o.payment?.totalAmount || o.totalValue || 0), 0);
    const repConverted = repLeads.filter(l => l.status === 'Converted').length;
    const repConversion = repLeads.length ? Math.round((repConverted / repLeads.length) * 100) : 0;
    const repPayments = payments.filter(p => repOrders.some(o => o.orderNo === p.orderNo) && isDateInRange(p.date || p.createdAt));
    const repOutstanding = repPayments.reduce((sum, p) => sum + (p.status !== 'Paid' ? (p.totalAmount - p.paidAmount) : 0), 0);

    return {
      name,
      revenue: repRevenue,
      leadsCount: repLeads.length,
      ordersCount: repOrders.length,
      conversionRate: repConversion,
      outstanding: repOutstanding
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const totalTeamRevenue = teamStats.reduce((sum, t) => sum + t.revenue, 1);

  return (
    <div className="app-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
      {/* Header */}
      <div className="module-header-row">
        <div>
          <h2 className="module-title">Analytics & Reports</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {isSalesAdmin ? 'Company-wide' : `${user?.name || 'My'}`} Sales Analytics Dashboard
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#eaeaea', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)' }}>
          <UserCheck size={12} />
          Role: <span style={{ color: 'var(--color-text-primary)' }}>{user?.role || 'Sales Representative'}</span>
        </div>
      </div>

      {/* Date Range Filter Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-border)',
        background: '#F5FAFE'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Period:</span>
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '12px' }}
          />
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '12px' }}
          />
          <button
            onClick={fetchReports}
            disabled={isReportsLoading}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--color-accent-teal)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCw size={12} className={isReportsLoading ? 'animate-spin' : ''} />
            Apply
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => exportSalesReportPDF({ date_from: dateFrom, date_to: dateTo })}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--color-accent-teal)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Download size={12} />
            Export PDF
          </button>
          <button
            onClick={() => {
              if (salesSummaryData.length > 0) {
                exportToCSV(salesSummaryData.map(item => ({
                  Month: item.month,
                  Orders: item.order_count,
                  Customers: item.unique_customers,
                  Revenue: item.total_revenue,
                  AverageOrder: item.avg_order_value,
                  ClosedRevenue: item.closed_revenue,
                  PendingRevenue: item.pending_revenue,
                  CancelledRevenue: item.cancelled_revenue
                })), `sales-summary-${dateFrom}-to-${dateTo}.csv`);
              } else {
                alert("No sales summary data to export");
              }
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              background: '#fff',
              color: 'var(--color-text-primary)',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs Dropdown */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <div 
          style={{ display: 'inline-block', position: 'relative' }}
          onBlur={(e) => {
            // Close dropdown if focus moves outside this container
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setDropdownOpen(false);
            }
          }}
        >
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              minWidth: '220px',
              justifyContent: 'space-between',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {tabs.find(t => t.id === activeTab)?.icon}
              {tabs.find(t => t.id === activeTab)?.label}
            </div>
            <ChevronDown size={16} style={{ color: 'var(--color-text-secondary)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </button>
          
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '6px',
              width: '100%',
              background: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              zIndex: 50,
              overflow: 'hidden'
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: activeTab === tab.id ? '#eaf6f6' : 'transparent',
                    color: activeTab === tab.id ? 'var(--color-accent-teal)' : 'var(--color-text-primary)',
                    fontSize: '14px',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (activeTab !== tab.id) e.currentTarget.style.background = '#f5f5f5';
                  }}
                  onMouseOut={(e) => {
                    if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main View Area */}
      <div style={{ flex: 1 }}>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* KPI Cards Grid */}
            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))' }}>
              <div className="kpi-card" style={{ borderLeft: '5px solid var(--color-accent-teal)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="kpi-label">Sales Revenue</span>
                  <DollarSign size={16} style={{ color: 'var(--color-accent-teal)' }} />
                </div>
                <span className="kpi-value">{formatINR(displaySalesVal)}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>
                  Target: {formatINR(assignedTarget)} ({targetPct}%)
                </span>
              </div>

              <div className="kpi-card" style={{ borderLeft: '5px solid var(--color-lime-brand)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="kpi-label">Leads Conversion</span>
                  <Percent size={16} style={{ color: 'var(--color-accent-green)' }} />
                </div>
                <span className="kpi-value">{conversionRate}%</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>
                  {convertedLeads} Converted / {totalLeads} Total
                </span>
              </div>

              <div className="kpi-card" style={{ borderLeft: '5px solid var(--color-accent-purple)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="kpi-label">Outstanding Payments</span>
                  <AlertCircle size={16} style={{ color: 'var(--color-accent-purple)' }} />
                </div>
                <span className="kpi-value">{formatINR(totalOutstandingVal)}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>
                  Collection Rate: {paymentCollectionRate}%
                </span>
              </div>

              <div className="kpi-card" style={{ borderLeft: '5px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="kpi-label">Pending Follow-Ups</span>
                  <Calendar size={16} style={{ color: '#f59e0b' }} />
                </div>
                <span className="kpi-value">{followUpLeads.length}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>
                  Overdue: <span style={{ color: overdueFollowUps.length > 0 ? '#ef4444' : 'inherit' }}>{overdueFollowUps.length}</span>
                </span>
              </div>
            </div>

            {/* Quick Summary Progress Metrics */}
            <div className="report-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '20px' }}>
              <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Target size={16} /> Target vs Achievement Progress
                </h3>
                <div className="report-bar-row">
                  <div className="report-bar-label-row">
                    <span>Target Completed</span>
                    <span style={{ fontWeight: '800' }}>{targetPct}% Achieved</span>
                  </div>
                  <div className="report-bar-track">
                    <div className="report-bar-fill" style={{ width: `${targetPct}%`, background: 'var(--color-accent-teal)' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginTop: '4px', color: 'var(--color-text-secondary)' }}>
                    <span>Achieved: {formatINR(displaySalesVal)}</span>
                    <span>Remaining: {formatINR(targetRemaining)}</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={16} /> Payment Collection Efficiency
                </h3>
                <div className="report-bar-row">
                  <div className="report-bar-label-row">
                    <span>Collected Rate</span>
                    <span style={{ fontWeight: '800' }}>{paymentCollectionRate}% Efficiency</span>
                  </div>
                  <div className="report-bar-track">
                    <div className="report-bar-fill" style={{ width: `${paymentCollectionRate}%`, background: 'var(--color-accent-purple)' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginTop: '4px', color: 'var(--color-text-secondary)' }}>
                    <span>Paid: {formatINR(totalPaidVal)}</span>
                    <span>Outstanding: {formatINR(totalOutstandingVal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="kpi-grid">
              <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-accent-teal)' }}>
                <span className="kpi-label">Active Leads</span>
                <span className="kpi-value">{myLeads.filter(l => ['New', 'Follow-up', 'Sample Stage', 'Quotation'].includes(l.status)).length}</span>
              </div>
              <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-accent-green)' }}>
                <span className="kpi-label">Converted Leads</span>
                <span className="kpi-value">{myLeads.filter(l => l.status === 'Converted').length}</span>
              </div>
              <div className="kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
                <span className="kpi-label">Lost Leads</span>
                <span className="kpi-value">{myLeads.filter(l => l.status === 'Lost').length}</span>
              </div>
            </div>

            <div className="report-metrics-grid">
              {/* Lead Status breakdown */}
              <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                  Leads Status Summary
                </h3>
                {leadStatuses.map(status => {
                  const count = leadStatusCounts[status] || 0;
                  const pct = totalLeads ? Math.round((count / totalLeads) * 100) : 0;
                  let barColor = 'var(--color-accent-teal)';
                  if (status === 'Converted') barColor = 'var(--color-accent-green)';
                  if (status === 'Lost') barColor = '#ef4444';
                  if (status === 'Follow-up') barColor = '#f59e0b';
                  return (
                    <div key={status} className="report-bar-row">
                      <div className="report-bar-label-row">
                        <span>{status}</span>
                        <span style={{ fontWeight: '800' }}>{count} leads ({pct}%)</span>
                      </div>
                      <div className="report-bar-track">
                        <div className="report-bar-fill" style={{ width: `${pct}%`, background: barColor }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leads list table */}
            <div className="crm-table-container app-card" style={{ padding: '20px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                  Leads Directory
                </h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Lead ID</th>
                      <th>Company Name</th>
                      <th>Contact Person</th>
                      <th>Status</th>
                      <th>Follow Up Date</th>
                      {isSalesAdmin && <th>Salesperson</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {myLeads.length === 0 ? (
                      <tr>
                        <td colSpan={isSalesAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                          No leads assigned.
                        </td>
                      </tr>
                    ) : (
                      myLeads.map(lead => (
                        <tr key={lead.id}>
                          <td style={{ fontWeight: '800' }}>#{lead.id}</td>
                          <td>
                            <div style={{ fontWeight: '700' }}>{lead.companyName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{lead.requirements}</div>
                          </td>
                          <td>{lead.contactPerson || 'N/A'}</td>
                          <td>
                            <span className={`badge badge-${
                              lead.status === 'Converted' ? 'success' : 
                              lead.status === 'Lost' ? 'danger' : 
                              lead.status === 'Follow-up' ? 'warning' : 'info'
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                          <td style={{ fontWeight: '700', color: lead.followUpDate && lead.followUpDate < TODAY_STR ? '#ef4444' : 'inherit' }}>
                            {lead.followUpDate || 'No follow-up set'}
                          </td>
                          {isSalesAdmin && <td style={{ fontWeight: '700' }}>{lead.salesperson}</td>}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SALES & REVENUE TAB */}
        {activeTab === 'sales' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="report-metrics-grid">
              {/* Monthly Sales Vertical Bar Chart */}
              <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} /> Sales Amount by Month
                </h3>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-around', 
                  alignItems: 'flex-end', 
                  height: '240px', 
                  padding: '10px 0', 
                  borderBottom: '1px solid var(--color-border)', 
                  marginBottom: '10px',
                  gap: '8px',
                  width: '100%',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}>
                  {salesSummaryData.length > 0 ? (
                    [...salesSummaryData].slice(0, 6).reverse().map(d => {
                      const val = parseFloat(d.total_revenue || 0);
                      const maxVal = Math.max(...salesSummaryData.map(item => parseFloat(item.total_revenue || 0)), 1);
                      const pct = maxVal > 0 ? Math.max(5, Math.round((val / maxVal) * 100)) : 5;
                      return (
                        <div key={d.month} style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          flex: 1, 
                          minWidth: '60px', 
                          maxWidth: '80px',
                          height: '100%',
                          justifyContent: 'flex-end',
                          gap: '8px'
                        }}>
                          <span style={{ 
                            fontSize: '10px', 
                            fontWeight: '800', 
                            color: 'var(--color-text-primary)',
                            whiteSpace: 'nowrap'
                          }}>
                            {formatINR(val)}
                          </span>
                          
                          <div style={{ 
                            width: '100%', 
                            height: '150px', 
                            display: 'flex', 
                            alignItems: 'flex-end', 
                            justifyContent: 'center' 
                          }}>
                            <div 
                              style={{
                                width: '100%',
                                maxWidth: '32px',
                                height: `${pct}%`,
                                background: 'linear-gradient(180deg, var(--color-accent-teal), #4db6ac)',
                                borderRadius: '6px 6px 0 0',
                                transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 2px 8px rgba(0, 150, 136, 0.15)'
                              }} 
                            ></div>
                          </div>

                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: '700', 
                            color: 'var(--color-text-secondary)',
                            whiteSpace: 'nowrap',
                            marginTop: '4px'
                          }}>
                            {d.month}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    monthsList.map(m => {
                      const val = monthlySales[m] || 0;
                      const pct = maxMonthlySales > 0 ? Math.max(5, Math.round((val / maxMonthlySales) * 100)) : 5;
                      return (
                        <div key={m} style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          flex: 1, 
                          minWidth: '60px', 
                          maxWidth: '80px',
                          height: '100%',
                          justifyContent: 'flex-end',
                          gap: '8px'
                        }}>
                          <span style={{ 
                            fontSize: '10px', 
                            fontWeight: '800', 
                            color: 'var(--color-text-primary)',
                            whiteSpace: 'nowrap'
                          }}>
                            {formatINR(val)}
                          </span>
                          
                          <div style={{ 
                            width: '100%', 
                            height: '150px', 
                            display: 'flex', 
                            alignItems: 'flex-end', 
                            justifyContent: 'center' 
                          }}>
                            <div 
                              style={{
                                width: '100%',
                                maxWidth: '32px',
                                height: `${pct}%`,
                                background: 'linear-gradient(180deg, var(--color-accent-teal), #4db6ac)',
                                borderRadius: '6px 6px 0 0',
                                transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 2px 8px rgba(0, 150, 136, 0.15)'
                              }} 
                            ></div>
                          </div>

                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: '700', 
                            color: 'var(--color-text-secondary)',
                            whiteSpace: 'nowrap',
                            marginTop: '4px'
                          }}>
                            {getMonthLabel(m)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Product Wise breakdown */}
              <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ClipboardList size={15} /> Product Performance Breakdown
                </h3>
                
                {topProductsData.length > 0 ? (
                  topProductsData.map(prod => {
                    const revenue = parseFloat(prod.total_revenue || 0);
                    const quantity = parseFloat(prod.total_quantity || 0);
                    const maxRev = Math.max(...topProductsData.map(p => parseFloat(p.total_revenue || 0)), 1);
                    const pct = Math.round((revenue / maxRev) * 100);
                    return (
                      <div key={prod.id} className="report-bar-row">
                        <div className="report-bar-label-row">
                          <span style={{ fontWeight: '700' }}>{prod.product_name} ({prod.product_code})</span>
                          <span style={{ fontWeight: '800' }}>
                            {quantity} {prod.unit_of_measure} ({formatINR(revenue)})
                          </span>
                        </div>
                        <div className="report-bar-track">
                          <div className="report-bar-fill" style={{ width: `${pct}%`, background: 'var(--color-accent-teal)' }}></div>
                        </div>
                      </div>
                    );
                  })
                ) : Object.keys(productStats).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                    No products sold.
                  </div>
                ) : (
                  Object.keys(productStats).sort((a, b) => productStats[b].revenue - productStats[a].revenue).map(pName => {
                    const stats = productStats[pName];
                    const maxRevenue = Math.max(...Object.values(productStats).map(ps => ps.revenue), 1);
                    const pct = Math.round((stats.revenue / maxRevenue) * 100);
                    return (
                      <div key={pName} className="report-bar-row">
                        <div className="report-bar-label-row">
                          <span style={{ fontWeight: '700' }}>{pName}</span>
                          <span style={{ fontWeight: '800' }}>
                            {stats.qty} sold ({formatINR(stats.revenue)})
                          </span>
                        </div>
                        <div className="report-bar-track">
                          <div className="report-bar-fill" style={{ width: `${pct}%`, background: 'var(--color-accent-teal)' }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Orders list table */}
            <div className="crm-table-container app-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                Orders Log
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Order No</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Product Details</th>
                      <th>Total Value</th>
                      <th>Order Status</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                          No orders registered.
                        </td>
                      </tr>
                    ) : (
                      myOrders.map(order => {
                        const orderVal = order.payment?.totalAmount || order.totalValue || 0;
                        const outstanding = order.payment ? (order.payment.totalAmount - order.payment.paid) : orderVal;
                        const payStatus = order.payment?.paid === order.payment?.totalAmount && order.payment?.totalAmount > 0 
                          ? 'Paid' 
                          : order.payment?.paid > 0 
                            ? 'Partial' 
                            : 'Unpaid';
                        
                        return (
                          <tr key={order.orderNo}>
                            <td style={{ fontWeight: '800' }}>{order.orderNo}</td>
                            <td>{order.date}</td>
                            <td style={{ fontWeight: '700' }}>{order.customer?.name || order.customerName}</td>
                            <td>{order.products}</td>
                            <td style={{ fontWeight: '800' }}>{formatINR(orderVal)}</td>
                            <td>
                              <span className={`badge badge-${
                                order.status === 'Closed' ? 'success' : 
                                order.status === 'Cancelled' ? 'danger' : 'info'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              <span className={`badge badge-${
                                payStatus === 'Paid' ? 'success' : 
                                payStatus === 'Partial' ? 'warning' : 'danger'
                              }`}>
                                {payStatus}
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
        )}

        {/* FOLLOW UPS TAB */}
        {activeTab === 'followups' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))' }}>
              <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-accent-purple)' }}>
                <span className="kpi-label">Active Leads needing Follow-ups</span>
                <span className="kpi-value">{followUpLeads.length}</span>
              </div>
              <div className="kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
                <span className="kpi-label">Overdue Follow-ups</span>
                <span className="kpi-value">{overdueFollowUps.length}</span>
                <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>Prioritize these immediately</span>
              </div>
              <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-accent-green)' }}>
                <span className="kpi-label">Upcoming Follow-ups</span>
                <span className="kpi-value">{upcomingFollowUps.length}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Scheduled for future dates</span>
              </div>
            </div>

            <div className="crm-table-container app-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                Follow-Up Schedule
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Contact Person</th>
                      <th>Follow Up Date</th>
                      <th>Status</th>
                      <th>Latest Logged Communication</th>
                      {isSalesAdmin && <th>Representative</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {followUpLeads.length === 0 ? (
                      <tr>
                        <td colSpan={isSalesAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                          No pending follow-ups. Good job!
                        </td>
                      </tr>
                    ) : (
                      followUpLeads.map(lead => {
                        const isOverdue = lead.followUpDate < TODAY_STR;
                        const latestTimeline = lead.timeline && lead.timeline.length > 0 
                          ? lead.timeline[lead.timeline.length - 1] 
                          : null;
                        
                        return (
                          <tr key={lead.id} style={{ background: isOverdue ? 'rgba(239, 68, 68, 0.02)' : 'inherit' }}>
                            <td style={{ fontWeight: '700' }}>
                              <div>{lead.companyName}</div>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>ID: #{lead.id}</span>
                            </td>
                            <td>{lead.contactPerson}</td>
                            <td style={{ fontWeight: '800', color: isOverdue ? '#ef4444' : 'var(--color-accent-teal)' }}>
                              {lead.followUpDate} {isOverdue && ' (OVERDUE)'}
                            </td>
                            <td>
                              <span className="badge badge-info">{lead.status}</span>
                            </td>
                            <td>
                              {latestTimeline ? (
                                <div style={{ fontSize: '12px' }}>
                                  <strong style={{ color: 'var(--color-text-secondary)' }}>[{latestTimeline.stage}]</strong> {latestTimeline.text}
                                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{latestTimeline.date}</div>
                                </div>
                              ) : 'No remarks logged.'}
                            </td>
                            {isSalesAdmin && <td style={{ fontWeight: '700' }}>{lead.salesperson}</td>}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TARGET TRACKER TAB */}
        {activeTab === 'target' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ 
              background: '#ffffff', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-xl)', 
              padding: 'clamp(16px, 4vw, 30px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
              gap: 'clamp(16px, 4vw, 30px)',
              alignItems: 'center'
            }}>
              {/* Target Graphic / Status */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ 
                  width: '160px', 
                  height: '160px', 
                  borderRadius: '50%', 
                  background: `conic-gradient(var(--color-accent-teal) ${targetPct}%, #f1f3f5 0)`,
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginBottom: '16px',
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <div style={{
                    width: '136px',
                    height: '136px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)'
                  }}>
                    <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text-primary)', lineHeight: 1 }}>
                      {targetPct}%
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Completed
                    </span>
                  </div>
                </div>
                
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                  {targetPct >= 80 ? 'Exceptional Performance!' : targetPct >= 50 ? 'On Track' : 'Action Required'}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', maxWidth: '300px', marginTop: '6px' }}>
                  {targetPct >= 80 
                    ? 'Excellent job! You are hitting key sales milestones and driving top-line revenue.' 
                    : targetPct >= 50 
                      ? 'Progress is steady. Convert pending high-value quotations to guarantee goal completion.'
                      : 'Immediate follow-up on outstanding payments and warm leads is required to secure targets.'}
                </p>
              </div>

              {/* Targets detail */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                    Target Assigned
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                    {formatINR(assignedTarget)}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                    Revenue Achieved
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-accent-teal)', marginTop: '4px' }}>
                    {formatINR(displaySalesVal)}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                    Remaining Deficit
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: targetRemaining > 0 ? '#ef4444' : 'var(--color-accent-green)', marginTop: '4px' }}>
                    {targetRemaining > 0 ? formatINR(targetRemaining) : 'Target Reached! 🎉'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="kpi-grid">
              <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-accent-teal)' }}>
                <span className="kpi-label">My Customers</span>
                <span className="kpi-value">{myCustomers.length}</span>
              </div>
              <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-accent-green)' }}>
                <span className="kpi-label">Active Orders</span>
                <span className="kpi-value">{myOrders.filter(o => o.status !== 'Closed' && o.status !== 'Cancelled').length}</span>
              </div>
              <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-accent-purple)' }}>
                <span className="kpi-label">Repeat Customers</span>
                <span className="kpi-value">{myCustomers.filter(c => (c.totalOrders > 1 || (c.ordersHistory && c.ordersHistory.length > 1))).length}</span>
              </div>
            </div>

            <div className="crm-table-container app-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                Customers List
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Contact Info</th>
                      <th>Total Orders</th>
                      <th>Total Value</th>
                      <th>Outstanding Balance</th>
                      <th>Latest Communication Log</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerPerformanceData.length > 0 ? (
                      customerPerformanceData.map(customer => {
                        const totalOrders = customer.order_count;
                        const totalRevenue = parseFloat(customer.total_spent || 0);
                        const outstanding = 0; // customer performance query doesn't directly compute receivables, fallback to 0
                        const completed = customer.completed_orders;
                        return (
                          <tr key={customer.id}>
                            <td style={{ fontWeight: '700' }}>
                              <div>{customer.customer_name}</div>
                              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Code: {customer.customer_code}</span>
                            </td>
                            <td>
                              <div>{customer.city || 'N/A'}, {customer.state || 'N/A'}</div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>GSTIN: {customer.gstin || 'N/A'}</div>
                            </td>
                            <td style={{ fontWeight: '800' }}>{totalOrders}</td>
                            <td style={{ fontWeight: '800', color: 'var(--color-accent-teal)' }}>{formatINR(totalRevenue)}</td>
                            <td style={{ fontWeight: '800' }}>
                              {completed} / {totalOrders} Completed
                            </td>
                            <td>
                              <div style={{ fontSize: '12px' }}>
                                Last Order: {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'N/A'}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : myCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                          No customer associations.
                        </td>
                      </tr>
                    ) : (
                      myCustomers.map(customer => {
                        const totalOrders = customer.totalOrders || (customer.ordersHistory?.length) || 0;
                        const totalRevenue = customer.totalRevenue || customer.ordersHistory?.reduce((s, h) => s + (h.val || 0), 0) || 0;
                        const outstanding = customer.outstanding || 0;
                        const latestComm = customer.communicationLogs && customer.communicationLogs.length > 0 
                          ? customer.communicationLogs[customer.communicationLogs.length - 1] 
                          : null;
                        
                        return (
                          <tr key={customer.id}>
                            <td style={{ fontWeight: '700' }}>
                              <div>{customer.name}</div>
                              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>ID: {customer.id}</span>
                            </td>
                            <td>
                              <div>{customer.email}</div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{customer.phone}</div>
                            </td>
                            <td style={{ fontWeight: '800' }}>{totalOrders}</td>
                            <td style={{ fontWeight: '800', color: 'var(--color-accent-teal)' }}>{formatINR(totalRevenue)}</td>
                            <td style={{ fontWeight: '800', color: outstanding > 0 ? '#ef4444' : 'inherit' }}>
                              {formatINR(outstanding)}
                            </td>
                            <td>
                              {latestComm ? (
                                <div style={{ fontSize: '12px' }}>
                                  <strong style={{ color: 'var(--color-text-secondary)' }}>{latestComm.type} ({latestComm.date}):</strong> {latestComm.summary}
                                </div>
                              ) : 'No communications recorded.'}
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
        )}

        {/* TEAM PERFORMANCE TAB (Admin Only) */}
        {activeTab === 'team' && isSalesAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ 
              background: '#ffffff', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-xl)', 
              padding: '24px' 
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} /> Representative Leaderboard
              </h3>

              {teamStats.map((rep, idx) => {
                const sharePct = Math.round((rep.revenue / totalTeamRevenue) * 100);
                return (
                  <div key={rep.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', borderBottom: idx < teamStats.length - 1 ? '1px solid #f1f5f9' : 'none', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: '50%', 
                          background: idx === 0 ? '#fef3c7' : idx === 1 ? '#f1f5f9' : '#ffedd5',
                          color: idx === 0 ? '#d97706' : idx === 1 ? '#475569' : '#ea580c',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '13px'
                        }}>
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', color: 'var(--color-text-primary)' }}>{rep.name}</div>
                          <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted)' }}>
                            Leads Handled: {rep.leadsCount} | Conversion: {rep.conversionRate}%
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '800', color: 'var(--color-accent-teal)', fontSize: '15px' }}>
                          {formatINR(rep.revenue)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '700' }}>
                          Outstanding: <span style={{ color: rep.outstanding > 0 ? '#ef4444' : 'inherit' }}>{formatINR(rep.outstanding)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                      <div className="report-bar-track" style={{ flex: 1 }}>
                        <div 
                          className="report-bar-fill" 
                          style={{ 
                            width: `${sharePct}%`, 
                            background: idx === 0 
                              ? 'linear-gradient(90deg, #f5a06a, #e07040)' 
                              : idx === 1 
                                ? 'linear-gradient(90deg, #70c080, #40a060)' 
                                : 'linear-gradient(90deg, #70a0e8, #4070c8)' 
                          }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--color-text-secondary)', minWidth: '34px', textAlign: 'right' }}>
                        {sharePct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed performance grid */}
            <div className="crm-table-container app-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                Team Metrics Overview
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Salesperson</th>
                      <th>Total Leads</th>
                      <th>Total Orders</th>
                      <th>Conversion Rate</th>
                      <th>Total Revenue</th>
                      <th>Outstanding Collections</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamStats.map(rep => (
                      <tr key={rep.name}>
                        <td style={{ fontWeight: '800' }}>{rep.name}</td>
                        <td>{rep.leadsCount} leads</td>
                        <td>{rep.ordersCount} orders</td>
                        <td style={{ fontWeight: '700' }}>{rep.conversionRate}%</td>
                        <td style={{ fontWeight: '800', color: 'var(--color-accent-teal)' }}>{formatINR(rep.revenue)}</td>
                        <td style={{ fontWeight: '800', color: rep.outstanding > 0 ? '#ef4444' : 'inherit' }}>
                          {formatINR(rep.outstanding)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

  const [salesSummaryData, setSalesSummaryData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [customerPerformanceData, setCustomerPerformanceData] = useState([]);
  const [targetData, setTargetData] = useState(null);
  const [isReportsLoading, setIsReportsLoading] = useState(false);

  const fetchReports = async () => {
    setIsReportsLoading(true);
    try {
      const summaryRes = await apiClient.get(`/reports/sales/summary?date_from=${dateFrom}&date_to=${dateTo}`);
      const productsRes = await apiClient.get(`/reports/sales/top-products?date_from=${dateFrom}&date_to=${dateTo}&limit=10`);
      const customersRes = await apiClient.get(`/reports/sales/customer-performance?date_from=${dateFrom}&date_to=${dateTo}`);
      const targetRes = await apiClient.get('/backend/sales-targets/dashboard').catch(() => null);
      
      setSalesSummaryData(summaryRes.data || []);
      setTopProductsData(productsRes.data || []);
      setCustomerPerformanceData(customersRes.data || []);
      if (targetRes) {
        setTargetData(targetRes.data || targetRes);
      }
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
  // Role detection
  const isSalesAdmin = 
    user?.role === 'Sales Admin' || 
    user?.role === 'Super Admin' || 
    user?.role === 'Admin' || 
    user?.role === 'SUPER_SALES' || 
    user?.role === 'SuperSales' || 
    String(user?.role || '').toLowerCase().includes('supersales') ||
    String(user?.role || '').toLowerCase().includes('admin');
  const myName = user?.name || '';

  // Extract salesperson name from order or lead
  const getSalespersonName = (item) => {
    if (!item) return '';
    return (
      item.salesperson ||
      item.salesPerson ||
      item.salesPersonName ||
      item.salesExecutive?.name ||
      item.assignedTo?.name ||
      item.assignedToName ||
      item.createdByName ||
      item.quotation?.salesperson ||
      item.quotation?.salesPerson ||
      ''
    ).trim();
  };

  // Discover all distinct salespeople across orders, leads, settings, and team
  const discoveredSalespeople = useMemo(() => {
    const namesSet = new Set();
    if (myName) namesSet.add(myName);

    orders.forEach(o => {
      const n = getSalespersonName(o);
      if (n && n !== 'Sales' && n !== 'Salesperson') namesSet.add(n);
    });

    leads.forEach(l => {
      const n = getSalespersonName(l);
      if (n && n !== 'Sales' && n !== 'Salesperson') namesSet.add(n);
    });

    if (settings.salesTargets && typeof settings.salesTargets === 'object') {
      Object.keys(settings.salesTargets).forEach(k => {
        if (k && isNaN(Number(k))) namesSet.add(k);
      });
    }

    ['Rajesh Kumar', 'Aman Sharma', 'Priya Patel', 'SuperSales'].forEach(n => {
      if (n) namesSet.add(n);
    });

    return Array.from(namesSet);
  }, [orders, leads, settings, myName]);

  const [selectedSalesperson, setSelectedSalesperson] = useState(() => {
    if (!isSalesAdmin && myName) return myName;
    return 'ALL';
  });

  const matchesSalesperson = (item, targetName) => {
    if (!targetName || targetName === 'ALL') return true;
    const itemSales = getSalespersonName(item).toLowerCase();
    const target = targetName.toLowerCase();
    if (!itemSales) return false;
    return itemSales === target || itemSales.includes(target) || target.includes(itemSales);
  };

  // Data Filtering based on Date Range
  const isDateInRange = (dateStr) => {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    return d >= from && d <= to;
  };

  // Filter out lost orders from revenue & achievements
  const isLostOrder = (o) => {
    const st = String(o?.status || o?.orderStatus || o?.workflowState || '').toUpperCase();
    return st === 'LOST' || Boolean(o?.lostReason) || Boolean(o?.lossRecord) || Boolean(o?.lostComplaintId);
  };

  const activeOrdersList = useMemo(() => {
    return orders.filter(o => !isLostOrder(o));
  }, [orders]);

  // Current scope filtered data
  const myLeads = useMemo(() => {
    return leads.filter(l => 
      matchesSalesperson(l, selectedSalesperson) && 
      isDateInRange(l.createdAt || l.date)
    );
  }, [leads, selectedSalesperson, dateFrom, dateTo]);

  const myOrders = useMemo(() => {
    return activeOrdersList.filter(o => 
      matchesSalesperson(o, selectedSalesperson) && 
      isDateInRange(o.createdAt || o.orderDate || o.date)
    );
  }, [activeOrdersList, selectedSalesperson, dateFrom, dateTo]);

  const myPayments = useMemo(() => {
    return payments.filter(p => 
      myOrders.some(o => (o.orderNo || o.id) === (p.orderNo || p.orderId)) && 
      isDateInRange(p.date || p.createdAt)
    );
  }, [payments, myOrders, dateFrom, dateTo]);

  const myCustomers = useMemo(() => {
    return customers.filter(c => 
      myOrders.some(o => o.customer?.id === c.id || o.customerName === c.name) || 
      myLeads.some(l => l.companyName === c.name)
    );
  }, [customers, myOrders, myLeads]);

  // Common calculations & formatting helpers
  const formatINR = (value) => {
    const num = Number(value || 0);
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    return `₹${Math.round(num).toLocaleString('en-IN')}`;
  };

  const TODAY_STR = '2026-06-19';

  // Overall Statistics
  const totalLeads = myLeads.length;
  const convertedLeads = myLeads.filter(l => String(l.status).toLowerCase() === 'converted').length;
  const conversionRate = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const totalOutstandingVal = myPayments
    .filter(p => p.status !== 'Paid')
    .reduce((sum, p) => sum + ((Number(p.totalAmount || 0)) - (Number(p.paidAmount || 0))), 0);
  const totalPaidVal = myPayments
    .reduce((sum, p) => sum + Number(p.paidAmount || 0), 0);
  const paymentCollectionRate = (totalPaidVal + totalOutstandingVal) 
    ? Math.round((totalPaidVal / (totalPaidVal + totalOutstandingVal)) * 100) 
    : 0;

  const totalSalesVal = myOrders.reduce((sum, o) => sum + Number(o.payment?.totalAmount || o.totalAmount || o.grandTotal || o.totalValue || 0), 0);
  const displaySalesVal = totalSalesVal;

  // Individual Salesperson Target vs Achievement Breakdown
  const salespersonStats = useMemo(() => {
    return discoveredSalespeople.map(name => {
      // Find assigned target
      let target = 2500000; // Default ₹25.00 L per salesperson
      if (settings.salesTargets && settings.salesTargets[name]) {
        target = Number(settings.salesTargets[name]);
      } else if (targetData?.monthlyTarget && selectedSalesperson === name) {
        target = Number(targetData.monthlyTarget);
      } else if (name === 'SuperSales' || name === 'Rajesh Kumar') {
        target = 5000000; // ₹50.00 L
      } else if (name === 'Aman Sharma') {
        target = 3500000; // ₹35.00 L
      } else if (name === 'Priya Patel') {
        target = 3000000; // ₹30.00 L
      }

      // Orders and Revenue for this salesperson
      const repOrders = activeOrdersList.filter(o => 
        matchesSalesperson(o, name) && 
        isDateInRange(o.createdAt || o.orderDate || o.date)
      );
      const achieved = repOrders.reduce((sum, o) => sum + Number(o.payment?.totalAmount || o.totalAmount || o.grandTotal || o.totalValue || 0), 0);
      
      const repLeads = leads.filter(l => 
        matchesSalesperson(l, name) && 
        isDateInRange(l.createdAt || l.date)
      );
      const converted = repLeads.filter(l => String(l.status).toLowerCase() === 'converted').length;
      const conversionRate = repLeads.length > 0 ? Math.round((converted / repLeads.length) * 100) : 0;

      const remaining = Math.max(0, target - achieved);
      const progress = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 0;

      let status = 'In Progress';
      let statusColor = '#3b82f6';
      let statusBg = '#eff6ff';
      if (achieved >= target) {
        status = '🎯 Target Met';
        statusColor = '#16a34a';
        statusBg = '#dcfce7';
      } else if (progress >= 60) {
        status = '🔥 On Track';
        statusColor = '#0284c7';
        statusBg = '#e0f2fe';
      } else if (progress < 25) {
        status = '⚠️ Needs Attention';
        statusColor = '#dc2626';
        statusBg = '#fee2e2';
      }

      const repPayments = payments.filter(p => repOrders.some(o => (o.orderNo || o.id) === (p.orderNo || p.orderId)) && isDateInRange(p.date || p.createdAt));
      const repOutstanding = repPayments.reduce((sum, p) => sum + (p.status !== 'Paid' ? (Number(p.totalAmount || 0) - Number(p.paidAmount || 0)) : 0), 0);

      return {
        name,
        target,
        achieved,
        remaining,
        progress,
        ordersCount: repOrders.length,
        leadsCount: repLeads.length,
        conversionRate,
        status,
        statusColor,
        statusBg,
        outstanding: repOutstanding,
        revenue: achieved
      };
    }).sort((a, b) => b.achieved - a.achieved);
  }, [discoveredSalespeople, activeOrdersList, leads, payments, settings, targetData, selectedSalesperson, dateFrom, dateTo]);

  // Current scope isolated target metrics
  const currentTargetMetrics = useMemo(() => {
    if (selectedSalesperson !== 'ALL') {
      const personStat = salespersonStats.find(s => s.name.toLowerCase() === selectedSalesperson.toLowerCase());
      if (personStat) {
        return {
          target: personStat.target,
          achieved: personStat.achieved,
          remaining: personStat.remaining,
          progress: personStat.progress,
          label: personStat.name
        };
      }
    }

    const totalTarget = salespersonStats.reduce((sum, s) => sum + s.target, 0) || 5000000;
    const totalAchieved = displaySalesVal;
    const totalRemaining = Math.max(0, totalTarget - totalAchieved);
    const totalProgress = totalTarget > 0 ? Math.min(100, Math.round((totalAchieved / totalTarget) * 100)) : 0;

    return {
      target: totalTarget,
      achieved: totalAchieved,
      remaining: totalRemaining,
      progress: totalProgress,
      label: 'Entire Sales Team'
    };
  }, [selectedSalesperson, salespersonStats, displaySalesVal]);

  const assignedTarget = currentTargetMetrics.target;
  const achievedVal = currentTargetMetrics.achieved;
  const targetPct = currentTargetMetrics.progress;
  const targetRemaining = currentTargetMetrics.remaining;

  const teamStats = salespersonStats;
  const totalTeamRevenue = teamStats.reduce((sum, t) => sum + t.achieved, 0) || 1;

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

  return (
    <div className="reports-wrapper">
      <style>{`
        .reports-wrapper {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          min-height: 80vh;
          width: 100%;
          box-sizing: border-box;
        }

        .reports-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .reports-header-row {
            flex-direction: column;
            align-items: flex-start;
            padding: 14px 16px;
            gap: 10px;
          }
        }

        .reports-filter-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          flex-shrink: 0;
        }

        .reports-date-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .reports-date-inputs-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .reports-date-input {
          padding: 7px 10px;
          border-radius: 8px;
          border: 1.5px solid #cbd5e1;
          font-size: 12.5px;
          background: #ffffff;
          color: #1e293b;
          font-weight: 600;
          outline: none;
          transition: border-color 0.2s;
        }
        .reports-date-input:focus {
          border-color: #0284c7;
        }

        .reports-apply-btn {
          padding: 7px 14px;
          border-radius: 8px;
          border: none;
          background: #0284c7;
          color: #ffffff;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 4px rgba(2, 132, 199, 0.2);
          transition: background 0.2s, transform 0.1s;
        }
        .reports-apply-btn:hover {
          background: #0369a1;
        }

        .reports-export-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .reports-export-btn {
          padding: 7px 14px;
          border-radius: 8px;
          border: 1.5px solid #e2e8f0;
          background: #ffffff;
          color: #002e5d;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .reports-export-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        @media (max-width: 640px) {
          .reports-filter-bar {
            padding: 12px 14px;
            gap: 12px;
            flex-direction: column;
            align-items: stretch;
          }
          .reports-date-group {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          .reports-date-inputs-wrapper {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 6px;
            align-items: center;
          }
          .reports-date-input {
            width: 100%;
            min-width: 0;
            padding: 8px 6px;
            font-size: 11.5px;
            box-sizing: border-box;
          }
          .reports-apply-btn {
            width: 100%;
            justify-content: center;
            padding: 9px 12px;
            font-size: 13px;
            margin-top: 2px;
          }
          .reports-export-group {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .reports-export-btn {
            width: 100%;
            justify-content: center;
            padding: 8px 10px;
          }
        }

        /* Reports tabs - horizontal scroll on small screens */
        .reports-tabs-scroll {
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
          box-sizing: border-box;
          padding: 10px 16px;
          flex: 0 0 auto;
          flex-shrink: 0;
          min-height: 56px;
          display: flex;
          align-items: center;
        }
        .reports-tabs-scroll::-webkit-scrollbar {
          display: none;
        }

        .reports-tabs {
          display: flex;
          flex-wrap: nowrap;
          width: max-content;
          min-width: max-content;
          gap: 8px;
          align-items: center;
        }

        .reports-tabs > * {
          flex: 0 0 auto;
          white-space: nowrap;
        }

        .reports-tab-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          cursor: pointer;
          white-space: nowrap;
          flex: 0 0 auto;
          flex-shrink: 0;
          transition: all 0.2s ease;
          user-select: none;
          line-height: 1;
          height: 38px;
          box-sizing: border-box;
        }
        .reports-tab-pill:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }
        .reports-tab-pill.active {
          background: #002e5d;
          color: #ffffff;
          border-color: #002e5d;
          box-shadow: 0 2px 6px rgba(0, 46, 93, 0.25);
        }

        .reports-content-area {
          flex: 1;
          padding: clamp(14px, 2.5vw, 24px);
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
          box-sizing: border-box;
        }

        .reports-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          width: 100%;
        }

        @media (max-width: 1024px) {
          .reports-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }

        @media (max-width: 500px) {
          .reports-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
        }

        .reports-kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        @media (max-width: 500px) {
          .reports-kpi-card {
            padding: 10px 12px;
          }
        }

        .reports-kpi-label {
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .reports-kpi-val {
          font-size: clamp(18px, 3.5vw, 24px);
          font-weight: 900;
          color: #0f172a;
          margin: 6px 0 4px 0;
          line-height: 1.15;
          word-break: break-word;
        }

        .reports-kpi-sub {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          line-height: 1.3;
        }

        .reports-two-col-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          width: 100%;
        }

        @media (max-width: 860px) {
          .reports-two-col-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .reports-panel {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: clamp(14px, 2.5vw, 20px);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .reports-panel-title {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          color: #475569;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 7px;
          letter-spacing: 0.03em;
        }

        .reports-table-panel {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: clamp(14px, 2.5vw, 20px);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          width: 100%;
          box-sizing: border-box;
        }

        .reports-table-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #ffffff;
        }
      `}</style>

      {/* Header */}
      <div className="reports-header-row">
        <div>
          <h2 className="module-title" style={{ fontSize: '18px', fontWeight: '800', color: '#002e5d', margin: 0 }}>Analytics &amp; Reports</h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0', fontWeight: '500' }}>
            {isSalesAdmin ? 'Company-wide' : `${user?.name || 'My'}`} Sales Analytics Dashboard
          </p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', color: '#475569' }}>
          <UserCheck size={13} color="#0284c7" />
          Role: <span style={{ color: '#002e5d' }}>{user?.role || 'Sales Representative'}</span>
        </div>
      </div>

      {/* Date Range & Salesperson Filter Controls */}
      <div className="reports-filter-bar">
        <div className="reports-date-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: '700', fontSize: '12px' }}>
            <Calendar size={14} color="#0284c7" />
            <span>Period:</span>
          </div>
          <div className="reports-date-inputs-wrapper">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="reports-date-input"
            />
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="reports-date-input"
            />
          </div>

          {/* Salesperson Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
            <Users size={14} color="#0284c7" />
            <select
              value={selectedSalesperson}
              onChange={(e) => setSelectedSalesperson(e.target.value)}
              className="reports-date-input"
              style={{ fontWeight: '700', color: '#002e5d', background: '#ffffff', cursor: 'pointer' }}
            >
              <option value="ALL">👥 All Sales Team (Consolidated)</option>
              {discoveredSalespeople.map(name => (
                <option key={name} value={name}>
                  👤 {name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchReports}
            disabled={isReportsLoading}
            className="reports-apply-btn"
          >
            <RefreshCw size={13} className={isReportsLoading ? 'animate-spin' : ''} />
            Apply
          </button>
        </div>

        <div className="reports-export-group">
          <button
            onClick={() => exportSalesReportPDF({ date_from: dateFrom, date_to: dateTo })}
            className="reports-export-btn"
          >
            <Download size={13} color="#0284c7" />
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
            className="reports-export-btn"
          >
            <Download size={13} color="#0284c7" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Swipeable Tabs Bar */}
      <div className="reports-tabs-scroll w-full max-w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
        <div className="reports-tabs flex w-max min-w-max flex-nowrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`reports-tab-pill shrink-0 whitespace-nowrap ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main View Area */}
      <div className="reports-content-area">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* KPI Cards Grid */}
            <div className="reports-kpi-grid">
              <div className="reports-kpi-card" style={{ borderLeft: '4px solid #0284c7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="reports-kpi-label">Sales Revenue</span>
                  <DollarSign size={16} color="#0284c7" />
                </div>
                <div className="reports-kpi-val">{formatINR(displaySalesVal)}</div>
                <div className="reports-kpi-sub">
                  Orders: <strong>{myOrders.length} confirmed</strong>
                </div>
              </div>

              <div className="reports-kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="reports-kpi-label">Lead Conversion</span>
                  <Percent size={16} color="#10b981" />
                </div>
                <div className="reports-kpi-val">{conversionRate}%</div>
                <div className="reports-kpi-sub">
                  Converted: {convertedLeads} of {totalLeads}
                </div>
              </div>

              <div className="reports-kpi-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="reports-kpi-label">Outstanding Balances</span>
                  <TrendingUp size={16} color="#8b5cf6" />
                </div>
                <div className="reports-kpi-val">{formatINR(totalOutstandingVal)}</div>
                <div className="reports-kpi-sub">
                  Collection Rate: {paymentCollectionRate}%
                </div>
              </div>

              <div className="reports-kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="reports-kpi-label">Pending Follow-Ups</span>
                  <Calendar size={16} color="#f59e0b" />
                </div>
                <div className="reports-kpi-val">{followUpLeads.length}</div>
                <div className="reports-kpi-sub">
                  Overdue: <span style={{ color: overdueFollowUps.length > 0 ? '#ef4444' : 'inherit' }}>{overdueFollowUps.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Summary Progress Metrics */}
            <div className="reports-two-col-grid">
              <div className="reports-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div className="reports-panel-title" style={{ margin: 0 }}>
                    <Target size={16} color="#0284c7" /> Target vs Achievement Progress
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: selectedSalesperson === 'ALL' ? '#f1f5f9' : '#e0f2fe',
                    color: selectedSalesperson === 'ALL' ? '#475569' : '#0369a1',
                    border: '1px solid #cbd5e1'
                  }}>
                    {selectedSalesperson === 'ALL' ? '👥 All Team' : `👤 ${selectedSalesperson}`}
                  </span>
                </div>
                <div className="report-bar-row">
                  <div className="report-bar-label-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: '#475569' }}>
                    <span style={{ fontWeight: '600' }}>Target: <strong>{formatINR(assignedTarget)}</strong></span>
                    <span style={{ fontWeight: '800', color: '#002e5d' }}>{targetPct}% Achieved</span>
                  </div>
                  <div className="report-bar-track" style={{ height: '11px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div
                      className="report-bar-fill"
                      style={{
                        width: `${targetPct}%`,
                        height: '100%',
                        background: targetPct >= 100
                          ? 'linear-gradient(90deg, #10b981, #059669)'
                          : 'linear-gradient(90deg, #0284c7, #38bdf8)',
                        borderRadius: '6px',
                        transition: 'width 0.4s ease'
                      }}
                    ></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginTop: '6px', color: '#64748b', fontWeight: '600' }}>
                    <span>Achieved: <strong style={{ color: '#059669' }}>{formatINR(achievedVal)}</strong></span>
                    <span>Remaining: <strong style={{ color: targetRemaining > 0 ? '#ef4444' : '#10b981' }}>{formatINR(targetRemaining)}</strong></span>
                  </div>
                </div>
              </div>

              <div className="reports-panel">
                <div className="reports-panel-title">
                  <TrendingUp size={16} color="#8b5cf6" /> Payment Collection Efficiency
                </div>
                <div className="report-bar-row">
                  <div className="report-bar-label-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: '#475569' }}>
                    <span>Collected Rate</span>
                    <span style={{ fontWeight: '800', color: '#002e5d' }}>{paymentCollectionRate}% Efficiency</span>
                  </div>
                  <div className="report-bar-track" style={{ height: '11px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div className="report-bar-fill" style={{ width: `${paymentCollectionRate}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #c084fc)', borderRadius: '6px' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginTop: '6px', color: '#64748b', fontWeight: '600' }}>
                    <span>Paid: <strong style={{ color: '#10b981' }}>{formatINR(totalPaidVal)}</strong></span>
                    <span>Outstanding: <strong style={{ color: totalOutstandingVal > 0 ? '#ef4444' : '#64748b' }}>{formatINR(totalOutstandingVal)}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Salesperson Target Breakdown Panel */}
            <div className="reports-panel" style={{ marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div className="reports-panel-title" style={{ margin: 0 }}>
                  <Users size={16} color="#0284c7" /> Salesperson Target vs Achievement Breakdown
                </div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  Showing isolated targets &amp; performance for {salespersonStats.length} sales executives
                </span>
              </div>

              <div className="reports-table-scroll">
                <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#002e5d', color: '#ffffff' }}>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Salesperson</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'right' }}>Assigned Target</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'right' }}>Achieved Revenue</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left', minWidth: '150px' }}>Progress (% Achieved)</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'right' }}>Remaining Deficit</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salespersonStats.map(rep => (
                      <tr key={rep.name} style={{ borderBottom: '1px solid #f1f5f9', background: selectedSalesperson === rep.name ? '#f0f9ff' : 'inherit' }}>
                        <td style={{ fontWeight: '800', padding: '10px 14px', color: '#002e5d' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>👤</span>
                            <span>{rep.name}</span>
                            {selectedSalesperson === rep.name && (
                              <span style={{ fontSize: '10px', background: '#0284c7', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>Active Filter</span>
                            )}
                          </div>
                        </td>
                        <td style={{ fontWeight: '800', padding: '10px 14px', textAlign: 'right', color: '#475569' }}>
                          {formatINR(rep.target)}
                        </td>
                        <td style={{ fontWeight: '800', padding: '10px 14px', textAlign: 'right', color: '#059669' }}>
                          {formatINR(rep.achieved)}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="report-bar-track" style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                              <div
                                className="report-bar-fill"
                                style={{
                                  width: `${rep.progress}%`,
                                  height: '100%',
                                  background: rep.progress >= 100 ? '#10b981' : '#0284c7',
                                  borderRadius: '4px'
                                }}
                              ></div>
                            </div>
                            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#002e5d', minWidth: '34px', textAlign: 'right' }}>
                              {rep.progress}%
                            </span>
                          </div>
                        </td>
                        <td style={{ fontWeight: '800', padding: '10px 14px', textAlign: 'right', color: rep.remaining > 0 ? '#dc2626' : '#10b981' }}>
                          {rep.remaining > 0 ? formatINR(rep.remaining) : 'Target Met 🎉'}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '800',
                            background: rep.statusBg,
                            color: rep.statusColor,
                            display: 'inline-block'
                          }}>
                            {rep.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedSalesperson(selectedSalesperson === rep.name ? 'ALL' : rep.name)}
                            style={{
                              padding: '3px 9px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              border: selectedSalesperson === rep.name ? '1px solid #0284c7' : '1px solid #cbd5e1',
                              background: selectedSalesperson === rep.name ? '#0284c7' : '#ffffff',
                              color: selectedSalesperson === rep.name ? '#ffffff' : '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            {selectedSalesperson === rep.name ? 'Clear' : 'Isolate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="reports-kpi-grid">
              <div className="reports-kpi-card" style={{ borderLeft: '4px solid #0284c7' }}>
                <span className="reports-kpi-label">Active Leads</span>
                <span className="reports-kpi-val">{myLeads.filter(l => ['New', 'Follow-up', 'Sample Stage', 'Quotation'].includes(l.status)).length}</span>
              </div>
              <div className="reports-kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
                <span className="reports-kpi-label">Converted Leads</span>
                <span className="reports-kpi-val">{myLeads.filter(l => l.status === 'Converted').length}</span>
              </div>
              <div className="reports-kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
                <span className="reports-kpi-label">Lost Leads</span>
                <span className="reports-kpi-val">{myLeads.filter(l => l.status === 'Lost').length}</span>
              </div>
            </div>

            <div className="reports-panel">
              <div className="reports-panel-title">
                <Users size={16} color="#0284c7" /> Leads Status Summary
              </div>
              {leadStatuses.map(status => {
                const count = leadStatusCounts[status] || 0;
                const pct = totalLeads ? Math.round((count / totalLeads) * 100) : 0;
                let barColor = '#0284c7';
                if (status === 'Converted') barColor = '#10b981';
                if (status === 'Lost') barColor = '#ef4444';
                if (status === 'Follow-up') barColor = '#f59e0b';
                return (
                  <div key={status} className="report-bar-row" style={{ marginBottom: '12px' }}>
                    <div className="report-bar-label-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: '#475569' }}>
                      <span style={{ fontWeight: '600' }}>{status}</span>
                      <span style={{ fontWeight: '800', color: '#002e5d' }}>{count} leads ({pct}%)</span>
                    </div>
                    <div className="report-bar-track" style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div className="report-bar-fill" style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Leads list table */}
            <div className="reports-table-panel">
              <div className="reports-panel-title">
                <ClipboardList size={16} color="#0284c7" /> Leads Directory
              </div>
              <div className="reports-table-scroll">
                <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#002e5d', color: '#ffffff' }}>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Lead ID</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Company Name</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Contact Person</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Follow Up Date</th>
                      {isSalesAdmin && <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Salesperson</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {myLeads.length === 0 ? (
                      <tr>
                        <td colSpan={isSalesAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                          No leads assigned.
                        </td>
                      </tr>
                    ) : (
                      myLeads.map(lead => (
                        <tr key={lead.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ fontWeight: '800', padding: '10px 14px' }}>#{lead.id}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: '700', color: '#002e5d' }}>{lead.companyName}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{lead.requirements}</div>
                          </td>
                          <td style={{ padding: '10px 14px' }}>{lead.contactPerson || 'N/A'}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span className={`badge badge-${
                              lead.status === 'Converted' ? 'success' : 
                              lead.status === 'Lost' ? 'danger' : 
                              lead.status === 'Follow-up' ? 'warning' : 'info'
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                          <td style={{ fontWeight: '700', padding: '10px 14px', color: lead.followUpDate && lead.followUpDate < TODAY_STR ? '#ef4444' : 'inherit' }}>
                            {lead.followUpDate || 'No follow-up set'}
                          </td>
                          {isSalesAdmin && <td style={{ fontWeight: '700', padding: '10px 14px' }}>{lead.salesperson}</td>}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="reports-two-col-grid">
              {/* Monthly Sales Vertical Bar Chart */}
              <div className="reports-panel">
                <div className="reports-panel-title">
                  <Calendar size={16} color="#0284c7" /> Sales Amount by Month
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-around', 
                  alignItems: 'flex-end', 
                  height: '240px', 
                  padding: '10px 0', 
                  borderBottom: '1px solid #e2e8f0', 
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
                          minWidth: '55px', 
                          maxWidth: '80px',
                          height: '100%',
                          justifyContent: 'flex-end',
                          gap: '8px'
                        }}>
                          <span style={{ 
                            fontSize: '10px', 
                            fontWeight: '800', 
                            color: '#002e5d',
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
                                background: 'linear-gradient(180deg, #0284c7, #38bdf8)',
                                borderRadius: '6px 6px 0 0',
                                transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)'
                              }} 
                            ></div>
                          </div>

                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: '700', 
                            color: '#64748b',
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
                          minWidth: '55px', 
                          maxWidth: '80px',
                          height: '100%',
                          justifyContent: 'flex-end',
                          gap: '8px'
                        }}>
                          <span style={{ 
                            fontSize: '10px', 
                            fontWeight: '800', 
                            color: '#002e5d',
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
                                background: 'linear-gradient(180deg, #0284c7, #38bdf8)',
                                borderRadius: '6px 6px 0 0',
                                transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)'
                              }} 
                            ></div>
                          </div>

                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: '700', 
                            color: '#64748b',
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
              <div className="reports-panel">
                <div className="reports-panel-title">
                  <ClipboardList size={16} color="#0284c7" /> Product Performance Breakdown
                </div>
                
                {topProductsData.length > 0 ? (
                  topProductsData.map(prod => {
                    const revenue = parseFloat(prod.total_revenue || 0);
                    const quantity = parseFloat(prod.total_quantity || 0);
                    const maxRev = Math.max(...topProductsData.map(p => parseFloat(p.total_revenue || 0)), 1);
                    const pct = Math.round((revenue / maxRev) * 100);
                    return (
                      <div key={prod.id} className="report-bar-row" style={{ marginBottom: '12px' }}>
                        <div className="report-bar-label-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: '#475569' }}>
                          <span style={{ fontWeight: '700', color: '#002e5d' }}>{prod.product_name} ({prod.product_code})</span>
                          <span style={{ fontWeight: '800' }}>
                            {quantity} {prod.unit_of_measure} ({formatINR(revenue)})
                          </span>
                        </div>
                        <div className="report-bar-track" style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div className="report-bar-fill" style={{ width: `${pct}%`, height: '100%', background: '#0284c7', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    );
                  })
                ) : Object.keys(productStats).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '12px' }}>
                    No products sold.
                  </div>
                ) : (
                  Object.keys(productStats).sort((a, b) => productStats[b].revenue - productStats[a].revenue).map(pName => {
                    const stats = productStats[pName];
                    const maxRevenue = Math.max(...Object.values(productStats).map(ps => ps.revenue), 1);
                    const pct = Math.round((stats.revenue / maxRevenue) * 100);
                    return (
                      <div key={pName} className="report-bar-row" style={{ marginBottom: '12px' }}>
                        <div className="report-bar-label-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: '#475569' }}>
                          <span style={{ fontWeight: '700', color: '#002e5d' }}>{pName}</span>
                          <span style={{ fontWeight: '800' }}>
                            {stats.qty} sold ({formatINR(stats.revenue)})
                          </span>
                        </div>
                        <div className="report-bar-track" style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div className="report-bar-fill" style={{ width: `${pct}%`, height: '100%', background: '#0284c7', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Orders list table */}
            <div className="reports-table-panel">
              <div className="reports-panel-title">
                <DollarSign size={16} color="#0284c7" /> Orders Log
              </div>
              <div className="reports-table-scroll">
                <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#002e5d', color: '#ffffff' }}>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Order No</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Customer</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Product Details</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Total Value</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Order Status</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                          No orders registered.
                        </td>
                      </tr>
                    ) : (
                      myOrders.map(order => {
                        const orderVal = order.payment?.totalAmount || order.totalValue || 0;
                        const payStatus = order.payment?.paid === order.payment?.totalAmount && order.payment?.totalAmount > 0 
                          ? 'Paid' 
                          : order.payment?.paid > 0 
                            ? 'Partial' 
                            : 'Unpaid';
                        
                        return (
                          <tr key={order.orderNo} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ fontWeight: '800', padding: '10px 14px' }}>{order.orderNo}</td>
                            <td style={{ padding: '10px 14px' }}>{order.date}</td>
                            <td style={{ fontWeight: '700', padding: '10px 14px', color: '#002e5d' }}>{order.customer?.name || order.customerName}</td>
                            <td style={{ padding: '10px 14px' }}>{order.products}</td>
                            <td style={{ fontWeight: '800', padding: '10px 14px', color: '#0284c7' }}>{formatINR(orderVal)}</td>
                            <td style={{ padding: '10px 14px' }}>
                              <span className={`badge badge-${
                                order.status === 'Closed' ? 'success' : 
                                order.status === 'Cancelled' ? 'danger' : 'info'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="reports-kpi-grid">
              <div className="reports-kpi-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                <span className="reports-kpi-label">Active Leads needing Follow-ups</span>
                <span className="reports-kpi-val">{followUpLeads.length}</span>
              </div>
              <div className="reports-kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
                <span className="reports-kpi-label">Overdue Follow-ups</span>
                <span className="reports-kpi-val">{overdueFollowUps.length}</span>
                <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>Prioritize these immediately</span>
              </div>
              <div className="reports-kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
                <span className="reports-kpi-label">Upcoming Follow-ups</span>
                <span className="reports-kpi-val">{upcomingFollowUps.length}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Scheduled for future dates</span>
              </div>
            </div>

            <div className="reports-table-panel">
              <div className="reports-panel-title">
                <Calendar size={16} color="#0284c7" /> Follow-Up Schedule
              </div>
              <div className="reports-table-scroll">
                <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#002e5d', color: '#ffffff' }}>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Company</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Contact Person</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Follow Up Date</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Latest Communication</th>
                      {isSalesAdmin && <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Representative</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {followUpLeads.length === 0 ? (
                      <tr>
                        <td colSpan={isSalesAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
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
                          <tr key={lead.id} style={{ background: isOverdue ? 'rgba(239, 68, 68, 0.03)' : 'inherit', borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ fontWeight: '700', padding: '10px 14px' }}>
                              <div style={{ color: '#002e5d' }}>{lead.companyName}</div>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>ID: #{lead.id}</span>
                            </td>
                            <td style={{ padding: '10px 14px' }}>{lead.contactPerson}</td>
                            <td style={{ fontWeight: '800', padding: '10px 14px', color: isOverdue ? '#ef4444' : '#0284c7' }}>
                              {lead.followUpDate} {isOverdue && ' (OVERDUE)'}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span className="badge badge-info">{lead.status}</span>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              {latestTimeline ? (
                                <div style={{ fontSize: '12px' }}>
                                  <strong style={{ color: '#475569' }}>[{latestTimeline.stage}]</strong> {latestTimeline.text}
                                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{latestTimeline.date}</div>
                                </div>
                              ) : 'No remarks logged.'}
                            </td>
                            {isSalesAdmin && <td style={{ fontWeight: '700', padding: '10px 14px' }}>{lead.salesperson}</td>}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="reports-panel" style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
              gap: 'clamp(16px, 4vw, 30px)',
              alignItems: 'center'
            }}>
              {/* Target Graphic / Status */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ 
                  width: '150px', 
                  height: '150px', 
                  borderRadius: '50%', 
                  background: `conic-gradient(#0284c7 ${targetPct}%, #f1f5f9 0)`,
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  marginBottom: '14px',
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.12)'
                }}>
                  <div style={{
                    width: '124px',
                    height: '124px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)'
                  }}>
                    <span style={{ fontSize: '26px', fontWeight: '900', color: '#002e5d', lineHeight: 1 }}>
                      {targetPct}%
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginTop: '4px' }}>
                      Completed
                    </span>
                  </div>
                </div>
                
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#002e5d', margin: '4px 0 0 0' }}>
                  {targetPct >= 80 ? 'Exceptional Performance!' : targetPct >= 50 ? 'On Track' : 'Action Required'}
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', maxWidth: '300px', marginTop: '6px', lineHeight: 1.4 }}>
                  {targetPct >= 80 
                    ? 'Excellent job! You are hitting key sales milestones and driving top-line revenue.' 
                    : targetPct >= 50 
                      ? 'Progress is steady. Convert pending high-value quotations to guarantee goal completion.'
                      : 'Immediate follow-up on outstanding payments and warm leads is required to secure targets.'}
                </p>
              </div>

              {/* Targets detail */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                    Target Assigned
                  </span>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#002e5d', marginTop: '4px' }}>
                    {formatINR(assignedTarget)}
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#16a34a' }}>
                    Revenue Achieved
                  </span>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#15803d', marginTop: '4px' }}>
                    {formatINR(achievedVal)}
                  </div>
                </div>

                <div style={{ background: targetRemaining > 0 ? '#fef2f2' : '#f0fdf4', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${targetRemaining > 0 ? '#fecaca' : '#bbf7d0'}` }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: targetRemaining > 0 ? '#dc2626' : '#16a34a' }}>
                    Remaining Deficit
                  </span>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: targetRemaining > 0 ? '#b91c1c' : '#15803d', marginTop: '4px' }}>
                    {targetRemaining > 0 ? formatINR(targetRemaining) : 'Target Reached! 🎉'}
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Salesperson Target & Performance Allocation */}
            <div className="reports-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div className="reports-panel-title" style={{ margin: 0 }}>
                  <Users size={16} color="#0284c7" /> Sales Team Target Allocation &amp; Individual Achievement
                </div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  Total Allocated Target: <strong style={{ color: '#002e5d' }}>{formatINR(salespersonStats.reduce((s, x) => s + x.target, 0))}</strong>
                </span>
              </div>

              <div className="reports-table-scroll">
                <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#002e5d', color: '#ffffff' }}>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Salesperson</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'right' }}>Assigned Target</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'right' }}>Achieved Revenue</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left', minWidth: '150px' }}>Progress (% Achieved)</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'right' }}>Remaining Deficit</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'center' }}>Target Status</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'center' }}>Isolate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salespersonStats.map(rep => (
                      <tr key={rep.name} style={{ borderBottom: '1px solid #f1f5f9', background: selectedSalesperson === rep.name ? '#f0f9ff' : 'inherit' }}>
                        <td style={{ fontWeight: '800', padding: '10px 14px', color: '#002e5d' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>👤</span>
                            <span>{rep.name}</span>
                            {selectedSalesperson === rep.name && (
                              <span style={{ fontSize: '10px', background: '#0284c7', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>Active Filter</span>
                            )}
                          </div>
                        </td>
                        <td style={{ fontWeight: '800', padding: '10px 14px', textAlign: 'right', color: '#475569' }}>
                          {formatINR(rep.target)}
                        </td>
                        <td style={{ fontWeight: '800', padding: '10px 14px', textAlign: 'right', color: '#059669' }}>
                          {formatINR(rep.achieved)}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="report-bar-track" style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                              <div
                                className="report-bar-fill"
                                style={{
                                  width: `${rep.progress}%`,
                                  height: '100%',
                                  background: rep.progress >= 100 ? '#10b981' : '#0284c7',
                                  borderRadius: '4px'
                                }}
                              ></div>
                            </div>
                            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#002e5d', minWidth: '34px', textAlign: 'right' }}>
                              {rep.progress}%
                            </span>
                          </div>
                        </td>
                        <td style={{ fontWeight: '800', padding: '10px 14px', textAlign: 'right', color: rep.remaining > 0 ? '#dc2626' : '#10b981' }}>
                          {rep.remaining > 0 ? formatINR(rep.remaining) : 'Target Met 🎉'}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '800',
                            background: rep.statusBg,
                            color: rep.statusColor,
                            display: 'inline-block'
                          }}>
                            {rep.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedSalesperson(selectedSalesperson === rep.name ? 'ALL' : rep.name)}
                            style={{
                              padding: '3px 9px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              border: selectedSalesperson === rep.name ? '1px solid #0284c7' : '1px solid #cbd5e1',
                              background: selectedSalesperson === rep.name ? '#0284c7' : '#ffffff',
                              color: selectedSalesperson === rep.name ? '#ffffff' : '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            {selectedSalesperson === rep.name ? 'Clear' : 'Isolate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="reports-kpi-grid">
              <div className="reports-kpi-card" style={{ borderLeft: '4px solid #0284c7' }}>
                <span className="reports-kpi-label">My Customers</span>
                <span className="reports-kpi-val">{myCustomers.length}</span>
              </div>
              <div className="reports-kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
                <span className="reports-kpi-label">Active Orders</span>
                <span className="reports-kpi-val">{myOrders.filter(o => o.status !== 'Closed' && o.status !== 'Cancelled').length}</span>
              </div>
              <div className="reports-kpi-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                <span className="reports-kpi-label">Repeat Customers</span>
                <span className="reports-kpi-val">{myCustomers.filter(c => (c.totalOrders > 1 || (c.ordersHistory && c.ordersHistory.length > 1))).length}</span>
              </div>
            </div>

            <div className="reports-table-panel">
              <div className="reports-panel-title">
                <UserCheck size={16} color="#0284c7" /> Customers List
              </div>
              <div className="reports-table-scroll">
                <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#002e5d', color: '#ffffff' }}>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Customer Name</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Contact Info</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Total Orders</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Total Value</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Outstanding Balance</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Latest Communication</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerPerformanceData.length > 0 ? (
                      customerPerformanceData.map(customer => {
                        const totalOrders = customer.order_count;
                        const totalRevenue = parseFloat(customer.total_spent || 0);
                        const completed = customer.completed_orders;
                        return (
                          <tr key={customer.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ fontWeight: '700', padding: '10px 14px' }}>
                              <div style={{ color: '#002e5d' }}>{customer.customer_name}</div>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>Code: {customer.customer_code}</span>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <div>{customer.city || 'N/A'}, {customer.state || 'N/A'}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>GSTIN: {customer.gstin || 'N/A'}</div>
                            </td>
                            <td style={{ fontWeight: '800', padding: '10px 14px' }}>{totalOrders}</td>
                            <td style={{ fontWeight: '800', padding: '10px 14px', color: '#0284c7' }}>{formatINR(totalRevenue)}</td>
                            <td style={{ fontWeight: '800', padding: '10px 14px' }}>
                              {completed} / {totalOrders} Completed
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <div style={{ fontSize: '12px' }}>
                                Last Order: {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'N/A'}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : myCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
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
                          <tr key={customer.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ fontWeight: '700', padding: '10px 14px' }}>
                              <div style={{ color: '#002e5d' }}>{customer.name}</div>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>ID: {customer.id}</span>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <div>{customer.email}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{customer.phone}</div>
                            </td>
                            <td style={{ fontWeight: '800', padding: '10px 14px' }}>{totalOrders}</td>
                            <td style={{ fontWeight: '800', padding: '10px 14px', color: '#0284c7' }}>{formatINR(totalRevenue)}</td>
                            <td style={{ fontWeight: '800', padding: '10px 14px', color: outstanding > 0 ? '#ef4444' : 'inherit' }}>
                              {formatINR(outstanding)}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              {latestComm ? (
                                <div style={{ fontSize: '12px' }}>
                                  <strong style={{ color: '#475569' }}>[{latestComm.type}]</strong> {latestComm.summary}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="reports-panel">
              <div className="reports-panel-title">
                <Users size={16} color="#0284c7" /> Representative Leaderboard
              </div>

              {teamStats.map((rep, idx) => {
                const sharePct = Math.round((rep.revenue / totalTeamRevenue) * 100);
                return (
                  <div key={rep.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px', borderBottom: idx < teamStats.length - 1 ? '1px solid #f1f5f9' : 'none', paddingBottom: '14px' }}>
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
                          <div style={{ fontWeight: '800', color: '#002e5d' }}>{rep.name}</div>
                          <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                            Leads Handled: {rep.leadsCount} | Conversion: {rep.conversionRate}%
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '900', color: '#0284c7', fontSize: '15px' }}>
                          {formatINR(rep.revenue)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                          Outstanding: <span style={{ color: rep.outstanding > 0 ? '#ef4444' : 'inherit' }}>{formatINR(rep.outstanding)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                      <div className="report-bar-track" style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div 
                          className="report-bar-fill" 
                          style={{ 
                            width: `${sharePct}%`, 
                            height: '100%',
                            background: idx === 0 
                              ? 'linear-gradient(90deg, #f5a06a, #e07040)' 
                              : idx === 1 
                                ? 'linear-gradient(90deg, #70c080, #40a060)' 
                                : 'linear-gradient(90deg, #70a0e8, #4070c8)' 
                          }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', minWidth: '34px', textAlign: 'right' }}>
                        {sharePct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed performance grid */}
            <div className="reports-table-panel">
              <div className="reports-panel-title">
                <TrendingUp size={16} color="#0284c7" /> Team Metrics Overview
              </div>
              <div className="reports-table-scroll">
                <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#002e5d', color: '#ffffff' }}>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Salesperson</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Total Leads</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Total Orders</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Conversion Rate</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Total Revenue</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', textAlign: 'left' }}>Outstanding Collections</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamStats.map(rep => (
                      <tr key={rep.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ fontWeight: '800', padding: '10px 14px', color: '#002e5d' }}>{rep.name}</td>
                        <td style={{ padding: '10px 14px' }}>{rep.leadsCount} leads</td>
                        <td style={{ padding: '10px 14px' }}>{rep.ordersCount} orders</td>
                        <td style={{ fontWeight: '700', padding: '10px 14px' }}>{rep.conversionRate}%</td>
                        <td style={{ fontWeight: '800', padding: '10px 14px', color: '#0284c7' }}>{formatINR(rep.revenue)}</td>
                        <td style={{ fontWeight: '800', padding: '10px 14px', color: rep.outstanding > 0 ? '#ef4444' : 'inherit' }}>
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

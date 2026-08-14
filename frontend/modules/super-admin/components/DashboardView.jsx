import React, { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ComposedChart 
} from 'recharts';
import { motion } from 'framer-motion';
import { useERP } from '@/shared/context/ERPContext';
import { backendFetch } from '@/lib/backendFetch';
import { computeFinancialData, formatCurrency, formatNumber, formatPercent, getDateRangeLabel } from '../utils/financialCalculations';
import { useSuperAdminFilter } from '../context/SuperAdminFilterContext';
import SuperAdminAnalyticsFilter from './SuperAdminAnalyticsFilter';
import "./dashboard.css";

// Dynamic Responsive Wrapper to bypass Recharts ResponsiveContainer 0px measurement bug
const ResponsiveWrapper = ({ height = 300, children }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          setDimensions({ width: Math.floor(rect.width), height });
        }
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [height]);

  return (
    <div ref={containerRef} style={{ width: '100%', height, minHeight: height, minWidth: 0, overflow: 'hidden' }}>
      {children(dimensions.width > 0 ? dimensions.width : 600, height)}
    </div>
  );
};

// Custom Recharts Tooltip Component for ultra-clean UI
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.96)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '12px 14px',
        borderRadius: '12px',
        color: '#ffffff',
        minWidth: '160px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        zIndex: 50
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 700, color: '#8893A7', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '6px' }}>{label}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: entry.color || entry.fill }} />
                <span style={{ color: '#D6E2F0', fontWeight: 600 }}>{entry.name}:</span>
              </div>
              <span style={{ fontWeight: 750, color: '#ffffff' }}>
                {formatter ? formatter(entry.value, entry.name) : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardView({
  timeFilter: parentTimeFilter = 'This Month',
  setTimeFilter: setParentTimeFilter = () => {},
  onNavigateView = null
}) {
  const { state } = useERP();
  const { period, startDate, endDate, activeDates, filters } = useSuperAdminFilter();
  const [mounted, setMounted] = useState(false);
  const [fetchedExpenses, setFetchedExpenses] = useState([]);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;
    let isCancelled = false;
    async function loadExpenses() {
      try {
        const res = await backendFetch('/api/backend/expenses/all');
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        if (!isCancelled && Array.isArray(list) && list.length > 0) {
          setFetchedExpenses(list);
        }
      } catch (err) {
        // Silently fall back to ERPContext state
      }
    }
    loadExpenses();
    return () => { isCancelled = true; };
  }, []);

  const safeState = state || {};
  const mergedState = {
    ...safeState,
    expenses: (safeState.expenses && safeState.expenses.length > 0) ? safeState.expenses : fetchedExpenses
  };

  // Compute ERP Financial Data using active filter context
  const fin = computeFinancialData(mergedState, period || 'This Month', startDate, endDate, filters || {});

  // UI Interactive States
  const [selectedOrderStage, setSelectedOrderStage] = useState('All');
  const [profitabilityTab, setProfitabilityTab] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');

  // Interactive tasks with local state toggling
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Approve 4 Purchase Orders', dept: 'Purchase', priority: 'High', time: '10:00 AM', completed: false },
    { id: 2, title: 'Review 3 Rejected Indents', dept: 'Store', priority: 'Medium', time: '11:30 AM', completed: false },
    { id: 3, title: 'Verify 6 Pending Payments', dept: 'Finance', priority: 'High', time: '01:00 PM', completed: false },
    { id: 4, title: 'Review 2 Low Stock Requests', dept: 'Store', priority: 'Medium', time: '02:00 PM', completed: false },
    { id: 5, title: 'Check 5 Delayed Orders', dept: 'Production', priority: 'High', time: '03:00 PM', completed: false },
  ]);

  const [selectedSpecOrder, setSelectedSpecOrder] = useState(null);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const getProductSpecs = (productName, orderObj = null) => {
    // 1. Dynamic extraction from state product catalog if matching item exists
    const catalogMatch = (state?.productCatalog || []).find(p => 
      (p.name || p.product_name || '').toLowerCase() === String(productName).toLowerCase()
    );

    if (catalogMatch) {
      return [
        { label: 'Product Name', value: catalogMatch.name || catalogMatch.product_name || productName },
        { label: 'Category / Family', value: catalogMatch.category || catalogMatch.product_family || 'Standard Catalog' },
        { label: 'Unit Price', value: formatCurrency(catalogMatch.price || catalogMatch.costPrice || 0) },
        { label: 'Unit of Measure', value: catalogMatch.unit || 'Set' },
        { label: 'Stock Available', value: `${formatNumber(catalogMatch.stock || 0)} Units` },
        { label: 'Load Rating / Spec', value: catalogMatch.load_class || catalogMatch.loadClass || 'Class B125 / Standard' },
        { label: 'Material Composition', value: catalogMatch.material || catalogMatch.description || 'FRP / Composite Matrix' },
        { label: 'Compliance Standard', value: catalogMatch.compliance || 'ISO 9001 / EN 124-5 Compliant' }
      ];
    }

    // 2. Dynamic extraction if order object has spec properties
    if (orderObj && (orderObj.loadClass || orderObj.dimensions || orderObj.material || orderObj.specs)) {
      return [
        { label: 'Product Name', value: productName },
        { label: 'Clear Opening / Dimensions', value: orderObj.dimensions || 'Standard Factory Spec' },
        { label: 'Load Class Rating', value: orderObj.loadClass || 'Class B125 / Heavy Duty' },
        { label: 'Material Composition', value: orderObj.material || 'FRP Composite Matrix' },
        { label: 'Order Quantity', value: `${formatNumber(orderObj.quantity || orderObj.qty || 1)} Units` },
        { label: 'Order Total Value', value: formatCurrency(orderObj.totalValue || orderObj.sales || 0) },
        { label: 'Compliance Standard', value: orderObj.compliance || 'IS:458 / EN 124-5 Certified' }
      ];
    }

    // 3. Fallback catalog specifications dictionary
    const specs = {
      'FRP Manhole Covers (Heavy Duty)': [
        { label: 'Clear Opening Dimensions', value: '600mm x 600mm' },
        { label: 'Load Class Rating', value: 'Class D400 (40 Tonnes Heavy Duty)' },
        { label: 'Material Composition', value: 'Fibre Reinforced Polymer (FRP), UV Resistant' },
        { label: 'Color / Appearance', value: 'Industrial Dark Grey with Anti-Skid Pattern' },
        { label: 'Seal Design', value: 'Double-sealed neoprene gasket' },
        { label: 'Compliance Standard', value: 'EN 124-5:2015 certified' }
      ],
      'RCC Hume Pipes (NP3 Class)': [
        { label: 'Internal Diameter (ID)', value: '1000 mm' },
        { label: 'Wall Thickness', value: '85 mm' },
        { label: 'Reinforcement Cage', value: 'NP3 Grade High-Yield Steel wire spiral' },
        { label: 'Concrete Strength Grade', value: 'M35 Self-Compacting Concrete' },
        { label: 'Joint Profile', value: 'Spigot & Socket with rubber ring seals' },
        { label: 'Compliance Standard', value: 'IS:458 Indian Standard Spec' }
      ],
      'FRP Chambers (Telecom Spec)': [
        { label: 'Overall Dimensions', value: '1200mm (L) x 800mm (W) x 1000mm (D)' },
        { label: 'Wall Architecture', value: 'Ribbed Sandwich Composite (High Stiffness)' },
        { label: 'Duct Entry Knockouts', value: '6x pre-molded 110mm entries with EPDM sleeves' },
        { label: 'Load Rating', value: 'Class B125 (12.5 Tonnes)' },
        { label: 'Internal Fixtures', value: 'Pre-fitted hot-dip galvanized cable hangers' }
      ],
      'FRP Gratings (Anti-Slip)': [
        { label: 'Panel Dimensions', value: '1000mm (Length) x 300mm (Width)' },
        { label: 'Thickness / Height', value: '38 mm' },
        { label: 'Mesh Geometry', value: '38mm x 38mm Square Mesh' },
        { label: 'Surface Texture', value: 'Integrated Corundum Safety Grit (R13 Rating)' },
        { label: 'Resin Type', value: 'Isophthalic Polyester (Premium Chemical Resistance)' },
        { label: 'Color', value: 'Safety Yellow (High Visibility)' }
      ],
      'FRP Manhole Covers (Medium)': [
        { label: 'Clear Opening Dimensions', value: '450mm x 450mm' },
        { label: 'Load Class Rating', value: 'Class B125 (12.5 Tonnes Medium Duty)' },
        { label: 'Material Composition', value: 'FRP Composite Matrix' },
        { label: 'Color / Appearance', value: 'Satin Black with anti-slip tread' },
        { label: 'Seal Design', value: 'Single neoprene gasket seal' },
        { label: 'Compliance Standard', value: 'EN 124-5 Standard' }
      ]
    };
    return specs[productName] || [
      { label: 'Product Name', value: productName },
      { label: 'Category', value: 'Standard Catalog' },
      { label: 'Quality Standard', value: 'ISO 9001 Compliant' }
    ];
  };

  // Operational Chart Data dynamically bound to fin
  const salesDispatchTrendData = fin.salesDispatchTrendData;
  const monthlyRevenueData = fin.monthlyRevenueData;
  const monthlyProductionData = fin.monthlyProductionData;
  const productionData = fin.productionData;
  const topProductsData = fin.topProductsData;
  const ageingData = fin.ageingData;
  const topCustomers = fin.topCustomers;
  const recentOrders = fin.recentOrders;

  const filteredRecentOrders = recentOrders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.cust.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.prod.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStage = selectedOrderStage === 'All' || o.stage === selectedOrderStage;
    return matchesSearch && matchesStage;
  });

  const filteredProfitabilityList = fin.orderProfitability.filter(item => {
    if (profitabilityTab === 'All') return true;
    if (profitabilityTab === 'Most Profitable') return item.margin >= 30;
    if (profitabilityTab === 'Loss-Making') return item.margin < 0 || item.grossProfit < 0;
    if (profitabilityTab === 'High Transport') return item.category === 'High Transport';
    if (profitabilityTab === 'High Rework') return item.category === 'High Rework';
    return true;
  });

  const handlePeriodChange = (p) => {
    if (p === 'Custom Date Range') {
      setShowCustomModal(true);
    } else {
      setPeriodFilter(p);
    }
  };

  return (
    <main className="super-dashboard super-admin-dashboard">
      
      {/* 1. Dashboard Header */}
      <header className="dashboard-header" style={{ marginBottom: '16px' }}>
        <div className="dashboard-header-left">
          <div className="dashboard-header-icon">
            <Lucide.Activity size={26} />
          </div>
          <div className="dashboard-heading">
            <div className="dashboard-heading-row">
              <h1>Super Admin Command Center</h1>
              <span className="dashboard-badge badge-success">
                System Live • ERP Telemetry
              </span>
            </div>
            <p>Unified business overview: revenue, cost control, department performance & operational telemetry</p>
          </div>
        </div>
      </header>

      {/* Shared Analytics Filter Bar */}
      <SuperAdminAnalyticsFilter
        title="Business Command Filter Control"
        showBranch={true}
      />

      {/* 2. Financial Command Center (Financial Command Summary) */}
      <div className="sa-section-header">
        <div className="sa-section-title-group">
          <Lucide.Landmark size={20} color="#2563eb" />
          <h2 className="sa-section-title">Financial Command Center</h2>
        </div>
        <span className="dashboard-badge badge-info">{activeDates.label}</span>
      </div>

      {/* Row 1 of Financial Cards (4 Cards) */}
      <section className="sa-financial-grid">
        <div className="sa-financial-card" style={{ '--kpi-accent': '#2563eb' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Total Sales / Order Value</span>
            <div className="sa-card-icon" style={{ color: '#2563eb', background: 'rgba(37, 99, 235, 0.1)' }}>
              <Lucide.IndianRupee size={16} />
            </div>
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{formatCurrency(fin.totalSalesVal)}</span>
          </div>
          <div className="sa-card-subtext">{fin.totalOrdersCount} Confirmed Invoiced Orders</div>
          <div className="sa-card-footer">
            <span className="kpi-success">↑ 14% vs Previous Period</span>
          </div>
        </div>

        <div className="sa-financial-card" style={{ '--kpi-accent': '#10b981' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Payment Received</span>
            <div className="sa-card-icon" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
              <Lucide.CheckCircle size={16} />
            </div>
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{formatCurrency(fin.revenueCollected)}</span>
          </div>
          <div className="sa-card-subtext">Finance-Verified Receipts Only</div>
          <div className="sa-card-footer">
            <span className="kpi-success">Verified Realized Cash Inflow</span>
          </div>
        </div>

        <div className="sa-financial-card" style={{ '--kpi-accent': '#ef4444' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Outstanding Receivables</span>
            <div className="sa-card-icon" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
              <Lucide.FileText size={16} />
            </div>
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{formatCurrency(fin.outstandingReceivables)}</span>
          </div>
          <div className="sa-card-subtext">{fin.pendingInvoicesCount} Pending Invoices ({fin.activeCustomersCount} Clients)</div>
          <div className="sa-card-footer">
            <span className="kpi-danger">⚠️ {formatCurrency(fin.overdueAmount)} Overdue</span>
          </div>
        </div>

        <div className="sa-financial-card" style={{ '--kpi-accent': '#f59e0b' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Total Business Expense</span>
            <div className="sa-card-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
              <Lucide.CreditCard size={16} />
            </div>
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{formatCurrency(fin.totalBusinessExpense)}</span>
          </div>
          <div className="sa-card-subtext">Material + Prod + Transport + Payroll</div>
          <div className="sa-card-footer">
            <span className="kpi-warning">Combined ERP Tracked Costs</span>
          </div>
        </div>
      </section>



      {/* 3. Executive Financial Alerts */}
      <section className="sa-alerts-container">
        <div className="sa-section-header" style={{ marginBottom: 0 }}>
          <div className="sa-section-title-group">
            <Lucide.ShieldAlert size={18} color="#ef4444" />
            <h3 className="sa-section-title" style={{ fontSize: '16px' }}>Executive Financial Alerts</h3>
          </div>
          <span className="dashboard-badge badge-danger">{fin.executiveAlerts.length} Action Items</span>
        </div>
        <div className="sa-alerts-grid">
          {fin.executiveAlerts.map(alert => (
            <div key={alert.id} className={`sa-alert-item alert-${alert.type}`}>
              <div style={{ marginTop: '2px', color: alert.type === 'danger' ? '#ef4444' : alert.type === 'warning' ? '#f59e0b' : '#3b82f6' }}>
                {alert.icon === 'Truck' && <Lucide.Truck size={16} />}
                {alert.icon === 'TrendingUp' && <Lucide.TrendingUp size={16} />}
                {alert.icon === 'ShoppingBag' && <Lucide.ShoppingBag size={16} />}
                {alert.icon === 'AlertTriangle' && <Lucide.AlertTriangle size={16} />}
                {alert.icon === 'Wrench' && <Lucide.Wrench size={16} />}
                {alert.icon === 'FileText' && <Lucide.FileText size={16} />}
                {alert.icon === 'Users' && <Lucide.Users size={16} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#24345C', fontSize: '13px' }}>{alert.title}</strong>
                  <span style={{ fontSize: '10px', color: '#5E6B82' }}>{alert.time}</span>
                </div>
                <p style={{ margin: '3px 0 0 0', color: '#475569', fontSize: '12px', lineHeight: '1.35' }}>{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Preserved Operational KPI Section */}
      <div className="sa-section-header">
        <div className="sa-section-title-group">
          <Lucide.Activity size={18} color="#6366f1" />
          <h3 className="sa-section-title" style={{ fontSize: '16px' }}>Operational Overview</h3>
        </div>
      </div>
      <section className="dashboard-kpis">
        {[
          { title: 'Daily Production', icon: Lucide.Factory, val: formatNumber(fin.dailyProductionVal), suffix: 'Units', target: `${formatNumber(fin.dailyProductionTarget)} Units Target`, progress: fin.dailyProductionProgress, accent: '#2563eb', footerText: `★ ${fin.dailyProductionProgress}% Achievement`, footerClass: 'kpi-success' },
          { title: 'Daily Dispatch', icon: Lucide.Truck, val: formatNumber(fin.dailyDispatchCount), suffix: 'Dispatches', target: `${formatNumber(fin.dailyUnitsDispatched)} Units Dispatched`, progress: 85, accent: '#10b981', footerText: `${fin.dailyDispatchPending} Orders Pending`, footerClass: 'kpi-warning' },
          { title: 'Daily Sales', icon: Lucide.IndianRupee, val: formatCurrency(fin.dailySalesVal), suffix: '', target: `${fin.dailySalesOrders} Orders Confirmed`, progress: 100, accent: '#9333ea', footerText: '↑ +14% vs Yesterday', footerClass: 'kpi-success' },
          { title: 'Pending Orders', icon: Lucide.ClipboardList, val: formatNumber(fin.pendingOrdersCount), suffix: 'Orders', target: 'Across All Departments', progress: 70, accent: '#f59e0b', footerText: `⚡ ${fin.urgentOrdersCount} Urgent Priority`, footerClass: 'kpi-danger' },
          { title: 'Pending Payments', icon: Lucide.FileText, val: formatCurrency(fin.outstandingReceivables), suffix: '', target: `${fin.activeCustomersCount} Active Customers`, progress: 60, accent: '#ef4444', footerText: `⚠️ ${formatCurrency(fin.overdueAmount)} Overdue`, footerClass: 'kpi-danger' },
          { title: 'Low Stock Alert', icon: Lucide.AlertTriangle, val: formatNumber(fin.lowStockCount), suffix: 'Items', target: `${fin.criticalStockCount} Out of Stock Critical`, progress: 30, accent: '#ea580c', footerText: 'Inspect Inventory →', footerClass: 'kpi-warning' },
        ].map((kpi, idx) => (
          <div key={idx} className="dashboard-card kpi-card" style={{ '--kpi-accent': kpi.accent, '--progress': `${kpi.progress}%` }}>
            <div className="kpi-card-header">
              <span className="kpi-label">{kpi.title}</span>
              <div className="kpi-icon"><kpi.icon size={16} /></div>
            </div>
            <div className="kpi-value-row">
              <span className="kpi-value">{kpi.val}</span>
              {kpi.suffix && <span className="kpi-unit">{kpi.suffix}</span>}
            </div>
            <div className="kpi-description">{kpi.target}</div>
            <div className="kpi-progress"><div className="kpi-progress-value" /></div>
            <div className="kpi-footer"><span className={kpi.footerClass}>{kpi.footerText}</span></div>
          </div>
        ))}
      </section>

      {/* 5. Cost Breakdown ("Where Did We Spend Money?") */}
      <div className="sa-section-header">
        <div className="sa-section-title-group">
          <Lucide.ShoppingBag size={20} color="#ef4444" />
          <h2 className="sa-section-title">Where Did We Spend Money? (Company Expenditure)</h2>
        </div>
        <span className="dashboard-badge badge-info">Tracked Expenses: {formatCurrency(fin.totalBusinessExpense)}</span>
      </div>

      <section className="sa-cost-grid">


        {/* Dispatch & Transportation Cost */}
        <div className="sa-cost-card">
          <div className="sa-cost-card-header">
            <span className="sa-cost-title">Dispatch & Transportation Cost</span>
            <Lucide.Truck size={18} color="#f59e0b" />
          </div>
          <div className="sa-cost-amount">{formatCurrency(fin.dispatchCost)}</div>
          <div className="sa-cost-rows">
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Dispatches / Avg Cost</span>
              <strong>{fin.totalDispatchesCount} | {formatCurrency(fin.avgCostPerDispatch)} / Disp</strong>
            </div>
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Cost / Delivered Unit</span>
              <strong>₹{formatNumber(fin.costPerDeliveredUnit)} / Unit</strong>
            </div>
          </div>
          <button 
            className="task-action" 
            onClick={() => onNavigateView ? onNavigateView('analytics', 'dispatch') : window.location.assign('/super-admin/analytics/dispatch')}
            style={{ width: '100%', marginTop: '8px', height: '32px', fontSize: '11.5px', background: '#e8f0ff', color: '#1e3a8a', border: '1px solid #bfdbfe' }}
          >
            View Dispatch Analytics →
          </button>
        </div>

        {/* Salary & Employee Cost */}
        <div className="sa-cost-card">
          <div className="sa-cost-card-header">
            <span className="sa-cost-title">Salary & Employee Cost</span>
            <Lucide.Users size={18} color="#8b5cf6" />
          </div>
          <div className="sa-cost-amount">{formatCurrency(fin.salaryCost)}</div>
          <div className="sa-cost-rows">
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Gross Payroll</span>
              <strong>{formatCurrency(fin.grossPayroll)}</strong>
            </div>
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Overtime & Bonus</span>
              <strong>{formatCurrency(fin.overtimeBonus)}</strong>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#5E6B82', marginTop: 'auto' }}>HR Approved Payroll</span>
        </div>

        {/* Rework Material */}
        <div className="sa-cost-card">
          <div className="sa-cost-card-header">
            <span className="sa-cost-title">Rework Material</span>
            <Lucide.Wrench size={18} color="#ef4444" />
          </div>
          <div className="sa-cost-amount">{formatNumber(fin.reworkMaterialKg)} Kg</div>
          <div className="sa-cost-rows">
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Material Cost</span>
              <strong>{formatCurrency(fin.reworkMaterialCost)}</strong>
            </div>
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Labour & Prod Cost</span>
              <strong>{formatCurrency(fin.reworkLabourCost)}</strong>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#5E6B82', marginTop: 'auto' }}>QC Failures Material Consumption</span>
        </div>



        {/* Sales Return Cost */}
        <div className="sa-cost-card">
          <div className="sa-cost-card-header">
            <span className="sa-cost-title">Sales Return Cost</span>
            <Lucide.RotateCcw size={18} color="#ec4899" />
          </div>
          <div className="sa-cost-amount">{formatCurrency(fin.salesReturnCost)}</div>
          <div className="sa-cost-rows">
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Returned Value</span>
              <strong>{formatCurrency(fin.returnedValue)}</strong>
            </div>
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Replacement & Logistics</span>
              <strong>{formatCurrency(fin.replacementLogisticsCost)}</strong>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#5E6B82', marginTop: 'auto' }}>Sales Returns Analysis</span>
        </div>


      </section>

      {/* 6. Monthly Business Performance (Profit & Loss Overview Chart & Table) */}
      <section className="pnl-section" style={{ marginBottom: '24px' }}>
        <div className="sa-section-header">
          <div className="sa-section-title-group">
            <Lucide.BarChart3 size={20} color="#2563eb" />
            <h2 className="sa-section-title">Monthly Business Performance (Profit & Loss Overview)</h2>
          </div>
          <span className="dashboard-badge badge-success">Revenue vs Collections Separated</span>
        </div>

        <div className="dashboard-card" style={{ padding: '20px' }}>
          <div className="analytics-card__header">
            <div>
              <h3 className="analytics-card__title">Monthly P&L & Cash Realization</h3>
              <p className="analytics-card__subtitle">Revenue earned vs Cash Collected vs Expenses vs Net Profit over time</p>
            </div>
          </div>

          <div className="pnl-chart-container" style={{ width: '100%', minWidth: 0, height: '320px', minHeight: '280px' }}>
            {mounted && (
              <ResponsiveWrapper height={320}>
                {(w, h) => (
                  <ComposedChart width={w} height={h} data={fin.monthlyPerformance} margin={{ top: 12, right: 12, left: -6, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 700, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#5E6B82' }} axisLine={false} tickLine={false} width={40} tickFormatter={(val) => `₹${val}L`} />
                    <Tooltip content={<CustomTooltip formatter={(val) => `₹${val} Lakh`} />} />
                    <Legend className="pnl-legend" />
                    <Bar dataKey="revenue" name="Recognized Revenue (₹L)" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="collected" name="Realized Collection (₹L)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="expense" name="Total Expenses (₹L)" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                    <Line type="monotone" dataKey="estimatedProfit" name="Estimated Net Profit (₹L)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                  </ComposedChart>
                )}
              </ResponsiveWrapper>
            )}
          </div>

          {/* Tabular P&L Summary */}
          <div className="dashboard-table-wrapper" style={{ marginTop: '20px' }}>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th style={{ textAlign: 'right' }}>Revenue</th>
                  <th style={{ textAlign: 'right' }}>Collected</th>
                  <th style={{ textAlign: 'right' }}>Expense</th>
                  <th style={{ textAlign: 'right' }}>Gross Profit</th>
                  <th style={{ textAlign: 'right' }}>Est. Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {fin.monthlyPerformance.map((row, i) => (
                  <tr key={i}>
                    <td data-label="Month" style={{ fontWeight: 750, color: '#24345C' }}>{row.month}</td>
                    <td data-label="Revenue" style={{ textAlign: 'right', fontWeight: 750, color: '#2563eb' }}>₹{row.revenue} L</td>
                    <td data-label="Collected" style={{ textAlign: 'right', fontWeight: 750, color: '#10b981' }}>₹{row.collected} L</td>
                    <td data-label="Expense" style={{ textAlign: 'right', color: '#ef4444' }}>₹{row.expense} L</td>
                    <td data-label="Gross Profit" style={{ textAlign: 'right', fontWeight: 700, color: '#06b6d4' }}>₹{row.grossProfit} L</td>
                    <td data-label="Est. Net Profit" style={{ textAlign: 'right', fontWeight: 800, color: '#8b5cf6' }}>₹{row.estimatedProfit} L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. Expense Distribution & Department-Wise Cost Analysis */}
      <section className="expense-section department-cost-section" style={{ marginBottom: '24px' }}>
        <div className="sa-expense-dept-grid">
          {/* Expense Breakdown (Pie Chart) - Span 5 */}
          <div className="dashboard-card dashboard-span-5" style={{ padding: '20px' }}>
            <div className="card-header" style={{ marginBottom: '14px' }}>
              <div className="card-heading">
                <h3 className="card-title">Expense Breakdown</h3>
                <p className="card-subtitle">Contribution across company expenses</p>
              </div>
            </div>

            <div className="sa-expense-breakdown-content">
              <div className="sa-expense-chart-wrap" style={{ width: '160px', height: '180px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {mounted && (
                  <PieChart width={160} height={180}>
                    <Pie data={fin.expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3}>
                      {fin.expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip formatter={(val) => `₹${val} Lakh`} />} />
                  </PieChart>
                )}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', minWidth: 0 }}>
                {fin.expenseBreakdown.map((ex, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', minWidth: 0 }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ex.color, flexShrink: 0 }} />
                      <span style={{ color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</span>
                    </div>
                    <strong style={{ color: '#24345C', flexShrink: 0 }}>{ex.percent}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Department Cost Analysis - Span 7 */}
          <div className="dashboard-card dashboard-span-7" style={{ padding: '20px' }}>
            <div className="card-header" style={{ marginBottom: '14px' }}>
              <div className="card-heading">
                <h3 className="card-title">Department-Wise Cost Analysis</h3>
                <p className="card-subtitle">Operational expenses and efficiency by department</p>
              </div>
            </div>

            <div className="dashboard-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th style={{ textAlign: 'right' }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {fin.departmentCosts.map((d, idx) => (
                    <tr key={idx}>
                      <td data-label="Department" style={{ fontWeight: 750, color: d.accent }}>{d.name}</td>
                      <td data-label="Cost" style={{ textAlign: 'right', fontWeight: 750, color: '#24345C' }}>
                        {d.costVal || d.purchaseVal || d.productionCost || d.transportCost || d.salaryCost || d.salesValue || d.revenue || d.inspectedQty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Order-Wise Profitability Table Section */}
      <section className="order-profitability-section" style={{ marginBottom: '24px' }}>
        <div className="sa-section-header">
          <div className="sa-section-title-group">
            <Lucide.DollarSign size={20} color="#10b981" />
            <h2 className="sa-section-title">Order-Wise Profitability Control</h2>
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: '20px' }}>
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h3 className="card-title">Order Profitability Telemetry</h3>
              <p className="card-subtitle">Direct cost breakdown & gross margin per order</p>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['All', 'Most Profitable', 'Loss-Making', 'High Transport', 'High Rework'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setProfitabilityTab(tab)}
                  className={`dashboard-filter-button ${profitabilityTab === tab ? 'is-active' : ''}`}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Sales Value</th>
                  <th>Direct Cost</th>
                  <th>Gross Profit</th>
                  <th>Margin %</th>
                  <th>Category Tag</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfitabilityList.map((ord, idx) => (
                  <tr key={idx}>
                    <td data-label="Order ID" style={{ fontWeight: 750, color: '#2563eb' }}>{ord.id}</td>
                    <td data-label="Customer" style={{ fontWeight: 700, color: '#24345C' }}>{ord.cust}</td>
                    <td data-label="Product" style={{ color: '#475569', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ord.prod}</td>
                    <td data-label="Qty" style={{ fontWeight: 650 }}>{ord.qty}</td>
                    <td data-label="Sales Value" style={{ fontWeight: 750, color: '#24345C' }}>₹{formatNumber(ord.sales)}</td>
                    <td data-label="Direct Cost" style={{ fontWeight: 650, color: '#475569' }}>₹{formatNumber(ord.totalCost)}</td>
                    <td data-label="Gross Profit" style={{ fontWeight: 800, color: ord.grossProfit < 0 ? '#ef4444' : '#10b981' }}>
                      ₹{formatNumber(ord.grossProfit)}
                    </td>
                    <td data-label="Margin %">
                      <span className={`dashboard-badge ${ord.margin < 0 ? 'badge-danger' : ord.margin >= 30 ? 'badge-success' : 'badge-warning'}`}>
                        {formatPercent(ord.margin)}
                      </span>
                    </td>
                    <td data-label="Category Tag">
                      <span className="dashboard-badge badge-info">{ord.category}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 9. Preserved Analytics Charts Grid (Daily Production vs Target & Sales/Dispatch Trend & Revenue) */}
      <div className="sa-section-header">
        <div className="sa-section-title-group">
          <Lucide.TrendingUp size={20} color="#2563eb" />
          <h2 className="sa-section-title">Operational Trends & Performance Telemetry</h2>
        </div>
      </div>

      <section className="dashboard-analytics-grid">
        {/* Daily Production vs Target */}
        <div className="production-grid-item">
          <div className="production-analytics-card">
            <div className="production-analytics-header">
              <div>
                <h3>Daily Production vs Target</h3>
                <p>Telemetry vs plant quota ({formatNumber(fin.dailyProductionTarget)} Units)</p>
              </div>
              <span className="analytics-positive-badge">+12% vs avg</span>
            </div>

            <div className="production-analytics-body">
              <div className="production-chart-column">
                <div className="production-chart-wrapper" style={{ width: '100%', minWidth: 0, minHeight: '230px' }}>
                  {mounted && (
                    <ResponsiveWrapper height={230}>
                      {(w, h) => (
                        <BarChart width={w} height={h} data={productionData} margin={{ top: 22, right: 16, left: -8, bottom: 4 }}>
                          <CartesianGrid vertical={false} stroke="#e8edf3" strokeDasharray="3 3" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#5E6B82", fontSize: 11 }} />
                          <YAxis domain={[0, Math.max(900, Math.round(fin.dailyProductionTarget * 1.15))]} axisLine={false} tickLine={false} width={40} tick={{ fill: "#5E6B82", fontSize: 11 }} />
                          <Tooltip cursor={{ fill: "#F5FAFE" }} formatter={(value) => [`${formatNumber(value)} Units`, "Production"]} />
                          <Bar dataKey="value" radius={[7, 7, 0, 0]} maxBarSize={70}>
                            {productionData.map((entry) => (
                              <Cell key={entry.name} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveWrapper>
                  )}
                </div>

                <div className="production-chart-summary">
                  <span><i className="summary-dot summary-dot-target" />Target: <strong>{formatNumber(fin.dailyProductionTarget)} Units</strong></span>
                  <span><i className="summary-dot summary-dot-produced" />Produced: <strong>{formatNumber(fin.dailyProductionVal)} Units</strong></span>
                </div>
              </div>

              <div className="production-efficiency-panel">
                <div className="production-efficiency-ring">
                  <div><strong>{fin.dailyProductionProgress}%</strong><span>Efficiency</span></div>
                </div>
                <p>{formatNumber(fin.dailyProductionVal)} of {formatNumber(fin.dailyProductionTarget)} units produced</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales & Dispatch Trend */}
        <div className="trend-grid-item">
          <div className="analytics-card sales-trend-card">
            <div className="analytics-card__header">
              <div>
                <h3 className="analytics-card__title">Sales & Dispatch Trend</h3>
                <p className="analytics-card__subtitle">Multi-metric operational flow comparison</p>
              </div>
              <span className="dashboard-badge badge-info">14 Days Live</span>
            </div>

            <div className="analytics-card__legend">
              <span className="analytics-legend-item"><i className="analytics-legend-dot legend-sales" />Sales (₹ Lakh)</span>
              <span className="analytics-legend-item"><i className="analytics-legend-dot legend-dispatch" />Dispatch (Units)</span>
              <span className="analytics-legend-item"><i className="analytics-legend-dot legend-orders" />Orders</span>
            </div>

            <div className="analytics-card__chart" style={{ width: '100%', minWidth: 0, minHeight: '260px' }}>
              {mounted && (
                <ResponsiveWrapper height={260}>
                  {(w, h) => (
                    <ComposedChart width={w} height={h} data={salesDispatchTrendData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf3" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#5E6B82" }} minTickGap={20} />
                      <YAxis yAxisId="financial" axisLine={false} tickLine={false} width={28} tick={{ fontSize: 11, fill: "#5E6B82" }} />
                      <YAxis yAxisId="units" orientation="right" axisLine={false} tickLine={false} width={38} tick={{ fontSize: 11, fill: "#5E6B82" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area yAxisId="financial" type="monotone" dataKey="sales" name="Sales (₹ Lakh)" fill="rgba(37, 99, 235, 0.12)" stroke="#2563eb" strokeWidth={2.5} />
                      <Line yAxisId="units" type="monotone" dataKey="dispatch" name="Dispatch (Units)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      <Line yAxisId="financial" type="monotone" dataKey="orders" name="Orders" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} />
                    </ComposedChart>
                  )}
                </ResponsiveWrapper>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Revenue Overview */}
        <div className="revenue-grid-item">
          <div className="analytics-card analytics-card--large monthly-revenue-card">
            <div className="analytics-card__header">
              <div>
                <h3 className="analytics-card__title">Monthly Revenue Overview</h3>
                <p className="analytics-card__subtitle">Gross revenue vs realized collection vs outstanding balances across fiscal year</p>
              </div>
              <span className="dashboard-badge badge-success">Year-on-Year ↑ +18%</span>
            </div>

            <div className="analytics-card__legend">
              <span className="analytics-legend-item"><i className="analytics-legend-dot legend-revenue" />Revenue (₹ L)</span>
              <span className="analytics-legend-item"><i className="analytics-legend-dot legend-collection" />Collection (₹ L)</span>
              <span className="analytics-legend-item"><i className="analytics-legend-dot legend-outstanding" />Outstanding (₹ L)</span>
            </div>

            <div className="analytics-card__chart" style={{ width: '100%', minWidth: 0, minHeight: '290px' }}>
              {mounted && (
                <ResponsiveWrapper height={290}>
                  {(w, h) => (
                    <BarChart width={w} height={h} data={monthlyRevenueData} margin={{ top: 10, right: 8, left: -6, bottom: 0 }} barGap={3} barCategoryGap="26%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf3" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#5E6B82" }} interval={0} />
                      <YAxis axisLine={false} tickLine={false} width={36} tick={{ fontSize: 11, fill: "#5E6B82" }} tickFormatter={(value) => `${value}L`} />
                      <Tooltip content={<CustomTooltip formatter={(val) => `₹${val} Lakh`} />} />
                      <Bar dataKey="revenue" name="Revenue (₹ L)" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={20} />
                      <Bar dataKey="collection" name="Collection (₹ L)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} />
                      <Bar dataKey="outstanding" name="Outstanding (₹ L)" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={20} />
                    </BarChart>
                  )}
                </ResponsiveWrapper>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 10. Preserved Main Grid (Operations Overview, Monthly Production Breakdown, Low Stock Alerts, Top Customers, Top Products, Pending Ageing, Tasks, Recent Orders) */}
      <section className="dashboard-main-grid">

        {/* Row 3: Operations Overview + Monthly Production Breakdown + Low Stock Alerts */}
        <div className="dashboard-card dashboard-span-4">
          <div className="card-header">
            <div className="card-heading">
              <h3 className="card-title">Operations Overview</h3>
              <p className="card-subtitle">Live factory & QC status</p>
            </div>
            <span className="dashboard-badge badge-info">Live Status</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Production Target', value: `${formatNumber(fin.dailyProductionTarget)} Units`, color: '#24345C' },
              { label: 'Production Completed', value: `${formatNumber(fin.dailyProductionVal)} Units`, color: '#10b981' },
              { label: 'Pending Production', value: `${formatNumber(Math.max(0, fin.dailyProductionTarget - fin.dailyProductionVal))} Units`, color: '#f59e0b' },
              { label: 'QC Pending', value: `${Math.max(1, Math.round(18 * (fin.totalOrdersCount / 28)))} Batches`, color: '#6366f1' },
              { label: 'Dispatch Pending', value: `${fin.dailyDispatchPending} Orders`, color: '#06b6d4' },
              { label: 'Rejection Rate', value: '1.8%', color: '#ef4444' },
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: i === 5 ? 'none' : '1px solid #edf1f5' }}>
                <span style={{ fontSize: '13px', fontWeight: 650, color: '#475569' }}>{stat.label}</span>
                <span style={{ fontSize: '14px', fontWeight: 750, color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card chart-card dashboard-span-4">
          <div className="card-header">
            <div className="card-heading">
              <h3 className="card-title">Monthly Production Breakdown</h3>
              <p className="card-subtitle">Weekly target vs produced vs rejected</p>
            </div>
            <span className="dashboard-badge badge-success">Avg 96% Yield</span>
          </div>

          <div className="card-body">
            <div className="chart-container" style={{ width: '100%', minWidth: 0, minHeight: '240px' }}>
              {mounted && (
                <ResponsiveWrapper height={240}>
                  {(w, h) => (
                    <BarChart width={w} height={h} data={monthlyProductionData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip formatter={(val) => `${val} Units`} />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                      <Bar dataKey="target" name="Target" fill="#D6E2F0" radius={[3, 3, 0, 0]} barSize={12} />
                      <Bar dataKey="produced" name="Produced" fill="#10b981" radius={[3, 3, 0, 0]} barSize={12} />
                      <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={12} />
                    </BarChart>
                  )}
                </ResponsiveWrapper>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-card dashboard-span-4">
          <div className="card-header">
            <div className="card-heading">
              <h3 className="card-title">Low Stock Alerts</h3>
              <p className="card-subtitle">12 critical raw materials</p>
            </div>
            <span className="dashboard-badge badge-danger">3 Out of Stock</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="dashboard-table-wrapper">
              <table className="dashboard-table" style={{ minWidth: '340px' }}>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Current</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'River Sand (Critical)', qty: '12 Tons', min: '25 Tons', status: 'Critical', badge: 'badge-danger' },
                    { name: 'Cement OPC 53', qty: '45 Bags', min: '100 Bags', status: 'Low', badge: 'badge-warning' },
                    { name: 'Steel Reinforcement', qty: '0 Tons', min: '15 Tons', status: 'Stock-out', badge: 'badge-danger' },
                    { name: 'Polyester Resin', qty: '120 Kg', min: '300 Kg', status: 'Low', badge: 'badge-warning' },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 650, color: '#24345C' }}>{row.name}</td>
                      <td style={{ fontWeight: 700, color: '#475569' }}>{row.qty}</td>
                      <td><span className={`dashboard-badge ${row.badge}`}>{row.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
              <button className="task-action" style={{ flex: 1, height: '34px', fontSize: '12px' }}>View Inventory</button>
              <button className="task-action" style={{ flex: 1, height: '34px', fontSize: '12px', background: '#2563eb', color: '#fff', border: 'none' }}>Create Indent</button>
            </div>
          </div>
        </div>

        {/* Row 4: Top Customers + Top Products + Pending Payments Ageing */}
        <div className="dashboard-card dashboard-span-4">
          <div className="card-header">
            <div className="card-heading">
              <h3 className="card-title">Top Customers</h3>
              <p className="card-subtitle">Highest volume clients this month</p>
            </div>
            <span className="dashboard-badge badge-success">Top 5 Clients</span>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {topCustomers.map((cust, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#24345C' }}>{cust.name}</span>
                  <span style={{ fontSize: '13px', fontWeight: 750, color: '#2563eb' }}>{cust.revenue}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#5E6B82' }}>{cust.orders} Orders Confirmed</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: cust.growth.startsWith('+') ? '#047857' : '#dc2626' }}>{cust.growth} YoY</span>
                </div>
                <div className="kpi-progress" style={{ height: '4px', marginTop: '2px' }}>
                  <div className="kpi-progress-value" style={{ '--progress': `${Math.max(35, 100 - idx * 16)}%`, background: '#2563eb' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card chart-card dashboard-span-4">
          <div className="card-header">
            <div className="card-heading">
              <h3 className="card-title">Top Products This Month</h3>
              <p className="card-subtitle">Product distribution (Total {formatCurrency(fin.totalSalesVal)})</p>
            </div>
            <span className="dashboard-badge badge-info">5 Categories</span>
          </div>

          <div className="card-body">
            <div className="chart-container" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ width: '150px', height: '180px', flexShrink: 0, display: 'flex', alignItems: 'center', justify: 'center', minWidth: 0 }}>
                {mounted && (
                  <PieChart width={150} height={180}>
                    <Pie data={topProductsData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={66} paddingAngle={3}>
                      {topProductsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip formatter={(val) => `₹${val} Lakh`} />} />
                  </PieChart>
                )}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                {topProductsData.map((prod, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: prod.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '11px', fontWeight: 650, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 750, color: '#24345C', whiteSpace: 'nowrap' }}>{prod.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card chart-card dashboard-span-4">
          <div className="card-header">
            <div className="card-heading">
              <h3 className="card-title">Pending Payments Ageing</h3>
              <p className="card-subtitle">Receivables breakdown (Total {formatCurrency(fin.outstandingReceivables)})</p>
            </div>
            <span className="dashboard-badge badge-warning">Action Required</span>
          </div>

          <div className="card-body">
            <div className="chart-container" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ width: '150px', height: '180px', flexShrink: 0, display: 'flex', alignItems: 'center', justify: 'center', minWidth: 0 }}>
                {mounted && (
                  <PieChart width={150} height={180}>
                    <Pie data={ageingData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={66} paddingAngle={3}>
                      {ageingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip formatter={(val) => `₹${val} Lakh`} />} />
                  </PieChart>
                )}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
                {ageingData.map((bracket, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: bracket.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '11px', fontWeight: 650, color: '#334155' }}>{bracket.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 750, color: '#24345C' }}>₹{bracket.value} L ({bracket.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 5: Recent Orders Table */}
        <div className="dashboard-card dashboard-span-12">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div className="card-heading">
              <h3 className="card-title">Recent Orders</h3>
              <p className="card-subtitle">Live dispatch queue across departments</p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search order or client..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                style={{
                  height: '32px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  minWidth: '180px'
                }}
              />
              <select
                value={selectedOrderStage}
                onChange={(e) => setSelectedOrderStage(e.target.value)}
                style={{
                  height: '32px',
                  padding: '0 8px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  fontWeight: 650,
                  backgroundColor: '#F5FAFE'
                }}
              >
                {['All', 'Production', 'QC', 'Dispatch', 'Delivered'].map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            <div className="dashboard-table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Client / Customer</th>
                    <th>Product Spec</th>
                    <th>Qty</th>
                    <th>Stage</th>
                    <th>Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecentOrders.length > 0 ? (
                    filteredRecentOrders.map((ord, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 750, color: '#2563eb' }}>{ord.id}</td>
                        <td style={{ fontWeight: 700, color: '#24345C' }}>{ord.cust}</td>
                        <td style={{ color: '#475569' }}>{ord.prod}</td>
                        <td style={{ fontWeight: 650 }}>{ord.qty}</td>
                        <td>
                          <span className={`dashboard-badge ${
                            ord.stage === 'Delivered' ? 'badge-success' :
                            ord.stage === 'Production' ? 'badge-info' :
                            ord.stage === 'QC' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {ord.stage}
                          </span>
                        </td>
                        <td style={{ fontWeight: 750, color: '#24345C' }}>{ord.amount}</td>
                        <td>
                          <button className="task-action" onClick={() => setSelectedSpecOrder(ord)}>View Spec</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#5E6B82' }}>
                        No orders match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </section>

      {/* Product Specification Modal */}
      {selectedSpecOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.98)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Product Specification Profile
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '800' }}>
                  {selectedSpecOrder.id} Specs
                </h3>
              </div>
              <button 
                onClick={() => setSelectedSpecOrder(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '18px',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '60vh' }}>
              {/* Order Meta Header */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Customer / Client</span>
                  <strong style={{ fontSize: '14px', color: '#1e293b' }}>{selectedSpecOrder.cust}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Product Item</span>
                  <strong style={{ fontSize: '14px', color: '#1e293b' }}>{selectedSpecOrder.prod}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Ordered Quantity</span>
                  <strong style={{ fontSize: '14px', color: '#1e293b' }}>{selectedSpecOrder.qty}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Current Workflow Stage</span>
                  <strong style={{ fontSize: '14px', color: '#2563eb' }}>{selectedSpecOrder.stage}</strong>
                </div>
              </div>

              {/* Technical Specifications */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Technical Parameters & Tolerances
                </h4>
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}>
                  {getProductSpecs(selectedSpecOrder.prod, selectedSpecOrder).map((spec, i) => (
                    <div 
                      key={i} 
                      style={{
                        display: 'flex',
                        borderBottom: i === getProductSpecs(selectedSpecOrder.prod, selectedSpecOrder).length - 1 ? 'none' : '1px solid #f1f5f9',
                        background: i % 2 === 0 ? '#ffffff' : '#f8fafc',
                        padding: '12px 16px',
                        fontSize: '13px'
                      }}
                    >
                      <span style={{ width: '200px', fontWeight: '600', color: '#475569', paddingRight: '12px' }}>
                        {spec.label}
                      </span>
                      <span style={{ flex: 1, color: '#0f172a', fontWeight: '500' }}>
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px 28px',
              borderTop: '1px solid #f1f5f9',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button 
                onClick={() => setSelectedSpecOrder(null)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

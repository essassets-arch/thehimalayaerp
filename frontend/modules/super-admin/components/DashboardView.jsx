import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Compute ERP Financial Data using active filter context
  const fin = computeFinancialData(state, period, startDate, endDate);

  // Interactive filters
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderStage, setSelectedOrderStage] = useState('All');
  const [profitabilityTab, setProfitabilityTab] = useState('All');

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

  const getProductSpecs = (productName) => {
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

  // Mock Operational Chart Data
  const salesDispatchTrendData = [
    { name: '17 May', sales: 6.2, dispatch: 450, orders: 8 },
    { name: '20 May', sales: 11.4, dispatch: 520, orders: 10 },
    { name: '23 May', sales: 8.1, dispatch: 380, orders: 7 },
    { name: '26 May', sales: 10.5, dispatch: 490, orders: 9 },
    { name: '29 May', sales: 7.8, dispatch: 560, orders: 11 },
    { name: '30 May', sales: 9.6, dispatch: 680, orders: 12 },
  ];

  const monthlyRevenueData = [
    { name: 'Jun', revenue: 65, collection: 55, outstanding: 10 },
    { name: 'Jul', revenue: 70, collection: 60, outstanding: 10 },
    { name: 'Aug', revenue: 68, collection: 50, outstanding: 18 },
    { name: 'Sep', revenue: 75, collection: 65, outstanding: 10 },
    { name: 'Oct', revenue: 80, collection: 70, outstanding: 10 },
    { name: 'Nov', revenue: 85, collection: 80, outstanding: 5 },
    { name: 'Dec', revenue: 90, collection: 85, outstanding: 5 },
    { name: 'Jan', revenue: 88, collection: 78, outstanding: 10 },
    { name: 'Feb', revenue: 75, collection: 70, outstanding: 5 },
    { name: 'Mar', revenue: 80, collection: 75, outstanding: 5 },
    { name: 'Apr', revenue: 82, collection: 80, outstanding: 2 },
    { name: 'May', revenue: 85, collection: 75, outstanding: 10 },
  ];

  const monthlyProductionData = [
    { name: 'Week 1', target: 750, produced: 700, rejected: 10 },
    { name: 'Week 2', target: 750, produced: 720, rejected: 15 },
    { name: 'Week 3', target: 750, produced: 710, rejected: 12 },
    { name: 'Week 4', target: 750, produced: 740, rejected: 8 },
    { name: 'Week 5', target: 750, produced: 735, rejected: 5 },
  ];

  const productionData = [
    { name: "Target", value: 800, fill: "#D6E2F0" },
    { name: "Produced", value: 735, fill: "#10b981" }
  ];

  const topProductsData = [
    { name: 'FRP Manhole Covers', value: 28.0, percent: 34, color: '#3B82F6' },
    { name: 'RCC Hume Pipes', value: 20.5, percent: 25, color: '#10B981' },
    { name: 'FRP Chambers', value: 14.8, percent: 18, color: '#F59E0B' },
    { name: 'FRP Gratings', value: 10.2, percent: 12, color: '#EF4444' },
    { name: 'Telecom Covers', value: 8.5, percent: 11, color: '#8B5CF6' },
  ];

  const ageingData = [
    { name: '0 - 30 Days', value: 12.5, count: 8, color: '#10B981' },
    { name: '31 - 60 Days', value: 6.8, count: 5, color: '#F59E0B' },
    { name: '61 - 90 Days', value: 3.2, count: 3, color: '#EF4444' },
    { name: '90+ Days Critical', value: 1.5, count: 2, color: '#8B5CF6' },
  ];

  const topCustomers = [
    { name: 'ABC Infrastructure Ltd', revenue: '₹14.2 L', orders: 12, growth: '+18%' },
    { name: 'Urban Construction Corp', revenue: '₹11.8 L', orders: 9, growth: '+12%' },
    { name: 'Metro Projects India', revenue: '₹9.5 L', orders: 8, growth: '+25%' },
    { name: 'Apex Builders & Engineers', revenue: '₹7.6 L', orders: 6, growth: '-4%' },
    { name: 'Smart City Development Group', revenue: '₹6.4 L', orders: 5, growth: '+15%' },
  ];

  const recentOrders = [
    { id: 'ORD-001', cust: 'ABC Infrastructure Ltd', prod: 'FRP Manhole Covers (Heavy Duty)', qty: '120 Units', stage: 'Production', amount: '₹1,44,000', priority: 'Urgent' },
    { id: 'ORD-002', cust: 'Urban Construction Corp', prod: 'RCC Hume Pipes (NP3 Class)', qty: '65 Units', stage: 'QC', amount: '₹2,10,000', priority: 'High' },
    { id: 'ORD-003', cust: 'Metro Projects India', prod: 'FRP Chambers (Telecom Spec)', qty: '80 Units', stage: 'Dispatch', amount: '₹1,80,000', priority: 'Normal' },
    { id: 'ORD-004', cust: 'Apex Builders & Engineers', prod: 'FRP Gratings (Anti-Slip)', qty: '150 Units', stage: 'Delivered', amount: '₹95,000', priority: 'Normal' },
    { id: 'ORD-005', cust: 'Smart City Development Group', prod: 'FRP Manhole Covers (Medium)', qty: '200 Units', stage: 'Production', amount: '₹2,40,000', priority: 'High' },
  ];

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
            <span className="sa-card-label">Revenue Collected</span>
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

      {/* Row 2 of Financial Cards (3 Cards) */}
      <section className="sa-financial-grid-row2">
        <div className="sa-financial-card" style={{ '--kpi-accent': '#06b6d4' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Gross Profit</span>
            <div className="sa-card-icon" style={{ color: '#06b6d4', background: 'rgba(6, 182, 212, 0.1)' }}>
              <Lucide.TrendingUp size={16} />
            </div>
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{formatCurrency(fin.grossProfit)}</span>
          </div>
          <div className="sa-card-subtext">Recognized Sales Revenue - Direct COGS</div>
          <div className="sa-card-footer">
            <span className="kpi-success">Direct COGS: {formatCurrency(fin.directCOGS)}</span>
          </div>
        </div>

        <div className="sa-financial-card" style={{ '--kpi-accent': '#8b5cf6' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Estimated Net Profit</span>
            <div className="sa-card-icon" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}>
              <Lucide.Award size={16} />
            </div>
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{formatCurrency(fin.estimatedNetProfit)}</span>
          </div>
          <div className="sa-card-subtext">Recognized Revenue - Total Business Expenses</div>
          <div className="sa-card-footer">
            <span className="kpi-success">Operating Surplus</span>
          </div>
        </div>

        <div className="sa-financial-card" style={{ '--kpi-accent': '#10b981' }}>
          <div className="sa-card-top">
            <span className="sa-card-label">Profit Margin %</span>
            <div className="sa-card-icon" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
              <Lucide.Percent size={16} />
            </div>
          </div>
          <div className="sa-card-val-row">
            <span className="sa-card-val">{formatPercent(fin.profitMarginPercent)}</span>
          </div>
          <div className="sa-card-subtext">Estimated Net Profit / Recognized Revenue × 100</div>
          <div className="sa-card-footer">
            <span className="kpi-success">Healthy Operating Margin</span>
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
          { title: 'Daily Production', icon: Lucide.Factory, val: '735', suffix: 'Units', target: '800 Units Target', progress: 92, accent: '#2563eb', footerText: '★ 92% Achievement', footerClass: 'kpi-success' },
          { title: 'Daily Dispatch', icon: Lucide.Truck, val: '12', suffix: 'Dispatches', target: '680 Units Dispatched', progress: 85, accent: '#10b981', footerText: '12 Orders Pending', footerClass: 'kpi-warning' },
          { title: 'Daily Sales', icon: Lucide.IndianRupee, val: '₹8.40 L', suffix: '', target: '14 Orders Confirmed', progress: 100, accent: '#9333ea', footerText: '↑ +14% vs Yesterday', footerClass: 'kpi-success' },
          { title: 'Pending Orders', icon: Lucide.ClipboardList, val: '28', suffix: 'Orders', target: 'Across All Departments', progress: 70, accent: '#f59e0b', footerText: '⚡ 12 Urgent Priority', footerClass: 'kpi-danger' },
          { title: 'Pending Payments', icon: Lucide.FileText, val: '₹24.00 L', suffix: '', target: '18 Active Customers', progress: 60, accent: '#ef4444', footerText: '⚠️ ₹8.20 L Overdue', footerClass: 'kpi-danger' },
          { title: 'Low Stock Alert', icon: Lucide.AlertTriangle, val: '12', suffix: 'Items', target: '3 Out of Stock Critical', progress: 30, accent: '#ea580c', footerText: 'Inspect Inventory →', footerClass: 'kpi-warning' },
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
        {/* Raw Material / Purchase Cost */}
        <div className="sa-cost-card">
          <div className="sa-cost-card-header">
            <span className="sa-cost-title">Raw Material / Purchase Cost</span>
            <Lucide.Database size={18} color="#3b82f6" />
          </div>
          <div className="sa-cost-amount">{formatCurrency(fin.rawMaterialCost)}</div>
          <div className="sa-cost-rows">
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>PO Commitments</span>
              <strong>{formatCurrency(fin.poCommitmentVal)}</strong>
            </div>
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Recognized Material Cost</span>
              <strong style={{ color: '#2563eb' }}>{formatCurrency(fin.rawMaterialCost)}</strong>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#5E6B82', marginTop: 'auto' }}>Store GRN & Approved POs</span>
        </div>

        {/* Production Cost */}
        <div className="sa-cost-card">
          <div className="sa-cost-card-header">
            <span className="sa-cost-title">Tracked Production Cost</span>
            <Lucide.Factory size={18} color="#10b981" />
          </div>
          <div className="sa-cost-amount">{formatCurrency(fin.productionCost)}</div>
          <div className="sa-cost-rows">
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Material & Consumables</span>
              <strong>₹5.80 L</strong>
            </div>
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Direct Labour & Power</span>
              <strong>₹2.60 L</strong>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#5E6B82', marginTop: 'auto' }}>Plant Floor & Machine Log</span>
        </div>

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
              <strong>42 | ₹6,667 / Disp</strong>
            </div>
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Cost / Delivered Unit</span>
              <strong>₹412 / Unit</strong>
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
              <strong>₹6.50 L</strong>
            </div>
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Overtime & Bonus</span>
              <strong>₹70,000</strong>
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
          <div className="sa-cost-amount">430 Kg</div>
          <div className="sa-cost-rows">
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Material Cost</span>
              <strong>₹52,000</strong>
            </div>
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Labour & Prod Cost</span>
              <strong>₹33,000</strong>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#5E6B82', marginTop: 'auto' }}>QC Failures Material Consumption</span>
        </div>

        {/* Scrap / Wastage */}
        <div className="sa-cost-card">
          <div className="sa-cost-card-header">
            <span className="sa-cost-title">Scrap / Wastage</span>
            <Lucide.Trash2 size={18} color="#ea580c" />
          </div>
          <div className="sa-cost-amount">350 Kg</div>
          <div className="sa-cost-rows">
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Scrap Value</span>
              <strong>₹42,000</strong>
            </div>
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Wastage Rate %</span>
              <strong style={{ color: '#ea580c' }}>2.4%</strong>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#5E6B82', marginTop: 'auto' }}>Production Scrap Material</span>
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
              <strong>₹45,000</strong>
            </div>
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Replacement & Logistics</span>
              <strong>₹20,000</strong>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#5E6B82', marginTop: 'auto' }}>Sales Returns Analysis</span>
        </div>

        {/* Vendor Return Value */}
        <div className="sa-cost-card">
          <div className="sa-cost-card-header">
            <span className="sa-cost-title">Vendor Return Value</span>
            <Lucide.RefreshCw size={18} color="#6366f1" />
          </div>
          <div className="sa-cost-amount">{formatCurrency(fin.vendorReturnVal)}</div>
          <div className="sa-cost-rows">
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Vendor Credit Expected</span>
              <strong style={{ color: '#10b981' }}>₹1.20 L</strong>
            </div>
            <div className="sa-cost-row">
              <span style={{ color: '#5E6B82' }}>Replacement Pending</span>
              <strong>2 Batches</strong>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#5E6B82', marginTop: 'auto' }}>Store VRN Records</span>
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

          <div className="pnl-chart-container" style={{ marginTop: '16px' }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={fin.monthlyPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf3" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#5E6B82" }} />
                  <YAxis axisLine={false} tickLine={false} width={38} tick={{ fontSize: 11, fill: "#5E6B82" }} tickFormatter={(val) => `₹${val}L`} />
                  <Tooltip content={<CustomTooltip formatter={(val) => `₹${val} Lakh`} />} />
                  <Legend className="pnl-legend" />
                  <Bar dataKey="revenue" name="Recognized Revenue (₹L)" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="collected" name="Realized Collection (₹L)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="expense" name="Total Expenses (₹L)" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                  <Line type="monotone" dataKey="estimatedProfit" name="Estimated Net Profit (₹L)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
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
              <div className="sa-expense-chart-wrap" style={{ width: '160px', height: '180px', flexShrink: 0 }}>
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={fin.expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3}>
                        {fin.expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip formatter={(val) => `₹${val} Lakh`} />} />
                    </PieChart>
                  </ResponsiveContainer>
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
                    <th>Key Cost Metric</th>
                    <th>Secondary Metric</th>
                    <th>Status / Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {fin.departmentCosts.map((d, idx) => (
                    <tr key={idx}>
                      <td data-label="Department" style={{ fontWeight: 750, color: d.accent }}>{d.name}</td>
                      <td data-label="Key Cost Metric" style={{ fontWeight: 700, color: '#24345C' }}>
                        {d.purchaseVal || d.productionCost || d.transportCost || d.salaryCost || d.salesValue || d.revenue || d.inspectedQty}
                      </td>
                      <td data-label="Secondary Metric" style={{ color: '#475569' }}>
                        {d.consumed || d.reworkCost || d.delayedCost || d.overtime || d.discounts || d.outstanding || d.qualityLoss}
                      </td>
                      <td data-label="Status / Efficiency">
                        <span className="dashboard-badge badge-info" style={{ backgroundColor: `${d.accent}15`, color: d.accent }}>
                          {d.efficiency || d.orderConversion || d.activeStaff || d.rejectionRate || 'Operational'}
                        </span>
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
          <button 
            className="task-action"
            onClick={() => onNavigateView ? onNavigateView('analytics', 'profitability') : window.location.assign('/super-admin/analytics/profitability')}
            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px' }}
          >
            View Full Profitability Analytics →
          </button>
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
                <p>Telemetry vs plant quota (800 Units)</p>
              </div>
              <span className="analytics-positive-badge">+12% vs avg</span>
            </div>

            <div className="production-analytics-body">
              <div className="production-chart-column">
                <div className="production-chart-wrapper">
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={productionData} margin={{ top: 22, right: 16, left: -8, bottom: 4 }}>
                      <CartesianGrid vertical={false} stroke="#e8edf3" strokeDasharray="3 3" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#5E6B82", fontSize: 11 }} />
                      <YAxis domain={[0, 900]} ticks={[0, 250, 500, 750, 900]} axisLine={false} tickLine={false} width={40} tick={{ fill: "#5E6B82", fontSize: 11 }} />
                      <Tooltip cursor={{ fill: "#F5FAFE" }} formatter={(value) => [`${value} Units`, "Production"]} />
                      <Bar dataKey="value" radius={[7, 7, 0, 0]} maxBarSize={70}>
                        {productionData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="production-chart-summary">
                  <span><i className="summary-dot summary-dot-target" />Target: <strong>800 Units</strong></span>
                  <span><i className="summary-dot summary-dot-produced" />Produced: <strong>735 Units</strong></span>
                </div>
              </div>

              <div className="production-efficiency-panel">
                <div className="production-efficiency-ring">
                  <div><strong>92%</strong><span>Efficiency</span></div>
                </div>
                <p>735 of 800 units produced</p>
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

            <div className="analytics-card__chart">
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={salesDispatchTrendData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf3" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#5E6B82" }} minTickGap={20} />
                  <YAxis yAxisId="financial" domain={[0, 12]} ticks={[0, 3, 6, 9, 12]} axisLine={false} tickLine={false} width={28} tick={{ fontSize: 11, fill: "#5E6B82" }} />
                  <YAxis yAxisId="units" orientation="right" domain={[0, 800]} ticks={[0, 200, 400, 600, 800]} axisLine={false} tickLine={false} width={38} tick={{ fontSize: 11, fill: "#5E6B82" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area yAxisId="financial" type="monotone" dataKey="sales" name="Sales (₹ Lakh)" fill="rgba(37, 99, 235, 0.12)" stroke="#2563eb" strokeWidth={2.5} />
                  <Line yAxisId="units" type="monotone" dataKey="dispatch" name="Dispatch (Units)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line yAxisId="financial" type="monotone" dataKey="orders" name="Orders" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
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

            <div className="analytics-card__chart">
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 8, left: -6, bottom: 0 }} barGap={3} barCategoryGap="26%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf3" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#5E6B82" }} interval={0} />
                  <YAxis axisLine={false} tickLine={false} width={36} tick={{ fontSize: 11, fill: "#5E6B82" }} tickFormatter={(value) => `${value}L`} />
                  <Tooltip content={<CustomTooltip formatter={(val) => `₹${val} Lakh`} />} />
                  <Bar dataKey="revenue" name="Revenue (₹ L)" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="collection" name="Collection (₹ L)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="outstanding" name="Outstanding (₹ L)" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
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
              { label: 'Production Target', value: '800 Units', color: '#24345C' },
              { label: 'Production Completed', value: '735 Units', color: '#10b981' },
              { label: 'Pending Production', value: '65 Units', color: '#f59e0b' },
              { label: 'QC Pending', value: '18 Batches', color: '#6366f1' },
              { label: 'Dispatch Pending', value: '12 Orders', color: '#06b6d4' },
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
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyProductionData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#5E6B82' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip formatter={(val) => `${val} Units`} />} cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                  <Bar dataKey="target" name="Target" fill="#D6E2F0" radius={[3, 3, 0, 0]} barSize={12} />
                  <Bar dataKey="produced" name="Produced" fill="#10b981" radius={[3, 3, 0, 0]} barSize={12} />
                  <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
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
              <p className="card-subtitle">Product distribution (Total ₹82.0 L)</p>
            </div>
            <span className="dashboard-badge badge-info">5 Categories</span>
          </div>

          <div className="card-body">
            <div className="chart-container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '150px', height: '180px', flexShrink: 0, display: 'flex', alignItems: 'center', justify: 'center' }}>
                <PieChart width={150} height={180}>
                  <Pie data={topProductsData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={66} paddingAngle={3}>
                    {topProductsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip formatter={(val) => `₹${val} Lakh`} />} />
                </PieChart>
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
              <p className="card-subtitle">Receivables breakdown (Total ₹24.0 L)</p>
            </div>
            <span className="dashboard-badge badge-warning">Action Required</span>
          </div>

          <div className="card-body">
            <div className="chart-container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '150px', height: '180px', flexShrink: 0, display: 'flex', alignItems: 'center', justify: 'center' }}>
                <PieChart width={150} height={180}>
                  <Pie data={ageingData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={66} paddingAngle={3}>
                    {ageingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip formatter={(val) => `₹${val} Lakh`} />} />
                </PieChart>
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

        {/* Row 5: Today's Tasks + Recent Orders Table */}
        <div className="dashboard-card tasks-card dashboard-span-4">
          <div className="card-header">
            <div className="card-heading">
              <h3 className="card-title">Today's Tasks</h3>
              <p className="card-subtitle">{tasks.filter(t => !t.completed).length} pending actions across departments</p>
            </div>
            <span className="dashboard-badge badge-warning">{tasks.filter(t => t.priority === 'High' && !t.completed).length} Urgent</span>
          </div>

          <ul className="tasks-list">
            {tasks.map(task => (
              <li key={task.id} className="task-item">
                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <div className="task-content">
                  <p className="task-title" style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#8893A7' : 'var(--text-primary)' }}>
                    {task.title}
                  </p>
                  <div className="task-meta">
                    <span style={{ fontWeight: 700, color: '#337a86' }}>{task.dept}</span>
                    <span>•</span>
                    <span>{task.time}</span>
                    <span>•</span>
                    <span style={{ fontWeight: 700, color: task.priority === 'High' ? '#ef4444' : '#5E6B82' }}>{task.priority} Priority</span>
                  </div>
                </div>
                <button className="task-action" onClick={() => toggleTask(task.id)}>
                  {task.completed ? 'Done' : 'Action'}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashboard-card dashboard-span-8">
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
                  {getProductSpecs(selectedSpecOrder.prod).map((spec, i) => (
                    <div 
                      key={i} 
                      style={{
                        display: 'flex',
                        borderBottom: i === getProductSpecs(selectedSpecOrder.prod).length - 1 ? 'none' : '1px solid #f1f5f9',
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

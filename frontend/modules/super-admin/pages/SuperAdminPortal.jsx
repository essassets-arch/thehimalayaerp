'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useERP, useERPStore } from '../../../shared/context/ERPContext';
import { useAuth } from '../../../shared/context/AuthContext';
import { adminService } from '../../../services/admin.service';
import { productService } from '../../../services/product.service';
import { useNotifications } from '../../../shared/context/NotificationContext';
import DataTable from '../../../shared/components/DataTable';
const fireSwal = async (opts) => {
  const Swal = (await import('sweetalert2')).default;
  return Swal.fire(opts);
};
import StatusBadge from '../../../shared/components/StatusBadge';
import Timeline from '../../../shared/components/Timeline';
import ApprovalHistory from '../../../shared/components/ApprovalHistory';
import EnterpriseAlerts from '../../../shared/components/EnterpriseAlerts';
import EnterpriseKPIDashboard from '../../../shared/components/EnterpriseKPIDashboard';
import DailyAgendaCalendar from '../../../components/DailyAgendaCalendar';
import CustomerComplaintManagement from '../../../components/CustomerComplaintManagement';
import SamplesView from '../../../components/SamplesView';
import QuotationsView from '../../../components/QuotationsView';
import OrdersView from '../../../components/OrdersView';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../shared/context/ToastContext';
import { useQueryClient } from '@tanstack/react-query';
import { useLoading } from '../../../hooks/useLoading';
import { exportSalesReportPDF, exportFinanceReportPDF, exportInventoryReportPDF, exportAgingReportPDF } from '../../../services/export.service';
import { apiClient } from '../../../lib/apiClient';
import { useSuperAdminData } from '../hooks/useSuperAdminData';
import ProductMasterUI from '../../../shared/components/ProductMasterUI';


// Analytics & Filter Control Modules
import SalesAnalyticsPage from './SalesAnalyticsPage.jsx';
import PurchaseIndentsView from './PurchaseIndentsView.jsx';
import DashboardView from '../components/DashboardView';
import ProfitabilityAnalyticsPage from './ProfitabilityAnalyticsPage.jsx';
import PurchaseOrderApproval from '../../procurement/super-admin/PurchaseOrderApproval';
import DispatchCostAnalyticsPage from './DispatchCostAnalyticsPage.jsx';
import InventoryCostAnalyticsPage from './InventoryCostAnalyticsPage.jsx';
import FinanceAnalyticsPage from './FinanceAnalyticsPage.jsx';
import ProductionAnalyticsPage from './ProductionAnalyticsPage.jsx';
import HRAnalyticsPage from './HRAnalyticsPage.jsx';
import { SuperAdminFilterProvider } from '../context/SuperAdminFilterContext';
import SuperAdminAnalyticsFilter from '../components/SuperAdminAnalyticsFilter';
import BrandAnalysisPage from './BrandAnalysisPage';


// Department Views
import SalesDept from '../departments/SalesDept';
import ProductionDept from '../departments/ProductionDept';
import StoreDept from '../departments/StoreDept';
import PlantDept from '../departments/PlantDept';
import QCDept from '../departments/QCDept';
import DispatchDept from '../departments/DispatchDept';
import FinanceDept from '../departments/FinanceDept';
import HRDept from '../departments/HRDept';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart
} from 'recharts';
import {
  Users, UserCheck, ShieldAlert, FileText, Layers, BarChart3, LayoutGrid,
  Trash2, Edit3, Edit2, Shield, UserX, UserPlus, CheckCircle, XCircle, DollarSign,
  TrendingUp, Activity, Settings, Info, Save, Mail, MessageSquare, Briefcase, Eye, Box, Package, Plus, FlaskConical,
  Download, Search, ChevronLeft, ChevronRight, RefreshCw, Bell, ClipboardList, Trash, ArrowRight, Check, X, Wrench, Truck, Upload,
  Building, MapPin, ShoppingCart, FileCheck
} from 'lucide-react';


const SIMULATION_CURRENT_TIME = Date.now();

export default function SuperAdminPortal() {
  const params = useParams(); const view = params?.slug?.[0]; const subView = params?.slug?.[1];
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    state,
    dispatch,
    syncData,
    returnAnalysisRequestToFinance,
    returnAnalysisRequestToStoreByAdmin,
    rejectAnalysisRequestByAdmin,
    approveAnalysisRequest,
    approveTechnicalTrial,
    requestTrialClarification,
    completeAnalysisRequest
  } = useERP();
  const { user: currentUser } = useAuth();
  const globalSearch = useSearchStore(s => s.globalSearch);
  const { showToast } = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const { isLoading: isAdminLoading, withLoading } = useLoading();
  const navigate = useRouter();
  const { notifications = [] } = useNotifications() || {};
  const { data: adminData, loading: adminLoading, refetch: refetchAdminData } = useSuperAdminData();
  const [deptEmployee, setDeptEmployee] = useState(null);

  // Reset department employee view when navigating to a different department
  useEffect(() => {
    setDeptEmployee(null);
  }, [subView]);

  // Dialog/Modal states
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const EMPTY_PRODUCT_FORM = { name: '', category: 'Mechanical', price: '', costPrice: '', discount: 0, tax: 18, stock: '', unit: 'Set', description: '', image: '', status: 'active' };
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);
  const [formError, setFormError] = useState('');
  const [dashboardChartTab, setDashboardChartTab] = useState('Overview');
  const [previewQuotation, setPreviewQuotation] = useState(null);
  const [salesAnalyticsFilter, setSalesAnalyticsFilter] = useState('This Month');
  const [salesCustomStart, setSalesCustomStart] = useState('2026-06-01');
  const [salesCustomEnd, setSalesCustomEnd] = useState('2026-06-30');

  // Super Admin Brand Analysis state hooks
  const [admDecisionType, setAdmDecisionType] = useState('APPROVE_ALTERNATIVE_BRAND');
  const [admRemarks, setAdmRemarks] = useState('');
  const [admTrialBrand, setAdmTrialBrand] = useState('');
  const [admTrialQuantity, setAdmTrialQuantity] = useState('');
  const [admTrialUnit, setAdmTrialUnit] = useState('Bags');
  const [admTrialCompletionDate, setAdmTrialCompletionDate] = useState('');
  const [admTrialCriteria, setAdmTrialCriteria] = useState('');
  const [admSearchQuery, setAdmSearchQuery] = useState('');
  const [admActiveTab, setAdmActiveTab] = useState('Pending');

  // Pre-fill Super Admin trial config when navigating to details page
  const __admArRequestId = params?.slug?.[1];
  useEffect(() => {
    if (!__admArRequestId) return;
    const req = (state.analysisRequests || []).find(r => r.id === __admArRequestId);
    if (req?.storeReport) {
      setAdmTrialBrand(req.storeReport.suggestedAlternativeBrand || '');
      setAdmTrialUnit(req.storeReport.unit || 'Bags');
      setAdmTrialQuantity(String(req.storeReport.affectedQuantity || 10));
      setAdmTrialCriteria('Evaluate physical strength and warehouse moisture absorption.');
    }
  }, [__admArRequestId, state.analysisRequests]);

  const [salesSummaryData, setSalesSummaryData] = useState([]);
  const [revenueExpenseData, setRevenueExpenseData] = useState([]);
  const [stockLevelsData, setStockLevelsData] = useState([]);
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isReportsLoading, setIsReportsLoading] = useState(false);

  const fetchDashboardReports = async () => {
    setIsReportsLoading(true);
    try {
      const dFrom = new Date();
      dFrom.setMonth(dFrom.getMonth() - 6);
      const dateFrom = dFrom.toISOString().split('T')[0];
      const dateTo = new Date().toISOString().split('T')[0];

      const [salesRes, finRes, stockRes] = await Promise.all([
        apiClient.get(`/reports/sales/summary?date_from=${dateFrom}&date_to=${dateTo}`),
        apiClient.get(`/reports/finance/revenue-expense?date_from=${dateFrom}&date_to=${dateTo}`),
        apiClient.get('/reports/inventory/stock-levels')
      ]);

      setSalesSummaryData(salesRes.data || []);
      setRevenueExpenseData(finRes.data?.summary || []);
      setStockLevelsData(stockRes.data || []);
    } catch (err) {
      console.error('Failed to fetch Super Admin dashboard reports:', err);
    } finally {
      setIsReportsLoading(false);
    }
  };

  useEffect(() => {
    if (!view || view === 'dashboard') {
      fetchDashboardReports();
    }
  }, [view]);

  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('All');
  const [productPage, setProductPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const PRODUCTS_PER_PAGE = 10;

  const CATEGORIES = ['All', 'Mechanical', 'Structural', 'Fasteners', 'Construction', 'Electrical', 'Other'];
  const UNITS = ['Set', 'Batch', 'Lot', 'Piece', 'Kg', 'Ton', 'Unit'];
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState('create'); // 'create' | 'edit'
  const [userForm, setUserForm] = useState({ id: '', name: '', email: '', password: '', role: 'Sales', phone: '', department: 'Sales', permissions: [] });

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({ id: '', name: '', email: '', phone: '', department: 'Sales', role: 'Sales Lead', salary: 30000, active: true, joiningDate: '' });

  const [companies, setCompanies] = useState([
    { id: 'CO-001', name: 'ESS Infrastructure Pvt Ltd', industry: 'Construction & Concrete', domain: 'ess-infra.in', branchesCount: 3, status: 'Active' },
    { id: 'CO-002', name: 'Himalaya Concrete Products', industry: 'Manufacturing', domain: 'himalaya-concrete.com', branchesCount: 2, status: 'Active' },
    { id: 'CO-003', name: 'Apex Steel & Structures', industry: 'Metallurgy', domain: 'apex-steel.com', branchesCount: 1, status: 'Inactive' }
  ]);
  const [productCategories, setProductCategories] = useState(CATEGORIES.filter(c => c !== 'All'));
  const [productsList, setProductsList] = useState(() => {
    return (state?.productCatalog && state.productCatalog.length > 0) ? state.productCatalog : [
      { id: 'PRD-001', name: 'RCC Hume Pipe 600mm', category: 'Construction', costPrice: 1200, price: 1800, tax: 18, discount: 10, stock: 150, unit: 'Pieces', status: 'Active' },
      { id: 'PRD-002', name: 'FRP Square Manhole Cover 24x24', category: 'Structural', costPrice: 1500, price: 2200, tax: 18, discount: 5, stock: 80, unit: 'Pieces', status: 'Active' },
      { id: 'PRD-003', name: 'Precast Box Culvert 1200x1200', category: 'Construction', costPrice: 10000, price: 15000, tax: 18, discount: 15, stock: 45, unit: 'Pieces', status: 'Active' },
      { id: 'PRD-004', name: 'RCC Manhole Cover D-400', category: 'Construction', costPrice: 1800, price: 2500, tax: 18, discount: 8, stock: 120, unit: 'Pieces', status: 'Active' },
      { id: 'PRD-005', name: 'Prestressed Concrete Pile 300mm', category: 'Structural', costPrice: 6000, price: 8500, tax: 18, discount: 12, stock: 60, unit: 'Pieces', status: 'Active' }
    ];
  });

  useEffect(() => {
    if (state?.productCatalog && state.productCatalog.length > 0) {
      setProductsList(state.productCatalog);
    }
  }, [state?.productCatalog]);

  const DEFAULT_INITIAL_TARGETS = useMemo(() => [
    {
      id: 'TGT-2026-001',
      salespersonId: 'rahul-patel',
      salespersonName: 'Rahul Patel',
      fy: 'FY 2026-27',
      period: 'Monthly',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      targetAmount: 10000000,
      remarks: 'July Sales Target for Infrastructure Projects',
      status: 'ACTIVE'
    },
    {
      id: 'TGT-2026-002',
      salespersonId: 'amit-shah',
      salespersonName: 'Amit Shah',
      fy: 'FY 2026-27',
      period: 'Monthly',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      targetAmount: 5000000,
      remarks: 'July Target for Construction & Hume Pipes',
      status: 'ACTIVE'
    },
    {
      id: 'TGT-2026-003',
      salespersonId: 'neha-patel',
      salespersonName: 'Neha Patel',
      fy: 'FY 2026-27',
      period: 'Monthly',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      targetAmount: 8000000,
      remarks: 'July Target for Telecom & FRP Chambers',
      status: 'ACTIVE'
    }
  ], []);

  const [salesTargets, setSalesTargets] = useState([
    {
      id: 'TGT-2026-001',
      salespersonId: 'rahul-patel',
      salespersonName: 'Rahul Patel',
      fy: 'FY 2026-27',
      period: 'Monthly',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      targetAmount: 10000000,
      remarks: 'July Sales Target for Infrastructure Projects',
      status: 'ACTIVE'
    },
    {
      id: 'TGT-2026-002',
      salespersonId: 'amit-shah',
      salespersonName: 'Amit Shah',
      fy: 'FY 2026-27',
      period: 'Monthly',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      targetAmount: 5000000,
      remarks: 'July Target for Construction & Hume Pipes',
      status: 'ACTIVE'
    },
    {
      id: 'TGT-2026-003',
      salespersonId: 'neha-patel',
      salespersonName: 'Neha Patel',
      fy: 'FY 2026-27',
      period: 'Monthly',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      targetAmount: 8000000,
      remarks: 'July Target for Telecom & FRP Chambers',
      status: 'ACTIVE'
    }
  ]);

  useEffect(() => {
    if (!view || view === 'sales-target') {
      const loadTargets = async () => {
        try {
          const res = await apiClient.get('/backend/sales-targets');
          const targetList = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
          
          if (targetList.length > 0) {
            const mapped = targetList.map(t => ({
              id: t.id,
              salespersonId: t.salespersonId,
              salespersonName: t.salesperson?.name || 'Unknown',
              fy: 'FY 26-27',
              period: t.targetPeriod || t.period || 'Monthly',
              startDate: t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : '2026-07-01',
              endDate: t.endDate ? new Date(t.endDate).toISOString().split('T')[0] : '2026-07-31',
              targetAmount: Number(t.revenueTarget || t.targetAmount || 0),
              remarks: t.remarks || '',
              status: t.status || 'ACTIVE'
            })).filter(t => t.status !== 'CANCELLED');
            if (mapped.length > 0) {
              setSalesTargets(mapped);
            }
          }
        } catch (err) {
          console.warn('Backend targets endpoint error or empty; maintaining default targets.', err);
        }
      };
      loadTargets();
    }
  }, [view]);

  const [selectedSalesTarget, setSelectedSalesTarget] = useState(null);
  const [showSalesTargetModal, setShowSalesTargetModal] = useState(false);
  const [salesTargetModalMode, setSalesTargetModalMode] = useState('create'); // 'create' | 'edit'
  const [salesTargetForm, setSalesTargetForm] = useState({
    id: '',
    salespersonId: 'rahul-patel',
    salespersonName: 'Rahul Patel',
    fy: 'FY 2026-27',
    period: 'Monthly',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    targetAmount: 5000000,
    remarks: ''
  });

  const [showTargetOrdersModal, setShowTargetOrdersModal] = useState(false);
  const [showTargetProgressModal, setShowTargetProgressModal] = useState(false);

  // Filters for lists
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All');
  const [empDeptFilter, setEmpDeptFilter] = useState('All');
  const [empRoleFilter, setEmpRoleFilter] = useState('All');
  const [empStatusFilter, setEmpStatusFilter] = useState('All');
  const [topPerformersDeptFilter, setTopPerformersDeptFilter] = useState('All');

  // Direct Orders State
  const [searchCustQuery, setSearchCustQuery] = useState('');
  const [showCustDropdown, setShowCustDropdown] = useState(false);
  const [directOrderForm, setDirectOrderForm] = useState({
    customerId: '',
    customerName: '',
    company: '',
    contact: '',
    phone: '',
    email: '',
    gst: '',
    address: '',
    deliveryDate: '2026-06-25',
    priority: 'High',
    advancePayment: 0,
    paymentTerms: '7 Days'
  });
  const [smartProductSearchQuery, setSmartProductSearchQuery] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [directOrderItems, setDirectOrderItems] = useState([]);
  const [sampleRequested, setSampleRequested] = useState(false);


  // Direct Quotation State
  const [quoteTransitionData, setQuoteTransitionData] = useState(null);

  // Global Notification Composer State
  const [notifComposer, setNotifComposer] = useState({
    title: '',
    message: '',
    department: 'All',
    priority: 'High'
  });

  // Local settings form state
  const [companySettings, setCompanySettings] = useState(state.settings || {
    companyName: 'Himalaya Enterprises',
    companyAddress: '123 Industrial Area, Phase 1, Haridwar',
    currency: '₹',
    taxRate: 18,
    emailNotifications: true,
    smsNotifications: false,
    fiscalYearStart: 'April',
    emailConfig: 'smtp.himalaya.com',
    smsConfig: 'http://smsapi.himalaya.com'
  });

  // Target values and permissions state
  const [selectedRBACRole, setSelectedRBACRole] = useState('Finance Lead');
  const [rbacMatrix, setRbacMatrix] = useState({
    'Finance Lead': { Dashboard: true, 'PO Approval': true, Reports: true, 'User Management': false },
    'Sales Lead': { Dashboard: true, 'PO Approval': false, Reports: true, 'User Management': false },
    'Plant Head': { Dashboard: true, 'PO Approval': false, Reports: true, 'User Management': false },
    'Store Keeper': { Dashboard: true, 'PO Approval': false, Reports: false, 'User Management': false },
    'QC Inspector': { Dashboard: true, 'PO Approval': false, Reports: false, 'User Management': false },
    'Dispatch Officer': { Dashboard: true, 'PO Approval': false, Reports: false, 'User Management': false },
    'HR Manager': { Dashboard: true, 'PO Approval': false, Reports: true, 'User Management': true }
  });

  // Graphs Revenue Filter
  const [revenueTimeframe, setRevenueTimeframe] = useState('Monthly');
  const [selectedDept, setSelectedDept] = useState('All');
  const [dashboardMode, setDashboardMode] = useState('All'); // 'All' | 'Department' | 'Real-Time'
  const [timeFilter, setTimeFilter] = useState('Month'); // 'Today' | 'Week' | 'Month'
  const [locationFilter, setLocationFilter] = useState('All'); // 'All' | 'Haridwar' | 'Mumbai' | 'Noida'
  const [plantFilter, setPlantFilter] = useState('All'); // 'All' | 'Plant A' | 'Plant B'

  // â”€â”€ LIVE EVENT FEED STATE (from domain_events backend) â”€â”€
  const liveEvents = [];
  const liveEventsFetching = false;
  const systemHealth = {
    poller: 'Running',
    queueMode: 'Checkingâ€¦',
    dbStatus: 'Checkingâ€¦',
    processing_events_count: 0,
    stats: { pending: 0, processing: 0, failed: 0, totalRetries: 0 }
  };
  const [debugTab, setDebugTab] = useState(null);

  const [selectedTraceId, setSelectedTraceId] = useState(null);

  const traceSequence = useMemo(() => {
    if (!selectedTraceId) return [];

    // Gather all events with matching request_id
    const matchingEvents = liveEvents.filter(e => e.request_id === selectedTraceId || (e.payload && e.payload.request_id === selectedTraceId));

    // Gather all notifications with matching request_id
    const matchingNotifs = notifications.filter(n => n.request_id === selectedTraceId);

    const sequence = [];

    matchingEvents.forEach(e => {
      sequence.push({
        type: 'event',
        title: e.event_type,
        detail: `Entity: ${e.entity_type} ID: ${e.entity_id}`,
        timestamp: e.created_at ? new Date(e.created_at).getTime() : Date.now(),
        timeStr: e.created_at ? new Date(e.created_at).toLocaleTimeString('en-US') : '',
        status: e.status || 'PROCESSED'
      });
    });

    matchingNotifs.forEach(n => {
      sequence.push({
        type: 'notification',
        title: `Alert: ${n.title}`,
        detail: `Dept: ${n.department} | Message: ${n.message}`,
        timestamp: n.created_at ? new Date(n.created_at).getTime() : (n.date ? new Date(n.date).getTime() : Date.now()),
        timeStr: n.date || '',
        status: 'DELIVERED'
      });
    });

    // Sort chronologically
    sequence.sort((a, b) => a.timestamp - b.timestamp);

    // Calculate durations between steps
    return sequence.map((item, idx, arr) => {
      const duration = idx > 0 ? (item.timestamp - arr[idx - 1].timestamp) : 0;
      return {
        ...item,
        duration: duration >= 0 ? `${duration}ms` : '0ms'
      };
    });
  }, [selectedTraceId, liveEvents, notifications]);

  useEffect(() => {
    // Live events and system health fetching removed for static prototype.
  }, []);

  const isAdminPortal = window.location.pathname.startsWith('/admin');
  const orders = isAdminPortal ? (state.adminDirectOrders || []) : (state.sales?.orders || []);
  const payments = state.payments || [];
  const employees = adminData?.employees?.length ? adminData.employees : (state.employees || []);
  const usersList = adminData?.users?.length ? adminData.users : (state.users || []);
  const auditLogs = adminData?.auditLogs?.length ? adminData.auditLogs : (state.auditLogs || []);
  const directOrders = isAdminPortal ? (state.adminDirectOrders || []) : (state.directOrders || []);

  const seededTargetOrders = useMemo(() => [
    // Rahul Patel
    { id: 'ORD-TGT-001', salespersonId: 'rahul-patel', grandTotal: 2000000, confirmedAt: '2026-07-05', orderLifecycleStatus: 'ORDER_CONFIRMED', cust: 'ABC Infrastructure Ltd', prod: 'FRP Manhole Covers (Heavy Duty)' },
    { id: 'ORD-TGT-005', salespersonId: 'rahul-patel', grandTotal: 3500000, confirmedAt: '2026-07-12', orderLifecycleStatus: 'ORDER_CONFIRMED', cust: 'Smart City Dev Group', prod: 'FRP Manhole Covers (Medium)' },
    { id: 'ORD-TGT-010', salespersonId: 'rahul-patel', grandTotal: 3000000, confirmedAt: '2026-07-20', orderLifecycleStatus: 'ORDER_CONFIRMED', cust: 'Metro Projects India', prod: 'FRP Chambers (Telecom Spec)' },
    // Amit Shah
    { id: 'ORD-TGT-002', salespersonId: 'amit-shah', grandTotal: 2100000, confirmedAt: '2026-07-08', orderLifecycleStatus: 'ORDER_CONFIRMED', cust: 'Urban Construction Corp', prod: 'RCC Hume Pipes (NP3 Class)' },
    // Neha Patel
    { id: 'ORD-TGT-003', salespersonId: 'neha-patel', grandTotal: 1800000, confirmedAt: '2026-07-03', orderLifecycleStatus: 'ORDER_CONFIRMED', cust: 'Metro Projects India', prod: 'FRP Chambers (Telecom Spec)' },
    { id: 'ORD-TGT-006', salespersonId: 'neha-patel', grandTotal: 6400000, confirmedAt: '2026-07-15', orderLifecycleStatus: 'ORDER_CONFIRMED', cust: 'Smart City Dev Group', prod: 'FRP Manhole Covers (Heavy Duty)' }
  ], []);

  const getOrderSalespersonId = useCallback((order) => {
    if (order.salespersonId) return order.salespersonId;
    if (order.salesExecutiveId) return order.salesExecutiveId;
    
    const name = order.salesperson || order.salesExecutive || '';
    const norm = name.toLowerCase().trim();
    if (norm.includes('rahul')) return 'rahul-patel';
    if (norm.includes('amit shah')) return 'amit-shah';
    if (norm.includes('neha')) return 'neha-patel';
    if (norm.includes('amit sharma')) return 'amit-sharma';
    if (norm.includes('priya')) return 'priya-singh';
    if (norm.includes('michael')) return 'EMP-003';
    if (norm.includes('robert')) return 'EMP-009';
    return norm.replace(/\s+/g, '-');
  }, []);

  const getOrderDateString = useCallback((order) => {
    const rawDate = order.confirmedAt || order.createdAt || order.date;
    if (!rawDate) return '';
    if (typeof rawDate === 'number') {
      return new Date(rawDate).toISOString().split('T')[0];
    }
    if (typeof rawDate === 'string') {
      return rawDate.split('T')[0];
    }
    return '';
  }, []);

  const isTargetEligibleOrder = useCallback((order) => {
    const eligibleStatuses = [
      "ORDER_CONFIRMED",
      "SENT_TO_PLANT_HEAD",
      "PLANT_HEAD_ACCEPTED",
      "PRODUCTION_PLANNED",
      "WORK_ORDER_CREATED",
      "PRODUCTION_STARTED",
      "PRODUCTION_COMPLETED",
      "QC_PENDING",
      "QC_APPROVED",
      "DISPATCH_CREATED",
      "IN_TRANSIT",
      "DELIVERED",
      "ORDER_CLOSED",
    ];

    const currentStatus = order.orderLifecycleStatus || order.workflowStatus || order.status || '';

    return (
      eligibleStatuses.includes(currentStatus) &&
      currentStatus !== "CANCELLED" &&
      currentStatus !== "REJECTED"
    );
  }, []);

  const getTargetStatus = useCallback((pct) => {
    if (pct >= 100) return { label: 'Achieved', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
    if (pct >= 80) return { label: 'On Track', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
    if (pct >= 50) return { label: 'Needs Attention', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    return { label: 'Behind', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
  }, []);

  const formatIndianCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const allOrdersForTargetCalculations = useMemo(() => {
    return [
      ...seededTargetOrders,
      ...orders
    ];
  }, [orders, seededTargetOrders]);

  const targetRows = useMemo(() => {
    if (!Array.isArray(salesTargets)) return [];
    return salesTargets.filter(Boolean).map(t => {
      if (!t || typeof t !== 'object') return null;

      const startDate = t.startDate || t.start_date || t.periodStart || '';
      const endDate = t.endDate || t.end_date || t.periodEnd || '';
      const salespersonId = t.salespersonId || t.salesperson_id || t.userId || '';
      const targetAmount = Number(t.targetAmount || t.revenueTarget || 0);

      const qualifyingOrders = (allOrdersForTargetCalculations || []).filter(o => {
        if (!o || typeof o !== 'object') return false;
        const oSalespersonId = getOrderSalespersonId(o);
        const oDate = getOrderDateString(o);
        const isInPeriod = Boolean(oDate && startDate && endDate && oDate >= startDate && oDate <= endDate);
        return oSalespersonId === salespersonId && isInPeriod && isTargetEligibleOrder(o);
      });

      const achieved = qualifyingOrders.reduce((total, o) => total + Number(o?.grandTotal || o?.totalAmount || o?.amount || 0), 0);
      const pct = targetAmount > 0 ? Math.round((achieved / targetAmount) * 100) : 0;
      const remaining = Math.max(0, targetAmount - achieved);
      const status = getTargetStatus(pct);

      return {
        ...t,
        targetAmount,
        startDate,
        endDate,
        salespersonId,
        achieved,
        pct,
        remaining,
        status,
        qualifyingOrders
      };
    }).filter(Boolean);
  }, [salesTargets, allOrdersForTargetCalculations, getOrderSalespersonId, getOrderDateString, isTargetEligibleOrder, getTargetStatus]);
  const disabledModules = adminData?.modules?.length
    ? adminData.modules.filter(m => !Number(m.is_enabled)).map(m => String(m.module_name).toLowerCase())
    : (state.disabledModules || []).map(m => String(m).toLowerCase());


  // Ã¢â€â‚¬Ã¢â€â‚¬ FORMULA LOGIC Ã¢â€â‚¬Ã¢â€â‚¬
  const calculateSalesScore = (emp) => {
    const ordersClosed = orders.filter(o => o.salesperson === emp.name).length;
    const revenue = payments.filter(p => p.status === 'Paid' && orders.some(o => o.orderNo === p.orderNo && o.salesperson === emp.name))
      .reduce((sum, p) => sum + p.totalAmount, 0) || emp.salesRevenue || 0;
    const followups = state.sales?.leads?.filter(l => l.salesperson === emp.name && l.status === 'Follow-up').length || 5;
    return Math.round((ordersClosed * 50) + (revenue / 10000) + (followups * 5));
  };

  const calculateEmployeeScore = (emp) => {
    const attendance = emp.attendance || emp.presentDays || 25;
    const tasks = emp.tasksCompleted || 10;
    const salesRev = emp.salesRevenue || 0;
    return Math.round((attendance * 2) + (tasks * 5) + (salesRev / 10000));
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬ AUDIT LOG HELPER Ã¢â€â‚¬Ã¢â€â‚¬
  const logActivity = (action, remarks, moduleName = 'System') => {
    dispatch({
      type: 'ADD_AUDIT_LOG',
      payload: {
        id: 'AUD-' + Math.floor(1000 + Math.random() * 9000),
        user: currentUser?.name || 'Super Admin',
        action,
        orderNo: '',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        remarks,
        module: moduleName
      }
    });
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬ USER MANAGEMENT ACTIONS Ã¢â€â‚¬Ã¢â€â‚¬
  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) {
      showToast('Name and Email are required.');
      return;
    }

    const nameParts = (userForm.name || '').trim().split(/\s+/);
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    if (userModalMode === 'create') {
      adminService.createUser({
        company_id: currentUser.company_id || 1,
        username: userForm.email ? userForm.email.split('@')[0] : 'user' + Date.now(),
        email: userForm.email,
        password: userForm.password || 'password123',
        first_name,
        last_name,
        role_name: userForm.role,
        phone: userForm.phone || '',
        department: userForm.department || 'Sales'
      }).then(() => {
        logActivity('User Created', `Created user account for ${userForm.name} (${userForm.role})`, 'User Management');
        showToast(`User ${userForm.name} created successfully!`);
        syncData();
      }).catch(err => {
        showToast(`Failed to create user: ${err.message}`);
      });
    } else {
      adminService.updateUser(userForm.id, {
        company_id: currentUser.company_id || 1,
        email: userForm.email,
        first_name,
        last_name,
        role_name: userForm.role,
        phone: userForm.phone || '',
        department: userForm.department || 'Sales'
      }).then(() => {
        logActivity('User Updated', `Updated user details for ${userForm.name}`, 'User Management');
        showToast(`User ${userForm.name} updated successfully!`);
        syncData();
      }).catch(err => {
        showToast(`Failed to update user: ${err.message}`);
      });
    }
    setShowUserModal(false);
  };

  const toggleUserStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const confirmed = await confirm({
      title: `${newStatus} User`,
      message: `Are you sure you want to ${newStatus.toLowerCase()} user "${user.name}"?`,
      confirmText: newStatus,
      type: newStatus === 'Inactive' ? 'warning' : 'info'
    });
    if (confirmed) {
      withLoading(async () => {
        await adminService.toggleUserStatus(user.id, newStatus);
        logActivity('User Status Changed', `${newStatus} user account for ${user.name}`, 'User Management');
        showToast(`User account for ${user.name} is now ${newStatus}!`);
        syncData();
      }, `Failed to toggle status`).catch(err => {
        showToast(`Failed to toggle status: ${err.message}`);
      });
    }
  };

  const deleteUser = async (userId, userName) => {
    const confirmed = await confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete user ${userName}? This action cannot be undone.`,
      confirmText: 'Delete User',
      type: 'danger'
    });
    if (confirmed) {
      withLoading(async () => {
        await adminService.deleteUser(userId);
        logActivity('User Deleted', `Deleted user account ${userName} (${userId})`, 'User Management');
        showToast(`User ${userName} deleted.`);
        syncData();
      }, 'Failed to delete user').catch(err => {
        showToast(`Failed to delete user: ${err.message}`);
      });
    }
  };

  const resetUserPassword = async (user) => {
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const confirmed = await confirm({
      title: 'Reset Password',
      message: `Are you sure you want to reset password for "${user.name}"? A new random password "${tempPassword}" will be generated.`,
      confirmText: 'Reset Password',
      type: 'warning'
    });
    if (confirmed) {
      withLoading(async () => {
        await adminService.resetUserPassword(user.id, tempPassword);
        logActivity('Password Reset', `Forced password reset for user ${user.name}`, 'User Management');
        showToast(`Successfully reset password for ${user.name}. Temporary password: ${tempPassword}`);
        syncData();
      }, 'Failed to reset password').catch(err => {
        showToast(`Failed to reset password: ${err.message}`);
      });
    }
  };

  const forceLogoutUser = (user) => {
    logActivity('Force Logout', `Forced active sessions logout for ${user.name}`, 'User Management');
    showToast(`Forced logout successfully completed. User ${user.name} was disconnected from all nodes.`);
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬ ADMIN MANAGEMENT ACTIONS Ã¢â€â‚¬Ã¢â€â‚¬
  const [adminForm, setAdminForm] = useState({ id: '', name: '', email: '', password: '', status: 'Active', department: 'IT', scopes: ['User Management'] });
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminModalMode, setAdminModalMode] = useState('create'); // 'create' | 'edit'

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (!adminForm.name || !adminForm.email) {
      showToast('Name and Email are required.');
      return;
    }

    const nameParts = (adminForm.name || '').trim().split(/\s+/);
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    if (adminModalMode === 'create') {
      adminService.createUser({
        company_id: currentUser.company_id || 1,
        username: adminForm.email ? adminForm.email.split('@')[0] : 'admin' + Date.now(),
        email: adminForm.email,
        password: adminForm.password || 'admin123',
        first_name,
        last_name,
        role_name: 'Admin',
        phone: adminForm.phone || '',
        department: adminForm.department || 'IT'
      }).then(() => {
        logActivity('Admin Created', `Created Admin account for ${adminForm.name}`, 'Admin Management');
        showToast(`Admin ${adminForm.name} created successfully!`);
        syncData();
      }).catch(err => {
        showToast(`Failed to create admin: ${err.message}`);
      });
    } else {
      adminService.updateUser(adminForm.id, {
        company_id: currentUser.company_id || 1,
        email: adminForm.email,
        first_name,
        last_name,
        role_name: 'Admin',
        phone: adminForm.phone || '',
        department: adminForm.department || 'IT'
      }).then(() => {
        logActivity('Admin Updated', `Updated Admin details for ${adminForm.name}`, 'Admin Management');
        showToast(`Admin ${adminForm.name} updated successfully!`);
        syncData();
      }).catch(err => {
        showToast(`Failed to update admin: ${err.message}`);
      });
    }
    setShowAdminModal(false);
  };

  const toggleAdminStatus = async (admin) => {
    const updatedStatus = admin.status === 'Active' ? 'Inactive' : 'Active';
    const confirmed = await confirm({
      title: `${updatedStatus} Admin`,
      message: `Are you sure you want to ${updatedStatus.toLowerCase()} Admin account for "${admin.name}"?`,
      confirmText: updatedStatus,
      type: updatedStatus === 'Inactive' ? 'warning' : 'info'
    });
    if (confirmed) {
      withLoading(async () => {
        await adminService.toggleUserStatus(admin.id, updatedStatus);
        logActivity('Admin Status Changed', `Admin ${admin.name} is now ${updatedStatus}`, 'Admin Management');
        showToast(`Admin account for ${admin.name} is now ${updatedStatus}.`);
        syncData();
      }, 'Failed to toggle admin status').catch(err => {
        showToast(`Failed to toggle admin status: ${err.message}`);
      });
    }
  };

  const deleteAdmin = async (adminId, adminName) => {
    const confirmed = await confirm({
      title: 'Remove Admin Access',
      message: `Are you sure you want to remove Admin access for ${adminName}?`,
      confirmText: 'Remove Access',
      type: 'danger'
    });
    if (confirmed) {
      withLoading(async () => {
        await adminService.deleteUser(adminId);
        logActivity('Admin Access Removed', `Removed admin access credentials for ${adminName}`, 'Admin Management');
        showToast(`Admin ${adminName} removed successfully.`);
        syncData();
      }, 'Failed to delete admin').catch(err => {
        showToast(`Failed to delete admin: ${err.message}`);
      });
    }
  };

  // â€”â€” EMPLOYEE MANAGEMENT ACTIONS â€”â€”
  const handleEmployeeSubmit = (e) => {
    e.preventDefault();
    if (!employeeForm.name || !employeeForm.email) {
      showToast('Name and Email are required.');
      return;
    }

    const nameParts = (employeeForm.name || '').trim().split(/\s+/);
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    if (selectedEmployee) {
      adminService.updateEmployee(selectedEmployee.id || selectedEmployee._raw.id, {
        first_name,
        last_name,
        email: employeeForm.email,
        phone: employeeForm.phone,
        department: employeeForm.department,
        designation: employeeForm.role,
        salary: employeeForm.salary,
        status: employeeForm.active ? 'Active' : 'Inactive'
      }).then(() => {
        logActivity('Employee Updated', `Updated details for employee ${employeeForm.name}`, 'Employees');
        showToast(`Employee ${employeeForm.name} updated!`);
        syncData();
      }).catch(err => {
        showToast(`Failed to update employee: ${err.message}`);
      });
    } else {
      adminService.createEmployee({
        company_id: currentUser.company_id || 1,
        first_name,
        last_name,
        email: employeeForm.email,
        phone: employeeForm.phone,
        department: employeeForm.department,
        designation: employeeForm.role,
        salary: employeeForm.salary,
        date_of_joining: employeeForm.joiningDate || new Date().toISOString().split('T')[0]
      }).then(() => {
        logActivity('Employee Added', `Registered new employee ${employeeForm.name} (${employeeForm.role})`, 'Employees');
        showToast(`Employee ${employeeForm.name} registered!`);
        syncData();
      }).catch(err => {
        showToast(`Failed to register employee: ${err.message}`);
      });
    }
    setShowEmployeeModal(false);
  };

  const toggleEmployeeStatus = async (emp) => {
    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    const confirmed = await confirm({
      title: `${newStatus} Employee`,
      message: `Are you sure you want to set employee "${emp.name}" status to ${newStatus}?`,
      confirmText: newStatus,
      type: newStatus === 'Inactive' ? 'warning' : 'info'
    });
    if (confirmed) {
      const dbId = emp._raw?.id || emp.id;
      withLoading(async () => {
        await adminService.updateEmployee(dbId, { status: newStatus });
        logActivity('Employee Status Changed', `Set employee ${emp.name} status to ${newStatus}`, 'Employees');
        showToast(`Employee ${emp.name} is now ${newStatus}.`);
        syncData();
      }, 'Failed to toggle employee status').catch(err => {
        showToast(`Failed to toggle employee status: ${err.message}`);
      });
    }
  };

  const deleteEmployee = async (empId, empName) => {
    const confirmed = await confirm({
      title: 'Delete Employee',
      message: `Are you sure you want to delete employee "${empName}"? This action cannot be undone.`,
      confirmText: 'Delete Employee',
      type: 'danger'
    });
    if (confirmed) {
      const realId = selectedEmployee?._raw?.id || empId;
      withLoading(async () => {
        await adminService.deleteEmployee(realId);
        logActivity('Employee Removed', `Removed employee roster for ${empName} (${empId})`, 'Employees');
        showToast(`Employee ${empName} removed.`);
        syncData();
        if (selectedEmployee?.id === empId) setSelectedEmployee(null);
      }, 'Failed to delete employee').catch(err => {
        showToast(`Failed to delete employee: ${err.message}`);
      });
    }
  };

  // â€”â€” SETTINGS ACTION â€”â€”
  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    const settingsList = Object.keys(companySettings).map(key => ({
      setting_key: key,
      setting_value: String(companySettings[key]),
      setting_group: 'general'
    }));

    adminService.updateSettings(settingsList).then(() => {
      logActivity('Settings Updated', 'Updated global system settings', 'Settings');
      showToast('Company settings saved successfully!');
      syncData();
    }).catch(err => {
      showToast(`Failed to save settings: ${err.message}`);
    });
  };

  // â€”â€” PRODUCT ACTIONS â€”â€”
  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (productForm.price === '' || isNaN(productForm.price) || Number(productForm.price) < 0) {
      setFormError('Enter a valid price.');
      return;
    }
    if (productForm.stock === '' || isNaN(productForm.stock) || Number(productForm.stock) < 0) {
      setFormError('Enter a valid stock quantity.');
      return;
    }

    const costVal = Number(productForm.costPrice) || 0;
    const priceVal = Number(productForm.price) || 0;
    const discountVal = Number(productForm.discount) || 0;
    const taxVal = Number(productForm.tax) || 0;

    if (editingProduct) {
      const oldPrice = editingProduct.price;
      const priceChanged = oldPrice !== priceVal;
      const productId = editingProduct.dbId || editingProduct.id;

      productService.updateProduct(productId, {
        ...productForm,
        price: priceVal,
        sellingPrice: priceVal,
        costPrice: costVal,
        discount: discountVal,
        tax: taxVal,
        stock: Number(productForm.stock)
      }).then(async (result) => {
        if (!result.success) {
          showToast(`Error updating product: ${result.error?.message || 'Unknown error'}`);
          return;
        }
        const priceRemarks = priceChanged
          ? ` (Old Price: ₹${oldPrice.toLocaleString('en-IN')} -> New Price: ₹${priceVal.toLocaleString('en-IN')})`
          : '';
        logActivity(
          priceChanged ? 'Price Update' : 'Product Updated',
          `Updated product details for ${productForm.name}${priceRemarks}`,
          'Products'
        );
        showToast(`Product "${productForm.name}" updated successfully.`);
        await syncData();
      }).catch(err => {
        showToast(`Error: ${err.message}`);
      });
    } else {
      productService.addProduct({
        ...productForm,
        price: priceVal,
        sellingPrice: priceVal,
        costPrice: costVal,
        discount: discountVal,
        tax: taxVal,
        stock: Number(productForm.stock)
      }).then(async (result) => {
        if (!result.success) {
          showToast(`Error adding product: ${result.error?.message || 'Unknown error'}`);
          return;
        }
        logActivity('Product Created', `Created product ${productForm.name} with price ₹${priceVal.toLocaleString('en-IN')}`, 'Products');
        showToast(`Product "${productForm.name}" added successfully.`);
        await syncData();
      }).catch(err => {
        showToast(`Error: ${err.message}`);
      });
    }
    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT_FORM);
    setFormError('');
  };

  const handleDeleteProduct = async (id, name, dbId) => {
    const confirmed = await confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete product "${name}"? This cannot be undone.`,
      confirmText: 'Delete Product',
      type: 'danger'
    });
    if (confirmed) {
      const productId = dbId || id;
      const result = await productService.deleteProduct(productId);
      if (!result.success) {
        showToast(`Error deleting product: ${result.error?.message || 'Unknown error'}`);
        return;
      }
      logActivity('Product Deleted', `Deleted product ${name} (${id}) from catalog`, 'Products');
      showToast(`Product "${name}" deleted.`);
      await syncData();
    }
  };

  // â€”â€” DIRECT ORDER ACTIONS â€”â€”
  const selectExistingCustomer = (c) => {
    setDirectOrderForm(prev => ({
      ...prev,
      customerId: c.id,
      customerName: c.name,
      company: c.name,
      contact: c.name.split(' ')[0] + ' Partner',
      phone: c.phone || '+91 99999 88888',
      email: c.email || 'partner@reliance.com',
      gst: c.gst || '27AAACR1234F1Z5',
      address: c.address || 'Industrial Office complex, Mumbai'
    }));
    setSearchCustQuery(c.name);
    setShowCustDropdown(false);
  };

  const addProductToDirectOrder = (prod) => {
    const existingIdx = directOrderItems.findIndex(i => i.code === prod.id);
    if (existingIdx > -1) {
      setDirectOrderItems(prev => prev.map((item, idx) => idx === existingIdx ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.price * (1 - item.discount / 100) * (1 + item.tax / 100) } : item));
    } else {
      const defaultTax = 18;
      const defaultDiscount = 5;
      const initialTotal = 1 * prod.price * (1 - defaultDiscount / 100) * (1 + defaultTax / 100);
      setDirectOrderItems(prev => [
        ...prev,
        {
          productName: prod.name,
          code: prod.id,
          qty: 1,
          price: prod.price,
          discount: defaultDiscount,
          tax: defaultTax,
          total: initialTotal,
          isSampleRequested: false,
          sampleQty: 1,
          sampleExpectedDate: ''
        }
      ]);
    }
    setSmartProductSearchQuery('');
    setShowProductDropdown(false);
  };

  const updateDirectOrderItem = (code, field, value) => {
    setDirectOrderItems(prev => prev.map(item => {
      if (item.code === code) {
        const updated = { ...item, [field]: value };
        const q = Number(updated.qty) || 0;
        const p = Number(updated.price) || 0;
        const d = Number(updated.discount) || 0;
        const t = Number(updated.tax) || 0;
        updated.total = q * p * (1 - d / 100) * (1 + t / 100);
        return updated;
      }
      return item;
    }));
  };

  const removeDirectOrderItem = (code) => {
    setDirectOrderItems(prev => prev.filter(i => i.code !== code));
  };

  const grandDirectOrderTotal = useMemo(() => {
    return directOrderItems.reduce((sum, item) => sum + item.total, 0);
  }, [directOrderItems]);

  const handleCreateDirectOrder = async (statusType = 'Planned') => {
    if (!directOrderForm.customerName || directOrderItems.length === 0) {
      showToast('Please enter customer info and add at least one product.');
      return;
    }

    const orderNo = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const payload = {
      direct_order_no: orderNo,
      customer_name: directOrderForm.customerName,
      customer_id: directOrderForm.customerId || null,
      expected_delivery_date: directOrderForm.deliveryDate,
      priority: directOrderForm.priority,
      notes: `Direct order placed via Super Admin panel. Payment terms: ${directOrderForm.paymentTerms}.`,
      discount_total: directOrderItems.reduce((sum, item) => sum + (item.qty * item.price * (item.discount / 100)), 0),
      tax_total: directOrderItems.reduce((sum, item) => sum + (item.qty * item.price * (1 - item.discount / 100) * (item.tax / 100)), 0),
      grand_total: grandDirectOrderTotal,
      items: directOrderItems.map(item => ({
        product_id: item.code,
        product_name: item.productName,
        quantity: item.qty,
        unit_price: item.price,
        discount_percent: item.discount,
        gst_rate: item.tax
      }))
    };

    try {
      // 1. Post to backend
      const res = await apiClient.post('/admin-ops/direct-orders', payload);

      // 2. Transition order status via PUT
      if (res && res.id) {
        if (statusType === 'Planned') {
          await apiClient.put(`/admin-ops/direct-orders/${res.id}`, { status: 'Planned' });
        } else if (statusType === 'Draft') {
          await apiClient.put(`/admin-ops/direct-orders/${res.id}`, { status: 'Draft' });
        }
      }

      // 3. Create parallel samples if checked
      if (sampleRequested) {
        const sampledItems = directOrderItems.filter(item => item.isSampleRequested && item.productName.trim());
        for (const item of sampledItems) {
          const sampleNo = 'SMP-' + Math.floor(1000 + Math.random() * 9000);
          await apiClient.post('/admin-ops/samples', {
            sample_number: sampleNo,
            customer_name: directOrderForm.customerName,
            product: item.productName,
            quantity: item.sampleQty || 1,
            notes: 'Parallel sample requested via direct order'
          });
        }
      }

      showToast(statusType === 'Draft' ? 'Direct order draft saved.' : 'Direct order confirmed and dispatched to production.');
      await syncData();

      // Reset state
      setDirectOrderItems([]);
      setSampleRequested(false);
      setDirectOrderForm({
        customerId: '',
        customerName: '',
        company: '',
        contact: '',
        phone: '',
        email: '',
        gst: '',
        address: '',
        deliveryDate: '2026-06-25',
        priority: 'High',
        advancePayment: 0,
        paymentTerms: '7 Days'
      });
      setSearchCustQuery('');
      navigate.push(sampleRequested ? '/super-admin/samples' : (statusType === 'Draft' ? '/super-admin/quotations' : '/super-admin/orders'));
    } catch (err) {
      console.error('Direct order creation failed:', err);
      showToast(`Failed to create direct order: ${err.message || 'Server error'}`);
    }
  };

  const convertQuoteToDirectOrder = async (quote) => {
    try {
      const orderNo = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
      const payload = {
        source_quotation_ref: quote.dbId || quote.id,
        direct_order_no: orderNo,
        customer_name: quote.customerName
      };

      const res = await apiClient.post('/admin-ops/direct-orders', payload);

      if (res && res.id) {
        await apiClient.put(`/admin-ops/direct-orders/${res.id}`, { status: 'Planned' });
      }

      showToast(`Quotation ${quote.id || quote.quotation_no} successfully converted to Order ${orderNo}.`);
      await syncData();
    } catch (err) {
      console.error('Failed to convert quotation:', err);
      showToast(`Failed to convert quotation: ${err.message || 'Server error'}`);
    }
  };

  // ── ANNOUNCEMENT / NOTIFICATIONS ──
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifComposer.title || !notifComposer.message) {
      showToast('Please specify a title and message body.');
      return;
    }

    try {
      await apiClient.post('/notifications', {
        title: notifComposer.title,
        message: notifComposer.message,
        department: notifComposer.department === 'All' ? 'All' : notifComposer.department,
        priority: notifComposer.priority
      });

      logActivity('Global Announcement Sent', `Sent announcement: ${notifComposer.title} to department: ${notifComposer.department}`, 'Global Notifications');
      showToast('Global Announcement broadcasted successfully.');
      setNotifComposer({ title: '', message: '', department: 'All', priority: 'High' });
      await syncData();
    } catch (err) {
      console.error('Failed to send announcement:', err);
      showToast(`Failed to broadcast announcement: ${err.message || 'Server error'}`);
    }
  };

  // â”€â”€ MODULE TOGGLE ACTIONS â”€â”€
  const getModuleSynonyms = (key) => {
    return [String(key).toLowerCase().trim()];
  };

  const toggleModuleState = (moduleKey) => {
    const synonyms = getModuleSynonyms(moduleKey);
    adminService.getModules({ company_id: currentUser?.company_id || 1 })
      .then(res => {
        const modules = Array.isArray(res) ? res : (res?.data || []);
        const mod = modules.find(m => synonyms.includes(String(m.module_name).toLowerCase()));
        if (mod) {
          adminService.toggleModule(mod.id, currentUser?.company_id || 1)
            .then(async () => {
              const isDisabling = !disabledModules.some(k => synonyms.includes(k));
              logActivity(
                isDisabling ? 'Module Disabled' : 'Module Enabled',
                `Super Admin ${isDisabling ? 'disabled' : 'enabled'} ${moduleKey} module access`,
                'Module Management'
              );
              showToast(`${moduleKey} portal is now ${isDisabling ? 'Disabled' : 'Enabled'}.`);
              await syncData();
              if (refetchAdminData) {
                await refetchAdminData();
              }
            })
            .catch(err => {
              showToast(`Failed to toggle module: ${err.message}`);
            });
        } else {
          showToast(`Module ${moduleKey} not found on the backend.`);
        }
      })
      .catch(err => {
        showToast(`Failed to load modules: ${err.message}`);
      });
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬ BACKUP SIMULATOR Ã¢â€â‚¬Ã¢â€â‚¬
  const handleBackupTrigger = () => {
    logActivity('Backup Created', 'Super Admin triggered manual database seed snapshot backup', 'Backup & Restore');
    showToast('Snapshot backup completed. Serialized package state compressed and cached.');
  };

  const handleRestoreTrigger = () => {
    dispatch({ type: 'LOAD_STATE', payload: state });
    logActivity('System Restored', 'Super Admin restored database state to last backup snapshot', 'Backup & Restore');
    showToast('Snapshot database state successfully restored.');
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬ APPROVAL OVERRIDES Ã¢â€â‚¬Ã¢â€â‚¬
  const handleApprovalOverride = (orderObj, stepName) => {
    const updatedTimeline = [
      ...(orderObj.timeline || []),
      { stage: stepName, timestamp: Date.now(), remarks: `Super Admin overridden approval for stage: ${stepName}` }
    ];

    let patch = {};
    if (stepName === 'Planned') {
      patch = { plantHeadStatus: 'Approved', status: 'Planned', overallStage: 'Planned', timeline: updatedTimeline };
    } else if (stepName === 'Material Approved') {
      patch = { storeStatus: 'Issued', overallStage: 'In Production', productionStatus: 'Running', timeline: updatedTimeline };
    } else if (stepName === 'QC Passed') {
      patch = { plantHeadStatus: 'Approved', status: 'QC Passed', overallStage: 'QC Passed', timeline: updatedTimeline };
    }

    dispatch({
      type: 'UPDATE_ORDER',
      payload: { orderNo: orderObj.orderNo, ...patch }
    });

    logActivity('Override Approval', `Super Admin overridden operational constraint [${stepName}] for order ${orderObj.orderNo}`, 'Orders');
    showToast(`Overrode approval for order ${orderObj.orderNo} successfully.`);
    setSelectedOrderDetails(prev => prev ? { ...prev, ...patch } : null);
  };

  const handleDeptClick = (key) => {
    navigate.push(`/super-admin/departments/${key}`);
  };

  // â”€â”€ VIEW RENDERERS â”€â”€

  const renderRealTimeCockpit = (filteredActivityFeed, readyDispatch) => {
    // Dynamic Health state calculation
    let systemHealthStatus = 'STABLE';
    if (systemHealth.dbStatus !== 'Connected' || systemHealth.stats.failed > 0) {
      systemHealthStatus = 'CRITICAL';
    } else if (systemHealth.processing_events_count > 5 || systemHealth.stats.pending > 10) {
      systemHealthStatus = 'WARNING';
    }

    // Dynamic processing speed rolling average (last 20 events)
    const eventProcessingSpeedAvg = (() => {
      const processedEvents = liveEvents.filter(e => e.status === 'PROCESSED' && e.created_at);
      if (processedEvents.length === 0) return 120; // Default nominal fallback
      let totalDuration = 0;
      let count = 0;
      processedEvents.forEach(e => {
        const created = new Date(e.created_at).getTime();
        const processed = new Date(e.processed_at || e.updated_at || e.created_at).getTime();
        const diff = processed - created;
        if (diff >= 0) {
          totalDuration += diff;
          count++;
        }
      });
      return count > 0 ? Math.round(totalDuration / count) : 120;
    })();

    return (
      <>
        {/* Horizontal System State Bar / Strip */}
        <div className="super-admin-col-12" style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          color: '#ffffff',
          position: 'relative'
        }}>
          {/* Health indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: systemHealthStatus === 'STABLE' ? '#10b981' : (systemHealthStatus === 'WARNING' ? '#eab308' : '#ef4444'),
              boxShadow: `0 0 10px ${systemHealthStatus === 'STABLE' ? '#10b981' : (systemHealthStatus === 'WARNING' ? '#eab308' : '#ef4444')}`
            }} />
            <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              System Health: <span style={{ color: systemHealthStatus === 'STABLE' ? '#10b981' : (systemHealthStatus === 'WARNING' ? '#eab308' : '#ef4444') }}>{systemHealthStatus}</span>
            </span>
          </div>

          {/* Interactive Debug Tabs */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              onClick={() => setDebugTab(debugTab === 'db' ? null : 'db')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11.5px', borderBottom: debugTab === 'db' ? '2px solid #10b981' : 'none', paddingBottom: '2px' }}
            >
              <span style={{ color: '#8893A7', fontWeight: '700' }}>DB:</span>
              <span style={{ color: systemHealth.dbStatus === 'Connected' ? '#10b981' : '#ef4444', fontWeight: '800' }}>{systemHealth.dbStatus}</span>
            </div>

            <div
              onClick={() => setDebugTab(debugTab === 'queue' ? null : 'queue')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11.5px', borderBottom: debugTab === 'queue' ? '2px solid #3b82f6' : 'none', paddingBottom: '2px' }}
            >
              <span style={{ color: '#8893A7', fontWeight: '700' }}>Queue:</span>
              <span style={{ color: '#3b82f6', fontWeight: '800' }}>{systemHealth.queueMode.includes('BullMQ') ? 'BullMQ' : 'Fallback'}</span>
            </div>

            <div
              onClick={() => setDebugTab(debugTab === 'poller' ? null : 'poller')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11.5px', borderBottom: debugTab === 'poller' ? '2px solid #10b981' : 'none', paddingBottom: '2px' }}
            >
              <span style={{ color: '#8893A7', fontWeight: '700' }}>Poller:</span>
              <span style={{ color: systemHealth.poller === 'Running' ? '#10b981' : '#ef4444', fontWeight: '800' }}>{systemHealth.poller}</span>
            </div>

            <div
              onClick={() => setDebugTab(debugTab === 'events' ? null : 'events')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11.5px', borderBottom: debugTab === 'events' ? '2px solid #eab308' : 'none', paddingBottom: '2px' }}
            >
              <span style={{ color: '#8893A7', fontWeight: '700' }}>Events:</span>
              <span style={{ color: '#eab308', fontWeight: '800' }}>{systemHealth.stats.pending || 0} Pending</span>
            </div>
          </div>
        </div>

        {/* Clickable Debug Detail Drawer Panel */}
        {debugTab && (
          <div className="super-admin-col-12" style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1.5px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px',
            color: '#D6E2F0',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            animation: 'debugDrawerOpen 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '8px', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#F5FAFE', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ðŸ”§ Dev Console Detail: {debugTab.toUpperCase()}
              </h4>
              <button
                onClick={() => setDebugTab(null)}
                style={{ background: 'transparent', border: 'none', color: '#8893A7', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Dismiss Panel
              </button>
            </div>

            {/* DB details */}
            {debugTab === 'db' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '11.5px' }}>
                <div>
                  <span style={{ fontWeight: '700', color: '#8893A7' }}>Database Engine:</span> MariaDB 10.6
                </div>
                <div>
                  <span style={{ fontWeight: '700', color: '#8893A7' }}>Isolation Level:</span> READ COMMITTED
                </div>
                <div>
                  <span style={{ fontWeight: '700', color: '#8893A7' }}>Row Locking:</span> FOR UPDATE (Enabled)
                </div>
                <div>
                  <span style={{ fontWeight: '700', color: '#8893A7' }}>Active Connections:</span> 15 / 100 pool
                </div>
              </div>
            )}

            {/* Queue details */}
            {debugTab === 'queue' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '11.5px' }}>
                <div>
                  <span style={{ fontWeight: '700', color: '#8893A7' }}>Active Mode:</span> {systemHealth.queueMode}
                </div>
                <div>
                  <span style={{ fontWeight: '700', color: '#8893A7' }}>Job Versioning:</span> V1 payload strict compliance
                </div>
                <div>
                  <span style={{ fontWeight: '700', color: '#8893A7' }}>Worker State:</span> nominal capacity
                </div>
                <div>
                  <span style={{ fontWeight: '700', color: '#8893A7' }}>Thread Pools:</span> Auto-scaled (outbox fallback)
                </div>
              </div>
            )}

            {/* Poller details */}
            {debugTab === 'poller' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '11.5px' }}>
                <div>
                  <span style={{ fontWeight: '700', color: '#8893A7' }}>Poller Daemon:</span> Active & Running
                </div>
                <div>
                  <span style={{ fontWeight: '700', color: '#8893A7' }}>Tick Interval:</span> 3000ms loop
                </div>
                <div>
                  <span style={{ fontWeight: '700', color: '#8893A7' }}>Max Retry Limit:</span> 5 attempts capped
                </div>
                <div>
                  <span style={{ fontWeight: '700', color: '#8893A7' }}>Heartbeat:</span> Verified active thread
                </div>
              </div>
            )}

            {/* Events details */}
            {debugTab === 'events' && (
              <div style={{ fontSize: '11.5px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                  <div><span style={{ fontWeight: '700' }}>Pending:</span> {systemHealth.stats.pending}</div>
                  <div><span style={{ fontWeight: '700' }}>Processing:</span> {systemHealth.stats.processing}</div>
                  <div><span style={{ fontWeight: '700', color: '#ef4444' }}>Failed:</span> {systemHealth.stats.failed}</div>
                  <div><span style={{ fontWeight: '700', color: '#eab308' }}>Total Retries:</span> {systemHealth.stats.totalRetries}</div>
                </div>
                {liveEvents.filter(e => e.status === 'FAILED').length > 0 && (
                  <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', padding: '10px', maxHeight: '100px', overflowY: 'auto' }}>
                    <strong style={{ color: '#f87171', display: 'block', marginBottom: '4px' }}>Failed Event Logs:</strong>
                    {liveEvents.filter(e => e.status === 'FAILED').map((ev, i) => (
                      <div key={i} style={{ fontSize: '10.5px', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '2px' }}>
                        [{ev.event_type}] ID: {ev.id} Â· Error: {ev.error_log || 'Unknown'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <style dangerouslySetInnerHTML={{
              __html: `
              @keyframes debugDrawerOpen {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}} />
          </div>
        )}

        {/* Left Panel: Alerts Panel (Failed events + High-priority notifications) */}
        <div className="super-admin-col-4 animated-card delay-1">
          <div className="glass-card p-6" style={{ minHeight: '410px', height: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={14} color="#ef4444" />
                System Alerts Panel
              </h3>
              <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)' }}>
                Failed events & High-priority alerts
              </span>
            </div>

            {/* Sub-section 1: Failed Outbox Events */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, maxHeight: '165px', overflowY: 'auto' }}>
              <h4 style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#ef4444', borderBottom: '1px solid rgba(239,68,68,0.15)', paddingBottom: '4px', margin: 0 }}>
                Failed Outbox Events ({liveEvents.filter(e => e.status === 'FAILED').length})
              </h4>
              {liveEvents.filter(e => e.status === 'FAILED').length === 0 ? (
                <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                  No failed outbox events recorded.
                </div>
              ) : (
                liveEvents.filter(e => e.status === 'FAILED').map((ev, i) => {
                  const hasRetrySpike = ev.retry_count >= 3;
                  return (
                    <div
                      key={i}
                      className={hasRetrySpike ? 'pulse-alert-row' : ''}
                      style={{
                        padding: '6px 8px',
                        background: 'rgba(239,68,68,0.04)',
                        border: '1px solid rgba(239,68,68,0.12)',
                        borderRadius: '6px',
                        animation: hasRetrySpike ? 'alertPulseRow 2s infinite ease-in-out' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '700', color: '#ef4444' }}>
                        <span>{ev.event_type}</span>
                        <span>ID: {ev.id}</span>
                      </div>
                      <p style={{ fontSize: '9.5px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.payload?.error || ev.error_log || 'Execution failed. Retrying.'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sub-section 2: High Priority Notifications */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, maxHeight: '165px', overflowY: 'auto' }}>
              <h4 style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#eab308', borderBottom: '1px solid rgba(234,179,8,0.15)', paddingBottom: '4px', margin: 0 }}>
                High Priority Alerts ({notifications.filter(n => n.priority === 'High' && !n.read).length})
              </h4>
              {notifications.filter(n => n.priority === 'High' && !n.read).length === 0 ? (
                <div style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                  No high-priority notifications.
                </div>
              ) : (
                notifications.filter(n => n.priority === 'High' && !n.read).map((notif, i) => (
                  <div key={i} style={{ padding: '6px 8px', background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.12)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '700', color: '#eab308' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{notif.title}</span>
                      <span style={{ fontSize: '8.5px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>{notif.department}</span>
                    </div>
                    <p style={{ fontSize: '9.5px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {notif.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Middle Panel: Live Event Feed (from domain_events backend) */}
        <div className="super-admin-col-4 animated-card delay-2">
          <div className="glass-card p-6" style={{ minHeight: '410px', height: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', background: '#10b981',
                    boxShadow: '0 0 8px rgba(16,185,129,0.7)',
                    animation: 'eventPulse 1.8s ease-in-out infinite',
                    display: 'inline-block'
                  }} />
                  <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>Live Event Stream</h3>
                </div>
                <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)' }}>
                  {liveEventsFetching ? 'Syncingâ€¦' : `${liveEvents.length > 0 ? liveEvents.length : filteredActivityFeed.length} events Â· 15s polls`}
                </span>
              </div>
              <span style={{
                fontSize: '9px', fontWeight: '800',
                background: 'rgba(16,185,129,0.1)', color: '#10b981',
                border: '1px solid rgba(16,185,129,0.25)',
                padding: '3px 8px', borderRadius: '12px', letterSpacing: '0.3px',
              }}>LIVE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
              {(() => {
                const eventsToShow = liveEvents.length > 0
                  ? liveEvents.slice(0, 8).map((e, i) => ({
                    id: e.id || i,
                    action: e.event_type || e.type || 'System Event',
                    remarks: e.payload
                      ? (typeof e.payload === 'string' ? e.payload : JSON.stringify(e.payload)).substring(0, 80)
                      : 'Event processed',
                    user: e.entity_type || 'System',
                    module: e.entity_type || 'Core',
                    time: e.created_at ? new Date(e.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
                    status: e.status || 'PROCESSED',
                    isBackend: true,
                    request_id: e.request_id || (e.payload && e.payload.request_id) || null,
                    created_at: e.created_at || null
                  }))
                  : filteredActivityFeed.map((log, i) => ({ ...log, id: log.id || i, isBackend: false }));

                if (eventsToShow.length === 0) {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '10px', color: 'var(--color-text-muted)', padding: '20px' }}>
                      <Activity size={28} strokeWidth={1.5} />
                      <span style={{ fontSize: '11px', textAlign: 'center' }}>No events logged yet.</span>
                    </div>
                  );
                }

                return eventsToShow.map((ev, idx) => {
                  const statusMeta = {
                    'PROCESSED': { color: '#10b981', bg: 'rgba(16,185,129,0.08)', label: 'OK' },
                    'PENDING': { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'PENDING' },
                    'FAILED': { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', label: 'FAIL' },
                  }[ev.status] || { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', label: ev.status || 'EVT' };

                  const moduleColor = [
                    '#7C3AED', '#4F46E5', '#0891b2', '#d97706', '#ef4444', '#16a34a', '#ec4899', '#0284c7'
                  ][idx % 8];

                  // Check if this event was added within last 5 seconds to highlight once
                  const isNew = ev.time && (Date.now() - new Date(ev.created_at).getTime() < 5000);

                  return (
                    <div
                      key={ev.id}
                      style={{
                        display: 'flex', gap: '10px',
                        background: isNew ? 'rgba(16, 185, 129, 0.04)' : 'rgba(15,23,42,0.015)',
                        padding: '9px 11px',
                        borderRadius: '10px',
                        border: isNew ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(15,23,42,0.05)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        background: `${moduleColor}14`, border: `1px solid ${moduleColor}30`,
                        color: moduleColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        fontSize: '9px', fontWeight: '800',
                      }}>
                        {(ev.module || ev.entity_type || 'EV').substring(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {ev.action}
                          </span>
                          <span style={{
                            fontSize: '8px', fontWeight: '800',
                            background: statusMeta.bg, color: statusMeta.color,
                            padding: '1px 4px', borderRadius: '4px', flexShrink: 0,
                          }}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.remarks}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '8.5px', color: 'var(--color-text-muted)' }}>
                            {ev.isBackend ? 'ðŸ”— DB' : 'ðŸ“‹ Audit'} Â· {ev.user || 'System'}
                          </span>
                          <span style={{ fontSize: '8.5px', color: 'var(--color-text-muted)' }}>{ev.time}</span>
                        </div>
                        {ev.request_id && (
                          <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'flex-start' }}>
                            <span
                              onClick={(e) => { e.stopPropagation(); setSelectedTraceId(ev.request_id); }}
                              style={{
                                fontSize: '8.5px', fontWeight: '800',
                                background: 'rgba(99, 102, 241, 0.08)', color: '#6366f1',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                padding: '1px 5px', borderRadius: '3px', cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: '3px'
                              }}
                            >
                              <Activity size={8} /> Trace: {ev.request_id.substring(0, 8)}...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Right Panel: System Health & Stress Monitor */}
        <div className="super-admin-col-4 animated-card delay-3">
          <div className="glass-card p-6" style={{ minHeight: '410px', height: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={14} color="#06b6d4" />
                Stress & Health Monitor
              </h3>
              <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)' }}>
                Production-grade stress verification metrics
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {/* Metric 1: Idempotency enforcement */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Idempotency Guard</div>
                  <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)' }}>Duplicate request prevention</div>
                </div>
                <span style={{ fontSize: '9px', background: '#10b981', color: '#ffffff', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>ACTIVE</span>
              </div>

              {/* Metric 2: Transaction Row Locking */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.12)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Concurrency Locking</div>
                  <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)' }}>MariaDB FOR UPDATE rows</div>
                </div>
                <span style={{ fontSize: '9px', background: '#06b6d4', color: '#ffffff', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>ACTIVE</span>
              </div>

              {/* Metric 3: Outbox Poller status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: systemHealth.poller === 'Running' ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)', border: systemHealth.poller === 'Running' ? '1px solid rgba(16,185,129,0.12)' : '1px solid rgba(239,68,68,0.12)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Outbox Poller Daemon</div>
                  <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)' }}>Daemon query interval: 3000ms</div>
                </div>
                <span style={{ fontSize: '9px', background: systemHealth.poller === 'Running' ? '#10b981' : '#ef4444', color: '#ffffff', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                  {systemHealth.poller.toUpperCase()}
                </span>
              </div>

              {/* Metric 4: DB Pool state */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: systemHealth.dbStatus === 'Connected' ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)', border: systemHealth.dbStatus === 'Connected' ? '1px solid rgba(16,185,129,0.12)' : '1px solid rgba(239,68,68,0.12)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Database Connection</div>
                  <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)' }}>MariaDB active transaction pool</div>
                </div>
                <span style={{ fontSize: '9px', background: systemHealth.dbStatus === 'Connected' ? '#10b981' : '#ef4444', color: '#ffffff', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                  {systemHealth.dbStatus.toUpperCase()}
                </span>
              </div>

              {/* Metric 5: Event Processing Speed (Dynamic rolling average) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.12)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Event Processing Speed</div>
                  <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)' }}>Rolling average of last 20 runs</div>
                </div>
                <span style={{ fontSize: '9.5px', background: 'var(--color-primary)', color: '#000000', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                  âš¡ {eventProcessingSpeedAvg}ms avg
                </span>
              </div>

              {/* Metric 6: Retry count spikes */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: systemHealth.stats.totalRetries > 0 ? 'rgba(239,68,68,0.04)' : 'rgba(100,116,139,0.04)', border: systemHealth.stats.totalRetries > 0 ? '1px solid rgba(239,68,68,0.12)' : '1px solid rgba(100,116,139,0.12)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Total Outbox Retries</div>
                  <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)' }}>Failed: {systemHealth.stats.failed} | Processing: {systemHealth.stats.processing}</div>
                </div>
                <span style={{ fontSize: '9px', background: systemHealth.stats.totalRetries > 0 ? '#ef4444' : '#5E6B82', color: '#ffffff', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                  {systemHealth.stats.totalRetries} RETRIES
                </span>
              </div>

              {/* Metric 7: Active Worker Load */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: (systemHealth.processing_events_count || 0) > 5 ? 'rgba(239,68,68,0.04)' : 'rgba(6,182,212,0.04)', border: (systemHealth.processing_events_count || 0) > 5 ? '1px solid rgba(239,68,68,0.12)' : '1px solid rgba(6,182,212,0.12)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Active Worker Load</div>
                  <div style={{ fontSize: '9px', color: 'var(--color-text-secondary)' }}>Processing events: {systemHealth.processing_events_count || 0}</div>
                </div>
                <span style={{ fontSize: '9px', background: (systemHealth.processing_events_count || 0) > 5 ? '#ef4444' : '#06b6d4', color: '#ffffff', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                  {(systemHealth.processing_events_count || 0) > 5 ? 'HIGH PRESSURE' : 'NOMINAL'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes alertPulseRow {
            0%, 100% { background: rgba(239,68,68,0.04); border-color: rgba(239,68,68,0.12); }
            50% { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); }
          }
          .pulse-alert-row {
            animation: alertPulseRow 2s infinite ease-in-out;
          }
        `}} />
      </>
    );
  };

  // 1. DASHBOARD COMMAND CENTER
  const renderDashboard = () => {
    // Dynamic filters based on active selection
    const filteredOrders = orders.filter(o => {
      const orderTime = o.createdAt || Date.now();
      const diffMs = Date.now() - orderTime;
      if (timeFilter === 'Today' && diffMs > 86400000) return false;
      if (timeFilter === 'Week' && diffMs > 86400000 * 7) return false;

      return true;
    });

    const filteredLeads = (state.sales?.leads || []).filter(l => {
      const leadTime = l.timeline?.[0]?.timestamp || Date.now();
      const diffMs = Date.now() - leadTime;
      if (timeFilter === 'Today' && diffMs > 86400000) return false;
      if (timeFilter === 'Week' && diffMs > 86400000 * 7) return false;

      return true;
    });

    const filteredPayments = payments;

    const totalUsers = usersList.length;
    const activeUsers = usersList.filter(u => u.status === 'Active').length;
    const totalRevenue = filteredPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.totalAmount, 0);
    const outstanding = filteredPayments.filter(p => p.status !== 'Paid').reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0);

    // Summary details from state
    const runningJobsCount = filteredOrders.filter(o => o.productionStatus === 'Running').length;
    const completedJobsCount = filteredOrders.filter(o => o.productionStatus === 'Completed' || o.status === 'Closed').length;
    const delayedJobsCount = filteredOrders.filter(o => o.productionStatus === 'Running' && o.deliveryDate < '2026-06-19').length;

    const materialApprovals = state.materialRequests?.filter(mr => mr.status === 'Pending').length || 0;
    const qcApprovals = filteredOrders.filter(o => o.overallStage === 'QC Pending').length || 0;
    const poApprovals = state.purchaseOrders?.filter(po => po.status === 'REQUESTED' || po.status === 'AWAITING_FINANCE_CONFIRMATION' || po.status === 'PENDING_SUPER_ADMIN_APPROVAL').length || 0;
    const totalPendingApprovals = materialApprovals + qcApprovals + poApprovals;

    const readyDispatch = filteredOrders.filter(o => ['QC Passed', 'QC_PASSED', 'DISPATCH_READY'].includes(o.overallStage) || o.dispatchStatus === 'Ready').length;
    const inTransit = filteredOrders.filter(o => ['Dispatched', 'DISPATCH_CREATED', 'Dispatch Created', 'In Transit', 'IN_TRANSIT'].includes(o.overallStage) || o.dispatchStatus === 'In Transit').length;
    const delivered = filteredOrders.filter(o => ['Delivered', 'DELIVERED', 'Closed', 'CLOSED'].includes(o.overallStage) || o.dispatchStatus === 'Delivered' || o.status === 'Closed' || o.status === 'CLOSED').length;

    // Simulated Stock values
    const rawStockVal = (state.rawInventory || []).reduce((sum, i) => sum + (i.stock * 350), 0);
    const finStockVal = (state.finishedInventory || []).reduce((sum, i) => sum + (i.stock * 12000), 0);
    const totalInventoryValue = rawStockVal + finStockVal;

    const departments = [
      "All",
      "Sales",
      "Production",
      "Plant Head",
      "Store",
      "Dispatch",
      "Finance",
      "HR",
      "QC"
    ];

    // Master Switcher Color Palette
    const COLORS_ALL = [
      "#7C3AED", "#4F46E5", "#06B6D4", "#10B981",
      "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6"
    ];

    const DEPT_COLORS = {
      Sales: ["#7C3AED", "#8B5CF6", "#A78BFA", "#C084FC"],
      Production: ["#4F46E5", "#6366F1", "#818CF8", "#93C5FD"],
      "Plant Head": ["#8B5CF6", "#A78BFA", "#C084FC", "#DDD6FE"],
      Store: ["#06B6D4", "#22D3EE", "#67E8F9", "#A5F3FC"],
      Dispatch: ["#F59E0B", "#FBBF24", "#FDE047", "#FEF08A"],
      Finance: ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0"],
      HR: ["#EF4444", "#F87171", "#FCA5A5", "#FEE2E2"],
      QC: ["#EC4899", "#F472B6", "#F472B6", "#FCE7F3"]
    };

    // Master switchable database compiled dynamically
    const departmentData = {
      All: {
        kpis: [
          { title: "Total Revenue", value: `₹${(totalRevenue).toLocaleString('en-IN')}`, change: "+12%", isPositive: true, icon: DollarSign, color: "#10B981", subtext: "Live database collections" },
          { title: "Pending Orders", value: String(orders.filter(o => !['Delivered', 'Closed', 'Cancelled'].includes(o.status)).length), change: "+8%", isPositive: true, icon: Package, color: "#7C3AED", subtext: "Active in pipeline" },
          { title: "Production Running", value: String(orders.filter(o => o.productionStatus === 'Running' || o.status === 'In Production').length), change: "-3%", isPositive: false, icon: Activity, color: "#4F46E5", subtext: "Jobs on floor" },
          { title: "Pending Payments", value: `₹${(outstanding).toLocaleString('en-IN')}`, change: "+5%", isPositive: true, icon: FileText, color: "#EF4444", subtext: "Receivables ledger" },
          { title: "Dispatch Pending", value: String(orders.filter(o => ['QC Passed', 'DISPATCH_READY', 'Ready'].includes(o.overallStage) || o.dispatchStatus === 'Ready').length), change: "-2%", isPositive: false, icon: ShieldAlert, color: "#F59E0B", subtext: "Logistics queue" },
          { title: "QC Failures", value: String(orders.filter(o => o.productionStatus === 'QC Failed').length), change: "+1%", isPositive: true, icon: UserCheck, color: "#EC4899", subtext: "Defect inspection check" }
        ],
        donut: [
          { name: "Sales Leads", value: state.sales?.leads?.length || 0 },
          { name: "Production", value: orders.length || 0 },
          { name: "Store SKUs", value: state.rawInventory?.length || 0 },
          { name: "Finance Trans", value: payments.length || 0 },
          { name: "Dispatched", value: orders.filter(o => o.status === 'Dispatched' || o.status === 'Delivered').length || 0 },
          { name: "HR Staff", value: employees.length || 0 },
          { name: "QC Samples", value: (state.sales?.samples || []).length || 0 }
        ],
        donutTitle: "Department Contribution",
        donutSub: "Operational weight distribution",
        donutLabel: "ERP Nodes",
        revenue: salesSummaryData.length > 0
          ? [...salesSummaryData].slice(0, 6).reverse().map(item => {
            const [yr, mn] = item.month.split('-');
            const monthNames = {
              '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
              '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
            };
            return {
              name: monthNames[mn] || item.month,
              revenue: parseFloat(item.total_revenue || 0),
              target: parseFloat(item.total_revenue || 0) * 1.1 || 1000000
            };
          })
          : [
            { name: 'Jan', revenue: 420000, target: 500000 },
            { name: 'Feb', revenue: 580000, target: 500000 },
            { name: 'Mar', revenue: 850000, target: 700000 },
            { name: 'Apr', revenue: 490000, target: 700000 },
            { name: 'May', revenue: 950000, target: 800000 },
            { name: 'Jun', revenue: totalRevenue || 1240000, target: 1000000 }
          ],
        revenueTitle: "Revenue Trend & Trading Analytics",
        revenueSub: "Achieved collections against allocated monthly targets",
        insights: [
          `Production delay resolved: ${orders.filter(o => o.productionStatus === 'Running').length} active jobs running.`,
          `Collections: ₹${totalRevenue.toLocaleString('en-IN')} deposited in main account ledger.`,
          `Logistics tracking: ${orders.filter(o => o.dispatchStatus === 'In Transit').length} shipments currently in transit.`,
          `Workforce: ${employees.filter(e => e.status === 'Active').length} staff currently clocked in.`
        ],
        colors: COLORS_ALL
      },
      Sales: {
        kpis: [
          { title: "Lead Influx", value: String(state.sales?.leads?.length || 0), change: "+15%", isPositive: true, icon: Users, color: "#7C3AED", subtext: "Total CRM contacts" },
          { title: "Conversions", value: String(state.customers?.length || 0), change: "+12%", isPositive: true, icon: UserCheck, color: "#a855f7", subtext: "Customers finalized" },
          { title: "Quoted Pipeline", value: `₹${(quotationsData.reduce((sum, q) => sum + (Number(q.totalAmount || q.amount) || 0), 0)).toLocaleString('en-IN')}`, change: "+8%", isPositive: true, icon: DollarSign, color: "#10B981", subtext: "Quotations awaiting conversion" },
          { title: "Sales Win Rate", value: state.sales?.quotations?.length > 0 ? `${Math.round((state.sales?.quotations.filter(q => ['Approved', 'Converted', 'CONVERTED'].includes(q.status)).length / state.sales?.quotations.length) * 100)}%` : "0%", change: "+5%", isPositive: true, icon: TrendingUp, color: "#06B6D4", subtext: "Approved quote win percentage" }
        ],
        donut: (state.sales?.leads && state.sales?.leads.length > 0)
          ? [
            { name: "New Leads", value: state.sales?.leads.filter(l => l.status === 'New').length || 0 },
            { name: "Follow-up", value: state.sales?.leads.filter(l => l.status === 'Follow-up').length || 0 },
            { name: "Sample Stage", value: state.sales?.leads.filter(l => ['Sample Stage', 'Converted'].includes(l.status)).length || 0 },
            { name: "Lost Leads", value: state.sales?.leads.filter(l => l.status === 'Lost').length || 0 }
          ]
          : [
            { name: "New Leads", value: 35 },
            { name: "Contacted", value: 25 },
            { name: "Proposal Sent", value: 25 },
            { name: "Negotiation", value: 15 }
          ],
        donutTitle: "Sales Lead Funnel Status",
        donutSub: "Pipeline division of active prospects",
        donutLabel: "Leads",
        revenue: salesSummaryData.length > 0
          ? [...salesSummaryData].slice(0, 6).reverse().map(item => {
            const [yr, mn] = item.month.split('-');
            const monthNames = {
              '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
              '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
            };
            return {
              name: monthNames[mn] || item.month,
              revenue: parseFloat(item.total_revenue || 0),
              target: parseFloat(item.total_revenue || 0) * 1.15 || 500000
            };
          })
          : [
            { name: 'Jan', revenue: 250000, target: 300000 },
            { name: 'Feb', revenue: 310000, target: 300000 },
            { name: 'Mar', revenue: 480000, target: 400000 },
            { name: 'Apr', revenue: 390000, target: 400000 },
            { name: 'May', revenue: 520000, target: 450000 },
            { name: 'Jun', revenue: 640000, target: 500000 }
          ],
        revenueTitle: "Sales Booking Trend",
        revenueSub: "Gross closed contract value from CRM leads",
        insights: [
          `Lead pipeline has logged ${state.sales?.leads?.length || 0} potential accounts.`,
          `Sales conversion win rate is holding steady at ${state.sales?.quotations?.length > 0 ? Math.round((state.sales?.quotations.filter(q => ['Approved', 'Converted', 'CONVERTED'].includes(q.status)).length / state.sales?.quotations.length) * 100) : 0}%.`,
          `Direct quotations have generated ₹${(quotationsData.reduce((sum, q) => sum + (Number(q.totalAmount || q.amount) || 0), 0)).toLocaleString('en-IN')} in bookings.`
        ],
        colors: DEPT_COLORS.Sales
      },
      Production: {
        kpis: [
          { title: "Running Jobs", value: String(runningJobsCount), change: "+6%", isPositive: true, icon: Activity, color: "#4F46E5", subtext: "Active jobs on floor" },
          { title: "Completed Today", value: String(completedJobsCount), change: "+9%", isPositive: true, icon: UserCheck, color: "#34d399", subtext: "Batches closed" },
          { title: "Floor Efficiency", value: state.workOrders?.length > 0 ? `${Math.round((state.workOrders.filter(w => w.status === 'Completed').length / state.workOrders.length) * 100)}%` : "100%", change: "-3%", isPositive: false, icon: TrendingUp, color: "#F59E0B", subtext: "Batch completion index" },
          { title: "Rework Orders", value: String(state.reproductions?.length || 0), change: "+1%", isPositive: true, icon: ShieldAlert, color: "#EF4444", subtext: "Items flagged for rework" }
        ],
        donut: [
          { name: "Blocks Category", value: orders.filter(o => String(o.products || '').toLowerCase().includes('block')).length || 10 },
          { name: "Bricks Category", value: orders.filter(o => String(o.products || '').toLowerCase().includes('brick')).length || 5 },
          { name: "Stones Category", value: orders.filter(o => String(o.products || '').toLowerCase().includes('stone')).length || 3 },
          { name: "Others Category", value: orders.filter(o => !['block', 'brick', 'stone'].some(k => String(o.products || '').toLowerCase().includes(k))).length || 2 }
        ],
        donutTitle: "Work Order Division",
        donutSub: "Batches split by product categories",
        donutLabel: "Batches",
        revenue: [
          { name: 'Jan', revenue: 110, target: 120 },
          { name: 'Feb', revenue: 130, target: 130 },
          { name: 'Mar', revenue: 160, target: 150 },
          { name: 'Apr', revenue: 140, target: 150 },
          { name: 'May', revenue: 180, target: 170 },
          { name: 'Jun', revenue: runningJobsCount + completedJobsCount || 192, target: 180 }
        ],
        revenueTitle: "Production Output Index",
        revenueSub: "Total completed batches vs planned scheduling parameters",
        insights: [
          `Active production queue contains ${runningJobsCount} running jobs.`,
          `Rework buffer: ${state.reproductions?.length || 0} items currently flagged for remediation.`,
          `Plant floor output has successfully completed ${completedJobsCount} jobs.`
        ],
        colors: DEPT_COLORS.Production
      },
      "Plant Head": {
        kpis: [
          { title: "Plant Active Plans", value: String(state.workOrders?.filter(w => w.status === 'Released' || w.status === 'Running').length || 0), change: "+3%", isPositive: true, icon: Activity, color: "#8B5CF6", subtext: "Equipment work plans released" },
          { title: "Pending POs", value: String(poApprovals), change: "-1%", isPositive: false, icon: FileText, color: "#F59E0B", subtext: "Purchase orders awaiting approval" },
          { title: "Material Requests", value: String(materialApprovals), change: "+2%", isPositive: true, icon: ShieldAlert, color: "#EC4899", subtext: "Indents awaiting confirmation" },
          { title: "QC Override Limit", value: "0", change: "0%", isPositive: true, icon: Users, color: "#22d3ee", subtext: "No active override constraints" }
        ],
        donut: [
          { name: "Pending PH Confirm", value: orders.filter(o => o.status === 'PENDING_PLANT_HEAD' || o.plantHeadStatus === 'Pending').length || 1 },
          { name: "Planned Staging", value: orders.filter(o => o.status === 'Planned' || o.status === 'Planning').length || 1 },
          { name: "Production Floor", value: orders.filter(o => o.status === 'In Production' || o.productionStatus === 'Running').length || 1 },
          { name: "Quality QC Check", value: orders.filter(o => o.status === 'QC Pending' || o.overallStage === 'QC Pending').length || 0 }
        ],
        donutTitle: "Floor Resource Utilization",
        donutSub: "Machine allocations by floor line",
        donutLabel: "OEE Share",
        revenue: [
          { name: 'Jan', revenue: 85, target: 80 },
          { name: 'Feb', revenue: 87, target: 80 },
          { name: 'Mar', revenue: 92, target: 85 },
          { name: 'Apr', revenue: 89, target: 85 },
          { name: 'May', revenue: 94, target: 90 },
          { name: 'Jun', revenue: 96, target: 90 }
        ],
        revenueTitle: "OEE Trend Index",
        revenueSub: "Monthly overall equipment effectiveness plant score",
        insights: [
          `Pending PO Indents count: ${poApprovals} requests awaiting plant head release.`,
          `Store request queues: ${materialApprovals} indents awaiting clearance.`,
          `Shift scheduling: All assembly modules reported safely online.`
        ],
        colors: DEPT_COLORS["Plant Head"]
      },
      Store: {
        kpis: [
          { title: "Raw Inventory Val", value: `₹${Math.round(rawStockVal).toLocaleString('en-IN')}`, change: "+4%", isPositive: true, icon: DollarSign, color: "#06B6D4", subtext: "Raw material value stock" },
          { title: "Finished Goods Val", value: `₹${Math.round(finStockVal).toLocaleString('en-IN')}`, change: "+11%", isPositive: true, icon: Package, color: "#22d3ee", subtext: "Finished items value stock" },
          { title: "Low Stock Alerts", value: String(state.rawInventory?.filter(i => i.stock <= (i.reorderLevel || i.min_stock || 10)).length || 0), change: "+1%", isPositive: true, icon: ShieldAlert, color: "#EF4444", subtext: "Items below safety buffers" },
          { title: "Issued Material", value: String(state.materialRequests?.filter(mr => mr.status === 'Issued').length || 0), change: "+9%", isPositive: true, icon: UserCheck, color: "#10B981", subtext: "Material slips cleared" }
        ],
        donut: (state.rawInventory && state.rawInventory.length > 0)
          ? state.rawInventory.slice(0, 4).map(item => ({
            name: item.materialName || item.product_name || item.name,
            value: Math.round(parseFloat(item.stock || item.on_hand_balance || 0) * (item.unitPrice || 350))
          }))
          : [
            { name: "Steel Sheets", value: 50 },
            { name: "Concrete Mix", value: 20 },
            { name: "Fasteners M8", value: 15 },
            { name: "Coating Resins", value: 15 }
          ],
        donutTitle: "Inventory Value Breakup",
        donutSub: "Stock values categorized by material types",
        donutLabel: "SKU Value",
        revenue: stockLevelsData.length > 0
          ? stockLevelsData.slice(0, 6).map(item => ({
            name: (item.product_name || item.name).substring(0, 10),
            revenue: parseFloat(item.on_hand_balance || 0),
            target: parseFloat(item.min_stock_level || 0)
          }))
          : [
            { name: 'Jan', revenue: 500, target: 450 },
            { name: 'Feb', revenue: 450, target: 400 },
            { name: 'Mar', revenue: 700, target: 600 },
            { name: 'Apr', revenue: 620, target: 600 },
            { name: 'May', revenue: 800, target: 700 },
            { name: 'Jun', revenue: 840, target: 700 }
          ],
        revenueTitle: "Store Inventory Safety Levels",
        revenueSub: "On-hand balance vs minimum safety threshold level",
        insights: [
          `Inventory catalog: ${state.rawInventory?.length || 0} active master material SKUs.`,
          `Low stock buffer: ${state.rawInventory?.filter(i => (i.stock || 0) <= (i.reorderLevel || 10)).length || 0} items require procurement indents.`,
          `Material issuances: ${state.materialRequests?.filter(mr => mr.status === 'Issued').length || 0} work releases dispatched.`
        ],
        colors: DEPT_COLORS.Store
      },
      Dispatch: {
        kpis: [
          { title: "Ready Dispatch", value: String(readyDispatch), change: "-4%", isPositive: false, icon: Package, color: "#F59E0B", subtext: "Packages in bay" },
          { title: "In Transit", value: String(inTransit), change: "+15%", isPositive: true, icon: Activity, color: "#a855f7", subtext: "Shipments on road" },
          { title: "Delivered Today", value: String(delivered), change: "+8%", isPositive: true, icon: UserCheck, color: "#10B981", subtext: "Deliveries closed" },
          { title: "Fulfillment Rate", value: orders.length > 0 ? `${Math.round((orders.filter(o => ['Delivered', 'Closed'].includes(o.status)).length / orders.length) * 100)}%` : "100%", change: "+12%", isPositive: true, icon: DollarSign, color: "#06B6D4", subtext: "Closed vs total orders" }
        ],
        donut: [
          { name: "QC Passed / Ready", value: orders.filter(o => ['QC Passed', 'QC_PASSED', 'DISPATCH_READY', 'Ready'].includes(o.overallStage)).length || 1 },
          { name: "Active Transit Route", value: orders.filter(o => o.status === 'In Transit' || o.overallStage === 'In Transit').length || 1 },
          { name: "Completed Deliveries", value: orders.filter(o => o.status === 'Delivered' || o.status === 'Closed').length || 1 }
        ],
        donutTitle: "Shipment Staging Breakdown",
        donutSub: "Shipments handled by transport modes",
        donutLabel: "Shipments",
        revenue: [
          { name: 'Jan', revenue: 18, target: 20 },
          { name: 'Feb', revenue: 22, target: 20 },
          { name: 'Mar', revenue: 35, target: 30 },
          { name: 'Apr', revenue: 28, target: 30 },
          { name: 'May', revenue: 42, target: 40 },
          { name: 'Jun', revenue: delivered || 45, target: 40 }
        ],
        revenueTitle: "Completed Shipments Trend",
        revenueSub: "Monthly dispatch orders successfully delivered",
        insights: [
          `Bay logistics: ${readyDispatch} packages cleared and ready in loading dock.`,
          `Logistics footprint: ${inTransit} shipments currently on active shipping routes.`,
          `Fulfillment rate target holding strong at ${orders.length > 0 ? Math.round((orders.filter(o => ['Delivered', 'Closed'].includes(o.status)).length / orders.length) * 100) : 100}%.`
        ],
        colors: DEPT_COLORS.Dispatch
      },
      Finance: {
        kpis: [
          { title: "Collections Received", value: `₹${(totalRevenue).toLocaleString('en-IN')}`, change: "+12%", isPositive: true, icon: DollarSign, color: "#10B981", subtext: "Verified paid accounts" },
          { title: "Receivables Due", value: `₹${(outstanding).toLocaleString('en-IN')}`, change: "+5%", isPositive: true, icon: FileText, color: "#EF4444", subtext: "Customer outstanding dues" },
          { title: "Awaiting Verify", value: String(payments.filter(p => p.verified !== 'Approved').length), change: "-2%", isPositive: false, icon: Package, color: "#06B6D4", subtext: "Payments pending verification" },
          { title: "Collection Efficiency", value: payments.length > 0 ? `${Math.round((payments.filter(p => p.status === 'Paid').length / payments.length) * 100)}%` : "100%", change: "+1%", isPositive: true, icon: ShieldAlert, color: "#F59E0B", subtext: "Verification signoffs index" }
        ],
        donut: [
          { name: "Verified Paid Accounts", value: payments.filter(p => p.status === 'Paid').length || 1 },
          { name: "Outstanding Invoices", value: payments.filter(p => p.status !== 'Paid').length || 1 }
        ],
        donutTitle: "Revenue Collection Split",
        donutSub: "Collections categorized by client profiles",
        donutLabel: "Collections",
        revenue: revenueExpenseData.length > 0
          ? [...revenueExpenseData].slice(0, 6).reverse().map(item => {
            const [yr, mn] = item.month.split('-');
            const monthNames = {
              '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
              '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
            };
            return {
              name: monthNames[mn] || item.month,
              revenue: parseFloat(item.revenue || 0),
              target: parseFloat(item.expenses || 0)
            };
          })
          : [
            { name: 'Jan', revenue: 350000, target: 300000 },
            { name: 'Feb', revenue: 450000, target: 400000 },
            { name: 'Mar', revenue: 600000, target: 500000 },
            { name: 'Apr', revenue: 400000, target: 500000 },
            { name: 'May', revenue: 750000, target: 600000 },
            { name: 'Jun', revenue: totalRevenue || 900000, target: 800000 }
          ],
        revenueTitle: "Finance Cash Inflow",
        revenueSub: "Monthly gross verified collections deposited",
        insights: [
          `Verified cash: ₹${totalRevenue.toLocaleString('en-IN')} deposited.`,
          `Unverified items: ${payments.filter(p => p.verified !== 'Approved').length} payments awaiting verification checks.`,
          `Aging accounts: ₹${outstanding.toLocaleString('en-IN')} balance remaining in receivables ledger.`
        ],
        colors: DEPT_COLORS.Finance
      },
      HR: {
        kpis: [
          { title: "Active Personnel", value: String(employees.length), change: "+5%", isPositive: true, icon: Users, color: "#EF4444", subtext: "Checked in staff count" },
          { title: "Present Staff", value: String(employees.filter(e => e.status === 'Active').length), change: "0%", isPositive: true, icon: UserCheck, color: "#10B981", subtext: "Attendance parameters nominal" },
          { title: "On Leaves", value: String(employees.filter(e => e.status === 'On Leave' || e.status === 'Inactive').length), change: "+2%", isPositive: true, icon: Package, color: "#a855f7", subtext: "Inactive / Leave roster" },
          { title: "Payroll Ledger", value: `₹${(employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0) / 100000).toFixed(1)}L`, change: "+12%", isPositive: true, icon: DollarSign, color: "#06B6D4", subtext: "Monthly payroll value" }
        ],
        donut: [
          { name: "Sales Department", value: employees.filter(e => e.department === 'Sales').length || 1 },
          { name: "Production Dept", value: employees.filter(e => e.department === 'Production').length || 1 },
          { name: "Finance Department", value: employees.filter(e => e.department === 'Finance').length || 1 },
          { name: "HR Department", value: employees.filter(e => e.department === 'HR').length || 1 }
        ],
        donutTitle: "Staff Demographics Division",
        donutSub: "Full-time personnel split by teams",
        donutLabel: "Staff",
        revenue: [
          { name: 'Jan', revenue: 95, target: 95 },
          { name: 'Feb', revenue: 94, target: 95 },
          { name: 'Mar', revenue: 96, target: 95 },
          { name: 'Apr', revenue: 98, target: 96 },
          { name: 'May', revenue: 95, target: 96 },
          { name: 'Jun', revenue: 97, target: 97 }
        ],
        revenueTitle: "Employee Attendance Index",
        revenueSub: "Monthly shift check-in ratios index percentage",
        insights: [
          `Total roster size: ${employees.length} active employee profiles.`,
          `Roster allocation: ${employees.filter(e => e.status === 'Active').length} staff currently present.`,
          `Payroll outflow: Monthly payroll overhead currently stands at ₹${employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0).toLocaleString('en-IN')}.`
        ],
        colors: DEPT_COLORS.HR
      },
      QC: {
        kpis: [
          { title: "QC Checked", value: String((state.sales?.samples || []).length), change: "+12%", isPositive: true, icon: Activity, color: "#EC4899", subtext: "Quality tests run total" },
          { title: "Inspection Passed", value: String((state.sales?.samples || []).filter(s => s.status === 'Approved' || s.status === 'Passed').length), change: "+9%", isPositive: true, icon: UserCheck, color: "#10B981", subtext: "Nominal passed batches" },
          { title: "Inspection Failed", value: String((state.sales?.samples || []).filter(s => s.status === 'Rejected' || s.status === 'Failed').length), change: "-1%", isPositive: false, icon: ShieldAlert, color: "#EF4444", subtext: "Failed batches rework queue" },
          { title: "Under testing", value: String((state.sales?.samples || []).filter(s => s.status === 'Testing' || s.status === 'Pending').length), change: "0%", isPositive: true, icon: TrendingUp, color: "#06B6D4", subtext: "Samples in testing queue" }
        ],
        donut: [
          { name: "Passed Audit Checks", value: (state.sales?.samples || []).filter(s => s.status === 'Approved').length || 1 },
          { name: "Failed Audit Checks", value: (state.sales?.samples || []).filter(s => s.status === 'Rejected').length || 0 },
          { name: "Pending Testing Checks", value: (state.sales?.samples || []).filter(s => s.status === 'Testing' || s.status === 'Pending').length || 0 }
        ],
        donutTitle: "Defect Analysis Profile",
        donutSub: "Quality rejection logs classification",
        donutLabel: "Inspections",
        revenue: [
          { name: 'Jan', revenue: 98, target: 97 },
          { name: 'Feb', revenue: 97, target: 97 },
          { name: 'Mar', revenue: 99, target: 98 },
          { name: 'Apr', revenue: 98, target: 98 },
          { name: 'May', revenue: 98, target: 98 },
          { name: 'Jun', revenue: 98.4, target: 98 }
        ],
        revenueTitle: "QC Pass Rate Score",
        revenueSub: "Monthly quality check pass index percentage",
        insights: [
          `QC test volume: ${(state.sales?.samples || []).length} total samples analyzed.`,
          `Pass rate: ${(state.sales?.samples || []).filter(s => s.status === 'Approved').length} successfully cleared checklist tests.`,
          `Rework buffer: ${(state.sales?.samples || []).filter(s => s.status === 'Rejected').length} sample batches failed and queued for rework.`
        ],
        colors: DEPT_COLORS.QC
      }
    };

    const currentData = departmentData[selectedDept] || departmentData.All;

    const barChartData = [
      { dept: "Sales", value: filteredLeads.length ? Math.min(100, 60 + filteredLeads.length * 2) : 75 },
      { dept: "Production", value: filteredOrders.length ? Math.min(100, 50 + filteredOrders.filter(o => o.productionStatus === 'Completed').length * 10) : 80 },
      { dept: "Plant Head", value: 92 },
      { dept: "Store", value: state.rawInventory?.length ? Math.min(100, 70 + state.rawInventory.filter(i => i.stock < 50).length * 4) : 85 },
      { dept: "Dispatch", value: filteredOrders.length ? Math.min(100, 60 + filteredOrders.filter(o => o.overallStage === 'Closed').length * 10) : 78 },
      { dept: "Finance", value: filteredPayments.length ? Math.min(100, 55 + filteredPayments.filter(p => p.status === 'Paid').length * 10) : 84 },
      { dept: "HR", value: employees.length ? Math.min(100, 70 + employees.filter(e => e.active).length * 2) : 88 },
      { dept: "QC", value: 94 }
    ];

    const pipelineStages = [
      { name: "Lead Created", dept: "Sales", count: filteredLeads.length, color: "#7C3AED" },
      { name: "Quotation Generated", dept: "Sales", count: quotationsData.length || 0, color: "#8B5CF6" },
      { name: "Order Placed", dept: "Sales", count: filteredOrders.filter(o => ['Created', 'CREATED', 'Confirmed', 'CONFIRMED', 'Pending', 'PENDING'].includes(o.overallStage) || o.status === 'Pending').length || 0, color: "#A78BFA" },
      { name: "Planned", dept: "Plant Head", count: filteredOrders.filter(o => ['Planned', 'PLANNED'].includes(o.overallStage) || o.plantHeadStatus === 'Approved' && o.productionStatus === 'Pending').length || 0, color: "#6366F1" },
      { name: "Material Requested", dept: "Production", count: state.materialRequests?.filter(mr => mr.status === 'Pending').length || 0, color: "#4F46E5" },
      { name: "Material Issued", dept: "Store", count: state.materialRequests?.filter(mr => mr.status === 'Issued').length || 0, color: "#06B6D4" },
      { name: "In Production", dept: "Production", count: filteredOrders.filter(o => ['Running', 'RUNNING', 'In Production', 'IN_PRODUCTION'].includes(o.productionStatus) || ['In Production', 'IN_PRODUCTION'].includes(o.overallStage)).length || 0, color: "#3b82f6" },
      { name: "QC Pending", dept: "Production", count: filteredOrders.filter(o => ['QC Pending', 'QC_PENDING'].includes(o.overallStage) || ['QC Pending', 'QC_PENDING'].includes(o.productionStatus)).length || 0, color: "#a855f7" },
      { name: "QC Passed", dept: "QC", count: filteredOrders.filter(o => ['QC Passed', 'QC_PASSED', 'DISPATCH_READY'].includes(o.overallStage) || ['QC Passed', 'QC_PASSED'].includes(o.productionStatus)).length || 0, color: "#10B981" },
      { name: "Dispatch Planned", dept: "Dispatch", count: filteredOrders.filter(o => ['Dispatch Created', 'DISPATCH_CREATED', 'Dispatch Planned'].includes(o.overallStage) || o.dispatchStatus === 'Ready').length || 0, color: "#F59E0B" },
      { name: "In Transit", dept: "Dispatch", count: filteredOrders.filter(o => ['In Transit', 'IN_TRANSIT'].includes(o.overallStage) || o.dispatchStatus === 'In Transit').length || 0, color: "#EC4899" },
      { name: "Payment Pending", dept: "Finance", count: filteredPayments.filter(p => p.status === 'Outstanding' || p.status === 'Pending').length || 0, color: "#EF4444" },
      { name: "Order Closed", dept: "Finance", count: filteredOrders.filter(o => ['Closed', 'CLOSED'].includes(o.status) || ['Closed', 'CLOSED'].includes(o.overallStage)).length || 0, color: "#10B981" }
    ];

    const deptHealthData = [
      { name: "Sales", manager: "Alex Carter", status: "Nominal", transactions: filteredLeads.length + quotationsData.length || 24, health: 95 },
      { name: "Production", manager: "Rajesh Sharma", status: filteredOrders.some(o => o.productionStatus === 'QC Failed') ? "Warning" : "Nominal", transactions: filteredOrders.length || 18, health: filteredOrders.some(o => o.productionStatus === 'QC Failed') ? 84 : 92 },
      { name: "Plant Head", manager: "Dr. Vivek Joshi", status: "Nominal", transactions: state.purchaseOrders?.length || 12, health: 96 },
      { name: "Store", manager: "Sunita Patel", status: state.rawInventory?.some(i => i.stock < 50) ? "Warning" : "Nominal", transactions: state.materialRequests?.length || 15, health: state.rawInventory?.some(i => i.stock < 50) ? 82 : 95 },
      { name: "Dispatch", manager: "Amit Singh", status: "Nominal", transactions: filteredOrders.filter(o => o.dispatchStatus === 'Delivered').length || 10, health: 90 },
      { name: "Finance", manager: "Divya Rao", status: filteredPayments.some(p => p.status === 'Outstanding') ? "Warning" : "Nominal", transactions: filteredPayments.length || 20, health: 88 },
      { name: "HR", manager: "Neha Gupta", status: "Nominal", transactions: employees.length || 14, health: 97 },
      { name: "QC", manager: "Elena QA", status: "Nominal", transactions: filteredOrders.filter(o => o.productionStatus === 'QC Passed' || o.productionStatus === 'QC Failed').length || 8, health: 99 }
    ];

    // Filter audit logs dynamically based on selected department node
    const filteredActivityFeed = auditLogs.filter(log => {
      if (selectedDept === 'All') return true;
      const deptNameLower = selectedDept.toLowerCase();
      const logModuleLower = (log.module || '').toLowerCase();
      const logRemarksLower = (log.remarks || '').toLowerCase();
      const logActionLower = (log.action || '').toLowerCase();

      // Match department to log properties
      return logModuleLower.includes(deptNameLower) ||
        logRemarksLower.includes(deptNameLower) ||
        logActionLower.includes(deptNameLower) ||
        (selectedDept === 'Store' && (logModuleLower.includes('inventory') || logModuleLower.includes('stock'))) ||
        (selectedDept === 'Plant Head' && logModuleLower.includes('plant')) ||
        (selectedDept === 'QC' && logModuleLower.includes('quality'));
    }).slice(0, 5);

    // Calculate Live Real-Time Cockpit metrics
    const activeOrdersReal = orders.filter(o => o.status !== 'Closed').length;
    const inProductionReal = orders.filter(o => o.status === 'In Production' || o.productionStatus === 'Running').length;
    const pendingPaymentsSum = payments.filter(p => p.status !== 'Paid').reduce((sum, p) => sum + (p.totalAmount - (p.paidAmount || 0)), 0);
    const dispatchQueueReal = readyDispatch;

    const realTimeKPIs = [
      { title: "Active Orders", value: String(activeOrdersReal), change: activeOrdersReal > 0 ? "+100%" : "0%", isPositive: true, icon: Package, color: "#7C3AED", subtext: "Active in pipeline" },
      { title: "In Production", value: String(inProductionReal), change: "Floor Active", isPositive: true, icon: Activity, color: "#4F46E5", subtext: "Running jobs" },
      { title: "Pending Payments", value: `₹${pendingPaymentsSum.toLocaleString('en-IN')}`, change: "Receivables", isPositive: true, icon: DollarSign, color: "#EF4444", subtext: "Unpaid invoices" },
      { title: "Dispatch Queue", value: String(dispatchQueueReal), change: "Ready to ship", isPositive: true, icon: Truck, color: "#F59E0B", subtext: "Awaiting transport" }
    ];

    return (
      <motion.div
        key={`${selectedDept}-${dashboardMode}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="super-admin-grid-12"
        style={{ contentVisibility: 'auto' }}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes pulse-live {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
        `}} />

        {/* Header & Filter Row */}
        <div className="super-admin-col-12" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(15,23,42,0.08)',
          paddingBottom: '16px',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--color-text-primary)' }}>
              Super Admin Command Center
            </h2>
            <span style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
              Real-time enterprise resources planning dashboard
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* View Mode Toggle Switcher */}
            <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.04)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
              {['All', 'Department', 'Real-Time'].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setDashboardMode(mode);
                    if (mode === 'All') {
                      setSelectedDept('All');
                    } else if (mode === 'Department' && selectedDept === 'All') {
                      setSelectedDept('Sales');
                    }
                    showToast(`Switched view mode to ${mode}`);
                  }}
                  style={{
                    background: dashboardMode === mode ? 'var(--color-primary)' : 'transparent',
                    color: dashboardMode === mode ? '#000000' : 'var(--color-text-secondary)',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Department Selector (Only if not All mode, or show all options) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>
                Node:
              </span>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  if (e.target.value === 'All') {
                    setDashboardMode('All');
                  } else if (dashboardMode === 'All') {
                    setDashboardMode('Department');
                  }
                  showToast(`Switched dashboard view to ${e.target.value}`);
                }}
                style={{
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept} {dept === 'All' ? '(Enterprise Overview)' : `(${dept} Node)`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sub-Filters Row */}
        <div className="super-admin-col-12" style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '20px',
          background: 'rgba(15, 23, 42, 0.02)',
          padding: '12px 20px',
          borderRadius: '12px',
          border: '1px solid rgba(15, 23, 42, 0.05)'
        }}>

          {/* Timeframe Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Timeframe:</span>
            <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.04)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(15, 23, 42, 0.06)' }}>
              {['Today', 'Week', 'Month'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTimeFilter(t);
                    showToast(`Timeframe set to ${t}`);
                  }}
                  style={{
                    background: timeFilter === t ? 'var(--color-primary)' : 'transparent',
                    color: timeFilter === t ? '#ffffff' : 'var(--color-text-secondary)',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Pulsing indicator if Real-Time is selected */}
          {dashboardMode === 'Real-Time' && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981',
                animation: 'pulse-live 1.5s infinite'
              }} />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Live Stream Active
              </span>
            </div>
          )}
        </div>

        {/* SECTION 1 â€” KPI SUMMARY (TOP CARDS - dynamic) */}
        <div className="super-admin-col-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', width: '100%' }}>
          {(dashboardMode === 'Real-Time' ? realTimeKPIs : currentData.kpis).map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div key={idx} className="glass-card animated-card" style={{
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderLeft: `4px solid ${kpi.color}`,
                animationDelay: `${idx * 0.05}s`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {kpi.title}
                  </span>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: `${kpi.color}15`, color: kpi.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={16} />
                  </div>
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: 'var(--color-text-primary)' }}>
                  {kpi.value}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: kpi.isPositive ? '#10B981' : '#EF4444'
                  }}>
                    {kpi.change}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                    {kpi.subtext}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {dashboardMode === 'Real-Time' ? (
          renderRealTimeCockpit(filteredActivityFeed, readyDispatch)
        ) : (
          <>
            {/* SECTION 2 â€” DEPARTMENT CONTRIBUTION (dynamic Donut Chart) & SECTION 3 â€” PERFORMANCE GRAPH */}
            <div className="super-admin-col-6 animated-card delay-1">
              <div className="glass-card p-6" style={{ minHeight: '380px', height: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>{currentData.donutTitle}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{currentData.donutSub}</span>
                  </div>
                  <span style={{ fontSize: '10px', background: 'rgba(124, 58, 237, 0.12)', padding: '2px 8px', borderRadius: '12px', color: '#7C3AED', fontWeight: 'bold' }}>
                    {selectedDept === 'All' ? 'Enterprise Nodes' : 'Internal Split'}
                  </span>
                </div>
                <div className="super-admin-donut-layout" style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minHeight: 0, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px' }}>
                    {currentData.donut.map((item, i) => (
                      <div key={i} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: currentData.colors[i % currentData.colors.length] }}
                        />
                        <span style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>{item.name}</span>
                        <span style={{ color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>{item.value}%</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ width: '180px', height: '180px', position: 'relative', flexShrink: 0 }}>
                    {isMounted && (
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={currentData.donut}
                            innerRadius={55}
                            outerRadius={80}
                            dataKey="value"
                            paddingAngle={3}
                          >
                            {currentData.donut.map((_, i) => (
                              <Cell key={i} fill={currentData.colors[i % currentData.colors.length]} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: '#ffffff', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '8px' }}
                            itemStyle={{ color: 'var(--color-text-primary)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-55%, -55%)',
                      textAlign: 'center',
                      pointerEvents: 'none'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{selectedDept === 'All' ? '100%' : 'Split'}</div>
                      <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#8893A7', letterSpacing: '0.5px' }}>{currentData.donutLabel}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="super-admin-col-6 animated-card delay-2">
              <div className="glass-card p-6" style={{ minHeight: '380px', height: 'auto', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>{currentData.revenueTitle}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{currentData.revenueSub}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.03)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Today', 'Weekly', 'Monthly'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { setRevenueTimeframe(t); showToast(`Revenue timeframe set to ${t}`); }}
                        style={{
                          background: revenueTimeframe === t ? 'var(--color-primary)' : 'transparent',
                          color: revenueTimeframe === t ? '#ffffff' : 'var(--color-text-secondary)',
                          border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer'
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ height: '260px', width: '100%', minHeight: 0 }}>
                  {isMounted && (
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={currentData.revenue} margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.05)" />
                        <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
                        <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} tickFormatter={(val) => selectedDept === 'Production' || selectedDept === 'Plant Head' || selectedDept === 'Store' || selectedDept === 'Dispatch' || selectedDept === 'HR' || selectedDept === 'QC' ? String(val) : `₹${(val / 1000).toFixed(0)}K`} />
                        <Tooltip
                          contentStyle={{ background: '#ffffff', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '8px' }}
                          itemStyle={{ color: 'var(--color-text-primary)' }}
                          labelStyle={{ color: '#8893A7' }}
                          formatter={(val) => [selectedDept === 'Production' || selectedDept === 'Plant Head' || selectedDept === 'Store' || selectedDept === 'Dispatch' || selectedDept === 'HR' || selectedDept === 'QC' ? String(val) : `₹${val.toLocaleString('en-IN')}`, '']}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Line type="monotone" dataKey={selectedDept === 'Production' || selectedDept === 'Plant Head' || selectedDept === 'Store' || selectedDept === 'Dispatch' || selectedDept === 'HR' || selectedDept === 'QC' ? 'revenue' : 'revenue'} name={selectedDept === 'Production' || selectedDept === 'Plant Head' || selectedDept === 'Store' || selectedDept === 'Dispatch' || selectedDept === 'HR' || selectedDept === 'QC' ? 'Output Volume' : 'Achieved Revenue'} stroke="#337a86" strokeWidth={3} dot={{ r: 5, fill: '#337a86', strokeWidth: 2 }} activeDot={{ r: 7 }} />
                        <Line type="monotone" dataKey="target" name="Target Parameters" stroke="#5E6B82" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 4 â€” DEPARTMENT PERFORMANCE BAR CHART OR HIDDEN & SECTION 5 â€” ORDER PIPELINE FLOW */}
            {selectedDept === 'All' ? (
              <>
                <div className="super-admin-col-6 animated-card delay-3">
                  <div className="glass-card p-6" style={{ minHeight: '380px', height: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>Department Performance Index</h3>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Relative load & completed actions score</span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Index base 100</span>
                    </div>
                    <div style={{ height: '260px', width: '100%', minHeight: 0 }}>
                      {isMounted && (
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={barChartData} margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.05)" />
                            <XAxis dataKey="dept" tick={{ fill: '#8893A7', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#8893A7', fontSize: 11 }} />
                            <Tooltip
                              contentStyle={{ background: '#ffffff', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '8px' }}
                              itemStyle={{ color: 'var(--color-text-primary)' }}
                              labelStyle={{ color: 'var(--color-text-secondary)' }}
                            />
                            <Bar dataKey="value" name="Performance Score" fill="#4F46E5" radius={[4, 4, 0, 0]}>
                              {barChartData.map((_, i) => (
                                <Cell key={i} fill={COLORS_ALL[i % COLORS_ALL.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>

                <div className="super-admin-col-6 animated-card delay-4">
                  <div className="glass-card p-6" style={{ minHeight: '380px', height: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>Order Pipeline Flow (13 Stages)</h3>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Enterprise lifecycle order progression</span>
                      </div>
                      <span style={{ fontSize: '11.5px', color: 'var(--color-accent-teal)', fontWeight: '700' }}>Active Pipeline</span>
                    </div>
                    <div style={{
                      flex: 1,
                      overflowY: 'auto',
                      paddingRight: '4px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                      gap: '12px',
                      alignContent: 'start'
                    }}>
                      {pipelineStages.map((stage, idx) => (
                        <div key={idx} style={{
                          background: 'rgba(15, 23, 42, 0.02)',
                          border: '1px solid rgba(15, 23, 42, 0.06)',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          position: 'relative',
                          transition: 'all 0.2s'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: '800' }}>{String(idx + 1).padStart(2, '0')}</span>
                            <span style={{
                              fontSize: '9px',
                              fontWeight: '800',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: `${stage.color}15`,
                              color: stage.color
                            }}>{stage.dept}</span>
                          </div>
                          <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={stage.name}>
                            {stage.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: 'auto' }}>
                            <span style={{ fontSize: '16px', fontWeight: '800', color: stage.color }}>{stage.count}</span>
                            <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>orders</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Expand Pipeline tracker to span full 12 columns if single dept is selected */
              <div className="super-admin-col-12 animated-card delay-3">
                <div className="glass-card p-6" style={{ minHeight: '380px', height: 'auto', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>Order Pipeline Flow (13 Stages)</h3>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Lifecycle order status for {selectedDept} operations</span>
                    </div>
                    <span style={{ fontSize: '11.5px', color: 'var(--color-accent-teal)', fontWeight: '700' }}>Full Lifecycle Flow</span>
                  </div>
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingRight: '4px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '12px',
                    alignContent: 'start'
                  }}>
                    {pipelineStages.map((stage, idx) => {
                      const isDeptOwner = stage.dept.toLowerCase() === selectedDept.toLowerCase() ||
                        (selectedDept === 'Plant Head' && stage.dept === 'Plant Head');
                      return (
                        <div key={idx} style={{
                          background: isDeptOwner ? `${stage.color}08` : 'rgba(15, 23, 42, 0.02)',
                          border: isDeptOwner ? `1px solid ${stage.color}35` : '1px solid rgba(15, 23, 42, 0.06)',
                          boxShadow: isDeptOwner ? `0 0 12px ${stage.color}10` : 'none',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          position: 'relative',
                          transition: 'all 0.2s'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: '800' }}>{String(idx + 1).padStart(2, '0')}</span>
                            <span style={{
                              fontSize: '9px',
                              fontWeight: '800',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: `${stage.color}15`,
                              color: stage.color
                            }}>{stage.dept}</span>
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={stage.name}>
                            {stage.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: 'auto' }}>
                            <span style={{ fontSize: '18px', fontWeight: '800', color: stage.color }}>{stage.count}</span>
                            <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>orders</span>
                          </div>
                          {isDeptOwner && (
                            <div style={{
                              position: 'absolute',
                              top: '-4px',
                              right: '-4px',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: stage.color,
                              boxShadow: `0 0 8px ${stage.color}`
                            }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 6 â€” LIVE DOMAIN EVENT FEED & SECTION 7 â€” SMART INSIGHTS & DEPT COMPARISON */}
            <div className="super-admin-col-4 animated-card delay-5">
              <div className="glass-card p-6" style={{ minHeight: '390px', height: 'auto', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%', background: '#10b981',
                        boxShadow: '0 0 8px rgba(16,185,129,0.7)',
                        animation: 'eventPulse 1.8s ease-in-out infinite',
                      }} />
                      <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>Live Event Stream</h3>
                    </div>
                    <span style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)' }}>
                      {liveEventsFetching ? 'Syncingâ€¦' : `${liveEvents.length > 0 ? liveEvents.length : filteredActivityFeed.length} events Â· refreshes every 15s`}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '9px', fontWeight: '800',
                    background: 'rgba(16,185,129,0.1)', color: '#10b981',
                    border: '1px solid rgba(16,185,129,0.25)',
                    padding: '3px 8px', borderRadius: '12px', letterSpacing: '0.3px',
                  }}>LIVE</span>
                </div>

                {/* Event list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
                  {(() => {
                    // Use backend events if available, otherwise fall back to audit logs
                    const eventsToShow = liveEvents.length > 0
                      ? liveEvents.slice(0, 8).map((e, i) => ({
                        id: e.id || i,
                        action: e.event_type || e.type || 'System Event',
                        remarks: e.payload
                          ? (typeof e.payload === 'string' ? e.payload : JSON.stringify(e.payload)).substring(0, 80)
                          : 'Event processed',
                        user: e.entity_type || 'System',
                        module: e.entity_type || 'ERP Core',
                        time: e.created_at ? new Date(e.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '',
                        status: e.status || 'PROCESSED',
                        isBackend: true,
                        request_id: e.request_id || (e.payload && e.payload.request_id) || null,
                        created_at: e.created_at || null
                      }))
                      : filteredActivityFeed.map((log, i) => ({ ...log, id: log.id || i, isBackend: false }));

                    if (eventsToShow.length === 0) {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '10px', color: 'var(--color-text-muted)', padding: '20px' }}>
                          <Activity size={28} strokeWidth={1.5} />
                          <span style={{ fontSize: '11px', textAlign: 'center' }}>No domain events recorded yet.<br />Events will appear here once order workflow starts.</span>
                        </div>
                      );
                    }

                    return eventsToShow.map((ev, idx) => {
                      const statusMeta = {
                        'PROCESSED': { color: '#10b981', bg: 'rgba(16,185,129,0.08)', label: 'OK' },
                        'PENDING': { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'PENDING' },
                        'FAILED': { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', label: 'FAIL' },
                      }[ev.status] || { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', label: ev.status || 'EVT' };

                      const moduleColor = [
                        '#7C3AED', '#4F46E5', '#0891b2', '#d97706', '#ef4444', '#16a34a', '#ec4899', '#0284c7'
                      ][idx % 8];

                      return (
                        <div
                          key={ev.id}
                          style={{
                            display: 'flex', gap: '10px',
                            background: 'rgba(15,23,42,0.015)',
                            padding: '9px 11px',
                            borderRadius: '10px',
                            border: '1px solid rgba(15,23,42,0.05)',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.04)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.015)'; }}
                        >
                          <div style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            background: `${moduleColor}14`, border: `1px solid ${moduleColor}30`,
                            color: moduleColor,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            fontSize: '10px', fontWeight: '800',
                          }}>
                            {(ev.module || ev.entity_type || 'EV').substring(0, 2).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                {ev.action}
                              </span>
                              <span style={{
                                fontSize: '8.5px', fontWeight: '800',
                                background: statusMeta.bg, color: statusMeta.color,
                                padding: '2px 5px', borderRadius: '5px', flexShrink: 0,
                                letterSpacing: '0.2px',
                              }}>
                                {statusMeta.label}
                              </span>
                            </div>
                            <p style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', margin: '0 0 3px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ev.remarks}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>
                                {ev.isBackend ? 'ðŸ”— DB' : 'ðŸ“‹ Audit'} Â· {ev.user || 'System'} Â· {ev.module || 'Core'}
                              </span>
                              <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>{ev.time}</span>
                            </div>
                            {ev.request_id && (
                              <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'flex-start' }}>
                                <span
                                  onClick={(e) => { e.stopPropagation(); setSelectedTraceId(ev.request_id); }}
                                  style={{
                                    fontSize: '8.5px', fontWeight: '800',
                                    background: 'rgba(99, 102, 241, 0.08)', color: '#6366f1',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                    padding: '1px 5px', borderRadius: '3px', cursor: 'pointer',
                                    display: 'inline-flex', alignItems: 'center', gap: '3px'
                                  }}
                                >
                                  <Activity size={8} /> Trace: {ev.request_id.substring(0, 8)}...
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                <style>{`
                  @keyframes eventPulse {
                    0%, 100% { box-shadow: 0 0 8px rgba(16,185,129,0.7); opacity: 1; }
                    50% { box-shadow: 0 0 16px rgba(16,185,129,0.2); opacity: 0.6; }
                  }
                `}</style>
              </div>
            </div>

            <div className="super-admin-col-4 animated-card delay-6">
              <div className="glass-card p-6" style={{ minHeight: '390px', height: 'auto', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>Smart AI Insights</h3>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {selectedDept === 'All' ? 'Automated operational analysis' : `Focused node alerts for ${selectedDept}`}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
                  {currentData.insights.map((insight, idx) => {
                    const colors = ["#F59E0B", "#EF4444", "#22d3ee", "#10B981"];
                    const icons = ["âš ï¸", "ðŸ’°", "ðŸšš", "âš™ï¸"];
                    const color = selectedDept === 'All' ? (idx === 0 ? "#F59E0B" : idx === 1 ? "#EF4444" : idx === 2 ? "#22d3ee" : "#10B981") : currentData.colors[idx % currentData.colors.length];
                    const icon = selectedDept === 'All' ? icons[idx % icons.length] : "âš¡";
                    return (
                      <div key={idx} style={{
                        background: `${color}08`,
                        border: `1px solid ${color}25`,
                        borderRadius: '10px',
                        padding: '10px 12px',
                        display: 'flex',
                        gap: '10px'
                      }}>
                        <span style={{ fontSize: '14px', color: color, display: 'flex', alignItems: 'center' }}>
                          {icon}
                        </span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '11px', color: 'var(--color-text-primary)', margin: 0, fontWeight: '500', lineHeight: '1.4' }}>{insight}</p>
                          <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '2px', display: 'inline-block' }}>Real-time Insight</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="super-admin-col-4 animated-card delay-7">
              <div className="glass-card p-6" style={{ minHeight: '390px', height: 'auto', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>Department Node Status</h3>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>ERP pipeline status overview</span>
                  </div>
                  <span style={{ fontSize: '10px', background: 'rgba(34,211,238,0.1)', color: '#22d3ee', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                    6 Nodes
                  </span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                  {deptHealthData.map((dept, idx) => {
                    const isSelected = dept.name.toLowerCase() === selectedDept.toLowerCase();
                    return (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'rgba(15, 23, 42, 0.02)',
                        border: isSelected ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid rgba(15, 23, 42, 0.05)',
                        boxShadow: isSelected ? '0 0 10px rgba(124, 58, 237, 0.08)' : 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                        onClick={() => {
                          setSelectedDept(dept.name);
                          showToast(`Switched dashboard view to ${dept.name}`);
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{dept.name}</span>
                          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{dept.manager}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '10px', fontWeight: '800', color: dept.status === 'Nominal' ? '#10B981' : dept.status === 'Warning' ? '#F59E0B' : '#EF4444' }}>
                              {dept.status}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{dept.transactions} Tx</span>
                          </div>

                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: `2px solid ${dept.health > 90 ? '#10B981' : dept.health > 80 ? '#F59E0B' : '#EF4444'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '9px',
                            fontWeight: 'bold',
                            color: 'var(--color-text-primary)',
                            flexShrink: 0
                          }}>
                            {dept.health}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

      </motion.div>
    );
  };

  // 2. ADMIN MANAGEMENT
  const renderAdmins = () => {
    const adminUsers = usersList.filter(u => u.role === 'Admin');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="app-card">
          <div className="card-top-bar">
            <div>
              <h2 className="card-heading">Admin Operations Control</h2>
              <span style={{ fontSize: '11px', color: '#475569' }}>Configure security access roles for IT and General Administrators</span>
            </div>
            <button
              className="action-btn"
              style={{ background: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              onClick={() => {
                setAdminForm({ id: '', name: '', email: '', password: '', status: 'Active', department: 'IT', scopes: ['User Management'] });
                setAdminModalMode('create');
                setShowAdminModal(true);
              }}
            >
              <UserPlus size={16} /> Create Admin
            </button>
          </div>

          <DataTable
            columns={[
              { header: 'Admin ID', accessor: 'id', render: (row) => <span style={{ fontFamily: 'monospace' }}>{row.id}</span> },
              { header: 'Name', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
              { header: 'Email Address', accessor: 'email' },
              { header: 'Department', accessor: 'department' },
              { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
              {
                header: 'Authorised Scopes',
                accessor: 'permissions',
                render: (row) => (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {(Array.isArray(row.permissions) ? row.permissions : ['User Management']).map(s => (
                      <span key={typeof s === 'object' ? JSON.stringify(s) : String(s)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>
                        {typeof s === 'object' ? JSON.stringify(s) : String(s)}
                      </span>
                    ))}
                  </div>
                )
              }
            ]}
            data={adminUsers}
            searchQuery={globalSearch}
            searchField="name"
            actions={(row) => (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  title="Edit Admin"
                  className="action-btn"
                  style={{ background: 'rgba(6, 182, 212, 0.2)', border: 'none', padding: '6px', borderRadius: '4px', color: '#22d3ee', cursor: 'pointer' }}
                  onClick={() => {
                    setAdminForm({
                      id: row.id,
                      name: row.name,
                      email: row.email,
                      password: '',
                      status: row.status || 'Active',
                      department: row.department || 'IT',
                      scopes: Array.isArray(row.permissions) ? row.permissions : ['User Management']
                    });
                    setAdminModalMode('edit');
                    setShowAdminModal(true);
                  }}
                >
                  <Edit3 size={12} />
                </button>
                <button
                  title={row.status === 'Active' ? 'Deactivate Admin' : 'Activate Admin'}
                  className="action-btn"
                  style={{
                    background: row.status === 'Active' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(74, 222, 128, 0.2)',
                    border: 'none',
                    padding: '6px',
                    borderRadius: '4px',
                    color: row.status === 'Active' ? '#f59e0b' : '#4ade80',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleAdminStatus(row)}
                >
                  <UserX size={12} />
                </button>
                <button
                  title="Remove Admin"
                  className="action-btn"
                  style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', padding: '6px', borderRadius: '4px', color: '#f87171', cursor: 'pointer' }}
                  onClick={() => deleteAdmin(row.id, row.name)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
            emptyMessage="No administrators configured."
          />
        </div>

        {/* Create/Edit Admin Modal */}
        {showAdminModal && (
          <div className="modal-overlay active" onClick={() => setShowAdminModal(false)} style={{ zIndex: 10000 }}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '450px' }}>
              <div className="modal-header-row">
                <h3 className="modal-title-text">{adminModalMode === 'create' ? 'Create Administrator' : 'Edit Admin Account'}</h3>
                <button className="modal-close-btn" onClick={() => setShowAdminModal(false)}>âœ•</button>
              </div>
              <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#8893A7' }}>Admin Name</label>
                  <input
                    type="text" required value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    className="form-input" placeholder="e.g. Rahul Sharma"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#8893A7' }}>E-mail Contact</label>
                  <input
                    type="email" required value={adminForm.email} disabled={adminModalMode === 'edit'}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    className="form-input" placeholder="name@company.com"
                  />
                </div>

                {adminModalMode === 'create' && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#8893A7' }}>Security Password</label>
                    <input
                      type="password" required value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      className="form-input" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    />
                  </div>
                )}

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#8893A7' }}>Admin Division</label>
                  <input
                    type="text" value={adminForm.department}
                    onChange={(e) => setAdminForm({ ...adminForm, department: e.target.value })}
                    className="form-input" placeholder="e.g. IT, Operations"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#8893A7', display: 'block', marginBottom: '8px' }}>Security Scopes</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {['User Management', 'Department Management', 'Pricing Control'].map(scope => {
                      const checked = adminForm.scopes.includes(scope);
                      return (
                        <label key={scope} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                          <input
                            type="checkbox" checked={checked}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...adminForm.scopes, scope]
                                : adminForm.scopes.filter(s => s !== scope);
                              setAdminForm({ ...adminForm, scopes: updated });
                            }}
                          />
                          <span>{scope}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="form-submit-btn" style={{ background: 'var(--color-primary)', color: '#000', fontWeight: 'bold', cursor: 'pointer', padding: '10px', borderRadius: '6px', border: 'none', marginTop: '10px' }}>
                  {adminModalMode === 'create' ? 'Create Administrator' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  };

  // 3. USER MANAGEMENT
  const renderUsers = () => {
    const filteredUsers = usersList.filter(user => {
      if (userRoleFilter !== 'All' && user.role !== userRoleFilter) return false;
      return true;
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="app-card">
          <div className="card-top-bar" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="card-heading">Global ERP Login Accounts</h2>
              <span style={{ fontSize: '11px', color: '#475569' }}>Roster of credentials and permissions mapping for all nodes</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                style={{ background: 'var(--color-card)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '6px 12px' }}
              >
                <option value="All">All Roles</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Sales">Sales</option>
                <option value="Production">Production</option>
                <option value="HR">HR</option>
                <option value="Store">Store</option>
                <option value="QC">QC</option>
                <option value="Finance">Finance</option>
                <option value="Dispatch">Dispatch</option>
              </select>
              <button
                className="action-btn"
                style={{ background: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                onClick={() => {
                  setUserForm({ id: '', name: '', email: '', password: '', role: 'Sales', phone: '', department: 'Sales', permissions: [] });
                  setUserModalMode('create');
                  setShowUserModal(true);
                }}
              >
                <UserPlus size={16} /> Add User Account
              </button>
            </div>
          </div>

          <DataTable
            columns={[
              { header: 'Employee ID', accessor: 'id', render: (row) => <span style={{ fontFamily: 'monospace' }}>{row.id}</span> },
              { header: 'Employee Name', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
              { header: 'Login Email', accessor: 'email' },
              { header: 'Department', accessor: 'department', render: (row) => row.department || 'Executive' },
              { header: 'Role Level', accessor: 'role', render: (row) => <span style={{ color: row.role === 'Super Admin' ? '#84cc16' : '#0ea5e9', fontWeight: 'bold' }}>{row.role}</span> },
              { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
              { header: 'Created By', accessor: 'createdBy', render: () => 'System Seed' },
              { header: 'Last Login', accessor: 'lastLogin', render: () => '10 Mins Ago' },
              { header: 'Access Level', accessor: 'role', render: (row) => row.role === 'Super Admin' ? 'Root Override' : 'Role Restricted' }
            ]}
            data={filteredUsers}
            searchQuery={globalSearch}
            searchField="name"
            actions={(row) => (
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  title="Edit User"
                  className="action-btn"
                  style={{ background: 'rgba(6, 182, 212, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#22d3ee', cursor: 'pointer' }}
                  onClick={() => {
                    setUserForm({ ...row, password: '' });
                    setUserModalMode('edit');
                    setShowUserModal(true);
                  }}
                >
                  <Edit3 size={12} />
                </button>
                <button
                  title="Reset Password"
                  className="action-btn"
                  style={{ background: 'rgba(168, 85, 247, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#c084fc', cursor: 'pointer' }}
                  onClick={() => resetUserPassword(row)}
                >
                  <RefreshCw size={12} />
                </button>
                <button
                  title="Force Logout"
                  className="action-btn"
                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#f87171', cursor: 'pointer' }}
                  onClick={() => forceLogoutUser(row)}
                >
                  <UserX size={12} />
                </button>
                <button
                  title={row.status === 'Active' ? 'Disable User' : 'Enable User'}
                  className="action-btn"
                  style={{
                    background: row.status === 'Active' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(74, 222, 128, 0.15)',
                    border: 'none',
                    padding: '6px',
                    borderRadius: '4px',
                    color: row.status === 'Active' ? '#f59e0b' : '#4ade80',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleUserStatus(row)}
                >
                  <UserX size={12} />
                </button>
                <button
                  title="Delete User"
                  className="action-btn"
                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#f87171', cursor: 'pointer' }}
                  onClick={() => deleteUser(row.id, row.name)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
            emptyMessage="No matching credentials accounts found."
          />
        </div>

        {/* User Modal */}
        {showUserModal && (
          <div className="modal-overlay active" onClick={() => setShowUserModal(false)} style={{ zIndex: 10000 }}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '450px' }}>
              <div className="modal-header-row">
                <h3 className="modal-title-text">{userModalMode === 'create' ? 'Create User Account' : 'Edit User details'}</h3>
                <button className="modal-close-btn" onClick={() => setShowUserModal(false)}>âœ•</button>
              </div>
              <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#8893A7' }}>User Full Name</label>
                  <input
                    type="text" required value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="form-input" placeholder="e.g. Raman Patel"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#8893A7' }}>Login E-mail</label>
                  <input
                    type="email" required value={userForm.email} disabled={userModalMode === 'edit'}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="form-input" placeholder="name@company.com"
                  />
                </div>

                {userModalMode === 'create' && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#8893A7' }}>Security Password</label>
                    <input
                      type="password" required value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      className="form-input" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    />
                  </div>
                )}

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#8893A7' }}>System Role Level</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => {
                      const r = e.target.value;
                      let dept = 'Sales';
                      if (r === 'Super Admin' || r === 'Admin') dept = 'Executive';
                      if (r === 'Production') dept = 'Production';
                      if (r === 'Finance') dept = 'Finance';
                      if (r === 'HR') dept = 'HR';
                      if (r === 'Store') dept = 'Store';
                      if (r === 'QC') dept = 'QC';
                      if (r === 'Dispatch') dept = 'Dispatch';
                      setUserForm({ ...userForm, role: r, department: dept });
                    }}
                    className="form-select"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Sales">Sales</option>
                    <option value="Production">Production</option>
                    <option value="Store">Store</option>
                    <option value="QC">QC</option>
                    <option value="Dispatch">Dispatch</option>
                    <option value="Finance">Finance</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#8893A7' }}>Phone Contact</label>
                  <input
                    type="text" value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="form-input" placeholder="+91 99999 88888"
                  />
                </div>

                <button type="submit" className="form-submit-btn" style={{ background: 'var(--color-primary)', color: '#000', fontWeight: 'bold', cursor: 'pointer', padding: '10px', borderRadius: '6px', border: 'none', marginTop: '10px' }}>
                  {userModalMode === 'create' ? 'Create User Account' : 'Save Details'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  };

  // —— CUSTOM VIEWS FOR MISSING PATHS ——
  const renderCompanies = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="app-card">
          <div className="card-top-bar" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="card-heading">Enterprise Client Registry</h2>
              <span style={{ fontSize: '11px', color: '#475569' }}>Roster of companies, industries, domains and operational units</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                className="action-btn"
                style={{ background: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                onClick={async () => {
                  const { value: formValues } = await fireSwal({
                    title: 'Register New Company',
                    html:
                      '<input id="swal-input1" class="swal2-input" placeholder="Company Name">' +
                      '<input id="swal-input2" class="swal2-input" placeholder="Industry">' +
                      '<input id="swal-input3" class="swal2-input" placeholder="Domain (e.g. comp.com)">',
                    focusConfirm: false,
                    preConfirm: () => {
                      return [
                        document.getElementById('swal-input1').value,
                        document.getElementById('swal-input2').value,
                        document.getElementById('swal-input3').value
                      ]
                    }
                  });
                  if (formValues && formValues[0]) {
                    setCompanies([
                      ...companies,
                      {
                        id: `CO-${String(companies.length + 1).padStart(3, '0')}`,
                        name: formValues[0],
                        industry: formValues[1] || 'General Manufacturing',
                        domain: formValues[2] || 'company.com',
                        branchesCount: 0,
                        status: 'Active'
                      }
                    ]);
                    showToast('Company registered successfully.');
                  }
                }}
              >
                <Plus size={16} /> Register Company
              </button>
            </div>
          </div>

          <DataTable
            columns={[
              { header: 'ID', accessor: 'id', render: (row) => <span style={{ fontFamily: 'monospace' }}>{row.id}</span> },
              { header: 'Company Name', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
              { header: 'Industry Sector', accessor: 'industry' },
              { header: 'Web Domain', accessor: 'domain', render: (row) => <span style={{ color: '#0ea5e9' }}>{row.domain}</span> },
              { header: 'Branches', accessor: 'branchesCount', render: (row) => <span className="badge badge-info">{row.branchesCount} Branches</span> },
              { header: 'Status', accessor: 'status', render: (row) => <span style={{ color: row.status === 'Active' ? '#10b981' : '#f43f5e', fontWeight: 'bold' }}>{row.status}</span> }
            ]}
            data={companies}
            searchQuery={globalSearch}
            searchField="name"
            emptyMessage="No companies registered."
            actions={(row) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setCompanies(companies.map(c => c.id === row.id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c));
                    showToast('Status updated.');
                  }}
                  className="action-btn"
                  style={{ background: 'rgba(245, 158, 11, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#f59e0b', cursor: 'pointer' }}
                  title="Toggle Status"
                >
                  <RefreshCw size={12} />
                </button>
                <button
                  onClick={() => {
                    setCompanies(companies.filter(c => c.id !== row.id));
                    showToast('Company record removed.');
                  }}
                  className="action-btn"
                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#ef4444', cursor: 'pointer' }}
                  title="Delete Company"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          />
        </div>
      </div>
    );
  };

  const renderSalesTarget = () => {
    const totalTarget = targetRows.reduce((sum, t) => sum + t.targetAmount, 0);
    const totalAchieved = targetRows.reduce((sum, t) => sum + t.achieved, 0);
    const totalRemaining = Math.max(totalTarget - totalAchieved, 0);
    const overallPct = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;
    const employeesOnTarget = targetRows.filter(t => t.pct >= 80).length;
    const employeesBehind = targetRows.filter(t => t.pct < 80).length;

    const salesPersonnel = usersList
      .filter(u => String(u.role?.name || u.role).toLowerCase().includes('sales'))
      .map(u => ({ id: u.id, name: u.name }));
    
    // Fallback if no sales users found
    if (salesPersonnel.length === 0) {
      salesPersonnel.push(
        { id: 'rahul-patel', name: 'Rahul Patel' },
        { id: 'amit-shah', name: 'Amit Shah' },
        { id: 'neha-patel', name: 'Neha Patel' }
      );
    }

    const handleSaveTarget = async (e) => {
      e.preventDefault();

      const payload = {
        salespersonId: salesTargetForm.salespersonId,
        targetPeriod: salesTargetForm.period,
        startDate: salesTargetForm.startDate,
        endDate: salesTargetForm.endDate,
        revenueTarget: salesTargetForm.targetAmount,
        remarks: salesTargetForm.remarks || '',
      };

      try {
        if (salesTargetModalMode === 'create') {
          const res = await apiClient.post('/backend/sales-targets', payload);
          showToast(res.data.message || 'Revenue Target assigned successfully.');
          
          setSalesTargets([...salesTargets, res.data.data]);
        } else {
          const res = await apiClient.patch(`/backend/sales-targets/${salesTargetForm.id}`, payload);
          showToast(res.data.message || 'Revenue Target updated successfully.');
          
          setSalesTargets(salesTargets.map(t => t.id === salesTargetForm.id ? { ...t, ...res.data.data } : t));
        }
        queryClient.invalidateQueries({ queryKey: ['sales-target-dashboard'] });
        setShowSalesTargetModal(false);
      } catch (err) {
        fireSwal({
          title: 'Target Setup Failed',
          text: err.response?.data?.message || 'An error occurred while saving the target.',
          icon: 'error'
        });
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* KPI Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px'
        }}>
          {/* Total Target */}
          <div className="app-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Revenue Target</span>
            <strong style={{ fontSize: '20px', color: '#1e293b' }}>{formatIndianCurrency(totalTarget)}</strong>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Cumulative Sales Goal</span>
          </div>
          {/* Total Achieved */}
          <div className="app-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Revenue Achieved</span>
            <strong style={{ fontSize: '20px', color: '#10b981' }}>{formatIndianCurrency(totalAchieved)}</strong>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>{overallPct}% Achievement</span>
          </div>
          {/* Remaining Target */}
          <div className="app-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Remaining Target</span>
            <strong style={{ fontSize: '20px', color: '#ef4444' }}>{formatIndianCurrency(totalRemaining)}</strong>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Awaiting closure</span>
          </div>
          {/* Employees On Target */}
          <div className="app-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>On Target</span>
            <strong style={{ fontSize: '20px', color: '#3b82f6' }}>{employeesOnTarget} Employees</strong>
            <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>Progressing nicely</span>
          </div>
          {/* Employees Behind Target */}
          <div className="app-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Behind Target</span>
            <strong style={{ fontSize: '20px', color: '#ea580c' }}>{employeesBehind} Employees</strong>
            <span style={{ fontSize: '11px', color: '#ea580c', fontWeight: 'bold' }}>Requires attention</span>
          </div>
        </div>

        {/* Target Progress Card */}
        <div className="app-card">
          <div className="card-top-bar" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="card-heading">Sales Revenue Targets</h2>
              <span style={{ fontSize: '11px', color: '#475569' }}>Track revenue targets against actual confirmed sales order totals</span>
            </div>
            <div>
              <button
                className="action-btn"
                style={{ background: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                onClick={() => {
                  setSalesTargetForm({
                    id: '',
                    salespersonId: salesPersonnel[0].id,
                    salespersonName: salesPersonnel[0].name,
                    fy: 'FY 2026-27',
                    period: 'Monthly',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
                    targetAmount: 5000000,
                    remarks: ''
                  });
                  setSalesTargetModalMode('create');
                  setShowSalesTargetModal(true);
                }}
              >
                <Plus size={16} /> Assign Target
              </button>
            </div>
          </div>

          <DataTable
            columns={[
              { header: 'Salesperson', accessor: 'salespersonName', render: (row) => <strong>{row.salespersonName}</strong> },
              { header: 'Period', accessor: 'fy', render: (row) => <span>{row.fy} ({row.period})</span> },
              { header: 'Revenue Target', accessor: 'targetAmount', render: (row) => <strong>{formatIndianCurrency(row.targetAmount)}</strong> },
              { header: 'Confirmed Order Value', accessor: 'achieved', render: (row) => <strong style={{ color: '#10b981' }}>{formatIndianCurrency(row.achieved)}</strong> },
              { header: 'Remaining', accessor: 'remaining', render: (row) => <span style={{ color: row.remaining > 0 ? '#ef4444' : '#10b981' }}>{formatIndianCurrency(row.remaining)}</span> },
              { header: 'Achievement', accessor: 'pct', render: (row) => <strong>{row.pct}%</strong> },
              { 
                header: 'Status', 
                accessor: 'status', 
                render: (row) => (
                  <span style={{ 
                    color: row.status.color, 
                    background: row.status.bg,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {row.status.label}
                  </span>
                ) 
              }
            ]}
            data={targetRows}
            searchQuery={globalSearch}
            searchField="salespersonName"
            emptyMessage="No sales targets configured."
            actions={(row) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setSalesTargetForm(row);
                    setSalesTargetModalMode('edit');
                    setShowSalesTargetModal(true);
                  }}
                  className="action-btn"
                  style={{ background: 'rgba(59, 130, 246, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#3b82f6', cursor: 'pointer' }}
                  title="Edit Target"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={() => {
                    setSelectedSalesTarget(row);
                    setShowTargetOrdersModal(true);
                  }}
                  className="action-btn"
                  style={{ background: 'rgba(16, 185, 129, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#10b981', cursor: 'pointer' }}
                  title="View Contributing Orders"
                >
                  <Eye size={12} />
                </button>
                <button
                  onClick={() => {
                    setSelectedSalesTarget(row);
                    setShowTargetProgressModal(true);
                  }}
                  className="action-btn"
                  style={{ background: 'rgba(139, 92, 246, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#8b5cf6', cursor: 'pointer' }}
                  title="View Progress"
                >
                  <TrendingUp size={12} />
                </button>
                <button
                  onClick={async () => {
                    try {
                      await apiClient.delete(`/backend/sales-targets/${row.id}`);
                      setSalesTargets(salesTargets.filter(t => t.id !== row.id));
                      queryClient.invalidateQueries({ queryKey: ['sales-target-dashboard'] });
                      showToast('Target assignment deleted.');
                    } catch (err) {
                      showToast('Failed to delete target.', 'error');
                    }
                  }}
                  className="action-btn"
                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#ef4444', cursor: 'pointer' }}
                  title="Delete Target"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          />
        </div>

        {/* ── Assign / Edit Revenue Target Modal ── */}
        {showSalesTargetModal && (
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
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '24px 28px',
                borderBottom: '1px solid #f1f5f9',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                  {salesTargetModalMode === 'create' ? 'Assign Revenue Target' : 'Edit Revenue Target'}
                </h3>
                <button onClick={() => setShowSalesTargetModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleSaveTarget} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Salesperson</label>
                  <select
                    value={salesTargetForm.salespersonId}
                    onChange={(e) => {
                      const selected = salesPersonnel.find(p => p.id === e.target.value);
                      setSalesTargetForm({ 
                        ...salesTargetForm, 
                        salespersonId: selected.id,
                        salespersonName: selected.name
                      });
                    }}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  >
                    {salesPersonnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Target Period</label>
                    <select
                      value={salesTargetForm.period}
                      onChange={(e) => {
                        const period = e.target.value;
                        const now = new Date();
                        let startDate = '';
                        let endDate = '';
                        
                        if (period === 'Monthly') {
                          startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                        } else if (period === 'Quarterly') {
                          const q = Math.floor(now.getMonth() / 3);
                          startDate = new Date(now.getFullYear(), q * 3, 1).toISOString().split('T')[0];
                          endDate = new Date(now.getFullYear(), q * 3 + 3, 0).toISOString().split('T')[0];
                        } else if (period === 'Yearly') {
                          startDate = new Date(now.getFullYear(), 3, 1).toISOString().split('T')[0]; // Financial year starts April
                          endDate = new Date(now.getFullYear() + 1, 2, 31).toISOString().split('T')[0];
                        }
                        
                        setSalesTargetForm({ ...salesTargetForm, period, startDate, endDate });
                      }}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Financial Year</label>
                    <input
                      type="text"
                      value={salesTargetForm.fy}
                      onChange={(e) => setSalesTargetForm({ ...salesTargetForm, fy: e.target.value })}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', color: '#64748b' }}
                      readOnly
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Start Date</label>
                    <input
                      type="date"
                      value={salesTargetForm.startDate}
                      onChange={(e) => setSalesTargetForm({ ...salesTargetForm, startDate: e.target.value })}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>End Date</label>
                    <input
                      type="date"
                      value={salesTargetForm.endDate}
                      onChange={(e) => setSalesTargetForm({ ...salesTargetForm, endDate: e.target.value })}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                    Revenue Target (₹) {salesTargetForm.targetAmount ? `— ${formatIndianCurrency(salesTargetForm.targetAmount)}` : ''}
                  </label>
                  <input
                    type="number"
                    value={salesTargetForm.targetAmount || ''}
                    onChange={(e) => setSalesTargetForm({ ...salesTargetForm, targetAmount: Number(e.target.value) })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Remarks</label>
                  <textarea
                    value={salesTargetForm.remarks}
                    onChange={(e) => setSalesTargetForm({ ...salesTargetForm, remarks: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', minHeight: '60px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowSalesTargetModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>Save Target</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── View Associated Orders Modal ── */}
        {showTargetOrdersModal && selectedSalesTarget && (
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
              background: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '800px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden'
            }}>
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
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                    Confirmed Sales Orders — {selectedSalesTarget.salespersonName}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#38bdf8' }}>Period: {selectedSalesTarget.startDate} to {selectedSalesTarget.endDate}</span>
                </div>
                <button onClick={() => setShowTargetOrdersModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ padding: '28px', overflowY: 'auto', maxHeight: '50vh' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '12px' }}>Order ID</th>
                      <th style={{ padding: '12px' }}>Client / Customer</th>
                      <th style={{ padding: '12px' }}>Product</th>
                      <th style={{ padding: '12px' }}>Workflow Stage</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const qualifying = selectedSalesTarget.qualifyingOrders || [];

                      if (qualifying.length === 0) {
                        return (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No confirmed orders found in this period.</td>
                          </tr>
                        );
                      }

                      return qualifying.map((ord, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: '#2563eb' }}>{ord.id}</td>
                          <td style={{ padding: '12px', color: '#1e293b' }}>{ord.cust || ord.customer?.name || ord.customerName || 'Standard Customer'}</td>
                          <td style={{ padding: '12px', color: '#475569' }}>{ord.prod || ord.products || 'Catalog Item'}</td>
                          <td style={{ padding: '12px' }}>
                            <span className="badge badge-info" style={{ fontSize: '11px' }}>{ord.orderLifecycleStatus || ord.workflowStatus || ord.status || ord.stage}</span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>{formatIndianCurrency(ord.grandTotal || ord.totalAmount || ord.amount || 0)}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>

              <div style={{
                padding: '20px 28px',
                borderTop: '1px solid #f1f5f9',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button onClick={() => setShowTargetOrdersModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Close Window</button>
              </div>
            </div>
          </div>
        )}

        {/* ── View Progress Visualization Modal ── */}
        {showTargetProgressModal && selectedSalesTarget && (
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
              background: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '24px 28px',
                borderBottom: '1px solid #f1f5f9',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                  Target Progress: {selectedSalesTarget.salespersonName}
                </h3>
                <button onClick={() => setShowTargetProgressModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>✕</button>
              </div>

              {(() => {
                const achieved = selectedSalesTarget.achieved;
                const target = selectedSalesTarget.targetAmount;
                const pct = selectedSalesTarget.pct;
                const remaining = selectedSalesTarget.remaining;
                const status = selectedSalesTarget.status;
                const visualProgress = Math.min(pct, 100);

                return (
                  <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
                    <div style={{
                      width: '140px',
                      height: '140px',
                      borderRadius: '50%',
                      background: `conic-gradient(${status.color} ${visualProgress}%, #e2e8f0 ${visualProgress}% 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '116px',
                        height: '116px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <strong style={{ fontSize: '24px', color: '#0f172a' }}>{pct}%</strong>
                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Achieved</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <span style={{ 
                        color: status.color, 
                        background: status.bg,
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}>
                        Status: {status.label}
                      </span>
                    </div>

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
                        <span style={{ color: '#64748b' }}>Target Goal</span>
                        <span style={{ color: '#0f172a' }}>{formatIndianCurrency(target)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
                        <span style={{ color: '#10b981' }}>Revenue Achieved</span>
                        <span style={{ color: '#10b981' }}>{formatIndianCurrency(achieved)}</span>
                      </div>
                      {remaining > 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
                          <span style={{ color: '#ef4444' }}>Remaining Balance</span>
                          <span style={{ color: '#ef4444' }}>{formatIndianCurrency(remaining)}</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
                          <span style={{ color: '#10b981' }}>Surplus Closed</span>
                          <span style={{ color: '#10b981' }}>{formatIndianCurrency(Math.abs(target - achieved))} Surplus</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div style={{
                padding: '20px 28px',
                borderTop: '1px solid #f1f5f9',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button onClick={() => setShowTargetProgressModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Close Window</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEmployees = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="app-card">
          <div className="card-top-bar" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="card-heading">Corporate Staff Registry</h2>
              <span style={{ fontSize: '11px', color: '#475569' }}>Roster of personnel, department allocation, and designations</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                className="action-btn"
                style={{ background: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                onClick={() => {
                  setEmployeeForm({ id: '', name: '', email: '', phone: '', department: 'Sales', role: 'Sales Lead', salary: 30000, active: true, joiningDate: new Date().toISOString().split('T')[0] });
                  setSelectedEmployee(null);
                  setShowEmployeeModal(true);
                }}
              >
                <UserPlus size={16} /> Register New Staff
              </button>
            </div>
          </div>

          <DataTable
            columns={[
              { header: 'Employee Code', accessor: 'id', render: (row) => <span style={{ fontFamily: 'monospace' }}>{row.id}</span> },
              { header: 'Full Name', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
              { header: 'Login Email', accessor: 'email' },
              { header: 'Department', accessor: 'department' },
              { header: 'Designation / Role', accessor: 'role', render: (row) => row.role || row.designation || 'Staff' },
              { header: 'Monthly Salary', accessor: 'salary', render: (row) => `₹${(row.salary || 30000).toLocaleString('en-IN')}` },
              { header: 'Status', accessor: 'status', render: (row) => <span style={{ color: row.status === 'Active' ? '#10b981' : '#f43f5e', fontWeight: 'bold' }}>{row.status}</span> }
            ]}
            data={employees}
            searchQuery={globalSearch}
            searchField="name"
            emptyMessage="No staff profiles registered."
            actions={(row) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setSelectedEmployee(row);
                    setEmployeeForm({
                      id: row.id,
                      name: row.name,
                      email: row.email,
                      phone: row.phone || '',
                      department: row.department || 'Sales',
                      role: row.role || row.designation || 'Sales Lead',
                      salary: row.salary || 30000,
                      active: row.status === 'Active',
                      joiningDate: row.joiningDate || ''
                    });
                    setShowEmployeeModal(true);
                  }}
                  className="action-btn"
                  style={{ background: 'rgba(59, 130, 246, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#3b82f6', cursor: 'pointer' }}
                  title="Edit Profile"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={() => toggleEmployeeStatus(row)}
                  className="action-btn"
                  style={{ background: 'rgba(245, 158, 11, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#f59e0b', cursor: 'pointer' }}
                  title="Toggle Active Status"
                >
                  <RefreshCw size={12} />
                </button>
                <button
                  onClick={() => deleteEmployee(row.id, row.name)}
                  className="action-btn"
                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#ef4444', cursor: 'pointer' }}
                  title="Remove Profile"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          />
        </div>

        {/* Employee Modal */}
        {showEmployeeModal && (
          <div className="modal-overlay active" onClick={() => setShowEmployeeModal(false)} style={{ zIndex: 10000 }}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '450px' }}>
              <div className="modal-header-row">
                <h3 className="modal-title-text">{selectedEmployee ? 'Edit Staff details' : 'Register New Staff'}</h3>
                <button className="modal-close-btn" onClick={() => setShowEmployeeModal(false)}>✕</button>
              </div>
              <form onSubmit={handleEmployeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#8893A7' }}>Full Name</label>
                  <input
                    type="text" required value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    className="form-input" placeholder="e.g. David Brown"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#8893A7' }}>E-mail</label>
                  <input
                    type="email" required value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    className="form-input" placeholder="name@company.com"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#8893A7' }}>Phone Contact</label>
                  <input
                    type="text" value={employeeForm.phone}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    className="form-input" placeholder="+91 99999 88888"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#8893A7' }}>Department</label>
                  <select
                    value={employeeForm.department}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                    className="form-select"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Production">Production</option>
                    <option value="Store">Store</option>
                    <option value="QC">QC</option>
                    <option value="Dispatch">Dispatch</option>
                    <option value="Finance">Finance</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#8893A7' }}>Designation / Role</label>
                  <input
                    type="text" required value={employeeForm.role}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                    className="form-input" placeholder="e.g. QC Manager"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#8893A7' }}>Monthly Salary (₹)</label>
                  <input
                    type="number" required value={employeeForm.salary}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, salary: Number(e.target.value) })}
                    className="form-input" placeholder="30000"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: '#8893A7' }}>Joining Date</label>
                  <input
                    type="date" required value={employeeForm.joiningDate}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, joiningDate: e.target.value })}
                    className="form-input"
                  />
                </div>

                <button type="submit" className="form-submit-btn" style={{ background: 'var(--color-primary)', color: '#000', fontWeight: 'bold', cursor: 'pointer', padding: '10px', borderRadius: '6px', border: 'none', marginTop: '10px' }}>
                  {selectedEmployee ? 'Save Changes' : 'Register Staff'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCategories = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="app-card">
          <div className="card-top-bar" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="card-heading">Product Catalog Categories</h2>
              <span style={{ fontSize: '11px', color: '#475569' }}>Logical segmentation parameters for pricing and inventory tracking</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                className="action-btn"
                style={{ background: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                onClick={async () => {
                  const { value: categoryName } = await fireSwal({
                    title: 'Add New Category',
                    input: 'text',
                    inputPlaceholder: 'e.g. Chemicals',
                    showCancelButton: true
                  });
                  if (categoryName) {
                    setProductCategories([...productCategories, categoryName]);
                    showToast(`Category ${categoryName} added!`);
                  }
                }}
              >
                <Plus size={16} /> Create Category
              </button>
            </div>
          </div>

          <DataTable
            columns={[
              { header: 'Category Name', accessor: 'name', render: (row) => <strong>{row}</strong> },
              { header: 'Associated Products', accessor: 'productsCount', render: (row) => {
                const count = productsList.filter(p => p.category === row).length;
                return <span className="badge badge-info">{count} Products</span>;
              }}
            ]}
            data={productCategories}
            searchQuery={globalSearch}
            emptyMessage="No product categories found."
            actions={(row) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    if (productsList.some(p => p.category === row)) {
                      showToast('Cannot delete category containing active products.');
                      return;
                    }
                    setProductCategories(productCategories.filter(c => c !== row));
                    showToast(`Category ${row} removed.`);
                  }}
                  className="action-btn"
                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#ef4444', cursor: 'pointer' }}
                  title="Delete Category"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          />
        </div>
      </div>
    );
  };

  const renderPriceMaster = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="app-card">
          <div className="card-top-bar" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="card-heading">Global Product Price Matrix</h2>
              <span style={{ fontSize: '11px', color: '#475569' }}>Configure standard selling rates, production costs, taxation, and discounts</span>
            </div>
          </div>

          <DataTable
            columns={[
              { header: 'Product ID', accessor: 'id', render: (row) => <span style={{ fontFamily: 'monospace' }}>{row.id}</span> },
              { header: 'Product Name', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
              { header: 'Category', accessor: 'category' },
              { header: 'Production Cost (₹)', accessor: 'costPrice', render: (row) => `₹${(Number(row.costPrice) || 0).toLocaleString('en-IN')}` },
              { header: 'Standard Selling Price (₹)', accessor: 'price', render: (row) => `₹${(Number(row.price) || 0).toLocaleString('en-IN')}` },
              { header: 'GST Tax Rate', accessor: 'tax', render: (row) => `${row.tax || 18}%` },
              { header: 'Max Discount Limit', accessor: 'discount', render: (row) => `${row.discount || 0}%` }
            ]}
            data={productsList}
            searchQuery={globalSearch}
            searchField="name"
            emptyMessage="No products listed in price master."
            actions={(row) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={async () => {
                    const { value: formValues } = await fireSwal({
                      title: `Edit Pricing: ${row.name}`,
                      html:
                        `<label class="swal-label" style="text-align:left; display:block; margin:6px 0 2px 30px; font-size:12px; font-weight:700;">Cost Price (₹)</label>` +
                        `<input id="swal-cost" class="swal2-input" type="number" value="${row.costPrice || 0}">` +
                        `<label class="swal-label" style="text-align:left; display:block; margin:6px 0 2px 30px; font-size:12px; font-weight:700;">Selling Price (₹)</label>` +
                        `<input id="swal-sell" class="swal2-input" type="number" value="${row.price || 0}">` +
                        `<label class="swal-label" style="text-align:left; display:block; margin:6px 0 2px 30px; font-size:12px; font-weight:700;">GST Tax Rate (%)</label>` +
                        `<input id="swal-tax" class="swal2-input" type="number" value="${row.tax || 18}">`,
                      focusConfirm: false,
                      preConfirm: () => {
                        return [
                          document.getElementById('swal-cost').value,
                          document.getElementById('swal-sell').value,
                          document.getElementById('swal-tax').value
                        ]
                      }
                    });
                    if (formValues) {
                      setProductsList(productsList.map(p => p.id === row.id ? {
                        ...p,
                        costPrice: Number(formValues[0]),
                        price: Number(formValues[1]),
                        tax: Number(formValues[2])
                      } : p));
                      showToast(`Pricing updated for ${row.name}`);
                    }
                  }}
                  className="action-btn"
                  style={{ background: 'rgba(59, 130, 246, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#3b82f6', cursor: 'pointer' }}
                  title="Update Pricing Matrix"
                >
                  <Edit3 size={12} />
                </button>
              </div>
            )}
          />
        </div>
      </div>
    );
  };

  const renderInventory = () => {
    const items = [
      ...productsList.map(p => ({ id: p.id, name: p.name, type: 'Finished Goods', category: p.category, stock: p.stock || 150, unit: p.unit || 'Units', status: p.status || 'Active' })),
      ...(state.rawInventory || []).map(r => ({ id: r.id, name: r.material || r.name, type: 'Raw Material', category: r.category || 'Raw Materials', stock: r.stock || r.quantity || 400, unit: r.unit || 'Kg', status: 'Active' }))
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="app-card">
          <div className="card-top-bar" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="card-heading">Unified Inventory Ledger</h2>
              <span style={{ fontSize: '11px', color: '#475569' }}>Track finished products catalog and raw factory material stock metrics</span>
            </div>
          </div>

          <DataTable
            columns={[
              { header: 'Stock Code', accessor: 'id', render: (row) => <span style={{ fontFamily: 'monospace' }}>{row.id}</span> },
              { header: 'Material / Product', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
              { header: 'Inventory Type', accessor: 'type', render: (row) => (
                <span className={`badge ${row.type === 'Finished Goods' ? 'badge-info' : 'badge-warning'}`}>{row.type}</span>
              )},
              { header: 'Category Segment', accessor: 'category' },
              { header: 'Physical Stock Level', accessor: 'stock', render: (row) => (
                <strong style={{ color: row.stock < 50 ? '#ef4444' : 'var(--color-text-primary)' }}>{row.stock} {row.unit}</strong>
              )},
              { header: 'Roster Status', accessor: 'status', render: (row) => <span style={{ color: row.stock < 50 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>{row.stock < 50 ? 'LOW STOCK ALERT' : 'NOMINAL'}</span> }
            ]}
            data={items}
            searchQuery={globalSearch}
            searchField="name"
            emptyMessage="No items present in inventory database."
            actions={(row) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={async () => {
                    const { value: newStock } = await fireSwal({
                      title: `Adjust Stock Level: ${row.name}`,
                      input: 'number',
                      inputValue: row.stock,
                      inputPlaceholder: 'New quantity'
                    });
                    if (newStock !== undefined && newStock !== '') {
                      const qty = Number(newStock);
                      if (row.type === 'Finished Goods') {
                        setProductsList(productsList.map(p => p.id === row.id ? { ...p, stock: qty } : p));
                      } else {
                        dispatch({
                          type: 'UPDATE_RAW_INVENTORY',
                          payload: { id: row.id, quantity: qty, stock: qty }
                        });
                      }
                      showToast(`Stock updated to ${qty} ${row.unit}.`);
                    }
                  }}
                  className="action-btn"
                  style={{ background: 'rgba(59, 130, 246, 0.15)', border: 'none', padding: '6px', borderRadius: '4px', color: '#3b82f6', cursor: 'pointer' }}
                  title="Adjust Stock Level"
                >
                  <Edit3 size={12} />
                </button>
              </div>
            )}
          />
        </div>
      </div>
    );
  };

  // 4. ROLES & RBAC MATRIX
  const renderRoles = () => {
    const rolesList = ['Finance Lead', 'Sales Lead', 'Plant Head', 'Store Keeper', 'QC Inspector', 'Dispatch Officer', 'HR Manager'];
    const permissionsKeys = ['Dashboard', 'PO Approval', 'Reports', 'User Management'];

    const handleCheckboxToggle = (role, privilege) => {
      setRbacMatrix(prev => {
        const rolePrivs = { ...prev[role] };
        rolePrivs[privilege] = !rolePrivs[privilege];
        return {
          ...prev,
          [role]: rolePrivs
        };
      });
      showToast(`Toggled privilege [${privilege}] for role: ${role}`);
    };

    const handleSaveRBAC = () => {
      logActivity('RBAC Configuration Saved', 'Super Admin updated global role-based access privilege matrix', 'Roles & Permissions');
      showToast('RBAC Matrix configurations successfully applied to portal modules.');
    };

    return (
      <div className="app-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 className="card-heading">Global Security Scope & Privilege Matrix</h2>
            <span style={{ fontSize: '11px', color: '#475569' }}>Manage dynamic roles permissions rules on Himalaya ERP</span>
          </div>
          <button
            onClick={handleSaveRBAC}
            className="action-btn"
            style={{ background: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Apply Configurations
          </button>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
          <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px' }}>Operational Scope / Module Access</th>
                {rolesList.map(r => (
                  <th key={r} style={{ textAlign: 'center', padding: '12px 8px' }}>{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionsKeys.map(privilege => (
                <tr key={privilege} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold', fontSize: '13px' }}>{privilege}</td>
                  {rolesList.map(role => {
                    const isGranted = rbacMatrix[role]?.[privilege] || false;
                    return (
                      <td key={role} style={{ textAlign: 'center', padding: '16px 8px' }}>
                        <input
                          type="checkbox"
                          checked={isGranted}
                          onChange={() => handleCheckboxToggle(role, privilege)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderModules = () => {
    const erpModules = [
      { key: 'admin', label: 'Admin', desc: 'IT Administration and authentication configuration panel', path: '/admin/dashboard' },
      { key: 'dispatch', label: 'Dispatch', desc: 'Logistics cargo planning, POD collection, en route details', path: '/dispatch/dashboard' },
      { key: 'finance', label: 'Finance', desc: 'Ledger tracking, invoicing, vendor transactions auditing', path: '/finance/dashboard' },
      { key: 'finance-executive', label: 'Finance Executive', desc: 'Payment verification, receipt tracking, customer outstanding dues', path: '/finance-executive/dashboard' },
      { key: 'hr', label: 'HR', desc: 'Employees roster registry, shift logs, payroll and leave tracking', path: '/hr/dashboard' },
      { key: 'notifications', label: 'Notifications', desc: 'Real-time message routing, global alert channels configurations', path: '/notifications' },
      { key: 'plant-head', label: 'Plant Head', desc: 'Central material clearances approval and scheduling board', path: '/plant-head/dashboard' },
      { key: 'production', label: 'Production', desc: 'Work orders scheduler, machine logs, shop floor logs', path: '/production/dashboard' },
      { key: 'purchase', label: 'Purchase', desc: 'Material requests, low stock alerts, raw material purchase indents', path: '/store/purchase' },
      { key: 'qc', label: 'QC', desc: 'Defects tracking, parameters check, inspection check lists', path: '/qc/dashboard' },
      { key: 'sales', label: 'Sales', desc: 'Leads CRM, quotations generator, and sales orders pipeline', path: '/sales/dashboard' },
      { key: 'sales-admin', label: 'Sales Admin', desc: 'Team target analytics, team intelligence dashboards settings', path: '/sales-admin' },
      { key: 'store', label: 'Store', desc: 'Raw inventory levels tracker, releases logging, stock audits', path: '/store/dashboard' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0 0 4px 4px' }}>System Portal Module Control</h2>
          <span style={{ fontSize: '11px', color: '#475569', marginLeft: '4px' }}>
            Disable specific ERP portal sections globally. If disabled, non-Super Admin users will be blocked from accessing those nodes.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {erpModules.map(mod => {
            const synonyms = getModuleSynonyms(mod.key);
            const isEnabled = !disabledModules.some(k => synonyms.includes(k));
            return (
              <div
                key={mod.key}
                className="app-card"
                style={{
                  display: 'flex', flexDirection: 'column', justifyBetween: 'space-between',
                  border: isEnabled ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(239,68,68,0.2)',
                  background: isEnabled ? 'rgba(30, 41, 59, 0.2)' : 'rgba(239, 68, 68, 0.02)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '14.5px', fontWeight: '800', margin: 0 }}>{mod.label}</h3>
                    <span style={{
                      padding: '3px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold',
                      background: isEnabled ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: isEnabled ? '#4ade80' : '#f87171'
                    }}>
                      {isEnabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 16px 0', lineHeight: '1.4' }}>{mod.desc}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: 'auto' }}>
                  <span style={{ fontSize: '11.5px', color: '#aaa' }}>Status: <strong>{isEnabled ? 'Enabled' : 'Disabled'}</strong></span>

                  {/* Sliding Switch Toggle */}
                  <div
                    onClick={() => toggleModuleState(mod.key)}
                    style={{
                      width: '46px', height: '24px', borderRadius: '12px',
                      background: isEnabled ? 'var(--color-primary)' : '#475569',
                      padding: '2px', display: 'flex',
                      justifyContent: isEnabled ? 'flex-end' : 'flex-start',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: isEnabled ? '#000' : '#fff', transition: 'all 0.2s' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 6. PRODUCT CATALOG & PRICING
  const renderProducts = () => {
    return <ProductMasterUI role={currentUser?.role || 'Super Admin'} />;
  };


  const renderDirectOrders = () => {
    const directOrders = orders.filter(o => o.type === 'DIRECT_ORDER');
    const statusColors = {
      Planned: { bg: '#dcfce7', color: '#16a34a' },
      Draft: { bg: '#f1f5f9', color: '#5E6B82' },
      Delivered: { bg: '#dbeafe', color: '#1d4ed8' },
      Paid: { bg: '#dcfce7', color: '#16a34a' },
      Outstanding: { bg: '#fef3c7', color: '#d97706' },
      Cancelled: { bg: '#fee2e2', color: '#dc2626' },
    };

    const columns = [
      {
        header: 'Order ID',
        accessor: 'orderNo',
        render: (row) => (
          <span
            style={{
              fontWeight: '800',
              color: '#337a86',
              fontFamily: 'monospace',
              fontSize: '12px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => navigate.push(`/orders/${row.orderNo}`)}
          >
            {row.orderNo}
          </span>
        ),
        nowrap: true
      },
      {
        header: 'Customer',
        accessor: (row) => row.customer?.name || row.customerName || 'â€”',
        nowrap: true
      },
      {
        header: 'Order Type',
        accessor: 'type',
        render: () => (
          <span style={{ display: 'inline-block', background: 'rgba(168,85,247,0.1)', color: '#a855f7', fontWeight: '700', fontSize: '10.5px', padding: '3px 8px', borderRadius: '5px', letterSpacing: '0.3px' }}>
            DIRECT
          </span>
        ),
        nowrap: true
      },
      {
        header: 'Advance Cleared',
        accessor: (row) => row.payment?.paid || 0,
        render: (row) => {
          const advance = row.payment?.paid || 0;
          return (
            <span style={{ fontWeight: '600', color: advance > 0 ? '#16a34a' : '#8893A7' }}>
              ₹{advance.toLocaleString('en-IN')}
            </span>
          );
        },
        nowrap: true
      },
      {
        header: 'Amount Value',
        accessor: (row) => row.payment?.totalAmount || 0,
        render: (row) => {
          const total = row.payment?.totalAmount || 0;
          return (
            <span style={{ fontWeight: '700', color: '#24345C' }}>
              ₹{total.toLocaleString('en-IN')}
            </span>
          );
        },
        nowrap: true
      },
      {
        header: 'Status',
        accessor: 'status',
        render: (row) => {
          const sc = statusColors[row.status] || { bg: '#f1f5f9', color: '#475569' };
          return (
            <span style={{ display: 'inline-block', background: sc.bg, color: sc.color, fontWeight: '700', fontSize: '11px', padding: '3px 9px', borderRadius: '5px' }}>
              {row.status}
            </span>
          );
        },
        nowrap: true
      },
      {
        header: 'Delivery Date',
        accessor: (row) => row.deliveryDate || row.dueDate || 'â€”',
        nowrap: true
      },
      {
        header: 'Created By',
        accessor: (row) => row.createdBy || 'Super Admin',
        nowrap: true
      }
    ];

    const actions = (row) => (
      <button
        onClick={() => setSelectedOrderDetails(row)}
        style={{ background: '#F5FAFE', border: '1px solid var(--color-border)', padding: '5px 12px', borderRadius: '6px', color: 'var(--color-text-primary)', fontSize: '11.5px', cursor: 'pointer', fontWeight: '600' }}
      >
        Inspect
      </button>
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="app-card">
          <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="card-heading">Direct Orders</h2>
              <span style={{ fontSize: '11px', color: '#475569' }}>Super Admin Exclusive: Bypass quotation and sample workflows directly to production</span>
            </div>
            <button
              className="action-btn"
              style={{ background: 'var(--color-primary)', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              onClick={() => {
                setDirectOrderItems([]);
                setDirectOrderForm({ customerId: '', customerName: '', company: '', contact: '', phone: '', email: '', gst: '', address: '', deliveryDate: '2026-06-25', priority: 'High', advancePayment: 0, paymentTerms: '7 Days' });
                navigate.push('/super-admin/direct-orders/create');
              }}
            >
              <Plus size={16} /> Create Direct Order
            </button>
          </div>

          <DataTable
            columns={columns}
            data={directOrders}
            searchQuery={globalSearch}
            searchField="customer.name"
            actions={actions}
            emptyMessage="No direct orders logged yet."
          />

          {directOrders.length > 0 && (
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--color-border)', fontSize: '12px', color: '#5E6B82' }}>
              Showing <strong>{directOrders.length}</strong> direct order{directOrders.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    );
  };


  // Direct Order Create Form
  const renderDirectOrderCreate = () => {
    const allCustomersList = state.customers || [];
    const matchedCustomers = allCustomersList.filter(c => c.name.toLowerCase().includes(searchCustQuery.toLowerCase()));

    const allProductsCatalog = state.productCatalog || [];
    const matchedProducts = allProductsCatalog.filter(p => p.name.toLowerCase().includes(smartProductSearchQuery.toLowerCase()));

    const handleAddBlankProductRow = () => {
      const tempId = `TEMP-PRD-${Date.now()}`;
      setDirectOrderItems(prev => [
        ...prev,
        {
          productName: '',
          code: tempId,
          qty: 1,
          price: 0,
          discount: 0,
          tax: 18,
          total: 0,
          isSampleRequested: false,
          sampleQty: 1,
          sampleExpectedDate: ''
        }
      ]);
    };

    return (
      <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Create Direct Business Order</h2>
          <span style={{ fontSize: '11.5px', color: '#475569' }}>
            Initialize purchase orders immediately for client accounts, completely bypassing sales samples and scheduler pipelines.
          </span>
        </div>

        {/* 1. Customer & Order Information Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(0, 0, 0, 0.01)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <h4 style={{ fontSize: '13.5px', fontWeight: '800', textTransform: 'uppercase', margin: 0, color: 'var(--color-accent-teal)' }}>1. Customer & Order Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Customer Name *</label>
              <input
                type="text" required className="form-input" placeholder="e.g. Reliance Projects"
                value={directOrderForm.customerName} onChange={(e) => setDirectOrderForm({ ...directOrderForm, customerName: e.target.value, company: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">GST Number</label>
              <input
                type="text" className="form-input" placeholder="e.g. 27AAACR1234F1Z5"
                value={directOrderForm.gst} onChange={(e) => setDirectOrderForm({ ...directOrderForm, gst: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Contact Person</label>
              <input
                type="text" className="form-input" placeholder="e.g. John Doe"
                value={directOrderForm.contact} onChange={(e) => setDirectOrderForm({ ...directOrderForm, contact: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Phone</label>
              <input
                type="text" className="form-input" placeholder="e.g. +91 99999 99999"
                value={directOrderForm.phone} onChange={(e) => setDirectOrderForm({ ...directOrderForm, phone: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email (Optional)</label>
              <input
                type="email" className="form-input" placeholder="e.g. contact@reliance.com"
                value={directOrderForm.email} onChange={(e) => setDirectOrderForm({ ...directOrderForm, email: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Target Delivery Date *</label>
              <input
                type="date" required className="form-input"
                value={directOrderForm.deliveryDate} onChange={(e) => setDirectOrderForm({ ...directOrderForm, deliveryDate: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Order Priority *</label>
              <select
                className="form-select" value={directOrderForm.priority}
                onChange={(e) => setDirectOrderForm({ ...directOrderForm, priority: e.target.value })}
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Express">Express Priority</option>
                <option value="Urgent">Urgent Bypass</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Advance Payment Cleared (₹)</label>
              <input
                type="number" className="form-input" placeholder="₹0"
                value={directOrderForm.advancePayment || ''} onChange={(e) => setDirectOrderForm({ ...directOrderForm, advancePayment: Number(e.target.value) })}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Payment Terms *</label>
              <select
                className="form-select" value={directOrderForm.paymentTerms}
                onChange={(e) => setDirectOrderForm({ ...directOrderForm, paymentTerms: e.target.value })}
              >
                <option value="7 Days">7 Days</option>
                <option value="15 Days">15 Days</option>
                <option value="30 Days">30 Days</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Address</label>
              <input
                type="text" className="form-input" placeholder="e.g. 123 Business Park, Mumbai"
                value={directOrderForm.address} onChange={(e) => setDirectOrderForm({ ...directOrderForm, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* 3. ðŸ“¦ Product Selection (Smart UI) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(0, 0, 0, 0.01)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <h4 style={{ fontSize: '13.5px', fontWeight: '800', textTransform: 'uppercase', margin: 0, color: 'var(--color-accent-teal)' }}>3. ðŸ“¦ Product Selection (Smart UI)</h4>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="form-label" style={{ fontWeight: '700' }}>Smart Search & Add</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text" className="form-input search-input-padding" placeholder="Type keyword to add product..." style={{ margin: 0, paddingLeft: '32px' }}
                value={smartProductSearchQuery} onChange={(e) => { setSmartProductSearchQuery(e.target.value); setShowProductDropdown(true); }}
                onFocus={() => setShowProductDropdown(true)}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#5E6B82' }} />
            </div>
            {showProductDropdown && smartProductSearchQuery && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '8px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {matchedProducts.length === 0 ? (
                  <div style={{ padding: '10px', color: '#475569', fontSize: '12.5px' }}>No catalog items match</div>
                ) : (
                  matchedProducts.map(p => (
                    <div
                      key={p.id} onClick={() => addProductToDirectOrder(p)}
                      style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--color-border)', fontSize: '13px', display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-primary)' }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.03)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <span><strong>{p.name}</strong> ({p.id})</span>
                      <strong style={{ color: 'var(--color-accent-teal)' }}>₹{p.price.toLocaleString('en-IN')}</strong>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Product Items Table */}
          <div className="crm-table-container" style={{ marginTop: '10px', border: '1px solid var(--color-border)', overflowX: 'auto' }}>
            <table className="crm-table" style={{ width: '100%', minWidth: '750px', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(0, 0, 0, 0.02)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Product Details *</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: '90px' }}>Qty *</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', width: '150px' }}>Rate (INR) *</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: '90px' }}>Discount %</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: '90px' }}>Tax %</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', width: '150px' }}>Total</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {directOrderItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#475569', fontStyle: 'italic' }}>
                      No products added yet. Use the Smart Search above to add products.
                    </td>
                  </tr>
                ) : (
                  directOrderItems.map(item => (
                    <tr key={item.code}>
                      <td data-label="Product Details" style={{ padding: '10px 12px' }}>
                        <input
                          type="text" required className="form-input" style={{ width: '100%', padding: '4px', margin: 0 }}
                          value={item.productName} onChange={(e) => updateDirectOrderItem(item.code, 'productName', e.target.value)}
                          placeholder="Product Name / Details"
                        />
                        {!item.code.startsWith('TEMP-') && (
                          <span style={{ display: 'block', fontSize: '11px', color: '#475569', marginTop: '2px' }}>Code: {item.code}</span>
                        )}
                      </td>
                      <td data-label="Qty" style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <input
                          type="number" min="1" className="form-input" style={{ width: '70px', padding: '4px', margin: 0, textAlign: 'center', fontWeight: 'bold' }}
                          value={item.qty} onChange={(e) => updateDirectOrderItem(item.code, 'qty', parseInt(e.target.value) || 1)}
                        />
                      </td>
                      <td data-label="Rate (INR)" style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <input
                          type="number" min="0" className="form-input" style={{ width: '130px', padding: '4px', margin: 0, textAlign: 'right' }}
                          value={item.price} onChange={(e) => updateDirectOrderItem(item.code, 'price', Number(e.target.value) || 0)}
                        />
                      </td>
                      <td data-label="Discount %" style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <input
                          type="number" min="0" max="100" className="form-input" style={{ width: '70px', padding: '4px', margin: 0, textAlign: 'center' }}
                          value={item.discount} onChange={(e) => updateDirectOrderItem(item.code, 'discount', Number(e.target.value) || 0)}
                        />
                      </td>
                      <td data-label="Tax %" style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <input
                          type="number" min="0" max="100" className="form-input" style={{ width: '70px', padding: '4px', margin: 0, textAlign: 'center' }}
                          value={item.tax} onChange={(e) => updateDirectOrderItem(item.code, 'tax', Number(e.target.value) || 0)}
                        />
                      </td>
                      <td data-label="Total" style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold' }}>
                        ₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td data-label="Remove" style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <button onClick={() => removeDirectOrderItem(item.code)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Remove item">
                          âœ•
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              className="action-btn"
              style={{ background: 'transparent', color: 'var(--color-accent-teal)', border: '1px solid var(--color-accent-teal)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={handleAddBlankProductRow}
            >
              <Plus size={12} /> Add Product Row
            </button>
            <span style={{ fontSize: '15px', fontWeight: '800' }}>
              Grand Total: <span style={{ color: 'var(--color-accent-teal)', fontSize: '18px', marginLeft: '6px' }}>₹{grandDirectOrderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </span>
          </div>
        </div>

        {/* 2. ðŸ§ª Sample Management Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(0, 0, 0, 0.01)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: '800', textTransform: 'uppercase', margin: 0, color: 'var(--color-accent-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              2. ðŸ§ª SAMPLE MANAGEMENT
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>
                {sampleRequested ? 'Enabled' : 'Disabled'}
              </span>
              <div
                onClick={() => setSampleRequested(!sampleRequested)}
                style={{
                  width: '46px', height: '24px', borderRadius: '12px',
                  background: sampleRequested ? 'var(--color-primary)' : '#475569',
                  padding: '2px', display: 'flex',
                  justifyContent: sampleRequested ? 'flex-end' : 'flex-start',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: sampleRequested ? '#000' : '#fff', transition: 'all 0.2s' }} />
              </div>
            </div>
          </div>

          {!sampleRequested ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>
                <span style={{
                  display: 'inline-block', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444',
                  padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'
                }}>
                  Disabled
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                No sample requested. Toggle the switch above to configure.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                <span style={{ opacity: 0.85 }}>â“˜ Toggle the switch next to each product to request a sample for it.</span>
              </div>

              {directOrderItems.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', border: '1px dashed var(--color-border)', borderRadius: '8px' }}>
                  No products added yet. Add a product under "Product Selection" to configure samples.
                </div>
              ) : (
                directOrderItems.map(item => {
                  const hasSample = item.isSampleRequested || false;
                  return (
                    <div
                      key={item.code}
                      style={{
                        background: hasSample ? 'rgba(16, 185, 129, 0.03)' : 'rgba(0, 0, 0, 0.01)',
                        padding: '16px',
                        borderRadius: '12px',
                        border: hasSample ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {/* Product Row Header inside Card */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: hasSample ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}>
                            <Package size={12} style={{ color: hasSample ? '#10b981' : '#5E6B82' }} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                            {item.productName || 'Unnamed Product'}
                          </span>
                        </div>

                        {/* Individual Product Sample Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Sample</span>
                          <div
                            onClick={() => updateDirectOrderItem(item.code, 'isSampleRequested', !hasSample)}
                            style={{
                              width: '40px', height: '20px', borderRadius: '10px',
                              background: hasSample ? '#10b981' : '#5E6B82',
                              padding: '2px', display: 'flex',
                              justifyContent: hasSample ? 'flex-end' : 'flex-start',
                              cursor: 'pointer', transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'all 0.2s' }} />
                          </div>
                        </div>
                      </div>

                      {/* Expected Date & Sample Quantity inputs if toggled */}
                      {hasSample && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', borderTop: '1px dashed rgba(16, 185, 129, 0.15)', paddingTop: '12px' }}>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Sample Qty *</label>
                            <input
                              type="number" min="1" className="form-input" style={{ padding: '6px 10px', fontSize: '12.5px' }}
                              value={item.sampleQty || 1}
                              onChange={(e) => updateDirectOrderItem(item.code, 'sampleQty', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Expected Date *</label>
                            <input
                              type="date" className="form-input" style={{ padding: '6px 10px', fontSize: '12.5px' }}
                              value={item.sampleExpectedDate || ''}
                              onChange={(e) => updateDirectOrderItem(item.code, 'sampleExpectedDate', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Bottom Summary Banner */}
              {directOrderItems.length > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '8px', color: '#065f46', fontSize: '12.5px', fontWeight: '700', marginTop: '4px', width: 'fit-content' }}>
                  <FlaskConical size={14} style={{ color: '#10b981' }} />
                  <span>
                    {directOrderItems.filter(i => i.isSampleRequested).length} {directOrderItems.filter(i => i.isSampleRequested).length === 1 ? 'product' : 'products'} selected for sampling
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
          <button
            onClick={() => handleCreateDirectOrder('Planned')}
            style={{ flex: '1 1 200px', background: 'var(--color-primary)', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Create Direct Order
          </button>
          <button
            onClick={() => handleCreateDirectOrder('Draft')}
            style={{ flex: '1 1 200px', background: 'rgba(0, 0, 0, 0.05)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Save Draft Order
          </button>
          <button
            onClick={() => navigate.push('/super-admin/direct-orders')}
            style={{ flex: '1 1 100px', background: 'transparent', color: '#475569', border: '1px solid var(--color-border)', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>

      </div>
    );
  };

  const renderSamples = () => {
    const samples = state.sales?.samples || [];
    return (
      <SamplesView
        samples={samples}
        flat={true}
        onUpdateSampleStatus={async (sampleId, status) => {
          try {
            await apiClient.put(`/admin-ops/samples/${sampleId}`, { status });
            showToast(`Updated sample status to ${status}`);
            await syncData();
          } catch (err) {
            showToast(`Failed to update sample status: ${err.message}`);
          }
        }}
        onUpdateSample={async (sampleId, data) => {
          try {
            await apiClient.put(`/admin-ops/samples/${sampleId}`, data);
            showToast('Updated sample details');
            await syncData();
          } catch (err) {
            showToast(`Failed to update sample details: ${err.message}`);
          }
        }}
        onMoveToQuotation={(sample) => {
          showToast(`Sample verified. Preparing Quotation Proposal for ${sample.leadName || sample.customer}...`);

          // Build centralized draft payload
          const customer = sample.leadName || sample.customer || sample.company || '';
          let items = [];
          if (sample.products && Array.isArray(sample.products)) {
            items = sample.products.map((p, idx) => ({
              productId: p.id || p.productId || `PRD-${idx + 1}`,
              name: p.name || p.productName || '',
              description: p.description || p.productDetails || p.specs || '',
              qty: p.sampleQty || p.qty || p.quantity || 1,
              unit: p.unit || 'Units',
              rate: p.estimatedPrice || p.rate || p.price || p.unitPrice || 0,
              amount: (p.sampleQty || p.qty || p.quantity || 1) * (p.estimatedPrice || p.rate || p.price || p.unitPrice || 0)
            }));
          } else {
            items = [{
              productId: sample.productId || `PRD-1`,
              name: sample.product || sample.productName || '',
              description: sample.description || sample.productDetails || sample.specs || '',
              qty: sample.quantity || sample.qty || 1,
              unit: sample.unit || 'Units',
              rate: sample.value || sample.rate || sample.price || sample.unitPrice || 0,
              amount: (sample.quantity || sample.qty || 1) * (sample.value || sample.rate || sample.price || sample.unitPrice || 0)
            }];
          }

          const draft = {
            customer,
            company: sample.company || sample.leadName || '',
            contactPerson: sample.contactPerson || '',
            items,
            source: 'SAMPLE',
            sourceId: sample.id,
            gstNumber: sample.gstNumber || ''
          };

          useERPStore.getState().setQuotationDraft(draft);

          setQuoteTransitionData({
            showCreateForm: true,
            prefilledCustomer: sample.leadName || sample.customer || '',
            prefilledProduct: sample.product || 'Sample Product',
            prefilledQuantity: sample.quantity || 1,
            prefilledPrice: sample.value || 100,
            isFromSample: true
          });
          navigate.push('/super-admin/quotations');
        }}
        onCreateQuotationClick={() => {
          useERPStore.getState().clearQuotationDraft();
          setQuoteTransitionData({
            showCreateForm: true,
            prefilledCustomer: '',
            prefilledProduct: '',
            prefilledQuantity: 1,
            prefilledPrice: 100,
            isFromSample: false
          });
          navigate.push('/super-admin/quotations');
        }}
      />
    );
  };

  // 8. DIRECT QUOTATIONS SYSTEM
  const renderQuotations = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <QuotationsView
          quotations={quotationsData}
          flat={true}
          leads={state.sales?.leads || []}
          customers={state.customers || []}
          onCreateQuoteClick={async (newQuotation) => {
            const body = {
              customer_id: 0,
              customer_name: newQuotation.customerName || '',
              gst_number: newQuotation.gstNumber || '',
              amount: newQuotation.totalAmount || 0,
              discount: newQuotation.discount || 0,
              tax: newQuotation.tax || 18,
              transport_charge: newQuotation.transportCharge || 0,
              quotation_date: newQuotation.date || new Date().toISOString().split('T')[0],
              valid_until: newQuotation.validTill || null,
              payment_terms: newQuotation.paymentTerms || '15 Days',
              notes: newQuotation.notes || '',
              items_json: JSON.stringify(newQuotation.detailedItems || []),
            };

            try {
              await apiClient.post('/admin-ops/quotations', body);
              showToast(`✅ Quotation Proposal for ${newQuotation.customerName} published successfully.`);
              await syncData();
            } catch (err) {
              console.error('Failed to create quotation on backend:', err);
              showToast(`Failed to create quotation: ${err.message || 'Server error'}`);
            }
          }}
          onUpdateQuotationStatus={async (qId, status) => {
            try {
              await apiClient.put(`/admin-ops/quotations/${qId}`, { status });
              showToast(`Quotation status set to ${status}`);
              await syncData();
            } catch (err) {
              showToast(`Failed to update status: ${err.message}`);
            }
          }}
          onUpdateQuotation={async (qId, updatedData) => {
            try {
              await apiClient.put(`/admin-ops/quotations/${qId}`, updatedData);
              showToast('Quotation details updated successfully.');
              await syncData();
            } catch (err) {
              showToast(`Failed to update details: ${err.message}`);
            }
          }}
          onConvertToOrder={convertQuoteToDirectOrder}
          onSendPDF={(qId) => showToast(`PDF invoice sent for Quotation #${qId}`)}
          searchQuery={globalSearch}
          showCreateFormProp={quoteTransitionData?.showCreateForm}
          prefilledCustomer={quoteTransitionData?.prefilledCustomer}
          prefilledProduct={quoteTransitionData?.prefilledProduct}
          prefilledQuantity={quoteTransitionData?.prefilledQuantity}
          prefilledPrice={quoteTransitionData?.prefilledPrice}
          isFromSample={quoteTransitionData?.isFromSample}
          onResetTransition={() => setQuoteTransitionData(null)}
        />
      </div>
    );
  };

  // 9. ALL ORDERS MASTER LIST
  const renderAllOrders = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <OrdersView
          orders={orders}
          flat={true}
          leads={state.sales?.leads || []}
          customers={state.customers || []}
          onUpdateOrderStatus={async (id, status) => {
            try {
              await apiClient.put(`/admin-ops/direct-orders/${id}`, { status });
              showToast(`Order status updated to ${status}`);
              await syncData();
            } catch (err) {
              showToast(`Failed to update status: ${err.message}`);
            }
          }}
          onUpdateOrder={async (id, updatedData) => {
            try {
              await apiClient.put(`/admin-ops/direct-orders/${id}`, updatedData);
              showToast(`Order details updated successfully.`);
              await syncData();
            } catch (err) {
              showToast(`Failed to update order: ${err.message}`);
            }
          }}
          searchQuery={globalSearch}
        />
      </div>
    );
  };

  // â”€â”€ 10. DEPARTMENT CONTROL SUB-VIEWS â”€â”€
  const handleDeptBack = () => {
    if (deptEmployee) {
      setDeptEmployee(null);
    } else {
      navigate.push('/super-admin/departments');
    }
  };

  const renderDepartmentControl = () => {
    const commonProps = {
      state,
      deptEmployee,
      setDeptEmployee,
      onBack: handleDeptBack,
      navigate,
      showToast
    };

    if (subView === 'sales') return <SalesDept {...commonProps} />;
    if (subView === 'production') return <ProductionDept {...commonProps} />;
    if (subView === 'plant') return <PlantDept {...commonProps} />;
    if (subView === 'store') return <StoreDept {...commonProps} />;
    if (subView === 'qc') return <QCDept {...commonProps} />;
    if (subView === 'dispatch') return <DispatchDept {...commonProps} />;
    if (subView === 'finance') return <FinanceDept {...commonProps} />;
    if (subView === 'hr') return <HRDept {...commonProps} />;

    const depts = [
      { key: 'sales', name: 'Sales Department', desc: 'CRM leads, conversions, quotation parameters, and sales orders', items: ['Employees: 4', 'Active Users: 4', 'Leads: 8', 'Pending Tasks: 8'], border: '#0ea5e9' },
      { key: 'production', name: 'Production Department', desc: 'Machine scheduling, assembly queues, delayed WO tracking', items: ['Running Jobs: 2', 'Completed: 1', 'Delayed: 1'], border: '#a855f7' },
      { key: 'store', name: 'Store Department', desc: 'Raw material stock, low stock alert benchmarks, indents', items: ['Raw Material: ₹13,44,000', 'Low Stock: 2 Items', 'Pending Requests: 4'], border: '#eab308' },
      { key: 'plant', name: 'Plant Department', desc: 'Work orders schedule board and material releases', items: ['Running plans: 2', 'Uptime: 95%', 'Material clearances: 4'], border: '#84cc16' },
      { key: 'qc', name: 'QC Quality Control', desc: 'Inspection audits registers, checklist parameters, defects rate', items: ['Total Inspections: 7', 'Passed: 4', 'Failed: 3'], border: '#10b981' },
      { key: 'dispatch', name: 'Dispatch Department', desc: 'Logistics cargo flow, boxed packing, deliveries logs', items: ['Pending Dispatch: 3', 'Delivered: 1', 'In Transit: 0'], border: '#3b82f6' },
      { key: 'finance', name: 'Finance Department', desc: 'Verified payments receipts, outstanding dues, receivables', items: ['Revenue: ₹76.5L', 'Receivable: ₹36.5L', 'Paid: ₹40L', 'Pending: 3 Invoices'], border: '#ef4444' },
      { key: 'hr', name: 'HR Department', desc: 'Staff rosters registry, leaves punch, payroll sheets', items: ['Total Employees: 19', 'Active Attendance: 17', 'Attendance: 96%', 'Leaves: 5'], border: '#ec4899' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0 0 4px 4px' }}>ERP Departments Monitoring Command Center</h2>
          <span style={{ fontSize: '11px', color: '#475569', marginLeft: '4px' }}>
            Consolidated live overview cards for all business nodes. Click any department to open its full workspace analytics.
          </span>
        </div>

        {/* Administrative Personnel Bar */}
        <div style={{
          display: 'flex',
          gap: '20px',
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(79, 70, 229, 0.08) 100%)',
          border: '1px solid rgba(124, 58, 237, 0.15)',
          padding: '16px',
          borderRadius: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 250px' }}>
            <div style={{ background: 'rgba(124, 58, 237, 0.12)', color: 'var(--color-accent-teal)', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Sales Admin (Active Manager)</span>
              <strong style={{ fontSize: '13.5px', color: 'var(--color-text-primary)' }}>Elena Rostova</strong>
              <span style={{ fontSize: '12px', color: 'var(--color-accent-teal)', display: 'block' }}>elena.rostova@himalaya.com</span>
            </div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'rgba(124, 58, 237, 0.2)', display: 'block' }} className="hidden-mobile"></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 250px' }}>
            <div style={{ background: 'rgba(124, 58, 237, 0.12)', color: 'var(--color-accent-teal)', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Finance Lead (Controller)</span>
              <strong style={{ fontSize: '13.5px', color: 'var(--color-text-primary)' }}>Neha Lead</strong>
              <span style={{ fontSize: '12px', color: 'var(--color-accent-teal)', display: 'block' }}>neha.lead@himalaya.com</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {depts.map(d => (
            <div
              key={d.key}
              className="app-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '220px',
                borderLeft: `4px solid ${d.border}`
              }}
            >
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wrench size={15} color={d.border} /> {d.name}
                </h3>
                <p style={{ fontSize: '11.5px', color: '#475569', margin: '0 0 14px 0', lineHeight: '1.4' }}>{d.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                  {d.items.map((it, idx) => (
                    <span key={idx} style={{ fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      â€¢ {it}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleDeptClick(d.key)}
                className="action-btn"
                style={{
                  background: 'rgba(0, 0, 0, 0.04)',
                  border: '1px solid var(--color-border)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  color: 'var(--color-text-primary)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };



  // 11. BUSINESS REPORTS
  const renderBusinessReports = () => {
    const rawStockCount = (state.rawInventory || []).length;
    const lowStockCount = (state.rawInventory || []).filter(i => i.stock <= i.reorderLevel).length;
    const totalPaymentsCollected = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.totalAmount, 0);

    const row = (label, value, color) => (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        <strong style={color ? { color } : {}}>{value}</strong>
      </div>
    );

    const cardHead = (icon, label, color) => (
      <h3 style={{ fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color, borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', marginBottom: '12px' }}>
        {icon} {label}
      </h3>
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0 0 4px 4px' }}>Centralized Business Reports</h2>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginLeft: '4px' }}>
            Live consolidated analytics across all 8 departments — Sales · Production · Plant · Store · QC · Dispatch · Finance · HR.
          </span>
        </div>

        {/* Shared Analytics Filter Bar */}
        <SuperAdminAnalyticsFilter
          title="Executive Reports Comprehensive Filter"
          showBranch={true}
          showDepartment={true}
          showCustomer={true}
          showVendor={true}
          showProduct={true}
          showStatus={true}
          onExportPDF={() => exportSalesReportPDF()}
          onExportExcel={() => exportFinanceReportPDF()}
        />

        {/* Executive Document Export Center */}
        <div className="app-card" style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '16px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px'
        }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '800', margin: 0 }}>Executive Document Export Center</h4>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
              Download official company aggregates and cross-departmental balance sheets.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => exportSalesReportPDF()}
              className="action-btn"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: 'var(--color-primary)',
                color: '#000',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Download size={12} />
              Sales PDF
            </button>
            <button
              onClick={() => exportFinanceReportPDF()}
              className="action-btn"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: 'var(--color-primary)',
                color: '#000',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Download size={12} />
              Finance PDF
            </button>
            <button
              onClick={() => exportAgingReportPDF()}
              className="action-btn"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: 'var(--color-primary)',
                color: '#000',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Download size={12} />
              Aging AR PDF
            </button>
            <button
              onClick={() => exportInventoryReportPDF()}
              className="action-btn"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: 'var(--color-primary)',
                color: '#000',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Download size={12} />
              Stock levels PDF
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

          {/* â”€â”€ SALES â”€â”€ */}
          <div className="app-card">
            {cardHead(<BarChart3 size={14} />, 'Sales Performance', '#10b981')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
              {row('Total Orders', `${orders.length} Orders`)}
              {row('Gross Revenue Collected', `₹${totalPaymentsCollected.toLocaleString('en-IN')}`, '#4ade80')}
              {row('Leads in Funnel', `${(state.sales?.leads || []).length} Leads`)}
              {row('Active Quotations', `${(state.sales?.quotations || []).filter(q => q.status === 'Pending' || q.status === 'Sent').length} Quotes`)}
              {row('Samples Pending', `${(state.sales?.samples || []).filter(s => s.status === 'Pending').length} Items`, '#fb923c')}
              {row('Orders Closed / Dispatched', `${orders.filter(o => o.status === 'Dispatched' || o.status === 'Delivered').length} Done`, '#4ade80')}
            </div>
          </div>

          {/* â”€â”€ PRODUCTION â”€â”€ */}
          <div className="app-card">
            {cardHead(<Wrench size={14} />, 'Production Floor', '#a855f7')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
              {row('Work Orders Released', `${(state.workOrders || []).length} Batches`)}
              {row('Currently Running', `${orders.filter(o => o.productionStatus === 'Running').length} Active`, '#a855f7')}
              {row('Batches Completed', `${(state.workOrders || []).filter(w => w.status === 'Completed').length} Done`, '#4ade80')}
              {row('QC Failures / Rework', `${state.reproductions?.length || 0} Items`, '#f87171')}
              {row('Avg. Batch Delay', '0.8 Days')}
              {row('Shop Floor Yield', '92.8%', '#4ade80')}
            </div>
          </div>

          {/* â”€â”€ PLANT HEAD â”€â”€ */}
          <div className="app-card">
            {cardHead(<Shield size={14} />, 'Plant Head Approvals', '#f59e0b')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
              {row('Material Requests Pending', `${(state.materialRequests || []).filter(mr => mr.status === 'Pending').length} Awaiting`, '#fb923c')}
              {row('Material Requests Approved', `${(state.materialRequests || []).filter(mr => mr.status === 'Approved').length} Cleared`, '#4ade80')}
              {row('PO Approvals Pending', `${(state.purchaseOrders || []).filter(po => po.status === 'REQUESTED' || po.status === 'PENDING_SUPER_ADMIN_APPROVAL' || po.status === 'AWAITING_FINANCE_CONFIRMATION').length} POs`)}
              {row('Total Clearances Issued', `${(state.materialRequests || []).filter(mr => mr.status === 'Issued').length} Issued`)}
              {row('Schedule Adherence', '96.2% On-time', '#4ade80')}
              {row('Avg. Approval TAT', '1.2 Days')}
            </div>
          </div>

          {/* â”€â”€ STORE â”€â”€ */}
          <div className="app-card">
            {cardHead(<Layers size={14} />, 'Store Inventory', '#eab308')}
            {(() => {
              const rawInv = state.rawInventory || [];
              const matReqs = state.materialRequests || [];
              const matCount = {};
              matReqs.forEach(mr => { const k = mr.materialName || mr.material || 'Unknown'; matCount[k] = (matCount[k] || 0) + 1; });
              const topMats = Object.entries(matCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
              const totalRawValue = rawInv.reduce((sum, i) => sum + ((i.stock || 0) * (i.unitPrice || 350)), 0);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                  {row('Total Raw Stock Items', `${rawStockCount} Categories`)}
                  {row('Raw Inventory Value', `₹${totalRawValue.toLocaleString('en-IN')}`)}
                  {row('Low Stock Alerts', `${lowStockCount} Items`, lowStockCount > 0 ? '#f87171' : '#4ade80')}
                  {row('PO Requests Raised', `${(state.purchaseOrders || []).length} POs`)}
                  {row('Material Issuances', `${matReqs.filter(mr => mr.status === 'Issued').length} Released`, '#4ade80')}
                  {topMats.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '2px' }}>
                      <div style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        Most Requested Materials
                      </div>
                      {topMats.map(([mat, cnt]) => (
                        <div key={mat} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--color-text-primary)' }}>{mat}</span>
                          <strong style={{ color: '#fbbf24' }}>{cnt}Ã— Requests</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* â”€â”€ QC â”€â”€ */}
          <div className="app-card">
            {cardHead(<ShieldAlert size={14} />, 'QC Quality Control', '#06b6d4')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
              {row('Total Samples Logged', `${(state.sales?.samples || []).length} Samples`)}
              {row('Under Testing', `${(state.sales?.samples || []).filter(s => s.status === 'Testing').length} Items`, '#06b6d4')}
              {row('Approved / Passed', `${(state.sales?.samples || []).filter(s => s.status === 'Approved').length} Passed`, '#4ade80')}
              {row('Rejected / Failed', `${(state.sales?.samples || []).filter(s => s.status === 'Rejected').length} Failed`, '#f87171')}
              {row('First Pass Yield', '94.3%', '#4ade80')}
              {row('Defect Rate', '5.7% Flagged', '#fb923c')}
            </div>
          </div>

          {/* â”€â”€ DISPATCH â”€â”€ */}
          <div className="app-card">
            {cardHead(<Box size={14} />, 'Dispatch Logistics', '#f97316')}
            {(() => {
              const dispatched = orders.filter(o => o.status === 'Dispatched' || o.status === 'Delivered');
              const inTransit = orders.filter(o => o.status === 'In Transit');
              const totalFreight = dispatched.reduce((sum, o) => sum + (Number(o.freightCost || o.freight) || 0), 0);
              const totalDispatchValue = dispatched.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                  {row('Shipments Dispatched', `${dispatched.length} Deliveries`)}
                  {row('Currently In Transit', `${inTransit.length} Orders`, inTransit.length > 0 ? '#fb923c' : undefined)}
                  {row('Total Delivered Value', `₹${totalDispatchValue.toLocaleString('en-IN')}`)}
                  {row('Total Freight Cost', totalFreight > 0 ? `₹${totalFreight.toLocaleString('en-IN')}` : 'â€”', '#f97316')}
                  {row('On-Time Delivery Rate', '91.4%', '#4ade80')}
                  {row('POD Confirmations', `${dispatched.filter(o => o.status === 'Delivered').length} Confirmed`)}
                </div>
              );
            })()}
          </div>

          {/* â”€â”€ FINANCE â”€â”€ */}
          <div className="app-card">
            {cardHead(<DollarSign size={14} />, 'Finance Receivables', '#0ea5e9')}
            {(() => {
              const totalOutstanding = payments.filter(p => p.status !== 'Paid').reduce((sum, p) => sum + ((p.totalAmount || 0) - (p.paidAmount || 0)), 0);
              const totalAdvance = payments.reduce((sum, p) => sum + (Number(p.advancePayment) || 0), 0);
              const collectionRate = payments.length > 0 ? Math.round((payments.filter(p => p.status === 'Paid').length / payments.length) * 100) : 0;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                  {row('Revenue Collected', `₹${totalPaymentsCollected.toLocaleString('en-IN')}`, '#4ade80')}
                  {row('Outstanding Receivables', `₹${totalOutstanding.toLocaleString('en-IN')}`, totalOutstanding > 0 ? '#f87171' : '#4ade80')}
                  {row('Advance Payments Held', `₹${totalAdvance.toLocaleString('en-IN')}`)}
                  {row('Invoices Verified', `${payments.filter(p => p.verified === 'Approved').length} Cleared`, '#4ade80')}
                  {row('Pending Verification', `${payments.filter(p => p.verified !== 'Approved').length} Pending`, '#fb923c')}
                  {row('Collection Efficiency', `${collectionRate}%`, collectionRate >= 70 ? '#4ade80' : '#f87171')}
                </div>
              );
            })()}
          </div>

          {/* â”€â”€ HR â”€â”€ */}
          <div className="app-card">
            {cardHead(<Users size={14} />, 'HR Workforce Summary', '#ec4899')}
            {(() => {
              const totalEmp = employees.length;
              const active = employees.filter(e => e.status === 'Active').length;
              const onLeave = employees.filter(e => e.status === 'On Leave').length;
              const depts = [...new Set(employees.map(e => e.department).filter(Boolean))].length;
              const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                  {row('Total Employees', `${totalEmp} Staff`)}
                  {row('Currently Active', `${active} Present`, '#4ade80')}
                  {row('On Leave', `${onLeave} Absent`, onLeave > 0 ? '#fb923c' : undefined)}
                  {row('Active Departments', `${depts} Depts`)}
                  {row('Monthly Payroll Outflow', `₹${totalPayroll.toLocaleString('en-IN')}`)}
                  {row('ERP System Users', `${usersList.length} Accounts`)}
                </div>
              );
            })()}
          </div>

          {/* â”€â”€ ADMIN SYSTEM â”€â”€ */}
          <div className="app-card">
            {cardHead(<Shield size={14} />, 'Admin System Overview', '#6366f1')}
            {(() => {
              const productCatalog = state.productCatalog || [];
              const finishedInv = state.finishedInventory || [];
              const roleGroups = [...new Set(usersList.map(u => u.role).filter(Boolean))].length;
              const todayStr = new Date().toLocaleDateString('en-IN');
              const todayLogs = auditLogs.filter(l => l.date === todayStr).length;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '12.5px' }}>
                  {row('Total ERP User Accounts', `${usersList.length} Accounts`)}
                  {row('Role Groups Defined', `${roleGroups > 0 ? roleGroups : 9} Roles`)}
                  {row('Product Master SKUs', `${productCatalog.length} Items`)}
                  {row('Finished Goods Catalog', `${finishedInv.length} Products`)}
                  {row('Audit Log Entries Today', `${todayLogs} Actions`, todayLogs > 0 ? '#a78bfa' : undefined)}
                  {row('Total Audit Trail Logs', `${auditLogs.length} Records`)}
                  {row('System Portals Active', '9 Portals', '#4ade80')}
                  {row('Audit Trail Integrity', 'Immutable âœ“', '#4ade80')}
                </div>
              );
            })()}
          </div>

        </div>
      </div>
    );
  };


  // 13. SYSTEM SETTINGS


  // 15. GLOBAL NOTIFICATIONS
  const renderGlobalNotifications = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', margin: '0 0 4px 4px' }}>Compose Global Announcement</h2>
          <span style={{ fontSize: '11px', color: '#475569', marginLeft: '4px' }}>
            Broadcast alert updates to specific roles, departments, or publish globally to all logged-in workers.
          </span>
        </div>

        <form onSubmit={handleSendNotification} className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Announcement Title *</label>
            <input
              type="text" required className="form-input" placeholder="e.g. Server Maintenance Scheduled"
              value={notifComposer.title} onChange={e => setNotifComposer({ ...notifComposer, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Target Audience Department</label>
              <select className="form-select" value={notifComposer.department} onChange={e => setNotifComposer({ ...notifComposer, department: e.target.value })}>
                <option value="All">All Departments</option>
                <option value="Sales">Sales</option>
                <option value="Production">Production</option>
                <option value="HR">HR</option>
                <option value="Store">Store</option>
                <option value="QC">QC</option>
                <option value="Dispatch">Dispatch</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Alert Priority</label>
              <select className="form-select" value={notifComposer.priority} onChange={e => setNotifComposer({ ...notifComposer, priority: e.target.value })}>
                <option value="High">ðŸ”´ High Priority</option>
                <option value="Medium">ðŸŸ¡ Medium Priority</option>
                <option value="Low">ðŸŸ¢ Low Priority</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Message Details Body *</label>
            <textarea
              required className="form-input" rows="4" placeholder="Type announcement details here..."
              value={notifComposer.message} onChange={e => setNotifComposer({ ...notifComposer, message: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', marginTop: '10px' }}>
            <button type="submit" className="action-btn" style={{ background: 'var(--color-primary)', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Broadcast Announcement
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderInvoices = () => {
    const totalInvoiced = payments.reduce((sum, p) => sum + (Number(p.totalAmount || p.amount) || 0), 0);
    const totalCollected = payments.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
    const totalOutstanding = payments.reduce((sum, p) => sum + Math.max(0, (Number(p.totalAmount || p.amount) || 0) - (Number(p.paidAmount) || 0)), 0);

    const filteredInvoices = payments.filter(p => {
      if (invoiceStatusFilter === 'All') return true;
      if (invoiceStatusFilter === 'Outstanding') return p.status !== 'Paid';
      if (invoiceStatusFilter === 'Paid') return p.status === 'Paid';
      return true;
    });

    const statusPills = [
      { id: 'All', label: `All (${payments.length})` },
      { id: 'Outstanding', label: `Outstanding (${payments.filter(p => p.status !== 'Paid').length})` },
      { id: 'Paid', label: `Paid (${payments.filter(p => p.status === 'Paid').length})` }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* KPI Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="app-card border-left-blue">
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Invoiced</span>
            <h3 style={{ margin: '4px 0', fontSize: '24px' }}>₹{totalInvoiced.toLocaleString('en-IN')}</h3>
            <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0 0' }}>All generated bills</p>
          </div>
          <div className="app-card border-left-emerald">
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Collected</span>
            <h3 style={{ margin: '4px 0', fontSize: '24px' }}>₹{totalCollected.toLocaleString('en-IN')}</h3>
            <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0 0' }}>Paid/cleared amount</p>
          </div>
          <div className="app-card border-left-red">
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Outstanding</span>
            <h3 style={{ margin: '4px 0', fontSize: '24px' }}>₹{totalOutstanding.toLocaleString('en-IN')}</h3>
            <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0 0' }}>Balance receivable</p>
          </div>
        </div>

        <div className="app-card">
          <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h2 className="card-heading" style={{ margin: 0 }}>All Invoices</h2>
              <span style={{ fontSize: '11px', color: '#475569' }}>Overview of all client invoices and payments status</span>
            </div>

            {/* Status Pills */}
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              {statusPills.map(pill => {
                const isActive = invoiceStatusFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setInvoiceStatusFilter(pill.id)}
                    style={{
                      padding: '6px 12px',
                      background: isActive ? 'var(--color-primary)' : 'transparent',
                      color: isActive ? '#000' : 'var(--color-text-secondary)',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          <DataTable
            columns={[
              { header: 'Invoice No', accessor: 'invoiceNo', render: (row) => <strong style={{ color: 'var(--color-text-primary)' }}>{row.invoiceNo || `INV-${row.orderNo || ''}`}</strong>, nowrap: true },
              {
                header: 'Order Ref',
                accessor: 'orderNo',
                render: (row) => {
                  const matchedOrder = orders.find(o => o.orderNo === row.orderNo);
                  return (
                    <strong
                      style={{
                        color: '#337a86',
                        cursor: matchedOrder ? 'pointer' : 'default',
                        textDecoration: matchedOrder ? 'underline' : 'none'
                      }}
                      onClick={() => {
                        if (matchedOrder) {
                          navigate.push(`/orders/${row.orderNo}`);
                        }
                      }}
                    >
                      {row.orderNo}
                    </strong>
                  );
                },
                nowrap: true
              },
              { header: 'Customer', accessor: 'customerName' },
              { header: 'Due Date', accessor: 'dueDate', nowrap: true },
              { header: 'Total Value', accessor: 'totalAmount', render: (row) => `₹${(Number(row.totalAmount || row.amount) || 0).toLocaleString('en-IN')}`, nowrap: true },
              { header: 'Paid Value', accessor: 'paidAmount', render: (row) => `₹${(Number(row.paidAmount) || 0).toLocaleString('en-IN')}`, nowrap: true },
              { header: 'Outstanding', accessor: 'totalAmount', render: (row) => `₹${Math.max(0, (Number(row.totalAmount || row.amount) || 0) - (Number(row.paidAmount) || 0)).toLocaleString('en-IN')}`, nowrap: true },
              { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} />, nowrap: true }
            ]}
            data={filteredInvoices}
            searchQuery={globalSearch}
            searchField="customerName"
            actions={(row) => (
              <button
                className="action-btn"
                style={{ background: 'rgba(0, 0, 0, 0.04)', border: '1px solid var(--color-border)', padding: '5px 12px', borderRadius: '6px', color: 'var(--color-text-primary)', fontSize: '11.5px', cursor: 'pointer' }}
                onClick={() => setSelectedInvoice(row)}
              >
                Inspect
              </button>
            )}
            emptyMessage="No invoices logged yet."
          />
        </div>
      </div>
    );
  };

  const renderSalesAnalytics = () => {
    return <SalesAnalyticsPage />;
  };

  const renderAnalysisRequestsWorkspace = () => {
    return <BrandAnalysisPage />;

    // Filters
    const filteredRequests = requests.filter(req => {
      const matchesSearch = admSearchQuery === '' ||
        req.requestNumber?.toLowerCase().includes(admSearchQuery.toLowerCase()) ||
        req.storeReport?.productName?.toLowerCase().includes(admSearchQuery.toLowerCase()) ||
        req.storeReport?.brand?.toLowerCase().includes(admSearchQuery.toLowerCase()) ||
        req.storeReport?.problemTitle?.toLowerCase().includes(admSearchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (admActiveTab === 'All') return true;
      if (admActiveTab === 'Pending') return req.status === 'PENDING_SUPER_ADMIN_APPROVAL' || req.status === 'RETURNED_TO_FINANCE';
      if (admActiveTab === 'Active Trials') return ['TRIAL_APPROVED', 'TRIAL_IN_PROGRESS', 'TRIAL_REPORT_SUBMITTED'].includes(req.status);
      if (admActiveTab === 'Completed/Closed') return ['COMPLETED', 'APPROVED'].includes(req.status);
      if (admActiveTab === 'Rejected/Returned') return ['SUPER_ADMIN_REJECTED', 'FINANCE_REJECTED', 'RETURNED_TO_STORE'].includes(req.status);
      return true;
    });

    const activeTabStyle = (tab) => ({
      padding: '10px 18px',
      borderRadius: '8px',
      background: admActiveTab === tab ? 'var(--color-primary)' : 'transparent',
      color: admActiveTab === tab ? '#000' : 'var(--color-text-secondary)',
      border: 'none',
      fontWeight: '700',
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    });

    const handleAdminDecisionSubmit = (e, actionType) => {
      e?.preventDefault();

      if (actionType === 'returnFinance') {
        if (!admRemarks) {
          showToast('Please provide return remarks.');
          return;
        }
        returnAnalysisRequestToFinance(requestId, admRemarks);
        showToast('Request returned to Finance.');
        navigate.push('/super-admin/analysis-requests');
        return;
      }

      if (actionType === 'returnStore') {
        if (!admRemarks) {
          showToast('Please provide return remarks.');
          return;
        }
        returnAnalysisRequestToStoreByAdmin(requestId, admRemarks);
        showToast('Request returned to Store.');
        navigate.push('/super-admin/analysis-requests');
        return;
      }

      if (actionType === 'reject') {
        if (!admRemarks) {
          showToast('Please provide rejection remarks.');
          return;
        }
        rejectAnalysisRequestByAdmin(requestId, admRemarks);
        showToast('Request rejected by Super Admin.');
        navigate.push('/super-admin/analysis-requests');
        return;
      }

      if (actionType === 'complete') {
        completeAnalysisRequest(requestId, admRemarks || 'Request marked as completed.');
        showToast('Analysis request closed and COMPLETED.');
        navigate.push('/super-admin/analysis-requests');
        return;
      }

      if (actionType === 'clarification') {
        if (!admRemarks) {
          showToast('Please specify clarification request remarks.');
          return;
        }
        requestTrialClarification(requestId, admRemarks);
        showToast('Clarification requested. Trial report sent back to Store.');
        navigate.push('/super-admin/analysis-requests');
        return;
      }

      // Final decision/Trial submission
      if (admDecisionType === 'APPROVE_TECHNICAL_TRIAL') {
        if (!admTrialBrand || !admTrialQuantity) {
          showToast('Please specify trial brand and approved quantity.');
          return;
        }
        approveTechnicalTrial(requestId, {
          trialBrand: admTrialBrand,
          trialQuantity: Number(admTrialQuantity),
          unit: admTrialUnit,
          expectedCompletionDate: admTrialCompletionDate,
          performanceCriteria: admTrialCriteria,
          remarks: admRemarks
        });
        showToast('Technical site trial approved!');
      } else {
        if (!admRemarks) {
          showToast('Please provide approval remarks/details.');
          return;
        }
        approveAnalysisRequest(requestId, {
          decisionType: admDecisionType,
          remarks: admRemarks
        });
        showToast(`Request approved with policy decision: ${admDecisionType}`);
      }

      // Reset
      setAdmRemarks('');
      setAdmTrialBrand('');
      setAdmTrialQuantity('');
      setAdmTrialCompletionDate('');
      setAdmTrialCriteria('');

      navigate.push('/super-admin/analysis-requests');
    };

    const activeReq = requests.find(r => r.id === requestId);
    // Trial fields are pre-populated via top-level useEffect

    if (isDetails) {
      if (!activeReq) return <div>Request not found.</div>;

      const isPendingDecision = activeReq.status === 'PENDING_SUPER_ADMIN_APPROVAL' || activeReq.status === 'RETURNED_TO_FINANCE';
      const isTrialSubmitted = activeReq.status === 'TRIAL_REPORT_SUBMITTED';
      const showDecisionForm = isPendingDecision || isTrialSubmitted;

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Header Card */}
          <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #24345C 100%)', padding: '24px 32px', borderRadius: '16px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '20px', fontWeight: 900 }}>Decision Portal: {activeReq.requestNumber}</span>
                <span style={{ background: activeReq.status === 'COMPLETED' ? '#10b981' : activeReq.status.includes('REJECTED') ? '#ef4444' : '#f59e0b', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                  {activeReq.status}
                </span>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '13.5px', color: '#8893A7' }}>
                Product: {activeReq.storeReport?.productName} | Problematic Brand: {activeReq.storeReport?.brand}
              </p>
            </div>
            <button onClick={() => navigate.push('/super-admin/analysis-requests')} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
              ← Back to List
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '28px', alignItems: 'start' }}>
            
            {/* Left Column: Data panels & Decision Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Store Operational Report Panel */}
              <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1.5px solid #D6E2F0' }}>
                <h4 style={{ fontSize: '14.5px', fontWeight: 900, color: '#24345C', margin: '0 0 16px 0', borderBottom: '1.5px solid #DCE5F0', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  1. Store Operational Incident Report
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                  <div><strong>Product Code / Name:</strong> {activeReq.storeReport?.productCode} - {activeReq.storeReport?.productName}</div>
                  <div><strong>Brand:</strong> {activeReq.storeReport?.brand}</div>
                  <div><strong>Classification:</strong> {activeReq.storeReport?.issueType}</div>
                  <div><strong>Priority:</strong> <span style={{ color: activeReq.storeReport?.priority === 'CRITICAL' ? '#ef4444' : '#475569', fontWeight: 800 }}>{activeReq.storeReport?.priority}</span></div>
                  <div><strong>First Observed:</strong> {activeReq.storeReport?.firstObservedDate}</div>
                  <div><strong>Occurrence Count:</strong> {activeReq.storeReport?.occurrenceCount} times</div>
                  <div><strong>Affected Quantity:</strong> {activeReq.storeReport?.affectedQuantity} {activeReq.storeReport?.unit}</div>
                  <div><strong>Suggested Alternative:</strong> {activeReq.storeReport?.suggestedAlternativeBrand || 'None'}</div>
                  <div><strong>Current Stock:</strong> {activeReq.storeReqStock || activeReq.storeReport?.currentStock} {activeReq.storeReport?.unit}</div>
                  <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                    <strong>Store Incident details:</strong>
                    <div style={{ background: '#F5FAFE', padding: '12px', borderRadius: '8px', border: '1px solid #D6E2F0', marginTop: '6px', whiteSpace: 'pre-line' }}>
                      {activeReq.storeReport?.description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Finance Commercial Review Panel */}
              {activeReq.financeReview && (
                <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1.5px solid #D6E2F0' }}>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 900, color: '#24345C', margin: '0 0 16px 0', borderBottom: '1.5px solid #DCE5F0', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    2. Commercial Cost & Vendor Analysis
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                    <div><strong>Related Vendor:</strong> {activeReq.financeReview.relatedVendor || 'N/A'}</div>
                    <div><strong>Estimated Loss:</strong> <span style={{ color: '#ef4444', fontWeight: 800 }}>{activeReq.financeReview.financialImpact}</span></div>
                    <div><strong>Reviewed By:</strong> {activeReq.financeReview.reviewedBy}</div>
                    <div><strong>Reviewed Date:</strong> {new Date(activeReq.financeReview.reviewedAt).toLocaleDateString()}</div>
                    <div style={{ gridColumn: 'span 2', marginTop: '6px' }}>
                      <strong>Commercial Analysis & Contract implications:</strong>
                      <div style={{ background: '#F5FAFE', padding: '12px', borderRadius: '8px', border: '1px solid #D6E2F0', marginTop: '6px', whiteSpace: 'pre-line' }}>
                        {activeReq.financeReview.commercialAnalysis}
                      </div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <strong>Finance Policy Recommendation:</strong>
                      <div style={{ background: '#ecfdf5', color: '#065f46', padding: '10px 14px', borderRadius: '8px', border: '1px solid #a7f3d0', marginTop: '6px', fontWeight: 800 }}>
                        💡 {activeReq.financeReview.recommendation}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Store Technical Trial Report */}
              {activeReq.trial?.required && activeReq.trial.submittedAt && (
                <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '2px solid #10b981' }}>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 900, color: '#059669', margin: '0 0 16px 0', borderBottom: '1.5px solid #a7f3d0', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    3. Technical Trial Outcome Report
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
                    <div><strong>Trial Brand:</strong> {activeReq.trial.trialBrand}</div>
                    <div><strong>Trial Result:</strong> <span style={{ color: activeReq.trial.result === 'SUCCESSFUL' ? '#059669' : '#d97706', fontWeight: 800 }}>{activeReq.trial.result}</span></div>
                    <div><strong>Successful qty:</strong> {activeReq.trial.successfulQuantity} / {activeReq.trial.trialQuantity} {activeReq.trial.unit}</div>
                    <div><strong>Failed qty:</strong> {activeReq.trial.failedQuantity} {activeReq.trial.unit}</div>
                    <div style={{ gridColumn: 'span 2', marginTop: '6px' }}>
                      <strong>Report Text:</strong>
                      <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #a7f3d0', color: '#065f46', marginTop: '6px', whiteSpace: 'pre-line' }}>
                        {activeReq.trial.reportText}
                      </div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <strong>Physical observations:</strong>
                      <div style={{ background: '#F5FAFE', padding: '12px', borderRadius: '8px', border: '1px solid #D6E2F0', marginTop: '6px', whiteSpace: 'pre-line' }}>
                        {activeReq.trial.observations}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Super Admin Decision Formulation Form */}
              {showDecisionForm && (
                <form onSubmit={(e) => handleAdminDecisionSubmit(e, 'submit')} style={{ background: '#fff', padding: '28px', borderRadius: '14px', border: '1.5px solid #1e3a8a', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#1e3a8a', margin: '0', borderBottom: '1.5px solid #bfdbfe', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Formulate Super Admin Decision / policy ruling
                  </h4>

                  {!isTrialSubmitted && (
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>Decision Action Type *</label>
                      <select value={admDecisionType} onChange={e => setAdmDecisionType(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D6E2F0', borderRadius: '8px' }}>
                        <option value="APPROVE_ALTERNATIVE_BRAND">Approve Alternative Brand (ACC Cement)</option>
                        <option value="APPROVE_TECHNICAL_TRIAL">Approve Technical Site Trial (10 Bags)</option>
                        <option value="CONTINUE_CURRENT_BRAND">Continue Current Brand (Monitor closely)</option>
                        <option value="APPROVE_VENDOR_REVIEW">Initiate Commercial Vendor Review</option>
                        <option value="STOP_FUTURE_PURCHASE">Blacklist Brand / Stop Future Purchase</option>
                        <option value="REQUEST_TECHNICAL_INSPECTION">Request Technical Inspection</option>
                        <option value="CHANGE_PRODUCT_SPECIFICATION">Change Product Specification</option>
                        <option value="RETURN_MATERIAL">Initiate Material Return / Replacement</option>
                        <option value="OTHER">Other Policy Decision</option>
                      </select>
                    </div>
                  )}

                  {/* Trial Configuration block (visible when APPROVE_TECHNICAL_TRIAL is selected) */}
                  {admDecisionType === 'APPROVE_TECHNICAL_TRIAL' && !isTrialSubmitted && (
                    <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h5 style={{ margin: 0, fontSize: '13.5px', color: '#065f46', fontWeight: 900 }}>Technical Site Trial configuration</h5>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#065f46', marginBottom: '4px' }}>Trial Brand Name *</label>
                          <input type="text" required value={admTrialBrand} onChange={e => setAdmTrialBrand(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #a7f3d0', borderRadius: '6px' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#065f46', marginBottom: '4px' }}>Approved Trial Quantity *</label>
                          <input type="number" min="1" required value={admTrialQuantity} onChange={e => setAdmTrialQuantity(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #a7f3d0', borderRadius: '6px' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#065f46', marginBottom: '4px' }}>Expected Completion Date</label>
                          <input type="date" value={admTrialCompletionDate} onChange={e => setAdmTrialCompletionDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #a7f3d0', borderRadius: '6px' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#065f46', marginBottom: '4px' }}>Unit</label>
                          <input type="text" readOnly value={admTrialUnit} style={{ width: '100%', padding: '8px 12px', border: '1px solid #D6E2F0', borderRadius: '6px', background: '#fff' }} />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#065f46', marginBottom: '4px' }}>Performance & Acceptance Criteria</label>
                        <textarea rows="2" value={admTrialCriteria} onChange={e => setAdmTrialCriteria(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #a7f3d0', borderRadius: '6px' }} />
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                      {isTrialSubmitted ? 'Final Decision Remarks *' : 'Decision Rationale & Remarks *'}
                    </label>
                    <textarea required rows="4" value={admRemarks} onChange={e => setAdmRemarks(e.target.value)} placeholder="Provide detailed remarks or instructions to Store/Finance for implementing this decision..." style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D6E2F0', borderRadius: '8px' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '16px', borderTop: '1px solid #DCE5F0', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={(e) => handleAdminDecisionSubmit(e, 'returnFinance')} style={{ padding: '10px 16px', background: '#f1f5f9', border: '1px solid #D6E2F0', color: '#475569', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                        Return to Finance
                      </button>
                      <button type="button" onClick={(e) => handleAdminDecisionSubmit(e, 'returnStore')} style={{ padding: '10px 16px', background: '#f1f5f9', border: '1px solid #D6E2F0', color: '#475569', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                        Return to Store
                      </button>
                      <button type="button" onClick={(e) => handleAdminDecisionSubmit(e, 'reject')} style={{ padding: '10px 16px', background: '#fff1f2', border: '1.5px solid #fda4af', color: '#be123c', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                        Reject Request
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {isTrialSubmitted && (
                        <button type="button" onClick={(e) => handleAdminDecisionSubmit(e, 'clarification')} style={{ padding: '12px 20px', background: '#fffbeb', border: '1.5px solid #fde68a', color: '#b45309', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
                          Request Trial Clarification
                        </button>
                      )}
                      <button type="submit" style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #1e3a8a 0%, #24345C 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
                        {admDecisionType === 'APPROVE_TECHNICAL_TRIAL' ? 'Approve Trial Execution' : 'Confirm Decision & Close'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Close Button if decision is taken but status is not CLOSED (APPROVED/TRIAL_REPORT_SUBMITTED) */}
              {activeReq.status === 'APPROVED' && (
                <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1.5px solid #D6E2F0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <strong style={{ fontSize: '14.5px' }}>Complete & Close Request</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: '#5E6B82' }}>If policy decision actions have been implemented, mark this analysis request as closed.</p>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Final Closure remarks</label>
                    <textarea rows="2" value={admRemarks} onChange={e => setAdmRemarks(e.target.value)} placeholder="Final observations, contract changes log..." style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #D6E2F0', borderRadius: '8px' }} />
                  </div>
                  <button
                    onClick={(e) => handleAdminDecisionSubmit(e, 'complete')}
                    style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', alignSelf: 'flex-start' }}
                  >
                    Mark Request Completed
                  </button>
                </div>
              )}

            </div>

            {/* Right Column: Workflow History */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1.5px solid #D6E2F0' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#24345C', margin: '0 0 20px 0', borderBottom: '1.5px solid #DCE5F0', paddingBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Workflow Log & Audit History
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {(activeReq.history || []).map((h, i, arr) => {
                  const isLast = i === arr.length - 1;
                  const isRejected = h.toStatus?.includes('REJECTED') || h.action?.includes('REJECTED');
                  const isCompleted = h.toStatus === 'COMPLETED' || h.action?.includes('COMPLETED');
                  const isWarning = h.toStatus?.includes('IN_PROGRESS') || h.toStatus?.includes('REVIEW') || h.toStatus?.includes('RETURNED') || h.action?.includes('STARTED');
                  
                  let icon = '🟢';
                  if (isCompleted) icon = '✅';
                  else if (isRejected) icon = '🔴';
                  else if (isWarning) icon = '🟡';

                  return (
                    <div key={i} style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' }}>
                        <div style={{ fontSize: '14px', lineHeight: '20px', marginTop: '2px' }}>{icon}</div>
                        {!isLast && <div style={{ width: '2px', flexGrow: 1, background: '#D6E2F0', margin: '4px 0' }}></div>}
                      </div>
                      <div style={{ paddingBottom: isLast ? '0' : '20px', flex: 1 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                          {h.action?.replace(/_/g, ' ')}
                        </div>
                        <div style={{ fontSize: '11px', color: '#5E6B82', marginTop: '2px' }}>
                          By {h.performedBy} on {new Date(h.performedAt).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '6px', background: '#F5FAFE', padding: '8px 12px', borderRadius: '6px', border: '1px solid #DCE5F0' }}>
                          {h.remarks}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #24345C 100%)', borderRadius: '16px', padding: '24px 28px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.25)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#60a5fa', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Policy Decision Authority
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 900, margin: 0, color: '#fff' }}>Product & Brand Analysis Directory</h3>
            <p style={{ fontSize: '13px', color: '#8893A7', margin: '4px 0 0 0' }}>Review commercial analyses, direct site trials, and make definitive policy decisions on problematic materials.</p>
          </div>
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #D6E2F0', paddingBottom: '6px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Pending', 'Active Trials', 'Completed/Closed', 'Rejected/Returned'].map(t => (
              <button key={t} onClick={() => setAdmActiveTab(t)} style={activeTabStyle(t)}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="Search requests..." value={admSearchQuery} onChange={e => setAdmSearchQuery(e.target.value)} style={{ padding: '8px 14px 8px 32px', border: '1.5px solid #D6E2F0', borderRadius: '8px', fontSize: '13px', width: '220px' }} />
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: '#8893A7' }} />
          </div>
        </div>

        {/* DataTable requests */}
        <DataTable
          columns={[
            { header: 'Request #', accessor: 'requestNumber', render: (row) => <strong style={{ color: '#2563eb' }}>{row.requestNumber}</strong> },
            { header: 'Product Name', accessor: 'storeReport.productName', render: (row) => row.storeReport?.productName },
            { header: 'Brand', accessor: 'storeReport.brand', render: (row) => row.storeReport?.brand },
            { header: 'Commercial Vendor', accessor: 'financeReview.relatedVendor', render: (row) => row.financeReview?.relatedVendor || 'N/A' },
            { header: 'Financial Impact', accessor: 'financeReview.financialImpact', render: (row) => <span style={{ color: '#ef4444', fontWeight: 800 }}>{row.financeReview?.financialImpact || 'N/A'}</span> },
            { header: 'Priority', accessor: 'storeReport.priority', render: (row) => <span style={{ color: row.storeReport?.priority === 'CRITICAL' ? '#ef4444' : '#5E6B82', fontWeight: 800 }}>{row.storeReport?.priority}</span> },
            { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status || 'DRAFT'} /> },
            {
              header: 'Actions',
              accessor: 'actions',
              render: (row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => navigate.push(`/super-admin/analysis-requests/${row.id}`)}
                    style={{ padding: '5px 12px', background: 'linear-gradient(135deg, #1e293b 0%, #24345C 100%)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {['PENDING_SUPER_ADMIN_APPROVAL', 'RETURNED_TO_FINANCE', 'TRIAL_REPORT_SUBMITTED'].includes(row.status) ? 'Take Action Decision' : 'View Details'}
                  </button>
                </div>
              )
            }
          ]}
          data={filteredRequests}
          emptyMessage="No analysis requests found for the selected tab."
        />
      </div>
    );
  };

  const renderActiveView = () => {
    if (view === 'direct-orders' && subView === 'create') {
      return renderDirectOrderCreate();
    }

    switch (view) {
      case 'purchase-indents':
        return <PurchaseIndentsView />;
      case 'analysis-requests':
        return renderAnalysisRequestsWorkspace();
      case 'customer-complaints':
        return <CustomerComplaintManagement mode="admin" currentUser={currentUser} />;
      case 'analytics':
        if (subView === 'business') return <DashboardView onNavigateView={(v, s) => navigate.push(`/super-admin/${v}/${s}`)} />;
        if (subView === 'sales') return <SalesAnalyticsPage />;
        if (subView === 'finance') return <FinanceAnalyticsPage />;
        if (subView === 'production') return <ProductionAnalyticsPage />;
        if (subView === 'inventory') return <InventoryCostAnalyticsPage />;
        if (subView === 'hr') return <HRAnalyticsPage />;
        if (subView === 'dispatch') return <DispatchCostAnalyticsPage />;
        if (subView === 'profitability') return <ProfitabilityAnalyticsPage />;
        return (
          <DashboardView
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            systemHealth={systemHealth}
            liveEvents={liveEvents}
            onNavigateView={(v, s) => navigate.push(`/super-admin/${v}/${s}`)}
          />
        );
      case 'dashboard':
        return (
          <DashboardView
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            systemHealth={systemHealth}
            liveEvents={liveEvents}
            onNavigateView={(v, s) => navigate.push(`/super-admin/${v}/${s}`)}
          />
        );
      case 'sales-analytics':
        return renderSalesAnalytics();
      case 'admins':
        return renderAdmins();
      case 'users':
        return renderUsers();
      case 'companies':
        return renderCompanies();
      case 'sales-target':
        return renderSalesTarget();
      case 'employees':
        return renderEmployees();
      case 'categories':
        return renderCategories();
      case 'price-master':
        return renderPriceMaster();
      case 'inventory':
        return renderInventory();
      case 'modules':
        return renderModules();
      case 'products':
        return renderProducts();
      case 'direct-orders':
        return renderDirectOrders();
      case 'samples':
        return renderSamples();
      case 'quotations':
        return renderQuotations();
      case 'orders':
        return renderAllOrders();
      case 'invoices':
        return renderInvoices();
      case 'departments':
        return renderDepartmentControl();
      case 'reports':
        return renderBusinessReports();
      case 'notifications':
        return renderGlobalNotifications();
      default:
        return (
          <DashboardView
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            systemHealth={systemHealth}
            liveEvents={liveEvents}
          />
        );
    }
  };

  // Mock list of quotations

  return (
    <SuperAdminFilterProvider>
      <div className="super-admin-theme-container">
      {renderActiveView()}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ PRODUCT CREATION/EDIT MODAL Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {showProductModal && (
        <div className="modal-overlay active" onClick={() => setShowProductModal(false)} style={{ zIndex: 10000 }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '680px', maxWidth: 'calc(100vw - 32px)' }}>
            <div className="modal-header-row">
              <h3 className="modal-title-text">{editingProduct ? `Edit Product: ${editingProduct.id}` : 'Add New Product'}</h3>
              <button className="modal-close-btn" onClick={() => setShowProductModal(false)}>âœ•</button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 16px 0' }}>
              {editingProduct ? 'Modify details and configuring pricing of this product catalog item.' : 'Create a brand new product catalog item.'}
            </p>

            {formError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', fontWeight: '600' }}>
                Ã¢Å¡Â Ã¯Â¸Â {formError}
              </div>
            )}

            <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ color: 'var(--color-text-primary)', marginBottom: '6px', fontWeight: '700' }}>Product Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Concrete Cylinders"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: 'var(--color-text-primary)', marginBottom: '6px', fontWeight: '700' }}>Category *</label>
                  <select
                    className="form-select"
                    value={productForm.category}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    required
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: 'var(--color-text-primary)', marginBottom: '6px', fontWeight: '700' }}>Unit Type *</label>
                  <select
                    className="form-select"
                    value={productForm.unit}
                    onChange={(e) => setProductForm(prev => ({ ...prev, unit: e.target.value }))}
                    required
                  >
                    {UNITS.map(ut => (
                      <option key={ut} value={ut}>{ut}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: 'var(--color-text-primary)', marginBottom: '6px', fontWeight: '700' }}>Selling Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="form-input"
                    placeholder="Selling price"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>


                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: 'var(--color-text-primary)', marginBottom: '6px', fontWeight: '700' }}>Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="form-input"
                    placeholder="Available stock"
                    value={productForm.stock}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: 'var(--color-text-primary)', marginBottom: '6px', fontWeight: '700' }}>Cost Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input"
                    placeholder="Cost price"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm(prev => ({ ...prev, costPrice: e.target.value }))}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: 'var(--color-text-primary)', marginBottom: '6px', fontWeight: '700' }}>Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-input"
                    placeholder="Discount percentage"
                    value={productForm.discount}
                    onChange={(e) => setProductForm(prev => ({ ...prev, discount: Number(e.target.value) || 0 }))}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: 'var(--color-text-primary)', marginBottom: '6px', fontWeight: '700' }}>Tax Rate % *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    className="form-input"
                    placeholder="GST tax rate"
                    value={productForm.tax}
                    onChange={(e) => setProductForm(prev => ({ ...prev, tax: Number(e.target.value) || 18 }))}
                  />
                </div>
              </div>


              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: 'var(--color-text-primary)', marginBottom: '6px', fontWeight: '700' }}>Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        setProductForm(prev => ({ ...prev, image: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="form-input"
                    style={{ padding: '6px 10px', fontSize: '13px' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ color: 'var(--color-text-primary)', marginBottom: '6px', fontWeight: '700' }}>Status *</label>
                  <select
                    className="form-select"
                    value={productForm.status}
                    onChange={(e) => setProductForm(prev => ({ ...prev, status: e.target.value }))}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {productForm.image && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#F5FAFE', padding: '12px', borderRadius: '8px', border: '1px solid #DCE5F0' }}>
                  <img src={productForm.image} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div>
                    <span style={{ fontSize: '12.5px', color: '#24345C', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Image Loaded Successfully</span>
                    <button type="button" onClick={() => setProductForm(prev => ({ ...prev, image: '' }))} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer', padding: 0, fontSize: '11px' }}>Remove Image</button>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ color: 'var(--color-text-primary)', marginBottom: '6px', fontWeight: '700' }}>Description</label>
                <textarea
                  className="form-input"
                  rows="3"
                  style={{ resize: 'vertical' }}
                  placeholder="Product description and specifications..."
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px' }}>
                <button type="submit" className="form-submit-btn" style={{ margin: 0, padding: '10px 24px', flex: 1, background: 'var(--color-primary)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  style={{ margin: 0, padding: '10px 24px', background: '#f1f5f9', border: '1px solid #475569', borderRadius: '8px', color: '#334155', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ ORDER PROCESS INSPECTION DRAWER/MODAL Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {selectedOrderDetails && (
        <div className="modal-overlay active" onClick={() => setSelectedOrderDetails(null)} style={{ zIndex: 10000 }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header-row">
              <h3 className="modal-title-text">Workflow Inspection: {selectedOrderDetails.orderNo}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedOrderDetails(null)}>âœ•</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>

              {/* Override Approval Actions (Super Admin Exclusive Override Matrix) */}
              <div style={{ background: '#F5FAFE', padding: '16px', borderRadius: '8px', border: '1px solid rgba(15, 23, 42, 0.08)' }}>
                <span style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  Super Admin Exclusive Overrides
                </span>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {selectedOrderDetails.plantHeadStatus !== 'Approved' && (
                    <button onClick={() => handleApprovalOverride(selectedOrderDetails, 'Planned')} style={{ background: '#0ea5e9', color: '#000', fontWeight: 'bold', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>
                      Force Production Planning
                    </button>
                  )}
                  {selectedOrderDetails.storeStatus !== 'Issued' && (
                    <button onClick={() => handleApprovalOverride(selectedOrderDetails, 'Material Approved')} style={{ background: '#eab308', color: '#000', fontWeight: 'bold', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>
                      Force Material Release
                    </button>
                  )}
                  {!['QC Passed', 'QC_PASSED', 'DISPATCH_READY'].includes(selectedOrderDetails.status) && !['Closed', 'CLOSED'].includes(selectedOrderDetails.status) && (
                    <button onClick={() => handleApprovalOverride(selectedOrderDetails, 'QC Passed')} style={{ background: '#10b981', color: '#000', fontWeight: 'bold', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>
                      Override QC Checks (Pass)
                    </button>
                  )}
                </div>
              </div>

              {/* Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#F5FAFE', padding: '12px', borderRadius: '8px', border: '1px solid rgba(15, 23, 42, 0.08)' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#5E6B82', display: 'block' }}>Customer Partner</span>
                  <strong style={{ fontSize: '13px', color: '#24345C' }}>{selectedOrderDetails.customer?.name || selectedOrderDetails.customerName}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#5E6B82', display: 'block' }}>Active Product Items</span>
                  <strong style={{ fontSize: '13px', color: '#24345C' }}>{selectedOrderDetails.products}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#5E6B82', display: 'block' }}>Total Dues / Invoice</span>
                  <strong style={{ fontSize: '13px', color: '#337a86' }}>
                    ₹{selectedOrderDetails.payment?.totalAmount?.toLocaleString('en-IN') || (selectedOrderDetails.price * selectedOrderDetails.quantity).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {/* Major timeline indicators */}
              <div style={{ padding: '8px 0' }}>
                <Timeline timeline={selectedOrderDetails.timeline || []} currentStage={selectedOrderDetails.overallStage} />
              </div>

              {/* QC parameters and material volumes details */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <ApprovalHistory orderNo={selectedOrderDetails.orderNo} />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <div className="modal-overlay active" onClick={() => setSelectedInvoice(null)} style={{ zIndex: 10000 }}>
          <div className="modal-box invoice-sheet-modal" onClick={(e) => e.stopPropagation()} style={{ width: '800px', maxWidth: 'calc(100vw - 32px)', background: '#ffffff', color: '#1e293b', borderRadius: '24px', padding: '32px', border: '1px solid #DCE5F0' }}>

            {/* Invoice Header */}
            <div className="invoice-sheet-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#24345C', letterSpacing: '-0.5px' }}>HIMALAYA ENTERPRISES</h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#5E6B82', fontWeight: '600' }}>Tax Invoice & Receivable Record</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#24345C' }}>INVOICE</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#5E6B82', fontWeight: '700' }}>Ref: {selectedInvoice.invoiceNo || `INV-${selectedInvoice.orderNo.replace('ORD-', '')}`}</p>
              </div>
            </div>

            {/* Thick Horizontal Divider */}
            <hr style={{ border: 'none', borderTop: '2px solid #24345C', margin: '20px 0' }} />

            {/* Invoice Info Columns */}
            {(() => {
              const targetOrder = orders.find(o => o.orderNo === selectedInvoice.orderNo) || {};
              const orderGrandTotal = selectedInvoice.totalAmount || targetOrder.totalValue || 0;
              const transportVal = targetOrder.transportCharge !== undefined ? targetOrder.transportCharge : 0;

              const customerDetail = state.customers?.find(c => c.name === selectedInvoice.customerName || c.name === targetOrder.customerName || c.name === targetOrder.customer?.name) || {};
              const itemsList = targetOrder.detailedItems || [
                {
                  productName: targetOrder.products || 'Concrete Supply',
                  code: `P-${((targetOrder.products || 'PRD').replace(/[^A-Za-z]/g, '').substring(0, 3) || 'PRD').toUpperCase()}-02`,
                  quantity: targetOrder.quantity || 1,
                  unitPrice: (orderGrandTotal - transportVal) / (targetOrder.quantity || 1),
                  discount: 0,
                  tax: targetOrder.tax !== undefined ? targetOrder.tax : (targetOrder.gst !== undefined ? targetOrder.gst : 18)
                }
              ];

              const calculatedSubtotal = itemsList.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
              const discountAmt = itemsList.reduce((sum, item) => sum + ((item.quantity * item.unitPrice) * (item.discount || 0) / 100), 0);
              const taxableSubtotal = calculatedSubtotal - discountAmt;
              const calculatedTaxAmt = itemsList.reduce((sum, item) => {
                const sub = item.quantity * item.unitPrice;
                const disc = sub * (item.discount || 0) / 100;
                return sum + ((sub - disc) * (item.tax !== undefined ? item.tax : 18) / 100);
              }, 0);
              const rawGrandTotal = taxableSubtotal + calculatedTaxAmt;
              const computedTransportVal = targetOrder.transportCharge !== undefined ? targetOrder.transportCharge : Math.max(0, orderGrandTotal - rawGrandTotal);

              const formatValLakh = (value) => {
                if (value >= 100000) {
                  return `₹${(value / 100000).toFixed(2)} L`;
                }
                return `₹${Math.round(value).toLocaleString('en-IN')}`;
              };

              // Generate standalone download invoice
              const handleDownloadHTML = () => {
                const invoiceHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${selectedInvoice.orderNo}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      color: #1e293b;
      margin: 40px;
      background: #F5FAFE;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      border: 1px solid #DCE5F0;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-left h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 800;
      color: #24345C;
    }
    .header-left p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #5E6B82;
      font-weight: 600;
    }
    .header-right h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      color: #24345C;
    }
    .header-right p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #5E6B82;
      font-weight: 700;
    }
    .divider {
      border: none;
      border-top: 2px solid #24345C;
      margin: 24px 0;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .details-col {
      flex: 1;
    }
    .details-col-right {
      text-align: right;
    }
    .label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: #5E6B82;
      margin-bottom: 6px;
    }
    .value-bold {
      font-size: 15px;
      font-weight: 700;
      color: #24345C;
    }
    .value-normal {
      font-size: 14px;
      color: #475569;
      margin: 2px 0;
    }
    .table-container {
      margin-top: 30px;
      border-collapse: collapse;
      width: 100%;
    }
    .table-container th {
      background: #F5FAFE;
      color: #5E6B82;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      padding: 12px;
      text-align: left;
    }
    .table-container td {
      padding: 16px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .summary-section {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-top: 20px;
      gap: 8px;
    }
    .summary-row {
      display: flex;
      width: 300px;
      justify-content: space-between;
      font-size: 14px;
    }
    .summary-total {
      font-size: 18px;
      font-weight: 800;
      color: #24345C;
      border-top: 1px solid #DCE5F0;
      padding-top: 8px;
      margin-top: 4px;
    }
    @media print {
      body {
        background: #ffffff;
        margin: 0;
      }
      .invoice-card {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header-row">
      <div class="header-left">
        <h1>HIMALAYA ENTERPRISES</h1>
        <p>Tax Invoice & Receivable Record</p>
      </div>
      <div class="header-right">
        <h2>INVOICE</h2>
        <p>Ref: ${selectedInvoice.invoiceNo || `INV-${selectedInvoice.orderNo.replace('ORD-', '')}`}</p>
      </div>
    </div>
    <hr class="divider" />
    <div class="details-row">
      <div class="details-col">
        <div class="label">Billed To:</div>
        <div class="value-bold">${selectedInvoice.customerName}</div>
        <div class="value-normal">${customerDetail.address || 'Registered Client Partner'}</div>
        <div class="value-normal">GST: ${customerDetail.gst || '27ABCDE4321G2Z8'}</div>
      </div>
      <div class="details-col details-col-right">
        <div class="value-normal"><strong>Invoice Date:</strong> ${selectedInvoice.date || '2026-06-06'}</div>
        <div class="value-normal"><strong>Due Date:</strong> ${selectedInvoice.dueDate || '2026-06-26'}</div>
        <div class="value-normal"><strong>Salesperson:</strong> ${targetOrder.salesperson || 'Alex Carter'}</div>
      </div>
    </div>
    <table class="table-container">
      <thead>
        <tr>
          <th>Product Details</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Rate</th>
          ${discountAmt > 0 ? '<th style="text-align: center;">Discount</th>' : ''}
          <th style="text-align: center;">Tax (GST)</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsList.map(item => `
          <tr>
            <td>
              <div style="font-weight: 700; color: #24345C;">${item.productName}</div>
              ${item.productDetails ? `<div style="font-size: 12px; color: #475569; margin-top: 2px;">${item.productDetails}</div>` : ''}
              <div style="font-size: 11px; color: #5E6B82; margin-top: 2px;">Code: ${item.code || 'P-PRD-01'}</div>
            </td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">₹${Math.round(item.unitPrice).toLocaleString('en-IN')}</td>
            ${discountAmt > 0 ? `<td style="text-align: center;">${item.discount || 0}%</td>` : ''}
            <td style="text-align: center;">${item.tax !== undefined ? item.tax : 18}%</td>
            <td style="text-align: right; font-weight: 700;">₹${Math.round(item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100) * (1 + (item.tax !== undefined ? item.tax : 18) / 100)).toLocaleString('en-IN')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="summary-section">
      <div class="summary-row">
        <span style="color: #5E6B82;">Subtotal:</span>
        <span style="font-weight: 600;">${formatValLakh(taxableSubtotal)}</span>
      </div>
      <div class="summary-row">
        <span style="color: #5E6B82;">GST Amount:</span>
        <span style="font-weight: 600;">₹${Math.round(calculatedTaxAmt).toLocaleString('en-IN')}</span>
      </div>
      ${computedTransportVal > 0 ? `
      <div class="summary-row" style="color: #0369a1;">
        <span>Transport (Approx.):</span>
        <span style="font-weight: 600;">+${formatValLakh(computedTransportVal)}</span>
      </div>
      ` : ''}
      <div class="summary-row summary-total">
        <span>Grand Total:</span>
        <span>${formatValLakh(orderGrandTotal)}</span>
      </div>
      <div class="summary-row" style="color: #16a34a;">
        <span>Amount Cleared:</span>
        <span style="font-weight: 600;">${formatValLakh(selectedInvoice.paidAmount)}</span>
      </div>
      <div class="summary-row" style="color: #ef4444; font-weight: bold;">
        <span>Balance Due:</span>
        <span>${formatValLakh(Math.max(0, orderGrandTotal - selectedInvoice.paidAmount))}</span>
      </div>
    </div>
  </div>
</body>
</html>
                `;

                const blob = new Blob([invoiceHTML], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Invoice_${selectedInvoice.orderNo}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                if (showToast) {
                  showToast("Invoice HTML downloaded successfully.");
                }
              };

              return (
                <>
                  <div className="invoice-sheet-meta" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', color: '#5E6B82', marginBottom: '6px', letterSpacing: '0.5px' }}>Billed To:</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#24345C' }}>{selectedInvoice.customerName}</div>
                      <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px', lineHeight: '1.4' }}>{customerDetail.address || 'Registered Client Partner'}</div>
                      <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>GST: {customerDetail.gst || '27ABCDE4321G2Z8'}</div>
                    </div>
                    <div className="invoice-meta-right" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#475569' }}>
                      <div><strong>Invoice Date:</strong> {selectedInvoice.date || '2026-06-06'}</div>
                      <div><strong>Due Date:</strong> {selectedInvoice.dueDate || '2026-06-26'}</div>
                      <div><strong>Salesperson:</strong> {targetOrder.salesperson || 'Alex Carter'}</div>
                    </div>
                  </div>

                  {/* Detailed Items Table */}
                  <div style={{ overflowX: 'auto', width: '100%', marginTop: '32px' }}>
                    <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#F5FAFE', borderBottom: '1px solid #DCE5F0' }}>
                          <th style={{ padding: '12px', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', color: '#5E6B82' }}>Product Details</th>
                          <th style={{ padding: '12px', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', color: '#5E6B82', textAlign: 'center' }}>Qty</th>
                          <th style={{ padding: '12px', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', color: '#5E6B82', textAlign: 'right' }}>Rate</th>
                          {discountAmt > 0 && (
                            <th style={{ padding: '12px', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', color: '#5E6B82', textAlign: 'center' }}>Discount</th>
                          )}
                          <th style={{ padding: '12px', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', color: '#5E6B82', textAlign: 'center' }}>Tax (GST)</th>
                          <th style={{ padding: '12px', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', color: '#5E6B82', textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsList.map((item, idx) => {
                          const rowTotal = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100) * (1 + (item.tax !== undefined ? item.tax : 18) / 100);
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '16px 12px' }}>
                                <div style={{ fontWeight: '700', color: '#24345C', fontSize: '14px' }}>{item.productName}</div>
                                {item.productDetails && (
                                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '500' }}>{item.productDetails}</div>
                                )}
                                <div style={{ fontSize: '11px', color: '#5E6B82', marginTop: '3px' }}>Code: {item.code || 'P-PRD-01'}</div>
                              </td>
                              <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>{item.quantity}</td>
                              <td style={{ padding: '16px 12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>₹{Math.round(item.unitPrice).toLocaleString('en-IN')}</td>
                              {discountAmt > 0 && (
                                <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>{item.discount || 0}%</td>
                              )}
                              <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>{item.tax !== undefined ? item.tax : 18}%</td>
                              <td style={{ padding: '16px 12px', textAlign: 'right', fontSize: '14px', fontWeight: '800', color: '#24345C' }}>{formatValLakh(rowTotal)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Totals */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '24px', gap: '8px' }}>
                    <div style={{ display: 'flex', width: '320px', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#5E6B82', fontWeight: '600' }}>Subtotal:</span>
                      <span style={{ fontWeight: '700', color: '#24345C' }}>{formatValLakh(taxableSubtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', width: '320px', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#5E6B82', fontWeight: '600' }}>GST Amount:</span>
                      <span style={{ fontWeight: '700', color: '#24345C' }}>₹{Math.round(calculatedTaxAmt).toLocaleString('en-IN')}</span>
                    </div>
                    {computedTransportVal > 0 && (
                      <div style={{ display: 'flex', width: '320px', justifyContent: 'space-between', fontSize: '14px', color: '#0369a1' }}>
                        <span style={{ fontWeight: '600' }}>Transport (Approx.):</span>
                        <span style={{ fontWeight: '700' }}>+{formatValLakh(computedTransportVal)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', width: '320px', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', color: '#24345C', borderTop: '2px solid #DCE5F0', paddingTop: '10px', marginTop: '4px' }}>
                      <span>Grand Total:</span>
                      <span>{formatValLakh(orderGrandTotal)}</span>
                    </div>
                    <div style={{ display: 'flex', width: '320px', justifyContent: 'space-between', fontSize: '14px', color: '#16a34a', marginTop: '4px' }}>
                      <span style={{ fontWeight: '600' }}>Amount Cleared:</span>
                      <span style={{ fontWeight: '700' }}>{formatValLakh(selectedInvoice.paidAmount)}</span>
                    </div>
                    <div style={{ display: 'flex', width: '320px', justifyContent: 'space-between', fontSize: '14px', color: '#ef4444', fontWeight: 'bold' }}>
                      <span>Balance Due:</span>
                      <span>{formatValLakh(Math.max(0, orderGrandTotal - selectedInvoice.paidAmount))}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="sheet-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                    <button
                      className="action-btn"
                      style={{ background: '#f1f5f9', border: '1px solid #D6E2F0', padding: '10px 20px', borderRadius: '8px', color: '#334155', fontWeight: 'bold', cursor: 'pointer' }}
                      onClick={() => setSelectedInvoice(null)}
                    >
                      Close Preview
                    </button>
                    <button
                      className="action-btn"
                      style={{ background: 'var(--color-primary)', border: 'none', padding: '10px 20px', borderRadius: '8px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
                      onClick={handleDownloadHTML}
                    >
                      Download Invoice
                    </button>
                    <button
                      className="action-btn"
                      style={{ background: 'var(--color-accent-teal)', border: 'none', padding: '10px 20px', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                      onClick={() => window.print()}
                    >
                      Print Invoice
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* â”€â”€ BUSINESS PROPOSAL QUOTATION PREVIEW MODAL â”€â”€ */}
      {previewQuotation && (
        <div className="modal-overlay active" onClick={() => setPreviewQuotation(null)} style={{ zIndex: 10000 }}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '800px',
              width: '90%',
              maxHeight: '95vh',
              overflowY: 'auto',
              background: '#ffffff',
              color: '#1e293b',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              fontFamily: 'system-ui, sans-serif'
            }}
          >
            {/* Letterhead Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #24345C', paddingBottom: '20px', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#24345C', letterSpacing: '-0.5px', margin: 0 }}>HIMALAYA ENTERPRISES</h1>
                <span style={{ fontSize: '11px', color: '#5E6B82', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Industrial Manufacturing & Solutions</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#475569', lineHeight: '1.4' }}>
                  123 Industrial Area, Phase 1, Haridwar, Uttarakhand<br />
                  GSTIN: 05AAACH1234F1Z1 | Contact: support@himalaya.com
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'inline-block', background: '#24345C', color: '#ffffff', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>PROPOSAL QUOTATION</span>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0ea5e9', margin: 0 }}>{previewQuotation.id}</h2>
                <span style={{ fontSize: '11px', color: '#5E6B82' }}>Date Issued: {previewQuotation.date}</span>
              </div>
            </div>

            {/* Client & Validity info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px', fontSize: '12.5px', color: '#334155' }}>
              <div style={{ background: '#F5FAFE', padding: '16px', borderRadius: '8px', border: '1px solid #DCE5F0' }}>
                <span style={{ color: '#5E6B82', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Prepared For:</span>
                <strong style={{ fontSize: '14.5px', color: '#24345C' }}>{previewQuotation.customerName}</strong>
                <p style={{ margin: '4px 0 0 0', color: '#475569' }}>Corporate Partner Account</p>
                <p style={{ margin: '4px 0 0 0', color: '#5E6B82', fontSize: '11px' }}>Tax Registration: GST Appended</p>
              </div>
              <div style={{ background: '#F5FAFE', padding: '16px', borderRadius: '8px', border: '1px solid #DCE5F0', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
                <div>
                  <span style={{ color: '#5E6B82', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Validity Details:</span>
                  <p style={{ margin: 0 }}>Proposal Valid Until: <strong>{previewQuotation.validTill}</strong></p>
                  <p style={{ margin: '4px 0 0 0' }}>Bypassed Stages: <strong>CRM Lead & Sample Check</strong></p>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span style={{ color: '#5E6B82', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>Authorized Sign-off:</span>
                  <span style={{ color: '#24345C', fontWeight: 'bold' }}>{previewQuotation.createdBy || 'Super Admin'}</span>
                </div>
              </div>
            </div>

            {/* Quotation Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px', fontSize: '12.5px', color: '#334155' }}>
              <thead>
                <tr style={{ background: '#24345C', color: '#ffffff' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px' }}>Product Specifications</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', width: '90px' }}>Quantity</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', width: '130px' }}>Rate (₹)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', width: '90px' }}>Discount</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', width: '90px' }}>Tax Rate</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', width: '140px', borderTopRightRadius: '6px', borderBottomRightRadius: '6px' }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {previewQuotation.detailedItems && previewQuotation.detailedItems.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #DCE5F0' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <strong style={{ color: '#24345C' }}>{item.productName}</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: '#5E6B82', marginTop: '2px' }}>Code: {item.code}</span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 'bold' }}>{item.qty}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>₹{Number(item.price).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#16a34a' }}>{item.discount}%</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>{item.tax}% GST</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 'bold', color: '#24345C' }}>₹{Number(item.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                {!previewQuotation.detailedItems && (
                  <tr style={{ borderBottom: '1px solid #DCE5F0' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <strong style={{ color: '#24345C' }}>{previewQuotation.items}</strong>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 'bold' }}>{previewQuotation.quantity || 1}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>₹{Number(previewQuotation.price).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#16a34a' }}>{previewQuotation.discount}%</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>{previewQuotation.tax}% GST</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 'bold', color: '#24345C' }}>₹{Number(previewQuotation.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Calculation Summaries */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
              <div style={{ width: '280px', fontSize: '13px', color: '#334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ color: '#5E6B82' }}>Item Subtotal:</span>
                  <span>₹{Number(previewQuotation.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '2px solid #DCE5F0' }}>
                  <span style={{ color: '#5E6B82' }}>Estimated Tax & Duties:</span>
                  <span>Included</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 6px 0', fontSize: '16px', fontWeight: '800', color: '#24345C' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: '#0284c7' }}>₹{Number(previewQuotation.totalAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Bank & Terms signature area */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px', borderTop: '1px solid #DCE5F0', paddingTop: '24px', fontSize: '11px', color: '#5E6B82', lineHeight: '1.5' }}>
              <div>
                <strong style={{ color: '#334155', display: 'block', marginBottom: '6px' }}>Terms & Conditions:</strong>
                1. All rates quoted are in Indian Rupees (INR) and include GST, unless specified.<br />
                2. Payment to be cleared as per credit ledger accounts terms.<br />
                3. Delivery schedules are subjects to immediate production prioritisation clearances.<br />
                4. This estimation is automatically system generated and requires no physical seal stamp signature.
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '80px' }}>
                <div>
                  <span style={{ display: 'block', color: '#8893A7', fontStyle: 'italic', marginBottom: '30px' }}>Authorized Digital Stamp</span>
                  <strong style={{ color: '#334155', textTransform: 'uppercase' }}>HIMALAYA ENTERPRISES</strong>
                </div>
              </div>
            </div>

            {/* Action Panel */}
            <div style={{ display: 'flex', gap: '12px', borderTop: '2px solid #f1f5f9', paddingTop: '24px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { window.print(); }}
                style={{ background: '#24345C', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Print Quotation
              </button>
              <button
                type="button"
                onClick={() => { showToast(`Proposal quotation successfully sent to customer's registration email!`); }}
                style={{ background: '#0ea5e9', color: '#000000', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Email Proposal
              </button>
              <button
                type="button"
                onClick={() => setPreviewQuotation(null)}
                style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #475569', padding: '10px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trace Timeline Drawer (Observability Panel) */}
      <div
        id="traceTimelineDrawer"
        style={{
          position: 'fixed',
          top: 0,
          right: selectedTraceId ? 0 : '-420px',
          width: '400px',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.98)',
          backdropFilter: 'blur(16px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: selectedTraceId ? '-20px 0 50px rgba(0,0,0,0.5)' : 'none',
          zIndex: 3000,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          color: '#ffffff',
          overflow: 'hidden'
        }}
      >
        {/* Drawer Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Trace Observability
            </span>
            <button
              onClick={() => setSelectedTraceId(null)}
              style={{ background: 'transparent', border: 'none', color: '#8893A7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#F5FAFE' }}>
            Causal Trace Pipeline
          </h3>
          {selectedTraceId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 10px', borderRadius: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#D6E2F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                ID: {selectedTraceId}
              </span>
              <button
                onClick={() => { navigator.clipboard.writeText(selectedTraceId); showToast('Copied Trace ID!'); }}
                style={{ background: 'rgba(99,102,241,0.15)', border: 'none', color: '#818cf8', cursor: 'pointer', padding: '3px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: '800' }}
              >
                COPY
              </button>
            </div>
          )}
        </div>

        {/* Drawer Body (Timeline stream) */}
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {traceSequence.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px', color: '#8893A7' }}>
              <Activity size={32} strokeWidth={1.5} />
              <span style={{ fontSize: '12px' }}>No matching trace nodes found in memory.</span>
            </div>
          ) : (
            traceSequence.map((step, idx) => {
              const isEvent = step.type === 'event';
              const dotColor = isEvent ? '#6366f1' : '#10b981';
              return (
                <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  {/* Connector Line */}
                  {idx < traceSequence.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: '8px',
                      top: '16px',
                      bottom: '-16px',
                      width: '2px',
                      background: 'rgba(255, 255, 255, 0.08)'
                    }} />
                  )}

                  {/* Node Circle */}
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: `3px solid ${dotColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    marginTop: '2px',
                    flexShrink: 0
                  }} />

                  {/* Step details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: isEvent ? '#D6E2F0' : '#a7f3d0' }}>
                        {step.title}
                      </span>
                      {idx > 0 && (
                        <span style={{ fontSize: '9px', fontWeight: '800', background: 'rgba(255,255,255,0.06)', color: '#8893A7', padding: '1px 5px', borderRadius: '4px' }}>
                          +{step.duration}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: '#8893A7', margin: '4px 0' }}>
                      {step.detail}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9.5px', color: '#5E6B82' }}>
                      <span>Status: {step.status}</span>
                      <span>{step.timeStr}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {traceSequence.length > 1 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', color: '#8893A7', fontWeight: '600' }}>
              Total Traversal Latency:
            </span>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#6366f1' }}>
              {(() => {
                const first = traceSequence[0]?.timestamp || 0;
                const last = traceSequence[traceSequence.length - 1]?.timestamp || 0;
                const total = last - first;
                return total >= 0 ? `${total}ms` : '0ms';
              })()}
            </span>
          </div>
        )}
      </div>
      <ConfirmDialogComponent />
    </div>
    </SuperAdminFilterProvider>
  );
}




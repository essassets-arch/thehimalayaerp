'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useRouter, usePathname, useParams, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { useERP, useSalesBackend } from '../../../shared/context/ERPContext';
import { useERPStore } from '@/store/erpStore';
import { selectPlantHeadIncomingOrders, selectPlantHeadPlanningOrders } from '@/store/domains/sales/salesSelectors';
import { STATUS } from '../../../shared/constants';
import { useAuth } from '../../../shared/context/AuthContext';
import { productionService } from '../../../services/production.service';
import { productService } from '../../../services/product.service';
import { apiClient } from '../../../lib/apiClient';
import { backendFetch } from '../../../lib/backendFetch';
import { hasPermission } from '../../../services/permissions/permissionService';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import { ChevronLeft, ChevronRight, Search, Download, Edit3, Trash2, Box, Package, Plus, ShieldAlert, ArrowRight, X, User, BarChart2, Activity, Settings, Truck, ClipboardList, CheckCircle2, Clock, Upload, ArrowLeft, ClipboardCheck, AlertTriangle, Pencil, Layers, BarChart3, TrendingUp, Percent, AlertCircle, AlertOctagon, Loader2, FileText, DollarSign, RefreshCw, ShieldCheck } from 'lucide-react';
import ProductMasterUI from '../../../shared/components/ProductMasterUI';
import OrderDetailsModal from '../../../shared/components/OrderDetailsModal';
import { ComposedChart, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ResponsiveChartWrapper from '../../../shared/components/ResponsiveChartWrapper';
import { exportExecutiveReportPDF } from '../../../services/export.service';
import O2PWorkflowBanner from '../../../shared/components/O2PWorkflowBanner';
import ReplacementsView from './ReplacementsView';
import ReturnsView from './ReturnsView';
import { PlantHeadDashboard } from './PlantHeadDashboard';
import { PlantHeadProductionAnalytics } from './PlantHeadProductionAnalytics';
import { PlantHeadMaterialAnalytics } from './PlantHeadMaterialAnalytics';
import { PlantHeadDepartmentOverview } from './PlantHeadDepartmentOverview';
import { PlantHeadExecutiveReports } from './PlantHeadExecutiveReports';
import PlantHeadMaterialApprovalView from '../../../components/material-workflow/PlantHeadMaterialApprovalView';
import MaterialIndentApproval from '../../procurement/plant-head/MaterialIndentApproval';
import { SEEDED_INVENTORY_ITEMS } from '../../../shared/data/inventoryMasterData';
import { useO2PWorkflow } from '../../../shared/hooks/useO2PWorkflow';
import PlantHeadCommandDashboard from '../../../components/PlantHeadCommandDashboard';
import ModulePlaceholder from '../../../components/common/ModulePlaceholder';
import { isPlanningHistoryOrder, normalizeStatus } from '@/store/domains/shared/workflowUtils';
import { useMaterialRequests } from '../../../hooks/useMaterialRequests';

const isMaterialMatch = (invName, reqName) => {
  const inv = (invName || '').toLowerCase();
  const req = (reqName || '').toLowerCase();
  if (inv === req) return true;
  if (inv.includes(req) || req.includes(inv)) return true;
  if (req === 'cement' && inv.includes('cement')) return true;
  if (req === 'sand' && inv.includes('sand')) return true;
  if (req === 'aggregate' && inv.includes('aggregate')) return true;
  return false;
};

const findInventoryItem = (inventory, name) => {
  return (inventory || []).find(inv => isMaterialMatch(inv.material, name));
};

const normalizeIncomingOrder = (order, sourceQuotation) => {
  const rawItems = Array.isArray(order?.detailedItems) && order.detailedItems.length
    ? order.detailedItems
    : (Array.isArray(order?.items) && order.items.length ? order.items : (sourceQuotation?.detailedItems || []));
  const detailedItems = rawItems.map((item) => ({
    ...item,
    productName: item.productName || item.product_name || item.name || 'Item',
    productDetails: item.productDetails || item.product_details || item.description || '',
    quantity: Number(item.quantity ?? item.orderedQuantity ?? item.qty ?? 0),
    unitPrice: Number(item.unitPrice ?? item.price ?? item.rate ?? 0),
    discount: Number(item.discount ?? item.discount_percent ?? 0),
    tax: Number(item.tax ?? item.gst_rate ?? 0)
  }));
  const calculatedTotal = detailedItems.reduce((sum, item) => {
    const subtotal = item.quantity * item.unitPrice;
    const discounted = subtotal - (subtotal * item.discount / 100);
    return sum + discounted + (discounted * item.tax / 100);
  }, 0);
  const productNames = detailedItems.map((item) => item.productName).filter(Boolean).join(', ');
  const workflowStatus = String(
    order.workflowStateCode || order.status || order.workflowStatus || order.workflow_status || ''
  ).toUpperCase();
  const planningStatusByWorkflow = {
    SENT_TO_PLANT: 'PENDING_ACCEPTANCE',
    SENT_TO_PLANT_HEAD: 'PENDING_ACCEPTANCE',
    PLANT_APPROVED: 'PLANT_HEAD_ACCEPTED',
    READY_FOR_PRODUCTION: 'PRODUCTION_PLANNED',
    IN_PRODUCTION: 'PRODUCTION_PLANNED',
  };

  return {
    ...order,
    orderNo: order.orderNo || order.orderId || order.orderNumber || order.order_no || order.public_id || order.id,
    customerName: order.customerName || order.customer_name || order.customer?.name || sourceQuotation?.customerName || sourceQuotation?.customer_name || '',
    detailedItems,
    products: order.products || order.productItem || order.product_name || productNames,
    quantity: Number(order.quantity ?? detailedItems.reduce((sum, item) => sum + item.quantity, 0)),
    grandTotal: Number(order.grandTotal ?? order.grand_total ?? order.totalAmount ?? order.total_amount ?? order.totalValue ?? sourceQuotation?.grandTotal ?? sourceQuotation?.totalAmount ?? calculatedTotal),
    totalAmount: Number(order.totalAmount ?? order.total_amount ?? order.grandTotal ?? order.grand_total ?? order.totalValue ?? sourceQuotation?.totalAmount ?? sourceQuotation?.grandTotal ?? calculatedTotal),
    deliveryAddress: order.deliveryAddress || order.delivery_address || order.shippingAddress || order.shipping_address || sourceQuotation?.deliveryAddress || sourceQuotation?.delivery_address || '',
    deliveryDate: order.deliveryDate || order.delivery_date || order.expectedDeliveryDate || order.expected_delivery_date || order.validTill || sourceQuotation?.deliveryDate || sourceQuotation?.validTill || '',
    workflowStatus,
    status: workflowStatus,
    planningStatus: order.planningStatus || planningStatusByWorkflow[workflowStatus],
    productionPlanId: order.productionPlanId || order.production_plan_id || null,
    productionStatus: order.productionStatus || order.production_status || null
  };
};

export default function PlantHeadPortal() {
  const pathname = usePathname();
  const params = useParams();
  const pathSlug = pathname ? pathname.split('/').filter(Boolean) : [];
  let view = params?.slug?.[0] || (pathSlug.length > 1 ? pathSlug[pathSlug.length - 1] : 'dashboard') || 'dashboard';
  if (view === 'plant-head') view = 'dashboard';
  if (view === 'products' || view === 'products-add' || view === 'products-edit') {
    view = 'raw-inventory';
  }
  const productId = params?.slug?.[1]; const materialName = params?.slug?.[1];
  const location = { pathname: pathname || '', search: "" };
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const orderNoParam = searchParams.get('orderNo');

  const { state, dispatch, syncData } = useERP();
  const { data: persistedMaterialRequests = [] } = useMaterialRequests();
  const { salesOrders: backendSalesOrders, loadSalesOrders } = useSalesBackend();
  const { user } = useAuth();
  const canReadSalesOrders = hasPermission(user, 'sales.orders.read');
  const showToast = useNotificationStore(s => s.showToast);
  const globalSearch = useSearchStore(s => s.globalSearch);
  const o2p = useO2PWorkflow();



  // ─── ⭐ NEW EXECUTIVE VISIBILITY STATE ───
  const [globalDateFilter, setGlobalDateFilter] = useState('This Month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Page-specific drilldown filters
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [machineFilter, setMachineFilter] = useState('All');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [materialFilter, setMaterialFilter] = useState('All');
  const [bottleneckFilter, setBottleneckFilter] = useState('All');

  const [dashboardData, setDashboardData] = useState(null);
  const [productionAnalyticsData, setProductionAnalyticsData] = useState(null);
  const [materialAnalyticsData, setMaterialAnalyticsData] = useState(null);
  const [departmentOverviewData, setDepartmentOverviewData] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const [aiReportData, setAiReportData] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportDateFilter, setReportDateFilter] = useState('Today');
  const [reportCustomStart, setReportCustomStart] = useState('');
  const [reportCustomEnd, setReportCustomEnd] = useState('');

  const currentView = useMemo(() => {
    if (view) return view;
    if (location.pathname.endsWith('/products/add')) return 'products-add';
    if (location.pathname.includes('/products/edit/')) return 'products-edit';
    if (location.pathname.endsWith('/add-material')) return 'add-material';
    if (location.pathname.includes('/edit-material/')) return 'edit-material';
    return '';
  }, [view, location.pathname]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoadingAnalytics(true);
      try {
        const query = `?filter=${globalDateFilter}&customStart=${customStartDate}&customEnd=${customEndDate}`;
        
        const [dbRes, prodRes, matRes, deptRes] = await Promise.all([
          apiClient.get(`/plant-head/dashboard-data${query}`),
          apiClient.get(`/plant-head/analytics/production${query}`),
          apiClient.get(`/plant-head/analytics/material${query}`),
          apiClient.get(`/plant-head/overview/departments`)
        ]);

        if (dbRes.success) setDashboardData(dbRes.data);
        if (prodRes.success) setProductionAnalyticsData(prodRes.data);
        if (matRes.success) setMaterialAnalyticsData(matRes.data);
        if (deptRes.success) setDepartmentOverviewData(deptRes.data);
      } catch (err) {
        console.error("Error fetching plant head analytics:", err);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [globalDateFilter, customStartDate, customEndDate]);

  useEffect(() => {
    if (currentView === 'executive-reports') {
      const fetchReport = async () => {
        setIsGeneratingReport(true);
        try {
          const res = await apiClient.post('/plant-head/reports/generate-ai', {
            filter: reportDateFilter,
            customStart: reportCustomStart,
            customEnd: reportCustomEnd
          });
          if (res.success) {
            setAiReportData(res.data);
          }
        } catch (err) {
          console.error("Error generating AI report:", err);
        } finally {
          setIsGeneratingReport(false);
        }
      };
      fetchReport();
    }
  }, [currentView, reportDateFilter, reportCustomStart, reportCustomEnd]);

  const incomingOrders = useERPStore(selectPlantHeadIncomingOrders) || [];
  const storePlanningOrders = useERPStore(selectPlantHeadPlanningOrders) || [];
  const salesOrdersStore = useERPStore(s => s.state?.sales?.orders) || [];
  const canonicalWorkOrders = useERPStore(s => s.state?.production?.workOrders) || [];
  const [directBackendOrders, setDirectBackendOrders] = useState([]);
  const [directRawInventory, setDirectRawInventory] = useState([]);
  const [directFinishedGoods, setDirectFinishedGoods] = useState([]);
  const [directQCFailures, setDirectQCFailures] = useState([]);

  useEffect(() => {
    if (currentView === 'raw-inventory') {
      backendFetch('/api/backend/inventory/stock-levels').then(res => {
        const catalog = useERPStore.getState().state?.productCatalog || [];
        const formatted = (res || []).map(r => {
          const product = catalog.find(p => p.id === r.productId);
          return {
            id: r.productId,
            material: product ? product.name : r.productId,
            stock: r.quantity || 0,
            unit: product?.unit || 'Kg'
          };
        });
        setDirectRawInventory(formatted);
      }).catch(console.error);
    } else if (currentView === 'finished-goods') {
      backendFetch('/api/backend/production/finished-goods').then(res => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setDirectFinishedGoods(list);
      }).catch(console.error);
    } else if (currentView === 'qc-failures') {
      backendFetch('/api/backend/qc/inspections').then(res => {
        setDirectQCFailures(res || []);
      }).catch(console.error);
    }
  }, [currentView]);

  useEffect(() => {
    if (canReadSalesOrders && (currentView === 'incoming-orders' || currentView === 'planning')) {
      void loadSalesOrders();
    } else if (!canReadSalesOrders) {
      setDirectBackendOrders([]);
    }
  }, [canReadSalesOrders, currentView, loadSalesOrders]);

  const orders = useMemo(() => [...directBackendOrders, ...(backendSalesOrders || []), ...salesOrdersStore]
    .filter((order, index, all) =>
      index === all.findIndex(candidate => String(candidate.id || candidate.orderNo) === String(order.id || order.orderNo))
    )
    .map((order) => {
    const quotationRef = order.quotationId || order.quotation_id || order.source_quotation_ref || order.quotationRef;
    const sourceQuotation = (state.sales?.quotations || []).find((quotation) =>
      String(quotation.id) === String(quotationRef) || String(quotation.quotationNo) === String(quotationRef)
    );
    return normalizeIncomingOrder(order, sourceQuotation);
  }), [directBackendOrders, backendSalesOrders, salesOrdersStore, state.sales?.quotations]);
  const mRequests = persistedMaterialRequests;

  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [selectedOrderForPlanning, setSelectedOrderForPlanning] = useState(null);
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isPlanningSubmitting, setIsPlanningSubmitting] = useState(false);
  const planningSubmitLock = useRef(false);

  const [overrideQty, setOverrideQty] = useState({});
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  const [planningOrders, setPlanningOrders] = useState([]);
  const [planningLoading, setPlanningLoading] = useState(false);

  const fetchPlanningOrders = async () => {
    setPlanningLoading(true);
    try {
      const result = await backendFetch('/api/backend/production/plans');
      setPlanningOrders(Array.isArray(result) ? result : result?.data || []);
    } catch (err) {
      console.error('Failed to fetch planning orders', err);
      setPlanningOrders([]);
    } finally {
      setPlanningLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'planning') fetchPlanningOrders();
  }, [currentView]);

  // ── FILTER STATE ──
  const [incomingSearch, setIncomingSearch] = useState('');
  const [incomingStatusFilter, setIncomingStatusFilter] = useState('All');
  const [planningSearch, setPlanningSearch] = useState('');
  const [planningStatusFilter, setPlanningStatusFilter] = useState('All');
  const [planningPriorityFilter, setPlanningPriorityFilter] = useState('All');
  const [planningViewTab, setPlanningViewTab] = useState('pending');
  const [replacementRequests, setReplacementRequests] = useState([]);
  const [replacementLoading, setReplacementLoading] = useState(false);

  // ── MATERIAL INDENTS STATE ──
  const [directMaterialIndents, setDirectMaterialIndents] = useState([]);
  const [indentsLoading, setIndentsLoading] = useState(false);
  const [indentSearch, setIndentSearch] = useState('');
  const [indentStatusFilter, setIndentStatusFilter] = useState('PENDING');
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [indentDetailModal, setIndentDetailModal] = useState(false);
  const EMPTY_INDENTS = useMemo(() => [], []);
  const materialIndents = useERPStore(s => s.procurement?.materialIndents ?? s.state?.procurement?.materialIndents ?? s.materialIndents ?? s.state?.materialIndents ?? EMPTY_INDENTS);
  const approveMaterialIndent = useERPStore(s => s.approveMaterialIndent);
  const returnMaterialIndent = useERPStore(s => s.returnMaterialIndent);
  const rejectMaterialIndent = useERPStore(s => s.rejectMaterialIndent);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchMaterialIndents = async () => {
    setIndentsLoading(true);
    try {
      const res = await apiClient.get('/procurement/plant-head/material-indents');
      setDirectMaterialIndents(res.data || []);
    } catch (err) {
      console.error('Failed to fetch indents', err);
    } finally {
      setIndentsLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'material-indents') {
      fetchMaterialIndents();
    }
  }, [currentView]);

  useEffect(() => {
    // Direct store sync is reactive, no-op needed here
  }, [currentView]);

  const handleApproveIndent = async (indent) => {
    // Normalize: erpStore indents use flat {material, quantity} while API uses {items:[]}
    const lineItems = indent.items?.length
      ? indent.items
      : [{ material: indent.material || 'Material', quantity: indent.quantity || 0, unit: indent.unit || '' }];

    // Build editable items rows as HTML
    const itemsHtml = lineItems.map((item, i) => `
      <tr>
        <td style="padding:6px 8px; font-size:12px;">${item.material || item.name || 'Item'}</td>
        <td style="padding:6px 8px; font-size:12px; text-align:center;">${item.quantity_ordered ?? item.quantity ?? 0} ${item.unit || ''}</td>
        <td style="padding:6px 8px;">
          <input id="item-qty-${i}" type="number" min="0.01" step="0.01"
            value="${item.quantity_ordered ?? item.quantity ?? 0}"
            class="swal2-input" style="margin:0; width:90px; padding:4px 8px;" />
        </td>
      </tr>
    `).join('');

    const { value } = await Swal.fire({
      title: `Approve Indent — ${indent.id}`,
      width: 640,
      html: `
        <div style="text-align:left; font-size:13px;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px 16px; margin-bottom:14px; background:#F5FAFE; padding:12px; border-radius:8px;">
            <div><strong>Priority:</strong> ${indent.priority || 'Normal'}</div>
            <div><strong>Indent ID:</strong> <span style="font-family:monospace">${indent.id}</span></div>
            <div style="grid-column:span 2"><strong>Reason:</strong> ${indent.reason || indent.notes || '—'}</div>
            <div style="grid-column:span 2"><strong>Required Date:</strong> ${indent.requiredDate || indent.expectedDate || '—'}</div>
          </div>
          <p style="font-weight:800; margin:0 0 6px;">Review & Adjust Quantities Before Approval</p>
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead><tr style="background:#f1f5f9;">
              <th style="padding:6px 8px; text-align:left;">Material</th>
              <th style="padding:6px 8px; text-align:center;">Requested</th>
              <th style="padding:6px 8px; text-align:left;">Approve Qty</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <label style="font-weight:800; display:block; margin:14px 0 4px;">Approval Remarks (optional)</label>
          <textarea id="indent-approve-remarks" style="width:100%; min-height:60px; border:1px solid #D6E2F0; border-radius:8px; padding:8px; font-size:13px;"></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✓ Approve & Send to Finance',
      confirmButtonColor: '#22c55e',
      preConfirm: () => {
        const approvedItems = lineItems.map((item, i) => ({
          ...item,
          quantity_ordered: Number(document.getElementById(`item-qty-${i}`)?.value) || item.quantity_ordered || item.quantity || 0
        }));
        const remarks = document.getElementById('indent-approve-remarks')?.value?.trim();
        return { approvedItems, remarks };
      }
    });
    if (!value) return;
    approvePurchaseIndent(indent.id, value.remarks || 'Approved by Plant Head');
    apiClient.patch(`/plant-head/material-indents/${indent.id}/approve`, {
      items: value.approvedItems, remarks: value.remarks
    }).catch(() => {});
    showToast?.('Indent approved and sent to Finance.');
    fetchMaterialIndents();
  };

  const handleRejectIndentClick = async (indent) => {
    const { value: remarks } = await Swal.fire({
      title: `Reject Indent — ${indent.id}`,
      input: 'textarea',
      inputLabel: 'Reason for rejection *',
      inputPlaceholder: 'Enter reason...',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      confirmButtonColor: '#ef4444',
      inputValidator: (v) => !v?.trim() ? 'A reason is required.' : undefined
    });
    if (!remarks) return;
    rejectMaterialIndent(indent.id, remarks);
    apiClient.patch(`/plant-head/material-indents/${indent.id}/reject`, { remarks }).catch(() => {});
    showToast?.('Indent rejected.');
  };

  const handleReturnForCorrectionClick = async (indent) => {
    const { value: remarks } = await Swal.fire({
      title: `Return Indent for Correction — ${indent.id}`,
      input: 'textarea',
      inputLabel: 'Reason/Correction remarks *',
      inputPlaceholder: 'Enter instructions for correction...',
      showCancelButton: true,
      confirmButtonText: 'Return',
      confirmButtonColor: '#d97706',
      inputValidator: (v) => !v?.trim() ? 'A reason is required.' : undefined
    });
    if (!remarks) return;
    returnMaterialIndent(indent.id, remarks);
    apiClient.patch(`/plant-head/material-indents/${indent.id}/return`, { remarks }).catch(() => {});
    showToast?.('Indent returned for correction.');
  };

  const fetchReplacementRequests = async () => {
    setReplacementLoading(true);
    try {
      const res = await apiClient.get('/replacements');
      setReplacementRequests(res.data || []);
    } catch (err) {
      console.error('Failed to fetch replacement requests', err);
      showToast?.('Failed to load replacement requests.');
    } finally {
      setReplacementLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'replacements') fetchReplacementRequests();
  }, [currentView]);
  const [materialSearch, setMaterialSearch] = useState('');
  const [materialStatusFilter, setMaterialStatusFilter] = useState('REQUESTED');

  // ── RAW INVENTORY STATE ──
  const [matCode, setMatCode] = useState('');
  const [matName, setMatName] = useState('');
  const [matCategory, setMatCategory] = useState('');
  const [matUnit, setMatUnit] = useState('Kg');
  const [matMinStock, setMatMinStock] = useState('');
  const [matRate, setMatRate] = useState('');
  const [matDescription, setMatDescription] = useState('');

  // Edit Material Form fields
  const [editMatId, setEditMatId] = useState('');
  const [editMatCode, setEditMatCode] = useState('');
  const [editMatName, setEditMatName] = useState('');
  const [editMatCategory, setEditMatCategory] = useState('');
  const [editMatUnit, setEditMatUnit] = useState('Kg');
  const [editMatMinStock, setEditMatMinStock] = useState('');
  const [editMatRate, setEditMatRate] = useState('');
  const [editMatDescription, setEditMatDescription] = useState('');
  const [editMatOldName, setEditMatOldName] = useState('');

  // Local search filter
  const [rawSearchQuery, setRawSearchQuery] = useState('');

  // Raw Inventory Transaction & Drawer States
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [stockMatSelect, setStockMatSelect] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [stockRate, setStockRate] = useState('');
  const [stockSupplier, setStockSupplier] = useState('');
  const [stockRemarks, setStockRemarks] = useState('');
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  // ── PRODUCT CATALOG STATE ──
  const CATEGORIES = ['All', 'Mechanical', 'Structural', 'Fasteners', 'Construction', 'Electrical', 'Other'];
  const UNITS = ['Set', 'Batch', 'Lot', 'Piece', 'Kg', 'Ton', 'Unit'];
  const EMPTY_FORM = { name: '', category: 'Mechanical', price: '', stock: '', unit: 'Set', description: '', image: '', status: 'active' };

  const [productSearch, setProductSearch]     = useState('');
  const [productCategory, setProductCategory] = useState('All');
  const [productPage, setProductPage]         = useState(1);
  const PRODUCTS_PER_PAGE = 10;

  const [selectedProducts, setSelectedProducts] = useState([]);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct]     = useState(null); // null = Add, obj = Edit
  const [productForm, setProductForm]           = useState(EMPTY_FORM);
  const [formError, setFormError]               = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync product catalog form state with dynamic page routes (add/edit)
  useEffect(() => {
    if (currentView === 'products-edit' && productId && state.productCatalog) {
      const match = state.productCatalog.find(p => p && p.id === productId);
      if (match) {
        setEditingProduct(match);
        setProductForm({
          name: match.name || '',
          category: match.category || 'Mechanical',
          price: match.price !== undefined && match.price !== null ? String(match.price) : '',
          stock: match.stock !== undefined && match.stock !== null ? String(match.stock) : '',
          unit: match.unit || 'Set',
          description: match.description || '',
          image: match.image || '',
          status: match.status || 'active'
        });
      }
    } else if (currentView === 'products-add') {
      setEditingProduct(null);
      setProductForm(EMPTY_FORM);
      setFormError('');
    }
  }, [currentView, productId, state.productCatalog]);

  // Load material details when editing
  useEffect(() => {
    if (currentView === 'edit-material' && materialName) {
      const decodedName = decodeURIComponent(materialName);
      const list = getMappedInventory(state.rawInventory || []);
      const item = list.find(i => (i.material || '').toLowerCase() === decodedName.toLowerCase());
      if (item) {
        setEditMatId(item.id);
        setEditMatCode(item.code);
        setEditMatName(item.material);
        setEditMatCategory(item.category);
        setEditMatUnit(item.unit);
        setEditMatMinStock(item.reorderLevel);
        setEditMatRate(item.rate);
        setEditMatDescription(item.description);
        setEditMatOldName(item.material);
      }
    }
  }, [currentView, materialName, state.rawInventory]);

  // Auto-suggest planning target completion date (today + 7 days) and auto-open modal if orderNoParam is set
  useEffect(() => {
    if (orderNoParam && orders.length > 0) {
      const match = orders.find(o => o.orderNo === orderNoParam);
      if (match) {
        setSelectedOrderForPlanning(match);
        setShowPlanningModal(true);
        if (!targetDate) {
          const d = new Date();
          d.setDate(d.getDate() + 7);
          setTargetDate(d.toISOString().split('T')[0]);
        }
      }
    }
  }, [orderNoParam, orders, targetDate]);

  const handlePlanningSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderForPlanning || planningSubmitLock.current) return;
    if (!targetDate) {
      showToast('Please select a Target Date.');
      return;
    }
    planningSubmitLock.current = true;
    setIsPlanningSubmitting(true);

    Swal.fire({
      title: 'Send Order to Production?',
      text: `Set ${targetDate} as the target date for Order #${selectedOrderForPlanning.orderNo} and release its work order to Production?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Send to Production',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        showToast("Plant Head: Logging planning metrics and scheduling order...");
          try {
            const isBackendOrder = Boolean(
              directBackendOrders.some(order => order.id === selectedOrderForPlanning.id) ||
              (backendSalesOrders || []).some(order => order.id === selectedOrderForPlanning.id)
            );

            if (isBackendOrder) {
              let latestOrder = await backendFetch(
                `/api/backend/sales/orders/${selectedOrderForPlanning.id}`
              );
              let orderStatus = String(
                latestOrder.workflowStateCode || latestOrder.status || ''
              ).toUpperCase();

              if (['SENT_TO_PLANT', 'SENT_TO_PLANT_HEAD'].includes(orderStatus)) {
                await backendFetch(`/api/backend/sales/orders/${selectedOrderForPlanning.id}/action`, {
                  method: 'POST',
                  body: { action: 'PLANT_APPROVE', remarks: 'Accepted during production planning' },
                });
                latestOrder = await backendFetch(
                  `/api/backend/sales/orders/${selectedOrderForPlanning.id}`
                );
                orderStatus = String(
                  latestOrder.workflowStateCode || latestOrder.status || ''
                ).toUpperCase();
              }

              let productionPlan = planningOrders.find(plan =>
                plan.id === selectedOrderForPlanning.productionPlanId ||
                plan.salesOrderId === selectedOrderForPlanning.id
              );
              if (!productionPlan) {
                productionPlan = await backendFetch('/api/backend/production/plans', {
                  method: 'POST',
                  body: {
                    salesOrderId: selectedOrderForPlanning.id,
                    plannedEndDate: targetDate,
                  },
                });
              }

              await backendFetch(`/api/backend/production/plans/${productionPlan.id}`, {
                method: 'PATCH',
                body: {
                  plannedStartDate: new Date().toISOString().split('T')[0],
                  plannedEndDate: targetDate,
                },
              });

              if (orderStatus === 'PLANT_APPROVED') {
                try {
                  await backendFetch(`/api/backend/sales/orders/${selectedOrderForPlanning.id}/action`, {
                    method: 'POST',
                    body: { action: 'PLAN_PRODUCTION', remarks: `Target date: ${targetDate}; priority: ${priority}` },
                  });
                } catch (transitionError) {
                  latestOrder = await backendFetch(
                    `/api/backend/sales/orders/${selectedOrderForPlanning.id}`
                  );
                  const refreshedStatus = String(
                    latestOrder.workflowStateCode || latestOrder.status || ''
                  ).toUpperCase();
                  if (!['READY_FOR_PRODUCTION', 'IN_PRODUCTION'].includes(refreshedStatus)) {
                    throw transitionError;
                  }
                }
              }

              let latestPlan = await backendFetch(
                `/api/backend/production/plans/${productionPlan.id}`
              );
              let planState = String(
                latestPlan.workflowState?.code || latestPlan.status || 'DRAFT'
              ).toUpperCase();
              if (['DRAFT', 'PENDING_PLANNING'].includes(planState)) {
                await backendFetch(`/api/backend/production/plans/${productionPlan.id}/action`, {
                  method: 'POST',
                  body: { action: 'SUBMIT', remarks: `Target date: ${targetDate}` },
                });
                latestPlan = await backendFetch(
                  `/api/backend/production/plans/${productionPlan.id}`
                );
                planState = String(
                  latestPlan.workflowState?.code || latestPlan.status
                ).toUpperCase();
              }
              if (planState === 'UNDER_REVIEW') {
                await backendFetch(`/api/backend/production/plans/${productionPlan.id}/action`, {
                  method: 'POST',
                  body: { action: 'APPROVE', remarks: 'Approved by Plant Head' },
                });
                latestPlan = await backendFetch(
                  `/api/backend/production/plans/${productionPlan.id}`
                );
                planState = String(
                  latestPlan.workflowState?.code || latestPlan.status
                ).toUpperCase();
              }
              if (planState === 'APPROVED') {
                await backendFetch(`/api/backend/production/plans/${productionPlan.id}/action`, {
                  method: 'POST',
                  body: { action: 'RELEASE', remarks: 'Released to Production' },
                });
              }
            } else {
              if (selectedOrderForPlanning.planningStatus === 'PENDING_ACCEPTANCE' || selectedOrderForPlanning.commercialStatus === 'SENT_TO_PLANT_HEAD') {
                useERPStore.getState().acceptOrderByPlantHead(selectedOrderForPlanning.id, { remarks: 'Auto-accepted during production planning' }, user?.name || 'Plant Head');
              }
              useERPStore.getState().planOrder(selectedOrderForPlanning.id, { targetProductionDate: targetDate, priority }, user?.name || 'Plant Head');
              useERPStore.getState().activateWorkOrder(selectedOrderForPlanning.id, user?.name || 'Plant Head');
            }
            
            await syncData();
            await fetchPlanningOrders();
            await loadSalesOrders();
            showToast(`Order ${selectedOrderForPlanning.orderNo || selectedOrderForPlanning.orderNumber} sent to Production.`);
            setShowPlanningModal(false);
            setSelectedOrderForPlanning(null);
            setTargetDate('');
            if (orderNoParam) {
              navigate.push('/plant-head/planning');
            }
          } catch (err) {
            Swal.fire({ icon: 'error', title: 'Planning Failed', text: err.message });
          } finally {
            planningSubmitLock.current = false;
            setIsPlanningSubmitting(false);
          }
      } else {
        planningSubmitLock.current = false;
        setIsPlanningSubmitting(false);
      }
    });
  };

  const handleOverrideChange = (reqId, val) => {
    setOverrideQty(prev => ({ ...prev, [reqId]: val }));
  };

  const handleMaterialApproval = (orderNo, reqs, isApproved) => {
    const isDailyAdhoc = orderNo === 'DAILY-STOCK';

    // Build overriding map
    const targetQtyOverrides = {};
    reqs.forEach(r => {
      if (r.materials && r.materials.length > 0) {
        r.materials.forEach(m => {
          const key = `${r.id}-${m.materialName}`;
          const val = overrideQty[key] !== undefined ? overrideQty[key] : m.quantityRequested;
          targetQtyOverrides[key] = Number(val);
        });
      } else {
        const val = overrideQty[r.id] !== undefined ? overrideQty[r.id] : r.quantityRequested || 0;
        targetQtyOverrides[r.id] = Number(val);
      }
    });

    Swal.fire({
      title: isApproved ? 'Approve Material Release?' : 'Reject Material Request?',
      text: isApproved 
        ? `Are you sure you want to approve releasing materials for ${isDailyAdhoc ? 'Daily Stock' : `Order #${orderNo}`}?`
        : `Are you sure you want to reject the materials request for ${isDailyAdhoc ? 'Daily Stock' : `Order #${orderNo}`}?`,
      icon: isApproved ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonText: isApproved ? 'Yes, Approve Release' : 'Yes, Reject Request',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          showToast("Plant Head: Signing authorization for material release...");
          let success = true;
          let errMsg = '';
          
          for (const req of reqs) {
            const requestQtyOverrides = {};
            if (req.materials && req.materials.length > 0) {
              req.materials.forEach(m => {
                const key = `${req.id}-${m.materialName}`;
                const val = overrideQty[key] !== undefined ? overrideQty[key] : m.quantityRequested;
                requestQtyOverrides[m.materialName] = Number(val);
              });
            } else {
              const val = overrideQty[req.id] !== undefined ? overrideQty[req.id] : req.quantityRequested || 0;
              requestQtyOverrides[req.materialName || 'unknown'] = Number(val);
            }

            const res = await productionService.approveMaterialRequest(
              state,
              req,
              requestQtyOverrides,
              isApproved,
              dispatch,
              user
            );
            if (!res.success) {
              success = false;
              errMsg = res.error?.message || res.error || 'Server error';
            }
          }

          if (success) {
            await syncData();
            showToast(isApproved 
              ? `Approved materials for ${isDailyAdhoc ? 'Daily Stock' : `Order ${orderNo}`}.` 
              : `Rejected material request for ${isDailyAdhoc ? 'Daily Stock' : `Order ${orderNo}`}`
            );
          } else {
            Swal.fire({ 
              icon: 'error', 
              title: 'Authorization Blocked', 
              text: errMsg || 'Failed to approve one or more material requests.' 
            });
          }
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Approval Error',
            text: err.message || 'An error occurred during approval.'
          });
        }
      }
    });
  };

  const getMappedInventory = (rawInventoryList) => {
    const cleanList = (rawInventoryList || []).filter(item => {
      const code = (item.code || item.sku || item.id || '').toUpperCase();
      const name = (item.material || item.itemName || item.name || '').toLowerCase();
      if (code === 'RM001' || code.startsWith('SKU-') || code.includes('ITEM') || code.includes('ATP') || code.includes('NFW') || code.includes('HS')) return false;
      if (name.includes('shampoo') || name.includes('toothpaste') || name.includes('face wash')) return false;
      if (name.includes('sand fine grade') || name.includes('item (100 qty)') || name.includes('item (1 qty)')) return false;
      return true;
    });

    const sourceList = cleanList.length > 0
      ? cleanList
      : SEEDED_INVENTORY_ITEMS.map(item => ({
          id: item.code,
          code: item.code,
          material: item.itemName,
          category: item.category,
          unit: item.unit,
          stock: item.balance,
          reorderLevel: item.minStock,
          rate: 0,
        }));

    return sourceList.map((item, idx) => {
      return {
        id: item.id || item.code || `RM-ID-${idx + 1}`,
        srNo: item.srNo || idx + 1,
        code: item.code || `HCPPL${String(idx + 1).padStart(3, '0')}`,
        material: item.material || item.itemName,
        category: item.category || 'Hardware',
        unit: item.unit || 'PCS',
        stock: item.stock ?? item.balance ?? 0,
        rate: item.rate ?? 0,
        reorderLevel: item.reorderLevel ?? item.minStock ?? 10,
        minStock: item.minStock ?? item.reorderLevel ?? 10,
        description: item.description || `Item #${idx + 1}`,
        transactions: item.transactions || []
      };
    });
  };

  const handleAddMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!matCode || !matName || !matCategory) {
      showToast('Please fill in Code, Name and Category.');
      return;
    }

    const list = getMappedInventory(state.rawInventory || []);
    const exists = list.some(i => (i.material || '').toLowerCase() === matName.toLowerCase() || (i.code || '').toLowerCase() === matCode.toLowerCase());
    if (exists) {
      Swal.fire({
        icon: 'error',
        title: 'Duplicate Registry',
        text: `A material with name "${matName}" or code "${matCode}" already exists.`
      });
      return;
    }

    try {
      showToast('Registering material...');
      await apiClient.post('/store/raw-materials', {
        code: matCode,
        material: matName,
        category: matCategory,
        unit: matUnit,
        reorderLevel: Number(matMinStock) || 0,
        rate: Number(matRate) || 0,
        description: matDescription
      });
      await syncData();
      showToast(`Material "${matName}" added to registry.`);
    } catch (err) {
      dispatch({
        type: 'ADD_RAW_MATERIAL',
        payload: {
          code: matCode,
          material: matName,
          category: matCategory,
          unit: matUnit,
          reorderLevel: Number(matMinStock) || 0,
          rate: Number(matRate) || 0,
          description: matDescription
        }
      });
      showToast(`Material "${matName}" added (local). Note: ${err.message}`);
    }

    // Reset fields
    setMatCode('');
    setMatName('');
    setMatCategory('');
    setMatUnit('Kg');
    setMatMinStock('');
    setMatRate('');
    setMatDescription('');

    navigate.push('/plant-head/raw-inventory');
  };

  const handleEditMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!editMatCode || !editMatName || !editMatCategory) {
      showToast('Please fill in Code, Name and Category.');
      return;
    }

    try {
      showToast('Updating material...');
      await apiClient.put(`/store/raw-materials/${editMatId}`, {
        code: editMatCode,
        material: editMatName,
        category: editMatCategory,
        unit: editMatUnit,
        reorderLevel: Number(editMatMinStock) || 0,
        rate: Number(editMatRate) || 0,
        description: editMatDescription
      });
      await syncData();
      showToast(`Material registry "${editMatName}" updated.`);
    } catch (err) {
      dispatch({
        type: 'EDIT_RAW_MATERIAL',
        payload: {
          id: editMatId,
          code: editMatCode,
          material: editMatName,
          category: editMatCategory,
          unit: editMatUnit,
          reorderLevel: Number(editMatMinStock) || 0,
          rate: Number(editMatRate) || 0,
          description: editMatDescription,
          oldMaterial: editMatOldName
        }
      });
      showToast(`Material registry "${editMatName}" updated (local). Note: ${err.message}`);
    }

    navigate.push('/plant-head/raw-inventory');
  };

  const handleDeleteMaterial = async (item) => {
    if (item.transactions && item.transactions.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Deletion Blocked',
        text: `Cannot delete material "${item.material}" because it has active stock transaction history. Registry items with audit records cannot be deleted.`,
        customClass: {
          popup: 'swal-premium-popup',
          title: 'swal-premium-title',
          htmlContainer: 'swal-premium-text',
          confirmButton: 'swal-premium-confirm-btn'
        },
        buttonsStyling: false
      });
      return;
    }

    Swal.fire({
      title: 'Delete Material Registry?',
      text: `Are you sure you want to remove "${item.material}"? This action is permanent.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete Registry',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        htmlContainer: 'swal-premium-text',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/store/raw-materials/${item.id}`);
          await syncData();
          showToast(`Registry for "${item.material}" deleted successfully.`);
        } catch (err) {
          dispatch({
            type: 'DELETE_RAW_MATERIAL',
            payload: {
              id: item.id,
              material: item.material
            }
          });
          showToast(`Deleted (local). Note: ${err.message}`);
        }
      }
    });
  };

  const renderTimeframeHeader = (title, subtitle) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '850', color: 'var(--color-text-primary)', margin: 0 }}>{title}</h1>
          {subtitle && <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{subtitle}</p>}
        </div>
        
        {/* Date Filter Panel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Global Timeframe</span>
            <select
              value={globalDateFilter}
              onChange={(e) => setGlobalDateFilter(e.target.value)}
              style={{ background: 'var(--color-card-bg, #ffffff)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 16px', fontSize: '13.5px', fontWeight: 'bold', minWidth: '160px', outline: 'none' }}
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Year">This Year</option>
              <option value="Custom">Custom Date Range</option>
            </select>
          </div>

          {globalDateFilter === 'Custom' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Start Date</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={{ background: 'var(--color-card-bg, #ffffff)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '7px 12px', fontSize: '13px', fontWeight: '600' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>End Date</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={{ background: 'var(--color-card-bg, #ffffff)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '7px 12px', fontSize: '13px', fontWeight: '600' }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // ─── 1. EXECUTIVE DASHBOARD ───
  const renderDashboard = () => {
    if (isLoadingAnalytics || !dashboardData) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px' }}>
          <Loader2 className="animate-spin" size={36} color="var(--color-accent-teal, #337a86)" />
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: '600', fontSize: '14px' }}>Loading Command Center KPIs...</p>
        </div>
      );
    }

    const { production, dispatch, store, qc, financial } = dashboardData;
    const alerts = departmentOverviewData?.alerts || [];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Reusable Filter Header */}
        {renderTimeframeHeader("Executive Command Center", "Real-time factory-wide visibility and transaction tracking")}

        {/* Department Filter Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F5FAFE', padding: '12px 18px', borderRadius: '12px', border: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-secondary)' }}>Focus Department:</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Production', 'Dispatch', 'Store', 'QC'].map((dept) => (
              <button
                key={dept}
                onClick={() => setDepartmentFilter(dept)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '750',
                  border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'all 0.2s ease',
                  background: departmentFilter === dept ? 'var(--color-accent-teal, #337a86)' : '#ffffff',
                  color: departmentFilter === dept ? '#ffffff' : 'var(--color-text-secondary)'
                }}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* ── CRITICAL ALERTS BANNER ── */}
        {alerts.length > 0 && (
          <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertOctagon size={18} color="#ef4444" />
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Critical Operational Alerts ({alerts.length})</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
              {alerts.map((alert) => (
                <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--color-card-bg, #ffffff)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: alert.type === 'critical' ? '#ef4444' : '#f59e0b', flexShrink: 0 }} />
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <PlantHeadCommandDashboard
          state={state}
          dashboardData={dashboardData}
          productionAnalyticsData={productionAnalyticsData}
          departmentFilter={departmentFilter}
          navigate={navigate}
        />

        {/* Helper function to style cards based on Focus Department */}
        {(() => {
          const getCardStyle = (deptName, borderTopColor) => {
            const isSelected = departmentFilter === 'All' || departmentFilter.toLowerCase() === deptName.toLowerCase();
            return {
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              borderTop: `4px solid ${borderTopColor}`,
              opacity: isSelected ? 1 : 0.45,
              transform: isSelected ? 'none' : 'scale(0.98)',
              transition: 'all 0.25s ease-in-out',
              pointerEvents: isSelected ? 'auto' : 'none'
            };
          };

          return (
            <div className="plant-head-legacy-dashboard" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {/* 1. Production Status */}
              <div className="app-card" style={getCardStyle('Production', 'var(--color-primary, #2F4375)')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '850', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={16} color="var(--color-accent-teal)" /> Production Status
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Work Orders</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Planned</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#24345C', marginTop: '4px' }}>{production.planned}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Material Waiting</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#ea580c', marginTop: '4px' }}>{production.materialWaiting}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>In Production</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>{production.inProduction}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>QC Pending</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#eab308', marginTop: '4px' }}>{production.qcPending}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>QC Passed</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{production.qcPassed}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Completed Today</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{production.completedToday}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Delayed</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>{production.delayed}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Efficiency</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {production.efficiency}% <TrendingUp size={14} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Dispatch Status */}
              <div className="app-card" style={getCardStyle('Dispatch', '#3b82f6')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '850', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={16} color="#3b82f6" /> Dispatch Status
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Logistics</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Ready for Dispatch</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{dispatch.readyForDispatch}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Scheduled Today</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>{dispatch.scheduledToday}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Dispatched Today</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{dispatch.dispatchedToday}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Partial Dispatch</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#eab308', marginTop: '4px' }}>{dispatch.partialDispatch}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Pending Dispatch</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#24345C', marginTop: '4px' }}>{dispatch.pendingDispatch}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Delayed Dispatch</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>{dispatch.delayedDispatch}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px', gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Vehicles Running / Active</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#24345C', marginTop: '4px' }}>{dispatch.vehiclesRunning} Active Vehicles</div>
                  </div>
                </div>
              </div>

              {/* 3. Store Status */}
              <div className="app-card" style={getCardStyle('Store', '#f59e0b')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '850', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={16} color="#f59e0b" /> Store Status
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Raw Material</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px', gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Total Inventory Value</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#24345C', marginTop: '4px' }}>₹{(store.totalValue / 100000).toFixed(1)} Lakhs</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Low Stock Items</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#ea580c', marginTop: '4px' }}>{store.lowStockItems} Items</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Out of Stock</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>{store.outOfStock}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Requested Today</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>{store.materialRequestedToday}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Material Approved</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{store.materialApproved}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Material Issued</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{store.materialIssued}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Purchase Pending</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#24345C', marginTop: '4px' }}>{store.purchasePending}</div>
                  </div>
                </div>
              </div>

              {/* 4. QC Status */}
              <div className="app-card" style={getCardStyle('QC', '#10b981')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '850', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="#10b981" /> QC Status
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Inspections</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Inspected Today</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#24345C', marginTop: '4px' }}>{qc.inspectedToday}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Passed</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{qc.passed}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Failed</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>{qc.failed}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Rework Jobs</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#ea580c', marginTop: '4px' }}>{qc.rework}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Rejected</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>{qc.rejected}</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Pass Rate</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{qc.passRate}%</div>
                  </div>
                  <div style={{ background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px', gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>Rejection Rate</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>{qc.rejectionRate}%</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── VISUAL OPERATIONAL CHARTS ── */}
        <div className="plant-head-legacy-dashboard" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {/* QC Status Distribution Pie Chart */}
          <div className="app-card" style={{ display: 'flex', flexDirection: 'column', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <h3 className="card-heading">QC Inspection Quality Distribution</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flex: 1, flexWrap: 'wrap', gap: '20px', marginTop: '16px' }}>
              <div style={{ width: '200px', height: '200px' }}>
                <ResponsiveChartWrapper>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Passed', value: qc.passed || 0 },
                        { name: 'Failed', value: qc.failed || 0 },
                        { name: 'Rework', value: qc.rework || 0 },
                        { name: 'Rejected', value: qc.rejected || 0 }
                      ].filter(x => x.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill="#16a34a" />
                      <Cell fill="#dc2626" />
                      <Cell fill="#ea580c" />
                      <Cell fill="#7f1d1d" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveChartWrapper>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '160px' }}>
                {[
                  { label: 'Passed', val: qc.passed, color: '#16a34a', desc: 'Good stock' },
                  { label: 'Failed', val: qc.failed, color: '#dc2626', desc: 'QC failed' },
                  { label: 'Rework', val: qc.rework, color: '#ea580c', desc: 'Re-routing' },
                  { label: 'Rejected', val: qc.rejected, color: '#7f1d1d', desc: 'Scrapped' }
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                    <span style={{ fontWeight: '600', color: 'var(--color-text-primary)', flex: 1 }}>{item.label}</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>{item.val} Pcs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CATEGORY-WISE DRILLDOWN TABLE ── */}
        <div className="app-card plant-head-legacy-dashboard">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <h3 className="card-heading" style={{ margin: 0 }}>Category Wise Production Drilldown</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Filter Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ background: '#f1f5f9', color: '#24345C', border: '1px solid #D6E2F0', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', fontWeight: '700' }}
              >
                <option value="All">All Categories</option>
                <option value="Manual Covers">Manual Covers</option>
                <option value="Pit Covers">Pit Covers</option>
                <option value="Drain Covers">Drain Covers</option>
                <option value="Frames">Frames</option>
                <option value="Gratings">Gratings</option>
                <option value="Custom Products">Custom Products</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          {(() => {
            const list = productionAnalyticsData?.categories || [];
            const filtered = selectedCategory === 'All' 
              ? list 
              : list.filter(c => c.category.toLowerCase() === selectedCategory.toLowerCase());

            return (
              <DataTable
                columns={[
                  { header: 'Category Name', accessor: 'category', render: (row) => <strong>{row.category}</strong> },
                  { header: 'Orders Count', accessor: 'orders' },
                  { header: 'Produced Qty', accessor: 'qty', render: (row) => `${row.qty} Pcs` },
                  { header: 'Est. Tonnage', accessor: 'weight', render: (row) => `${row.weight} Ton` },
                  { header: 'Production Cost', accessor: 'cost', render: (row) => `₹${(row.cost || 0).toLocaleString()}` },
                  { header: 'Rejected Qty', accessor: 'rejected', render: (row) => <span style={{ color: row.rejected > 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>{row.rejected || 0}</span> },
                  { header: 'Dispatched Qty', accessor: 'dispatched' },
                  { header: 'Pending Qty', accessor: 'pending', render: (row) => <span style={{ fontWeight: 'bold' }}>{row.pending}</span> }
                ]}
                data={filtered}
                emptyMessage="No production records found for the selected category."
              />
            );
          })()}
        </div>
      </div>
    );
  };

  // ─── 2. PRODUCTION ANALYTICS ───
  const renderProductionAnalytics = () => {
    if (isLoadingAnalytics || !productionAnalyticsData) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px' }}>
          <Loader2 className="animate-spin" size={36} color="var(--color-accent-teal, #337a86)" />
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: '600', fontSize: '14px' }}>Loading Production Analytics...</p>
        </div>
      );
    }

    const { categories, machines, trend, employeeProductivity } = productionAnalyticsData;

    // Apply interactive filters
    const filteredMachines = machines.filter(m => {
      if (machineFilter === 'All') return true;
      return m.machine.toLowerCase().includes(machineFilter.toLowerCase());
    });

    const filteredProductivity = employeeProductivity.filter(ep => {
      if (shiftFilter === 'All') return true;
      return (ep.shift || '').toLowerCase().startsWith(shiftFilter.toLowerCase());
    });

    const machineChartData = filteredMachines.map(m => ({
      name: m.machine,
      Running: parseFloat(m.runningTime || 0),
      Idle: parseFloat(m.idleTime || 0),
      Breakdown: parseFloat(m.breakdownTime || 0)
    }));

    const shiftChartData = filteredProductivity.map(ep => ({
      name: (ep.shift || 'Unknown').split(' ')[0],
      Output: parseInt(ep.output || 0),
      Workers: parseInt(ep.workers || 0),
      Efficiency: parseInt(ep.efficiency || 0)
    }));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Reusable Header */}
        {renderTimeframeHeader("Production Analytics", "Deep dive into production output, machine utilization, and shift efficiency")}



        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px' }}>
          
          {/* Trend Chart */}
          <div className="app-card">
            <h3 className="card-heading">Daily Production Output (Qty vs Weight)</h3>
            <div style={{ width: '100%', height: '280px', marginTop: '16px' }}>
              <ResponsiveChartWrapper>
                <ComposedChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#5E6B82', fontSize: 11 }} />
                  <YAxis yAxisId="left" label={{ value: 'Quantity (Pcs)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#337a86' }} tick={{ fill: '#337a86', fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Weight (Tons)', angle: 90, position: 'insideRight', fontSize: 11, fill: '#4f46e5' }} tick={{ fill: '#4f46e5', fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Qty" fill="#337a86" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="Weight" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveChartWrapper>
            </div>
          </div>

          {/* Category Pie Chart */}
          <div className="app-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 className="card-heading">Category Wise Volume Distribution</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flex: 1, flexWrap: 'wrap', gap: '20px', marginTop: '16px' }}>
              <div style={{ width: '220px', height: '220px' }}>
                <ResponsiveChartWrapper>
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="qty"
                      nameKey="category"
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#337a86', '#0284c7', '#3b82f6', '#4f46e5', '#f59e0b', '#10b981', '#5E6B82'][index % 7]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `${val} Pcs`} />
                  </PieChart>
                </ResponsiveChartWrapper>
              </div>

              {/* Legend List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
                {categories.map((c, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', gap: '10px', fontSize: '12px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: ['#337a86', '#0284c7', '#3b82f6', '#4f46e5', '#f59e0b', '#10b981', '#5E6B82'][idx % 7] }} />
                    <span style={{ fontWeight: '600', color: 'var(--color-text-primary)', flex: 1 }}>{c.category}</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>{c.qty} Pcs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>



      </div>
    );
  };

  // ─── 3. MATERIAL ANALYTICS ───
  const renderMaterialAnalytics = () => {
    if (isLoadingAnalytics || !materialAnalyticsData) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px' }}>
          <Loader2 className="animate-spin" size={36} color="var(--color-accent-teal, #337a86)" />
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: '600', fontSize: '14px' }}>Loading Material Analytics...</p>
        </div>
      );
    }

    const { materials, monthlyTrends, wastage, productConsumption } = materialAnalyticsData;

    // Filter materials dynamically
    const filteredMaterials = materials.filter(m => {
      if (materialFilter === 'All') return true;
      return m.material.toLowerCase().includes(materialFilter.toLowerCase());
    });

    const materialPieData = filteredMaterials.map(m => ({
      name: m.material,
      value: parseFloat(m.consumed || 0)
    }));

    const cleanWastageVal = (str) => {
      if (!str) return 0;
      return parseFloat(str.replace(/[^0-9.]/g, ''));
    };

    const wastageChartData = [
      { name: 'Prod Waste', Tons: cleanWastageVal(wastage.productionWaste), fill: '#3b82f6' },
      { name: 'Broken', Tons: cleanWastageVal(wastage.brokenMaterial), fill: '#ea580c' },
      { name: 'Rejected', Tons: cleanWastageVal(wastage.rejectedMaterial), fill: '#dc2626' },
      { name: 'Returned', Tons: cleanWastageVal(wastage.returnedMaterial), fill: '#10b981' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Reusable Header */}
        {renderTimeframeHeader("Material Analytics", "Monitor raw material consumption, product-wise breakdowns, monthly trends, and wastage.")}

        {/* Page Filter Panel */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: '#F5FAFE', padding: '14px 20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '750', color: 'var(--color-text-secondary)' }}>Filter Raw Material</span>
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              style={{ background: '#ffffff', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', fontWeight: 'bold' }}
            >
              <option value="All">All Materials</option>
              <option value="Cement">Cement</option>
              <option value="Steel">Steel Reinforcement</option>
              <option value="Sand">River Sand</option>
              <option value="Aggregates">Coarse Aggregates</option>
              <option value="Pigments">Pigments / Oxides</option>
            </select>
          </div>
        </div>

        {/* Wastage KPIs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="app-card border-left-blue">
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Production Waste</span>
            <h3 style={{ margin: '8px 0 0', fontSize: '22px', fontWeight: '850', color: 'var(--color-text-primary)' }}>{wastage.productionWaste}</h3>
            <p style={{ fontSize: '11px', color: '#8893A7', margin: '4px 0 0' }}>Structural scrap & spillages</p>
          </div>
          <div className="app-card border-left-amber">
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Broken Material</span>
            <h3 style={{ margin: '8px 0 0', fontSize: '22px', fontWeight: '850', color: 'var(--color-text-primary)' }}>{wastage.brokenMaterial}</h3>
            <p style={{ fontSize: '11px', color: '#8893A7', margin: '4px 0 0' }}>Damage during demolding</p>
          </div>
          <div className="app-card border-left-red">
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Rejected Material</span>
            <h3 style={{ margin: '8px 0 0', fontSize: '22px', fontWeight: '850', color: 'var(--color-text-primary)' }}>{wastage.rejectedMaterial}</h3>
            <p style={{ fontSize: '11px', color: '#8893A7', margin: '4px 0 0' }}>Failed final quality standards</p>
          </div>
          <div className="app-card border-left-emerald">
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Returned Material</span>
            <h3 style={{ margin: '8px 0 0', fontSize: '22px', fontWeight: '850', color: 'var(--color-text-primary)' }}>{wastage.returnedMaterial}</h3>
            <p style={{ fontSize: '11px', color: '#8893A7', margin: '4px 0 0' }}>Returned to store inventory</p>
          </div>
        </div>

        {/* Visual Wastage Comparison & Consumption Pie Chart */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px' }}>
          
          {/* Wastage Bar Chart */}
          <div className="app-card">
            <h3 className="card-heading">Operational Scrap & Wastage Comparison (Tons)</h3>
            <div style={{ width: '100%', height: '240px', marginTop: '16px' }}>
              <ResponsiveChartWrapper>
                <BarChart data={wastageChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" />
                  <YAxis unit=" Tons" />
                  <Tooltip />
                  <Bar dataKey="Tons" radius={[6, 6, 0, 0]}>
                    {wastageChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveChartWrapper>
            </div>
          </div>

          {/* Raw Material Distribution Pie Chart */}
          <div className="app-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 className="card-heading">Raw Material Consumption Proportions</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flex: 1, flexWrap: 'wrap', gap: '20px', marginTop: '16px' }}>
              <div style={{ width: '200px', height: '200px' }}>
                <ResponsiveChartWrapper>
                  <PieChart>
                    <Pie
                      data={materialPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {materialPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#337a86', '#0284c7', '#3b82f6', '#4f46e5', '#f59e0b', '#10b981'][index % 6]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} Tons`} />
                  </PieChart>
                </ResponsiveChartWrapper>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' }}>
                {materialPieData.map((item, idx) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: ['#337a86', '#0284c7', '#3b82f6', '#4f46e5', '#f59e0b', '#10b981'][idx % 6] }} />
                    <span style={{ fontWeight: '600', color: 'var(--color-text-primary)', flex: 1 }}>{item.name}</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>{item.value} Tons</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Main Consumption & Monthly Trend */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px' }}>
          
          {/* Table */}
          <div className="app-card">
            <h3 className="card-heading">Raw Material Consumption Table</h3>
            <DataTable
              columns={[
                { header: 'Material Name', accessor: 'material', render: (row) => <strong>{row.material}</strong> },
                { header: 'Quantity Consumed', accessor: 'consumed', render: (row) => `${row.consumed} ${row.unit}` },
                { header: 'UoM', accessor: 'unit' }
              ]}
              data={filteredMaterials}
            />
          </div>

          {/* Monthly Trend Line Chart */}
          <div className="app-card">
            <h3 className="card-heading">Monthly Consumption Trend (Tons)</h3>
            <div style={{ width: '100%', height: '260px', marginTop: '20px' }}>
              <ResponsiveChartWrapper>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: '#5E6B82', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#5E6B82', fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Cement" stroke="#337a86" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Steel" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Sand" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveChartWrapper>
            </div>
          </div>
        </div>

        {/* Product-wise consumption */}
        <div className="app-card">
          <h3 className="card-heading" style={{ marginBottom: '16px' }}>Material Consumption by Product Line</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {(productConsumption || []).map((pc, idx) => (
              <div key={idx} style={{ background: '#F5FAFE', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '18px 20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{pc.product}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pc.materials.map((m, mIdx) => (
                    <div key={mIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>{m.name}</span>
                      <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{m.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ─── 4. DEPARTMENT OVERVIEW ───
  const renderDepartmentOverview = () => {
    if (isLoadingAnalytics || !departmentOverviewData) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px' }}>
          <Loader2 className="animate-spin" size={36} color="var(--color-accent-teal, #337a86)" />
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: '600', fontSize: '14px' }}>Loading Department Overview...</p>
        </div>
      );
    }

    const { store = {}, production = {}, dispatch = {}, pipeline = [] } = departmentOverviewData;

    // Determine bottlenecks
    const isStoreBlocked = store.materialPending > 0;
    const isProductionBlocked = production.delayedOrders > 0;
    const isDispatchBlocked = dispatch.pendingDispatch > 0;

    // Filter by Bottleneck if selected
    const matchesBottleneckFilter = (type) => {
      if (bottleneckFilter === 'All') return true;
      if (bottleneckFilter === 'Store Blocked') return type === 'Store';
      if (bottleneckFilter === 'Production Blocked') return type === 'Production';
      if (bottleneckFilter === 'Dispatch Blocked') return type === 'Dispatch';
      return true;
    };

    const pipelineChartData = [
      { name: 'Sales', Qty: pipeline.salesOrders || 0, fill: '#0284c7' },
      { name: 'Planning', Qty: pipeline.planning || 0, fill: '#337a86' },
      { name: 'Store', Qty: pipeline.store || 0, fill: '#f59e0b' },
      { name: 'Production', Qty: pipeline.production || 0, fill: '#10b981' },
      { name: 'QC', Qty: pipeline.qc || 0, fill: '#0284c7' },
      { name: 'Dispatch', Qty: pipeline.dispatch || 0, fill: '#475569' },
      { name: 'Delivered', Qty: pipeline.delivered || 0, fill: '#15803d' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Reusable Header */}
        {renderTimeframeHeader("Department Overview & Live Pipeline", "Monitor cross-department transaction flows, active volumes, and operational bottlenecks.")}

        {/* Bottleneck Filter selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F5FAFE', padding: '12px 18px', borderRadius: '12px', border: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-text-secondary)' }}>Identify Bottlenecks:</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Store Blocked', 'Production Blocked', 'Dispatch Blocked'].map((bFilter) => (
              <button
                key={bFilter}
                onClick={() => setBottleneckFilter(bFilter)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '750',
                  border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'all 0.2s ease',
                  background: bottleneckFilter === bFilter ? '#ef4444' : '#ffffff',
                  color: bottleneckFilter === bFilter ? '#ffffff' : 'var(--color-text-secondary)'
                }}
              >
                {bFilter}
              </button>
            ))}
          </div>
        </div>

        {/* ─── LIVE FACTORY PIPELINE (SVG & CSS FLOW) ─── */}
        <div className="app-card" style={{ padding: '24px' }}>
          <h3 className="card-heading" style={{ marginBottom: '20px' }}>Live Factory Operational Pipeline</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '10px 0' }}>
            
            {/* Stage 1: Sales */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1, minWidth: '100px', opacity: matchesBottleneckFilter('Sales') ? 1 : 0.35 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0f2fe', border: '2px solid #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '15px', color: '#0284c7' }}>
                {pipeline.salesOrders}
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-primary)', textAlign: 'center' }}>Sales Orders</span>
            </div>

            <ArrowRight size={16} color="#8893A7" style={{ flexShrink: 0 }} />

            {/* Stage 2: Planning */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1, minWidth: '100px', opacity: matchesBottleneckFilter('Planning') ? 1 : 0.35 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(51, 122, 134, 0.1)', border: '2px solid var(--color-accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '15px', color: 'var(--color-accent-teal)' }}>
                {pipeline.planning}
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-primary)', textAlign: 'center' }}>Planning Board</span>
            </div>

            <ArrowRight size={16} color={isStoreBlocked ? '#f97316' : '#8893A7'} style={{ flexShrink: 0 }} />

            {/* Stage 3: Store */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1, minWidth: '100px', opacity: matchesBottleneckFilter('Store') ? 1 : 0.35 }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                background: isStoreBlocked ? '#ffedd5' : '#fef3c7', 
                border: isStoreBlocked ? '2px solid #f97316' : '2px solid #f59e0b', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: '800', 
                fontSize: '15px', 
                color: isStoreBlocked ? '#f97316' : '#f59e0b',
                boxShadow: isStoreBlocked ? '0 0 10px rgba(249, 115, 22, 0.2)' : 'none'
              }}>
                {pipeline.store}
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-primary)', textAlign: 'center' }}>Store Requests</span>
            </div>

            <ArrowRight size={16} color={isProductionBlocked ? '#ef4444' : '#8893A7'} style={{ flexShrink: 0 }} />

            {/* Stage 4: Production */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1, minWidth: '100px', opacity: matchesBottleneckFilter('Production') ? 1 : 0.35 }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                background: isProductionBlocked ? '#fee2e2' : '#ecfdf5', 
                border: isProductionBlocked ? '2px solid #ef4444' : '2px solid #10b981', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: '800', 
                fontSize: '15px', 
                color: isProductionBlocked ? '#ef4444' : '#10b981',
                boxShadow: isProductionBlocked ? '0 0 10px rgba(239, 68, 68, 0.2)' : 'none'
              }}>
                {pipeline.production}
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-primary)', textAlign: 'center' }}>Production</span>
            </div>

            <ArrowRight size={16} color="#8893A7" style={{ flexShrink: 0 }} />

            {/* Stage 5: QC */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1, minWidth: '100px', opacity: matchesBottleneckFilter('QC') ? 1 : 0.35 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0f2fe', border: '2px solid #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '15px', color: '#0284c7' }}>
                {pipeline.qc}
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-primary)', textAlign: 'center' }}>QC Inspections</span>
            </div>

            <ArrowRight size={16} color={isDispatchBlocked ? '#f97316' : '#8893A7'} style={{ flexShrink: 0 }} />

            {/* Stage 6: Dispatch */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1, minWidth: '100px', opacity: matchesBottleneckFilter('Dispatch') ? 1 : 0.35 }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                background: isDispatchBlocked ? '#ffedd5' : '#f1f5f9', 
                border: isDispatchBlocked ? '2px solid #f97316' : '2px solid #D6E2F0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: '800', 
                fontSize: '15px', 
                color: isDispatchBlocked ? '#f97316' : '#475569'
              }}>
                {pipeline.dispatch}
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-primary)', textAlign: 'center' }}>Dispatch Dept</span>
            </div>

            <ArrowRight size={16} color="#8893A7" style={{ flexShrink: 0 }} />

            {/* Stage 7: Delivered */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1, minWidth: '100px', opacity: matchesBottleneckFilter('Delivered') ? 1 : 0.35 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', border: '2px solid #15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '15px', color: '#15803d' }}>
                {pipeline.delivered}
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-primary)', textAlign: 'center' }}>Delivered</span>
            </div>

          </div>
        </div>

        {/* Visual Pipeline Bar Chart & 3-Column Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px' }}>
          
          {/* Pipeline Bar Chart */}
          <div className="app-card">
            <h3 className="card-heading">Active Pipeline Phase Volume</h3>
            <div style={{ width: '100%', height: '260px', marginTop: '16px' }}>
              <ResponsiveChartWrapper>
                <BarChart data={pipelineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Qty" radius={[6, 6, 0, 0]}>
                    {pipelineChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveChartWrapper>
            </div>
          </div>

          {/* Department Breakdown Cards Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="app-card" style={{ padding: '16px 20px', background: isStoreBlocked ? '#fffbeb' : '#ffffff', border: isStoreBlocked ? '1.5px solid #f59e0b' : '1px solid var(--color-border)' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: isStoreBlocked ? '#b45309' : 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={16} /> Store Department Bottleneck Indicator
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                {isStoreBlocked 
                  ? `WARNING: There are currently ${store.materialPending} raw material issue requests pending authorization, blocking WOs.` 
                  : "All material requests are cleared and authorized for production."}
              </p>
            </div>

            <div className="app-card" style={{ padding: '16px 20px', background: isProductionBlocked ? '#fef2f2' : '#ffffff', border: isProductionBlocked ? '1.5px solid #ef4444' : '1px solid var(--color-border)' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: isProductionBlocked ? '#b91c1c' : 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={16} /> Production Scheduling Bottleneck Indicator
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                {isProductionBlocked 
                  ? `CRITICAL: There are ${production.delayedOrders} delayed production runs on active sintering/casting lines.` 
                  : "Production schedule is running on time within expected efficiency range."}
              </p>
            </div>

            <div className="app-card" style={{ padding: '16px 20px', background: isDispatchBlocked ? '#fffbeb' : '#ffffff', border: isDispatchBlocked ? '1.5px solid #f97316' : '1px solid var(--color-border)' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: isDispatchBlocked ? '#c2410c' : 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} /> Logistics & Dispatch Bottleneck Indicator
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                {isDispatchBlocked 
                  ? `WARNING: ${dispatch.pendingDispatch} packages are packed & QC passed, but delayed/awaiting vehicle loading.` 
                  : "All dispatches are flowing smoothly with active transit routes."}
              </p>
            </div>
          </div>

        </div>

        {/* 3-Column Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Store Summary */}
          <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: matchesBottleneckFilter('Store') ? 1 : 0.35 }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              <Package size={16} color="#f59e0b" /> Store Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Purchase Requests:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{store.purchaseRequests} Requests</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Material Issued:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{store.materialIssued} WOs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Material Pending Approval:</span>
                <span style={{ color: store.materialPending > 0 ? '#ea580c' : '#16a34a', fontWeight: 'bold' }}>{store.materialPending} Requests</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Low Stock Alert count:</span>
                <span style={{ color: store.lowStock > 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>{store.lowStock} Items</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Dead Stock Count:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{store.deadStock} Items</span>
              </div>
            </div>
          </div>

          {/* Production Summary */}
          <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: matchesBottleneckFilter('Production') ? 1 : 0.35 }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              <Activity size={16} color="var(--color-accent-teal)" /> Production Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Running Orders:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{production.runningOrders} Orders</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Completed Orders:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{production.completedOrders} Orders</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Pending Orders:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{production.pendingOrders} Orders</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Delayed Orders:</span>
                <span style={{ color: production.delayedOrders > 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>{production.delayedOrders} Orders</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Active Machines:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{production.machineStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Active Workers Logged:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{production.workersActive} Workers</span>
              </div>
            </div>
          </div>

          {/* Dispatch Summary */}
          <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: matchesBottleneckFilter('Dispatch') ? 1 : 0.35 }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '850', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              <Layers size={16} color="#3b82f6" /> Dispatch Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Today's Dispatch Runs:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{dispatch.todaysDispatch} Runs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Pending Dispatch:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{dispatch.pendingDispatch} Shipments</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Vehicle Status:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{dispatch.vehicleStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Delayed Deliveries:</span>
                <span style={{ color: dispatch.delayedDelivery > 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>{dispatch.delayedDelivery} Shipments</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>Completed Deliveries:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>{dispatch.completedDelivery} Shipments</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  // ─── 5. EXECUTIVE REPORTS (AI) ───
  const renderExecutiveReports = () => {
    const handleGenerateAIReport = async () => {
      setIsGeneratingReport(true);
      try {
        const res = await apiClient.post('/plant-head/reports/generate-ai', {
          filter: reportDateFilter,
          customStart: reportCustomStart,
          customEnd: reportCustomEnd
        });
        if (res.success) {
          setAiReportData(res.data);
          showToast("AI report generated successfully using live factory metrics!");
        } else {
          Swal.fire({ icon: 'error', title: 'Generation Failed', text: res.message || 'Server error' });
        }
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Generation Failed', text: err.message });
      } finally {
        setIsGeneratingReport(false);
      }
    };

    const handleDownloadPDF = () => {
      if (!aiReportData) return;
      const dateRangeLabel = reportDateFilter === 'Custom' 
        ? `Period: ${reportCustomStart} to ${reportCustomEnd}` 
        : `Period: ${reportDateFilter === 'This Week' ? 'Weekly' : reportDateFilter === 'This Month' ? 'Monthly' : reportDateFilter}`;
      
      exportExecutiveReportPDF(aiReportData, dateRangeLabel);
      showToast("Downloading branded executive PDF report...");
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '850', color: 'var(--color-text-primary)', margin: 0 }}>AI Executive Reports</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Synthesize multi-department logs into a decision-ready summary using Gemini AI</p>
          </div>

          {/* Report Date Filter Panel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Report Timeframe</span>
              <select
                value={reportDateFilter}
                onChange={(e) => setReportDateFilter(e.target.value)}
                style={{ background: 'var(--color-card-bg, #ffffff)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 16px', fontSize: '13.5px', fontWeight: 'bold', minWidth: '160px', outline: 'none' }}
              >
                <option value="Today">Today</option>
                <option value="This Week">Weekly</option>
                <option value="This Month">Monthly</option>
                <option value="Custom">Custom Date Range</option>
              </select>
            </div>

            {reportDateFilter === 'Custom' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Start Date</span>
                  <input
                    type="date"
                    value={reportCustomStart}
                    onChange={(e) => setReportCustomStart(e.target.value)}
                    style={{ background: 'var(--color-card-bg, #ffffff)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '7px 12px', fontSize: '13px', fontWeight: '600' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>End Date</span>
                  <input
                    type="date"
                    value={reportCustomEnd}
                    onChange={(e) => setReportCustomEnd(e.target.value)}
                    style={{ background: 'var(--color-card-bg, #ffffff)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '7px 12px', fontSize: '13px', fontWeight: '600' }}
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-end' }}>
              <button
                onClick={handleGenerateAIReport}
                disabled={isGeneratingReport}
                className="action-btn"
                style={{ padding: '10px 20px', background: 'var(--color-primary, #2F4375)', border: 'none', borderRadius: '10px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', height: '38px' }}
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Generating...
                  </>
                ) : (
                  <>
                    <FileText size={16} /> Refresh Report
                  </>
                )}
              </button>
              
              {aiReportData && (
                <button
                  onClick={handleDownloadPDF}
                  className="action-btn"
                  style={{ padding: '10px 20px', background: '#f1f5f9', border: '1px solid #D6E2F0', borderRadius: '10px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', height: '38px' }}
                >
                  <Download size={16} /> Download PDF
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isGeneratingReport && (
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Loader2 className="animate-spin" size={40} color="var(--color-accent-teal, #337a86)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '850', color: 'var(--color-text-primary)' }}>Analyzing Factory Data</h4>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>Aggregating Store, Production, QC, and Dispatch metrics...</p>
            </div>
          </div>
        )}

        {/* Report Card */}
        {aiReportData && !isGeneratingReport && (
          <div className="app-card" style={{ background: '#ffffff', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-premium)', padding: '32px' }}>
            
            {/* Company Title */}
            <div style={{ borderBottom: '2px solid var(--color-border)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'var(--color-accent-teal, #337a86)' }}>HIMALAYA PRECAST</h3>
                <span style={{ fontSize: '11px', color: '#8893A7', fontWeight: 'bold', letterSpacing: '1px' }}>FACTORY COMMAND CENTER</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-primary)' }}>EXECUTIVE REPORT</span>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--color-text-secondary)' }}>Period: {globalDateFilter}</p>
              </div>
            </div>

            {/* AI Executive Summary Block */}
            <div style={{ marginBottom: '28px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '850', color: 'var(--color-accent-teal)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>I. Executive Summary</h4>
              <div style={{ background: '#F5FAFE', borderLeft: '4px solid var(--color-accent-teal)', padding: '16px 20px', borderRadius: '0 8px 8px 0', fontSize: '14px', lineHeight: '1.6', color: '#334155' }}>
                {aiReportData.summary}
              </div>
            </div>

            {/* Recommendations Block */}
            <div style={{ marginBottom: '28px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '850', color: 'var(--color-accent-teal)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>II. Actionable Recommendations</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(aiReportData?.recommendations || []).map((rec, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#334155', background: '#F5FAFE', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', alignItems: 'center' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent-teal)', flexShrink: 0 }} />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Summary Tables */}
            {(() => {
              const {
                productionKPIs = {},
                qcKPIs = {},
                storeKPIs = {},
                dispatchKPIs = {}
              } = aiReportData?.metrics || {};
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div style={{ background: '#F5FAFE', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '12px' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)' }}>Production & QC Summary</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Completed Orders:</span><strong>{productionKPIs.completedToday || 0} WO</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>QC Pass Rate:</span><strong>{qcKPIs.passRate || 0}%</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Rejections:</span><strong>{qcKPIs.failed || 0} Units</strong></div>
                    </div>
                  </div>
                  <div style={{ background: '#F5FAFE', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '12px' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)' }}>Store & Inventory Summary</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Inventory Value:</span><strong>₹{((storeKPIs.totalValue || 0) / 100000).toFixed(1)} L</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Low Stock Items:</span><strong>{storeKPIs.lowStockItems || 0} Items</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Material Issued:</span><strong>{storeKPIs.materialIssued || 0} WOs</strong></div>
                    </div>
                  </div>
                  <div style={{ background: '#F5FAFE', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '12px' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)' }}>Dispatch Summary</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Dispatched Today:</span><strong>{dispatchKPIs.dispatchedToday || 0} Runs</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delayed Deliveries:</span><strong>{dispatchKPIs.delayedDispatch || 0} Runs</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pending Vehicles:</span><strong>{dispatchKPIs.pendingDispatch || 0} Runs</strong></div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Signature Block */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px', borderTop: '1px solid var(--color-border)', paddingTop: '24px', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div style={{ width: '150px', borderBottom: '1px solid #D6E2F0', marginBottom: '8px' }}></div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-primary)' }}>Dr. Vivek Joshi</span>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--color-text-secondary)' }}>Plant Head, Himalaya Precast</p>
              </div>
              <div>
                <div style={{ width: '150px', borderBottom: '1px solid #D6E2F0', marginBottom: '8px' }}></div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-primary)' }}>General Manager</span>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--color-text-secondary)' }}>Himalaya ERP operations</p>
              </div>
            </div>

          </div>
        )}
      </div>
    );
  };

  // 2. Material Request Clearances
  const renderMaterialApprovals = () => {
    const MAT_STATUS_OPTS = ['All', 'REQUESTED', 'APPROVED', 'RETURNED_FOR_CORRECTION', 'ISSUED'];
    const allReqs = mRequests.filter(r => materialStatusFilter === 'All' ? true : r.status === materialStatusFilter);
    const searchedReqs = allReqs.filter(r => {
      const q = materialSearch.toLowerCase();
      return !q ||
        (r.orderNo || '').toLowerCase().includes(q) ||
        (r.requester || '').toLowerCase().includes(q) ||
        (r.materials || []).some(m => (m.materialName || '').toLowerCase().includes(q));
    });
    const pendingReqs = searchedReqs;
    const groupedByOrder = pendingReqs.reduce((acc, req) => {
      if (!acc[req.orderNo]) acc[req.orderNo] = [];
      acc[req.orderNo].push(req);
      return acc;
    }, {});
    const orderGroups = Object.entries(groupedByOrder);
    const totalPending = mRequests.filter(r => r.status === 'REQUESTED').length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Summary Bar */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '16px', 
          marginBottom: '8px' 
        }}>
          <div className="glass-stat-card students-theme" style={{ background: '#ffffff', border: '1px solid var(--color-border)' }}>
            <div className="glass-stat-label">
              <span className="glass-stat-label-left">
                <ClipboardCheck size={14} color="var(--color-accent-teal)" /> Pending Orders
              </span>
            </div>
            <div className="glass-stat-main">
              <span className="glass-stat-value">{totalPending} Orders</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Awaiting clearance approval</span>
          </div>

          <div className="glass-stat-card blue-theme" style={{ background: '#ffffff', border: '1px solid var(--color-border)' }}>
            <div className="glass-stat-label">
              <span className="glass-stat-label-left">
                <Package size={14} color="#3BAEEB" /> Total Material Lines
              </span>
            </div>
            <div className="glass-stat-main">
              <span className="glass-stat-value">
                {mRequests.reduce((acc, r) => acc + (r.materials?.length || 1), 0)} Items
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Ready for verification</span>
          </div>
        </div>

        {/* Main Title Row + Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>
            Material Release Approvals
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div className="search-box" style={{ width: '220px' }}>
              <Search size={14} color="var(--color-text-secondary)" />
              <input
                type="text"
                placeholder="Search order, requester, material…"
                value={materialSearch}
                onChange={e => setMaterialSearch(e.target.value)}
              />
              {materialSearch && <X size={13} style={{ cursor: 'pointer', color: 'var(--color-text-secondary)', flexShrink: 0 }} onClick={() => setMaterialSearch('')} />}
            </div>
            {/* Status pills */}
            <div className="tab-filters-row" style={{ background: '#f1f3f5' }}>
              {MAT_STATUS_OPTS.map(s => {
                const count = s === 'All' 
                  ? mRequests.length 
                  : mRequests.filter(r => r.status === s).length;
                return (
                  <button
                    key={s}
                    className={`filter-pill ${materialStatusFilter === s ? 'active' : ''}`}
                    onClick={() => setMaterialStatusFilter(s)}
                    style={{ color: materialStatusFilter === s ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
                  >{s} ({count})</button>
                );
              })}
            </div>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '10px 0 0', fontWeight: '500' }}>
          Showing {orderGroups.length} group(s) · {totalPending} pending
        </p>

        {orderGroups.length === 0 ? (
          <div className="app-card" style={{ border: '1px solid var(--color-border)', background: 'var(--color-card-bg)' }}>
            <div className="card-top-bar">
              <h2 className="card-heading">Material Release Approvals</h2>
            </div>
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <ShieldCheck size={24} color="#22c55e" />
              </div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px' }}>All Clear</p>
              <p style={{ fontSize: '13px', color: '#8893A7', margin: 0 }}>No material approvals match the active filter.</p>
            </div>
          </div>
        ) : (
          orderGroups.map(([orderNo, reqs]) => {
            const order = orders.find(o => o.orderNo === orderNo);
            const hasPending = reqs.some(r => r.status === 'REQUESTED');

            return (
              <div 
                key={orderNo} 
                style={{ 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  border: '1px solid var(--color-border)', 
                  background: 'var(--color-card-bg)', 
                  boxShadow: 'var(--shadow-premium)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {/* Card Header */}
                <div style={{ 
                  background: '#F5FAFE', 
                  padding: '18px 24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  borderBottom: '1px solid var(--color-border)' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: '12px', 
                      background: 'rgba(51, 122, 134, 0.1)', 
                      border: '1px solid rgba(51, 122, 134, 0.2)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Package size={20} color="var(--color-accent-teal)" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{orderNo}</span>
                      </div>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                        {order ? `Customer: ${order.customer?.name || order.customerName || 'Unknown'}` : 'Internal Stock Replenishment Run'}
                      </span>
                    </div>
                  </div>
                  
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                    Requested by: <strong>{reqs[0].requester || 'Production Team'}</strong>
                  </span>
                </div>

                {/* Material Lines list */}
                <div style={{ padding: '8px 24px 20px' }}>
                  {(() => {
                    const flatMaterials = reqs.flatMap(r => 
                      (r.items || r.materials || [{ materialName: r.materialName, quantityRequested: r.quantityRequested }])
                        .map(m => ({ ...m, requestId: r.id }))
                    );
                    return flatMaterials.map((mat, idx) => {
                      const displayMaterialName = mat.product?.name || mat.materialName || mat.materialId || 'Unknown Material';
                      const displayQuantity = mat.quantity || mat.quantityRequested || 0;
                      
                      const reqId = displayMaterialName ? `${mat.requestId}-${displayMaterialName}` : (mat.id || mat.requestId);
                      const currentQty = overrideQty[reqId] !== undefined ? overrideQty[reqId] : displayQuantity;
                      const reqObj = reqs.find(r => r.id === mat.requestId);
                      const isPending = reqObj ? reqObj.status === 'REQUESTED' || reqObj.status === 'PENDING_PLANT_HEAD_APPROVAL' : false;
                      
                      const invItem = state.rawInventory?.find(i => i.material.toLowerCase() === displayMaterialName.toLowerCase()) ||
                                      state.productCatalog?.find(i => i.name.toLowerCase() === displayMaterialName.toLowerCase());
                      const unit = invItem ? invItem.unit : (mat.unit || 'Nos');

                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px 0', borderBottom: idx < flatMaterials.length - 1 ? '1px dashed var(--color-border)' : 'none' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ color: 'var(--color-text-primary)', fontWeight: '700', fontSize: '15px' }}>{displayMaterialName}</span>
                            </div>

                            {/* Quantities and input */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Requested</span>
                                <strong style={{ color: 'var(--color-text-primary)', fontSize: '14.5px' }}>{displayQuantity} {unit}</strong>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Approve Qty ({unit})</label>
                                  <input
                                    type="number"
                                    className="form-input"
                                    disabled={!isPending}
                                    style={{ 
                                      margin: 0, 
                                      width: '110px', 
                                      padding: '8px 12px', 
                                      background: isPending ? '#F5FAFE' : '#f1f5f9', 
                                      color: 'var(--color-text-primary)', 
                                      borderColor: 'var(--color-border)',
                                      textAlign: 'right',
                                      fontWeight: 'bold',
                                      borderRadius: '8px',
                                      fontSize: '13.5px',
                                      opacity: isPending ? 1 : 0.7
                                    }}
                                    value={currentQty}
                                    onChange={(e) => handleOverrideChange(reqId, e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Action Footer */}
                <div style={{ 
                  background: '#F5FAFE', 
                  padding: '16px 24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'flex-end', 
                  borderTop: '1px solid var(--color-border)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {hasPending ? (
                      <>
                        <button
                          onClick={() => handleMaterialApproval(orderNo, reqs.filter(r => r.status === 'REQUESTED'), 'RETURNED_FOR_CORRECTION')}
                          className="btn-small btn-outline-navy"
                          style={{ margin: 0, padding: '8px 16px', borderRadius: '8px' }}
                        >
                          Return for Correction
                        </button>
                        <button 
                          onClick={() => handleMaterialApproval(orderNo, reqs.filter(r => r.status === 'REQUESTED'), 'APPROVED')} 
                          className="btn-small btn-primary-small"
                          style={{ margin: 0, padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold' }}
                        >
                          Sign & Release Materials
                        </button>
                      </>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Status:</span>
                        <StatusBadge status={reqs[0].status} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  // 3. Order Planning tab
  const renderOrderPlanning = () => {
    const sentToPlantStatuses = [
      'SENT_TO_PLANT',
      'PLANT_PENDING',
      'Awaiting Plant Head',
      'Plant Pending',
      'PLANT_APPROVED',
      'READY_FOR_PRODUCTION',
      'IN_PRODUCTION',
      'READY_FOR_DISPATCH',
      'COMPLETED',
    ];
    const createdOrders = orders.filter(o => sentToPlantStatuses.includes(o.status));
    const isAwaitingPlantHead = (order) =>
      ['SENT_TO_PLANT', 'PLANT_PENDING', 'Awaiting Plant Head', 'Plant Pending'].includes(order.status);

    return (
      <div className="app-card">
        <div className="card-top-bar">
          <h2 className="card-heading">Orders Sent to Plant Head</h2>
        </div>
        <DataTable
          columns={[
            { header: 'Order No', accessor: 'orderNo' },
            { header: 'Customer Name', accessor: 'customer.name', render: (row) => row.customerName || row.customer?.name || 'Unknown' },
            { header: 'Product Item', accessor: 'products' },
            { header: 'Quantity Value', accessor: 'quantity', render: (row) => `${row.quantity} Units` },
            { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
          ]}
          data={createdOrders}
          searchQuery={globalSearch}
          searchField="customer.name"
          actions={(row) => isAwaitingPlantHead(row) ? (
            <button
              className="action-btn"
              style={{ background: 'var(--color-primary)', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => { setSelectedOrderForPlanning(row); setShowPlanningModal(true); }}
            >
              <Clock size={14} /> Plan Order
            </button>
          ) : (
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>
              Already Processed
            </span>
          )}
          emptyMessage="No orders have been sent to Plant Head."
        />
      </div>
    );
  };

  // 4. Reports and Audits
  const renderReports = () => {
    return (
      <div className="app-card">
        <h3 className="card-heading">Approval Audit Trails</h3>
        <DataTable
          columns={[
            { header: 'Log Ref', accessor: 'id' },
            { header: 'Order No', accessor: 'orderNo', render: (row) => (
              <span 
                style={{ color: 'var(--color-text-primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                onClick={() => navigate.push(`/orders/${row.orderNo}`)}
              >
                {row.orderNo}
              </span>
            ) },
            { header: 'Action Name', accessor: 'action' },
            { header: 'Remarks', accessor: 'remarks' },
            { header: 'User Sign-off', accessor: 'user' },
            { header: 'Date', accessor: 'date' }
          ]}
          data={state.auditLogs?.filter(l => l.action.includes('Approve') || l.action.includes('Planned'))}
          searchQuery={globalSearch}
          searchField="orderNo"
          emptyMessage="No approval audit logs found."
        />
      </div>
    );
  };

  const renderIncomingOrders = () => {
    const allIncomingOrders = orders.map(order => {
      const workOrder = canonicalWorkOrders.find(wo =>
        String(wo.orderId || wo.orderNo) === String(order.id || order.orderNo)
      );
      const backendPlan = planningOrders.find(plan =>
        plan.id === order.productionPlanId || plan.salesOrderId === order.id
      );
      const items = Array.isArray(order.items) ? order.items : [];
      const product = items[0] || {};
      const qtySum = items.reduce((sum, item) => sum + Number(item.quantity ?? item.qty ?? 0), 0) || order.quantity || 1;
      return {
        ...order,
        workOrder,
        productionPlan: backendPlan,
        targetDate: order.targetDate || order.productionTargetDate || backendPlan?.plannedEndDate,
        products: order.products || order.productItem || product.productName || product.name || 'Item (100 Qty)',
        quantity: order.quantity || qtySum || 1,
        priority: order.priority || 'Medium',
      };
    });

    const filteredIncoming = allIncomingOrders.filter(o => {
      const q = incomingSearch.toLowerCase();
      return !q ||
        (o.orderNo || '').toLowerCase().includes(q) ||
        (o.customerName || o.customer?.name || '').toLowerCase().includes(q) ||
        (o.products || '').toLowerCase().includes(q);
    });

    const priorityBadge = (priority) => {
      const colors = {
        High: { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
        Medium: { bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
        Low: { bg: '#f0fdf4', color: '#16a34a', border: '#86efac' }
      };
      const c = colors[priority] || colors.Medium;
      return (
        <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
          {priority || 'Medium'} {priority === 'High' ? '🔴' : priority === 'Low' ? '🟢' : '🟡'}
        </span>
      );
    };

    const statusBadge = (row) => {
      const planning = normalizeStatus(row.planningStatus || row.status);
      if (planning === 'PENDING_ACCEPTANCE' || row.planningStatus === 'PENDING_ACCEPTANCE' || row.status === 'SENT_TO_PLANT') {
        return <span style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fcd34d', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>Pending Acceptance</span>;
      }
      if (planning === 'PRODUCTION_PLANNED' || row.workOrder) {
        return <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>Production Planned</span>;
      }
      return <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fcd34d', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>Awaiting Planning</span>;
    };

    const handleAcceptOrder = async (order) => {
      const { value: remarks } = await Swal.fire({
        title: 'Accept Order',
        input: 'textarea',
        inputLabel: 'Acceptance Remarks (optional)',
        inputPlaceholder: 'e.g. Capacity available, scheduling for production…',
        showCancelButton: true,
        confirmButtonText: 'Accept Order',
        customClass: { popup: 'swal-premium-popup', confirmButton: 'swal-premium-confirm-btn', cancelButton: 'swal-premium-cancel-btn' },
        buttonsStyling: false
      });
      if (remarks === undefined) return;
      showToast('Accepting order…');
      try {
        const isBackendOrder = directBackendOrders.some(candidate => candidate.id === order.id) ||
                               (backendSalesOrders && backendSalesOrders.some(candidate => candidate.id === order.id));
        if (isBackendOrder) {
          await backendFetch(`/api/backend/sales/orders/${order.id}/action`, {
            method: 'POST',
            body: { action: 'PLANT_APPROVE', remarks },
          });
          await loadSalesOrders();
          const refreshed = await backendFetch('/api/backend/sales/orders?page=1&pageSize=100');
          setDirectBackendOrders(Array.isArray(refreshed) ? refreshed : refreshed?.data || []);
        } else {
          useERPStore.getState().acceptOrderByPlantHead(order.id, { remarks }, user?.name || 'Plant Head');
        }
        showToast(`✅ Order ${order.orderNo || order.id} accepted!`);
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Accept Failed', text: err.message });
      }
    };

    const handleRejectOrder = async (order) => {
      const { value: remarks } = await Swal.fire({
        title: 'Reject Order',
        input: 'textarea',
        inputLabel: 'Rejection Reason (required)',
        inputPlaceholder: 'e.g. Insufficient raw material / capacity constraint…',
        inputValidator: (v) => !v && 'Please provide a rejection reason.',
        showCancelButton: true,
        confirmButtonText: 'Reject Order',
        confirmButtonColor: '#ef4444',
        customClass: { popup: 'swal-premium-popup', confirmButton: 'swal-premium-confirm-btn', cancelButton: 'swal-premium-cancel-btn' },
        buttonsStyling: false
      });
      if (!remarks) return;
      showToast('Rejecting order…');
      try {
        await backendFetch(`/api/backend/sales/orders/${order.id}/action`, {
          method: 'POST',
          body: { action: 'PLANT_REJECT', remarks },
        }).catch(() => {});
        useERPStore.getState().rejectOrderByPlantHead?.(order.id, { remarks }, user?.name || 'Plant Head');
        showToast(`🚫 Order ${order.orderNo || order.id} rejected.`);
        void loadSalesOrders();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Reject Failed', text: err.message });
      }
    };

    return (
      <div className="app-card" data-testid="plant-head-incoming-orders-page">
        {/* Title + Search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <h2 className="card-heading" style={{ margin: 0 }}>Incoming Confirmed Orders</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f3f5', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '7px 13px', flex: '0 0 auto' }}>
            <Search size={14} color="var(--color-text-secondary)" />
            <input
              type="text"
              placeholder="Search orders, customer…"
              value={incomingSearch}
              onChange={e => setIncomingSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: 'var(--color-text-primary)', width: '180px' }}
            />
            {incomingSearch && <X size={13} style={{ cursor: 'pointer', color: 'var(--color-text-secondary)', flexShrink: 0 }} onClick={() => setIncomingSearch('')} />}
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px', fontWeight: '500' }}>
          Showing {filteredIncoming.length} of {allIncomingOrders.length} orders
        </p>

        <DataTable
          columns={[
            { header: 'Order No', accessor: 'orderNo', render: (row) => (
              <strong
                style={{ color: 'var(--color-primary-dark, #1e293b)', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setSelectedOrderDetails(row)}
              >
                {row.orderNo}
              </strong>
            ) },
            { header: 'Customer', accessor: 'customerName', render: (row) => <span style={{ fontWeight: 600 }}>{row.customerName || row.customer?.name || '—'}</span> },
            { header: 'Product Item', accessor: 'products', render: (row) => row.products || '—' },
            { header: 'Target Date', accessor: 'targetDate', render: (row) => row.targetDate ? new Date(row.targetDate).toLocaleDateString('en-GB') : <span style={{ color: '#8893A7' }}>Not set</span> },
            { header: 'Priority', accessor: 'priority', render: (row) => priorityBadge(row.priority) },
            { header: 'Status', accessor: 'planningStatus', render: (row) => statusBadge(row) }
          ]}
          data={filteredIncoming}
          searchQuery={''}
          actions={(row) => (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                style={{ padding: '5px 10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
                onClick={() => setSelectedOrderDetails(row)}
              >
                View
              </button>
              {(row.planningStatus === 'PENDING_ACCEPTANCE' || row.status === 'SENT_TO_PLANT') && (
                <>
                  <button
                    data-testid={`plant-head-accept-order-${row.orderNo || row.id}`}
                    style={{ padding: '5px 10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
                    onClick={() => handleAcceptOrder(row)}
                  >
                    Accept
                  </button>
                  <button
                    style={{ padding: '5px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
                    onClick={() => handleRejectOrder(row)}
                  >
                    Reject
                  </button>
                </>
              )}
              {(() => {
                const isPlanned = Boolean(
                  row.planningStatus === 'PRODUCTION_PLANNED' ||
                  row.status === 'PLANNED' ||
                  row.productionStatus === 'PLANNED' ||
                  row.productionStatus === 'IN_PRODUCTION' ||
                  row.productionStatus === 'WORK_ORDER_CREATED' ||
                  row.productionPlanId ||
                  row.productionPlan ||
                  row.workOrder ||
                  (Array.isArray(row.workOrders) && row.workOrders.length > 0)
                );

                if (isPlanned) {
                  return (
                    <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                      ✓ Planned
                    </span>
                  );
                }

                return (
                  <button
                    data-testid={`plant-head-send-production-${row.orderNo || row.id}`}
                    style={{
                      padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', 
                      fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#0369a1'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#0284c7'}
                    onClick={() => {
                      setSelectedOrderForPlanning(row);
                      const d = new Date(); d.setDate(d.getDate() + 7);
                      setTargetDate(row.targetDate ? row.targetDate.slice(0, 10) : d.toISOString().split('T')[0]);
                      setPriority(row.priority || 'Medium');
                      setShowPlanningModal(true);
                    }}
                  >
                    <Plus size={14} /> Plan &amp; Send to Production
                  </button>
                );
              })()}
            </div>
          )}
          emptyMessage="No incoming orders found."
        />
      </div>
    );
  };

  const renderPlanningPage = () => {
    const PRIORITY_OPTS = ['All', 'High', 'Medium', 'Low'];
    const planningTabs = [
      { key: 'pending', label: 'Pending Planning' },
      { key: 'active', label: 'Planned / Active' },
      { key: 'history', label: 'History' },
    ];
    const allPlanningOrders = orders
      .map(order => {
        const workOrder = canonicalWorkOrders.find(wo =>
          String(wo.orderId || wo.orderNo) === String(order.id || order.orderNo)
        );
        const backendPlan = planningOrders.find(plan =>
          plan.id === order.productionPlanId || plan.salesOrderId === order.id
        );
        const items = Array.isArray(order.items) ? order.items : [];
        const product = items[0] || {};
        return {
          ...order,
          workOrder,
          productionPlan: backendPlan,
          targetDate: order.targetDate || order.productionTargetDate || backendPlan?.plannedEndDate,
          workOrderNo: workOrder?.workOrderNo || workOrder?.id || '—',
          products: order.products || order.productItem || product.productName || product.name || '—',
          orderedQuantity: items.reduce((sum, item) => sum + Number(item.quantity ?? item.qty ?? 0), 0),
          plannedQuantity: Number(workOrder?.plannedQty ?? workOrder?.quantity ?? order.plannedQuantity ?? 0),
          completedQuantity: Number(workOrder?.producedQty ?? workOrder?.completedQty ?? order.producedQty ?? 0),
          approvedQuantity: Number(workOrder?.qcApprovedQty ?? order.qcApprovedQty ?? 0),
        };
      })
      .filter(order => {
        const planning = normalizeStatus(order.planningStatus);
        if (planningViewTab === 'history') return isPlanningHistoryOrder(order);
        if (planningViewTab === 'active') {
          return planning === 'PRODUCTION_PLANNED' && !isPlanningHistoryOrder(order);
        }
        return planning === 'PLANT_HEAD_ACCEPTED' && !order.workOrder;
      });

    const filtered = allPlanningOrders.filter(o => {
      const q = planningSearch.toLowerCase();
      const matchSearch = !q ||
        (o.orderNo || '').toLowerCase().includes(q) ||
        (o.customerName || o.customer || '').toLowerCase().includes(q) ||
        (o.products || o.productItem || '').toLowerCase().includes(q);
      const matchPriority = planningPriorityFilter === 'All' ||
        (o.priority || '').toLowerCase() === planningPriorityFilter.toLowerCase();
      return matchSearch && matchPriority;
    });

    const priorityBadge = (priority) => {
      const colors = { High: { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' }, Medium: { bg: '#fffbeb', color: '#d97706', border: '#fcd34d' }, Low: { bg: '#f0fdf4', color: '#16a34a', border: '#86efac' } };
      const c = colors[priority] || colors.Medium;
      return <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{priority || 'Medium'}</span>;
    };

    const statusBadge = (status) => {
      if (status === 'Pending Planning' || status === 'PLANT_HEAD_ACCEPTED') return <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fcd34d', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>Awaiting Planning</span>;
      if (status === 'PRODUCTION_PLANNED') return <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>Production Planned</span>;
      return <span style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #93c5fd', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>{status}</span>;
    };

    return (
      <div className="app-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <h2 className="card-heading" style={{ margin: 0 }}>Production Planning Board</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f3f5', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '7px 13px' }}>
            <Search size={14} color="var(--color-text-secondary)" />
            <input
              type="text"
              placeholder="Search order, customer, product…"
              value={planningSearch}
              onChange={e => setPlanningSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: 'var(--color-text-primary)', width: '200px' }}
            />
            {planningSearch && <X size={13} style={{ cursor: 'pointer', color: 'var(--color-text-secondary)' }} onClick={() => setPlanningSearch('')} />}
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div className="tab-filters-row" style={{ marginBottom: '10px', overflowX: 'auto' }}>
            {planningTabs.map(tab => (
              <button
                key={tab.key}
                className={`filter-pill ${planningViewTab === tab.key ? 'active' : ''}`}
                onClick={() => setPlanningViewTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="tab-filters-row" style={{ background: '#f1f3f5', display: 'inline-flex' }}>
            {PRIORITY_OPTS.map(p => (
              <button key={p} className={`filter-pill ${planningPriorityFilter === p ? 'active' : ''}`} onClick={() => setPlanningPriorityFilter(p)}
                style={{ color: planningPriorityFilter === p ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                {p === 'All' ? 'All Priority' : p}
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px', fontWeight: '500' }}>
          Showing {filtered.length} of {allPlanningOrders.length} orders
        </p>

        <DataTable
          columns={[
            { header: 'Order No', accessor: 'orderNo', render: (row) => (
              <strong style={{ color: 'var(--color-primary-dark, #1e293b)', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setSelectedOrderDetails({ orderNo: row.orderNo, customerName: row.customerName || row.customer, products: row.products || row.productItem, id: row.id, status: row.planningStatus })}>
                {row.orderNo}
              </strong>
            )},
            { header: 'Customer', accessor: 'customerName', render: (row) => <span style={{ fontWeight: 600 }}>{row.customerName || row.customer || '—'}</span> },
            { header: 'Product Item', accessor: 'products', render: (row) => row.products || row.productItem || '—' },
            { header: 'Target Date', accessor: 'targetDate', render: (row) => row.targetDate ? new Date(row.targetDate).toLocaleDateString('en-GB') : <span style={{ color: '#8893A7' }}>Not set</span> },
            { header: 'Priority', accessor: 'priority', render: (row) => priorityBadge(row.priority) },
            { header: 'Remarks', accessor: 'remarks', render: (row) => row.remarks || '—' },
            { header: 'Status', accessor: 'planningStatus', render: (row) => statusBadge(row.planningStatus) },
          ]}
          data={filtered}
          searchQuery={''}
          searchField="customerName"
          actions={(row) => planningViewTab === 'pending' ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                data-testid={`plant-head-send-production-${row.orderNo || row.id}`}
                style={{
                  padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', 
                  fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#0369a1'}
                onClick={() => {
                  setSelectedOrderForPlanning(row);
                  const d = new Date(); d.setDate(d.getDate() + 7);
                  setTargetDate(d.toISOString().split('T')[0]);
                  setPriority(row.priority || 'Medium');
                  setShowPlanningModal(true);
                }}
              >
                <Plus size={14} /> Plan &amp; Send to Production
              </button>
            </div>
          ) : null}
          emptyMessage="No orders in Plant Head planning board."
        />
      </div>
    );
  };

  const renderQCFailures = () => {
    let qcFailedOrders = [];
    if (directQCFailures.length > 0) {
      qcFailedOrders = directQCFailures
        .filter(insp => insp.status === 'REJECTED' || insp.status === 'REWORK')
        .map(insp => {
          const wo = insp.workOrder || {};
          const customerName = wo.productionPlan?.salesOrder?.customer?.name || '—';
          const productName = wo.salesOrderItem?.productNameSnapshot || 'Unknown Product';
          return {
            id: insp.id,
            orderNo: wo.orderNo || `WO-${insp.id.substring(0, 4)}`,
            customerName,
            productName,
            quantity: wo.quantity || 0,
            defects: insp.remarks ? [insp.remarks] : ['Failed quality standards'],
            inspector: 'QC Inspector',
            date: insp.createdAt,
            status: insp.status === 'REWORK' ? 'Reworking' : 'Scrapped',
            orderObj: wo.productionPlan?.salesOrder
          };
        });
    } else {
      qcFailedOrders = (state.workOrders || []).flatMap(wo => {
        const latestFail = [...(wo.qcHistory || [])].reverse().find(h => h.result === 'Failed' || h.qcStatus === 'Failed');
        if (!latestFail) return [];
        
        const order = orders.find(o => o.orderNo === wo.orderNo);
        
        let mappedStatus = 'Reworking';
        if (wo.status === STATUS.CLOSED || wo.status === STATUS.QC_PASSED) {
          mappedStatus = 'Completed';
        } else if (wo.status === 'Rejected') {
          mappedStatus = 'Scrapped';
        }

        return [{
          id: wo.id,
          orderNo: wo.orderNo,
          customerName: order?.customer?.name || '—',
          productName: wo.productName,
          quantity: wo.quantity,
          defects: latestFail.failureReasons || latestFail.defects || [],
          inspector: latestFail.inspectorName || latestFail.inspector || 'QC Inspector',
          date: latestFail.inspectionDate || latestFail.date || '—',
          status: mappedStatus,
          orderObj: order
        }];
      });
    }

    return (
      <div className="app-card">
        <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '16px' }}>
          <div>
            <h2 className="card-heading" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={22} style={{ color: '#ef4444' }} />
              QC Failed Orders Log
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
              Historical register of orders that failed quality control checks and their current workflow states.
            </p>
          </div>
        </div>
        <DataTable
          columns={[
            { header: 'Order Reference', accessor: 'orderNo', render: (row) => (
              <span 
                style={{ color: 'var(--color-text-primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                onClick={() => {
                  if (row.orderObj) setSelectedOrderDetails(row.orderObj);
                }}
              >
                {row.orderNo}
              </span>
            ) },
            { header: 'Customer Name', accessor: 'customerName' },
            { header: 'Product Name', accessor: 'productName' },
            { header: 'Quantity', accessor: 'quantity', render: (row) => `${row.quantity} Tons` },
            { header: 'Failure Reason', accessor: 'defects', render: (row) => (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {row.defects.map((defect, i) => (
                  <span key={i} className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '800' }}>
                    {defect}
                  </span>
                ))}
              </div>
            ) },
            { header: 'Inspector', accessor: 'inspector' },
            { header: 'Inspection Date', accessor: 'date' },
            { header: 'Current Status', accessor: 'status', render: (row) => {
              if (row.status === 'Completed') {
                return <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#15803d', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>Completed</span>;
              }
              if (row.status === 'Scrapped') {
                return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>Scrapped</span>;
              }
              return <span className="badge animate-pulse" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>Reworking</span>;
            } }
          ]}
          data={qcFailedOrders}
          searchQuery={globalSearch}
          searchField="customerName"
          emptyMessage="No QC failure logs recorded."
        />
      </div>
    );
  };

  const renderFinishedGoods = () => {
    const handleSendToDispatch = async (row) => {
      try {
        const woId = row.workOrder?.id || row.workOrderId || row.id;
        if (!woId) throw new Error("Work Order ID missing");
        await backendFetch(`/api/backend/production/work-orders/${woId}/send-to-dispatch`, {
          method: "POST",
        });
        Swal.fire({ icon: 'success', title: 'Sent to Dispatch', text: `Finished goods sent to dispatch queue!`, timer: 1500, showConfirmButton: false });
        backendFetch('/api/backend/production/finished-goods').then(res => {
          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          setDirectFinishedGoods(list);
        }).catch(console.error);
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to send to dispatch' });
      }
    };

    const totalStock = directFinishedGoods.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const availableStock = directFinishedGoods.reduce((sum, item) => sum + (Number(item.availableQuantity ?? item.quantity) || 0), 0);
    const readyItemsCount = directFinishedGoods.length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="app-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'grid', placeItems: 'center' }}>
              <Package size={22} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-main, #0f172a)' }}>{totalStock.toLocaleString()}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Total Finished Stock Qty</div>
            </div>
          </div>

          <div className="app-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', display: 'grid', placeItems: 'center' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-main, #0f172a)' }}>{availableStock.toLocaleString()}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Available Qty (Dispatch)</div>
            </div>
          </div>

          <div className="app-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f3e8ff', color: '#7e22ce', display: 'grid', placeItems: 'center' }}>
              <Layers size={22} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-main, #0f172a)' }}>{readyItemsCount}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Finished Goods Count</div>
            </div>
          </div>
        </div>

        <div className="app-card">
          <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="card-heading" style={{ margin: 0 }}>Finished Goods Inventory Stock</h2>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                Factory staging area for quality approved products awaiting dispatch.
              </p>
            </div>
          </div>

          <DataTable
            columns={[
              { header: 'WO Number', accessor: 'jobNo', render: (row) => <strong>{row.jobNo || row.workOrderId}</strong> },
              { header: 'Product', accessor: 'productName', render: (row) => <div><strong>{row.productName || 'Finished Good'}</strong><br/><span style={{ fontSize: '11px', color: '#64748b' }}>{row.productCode || 'FG-STOCK'}</span></div> },
              { header: 'Customer', accessor: 'customerName', render: (row) => row.customerName || 'Internal' },
              { header: 'Total Qty', accessor: 'quantity', render: (row) => <span>{row.quantity} {row.unit || 'Pcs'}</span> },
              { header: 'Available Qty', accessor: 'availableQuantity', render: (row) => <strong style={{ color: '#10b981', background: '#ecfdf5', padding: '3px 8px', borderRadius: '999px', border: '1px solid #a7f3d0' }}>{row.availableQuantity ?? row.quantity} {row.unit || 'Pcs'}</strong> },
              { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status || 'AVAILABLE'} /> },
            ]}
            data={directFinishedGoods}
            searchQuery={globalSearch}
            searchField="productName"
            actions={(row) => (
              <button
                className="action-btn"
                style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => handleSendToDispatch(row)}
              >
                <Truck size={14} /> Send to Dispatch
              </button>
            )}
            emptyMessage="No finished goods records currently in stock."
          />
        </div>
      </div>
    );
  };

  const renderProducts = () => {
    return <ProductMasterUI role={user?.role || 'Plant Head'} />;
  };

  const renderProductFormPage = () => {
    return <ProductMasterUI role={user?.role || 'Plant Head'} />;
  };

  const renderRawInventory = () => {
    // If backend data exists, use it. Otherwise fallback to mock state rawInventory
    const rawInventoryList = directRawInventory.length > 0 
      ? directRawInventory 
      : (state.rawInventory || []);
    
    const mappedRaw = directRawInventory.length > 0 
      ? directRawInventory.map(item => ({...item, code: item.id?.substring(0, 8).toUpperCase(), category: 'Raw Material', reorderLevel: 50, rate: 0}))
      : getMappedInventory(rawInventoryList);

    const mappedInventory = mappedRaw.filter(item => {
      const code = (item.code || item.sku || item.id || '').toUpperCase();
      const name = (item.material || item.itemName || item.name || '').toLowerCase();
      if (code === 'RM001' || code.startsWith('SKU-') || code.includes('ITEM') || code.includes('ATP') || code.includes('NFW') || code.includes('HS')) return false;
      if (name.includes('shampoo') || name.includes('toothpaste') || name.includes('face wash')) return false;
      if (name.includes('sand fine grade') || name.includes('item (100 qty)') || name.includes('item (1 qty)')) return false;
      return true;
    });

    const filteredItems = mappedInventory.filter(item => {
      const q = rawSearchQuery.toLowerCase();
      return (
        (item.material || '').toLowerCase().includes(q) ||
        (item.code || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q)
      );
    });

    const totalMaterials = mappedInventory.length;
    const totalStockQty = mappedInventory.reduce((sum, i) => sum + i.stock, 0);
    const lowStockItems = mappedInventory.filter(i => i.stock <= i.reorderLevel && i.stock > 0).length;
    const outOfStockItems = mappedInventory.filter(i => i.stock === 0).length;
    const totalInventoryValue = mappedInventory.reduce((sum, i) => sum + (i.stock * i.rate), 0);

    const handleQuickStockIn = (item) => {
      Swal.fire({
        title: `Receive Stock: ${item.material}`,
        html: `
          <div style="text-align: left; display: flex; flex-direction: column; gap: 12px; padding: 6px 0;">
            <div>
              <label style="font-size: 12px; font-weight: 800; color: var(--color-text-secondary); text-transform: uppercase;">Quantity (${item.unit}) *</label>
              <input id="swal-qty" type="number" class="form-input" style="margin-top: 6px; width: 100%; box-sizing: border-box;" placeholder="e.g. 500">
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Submit Stock In',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'swal-premium-popup',
          title: 'swal-premium-title',
          htmlContainer: 'swal-premium-text',
          confirmButton: 'swal-premium-confirm-btn',
          cancelButton: 'swal-premium-cancel-btn'
        },
        buttonsStyling: false,
        preConfirm: () => {
          const qty = document.getElementById('swal-qty').value;
          if (!qty || Number(qty) <= 0) {
            Swal.showValidationMessage('Please enter a valid positive quantity');
            return false;
          }
          return { qty: Number(qty), rate: item.rate || 0 };
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await apiClient.post('/store/stock-transaction', {
              material_name: item.material,
              type: 'Stock In',
              quantity: result.value.qty,
              rate: result.value.rate,
              remarks: 'Quick stock receipt',
              reference: 'QUICK_STOCK_IN'
            });
            await syncData();
          } catch (err) {
            dispatch({ type: 'RECORD_STOCK_TRANSACTION', payload: { material: item.material, type: 'Stock In', quantity: result.value.qty, rate: result.value.rate, date: new Date().toISOString().split('T')[0], supplier: '', remarks: 'Quick stock receipt', reference: 'QUICK_STOCK_IN' } });
          }
          showToast(`Stock In recorded: +${result.value.qty} ${item.unit} for ${item.material}`);
        }
      });
    };

    const handleQuickStockOut = (item) => {
      Swal.fire({
        title: `Issue Stock: ${item.material}`,
        html: `
          <div style="text-align: left; display: flex; flex-direction: column; gap: 12px; padding: 6px 0;">
            <div>
              <label style="font-size: 12px; font-weight: 800; color: var(--color-text-secondary); text-transform: uppercase;">Quantity to Issue (${item.unit}) *</label>
              <input id="swal-qty" type="number" class="form-input" style="margin-top: 6px; width: 100%; box-sizing: border-box;" placeholder="e.g. 100">
            </div>
            <div>
              <label style="font-size: 12px; font-weight: 800; color: var(--color-text-secondary); text-transform: uppercase;">Reference (e.g. Work Order No)</label>
              <input id="swal-ref" type="text" class="form-input" style="margin-top: 6px; width: 100%; box-sizing: border-box;" placeholder="e.g. WO-0801">
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Issue Stock',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'swal-premium-popup',
          title: 'swal-premium-title',
          htmlContainer: 'swal-premium-text',
          confirmButton: 'swal-premium-confirm-btn',
          cancelButton: 'swal-premium-cancel-btn'
        },
        buttonsStyling: false,
        preConfirm: () => {
          const qty = document.getElementById('swal-qty').value;
          const ref = document.getElementById('swal-ref').value;
          if (!qty || Number(qty) <= 0) {
            Swal.showValidationMessage('Please enter a valid positive quantity');
            return false;
          }
          if (Number(qty) > item.stock) {
            Swal.showValidationMessage(`Insufficient Stock. Available: ${item.stock} ${item.unit}`);
            return false;
          }
          return { qty: Number(qty), ref };
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await apiClient.post('/store/stock-transaction', {
              material_name: item.material,
              type: 'Stock Out',
              quantity: result.value.qty,
              rate: item.rate,
              remarks: 'Stock issued',
              reference: result.value.ref || 'QUICK_STOCK_OUT'
            });
            await syncData();
          } catch (err) {
            dispatch({ type: 'RECORD_STOCK_TRANSACTION', payload: { material: item.material, type: 'Stock Out', quantity: result.value.qty, rate: item.rate, date: new Date().toISOString().split('T')[0], remarks: 'Stock issued', reference: result.value.ref || 'QUICK_STOCK_OUT' } });
          }
          showToast(`Stock Out recorded: -${result.value.qty} ${item.unit} for ${item.material}`);
        }
      });
    };

    const handleQuickAdjust = (item) => {
      Swal.fire({
        title: `Adjust Stock: ${item.material}`,
        html: `
          <div style="text-align: left; display: flex; flex-direction: column; gap: 12px; padding: 6px 0;">
            <div>
              <span style="font-size: 12.5px; color: var(--color-text-secondary);">Current stock: <strong>${item.stock} ${item.unit}</strong></span>
            </div>
            <div>
              <label style="font-size: 12px; font-weight: 800; color: var(--color-text-secondary); text-transform: uppercase;">Corrected Quantity (${item.unit}) *</label>
              <input id="swal-qty" type="number" class="form-input" style="margin-top: 6px; width: 100%; box-sizing: border-box;" value="${item.stock}">
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Correct Inventory',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'swal-premium-popup',
          title: 'swal-premium-title',
          htmlContainer: 'swal-premium-text',
          confirmButton: 'swal-premium-confirm-btn',
          cancelButton: 'swal-premium-cancel-btn'
        },
        buttonsStyling: false,
        preConfirm: () => {
          const qty = document.getElementById('swal-qty').value;
          if (qty === '' || Number(qty) < 0) {
            Swal.showValidationMessage('Please enter a non-negative quantity');
            return false;
          }
          return { qty: Number(qty) };
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await apiClient.post('/store/stock-transaction', {
              material_name: item.material,
              type: 'Adjustment',
              quantity: result.value.qty,
              rate: item.rate,
              remarks: 'Audit stock correction',
              reference: 'STOCK_ADJUSTMENT'
            });
            await syncData();
          } catch (err) {
            dispatch({ type: 'RECORD_STOCK_TRANSACTION', payload: { material: item.material, type: 'Adjustment', quantity: result.value.qty, rate: item.rate, date: new Date().toISOString().split('T')[0], remarks: 'Audit stock correction', reference: 'STOCK_ADJUSTMENT' } });
          }
          showToast(`Stock adjusted to ${result.value.qty} ${item.unit} for ${item.material}`);
        }
      });
    };

    const handleExport = () => {
      showToast('Exporting Raw Inventory Registry to Excel...');
      Swal.fire({
        icon: 'success',
        title: 'Export Complete',
        text: 'Raw Inventory registry data exported as Excel spreadsheet.',
        timer: 1500,
        showConfirmButton: false
      });
    };

    return (
      <div className="m-theme-container" style={{ width: '100%' }}>
        {/* Module Header Area */}
        <div className="m-theme-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="m-theme-title">Raw Inventory Management</h2>
            <p className="m-theme-subtitle">
              Roster, register and restock raw materials storage categories
            </p>
          </div>
          <div className="m-theme-actions">
            <button
              className="m-theme-btn-secondary"
              onClick={handleExport}
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Dashboard Summary Cards */}
        <div className="m-theme-kpi-grid">
          <div className="m-theme-kpi-card" style={{ '--card-border-color': '#0f766e' }}>
            <span className="m-theme-kpi-label">Total Materials</span>
            <span className="m-theme-kpi-value">{totalMaterials}</span>
          </div>
          <div className="m-theme-kpi-card" style={{ '--card-border-color': '#10b981' }}>
            <span className="m-theme-kpi-label">Total Stock Quantity</span>
            <span className="m-theme-kpi-value">{totalStockQty.toLocaleString()} Units</span>
          </div>
          <div className="m-theme-kpi-card" style={{ '--card-border-color': '#f59e0b' }}>
            <span className="m-theme-kpi-label">Low Stock Items</span>
            <span className="m-theme-kpi-value">{lowStockItems} Items</span>
            <span className="m-theme-kpi-subtitle" style={{ color: '#f59e0b' }}>Threshold breached</span>
          </div>
          <div className="m-theme-kpi-card" style={{ '--card-border-color': '#ef4444' }}>
            <span className="m-theme-kpi-label">Out of Stock Items</span>
            <span className="m-theme-kpi-value">{outOfStockItems} Items</span>
            <span className="m-theme-kpi-subtitle" style={{ color: '#ef4444' }}>Zero stock levels</span>
          </div>
          <div className="m-theme-kpi-card" style={{ '--card-border-color': '#8b5cf6' }}>
            <span className="m-theme-kpi-label">Total Inventory Value</span>
            <span className="m-theme-kpi-value">₹{totalInventoryValue.toLocaleString()}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="m-theme-search-container">
          <Search size={18} style={{ color: '#8893A7', marginRight: '8px' }} />
          <input
            type="text"
            className="m-theme-search-input"
            placeholder="Search raw materials by code, name, or category..."
            value={rawSearchQuery}
            onChange={(e) => setRawSearchQuery(e.target.value)}
          />
          {rawSearchQuery && (
            <button
              onClick={() => setRawSearchQuery('')}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#8893A7', marginLeft: '8px' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Raw Inventory Table */}
        <div className="m-theme-table-container">
          <table className="m-theme-table">
            <thead>
              <tr>
                <th>Material Code</th>
                <th>Material Name</th>
                <th>Unit</th>
                <th>Current Stock</th>
                <th>Minimum Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#8893A7', fontWeight: '600' }}>
                    No materials found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isOutOfStock = item.stock === 0;
                  const isLowStock = item.stock <= item.reorderLevel && item.stock > 0;

                  let statusText = 'IN STOCK';
                  let badgeColor = 'green';
                  if (isOutOfStock) {
                    statusText = 'OUT OF STOCK';
                    badgeColor = 'red';
                  } else if (isLowStock) {
                    statusText = 'LOW STOCK';
                    badgeColor = 'yellow';
                  }

                  return (
                    <tr
                      key={item.id}
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        if (e.target.closest('button')) return;
                        setSelectedInventoryItem(item);
                        setShowDetailDrawer(true);
                      }}
                    >
                      <td style={{ fontWeight: '800' }}>{item.code}</td>
                      <td style={{ fontWeight: '600', color: '#0f766e' }}>{item.material}</td>
                      <td>{item.unit}</td>
                      <td style={{ fontWeight: '800' }}>{item.stock.toLocaleString()}</td>
                      <td>{item.reorderLevel.toLocaleString()}</td>
                      <td>
                        <span className={`m-theme-badge m-theme-badge-${badgeColor}`}>{statusText}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            className="m-theme-btn-action-green"
                            onClick={() => handleQuickStockIn(item)}
                            title="Stock In"
                          >
                            + In
                          </button>
                          <button
                            className="m-theme-btn-action-gray"
                            onClick={() => handleQuickStockOut(item)}
                            title="Stock Out"
                          >
                            - Out
                          </button>
                          <button
                            className="m-theme-btn-action-gray"
                            onClick={() => handleQuickAdjust(item)}
                            title="Adjust Stock"
                          >
                            Adj
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* SIDE DRAWER: Material Details & Transaction Log */}
        {showDetailDrawer && selectedInventoryItem && (() => {
          const item = mappedInventory.find(mi => mi.id === selectedInventoryItem.id) || selectedInventoryItem;
          return (
            <>
              <div
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', zIndex: 1040, backdropFilter: 'blur(2px)' }}
                onClick={() => setShowDetailDrawer(false)}
              ></div>
              <div
                style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '520px', maxWidth: '90%', background: '#ffffff', boxShadow: '-10px 0 35px rgba(0,0,0,0.1)', zIndex: 1050, padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Registry Details</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-accent-teal)', marginTop: '4px' }}>{item.material}</h3>
                  </div>
                  <button onClick={() => setShowDetailDrawer(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '6px', borderRadius: '50%' }}><X size={20} /></button>
                </div>

                {/* Material Info Card */}
                <div style={{ background: '#F5FAFE', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Material Code</span>
                    <div style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--color-text-primary)', marginTop: '3px' }}>{item.code}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Category</span>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '3px' }}>{item.category}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Stock Unit</span>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '3px' }}>{item.unit}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Description</span>
                    <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '3px', lineHeight: '1.4' }}>{item.description || 'No description provided.'}</div>
                  </div>
                </div>

                {/* Stock Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                    <span style={{ fontSize: '9px', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase' }}>Stock Available</span>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#14532d', marginTop: '4px' }}>{item.stock.toLocaleString()}</div>
                  </div>
                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                    <span style={{ fontSize: '9px', color: '#78350f', fontWeight: 'bold', textTransform: 'uppercase' }}>Min Stock Alert</span>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#451a03', marginTop: '4px' }}>{item.reorderLevel.toLocaleString()}</div>
                  </div>
                </div>

                {/* Transaction History Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} /> Stock Transactions ledger
                  </h4>
                  <div style={{ overflowY: 'auto', flex: 1, maxHeight: '350px', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#F5FAFE', borderBottom: '1px solid var(--color-border)', zIndex: 10 }}>
                        <tr>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Date</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Type</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Qty</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Supplier/Ref</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!item.transactions || item.transactions.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'center', padding: '16px', color: 'var(--color-text-muted)' }}>No stock receipts or issuances logged.</td>
                          </tr>
                        ) : (
                          [...item.transactions].reverse().map((tx, idx) => {
                            let typeBadge = 'info';
                            if (tx.type === 'Stock In') typeBadge = 'success';
                            else if (tx.type === 'Stock Out') typeBadge = 'danger';
                            else if (tx.type === 'Adjustment') typeBadge = 'warning';

                            return (
                              <tr key={tx.id || idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                <td style={{ padding: '8px 12px' }}>{tx.date}</td>
                                <td style={{ padding: '8px 12px' }}>
                                  <span className={`badge badge-${typeBadge}`} style={{ fontSize: '10px', padding: '1px 6px' }}>{tx.type}</span>
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700' }}>
                                  {tx.type === 'Stock Out' ? '-' : tx.type === 'Stock In' ? '+' : ''}{tx.quantity.toLocaleString()}
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  <div style={{ fontWeight: '600' }}>{tx.supplier || tx.reference || 'N/A'}</div>
                                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{tx.remarks}</div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    className="action-btn"
                    style={{ flex: 1, padding: '10px', background: 'var(--color-primary)', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: '#000', cursor: 'pointer' }}
                    onClick={() => handleQuickStockIn(item)}
                  >
                    + Stock In
                  </button>
                  <button
                    className="action-btn btn-outline"
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => handleQuickStockOut(item)}
                  >
                    - Issue Out
                  </button>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    );
  };

  const renderAddMaterialPage = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', width: '100%', margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
        <div className="module-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="module-title">Register New Raw Material</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Create a new raw material record in the inventory catalog registry
            </p>
          </div>
          <button
            onClick={() => navigate.push('/plant-head/raw-inventory')}
            className="action-btn"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '40px', 
              height: '40px', 
              background: '#f1f5f9', 
              border: '1px solid #D6E2F0', 
              borderRadius: '50%', 
              cursor: 'pointer',
              color: '#334155',
              flexShrink: 0
            }}
            title="Back to Inventory"
          >
            <X size={20} />
          </button>
        </div>

        <div className="app-card" style={{ padding: '24px', background: 'var(--color-card-bg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-premium)', width: '100%', boxSizing: 'border-box' }}>
          <form onSubmit={handleAddMaterialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>Material Code *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. RM008" 
                  value={matCode} 
                  onChange={(e) => setMatCode(e.target.value)} 
                  required 
                  style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', height: '42px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>Material Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Silica Fume" 
                  value={matName} 
                  onChange={(e) => setMatName(e.target.value)} 
                  required 
                  style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', height: '42px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>Category *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Additive" 
                  value={matCategory} 
                  onChange={(e) => setMatCategory(e.target.value)} 
                  required 
                  style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', height: '42px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>Unit *</label>
                <select 
                  className="form-select" 
                  value={matUnit} 
                  onChange={(e) => setMatUnit(e.target.value)}
                  style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', height: '42px', fontWeight: '600' }}
                >
                  <option value="Kg">Kg</option>
                  <option value="Tons">Tons</option>
                  <option value="Bags">Bags</option>
                  <option value="Litres">Litres</option>
                  <option value="Units">Units</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>Minimum Stock Level *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 100" 
                  value={matMinStock} 
                  onChange={(e) => setMatMinStock(e.target.value)} 
                  required 
                  style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', height: '42px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>Standard Unit Rate (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 120" 
                  value={matRate} 
                  onChange={(e) => setMatRate(e.target.value)} 
                  style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', height: '42px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>Description</label>
              <textarea 
                className="form-input" 
                rows={4} 
                placeholder="Detailed material specification and remarks..." 
                value={matDescription} 
                onChange={(e) => setMatDescription(e.target.value)} 
                style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button 
                type="button" 
                onClick={() => navigate.push('/plant-head/raw-inventory')} 
                className="action-btn"
                style={{ padding: '12px 24px', background: '#f1f5f9', border: '1px solid #D6E2F0', borderRadius: '10px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="action-btn"
                style={{ padding: '12px 32px', background: 'var(--color-primary, #2F4375)', border: 'none', borderRadius: '10px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
              >
                Create Registry
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditMaterialPage = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', width: '100%', margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
        <div className="module-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="module-title">Edit Material Details</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Modify registry metadata for raw material: <strong style={{ color: 'var(--color-accent-teal)' }}>{editMatOldName}</strong>
            </p>
          </div>
          <button
            onClick={() => navigate.push('/plant-head/raw-inventory')}
            className="action-btn"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '40px', 
              height: '40px', 
              background: '#f1f5f9', 
              border: '1px solid #D6E2F0', 
              borderRadius: '50%', 
              cursor: 'pointer',
              color: '#334155',
              flexShrink: 0
            }}
            title="Back to Inventory"
          >
            <X size={20} />
          </button>
        </div>

        <div className="app-card" style={{ padding: '24px', background: 'var(--color-card-bg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-premium)', width: '100%', boxSizing: 'border-box' }}>
          <form onSubmit={handleEditMaterialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>Material Code *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editMatCode} 
                  onChange={(e) => setEditMatCode(e.target.value)} 
                  required 
                  style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', height: '42px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>Material Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editMatName} 
                  onChange={(e) => setEditMatName(e.target.value)} 
                  required 
                  style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', height: '42px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>Category *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editMatCategory} 
                  onChange={(e) => setEditMatCategory(e.target.value)} 
                  required 
                  style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', height: '42px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>Unit *</label>
                <select 
                  className="form-select" 
                  value={editMatUnit} 
                  onChange={(e) => setEditMatUnit(e.target.value)}
                  style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', height: '42px', fontWeight: '600' }}
                >
                  <option value="Kg">Kg</option>
                  <option value="Tons">Tons</option>
                  <option value="Bags">Bags</option>
                  <option value="Litres">Litres</option>
                  <option value="Units">Units</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>Minimum Stock Level *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={editMatMinStock} 
                  onChange={(e) => setEditMatMinStock(e.target.value)} 
                  required 
                  style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', height: '42px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>Standard Unit Rate (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={editMatRate} 
                  onChange={(e) => setEditMatRate(e.target.value)} 
                  style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', height: '42px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="form-label" style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>Description</label>
              <textarea 
                className="form-input" 
                rows={4} 
                value={editMatDescription} 
                onChange={(e) => setEditMatDescription(e.target.value)} 
                style={{ background: '#F5FAFE', borderColor: '#DCE5F0', color: '#24345C', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button 
                type="button" 
                onClick={() => navigate.push('/plant-head/raw-inventory')} 
                className="action-btn"
                style={{ padding: '12px 24px', background: '#f1f5f9', border: '1px solid #D6E2F0', borderRadius: '10px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="action-btn"
                style={{ padding: '12px 32px', background: 'var(--color-primary, #2F4375)', border: 'none', borderRadius: '10px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const handleApproveReplacement = async (row) => {
    const available = Number(row.delivered_qty || 0) - Number(row.approved_qty || 0);
    const { value } = await Swal.fire({
      title: `Approve ${row.request_no}`,
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:10px; font-size:13px;">
          <div><strong>Product:</strong> ${row.product_name || 'N/A'}</div>
          <div><strong>Delivered Qty:</strong> ${row.delivered_qty || 0}</div>
          <div><strong>Requested Qty:</strong> ${row.requested_qty || 0}</div>
          <div><strong>Available:</strong> ${Math.max(0, available)}</div>
          <label style="font-weight:800;">Approve Qty</label>
          <input id="approve-qty" type="number" min="0.01" step="0.01" value="${row.requested_qty || 0}" class="swal2-input" style="margin:0; width:100%;" />
          <label style="font-weight:800;">Remarks</label>
          <textarea id="approve-remarks" style="width:100%; min-height:70px; border:1px solid var(--color-border); border-radius:8px; padding:10px;">Approved</textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Approve',
      preConfirm: () => {
        const qty = Number(document.getElementById('approve-qty').value);
        const remarks = document.getElementById('approve-remarks').value.trim();
        if (!qty || qty <= 0) {
          Swal.showValidationMessage('Approve quantity must be positive.');
          return false;
        }
        return { approvedQty: qty, remarks };
      }
    });
    if (!value) return;
    await apiClient.patch(`/replacements/${row.id}/approve`, value);
    showToast?.('Replacement approved.');
    fetchReplacementRequests();
  };

  const handleRejectReplacement = async (row) => {
    const { value: reason } = await Swal.fire({
      title: `Reject ${row.request_no}`,
      input: 'textarea',
      inputLabel: 'Rejection reason',
      inputPlaceholder: 'Enter reason...',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      inputValidator: (value) => !value?.trim() ? 'Reason is mandatory.' : undefined
    });
    if (!reason) return;
    await apiClient.patch(`/replacements/${row.id}/reject`, { reason });
    showToast?.('Replacement rejected.');
    fetchReplacementRequests();
  };

  const INDENT_STATUS_LABELS = {
    PENDING_PLANT_HEAD: { label: 'Pending Approval', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    REJECTED_BY_PLANT_HEAD: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    PENDING_PO: { label: 'Approved → Finance', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    PO_CREATED: { label: 'PO Created', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    AWAITING_FINANCE_CLOSURE: { label: 'Awaiting Closure', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
    PARTIALLY_RECEIVED: { label: 'Partially Received', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
    CLOSED: { label: 'Closed', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  };

  const PRIORITY_STYLE = {
    Low:       { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    Medium:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    High:      { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    Emergency: { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  };

  const renderMaterialIndents = () => {
    if (!isMounted) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#5E6B82' }}>
          Loading material indents...
        </div>
      );
    }
    const allIndents = directMaterialIndents.length > 0 ? directMaterialIndents : materialIndents;
    console.log('[PlantHeadPortal] Loaded material indents:', allIndents);

    const pendingCount = allIndents.filter(i => i.status === 'PENDING_PLANT_HEAD_APPROVAL' || i.status === 'PENDING_PLANT_HEAD' || i.status === 'PENDING').length;
    const approvedCount = allIndents.filter(i => i.status === 'PLANT_HEAD_APPROVED').length;
    const rejectedCount = allIndents.filter(i => i.status === 'PLANT_HEAD_REJECTED' || i.status === 'CORRECTION_REQUIRED' || i.status === 'RETURNED_FOR_CORRECTION').length;
    const totalLines = allIndents.reduce((sum, i) => sum + (i.items?.length || 1), 0);

    const tabs = [
      { key: 'All', label: 'All', count: allIndents.length },
      { key: 'PENDING', label: 'REQUESTED', count: pendingCount },
      { key: 'PLANT_HEAD_APPROVED', label: 'APPROVED', count: approvedCount },
      { key: 'PLANT_HEAD_REJECTED', label: 'RETURNED/REJECTED', count: rejectedCount },
    ];

    const filteredIndents = allIndents.filter(ind => {
      const matchSearch = !indentSearch ||
        ind.id?.toLowerCase().includes(indentSearch.toLowerCase()) ||
        (ind.materialName || ind.material || '').toLowerCase().includes(indentSearch.toLowerCase()) ||
        (ind.items || []).some(it => (it.material || it.name || '').toLowerCase().includes(indentSearch.toLowerCase()));
      let matchStatus = true;
      if (indentStatusFilter === 'PENDING') matchStatus = ind.status === 'PENDING_PLANT_HEAD_APPROVAL' || ind.status === 'PENDING_PLANT_HEAD' || ind.status === 'PENDING';
      else if (indentStatusFilter === 'PLANT_HEAD_REJECTED') matchStatus = ind.status === 'PLANT_HEAD_REJECTED' || ind.status === 'CORRECTION_REQUIRED' || ind.status === 'RETURNED_FOR_CORRECTION';
      else if (indentStatusFilter !== 'All') matchStatus = ind.status === indentStatusFilter;
      return matchSearch && matchStatus;
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "var(--font-main, 'Inter', sans-serif)" }}>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { icon: <ClipboardList size={16} color="#3b82f6" />, label: 'Pending Orders', value: pendingCount + ' Orders', sub: 'Awaiting clearance approval' },
            { icon: <Package size={16} color="#3b82f6" />, label: 'Total Material Lines', value: totalLines + ' Items', sub: 'Ready for verification' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 14, padding: '18px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                {stat.icon}
                <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#24345C', lineHeight: 1.1 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#8893A7', marginTop: 4 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Title + Search + Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#24345C' }}>Material Release Approvals</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8893A7' }} />
              <input
                type="text" placeholder="Search order, requester, material…"
                value={indentSearch} onChange={e => setIndentSearch(e.target.value)}
                style={{ paddingLeft: 30, width: 220, border: '1px solid #DCE5F0', borderRadius: 8, padding: '7px 10px 7px 30px', fontSize: 13, background: '#F5FAFE', color: '#24345C', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: '4px' }}>
              {tabs.map(tab => {
                const isActive = indentStatusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setIndentStatusFilter(tab.key)}
                    style={{
                      border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      background: isActive ? '#2F4375' : 'transparent',
                      color: isActive ? '#ffffff' : '#5E6B82',
                      transition: 'all 0.15s',
                    }}
                  >
                    {tab.label} ({tab.count})
                  </button>
                );
              })}
            </div>
            <button onClick={fetchMaterialIndents} style={{ border: '1px solid #DCE5F0', borderRadius: 8, padding: '7px 12px', fontSize: 12, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: '#5E6B82' }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {/* Count line */}
        <div style={{ fontSize: 13, color: '#5E6B82', marginTop: -8 }}>
          Showing {filteredIndents.length} group(s) · {filteredIndents.filter(i => i.status === 'PENDING_PLANT_HEAD' || i.status === 'PENDING_PLANT_HEAD_APPROVAL').length} pending
        </div>

        {/* Indent Cards */}
        {indentsLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '40px 0', color: '#8893A7' }}>
            <Loader2 size={18} className="spin" /> Loading material indents…
          </div>
        ) : filteredIndents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#8893A7', background: '#fff', borderRadius: 14, border: '1px solid #e8ecf0' }}>
            <FileText size={38} style={{ marginBottom: 12, opacity: 0.25 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#5E6B82', marginBottom: 6 }}>No indent requests found</div>
            <div style={{ fontSize: 13 }}>Indents raised by the Store department will appear here.</div>
          </div>
        ) : filteredIndents.map(ind => {
          const isPending = ind.status === 'PENDING_PLANT_HEAD' || ind.status === 'PENDING_PLANT_HEAD_APPROVAL' || ind.status === 'PENDING';
          const isApproved = ind.status === 'PLANT_HEAD_APPROVED';
          const isRejected = ind.status === 'PLANT_HEAD_REJECTED' || ind.status === 'RETURNED_FOR_CORRECTION';

          // Normalize line items
          const lineItems = ind.items?.length
            ? ind.items
            : [{ material: ind.material || 'Material', quantity: ind.quantity || 0, unit: ind.unit || 'Units', quantity_ordered: ind.quantity || 0 }];

          return (
            <div
              key={ind.id}
              style={{
                background: '#fff',
                border: '1px solid #e8ecf0',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
              }}
            >
              {/* Card Header */}
              <div style={{ padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Box size={16} color="#3BAEEB" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 14, color: '#24345C', letterSpacing: '0.01em' }}>{ind.id}</div>
                    <div style={{ fontSize: 12, color: '#5E6B82', marginTop: 1 }}>{ind.reason || ind.notes || 'Purchase Indent Request'}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#8893A7' }}>
                  Requested by: <span style={{ color: '#475569', fontWeight: 600 }}>Store</span>
                  {ind.createdAt && <span style={{ marginLeft: 8, color: '#D6E2F0' }}>· {new Date(ind.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#f1f5f9', margin: '0 22px' }} />

              {/* Material Lines */}
              <div style={{ padding: '4px 22px' }}>
                {lineItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: idx < lineItems.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#24345C' }}>
                      {item.material || item.name || 'Material'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 54 }}>
                        <div style={{ fontSize: 11, color: '#8893A7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Requested</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#24345C', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: 36 }}>
                          {item.quantity_ordered ?? item.quantity ?? 0} <span style={{ fontWeight: 600, color: '#5E6B82', fontSize: 13, marginLeft: 5 }}>{item.unit || 'Units'}</span>
                        </div>
                      </div>
                      {isPending && (
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 54 }}>
                          <div style={{ fontSize: 11, color: '#8893A7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Approve Qty ({item.unit || 'Units'})</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 36 }}>
                            <input
                              id={"aq-" + ind.id.replace(/[^a-z0-9]/gi, '-') + "-" + idx}
                              type="number"
                              defaultValue={item.quantity_ordered ?? item.quantity ?? 0}
                              min="0"
                              style={{
                                width: 96, height: 36, border: '1.5px solid #D6E2F0', borderRadius: 8, padding: '0 12px',
                                fontSize: 15, fontWeight: 800, textAlign: 'center', background: '#F5FAFE', color: '#24345C',
                                outline: 'none'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Approved/Rejected badge */}
              {(isApproved || isRejected || ind.status === 'CORRECTION_REQUIRED') && (
                <div style={{
                  margin: '0 22px 14px', padding: '9px 14px', borderRadius: 8,
                  background: isApproved ? '#f0fdf4' : ind.status === 'CORRECTION_REQUIRED' ? '#fef3c7' : '#fef2f2',
                  fontSize: 13,
                  color: isApproved ? '#15803d' : ind.status === 'CORRECTION_REQUIRED' ? '#d97706' : '#dc2626',
                  border: '1px solid ' + (isApproved ? '#bbf7d0' : ind.status === 'CORRECTION_REQUIRED' ? '#fde68a' : '#fca5a5')
                }}>
                  {isApproved ? '✓ Approved' : ind.status === 'CORRECTION_REQUIRED' ? '↩ Returned for Correction' : '🚫 Rejected'}
                  {ind.plantHeadRemarks && <span style={{ marginLeft: 8, fontWeight: 400 }}>— {ind.plantHeadRemarks}</span>}
                </div>
              )}

              {/* Footer Actions */}
              {isPending && (
                <div style={{ padding: '12px 22px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#fafafa' }}>
                  <button
                    className="btn-outline-navy"
                    style={{ border: '1.5px solid #dc2626', color: '#dc2626', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: 'transparent' }}
                    onClick={() => handleRejectIndentClick(ind)}
                  >
                    Reject
                  </button>
                  <button
                    className="btn-outline-navy"
                    style={{ border: '1.5px solid #d97706', color: '#d97706', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: 'transparent' }}
                    onClick={() => handleReturnForCorrectionClick(ind)}
                  >
                    Return for Correction
                  </button>
                  <button
                    style={{ background: '#22C55E', color: '#ffffff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                    onClick={() => {
                      const approvedItems = lineItems.map((item, idx) => {
                        const safeId = 'aq-' + ind.id.replace(/[^a-z0-9]/gi, '-') + '-' + idx;
                        return {
                          ...item,
                          quantity_ordered: Number(document.getElementById(safeId)?.value) || item.quantity_ordered || item.quantity || 0
                        };
                      });
                      Swal.fire({
                        title: 'Approval Remarks',
                        input: 'textarea',
                        inputPlaceholder: 'Optional remarks for Finance team...',
                        showCancelButton: true,
                        confirmButtonText: 'Sign & Release',
                        confirmButtonColor: '#22c55e',
                      }).then(result => {
                        if (result.isConfirmed) {
                          approveMaterialIndent(ind.id, result.value || 'Approved by Plant Head');
                          apiClient.patch('/plant-head/material-indents/' + ind.id + '/approve', {
                            items: approvedItems, remarks: result.value
                          }).catch(() => {});
                          showToast?.('Indent approved and sent to Finance.');
                        }
                      });
                    }}
                  >
                    Sign & Release Materials
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

    const renderReplacementRequests = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900 }}>Replacement Requests</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>Approve, partially approve, or reject sales replacement requests.</p>
      </div>
      <div className="app-card" style={{ padding: '18px' }}>
        {replacementLoading ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading replacement requests...</p>
        ) : (
          <div className="crm-table-container">
            <table className="crm-table responsive-table">
              <thead>
                <tr>
                  <th>Request No</th>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Requested</th>
                  <th>Approved</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {replacementRequests.length === 0 ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '28px', color: 'var(--color-text-muted)' }}>No replacement requests found.</td></tr>
                ) : replacementRequests.map(row => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 800, fontFamily: 'monospace' }}>{row.request_no}</td>
                    <td>{row.order_number}</td>
                    <td>{row.customer_name}</td>
                    <td>{row.product_name}</td>
                    <td>{row.requested_qty}</td>
                    <td>{row.approved_qty}</td>
                    <td>{row.reason}</td>
                    <td><StatusBadge status={row.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      {row.status === 'PENDING' ? (
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button className="btn-small btn-outline-small" onClick={() => handleApproveReplacement(row)}>Approve</button>
                          <button className="btn-small btn-outline-small" onClick={() => handleRejectReplacement(row)}>Reject</button>
                        </div>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <O2PWorkflowBanner accentColor="#8b5cf6" />
      {(currentView === 'dashboard' || currentView === '') && <PlantHeadDashboard />}
      {currentView === 'incoming-orders' && renderIncomingOrders()}
      {currentView === 'planning' && renderPlanningPage()}
      {currentView === 'material-approvals' && <PlantHeadMaterialApprovalView />}
      {currentView === 'material-indents' && renderMaterialIndents()}
      {currentView === 'replacements' && <ReplacementsView />}
      {currentView === 'returns' && <ReturnsView />}
      {currentView === 'production-analytics' && <PlantHeadProductionAnalytics />}
      {currentView === 'material-analytics' && <PlantHeadMaterialAnalytics />}
      {currentView === 'department-overview' && <PlantHeadDepartmentOverview />}
      {currentView === 'executive-reports' && <PlantHeadExecutiveReports />}
      {currentView === 'reports' && renderReports()}
      {currentView === 'qc-failures' && renderQCFailures()}
      {currentView === 'products' && renderProducts()}
      {(currentView === 'products-add' || currentView === 'products-edit') && renderProductFormPage()}
      {currentView === 'raw-inventory' && renderRawInventory()}
      {currentView === 'finished-goods' && renderFinishedGoods()}
      {currentView === 'add-material' && renderAddMaterialPage()}
      {currentView === 'edit-material' && renderEditMaterialPage()}
      {currentView === 'indent-approvals' && <MaterialIndentApproval />}

      {!['dashboard', 'incoming-orders', 'planning', 'material-approvals', 'material-indents', 'replacements', 'returns', 'production-analytics', 'material-analytics', 'department-overview', 'executive-reports', 'reports', 'qc-failures', 'products', 'products-add', 'products-edit', 'raw-inventory', 'finished-goods', 'add-material', 'edit-material', 'indent-approvals'].includes(currentView) && (
        <ModulePlaceholder 
          title="Module Not Available" 
          description="This Plant Head feature is not implemented yet." 
          route={`/plant-head/${currentView}`} 
        />
      )}

      {/* Planning Modal */}
      {showPlanningModal && selectedOrderForPlanning && (
        <div className="modal-overlay active" onClick={() => { setShowPlanningModal(false); if(orderNoParam) navigate.push('/plant-head/' + view); }} style={{ zIndex: 10000 }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '640px', maxWidth: 'calc(100vw - 32px)' }}>
            <div className="modal-header-row" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 className="modal-title-text" style={{ margin: 0, fontWeight: '800' }}>Decide Production Date</h3>
              <button className="modal-close-btn" onClick={() => { setShowPlanningModal(false); if(orderNoParam) navigate.push('/plant-head/' + view); }}>✕</button>
            </div>

            {/* Read-Only Details Card */}
            <div style={{ background: '#F5FAFE', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '18px 24px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-accent-teal, #337a86)', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Details (Read-Only)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px 24px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                <div>Order ID: <strong style={{ color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>{selectedOrderForPlanning.orderNo}</strong></div>
                <div>Customer: <strong style={{ color: 'var(--color-text-primary)' }}>{selectedOrderForPlanning.customerName || selectedOrderForPlanning.customer?.name || 'Unknown'}</strong></div>
                <div>Product: <strong style={{ color: 'var(--color-text-primary)' }}>{selectedOrderForPlanning.products}</strong></div>
                <div>Quantity: <strong style={{ color: 'var(--color-text-primary)' }}>{selectedOrderForPlanning.quantity} Tons</strong></div>
                <div style={{ gridColumn: 'span 2' }}>Created Date: <strong style={{ color: 'var(--color-text-primary)' }}>{selectedOrderForPlanning.date || '15 June 2026'}</strong></div>
              </div>
            </div>

            <form onSubmit={handlePlanningSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0, color: 'var(--color-text-primary)' }}>Target Date *</label>
                  {targetDate && targetDate < new Date().toISOString().split('T')[0] && (
                    <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', border: '1px solid #dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                      ⚠️ Late Decision
                    </span>
                  )}
                </div>
                <input 
                  data-testid="plant-head-target-date"
                  type="date" 
                  required 
                  className="form-input" 
                  style={{ background: '#ffffff', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)', padding: '10px 14px', borderRadius: '8px' }} 
                  value={targetDate} 
                  onChange={(e) => setTargetDate(e.target.value)} 
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ color: 'var(--color-text-primary)', marginBottom: '6px' }}>Priority *</label>
                <select 
                  data-testid="plant-head-priority"
                  className="form-select" 
                  style={{ background: '#ffffff', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold' }} 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                  required
                >
                  <option value="Low">Low 🟢</option>
                  <option value="Medium">Medium 🟡</option>
                  <option value="High">High 🔴</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button data-testid="plant-head-send-production" type="submit" disabled={isPlanningSubmitting} className="form-submit-btn" style={{ margin: 0, padding: '12px 24px', flex: 1, background: 'var(--color-primary, #2F4375)', color: '#ffffff', border: 'none', fontWeight: '700', borderRadius: '10px', cursor: isPlanningSubmitting ? 'wait' : 'pointer', opacity: isPlanningSubmitting ? 0.7 : 1 }}>
                  {isPlanningSubmitting ? 'Sending to Production...' : 'Set Target Date & Send to Production'}
                </button>
                <button 
                  type="button" 
                  className="btn-small btn-outline-small" 
                  onClick={() => {
                    setShowPlanningModal(false);
                    setSelectedOrderForPlanning(null);
                    if (orderNoParam) {
                      navigate.push('/plant-head/' + view);
                    }
                  }} 
                  style={{ margin: 0, padding: '12px 24px', background: 'transparent', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {selectedOrderDetails && (
        <OrderDetailsModal
          order={selectedOrderDetails}
          role="plant"
          onClose={() => setSelectedOrderDetails(null)}
        />
      )}
    </>
  );
}

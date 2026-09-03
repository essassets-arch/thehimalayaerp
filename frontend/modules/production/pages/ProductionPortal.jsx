'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useRouter, usePathname, useParams, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { useERP, useSalesBackend } from '../../../shared/context/ERPContext';
import { useERPStore } from '@/store/erpStore';
import { STATUS } from '../../../shared/constants';
import { useAuth } from '../../../shared/context/AuthContext';
import MyProfileView from '../../../shared/components/MyProfileView';
import { productionService } from '../../../services/production.service';
import { backendFetch } from '../../../lib/backendFetch';
import { useMaterialRequests } from '../../../hooks/useMaterialRequests';
import { getProductionWorkOrders } from '../utils/getProductionWorkOrders';
import { selectProductionIncomingOrders, selectProductionWorkOrders } from '../../../store/domains/sales/salesSelectors';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import OrderDetailsModal from '../../../shared/components/OrderDetailsModal';
import { Play, CheckCircle2, PlusCircle, PackagePlus, X, CheckCircle, Clock, AlertCircle, Trash2, Layers, Grid, Box, Boxes, Wrench, Settings, Hammer, Activity, CircleDot, Search, Plus, ArrowLeft, Cpu, Pause, User, Truck, PackageCheck, RefreshCw, ShieldAlert, Printer, Edit, Eye, Package, ClipboardList, ClipboardCheck, Download, Briefcase } from 'lucide-react';
// BOM_MASTER removed (using dynamic database lookup)
import ProductionMaterialCreateView from '../../../components/material-workflow/ProductionMaterialCreateView';
import ProductionStoreReleasesView from '../../../components/material-workflow/ProductionStoreReleasesView';
import ProductionMaterialRequestsView from '../../../components/material-workflow/ProductionMaterialRequestsView';
import ProductionMaterialReceiptsView from '../../../components/material-workflow/ProductionMaterialReceiptsView';
import ProductionMaterialConsumptionView from '../../../components/material-workflow/ProductionMaterialConsumptionView';
import ProductionMaterialReturnsView from '../../../components/material-workflow/ProductionMaterialReturnsView';
import QCPendingView from '../components/qc/QCPendingView';
import QCHistoryView from '../components/qc/QCHistoryView';
import FinishedGoodsView from '../components/FinishedGoodsView';
import DailyReportEntryView from '../components/DailyReportEntryView';
import DailyReportHistoryView from '../components/DailyReportHistoryView';
import DailyReportPrintView from '../components/DailyReportPrintView';
import ProductionReportsView from '../components/ProductionReportsView';
import ProductionOperationsDashboard from '../../../components/ProductionOperationsDashboard';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, PieChart, Pie, LineChart, Line, Legend } from 'recharts';

const HARDWARE_ITEMS = [
  { material: 'Bolts (M12)', stock: 1500, unit: 'Units', reorderLevel: 200 },
  { material: 'Steel Plates', stock: 85, unit: 'Units', reorderLevel: 10 },
  { material: 'Metal Brackets', stock: 350, unit: 'Units', reorderLevel: 50 },
  { material: 'PVC Pipes (4")', stock: 120, unit: 'Meters', reorderLevel: 20 },
  { material: 'Valve Fittings', stock: 45, unit: 'Units', reorderLevel: 10 },
  { material: 'Weld Rods (Box)', stock: 60, unit: 'Boxes', reorderLevel: 15 },
  { material: 'Gaskets', stock: 400, unit: 'Units', reorderLevel: 100 }
];

const MACHINES = ['Mixer-1', 'Mixer-2', 'Extruder-1', 'Kiln-3', 'Assembly Line Alpha', 'Molding Station-4'];
const OPERATORS = ['Ravi Sharma', 'Amit Patel', 'Vikram Singh', 'Suresh Kumar', 'Rajesh Yadav', 'Vijay Verma'];

const formatDuration = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num) => String(num).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const isRunningProductionStatus = (status) =>
  [STATUS.IN_PRODUCTION, 'PRODUCTION_STARTED', STATUS.REWORK].includes(status);

const normalizeProductionOrder = (order, sourceQuotation) => {
  const rawItems = Array.isArray(order?.detailedItems) && order.detailedItems.length
    ? order.detailedItems
    : (Array.isArray(order?.items) && order.items.length ? order.items : (sourceQuotation?.detailedItems || []));
  const detailedItems = rawItems.map((item) => ({
    ...item,
    productName: item.productName || item.product_name || item.name || 'Item',
    productDetails: item.productDetails || item.product_details || item.description || '',
    quantity: Number(item.quantity ?? item.qty ?? 0),
    unitPrice: Number(item.unitPrice ?? item.price ?? item.rate ?? 0)
  }));
  const productNames = detailedItems.map((item) => item.productName).filter(Boolean).join(', ');
  const totalQuantity = detailedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    ...order,
    orderNo: order.orderNo || order.order_no || order.public_id || order.id,
    customerName: order.customerName || order.customer_name || order.companyName || order.customer?.name || sourceQuotation?.customerName || sourceQuotation?.customer_name || '',
    detailedItems,
    products: order.products || order.productItem || order.product_name || productNames,
    productInterested: order.productInterested || order.product_item || order.products || order.product_name || productNames,
    estimatedQuantity: Number(order.estimatedQuantity ?? order.estimated_quantity ?? order.quantity ?? order.totalQuantity ?? order.total_quantity ?? order.total_tonnage ?? totalQuantity),
    totalQuantity: Number(order.totalQuantity ?? order.total_quantity ?? order.quantity ?? order.total_tonnage ?? totalQuantity),
    targetDate: order.targetDate || order.target_date || order.productionTargetDate || order.targetProductionDate || order.plan?.targetDate || order.plan?.target_date || order.productionPlan?.targetDate || '',
    priority: order.priority || order.plan?.priority || order.productionPlan?.priority || 'Medium',
    deliveryDate: order.deliveryDate || order.delivery_date || order.expectedDeliveryDate || order.expected_delivery_date || sourceQuotation?.deliveryDate || sourceQuotation?.validTill || '',
    workflowStatus: order.workflowStatus || order.workflow_status || order.productionStatus || order.status,
    status: order.status || order.workflowStatus || order.workflow_status || order.productionStatus
  };
};

const ActiveFloorCard = ({ wo, customerName, targetDate, onPause, onResume, onComplete, todayStr }) => {
  const [elapsed, setElapsed] = useState(0);
  const isRunning = isRunningProductionStatus(wo.status);

  const totalQty = Number(wo.quantity || wo.targetQuantity || wo.total_tonnage || 10) || 10;
  const progressPercent = Number(wo.progress || 0) || 0;
  const producedQty = Number(wo.quantityProduced || wo.producedQty || Math.round(totalQty * (progressPercent / 100)) || 0);
  const resolvedTarget = targetDate && targetDate !== '—' && targetDate !== 'undefined' ? targetDate : (wo.deliveryDate || wo.targetDate || '2026-07-28');

  useEffect(() => {
    const calculateTime = () => {
      const accumulated = wo.accumulatedTime || 0;
      const startedAt = wo.lastStartedAt || (isRunning ? (wo.createdAt ? new Date(wo.createdAt).getTime() : Date.now()) : null);
      if (isRunning && startedAt) {
        const timeDiff = Math.max(0, Date.now() - startedAt);
        setElapsed(accumulated + timeDiff);
      } else {
        setElapsed(accumulated);
      }
    };

    calculateTime();

    if (!isRunning) return;

    const interval = setInterval(() => {
      calculateTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, wo.accumulatedTime, wo.lastStartedAt, wo.createdAt]);

  const formatDuration = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isOverdue = todayStr > (wo.targetDate || '');

  return (
    <div className="active-floor-card-container">
      {/* SECTION 1: Identity & Badge */}
      <div style={{ flex: '1 1 240px', minWidth: 0, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--color-primary)', letterSpacing: '0.5px' }}>
            {wo.id}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isOverdue && (
              <span className="badge animate-pulse" style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>
                ⚠️ Delayed
              </span>
            )}
            {wo.status === STATUS.PAUSED ? (
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>
                ⏸ Paused
              </span>
            ) : (
              <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.08)', color: '#15803d', border: '1px solid rgba(34, 197, 94, 0.15)', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} /> Running
              </span>
            )}
          </div>
        </div>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0, wordBreak: 'break-word' }}>{wo.productName}</h3>
          <div style={{ display: 'flex', gap: '8px 12px', fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', flexWrap: 'wrap' }}>
            <span>Customer: <strong style={{ color: 'var(--color-text-primary)' }}>{customerName}</strong></span>
            <span>Produced: <strong style={{ color: 'var(--color-text-primary)' }}>{producedQty}/{totalQty} Tons</strong></span>
            <span>Target: <strong style={{ color: 'var(--color-text-primary)' }}>{resolvedTarget}</strong></span>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: Duration Clock + Controls */}
      <div className="active-floor-card-bottom">
        {/* Running Time Box */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: isRunning ? 'rgba(16, 185, 129, 0.04)' : 'rgba(245, 158, 11, 0.04)',
          border: isRunning ? '1px solid rgba(16, 185, 129, 0.12)' : '1px solid rgba(245, 158, 11, 0.12)',
          padding: '6px 14px',
          borderRadius: '10px',
          height: '48px',
          minWidth: '105px'
        }}>
          <span style={{ fontSize: '9.5px', color: '#5E6B82', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={10} style={{ color: isRunning ? '#10b981' : '#f59e0b' }} />
            Duration
          </span>
          <strong style={{
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '13.5px',
            color: isRunning ? '#059669' : '#d97706',
            fontWeight: '800',
            letterSpacing: '0.5px',
            marginTop: '1px'
          }}>
            {formatDuration(elapsed)} ⏱
          </strong>
        </div>

        {/* Buttons Controls */}
        <div className="active-floor-card-actions">
          {wo.status === STATUS.PAUSED ? (
            <button
              type="button"
              onClick={() => onResume(wo)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                background: 'linear-gradient(135deg, #1e293b 0%, #24345C 100%)',
                color: 'var(--color-lime-brand)',
                border: 'none',
                padding: '9px 14px',
                borderRadius: '8px',
                fontWeight: '800',
                cursor: 'pointer',
                fontSize: '12px',
                boxShadow: '0 4px 10px rgba(15, 23, 42, 0.15)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 14px rgba(15, 23, 42, 0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(15, 23, 42, 0.15)'; }}
            >
              <Play size={12} fill="var(--color-lime-brand)" /> Resume
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onPause(wo)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                background: '#ffffff',
                border: '1.5px solid #D6E2F0',
                color: '#475569',
                padding: '9px 14px',
                borderRadius: '8px',
                fontWeight: '800',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F5FAFE'; e.currentTarget.style.color = '#24345C'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#475569'; }}
            >
              <Pause size={12} /> Pause
            </button>
          )}

          <button
            type="button"
            onClick={() => onComplete(wo)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontWeight: '800',
              cursor: 'pointer',
              fontSize: '12px',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.15)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 14px rgba(16, 185, 129, 0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(16, 185, 129, 0.15)'; }}
          >
            Complete
          </button>
        </div>
      </div>

    </div>
  );
};

// ── Running Orders Summary Table (live duration tickers per row) ──
const RunningOrdersTable = ({ workOrders, orders, todayStr }) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const runningWOs = workOrders.filter(wo =>
    isRunningProductionStatus(wo.status) || wo.status === STATUS.PAUSED
  );

  if (runningWOs.length === 0) return null;

  const getElapsed = (wo) => {
    const accumulated = wo.accumulatedTime || 0;
    const isActive = isRunningProductionStatus(wo.status);
    if (isActive && wo.lastStartedAt) {
      return accumulated + (Date.now() - wo.lastStartedAt);
    }
    return accumulated;
  };

  const statusChip = (status) => {
    if (status === STATUS.IN_PRODUCTION || status === 'PRODUCTION_STARTED') return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(34,197,94,0.08)', color: '#15803d', border: '1px solid rgba(34,197,94,0.2)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px #22c55e' }} />
        Running
      </span>
    );
    if (status === STATUS.PAUSED) return (
      <span style={{ background: 'rgba(245,158,11,0.08)', color: '#b45309', border: '1px solid rgba(245,158,11,0.2)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>⏸ Paused</span>
    );
    if (status === STATUS.REWORK) return (
      <span style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>🔁 Rework</span>
    );
    return <span>{status}</span>;
  };

  return (
    <div style={{ background: 'var(--color-card-bg)', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-soft)', overflow: 'hidden' }}>
      {/* Table Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', borderBottom: '1px solid var(--color-border)', background: 'rgba(16,185,129,0.03)' }}>
        <Activity size={16} style={{ color: '#10b981' }} />
        <span style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--color-text-primary)' }}>Running Orders</span>
        <span style={{ marginLeft: 'auto', background: '#2F4375', color: '#ffffff', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: '800' }}>{runningWOs.length} Active</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(248,250,252,0.8)' }}>
              {['Work Order', 'Product', 'Customer', 'Target Date', 'Status', 'Duration'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#5E6B82', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', borderBottom: '1px solid var(--color-border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {runningWOs.map((wo, idx) => {
              const orderRef = wo.orderNo || wo.order_no || wo.orderId;
              const order = orders.find(o => String(o.orderNo) === String(orderRef) || String(o.id) === String(orderRef) || String(o.order_no) === String(orderRef));
              const customerName = order?.customerName || order?.customer?.name || order?.companyName || wo?.customerName || wo?.customer_name || '—';
              const targetDate = order?.deliveryDate || wo.targetDate || '—';
              const isOverdue = targetDate && targetDate !== '—' && targetDate < todayStr;
              const elapsed = getElapsed(wo);
              const isActive = isRunningProductionStatus(wo.status);
              return (
                <tr key={wo.id} style={{ borderBottom: idx < runningWOs.length - 1 ? '1px solid rgba(241,245,249,0.9)' : 'none', background: idx % 2 === 0 ? 'transparent' : 'rgba(248,250,252,0.4)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,242,107,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(248,250,252,0.4)'}
                >
                  <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
                    <strong style={{ color: 'var(--color-text-primary)', fontFamily: 'monospace', fontSize: '12.5px' }}>{wo.id}</strong>
                    {wo.orderNo && <div style={{ fontSize: '11px', color: '#8893A7', marginTop: '1px' }}>{wo.orderNo}</div>}
                  </td>
                  <td style={{ padding: '11px 16px', color: 'var(--color-text-primary)', fontWeight: '600' }}>{wo.productName}</td>
                  <td style={{ padding: '11px 16px', color: 'var(--color-text-secondary)' }}>{customerName}</td>
                  <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ color: isOverdue ? '#dc2626' : 'var(--color-text-secondary)', fontWeight: isOverdue ? '700' : '500' }}>
                      {isOverdue ? '⚠️ ' : ''}{targetDate}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px' }}>{statusChip(wo.status)}</td>
                  <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '13px',
                      fontWeight: '800',
                      color: isActive ? '#059669' : '#d97706',
                      background: isActive ? 'rgba(16,185,129,0.07)' : 'rgba(245,158,11,0.07)',
                      border: `1px solid ${isActive ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}`,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      display: 'inline-block'
                    }}>
                      ⏱ {formatDuration(elapsed)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function ProductionPortal() {
  const pathname = usePathname();
  const params = useParams();
  const pathSlug = pathname ? pathname.split('/').filter(Boolean) : [];
  let view = params?.slug?.[0] || (pathSlug.length > 1 ? pathSlug[pathSlug.length - 1] : 'dashboard') || 'dashboard';
  // Material Workflow specific route overrides
  if (params?.slug?.[0] === 'material-requests' && params?.slug?.[1] === 'create') view = 'material-requests-create';
  else if (pathname?.includes('/material-requests/create')) view = 'material-requests-create';
  else if (params?.slug?.[0] === 'material-receipts' || pathname?.includes('/material-receipts')) view = 'material-receipts';
  else if (params?.slug?.[0] === 'material-returns' || pathname?.includes('/material-returns')) view = 'material-returns';
  else if (params?.slug?.[0] === 'material-consumption' || pathname?.includes('/material-consumption')) view = 'material-consumption';
  else if (params?.slug?.[0] === 'daily-report' || pathname?.includes('/daily-report')) {
    if (params?.slug?.[1] === 'history' || pathname?.endsWith('/daily-report/history')) {
      view = 'daily-report-history';
    } else if (params?.slug?.[1] && params?.slug?.[1] !== 'history') {
      view = 'daily-report-view';
    } else {
      view = 'daily-report-entry';
    }
  }
  if (view === 'production') view = 'dashboard';

  const navigate = useRouter();
  const searchParams = useSearchParams(); const setSearchParams = (params) => { const url = new URL(window.location.href); Object.keys(params).forEach(k => { if (params[k]) url.searchParams.set(k, params[k]); else url.searchParams.delete(k); }); window.history.replaceState({}, '', url); };
  const woIdParam = searchParams.get('woId');

  const { state, dispatch, syncData } = useERP();
  const { salesOrders: backendSalesOrders, loadSalesOrders } = useSalesBackend();
  const { data: workflowMaterialRequests = [] } = useMaterialRequests();
  const { user } = useAuth();
  const showToast = useNotificationStore(s => s.showToast);
  const globalSearch = useSearchStore(s => s.globalSearch);

  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedWOForRequest, setSelectedWOForRequest] = useState(null);
  const [materialRows, setMaterialRows] = useState([]);
  const [activeTab, setActiveTab] = useState('Planned');
  const [woFilter, setWoFilter] = useState('Current');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [backendWorkOrders, setBackendWorkOrders] = useState([]);
  const [mrTab, setMrTab] = useState(searchParams.get('tab') === 'history' ? 'Past' : 'Raise');

  // ── Machine Performance Module State ──
  const [machines, setMachines] = useState([]);
  const [machineSearch, setMachineSearch] = useState('');
  const [machinePage, setMachinePage] = useState(1);
  const [machineLimit] = useState(10);
  const [machineTotal, setMachineTotal] = useState(0);
  const [loadingMachines, setLoadingMachines] = useState(false);
  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [addMachineForm, setAddMachineForm] = useState({
    machineId: '',
    machineName: '',
    machineType: 'Hydraulic Press',
    serialNumber: '',
    location: '',
  });

  const [machineStatuses, setMachineStatuses] = useState([]);
  const [machineStatusesDate, setMachineStatusesDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [savingStatuses, setSavingStatuses] = useState(false);

  const fetchMachines = useCallback(async (page = 1, search = '') => {
    try {
      setLoadingMachines(true);
      const res = await backendFetch(`/api/backend/machines?page=${page}&limit=${machineLimit}&search=${encodeURIComponent(search)}`);
      if (res && typeof res === 'object') {
        setMachines(res.items || []);
        setMachineTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch machines:', err);
    } finally {
      setLoadingMachines(false);
    }
  }, [machineLimit]);

  const fetchMachineStatuses = useCallback(async (dateStr) => {
    try {
      setLoadingStatuses(true);
      const res = await backendFetch(`/api/backend/machine-status?date=${dateStr}`);
      if (Array.isArray(res)) {
        setMachineStatuses(res);
      } else {
        setMachineStatuses([]);
      }
    } catch (err) {
      console.error('Failed to fetch machine statuses:', err);
      setMachineStatuses([]);
    } finally {
      setLoadingStatuses(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'machines') {
      fetchMachines(machinePage, machineSearch);
    }
  }, [view, machinePage, machineSearch, fetchMachines]);

  useEffect(() => {
    if (view === 'machines') {
      fetchMachineStatuses(machineStatusesDate);
    }
  }, [view, machineStatusesDate, fetchMachineStatuses]);

  useEffect(() => {
    setMrTab(searchParams.get('tab') === 'history' ? 'Past' : 'Raise');
  }, [searchParams]);

  const handleAddMachineSubmit = async () => {
    if (!addMachineForm.machineId.trim() || !addMachineForm.machineName.trim() || !addMachineForm.machineType.trim()) {
      showToast('Please fill in all required fields');
      return;
    }
    try {
      await backendFetch('/api/backend/machines', {
        method: 'POST',
        body: addMachineForm,
      });
      showToast('Machine added successfully');
      setShowAddMachineModal(false);
      setAddMachineForm({
        machineId: '',
        machineName: '',
        machineType: 'Hydraulic Press',
        serialNumber: '',
        location: '',
      });
      fetchMachines(machinePage, machineSearch);
      fetchMachineStatuses(machineStatusesDate);
    } catch (err) {
      console.error('Failed to add machine:', err);
      showToast('Failed to add machine');
    }
  };

  const handleSaveStatusesSubmit = async () => {
    try {
      setSavingStatuses(true);
      const payload = {
        workDate: machineStatusesDate,
        machines: machineStatuses.map((m) => ({
          machineId: m.id,
          status: m.status || 'USE',
          remarks: m.remarks || '',
        })),
      };
      await backendFetch('/api/backend/machine-status', {
        method: 'POST',
        body: payload,
      });
      showToast('Daily machine status updated successfully');
      fetchMachineStatuses(machineStatusesDate);
    } catch (err) {
      console.error('Failed to save status:', err);
      showToast('Failed to save daily machine status');
    } finally {
      setSavingStatuses(false);
    }
  };

  const updateLocalStatus = (machineId, status) => {
    setMachineStatuses((prev) =>
      prev.map((m) => (m.id === machineId ? { ...m, status } : m))
    );
  };

  const updateLocalRemarks = (machineId, remarks) => {
    setMachineStatuses((prev) =>
      prev.map((m) => (m.id === machineId ? { ...m, remarks } : m))
    );
  };


  const loadBackendWorkOrders = useCallback(async () => {
    try {
      const result = await backendFetch('/api/backend/production/work-orders');
      setBackendWorkOrders(Array.isArray(result) ? result : result?.data || []);
    } catch (error) {
      console.error('[Production] Unable to load backend work orders', error);
      setBackendWorkOrders([]);
    }
  }, []);

  useEffect(() => {
    if (!['dashboard', 'incoming-orders', 'work-orders', 'production-work'].includes(view)) return;
    void loadBackendWorkOrders();
    if (typeof loadSalesOrders === 'function') {
      void loadSalesOrders();
    }
  }, [view, loadBackendWorkOrders, loadSalesOrders]);
  const [mrStatusFilter, setMrStatusFilter] = useState('All');

  const [reworkTab, setReworkTab] = useState('failed-list');
  const [reworkDateFilter, setReworkDateFilter] = useState('');
  const [reworkProductFilter, setReworkProductFilter] = useState('');
  const [reworkStatusFilter, setReworkStatusFilter] = useState('');
  const [reworkReasonFilter, setReworkReasonFilter] = useState('');
  const getMaterialRate = (materialName) => {
    switch (materialName.toLowerCase()) {
      case 'cement': return 450;
      case 'sand': return 300;
      case 'steel': return 5500;
      case 'aggregate': return 250;
      case 'bolts (m12)': return 12;
      case 'steel plates': return 1200;
      case 'metal brackets': return 180;
      case 'pvc pipes (4")': return 350;
      case 'valve fittings': return 850;
      case 'weld rods (box)': return 450;
      case 'gaskets': return 45;
      default: return 150;
    }
  };

  // Custom request materials list
  const [requestMaterials, setRequestMaterials] = useState([]);
  const [lastLoadedWoId, setLastLoadedWoId] = useState(null);
  const [editingRequestDbId, setEditingRequestDbId] = useState(null);
  const [editingWoId, setEditingWoId] = useState(null);

  // Material Requests Search Bar state
  const [materialSearchQuery, setMaterialSearchQuery] = useState('');
  const [showMaterialSearchDropdown, setShowMaterialSearchDropdown] = useState(false);

  // Complete production modal state
  const [completeModal, setCompleteModal] = useState(null); // null | { wo }
  const [completionData, setCompletionData] = useState({ quantity_produced: '', batch_no: '', notes: '' });
  const [isCompleting, setIsCompleting] = useState(false);

  // Form states for progress editing
  const [selectedWOForProgress, setSelectedWOForProgress] = useState(null);
  const [editProgress, setEditProgress] = useState(0);
  const [editStage, setEditStage] = useState('Cutting');
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState('DAILY-STOCK');

  // Quality Testing & Rejection state variables
  const [mockWorkOrders, setMockWorkOrders] = useState([]);

  const [mockReworkItems, setMockReworkItems] = useState([]);

  const [testingSearch, setTestingSearch] = useState('');
  const [testingStatusFilter, setTestingStatusFilter] = useState('');
  const [reworkSearch, setReworkSearch] = useState('');

  const updateMockWorkOrders = (updated) => {
    setMockWorkOrders(updated);
  };

  const updateMockReworkItems = (updated) => {
    setMockReworkItems(updated);
  };

  const [manualTestingItems, setManualTestingItems] = useState([]);

  const [testingItemName, setTestingItemName] = useState('');
  const [testingItemQty, setTestingItemQty] = useState('');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [productionTargetAchievement, setProductionTargetAchievement] = useState(null);
  const [loadingTarget, setLoadingTarget] = useState(true);

  const fetchTargetAchievement = async () => {
    try {
      setLoadingTarget(true);
      const res = await backendFetch('/api/backend/production-targets/achievement');
      if (res) {
        setProductionTargetAchievement(res);
      }
    } catch (e) {
      console.error('Failed to fetch target achievement stats', e);
    } finally {
      setLoadingTarget(false);
    }
  };

  useEffect(() => {
    fetchTargetAchievement();
  }, [view]);
  const [testingEntries, setTestingEntries] = useState([]);
  const [rejectionEntries, setRejectionEntries] = useState([]);
  const [globalSummary, setGlobalSummary] = useState(null);

  const updateManualTestingItems = (updated) => {
    setManualTestingItems(updated);
  };

  const fetchStats = async () => {
    try {
      const res = await productionService.getDashboardStats();
      setDashboardStats(res);
    } catch (e) {
      console.error('Failed to fetch dashboard stats', e);
    }
  };

  const fetchTesting = async () => {
    try {
      const res = await productionService.getTestingEntries();
      setTestingEntries(res);
    } catch (e) {
      console.error('Failed to fetch testing entries', e);
    }
  };

  const fetchRejections = async () => {
    try {
      const res = await productionService.getRejectionEntries();
      setRejectionEntries(res);
    } catch (e) {
      console.error('Failed to fetch rejection entries', e);
    }
  };

  const fetchGlobalSummary = async () => {
    try {
      const res = await backendFetch('/api/backend/production/reports/summary');
      if (res?.success && res.data) {
        setGlobalSummary(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch global summary', e);
    }
  };

  useEffect(() => {
    syncData();
    if (view === 'dashboard') {
      fetchStats();
      fetchGlobalSummary();
      fetchMachines(1, '');
    } else if (view === 'testing') {
      fetchTesting();
    } else if (view === 'rejection') {
      fetchRejections();
    } else if (view === 'reports') {
      fetchGlobalSummary();
    }
  }, [view, syncData, fetchMachines]);

  const handleEditReturnedRequest = (row) => {
    const allItems = [
      ...rawInventory.map(i => ({ ...i, category: 'Raw Material' })),
      ...HARDWARE_ITEMS.map(i => ({ ...i, category: 'Hardware' }))
    ];
    const mapped = row.materials.map(m => {
      const invItem = allItems.find(i => i.material.toLowerCase() === m.materialName.toLowerCase());
      return {
        material: m.materialName,
        qty: m.quantityRequested,
        category: invItem ? invItem.category : 'Raw Material',
        rate: getMaterialRate(m.materialName),
        discount: 0,
        tax: 18
      };
    });
    setRequestMaterials(mapped);
    setEditingRequestDbId(row.dbId || row.id);
    setEditingWoId(row.workOrderId);
    setMrTab('Raise');
  };

  const storeOrders = useERPStore(s => s.sales?.orders || s.state?.sales?.orders) || [];
  const backendIncomingOrders = useMemo(() => {
    const grouped = new Map();
    backendWorkOrders
      .filter(workOrder => String(workOrder.workflowState?.code || workOrder.status).toUpperCase() === 'CREATED')
      .forEach(workOrder => {
      const plan = workOrder.productionPlan || {};
      const salesOrder = plan.salesOrder || {};
      const orderId = salesOrder.id || plan.salesOrderId || workOrder.id;
      const existing = grouped.get(orderId) || {
        id: salesOrder.id || orderId,
        orderNo: salesOrder.orderNumber || salesOrder.orderNo || orderId,
        customerName: salesOrder.customer?.companyName || 'N/A',
        detailedItems: [],
        products: '',
        estimatedQuantity: 0,
        totalQuantity: 0,
        targetDate: plan.plannedEndDate || '',
        priority: 'Medium',
        status: plan.status || workOrder.status || 'RELEASED',
        workflowStatus: plan.workflowState?.code || plan.status || 'RELEASED',
        productionPlanId: plan.id,
        workOrderIds: [],
        hasBackendWorkOrder: true,
      };
      const salesItem = salesOrder.items?.find(item => item.id === workOrder.salesOrderItemId);
      const productName = salesItem?.productNameSnapshot || 'Production Item';
      const itemQuantity = Number(workOrder.quantity || salesItem?.orderedQuantity || 0);
      existing.detailedItems.push({
        productName,
        quantity: itemQuantity,
        unit: salesItem?.unit || 'Units',
      });
      existing.products = [...new Set(existing.detailedItems.map(item => item.productName))].join(', ');
      existing.estimatedQuantity += itemQuantity;
      existing.totalQuantity += itemQuantity;
      existing.workOrderIds.push(workOrder.id);
      grouped.set(orderId, existing);
    });
    return Array.from(grouped.values());
  }, [backendWorkOrders]);

  const handleBackendIncomingDecision = async (order, action) => {
    const isAccept = action === 'ACCEPT';
    const confirmation = await Swal.fire({
      title: isAccept ? 'Accept Incoming Order?' : 'Reject Incoming Order?',
      text: isAccept
        ? `Accept ${order.orderNo} and move its work orders to the production queue?`
        : `Reject ${order.orderNo}? It will be removed from Incoming Orders.`,
      input: isAccept ? undefined : 'textarea',
      inputLabel: isAccept ? undefined : 'Rejection reason',
      inputPlaceholder: isAccept ? undefined : 'Enter a reason for rejection...',
      inputValidator: isAccept ? undefined : value => !value?.trim() ? 'A rejection reason is required.' : undefined,
      icon: isAccept ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonText: isAccept ? 'Accept & Continue' : 'Reject Order',
      confirmButtonColor: isAccept ? '#16a34a' : '#dc2626',
    });
    if (!confirmation.isConfirmed) return;

    try {
      if (order.workOrderIds && order.workOrderIds.length > 0) {
        await Promise.all((order.workOrderIds || []).map(workOrderId =>
          backendFetch(`/api/backend/production/work-orders/${workOrderId}/action`, {
            method: 'POST',
            body: {
              action,
              remarks: isAccept ? 'Accepted by Production' : confirmation.value,
            },
          }).catch(err => {
            console.warn('[Production Accept WorkOrder fallback]', err);
          })
        ));
      } else if (order.id) {
        await backendFetch(`/api/backend/sales/orders/${order.id}/action`, {
          method: 'POST',
          body: {
            action: isAccept ? 'START_PRODUCTION' : 'PLANT_REJECT',
            remarks: isAccept ? 'Accepted by Production' : confirmation.value,
          },
        }).catch(err => {
          console.warn('[Production Accept SalesOrder fallback]', err);
        });
      }

      // Also activate/update local ERP store so UI state updates immediately
      if (order.id) {
        try {
          useERPStore.getState().activateWorkOrder(order.id, user?.name || 'Production');
        } catch { /* ignore if already active */ }
      }

      await loadBackendWorkOrders().catch(() => {});
      await syncData().catch(() => {});

      showToast(
        isAccept
          ? `${order.orderNo} accepted and moved to Work Orders.`
          : `${order.orderNo} rejected.`
      );
      if (isAccept) navigate.push('/production/work-orders');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: `${isAccept ? 'Acceptance' : 'Rejection'} Failed`,
        text: error?.message || 'Unable to update the work order.',
      });
    }
  };
  const incomingOrders = useMemo(() => {
    const combinedOrders = [...(backendSalesOrders || []), ...(storeOrders || [])];
    const combinedState = {
      ...state,
      sales: {
        ...(state.sales || {}),
        orders: combinedOrders
      }
    };
    return selectProductionIncomingOrders(combinedState).map((order) => {
      const quotationRef = order.quotationId;
      const sourceQuotation = (state.sales?.quotations || []).find((q) => q.id === quotationRef);
      return normalizeProductionOrder(order, sourceQuotation);
    });
  }, [state, storeOrders, backendSalesOrders]);

  const orders = useMemo(() => {
    const combinedOrders = [...(backendSalesOrders || []), ...(storeOrders || [])];
    const combinedState = {
      ...state,
      sales: {
        ...(state.sales || {}),
        orders: combinedOrders
      }
    };
    return selectProductionWorkOrders(combinedState).map((order) => {
      const quotationRef = order.quotationId;
      const sourceQuotation = (state.sales?.quotations || []).find((q) => q.id === quotationRef);
      return normalizeProductionOrder(order, sourceQuotation);
    });
  }, [state, storeOrders, backendSalesOrders]);
  const filteredStoreWOs = getProductionWorkOrders(state);
  const storeWorkOrders = (filteredStoreWOs && filteredStoreWOs.length > 0) ? filteredStoreWOs : mockWorkOrders;
  const workOrders = useMemo(() => {
    const activeOrderWOs = orders.filter(o =>
      [STATUS.WORK_ORDER_CREATED, STATUS.PRODUCTION_ACCEPTED, STATUS.IN_PRODUCTION, 'PRODUCTION_STARTED', STATUS.PAUSED, STATUS.REWORK, STATUS.PRODUCTION_COMPLETED, STATUS.QC_PENDING, 'WORK_ORDER_CREATED', 'PRODUCTION_ACCEPTED', 'IN_PRODUCTION', 'PAUSED', 'REWORK', 'PRODUCTION_ASSIGNED', 'PLANNED', 'PRODUCTION_PLANNED', 'PLANT_ACCEPTED', 'Completed', 'PRODUCTION_COMPLETED', 'QC_PENDING'].includes(o.status || o.workflowStatus)
    ).map(o => {
      const qty = Number(o.quantity || o.products?.[0]?.quantity || o.total_tonnage || 10) || 10;
      return {
        ...o,
        id: o.workOrderId || o.workOrderNo || `WO-${String(o.orderNo || o.id || '').split('-').slice(1).join('-') || o.id}`,
        orderNo: o.orderNumber || o.orderNo || o.salesOrder?.orderNumber || o.id,
        productName: o.productName || (typeof o.products === 'string' && o.products ? o.products : (Array.isArray(o.products) ? (o.products[0]?.productName || o.products[0]?.name || o.products[0]) : '')) || (Array.isArray(o.detailedItems) && o.detailedItems.length > 0 ? o.detailedItems.map(i => i.productName || i.name).filter(Boolean).join(', ') : '') || (Array.isArray(o.items) && o.items.length > 0 ? o.items.map(i => i.productName || i.name).filter(Boolean).join(', ') : '') || 'Custom Engineered Product',
        quantity: qty,
        progress: Number(o.progress || 0) || 0,
        status: o.status || o.workflowStatus || STATUS.WORK_ORDER_CREATED,
        priority: o.priority || 'Medium',
        targetDate: o.deliveryDate || o.targetDate || '2026-07-28'
      };
    });
    const mergedWOsMap = new Map();
    storeWorkOrders.forEach(wo => {
      const items = Array.isArray(wo.items) ? wo.items : [];
      const qty = Number(
        wo.targetQuantity ??
        wo.quantity ??
        items.reduce((sum, item) => sum + Number(item.targetQuantity ?? item.quantity ?? 0), 0)
      ) || 0;
      mergedWOsMap.set(wo.id || wo.orderNo, {
        ...wo,
        orderNo: wo.salesOrder?.orderNumber || wo.productionPlan?.salesOrder?.orderNumber || wo.orderNumber || wo.orderNo || wo.orderId || '',
        productName: items.length
          ? items.map(item => item.productName || item.name).filter(Boolean).join(', ')
          : (wo.productName || ''),
        unit: wo.unit || (items.length === 1 ? items[0].unit : 'Mixed'),
        quantity: qty,
        progress: Number(wo.progress || 0) || 0,
        targetDate: wo.targetDate || wo.deliveryDate || '2026-07-28'
      });
    });
    activeOrderWOs.forEach(wo => {
      if (!mergedWOsMap.has(wo.id || wo.orderNo)) {
        mergedWOsMap.set(wo.id || wo.orderNo, wo);
      } else {
        const existing = mergedWOsMap.get(wo.id || wo.orderNo);
        const existingHasItems = Array.isArray(existing.items) && existing.items.length > 0;
        const fallbackItems = Array.isArray(wo.items) ? wo.items : [];
        const fallbackQuantity = fallbackItems.reduce(
          (sum, item) => sum + Number(item.targetQuantity ?? item.quantity ?? item.qty ?? 0),
          0
        );
        mergedWOsMap.set(wo.id || wo.orderNo, {
          ...wo,
          ...existing,
          orderId: existing.orderId || wo.orderId || wo.orderNo,
          orderNo: (existing.orderNo && existing.orderNo !== '—') ? existing.orderNo : (wo.salesOrder?.orderNumber || wo.productionPlan?.salesOrder?.orderNumber || wo.orderNumber || wo.orderNo || existing.orderId),
          items: existingHasItems ? existing.items : wo.items,
          productName: existingHasItems ? (existing.productName || wo.productName) : wo.productName,
          quantity: existingHasItems
            ? existing.quantity
            : (fallbackQuantity || wo.quantity || existing.quantity || 0),
          unit: existingHasItems
            ? existing.unit
            : (fallbackItems.length === 1 ? (fallbackItems[0].unit || 'Pcs') : (wo.unit || 'Pcs')),
          status: existing.status || wo.status,
        });
      }
    });
    backendWorkOrders.forEach(bwo => {
      const woId = bwo.id || bwo.workOrderNumber;
      const salesOrder = bwo.productionPlan?.salesOrder || bwo.salesOrder || {};
      const orderNo = salesOrder.orderNumber || salesOrder.orderNo || bwo.orderNo || bwo.orderNumber || bwo.id;
      const productName = bwo.salesOrderItem?.product?.name || bwo.salesOrderItem?.productNameSnapshot || bwo.productName || 'Production Item';
      const targetQty = Number(bwo.quantity || bwo.targetQuantity || bwo.salesOrderItem?.orderedQuantity || 0);
      const producedQty = Number(bwo.producedQuantity || bwo.completedQty || bwo.producedQty || 0);
      const targetDate = bwo.productionPlan?.plannedEndDate
        ? String(bwo.productionPlan.plannedEndDate).slice(0, 10)
        : (bwo.targetDate || bwo.deliveryDate || '');
      const status = bwo.workflowState?.code || bwo.status || bwo.productionStatus || 'CREATED';

      const key = woId || orderNo;
      if (!mergedWOsMap.has(key)) {
        mergedWOsMap.set(key, {
          ...bwo,
          id: woId,
          orderNo,
          workOrderNo: woId,
          productName,
          quantity: targetQty,
          producedQty,
          status,
          workflowStatus: status,
          targetDate,
          priority: bwo.productionPlan?.priority || 'Medium',
          progress: targetQty > 0 ? Math.min(100, Math.round((producedQty / targetQty) * 100)) : 0
        });
      }
    });
    return Array.from(mergedWOsMap.values());
  }, [orders, storeWorkOrders, backendWorkOrders]);
  const mRequests = workflowMaterialRequests;
  const rawInventory = state.rawInventory || [];

  const resolvedWoId = woIdParam || 'DAILY-STOCK';

  const getInventoryStatus = (materialName) => {
    const item = rawInventory.find(i => i.material.toLowerCase() === materialName.toLowerCase()) ||
      HARDWARE_ITEMS.find(i => i.material.toLowerCase() === materialName.toLowerCase());
    if (!item) return { label: 'Unknown', isLow: true, stockText: '0 T', unit: 'Tons' };
    if (item.stock === 0) return { label: 'Unknown', isLow: true, stockText: '0 T', unit: item.unit || 'Tons' };
    const isLow = item.stock <= (item.reorderLevel || 20);
    return {
      label: isLow ? 'Low Stock' : 'Safe Stock',
      isLow,
      stockText: `${item.stock} ${item.unit || 'T'}`,
      unit: item.unit || 'T'
    };
  };

  const getStep = (materialName) => {
    const name = materialName.toLowerCase();
    if (name === 'steel') return 1;
    if (['bolts (m12)', 'steel plates', 'metal brackets', 'pvc pipes (4")', 'valve fittings', 'weld rods (box)', 'gaskets'].includes(name)) {
      return 1;
    }
    return 0.1;
  };

  // Start with empty table. The user manually searches and adds items using the Smart Search & Add feature.

  const addRequestMaterialRow = () => {
    const existing = requestMaterials.map(m => m.material.toLowerCase());
    const available = rawInventory.find(item => !existing.includes(item.material.toLowerCase()));
    const nextMaterial = available ? available.material : (rawInventory[0]?.material || 'Cement');
    setRequestMaterials(prev => [...prev, { material: nextMaterial, qty: 0, category: 'Raw Material', rate: getMaterialRate(nextMaterial), discount: 0, tax: 18 }]);
  };

  const removeRequestMaterial = (materialName) => {
    setRequestMaterials(prev => prev.filter(row => row.material.toLowerCase() !== materialName.toLowerCase()));
  };

  const updateRequestMaterial = (materialName, field, value) => {
    setRequestMaterials(prev => prev.map(row => {
      if (row.material.toLowerCase() === materialName.toLowerCase()) {
        return {
          ...row,
          [field]: field === 'qty' || field === 'rate' || field === 'discount' || field === 'tax'
            ? (value === '' ? '' : Number(value))
            : value
        };
      }
      return row;
    }));
  };

  const adjustQuantity = (materialName, amount) => {
    setRequestMaterials(prev => prev.map(row => {
      if (row.material.toLowerCase() === materialName.toLowerCase()) {
        const currentQty = Number(row.qty) || 0;
        const newQty = Math.max(0, currentQty + amount);
        return {
          ...row,
          qty: Number(newQty.toFixed(2))
        };
      }
      return row;
    }));
  };

  const getMaterialColor = (material) => {
    switch (material.toLowerCase()) {
      case 'cement': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'sand': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'steel': return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
      default: return 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)';
    }
  };

  const getMaterialIcon = (material) => {
    switch (material.toLowerCase()) {
      case 'cement':
      case 'opc cement clinker': return <Layers size={18} />;
      case 'sand':
      case 'river sand': return <Grid size={18} />;
      case 'gypsum raw': return <Layers size={18} />;
      case 'coarse aggregate 20mm':
      case 'fine aggregate 10mm': return <Boxes size={18} />;
      case 'superplasticizer admixture':
      case 'waterproofing compound': return <Settings size={18} />;
      case 'steel': return <Boxes size={18} />;
      case 'bolts (m12)': return <Wrench size={18} />;
      case 'steel plates': return <Layers size={18} />;
      case 'metal brackets': return <Hammer size={18} />;
      case 'pvc pipes (4")': return <CircleDot size={18} />;
      case 'valve fittings': return <Settings size={18} />;
      case 'weld rods (box)': return <Activity size={18} />;
      case 'gaskets': return <CircleDot size={18} />;
      default: return <Box size={18} />;
    }
  };

  const getBOM = (productName) => {
    if (state.bom && Array.isArray(state.bom)) {
      const items = state.bom.filter(b => b.product_name?.toLowerCase() === productName?.toLowerCase());
      if (items.length > 0) {
        return items.map(i => ({
          material: i.raw_material_name,
          quantityPerUnit: Number(i.quantity_required)
        }));
      }
    }
    // Fallback using seeded dynamic materials
    return [
      { material: 'General Purpose Unsaturated Polyester Resin (Clear)', quantityPerUnit: 1.5 },
      { material: 'Chopped Strand Mat – 450 GSM', quantityPerUnit: 0.8 }
    ];
  };

  useEffect(() => {
    if (view === 'material-requests') {
      if (woIdParam && woIdParam !== lastLoadedWoId) {
        setMrTab('Raise');
        setLastLoadedWoId(woIdParam);
        const wo = workOrders.find(w => w.id === woIdParam);
        if (wo) {
          const bom = getBOM(wo.productName);
          const initialMaterials = bom.map(b => {
            const invItem = rawInventory.find(inv =>
              inv.material.toLowerCase().includes(b.material.toLowerCase()) ||
              b.material.toLowerCase().includes(inv.material.toLowerCase())
            );
            const resolvedName = invItem ? invItem.material : b.material;
            const isRaw = rawInventory.some(inv => inv.material === resolvedName);
            const category = isRaw ? 'Raw Material' : 'Hardware';
            const defaultRate = getMaterialRate(resolvedName);
            return {
              material: resolvedName,
              qty: Number((b.quantityPerUnit * wo.quantity).toFixed(2)),
              category,
              rate: defaultRate,
              discount: 0,
              tax: 18
            };
          });
          setRequestMaterials(initialMaterials);
        } else {
          setRequestMaterials(prev => prev.length === 0 ? prev : []);
        }
      } else if (!woIdParam && lastLoadedWoId !== '_none_') {
        setLastLoadedWoId('_none_');
        setRequestMaterials(prev => prev.length === 0 ? prev : []);
      }
    } else {
      if (lastLoadedWoId !== null) {
        setLastLoadedWoId(null);
      }
      setRequestMaterials(prev => prev.length === 0 ? prev : []);
    }
  }, [view, woIdParam, workOrders, rawInventory, lastLoadedWoId]);

  const addMaterialRow = () => {
    const firstAvailable = rawInventory[0]?.material || 'White Mold Release Wax Polish';
    setMaterialRows(prev => [...prev, { material: firstAvailable, qty: '10' }]);
  };

  const removeMaterialRow = (idx) => {
    setMaterialRows(prev => prev.filter((_, i) => i !== idx));
  };

  const updateMaterialRow = (idx, field, value) => {
    setMaterialRows(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const validRows = materialRows.filter(r => r.qty && !isNaN(r.qty) && Number(r.qty) > 0);

  const handleRaiseRequestSubmit = async (e) => {
    e.preventDefault();
    if (validRows.length === 0) {
      showToast('Please enter at least one valid material and quantity.');
      return;
    }

    try {
      showToast(`Production: Submitting material clearance request linked to Work Order ${selectedWOForRequest.id}...`);
      const res = await productionService.raiseMaterialRequest(
        state,
        selectedWOForRequest,
        validRows,
        dispatch,
        user
      );

      if (res.success) {
        await syncData();
        showToast(`Material request submitted successfully for Work Order ${selectedWOForRequest.id}.`);
        setShowRequestModal(false);
        setSelectedWOForRequest(null);
      } else {
        Swal.fire({ icon: 'error', title: 'Request Failed', text: res.error?.message || res.error || 'Submission failed.' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Submission Error', text: err.message || 'An error occurred during submission.' });
    }
  };

  const handleRaiseRequestDirectSubmit = async (e) => {
    e.preventDefault();

    let currentWO = null;
    const activeWoId = editingRequestDbId ? editingWoId : resolvedWoId;
    if (activeWoId && activeWoId !== 'DAILY-STOCK' && activeWoId !== 'undefined') {
      currentWO = workOrders.find(w => w.id === activeWoId);
    }
    const woObj = currentWO || { id: activeWoId || 'DAILY-STOCK', orderNo: activeWoId || 'DAILY-STOCK' };

    const rows = requestMaterials
      .filter(r => r.qty !== undefined && r.qty !== null && !isNaN(r.qty) && Number(r.qty) > 0)
      .map(r => ({ material: r.material, qty: String(r.qty) }));

    if (rows.length === 0) {
      showToast('Please specify a positive quantity for at least one material.');
      return;
    }

    Swal.fire({
      title: editingRequestDbId ? 'Re-submit Material Request?' : 'Submit Material Request?',
      text: editingRequestDbId
        ? `Are you sure you want to re-submit the corrected material request for Work Order ${woObj.id}?`
        : `Are you sure you want to submit this material request for Work Order ${woObj.id}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: editingRequestDbId ? 'Yes, Re-submit' : 'Yes, Submit',
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
          if (editingRequestDbId) {
            showToast("Production: Re-submitting corrected material request...");

            const payload = {
              status: 'REQUESTED',
              materials: rows.map(r => ({
                materialName: r.material,
                quantityRequested: Number(r.qty)
              }))
            };

            const token = localStorage.getItem('token') || localStorage.getItem('himalaya_token') || `mock_token_${String(user.role).replace(/ /g, '_')}`;
            const res = await fetch(`/api/production/material-requests/${editingRequestDbId}/status`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });

            if (res.ok) {
              await syncData();
              setEditingRequestDbId(null);
              setEditingWoId(null);
              setRequestMaterials([]);
              Swal.fire({
                icon: 'success',
                title: 'Request Re-submitted',
                text: 'The corrected material request has been successfully re-submitted to the Plant Head.',
                customClass: {
                  popup: 'swal-premium-popup',
                  title: 'swal-premium-title',
                  confirmButton: 'swal-premium-confirm-btn'
                },
                buttonsStyling: false
              }).then(() => {
                setMrTab('Past');
              });
            } else {
              const body = await res.json();
              Swal.fire({
                icon: 'error',
                title: 'Re-submission Failed',
                text: body.message || 'Server error',
                customClass: {
                  popup: 'swal-premium-popup',
                  title: 'swal-premium-title',
                  confirmButton: 'swal-premium-confirm-btn'
                },
                buttonsStyling: false
              });
            }
            return;
          }

          showToast("Production: Submitting material clearance request internally...");
          const res = await productionService.raiseMaterialRequest(
            state,
            woObj,
            rows,
            dispatch,
            user
          );

          if (res.success) {
            await syncData();
            Swal.fire({
              icon: 'success',
              title: 'Material Request Submitted',
              text: `Material request has been successfully submitted for Work Order ${woObj.id}.`,
              customClass: {
                popup: 'swal-premium-popup',
                title: 'swal-premium-title',
                confirmButton: 'swal-premium-confirm-btn'
              },
              buttonsStyling: false
            }).then(() => {
              navigate.push('/production/work-orders');
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Request Failed',
              text: res.error?.message || res.error || 'Submission failed.',
              customClass: {
                popup: 'swal-premium-popup',
                title: 'swal-premium-title',
                confirmButton: 'swal-premium-confirm-btn'
              },
              buttonsStyling: false
            });
          }
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Submission Error',
            text: err.message || 'An error occurred during submission.',
            customClass: {
              popup: 'swal-premium-popup',
              title: 'swal-premium-title',
              confirmButton: 'swal-premium-confirm-btn'
            },
            buttonsStyling: false
          });
        }
      }
    });
  };

  const handleCreateWorkOrder = (row) => {
    const woId = 'WO-' + row.orderNo.split('-')[1];
    Swal.fire({
      title: 'Activate Work Order?',
      text: `Are you sure you want to activate the Work Order for Order #${row.orderNo}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Activate WO',
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
        showToast("Production: Activating Work Order...");
        try {
          useERPStore.getState().activateWorkOrder(row.id, user?.name || 'Production');
          await syncData();
          showToast(`Successfully activated Work Order for Order #${row.orderNo}!`);
          navigate.push('/production/work-orders');
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Activation Failed', text: err.message });
        }
      }
    });
  };

  const handleResolveDelay = (wo) => {
    const todayStr = new Date().toISOString().split('T')[0];
    Swal.fire({
      title: 'Resolve Production Delay',
      html: `
        <div style="text-align: left; display: flex; flex-direction: column; gap: 12px; padding: 10px 0;">
          <p style="font-size: 13px; color: #D6E2F0; margin: 0;">Work Order: <strong style="color: #fff;">${wo.id}</strong></p>
          <p style="font-size: 12px; color: #8893A7; margin: 0;">Product: <strong>${wo.productName}</strong></p>
          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;">
            <label style="font-size: 11px; color: #8893A7; font-weight: bold; text-transform: uppercase;">New Target Completion Date:</label>
            <input id="new-target-date" type="date" class="swal2-input" style="margin: 0; width: 100%; border-radius: 6px; background: #24345C; border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 8px;" value="${wo.targetDate || todayStr}">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update Schedule',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const val = document.getElementById('new-target-date').value;
        if (!val) {
          Swal.showValidationMessage('Please select a target date');
        }
        return val;
      },
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        dispatch({
          type: 'UPDATE_WORK_ORDER',
          payload: { id: wo.id, targetDate: result.value }
        });
        showToast(`Schedule updated for ${wo.id} to ${result.value}`);
      }
    });
  };

  const handleStartProduction = async (wo) => {
    const { value: formValues } = await Swal.fire({
      title: 'Assign Shift & Start',
      html: `
        <style>
          .shift-option {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 14px 16px;
            border: 2px solid var(--color-border);
            border-radius: var(--radius-lg, 14px);
            cursor: pointer;
            transition: var(--transition-smooth, all 0.3s ease);
            background: var(--color-sidebar-bg, #fff);
          }
          .shift-option:hover {
            border-color: var(--color-accent-teal, #337a86);
            background: var(--color-bg-base, #f4f5f3);
          }
          .shift-radio:checked + .shift-option {
            border-color: var(--color-accent-teal, #337a86);
            background: rgba(51, 122, 134, 0.05);
            box-shadow: 0 4px 12px rgba(51, 122, 134, 0.15);
          }
          .shift-icon {
            font-size: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border-radius: var(--radius-md, 10px);
            background: var(--color-bg-base, #f4f5f3);
            transition: var(--transition-smooth, all 0.3s ease);
          }
          .shift-radio:checked + .shift-option .shift-icon {
            background: var(--color-accent-teal, #337a86);
            box-shadow: 0 4px 10px rgba(51, 122, 134, 0.3);
          }
          .shift-details {
            display: flex;
            flex-direction: column;
          }
          .shift-title {
            font-weight: 800;
            font-size: 15px;
            color: var(--color-text-primary, #12161a);
          }
          .shift-time {
            font-size: 13px;
            color: var(--color-text-secondary, #656c75);
            margin-top: 4px;
            font-weight: 600;
          }
        </style>
        <div style="display: flex; flex-direction: column; gap: 12px; text-align: left; padding: 8px 0;">
          <label style="cursor: pointer; display: block; margin: 0;">
            <input type="radio" name="swal-shift" value="Morning Shift" class="shift-radio" style="display: none;" checked>
            <div class="shift-option">
              <div class="shift-icon">🌅</div>
              <div class="shift-details">
                <span class="shift-title">Morning Shift</span>
                <span class="shift-time">08:00 AM - 04:00 PM</span>
              </div>
            </div>
          </label>

          <label style="cursor: pointer; display: block; margin: 0;">
            <input type="radio" name="swal-shift" value="Evening Shift" class="shift-radio" style="display: none;">
            <div class="shift-option">
              <div class="shift-icon">🌇</div>
              <div class="shift-details">
                <span class="shift-title">Evening Shift</span>
                <span class="shift-time">04:00 PM - 12:00 AM</span>
              </div>
            </div>
          </label>

          <label style="cursor: pointer; display: block; margin: 0;">
            <input type="radio" name="swal-shift" value="Night Shift" class="shift-radio" style="display: none;">
            <div class="shift-option">
              <div class="shift-icon">🌙</div>
              <div class="shift-details">
                <span class="shift-title">Night Shift</span>
                <span class="shift-time">12:00 AM - 08:00 AM</span>
              </div>
            </div>
          </label>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Start Production',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false,
      preConfirm: () => {
        return {
          shift: document.querySelector('input[name="swal-shift"]:checked').value
        }
      }
    });

    if (formValues) {
      showToast(`Production: Starting Work Order ${wo.id}...`);
      try {
        useERPStore.getState().startProduction(wo.id, user?.name || 'Production');
        showToast(`Manufacturing started for Work Order ${wo.id} during ${formValues.shift}!`);
      } catch (error) {
        console.error('Start Work failed:', error);
        Swal.fire({
          icon: 'error',
          title: 'Failed to Start',
          text: error instanceof Error ? error.message : 'Unable to start production.',
        });
      }
    }
  };

  const handlePauseProduction = (wo) => {
    Swal.fire({
      title: 'Pause Production?',
      text: `Are you sure you want to temporarily pause manufacturing for Work Order ${wo.id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Pause',
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
        showToast("Production: Pausing machines and locking state...");
        const res = await productionService.pauseProduction(state, wo, dispatch, user);
        if (res.success) {
          await syncData();
          showToast(`Production paused for Work Order ${wo.id}.`);
        } else {
          Swal.fire({ icon: 'error', title: 'Pause Failed', text: res.error?.message || res.error });
        }
      }
    });
  };

  const handleResumeProduction = (wo) => {
    Swal.fire({
      title: 'Resume Production?',
      text: `Are you sure you want to resume manufacturing for Work Order ${wo.id}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Resume',
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
        showToast("Production: Resuming floor operations...");
        const res = await productionService.resumeProduction(state, wo, dispatch, user);
        if (res.success) {
          await syncData();
          showToast(`Production resumed for Work Order ${wo.id}!`);
        } else {
          Swal.fire({ icon: 'error', title: 'Resume Failed', text: res.error?.message || res.error });
        }
      }
    });
  };

  const handleUpdateProgressSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWOForProgress) return;

    showToast("Production: Updating floor progress log...");
    const res = await productionService.updateProductionProgress(
      state,
      selectedWOForProgress,
      editProgress,
      editStage,
      dispatch,
      user
    );

    if (res.success) {
      await syncData();
      showToast(`Work Order ${selectedWOForProgress.id} status updated successfully.`);
      setSelectedWOForProgress(null);
    } else {
      Swal.fire({ icon: 'error', title: 'Update Failed', text: res.error?.message || res.error });
    }
  };

  const handleCompleteProduction = (wo) => {
    setCompletionData({
      quantity_produced: wo.quantity || wo.quantity_to_produce || '',
      batch_no: `BATCH-${Date.now().toString().slice(-6)}`,
      notes: ''
    });
    setCompleteModal({ wo });
  };

  const handleSubmitCompletion = async () => {
    if (!completionData.quantity_produced || Number(completionData.quantity_produced) <= 0) {
      showToast('Please enter a valid produced quantity.');
      return;
    }
    if (!completionData.batch_no.trim()) {
      showToast('Please enter a batch number.');
      return;
    }
    setIsCompleting(true);
    try {
      const wo = completeModal.wo;
      showToast('Production: Forwarding final batch units to quality check...');
      const now = new Date().toISOString();
      const workOrderItems = Array.isArray(wo.items) ? wo.items : [];
      const totalTarget = workOrderItems.reduce(
        (sum, item) => sum + Number(item.targetQuantity ?? item.quantity ?? 0),
        0
      );
      const enteredProducedQty = Number(completionData.quantity_produced);
      const producedItems = workOrderItems.map((item, index) => {
        const targetQuantity = Number(item.targetQuantity ?? item.quantity ?? 0);
        const producedQuantity = totalTarget > 0
          ? enteredProducedQty * targetQuantity / totalTarget
          : (index === 0 ? enteredProducedQty : 0);
        return {
          orderLineId: item.orderLineId || item.id,
          productId: item.productId,
          productName: item.productName,
          producedQuantity,
          unit: item.unit || wo.unit || 'Pcs',
        };
      });
      useERPStore.getState().completeProduction(wo.id, {
        producedItems,
        producedQty: enteredProducedQty,
        batchNo: completionData.batch_no.trim(),
        remarks: completionData.notes || undefined,
      }, user?.name || 'Production');
      setCompleteModal(null);
      if (mockWorkOrders.some(m => m.id === wo.id)) {
        const updatedMock = mockWorkOrders.map(m => m.id === wo.id ? {
          ...m,
          status: 'QC Pending',
          producedQty: Number(completionData.quantity_produced),
          batchNo: completionData.batch_no.trim(),
          completedAt: now,
          notes: { ...(m.notes || {}), batchNo: completionData.batch_no.trim(), endTime: now }
        } : m);
        updateMockWorkOrders(updatedMock);
      }
      navigate.push('/production/qc-pending');
      showToast(`Work Order ${wo.id} production completed. QC pending.`);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Completion Failed', text: err.message || 'Unknown error' });
    } finally {
      setIsCompleting(false);
    }
  };

  // ── 1. Dashboard ──
  const renderDashboard = () => {
    // Dynamic dashboard stats based on current local state
    const todayProduction = workOrders
      .filter(wo => ['Completed', 'Testing', 'QC Pending', 'QC Passed'].includes(wo.status))
      .reduce((sum, wo) => sum + (wo.producedQty || wo.quantity || 0), 0);

    const underTesting = workOrders
      .filter(wo => wo.status === 'Testing')
      .reduce((sum, wo) => sum + (wo.producedQty || wo.quantity || 0), 0);

    const passedQty = workOrders
      .filter(wo => wo.status === 'QC Passed')
      .reduce((sum, wo) => sum + (wo.producedQty || wo.quantity || 0), 0);

    const rejectedQty = mockReworkItems
      .reduce((sum, rw) => sum + (rw.reworkQty || 0), 0);

    const finishedGoods = workOrders
      .filter(wo => wo.status === 'QC Passed')
      .reduce((sum, wo) => sum + (wo.producedQty || wo.quantity || 0), 0);

    const testingSuccess = todayProduction > 0
      ? (((todayProduction - rejectedQty) / todayProduction) * 100).toFixed(1)
      : '100.0';

    const testingFailure = todayProduction > 0
      ? ((rejectedQty / todayProduction) * 100).toFixed(1)
      : '0.0';

    const currentMonthPrefix = new Date().toISOString().slice(0, 7);
    const monthShiftProduced = (globalSummary?.shiftEntries || [])
      .filter(e => e.date && String(e.date).startsWith(currentMonthPrefix))
      .reduce((sum, e) => sum + (Number(e.producedQty) || 0), 0);
    const monthProduction = monthShiftProduced > 0
      ? monthShiftProduced
      : workOrders
          .filter(wo => ['Completed', 'Testing', 'QC Pending', 'QC Passed'].includes(wo.status))
          .reduce((sum, wo) => sum + (wo.producedQty || wo.quantity || 0), 0);

    const shiftTargetSum = (globalSummary?.shiftEntries || []).reduce((sum, e) => sum + (Number(e.targetQty) || 0), 0);
    const shiftProducedSum = (globalSummary?.shiftEntries || []).reduce((sum, e) => sum + (Number(e.producedQty) || 0), 0);
    const shiftRejectedSum = (globalSummary?.shiftEntries || []).reduce((sum, e) => sum + (Number(e.rejectedQty) || 0), 0);

    const productionEfficiency = shiftTargetSum > 0
      ? (((shiftProducedSum - shiftRejectedSum) / shiftTargetSum) * 100).toFixed(1)
      : (todayProduction > 0 ? '100.0' : '0.0');

    const derivedStats = {
      todayProduction,
      monthProduction,
      underTesting,
      passedQty,
      rejectedQty,
      finishedGoods,
      testingSuccess,
      testingFailure,
      productionEfficiency
    };

    const totalWOs = workOrders.length;
    const runningWOs = workOrders.filter(wo =>
      isRunningProductionStatus(wo.status) || wo.status === STATUS.MATERIAL_ISSUED
    ).length;
    const completedWOs = workOrders.filter(wo => [STATUS.QC_PASSED, STATUS.CLOSED].includes(wo.status)).length;

    const todayStr = new Date().toISOString().split('T')[0];
    const delayedWOs = workOrders.filter(wo =>
      ![STATUS.QC_PASSED, STATUS.CLOSED, STATUS.CANCELLED].includes(wo.status) &&
      wo.targetDate &&
      wo.targetDate < todayStr
    );
    const overdueCount = delayedWOs.length;

    // Rework ratio calculation
    const reworkCount = workOrders.filter(wo => (wo.reworkCount || 0) > 0 || wo.status === STATUS.REWORK).length;
    const reworkRatio = totalWOs > 0 ? ((reworkCount / totalWOs) * 100).toFixed(1) : '3.2';

    // Incoming planned orders needing WO generation
    const incomingPlannedOrders = orders.filter(o =>
      o.status === STATUS.PLANNED &&
      !workOrders.some(wo => wo.orderNo === o.orderNo && wo.status !== STATUS.PLANNED)
    );

    // Active floor jobs
    const runningWO = workOrders.filter(wo => isRunningProductionStatus(wo.status));

    // Dynamic Machine OEE Data
    const machineOEEData = (machines && machines.length > 0)
      ? machines.slice(0, 6).map(m => ({
          name: m.machineName || m.name || m.machineId || 'Machine',
          OEE: m.status === 'OPERATIONAL' || m.status === 'RUNNING' ? 92 : (m.status === 'IDLE' ? 76 : 48)
        }))
      : [
          { name: 'Mixer-1', OEE: 85 },
          { name: 'Mixer-2', OEE: 82 },
          { name: 'Extruder-1', OEE: 91 },
          { name: 'Kiln-3', OEE: 79 },
          { name: 'Assy Alpha', OEE: 88 }
        ];

    const liveAvailability = totalWOs > 0
      ? Math.min(100, Math.max(70, Number((((totalWOs - overdueCount) / totalWOs) * 100).toFixed(1))))
      : 92.5;
    const liveEfficiency = productionEfficiency !== '0.0' ? productionEfficiency : '94.2';
    const liveQualityYield = testingSuccess !== '0.0' ? testingSuccess : '99.1';

    const pendingWOsCount = Math.max(0, totalWOs - runningWOs - completedWOs);
    const qcPendingCount = workOrders.filter(wo => ['QC_PENDING', 'TESTING', 'QC PENDING'].includes(String(wo.status || wo.workflowStatus).toUpperCase())).length;
    const reworkCountVal = workOrders.filter(wo => ['REWORK', 'REWORK_REQUIRED', 'QC_FAILED', 'QC FAILED'].includes(String(wo.status || wo.workflowStatus).toUpperCase())).length;

    const rawOrderStatusPieData = [
      { name: 'In Production', value: runningWOs, color: '#f59e0b' },
      { name: 'QC Pending', value: qcPendingCount, color: '#8b5cf6' },
      { name: 'Completed', value: completedWOs, color: '#10b981' },
      { name: 'Pending', value: pendingWOsCount, color: '#3b82f6' },
      { name: 'Rework', value: reworkCountVal, color: '#ef4444' }
    ].filter(d => Number(d.value) > 0);

    const orderStatusPieData = rawOrderStatusPieData.length > 0 ? rawOrderStatusPieData : [
      { name: 'In Production', value: 4, color: '#f59e0b' },
      { name: 'QC Pending', value: 2, color: '#8b5cf6' },
      { name: 'Completed', value: 6, color: '#10b981' },
      { name: 'Pending', value: 3, color: '#3b82f6' },
      { name: 'Rework', value: 1, color: '#ef4444' }
    ];

    const rawQualityYieldPieData = [
      { name: 'Passed Qty', value: Number(derivedStats.passedQty) || 0, color: '#10b981' },
      { name: 'Under Testing', value: Number(derivedStats.underTesting) || 0, color: '#f59e0b' },
      { name: 'Rejected / Rework', value: Number(derivedStats.rejectedQty) || 0, color: '#ef4444' }
    ].filter(d => Number(d.value) > 0);

    const qualityYieldPieData = rawQualityYieldPieData.length > 0 ? rawQualityYieldPieData : [
      { name: 'Passed Qty', value: 140, color: '#10b981' },
      { name: 'Under Testing', value: 15, color: '#f59e0b' },
      { name: 'Rejected / Rework', value: 5, color: '#ef4444' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <ProductionOperationsDashboard
          workOrders={workOrders}
          productionTargetAchievement={productionTargetAchievement}
          loadingTarget={loadingTarget}
          derivedStats={derivedStats}
          initialShiftEntries={(globalSummary?.shiftEntries || []).map(entry => ({
            ...entry,
            date: entry.date ? entry.date.slice(0, 10) : '',
            workOrder: entry.workOrder?.workOrderNumber || '—',
            product: entry.workOrder?.salesOrderItem?.product?.name || '—',
            efficiency: Number(entry.targetQty) ? Math.max(0, Number(entry.producedQty) - Number(entry.rejectedQty)) / Number(entry.targetQty) * 100 : 0
          }))}
          initialScrapEntries={(globalSummary?.scrapEntries || []).map(entry => ({
            ...entry,
            date: entry.date ? entry.date.slice(0, 10) : '',
            workOrder: entry.workOrder?.workOrderNumber || '—',
            product: entry.workOrder?.salesOrderItem?.product?.name || '—'
          }))}
          onCompleteRework={(workOrder) => dispatch({
            type: 'UPDATE_WORK_ORDER',
            payload: {
              ...workOrder,
              id: workOrder.id,
              status: STATUS.QC_PENDING,
              workflowStatus: STATUS.QC_PENDING,
              reworkCompletedAt: new Date().toISOString(),
              qcRemarks: 'Rework completed by Production and resubmitted to QC'
            }
          })}
        />

        {/* Observability & Decision grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>

          {/* Machine OEE Monitor */}
          <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="card-heading" style={{ margin: 0 }}>OEE Performance Monitor</h2>
              <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Live OEE</span>
            </div>

            <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <BarChart width={340} height={210} data={machineOEEData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#5E6B82" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#5E6B82" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#24345C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold', color: '#8893A7' }}
                />
                <Bar dataKey="OEE" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={28} isAnimationActive={false}>
                  {machineOEEData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.OEE >= 85 ? '#10b981' : (entry.OEE >= 80 ? '#3b82f6' : '#eab308')} />
                  ))}
                </Bar>
              </BarChart>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8893A7', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
              <span>Availability: <strong>{liveAvailability}%</strong></span>
              <span>Efficiency: <strong>{liveEfficiency}%</strong></span>
              <span>Quality Yield: <strong>{liveQualityYield}%</strong></span>
            </div>
          </div>

          {/* Work Order Status Distribution Donut Chart */}
          <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="card-heading" style={{ margin: 0 }}>Work Order Status Distribution</h2>
              <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Live Status</span>
            </div>

            <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <PieChart width={310} height={210}>
                <Pie
                  data={orderStatusPieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={38}
                  outerRadius={62}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={false}
                >
                  {orderStatusPieData.map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#24345C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={28} iconType="circle" wrapperStyle={{ fontSize: '10.5px' }} />
              </PieChart>
            </div>
          </div>

          {/* Quality & Testing Yield Donut Chart */}
          <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="card-heading" style={{ margin: 0 }}>Quality & Testing Breakdown</h2>
              <span style={{ fontSize: '11px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Live Quality</span>
            </div>

            <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <PieChart width={310} height={210}>
                <Pie
                  data={qualityYieldPieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={38}
                  outerRadius={62}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={false}
                >
                  {qualityYieldPieData.map((entry, index) => (
                    <Cell key={`yield-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#24345C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={28} iconType="circle" wrapperStyle={{ fontSize: '10.5px' }} />
              </PieChart>
            </div>
          </div>

          {/* Delayed Jobs list with Reschedule CTA */}
          <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card-top-bar">
              <h2 className="card-heading" style={{ margin: 0, color: overdueCount > 0 ? '#ef4444' : 'inherit' }}>Delayed Jobs (Priority Red)</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '200px' }}>
              {delayedWOs.map((wo) => (
                <div key={wo.id} style={{
                  background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)',
                  borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#fca5a5', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {wo.id} - {wo.productName}
                    </span>
                    <span style={{ fontSize: '11px', color: '#f87171', display: 'block', marginTop: '2px' }}>
                      Overdue since: {wo.targetDate}
                    </span>
                  </div>
                  <button
                    onClick={() => handleResolveDelay(wo)}
                    style={{
                      background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px',
                      borderRadius: '6px', fontSize: '10.5px', fontWeight: '800', cursor: 'pointer',
                      whiteSpace: 'nowrap', marginLeft: '10px'
                    }}
                  >
                    Resolve Delay
                  </button>
                </div>
              ))}
              {overdueCount === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', gap: '8px', color: '#5E6B82' }}>
                  <CheckCircle2 size={32} color="#10b981" />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#34d399' }}>All runs on schedule</span>
                  <span style={{ fontSize: '10.5px', color: '#5E6B82' }}>No delayed work orders detected.</span>
                </div>
              )}
            </div>
          </div>

          {/* Incoming Orders Dispatch Center with CTA */}
          <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card-top-bar">
              <h2 className="card-heading" style={{ margin: 0 }}>Incoming Orders Queue</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '200px' }}>
              {incomingPlannedOrders.map((ord) => (
                <div key={ord.orderNo} style={{
                  background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#F5FAFE', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ord.orderNo} - {ord.customer?.name}
                    </span>
                    <span style={{ fontSize: '11px', color: '#8893A7', display: 'block', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Item: {ord.products}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCreateWorkOrder(ord)}
                    style={{
                      background: '#10b981', color: '#000000', border: 'none', padding: '6px 12px',
                      borderRadius: '6px', fontSize: '10.5px', fontWeight: '800', cursor: 'pointer',
                      whiteSpace: 'nowrap', marginLeft: '10px'
                    }}
                  >
                    Start Work Order
                  </button>
                </div>
              ))}
              {incomingPlannedOrders.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', gap: '8px', color: '#5E6B82' }}>
                  <CheckCircle2 size={32} color="#10b981" />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#34d399' }}>Order queue empty</span>
                  <span style={{ fontSize: '10.5px', color: '#5E6B82' }}>All planned orders have active runs.</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Existing Active Floor Tracking Table */}
        <div className="app-card">
          <div className="card-top-bar"><h2 className="card-heading">Active Manufacturing Floor Tracking</h2></div>
          <DataTable
            columns={[
              {
                header: 'Order Ref', accessor: 'orderNo', nowrap: true, render: (row) => (
                  <span
                    style={{ color: 'var(--color-text-primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                    onClick={() => {
                      const order = orders.find(o => o.orderNo === row.orderNo);
                      if (order) setSelectedOrderDetails(order);
                    }}
                  >
                    {row.orderNo}
                  </span>
                )
              },
              {
                header: 'Customer', accessor: 'orderNo', render: (row) => {
                  const order = orders.find(o => o.orderNo === row.orderNo);
                  return order?.customer?.name || '—';
                }
              },
              { header: 'Product Item', accessor: 'productName', nowrap: true },
              {
                header: 'Target Date', accessor: 'targetDate', render: (row) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isOverdue = row.targetDate && row.targetDate < todayStr;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: '600' }}>{row.targetDate || '—'}</span>
                      {isOverdue && (
                        <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid #ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                          ⚠️ Overdue
                        </span>
                      )}
                    </div>
                  );
                }
              },
              { header: 'Planned Weight', accessor: 'quantity', render: (row) => `${row.quantity} Tons` },
              { header: 'Current Stage', accessor: 'stage' },
              {
                header: 'Progress %',
                accessor: 'progress',
                render: (row) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: '60px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${row.progress}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '4px' }} />
                    </div>
                    <span>{row.progress}%</span>
                  </div>
                )
              },
              {
                header: 'Work Order Duration',
                accessor: 'duration',
                render: (row) => {
                  const accumulated = row.accumulatedTime || 0;
                  const isActive = isRunningProductionStatus(row.status);
                  const startedAt = row.lastStartedAt || (isActive ? (row.createdAt ? new Date(row.createdAt).getTime() : Date.now()) : null);
                  const timeDiff = isActive && startedAt ? Math.max(0, Date.now() - startedAt) : 0;
                  const totalMs = accumulated + timeDiff;
                  const totalSec = Math.floor(totalMs / 1000);
                  const h = Math.floor(totalSec / 3600);
                  const m = Math.floor((totalSec % 3600) / 60);
                  const s = totalSec % 60;
                  const durationStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                  
                  return (
                    <span style={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '13px',
                      fontWeight: '800',
                      color: isActive ? '#059669' : '#d97706',
                      background: isActive ? 'rgba(16,185,129,0.07)' : 'rgba(245,158,11,0.07)',
                      border: `1px solid ${isActive ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}`,
                      padding: '4px 9px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      ⏱ {durationStr}
                    </span>
                  );
                }
              }
            ]}
            data={runningWO}
            searchQuery={globalSearch}
            searchField="productName"
            emptyMessage="No active manufacturing processes running on the floor."
          />
        </div>
      </div>
    );
  };

  const renderIncomingOrders = () => {
    // Show orders approved / assigned by Plant Head waiting to be activated into Work Orders
    const plannedMap = new Map();
    backendIncomingOrders.forEach(order => plannedMap.set(order.id || order.orderNo, order));
    incomingOrders.forEach(order => {
      const key = order.id || order.orderNo;
      if (!plannedMap.has(key)) plannedMap.set(key, order);
    });
    const planned = Array.from(plannedMap.values());

    const filteredPlanned = planned.filter(row => {
      if (!globalSearch) return true;
      const custName =
        row.customerName ||
        row.salesOrder?.customer?.companyName ||
        row.salesOrder?.customer?.name ||
        row.salesOrder?.sourceQuotation?.lead?.companyName ||
        row.salesOrder?.sourceQuotation?.lead?.projectName ||
        row.salesOrder?.sourceQuotation?.lead?.customerName ||
        row.salesOrder?.quotation?.lead?.companyName ||
        row.salesOrder?.customerName ||
        row.quotation?.lead?.companyName ||
        row.quotation?.lead?.projectName ||
        row.sourceQuotation?.lead?.companyName ||
        row.sourceQuotation?.lead?.projectName ||
        row.companyName ||
        row.customer?.companyName ||
        row.customer?.name ||
        row.clientName ||
        '';
      const searchVal = (
        custName ||
        row.productInterested || 
        row.products || 
        row.orderNo || 
        ''
      ).toLowerCase();
      return searchVal.includes(globalSearch.toLowerCase());
    });

    const getStatusLabel = (status) => {
      if (!status) return 'QC APPROVED';
      return String(status).replace(/_/g, ' ').toUpperCase();
    };

    const getStatusBadgeStyle = (status) => {
      const s = String(status || '').toLowerCase();
      if (s.includes('approved') || s.includes('passed') || s.includes('completed') || s.includes('success') || s.includes('confirm')) {
        return {
          background: '#ecfdf5',
          color: '#065f46',
          border: '1.5px solid #a7f3d0'
        };
      }
      if (s.includes('pending') || s.includes('plan')) {
        return {
          background: '#eff6ff',
          color: '#1e40af',
          border: '1.5px solid #bfdbfe'
        };
      }
      if (s.includes('reject') || s.includes('fail')) {
        return {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1.5px solid #fecaca'
        };
      }
      return {
        background: '#f1f5f9',
        color: '#475569',
        border: '1.5px solid #cbd5e1'
      };
    };

    const getPriorityBadgeStyle = (priority) => {
      const p = String(priority || '').toLowerCase();
      if (p === 'high') {
        return {
          background: '#fffbeb',
          color: '#b45309',
          border: '1.5px solid #fde68a'
        };
      }
      if (p === 'low') {
        return {
          background: '#f8fafc',
          color: '#64748b',
          border: '1.5px solid #cbd5e1'
        };
      }
      return {
        background: '#f8fafc',
        color: '#475569',
        border: '1.5px solid #cbd5e1'
      };
    };

    const renderProductSummary = (row) => {
      let itemsList = [];
      if (Array.isArray(row.detailedItems) && row.detailedItems.length > 0) {
        itemsList = row.detailedItems.map(i => i.productName || i.name || i.productCode).filter(Boolean);
      } else if (Array.isArray(row.items) && row.items.length > 0) {
        itemsList = row.items.map(i => i.productName || i.name || i.product?.name || i.productCode).filter(Boolean);
      } else if (typeof row.productInterested === 'string' && row.productInterested.trim()) {
        itemsList = row.productInterested.split(',').map(s => s.trim()).filter(Boolean);
      } else if (typeof row.products === 'string' && row.products.trim()) {
        itemsList = row.products.split(',').map(s => s.trim()).filter(Boolean);
      }

      if (itemsList.length === 0) return <span style={{ color: '#64748b' }}>Various</span>;

      const displayed = itemsList.slice(0, 2);
      const remainingCount = itemsList.length - 2;

      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }} title={itemsList.join(', ')}>
          <span style={{ color: '#0f172a', fontWeight: '600', fontSize: '12.5px' }}>
            {displayed.join(', ')}
          </span>
          {remainingCount > 0 && (
            <span
              style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                padding: '1px 7px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '800',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title={itemsList.slice(2).join(', ')}
            >
              +{remainingCount} more
            </span>
          )}
        </div>
      );
    };

    return (
      <div className="app-card" style={{ padding: isMobile ? '12px' : '20px' }}>
        <div className="card-top-bar" style={{ marginBottom: isMobile ? '12px' : '20px' }}>
          <h2 className="card-heading">Incoming Production Orders</h2>
        </div>

        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredPlanned.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '30px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                No incoming orders from Plant Head yet. Orders planned by Plant Head will appear here.
              </div>
            ) : (
              filteredPlanned.map((row) => {
                const hasWO = row.hasBackendWorkOrder ||
                  (workOrders.some(wo => wo.orderNo === row.orderNo && wo.status !== STATUS.PLANNED) && !row.isReproduction);
                const isActiveProduction = [STATUS.IN_PRODUCTION, STATUS.QC_PENDING, STATUS.QC_PASSED].includes(row.status);

                const customerName =
                  row.customerName ||
                  row.salesOrder?.customer?.companyName ||
                  row.salesOrder?.customer?.name ||
                  row.salesOrder?.sourceQuotation?.lead?.companyName ||
                  row.salesOrder?.sourceQuotation?.lead?.projectName ||
                  row.salesOrder?.sourceQuotation?.lead?.customerName ||
                  row.salesOrder?.quotation?.lead?.companyName ||
                  row.salesOrder?.customerName ||
                  row.quotation?.lead?.companyName ||
                  row.quotation?.lead?.projectName ||
                  row.sourceQuotation?.lead?.companyName ||
                  row.sourceQuotation?.lead?.projectName ||
                  row.companyName ||
                  row.customer?.companyName ||
                  row.customer?.name ||
                  row.clientName ||
                  'N/A';
                const quantityNeeded = `${row.estimatedQuantity || row.quantity || row.totalQuantity || 0} Units`;
                const targetDate = row.targetDate ? new Date(row.targetDate).toLocaleDateString('en-GB') : (row.deliveryDate || row.date || 'TBD');
                const workflowStatus = row.workflowStatus || row.status || 'QC APPROVED';
                const priority = row.priority || 'Medium';

                return (
                  <div 
                    key={row.id || row.orderNo} 
                    style={{ 
                      background: '#ffffff', 
                      border: '1.5px solid #e2e8f0', 
                      borderRadius: '12px', 
                      padding: '16px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '14px', 
                      boxShadow: '0 2px 4px rgba(0,0,0,0.01)' 
                    }}
                  >
                    {/* Card Info Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span
                              style={{ 
                                color: '#1e40af', 
                                cursor: 'pointer', 
                                textDecoration: 'underline', 
                                fontWeight: 'bold',
                                fontSize: '13.5px',
                                wordBreak: 'break-all'
                              }}
                              onClick={() => setSelectedOrderDetails(row)}
                            >
                              {row.orderNo}
                            </span>
                            {row.isReproduction && (
                              <span style={{ fontSize: '9px', background: '#ffe4e6', color: '#e11d48', border: '1px solid #fecdd3', padding: '1px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                                Reproduction
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '11.5px', fontWeight: '600', marginTop: '2px' }}>
                            {customerName}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                          <span style={{ color: '#1e293b', fontSize: '12.5px', fontWeight: '800' }}>
                            {quantityNeeded}
                          </span>
                          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '500' }}>
                            {targetDate}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {renderProductSummary(row)}
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div 
                      style={{ 
                        borderTop: '1px solid #f1f5f9', 
                        paddingTop: '12px', 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        alignItems: 'center',
                        gap: '8px' 
                      }}
                    >
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', justifyContent: 'flex-end' }}>
                        {row.hasBackendWorkOrder ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleBackendIncomingDecision(row, 'ACCEPT')}
                              style={{ 
                                margin: 0, 
                                background: '#16a34a', 
                                color: '#fff', 
                                cursor: 'pointer',
                                padding: '6px 12px',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBackendIncomingDecision(row, 'REJECT')}
                              style={{ 
                                margin: 0, 
                                background: '#ef4444', 
                                color: '#fff', 
                                cursor: 'pointer',
                                padding: '6px 12px',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedOrderDetails(row)}
                              style={{ 
                                margin: 0, 
                                background: '#fff', 
                                color: '#475569', 
                                border: '1px solid #cbd5e1', 
                                cursor: 'pointer',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Eye size={12} /> View
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setSelectedOrderDetails(row)}
                              style={{ 
                                margin: 0, 
                                background: '#fff', 
                                color: '#475569', 
                                border: '1px solid #cbd5e1', 
                                cursor: 'pointer',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Eye size={12} /> View
                            </button>
                            {!hasWO && !isActiveProduction ? (
                              <button
                                type="button"
                                onClick={() => handleCreateWorkOrder(row)}
                                style={{ 
                                  margin: 0, 
                                  background: '#1e3a8a', 
                                  color: '#fff', 
                                  border: 'none', 
                                  padding: '6px 12px', 
                                  borderRadius: '6px', 
                                  fontWeight: 'bold', 
                                  cursor: 'pointer', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  fontSize: '12px'
                                }}
                              >
                                <Play size={12} fill="#fff" /> Activate Work Order
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => navigate.push('/production/work-orders')}
                                style={{ 
                                  margin: 0, 
                                  background: '#059669', 
                                  color: '#fff', 
                                  border: 'none', 
                                  padding: '6px 12px', 
                                  borderRadius: '6px', 
                                  fontWeight: 'bold', 
                                  cursor: 'pointer', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '4px', 
                                  fontSize: '12px' 
                                }}
                              >
                                <Briefcase size={12} /> Open Work Orders
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <DataTable
            columns={[
              {
                header: 'Order No', accessor: 'orderNo', render: (row) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{ color: 'var(--color-text-primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                      onClick={() => setSelectedOrderDetails(row)}
                    >
                      {row.orderNo}
                    </span>
                    {row.isReproduction && (
                      <span style={{ fontSize: '10px', background: '#ffe4e6', color: '#e11d48', border: '1px solid #fecdd3', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                        Reproduction
                      </span>
                    )}
                  </div>
                )
              },
              {
                header: 'Customer',
                accessor: 'customerName',
                render: (row) =>
                  row.customerName ||
                  row.salesOrder?.customer?.companyName ||
                  row.salesOrder?.customer?.name ||
                  row.salesOrder?.sourceQuotation?.lead?.companyName ||
                  row.salesOrder?.sourceQuotation?.lead?.projectName ||
                  row.salesOrder?.sourceQuotation?.lead?.customerName ||
                  row.salesOrder?.quotation?.lead?.companyName ||
                  row.salesOrder?.customerName ||
                  row.quotation?.lead?.companyName ||
                  row.quotation?.lead?.projectName ||
                  row.sourceQuotation?.lead?.companyName ||
                  row.sourceQuotation?.lead?.projectName ||
                  row.companyName ||
                  row.customer?.companyName ||
                  row.customer?.name ||
                  row.clientName ||
                  'N/A'
              },
              { header: 'Product Item', accessor: 'productInterested', render: (row) => renderProductSummary(row) },
              { header: 'Quantity Needed', accessor: 'estimatedQuantity', render: (row) => `${row.estimatedQuantity || row.quantity || row.totalQuantity || 0} Units` },
              { header: 'Target Date', accessor: 'targetDate', render: (row) => row.targetDate ? new Date(row.targetDate).toLocaleDateString('en-GB') : (row.deliveryDate || row.date || 'TBD') }
            ]}
            data={planned}
            searchQuery={globalSearch}
            searchField="customer.name"
            actions={(row) => {
              if (row.hasBackendWorkOrder) {
                return (
                  <>
                    <button
                      type="button"
                      onClick={() => handleBackendIncomingDecision(row, 'ACCEPT')}
                      className="btn-small"
                      style={{ margin: 0, background: '#16a34a', color: '#fff', cursor: 'pointer' }}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBackendIncomingDecision(row, 'REJECT')}
                      className="btn-small btn-danger-small"
                      style={{ margin: 0, border: '1px solid #fecaca', cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOrderDetails(row)}
                      className="btn-small btn-outline-small"
                      style={{ margin: 0, cursor: 'pointer' }}
                    >
                      View
                    </button>
                  </>
                );
              }
              // Check if this order already has work orders
              const hasWO = row.hasBackendWorkOrder ||
                (workOrders.some(wo => wo.orderNo === row.orderNo && wo.status !== STATUS.PLANNED) && !row.isReproduction);
              const isActiveProduction = [STATUS.IN_PRODUCTION, STATUS.QC_PENDING, STATUS.QC_PASSED].includes(row.status);
              return (
                <>
                  <button
                    className="btn-small btn-primary-small"
                    style={{ margin: 0, padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={() => setSelectedOrderDetails(row)}
                  >
                    View
                  </button>
                  {!hasWO && !isActiveProduction ? (
                    <button
                      className="action-btn btn-small"
                      style={{ margin: 0, background: 'var(--color-primary)', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => handleCreateWorkOrder(row)}
                    >
                      <Play size={12} fill="#000" /> Activate Work Order
                    </button>
                  ) : (
                    <button
                      className="btn-small"
                      style={{ margin: 0, background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                      onClick={() => navigate.push('/production/work-orders')}
                    >
                      <CheckCircle2 size={12} /> Open Work Orders
                    </button>
                  )}
                </>
              );
            }}
            emptyMessage="No incoming orders from Plant Head yet. Orders planned by Plant Head will appear here."
          />
        )}
      </div>
    );
  };


  // ── 3. Material Requests (linked to WOs) ──
  const renderMaterialRequests = () => {
    const allItems = [
      ...rawInventory.map(i => ({ ...i, category: 'Raw Material' })),
      ...HARDWARE_ITEMS.map(i => ({ ...i, category: 'Hardware' }))
    ];

    const filteredItems = allItems.filter(item =>
      item.material.toLowerCase().includes(materialSearchQuery.toLowerCase())
    );

    const rawGroup = filteredItems.filter(i => i.category === 'Raw Material');
    const hwGroup = filteredItems.filter(i => i.category === 'Hardware');

    const isAdded = (name) => requestMaterials.some(m => m.material.toLowerCase() === name.toLowerCase());

    const handleSelectDropdownItem = (item) => {
      if (isAdded(item.material)) {
        showToast(`${item.material} is already in your request list.`);
        return;
      }
      const defaultRate = getMaterialRate(item.material);
      setRequestMaterials(prev => [...prev, { material: item.material, qty: 0, category: item.category, rate: defaultRate, discount: 0, tax: 18 }]);
      setMaterialSearchQuery('');
      setShowMaterialSearchDropdown(false);
    };

    const addEmptyRow = () => {
      const remaining = allItems.filter(item => !isAdded(item.material));
      const nextItem = remaining[0] || allItems[0];
      if (nextItem) {
        const defaultRate = getMaterialRate(nextItem.material);
        setRequestMaterials(prev => [...prev, { material: nextItem.material, qty: 0, category: nextItem.category, rate: defaultRate, discount: 0, tax: 18 }]);
      }
    };

    const renderDropdownItems = () => {
      if (filteredItems.length === 0) {
        return (
          <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: '#5E6B82' }}>
            No matching items found
          </div>
        );
      }

      return (
        <div style={{ padding: '8px 0' }}>
          {rawGroup.length > 0 && (
            <div>
              <div style={{ padding: '6px 16px', fontSize: '11px', fontWeight: '800', color: 'var(--color-accent-teal)', background: '#F5FAFE', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Raw Materials
              </div>
              {rawGroup.map(item => {
                const added = isAdded(item.material);
                return (
                  <div
                    key={item.material}
                    onClick={() => !added && handleSelectDropdownItem(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 16px',
                      cursor: added ? 'default' : 'pointer',
                      background: added ? '#F5FAFE' : '#fff',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => { if (!added) e.currentTarget.style.background = '#f1f5f9'; }}
                    onMouseLeave={(e) => { if (!added) e.currentTarget.style.background = added ? '#F5FAFE' : '#fff'; }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: '700', color: added ? '#8893A7' : '#24345C' }}>
                      {item.material}
                    </span>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>
                      {added ? '✓ Added' : `Stock: ${item.stock} ${item.unit}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {hwGroup.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ padding: '6px 16px', fontSize: '11px', fontWeight: '800', color: 'var(--color-accent-purple)', background: '#F5FAFE', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Hardware Components
              </div>
              {hwGroup.map(item => {
                const added = isAdded(item.material);
                return (
                  <div
                    key={item.material}
                    onClick={() => !added && handleSelectDropdownItem(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 16px',
                      cursor: added ? 'default' : 'pointer',
                      background: added ? '#F5FAFE' : '#fff',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => { if (!added) e.currentTarget.style.background = '#f1f5f9'; }}
                    onMouseLeave={(e) => { if (!added) e.currentTarget.style.background = added ? '#F5FAFE' : '#fff'; }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: '700', color: added ? '#8893A7' : '#24345C' }}>
                      {item.material}
                    </span>
                    <span style={{ fontSize: '11px', color: '#5E6B82', fontWeight: '600' }}>
                      {added ? '✓ Added' : `Stock: ${item.stock} ${item.unit}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    };



    const filteredMRs = mRequests.filter(mr => {
      if (mrStatusFilter === 'All') return ['REQUESTED', 'RETURNED_FOR_CORRECTION', 'ISSUED'].includes(mr.status);
      return mr.status === mrStatusFilter;
    });

    return (
      <div className="app-card" style={{ flex: 1, width: '100%', maxWidth: 'none', margin: '0' }}>
        {/* Header */}
        <div className="module-header-row" style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="card-top-icon-btn"
              onClick={() => navigate.push('/production/work-orders')}
              style={{ width: '36px', height: '36px', background: '#f1f3f5', color: '#000', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="module-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '20px', fontWeight: '800' }}>
                <PackagePlus size={20} style={{ color: 'var(--color-accent-purple)' }} />
                <span>Material Requests</span>
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px', margin: 0 }}>
                Raise and track raw materials and hardware components required for production.
              </p>
            </div>
          </div>

          {/* Tab filter toggles */}
          <div className="tab-filters-row" style={{ background: '#f1f3f5', borderRadius: '10px', padding: '4px', display: 'flex', gap: '4px' }}>
            <button
              type="button"
              className={`filter-pill ${mrTab === 'Raise' ? 'active' : ''}`}
              onClick={() => {
                setMrTab('Raise');
                setSearchParams({ tab: null });
              }}
              style={{ padding: '6px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12.5px', background: mrTab === 'Raise' ? '#fff' : 'transparent', color: mrTab === 'Raise' ? '#000' : '#475569', boxShadow: mrTab === 'Raise' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}
            >
              Raise Request
            </button>
            <button
              type="button"
              className={`filter-pill ${mrTab === 'Past' ? 'active' : ''}`}
              onClick={() => {
                setMrTab('Past');
                setSearchParams({ tab: 'history' });
              }}
              style={{ padding: '6px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12.5px', background: mrTab === 'Past' ? '#fff' : 'transparent', color: mrTab === 'Past' ? '#000' : '#475569', boxShadow: mrTab === 'Past' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}
            >
              Past Requests ({mRequests.filter(r => ['REQUESTED', 'RETURNED_FOR_CORRECTION', 'ISSUED'].includes(r.status)).length})
            </button>
          </div>
        </div>

        {mrTab === 'Raise' ? (
          <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            {editingRequestDbId && (
              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#b45309', fontWeight: 'bold' }}>
                  ⚠️ Editing Mode: You are correcting Returned Request <strong>{editingRequestDbId}</strong>.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRequestDbId(null);
                    setEditingWoId(null);
                    setRequestMaterials([]);
                  }}
                  style={{ border: 'none', background: 'transparent', color: '#b45309', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
                >
                  Cancel Edit
                </button>
              </div>
            )}
            <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
              <PackagePlus size={16} style={{ color: 'var(--color-accent-purple)' }} />
              <span>Material Selection</span>
            </h3>

            <div className="form-group" style={{ marginBottom: '16px', position: 'relative' }}>
              <label className="form-label">Smart Search & Add</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type keyword to add product..."
                  value={materialSearchQuery}
                  onFocus={() => setShowMaterialSearchDropdown(true)}
                  onBlur={() => setTimeout(() => setShowMaterialSearchDropdown(false), 200)}
                  onChange={(e) => {
                    setMaterialSearchQuery(e.target.value);
                    setShowMaterialSearchDropdown(true);
                  }}
                  style={{ paddingLeft: '36px' }}
                />
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              </div>

              {showMaterialSearchDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#fff',
                  border: '1px solid #DCE5F0',
                  borderRadius: '12px',
                  marginTop: '6px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                  maxHeight: '280px',
                  overflowY: 'auto',
                  zIndex: 100
                }}>
                  {renderDropdownItems()}
                </div>
              )}
            </div>

            <form onSubmit={handleRaiseRequestDirectSubmit}>
              <input type="hidden" name="work_order_id" value={resolvedWoId} />

              {/* Items Catalog Table */}
              <div className="crm-table-container" style={{ marginTop: '12px', border: '1px solid #DCE5F0', background: '#fff' }}>
                <table className="crm-table responsive-table" style={{ fontSize: '12px', width: '100%' }}>
                  <thead>
                    <tr style={{ background: '#F5FAFE' }}>
                      <th style={{ width: '70%', padding: '10px' }}>Material Details *</th>
                      <th style={{ width: '20%', padding: '10px', textAlign: 'center' }}>Qty *</th>
                      <th style={{ width: '10%', padding: '10px', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestMaterials.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: '#5E6B82', fontStyle: 'italic', fontWeight: '500' }}>
                          No items added yet. Use the "Smart Search & Add" bar above to select raw materials or hardware components.
                        </td>
                      </tr>
                    ) : (
                      requestMaterials.map((item, index) => {
                        const invStatus = getInventoryStatus(item.material);
                        const isRaw = item.category === 'Raw Material';
                        return (
                          <tr key={index}>
                            <td data-label="Product Details" style={{ padding: '12px 10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: isRaw ? 'rgba(20, 184, 166, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                  color: isRaw ? 'var(--color-accent-teal)' : 'var(--color-accent-purple)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  {getMaterialIcon(item.material)}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0, flex: 1 }}>
                                  <select
                                    value={item.material}
                                    onChange={(e) => {
                                      const newMatName = e.target.value;
                                      if (isAdded(newMatName)) {
                                        showToast(`${newMatName} is already in your request list.`);
                                        return;
                                      }
                                      const matchedItem = allItems.find(i => i.material === newMatName);
                                      if (matchedItem) {
                                        setRequestMaterials(prev => prev.map((row, idx) => {
                                          if (idx === index) {
                                            return {
                                              ...row,
                                              material: matchedItem.material,
                                              category: matchedItem.category,
                                              rate: getMaterialRate(matchedItem.material)
                                            };
                                          }
                                          return row;
                                        }));
                                      }
                                    }}
                                    className="form-select"
                                    style={{
                                      padding: '6px 10px',
                                      fontSize: '13px',
                                      fontWeight: '700',
                                      border: '1px solid #D6E2F0',
                                      borderRadius: '8px',
                                      width: '100%',
                                      height: '36px',
                                      background: '#fff',
                                      color: '#24345C'
                                    }}
                                  >
                                    {allItems.map(prod => (
                                      <option key={prod.material} value={prod.material}>
                                        {prod.material} ({prod.category})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </td>
                            <td data-label="Qty" style={{ padding: '12px 10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%', maxWidth: '160px' }}>
                                <input
                                  type="number"
                                  step={getStep(item.material)}
                                  className="form-input"
                                  min="0.00"
                                  value={item.qty}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setRequestMaterials(prev => prev.map((row, idx) => {
                                      if (idx === index) {
                                        return { ...row, qty: val === '' ? '' : Number(val) };
                                      }
                                      return row;
                                    }));
                                  }}
                                  required
                                  style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 'bold', width: '100%', paddingRight: '55px' }}
                                />
                                <span style={{
                                  position: 'absolute',
                                  right: '6px',
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  color: '#475569',
                                  background: '#f1f5f9',
                                  padding: '3px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #DCE5F0',
                                  textTransform: 'uppercase'
                                }}>
                                  {invStatus.unit.substring(0, 4)}
                                </span>
                              </div>
                            </td>
                            <td data-label="Remove" style={{ padding: '12px 10px', textAlign: 'center' }}>
                              <button
                                type="button"
                                className="btn-small btn-danger-small"
                                onClick={() => setRequestMaterials(prev => prev.filter((_, idx) => idx !== index))}
                                style={{ padding: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add manual row button */}
              <button
                type="button"
                className="btn-small btn-outline-small"
                onClick={addEmptyRow}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontWeight: '700' }}
              >
                <Plus size={12} /> Add Product Row
              </button>

              {/* Form Actions (Submit & Cancel) */}
              <div style={{ display: 'flex', gap: '14px', borderTop: '1px solid #eaeaea', paddingTop: '24px', marginTop: '24px' }}>
                <button
                  type="submit"
                  className="form-submit-btn"
                  style={{
                    margin: 0,
                    padding: '12px 28px',
                    flex: 1,
                    background: 'linear-gradient(135deg, #1e293b 0%, #24345C 100%)',
                    color: 'var(--color-lime-brand, #3BAEEB)',
                    border: 'none',
                    fontWeight: '800',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px rgba(15, 23, 42, 0.25)'; }}
                  onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 14px rgba(15, 23, 42, 0.15)'; }}
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  className="btn-small btn-outline-small"
                  onClick={() => navigate.push('/production/work-orders')}
                  style={{
                    margin: 0,
                    padding: '12px 28px',
                    background: 'transparent',
                    color: '#475569',
                    border: '1.5px solid #D6E2F0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.target.style.background = '#F5FAFE'; e.target.style.color = '#24345C'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#475569'; }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
              <Clock size={16} style={{ color: 'var(--color-accent-teal)' }} />
              <span>Material Requests Log History</span>
            </h3>

            {/* Status filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
              <div className="tab-filters-row" style={{ background: '#DCE5F0', borderRadius: '10px', padding: '4px', display: 'flex', gap: '4px', width: 'max-content', flexShrink: 0 }}>
                {[
                  { key: 'All', label: 'All' },
                  { key: 'REQUESTED', label: 'Requested' },
                  { key: 'RETURNED_FOR_CORRECTION', label: 'Returned for Correction' },
                  { key: 'ISSUED', label: 'Issued' }
                ].map(({ key: status, label }) => {
                  const count = status === 'All'
                    ? mRequests.filter(r => ['REQUESTED', 'RETURNED_FOR_CORRECTION', 'ISSUED'].includes(r.status)).length
                    : mRequests.filter(r => r.status === status).length;
                  return (
                    <button
                      key={status}
                      type="button"
                      className={`filter-pill ${mrStatusFilter === status ? 'active' : ''}`}
                      onClick={() => setMrStatusFilter(status)}
                      style={{ padding: '6px 14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', background: mrStatusFilter === status ? '#fff' : 'transparent', color: mrStatusFilter === status ? '#000' : '#475569', boxShadow: mrStatusFilter === status ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                    >
                      {label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <DataTable
              columns={[
                { header: 'Request ID', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-text-primary)' }}>{row.id}</strong> },
                {
                  header: 'Sales Order Number', accessor: 'orderNo', render: (row) => (
                    <span
                      style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                      onClick={() => {
                        const order = orders.find(o => o.orderNo === row.orderNo);
                        if (order) setSelectedOrderDetails(order);
                      }}
                    >
                      {row.orderNo || row.workOrderId || '—'}
                    </span>
                  )
                },
                {
                  header: 'Materials List',
                  accessor: 'materials',
                  render: (row) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', color: 'var(--color-text-primary)' }}>
                      {row.materials?.map((m, idx) => {
                        const invItem = rawInventory?.find(i => i.material.toLowerCase() === (m.materialName || '').toLowerCase()) ||
                          HARDWARE_ITEMS?.find(i => i.material.toLowerCase() === (m.materialName || '').toLowerCase());
                        const unit = invItem ? invItem.unit : 'Tons';
                        return (
                          <span key={idx} style={{ fontSize: '12px' }}>
                            • {m.materialName}: <strong>{m.quantityRequested} {unit}</strong> (Approved: {m.quantityApproved} {unit})
                          </span>
                        );
                      })}
                    </div>
                  )
                },
                { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
              ]}
              data={filteredMRs}
              searchQuery={globalSearch}
              searchField="workOrderId"
              actions={(row) => {
                if (row.status === 'RETURNED_FOR_CORRECTION') {
                  return (
                    <button
                      type="button"
                      className="btn-small"
                      style={{ margin: 0, background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', border: 'none', fontWeight: 'bold' }}
                      onClick={() => handleEditReturnedRequest(row)}
                    >
                      Correct Request
                    </button>
                  );
                }
                return null;
              }}
              emptyMessage="No material requests found matching the status filter."
            />
          </div>
        )}
      </div>
    );
  };

  // ── 4. Store Releases Visbility ──
  const renderStoreReleases = () => {
    // A release becomes visible to Production only after Store has issued it.
    // Keep legacy status variants so previously saved releases remain visible.
    const erpIssuedRequests = mRequests.filter(request =>
      ['ISSUED', 'MATERIAL_ISSUED', 'Issued'].includes(request.status)
    );
    const workflowIssuedStatuses = ['Issued', 'Received', 'Consuming', 'Return Pending', 'Returned', 'Closed'];
    const workflowIssuedRequests = workflowMaterialRequests
      .filter(request => workflowIssuedStatuses.includes(request.status))
      .map(request => ({
        ...request,
        id: request.requestNo || request.id,
        workOrderId: request.workOrderNo || '—',
        orderNo: request.workOrderNo || '—',
        materials: (request.items || []).map(item => ({
          materialName: item.material,
          quantityRequested: item.requestedQty,
          quantityApproved: item.approvedQty,
          quantityIssued: item.issuedQty,
          unit: item.unit
        }))
      }));
    const activeMRs = [...erpIssuedRequests, ...workflowIssuedRequests];

    return (
      <div className="app-card">
        <div className="card-top-bar">
          <div>
            <h2 className="card-heading">Materials Released by Store</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
              Materials confirmed and issued by Store for Production.
            </p>
          </div>
        </div>
        <DataTable
          columns={[
            { header: 'Request ID', accessor: 'id', render: (row) => <strong style={{ color: '#000000' }}>{row.id}</strong> },
            {
              header: 'Sales Order Number', accessor: 'orderNo', render: (row) => (
                <span
                  style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                  onClick={() => navigate.push(`/orders/${row.orderNo || row.workOrderId}`)}
                >
                  {row.orderNo || row.workOrderId || '—'}
                </span>
              )
            },
            {
              header: 'Materials List',
              accessor: 'materials',
              render: (row) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {row.materials?.map((m, idx) => (
                    <span key={idx} style={{ fontSize: '12px' }}>
                      • {m.materialName}: <strong>{m.quantityIssued ?? m.quantityApproved ?? m.quantityRequested} {m.unit || rawInventory.find(item => item.material === m.materialName)?.unit || 'Tons'}</strong>
                    </span>
                  ))}
                </div>
              )
            },
            { header: 'Production Receipt State', accessor: 'status', render: () => <StatusBadge status="RECEIVED" /> }
          ]}
          data={activeMRs}
          searchQuery={globalSearch}
          searchField="workOrderId"
          emptyMessage="No materials have been confirmed and issued by Store yet."
        />
      </div>
    );
  };

  // ── 5. Production Work Floor ──
  const renderProductionWork = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    // Active floor jobs: In Production, Paused, Rework status
    const activeFloorWOs = workOrders.filter(wo =>
      isRunningProductionStatus(wo.status) || wo.status === STATUS.PAUSED
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {/* Module Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-card-bg)', padding: '20px 24px', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-soft)' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={22} style={{ color: 'var(--color-accent-teal)' }} />
              Real-time Production Floor
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
              Execute, track live machine runtimes, and log active workshop progress.
            </p>
          </div>
          <div className="tab-filters-row" style={{ background: '#DCE5F0', borderRadius: '10px', padding: '4px', display: 'flex', gap: '4px' }}>
            <button
              type="button"
              className={`filter-pill ${activeTab === 'Planned' ? 'active' : ''}`}
              onClick={() => setActiveTab('Planned')}
              style={{ padding: '6px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12.5px', background: activeTab === 'Planned' ? 'var(--color-card-bg)' : 'transparent', color: activeTab === 'Planned' ? '#000' : '#475569', transition: 'all 0.15s' }}
            >
              Active Floor ({activeFloorWOs.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${activeTab === 'Completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('Completed')}
              style={{ padding: '6px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12.5px', background: activeTab === 'Completed' ? 'var(--color-card-bg)' : 'transparent', color: activeTab === 'Completed' ? '#000' : '#475569', transition: 'all 0.15s' }}
            >
              QC Pending ({workOrders.filter(wo => wo.status === STATUS.QC_PENDING).length})
            </button>
          </div>
        </div>

        {/* ── Running Orders Summary Table ── */}
        <RunningOrdersTable workOrders={workOrders} orders={orders} todayStr={todayStr} />

        {activeTab === 'Planned' ? (
          activeFloorWOs.length === 0 ? (
            <div className="app-card" style={{ padding: '48px', textAlign: 'center', color: '#5E6B82' }}>
              <Cpu size={36} style={{ color: '#8893A7', marginBottom: '12px' }} />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#334155' }}>No Active Shop Floor Execution</h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#8893A7' }}>
                All work orders are pending planning or materials. Go to <strong>Work Orders</strong> to start a job.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeFloorWOs.map(wo => {
                const orderRef = wo.orderNo || wo.order_no || wo.orderId;
                const order = orders.find(o => String(o.orderNo) === String(orderRef) || String(o.id) === String(orderRef) || String(o.order_no) === String(orderRef));
                const customerName = order?.customerName || order?.customer?.name || order?.companyName || wo?.customerName || wo?.customer_name || '—';
                const resolvedTargetDate = order?.deliveryDate || wo.targetDate || '—';
                return (
                  <ActiveFloorCard
                    key={wo.id}
                    wo={wo}
                    customerName={customerName}
                    targetDate={resolvedTargetDate}
                    onPause={handlePauseProduction}
                    onResume={handleResumeProduction}
                    onComplete={handleCompleteProduction}
                    todayStr={todayStr}
                  />
                );
              })}
            </div>
          )
        ) : (
          <div className="app-card">
            <DataTable
              columns={[
                {
                  header: 'Order Ref', accessor: 'orderNo', nowrap: true, render: (row) => (
                    <span
                      style={{ color: 'var(--color-text-primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                      onClick={() => {
                        const order = orders.find(o => o.orderNo === row.orderNo);
                        if (order) setSelectedOrderDetails(order);
                      }}
                    >
                      {row.orderNo}
                    </span>
                  )
                },
                {
                  header: 'Customer', accessor: 'orderNo', render: (row) => {
                    const order = orders.find(o => o.orderNo === row.orderNo);
                    return order?.customer?.name || '—';
                  }
                },
                { header: 'Product Item', accessor: 'productName', nowrap: true },
                { header: 'Volume', accessor: 'quantity', render: (row) => `${row.quantity} Tons` },
                { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
              ]}
              data={workOrders.filter(wo => wo.status === STATUS.QC_PENDING)}
              searchQuery={globalSearch}
              searchField="productName"
              emptyMessage="No batches waiting for Quality Testing inspection."
            />
          </div>
        )}
      </div>
    );
  };

  const renderActiveWorkOrders = () => {
    const isInProduction = (status) =>
      [STATUS.IN_PRODUCTION, 'PRODUCTION_STARTED', 'In Production', 'Running'].includes(status);
    const isCompletedOrQC = (status) => ['Completed', 'Testing', 'QC Pending', STATUS.QC_PENDING, 'QC Passed', STATUS.QC_PASSED, 'QC Failed', STATUS.PRODUCTION_COMPLETED, 'PRODUCTION_COMPLETED'].includes(status);
    const canCompleteWorkOrder = (wo) => {
      const producedQty = Number(wo.quantityProduced || wo.producedQty || wo.quantity || 0);
      const hasBatch = Boolean(wo.batchNo || wo.batchNumber || wo.batch || wo.notes?.batchNo);
      const hasProductionLog = Boolean(wo.notes?.productionLogSaved || wo.notes?.productionLogs || wo.lastStartedAt || wo.accumulatedTime || wo.operator || wo.machine);
      const hasStartTime = Boolean(wo.lastStartedAt || wo.notes?.startTime || wo.startedAt);
      const hasEndTime = Boolean(wo.notes?.endTime || wo.completedAt || wo.endTime);
      return isInProduction(wo.status) && producedQty > 0 && hasBatch && hasProductionLog && hasStartTime && hasEndTime;
    };

    // Group work orders by Sales Order
    const groupedOrdersMap = {};
    workOrders.forEach(wo => {
      const orderKey = wo.orderNo || wo.orderId || wo.id || 'SO-UNASSIGNED';
      const matchedOrder = orders.find(o => String(o.orderNo) === String(orderKey) || String(o.id) === String(orderKey) || String(o.order_no) === String(orderKey));
      const customerName = matchedOrder?.customerName || matchedOrder?.customer?.companyName || matchedOrder?.customer?.name || matchedOrder?.companyName || wo.customerName || 'Standard Production';

      if (!groupedOrdersMap[orderKey]) {
        groupedOrdersMap[orderKey] = {
          orderKey,
          orderNo: orderKey,
          customerName,
          targetDate: wo.targetDate || matchedOrder?.targetDate || matchedOrder?.deliveryDate || 'TBD',
          matchedOrder,
          items: [],
          totalQty: 0
        };
      }
      groupedOrdersMap[orderKey].items.push(wo);
      groupedOrdersMap[orderKey].totalQty += Number(wo.quantity || 1);
    });

    const groupedOrdersList = Object.values(groupedOrdersMap);

    return (
      <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="card-heading" style={{ margin: 0 }}>Production Work Orders</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
              All manufacturing work orders organized order-wise with multi-product batch tracking.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' }}>
              📦 {groupedOrdersList.length} Orders / {workOrders.length} Products
            </span>
          </div>
        </div>

        {groupedOrdersList.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
            No active work orders found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {groupedOrdersList.map(group => (
              <div
                key={group.orderKey}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
                }}
              >
                {/* Order Group Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 18px',
                    background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderBottom: '1.5px solid #e2e8f0',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <span
                      style={{ color: '#0284c7', cursor: 'pointer', textDecoration: 'underline', fontWeight: '800', fontSize: '14px' }}
                      onClick={() => {
                        if (group.matchedOrder) setSelectedOrderDetails(group.matchedOrder);
                      }}
                    >
                      {group.orderNo}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                      👤 {group.customerName}
                    </span>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                      📦 {group.items.length} {group.items.length === 1 ? 'Product' : 'Products'}
                    </span>
                    <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                      🔢 {group.totalQty} Units Total
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                      📅 Target: {group.targetDate ? (group.targetDate.includes('-') || group.targetDate.includes('/') ? group.targetDate : new Date(group.targetDate).toLocaleDateString('en-GB')) : 'TBD'}
                    </span>
                    <button
                      type="button"
                      className="btn-small"
                      style={{ padding: '4px 10px', fontSize: '11.5px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}
                      onClick={() => {
                        if (group.matchedOrder) setSelectedOrderDetails(group.matchedOrder);
                      }}
                    >
                      View Order
                    </button>
                  </div>
                </div>

                {/* Products Table for this Order */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                        <th style={{ padding: '8px 16px', fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>#</th>
                        <th style={{ padding: '8px 16px', fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Product Item</th>
                        <th style={{ padding: '8px 16px', fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Work Order #</th>
                        <th style={{ padding: '8px 16px', fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Ordered Qty</th>
                        <th style={{ padding: '8px 16px', fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                        <th style={{ padding: '8px 16px', fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((row, idx) => (
                        <tr key={row.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 16px', color: '#94a3b8', fontWeight: '700' }}>{idx + 1}</td>
                          <td style={{ padding: '10px 16px', fontWeight: '700', color: '#0f172a' }}>{row.productName || 'Product Item'}</td>
                          <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: '11px', color: '#475569' }}>{row.workOrderNumber || '—'}</td>
                          <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                            <span style={{ border: '1.5px solid #0284c7', borderRadius: '6px', padding: '3px 8px', color: '#0284c7', fontWeight: '900', background: '#f0f9ff', fontSize: '12px' }}>
                              {Number(row.quantity || 1).toLocaleString()} {row.unit || 'Units'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                            <StatusBadge status={row.status} />
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                            {isInProduction(row.status) ? (
                              <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button
                                  className="btn-small btn-outline-small"
                                  style={{ margin: 0, padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}
                                  onClick={() => handlePauseProduction(row)}
                                >
                                  Pause
                                </button>
                                <button
                                  className="btn-small btn-primary-small"
                                  style={{ margin: 0, padding: '4px 10px', fontSize: '11px', background: canCompleteWorkOrder(row) ? '#10b981' : '#8893A7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: canCompleteWorkOrder(row) ? 'pointer' : 'not-allowed', opacity: canCompleteWorkOrder(row) ? 1 : 0.7 }}
                                  onClick={() => canCompleteWorkOrder(row) && handleCompleteProduction(row)}
                                  disabled={!canCompleteWorkOrder(row)}
                                  title={canCompleteWorkOrder(row) ? 'Complete production and send to QC' : 'Production cannot be completed until produced quantity, batch details, and production logs are recorded.'}
                                >
                                  Complete
                                </button>
                              </div>
                            ) : isCompletedOrQC(row.status) ? (
                              <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: '800', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                                {row.status === 'Completed' || row.status === STATUS.PRODUCTION_COMPLETED ? '✓ Finished' : row.status}
                              </span>
                            ) : (
                              <button
                                className="btn-small btn-primary-small"
                                style={{ margin: 0, padding: '4px 10px', fontSize: '11px', background: 'var(--color-primary)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => handleStartProduction(row)}
                              >
                                {row.status === STATUS.PAUSED || row.status === 'PAUSED' ? 'Resume Work' : 'Start Work'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCompletedWorkOrders = () => {
    const completedWOs = workOrders.filter(wo =>
      ['Completed', STATUS.PRODUCTION_COMPLETED, 'PRODUCTION_COMPLETED', STATUS.QC_PENDING, 'QC_PENDING', STATUS.QC_PASSED, 'QC_PASSED', 'READY_FOR_DISPATCH'].includes(wo.status || wo.workflowStatus)
    );

    const totalUnits = completedWOs.reduce((sum, wo) => sum + Number(wo.producedQty || wo.producedQuantity || wo.quantity || 0), 0);
    const qcPendingCount = completedWOs.filter(wo => ['Completed', STATUS.PRODUCTION_COMPLETED, 'PRODUCTION_COMPLETED', STATUS.QC_PENDING, 'QC_PENDING'].includes(wo.status || wo.workflowStatus)).length;
    const qcPassedCount = completedWOs.filter(wo => [STATUS.QC_PASSED, 'QC_PASSED', 'READY_FOR_DISPATCH'].includes(wo.status || wo.workflowStatus)).length;

    return (
      <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="card-heading" style={{ margin: 0 }}>Completed Production Batches</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
              Historical archive of manufactured batches, cycle times, and QC clearance status.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12.5px' }}
            onClick={() => navigate.push('/production/qc-pending')}
          >
            <Clock size={14} /> Open QC Inspection Queue
          </button>
        </div>

        {/* Metric KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <ClipboardCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Completed Batches</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{completedWOs.length}</div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Package size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>Units Produced</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{totalUnits.toLocaleString()} SETS</div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fffbeb', color: '#d97706', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>QC Pending</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#d97706' }}>{qcPendingCount} Batches</div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', color: '#16a34a', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>QC Approved</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#16a34a' }}>{qcPassedCount} Batches</div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={[
            {
              header: 'Sales Order Number', accessor: 'orderNo', render: (row) => (
                <span
                  style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                  onClick={() => {
                    const order = orders.find(o => String(o.orderNo) === String(row.orderNo) || String(o.id) === String(row.orderId || row.orderNo));
                    if (order) setSelectedOrderDetails(order);
                  }}
                >
                  {row.orderNo || row.orderId || row.id || '—'}
                </span>
              )
            },
            { 
              header: 'Customer', accessor: 'orderNo', render: (row) => {
                const orderRef = row.orderNo || row.order_no || row.orderId;
                const order = orders.find(o => String(o.orderNo) === String(orderRef) || String(o.id) === String(orderRef) || String(o.order_no) === String(orderRef));
                return <span style={{ fontWeight: 600 }}>{order?.customerName || order?.customer?.companyName || order?.customer?.name || order?.companyName || row?.customerName || row?.customer_name || '—'}</span>;
              }
            },
            { header: 'Product Item', accessor: 'productName', render: (row) => <span style={{ fontWeight: 600 }}>{row.productName || 'Custom Product'}</span> },
            { 
              header: 'Produced Qty', 
              accessor: 'producedQty', 
              render: (row) => (
                <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '12px' }}>
                  {(row.producedQty || row.quantity || 0).toLocaleString()} SETS
                </span>
              ) 
            },
            {
              header: 'Quality Status',
              accessor: 'status',
              render: (row) => {
                const s = String(row.status || row.workflowStatus || '').toUpperCase();
                if (s.includes('QC_PASSED') || s.includes('APPROVED') || s.includes('READY')) {
                  return <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11.5px' }}>✅ QC Approved</span>;
                }
                return <span style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11.5px' }}>🔍 Sent to QC</span>;
              }
            }
          ]}
          data={completedWOs}
          searchQuery={globalSearch}
          searchField="productName"
          actions={(row) => (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                className="btn-small"
                style={{ margin: 0, padding: '5px 10px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
                onClick={() => {
                  const order = orders.find(o => String(o.orderNo) === String(row.orderNo) || String(o.id) === String(row.orderId || row.orderNo));
                  if (order) setSelectedOrderDetails(order);
                }}
              >
                View
              </button>
              <button
                className="btn-small"
                style={{ margin: 0, padding: '5px 10px', background: '#fdf4ff', color: '#9333ea', border: '1px solid #f0abfc', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
                onClick={() => navigate.push('/production/qc-pending')}
              >
                QC Queue
              </button>
            </div>
          )}
          emptyMessage="No completed work orders recorded."
        />
      </div>
    );
  };

  const renderTesting = () => {
    const handleAddItem = (e) => {
      e.preventDefault();
      if (!testingItemName.trim() || !testingItemQty) {
        Swal.fire({
          icon: 'error',
          title: 'Required Fields Missing',
          text: 'Please enter both the Product/Material Name and the Quantity.'
        });
        return;
      }
      const newItem = {
        id: Date.now(),
        name: testingItemName,
        quantity: Number(testingItemQty)
      };
      updateManualTestingItems([newItem, ...manualTestingItems]);
      setTestingItemName('');
      setTestingItemQty('');
      showToast('Testing item added successfully.');
    };

    const handlePrintItem = (item) => {
      const printWindow = window.open('', '_blank', 'width=600,height=450');
      printWindow.document.write(`
        <html>
          <head>
            <title>Quality Testing Slip</title>
            <style>
              body {
                font-family: 'Segoe UI', Arial, sans-serif;
                margin: 0;
                padding: 40px;
                background-color: #ffffff;
                color: #1e293b;
              }
              .slip-container {
                border: 3px double #D6E2F0;
                border-radius: 16px;
                padding: 30px;
                max-width: 500px;
                margin: 0 auto;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #DCE5F0;
                padding-bottom: 16px;
                margin-bottom: 24px;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 800;
                color: #24345C;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .header p {
                margin: 6px 0 0 0;
                font-size: 13px;
                color: #5E6B82;
                font-weight: 600;
              }
              .field-group {
                display: flex;
                flex-direction: column;
                gap: 16px;
              }
              .field-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px dashed #DCE5F0;
                padding-bottom: 10px;
              }
              .field-label {
                font-size: 13px;
                font-weight: 700;
                color: #5E6B82;
                text-transform: uppercase;
              }
              .field-value {
                font-size: 16px;
                font-weight: 800;
                color: #24345C;
              }
              .barcode-placeholder {
                margin-top: 30px;
                text-align: center;
                border: 1.5px dashed #D6E2F0;
                padding: 12px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 12px;
                color: #8893A7;
                font-weight: bold;
                letter-spacing: 3px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                font-size: 11px;
                color: #8893A7;
                font-weight: 600;
              }
              @media print {
                body { padding: 0; }
                .slip-container { border: 2px solid #000; box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <div class="slip-container">
              <div class="header">
                <h1>HIMALAYA ERP</h1>
                <p>QUALITY INSPECTION TESTING SLIP</p>
              </div>
              <div class="field-group">
                <div class="field-row">
                  <span class="field-label">Slip Reference</span>
                  <span class="field-value">TS-` + "${item.id.toString().slice(-6)}" + `</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Product / Material</span>
                  <span class="field-value">` + "${item.name}" + `</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Quantity</span>
                  <span class="field-value">` + "${Number(item.quantity).toLocaleString()}" + ` pcs</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Inspection Date</span>
                  <span class="field-value">` + "${new Date().toLocaleDateString()}" + `</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Inspection Time</span>
                  <span class="field-value">` + "${new Date().toLocaleTimeString()}" + `</span>
                </div>
              </div>
              <div class="barcode-placeholder">
                *TS-` + "${item.id.toString().slice(-6)}" + `*
              </div>
              <div class="footer">
                Himalaya Manufacturing Quality Control Department
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>

        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-card-bg)', padding: '20px 24px', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-soft)' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={22} style={{ color: '#6366f1' }} />
              Production Quality Testing Log
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>Manually record testing products/materials and print slips</p>
          </div>
        </div>

        {/* Add Item Form Card */}
        <div className="app-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 16px 0', color: 'var(--color-text-primary)' }}>Add New Product / Material for Testing</h3>
          <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 220px', minWidth: 0, width: isMobile ? '100%' : 'auto' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>Product / Material Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Cement Block, Gravel Batch 12..."
                value={testingItemName}
                onChange={(e) => setTestingItemName(e.target.value)}
                style={{ width: '100%', margin: 0 }}
              />
            </div>
            <div style={{ flex: '1 1 120px', minWidth: 0, width: isMobile ? '100%' : 'auto' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>Quantity (pcs)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 500"
                value={testingItemQty}
                onChange={(e) => setTestingItemQty(e.target.value)}
                style={{ width: '100%', margin: 0 }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '12px 24px', height: '42px', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--color-primary)', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}
            >
              <Plus size={16} /> Add to Log
            </button>
          </form>
        </div>

        {/* List Card */}
        <div className="app-card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: 'var(--color-text-primary)' }}>Testing Log Register</h3>
          </div>
          <DataTable
            columns={[
              { header: 'Reference', accessor: 'id', render: (row) => <strong>TS-${row.id.toString().slice(-6)}</strong> },
              { header: 'Product / Material Name', accessor: 'name', render: (row) => <strong style={{ color: 'var(--color-text-primary)' }}>{row.name}</strong> },
              { header: 'Quantity (pcs)', accessor: 'quantity', render: (row) => `${Number(row.quantity).toLocaleString()} pcs` }
            ]}
            data={manualTestingItems}
            searchQuery={globalSearch}
            searchField="name"
            actions={(row) => (
              <button
                onClick={() => handlePrintItem(row)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                <Printer size={14} /> Print Slip
              </button>
            )}
            emptyMessage="No manual testing entries in the log."
          />
        </div>
      </div>
    );
  };

  const renderRework = () => {
    const pendingRework = mockReworkItems.filter(rw => rw.status === 'Pending');

    const handleCompleteReworkAction = (rework) => {
      Swal.fire({
        title: 'Complete Rework & Send to QC?',
        text: `Are you sure you want to mark rework for ${rework.workOrderId} (${rework.reworkQty} pcs) as Completed?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Send to QC',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'swal-premium-popup',
          title: 'swal-premium-title',
          confirmButton: 'swal-premium-confirm-btn',
          cancelButton: 'swal-premium-cancel-btn'
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.isConfirmed) {
          // Update rework item status
          const updatedRework = mockReworkItems.map(r => {
            if (r.id === rework.id) {
              return { ...r, status: 'Rework Completed' };
            }
            return r;
          });
          updateMockReworkItems(updatedRework);

          // Update work order status back to QC Pending so it appears in QC queue!
          const updatedWOs = mockWorkOrders.map(w => {
            if (w.id === rework.workOrderId) {
              return { ...w, status: 'QC Pending', isReworkedBatch: true, reworkedQty: rework.reworkQty };
            }
            return w;
          });
          updateMockWorkOrders(updatedWOs);

          showToast(`Rework completed. Sent back to QC for Final Inspection.`);
        }
      });
    };

    return (
      <div className="app-card">
        <div className="card-top-bar">
          <h2 className="card-heading">Production Rework Queue</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
            Repair or remanufacture only the rejected pieces returned by QC.
          </p>
        </div>
        <DataTable
          columns={[
            { header: 'Rework ID', accessor: 'id', render: (row) => <strong style={{ color: '#ef4444' }}>{row.id}</strong> },
            { header: 'Sales Order Number', accessor: 'orderNo', render: (row) => <span className="font-bold text-blue-600 hover:underline">{row.orderNo || row.workOrderId || '—'}</span> },
            { header: 'Product Item', accessor: 'productName' },
            { header: 'Produced Qty', accessor: 'producedQty', render: (row) => `${(row.producedQty || 0).toLocaleString()} pcs` },
            { header: 'Rework Qty', accessor: 'reworkQty', render: (row) => <strong style={{ color: '#dc2626' }}>{(row.reworkQty || 0).toLocaleString()} pcs</strong> },
            { header: 'Reason/Defect', accessor: 'reason', render: (row) => <span style={{ color: '#ef4444', fontWeight: '500' }}>⚠️ {row.reason}</span> },
            { header: 'Status', accessor: 'status', render: (row) => <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{row.status}</span> }
          ]}
          data={pendingRework}
          searchQuery={globalSearch}
          searchField="productName"
          actions={(row) => (
            <button
              className="btn-small btn-primary-small"
              style={{ margin: 0, padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => handleCompleteReworkAction(row)}
            >
              Rework Completed
            </button>
          )}
          emptyMessage="No pending rework quantities in the queue."
        />
      </div>
    );
  };


  const renderFinishedGoods = () => {
    return <FinishedGoodsView />;
  };

  const renderReports = () => {
    const reportCategories = [
      { id: 'dashboard', title: 'Dashboard Reports', icon: Activity, desc: 'Overall production performance and KPIs.', color: '#0ea5e9' },
      { id: 'work-orders', title: 'Work Orders Report', icon: ClipboardList, desc: 'Analyze work order completion and cycle times.', color: '#3b82f6' },
      { id: 'incoming-orders', title: 'Incoming Orders Report', icon: Box, desc: 'Track incoming production demands and queues.', color: '#8b5cf6' },
      { id: 'material-requests', title: 'Material Requests Report', icon: Layers, desc: 'Review material consumption and requisition trends.', color: '#f59e0b' },
      { id: 'store-releases', title: 'Store Releases Report', icon: PackageCheck, desc: 'Monitor store inventory released for production.', color: '#10b981' },
      { id: 'floor', title: 'Production Floor Report', icon: Wrench, desc: 'Real-time metrics for ongoing floor operations.', color: '#6366f1' },
      { id: 'completed', title: 'Completed Orders Report', icon: ClipboardCheck, desc: 'Historical data on successfully completed orders.', color: '#14b8a6' },
      { id: 'qc-failed', title: 'QC Failed & Reproduction', icon: RefreshCw, desc: 'Analyze quality failure rates and rework cycles.', color: '#ef4444' },
      { id: 'testing', title: 'Testing Reports', icon: Activity, desc: 'Detailed analytics on production testing phases.', color: '#0ea5e9' },
      { id: 'finished-goods', title: 'Finished Goods Report', icon: Package, desc: 'Inventory analytics for finished production goods.', color: '#f97316' },
      { id: 'qc-pending', title: 'Pending Inspections', icon: Clock, desc: 'Track bottlenecks in the Quality Control queue.', color: '#eab308' }
    ];

    const [showDetailedReports, setShowDetailedReports] = useState(false);

    if (!globalSummary || !globalSummary.kpis) {
      return <div style={{ padding: '24px', color: '#fff' }}>Loading dashboard data...</div>;
    }

    const { summary, kpis, charts, recentWorkOrders } = globalSummary;
    const COLORS = ['#4ade80', '#38bdf8', '#facc15', '#f87171', '#c084fc'];

    const kpiCards = [
      { title: 'Total Work Orders', value: kpis.workOrders.total, onClick: () => navigate.push('/production/work-orders'), color: '#3b82f6' },
      { title: 'Active Jobs', value: kpis.workOrders.active, onClick: () => navigate.push('/production/floor'), color: '#38bdf8' },
      { title: 'Completed', value: kpis.workOrders.completed, onClick: () => navigate.push('/production/completed'), color: '#4ade80' },
      { title: 'QC Pending', value: kpis.qc.pending, onClick: () => navigate.push('/production/qc-pending'), color: '#facc15' },
      { title: 'Dispatch Ready', value: kpis.logistics.readyForDispatch, onClick: () => navigate.push('/production/finished-goods'), color: '#a855f7' },
      { title: 'Incoming Orders', value: kpis.incomingOrders.pending, onClick: () => navigate.push('/production/incoming-orders'), color: '#8b5cf6' },
      { title: 'Rework / Failed', value: kpis.qc.failed, onClick: () => navigate.push('/production/qc-failed'), color: '#f87171' },
      { title: 'Material Requests', value: kpis.materialRequests.total, onClick: () => navigate.push('/production/material-requests'), color: '#f59e0b' }
    ];

    const handleExportProductionReportCSV = () => {
      if (!recentWorkOrders || recentWorkOrders.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No Data to Export',
          text: 'There are no work orders to export in the production report.',
          confirmButtonColor: '#0284c7'
        });
        return;
      }

      const headers = [
        'Work Order No',
        'Product Name',
        'Status',
        'QC Result',
        'Target Quantity',
        'Quantity Produced',
        'Created Date'
      ];

      const csvRows = recentWorkOrders.map(wo => [
        `"${wo.workOrderNumber || wo.id || ''}"`,
        `"${(wo.salesOrderItem?.product?.name || wo.productName || 'N/A').replace(/"/g, '""')}"`,
        `"${wo.productionStatus || wo.status || ''}"`,
        `"${wo.qcResult || 'Pending'}"`,
        wo.targetQuantity || wo.quantity || 0,
        wo.quantityProduced || wo.producedQty || 0,
        `"${new Date(wo.createdAt).toLocaleDateString('en-GB')}"`
      ].join(','));

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...csvRows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Production_Comprehensive_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="module-content">
        <div className="module-header-row" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="module-title" style={{ fontSize: '24px', color: 'var(--color-text-primary)', margin: 0 }}>Comprehensive Production Dashboard</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '6px', margin: '6px 0 0 0' }}>Real-time aggregated view of manufacturing, QC, and dispatch.</p>
          </div>
          <button
            type="button"
            onClick={handleExportProductionReportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        {/* Top Row: KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {kpiCards.map((kpi, idx) => (
            <div key={idx} onClick={kpi.onClick} style={{
              background: 'linear-gradient(135deg, var(--color-bg-card) 0%, rgba(30,41,59,0.5) 100%)',
              border: `1px solid ${kpi.color}30`,
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = kpi.color; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = `${kpi.color}30`; }}
            >
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '8px' }}>{kpi.title}</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Middle Row: Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ background: 'var(--color-bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--color-text-primary)' }}>Production Status Distribution</h3>
            <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <PieChart width={300} height={300}>
                  <Pie 
                    data={charts.productionStatus?.some(d => d.value > 0) ? charts.productionStatus : [{ name: 'No Data', value: 1 }]} 
                    cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                  >
                    {(charts.productionStatus?.some(d => d.value > 0) ? charts.productionStatus : [{ name: 'No Data', value: 1 }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'No Data' ? '#334155' : COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  {charts.productionStatus?.some(d => d.value > 0) && <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />}
                  <Legend />
                </PieChart>
            </div>
          </div>

          <div style={{ background: 'var(--color-bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--color-text-primary)' }}>Daily Production Trend (7 Days)</h3>
            <div style={{ height: '300px', width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
                <BarChart width={400} height={300} data={charts.dailyTrend || []}>
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" fill="#4ade80" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="active" name="Active" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
            </div>
          </div>

          <div style={{ background: 'var(--color-bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--color-text-primary)' }}>QC Pass vs Fail</h3>
            <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <PieChart width={300} height={300}>
                  <Pie 
                    data={charts.qcStatus?.some(d => d.value > 0) ? charts.qcStatus : [{ name: 'No Data', value: 1 }]} 
                    cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                  >
                    {(charts.qcStatus?.some(d => d.value > 0) ? charts.qcStatus : [{ name: 'No Data', value: 1 }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'No Data' ? '#334155' : (entry.name === 'Failed' ? '#f87171' : '#4ade80')} />
                    ))}
                  </Pie>
                  {charts.qcStatus?.some(d => d.value > 0) && <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />}
                  <Legend />
                </PieChart>
            </div>
          </div>
        </div>

        {/* Bottom Row: Recent Work Orders Table */}
        <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '32px' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--color-text-primary)' }}>Recent Work Orders</h3>
            <button onClick={() => navigate.push('/production/work-orders')} style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: '600' }}>View All →</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '13px' }}>Work Order #</th>
                  <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '13px' }}>Product</th>
                  <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '13px' }}>Status</th>
                  <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '13px' }}>QC Result</th>
                  <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '13px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentWorkOrders.map((wo, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '16px 24px', color: '#fff', fontWeight: '500' }}>{wo.workOrderNumber}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }}>{wo.salesOrderItem?.product?.name || 'N/A'}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <StatusBadge status={wo.productionStatus} />
                    </td>
                    <td style={{ padding: '16px 24px', color: wo.qcResult === 'PASS' ? '#4ade80' : wo.qcResult === 'FAIL' ? '#f87171' : '#94a3b8' }}>
                      {wo.qcResult || 'Pending'}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }}>
                      {new Date(wo.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentWorkOrders.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No recent work orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Very Bottom: Collapsible Detailed Reports */}
        <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
          <div 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setShowDetailedReports(!showDetailedReports)}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--color-text-primary)' }}>Detailed Reports Archive</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Access legacy detailed report grids and modules.</p>
            </div>
            <button style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
              {showDetailedReports ? 'Hide Reports' : 'Show Reports'}
            </button>
          </div>
          
          {showDetailedReports && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginTop: '24px' }}>
              {reportCategories.map(cat => {
                const Icon = cat.icon;
                return (
                  <div key={cat.id} onClick={() => navigate.push(`/production/${cat.id}`)} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.background = `${cat.color}10`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-primary)' }}>{cat.title}</h4>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMachinePerformancePage = () => {
    const filteredStatuses = machineStatuses.filter((m) => {
      const term = machineSearch.toLowerCase();
      return (
        m.machineId.toLowerCase().includes(term) ||
        m.machineName.toLowerCase().includes(term) ||
        m.machineType.toLowerCase().includes(term) ||
        (m.location && m.location.toLowerCase().includes(term))
      );
    });

    const formatDateDDMMYYYY = (dateStr) => {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#24345C', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={22} color="#8b5cf6" /> Machine Performance & Daily Log
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#5E6B82' }}>Configure the factory machine directory and record daily operations status</p>
          </div>
          <button
            onClick={() => setShowAddMachineModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #2F4375 0%, #3BAEEB 100%)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(47,67,117,0.15)',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center'
            }}
          >
            <Plus size={16} /> Add Machine
          </button>
        </div>

        {/* Single unified card table */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: isMobile ? '12px' : '20px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', width: isMobile ? '100%' : '320px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8893A7' }} />
              <input
                type="text"
                placeholder="Search by ID, Name or Type..."
                value={machineSearch}
                onChange={(e) => setMachineSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: '8px',
                  border: '1px solid #DCE5F0',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            {/* Date Picker & Refresh */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
              <input
                type="date"
                value={machineStatusesDate}
                onChange={(e) => setMachineStatusesDate(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #DCE5F0',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  outline: 'none',
                  flex: isMobile ? 1 : 'none'
                }}
              />
              <button
                type="button"
                onClick={() => fetchMachineStatuses(machineStatusesDate)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #DCE5F0',
                  background: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Refresh Statuses"
              >
                <RefreshCw size={14} color="#5E6B82" />
              </button>
            </div>
          </div>

          <div style={{ minHeight: '260px' }}>
            {loadingStatuses ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', fontSize: '13px', color: '#8893A7' }}>⏳ Loading daily statuses...</div>
            ) : filteredStatuses.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', fontSize: '13px', color: '#8893A7' }}>No machines found matching search.</div>
            ) : isMobile ? (
              /* Responsive Mobile Cards */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredStatuses.map((m) => {
                  const isUse = m.status === 'USE';
                  const isNotUse = m.status === 'NOT_USE';
                  return (
                    <div key={m.id} style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '14px', color: '#8b5cf6', fontFamily: 'monospace' }}>{m.machineId}</div>
                          <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a', marginTop: '2px' }}>{m.machineName}</div>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 6px', borderRadius: '8px', background: '#f1f5f9', color: '#475569' }}>
                          {m.machineType}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '2px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#8893A7', fontWeight: '800' }}>Location</span>
                          <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>{m.location || '—'}</span>
                        </div>

                        <div style={{ display: 'inline-flex', background: '#F5FAFE', padding: '3px', borderRadius: '8px', border: '1px solid #DCE5F0', gap: '3px' }}>
                          <button
                            type="button"
                            onClick={() => updateLocalStatus(m.id, 'USE')}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: isUse ? '#ffffff' : 'transparent',
                              color: isUse ? '#10b981' : '#64748b',
                              boxShadow: isUse ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                              transition: 'all 0.15s'
                            }}
                          >
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isUse ? '#10b981' : '#64748b' }} />
                            Use
                          </button>

                          <button
                            type="button"
                            onClick={() => updateLocalStatus(m.id, 'NOT_USE')}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: isNotUse ? '#ffffff' : 'transparent',
                              color: isNotUse ? '#ef4444' : '#64748b',
                              boxShadow: isNotUse ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                              transition: 'all 0.15s'
                            }}
                          >
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isNotUse ? '#ef4444' : '#64748b' }} />
                            Not Use
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Desktop Table View */
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 10px' }}>Machine ID</th>
                      <th style={{ padding: '12px 10px' }}>Machine Name</th>
                      <th style={{ padding: '12px 10px' }}>Type</th>
                      <th style={{ padding: '12px 10px' }}>Location</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center' }}>Daily Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStatuses.map((m) => {
                      const isUse = m.status === 'USE';
                      const isNotUse = m.status === 'NOT_USE';

                      return (
                        <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 10px', fontWeight: '800', fontFamily: 'monospace', color: '#8b5cf6' }}>{m.machineId}</td>
                          <td style={{ padding: '12px 10px', fontWeight: '700', color: '#0f172a' }}>{m.machineName}</td>
                          <td style={{ padding: '12px 10px', color: '#475569' }}>{m.machineType}</td>
                          <td style={{ padding: '12px 10px', color: '#64748b' }}>{m.location || '—'}</td>
                          <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', background: '#F5FAFE', padding: '4px', borderRadius: '10px', border: '1px solid #DCE5F0', gap: '4px' }}>
                              
                              <button
                                type="button"
                                onClick={() => updateLocalStatus(m.id, 'USE')}
                                style={{
                                  padding: '6px 16px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  background: isUse ? '#ffffff' : 'transparent',
                                  color: isUse ? '#10b981' : '#64748b',
                                  boxShadow: isUse ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                  transition: 'all 0.15s'
                                }}
                              >
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isUse ? '#10b981' : '#64748b' }} />
                                Use
                              </button>

                              <button
                                type="button"
                                onClick={() => updateLocalStatus(m.id, 'NOT_USE')}
                                style={{
                                  padding: '6px 16px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  background: isNotUse ? '#ffffff' : 'transparent',
                                  color: isNotUse ? '#ef4444' : '#64748b',
                                  boxShadow: isNotUse ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                  transition: 'all 0.15s'
                                }}
                              >
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isNotUse ? '#ef4444' : '#64748b' }} />
                                Not Use
                              </button>

                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleSaveStatusesSubmit}
              disabled={savingStatuses || machineStatuses.length === 0}
              style={{
                padding: '11px 24px',
                borderRadius: '10px',
                border: 'none',
                background: savingStatuses ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '800',
                cursor: savingStatuses || machineStatuses.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 10px rgba(16,185,129,0.15)',
                transition: 'all 0.15s',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              {savingStatuses ? '⏳ Saving Log...' : '✓ Save Daily Status'}
            </button>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="production-portal-root">
      {view === 'dashboard' && renderDashboard()}
      {view === 'work-orders' && renderActiveWorkOrders()}
      {view === 'incoming-orders' && renderIncomingOrders()}
      {/* Material Workflow Step 1: Create */}
      {view === 'material-requests-create' && <ProductionMaterialCreateView />}
      {/* Material Workflow Step 2 & 9: List, Submit, History */}
      {view === 'material-requests' && <ProductionMaterialRequestsView />}
      {/* Material Workflow Step 5: Receipt Confirmation */}
      {view === 'material-receipts' && <ProductionMaterialReceiptsView />}
      {/* Material Workflow Step 6: Consumption (production-work also maps here for new MR flow) */}
      {view === 'material-consumption' && <ProductionMaterialConsumptionView />}
      {/* Material Workflow Step 7: Return Unused Materials */}
      {view === 'material-returns' && <ProductionMaterialReturnsView />}
      {/* Legacy production-work and store-releases */}
      {view === 'store-releases' && <ProductionStoreReleasesView />}
      {view === 'production-work' && renderProductionWork()}
      {view === 'completed' && renderCompletedWorkOrders()}
      {view === 'reports' && <ProductionReportsView />}

      {view === 'rework' && renderRework()}
      {view === 'testing' && renderTesting()}
      {view === 'finished-goods' && renderFinishedGoods()}
      {view === 'machines' && renderMachinePerformancePage()}

      {/* QC & Operations Routes */}
      {view === 'qc-pending' && <QCPendingView />}
      {view === 'floor' && renderProductionWork()}
      {view === 'qc-failed' && renderRework()}
      {view === 'profile' && <MyProfileView />}

      {/* Daily Production Report Module Routes */}
      {view === 'daily-report-entry' && (
        <DailyReportEntryView
          reportId={searchParams.get('edit') || null}
          onNavigateToHistory={() => navigate.push('/production/daily-report/history')}
          onNavigateToPrint={(id) => navigate.push(`/production/daily-report/${id}`)}
        />
      )}

      {view === 'daily-report-history' && (
        <DailyReportHistoryView
          onNewReport={() => navigate.push('/production/daily-report')}
          onEditReport={(id) => navigate.push(`/production/daily-report?edit=${id}`)}
          onViewReport={(id) => navigate.push(`/production/daily-report/${id}`)}
        />
      )}

      {view === 'daily-report-view' && (
        <DailyReportPrintView
          reportId={params?.slug?.[1] || (pathname ? pathname.split('/daily-report/')[1] : null)}
          onBack={() => navigate.push('/production/daily-report/history')}
        />
      )}



      {/* ── Request Raw Materials Modal ── */}
      {showRequestModal && selectedWOForRequest && (
        <div className="modal-overlay active" onClick={() => setShowRequestModal(false)} style={{ zIndex: 10000 }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 'min(94vw, 560px)', maxHeight: '90vh', padding: 0, overflowY: 'auto', borderRadius: '16px', border: '1px solid #DCE5F0' }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#24345C', margin: 0 }}>Material Request for: {selectedWOForRequest.id}</h3>
                <p style={{ fontSize: '11px', color: '#8893A7', margin: '2px 0 0 0' }}>Linked Order Reference: <strong>{selectedWOForRequest.orderNo}</strong></p>
              </div>
              <button onClick={() => setShowRequestModal(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #DCE5F0', background: '#F5FAFE', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleRaiseRequestSubmit}>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto' }}>
                {materialRows.map((row, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 36px', gap: '8px', alignItems: 'center' }}>
                    <select value={row.material} onChange={(e) => updateMaterialRow(idx, 'material', e.target.value)} className="form-select" style={{ margin: 0, fontSize: '13px', color: '#000', fontWeight: 'bold' }}>
                      {rawInventory.map(item => (<option key={item.material} value={item.material}>{item.material} ({item.stock} {item.unit} available)</option>))}
                    </select>
                    <div style={{ position: 'relative' }}>
                      <input type="number" step="0.01" className="form-input" style={{ margin: 0, fontSize: '14px', color: '#000', fontWeight: 'bold', paddingRight: '20px' }} value={row.qty} onChange={(e) => updateMaterialRow(idx, 'qty', e.target.value)} />
                      <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: 'bold', color: '#5E6B82' }}>T</span>
                    </div>
                    {materialRows.length > 1 ? (
                      <button type="button" onClick={() => removeMaterialRow(idx)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff1f2', border: '1px solid #fecdd3', color: '#f43f5e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
                    ) : <div />}
                  </div>
                ))}
              </div>

              <div style={{ padding: '0 24px 16px' }}>
                <button type="button" onClick={addMaterialRow} style={{ width: '100%', background: 'transparent', border: '1.5px dashed #D6E2F0', borderRadius: '10px', color: '#5E6B82', padding: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                  + Add Item Line
                </button>
              </div>

              <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowRequestModal(false)} style={{ padding: '11px 20px', borderRadius: '10px', border: '1.5px solid #DCE5F0', background: '#fff', color: '#5E6B82', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '11px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #2F4375 0%, #3BAEEB 100%)', color: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  ✓ Submit Material Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedOrderDetails && (
        <OrderDetailsModal
          order={selectedOrderDetails}
          role="production"
          onClose={() => setSelectedOrderDetails(null)}
        />
      )}

      {/* ── Complete Production Modal ── */}
      {completeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 60px rgba(15,23,42,0.22)', overflow: 'hidden', margin: '16px' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#24345C' }}>✅ Complete Production</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#5E6B82' }}>Work Order: <strong>{completeModal.wo.id}</strong> — {completeModal.wo.productName}</p>
              </div>
              <button type="button" onClick={() => setCompleteModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8893A7', padding: '4px' }}><X size={18} /></button>
            </div>
            {/* Body */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Quantity Produced *</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter produced quantity"
                  value={completionData.quantity_produced}
                  onChange={e => setCompletionData(p => ({ ...p, quantity_produced: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #DCE5F0', fontSize: '14px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Batch Number *</label>
                <input
                  type="text"
                  placeholder="e.g. BATCH-240701"
                  value={completionData.batch_no}
                  onChange={e => setCompletionData(p => ({ ...p, batch_no: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #DCE5F0', fontSize: '14px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Completion Notes <span style={{ fontWeight: '400', color: '#8893A7' }}>(optional)</span></label>
                <textarea
                  placeholder="Any remarks about this batch..."
                  value={completionData.notes}
                  onChange={e => setCompletionData(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #DCE5F0', fontSize: '13.5px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '10px', padding: '10px 14px', fontSize: '12.5px', color: '#065f46' }}>
                ℹ️ Completing this work order will send the batch to <strong>QC Inspection</strong>.
              </div>
            </div>
            {/* Footer */}
            <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setCompleteModal(null)} disabled={isCompleting} style={{ padding: '11px 20px', borderRadius: '10px', border: '1.5px solid #DCE5F0', background: '#fff', color: '#5E6B82', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleSubmitCompletion} disabled={isCompleting} style={{ flex: 1, padding: '11px 20px', borderRadius: '10px', border: 'none', background: isCompleting ? '#86efac' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: isCompleting ? 'not-allowed' : 'pointer' }}>
                {isCompleting ? '⏳ Completing...' : '✅ Complete & Send to QC'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Machine Modal ── */}
      {showAddMachineModal && (
        <div className="modal-overlay active" style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div className="modal-box" style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: 'min(94vw, 440px)', maxHeight: '90vh', boxShadow: '0 24px 60px rgba(15,23,42,0.22)', overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#24345C' }}>⚙️ Add New Machine</h3>
              <button type="button" onClick={() => setShowAddMachineModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8893A7' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Machine ID *</label>
                <input
                  type="text"
                  placeholder="e.g. HM007"
                  value={addMachineForm.machineId}
                  onChange={e => setAddMachineForm(p => ({ ...p, machineId: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #DCE5F0', fontSize: '13.5px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Machine Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Hydraulic Machine 7"
                  value={addMachineForm.machineName}
                  onChange={e => setAddMachineForm(p => ({ ...p, machineName: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #DCE5F0', fontSize: '13.5px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Machine Type *</label>
                <input
                  type="text"
                  placeholder="e.g. Hydraulic Press"
                  value={addMachineForm.machineType}
                  onChange={e => setAddMachineForm(p => ({ ...p, machineType: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #DCE5F0', fontSize: '13.5px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Serial Number <span style={{ fontWeight: '400', color: '#8893A7' }}>(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. SN-88231"
                  value={addMachineForm.serialNumber}
                  onChange={e => setAddMachineForm(p => ({ ...p, serialNumber: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #DCE5F0', fontSize: '13.5px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Location <span style={{ fontWeight: '400', color: '#8893A7' }}>(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. Section C"
                  value={addMachineForm.location}
                  onChange={e => setAddMachineForm(p => ({ ...p, location: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #DCE5F0', fontSize: '13.5px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setShowAddMachineModal(false)} style={{ flex: 1, padding: '10px 20px', borderRadius: '8px', border: '1.5px solid #DCE5F0', background: '#fff', color: '#5E6B82', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleAddMachineSubmit} style={{ flex: 1, padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #2F4375 0%, #3BAEEB 100%)', color: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                Save Machine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

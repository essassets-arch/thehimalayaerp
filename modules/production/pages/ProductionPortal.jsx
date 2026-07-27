'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useRouter, usePathname, useParams, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { useERP } from '../../../shared/context/ERPContext';
import { useERPStore } from '@/store/erpStore';
import { STATUS } from '../../../shared/constants';
import { useAuth } from '../../../shared/context/AuthContext';
import { productionService } from '../../../services/production.service';
import { useMaterialRequestStore } from '../../../store/materialRequestStore';
import { getProductionWorkOrders } from '../utils/getProductionWorkOrders';
import { selectProductionIncomingOrders, selectProductionWorkOrders } from '../../../store/domains/sales/salesSelectors';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import OrderDetailsModal from '../../../shared/components/OrderDetailsModal';
import { Play, CheckCircle2, PlusCircle, PackagePlus, X, CheckCircle, Clock, AlertCircle, Trash2, Layers, Grid, Box, Boxes, Wrench, Settings, Hammer, Activity, CircleDot, Search, Plus, ArrowLeft, Cpu, Pause, User, Truck, PackageCheck, RefreshCw, ShieldAlert, Printer, Edit, Eye, Package, ClipboardList, ClipboardCheck } from 'lucide-react';
// BOM_MASTER removed (using dynamic database lookup)
import ProductionMaterialCreateView from '../../../components/material-workflow/ProductionMaterialCreateView';
import ProductionStoreReleasesView from '../../../components/material-workflow/ProductionStoreReleasesView';
import ProductionMaterialRequestsView from '../../../components/material-workflow/ProductionMaterialRequestsView';
import ProductionMaterialReceiptsView from '../../../components/material-workflow/ProductionMaterialReceiptsView';
import ProductionMaterialConsumptionView from '../../../components/material-workflow/ProductionMaterialConsumptionView';
import ProductionMaterialReturnsView from '../../../components/material-workflow/ProductionMaterialReturnsView';
import QCDashboardView from '../components/qc/QCDashboardView';
import QCPendingView from '../components/qc/QCPendingView';
import QCHistoryView from '../components/qc/QCHistoryView';
import FinishedGoodsView from '../components/FinishedGoodsView';
import ProductionOperationsDashboard from '../../../components/ProductionOperationsDashboard';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from 'recharts';

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
      if (isRunning && wo.lastStartedAt) {
        const timeDiff = Date.now() - wo.lastStartedAt;
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
  }, [isRunning, wo.accumulatedTime, wo.lastStartedAt]);

  const formatDuration = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isOverdue = todayStr > (wo.targetDate || '');

  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* SECTION 1: Identity & Badge */}
      <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
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
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>{wo.productName}</h3>
          <div style={{ display: 'flex', gap: '12px', fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '4px', flexWrap: 'wrap' }}>
            <span>Customer: <strong style={{ color: 'var(--color-text-primary)' }}>{customerName}</strong></span>
            <span>Produced: <strong style={{ color: 'var(--color-text-primary)' }}>{producedQty}/{totalQty} Tons</strong></span>
            <span>Target: <strong style={{ color: 'var(--color-text-primary)' }}>{resolvedTarget}</strong></span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Duration Clock */}
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
        {/* Running Time Box */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: isRunning ? 'rgba(16, 185, 129, 0.04)' : 'rgba(245, 158, 11, 0.04)',
          border: isRunning ? '1px solid rgba(16, 185, 129, 0.12)' : '1px solid rgba(245, 158, 11, 0.12)',
          padding: '8px 16px',
          borderRadius: '10px',
          height: '54px',
          minWidth: '110px'
        }}>
          <span style={{ fontSize: '10px', color: '#5E6B82', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={10} style={{ color: isRunning ? '#10b981' : '#f59e0b' }} />
            Duration
          </span>
          <strong style={{
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '14.5px',
            color: isRunning ? '#059669' : '#d97706',
            fontWeight: '800',
            letterSpacing: '0.5px',
            marginTop: '2px'
          }}>
            {formatDuration(elapsed)} ⏱
          </strong>
        </div>
      </div>

      {/* SECTION 3: Controls */}
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', minWidth: 'auto' }}>

        {/* Buttons Controls */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {wo.status === STATUS.PAUSED ? (
            <button
              type="button"
              onClick={() => onResume(wo)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                background: 'linear-gradient(135deg, #1e293b 0%, #24345C 100%)',
                color: 'var(--color-lime-brand)',
                border: 'none',
                padding: '10px 14px',
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
                display: 'flex',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 14px',
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
  if (view === 'production') view = 'dashboard';

  const navigate = useRouter();
  const searchParams = useSearchParams(); const setSearchParams = (params) => { const url = new URL(window.location.href); Object.keys(params).forEach(k => { if (params[k]) url.searchParams.set(k, params[k]); else url.searchParams.delete(k); }); window.history.replaceState({}, '', url); };
  const woIdParam = searchParams.get('woId');

  const { state, dispatch, syncData } = useERP();
  const workflowMaterialRequests = useMaterialRequestStore(s => s.materialRequests);
  const { user } = useAuth();
  const showToast = useNotificationStore(s => s.showToast);
  const globalSearch = useSearchStore(s => s.globalSearch);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedWOForRequest, setSelectedWOForRequest] = useState(null);
  const [materialRows, setMaterialRows] = useState([]);
  const [activeTab, setActiveTab] = useState('Planned');
  const [woFilter, setWoFilter] = useState('Current');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [mrTab, setMrTab] = useState(searchParams.get('tab') === 'history' ? 'Past' : 'Raise');

  useEffect(() => {
    setMrTab(searchParams.get('tab') === 'history' ? 'Past' : 'Raise');
  }, [searchParams]);
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
  const [testingEntries, setTestingEntries] = useState([]);
  const [rejectionEntries, setRejectionEntries] = useState([]);

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

  useEffect(() => {
    syncData();
    if (view === 'dashboard') {
      fetchStats();
    } else if (view === 'testing') {
      fetchTesting();
    } else if (view === 'rejection') {
      fetchRejections();
    }
  }, [view, syncData]);

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
  const orders = useMemo(() => {
    const combinedState = {
      ...state,
      sales: {
        ...(state.sales || {}),
        orders: storeOrders
      }
    };
    return selectProductionWorkOrders(combinedState).map((order) => {
      const quotationRef = order.quotationId;
      const sourceQuotation = (state.sales?.quotations || []).find((q) => q.id === quotationRef);
      return normalizeProductionOrder(order, sourceQuotation);
    });
  }, [state, storeOrders]);
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
        orderNo: o.orderNo || o.id,
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
        orderNo: wo.orderId || wo.orderNo || '',
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
          orderNo: existing.orderId || existing.orderNo || wo.orderNo,
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
    return Array.from(mergedWOsMap.values());
  }, [orders, storeWorkOrders]);
  const mRequests = state.materialRequests || [];
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
      { material: 'Sand Fine Grade', quantityPerUnit: 0.4 },
      { material: 'Fly Ash Grade A', quantityPerUnit: 0.6 }
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
    const firstAvailable = rawInventory[0]?.material || 'Cement';
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

    const derivedStats = {
      todayProduction,
      monthProduction: todayProduction * 8,
      underTesting,
      passedQty,
      rejectedQty,
      finishedGoods,
      testingSuccess,
      testingFailure,
      productionEfficiency: '97.2'
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

    // Machine OEE data
    const machineOEEData = [
      { name: 'Mixer-1', OEE: 85 },
      { name: 'Mixer-2', OEE: 82 },
      { name: 'Extruder-1', OEE: 91 },
      { name: 'Kiln-3', OEE: 79 },
      { name: 'Assy Alpha', OEE: 88 }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Navigation Menu Cards Grid */}
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 12px 0', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Production Department Workflows</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '8px' }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Grid, path: '/production/dashboard', color: '#3b82f6' },
              { id: 'work-orders', label: 'Work Orders', icon: ClipboardList, path: '/production/work-orders', color: '#10b981' },
              { id: 'incoming-orders', label: 'Incoming Orders', icon: Box, path: '/production/incoming-orders', color: '#f59e0b' },
              { id: 'material-requests', label: 'Material Requests', icon: Layers, path: '/production/material-requests', color: '#8b5cf6' },
              { id: 'store-releases', label: 'Store Releases', icon: PackageCheck, path: '/production/store-releases', color: '#06b6d4' },
              { id: 'production-work', label: 'Production Floor', icon: Wrench, path: '/production/production-work', color: '#ec4899' },
              { id: 'completed', label: 'Completed', icon: CheckCircle2, path: '/production/completed', color: '#14b8a6' },
              { id: 'rework', label: 'QC Failed & Reprod.', icon: RefreshCw, path: '/production/rework', color: '#ef4444' },
              { id: 'testing', label: 'Testing', icon: Clock, path: '/production/testing', color: '#6366f1', badge: derivedStats.underTesting ? `${derivedStats.underTesting} units` : '0 units' }
            ].map(menuItem => {
              const Icon = menuItem.icon;
              const isActive = view === menuItem.id || (menuItem.id === 'dashboard' && view === 'dashboard');
              return (
                <div
                  key={menuItem.id}
                  onClick={() => navigate.push(menuItem.path)}
                  className="app-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    cursor: 'pointer',
                    padding: '16px',
                    borderRadius: '12px',
                    border: isActive ? `2px solid ${menuItem.color}` : '1px solid var(--color-border)',
                    background: isActive ? 'var(--color-bg-secondary, rgba(255,255,255,0.05))' : '#ffffff',
                    boxShadow: 'var(--shadow-soft)',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = menuItem.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = isActive ? menuItem.color : 'var(--color-border)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ background: `${menuItem.color}15`, color: menuItem.color, padding: '8px', borderRadius: '8px' }}>
                      <Icon size={18} />
                    </div>
                    {menuItem.badge && (
                      <span className="badge" style={{ background: `${menuItem.color}15`, color: menuItem.color, fontSize: '11px', fontWeight: '800', padding: '2px 6px', borderRadius: '6px' }}>
                        {menuItem.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{menuItem.label}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <ProductionOperationsDashboard
          workOrders={workOrders}
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

        <hr style={{ border: 0, borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />

        {/* Production Dashboard Statistics Cards */}
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 12px 0', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Factory Performance & Inventory Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '8px' }}>
            {[
              { label: "Total Orders", value: totalWOs, desc: "Total work orders", theme: "border-left-blue" },
              { label: "In Production", value: runningWOs, desc: "Orders in progress", theme: "border-left-amber" },
              { label: "Completed", value: completedWOs, desc: "Finished orders", theme: "border-left-emerald" },
              { label: "Pending", value: (totalWOs - runningWOs - completedWOs), desc: "Orders waiting to start", theme: "border-left-red" },
              { label: "Today's Production", value: `${derivedStats.todayProduction || 0} units`, desc: "Produced today", theme: "border-left-blue" },
              { label: "Production This Month", value: `${derivedStats.monthProduction || 0} units`, desc: "Produced this month", theme: "border-left-teal" },
              { label: "Items Under Testing", value: `${derivedStats.underTesting || 0} units`, desc: "Currently under quality test", theme: "border-left-amber" },
              { label: "Passed Qty", value: `${derivedStats.passedQty || 0} units`, desc: "Cleared by testing today", theme: "border-left-emerald" },
              { label: "Rejected Qty", value: `${derivedStats.rejectedQty || 0} units`, desc: "Failed testing today", theme: "border-left-red" },
              { label: "Finished Goods Stock", value: `${derivedStats.finishedGoods || 0} units`, desc: "Finished goods in warehouse", theme: "border-left-blue" },
              { label: "Testing Success %", value: `${derivedStats.testingSuccess || 0}%`, desc: `Failure rate: ${derivedStats.testingFailure || 0}%`, theme: "border-left-emerald" },
              { label: "Rejection %", value: `${derivedStats.testingFailure || 0}%`, desc: "Percentage of rejected items", theme: "border-left-red" },
              { label: "Production Efficiency", value: `${derivedStats.productionEfficiency || 0}%`, desc: "Clearing rate vs output", theme: "border-left-emerald" }
            ].map((stat, i) => (
              <div key={i} className={`app-card ${stat.theme}`} style={{ padding: '16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</span>
                <h3 style={{ margin: '6px 0 2px 0', fontSize: '22px', fontWeight: '900' }}>{stat.value}</h3>
                <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <hr style={{ border: 0, borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />

        {/* Observability & Decision grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

          {/* Machine OEE Monitor */}
          <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="card-heading" style={{ margin: 0 }}>OEE Performance Monitor</h2>
              <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Live OEE</span>
            </div>

            <div style={{ width: '100%', height: '180px', marginTop: '10px' }}>
              {isMounted && (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={machineOEEData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#5E6B82" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#5E6B82" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#24345C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ fontWeight: 'bold', color: '#8893A7' }}
                    />
                    <Bar dataKey="OEE" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                      {machineOEEData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.OEE >= 85 ? '#10b981' : (entry.OEE >= 80 ? '#3b82f6' : '#eab308')} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8893A7', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
              <span>Availability: <strong>92.5%</strong></span>
              <span>Efficiency: <strong>94.2%</strong></span>
              <span>Quality Yield: <strong>99.1%</strong></span>
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

  // ── 2. Incoming Orders ──
  const renderIncomingOrders = () => {
    // Show orders approved by Plant Head waiting to be activated into Work Orders
    const planned = orders;
    return (
      <div className="app-card">
        <div className="card-top-bar"><h2 className="card-heading">Incoming Production Orders</h2></div>
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
            { header: 'Customer', accessor: 'customerName', render: (row) => row.customerName || row.companyName || row.customer?.name || 'N/A' },
            { header: 'Product Item', accessor: 'productInterested', render: (row) => row.productInterested || row.products || (row.detailedItems && row.detailedItems.map(i => i.productName).join(', ')) || 'Various' },
            { header: 'Quantity Needed', accessor: 'estimatedQuantity', render: (row) => `${row.estimatedQuantity || row.quantity || row.totalQuantity || 0} Units` },
            { header: 'Target Date', accessor: 'targetDate', render: (row) => row.targetDate ? new Date(row.targetDate).toLocaleDateString('en-GB') : (row.deliveryDate || row.date || 'TBD') },
            { header: 'Stage', accessor: 'status', render: (row) => <StatusBadge status={row.workflowStatus || row.status} /> },
            { header: 'Priority', accessor: 'priority', render: (row) => <StatusBadge status={row.priority || 'High'} /> }
          ]}
          data={planned}
          searchQuery={globalSearch}
          searchField="customer.name"
          actions={(row) => {
            // Check if this order already has work orders
            const hasWO = workOrders.some(wo => wo.orderNo === row.orderNo && wo.status !== STATUS.PLANNED) && !row.isReproduction;
            const isActiveProduction = [STATUS.IN_PRODUCTION, STATUS.QC_PENDING, STATUS.QC_PASSED].includes(row.status);
            return (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn-small btn-primary-small"
                  style={{ margin: 0, padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => setSelectedOrderDetails(row)}
                >
                  View
                </button>
                {!hasWO && !isActiveProduction ? (
                  <button
                    className="action-btn"
                    style={{ margin: 0, background: 'var(--color-primary)', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => handleCreateWorkOrder(row)}
                  >
                    <Play size={12} fill="#000" /> Activate Work Order
                  </button>
                ) : (
                  <button
                    style={{ margin: 0, background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                    onClick={() => navigate.push('/production/work-orders')}
                  >
                    <CheckCircle2 size={12} /> Open Work Orders
                  </button>
                )}
              </div>
            );
          }}
          emptyMessage="No incoming orders from Plant Head yet. Orders planned by Plant Head will appear here."
        />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="tab-filters-row" style={{ background: '#DCE5F0', borderRadius: '10px', padding: '4px', display: 'flex', gap: '4px', width: 'fit-content' }}>
                {['All', 'REQUESTED', 'RETURNED_FOR_CORRECTION', 'ISSUED'].map(status => {
                  const count = status === 'All'
                    ? mRequests.filter(r => ['REQUESTED', 'RETURNED_FOR_CORRECTION', 'ISSUED'].includes(r.status)).length
                    : mRequests.filter(r => r.status === status).length;
                  return (
                    <button
                      key={status}
                      type="button"
                      className={`filter-pill ${mrStatusFilter === status ? 'active' : ''}`}
                      onClick={() => setMrStatusFilter(status)}
                      style={{ padding: '6px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12.5px', background: mrStatusFilter === status ? '#fff' : 'transparent', color: mrStatusFilter === status ? '#000' : '#475569', boxShadow: mrStatusFilter === status ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}
                    >
                      {status} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <DataTable
              columns={[
                { header: 'Request ID', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-text-primary)' }}>{row.id}</strong> },
                { header: 'Work Order ID', accessor: 'workOrderId', render: (row) => <strong style={{ color: 'var(--color-text-primary)' }}>{row.workOrderId}</strong> },
                {
                  header: 'Order Reference', accessor: 'orderNo', render: (row) => (
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
            { header: 'Work Order ID', accessor: 'workOrderId' },
            {
              header: 'Order Reference', accessor: 'orderNo', render: (row) => (
                <span
                  style={{ color: 'var(--color-text-primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                  onClick={() => navigate.push(`/orders/${row.orderNo}`)}
                >
                  {row.orderNo}
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

    return (
      <div className="app-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h2 className="card-heading" style={{ margin: 0 }}>Production Work Orders</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
            All manufacturing work orders (active, planned, and completed).
          </p>
        </div>

        <DataTable
          columns={[
            { header: 'Work Order ID', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.id}</strong> },
            { header: 'Order Ref', accessor: 'orderNo', render: (row) => <strong>{row.orderId || row.orderNo || 'Missing Order Link'}</strong> },
            { header: 'Product Item', accessor: 'productName', render: (row) => row.productName || 'Missing Product' },
            { header: 'Target Qty', accessor: 'quantity', render: (row) => `${Number(row.quantity || 0).toLocaleString()} ${row.unit || 'Pcs'}` },
            { header: 'Target Date', accessor: 'targetDate', render: (row) => row.targetDate ? new Date(row.targetDate).toLocaleDateString('en-GB') : (row.deliveryDate || row.date || 'TBD') },
            { header: 'Priority', accessor: 'priority', render: (row) => <StatusBadge status={row.priority} /> },
            { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> }
          ]}
          data={workOrders}
          searchQuery={globalSearch}
          searchField="productName"
          actions={(row) => (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
              {isInProduction(row.status) ? (
                <>
                  <button
                    className="btn-small btn-outline-small"
                    style={{ margin: 0, padding: '6px 12px', cursor: 'pointer' }}
                    onClick={() => handlePauseProduction(row)}
                  >
                    Pause
                  </button>
                  <button
                    className="btn-small btn-primary-small"
                    style={{ margin: 0, padding: '6px 12px', background: canCompleteWorkOrder(row) ? '#10b981' : '#8893A7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: canCompleteWorkOrder(row) ? 'pointer' : 'not-allowed', opacity: canCompleteWorkOrder(row) ? 1 : 0.7 }}
                    onClick={() => canCompleteWorkOrder(row) && handleCompleteProduction(row)}
                    disabled={!canCompleteWorkOrder(row)}
                    title={canCompleteWorkOrder(row) ? 'Complete production and send to QC' : 'Production cannot be completed until produced quantity, batch details, and production logs are recorded.'}
                  >
                    Complete Work
                  </button>
                </>
              ) : isCompletedOrQC(row.status) ? (
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                  {row.status === 'Completed' || row.status === STATUS.PRODUCTION_COMPLETED ? '✓ Finished' : row.status}
                </span>
              ) : (
                <button
                  className="btn-small btn-primary-small"
                  style={{ margin: 0, padding: '6px 12px', background: 'var(--color-primary)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => handleStartProduction(row)}
                >
                  {row.status === STATUS.PAUSED || row.status === 'PAUSED' ? 'Resume Work' : 'Start Work'}
                </button>
              )}
            </div>
          )}
          emptyMessage="No work orders found."
        />
      </div>
    );
  };

  const renderCompletedWorkOrders = () => {
    const completedWOs = workOrders.filter(wo =>
      ['Completed', STATUS.PRODUCTION_COMPLETED, 'PRODUCTION_COMPLETED', STATUS.QC_PENDING, 'QC_PENDING'].includes(wo.status || wo.workflowStatus)
    );

    return (
      <div className="app-card">
        <div className="card-top-bar">
          <h2 className="card-heading">Production Completed</h2>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
            Finished production batches waiting for internal testing.
          </p>
        </div>
        <DataTable
          columns={[
            { header: 'Work Order ID', accessor: 'id', render: (row) => <strong style={{ color: 'var(--color-primary)' }}>{row.id}</strong> },
            { 
              header: 'Customer', accessor: 'orderNo', render: (row) => {
                const orderRef = row.orderNo || row.order_no || row.orderId;
                const order = orders.find(o => String(o.orderNo) === String(orderRef) || String(o.id) === String(orderRef) || String(o.order_no) === String(orderRef));
                return order?.customerName || order?.customer?.name || order?.companyName || row?.customerName || row?.customer_name || '—';
              }
            },
            { header: 'Product Item', accessor: 'productName' },
            { header: 'Produced Qty', accessor: 'producedQty', render: (row) => `${(row.producedQty || row.quantity || 0).toLocaleString()} pcs` },
            { header: 'Status', accessor: 'status', render: () => <span className="badge" style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>Sent to QC</span> }
          ]}
          data={completedWOs}
          searchQuery={globalSearch}
          searchField="productName"
          actions={() => (
            <button
              className="btn-small btn-primary-small"
              style={{ margin: 0, padding: '6px 12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => navigate.push('/production/qc-pending')}
            >
              Open QC Queue
            </button>
          )}
          emptyMessage="No completed work orders waiting for testing."
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
          <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '240px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>Product / Material Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Cement Block, Gravel Batch 12..."
                value={testingItemName}
                onChange={(e) => setTestingItemName(e.target.value)}
                style={{ width: '100%', margin: 0 }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '8px', color: 'var(--color-text-secondary)' }}>Quantity (pcs)</label>
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
              style={{ padding: '12px 24px', height: '42px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary)', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
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
            { header: 'Work Order ID', accessor: 'workOrderId', render: (row) => <strong>{row.workOrderId}</strong> },
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
    return (
      <div className="module-content">
        <div className="module-header-row">
          <h2 className="module-title">Production Reports</h2>
        </div>
        <div className="app-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center' }}>
          <Activity size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Coming Soon</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', maxWidth: '400px', marginTop: '8px' }}>
            The detailed production analytics and reporting module is currently under development. Please check back later.
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
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
      {view === 'reports' && renderReports()}

      {view === 'rework' && renderRework()}
      {view === 'testing' && renderTesting()}
      {view === 'finished-goods' && renderFinishedGoods()}

      {/* QC & Operations Routes */}
      {view === 'qc-dashboard' && <QCDashboardView />}
      {view === 'qc-pending' && <QCPendingView />}
      {view === 'qc-history' && <QCHistoryView />}
      {view === 'floor' && renderProductionWork()}
      {view === 'qc-failed' && renderRework()}



      {/* ── Request Raw Materials Modal ── */}
      {showRequestModal && selectedWOForRequest && (
        <div className="modal-overlay active" onClick={() => setShowRequestModal(false)} style={{ zIndex: 10000 }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '560px', maxWidth: 'calc(100vw - 24px)', padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid #DCE5F0' }}>
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
    </>
  );
}

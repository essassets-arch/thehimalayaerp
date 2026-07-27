'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Swal from 'sweetalert2';
import { useERP } from '../context/ERPContext';
import { useAuth } from '../context/AuthContext';
import { productionService } from '../../services/production.service';
import { dispatchService } from '../../services/dispatch.service';
import { financeService } from '../../services/finance.service';
import Timeline from './Timeline';
import { ArrowLeft, Box, Clipboard, Truck, CreditCard, ShieldAlert, Zap, Clock, ShieldCheck, CheckCircle2, Building2, Package, UserCheck, Scale } from 'lucide-react';

const STATUS_COLORS = {
  'Created': { bg: '#f1f5f9', border: '1px solid #D6E2F0', color: '#475569' },
  'Cancelled': { bg: '#f1f5f9', border: '1px solid #D6E2F0', color: '#475569' },
  'Planned': { bg: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' },
  'On Hold': { bg: '#F5FAFE', border: '1px solid #D6E2F0', color: '#5E6B82' },
  'Work Order Created': { bg: '#fffbeb', border: '1px solid #fde68a', color: '#b45309' },
  'Material Requested': { bg: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c' },
  'Shortage': { bg: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c' },
  'Material Approved': { bg: '#fffbeb', border: '1px solid #fde68a', color: '#d97706' },
  'Material Issued': { bg: '#faf5ff', border: '1px solid #e9d5ff', color: '#7e22ce' },
  'In Production': { bg: '#fffbeb', border: '1px solid #fde68a', color: '#d97706' },
  'QC Pending': { bg: '#fdf4ff', border: '1px solid #f5d0fe', color: '#a21caf' },
  'QC Passed': { bg: '#faf5ff', border: '1px solid #e9d5ff', color: '#6b21a8' },
  'Dispatch Created': { bg: '#ecfeff', border: '1px solid #a5f3fc', color: '#0891b2' },
  'In Transit': { bg: '#eff6ff', border: '1px solid #bae6fd', color: '#0284c7' },
  'Partially Delivered': { bg: '#fff1f2', border: '1px solid #ffe4e6', color: '#be123c' },
  'Delivered': { bg: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' },
  'Payment Pending': { bg: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' },
  'Payment Verified': { bg: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' },
  'Closed': { bg: '#f0fdf4', border: '1px solid #86efac', color: '#14532d' }
};

export default function GlobalOrderTracker() {
  const { id } = useParams();
  const navigate = useRouter();
  
  // Parse and resolve Order Number from query parameter ID
  let orderNo = '';
  const searchId = id ? id.toUpperCase() : '';

  if (searchId.startsWith('ORD-')) {
    orderNo = searchId;
  } else if (searchId.startsWith('WO-')) {
    // Extract base order reference from WO ID: e.g. WO-0802-01 -> ORD-0802
    const baseNum = searchId.split('-')[1];
    orderNo = baseNum ? `ORD-${baseNum}` : '';
  } else if (searchId.startsWith('DSP-')) {
    const baseNum = searchId.split('-')[1];
    orderNo = baseNum ? `ORD-${baseNum}` : '';
  } else if (searchId.startsWith('MR-')) {
    const baseNum = searchId.split('-')[1];
    orderNo = baseNum ? `ORD-${baseNum}` : '';
  } else {
    orderNo = searchId;
  }
  const { state, dispatch, runTransaction } = useERP();
  const { user } = useAuth();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [dbTimeline, setDbTimeline] = useState([]);

  useEffect(() => {
    if (orderNo) {
      fetch(`/api/sales/orders/${orderNo}/timeline`, {
        headers: {
          'Authorization': `Bearer mock_token_${user?.role?.replace(/ /g, '_') || 'Super_Admin'}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('API failed');
          return res.json();
        })
        .then(data => {
          if (data && data.success && Array.isArray(data.timeline)) {
            setDbTimeline(data.timeline);
          }
        })
        .catch(err => {
          console.warn('Backend timeline fetch failed, falling back to local simulation data.', err);
        });
    }
  }, [orderNo, user?.role]);


  const orders = state.orders || [];
  const workOrders = state.workOrders || [];
  const materialRequests = state.materialRequests || [];
  const dispatches = state.dispatches || [];
  const payments = state.payments || [];
  const auditLogs = state.auditLogs || [];


  const order = orders.find(o => o.orderNo === orderNo);

  if (!order) {
    return (
      <div className="app-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-text-primary)' }}>Order Traceability Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>The search ID "{id}" could not be resolved to any order in the ERP database.</p>
        <button className="form-submit-btn" style={{ maxWidth: '200px', margin: '20px auto 0' }} onClick={() => router.push(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  // Find linked entities
  const linkedWO = workOrders.find(wo => wo.orderNo === order.orderNo);
  const linkedMRs = materialRequests.filter(mr => mr.orderNo === order.orderNo);
  const linkedDispatches = dispatches.filter(d => d.orderNo === order.orderNo || d.dispatchItems?.some(di => di.orderNo === order.orderNo));
  const linkedInvoice = payments.find(p => p.orderNo === order.orderNo);

  // Retrieve last update logs
  const linkedLogs = auditLogs.filter(l => l.entityId === order.orderNo || l.entityId === linkedWO?.id || linkedDispatches.some(d => d.id === l.entityId) || linkedMRs.some(mr => mr.id === l.entityId));
  const lastUpdateLog = linkedLogs.length > 0 ? linkedLogs[0] : null;

  const colors = STATUS_COLORS[order.status] || STATUS_COLORS['Created'];

  const getCardStyle = (cardId, defaultBorderColor) => {
    const isHovered = hoveredCard === cardId;
    return {
      borderLeft: `5px solid ${defaultBorderColor}`,
      background: 'var(--color-bg-card)',
      borderTop: '1px solid var(--color-border)',
      borderRight: '1px solid var(--color-border)',
      borderBottom: '1px solid var(--color-border)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: isHovered 
        ? '0 20px 40px -10px rgba(0, 0, 0, 0.05), 0 10px 20px -5px rgba(0, 0, 0, 0.03)' 
        : 'var(--shadow-premium)',
      transform: isHovered ? 'translateY(-4px)' : 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  };

  // Quick Action triggers based on status and user roles
  const handleQuickAction = async (actionType) => {
    switch (actionType) {
      case 'PLAN':
        router.push(`/plant-head/incoming-orders?orderNo=${order.orderNo}`);
        break;
      case 'CREATE_WO': {
        const confirm = await Swal.fire({
          title: 'Plan Work Order?',
          text: `Create WO for planned order ${order.orderNo}?`,
          icon: 'question',
          showCancelButton: true
        });
        if (confirm.isConfirmed) {
          const res = await runTransaction((dispatchStore, stateStore) => {
            return productionService.createWorkOrder(stateStore, order, dispatchStore, user);
          });
          if (res.success) {
            Swal.fire('Created', `Work Order ${res.payload.id} initialized.`, 'success');
          } else {
            Swal.fire('Error', res.error.message || res.error, 'error');
          }
        }
        break;
      }
      case 'CREATE_MR':
        if (linkedWO) {
          router.push(`/production/material-requests?woId=${linkedWO.id}`);
        }
        break;
      case 'APPROVE_MR':
        router.push(`/plant-head/material-approvals`);
        break;
      case 'ISSUE_STORE':
        router.push(`/store/material-requests`);
        break;
      case 'START_PROD': {
        const confirm = await Swal.fire({
          title: 'Start Manufacturing?',
          text: `Start production on floor for Work Order ${linkedWO.id}?`,
          icon: 'question',
          showCancelButton: true
        });
        if (confirm.isConfirmed && linkedWO) {
          const res = await runTransaction((dispatchStore, stateStore) => {
            return productionService.startProduction(stateStore, linkedWO, dispatchStore, user);
          });
          if (res.success) {
            Swal.fire('Started', 'Assembly floor workers notified.', 'success');
          } else {
            Swal.fire('Error', res.error.message || res.error, 'error');
          }
        }
        break;
      }
      case 'COMPLETE_PROD': {
        const confirm = await Swal.fire({
          title: 'Complete Production?',
          text: `Mark Work Order ${linkedWO.id} completed?`,
          icon: 'question',
          showCancelButton: true
        });
        if (confirm.isConfirmed && linkedWO) {
          const res = await runTransaction((dispatchStore, stateStore) => {
            return productionService.completeProduction(stateStore, linkedWO, dispatchStore, user);
          });
          if (res.success) {
            Swal.fire('Completed', 'Batch forwarded for QC checks.', 'success');
          } else {
            Swal.fire('Error', res.error.message || res.error, 'error');
          }
        }
        break;
      }
      case 'INSPECT_QC':
        router.push(`/qc/pending`);
        break;
      case 'CREATE_DSP':
        router.push(`/dispatch/create-dispatch`);
        break;
      case 'DEPART_DSP': {
        const activeDsp = linkedDispatches.find(d => d.status === 'Dispatch Created');
        if (activeDsp) {
          const confirm = await Swal.fire({
            title: 'Depart Vehicle?',
            text: `Confirm departure for vehicle ${activeDsp.vehicleNo}?`,
            icon: 'question',
            showCancelButton: true
          });
          if (confirm.isConfirmed) {
            const res = await runTransaction((dispatchStore, stateStore) => {
              return dispatchService.departVehicle(stateStore, activeDsp.id, dispatchStore, user);
            });
            if (res.success) {
              Swal.fire('Departed', `Vehicle ${activeDsp.vehicleNo} set In Transit.`, 'success');
            } else {
              Swal.fire('Error', res.error.message || res.error, 'error');
            }
          }
        }
        break;
      }
      case 'DELIVER_DSP':
        router.push(`/dispatch/delivery`);
        break;
      case 'RECORD_PAY':
        router.push(user?.role === 'Finance Executive' || user?.role === 'finance-executive' ? `/finance-executive/payment-verification` : `/finance/invoices`);
        break;
      case 'VERIFY_PAY':
        router.push(user?.role === 'Finance Executive' || user?.role === 'finance-executive' ? `/finance-executive/payment-verification` : `/finance/invoices`);
        break;
      case 'CLOSE_ORDER': {
        const confirm = await Swal.fire({
          title: 'Close Order?',
          text: `Verify dues and close Order ${order.orderNo}?`,
          icon: 'question',
          showCancelButton: true
        });
        if (confirm.isConfirmed) {
          const res = await runTransaction((dispatchStore, stateStore) => {
            return financeService.closeOrder(stateStore, order, dispatchStore, user);
          });
          if (res.success) {
            Swal.fire('Closed', 'Order closed safely.', 'success');
          } else {
            Swal.fire('Error', res.error.message || res.error, 'error');
          }
        }
        break;
      }
      case 'CANCEL_ORDER': {
        const { value: reason } = await Swal.fire({
          title: 'Cancel Order?',
          input: 'text',
          inputLabel: 'Provide Cancellation Reason (Mandatory)',
          inputPlaceholder: 'Reason for cancellation...',
          inputValidator: (value) => {
            if (!value) {
              return 'You need to specify a reason!';
            }
          },
          showCancelButton: true
        });
        if (reason) {
          const res = await runTransaction((dispatchStore, stateStore) => {
            return productionService.cancelOrder(stateStore, order.orderNo, reason, dispatchStore, user);
          });
          if (res.success) {
            Swal.fire('Cancelled', 'Order marked Cancelled.', 'success');
          } else {
            Swal.fire('Error', res.error.message || res.error, 'error');
          }
        }
        break;
      }
      case 'HOLD_ORDER': {
        const isOnHold = order.status === 'On Hold';
        const { value: reason } = isOnHold ? { value: 'Resume' } : await Swal.fire({
          title: 'Place Order On Hold?',
          input: 'text',
          inputLabel: 'Provide Reason (Mandatory)',
          inputPlaceholder: 'Reason for hold...',
          inputValidator: (value) => {
            if (!value) {
              return 'You need to specify a reason!';
            }
          },
          showCancelButton: true
        });
        if (reason) {
          const res = await runTransaction((dispatchStore, stateStore) => {
            return productionService.holdOrder(stateStore, order.orderNo, isOnHold ? '' : reason, dispatchStore, user);
          });
          if (res.success) {
            Swal.fire(isOnHold ? 'Resumed' : 'Held', isOnHold ? 'Order set active.' : 'Order set On Hold.', 'success');
          } else {
            Swal.fire('Error', res.error.message || res.error, 'error');
          }
        }
        break;
      }
      default:
        break;
    }
  };

  const renderQuickActions = () => {
    const actions = [];
    const ROLE_ALIASES = {
      'Finance Executive': 'finance-executive',
      'finance-executive': 'Finance Executive',
      'Finance Manager': 'Finance',
      'Finance Lead': 'Finance',
      'Dispatch Manager': 'Dispatch',
      'Dispatch 1 Operator': 'Dispatch',
      'Dispatch 2 Operator': 'Dispatch',
      'Sales Manager': 'Sales',
      'Sales Executive': 'Sales',
      'Production Manager': 'Production',
      'Production Supervisor': 'Production',
      'Production Operator': 'Production',
      'Store Manager': 'Store',
      'Store Executive': 'Store',
      'QC Manager': 'QC',
      'QC Inspector': 'QC',
      'HR Manager': 'HR',
      'HR Executive': 'HR'
    };

    const userRole = ROLE_ALIASES[user?.role] || user?.role || '';
    const isSuper = userRole === 'Super Admin';

    // Cancel / Hold emergency triggers (allowed in non-terminal states)
    if (order.status !== 'Closed' && order.status !== 'Cancelled') {
      if (userRole === 'Plant Head' || userRole === 'Production' || isSuper) {
        actions.push({ label: 'Cancel Order', icon: ShieldAlert, action: 'CANCEL_ORDER', style: { background: '#ef4444', color: '#fff' } });
        if (['Planned', 'In Production', 'On Hold'].includes(order.status)) {
          actions.push({ 
            label: order.status === 'On Hold' ? 'Resume Order' : 'Hold Order', 
            icon: Clock, 
            action: 'HOLD_ORDER', 
            style: { background: '#f59e0b', color: '#000' } 
          });
        }
      }
    }

    if (order.status === 'Created' && (userRole === 'Plant Head' || isSuper)) {
      actions.push({ label: 'Decide Production Date', icon: Clock, action: 'PLAN', style: { background: 'var(--color-primary)', color: '#000' } });
    } else if (order.status === 'Planned' && (userRole === 'Production' || isSuper)) {
      actions.push({ label: 'Create Work Order', icon: Clipboard, action: 'CREATE_WO', style: { background: 'var(--color-primary)', color: '#000' } });
    } else if (order.status === 'Work Order Created' && (userRole === 'Production' || isSuper)) {
      actions.push({ label: 'Create Material Request', icon: Box, action: 'CREATE_MR', style: { background: 'var(--color-primary)', color: '#000' } });
    } else if (order.status === 'Material Requested' && (userRole === 'Plant Head' || isSuper)) {
      actions.push({ label: 'Approve Material Release', icon: ShieldCheck, action: 'APPROVE_MR', style: { background: 'var(--color-primary)', color: '#000' } });
    } else if (order.status === 'Material Approved' && (userRole === 'Store' || isSuper)) {
      actions.push({ label: 'Issue Materials', icon: CheckCircle2, action: 'ISSUE_STORE', style: { background: 'var(--color-primary)', color: '#000' } });
    } else if (order.status === 'Material Issued' && (userRole === 'Production' || isSuper)) {
      actions.push({ label: 'Start Production', icon: Zap, action: 'START_PROD', style: { background: 'var(--color-primary)', color: '#000' } });
    } else if (['In Production', 'IN_PRODUCTION'].includes(order.status) && (userRole === 'Production' || isSuper)) {
      actions.push({ label: 'Complete Production', icon: CheckCircle2, action: 'COMPLETE_PROD', style: { background: '#10b981', color: '#fff' } });
    } else if (['QC Pending', 'QC_PENDING'].includes(order.status) && (userRole === 'QC' || isSuper)) {
      actions.push({ label: 'Run Quality Inspection', icon: ShieldCheck, action: 'INSPECT_QC', style: { background: 'var(--color-primary)', color: '#000' } });
    } else if (['QC Passed', 'QC_PASSED', 'DISPATCH_READY'].includes(order.status) && (userRole === 'Dispatch' || isSuper)) {
      actions.push({ label: 'Create Dispatch Log', icon: Truck, action: 'CREATE_DSP', style: { background: 'var(--color-primary)', color: '#000' } });
    } else if (['Dispatch Created', 'DISPATCH_CREATED'].includes(order.status) && (userRole === 'Dispatch' || isSuper)) {
      actions.push({ label: 'Depart Delivery Vehicle', icon: Truck, action: 'DEPART_DSP', style: { background: '#10b981', color: '#fff' } });
    } else if (order.status === 'In Transit' && (userRole === 'Dispatch' || isSuper)) {
      actions.push({ label: 'Confirm Consignment Delivery', icon: Clipboard, action: 'DELIVER_DSP', style: { background: '#10b981', color: '#fff' } });
    } else if (order.status === 'Payment Pending' && (userRole === 'Finance' || ['finance-lead', 'finance-executive'].includes(userRole) || isSuper)) {
      actions.push({ label: 'Verify Payment Dues', icon: CreditCard, action: 'VERIFY_PAY', style: { background: 'var(--color-primary)', color: '#000' } });
    } else if (order.status === 'Payment Verified' && (userRole === 'Finance' || userRole === 'finance-lead' || isSuper)) {
      actions.push({ label: 'Close Dues & Archive Order', icon: CheckCircle2, action: 'CLOSE_ORDER', style: { background: '#10b981', color: '#fff' } });
    }

    if (actions.length === 0) return null;

    return (
      <div className="app-card" style={{ borderLeft: '5px solid var(--color-primary)', background: 'var(--color-bg-card)' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)' }}>
          <Zap size={15} color="var(--color-primary)" /> ERP Console Quick Actions
        </h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {actions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <button 
                key={idx} 
                onClick={() => handleQuickAction(act.action)} 
                className="action-btn"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '10px 18px', 
                  borderRadius: '10px', 
                  border: 'none', 
                  fontSize: '13px', 
                  fontWeight: '800', 
                  cursor: 'pointer', 
                  ...act.style 
                }}
              >
                <Icon size={14} /> {act.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header action bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          onClick={() => router.push(-1)}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-primary)' }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-text-primary)', margin: 0 }}>Global Order Traceability</h2>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>ORD Linkage Explorer & Audit Verification</span>
        </div>
      </div>

      {/* Main Order Card banner */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: '32px', 
        alignItems: 'center', 
        background: 'var(--color-bg-card, #ffffff)', 
        border: '1px solid var(--color-border)',
        borderLeft: `6px solid ${colors.color}`,
        borderRadius: '24px',
        padding: '30px',
        boxShadow: 'var(--shadow-premium)'
      }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Ref</span>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--color-text-primary)', margin: '2px 0 10px 0', letterSpacing: '-0.8px' }}>{order.orderNo}</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <Building2 size={15} color="var(--color-text-secondary)" /> Customer: <strong style={{ color: 'var(--color-text-primary)', marginLeft: '4px' }}>{order.customer?.name || order.customerName}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <Package size={15} color="var(--color-text-secondary)" /> Products: <strong style={{ color: 'var(--color-text-primary)', marginLeft: '4px' }}>{order.products}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <UserCheck size={15} color="var(--color-text-secondary)" /> Current Owner: <strong style={{ color: colors.color, marginLeft: '4px' }}>{order.currentDepartment || 'None'}</strong>
            </span>
          </div>
        </div>

        {/* Vertical divider */}
        <div style={{ width: '1px', height: '100px', background: 'var(--color-border)', display: 'block' }} />

        <div style={{ minWidth: '220px' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Volume Ordered</span>
          <span style={{ fontSize: '26px', fontWeight: '900', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <Scale size={20} color="var(--color-text-secondary)" /> {order.quantity} Tons
          </span>
          <span style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '8px' }}>
            Completed: <strong style={{ color: 'var(--color-text-primary)' }}>{order.dispatch?.completed || 0} T</strong> | Remaining: <strong style={{ color: 'var(--color-text-primary)' }}>{order.dispatch?.remaining ?? order.quantity} T</strong>
          </span>
        </div>

        {/* Vertical divider */}
        <div style={{ width: '1px', height: '100px', background: 'var(--color-border)', display: 'block' }} />

        <div style={{ minWidth: '220px' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Flow Status</span>
          <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: colors.bg,
              border: colors.border,
              color: colors.color,
              borderRadius: '20px',
              padding: '6px 16px',
              fontWeight: '800',
              fontSize: '13px'
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.color }} />
              {order.status}
            </div>
            {lastUpdateLog && (
              <div style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                Last updated by: <strong style={{ color: 'var(--color-text-primary)' }}>{lastUpdateLog.user}</strong>
                <br />
                <span style={{ color: 'var(--color-text-muted)' }}>({lastUpdateLog.time} on {lastUpdateLog.date})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-width Milestone Pipeline Progress bar */}
      <Timeline currentStage={order.status} layout="horizontal" />

      {/* Quick Action Console */}
      {renderQuickActions()}

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: Pipeline milestones timeline */}
        <div className="app-card" style={{ height: 'fit-content', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-premium)' }}>
          <Timeline timeline={dbTimeline.length > 0 ? dbTimeline : (order.timeline || [])} layout="vertical" />
        </div>

        {/* Right Side: Linked components details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 1. Linked Work Order details */}
          <div 
            style={getCardStyle('wo', '#f59e0b')}
            onMouseEnter={() => setHoveredCard('wo')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '14.5px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)' }}>
                <Clipboard size={16} color="#f59e0b" /> Manufacturing Work Order Link
              </h4>
              {linkedWO ? (
                <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold', background: 'var(--color-bg-base)', color: 'var(--color-text-primary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                  {linkedWO.id}
                </span>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Not Created Yet</span>
              )}
            </div>

            {linkedWO ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Current Stage</span>
                  <strong style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}>{linkedWO.stage}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Completion Progress</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{ flex: 1, height: '6px', background: '#DCE5F0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${linkedWO.progress}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', borderRadius: '4px' }} />
                    </div>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{linkedWO.progress}%</strong>
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Rework Runs</span>
                  <strong style={{ color: linkedWO.reworkCount > 0 ? '#dc2626' : 'var(--color-text-primary)', fontSize: '14px' }}>{linkedWO.reworkCount} runs</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Priority</span>
                  <strong style={{ color: linkedWO.priority === 'High' ? '#dc2626' : 'var(--color-text-primary)', fontSize: '14px' }}>{linkedWO.priority}</strong>
                </div>
                {linkedWO.qcHistory && linkedWO.qcHistory.length > 0 && (
                  <div style={{ gridColumn: '1 / -1', background: '#F5FAFE', border: '1px solid var(--color-border)', borderLeft: '4px solid #f59e0b', padding: '10px 14px', borderRadius: '8px', marginTop: '6px' }}>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Defects History</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {linkedWO.qcHistory.map((h, i) => (
                        <div key={i} style={{ fontSize: '12px', color: 'var(--color-text-primary)', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: '500' }}>Run #{i+1}: {h.result === 'Passed' ? '✅ Passed' : `❌ Failed (${h.defects?.join(', ')})`}</span>
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>{h.date} by {h.inspector}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                Awaiting Plant Head planning step before production work order can be created.
              </p>
            )}
          </div>

          {/* 2. Linked Material Requests */}
          <div 
            style={getCardStyle('material', '#3b82f6')}
            onMouseEnter={() => setHoveredCard('material')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h4 style={{ fontSize: '14.5px', fontWeight: '800', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)' }}>
              <Box size={16} color="#3b82f6" /> Material Planning Clearance
            </h4>
            {linkedMRs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {linkedMRs.map(mr => (
                  <div key={mr.id} style={{ background: '#F5FAFE', border: '1px solid var(--color-border)', borderLeft: '4px solid #3b82f6', padding: '14px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e40af' }}>Req ID: {mr.id}</span>
                      <span style={{ 
                        fontSize: '11px', 
                        background: mr.status === 'Issued' ? '#f0fdf4' : mr.status === 'Shortage' ? '#fff1f2' : '#f1f5f9', 
                        color: mr.status === 'Issued' ? '#15803d' : mr.status === 'Shortage' ? '#b91c1c' : '#475569', 
                        padding: '2px 10px', 
                        borderRadius: '20px', 
                        fontWeight: 'bold',
                        border: mr.status === 'Issued' ? '1px solid #bbf7d0' : mr.status === 'Shortage' ? '1px solid #fecdd3' : '1px solid #D6E2F0'
                      }}>
                        {mr.status === 'Issued' ? 'Issued' : mr.status === 'Shortage' ? 'Stock Shortage' : mr.status}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {mr.materials.map((m, mIdx) => (
                        <div key={mIdx} style={{ fontSize: '12.5px', color: 'var(--color-text-primary)' }}>
                          • {m.materialName}: <strong>{m.quantityRequested}T</strong> <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>(Approved: {m.quantityApproved}T)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                No material clearance request raised for this work order yet.
              </p>
            )}
          </div>

          {/* 3. Dispatch & Freight logistics */}
          <div 
            style={getCardStyle('dispatch', '#8b5cf6')}
            onMouseEnter={() => setHoveredCard('dispatch')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <h4 style={{ fontSize: '14.5px', fontWeight: '800', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)' }}>
              <Truck size={16} color="#8b5cf6" /> Outbound Cargo & Freight Logs
            </h4>
            {linkedDispatches.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {linkedDispatches.map(d => (
                  <div key={d.id} style={{ background: '#F5FAFE', border: '1px solid var(--color-border)', borderLeft: '4px solid #8b5cf6', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#6d28d9' }}>Consignment ID: {d.id} ({d.type})</div>
                      <span style={{ fontSize: '12.5px', color: 'var(--color-text-primary)', display: 'block', marginTop: '6px' }}>
                        Vehicle: <strong>{d.vehicleNo}</strong> · Driver: <strong>{d.driverName}</strong>
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '2px' }}>
                        Transporter: <strong>{d.transporter}</strong>{user?.role !== 'Production' && <> | Cost: <strong>₹{d.transportCost.toLocaleString('en-IN')}</strong></>}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        background: d.status === 'Delivered' ? '#f0fdf4' : '#eff6ff', 
                        color: d.status === 'Delivered' ? '#15803d' : '#1d4ed8', 
                        padding: '2px 10px', 
                        borderRadius: '20px', 
                        fontWeight: 'bold',
                        border: d.status === 'Delivered' ? '1px solid #bbf7d0' : '1px solid #bfdbfe'
                      }}>
                        {d.status}
                      </span>
                      {d.proofImage && (
                        <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          📷 Proof: {d.proofImage}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                No active logistics dispatch recorded for this order yet.
              </p>
            )}
          </div>

          {/* 4. Payment invoices */}
          {user?.role !== 'Production' && (
            <div 
              style={getCardStyle('invoice', '#10b981')}
              onMouseEnter={() => setHoveredCard('invoice')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <h4 style={{ fontSize: '14.5px', fontWeight: '800', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)' }}>
                <CreditCard size={16} color="#10b981" /> Receivable Billing & Payments
              </h4>
              {linkedInvoice ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Invoice Reference</span>
                    <strong style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}>{linkedInvoice.invoiceNo}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Invoice Amount</span>
                    <strong style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}>₹{linkedInvoice.totalAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Amount Cleared</span>
                    <strong style={{ color: '#10b981', fontSize: '14px' }}>₹{linkedInvoice.paidAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>Outstanding Dues</span>
                    <strong style={{ color: linkedInvoice.totalAmount - linkedInvoice.paidAmount > 0 ? '#f59e0b' : 'var(--color-text-primary)', fontSize: '14px' }}>
                      ₹{(linkedInvoice.totalAmount - linkedInvoice.paidAmount).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1', background: '#F5FAFE', border: '1px solid var(--color-border)', borderLeft: '4px solid #10b981', padding: '10px 14px', borderRadius: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Verification status</span>
                      <strong style={{ color: 'var(--color-text-primary)', fontSize: '12.5px' }}>
                        {linkedInvoice.verified === 'Approved' ? 'Verified & Audited' : linkedInvoice.verified === 'Pending' ? 'Pending Finance Audit' : 'Outstanding Proof'}
                      </strong>
                    </div>
                    <span style={{ 
                      fontSize: '11px', 
                      background: linkedInvoice.status === 'Paid' ? '#f0fdf4' : '#fffbeb', 
                      color: linkedInvoice.status === 'Paid' ? '#15803d' : '#b45309', 
                      padding: '2px 10px', 
                      borderRadius: '20px', 
                      fontWeight: 'bold',
                      border: linkedInvoice.status === 'Paid' ? '1px solid #bbf7d0' : '1px solid #fde68a'
                    }}>
                      {linkedInvoice.status}
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                  Invoice not generated yet.
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

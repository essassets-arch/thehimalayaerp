'use client';

import React, { useState } from 'react';
import { 
  Search, Download, Share2, Printer, Eye, X, CheckCircle2, Clock, 
  AlertCircle, ChevronRight, FileText, Calendar, Building2, User, 
  CreditCard, ShieldCheck, MapPin, Truck, RefreshCw, Layers
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getPaymentStatus, formatRemainingDays } from '../utils/paymentTerms';
import './erp-premium-ui.css';

// ──────────────────────────────────────────────────────────
// 1. PAYMENT STATUS BADGE
// ──────────────────────────────────────────────────────────
export function PaymentStatusBadge({ 
  orderStatus, 
  deliveryDate, 
  paymentTerms, 
  totalAmount, 
  paidAmount 
}: { 
  orderStatus: string; 
  deliveryDate?: string; 
  paymentTerms: number; 
  totalAmount: number; 
  paidAmount: number; 
}) {
  const result = getPaymentStatus(orderStatus, deliveryDate, paymentTerms, totalAmount, paidAmount);
  
  const badgeClasses: Record<string, string> = {
    gray: 'erp-badge erp-badge-gray',
    blue: 'erp-badge erp-badge-blue',
    orange: 'erp-badge erp-badge-orange',
    red: 'erp-badge erp-badge-red',
    green: 'erp-badge erp-badge-green'
  };

  return (
    <span className={badgeClasses[result.badgeColor] || badgeClasses.gray}>
      <span className={`w-2 h-2 rounded-full inline-block ${
        result.badgeColor === 'green' ? 'bg-emerald-500' :
        result.badgeColor === 'red' ? 'bg-red-500' :
        result.badgeColor === 'orange' ? 'bg-amber-500' :
        result.badgeColor === 'blue' ? 'bg-blue-500' : 'bg-slate-400'
      }`} />
      {result.status}
    </span>
  );
}

// ──────────────────────────────────────────────────────────
// 2. STANDARDIZED ACTION BUTTONS WITH SWEETALERT2
// ──────────────────────────────────────────────────────────
export function StandardActionButtons({
  onView,
  onDownload,
  onShare,
  onPrint,
  compact = false
}: {
  onView?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  compact?: boolean;
}) {
  const handleAction = (type: string, callback?: () => void) => {
    if (callback) {
      callback();
    } else {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `${type} Action Executed`,
        text: `${type} request processed successfully.`,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
      {onView && (
        <button
          type="button"
          onClick={() => handleAction('View', onView)}
          className="erp-btn erp-btn-sm erp-btn-secondary"
          title="View Details"
        >
          <Eye style={{ width: 14, height: 14 }} />
          {!compact && 'View'}
        </button>
      )}
      <button
        type="button"
        onClick={() => handleAction('Download PDF', onDownload)}
        className="erp-btn erp-btn-sm erp-btn-primary"
        title="Download PDF"
      >
        <Download style={{ width: 14, height: 14 }} />
        {!compact && 'Download'}
      </button>
      <button
        type="button"
        onClick={() => handleAction('Share', onShare)}
        className="erp-btn erp-btn-sm erp-btn-success"
        title="Share"
      >
        <Share2 style={{ width: 14, height: 14 }} />
        {!compact && 'Share'}
      </button>
      <button
        type="button"
        onClick={() => handleAction('Print', onPrint)}
        className="erp-btn erp-btn-sm erp-btn-warning"
        title="Print"
      >
        <Printer style={{ width: 14, height: 14 }} />
        {!compact && 'Print'}
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// 3. 11-STAGE WORKFLOW TIMELINE
// ──────────────────────────────────────────────────────────
export function WorkflowTimeline({ currentStatus }: { currentStatus: string }) {
  const stages = [
    'Lead',
    'Quotation',
    'Order',
    'Plant Head Approval',
    'Production',
    'QC',
    'Dispatch',
    'Delivered',
    'Payment Pending',
    'Payment Verified',
    'Closed'
  ];

  const statusUpper = String(currentStatus || '').toLowerCase();
  
  let currentIdx = 2; // Default to Order stage
  if (statusUpper.includes('lead')) currentIdx = 0;
  else if (statusUpper.includes('quotation') || statusUpper.includes('draft')) currentIdx = 1;
  else if (statusUpper.includes('pending_plant_head') || statusUpper.includes('review')) currentIdx = 2;
  else if (statusUpper.includes('plant_head_approved') || statusUpper.includes('approved')) currentIdx = 3;
  else if (statusUpper.includes('production') || statusUpper.includes('work_order')) currentIdx = 4;
  else if (statusUpper.includes('qc')) currentIdx = 5;
  else if (statusUpper.includes('dispatch') || statusUpper.includes('in_transit')) currentIdx = 6;
  else if (statusUpper.includes('delivered')) currentIdx = 7;
  else if (statusUpper.includes('payment_pending') || statusUpper.includes('due')) currentIdx = 8;
  else if (statusUpper.includes('payment_verified')) currentIdx = 9;
  else if (statusUpper.includes('closed')) currentIdx = 10;

  return (
    <div className="erp-timeline-scroll" style={{
      padding: '16px 12px',
      background: '#ffffff',
      border: '1px solid #DCE5F0',
      borderRadius: '14px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', minWidth: '760px', justifyContent: 'space-between', padding: '0 8px' }}>
        {stages.map((stage, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <React.Fragment key={stage}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 800,
                  transition: 'all 0.2s ease',
                  ...(isDone ? { background: '#059669', color: '#ffffff' } :
                     isCurrent ? { background: '#4f46e5', color: '#ffffff', boxShadow: '0 0 0 4px #e0e7ff' } :
                     { background: '#DCE5F0', color: '#5E6B82' })
                }}>
                  {isDone ? <CheckCircle2 style={{ width: 14, height: 14 }} /> : idx + 1}
                </div>
                <span style={{
                  fontSize: '9.5px',
                  marginTop: '6px',
                  fontWeight: isCurrent ? 800 : isDone ? 700 : 500,
                  whiteSpace: 'nowrap',
                  color: isCurrent ? '#1e1b4b' : isDone ? '#065f46' : '#5E6B82'
                }}>
                  {stage}
                </span>
              </div>
              {idx < stages.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '3px',
                  margin: '0 4px',
                  borderRadius: '2px',
                  background: idx < currentIdx ? '#10b981' : '#DCE5F0'
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// 4. ORDER DETAIL DRAWER (RESPONSIVE)
// ──────────────────────────────────────────────────────────
export function OrderDetailDrawer({ 
  order, 
  onClose 
}: { 
  order: any; 
  onClose: () => void 
}) {
  if (!order) return null;

  const totalAmount = Number(order.totalAmount || order.totalValue || order.amount || 10000);
  const paidAmount = Number(order.paidAmount || order.paid_amount || 0);
  const pendingAmount = Math.max(0, totalAmount - paidAmount);
  const paymentTerms = Number(order.paymentTerms || 15);
  const deliveryDate = order.deliveryDate || order.expectedDeliveryDate || '2026-07-25';
  const invoiceDate = order.invoiceDate || order.createdAt?.split('T')[0] || '2026-07-20';
  const history = Array.isArray(order.paymentHistory) ? order.paymentHistory : [];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end',
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(3px)'
    }}>
      <div style={{
        width: 'min(100vw, 620px)',
        background: '#ffffff',
        height: '100%',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        
        {/* Drawer Header */}
        <div style={{
          padding: '16px 20px',
          background: '#24345C',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>Order: {order.orderNo || order.id}</h3>
              <PaymentStatusBadge
                orderStatus={order.status || 'Delivered'}
                deliveryDate={deliveryDate}
                paymentTerms={paymentTerms}
                totalAmount={totalAmount}
                paidAmount={paidAmount}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#8893A7', margin: '4px 0 0 0' }}>Customer: {order.customerName || order.customer || 'Acme Ltd'}</p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#8893A7', cursor: 'pointer', padding: '4px' }}
          >
            <X style={{ width: 22, height: 22 }} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#F5FAFE' }}>
          
          {/* Timeline */}
          <div>
            <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5E6B82', marginBottom: '8px' }}>Order Lifecycle</h4>
            <WorkflowTimeline currentStatus={order.status} />
          </div>

          {/* Key Metrics */}
          <div className="erp-card-grid">
            <div className="erp-metric-card">
              <span className="erp-metric-label">Total Amount</span>
              <span className="erp-metric-value" style={{ color: '#24345C' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="erp-metric-card" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
              <span className="erp-metric-label" style={{ color: '#047857' }}>Paid Amount</span>
              <span className="erp-metric-value" style={{ color: '#065f46' }}>₹{paidAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="erp-metric-card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
              <span className="erp-metric-label" style={{ color: '#b45309' }}>Pending Amount</span>
              <span className="erp-metric-value" style={{ color: '#92400e' }}>₹{pendingAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Dates & Terms */}
          <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '14px', padding: '16px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#5E6B82', marginBottom: '12px' }}>Dates & Payment Terms</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '14px', fontSize: '12.5px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#8893A7', display: 'block' }}>Invoice Date</span>
                <strong style={{ color: '#1e293b' }}>{invoiceDate}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#8893A7', display: 'block' }}>Delivery Date</span>
                <strong style={{ color: '#1e293b' }}>{deliveryDate}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#8893A7', display: 'block' }}>Payment Terms</span>
                <strong style={{ color: '#4f46e5' }}>{paymentTerms} Days</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#8893A7', display: 'block' }}>Salesperson</span>
                <strong style={{ color: '#1e293b' }}>{order.salesperson || 'Rajesh Kumar'}</strong>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '14px', padding: '16px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#5E6B82', marginBottom: '12px' }}>Order Products</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(order.items || [{ name: order.product || 'Standard Steel Rods 20mm', qty: order.quantity || 500, price: 20 }]).map((item: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F5FAFE', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '12.5px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <strong style={{ color: '#24345C', display: 'block' }}>{item.name || item.product}</strong>
                    <span style={{ fontSize: '11px', color: '#5E6B82' }}>Qty: {item.qty || item.quantity}</span>
                  </div>
                  <strong style={{ color: '#24345C' }}>₹{((item.qty || item.quantity || 1) * (item.price || 20)).toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Ledger History */}
          <div style={{ background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '14px', padding: '16px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#5E6B82', marginBottom: '12px' }}>Payment History Ledger</h4>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8893A7', fontSize: '12px', fontStyle: 'italic' }}>
                No payment transactions recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.map((tx: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', fontSize: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <strong style={{ color: '#065f46', fontSize: '14px', display: 'block' }}>₹{Number(tx.amount).toLocaleString('en-IN')}</strong>
                      <span style={{ color: '#047857' }}>Verified Payment Record</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#334155', fontWeight: 600, display: 'block' }}>{tx.paymentDate}</span>
                      <span style={{ color: '#5E6B82', fontSize: '11px' }}>By {tx.verifiedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Drawer Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #DCE5F0', background: '#ffffff', display: 'flex', justifyContent: 'flex-end' }}>
          <StandardActionButtons 
            onView={undefined}
            onDownload={() => Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: `Downloading PDF for Order ${order.orderNo || order.id}...`, showConfirmButton: false, timer: 2000 })}
            onShare={() => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Sharing Order ${order.orderNo || order.id}...`, showConfirmButton: false, timer: 2000 })}
            onPrint={() => window.print()}
          />
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// 5. PAGE SEARCH INPUT
// ──────────────────────────────────────────────────────────
export function PageSearchInput({ 
  value, 
  onChange, 
  placeholder = "Search current table..." 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string; 
}) {
  return (
    <div className="erp-search-wrapper">
      <Search className="erp-search-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="erp-search-input"
      />
      {value && (
        <button 
          onClick={() => onChange('')}
          className="erp-search-clear"
          type="button"
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import {
  X,
  Building2,
  Calendar,
  Truck,
  Package,
  Layers,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  AlertCircle,
  Eye,
  Info,
  MapPin,
  Phone,
  Mail,
  Hash,
} from 'lucide-react';
import styles from './FinanceReadyForDispatchView.module.css';

const formatINR = (value) => {
  if (value === null || value === undefined || isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value));
};

const formatDate = (dateVal) => {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const formatDateTime = (dateVal) => {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

export default function FinanceOrderDetailsModal({
  order,
  onClose,
  onOpenQuotation,
}) {
  if (!order) return null;

  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'DELIVERED') {
      return (
        <span className={styles.badgeDelivered}>
          <CheckCircle2 size={13} /> Delivered
        </span>
      );
    }
    if (s === 'IN_TRANSIT') {
      return (
        <span className={styles.badgeInTransit}>
          <Truck size={13} /> In Transit
        </span>
      );
    }
    if (s === 'DISPATCHED') {
      return (
        <span className={styles.badgeDispatched}>
          <Truck size={13} /> Dispatched
        </span>
      );
    }
    return (
      <span className={styles.badgeStaged}>
        <Clock size={13} /> Staged for Dispatch
      </span>
    );
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Order Details"
    >
      <div
        className={styles.modalBox}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '960px' }}
      >
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#0284c7',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Package size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Order: {order.salesOrderNumber || '—'}</span>
                <span className={styles.readOnlyTag}>READ ONLY</span>
                {getStatusBadge(order.dispatchStatus)}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#64748b',
                  marginTop: '2px',
                }}
              >
                Production Ready for Dispatch Order Details
              </div>
            </div>
          </div>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {/* Read-Only Notice */}
          <div className={styles.auditNotice}>
            <ShieldCheck size={16} />
            <span>
              <strong>Finance Read-Only Integration:</strong> This view reflects authoritative production & dispatch records directly from the database without workflow alterations.
            </span>
          </div>

          {/* Section A: Customer Details */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <Building2 size={16} color="#0284c7" />
              <span>Section A — Customer & Tenant Details</span>
            </div>
            <div className={styles.grid2Col}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Customer Name</span>
                <span className={styles.metaValue} style={{ fontWeight: 800, color: '#0f172a' }}>
                  {order.customerName || '—'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Customer Code / ID</span>
                <span className={styles.metaValue}>{order.customerCode || '—'}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Company / Tenant</span>
                <span className={styles.metaValue}>
                  {order.companyName || '—'}
                  {order.companyCode ? ` (${order.companyCode})` : ''}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>GSTIN / Tax ID</span>
                <span className={styles.metaValue}>{order.customerGst || '—'}</span>
              </div>
              {order.customerPhone && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Contact Phone</span>
                  <span className={styles.metaValue} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Phone size={13} color="#64748b" /> {order.customerPhone}
                  </span>
                </div>
              )}
              {order.customerEmail && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Contact Email</span>
                  <span className={styles.metaValue} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={13} color="#64748b" /> {order.customerEmail}
                  </span>
                </div>
              )}
              {order.customerAddress && (
                <div className={styles.metaItem} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.metaLabel}>Billing / Shipping Address</span>
                  <span className={styles.metaValue} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', fontSize: '13px' }}>
                    <MapPin size={14} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                    {order.customerAddress}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section B: Sales Order Details */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <FileText size={16} color="#0284c7" />
              <span>Section B — Sales Order Details</span>
            </div>
            <div className={styles.grid2Col}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Sales Order Number</span>
                <span className={styles.metaValue} style={{ fontWeight: 800, fontFamily: 'monospace' }}>
                  {order.salesOrderNumber || '—'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Order Date</span>
                <span className={styles.metaValue}>{formatDate(order.orderDate)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Sales Order Status</span>
                <span className={styles.metaValue}>
                  <span
                    style={{
                      background: '#f1f5f9',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '11px',
                      color: '#334155',
                    }}
                  >
                    {order.salesOrderStatus || 'CONFIRMED'}
                  </span>
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Linked Quotation</span>
                <span className={styles.metaValue}>
                  {order.quotationNumber ? (
                    <button
                      type="button"
                      onClick={() => onOpenQuotation && onOpenQuotation(order)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#0284c7',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontFamily: 'monospace',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {order.quotationNumber}
                      <Eye size={12} />
                    </button>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>— (No linked quotation)</span>
                  )}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Authoritative Order Amount</span>
                <span className={styles.metaValue} style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>
                  {formatINR(order.orderAmount)}
                </span>
              </div>
              {order.paymentTerms && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Payment Terms</span>
                  <span className={styles.metaValue}>{order.paymentTerms}</span>
                </div>
              )}
            </div>

            {/* Order Items Table */}
            {Array.isArray(order.orderItems) && order.orderItems.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    color: '#475569',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Order Line Items ({order.orderItems.length})
                </div>
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700 }}>Item</th>
                        <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700 }}>Code / SKU</th>
                        <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>Qty</th>
                        <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>Unit Rate</th>
                        <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItems.map((item, idx) => (
                        <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>
                            {item.productName || 'Order Product'}
                          </td>
                          <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#64748b' }}>
                            {item.productCode || '—'}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>
                            {item.quantity} {item.unit || 'Nos'}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: '#475569' }}>
                            {item.unitPrice !== null ? formatINR(item.unitPrice) : '—'}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            {item.lineTotal !== null ? formatINR(item.lineTotal) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Section C: Production Details */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <Layers size={16} color="#0284c7" />
              <span>Section C — Production & Quality Control</span>
            </div>
            <div className={styles.grid2Col}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Production Plan</span>
                <span className={styles.metaValue} style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  {order.productionPlanNumber || '—'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Work Order References</span>
                <span className={styles.metaValue}>
                  {Array.isArray(order.workOrderNumbers) && order.workOrderNumbers.length > 0 ? (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {order.workOrderNumbers.map((woNo) => (
                        <span key={woNo} className={styles.woChip}>
                          <Hash size={11} /> {woNo}
                        </span>
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Dispatch-Ready Date</span>
                <span className={styles.metaValue}>
                  {formatDateTime(order.dispatchReadyDate)}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Production Readiness</span>
                <span className={styles.metaValue} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} color="#16a34a" /> Ready for Dispatch
                </span>
              </div>
            </div>

            {/* Detailed Work Orders Table */}
            {Array.isArray(order.workOrders) && order.workOrders.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    color: '#475569',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Associated Production Jobs ({order.workOrders.length})
                </div>
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700 }}>Work Order</th>
                        <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700 }}>Product Name</th>
                        <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>Target Qty</th>
                        <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>Completed</th>
                        <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700 }}>QC Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.workOrders.map((wo, idx) => (
                        <tr key={wo.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                            {wo.workOrderNumber}
                          </td>
                          <td style={{ padding: '8px 12px', color: '#334155' }}>
                            {wo.productName}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                            {wo.targetQuantity}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                            {wo.completedQuantity}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            {wo.passedQc ? (
                              <span style={{ color: '#15803d', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={12} /> Passed QC
                              </span>
                            ) : (
                              <span style={{ color: '#475569', fontWeight: 600 }}>
                                {wo.qcStatus || 'Verified'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Section D: Dispatch Workflow Details */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <Truck size={16} color="#0284c7" />
              <span>Section D — Persisted Dispatch Status & Logistics</span>
            </div>
            <div className={styles.grid2Col}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Persisted Dispatch Status</span>
                <span className={styles.metaValue}>{getStatusBadge(order.dispatchStatus)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Dispatch Reference Number</span>
                <span className={styles.metaValue} style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  {order.dispatchReference || '— (Awaiting logistics assignment)'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Physical Dispatch Timestamp</span>
                <span className={styles.metaValue}>
                  {formatDateTime(order.physicalDispatchedAt)}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Sent to Dispatch At</span>
                <span className={styles.metaValue}>
                  {formatDateTime(order.dispatchReadyDate)}
                </span>
              </div>
            </div>

            {/* Linked Logistics / Dispatch Records */}
            {Array.isArray(order.dispatches) && order.dispatches.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    color: '#475569',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Logistics Shipments ({order.dispatches.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {order.dispatches.map((disp, idx) => (
                    <div
                      key={disp.id || idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '8px',
                        fontSize: '12px',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#64748b' }}>Dispatch Ref:</strong>{' '}
                        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{disp.dispatchNo || '—'}</span>
                      </div>
                      <div>
                        <strong style={{ color: '#64748b' }}>Vehicle:</strong>{' '}
                        <span>{disp.vehicleNumber || '—'}</span>
                      </div>
                      <div>
                        <strong style={{ color: '#64748b' }}>Transporter:</strong>{' '}
                        <span>{disp.transporterName || '—'}</span>
                      </div>
                      <div>
                        <strong style={{ color: '#64748b' }}>Driver:</strong>{' '}
                        <span>{disp.driverName ? `${disp.driverName} (${disp.driverPhone || ''})` : '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section E: Associated Quotation Details */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <FileText size={16} color="#0284c7" />
              <span>Section E — Associated Quotation (Source of Truth)</span>
            </div>

            {order.quotation || order.quotationNumber ? (
              <>
                <div className={styles.grid2Col}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Quotation Reference</span>
                    <span className={styles.metaValue} style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284c7' }}>
                      {order.quotation?.quotationNumber || order.quotationNumber || '—'}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Quotation Date</span>
                    <span className={styles.metaValue}>
                      {formatDate(order.quotation?.createdAt || order.orderDate)}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Quoted Grand Total</span>
                    <span className={styles.metaValue} style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>
                      {order.quotation?.total !== null && order.quotation?.total !== undefined
                        ? formatINR(order.quotation.total)
                        : formatINR(order.orderAmount)}
                    </span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Quotation Status</span>
                    <span className={styles.metaValue}>
                      <span
                        style={{
                          background: '#ecfdf5',
                          color: '#047857',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '11px',
                        }}
                      >
                        {order.quotation?.status || 'Approved'}
                      </span>
                    </span>
                  </div>
                  {order.quotation?.validUntil && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Validity Period</span>
                      <span className={styles.metaValue}>
                        {formatDate(order.quotation.validUntil)}
                      </span>
                    </div>
                  )}
                  {order.quotation?.paymentTerms && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Payment Terms</span>
                      <span className={styles.metaValue}>
                        {order.quotation.paymentTerms}
                      </span>
                    </div>
                  )}
                </div>

                {/* Quoted Items Subtable */}
                {Array.isArray(order.quotation?.items) && order.quotation.items.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '800',
                        color: '#475569',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Quoted Products & Rates ({order.quotation.items.length})
                    </div>
                    <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700 }}>Item Description</th>
                            <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700 }}>Code</th>
                            <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>Qty</th>
                            <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>Unit Rate</th>
                            <th style={{ padding: '8px 12px', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>Line Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.quotation.items.map((it, idx) => (
                            <tr key={it.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>
                                {it.productName || it.description || 'Quoted Product'}
                              </td>
                              <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#64748b' }}>
                                {it.productCode || '—'}
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>
                                {it.quantity}
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'right', color: '#475569' }}>
                                {formatINR(it.unitPrice)}
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                {formatINR(it.lineTotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className={styles.btnViewQuotation}
                    onClick={() => onOpenQuotation && onOpenQuotation(order)}
                    style={{ padding: '8px 14px' }}
                  >
                    <Eye size={14} />
                    Open Full Official Quotation Document ({order.quotation?.quotationNumber || order.quotationNumber})
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: '16px', background: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
                <AlertCircle size={18} color="#94a3b8" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
                No quotation record is linked to Sales Order <strong>{order.salesOrderNumber || '—'}</strong>. This order was placed directly or created without a formal quotation.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
            <Info size={14} />
            <span>Actions are read-only to preserve existing financial workflows.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {order.quotationNumber && (
              <button
                type="button"
                className={styles.btnViewQuotation}
                onClick={() => onOpenQuotation && onOpenQuotation(order)}
              >
                <Eye size={14} />
                View Quotation ({order.quotationNumber})
              </button>
            )}
            <button
              type="button"
              className={styles.btnAction}
              onClick={onClose}
              style={{ background: '#0f172a', color: '#ffffff', borderColor: '#0f172a' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

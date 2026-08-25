import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { Eye, CheckCircle, XCircle, FileCheck, Layers, Box, Clock, ShieldAlert, DollarSign, Calendar, Building } from 'lucide-react';
import DataTable from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import { useToast } from '../../../shared/context/ToastContext';
import { useAuth } from '../../../shared/context/AuthContext';
import { approvePurchaseOrder, rejectPurchaseOrder } from '../../../store/procurementActions';
import { purchaseOrderService } from '../../../services/procurement/purchaseOrderService';
import { purchaseIndentService } from '../../../services/procurement/purchaseIndentService';
import styles from './PurchaseIndentsView.module.css';

const EMPTY_PURCHASE_ORDERS = [];

export default function PurchaseIndentsView() {
  const [activeTab, setActiveTab] = useState('Pending Approval');
  const { showToast } = useToast();
  const { user } = useAuth();

  const [selectedPO, setSelectedPO] = useState(null);
  const [directBackendPOs, setDirectBackendPOs] = useState([]);
  const [historyPOs, setHistoryPOs] = useState([]);
  const [serverIndents, setServerIndents] = useState([]);
  const [queueLoaded, setQueueLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshQueue = async () => {
    try {
      const [pendingResponse, historyResponse, indentsResponse] = await Promise.all([
        purchaseOrderService.superAdminQueue({ limit: 100 }).catch(() => []),
        purchaseOrderService.superAdminHistory({ limit: 100 }).catch(() => []),
        purchaseIndentService.list({ limit: 100 }).catch(() => []),
      ]);
      const rows = Array.isArray(pendingResponse) ? pendingResponse : (pendingResponse?.data || []);
      const historyRows = Array.isArray(historyResponse) ? historyResponse : (historyResponse?.data || []);
      const indentsRows = Array.isArray(indentsResponse) ? indentsResponse : (indentsResponse?.data || []);
      setDirectBackendPOs(rows);
      setHistoryPOs(historyRows);
      setServerIndents(indentsRows);
      setQueueLoaded(true);
      return rows;
    } catch (error) {
      console.warn('[PurchaseIndentsView] Unable to load Super Admin PO queue:', error);
      setQueueLoaded(true);
    }
  };

  useEffect(() => {
    let active = true;
    const poll = async () => {
      if (active) await refreshQueue();
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const pendingPOs = useMemo(() => {
    if (!queueLoaded) return [];
    const unique = new Map();
    // Add PO requests
    directBackendPOs.forEach(po => {
      if (po) {
        const st = String(po.status || '').toUpperCase();
        if (['PENDING_SUPER_ADMIN_APPROVAL', 'PENDING_APPROVAL', 'SUBMITTED', 'PENDING_FINANCE', 'PENDING', 'DRAFT'].includes(st) || st.includes('PENDING') || st.includes('SUBMIT')) {
          unique.set(po.id, po);
        }
      }
    });
    // Add Purchase Indents created by Finance / Store that require approval
    serverIndents.forEach(ind => {
      if (ind) {
        const st = String(ind.status || '').toUpperCase();
        if (['PENDING_SUPER_ADMIN_APPROVAL', 'PENDING_APPROVAL', 'PENDING_PLANT_HEAD_APPROVAL', 'SUBMITTED', 'PENDING_FINANCE', 'PENDING', 'DRAFT'].includes(st) || st.includes('PENDING') || st.includes('SUBMIT')) {
          if (!unique.has(ind.id)) {
            unique.set(ind.id, {
              ...ind,
              id: ind.id,
              poNumber: ind.publicId || ind.indentNo || ind.id,
              vendorName: ind.supplier?.name || ind.department || 'Finance Request',
              grandTotal: ind.totalEstimatedAmount || ind.estimatedAmount || 0,
              isIndentOnly: true,
            });
          }
        }
      }
    });
    return Array.from(unique.values());
  }, [queueLoaded, directBackendPOs, serverIndents]);
  const approvedPOs = historyPOs.filter(i => ['SUPER_ADMIN_APPROVED', 'ORDERED', 'PO_ISSUED', 'VENDOR_ACCEPTED', 'IN_TRANSIT', 'PARTIALLY_RECEIVED', 'PURCHASE_COMPLETED', 'PO_CLOSED', 'CLOSED'].includes(i.status));
  const rejectedPOs = historyPOs.filter(i => ['SUPER_ADMIN_REJECTED', 'REJECTED', 'RETURNED', 'VENDOR_REJECTED'].includes(i.status));

  const handleApprove = (po) => {
    Swal.fire({
      title: 'Approve Purchase Order?',
      text: `Are you sure you want to approve Draft PO ${po.id} for Vendor: ${po.vendorName}? Grand Total: ₹${po.grandTotal?.toLocaleString() || '0'}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#5E6B82',
      confirmButtonText: 'Yes, Approve PO!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsSaving(true);
          const updated = await approvePurchaseOrder(po.id, 'Approved by Super Admin after review.', user?.name || 'Super Admin');
          if (updated?.status !== 'SUPER_ADMIN_APPROVED') {
            throw new Error('Approval was not persisted. The purchase order is still pending.');
          }
          await refreshQueue();
          showToast('Purchase Order approved successfully and sent to Finance for final issuance.', 'success');
        } catch (error) {
          showToast(`Error approving PO: ${error.message || 'Unknown error'}`, 'error');
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const handleReject = (po) => {
    Swal.fire({
      title: 'Reject Purchase Order?',
      text: `Are you sure you want to reject Draft PO ${po.id}? It will be returned to Finance for correction.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#5E6B82',
      confirmButtonText: 'Yes, Reject PO!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsSaving(true);
          const updated = await rejectPurchaseOrder(po.id, 'Rejected by Super Admin during review. Please revise.', user?.name || 'Super Admin');
          if (updated?.status !== 'SUPER_ADMIN_REJECTED') {
            throw new Error('Rejection was not persisted. The purchase order is still pending.');
          }
          await refreshQueue();
          showToast('Purchase Order rejected and returned to Finance with remarks.', 'success');
        } catch (error) {
          showToast(`Error rejecting PO: ${error.message || 'Unknown error'}`, 'error');
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const columns = [
    {
      header: 'PO Draft ID',
      accessor: 'id',
      cell: ({ row }) => (
        <span style={{ fontWeight: 800, color: '#24345C', fontSize: '14px' }}>
          {row.original.id}
        </span>
      )
    },
    {
      header: 'Indent Ref',
      accessor: 'indentId',
      cell: ({ row }) => (
        <span style={{ fontWeight: 700, color: '#0284c7', fontSize: '13px', background: '#f0f9ff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
          {row.original.purchaseIndent?.publicId || row.original.purchaseIndentId || row.original.indentId || row.original.poNumber || 'PI-REF'}
        </span>
      )
    },
    {
      header: 'Vendor',
      accessor: 'vendorName',
      cell: ({ row }) => (
        <span style={{ fontWeight: 700, color: '#334155' }}>
          {row.original.supplier?.name || row.original.vendorName || 'Vendor'}
        </span>
      )
    },
    {
      header: 'Grand Total',
      align: 'right',
      cell: ({ row }) => {
        const freightVal = Number(row.original.freight || 0);
        let calculatedSubtotal = 0;
        let calculatedGst = 0;
        if (row.original.items && row.original.items.length > 0) {
          row.original.items.forEach(item => {
            const qty = Number(item.quantity || 0);
            const rate = Number(item.unitPrice || item.rate || 0);
            const gst = Number(item.gstPercent || item.tax || 18);
            const base = qty * rate;
            calculatedSubtotal += base;
            calculatedGst += base * (gst / 100);
          });
        }
        const subVal = calculatedSubtotal > 0 ? calculatedSubtotal : Number(row.original.subtotal || 0);
        const gstVal = calculatedGst > 0 ? calculatedGst : (row.original.gstAmount !== undefined && row.original.gstAmount !== null ? Number(row.original.gstAmount) : Math.round(subVal * 0.18));
        const grandVal = Number(row.original.totalAmount || row.original.grandTotal) || (subVal + gstVal + freightVal + Number(row.original.otherCharges || 0));

        return (
          <span style={{ fontWeight: 800, color: '#24345C', fontSize: '15px' }}>
            {grandVal ? `₹${grandVal.toLocaleString()}` : '₹0'}
          </span>
        );
      }
    },
    {
      header: 'Date',
      cell: ({ row }) => (
        <span style={{ color: '#5E6B82', fontSize: '13px', fontWeight: 600 }}>
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      header: 'Status',
      cell: ({ row }) => {
        const s = row.original.status;
        if (s === 'PENDING_SUPER_ADMIN_APPROVAL') return <StatusBadge status="Pending Approval" type="warning" />;
        if (s === 'SUPER_ADMIN_APPROVED') return <StatusBadge status="Approved" type="success" />;
        if (s === 'SUPER_ADMIN_REJECTED') return <StatusBadge status="Rejected" type="danger" />;
        if (s === 'PO_ISSUED') return <StatusBadge status="PO Issued" type="info" />;
        if (s === 'VENDOR_ACCEPTED') return <StatusBadge status="Vendor Accepted" type="success" />;
        return <StatusBadge status={s} type="default" />;
      }
    }
  ];

  return (
    <div className="super-dashboard purchase-indents-wrapper" style={{ width: '100%', margin: '0 auto', fontFamily: `'Inter', -apple-system, sans-serif`, boxSizing: 'border-box' }}>
      <style>{`
        .purchase-indents-wrapper {
          padding: 24px;
        }
        .po-header-card {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          background: #1e293b;
          background-color: #1a2942;
          padding: 24px 30px;
          border-radius: 16px;
          color: #ffffff;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.2);
        }
        .po-header-stats {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .po-stat-box {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 10px 18px;
          border-radius: 10px;
          text-align: center;
          min-width: 110px;
        }
        .po-tab-bar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .po-tab-btn {
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.15s;
        }
        .po-card-grid {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 16px;
        }
        .po-mobile-item-card {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          padding: 18px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .po-field-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f1f5f9;
        }
        .po-field-row:last-of-type {
          border-bottom: none;
          padding-bottom: 0;
        }
        .po-field-label {
          font-size: 11px;
          font-weight: 750;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .po-field-value {
          font-size: 14px;
          font-weight: 800;
          color: #1e293b;
        }
        .po-actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 4px;
        }
        .po-action-btn {
          padding: 10px 8px;
          border-radius: 8px;
          border: none;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
        }

        @media (max-width: 768px) {
          .purchase-indents-wrapper {
            padding: 12px !important;
          }
          .po-header-card {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 18px 16px !important;
            gap: 16px !important;
          }
          .po-header-stats {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
            width: 100% !important;
          }
          .po-stat-box {
            width: 100% !important;
            min-width: 0 !important;
            padding: 10px 12px !important;
          }
          .po-tab-bar {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          .po-tab-btn:nth-child(3) {
            grid-column: span 2 !important;
          }
          .po-modal-container {
            width: 100% !important;
            max-height: 92vh !important;
            margin: 8px !important;
          }
          .po-modal-body {
            padding: 16px !important;
          }
          .po-modal-summary-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .po-modal-footer {
            flex-direction: column-reverse !important;
            gap: 10px !important;
            padding: 14px 16px !important;
          }
          .po-modal-footer button,
          .po-modal-footer .po-modal-footer-actions {
            width: 100% !important;
          }
          .po-modal-footer .po-modal-footer-actions {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
        }

        @media (max-width: 480px) {
          .purchase-indents-wrapper {
            padding: 8px !important;
          }
        }
      `}</style>

      {/* Premium Dark Header */}
      <div className="po-header-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59, 174, 235, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileCheck size={24} color="#3BAEEB" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>Purchase Order Approval</h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>Review, approve, or reject draft purchase orders submitted by Finance</p>
          </div>
        </div>

        <div className="po-header-stats">
          <div className="po-stat-box">
            <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Pending Review</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#facc15', marginTop: '2px' }}>{pendingPOs.length}</div>
          </div>
          <div className="po-stat-box">
            <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Approved POs</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#22c55e', marginTop: '2px' }}>{approvedPOs.length}</div>
          </div>
        </div>
      </div>

      {/* Clean Responsive Tab Bar */}
      <div className="po-tab-bar">
        {[
          { key: 'Pending Approval', label: 'Pending Approval', count: pendingPOs.length, color: '#facc15' },
          { key: 'Approved', label: 'Approved History', count: approvedPOs.length, color: '#16a34a' },
          { key: 'Rejected', label: 'Rejected Orders', count: rejectedPOs.length, color: '#dc2626' }
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="po-tab-btn"
              style={{
                border: isActive ? '2px solid #1a2942' : '1px solid #D6E2F0',
                background: isActive ? '#1a2942' : '#ffffff',
                color: isActive ? '#ffffff' : '#475569',
              }}
            >
              {tab.label}
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#475569',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11.5px',
                fontWeight: 700
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Responsive Table & Mobile Cards Container */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE5F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #DCE5F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
            {activeTab === 'Pending Approval' ? 'Draft POs Requiring Your Approval' : activeTab === 'Approved' ? 'Previously Approved Purchase Orders' : 'Rejected Orders'}
          </h2>
        </div>

        {/* Desktop View Table */}
        <div className="desktop-only erp-table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 20px 24px' }}>
          <DataTable
            columns={columns}
            data={
              activeTab === 'Pending Approval' ? pendingPOs :
                activeTab === 'Approved' ? approvedPOs :
                  rejectedPOs
            }
            actions={(row) => (
              <div className={styles.actionButtons}>
                <button
                  onClick={() => setSelectedPO(row)}
                  className={`${styles.actionButton} ${styles.viewButton}`}
                  title="View Details"
                >
                  <Eye size={15} /> View
                </button>

                {activeTab === 'Pending Approval' && (
                  <>
                    <button
                      onClick={() => handleApprove(row)}
                      disabled={isSaving}
                      className={`${styles.actionButton} ${styles.approveButton}`}
                      title="Approve Draft PO"
                    >
                      <CheckCircle size={15} /> Approve
                    </button>

                    <button
                      onClick={() => handleReject(row)}
                      disabled={isSaving}
                      className={`${styles.actionButton} ${styles.rejectButton}`}
                      title="Reject Draft PO"
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </>
                )}
              </div>
            )}
          />
        </div>

        {/* Mobile View Dedicated Horizontal Cards */}
        <div className="mobile-only po-card-grid">
          {(() => {
            const dataList = activeTab === 'Pending Approval' ? pendingPOs : activeTab === 'Approved' ? approvedPOs : rejectedPOs;
            if (dataList.length === 0) {
              return (
                <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b', fontSize: '13.5px' }}>
                  No {activeTab.toLowerCase()} records found.
                </div>
              );
            }

            return dataList.map((po) => {
              const freightVal = Number(po.freight || 0);
              let calculatedSubtotal = 0;
              let calculatedGst = 0;
              if (po.items && po.items.length > 0) {
                po.items.forEach(item => {
                  const qty = Number(item.quantity || 0);
                  const rate = Number(item.unitPrice || item.rate || 0);
                  const gst = Number(item.gstPercent || item.tax || 18);
                  const base = qty * rate;
                  calculatedSubtotal += base;
                  calculatedGst += base * (gst / 100);
                });
              }
              const subVal = calculatedSubtotal > 0 ? calculatedSubtotal : Number(po.subtotal || 0);
              const gstVal = calculatedGst > 0 ? calculatedGst : (po.gstAmount !== undefined && po.gstAmount !== null ? Number(po.gstAmount) : Math.round(subVal * 0.18));
              const grandVal = Number(po.totalAmount || po.grandTotal) || (subVal + gstVal + freightVal + Number(po.otherCharges || 0));
              const indentRef = po.purchaseIndent?.publicId || po.purchaseIndentId || po.indentId || po.poNumber || 'PI-REF';
              const vendor = po.supplier?.name || po.vendorName || 'STORE';
              const dateStr = po.createdAt ? new Date(po.createdAt).toLocaleDateString('en-US') : (po.date || '8/22/2026');

              return (
                <div key={po.id} className="po-mobile-item-card">
                  {/* PO Draft ID */}
                  <div className="po-field-row">
                    <span className="po-field-label">PO DRAFT ID</span>
                    <span className="po-field-value" style={{ wordBreak: 'break-all', color: '#1e3a8a', fontSize: '14.5px' }}>{po.id}</span>
                  </div>

                  {/* Indent Ref */}
                  <div className="po-field-row">
                    <span className="po-field-label">INDENT REF</span>
                    <div>
                      <span style={{
                        display: 'inline-block',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        border: '1px solid #bae6fd',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '12.5px',
                        fontWeight: 700
                      }}>
                        {indentRef}
                      </span>
                    </div>
                  </div>

                  {/* Vendor */}
                  <div className="po-field-row">
                    <span className="po-field-label">VENDOR</span>
                    <span className="po-field-value">{vendor}</span>
                  </div>

                  {/* Grand Total */}
                  <div className="po-field-row">
                    <span className="po-field-label">GRAND TOTAL</span>
                    <span className="po-field-value" style={{ fontSize: '16px', color: '#0f172a' }}>
                      {grandVal ? `₹${grandVal.toLocaleString()}` : '₹0'}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="po-field-row">
                    <span className="po-field-label">DATE</span>
                    <span className="po-field-value" style={{ color: '#475569', fontWeight: 600 }}>{dateStr}</span>
                  </div>

                  {/* Status */}
                  <div className="po-field-row">
                    <span className="po-field-label">STATUS</span>
                    <div>
                      {(() => {
                        const s = po.status;
                        if (s === 'PENDING_SUPER_ADMIN_APPROVAL' || s === 'PENDING_APPROVAL' || s === 'SUBMITTED' || s === 'DRAFT' || !s) {
                          return (
                            <span style={{
                              display: 'inline-block',
                              background: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #fde68a',
                              borderRadius: '6px',
                              padding: '3px 10px',
                              fontSize: '12px',
                              fontWeight: 700
                            }}>
                              Pending Approval
                            </span>
                          );
                        }
                        if (s === 'SUPER_ADMIN_APPROVED' || s === 'APPROVED' || s === 'PO_ISSUED') {
                          return (
                            <span style={{
                              display: 'inline-block',
                              background: '#dcfce7',
                              color: '#166534',
                              border: '1px solid #bbf7d0',
                              borderRadius: '6px',
                              padding: '3px 10px',
                              fontSize: '12px',
                              fontWeight: 700
                            }}>
                              Approved
                            </span>
                          );
                        }
                        return <StatusBadge status={s} type="default" />;
                      })()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' }}>
                    <span className="po-field-label">ACTIONS</span>
                    <div className="po-actions-grid">
                      <button
                        onClick={() => setSelectedPO(po)}
                        className="po-action-btn"
                        style={{ background: '#2563eb' }}
                      >
                        <Eye size={15} /> View
                      </button>

                      {activeTab === 'Pending Approval' && (
                        <>
                          <button
                            onClick={() => handleApprove(po)}
                            disabled={isSaving}
                            className="po-action-btn"
                            style={{ background: '#16a34a' }}
                          >
                            <CheckCircle size={15} /> Approve
                          </button>

                          <button
                            onClick={() => handleReject(po)}
                            disabled={isSaving}
                            className="po-action-btn"
                            style={{ background: '#dc2626' }}
                          >
                            <XCircle size={15} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Premium Light Theme Details Modal */}
      {selectedPO && (() => {
        const freightVal = Number(selectedPO.freight || 0);

        let calculatedSubtotal = 0;
        let calculatedGst = 0;
        if (selectedPO.items && selectedPO.items.length > 0) {
          selectedPO.items.forEach(item => {
            const qty = Number(item.quantity || 0);
            const rate = Number(item.unitPrice || item.rate || 0);
            const gst = Number(item.gstPercent || item.tax || 18);
            const base = qty * rate;
            calculatedSubtotal += base;
            calculatedGst += base * (gst / 100);
          });
        }

        const subVal = calculatedSubtotal > 0 ? calculatedSubtotal : Number(selectedPO.subtotal || 0);
        const gstVal = calculatedGst > 0 ? calculatedGst : (selectedPO.gstAmount !== undefined && selectedPO.gstAmount !== null ? Number(selectedPO.gstAmount) : Math.round(subVal * 0.18));
        const grandVal = Number(selectedPO.totalAmount || selectedPO.grandTotal) || (subVal + gstVal + freightVal + Number(selectedPO.otherCharges || 0));

        return (
          <div
            onClick={() => setSelectedPO(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="po-modal-container"
              style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '820px', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #D6E2F0', overflow: 'hidden' }}
            >
              {/* Light Theme Modal Header */}
              <div style={{ background: '#F5FAFE', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #DCE5F0', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bae6fd', flexShrink: 0 }}>
                    <FileCheck size={22} color="#0284c7" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.01em', wordBreak: 'break-all' }}>
                      Purchase Order Details ({selectedPO.id})
                    </h2>
                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '3px', fontWeight: 600 }}>
                      Indent Ref: <span style={{ color: '#0284c7', background: '#f0f9ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bae6fd', marginLeft: '4px' }}>{selectedPO.indentId || selectedPO.poNumber || 'PI-REF'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPO(null)}
                  style={{ background: '#ffffff', border: '1px solid #D6E2F0', color: '#64748b', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Light Theme Modal Body */}
              <div className="po-modal-body" style={{ padding: '22px 24px', overflowY: 'auto', flex: 1, background: '#ffffff' }}>
                <div className="po-modal-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  {/* Vendor Info Card */}
                  <div style={{ background: '#F5FAFE', padding: '16px 18px', borderRadius: '14px', border: '1px solid #DCE5F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '12.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building size={16} color="#0284c7" /> Vendor Information
                    </h3>
                    <div style={{ display: 'grid', gap: '8px', fontSize: '13.5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b', fontWeight: 600 }}>Vendor Name:</span> <strong style={{ color: '#1e293b' }}>{selectedPO.supplier?.name || selectedPO.vendorName || 'STORE'}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b', fontWeight: 600 }}>Payment Terms:</span> <strong style={{ color: '#1e293b' }}>{selectedPO.paymentTerms || 'Standard 30 Days Net'}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b', fontWeight: 600 }}>Expected Date:</span> <strong style={{ color: '#1e293b' }}>{selectedPO.expectedDeliveryDate ? new Date(selectedPO.expectedDeliveryDate).toLocaleDateString() : (selectedPO.expectedDate || '-')}</strong></div>
                    </div>
                  </div>

                  {/* Financial Summary Card */}
                  <div style={{ background: '#F5FAFE', padding: '16px 18px', borderRadius: '14px', border: '1px solid #DCE5F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '12.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarSign size={16} color="#16a34a" /> Financial Summary
                    </h3>
                    <div style={{ display: 'grid', gap: '8px', fontSize: '13.5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Subtotal:</span>
                        <strong style={{ color: '#1e293b' }}>₹{subVal.toLocaleString()}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>GST ({selectedPO.gst || 18}%):</span>
                        <strong style={{ color: '#1e293b' }}>₹{gstVal.toLocaleString()}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Freight:</span>
                        <strong style={{ color: '#1e293b' }}>₹{freightVal.toLocaleString()}</strong>
                      </div>
                      <div style={{ borderTop: '1.5px solid #D6E2F0', paddingTop: '8px', marginTop: '2px', display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, color: '#16a34a' }}>
                        <span>Grand Total:</span>
                        <span>₹{grandVal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                {selectedPO.items && selectedPO.items.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={16} color="#0284c7" /> Material Items ({selectedPO.items.length})
                    </h3>
                    <div style={{ border: '1px solid #DCE5F0', borderRadius: '12px', overflowX: 'auto', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px', minWidth: '400px' }}>
                        <thead style={{ background: '#F5FAFE', borderBottom: '1px solid #DCE5F0', color: '#475569', fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          <tr>
                            <th style={{ padding: '12px 16px' }}>Material Name</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Quantity</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Unit Rate</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPO.items.map((item, idx) => {
                            const rate = Number(item.unitPrice || item.rate || 0);
                            const qty = Number(item.quantity || 0);
                            return (
                              <tr key={idx} style={{ borderBottom: idx < selectedPO.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1e293b' }}>{item.product?.name || item.name || item.material || 'Material'}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>{qty} {item.product?.unit || item.unit || 'Units'}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>₹{rate.toLocaleString()}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#1e293b' }}>₹{(qty * rate).toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Light Theme Modal Footer with Actions */}
              <div className="po-modal-footer" style={{ background: '#F5FAFE', padding: '16px 24px', borderTop: '1px solid #DCE5F0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setSelectedPO(null)}
                  style={{ padding: '10px 22px', border: '1.5px solid #D6E2F0', background: '#ffffff', color: '#475569', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Close
                </button>

                {activeTab === 'Pending Approval' && (
                  <div className="po-modal-footer-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <button
                      onClick={() => {
                        const poCopy = selectedPO;
                        setSelectedPO(null);
                        handleReject(poCopy);
                      }}
                      style={{ padding: '10px 22px', border: 'none', background: '#ef4444', color: '#ffffff', borderRadius: '10px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)' }}
                    >
                      <XCircle size={16} /> Reject PO
                    </button>
                    <button
                      onClick={() => {
                        const poCopy = selectedPO;
                        setSelectedPO(null);
                        handleApprove(poCopy);
                      }}
                      style={{ padding: '10px 24px', border: 'none', background: '#22C55E', color: '#ffffff', borderRadius: '10px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }}
                    >
                      <CheckCircle size={16} /> Approve PO
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

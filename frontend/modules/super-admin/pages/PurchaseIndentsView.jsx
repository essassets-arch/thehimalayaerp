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
    <div style={{ width: '100%', margin: '0 auto', padding: '24px', fontFamily: `'Inter', -apple-system, sans-serif` }}>
      {/* Premium Dark Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px', background: '#24345C', padding: '24px 30px', borderRadius: '16px', color: '#ffffff', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 174, 235, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={26} color="#3BAEEB" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>Purchase Order Approval</h1>
            <p style={{ fontSize: '14px', color: '#8893A7', margin: '4px 0 0 0' }}>Review, approve, or reject draft purchase orders submitted by Finance</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#8893A7', textTransform: 'uppercase', fontWeight: 700 }}>Pending Review</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#facc15' }}>{pendingPOs.length}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#8893A7', textTransform: 'uppercase', fontWeight: 700 }}>Approved POs</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#22C55E' }}>{approvedPOs.length}</div>
          </div>
        </div>
      </div>

      {/* Clean Responsive Tab Bar */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px', borderBottom: '2px solid #DCE5F0', paddingBottom: '12px' }}>
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
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: isActive ? '2px solid #24345C' : '1px solid #D6E2F0',
                background: isActive ? '#24345C' : '#ffffff',
                color: isActive ? '#ffffff' : '#475569',
                fontWeight: isActive ? 800 : 600,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#475569',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Responsive Table Card */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #DCE5F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #DCE5F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#24345C', margin: 0 }}>
            {activeTab === 'Pending Approval' ? 'Draft POs Requiring Your Approval' : activeTab === 'Approved' ? 'Previously Approved Purchase Orders' : 'Rejected Orders'}
          </h2>
        </div>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 24px 24px' }}>
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
              style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '820px', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #D6E2F0', overflow: 'hidden' }}
            >
              {/* Light Theme Modal Header */}
              <div style={{ background: '#F5FAFE', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #DCE5F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bae6fd' }}>
                    <FileCheck size={24} color="#0284c7" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#24345C', margin: 0, letterSpacing: '-0.01em' }}>Purchase Order Details ({selectedPO.id})</h2>
                    <div style={{ fontSize: '13px', color: '#5E6B82', marginTop: '3px', fontWeight: 600 }}>
                      Indent Ref: <span style={{ color: '#0284c7', background: '#f0f9ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bae6fd', marginLeft: '4px' }}>{selectedPO.indentId || selectedPO.poNumber || 'PI-REF'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPO(null)}
                  style={{ background: '#ffffff', border: '1px solid #D6E2F0', color: '#5E6B82', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Light Theme Modal Body */}
              <div style={{ padding: '26px 28px', overflowY: 'auto', flex: 1, background: '#ffffff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                  {/* Vendor Info Card */}
                  <div style={{ background: '#F5FAFE', padding: '20px', borderRadius: '14px', border: '1px solid #DCE5F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building size={16} color="#0284c7" /> Vendor Information
                    </h3>
                    <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5E6B82', fontWeight: 600 }}>Vendor Name:</span> <strong style={{ color: '#24345C' }}>{selectedPO.supplier?.name || selectedPO.vendorName || 'Vendor'}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5E6B82', fontWeight: 600 }}>Payment Terms:</span> <strong style={{ color: '#24345C' }}>{selectedPO.paymentTerms || 'Standard 30 Days Net'}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#5E6B82', fontWeight: 600 }}>Expected Date:</span> <strong style={{ color: '#24345C' }}>{selectedPO.expectedDeliveryDate ? new Date(selectedPO.expectedDeliveryDate).toLocaleDateString() : (selectedPO.expectedDate || '-')}</strong></div>
                    </div>
                  </div>

                  {/* Financial Summary Card */}
                  <div style={{ background: '#F5FAFE', padding: '20px', borderRadius: '14px', border: '1px solid #DCE5F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarSign size={16} color="#16a34a" /> Financial Summary
                    </h3>
                    <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#5E6B82', fontWeight: 600 }}>Subtotal:</span>
                        <strong style={{ color: '#24345C' }}>₹{subVal.toLocaleString()}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#5E6B82', fontWeight: 600 }}>GST ({selectedPO.gst || 18}%):</span>
                        <strong style={{ color: '#24345C' }}>₹{gstVal.toLocaleString()}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#5E6B82', fontWeight: 600 }}>Freight:</span>
                        <strong style={{ color: '#24345C' }}>₹{freightVal.toLocaleString()}</strong>
                      </div>
                      <div style={{ borderTop: '1.5px solid #D6E2F0', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>
                        <span>Grand Total:</span>
                        <span>₹{grandVal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                {selectedPO.items && selectedPO.items.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#24345C', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={17} color="#0284c7" /> Material Items ({selectedPO.items.length})
                    </h3>
                    <div style={{ border: '1px solid #DCE5F0', borderRadius: '12px', overflowX: 'auto', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', minWidth: '450px' }}>
                        <thead style={{ background: '#F5FAFE', borderBottom: '1px solid #DCE5F0', color: '#475569', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          <tr>
                            <th style={{ padding: '14px 18px' }}>Material Name</th>
                            <th style={{ padding: '14px 18px', textAlign: 'right' }}>Quantity</th>
                            <th style={{ padding: '14px 18px', textAlign: 'right' }}>Unit Rate</th>
                            <th style={{ padding: '14px 18px', textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPO.items.map((item, idx) => {
                            const rate = Number(item.unitPrice || item.rate || 0);
                            const qty = Number(item.quantity || 0);
                            return (
                              <tr key={idx} style={{ borderBottom: idx < selectedPO.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                <td style={{ padding: '14px 18px', fontWeight: 700, color: '#24345C' }}>{item.product?.name || item.name || item.material || 'Material'}</td>
                                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>{qty} {item.product?.unit || item.unit || 'Units'}</td>
                                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>₹{rate.toLocaleString()}</td>
                                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, color: '#24345C' }}>₹{(qty * rate).toLocaleString()}</td>
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
              <div style={{ background: '#F5FAFE', padding: '18px 28px', borderTop: '1px solid #DCE5F0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
                <button
                  onClick={() => setSelectedPO(null)}
                  style={{ padding: '11px 24px', border: '1.5px solid #D6E2F0', background: '#ffffff', color: '#475569', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                >
                  Close
                </button>

                {activeTab === 'Pending Approval' && selectedPO.status === 'PENDING_SUPER_ADMIN_APPROVAL' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <button
                      onClick={() => {
                        const poCopy = selectedPO;
                        setSelectedPO(null);
                        handleReject(poCopy);
                      }}
                      style={{ padding: '11px 24px', border: 'none', background: '#ef4444', color: '#ffffff', borderRadius: '10px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)', transition: 'all 0.15s' }}
                    >
                      <XCircle size={18} /> Reject PO
                    </button>
                    <button
                      onClick={() => {
                        const poCopy = selectedPO;
                        setSelectedPO(null);
                        handleApprove(poCopy);
                      }}
                      style={{ padding: '11px 28px', border: 'none', background: '#22C55E', color: '#ffffff', borderRadius: '10px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)', transition: 'all 0.15s' }}
                    >
                      <CheckCircle size={18} /> Approve PO
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

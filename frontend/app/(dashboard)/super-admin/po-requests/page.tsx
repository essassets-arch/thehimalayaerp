'use client';

import React, { useState, useMemo } from 'react';
import { ShoppingBag } from 'lucide-react';
import { PageSearchInput } from '@/components/GlobalUIComponents';
import { useERPStore } from '@/store/erpStore';
import Swal from 'sweetalert2';
import '@/components/erp-premium-ui.css';

const EMPTY_PURCHASE_ORDERS: any[] = [];

export default function SuperAdminPORequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPOForModal, setSelectedPOForModal] = useState<any | null>(null);
  const [modalAction, setModalAction] = useState<'APPROVE' | 'RETURN' | 'REJECT' | null>(null);
  const [remarks, setRemarks] = useState('');

  const purchaseOrders = useERPStore(
    (state: any) => state.procurement?.purchaseOrders ?? EMPTY_PURCHASE_ORDERS
  );

  const approvePurchaseOrder = useERPStore((state: any) => state.approvePurchaseOrder);
  const returnPurchaseOrder = useERPStore((state: any) => state.returnPurchaseOrder);
  const rejectPurchaseOrder = useERPStore((state: any) => state.rejectPurchaseOrder);

  const pendingPurchaseOrders = useMemo(
    () =>
      purchaseOrders.filter(
        (po: any) => po.status === 'PENDING_SUPER_ADMIN_APPROVAL'
      ),
    [purchaseOrders]
  );

  const allPurchaseOrders = useMemo(
    () => purchaseOrders,
    [purchaseOrders]
  );

  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return allPurchaseOrders;
    return allPurchaseOrders.filter((po: any) =>
      (po.id || '').toLowerCase().includes(query) ||
      (po.vendorName || '').toLowerCase().includes(query) ||
      (po.indentId || '').toLowerCase().includes(query) ||
      (po.items || []).some((it: any) =>
        (it.materialName || '').toLowerCase().includes(query) ||
        (it.materialId || '').toLowerCase().includes(query)
      )
    );
  }, [allPurchaseOrders, searchQuery]);

  const handleOpenActionModal = (po: any, action: 'APPROVE' | 'RETURN' | 'REJECT') => {
    setSelectedPOForModal(po);
    setModalAction(action);
    setRemarks(action === 'APPROVE' ? 'Approved by Super Admin' : '');
  };

  const handleConfirmAction = () => {
    if (!selectedPOForModal || !modalAction) return;

    if ((modalAction === 'RETURN' || modalAction === 'REJECT') && !remarks.trim()) {
      Swal.fire({
        title: 'Remarks Required',
        text: `Please enter mandatory remarks to ${modalAction.toLowerCase()} this Purchase Order.`,
        icon: 'warning',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    try {
      if (modalAction === 'APPROVE') {
        approvePurchaseOrder(selectedPOForModal.id, remarks || 'Approved by Super Admin', 'Super Admin');
        Swal.fire({
          title: 'PO Approved',
          text: `Purchase Order ${selectedPOForModal.id} has been approved. Finance can now issue the PO.`,
          icon: 'success',
          confirmButtonColor: '#22c55e'
        });
      } else if (modalAction === 'RETURN') {
        returnPurchaseOrder(selectedPOForModal.id, remarks, 'Super Admin');
        Swal.fire({
          title: 'PO Returned',
          text: `Purchase Order ${selectedPOForModal.id} returned for correction to Finance.`,
          icon: 'info',
          confirmButtonColor: '#f59e0b'
        });
      } else if (modalAction === 'REJECT') {
        rejectPurchaseOrder(selectedPOForModal.id, remarks, 'Super Admin');
        Swal.fire({
          title: 'PO Rejected',
          text: `Purchase Order ${selectedPOForModal.id} rejected.`,
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }

      setSelectedPOForModal(null);
      setModalAction(null);
      setRemarks('');
    } catch (err: any) {
      Swal.fire({
        title: 'Action Failed',
        text: err.message || 'An error occurred during status update.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <div className="erp-page-container">
      <div className="erp-header-card">
        <div className="erp-header-title-group">
          <h2 className="erp-header-title">
            <ShoppingBag style={{ width: 24, height: 24, color: '#4f46e5' }} />
            Super Admin → Purchase Order Approval Desk
          </h2>
          <p className="erp-header-subtitle">Review commercial terms, GST, freight, and vendor details for submitted Purchase Orders.</p>
        </div>

        <PageSearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search PO ID, Indent, Vendor..." />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="erp-table-card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>PENDING APPROVAL</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b' }}>{pendingPurchaseOrders.length}</div>
        </div>
        <div className="erp-table-card" style={{ padding: '16px', borderLeft: '4px solid #22c55e' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>APPROVED POS</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e' }}>
            {allPurchaseOrders.filter((p: any) => p.status === 'SUPER_ADMIN_APPROVED' || p.status === 'PO_ISSUED' || p.status === 'PO_CLOSED').length}
          </div>
        </div>
        <div className="erp-table-card" style={{ padding: '16px', borderLeft: '4px solid #6366f1' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>TOTAL POs RECORDED</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e1b4b' }}>{allPurchaseOrders.length}</div>
        </div>
      </div>

      <div className="erp-table-card">
        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>PO ID</th>
                <th>Indent ID</th>
                <th>Vendor</th>
                <th>Items & Quantities</th>
                <th>Subtotal</th>
                <th>GST % / Amt</th>
                <th>Freight</th>
                <th>Grand Total</th>
                <th>Exp. Delivery</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    No purchase orders found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((po: any) => {
                  const firstItem = (po.items && po.items[0]) || {};
                  const itemCount = (po.items || []).length;
                  const itemSummary = itemCount > 1
                    ? `${firstItem.materialName || firstItem.name || 'Item'} (+${itemCount - 1} more)`
                    : `${firstItem.materialName || firstItem.name || 'Item'} (${firstItem.orderedQuantity || firstItem.quantity || 0} ${firstItem.unit || 'PCS'})`;

                  const isPending = po.status === 'PENDING_SUPER_ADMIN_APPROVAL';

                  return (
                    <tr key={po.id} style={{ background: isPending ? '#fffbe6' : undefined }}>
                      <td style={{ fontWeight: 800, color: '#1e1b4b' }}>{po.id}</td>
                      <td style={{ fontWeight: 600, color: '#4f46e5' }}>{po.indentId || '-'}</td>
                      <td style={{ fontWeight: 700, color: '#1e293b' }}>{po.vendorName || 'Vendor'}</td>
                      <td style={{ color: '#334155' }}>
                        <div>{itemSummary}</div>
                        {firstItem.unitRate !== undefined && (
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Rate: ₹{Number(firstItem.unitRate).toLocaleString('en-IN')}/{firstItem.unit || 'PCS'}</div>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{Number(po.subtotal || 0).toLocaleString('en-IN')}</td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>
                        {po.gstPercent || 18}% (₹{Number(po.gstAmount || 0).toLocaleString('en-IN')})
                      </td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>₹{Number(po.freight || 0).toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 800, color: '#1e1b4b' }}>₹{Number(po.grandTotal || 0).toLocaleString('en-IN')}</td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>{po.expectedDeliveryDate || po.expectedDate || '-'}</td>
                      <td>
                        <span className={`erp-badge ${
                          po.status === 'SUPER_ADMIN_APPROVED' || po.status === 'PO_ISSUED' || po.status === 'PO_CLOSED' ? 'erp-badge-green' :
                          po.status === 'CORRECTION_REQUIRED' ? 'erp-badge-yellow' :
                          po.status === 'SUPER_ADMIN_REJECTED' ? 'erp-badge-red' : 'erp-badge-orange'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isPending ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => handleOpenActionModal(po, 'APPROVE')}
                              className="erp-btn erp-btn-sm erp-btn-success"
                              type="button"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenActionModal(po, 'RETURN')}
                              className="erp-btn erp-btn-sm"
                              style={{ background: '#f59e0b', color: '#ffffff' }}
                              type="button"
                            >
                              Return
                            </button>
                            <button
                              onClick={() => handleOpenActionModal(po, 'REJECT')}
                              className="erp-btn erp-btn-sm erp-btn-danger"
                              type="button"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {po.status === 'PO_ISSUED' ? 'Issued' : po.status === 'PO_CLOSED' ? 'Closed' : po.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Dialog Modal */}
      {selectedPOForModal && modalAction && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 800, color: '#1e1b4b' }}>
              {modalAction === 'APPROVE' && 'Approve Purchase Order'}
              {modalAction === 'RETURN' && 'Return PO for Correction'}
              {modalAction === 'REJECT' && 'Reject Purchase Order'}
            </h3>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
              <div><strong>PO ID:</strong> {selectedPOForModal.id} (Indent: {selectedPOForModal.indentId})</div>
              <div><strong>Vendor:</strong> {selectedPOForModal.vendorName}</div>
              <div><strong>Grand Total:</strong> ₹{Number(selectedPOForModal.grandTotal || 0).toLocaleString('en-IN')}</div>
              <div><strong>Payment Terms:</strong> {selectedPOForModal.paymentTerms || 'Standard'}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Remarks {modalAction !== 'APPROVE' && <span style={{ color: '#ef4444' }}>*</span>}
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                placeholder={modalAction === 'APPROVE' ? 'Optional approval remarks...' : 'Enter mandatory reasons for return/rejection...'}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => { setSelectedPOForModal(null); setModalAction(null); setRemarks(''); }}
                className="erp-btn erp-btn-secondary"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`erp-btn ${
                  modalAction === 'APPROVE' ? 'erp-btn-success' :
                  modalAction === 'RETURN' ? 'erp-btn-warning' : 'erp-btn-danger'
                }`}
                type="button"
                style={modalAction === 'RETURN' ? { background: '#f59e0b', color: '#ffffff' } : undefined}
              >
                Confirm {modalAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useERPStore } from '../../../store/erpStore';
import { approveGoodsReceiptNote, returnGRN, closePurchaseOrder } from '../../../store/procurementActions';
import { ProcurementStatusBadge } from '../components/ProcurementStatusBadge';
import DataTable from '../../../shared/components/DataTable';
import { FileCheck, ShieldCheck, CornerUpLeft, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

const CSS = `
  .da-wrapper {
    background: #fff;
    border: 1px solid #E4E7EC;
    border-radius: 16px;
    padding: 24px;
  }

  /* ── Page header ── */
  .da-page-header {
    padding-bottom: 20px;
    border-bottom: 1px solid #E4E7EC;
    margin-bottom: 24px;
  }
  .da-page-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #101828;
  }
  .da-page-header p {
    margin: 4px 0 0;
    font-size: 14px;
    color: #667085;
  }

  /* ── Card list ── */
  .da-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ── Individual card ── */
  .da-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 20px 24px;
    border: 1px solid #E4E7EC;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 1px 4px rgba(16,24,40,.06);
    cursor: pointer;
    transition: box-shadow .2s, border-color .2s;
  }
  .da-card:hover {
    border-color: #2957FF;
    box-shadow: 0 4px 16px rgba(41,87,255,.12);
  }

  /* ── Card info (left) ── */
  .da-info {
    flex: 1;
    min-width: 0;
  }
  .da-info h3 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 700;
    color: #101828;
    word-break: break-word;
    overflow-wrap: anywhere;
    line-height: 1.3;
  }
  .da-info p {
    margin: 4px 0;
    font-size: 14px;
    color: #475467;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  .da-info p span { font-weight: 600; color: #344054; }
  .da-info p strong { color: #101828; }
  .da-badge-row {
    margin-top: 12px;
  }

  /* ── Audit action (right) ── */
  .da-action {
    flex-shrink: 0;
  }
  .da-audit-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    border: none;
    border-radius: 10px;
    background: #2957FF;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background .2s, transform .2s;
    box-shadow: 0 2px 6px rgba(41,87,255,.25);
  }
  .da-audit-btn:hover {
    background: #1D4ED8;
    transform: translateY(-1px);
  }
  .da-audit-btn svg { flex-shrink: 0; }

  /* ── Empty state ── */
  .da-empty {
    padding: 48px 24px;
    text-align: center;
    color: #667085;
  }
  .da-empty p { margin: 8px 0 0; font-size: 14px; }

  /* ── Detail view ── */
  .da-detail {
    display: flex;
    flex-direction: column;
    gap: 24px;
    background: #fff;
    border: 1px solid #E4E7EC;
    border-radius: 16px;
    padding: 24px;
  }
  .da-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
  }
  .da-detail-header-left { flex: 1; min-width: 0; }
  .da-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: #667085;
    transition: color .2s;
  }
  .da-back-btn:hover { color: #344054; }
  .da-detail-title {
    margin: 0 0 4px;
    font-size: 20px;
    font-weight: 700;
    color: #101828;
    word-break: break-word;
    overflow-wrap: anywhere;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }
  .da-detail-po {
    font-size: 14px;
    color: #475467;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  .da-detail-po strong { color: #344054; }
  .da-shield-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #EFF6FF;
    color: #2957FF;
  }

  /* ── Section headings in detail ── */
  .da-section h4 {
    margin: 0 0 10px;
    font-size: 14px;
    font-weight: 700;
    color: #101828;
  }

  /* ── Remarks box ── */
  .da-remarks-box {
    background: #F9FAFB;
    border: 1px solid #E4E7EC;
    border-radius: 10px;
    padding: 14px 16px;
    font-size: 14px;
    color: #475467;
    font-style: italic;
  }

  /* ── Attachments grid ── */
  .da-attachments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
  .da-attachment-card {
    border: 1px solid #E4E7EC;
    border-radius: 10px;
    padding: 8px;
    background: #F9FAFB;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .da-attachment-card img {
    width: 100%;
    height: 90px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #E4E7EC;
  }
  .da-attachment-placeholder {
    width: 100%;
    height: 90px;
    background: #fff;
    border: 1px solid #E4E7EC;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9CA3AF;
  }
  .da-attachment-name {
    font-size: 12px;
    font-weight: 600;
    color: #344054;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .da-attachment-size { font-size: 11px; color: #9CA3AF; }

  /* ── Audit textarea ── */
  .da-textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #D0D5DD;
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 14px;
    color: #344054;
    resize: vertical;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    font-family: inherit;
  }
  .da-textarea:focus {
    border-color: #2957FF;
    box-shadow: 0 0 0 3px rgba(41,87,255,.12);
  }

  /* ── Detail action buttons ── */
  .da-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid #E4E7EC;
    flex-wrap: wrap;
  }
  .da-btn-return {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    border: 1px solid #F79009;
    border-radius: 8px;
    background: #fff;
    color: #B54708;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background .2s;
  }
  .da-btn-return:hover { background: #FFFAEB; }
  .da-btn-return:disabled { opacity: .5; cursor: not-allowed; }
  .da-btn-approve {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    background: #059669;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background .2s;
  }
  .da-btn-approve:hover { background: #047857; }
  .da-btn-approve:disabled { opacity: .5; cursor: not-allowed; }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .da-wrapper, .da-detail {
      padding: 16px;
      border-radius: 12px;
    }

    .da-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
    }

    .da-action {
      width: 100%;
    }

    .da-audit-btn {
      width: 100%;
      justify-content: center;
      padding: 12px;
      font-size: 15px;
    }

    .da-detail-header {
      flex-direction: column;
    }
    .da-shield-icon {
      display: none;
    }

    .da-actions {
      flex-direction: column-reverse;
    }
    .da-btn-return,
    .da-btn-approve {
      width: 100%;
      padding: 12px;
      font-size: 15px;
    }

    .da-attachments-grid {
      grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    }
  }

  /* ── Card thumbnail strip (list view) ── */
  .da-card-thumbs {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
  }
  .da-card-thumb {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #E4E7EC;
    flex-shrink: 0;
  }
  .da-card-thumb-file {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    border: 1px solid #E4E7EC;
    background: #F9FAFB;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9CA3AF;
    flex-shrink: 0;
  }
  .da-card-thumb-more {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    border: 1px dashed #D0D5DD;
    background: #F2F4F7;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #667085;
    flex-shrink: 0;
  }

  /* ── Tab bar ── */
  .da-tabs {
    display: flex;
    gap: 4px;
    margin-top: 16px;
  }
  .da-tab {
    padding: 8px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background .2s, color .2s;
    background: transparent;
    color: #667085;
  }
  .da-tab:hover { background: #F2F4F7; color: #344054; }
  .da-tab.active { background: #2957FF; color: #fff; }

  /* ── History table ── */
  .da-history-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .da-history-table thead th {
    text-align: left;
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 700;
    color: #667085;
    text-transform: uppercase;
    letter-spacing: .04em;
    background: #F9FAFB;
    border-bottom: 1px solid #E4E7EC;
  }
  .da-history-table thead th:first-child { border-radius: 8px 0 0 0; }
  .da-history-table thead th:last-child  { border-radius: 0 8px 0 0; }
  .da-history-table tbody td {
    padding: 12px 14px;
    border-bottom: 1px solid #F2F4F7;
    color: #344054;
    vertical-align: middle;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
  .da-history-table tbody tr:last-child td { border-bottom: none; }
  .da-history-table tbody tr:hover td { background: #F9FAFB; }
  .da-history-wrap {
    border: 1px solid #E4E7EC;
    border-radius: 12px;
    overflow: hidden;
    overflow-x: auto;
  }
  .da-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 12px;
    border-radius: 50px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }
  .da-chip-approved { background: #ECFDF5; color: #059669; }
  .da-chip-returned { background: #FFFAEB; color: #B54708; }
  .da-chip-other    { background: #F2F4F7; color: #344054; }
`;

const formatDate = (value) => {
  if (!value) return '–';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function DeliveryAudit() {
  const goodsReceipts = useERPStore(state => state.state?.goodsReceipts) || [];
  const purchaseOrders = useERPStore(state => state.state?.procurement?.purchaseOrders) || [];

  const pendingGRNs = goodsReceipts.filter(g =>
    g.status === 'PENDING_FINANCE_AUDIT' || g.status === 'SUBMITTED_FOR_FINANCE_AUDIT'
  );

  const historyGRNs = goodsReceipts.filter(g =>
    !['PENDING_FINANCE_AUDIT', 'SUBMITTED_FOR_FINANCE_AUDIT'].includes(g.status)
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const [activeTab, setActiveTab] = useState('pending');
  const [selectedGRNId, setSelectedGRNId] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedGRN = goodsReceipts.find(g => g.id === selectedGRNId) || null;
  const associatedPO = selectedGRN ? purchaseOrders.find(po => po.id === selectedGRN.purchaseOrderId) : null;

  const handleSelectGRN = (grnId) => {
    setSelectedGRNId(grnId);
    setRemarks('');
  };

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await approveGoodsReceiptNote(selectedGRN.id, remarks || 'Approved by Finance Audit', 'Finance Auditor');
      
      if (associatedPO) {
        try {
          await closePurchaseOrder(associatedPO.id, 'Closed automatically after Delivery Audit');
        } catch (closeErr) {
          console.warn('Auto-close skipped:', closeErr);
        }
      }

      await Swal.fire('Approved', 'GRN has been approved and inventory updated.', 'success');
      setSelectedGRNId(null);
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to approve GRN', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!remarks.trim()) {
      return Swal.fire('Error', 'Remarks are required to return for correction', 'error');
    }
    try {
      setIsSubmitting(true);
      await returnGRN(selectedGRN.id, remarks, 'Finance Auditor');
      await Swal.fire('Returned', 'GRN has been returned to Store for correction.', 'success');
      setSelectedGRNId(null);
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to return GRN', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─────────────── DETAIL VIEW ─────────────── */
  if (selectedGRN) {
    return (
      <>
        <style>{CSS}</style>
        <div className="da-detail">
          {/* Header */}
          <div className="da-detail-header">
            <div className="da-detail-header-left">
              <button className="da-back-btn" onClick={() => setSelectedGRNId(null)}>
                <CornerUpLeft size={14} /> Back to Pending Audits
              </button>
              <h2 className="da-detail-title">
                Audit GRN: {selectedGRN.grnNumber || selectedGRN.id}
                {selectedGRN.grnType === 'REPLACEMENT' && (
                  <span style={{ fontSize: 11, background: '#fee2e2', color: '#b91c1c', padding: '3px 10px', borderRadius: 50, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    REPLACEMENT MATERIAL
                  </span>
                )}
              </h2>
              <p className="da-detail-po">
                Against PO: <strong>{associatedPO?.poNumber || selectedGRN.purchaseOrderId}</strong>
              </p>
              {selectedGRN.grnType === 'REPLACEMENT' && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#F5FAFE', borderRadius: '8px', fontSize: '13px', border: '1px solid #DCE5F0' }}>
                  <p style={{ margin: '0 0 4px 0' }}><span style={{ color: '#5E6B82' }}>Original GRN:</span> <strong>{selectedGRN.originalGrnId}</strong></p>
                  <p style={{ margin: '0 0 4px 0' }}><span style={{ color: '#5E6B82' }}>Rejection ID:</span> <strong>{selectedGRN.materialRejectionId}</strong></p>
                  <p style={{ margin: '0 0 4px 0' }}><span style={{ color: '#5E6B82' }}>Total Delivered:</span> <strong>{selectedGRN.receivedQty}</strong></p>
                  <p style={{ margin: 0 }}><span style={{ color: '#5E6B82' }}>Total Accepted:</span> <strong style={{ color: '#059669' }}>{selectedGRN.acceptedQty}</strong></p>
                </div>
              )}
            </div>
            <div className="da-shield-icon">
              <ShieldCheck size={26} />
            </div>
          </div>

          {/* Items table */}
          <div className="da-section">
            <h4>Received Items</h4>
            <div style={{ overflowX: 'auto' }}>
              <DataTable
                columns={[
                  {
                    header: 'Material', accessor: 'productId', render: row => {
                      const poItem = associatedPO?.items.find(i => i.productId === row.productId);
                      return <strong style={{ color: '#101828' }}>{poItem?.product?.name || row.productId}</strong>;
                    }
                  },
                  { header: 'Delivered', accessor: 'receivedQuantity', render: row => <span style={{ color: '#475467' }}>{Number(row.receivedQuantity)}</span> },
                  { header: 'Accepted', accessor: 'acceptedQuantity', render: row => <strong style={{ color: '#059669' }}>{Number(row.acceptedQuantity)}</strong> },
                  { header: 'Rejected', accessor: 'rejectedQuantity', render: row => <strong style={{ color: '#DC2626' }}>{Number(row.rejectedQuantity)}</strong> },
                  {
                    header: 'Unit Rate (₹)', accessor: 'productId', render: row => {
                      const poItem = associatedPO?.items.find(i => i.productId === row.productId);
                      return `₹${Number(poItem?.unitPrice || 0).toLocaleString()}`;
                    }
                  },
                  {
                    header: 'Impact (₹)', accessor: 'id', render: row => {
                      const poItem = associatedPO?.items.find(i => i.productId === row.productId);
                      const impact = Number(row.acceptedQuantity) * Number(poItem?.unitPrice || 0);
                      return <strong style={{ color: '#101828' }}>₹{impact.toLocaleString()}</strong>;
                    }
                  }
                ]}
                data={selectedGRN.items || []}
                emptyMessage="No items found."
              />
            </div>
          </div>

          {/* Store Remarks */}
          <div className="da-section">
            <h4>Store Remarks</h4>
            <div className="da-remarks-box">
              {selectedGRN.snapshot?.remarks || 'No remarks provided by store.'}
            </div>
          </div>

          {/* Attachments */}
          {selectedGRN.snapshot?.attachments?.length > 0 && (
            <div className="da-section">
              <h4>Attached Documents</h4>
              <div className="da-attachments-grid">
                {selectedGRN.snapshot.attachments.map((doc, idx) => (
                  <div key={idx} className="da-attachment-card">
                    {doc.previewUrl && doc.previewUrl.startsWith('data:image') ? (
                      <img src={doc.previewUrl} alt={doc.name} />
                    ) : (
                      <div className="da-attachment-placeholder">
                        <FileText size={30} />
                      </div>
                    )}
                    <p className="da-attachment-name" title={doc.name}>{doc.name}</p>
                    <p className="da-attachment-size">{doc.size}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Remarks textarea */}
          <div className="da-section">
            <h4>Audit Remarks / Notes</h4>
            <textarea
              className="da-textarea"
              rows={3}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Provide approval remarks or mandatory return justifications..."
            />
          </div>

          {/* Actions */}
          <div className="da-actions">
            <button className="da-btn-return" type="button" onClick={handleReturn} disabled={isSubmitting}>
              Return for Correction
            </button>
            <button className="da-btn-approve" type="button" onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? 'Approving…' : 'Approve & Post to Inventory'}
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ─────────────── LIST VIEW ─────────────── */
  return (
    <>
      <style>{CSS}</style>
      <div className="da-wrapper">
        {/* Page header */}
        <div className="da-page-header">
          <h2>Finance Delivery Audit</h2>
          <p>Review and approve Store Goods Receipt Notes</p>
          {/* Tab bar */}
          <div className="da-tabs">
            <button
              className={`da-tab${activeTab === 'pending' ? ' active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Audit
              {pendingGRNs.length > 0 && (
                <span style={{ marginLeft: 6, background: activeTab === 'pending' ? 'rgba(255,255,255,.25)' : '#EEF4FF', color: activeTab === 'pending' ? '#fff' : '#2957FF', borderRadius: 50, padding: '1px 8px', fontSize: 12 }}>
                  {pendingGRNs.length}
                </span>
              )}
            </button>
            <button
              className={`da-tab${activeTab === 'history' ? ' active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              History
              {historyGRNs.length > 0 && (
                <span style={{ marginLeft: 6, background: activeTab === 'history' ? 'rgba(255,255,255,.25)' : '#F2F4F7', color: activeTab === 'history' ? '#fff' : '#344054', borderRadius: 50, padding: '1px 8px', fontSize: 12 }}>
                  {historyGRNs.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Pending tab */}
        {activeTab === 'pending' && (
          <div className="da-list">
            {pendingGRNs.map(grn => {
              const po = purchaseOrders.find(p => p.id === grn.purchaseOrderId);
              return (
                <div key={grn.id} className="da-card" onClick={() => handleSelectGRN(grn.id)}>
                  {/* Info */}
                  <div className="da-info">
                    <h3>
                      {grn.grnNumber || grn.id}
                      {grn.grnType === 'REPLACEMENT' && (
                        <span style={{ marginLeft: 10, fontSize: 11, background: '#F3E8FF', color: '#7C3AED', padding: '3px 10px', borderRadius: 50, fontWeight: 700, whiteSpace: 'nowrap', display: 'inline-block', verticalAlign: 'middle' }}>
                          REPLACEMENT
                        </span>
                      )}
                    </h3>
                    <p><span>PO:</span> {po?.poNumber || grn.purchaseOrderId}</p>
                    <p>Submitted: <strong>{formatDate(grn.createdAt)}</strong></p>
                    <div className="da-badge-row">
                      <ProcurementStatusBadge status={grn.status} />
                    </div>

                    {/* Attachment thumbnails */}
                    {grn.snapshot?.attachments?.length > 0 && (() => {
                      const attachments = grn.snapshot.attachments;
                      const preview = attachments.slice(0, 4);
                      const extra = attachments.length - 4;
                      return (
                        <div className="da-card-thumbs" onClick={e => e.stopPropagation()}>
                          {preview.map((doc, idx) =>
                            doc.previewUrl && doc.previewUrl.startsWith('data:image') ? (
                              <img key={idx} src={doc.previewUrl} alt={doc.name} className="da-card-thumb" title={doc.name} />
                            ) : (
                              <div key={idx} className="da-card-thumb-file" title={doc.name}>
                                <FileText size={22} />
                              </div>
                            )
                          )}
                          {extra > 0 && (
                            <div className="da-card-thumb-more">+{extra}</div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* CTA */}
                  <div className="da-action">
                    <button className="da-audit-btn">
                      Audit
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}

            {pendingGRNs.length === 0 && (
              <div className="da-empty">
                <FileCheck size={48} color="#D0D5DD" />
                <p style={{ fontWeight: 600, color: '#101828', marginTop: 12 }}>No deliveries pending audit.</p>
                <p>When the store team submits a GRN, it will appear here for financial review.</p>
              </div>
            )}
          </div>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <div>
            {historyGRNs.length === 0 ? (
              <div className="da-empty">
                <FileCheck size={48} color="#D0D5DD" />
                <p style={{ fontWeight: 600, color: '#101828', marginTop: 12 }}>No audit history yet.</p>
                <p>Approved or returned GRNs will appear here.</p>
              </div>
            ) : (
              <div className="da-history-wrap">
                <table className="da-history-table">
                  <thead>
                    <tr>
                      <th>GRN</th>
                      <th>PO Reference</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyGRNs.map(grn => {
                      const po = purchaseOrders.find(p => p.id === grn.purchaseOrderId);
                      const isApproved = grn.status === 'FINANCE_AUDIT_APPROVED';
                      const isReturned = grn.status === 'RETURNED_TO_STORE';
                      const chipClass = isApproved ? 'da-chip da-chip-approved' : isReturned ? 'da-chip da-chip-returned' : 'da-chip da-chip-other';
                      const statusLabel = grn.status.replace(/_/g, ' ');
                      const totalAccepted = (grn.items || []).reduce((s, i) => s + Number(i.acceptedQuantity || 0), 0);
                      const totalRejected = (grn.items || []).reduce((s, i) => s + Number(i.rejectedQuantity || 0), 0);
                      return (
                        <tr key={grn.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: '#101828', fontSize: 13, wordBreak: 'break-all' }}>{grn.grnNumber || grn.id}</div>
                            {grn.grnType === 'REPLACEMENT' && (
                              <span style={{ fontSize: 10, background: '#F3E8FF', color: '#7C3AED', padding: '2px 8px', borderRadius: 50, fontWeight: 700 }}>REPLACEMENT</span>
                            )}
                          </td>
                          <td style={{ fontSize: 13, wordBreak: 'break-all' }}>{po?.poNumber || grn.purchaseOrderId}</td>
                          <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>{formatDate(grn.receivedAt || grn.createdAt)}</td>
                          <td style={{ fontSize: 13 }}>
                            <span style={{ color: '#059669', fontWeight: 700 }}>✓ {totalAccepted}</span>
                            {totalRejected > 0 && <span style={{ color: '#DC2626', fontWeight: 700, marginLeft: 8 }}>✗ {totalRejected}</span>}
                          </td>
                          <td><span className={chipClass}>{statusLabel}</span></td>
                          <td style={{ fontSize: 13, color: '#667085', fontStyle: 'italic', maxWidth: 220 }}>
                            {grn.snapshot?.remarks || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

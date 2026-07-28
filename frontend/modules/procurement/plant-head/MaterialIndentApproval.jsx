import React, { useState, useMemo, useEffect } from 'react';
import { useERPStore } from '../../../store/erpStore';
import { approveMaterialIndent, returnIndentForCorrection } from '../../../store/procurementActions';
import { ProcurementStatusBadge } from '../components/ProcurementStatusBadge';
import { Package, CheckCircle, XCircle, ArrowLeft, Clock, AlertCircle, ShieldCheck, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

const EMPTY_INDENTS = [];

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
};

export default function MaterialIndentApproval() {
  const [selectedIndentId, setSelectedIndentId] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvedItemsMap, setApprovedItemsMap] = useState({});
  const [windowWidth, setWindowWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // Reactive store subscription
  const materialIndents = useERPStore(
    (state) => state.procurement?.materialIndents ?? state.state?.procurement?.materialIndents ?? state.materialIndents ?? state.state?.materialIndents ?? EMPTY_INDENTS
  );

  // Filter pending indents
  const pendingIndents = useMemo(() => {
    return materialIndents.filter(ind => ind.status === 'PENDING_PLANT_HEAD_APPROVAL' || ind.status === 'PENDING_PLANT_HEAD');
  }, [materialIndents]);

  const selectedIndent = useMemo(() => {
    if (!selectedIndentId) return null;
    return materialIndents.find(i => i.id === selectedIndentId) || null;
  }, [selectedIndentId, materialIndents]);

  const handleSelectIndent = (indent) => {
    setSelectedIndentId(indent.id);
    const initialMap = {};
    const items = indent.items || [
      {
        indentItemId: indent.id + "-ITEM-1",
        materialId: indent.materialId || indent.materialCode || '',
        materialName: indent.materialName || 'Material',
        quantity: indent.requiredQuantity || indent.quantity || 0,
        unit: indent.unit || 'PCS'
      }
    ];
    items.forEach(item => {
      const key = item.indentItemId || item.materialId;
      initialMap[key] = item.approvedQuantity !== null && item.approvedQuantity !== undefined
        ? Number(item.approvedQuantity)
        : Number(item.quantity || item.requiredQuantity || 0);
    });
    setApprovedItemsMap(initialMap);
    setRemarks('');
  };

  const handleQtyChange = (itemKey, value) => {
    const num = Math.max(0, Number(value));
    setApprovedItemsMap(prev => ({
      ...prev,
      [itemKey]: num
    }));
  };

  const handleApprove = async () => {
    if (!selectedIndent) return;
    try {
      setIsSubmitting(true);
      const items = selectedIndent.items || [
        {
          indentItemId: selectedIndent.id + "-ITEM-1",
          materialId: selectedIndent.materialId || selectedIndent.materialCode || '',
          materialName: selectedIndent.materialName || 'Material',
          quantity: selectedIndent.requiredQuantity || selectedIndent.quantity || 0,
          unit: selectedIndent.unit || 'PCS'
        }
      ];

      const finalApprovedItems = items.map(item => {
        const key = item.indentItemId || item.materialId;
        const appQty = approvedItemsMap[key] !== undefined ? approvedItemsMap[key] : Number(item.quantity || item.requiredQuantity || 0);
        return {
          ...item,
          approvedQty: appQty,
          approvedQuantity: appQty
        };
      });

      approveMaterialIndent(selectedIndent.id, finalApprovedItems, remarks || 'Approved by Plant Head', 'Plant Head');
      
      await Swal.fire({
        title: 'Indent Approved!',
        text: `Indent ${selectedIndent.id} has been approved and forwarded to Finance for PO creation.`,
        icon: 'success',
        confirmButtonColor: '#10b981'
      });

      setSelectedIndentId(null);
      setRemarks('');
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Failed to approve indent',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedIndent) return;
    if (!remarks.trim()) {
      return Swal.fire({
        title: 'Remarks Required',
        text: 'Please provide mandatory remarks explaining why the indent is being returned for correction.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      });
    }

    try {
      setIsSubmitting(true);
      returnIndentForCorrection(selectedIndent.id, remarks, 'Plant Head');
      
      await Swal.fire({
        title: 'Indent Returned',
        text: `Indent ${selectedIndent.id} returned to Store for correction.`,
        icon: 'info',
        confirmButtonColor: '#f59e0b'
      });

      setSelectedIndentId(null);
      setRemarks('');
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Failed to return indent',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const highPriorityCount = useMemo(() => {
    return pendingIndents.filter(i => (i.priority || '').toUpperCase() === 'HIGH' || (i.priority || '').toUpperCase() === 'URGENT').length;
  }, [pendingIndents]);

  return (
    <div style={{
      width: '100%',
      maxWidth: '1280px',
      margin: '0 auto',
      padding: isMobile ? '12px 8px' : '20px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: '#1E293B',
      boxSizing: 'border-box'
    }}>
      {!selectedIndent ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: isMobile ? '16px' : '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck style={{ width: 26, height: 26, color: '#4F46E5', flexShrink: 0 }} />
                <h1 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                  Plant Head → Material Indent Approvals
                </h1>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '6px 0 0 0', lineHeight: '1.4' }}>
                Review pending material indents raised by Store, adjust approved quantities, and authorize procurement.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                padding: '6px 14px',
                background: '#EEF2FF',
                color: '#4338CA',
                fontSize: '12px',
                fontWeight: 800,
                borderRadius: '20px',
                border: '1px solid #C7D2FE',
                whiteSpace: 'nowrap'
              }}>
                {pendingIndents.length} Pending Approval{pendingIndents.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* KPI Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '16px',
            width: '100%'
          }}>
            {/* Card 1 */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderLeft: '4px solid #F59E0B',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              minHeight: '75px',
              boxSizing: 'border-box'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                  Pending Review
                </span>
                <span style={{ fontSize: '24px', fontWeight: 950, color: '#D97706', marginTop: '2px', display: 'block', lineHeight: 1 }}>
                  {pendingIndents.length}
                </span>
              </div>
              <Clock style={{ width: 28, height: 28, color: '#FBBF24', opacity: 0.8 }} />
            </div>

            {/* Card 2 */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderLeft: '4px solid #EF4444',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              minHeight: '75px',
              boxSizing: 'border-box'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                  High / Urgent Priority
                </span>
                <span style={{ fontSize: '24px', fontWeight: 950, color: '#DC2626', marginTop: '2px', display: 'block', lineHeight: 1 }}>
                  {highPriorityCount}
                </span>
              </div>
              <AlertCircle style={{ width: 28, height: 28, color: '#F87171', opacity: 0.8 }} />
            </div>

            {/* Card 3 */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              borderLeft: '4px solid #6366F1',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              minHeight: '75px',
              boxSizing: 'border-box'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                  Total Recorded Indents
                </span>
                <span style={{ fontSize: '24px', fontWeight: 950, color: '#4F46E5', marginTop: '2px', display: 'block', lineHeight: 1 }}>
                  {materialIndents.length}
                </span>
              </div>
              <FileText style={{ width: 28, height: 28, color: '#818CF8', opacity: 0.8 }} />
            </div>
          </div>

          {/* Pending List Section */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            width: '100%'
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Pending Material Indents
              </h2>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                Click Review to inspect line items
              </span>
            </div>

            {/* Desktop Data Table */}
            {!isMobile ? (
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      <th style={{ padding: '14px 20px' }}>Indent ID</th>
                      <th style={{ padding: '14px 20px' }}>Department</th>
                      <th style={{ padding: '14px 20px' }}>Date Created</th>
                      <th style={{ padding: '14px 20px' }}>Target Date</th>
                      <th style={{ padding: '14px 20px' }}>Material / Qty</th>
                      <th style={{ padding: '14px 20px' }}>Priority</th>
                      <th style={{ padding: '14px 20px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '13px', color: '#334155' }}>
                    {pendingIndents.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '48px 20px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                          No material indents currently pending Plant Head approval.
                        </td>
                      </tr>
                    ) : (
                      pendingIndents.map((indent) => {
                        const items = indent.items || [];
                        const displayMaterial = indent.materialName || (items[0]?.materialName) || 'Material';
                        const reqQty = indent.requiredQuantity || indent.quantity || (items[0]?.quantity) || 0;
                        const unit = indent.unit || (items[0]?.unit) || 'PCS';
                        const isHigh = (indent.priority || '').toUpperCase() === 'HIGH' || (indent.priority || '').toUpperCase() === 'URGENT';

                        return (
                          <tr key={indent.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                            <td style={{ padding: '16px 20px', fontWeight: 900, color: '#0F172A' }}>{indent.id}</td>
                            <td style={{ padding: '16px 20px', fontWeight: 700, color: '#475569' }}>{indent.requestedByDepartment || indent.department || 'Store'}</td>
                            <td style={{ padding: '16px 20px', color: '#64748B' }}>{formatDate(indent.createdAt)}</td>
                            <td style={{ padding: '16px 20px', color: '#64748B' }}>{formatDate(indent.targetDate || indent.requiredDate)}</td>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{ fontWeight: 800, color: '#1E293B', display: 'block' }}>{displayMaterial}</span>
                              <span style={{ fontSize: '12px', color: '#64748B' }}>({reqQty} {unit}{items.length > 1 ? ` +${items.length - 1} more` : ''})</span>
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 800,
                                background: isHigh ? '#FFE4E6' : '#F1F5F9',
                                color: isHigh ? '#9F1239' : '#475569',
                                border: isHigh ? '1px solid #FECDD3' : '1px solid #E2E8F0'
                              }}>
                                {indent.priority || 'Medium'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                              <ProcurementStatusBadge status={indent.status} />
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                              <button
                                onClick={() => handleSelectIndent(indent)}
                                style={{
                                  padding: '8px 16px',
                                  background: '#4F46E5',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
                                  transition: 'all 0.15s'
                                }}
                              >
                                Review & Approve →
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Mobile Cards List */
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {pendingIndents.length === 0 ? (
                  <div style={{ padding: '36px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '13px', fontWeight: 600 }}>
                    No material indents currently pending Plant Head approval.
                  </div>
                ) : (
                  pendingIndents.map((indent) => {
                    const items = indent.items || [];
                    const displayMaterial = indent.materialName || (items[0]?.materialName) || 'Material';
                    const reqQty = indent.requiredQuantity || indent.quantity || (items[0]?.quantity) || 0;
                    const unit = indent.unit || (items[0]?.unit) || 'PCS';
                    const isHigh = (indent.priority || '').toUpperCase() === 'HIGH' || (indent.priority || '').toUpperCase() === 'URGENT';

                    return (
                      <div key={indent.id} style={{
                        padding: '16px',
                        borderBottom: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        background: '#ffffff'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '16px', fontWeight: 950, color: '#0F172A' }}>{indent.id}</span>
                          <ProcurementStatusBadge status={indent.status} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                          <div>
                            <span style={{ color: '#94A3B8', fontWeight: 700, display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>DEPARTMENT</span>
                            <span style={{ fontWeight: 800, color: '#334155' }}>{indent.requestedByDepartment || indent.department || 'Store'}</span>
                          </div>
                          <div>
                            <span style={{ color: '#94A3B8', fontWeight: 700, display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>PRIORITY</span>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 800,
                              background: isHigh ? '#FFE4E6' : '#F1F5F9',
                              color: isHigh ? '#9F1239' : '#475569',
                              display: 'inline-block'
                            }}>
                              {indent.priority || 'Medium'}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#94A3B8', fontWeight: 700, display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>CREATED</span>
                            <span style={{ color: '#475569' }}>{formatDate(indent.createdAt)}</span>
                          </div>
                          <div>
                            <span style={{ color: '#94A3B8', fontWeight: 700, display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>TARGET DATE</span>
                            <span style={{ color: '#475569' }}>{formatDate(indent.targetDate || indent.requiredDate)}</span>
                          </div>
                        </div>

                        <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
                          <span style={{ color: '#64748B', fontSize: '11px', fontWeight: 700, display: 'block' }}>MATERIAL / REQUESTED QTY</span>
                          <span style={{ fontWeight: 900, color: '#0F172A', display: 'block', marginTop: '2px' }}>{displayMaterial}</span>
                          <span style={{ color: '#4F46E5', fontWeight: 950, marginTop: '2px', display: 'block' }}>{reqQty} {unit}</span>
                        </div>

                        <button
                          onClick={() => handleSelectIndent(indent)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: '#4F46E5',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          Review & Approve Indent →
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Detailed Indent Approval & Qty Adjustment Form */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Back Button */}
          <button
            onClick={() => setSelectedIndentId(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 800,
              color: '#475569',
              background: '#ffffff',
              border: '1px solid #E2E8F0',
              padding: '10px 16px',
              borderRadius: '10px',
              cursor: 'pointer',
              alignSelf: 'flex-start',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Pending Approvals List
          </button>

          {/* Indent Header Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: isMobile ? '16px' : '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: '12px',
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 950, color: '#0F172A', margin: 0 }}>
                    Review Indent: {selectedIndent.id}
                  </h1>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    background: (selectedIndent.priority || '').toUpperCase() === 'HIGH' ? '#FFE4E6' : '#F1F5F9',
                    color: (selectedIndent.priority || '').toUpperCase() === 'HIGH' ? '#9F1239' : '#475569'
                  }}>
                    Priority: {selectedIndent.priority || 'Medium'}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '6px 0 0 0' }}>
                  Requested by <strong style={{ color: '#1E293B' }}>{selectedIndent.requestedByDepartment || selectedIndent.department || 'Store'}</strong> on {formatDate(selectedIndent.createdAt)}
                </p>
                {(selectedIndent.targetDate || selectedIndent.requiredDate) && (
                  <p style={{ fontSize: '13px', color: '#DC2626', fontWeight: 800, margin: '4px 0 0 0' }}>
                    Target Required Date: {formatDate(selectedIndent.targetDate || selectedIndent.requiredDate)}
                  </p>
                )}
              </div>
              <ProcurementStatusBadge status={selectedIndent.status} />
            </div>

            {/* Indent Stock Context */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: '12px',
              background: '#F8FAFC',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              fontSize: '13px'
            }}>
              <div>
                <span style={{ color: '#94A3B8', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Current Stock</span>
                <span style={{ fontWeight: 900, color: '#1E293B' }}>{selectedIndent.currentStock ?? 0} {selectedIndent.unit || 'PCS'}</span>
              </div>
              <div>
                <span style={{ color: '#94A3B8', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Minimum Stock</span>
                <span style={{ fontWeight: 900, color: '#D97706' }}>{selectedIndent.minimumStock ?? 0} {selectedIndent.unit || 'PCS'}</span>
              </div>
              <div>
                <span style={{ color: '#94A3B8', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Requested Qty</span>
                <span style={{ fontWeight: 900, color: '#4F46E5' }}>{selectedIndent.requiredQuantity || selectedIndent.quantity || 0} {selectedIndent.unit || 'PCS'}</span>
              </div>
              <div>
                <span style={{ color: '#94A3B8', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>Source</span>
                <span style={{ fontWeight: 700, color: '#475569' }}>{selectedIndent.source || 'LOW_STOCK_ALERT'}</span>
              </div>
            </div>
          </div>

          {/* Line Items & Approved Quantity Authorization */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Line Items & Approved Quantity Authorization
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                Modify the approved quantity if needed before releasing to Finance.
              </p>
            </div>

            {/* Desktop Table View */}
            {!isMobile ? (
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      <th style={{ padding: '14px 20px' }}>Material Details</th>
                      <th style={{ padding: '14px 20px' }}>Material Code</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right' }}>Requested Qty</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right' }}>Approved Qty (Adjustable)</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '13px', color: '#334155' }}>
                    {(selectedIndent.items || [
                      {
                        indentItemId: selectedIndent.id + "-ITEM-1",
                        materialId: selectedIndent.materialId || selectedIndent.materialCode || '',
                        materialName: selectedIndent.materialName || 'Material',
                        quantity: selectedIndent.requiredQuantity || selectedIndent.quantity || 0,
                        unit: selectedIndent.unit || 'PCS'
                      }
                    ]).map((item) => {
                      const itemKey = item.indentItemId || item.materialId;
                      const approvedVal = approvedItemsMap[itemKey] !== undefined ? approvedItemsMap[itemKey] : (item.quantity || item.requiredQuantity || 0);

                      return (
                        <tr key={itemKey} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '16px 20px', fontWeight: 800, color: '#0F172A' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Package style={{ width: 18, height: 18, color: '#4F46E5', flexShrink: 0 }} />
                              <span>{item.materialName || selectedIndent.materialName}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontWeight: 700, color: '#64748B' }}>
                            {item.materialId || selectedIndent.materialCode || '-'}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 800, color: '#334155' }}>
                            {item.quantity || item.requiredQuantity || selectedIndent.requiredQuantity} {item.unit || selectedIndent.unit || 'PCS'}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="number"
                                min="0"
                                max={item.quantity || item.requiredQuantity || 999999}
                                value={approvedVal}
                                onChange={(e) => handleQtyChange(itemKey, e.target.value)}
                                style={{
                                  width: '120px',
                                  padding: '8px 12px',
                                  border: '2px solid #C7D2FE',
                                  borderRadius: '8px',
                                  textAlign: 'right',
                                  fontWeight: 950,
                                  color: '#312E81',
                                  background: '#EEF2FF',
                                  fontSize: '14px',
                                  outline: 'none'
                                }}
                              />
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>{item.unit || selectedIndent.unit || 'PCS'}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Mobile Line Items View */
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(selectedIndent.items || [
                  {
                    indentItemId: selectedIndent.id + "-ITEM-1",
                    materialId: selectedIndent.materialId || selectedIndent.materialCode || '',
                    materialName: selectedIndent.materialName || 'Material',
                    quantity: selectedIndent.requiredQuantity || selectedIndent.quantity || 0,
                    unit: selectedIndent.unit || 'PCS'
                  }
                ]).map((item) => {
                  const itemKey = item.indentItemId || item.materialId;
                  const approvedVal = approvedItemsMap[itemKey] !== undefined ? approvedItemsMap[itemKey] : (item.quantity || item.requiredQuantity || 0);

                  return (
                    <div key={itemKey} style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package style={{ width: 20, height: 20, color: '#4F46E5', flexShrink: 0 }} />
                        <div>
                          <span style={{ fontWeight: 900, color: '#0F172A', fontSize: '14px', display: 'block' }}>{item.materialName || selectedIndent.materialName}</span>
                          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B' }}>{item.materialId || selectedIndent.materialCode || '-'}</span>
                        </div>
                      </div>

                      <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}>
                        <span style={{ color: '#64748B', fontWeight: 700, display: 'block' }}>REQUESTED QTY</span>
                        <span style={{ fontWeight: 900, color: '#0F172A', fontSize: '14px' }}>
                          {item.quantity || item.requiredQuantity || selectedIndent.requiredQuantity} {item.unit || selectedIndent.unit || 'PCS'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 800, color: '#312E81' }}>Approved Quantity ({item.unit || selectedIndent.unit || 'PCS'})</label>
                        <input
                          type="number"
                          min="0"
                          max={item.quantity || item.requiredQuantity || 999999}
                          value={approvedVal}
                          onChange={(e) => handleQtyChange(itemKey, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '2px solid #C7D2FE',
                            borderRadius: '8px',
                            textAlign: 'right',
                            fontWeight: 950,
                            color: '#312E81',
                            background: '#EEF2FF',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Remarks Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: isMobile ? '16px' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
              Plant Head Authorization Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#1E293B',
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              placeholder="Enter optional approval remarks or mandatory return/correction justification..."
            />
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={handleReturn}
              disabled={isSubmitting}
              style={{
                width: isMobile ? '100%' : 'auto',
                padding: '12px 20px',
                border: '2px solid #FECDD3',
                background: '#FFF1F2',
                color: '#BE123C',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <XCircle style={{ width: 18, height: 18 }} />
              Return for Correction
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isSubmitting}
              style={{
                width: isMobile ? '100%' : 'auto',
                padding: '12px 24px',
                border: 'none',
                background: '#059669',
                color: '#ffffff',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}
            >
              <CheckCircle style={{ width: 18, height: 18 }} />
              Approve Indent & Forward to Finance
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { useERPStore } from '../../../store/erpStore';
import { approveMaterialIndent, returnIndentForCorrection, rejectMaterialIndent } from '../../../store/procurementActions';
import { ProcurementStatusBadge } from '../components/ProcurementStatusBadge';
import { Package, CheckCircle, XCircle, ArrowLeft, Clock, AlertCircle, ShieldCheck, FileText, Eye, History } from 'lucide-react';
import Swal from 'sweetalert2';
import { backendFetch } from '../../../lib/backendFetch';
import { purchaseIndentService } from '../../../services/procurement/purchaseIndentService';

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
  const [viewTab, setViewTab] = useState('pending'); // 'pending' | 'history'
  const [newlyApprovedId, setNewlyApprovedId] = useState(null);
  const [serverIndents, setServerIndents] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reactive store subscription
  const materialIndents = useERPStore(
    (state) => state.procurement?.materialIndents ?? state.state?.procurement?.materialIndents ?? state.materialIndents ?? state.state?.materialIndents ?? EMPTY_INDENTS
  );

  // Auto-refresh helper
  const refreshIndents = async () => {
    try {
      const response = await purchaseIndentService.list({ limit: 100 });
      const data = Array.isArray(response) ? response : (response?.data || []);
      setServerIndents(data);
    } catch (error) {
      console.warn('Unable to load material indents:', error);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchFresh = async () => {
      try {
        const response = await purchaseIndentService.list({ limit: 100 });
        const data = Array.isArray(response) ? response : (response?.data || []);
        if (active) setServerIndents(data);
      } catch (error) {
        console.warn('Unable to load material indents:', error);
      }
    };

    fetchFresh();
    const interval = setInterval(fetchFresh, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const allMaterialIndents = useMemo(() => {
    const unique = new Map();
    [...materialIndents, ...serverIndents].forEach(indent => {
      if (indent) {
        const key = indent.id || indent.publicId || indent.indentNo;
        if (key) unique.set(key, indent);
      }
    });
    return Array.from(unique.values());
  }, [materialIndents, serverIndents]);

  // Filter pending indents (strictly awaiting Plant Head sign-off)
  const pendingIndents = useMemo(() => {
    return allMaterialIndents.filter(ind => {
      if (!ind) return false;
      const st = String(ind.status || 'PENDING').toUpperCase();
      // If it is already approved, rejected, returned, converted to PO, delivered, closed, or awaiting finance/super-admin
      if (
        st.includes('APPROVED') ||
        st.includes('SUPER_ADMIN') ||
        st.includes('FINANCE') ||
        st.includes('REJECT') ||
        st.includes('CORRECTION') ||
        st.includes('RETURN') ||
        st.includes('CANCEL') ||
        st.includes('PO_') ||
        st.includes('CONVERTED') ||
        st.includes('DELIVER') ||
        st.includes('CLOSED')
      ) {
        return false;
      }
      return (
        st === 'PENDING_PLANT_HEAD_APPROVAL' ||
        st === 'PENDING_PLANT_HEAD' ||
        st === 'PENDING_APPROVAL' ||
        st === 'SUBMITTED' ||
        st === 'DRAFT' ||
        st === 'CREATED' ||
        st === 'PENDING'
      );
    });
  }, [allMaterialIndents]);

  const historyIndents = useMemo(() => {
    const pendingIds = new Set(pendingIndents.map(i => i.id));
    const list = allMaterialIndents.filter(ind => ind && !pendingIds.has(ind.id));
    return list.sort((a, b) => {
      if (newlyApprovedId && a.id === newlyApprovedId) return -1;
      if (newlyApprovedId && b.id === newlyApprovedId) return 1;
      const dateA = new Date(a.plantHeadApprovedAt || a.approvedAt || a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.plantHeadApprovedAt || b.approvedAt || b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [allMaterialIndents, pendingIndents, newlyApprovedId]);

  const displayedIndents = viewTab === 'history' ? historyIndents : pendingIndents;

  const selectedIndent = useMemo(() => {
    if (!selectedIndentId) return null;
    return allMaterialIndents.find(i => i.id === selectedIndentId) || null;
  }, [selectedIndentId, allMaterialIndents]);

  // Read-only inspection mode if viewing an indent from History or if already approved/processed
  const isReadOnly = useMemo(() => {
    if (!selectedIndent) return false;
    const st = String(selectedIndent.status || '').toUpperCase();
    return (
      viewTab === 'history' ||
      st.includes('APPROVED') ||
      st.includes('REJECT') ||
      st.includes('RETURN') ||
      st.includes('CANCEL') ||
      st.includes('PO_') ||
      st.includes('CONVERT') ||
      st.includes('DELIVER') ||
      st.includes('CLOSED')
    );
  }, [selectedIndent, viewTab]);

  const handleSelectIndent = (indent) => {
    setSelectedIndentId(indent.id);
    const initialMap = {};
    const items = indent.items || [
      {
        id: indent.id + "-ITEM-1",
        indentItemId: indent.id + "-ITEM-1",
        productId: indent.productId || indent.materialId || indent.materialCode || '',
        materialId: indent.materialId || indent.materialCode || '',
        materialName: indent.materialName || 'Material',
        quantity: indent.requiredQuantity || indent.quantity || 0,
        unit: indent.unit || 'PCS'
      }
    ];
    items.forEach((item, idx) => {
      const key = item.id || item.indentItemId || item.materialId || `fallback-${idx}`;
      const reqQty = Number(item.quantity ?? item.requiredQuantity ?? 0);
      initialMap[key] = item.approvedQuantity !== null && item.approvedQuantity !== undefined
        ? Number(item.approvedQuantity)
        : reqQty;
    });
    setApprovedItemsMap(initialMap);
    setRemarks('');
  };

  const handleQtyChange = (itemKey, value, maxLimit) => {
    let num = Math.max(0, Number(value));
    if (maxLimit !== undefined && maxLimit !== null && Number(maxLimit) > 0) {
      if (num > Number(maxLimit)) {
        num = Number(maxLimit);
      }
    }
    setApprovedItemsMap(prev => ({
      ...prev,
      [itemKey]: num
    }));
  };

  const handleApprove = async () => {
    if (!selectedIndent) return;

    const items = selectedIndent.items || [
      {
        id: selectedIndent.id + "-ITEM-1",
        indentItemId: selectedIndent.id + "-ITEM-1",
        productId: selectedIndent.productId || selectedIndent.materialId || selectedIndent.materialCode || '',
        materialId: selectedIndent.materialId || selectedIndent.materialCode || '',
        materialName: selectedIndent.materialName || 'Material',
        quantity: selectedIndent.requiredQuantity || selectedIndent.quantity || 0,
        unit: selectedIndent.unit || 'PCS'
      }
    ];

    // Client-side quantity validation before submitting
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const key = item.id || item.indentItemId || item.materialId || `fallback-${idx}`;
      const reqQty = Number(item.quantity ?? item.requiredQuantity ?? 0);
      const appQty = approvedItemsMap[key] !== undefined ? approvedItemsMap[key] : reqQty;
      const matName = item.product?.name || item.materialName || selectedIndent.materialName || 'Material';

      if (appQty <= 0 && reqQty > 0) {
        await Swal.fire({
          title: 'Invalid Approved Quantity',
          text: `Approved quantity for "${matName}" must be greater than zero.`,
          icon: 'warning',
          confirmButtonColor: '#4F46E5'
        });
        return;
      }

      if (reqQty > 0 && appQty > reqQty) {
        await Swal.fire({
          title: 'Quantity Exceeded',
          text: `Approved quantity (${appQty}) cannot exceed requested quantity (${reqQty}) for "${matName}".`,
          icon: 'warning',
          confirmButtonColor: '#4F46E5'
        });
        return;
      }
    }

    const result = await Swal.fire({
      title: 'Approve Indent?',
      text: `Are you sure you want to approve indent ${selectedIndent.publicId || selectedIndent.indentNo || selectedIndent.id} and forward it to Finance?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, Approve & Forward'
    });

    if (!result.isConfirmed) return;

    try {
      setIsSubmitting(true);
      const finalApprovedItems = items.map((item, idx) => {
        const key = item.id || item.indentItemId || item.materialId || `fallback-${idx}`;
        const reqQty = Number(item.quantity ?? item.requiredQuantity ?? 0);
        const appQty = approvedItemsMap[key] !== undefined ? approvedItemsMap[key] : reqQty;
        return {
          ...item,
          id: item.id || item.indentItemId,
          indentItemId: item.indentItemId || item.id,
          productId: item.productId || item.product?.id || item.materialId,
          materialId: item.materialId || item.productId,
          materialCode: item.materialCode || item.product?.sku,
          approvedQty: appQty,
          approvedQuantity: appQty,
          quantity: reqQty > 0 ? reqQty : appQty
        };
      });

      const approvedId = selectedIndent.id;
      const approvedPublicId = selectedIndent.publicId || selectedIndent.indentNo || selectedIndent.id;

      await approveMaterialIndent(approvedId, finalApprovedItems, remarks || 'Approved by Plant Head', 'Plant Head');
      
      // Auto-switch to history tab and highlight newly approved indent
      setNewlyApprovedId(approvedId);
      setViewTab('history');
      setSelectedIndentId(null);
      setRemarks('');
      await refreshIndents();
      
      await Swal.fire({
        title: 'Indent Approved!',
        text: `Indent ${approvedPublicId} has been approved and moved to Approval History. It is now forwarded to Finance for PO issuance.`,
        icon: 'success',
        confirmButtonColor: '#10b981'
      });
      await refreshIndents();
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

    const { value: inputRemarks } = await Swal.fire({
      title: 'Return for Correction',
      input: 'textarea',
      inputLabel: 'Remarks',
      inputPlaceholder: 'Explain why the indent is being returned...',
      showCancelButton: true,
      confirmButtonText: 'Return Indent',
      confirmButtonColor: '#f59e0b',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Remarks are mandatory for returning an indent!';
        }
      }
    });

    if (!inputRemarks) return;

    try {
      setIsSubmitting(true);
      const returnedId = selectedIndent.id;
      const returnedPublicId = selectedIndent.publicId || selectedIndent.indentNo || selectedIndent.id;

      await returnIndentForCorrection(returnedId, inputRemarks, 'Plant Head');
      setNewlyApprovedId(returnedId);
      setViewTab('history');
      setSelectedIndentId(null);
      setRemarks('');
      await refreshIndents();
      
      await Swal.fire({
        title: 'Indent Returned',
        text: `Indent ${returnedPublicId} returned to Store for correction.`,
        icon: 'info',
        confirmButtonColor: '#f59e0b'
      });
      await refreshIndents();
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

  const handleReject = async () => {
    if (!selectedIndent) return;

    const { value: inputRemarks } = await Swal.fire({
      title: 'Reject Indent',
      input: 'textarea',
      inputLabel: 'Remarks',
      inputPlaceholder: 'Explain why the indent is being rejected...',
      showCancelButton: true,
      confirmButtonText: 'Reject Indent',
      confirmButtonColor: '#dc2626',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Remarks are mandatory for rejecting an indent!';
        }
      }
    });

    if (!inputRemarks) return;

    try {
      setIsSubmitting(true);
      const rejectedId = selectedIndent.id;
      const rejectedPublicId = selectedIndent.publicId || selectedIndent.indentNo || selectedIndent.id;

      await rejectMaterialIndent(rejectedId, inputRemarks, 'Plant Head');
      setNewlyApprovedId(rejectedId);
      setViewTab('history');
      setSelectedIndentId(null);
      setRemarks('');
      await refreshIndents();
      
      await Swal.fire({
        title: 'Indent Rejected',
        text: `Indent ${rejectedPublicId} has been rejected.`,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
      await refreshIndents();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Failed to reject indent',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewHistory = async (indent) => {
    try {
      const payload = await backendFetch(`/api/backend/procurement/indents/${indent.id}/history`);
      const history = Array.isArray(payload) ? payload : (payload.data || payload.items || []);
      
      if (!history.length) {
        Swal.fire('No History', 'No history found for this indent.', 'info');
        return;
      }

      const historyHtml = history.map(h => `
        <div style="text-align: left; padding: 12px; border-bottom: 1px solid #E2E8F0; font-family: sans-serif;">
          <div style="font-size: 11px; font-weight: bold; color: #94A3B8; text-transform: uppercase; margin-bottom: 4px;">
            ${new Date(h.createdAt).toLocaleString('en-IN')}
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #0F172A;">
            ${h.oldStatus ? `${h.oldStatus} &rarr; ${h.newStatus}` : h.newStatus}
          </div>
          ${h.remarks ? `<div style="font-size: 13px; color: #475569; margin-top: 6px; background: #F8FAFC; padding: 8px; border-radius: 6px; border: 1px solid #E2E8F0;"><i>" ${h.remarks} "</i></div>` : ''}
        </div>
      `).join('');

      Swal.fire({
        title: 'Indent History',
        html: `<div style="max-height: 400px; overflow-y: auto;">${historyHtml}</div>`,
        width: 600,
        showConfirmButton: true,
        confirmButtonText: 'Close',
        confirmButtonColor: '#4F46E5'
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to load history', 'error');
    }
  };

  const highPriorityCount = useMemo(() => {
    return pendingIndents.filter(i => (i.priority || '').toUpperCase() === 'HIGH' || (i.priority || '').toUpperCase() === 'URGENT').length;
  }, [pendingIndents]);

  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      padding: isMobile ? '12px 8px' : '20px',
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

          {/* KPI Stats Grid (Page-Specific 3 / 2 / 1 Grid) */}
          <div className="erp-kpi-grid-3" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '16px',
            width: '100%'
          }}>
            {/* Card 1 */}
            <div style={{
              background: '#ffffff',
              borderTop: '1px solid #E2E8F0',
              borderRight: '1px solid #E2E8F0',
              borderBottom: '1px solid #E2E8F0',
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
              borderTop: '1px solid #E2E8F0',
              borderRight: '1px solid #E2E8F0',
              borderBottom: '1px solid #E2E8F0',
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
              borderTop: '1px solid #E2E8F0',
              borderRight: '1px solid #E2E8F0',
              borderBottom: '1px solid #E2E8F0',
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
                  {allMaterialIndents.length}
                </span>
              </div>
              <FileText style={{ width: 28, height: 28, color: '#818CF8', opacity: 0.8 }} />
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', padding: '0 16px', marginTop: '10px' }}>
            <button
              onClick={() => setViewTab('pending')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 800,
                color: viewTab === 'pending' ? '#4F46E5' : '#64748B',
                borderBottom: viewTab === 'pending' ? '3px solid #4F46E5' : '3px solid transparent',
                cursor: 'pointer',
                marginBottom: '-2px',
                transition: 'all 0.2s'
              }}
            >
              Pending Approvals ({pendingIndents.length})
            </button>
            <button
              onClick={() => setViewTab('history')}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 800,
                color: viewTab === 'history' ? '#4F46E5' : '#64748B',
                borderBottom: viewTab === 'history' ? '3px solid #4F46E5' : '3px solid transparent',
                cursor: 'pointer',
                marginBottom: '-2px',
                transition: 'all 0.2s'
              }}
            >
              Approval History ({historyIndents.length})
            </button>
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
                {viewTab === 'pending' ? 'Pending Material Indents' : 'Approved & Processed Indents'}
              </h2>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                {viewTab === 'pending' ? 'Click Review to inspect line items' : 'Click History to view audit log'}
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
                    {displayedIndents.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '48px 20px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                          {viewTab === 'pending' ? 'No material indents currently pending Plant Head approval.' : 'No indent history found.'}
                        </td>
                      </tr>
                    ) : (
                      displayedIndents.map((indent) => {
                        const items = indent.items || [];
                        const displayMaterial = indent.materialName || items[0]?.product?.name || (items[0]?.materialName) || 'Material';
                        const reqQty = indent.requiredQuantity || indent.quantity || (items[0]?.quantity) || 0;
                        const unit = indent.unit || (items[0]?.unit) || 'PCS';
                        const isHigh = (indent.priority || '').toUpperCase() === 'HIGH' || (indent.priority || '').toUpperCase() === 'URGENT';
                        const isNewlyApproved = indent.id === newlyApprovedId;

                        return (
                          <tr
                            key={indent.id}
                            style={{
                              borderBottom: '1px solid #F1F5F9',
                              transition: 'background 0.15s',
                              backgroundColor: isNewlyApproved ? '#F0FDF4' : 'transparent',
                              boxShadow: isNewlyApproved ? 'inset 4px 0 0 #10B981' : undefined
                            }}
                          >
                            <td style={{ padding: '16px 20px', fontWeight: 900, color: '#0F172A', fontFamily: 'monospace' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{indent.publicId || indent.indentNo || indent.id}</span>
                                {isNewlyApproved && (
                                  <span style={{
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: 900,
                                    background: '#DCFCE7',
                                    color: '#166534',
                                    border: '1px solid #BBF7D0'
                                  }}>
                                    ✓ Just Approved
                                  </span>
                                )}
                              </div>
                            </td>
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
                              {viewTab === 'history' ? (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => handleSelectIndent(indent)}
                                    title="View approved details and items"
                                    style={{
                                      padding: '8px 14px',
                                      background: '#EEF2FF',
                                      color: '#4338CA',
                                      border: '1px solid #C7D2FE',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      transition: 'all 0.15s'
                                    }}
                                  >
                                    <Eye style={{ width: 14, height: 14 }} />
                                    View Details →
                                  </button>
                                  <button
                                    onClick={() => handleViewHistory(indent)}
                                    title="View audit log timeline"
                                    style={{
                                      padding: '8px 12px',
                                      background: '#F1F5F9',
                                      color: '#475569',
                                      border: '1px solid #E2E8F0',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      transition: 'all 0.15s'
                                    }}
                                  >
                                    <History style={{ width: 14, height: 14 }} />
                                    Timeline
                                  </button>
                                </div>
                              ) : (
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
                              )}
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
                {displayedIndents.length === 0 ? (
                  <div style={{ padding: '36px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '13px', fontWeight: 600 }}>
                    {viewTab === 'pending' ? 'No material indents currently pending Plant Head approval.' : 'No indent history found.'}
                  </div>
                ) : (
                  displayedIndents.map((indent) => {
                    const items = indent.items || [];
                    const displayMaterial = indent.materialName || items[0]?.product?.name || (items[0]?.materialName) || 'Material';
                    const reqQty = indent.requiredQuantity || indent.quantity || (items[0]?.quantity) || 0;
                    const unit = indent.unit || (items[0]?.unit) || 'PCS';
                    const isHigh = (indent.priority || '').toUpperCase() === 'HIGH' || (indent.priority || '').toUpperCase() === 'URGENT';
                    const isNewlyApproved = indent.id === newlyApprovedId;

                    return (
                      <div key={indent.id} style={{
                        padding: '16px',
                        borderBottom: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        background: isNewlyApproved ? '#F0FDF4' : '#ffffff',
                        borderLeft: isNewlyApproved ? '4px solid #10B981' : undefined
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 950, color: '#0F172A', fontFamily: 'monospace' }}>{indent.publicId || indent.indentNo || indent.id}</span>
                            {isNewlyApproved && (
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 900,
                                background: '#DCFCE7',
                                color: '#166534',
                                border: '1px solid #BBF7D0'
                              }}>
                                ✓ Just Approved
                              </span>
                            )}
                          </div>
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

                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          {viewTab === 'history' ? (
                            <>
                              <button
                                onClick={() => handleSelectIndent(indent)}
                                style={{
                                  flex: 1,
                                  padding: '10px',
                                  background: '#EEF2FF',
                                  color: '#4338CA',
                                  border: '1px solid #C7D2FE',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Eye style={{ width: 14, height: 14 }} />
                                View Details →
                              </button>
                              <button
                                onClick={() => handleViewHistory(indent)}
                                style={{
                                  flex: 1,
                                  padding: '10px',
                                  background: '#F1F5F9',
                                  color: '#475569',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px'
                                }}
                              >
                                <History style={{ width: 14, height: 14 }} />
                                Timeline
                              </button>
                            </>
                          ) : (
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
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Detailed Indent Approval & Qty Adjustment Form / Read-only Inspection View */
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
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to {viewTab === 'history' || isReadOnly ? 'Approval History' : 'Pending Approvals List'}
          </button>

          {/* Approved Banner if already approved / read-only */}
          {isReadOnly && (
            <div style={{
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle style={{ width: 26, height: 26, color: '#059669', flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#065F46', margin: 0 }}>
                    Indent Approved & Forwarded to Finance
                  </h3>
                  <p style={{ fontSize: '12px', color: '#047857', margin: '2px 0 0 0' }}>
                    This material indent has been reviewed and authorized by Plant Head. It is recorded in Approval History.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleViewHistory(selectedIndent)}
                style={{
                  padding: '8px 16px',
                  background: '#FFFFFF',
                  border: '1px solid #A7F3D0',
                  color: '#047857',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <History style={{ width: 14, height: 14 }} /> View Audit Timeline
              </button>
            </div>
          )}

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
                    {isReadOnly ? 'Indent Details:' : 'Review Indent:'} {selectedIndent.publicId || selectedIndent.indentNo || selectedIndent.id}
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
                {isReadOnly ? 'Line Items & Authorized Quantities' : 'Line Items & Approved Quantity Authorization'}
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                {isReadOnly ? 'Approved material quantities authorized for procurement.' : 'Modify the approved quantity if needed before releasing to Finance.'}
              </p>
            </div>

            {/* Desktop Table View */}
            {!isMobile ? (
              <div className="erp-table-responsive" style={{ width: '100%', overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      <th style={{ padding: '14px 20px' }}>Material Details</th>
                      <th style={{ padding: '14px 20px' }}>Material Code</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right' }}>Requested Qty</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right' }}>{isReadOnly ? 'Approved Qty' : 'Approved Qty (Adjustable)'}</th>
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
                    ]).map((item, idx) => {
                      const itemKey = item.id || item.indentItemId || item.materialId || `fallback-${idx}`;
                      const approvedVal = approvedItemsMap[itemKey] !== undefined ? approvedItemsMap[itemKey] : (item.quantity || item.requiredQuantity || 0);

                      return (
                        <tr key={itemKey} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '16px 20px', fontWeight: 800, color: '#0F172A' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Package style={{ width: 18, height: 18, color: '#4F46E5', flexShrink: 0 }} />
                              <span>{item.product?.name || item.materialName || selectedIndent.materialName || 'Unknown Material'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontWeight: 700, color: '#64748B' }}>
                            {item.product?.sku || item.product?.id?.slice(0, 8) || item.productId?.slice(0, 8) || item.materialId || selectedIndent.materialCode || '-'}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 800, color: '#334155' }}>
                            {item.quantity || item.requiredQuantity || selectedIndent.requiredQuantity} {item.unit || selectedIndent.unit || 'PCS'}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            {isReadOnly ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                background: '#ECFDF5',
                                color: '#065F46',
                                border: '1px solid #A7F3D0',
                                borderRadius: '8px',
                                fontWeight: 900,
                                fontSize: '13px'
                              }}>
                                <CheckCircle style={{ width: 15, height: 15, color: '#059669' }} />
                                {approvedVal} {item.unit || selectedIndent.unit || 'PCS'} Approved
                              </span>
                            ) : (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="number"
                                  min="0"
                                  max={item.quantity || item.requiredQuantity || 999999}
                                  value={approvedVal}
                                  onChange={(e) => handleQtyChange(itemKey, e.target.value, item.quantity || item.requiredQuantity)}
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
                            )}
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
                    id: selectedIndent.id + "-ITEM-1",
                    indentItemId: selectedIndent.id + "-ITEM-1",
                    productId: selectedIndent.productId || selectedIndent.materialId || selectedIndent.materialCode || '',
                    materialId: selectedIndent.materialId || selectedIndent.materialCode || '',
                    materialName: selectedIndent.materialName || 'Material',
                    quantity: selectedIndent.requiredQuantity || selectedIndent.quantity || 0,
                    unit: selectedIndent.unit || 'PCS'
                  }
                ]).map((item, idx) => {
                  const itemKey = item.id || item.indentItemId || item.materialId || `fallback-${idx}`;
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
                        {isReadOnly ? (
                          <div style={{
                            padding: '10px 12px',
                            background: '#ECFDF5',
                            border: '1px solid #A7F3D0',
                            borderRadius: '8px',
                            fontWeight: 900,
                            color: '#065F46',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <CheckCircle style={{ width: 16, height: 16, color: '#059669' }} />
                            <span>{approvedVal} {item.unit || selectedIndent.unit || 'PCS'} Approved</span>
                          </div>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            max={item.quantity || item.requiredQuantity || 999999}
                            value={approvedVal}
                            onChange={(e) => handleQtyChange(itemKey, e.target.value, item.quantity || item.requiredQuantity)}
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
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isReadOnly ? (
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              background: '#ffffff',
              padding: '16px 24px',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <button
                type="button"
                onClick={() => setSelectedIndentId(null)}
                style={{
                  width: isMobile ? '100%' : 'auto',
                  padding: '12px 24px',
                  background: '#4F46E5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
                }}
              >
                <ArrowLeft style={{ width: 16, height: 16 }} /> Back to {viewTab === 'history' || isReadOnly ? 'Approval History' : 'Pending Approvals List'}
              </button>
              <button
                type="button"
                onClick={() => handleViewHistory(selectedIndent)}
                style={{
                  width: isMobile ? '100%' : 'auto',
                  padding: '12px 20px',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
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
                <History style={{ width: 16, height: 16 }} /> View Audit Timeline
              </button>
            </div>
          ) : (
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
                onClick={handleReject}
                disabled={isSubmitting}
                style={{
                  width: isMobile ? '100%' : 'auto',
                  padding: '12px 20px',
                  border: '2px solid #FCA5A5',
                  background: '#FEF2F2',
                  color: '#991B1B',
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
                Reject Indent
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
          )}
        </div>
      )}
    </div>
  );
}

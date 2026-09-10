import React, { useEffect, useState, useMemo } from 'react';
import { useERPStore } from '../../../store/erpStore';
import { syncProcurementData, verifyPODelivery } from '../../../store/procurementActions';
import { DeliveryDocumentUploader } from '../components/DeliveryDocumentUploader';
import {
  Package,
  Search,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  RotateCcw,
  LayoutGrid,
  List,
  FileText,
  Calendar,
  Building2,
  Sparkles,
  ClipboardCheck,
  Check,
  XCircle,
  Hash,
  ShieldCheck,
  ArrowRight,
  Boxes,
  FileCheck2,
  Layers
} from 'lucide-react';
import Swal from 'sweetalert2';

const EMPTY_REJECTIONS = [];

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDeliveryUrgency = (dateVal) => {
  if (!dateVal) return { text: 'No due date', color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0', isUrgent: false };
  const target = new Date(dateVal);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `Overdue by ${Math.abs(diffDays)}d`, color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', isUrgent: true };
  } else if (diffDays === 0) {
    return { text: 'Due Today', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', isUrgent: true };
  } else if (diffDays === 1) {
    return { text: 'Due Tomorrow', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', isUrgent: true };
  } else {
    return { text: `Due in ${diffDays}d`, color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', isUrgent: false };
  }
};

export default function VerifyPODelivery() {
  const purchaseOrders = useERPStore(state => state.state?.procurement?.purchaseOrders || state.state?.purchaseOrders || []);
  const materialRejections = useERPStore(state => state.state?.materialRejections ?? EMPTY_REJECTIONS);

  const [selectedPOId, setSelectedPOId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState('pending'); // 'pending' | 'history'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'REPLACEMENT'
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'table'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Delivery Recording Form State
  const [deliveryItems, setDeliveryItems] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [challanNumber, setChallanNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReplacement, setSelectedReplacement] = useState(null);

  // Sync fresh procurement records on mount
  useEffect(() => {
    void syncProcurementData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await syncProcurementData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const replacementByPO = useMemo(() => new Map(
    materialRejections
      .filter(rejection => ['REPLACEMENT_EXPECTED', 'PARTIALLY_RESOLVED'].includes(rejection.status))
      .map(rejection => [rejection.purchaseOrderId || rejection.poId, rejection])
  ), [materialRejections]);

  const replacementHistoryByPO = useMemo(() => new Map(
    materialRejections
      .filter(rejection => ['REPLACEMENT_RECEIVED', 'RESOLVED'].includes(rejection.status))
      .map(rejection => [rejection.purchaseOrderId || rejection.poId, rejection])
  ), [materialRejections]);

  const pendingPOs = useMemo(() => purchaseOrders.filter(po =>
    ['ORDERED', 'PO_ISSUED', 'VENDOR_ACCEPTED', 'IN_TRANSIT', 'PARTIALLY_RECEIVED', 'DELIVERY_PENDING', 'PARTIALLY_DELIVERED', 'DELIVERY_PENDING_FINANCE_AUDIT'].includes(po.status) ||
    replacementByPO.has(po.id)
  ), [purchaseOrders, replacementByPO]);

  const completedPOs = useMemo(() => purchaseOrders.filter(po =>
    [
      'DELIVERY_PENDING_FINANCE_AUDIT',
      'PARTIALLY_DELIVERED_PENDING_AUDIT',
      'COMPLETED',
      'GRN_RECEIVED',
      'FULLY_RECEIVED',
      'CLOSED',
      'STOCK_POSTED',
      'PAYMENT_COMPLETED',
      'FINANCE_AUDIT_APPROVED',
    ].includes(po.status)
  ), [purchaseOrders]);

  // KPI Metrics Calculations
  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const urgentCount = pendingPOs.filter(p => {
      const d = p.expectedDeliveryDate || p.deliveryDate;
      if (!d) return false;
      const target = new Date(d);
      target.setHours(0, 0, 0, 0);
      return target <= today;
    }).length;

    const replacementCount = pendingPOs.filter(p => replacementByPO.has(p.id)).length;

    return {
      pending: pendingPOs.length,
      urgent: urgentCount,
      replacements: replacementCount,
      completed: completedPOs.length
    };
  }, [pendingPOs, completedPOs, replacementByPO]);

  // Filtering
  const filteredPOs = useMemo(() => {
    const list = viewTab === 'pending' ? pendingPOs : completedPOs;
    const query = searchQuery.trim().toLowerCase();

    return list.filter(po => {
      // Status Filter
      if (viewTab === 'pending' && statusFilter !== 'ALL') {
        if (statusFilter === 'REPLACEMENT') {
          if (!replacementByPO.has(po.id)) return false;
        } else if (statusFilter === 'PARTIALLY_RECEIVED') {
          if (!['PARTIALLY_RECEIVED', 'PARTIALLY_DELIVERED'].includes(po.status)) return false;
        } else if (statusFilter === 'ORDERED') {
          if (!['ORDERED', 'PO_ISSUED', 'VENDOR_ACCEPTED', 'IN_TRANSIT'].includes(po.status)) return false;
        }
      }

      // Search Query
      if (!query) return true;
      const poNum = String(po.poNumber || po.publicId || po.id || '').toLowerCase();
      const vendor = String(po.supplier?.name || po.vendorName || po.snapshot?.vendorName || po.vendorDisplayName || '').toLowerCase();
      const indent = String(po.purchaseIndent?.publicId || po.indentRef || po.purchaseIndentId || '').toLowerCase();
      const itemMatch = (po.items || []).some(item =>
        (item.product?.name || item.materialName || '').toLowerCase().includes(query)
      );

      return poNum.includes(query) || vendor.includes(query) || indent.includes(query) || itemMatch;
    });
  }, [viewTab, pendingPOs, completedPOs, statusFilter, searchQuery, replacementByPO]);

  const selectedPO = useMemo(() => purchaseOrders.find(p => p.id === selectedPOId) || null, [purchaseOrders, selectedPOId]);

  const handleSelectPO = (poId) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;
    setSelectedPOId(po.id);
    const replacement = replacementByPO.get(po.id);
    setSelectedReplacement(replacement || null);
    setChallanNumber('');
    setVehicleNumber('');
    setRemarks('');
    setAttachments([]);

    const initialItems = replacement ? (po.items || []).filter(item =>
      (item.productId || item.materialId) === replacement.materialId,
    ).map(item => ({
      purchaseOrderItemId: item.id,
      productId: item.productId || item.materialId,
      materialName: item.product?.name || item.materialName || replacement.materialName || 'Replacement material',
      remainingSupplyQty: Number(replacement.remainingResolutionQty || replacement.rejectedQty || 0),
      orderedQty: Number(replacement.remainingResolutionQty || replacement.rejectedQty || 0),
      deliveredQty: 0,
      acceptedQty: 0,
      rejectedQty: 0,
      unit: item.unit || item.product?.unit || 'Nos',
      inspectionRemarks: '',
    })) : (po.items || []).map(item => {
      const ordered = Number(item.quantity ?? item.orderedQty ?? 0);
      const delivered = Number(item.cumulativeDeliveredQty ?? item.receivedQuantity ?? 0);
      const remaining = Math.max(0, ordered - delivered);

      return {
        purchaseOrderItemId: item.id,
        productId: item.productId || item.materialId,
        materialName: item.product?.name || item.materialName || 'Material',
        remainingSupplyQty: remaining,
        orderedQty: ordered,
        deliveredQty: 0,
        acceptedQty: 0,
        rejectedQty: 0,
        unit: item.unit || item.product?.unit || 'Nos',
        inspectionRemarks: '',
      };
    });

    setDeliveryItems(initialItems);
  };

  const handleQtyChange = (productId, field, value) => {
    const numValue = value === '' ? 0 : Math.max(0, Number(value));

    setDeliveryItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const deliveredQty = Math.min(numValue, item.remainingSupplyQty);
        return {
          ...item,
          deliveredQty,
          acceptedQty: deliveredQty,
          rejectedQty: 0
        };
      }
      return item;
    }));
  };

  const handleLineRemarksChange = (productId, text) => {
    setDeliveryItems(prev => prev.map(item => {
      if (item.productId === productId) {
        return { ...item, inspectionRemarks: text };
      }
      return item;
    }));
  };

  // 1-Click Quick Action: Receive Full Order
  const handleAutoFillAll = () => {
    setDeliveryItems(prev => prev.map(item => ({
      ...item,
      deliveredQty: item.remainingSupplyQty,
      acceptedQty: item.remainingSupplyQty,
      rejectedQty: 0
    })));
  };

  // 1-Click Quick Action: Reset All
  const handleResetAll = () => {
    setDeliveryItems(prev => prev.map(item => ({
      ...item,
      deliveredQty: 0,
      acceptedQty: 0,
      rejectedQty: 0,
      inspectionRemarks: ''
    })));
  };

  // Live tally for the selected PO
  const deliverySummary = useMemo(() => {
    let totalOrdered = 0;
    let totalDelivered = 0;

    deliveryItems.forEach(item => {
      totalOrdered += item.remainingSupplyQty || 0;
      totalDelivered += item.deliveredQty || 0;
    });

    const completionRate = totalOrdered > 0 ? Math.round((totalDelivered / totalOrdered) * 100) : 0;
    const remainingToDeliver = Math.max(0, totalOrdered - totalDelivered);

    return { totalOrdered, totalDelivered, totalAccepted: totalDelivered, totalRejected: 0, completionRate, remainingToDeliver };
  }, [deliveryItems]);

  const handleSubmitGRN = async () => {
    const activeItems = deliveryItems.filter(i => i.deliveredQty > 0);
    if (activeItems.length === 0) {
      return Swal.fire({
        icon: 'error',
        title: 'No Quantities Entered',
        text: 'Please enter a delivered quantity greater than 0 for at least one material.',
        confirmButtonColor: '#2563eb'
      });
    }

    const confirmResult = await Swal.fire({
      title: 'Confirm Goods Receipt?',
      html: `
        <div style="text-align: left; font-size: 13.5px; color: #334155; line-height: 1.6; background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0; margin-top: 8px;">
          <div><strong>PO Reference:</strong> ${selectedPO.poNumber || selectedPO.publicId || selectedPO.id}</div>
          <div><strong>Vendor:</strong> ${selectedPO.supplier?.name || selectedPO.vendorName || selectedPO.snapshot?.vendorName || 'Supplier'}</div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1;">
            <span style="color: #059669; font-weight: 700;">✓ Total Delivered: ${deliverySummary.totalDelivered} Units</span>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Create GRN',
      cancelButtonText: 'Review Items',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#64748b',
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setIsSubmitting(true);
      const cleanAttachments = (attachments || []).map(att => {
        if (typeof att === 'string' && att.length > 50000) {
          return { name: 'Uploaded File', size: att.length, preview: att.slice(0, 200) + '...' };
        }
        return att;
      });

      const grnPayload = {
        warehouseId: selectedPO.warehouseId || (useERPStore.getState().state.warehouses?.[0]?.id),
        // Top-level fields that backend verifyDelivery() reads directly
        challanNumber: challanNumber.trim() || undefined,
        vehicleNumber: vehicleNumber.trim() || undefined,
        remarks: remarks.trim() || undefined,
        attachments: cleanAttachments,
        snapshot: {
          remarks: remarks.trim() || undefined,
          challanNumber: challanNumber.trim() || undefined,
          vehicleNumber: vehicleNumber.trim() || undefined,
          attachments: cleanAttachments
        },
        items: activeItems.map(item => ({
          purchaseOrderItemId: item.purchaseOrderItemId || item.id,
          productId: item.productId,
          receivedQuantity: item.deliveredQty,
          acceptedQuantity: item.acceptedQty,
          rejectedQuantity: item.rejectedQty,
          inspectionRemarks: item.inspectionRemarks || ''
        }))
      };

      let grnResult = null;
      if (selectedReplacement) {
        grnResult = await verifyPODelivery(selectedPO.id, grnPayload, {
          replacementId: selectedReplacement.id,
          resolutionQty: activeItems.reduce((acc, item) => acc + item.acceptedQty, 0),
          resolved: activeItems.reduce((acc, item) => acc + item.acceptedQty, 0) >= selectedReplacement.remainingResolutionQty,
        });
      } else {
        grnResult = await verifyPODelivery(selectedPO.id, grnPayload);
      }
      const grn = grnResult?.delivery || grnResult?.data?.delivery || grnResult;

      await syncProcurementData();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('inventory-updated'));
      }
      Swal.fire({
        icon: 'success',
        title: '✅ Delivery Confirmed!',
        html: `<div style="text-align:left;font-size:13.5px;color:#334155;">
          <p style="margin:0 0 8px 0;">GRN <strong>${grn?.grnNumber || grn?.publicId || ''}</strong> has been generated successfully.</p>
          <p style="margin:0 0 4px 0;">Raw inventory has been updated immediately.</p>
          <p style="margin:0;color:#D97706;font-weight:700;">⏳ Awaiting Finance Audit approval to close the Purchase Order.</p>
        </div>`,
        confirmButtonColor: '#2563eb'
      });

      setSelectedPOId(null);
    } catch (err) {
      console.error('Verify Delivery Error:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Could not verify delivery. Please check network connection and try again.';
      Swal.fire({
        icon: 'error',
        title: 'Submission Blocked',
        text: errMsg,
        confirmButtonColor: '#2563eb'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` }}>
      <style>{`
        .store-stat-card {
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .store-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px -4px rgba(0,0,0,0.08);
        }
        .delivery-po-card {
          background: #ffffff;
          border: 1.5px solid #E2E8F0;
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 16px;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .delivery-po-card:hover {
          border-color: #2563EB;
          box-shadow: 0 12px 24px -6px rgba(37, 99, 235, 0.12);
          transform: translateY(-3px);
        }
        .delivery-po-card:hover .po-card-cta {
          background: #1D4ED8 !important;
          color: #ffffff !important;
        }
        .store-table-row {
          transition: background 0.15s ease;
        }
        .store-table-row:hover {
          background: #F8FAFC !important;
        }
        .qty-input {
          width: 100%;
          box-sizing: border-box;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 700;
          text-align: center;
          outline: none;
          transition: all 0.15s ease;
        }
        .qty-input:focus {
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .pulse-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulseAnim 1.8s infinite;
        }
        @keyframes pulseAnim {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(37, 99, 235, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        .table-scroll-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          width: 100%;
        }
        @media (max-width: 768px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .delivery-cards-grid { grid-template-columns: 1fr !important; }
          .filter-bar-wrap { flex-direction: column !important; align-items: stretch !important; }
          .search-input-wrap { width: 100% !important; }
          .gate-details-grid { grid-template-columns: 1fr !important; }
          .hero-delivery-banner { padding: 18px 16px !important; border-radius: 12px !important; }
          .hero-delivery-title { font-size: 20px !important; }
          .hero-info-grid { grid-template-columns: 1fr !important; }
          .inspection-card { padding: 16px 14px !important; border-radius: 12px !important; }
          .inspection-header-wrap { flex-direction: column !important; align-items: flex-start !important; }
          .accelerators-wrap { width: 100% !important; }
          .accelerators-wrap button { flex: 1 !important; justify-content: center !important; }
          .delivery-summary-card { padding: 14px !important; flex-direction: column !important; align-items: stretch !important; }
          .summary-stats-wrap { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
          .summary-divider { display: none !important; }
          .gate-card { padding: 16px 14px !important; border-radius: 12px !important; }
          .delivery-actions-bar {
            flex-direction: column-reverse !important;
            align-items: stretch !important;
            padding: 14px 12px !important;
          }
          .delivery-btn-cancel, .delivery-btn-submit {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
          }
          .qty-col-header, .qty-col-cell {
            width: 130px !important;
          }
        }
        @media (max-width: 500px) {
          .kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {!selectedPO ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: KPI Dashboard */}
          <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {/* KPI 1: Pending Inward */}
            <div className="store-stat-card" style={{ background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)', border: '1px solid #BAE6FD' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#0284C7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Truck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Inward</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#0C4A6E', marginTop: '2px' }}>{metrics.pending}</div>
                <div style={{ fontSize: '11px', color: '#0284C7', marginTop: '2px', fontWeight: 600 }}>Awaiting gate delivery</div>
              </div>
            </div>

            {/* KPI 2: Due Today / Urgent */}
            <div className="store-stat-card" style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', border: '1px solid #FDE68A' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#D97706', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={22} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Action Urgent</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#78350F', marginTop: '2px' }}>{metrics.urgent}</div>
                <div style={{ fontSize: '11px', color: '#D97706', marginTop: '2px', fontWeight: 600 }}>Due today or overdue</div>
              </div>
            </div>

            {/* KPI 3: Replacement Shipments */}
            <div className="store-stat-card" style={{ background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)', border: '1px solid #E9D5FF' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#7E22CE', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <RotateCcw size={22} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Replacements</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#581C87', marginTop: '2px' }}>{metrics.replacements}</div>
                <div style={{ fontSize: '11px', color: '#7E22CE', marginTop: '2px', fontWeight: 600 }}>Vendor rejected resolutions</div>
              </div>
            </div>

            {/* KPI 4: Completed / Audited */}
            <div className="store-stat-card" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', border: '1px solid #A7F3D0' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Verified Deliveries</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#064E3B', marginTop: '2px' }}>{metrics.completed}</div>
                <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px', fontWeight: 600 }}>GRN completed & audited</div>
              </div>
            </div>
          </div>

          {/* Section 2: Control Toolbar (Tabs, Filters, Search, View Modes) */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #E2E8F0', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="filter-bar-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {/* Left: View Tabs */}
              <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
                <button
                  type="button"
                  onClick={() => setViewTab('pending')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: viewTab === 'pending' ? '#2563EB' : 'transparent',
                    color: viewTab === 'pending' ? '#ffffff' : '#475569',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.18s'
                  }}
                >
                  <Truck size={16} />
                  Pending Inward
                  <span style={{
                    background: viewTab === 'pending' ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                    color: viewTab === 'pending' ? '#ffffff' : '#334155',
                    padding: '1px 7px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 900
                  }}>{pendingPOs.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewTab('history')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: viewTab === 'history' ? '#2563EB' : 'transparent',
                    color: viewTab === 'history' ? '#ffffff' : '#475569',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.18s'
                  }}
                >
                  <FileCheck2 size={16} />
                  Delivery History
                  <span style={{
                    background: viewTab === 'history' ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                    color: viewTab === 'history' ? '#ffffff' : '#334155',
                    padding: '1px 7px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 900
                  }}>{completedPOs.length}</span>
                </button>
              </div>

              {/* Right: Search, Refresh, Layout Mode Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div className="search-input-wrap" style={{ position: 'relative', width: '280px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Search PO, Vendor, Material..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 34px 9px 36px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#1E293B',
                      outline: 'none',
                      background: '#FAFAFA'
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
                    >✕</button>
                  )}
                </div>

                {/* Layout Toggle */}
                <div style={{ display: 'flex', border: '1.5px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('grid')}
                    title="Grid View"
                    style={{
                      padding: '8px 10px',
                      background: layoutMode === 'grid' ? '#2563EB' : '#ffffff',
                      color: layoutMode === 'grid' ? '#ffffff' : '#64748B',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('table')}
                    title="Table View"
                    style={{
                      padding: '8px 10px',
                      background: layoutMode === 'table' ? '#2563EB' : '#ffffff',
                      color: layoutMode === 'table' ? '#ffffff' : '#64748B',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <List size={16} />
                  </button>
                </div>

                {/* Refresh Button */}
                <button
                  type="button"
                  onClick={handleRefresh}
                  title="Refresh Procurement Queue"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RotateCcw size={15} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Filter Chips (when in Pending Inward) */}
            {viewTab === 'pending' && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px dashed #E2E8F0', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginRight: '4px' }}>Filter Status:</span>
                {[
                  { id: 'ALL', label: 'All Shipments' },
                  { id: 'ORDERED', label: 'In Transit / Ordered' },
                  { id: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
                  { id: 'REPLACEMENT', label: 'Replacements Only' }
                ].map(chip => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setStatusFilter(chip.id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      border: statusFilter === chip.id ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                      background: statusFilter === chip.id ? '#EFF6FF' : '#ffffff',
                      color: statusFilter === chip.id ? '#1D4ED8' : '#64748B',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Content (Grid View or Table View) */}
          {filteredPOs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '54px 20px', background: '#ffffff', borderRadius: '14px', border: '1.5px dashed #CBD5E1' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Boxes size={30} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0' }}>
                {searchQuery ? 'No matching shipments found' : viewTab === 'pending' ? 'No pending deliveries in queue' : 'No completed deliveries recorded'}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                {searchQuery ? 'Try clearing your search query or adjusting your status filters.' : 'Newly issued purchase orders from Finance will appear here for gate verification.'}
              </p>
            </div>
          ) : layoutMode === 'grid' ? (
            /* Grid View */
            <div className="delivery-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
              {filteredPOs.map(po => {
                const poNumber = po.poNumber || po.publicId || po.id;
                const vendorName = po.supplier?.name || po.vendorName || po.snapshot?.vendorName || po.vendorDisplayName || 'Supplier';
                const dueDate = po.expectedDeliveryDate || po.deliveryDate;
                const urgency = getDeliveryUrgency(dueDate);
                const isReplacement = replacementByPO.has(po.id);
                const items = po.items || [];
                const totalUnits = items.reduce((sum, it) => sum + Number(it.quantity || it.orderedQty || 0), 0);
                const receivedUnits = items.reduce((sum, it) => sum + Number(it.cumulativeDeliveredQty || it.receivedQuantity || 0), 0);
                const pct = totalUnits > 0 ? Math.min(100, Math.round((receivedUnits / totalUnits) * 100)) : 0;
                const indentRef = po.purchaseIndent?.publicId || po.indentRef || po.purchaseIndentId || '';

                return (
                  <div key={po.id} className="delivery-po-card" onClick={() => handleSelectPO(po.id)}>
                    <div>
                      {/* Top Bar: PO ID + Urgency + Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '14px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>{poNumber}</span>
                            {isReplacement && (
                              <span style={{ background: '#FAF5FF', color: '#7E22CE', border: '1px solid #E9D5FF', borderRadius: '6px', padding: '2px 6px', fontSize: '10.5px', fontWeight: 900 }}>
                                REPLACEMENT
                              </span>
                            )}
                          </div>
                          {indentRef && (
                            <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600, marginTop: '3px' }}>
                              Indent: <strong style={{ color: '#0284C7' }}>{indentRef}</strong>
                            </div>
                          )}
                        </div>

                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: urgency.bg,
                          color: urgency.color,
                          border: `1px solid ${urgency.border}`,
                          whiteSpace: 'nowrap'
                        }}>
                          {urgency.text}
                        </span>
                      </div>

                      {/* Vendor Banner */}
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '13px', flexShrink: 0 }}>
                          <Building2 size={18} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Vendor</div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {vendorName}
                          </div>
                        </div>
                      </div>

                      {/* Materials Preview Chips */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                          <span>Material Manifest</span>
                          <span>{items.length} {items.length === 1 ? 'Line' : 'Lines'}</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {items.slice(0, 2).map((it, idx) => (
                            <span key={idx} style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '4px 8px', fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                              {it.product?.name || it.materialName || 'Material'} ({it.quantity || it.orderedQty} {it.unit || 'Nos'})
                            </span>
                          ))}
                          {items.length > 2 && (
                            <span style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '4px 8px', fontSize: '11.5px', fontWeight: 700, color: '#64748B' }}>
                              +{items.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delivery Intake Progress */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748B', fontWeight: 600, marginBottom: '5px' }}>
                          <span>Received Units</span>
                          <strong style={{ color: '#0F172A' }}>{receivedUnits} / {totalUnits} ({pct}%)</strong>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#10B981' : '#2563EB', borderRadius: '10px', transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    </div>

                    {/* Footer CTA */}
                    <div style={{ paddingTop: '14px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                        <Calendar size={14} color="#94A3B8" />
                        Due: {formatDate(dueDate)}
                      </div>

                      <button
                        type="button"
                        className="po-card-cta"
                        style={{
                          padding: '7px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#EFF6FF',
                          color: '#2563EB',
                          fontWeight: 800,
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {viewTab === 'pending' ? 'Receive & Verify' : 'View GRN'} <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
                  <thead style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                    <tr>
                      <th style={{ padding: '14px 18px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>PO Reference</th>
                      <th style={{ padding: '14px 18px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Vendor</th>
                      <th style={{ padding: '14px 18px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Indent Ref</th>
                      <th style={{ padding: '14px 18px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Items & Scope</th>
                      <th style={{ padding: '14px 18px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Due Schedule</th>
                      <th style={{ padding: '14px 18px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '14px 18px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPOs.map(po => {
                      const poNumber = po.poNumber || po.publicId || po.id;
                      const vendorName = po.supplier?.name || po.vendorName || po.snapshot?.vendorName || po.vendorDisplayName || 'Supplier';
                      const dueDate = po.expectedDeliveryDate || po.deliveryDate;
                      const urgency = getDeliveryUrgency(dueDate);
                      const items = po.items || [];
                      const totalUnits = items.reduce((sum, it) => sum + Number(it.quantity || it.orderedQty || 0), 0);
                      const indentRef = po.purchaseIndent?.publicId || po.indentRef || po.purchaseIndentId || '—';

                      return (
                        <tr key={po.id} className="store-table-row" style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 18px' }}>
                            <strong style={{ fontSize: '13.5px', color: '#0F172A' }}>{poNumber}</strong>
                            {replacementByPO.has(po.id) && (
                              <div style={{ fontSize: '10px', color: '#7E22CE', fontWeight: 800, marginTop: '2px' }}>★ REPLACEMENT</div>
                            )}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                            {vendorName}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '12.5px', color: '#0284C7', fontWeight: 700 }}>
                            {indentRef}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B' }}>{items.length} {items.length === 1 ? 'Item' : 'Items'}</div>
                            <div style={{ fontSize: '11.5px', color: '#64748B' }}>Total {totalUnits} Units</div>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E293B' }}>{formatDate(dueDate)}</div>
                            <span style={{ fontSize: '10.5px', fontWeight: 800, color: urgency.color }}>{urgency.text}</span>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: '#EFF6FF',
                              color: '#1D4ED8',
                              border: '1px solid #DBEAFE',
                              textTransform: 'uppercase'
                            }}>
                              {po.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleSelectPO(po.id)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#2563EB',
                                color: '#ffffff',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              Verify <ArrowRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Section 4: Single PO Inward & GRN Recording Workspace */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Bar: Back Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setSelectedPOId(null)}
              style={{
                border: '1.5px solid #CBD5E1',
                background: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.15s'
              }}
            >
              <ChevronLeft size={16} /> Back to Inward Deliveries
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Status:</span>
              <span style={{
                background: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #DBEAFE',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                {selectedPO.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Hero Order Header Banner */}
          <div className="hero-delivery-banner" style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            borderRadius: '16px',
            padding: '24px 28px',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Purchase Order Gate Inward & Inspection
                </div>
                <h2 className="hero-delivery-title" style={{ fontSize: '24px', fontWeight: 900, margin: '4px 0 6px 0', color: '#ffffff' }}>
                  {selectedPO.poNumber || selectedPO.publicId || selectedPO.id}
                </h2>
                <div style={{ fontSize: '13px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span>Indent Ref: <strong style={{ color: '#60A5FA' }}>{selectedPO.purchaseIndent?.publicId || selectedPO.indentRef || selectedPO.purchaseIndentId || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>Order Date: <strong>{formatDate(selectedPO.createdAt)}</strong></span>
                  <span>•</span>
                  <span>Expected Due: <strong>{formatDate(selectedPO.expectedDeliveryDate || selectedPO.deliveryDate)}</strong></span>
                </div>
              </div>

              {selectedReplacement && (
                <div style={{ background: '#7E22CE', color: '#ffffff', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RotateCcw size={14} /> REPLACEMENT RESOLUTION
                </div>
              )}
            </div>

            {/* 3-Column Info Cards */}
            <div className="hero-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {/* Vendor */}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Vendor Details</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                  {selectedPO.supplier?.name || selectedPO.vendorName || selectedPO.snapshot?.vendorName || 'Supplier'}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                  GSTIN: {selectedPO.supplier?.gstin || selectedPO.gstin || 'Registered Vendor'}
                </div>
              </div>

              {/* Delivery Schedule */}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Delivery Schedule</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                  {formatDate(selectedPO.expectedDeliveryDate || selectedPO.deliveryDate)}
                </div>
                <div style={{ fontSize: '12px', color: '#FCD34D', marginTop: '2px', fontWeight: 700 }}>
                  {getDeliveryUrgency(selectedPO.expectedDeliveryDate || selectedPO.deliveryDate).text}
                </div>
              </div>

              {/* Scope */}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Order Scope</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                  {deliveryItems.length} Materials
                </div>
                <div style={{ fontSize: '12px', color: '#86EFAC', marginTop: '2px', fontWeight: 700 }}>
                  {deliverySummary.totalOrdered} Total Units Remaining
                </div>
              </div>
            </div>
          </div>

          {/* Section: Inspection Table & Accelerators */}
          <div className="inspection-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #E2E8F0', padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div className="inspection-header-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                  Physical Gate Verification & Inspection
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Record quantities delivered at the gate for inward receiving.
                </p>
              </div>

              {/* Quick Action Accelerators */}
              <div className="accelerators-wrap" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleAutoFillAll}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #BBF7D0',
                    background: '#F0FDF4',
                    color: '#15803D',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <Sparkles size={15} /> ⚡ Auto-Fill Full Delivery
                </button>
                <button
                  type="button"
                  onClick={handleResetAll}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #E2E8F0',
                    background: '#ffffff',
                    color: '#64748B',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Inspection Items — Card List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {deliveryItems.map((item, idx) => {
                const fillPct = item.remainingSupplyQty > 0
                  ? Math.min(100, Math.round((item.deliveredQty / item.remainingSupplyQty) * 100))
                  : 0;
                const isFull = fillPct === 100;
                return (
                  <div
                    key={item.productId}
                    style={{
                      background: isFull ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)' : '#ffffff',
                      border: `1.5px solid ${isFull ? '#86EFAC' : '#E2E8F0'}`,
                      borderRadius: '14px',
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      transition: 'all 0.2s ease',
                      boxShadow: isFull ? '0 4px 12px rgba(16,185,129,0.08)' : '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    {/* Row 1: Material info + qty input side by side */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                      {/* Left: Material Name + badges */}
                      <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <div style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            background: isFull ? '#10B981' : '#6366F1',
                            color: '#ffffff', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 900, fontSize: '13px', flexShrink: 0
                          }}>
                            {idx + 1}
                          </div>
                          <span style={{ fontSize: '14.5px', fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
                            {item.materialName}
                          </span>
                          {isFull && (
                            <span style={{
                              background: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7',
                              borderRadius: '20px', padding: '2px 8px', fontSize: '10.5px', fontWeight: 900
                            }}>✓ Full</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '11.5px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                            padding: '3px 10px', borderRadius: '6px', color: '#475569', fontWeight: 700
                          }}>
                            📦 Ordered: <strong style={{ color: '#0F172A' }}>{item.orderedQty} {item.unit}</strong>
                          </span>
                          <span style={{
                            fontSize: '11.5px', background: '#EFF6FF', border: '1px solid #BFDBFE',
                            padding: '3px 10px', borderRadius: '6px', color: '#1D4ED8', fontWeight: 800
                          }}>
                            Remaining: {item.remainingSupplyQty} {item.unit}
                          </span>
                        </div>
                      </div>

                      {/* Right: Qty input block */}
                      <div style={{
                        flexShrink: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: '6px', minWidth: '120px'
                      }}>
                        <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Delivered Qty</div>
                        <input
                          type="number"
                          min="0"
                          max={item.remainingSupplyQty}
                          value={item.deliveredQty === 0 ? '' : item.deliveredQty}
                          placeholder="0"
                          onChange={e => handleQtyChange(item.productId, 'deliveredQty', e.target.value)}
                          className="qty-input"
                          style={{
                            border: isFull ? '2px solid #10B981' : '2px solid #CBD5E1',
                            color: isFull ? '#065F46' : '#0F172A',
                            background: isFull ? '#F0FDF4' : '#ffffff',
                            width: '100px',
                            fontSize: '18px',
                            fontWeight: 900,
                            padding: '10px 8px'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item.productId, 'deliveredQty', item.remainingSupplyQty)}
                          style={{
                            background: '#EFF6FF', border: '1px solid #BFDBFE',
                            borderRadius: '6px', color: '#2563EB',
                            fontSize: '11px', fontWeight: 800,
                            cursor: 'pointer', padding: '3px 10px',
                            transition: 'all 0.15s'
                          }}
                        >
                          All ({item.remainingSupplyQty})
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Progress bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', fontWeight: 700, marginBottom: '5px' }}>
                        <span>Delivery progress</span>
                        <span style={{ color: isFull ? '#059669' : '#1D4ED8', fontWeight: 900 }}>{fillPct}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${fillPct}%`, height: '100%',
                          background: isFull ? 'linear-gradient(90deg, #10B981, #059669)' : 'linear-gradient(90deg, #3B82F6, #2563EB)',
                          borderRadius: '10px',
                          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)'
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Delivery Intake Summary Card */}
            <div className="delivery-summary-card" style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div className="summary-stats-wrap" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Total Delivered</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>{deliverySummary.totalDelivered} Units</div>
                </div>
                <div className="summary-divider" style={{ width: '1px', height: '30px', background: '#E2E8F0' }} />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Remaining to Deliver</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#2563EB' }}>{deliverySummary.remainingToDeliver} Units</div>
                </div>
                <div className="summary-divider" style={{ width: '1px', height: '30px', background: '#E2E8F0' }} />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Total Expected Order</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#475569' }}>{deliverySummary.totalOrdered} Units</div>
                </div>
              </div>

              <div style={{ minWidth: '180px', width: '100%', maxWidth: '240px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>
                  <span>Fulfillment Rate</span>
                  <span>{deliverySummary.completionRate}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${deliverySummary.completionRate}%`, height: '100%', background: '#10B981', borderRadius: '10px', transition: 'width 0.3s' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Gate Entry Details & Supporting Docs */}
          <div className="gate-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Gate Entry Information & Documents
            </h3>

            <div className="gate-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Delivery Challan / Invoice / e-Way Bill No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. DC-98421 or INV-2026-88"
                  value={challanNumber}
                  onChange={e => setChallanNumber(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#1E293B',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Vehicle / Truck Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. MH-12-AB-1234"
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#1E293B',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                Store Inspection Notes & Remarks
              </label>
              <textarea
                rows={3}
                placeholder="Add general notes on container condition, driver verification, or physical quality remarks..."
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '13px',
                  color: '#1E293B',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <DeliveryDocumentUploader entityId={selectedPO.id} entityType="GRN" onUploadComplete={setAttachments} />
          </div>

          {/* Non-Sticky Bottom Actions */}
          <div className="delivery-actions-bar" style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '16px 20px',
            border: '1.5px solid #CBD5E1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginTop: '4px'
          }}>
            <button
              type="button"
              className="delivery-btn-cancel"
              onClick={() => setSelectedPOId(null)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                background: '#ffffff',
                color: '#64748B',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel & Exit
            </button>

            <button
              type="button"
              className="delivery-btn-submit"
              onClick={handleSubmitGRN}
              disabled={isSubmitting || deliverySummary.totalDelivered === 0}
              style={{
                padding: '12px 28px',
                borderRadius: '10px',
                border: 'none',
                background: deliverySummary.totalDelivered === 0 ? '#94A3B8' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 800,
                cursor: (isSubmitting || deliverySummary.totalDelivered === 0) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: deliverySummary.totalDelivered > 0 ? '0 4px 14px rgba(5, 150, 105, 0.35)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {isSubmitting ? (
                <>Creating GRN & Moving Stock...</>
              ) : (
                <>
                  <CheckCircle2 size={18} /> Confirm Delivery & Generate GRN ({deliverySummary.totalDelivered} Units)
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

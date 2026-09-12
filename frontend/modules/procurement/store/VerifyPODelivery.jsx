import React, { useEffect, useState, useMemo } from 'react';
import { useERPStore } from '../../../store/erpStore';
import { syncProcurementData, verifyPODelivery } from '../../../store/procurementActions';
import { purchaseOrderService } from '../../../services/procurement/purchaseOrderService';
import { DeliveryDocumentUploader } from '../components/DeliveryDocumentUploader';
import { POPdfPreviewModal } from '../../store/pages/StorePortal';
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
  Layers,
  AlertCircle,
  Printer,
  Loader2
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

const INDIAN_STATES = new Set([
  'AN','AP','AR','AS','BR','CG','CH','DD','DL','DN','GA','GJ','HR','HP',
  'JH','JK','KA','KL','LA','LD','MH','ML','MN','MP','MZ','NL','OD','OR',
  'PB','PY','RJ','SK','TN','TR','TS','UK','UP','UA','WB'
]);

const DUMMY_WORDS = new Set([
  'test', 'testing', 'asdf', 'fdfd', 'dummy', 'sample', 'n/a', 'na',
  'none', 'null', 'temp', 'fake', '1234', '12345', 'xxxx', 'grgrfd', 'grgr', 'check'
]);

const QUICK_INSPECTION_TAGS = [
  '📦 Packaging sealed & intact; physical count verified against DC',
  '🚚 Driver identity and truck registration verified at security gate',
  '🔍 Physical quality and batch numbers match purchase order specs',
  '⚡ Priority delivery inspected and accepted for immediate store issue'
];

const validateChallan = (val) => {
  if (!val || !val.trim()) return 'Delivery Challan / Invoice / e-Way Bill No. is required.';
  const clean = val.trim();
  if (clean.length < 3) return 'Challan / Invoice number must be at least 3 characters.';
  if (clean.length > 60) return 'Challan / Invoice number cannot exceed 60 characters.';
  if (!/[a-zA-Z0-9]/.test(clean)) return 'Challan / Invoice number must contain alphanumeric characters.';
  if (/^(.)\1+$/.test(clean.toLowerCase())) return 'Please enter a genuine Challan or Invoice number, not repeated characters.';
  const normalized = clean.toLowerCase().replace(/[\s\-_/.]/g, '');
  if (DUMMY_WORDS.has(normalized)) {
    return `Please enter a genuine Challan / Invoice number (avoid placeholder "${clean}").`;
  }
  return null;
};

const validateVehicle = (val) => {
  if (!val || !val.trim()) return 'Vehicle / Truck Number is required for Gate Entry.';
  const clean = val.replace(/[\s\-\.]/g, '').toUpperCase();
  if (clean.length < 5 || clean.length > 13) {
    return 'Vehicle number length must be between 5 and 13 characters.';
  }
  // BH series: e.g. 22BH1234AA
  const bhRegex = /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/;
  if (bhRegex.test(clean)) return null;

  // Standard Indian format: State(2) + RTO(1-2) + Series(0-3) + Number(1-4)
  const standardRegex = /^([A-Z]{2})([0-9]{1,2})([A-Z]{0,3})([0-9]{1,4})$/;
  const match = clean.match(standardRegex);
  if (match) {
    const state = match[1];
    if (!INDIAN_STATES.has(state)) {
      return `Invalid state code "${state}" (must be an Indian state code like GJ, MH, DL, HR, RJ).`;
    }
    return null;
  }

  // Old format: e.g. GJA1234, DL1234
  const oldRegex = /^([A-Z]{2,3})([0-9]{3,4})$/;
  const oldMatch = clean.match(oldRegex);
  if (oldMatch) {
    const statePrefix = oldMatch[1].slice(0, 2);
    if (!INDIAN_STATES.has(statePrefix)) {
      return `Invalid state code "${statePrefix}" in vehicle number.`;
    }
    return null;
  }

  return 'Invalid vehicle number format. Expected format: State code followed by RTO and registration digits (e.g., GJ-01-AB-1234 or MH 12 CD 5678).';
};

const validateRemarksText = (val) => {
  if (!val || !val.trim()) return 'Store inspection notes are required (minimum 5 characters).';
  const clean = val.trim();
  if (clean.length < 5) return 'Store inspection notes must be at least 5 characters.';
  if (clean.length > 500) return 'Store inspection notes cannot exceed 500 characters.';

  const uniqueChars = new Set(clean.toLowerCase().replace(/[\s\-_.,]/g, '')).size;
  if (uniqueChars < 3) {
    return 'Please provide descriptive inspection notes (e.g., material condition, packaging check).';
  }

  const words = clean.toLowerCase().split(/[\s\-_.,]+/);
  if (words.length > 0 && words.every(w => DUMMY_WORDS.has(w))) {
    return 'Please enter meaningful inspection remarks rather than placeholder text.';
  }

  return null;
};

const validateAttachmentsList = (docs) => {
  if (!docs || docs.length === 0) {
    return 'At least one supporting document (e.g., signed Delivery Challan or Invoice copy) is required.';
  }
  return null;
};

export default function VerifyPODelivery() {
  const purchaseOrders = useERPStore(state => state.state?.procurement?.purchaseOrders || state.state?.purchaseOrders || []);
  const goodsReceiptNotes = useERPStore(state => state.state?.procurement?.goodsReceiptNotes || state.state?.goodsReceipts || []);
  const materialRejections = useERPStore(state => state.state?.materialRejections ?? EMPTY_REJECTIONS);

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

  const grnsByPO = useMemo(() => {
    const map = new Map();
    (goodsReceiptNotes || []).forEach(grn => {
      const pId = grn.purchaseOrderId || grn.poId || grn.purchaseOrder?.id;
      if (pId) {
        if (!map.has(pId)) map.set(pId, []);
        map.get(pId).push(grn);
      }
    });
    return map;
  }, [goodsReceiptNotes]);

  // Accurate helper to compute physical received units for an item (with fallback to GRNs)
  const getItemReceivedQty = (po, item) => {
    if (item?.receivedQty !== undefined && item?.receivedQty !== null) return Number(item.receivedQty);
    const poGrns = grnsByPO.get(po?.id) || po?.grns || [];
    let fromGrns = 0;
    poGrns.forEach(g => {
      if (['CANCELLED', 'REJECTED', 'RETURNED_TO_STORE', 'FINANCE_AUDIT_REJECTED', 'VOID', 'VOIDED'].includes(g.status)) return;
      (g.items || []).forEach(gi => {
        if (
          (gi.purchaseOrderItemId && gi.purchaseOrderItemId === item?.id) ||
          (gi.productId && (gi.productId === item?.productId || gi.productId === item?.materialId))
        ) {
          fromGrns += Number(gi.acceptedQuantity ?? gi.receivedQuantity ?? gi.deliveredQuantity ?? 0);
        }
      });
    });
    const direct = Number(item?.cumulativeDeliveredQty ?? item?.receivedQuantity ?? 0);
    return fromGrns > 0 ? fromGrns : direct;
  };

  // Helper to check if all items of a PO have been 100% delivered/received
  const isPOFullyReceived = (po) => {
    if (po?.isFullyReceived !== undefined) return Boolean(po.isFullyReceived);
    const items = po?.items || [];
    if (items.length === 0) {
      return ['COMPLETED', 'FULLY_RECEIVED', 'CLOSED', 'PO_CLOSED'].includes(po?.status);
    }
    const totalOrdered = items.reduce((sum, it) => sum + Number(it.orderedQty ?? it.quantity ?? 0), 0);
    const totalReceived = items.reduce((sum, it) => sum + getItemReceivedQty(po, it), 0);
    return totalOrdered > 0 && totalReceived >= totalOrdered;
  };

  const isTerminalStatus = (status) => {
    return ['CLOSED', 'PO_CLOSED', 'CANCELLED'].includes(status);
  };

  // A PO is complete ONLY when 100% of units are delivered/received or terminal status.
  // Partially received POs (e.g. 30/40 units received) must STAY in Pending Inward until fully complete!
  const isPOComplete = (po) => {
    if (!po) return false;
    // 1. Terminal statuses (closed by admin/finance or cancelled)
    if (isTerminalStatus(po.status)) return true;

    // 2. If awaiting replacement intake, it is NOT complete (needs physical replacement delivery)
    if (replacementByPO.has(po.id)) return false;

    // 3. Physical fulfillment check: 100% of all ordered items delivered
    const items = po?.items || [];
    if (items.length > 0) {
      return isPOFullyReceived(po);
    }

    // 4. Fallback if no items array
    return ['COMPLETED', 'FULLY_RECEIVED'].includes(po.status);
  };

  const [selectedPOId, setSelectedPOId] = useState(null);
  const [livePO, setLivePO] = useState(null);
  const [isLoadingPO, setIsLoadingPO] = useState(false);
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
  const [pdfPreviewPO, setPdfPreviewPO] = useState(null);

  // Validation States
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const handleFieldChange = (field, value) => {
    if (field === 'challanNumber') {
      setChallanNumber(value);
      if (touchedFields.challanNumber) {
        setFormErrors(prev => ({ ...prev, challanNumber: validateChallan(value) }));
      }
    } else if (field === 'vehicleNumber') {
      const upperVal = value.toUpperCase();
      setVehicleNumber(upperVal);
      if (touchedFields.vehicleNumber) {
        setFormErrors(prev => ({ ...prev, vehicleNumber: validateVehicle(upperVal) }));
      }
    } else if (field === 'remarks') {
      setRemarks(value);
      if (touchedFields.remarks) {
        setFormErrors(prev => ({ ...prev, remarks: validateRemarksText(value) }));
      }
    }
  };

  const handleFieldBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    let err = null;
    if (field === 'challanNumber') err = validateChallan(challanNumber);
    else if (field === 'vehicleNumber') err = validateVehicle(vehicleNumber);
    else if (field === 'remarks') err = validateRemarksText(remarks);
    else if (field === 'attachments') err = validateAttachmentsList(attachments);
    setFormErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleDocumentsChange = (newDocs) => {
    setAttachments(newDocs);
    if (touchedFields.attachments) {
      setFormErrors(prev => ({ ...prev, attachments: validateAttachmentsList(newDocs) }));
    }
  };

  const handleApplyRemarkTag = (tagText) => {
    setRemarks(prev => {
      const updated = prev ? `${prev.trim()}\n${tagText}` : tagText;
      return updated;
    });
    setFormErrors(prev => ({ ...prev, remarks: null }));
    setTouchedFields(prev => ({ ...prev, remarks: true }));
  };

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

  const pendingPOs = useMemo(() => purchaseOrders.filter(po => {
    // 1. If complete (100% fulfilled or closed), it belongs in Delivery History, NOT pending
    if (isPOComplete(po)) return false;

    // 2. If awaiting replacement intake, it is pending
    if (replacementByPO.has(po.id)) return true;

    // 3. Exclude terminal closed/cancelled
    if (isTerminalStatus(po.status)) return false;

    // 4. Any open or partially delivered PO with remaining units belongs in Pending Inward
    return true;
  }), [purchaseOrders, replacementByPO, grnsByPO]);

  const completedPOs = useMemo(() => purchaseOrders.filter(po => {
    // If awaiting replacement, keep in pending inward
    if (replacementByPO.has(po.id)) return false;

    // Belongs in Delivery History ONLY when complete
    return isPOComplete(po);
  }), [purchaseOrders, replacementByPO, grnsByPO]);

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
        const items = po.items || [];
        const totalUnits = items.reduce((sum, it) => sum + Number(it.quantity || it.orderedQty || 0), 0);
        const receivedUnits = items.reduce((sum, it) => sum + getItemReceivedQty(po, it), 0);
        const isPartiallyReceived = (receivedUnits > 0 && receivedUnits < totalUnits) || ['PARTIALLY_RECEIVED', 'PARTIALLY_DELIVERED', 'PARTIALLY_DELIVERED_PENDING_AUDIT'].includes(po.status);

        if (statusFilter === 'REPLACEMENT') {
          if (!replacementByPO.has(po.id)) return false;
        } else if (statusFilter === 'PARTIALLY_RECEIVED') {
          if (!isPartiallyReceived) return false;
        } else if (statusFilter === 'ORDERED') {
          if (isPartiallyReceived || replacementByPO.has(po.id)) return false;
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
  }, [viewTab, pendingPOs, completedPOs, statusFilter, searchQuery, replacementByPO, grnsByPO]);

  const selectedPO = useMemo(() => {
    if (livePO && (livePO.id === selectedPOId || livePO.publicId === selectedPOId)) return livePO;
    return purchaseOrders.find(p => p.id === selectedPOId) || null;
  }, [livePO, purchaseOrders, selectedPOId]);

  const isSelectedPOCompleted = useMemo(() => {
    if (!selectedPO) return false;
    if (replacementByPO.has(selectedPO.id)) return false;
    return isPOComplete(selectedPO);
  }, [selectedPO, replacementByPO, grnsByPO]);

  const selectedPOGRNs = useMemo(() => {
    if (!selectedPO) return [];
    const allGrns = (selectedPO.grns && selectedPO.grns.length > 0)
      ? selectedPO.grns
      : (grnsByPO.get(selectedPO.id) || []);
    return allGrns.filter(g => !['CANCELLED', 'REJECTED', 'RETURNED_TO_STORE', 'FINANCE_AUDIT_REJECTED', 'VOID', 'VOIDED'].includes(g.status));
  }, [selectedPO, grnsByPO]);

  const handleSelectPO = async (poId) => {
    const po = purchaseOrders.find(p => p.id === poId);
    setSelectedPOId(poId);
    setLivePO(null);
    const replacement = replacementByPO.get(poId);
    setSelectedReplacement(replacement || null);
    setChallanNumber('');
    setVehicleNumber('');
    setRemarks('');
    setAttachments([]);
    setFormErrors({});
    setTouchedFields({});

    const buildItemsFromPO = (targetPO) => {
      if (!targetPO) return [];
      if (replacement) {
        return (targetPO.items || []).filter(item =>
          (item.productId || item.materialId) === replacement.materialId,
        ).map(item => ({
          purchaseOrderItemId: item.id,
          productId: item.productId || item.materialId,
          materialName: item.product?.name || item.materialName || replacement.materialName || 'Replacement material',
          remainingSupplyQty: Number(replacement.remainingResolutionQty || replacement.rejectedQty || 0),
          orderedQty: Number(replacement.remainingResolutionQty || replacement.rejectedQty || 0),
          previouslyReceivedQty: 0,
          deliveredQty: 0,
          acceptedQty: 0,
          rejectedQty: 0,
          unit: item.unit || item.product?.unit || 'Nos',
          inspectionRemarks: '',
        }));
      }

      return (targetPO.items || []).map(item => {
        const ordered = Number(item.orderedQty ?? item.quantity ?? 0);
        const delivered = item.receivedQty !== undefined ? Number(item.receivedQty) : getItemReceivedQty(targetPO, item);
        const remaining = item.remainingQty !== undefined ? Number(item.remainingQty) : Math.max(0, ordered - delivered);

        return {
          purchaseOrderItemId: item.id,
          productId: item.productId || item.materialId,
          materialName: item.product?.name || item.materialName || 'Material',
          remainingSupplyQty: remaining,
          orderedQty: ordered,
          previouslyReceivedQty: delivered,
          deliveredQty: 0,
          acceptedQty: 0,
          rejectedQty: 0,
          unit: item.unit || item.product?.unit || 'Nos',
          inspectionRemarks: '',
        };
      });
    };

    if (po) {
      setDeliveryItems(buildItemsFromPO(po));
    }

    try {
      setIsLoadingPO(true);
      const res = await purchaseOrderService.get(poId);
      const freshPO = res?.data || res;
      if (freshPO && freshPO.id) {
        setLivePO(freshPO);
        setDeliveryItems(buildItemsFromPO(freshPO));
      }
    } catch (err) {
      console.warn('[VerifyPODelivery] Could not fetch fresh PO details, continuing with cached PO:', err);
    } finally {
      setIsLoadingPO(false);
    }
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
    let totalExpected = 0;
    let priorDelivered = 0;
    let totalRemaining = 0;
    let currentIntake = 0;

    deliveryItems.forEach(item => {
      totalExpected += item.orderedQty || 0;
      priorDelivered += item.previouslyReceivedQty || 0;
      totalRemaining += item.remainingSupplyQty || 0;
      currentIntake += item.deliveredQty || 0;
    });

    const cumulativeDelivered = priorDelivered + currentIntake;
    const remainingToDeliver = Math.max(0, totalRemaining - currentIntake);
    const fulfillmentRate = totalExpected > 0 ? Math.min(100, Math.round((cumulativeDelivered / totalExpected) * 100)) : 0;

    return {
      totalExpected,
      totalOrdered: totalExpected,
      priorDelivered,
      totalDelivered: cumulativeDelivered,
      currentIntake,
      totalAccepted: currentIntake,
      totalRejected: 0,
      completionRate: fulfillmentRate,
      fulfillmentRate,
      remainingToDeliver,
      totalRemaining,
    };
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

    // Comprehensive Gate Entry Validation
    const challanErr = validateChallan(challanNumber);
    const vehicleErr = validateVehicle(vehicleNumber);
    const remarksErr = validateRemarksText(remarks);
    const attachmentsErr = validateAttachmentsList(attachments);

    const errors = {};
    if (challanErr) errors.challanNumber = challanErr;
    if (vehicleErr) errors.vehicleNumber = vehicleErr;
    if (remarksErr) errors.remarks = remarksErr;
    if (attachmentsErr) errors.attachments = attachmentsErr;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setTouchedFields({
        challanNumber: true,
        vehicleNumber: true,
        remarks: true,
        attachments: true
      });

      if (typeof document !== 'undefined') {
        const el = document.getElementById('gate-entry-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      const errorBullets = Object.values(errors).map(err => `<li style="margin-bottom: 4px;">${err}</li>`).join('');
      return Swal.fire({
        icon: 'warning',
        title: 'Incomplete Gate Entry Details',
        html: `
          <div style="text-align: left; font-size: 13px; color: #334155; line-height: 1.5;">
            <p style="margin: 0 0 10px 0; font-weight: 600;">Please resolve the following required fields before completing goods receipt:</p>
            <ul style="color: #DC2626; padding-left: 20px; margin: 0 0 10px 0; font-weight: 500;">
              ${errorBullets}
            </ul>
          </div>
        `,
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
            <span style="color: #059669; font-weight: 700;">✓ Total Delivered in this GRN: ${deliverySummary.currentIntake} Units</span>
            <div style="font-size: 12px; color: #475569; margin-top: 4px;">Cumulative Received: ${deliverySummary.totalDelivered} / ${deliverySummary.totalExpected} Units (${deliverySummary.fulfillmentRate}%)</div>
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

      // Check if all ordered items are now completely fulfilled
      const isNowComplete = deliveryItems.every(it => {
        const itemDeliveredNow = activeItems.find(a => (a.purchaseOrderItemId === it.purchaseOrderItemId || a.productId === it.productId))?.deliveredQty || 0;
        return (it.previouslyReceivedQty + itemDeliveredNow) >= it.orderedQty;
      });

      Swal.fire({
        icon: 'success',
        title: isNowComplete ? '✅ Order Fully Received!' : '⚡ Partial Delivery Recorded!',
        html: `<div style="text-align:left;font-size:13.5px;color:#334155;">
          <p style="margin:0 0 8px 0;">GRN <strong>${grn?.grnNumber || grn?.publicId || ''}</strong> has been generated successfully.</p>
          <p style="margin:0 0 4px 0;">Raw inventory stock has been incremented immediately.</p>
          ${isNowComplete 
            ? '<p style="margin:0;color:#16A34A;font-weight:700;">✓ All materials have been 100% received. PO moved to Delivery History.</p>' 
            : '<p style="margin:0;color:#2563EB;font-weight:700;">⚡ Remaining units are pending future delivery. This PO stays in Pending Inward for remaining intake.</p>'
          }
        </div>`,
        confirmButtonColor: '#2563eb'
      });

      setSelectedPOId(null);
      setLivePO(null);
      setFormErrors({});
      setTouchedFields({});
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
                const receivedUnits = items.reduce((sum, it) => sum + getItemReceivedQty(po, it), 0);
                const pct = totalUnits > 0 ? Math.min(100, Math.round((receivedUnits / totalUnits) * 100)) : 0;
                const indentRef = po.purchaseIndent?.publicId || po.indentRef || po.purchaseIndentId || '';

                const isCompletedPO = isPOComplete(po);
                const hasPartialDelivery = receivedUnits > 0 && receivedUnits < totalUnits;
                const remainingUnits = Math.max(0, totalUnits - receivedUnits);

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

                        {isCompletedPO || viewTab === 'history' ? (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: po.status === 'DELIVERY_PENDING_FINANCE_AUDIT' ? '#FFFBEB' : '#ECFDF5',
                            color: po.status === 'DELIVERY_PENDING_FINANCE_AUDIT' ? '#B45309' : '#047857',
                            border: `1px solid ${po.status === 'DELIVERY_PENDING_FINANCE_AUDIT' ? '#FDE68A' : '#A7F3D0'}`,
                            whiteSpace: 'nowrap'
                          }}>
                            {po.status === 'DELIVERY_PENDING_FINANCE_AUDIT' ? '⏳ Awaiting Audit' : '✓ GRN Recorded'}
                          </span>
                        ) : hasPartialDelivery ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            <span style={{
                              fontSize: '10.5px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: '#EFF6FF',
                              color: '#1D4ED8',
                              border: '1px solid #BFDBFE',
                              whiteSpace: 'nowrap'
                            }}>
                              ⚡ {remainingUnits} Units Remaining
                            </span>
                            <span style={{
                              fontSize: '10.5px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: urgency.bg,
                              color: urgency.color,
                              border: `1px solid ${urgency.border}`,
                              whiteSpace: 'nowrap'
                            }}>
                              {urgency.text}
                            </span>
                          </div>
                        ) : (
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
                        )}
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
                          <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#10B981' : hasPartialDelivery ? '#F59E0B' : '#2563EB', borderRadius: '10px', transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    </div>

                    {/* Footer CTA */}
                    <div style={{ paddingTop: '14px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                        <Calendar size={14} color="#94A3B8" />
                        {isCompletedPO || viewTab === 'history' ? `Delivered: ${formatDate(po.updatedAt || dueDate)}` : `Due: ${formatDate(dueDate)}`}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPdfPreviewPO(po);
                          }}
                          style={{
                            padding: '7px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #CBD5E1',
                            background: '#ffffff',
                            color: '#334155',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <FileText size={13} /> View PO PDF
                        </button>

                        <button
                          type="button"
                          className="po-card-cta"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPO(po.id);
                          }}
                          style={{
                            padding: '7px 14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: isCompletedPO || viewTab === 'history' ? '#F0FDF4' : hasPartialDelivery ? '#F0FDF4' : '#EFF6FF',
                            color: isCompletedPO || viewTab === 'history' ? '#16A34A' : hasPartialDelivery ? '#15803D' : '#2563EB',
                            fontWeight: 800,
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isCompletedPO || viewTab === 'history' 
                            ? 'View GRN Details' 
                            : hasPartialDelivery 
                              ? `Receive & Verify Remaining (${remainingUnits})` 
                              : 'Receive & Verify'} <ArrowRight size={14} />
                        </button>
                      </div>
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
                      const receivedUnits = items.reduce((sum, it) => sum + getItemReceivedQty(po, it), 0);
                      const indentRef = po.purchaseIndent?.publicId || po.indentRef || po.purchaseIndentId || '—';
                      const isCompletedPO = isPOComplete(po);
                      const hasPartialDelivery = receivedUnits > 0 && receivedUnits < totalUnits;
                      const remainingUnits = Math.max(0, totalUnits - receivedUnits);

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
                            <div style={{ fontSize: '11.5px', color: '#64748B' }}>Total {totalUnits} Units {hasPartialDelivery && `(${receivedUnits} received)`}</div>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E293B' }}>
                              {isCompletedPO || viewTab === 'history' ? formatDate(po.updatedAt || dueDate) : formatDate(dueDate)}
                            </div>
                            <span style={{ fontSize: '10.5px', fontWeight: 800, color: isCompletedPO || viewTab === 'history' ? '#059669' : urgency.color }}>
                              {isCompletedPO || viewTab === 'history' ? '✓ Delivered' : urgency.text}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            {isCompletedPO || viewTab === 'history' ? (
                              <span style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: po.status === 'DELIVERY_PENDING_FINANCE_AUDIT' ? '#FFFBEB' : '#ECFDF5',
                                color: po.status === 'DELIVERY_PENDING_FINANCE_AUDIT' ? '#B45309' : '#047857',
                                border: `1px solid ${po.status === 'DELIVERY_PENDING_FINANCE_AUDIT' ? '#FDE68A' : '#A7F3D0'}`,
                                textTransform: 'uppercase'
                              }}>
                                {po.status === 'DELIVERY_PENDING_FINANCE_AUDIT' ? 'Awaiting Audit' : '✓ Completed'}
                              </span>
                            ) : hasPartialDelivery ? (
                              <span style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: '#EFF6FF',
                                color: '#1D4ED8',
                                border: '1px solid #BFDBFE',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                ⚡ Partial ({receivedUnits}/{totalUnits})
                              </span>
                            ) : (
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
                            )}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPdfPreviewPO(po);
                              }}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1.5px solid #CBD5E1',
                                background: '#ffffff',
                                color: '#334155',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginRight: '8px'
                              }}
                            >
                              <FileText size={13} /> PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectPO(po.id)}
                              style={{
                                padding: '7px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: isCompletedPO || viewTab === 'history' ? '#10B981' : hasPartialDelivery ? '#15803D' : '#2563EB',
                                color: '#ffffff',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              {isCompletedPO || viewTab === 'history' 
                                ? 'View Details' 
                                : hasPartialDelivery 
                                  ? 'Verify Remaining' 
                                  : 'Verify'} <ArrowRight size={14} />
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
      ) : isSelectedPOCompleted ? (
        /* Section 4A: Completed Delivery & GRN Audit Dossier */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Bar: Navigation & Audit Tag */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <button
              type="button"
              onClick={() => { setSelectedPOId(null); setLivePO(null); setViewTab('history'); }}
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
              <ChevronLeft size={16} /> Back to Delivery History
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Status:</span>
              <span style={{
                background: selectedPO.status === 'DELIVERY_PENDING_FINANCE_AUDIT' ? '#FEF3C7' : '#DCFCE7',
                color: selectedPO.status === 'DELIVERY_PENDING_FINANCE_AUDIT' ? '#92400E' : '#166534',
                border: `1px solid ${selectedPO.status === 'DELIVERY_PENDING_FINANCE_AUDIT' ? '#FDE68A' : '#86EFAC'}`,
                borderRadius: '6px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                {selectedPO.status === 'DELIVERY_PENDING_FINANCE_AUDIT' ? (
                  <>⏳ Delivery Recorded • Awaiting Finance Audit</>
                ) : (
                  <>✓ {selectedPO.status.replace(/_/g, ' ')}</>
                )}
              </span>
            </div>
          </div>

          {/* Hero Order Header Banner */}
          <div className="hero-delivery-banner" style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
            borderRadius: '16px',
            padding: '24px 28px',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Purchase Order Delivery Confirmation & GRN Dossier
                </div>
                <h2 className="hero-delivery-title" style={{ fontSize: '24px', fontWeight: 900, margin: '4px 0 6px 0', color: '#ffffff' }}>
                  {selectedPO.poNumber || selectedPO.publicId || selectedPO.id}
                </h2>
                <div style={{ fontSize: '13px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span>Indent Ref: <strong style={{ color: '#6EE7B7' }}>{selectedPO.purchaseIndent?.publicId || selectedPO.indentRef || selectedPO.purchaseIndentId || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>Order Date: <strong>{formatDate(selectedPO.createdAt)}</strong></span>
                  <span>•</span>
                  <span>Delivered On: <strong>{formatDate(selectedPOGRNs[0]?.receivedAt || selectedPO.updatedAt)}</strong></span>
                </div>
              </div>

              <div style={{ background: '#10B981', color: '#ffffff', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> 100% RECEIVED & VERIFIED
              </div>
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

              {/* Delivery Schedule & Intake */}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Fulfillment Status</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#6EE7B7', marginTop: '4px' }}>
                  100% Order Complete
                </div>
                <div style={{ fontSize: '12px', color: '#E2E8F0', marginTop: '2px', fontWeight: 700 }}>
                  All items received at Gate
                </div>
              </div>

              {/* GRN Record */}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Goods Receipt Note</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#FCD34D', marginTop: '4px' }}>
                  {selectedPOGRNs[0]?.grnNumber || selectedPOGRNs[0]?.publicId || 'GRN Confirmed'}
                </div>
                <div style={{ fontSize: '12px', color: '#86EFAC', marginTop: '2px', fontWeight: 700 }}>
                  Stock Posted to Warehouse
                </div>
              </div>
            </div>
          </div>

          {/* Section: Gate Entry & Security Verification Record */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #E2E8F0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color="#059669" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Gate Entry & Security Verification Record
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Delivery Challan / Invoice No.</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', marginTop: '4px' }}>
                  {selectedPOGRNs[0]?.snapshot?.deliveryChallanNumber || selectedPOGRNs[0]?.snapshot?.challanNumber || selectedPO.snapshot?.challanNumber || selectedPO.snapshot?.deliveryChallanNumber || 'DC-Verified'}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Vehicle / Truck Number</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', marginTop: '4px', letterSpacing: '0.5px' }}>
                  {selectedPOGRNs[0]?.snapshot?.vehicleNumber || selectedPO.snapshot?.vehicleNumber || 'Verified at Security Gate'}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Store Inspection Notes & Remarks</div>
              <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                {selectedPOGRNs[0]?.snapshot?.remarks || selectedPOGRNs[0]?.remarks || selectedPO.snapshot?.remarks || selectedPO.remarks || 'All materials received in good physical condition and verified against Delivery Challan.'}
              </div>
            </div>

            {/* Supporting Documents Preview */}
            {(selectedPOGRNs[0]?.snapshot?.attachments?.length > 0 || selectedPO.snapshot?.attachments?.length > 0) && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Supporting Documents Attached</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {(selectedPOGRNs[0]?.snapshot?.attachments || selectedPO.snapshot?.attachments || []).map((doc, idx) => (
                    <div key={idx} style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: '#1E40AF' }}>
                      <FileCheck2 size={16} />
                      <span>{typeof doc === 'string' ? `Document #${idx + 1}` : (doc.name || `Document #${idx + 1}`)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: Delivered Materials Table */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Verified Received Materials
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                  Materials posted into warehouse raw inventory stock.
                </p>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#047857', background: '#D1FAE5', padding: '4px 10px', borderRadius: '6px' }}>
                ✓ Stock Posted
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                  <tr>
                    <th style={{ padding: '12px 20px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Material</th>
                    <th style={{ padding: '12px 20px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Ordered Qty</th>
                    <th style={{ padding: '12px 20px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Delivered Qty</th>
                    <th style={{ padding: '12px 20px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Accepted Qty</th>
                    <th style={{ padding: '12px 20px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedPO.items || []).map((item, idx) => {
                    const ordered = Number(item.quantity ?? item.orderedQty ?? 0);
                    const received = Number(item.cumulativeDeliveredQty ?? item.receivedQuantity ?? ordered);
                    const accepted = Number(item.acceptedQuantity ?? received);
                    const unit = item.unit || item.product?.unit || 'Nos';

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                            {item.product?.name || item.materialName || 'Material'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            SKU: {item.product?.sku || item.materialCode || 'N/A'}
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                          {ordered} {unit}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13.5px', fontWeight: 900, color: '#059669' }}>
                          {received} {unit}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13.5px', fontWeight: 900, color: '#059669' }}>
                          {accepted} {unit}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#047857', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: '6px' }}>
                            ✓ In Inventory Stock
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notice Box: Awaiting Audit */}
          <div style={{
            background: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <ShieldCheck size={24} color="#059669" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '13px', color: '#166534', lineHeight: 1.5 }}>
              <strong>Delivery Verification Recorded:</strong> Goods Receipt Note has been posted to warehouse inventory. This Purchase Order is queued for Finance Audit approval to complete invoice settlement.
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '16px 20px',
            border: '1.5px solid #CBD5E1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <button
              type="button"
              onClick={() => { setSelectedPOId(null); setLivePO(null); setViewTab('history'); }}
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
              ← Back to Delivery History
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                border: 'none',
                background: '#2563EB',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Printer size={16} /> Print GRN Delivery Note
            </button>
          </div>
        </div>
      ) : (
        /* Section 4: Single PO Inward & GRN Recording Workspace */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Bar: Back Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <button
              type="button"
              onClick={() => { setSelectedPOId(null); setLivePO(null); }}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Purchase Order Gate Inward & Inspection
                  </div>
                  {isLoadingPO && (
                    <span style={{ fontSize: '11px', color: '#93C5FD', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Loader2 size={12} className="animate-spin" /> Live ledger sync...
                    </span>
                  )}
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

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setPdfPreviewPO(selectedPO)}
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <FileText size={15} /> View / Download PO PDF
                </button>
                {selectedReplacement && (
                  <div style={{ background: '#7E22CE', color: '#ffffff', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <RotateCcw size={14} /> REPLACEMENT RESOLUTION
                  </div>
                )}
              </div>
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
                  {deliveryItems.length} Materials • {deliverySummary.totalExpected} Total Units
                </div>
                <div style={{ fontSize: '12px', color: '#86EFAC', marginTop: '2px', fontWeight: 700 }}>
                  {deliverySummary.priorDelivered} Received / {deliverySummary.totalRemaining} Remaining
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
              {selectedPOGRNs.length > 0 && (
                <div style={{
                  background: '#F0FDF4',
                  border: '1.5px solid #86EFAC',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
                        Prior Deliveries Verified ({selectedPOGRNs.length} GRN{selectedPOGRNs.length > 1 ? 's' : ''})
                      </div>
                      <div style={{ fontSize: '12px', color: '#15803D' }}>
                        Partial quantities have already been received into raw inventory stock. Record intake for the remaining unfulfilled balance below.
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedPOGRNs.map((g, gIdx) => (
                      <span key={g.id || gIdx} style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                        {g.grnNumber || g.publicId || `GRN #${gIdx + 1}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {deliveryItems.map((item, idx) => {
                const isLineCompleted = item.remainingSupplyQty === 0;
                const fillPct = item.remainingSupplyQty > 0
                  ? Math.min(100, Math.round((item.deliveredQty / item.remainingSupplyQty) * 100))
                  : 100;
                const isFull = fillPct === 100 && !isLineCompleted;

                return (
                  <div
                    key={item.productId}
                    style={{
                      background: isLineCompleted
                        ? '#F8FAFC'
                        : isFull
                          ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)'
                          : '#ffffff',
                      border: `1.5px solid ${isLineCompleted ? '#CBD5E1' : isFull ? '#86EFAC' : '#E2E8F0'}`,
                      borderRadius: '14px',
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      transition: 'all 0.2s ease',
                      boxShadow: isFull ? '0 4px 12px rgba(16,185,129,0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
                      opacity: isLineCompleted ? 0.85 : 1
                    }}
                  >
                    {/* Row 1: Material info + qty input side by side */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                      {/* Left: Material Name + badges */}
                      <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <div style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            background: isLineCompleted ? '#64748B' : isFull ? '#10B981' : '#6366F1',
                            color: '#ffffff', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 900, fontSize: '13px', flexShrink: 0
                          }}>
                            {idx + 1}
                          </div>
                          <span style={{ fontSize: '14.5px', fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
                            {item.materialName}
                          </span>
                          {isLineCompleted ? (
                            <span style={{
                              background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0',
                              borderRadius: '20px', padding: '2px 8px', fontSize: '10.5px', fontWeight: 900,
                              display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}>✓ Line Fulfilled</span>
                          ) : isFull ? (
                            <span style={{
                              background: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7',
                              borderRadius: '20px', padding: '2px 8px', fontSize: '10.5px', fontWeight: 900
                            }}>✓ Full Intake</span>
                          ) : null}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '11.5px', background: '#F1F5F9', border: '1px solid #E2E8F0',
                            padding: '3px 10px', borderRadius: '6px', color: '#475569', fontWeight: 700
                          }}>
                            📦 Total Ordered: <strong style={{ color: '#0F172A' }}>{item.orderedQty} {item.unit}</strong>
                          </span>
                          {item.previouslyReceivedQty > 0 && (
                            <span style={{
                              fontSize: '11.5px', background: '#ECFDF5', border: '1px solid #A7F3D0',
                              padding: '3px 10px', borderRadius: '6px', color: '#047857', fontWeight: 700
                            }}>
                              Prior Received: <strong>{item.previouslyReceivedQty} {item.unit}</strong>
                            </span>
                          )}
                          {isLineCompleted ? (
                            <span style={{
                              fontSize: '11.5px', background: '#DCFCE7', border: '1px solid #86EFAC',
                              padding: '3px 10px', borderRadius: '6px', color: '#166534', fontWeight: 800
                            }}>
                              ✓ 0 Remaining
                            </span>
                          ) : (
                            <span style={{
                              fontSize: '11.5px', background: '#EFF6FF', border: '1px solid #BFDBFE',
                              padding: '3px 10px', borderRadius: '6px', color: '#1D4ED8', fontWeight: 800
                            }}>
                              ⚡ Remaining: {item.remainingSupplyQty} {item.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Qty input block */}
                      <div style={{
                        flexShrink: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: '6px', minWidth: '130px'
                      }}>
                        {isLineCompleted ? (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            padding: '8px 14px',
                            background: '#F0FDF4',
                            border: '1.5px solid #BBF7D0',
                            borderRadius: '10px',
                            minHeight: '62px'
                          }}>
                            <span style={{ fontSize: '13px', fontWeight: 900, color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={16} /> Fully Received
                            </span>
                            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                              ✓ {item.orderedQty}/{item.orderedQty} {item.unit}
                            </span>
                          </div>
                        ) : (
                          <>
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
                                padding: '10px 8px',
                                textAlign: 'center'
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
                              All Remaining ({item.remainingSupplyQty})
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Progress bar */}
                    {!isLineCompleted && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', fontWeight: 700, marginBottom: '5px' }}>
                          <span>Intake progress for this delivery</span>
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
                    )}
                  </div>
                );
              })}
            </div>

            {/* Live Delivery Intake Summary Card */}
            <div className="delivery-summary-card" style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div className="summary-stats-wrap" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Total Expected</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>{deliverySummary.totalExpected} Units</div>
                </div>
                <div className="summary-divider" style={{ width: '1px', height: '30px', background: '#E2E8F0' }} />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Total Delivered</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#059669' }}>{deliverySummary.totalDelivered} Units</div>
                  {deliverySummary.currentIntake > 0 ? (
                    <div style={{ fontSize: '10.5px', color: '#16A34A', fontWeight: 700 }}>
                      ({deliverySummary.priorDelivered} prior + {deliverySummary.currentIntake} new)
                    </div>
                  ) : (
                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>
                      ({deliverySummary.priorDelivered} prior verified)
                    </div>
                  )}
                </div>
                <div className="summary-divider" style={{ width: '1px', height: '30px', background: '#E2E8F0' }} />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Remaining to Deliver</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#2563EB' }}>{deliverySummary.remainingToDeliver} Units</div>
                </div>
              </div>

              <div style={{ minWidth: '180px', width: '100%', maxWidth: '240px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>
                  <span>Fulfillment Rate</span>
                  <span style={{ fontWeight: 800, color: '#059669' }}>{deliverySummary.fulfillmentRate}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${deliverySummary.fulfillmentRate}%`, height: '100%', background: '#10B981', borderRadius: '10px', transition: 'width 0.3s' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Gate Entry Details & Supporting Docs */}
          <div
            id="gate-entry-section"
            className="gate-card"
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: (touchedFields.attachments && formErrors.attachments) || (touchedFields.challanNumber && formErrors.challanNumber) || (touchedFields.vehicleNumber && formErrors.vehicleNumber) || (touchedFields.remarks && formErrors.remarks)
                ? '1.5px solid #FCA5A5'
                : '1.5px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={18} color="#2563EB" />
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Gate Entry Information & Documents
                  </h3>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#64748B' }}>
                  Mandatory security gate checks, vehicle registration and inspection notes required for GRN generation.
                </p>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#0284C7',
                background: '#E0F2FE',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #BAE6FD'
              }}>
                Security Gate Verification
              </span>
            </div>

            <div className="gate-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>
                    Delivery Challan / Invoice / e-Way Bill No. <span style={{ color: '#EF4444' }}>*</span>
                  </span>
                  {touchedFields.challanNumber && !formErrors.challanNumber && challanNumber && (
                    <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 600 }}>
                      <Check size={13} /> Validated
                    </span>
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="e.g. DC-98421, INV-2026-88, or 4335"
                    value={challanNumber}
                    onChange={e => handleFieldChange('challanNumber', e.target.value)}
                    onBlur={() => handleFieldBlur('challanNumber')}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      border: touchedFields.challanNumber && formErrors.challanNumber
                        ? '1.5px solid #EF4444'
                        : touchedFields.challanNumber && challanNumber
                          ? '1.5px solid #10B981'
                          : '1.5px solid #CBD5E1',
                      background: touchedFields.challanNumber && formErrors.challanNumber ? '#FEF2F2' : '#ffffff',
                      fontSize: '13px',
                      color: '#1E293B',
                      outline: 'none',
                      transition: 'border 0.2s'
                    }}
                  />
                </div>
                {touchedFields.challanNumber && formErrors.challanNumber ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', color: '#DC2626', fontSize: '11.5px', fontWeight: 600 }}>
                    <AlertCircle size={13} />
                    <span>{formErrors.challanNumber}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                    Min. 3 alphanumeric characters matching vendor documents
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>
                    Vehicle / Truck Number <span style={{ color: '#EF4444' }}>*</span>
                  </span>
                  {touchedFields.vehicleNumber && !formErrors.vehicleNumber && vehicleNumber && (
                    <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 600 }}>
                      <Check size={13} /> Validated
                    </span>
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="e.g. GJ-01-AB-1234 or MH 12 CD 5678"
                    value={vehicleNumber}
                    onChange={e => handleFieldChange('vehicleNumber', e.target.value)}
                    onBlur={() => handleFieldBlur('vehicleNumber')}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      border: touchedFields.vehicleNumber && formErrors.vehicleNumber
                        ? '1.5px solid #EF4444'
                        : touchedFields.vehicleNumber && vehicleNumber
                          ? '1.5px solid #10B981'
                          : '1.5px solid #CBD5E1',
                      background: touchedFields.vehicleNumber && formErrors.vehicleNumber ? '#FEF2F2' : '#ffffff',
                      fontSize: '13px',
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                      color: '#1E293B',
                      outline: 'none',
                      textTransform: 'uppercase',
                      transition: 'border 0.2s'
                    }}
                  />
                </div>
                {touchedFields.vehicleNumber && formErrors.vehicleNumber ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', color: '#DC2626', fontSize: '11.5px', fontWeight: 600 }}>
                    <AlertCircle size={13} />
                    <span>{formErrors.vehicleNumber}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                    Indian registration format (e.g. GJ-01-AB-1234 or 22BH1234AA)
                  </div>
                )}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                  Store Inspection Notes & Remarks <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <span style={{ fontSize: '11px', color: remarks.length > 500 ? '#EF4444' : '#64748B', fontWeight: 600 }}>
                  {remarks.length}/500 chars
                </span>
              </div>
              <textarea
                rows={3}
                placeholder="Record container condition, seal integrity, packaging quality, or physical inspection findings..."
                value={remarks}
                onChange={e => handleFieldChange('remarks', e.target.value)}
                onBlur={() => handleFieldBlur('remarks')}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: touchedFields.remarks && formErrors.remarks
                    ? '1.5px solid #EF4444'
                    : touchedFields.remarks && remarks && !formErrors.remarks
                      ? '1.5px solid #10B981'
                      : '1.5px solid #CBD5E1',
                  background: touchedFields.remarks && formErrors.remarks ? '#FEF2F2' : '#ffffff',
                  fontSize: '13px',
                  color: '#1E293B',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border 0.2s'
                }}
              />
              {touchedFields.remarks && formErrors.remarks && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', color: '#DC2626', fontSize: '11.5px', fontWeight: 600 }}>
                  <AlertCircle size={13} />
                  <span>{formErrors.remarks}</span>
                </div>
              )}

              {/* Quick-Pick Tags for Store Managers */}
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Quick Inspection Templates (Click to apply):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {QUICK_INSPECTION_TAGS.map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyRemarkTag(tag)}
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '20px',
                        padding: '5px 12px',
                        fontSize: '11.5px',
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 500,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#2563EB';
                        e.currentTarget.style.color = '#2563EB';
                        e.currentTarget.style.background = '#EFF6FF';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#CBD5E1';
                        e.currentTarget.style.color = '#334155';
                        e.currentTarget.style.background = '#F8FAFC';
                      }}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                  Supporting Documents <span style={{ color: '#EF4444' }}>*</span>
                </label>
                {attachments && attachments.length > 0 ? (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#D1FAE5', padding: '3px 8px', borderRadius: '6px' }}>
                    ✓ {attachments.length} file{attachments.length > 1 ? 's' : ''} attached
                  </span>
                ) : (
                  <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>
                    Mandatory (PDF, JPG, PNG - Max 50MB)
                  </span>
                )}
              </div>
              <DeliveryDocumentUploader
                entityId={selectedPO.id}
                entityType="GRN"
                onUploadComplete={handleDocumentsChange}
                isInvalid={Boolean(touchedFields.attachments && formErrors.attachments)}
                errorMessage={touchedFields.attachments && formErrors.attachments ? formErrors.attachments : ''}
              />
            </div>
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
              onClick={() => {
                setSelectedPOId(null);
                setLivePO(null);
                setFormErrors({});
                setTouchedFields({});
              }}
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
              disabled={isSubmitting || deliverySummary.currentIntake === 0}
              style={{
                padding: '12px 28px',
                borderRadius: '10px',
                border: 'none',
                background: deliverySummary.currentIntake === 0 ? '#94A3B8' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 800,
                cursor: (isSubmitting || deliverySummary.currentIntake === 0) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: deliverySummary.currentIntake > 0 ? '0 4px 14px rgba(5, 150, 105, 0.35)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {isSubmitting ? (
                <>Creating GRN & Moving Stock...</>
              ) : (
                <>
                  <CheckCircle2 size={18} /> Confirm Delivery & Generate GRN ({deliverySummary.currentIntake} Units)
                </>
              )}
            </button>
          </div>
        </div>
      )}
      {pdfPreviewPO && (
        <POPdfPreviewModal po={pdfPreviewPO} onClose={() => setPdfPreviewPO(null)} />
      )}
    </div>
  );
}

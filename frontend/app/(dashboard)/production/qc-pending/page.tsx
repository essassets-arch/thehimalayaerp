'use client';

import React, { useEffect, useState, useMemo } from 'react';
import PaginationControl from '@/shared/components/PaginationControl';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  RotateCcw,
  AlertCircle,
  Check,
  X,
  ClipboardCheck,
  CheckSquare,
  AlertTriangle,
  FileText,
  Building2,
  Boxes,
  Eye,
  Activity,
  History,
  Clock,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

import { backendFetch } from '@/lib/backendFetch';
import OrderDetailsModal from '@/shared/components/OrderDetailsModal';
import styles from './qc-pending.module.css';

const LOAD_CLASSES = ['5T', '12.5T', 'B125', 'C250', 'D400', 'E600', 'F900', 'ELD', 'LD', 'MD', 'HD', 'EHD', 'A15'];

const CHECKLIST_ITEMS = [
  { id: 'surfaceFinish', label: 'Surface Finish OK' },
  { id: 'noCracks', label: 'No Surface Cracks' },
  { id: 'noAirVoids', label: 'No Air Voids / Honeycombing' },
  { id: 'noWarpage', label: 'No Warpage or Distortion' },
  { id: 'noEdgeDamage', label: 'No Edge Damage' },
  { id: 'resinCuring', label: 'Proper Resin Curing' },
  { id: 'uniformColor', label: 'Uniform Colour & Finish' },
  { id: 'idMarking', label: 'Identification Marking Available' },
  { id: 'dimTolerance', label: 'Dimensions Within Tolerance' },
  { id: 'frameLidFitment', label: 'Frame & Lid Fitment OK' },
  { id: 'loadTestPassed', label: 'Load Test Passed' },
  { id: 'compressiveStrengthPassed', label: 'Compressive Strength Passed' },
  { id: 'flexuralStrengthPassed', label: 'Flexural Strength Passed' },
  { id: 'impactResistancePassed', label: 'Impact Resistance Passed' },
  { id: 'waterAbsorptionOk', label: 'Water Absorption Within Standard' },
  { id: 'weightOk', label: 'Weight Within Standard' },
  { id: 'lockingSystemOk', label: 'Locking System Working' },
  { id: 'easyOpening', label: 'Easy Opening & Closing' },
  { id: 'stableInstallation', label: 'Stable Installation' },
];

const DEFECT_OPTIONS = [
  'Surface Cracks',
  'Resin Defect',
  'Dimensional Deviation',
  'Colour Discoloration',
  'Structural Voids',
  'Frame Damage',
  'Warpage',
  'Lid Damage',
  'Improper Finish',
  'Other',
];

const resolveCustomerName = (job: any): string => {
  const so = job.productionPlan?.salesOrder || job.salesOrder;
  const leadObj = so?.quotation?.lead || so?.sourceQuotation?.lead || job.quotation?.lead || job.sourceQuotation?.lead;
  const customerObj = so?.customer || job.customer;
  return (
    customerObj?.companyName ||
    customerObj?.name ||
    leadObj?.companyName ||
    leadObj?.projectName ||
    leadObj?.customerName ||
    so?.customerName ||
    job.customerName ||
    job.companyName ||
    'Consignee Client'
  );
};

export default function QCPendingPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // ─── FULL INSPECT SHEET MODAL STATE ───
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectJob, setInspectJob] = useState<any>(null);

  // Sheet Fields
  const [productSize, setProductSize] = useState('600x600 mm');
  const [loadClass, setLoadClass] = useState('B125');
  const [batchNo, setBatchNo] = useState('BATCH-2026-001');
  const [productionDate, setProductionDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);

  // Quantities
  const [orderedQty, setOrderedQty] = useState<number>(1);
  const [producedQty, setProducedQty] = useState<number>(1);
  const [inspectedQty, setInspectedQty] = useState<number>(1);
  const [approvedQty, setApprovedQty] = useState<number>(1);
  const [rejectedQty, setRejectedQty] = useState<number>(0);

  // Checklist map
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() =>
    CHECKLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: true }), {})
  );

  // Defect flags
  const [defectFlags, setDefectFlags] = useState<string[]>([]);
  const [inspectorRemarks, setInspectorRemarks] = useState('');
  const [finalDecision, setFinalDecision] = useState<'APPROVED' | 'APPROVED_WITH_REMARKS' | 'HOLD_FOR_REWORK'>('APPROVED');

  const fetchJobs = React.useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefetching(true);

      const endpoint = activeTab === 'pending' 
        ? '/api/backend/production/qc-pending' 
        : '/api/backend/production/qc-history';
      const data = await backendFetch(endpoint);
      if (data && (data as any).success && Array.isArray((data as any).data)) {
        setJobs((data as any).data);
      } else if (Array.isArray(data)) {
        setJobs(data as any);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load QC list');
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setIsClient(true);
    fetchJobs();
  }, [fetchJobs]);

  // Open Full Inspect Sheet Modal
  const openInspectModal = (job: any) => {
    setInspectJob(job);
    const qty = Number(job.quantity || 1);
    const orderQty = job.salesOrderItem?.quantity 
      ? Number(job.salesOrderItem.quantity)
      : qty;

    setOrderedQty(orderQty);
    setProducedQty(qty);
    setInspectedQty(qty);
    setApprovedQty(qty);
    setRejectedQty(0);
    setBatchNo(`BATCH-${job.workOrderNumber || '2026-001'}`);

    // Parse product details dynamically
    const productName = job.salesOrderItem?.product?.name || job.productName || '';
    const sizeMatch = productName.match(/(\d+\s*[xX]\s*\d+)/);
    const size = sizeMatch ? sizeMatch[1] : '600x600 mm';
    setProductSize(size);

    let matchedClass = 'B125';
    const nameUpper = productName.toUpperCase();
    for (const cls of LOAD_CLASSES) {
      if (nameUpper.includes(cls)) {
        matchedClass = cls;
        break;
      }
    }
    if (matchedClass === 'B125') {
      if (nameUpper.includes('ELD')) matchedClass = 'ELD';
      else if (nameUpper.includes('EHD')) matchedClass = 'EHD';
      else if (nameUpper.includes('HD')) matchedClass = 'HD';
      else if (nameUpper.includes('MD')) matchedClass = 'MD';
      else if (nameUpper.includes('LD')) matchedClass = 'LD';
      else if (nameUpper.includes('A15')) matchedClass = 'A15';
    }
    setLoadClass(matchedClass);

    const prodDate = job.productionEndTime 
      ? new Date(job.productionEndTime).toISOString().split('T')[0]
      : new Date(job.updatedAt || job.createdAt || new Date()).toISOString().split('T')[0];
    setProductionDate(prodDate);
    setInspectionDate(new Date().toISOString().split('T')[0]);

    setChecklist(CHECKLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: true }), {}));
    setDefectFlags([]);
    setInspectorRemarks('');
    setFinalDecision('APPROVED');
    setInspectModalOpen(true);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllChecklist = (val: boolean) => {
    setChecklist(CHECKLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: val }), {}));
  };

  const toggleDefectFlag = (defect: string) => {
    setDefectFlags(prev =>
      prev.includes(defect) ? prev.filter(d => d !== defect) : [...prev, defect]
    );
  };

  // Submit Full Inspection Sheet
  const handleInspectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectJob) return;

    // Quantity formula validation check
    if (Number(approvedQty) + Number(rejectedQty) !== Number(inspectedQty)) {
      toast.error(`Validation Error: Approved Qty (${approvedQty}) + Rejected Qty (${rejectedQty}) must equal Inspected Qty (${inspectedQty}).`);
      return;
    }

    try {
      if (finalDecision === 'HOLD_FOR_REWORK') {
        const reason = defectFlags.length > 0 ? defectFlags.join(', ') : (inspectorRemarks || 'Failed Inspection Checklist');
        await backendFetch(`/api/backend/production/${inspectJob.id}/qc-fail`, {
          method: 'POST',
          body: {
            failureReason: reason,
            remarks: `Defects: ${defectFlags.join(', ')}. ${inspectorRemarks}`,
          },
        });
        
        Swal.fire({
          icon: 'warning',
          title: 'Hold for Rework / QC Failed! ⚠️',
          html: `Work Order <strong>#${inspectJob.workOrderNumber || inspectJob.id}</strong> has been marked as <strong>QC Failed</strong> and routed to the <a href="/production/qc-failed" style="color: #dc2626; font-weight: bold; text-decoration: underline;">QC Failed Queue</a>.`,
          timer: 3500,
          showConfirmButton: true,
          confirmButtonText: 'View QC Failed Queue →',
          confirmButtonColor: '#dc2626',
        }).then((res) => {
          if (res.isConfirmed) {
            window.location.href = '/production/qc-failed';
          }
        });
      } else {
        await backendFetch(`/api/backend/production/${inspectJob.id}/qc-pass`, {
          method: 'POST',
          body: {
            approvedQuantity: Number(approvedQty),
            rejectedQuantity: Number(rejectedQty),
            remarks: `${finalDecision === 'APPROVED_WITH_REMARKS' ? '[Approved with Remarks] ' : ''}${inspectorRemarks || 'Full QC Inspection Passed'}`,
          },
        });

        Swal.fire({
          icon: 'success',
          title: 'QC Inspection Approved! 🚀',
          html: `Work Order <strong>#${inspectJob.workOrderNumber || inspectJob.id}</strong> passed QC and is now staged in <a href="/production/ready-for-dispatch" style="color: #059669; font-weight: bold; text-decoration: underline;">Ready for Dispatch</a>.`,
          showCancelButton: true,
          confirmButtonText: 'View Ready for Dispatch →',
          cancelButtonText: 'Stay on QC Pending',
          confirmButtonColor: '#059669',
        }).then((res) => {
          if (res.isConfirmed) {
            window.location.href = '/production/ready-for-dispatch';
          }
        });
      }

      setInspectModalOpen(false);
      setInspectJob(null);
      fetchJobs(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit QC inspection');
    }
  };

  const handleQuickReject = async (job: any) => {
    const rawSo = job.productionPlan?.salesOrder?.orderNumber || job.salesOrder?.orderNumber;
    const numPart = (job.workOrderNumber || job.id || '').replace(/\D/g, '').slice(-5);
    const soNo = rawSo || `SO-2026-${(numPart || '00001').padStart(5, '0')}`;
    const woNo = job.workOrderNumber || `WO-${job.id.slice(0, 8)}`;

    const { value: formValues } = await Swal.fire({
      title: 'Reject QC Inspection',
      html: `
        <div style="text-align: left; font-size: 13px; color: #475569; margin-bottom: 14px;">
          Fail QC for Order <strong style="color: #0f172a;">${soNo} (${woNo})</strong> and send to <strong>QC Failed Queue</strong>:
        </div>
        <div style="text-align: left; margin-bottom: 10px;">
          <label style="font-size: 11.5px; font-weight: 800; color: #0f172a; text-transform: uppercase; display: block; margin-bottom: 4px;">Failure Reason *</label>
          <select id="swal-fail-reason" class="swal2-input" style="width: 100%; margin: 0; font-size: 13px; padding: 8px 12px; height: 40px; border-radius: 8px; border: 1px solid #cbd5e1; box-sizing: border-box;">
            <option value="Surface Cracks">Surface Cracks</option>
            <option value="Resin Defect">Resin Defect / Under-curing</option>
            <option value="Dimensional Deviation">Dimensional Deviation (Out of tolerance)</option>
            <option value="Colour Discoloration">Colour Discoloration / Texture Issue</option>
            <option value="Structural Voids">Structural Voids / Air Pockets</option>
            <option value="Frame Damage">Frame Damage / Warpage</option>
            <option value="Load Test Failed">Load Test Failed</option>
            <option value="Improper Finish">Improper Finish / Sharp Edges</option>
            <option value="Other Defect">Other Defect</option>
          </select>
        </div>
        <div style="text-align: left;">
          <label style="font-size: 11.5px; font-weight: 800; color: #0f172a; text-transform: uppercase; display: block; margin-bottom: 4px;">Inspector Remarks / Notes</label>
          <textarea id="swal-fail-remarks" class="swal2-textarea" style="width: 100%; margin: 0; font-size: 13px; padding: 8px 12px; height: 70px; border-radius: 8px; border: 1px solid #cbd5e1; box-sizing: border-box;" placeholder="Provide failure details or rework notes..."></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Confirm QC Rejection',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      preConfirm: () => {
        const reason = (document.getElementById('swal-fail-reason') as HTMLSelectElement)?.value || 'QC Defect';
        const remarks = (document.getElementById('swal-fail-remarks') as HTMLTextAreaElement)?.value || '';
        return { reason, remarks };
      },
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn'
      },
      buttonsStyling: false
    });

    if (!formValues) return;

    try {
      toast.loading('Submitting QC rejection...');
      await backendFetch(`/api/backend/production/${job.id}/qc-fail`, {
        method: 'POST',
        body: {
          failureReason: formValues.reason,
          remarks: formValues.remarks,
        },
      });

      toast.dismiss();
      Swal.fire({
        icon: 'error',
        title: 'Job QC Rejected! ❌',
        html: `Work Order <strong>${woNo}</strong> has been marked as <strong>QC Failed</strong> and moved to <a href="/production/qc-failed" style="color: #dc2626; font-weight: bold; text-decoration: underline;">QC Failed Queue</a>.`,
        timer: 3500,
        showConfirmButton: true,
        confirmButtonText: 'View QC Failed Queue →',
        confirmButtonColor: '#dc2626',
      }).then((res) => {
        if (res.isConfirmed) {
          window.location.href = '/production/qc-failed';
        }
      });

      fetchJobs(true);
    } catch (err: any) {
      toast.dismiss();
      Swal.fire({
        icon: 'error',
        title: 'Rejection Failed',
        text: err.message || 'Could not reject work order.',
      });
    }
  };

  const handleOpenDetails = (job: any) => {
    const rawSo = job.productionPlan?.salesOrder?.orderNumber || job.salesOrder?.orderNumber;
    const numPart = (job.workOrderNumber || job.id || '').replace(/\D/g, '').slice(-5);
    const soNo = rawSo || `SO-2026-${(numPart || '00001').padStart(5, '0')}`;

    const customerObj = job.productionPlan?.salesOrder?.customer || job.salesOrder?.customer || job.customer;
    const customerName = resolveCustomerName(job);
    const address = customerObj?.address || customerObj?.city || job.customerAddress || 'Plant Warehouse';
    const gst = customerObj?.gstin || customerObj?.gst || job.customerGst || '27ABCDE4321G2Z8';

    const rawDate = job.createdAt || (job.productionPlan?.salesOrder as any)?.createdAt;
    const orderDate = rawDate
      ? new Date(rawDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    let itemsList: Array<{ name: string; code: string; qty: number; rate?: number; gst?: number; total?: number }> = [];

    const soItems = job.productionPlan?.salesOrder?.items || job.salesOrder?.items;
    if (Array.isArray(soItems) && soItems.length > 0) {
      itemsList = soItems.map((item: any) => {
        const name = item.product?.name || item.productNameSnapshot || item.productName || item.name || 'Ordered Product';
        const code = item.product?.sku || item.product?.publicId || item.product?.code || item.productCodeSnapshot || item.productCode || '-';
        const qty = Number(item.quantity ?? job.quantity ?? 1);
        const rate = Number(item.unitPrice ?? item.price ?? 0);
        return { name, code, qty, rate };
      });
    }

    if (itemsList.length === 0 && job.salesOrderItem) {
      const soi = job.salesOrderItem;
      const name = soi.product?.name || soi.productName || 'QC Inspection Item';
      const code = soi.product?.sku || soi.product?.code || job.workOrderNumber || '-';
      const qty = Number(job.quantity || 1);
      itemsList.push({ name, code, qty });
    }

    if (itemsList.length === 0) {
      itemsList.push({
        name: job.productName || `Work Order - ${job.workOrderNumber || '001'}`,
        code: job.productCode || job.workOrderNumber || '-',
        qty: Number(job.quantity || 1)
      });
    }

    const mapped = {
      ref: soNo,
      orderNo: soNo,
      customerName,
      address,
      gst,
      orderDate,
      salesStatus: 'Confirmed',
      productionStatus: job.qcInspectionStatus || 'QC Pending',
      dispatchStatus: 'Pending',
      items: itemsList,
    };
    setSelectedOrderForModal(mapped);
  };

  // Helper for products list formatted with +more
  const renderProductCell = (job: any) => {
    const soItems = job.productionPlan?.salesOrder?.items || job.salesOrder?.items;
    let itemsList: string[] = [];

    if (Array.isArray(soItems) && soItems.length > 0) {
      itemsList = soItems.map((i: any) => i.product?.name || i.productNameSnapshot || i.productName || i.name).filter(Boolean);
    } else if (job.salesOrderItem?.product?.name) {
      itemsList = [job.salesOrderItem.product.name];
    } else if (job.productName) {
      itemsList = [job.productName];
    }

    if (itemsList.length === 0) {
      return <span style={{ color: '#64748b' }}>Finished Good</span>;
    }

    const displayed = itemsList.slice(0, 2);
    const remainingCount = itemsList.length - 2;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }} title={itemsList.join(', ')}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '13.5px' }}>
            {displayed.join(', ')}
          </span>
          {Boolean(job.reworkCount && Number(job.reworkCount) > 0) && (
            <span
              style={{
                background: '#fff7ed',
                color: '#c2410c',
                border: '1px solid #fdba74',
                padding: '2px 7px',
                borderRadius: '6px',
                fontSize: '10.5px',
                fontWeight: '800',
                whiteSpace: 'nowrap'
              }}
              title={`Item was reworked #${job.reworkCount}. Past Defect: ${job.failureReason || 'QC Rejection'}`}
            >
              🔁 REWORK #{job.reworkCount} (Re-Inspection)
            </span>
          )}
          {remainingCount > 0 && (
            <span
              style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                padding: '1px 7px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '800',
                whiteSpace: 'nowrap'
              }}
              title={itemsList.slice(2).join(', ')}
            >
              +{remainingCount} more
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {(job.productCode || job.salesOrderItem?.product?.sku) && (
            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
              SKU: {job.productCode || job.salesOrderItem?.product?.sku}
            </span>
          )}
          {job.failureReason && Boolean(job.reworkCount && Number(job.reworkCount) > 0) && (
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600' }}>
              ⚠️ Past Defect: {job.failureReason}
            </span>
          )}
        </div>
      </div>
    );
  };

  const filteredJobs = useMemo(() => {
    const list = jobs.filter((job: any) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const soNo = (job.productionPlan?.salesOrder?.orderNumber || job.salesOrder?.orderNumber || '').toLowerCase();
      const woNo = (job.workOrderNumber || job.id || '').toLowerCase();
      const customer = (job.productionPlan?.salesOrder?.customer?.companyName || job.productionPlan?.salesOrder?.customer?.name || job.customerName || '').toLowerCase();
      const product = (job.salesOrderItem?.product?.name || job.productName || '').toLowerCase();
      return soNo.includes(q) || woNo.includes(q) || customer.includes(q) || product.includes(q);
    });

    return [...list].sort((a: any, b: any) => {
      const tA = new Date(a.createdAt || a.created_at || a.completedAt || 0).getTime();
      const tB = new Date(b.createdAt || b.created_at || b.completedAt || 0).getTime();
      const numA = parseInt(String(a.workOrderNumber || a.productionPlan?.salesOrder?.orderNumber || a.id || '').replace(/\D/g, '')) || 0;
      const numB = parseInt(String(b.workOrderNumber || b.productionPlan?.salesOrder?.orderNumber || b.id || '').replace(/\D/g, '')) || 0;
      if (numA && numB && numA !== numB) return numB - numA;
      if (tA && tB && tA !== tB) return tB - tA;
      return String(b.workOrderNumber || b.id || '').localeCompare(String(a.workOrderNumber || a.id || ''));
    });
  }, [jobs, searchQuery]);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

  if (!isClient) return null;

  const isValidQuantity = Number(approvedQty) + Number(rejectedQty) === Number(inspectedQty);

  return (
    <main className={styles.qcPage}>
      {/* ── Header Container ── */}
      <div className={styles.headerContainer}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quality Assurance
            </span>
            <div className={styles.liveTag}>
              <span className={styles.pulseGreenDot} />
              <span>{jobs.length} {activeTab === 'pending' ? 'Pending Inspection' : 'Inspected'}</span>
            </div>
          </div>
          <h1 className={styles.pageTitle}>QC Inspection Station</h1>
          <p className={styles.pageSubtitle}>
            Perform full technical QC sheet audits, approve finished batches for dispatch, or flag defect rework.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            type="button" 
            onClick={() => fetchJobs(true)} 
            className={styles.btnRefresh}
            title="Refresh QC Station"
          >
            <RotateCcw size={14} className={isRefetching ? styles.spinning : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Control Bar: Tabs & Search ── */}
      <div className={styles.controlBar}>
        {/* Scrollable Tabs */}
        <div className={styles.tabScrollWrapper}>
          <div className={styles.tabGroup}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <Activity size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
              Pending QC ({activeTab === 'pending' ? jobs.length : '—'})
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'history' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
              QC History ({activeTab === 'history' ? jobs.length : '—'})
            </button>
          </div>
        </div>

        {/* Search Box */}
        <div className={styles.searchBox}>
          <Search size={16} color="#64748b" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search sales order, WO, product, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: '0 4px' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Main QC Content ── */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingBox}>
            <div className={styles.spinner} />
            <span>Loading QC inspections...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <Boxes size={38} color="#94a3b8" />
            <span style={{ fontWeight: '700', fontSize: '15px', color: '#334155' }}>
              {activeTab === 'pending' ? 'No Jobs Pending QC' : 'No Inspection History'}
            </span>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              {searchQuery 
                ? 'Try adjusting your search criteria.' 
                : activeTab === 'pending' 
                  ? 'All manufacturing jobs have passed QC or none are awaiting inspection.' 
                  : 'No completed QC inspections found in history.'}
            </p>
          </div>
        ) : (
          <>
            {/* 1. Mobile Cards Container (Pure CSS media query for 100% reliable scrolling) */}
            <div className={styles.mobileCardsContainer}>
              {paginatedJobs.map((job: any) => {
                const rawSo = job.productionPlan?.salesOrder?.orderNumber || job.salesOrder?.orderNumber;
                const numPart = (job.workOrderNumber || job.id || '').replace(/\D/g, '').slice(-5);
                const soNo = rawSo || `SO-2026-${(numPart || '00001').padStart(5, '0')}`;
                const customerName = resolveCustomerName(job);
                const status = job.qcInspectionStatus || (activeTab === 'pending' ? 'QC PENDING' : 'PASSED');

                return (
                  <div key={job.id} className={styles.mobileCard}>
                    {/* Header: SO, Customer & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span 
                            onClick={() => handleOpenDetails(job)}
                            className={styles.soLinkMobile}
                          >
                            {soNo}
                          </span>
                          <span className={styles.woBadgeMobile}>
                            {job.workOrderNumber || 'WO'}
                          </span>
                          {Boolean(job.reworkCount && Number(job.reworkCount) > 0) && (
                            <span style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fdba74', padding: '1px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '800' }}>
                              🔁 REWORK #{job.reworkCount}
                            </span>
                          )}
                        </div>
                        <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Building2 size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customerName}</span>
                        </span>
                      </div>

                      <span className={status === 'PASSED' ? styles.badgePassed : status === 'FAILED' ? styles.badgeFailed : styles.badgePending}>
                        {status}
                      </span>
                    </div>

                    {/* Product & Qty Row */}
                    <div className={styles.mobileProductBox}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                          Product Item
                        </span>
                        {renderProductCell(job)}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>
                          Ordered Qty
                        </span>
                        <div className={styles.qtyBadgeMobile}>
                          {job.quantity || 1} <span style={{ fontSize: '10px', fontWeight: '700', color: '#0369a1' }}>UNITS</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className={styles.mobileActionFooter}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '11.5px', fontWeight: '600' }}>
                        <Clock size={13} color="#94a3b8" />
                        <span>{job.productionEndTime ? new Date(job.productionEndTime).toLocaleDateString('en-GB') : 'Ready for QC'}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className={styles.btnTerminalMobile}
                          onClick={() => handleOpenDetails(job)}
                        >
                          <Eye size={12} /> View
                        </button>
                        
                        {activeTab === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleQuickReject(job)}
                              className={styles.btnRejectMobile}
                            >
                              <XCircle size={12} /> Reject
                            </button>

                            <button
                              type="button"
                              onClick={() => openInspectModal(job)}
                              className={styles.btnInspectMobile}
                            >
                              <ClipboardCheck size={13} /> Inspect
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. Desktop Table (Pure CSS media query for 100% reliable desktop display) */}
            <div className={styles.desktopTableWrapper}>
              <table className={styles.qcTable}>
                <thead>
                  <tr>
                    <th style={{ width: '200px' }}>Sales Order & WO #</th>
                    <th style={{ width: '170px' }}>Customer</th>
                    <th>Product Item</th>
                    <th style={{ textAlign: 'center', width: '110px' }}>Ordered Qty</th>
                    <th style={{ textAlign: 'center', width: '140px' }}>Status</th>
                    <th style={{ textAlign: 'center', width: '160px' }}>
                      {activeTab === 'pending' ? 'Production Ended' : 'Inspected At'}
                    </th>
                    <th style={{ textAlign: 'right', width: '210px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedJobs.map((job: any) => {
                    const rawSo = job.productionPlan?.salesOrder?.orderNumber || job.salesOrder?.orderNumber;
                    const numPart = (job.workOrderNumber || job.id || '').replace(/\D/g, '').slice(-5);
                    const soNo = rawSo || `SO-2026-${(numPart || '00001').padStart(5, '0')}`;
                    const customerName = resolveCustomerName(job);
                    const status = job.qcInspectionStatus || (activeTab === 'pending' ? 'QC PENDING' : 'PASSED');

                    return (
                      <tr key={job.id} className={styles.tableRow}>
                        {/* Order & WO # */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span 
                              onClick={() => handleOpenDetails(job)}
                              className={styles.soLink}
                            >
                              {soNo}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                              <span className={styles.woBadge}>
                                WO: {job.workOrderNumber || '—'}
                              </span>
                              {Boolean(job.reworkCount && Number(job.reworkCount) > 0) && (
                                <span style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fdba74', padding: '1px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '800' }}>
                                  🔁 REWORK #{job.reworkCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td>
                          <span style={{ fontWeight: '700', color: '#334155', fontSize: '13px' }}>
                            {customerName}
                          </span>
                        </td>

                        {/* Product */}
                        <td>
                          {renderProductCell(job)}
                        </td>

                        {/* Quantity */}
                        <td style={{ textAlign: 'center' }}>
                          <div className={styles.qtyBadge}>
                            {job.quantity || 1}
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ textAlign: 'center' }}>
                          <span className={status === 'PASSED' ? styles.badgePassed : status === 'FAILED' ? styles.badgeFailed : styles.badgePending}>
                            {status}
                          </span>
                        </td>

                        {/* Timestamp */}
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: '600' }}>
                            {activeTab === 'pending' 
                              ? (job.productionEndTime ? new Date(job.productionEndTime).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Ready')
                              : (job.qcApprovedAt ? new Date(job.qcApprovedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Inspected')
                            }
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className={styles.btnTerminal}
                              onClick={() => handleOpenDetails(job)}
                            >
                              <Eye size={14} /> View
                            </button>

                            {activeTab === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleQuickReject(job)}
                                  className={styles.btnReject}
                                  title="Fail QC & Route to QC Failed Queue"
                                >
                                  <XCircle size={14} /> Reject
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openInspectModal(job)}
                                  className={styles.btnInspect}
                                  title="Open Full Technical QC Sheet"
                                >
                                  <ClipboardCheck size={14} /> Inspect
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationControl
              currentPage={currentPage}
              totalPages={Math.ceil(filteredJobs.length / pageSize) || 1}
              totalItems={filteredJobs.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </div>

      {/* ─── FULL TECHNICAL QC INSPECTION SHEET MODAL ─── */}
      {inspectModalOpen && inspectJob && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalEyebrow}>HIMALAYA QUALITY AUDIT</span>
                <h2 className={styles.modalTitle}>
                  <ClipboardCheck size={20} color="#38bdf8" /> Technical QC Inspection Sheet
                </h2>
              </div>
              <button 
                type="button" 
                onClick={() => setInspectModalOpen(false)} 
                className={styles.modalCloseBtn}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleInspectSubmit} className={styles.modalForm}>
              
              {/* SECTION 1: ORDER DETAILS */}
              <div className={styles.sheetSection}>
                <h4 className={styles.sectionHeader}>
                  <FileText size={15} color="#0284c7" /> Order Details & Product Specifications
                </h4>

                <div className={styles.formGrid}>
                  <div>
                    <label className={styles.fieldLabel}>Work Order / Job ID</label>
                    <input
                      type="text"
                      value={inspectJob.workOrderNumber || inspectJob.id}
                      disabled
                      className={styles.inputDisabled}
                    />
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Sales Order Reference</label>
                    <input
                      type="text"
                      value={inspectJob.productionPlan?.salesOrder?.orderNumber || inspectJob.salesOrder?.orderNumber || 'SO-2026-00001'}
                      disabled
                      className={styles.inputDisabled}
                    />
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Customer Company</label>
                    <input
                      type="text"
                      value={inspectJob.productionPlan?.salesOrder?.customer?.companyName || inspectJob.productionPlan?.salesOrder?.customer?.name || inspectJob.customerName || 'Internal'}
                      disabled
                      className={styles.inputDisabled}
                    />
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Product Item</label>
                    <input
                      type="text"
                      value={inspectJob.salesOrderItem?.product?.name || inspectJob.productName || 'FRP Manhole Cover'}
                      disabled
                      className={styles.inputDisabled}
                    />
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Batch / Heat Number *</label>
                    <input
                      type="text"
                      value={batchNo}
                      onChange={e => setBatchNo(e.target.value)}
                      required
                      className={styles.inputActive}
                      placeholder="e.g. BATCH-2026-FRP-001"
                    />
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Product Size / Dimensions</label>
                    <input
                      type="text"
                      value={productSize}
                      onChange={e => setProductSize(e.target.value)}
                      className={styles.inputActive}
                      placeholder="e.g. 600x600 mm"
                    />
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Load Class Standard</label>
                    <select
                      value={loadClass}
                      onChange={e => setLoadClass(e.target.value)}
                      className={styles.inputActive}
                    >
                      {LOAD_CLASSES.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Inspection Date</label>
                    <input
                      type="date"
                      value={inspectionDate}
                      onChange={e => setInspectionDate(e.target.value)}
                      className={styles.inputActive}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: QUANTITY RECONCILIATION */}
              <div className={styles.sheetSection}>
                <h4 className={styles.sectionHeader}>
                  <Boxes size={15} color="#0284c7" /> Quantity Reconciliation
                </h4>

                <div className={styles.qtyGrid}>
                  <div>
                    <label className={styles.fieldLabel}>Ordered Qty</label>
                    <input
                      type="number"
                      value={orderedQty}
                      disabled
                      className={styles.inputDisabled}
                    />
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Produced Qty</label>
                    <input
                      type="number"
                      value={producedQty}
                      disabled
                      className={styles.inputDisabled}
                    />
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Inspected Qty *</label>
                    <input
                      type="number"
                      min="1"
                      value={inspectedQty}
                      onChange={e => setInspectedQty(Number(e.target.value))}
                      required
                      className={styles.inputActive}
                    />
                  </div>
                  <div>
                    <label className={styles.fieldLabel} style={{ color: '#059669', fontWeight: 800 }}>Approved Qty *</label>
                    <input
                      type="number"
                      min="0"
                      value={approvedQty}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setApprovedQty(val);
                        setRejectedQty(Math.max(0, inspectedQty - val));
                      }}
                      required
                      className={styles.inputApproved}
                    />
                  </div>
                  <div>
                    <label className={styles.fieldLabel} style={{ color: '#dc2626', fontWeight: 800 }}>Rejected Qty *</label>
                    <input
                      type="number"
                      min="0"
                      value={rejectedQty}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setRejectedQty(val);
                        setApprovedQty(Math.max(0, inspectedQty - val));
                      }}
                      required
                      className={styles.inputRejected}
                    />
                  </div>
                </div>

                {!isValidQuantity && (
                  <div className={styles.errorBanner}>
                    <AlertTriangle size={15} />
                    <span>Approved Qty ({approvedQty}) + Rejected Qty ({rejectedQty}) must equal Inspected Qty ({inspectedQty}).</span>
                  </div>
                )}
              </div>

              {/* SECTION 3: TECHNICAL CHECKLIST */}
              <div className={styles.sheetSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 className={styles.sectionHeader} style={{ margin: 0 }}>
                    <CheckSquare size={15} color="#0284c7" /> Technical Quality Checklist ({CHECKLIST_ITEMS.length} Points)
                  </h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => toggleAllChecklist(true)}
                      className={styles.btnMiniOutline}
                    >
                      ✓ Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllChecklist(false)}
                      className={styles.btnMiniOutline}
                    >
                      ✕ Clear All
                    </button>
                  </div>
                </div>

                <div className={styles.checklistGrid}>
                  {CHECKLIST_ITEMS.map((item) => (
                    <label
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`${styles.checklistItem} ${checklist[item.id] ? styles.checklistItemActive : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={!!checklist[item.id]}
                        onChange={() => {}}
                        style={{ cursor: 'pointer', accentColor: '#0284c7' }}
                      />
                      <span style={{ fontSize: '12.5px', fontWeight: checklist[item.id] ? '700' : '500', color: checklist[item.id] ? '#0f172a' : '#64748b' }}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SECTION 4: DEFECTS & REMARKS */}
              <div className={styles.sheetSection}>
                <h4 className={styles.sectionHeader}>
                  <AlertTriangle size={15} color="#d97706" /> Defect Flags & Observations
                </h4>

                <div className={styles.defectTagsContainer}>
                  {DEFECT_OPTIONS.map(defect => {
                    const isSelected = defectFlags.includes(defect);
                    return (
                      <button
                        key={defect}
                        type="button"
                        onClick={() => toggleDefectFlag(defect)}
                        className={`${styles.defectTag} ${isSelected ? styles.defectTagActive : ''}`}
                      >
                        {isSelected ? '✕ ' : '+ '} {defect}
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label className={styles.fieldLabel}>Inspector Notes / Technical Observations</label>
                  <textarea
                    value={inspectorRemarks}
                    onChange={e => setInspectorRemarks(e.target.value)}
                    rows={2}
                    placeholder="Provide specific notes regarding surface finish, dimension variance, or load test results..."
                    className={styles.textareaInput}
                  />
                </div>
              </div>

              {/* SECTION 5: FINAL DECISION */}
              <div className={styles.sheetSection} style={{ border: '2px solid #0284c7', background: '#f0f9ff' }}>
                <h4 className={styles.sectionHeader} style={{ color: '#0369a1' }}>
                  <ShieldCheck size={16} color="#0284c7" /> Final QC Disposition & Decision
                </h4>

                <div className={styles.decisionGrid}>
                  <label className={`${styles.decisionCard} ${finalDecision === 'APPROVED' ? styles.decisionApproved : ''}`}>
                    <input
                      type="radio"
                      name="finalDecision"
                      value="APPROVED"
                      checked={finalDecision === 'APPROVED'}
                      onChange={() => setFinalDecision('APPROVED')}
                    />
                    <div>
                      <strong>APPROVED (Pass)</strong>
                      <p>Send to Finished Goods & Dispatch queue</p>
                    </div>
                  </label>

                  <label className={`${styles.decisionCard} ${finalDecision === 'APPROVED_WITH_REMARKS' ? styles.decisionWarning : ''}`}>
                    <input
                      type="radio"
                      name="finalDecision"
                      value="APPROVED_WITH_REMARKS"
                      checked={finalDecision === 'APPROVED_WITH_REMARKS'}
                      onChange={() => setFinalDecision('APPROVED_WITH_REMARKS')}
                    />
                    <div>
                      <strong>APPROVED WITH REMARKS</strong>
                      <p>Pass with minor recorded observations</p>
                    </div>
                  </label>

                  <label className={`${styles.decisionCard} ${finalDecision === 'HOLD_FOR_REWORK' ? styles.decisionDanger : ''}`}>
                    <input
                      type="radio"
                      name="finalDecision"
                      value="HOLD_FOR_REWORK"
                      checked={finalDecision === 'HOLD_FOR_REWORK'}
                      onChange={() => setFinalDecision('HOLD_FOR_REWORK')}
                    />
                    <div>
                      <strong>HOLD FOR REWORK (Fail)</strong>
                      <p>Send back to production floor for rework</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setInspectModalOpen(false)}
                  className={styles.btnCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValidQuantity}
                  className={finalDecision === 'HOLD_FOR_REWORK' ? styles.btnSubmitFail : styles.btnSubmitPass}
                >
                  {finalDecision === 'HOLD_FOR_REWORK' ? (
                    <>
                      <XCircle size={16} /> Submit Hold & Send to Rework
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Complete QC & Approve for Dispatch
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Inspection Modal */}
      {selectedOrderForModal && (
        <OrderDetailsModal
          order={selectedOrderForModal}
          role="production"
          onClose={() => setSelectedOrderForModal(null)}
        />
      )}
    </main>
  );
}

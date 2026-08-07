'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  ClipboardCheck,
  CheckSquare,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import styles from './qc-pending.module.css';
import { backendFetch } from '@/lib/backendFetch';

const LOAD_CLASSES = ['5T', '12.5T', 'B125', 'C250', 'D400', 'E600', 'F900'];

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

export default function QCPendingPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  // Quick Pass Modal State
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [selectedPassJob, setSelectedPassJob] = useState<any>(null);
  const [passRemarks, setPassRemarks] = useState('QC passed');

  // Quick Fail Modal State
  const [failModalOpen, setFailModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [qcRemarks, setQcRemarks] = useState('');

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

  const fetchJobs = React.useCallback(async () => {
    try {
      setLoading(true);
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
    setOrderedQty(qty);
    setProducedQty(qty);
    setInspectedQty(qty);
    setApprovedQty(qty);
    setRejectedQty(0);
    setBatchNo(`BATCH-${job.workOrderNumber || '2026-001'}`);
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
        toast.success('Job marked HOLD FOR REWORK and sent to Rework queue.');
      } else {
        await backendFetch(`/api/backend/production/${inspectJob.id}/qc-pass`, {
          method: 'POST',
          body: {
            approvedQuantity: Number(approvedQty),
            rejectedQuantity: Number(rejectedQty),
            remarks: `${finalDecision === 'APPROVED_WITH_REMARKS' ? '[Approved with Remarks] ' : ''}${inspectorRemarks || 'Full QC Inspection Passed'}`,
          },
        });
        toast.success('QC Inspection Completed & Approved! Sent to Dispatch.');
      }

      setInspectModalOpen(false);
      setInspectJob(null);
      fetchJobs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit QC inspection');
    }
  };

  // Quick Pass Modal
  const openPassModal = (job: any) => {
    setSelectedPassJob(job);
    setPassRemarks('QC passed');
    setPassModalOpen(true);
  };

  const handlePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPassJob) return;
    try {
      const producedQuantity = Number(
        selectedPassJob.producedQuantity ??
        selectedPassJob.completedQuantity ??
        selectedPassJob.quantity ??
        0
      );

      if (!producedQuantity || producedQuantity <= 0) {
        throw new Error("Approved quantity must be greater than zero.");
      }

      await backendFetch(`/api/backend/production/${selectedPassJob.id}/qc-pass`, {
        method: 'POST',
        body: {
          approvedQuantity: producedQuantity,
          rejectedQuantity: 0,
          remarks: passRemarks || 'QC passed',
        }
      });
      toast.success('QC Passed. Sent to dispatch.');
      setPassModalOpen(false);
      setSelectedPassJob(null);
      fetchJobs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update job');
    }
  };

  // Quick Fail Modal
  const openFailModal = (id: string) => {
    setSelectedJobId(id);
    setFailureReason('');
    setQcRemarks('');
    setFailModalOpen(true);
  };

  const handleFailSubmit = async (e: any) => {
    e.preventDefault();
    if (!failureReason.trim()) return toast.error('Failure reason is required');
    try {
      await backendFetch(`/api/backend/production/${selectedJobId}/qc-fail`, {
        method: 'POST',
        body: { failureReason, remarks: qcRemarks },
      });
      toast.success('QC Failed. Job sent back for rework.');
      setFailModalOpen(false);
      fetchJobs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update job');
    }
  };

  const filteredJobs = jobs.filter((job: any) => {
    const q = searchQuery.toLowerCase();
    const soNo = (job.productionPlan?.salesOrder?.orderNumber || job.salesOrder?.orderNumber || '').toLowerCase();
    const woNo = (job.workOrderNumber || job.id || '').toLowerCase();
    const customer = (job.productionPlan?.salesOrder?.customer?.name || '').toLowerCase();
    const product = (job.salesOrderItem?.product?.name || '').toLowerCase();
    return soNo.includes(q) || woNo.includes(q) || customer.includes(q) || product.includes(q);
  });

  if (!isClient) return null;

  const isValidQuantity = Number(approvedQty) + Number(rejectedQty) === Number(inspectedQty);

  return (
    <div className={styles.page}>
      {/* ─── Hero Banner ─── */}
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <ShieldCheck size={24} />
        </div>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Quality Assurance</span>
          <h1>QC Inspections</h1>
          <p>Perform full technical QC sheet audits, approve items for dispatch, or flag defect rework</p>
        </div>
        <div className={styles.summaryBadge}>
          <span className={styles.liveDot} />
          <strong>{filteredJobs.length}</strong>
          <span>{activeTab === 'pending' ? 'Pending' : 'Inspected'}<br />Jobs</span>
        </div>
      </div>

      {/* ─── Main Panel ─── */}
      <div className={styles.panel}>
        {/* ─── Tabs Header ─── */}
        <div className={styles.tabBar}>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.tabBtnActive : ''}`}
          >
            Pending QC
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`${styles.tabBtn} ${activeTab === 'history' ? styles.tabBtnActive : ''}`}
          >
            QC History
          </button>
        </div>

        {/* ─── Toolbar ─── */}
        <div className={styles.toolbar}>
          <div>
            <h2>{activeTab === 'pending' ? 'Items Awaiting Inspection' : 'QC Inspection History'}</h2>
            <p>{activeTab === 'pending' ? 'Click Inspect to complete full technical audit or use quick pass/fail' : 'Log of passed and failed inspections'}</p>
          </div>
          <div className={styles.toolbarRight}>
            <div className={styles.search}>
              <Search size={16} style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search sales order, WO, product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={fetchJobs} className={styles.refreshBtn}>
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ─── Table Content ─── */}
        {loading ? (
          <div className={styles.emptyState}>
            <p>Loading QC inspections...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertCircle size={44} style={{ color: '#64748b', margin: '0 auto 12px', display: 'block' }} />
            <h3>{activeTab === 'pending' ? 'No Jobs Pending QC' : 'No Inspection History'}</h3>
            <p>{activeTab === 'pending' ? 'Production has not sent any items for review yet.' : 'No completed QC inspections found.'}</p>
          </div>
        ) : (
          <div className={styles.tableArea}>
            <table>
              <thead>
                <tr>
                  <th style={{ minWidth: '170px' }}>Sales Order</th>
                  <th style={{ minWidth: '150px' }}>WO Number</th>
                  <th style={{ minWidth: '150px' }}>Production Plan</th>
                  <th style={{ minWidth: '160px' }}>Customer</th>
                  <th style={{ minWidth: '180px' }}>Product</th>
                  <th style={{ minWidth: '90px', textAlign: 'center' }}>Quantity</th>
                  <th style={{ minWidth: '140px', textAlign: 'center' }}>Status</th>
                  {activeTab === 'pending' ? (
                    <>
                      <th style={{ minWidth: '160px' }}>Production Ended</th>
                      <th style={{ minWidth: '280px', textAlign: 'right' }}>Actions</th>
                    </>
                  ) : (
                    <>
                      <th style={{ minWidth: '160px' }}>Inspected At</th>
                      <th style={{ minWidth: '200px' }}>Notes</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job: any) => {
                  const rawSo = job.productionPlan?.salesOrder?.orderNumber || job.salesOrder?.orderNumber;
                  const numPart = (job.workOrderNumber || job.id || '').replace(/\D/g, '').slice(-5);
                  const soNo = rawSo || `SO-2026-${(numPart || '00001').padStart(5, '0')}`;
                  const status = job.qcInspectionStatus || 'QC PENDING';

                  return (
                    <tr key={job.id}>
                      <td style={{ fontWeight: 700, color: '#2563eb' }}>{soNo}</td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{job.workOrderNumber || job.id}</td>
                      <td>{job.productionPlan?.planNumber || 'N/A'}</td>
                      <td>{job.productionPlan?.salesOrder?.customer?.name || 'Internal'}</td>
                      <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={job.salesOrderItem?.product?.name || 'N/A'}>
                        {job.salesOrderItem?.product?.name || 'N/A'}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{job.quantity}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: status === 'PASSED' ? '#dcfce7' : status === 'FAILED' ? '#fef2f2' : '#fef3c7',
                            color: status === 'PASSED' ? '#15803d' : status === 'FAILED' ? '#dc2626' : '#d97706',
                            border: `1px solid ${status === 'PASSED' ? '#bbf7d0' : status === 'FAILED' ? '#fecaca' : '#fde68a'}`,
                          }}
                        >
                          {status}
                        </span>
                      </td>

                      {activeTab === 'pending' ? (
                        <>
                          <td style={{ fontSize: '13px', color: '#64748b' }}>
                            {job.productionEndTime ? new Date(job.productionEndTime).toLocaleString() : 'N/A'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
                              <button onClick={() => openInspectModal(job)} className={styles.btnInspect} title="Open Full Technical QC Inspection Sheet">
                                <ClipboardCheck size={15} /> Inspect
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ fontSize: '13px', color: '#64748b' }}>
                            {job.qcApprovedAt ? new Date(job.qcApprovedAt).toLocaleString() : 'N/A'}
                          </td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={job.qcInspectionNotes || ''}>
                            {job.qcInspectionNotes || '-'}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── FULL TECHNICAL QC INSPECTION SHEET MODAL ─── */}
      {inspectModalOpen && inspectJob && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: '18px', width: '100%', maxWidth: '840px', maxHeight: '92vh', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#38bdf8' }}>HIMALAYA QUALITY AUDIT</span>
                <h2 style={{ margin: '2px 0 0', fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardCheck size={22} style={{ color: '#38bdf8' }} /> Technical QC Inspection Sheet
                </h2>
              </div>
              <button onClick={() => setInspectModalOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleInspectSubmit} style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              
              {/* SECTION 1: ORDER DETAILS */}
              <div style={{ marginBottom: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} style={{ color: '#2563eb' }} /> Order Details & Product Specifications
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Order No. (SO / WO)</label>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>
                      {inspectJob.productionPlan?.salesOrder?.orderNumber || `SO-2026-${(inspectJob.workOrderNumber || inspectJob.id || '').replace(/\D/g, '').slice(-5).padStart(5, '0')}`} ({inspectJob.workOrderNumber})
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Customer Name</label>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                      {inspectJob.productionPlan?.salesOrder?.customer?.name || 'Internal'}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Product Name</label>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                      {inspectJob.salesOrderItem?.product?.name || 'FRP Drain Cover / Manhole Cover'}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Product Size</label>
                    <input
                      type="text"
                      value={productSize}
                      onChange={(e) => setProductSize(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Load Class</label>
                    <select
                      value={loadClass}
                      onChange={(e) => setLoadClass(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '2px', background: '#fff' }}
                    >
                      {LOAD_CLASSES.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Batch No.</label>
                    <input
                      type="text"
                      value={batchNo}
                      onChange={(e) => setBatchNo(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Production Date</label>
                    <input
                      type="date"
                      value={productionDate}
                      onChange={(e) => setProductionDate(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Inspection Date</label>
                    <input
                      type="date"
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginTop: '2px' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRODUCTION QUANTITIES & LIVE MATH VALIDATION */}
              <div style={{ marginBottom: '24px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '18px' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Production Quantities & Audit Validation
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#1e40af' }}>Ordered Qty</label>
                    <input
                      type="number"
                      value={orderedQty}
                      onChange={(e) => setOrderedQty(Number(e.target.value))}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #93c5fd', fontSize: '14px', fontWeight: 700, marginTop: '2px', background: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#1e40af' }}>Produced Qty</label>
                    <input
                      type="number"
                      value={producedQty}
                      onChange={(e) => setProducedQty(Number(e.target.value))}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #93c5fd', fontSize: '14px', fontWeight: 700, marginTop: '2px', background: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#1e40af' }}>Inspected Qty</label>
                    <input
                      type="number"
                      value={inspectedQty}
                      onChange={(e) => setInspectedQty(Number(e.target.value))}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #93c5fd', fontSize: '14px', fontWeight: 700, marginTop: '2px', background: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#15803d' }}>Approved Qty</label>
                    <input
                      type="number"
                      value={approvedQty}
                      onChange={(e) => setApprovedQty(Number(e.target.value))}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #86efac', fontSize: '14px', fontWeight: 700, marginTop: '2px', background: '#fff', color: '#15803d' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#dc2626' }}>Rejected Qty</label>
                    <input
                      type="number"
                      value={rejectedQty}
                      onChange={(e) => setRejectedQty(Number(e.target.value))}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #fca5a5', fontSize: '14px', fontWeight: 700, marginTop: '2px', background: '#fff', color: '#dc2626' }}
                    />
                  </div>
                </div>

                {/* Validation Formula Check */}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: isValidQuantity ? '#dcfce7' : '#fef2f2',
                  color: isValidQuantity ? '#15803d' : '#b91c1c',
                  border: `1px solid ${isValidQuantity ? '#86efac' : '#fca5a5'}`,
                }}>
                  {isValidQuantity ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>
                    <strong>Validation Formula:</strong> Approved Qty ({approvedQty}) + Rejected Qty ({rejectedQty}) = {Number(approvedQty) + Number(rejectedQty)} | Inspected Qty: {inspectedQty} {isValidQuantity ? '✓ Valid' : '⚠️ Invalid Match'}
                  </span>
                </div>
              </div>

              {/* SECTION 3: INSPECTION CHECKLIST */}
              <div style={{ marginBottom: '24px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckSquare size={16} style={{ color: '#16a34a' }} /> Technical Inspection Checklist
                  </h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => toggleAllChecklist(true)} style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#15803d', cursor: 'pointer' }}>
                      Select All OK
                    </button>
                    <button type="button" onClick={() => toggleAllChecklist(false)} style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', cursor: 'pointer' }}>
                      Unselect All
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                  {CHECKLIST_ITEMS.map((item) => (
                    <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9', background: checklist[item.id] ? '#f0fdf4' : '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: checklist[item.id] ? '#166534' : '#475569' }}>
                      <input
                        type="checkbox"
                        checked={!!checklist[item.id]}
                        onChange={() => toggleChecklistItem(item.id)}
                        style={{ width: '16px', height: '16px', accentColor: '#16a34a' }}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SECTION 4: DEFECT FLAGS */}
              <div style={{ marginBottom: '24px', background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '14px', padding: '18px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} style={{ color: '#dc2626' }} /> Defect Flags (If Any)
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {DEFECT_OPTIONS.map((defect) => {
                    const active = defectFlags.includes(defect);
                    return (
                      <button
                        key={defect}
                        type="button"
                        onClick={() => toggleDefectFlag(defect)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '999px',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: `1px solid ${active ? '#dc2626' : '#cbd5e1'}`,
                          background: active ? '#dc2626' : '#fff',
                          color: active ? '#fff' : '#475569',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {active ? '✓ ' : '+ '}{defect}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 5: INSPECTOR REMARKS */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Inspector Remarks & Audit Observations
                </label>
                <textarea
                  value={inspectorRemarks}
                  onChange={(e) => setInspectorRemarks(e.target.value)}
                  placeholder="Enter notes on structural voids, frame damage, warpage, lid fitment, or curing observations..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* SECTION 6: FINAL QC DECISION SIGN-OFF */}
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '18px', marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Final QC Decision & Sign-off
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: `2px solid ${finalDecision === 'APPROVED' ? '#16a34a' : '#cbd5e1'}`, background: finalDecision === 'APPROVED' ? '#f0fdf4' : '#fff', cursor: 'pointer', fontWeight: 700, color: finalDecision === 'APPROVED' ? '#15803d' : '#334155' }}>
                    <input
                      type="radio"
                      name="finalDecision"
                      value="APPROVED"
                      checked={finalDecision === 'APPROVED'}
                      onChange={() => setFinalDecision('APPROVED')}
                    />
                    <span>Approved (Pass)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: `2px solid ${finalDecision === 'APPROVED_WITH_REMARKS' ? '#0284c7' : '#cbd5e1'}`, background: finalDecision === 'APPROVED_WITH_REMARKS' ? '#f0f9ff' : '#fff', cursor: 'pointer', fontWeight: 700, color: finalDecision === 'APPROVED_WITH_REMARKS' ? '#0369a1' : '#334155' }}>
                    <input
                      type="radio"
                      name="finalDecision"
                      value="APPROVED_WITH_REMARKS"
                      checked={finalDecision === 'APPROVED_WITH_REMARKS'}
                      onChange={() => setFinalDecision('APPROVED_WITH_REMARKS')}
                    />
                    <span>Approved with Remarks</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: `2px solid ${finalDecision === 'HOLD_FOR_REWORK' ? '#dc2626' : '#cbd5e1'}`, background: finalDecision === 'HOLD_FOR_REWORK' ? '#fef2f2' : '#fff', cursor: 'pointer', fontWeight: 700, color: finalDecision === 'HOLD_FOR_REWORK' ? '#b91c1c' : '#334155' }}>
                    <input
                      type="radio"
                      name="finalDecision"
                      value="HOLD_FOR_REWORK"
                      checked={finalDecision === 'HOLD_FOR_REWORK'}
                      onChange={() => setFinalDecision('HOLD_FOR_REWORK')}
                    />
                    <span>Hold for Rework (QC Fail)</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setInspectModalOpen(false)}
                  style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValidQuantity}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: !isValidQuantity ? '#cbd5e1' : finalDecision === 'HOLD_FOR_REWORK' ? '#dc2626' : '#16a34a',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: !isValidQuantity ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  Submit QC Sign-off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Quick Pass QC Modal ─── */}
      {passModalOpen && selectedPassJob && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} /> Quick Approve QC Pass
              </h3>
              <button onClick={() => setPassModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePassSubmit} style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
                Confirm quality approval for Work Order <strong>#{selectedPassJob.workOrderNumber || selectedPassJob.id}</strong> (Quantity: {selectedPassJob.quantity}).
              </p>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Inspection Remarks</label>
                <textarea
                  value={passRemarks}
                  onChange={(e) => setPassRemarks(e.target.value)}
                  placeholder="Enter optional QC inspection remarks..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPassModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer' }}
                >
                  Confirm QC Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Quick Fail QC Modal ─── */}
      {failModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', background: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle size={20} /> Mark QC Failed
              </h3>
              <button onClick={() => setFailModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleFailSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Failure Reason <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  type="text"
                  required
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  placeholder="e.g., Dimensional tolerance defect, surface scratch..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>QC Remarks</label>
                <textarea
                  value={qcRemarks}
                  onChange={(e) => setQcRemarks(e.target.value)}
                  placeholder="Additional observations or rework instructions..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setFailModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer' }}
                >
                  Submit QC Fail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

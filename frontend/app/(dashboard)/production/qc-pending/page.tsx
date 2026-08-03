'use client';

import React, { useEffect, useState } from 'react';
import { Check, X, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../testing/testing.module.css';

import { backendFetch } from '@/lib/backendFetch';

export default function QCPendingPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  // Fail Modal State
  const [failModalOpen, setFailModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [qcRemarks, setQcRemarks] = useState('');

  // Pass Modal State
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [selectedPassJob, setSelectedPassJob] = useState<any>(null);
  const [passRemarks, setPassRemarks] = useState('QC passed');

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

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

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
      toast.success('QC Failed. Job sent back.');
      setFailModalOpen(false);
      fetchJobs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update job');
    }
  };

  const filteredJobs = jobs.filter((job: any) =>
    (job.workOrderNumber || job.id)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>QC Inspections</h1>
          <p className={styles.subtitle}>Review items completed by production</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} size={15} />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button onClick={fetchJobs} className={`${styles.btn} ${styles.btnPrimary}`}>
            <RefreshCw size={14} /> <span className={styles.btnLabel}>Refresh</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', padding: '0 24px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <button 
          type="button"
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '12px 4px',
            borderTopWidth: 0,
            borderLeftWidth: 0,
            borderRightWidth: 0,
            borderBottomWidth: '2px',
            borderBottomStyle: 'solid',
            borderBottomColor: activeTab === 'pending' ? '#3b82f6' : 'transparent',
            color: activeTab === 'pending' ? '#3b82f6' : '#64748b',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '14px',
            outline: 'none',
          }}
        >
          Pending QC
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('history')}
          style={{
            padding: '12px 4px',
            borderTopWidth: 0,
            borderLeftWidth: 0,
            borderRightWidth: 0,
            borderBottomWidth: '2px',
            borderBottomStyle: 'solid',
            borderBottomColor: activeTab === 'history' ? '#3b82f6' : 'transparent',
            color: activeTab === 'history' ? '#3b82f6' : '#64748b',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '14px',
            outline: 'none',
          }}
        >
          QC History
        </button>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.stateBox}>
            <div className={styles.spinner}></div>
            <p className={styles.stateTitle}>Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className={styles.stateBox}>
            <div className={styles.stateIcon}>
              <AlertCircle size={28} />
            </div>
            <h3 className={styles.stateTitle}>No Jobs Pending QC</h3>
            <p className={styles.stateHint}>Production has not sent any items for review yet.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th>WO Number</th>
                  <th>Production Plan</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  {activeTab === 'pending' ? (
                    <>
                      <th>Production Ended</th>
                      <th>Actions</th>
                    </>
                  ) : (
                    <>
                      <th>Inspected At</th>
                      <th>Notes</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {filteredJobs.map((job: any) => (
                  <tr key={job.id}>
                    <td className={styles.refNo}>{job.workOrderNumber || job.id}</td>
                    <td className={styles.refNo}>{job.productionPlan?.planNumber || 'N/A'}</td>
                    <td>{job.productionPlan?.salesOrder?.customer?.name || 'Internal'}</td>
                    <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={job.salesOrderItem?.product?.name || 'N/A'}>
                      {job.salesOrderItem?.product?.name || 'N/A'}
                    </td>
                    <td className={styles.qty}>{job.quantity}</td>
                    <td>
                      <span className={`${styles.badge} ${
                        job.qcInspectionStatus === 'PASSED' ? styles.badgeActive : 
                        job.qcInspectionStatus === 'FAILED' ? styles.badgeDraft : 
                        styles.badgePending
                      }`}>
                        {job.qcInspectionStatus || 'QC PENDING'}
                      </span>
                    </td>
                    {activeTab === 'pending' ? (
                      <>
                        <td className={styles.refDate}>{job.productionEndTime ? new Date(job.productionEndTime).toLocaleString() : 'N/A'}</td>
                        <td>
                          <div className={styles.actions}>
                            <button onClick={() => openPassModal(job)} className={`${styles.actionBtn} ${styles.edit}`} style={{ color: '#15803d' }} title="Pass QC">
                              <Check size={18} />
                            </button>
                            <button onClick={() => openFailModal(job.id)} className={`${styles.actionBtn} ${styles.del}`} style={{ color: '#dc2626' }} title="Fail QC">
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={styles.refDate}>{job.qcApprovedAt ? new Date(job.qcApprovedAt).toLocaleString() : 'N/A'}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={job.qcInspectionNotes || ''}>
                          {job.qcInspectionNotes || '-'}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {passModalOpen && selectedPassJob && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className={styles.formCard} style={{ width: '100%', maxWidth: '440px', margin: '0 16px' }}>
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle} style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={20} style={{ color: '#16a34a' }} /> Mark Job as QC Passed
              </h3>
              <button type="button" onClick={() => setPassModalOpen(false)} className={styles.formClose}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePassSubmit} className={styles.formGrid}>
              <div className={`${styles.formField} ${styles.wide}`} style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#166534', fontWeight: 600 }}>
                  Work Order: {selectedPassJob.workOrderNumber || selectedPassJob.id}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#166534' }}>
                  Product: <strong>{selectedPassJob.salesOrderItem?.product?.name || 'Precast Drain Cover'}</strong> (Qty: {selectedPassJob.quantity})
                </p>
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#15803d' }}>
                  This will mark the job as QC Passed and send it directly to dispatch.
                </p>
              </div>
              <div className={`${styles.formField} ${styles.wide}`}>
                <label className={styles.formLabel}>QC Remarks (Optional)</label>
                <input
                  type="text"
                  value={passRemarks}
                  onChange={(e) => setPassRemarks(e.target.value)}
                  className={styles.formInput}
                  placeholder="e.g. Dimensions and surface finish verified"
                />
              </div>
              <div className={`${styles.formActions} ${styles.wide}`} style={{ marginTop: '12px' }}>
                <button type="button" onClick={() => setPassModalOpen(false)} className={`${styles.btn} ${styles.btnCancel}`} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.btn}`} style={{ flex: 1, justifyContent: 'center', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: 600 }}>
                  Confirm QC Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {failModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className={styles.formCard} style={{ width: '100%', maxWidth: '420px', margin: '0 16px' }}>
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>Fail QC</h3>
              <button type="button" onClick={() => setFailModalOpen(false)} className={styles.formClose}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleFailSubmit} className={styles.formGrid}>
              <div className={`${styles.formField} ${styles.wide}`}>
                <label className={styles.formLabel}>Failure Reason *</label>
                <input
                  type="text"
                  required
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  className={styles.formInput}
                  placeholder="e.g. Scratches on surface"
                />
              </div>
              <div className={`${styles.formField} ${styles.wide}`}>
                <label className={styles.formLabel}>QC Remarks</label>
                <textarea
                  value={qcRemarks}
                  onChange={(e) => setQcRemarks(e.target.value)}
                  className={styles.formInput}
                  placeholder="Additional context for production team"
                  rows={3}
                />
              </div>
              <div className={`${styles.formActions} ${styles.wide}`} style={{ marginTop: '12px' }}>
                <button type="button" onClick={() => setFailModalOpen(false)} className={`${styles.btn} ${styles.btnCancel}`} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnRed}`} style={{ flex: 1, justifyContent: 'center' }}>
                  Confirm Failure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

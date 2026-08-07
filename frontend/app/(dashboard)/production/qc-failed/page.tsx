'use client';

import React, { useEffect, useState } from 'react';
import { Play, Search, RefreshCw, XCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import styles from './qc-failed.module.css';
import { backendFetch } from '@/lib/backendFetch';

export default function QCFailedPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res: any = await backendFetch('/api/backend/production/qc-failed');
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.items)
        ? res.items
        : [];
      setJobs(list);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load QC failed list');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchJobs();
  }, []);

  const handleStartRework = async (job: any) => {
    const jobId = job.id;
    const woNumber = job.workOrderNumber || job.id;

    const confirmation = await Swal.fire({
      title: 'Start Rework Process?',
      text: `Move work order #${woNumber} back to the Production Floor for rework?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Send to Rework',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-premium-popup',
        title: 'swal-premium-title',
        htmlContainer: 'swal-premium-text',
        confirmButton: 'swal-premium-confirm-btn',
        cancelButton: 'swal-premium-cancel-btn',
      },
      buttonsStyling: false,
    });

    if (!confirmation.isConfirmed) return;

    try {
      await backendFetch(`/api/backend/production/${jobId}/start-rework`, { method: 'POST' });

      await Swal.fire({
        icon: 'success',
        title: 'Rework Started!',
        text: `Work Order #${woNumber} is now back on the Production Floor.`,
        customClass: {
          popup: 'swal-premium-popup',
          title: 'swal-premium-title',
          htmlContainer: 'swal-premium-text',
          confirmButton: 'swal-premium-confirm-btn',
        },
        buttonsStyling: false,
      });

      fetchJobs();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Rework Action Failed',
        text: err.message || 'Failed to start rework process.',
        customClass: {
          popup: 'swal-premium-popup',
          title: 'swal-premium-title',
          htmlContainer: 'swal-premium-text',
          confirmButton: 'swal-premium-confirm-btn',
        },
        buttonsStyling: false,
      });
    }
  };

  const jobsList = Array.isArray(jobs) ? jobs : [];
  const filteredJobs = jobsList.filter((job: any) => {
    const q = searchQuery.toLowerCase();
    const soNo = (job.productionPlan?.salesOrder?.orderNumber || job.salesOrder?.orderNumber || '').toLowerCase();
    const woNo = (job.workOrderNumber || job.id || '').toLowerCase();
    const planNo = (job.productionPlan?.planNumber || '').toLowerCase();
    const reason = (job.failureReason || '').toLowerCase();
    return soNo.includes(q) || woNo.includes(q) || planNo.includes(q) || reason.includes(q);
  });

  if (!isClient) return null;

  return (
    <div className={styles.page}>
      {/* ─── Hero Banner ─── */}
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <XCircle size={24} />
        </div>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Quality Assurance</span>
          <h1>QC Failed Jobs</h1>
          <p>Manage items that failed QC inspection and require rework on the production floor</p>
        </div>
        <div className={styles.summaryBadge}>
          <span className={styles.liveDot} />
          <strong>{filteredJobs.length}</strong>
          <span>Failed<br />Jobs</span>
        </div>
      </div>

      {/* ─── Panel Card ─── */}
      <div className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <h2>Quality Inspection Rework Queue</h2>
            <p>Rework items and track failure diagnostics</p>
          </div>
          <div className={styles.toolbarRight}>
            <div className={styles.search}>
              <Search size={16} style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search sales order, WO..."
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

        {/* ─── Table Body ─── */}
        {loading ? (
          <div className={styles.emptyState}>
            <p>Loading QC failed jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle2 size={48} style={{ color: '#16a34a', margin: '0 auto 12px', display: 'block' }} />
            <h3>No Failed Jobs</h3>
            <p>All production items have passed quality control inspection.</p>
          </div>
        ) : (
          <div className={styles.tableArea}>
            <table>
              <thead>
                <tr>
                  <th style={{ minWidth: '170px' }}>Sales Order</th>
                  <th style={{ minWidth: '150px' }}>WO Number</th>
                  <th style={{ minWidth: '150px' }}>Production Plan</th>
                  <th style={{ minWidth: '170px' }}>Failure Reason</th>
                  <th style={{ minWidth: '160px' }}>QC Remarks</th>
                  <th style={{ minWidth: '90px', textAlign: 'center' }}>Reworks</th>
                  <th style={{ minWidth: '150px' }}>Failed Date</th>
                  <th style={{ minWidth: '160px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job: any) => {
                  const rawSo = job.productionPlan?.salesOrder?.orderNumber || job.salesOrder?.orderNumber;
                  const numPart = (job.workOrderNumber || job.id || '').replace(/\D/g, '').slice(-5);
                  const soNo = rawSo || `SO-2026-${(numPart || '00001').padStart(5, '0')}`;
                  return (
                    <tr key={job.id}>
                      <td style={{ fontWeight: 700, color: '#2563eb' }}>{soNo}</td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{job.workOrderNumber || job.id}</td>
                      <td>{job.productionPlan?.planNumber || 'N/A'}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}>
                          <AlertTriangle size={13} />
                          {job.failureReason || 'QC Defect'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={job.qcRemarks || '-'}>
                        {job.qcRemarks || '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '12px', color: '#334155' }}>
                          #{job.reworkCount || 0}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: '#64748b' }}>
                        {job.qcTimestamp ? new Date(job.qcTimestamp).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleStartRework(job)} className={styles.startBtn}>
                          <Play size={14} /> Start Rework
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

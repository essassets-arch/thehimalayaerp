'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, AlertCircle, Play } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../testing/testing.module.css';

import { backendFetch } from '@/lib/backendFetch';

export default function QCFailedPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res: any = await backendFetch('/api/v1/production/qc-failed');
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.items)
        ? res.items
        : [];
      setJobs(list as any);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load QC failed list');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleStartRework = async (id: string) => {
    if (!confirm('Start rework? This will move the job back to the Production Floor.')) return;
    try {
      await backendFetch(`/api/v1/production/${id}/start-rework`, { method: 'POST' });
      toast.success('Job moved to Production Floor for Rework');
      fetchJobs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update job');
    }
  };

  const jobsList = Array.isArray(jobs) ? jobs : [];
  const filteredJobs = jobsList.filter((job: any) =>
    job.workOrderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.failureReason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1 className={styles.title}>QC Failed</h1>
          <p className={styles.subtitle}>Items that failed QC and require rework</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button onClick={fetchJobs} className={styles.secondaryBtn}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className={styles.mainCard}>
        {loading ? (
          <div className={styles.emptyState}>Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertCircle size={48} className={styles.emptyIcon} style={{ color: 'var(--success-color)' }} />
            <h3>No Failed Jobs</h3>
            <p>All items have passed QC.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Job No.</th>
                  <th>Failure Reason</th>
                  <th>QC Remarks</th>
                  <th>Rework Count</th>
                  <th>Failed Date</th>
                  <th className={styles.actionsHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job: any) => (
                  <tr key={job.id}>
                    <td className={styles.refCell}>{job.workOrderNumber}</td>
                    <td style={{ color: 'var(--danger-color)', fontWeight: 500 }}>{job.failureReason}</td>
                    <td>{job.qcRemarks || '-'}</td>
                    <td>{job.reworkCount}</td>
                    <td>{job.qcTimestamp ? new Date(job.qcTimestamp).toLocaleString() : 'N/A'}</td>
                    <td className={styles.actionsCell}>
                      <button onClick={() => handleStartRework(job.id)} className={styles.primaryBtn} style={{ padding: '6px 12px', fontSize: '13px' }}>
                        <Play size={14} /> Start Work Again
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

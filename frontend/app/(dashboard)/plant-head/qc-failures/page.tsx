'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../../production/testing/testing.module.css';

import { backendFetch } from '@/lib/backendFetch';

export default function PlantHeadQCFailuresPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await backendFetch('/api/v1/plant-head/qc-failures');
      setJobs((data as any) || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load Plant Head QC failures list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const filteredJobs = jobs.filter((job: any) =>
    job.workOrderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.failureReason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1 className={styles.title}>Plant Head - QC Failures Monitor</h1>
          <p className={styles.subtitle}>Read-only view of all QC failures across production</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Search failures..."
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
          <div className={styles.emptyState}>Loading failures...</div>
        ) : filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertCircle size={48} className={styles.emptyIcon} style={{ color: 'var(--success-color)' }} />
            <h3>No Failures</h3>
            <p>No QC failures are currently recorded.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Job No.</th>
                  <th>Customer</th>
                  <th>Failure Reason</th>
                  <th>QC Remarks</th>
                  <th>Rework Count</th>
                  <th>Failed Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job: any) => (
                  <tr key={job.id}>
                    <td className={styles.refCell}>{job.workOrderNumber}</td>
                    <td>{job.productionPlan?.salesOrder?.customer?.companyName || 'N/A'}</td>
                    <td style={{ color: 'var(--danger-color)', fontWeight: 500 }}>{job.failureReason}</td>
                    <td>{job.qcRemarks || '-'}</td>
                    <td>{job.reworkCount > 0 ? <span style={{color:'red'}}>{job.reworkCount}</span> : '0'}</td>
                    <td>{job.qcTimestamp ? new Date(job.qcTimestamp).toLocaleString() : 'N/A'}</td>
                    <td>
                      <span className={styles.statusBadge} data-status="Rejected">
                        {job.productionStatus}
                      </span>
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
